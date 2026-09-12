'use strict';
const cp = require('node:child_process');
const path = require('node:path');
const fs = require('node:fs');
const net = require('node:net');

class TorManager {
  constructor(opts = {}) {
    this.baseDir = opts.baseDir || path.join(require('node:os').homedir(), '.dola-video');
    this.torBinDir = opts.torBinDir || this.findTorBin();
    this.baseSocksPort = opts.baseSocksPort || 19050;
    this.portCount = opts.portCount || 20; // 19050 to 19069
    this.controlPort = opts.controlPort || 19075;
    this.region = opts.region || "no_us";
    this.excludeExitNodes = opts.excludeExitNodes || "{us}";
    this.dataDir = path.join(this.baseDir, 'tor-data');
    this.process = null;
    this.state = 'off'; // 'off' | 'starting' | 'ready' | 'stopping' | 'error'
    this.lastError = null;
    this.log = opts.log || console.log;
    this.readyCallbacks = [];
    this.startPromise = null;
  }

  findTorBin() {
    const candidates = [
      path.join(__dirname, '..', '..', 'bin', 'tor'),
      path.join(process.resourcesPath || '', 'bin', 'tor'),
      path.join(__dirname, '..', 'bin', 'tor'),
      path.join(process.cwd(), 'release', 'Seedance-Video-Trial-Cloud-v1.1-Portable', 'resources', 'bin', 'tor'),
      path.join(process.cwd(), 'resources', 'bin', 'tor')
    ];
    for (const c of candidates) {
      if (fs.existsSync(path.join(c, 'tor.exe')) || fs.existsSync(path.join(c, 'tor'))) return c;
    }
    if (process.platform === 'darwin') {
      if (fs.existsSync('/opt/homebrew/bin/tor')) return '/opt/homebrew/bin';
      if (fs.existsSync('/usr/local/bin/tor')) return '/usr/local/bin';
    }
    return candidates[0];
  }

  get isRunning() {
    return this.process !== null && !this.process.killed;
  }

  isReady() {
    return this.state === 'ready' && this.isRunning;
  }

  onReady(cb) {
    if (typeof cb === 'function') {
      if (this.isReady()) {
        try { cb(); } catch {}
      } else {
        this.readyCallbacks.push(cb);
      }
    }
  }

  _notifyReady() {
    this.state = 'ready';
    this.lastError = null;
    const cbs = [...this.readyCallbacks];
    this.readyCallbacks = [];
    for (const cb of cbs) {
      try { cb(); } catch {}
    }
  }

  /**
   * Seed cached consensus and descriptors into dataDir for near-instant startup
   */
  seedCacheIfNeeded() {
    try {
      fs.mkdirSync(this.dataDir, { recursive: true });
      const targetConsensus = path.join(this.dataDir, 'cached-microdesc-consensus');
      if (fs.existsSync(targetConsensus)) return;

      const cacheSourceDir = path.join(this.torBinDir, 'data', 'cache');
      if (!fs.existsSync(cacheSourceDir)) return;

      const files = ['cached-certs', 'cached-microdesc-consensus', 'cached-microdescs'];
      for (const f of files) {
        const src = path.join(cacheSourceDir, f);
        const dest = path.join(this.dataDir, f);
        if (fs.existsSync(src) && !fs.existsSync(dest)) {
          fs.copyFileSync(src, dest);
        }
      }
      this.log('[Tor] Đã nạp dữ liệu đệm relay (cache) để tăng tốc khởi động.');
    } catch (e) {
      this.log(`[Tor Warn] Không thể nạp seed cache: ${e.message}`);
    }
  }

  getPortForProfile(proxyVal, profileIndex = 0) {
    const raw = String(proxyVal ?? '').trim();
    const m = raw.match(/^tor(?::(\d+))?$/i);
    if (m && m[1]) {
      const n = Number(m[1]);
      if (n >= 1000) return n;
      if (n >= 1 && n <= this.portCount) return this.baseSocksPort + (n - 1);
    }
    const idx = Math.max(0, Number(profileIndex) || 0);
    return this.baseSocksPort + (idx % this.portCount);
  }

  async start() {
    if (this.isReady()) return true;
    if (this.state === 'starting' && this.startPromise) {
      return this.startPromise;
    }

    const exeName = process.platform === 'win32' ? 'tor.exe' : 'tor';
    let exe = path.join(this.torBinDir, exeName);
    if (!fs.existsSync(exe)) {
      if (fs.existsSync('/opt/homebrew/bin/tor')) exe = '/opt/homebrew/bin/tor';
      else if (fs.existsSync('/usr/local/bin/tor')) exe = '/usr/local/bin/tor';
      else if (fs.existsSync('/usr/bin/tor')) exe = '/usr/bin/tor';
    }
    if (!fs.existsSync(exe)) {
      this.lastError = `Không tìm thấy tor.exe tại: ${exe}`;
      this.state = 'error';
      this.log(`[Tor] ${this.lastError}`);
      return false;
    }

    this.seedCacheIfNeeded();

    const geoip = path.join(this.torBinDir, 'data', 'geoip');
    const geoip6 = path.join(this.torBinDir, 'data', 'geoip6');

    this.state = 'starting';
    this.log(`[Tor] Đang khởi động mạng Tor đa cổng (${this.baseSocksPort} - ${this.baseSocksPort + this.portCount - 1})...`);

    const args = [
      '--DataDirectory', this.dataDir,
      '--ControlPort', String(this.controlPort),
      '--CookieAuthentication', '0',
      '--HashedControlPassword', '',
      '--ClientUseIPv6', '0',
      '--ClientPreferIPv6ORPort', '0',
      '--ClientOnly', '1',
      '--NumEntryGuards', '3',
      '--LearnCircuitBuildTimeout', '0',
      '--CircuitBuildTimeout', '10',
      '--Log', 'notice stdout'
    ];

    for (let i = 0; i < this.portCount; i++) {
      args.push('--SocksPort', `${this.baseSocksPort + i} IsolateDestAddr IsolateDestPort`);
    }

    if (fs.existsSync(geoip)) args.push('--GeoIPFile', geoip);
    if (fs.existsSync(geoip6)) args.push('--GeoIPv6File', geoip6);

    // Luôn loại trừ triệt để IP thuộc Hoa Kỳ (USA)
    args.push('--ExcludeExitNodes', this.excludeExitNodes || '{us}');
    args.push('--StrictNodes', '1');

    if (this.region === 'eu') {
      args.push('--ExitNodes', '{de},{fr},{nl},{gb},{ch},{se},{at},{es},{it}');
    } else if (this.region === 'asia') {
      args.push('--ExitNodes', '{sg},{jp},{kr},{hk}');
    }
    

    try {
      this.process = cp.spawn(exe, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true
      });
    } catch (e) {
      this.state = 'error';
      this.lastError = e.message;
      this.log(`[Tor] Lỗi khởi động tiến trình Tor: ${e.message}`);
      return false;
    }

    this.process.stdout.on('data', d => {
      const line = d.toString();
      if (line.includes('Bootstrapped 100%')) {
        this.log('[Tor] Mạng Tor đã kết nối 100% sẵn sàng!');
        this._notifyReady();
      } else if (line.includes('Bootstrapped')) {
        const m = line.match(/Bootstrapped\s+(\d+%)/);
        if (m) this.log(`[Tor] Tiến trình kết nối mạng Tor: ${m[1]}`);
      }
    });

    this.process.stderr.on('data', d => {
      const errLine = d.toString().trim();
      if (errLine && !errLine.includes('Linelist option')) {
        this.log(`[Tor Warn] ${errLine}`);
      }
    });

    this.process.on('close', code => {
      this.process = null;
      if (this.state !== 'stopping') this.state = 'off';
    });

    this.startPromise = this.waitForReady(45000).finally(() => {
      this.startPromise = null;
    });

    return this.startPromise;
  }

  async waitForReady(timeoutMs = 45000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      if (this.state === 'ready') return true;
      if (await this.isPortOpen(this.baseSocksPort)) {
        this._notifyReady();
        return true;
      }
      await new Promise(r => setTimeout(r, 400));
    }
    return this.isReady();
  }

  isPortOpen(port) {
    return new Promise(resolve => {
      const socket = new net.Socket();
      socket.setTimeout(800);
      socket.once('connect', () => {
        socket.destroy();
        resolve(true);
      });
      socket.once('timeout', () => {
        socket.destroy();
        resolve(false);
      });
      socket.once('error', () => {
        socket.destroy();
        resolve(false);
      });
      socket.connect(port, '127.0.0.1');
    });
  }

  async rotateIp() {
    return new Promise(resolve => {
      const socket = new net.Socket();
      socket.setTimeout(3000);
      let step = 0;

      socket.on('connect', () => {
        socket.write('AUTHENTICATE ""\r\n');
      });

      socket.on('data', data => {
        const res = data.toString();
        if (step === 0 && res.startsWith('250')) {
          step = 1;
          socket.write('SIGNAL NEWNYM\r\n');
        } else if (step === 1 && res.startsWith('250')) {
          this.log('[Tor] Đã gửi tín hiệu SIGNAL NEWNYM đổi mạch IP mới');
          socket.destroy();
          resolve(true);
        }
      });

      socket.on('error', () => {
        socket.destroy();
        resolve(false);
      });
      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });

      socket.connect(this.controlPort, '127.0.0.1');
    });
  }

  stop() {
    this.state = 'stopping';
    if (this.process) {
      try {
        this.process.kill('SIGTERM');
      } catch {}
      this.process = null;
    }
    this.state = 'off';
    this.log('[Tor] Đã dừng tiến trình Tor.');
  }

  setRegion(region) {
    const valid = ['no_us', 'eu', 'asia'];
    const next = valid.includes(region) ? region : 'no_us';
    if (this.region !== next) {
      this.region = next;
      this.log('[Tor] Cấu hình vùng Exit Node đổi thành: ' + this.region + ' (đã loại trừ {us})');
      if (this.isRunning) {
        this.stop();
        this.start().catch(() => {});
      }
    }
  }

  status() {
    return {
      enabled: true,
      state: this.state,
      ready: this.isReady(),
      running: this.isRunning,
      baseSocksPort: this.baseSocksPort,
      portCount: this.portCount,
      ports: Array.from({ length: this.portCount }, (_, i) => this.baseSocksPort + i),
      error: this.lastError
    };
  }
}

module.exports = { TorManager };
