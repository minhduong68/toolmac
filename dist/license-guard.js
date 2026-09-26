'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const cp = require('node:child_process');

let electron = null;
try {
  electron = require('electron');
} catch {}

function getUserDataPath() {
  if (electron && electron.app && typeof electron.app.getPath === 'function') {
    return electron.app.getPath('userData');
  }
  const appData = process.env.APPDATA || (process.platform === 'darwin' ? path.join(os.homedir(), 'Library/Application Support') : '/var/local');
  return path.join(appData, 'ALEX BRIGHT TOOL');
}

// 1. Dynamic Concealment of Cloud License Server
// URL is assembled dynamically from XOR byte chunks so it never appears in plaintext strings
function getCloudServerUrl() {
  const enc = [
    0x2b, 0x37, 0x37, 0x33, 0x30, 0x79, 0x6c, 0x6c, 0x22, 0x27, 0x2e, 0x2a, 0x2d, 0x6e, 0x34, 0x26,
    0x21, 0x6e, 0x26, 0x2a, 0x24, 0x2b, 0x37, 0x6e, 0x30, 0x37, 0x26, 0x26, 0x2f, 0x6d, 0x35, 0x26,
    0x31, 0x20, 0x26, 0x2f, 0x6d, 0x22, 0x33, 0x33
  ]; // "https://admin-web-eight-steel.vercel.app" XOR 0x43
  return Buffer.from(enc.map(b => b ^ 0x43)).toString('utf8');
}

// 2. Hardware ID Engine with Multi-Signal Fingerprinting & Drift Tolerance
function getRawMachineId() {
  try {
    const { machineIdSync } = require('node-machine-id');
    const mid = machineIdSync(false);
    if (mid && mid.length >= 16) return mid.trim();
  } catch {}

  if (process.platform === 'win32') {
    try {
      const reg = cp.execSync('reg query "HKLM\\SOFTWARE\\Microsoft\\Cryptography" /v MachineGuid', {
        windowsHide: true,
        timeout: 3000,
        encoding: 'utf8'
      });
      const m = reg.match(/MachineGuid\s+REG_SZ\s+(\S+)/i);
      if (m && m[1]) return m[1].trim();
    } catch {}
  }

  return crypto.createHash('sha256').update(
    `${os.hostname()}|${os.userInfo().username}|${os.platform()}|${os.arch()}`
  ).digest('hex');
}

function deriveHardwareId() {
  const raw = getRawMachineId();
  return crypto.createHash('sha256').update(`SD-HWID-V2|${raw.toUpperCase()}`).digest('hex').toUpperCase();
}

function getLocalMachineKey(hwid) {
  return crypto.createHash('sha256').update(`LOCAL_HMAC_SALT_2026_${hwid}_ALEX_BRIGHT`).digest();
}

function computeCacheHmac(localKey, data) {
  return crypto.createHmac('sha256', localKey)
    .update(`${data.hwid}|${data.server_token}|${data.plan}|${data.customer}|${data.remaining_time}|${data.verified_at}`)
    .digest('hex');
}

// 3. LicenseGuard Class — Server-Enforced Capability Leasing & Dual-Mode
class LicenseGuard {
  constructor(opts = {}) {
    this.opts = opts;
    this.hwid = deriveHardwareId();
    const uPath = getUserDataPath();
    this.licFile = this.opts.file || path.join(uPath, 'license_session.dat');
    this.legacyFile = path.join(uPath, 'license.json');
    
    // Core authorization states
    this.isAuthorized = false;
    this.plan = 'free';
    this.remainingTime = 'Đang kiểm tra...';
    this.customerName = '';
    this.activeKey = '';
    this.serverToken = '';
    this.reason = 'Đang kết nối máy chủ bản quyền...';
    this.checking = false;
    this._checkingPromise = null;
    
    // Lifecyle & Leases
    this.lastVerifiedAt = 0;
    this.heartbeatTimer = null;
    this.heartbeatIntervalMs = 5 * 60 * 1000; // 5 phút kiểm tra online 1 lần
    this.offlineGraceMs = 5 * 60 * 1000;      // Tối đa 5 phút ân hạn nếu rớt mạng
    this.consumedJobs = new Set();
    
    // Nạp cache có chữ ký (nếu có)
    this.loadSignedCache();
    
    // Bắt đầu chu kỳ Heartbeat
    this.startHeartbeat();
  }

  mid() {
    return this.hwid;
  }

  code() {
    return Promise.resolve(this.hwid);
  }

  ids() {
    return {
      machine_id: this.hwid,
      machine_code: this.hwid,
      checking: this.checking
    };
  }

  get isPro() {
    return this.isAuthorized;
  }

  // Chế độ 1: Kiểm tra quyền hạn khi dispatch 1 tác vụ Dola
  authorizeJob(jobId = null) {
    if (!this.isAuthorized) {
      this.reason = 'Bản quyền chưa được kích hoạt trên hệ thống máy chủ.';
      return false;
    }

    const now = Date.now();
    const elapsedSinceVerify = now - this.lastVerifiedAt;

    // Nếu thời gian từ lần verify cuối vượt quá thời gian ân hạn Offline (5 phút)
    if (elapsedSinceVerify > (this.heartbeatIntervalMs + this.offlineGraceMs)) {
      this.isAuthorized = false;
      this.reason = 'Đã hết thời gian ân hạn Offline (5 phút). Vui lòng kết nối lại Internet để tiếp tục tạo video!';
      this.wipeSignedCache();
      return false;
    }

    if (jobId) {
      if (this.consumedJobs.has(jobId)) {
        this.reason = `Tác vụ [${jobId}] đã được cấp phép trước đó. Không thể tái sử dụng.`;
        return false;
      }
      this.consumedJobs.add(jobId);
      if (this.consumedJobs.size > 500) {
        const arr = Array.from(this.consumedJobs);
        this.consumedJobs = new Set(arr.slice(250));
      }
    }

    return true;
  }

  consume(jobId = null) {
    if (jobId) {
      this.consumedJobs.add(jobId);
    }
    return true;
  }

  // Tải Signed Cache từ ổ cứng (Tuyệt đối không tin tưởng file JSON trôi nổi)
  loadSignedCache() {
    try {
      if (fs.existsSync(this.licFile)) {
        const raw = fs.readFileSync(this.licFile, 'utf8');
        const data = JSON.parse(raw);
        
        // Xác minh HMAC bảo vệ toàn vẹn file cache
        const localKey = getLocalMachineKey(this.hwid);
        const expectedSig = computeCacheHmac(localKey, data);

        if (data.sig === expectedSig && data.hwid === this.hwid) {
          const age = Date.now() - Number(data.verified_at || 0);
          if (age < (this.heartbeatIntervalMs + this.offlineGraceMs)) {
            this.isAuthorized = true;
            this.plan = data.plan || 'pro';
            this.customerName = data.customer || '';
            this.remainingTime = data.remaining_time || 'Đang kích hoạt';
            this.serverToken = data.server_token || '';
            this.lastVerifiedAt = Number(data.verified_at || 0);
            return;
          }
        }
      }
    } catch {}

    this.isAuthorized = false;
  }

  // Lưu Signed Cache kèm chữ ký HMAC máy tính
  saveSignedCache() {
    try {
      const verifiedAt = Date.now();
      const localKey = getLocalMachineKey(this.hwid);
      const dataToSign = {
        hwid: this.hwid,
        server_token: this.serverToken,
        plan: this.plan,
        customer: this.customerName,
        remaining_time: this.remainingTime,
        verified_at: verifiedAt
      };
      const sig = computeCacheHmac(localKey, dataToSign);

      const payload = {
        ...dataToSign,
        sig: sig
      };

      fs.mkdirSync(path.dirname(this.licFile), { recursive: true });
      fs.writeFileSync(this.licFile, JSON.stringify(payload), 'utf8');

      // Ghi tương thích legacy license.json cho renderer hiển thị
      fs.writeFileSync(this.legacyFile, JSON.stringify(this.status()), 'utf8');
    } catch {}
  }

  // Xóa sạch cache khi bị thu hồi hoặc hết hạn
  wipeSignedCache() {
    try {
      if (fs.existsSync(this.licFile)) fs.unlinkSync(this.licFile);
      if (fs.existsSync(this.legacyFile)) fs.unlinkSync(this.legacyFile);
    } catch {}
  }

  status() {
    return {
      ok: this.isAuthorized,
      dev: false,
      verified: this.isAuthorized,
      plan: this.plan,
      remaining_time: this.remainingTime,
      trial: false,
      key_masked: this.isAuthorized ? 'PRO-ACTIVE-****' : 'CHƯA-KÍCH-HOẠT',
      quota: null,
      remaining: null,
      machine_id: this.hwid,
      machine_code: this.hwid,
      checking: this.checking,
      customer: this.customerName || (this.isAuthorized ? 'Khách Hàng VIP' : 'Chưa kích hoạt'),
      reason: this.reason
    };
  }

  // Xác thực trực tuyến với Server (Online Verification)
  async recheck() {
    if (this._checkingPromise) return this._checkingPromise;
    this.checking = true;

    this._checkingPromise = (async () => {
      try {
        const serverUrl = getCloudServerUrl() + '/api/license';
        const clientNonce = crypto.randomBytes(16).toString('hex');

        const res = await fetch(serverUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'verify',
            hwid: this.hwid,
            tool: 'seedance',
            nonce: clientNonce,
            timestamp: Date.now()
          }),
          signal: AbortSignal.timeout(10000)
        });

        const data = await res.json();

        if (data.ok && data.status === 'active') {
          this.isAuthorized = true;
          this.plan = data.plan || 'vip';
          this.customerName = data.customer_name || 'Khách Hàng VIP';
          this.remainingTime = data.remaining_days ? `${data.remaining_days} Ngày` : 'Vĩnh Viễn';
          this.serverToken = data.token || '';
          this.lastVerifiedAt = Date.now();
          this.reason = '';
          this.saveSignedCache();
        } else {
          // Bị Admin Revoke hoặc chưa kích hoạt -> Lập tức khóa cứng
          this.isAuthorized = false;
          this.plan = 'free';
          this.reason = data.message || 'Thiết bị này chưa được kích hoạt bản quyền trên máy chủ.';
          this.remainingTime = data.code === 'EXPIRED' ? 'ĐÃ HẾT HẠN' : 'Chưa kích hoạt';
          this.wipeSignedCache();
        }

        return this.status();
      } catch (err) {
        // Xử lý mất kết nối (Offline Grace Mode)
        const now = Date.now();
        const age = now - this.lastVerifiedAt;

        if (this.isAuthorized && (age < (this.heartbeatIntervalMs + this.offlineGraceMs))) {
          const remainingSec = Math.max(0, Math.round(((this.heartbeatIntervalMs + this.offlineGraceMs) - age) / 1000));
          this.reason = `Đang trong thời gian ân hạn mất mạng (Còn ${remainingSec}s)`;
        } else {
          this.isAuthorized = false;
          this.reason = 'Không thể kết nối máy chủ bản quyền. Vui lòng kiểm tra lại mạng Internet!';
          this.wipeSignedCache();
        }

        return this.status();
      } finally {
        this.checking = false;
        this._checkingPromise = null;
      }
    })();

    return this._checkingPromise;
  }

  // Kích hoạt bằng mã Key trực tiếp
  async activate(key) {
    this.checking = true;
    try {
      const serverUrl = getCloudServerUrl() + '/api/license';
      const res = await fetch(serverUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'activate', hwid: this.hwid, key: String(key || '').trim() }),
        signal: AbortSignal.timeout(12000)
      });
      const data = await res.json();
      if (data.ok) {
        return await this.recheck();
      } else {
        return { ok: false, verified: false, reason: data.message || 'Mã Key không hợp lệ.' };
      }
    } catch (err) {
      return { ok: false, verified: false, reason: 'Lỗi kết nối máy chủ bản quyền: ' + err.message };
    } finally {
      this.checking = false;
    }
  }

  startHeartbeat() {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = setInterval(() => {
      this.recheck().catch(() => {});
    }, this.heartbeatIntervalMs);
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}

module.exports = {
  LicenseGuard,
  deriveHardwareId,
  getCloudServerUrl
};
