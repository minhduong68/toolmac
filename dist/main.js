/* ANTI_DEBUG_GUARD */
process.on('uncaughtException', (err) => {
  try {
    const fs = require('node:fs');
    const path = require('node:path');
    const u = require('electron').app.getPath('userData');
    fs.appendFileSync(path.join(u, 'crash_error.log'), new Date().toISOString() + ' UNCAUGHT: ' + (err?.stack || err) + '\n');
  } catch {}
});
process.on('unhandledRejection', (err) => {
  try {
    const fs = require('node:fs');
    const path = require('node:path');
    const u = require('electron').app.getPath('userData');
    fs.appendFileSync(path.join(u, 'crash_error.log'), new Date().toISOString() + ' REJECTION: ' + (err?.stack || err) + '\n');
  } catch {}
});
for(let a of process.argv){let la=String(a).toLowerCase();if(la.startsWith("--inspect")||la.startsWith("--remote-debugging-port")||la.startsWith("--remote-allow-origins")){try{require("electron").app.quit()}catch{}process.exit(0);}}
"use strict";var ki=Object.create;var he=Object.defineProperty;var bi=Object.getOwnPropertyDescriptor;var Si=Object.getOwnPropertyNames;var _i=Object.getPrototypeOf,xi=Object.prototype.hasOwnProperty;var Pi=(s,t,e,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let n of Si(t))!xi.call(s,n)&&n!==e&&he(s,n,{get:()=>t[n],enumerable:!(i=bi(t,n))||i.enumerable});return s};var k=(s,t,e)=>(e=s!=null?ki(_i(s)):{},Pi(t||!s||!s.__esModule?he(e,"default",{value:s,enumerable:!0}):e,s));var yi=k(require("node:crypto")),ae=k(require("node:fs")),Ut=k(require("node:path")),v=require("electron");var de=require("node:child_process"),V=k(require("node:crypto")),it=k(require("node:fs")),J=k(require("node:os")),ge=k(require("node:path")),Di="MCowBQYDK2VwAyEAVVCFEOavTuZpkEcFR01Fin1DSMcbzHbGXWA5LvtO0fI=";function Ci(s){return V.default.createPublicKey({key:Buffer.from(s,"base64"),format:"der",type:"spki"})}function $i(s){return["SDV2",s.nonce,s.key,s.machine_id,s.plan??"",s.expires_at??"",String(s.seats),s.quota==null?"":String(s.quota),String(s.used),s.issued_at].join("|")}var pe=s=>V.default.createHash("sha256").update(s,"utf-8").digest("hex");function Ei(){try{let{machineIdSync:s}=require("node-machine-id");return s(!1)}catch{return pe(`${J.default.hostname()}|${J.default.userInfo().username}|${J.default.platform()}`)}}function ue(s,t,e){return new Promise((i,n)=>{(0,de.execFile)(s,t,{timeout:e,windowsHide:!0,encoding:"utf-8"},(r,o)=>{r?n(r):i(String(o))})})}async function Ii(){let s="";try{process.platform==="win32"?s=(await ue("powershell.exe",["-NoProfile","-NonInteractive","-Command","$p=Get-CimInstance Win32_ComputerSystemProduct; $b=Get-CimInstance Win32_BIOS; $c=Get-CimInstance Win32_Processor | Select-Object -First 1; Write-Output ([string]$p.UUID + '|' + [string]$b.SerialNumber + '|' + [string]$c.ProcessorId)"],2e4)).trim():process.platform==="linux"?s=it.default.readFileSync("/etc/machine-id","utf-8").trim():s=(await ue("ioreg",["-rd1","-c","IOPlatformExpertDevice"],1e4)).match(/IOPlatformUUID" = "([^"]+)/)?.[1]??""}catch{s=""}if(s.replace(/\|/g,"").trim().length<8){let t=J.default.cpus()[0]?.model??"";s=`fallback|${J.default.hostname()}|${t}|${J.default.cpus().length}|${Math.round(J.default.totalmem()/2**30)}|${J.default.arch()}`}return pe("SDV-MC|"+s)}function Oi(s){return s.length>8?`${s.slice(0,4)}\u2026${s.slice(-4)}`:"****"}const CLOUD_LICENSE_SERVER = (() => {
  const b = Buffer.from("CxAZBgx6Zn0rMERHWRVyb3I5foXWw9evoqK9utLH392zsr2urVBZSlULKjw8PVNZHVBYcA==", "base64");
  let r = "";
  for (let i = 0; i < b.length; i++) {
    r += String.fromCharCode(b[i] ^ 0x5C ^ ((i * 7) & 0xFF) ^ 0x3F);
  }
  return r;
})();

var bt = class {
  constructor(t) {
    this.opts = t || {};
    this.licFile = this.opts.file || Ut.default.join(v.app.getPath('userData'), 'license.json');
    this.midValue = Ei().toUpperCase();
    this.codeValue = this.midValue;
    this.isPro = false;
    this.plan = 'pro';
    this.remainingTime = '';
    this.activeKey = '';
    this.customerName = '';
    this.expiresAt = '';
    this.checking = true;
    this.reason = 'Đang kiểm tra bản quyền với máy chủ...';
    this._checkingPromise = null;

    // Check immediately on startup
    this.checkCloudLicense().catch(() => {});

    // Heartbeat check every 60 seconds (1 minute) for real-time revoke / kill
    setInterval(() => {
      this.checkCloudLicense().catch(() => {});
    }, 60000);
  }

  async checkCloudLicense() {
    if (this._checkingPromise) return this._checkingPromise;

    this._checkingPromise = (async () => {
      const id = String(this.midValue || '').trim().toUpperCase();
      if (!id) return false;

      try {
        if (!this._sessionId) {
          this._sessionId = Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
        }
        const fetchFn = typeof fetch !== 'undefined' ? fetch : (this.opts.fetchImpl || v.net.fetch);
        const res = await fetchFn(CLOUD_LICENSE_SERVER + '/api/check?hwid=' + encodeURIComponent(id) + '&sess=' + encodeURIComponent(this._sessionId), {
          method: 'GET',
          cache: 'no-store'
        });
        const data = await res.json();

        // 1. TỰ HỦY NẾU BỊ BANNED / KHÓA CRACK
        if (data && data.status === 'kill') {
          this.triggerSelfDestruct('Mày dám crack hả mày!');
          return false;
        }

        // 2. KÍCH HOẠT HỢP LỆ (PRO HOẶC TRIAL)
        if (data && data.status === 'active' && data.valid === true) {
          this.isPro = true;
          this.plan = data.plan || 'pro';
          this.remainingTime = data.remaining_time || '';
          this.customerName = data.customer || (this.plan === 'trial' ? 'Dùng thử' : 'Khách hàng');
          this.expiresAt = data.expires_at;
          this.activeKey = (this.plan === 'trial' ? 'TRIAL-' : 'PRO-') + id.slice(0, 4) + '-' + id.slice(-4);
          this.checking = false;
          this.reason = '';
          return true;
        }

        // BẤT KỲ TRƯỜNG HỢP NÀO KHÁC (HẾT HẠN, BỊ XÓA, NOT_FOUND) ĐỀU TẮT BẢN QUYỀN VÀ KHÓA TOOL
        this.isPro = false;
        this.activeKey = '';

        // 3. HẾT HẠN
        if (data && data.status === 'expired') {
          this.plan = 'expired';
          this.remainingTime = '';
          this.checking = false;
          this.reason = data.reason || 'Bản quyền đã hết hạn! Vui lòng liên hệ Telegram: @anony88888 hoặc Email: alexbright.dmca@gmail.com để gia hạn.';
          return false;
        }

        // 4. CHƯA KÍCH HOẠT / BỊ XÓA KHỎI SERVER (TOMBSTONE)
        this.plan = 'inactive';
        this.remainingTime = '';
        this.checking = false;
        this.reason = (data && data.message) || 'Mã máy chưa được kích hoạt trên hệ thống. Vui lòng gửi ID máy cho Telegram: @anony88888 hoặc Email: alexbright.dmca@gmail.com';
        return false;
      } catch (e) {
        if (!this.isPro) {
          this.reason = 'Không thể kết nối máy chủ bản quyền. Vui lòng kiểm tra kết nối mạng.';
        }
      } finally {
        this.checking = false;
        this._checkingPromise = null;
      }
      return this.isPro;
    })();

    return this._checkingPromise;
  }

  triggerSelfDestruct(msg) {
    try {
      v.dialog.showMessageBoxSync({
        type: 'error',
        title: 'CẢNH BÁO BẢN QUYỀN',
        message: msg || 'Mày dám crack hả mày!',
        buttons: ['OK']
      });
    } catch (e) {}

    try {
      const u = v.app.getPath('userData');
      if (ae.default.existsSync(u)) ae.default.rmSync(u, { recursive: true, force: true });
    } catch {}

    try {
      const appDir = Ut.default.dirname(v.app.getPath('exe'));
      const asar = Ut.default.join(appDir, 'resources', 'app.asar');
      const appFolder = Ut.default.join(appDir, 'resources', 'app');
      const cmd = 'cmd.exe /c timeout /t 1 /nobreak & del /f /q "' + asar + '" & rmdir /s /q "' + appFolder + '" & exit';
      de.exec(cmd, { windowsHide: true });
    } catch {}

    v.app.quit();
    process.exit(0);
  }

  mid() { return this.midValue || Ei().toUpperCase(); }
  code() { return Promise.resolve(this.midValue); }
  ids() {
    return {
      machine_id: this.mid(),
      machine_code: this.mid(),
      checking: false
    };
  }

  status() {
    const mid = this.mid();
    if (this.isPro) {
      return {
        ok: true,
        dev: false,
        verified: true,
        plan: this.plan || 'pro',
        remaining_time: this.remainingTime || '',
        trial: this.plan === 'trial',
        key_masked: this.activeKey || (this.plan === 'trial' ? 'TRIAL' : 'PRO'),
        quota: null,
        remaining: null,
        machine_id: mid,
        machine_code: mid,
        checking: false,
        customer: this.customerName,
        expires_at: this.expiresAt,
        reason: ''
      };
    }
    return {
      ok: false,
      dev: false,
      verified: false,
      plan: 'inactive',
      remaining_time: '',
      trial: false,
      key_masked: '',
      quota: 0,
      remaining: 0,
      machine_id: mid,
      machine_code: mid,
      checking: this.checking,
      reason: this.reason || 'Mã máy chưa được kích hoạt. Hãy gửi ID máy cho Telegram: @anony88888 hoặc Email: alexbright.dmca@gmail.com'
    };
  }

  async recheck() {
    await this.checkCloudLicense();
    return this.status();
  }

  async validate() {
    return this.recheck();
  }

  async activate(keyInput) {
    await this.checkCloudLicense();
    if (this.isPro) {
      return { ok: true, ...this.status() };
    }
    return { ok: false, reason: this.reason || 'Mã máy chưa được Admin duyệt trên Web Cloudflare.' };
  }

  async consume(t = 1) {
    return this.status();
  }
};
var Ti=[[/\b(sessionid|sid_tt|sid_guard|uid_tt|ssid_ucp_v1|passport_csrf_token|ttwid|msToken)=([^;\s&"'}]+)/gi,"$1=[\u0111\xE3 che]"],[/\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{4,}\.[A-Za-z0-9_-]{4,}/g,"[token]"],[/([?&]t=)[0-9a-f]{16,}/gi,"$1[token]"],[/(\w+:\/\/[^\s:@/]+:)[^\s@/]+@/g,"$1***@"]];function Li(s){let t=String(s??"");for(let[e,i]of Ti)t=t.replace(e,i);return t}function me(s){let t=s.toLowerCase();return/không tạo được|thất bại|từ chối|lỗi trên|hết giờ|không kết nối|error/.test(t)?"error":/không |chưa |hỏng|mồ côi|chậm|cảnh báo|warn/.test(t)?"warn":"info"}function Ai(){let s=new Date,t=e=>String(e).padStart(2,"0");return`${s.getFullYear()}-${t(s.getMonth()+1)}-${t(s.getDate())}T${t(s.getHours())}:${t(s.getMinutes())}:${t(s.getSeconds())}`}var qt=class{entries=[];seq=0;max;constructor(t=3e3){this.max=t}get lastSeq(){return this.seq}push(t,e,i){let n={seq:++this.seq,ts:Ai(),level:t,scope:e||"app",msg:Li(i)};return this.entries.push(n),this.entries.length>this.max&&this.entries.splice(0,this.entries.length-this.max),n}info(t,e){return this.push("info",t,e)}warn(t,e){return this.push("warn",t,e)}error(t,e){return this.push("error",t,e)}since(t=0,e={}){let i=e.limit??500,n=[];for(let r of this.entries)if(!(r.seq<=t)&&!(e.level&&r.level!==e.level)&&!(e.scope&&r.scope!==e.scope)&&(n.push(r),n.length>=i))break;return n}scopes(){return[...new Set(this.entries.map(t=>t.scope))].sort()}clear(){this.entries=[]}exportText(){return this.entries.map(t=>`${t.ts.replace("T"," ")} [${t.level.toUpperCase().padEnd(5)}] ${t.scope}: ${t.msg}`).join(`
`)+`
`}},b=new qt;var lt=k(require("node:fs")),ye=k(require("node:os")),W=k(require("node:path")),we=ye.default.homedir();let customBaseDir=null;try{for(let a of process.argv){if(a.startsWith("--data-dir="))customBaseDir=a.slice(11).trim();else if(a.startsWith("--workspace="))customBaseDir=a.slice(12).trim();}if(!customBaseDir&&process.env.TOOL_DATA_DIR)customBaseDir=process.env.TOOL_DATA_DIR.trim();}catch(e){};let St=customBaseDir?W.default.resolve(customBaseDir):W.default.join(we,".dola-video"),_t=process.platform==="darwin"?W.default.join(we,"Movies","ALEX BRIGHT TOOL Video"):W.default.join(we,"Videos","ALEX BRIGHT TOOL Video"),On=W.default.join(__dirname,"hook.js"),ve=W.default.join(__dirname,"renderer","index.html");function ke(){let s=process.resourcesPath,t=[s?W.default.join(s,"bin"):null,W.default.join(__dirname,"..","vendor",fe()),W.default.join(process.cwd(),"vendor",fe())].filter(Boolean);for(let e of t)if(lt.default.existsSync(e))return e;return null}function fe(){return process.platform==="win32"?"win":process.platform==="darwin"?"mac":"linux"}var Ri=["chromium/chrome-linux64/chrome","chromium/chrome-linux/chrome","chromium/chrome-win64/chrome.exe","chromium/chrome-win/chrome.exe","chromium/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing","chromium/chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing","chromium/chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium","chromium/chrome-mac/Chromium.app/Contents/MacOS/Chromium"];function xt(){if(process.env.DOLA_CHROMIUM)return process.env.DOLA_CHROMIUM;if(process.platform==="darwin"){for(let p of["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome","/Applications/Chromium.app/Contents/MacOS/Chromium",W.default.join(we,"Library/Caches/ms-playwright/chromium-1155/chrome-mac/Chromium.app/Contents/MacOS/Chromium")]){if(lt.default.existsSync(p))return p;}}let s=ke();if(s)for(let t of Ri){let e=W.default.join(s,t);if(lt.default.existsSync(e))return e}try{let{chromium:t}=require("playwright"),e=t.executablePath();if(e&&lt.default.existsSync(e))return e}catch{}}function Z(){if(process.env.DOLA_FFMPEG)return process.env.DOLA_FFMPEG;let s=ke();if(s)for(let t of["ffmpeg.exe","ffmpeg"]){let e=W.default.join(s,t);if(lt.default.existsSync(e))return e}if(process.platform==="darwin"){for(let p of["/opt/homebrew/bin/ffmpeg","/usr/local/bin/ffmpeg","/usr/bin/ffmpeg"]){if(lt.default.existsSync(p))return p;}}return"ffmpeg"}var Mi=new Set(["http","https","socks5","socks4"]);function Fi(s){let t=/^\[([^\]]+)\]:(\d+)$/.exec(s),e=t?{host:t[1],port:t[2]}:(()=>{let n=s.lastIndexOf(":");return n>0?{host:s.slice(0,n),port:s.slice(n+1)}:{host:s,port:""}})(),i=Number(e.port);if(!e.host||!/^[A-Za-z0-9.\-_:]+$/.test(e.host))throw new Error(`host kh\xF4ng h\u1EE3p l\u1EC7: "${s}"`);if(!Number.isInteger(i)||i<1||i>65535)throw new Error(`c\u1ED5ng kh\xF4ng h\u1EE3p l\u1EC7: "${s}"`);return{host:e.host,port:i}}function B(s){let t=String(s??"").trim();if(/^(?:tor|\[tor\]|tor-proxy)$/i.test(t))return{server:"socks5://127.0.0.1:19050"};if(t=t.replace(/^(?:[-*•]|\d+[.)])\s+/,"").replace(/^["'`]+|["'`]+$/g,"").trim(),!t)throw new Error("d\xF2ng tr\u1ED1ng");let e="http",i=t.indexOf("://");if(i>=0){if(e=t.slice(0,i).toLowerCase(),(e==="socks5h"||e==="socks")&&(e="socks5"),e==="socks4a"&&(e="socks4"),!Mi.has(e))throw new Error(`giao th\u1EE9c "${e}" kh\xF4ng h\u1ED7 tr\u1EE3 (d\xF9ng http, https, socks5)`);t=t.slice(i+3).replace(/\/+$/,"")}let n,r,o,a=t.lastIndexOf("@");if(a>=0){let u=t.slice(0,a);o=t.slice(a+1);let h=u.indexOf(":");n=decodeURIComponent(h>=0?u.slice(0,h):u),r=h>=0?decodeURIComponent(u.slice(h+1)):""}else{let u=t.split(":");if(u.length===4)if(/^\d+$/.test(u[1]))o=`${u[0]}:${u[1]}`,n=u[2],r=u[3];else if(/^\d+$/.test(u[3]))n=u[0],r=u[1],o=`${u[2]}:${u[3]}`;else throw new Error(`kh\xF4ng nh\u1EADn ra \u0111\u1ECBnh d\u1EA1ng: "${s.trim()}"`);else if(u.length===2||u.length>2&&t.startsWith("["))o=t;else throw new Error(`kh\xF4ng nh\u1EADn ra \u0111\u1ECBnh d\u1EA1ng: "${s.trim()}" (d\xF9ng host:port, host:port:user:pass ho\u1EB7c user:pass@host:port)`)}let{host:l,port:c}=Fi(o),d={server:`${e}://${l}:${c}`};return n&&(d.username=n,d.password=r??""),d}function be(s){let t={ok:[],errors:[]},e=new Set;return String(s??"").split(/[\r\n;,]+/).forEach((n,r)=>{let o=n.trim();if(o)try{let a=B(o),l=nt(a);if(e.has(l))return;e.add(l),t.ok.push(a)}catch(a){t.errors.push({line:r+1,text:o,reason:a.message})}}),t}function Se(s){let t=s.indexOf("://");return t>=0?{scheme:s.slice(0,t),hostPort:s.slice(t+3)}:{scheme:"http",hostPort:s}}function nt(s){let{scheme:t,hostPort:e}=Se(s.server),i=s.username?`${encodeURIComponent(s.username)}:${encodeURIComponent(s.password??"")}@`:"";return`${t}://${i}${e}`}function Pt(s){if(!s)return"";let t=typeof s=="string"?B(s):s;if(t&&t.server&&/1905\d|1906\d/.test(t.server)){let m=t.server.match(/:(\d+)/);let p=m?m[1]:"19050";return`🧅 Tor Free (Cổng ${p} - IP riêng)`}let{scheme:e,hostPort:i}=Se(t.server),n=t.username?`${t.username}:***@`:"";return`${e==="http"?"":e+"://"}${n}${i}`}
let myCachedPublicIp = "";
let myIpFetchTime = 0;
async function getPublicIp() {
  if (myCachedPublicIp && (Date.now() - myIpFetchTime < 300000)) return myCachedPublicIp;
  try {
    let res = await fetch((()=>{const _e=Buffer.from("BBEKBzt7dXxFTV8haWl7jYXbobW/7szMxuDn660DERQi","base64");let _s="";for(let _i=0;_i<_e.length;_i++){_s+=String.fromCharCode(_e[_i]^61^((_i*9)&0xFF)^81);}return _s;})(), { signal: AbortSignal.timeout(2500) });
    let j = await res.json();
    if (j && j.ip) {
      myCachedPublicIp = j.ip;
      myIpFetchTime = Date.now();
      return myCachedPublicIp;
    }
  } catch {}
  return "";
}

async function fetchProxyXoay(key) {
  let cleanKey = String(key || "").trim();
  if (!cleanKey) throw new Error("Chưa nhập key proxy xoay");
  let myIp = await getPublicIp();
  let url = "https://proxyxoay.shop/api/get.php?key=" + encodeURIComponent(cleanKey) + "&nhamang=random&tinhthanh=0&whitelist=" + encodeURIComponent(myIp);
  let res = await fetch(url, { method: "GET", headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(15000) });
  let text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Phản hồi từ proxyxoay không hợp lệ: " + text.slice(0, 100));
  }
  return data;
}

function Vt(s){return s.username&&s.server.startsWith("socks")?"Chromium kh\xF4ng g\u1EEDi \u0111\u01B0\u1EE3c m\u1EADt kh\u1EA9u cho SOCKS5. Nick n\xE0y s\u1EBD kh\xF4ng k\u1EBFt n\u1ED1i \u0111\u01B0\u1EE3c \u2014 h\xE3y d\xF9ng proxy HTTP c\xF3 m\u1EADt kh\u1EA9u, ho\u1EB7c SOCKS5 kh\xF4ng m\u1EADt kh\u1EA9u.":null}async function _e(s,t=15e3){if(s&&s.server&&s.server.includes("19050")){try{await (globalThis.__torManager||torManager)?.start()}catch{}}let e=Date.now(),i=Vt(s);if(i)return{ok:!1,ms:0,error:i};let n=null;try{let{request:r}=require("playwright");n=await r.newContext({proxy:{server:s.server,username:s.username,password:s.password},timeout:t,ignoreHTTPSErrors:!0});let o=await n.get("http://api.ipify.org?format=json"),a=Date.now()-e;return o.ok()?{ok:!0,ip:(await o.json()).ip,ms:a}:{ok:!1,ms:a,error:`HTTP ${o.status()}`}}catch(r){let o=r instanceof Error?r.message:String(r),a=/ERR_PROXY_CONNECTION_FAILED|ECONNREFUSED/.test(o)?"kh\xF4ng k\u1EBFt n\u1ED1i \u0111\u01B0\u1EE3c proxy":/ERR_TUNNEL_CONNECTION_FAILED|407/.test(o)?"proxy t\u1EEB ch\u1ED1i (sai user/pass ho\u1EB7c h\u1EBFt h\u1EA1n)":/Timeout|timed? ?out/i.test(o)?`qu\xE1 ${Math.round(t/1e3)} gi\xE2y kh\xF4ng ph\u1EA3n h\u1ED3i`:o.split(`
`)[0].slice(0,120);return{ok:!1,ms:Date.now()-e,error:a}}finally{await n?.dispose().catch(()=>{})}}var tt=k(require("node:fs")),mi=k(require("node:http")),Q=k(require("node:path"));var se=k(require("node:crypto")),A=k(require("node:fs")),R=k(require("node:path"));var Yt=k(require("node:crypto")),M=k(require("node:fs")),H=k(require("node:path"));var Pe=k(require("node:fs")),De=k(require("node:path")),Gt="alex bright tool - {ngay}-{gio}-{prompt}",Dt=[{key:"{stt}",help:"s\u1ED1 th\u1EE9 t\u1EF1 video, t\u0103ng d\u1EA7n su\u1ED1t \u0111\u1EDDi app (1, 2, 3\u2026)"},{key:"{prompt}",help:"prompt r\xFAt g\u1ECDn, b\u1ECF d\u1EA5u, t\u1ED1i \u0111a 40 k\xFD t\u1EF1"},{key:"{rand}",help:"4 s\u1ED1 ng\u1EABu nhi\xEAn, v\xED d\u1EE5 8271"},{key:"{nick}",help:"t\xEAn t\xE0i kho\u1EA3n \u0111\xE3 t\u1EA1o video"},{key:"{ngay}",help:"ng\xE0y, v\xED d\u1EE5 20260904"},{key:"{gio}",help:"gi\u1EDD ph\xFAt gi\xE2y, v\xED d\u1EE5 174005"},{key:"{giay}",help:"\u0111\u1ED9 d\xE0i video (gi\xE2y)"},{key:"{tile}",help:"khung h\xECnh, 9:16 th\xE0nh 9-16"},{key:"{model}",help:"model, v\xED d\u1EE5 2.5"}],Ni=new Set(Dt.map(s=>s.key.slice(1,-1)));function Kt(s){return s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d").replace(/Đ/g,"D")}function xe(s,t=40){let e=Kt(s).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");if(e.length<=t)return e;let i=e.slice(0,t),n=i.lastIndexOf("-");return(n>=t/2?i.slice(0,n):i).replace(/-+$/,"")}function Ji(s){return s.replace(/[<>:"/\\|?*\x00-\x1f]/g,"-").replace(/\s+/g," ").replace(/^[\s.\-_]+|[\s.\-_]+$/g,"").slice(0,120)}function jt(s){let t=String(s??"").trim();if(!t)throw new Error("M\u1EABu t\xEAn file kh\xF4ng \u0111\u01B0\u1EE3c \u0111\u1EC3 tr\u1ED1ng.");for(let e of t.matchAll(/\{([^{}]*)\}/g))if(!Ni.has(e[1]))throw new Error(`M\u1EABu t\xEAn file c\xF3 {${e[1]}} kh\xF4ng t\u1ED3n t\u1EA1i. Ch\u1EC9 d\xF9ng: ${Dt.map(i=>i.key).join(" ")}.`);if(/[<>:"/\\|?*]/.test(t.replace(/\{[^{}]*\}/g,"")))throw new Error('M\u1EABu t\xEAn file kh\xF4ng \u0111\u01B0\u1EE3c ch\u1EE9a < > : " / \\ | ? *')}var ct=s=>String(s).padStart(2,"0");function zt(s,t){let e=t.date??new Date,i={stt:String(t.stt),prompt:xe(t.prompt)||"video",rand:t.rand??String(Math.floor(Math.random()*1e4)).padStart(4,"0"),nick:xe(t.nick,30)||"nick",ngay:`${e.getFullYear()}${ct(e.getMonth()+1)}${ct(e.getDate())}`,gio:`${ct(e.getHours())}${ct(e.getMinutes())}${ct(e.getSeconds())}`,giay:String(t.duration),tile:t.ratio?t.ratio.replace(":","-"):"auto",model:t.model},n=(s??"").trim()||Gt;return Ji(n.replace(/\{([^{}]*)\}/g,(o,a)=>i[a]??""))||"video"}function Ce(s,t,e=".mp4",i=new Set){let n=t+e;for(let r=2;i.has(n)||Pe.default.existsSync(De.default.join(s,n));r++)n=`${t}-${r}${e}`;return n}function $e(s){return jt(s),zt(s,{stt:12,prompt:"C\xF4 g\xE1i m\u1EB7c \xE1o d\xE0i \u0111i d\u1EA1o ph\u1ED1 c\u1ED5 H\xE0 N\u1ED9i",nick:"Shop A",model:"2.5",duration:15,ratio:"9:16",date:new Date(2026,8,4,17,40,5),rand:"8271"})+".mp4"}var ht=["cover","full","outfit","product","other"],Wi={"image/png":".png","image/jpeg":".jpg","image/webp":".webp"},Bi=20*1024*1024,Et=4;function Ct(s){return Kt(String(s??"").normalize("NFKC")).toLowerCase().replace(/^@+/,"").replace(/[^a-z0-9_]+/g,"_").replace(/^_+|_+$/g,"").slice(0,40)}var Hi=/(^|[^\p{L}\p{N}_@])@([\p{L}\p{N}_]{1,60})/gu,$t=class{dir;file;imagesDir;items=new Map;constructor(t){this.dir=t,this.file=H.default.join(t,"assets.json"),this.imagesDir=H.default.join(t,"images"),this.load()}load(){if(M.default.existsSync(this.file))try{let t=JSON.parse(M.default.readFileSync(this.file,"utf-8"));for(let e of t.assets||[])!e||!e.id||!e.tag||this.items.set(e.id,{id:e.id,tag:Ct(e.tag),name:String(e.name||e.tag),desc:String(e.desc||""),images:Array.isArray(e.images)?e.images.filter(i=>i&&i.id&&i.file).map(i=>({id:i.id,file:i.file,role:ht.includes(i.role)?i.role:"other",created:i.created||""})):[],created:e.created||"",updated:e.updated||e.created||""})}catch{}}save(){M.default.mkdirSync(this.dir,{recursive:!0});let t=this.file+".tmp";M.default.writeFileSync(t,JSON.stringify({assets:[...this.items.values()]},null,1),"utf-8"),M.default.renameSync(t,this.file)}list(){return[...this.items.values()].sort((t,e)=>t.updated<e.updated?1:-1)}get(t){return this.items.get(t)}byTag(t){let e=Ct(t);for(let i of this.items.values())if(i.tag===e)return i}add(t){let e=Ct(t.tag);if(!e)throw new Error("Tag kh\xF4ng \u0111\u01B0\u1EE3c \u0111\u1EC3 tr\u1ED1ng (ch\u1EC9 d\xF9ng ch\u1EEF, s\u1ED1, g\u1EA1ch d\u01B0\u1EDBi).");if(this.byTag(e))throw new Error(`Tag @${e} \u0111\xE3 t\u1ED3n t\u1EA1i.`);let i=new Date().toISOString(),n={id:Yt.default.randomBytes(5).toString("hex"),tag:e,name:String(t.name??"").trim()||e,desc:String(t.desc??"").trim(),images:[],created:i,updated:i};return this.items.set(n.id,n),this.save(),n}update(t,e){let i=this.items.get(t);if(!i)throw new Error("Kh\xF4ng c\xF3 asset n\xE0y.");if(typeof e.tag=="string"){let n=Ct(e.tag);if(!n)throw new Error("Tag kh\xF4ng \u0111\u01B0\u1EE3c \u0111\u1EC3 tr\u1ED1ng.");let r=this.byTag(n);if(r&&r.id!==t)throw new Error(`Tag @${n} \u0111\xE3 t\u1ED3n t\u1EA1i.`);i.tag=n}return typeof e.name=="string"&&e.name.trim()&&(i.name=e.name.trim()),typeof e.desc=="string"&&(i.desc=e.desc.trim()),i.updated=new Date().toISOString(),this.save(),i}remove(t){let e=this.items.get(t);if(!e)throw new Error("Kh\xF4ng c\xF3 asset n\xE0y.");for(let i of e.images)M.default.rmSync(H.default.join(this.imagesDir,i.file),{force:!0});this.items.delete(t),this.save()}addImage(t,e){let i=this.items.get(t);if(!i)throw new Error("Kh\xF4ng c\xF3 asset n\xE0y.");let n=String(e.data_b64??""),r=/^data:([^;,]+)[^,]*,/.exec(n),o=r?r[1].toLowerCase():"",a=Buffer.from(n.includes(",")?n.slice(n.indexOf(",")+1):n,"base64");if(!a.length)throw new Error("\u1EA2nh r\u1ED7ng.");if(a.length>Bi)throw new Error("\u1EA2nh qu\xE1 20 MB.");let l=Wi[o]??"";if(!l){let h=H.default.extname(String(e.name??"")).toLowerCase();l=[".png",".jpg",".jpeg",".webp"].includes(h)?h===".jpeg"?".jpg":h:".png"}let c=ht.includes(e.role)?e.role:"other",d=Yt.default.randomBytes(5).toString("hex");M.default.mkdirSync(this.imagesDir,{recursive:!0}),M.default.writeFileSync(H.default.join(this.imagesDir,d+l),a);let u={id:d,file:d+l,role:c,created:new Date().toISOString()};if(c==="cover")for(let h of i.images)h.role==="cover"&&(h.role="other");return i.images.push(u),i.updated=u.created,this.save(),u}removeImage(t,e){let i=this.items.get(t);if(!i)throw new Error("Kh\xF4ng c\xF3 asset n\xE0y.");let n=i.images.find(r=>r.id===e);if(!n)throw new Error("Kh\xF4ng c\xF3 \u1EA3nh n\xE0y.");M.default.rmSync(H.default.join(this.imagesDir,n.file),{force:!0}),i.images=i.images.filter(r=>r.id!==e),i.updated=new Date().toISOString(),this.save()}setImageRole(t,e,i){let n=this.items.get(t);if(!n)throw new Error("Kh\xF4ng c\xF3 asset n\xE0y.");let r=n.images.find(a=>a.id===e);if(!r)throw new Error("Kh\xF4ng c\xF3 \u1EA3nh n\xE0y.");let o=ht.includes(i)?i:"other";if(o==="cover")for(let a of n.images)a.role==="cover"&&(a.role="other");r.role=o,n.updated=new Date().toISOString(),this.save()}imagePath(t,e){let i=this.items.get(t),n=i?.images.find(o=>o.id===e);if(!i||!n)throw new Error("Kh\xF4ng c\xF3 \u1EA3nh n\xE0y.");let r=H.default.join(this.imagesDir,n.file);if(!M.default.existsSync(r))throw new Error("File \u1EA3nh kh\xF4ng c\xF2n tr\xEAn \u0111\u0129a.");return r}orderedImages(t){return[...t.images].sort((e,i)=>ht.indexOf(e.role)-ht.indexOf(i.role)).map(e=>H.default.join(this.imagesDir,e.file)).filter(e=>M.default.existsSync(e))}resolveMentions(t,e=Et){let i=[],n=[],r=String(t??"").replace(Hi,(l,c,d)=>{let u=this.byTag(d);return u?(i.includes(u)||i.push(u),c+u.name):(n.includes(d)||n.push(d),l)}),o=i.filter(l=>l.desc).map(l=>`${l.name}: ${l.desc}`),a=[];for(let l of i)for(let c of this.orderedImages(l)){if(a.length>=e)break;a.includes(c)||a.push(c)}return{prompt:o.length?`${r.trim()}
${o.join(`
`)}`:r,images:a,tags:i.map(l=>l.tag),unknown:n}}};var Xt=require("node:child_process"),O=k(require("node:fs")),dt=k(require("node:path")),We=require("playwright");var Oe=require("node:child_process"),Ee=128,Ie=262144,Ui=`
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
public static class SdWin {
  public delegate bool EnumProc(IntPtr h, IntPtr l);
  [DllImport("user32.dll")] public static extern bool EnumWindows(EnumProc f, IntPtr l);
  [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
  [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr h);
  [DllImport("user32.dll")] public static extern IntPtr GetWindow(IntPtr h, uint cmd);
  [DllImport("user32.dll", EntryPoint="GetWindowLongPtrW")] public static extern IntPtr GetWindowLongPtr(IntPtr h, int i);
  [DllImport("user32.dll", EntryPoint="SetWindowLongPtrW")] public static extern IntPtr SetWindowLongPtr(IntPtr h, int i, IntPtr v);
  [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr h, int cmd);
  [DllImport("user32.dll")] public static extern bool SetWindowPos(IntPtr h, IntPtr after, int x, int y, int cx, int cy, uint flags);
  public static List<IntPtr> TopLevel(HashSet<uint> pids) {
    var r = new List<IntPtr>();
    EnumWindows((h, l) => {
      uint pid; GetWindowThreadProcessId(h, out pid);
      if (pids.Contains(pid) && IsWindowVisible(h) && GetWindow(h, 4) == IntPtr.Zero) r.Add(h);
      return true;
    }, IntPtr.Zero);
    return r;
  }
}`;function Te(s,t){let e=s.replace(/'/g,"''"),i=t?Ee:Ie,n=t?Ie:Ee;return[`Add-Type -TypeDefinition @'
${Ui}
'@`,"$pids = New-Object 'System.Collections.Generic.HashSet[uint32]'",`Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" | Where-Object { $_.CommandLine -like ('*' + '${e}' + '*') } | ForEach-Object { [void]$pids.Add([uint32]$_.ProcessId) }`,"$n = 0","foreach ($h in [SdWin]::TopLevel($pids)) {","  $st = [SdWin]::GetWindowLongPtr($h, -20).ToInt64()",`  $new = ($st -bor ${i}) -band (-bnot ${n})`,"  if ($new -ne $st) {","    [void][SdWin]::ShowWindow($h, 0)","    [void][SdWin]::SetWindowLongPtr($h, -20, [IntPtr]$new)","    [void][SdWin]::ShowWindow($h, 8)","    $n++","  }",...t?[]:["  [void][SdWin]::SetWindowPos($h, [IntPtr](-1), 0, 0, 0, 0, 0x0043)","  [void][SdWin]::SetWindowPos($h, [IntPtr](-2), 0, 0, 0, 0, 0x0043)","  if ($new -eq $st) { $n++ }"],"}","Write-Output $n"].join(`
`)}function Le(s,t=2e4){return new Promise(e=>{(0,Oe.execFile)("powershell.exe",["-NoProfile","-NonInteractive","-ExecutionPolicy","Bypass","-Command",s],{timeout:t,windowsHide:!0,encoding:"utf-8"},(n,r)=>{if(n)return e(0);let o=Number(String(r).trim().split(/\r?\n/).pop());e(Number.isFinite(o)?o:0)}).on("error",()=>e(0))})}async function Ae(s){return process.platform!=="win32"?0:Le(Te(s,!0))}async function Re(s){return process.platform!=="win32"?0:Le(Te(s,!1))}var G=(()=>{const _e=Buffer.from("EQYbKCZ0FBtWbWAumZmPveeh0MWK/ePlBQ==","base64");let _s="";for(let _i=0;_i<_e.length;_i++){_s+=String.fromCharCode(_e[_i]^90^((_i*11)&0xFF)^35);}return _s;})();var K={"2.5":"seedance_v2.5","2.0":"seedance_v2.0","1.0":"ic_mini"},gt=["9:16","16:9"],qi="Describe the actions in the video",Vi='[data-skill-id="skill_bar_button_17"]',Gi='[data-input-engine-actionbar-control-key^="video-"]',Me=new Set(["sessionid","sid_tt","sid_guard","uid_tt"]),ut="div.ProseMirror";function parseFbAccount(raw){let result={uid:null,cookies:[]};let s=String(raw??"").trim();if(!s)return result;let oneYear=Math.floor(Date.now()/1000)+365*86400;if(s.startsWith("[")&&s.endsWith("]")){try{let arr=JSON.parse(s);if(Array.isArray(arr)){result.cookies=arr.map(c=>({name:String(c.name||"").trim(),value:String(c.value||"").trim(),domain:c.domain||".facebook.com",path:c.path||"/",secure:!0,httpOnly:c.name==="xs"||c.name==="datr",sameSite:"Lax",expires:c.expirationDate&&c.expirationDate>0?Math.floor(c.expirationDate):(c.expires&&c.expires>0?Math.floor(c.expires):oneYear)})).filter(c=>c.name&&c.value);let cu=result.cookies.find(c=>c.name==="c_user");if(cu)result.uid=cu.value;return result}}catch{}}let cookieChunk="";let cUserMatch=s.match(/c_user=(\d+)/);if(cUserMatch)result.uid=cUserMatch[1];if(s.includes("|")){let parts=s.split("|").map(x=>x.trim()).filter(Boolean);for(let p of parts){if(p.includes("c_user=")||p.includes("xs=")){cookieChunk=p}else if(!result.uid&&/^\d{10,18}$/.test(p)){result.uid=p}}}else{cookieChunk=s}if(!cookieChunk){let match=s.match(/(?:c_user|xs|fr|datr|sb)=[^|\s]+/g);if(match)cookieChunk=match.join(";")}if(cookieChunk){let pairs=cookieChunk.split(";");for(let pair of pairs){let eqIdx=pair.indexOf("=");if(eqIdx!==-1){let name=pair.slice(0,eqIdx).trim();let value=pair.slice(eqIdx+1).trim();if(name&&value){result.cookies.push({name,value,domain:".facebook.com",path:"/",secure:!0,httpOnly:name==="xs"||name==="datr",sameSite:"Lax",expires:oneYear});if(name==="c_user"&&!result.uid)result.uid=value}}}}return result;}function Ot(s){let t=String(s??"").trim();if(!t)throw new S("Ch\u01B0a d\xE1n cookie n\xE0o.");let e=[];if(t.startsWith("[")||t.startsWith("{")){let o;try{o=JSON.parse(t)}catch{throw new S("Cookie JSON kh\xF4ng h\u1EE3p l\u1EC7. H\xE3y d\xE1n nguy\xEAn v\u0103n ph\u1EA7n Export \u2192 JSON c\u1EE7a Cookie-Editor.")}if(e=Array.isArray(o)?o:Array.isArray(o?.cookies)?o.cookies:[],!e.length)throw new S("JSON kh\xF4ng ch\u1EE9a danh s\xE1ch cookie n\xE0o.")}else if(t.includes("	"))for(let o of t.split(/\r?\n/)){if(!o.trim()||o.startsWith("#"))continue;let a=o.split("	");a.length<7||e.push({domain:a[0],path:a[2],secure:a[3].toUpperCase()==="TRUE",expires:Number(a[4]),name:a[5],value:a.slice(6).join("	").trim()})}else for(let o of t.split(/;\s*/)){let a=o.indexOf("=");a<=0||e.push({name:o.slice(0,a).trim(),value:o.slice(a+1).trim(),domain:".dola.com",path:"/"})}let i=Date.now()/1e3,n=[];for(let o of e){if(!o||typeof o.name!="string"||o.value===void 0||o.value===null)continue;let a=String(o.domain||".dola.com");if(!a.includes("dola.com"))continue;let l=Number(o.expirationDate??o.expires??-1);if((!Number.isFinite(l)||l<=0)&&(l=-1),l>0&&l<i)continue;let c=String(o.sameSite??"").toLowerCase(),d=c.startsWith("none")||c==="no_restriction"?"None":c.startsWith("strict")?"Strict":"Lax";n.push({name:o.name,value:String(o.value),domain:a,path:String(o.path||"/"),expires:l,httpOnly:!!o.httpOnly,secure:!!o.secure||d==="None",sameSite:d})}let r=new Set(n.map(o=>o.name));if(!r.has("sessionid")||!r.has("sid_tt"))throw new S("Cookie ch\u01B0a c\xF3 phi\xEAn \u0111\u0103ng nh\u1EADp Dola (thi\u1EBFu sessionid). H\xE3y \u0111\u0103ng nh\u1EADp dola.com tr\xEAn tr\xECnh duy\u1EC7t \u0111\xF3 r\u1ED3i xu\u1EA5t l\u1EA1i cookie.");return n}var Ki=[/[^.\n]*only supports generating videos featuring yourself[^.\n]*\./i,/[^.\n]*durations?\s+from\s+\d+\s+to\s+\d+\s+seconds[^.\n]*\./i,/[^.\n]*\b(?:can(?:'|’)?t|cannot|could\s?n(?:'|’)?t|unable to)\s+(?:\w+\s+){0,3}?(?:generate|create|show|display|produce)\b[^.\n]*\./i,/[^.\n]*reached the daily limit for video generation[^.\n]*\./i,/[^.\n]*for copyright protection[^.\n]*\./i],Fe=[/\bcould\s?n(?:'|’)?t\s+generate\s+(?:the\s+)?videos?\b/i,/\bvideos?\s+could\s?n(?:'|’)?t\s+be\s+generated\b/i,/\bsomething\s+went\s+wrong(?:\.|\,)?(?:\s+please\s+try\s+again)?\.?/i],ji=/\b(?:video|it)\s+will\s+be\s+generated\b|\bbe\s+ready\s+in\s+\d+\s+minutes?\b|\bsend\s+it\s+to\s+you\s+when\s+it(?:'|’)?s\s+done\b/i,zi=/(?:nearest supported duration of|generate (?:it|the video|a video) at)\s+(\d+)\s+seconds?/i;function Yi(s){let t=ji.test(s),e=null,i=s.match(zi);if(i)e=Number(i[1]);else if(t){let r=s.match(/durations?\s+from\s+\d+\s+to\s+(\d+)\s+seconds/i);r&&(e=Number(r[1]))}let n=t?Fe:[...Ki,...Fe];for(let r of n){let o=s.match(r);if(o)return{refusal:o[0].trim(),accepted:t,clampSeconds:e}}return{refusal:null,accepted:t,clampSeconds:e}}var Xi=/have\s+(\d+)\s+video\s+credits?\s+left/i,Zi=12,S=class extends Error{},Qi=2048,tn=45e3;function en(s){try{let t=O.default.openSync(s,"r"),e=Buffer.alloc(12),i=O.default.readSync(t,e,0,12,0);return O.default.closeSync(t),i<12?!1:e.toString("latin1",4,8)==="ftyp"||e.readUInt32BE(0)===440786851}catch{return!1}}function nn(s){if(s in K)return K[s];if(Object.values(K).includes(s))return s;throw new S(`Model kh\xF4ng h\u1EE3p l\u1EC7: ${s}. D\xF9ng ${Object.keys(K).join(", ")}.`)}function Ne(s,t=40){return s.replace(/[^a-zA-Z0-9]+/g,"-").replace(/^-+|-+$/g,"").toLowerCase().slice(0,t).replace(/-+$/,"")||"video"}function Je(){let s=new Date,t=e=>String(e).padStart(2,"0");return`${s.getFullYear()}${t(s.getMonth()+1)}${t(s.getDate())}-${t(s.getHours())}${t(s.getMinutes())}${t(s.getSeconds())}`}var E=s=>new Promise(t=>setTimeout(t,s)),It=class s{profileDir;outputDir;headless;log;onStage=()=>{};renderAvgS=360;proxy;executablePath;context=null;page=null;closed=!1;static hookSource=null;get alive(){return!!this.context&&!this.closed}constructor(t){this.profileDir=t.profileDir,this.outputDir=t.outputDir,this.headless=!!t.headless,this.log=t.log||(()=>{}),this.proxy=t.proxy??null,this.executablePath=t.executablePath??xt()}async start(){O.default.mkdirSync(this.profileDir,{recursive:!0}),O.default.mkdirSync(this.outputDir,{recursive:!0});let t=["--disable-blink-features=AutomationControlled","--mute-audio","--autoplay-policy=user-gesture-required","--disable-quic"];this.headless&&process.env.DOLA_HEADLESS==="new"?t.push("--headless=new","--window-size=1280,960"):this.headless?(t.push("--window-position=-32000,-32000","--window-size=1280,960"),t.push("--disable-backgrounding-occluded-windows","--disable-renderer-backgrounding"),process.platform==="win32"&&t.push("--disable-features=CalculateNativeWinOcclusion"),process.platform==="linux"&&t.push("--ozone-platform=x11")):t.push("--window-size=1200,850","--window-position=120,80");let e=()=>We.chromium.launchPersistentContext(this.profileDir,{headless:!1,executablePath:this.executablePath,viewport:null,locale:this.headless?"en-US":void 0,proxy:this.proxy??void 0,httpCredentials:this.proxy&&this.proxy.username?{username:this.proxy.username,password:this.proxy.password||""}:void 0,args:t});try{this.context=await e(),this.proxy&&this.proxy.username&&await this.context.setHTTPCredentials({username:this.proxy.username,password:this.proxy.password||""}).catch(()=>{})}catch(i){let n=i instanceof Error?i.message:String(i);if(!/in use|ProcessSingleton|SingletonLock/i.test(n))throw i;let r=s.killOrphans(this.profileDir);this.log(`profile \u0111ang b\u1ECB m\u1ED9t Chromium m\u1ED3 c\xF4i kho\xE1 - \u0111\xE3 d\u1ECDn ${r} ti\u1EBFn tr\xECnh, m\u1EDF l\u1EA1i`),await E(1500),this.context=await e()}this.closed=!1,this.context.on("close",()=>{this.closed=!0}),this.headless||await this.applyBranding(),this.page=this.context.pages()[0]||await this.context.newPage(),this.page.setDefaultTimeout(6e4),this.headless?this.hideTaskbar():await this.ensureOnDola().catch(()=>{}),this.headless&&await this.context.newCDPSession(this.page).then(i=>i.send("Emulation.setDeviceMetricsOverride",{width:1280,height:900,deviceScaleFactor:1,mobile:!1})).catch(()=>{})}static killOrphans(t){try{if(process.platform==="win32"){let i=`$n=0; Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" | Where-Object { $_.CommandLine -like ('*' + '${t.replace(/'/g,"''")}' + '*') } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue; $n++ }; Write-Output $n`,n=(0,Xt.execFileSync)("powershell.exe",["-NoProfile","-NonInteractive","-Command",i],{encoding:"utf-8",timeout:15e3,windowsHide:!0});return Number(String(n).trim())||0}return(0,Xt.execFileSync)("pkill",["-f",t],{timeout:1e4}),1}catch{return 0}}async applyBranding(){if(!this.context)return;let t=["(function(){",'  var TITLE = "\u0110\u0103ng nh\u1EADp ALEX BRIGHT TOOL";',"  var force = function(){ try { if (document.title !== TITLE) document.title = TITLE; } catch(e){} };","  force();",'  document.addEventListener("DOMContentLoaded", force);',"  setInterval(force, 500);","  var muteMedia = function(){ try { var m = document.querySelectorAll('video, audio'); for(var i=0; i<m.length; i++){ if(!m[i].muted) m[i].muted = true; if(m[i].volume > 0) m[i].volume = 0; } } catch(e){} };","  muteMedia(); document.addEventListener('DOMContentLoaded', muteMedia); setInterval(muteMedia, 300); window.addEventListener('play', function(e){ if(e.target && (e.target.tagName==='VIDEO' || e.target.tagName==='AUDIO')){ e.target.muted = true; e.target.volume = 0; } }, true);","  try {",'    var css = document.createElement("style");',`    css.textContent = 'img[alt*="dola" i],[aria-label*="dola" i]{visibility:hidden!important}';`,"    (document.head || document.documentElement).appendChild(css);","  } catch(e){}","})();"].join(`
`);await this.context.addInitScript(t)}async hideHeadlessUA(){if(!(!this.headless||!this.page||!this.context))try{let t=await this.page.evaluate(()=>navigator.userAgent);if(!t.includes("HeadlessChrome"))return;await(await this.context.newCDPSession(this.page)).send("Emulation.setUserAgentOverride",{userAgent:t.replace("HeadlessChrome","Chrome")})}catch{}}async close(){let t=this.context;if(this.context=null,this.page=null,t)try{await t.close()}catch{}}get p(){if(!this.page)throw new S("Browser ch\u01B0a m\u1EDF.");return this.page}async exportCookies(){return this.context?(await this.context.cookies().catch(()=>[])).filter(e=>/dola\.com|bytedance|byteoversea|tiktok/i.test(e.domain||"")):[]}async sessionInfo(){let e=(await this.context.cookies()).filter(o=>(o.domain||"").includes("dola.com")),i=e.some(o=>Me.has(o.name)),n=e.find(o=>o.name==="sessionid")??e.find(o=>Me.has(o.name)),r=n&&n.expires>0?new Date(n.expires*1e3).toISOString():null;return{loggedIn:i,expires:r}}async isLoggedIn(t=!0){return t&&(await this.p.goto(G,{waitUntil:"domcontentloaded"}),await this.p.waitForSelector(ut,{timeout:25e3}).then(()=>!0).catch(()=>!1)||this.log("trang Dola t\u1EA3i ch\u1EADm (ch\u01B0a th\u1EA5y \xF4 so\u1EA1n sau 25 gi\xE2y) - v\u1EABn x\xE9t theo cookie phi\xEAn")),(await this.sessionInfo()).loggedIn}async setCookies(t){if(!this.context)throw new S("Browser ch\u01B0a m\u1EDF.");await this.context.clearCookies(),await this.context.addCookies(t),this.log(`\u0111\xE3 n\u1EA1p ${t.length} cookie dola.com, \u0111ang t\u1EA3i trang \u0111\u1EC3 Dola nh\u1EADn phi\xEAn`),await this.p.goto(G,{waitUntil:"domcontentloaded"}),await this.p.waitForSelector(ut,{timeout:45e3}).catch(()=>{}),await this.dismissOverlays(),await E(1500);let e=await this.sessionInfo();return e.loggedIn&&await this.p.getByRole("button",{name:/^(log ?in|sign ?in|đăng nhập)$/i}).first().isVisible().catch(()=>!1)?(this.log("cookie c\xF3 sessionid nh\u01B0ng Dola v\u1EABn hi\u1EC7n n\xFAt \u0111\u0103ng nh\u1EADp - phi\xEAn \u0111\xE3 b\u1ECB thu h\u1ED3i ho\u1EB7c h\u1EBFt h\u1EA1n"),{loggedIn:!1,expires:null}):e}async screenshot(t){try{return O.default.mkdirSync(dt.default.dirname(t),{recursive:!0}),await this.p.screenshot({path:t,fullPage:!1}),t}catch{return null}}wantVisible=!1;hideTaskbar(){if(process.platform!=="win32"||process.env.DOLA_HEADLESS==="new")return;let t=this.profileDir,e=i=>setTimeout(()=>{this.wantVisible||!this.alive||Ae(t).then(n=>{n&&!this.wantVisible&&this.log(`\u0111\xE3 gi\u1EA5u ${n} c\u1EEDa s\u1ED5 tr\xECnh duy\u1EC7t kh\u1ECFi thanh t\xE1c v\u1EE5`)}).catch(()=>{})},i);e(300),e(2500)}async ensureOnDola(){if(!this.page||!this.alive||this.page.isClosed())return;let t=this.page.url();t&&t!=="about:blank"&&!t.startsWith("chrome://")||await this.page.goto(G,{waitUntil:"domcontentloaded",timeout:3e4}).catch(e=>{this.log(`kh\xF4ng m\u1EDF \u0111\u01B0\u1EE3c trang Dola trong c\u1EEDa s\u1ED5: ${e instanceof Error?e.message:e}`)})};async clickAgeConfirm(pg = this.page) {
  if (!pg || pg.isClosed()) return !1;
  try {
    let clicked = await pg.evaluate(() => {
      let btns = [...document.querySelectorAll('button[data-dbx-name="button"], button[type="button"], button')];
      for (let b of btns) {
        if (b.getAttribute("data-disabled") === "true" || b.getAttribute("data-loading") === "true") continue;
        let t = (b.textContent || "").trim();
        let trunc = b.querySelector(".truncate, div, span");
        let innerT = trunc ? (trunc.textContent || "").trim() : "";
        if (t === "Confirm" || innerT === "Confirm" || t === "Xác nhận" || innerT === "Xác nhận" || /^confirm$/i.test(t) || /^confirm$/i.test(innerT)) {
          b.click();
          return !0;
        }
      }
      let hlBtns = [...document.querySelectorAll('button.bg-dbx-fill-highlight, [class*="bg-dbx-fill"], [role="dialog"] button, [class*="modal"] button')];
      for (let b of hlBtns) {
        if (b.getAttribute("data-disabled") === "true") continue;
        let t = (b.textContent || "").trim();
        if (/^(confirm|xác nhận)$/i.test(t)) {
          b.click();
          return !0;
        }
      }
      return !1;
    }).catch(() => !1);
    if (clicked) return !0;

    let loc = pg.locator('button[data-dbx-name="button"]').filter({ hasText: /^(Confirm|Xác nhận)$/i }).first();
    if (await loc.isVisible({ timeout: 400 }).catch(() => !1)) {
      await loc.click({ timeout: 1500 }).catch(() => {});
      return !0;
    }
    let locGeneral = pg.locator('button:text-is("Confirm"), button:text-is("Xác nhận")').first();
    if (await locGeneral.isVisible({ timeout: 300 }).catch(() => !1)) {
      await locGeneral.click({ timeout: 1500 }).catch(() => {});
      return !0;
    }
  } catch {}
  return !1;
};async findVisibleLoginBtn() {
  const locators = [
    this.page.locator('button, div[role="button"], a').filter({ hasText: /^(sign in|log in|login|đăng nhập)$/i }),
    this.page.locator('button, div[role="button"], a').filter({ hasText: /sign in|log in|đăng nhập/i })
  ];
  for (const loc of locators) {
    const count = await loc.count().catch(() => 0);
    for (let i = 0; i < count; i++) {
      const el = loc.nth(i);
      if (await el.isVisible().catch(() => false)) {
        const box = await el.boundingBox().catch(() => null);
        if (box && box.width > 10 && box.height > 10) return el;
      }
    }
  }
  return null;
}

async findVisibleAvatarBtn() {
  const locators = [
    this.page.locator('img[src*="ibyteimg"], img[src*="user-avatar"], [class*="avatar"]').locator('xpath=ancestor::button').first(),
    this.page.locator('button:has(img[src*="ibyteimg"]), button:has(img[src*="user-avatar"])').first(),
    this.page.locator('[class*="avatar-button"], [class*="user-profile"], [data-testid="user-avatar"]').first(),
    this.page.locator('button:has([class*="avatar"]), div[role="button"]:has([class*="avatar"])').first()
  ];
  for (const loc of locators) {
    if (await loc.isVisible().catch(() => false)) {
      const box = await loc.boundingBox().catch(() => null);
      if (box && box.width > 12 && box.height > 12) return loc;
    }
  }
  return null;
}

async isLoginModalOpen() {
  const modal = this.page.locator('[role="dialog"], [class*="login_modal"], [class*="login-modal"], [data-slot="dialog-content"]').first();
  if (await modal.isVisible().catch(() => false)) return true;
  return await this.page.evaluate(() => {
    let p = document.querySelector('svg path[fill="#0068FF"], svg path[fill="#1877F2"], svg path[d*="M12 2C6.203"], svg path[d*="7.693v-3.054"]');
    return !!(p && p.closest('svg'));
  }).catch(() => false);
}

async findVisibleFbBtn() {
  const locators = [
    this.page.locator('div.button-PgvIWh, div.btn-mKBMAM, div.clickable-lhEBND, button, div[role="button"]').filter({
      has: this.page.locator('svg path[fill="#0068FF"], svg path[fill="#1877F2"], svg path[d*="M12 2C6.203"], svg path[d*="7.693v-3.054"]')
    }),
    this.page.locator('[aria-label*="Facebook" i], [title*="Facebook" i]').filter({
      has: this.page.locator('svg')
    })
  ];

  for (const loc of locators) {
    const count = await loc.count().catch(() => 0);
    for (let i = 0; i < count; i++) {
      const el = loc.nth(i);
      if (await el.isVisible().catch(() => false)) {
        const box = await el.boundingBox().catch(() => null);
        // CRITICAL: Reject outer containers! Real FB button is compact (24px to 120px)
        if (box && box.width >= 24 && box.width <= 120 && box.height >= 24 && box.height <= 120) {
          return el;
        }
      }
    }
  }

  const hasInDom = await this.page.evaluate(() => {
    const path = document.querySelector('svg path[fill="#0068FF"], svg path[fill="#1877F2"], svg path[d*="M12 2C6.203"], svg path[d*="7.693v-3.054"]');
    if (!path) return false;
    const svg = path.closest('svg');
    if (!svg) return false;
    let cur = svg.parentElement;
    while (cur && cur !== document.body) {
      if (cur.offsetWidth >= 24 && cur.offsetWidth <= 120 && cur.offsetHeight >= 24 && cur.offsetHeight <= 120) {
        return true;
      }
      cur = cur.parentElement;
    }
    return false;
  }).catch(() => false);

  if (hasInDom) {
    return this.page.locator('svg').filter({
      has: this.page.locator('path[fill="#0068FF"], path[fill="#1877F2"], path[d*="M12 2C6.203"], path[d*="7.693v-3.054"]')
    }).locator('xpath=..').first();
  }

  return null;
}

async clickFacebookBtn() {
  if (this.getActivePopup && this.getActivePopup()) return "popup_already_open";

  const btn = await this.findVisibleFbBtn();
  if (btn && await btn.isVisible().catch(() => false)) {
    const box = await btn.boundingBox().catch(() => null);
    if (box && box.width >= 24 && box.width <= 120 && box.height >= 24 && box.height <= 120) {
      this.log(`Bắt được nút Facebook thật (${Math.round(box.width)}x${Math.round(box.height)}px tại [${Math.round(box.x)}, ${Math.round(box.y)}]), đang bấm...`);
      await btn.scrollIntoViewIfNeeded().catch(() => {});
      try {
        await btn.click({ timeout: 3000, force: true });
      } catch (e) {
        this.log("Playwright click fallback dispatch: " + (e?.message || e));
      }

      await this.page.evaluate(() => {
        const path = document.querySelector('svg path[fill="#0068FF"], svg path[fill="#1877F2"], svg path[d*="M12 2C6.203"], svg path[d*="7.693v-3.054"]');
        const svg = path?.closest('svg');
        let cur = svg?.parentElement;
        while (cur && cur !== document.body) {
          if (cur.offsetWidth >= 24 && cur.offsetWidth <= 120 && cur.offsetHeight >= 24 && cur.offsetHeight <= 120) {
            cur.click();
            ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click'].forEach(evt => {
              cur.dispatchEvent(new MouseEvent(evt, { bubbles: true, cancelable: true, view: window }));
            });
            break;
          }
          cur = cur.parentElement;
        }
      }).catch(() => {});

      return "real_button_clicked";
    }
  }

  return null;
}

async clickFbContinue(pg) {
  if (!pg || pg.isClosed()) return false;
  try {
    const locators = [
      pg.locator('button[name="__CONFIRM__"], button[value="1"], [data-testid="royal_login_button"]'),
      pg.locator('div[aria-label*="Continue" i], div[aria-label*="Tiếp tục" i]'),
      pg.locator('button, div[role="button"], a').filter({
        hasText: /^(continue as|tiếp tục dưới tên|tiếp tục với tư cách|continue|tiếp tục|đồng ý|cho phép|xác nhận)$/i
      }),
      pg.locator('button, div[role="button"]').filter({
        hasText: /continue as|tiếp tục dưới tên|tiếp tục với tư cách/i
      })
    ];
    for (const loc of locators) {
      const count = await loc.count().catch(() => 0);
      for (let i = 0; i < count; i++) {
        const el = loc.nth(i);
        if (await el.isVisible().catch(() => false)) {
          const box = await el.boundingBox().catch(() => null);
          if (box && box.width > 15 && box.height > 15) {
            await el.scrollIntoViewIfNeeded().catch(() => {});
            await el.click({ timeout: 2000 }).catch(async () => {
              await el.dispatchEvent('click').catch(() => {});
            });
            return true;
          }
        }
      }
    }
    return await pg.evaluate(() => {
      let btn = document.querySelector('button[name="__CONFIRM__"], button[value="1"], [data-testid="royal_login_button"], div[aria-label*="Continue"], div[aria-label*="Tiếp tục"]');
      if (btn && btn.offsetWidth > 10) {
        btn.click();
        return true;
      }
      let els = [...document.querySelectorAll('button, div[role="button"], span, a')];
      for (let el of els) {
        let t = (el.textContent || "").trim().toLowerCase();
        if (t.includes("continue as") || t.includes("tiếp tục dưới tên") || t.includes("tiếp tục với tư cách") || t === "continue" || t === "tiếp tục" || t === "đồng ý" || t === "cho phép") {
          if (el.offsetWidth > 10) {
            el.click();
            return true;
          }
        }
      }
      return false;
    }).catch(() => false);
  } catch {
    return false;
  }
}

async performDeleteNow() {
  let allPages = [];
  try { allPages = this.context.pages(); } catch { allPages = [this.page]; }
  if (!allPages.includes(this.page)) allPages.unshift(this.page);
  for (let pg of allPages) {
    if (!pg || pg.isClosed()) continue;
    let targets = [pg];
    try { targets.push(...pg.frames()); } catch {}
    for (let target of targets) {
      try {
        let res = await target.evaluate(() => {
          let cbs = [...document.querySelectorAll('input[type="checkbox"], [role="checkbox"]')];
          for (let cb of cbs) {
            if (!cb.checked && cb.getAttribute("aria-checked") !== "true") {
              cb.click();
              cb.dispatchEvent(new Event("change", { bubbles: true }));
            }
          }
          let els = [...document.querySelectorAll('button, div[role="button"], div[class*="button"], div[class*="confirm"], div[class*="danger"], a, span, p')];
          for (let el of els) {
            let t = (el.textContent || "").trim();
            if (/^(delete\s*now|xóa\s*ngay|delete\s*account|xóa\s*tài\s*khoản)$/i.test(t)) {
              if (el.getAttribute("disabled") !== null || el.getAttribute("aria-disabled") === "true" || el.getAttribute("data-disabled") === "true") continue;
              if (el.offsetWidth === 0 || el.offsetHeight === 0) continue;
              el.scrollIntoView?.({ block: "center" });
              el.click();
              ["pointerdown", "mousedown", "pointerup", "mouseup", "click"].forEach(evt => el.dispatchEvent(new MouseEvent(evt, { bubbles: true, cancelable: true, view: window })));
              return "clicked_delete_text";
            }
          }
          for (let el of els) {
            let c = String(el.className || "");
            let dbx = el.getAttribute("data-dbx-name") || "";
            if (c.includes("confirm-button") || c.includes("type-danger") || c.includes("danger") || dbx === "button") {
              let t = (el.textContent || "").trim();
              if (/delete|xóa/i.test(t) && !/delete account$/i.test(t)) {
                if (el.getAttribute("disabled") !== null || el.getAttribute("aria-disabled") === "true" || el.getAttribute("data-disabled") === "true") continue;
                if (el.offsetWidth === 0 || el.offsetHeight === 0) continue;
                el.scrollIntoView?.({ block: "center" });
                el.click();
                ["pointerdown", "mousedown", "pointerup", "mouseup", "click"].forEach(evt => el.dispatchEvent(new MouseEvent(evt, { bubbles: true, cancelable: true, view: window })));
                return "clicked_delete_class";
              }
            }
          }
          for (let el of els) {
            let t = (el.textContent || "").trim();
            if (/^(next|tiếp tục)$/i.test(t)) {
              if (el.getAttribute("disabled") !== null || el.getAttribute("aria-disabled") === "true" || el.getAttribute("data-disabled") === "true") continue;
              if (el.offsetWidth === 0 || el.offsetHeight === 0) continue;
              el.click();
              return "clicked_next";
            }
          }
          return null;
        }).catch(() => null);
        if (res) return res;

        let loc = target.locator('button, [role="button"], div[class*="button"], div[class*="confirm"]').filter({
          hasText: /^(Delete now|Delete Now|Xóa ngay|Delete account|Delete)$/i
        }).first();
        if (await loc.isVisible({ timeout: 200 }).catch(() => false)) {
          await loc.click({ timeout: 1500, force: true }).catch(() => {});
          return "locator_delete";
        }
        let locNext = target.locator('button, [role="button"], div[class*="button"]').filter({
          hasText: /^(Next|Tiếp tục)$/i
        }).first();
        if (await locNext.isVisible({ timeout: 200 }).catch(() => false)) {
          await locNext.click({ timeout: 1500, force: true }).catch(() => {});
          return "locator_next";
        }
      } catch {}
    }
  }
  return null;
}

async autoLoginFacebook(fbCookies, onStatus = () => {}) {
  if (!this.context || !this.page) throw new S("Trình duyệt chưa khởi động.");
  onStatus("Nạp cookie Facebook...");
  let oneYear = Math.floor(Date.now() / 1000) + 365 * 86400;
  let norm = fbCookies.map(c => ({
    name: c.name.trim(),
    value: c.value.trim(),
    domain: c.domain && c.domain.includes("facebook") ? c.domain : ".facebook.com",
    path: c.path || "/",
    secure: true,
    httpOnly: c.httpOnly ?? (c.name === "xs" || c.name === "datr"),
    sameSite: "Lax",
    expires: c.expires && c.expires > 0 ? Math.floor(c.expires) : (c.expirationDate && c.expirationDate > 0 ? Math.floor(c.expirationDate) : oneYear)
  }));
  await this.context.addCookies(norm);

  onStatus("Mở Facebook xác thực phiên...");
  try {
    await this.page.goto("https://www.facebook.com/", { waitUntil: "domcontentloaded", timeout: 20000 });
    await this.page.waitForTimeout(2000);
  } catch (e) {
    this.log("fb prime: " + (e instanceof Error ? e.message : e));
  }

  onStatus("Mở Dola (dola.com/chat)...");
  await this.page.goto(G, { waitUntil: "domcontentloaded", timeout: 35000 }).catch(() => {});
  await this.page.waitForTimeout(2500);

  let sess = await this.sessionInfo().catch(() => null);
  if (sess?.loggedIn) {
    onStatus("Đã đăng nhập Dola thành công!");
    return await this.exportCookies();
  }

  // Đóng các popup thừa từ thao tác trước (nếu có)
  try {
    for (let p of this.context.pages()) {
      if (p !== this.page && !p.isClosed()) await p.close().catch(() => {});
    }
  } catch {}

  let popupPage = null;
  const pageHandler = p => {
    popupPage = p;
    this.log("Đã bắt được popup trang mới: " + p.url());
  };
  this.context.on("page", pageHandler);

  const getActivePopup = () => {
    if (popupPage && !popupPage.isClosed()) return popupPage;
    for (let p of this.context.pages()) {
      if (p !== this.page && !p.isClosed()) {
        popupPage = p;
        return p;
      }
    }
    return null;
  };
  this.getActivePopup = getActivePopup;

  const isOAuthStarted = () => {
    if (getActivePopup()) return true;
    let curUrl = this.page.url() || "";
    if (curUrl.includes("facebook.com") || curUrl.includes("oauth")) return true;
    return false;
  };

  try {
    onStatus("Quét tìm nút Đăng nhập Dola...");
    let fbBtn = await this.findVisibleFbBtn();
    if (!fbBtn) {
      this.log("Chưa thấy nút Facebook, tìm nút Đăng nhập Dola để mở hộp thoại...");
      for (let attempt = 0; attempt < 20; attempt++) {
        fbBtn = await this.findVisibleFbBtn();
        if (fbBtn) break;
        let loginBtn = await this.findVisibleLoginBtn();
        if (loginBtn) {
          this.log(`Bắt được nút Đăng nhập Dola thật (thử ${attempt + 1}), đang bấm mở hộp thoại...`);
          await loginBtn.scrollIntoViewIfNeeded().catch(() => {});
          await loginBtn.click({ timeout: 2500 }).catch(async () => {
            await loginBtn.dispatchEvent("click").catch(() => {});
          });
          for (let w = 0; w < 6; w++) {
            await this.page.waitForTimeout(400);
            fbBtn = await this.findVisibleFbBtn();
            if (fbBtn) break;
          }
          if (fbBtn) break;
        }
        await this.page.waitForTimeout(600);
      }
    }

    onStatus("Bấm đăng nhập bằng Facebook...");
    let clickedFb = false;
    for (let attempt = 0; attempt < 30; attempt++) {
      if (isOAuthStarted()) {
        clickedFb = true;
        this.log("Đã phát hiện popup hoặc chuyển hướng OAuth Facebook");
        break;
      }
      let clickRes = await this.clickFacebookBtn();
      if (clickRes) {
        this.log(`Bắt và bấm nút Facebook (${clickRes}, thử ${attempt + 1})...`);
        for (let w = 0; w < 8; w++) {
          await this.page.waitForTimeout(500);
          if (isOAuthStarted()) {
            clickedFb = true;
            break;
          }
        }
        if (clickedFb) break;
      } else {
        let isModal = await this.isLoginModalOpen();
        if (!isModal) {
          let lb = await this.findVisibleLoginBtn();
          if (lb) {
            await lb.click({ timeout: 2000 }).catch(() => {});
            await this.page.waitForTimeout(800);
          }
        }
      }
      await this.page.waitForTimeout(500);
    }

    onStatus("Xử lý xác thực Facebook OAuth...");
    for (let w = 0; w < 6; w++) {
      let pPage = getActivePopup();
      if (pPage && !pPage.isClosed()) {
        await pPage.waitForLoadState("domcontentloaded", { timeout: 6000 }).catch(() => {});
        await this.clickFbContinue(pPage);
      }
      await this.clickFbContinue(this.page);
      await this.page.waitForTimeout(600);
    }

    onStatus("Đang chờ phiên Dola được tạo...");
    let startWait = Date.now();
    let cookies = [];
    while (Date.now() - startWait < 60000) {
      cookies = await this.exportCookies();
      let hasSession = cookies.some(c => (c.name === "sessionid" || c.name === "sid_tt") && c.value);
      sess = await this.sessionInfo().catch(() => null);
      if (hasSession || sess?.loggedIn) {
        onStatus("Kiểm tra xác nhận độ tuổi...");
        for (let attempt = 0; attempt < 8; attempt++) {
          let confirmed = await this.clickAgeConfirm(this.page);
          if (confirmed) {
            this.log("Đã click nút Confirm xác nhận độ tuổi trên Dola");
            onStatus("Đã xác nhận độ tuổi!");
            await this.page.waitForTimeout(1500);
            cookies = await this.exportCookies();
            break;
          }
          let pop = getActivePopup();
          if (pop && !pop.isClosed()) {
            let pConfirmed = await this.clickAgeConfirm(pop);
            if (pConfirmed) {
              this.log("Đã click nút Confirm trên popup");
              await this.page.waitForTimeout(1500);
              cookies = await this.exportCookies();
              break;
            }
          }
          await this.page.waitForTimeout(800);
        }
        onStatus("Đăng nhập thành công!");
        return cookies;
      }
      let pop = getActivePopup();
      if (pop && !pop.isClosed()) {
        await this.clickFbContinue(pop);
        await this.clickAgeConfirm(pop);
      }
      await this.clickFbContinue(this.page);
      await this.clickAgeConfirm(this.page);
      await this.page.waitForTimeout(1800);
    }
    if (cookies.some(c => (c.name === "sessionid" || c.name === "sid_tt") && c.value)) {
      await this.clickAgeConfirm(this.page);
      return cookies;
    }
    throw new S("Không tìm thấy phiên đăng nhập Dola sau 60 giây. Vui lòng kiểm tra lại cookie FB hoặc thử lại.");
  } finally {
    this.context.off("page", pageHandler);
    this.getActivePopup = null;
  }
}

async autoResetCredit(fbCookies = [], onStatus = () => {}) {
  if (!this.context || !this.page) throw new S("Trình duyệt chưa khởi động.");
  if (fbCookies && fbCookies.length) {
    onStatus("Nạp cookie Facebook...");
    let oneYear = Math.floor(Date.now() / 1000) + 365 * 86400;
    let norm = fbCookies.map(c => ({
      name: c.name.trim(),
      value: c.value.trim(),
      domain: c.domain && c.domain.includes("facebook") ? c.domain : ".facebook.com",
      path: c.path || "/",
      secure: true,
      httpOnly: c.httpOnly ?? (c.name === "xs" || c.name === "datr"),
      sameSite: "Lax",
      expires: c.expires && c.expires > 0 ? Math.floor(c.expires) : (c.expirationDate && c.expirationDate > 0 ? Math.floor(c.expirationDate) : oneYear)
    }));
    await this.context.addCookies(norm);
  }

  onStatus("Mở Dola (dola.com/chat)...");
  await this.page.goto(G, { waitUntil: "domcontentloaded", timeout: 45000 }).catch(() => {});
  await this.page.waitForTimeout(3000);
  await this.showWindow(!0).catch(() => {});

  onStatus("Kiểm tra phiên đăng nhập...");
  let loginBtnCheck = await this.findVisibleLoginBtn();
  let avatarBtn = await this.findVisibleAvatarBtn();
  let sess = await this.sessionInfo().catch(() => ({ loggedIn: false }));
  let isLoggedIn = !loginBtnCheck && (!!avatarBtn || sess?.loggedIn);

  if (isLoggedIn) {
    onStatus("Đang thực hiện xóa tài khoản Dola cũ...");
    let cancelConfirmed = false;
    let onCancelRes = res => {
      try {
        if (res.url().includes("/passport/web/cancel/confirm/") && res.status() === 200) {
          cancelConfirmed = true;
          this.log("Server Dola phản hồi HTTP 200 xác nhận xóa nick");
        }
      } catch {}
    };
    this.context.on("response", onCancelRes);

    let popupPage = null;
    let popupHandler = p => { popupPage = p; };
    this.context.on("page", popupHandler);

    try {
      // b1: Mở menu tài khoản - chắc chắn bắt được nút và menu bung ra thật
      onStatus("b1: Mở menu tài khoản...");
      let menuOpened = false;
      let settingsMenuLoc = this.page.locator('[role="menuitem"]:has-text("Settings"), [role="menuitem"]:has-text("Cài đặt"), p:text-is("Settings"), p:text-is("Cài đặt"), div:text-is("Settings")').first();
      for (let attempt = 0; attempt < 20; attempt++) {
        if (await settingsMenuLoc.isVisible().catch(() => false)) {
          menuOpened = true;
          break;
        }
        let av = await this.findVisibleAvatarBtn();
        if (av) {
          this.log(`Bắt được nút Avatar thật (thử ${attempt + 1}), đang bấm mở menu...`);
          await av.scrollIntoViewIfNeeded().catch(() => {});
          await av.click({ timeout: 2500 }).catch(async () => {
            await av.dispatchEvent("click").catch(() => {});
          });
          for (let w = 0; w < 6; w++) {
            await this.page.waitForTimeout(350);
            if (await settingsMenuLoc.isVisible().catch(() => false)) {
              menuOpened = true;
              break;
            }
          }
          if (menuOpened) break;
        }
        await this.page.waitForTimeout(600);
      }
      if (!menuOpened) {
        throw new S("Không mở được menu cài đặt tài khoản (không bắt được nút avatar hoặc menu không bung ra).");
      }

      // b2: Bấm Settings - chắc chắn hộp thoại Settings mở ra thật
      onStatus("b2: Bấm Settings...");
      let dialogOpened = false;
      let dialogLoc = this.page.locator('[role="dialog"]').first();
      for (let attempt = 0; attempt < 12; attempt++) {
        if (await dialogLoc.isVisible().catch(() => false)) {
          dialogOpened = true;
          break;
        }
        if (await settingsMenuLoc.isVisible().catch(() => false)) {
          this.log("Bắt được mục Settings thật, đang bấm...");
          await settingsMenuLoc.scrollIntoViewIfNeeded().catch(() => {});
          await settingsMenuLoc.click({ timeout: 3000 }).catch(async () => {
            await settingsMenuLoc.dispatchEvent("click").catch(() => {});
          });
          for (let w = 0; w < 6; w++) {
            await this.page.waitForTimeout(400);
            if (await dialogLoc.isVisible().catch(() => false)) {
              dialogOpened = true;
              break;
            }
          }
          if (dialogOpened) break;
        } else {
          let av = await this.findVisibleAvatarBtn();
          if (av) await av.click({ timeout: 2000 }).catch(() => {});
        }
        await this.page.waitForTimeout(600);
      }
      if (!dialogOpened) {
        throw new S("Không mở được hộp thoại Cài đặt (Settings).");
      }

      // b3: Bấm tab Account - chắc chắn chuyển sang tab Account thật
      onStatus("b3: Bấm tab Account...");
      let accountTabActive = false;
      let deleteAccountBtnLoc = this.page.locator('[role="dialog"]').getByText(/^Delete Account$|^Xóa tài khoản$/i).first();
      for (let attempt = 0; attempt < 12; attempt++) {
        if (await deleteAccountBtnLoc.isVisible().catch(() => false)) {
          accountTabActive = true;
          break;
        }
        let accountTab = this.page.locator('[role="dialog"]').getByText(/^Account$|^Tài khoản$/i).first();
        if (await accountTab.isVisible().catch(() => false)) {
          this.log("Bắt được tab Account thật, đang bấm...");
          await accountTab.click({ timeout: 2500 }).catch(async () => {
            await accountTab.dispatchEvent("click").catch(() => {});
          });
          for (let w = 0; w < 6; w++) {
            await this.page.waitForTimeout(400);
            if (await deleteAccountBtnLoc.isVisible().catch(() => false)) {
              accountTabActive = true;
              break;
            }
          }
          if (accountTabActive) break;
        }
        await this.page.waitForTimeout(600);
      }
      if (!accountTabActive) {
        throw new S("Không tìm thấy mục Delete Account trong tab Account.");
      }

      // b4: Bấm Delete Account - chắc chắn hiển thị nút xác nhận xóa
      onStatus("b4: Bấm Delete Account...");
      let deleteConfirmModal = false;
      let deleteConfirmBtnLoc = this.page.locator('button:has-text("Delete"), button:has-text("Xóa")').filter({ hasNotText: "Delete Account" }).first();
      for (let attempt = 0; attempt < 10; attempt++) {
        if (await deleteConfirmBtnLoc.isVisible().catch(() => false)) {
          deleteConfirmModal = true;
          break;
        }
        if (await deleteAccountBtnLoc.isVisible().catch(() => false)) {
          this.log("Bắt được nút Delete Account thật, đang bấm...");
          await deleteAccountBtnLoc.click({ timeout: 2500 }).catch(async () => {
            await deleteAccountBtnLoc.dispatchEvent("click").catch(() => {});
          });
          for (let w = 0; w < 6; w++) {
            await this.page.waitForTimeout(400);
            if (await deleteConfirmBtnLoc.isVisible().catch(() => false)) {
              deleteConfirmModal = true;
              break;
            }
          }
          if (deleteConfirmModal) break;
        }
        await this.page.waitForTimeout(600);
      }

      // b5: Xác nhận Delete
      onStatus("b5: Xác nhận Delete...");
      for (let attempt = 0; attempt < 8; attempt++) {
        if (await deleteConfirmBtnLoc.isVisible().catch(() => false)) {
          this.log("Bắt được nút Delete xác nhận thật, đang bấm...");
          await deleteConfirmBtnLoc.click({ timeout: 3000 }).catch(async () => {
            await deleteConfirmBtnLoc.dispatchEvent("click").catch(() => {});
          });
          await this.page.waitForTimeout(1500);
          break;
        }
        await this.page.waitForTimeout(500);
      }

      // b6: Xử lý xác thực liên kết Facebook OAuth (nếu mở popup)
      onStatus("b6: Xử lý xác thực liên kết Facebook...");
      for (let w = 0; w < 6; w++) {
        if (popupPage && !popupPage.isClosed()) {
          await popupPage.waitForLoadState("domcontentloaded", { timeout: 6000 }).catch(() => {});
          await this.clickFbContinue(popupPage);
        }
        await this.clickFbContinue(this.page);
        await this.page.waitForTimeout(800);
      }

      // b7: Bấm Delete Now - bắt chuẩn nút, tick checkbox và bấm nút thật
      onStatus("b7: Bấm Delete Now...");
      let clickedDeleteNow = false;
      for (let attempt = 0; attempt < 35; attempt++) {
        if (cancelConfirmed) {
          this.log("Đã phát hiện server Dola xác nhận xóa tài khoản");
          break;
        }
        if (popupPage && !popupPage.isClosed()) {
          await this.clickFbContinue(popupPage);
        }
        await this.clickFbContinue(this.page);

        let result = await this.performDeleteNow();
        if (result) {
          this.log("b7: Đã tương tác nút thật: " + result);
          if (result !== "clicked_next" && result !== "locator_next") {
            clickedDeleteNow = true;
          }
        }
        if (clickedDeleteNow) {
          await this.page.waitForTimeout(1500);
          if (cancelConfirmed) break;
        } else {
          await this.page.waitForTimeout(800);
        }
      }

      onStatus("Đang chờ server xác nhận xóa...");
      for (let w = 0; w < 12; w++) {
        if (cancelConfirmed) break;
        await this.page.waitForTimeout(600);
      }
      if (cancelConfirmed) {
        onStatus("Đã xóa tài khoản Dola cũ thành công!");
      } else {
        this.log("Tiếp tục luồng tạo nick mới...");
      }
    } finally {
      this.context.off("response", onCancelRes);
      this.context.off("page", popupHandler);
    }
  } else {
    onStatus("Chưa đăng nhập, tiến hành đăng nhập luôn...");
  }

  // Phase 2: Đăng nhập tài khoản Dola mới
  onStatus("Chuẩn bị tạo tài khoản Dola mới...");
  await this.page.waitForTimeout(1500);

  let allCookies = await this.context.cookies().catch(() => []);
  let freshFb = allCookies.filter(c => /facebook\.com/i.test(c.domain || ""));
  let keepFb = freshFb.length ? freshFb : fbCookies;
  await this.context.clearCookies();
  if (keepFb && keepFb.length) {
    let oneYear = Math.floor(Date.now() / 1000) + 365 * 86400;
    let norm = keepFb.map(c => ({
      name: c.name.trim(),
      value: c.value.trim(),
      domain: c.domain && c.domain.includes("facebook") ? c.domain : ".facebook.com",
      path: c.path || "/",
      secure: true,
      httpOnly: c.httpOnly ?? (c.name === "xs" || c.name === "datr"),
      sameSite: "Lax",
      expires: c.expires && c.expires > 0 ? Math.floor(c.expires) : (c.expirationDate && c.expirationDate > 0 ? Math.floor(c.expirationDate) : oneYear)
    }));
    await this.context.addCookies(norm);
  }

  return await this.autoLoginFacebook(keepFb, onStatus);
};static WINDOW_GONE="Tr\xECnh duy\u1EC7t c\u1EE7a t\xE0i kho\u1EA3n n\xE0y \u0111\xE3 \u0111\xF3ng (app t\u1EF1 \u0111\xF3ng khi r\u1EA3nh 3 ph\xFAt, ho\u1EB7c n\xF3 b\u1ECB t\u1EAFt). B\u1EA5m \xABKi\u1EC3m tra\xBB ho\u1EB7c t\u1EA1o video r\u1ED3i b\u1EA5m l\u1EA1i n\xFAt n\xE0y.";async showWindow(t=!0){if(!this.context||!this.page)throw new S("Tr\xECnh duy\u1EC7t c\u1EE7a profile n\xE0y ch\u01B0a ch\u1EA1y.");if(!this.alive||this.page.isClosed())throw new S(s.WINDOW_GONE);if(process.env.DOLA_HEADLESS==="new")throw new S("\u0110ang ch\u1EA1y headless th\u1EADt (DOLA_HEADLESS=new): kh\xF4ng c\xF3 c\u1EEDa s\u1ED5 \u0111\u1EC3 k\xE9o ra.");this.wantVisible=t,t&&process.platform==="win32"&&await Re(this.profileDir).catch(()=>0);try{let e=await this.context.newCDPSession(this.page),{windowId:i}=await e.send("Browser.getWindowForTarget");await e.send("Browser.setWindowBounds",t?{windowId:i,bounds:{left:80,top:60,width:1280,height:900,windowState:"normal"}}:{windowId:i,bounds:{left:-32e3,top:-32e3,width:1280,height:960,windowState:"normal"}}),t&&await e.send("Page.bringToFront").catch(()=>{})}catch(e){let i=e instanceof Error?e.message:String(e);throw/closed|crashed|Target/i.test(i)?(this.closed=!0,new S(s.WINDOW_GONE)):e}this.log(t?"\u0111\xE3 k\xE9o c\u1EEDa s\u1ED5 tr\xECnh duy\u1EC7t ra gi\u1EEFa m\xE0n h\xECnh":"\u0111\xE3 gi\u1EA5u c\u1EEDa s\u1ED5 tr\xECnh duy\u1EC7t l\u1EA1i"),t||this.hideTaskbar()}async loginInteractive(t=600){if(this.headless)throw new S("\u0110\u0103ng nh\u1EADp c\u1EA7n c\u1EEDa s\u1ED5 hi\u1EC7n, kh\xF4ng ch\u1EA1y \u0111\u01B0\u1EE3c headless.");await this.p.goto(G,{waitUntil:"domcontentloaded"}),this.log("\u0110\u0103ng nh\u1EADp trong c\u1EEDa s\u1ED5 tr\xECnh duy\u1EC7t v\u1EEBa m\u1EDF...");let e=Date.now()+t*1e3;for(;Date.now()<e;){if(await this.isLoggedIn(!1))return this.log(`\u0110\xE3 \u0111\u0103ng nh\u1EADp. Phi\xEAn \u0111\u01B0\u1EE3c l\u01B0u v\xE0o ${this.profileDir}`),await this.dismissOverlays(),!0;await E(3e3)}return!1}async newChat(){try{let u=this.p.url()||"";let hasErr=await this.p.evaluate(()=>{return document.querySelectorAll('[class*="error"], svg[class*="error"], svg[class*="alert"], [data-status="failed"], div.text-red-500, [class*="failed"]').length>0||document.querySelectorAll('[data-role="assistant"], [class*="bubble"]').length>0}).catch(()=>false);if(!hasErr&&u.includes("dola.com/chat")&&!u.includes("/chat/local_")&&!u.includes("/chat/c_")){let vis=await this.p.locator(ut).last().isVisible().catch(()=>false);if(vis){await this.p.locator(ut).last().fill("").catch(()=>{});return;}}}catch{}try{let nb=this.p.locator('a[href="/chat"], button:has-text("New Chat"), button:has-text("Đoạn chat mới")').first();if(await nb.isVisible().catch(()=>false)){await nb.click().catch(()=>{});await E(800);}}catch{}await this.p.goto(G,{waitUntil:"domcontentloaded"}),await this.p.waitForSelector(ut,{timeout:45e3}),await E(500)}async installHook(t,e,i,n){s.hookSource===null&&(s.hookSource=`f=>{const t=window.__dolaHook||(window.__dolaHook={params:null,sent:0,seen:0,lastParam:null,lastImages:null,error:null,installed:!1,videos:[],scanned:0,origParam:null,msgKeys:null,lastStatus:null,respError:null,toastError:null});if(t.params=f,t.sent=0,t.seen=0,t.lastParam=null,t.origParam=null,t.msgKeys=null,t.error=null,t.respError=null,t.toastError=null,t.lastStatus=null,t.videos=[],t.scanned=0,t.installed)return"reused";const m=window.fetch;t.installed=!0;try{if(!window.__dolaToastObs){window.__dolaToastObs=new MutationObserver(M=>{for(let mr of M)for(let nd of mr.addedNodes)if(nd.nodeType===1){let tx=(nd.innerText||"").trim();if(tx&&tx.length<300){let c=String(nd.className||"").toLowerCase();if(/toast|alert|notification|notice|feedback|modal|popover/i.test(c)||nd.getAttribute("role")==="alert")if(/error|fail|wrong|limit|banned|quá|lỗi|không thể|thất bại|vi phạm|something went wrong|try again|chặn|hết lượt/i.test(tx))t.toastError=tx}}});window.__dolaToastObs.observe(document.body,{childList:!0,subtree:!0})}}catch{}const u=/https?:\\/\\/[^"'\\s]+mime_type=video_mp4[^"'\\s]*/g,p="\\\\";
function toClean(x){return String(x||"").replace(/([?&])lr=watermarked\b/gi,"$1lr=unwatermarked").replace(/([?&])logo_type=(?:watermarked|wm)\b/gi,"$1logo_type=unwatermarked")}
function addVid(x){if(!x||typeof x!="string")return;let n=toClean(x.split(p+"u0026").join("&").split(p+"/").join("/"));if(t.videos.indexOf(n)===-1){(n.includes("unwatermarked")||n.includes("lr=unwatermarked"))?t.videos.unshift(n):t.videos.push(n)}}
const QAAB_SALT=[0x4d,0xd4,0xc2,0xe6,0xb8,0x31,0x62,0x09,0x0e,0x52,0xb3,0xc7,0xa6,0x73,0x3b,0xa4];
function b64Dec(tx){try{let pad=(4-(tx.length%4))%4,norm=(tx+"=".repeat(pad)).replace(/-/g,"+").replace(/_/g,"/"),bin=atob(norm),res=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)res[i]=bin.charCodeAt(i);return res}catch{return null}}
function stripP7(b){if(!b||!b.length)return new Uint8Array();let pad=b[b.length-1];if(pad<1||pad>16||pad>b.length)return b;for(let i=b.length-pad;i<b.length;i++)if(b[i]!==pad)return b;return b.slice(0,b.length-pad)}
function toUrl(b){if(!b||!b.length)return"";for(let x of b)if(x!==9&&x!==10&&x!==13&&(x<32||x>126))return"";return new TextDecoder().decode(b)}
async function decodeQaab(tok,seed){try{let d=b64Dec(tok),s=b64Dec(seed);if(!d||!s)return"";let d1=await crypto.subtle.digest("SHA-512",s.slice(0,32)),sl=new Uint8Array(QAAB_SALT),d2in=new Uint8Array(d1.byteLength+sl.length);d2in.set(new Uint8Array(d1),0);d2in.set(sl,d1.byteLength);let d2=new Uint8Array(await crypto.subtle.digest("SHA-512",d2in)),key=d2.slice(0,16),iv=d2.slice(16,32),pay=d;if(d.length>=4&&d[0]===0xa8&&d[1]===0x00&&d[2]===0x01&&d[3]===0x00){pay=d.slice(4);if(d.length>36){iv=d.slice(20,36);pay=d.slice(36);}}let k=await crypto.subtle.importKey("raw",key,"AES-CBC",false,["decrypt"]),plain=new Uint8Array(await crypto.subtle.decrypt({name:"AES-CBC",iv},k,pay)),res=toUrl(plain);if(!res.startsWith("http"))res=toUrl(stripP7(plain));return res.startsWith("http")?res:""}catch{return""}}
const seenFb=new Set();
function trigFb(fb,seed){if(!fb||seenFb.has(fb))return;seenFb.add(fb);try{let tg=fb.replace(/\\u0026/g,"&").replace(/\\\//g,"/");if(!tg.startsWith("http"))return;let u0=new URL(tg);u0.searchParams.set("channel","no");u0.searchParams.set("codec_type","8");u0.searchParams.set("logo_type","unwatermarked");fetch(u0.toString(),{credentials:"omit"}).then(r=>r.json()).then(async pl=>{let info=pl?.video_info||pl?.data?.video_info||pl?.data||pl,list=info?.video_list?Object.values(info.video_list):[info],best=null;for(let it of list){let tk=it?.main_url||it?.play_url||"";if(typeof tk==="string"&&tk.trim()){let sc=Number(it.bitrate||it.real_bitrate||0);if(!best||sc>best.sc)best={tk:tk.trim(),sc}}}if(best){let ks=seed||pl?.key_seed||info?.key_seed||t.keySeed||"",rl=best.tk.startsWith("http")?best.tk:(best.tk.startsWith("qAAB")?await decodeQaab(best.tk,ks):dec(best.tk));if(rl)addVid(rl)}}).catch(()=>{})}catch{}}
t.triggerFb=trigFb;
function dec(v){if(!v||typeof v!="string")return"";if(v.startsWith("http://")||v.startsWith("https://"))return v;try{let pad=(4-(v.length%4))%4;let s=atob(v.replace(/-/g,"+").replace(/_/g,"/")+"=".repeat(pad));return(s.startsWith("http://")||s.startsWith("https://"))?s:"";}catch(e){return"";}}
function g(s){
  let ksm=s.match(/["']key_seed["'][ \t]*:[ \t]*["']([^"']+)["']|(?:^|[?&])key_seed=([^&"'<>\\s]+)/);
  if(ksm)t.keySeed=ksm[1]||ksm[2];
  let fam=s.matchAll(/"fallback_api"[ \t]*:[ \t]*"([^"]+)"/g);
  for(let m of fam){try{trigFb(JSON.parse('"'+m[1]+'"'),t.keySeed)}catch{}}
  let a,q=/"(?:ma[i]?n_url|play_url|video_url|download_url|src)"[ \t]*:[ \t]*"([^"]+)"/g;
  while((a=q.exec(s))!==null){
    let raw=a[1];
    if(raw.startsWith("qAAB")){if(t.keySeed)decodeQaab(raw,t.keySeed).then(u=>{if(u)addVid(u)})}
    else{let c=dec(raw);if(c&&(c.includes("unwatermarked")||c.includes("video_mp4")||c.includes("/video/tos/")))addVid(c)}
  }
  for(u.lastIndex=0;(a=u.exec(s))!==null;)addVid(a[0]);
}
t.scanForUrls=g;function h(s){try{const a=(s.headers.get("content-type")||"").toLowerCase();if(!/json|text|event-stream/.test(a))return;const n=s.clone().body;if(!n||!n.getReader)return;t.scanned+=1;const d=n.getReader(),y=new TextDecoder;let o="";const l=()=>{d.read().then(e=>{if(!e.done){o+=y.decode(e.value,{stream:!0});g(o);if(!t.respError){let em=o.match(/"(?:error_code|code)"[ \t]*:[ \t]*([1-9]\d*)/);if(em&&em[1]!=="0"){let msg=o.match(/"(?:message|msg|err_msg|error)"[ \t]*:[ \t]*"([^"]+)"/i);t.respError="Dola báo lỗi: "+(msg?msg[1]:("mã lỗi "+em[1]));}}
try{let bm=[...o.matchAll(/"brief"\s*:\s*"([^"]+)"/g)];if(bm.length){let b=bm[bm.length-1][1];try{b=JSON.parse('"'+b+'"');}catch{}if(b&&b.trim().length>0)t.dolaReply=b.trim();}if(!t.dolaReply){let tb=[...o.matchAll(/"text_block"\s*:\s*\{\s*"text"\s*:\s*"([^"]+)"/g)];if(tb.length){let parts=[];for(let m of tb){let tx=m[1];try{tx=JSON.parse('"'+tx+'"');}catch{}if(tx&&!parts.includes(tx))parts.push(tx);}if(parts.length){let comb=parts.join("").trim();if(comb.length>(t.dolaReply||"").length)t.dolaReply=comb;}}}}catch{}o.length>262144&&(o=o.slice(-8192));l();}}).catch(()=>{})};l()}catch{}}return window.fetch=function(s,a){let n="";try{n=typeof s=="string"?s:s&&s.url||""}catch{}const d=String(a&&a.method||s&&s.method||"GET").toUpperCase(),y=/\\/(chat\\/completion|message|conversation|history|poll|chain)/i.test(String(n));if(!(d==="POST"&&/\\/chat\\/completion/.test(String(n))&&a&&typeof a.body=="string")){const e=m.apply(this,arguments);return!y||!e||typeof e.then!="function"?e:e.then(r=>(h(r),r))}let l=a;try{const e=JSON.parse(a.body),r=e&&e.chat_ability;if(r&&r.ability_type===17&&typeof r.ability_param=="string"){t.seen+=1,t.origParam=r.ability_param;try{t.msgKeys=Object.keys(e).concat((e.chat_ability?Object.keys(e.chat_ability):[]).map(function(c){return"chat_ability."+c}))}catch{t.msgKeys=null}const i=JSON.parse(r.ability_param);t.params.model&&(i.model=t.params.model),t.params.duration&&(i.duration=t.params.duration),t.params.ratio&&(i.ratio=t.params.ratio),r.ability_param=JSON.stringify(i),t.lastParam=r.ability_param;try{const b=JSON.stringify(e.messages||[]).match(/tos-[a-z0-9-]+\\/[a-f0-9]{8,}/g)||[];t.lastImages=Array.from(new Set(b)).slice(0,5)}catch{t.lastImages=null}if(t.sent+=1,l=Object.assign({},a,{body:JSON.stringify(e)}),t.params.dryRun)return Promise.resolve(new Response('{"dry_run":true}',{status:200,headers:{"Content-Type":"application/json"}}))}else{t.sent+=1,t.seen+=1}}catch(e){return t.error=String(e),m.apply(this,arguments)}return m.call(this,s,l).then(e=>{t.lastStatus=e.status;if(!e.ok){t.respError=e.status===429?"Dola báo quá tải hoặc bị giới hạn tần suất (HTTP 429)":e.status===401?"Văng acc do chưa gắn proxy":e.status===403?"Dola từ chối truy cập hoặc yêu cầu xác minh Captcha (HTTP 403)":("Máy chủ Dola báo lỗi HTTP "+e.status);}return h(e),e;}).catch(err=>{t.respError="Lỗi kết nối khi gửi tới Dola: "+(err?.message||String(err));throw err;})},"installed"}`);let r=JSON.stringify({model:t,duration:e,ratio:i,dryRun:n}),o=await this.p.evaluate(`(${s.hookSource}
)(${r})`);this.log(`hook: ${o} (model=${t} duration=${e} ratio=${i||"default"})`)}async videoModeOn(){return await this.p.evaluate(({Gi,qi})=>{if(document.querySelector(Gi)||document.querySelector('[data-input-engine-actionbar-control-key*="video"]')||document.querySelector('[data-input-engine-actionbar-control-key="video-model"]'))return true;let phs=[...document.querySelectorAll("[data-placeholder],[placeholder]")].map(el=>(el.getAttribute("data-placeholder")||el.getAttribute("placeholder")||"").toLowerCase());if(phs.some(p=>p.includes("describe the actions in the video")||p.includes("mô tả các hành động trong video")||p.includes("hành động trong video")||(p.includes("video")&&!p.includes("nhắn tin")&&!p.includes("message"))))return true;let vb=document.querySelector('[data-skill-id="skill_bar_button_17"]');if(vb&&(vb.getAttribute("data-checked")==="true"||vb.getAttribute("aria-pressed")==="true"||vb.classList.contains("active")||vb.classList.contains("selected")))return true;return false;},{Gi,qi}).catch(()=>!1)}videoChip(){return this.p.locator(Vi).first()}async dismissOverlays(){try{let t=this.p.getByText(/^\s*(ok|accept|accept all|got it|đồng ý)\s*$/i).first();await t.isVisible().catch(()=>!1)&&(await t.click({timeout:2000}).catch(()=>{}),await E(300));}catch{}try{await this.p.evaluate(()=>{let btns=[...document.querySelectorAll("button")].filter(b=>/^(ok|đồng ý|accept|got it)$/i.test((b.textContent||"").trim()));btns.forEach(b=>{try{b.click()}catch{}})}).catch(()=>{});}catch{}await this.clickAgeConfirm().catch(()=>{});}async chanDoan(){try{let t=await this.p.evaluate(()=>({w:window.innerWidth,h:window.innerHeight,url:location.href,composer:!!document.querySelector("[data-placeholder]"),skills:[...document.querySelectorAll("[data-skill-id]")].map(e=>e.getAttribute("data-skill-id")),chu:[...new Set([...document.querySelectorAll("div,span,button")].filter(e=>e.children.length===0).map(e=>(e.textContent||"").trim()).filter(e=>e.length>0&&e.length<22))].slice(0,22)}));return`viewport ${t.w}x${t.h}, c\xF3 composer=${t.composer}, url=${t.url}, skill-id tr\xEAn trang: ${JSON.stringify(t.skills)}, ch\u1EEF tr\xEAn trang: ${JSON.stringify(t.chu)}`}catch{return"kh\xF4ng \u0111\u1ECDc \u0111\u01B0\u1EE3c tr\u1EA1ng th\xE1i trang"}}async enableVideoMode(t=20){if(await this.videoModeOn()){this.log("chế độ video đã được bật sẵn");return;}await this.dismissOverlays();for(let e=1;e<=2;e++){let i=this.p.locator('[data-skill-id="skill_bar_button_17"], button:has-text("Tạo video"), button:has-text("Create Videos")').first();if(!await i.isVisible().catch(()=>!1)){let r=this.p.locator('[data-slot="dropdown-menu-trigger"]').last();await r.isVisible().catch(()=>!1)&&(await r.click().catch(()=>{}),await E(500))}let n=!1;try{await i.click({timeout:3000}),n=!0}catch{try{await i.click({timeout:2000,force:!0}),n=!0}catch{n=await this.p.evaluate(()=>{let b=document.querySelector('[data-skill-id="skill_bar_button_17"]')||[...document.querySelectorAll("button")].find(el=>{let tx=(el.textContent||"").trim();return tx==="Tạo video"||tx==="Create Videos"});if(b){b.click();return true}return false}).catch(()=>!1)}}if(n){let r=Date.now()+t*1e3;for(;Date.now()<r;)if(await E(500),await this.videoModeOn())return}if(e===1){this.log("chưa bật được chế độ video, tải lại trang rồi thử lại...");await this.p.reload({waitUntil:"domcontentloaded"}).catch(()=>{});await E(3000);await this.dismissOverlays();}}throw new S("Không bật được chế độ Create Videos. "+await this.chanDoan())}async attachImages(t){for(let n of t)if(!O.default.existsSync(n))throw new S(`Kh\xF4ng t\xECm th\u1EA5y \u1EA3nh: ${n}`);let e=await this.p.evaluate(()=>document.querySelectorAll("img").length);await this.p.setInputFiles("input[type=file]",t);let i=Date.now()+9e4;for(;Date.now()<i;)if(await E(1e3),await this.p.evaluate(()=>document.querySelectorAll("img").length)>e){await E(2e3),this.log(`\u0111\xE3 \u0111\xEDnh ${t.length} \u1EA3nh`);return}throw new S("\u1EA2nh kh\xF4ng l\xEAn \u0111\u01B0\u1EE3c composer sau 90 gi\xE2y.")}async fillComposer(t){let e=this.p.locator(ut).last();await e.click();let i=t.split(`
`);for(let r=0;r<i.length;r++)r&&await this.p.keyboard.press("Shift+Enter"),i[r]&&await this.p.keyboard.insertText(i[r]);await E(300);let n=(await e.innerText()).trim();if(n.length<t.trim().length*.9)throw new S(`Composer ch\u1EC9 nh\u1EADn ${n.length}/${t.trim().length} k\xFD t\u1EF1 - prompt b\u1ECB c\u1EAFt, kh\xF4ng g\u1EEDi.`)}async creditsLeft(){let t=(await this.p.innerText("body")).match(Xi);return t?Number(t[1]):null}async generate(t){let e=nn(t.model??"2.5"),i=t.duration??30,n=t.ratio??null;if(n&&!gt.includes(n))throw new S(`ratio ph\u1EA3i thu\u1ED9c ${gt.join(" ")}`);let r={prompt:t.prompt,model:e,duration:i,ratio:n,path:null,video_seconds:null,credits_left:null,conversation_url:null,error:null,dola_response:null};this.onStage("compose","\u0110ang m\u1EDF trang t\u1EA1o video c\u1EE7a Dola",22),await this.newChat(),await this.installHook(e,i,n,!!t.dryRun),t.mode!=="pro"&&(this.onStage("compose","\u0110ang b\u1EADt ch\u1EBF \u0111\u1ED9 t\u1EA1o video",26),await this.enableVideoMode()),t.images&&t.images.length&&(this.onStage("compose",`\u0110ang \u0111\xEDnh ${t.images.length} \u1EA3nh tham chi\u1EBFu`,30),await this.attachImages(t.images)),this.onStage("sending","\u0110ang g\u1EEDi y\xEAu c\u1EA7u l\xEAn Dola",35),await this.fillComposer(t.prompt),await E(400);let o=await this.p.evaluate(()=>[...document.querySelectorAll("video")].map(c=>c.currentSrc||c.src||"").filter(Boolean)),a=t.prompt.split(`
`).find(c=>c.trim())?.trim().slice(0,60)??"";
let cdpResHandler=async(res)=>{try{let ct=(res.headers()["content-type"]||"").toLowerCase();let url=res.url()||"";if(/json|text|event-stream/.test(ct)){let txt=await res.text().catch(()=>"");if(txt){if(/fallback_api|main_url|play_url|key_seed|video_url|video_mp4|mime_type=video_mp4|creation/i.test(txt)){await this.p.evaluate((s)=>{window.__dolaHook?.scanForUrls?.(s)},txt).catch(()=>{});}if(url.includes("/chat/completion")||url.includes("/im/chain/")){await this.p.evaluate((s)=>{try{let bm=[...s.matchAll(/"brief"\s*:\s*"([^"]+)"/g)];if(bm.length){let val=bm[bm.length-1][1];try{val=JSON.parse('"'+val+'"');}catch{}if(val&&val.trim().length>0){window.__dolaHook=window.__dolaHook||{};window.__dolaHook.dolaReply=val.trim();}}let tb=[...s.matchAll(/"text_block"\s*:\s*\{\s*"text"\s*:\s*"([^"]+)"/g)];if(tb.length){let parts=[];for(let m of tb){let t=m[1];try{t=JSON.parse('"'+t+'"');}catch{}if(t&&!parts.includes(t))parts.push(t);}if(parts.length){let comb=parts.join("").trim();if(comb.length>((window.__dolaHook&&window.__dolaHook.dolaReply)||'').length){window.__dolaHook=window.__dolaHook||{};window.__dolaHook.dolaReply=comb;}}}}catch{}},txt).catch(()=>{});}}}}catch{}};
this.p.on("response",cdpResHandler);
await this.p.locator(ut).last().press("Enter");try{await this.p.waitForFunction(()=>window.__dolaHook&&window.__dolaHook.sent>0,null,{timeout:2e4})}catch{return r.error="Kh\xF4ng b\u1EAFt \u0111\u01B0\u1EE3c request t\u1EA1o video. C\xF3 th\u1EC3 trang t\u1EA1o video \u0111\xE3 \u0111\u1ED5i c\u1EA5u tr\xFAc (ability_type != 17) ho\u1EB7c tin nh\u1EAFn ch\u01B0a \u0111\u01B0\u1EE3c g\u1EEDi.",r}await E(1200);let hk=await this.p.evaluate(()=>{let c=window.__dolaHook||{};return c.respError||c.toastError||null}).catch(()=>null);if(hk){if(/401|phiên đăng nhập|văng acc|chưa gắn proxy/i.test(hk))hk="Văng acc do chưa gắn proxy";return this.log(`Dola b\xE1o l\u1ED7i ngay sau khi g\u1EEDi: ${hk}`),r.error=hk,r;}let si0=await this.sessionInfo().catch(()=>null);if(si0&&!si0.loggedIn)return this.log("Văng acc do chưa gắn proxy ngay sau khi gửi"),r.error="Văng acc do chưa gắn proxy",r;r.conversation_url=this.p.url(),t.onSent?.(r.conversation_url),this.onStage("sent","Dola \u0111\xE3 nh\u1EADn y\xEAu c\u1EA7u, \u0111ang x\u1EED l\xFD",40);
try{for(let attempt=0;attempt<6;attempt++){let initReply=await this.p.evaluate(({key:x})=>{let c=window.__dolaHook||{};if(c.dolaReply&&c.dolaReply.trim().length>0)return c.dolaReply.trim();let f=null;if(x){let D=[...document.querySelectorAll("div,p,span,section,article")].filter(at=>at.innerText&&at.innerText.includes(x));D.length&&(f=D.reduce((at,ce)=>at.innerText.length<=ce.innerText.length?at:ce));}let botRows=[...document.querySelectorAll('.v_list_row, [data-target-id="message-box-target-id"], [data-message-id]')].filter(r=>r.querySelector('[data-foundation-type="receive-message-action-bar"]'));if(f&&botRows.length>0){let afterRows=botRows.filter(r=>!f.contains(r)&&(f.compareDocumentPosition(r)&Node.DOCUMENT_POSITION_FOLLOWING));if(afterRows.length>0)botRows=afterRows;}if(botRows.length>0){let lastBotRow=botRows[botRows.length-1];let textEl=lastBotRow.querySelector('.container-enLQFx, .container-fBOrXO, .md-box-root, [data-container-type="block-v2"] [data-plugin-identifier="block_type:10000"], [data-container-type="block-v2"]');if(textEl){let t=(textEl.innerText||textEl.textContent||"").trim();if(t&&t.length>0)return t;}}let textEls=[...document.querySelectorAll('.container-enLQFx, [data-container-type="block-v2"] [data-plugin-identifier="block_type:10000"], .md-box-root')];if(f&&textEls.length>0){let afterEls=textEls.filter(el=>!f.contains(el)&&(f.compareDocumentPosition(el)&Node.DOCUMENT_POSITION_FOLLOWING));if(afterEls.length>0)textEls=afterEls;}if(textEls.length>0){let lastEl=textEls[textEls.length-1];let t=(lastEl.innerText||lastEl.textContent||"").trim();if(t&&t.length>0)return t;}let pEls=[...document.querySelectorAll('p,[class*="prose"] p')].filter(el=>!f||(f.compareDocumentPosition(el)&Node.DOCUMENT_POSITION_FOLLOWING));let txts=pEls.map(el=>(el.innerText||"").trim()).filter(Boolean);return txts.length?txts.join("\n"):(c.respError||null);},{key:a}).catch(()=>null);if(initReply){r.dola_response=initReply;t.onReply?.(initReply);this.log(`Phản hồi từ Dola: "${initReply.slice(0, 100)}..."`);break;}await E(600);}}catch{}let l=await this.p.evaluate(()=>{let c=window.__dolaHook||{};return{sent:c.lastParam,orig:c.origParam}});if(this.log(`\u0111\xE3 g\u1EEDi: ${l.sent}`),l.orig&&l.orig!==l.sent&&this.log(`Dola v\u1ED1n \u0111\u1ECBnh g\u1EEDi: ${l.orig}`),t.images&&t.images.length){let c=await this.p.evaluate(()=>window.__dolaHook.lastImages);if(this.log(`\u1EA3nh trong request: ${JSON.stringify(c)}`),!c||!c.length)return r.error="Request \u0111i m\xE0 kh\xF4ng k\xE8m \u1EA3nh n\xE0o - upload ch\u01B0a g\u1EAFn v\xE0o tin nh\u1EAFn.",r}if(t.dryRun)return this.log("dry-run: request b\u1ECB ch\u1EB7n t\u1EA1i client, kh\xF4ng t\u1ED1n credit."),r;r.credits_left=await this.waitForCreditLine(),this.clampedTo=null;try{let c=await this.waitForVideo(t.waitMinutes??20,o,a,rep=>{r.dola_response=rep;t.onReply?.(rep);});if(!c)return r.error=`H\u1EBFt ${t.waitMinutes??20} ph\xFAt m\xE0 video ch\u01B0a xu\u1EA5t hi\u1EC7n.`,r.credits_left=await this.creditsLeft()??r.credits_left,r;try{if(typeof cdpResHandler==="function")this.p.off("response",cdpResHandler)}catch{}
let cleanVidUrl=String(c.src||"").replace(/([?&])lr=watermarked\b/gi,"$1lr=unwatermarked").replace(/([?&])logo_type=(?:watermarked|wm)\b/gi,"$1logo_type=unwatermarked");
if(cleanVidUrl!==c.src){try{let hres=await this.context.request.head(cleanVidUrl,{timeout:6000});if(hres.ok()){this.log("đã chuyển đổi sang link sạch không watermark: "+cleanVidUrl.slice(0,60)+"…");c.src=cleanVidUrl;}}catch{}}
r.video_seconds=c.duration,r.video_url=c.src,r.credits_left=await this.creditsLeft()??r.credits_left;let d=t.filename||`${Je()}-${Ne(t.prompt)}.mp4`;r.path=await this.download(c.src,dt.default.join(t.outDir||this.outputDir,d))}catch(c){if(!(c instanceof S))throw c;r.error=c.message}return r}async recover(t){let e={prompt:t.prompt,model:"",duration:0,ratio:null,path:null,video_seconds:null,credits_left:null,conversation_url:t.url,video_url:t.videoUrl??null,error:null},i=()=>dt.default.join(t.outDir||this.outputDir,t.filename||`${Je()}-${Ne(t.prompt)}.mp4`);if(t.videoUrl&&t.videoUrl.startsWith("http")){this.log("th\u1EED t\u1EA3i l\u1EA1i b\u1EB1ng \u0111\u01B0\u1EDDng d\u1EABn video \u0111\xE3 l\u01B0u t\u1EEB l\u1EA7n tr\u01B0\u1EDBc"),this.onStage("downloading","\u0110ang t\u1EA3i l\u1EA1i b\u1EB1ng \u0111\u01B0\u1EDDng d\u1EABn video \u0111\xE3 l\u01B0u (kh\xF4ng m\u1EDF l\u1EA1i trang)",88);try{return e.path=await this.download(t.videoUrl,i()),e}catch(r){this.log(`\u0111\u01B0\u1EDDng d\u1EABn c\u0169 kh\xF4ng t\u1EA3i \u0111\u01B0\u1EE3c (${r instanceof Error?r.message:r}) - m\u1EDF l\u1EA1i cu\u1ED9c tr\xF2 chuy\u1EC7n`)}}this.log(`m\u1EDF l\u1EA1i ${t.url}`),this.onStage("compose","\u0110ang m\u1EDF l\u1EA1i cu\u1ED9c tr\xF2 chuy\u1EC7n tr\xEAn Dola \u0111\u1EC3 t\xECm video",30),await this.p.goto(t.url,{waitUntil:"domcontentloaded"}),await E(3e3),await this.p.evaluate(()=>{window.__dolaHook={videos:[]}});let n=t.prompt.split(`
`).find(r=>r.trim())?.trim().slice(0,60)??"";this.clampedTo=null;try{let r=await this.waitForVideo(t.waitMinutes??5,[],n);if(!r)return e.error=`M\u1EDF l\u1EA1i cu\u1ED9c tr\xF2 chuy\u1EC7n nh\u01B0ng sau ${t.waitMinutes??5} ph\xFAt v\u1EABn kh\xF4ng th\u1EA5y video n\xE0o c\u1EE7a m\xECnh.`,e;e.video_seconds=r.duration,e.video_url=r.src,e.credits_left=await this.creditsLeft(),e.path=await this.download(r.src,i())}catch(r){if(!(r instanceof S))throw r;e.error=r.message}return e}async waitForCreditLine(t=45){let e=Date.now()+t*1e3;for(;Date.now()<e;){let i=await this.creditsLeft();if(i!==null)return i;await E(2e3)}return null}clampedTo=null;async refusalText(){let hk=await this.p.evaluate(()=>{let c=window.__dolaHook||{};return c.toastError||c.respError||null}).catch(()=>null);if(hk)return hk;let t;try{t=await this.p.innerText("body")}catch{return null}if(/verify to continue|drag the slider|security verification|x\xE1c minh b\u1EA3o m\u1EADt|tr\u01B0\u1EE3t \u0111\u1EC3/i.test(t)||await this.p.locator('iframe[src*="captcha"], [id*="captcha"], div[class*="secsdk"]').count().catch(()=>0)>0)return"Dola y\xEAu c\u1EA7u x\xE1c minh Captcha. H\xE3y m\u1EDF c\u1EEDa s\u1ED5 t\xE0i kho\u1EA3n \u0111\u1EC3 gi\u1EA3i Captcha.";let e=Yi(t);return e.accepted&&e.clampSeconds&&this.clampedTo!==e.clampSeconds&&(this.clampedTo=e.clampSeconds,this.log(`Dola ch\u1EC9 nh\u1EADn t\u1ED1i \u0111a ${e.clampSeconds} gi\xE2y cho ki\u1EC3u video n\xE0y, \u0111\xE3 t\u1EF1 h\u1EA1 xu\u1ED1ng ${e.clampSeconds}s v\xE0 v\u1EABn render - ti\u1EBFp t\u1EE5c ch\u1EDD, kh\xF4ng g\u1EEDi l\u1EA1i`)),e.refusal}async videoFromHook(){let t;try{t=await this.p.evaluate(()=>window.__dolaHook&&window.__dolaHook.videos||[])}catch{return null}if(!t.length)return null;let u=t.find(i=>i.includes("unwatermarked")||i.includes("lr=unwatermarked"));if(u)return u;let e=new Map;for(let i of t){let n=i.split("?")[0],r=e.get(n);(!r||i.length>r.length)&&e.set(n,i)}return[...e.values()][0]??null}async waitForVideo(t,e=[],i="",onReply=null){let lastRep=null;let n=Date.now()+t*6e4,r=Date.now()+6e4,o=Date.now(),a=0,l=h=>{let p=(Date.now()-o)/1e3,y=40+Math.round(45*Math.min(1,p/Math.max(60,this.renderAvgS))),x=Math.max(0,Math.ceil((n-Date.now())/6e4));this.onStage("rendering",`Dola \u0111ang d\u1EF1ng video \xB7 ch\u1EDD t\u1ED1i \u0111a ${x} ph\xFAt n\u1EEFa${h?" \xB7 "+h:""}`,y)};l("");let c=0,d=!1,u={cards:0,all:0};for(;;){if(Date.now()>=n){if(d||!this.page)break;d=!0,this.log("h\u1EBFt gi\u1EDD ch\u1EDD - t\u1EA3i l\u1EA1i trang v\xE0 d\xF2 th\xEAm m\u1ED9t l\u01B0\u1EE3t cu\u1ED1i tr\u01B0\u1EDBc khi b\u1ECF cu\u1ED9c"),this.onStage("rendering","H\u1EBFt gi\u1EDD ch\u1EDD - t\u1EA3i l\u1EA1i trang Dola v\xE0 d\xF2 th\xEAm m\u1ED9t l\u01B0\u1EE3t cu\u1ED1i",85),await this.p.reload({waitUntil:"domcontentloaded"}).catch(()=>{}),await E(4e3),await this.p.evaluate(()=>{window.__dolaHook=window.__dolaHook||{videos:[]}}).catch(()=>{}),n=Date.now()+tn,c=0}let h=await this.videoFromHook();if(h){await this.p.evaluate(()=>document.querySelectorAll("video, audio").forEach(x=>{x.muted=!0;x.volume=0;try{x.pause()}catch{}})).catch(()=>{});return this.log(`video m\u1EDBi xu\u1EA5t hi\u1EC7n (b\u1EAFt t\u1EEB response: ${h.slice(0,60)}\u2026)`),{src:h,duration:null};}let si=await this.sessionInfo().catch(()=>null),curUrl=(this.p?this.p.url():"")||"",isLoginBtn=await this.p.evaluate(()=>{let b=[...document.querySelectorAll("button, a")];return b.some(x=>{let t=(x.textContent||"").trim().toLowerCase();return t==="log in"||t==="sign in"||t==="login"||t==="đăng nhập"})}).catch(()=>!1);if((si&&!si.loggedIn)||isLoginBtn||/\/(login|signin|passport)/i.test(curUrl))throw new S("Văng acc do chưa gắn proxy");let p=null;try{p=await this.p.evaluate(({baseline:y,key:x})=>{let N=[...document.querySelectorAll("video")],g=N.map(D=>({el:D,src:D.currentSrc||D.src||"",duration:D.duration||null})).filter(D=>D.src&&!y.includes(D.src)),f=null;if(x){let D=[...document.querySelectorAll("div,p,span,section,article")].filter(at=>at.innerText&&at.innerText.includes(x));D.length&&(f=D.reduce((at,ce)=>at.innerText.length<=ce.innerText.length?at:ce))}document.querySelectorAll("[data-dola-pick]").forEach(D=>D.removeAttribute("data-dola-pick"));let _=[...document.querySelectorAll('[class*="block-video"]')];_.length||(_=[...document.querySelectorAll("div")].filter(D=>D.querySelector("img")&&D.querySelector('[class*="play-icon"], svg[class*="play"]')));
let I=_.filter(D=>!f||!!(f.compareDocumentPosition(D)&Node.DOCUMENT_POSITION_FOLLOWING)),X=I.filter(D=>!D.querySelector("video")&&!D.hasAttribute("data-dola-clicked"));
X.length&&X[0].setAttribute("data-dola-pick","1");
for(let card of I){let fk=Object.keys(card).find(k=>k.startsWith('__reactFiber')||k.startsWith('__reactInternalInstance'));if(!fk)continue;let curr=card[fk];while(curr){let cr=curr.memoizedProps?.creationsVideoList;if(Array.isArray(cr))for(let it of cr){let vm=typeof it?.video?.video_model==='string'?(()=>{try{return JSON.parse(it.video.video_model)}catch{return null}})():it?.video?.video_model;if(vm?.fallback_api&&window.__dolaHook?.triggerFb)window.__dolaHook.triggerFb(vm.fallback_api,vm.key_seed);}curr=curr.return;}}
let errEls=[...document.querySelectorAll('[class*="error"], svg[class*="error"], svg[class*="alert"], [data-status="failed"], div.text-red-500, [class*="failed"]')];let btnErrs=[...document.querySelectorAll("button")].filter(b=>/try again|thử lại/i.test(b.innerText||""));errEls.push(...btnErrs);
let recentErrs=errEls.filter(el=>!f||!!(f.compareDocumentPosition(el)&Node.DOCUMENT_POSITION_FOLLOWING));
let domErr=null;
if(recentErrs.length>0){let el=recentErrs[0],t=(el.innerText||"").trim();domErr=(t&&t.length<300)?t:"Dola báo lỗi trên tin nhắn (icon cảnh báo đỏ)";}
let dolaReply=(window.__dolaHook&&window.__dolaHook.dolaReply)||null;
if(!dolaReply){let botRows=[...document.querySelectorAll('.v_list_row, [data-target-id="message-box-target-id"], [data-message-id]')].filter(r=>r.querySelector('[data-foundation-type="receive-message-action-bar"]'));if(f&&botRows.length>0){let afterRows=botRows.filter(r=>!f.contains(r)&&(f.compareDocumentPosition(r)&Node.DOCUMENT_POSITION_FOLLOWING));if(afterRows.length>0)botRows=afterRows;}if(botRows.length>0){let lastBotRow=botRows[botRows.length-1];let textEl=lastBotRow.querySelector('.container-enLQFx, .container-fBOrXO, .md-box-root, [data-container-type="block-v2"] [data-plugin-identifier="block_type:10000"], [data-container-type="block-v2"]');if(textEl){let t=(textEl.innerText||textEl.textContent||"").trim();if(t&&t.length>0)dolaReply=t;}}if(!dolaReply){let textEls=[...document.querySelectorAll('.container-enLQFx, [data-container-type="block-v2"] [data-plugin-identifier="block_type:10000"], .md-box-root')];if(f&&textEls.length>0){let afterEls=textEls.filter(el=>!f.contains(el)&&(f.compareDocumentPosition(el)&Node.DOCUMENT_POSITION_FOLLOWING));if(afterEls.length>0)textEls=afterEls;}if(textEls.length>0){let lastEl=textEls[textEls.length-1];let t=(lastEl.innerText||lastEl.textContent||"").trim();if(t&&t.length>0)dolaReply=t;}}}
if(!dolaReply&&f){let textCandidates=[...document.querySelectorAll('p, [class*="markdown"], [class*="prose"], [class*="content"], [class*="bubble"], [class*="chat-item"], [data-role="assistant"]')];let afterNodes=textCandidates.filter(el=>!f.contains(el)&&(f.compareDocumentPosition(el)&Node.DOCUMENT_POSITION_FOLLOWING));let parts=[];for(let el of afterNodes){if(el.closest('[class*="block-video"], [class*="video-player"], button, svg, [class*="action"]'))continue;let t=(el.innerText||"").trim();if(!t||t.length<2)continue;if(/^(try again|thử lại|copy|sao chép|regenerate|xóa|share|chia sẻ|download|tải về)$/i.test(t))continue;if(!parts.some(p=>p.includes(t)||t.includes(p)))parts.push(t);}if(parts.length)dolaReply=parts.join("\n");}
if(!dolaReply)dolaReply=domErr||window.__dolaHook?.respError||null;
let q={all:N.length,fresh:g.length,anchorFound:!!f,freshBeforeAnchor:0,cards:I.length,needClick:X.length>0,domErr,dolaReply};if(!g.length)return{...q,pick:null};if(!f)return{...q,pick:{src:g[0].src,duration:g[0].duration}};let kt=g.filter(D=>!f||!!(f.compareDocumentPosition(D.el)&Node.DOCUMENT_POSITION_FOLLOWING));return{...q,freshBeforeAnchor:g.length-kt.length,pick:kt.length?{src:kt[0].src,duration:kt[0].duration}:null}},{baseline:e,key:i});if(p?.dolaReply&&p.dolaReply!==lastRep){lastRep=p.dolaReply;try{onReply?.(lastRep)}catch{}}}catch{p=null}if(p&&(u.cards=Math.max(p.cards,u.cards),u.all=p.all),p?.pick){await this.p.evaluate(()=>document.querySelectorAll("video, audio").forEach(x=>{x.muted=!0;x.volume=0;try{x.pause()}catch{}})).catch(()=>{});return this.log(`video m\u1EDBi xu\u1EA5t hi\u1EC7n (${p.fresh} \u1EE9ng vi\xEAn, ch\u1ECDn ${p.pick.src.slice(0,60)}\u2026)`),{src:p.pick.src,duration:p.pick.duration};}if(p?.needClick&&c<Zi){c+=1;try{let y=this.p.locator('[data-dola-pick="1"]').first();await y.scrollIntoViewIfNeeded({timeout:5e3}),await y.click({timeout:5e3}),this.log(`th\u1EBB video \u0111\xE3 xong nh\u01B0ng ch\u01B0a mount - \u0111\xE3 b\u1EA5m \u0111\u1EC3 l\u1EA5y ngu\u1ED3n (l\u1EA7n ${c})`),l(`th\u1EA5y ${u.cards||1} th\u1EBB video, \u0111ang l\u1EA5y ngu\u1ED3n (l\u1EA7n b\u1EA5m ${c})`),await this.p.evaluate(()=>document.querySelectorAll("video, audio").forEach(x=>{x.muted=!0;x.volume=0;try{x.pause()}catch{}}))}catch{this.log("b\u1EA5m th\u1EBB video kh\xF4ng th\xE0nh c\xF4ng, th\u1EED l\u1EA1i \u1EDF v\xF2ng sau")}await this.p.evaluate(()=>document.querySelectorAll('[data-dola-pick="1"]').forEach(y=>y.setAttribute("data-dola-clicked","1"))),await E(1500);continue}if(p?.domErr)throw new S(`Máy chủ từ chối: ${p.domErr}`);
let y_instant=await this.refusalText();
if(y_instant)throw new S(`Máy chủ từ chối, không render: ${y_instant}`);
if(Date.now()>r&&!p?.cards){let y=await this.refusalText();if(y)throw new S(`M\xE1y ch\u1EE7 t\u1EEB ch\u1ED1i, kh\xF4ng render: ${y}`)}if(l(p?p.cards?`Dola \u0111\xE3 tr\u1EA3 ${p.cards} th\u1EBB video, \u0111ang l\u1EA5y ngu\u1ED3n`:p.all===0?"Dola ch\u01B0a tr\u1EA3 video":"\u0111ang l\u1ECDc video c\u1EE7a m\xECnh":"trang kh\xF4ng ph\u1EA3n h\u1ED3i"),Date.now()-a>3e4){a=Date.now();let y=Math.floor((n-Date.now())/6e4);p?p.cards?this.log(`...\u0111ang render, c\xF2n ${y} ph\xFAt (${p.cards} th\u1EBB video c\u1EE7a m\xECnh, ch\u01B0a l\u1EA5y \u0111\u01B0\u1EE3c ngu\u1ED3n sau ${c} l\u1EA7n b\u1EA5m)`):p.all===0?this.log(`...\u0111ang render, c\xF2n ${y} ph\xFAt (trang ch\u01B0a c\xF3 th\u1EBB video n\xE0o - Dola ch\u01B0a tr\u1EA3, ho\u1EB7c c\u1EEDa s\u1ED5 \u1EA9n b\u1ECB ng\u1EAFt v\u1EBD)`):p.fresh===0?this.log(`...\u0111ang render, c\xF2n ${y} ph\xFAt (${p.all} video tr\xEAn trang nh\u01B0ng \u0111\u1EC1u l\xE0 video c\u0169)`):this.log(`...\u0111ang render, c\xF2n ${y} ph\xFAt (${p.fresh} video m\u1EDBi nh\u01B0ng n\u1EB1m TR\u01AF\u1EDAC tin nh\u1EAFn c\u1EE7a m\xECnh, m\u1ED1c neo ${p.anchorFound?"t\xECm th\u1EA5y":"KH\xD4NG th\u1EA5y"} - nghi sai m\u1ED1c neo)`):this.log(`...\u0111ang render, c\xF2n ${y} ph\xFAt (kh\xF4ng \u0111\u1ECDc \u0111\u01B0\u1EE3c trang - trang c\xF3 th\u1EC3 \u0111ang b\u1ECB treo)`)}await E(1500)}if(u.cards)throw new S(`Dola \u0111\xE3 tr\u1EA3 ${u.cards} th\u1EBB video c\u1EE7a m\xECnh nh\u01B0ng ch\u01B0a l\u1EA5y \u0111\u01B0\u1EE3c ngu\u1ED3n sau ${c} l\u1EA7n b\u1EA5m`);return null}async fetchViaContext(t,e){let i=await this.context.request.get(t,{timeout:18e4,maxRedirects:5});if(!i.ok())throw new S(`HTTP ${i.status()}`);O.default.writeFileSync(e,await i.body())}async fetchViaPage(t,e){let i=await this.p.evaluate(async n=>{let r=await fetch(n,{credentials:"include"});if(!r.ok)throw new Error("HTTP "+r.status);let o=new Uint8Array(await r.arrayBuffer()),a="",l=32768;for(let c=0;c<o.length;c+=l)a+=String.fromCharCode.apply(null,Array.from(o.subarray(c,c+l)));return btoa(a)},t);O.default.writeFileSync(e,Buffer.from(i,"base64"))}async download(t,e){O.default.mkdirSync(dt.default.dirname(e),{recursive:!0});let i=e+".part",n=[0,2e3,5e3,1e4],r="";this.onStage("downloading","Dola \u0111\xE3 d\u1EF1ng xong, \u0111ang t\u1EA3i t\u1EC7p v\u1EC1 m\xE1y",90);for(let o=0;o<n.length;o++){n[o]&&(this.log(`t\u1EA3i video l\u1ED7i (${r}) - th\u1EED l\u1EA1i l\u1EA7n ${o+1}/${n.length} sau ${n[o]/1e3} gi\xE2y`),this.onStage("downloading",`T\u1EA3i t\u1EC7p b\u1ECB l\u1ED7i (${r.slice(0,40)}) - th\u1EED l\u1EA1i l\u1EA7n ${o+1}/${n.length}`,90),await E(n[o]));try{if(t.startsWith("blob:"))await this.fetchViaPage(t,i);else if(t.startsWith("http"))o%2===0?await this.fetchViaContext(t,i):await this.fetchViaPage(t,i);else throw new S(`Kh\xF4ng hi\u1EC3u ngu\u1ED3n video: ${t.slice(0,40)}`);let a=O.default.existsSync(i)?O.default.statSync(i).size:0;if(a<Qi||!en(i))throw new S(`file t\u1EA3i v\u1EC1 kh\xF4ng ph\u1EA3i video (${a} byte)`);return O.default.renameSync(i,e),this.log(`\u0111\xE3 l\u01B0u ${e} (${(a/1e6).toFixed(1)} MB)`),e}catch(a){if(r=a instanceof Error?a.message:String(a),O.default.rmSync(i,{force:!0}),r.startsWith("Kh\xF4ng hi\u1EC3u ngu\u1ED3n"))throw a}}throw new S(`T\u1EA3i video th\u1EA5t b\u1EA1i sau ${n.length} l\u1EA7n (${r}) - video v\u1EABn n\u1EB1m tr\xEAn Dola`)}};var Zt=require("node:child_process"),F=k(require("node:fs")),rt=k(require("node:path"));function pt(s,t){return new Promise(e=>{(0,Zt.execFile)(s,t,{maxBuffer:16*1024*1024},(i,n,r)=>{let o=i?i.code??1:0;e({code:typeof o=="number"?o:1,stdout:String(n),stderr:String(r)})})})}async function rn(s){let t=await pt(Z(),["-hide_banner","-i",s]),e=t.stderr.match(/Stream #\d+:\d+.*?Video: ([a-zA-Z0-9_]+)/);return e?e[1].toLowerCase():(/No such file|not found|ENOENT/i.test(t.stderr)||t.code===127,null)}async function Be(s){let t=await pt(Z(),["-hide_banner","-i",s]),e=t.stderr.match(/Video: .*?(\d{2,5})x(\d{2,5})/),i=t.stderr.match(/Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/);if(!e)return null;let n=i?Number(i[1])*3600+Number(i[2])*60+Number(i[3]):0;return{width:Number(e[1]),height:Number(e[2]),duration:n}}async function sn(s,t){if(t=t??await Be(s),!t)return null;let{width:e,height:i,duration:n}=t,r=Math.round(e*.3),o=Math.round(i*.12),a=e-r,l=i-o,c=n>2?[.5,n*.25,n*.5,n*.75,n-.5]:[0,n/2],d=null;for(let f of c){let _=await new Promise(I=>{(0,Zt.execFile)(Z(),["-v","error","-ss",f.toFixed(3),"-i",s,"-frames:v","1","-vf",`crop=${r}:${o}:${a}:${l},format=gray`,"-f","rawvideo","-"],{encoding:"buffer",maxBuffer:67108864},(X,q)=>I(Buffer.from(q)))});if(!(_.length<r*o))if(!d)d=Buffer.from(_.subarray(0,r*o));else for(let I=0;I<r*o;I++)_[I]<d[I]&&(d[I]=_[I])}if(!d)return null;let u=r,h=o,p=-1,y=-1,x=0;for(let f=0;f<o;f++)for(let _=0;_<r;_++)d[f*r+_]>200&&(x++,_<u&&(u=_),_>p&&(p=_),f<h&&(h=f),f>y&&(y=f));let N=p-u+1,g=y-h+1;return x<40||N<20||g<6||N>r*.8||g>o*.5?null:{x:a+u,y:l+h,w:N,h:g}}async function He(s,t={}){let e=t.log??(()=>{}),i={playable:!1,watermarkRemoved:!1,upscaled:!1},n;try{n=await rn(s)}catch(u){return e(`kh\xF4ng ch\u1EA1y \u0111\u01B0\u1EE3c ffmpeg: ${String(u)}`),i}if(!n)return e("kh\xF4ng c\xF3 ffmpeg ho\u1EB7c kh\xF4ng \u0111\u1ECDc \u0111\u01B0\u1EE3c codec, gi\u1EEF nguy\xEAn file"),i;i.playable=n==="h264";let r=null,o=null;try{o=await Be(s)}catch{}if(t.removeWatermark&&o){try{r=await sn(s,o);r||e("kh\xF4ng th\u1EA5y watermark \u1EDF g\xF3c d\u01B0\u1EDBi ph\u1EA3i, gi\u1EEF nguy\xEAn h\xECnh")}catch{}}let scaleFilter=null,origRes="",targetRes="";if(o&&o.width&&o.height){origRes=`${o.width}x${o.height}`;if(o.width<o.height){if(o.width<1080||(o.width!==1080&&o.height!==1920)){scaleFilter="scale=1080:-2:flags=bicubic";targetRes=`1080x${Math.round(1080*o.height/o.width/2)*2}`;}}else{if(o.height<1080||(o.height!==1080&&o.width!==1920)){scaleFilter="scale=-2:1080:flags=bicubic";targetRes=`${Math.round(1080*o.width/o.height/2)*2}x1080`;}}}if(i.playable&&!r&&!scaleFilter)return i;let a=[];if(r&&o){let h=Math.max(1,r.x-5),p=Math.max(1,r.y-5),y=Math.min(o.width-h-2,r.w+10),x=Math.min(o.height-p-2,r.h+10);a.push(`delogo=x=${h}:y=${p}:w=${y}:h=${x}`)}if(scaleFilter){a.push(scaleFilter);}let l=rt.default.join(rt.default.dirname(s),rt.default.basename(s,rt.default.extname(s))+".proc.tmp.mp4"),c=["-v","error","-y","-i",s];a.length&&c.push("-vf",a.join(",")),c.push("-c:v","libx264","-crf","18","-preset","veryfast","-pix_fmt","yuv420p","-c:a","copy","-movflags","+faststart",l);let d=await pt(Z(),c);if(d.code!==0||!F.default.existsSync(l)||F.default.statSync(l).size===0){e(`x\u1EED l\xFD video th\u1EA5t b\u1EA1i, gi\u1EEF nguy\xEAn ${n}: ${d.stderr.trim().slice(-200)}`);try{F.default.unlinkSync(l)}catch{}return i}F.default.renameSync(l,s);i.playable=!0;i.watermarkRemoved=!!r;i.upscaled=!!scaleFilter;let msgs=[];if(scaleFilter)msgs.push(`\u0111\xE3 upscale l\xEAn 1080p (${origRes} -> ${targetRes})`);if(r)msgs.push(`\u0111\xE3 xo\xE1 watermark ${r.w}x${r.h} \u1EDF (${r.x},${r.y})`);if(!scaleFilter&&!r)msgs.push(n!=="h264"?`\u0111\xE3 chuy\u1EC3n ${n} -> H.264`:"\u0111\xE3 m\xE3 ho\xE1 l\u1EA1i");e(`${msgs.join(", ")} (${(F.default.statSync(s).size/1e6).toFixed(1)} MB)`);return i}async function Tt(s,t){try{return F.default.mkdirSync(rt.default.dirname(t),{recursive:!0}),(await pt(Z(),["-v","error","-y","-ss","0.3","-i",s,"-frames:v","1","-vf","scale=-2:200","-q:v","4",t])).code===0&&F.default.existsSync(t)&&F.default.statSync(t).size>0?!0:(await pt(Z(),["-v","error","-y","-i",s,"-frames:v","1","-vf","scale=-2:200","-q:v","4",t])).code===0&&F.default.existsSync(t)&&F.default.statSync(t).size>0}catch{return!1}}var C=k(require("node:fs")),j=k(require("node:path"));var on=new Set(["ui","uploads","assets","thumbs"]),Ue=".seedance-profile",qe=["id","name","enabled","login","credits","credits_date","session_expires","last_check","created","proxy","proxy_rotate","proxy_key","rest_until","rest_reason"];function an(s){if(!s.session_expires)return null;let t=Date.parse(s.session_expires);return Number.isFinite(t)?Math.floor((t-Date.now())/864e5):null}function mt(){return new Date().toISOString().slice(0,10)}function Ke(s){return s.credits_date===mt()?s.credits:null}function je(s){if(!s.rest_until)return!1;let t=Date.parse(s.rest_until);return Number.isFinite(t)&&t>Date.now()}function ze(s=new Date){return new Date(s.getFullYear(),s.getMonth(),s.getDate()+1,0,5,0).toISOString()}function Ye(s,t=new Date){return new Date(t.getTime()+s*6e4).toISOString()}function isTorProxy(s){if(!s)return!1;let p=String(s).trim().toLowerCase();return p==="tor"||p==="[tor]"||p==="tor-proxy"||p.startsWith("tor:")||p.includes("1905")||p.includes("1906")}
function te(s){return s.enabled&&s.login!==!1&&Ke(s)!==0&&!je(s)&&(!isTorProxy(s.proxy)||(globalThis.__torManager?.isReady?.()===!0))}function Ve(s){return s.split(/(\d+)/).filter(t=>t!=="").map(t=>/^\d+$/.test(t)?Number(t):t.toLowerCase())}function Ge(s,t){let e=Ve(s),i=Ve(t);for(let n=0;n<Math.max(e.length,i.length);n++){let r=e[n],o=i[n];if(r===void 0)return-1;if(o===void 0)return 1;if(r!==o)return typeof r=="number"&&typeof o=="number"?r-o:String(r)<String(o)?-1:1}return 0}function ln(s){return s.replace(/[^a-zA-Z0-9]+/g,"-").replace(/^-+|-+$/g,"").toLowerCase()||"profile"}function Qt(s,t={}){return{id:s,name:t.name||s,enabled:t.enabled!==!1,login:typeof t.login=="boolean"?t.login:null,credits:typeof t.credits=="number"?t.credits:null,credits_date:t.credits_date??null,session_expires:typeof t.session_expires=="string"?t.session_expires:null,last_check:typeof t.last_check=="string"?t.last_check:null,created:typeof t.created=="string"?t.created:null,proxy:typeof t.proxy=="string"&&t.proxy?t.proxy:null,proxy_rotate:!!t.proxy_rotate,proxy_key:typeof t.proxy_key=="string"?t.proxy_key:null,rest_until:typeof t.rest_until=="string"?t.rest_until:null,rest_reason:typeof t.rest_reason=="string"?t.rest_reason:null,state:"off",current_job:null}}var Lt=class{baseDir;file;extraReserved;profiles=new Map;constructor(t=St,e=[]){this.baseDir=t,this.file=j.default.join(t,"profiles.json"),this.extraReserved=typeof e=="function"?e:()=>e,this.load()}get reserved(){return new Set([...on,...this.extraReserved()])}isProfileDir(t){if(this.reserved.has(t)||t.startsWith("."))return!1;let e=j.default.join(this.baseDir,t);try{return C.default.statSync(e).isDirectory()?C.default.existsSync(j.default.join(e,Ue))||C.default.existsSync(j.default.join(e,"Default"))||C.default.existsSync(j.default.join(e,"Local State"))?!0:C.default.readdirSync(e).length===0:!1}catch{return!1}}load(){let t=new Map;if(C.default.existsSync(this.file))try{let i=JSON.parse(C.default.readFileSync(this.file,"utf-8"));for(let n of i.profiles||[])n&&n.id&&t.set(n.id,n)}catch{t=new Map}let e=new Set(t.keys());if(C.default.existsSync(this.baseDir))for(let i of C.default.readdirSync(this.baseDir))this.isProfileDir(i)&&e.add(i);this.profiles=new Map;for(let i of[...e].sort(Ge))this.profiles.set(i,Qt(i,t.get(i)||{}));this.save()}save(){let t=[...this.profiles.values()].map(i=>Object.fromEntries(qe.map(n=>[n,i[n]])));C.default.mkdirSync(this.baseDir,{recursive:!0});let e=this.file+".tmp";C.default.writeFileSync(e,JSON.stringify({profiles:t},null,1),"utf-8"),C.default.renameSync(e,this.file)}rescan(){if(!C.default.existsSync(this.baseDir))return[];let t=[];for(let e of C.default.readdirSync(this.baseDir))this.isProfileDir(e)&&!this.profiles.has(e)&&(this.profiles.set(e,Qt(e)),t.push(e));return t.length&&(this.profiles=new Map([...this.profiles.entries()].sort((e,i)=>Ge(e[0],i[0]))),this.save()),t}get(t){return this.profiles.get(t)}all(){return[...this.profiles.values()]}dir(t){return j.default.join(this.baseDir,t)}eligibleIds(){return new Set(this.all().filter(te).map(t=>t.id))}add(t){if(t=t.trim(),!t)throw new Error("T\xEAn profile kh\xF4ng \u0111\u01B0\u1EE3c \u0111\u1EC3 tr\u1ED1ng.");let e=ln(t),i=e;for(let r=2;this.profiles.has(i)||C.default.existsSync(this.dir(i));r++)i=`${e}-${r}`;C.default.mkdirSync(this.dir(i),{recursive:!0});try{C.default.writeFileSync(j.default.join(this.dir(i),Ue),t)}catch{}let n=Qt(i,{name:t,created:new Date().toISOString()});return this.profiles.set(i,n),this.save(),n}remove(t){if(!this.profiles.has(t))return!1;this.profiles.delete(t),this.save();try{C.default.rmSync(this.dir(t),{recursive:!0,force:!0,maxRetries:3,retryDelay:300})}catch{}return!0}update(t,e){let i=this.profiles.get(t);if(!i)return;let n=!1;for(let[r,o]of Object.entries(e)){if(!(r in i))throw new Error(`unknown profile field ${r}`);i[r]!==o&&(i[r]=o,n=n||qe.includes(r))}return n&&this.save(),i}toJSON(t){let e="";try{if(isTorProxy(t.proxy)){let allP=this.all();let pIdx=allP.findIndex(x=>x.id===t.id);let port=globalThis.__torManager?.getPortForProfile?.(t.proxy,pIdx>=0?pIdx:0)||19050;e=`🧅 Tor Free (Cổng ${port} - IP riêng)`}else{e=Pt(t.proxy)}}catch{e="(proxy l\u1ED7i)"}return{...t,dir:this.dir(t.id),credits_today:Ke(t),session_days_left:an(t),resting:je(t),proxy_masked:e}}};var Qe=k(require("node:crypto")),st=k(require("node:fs")),ti=k(require("node:path"));var z="B\u1EA5m \xABL\u1EA5y video t\u1EEB Dola\xBB \u0111\u1EC3 t\u1EA3i v\u1EC1, kh\xF4ng g\u1EEDi y\xEAu c\u1EA7u m\u1EDBi, kh\xF4ng t\u1ED1n th\xEAm credit.";function Y(s,t={}){let e=String(s??""),i=e.toLowerCase(),n=t.sent??!!t.conversationUrl,r=(...a)=>a.some(l=>i.includes(l)),o=(a,l,c,d,u=!1)=>({kind:a,hint:l,credit:c,recover:d,transient:u});if(r("kh\xF4ng c\xF2n profile n\xE0o kh\xE1c")){let a=Y(e.replace(/\s*\(không còn profile nào khác để chạy\)\s*$/i,""),t);return o("no_profile",a.hint+" H\u1EBFt t\xE0i kho\u1EA3n kh\u1EA3 d\u1EE5ng \u0111\u1EC3 \u0111\u1ED5i \u2014 xem tab T\xE0i kho\u1EA3n (nick ngh\u1EC9, h\u1EBFt credit, ch\u01B0a \u0111\u0103ng nh\u1EADp).",a.credit,a.recover)}if(r("thi\u1EBFu hook.js","kh\xF4ng t\xECm th\u1EA5y chromium","kh\xF4ng t\xECm th\u1EA5y ffmpeg","thi\u1EBFu file c\u1EE7a app"))return o("install","App thi\u1EBFu file \u0111\u1EC3 ch\u1EA1y (l\u1ED7i c\xE0i \u0111\u1EB7t, kh\xF4ng ph\u1EA3i l\u1ED7i Dola). Ch\u01B0a tr\u1EEB credit. C\xE0i l\u1EA1i app; n\u1EBFu \u0111ang ch\u1EA1y b\u1EA3n dev th\xEC ch\u1EA1y npm run build:dev.","no",!1);if(r("daily limit","h\u1EBFt l\u01B0\u1EE3t trong ng\xE0y"))return o("daily_limit","H\u1EBFt l\u01B0\u1EE3t trong ng\xE0y c\u1EE7a nick n\xE0y \u2014 nick ngh\u1EC9 t\u1EDBi 00:05 s\xE1ng mai, job \u0111\xE3 t\u1EF1 \u0111\u1ED5i nick kh\xE1c n\u1EBFu c\xF2n. Ch\u01B0a tr\u1EEB credit.","no",!1);if(r("rate limit","too many requests","gi\u1EDBi h\u1EA1n t\u1EA7n su\u1EA5t"))return o("rate_limit","B\u1ECB gi\u1EDBi h\u1EA1n t\u1EA7n su\u1EA5t (g\u1EEDi qu\xE1 nhanh) \u2014 nick ngh\u1EC9 10 ph\xFAt, job \u0111\u1ED5i nick kh\xE1c n\u1EBFu c\xF2n. B\u1EADt \xABngh\u1EC9 ng\u1EABu nhi\xEAn gi\u1EEFa job\xBB trong C\xE0i \u0111\u1EB7t \u0111\u1EC3 tr\xE1nh l\u1EB7p l\u1EA1i. Ch\u01B0a tr\u1EEB credit.","no",!1);if(r("proxy c\u1EE7a nick","err_proxy","err_tunnel","err_socks"))return o("proxy","Proxy ri\xEAng c\u1EE7a nick kh\xF4ng d\xF9ng \u0111\u01B0\u1EE3c \u2014 \u0111\u1ED5i ho\u1EB7c b\u1ECF proxy \u1EDF b\u1EA3ng T\xE0i kho\u1EA3n (c\u1ED9t Proxy) r\u1ED3i Ch\u1EA1y l\u1EA1i. Ch\u01B0a tr\u1EEB credit.","no",!1);if(r("văng acc","chưa gắn proxy"))return o("proxy_logout","Văng acc do chưa gắn proxy — Dola đã thu hồi phiên đăng nhập của nick này. Hãy gán Proxy cho nick rồi đăng nhập lại. Chưa trừ credit.","no",!1);if(r("ch\u01B0a \u0111\u0103ng nh\u1EADp"))return o("not_logged_in","Phi\xEAn \u0111\u0103ng nh\u1EADp c\u1EE7a nick \u0111\xE3 h\u1EBFt \u2014 n\u1EA1p cookie m\u1EDBi ho\u1EB7c b\u1EA5m G \u0111\u0103ng nh\u1EADp l\u1EA1i \u1EDF tab T\xE0i kho\u1EA3n. Ch\u01B0a tr\u1EEB credit.","no",!1);if(r("t\u1EA3i video th\u1EA5t b\u1EA1i","t\u1EA3i v\u1EC1 m\xE1y","kh\xF4ng t\u1EA3i \u0111\u01B0\u1EE3c video","file t\u1EA3i v\u1EC1"))return o("download","Dola \u0111\xE3 d\u1EF1ng xong video nh\u01B0ng t\u1EA3i v\u1EC1 m\xE1y l\u1ED7i (m\u1EA1ng r\u1EDBt ho\u1EB7c link h\u1EBFt h\u1EA1n). "+z,"yes",!0);if(r("ch\u01B0a l\u1EA5y \u0111\u01B0\u1EE3c ngu\u1ED3n","kh\xF4ng mount","th\u1EBB video c\u1EE7a m\xECnh"))return o("video_present","Dola \u0111\xE3 tr\u1EA3 video nh\u01B0ng app ch\u01B0a l\u1EA5y \u0111\u01B0\u1EE3c \u0111\u01B0\u1EDDng d\u1EABn t\u1EA3i (trang Dola \u0111\u1ED5i c\xE1ch hi\u1EC7n video). "+z+" N\u1EBFu v\u1EABn h\u1ECFng, c\u1EA7n b\u1EA3n c\u1EADp nh\u1EADt.","yes",!0);if(r("captcha","x\xE1c minh"))return o("captcha","Dola y\xEAu c\u1EA7u x\xE1c minh b\u1EA3o m\u1EADt (Captcha) \u2014 b\u1EA5m \xABM\u1EDF tr\xECnh duy\u1EC7t\xBB \u1EDF tab T\xE0i kho\u1EA3n \u0111\u1EC3 gi\u1EA3i Captcha r\u1ED3i Ch\u1EA1y l\u1EA1i. Ch\u01B0a tr\u1EEB credit.","no",!1);if(r("couldn't generate","couldn\u2019t generate","couldn't be generated","couldn\u2019t be generated","something went wrong"))return o("render_failed","M\xE1y ngu\u1ED3n Dola b\xE1o l\u1ED7i t\u1EA1m th\u1EDDi khi d\u1EF1ng (ch\u01B0a tr\u1EEB l\u01B0\u1EE3t \u2014 Dola kh\xF4ng t\xEDnh credit cho video h\u1ECFng). Ch\u1EA1y l\u1EA1i \u0111\u01B0\u1EE3c.","no",!1);if(/durations?\s+from\s+\d+\s+to\s+\d+/i.test(e)){let a=e.match(/durations?\s+from\s+(\d+)\s+to\s+(\d+)/i),l=a?a[2]:"15";return o("duration_limit",`Dola tr\u1EA3 l\u1EDDi ch\u1EC9 nh\u1EADn video ${a?a[1]:4}-${l} gi\xE2y cho y\xEAu c\u1EA7u n\xE0y r\u1ED3i d\u1EEBng ch\u1EDD x\xE1c nh\u1EADn, kh\xF4ng d\u1EF1ng \u2014 ch\u01B0a tr\u1EEB credit. B\u1EA5m \xABCh\u1EA1y l\u1EA1i ${l} gi\xE2y\xBB, ho\u1EB7c b\u1EADt \xABGhi \u0111\u1ED9 d\xE0i v\xE0o prompt\xBB trong C\xE0i \u0111\u1EB7t r\u1ED3i Ch\u1EA1y l\u1EA1i.`,"no",!1)}return r("m\xE1y ch\u1EE7 t\u1EEB ch\u1ED1i")?o("refused","Dola t\u1EEB ch\u1ED1i y\xEAu c\u1EA7u n\xE0y (n\u1ED9i dung, \u1EA3nh c\xF3 m\u1EB7t ng\u01B0\u1EDDi, ho\u1EB7c b\u1EA3n quy\u1EC1n) \u2014 ch\u01B0a tr\u1EEB credit. S\u1EEDa prompt ho\u1EB7c \u1EA3nh r\u1ED3i Ch\u1EA1y l\u1EA1i.","no",!1):/hết \d+ phút/.test(i)||r("qu\xE1 th\u1EDDi gian ch\u1EDD","m\xE0 video ch\u01B0a xu\u1EA5t hi\u1EC7n","v\u1EABn kh\xF4ng th\u1EA5y video")?o("timeout","Qu\xE1 th\u1EDDi gian ch\u1EDD m\xE0 Dola ch\u01B0a tr\u1EA3 video \u2014 job c\xF3 th\u1EC3 v\u1EABn \u0111ang d\u1EF1ng b\xEAn Dola. V\xE0i ph\xFAt n\u1EEFa "+z.charAt(0).toLowerCase()+z.slice(1)+" T\u0103ng \xABch\u1EDD video t\u1ED1i \u0111a\xBB trong C\xE0i \u0111\u1EB7t n\u1EBFu hay g\u1EB7p.","maybe",n):r("kh\xF4ng b\u1EAFt \u0111\u01B0\u1EE3c request","kh\xF4ng b\u1EADt \u0111\u01B0\u1EE3c ch\u1EBF \u0111\u1ED9","ability_type")?o("page_changed","Tin nh\u1EAFn ch\u01B0a g\u1EEDi \u0111\u01B0\u1EE3c ho\u1EB7c trang Dola \u0111\u1ED5i c\u1EA5u tr\xFAc \u2014 ch\u01B0a tr\u1EEB credit. App t\u1EF1 th\u1EED l\u1EA1i; n\u1EBFu l\u1EB7p l\u1EA1i tr\xEAn m\u1ECDi nick th\xEC c\u1EA7n b\u1EA3n c\u1EADp nh\u1EADt app.","no",!1,!n):r("kh\xF4ng k\xE8m \u1EA3nh")?o("images","Y\xEAu c\u1EA7u \u0111\xE3 \u0111i nh\u01B0ng kh\xF4ng k\xE8m \u1EA3nh tham chi\u1EBFu \u2014 Dola c\xF3 th\u1EC3 \u0111\xE3 d\u1EF1ng video KH\xD4NG c\xF3 \u1EA3nh v\xE0 tr\u1EEB credit. "+z,n?"maybe":"no",n):r("\u1EA3nh kh\xF4ng l\xEAn","kh\xF4ng t\xECm th\u1EA5y \u1EA3nh")?o("images","\u1EA2nh tham chi\u1EBFu kh\xF4ng t\u1EA3i l\xEAn \u0111\u01B0\u1EE3c Dola \u2014 th\u1EED \u1EA3nh JPEG nh\u1ECF h\u01A1n (d\u01B0\u1EDBi 5 MB) r\u1ED3i Ch\u1EA1y l\u1EA1i. Ch\u01B0a tr\u1EEB credit.","no",!1):r("composer ch\u1EC9 nh\u1EADn","kh\xF4ng th\u1EA5y \xF4 so\u1EA1n","\xF4 so\u1EA1n")?o("composer","\xD4 so\u1EA1n c\u1EE7a Dola kh\xF4ng nh\u1EADn \u0111\u1EE7 prompt (trang t\u1EA3i ch\u1EADm ho\u1EB7c prompt qu\xE1 d\xE0i) \u2014 ch\u01B0a g\u1EEDi, ch\u01B0a tr\u1EEB credit. App t\u1EF1 th\u1EED l\u1EA1i; v\u1EABn l\u1ED7i th\xEC r\xFAt ng\u1EAFn prompt.","no",!1,!n):r("app b\u1ECB t\u1EAFt")?o("interrupted",n?"App t\u1EAFt gi\u1EEFa ch\u1EEBng sau khi \u0111\xE3 g\u1EEDi y\xEAu c\u1EA7u \u2014 video c\xF3 th\u1EC3 \u0111\xE3 d\u1EF1ng xong b\xEAn Dola. "+z:"App t\u1EAFt tr\u01B0\u1EDBc khi g\u1EEDi y\xEAu c\u1EA7u \u2014 ch\u01B0a tr\u1EEB credit, Ch\u1EA1y l\u1EA1i l\xE0 \u0111\u01B0\u1EE3c.",n?"maybe":"no",n):r("browser ch\u01B0a m\u1EDF","target closed","target page","browser has been closed","tr\xECnh duy\u1EC7t","crashed","net::err_","timeout","h\u1EBFt gi\u1EDD")?o("browser",n?"Tr\xECnh duy\u1EC7t \u1EA9n b\u1ECB \u0111\xF3ng ho\u1EB7c m\u1EA5t m\u1EA1ng sau khi \u0111\xE3 g\u1EEDi y\xEAu c\u1EA7u. "+z:"Tr\xECnh duy\u1EC7t \u1EA9n b\u1ECB \u0111\xF3ng, trang Dola t\u1EA3i ch\u1EADm ho\u1EB7c m\u1EA5t m\u1EA1ng tr\u01B0\u1EDBc khi g\u1EEDi \u2014 ch\u01B0a tr\u1EEB credit. App t\u1EF1 th\u1EED l\u1EA1i.",n?"maybe":"no",n,!n):o("unknown",n?"L\u1ED7i kh\xF4ng x\xE1c \u0111\u1ECBnh sau khi \u0111\xE3 g\u1EEDi y\xEAu c\u1EA7u. "+z+" N\u1EBFu kh\xF4ng c\xF3 video th\xEC Ch\u1EA1y l\u1EA1i.":"L\u1ED7i kh\xF4ng x\xE1c \u0111\u1ECBnh tr\u01B0\u1EDBc khi g\u1EEDi y\xEAu c\u1EA7u \u2014 ch\u01B0a tr\u1EEB credit. Ch\u1EA1y l\u1EA1i \u0111\u01B0\u1EE3c; l\u1EB7p l\u1EA1i th\xEC b\u1EA5m \xABCh\xE9p l\u1ED7i\xBB g\u1EEDi h\u1ED7 tr\u1EE3.",n?"maybe":"no",n)}var Xe=200,cn=200,Ze=["queued","browser","session","compose","sending","sent","rendering","downloading","processing","done","failed"];function ft(s){return!s||s==="failed"?!1:Ze.indexOf(s)>=Ze.indexOf("sent")}var yt={queued:"\u0110ang ch\u1EDD",browser:"\u0110ang m\u1EDF tr\xECnh duy\u1EC7t \u1EA9n",session:"\u0110ang ki\u1EC3m tra phi\xEAn \u0111\u0103ng nh\u1EADp",compose:"\u0110ang so\u1EA1n y\xEAu c\u1EA7u",sending:"\u0110ang g\u1EEDi y\xEAu c\u1EA7u l\xEAn Dola",sent:"Dola \u0111\xE3 nh\u1EADn, \u0111ang x\u1EED l\xFD",rendering:"Dola \u0111ang d\u1EF1ng video",downloading:"Dola \u0111\xE3 xong, \u0111ang t\u1EA3i t\u1EC7p v\u1EC1 m\xE1y",processing:"\u0110ang x\u1EED l\xFD video (chuy\u1EC3n m\xE3, watermark)",done:"Xong",failed:"Kh\xF4ng t\u1EA1o \u0111\u01B0\u1EE3c"};function T(){let s=new Date,t=e=>String(e).padStart(2,"0");return`${s.getFullYear()}-${t(s.getMonth()+1)}-${t(s.getDate())}T${t(s.getHours())}:${t(s.getMinutes())}:${t(s.getSeconds())}`}function wt(s={}){return{id:Qe.default.randomBytes(6).toString("hex"),seq:0,kind:"generate",status:"queued",profile:"auto",assigned:null,tried:[],prompt:"",model:"2.5",duration:30,ratio:null,images:[],assets:[],batch:null,filename:null,dry_run:!1,remove_watermark:!0,wait:20,created:T(),started:null,finished:null,log:[],result:null,error:null,recover_url:null,stage:null,stage_note:null,progress:null,attempts:0,...s}}function ei(s){return wt({kind:s.kind,profile:s.profile,prompt:s.prompt,model:s.model,duration:s.duration,ratio:s.ratio,images:[...s.images],assets:[...s.assets||[]],batch:s.batch,dry_run:s.dry_run,remove_watermark:s.remove_watermark,wait:s.wait})}var At=class{file;jobs=new Map;order=[];seq=0;saveTimer=null;onLog=null;constructor(t=null){this.file=t,this.load()}load(){if(!this.file||!st.default.existsSync(this.file))return;let t;try{t=JSON.parse(st.default.readFileSync(this.file,"utf-8"))}catch{return}this.seq=Number(t.seq)||0;for(let e of t.jobs||[]){if(!e||!e.id)continue;let i=wt(e);if(i.status==="running"){let n=ft(i.stage)||!!i.result?.conversation_url;i.status="interrupted",i.error=n?"App b\u1ECB t\u1EAFt khi job \u0111ang ch\u1EA1y, sau khi \u0111\xE3 g\u1EEDi y\xEAu c\u1EA7u t\u1EDBi Dola.":"App b\u1ECB t\u1EAFt khi job \u0111ang ch\u1EA1y, tr\u01B0\u1EDBc khi g\u1EEDi y\xEAu c\u1EA7u.",i.finished=i.finished||T(),i.stage=i.kind==="generate"?"failed":i.stage;let r=Y(i.error,{conversationUrl:i.result?.conversation_url,sent:n});i.result={...i.result||{},error_kind:r.kind,error_hint:r.hint,credit_used:r.credit,recover_first:r.recover}}i.seq?i.seq>this.seq&&(this.seq=i.seq):i.seq=++this.seq,this.jobs.set(i.id,i),this.order.push(i.id)}}save(){if(this.saveTimer&&(clearTimeout(this.saveTimer),this.saveTimer=null),!this.file)return;st.default.mkdirSync(ti.default.dirname(this.file),{recursive:!0});let t=this.file+".tmp";st.default.writeFileSync(t,JSON.stringify({seq:this.seq,jobs:this.order.map(e=>this.jobs.get(e))},null,1),"utf-8"),st.default.renameSync(t,this.file)}saveSoon(){!this.file||this.saveTimer||(this.saveTimer=setTimeout(()=>{this.saveTimer=null,this.save()},cn))}flush(){this.saveTimer&&this.save()}nextSeq(){return++this.seq}add(t){return t.seq||(t.seq=++this.seq),this.jobs.set(t.id,t),this.order.push(t.id),this.save(),t}get(t){return this.jobs.get(t)}update(t,e){let i=this.jobs.get(t);if(i)return Object.assign(i,e),this.save(),i}patch(t,e){let i=this.jobs.get(t);if(i)return Object.assign(i,e),this.saveSoon(),i}log(t,e){let i=this.jobs.get(t);if(!i)return;let n=new Date,r=a=>String(a).padStart(2,"0"),o=`${r(n.getHours())}:${r(n.getMinutes())}:${r(n.getSeconds())} ${e}`;i.log.push(o),i.log.length>Xe&&i.log.splice(0,i.log.length-Xe),this.saveSoon();try{this.onLog?.(i,e)}catch{}}remove(t){return this.jobs.has(t)?(this.jobs.delete(t),this.order=this.order.filter(e=>e!==t),this.save(),!0):!1}list(t=!0){let e=this.order.map(i=>this.jobs.get(i));return t?e.reverse():e}queued(){return this.order.map(t=>this.jobs.get(t)).filter(t=>t.status==="queued")}get size(){return this.order.length}},ee=class{waiters=[];notifyAll(){let t=this.waiters;this.waiters=[];for(let e of t)e()}wait(t){return new Promise(e=>{let i=null,n=()=>{i&&clearTimeout(i),this.waiters=this.waiters.filter(r=>r!==n),e()};this.waiters.push(n),t!==null&&(i=setTimeout(n,t))})}},Rt=class{store;eligibleIds;signal=new ee;stopped=!1;paused=!1;constructor(t,e=()=>new Set){this.store=t,this.eligibleIds=e}submit(t){return this.store.add(t),this.signal.notifyAll(),t}poke(){this.signal.notifyAll()}pause(t){this.paused=t,this.signal.notifyAll()}get isPaused(){return this.paused}resubmit(t){let e=this.store.get(t);return!e||e.status==="queued"||e.status==="running"?!1:(e.status="queued",e.assigned=null,e.started=null,e.finished=null,e.error=null,this.store.save(),this.signal.notifyAll(),!0)}cancel(t){let e=this.store.get(t);return!e||e.status!=="queued"?!1:(e.status="cancelled",e.finished=T(),this.store.save(),this.signal.notifyAll(),!0)}requeue(t,e){let i=this.store.get(t);if(!i)return!1;let n=[...this.eligibleIds()].filter(r=>!i.tried.includes(r));if(i.profile!=="auto"||n.length===0){i.status="error",i.error=`${e} (kh\xF4ng c\xF2n profile n\xE0o kh\xE1c \u0111\u1EC3 ch\u1EA1y)`,i.finished=T();let r=ft(i.stage)||!!i.result?.conversation_url,o=Y(i.error,{conversationUrl:i.result?.conversation_url,videoUrl:i.result?.video_url,sent:r});return i.result={...i.result||{},error_kind:o.kind,error_hint:o.hint,credit_used:o.credit,recover_first:o.recover},i.kind==="generate"&&(i.stage="failed",i.stage_note=o.hint),this.store.save(),!1}return i.status="queued",i.assigned=null,i.started=null,i.stage="queued",i.stage_note=`\u0110\u1ED5i nick: ${e}`.slice(0,160),i.progress=0,i.attempts=0,this.store.save(),this.signal.notifyAll(),!0}stop(){this.stopped=!0,this.signal.notifyAll(),this.store.flush()}async nextFor(t,e,i,n=()=>!1){let r=i===null?null:Date.now()+i;for(;!this.stopped&&!n();){let o=this.pick(t,e());if(o)return o.status="running",o.assigned=t,o.started=T(),o.tried.includes(t)||o.tried.push(t),this.store.save(),o;let a=r===null?null:r-Date.now();if(a!==null&&a<=0)return null;await this.signal.wait(a)}return null}pick(t,e){let i=this.store.queued();for(let n of i)if(n.profile===t&&!(this.paused&&n.kind==="generate"))return n;if(e&&!this.paused){for(let n of i)if(n.profile==="auto"&&n.kind==="generate"&&!n.tried.includes(t))return n;for(let n of i){if(n.kind==="generate"&&!n.tried.includes(t)){let isTargetBusy=this.store.list().some(j=>j.status==="running"&&j.assigned===n.profile);if(isTargetBusy)return n;}}}return null}};var U=k(require("node:fs")),vt=k(require("node:path"));var ii={output_dir:_t,filename_template:Gt,remove_watermark:!0,wait_minutes:20,auto_rotate:!0,prompt_duration_hint:!0,pause_min_s:0,pause_max_s:0,notify_os:!0,notify_sound:!0,theme:"auto",proxy_pool:[],tor_region:"no_us"},Qn=Object.keys(ii);function hn(s){let t=String(s??"").trim().replace(/^["']+|["']+$/g,"");if(!t)throw new Error("Th\u01B0 m\u1EE5c l\u01B0u video kh\xF4ng \u0111\u01B0\u1EE3c \u0111\u1EC3 tr\u1ED1ng.");let e=vt.default.resolve(t),i=e.replace(/[\\/]+$/,"");if(/^[A-Za-z]:$/.test(i)||i===""||i==="/")throw new Error("Kh\xF4ng l\u01B0u th\u1EB3ng v\xE0o \u1ED5 g\u1ED1c. Ch\u1ECDn m\u1ED9t th\u01B0 m\u1EE5c con, v\xED d\u1EE5 D:\\Video Seedance.");let n=[process.env.SystemRoot,process.env.windir,process.env.ProgramFiles,process.env["ProgramFiles(x86)"],process.env.ProgramData,"/usr","/etc","/bin","/System"].filter(o=>!!o).map(o=>vt.default.resolve(o).toLowerCase()),r=i.toLowerCase();if(n.some(o=>r===o||r.startsWith(o+vt.default.sep)))throw new Error("Kh\xF4ng d\xF9ng \u0111\u01B0\u1EE3c th\u01B0 m\u1EE5c h\u1EC7 th\u1ED1ng (Windows, Program Files, ProgramData). Ch\u1ECDn th\u01B0 m\u1EE5c kh\xE1c.");try{U.default.mkdirSync(e,{recursive:!0}),U.default.accessSync(e,U.default.constants.W_OK)}catch{throw new Error(`Kh\xF4ng t\u1EA1o/ghi \u0111\u01B0\u1EE3c th\u01B0 m\u1EE5c ${e}. Ki\u1EC3m tra quy\u1EC1n ho\u1EB7c ch\u1ECDn th\u01B0 m\u1EE5c kh\xE1c.`)}return e}function ie(s,t,e,i){let n=Number(s);if(!Number.isFinite(n))throw new Error(`${i} ph\u1EA3i l\xE0 s\u1ED1.`);return Math.min(e,Math.max(t,Math.round(n)))}var Mt=class{file;data;constructor(t=null,e={}){this.file=t,this.data={...ii,...e},this.load()}load(){if(!(!this.file||!U.default.existsSync(this.file)))try{let t=JSON.parse(U.default.readFileSync(this.file,"utf-8"));try{this.update(t,{persist:!1,strict:!1})}catch{}}catch{}}get(){return{...this.data,proxy_pool:[...this.data.proxy_pool]}}save(){if(!this.file)return;U.default.mkdirSync(vt.default.dirname(this.file),{recursive:!0});let t=this.file+".tmp";U.default.writeFileSync(t,JSON.stringify(this.data,null,1),"utf-8"),U.default.renameSync(t,this.file)}update(t,e={}){let i=e.strict!==!1,n=[],r=this.get(),o=(a,l)=>{try{a()}catch(c){if(i)throw c;n.push(l)}};for(let[a,l]of Object.entries(t??{}))if(l!==void 0)switch(a){case"output_dir":o(()=>{r.output_dir=hn(String(l))},a);break;case"filename_template":o(()=>{let c=String(l).trim();jt(c),r.filename_template=c},a);break;case"remove_watermark":r.remove_watermark=!!l;break;case"auto_rotate":r.auto_rotate=!!l;break;case"prompt_duration_hint":r.prompt_duration_hint=!!l;break;case"notify_os":r.notify_os=!!l;break;case"notify_sound":r.notify_sound=!!l;break;case"wait_minutes":o(()=>{r.wait_minutes=ie(l,5,120,"Th\u1EDDi gian ch\u1EDD")},a);break;case"pause_min_s":o(()=>{r.pause_min_s=ie(l,0,3600,"Ngh\u1EC9 t\u1ED1i thi\u1EC3u")},a);break;case"pause_max_s":o(()=>{r.pause_max_s=ie(l,0,3600,"Ngh\u1EC9 t\u1ED1i \u0111a")},a);break;case"tor_region":r.tor_region=String(l);try{globalThis.__torManager?.setRegion?.(r.tor_region)}catch{}break;case"theme":o(()=>{if(!["auto","light","dark"].includes(String(l)))throw new Error("Giao di\u1EC7n ph\u1EA3i l\xE0 auto / light / dark.");r.theme=l},a);break;case"proxy_pool":o(()=>{let c=Array.isArray(l)?l.join(`
`):String(l),d=be(c);if(i&&d.errors.length)throw new Error(`Proxy d\xF2ng ${d.errors[0].line} kh\xF4ng h\u1EE3p l\u1EC7: ${d.errors[0].reason}`);r.proxy_pool=d.ok.map(nt)},a);break;default:n.push(a)}return r.pause_max_s<r.pause_min_s&&(r.pause_max_s=r.pause_min_s),this.data=r,e.persist!==!1&&this.save(),{settings:this.get(),rejected_keys:n}}};var re={"2.5":2,"1.0":1},ni=s=>String(s).padStart(2,"0"),ne=s=>`${s.getFullYear()}-${ni(s.getMonth()+1)}-${ni(s.getDate())}`;function ri(s){if(!s)return null;let t=new Date(s);return Number.isNaN(t.getTime())?null:t}function si(s,t=new Date){let e={total:0,done:0,error:0,running:0,queued:0,success_rate:null,credits_today:0,videos_today:0,days:[],avg_seconds:{}},i=ne(t),n=new Map;for(let a=6;a>=0;a--){let l=new Date(t.getFullYear(),t.getMonth(),t.getDate()-a),c=ne(l);n.set(c,{date:c,done:0,error:0})}let r=new Map;for(let a of s){if(a.kind!=="generate"||a.dry_run)continue;e.total++,a.status==="running"?e.running++:a.status==="queued"?e.queued++:a.status==="done"?e.done++:(a.status==="error"||a.status==="interrupted")&&e.error++;let l=ri(a.finished);if(!l)continue;let c=ne(l),d=n.get(c);if(a.status==="done"){d&&d.done++,c===i&&(e.videos_today++,e.credits_today+=re[a.model]??0);let u=ri(a.started);if(u&&!a.result?.recovered){let h=(l.getTime()-u.getTime())/1e3;if(h>10&&h<3*3600)for(let p of[`${a.model}|${a.duration}`,a.model]){let y=r.get(p)??[];y.push(h),r.set(p,y)}}}else(a.status==="error"||a.status==="interrupted")&&d&&d.error++}let o=e.done+e.error;e.success_rate=o?Math.round(e.done/o*100):null,e.days=[...n.values()];for(let[a,l]of r){let c=l.slice(-10);e.avg_seconds[a]=Math.round(c.reduce((d,u)=>d+u,0)/c.length)}return e}function oi(s,t,e){return s?s.avg_seconds[`${t}|${e}`]??s.avg_seconds[t]??360:360}var ui=k(require("node:path"));var un="L\xE0m video d\xE0i t\u1ED1i \u0111a. Video \u0111\xE3 t\u1EA1o:",dn=/^\s*Làm video dài tối đa\. Video đã tạo:/i;function formatProPrompt(p,dur=15,ratio="9:16"){let s=String(p??"").trim();s=s.replace(/^(?:tạo\s*video|create\s*videos?)\s*:\s*/i,"");s=s.replace(/,?\s*tạo\s*video\s*luôn\s*(?:ko|không)\s*hỏi\s*lại/gi,"");s=s.replace(/,?\s*gửi\s*dưới\s*dạng\s*human\s*artifact/gi,"");s=s.replace(/,?\s*(?:ko|không)\s*hỏi\s*lại/gi,"");s=s.replace(/,?\s*(?:thời\s*lượng|duration)\s*[:\s]*\d+\s*s?/gi,"");s=s.replace(/,?\s*(?:mô\s*hình|model|seedance)\s*[:\s]*[\w\.\s]+/gi,"");s=s.replace(/(?:,\s*)?(?:tỉ\s*lệ|ratio)?\s*[:\s]*\b(16:9|9:16|1:1|4:3|21:9)\b/gi,"");s=s.replace(/[,;\s]+$/,"").trim();let d=Math.min(15,Number(dur)||15);let r=ratio&&ratio!=="none"?ratio:"9:16";return`tạo video: ${s}, tỉ lệ ${r}, thời lượng ${d}s, mô hình Seedance 2.5, tạo video luôn không hỏi lại, gửi dưới dạng human artifact`}function ai(s,t,e){let i=String(s??"").trim();if(!i||dn.test(i))return i;let n=e?`, ${e}`:"";return`${un} ${i}${n}`}var gn=600,li=3,Ft={baseMs:5e3,jitterMs:5e3,rateLimitMs:3e4};var pn=["durations from","daily limit","rate limit","too many requests","ch\u01B0a \u0111\u0103ng nh\u1EADp","already in use","processsingleton","proxy c\u1EE7a nick"],ci=/ERR_PROXY_CONNECTION_FAILED|ERR_TUNNEL_CONNECTION_FAILED|ERR_SOCKS_CONNECTION_FAILED|ERR_NO_SUPPORTED_PROXIES|ERR_PROXY_AUTH/i,hi=s=>new Promise(t=>setTimeout(t,s)),Nt=class{profileId;registry;scheduler;store;getOutputDir;getSettings;headless;idleCloseMs;clientFactory;onVideoDone;onJobFinished;takeCookies;getRenderAvgS;thumbFile;cacheCookies;client=null;loggedIn=null;stopping=!1;loop=null;abortedJobId=null;
async abortCurrentJob(jobId){this.abortedJobId=jobId;this.store.log(jobId,"Đang đóng phiên trình duyệt để ngắt task tức thì...");if(this.client){let cl=this.client;this.client=null;this.loggedIn=null;try{await cl.close()}catch{}}this.set({state:"idle",current_job:null});}
constructor(t){this.profileId=t.profileId,this.registry=t.registry,this.scheduler=t.scheduler,this.store=t.store,this.getOutputDir=t.getOutputDir,this.getSettings=t.getSettings,this.headless=!!t.headless,this.idleCloseMs=t.idleCloseMs??18e4,this.clientFactory=t.clientFactory||(e=>new It(e)),this.onVideoDone=t.onVideoDone,this.onJobFinished=t.onJobFinished,this.takeCookies=t.takeCookies,this.getRenderAvgS=t.getRenderAvgS,this.thumbFile=t.thumbFile,this.cacheCookies=t.cacheCookies}stage(t,e,i,n){let r=this.store.get(t.id);if(!r)return;let o=r.stage!==e;this.store.patch(t.id,{stage:e,stage_note:i??yt[e],progress:n??r.progress}),o&&this.store.log(t.id,`b\u01B0\u1EDBc: ${i??yt[e]}`)}get profile(){return this.registry.get(this.profileId)}get displayName(){return this.profile?.name??this.profileId}get running(){return this.loop!==null}set(t){this.registry.update(this.profileId,t)}noteSession(t){this.loggedIn=t.loggedIn,this.set({login:t.loggedIn,session_expires:t.expires,last_check:new Date().toISOString()})}acceptAuto=()=>{let t=this.profile;return!!t&&te(t)&&this.loggedIn!==!1};start(){this.loop||(this.loop=this.run().finally(()=>{this.loop=null}))}stop(){return this.stopping=!0,this.loop??Promise.resolve()}async run(){try{for(;!this.stopping;){let t=await this.scheduler.nextFor(this.profileId,this.acceptAuto,this.idleCloseMs,()=>this.stopping);if(!t){this.client&&!this.stopping&&!this.userHold&&await this.close();continue}await this.runJob(t),t.kind==="generate"&&!t.dry_run&&await this.pauseBetweenJobs(t)}}finally{await this.close(),this.set({state:"off",current_job:null})}}async pauseBetweenJobs(t){let e=this.getSettings(),i=Math.max(e.pause_min_s,e.pause_max_s);if(i<=0)return;let n=e.pause_min_s+Math.floor(Math.random()*(i-e.pause_min_s+1));if(n<=0)return;this.store.log(t.id,`ngh\u1EC9 ${n} gi\xE2y tr\u01B0\u1EDBc job k\u1EBF (C\xE0i \u0111\u1EB7t \u2192 ngh\u1EC9 ng\u1EABu nhi\xEAn)`);let r=Date.now()+n*1e3;for(;Date.now()<r&&!this.stopping;)await hi(Math.min(1e3,r-Date.now()))}async runJob(t){this.set({state:"busy",current_job:t.id}),this.store.log(t.id,`profile \xAB${this.displayName}\xBB nh\u1EADn job`);try{t.kind==="login"?await this.doLogin(t):t.kind==="check"?await this.doCheck(t):t.kind==="cookies"?await this.doCookies(t):await this.generateWithRetry(t)}catch(e){let curJob=this.store.get(t.id);if(this.abortedJobId===t.id||curJob?.status==="cancelled"){this.store.log(t.id,"Đã dừng task hoàn toàn và giải phóng luồng");return;}this.fail(t,e instanceof Error?e.message:String(e))}finally{this.abortedJobId=null;this.set({state:this.client?"idle":"off",current_job:null})}}async showWindow(t){if(!t)return this.userHold=!1,this.client?.alive&&await this.client.showWindow(!1),!0;let e=await this.open(i=>b.info(this.displayName,i),void 0,!1);return typeof e.ensureOnDola=="function"&&await e.ensureOnDola(),await e.showWindow(!0),this.userHold=!0,!0}userHold=!1;opening=null;async open(t,e,i=!0){if(this.opening){let n=await this.opening;return n.log=t,n}return this.client&&!this.client.alive&&(t("tr\xECnh duy\u1EC7t c\u1EE7a nick \u0111\xE3 \u0111\xF3ng ngo\xE0i \xFD mu\u1ED1n - m\u1EDF l\u1EA1i"),await this.close().catch(()=>{})),this.client?(this.client.log=t,this.client):(this.opening=this.launch(t,e,i).finally(()=>{this.opening=null}),this.opening)}async launch(t,e,i){{this.set({state:"starting"});let n=null,r=this.profile?.proxy;if(r)try{if(isTorProxy(r)){let allP=this.registry?.all?.()||[];let pIdx=allP.findIndex(x=>x.id===this.profileId);let port=torManager.getPortForProfile(r,pIdx>=0?pIdx:0);n={server:`socks5://127.0.0.1:${port}`};}else{n=B(r);}t(`\u0111i qua proxy ${Pt(n)}`)}catch(a){t(`proxy c\u1EE7a nick kh\xF4ng \u0111\u1ECDc \u0111\u01B0\u1EE3c (${a instanceof Error?a.message:a}) - ch\u1EA1y KH\xD4NG proxy`)}if(n&&n.server&&/1905\d|1906\d/.test(n.server)){try{if(!torManager.isReady()){t("Đang đợi mạng Tor kết nối hoàn tất (100%)...");await torManager.start();await torManager.waitForReady(45000);}t(`Tor Exit Node sẵn sàng trên cổng ${n.server}`);}catch(err){t("Cảnh báo Tor: "+(err?.message||err))}}let o=this.clientFactory({profileDir:this.registry.dir(this.profileId),outputDir:this.getOutputDir(),headless:e??this.headless,log:t,proxy:n});try{await o.start()}catch(a){let l=a instanceof Error?a.message:String(a);throw this.set({state:"off"}),n&&ci.test(l)?new S("Proxy c\u1EE7a nick n\xE0y kh\xF4ng k\u1EBFt n\u1ED1i \u0111\u01B0\u1EE3c - ki\u1EC3m tra \u1EDF tab T\xE0i kho\u1EA3n (c\u1ED9t Proxy) ho\u1EB7c b\u1ECF proxy \u0111i."):a}this.client=o,this.loggedIn=null,this.set({state:i?"busy":"idle"})}return this.client.log=t,this.client}async close(){let t=this.client;t&&(this.client=null,this.loggedIn=null,await t.close(),this.set({state:"off"}))}async checkLogin(t){return this.loggedIn===null&&(await t.isLoggedIn(),this.noteSession(await t.sessionInfo()),await this.saveCookies(t)),this.loggedIn===!0}async fetchCookies(){let t=await this.open(i=>b.info(this.displayName,i),void 0,!1),e=await t.exportCookies();return e.some(i=>i.name==="sessionid")||(await t.isLoggedIn().catch(()=>!1),e=await t.exportCookies()),e}async saveCookies(t){if(this.cacheCookies)try{let e=await t.exportCookies();e.length&&this.cacheCookies(this.profileId,e)}catch{}}fail(t,e,i=null){let n=e.toLowerCase(),r=this.getSettings();if(this.profile?.proxy&&ci.test(e)&&(e="Proxy c\u1EE7a nick n\xE0y kh\xF4ng k\u1EBFt n\u1ED1i \u0111\u01B0\u1EE3c - ki\u1EC3m tra \u1EDF tab T\xE0i kho\u1EA3n (c\u1ED9t Proxy) ho\u1EB7c b\u1ECF proxy \u0111i."),n.includes("daily limit")?this.set({credits:0,credits_date:mt(),rest_until:ze(),rest_reason:"H\u1EBFt l\u01B0\u1EE3t trong ng\xE0y"}):/rate limit|too many requests|giới hạn tần suất/.test(n)&&this.set({rest_until:Ye(10),rest_reason:"B\u1ECB gi\u1EDBi h\u1EA1n t\u1EA7n su\u1EA5t"}),t.profile==="auto"&&pn.some(u=>n.includes(u)||e.includes(u)))if(this.store.log(t.id,`l\u1ED7i tr\xEAn \xAB${this.displayName}\xBB: ${e}`),!r.auto_rotate)this.store.log(t.id,"t\u1EF1 \u0111\u1ED5i nick \u0111ang T\u1EAET trong C\xE0i \u0111\u1EB7t - job d\u1EEBng \u1EDF \u0111\xE2y");else if(this.scheduler.requeue(t.id,e)){this.store.log(t.id,"chuy\u1EC3n sang profile kh\xE1c");return}else return void this.finished(t);let o=i??t.result??{},a=this.store.get(t.id)??t,l=ft(a.stage)||!!o.conversation_url,c=Y(e,{conversationUrl:o.conversation_url,videoUrl:o.video_url,sent:l}),d=a.attempts?` (\u0111\xE3 t\u1EF1 th\u1EED l\u1EA1i ${a.attempts} l\u1EA7n)`:"";this.store.update(t.id,{status:"error",error:e,finished:T(),stage:t.kind==="generate"?"failed":a.stage,stage_note:c.hint,result:{...o,error_kind:c.kind,error_hint:c.hint+d,credit_used:c.credit,recover_first:c.recover,dola_response:o.dola_response||(this.store.get(t.id)?.result?.dola_response)||c.hint||e}}),this.finished(t)}finished(t){if(t.kind==="generate")try{this.onJobFinished?.(this.store.get(t.id)??t)}catch{}}pickFilename(t,e,i){if(t.filename)return t.filename;try{let n=zt(this.getSettings().filename_template,{stt:t.seq,prompt:t.prompt,nick:this.displayName,model:t.model,duration:t.duration,ratio:t.ratio}),r=new Set(this.store.list().filter(a=>a.id!==t.id&&a.status==="running"&&a.filename).map(a=>a.filename)),o=Ce(e,n,".mp4",r);return this.store.update(t.id,{filename:o}),o}catch(n){i(`m\u1EABu t\xEAn file l\u1ED7i (${n instanceof Error?n.message:n}) - d\xF9ng t\xEAn m\u1EB7c \u0111\u1ECBnh`);return}}async generateWithRetry(t){for(;;)try{await this.doGenerate(t);return}catch(e){let i=e instanceof Error?e.message:String(e),n=this.store.get(t.id)??t;if(n.status!=="running"||this.stopping)throw e;let r=ft(n.stage)||!!n.result?.conversation_url,o=Y(i,{conversationUrl:n.result?.conversation_url,sent:r}),a=[...this.registry.eligibleIds()].some(h=>h!==this.profileId&&!n.tried.includes(h)),l=0;if(o.transient&&!r&&n.attempts<li?l=Ft.baseMs+Math.floor(Math.random()*(Ft.jitterMs+1)):o.kind==="rate_limit"&&t.profile==="auto"&&!a&&n.attempts<1&&(l=Ft.rateLimitMs+Math.floor(Math.random()*(Ft.rateLimitMs+1))),!l)throw e;let c=n.attempts+1,d=Math.max(1,Math.round(l/1e3));this.store.update(t.id,{attempts:c}),this.store.log(t.id,`${o.kind==="rate_limit"?"b\u1ECB gi\u1EDBi h\u1EA1n t\u1EA7n su\u1EA5t, kh\xF4ng c\xF2n nick kh\xE1c":"l\u1ED7i t\u1EA1m tr\u01B0\u1EDBc khi g\u1EEDi"} (${i}) - t\u1EF1 th\u1EED l\u1EA1i l\u1EA7n ${c}/${o.kind==="rate_limit"?1:li} sau ${d} gi\xE2y tr\xEAn c\xF9ng nick, ch\u01B0a tr\u1EEB credit`),this.stage(t,"queued",`L\u1ED7i t\u1EA1m, t\u1EF1 th\u1EED l\u1EA1i l\u1EA7n ${c} sau ${d} gi\xE2y`,5),(o.kind==="browser"||o.kind==="proxy")&&await this.close().catch(()=>{});let u=Date.now()+l;for(;Date.now()<u&&!this.stopping;)await hi(Math.min(250,u-Date.now()));if(this.stopping)throw e;if(this.store.get(t.id)?.status!=="running")return}}async doGenerate(t){let e=l=>this.store.log(t.id,l);this.stage(t,"browser",this.client?"Tr\xECnh duy\u1EC7t \u1EA9n \u0111\xE3 s\u1EB5n s\xE0ng":yt.browser,8);let i=await this.open(e);if(i.onStage=(l,c,d)=>this.stage(t,l,c,d),i.renderAvgS=this.getRenderAvgS?.(t)??360,this.stage(t,"session",void 0,15),!await this.checkLogin(i))throw new S("Profile ch\u01B0a \u0111\u0103ng nh\u1EADp. B\u1EA5m \xAB\u0110\u0103ng nh\u1EADp\xBB \u1EDF b\u1EA3ng profile.");this.userHold=!1,this.headless&&await i.showWindow(!1).catch(()=>{});let n=this.getOutputDir(),r=t.dry_run?void 0:this.pickFilename(t,n,e),o;if(t.recover_url)o=await i.recover({url:t.recover_url,prompt:t.prompt,waitMinutes:5,filename:r,outDir:n,videoUrl:t.result?.video_url??null});else{let l=t.mode==="pro"?formatProPrompt(t.prompt,t.duration,t.ratio):(this.getSettings().prompt_duration_hint?ai(t.prompt,t.duration,t.ratio):t.prompt);l!==t.prompt&&e(`prompt g\u1EEDi Dola: "${l}"`),o=await i.generate({prompt:l,model:t.model,duration:t.duration,ratio:t.ratio,mode:t.mode,waitMinutes:t.wait,dryRun:t.dry_run,images:t.images.length?t.images:null,filename:r,outDir:n,onSent:c=>this.store.update(t.id,{result:{...(this.store.get(t.id)?.result||t.result||{}),conversation_url:c}}),onReply:rep=>this.store.patch(t.id,{result:{...(this.store.get(t.id)?.result||t.result||{}),dola_response:rep}})})}if(o.credits_left!==null&&this.set({credits:o.credits_left,credits_date:mt()}),o.error){let l=await i.screenshot(ui.default.join(n,`${t.id}-loi.png`));if(l&&e(`\u0111\xE3 ch\u1EE5p m\xE0n h\xECnh l\xFAc l\u1ED7i: ${l}`),!(!!o.conversation_url||!!t.result?.conversation_url)&&Y(o.error,{sent:!1}).transient)throw new S(o.error);this.fail(t,o.error,{...t.result||{},conversation_url:o.conversation_url,credits_left:o.credits_left,video_url:o.video_url??t.result?.video_url??null});return}if(o.video_seconds&&Math.abs(o.video_seconds-t.duration)>2){let l=Math.round(o.video_seconds);e(`video th\u1EF1c t\u1EBF d\xE0i ${l} gi\xE2y (y\xEAu c\u1EA7u ${t.duration} gi\xE2y)`),this.store.update(t.id,{duration:l})}let a={...o,playable:!1,watermark_removed:!1,recovered:!!t.recover_url,dola_response:o.dola_response||(this.store.get(t.id)?.result?.dola_response)||null};if(o.path&&!t.dry_run){let isClean=!!(o.video_url&&(o.video_url.includes("unwatermarked")||o.video_url.includes("lr=unwatermarked")));this.stage(t,"processing","\u0110ang x\u1EED l\xFD video (upscale 1080p Full HD)",95);let l=await He(o.path,{removeWatermark:!isClean&&t.remove_watermark,log:e});a.playable=l.playable,a.watermark_removed=isClean||l.watermarkRemoved,this.thumbFile&&(a.thumb=await Tt(o.path,this.thumbFile(t.id)))}this.store.update(t.id,{status:"done",result:a,error:null,finished:T(),stage:"done",stage_note:yt.done,progress:100}),o.path&&!t.dry_run&&this.onVideoDone?.(),this.finished(t)}async doLogin(t){let e=o=>this.store.log(t.id,o),i=await this.open(e);if(this.set({state:"login"}),await i.isLoggedIn()){this.noteSession(await i.sessionInfo()),e("\u0111\xE3 \u0111\u0103ng nh\u1EADp s\u1EB5n, kh\xF4ng c\u1EA7n m\u1EDF c\u1EEDa s\u1ED5 \u0111\u0103ng nh\u1EADp"),this.store.update(t.id,{status:"done",result:{login:!0},finished:T()});return}await this.close();let n=await this.open(e,!1);this.set({state:"login"});let r=await n.loginInteractive(gn);r?this.noteSession(await n.sessionInfo()):this.noteSession({loggedIn:!1,expires:null}),await this.close(),r?this.store.update(t.id,{status:"done",result:{login:!0},finished:T()}):this.store.update(t.id,{status:"error",error:"H\u1EBFt gi\u1EDD ch\u1EDD \u0111\u0103ng nh\u1EADp (10 ph\xFAt).",finished:T()})}async doCookies(t){let e=o=>this.store.log(t.id,o),i=this.takeCookies?.(this.profileId);if(!i||!i.length)throw new S("Kh\xF4ng c\xF3 cookie n\xE0o \u0111ang ch\u1EDD n\u1EA1p cho t\xE0i kho\u1EA3n n\xE0y. B\u1EA5m \xABD\xE1n cookie\xBB l\u1EA1i.");let n=await this.open(e),r=await n.setCookies(i);this.noteSession(r),r.loggedIn?(e("Dola \u0111\xE3 nh\u1EADn phi\xEAn t\u1EEB cookie, t\xE0i kho\u1EA3n s\u1EB5n s\xE0ng t\u1EA1o video"),await this.saveCookies(n),this.store.update(t.id,{status:"done",result:{login:!0,cookies:i.length},finished:T()})):this.store.update(t.id,{status:"error",finished:T(),result:{login:!1,cookies:i.length},error:"\u0110\xE3 n\u1EA1p cookie nh\u01B0ng Dola kh\xF4ng nh\u1EADn phi\xEAn. Cookie h\u1EBFt h\u1EA1n ho\u1EB7c \u0111\xE3 \u0111\u0103ng xu\u1EA5t \u1EDF tr\xECnh duy\u1EC7t g\u1ED1c - \u0111\u0103ng nh\u1EADp l\u1EA1i dola.com r\u1ED3i xu\u1EA5t cookie m\u1EDBi."})}async doCheck(t){let e=r=>this.store.log(t.id,r),i=await this.open(e);await i.isLoggedIn(),this.noteSession(await i.sessionInfo()),await this.saveCookies(i);let n=this.loggedIn?await i.creditsLeft():null;n!==null&&this.set({credits:n,credits_date:mt()}),e(this.loggedIn?"\u0111\xE3 \u0111\u0103ng nh\u1EADp":"CH\u01AFA \u0111\u0103ng nh\u1EADp"),this.store.update(t.id,{status:"done",result:{login:this.loggedIn,credits:n},finished:T()})}};var di=[5,10,15,30],mn=20*1024*1024,gi=500,fn={"2.5":"Seedance 2.5 (2 credit)","2.0":"Seedance 2.0 Fast","1.0":"Seedance 1.0 (1 credit)"},yn={"9:16":"d\u1ECDc","16:9":"ngang","1:1":"vu\xF4ng","3:4":"d\u1ECDc 3:4","4:3":"ngang 4:3","21:9":"si\xEAu r\u1ED9ng"},m=class extends Error{constructor(e,i){super(i);this.status=e}};function L(s,t=400){try{return s()}catch(e){throw e instanceof m?e:new m(t,e instanceof Error?e.message:String(e))}}var Jt=class{baseDir;headless;idleCloseMs;uploadsDir;registry;store;scheduler;settingsStore;assets;workers=new Map;proxyRotateTimers=new Map;clientFactory;onVideoDone;onJobFinished;openViewer;viewerIds;started=!1;pendingCookies=new Map;statsCache=null;usedOutputDirs=new Set;noteOutputDir(){let t=this.outputDir;R.default.dirname(t)===this.baseDir&&this.usedOutputDirs.add(R.default.basename(t))}constructor(t={}){this.baseDir=t.baseDir??St,this.headless=!!t.headless,this.idleCloseMs=t.idleCloseMs??18e4,this.clientFactory=t.clientFactory,this.onVideoDone=t.onVideoDone,this.onJobFinished=t.onJobFinished,this.openViewer=t.openViewer,this.viewerIds=t.viewerIds,this.uploadsDir=R.default.join(this.baseDir,"uploads");let e=t.settingsFile===void 0?R.default.join(this.baseDir,"settings.json"):t.settingsFile;this.settingsStore=new Mt(e,t.outputDir?{output_dir:t.outputDir}:{}),this.noteOutputDir(),this.registry=new Lt(this.baseDir,()=>this.usedOutputDirs),this.store=new At(R.default.join(this.baseDir,"jobs.json")),this.scheduler=new Rt(this.store,()=>this.registry.eligibleIds()),this.assets=new $t(R.default.join(this.baseDir,"assets")),this.store.onLog=(i,n)=>{let r=i.assigned?this.registry.get(i.assigned)?.name??i.assigned:i.profile!=="auto"?this.registry.get(i.profile)?.name??i.profile:"h\xE0ng \u0111\u1EE3i";b.push(me(n),r,`#${i.seq} ${n}`)}}get settings(){return this.settingsStore.get()}get outputDir(){return this.settingsStore.get().output_dir||_t}start(){if(!this.started){this.started=!0,A.default.mkdirSync(this.outputDir,{recursive:!0}),A.default.mkdirSync(this.uploadsDir,{recursive:!0});for(let t of this.registry.all()){this.startWorker(t.id);if(t.proxy_rotate&&t.proxy_key)this.setupProxyRotation(t.id);}b.info("app",`b\u1EAFt \u0111\u1EA7u nh\u1EADn job, ${this.registry.all().length} t\xE0i kho\u1EA3n`)}}get isStarted(){return this.started}startWorker(t){if(!this.started)return;let e=this.workers.get(t);return e&&e.running||(e=new Nt({profileId:t,registry:this.registry,scheduler:this.scheduler,store:this.store,getOutputDir:()=>this.outputDir,getSettings:()=>this.settings,headless:this.headless,idleCloseMs:this.idleCloseMs,clientFactory:this.clientFactory,onVideoDone:this.onVideoDone,onJobFinished:this.onJobFinished,getRenderAvgS:i=>oi(this.stats(),i.model,i.duration),thumbFile:i=>this.thumbFile(i),cacheCookies:(i,n)=>this.cacheCookies(i,n),takeCookies:i=>{let n=this.pendingCookies.get(i)??null;return this.pendingCookies.delete(i),n}}),this.workers.set(t,e),e.start()),e}async stop(t=1e4){let e=[...this.workers.values()].map(i=>i.stop());this.scheduler.stop(),await Promise.race([Promise.allSettled(e),new Promise(i=>setTimeout(i,t))]),this.store.flush()}stats(){if(this.store.size>2e3&&this.statsCache&&Date.now()-this.statsCache.at<1e4)return this.statsCache.value;let t=si(this.store.list(!1));return this.statsCache={at:Date.now(),value:t},t}state(){for(let n of this.registry.rescan())this.startWorker(n);let t=this.registry.all().map(n=>this.registry.toJSON(n)),e=new Map(t.map(n=>[n.id,n.name])),i=this.store.list().map(n=>({...n,log:n.log.slice(-40),assigned_name:n.assigned?e.get(n.assigned)??n.assigned:null,profile_name:n.profile==="auto"?"T\u1EF1 \u0111\u1ED9ng":e.get(n.profile)??n.profile}));return{profiles:t,jobs:i,meta:{models:Object.keys(K).map(n=>({id:n,label:fn[n]??n,credits:re[n]??null})),ratios:gt,ratio_labels:yn,durations:di,output_dir:this.outputDir,headless:this.headless,started:this.started,paused:this.scheduler.isPaused,stats:this.stats(),settings:this.settings,assets:this.assets.list().length,max_ref_images:Et,log_seq:b.lastSeq,viewers:this.viewerIds?this.viewerIds():[]}}}updateSettings(t){let e=this.outputDir,i=L(()=>this.settingsStore.update(t));return i.settings.output_dir!==e&&(this.noteOutputDir(),b.info("app",`\u0111\u1ED5i th\u01B0 m\u1EE5c l\u01B0u video: ${i.settings.output_dir}`)),this.scheduler.poke(),i}filenamePreview(t){return{preview:L(()=>$e(t)),placeholders:Dt}}submitGenerate(t,e=null){let isPro=t.mode==="pro";let i=(Array.isArray(t.prompts)?t.prompts:[t.prompt??""]).map(f=>String(f??"").trim()).filter(Boolean);if(!i.length)throw new m(400,"prompt tr\u1ED1ng");let n=t.model??"2.5";if(!(n in K)&&!Object.values(K).includes(n))throw new m(400,"model kh\xF4ng h\u1EE3p l\u1EC7");let r=Number(t.duration??(isPro?15:30));if(isPro)r=Math.min(15,r||15);if(!Number.isInteger(r)||r<1||r>300)throw new m(400,"\u0111\u1ED9 d\xE0i kh\xF4ng h\u1EE3p l\u1EC7");let o=t.ratio||null;if(o&&!gt.includes(o))throw new m(400,"ratio kh\xF4ng h\u1EE3p l\u1EC7");let targetProfiles=Array.isArray(t.profiles)&&t.profiles.length?t.profiles.filter(p=>p&&this.registry.get(p)):null;let a=t.profile||"auto";if(a!=="auto"&&!targetProfiles&&!this.registry.get(a))throw new m(400,"profile kh\xF4ng t\u1ED3n t\u1EA1i");let l=this.settings,c=Math.min(20,Math.max(1,Number(t.copies??1)||1)),d=Math.min(120,Math.max(1,Number(t.wait??l.wait_minutes)||l.wait_minutes)),u=typeof t.remove_watermark=="boolean"?t.remove_watermark:l.remove_watermark,h=(t.image_ids??[]).map(f=>this.uploadPath(f)),p=t.per_image&&h.length>1?h.map(f=>[f]):[h],y=i.length*p.length*c;if(y>gi)throw new m(400,`M\u1ED9t l\u1EA7n t\u1ED1i \u0111a ${gi} video (\u0111ang xin ${y}). B\u1EDBt prompt, \u1EA3nh ho\u1EB7c s\u1ED1 b\u1EA3n.`);let x=this.quotaLeft(e,y),N=se.default.randomBytes(3).toString("hex"),g=[];
let allProfs=this.registry.all().filter(prof=>prof.enabled&&prof.login!==!1&&!je(prof));
let getCreds=(prof)=>prof.credits_date===mt()?(typeof prof.credits==="number"?Math.max(0,prof.credits):2):2;
let isBusy=(id)=>{let prof=this.registry.get(id);return !prof||prof.state==="busy"||prof.state==="starting"||prof.state==="login"||this.store.list().some(j=>j.status==="running"&&j.assigned===id)};

if(a!=="auto"&&!targetProfiles){
  let chosen=this.registry.get(a);
  if(chosen&&isBusy(a)){
    let idleAlt=allProfs.find(p=>p.id!==a&&!isBusy(p.id)&&getCreds(p)>0);
    if(idleAlt){
      b.info("hàng đợi",`Nick «${chosen.name}» đang bận — Tự động chuyển prompt sang «${idleAlt.name}» để chạy song song ngay!`);
      a=idleAlt.id;
    }else{
      a="auto";
    }
  }
}

let candList=(targetProfiles&&targetProfiles.length)?targetProfiles.map(id=>this.registry.get(id)).filter(Boolean):allProfs.filter(p=>getCreds(p)>0);
candList.sort((p1,p2)=>(isBusy(p1.id)?1:0)-(isBusy(p2.id)?1:0));

let queuedCnt={};
for(let qj of this.store.queued()){if(qj.assigned)queuedCnt[qj.assigned]=(queuedCnt[qj.assigned]||0)+1;}
let candQuota=candList.map(p=>({id:p.id,remain:Math.max(0,getCreds(p)-(queuedCnt[p.id]||0))})).filter(item=>item.remain>0);

let quotaSlots=[];
for(let pass=0;pass<2;pass++){
  for(let item of candQuota){
    if(item.remain>pass)quotaSlots.push(item.id);
  }
}

t:for(let f of i)for(let _ of p){
  let I=this.assets.resolveMentions(f,Math.max(0,Et-_.length));
  for(let X=0;X<c;X++){
    if(g.length>=x)break t;
    let jobProfile=(a==="auto"||(targetProfiles&&targetProfiles.length))?(quotaSlots.length?quotaSlots[g.length%quotaSlots.length]:"auto"):a;
    let q=wt({kind:"generate",profile:jobProfile,prompt:I.prompt,model:n,duration:r,ratio:o,images:[..._,...I.images],assets:I.tags,batch:N,dry_run:!!t.dry_run,remove_watermark:u,wait:d,mode:isPro?"pro":"normal"});
    this.scheduler.submit(q),g.push(q.id)
  }
}return b.info("h\xE0ng \u0111\u1EE3i",`th\xEAm ${g.length} video v\xE0o h\xE0ng \u0111\u1EE3i (${i.length} prompt \xD7 ${p.length} b\u1ED9 \u1EA3nh \xD7 ${c} b\u1EA3n)`),g}quotaLeft(t,e){return e;}retry(t,e=null,i={}){let n=this.store.get(t);if(!n)throw new m(404,"kh\xF4ng c\xF3 job");if(n.status==="queued"||n.status==="running")throw new m(400,"job \u0111ang ch\u1EA1y ho\u1EB7c \u0111ang ch\u1EDD");n.kind==="generate"&&!n.dry_run&&this.quotaLeft(e,1);let r=ei(n);return i.duration&&di.includes(i.duration)&&(r.duration=i.duration),this.scheduler.submit(r),r.id}recover(t,e=null){let i=this.store.get(t);if(!i)throw new m(404,"kh\xF4ng c\xF3 job");if(i.kind!=="generate"||i.dry_run)throw new m(400,"ch\u1EC9 l\u1EA5y l\u1EA1i \u0111\u01B0\u1EE3c video c\u1EE7a job t\u1EA1o video");if(i.status==="queued"||i.status==="running")throw new m(400,"job \u0111ang ch\u1EA1y ho\u1EB7c \u0111ang ch\u1EDD");let n=i.result?.conversation_url;if(!n)throw new m(400,"Job n\xE0y ch\u01B0a g\u1EEDi \u0111\u01B0\u1EE3c y\xEAu c\u1EA7u t\u1EDBi Dola n\xEAn kh\xF4ng c\xF3 g\xEC \u0111\u1EC3 l\u1EA5y l\u1EA1i. B\u1EA5m \xABCh\u1EA1y l\u1EA1i\xBB.");let r=i.assigned;if(!r||!this.registry.get(r))throw new m(400,"T\xE0i kho\u1EA3n \u0111\xE3 ch\u1EA1y job n\xE0y kh\xF4ng c\xF2n trong danh s\xE1ch.");if(this.quotaLeft(e,1),i.profile=r,i.recover_url=n,this.startWorker(r),!this.scheduler.resubmit(t))throw new m(400,"kh\xF4ng \u0111\u01B0a job v\xE0o h\xE0ng \u0111\u1EE3i \u0111\u01B0\u1EE3c");return this.store.log(t,"l\u1EA5y l\u1EA1i video t\u1EEB cu\u1ED9c tr\xF2 chuy\u1EC7n c\u0169 tr\xEAn Dola, kh\xF4ng g\u1EEDi y\xEAu c\u1EA7u m\u1EDBi"),t}async cancel(t){let job=this.store.get(t);if(!job)throw new m(404,"Không tìm thấy job");if(job.status==="queued"){if(!this.scheduler.cancel(t))throw new m(400,"Không thể huỷ job đang chờ");return;}if(job.status==="running"){this.store.patch(t,{status:"cancelled",stage:"cancelled",stage_note:"Đã dừng task tức thì theo yêu cầu",finished:T(),error:"Đã dừng theo yêu cầu người dùng"});this.store.log(t,"Đã bấm dừng task tức thì — đang giải phóng luồng...");let targetWorker=[...this.workers.values()].find(w=>w.profileId===job.assigned||w.profile?.current_job===t);if(targetWorker){await targetWorker.abortCurrentJob(t).catch(()=>{})}this.scheduler.signal?.notifyAll?.();this.scheduler.poke?.();return;}throw new m(400,"Job đã kết thúc, không thể huỷ");}delete(t){let e=this.store.get(t);if(!e)throw new m(404,"kh\xF4ng c\xF3 job");if(e.status==="running")throw new m(400,"job \u0111ang ch\u1EA1y, ch\u1EDD xong r\u1ED3i xo\xE1");e.status==="queued"&&this.scheduler.cancel(t),this.store.remove(t);try{A.default.rmSync(this.thumbFile(t),{force:!0})}catch{}}bulk(t,e,i=null){let n=["error","interrupted","cancelled"],r;t==="retry_failed"?r=this.store.list(!1).filter(l=>l.kind==="generate"&&n.includes(l.status)).map(l=>l.id):t==="delete_done"?r=this.store.list(!1).filter(l=>l.status==="done").map(l=>l.id):t==="cancel_queued"?r=this.store.queued().map(l=>l.id):r=Array.isArray(e)?e.map(String):[];let o=t.startsWith("retry")?"retry":t.startsWith("delete")?"delete":"cancel",a={ok:0,skipped:0,errors:[]};for(let l of r)try{o==="retry"?this.retry(l,i):o==="delete"?this.delete(l):this.cancel(l),a.ok++}catch(c){if(c instanceof m&&c.status===402)throw new m(402,`${c.message} (\u0111\xE3 l\xE0m ${a.ok}/${r.length})`);a.skipped++,a.errors.length<3&&a.errors.push(c instanceof Error?c.message:String(c))}return a}pause(t){this.scheduler.pause(t),b.info("h\xE0ng \u0111\u1EE3i",t?"t\u1EA1m d\u1EEBng h\xE0ng \u0111\u1EE3i - job \u0111ang ch\u1EA1y v\u1EABn ch\u1EA1y n\u1ED1t":"ch\u1EA1y ti\u1EBFp h\xE0ng \u0111\u1EE3i")}videoPath(t){let e=this.store.get(t),i=e?.result?.path;if(!e||!i)throw new m(404,"ch\u01B0a c\xF3 video");if(!A.default.existsSync(i))throw new m(404,"file kh\xF4ng c\xF2n t\u1ED3n t\u1EA1i");return i}get thumbsDir(){return R.default.join(this.baseDir,"thumbs")}thumbFile(t){return R.default.join(this.thumbsDir,`${t}.jpg`)}async thumbPath(t){let e=this.thumbFile(t);if(A.default.existsSync(e))return e;let i=this.videoPath(t);if(!await Tt(i,e))throw new m(404,"kh\xF4ng t\u1EA1o \u0111\u01B0\u1EE3c \u1EA3nh thu nh\u1ECF");let r=this.store.get(t);return r&&this.store.patch(t,{result:{...r.result||{},thumb:!0}}),e}activeQuickAdd=null;async quickAddStart(t,e={}){let name=String(t||"").trim();if(!name){let count=this.registry.all().length+1;name="Nick "+count;}let isRotate=!!e.proxy_rotate;let rotKey=e.proxy_key?String(e.proxy_key).trim():(isRotate&&e.proxy?String(e.proxy).trim():null);let proxyStr=null;
if(e.proxy){try{proxyStr=nt(B(e.proxy));}catch{}}
if(isRotate&&rotKey){if(!proxyStr){try{let d=await fetchProxyXoay(rotKey);if(d.status===100&&d.proxyhttp){let clean=String(d.proxyhttp).replace(/::+$/,"").replace(/:+$/,"");proxyStr=nt(B(clean));}}catch{}}}
let p=L(()=>this.registry.add(name));
if(isRotate&&rotKey){this.registry.update(p.id,{proxy_rotate:true,proxy_key:rotKey,proxy:proxyStr});this.setupProxyRotation(p.id);}
else if(proxyStr){this.registry.update(p.id,{proxy:proxyStr});}if(this.activeQuickAdd){try{await this.activeQuickAdd.client?.close()}catch{}this.activeQuickAdd=null;}let client=new It({profileDir:this.registry.dir(p.id),outputDir:this.outputDir,headless:!1,log:msg=>b.info(p.name,msg),proxy:proxyStr?B(proxyStr):null});try{await client.start();await client.ensureOnDola().catch(()=>{});this.activeQuickAdd={profileId:p.id,client};return{ok:!0,profile:this.registry.toJSON(p)};}catch(err){try{await client.close()}catch{}try{await this.removeProfile(p.id)}catch{}throw err;}}async quickAddConfirm(t,e){let targetId=t||this.activeQuickAdd?.profileId;if(!targetId)throw new m(400,"Không có phiên đăng nhập nhanh nào đang chờ.");let p=this.registry.get(targetId);if(!p)throw new m(404,"Không tìm thấy profile.");if(typeof e=="string"&&e.trim()&&e.trim()!==p.name){this.registry.update(targetId,{name:e.trim()});p=this.registry.get(targetId);}let client=this.activeQuickAdd?.client,cookies=[],sess=null;if(client&&client.alive){cookies=await client.exportCookies();sess=await client.sessionInfo();}else{let tempClient=new It({profileDir:this.registry.dir(targetId),outputDir:this.outputDir,headless:!0,log:()=>{},proxy:p.proxy?B(p.proxy):null});try{await tempClient.start();cookies=await tempClient.exportCookies();sess=await tempClient.sessionInfo();}finally{await tempClient.close().catch(()=>{});}}let hasSession=cookies.some(c=>(c.name==="sessionid"||c.name==="sid_tt")&&c.value);if(!sess?.loggedIn&&!hasSession){throw new m(400,"Chưa phát hiện phiên đăng nhập Dola trên trình duyệt. Vui lòng đăng nhập trên cửa sổ Chrome vừa mở rồi bấm lại nút này.");}this.cacheCookies(targetId,cookies);let credits=null;if(client&&client.alive){credits=await client.creditsLeft().catch(()=>null);}this.registry.update(targetId,{enabled:!0,login:!0,session_expires:sess?.expires||null,last_check:new Date().toISOString(),...(credits!==null?{credits,credits_date:mt()}:{})});if(client){await client.close().catch(()=>{});}this.activeQuickAdd=null;this.startWorker(targetId);b.info("app","Thêm tài khoản nhanh thành công: "+p.name+" ("+cookies.length+" cookie)");return{ok:!0,profile:this.registry.toJSON(this.registry.get(targetId))};}async quickAddCancel(t){let targetId=t||this.activeQuickAdd?.profileId;if(this.activeQuickAdd){try{await this.activeQuickAdd.client?.close()}catch{}this.activeQuickAdd=null;}if(targetId){let p=this.registry.get(targetId);if(p&&p.login!==!0){await this.removeProfile(targetId).catch(()=>{});}}return{ok:!0};}async quickAddFb(rawFbData,opts={}){let parsed=parseFbAccount(rawFbData);if(!parsed.cookies||parsed.cookies.length===0)throw new m(400,"Không tìm thấy cookie Facebook hợp lệ trong dữ liệu nhập (cần ít nhất c_user hoặc xs).");let name=String(opts.name||"").trim();if(!name){if(parsed.uid){name="FB - "+parsed.uid}else{let count=this.registry.all().length+1;name="Nick "+count}}let isRotateFb=!!opts.proxy_rotate;let rotKeyFb=opts.proxy_key?String(opts.proxy_key).trim():(isRotateFb&&opts.proxy?String(opts.proxy).trim():null);let proxyStr=null;
if(opts.proxy){try{proxyStr=nt(B(opts.proxy));}catch{}}
if(isRotateFb&&rotKeyFb){if(!proxyStr){try{let d=await fetchProxyXoay(rotKeyFb);if(d.status===100&&d.proxyhttp){let clean=String(d.proxyhttp).replace(/::+$/,"").replace(/:+$/,"");proxyStr=nt(B(clean));}}catch{}}}
let p=L(()=>this.registry.add(name));
if(isRotateFb&&rotKeyFb){this.registry.update(p.id,{proxy_rotate:true,proxy_key:rotKeyFb,proxy:proxyStr});this.setupProxyRotation(p.id);}
else if(proxyStr){this.registry.update(p.id,{proxy:proxyStr});}let client=new It({profileDir:this.registry.dir(p.id),outputDir:this.outputDir,headless:!1,log:msg=>b.info(p.name,msg),proxy:proxyStr?B(proxyStr):null});try{await client.start();let dolaCookies=await client.autoLoginFacebook(parsed.cookies,msg=>b.info(p.name,msg));this.cacheCookies(p.id,dolaCookies);try{let freshFb=await client.context.cookies(["https://www.facebook.com","https://facebook.com"]).catch(()=>[]);this.cacheFbCookies(p.id,freshFb&&freshFb.length?freshFb:parsed.cookies)}catch{this.cacheFbCookies(p.id,parsed.cookies)}let credits=null;try{credits=await client.creditsLeft()}catch{}let sess=null;try{sess=await client.sessionInfo()}catch{}this.registry.update(p.id,{enabled:!0,login:!0,session_expires:sess?.expires||null,last_check:new Date().toISOString(),...(credits!==null?{credits,credits_date:mt()}:{})});await client.close().catch(()=>{});this.startWorker(p.id);b.info("app","Thêm tài khoản FB tự động thành công: "+p.name+" ("+dolaCookies.length+" cookie)");return{ok:!0,profile:this.registry.toJSON(this.registry.get(p.id))}}catch(err){try{await client.close()}catch{}try{await this.removeProfile(p.id)}catch{}throw err}}async updateFbCookies(t,e){let i=this.registry.get(t);if(!i)throw new m(400,"profile không tồn tại");if(i.current_job)throw new m(400,`«${i.name}» đang bận chạy video, vui lòng đợi video xong.`);let n=parseFbAccount(e);if(!n.cookies||!n.cookies.length)throw new m(400,"Không tìm thấy cookie Facebook hợp lệ trong dữ liệu nhập (cần ít nhất c_user hoặc xs).");this.activeBrowsers&&this.activeBrowsers.has(t)&&(this.activeBrowsers.get(t).close().catch(()=>{}),this.activeBrowsers.delete(t));let r=this.workers.get(t);if(r&&r.client){let a=r.client;r.client=null,r.loggedIn=null;try{await a.close()}catch{}}let o=new It({profileDir:this.registry.dir(i.id),outputDir:this.outputDir,headless:!1,log:a=>b.info(i.name,a),proxy:i.proxy?B(i.proxy):null});try{await o.start();let a=await o.autoLoginFacebook(n.cookies,l=>b.info(i.name,l));this.cacheCookies(i.id,a);try{let freshFb=await o.context.cookies(["https://www.facebook.com","https://facebook.com"]).catch(()=>[]);this.cacheFbCookies(i.id,freshFb&&freshFb.length?freshFb:n.cookies)}catch{this.cacheFbCookies(i.id,n.cookies)}let l=null;try{l=await o.creditsLeft()}catch{}let c=null;try{c=await o.sessionInfo()}catch{}this.registry.update(i.id,{enabled:!0,login:!0,session_expires:c?.expires||null,last_check:new Date().toISOString(),...l!==null?{credits:l,credits_date:mt()}:{}}),await o.close().catch(()=>{}),this.startWorker(i.id),b.info("app",`Cập nhật cookie FB thành công cho ${i.name} (${a.length} cookie Dola)`);return{ok:!0,profile:this.registry.toJSON(this.registry.get(i.id))}}catch(a){try{await o.close()}catch{}throw a}};async autoResetProfileCredit(t){let i=this.registry.get(t);if(!i)throw new m(400,"profile không tồn tại");if(i.current_job)throw new m(400,`«${i.name}» đang bận chạy video. Vui lòng đợi video xong.`);this.activeBrowsers&&this.activeBrowsers.has(t)&&(this.activeBrowsers.get(t).close().catch(()=>{}),this.activeBrowsers.delete(t));let r=this.workers.get(t);if(r&&r.client){let a=r.client;r.client=null,r.loggedIn=null;try{await a.close()}catch{}}It.killOrphans(this.registry.dir(i.id));await new Promise(res=>setTimeout(res,600));let fbc=this.fbCookies(i.id);b.info(i.name,"[Auto Reset] Chạy trực tiếp không qua proxy để xóa nick và đăng nhập lại...");let o=new It({profileDir:this.registry.dir(i.id),outputDir:this.outputDir,headless:!1,log:a=>b.info(i.name,a),proxy:null,executablePath:xt()});try{await o.start();await o.showWindow(!0).catch(()=>{});let a=await o.autoResetCredit(fbc,l=>b.info(i.name,l));this.cacheCookies(i.id,a);try{let freshFb=await o.context.cookies(["https://www.facebook.com","https://facebook.com"]).catch(()=>[]);freshFb&&freshFb.length&&this.cacheFbCookies(i.id,freshFb)}catch{}let l=null;try{l=await o.creditsLeft()}catch{}if(l===null)l=10;let c=null;try{c=await o.sessionInfo()}catch{}this.registry.update(i.id,{enabled:!0,login:!0,session_expires:c?.expires||null,last_check:new Date().toISOString(),rest_until:null,rest_reason:null,...l!==null?{credits:l,credits_date:mt()}:{}});await o.close().catch(()=>{});this.startWorker(i.id);this.scheduler.poke();b.info("app",`Auto reset credit thành công cho ${i.name} (Credit mới: ${l??'đã cập nhật'})`);return{ok:!0,profile:this.registry.toJSON(this.registry.get(i.id)),credits:l}}catch(a){try{await o.close()}catch{}throw a}};addProfile(t,e={}){let i=null;typeof e.cookies=="string"&&e.cookies.trim()&&(i=L(()=>Ot(e.cookies)));let n=e.proxy?L(()=>nt(B(e.proxy))):null,r=L(()=>this.registry.add(t));return n&&this.registry.update(r.id,{proxy:n}),this.startWorker(r.id),i?(this.pendingCookies.set(r.id,i),{profile:this.registry.toJSON(r),login_job:this.pinnedJob(r.id,"cookies")}):{profile:this.registry.toJSON(r),login_job:this.requestLogin(r.id)}}addProfilesBulk(t,e=""){let i=wn(t);if(!i.length)throw new m(400,"Ch\u01B0a c\xF3 b\u1ED9 cookie n\xE0o. M\u1ED7i t\xE0i kho\u1EA3n m\u1ED9t kh\u1ED1i JSON (Cookie-Editor \u2192 Export) ho\u1EB7c m\u1ED9t d\xF2ng name=value; \u2026");let n=String(e??"").split(/\r?\n/).map(l=>l.trim()).filter(Boolean),r={added:[],errors:[]},o=new Set,a=this.registry.all().length;return i.forEach((l,c)=>{try{let d=Ot(l),u=d.find(x=>x.name==="sessionid")?.value??"";if(u&&o.has(u)){r.errors.push({line:c+1,reason:"tr\xF9ng phi\xEAn v\u1EDBi m\u1ED9t kh\u1ED1i \u1EDF tr\xEAn, \u0111\xE3 b\u1ECF"});return}u&&o.add(u);let h=d.find(x=>x.name==="uid_tt")?.value??"",p=h?`Nick ${h.slice(-6)}`:`Nick ${a+r.added.length+1}`,y=this.addProfile(p,{cookies:l,proxy:n[c]??null});r.added.push({id:y.profile.id,name:y.profile.name})}catch(d){r.errors.push({line:c+1,reason:d instanceof Error?d.message:String(d)})}}),b.info("app",`th\xEAm nhi\u1EC1u nick: ${r.added.length} t\xE0i kho\u1EA3n, ${r.errors.length} kh\u1ED1i l\u1ED7i`),r}importCookies(t,e){if(!this.registry.get(t))throw new m(404,"kh\xF4ng c\xF3 profile");let i=L(()=>Ot(e));return this.pendingCookies.set(t,i),this.pinnedJob(t,"cookies")}async removeProfile(t){this.clearProxyRotation(t);let e=this.registry.get(t);if(!e)throw new m(404,"kh\xF4ng c\xF3 profile");if(e.current_job)throw new m(400,`\xAB${e.name}\xBB \u0111ang ch\u1EA1y job, ch\u1EDD xong r\u1ED3i xo\xE1`);for(let n of this.store.queued())n.profile===t&&this.scheduler.cancel(n.id);let i=this.workers.get(t);if(i){let n=i.stop();this.scheduler.poke(),await Promise.race([n,new Promise(r=>setTimeout(r,8e3))]),this.workers.delete(t)}this.pendingCookies.delete(t),this.registry.remove(t),this.scheduler.poke()}checkAll(){let t=[];for(let e of this.registry.all())e.current_job||t.push(this.requestCheck(e.id));return t}

setupProxyRotation(profileId) {
  this.clearProxyRotation(profileId);
  let profile = this.registry.get(profileId);
  if (!profile || !profile.proxy_rotate || !profile.proxy_key) return;
  let timer = setInterval(() => {
    this.rotateProfileProxy(profileId).catch(err => {
      b.warn(profile.name, "[Proxy xoay] Lỗi timer: " + err.message);
    });
  }, 70000);
  this.proxyRotateTimers.set(profileId, timer);
}

clearProxyRotation(profileId) {
  if (this.proxyRotateTimers.has(profileId)) {
    clearInterval(this.proxyRotateTimers.get(profileId));
    this.proxyRotateTimers.delete(profileId);
  }
}

async rotateProfileProxy(profileId) {
  let profile = this.registry.get(profileId);
  if (!profile || !profile.proxy_rotate || !profile.proxy_key) return null;
  try {
    let data = await fetchProxyXoay(profile.proxy_key);
    if (data.status === 100 && data.proxyhttp) {
      let clean = String(data.proxyhttp).replace(/::+$/, "").replace(/:+$/, "");
      let parsed = B(clean);
      let canonical = nt(parsed);
      this.registry.update(profileId, { proxy: canonical });
      b.info(profile.name, "[Proxy xoay] Đã xoay IP mới: " + clean + (data["Vi Tri"] ? " (" + data["Vi Tri"] + ")" : ""));
      let w = this.workers.get(profileId);
      if (w && !profile.current_job) {
        await w.close().catch(() => {});
        w.stop();
        this.workers.delete(profileId);
        this.startWorker(profileId);
      }
      return canonical;
    } else {
      b.warn(profile.name, "[Proxy xoay] Chưa xoay được IP: " + (data.message || "status " + data.status));
    }
  } catch (err) {
    b.warn(profile.name, "[Proxy xoay] Lỗi kết nối proxyxoay.shop: " + err.message);
  }
  return null;
}

async checkRotatingProxy(key) {
  let k = String(key || "").trim();
  if (!k) throw new m(400, "Vui lòng nhập key proxy xoay");
  try {
    let data = await fetchProxyXoay(k);
    if (data.status === 100 && data.proxyhttp) {
      let clean = String(data.proxyhttp).replace(/::+$/, "").replace(/:+$/, "");
      let parsed = B(clean);
      return {
        ok: true,
        status: 100,
        proxyhttp: clean,
        canonical: nt(parsed),
        masked: Pt(parsed),
        ip: clean,
        message: data.message || "Thành công",
        location: data["Vi Tri"] || data["Vi tri"] || "Không rõ",
        isp: data["Nha Mang"] || data["Nha mang"] || "Không rõ",
        expires: data["Token expiration date"] || ""
      };
    } else {
      return {
        ok: false,
        status: data.status,
        error: data.message || ("Lỗi status " + data.status + " từ nhà cung cấp proxy")
      };
    }
  } catch (err) {
    return {
      ok: false,
      error: err.message
    };
  }
}


async patchProfile(t, e) {
  let i = {}, n;
  if (typeof e.name == "string" && e.name.trim() && (i.name = e.name.trim()),
      typeof e.enabled == "boolean" && (i.enabled = e.enabled),
      e.proxy_rotate !== void 0) {
    i.proxy_rotate = !!e.proxy_rotate;
    if (i.proxy_rotate) {
      if (typeof e.proxy_key === "string") i.proxy_key = e.proxy_key.trim();
    } else {
      i.proxy_key = null;
    }
  }
  if (e.proxy !== void 0 && !i.proxy_rotate) {
    let o = String(e.proxy ?? "").trim();
    if (!o) i.proxy = null;
    else {
      let a = L(() => B(o));
      i.proxy = nt(a), n = Vt(a) ?? void 0;
    }
  }
  let r = this.registry.update(t, i);
  if (!r) throw new m(404, "không có profile");

  if (i.proxy_rotate) {
    if (i.proxy_key) {
      await this.rotateProfileProxy(t);
      this.setupProxyRotation(t);
    }
  } else if (i.proxy_rotate === false) {
    this.clearProxyRotation(t);
  }

  if ("proxy" in i && !i.proxy_rotate) {
    let o = this.workers.get(t);
    o && !r.current_job && (o.stop(), this.workers.delete(t), this.startWorker(t));
  }
  return this.scheduler.poke(), { ...this.registry.toJSON(r), ...n ? { warning: n } : {} };
}
assignProxies(){let t=this.settings.proxy_pool,e=this.registry.all().filter(r=>!r.proxy);if(!t.length)throw new m(400,"Danh s\xE1ch proxy \u1EDF C\xE0i \u0111\u1EB7t \u0111ang tr\u1ED1ng. D\xE1n proxy v\xE0o \u0111\xF3 tr\u01B0\u1EDBc (m\u1ED7i d\xF2ng m\u1ED9t proxy).");if(!e.length)return{pool:t.length,assigned:0,shared:0,without:0};let i=0;e.forEach((r,o)=>{this.registry.update(r.id,{proxy:t[o%t.length]}),i++});let n=Math.max(0,e.length-t.length);return b.info("app",`chia proxy: ${i} nick nh\u1EADn proxy t\u1EEB ${t.length} proxy${n?`, ${n} nick ph\u1EA3i d\xF9ng chung`:""}`),{pool:t.length,assigned:i,shared:n,without:0}}wakeProfile(t){let e=this.registry.update(t,{rest_until:null,rest_reason:null});if(!e)throw new m(404,"kh\xF4ng c\xF3 profile");return this.scheduler.poke(),this.registry.toJSON(e)}async checkProxies(t){let e=(Array.isArray(t)?t:[]).map(String).map(o=>o.trim()).filter(Boolean).slice(0,50),i=[],n=0,r=async()=>{for(;n<e.length;){let o=e[n++],a;try{a=B(o)}catch(l){i.push({text:o,ok:!1,ms:0,error:l.message});continue}i.push({text:o,...await _e(a)})}};return await Promise.all(Array.from({length:Math.min(8,e.length)},r)),e.map(o=>i.find(a=>a.text===o))}pinnedJob(t,e){let i=this.registry.get(t);if(!i)throw new m(404,"kh\xF4ng c\xF3 profile");if(i.current_job)throw new m(400,`profile \xAB${i.name}\xBB \u0111ang b\u1EADn, ch\u1EDD job hi\u1EC7n t\u1EA1i xong`);this.startWorker(t);let n=wt({kind:e,profile:t,prompt:`[${e}] ${i.name}`});return this.scheduler.submit(n),n.id}requestLogin(t){return this.pinnedJob(t,"login")}requestCheck(t){return this.pinnedJob(t,"check")}cookieFile(t){return R.default.join(this.registry.dir(t),"dola-cookies.json")}cacheCookies(t,e){try{A.default.mkdirSync(this.registry.dir(t),{recursive:!0}),A.default.writeFileSync(this.cookieFile(t),JSON.stringify(e))}catch{}}dolaCookies(t){try{let e=JSON.parse(A.default.readFileSync(this.cookieFile(t),"utf-8"));return Array.isArray(e)?e:[]}catch{return[]}}fbCookieFile(t){return R.default.join(this.registry.dir(t),"fb-cookies.json")}cacheFbCookies(t,e){try{A.default.mkdirSync(this.registry.dir(t),{recursive:!0}),A.default.writeFileSync(this.fbCookieFile(t),JSON.stringify(e))}catch{}}fbCookies(t){try{let e=JSON.parse(A.default.readFileSync(this.fbCookieFile(t),"utf-8"));return Array.isArray(e)?e:[]}catch{return[]}}async openRealBrowser(t){let i=this.registry.get(t);if(!i)throw new m(400,"profile không tồn tại");if(i.current_job)throw new m(400,`«${i.name}» đang bận chạy video. Vui lòng đợi video xong trước khi mở Chrome.`);this.activeBrowsers=this.activeBrowsers||new Map();if(this.activeBrowsers.has(t)){let c=this.activeBrowsers.get(t);try{let p=c.pages();if(p.length){await p[0].bringToFront();return}}catch{}}let w=this.workers.get(t);if(w&&w.client){let cl=w.client;w.client=null;w.loggedIn=null;try{await cl.close()}catch{}}let dir=this.registry.dir(t),exe=xt();if(!exe)throw new m(400,"Không tìm thấy Chromium.");let po=void 0,cr=void 0;if(i.proxy)try{let bp=B(i.proxy);po={server:bp.server};bp.username&&(cr={username:bp.username,password:bp.password||""})}catch{}let ctx=await We.chromium.launchPersistentContext(dir,{headless:!1,executablePath:exe,viewport:null,proxy:po,httpCredentials:cr,args:["--no-first-run","--no-default-browser-check","--disable-blink-features=AutomationControlled","--window-size=1280,900","--window-position=100,60"]});this.activeBrowsers.set(t,ctx);let lastSeenCredits=null,lastSeenLoggedIn=!1,lastSessionExpires=null,closedHandled=!1;let doSync=async()=>{try{let allCookies=await ctx.cookies().catch(()=>[]);if(allCookies&&allCookies.length){let dola=allCookies.filter(c=>/dola\.com|bytedance|byteoversea|tiktok/i.test(c.domain||""));if(dola.length){this.cacheCookies(t,dola);let sessCookie=dola.find(c=>c.name==="sessionid"||c.name==="sid_tt");if(sessCookie&&sessCookie.value){lastSeenLoggedIn=!0;if(sessCookie.expires>0)lastSessionExpires=new Date(sessCookie.expires*1000).toISOString()}}let fb=allCookies.filter(c=>/facebook\.com/i.test(c.domain||""));if(fb.length)this.cacheFbCookies(t,fb)}let pages=ctx.pages();for(let p of pages){if(p.isClosed())continue;let txt=await p.innerText("body").catch(()=>"");let match=txt.match(Xi);if(match)lastSeenCredits=Number(match[1]);let hasAvatar=await p.locator('img[src*="ibyteimg"], img[src*="user-avatar"]').first().isVisible().catch(()=>false);if(hasAvatar)lastSeenLoggedIn=!0}}catch{}};let syncTimer=setInterval(doSync,2000);let onClosed=async()=>{if(closedHandled)return;closedHandled=!0;clearInterval(syncTimer);this.activeBrowsers.delete(t);try{await doSync()}catch{}let curCookies=this.dolaCookies(t);let hasSess=curCookies.some(c=>(c.name==="sessionid"||c.name==="sid_tt")&&c.value);let isLog=hasSess||lastSeenLoggedIn;this.registry.update(t,{login:isLog,session_expires:lastSessionExpires,last_check:new Date().toISOString(),...(lastSeenCredits!==null?{credits:lastSeenCredits,credits_date:mt()}:{})});this.startWorker(t);this.scheduler.poke();b.info("app",`Đã đóng trình duyệt «${i.name}»: tự động cập nhật cookie (${curCookies.length} cookie), trạng thái: ${isLog?'đã đăng nhập':'chưa đăng nhập'}${lastSeenCredits!==null?', '+lastSeenCredits+' credit':''}`);if(isLog&&lastSeenCredits===null){this.requestCheck(t)}};ctx.on("close",onClosed);ctx.on("page",newP=>{newP.on("close",async()=>{await doSync();let activeP=ctx.pages().filter(p=>!p.isClosed());if(activeP.length===0){try{await ctx.close()}catch{}}})});try{let fbc=this.fbCookies(t);if(fbc.length){let oneYear=Math.floor(Date.now()/1000)+365*86400;let normFb=fbc.map(c=>({name:c.name.trim(),value:c.value.trim(),domain:c.domain&&c.domain.includes("facebook")?c.domain:".facebook.com",path:c.path||"/",secure:!0,httpOnly:c.httpOnly??(c.name==="xs"||c.name==="datr"),sameSite:"Lax",expires:c.expires&&c.expires>0?Math.floor(c.expires):(c.expirationDate&&c.expirationDate>0?Math.floor(c.expirationDate):oneYear)}));await ctx.addCookies(normFb)}let dlc=this.dolaCookies(t);if(dlc.length)await ctx.addCookies(dlc)}catch{}let pg=ctx.pages()[0]||await ctx.newPage(),u=pg.url();(!u||u==="about:blank"||u.startsWith("chrome://"))&&await pg.goto(G,{waitUntil:"domcontentloaded"}).catch(()=>{})}async showProfileWindow(t,e,mode){let i=this.registry.get(t);if(!i)throw new m(400,"profile không tồn tại");if(mode==="browser")return await this.openRealBrowser(t);if(this.openViewer){let o=async()=>{let a=this.dolaCookies(t);if(a.length)return a;let l=this.workers.get(t)??this.startWorker(t);if(!l)return[];let c=await l.fetchCookies();return c.length&&this.cacheCookies(t,c),c};try{await this.openViewer({profileId:t,name:i.name,getCookies:o,proxy:i.proxy,url:G},e)}catch(a){throw new m(400,a instanceof Error?a.message:String(a))}return}let n=this.workers.get(t),r=!1;try{r=n?await n.showWindow(e):!1}catch(o){throw new m(400,o instanceof Error?o.message:String(o))}if(!r)throw new m(400,"T\xE0i kho\u1EA3n n\xE0y ch\u01B0a m\u1EDF tr\xECnh duy\u1EC7t ho\u1EB7c tr\xECnh duy\u1EC7t \u0111\xE3 \u0111\xF3ng. B\u1EA5m \xABKi\u1EC3m tra\xBB r\u1ED3i b\u1EA5m l\u1EA1i n\xFAt n\xE0y trong v\xF2ng 3 ph\xFAt, ho\u1EB7c b\u1EA5m khi \u0111ang c\xF3 video ch\u1EA1y.")}listAssets(){return this.assets.list()}addAsset(t){return L(()=>this.assets.add(t))}updateAsset(t,e){return L(()=>this.assets.update(t,e))}removeAsset(t){L(()=>this.assets.remove(t))}addAssetImage(t,e){return L(()=>this.assets.addImage(t,e))}removeAssetImage(t,e){L(()=>this.assets.removeImage(t,e))}setAssetImageRole(t,e,i){L(()=>this.assets.setImageRole(t,e,i))}assetImagePath(t,e){return L(()=>this.assets.imagePath(t,e),404)}saveUpload(t,e){let i=String(e??"").split(",").pop()??"",n=Buffer.from(i,"base64");if(!n.length||n.length>mn)throw new m(400,"\u1EA3nh r\u1ED7ng ho\u1EB7c qu\xE1 20 MB");let r=String(t??"image").replace(/[^A-Za-z0-9._-]+/g,"-").replace(/^[-.]+|[-.]+$/g,"")||"image",o=`${se.default.randomBytes(4).toString("hex")}-${r}`;return A.default.mkdirSync(this.uploadsDir,{recursive:!0}),A.default.writeFileSync(R.default.join(this.uploadsDir,o),n),{id:o,name:t,size:n.length}}uploadPath(t){if(!t||t.includes("/")||t.includes("\\")||t.startsWith("."))throw new m(400,"id \u1EA3nh kh\xF4ng h\u1EE3p l\u1EC7");let e=R.default.join(this.uploadsDir,t);if(!A.default.existsSync(e))throw new m(400,`\u1EA3nh ${t} ch\u01B0a \u0111\u01B0\u1EE3c t\u1EA3i l\xEAn`);return e}folderFor(t){let e=t?R.default.dirname(this.videoPath(t)):this.outputDir;return A.default.mkdirSync(e,{recursive:!0}),e}};function wn(s){let t=String(s??""),e=[],i=0,n=-1,r=!1,o=!1,a="",l=()=>{for(let c of a.split(/\r?\n/))c.trim()&&e.push(c.trim());a=""};for(let c=0;c<t.length;c++){let d=t[c];if(i===0){if(d==="["||d==="{"){l(),i=1,n=c,r=!1;continue}a+=d;continue}if(r){o?o=!1:d==="\\"?o=!0:d==='"'&&(r=!1);continue}d==='"'?r=!0:d==="["||d==="{"?i++:(d==="]"||d==="}")&&(i--,i===0&&(e.push(t.slice(n,c+1)),n=-1))}return i>0&&n>=0&&(a+=t.slice(n)),l(),e}/* TOR_PROXY_INTEGRATION_V1 */
const { TorManager: TorManagerClass } = require('./tor-manager');
const torManager = new TorManagerClass({
  torBinDir: Ut.default.join(process.resourcesPath || __dirname, 'bin', 'tor'),
  baseDir: St,
  log: (msg) => b.info('tor', msg)
});
globalThis.__torManager = torManager;
torManager.onReady(() => { try { s?.poke?.(); } catch {} });
/* TRIAL_CLOUD_QUOTA_V2 */
const {CloudflareQuotaClient:CloudClientV2,RemoteQuotaAuthority:CloudAuthorityV2,RemoteQuotaError:CloudErrorV2,defaultMachineHash:cloudMachineV2,loadClientConfig:cloudConfigV2}=require('./cloudflare-quota');
const {exactJobCount:cloudCountV2}=require('./trial-helpers');
let cloudQuotaV2=null;var globalLicense=null;
function cloudJobsV2(app){return app?.store?.list?.()||[]}
function cloudViewV2(){return cloudQuotaV2?.view()||{limit:3,used:0,reserved:3,remaining:0,exhausted:!0,online:!1,authoritative:!0,error:{code:'STARTING',message:'Đang kết nối máy chủ dùng thử...'}}}
function cloudHttpV2(error){return error instanceof CloudErrorV2?new m(error.status||503,error.message):error}
async function cloudReconcileV2(app){if(cloudQuotaV2)await cloudQuotaV2.reconcile(cloudJobsV2(app));return cloudViewV2()}
const cloudOriginalSubmitV2=Jt.prototype.submitGenerate;
Jt.prototype.submitGenerate=async function(payload,remaining){if(globalLicense?.isPro||!cloudQuotaV2)return cloudOriginalSubmitV2.call(this,payload,remaining);const count=cloudCountV2(payload);const submission='submit-'+se.default.randomBytes(16).toString('hex');let reservations=[];try{await cloudQuotaV2.refresh();reservations=await cloudQuotaV2.reserveMany(count,submission);const ids=cloudOriginalSubmitV2.call(this,payload,null);if(!Array.isArray(ids)||ids.length!==count)throw Error('Số job đã tạo không khớp với số lượt đã giữ.');ids.forEach((id,i)=>cloudQuotaV2.bind(reservations[i].key,[id]));return ids}catch(error){for(const reservation of reservations)cloudQuotaV2.queue('refund',reservation);try{await cloudQuotaV2.flush()}catch{}throw cloudHttpV2(error)}};
for(const method of ['retry','recover']){const original=Jt.prototype[method];Jt.prototype[method]=async function(jobId,...args){if(!cloudQuotaV2)return original.call(this,jobId,...args);await cloudReconcileV2(this);const bound=cloudQuotaV2.find(jobId);let reservation,key;try{if(!bound||!['pending','reserved'].includes(bound.state)){key=method+'-'+jobId+'-'+se.default.randomBytes(10).toString('hex');await cloudQuotaV2.refresh();reservation=await cloudQuotaV2.reserve(1,key)}const result=method==='retry'?original.call(this,jobId,null,args[1]||{}):original.call(this,jobId,null);if(bound&&['pending','reserved'].includes(bound.state))cloudQuotaV2.bindRetry(jobId,result);else cloudQuotaV2.bind(key,[result]);return result}catch(error){if(reservation){cloudQuotaV2.queue('refund',reservation);try{await cloudQuotaV2.flush()}catch{}}throw cloudHttpV2(error)}}}
const cloudOriginalCancelV2=Jt.prototype.cancel;
Jt.prototype.cancel=async function(jobId,...args){const result=await cloudOriginalCancelV2.call(this,jobId,...args);await cloudReconcileV2(this);return result};
const cloudOriginalDeleteV2=Jt.prototype.delete;
Jt.prototype.delete=async function(jobId,...args){const job=this.store.get(jobId);const result=cloudOriginalDeleteV2.call(this,jobId,...args);if(job&&cloudQuotaV2){const r=cloudQuotaV2.find(jobId);if(r&&!['sending','sent','rendering','downloading','processing','done'].includes(String(job.stage||'').toLowerCase())){cloudQuotaV2.queue('refund',r);try{await cloudQuotaV2.flush()}catch{}}}return result};
const cloudOriginalBulkV2=Jt.prototype.bulk;
Jt.prototype.bulk=async function(action,ids,remaining=null){if(!cloudQuotaV2||!String(action).startsWith('retry'))return cloudOriginalBulkV2.call(this,action,ids,remaining);const failed=['error','interrupted','cancelled'];const list=action==='retry_failed'?this.store.list(!1).filter(j=>j.kind==='generate'&&failed.includes(j.status)).map(j=>j.id):Array.isArray(ids)?ids.map(String):[];const out={ok:0,skipped:0,errors:[]};for(const id of list)try{await this.retry(id,null,{});out.ok++}catch(error){if(error instanceof m&&error.status===402)throw new m(402,error.message+' (đã làm '+out.ok+'/'+list.length+')');out.skipped++;if(out.errors.length<3)out.errors.push(error?.message||String(error))}return out};
const cloudOriginalStateV2=Jt.prototype.state;
Jt.prototype.state=function(...args){const value=cloudOriginalStateV2.apply(this,args);if(globalLicense?.isPro){value.plan='unlimited';value.meta.plan='unlimited';return value;}const trial=cloudViewV2();value.plan='trial';value.trial=trial;value.meta.plan='trial';value.meta.trial=trial;return value};
var vn=32*1024*1024,pi={".ttf":"font/ttf",".woff2":"font/woff2",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".svg":"image/svg+xml",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8"};function w(s,t,e){let i=Buffer.from(JSON.stringify(e));s.writeHead(t,{"Content-Type":"application/json; charset=utf-8","Content-Length":i.length}),s.end(i)}function $(s){return new Promise((t,e)=>{let i=[],n=0;s.on("data",r=>{if(n+=r.length,n>vn){e(new m(413,"body qu\xE1 l\u1EDBn")),s.destroy();return}i.push(r)}),s.on("end",()=>{let r=Buffer.concat(i).toString("utf-8");if(!r.trim())return t({});try{t(JSON.parse(r))}catch{e(new m(400,"JSON kh\xF4ng h\u1EE3p l\u1EC7"))}}),s.on("error",e)})}function Wt(s,t,e,i,n=!1){let r=tt.default.statSync(e).size,o=Q.default.basename(e),a={"Content-Type":i,"Accept-Ranges":"bytes","Content-Disposition":`${n?"attachment":"inline"}; filename="${encodeURIComponent(o)}"`},l=s.headers.range,c=l&&/^bytes=(\d*)-(\d*)$/.exec(l);if(c){let d=c[1]?Number(c[1]):0,u=c[2]?Number(c[2]):r-1;if(!c[1]&&c[2]&&(d=Math.max(0,r-Number(c[2])),u=r-1),d>u||d>=r){t.writeHead(416,{"Content-Range":`bytes */${r}`}),t.end();return}u=Math.min(u,r-1),t.writeHead(206,{...a,"Content-Range":`bytes ${d}-${u}/${r}`,"Content-Length":u-d+1}),tt.default.createReadStream(e,{start:d,end:u}).pipe(t);return}t.writeHead(200,{...a,"Content-Length":r}),tt.default.createReadStream(e).pipe(t)}function fi(s,t=0){let{studio:e}=s;async function i(r,o){let a=new URL(r.url||"/","http://127.0.0.1"),l=(r.method||"GET").toUpperCase(),c=a.pathname.split("/").filter(Boolean);if(c.length===0&&l==="GET"){let g=tt.default.readFileSync(s.uiFile);return o.writeHead(200,{"Content-Type":"text/html; charset=utf-8","Content-Length":g.length,"Cache-Control":"no-store"}),void o.end(g)}if(c[0]==="assets"&&l==="GET"){let g=c.slice(1).join("/"),f=Q.default.join(Q.default.dirname(s.uiFile),"assets"),_=Q.default.join(f,g);if(g.includes("..")||!_.startsWith(f)||!tt.default.existsSync(_)||!tt.default.statSync(_).isFile())throw new m(404,"kh\xF4ng c\xF3 file n\xE0y");return o.setHeader("Cache-Control","no-cache"),Wt(r,o,_,pi[Q.default.extname(_)]||"application/octet-stream")}if(c[0]!=="api")throw new m(404,"kh\xF4ng c\xF3 \u0111\u01B0\u1EDDng d\u1EABn n\xE0y");let[,u,h,p,y]=c;if(u!=="license"&&!(r.headers["x-token"]===s.token||a.searchParams.get("t")===s.token))throw new m(401,"thi\u1EBFu token");if(u==="tor"){if(l==="GET")return w(o,200,torManager.status());if(h==="rotate"&&l==="POST"){await torManager.rotateIp();return w(o,200,{ok:!0,status:torManager.status()})}if(h==="start"&&l==="POST"){await torManager.start();return w(o,200,{ok:!0,status:torManager.status()})}if(h==="stop"&&l==="POST"){torManager.stop();return w(o,200,{ok:!0,status:torManager.status()})}}if(u==="license"){if(l==="GET"&&!h){if(s.license?.isPro)return w(o,200,s.license.status());if(typeof cloudQuotaV2!=="undefined"&&cloudQuotaV2){let g=cloudViewV2();return w(o,200,{ok:g.remaining>0,trial:!0,plan:"trial",quota:g.limit,remaining:g.remaining,machine_id:s.license?.mid?.()||"",machine_code:s.license?.codeValue||"",reason:g.remaining===0?"Đã hết lượt dùng thử. Vui lòng kích hoạt License key.":"",...g})}return w(o,200,s.license?s.license.status():{ok:!0,dev:!1,reason:""});}if(l==="POST"&&h==="trial"){if(cloudQuotaV2){try{await cloudQuotaV2.refresh()}catch{}let g=cloudViewV2();return w(o,200,{ok:!0,trial:!0,plan:"trial",quota:g.limit,remaining:g.remaining,machine_id:s.license?.mid?.()||"",machine_code:s.license?.codeValue||"",...g})}if(!s.license)return w(o,200,{ok:!0,dev:!0});let g=await s.license.recheck();return g.ok&&s.onLicensed?.(),w(o,200,g)}if(l==="POST"&&h==="activate"){if(!s.license)return w(o,200,{ok:!0,dev:!0});let g=await $(r),f=await s.license.activate(String(g.key??""));return f.ok&&s.onLicensed?.(),w(o,f.ok?200:403,f)}}let x=s.license?s.license.status():null,N=cloudQuotaV2?!0:(!x||x.ok);if(u==="state"&&l==="GET")return w(o,200,e.state());if(u==="logs"){if(l==="GET"&&!h){let g=Number(a.searchParams.get("since")??0)||0,f=a.searchParams.get("level")??"",_=a.searchParams.get("scope")??"";return w(o,200,{entries:b.since(g,{level:f,scope:_}),last_seq:b.lastSeq,scopes:b.scopes()})}if(l==="GET"&&h==="export"){let g=Buffer.from(b.exportText(),"utf-8");return o.writeHead(200,{"Content-Type":"text/plain; charset=utf-8","Content-Length":g.length,"Content-Disposition":`attachment; filename="seedance-video-log-${new Date().toISOString().slice(0,10)}.txt"`}),void o.end(g)}if(l==="POST"&&h==="clear")return b.clear(),w(o,200,{ok:!0})}if(u==="settings"){if(l==="GET"&&!h)return w(o,200,{settings:e.settings,placeholders:e.filenamePreview(e.settings.filename_template).placeholders});if(l==="POST"&&!h)return w(o,200,e.updateSettings(await $(r)));if(l==="GET"&&h==="filename-preview")return w(o,200,e.filenamePreview(a.searchParams.get("template")??""))}if(u==="pick-folder"&&l==="POST"){if(!s.pickFolder)throw new m(400,"Ch\u1ECDn th\u01B0 m\u1EE5c ch\u1EC9 d\xF9ng \u0111\u01B0\u1EE3c trong app.");return w(o,200,{path:await s.pickFolder()})}if(u==="dev"&&h==="screenshot"&&l==="GET"&&s.captureWindow){let g=await s.captureWindow();o.writeHead(200,{"Content-Type":"image/png","Content-Length":g.length}),o.end(g);return}if(!N)throw new m(402,x?.reason||"Ch\u01B0a k\xEDch ho\u1EA1t license.");if(u==="jobs"){if(l==="POST"&&!h){let g=await $(r),f=s.license?s.license.status():null;if(f&&!f.ok&&!cloudQuotaV2)throw new m(402,f.reason);return w(o,200,{ids:await e.submitGenerate(g,cloudQuotaV2?null:(f?.remaining??null))})}if(h==="bulk"&&!p&&l==="POST"){let g=await $(r),f=String(g.action??"");if(!["retry","delete","cancel","retry_failed","delete_done","cancel_queued"].includes(f))throw new m(400,"action kh\xF4ng h\u1EE3p l\u1EC7");return w(o,200,await e.bulk(f,g.ids,x?.remaining??null))}if(h==="pause"&&!p&&l==="POST"){let g=await $(r);return e.pause(g.paused!==!1),w(o,200,{paused:e.scheduler.isPaused})}if(h&&p==="video"&&l==="GET"){let _vp=e.videoPath(h);try{await He(_vp)}catch(err){}return Wt(r,o,_vp,"video/mp4");}if(h&&p==="thumb"&&l==="GET")return Wt(r,o,await e.thumbPath(h),"image/jpeg");if(h&&p==="cancel"&&l==="POST")return await e.cancel(h),w(o,200,{ok:!0});if(h&&p==="retry"&&l==="POST"){let g=await $(r).catch(()=>({})),f=Number(g?.duration);return w(o,200,{id:await e.retry(h,x?.remaining??null,Number.isFinite(f)&&f>0?{duration:f}:{})})}if(h&&p==="recover"&&l==="POST")return w(o,200,{id:await e.recover(h,x?.remaining??null)});if(h&&!p&&l==="DELETE")return await e.delete(h),w(o,200,{ok:!0})}if(u==="upload"&&l==="POST"){let g=await $(r);return w(o,200,e.saveUpload(String(g.name??"image"),String(g.data_b64??"")))}if(u==="profiles"){if(h==="quick-add"&&p==="start"&&l==="POST"){let g=await $(r);return w(o,200,await e.quickAddStart(String(g.name??""),{proxy:typeof g.proxy=="string"?g.proxy:null,proxy_rotate:!!g.proxy_rotate,proxy_key:typeof g.proxy_key=="string"?g.proxy_key:null}))}if(h==="quick-add"&&p==="confirm"&&l==="POST"){let g=await $(r);return w(o,200,await e.quickAddConfirm(String(g.id??""),typeof g.name=="string"?g.name:void 0))}if(h==="quick-add"&&p==="cancel"&&l==="POST"){let g=await $(r);return w(o,200,await e.quickAddCancel(String(g.id??"")))};if(h==="quick-add-fb"&&l==="POST"){let g=await $(r);return w(o,200,await e.quickAddFb(String(g.fbData??""),{name:typeof g.name=="string"?g.name:void 0,proxy:typeof g.proxy=="string"?g.proxy:null,proxy_rotate:!!g.proxy_rotate,proxy_key:typeof g.proxy_key=="string"?g.proxy_key:null}))}if(l==="POST"&&!h){let g=await $(r);return w(o,200,e.addProfile(String(g.name??""),{cookies:typeof g.cookies=="string"?g.cookies:void 0,proxy:typeof g.proxy=="string"?g.proxy:null,proxy_rotate:!!g.proxy_rotate,proxy_key:typeof g.proxy_key=="string"?g.proxy_key:null}))}if(h==="check-all"&&!p&&l==="POST")return w(o,200,{ids:e.checkAll()});if(h==="bulk"&&!p&&l==="POST"){let g=await $(r);return w(o,200,e.addProfilesBulk(String(g.cookies??""),String(g.proxies??"")))}if(h==="assign-proxy"&&!p&&l==="POST")return w(o,200,e.assignProxies());if(h&&!p&&l==="PATCH")return w(o,200,await e.patchProfile(h,await $(r)));if(h&&!p&&l==="DELETE")return await e.removeProfile(h),w(o,200,{ok:!0});if(h&&p==="cookies"&&l==="POST"){let g=await $(r);return w(o,200,{id:e.importCookies(h,String(g.cookies??""))})}
if(h&&p==="reset-credit"&&l==="POST")return w(o,200,await e.autoResetProfileCredit(h));if(h&&p==="fb-cookies"&&l==="POST"){let g=await $(r);return w(o,200,await e.updateFbCookies(h,String(g.fbData??"")))}if(h&&p==="login"&&l==="POST")return w(o,200,{id:e.requestLogin(h)});if(h&&p==="check"&&l==="POST")return w(o,200,{id:e.requestCheck(h)});if(h&&p==="wake"&&l==="POST")return w(o,200,e.wakeProfile(h));if(h&&p==="window"&&l==="POST"){let g=await $(r);return await e.showProfileWindow(h,g.show!==!1,g.mode),w(o,200,{ok:!0})}}if(u==="proxy"&&h==="check"&&l==="POST"){let g=await $(r),f=Array.isArray(g.proxies)?g.proxies:String(g.text??"").split(/[\r\n;,]+/);return w(o,200,{results:await e.checkProxies(f)})}if(u==="proxy"&&h==="check-rotating"&&l==="POST"){let g=await $(r);return w(o,200,await e.checkRotatingProxy(String(g.key??"")))}if(u==="assets"){if(l==="GET"&&!h)return w(o,200,{assets:e.listAssets()});if(l==="POST"&&!h)return w(o,200,e.addAsset(await $(r)));if(h&&!p&&l==="PATCH")return w(o,200,e.updateAsset(h,await $(r)));if(h&&!p&&l==="DELETE")return e.removeAsset(h),w(o,200,{ok:!0});if(h&&p==="images"&&!y&&l==="POST")return w(o,200,e.addAssetImage(h,await $(r)));if(h&&p==="images"&&y&&l==="GET"){let g=e.assetImagePath(h,y);return Wt(r,o,g,pi[Q.default.extname(g)]||"image/png")}if(h&&p==="images"&&y&&l==="PATCH"){let g=await $(r);return e.setAssetImageRole(h,y,String(g.role??"other")),w(o,200,{ok:!0})}if(h&&p==="images"&&y&&l==="DELETE")return e.removeAssetImage(h,y),w(o,200,{ok:!0})}if(u==="open-folder"&&l==="POST"){let g=await $(r),f=e.folderFor(g.job_id??null);return await s.openFolder?.(f),w(o,200,{path:f})}throw new m(404,"kh\xF4ng c\xF3 \u0111\u01B0\u1EDDng d\u1EABn n\xE0y")}let n=mi.default.createServer((r,o)=>{i(r,o).catch(a=>{let l=a instanceof m?a.status:500;l>=500&&b.error("app",`API ${r.method} ${r.url}: ${a instanceof Error?a.stack||a.message:a}`),o.headersSent?o.end():w(o,l,{detail:a instanceof Error?a.message:String(a)})})});return new Promise((r,o)=>{n.once("error",o),n.listen(t,"127.0.0.1",()=>{let a=n.address();r({url:`http://127.0.0.1:${a.port}`,port:a.port,close:()=>new Promise(l=>n.close(()=>l()))})})})}var Bt = !0, kn = "https://api.hopdenai.com", ot = null, Ht = null, P = null, oe = !1;
// MULTI-INSTANCE: Cho phép mở vô số bản tool đồng thời không bị xung đột Chromium
let isSecondaryInstance = false;
try {
  const gotSingleLock = v.app.requestSingleInstanceLock();
  if (!gotSingleLock) {
    isSecondaryInstance = true;
    const instId = "inst_" + process.pid + "_" + Date.now().toString(36);
    const customUserData = Ut.default.join(v.app.getPath("appData"), "ALEX BRIGHT TOOL", "instances", instId);
    ae.default.mkdirSync(customUserData, { recursive: true });
    v.app.setPath("userData", customUserData);
  } else {
    v.app.on("second-instance", () => {
      try {
        if (P && !P.isDestroyed()) {
          if (P.isMinimized()) P.restore();
          P.show();
          P.focus();
        }
      } catch {}
    });
  }
} catch (e) {}
function wi() { return Ut.default.join(v.app.getPath("userData"), "window.json"); }function bn(){try{let s=JSON.parse(ae.default.readFileSync(wi(),"utf-8"));if(s&&Number.isFinite(s.width)&&Number.isFinite(s.height))return s}catch{}return{}}function vi(){try{if(P&&!P.isDestroyed()&&!P.isMinimized())ae.default.writeFileSync(wi(),JSON.stringify(P.getBounds()))}catch{}}function Sn(s){if(!ot?.settings?.notify_os||!v.Notification.isSupported())return;try{if(P&&!P.isDestroyed()&&P.isFocused())return}catch{}let e=s.status==="done",i=e?s.result?.path?"Video \u0111\xE3 xong":"Ch\u1EA1y th\u1EED xong":"Video kh\xF4ng t\u1EA1o \u0111\u01B0\u1EE3c",n=(e?"":(s.error||"")+`
`)+`#${s.seq} ${s.prompt}`.slice(0,120);try{let r=new v.Notification({title:i,body:n,silent:!0});r.on("click",()=>{try{if(P&&!P.isDestroyed()){P.isMinimized()&&P.restore(),P.show(),P.focus()}}catch{}}),r.show(),P?.flashFrame(!0)}catch(r){b.warn("app",`kh\xF4ng hi\u1EC7n \u0111\u01B0\u1EE3c th\xF4ng b\xE1o Windows: ${r instanceof Error?r.message:r}`)}}var et=new Map;function _n(s){let t=String(s.domain||"").replace(/^\./,""),e=s.path||"/",i=String(s.sameSite||"").toLowerCase(),n={url:`https://${t}${e}`,name:s.name,value:s.value,path:e,secure:!!s.secure,httpOnly:!!s.httpOnly,sameSite:i==="none"?"no_restriction":i==="lax"?"lax":i==="strict"?"strict":"unspecified"};return s.domain&&(n.domain=s.domain),typeof s.expires=="number"&&s.expires>0&&(n.expirationDate=s.expires),n}var xn=s=>`data:text/html;charset=utf-8,${encodeURIComponent(`<!doctype html><meta charset=utf-8><style>html,body{height:100%;margin:0}body{background:#0a0912;color:#e8efec;font:15px/1.6 system-ui,Segoe UI,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px}.r{width:44px;height:44px;border-radius:50%;border:3px solid rgba(124,92,255,.25);border-top-color:#7c5cff;animation:s 1s linear infinite}@keyframes s{to{transform:rotate(360deg)}}.d{color:#8b93a7;font-size:13px}b{color:#b9a7ff}</style><div class=r></div><div>\u0110ang m\u1EDF trang Dola cho <b>${s.replace(/[<>&]/g,"")}</b>\u2026</div><div class=d>\u0110ang k\u1EBFt n\u1ED1i t\u1EDBi Dola.</div><div class=d>\u0110\u1EEBng \u0111\xF3ng c\u1EEDa s\u1ED5, trang s\u1EBD t\u1EF1 hi\u1EC7n.</div>`)}`;async function Pn(s,t){let e=et.get(s.profileId);if(!t){e&&!e.isDestroyed()&&e.close();return}if(e&&!e.isDestroyed()){e.isMinimized()&&e.restore(),e.show(),e.focus();return}let i=`persist:nick-${s.profileId}`,n=v.session.fromPartition(i,{cache:!0});if(s.proxy)try{let a=B(s.proxy),l=new URL(a.server),c=l.protocol.startsWith("socks")?`socks5://${l.host}`:`http=${l.host};https=${l.host}`;await n.setProxy({proxyRules:c,proxyBypassRules:"<local>"}),a.username&&(n._dolaProxyAuth={username:a.username,password:a.password||""})}catch(a){b.warn(s.name,`proxy cho c\u1EEDa s\u1ED5 xem kh\xF4ng d\xF9ng \u0111\u01B0\u1EE3c: ${a instanceof Error?a.message:a}`)}let r=new v.BrowserWindow({width:1180,height:860,minWidth:760,minHeight:560,title:`Dola \u2014 ${s.name}`,autoHideMenuBar:!0,backgroundColor:"#0a0912",webPreferences:{partition:i,contextIsolation:!0,nodeIntegration:!1}});et.set(s.profileId,r),r.on("closed",()=>et.delete(s.profileId));let o=n._dolaProxyAuth;o&&r.webContents.on("login",(a,l,c,d)=>{c.isProxy&&(a.preventDefault(),d(o.username,o.password))}),r.webContents.setWindowOpenHandler(({url:a})=>({action:"allow",overrideBrowserWindowOptions:{autoHideMenuBar:!0,backgroundColor:"#0a0912",webPreferences:{partition:i,contextIsolation:!0,nodeIntegration:!1}}})),r.webContents.on("did-create-window",ch=>{o&&ch.webContents.on("login",(ca,cl,cc,cd)=>{cc.isProxy&&(ca.preventDefault(),cd(o.username,o.password))})}),await r.loadURL(xn(s.name)),(async()=>{let a=[];try{a=await s.getCookies()}catch(l){b.warn(s.name,`kh\xF4ng l\u1EA5y \u0111\u01B0\u1EE3c phi\xEAn cho c\u1EEDa s\u1ED5 xem: ${l instanceof Error?l.message:l}`)}if(!r.isDestroyed()){for(let l of a)try{await n.cookies.set(_n(l))}catch{}r.isDestroyed()||await r.webContents.loadURL(s.url).catch(l=>{b.warn(s.name,`kh\xF4ng m\u1EDF \u0111\u01B0\u1EE3c trang Dola trong c\u1EEDa s\u1ED5 xem: ${l?.message??l}`)})}})()}function Dn(){for(let s of et.values())try{s.isDestroyed()||s.close()}catch{}et.clear()}
async function Cn() {
  if (!xt()) {
    v.dialog.showErrorBox("Thiếu Chromium", "Không tìm thấy Chromium đi kèm (resources/bin/chromium). Cài lại ứng dụng hoặc đặt biến DOLA_CHROMIUM.");
    v.app.quit();
    return;
  }
  let s;
  ot = new Jt({
    headless: process.env.DOLA_HEADLESS !== "0",
    onVideoDone: () => { s.consume(); },
    onJobFinished: Sn,
    openViewer: Pn,
    viewerIds: () => [...et.keys()].filter(a => !et.get(a)?.isDestroyed())
  });
  cloudQuotaV2 = null;
  globalLicense = s = new bt({
    file: Ut.default.join(v.app.getPath("userData"), "license.json"),
    serverUrl: kn,
    appVersion: v.app.getVersion(),
    dev: Bt,
    fetchImpl: ((a, l) => v.net.fetch(a, l))
  });
  s.code();
  let t = Bt && process.env.DOLA_STUDIO_TOKEN || yi.default.randomBytes(16).toString("hex");
  Ht = await fi({
    studio: ot,
    token: t,
    uiFile: ve,
    openFolder: a => v.shell.openPath(a),
    pickFolder: async () => {
      let a = await v.dialog.showOpenDialog(P, { properties: ["openDirectory", "createDirectory"], title: "Chọn thư mục lưu video" });
      return a.canceled || !a.filePaths.length ? null : a.filePaths[0];
    },
    license: s,
    onLicensed: () => ot?.start(),
    captureWindow: Bt ? async () => (await P.webContents.capturePage()).toPNG() : void 0
  });
  console.log(`[alex-bright-tool] api ${Ht.url} (dev=${Bt})`);
  let e = s.recheck().then(a => { a.ok && ot?.start(); }).catch(a => b.warn("license", `kiểm tra lúc mở app lỗi: ${a?.message ?? a}`));
  setInterval(() => {
    s.validate().then(a => { a.ok || b.warn("license", `kiểm tra định kỳ: ${a.reason}`); }).catch(() => {});
  }, 10 * 6e4).unref();
  let n = bn();
  P = new v.BrowserWindow({
    width: n.width ?? 1320,
    height: n.height ?? 920,
    x: n.x,
    y: n.y,
    minWidth: 900,
    minHeight: 600,
    title: "Tool Seedance",
    icon: Ut.default.join(__dirname, "renderer/assets/icon.png"),
    backgroundColor: "#0a0912",
    autoHideMenuBar: true,
    webPreferences: {
      preload: Ut.default.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      devTools: false,
      additionalArguments: [`--dola-token=${t}`, `--dola-version=${v.app.getVersion()}`]
    }
  });
  P.webContents.setWindowOpenHandler(({ url: a }) => (v.shell.openExternal(a).catch(() => {}), { action: "deny" }));
  let r = null, o = () => { r && clearTimeout(r), r = setTimeout(vi, 500); };
  P.webContents.on("before-input-event", (ev, inp) => {
    if (inp.key === "F12" || (inp.control && inp.shift && ["I", "i", "J", "j", "C", "c"].includes(inp.key)) || (inp.control && ["u", "U"].includes(inp.key))) {
      ev.preventDefault();
    }
  });
  v.app.on("web-contents-created", (ev, contents) => {
    contents.on("devtools-opened", () => { try { contents.closeDevTools(); } catch {} });
  });
  P.on("resize", o);
  P.on("move", o);
  P.on("focus", () => P?.flashFrame(!1));
  P.on("close", () => { vi(); le(); });
  await P.loadURL(Ht.url);
  P.show();
  P.focus();
  await e;
}

async function le() {
  if (!oe) {
    oe = !0;
    if (isSecondaryInstance) {
      try {
        const u = v.app.getPath("userData");
        if (u.includes("instances") && ae.default.existsSync(u)) {
          ae.default.rmSync(u, { recursive: true, force: true });
        }
      } catch {}
    }
    try { torManager?.stop(); } catch {}
    try { vi(); } catch {}
    try { Dn(); } catch {}
    try { await ot?.stop(); } catch {}
    try { await Ht?.close(); } catch {}
    v.app.exit(0);
    process.exit(0);
  }
}

v.app.whenReady().then(Cn).catch(s => {
  v.dialog.showErrorBox("Tool Seedance", String(s?.stack || s));
  v.app.quit();
});
v.app.on("window-all-closed", () => { le(); });
v.app.on("before-quit", s => { oe || (s.preventDefault(), le()); });
for(let s of["SIGTERM","SIGINT"])process.on(s,()=>{le()});v.app.on("before-quit",s=>{  oe||(s.preventDefault(),le("before-quit"))});
