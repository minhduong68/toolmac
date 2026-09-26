'use strict';
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), os = require('node:os'), cp = require('node:child_process');
const FAIL = new Set(['error', 'interrupted', 'cancelled', 'canceled', 'failed']);
const usable = j => j && j.status === 'done' && !FAIL.has(String(j.status || '').toLowerCase()) && !!String(j.result?.path || j.result?.video_url || '').trim();
const sha = x => crypto.createHash('sha256').update(String(x)).digest('hex'), b64 = x => Buffer.from(x).toString('base64url');

const _k = [0x3,0x52,0x5c,0x11,0x3,0x1a,0x31,0x20,0x37,0x36,0x20,0x5d,0x3b,0x2,0x21,0x3d,0x22,0x51,0x22,0x11,0x11,0x1b,0x4,0x8,0x27,0x28,0x4,0x2b,0x2,0x3d,0xc,0x1c,0x3d,0x30,0x24,0x2d,0x12,0x1e,0x36,0x7,0x7e,0x55,0x1c,0x0,0x10,0x16,0x3b,0x13,0x36,0x2,0x12,0x17,0x36,0xb,0x39,0x3d,0x60,0x36,0x2e,0x32,0x3e,0x16,0x54,0x1d];
const _m = [0x53,0x65,0x65,0x64,0x61,0x6e,0x63,0x65];
function getEmbeddedSecret() {
  return Buffer.from(_k.map((b, i) => b ^ _m[i % _m.length])).toString('utf8');
}

let _cachedMachineHash = null;
function defaultMachineHash() {
  if (_cachedMachineHash) return _cachedMachineHash;
  let id = '';
  try {
    id = require('node-machine-id').machineIdSync(false);
  } catch {}
  if (!id && process.platform === 'win32') {
    try {
      const reg = cp.execSync('reg query "HKLM\\SOFTWARE\\Microsoft\\Cryptography" /v MachineGuid', { windowsHide: true, timeout: 3000, encoding: 'utf8' });
      id = reg.match(/MachineGuid\s+REG_SZ\s+(\S+)/i)?.[1] || '';
    } catch {}
  }
  if (!id) {
    id = os.hostname() + '|' + os.platform() + '|' + os.arch();
  }
  _cachedMachineHash = sha(id.trim().toLowerCase());
  return _cachedMachineHash;
}

function redact(v, secrets = []) {
  let s = String(v ?? '');
  for (const x of secrets) if (x) s = s.split(String(x)).join('[REDACTED]');
  return s.replace(/(x-(?:client-key|signature)|authorization)\s*[:=]\s*[^\s,;]+/ig, '$1=[REDACTED]').replace(/[A-Za-z0-9_-]{48,}/g, '[REDACTED]');
}

class RemoteQuotaError extends Error {
  constructor(code, message, status = 503, cause) {
    super(message);
    this.name = 'RemoteQuotaError';
    this.code = code;
    this.status = status;
    this.cause = cause;
  }
}

class CloudflareQuotaClient {
  constructor(o = {}) {
    this.url = new URL(o.workerUrl || 'https://seedance-video-trial-api.kemhi88.workers.dev');
    if (this.url.protocol !== 'https:' || this.url.username || this.url.password || this.url.search || this.url.hash) {
      throw new RemoteQuotaError('CONFIG_INVALID', 'Cấu hình máy chủ dùng thử không an toàn.', 500);
    }
    this.url.pathname = this.url.pathname.replace(/\/+$/, '');
    this.secret = String(o.sharedClientSecret || getEmbeddedSecret());
    this.protocolVersion = String(o.protocolVersion || '1');
    this.responseSecret = String(o.responseSigningSecret || '');
    if (this.secret.length < 32) {
      throw new RemoteQuotaError('CONFIG_INVALID', 'Thiếu cấu hình xác thực dùng thử.', 500);
    }
    this.fetch = o.fetchImpl || globalThis.fetch;
    this.timeoutMs = o.timeoutMs || 8000;
    this.now = o.now || (() => Date.now());
    this.nonce = o.nonce || (() => b64(crypto.randomBytes(24)));
  }

  sign(m, p, b, t, n) {
    return b64(crypto.createHmac('sha256', this.secret).update(t + '\n' + n + '\n' + m + '\n' + p + '\n' + sha(b)).digest());
  }

  async request(m, p, payload = {}) {
    let body = m === 'GET' ? '' : JSON.stringify({ ...payload, protocolVersion: this.protocolVersion });
    let u = new URL(p.replace(/\/+/, ''), this.url);
    if (m === 'GET') {
      for (const [k, v] of Object.entries({ ...payload, protocolVersion: this.protocolVersion })) {
        u.searchParams.set(k, String(v));
      }
    }
    const t = String(Math.floor(this.now() / 1000)), n = this.nonce(), c = new AbortController(), timer = setTimeout(() => c.abort(), this.timeoutMs);
    let r, text;
    try {
      r = await this.fetch(u, {
        method: m,
        headers: {
          'content-type': 'application/json',
          'x-client-key': this.secret,
          'x-timestamp': t,
          'x-nonce': n,
          'x-signature': this.sign(m, p, body, t, n)
        },
        body: body || undefined,
        signal: c.signal
      });
      text = await r.text();
    } catch (e) {
      throw new RemoteQuotaError('OFFLINE', 'Không thể kết nối máy chủ lượt dùng thử. Vui lòng kiểm tra mạng.', 503, e);
    } finally {
      clearTimeout(timer);
    }
    const rt = r.headers?.get?.('x-response-timestamp'), sig = r.headers?.get?.('x-response-signature');
    if (sig && this.responseSecret) {
      const expected = rt && b64(crypto.createHmac('sha256', this.responseSecret).update(rt + '\n' + text).digest());
      const a = Buffer.from(sig), b = Buffer.from(expected || '');
      if (!expected || a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        throw new RemoteQuotaError('RESPONSE_SIGNATURE_INVALID', 'Chữ ký phản hồi máy chủ không hợp lệ.', 502);
      }
    }
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new RemoteQuotaError('INVALID_RESPONSE', 'Máy chủ lượt dùng thử trả dữ liệu không hợp lệ.', 502);
    }
    if (!r.ok || data.ok === false) {
      const code = String(data?.error?.code || 'REMOTE_ERROR');
      const msg = code === 'QUOTA_EXCEEDED' ? 'Không đủ lượt dùng thử để tạo số video đã chọn.' : code.startsWith('AUTH_') ? 'Xác thực máy chủ dùng thử không hợp lệ. Vui lòng cập nhật ứng dụng.' : data?.error?.message || 'Máy chủ lượt dùng thử từ chối yêu cầu.';
      throw new RemoteQuotaError(code, msg, r.status);
    }
    return data;
  }

  register(h) { return this.request('POST', '/v1/device/register', { machineHash: h }); }
  status(h) { return this.request('GET', '/v1/status', { machineHash: h }); }
  reserve(h, c, k) { return this.request('POST', '/v1/quota/reserve', { machineHash: h, count: c, idempotencyKey: k }); }
  commit(h, t) { return this.request('POST', '/v1/quota/commit', { machineHash: h, reservationToken: t }); }
  refund(h, t) { return this.request('POST', '/v1/quota/refund', { machineHash: h, reservationToken: t }); }
  renew(h, t) { return this.request('POST', '/v1/quota/renew', { machineHash: h, reservationToken: t }); }
}

class RemoteQuotaAuthority {
  constructor(o = {}) {
    this.file = o.file;
    this.machineHash = o.machineHash || defaultMachineHash();
    this.client = o.client;
    this.localKey = crypto.createHash('sha256').update('seedance-cloud-cache-v2|' + this.machineHash).digest();
    this.data = this.load();
    this.flushing = null;
  }

  mac(x) {
    return crypto.createHmac('sha256', this.localKey).update(JSON.stringify(x)).digest('hex');
  }

  blank(lock = false) {
    return { version: 1, machineHash: this.machineHash, lock: false, remote: null, online: false, lastError: null, reservations: [], pending: [] };
  }

  load() {
    try {
      const x = JSON.parse(fs.readFileSync(this.file, 'utf8')), m = x.mac;
      delete x.mac;
      if (x.version !== 1 || x.machineHash !== this.machineHash || m !== this.mac(x) || x.lock) {
        return this.persist(this.blank(false));
      }
      return x;
    } catch (e) {
      return this.persist(this.blank(false));
    }
  }

  persist(x = this.data) {
    try {
      fs.mkdirSync(path.dirname(this.file), { recursive: true });
      const tmp = this.file + '.tmp-' + process.pid;
      fs.writeFileSync(tmp, JSON.stringify({ ...x, lock: false, mac: this.mac(x) }, null, 2));
      fs.renameSync(tmp, this.file);
      this.data = x;
      return x;
    } catch {
      return x;
    }
  }

  setRemote(q) {
    if (q) this.data.remote = q;
    this.data.online = true;
    this.data.lastError = null;
    this.persist();
  }

  setError(e) {
    this.data.online = false;
    this.data.lastError = { code: e.code || 'REMOTE_ERROR', message: redact(e.message, [this.client?.secret]) };
    this.persist();
  }

  view() {
    const q = this.data.remote || { limit: 2, committed: 0, pending: 2, remaining: 0 };
    return {
      ...q,
      used: q.committed || 0,
      reserved: q.pending || 0,
      exhausted: q.remaining === 0,
      online: this.data.online,
      authoritative: true,
      error: this.data.lastError,
      pendingOperations: this.data.pending.length
    };
  }

  async initialize() {
    try {
      const r = await this.client.register(this.machineHash);
      this.setRemote(r.quota);
      await this.flush();
      await this.refresh();
    } catch (e) {
      this.setError(e);
    }
    return this.view();
  }

  async refresh() {
    try {
      const r = await this.client.status(this.machineHash);
      this.setRemote(r.quota);
      return this.view();
    } catch (e) {
      if (e.code === 'DEVICE_NOT_REGISTERED') {
        const r = await this.client.register(this.machineHash);
        this.setRemote(r.quota);
        return this.view();
      }
      this.setError(e);
      throw e;
    }
  }

  async reserve(count, key) {
    try { await this.flush(); } catch (e) {}
    let x;
    try {
      x = await this.client.reserve(this.machineHash, count, key);
    } catch (e) {
      this.setError(e);
      throw e;
    }
    let r = this.data.reservations.find(v => v.key === key);
    if (!r) {
      r = { key, token: x.reservation.token, count, state: x.reservation.status, expiresAt: x.reservation.expiresAt || 0, jobs: [] };
      this.data.reservations.push(r);
    }
    r.expiresAt = x.reservation.expiresAt || r.expiresAt || 0;
    this.setRemote(x.quota);
    return r;
  }

  async reserveMany(count, submissionId) {
    const got = [];
    try {
      for (let i = 0; i < count; i++) {
        got.push(await this.reserve(1, submissionId + ':' + i));
      }
      return got;
    } catch (e) {
      for (const r of got) this.queue('refund', r);
      try { await this.flush(); } catch {}
      throw e;
    }
  }

  bind(key, jobs) {
    let r = this.data.reservations.find(x => x.key === key || x.token === key);
    if (!r && typeof key === 'object' && key !== null) {
      r = this.data.reservations.find(x => x.key === key.key || x.token === key.token);
      if (!r) {
        r = key;
        this.data.reservations.push(r);
      }
    }
    if (!r) throw new RemoteQuotaError('RESERVATION_MISSING', 'Không tìm thấy lượt đã giữ.', 500);
    r.jobs = [...new Set([...(r.jobs || []), ...jobs.map(String)])];
    this.persist();
    return r;
  }

  find(job) {
    return this.data.reservations.find(r => (r.jobs || []).includes(String(job)));
  }

  bindRetry(oldId, newId) {
    const r = this.find(oldId);
    if (r && ['pending', 'reserved'].includes(r.state)) {
      r.jobs = [String(newId)];
      this.persist();
      return r;
    }
    return null;
  }

  async renewPending() {
    for (const r of this.data.reservations) {
      if (!['pending', 'reserved'].includes(r.state) || !(r.jobs || []).length) continue;
      try {
        const x = await this.client.renew(this.machineHash, r.token);
        r.expiresAt = x.reservation?.expiresAt || r.expiresAt;
        this.setRemote(x.quota);
      } catch (e) {
        this.setError(e);
      }
    }
    return this.view();
  }

  queue(type, r) {
    if (!r || !['pending', 'reserved', type + '-pending'].includes(r.state)) return;
    if (!this.data.pending.some(x => x.key === r.key && x.type === type)) {
      this.data.pending.push({ id: type + ':' + r.key, type, key: r.key, token: r.token });
    }
    r.state = type === 'commit' ? 'commit-pending' : 'refund-pending';
    this.persist();
  }

  async flush() {
    if (this.flushing) return this.flushing;
    this.flushing = (async () => {
      for (const op of [...this.data.pending]) {
        try {
          const x = await this.client[op.type](this.machineHash, op.token);
          const r = this.data.reservations.find(v => v.key === op.key);
          if (r) r.state = op.type === 'commit' ? 'committed' : 'refunded';
          this.data.pending = this.data.pending.filter(v => v.id !== op.id);
          this.setRemote(x.quota);
        } catch (e) {
          const terminalCodes = ['RESERVATION_NOT_FOUND', 'RESERVATION_EXPIRED', 'RESERVATION_COMMITTED', 'INVALID_RESERVATION_TOKEN'];
          if (terminalCodes.includes(e.code) || e.status === 404 || e.status === 409) {
            const r = this.data.reservations.find(v => v.key === op.key);
            if (r) r.state = op.type === 'commit' ? 'committed' : 'refunded';
            this.data.pending = this.data.pending.filter(v => v.id !== op.id);
            this.persist();
          } else {
            this.setError(e);
            throw e;
          }
        }
      }
    })().finally(() => { this.flushing = null; });
    return this.flushing;
  }

  async reconcile(jobs = []) {
    const map = new Map(jobs.map(j => [String(j.id), j]));
    for (const r of this.data.reservations) {
      if (!['pending', 'reserved'].includes(r.state) || !(r.jobs || []).length) continue;
      const j = map.get(String(r.jobs[r.jobs.length - 1]));
      if (!j) continue;
      if (usable(j)) this.queue('commit', r);
      else if (FAIL.has(String(j.status || '').toLowerCase()) || (j.status === 'done' && !usable(j))) {
        this.queue('refund', r);
      }
    }
    if (this.data.pending.length) {
      try { await this.flush(); } catch {}
    }
    return this.view();
  }
}

function loadClientConfig(c, s) {
  let base = {
    workerUrl: 'https://seedance-video-trial-api.kemhi88.workers.dev',
    keyId: 'seedance-desktop-v1',
    protocolVersion: '1',
    auth: 'HMAC-SHA256/base64url',
    trialLimit: 2,
    reservationTtlSeconds: 10800
  };
  if (c && fs.existsSync(c)) {
    try { base = { ...base, ...JSON.parse(fs.readFileSync(c, 'utf8')) }; } catch {}
  }
  if (s && fs.existsSync(s)) {
    try { base = { ...base, ...JSON.parse(fs.readFileSync(s, 'utf8')) }; } catch {}
  }
  return { ...base, sharedClientSecret: base.sharedClientSecret || getEmbeddedSecret() };
}

module.exports = { CloudflareQuotaClient, RemoteQuotaAuthority, RemoteQuotaError, defaultMachineHash, redact, loadClientConfig };