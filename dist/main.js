function isRealVideoUrl(u){if(!u||typeof u!=="string")return!1;let s=u.toLowerCase().trim();if(!s.startsWith("http://")&&!s.startsWith("https://")&&!s.startsWith("blob:"))return!1;if(s.includes("ibyteimg")||s.includes("image-sign")||s.includes("/image/")||s.includes("format=image"))return!1;if(s.includes(".png")||s.includes(".jpg")||s.includes(".jpeg")||s.includes(".webp")||s.includes(".gif")||s.includes(".svg"))return!1;if(s.includes("avatar")||s.includes("poster")||s.includes("cover")||s.includes("thumbnail")||s.includes("preview_low"))return!1;if(s.startsWith("blob:")||s.includes(".mp4")||s.includes(".webm")||s.includes("mime_type=video")||s.includes("/video/tos/"))return!0;if(s.includes("byteoversea")||s.includes("tiktokcdn")||s.includes("dola.com")){if(s.includes("/video/")||s.includes("play_url")||s.includes("download_url")||s.includes("video_url"))return!0;}return!1;}
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
"use strict";var ki=Object.create;var he=Object.defineProperty;var bi=Object.getOwnPropertyDescriptor;var Si=Object.getOwnPropertyNames;var _i=Object.getPrototypeOf,xi=Object.prototype.hasOwnProperty;var Pi=(s,t,e,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let n of Si(t))!xi.call(s,n)&&n!==e&&he(s,n,{get:()=>t[n],enumerable:!(i=bi(t,n))||i.enumerable});return s};var k=(s,t,e)=>(e=s!=null?ki(_i(s)):{},Pi(t||!s||!s.__esModule?he(e,"default",{value:s,enumerable:!0}):e,s));var yi=k(require("node:crypto")),ae=k(require("node:fs")),Ut=k(require("node:path")),v=require("electron");var de=require("node:child_process"),V=k(require("node:crypto")),it=k(require("node:fs")),J=k(require("node:os")),ge=k(require("node:path")),Di="MCowBQYDK2VwAyEAVVCFEOavTuZpkEcFR01Fin1DSMcbzHbGXWA5LvtO0fI=";function Ci(s){return V.default.createPublicKey({key:Buffer.from(s,"base64"),format:"der",type:"spki"})}function $i(s){return["SDV2",s.nonce,s.key,s.machine_id,s.plan??"",s.expires_at??"",String(s.seats),s.quota==null?"":String(s.quota),String(s.used),s.issued_at].join("|")}var pe=s=>V.default.createHash("sha256").update(s,"utf-8").digest("hex");function Ei(){try{let{machineIdSync:s}=require("node-machine-id");return s(!1)}catch{return pe(`${J.default.hostname()}|${J.default.userInfo().username}|${J.default.platform()}`)}}function ue(s,t,e){return new Promise((i,n)=>{(0,de.execFile)(s,t,{timeout:e,windowsHide:!0,encoding:"utf-8"},(r,o)=>{r?n(r):i(String(o))})})}async function Ii(){let s="";try{process.platform==="win32"?s=(await ue("powershell.exe",["-NoProfile","-NonInteractive","-Command","$p=Get-CimInstance Win32_ComputerSystemProduct; $b=Get-CimInstance Win32_BIOS; $c=Get-CimInstance Win32_Processor | Select-Object -First 1; Write-Output ([string]$p.UUID + '|' + [string]$b.SerialNumber + '|' + [string]$c.ProcessorId)"],2e4)).trim():process.platform==="linux"?s=it.default.readFileSync("/etc/machine-id","utf-8").trim():s=(await ue("ioreg",["-rd1","-c","IOPlatformExpertDevice"],1e4)).match(/IOPlatformUUID" = "([^"]+)/)?.[1]??""}catch{s=""}if(s.replace(/\|/g,"").trim().length<8){let t=J.default.cpus()[0]?.model??"";s=`fallback|${J.default.hostname()}|${t}|${J.default.cpus().length}|${Math.round(J.default.totalmem()/2**30)}|${J.default.arch()}`}return pe("SDV-MC|"+s)}function Oi(s){return s.length>8?`${s.slice(0,4)}\u2026${s.slice(-4)}`:"****"}const CLOUD_LICENSE_SERVER = "https://admin-web-eight-steel.vercel.app";

const { LicenseGuard: bt } = require('./license-guard');
var Ti=[[/\b(sessionid|sid_tt|sid_guard|uid_tt|ssid_ucp_v1|passport_csrf_token|ttwid|msToken)=([^;\s&"'}]+)/gi,"$1=[\u0111\xE3 che]"],[/\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{4,}\.[A-Za-z0-9_-]{4,}/g,"[token]"],[/([?&]t=)[0-9a-f]{16,}/gi,"$1[token]"],[/(\w+:\/\/[^\s:@/]+:)[^\s@/]+@/g,"$1***@"]];function Li(s){let t=String(s??"");for(let[e,i]of Ti)t=t.replace(e,i);return t}function me(s){let t=s.toLowerCase();return/không tạo được|thất bại|từ chối|lỗi trên|hết giờ|không kết nối|error/.test(t)?"error":/không |chưa |hỏng|mồ côi|chậm|cảnh báo|warn/.test(t)?"warn":"info"}function Ai(){let s=new Date,t=e=>String(e).padStart(2,"0");return`${s.getFullYear()}-${t(s.getMonth()+1)}-${t(s.getDate())}T${t(s.getHours())}:${t(s.getMinutes())}:${t(s.getSeconds())}`}var qt=class{entries=[];seq=0;max;constructor(t=3e3){this.max=t}get lastSeq(){return this.seq}push(t,e,i){let n={seq:++this.seq,ts:Ai(),level:t,scope:e||"app",msg:Li(i)};return this.entries.push(n),this.entries.length>this.max&&this.entries.splice(0,this.entries.length-this.max),n}info(t,e){return this.push("info",t,e)}warn(t,e){return this.push("warn",t,e)}error(t,e){return this.push("error",t,e)}since(t=0,e={}){let i=e.limit??500,n=[];for(let r of this.entries)if(!(r.seq<=t)&&!(e.level&&r.level!==e.level)&&!(e.scope&&r.scope!==e.scope)&&(n.push(r),n.length>=i))break;return n}scopes(){return[...new Set(this.entries.map(t=>t.scope))].sort()}clear(){this.entries=[]}exportText(){return this.entries.map(t=>`${t.ts.replace("T"," ")} [${t.level.toUpperCase().padEnd(5)}] ${t.scope}: ${t.msg}`).join(`
`)+`
`}},b=new qt;var lt=k(require("node:fs")),ye=k(require("node:os")),W=k(require("node:path")),we=ye.default.homedir();let customBaseDir=null;try{for(let a of process.argv){if(a.startsWith("--data-dir="))customBaseDir=a.slice(11).trim();else if(a.startsWith("--workspace="))customBaseDir=a.slice(12).trim();}if(!customBaseDir&&process.env.TOOL_DATA_DIR)customBaseDir=process.env.TOOL_DATA_DIR.trim();}catch(e){};let St=customBaseDir?W.default.resolve(customBaseDir):W.default.join(we,".dola-video"),_t=(process.platform==="darwin"&&lt.default.existsSync(W.default.join(we,"Movies")))?W.default.join(we,"Movies","ALEX BRIGHT TOOL Video"):W.default.join(we,"Videos","ALEX BRIGHT TOOL Video"),On=W.default.join(__dirname,"hook.js"),ve=W.default.join(__dirname,"renderer","index.html");function ke(){let s=process.resourcesPath,t=[s?W.default.join(s,"bin"):null,W.default.join(__dirname,"..","vendor",fe()),W.default.join(process.cwd(),"vendor",fe())].filter(Boolean);for(let e of t)if(lt.default.existsSync(e))return e;return null}function fe(){return process.platform==="win32"?"win":process.platform==="darwin"?"mac":"linux"}var Ri=["chromium/chrome-linux64/chrome","chromium/chrome-linux/chrome","chromium/chrome-win64/chrome.exe","chromium/chrome-win/chrome.exe","chromium/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing","chromium/chrome-mac-x64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing","chromium/chrome-mac-arm64/Chromium.app/Contents/MacOS/Chromium","chromium/chrome-mac/Chromium.app/Contents/MacOS/Chromium"];function xt(){if(process.env.DOLA_CHROMIUM)return process.env.DOLA_CHROMIUM;let s=ke();if(s)for(let t of Ri){let e=W.default.join(s,t);if(lt.default.existsSync(e))return e}if(process.platform==="darwin"){let mb=["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome","/Applications/Chromium.app/Contents/MacOS/Chromium","/Applications/Brave Browser.app/Contents/MacOS/Brave Browser"];for(let b of mb){if(lt.default.existsSync(b))return b;}}try{let{chromium:t}=require("playwright"),e=t.executablePath();if(e&&lt.default.existsSync(e))return e}catch{}}function Z(){if(process.env.DOLA_FFMPEG)return process.env.DOLA_FFMPEG;let s=ke();if(s)for(let t of["ffmpeg.exe","ffmpeg"]){let e=W.default.join(s,t);if(lt.default.existsSync(e)){if(process.platform!=="win32"){try{lt.default.chmodSync(e,0o755)}catch{}}return e;}}if(process.platform==="darwin"){let mf=["/opt/homebrew/bin/ffmpeg","/usr/local/bin/ffmpeg","/usr/bin/ffmpeg"];for(let f of mf){if(lt.default.existsSync(f))return f;}}return"ffmpeg"}var Mi=new Set(["http","https","socks5","socks4"]);function isTopProxyKey(s){let t=String(s??"").trim();if(!t||t.includes(":")||t.includes("@")||t.includes("/")||t.includes(" ")||t.includes("\n")||t.includes("\r"))return!1;if(/^(?:tor|\[tor\]|tor-proxy)$/i.test(t))return!1;return/^[A-Za-z0-9_\-]{16,45}$/.test(t)}function Fi(s){let t=/^\[([^\]]+)\]:(\d+)$/.exec(s),e=t?{host:t[1],port:t[2]}:(()=>{let n=s.lastIndexOf(":");return n>0?{host:s.slice(0,n),port:s.slice(n+1)}:{host:s,port:""}})(),i=Number(e.port);if(!e.host||!/^[A-Za-z0-9.\-_:]+$/.test(e.host))throw new Error(`host kh\xF4ng h\u1EE3p l\u1EC7: "${s}"`);if(!Number.isInteger(i)||i<1||i>65535)throw new Error(`c\u1ED5ng kh\xF4ng h\u1EE3p l\u1EC7: "${s}"`);return{host:e.host,port:i}}function B(s){let t=String(s??"").trim();if(/^(?:tor|\[tor\]|tor-proxy)$/i.test(t))return{server:"socks5://127.0.0.1:19050"};if(isTopProxyKey(t))throw new Error(`"${s.trim()}" là API Key TopProxy / Proxy xoay, không phải proxy cố định dạng Host:Port:User:Pass. Hãy dán vào ô Key xoay.`);if(t=t.replace(/^(?:[-*•]|\d+[.)])\s+/,"").replace(/^["'`]+|["'`]+$/g,"").trim(),!t)throw new Error("d\xF2ng tr\u1ED1ng");let e="http",i=t.indexOf("://");if(i>=0){if(e=t.slice(0,i).toLowerCase(),(e==="socks5h"||e==="socks")&&(e="socks5"),e==="socks4a"&&(e="socks4"),!Mi.has(e))throw new Error(`giao th\u1EE9c "${e}" kh\xF4ng h\u1ED7 tr\u1EE3 (d\xF9ng http, https, socks5)`);t=t.slice(i+3).replace(/\/+$/,"")}let n,r,o,a=t.lastIndexOf("@");if(a>=0){let u=t.slice(0,a);o=t.slice(a+1);let h=u.indexOf(":");n=decodeURIComponent(h>=0?u.slice(0,h):u),r=h>=0?decodeURIComponent(u.slice(h+1)):""}else{let u=t.split(":");if(u.length===4)if(/^\d+$/.test(u[1]))o=`${u[0]}:${u[1]}`,n=u[2],r=u[3];else if(/^\d+$/.test(u[3]))n=u[0],r=u[1],o=`${u[2]}:${u[3]}`;else throw new Error(`kh\xF4ng nh\u1EADn ra \u0111\u1ECBnh d\u1EA1ng: "${s.trim()}"`);else if(u.length===2||u.length>2&&t.startsWith("["))o=t;else throw new Error(`kh\xF4ng nh\u1EADn ra \u0111\u1ECBnh d\u1EA1ng: "${s.trim()}" (d\xF9ng host:port, host:port:user:pass ho\u1EB7c user:pass@host:port)`)}let{host:l,port:c}=Fi(o),d={server:`${e}://${l}:${c}`};return n&&(d.username=n,d.password=r??""),d}function be(s){let t={ok:[],errors:[]},e=new Set;return String(s??"").split(/[\r\n;,]+/).forEach((n,r)=>{let o=n.trim();if(o)try{let a=B(o),l=nt(a);if(e.has(l))return;e.add(l),t.ok.push(a)}catch(a){t.errors.push({line:r+1,text:o,reason:a.message})}}),t}function Se(s){let t=s.indexOf("://");return t>=0?{scheme:s.slice(0,t),hostPort:s.slice(t+3)}:{scheme:"http",hostPort:s}}function nt(s){let{scheme:t,hostPort:e}=Se(s.server),i=s.username?`${encodeURIComponent(s.username)}:${encodeURIComponent(s.password??"")}@`:"";return`${t}://${i}${e}`}function Pt(s){if(!s)return"";let t=typeof s=="string"?B(s):s;if(t&&t.server&&/1905\d|1906\d/.test(t.server)){let m=t.server.match(/:(\d+)/);let p=m?m[1]:"19050";return`🧅 Tor Free (Cổng ${p} - IP riêng)`}let{scheme:e,hostPort:i}=Se(t.server),n=t.username?`${t.username}:***@`:"";return`${e==="http"?"":e+"://"}${n}${i}`}
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
  if (!cleanKey) throw new Error("Chưa nhập key TopProxy / Proxy xoay");
  let myIp = await getPublicIp();
  let url = "https://proxyxoay.shop/api/get.php?key=" + encodeURIComponent(cleanKey) + "&nhamang=random&tinhthanh=0&whitelist=" + encodeURIComponent(myIp);
  let res = await fetch(url, { method: "GET", headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(15000) });
  let text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Phản hồi từ server TopProxy không hợp lệ: " + text.slice(0, 100));
  }
  return data;
}

function Vt(s){return s.username&&s.server.startsWith("socks")?"Chromium kh\xF4ng g\u1EEDi \u0111\u01B0\u1EE3c m\u1EADt kh\u1EA9u cho SOCKS5. Nick n\xE0y s\u1EBD kh\xF4ng k\u1EBFt n\u1ED1i \u0111\u01B0\u1EE3c \u2014 h\xE3y d\xF9ng proxy HTTP c\xF3 m\u1EADt kh\u1EA9u, ho\u1EB7c SOCKS5 kh\xF4ng m\u1EADt kh\u1EA9u.":null}async function _e(s,t=15e3){if(s&&s.server&&s.server.includes("19050")){try{await (globalThis.__torManager||torManager)?.start()}catch{}}let e=Date.now(),i=Vt(s);if(i)return{ok:!1,ms:0,error:i};let n=null;try{let{request:r}=require("playwright");n=await r.newContext({proxy:{server:s.server,username:s.username,password:s.password},timeout:t,ignoreHTTPSErrors:!0});let o=await n.get("http://api.ipify.org?format=json"),a=Date.now()-e;return o.ok()?{ok:!0,ip:(await o.json()).ip,ms:a}:{ok:!1,ms:a,error:`HTTP ${o.status()}`}}catch(r){let o=r instanceof Error?r.message:String(r),a=/ERR_PROXY_CONNECTION_FAILED|ECONNREFUSED/.test(o)?"kh\xF4ng k\u1EBFt n\u1ED1i \u0111\u01B0\u1EE3c proxy":/ERR_TUNNEL_CONNECTION_FAILED|407/.test(o)?"proxy t\u1EEB ch\u1ED1i (sai user/pass ho\u1EB7c h\u1EBFt h\u1EA1n)":/Timeout|timed? ?out/i.test(o)?`qu\xE1 ${Math.round(t/1e3)} gi\xE2y kh\xF4ng ph\u1EA3n h\u1ED3i`:o.split(`
`)[0].slice(0,120);return{ok:!1,ms:Date.now()-e,error:a}}finally{await n?.dispose().catch(()=>{})}}var tt=k(require("node:fs")),mi=k(require("node:http")),Q=k(require("node:path"));var se=k(require("node:crypto")),A=k(require("node:fs")),R=k(require("node:path"));var Yt=k(require("node:crypto")),M=k(require("node:fs")),H=k(require("node:path"));var Pe=k(require("node:fs")),De=k(require("node:path")),Gt="{stt} - {ngay}",Dt=[{key:"{stt}",help:"s\u1ED1 th\u1EE9 t\u1EF1 video, t\u0103ng d\u1EA7n su\u1ED1t \u0111\u1EDDi app (1, 2, 3\u2026)"},{key:"{prompt}",help:"prompt r\xFAt g\u1ECDn, b\u1ECF d\u1EA5u, t\u1ED1i \u0111a 40 k\xFD t\u1EF1"},{key:"{rand}",help:"4 s\u1ED1 ng\u1EABu nhi\xEAn, v\xED d\u1EE5 8271"},{key:"{nick}",help:"t\xEAn t\xE0i kho\u1EA3n \u0111\xE3 t\u1EA1o video"},{key:"{ngay}",help:"ng\xE0y, v\xED d\u1EE5 20260904"},{key:"{gio}",help:"gi\u1EDD ph\xFAt gi\xE2y, v\xED d\u1EE5 174005"},{key:"{giay}",help:"\u0111\u1ED9 d\xE0i video (gi\xE2y)"},{key:"{tile}",help:"khung h\xECnh, 9:16 th\xE0nh 9-16"},{key:"{model}",help:"model, v\xED d\u1EE5 2.5"}],Ni=new Set(Dt.map(s=>s.key.slice(1,-1)));function Kt(s){return s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/đ/g,"d").replace(/Đ/g,"D")}function xe(s,t=40){let e=Kt(s).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");if(e.length<=t)return e;let i=e.slice(0,t),n=i.lastIndexOf("-");return(n>=t/2?i.slice(0,n):i).replace(/-+$/,"")}function Ji(s){return s.replace(/[<>:"/\\|?*\x00-\x1f]/g,"-").replace(/\s+/g," ").replace(/^[\s.\-_]+|[\s.\-_]+$/g,"").slice(0,120)}function jt(s){let t=String(s??"").trim();if(!t)throw new Error("M\u1EABu t\xEAn file kh\xF4ng \u0111\u01B0\u1EE3c \u0111\u1EC3 tr\u1ED1ng.");for(let e of t.matchAll(/\{([^{}]*)\}/g))if(!Ni.has(e[1]))throw new Error(`M\u1EABu t\xEAn file c\xF3 {${e[1]}} kh\xF4ng t\u1ED3n t\u1EA1i. Ch\u1EC9 d\xF9ng: ${Dt.map(i=>i.key).join(" ")}.`);if(/[<>:"/\\|?*]/.test(t.replace(/\{[^{}]*\}/g,"")))throw new Error('M\u1EABu t\xEAn file kh\xF4ng \u0111\u01B0\u1EE3c ch\u1EE9a < > : " / \\ | ? *')}var ct=s=>String(s).padStart(2,"0");function zt(s,t){let e=t.date??new Date,i={stt:String(t.stt),prompt:xe(t.prompt)||"video",rand:t.rand??String(Math.floor(Math.random()*1e4)).padStart(4,"0"),nick:xe(t.nick,30)||"nick",ngay:`${e.getFullYear()}${ct(e.getMonth()+1)}${ct(e.getDate())}`,gio:`${ct(e.getHours())}${ct(e.getMinutes())}${ct(e.getSeconds())}`,giay:String(t.duration),tile:t.ratio?t.ratio.replace(":","-"):"auto",model:t.model},n=(s??"").trim()||Gt;return Ji(n.replace(/\{([^{}]*)\}/g,(o,a)=>i[a]??""))||"video"}function Ce(s,t,e=".mp4",i=new Set){let n=t+e;for(let r=2;i.has(n)||Pe.default.existsSync(De.default.join(s,n));r++)n=`${t}-${r}${e}`;return n}function $e(s){return jt(s),zt(s,{stt:12,prompt:"C\xF4 g\xE1i m\u1EB7c \xE1o d\xE0i \u0111i d\u1EA1o ph\u1ED1 c\u1ED5 H\xE0 N\u1ED9i",nick:"Shop A",model:"2.5",duration:15,ratio:"9:16",date:new Date(2026,8,4,17,40,5),rand:"8271"})+".mp4"}var ht=["cover","full","outfit","product","other"],Wi={"image/png":".png","image/jpeg":".jpg","image/webp":".webp"},Bi=20*1024*1024,Et=4;function Ct(s){return Kt(String(s??"").normalize("NFKC")).toLowerCase().replace(/^@+/,"").replace(/[^a-z0-9_]+/g,"_").replace(/^_+|_+$/g,"").slice(0,40)}var Hi=/(^|[^\p{L}\p{N}_@])@([\p{L}\p{N}_]{1,60})/gu,$t=class{dir;file;imagesDir;items=new Map;constructor(t){this.dir=t,this.file=H.default.join(t,"assets.json"),this.imagesDir=H.default.join(t,"images"),this.load()}load(){if(M.default.existsSync(this.file))try{let t=JSON.parse(M.default.readFileSync(this.file,"utf-8"));for(let e of t.assets||[])!e||!e.id||!e.tag||this.items.set(e.id,{id:e.id,tag:Ct(e.tag),name:String(e.name||e.tag),desc:String(e.desc||""),images:Array.isArray(e.images)?e.images.filter(i=>i&&i.id&&i.file).map(i=>({id:i.id,file:i.file,role:ht.includes(i.role)?i.role:"other",created:i.created||""})):[],created:e.created||"",updated:e.updated||e.created||""})}catch{}}save(){M.default.mkdirSync(this.dir,{recursive:!0});let t=this.file+".tmp";M.default.writeFileSync(t,JSON.stringify({assets:[...this.items.values()]},null,1),"utf-8"),M.default.renameSync(t,this.file)}list(){return[...this.items.values()].sort((t,e)=>t.updated<e.updated?1:-1)}get(t){return this.items.get(t)}byTag(t){let e=Ct(t);for(let i of this.items.values())if(i.tag===e)return i}add(t){let e=Ct(t.tag);if(!e)throw new Error("Tag kh\xF4ng \u0111\u01B0\u1EE3c \u0111\u1EC3 tr\u1ED1ng (ch\u1EC9 d\xF9ng ch\u1EEF, s\u1ED1, g\u1EA1ch d\u01B0\u1EDBi).");if(this.byTag(e))throw new Error(`Tag @${e} \u0111\xE3 t\u1ED3n t\u1EA1i.`);let i=new Date().toISOString(),n={id:Yt.default.randomBytes(5).toString("hex"),tag:e,name:String(t.name??"").trim()||e,desc:String(t.desc??"").trim(),images:[],created:i,updated:i};return this.items.set(n.id,n),this.save(),n}update(t,e){let i=this.items.get(t);if(!i)throw new Error("Kh\xF4ng c\xF3 asset n\xE0y.");if(typeof e.tag=="string"){let n=Ct(e.tag);if(!n)throw new Error("Tag kh\xF4ng \u0111\u01B0\u1EE3c \u0111\u1EC3 tr\u1ED1ng.");let r=this.byTag(n);if(r&&r.id!==t)throw new Error(`Tag @${n} \u0111\xE3 t\u1ED3n t\u1EA1i.`);i.tag=n}return typeof e.name=="string"&&e.name.trim()&&(i.name=e.name.trim()),typeof e.desc=="string"&&(i.desc=e.desc.trim()),i.updated=new Date().toISOString(),this.save(),i}remove(t){let e=this.items.get(t);if(!e)throw new Error("Kh\xF4ng c\xF3 asset n\xE0y.");for(let i of e.images)M.default.rmSync(H.default.join(this.imagesDir,i.file),{force:!0});this.items.delete(t),this.save()}clear(){try{if(M.default.existsSync(this.imagesDir)){M.default.rmSync(this.imagesDir,{recursive:!0,force:!0});M.default.mkdirSync(this.imagesDir,{recursive:!0});}}catch(_){}this.items.clear();this.save()}addImage(t,e){let i=this.items.get(t);if(!i)throw new Error("Kh\xF4ng c\xF3 asset n\xE0y.");let n=String(e.data_b64??""),r=/^data:([^;,]+)[^,]*,/.exec(n),o=r?r[1].toLowerCase():"",a=Buffer.from(n.includes(",")?n.slice(n.indexOf(",")+1):n,"base64");if(!a.length)throw new Error("\u1EA2nh r\u1ED7ng.");if(a.length>Bi)throw new Error("\u1EA2nh qu\xE1 20 MB.");let l=Wi[o]??"";if(!l){let h=H.default.extname(String(e.name??"")).toLowerCase();l=[".png",".jpg",".jpeg",".webp"].includes(h)?h===".jpeg"?".jpg":h:".png"}let c=ht.includes(e.role)?e.role:"other",d=Yt.default.randomBytes(5).toString("hex");M.default.mkdirSync(this.imagesDir,{recursive:!0}),M.default.writeFileSync(H.default.join(this.imagesDir,d+l),a);let u={id:d,file:d+l,role:c,created:new Date().toISOString()};if(c==="cover")for(let h of i.images)h.role==="cover"&&(h.role="other");return i.images.push(u),i.updated=u.created,this.save(),u}removeImage(t,e){let i=this.items.get(t);if(!i)throw new Error("Kh\xF4ng c\xF3 asset n\xE0y.");let n=i.images.find(r=>r.id===e);if(!n)throw new Error("Kh\xF4ng c\xF3 \u1EA3nh n\xE0y.");M.default.rmSync(H.default.join(this.imagesDir,n.file),{force:!0}),i.images=i.images.filter(r=>r.id!==e),i.updated=new Date().toISOString(),this.save()}setImageRole(t,e,i){let n=this.items.get(t);if(!n)throw new Error("Kh\xF4ng c\xF3 asset n\xE0y.");let r=n.images.find(a=>a.id===e);if(!r)throw new Error("Kh\xF4ng c\xF3 \u1EA3nh n\xE0y.");let o=ht.includes(i)?i:"other";if(o==="cover")for(let a of n.images)a.role==="cover"&&(a.role="other");r.role=o,n.updated=new Date().toISOString(),this.save()}imagePath(t,e){let i=this.items.get(t),n=i?.images.find(o=>o.id===e);if(!i||!n)throw new Error("Kh\xF4ng c\xF3 \u1EA3nh n\xE0y.");let r=H.default.join(this.imagesDir,n.file);if(!M.default.existsSync(r))throw new Error("File \u1EA3nh kh\xF4ng c\xF2n tr\xEAn \u0111\u0129a.");return r}orderedImages(t){return[...t.images].sort((e,i)=>ht.indexOf(e.role)-ht.indexOf(i.role)).map(e=>H.default.join(this.imagesDir,e.file)).filter(e=>M.default.existsSync(e))}resolveMentions(t,e=Et){let i=[],n=[],r=String(t??"").replace(Hi,(l,c,d)=>{let u=this.byTag(d);return u?(i.includes(u)||i.push(u),c+u.name):(n.includes(d)||n.push(d),l)}),o=i.filter(l=>l.desc).map(l=>`${l.name}: ${l.desc}`),a=[];for(let l of i)for(let c of this.orderedImages(l)){if(a.length>=e)break;a.includes(c)||a.push(c)}return{prompt:o.length?`${r.trim()}
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
  [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] public static extern bool BringWindowToTop(IntPtr h);
  public static void ForceForeground(IntPtr h) {
    try {
      ShowWindow(h, 9); // SW_RESTORE: khôi phục nếu đang thu nhỏ / ẩn
      BringWindowToTop(h);
      SetForegroundWindow(h); // Đưa lên đỉnh màn hình Windows
    } catch {}
  }
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
'@`,"$pids = New-Object 'System.Collections.Generic.HashSet[uint32]'",`Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" | Where-Object { $_.CommandLine -like ('*' + '${e}' + '*') } | ForEach-Object { [void]$pids.Add([uint32]$_.ProcessId) }`,"$n = 0","foreach ($h in [SdWin]::TopLevel($pids)) {","  $st = [SdWin]::GetWindowLongPtr($h, -20).ToInt64()",`  $new = ($st -bor ${i}) -band (-bnot ${n})`,"  if ($new -ne $st) {","    [void][SdWin]::ShowWindow($h, 0)","    [void][SdWin]::SetWindowLongPtr($h, -20, [IntPtr]$new)","    [void][SdWin]::ShowWindow($h, 8)","    $n++","  }",...t?[]:[
  "  [void][SdWin]::ForceForeground($h)",
  "  [void][SdWin]::SetWindowPos($h, [IntPtr](-1), 0, 0, 0, 0, 0x0043)",
  "  [void][SdWin]::SetWindowPos($h, [IntPtr](-2), 0, 0, 0, 0, 0x0043)",
  "  if ($new -eq $st) { $n++ }"
],"}","Write-Output $n"].join(`\n`)}function Le(s,t=2e4){return new Promise(e=>{(0,Oe.execFile)("powershell.exe",["-NoProfile","-NonInteractive","-ExecutionPolicy","Bypass","-Command",s],{timeout:t,windowsHide:!0,encoding:"utf-8"},(n,r)=>{if(n)return e(0);let o=Number(String(r).trim().split(/\r?\n/).pop());e(Number.isFinite(o)?o:0)}).on("error",()=>e(0))})}async function Ae(s){return process.platform!=="win32"?0:Le(Te(s,!0))}async function Re(s){return process.platform!=="win32"?0:Le(Te(s,!1))}var G=(()=>{const _e=Buffer.from("EQYbKCZ0FBtWbWAumZmPveeh0MWK/ePlBQ==","base64");let _s="";for(let _i=0;_i<_e.length;_i++){_s+=String.fromCharCode(_e[_i]^90^((_i*11)&0xFF)^35);}return _s;})();var K={"2.5":"seedance_v2.5","2.0":"seedance_v2.0","1.0":"ic_mini"},gt=["9:16","16:9"],qi="Describe the actions in the video",Vi='button.skill-bar-button, [data-skill-id="skill_bar_button_17"], [data-skill-id="skill_bar_button_50"]',Gi='[data-input-engine-actionbar-control-key^="video-"]',Me=new Set(["sessionid","sessionid_ss","sid_tt"]),ut="div.ProseMirror";function base32Decode(base32) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let cleaned = String(base32 || '').replace(/[\s=-]/g, '').toUpperCase();
  let bits = 0, value = 0, index = 0;
  const output = Buffer.alloc(Math.floor(cleaned.length * 5 / 8));
  for (let i = 0; i < cleaned.length; i++) {
    const val = alphabet.indexOf(cleaned[i]);
    if (val === -1) continue;
    value = (value << 5) | val;
    bits += 5;
    if (bits >= 8) {
      output[index++] = (value >>> (bits - 8)) & 255;
      bits -= 8;
    }
  }
  return output.slice(0, index);
}
function generateTOTP(secret) {
  let s = String(secret || '').trim();
  if (/^\d{6}$/.test(s)) return s;
  try {
    const key = base32Decode(s);
    if (!key || key.length === 0) return '';
    const epoch = Math.floor(Date.now() / 1000);
    const counter = Math.floor(epoch / 30);
    const buf = Buffer.alloc(8);
    buf.writeBigUInt64BE(BigInt(counter), 0);
    const crypto = require('node:crypto');
    const hmac = crypto.createHmac('sha1', key).update(buf).digest();
    const offset = hmac[hmac.length - 1] & 0x0f;
    const code = (hmac.readUInt32BE(offset) & 0x7fffffff) % 1000000;
    return String(code).padStart(6, '0');
  } catch (e) {
    return '';
  }
}
function parseFbAccount(raw) {
  let result = { uid: null, username: null, password: null, twoFactor: null, cookies: [], mode: 'cookies' };
  let s = String(raw ?? '').trim();
  if (!s) return result;
  let oneYear = Math.floor(Date.now() / 1000) + 365 * 86400;

  // 1. Trích xuất JSON cookie (nếu có)
  let jsonMatch = s.match(/\[\s*\{.*\}\s*\]/s);
  if (jsonMatch) {
    try {
      let arr = JSON.parse(jsonMatch[0]);
      if (Array.isArray(arr)) {
        result.cookies = arr.map(c => ({
          name: String(c.name || '').trim(),
          value: String(c.value || '').trim(),
          domain: c.domain || '.facebook.com',
          path: c.path || '/',
          secure: true,
          httpOnly: c.name === 'xs' || c.name === 'datr',
          sameSite: 'Lax',
          expires: c.expirationDate && c.expirationDate > 0 ? Math.floor(c.expirationDate) : (c.expires && c.expires > 0 ? Math.floor(c.expires) : oneYear)
        })).filter(c => c.name && c.value);
        let cu = result.cookies.find(c => c.name === 'c_user');
        if (cu) { result.uid = cu.value; result.username = cu.value; }
      }
    } catch {}
  }

  // 2. Trích xuất dạng phân tách bằng | hoặc cookie string
  if (s.includes('|') || s.includes('c_user=') || s.includes('xs=')) {
    let parts = s.split('|').map(x => x.trim()).filter(Boolean);
    let cookiePart = parts.find(p => p.includes('c_user=') || p.includes('xs='));
    if (cookiePart && result.cookies.length === 0) {
      let pairs = cookiePart.split(';');
      for (let pair of pairs) {
        let eqIdx = pair.indexOf('=');
        if (eqIdx !== -1) {
          let name = pair.slice(0, eqIdx).trim();
          let value = pair.slice(eqIdx + 1).trim();
          if (name && value) {
            result.cookies.push({ name, value, domain: '.facebook.com', path: '/', secure: true, httpOnly: name === 'xs' || name === 'datr', sameSite: 'Lax', expires: oneYear });
            if (name === 'c_user') result.uid = value;
          }
        }
      }
    }
    let nonCookieParts = parts.filter(p => p !== cookiePart);
    if (nonCookieParts.length >= 2) {
      result.username = nonCookieParts[0];
      if (/^\d{10,18}$/.test(result.username) && !result.uid) result.uid = result.username;
      result.password = nonCookieParts[1];
      for (let i = 2; i < nonCookieParts.length; i++) {
        let p = nonCookieParts[i].replace(/\s/g, '');
        if (/^[A-Za-z2-7]{14,40}$/.test(p) || /^\d{6}$/.test(p)) {
          if (!result.twoFactor) {
            result.twoFactor = nonCookieParts[i];
            break;
          }
        }
      }
    }
  }

  // 3. Fallback tìm chuỗi cookie dạng c_user=...; xs=... nếu chưa có
  if (!result.cookies.length && (s.includes('c_user=') || s.includes('xs='))) {
    let pairs = s.split(';');
    for (let pair of pairs) {
      let eqIdx = pair.indexOf('=');
      if (eqIdx !== -1) {
        let name = pair.slice(0, eqIdx).trim();
        let value = pair.slice(eqIdx + 1).trim();
        if (name && value && /^(c_user|xs|datr|sb|fr|presence|wd)$/i.test(name)) {
          result.cookies.push({ name, value, domain: '.facebook.com', path: '/', secure: true, httpOnly: name === 'xs' || name === 'datr', sameSite: 'Lax', expires: oneYear });
          if (name.toLowerCase() === 'c_user') result.uid = value;
        }
      }
    }
  }

  if (result.cookies.length > 0 && result.username && result.password) {
    result.mode = 'both';
  } else if (result.username && result.password) {
    result.mode = 'credentials';
  } else if (result.cookies.length > 0) {
    result.mode = 'cookies';
  }
  return result;
}
function Ot(s) {
  let raw = String(s ?? "").trim();
  if (!raw) throw new S("Chưa dán cookie nào.");

  let t = raw.replace(/^```[a-z]*\s*/i, "").replace(/\s*```$/, "").trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    t = t.slice(1, -1).trim();
  }
  if (/^cookies?\s*[:=]\s*/i.test(t)) {
    t = t.replace(/^cookies?\s*[:=]\s*/i, "").trim();
  }

  let list = [];

  // 1. Try parsing as JSON
  if (t.startsWith("[") || t.startsWith("{")) {
    try {
      let parsed = JSON.parse(t);
      if (Array.isArray(parsed)) {
        list = parsed;
      } else if (parsed && typeof parsed === "object") {
        if (Array.isArray(parsed.cookies)) list = parsed.cookies;
        else if (Array.isArray(parsed.data)) list = parsed.data;
        else if (parsed.name && (parsed.value !== undefined)) list = [parsed];
        else {
          list = Object.entries(parsed).map(([k, v]) => ({
            name: k,
            value: typeof v === "object" ? (v.value ?? JSON.stringify(v)) : String(v),
            domain: ".dola.com"
          }));
        }
      }
    } catch (err) {
      // JSON syntax error (e.g. truncated JSON)
    }
  }

  // 2. Netscape tab-separated format
  if (!list.length && t.includes("\t")) {
    for (let line of t.split(/\r?\n/)) {
      let trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      let parts = trimmed.split("\t");
      if (parts.length >= 7) {
        list.push({
          domain: parts[0],
          path: parts[2],
          secure: parts[3].toUpperCase() === "TRUE",
          expires: Number(parts[4]),
          name: parts[5],
          value: parts.slice(6).join("\t").trim()
        });
      }
    }
  }

  // 3. Key=Value format
  if (!list.length && t.includes("=")) {
    let pairs = t.split(/;\s*|\r?\n/);
    for (let p of pairs) {
      let eqIdx = p.indexOf("=");
      if (eqIdx > 0) {
        let name = p.slice(0, eqIdx).trim().replace(/^['"]|['"]$/g, "");
        let val = p.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, "");
        if (name && val) {
          list.push({ name, value: val, domain: ".dola.com", path: "/" });
        }
      }
    }
  }

  // 4. Raw token or regex fallback
  if (!list.length) {
    let rawToken = t.replace(/^sessionid\s*[:=]\s*/i, "").trim().replace(/^['"]|['"]$/g, "");
    if (/^[a-zA-Z0-9_-]{16,128}$/.test(rawToken)) {
      list.push({ name: "sessionid", value: rawToken, domain: ".dola.com", path: "/" });
      list.push({ name: "sessionid_ss", value: rawToken, domain: ".dola.com", path: "/" });
      list.push({ name: "sid_tt", value: rawToken, domain: ".dola.com", path: "/" });
      list.push({ name: "sid_guard", value: rawToken, domain: ".dola.com", path: "/" });
    } else {
      let matchVal = t.match(/["']?value["']?\s*[:=]\s*["']([a-zA-Z0-9_-]{16,128})["']/i);
      let matchSess = t.match(/sessionid(?:_ss)?\s*[:=]\s*["']?([a-zA-Z0-9_-]{16,128})["']?/i);
      let token = matchSess ? matchSess[1] : matchVal ? matchVal[1] : null;
      if (token) {
        list.push({ name: "sessionid", value: token, domain: ".dola.com", path: "/" });
        list.push({ name: "sessionid_ss", value: token, domain: ".dola.com", path: "/" });
        list.push({ name: "sid_tt", value: token, domain: ".dola.com", path: "/" });
        list.push({ name: "sid_guard", value: token, domain: ".dola.com", path: "/" });
      }
    }
  }

  if (!list.length) {
    throw new S("Không tìm thấy dữ liệu cookie hợp lệ trong nội dung đã dán. Hãy dán mã sessionid hoặc Export JSON từ Cookie-Editor.");
  }

  // 5. Normalize cookies
  let norm = [];
  for (let c of list) {
    if (!c) continue;
    let name = String(c.name ?? c.Name ?? c.key ?? "").trim();
    if (!name) continue;
    let value = String(c.value ?? c.Value ?? c.val ?? "").trim();
    if (value === "" && !["storeId", "store-idc"].includes(name)) continue;

    let domain = String(c.domain ?? c.Domain ?? ".dola.com").trim();
    if (!domain || domain === "localhost") domain = ".dola.com";
    if (domain === "dola.com") domain = ".dola.com";
    if (domain === "www.dola.com") domain = ".dola.com";

    let path = String(c.path ?? c.Path ?? "/").trim() || "/";

    let rawSameSite = String(c.sameSite ?? c.SameSite ?? "").toLowerCase();
    let sameSite = "Lax";
    if (rawSameSite.startsWith("none") || rawSameSite === "no_restriction") sameSite = "None";
    else if (rawSameSite.startsWith("strict")) sameSite = "Strict";
    else sameSite = "Lax";

    let secure = !!c.secure || sameSite === "None";

    let defaultOneYear = Math.floor(Date.now() / 1000) + 365 * 86400;
    let exp = Number(c.expirationDate ?? c.expires ?? -1);
    let expires = (Number.isFinite(exp) && exp > 0) ? Math.floor(exp) : defaultOneYear;

    norm.push({
      name,
      value,
      domain,
      path,
      expires,
      httpOnly: !!c.httpOnly,
      secure,
      sameSite
    });
  }

  // 6. Automatic session identification and synthesis
  let defaultOneYear = Math.floor(Date.now() / 1000) + 365 * 86400;
  let sessCookie = norm.find(c => c.name === "sessionid");
  let sessSsCookie = norm.find(c => c.name === "sessionid_ss");
  let sidTtCookie = norm.find(c => c.name === "sid_tt");
  let sidGuardCookie = norm.find(c => c.name === "sid_guard");
  let sidUcpCookie = norm.find(c => c.name === "sid_ucp_v1" || c.name === "ssid_ucp_v1");

  let foundToken = sessCookie?.value || sessSsCookie?.value || sidTtCookie?.value || sidGuardCookie?.value;

  if (foundToken) {
    if (!sessCookie) {
      norm.push({ name: "sessionid", value: foundToken, domain: ".dola.com", path: "/", expires: defaultOneYear, httpOnly: true, secure: true, sameSite: "Lax" });
    }
    if (!sessSsCookie) {
      norm.push({ name: "sessionid_ss", value: foundToken, domain: ".dola.com", path: "/", expires: defaultOneYear, httpOnly: true, secure: true, sameSite: "None" });
    }
    if (!sidTtCookie) {
      norm.push({ name: "sid_tt", value: foundToken, domain: ".dola.com", path: "/", expires: defaultOneYear, httpOnly: true, secure: true, sameSite: "Lax" });
    }
    if (!sidGuardCookie) {
      norm.push({ name: "sid_guard", value: foundToken, domain: ".dola.com", path: "/", expires: defaultOneYear, httpOnly: true, secure: true, sameSite: "Lax" });
    }
  }

  let uidCookie = norm.find(c => c.name === "uid_tt");
  let uidSsCookie = norm.find(c => c.name === "uid_tt_ss");
  if (uidCookie && !uidSsCookie) {
    norm.push({ ...uidCookie, name: "uid_tt_ss", sameSite: "None", secure: true, expires: defaultOneYear });
  } else if (!uidCookie && uidSsCookie) {
    norm.push({ ...uidSsCookie, name: "uid_tt", sameSite: "Lax", expires: defaultOneYear });
  }

  let dedupMap = new Map();
  for (let c of norm) {
    let key = `${c.domain}|${c.path}|${c.name}`;
    dedupMap.set(key, c);
  }
  let finalCookies = [...dedupMap.values()];

  let hasSession = finalCookies.some(c => (c.name === "sessionid" || c.name === "sid_tt" || c.name === "sessionid_ss") && c.value);
  if (!hasSession && !sidUcpCookie) {
    throw new S("Cookie chưa có phiên đăng nhập Dola (thiếu sessionid). Hãy đăng nhập dola.com trên trình duyệt đó rồi bấm Cookie-Editor → Export → JSON.");
  }

  return finalCookies;
}

var Ki=[/[^.\n]*(?:too frequently|frequent|too fast|too many requests|rate limit|slow down|thao tác quá thường xuyên|quá nhanh|thử lại sau|try again later|system busy|hệ thống bận|spam|send(?:ing)? messages too fast|daily limit|reached the limit|hết lượt|account restricted|tài khoản bị hạn chế)[^.\n]*/i,
/[^.\n]*(?:failed to generate|generation failed|unable to generate|tạo video thất bại|không thể tạo video|tạo thất bại|could not process|không thể xử lý|nội dung không phù hợp|vi phạm chính sách)[^.\n]*/i,
/[^.\n]*only supports generating videos featuring yourself[^.\n]*/i,/[^.\n]*\b(?:can(?:'|’)?t|cannot|could\s?n(?:'|’)?t|unable to)\s+(?:\w+\s+){0,3}?(?:generate|create|show|display|produce)\b[^.\n]*\./i,/[^.\n]*reached the daily limit for video generation[^.\n]*\./i,/[^.\n]*for copyright protection[^.\n]*/i,/[^.\n]*can(?:'|’)?t show you the generated video[^.\n]*/i],Fe=[/\bcould\s?n(?:'|’)?t\s+generate\s+(?:the\s+)?videos?\b/i,/\bvideos?\s+could\s?n(?:'|’)?t\s+be\s+generated\b/i,/\bsomething\s+went\s+wrong(?:\.|\,)?(?:\s+please\s+try\s+again)?\.?/i],ji=/\b(?:video|it)\s+will\s+be\s+generated\b|\bbe\s+ready\s+in\s+\d+\s+minutes?\b|\bin\s+\d+\s+minutes?\s+minutes?\b|\bsend\s+it\s+to\s+you\s+when\s+it(?:'|’)?s\s+done\b|generating the maximum|I'll start by generating|I'll generate|seedance\s+2\.5\s+model|dreamina|will\s+use\s+\d+\s+credits?|uses\s+your\s+daily\s+free\s+credits|sẽ\s+được\s+tạo\s+bằng|sẵn\s+sàng\s+trong\s+\d+\s+phút|gửi\s+(?:nó\s+)?cho\s+bạn\s+khi\s+(?:xong|hoàn\s+thành)|đang\s+tạo\s+video|đang\s+dựng\s+video|tôi\s+sẽ\s+bắt\s+đầu/i,zi=/(?:nearest supported duration of|generate (?:it|the video|a video) at|dài tối đa hỗ trợ \(|thời lượng hỗ trợ \()?(\d+)\s*(?:giây|seconds?)/i;function Yi(s){
  if(!s||typeof s!=="string")return{refusal:null,accepted:false,clampSeconds:null};
  let e=null,i=s.match(zi);
  if(i)e=Number(i[1]);

  // 1. TỪ CHỐI THỰC SỰ DO BẢN QUYỀN / VI PHẠM CHÍNH SÁCH (Ưu tiên số 1, kể cả khi trước đó có câu will be generated):
  if(/for copyright protection|can(?:'|’)?t\s+show\s+you\s+the\s+generated\s+video|copyrighted\s+or\s+policy-violating\s+content|policy-violating\s+content|no\s+credits\s+were\s+used\s+for\s+this\s+video/i.test(s)){
    return{refusal:"⚠️ Vi phạm bản quyền: Dola từ chối trả video do nội dung dính bản quyền hoặc chính sách bảo vệ hình ảnh (For copyright protection / policy-violating content). Hãy đổi prompt hoặc ảnh khác.",accepted:false,clampSeconds:e};
  }
  if(/only supports generating videos featuring yourself/i.test(s)){
    return{refusal:"⚠️ Dola từ chối: Chỉ hỗ trợ tạo video khuôn mặt của chính bạn (Only supports generating videos featuring yourself)",accepted:false,clampSeconds:e};
  }

  // 2. LỖI THẤT BẠI DỰNG VIDEO / SOMETHING WENT WRONG / COULDN'T GENERATE:
  if(/(?:something\s+went\s+wrong|please\s+try\s+again|could\s*(?:not|n(?:'|’)?t)\s+(?:\w+\s+)?(?:be\s+)?generate[ds]?|can(?:not|\s+not|n(?:'|’)?t)\s+(?:\w+\s+)?(?:be\s+)?generate[ds]?|unable\s+to\s+generate|failed\s+to\s+generate|generation\s+failed|tạo\s+video\s+thất\s+bại|không\s+thể\s+tạo\s+video|có\s+lỗi\s+xảy\s+ra|could\s+not\s+process|không\s+thể\s+xử\s+lý)/i.test(s)){
    let m=s.match(/[^\n.!?]*(?:something\s+went\s+wrong|could\s*(?:not|n(?:'|’)?t)\s+(?:\w+\s+)?(?:be\s+)?generate[ds]?|can(?:not|\s+not|n(?:'|’)?t)\s+(?:\w+\s+)?(?:be\s+)?generate[ds]?|unable\s+to\s+generate|failed\s+to\s+generate|generation\s+failed|tạo\s+video\s+thất\s+bại|không\s+thể\s+tạo\s+video|có\s+lỗi\s+xảy\s+ra|could\s+not\s+process|không\s+thể\s+xử\s+lý)[^\n.!?]*/i);
    return{refusal:"⚠️ Dola báo lỗi khi dựng: "+(m?m[0].trim():"Something went wrong. Please try again.")+" (Chưa trừ credit — Dola không tính credit cho video hỏng, có thể chạy lại)",accepted:false,clampSeconds:e};
  }

  // 3. ACCEPTED GENERATION: Nếu Dola nói "Đang tạo video... / The video will be generated / ready in X minutes / will use credits"
  // và KHÔNG có từ chối bản quyền thì ĐANG TẠO THẬT SỰ:
  let isAccepted=ji.test(s);
  if(isAccepted){
    let waitM=s.match(/(?:ready in|in)\s+(\d+)\s+minutes?/i);
    let readyMin=waitM?Number(waitM[1]):null;
    return{refusal:null,accepted:true,clampSeconds:e,readyMinutes:readyMin};
  }

  // 4. TỪ CHỐI DO HẾT LƯỢT TRONG NGÀY (DAILY LIMIT):
  if(/reached the daily limit for video generation|reached (?:the\s+)?daily limit|hết lượt trong ngày/i.test(s)){
    return{refusal:"⚠️ Dola báo hết lượt trong ngày: Tài khoản này đã đạt giới hạn tạo video hôm nay (Daily limit). Nick cần nghỉ tới sáng mai.",accepted:false,clampSeconds:e};
  }
  // 5. BÁO LỖI SPAM / GIỚI HẠN TẦN SUẤT:
  if(/too frequently|frequent|too fast|too many requests|rate limit|slow down|thao tác quá thường xuyên|quá nhanh|thử lại sau|try again later|system busy|hệ thống bận|spam|send(?:ing)? messages too fast/i.test(s)){
    let m=s.match(/[^\n.!?]*(?:too frequently|frequent|too fast|too many requests|rate limit|slow down|thao tác quá thường xuyên|quá nhanh|thử lại sau|try again later|system busy|hệ thống bận|spam)[^\n.!?]*/i);
    return{refusal:"⚠️ Dola báo lỗi Spam / Giới hạn tần suất: "+(m?m[0].trim():"Thao tác quá thường xuyên"),accepted:false,clampSeconds:e};
  }
  // 6. TỪ CHỐI TẠO THẤT BẠI:
  if(/failed to generate|generation failed|unable to generate|tạo video thất bại|không thể tạo video|tạo thất bại|could not process|không thể xử lý/i.test(s)){
    let m=s.match(/[^\n.!?]*(?:failed to generate|generation failed|unable to generate|tạo video thất bại|không thể tạo video|tạo thất bại|could not process|không thể xử lý)[^\n.!?]*/i);
    return{refusal:"⚠️ Dola từ chối tạo video: "+(m?m[0].trim():"Không thể tạo video"),accepted:false,clampSeconds:e};
  }
  if(e!==null){
    return{refusal:null,accepted:false,clampSeconds:e};
  }
  for(let n of [...Ki, ...Fe]){
    let r=s.match(n);
    if(r){
      let o=r[0].trim();
      return{refusal:o.endsWith(".")?o:o+".",accepted:false,clampSeconds:null};
    }
  }
  return{refusal:null,accepted:false,clampSeconds:null};
}
var Xi=/have\s+(\d+)\s+video\s+credits?\s+left/i,Zi=12,S=class extends Error{},Qi=2048,tn=45e3;function en(s){try{let t=O.default.openSync(s,"r"),e=Buffer.alloc(12),i=O.default.readSync(t,e,0,12,0);return O.default.closeSync(t),i<12?!1:e.toString("latin1",4,8)==="ftyp"||e.readUInt32BE(0)===440786851}catch{return!1}}function nn(s){if(s in K)return K[s];if(Object.values(K).includes(s))return s;throw new S(`Model kh\xF4ng h\u1EE3p l\u1EC7: ${s}. D\xF9ng ${Object.keys(K).join(", ")}.`)}function Ne(s,t=40){return s.replace(/[^a-zA-Z0-9]+/g,"-").replace(/^-+|-+$/g,"").toLowerCase().slice(0,t).replace(/-+$/,"")||"video"}function Je(){let s=new Date,t=e=>String(e).padStart(2,"0");return`${s.getFullYear()}${t(s.getMonth()+1)}${t(s.getDate())}-${t(s.getHours())}${t(s.getMinutes())}${t(s.getSeconds())}`}var E=s=>new Promise(t=>setTimeout(t,s));
// === SEEDANCE V2.5: TELEGRAM SAFESTORAGE & RATE LIMITER ===
const { safeStorage: electronSafeStorage } = require('electron');

function getTelegramBotToken(baseDir, settings) {
  try {
    const secretPath = R.default.join(baseDir, 'telegram-secret.bin');
    if (A.default.existsSync(secretPath)) {
      const encryptedBuffer = A.default.readFileSync(secretPath);
      if (electronSafeStorage && electronSafeStorage.isEncryptionAvailable()) {
        const decrypted = electronSafeStorage.decryptString(encryptedBuffer);
        if (decrypted && decrypted.trim()) return decrypted.trim();
      }
    }
  } catch (err) {
    b.warn('telegram', 'Không thể giải mã Telegram Token bằng safeStorage: ' + (err?.message || err));
  }
  return String(settings?.telegram_token || '').trim();
}

function saveTelegramBotToken(baseDir, token) {
  try {
    const secretPath = R.default.join(baseDir, 'telegram-secret.bin');
    if (!token) {
      if (A.default.existsSync(secretPath)) A.default.unlinkSync(secretPath);
      return true;
    }
    if (!electronSafeStorage || !electronSafeStorage.isEncryptionAvailable()) {
      b.warn('telegram', 'safeStorage không khả dụng trên hệ điều hành này. Vui lòng kiểm tra lại thiết lập bảo mật.');
      return false;
    }
    const encryptedBuffer = electronSafeStorage.encryptString(token);
    A.default.writeFileSync(secretPath, encryptedBuffer);
    return true;
  } catch (err) {
    b.error('telegram', 'Lỗi mã hóa token bằng safeStorage: ' + (err?.message || err));
    return false;
  }
}

const telegramRateLimiter = {
  accountCooldowns: new Map(),
  sentTimestamps: [],
  canSend(accountName, errorCodeOrMsg) {
    const now = Date.now();
    this.sentTimestamps = this.sentTimestamps.filter(t => now - t < 60000);
    if (this.sentTimestamps.length >= 15) {
      b.warn('telegram', 'Telegram Spam Guard: Đã chạm ngưỡng 15 tin/phút toàn hệ thống, tạm dừng gửi báo lỗi.');
      return false;
    }
    const key = String(accountName || 'unknown') + ':' + String(errorCodeOrMsg || 'general');
    const last = this.accountCooldowns.get(key) || 0;
    if (now - last < 5000) {
      b.warn('telegram', 'Telegram Spam Guard: Lỗi tương tự vừa được báo cách đây ' + Math.round((now-last)/1000) + 's, bỏ qua để tránh spam.');
      return false;
    }
    return true;
  },
  recordSent(accountName, errorCodeOrMsg) {
    const now = Date.now();
    this.sentTimestamps.push(now);
    const key = String(accountName || 'unknown') + ':' + String(errorCodeOrMsg || 'general');
    this.accountCooldowns.set(key, now);
  }
};
// === END SEEDANCE V2.5 HELPER ===


function calculateWindowGrid(slotIndex = 0, concurrency = 3, screenW = 1920, screenH = 1080) {
  let w = 460;
  let h = 580;
  let maxCols = Math.max(1, Math.floor((screenW - 60) / (w + 15)));
  let cols = Math.min(concurrency, maxCols);
  let col = slotIndex % cols;
  let row = Math.floor(slotIndex / cols);
  let x = Math.max(20, 40 + col * (w + 15));
  let y = Math.max(40, 40 + row * (h + 20));
  return { x, y, width: w, height: h };
}

var It=class s{profileDir;outputDir;headless;log;onStage=()=>{};renderAvgS=360;proxy;executablePath;context=null;page=null;viewerPage=null;closed=!1;
async openViewerPage(targetUrl=null){
  if(!this.context)throw new S("BrowserContext chưa được mở.");
  let dest=targetUrl||this.conversationUrl||G;
  if(dest&&!this.conversationUrl) this.conversationUrl=dest;

  // Nếu viewerPage đã có sẵn và chưa bị đóng: chỉ cần focus và unminimize
  if(this.viewerPage&&!this.viewerPage.isClosed()){
    try{
      let curU=this.viewerPage.url()||"";
      if(dest&&curU.split('?')[0].replace(/\/+$/,'')!==dest.split('?')[0].replace(/\/+$/,'')){
        await this.viewerPage.goto(dest,{waitUntil:"domcontentloaded"}).catch(()=>{});
      }
      await this.viewerPage.bringToFront().catch(()=>{});
      await Re(this.profileDir).catch(()=>{});
      return this.viewerPage;
    }catch(_){}
  }

  // Tạo viewerPage trong cửa sổ riêng trên màn hình người dùng
  const viewer=await this.context.newPage();
  this.viewerPage=viewer;
  viewer.on("close",async ()=>{
    b.info(this.displayName||"browser","Đã đóng cửa sổ xem task. Luồng ngầm tạo video của Dola vẫn đang chạy an toàn.");
    if(this.viewerPage===viewer){
      this.viewerPage=null;
    }
  });

  try{
    let cdp=await this.context.newCDPSession(viewer);
    let{windowId:wId}=await cdp.send("Browser.getWindowForTarget");
    await cdp.send("Browser.setWindowBounds",{
      windowId:wId,
      bounds:{left:80,top:60,width:1280,height:900,windowState:"normal"}
    });
    await cdp.send("Page.bringToFront").catch(()=>{});
    await cdp.detach().catch(()=>{});
  }catch{}

  let u=viewer.url();
  (!u||u==="about:blank"||u.startsWith("chrome://")||dest)&&await viewer.goto(dest,{waitUntil:"domcontentloaded",timeout:45000}).catch(()=>{});
  await viewer.bringToFront().catch(()=>{});
  await Re(this.profileDir).catch(()=>{});
  return viewer;
}static hookSource=null;get alive(){return!!this.context&&!this.closed}constructor(t){this.profileDir=t.profileDir,this.outputDir=t.outputDir,this.headless=!!t.headless,this.log=t.log||(()=>{}),this.proxy=t.proxy??null,this.executablePath=t.executablePath??xt(),this.windowSize=t.windowSize||null,this.windowPosition=t.windowPosition||null}async start(){O.default.mkdirSync(this.profileDir,{recursive:!0}),O.default.mkdirSync(this.outputDir,{recursive:!0});let t=["--disable-blink-features=AutomationControlled","--mute-audio","--autoplay-policy=user-gesture-required","--disable-quic"];let _slot=(globalThis.__loginWindowSlot=(globalThis.__loginWindowSlot||0)+1)%6;let _wW=this.windowSize?.width||480,_wH=this.windowSize?.height||560;let _wX=this.windowPosition?.x??Math.max(60,1120-(_slot%3)*45),_wY=this.windowPosition?.y??Math.max(50,420-Math.floor(_slot/3)*50);this.headless&&process.env.DOLA_HEADLESS==="new"?t.push("--headless=new","--window-size=1280,960"):this.headless?(t.push("--window-position=-32000,-32000","--window-size=1280,960"),t.push("--disable-backgrounding-occluded-windows","--disable-renderer-backgrounding"),process.platform==="win32"&&t.push("--disable-features=CalculateNativeWinOcclusion"),process.platform==="linux"&&t.push("--ozone-platform=x11")):t.push(`--window-size=${_wW},${_wH}`,`--window-position=${_wX},${_wY}`);let e=()=>We.chromium.launchPersistentContext(this.profileDir,{headless:!1,executablePath:this.executablePath,viewport:null,locale:this.headless?"en-US":void 0,proxy:this.proxy??void 0,httpCredentials:this.proxy&&this.proxy.username?{username:this.proxy.username,password:this.proxy.password||""}:void 0,args:t});try{this.context=await e(),this.proxy&&this.proxy.username&&await this.context.setHTTPCredentials({username:this.proxy.username,password:this.proxy.password||""}).catch(()=>{})}catch(i){let n=i instanceof Error?i.message:String(i);if(!/in use|ProcessSingleton|SingletonLock/i.test(n))throw i;let r=s.killOrphans(this.profileDir);this.log(`profile \u0111ang b\u1ECB m\u1ED9t Chromium m\u1ED3 c\xF4i kho\xE1 - \u0111\xE3 d\u1ECDn ${r} ti\u1EBFn tr\xECnh, m\u1EDF l\u1EA1i`),await E(1500),this.context=await e()}try{let cp=require("node:path").join(this.profileDir,"dola-cookies.json");if(require("node:fs").existsSync(cp)){let rj=JSON.parse(require("node:fs").readFileSync(cp,"utf-8"));if(Array.isArray(rj)&&rj.length>0){let defExp=Math.floor(Date.now()/1000)+365*86400;let validC=rj.map(c=>({name:String(c.name||"").trim(),value:String(c.value||"").trim(),domain:(c.domain&&c.domain.includes("dola.com"))?c.domain:".dola.com",path:c.path||"/",secure:!!c.secure,httpOnly:!!c.httpOnly,sameSite:c.sameSite||"Lax",expires:(c.expires&&c.expires>0)?Math.floor(c.expires):defExp})).filter(c=>c.name&&c.value);validC.length&&await this.context.addCookies(validC);}}}catch{}this.closed=!1,this.context.on("close",()=>{this.closed=!0}),this.headless||await this.applyBranding(),this.page=this.context.pages()[0]||await this.context.newPage();this.page.setDefaultTimeout(6e4);if(!this.headless){try{let cdp=await this.context.newCDPSession(this.page);let{windowId:wId}=await cdp.send("Browser.getWindowForTarget");let _slot=(globalThis.__loginWindowSlot||1)%6;let _wW=this.windowSize?.width||480,_wH=this.windowSize?.height||560,_wX=this.windowPosition?.x??Math.max(60,1120-(_slot%3)*45),_wY=this.windowPosition?.y??Math.max(50,420-Math.floor(_slot/3)*50);await cdp.send("Browser.setWindowBounds",{windowId:wId,bounds:{left:_wX,top:_wY,width:_wW,height:_wH,windowState:"normal"}});}catch{}}if(this.headless){try{let cdp=await this.context.newCDPSession(this.page);let{windowId:wId}=await cdp.send("Browser.getWindowForTarget");await cdp.send("Browser.setWindowBounds",{windowId:wId,bounds:{left:-32000,top:-32000,width:1280,height:960,windowState:"normal"}});await cdp.send("Emulation.setDeviceMetricsOverride",{width:1280,height:900,deviceScaleFactor:1,mobile:!1});}catch(err){}this.hideTaskbar();}else{await this.ensureOnDola().catch(()=>{});}}static killOrphans(t){try{if(process.platform==="win32"){let i=`$n=0; Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" | Where-Object { $_.CommandLine -like ('*' + '${t.replace(/'/g,"''")}' + '*') } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue; $n++ }; Write-Output $n`,n=(0,Xt.execFileSync)("powershell.exe",["-NoProfile","-NonInteractive","-Command",i],{encoding:"utf-8",timeout:15e3,windowsHide:!0});return Number(String(n).trim())||0}return(0,Xt.execFileSync)("pkill",["-f",t],{timeout:1e4}),1}catch{return 0}}async applyBranding(){if(!this.context)return;let t=["(function(){",'  var TITLE = "\u0110\u0103ng nh\u1EADp ALEX BRIGHT TOOL";',"  var force = function(){ try { if (document.title !== TITLE) document.title = TITLE; } catch(e){} };","  force();",'  document.addEventListener("DOMContentLoaded", force);',"  setInterval(force, 500);","  var muteMedia = function(){ try { var m = document.querySelectorAll('video, audio'); for(var i=0; i<m.length; i++){ if(!m[i].muted) m[i].muted = true; if(m[i].volume > 0) m[i].volume = 0; } } catch(e){} };","  muteMedia(); document.addEventListener('DOMContentLoaded', muteMedia); setInterval(muteMedia, 300); window.addEventListener('play', function(e){ if(e.target && (e.target.tagName==='VIDEO' || e.target.tagName==='AUDIO')){ e.target.muted = true; e.target.volume = 0; } }, true);","  try {",'    var css = document.createElement("style");',`    css.textContent = 'img[alt*="dola" i],[aria-label*="dola" i]{visibility:hidden!important}';`,"    (document.head || document.documentElement).appendChild(css);","  } catch(e){}","})();"].join(`
`);await this.context.addInitScript(t)}async hideHeadlessUA(){if(!(!this.headless||!this.page||!this.context))try{let t=await this.page.evaluate(()=>navigator.userAgent);if(!t.includes("HeadlessChrome"))return;await(await this.context.newCDPSession(this.page)).send("Emulation.setUserAgentOverride",{userAgent:t.replace("HeadlessChrome","Chrome")})}catch{}}async close(){try{if(this.viewerPage&&!this.viewerPage.isClosed()){await this.viewerPage.close().catch(()=>{});this.viewerPage=null;}}catch(_){}let t=this.context;if(this.context=null,this.page=null,t)try{await t.close()}catch{}}get p(){return this.page||null}set p(v){this.page=v}async exportCookies(){return this.context?(await this.context.cookies().catch(()=>[])).filter(e=>/dola\.com|bytedance|byteoversea|tiktok/i.test(e.domain||"")):[]}async sessionInfo(){let e=(await this.context.cookies().catch(()=>[])).filter(o=>/dola\.com|byteoversea|tiktok/i.test(o.domain||"")),n=e.find(o=>(o.name==="sessionid"||o.name==="sessionid_ss"||o.name==="sid_tt")&&o.value&&typeof o.value==="string"&&o.value.trim().length>5),i=!!n,r=n&&n.expires>0?new Date(n.expires*1e3).toISOString():null;return{loggedIn:i,expires:r}}async isLoggedIn(t=!0){
  if(t){
    await this.p.goto(G,{waitUntil:"domcontentloaded"}).catch(()=>{});
    await E(1200);
    await this.dismissOverlays().catch(()=>{});
  }
  let curUrl=(this.p?this.p.url():"")||"";
  if(/\/(login|signin|passport)/i.test(curUrl)){
    this.log("Trang Dola chuyển hướng sang đăng nhập ("+curUrl+") — Cookie Dola đã chết / hết hạn!");
    return false;
  }
  let loginBtn=await this.findVisibleLoginBtn().catch(()=>null);
  if(loginBtn){
    this.log("Phát hiện nút Đăng nhập hiển thị trên Dola — Cookie Dola đã hết hạn hoặc bị thu hồi!");
    return false;
  }
  let avatarBtn=await this.findVisibleAvatarBtn().catch(()=>null);
  if(avatarBtn)return true;
  let domCheck=await this.p.evaluate(()=>{
    let headerLogin=document.querySelector('header button[class*="login"], button.login-btn-header-CTKsn1, [data-testid*="header-login"], button:has-text("Log in"), button:has-text("Sign in"), button:has-text("Đăng nhập")');
    if(headerLogin&&headerLogin.offsetParent!==null)return false;
    let avt=document.querySelector('img[src*="ibyteimg"], img[src*="user-avatar"], [class*="avatar"]');
    if(avt&&avt.offsetParent!==null)return true;
    let compose=document.querySelector('textarea, [contenteditable="true"]');
    if(compose&&compose.offsetParent!==null)return true;
    return null;
  }).catch(()=>null);
  if(domCheck===false)return false;
  if(domCheck===true)return true;
  let cr=await this.creditsLeft().catch(()=>null);
  if(cr!==null)return true;
  let s=await this.sessionInfo();
  return s.loggedIn;
}async setCookies(t){if(!this.context)throw new S("Browser ch\u01B0a m\u1EDF.");await this.context.clearCookies(),await this.context.addCookies(t),this.log(`\u0111\xE3 n\u1EA1p ${t.length} cookie dola.com, \u0111ang t\u1EA3i trang \u0111\u1EC3 Dola nh\u1EADn phi\xEAn`),await this.p.goto(G,{waitUntil:"domcontentloaded"}),await this.p.waitForSelector(ut,{timeout:45e3}).catch(()=>{}),await this.dismissOverlays(),await E(1500);let e=await this.sessionInfo();return e;}async screenshot(t){try{return O.default.mkdirSync(dt.default.dirname(t),{recursive:!0}),await this.p.screenshot({path:t,fullPage:!1}),t}catch{return null}}wantVisible=!1;hideTaskbar(){if(process.platform!=="win32"||process.env.DOLA_HEADLESS==="new")return;let t=this.profileDir,e=i=>setTimeout(()=>{this.wantVisible||!this.alive||Ae(t).then(n=>{n&&!this.wantVisible&&this.log(`\u0111\xE3 gi\u1EA5u ${n} c\u1EEDa s\u1ED5 tr\xECnh duy\u1EC7t kh\u1ECFi thanh t\xE1c v\u1EE5`)}).catch(()=>{})},i);e(300),e(2500)}async ensureOnDola(){if(!this.page||!this.alive||this.page.isClosed())return;let t=this.page.url();t&&t!=="about:blank"&&!t.startsWith("chrome://")||await this.page.goto(G,{waitUntil:"domcontentloaded",timeout:3e4}).catch(e=>{this.log(`kh\xF4ng m\u1EDF \u0111\u01B0\u1EE3c trang Dola trong c\u1EEDa s\u1ED5: ${e instanceof Error?e.message:e}`)})};async clickAgeConfirm(pg = this.page) {
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


async findVisibleGoogleBtn() {
  const locators = [
    this.page.locator('div.button-PgvIWh, div.btn-mKBMAM, div.clickable-lhEBND, button, div[role="button"]').filter({
      has: this.page.locator('svg path[fill="#4285F4"], svg path[fill="#EA4335"], svg path[fill="#FBBC05"], svg path[fill="#34A853"]')
    }),
    this.page.locator('[aria-label*="Google" i], [title*="Google" i]').filter({
      has: this.page.locator('svg, img')
    }),
    this.page.locator('button, div[role="button"]').filter({
      hasText: /^(Continue with Google|Sign in with Google|Đăng nhập bằng Google|Google)$/i
    }),
    this.page.locator('button:has-text("Google"), div[role="button"]:has-text("Google")')
  ];
  for (const loc of locators) {
    const count = await loc.count().catch(() => 0);
    for (let i = 0; i < count; i++) {
      const el = loc.nth(i);
      if (await el.isVisible().catch(() => false)) {
        const box = await el.boundingBox().catch(() => null);
        if (box && box.width >= 24 && box.width <= 360 && box.height >= 24 && box.height <= 120) {
          return el;
        }
      }
    }
  }
  const hasInDom = await this.page.evaluate(() => {
    const el = document.querySelector('svg path[fill="#4285F4"], svg path[fill="#EA4335"], [aria-label*="Google" i], [title*="Google" i]');
    if (!el) return false;
    let cur = el.closest('button, div[role="button"]') || el.closest('svg')?.parentElement;
    while (cur && cur !== document.body) {
      if (cur.offsetWidth >= 24 && cur.offsetHeight >= 24) return true;
      cur = cur.parentElement;
    }
    return false;
  }).catch(() => false);
  if (hasInDom) {
    return this.page.locator('svg').filter({
      has: this.page.locator('path[fill="#4285F4"], path[fill="#EA4335"]')
    }).locator('xpath=..').first();
  }
  return null;
}

async clickGoogleBtn() {
  const btn = await this.findVisibleGoogleBtn();
  if (btn && await btn.isVisible().catch(() => false)) {
    await btn.scrollIntoViewIfNeeded().catch(() => {});
    try {
      await btn.click({ timeout: 3000, force: true });
    } catch (e) {
      await btn.dispatchEvent("click").catch(() => {});
    }
    return "clicked_google_btn";
  }
  return null;
}

async loginGoogleWithCredentials(creds, onStatus = () => {}, opts = {}) {
  if (!this.context || !this.page) throw new S("Trình duyệt chưa khởi động.");
  let email = (creds.email || creds.username || "").trim();
  let password = (creds.password || "").trim();
  let twoFactor = (creds.twoFactor || "").trim();
  let recovery = (creds.recovery || creds.recoveryEmail || "").trim();

  onStatus(`Đang mở Dola để đăng nhập Google (${email})...`);
  await this.page.goto(G, { waitUntil: "domcontentloaded", timeout: 45000 }).catch(() => {});
  await this.page.waitForTimeout(2000);

  let isReallyLogged = await this.isLoggedIn(false).catch(() => false);
  let sess = await this.sessionInfo().catch(() => null);
  if (isReallyLogged && sess?.loggedIn) {
    onStatus("Đã có phiên Dola sẵn!");
    return await this.exportCookies();
  }

  let popupPage = null;
  const pageHandler = p => {
    popupPage = p;
    this.log("Bắt được cửa sổ Google OAuth: " + p.url());
  };
  this.context.on("page", pageHandler);

  const getTargetPage = () => {
    if (popupPage && !popupPage.isClosed()) return popupPage;
    for (let p of this.context.pages()) {
      if (p !== this.page && !p.isClosed()) {
        popupPage = p;
        return p;
      }
    }
    return this.page;
  };

  try {
    onStatus("Tìm và bấm nút Đăng nhập Google trên Dola...");
    let gBtn = await this.findVisibleGoogleBtn();
    if (!gBtn) {
      let lBtn = await this.findVisibleLoginBtn();
      if (lBtn) {
        await lBtn.scrollIntoViewIfNeeded().catch(() => {});
        await lBtn.click({ timeout: 2500 }).catch(async () => {
          await lBtn.dispatchEvent("click").catch(() => {});
        });
        for (let w = 0; w < 6; w++) {
          await this.page.waitForTimeout(400);
          gBtn = await this.findVisibleGoogleBtn();
          if (gBtn) break;
        }
      }
    }

    let clickedG = false;
    for (let attempt = 0; attempt < 15; attempt++) {
      let tPage = getTargetPage();
      let u = (tPage ? tPage.url() : "") || "";
      if (u.includes("accounts.google") || u.includes("google.com/signin") || u.includes("google.com/o/oauth")) {
        clickedG = true;
        break;
      }
      let cRes = await this.clickGoogleBtn();
      if (cRes) {
        for (let w = 0; w < 6; w++) {
          await this.page.waitForTimeout(500);
          let u2 = (getTargetPage() ? getTargetPage().url() : "") || "";
          if (u2.includes("accounts.google") || u2.includes("google.com/signin") || u2.includes("google.com/o/oauth")) {
            clickedG = true;
            break;
          }
        }
        if (clickedG) break;
      }
      await this.page.waitForTimeout(600);
    }

    let targetPage = getTargetPage();
    for (let w = 0; w < 12; w++) {
      targetPage = getTargetPage();
      let u = (targetPage ? targetPage.url() : "") || "";
      if (u.includes("accounts.google") || u.includes("google.com/signin")) break;
      await this.page.waitForTimeout(500);
    }

    onStatus(`Điền email Google (${email})...`);
    targetPage = getTargetPage();
    await targetPage.waitForLoadState("domcontentloaded", { timeout: 15000 }).catch(() => {});
    await targetPage.waitForTimeout(1000);

    let emailInput = targetPage.locator('input[type="email"], input#identifierId, input[name="identifier"]').first();
    let emailFound = await emailInput.isVisible({ timeout: 10000 }).catch(() => false);
    if (emailFound) {
      await emailInput.click({ delay: 60 }).catch(() => {});
      await emailInput.fill("");
      for (const char of email) {
        await emailInput.type(char, { delay: Math.floor(Math.random() * 40) + 30 });
      }
      await targetPage.waitForTimeout(300);

      onStatus("Bấm Tiếp theo (Email)...");
      let nextBtn = targetPage.locator('#identifierNext, button:has-text("Next"), button:has-text("Tiếp theo"), button:has-text("Tiếp tục")').first();
      await nextBtn.click({ timeout: 4000 }).catch(async () => {
        await emailInput.press("Enter");
      });
      await targetPage.waitForTimeout(2500);
    }

    onStatus("Điền mật khẩu Google...");
    targetPage = getTargetPage();
    let passInput = targetPage.locator('input[type="password"], input[name="Passwd"], input[name="password"]').first();
    let passFound = await passInput.isVisible({ timeout: 12000 }).catch(() => false);
    if (passFound) {
      await passInput.click({ delay: 60 }).catch(() => {});
      await passInput.fill("");
      for (const char of password) {
        await passInput.type(char, { delay: Math.floor(Math.random() * 40) + 30 });
      }
      await targetPage.waitForTimeout(300);

      onStatus("Bấm Đăng nhập (Password)...");
      let passNextBtn = targetPage.locator('#passwordNext, button:has-text("Next"), button:has-text("Tiếp theo"), button:has-text("Tiếp tục")').first();
      await passNextBtn.click({ timeout: 4000 }).catch(async () => {
        await passInput.press("Enter");
      });
      await targetPage.waitForTimeout(3500);
    }

    targetPage = getTargetPage();
    let errCheck = await targetPage.evaluate(() => {
      let el = document.querySelector('[role="alert"], #error, .Ekdcne, div[aria-live="assertive"]');
      return el ? (el.innerText || el.textContent || "").trim() : null;
    }).catch(() => null);
    if (errCheck && /wrong password|sai mật khẩu|incorrect|không đúng|disabled|vô hiệu/i.test(errCheck)) {
      throw new S(`Google báo lỗi: ${errCheck.slice(0, 150)}`);
    }

    onStatus("Kiểm tra 2FA Google...");
    targetPage = getTargetPage();
    let totpInput = targetPage.locator('input[name="totpPin"], input#totpPin, input[type="tel"]').first();
    let isTotpVisible = await totpInput.isVisible({ timeout: 2500 }).catch(() => false);
    if (isTotpVisible && twoFactor) {
      onStatus("Tự động sinh mã 2FA TOTP...");
      let totp = generateTOTP(twoFactor);
      if (totp) {
        this.log(`Tự động điền mã 2FA Google: ${totp}`);
        await totpInput.click().catch(() => {});
        await totpInput.fill(totp);
        await targetPage.waitForTimeout(300);
        let totpNext = targetPage.locator('#totpNext, button:has-text("Next"), button:has-text("Tiếp theo")').first();
        await totpNext.click({ timeout: 3500 }).catch(async () => {
          await totpInput.press("Enter");
        });
        await targetPage.waitForTimeout(3000);
      }
    }

    targetPage = getTargetPage();
    let recInput = targetPage.locator('input[name="knowledgePreregisteredEmailResponse"], input#knowledge-preregistered-email-response').first();
    if (await recInput.isVisible({ timeout: 2000 }).catch(() => false) && recovery) {
      this.log(`Tự động điền email khôi phục: ${recovery}`);
      await recInput.fill(recovery);
      let recNext = targetPage.locator('button:has-text("Next"), button:has-text("Tiếp theo")').first();
      await recNext.click({ timeout: 3000 }).catch(async () => {
        await recInput.press("Enter");
      });
      await targetPage.waitForTimeout(2500);
    }

    onStatus("Đang chờ phiên Dola được tạo...");
    let startWait = Date.now();
    let maxWaitMs = 180000;
    let cookies = [];

    while (Date.now() - startWait < maxWaitMs) {
      cookies = await this.exportCookies();
      let hasSession = cookies.some(c => (c.name === "sessionid" || c.name === "sid_tt") && c.value);
      let curUrl = (this.page ? this.page.url() : "") || "";

      let activeP = this.context.pages().filter(p => !p.isClosed());
      if (this.closed || activeP.length === 0) {
        throw new S("Cửa sổ Chrome đã bị đóng khi chưa hoàn tất đăng nhập.");
      }

      if (hasSession && (curUrl.includes("dola.com") || !curUrl.includes("google.com"))) {
        onStatus("Đã bắt được phiên Dola! Kiểm tra xác nhận độ tuổi...");
        for (let attempt = 0; attempt < 8; attempt++) {
          let confirmed = await this.clickAgeConfirm(this.page);
          if (confirmed) {
            this.log("Đã click nút Confirm xác nhận độ tuổi trên Dola");
            onStatus("Đã xác nhận độ tuổi!");
            await this.page.waitForTimeout(1000);
            cookies = await this.exportCookies();
            break;
          }
          let pop = getTargetPage();
          if (pop && !pop.isClosed() && pop !== this.page) {
            let pConfirmed = await this.clickAgeConfirm(pop);
            if (pConfirmed) {
              await this.page.waitForTimeout(1000);
              cookies = await this.exportCookies();
              break;
            }
          }
          await this.page.waitForTimeout(600);
        }
        onStatus("Đăng nhập Google thành công!");
        return cookies;
      }

      targetPage = getTargetPage();
      let promptCheck = await targetPage.evaluate(() => {
        let t = (document.body ? document.body.innerText : "").toLowerCase();
        return /check your phone|nhấn|tap yes|chọn số|number on your phone|mã xác minh|security challenge|challenge|captcha/i.test(t);
      }).catch(() => false);

      if (promptCheck) {
        onStatus("⚠️ Google yêu cầu xác nhận trên điện thoại/bảo mật — Cửa sổ Chrome đang mở để bạn thao tác tay...");
      }

      await this.page.waitForTimeout(1500);
    }

    if (cookies.some(c => (c.name === "sessionid" || c.name === "sid_tt") && c.value)) {
      await this.clickAgeConfirm(this.page);
      return cookies;
    }

    throw new S("Hết thời gian chờ phiên Dola (3 phút). Hãy kiểm tra lại tài khoản hoặc đăng nhập tay trên cửa sổ.");
  } finally {
    this.context.off("page", pageHandler);
  }
}

async loginFacebookWithCredentials(creds, onStatus = () => {}) {
  if (!this.context || !this.page) throw new S("Trình duyệt chưa khởi động.");
  let username = creds.username || creds.uid;
  let password = creds.password;
  let twoFactor = creds.twoFactor;
  onStatus(`Đang mở Facebook đăng nhập (${username})...`);

  try {
    await this.page.goto("https://www.facebook.com/login", { waitUntil: "domcontentloaded", timeout: 35000 });
  } catch (e) {
    this.log("Lỗi mở trang login FB: " + (e?.message || e));
  }
  await this.page.waitForTimeout(2000);

  try {
    let consent = this.page.locator('button[data-cookiebanner="accept_button"], button:has-text("Allow all cookies"), button:has-text("Chấp nhận tất cả")').first();
    if (await consent.isVisible({ timeout: 1500 }).catch(() => false)) {
      await consent.click().catch(() => {});
      await this.page.waitForTimeout(1000);
    }
  } catch {}

  onStatus("Điền tài khoản & mật khẩu FB...");
  let userField = this.page.locator('input[name="email"], input[id="email"]').first();
  if (!await userField.isVisible({ timeout: 5000 }).catch(() => false)) {
    userField = this.page.locator('input[type="text"]').first();
  }
  await userField.fill(username);
  await this.page.waitForTimeout(300);

  let passField = this.page.locator('input[name="pass"], input[id="pass"], input[type="password"]').first();
  await passField.fill(password);
  await this.page.waitForTimeout(300);

  onStatus("Bấm Đăng nhập Facebook...");
  let loginBtn = this.page.locator('button[name="login"], button[id="loginbutton"], button[type="submit"]').first();
  await loginBtn.click({ timeout: 5000 }).catch(async () => {
    await passField.press("Enter");
  });

  await this.page.waitForTimeout(3000);

  let errText = await this.page.evaluate(() => {
    let el = document.querySelector('[role="alert"], #error_box, ._4rbf, div[class*="login_error"]');
    return el ? (el.innerText || el.textContent || "").trim() : null;
  }).catch(() => null);
  if (errText && /incorrect|sai mật khẩu|không đúng|disabled|vô hiệu|tạm khóa|không hợp lệ/i.test(errText)) {
    throw new S(`Facebook báo lỗi: ${errText.slice(0, 150)}`);
  }

  onStatus("Kiểm tra xác thực 2FA...");
  let startWait = Date.now();
  while (Date.now() - startWait < 30000) {
    let cookies = await this.context.cookies().catch(() => []);
    let hasSession = cookies.some(c => c.name === "c_user" || c.name === "xs");
    let currentUrl = this.page.url() || "";
    if (hasSession && !currentUrl.includes("checkpoint") && !currentUrl.includes("login")) {
      break;
    }

    let codeInput = this.page.locator('input[name="approvals_code"], input[id="approvals_code"], input[placeholder*="Code"], input[placeholder*="mã"], input[name="code"]').first();
    let is2fa = await codeInput.isVisible({ timeout: 1500 }).catch(() => false);
    if (is2fa) {
      if (!twoFactor) {
        throw new S("Facebook yêu cầu 2FA nhưng tài khoản chưa có mã 2FA Secret Key.");
      }
      onStatus("Tự động tạo mã xác thực 2FA...");
      let totp = generateTOTP(twoFactor);
      if (!totp) throw new S("Khóa 2FA không hợp lệ, không thể sinh mã OTP 6 số.");
      this.log(`Tự động điền mã 2FA TOTP: ${totp}`);
      await codeInput.fill(totp);
      await this.page.waitForTimeout(400);

      let submitBtn = this.page.locator('button[name="submit[Submit Code]"], button[name="submit[Continue]"], button[id="checkpointSubmitButton"], button[type="submit"], button:has-text("Continue"), button:has-text("Tiếp tục")').first();
      await submitBtn.click({ timeout: 4000 }).catch(async () => {
        await codeInput.press("Enter");
      });
      await this.page.waitForTimeout(3000);
      continue;
    }

    let continueBtn = this.page.locator('button[name="submit[Continue]"], button[id="checkpointSubmitButton"], button:has-text("Continue"), button:has-text("Tiếp tục"), button:has-text("Không lưu")').first();
    if (await continueBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
      this.log("Bấm nút tiếp tục trên checkpoint FB...");
      await continueBtn.click({ timeout: 3000 }).catch(() => {});
      await this.page.waitForTimeout(2500);
      continue;
    }

    if (hasSession) break;
    await this.page.waitForTimeout(1000);
  }

  let finalCookies = await this.context.cookies().catch(() => []);
  let hasSession = finalCookies.some(c => c.name === "c_user" || c.name === "xs");
  if (!hasSession) {
    let curUrl = this.page.url() || "";
    if (curUrl.includes("checkpoint")) {
      throw new S("Tài khoản FB bị checkpoint bảo mật hoặc mã 2FA không chính xác.");
    }
    throw new S("Không thể lấy phiên Facebook sau khi đăng nhập. Vui lòng kiểm tra lại tài khoản/mật khẩu.");
  }
  onStatus("Đã đăng nhập Facebook thành công!");
  return finalCookies;
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

  let isReallyLogged = await this.isLoggedIn(false).catch(() => false);
  let sess = await this.sessionInfo().catch(() => null);
  if (isReallyLogged && sess?.loggedIn) {
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
      let curUrl=(this.page.url()||"");let hasSession=cookies.some(c=>c.name==="sessionid"&&c.value);sess=await this.sessionInfo().catch(()=>null);let isAuthOnPage=false;if(!curUrl.includes("facebook.com")&&curUrl.includes("dola.com")){try{isAuthOnPage=await this.page.evaluate(async()=>{try{let res=await fetch("/alice/user/launch?version_code=20800&language=en&device_platform=web&aid=495671",{method:"POST",headers:{"Content-Type":"application/json"},body:"{}"});let j=await res.json();if(j&&j.data&&j.data.extra&&j.data.extra.is_login==="1")return true;let avatar=document.querySelector('img[src*="ibyteimg"], img[src*="user-avatar"], [class*="avatar"]');let loginBtn=document.querySelector('header button[class*="login"], button.login-btn-header-CTKsn1, [data-testid*="header-login"]');return!!avatar&&!loginBtn;}catch{return false;}}).catch(()=>false);}catch{}}if((hasSession&&isAuthOnPage)||(sess?.loggedIn&&isAuthOnPage)){
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
  // await Promise.resolve(this?.showWindow?.(!0)).catch(()=>{});

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
};static WINDOW_GONE="Tr\xECnh duy\u1EC7t c\u1EE7a t\xE0i kho\u1EA3n n\xE0y \u0111\xE3 \u0111\xF3ng (app t\u1EF1 \u0111\xF3ng khi r\u1EA3nh 3 ph\xFAt, ho\u1EB7c n\xF3 b\u1ECB t\u1EAFt). B\u1EA5m \xABKi\u1EC3m tra\xBB ho\u1EB7c t\u1EA1o video r\u1ED3i b\u1EA5m l\u1EA1i n\xFAt n\xE0y.";async relaunchIfClosed(targetUrl=null){
  if(this.alive&&this.page&&!this.page.isClosed()){
    return this.page;
  }
  this.log("Trình duyệt đã bị đóng — đang tự động mở lại kết nối...");
  try{if(this.context)await this.context.close().catch(()=>{});}catch{}
  this.closed=!1;
  await this.start();
  let dest=targetUrl||this.conversationUrl||G;
  if(dest&&this.page&&!this.page.isClosed()){
    await this.page.goto(dest,{waitUntil:"domcontentloaded",timeout:45000}).catch(()=>{});
  }
  return this.page;
}
async showWindow(t=!0){
  if(!this.context)return !0;
  let targetP=(this.page&&!this.page.isClosed())?this.page:null;
  if(!targetP){
    let pages=this.context.pages().filter(p=>!p.isClosed());
    targetP=pages[0]||null;
  }
  if(!this.alive||!targetP||targetP.isClosed())return;
  if(process.env.DOLA_HEADLESS==="new")return;
  this.wantVisible=t;
  try{
    (async()=>{
      try{
        let e=await this.context.newCDPSession(targetP),{windowId:i}=await e.send("Browser.getWindowForTarget");
        await e.send("Browser.setWindowBounds",t?{windowId:i,bounds:{left:80,top:60,width:1280,height:900,windowState:"normal"}}:{windowId:i,bounds:{left:-32e3,top:-32e3,width:1280,height:960,windowState:"normal"}});
        t&&await e.send("Page.bringToFront").catch(()=>{});
        await e.detach().catch(()=>{});
      }catch{}
    })();
  }catch{}
  this.log(t?"đã kéo cửa sổ trình duyệt ra giữa màn hình":"đã giấu cửa sổ trình duyệt lại");
  t?Re(this.profileDir).catch(()=>{}) : this.hideTaskbar();
  return !0;
}async loginInteractive(t=600){if(this.headless)throw new S("\u0110\u0103ng nh\u1EADp c\u1EA7n c\u1EEDa s\u1ED5 hi\u1EC7n, kh\xF4ng ch\u1EA1y \u0111\u01B0\u1EE3c headless.");await this.p.goto(G,{waitUntil:"domcontentloaded"}),this.log("\u0110\u0103ng nh\u1EADp trong c\u1EEDa s\u1ED5 tr\xECnh duy\u1EC7t v\u1EEBa m\u1EDF...");let e=Date.now()+t*1e3;for(;Date.now()<e;){if(await this.isLoggedIn(!1))return this.log(`\u0110\xE3 \u0111\u0103ng nh\u1EADp. Phi\xEAn \u0111\u01B0\u1EE3c l\u01B0u v\xE0o ${this.profileDir}`),await this.dismissOverlays(),!0;await E(3e3)}return!1}async newChat(){try{let nb=this.p.locator('a[href="/chat"], a[href^="/chat?"], button:has-text("New Chat"), button:has-text("Đoạn chat mới"), button:has-text("Cuộc trò chuyện mới"), [data-testid="new-chat-button"]').first();if(await nb.isVisible().catch(()=>false)){await nb.click().catch(()=>{});await E(1000);}}catch{}let curUrl=(this.p?this.p.url():"")||"";let hasOldContent=await this.p.evaluate(()=>{return document.querySelectorAll('video, [class*="block-video"], [data-role="assistant"], [class*="bubble"]').length>0;}).catch(()=>false);if(hasOldContent||!curUrl.includes("dola.com/chat")||/\/chat\/\d+/.test(curUrl)){await this.p.goto(G,{waitUntil:"domcontentloaded"});await E(1500);try{let nb2=this.p.locator('a[href="/chat"], button:has-text("New Chat"), button:has-text("Đoạn chat mới"), button:has-text("Cuộc trò chuyện mới")').first();if(await nb2.isVisible().catch(()=>false)){await nb2.click().catch(()=>{});await E(800);}}catch{}}await this.p.waitForSelector(ut,{timeout:45e3});await this.p.locator(ut).last().fill("").catch(()=>{});await E(500);}async installHook(t,e,i,n){s.hookSource===null&&(s.hookSource=`f=>{const t=window.__dolaHook||(window.__dolaHook={params:null,sent:0,seen:0,lastParam:null,lastImages:null,error:null,installed:!1,videos:[],scanned:0,origParam:null,msgKeys:null,lastStatus:null,respError:null,toastError:null});if(t.params=f,t.sent=0,t.seen=0,t.lastParam=null,t.origParam=null,t.msgKeys=null,t.error=null,t.respError=null,t.toastError=null,t.lastStatus=null,t.videos=[],t.scanned=0,t.installed)return"reused";const m=window.fetch;t.installed=!0;try{if(!window.__dolaToastObs){window.__dolaToastObs=new MutationObserver(M=>{for(let mr of M)for(let nd of mr.addedNodes)if(nd.nodeType===1){let tx=(nd.innerText||"").trim();if(tx&&tx.length<300){let c=String(nd.className||"").toLowerCase();if(/toast|alert|notification|notice|feedback|modal|popover|message|portal|tip|snackbar|banner/i.test(c)||nd.getAttribute("role")==="alert")if(/error|fail|wrong|limit|banned|quá|lỗi|không thể|thất bại|vi phạm|something went wrong|try again|chặn|hết lượt|frequent|thường xuyên|spam|slow down|busy|bận|nhanh|restricted|hạn chế/i.test(tx))t.toastError=tx}}});window.__dolaToastObs.observe(document.body,{childList:!0,subtree:!0})}}catch{}const u=/https?:\\/\\/[^"'\\s]+mime_type=video_mp4[^"'\\s]*/g,p="\\\\";
function toClean(x){return String(x||"").replace(/([?&])lr=watermarked\b/gi,"$1lr=unwatermarked").replace(/([?&])logo_type=(?:watermarked|wm)\b/gi,"$1logo_type=unwatermarked")}
function addVid(x){if(!x||typeof x!="string"||x.includes("ibyteimg")||x.includes(".png")||x.includes(".jpg")||x.includes(".webp")||x.includes("image-sign"))return;let n=toClean(x.split(p+"u0026").join("&").split(p+"/").join("/"));if(t.videos.indexOf(n)===-1){(n.includes("unwatermarked")||n.includes("lr=unwatermarked"))?t.videos.unshift(n):t.videos.push(n)}}
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
    else{let c=dec(raw);if(c&&(c.includes("unwatermarked")||c.includes(".mp4")||c.includes("mime_type=video_mp4")||c.includes("/video/tos/")||c.includes("tos-")||c.includes("byteoversea")||c.includes("tiktokcdn")))addVid(c)}
  }
  for(u.lastIndex=0;(a=u.exec(s))!==null;)addVid(a[0]);
}
t.scanForUrls=g;function h(s){try{const a=(s.headers.get("content-type")||"").toLowerCase();if(!/json|text|event-stream/.test(a))return;const n=s.clone().body;if(!n||!n.getReader)return;t.scanned+=1;const d=n.getReader(),y=new TextDecoder;let o="";const l=()=>{d.read().then(e=>{if(!e.done){o+=y.decode(e.value,{stream:!0});g(o);if(!t.respError){let em=o.match(/"(?:error_code|code)"[ \t]*:[ \t]*([1-9]\d*)/);if(em&&em[1]!=="0"){let msg=o.match(/"(?:message|msg|err_msg|error)"[ \t]*:[ \t]*"([^"]+)"/i);t.respError="Dola báo lỗi: "+(msg?msg[1]:("mã lỗi "+em[1]));}}
try{let bm=[...o.matchAll(/"brief"\s*:\s*"([^"]+)"/g)];if(bm.length){let b=bm[bm.length-1][1];try{b=JSON.parse('"'+b+'"');}catch{}if(b&&b.trim().length>0)t.dolaReply=b.trim();}if(!t.dolaReply){let tb=[...o.matchAll(/"text_block"\s*:\s*\{\s*"text"\s*:\s*"([^"]+)"/g)];if(tb.length){let parts=[];for(let m of tb){let tx=m[1];try{tx=JSON.parse('"'+tx+'"');}catch{}if(tx&&!parts.includes(tx))parts.push(tx);}if(parts.length){let comb=parts.join("").trim();if(comb.length>(t.dolaReply||"").length)t.dolaReply=comb;}}}}catch{}o.length>262144&&(o=o.slice(-8192));l();}}).catch(()=>{})};l()}catch{}}return window.fetch=function(s,a){let n="";try{n=typeof s=="string"?s:s&&s.url||""}catch{}const d=String(a&&a.method||s&&s.method||"GET").toUpperCase(),y=/\\/(chat\\/completion|message|conversation|history|poll|chain|samantha|alice)/i.test(String(n));if(!(d==="POST"&&/\\/(chat\\/completion|samantha\\/chat|alice\\/message|chat\\/async)/i.test(String(n))&&a&&typeof a.body=="string")){const e=m.apply(this,arguments);return!y||!e||typeof e.then!="function"?e:e.then(r=>(h(r),r))}let l=a;try{const e=JSON.parse(a.body),r=e&&e.chat_ability;let isVideoAbility=r&&(r.ability_type===50||r.ability_type===17||r.ability_type==="50"||r.ability_type==="17"||(typeof r.ability_param=="string"&&(r.ability_param.includes("duration")||r.ability_param.includes("seedance")||r.ability_param.includes("model"))));if(isVideoAbility&&typeof r.ability_param=="string"){t.seen+=1,t.origParam=r.ability_param;try{t.msgKeys=Object.keys(e).concat((e.chat_ability?Object.keys(e.chat_ability):[]).map(function(c){return"chat_ability."+c}))}catch{t.msgKeys=null}const i=JSON.parse(r.ability_param);t.params.model&&(i.model=t.params.model),t.params.duration&&(i.duration=t.params.duration);if(t.params.ratio){i.ratio=t.params.ratio;i.aspect_ratio=t.params.ratio;}r.ability_param=JSON.stringify(i);t.lastParam=r.ability_param;if(t.params.ratio&&Array.isArray(e.messages)){for(let msg of e.messages){if(Array.isArray(msg.content_block)){for(let blk of msg.content_block){if(blk.content&&blk.content.text_block&&typeof blk.content.text_block.text==="string"){let tx=blk.content.text_block.text;if(!tx.includes(t.params.ratio)){blk.content.text_block.text=tx+", tỉ lệ "+t.params.ratio;}}}}}}try{const b=JSON.stringify(e.messages||[]).match(/tos-[a-z0-9-]+\\/[a-f0-9]{8,}/g)||[];t.lastImages=Array.from(new Set(b)).slice(0,5)}catch{t.lastImages=null}if(t.sent+=1,l=Object.assign({},a,{body:JSON.stringify(e)}),t.params.dryRun)return Promise.resolve(new Response('{"dry_run":true}',{status:200,headers:{"Content-Type":"application/json"}}))}else{t.sent+=1,t.seen+=1}}catch(e){return t.error=String(e),m.apply(this,arguments)}return m.call(this,s,l).then(e=>{t.lastStatus=e.status;if(!e.ok){t.respError=e.status===429?"Dola báo quá tải hoặc bị giới hạn tần suất (HTTP 429)":e.status===401?"Văng acc do chưa gắn proxy":e.status===403?"Dola từ chối truy cập hoặc yêu cầu xác minh Captcha (HTTP 403)":("Máy chủ Dola báo lỗi HTTP "+e.status);}return h(e),e;}).catch(err=>{t.respError="Lỗi kết nối khi gửi tới Dola: "+(err?.message||String(err));throw err;})},"installed"}`);let r=JSON.stringify({model:t,duration:e,ratio:i,dryRun:n}),o=await this.p.evaluate(`(${s.hookSource}
)(${r})`);this.log(`hook: ${o} (model=${t} duration=${e} ratio=${i||"default"})`)}async videoModeOn(){return await this.p.evaluate(({Gi,qi})=>{if(document.querySelector(Gi)||document.querySelector('[data-input-engine-actionbar-control-key*="video"]')||document.querySelector('[data-input-engine-actionbar-control-key="video-model"]'))return true;let phs=[...document.querySelectorAll("[data-placeholder],[placeholder]")].map(el=>(el.getAttribute("data-placeholder")||el.getAttribute("placeholder")||"").toLowerCase());if(phs.some(p=>p.includes("describe the actions in the video")||p.includes("mô tả các hành động trong video")||p.includes("hành động trong video")||(p.includes("video")&&!p.includes("nhắn tin")&&!p.includes("message"))))return true;let vb=[...document.querySelectorAll('button.skill-bar-button, [data-skill-id*="skill_bar_button"]')].find(el=>{let t=(el.textContent||"").toLowerCase();return t.includes("tạo video")||t.includes("create video")||t.includes("video");});if(vb&&(vb.getAttribute("data-checked")==="true"||vb.getAttribute("aria-pressed")==="true"||vb.classList.contains("active")||vb.classList.contains("selected")||vb.getAttribute("data-state")==="active"))return true;return false;},{Gi,qi}).catch(()=>!1)}videoChip(){return this.p.locator(Vi).first()}async dismissOverlays(){try{let t=this.p.getByText(/^\s*(ok|accept|accept all|got it|đồng ý)\s*$/i).first();await t.isVisible().catch(()=>!1)&&(await t.click({timeout:2000}).catch(()=>{}),await E(300));}catch{}try{await this.p.evaluate(()=>{let btns=[...document.querySelectorAll("button")].filter(b=>/^(ok|đồng ý|accept|got it)$/i.test((b.textContent||"").trim()));btns.forEach(b=>{try{b.click()}catch{}})}).catch(()=>{});}catch{}await this.clickAgeConfirm().catch(()=>{});}async chanDoan(){try{let t=await this.p.evaluate(()=>({w:window.innerWidth,h:window.innerHeight,url:location.href,composer:!!document.querySelector("[data-placeholder]"),skills:[...document.querySelectorAll("[data-skill-id], button.skill-bar-button")].map(e=>e.getAttribute("data-skill-id")||e.innerText),chu:[...new Set([...document.querySelectorAll("div,span,button")].filter(e=>e.children.length===0).map(e=>(e.textContent||"").trim()).filter(e=>e.length>0&&e.length<22))].slice(0,22)}));return`viewport ${t.w}x${t.h}, c\xF3 composer=${t.composer}, url=${t.url}, skill tr\xEAn trang: ${JSON.stringify(t.skills)}, ch\u1EEF tr\xEAn trang: ${JSON.stringify(t.chu)}`}catch{return"kh\xF4ng \u0111\u1ECDc \u0111\u01B0\u1EE3c tr\u1EA1ng th\xE1i trang"}}async enableVideoMode(t=20){if(await this.videoModeOn()){this.log("chế độ video đã được bật sẵn");return;}await this.dismissOverlays();for(let e=1;e<=2;e++){let i=this.p.locator('button.skill-bar-button:has-text("Tạo video"), button.skill-bar-button:has-text("Create Videos"), [data-skill-id="skill_bar_button_17"], button:has-text("Tạo video"), button:has-text("Create Videos")').first();if(!await i.isVisible().catch(()=>!1)){let r=this.p.locator('[data-slot="dropdown-menu-trigger"]').last();await r.isVisible().catch(()=>!1)&&(await r.click().catch(()=>{}),await E(500))}let n=!1;try{await i.click({timeout:3000}),n=!0}catch{try{await i.click({timeout:2000,force:!0}),n=!0}catch{n=await this.p.evaluate(()=>{let b=[...document.querySelectorAll('button.skill-bar-button, button')].find(el=>{let tx=(el.textContent||"").trim();return tx==="Tạo video"||tx==="Create Videos"||tx.includes("Tạo video")||tx.includes("Create Videos")});if(b){b.click();return true}return false}).catch(()=>!1)}}if(n){let r=Date.now()+t*1e3;for(;Date.now()<r;){await E(500);if(await this.videoModeOn())return;}}if(e===1){this.log("chưa bật được chế độ video, đợi thêm hoặc kiểm tra lại...");await E(1500);await this.dismissOverlays();}}this.log("Lưu ý: Không tìm thấy nút Tạo video hoặc giao diện đã ở chế độ tạo video.");}async attachImages(t){for(let n of t)if(!O.default.existsSync(n))throw new S(`Kh\xF4ng t\xECm th\u1EA5y \u1EA3nh: ${n}`);let e=await this.p.evaluate(()=>document.querySelectorAll("img").length);await this.p.setInputFiles("input[type=file]",t);let i=Date.now()+9e4;for(;Date.now()<i;)if(await E(1e3),await this.p.evaluate(()=>document.querySelectorAll("img").length)>e){await E(2e3),this.log(`\u0111\xE3 \u0111\xEDnh ${t.length} \u1EA3nh`);return}throw new S("\u1EA2nh kh\xF4ng l\xEAn \u0111\u01B0\u1EE3c composer sau 90 gi\xE2y.")}async fillComposer(t){let e=this.p.locator(ut).last();await e.click();let i=t.split(`
`);for(let r=0;r<i.length;r++)r&&await this.p.keyboard.press("Shift+Enter"),i[r]&&await this.p.keyboard.insertText(i[r]);await E(300);let n=(await e.innerText()).trim();if(n.length<t.trim().length*.9)throw new S(`Composer ch\u1EC9 nh\u1EADn ${n.length}/${t.trim().length} k\xFD t\u1EF1 - prompt b\u1ECB c\u1EAFt, kh\xF4ng g\u1EEDi.`)}async creditsLeft(){try{if(!this.page||this.page.isClosed())return null;let text=await this.page.innerText("body",{timeout:2500}).catch(()=>"");let t=(text||"").match(Xi);return t?Number(t[1]):null}catch{return null}}async setRatio(r){if(!r)return;try{let btn=this.p.locator('[data-input-engine-actionbar-control-key="video-ratio"]').first();if(await btn.isVisible({timeout:3000}).catch(()=>false)){let curText=(await btn.innerText().catch(()=>""))||"";if(curText.includes(r))return;await btn.click({timeout:2000}).catch(()=>{});await E(400);let target=this.p.locator(`[role="menuitem"]:has-text("${r}"), [data-slot="dropdown-menu-item"]:has-text("${r}")`).first();if(await target.isVisible({timeout:2000}).catch(()=>false)){await target.click({timeout:2000}).catch(()=>{});await E(300);this.log(`Đã chọn tỷ lệ ${r} trên thanh công cụ Dola`);}else{await this.p.evaluate((ratioVal)=>{let items=[...document.querySelectorAll('[role="menuitem"], [data-slot="dropdown-menu-item"], div')];let found=items.find(el=>(el.innerText||el.textContent||"").trim()===ratioVal);if(found)found.click();},r).catch(()=>{});}}}catch(err){this.log(`Cảnh báo chọn tỷ lệ: ${err?.message||err}`);}}async generate(t){let e=nn(t.model??"2.5"),i=t.duration??30,n=t.ratio??null;if(n&&!gt.includes(n))throw new S(`ratio ph\u1EA3i thu\u1ED9c ${gt.join(" ")}`);let r={prompt:t.prompt,model:e,duration:i,ratio:n,path:null,video_seconds:null,credits_left:null,conversation_url:null,error:null,dola_response:null};this.onStage("compose","\u0110ang m\u1EDF trang t\u1EA1o video c\u1EE7a Dola",22),await this.newChat(),await this.installHook(e,i,n,!!t.dryRun),t.mode!=="pro"&&(this.onStage("compose","\u0110ang b\u1EADt ch\u1EBF \u0111\u1ED9 t\u1EA1o video",26),await this.enableVideoMode()),n&&(await this.setRatio(n)),t.images&&t.images.length&&(this.onStage("compose",`\u0110ang \u0111\xEDnh ${t.images.length} \u1EA3nh tham chi\u1EBFu`,30),await this.attachImages(t.images)),this.onStage("sending","\u0110ang g\u1EEDi y\xEAu c\u1EA7u l\xEAn Dola",35),await this.p.evaluate(()=>{if(window.__dolaHook){window.__dolaHook.dolaReply=null;window.__dolaHook.respError=null;window.__dolaHook.toastError=null;window.__dolaHook.sent=0;window.__dolaHook.videos=[];}}).catch(()=>{});await this.fillComposer(t.prompt),await E(400);let o=await this.p.evaluate(()=>[...document.querySelectorAll("video")].map(c=>c.currentSrc||c.src||"").filter(Boolean)),a=t.prompt.split(`
`).find(c=>c.trim())?.trim().slice(0,60)??"";
const abortController = new AbortController();
const errorBus = new (require('events').EventEmitter)();
let abortTriggered = false;
const triggerAbort = (err) => {
  if (abortTriggered) return;
  abortTriggered = true;
  const errObj = err instanceof Error ? err : new S(String(err));
  b.warn(this.displayName || 'worker', '[ErrorBus] Bắt lỗi Dola tức thời: ' + errObj.message + ' -> Thoát wait ngay lập tức (< 2s)');
  abortController.abort(errObj);
};
errorBus.on('error', triggerAbort);

let cdpResHandler=async(res)=>{
  try{
    let st = res.status();
    let url = res.url() || '';
    if(st === 429){
      errorBus.emit('error', new S('⚠️ Dola báo lỗi Spam / HTTP 429 Too Many Requests: Thao tác quá thường xuyên, vui lòng thử lại sau.'));
      return;
    }
    if(st === 403){
      errorBus.emit('error', new S('⚠️ Dola báo lỗi HTTP 403 Forbidden: Không có quyền truy cập hoặc tài khoản bị giới hạn.'));
      return;
    }
    if(st >= 500 && st < 600 && url.includes('dola.com')){
      errorBus.emit('error', new S('⚠️ Máy chủ Dola phản hồi lỗi HTTP ' + st + ' (Internal Server Error).'));
      return;
    }
    let ct=(res.headers()["content-type"]||"").toLowerCase();
    if((ct.startsWith('video/') || isRealVideoUrl(url)) && !/ibyteimg|flow-image-sign|\.(?:png|jpe?g|webp)/i.test(url)){
      if(!url.includes('placeholder') && !url.includes('preview_low')){
        await this.p.evaluate((u)=>{
          if(window.__dolaHook){
            window.__dolaHook.videos = window.__dolaHook.videos || [];
            if(!window.__dolaHook.videos.includes(u)){
              window.__dolaHook.videos.unshift(u);
            }
          }
        }, url).catch(()=>{});
      }
    }
    // BỎ QUA HOÀN TOÀN các tài nguyên tĩnh CSS, JS, Fonts, Ảnh để không bị dính chữ Copyright trong file thư viện
    if(/\.(?:css|js|woff2?|png|jpe?g|webp|gif|svg|ico)(?:\?.*)?$/i.test(url)) return;
    // BỎ QUA các API lịch sử cũ / batch_get cuộc trò chuyện cũ để không bị nhận diện nhầm thông báo từ các task trước
    if(/conversation\/(?:list|batch_get)|im\/conversation|user\/(?:info|me)|feed\/|history/i.test(url)) return;

    if(/(?:application\/json|application\/x-ndjson|text\/event-stream)/i.test(ct)){
      let txt=await res.text().catch(()=>"");
      if(txt){
        // KIỂM TRA TỪ CHỐI BẢN QUYỀN / POLICY / LỖI DỰNG TỨC THÌ (Áp dụng cả khi đang tạo video):
        if(/for copyright protection|can(?:'|’)?t\s+show\s+you\s+the\s+generated\s+video|copyrighted\s+or\s+policy-violating\s+content|policy-violating\s+content|no\s+credits\s+were\s+used\s+for\s+this\s+video/i.test(txt)){
          errorBus.emit('error', new S('⚠️ Vi phạm bản quyền: Dola từ chối trả video do nội dung dính bản quyền hoặc chính sách bảo vệ hình ảnh (For copyright protection / policy-violating content). Hãy đổi prompt hoặc ảnh khác.'));
          return;
        }
        if(/only supports generating videos featuring yourself/i.test(txt)){
          errorBus.emit('error', new S('⚠️ Dola từ chối: Chỉ hỗ trợ tạo video khuôn mặt của chính bạn (Only supports generating videos featuring yourself).'));
          return;
        }
        if(/(?:something\s+went\s+wrong|please\s+try\s+again|could\s*(?:not|n(?:'|’)?t)\s+(?:\w+\s+)?(?:be\s+)?generate[ds]?|can(?:not|\s+not|n(?:'|’)?t)\s+(?:\w+\s+)?(?:be\s+)?generate[ds]?|unable\s+to\s+generate|failed\s+to\s+generate|generation\s+failed|tạo\s+video\s+thất\s+bại|không\s+thể\s+tạo\s+video|có\s+lỗi\s+xảy\s+ra|could\s+not\s+process|không\s+thể\s+xử\s+lý)/i.test(txt)){
          let m = txt.match(/[^\n.!?]*(?:something\s+went\s+wrong|could\s*(?:not|n(?:'|’)?t)\s+(?:\w+\s+)?(?:be\s+)?generate[ds]?|can(?:not|\s+not|n(?:'|’)?t)\s+(?:\w+\s+)?(?:be\s+)?generate[ds]?|unable\s+to\s+generate|failed\s+to\s+generate|generation\s+failed|tạo\s+video\s+thất\s+bại|không\s+thể\s+tạo\s+video|có\s+lỗi\s+xảy\s+ra|could\s+not\s+process|không\s+thể\s+xử\s+lý)[^\n.!?]*/i);
          let errMsg = m ? m[0].trim() : "Something went wrong. Please try again.";
          errorBus.emit('error', new S(`⚠️ Dola báo lỗi khi dựng: ${errMsg} (Chưa trừ credit — Dola không tính credit cho video hỏng, có thể chạy lại)`));
          return;
        }

        let isGeneratingDola = ji.test(txt);
        // NẾU ĐANG TẠO VIDEO THÌ TUYỆT ĐỐI KHÔNG EMIT LỖI ĐỘ DÀI HAY CONFIRM
        if(!isGeneratingDola){
          if(/reached the daily limit for video generation|reached (?:the\s+)?daily limit/i.test(txt)){
            errorBus.emit('error', new S('⚠️ Dola báo hết lượt trong ngày: Tài khoản này đã đạt giới hạn tạo video hôm nay (Daily limit). Nick cần nghỉ tới sáng mai.'));
            return;
          }
          if(/(?:durations?\s+from\s+\d+\s+to\s+\d+|nearest supported duration of \d+|chỉ\s+hỗ\s+trợ\s+từ\s+\d+\s+đến\s+\d+\s+giây|supports durations from)/i.test(txt)){
            let durMatch = txt.match(/(?:to|of|\b)\s*(\d+)\s*(?:seconds?|giây)/i);
            let durVal = durMatch ? durMatch[1] : "15";
            errorBus.emit('error', new S(`⚠️ Dola từ chối: Chỉ nhận video 4-${durVal}s cho prompt này — chuẩn đoán: lỗi Prompt/Độ dài, tài khoản bình thường chưa trừ credit.`));
            return;
          }
          if(/(?:do you want me to proceed with a \d+-second|do you want me to proceed|which style would you like|please\s+(?:choose|select)\s+(?:one|an\s+option)|confirm the duration)/i.test(txt)){
            errorBus.emit('error', new S(`⚠️ Dola đang chờ xác nhận: «Dola hỏi xác nhận phương án/độ dài». Đã dừng ngay (chưa trừ credit). Hãy chọn thời lượng 15s hoặc chỉnh lại prompt.`));
            return;
          }
        }
        if(/fallback_api|main_url|play_url|key_seed|video_url|video_mp4|mime_type=video_mp4|creation/i.test(txt)){
          await this.p.evaluate((s)=>{if(window.__dolaHook){window.__dolaHook?.scanForUrls?.(s);}},txt).catch(()=>{});
        }
        if(url.includes("/chat/completion")||url.includes("/im/chain/")){
          try{
            let j=JSON.parse(txt);
            let replyTxt=j?.data?.reply_message||j?.reply_message||j?.message||j?.content||"";
            if(replyTxt&&window.__dolaHook){
              await this.p.evaluate((m)=>{if(window.__dolaHook)window.__dolaHook.dolaReply=m;},replyTxt).catch(()=>{});
            }
          }catch{}
        }
      }
    }
  }catch{}
};
this.p.on("response",cdpResHandler);
let alreadySent=false;let triggerSend=async()=>{if(alreadySent)return false;alreadySent=true;let clicked=await this.p.evaluate(()=>{let sendBtn=document.querySelector('button[data-testid*="send"], button[aria-label*="send" i], button[aria-label*="gửi" i], button.send-btn, button[class*="send"]');if(sendBtn&&!sendBtn.disabled&&sendBtn.getAttribute("aria-disabled")!=="true"){sendBtn.click();return true;}let btns=[...document.querySelectorAll('button:not([disabled])')];let submitBtn=btns.reverse().find(b=>{let aria=(b.getAttribute("aria-label")||"").toLowerCase();let title=(b.getAttribute("title")||"").toLowerCase();if(aria.includes("send")||aria.includes("gửi")||title.includes("send")||title.includes("gửi"))return true;let svg=b.querySelector("svg");if(svg&&b.closest('[class*="input"], [class*="composer"], [class*="chat-input"], form, footer')){let rect=b.getBoundingClientRect();return rect.width>20&&rect.height>20&&rect.right>window.innerWidth*0.4;}return false;});if(submitBtn&&!submitBtn.disabled&&submitBtn.getAttribute("aria-disabled")!=="true"){submitBtn.click();return true;}return false;}).catch(()=>false);if(!clicked){await this.p.locator(ut).last().press("Enter").catch(()=>{});}return true;};await triggerSend();let hookSentOk=await this.p.waitForFunction(({utSel,snippet})=>{let hook=window.__dolaHook;if(hook&&(hook.sent>0||hook.dolaReply||hook.conversationId||hook.respError))return true;let comp=document.querySelector(utSel);if(comp&&(!comp.innerText||comp.innerText.trim().length===0))return true;if(snippet&&document.body&&document.body.innerText.includes(snippet))return true;if(/\/chat\/\d+/.test(location.href))return true;return false;},{utSel:ut,snippet:a},{timeout:18000}).catch(()=>false);if(!hookSentOk){let finalCheck=await this.p.evaluate(()=>window.__dolaHook&&window.__dolaHook.sent>0).catch(()=>false);if(!finalCheck){return r.error="Không bắt được request tạo video từ Dola sau 18 giây. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại.",r}}await E(1200);let hk=await this.p.evaluate(()=>{let c=window.__dolaHook||{};return c.respError||c.toastError||null}).catch(()=>null);if(hk){if(/401|phiên đăng nhập|văng acc|chưa gắn proxy/i.test(hk))hk="Văng acc do chưa gắn proxy";return this.log(`Dola báo lỗi ngay sau khi gửi: ${hk}`),r.error=hk,r;}let si0=await this.sessionInfo().catch(()=>null);if(si0&&!si0.loggedIn)return this.log("Văng acc do chưa gắn proxy ngay sau khi gửi"),r.error="Văng acc do chưa gắn proxy",r;let convUrl=this.p.url();for(let w=0;w<10;w++){let u=this.p.url();if(u&&/\/chat\/\d+/.test(u)){convUrl=u;break;}let cid=await this.p.evaluate(()=>window.__dolaHook?.conversationId).catch(()=>null);if(cid){convUrl=`https://dola.com/chat/${cid}?channel=g`;break;}await E(500);}r.conversation_url=convUrl;this.log(`Đoạn chat gắn với task này: ${r.conversation_url}`);t.onSent?.(r.conversation_url);this.onStage("sent","Dola đã nhận yêu cầu, đang xử lý",40);
try{for(let attempt=0;attempt<12;attempt++){let initReply=await this.p.evaluate(({key:x})=>{let c=window.__dolaHook||{};if(c.dolaReply&&c.dolaReply.trim().length>0)return c.dolaReply.trim();let f=null;if(x){let D=[...document.querySelectorAll("div,p,span,section,article")].filter(at=>at.innerText&&at.innerText.includes(x));D.length&&(f=D.reduce((at,ce)=>at.innerText.length<=ce.innerText.length?at:ce));}let botRows=[...document.querySelectorAll('.v_list_row, [data-target-id="message-box-target-id"], [data-message-id]')].filter(r=>r.querySelector('[data-foundation-type="receive-message-action-bar"]'));if(f&&botRows.length>0){let afterRows=botRows.filter(r=>!f.contains(r)&&(f.compareDocumentPosition(r)&Node.DOCUMENT_POSITION_FOLLOWING));if(afterRows.length>0)botRows=afterRows;}if(botRows.length>0){let lastBotRow=botRows[botRows.length-1];let textEl=lastBotRow.querySelector('.container-enLQFx, .container-fBOrXO, .md-box-root, [data-container-type="block-v2"] [data-plugin-identifier="block_type:10000"], [data-container-type="block-v2"]');if(textEl){let t=(textEl.innerText||textEl.textContent||"").trim();if(t&&t.length>0)return t;}}let textEls=[...document.querySelectorAll('.container-enLQFx, [data-container-type="block-v2"] [data-plugin-identifier="block_type:10000"], .md-box-root')];if(f&&textEls.length>0){let afterEls=textEls.filter(el=>!f.contains(el)&&(f.compareDocumentPosition(el)&Node.DOCUMENT_POSITION_FOLLOWING));if(afterEls.length>0)textEls=afterEls;}if(textEls.length>0){let lastEl=textEls[textEls.length-1];let t=(lastEl.innerText||lastEl.textContent||"").trim();if(t&&t.length>0)return t;}let pEls=[...document.querySelectorAll('p,[class*="prose"] p')].filter(el=>!f||(f.compareDocumentPosition(el)&Node.DOCUMENT_POSITION_FOLLOWING));let txts=pEls.map(el=>(el.innerText||"").trim()).filter(Boolean);return txts.length?txts.join("\n"):(c.respError||null);},{key:a}).catch(()=>null);if(initReply){r.dola_response=initReply;t.onReply?.(initReply);this.log(`Phản hồi từ Dola: "${initReply.slice(0, 100)}..."`);let checkInit=Yi(initReply);
if(checkInit.accepted){
  this.log(`Dola đã nhận yêu cầu tạo video (initReply): dự kiến ${checkInit.clampSeconds||15}s ${checkInit.readyMinutes?('trong '+checkInit.readyMinutes+' phút'):''}`);
  break;
}
if(checkInit.refusal){
  this.log(`Dola từ chối ngay (initReply): ${checkInit.refusal}`);
  r.error=checkInit.refusal;
  return r;
}
let isAlreadyGeneratingInit=/\b(?:video|it)\s+will\s+be\s+generated\b|\bbe\s+ready\s+in\s+\d+\s+minutes?\b|\bsend\s+it\s+to\s+you\s+when\s+it(?:'|’)?s\s+done\b|generating the maximum|I'll start by generating|I'll generate|seedance\s+2\.5\s+model|dreamina|will\s+use\s+\d+\s+credits?|sẽ\s+được\s+tạo\s+bằng|sẵn\s+sàng\s+trong\s+\d+\s+phút|gửi\s+(?:nó\s+)?cho\s+bạn\s+khi\s+(?:xong|hoàn\s+thành)|đang\s+tạo\s+video|đang\s+dựng\s+video|tôi\s+sẽ\s+bắt\s+đầu/i.test(initReply);
let isAskingInit=!isAlreadyGeneratingInit&&(/(?:vui\s+lòng\s+chọn\s+(?:một\s+)?(?:phương\s+án|tùy\s+chọn|kiểu|phong\s+cách)|bạn\s+muốn\s+chọn\s+(?:kiểu|phong\s+cách|phương\s+án)|hãy\s+chọn\s+(?:một\s+)?(?:trong\s+số|phương\s+án|kiểu)\b|chỉ\s+cần\s+trả\s+lời\s+[A-D]\b|trả\s+lời\s+(?:với\s+)?[A-D]\b|bạn\s+muốn\s+kiểu\s+nào\b|choose\s+(?:one\s+of\s+the\s+following|an\s+option|one\s+option|a\s+style)\b|which\s+style\s+would\s+you\s+like|please\s+(?:choose|select)\s+(?:one|an\s+option)|reply\s+with\s+[A-D]\b|confirm\s+(?:if\s+)?(?:you(?:'|’)?d\s+like|to\s+proceed)|tell\s+me\s+the\s+exact\s+duration|let\s+me\s+confirm|adjust\s+to\s+\d+[\s–-]+\d+\s+seconds?|confirm\s+the\s+duration)/i.test(initReply));
if(isAskingInit){
  let snippet=initReply.split('\n').map(l=>l.trim()).filter(Boolean).slice(-2).join(' · ');
  if(snippet.length>180) snippet=snippet.slice(0,177)+'...';
  this.log(`Dola dừng hỏi / chờ xác nhận ngay từ đầu: "${snippet}" — dừng task để bảo vệ credit!`);
  r.error=`⚠️ Dola đang chờ xác nhận: «${snippet}». Đã dừng ngay (chưa trừ credit). Hãy chọn thời lượng 15s hoặc chỉnh lại prompt.`;
  return r;
}if(/for copyright protection|copyright protection|can(?:'|’)?t\s+show\s+you\s+the\s+generated\s+video|chính sách bản quyền|bảo vệ bản quyền/i.test(initReply)){this.log("Dola từ chối trả video do bản quyền (initReply) — dừng ngay!");r.error="⚠️ Vi phạm bản quyền: Dola từ chối trả video do nội dung dính bản quyền (For copyright protection). Hãy đổi prompt hoặc ảnh khác.";return r;}if(/only supports generating videos featuring yourself/i.test(initReply)){this.log("Dola từ chối: chỉ hỗ trợ video khuôn mặt chính chủ (initReply) — dừng ngay!");r.error="⚠️ Dola từ chối: Chỉ hỗ trợ tạo video khuôn mặt của chính bạn (Only supports generating videos featuring yourself).";return r;}
if(/too frequently|frequent|too many requests|rate limit|slow down|thao tác quá thường xuyên|quá nhanh|thử lại sau|try again later|system busy|hệ thống bận|spam|send(?:ing)? messages too fast|daily limit|reached the limit|hết lượt/i.test(initReply)){this.log(`Dola báo spam / quá tần suất (initReply): "${initReply}" — dừng ngay!`);r.error=`⚠️ Dola báo lỗi Spam / Quá tần suất: ${initReply.slice(0,200)}. Nick này cần nghỉ.`;return r;}
if(/failed to generate|generation failed|unable to generate|tạo video thất bại|không thể tạo video|tạo thất bại|something went wrong|có lỗi xảy ra|could not process|không thể xử lý/i.test(initReply)){this.log(`Dola báo tạo thất bại (initReply): "${initReply}" — dừng ngay!`);r.error=`⚠️ Dola từ chối tạo video: ${initReply.slice(0,200)}`;return r;}
break;}await E(600);}}catch{}let l=await this.p.evaluate(()=>{let c=window.__dolaHook||{};return{sent:c.lastParam,orig:c.origParam}});if(this.log(`\u0111\xE3 g\u1EEDi: ${l.sent}`),l.orig&&l.orig!==l.sent&&this.log(`Dola v\u1ED1n \u0111\u1ECBnh g\u1EEDi: ${l.orig}`),t.images&&t.images.length){let c=await this.p.evaluate(()=>window.__dolaHook.lastImages);if(this.log(`\u1EA3nh trong request: ${JSON.stringify(c)}`),!c||!c.length)return r.error="Request \u0111i m\xE0 kh\xF4ng k\xE8m \u1EA3nh n\xE0o - upload ch\u01B0a g\u1EAFn v\xE0o tin nh\u1EAFn.",r}if(t.dryRun)return this.log("dry-run: request b\u1ECB ch\u1EB7n t\u1EA1i client, kh\xF4ng t\u1ED1n credit."),r;r.credits_left=await this.waitForCreditLine(),this.clampedTo=null;try{let c=await this.waitForVideo(t.waitMinutes??20,o,a,rep=>{r.dola_response=rep;t.onReply?.(rep);},abortController.signal);if(!c)return r.error=`H\u1EBFt ${t.waitMinutes??20} ph\xFAt m\xE0 video ch\u01B0a xu\u1EA5t hi\u1EC7n.`,r.credits_left=await this.creditsLeft()??r.credits_left,r;try{if(typeof cdpResHandler==="function")this.p.off("response",cdpResHandler)}catch{}
let cleanVidUrl=String(c.src||"").replace(/([?&])lr=watermarked\b/gi,"$1lr=unwatermarked").replace(/([?&])logo_type=(?:watermarked|wm)\b/gi,"$1logo_type=unwatermarked").replace(/([?&])watermark=(?:1|true)\b/gi,"$1watermark=0").replace(/([?&])wm=(?:1|true)\b/gi,"$1wm=0");
if(cleanVidUrl!==c.src){try{let hres=await this.context.request.head(cleanVidUrl,{timeout:6000,headers:{"Referer":"https://dola.com/"}});if(hres.ok()){this.log("đã chuyển đổi sang link sạch không watermark: "+cleanVidUrl.slice(0,60)+"…");c.src=cleanVidUrl;}}catch{}}
r.video_seconds=c.duration,r.video_url=c.src,r.credits_left=await this.creditsLeft()??r.credits_left;let d=t.filename||`${Je()}-${Ne(t.prompt)}.mp4`;r.path=await this.download(c.src,dt.default.join(t.outDir||this.outputDir,d))}catch(c){if(!(c instanceof S))throw c;r.error=c.message}return r}async recover(t){let e={prompt:t.prompt,model:"",duration:0,ratio:null,path:null,video_seconds:null,credits_left:null,conversation_url:t.url,video_url:t.videoUrl??null,error:null},i=()=>dt.default.join(t.outDir||this.outputDir,t.filename||`${Je()}-${Ne(t.prompt)}.mp4`);if(t.videoUrl&&t.videoUrl.startsWith("http")){this.log("thử tải lại bằng đường dẫn video đã lưu từ lần trước");this.onStage("downloading","Đang tải lại bằng đường dẫn video đã lưu (không mở lại trang)",88);try{return e.path=await this.download(t.videoUrl,i()),e}catch(r){this.log(`đường dẫn cũ không tải được (${r instanceof Error?r.message:r}) - mở lại cuộc trò chuyện`)}}this.log(`mở lại ${t.url}`);this.onStage("compose","Đang mở lại cuộc trò chuyện trên Dola để quét video",30);await this.installHook("2.5",15,null,false);let cdpResHandler=async(res)=>{try{let ct=(res.headers()["content-type"]||"").toLowerCase();if(/json|text|event-stream/.test(ct)){let txt=await res.text().catch(()=>"");if(txt&&/fallback_api|main_url|play_url|key_seed|video_url|video_mp4|mime_type=video_mp4|creation/i.test(txt)){await this.p.evaluate((s)=>{if(window.__dolaHook){window.__dolaHook.sent=1;window.__dolaHook?.scanForUrls?.(s);}},txt).catch(()=>{});}}}catch{}};this.p.on("response",cdpResHandler);await this.p.goto(t.url,{waitUntil:"domcontentloaded"});await E(3000);await this.p.evaluate(()=>{if(window.__dolaHook)window.__dolaHook.sent=1;window.scrollTo(0,document.body.scrollHeight);}).catch(()=>{});await E(1500);let n=t.prompt.split('\n').find(r=>r.trim())?.trim().slice(0,60)??"";this.clampedTo=null;try{let r=await this.waitForVideo(t.waitMinutes??8,[],n);if(!r)return e.error=`Mở lại cuộc trò chuyện nhưng sau ${t.waitMinutes??8} phút vẫn không thấy video nào của mình.`,e;try{if(typeof cdpResHandler==="function")this.p.off("response",cdpResHandler)}catch{}let cleanVidUrl=String(r.src||"").replace(/([?&])lr=watermarked\b/gi,"$1lr=unwatermarked").replace(/([?&])logo_type=(?:watermarked|wm)\b/gi,"$1logo_type=unwatermarked").replace(/([?&])watermark=(?:1|true)\b/gi,"$1watermark=0").replace(/([?&])wm=(?:1|true)\b/gi,"$1wm=0");if(cleanVidUrl!==r.src){try{let hres=await this.context.request.head(cleanVidUrl,{timeout:6000,headers:{"Referer":"https://dola.com/"}});if(hres.ok()){this.log("đã chuyển đổi sang link sạch không watermark: "+cleanVidUrl.slice(0,60)+"…");r.src=cleanVidUrl;}}catch{}}e.video_seconds=r.duration,e.video_url=r.src,e.credits_left=await this.creditsLeft(),e.path=await this.download(r.src,i())}catch(r){if(!(r instanceof S))throw r;e.error=r.message}finally{try{this.p.off("response",cdpResHandler)}catch{}}return e}async waitForCreditLine(t=45){let e=Date.now()+t*1e3;for(;Date.now()<e;){try{let i=await this.creditsLeft();if(i!==null)return i;}catch{}await E(2e3)}return null}clampedTo=null;async refusalText(){
  let hk=await this.p.evaluate(()=>{let c=window.__dolaHook||{};return c.toastError||c.respError||null}).catch(()=>null);
  if(hk) return hk;
  let captchaErr=await this.p.evaluate(()=>{
    if(document.querySelector('iframe[src*="captcha"], [id*="captcha"], div[class*="secsdk"]')) return "Dola yêu cầu xác minh Captcha. Hãy mở cửa sổ tài khoản để giải Captcha.";
    let toast=[...document.querySelectorAll('[role="alert"], [class*="toast"], [class*="notice"]')].map(el=>(el.innerText||"").trim()).find(tx=>/quá thường xuyên|quá nhanh|rate limit|too many requests|spam/i.test(tx));
    return toast||null;
  }).catch(()=>null);
  if(captchaErr) return captchaErr;

  let latestBotText=await this.p.evaluate(()=>{
    let botRows=[...document.querySelectorAll('.v_list_row, [data-target-id="message-box-target-id"], [data-message-id], [data-role="assistant"], [class*="bubble"]')];
    if(botRows.length>0){
      let lastBotRow=botRows[botRows.length-1];
      let textEl=lastBotRow.querySelector('.container-enLQFx, .container-fBOrXO, .md-box-root, [data-container-type="block-v2"] [data-plugin-identifier="block_type:10000"], [data-container-type="block-v2"]');
      let txt=((textEl?textEl.innerText:lastBotRow.innerText)||"").trim();
      if(txt) return txt;
    }
    let hookReply=window.__dolaHook?.dolaReply;
    if(hookReply&&hookReply.trim()) return hookReply.trim();
    return null;
  }).catch(()=>null);

  if(!latestBotText) return null;

  // NẾU BOT ĐANG XÁC NHẬN TẠO VIDEO -> TUYỆT ĐỐI KHÔNG BÁO LỖI!
  let e=Yi(latestBotText);
  if(e.accepted){
    if(e.clampSeconds&&this.clampedTo!==e.clampSeconds){
      this.clampedTo=e.clampSeconds;
      let extra=e.readyMinutes?(` (dự kiến sẵn sàng trong ${e.readyMinutes} phút)`):"";
      this.log(`Dola nhận video ${e.clampSeconds}s${extra} và đang tiến hành render trong nền — tiếp tục chờ video hoàn thành...`);
    }
    return null;
  }
  return e.refusal;
}
async fetchDolaDisplayName(){try{if(!this.p||this.p.isClosed())return null;let name=await this.p.evaluate(async()=>{try{for(let i=0;i<localStorage.length;i++){let k=localStorage.key(i);if(/user|profile|account/i.test(k)){try{let val=JSON.parse(localStorage.getItem(k));let nick=val?.nickname||val?.user_name||val?.username||val?.name||val?.user_info?.nickname;if(nick&&typeof nick==='string'&&nick.trim().length>0&&nick.trim().length<60)return nick.trim();}catch{}}}let res=await fetch('/alice/user/launch?version_code=20800&language=en&device_platform=web&aid=495671',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});if(res.ok){let j=await res.json();let d=j?.data;if(d?.nickname&&d.nickname.trim())return d.nickname.trim();if(d?.unique_id&&d.unique_id.trim())return d.unique_id.trim();if(d?.user_info?.nickname&&d.user_info.nickname.trim())return d.user_info.nickname.trim();if(d?.name&&d.name.trim())return d.name.trim();}let el=document.querySelector('[class*="user-name"], [class*="username"], [class*="nickname"], [data-testid*="username"], [class*="user_name"], header [class*="name"]');if(el&&el.innerText&&el.innerText.trim().length>1&&el.innerText.trim().length<60)return el.innerText.trim();return null;}catch{return null;}}).catch(()=>null);return name||null;}catch{return null;}}async videoFromHook(){let t;try{t=await this.p.evaluate(()=>window.__dolaHook&&window.__dolaHook.videos||[])}catch{return null}if(!t.length)return null;let u=t.find(i=>i.includes("unwatermarked")||i.includes("lr=unwatermarked"));if(u)return u;let e=new Map;for(let i of t){let n=i.split("?")[0],r=e.get(n);(!r||i.length>r.length)&&e.set(n,i)}return[...e.values()][0]??null}async waitForVideo(t, e = [], i = "", onReply = null, abortSignal = null) {
  if (abortSignal?.aborted) throw (abortSignal.reason || new S("Tác vụ đã bị dừng do lỗi Dola"));
  let abortHandler = null;
  let abortPromise = new Promise((_, reject) => {
    abortHandler = () => { reject(abortSignal.reason || new S("Tác vụ đã bị dừng do lỗi Dola")); };
    abortSignal?.addEventListener("abort", abortHandler, { once: !0 });
  });
  let lastRep = null;
  let sentAt = Date.now();
  let n = Date.now() + t * 6e4, r = Date.now() + 6e4, o = Date.now(), a = 0;
  let l = h => {
    let p = (Date.now() - o) / 1e3, y = 40 + Math.round(45 * Math.min(1, p / Math.max(60, this.renderAvgS))), x = Math.max(0, Math.ceil((n - Date.now()) / 6e4));
    this.onStage("rendering", `Dola đang dựng video · chờ tối đa ${x} phút nữa${h ? " · " + h : ""}`, y);
  };
  l("");
  let d = !1;
  let lastScrollAt = 0;

  for (;;) {
    if (Date.now() >= n) {
      if (d || !this.page) break;
      d = !0;
      this.log("hết giờ chờ - tải lại trang và dò thêm một lượt cuối trước khi bỏ cuộc");
      this.onStage("rendering", "Hết giờ chờ - tải lại trang Dola và dò thêm một lượt cuối", 85);
      await this.p.reload({ waitUntil: "domcontentloaded" }).catch(() => {});
      await E(4e3);
      await this.p.evaluate(() => { window.__dolaHook = window.__dolaHook || { videos: [] }; }).catch(() => {});
      n = Date.now() + 6e4;
    }

    // Tự động hồi sinh kết nối nếu trình duyệt bị đóng ngoài ý muốn (người dùng bấm X tắt Chrome)
    if (this.closed || !this.alive || !this.p || this.p.isClosed()) {
      let convUrl = this.conversationUrl || (this.page ? this.page.url() : null);
      this.log("Phát hiện trình duyệt Chrome bị đóng — đang tự động kết nối lại ngầm...");
      try {
        await this.relaunchIfClosed(convUrl);
        this.p = this.page;
        n = Math.max(n, Date.now() + 5 * 6e4);
      } catch (relErr) {
        await E(3000);
        continue;
      }
    }

    // 1. Kiểm tra video từ hook mạng / fetch / CDP
    let h = await this.videoFromHook();
    if (h) {
      await this.p.evaluate(() => document.querySelectorAll("video, audio").forEach(x => { x.muted = !0; x.volume = 0; try { x.pause() } catch {} })).catch(() => {});
      return this.log(`video mới xuất hiện (bắt từ response: ${h.slice(0, 60)}…)`), { src: h, duration: null };
    }

    let curUrl = (this.p ? this.p.url() : "") || "";
    if (/[/](login|signin|passport)/i.test(curUrl) && !curUrl.includes("/chat")) {
      let isDead = !await this.isLoggedIn(!1).catch(() => !1);
      if (isDead) {
        let curCookies = [];
        try {
          let cf = require("path").join(this.profileDir || "", "dola-cookies.json");
          if (require("fs").existsSync(cf)) curCookies = JSON.parse(require("fs").readFileSync(cf, "utf-8"));
        } catch {}
        let hasSess = Array.isArray(curCookies) && curCookies.some(c => (c.name === "sessionid" || c.name === "sid_tt") && c.value);
        if (!hasSess) {
          this.noteSession({ loggedIn: !1, expires: null });
          b.error("app", `⚠️ Tài khoản «${this.displayName}» bị văng Dola (phiên hết hạn hoặc bị thu hồi). Vui lòng đăng nhập lại!`);
          throw new S(`⚠️ Tài khoản «${this.displayName}» bị văng Dola (phiên hết hạn hoặc bị thu hồi). Vui lòng đăng nhập lại!`);
        }
      }
    }

    // 2. Chạy evaluate quét sâu toàn bộ DOM, React Fiber props & state, thẻ video
    let p = null;
    try {
      p = await this.p.evaluate(({ baseline: y }) => {
        try {
          function isRealVideoUrl(u){if(!u||typeof u!=="string")return!1;let s=u.toLowerCase().trim();if(!s.startsWith("http://")&&!s.startsWith("https://")&&!s.startsWith("blob:"))return!1;if(s.includes("ibyteimg")||s.includes("image-sign")||s.includes("/image/")||s.includes("format=image"))return!1;if(s.includes(".png")||s.includes(".jpg")||s.includes(".jpeg")||s.includes(".webp")||s.includes(".gif")||s.includes(".svg"))return!1;if(s.includes("avatar")||s.includes("poster")||s.includes("cover")||s.includes("thumbnail")||s.includes("preview_low"))return!1;if(s.startsWith("blob:")||s.includes(".mp4")||s.includes(".webm")||s.includes("mime_type=video")||s.includes("/video/tos/"))return!0;if(s.includes("byteoversea")||s.includes("tiktokcdn")||s.includes("dola.com")){if(s.includes("/video/")||s.includes("play_url")||s.includes("download_url")||s.includes("video_url"))return!0;}return!1;}
          let N = [...document.querySelectorAll("video")];
          let g = [];
          for (let D of N.reverse()) {
            let s = D.currentSrc || D.src || D.querySelector("source")?.src || "";
            if (s && !y.includes(s) && isRealVideoUrl(s)) {
              g.push({ el: D, src: s, duration: D.duration || null });
            }
          }

          let pageBodyText = (document.body ? document.body.innerText : "") || "";
          let isReadyText = /your video is ready|video của bạn đã sẵn sàng|video is ready/i.test(pageBodyText);

          // Tìm các message block của assistant để ưu tiên quét tin nhắn mới nhất ở cuối trang
          let assistantMsgs = [...document.querySelectorAll('[data-role="assistant"], .v_list_row, [data-target-id="message-box-target-id"], [class*="bubble"]')];
          let lastMsg = assistantMsgs.length > 0 ? assistantMsgs[assistantMsgs.length - 1] : document.body;
          let lastMsgText = (lastMsg ? lastMsg.innerText : "") || "";
          let lastMsgIsReady = /your video is ready|video của bạn đã sẵn sàng|video is ready/i.test(lastMsgText);

          // Thu thập các phần tử video / card, ưu tiên phần tử ở cuối cùng (tin nhắn mới nhất)
          let allCards = [...document.querySelectorAll('[class*="block-video"], [data-plugin-identifier*="video"], [data-container-type="block-v2"] [data-plugin-identifier*="video"], [class*="video-card"], [class*="video-player"], [class*="aspect-[9/16]"], [class*="aspect-[16/9]"], [class*="aspect-video"]')];
          let lastCards = lastMsg ? [...lastMsg.querySelectorAll('[class*="block-video"], [data-plugin-identifier*="video"], [class*="video-card"], [class*="video-player"], [class*="aspect-[9/16]"], [class*="aspect-[16/9]"], [class*="aspect-video"]')] : [];

          // Khi phát hiện chữ "Your video is ready" mà chưa có thẻ video src, tự động kích hoạt click ngay vào nút Play / thẻ video của tin nhắn mới nhất
          if ((isReadyText || lastMsgIsReady) && g.length === 0) {
            let playTargets = [
              ...(lastMsg ? [...lastMsg.querySelectorAll('button[aria-label*="play" i], [class*="play"], svg[class*="play"], polygon, [class*="aspect-"], div[class*="overflow-hidden"]')] : []),
              ...lastCards,
              ...allCards.slice(-3).reverse(),
              ...[...document.querySelectorAll('button[aria-label*="play" i], [class*="play"], svg[class*="play"], polygon')].slice(-3).reverse()
            ];
            for (let pt of playTargets.slice(0, 4)) {
              try { pt.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })); } catch {}
              try { pt.click(); } catch {}
            }
            // Kiểm tra lại thẻ video sau khi kích hoạt click
            let N2 = [...document.querySelectorAll("video")];
            for (let D of N2.reverse()) {
              let s = D.currentSrc || D.src || D.querySelector("source")?.src || "";
              if (s && !y.includes(s) && isRealVideoUrl(s)) {
                g.push({ el: D, src: s, duration: D.duration || null });
              }
            }
          }

          // Quét React Fiber cả memoizedProps VÀ memoizedState đệ quy, ưu tiên từ tin nhắn cuối trang
          let fiberVideoUrl = null;
          let scanElements = [
            ...(lastMsg ? [...lastMsg.querySelectorAll('*')].reverse() : []),
            lastMsg,
            ...allCards.slice(-4).reverse(),
            ...assistantMsgs.slice(-3).reverse()
          ];

          let visited = new Set();
          function scanObj(obj, d) {
            if (!obj || typeof obj !== 'object' || d > 6 || visited.has(obj) || fiberVideoUrl) return;
            visited.add(obj);
            if (Array.isArray(obj)) {
              for (let it of obj) {
                scanObj(it, d + 1);
                if (fiberVideoUrl) return;
              }
              return;
            }
            for (let k of Object.keys(obj)) {
              let val = obj[k];
              if (typeof val === 'string' && isRealVideoUrl(val)) {
                fiberVideoUrl = val;
                return;
              }
              if (val && typeof val === 'object' && d < 6) {
                scanObj(val, d + 1);
                if (fiberVideoUrl) return;
              }
            }
          }

          for (let el of scanElements) {
            if (!el || fiberVideoUrl) break;
            let fk = Object.keys(el).find(k => k.startsWith('__reactFiber') || k.startsWith('__reactInternalInstance'));
            if (!fk) continue;
            let curr = el[fk];
            let depth = 0;
            while (curr && depth < 35 && !fiberVideoUrl) {
              depth++;
              if (curr.memoizedProps) scanObj(curr.memoizedProps, 0);
              if (curr.memoizedState) scanObj(curr.memoizedState, 0);
              curr = curr.return;
            }
          }

          if (!fiberVideoUrl) {
            let links = [...document.querySelectorAll('a[download], a[href*=".mp4"], a[href*="byteoversea"]')].reverse();
            for (let a of links) {
              let href = a.href || "";
              if (isRealVideoUrl(href)) {
                fiberVideoUrl = href;
                break;
              }
            }
          }

          if (fiberVideoUrl) {
            window.__dolaHook = window.__dolaHook || {};
            window.__dolaHook.videos = window.__dolaHook.videos || [];
            if (!window.__dolaHook.videos.includes(fiberVideoUrl)) {
              window.__dolaHook.videos.unshift(fiberVideoUrl);
            }
          }

          let errEls = [...document.querySelectorAll('[class*="error"], svg[class*="error"], svg[class*="alert"], [data-status="failed"], div.text-red-500, [class*="failed"]')];
          let btnErrs = [...document.querySelectorAll("button")].filter(b => /try again|thử lại/i.test(b.innerText || ""));
          errEls.push(...btnErrs);
          let domErr = errEls.length > 0 ? (errEls[0].innerText || "").trim() : null;

          let botRows = [...document.querySelectorAll('.v_list_row, [data-target-id="message-box-target-id"], [data-message-id], [data-role="assistant"], [class*="bubble"]')];
          let nonUserRows = botRows.filter(r => {
            let t = (r.innerText || "").trim();
            if (!t) return false;
            if (r.querySelector('[class*="send-msg"], [class*="justify-end"]')) return false;
            return true;
          });
          let lastBot = nonUserRows.length > 0 ? nonUserRows[nonUserRows.length - 1] : null;
          let domReply = lastBot ? (lastBot.innerText || "").trim() : "";
          let dolaReply = (window.__dolaHook && window.__dolaHook.dolaReply) || domReply || null;

          let DOLA_COPYRIGHT_POLICY_REGEX = /for copyright protection|can(?:'|’)?t\s+show\s+you\s+the\s+generated\s+video|copyrighted\s+or\s+policy-violating\s+content|policy-violating\s+content|no\s+credits\s+were\s+used\s+for\s+this\s+video/i;

          let botHasCopyright = false;
          let botCopyrightMsg = "";
          for (let r of [...nonUserRows].reverse()) {
            let t = (r.innerText || "").trim();
            if (t && DOLA_COPYRIGHT_POLICY_REGEX.test(t)) {
              botHasCopyright = true;
              botCopyrightMsg = t;
              break;
            }
          }
          let botHasFaceRefusal = false;
          for (let r of [...nonUserRows].reverse()) {
            let t = (r.innerText || "").trim();
            if (t && /only supports generating videos featuring yourself/i.test(t)) {
              botHasFaceRefusal = true;
              break;
            }
          }

          let DOLA_FAILURE_REGEX = /(?:something\s+went\s+wrong|please\s+try\s+again|could\s*(?:not|n(?:'|’)?t)\s+(?:\w+\s+)?(?:be\s+)?generate[ds]?|can(?:not|\s+not|n(?:'|’)?t)\s+(?:\w+\s+)?(?:be\s+)?generate[ds]?|unable\s+to\s+generate|failed\s+to\s+generate|generation\s+failed|tạo\s+video\s+thất\s+bại|không\s+thể\s+tạo\s+video|có\s+lỗi\s+xảy\s+ra|could\s+not\s+process|không\s+thể\s+xử\s+lý)/i;
          let botHasFailure = false;
          let botFailureMsg = "";
          for (let r of [...nonUserRows].reverse()) {
            let t = (r.innerText || "").trim();
            if (t && DOLA_FAILURE_REGEX.test(t)) {
              botHasFailure = true;
              botFailureMsg = t;
              break;
            }
          }
          if (!botHasFailure) {
            let candidateEls = [...document.querySelectorAll('[data-role="assistant"], [class*="prose"], [class*="message"], [class*="bubble"], .md-box-root, [class*="error"], div, p, span')].filter(el => {
              if (el.children.length > 2) return false;
              let txt = (el.innerText || "").trim();
              return txt.length >= 8 && txt.length <= 300 && DOLA_FAILURE_REGEX.test(txt);
            });
            if (candidateEls.length > 0) {
              botHasFailure = true;
              botFailureMsg = (candidateEls[candidateEls.length - 1].innerText || "").trim();
            }
          }

          let unwatermarkedFiber = fiberVideoUrl && (fiberVideoUrl.includes("unwatermarked") || fiberVideoUrl.includes("lr=unwatermarked")) ? fiberVideoUrl : null;
          let finalPick = unwatermarkedFiber ? { src: unwatermarkedFiber, duration: null } : (g.length ? { src: g[0].src, duration: g[0].duration } : (fiberVideoUrl ? { src: fiberVideoUrl, duration: null } : null));

          let needClick = (isReadyText || lastMsgIsReady) && !finalPick;
          if (needClick) {
            let pickEl = (lastMsg ? lastMsg.querySelector('button[aria-label*="play" i], [class*="play"], [class*="block-video"], [class*="aspect-[9/16]"], [class*="video-card"]') : null) || document.querySelector('[data-role="assistant"]:last-of-type [class*="aspect-"], button[aria-label*="play" i]:last-of-type, [class*="block-video"]:last-of-type');
            if (pickEl) pickEl.setAttribute("data-dola-pick", "1");
          }

          return {
            all: N.length,
            fresh: g.length,
            cards: allCards.length || (isReadyText ? 1 : 0),
            isReadyText: isReadyText || lastMsgIsReady,
            needClick,
            fiberVideoUrl,
            domErr,
            domReply,
            botHasCopyright,
            botCopyrightMsg,
            botHasFaceRefusal,
            botHasFailure,
            botFailureMsg,
            dolaReply,
            pick: finalPick
          };
        } catch (innerErr) {
          return { error: innerErr?.message || "inner eval error", all: 0, fresh: 0, cards: 0, needClick: false, pick: null };
        }
      }, { baseline: e });
    } catch (evalErr) {
      p = { error: evalErr?.message || "eval error", all: 0, fresh: 0, cards: 0, needClick: false, pick: null };
    }

    if (p?.dolaReply && p.dolaReply !== lastRep) { lastRep = p.dolaReply; try { onReply?.(lastRep); } catch {} }

    let checkText = ((p?.dolaReply || "") + " " + (p?.domReply || "") + " " + (p?.domErr || "")).toLowerCase();
    let isAlreadyGen = ji.test(checkText);

    // 1. KIỂM TRA LỖI DỰNG THẤT BẠI / SOMETHING WENT WRONG (Ưu tiên cao nhất - DỪNG TASK NGAY LẬP TỨC, không chờ 30 phút vô ích):
    let failureCandidate = ((p?.botFailureMsg || "") + " " + (p?.dolaReply || "") + " " + (p?.domReply || "") + " " + (p?.domErr || "")).trim();
    if (p?.botHasFailure || /(?:something\s+went\s+wrong|please\s+try\s+again|could\s*(?:not|n(?:'|’)?t)\s+(?:\w+\s+)?(?:be\s+)?generate[ds]?|can(?:not|\s+not|n(?:'|’)?t)\s+(?:\w+\s+)?(?:be\s+)?generate[ds]?|unable\s+to\s+generate|failed\s+to\s+generate|generation\s+failed|tạo\s+video\s+thất\s+bại|không\s+thể\s+tạo\s+video|có\s+lỗi\s+xảy\s+ra|could\s+not\s+process|không\s+thể\s+xử\s+lý)/i.test(failureCandidate)) {
      let m = failureCandidate.match(/[^\n.!?]*(?:something\s+went\s+wrong|could\s*(?:not|n(?:'|’)?t)\s+(?:\w+\s+)?(?:be\s+)?generate[ds]?|can(?:not|\s+not|n(?:'|’)?t)\s+(?:\w+\s+)?(?:be\s+)?generate[ds]?|unable\s+to\s+generate|failed\s+to\s+generate|generation\s+failed|tạo\s+video\s+thất\s+bại|không\s+thể\s+tạo\s+video|có\s+lỗi\s+xảy\s+ra|could\s+not\s+process|không\s+thể\s+xử\s+lý)[^\n.!?]*/i);
      let errMsg = m ? m[0].trim() : (p?.botFailureMsg || "Something went wrong. Please try again.");
      this.log(`Dola báo lỗi khi dựng: "${errMsg}" — dừng đợi ngay!`);
      throw new S(`⚠️ Dola báo lỗi khi dựng: ${errMsg} (Chưa trừ credit — Dola không tính credit cho video hỏng, có thể chạy lại)`);
    }

    // 2. KIỂM TRA BẢN QUYỀN / VI PHẠM CHÍNH SÁCH MỚI NHẤT (ÁP DỤNG CẢ KHI ĐANG ĐỢI VIDEO):
    // Ngay cả khi trước đó đã báo "The video will be generated...", nếu Dola gửi thông báo từ chối:
    // DỪNG TASK NGAY LẬP TỨC và báo lỗi, không đợi 20-30 phút vô ích!
    if (p?.botHasCopyright || /for copyright protection|can(?:'|’)?t\s+show\s+you\s+the\s+generated\s+video|copyrighted\s+or\s+policy-violating\s+content|policy-violating\s+content|no\s+credits\s+were\s+used\s+for\s+this\s+video/i.test(p?.domReply || "")) {
      this.log("Dola từ chối trả video do bản quyền / vi phạm chính sách (For copyright protection / policy-violating content) — dừng đợi ngay!");
      throw new S("⚠️ Vi phạm bản quyền: Dola từ chối trả video do nội dung dính bản quyền hoặc chính sách bảo vệ hình ảnh (For copyright protection / policy-violating content). Hãy đổi prompt hoặc ảnh khác.");
    }
    if (p?.botHasFaceRefusal || /only supports generating videos featuring yourself/i.test(p?.domReply || "")) {
      this.log("Dola từ chối: chỉ hỗ trợ video khuôn mặt chính chủ — dừng đợi ngay!");
      throw new S("⚠️ Dola từ chối: Chỉ hỗ trợ tạo video khuôn mặt của chính bạn (Only supports generating videos featuring yourself).");
    }

    // 2. NẾU DOLA VẪN ĐANG TRONG QUÁ TRÌNH TẠO (chưa bị từ chối):
    if (isAlreadyGen) {
      let waitMatch = checkText.match(/(?:ready in|in)\s+(\d+)\s+minutes?/i);
      let readyMinutes = waitMatch ? waitMatch[1] : 15;
      if (!this._loggedGeneratingReady) {
        this._loggedGeneratingReady = true;
        this.log(`Dola xác nhận: Đang tạo video (dự kiến hoàn thành trong ${readyMinutes} phút)`);
      }
    } else {
      // 3. CÁC KIỂM TRA TỪ CHỐI KHÁC KHI CHƯA NHẬN TẠO:
      let rawReply = (p?.dolaReply || p?.domReply || "").trim();
      if (rawReply) {
        let yiCheck = Yi(rawReply);
        if (yiCheck && yiCheck.refusal) {
          this.log(`Dola từ chối (Yi): ${yiCheck.refusal} — dừng đợi ngay!`);
          throw new S(yiCheck.refusal);
        }
      }

      if (/reached the daily limit for video generation|reached (?:the\s+)?daily limit|hết lượt trong ngày/i.test(checkText)) {
        this.log("Dola báo hết lượt trong ngày (Daily limit) — dừng đợi ngay!");
        throw new S("⚠️ Dola báo hết lượt trong ngày: Tài khoản này đã đạt giới hạn tạo video hôm nay (Daily limit). Nick cần nghỉ tới sáng mai.");
      }
      if (/too frequently|frequent|too fast|too many requests|rate limit|slow down|thao tác quá thường xuyên|spam/i.test(checkText)) {
        this.log("Dola báo spam / giới hạn tần suất — dừng đợi ngay!");
        throw new S("⚠️ Dola báo lỗi Spam / Giới hạn tần suất: " + (p?.dolaReply || p?.domErr || "Thao tác quá thường xuyên"));
      }
      if (/durations?\s+from\s+\d+\s+to\s+\d+|nearest supported duration of \d+|chỉ\s+hỗ\s+trợ\s+từ\s+\d+\s+đến\s+\d+\s+giây|supports durations from/i.test(checkText)) {
        let durMatch = checkText.match(/(?:to|of|\b)\s*(\d+)\s*(?:seconds?|giây)/i);
        let durVal = durMatch ? durMatch[1] : "15";
        this.log(`Dola từ chối do độ dài video: chỉ hỗ trợ 4-${durVal}s — dừng đợi ngay!`);
        throw new S(`⚠️ Dola từ chối: Chỉ nhận video 4-${durVal}s cho prompt này — chuẩn đoán: lỗi Prompt/Độ dài, tài khoản bình thường chưa trừ credit.`);
      }
      if (/(?:do you want me to proceed|which style would you like|please\s+(?:choose|select)\s+(?:one|an\s+option)|choose\s+(?:one|an\s+option)|reply\s+with\s+[A-D]|vui\s+lòng\s+chọn\s+(?:một\s+)?(?:phương\s+án|tùy\s+chọn)|hãy\s+chọn\s+(?:một\s+)?(?:phương\s+án|kiểu)|chọn\s+phương\s+án|confirm\s+(?:if\s+)?(?:you(?:'|’)?d\s+like|to\s+proceed)|confirm the duration)/i.test(checkText)) {
        let snippet = (p?.dolaReply || p?.domReply || "").split('\n').map(l => l.trim()).filter(Boolean).slice(-2).join(' · ');
        if (snippet.length > 180) snippet = snippet.slice(0, 177) + '...';
        this.log(`Dola dừng hỏi xác nhận: "${snippet}" — dừng task để bảo vệ credit!`);
        throw new S(`⚠️ Dola đang chờ xác nhận: «${snippet}». Đã dừng ngay (chưa trừ credit). Hãy chọn thời lượng 15s hoặc chỉnh lại prompt.`);
      }
      if (/(?:failed to generate|generation failed|unable to generate|tạo video thất bại|something went wrong|please try again|could\s*(?:not|n(?:'|’)?t)\s+(?:\w+\s+)?(?:be\s+)?generate[ds]?|can(?:not|\s+not|n(?:'|’)?t)\s+(?:\w+\s+)?(?:be\s+)?generate[ds]?)/i.test(checkText)) {
        this.log("Dola báo tạo video thất bại — dừng đợi ngay!");
        throw new S("⚠️ Dola báo tạo video thất bại: " + (p?.dolaReply || p?.domErr || "Something went wrong. Please try again."));
      }
    }// 3. NẾU ĐÃ BẮT ĐƯỢC VIDEO: HOÀN THÀNH VÀ TRẢ VỀ NGAY LẬP TỨC!
    if (p?.pick && p.pick.src) {
      await this.p.evaluate(() => document.querySelectorAll("video, audio").forEach(x => { x.muted = !0; x.volume = 0; try { x.pause() } catch {} })).catch(() => {});
      let cleanPickSrc = String(p.pick.src || "").replace(/([?&])lr=watermarked\b/gi, "$1lr=unwatermarked").replace(/([?&])logo_type=(?:watermarked|wm)\b/gi, "$1logo_type=unwatermarked").replace(/([?&])watermark=(?:1|true)\b/gi, "$1watermark=0").replace(/([?&])wm=(?:1|true)\b/gi, "$1wm=0");
      if (cleanPickSrc !== p.pick.src && cleanPickSrc.startsWith("http")) {
        try {
          let hres = await this.context.request.head(cleanPickSrc, { timeout: 6000, headers: { "Referer": "https://dola.com/" } });
          if (hres.ok()) {
            this.log("đã chuyển đổi sang link sạch không watermark: " + cleanPickSrc.slice(0, 60) + "…");
            p.pick.src = cleanPickSrc;
          }
        } catch {}
      }
      return this.log(`video mới xuất hiện (chọn ${p.pick.src.slice(0, 60)}…)`), { src: p.pick.src, duration: p.pick.duration };
    }

    // 4. NẾU VIDEO ĐÃ SẴN SÀNG NHƯNG CHƯA MOUNT THẺ: Kích hoạt click Playwright chuẩn xác
    if (p?.isReadyText || p?.needClick) {
      try {
        let playLoc = this.p.locator('[data-dola-pick="1"], [data-role="assistant"]:last-of-type button[aria-label*="play" i], [data-role="assistant"]:last-of-type [class*="aspect-[9/16]"], button[aria-label*="play" i], [class*="block-video"]').last();
        await playLoc.scrollIntoViewIfNeeded({ timeout: 1500 }).catch(() => {});
        await playLoc.click({ timeout: 2000, force: true }).catch(() => {});
        await E(800);
        let videoSrc = await this.p.evaluate((base) => {
          let vids = [...document.querySelectorAll('video')];
          for (let v of vids.reverse()) {
            let s = v.currentSrc || v.src || v.querySelector('source')?.src;
            if (s && !base.includes(s) && (s.startsWith('http') || s.startsWith('blob:'))) return s;
          }
          return null;
        }, e).catch(() => null);
        if (videoSrc) {
          await this.p.evaluate(() => document.querySelectorAll("video, audio").forEach(x => { x.muted = !0; x.volume = 0; try { x.pause() } catch {} })).catch(() => {});
          return this.log(`video phát hiện sau khi bấm thẻ (${videoSrc.slice(0, 60)}…)`), { src: videoSrc, duration: null };
        }
      } catch {}
    }

    // 5. Cuộn trang định kỳ để giữ kết nối và kích hoạt lazy-load DOM
    if (Date.now() - lastScrollAt > 15000) {
      lastScrollAt = Date.now();
      await this.p.evaluate(() => { window.scrollTo(0, document.body.scrollHeight); }).catch(() => {});
    }

    let stageMsg = p?.isReadyText ? "Dola đã tạo xong video · đang lấy tệp về..." : "Dola đang dựng video";
    l(stageMsg);

    if (Date.now() - a > 3e4) {
      a = Date.now();
      let y = Math.floor((n - Date.now()) / 6e4);
      this.log(`...đang render, còn ${y} phút (${stageMsg})`);
    }

    await E(1500);
  }

  return null;
}async fetchViaContext(t,e){let u=await this.p.evaluate(()=>navigator.userAgent).catch(()=>"");let h={"Referer":"https://dola.com/","Origin":"https://dola.com"};if(u)h["User-Agent"]=u;let i=await this.context.request.get(t,{timeout:18e4,maxRedirects:5,headers:h});if(!i.ok())throw new S(`HTTP ${i.status()}`);O.default.writeFileSync(e,await i.body())}async fetchViaPage(t,e){let b=await this.p.evaluate(async u=>{let r=await fetch(u,{credentials:"include"});if(!r.ok)throw new Error("HTTP "+r.status);let bl=await r.blob();return new Promise((res,rej)=>{let rd=new FileReader();rd.onloadend=()=>{let d=rd.result;if(typeof d==="string"){let c=d.indexOf(",");res(c>=0?d.slice(c+1):d)}else rej(new Error("FileReader did not produce string"))};rd.onerror=()=>rej(new Error("FileReader read error"));rd.readAsDataURL(bl)})},t);O.default.writeFileSync(e,Buffer.from(b,"base64"))}async download(t,e){O.default.mkdirSync(dt.default.dirname(e),{recursive:!0});let i=e+".part",n=[0,2e3,5e3,1e4],r="";this.onStage("downloading","Dola đã dựng xong, đang tải tệp về máy",90);for(let o=0;o<n.length;o++){n[o]&&(this.log(`tải video lỗi (${r}) - thử lại lần ${o+1}/${n.length} sau ${n[o]/1e3} giây`),this.onStage("downloading",`Tải tệp bị lỗi (${r.slice(0,40)}) - thử lại lần ${o+1}/${n.length}`,90),await E(n[o]));try{if(t.startsWith("blob:"))await this.fetchViaPage(t,i);else if(t.startsWith("http")){try{await this.fetchViaContext(t,i)}catch(ce){this.log(`fetchViaContext lỗi (${ce?.message||ce}), chuyển sang tải qua trang...`);await this.fetchViaPage(t,i)}}else throw new S(`Không hiểu nguồn video: ${t.slice(0,40)}`);let a=O.default.existsSync(i)?O.default.statSync(i).size:0;
        if(a<Qi||!en(i)){
          if(this.p && !this.p.isClosed()){
            this.log(`Tệp tải về không phải video (${a} byte). Đang tự động trích xuất lại thẻ video trực tiếp từ trang...`);
            let liveSrc = await this.p.evaluate(() => {
              function isReal(u){if(!u||typeof u!=="string")return!1;let s=u.trim();if(!s.startsWith("http://")&&!s.startsWith("https://")&&!s.startsWith("blob:"))return!1;if(/ibyteimg|flow-image-sign|\.(?:png|jpe?g|webp)/i.test(s))return!1;return s.startsWith("blob:")||s.includes(".mp4")||s.includes("video")||s.includes("mime_type=video");}
              let vs = [...document.querySelectorAll("video")];
              for(let v of vs.reverse()){
                let s = v.currentSrc || v.src || v.querySelector("source")?.src;
                if(s && isReal(s)) return s;
              }
              return null;
            }).catch(() => null);
            if(liveSrc && liveSrc !== t){
              this.log(`Bắt được link video thật từ thẻ video: ${liveSrc.slice(0, 60)}… Đang tải lại...`);
              t = liveSrc;
              try { O.default.rmSync(i, { force: true }); } catch {}
              if(t.startsWith("blob:")) await this.fetchViaPage(t, i);
              else await this.fetchViaContext(t, i);
              a = O.default.existsSync(i) ? O.default.statSync(i).size : 0;
            }
          }
          if(a<Qi||!en(i)) throw new S(`file tải về không phải video (${a} byte)`);
        }
        return O.default.renameSync(i,e),this.log(`đã lưu ${e} (${(a/1e6).toFixed(1)} MB)`),e}catch(a){r=a instanceof Error?a.message:String(a);try{O.default.rmSync(i,{force:!0})}catch{}if(r.startsWith("Không hiểu nguồn"))throw a}}throw new S(`Tải video thất bại sau ${n.length} lần (${r}) - video vẫn nằm trên Dola`)}};
var Zt=require("node:child_process"),F=k(require("node:fs")),rt=k(require("node:path"));function pt(s,t){return new Promise(e=>{(0,Zt.execFile)(s,t,{maxBuffer:16*1024*1024},(i,n,r)=>{let o=i?i.code??1:0;e({code:typeof o=="number"?o:1,stdout:String(n),stderr:String(r)})})})}async function rn(s){let t=await pt(Z(),["-hide_banner","-i",s]),e=t.stderr.match(/Stream #\d+:\d+.*?Video: ([a-zA-Z0-9_]+)/);return e?e[1].toLowerCase():(/No such file|not found|ENOENT/i.test(t.stderr)||t.code===127,null)}async function Be(s){let t=await pt(Z(),["-hide_banner","-i",s]),e=t.stderr.match(/Video: .*?(\d{2,5})x(\d{2,5})/),i=t.stderr.match(/Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/);if(!e)return null;let n=i?Number(i[1])*3600+Number(i[2])*60+Number(i[3]):0;return{width:Number(e[1]),height:Number(e[2]),duration:n}}async function sn(s,t){if(t=t??await Be(s),!t)return null;let{width:e,height:i,duration:n}=t,r=Math.round(e*.3),o=Math.round(i*.12),a=e-r,l=i-o,c=n>2?[.5,n*.25,n*.5,n*.75,n-.5]:[0,n/2],d=null;for(let f of c){let _=await new Promise(I=>{(0,Zt.execFile)(Z(),["-v","error","-ss",f.toFixed(3),"-i",s,"-frames:v","1","-vf",`crop=${r}:${o}:${a}:${l},format=gray`,"-f","rawvideo","-"],{encoding:"buffer",maxBuffer:67108864},(X,q)=>I(Buffer.from(q)))});if(!(_.length<r*o))if(!d)d=Buffer.from(_.subarray(0,r*o));else for(let I=0;I<r*o;I++)_[I]<d[I]&&(d[I]=_[I])}let calFallback=()=>{let calW=Math.round(e*(165/1080)),calH=Math.round(i*(50/1920)),calX=Math.round(e-calW-(30/1080*e)),calY=Math.round(i-calH-(25/1920*i));return{x:Math.max(0,calX),y:Math.max(0,calY),w:calW,h:calH};};if(!d)return calFallback();let u=r,h=o,p=-1,y=-1,x=0;for(let f=0;f<o;f++)for(let _=0;_<r;_++)d[f*r+_]>200&&(x++,_<u&&(u=_),_>p&&(p=_),f<h&&(h=f),f>y&&(y=f));let N=p-u+1,g=y-h+1;return(x<40||N<20||g<6||N>r*.8||g>o*.5)?calFallback():{x:a+u,y:l+h,w:N,h:g}}async function He(s,t={}){let e=t.log??(()=>{}),i={playable:!1,watermarkRemoved:!1,upscaled:!1},n;try{n=await rn(s)}catch(u){return e(`kh\xF4ng ch\u1EA1y \u0111\u01B0\u1EE3c ffmpeg: ${String(u)}`),i}if(!n)return e("kh\xF4ng c\xF3 ffmpeg ho\u1EB7c kh\xF4ng \u0111\u1ECDc \u0111\u01B0\u1EE3c codec, gi\u1EEF nguy\xEAn file"),i;i.playable=n==="h264";let r=null,o=null;try{o=await Be(s)}catch{}if(t.removeWatermark&&o){try{r=await sn(s,o);if(!r){let calW=Math.round(o.width*(165/1080)),calH=Math.round(o.height*(50/1920)),calX=Math.round(o.width-calW-(30/1080*o.width)),calY=Math.round(o.height-calH-(25/1920*o.height));r={x:Math.max(0,calX),y:Math.max(0,calY),w:calW,h:calH};}}catch{}}let scaleFilter=null,origRes="",targetRes="";if(o&&o.width&&o.height){origRes=`${o.width}x${o.height}`;if(o.width<o.height){if(o.width<1080||(o.width!==1080&&o.height!==1920)){scaleFilter="scale=1080:-2:flags=bicubic";targetRes=`1080x${Math.round(1080*o.height/o.width/2)*2}`;}}else{if(o.height<1080||(o.height!==1080&&o.width!==1920)){scaleFilter="scale=-2:1080:flags=bicubic";targetRes=`${Math.round(1080*o.width/o.height/2)*2}x1080`;}}}if(i.playable&&!r&&!scaleFilter)return i;let a=[];if(r&&o){let h=Math.max(1,r.x-5),p=Math.max(1,r.y-5),y=Math.min(o.width-h-2,r.w+10),x=Math.min(o.height-p-2,r.h+10);a.push(`delogo=x=${h}:y=${p}:w=${y}:h=${x}`)}if(scaleFilter){a.push(scaleFilter);}let l=rt.default.join(rt.default.dirname(s),rt.default.basename(s,rt.default.extname(s))+".proc.tmp.mp4"),c=["-v","error","-y","-i",s];a.length&&c.push("-vf",a.join(",")),c.push("-c:v","libx264","-crf","18","-preset","veryfast","-pix_fmt","yuv420p","-c:a","copy","-movflags","+faststart",l);let d=await pt(Z(),c);if(d.code!==0||!F.default.existsSync(l)||F.default.statSync(l).size===0){e(`x\u1EED l\xFD video th\u1EA5t b\u1EA1i, gi\u1EEF nguy\xEAn ${n}: ${d.stderr.trim().slice(-200)}`);try{F.default.unlinkSync(l)}catch{}return i}F.default.renameSync(l,s);i.playable=!0;i.watermarkRemoved=!!r;i.upscaled=!!scaleFilter;let msgs=[];if(scaleFilter)msgs.push(`\u0111\xE3 upscale l\xEAn 1080p (${origRes} -> ${targetRes})`);if(r)msgs.push(`\u0111\xE3 xo\xE1 watermark ${r.w}x${r.h} \u1EDF (${r.x},${r.y})`);if(!scaleFilter&&!r)msgs.push(n!=="h264"?`\u0111\xE3 chuy\u1EC3n ${n} -> H.264`:"\u0111\xE3 m\xE3 ho\xE1 l\u1EA1i");e(`${msgs.join(", ")} (${(F.default.statSync(s).size/1e6).toFixed(1)} MB)`);return i}async function Tt(s,t){try{const _fs=require("fs"),_path=require("path");_fs.mkdirSync(_path.dirname(t),{recursive:!0});let res=await pt(Z(),["-v","error","-y","-ss","0.3","-i",s,"-frames:v","1","-vf","scale=-2:200","-q:v","4",t]);if(res.code===0&&_fs.existsSync(t)&&_fs.statSync(t).size>0)return!0;let res2=await pt(Z(),["-v","error","-y","-i",s,"-frames:v","1","-vf","scale=-2:200","-q:v","4",t]);return res2.code===0&&_fs.existsSync(t)&&_fs.statSync(t).size>0;}catch{return!1;}}var C=k(require("node:fs")),j=k(require("node:path"));var on=new Set(["ui","uploads","assets","thumbs"]),Ue=".seedance-profile",qe=["id","name","enabled","login","credits","credits_date","session_expires","last_check","created","proxy","proxy_rotate","proxy_key","rest_until","rest_reason","login_method","health_status"];function an(s){if(!s.session_expires)return null;let t=Date.parse(s.session_expires);return Number.isFinite(t)?Math.floor((t-Date.now())/864e5):null}function mt(){return new Date().toISOString().slice(0,10)}function Ke(s){return s.credits_date===mt()?s.credits:null}function je(s){if(!s.rest_until)return!1;let t=Date.parse(s.rest_until);return Number.isFinite(t)&&t>Date.now()}function ze(s=new Date){return new Date(s.getFullYear(),s.getMonth(),s.getDate()+1,0,5,0).toISOString()}function Ye(s,t=new Date){return new Date(t.getTime()+s*6e4).toISOString()}function isTorProxy(s){if(!s)return!1;let p=String(s).trim().toLowerCase();return p==="tor"||p==="[tor]"||p==="tor-proxy"||p.startsWith("tor:")||p.includes("1905")||p.includes("1906")}
function te(s){return s.enabled&&s.login!==!1&&Ke(s)!==0&&!je(s)&&(!isTorProxy(s.proxy)||(globalThis.__torManager?.isReady?.()===!0))}function Ve(s){return s.split(/(\d+)/).filter(t=>t!=="").map(t=>/^\d+$/.test(t)?Number(t):t.toLowerCase())}function Ge(s,t){let e=Ve(s),i=Ve(t);for(let n=0;n<Math.max(e.length,i.length);n++){let r=e[n],o=i[n];if(r===void 0)return-1;if(o===void 0)return 1;if(r!==o)return typeof r=="number"&&typeof o=="number"?r-o:String(r)<String(o)?-1:1}return 0}function ln(s){return s.replace(/[^a-zA-Z0-9]+/g,"-").replace(/^-+|-+$/g,"").toLowerCase()||"profile"}function Qt(s,t={}){return{id:s,name:t.name||s,enabled:t.enabled!==!1,login:typeof t.login=="boolean"?t.login:null,credits:typeof t.credits=="number"?t.credits:null,credits_date:t.credits_date??null,session_expires:typeof t.session_expires=="string"?t.session_expires:null,last_check:typeof t.last_check=="string"?t.last_check:null,created:typeof t.created=="string"?t.created:null,proxy:typeof t.proxy=="string"&&t.proxy?t.proxy:null,proxy_rotate:!!t.proxy_rotate,proxy_key:typeof t.proxy_key=="string"?t.proxy_key:null,rest_until:typeof t.rest_until=="string"?t.rest_until:null,rest_reason:typeof t.rest_reason=="string"?t.rest_reason:null,login_method:t.login_method??null,health_status:t.health_status??null,state:"off",current_job:null}}var Lt=class{
  baseDir;file;tombstoneFile;tombstones=new Set;extraReserved;profiles=new Map;
  constructor(t=St,e=[]){
    this.baseDir=t;
    this.file=j.default.join(t,"profiles.json");
    this.tombstoneFile=j.default.join(t,"tombstones.json");
    this.extraReserved=typeof e=="function"?e:()=>e;
    this.loadTombstones();
    this.load();
  }
  loadTombstones(){
    this.tombstones=new Set();
    if(this.tombstoneFile&&C.default.existsSync(this.tombstoneFile)){
      try{
        let data=JSON.parse(C.default.readFileSync(this.tombstoneFile,"utf-8"));
        let arr=Array.isArray(data)?data:(data.tombstones||[]);
        for(let id of arr)if(id&&typeof id==="string")this.tombstones.add(id);
      }catch{}
    }
  }
  saveTombstones(){
    if(!this.tombstoneFile)return;
    try{
      C.default.mkdirSync(this.baseDir,{recursive:!0});
      let tmp=this.tombstoneFile+".tmp";
      C.default.writeFileSync(tmp,JSON.stringify({tombstones:[...this.tombstones]},null,1),"utf-8");
      C.default.renameSync(tmp,this.tombstoneFile);
    }catch{}
  }
  cleanupTombstonedFolders(){
    if(!this.baseDir||!C.default.existsSync(this.baseDir))return;
    for(let id of this.tombstones){
      let pDir=this.dir(id);
      if(C.default.existsSync(pDir)){
        try{C.default.rmSync(pDir,{recursive:!0,force:!0})}catch{}
      }
    }
  }
  get reserved(){return new Set([...on,...this.extraReserved()])}
  isProfileDir(t){
    if(this.reserved.has(t)||t.startsWith(".")||this.tombstones.has(t))return!1;
    let e=j.default.join(this.baseDir,t);
    try{
      return C.default.statSync(e).isDirectory()?C.default.existsSync(j.default.join(e,Ue))||C.default.existsSync(j.default.join(e,"Default"))||C.default.existsSync(j.default.join(e,"Local State"))?!0:C.default.readdirSync(e).length===0:!1
    }catch{return!1}
  }
  load(){
    this.loadTombstones();
    let t=new Map;
    if(C.default.existsSync(this.file))try{
      let i=JSON.parse(C.default.readFileSync(this.file,"utf-8"));
      for(let n of i.profiles||[])n&&n.id&&!this.tombstones.has(n.id)&&t.set(n.id,n)
    }catch{t=new Map}
    let e=new Set(t.keys());
    if(C.default.existsSync(this.baseDir))
      for(let i of C.default.readdirSync(this.baseDir))
        !this.tombstones.has(i)&&this.isProfileDir(i)&&e.add(i);
    this.profiles=new Map;
    for(let i of[...e].sort(Ge))this.profiles.set(i,Qt(i,t.get(i)||{}));
    this.save();
    this.cleanupTombstonedFolders();
  }
  save(){
    let t=[...this.profiles.values()].map(i=>Object.fromEntries(qe.map(n=>[n,i[n]])));
    C.default.mkdirSync(this.baseDir,{recursive:!0});
    let e=this.file+".tmp";
    C.default.writeFileSync(e,JSON.stringify({profiles:t},null,1),"utf-8");
    C.default.renameSync(e,this.file);
  }
  rescan(){
    this.loadTombstones();
    if(!C.default.existsSync(this.baseDir))return[];
    let t=[];
    for(let e of C.default.readdirSync(this.baseDir)){
      if(!this.tombstones.has(e)&&this.isProfileDir(e)&&!this.profiles.has(e)){
        this.profiles.set(e,Qt(e));
        t.push(e);
      }
    }
    return t.length&&(this.profiles=new Map([...this.profiles.entries()].sort((e,i)=>Ge(e[0],i[0]))),this.save()),t
  }
  get(t){return this.profiles.get(t)}
  all(){return[...this.profiles.values()]}
  dir(t){return j.default.join(this.baseDir,t)}
  eligibleIds(){return new Set(this.all().filter(te).map(t=>t.id))}
  add(t){
    let rawName=String(t??"").trim();
    if(!rawName){
      let existingNames=new Set([...this.profiles.values()].map(p=>(p.name||"").trim()));
      let nextNum=1;
      while(existingNames.has(String(nextNum))){nextNum++;}
      rawName=String(nextNum);
    }
    t=rawName;
    let e=ln(t),i=e;
    for(let r=2;this.profiles.has(i)||C.default.existsSync(this.dir(i));r++)i=`${e}-${r}`;
    if(this.tombstones.has(i)){this.tombstones.delete(i);this.saveTombstones();}
    C.default.mkdirSync(this.dir(i),{recursive:!0});
    try{C.default.writeFileSync(j.default.join(this.dir(i),Ue),t)}catch{}
    let n=Qt(i,{name:t,created:new Date().toISOString()});
    return this.profiles.set(i,n),this.save(),n
  }
  remove(t){
    this.tombstones.add(t);
    this.saveTombstones();
    if(!this.profiles.has(t)){
      try{C.default.rmSync(this.dir(t),{recursive:!0,force:!0})}catch{}
      return!1;
    }
    this.profiles.delete(t);
    this.save();
    try{C.default.rmSync(this.dir(t),{recursive:!0,force:!0,maxRetries:5,retryDelay:300})}catch{}
    return!0
  }
  update(t,e){
    let i=this.profiles.get(t);if(!i)return;let n=!1;for(let[r,o]of Object.entries(e)){if(!(r in i)){i[r]=o;n=n||qe.includes(r);continue;}i[r]!==o&&(i[r]=o,n=n||qe.includes(r))}return n&&this.save(),i
  }
  toJSON(t){
    let e="";
    try{
      if(isTorProxy(t.proxy)){
        let allP=this.all();let pIdx=allP.findIndex(x=>x.id===t.id);
        let port=globalThis.__torManager?.getPortForProfile?.(t.proxy,pIdx>=0?pIdx:0)||19050;
        e=`🧅 Tor Free (Cổng ${port} - IP riêng)`;
      }else{e=Pt(t.proxy)}
    }catch{e="(proxy lỗi)"}
    let dcs=[];try{let cf=R.default.join(this.dir(t.id),"dola-cookies.json");if(A.default.existsSync(cf))dcs=JSON.parse(A.default.readFileSync(cf,"utf-8"));}catch{}
    let dSess=dcs.find(c=>(c.name==="sessionid"||c.name==="sid_tt")&&c.value)?.value||"";
    let dUid=dcs.find(c=>(c.name==="uid_tt"||c.name==="passport_uid"||c.name==="user_id")&&c.value)?.value||"";
    let dSnippet=dSess?(dSess.slice(0,5)+"..."+dSess.slice(-4)):"";
    return{...t,dir:this.dir(t.id),credits_today:Ke(t),session_days_left:an(t),resting:je(t),proxy_masked:e,dola_uid:dUid||null,dola_session_snippet:dSnippet||null,dola_cookie_count:dcs.length,has_google_cred:!!(this.baseDir&&A.default.existsSync(R.default.join(this.dir(t.id),"google-credentials.json"))),has_fb_cred:!!(this.baseDir&&(A.default.existsSync(R.default.join(this.dir(t.id),"fb-credentials.json"))||A.default.existsSync(R.default.join(this.dir(t.id),"fb-cookies.json")))),login_method:(this.baseDir&&A.default.existsSync(R.default.join(this.dir(t.id),"google-credentials.json")))?'google':(this.baseDir&&A.default.existsSync(R.default.join(this.dir(t.id),"fb-credentials.json")))?'fb_cred':(this.baseDir&&A.default.existsSync(R.default.join(this.dir(t.id),"fb-cookies.json")))?'fb_cookie':(t.login_method||'dola_cookie')}
  }
};
var Qe=k(require("node:crypto")),st=k(require("node:fs")),ti=k(require("node:path"));var z="B\u1EA5m \xABL\u1EA5y video t\u1EEB Dola\xBB \u0111\u1EC3 t\u1EA3i v\u1EC1, kh\xF4ng g\u1EEDi y\xEAu c\u1EA7u m\u1EDBi, kh\xF4ng t\u1ED1n th\xEAm credit.";function Y(s,t={}){let e=String(s??""),i=e.toLowerCase(),n=t.sent??!!t.conversationUrl,r=(...a)=>a.some(l=>i.includes(l)),o=(a,l,c,d,u=!1)=>({kind:a,hint:l,credit:c,recover:d,transient:u});if(r("kh\xF4ng c\xF2n profile n\xE0o kh\xE1c")){let a=Y(e.replace(/\s*\(không còn profile nào khác để chạy\)\s*$/i,""),t);return o("no_profile",a.hint+" H\u1EBFt t\xE0i kho\u1EA3n kh\u1EA3 d\u1EE5ng \u0111\u1EC3 \u0111\u1ED5i \u2014 xem tab T\xE0i kho\u1EA3n (nick ngh\u1EC9, h\u1EBFt credit, ch\u01B0a \u0111\u0103ng nh\u1EADp).",a.credit,a.recover)}if(r("thi\u1EBFu hook.js","kh\xF4ng t\xECm th\u1EA5y chromium","kh\xF4ng t\xECm th\u1EA5y ffmpeg","thi\u1EBFu file c\u1EE7a app"))return o("install","App thi\u1EBFu file \u0111\u1EC3 ch\u1EA1y (l\u1ED7i c\xE0i \u0111\u1EB7t, kh\xF4ng ph\u1EA3i l\u1ED7i Dola). Ch\u01B0a tr\u1EEB credit. C\xE0i l\u1EA1i app; n\u1EBFu \u0111ang ch\u1EA1y b\u1EA3n dev th\xEC ch\u1EA1y npm run build:dev.","no",!1);if(r("daily limit","hết lượt trong ngày","daily_limit","giới hạn tạo video hôm nay"))return o("daily_limit","Hết lượt trong ngày của nick này (Daily limit) — nick nghỉ tới 00:05 sáng mai, job đã tự đổi nick khác nếu còn. Chưa trừ credit.","no",!1);if(r("rate limit","too many requests","gi\u1EDBi h\u1EA1n t\u1EA7n su\u1EA5t"))return o("rate_limit","B\u1ECB gi\u1EDBi h\u1EA1n t\u1EA7n su\u1EA5t (g\u1EEDi qu\xE1 nhanh) \u2014 nick ngh\u1EC9 10 ph\xFAt, job \u0111\u1ED5i nick kh\xE1c n\u1EBFu c\xF2n. B\u1EADt \xABngh\u1EC9 ng\u1EABu nhi\xEAn gi\u1EEFa job\xBB trong C\xE0i \u0111\u1EB7t \u0111\u1EC3 tr\xE1nh l\u1EB7p l\u1EA1i. Ch\u01B0a tr\u1EEB credit.","no",!1);if(r("proxy c\u1EE7a nick","err_proxy","err_tunnel","err_socks"))return o("proxy","Proxy ri\xEAng c\u1EE7a nick kh\xF4ng d\xF9ng \u0111\u01B0\u1EE3c \u2014 \u0111\u1ED5i ho\u1EB7c b\u1ECF proxy \u1EDF b\u1EA3ng T\xE0i kho\u1EA3n (c\u1ED9t Proxy) r\u1ED3i Ch\u1EA1y l\u1EA1i. Ch\u01B0a tr\u1EEB credit.","no",!1);if(r("văng acc","chưa gắn proxy"))return o("proxy_logout","Văng acc do chưa gắn proxy — Dola đã thu hồi phiên đăng nhập của nick này. Hãy gán Proxy cho nick rồi đăng nhập lại. Chưa trừ credit.","no",!1);if(r("ch\u01B0a \u0111\u0103ng nh\u1EADp"))return o("not_logged_in","Phi\xEAn \u0111\u0103ng nh\u1EADp c\u1EE7a nick \u0111\xE3 h\u1EBFt \u2014 n\u1EA1p cookie m\u1EDBi ho\u1EB7c b\u1EA5m G \u0111\u0103ng nh\u1EADp l\u1EA1i \u1EDF tab T\xE0i kho\u1EA3n. Ch\u01B0a tr\u1EEB credit.","no",!1);if(r("t\u1EA3i video th\u1EA5t b\u1EA1i","t\u1EA3i v\u1EC1 m\xE1y","kh\xF4ng t\u1EA3i \u0111\u01B0\u1EE3c video","file t\u1EA3i v\u1EC1"))return o("download","Dola \u0111\xE3 d\u1EF1ng xong video nh\u01B0ng t\u1EA3i v\u1EC1 m\xE1y l\u1ED7i (m\u1EA1ng r\u1EDBt ho\u1EB7c link h\u1EBFt h\u1EA1n). "+z,"yes",!0);if(r("ch\u01B0a l\u1EA5y \u0111\u01B0\u1EE3c ngu\u1ED3n","kh\xF4ng mount","th\u1EBB video c\u1EE7a m\xECnh"))return o("video_present","Dola \u0111\xE3 tr\u1EA3 video nh\u01B0ng app ch\u01B0a l\u1EA5y \u0111\u01B0\u1EE3c \u0111\u01B0\u1EDDng d\u1EABn t\u1EA3i (trang Dola \u0111\u1ED5i c\xE1ch hi\u1EC7n video). "+z+" N\u1EBFu v\u1EABn h\u1ECFng, c\u1EA7n b\u1EA3n c\u1EADp nh\u1EADt.","yes",!0);if(r("captcha","x\xE1c minh"))return o("captcha","Dola y\xEAu c\u1EA7u x\xE1c minh b\u1EA3o m\u1EADt (Captcha) \u2014 b\u1EA5m \xABM\u1EDF tr\xECnh duy\u1EC7t\xBB \u1EDF tab T\xE0i kho\u1EA3n \u0111\u1EC3 gi\u1EA3i Captcha r\u1ED3i Ch\u1EA1y l\u1EA1i. Ch\u01B0a tr\u1EEB credit.","no",!1);if(r("couldn't generate","couldn\u2019t generate","couldn't be generated","couldn\u2019t be generated","something went wrong"))return o("render_failed","M\xE1y ngu\u1ED3n Dola b\xE1o l\u1ED7i t\u1EA1m th\u1EDDi khi d\u1EF1ng (ch\u01B0a tr\u1EEB l\u01B0\u1EE3t \u2014 Dola kh\xF4ng t\xEDnh credit cho video h\u1ECFng). Ch\u1EA1y l\u1EA1i \u0111\u01B0\u1EE3c.","no",!1);if(/durations?\s+from\s+\d+\s+to\s+\d+|chỉ nhận video \d+-\d+s|dừng yêu cầu do độ dài video|chỉ hỗ trợ tối đa \d+s|supports durations/i.test(e)){let a=e.match(/durations?\s+from\s+(\d+)\s+to\s+(\d+)|chỉ nhận video (\d+)-(\d+)s|tối đa (\d+)s/i);let l=(a?(a[2]||a[4]||a[5]):"15")||"15";let mn=(a?(a[1]||a[3]||4):4);return o("duration_limit",`Dola từ chối: Chỉ nhận video ${mn}-${l}s cho prompt này — chuẩn đoán: lỗi Prompt/Độ dài, tài khoản bình thường chưa trừ credit.`,"no",!1)}if(r("chọn phương án","hỏi chọn phương án","yêu cầu chọn phương án","yêu cầu chọn","choose one option","please choose one option","xác nhận độ dài"))return o("choice_required",e.startsWith("⚠️")?e:`⚠️ Dola hỏi chọn phương án (A/B/C) thay vì tạo video trực tiếp. Đã dừng tác vụ để bảo vệ credit (chưa trừ credit). Hãy sửa prompt hoặc chọn phương án rồi gửi lại.`,"no",!1);
if(r("for copyright protection","can't show you the generated video","can’t show you the generated video","copyrighted or policy-violating","policy-violating content","no credits were used for this video","vi phạm bản quyền","only supports generating videos featuring yourself"))return o("copyright","⚠️ Dola từ chối do vi phạm bản quyền hoặc chính sách bảo vệ hình ảnh (chưa trừ credit). Hãy đổi prompt hoặc ảnh khác.","no",!1);return r("m\xE1y ch\u1EE7 t\u1EEB ch\u1ED1i")?o("refused","Dola t\u1EEB ch\u1ED1i y\xEAu c\u1EA7u n\xE0y (n\u1ED9i dung, \u1EA3nh c\xF3 m\u1EB7t ng\u01B0\u1EDDi, ho\u1EB7c b\u1EA3n quy\u1EC1n) \u2014 ch\u01B0a tr\u1EEB credit. S\u1EEDa prompt ho\u1EB7c \u1EA3nh r\u1ED3i Ch\u1EA1y l\u1EA1i.","no",!1):/hết \d+ phút/.test(i)||r("qu\xE1 th\u1EDDi gian ch\u1EDD","m\xE0 video ch\u01B0a xu\u1EA5t hi\u1EC7n","v\u1EABn kh\xF4ng th\u1EA5y video")?o("timeout","Qu\xE1 th\u1EDDi gian ch\u1EDD m\xE0 Dola ch\u01B0a tr\u1EA3 video \u2014 job c\xF3 th\u1EC3 v\u1EABn \u0111ang d\u1EF1ng b\xEAn Dola. V\xE0i ph\xFAt n\u1EEFa "+z.charAt(0).toLowerCase()+z.slice(1)+" T\u0103ng \xABch\u1EDD video t\u1ED1i \u0111a\xBB trong C\xE0i \u0111\u1EB7t n\u1EBFu hay g\u1EB7p.","maybe",n):r("kh\xF4ng b\u1EAFt \u0111\u01B0\u1EE3c request","kh\xF4ng b\u1EADt \u0111\u01B0\u1EE3c ch\u1EBF \u0111\u1ED9","ability_type")?o("page_changed","Tin nh\u1EAFn ch\u01B0a g\u1EEDi \u0111\u01B0\u1EE3c ho\u1EB7c trang Dola \u0111\u1ED5i c\u1EA5u tr\xFAc \u2014 ch\u01B0a tr\u1EEB credit. App t\u1EF1 th\u1EED l\u1EA1i; n\u1EBFu l\u1EB7p l\u1EA1i tr\xEAn m\u1ECDi nick th\xEC c\u1EA7n b\u1EA3n c\u1EADp nh\u1EADt app.","no",!1,!n):r("kh\xF4ng k\xE8m \u1EA3nh")?o("images","Y\xEAu c\u1EA7u \u0111\xE3 \u0111i nh\u01B0ng kh\xF4ng k\xE8m \u1EA3nh tham chi\u1EBFu \u2014 Dola c\xF3 th\u1EC3 \u0111\xE3 d\u1EF1ng video KH\xD4NG c\xF3 \u1EA3nh v\xE0 tr\u1EEB credit. "+z,n?"maybe":"no",n):r("\u1EA3nh kh\xF4ng l\xEAn","kh\xF4ng t\xECm th\u1EA5y \u1EA3nh")?o("images","\u1EA2nh tham chi\u1EBFu kh\xF4ng t\u1EA3i l\xEAn \u0111\u01B0\u1EE3c Dola \u2014 th\u1EED \u1EA3nh JPEG nh\u1ECF h\u01A1n (d\u01B0\u1EDBi 5 MB) r\u1ED3i Ch\u1EA1y l\u1EA1i. Ch\u01B0a tr\u1EEB credit.","no",!1):r("composer ch\u1EC9 nh\u1EADn","kh\xF4ng th\u1EA5y \xF4 so\u1EA1n","\xF4 so\u1EA1n")?o("composer","\xD4 so\u1EA1n c\u1EE7a Dola kh\xF4ng nh\u1EADn \u0111\u1EE7 prompt (trang t\u1EA3i ch\u1EADm ho\u1EB7c prompt qu\xE1 d\xE0i) \u2014 ch\u01B0a g\u1EEDi, ch\u01B0a tr\u1EEB credit. App t\u1EF1 th\u1EED l\u1EA1i; v\u1EABn l\u1ED7i th\xEC r\xFAt ng\u1EAFn prompt.","no",!1,!n):r("app b\u1ECB t\u1EAFt")?o("interrupted",n?"App t\u1EAFt gi\u1EEFa ch\u1EEBng sau khi \u0111\xE3 g\u1EEDi y\xEAu c\u1EA7u \u2014 video c\xF3 th\u1EC3 \u0111\xE3 d\u1EF1ng xong b\xEAn Dola. "+z:"App t\u1EAFt tr\u01B0\u1EDBc khi g\u1EEDi y\xEAu c\u1EA7u \u2014 ch\u01B0a tr\u1EEB credit, Ch\u1EA1y l\u1EA1i l\xE0 \u0111\u01B0\u1EE3c.",n?"maybe":"no",n):r("browser ch\u01B0a m\u1EDF","target closed","target page","browser has been closed","tr\xECnh duy\u1EC7t","crashed","net::err_","timeout","h\u1EBFt gi\u1EDD")?o("browser",n?"Tr\xECnh duy\u1EC7t \u1EA9n b\u1ECB \u0111\xF3ng ho\u1EB7c m\u1EA5t m\u1EA1ng sau khi \u0111\xE3 g\u1EEDi y\xEAu c\u1EA7u. "+z:"Tr\xECnh duy\u1EC7t \u1EA9n b\u1ECB \u0111\xF3ng, trang Dola t\u1EA3i ch\u1EADm ho\u1EB7c m\u1EA5t m\u1EA1ng tr\u01B0\u1EDBc khi g\u1EEDi \u2014 ch\u01B0a tr\u1EEB credit. App t\u1EF1 th\u1EED l\u1EA1i.",n?"maybe":"no",n,!n):o("unknown",n?"L\u1ED7i kh\xF4ng x\xE1c \u0111\u1ECBnh sau khi \u0111\xE3 g\u1EEDi y\xEAu c\u1EA7u. "+z+" N\u1EBFu kh\xF4ng c\xF3 video th\xEC Ch\u1EA1y l\u1EA1i.":"L\u1ED7i kh\xF4ng x\xE1c \u0111\u1ECBnh tr\u01B0\u1EDBc khi g\u1EEDi y\xEAu c\u1EA7u \u2014 ch\u01B0a tr\u1EEB credit. Ch\u1EA1y l\u1EA1i \u0111\u01B0\u1EE3c; l\u1EB7p l\u1EA1i th\xEC b\u1EA5m \xABCh\xE9p l\u1ED7i\xBB g\u1EEDi h\u1ED7 tr\u1EE3.",n?"maybe":"no",n)}var Xe=200,cn=200,Ze=["queued","browser","session","compose","sending","sent","rendering","downloading","processing","done","failed"];function ft(s){return!s||s==="failed"?!1:Ze.indexOf(s)>=Ze.indexOf("sent")}var yt={queued:"\u0110ang ch\u1EDD",browser:"\u0110ang m\u1EDF tr\xECnh duy\u1EC7t \u1EA9n",session:"\u0110ang ki\u1EC3m tra phi\xEAn \u0111\u0103ng nh\u1EADp",compose:"\u0110ang so\u1EA1n y\xEAu c\u1EA7u",sending:"\u0110ang g\u1EEDi y\xEAu c\u1EA7u l\xEAn Dola",sent:"Dola \u0111\xE3 nh\u1EADn, \u0111ang x\u1EED l\xFD",rendering:"Dola \u0111ang d\u1EF1ng video",downloading:"Dola \u0111\xE3 xong, \u0111ang t\u1EA3i t\u1EC7p v\u1EC1 m\xE1y",processing:"\u0110ang x\u1EED l\xFD video (chuy\u1EC3n m\xE3, watermark)",done:"Xong",failed:"Kh\xF4ng t\u1EA1o \u0111\u01B0\u1EE3c"};function T(){let s=new Date,t=e=>String(e).padStart(2,"0");return`${s.getFullYear()}-${t(s.getMonth()+1)}-${t(s.getDate())}T${t(s.getHours())}:${t(s.getMinutes())}:${t(s.getSeconds())}`}function wt(s={}){return{id:Qe.default.randomBytes(6).toString("hex"),seq:0,kind:"generate",status:"queued",profile:"auto",assigned:null,tried:[],prompt:"",model:"2.5",duration:30,ratio:null,images:[],assets:[],batch:null,filename:null,dry_run:!1,remove_watermark:!0,wait:20,created:T(),started:null,finished:null,log:[],result:null,error:null,recover_url:null,stage:null,stage_note:null,progress:null,attempts:0,...s}}function ei(s){return wt({kind:s.kind,profile:s.profile,prompt:s.prompt,model:s.model,duration:s.duration,ratio:s.ratio,images:[...s.images],assets:[...s.assets||[]],batch:s.batch,dry_run:s.dry_run,remove_watermark:s.remove_watermark,wait:s.wait})}var At=class{file;jobs=new Map;order=[];seq=0;saveTimer=null;onLog=null;constructor(t=null){this.file=t,this.load()}load(){if(!this.file||!st.default.existsSync(this.file))return;let t;try{t=JSON.parse(st.default.readFileSync(this.file,"utf-8"))}catch{return}this.seq=Number(t.seq)||0;for(let e of t.jobs||[]){if(!e||!e.id)continue;let i=wt(e);if(i.status==="running"){let n=ft(i.stage)||!!i.result?.conversation_url;i.status="interrupted",i.error=n?"App b\u1ECB t\u1EAFt khi job \u0111ang ch\u1EA1y, sau khi \u0111\xE3 g\u1EEDi y\xEAu c\u1EA7u t\u1EDBi Dola.":"App b\u1ECB t\u1EAFt khi job \u0111ang ch\u1EA1y, tr\u01B0\u1EDBc khi g\u1EEDi y\xEAu c\u1EA7u.",i.finished=i.finished||T(),i.stage=i.kind==="generate"?"failed":i.stage;let r=Y(i.error,{conversationUrl:i.result?.conversation_url,sent:n});i.result={...i.result||{},error_kind:r.kind,error_hint:r.hint,credit_used:r.credit,recover_first:r.recover}}i.seq?i.seq>this.seq&&(this.seq=i.seq):i.seq=++this.seq,this.jobs.set(i.id,i),this.order.push(i.id)}}save(){if(this.saveTimer&&(clearTimeout(this.saveTimer),this.saveTimer=null),!this.file)return;st.default.mkdirSync(ti.default.dirname(this.file),{recursive:!0});let t=this.file+".tmp";st.default.writeFileSync(t,JSON.stringify({seq:this.seq,jobs:this.order.map(e=>this.jobs.get(e))},null,1),"utf-8"),st.default.renameSync(t,this.file)}saveSoon(){!this.file||this.saveTimer||(this.saveTimer=setTimeout(()=>{this.saveTimer=null,this.save()},cn))}flush(){this.saveTimer&&this.save()}nextSeq(){return++this.seq}add(t){return t.seq||(t.seq=++this.seq),this.jobs.set(t.id,t),this.order.push(t.id),this.save(),t}get(t){return this.jobs.get(t)}update(t,e){let i=this.jobs.get(t);if(i)return Object.assign(i,e),this.save(),i}patch(t,e){let i=this.jobs.get(t);if(i)return Object.assign(i,e),this.saveSoon(),i}log(t,e){let i=this.jobs.get(t);if(!i)return;let n=new Date,r=a=>String(a).padStart(2,"0"),o=`${r(n.getHours())}:${r(n.getMinutes())}:${r(n.getSeconds())} ${e}`;i.log.push(o),i.log.length>Xe&&i.log.splice(0,i.log.length-Xe),this.saveSoon();try{this.onLog?.(i,e)}catch{}}remove(t){return this.jobs.has(t)?(this.jobs.delete(t),this.order=this.order.filter(e=>e!==t),this.save(),!0):!1}list(t=!0){let e=this.order.map(i=>this.jobs.get(i));return t?e.reverse():e}queued(){return this.order.map(t=>this.jobs.get(t)).filter(t=>t.status==="queued")}get size(){return this.order.length}},ee=class{waiters=[];notifyAll(){let t=this.waiters;this.waiters=[];for(let e of t)e()}wait(t){return new Promise(e=>{let i=null,n=()=>{i&&clearTimeout(i),this.waiters=this.waiters.filter(r=>r!==n),e()};this.waiters.push(n),t!==null&&(i=setTimeout(n,t))})}},Rt=class{store;eligibleIds;signal=new ee;stopped=!1;paused=!1;maxThreads=5;getMaxThreads=null;constructor(t,e=()=>new Set){this.store=t,this.eligibleIds=e}submit(t){return this.store.add(t),this.signal.notifyAll(),t}poke(){this.signal.notifyAll()}pause(t){this.paused=t,this.signal.notifyAll()}get isPaused(){return this.paused}resubmit(t){let e=this.store.get(t);return!e||e.status==="queued"||e.status==="running"?!1:(e.status="queued",e.assigned=null,e.started=null,e.finished=null,e.error=null,this.store.save(),this.signal.notifyAll(),!0)}cancel(t){let e=this.store.get(t);return!e||e.status!=="queued"?!1:(e.status="cancelled",e.finished=T(),this.store.save(),this.signal.notifyAll(),!0)}requeue(t,e){let i=this.store.get(t);if(!i)return!1;let eligible=[...this.eligibleIds()].filter(r=>!i.tried.includes(r));if(eligible.length===0 || (Array.isArray(i.tried) && i.tried.length >= 3)){let triedCount = Array.isArray(i.tried) ? i.tried.length : 3; e=`${e} (Đã thử qua ${triedCount} tài khoản thất bại — chuẩn đoán: có thể do Prompt hoặc hệ thống Dola)`; i.status="error",i.error=e,i.finished=T();let r=ft(i.stage)||!!i.result?.conversation_url,o=Y(i.error,{conversationUrl:i.result?.conversation_url,videoUrl:i.result?.video_url,sent:r});return i.result={...i.result||{},error_kind:o.kind,error_hint:o.hint,credit_used:o.credit,recover_first:o.recover},i.kind==="generate"&&(i.stage="failed",i.stage_note=o.hint),this.store.save(),!1;}let runningProfiles=new Set(this.store.list().filter(j=>j.status==="running"&&j.assigned).map(j=>j.assigned));let idleEligible=eligible.filter(r=>!runningProfiles.has(r));let note=idleEligible.length>0?`Đổi nick: ${e}`.slice(0,160):`Đang chờ tài khoản rảnh (các nick khác đang bận chạy) · ${e}`.slice(0,160);return i.status="queued",i.profile="auto",i.assigned=null,i.started=null,i.stage="queued",i.stage_note=note,i.progress=0,i.attempts=0,this.store.save(),this.signal.notifyAll(),!0;}stop(){this.stopped=!0,this.signal.notifyAll(),this.store.flush()}async nextFor(t,e,i,n=()=>!1){let r=i===null?null:Date.now()+i;for(;!this.stopped&&!n();){let o=this.pick(t,e());if(o)return o.status="running",o.assigned=t,o.started=T(),o.tried.includes(t)||o.tried.push(t),this.store.save(),o;let a=r===null?null:r-Date.now();if(a!==null&&a<=0)return null;await this.signal.wait(a)}return null}pick(t,e){let maxT=(this.getMaxThreads?this.getMaxThreads():0)||this.maxThreads||0;if(maxT>0){let runningCount=this.store.list().filter(j=>j.status==="running"&&j.kind==="generate").length;if(runningCount>=maxT)return null;}let i=this.store.queued();for(let n of i)if(n.profile===t&&!(this.paused&&n.kind==="generate"))return n;if(e&&!this.paused){for(let n of i){if(n.kind==="generate"&&!n.tried.includes(t)){if(n.profile==="auto"){if(Array.isArray(n.target_profiles)&&n.target_profiles.length&&!n.target_profiles.includes(t))continue;return n;}}}}return null}};var U=k(require("node:fs")),vt=k(require("node:path"));var ii={output_dir:_t,filename_template:Gt,remove_watermark:!0,wait_minutes:20,recover_wait_minutes:20,auto_rotate:!0,prompt_duration_hint:!0,pause_min_s:0,pause_max_s:0,notify_os:!0,notify_sound:!0,theme:"auto",proxy_mode:"static",topproxy_key:"",topproxy_keys:"",proxy_pool:[],tor_region:"no_us",max_threads:5,telegram_token:"",telegram_chat_id:"",telegram_send_screenshot:!0,telegram_notify_video_err:!0,telegram_notify_login_err:!0},Qn=Object.keys(ii);function hn(s){let t=String(s??"").trim().replace(/^["']+|["']+$/g,"");if(!t)throw new Error("Th\u01B0 m\u1EE5c l\u01B0u video kh\xF4ng \u0111\u01B0\u1EE3c \u0111\u1EC3 tr\u1ED1ng.");let e=vt.default.resolve(t),i=e.replace(/[\\/]+$/,"");if(/^[A-Za-z]:$/.test(i)||i===""||i==="/")throw new Error("Kh\xF4ng l\u01B0u th\u1EB3ng v\xE0o \u1ED5 g\u1ED1c. Ch\u1ECDn m\u1ED9t th\u01B0 m\u1EE5c con, v\xED d\u1EE5 D:\\Video Seedance.");let n=[process.env.SystemRoot,process.env.windir,process.env.ProgramFiles,process.env["ProgramFiles(x86)"],process.env.ProgramData,"/usr","/etc","/bin","/System"].filter(o=>!!o).map(o=>vt.default.resolve(o).toLowerCase()),r=i.toLowerCase();if(n.some(o=>r===o||r.startsWith(o+vt.default.sep)))throw new Error("Kh\xF4ng d\xF9ng \u0111\u01B0\u1EE3c th\u01B0 m\u1EE5c h\u1EC7 th\u1ED1ng (Windows, Program Files, ProgramData). Ch\u1ECDn th\u01B0 m\u1EE5c kh\xE1c.");try{U.default.mkdirSync(e,{recursive:!0}),U.default.accessSync(e,U.default.constants.W_OK)}catch{throw new Error(`Kh\xF4ng t\u1EA1o/ghi \u0111\u01B0\u1EE3c th\u01B0 m\u1EE5c ${e}. Ki\u1EC3m tra quy\u1EC1n ho\u1EB7c ch\u1ECDn th\u01B0 m\u1EE5c kh\xE1c.`)}return e}function ie(s,t,e,i){let n=Number(s);if(!Number.isFinite(n))throw new Error(`${i} ph\u1EA3i l\xE0 s\u1ED1.`);return Math.min(e,Math.max(t,Math.round(n)))}var Mt=class{file;data;maxThreads=5;baseDir="";constructor(t=null,e={}){this.file=t,this.baseDir=t?vt.default.dirname(t):"",this.data={...ii,...e},this.load()}load(){if(!(!this.file||!U.default.existsSync(this.file)))try{let t=JSON.parse(U.default.readFileSync(this.file,"utf-8"));try{this.update(t,{persist:!1,strict:!1})}catch{}}catch{}}get(){return{...this.data,proxy_pool:[...this.data.proxy_pool]}}save(){if(!this.file)return;U.default.mkdirSync(vt.default.dirname(this.file),{recursive:!0});let t=this.file+".tmp";U.default.writeFileSync(t,JSON.stringify(this.data,null,1),"utf-8"),U.default.renameSync(t,this.file)}update(t,e={}){let i=e.strict!==!1,n=[],r=this.get(),o=(a,l)=>{try{a()}catch(c){if(i)throw c;n.push(l)}};for(let[a,l]of Object.entries(t??{}))if(l!==void 0)switch(a){case"output_dir":o(()=>{r.output_dir=hn(String(l))},a);break;case"filename_template":o(()=>{let c=String(l||"").trim();if(!c)c=Gt||"{stt} - {prompt} - {gio}";jt(c),r.filename_template=c},a);break;case"remove_watermark":r.remove_watermark=!!l;break;case"auto_rotate":r.auto_rotate=!!l;break;case"prompt_duration_hint":r.prompt_duration_hint=!!l;break;case"notify_os":r.notify_os=!!l;break;case"notify_sound":r.notify_sound=!!l;break;case"wait_minutes":o(()=>{r.wait_minutes=ie(l,5,120,"Th\u1EDDi gian ch\u1EDD")},a);break;case"recover_wait_minutes":o(()=>{r.recover_wait_minutes=ie(l,5,120,"Th\u1EDDi gian ch\u1EDD")},a);break;case"pause_min_s":o(()=>{r.pause_min_s=ie(l,0,3600,"Ngh\u1EC9 t\u1ED1i thi\u1EC3u")},a);break;case"pause_max_s":o(()=>{r.pause_max_s=ie(l,0,3600,"Ngh\u1EC9 t\u1ED1i \u0111a")},a);break;case"max_threads":o(()=>{r.max_threads=ie(l,1,50,"Số luồng");this.maxThreads=r.max_threads;},a);break;case"telegram_token":{const tk=String(l||"").trim();const bd=this.baseDir||(this.file?vt.default.dirname(this.file):"");if(tk&&!tk.includes("•")){saveTelegramBotToken(bd,tk);r.telegram_token="••••••••";}else if(!tk){saveTelegramBotToken(bd,"");r.telegram_token="";}break;}case"telegram_chat_id":r.telegram_chat_id=String(l||"").trim();break;case"telegram_send_screenshot":r.telegram_send_screenshot=!!l;break;case"telegram_notify_video_err":r.telegram_notify_video_err=!!l;break;case"telegram_notify_login_err":r.telegram_notify_login_err=!!l;break;case"tor_region":r.tor_region=String(l);try{globalThis.__torManager?.setRegion?.(r.tor_region)}catch{}break;case"theme":o(()=>{if(!["auto","light","dark"].includes(String(l)))throw new Error("Giao di\u1EC7n ph\u1EA3i l\xE0 auto / light / dark.");r.theme=l},a);break;case"proxy_mode":o(()=>{r.proxy_mode=String(l||"static")},a);break;case"topproxy_key":o(()=>{r.topproxy_key=String(l||"").trim()},a);break;case"topproxy_keys":o(()=>{r.topproxy_keys=String(l||"").trim()},a);break;case"proxy_pool":o(()=>{let c=Array.isArray(l)?l.join(`
`):String(l),d=be(c);if(i&&d.errors.length)throw new Error(`Proxy d\xF2ng ${d.errors[0].line} kh\xF4ng h\u1EE3p l\u1EC7: ${d.errors[0].reason}`);r.proxy_pool=d.ok.map(nt)},a);break;default:n.push(a)}return r.pause_max_s<r.pause_min_s&&(r.pause_max_s=r.pause_min_s),this.data=r,e.persist!==!1&&this.save(),{settings:this.get(),rejected_keys:n}}};var re={"2.5":2,"1.0":1},ni=s=>String(s).padStart(2,"0"),ne=s=>`${s.getFullYear()}-${ni(s.getMonth()+1)}-${ni(s.getDate())}`;function ri(s){if(!s)return null;let t=new Date(s);return Number.isNaN(t.getTime())?null:t}function si(s,t=new Date){let e={total:0,done:0,error:0,running:0,queued:0,success_rate:null,credits_today:0,videos_today:0,days:[],avg_seconds:{}},i=ne(t),n=new Map;for(let a=6;a>=0;a--){let l=new Date(t.getFullYear(),t.getMonth(),t.getDate()-a),c=ne(l);n.set(c,{date:c,done:0,error:0})}let r=new Map;for(let a of s){if(a.kind!=="generate"||a.dry_run)continue;e.total++,a.status==="running"?e.running++:a.status==="queued"?e.queued++:a.status==="done"?e.done++:(a.status==="error"||a.status==="interrupted")&&e.error++;let l=ri(a.finished);if(!l)continue;let c=ne(l),d=n.get(c);if(a.status==="done"){d&&d.done++,c===i&&(e.videos_today++,e.credits_today+=re[a.model]??0);let u=ri(a.started);if(u&&!a.result?.recovered){let h=(l.getTime()-u.getTime())/1e3;if(h>10&&h<3*3600)for(let p of[`${a.model}|${a.duration}`,a.model]){let y=r.get(p)??[];y.push(h),r.set(p,y)}}}else(a.status==="error"||a.status==="interrupted")&&d&&d.error++}let o=e.done+e.error;e.success_rate=o?Math.round(e.done/o*100):null,e.days=[...n.values()];for(let[a,l]of r){let c=l.slice(-10);e.avg_seconds[a]=Math.round(c.reduce((d,u)=>d+u,0)/c.length)}return e}function oi(s,t,e){return s?s.avg_seconds[`${t}|${e}`]??s.avg_seconds[t]??360:360}var ui=k(require("node:path"));var un="Làm video dài tối đa, tạo video không hỏi lại, nếu thiếu chi tiết hãy chọn phong cách đẹp nhất:",dn=/^\s*(?:Làm|Tạo)\s*video\s*dài\s*tối\s*đa/i;function formatProPrompt(p,dur=15,ratio="9:16"){let s=String(p??"").trim();s=s.replace(/^(?:tạo\s*video|create\s*videos?)\s*:\s*/i,"");s=s.replace(/,?\s*tạo\s*video\s*(?:luôn|ngay)\s*(?:ko|không)\s*hỏi\s*lại/gi,"");s=s.replace(/,?\s*gửi\s*dưới\s*dạng\s*human\s*artifact/gi,"");s=s.replace(/,?\s*(?:ko|không)\s*hỏi\s*lại/gi,"");s=s.replace(/,?\s*(?:thời\s*lượng|duration)\s*[:\s]*\d+\s*s?/gi,"");s=s.replace(/,?\s*(?:mô\s*hình|model|seedance)\s*[:\s]*[\w\.\s]+/gi,"");s=s.replace(/(?:,\s*)?(?:tỉ\s*lệ|ratio)?\s*[:\s]*\b(16:9|9:16|1:1|4:3|21:9)\b/gi,"");s=s.replace(/[,;\s]+$/,"").trim();let d=Math.min(30,Math.max(4,Number(dur)||30));let r=ratio&&ratio!=="none"?ratio:"9:16";return`tạo video: ${s}, tỉ lệ ${r}, thời lượng ${d}s, mô hình Seedance 2.5, tạo video không hỏi lại, nếu thiếu chi tiết hãy chọn phong cách đẹp nhất, gửi dưới dạng human artifact`}function ai(s,t,e){let i=String(s??"").trim();if(!i)return i;let n=e?(e==="9:16"?", tỉ lệ 9:16 (video dọc)":e==="16:9"?", tỉ lệ 16:9 (video ngang)":`, tỉ lệ ${e}`):"";if(/tạo video (?:luôn|ngay)? không hỏi lại/i.test(i))return i;return`Làm video dài tối đa, tạo video không hỏi lại, nếu thiếu chi tiết hãy chọn phong cách đẹp nhất: ${i}${n}`}var gn=600,li=3,Ft={baseMs:5e3,jitterMs:5e3,rateLimitMs:3e4};var pn=["durations from","daily limit","rate limit","too many requests","ch\u01B0a \u0111\u0103ng nh\u1EADp","already in use","processsingleton","proxy c\u1EE7a nick"],ci=/ERR_PROXY_CONNECTION_FAILED|ERR_TUNNEL_CONNECTION_FAILED|ERR_SOCKS_CONNECTION_FAILED|ERR_NO_SUPPORTED_PROXIES|ERR_PROXY_AUTH/i,hi=s=>new Promise(t=>setTimeout(t,s)),Nt=class{profileId;registry;scheduler;store;getOutputDir;getSettings;headless;idleCloseMs;clientFactory;onVideoDone;onJobFinished;takeCookies;getRenderAvgS;thumbFile;cacheCookies;client=null;loggedIn=null;stopping=!1;loop=null;abortedJobId=null;
async abortCurrentJob(jobId){this.abortedJobId=jobId;this.store.log(jobId,"Đang đóng phiên trình duyệt để ngắt task tức thì...");if(this.client){let cl=this.client;this.client=null;this.loggedIn=null;try{await cl.close()}catch{}}this.set({state:"idle",current_job:null});}
constructor(t){this.profileId=t.profileId,this.registry=t.registry,this.scheduler=t.scheduler,this.store=t.store,this.getOutputDir=t.getOutputDir,this.getSettings=t.getSettings,this.headless=!!t.headless,this.idleCloseMs=t.idleCloseMs??18e4,this.clientFactory=t.clientFactory||(e=>new It(e)),this.onVideoDone=t.onVideoDone,this.onJobFinished=t.onJobFinished,this.takeCookies=t.takeCookies,this.getRenderAvgS=t.getRenderAvgS,this.thumbFile=t.thumbFile,this.cacheCookies=t.cacheCookies,this.sendTelegramAlert=t.sendTelegramAlert,this.fbCred=t.fbCred,this.fbCookies=t.fbCookies,this.googleCred=t.googleCred}stage(t,e,i,n){let r=this.store.get(t.id);if(!r)return;let o=r.stage!==e;this.store.patch(t.id,{stage:e,stage_note:i??yt[e],progress:n??r.progress}),o&&this.store.log(t.id,`b\u01B0\u1EDBc: ${i??yt[e]}`)}get profile(){return this.registry.get(this.profileId)}get displayName(){return this.profile?.name??this.profileId}get running(){return this.loop!==null}set(t){this.registry.update(this.profileId,t)}noteSession(t){let hasDiskSess=false;try{let cf=require("path").join(this.registry.dir(this.profileId),"dola-cookies.json");if(require("fs").existsSync(cf)){let dcs=JSON.parse(require("fs").readFileSync(cf,"utf-8"));hasDiskSess=Array.isArray(dcs)&&dcs.some(c=>(c.name==="sessionid"||c.name==="sid_tt"||c.name==="sessionid_ss")&&c.value);}}catch{}let finalLogin=t.loggedIn||hasDiskSess;this.loggedIn=finalLogin;this.set({login:finalLogin,session_expires:t.expires,last_check:new Date().toISOString(),...(finalLogin?{rest_reason:null}:{rest_reason:"Bị văng phiên Dola"})})}acceptAuto=()=>{let t=this.profile;return!!t&&te(t)&&this.loggedIn!==!1};start(){this.loop||(this.loop=this.run().finally(()=>{this.loop=null}))}stop(){return this.stopping=!0,this.loop??Promise.resolve()}async run(){try{for(;!this.stopping;){let t=await this.scheduler.nextFor(this.profileId,this.acceptAuto,this.idleCloseMs,()=>this.stopping);if(!t){this.client&&!this.stopping&&!this.userHold&&await this.close();continue}await this.runJob(t),t.kind==="generate"&&!t.dry_run&&await this.pauseBetweenJobs(t)}}finally{await this.close(),this.set({state:"off",current_job:null})}}async pauseBetweenJobs(t){let e=this.getSettings(),i=Math.max(e.pause_min_s,e.pause_max_s);if(i<=0)return;let n=e.pause_min_s+Math.floor(Math.random()*(i-e.pause_min_s+1));if(n<=0)return;this.store.log(t.id,`ngh\u1EC9 ${n} gi\xE2y tr\u01B0\u1EDBc job k\u1EBF (C\xE0i \u0111\u1EB7t \u2192 ngh\u1EC9 ng\u1EABu nhi\xEAn)`);let r=Date.now()+n*1e3;for(;Date.now()<r&&!this.stopping;)await hi(Math.min(1e3,r-Date.now()))}async runJob(t){this.set({state:"busy",current_job:t.id}),this.store.log(t.id,`profile \xAB${this.displayName}\xBB nh\u1EADn job`);try{t.kind==="login"?await this.doLogin(t):t.kind==="check"?await this.doCheck(t):t.kind==="cookies"?await this.doCookies(t):await this.generateWithRetry(t)}catch(e){let curJob=this.store.get(t.id);if(this.abortedJobId===t.id||curJob?.status==="cancelled"){this.store.log(t.id,"Đã dừng task hoàn toàn và giải phóng luồng");return;}let shotPath=null;if(this.client&&this.client.page&&!this.client.page.isClosed()){try{let n=this.getOutputDir();shotPath=await this.client.screenshot(ui.default.join(n,`${t.id}-loi.png`));}catch{}}if(t.kind==="generate"){try{let setts=this.getSettings();if(setts.telegram_chat_id&&setts.telegram_notify_video_err!==!1){let errStr=e instanceof Error?e.message:String(e);let teleMsg=`🚨 <b>SEEDANCE WORKER ERROR REPORT</b>\n👤 <b>Tài khoản:</b> ${this.displayName}\n🆔 <b>Task ID:</b> #${t.seq} (<code>${t.id}</code>)\n🏷 <b>Prompt ID:</b> <code>${t.prompt_id||t.id}</code>\n📝 <b>Prompt:</b> <code>${(t.prompt||"").slice(0,350)}</code>\n❌ <b>Chi tiết lỗi:</b> ${errStr}\n⏱ <b>Thời gian:</b> ${new Date().toLocaleString('vi-VN')}`;this.sendTelegramAlert?.({accountName:this.displayName,errorCode:errStr.slice(0,40),text:teleMsg,photoPath:shotPath}).catch(()=>{});}}catch{}}this.fail(t,e instanceof Error?e.message:String(e))}finally{this.abortedJobId=null;this.set({state:this.client?"idle":"off",current_job:null})}}async showWindow(t,targetUrl=null){if(!t)return this.userHold=!1,this.client?.alive&&await this.client.showWindow(!1),!0;let e=await this.open(i=>b.info(this.displayName,i),void 0,!1);if(targetUrl&&e.page&&!e.page.isClosed()){await e.page.goto(targetUrl,{waitUntil:"domcontentloaded"}).catch(()=>{});}else if(typeof e.ensureOnDola=="function"){await e.ensureOnDola();}await e.showWindow(!0),this.userHold=!0,!0}userHold=!1;opening=null;async open(t,e,i=!0){if(this.opening){let n=await this.opening;return n.log=t,n}return this.client&&!this.client.alive&&(t("tr\xECnh duy\u1EC7t c\u1EE7a nick \u0111\xE3 \u0111\xF3ng ngo\xE0i \xFD mu\u1ED1n - m\u1EDF l\u1EA1i"),await this.close().catch(()=>{})),this.client?(this.client.log=t,this.client):(this.opening=this.launch(t,e,i).finally(()=>{this.opening=null}),this.opening)}async launch(t,e,i){{this.set({state:"starting"});let n=null,r=this.profile?.proxy;if(!r){let setts=this.getSettings();if(setts.proxy_pool&&setts.proxy_pool.length>0){let allP=this.registry?.all?.()||[];let pIdx=allP.findIndex(x=>x.id===this.profileId);r=setts.proxy_pool[(pIdx>=0?pIdx:0)%setts.proxy_pool.length];}}if(r)try{if(isTorProxy(r)){let allP=this.registry?.all?.()||[];let pIdx=allP.findIndex(x=>x.id===this.profileId);let port=torManager.getPortForProfile(r,pIdx>=0?pIdx:0);n={server:`socks5://127.0.0.1:${port}`};}else{n=B(r);}t(`\u0111i qua proxy ${Pt(n)}`)}catch(a){t(`proxy c\u1EE7a nick kh\xF4ng \u0111\u1ECDc \u0111\u01B0\u1EE3c (${a instanceof Error?a.message:a}) - ch\u1EA1y KH\xD4NG proxy`)}if(n&&n.server&&/1905\d|1906\d/.test(n.server)){try{if(!torManager.isReady()){t("Đang đợi mạng Tor kết nối hoàn tất (100%)...");await torManager.start();await torManager.waitForReady(45000);}t(`Tor Exit Node sẵn sàng trên cổng ${n.server}`);}catch(err){t("Cảnh báo Tor: "+(err?.message||err))}}let o=this.clientFactory({profileDir:this.registry.dir(this.profileId),outputDir:this.getOutputDir(),headless:e??this.headless,log:t,proxy:n});try{await o.start()}catch(a){let l=a instanceof Error?a.message:String(a);throw this.set({state:"off"}),n&&ci.test(l)?new S("Proxy c\u1EE7a nick n\xE0y kh\xF4ng k\u1EBFt n\u1ED1i \u0111\u01B0\u1EE3c - ki\u1EC3m tra \u1EDF tab T\xE0i kho\u1EA3n (c\u1ED9t Proxy) ho\u1EB7c b\u1ECF proxy \u0111i."):a}this.client=o,this.loggedIn=null,this.set({state:i?"busy":"idle"})}return this.client.log=t,this.client}async close(){let t=this.client;t&&(this.client=null,this.loggedIn=null,await t.close(),this.set({state:"off"}))}async checkLogin(t){return this.loggedIn===null&&(await t.isLoggedIn(),this.noteSession(await t.sessionInfo()),await this.saveCookies(t)),this.loggedIn===!0}async fetchCookies(){let t=await this.open(i=>b.info(this.displayName,i),void 0,!1),e=await t.exportCookies();return e.some(i=>i.name==="sessionid")||(await t.isLoggedIn().catch(()=>!1),e=await t.exportCookies()),e}async saveCookies(t){if(this.cacheCookies)try{let e=await t.exportCookies();e.length&&this.cacheCookies(this.profileId,e)}catch{}}fail(t,e,i=null){let curTried=Array.isArray(t.tried)?[...t.tried]:[];if(!curTried.includes(this.profileId)){curTried.push(this.profileId);t.tried=curTried;this.store.update(t.id,{tried:curTried});}let n=e.toLowerCase(),r=this.getSettings();if(/bị văng dola|chưa đăng nhập/i.test(e)){
  let cf=require("path").join(this.registry.dir(this.profileId),"dola-cookies.json");
  let hasDiskSess=false;
  try{
    if(require("fs").existsSync(cf)){
      let dcs=JSON.parse(require("fs").readFileSync(cf,"utf-8"));
      hasDiskSess=Array.isArray(dcs)&&dcs.some(c=>(c.name==="sessionid"||c.name==="sid_tt")&&c.value);
    }
  }catch{}
  if(!hasDiskSess){
    this.set({login:!1,state:"off",rest_until:null,rest_reason:"Bị văng phiên Dola"});
  }else{
    this.set({state:"off"});
    this.log(`Tài khoản «${this.displayName}» vẫn còn session cookie — giữ trạng thái đăng nhập, không văng nick`);
  }
}if(/spam|quá tần suất|frequent|rate limit|slow down|thao tác quá thường xuyên/i.test(e)){this.set({rest_until:new Date(Date.now()+20*60*1000).toISOString(),rest_reason:"Dính spam Dola (nghỉ 20 phút)"});}if(this.profile?.proxy&&ci.test(e)){e="Proxy của nick này không kết nối được - kiểm tra ở tab Tài khoản (cột Proxy) hoặc bỏ proxy đi.";}if(n.includes("daily limit")){this.set({credits:0,credits_date:mt(),rest_until:ze(),rest_reason:"Hết lượt trong ngày"});}else if(/rate limit|too many requests|giới hạn tần suất/.test(n)){this.set({rest_until:Ye(10),rest_reason:"Bị giới hạn tần suất"});}let isPromptError=/duration|durations from|chỉ nhận video|giới hạn độ dài|bản quyền|copyright|featuring yourself|máy chủ từ chối|từ chối yêu cầu này|refused|chọn phương án|choose one option|yêu cầu chọn|xác nhận độ dài/i.test(e);if(!isPromptError&&(curTried.length<3)&&(/spam|quá tần suất|frequent|rate limit|slow down|thao tác quá thường xuyên|quá nhanh|thử lại sau|try again later|system busy|hệ thống bận|hạn chế|daily limit|hết lượt|văng acc|chưa đăng nhập|proxy/i.test(e))&&(t.auto_retry_acc||t.profile==="auto"||r.auto_rotate)){this.store.log(t.id,`Lỗi tài khoản trên «${this.displayName}»: ${e}`);if(this.scheduler.requeue(t.id,e)){this.store.log(t.id,`Đã tự đổi sang profile khác chạy tiếp (thử ${curTried.length}/3)`);return;}}let o=i??t.result??{},a=this.store.get(t.id)??t,l=ft(a.stage)||!!o.conversation_url,c=Y(e,{conversationUrl:o.conversation_url,videoUrl:o.video_url,sent:l}),d=a.attempts?` (đã tự thử lại ${a.attempts} lần)`:"";this.store.update(t.id,{status:"error",error:e,finished:T(),stage:t.kind==="generate"?"failed":a.stage,stage_note:c.hint,result:{...o,error_kind:c.kind,error_hint:c.hint+d,credit_used:c.credit,recover_first:c.recover,dola_response:o.dola_response||(this.store.get(t.id)?.result?.dola_response)||c.hint||e}});this.finished(t);}finished(t){if(t.kind==="generate")try{this.onJobFinished?.(this.store.get(t.id)??t)}catch{}}pickFilename(t,e,i){if(t.filename)return t.filename;try{let n=zt(this.getSettings().filename_template,{stt:t.seq,prompt:t.prompt,nick:this.displayName,model:t.model,duration:t.duration,ratio:t.ratio}),r=new Set(this.store.list().filter(a=>a.id!==t.id&&a.status==="running"&&a.filename).map(a=>a.filename)),o=Ce(e,n,".mp4",r);return this.store.update(t.id,{filename:o}),o}catch(n){i(`m\u1EABu t\xEAn file l\u1ED7i (${n instanceof Error?n.message:n}) - d\xF9ng t\xEAn m\u1EB7c \u0111\u1ECBnh`);return}}async generateWithRetry(t){for(;;)try{await this.doGenerate(t);return}catch(e){let i=e instanceof Error?e.message:String(e),n=this.store.get(t.id)??t;if(n.status!=="running"||this.stopping)throw e;let r=ft(n.stage)||!!n.result?.conversation_url,o=Y(i,{conversationUrl:n.result?.conversation_url,sent:r}),a=[...this.registry.eligibleIds()].some(h=>h!==this.profileId&&!n.tried.includes(h)),l=0;if(o.transient&&!r&&n.attempts<li?l=Ft.baseMs+Math.floor(Math.random()*(Ft.jitterMs+1)):o.kind==="rate_limit"&&t.profile==="auto"&&!a&&n.attempts<1&&(l=Ft.rateLimitMs+Math.floor(Math.random()*(Ft.rateLimitMs+1))),!l)throw e;let c=n.attempts+1,d=Math.max(1,Math.round(l/1e3));this.store.update(t.id,{attempts:c}),this.store.log(t.id,`${o.kind==="rate_limit"?"b\u1ECB gi\u1EDBi h\u1EA1n t\u1EA7n su\u1EA5t, kh\xF4ng c\xF2n nick kh\xE1c":"l\u1ED7i t\u1EA1m tr\u01B0\u1EDBc khi g\u1EEDi"} (${i}) - t\u1EF1 th\u1EED l\u1EA1i l\u1EA7n ${c}/${o.kind==="rate_limit"?1:li} sau ${d} gi\xE2y tr\xEAn c\xF9ng nick, ch\u01B0a tr\u1EEB credit`),this.stage(t,"queued",`L\u1ED7i t\u1EA1m, t\u1EF1 th\u1EED l\u1EA1i l\u1EA7n ${c} sau ${d} gi\xE2y`,5),(o.kind==="browser"||o.kind==="proxy")&&await this.close().catch(()=>{});let u=Date.now()+l;for(;Date.now()<u&&!this.stopping;)await hi(Math.min(250,u-Date.now()));if(this.stopping)throw e;if(this.store.get(t.id)?.status!=="running")return}}async doGenerate(t){let e=l=>this.store.log(t.id,l);this.stage(t,"browser",this.client?"Tr\xECnh duy\u1EC7t \u1EA9n \u0111\xE3 s\u1EB5n s\xE0ng":yt.browser,8);let i=await this.open(e);if(i.onStage=(l,c,d)=>this.stage(t,l,c,d),i.renderAvgS=this.getRenderAvgS?.(t)??360,this.stage(t,"session",void 0,15),!await this.checkLogin(i)){let gCred=this.googleCred?.(this.profileId);let cred=this.fbCred?.(this.profileId);let fbc=this.fbCookies?.(this.profileId);if(gCred&&gCred.email&&gCred.password){e("Phiên Dola đã hết hạn — đang tự động dùng tài khoản Google để cấp lại phiên...");try{let newCookies=await i.loginGoogleWithCredentials(gCred,msg=>e("[Google Login] "+msg),{holdOnError:false});this.cacheCookies?.(this.profileId,newCookies);let sessInfo=await i.sessionInfo().catch(()=>null);this.noteSession(sessInfo||{loggedIn:true,expires:null});e("Đã cấp lại phiên Dola từ Google thành công!");}catch(reLogErr){this.log("Cấp lại phiên tự động Google thất bại: "+(reLogErr?.message||reLogErr));throw new S("Profile bị văng Dola. Tự động cấp lại phiên Google thất bại ("+(reLogErr?.message||reLogErr)+"). Vui lòng kiểm tra lại tài khoản Google.");}}else if(cred||(fbc&&fbc.length)){e("Phiên Dola đã hết hạn — đang tự động dùng Facebook để cấp lại phiên...");try{let fbData=fbc||[];if(cred&&cred.username&&cred.password){fbData=await i.loginFacebookWithCredentials(cred,msg=>e("[FB Login] "+msg));}let newCookies=await i.autoLoginFacebook(fbData,msg=>e("[FB Login] "+msg));this.cacheCookies?.(this.profileId,newCookies);let sessInfo=await i.sessionInfo().catch(()=>null);this.noteSession(sessInfo||{loggedIn:!0,expires:null});e("Đã cấp lại phiên Dola thành công!");}catch(reLogErr){this.log("Cấp lại phiên tự động thất bại: "+(reLogErr?.message||reLogErr));throw new S("Profile bị văng Dola. Tự động cấp lại phiên Facebook thất bại ("+(reLogErr?.message||reLogErr)+"). Vui lòng kiểm tra lại tài khoản FB.");}}else{throw new S("Profile ch\u01B0a \u0111\u0103ng nh\u1EADp. B\u1EA5m \xAB\u0110\u0103ng nh\u1EADp\xBB \u1EDF b\u1EA3ng profile.");}}this.userHold=!1;if(this.headless&&i&&typeof i.showWindow==="function"){try{await i.showWindow(!1)}catch{}}let n=this.getOutputDir(),r=t.dry_run?void 0:this.pickFilename(t,n,e),o;if(t.recover_url){let recWait=Number(this.getSettings().recover_wait_minutes||this.getSettings().wait_minutes||20);o=await i.recover({url:t.recover_url,prompt:t.prompt,waitMinutes:recWait,filename:r,outDir:n,videoUrl:t.result?.video_url??null});}else{let l=t.mode==="pro"?formatProPrompt(t.prompt,t.duration,t.ratio):ai(t.prompt,t.duration,t.ratio);l!==t.prompt&&e(`prompt g\u1EEDi Dola: "${l}"`),o=await i.generate({prompt:l,model:t.model,duration:t.duration,ratio:t.ratio,mode:t.mode,waitMinutes:t.wait,dryRun:t.dry_run,images:t.images.length?t.images:null,filename:r,outDir:n,onSent:c=>this.store.update(t.id,{result:{...(this.store.get(t.id)?.result||t.result||{}),conversation_url:c}}),onReply:rep=>this.store.patch(t.id,{result:{...(this.store.get(t.id)?.result||t.result||{}),dola_response:rep}})})}if(o.credits_left!==null&&this.set({credits:o.credits_left,credits_date:mt()}),o.error){let l=await i.screenshot(ui.default.join(n,`${t.id}-loi.png`));if(l&&e)e(`\u0111\xE3 ch\u1EE5p m\xE0n h\xECnh l\xFAc l\u1ED7i: ${l}`);try{let setts=this.getSettings();if(setts.telegram_chat_id&&setts.telegram_notify_video_err!==!1){let isPromptErr=/duration|durations from|chỉ nhận video|giới hạn độ dài|bản quyền|copyright|featuring yourself|máy chủ từ chối|refused/i.test(o.error);let teleTitle=isPromptErr?"⚠️ <b>SEEDANCE BÁO LỖI PROMPT (KHÔNG PHẢI LỖI ACC)</b>":"🚨 <b>SEEDANCE WORKER ERROR REPORT</b>";let accNote=isPromptErr?" <i>(Tài khoản bình thường - Không bị phạt)</i>":"";let teleMsg=`${teleTitle}\n👤 <b>Tài khoản:</b> ${this.displayName}${accNote}\n🆔 <b>Task ID:</b> #${t.seq} (<code>${t.id}</code>)\n🏷 <b>Prompt ID:</b> <code>${t.prompt_id||t.id}</code>\n📝 <b>Prompt:</b> <code>${(t.prompt||"").slice(0,350)}</code>\n❌ <b>Chi tiết lỗi:</b> ${o.error}\n⏱ <b>Thời gian:</b> ${new Date().toLocaleString('vi-VN')}`;this.sendTelegramAlert?.({accountName:this.displayName,errorCode:isPromptErr?("prompt_err_"+t.id):(o.error||'').slice(0,40),text:teleMsg,photoPath:l}).catch(()=>{});}}catch{}if(!!(!!o.conversation_url||!!t.result?.conversation_url)&&Y(o.error,{sent:!1}).transient)throw new S(o.error);this.fail(t,o.error,{...t.result||{},conversation_url:o.conversation_url,credits_left:o.credits_left,video_url:o.video_url??t.result?.video_url??null});return}if(o.video_seconds&&Math.abs(o.video_seconds-t.duration)>2){let l=Math.round(o.video_seconds);e(`video th\u1EF1c t\u1EBF d\xE0i ${l} gi\xE2y (y\xEAu c\u1EA7u ${t.duration} gi\xE2y)`),this.store.update(t.id,{duration:l})}let a={...o,playable:!1,watermark_removed:!1,recovered:!!t.recover_url,dola_response:o.dola_response||(this.store.get(t.id)?.result?.dola_response)||null};if(o.path&&!t.dry_run){let isClean=!!(o.video_url&&(o.video_url.includes("unwatermarked")||o.video_url.includes("lr=unwatermarked")));this.stage(t,"processing","\u0110ang x\u1EED l\xFD video (upscale 1080p Full HD)",95);let l=await He(o.path,{removeWatermark:!!t.remove_watermark,log:e});a.playable=l.playable,a.watermark_removed=l.watermarkRemoved,this.thumbFile&&(a.thumb=await Tt(o.path,this.thumbFile(t.id)))}this.store.update(t.id,{status:"done",result:a,error:null,finished:T(),stage:"done",stage_note:yt.done,progress:100}),this.finished(t);if(o.path&&!t.dry_run){try{this.onVideoDone?.()}catch(cbErr){}}}async doLogin(t){let e=o=>this.store.log(t.id,o),i=await this.open(e);if(this.set({state:"login"}),await i.isLoggedIn()){this.noteSession(await i.sessionInfo()),e("\u0111\xE3 \u0111\u0103ng nh\u1EADp s\u1EB5n, kh\xF4ng c\u1EA7n m\u1EDF c\u1EEDa s\u1ED5 \u0111\u0103ng nh\u1EADp"),this.store.update(t.id,{status:"done",result:{login:!0},finished:T()});return}await this.close();let n=await this.open(e,!1);this.set({state:"login"});let r=await n.loginInteractive(gn);if(r){await this.saveCookies(n);this.noteSession(await n.sessionInfo());}else{this.noteSession({loggedIn:!1,expires:null});}await this.close(),r?this.store.update(t.id,{status:"done",result:{login:!0},finished:T()}):this.store.update(t.id,{status:"error",error:"H\u1EBFt gi\u1EDD ch\u1EDD \u0111\u0103ng nh\u1EADp (10 ph\xFAt).",finished:T()})}async doCookies(t){let e=o=>this.store.log(t.id,o),i=this.takeCookies?.(this.profileId);if(!i||!i.length)throw new S("Kh\xF4ng c\xF3 cookie n\xE0o \u0111ang ch\u1EDD n\u1EA1p cho t\xE0i kho\u1EA3n n\xE0y. B\u1EA5m \xABD\xE1n cookie\xBB l\u1EA1i.");let n=await this.open(e),r=await n.setCookies(i);this.noteSession(r);if(r.loggedIn){let dName=await n.fetchDolaDisplayName().catch(()=>null);if(dName){this.set({name:dName});e(`👤 Tên tài khoản Dola: ${dName}`);}}r.loggedIn?(e("Dola \u0111\xE3 nh\u1EADn phi\xEAn t\u1EEB cookie, t\xE0i kho\u1EA3n s\u1EB5n s\xE0ng t\u1EA1o video"),await this.saveCookies(n),this.store.update(t.id,{status:"done",result:{login:!0,cookies:i.length},finished:T()})):this.store.update(t.id,{status:"error",finished:T(),result:{login:!1,cookies:i.length},error:"\u0110\xE3 n\u1EA1p cookie nh\u01B0ng Dola kh\xF4ng nh\u1EADn phi\xEAn. Cookie h\u1EBFt h\u1EA1n ho\u1EB7c \u0111\xE3 \u0111\u0103ng xu\u1EA5t \u1EDF tr\xECnh duy\u1EC7t g\u1ED1c - \u0111\u0103ng nh\u1EADp l\u1EA1i dola.com r\u1ED3i xu\u1EA5t cookie m\u1EDBi."})}async doCheck(t){
  let e=r=>this.store.log(t.id,r),i=await this.open(e);
  e("Đang kiểm tra phiên đăng nhập thực tế trên Dola...");
  let isLogged=await i.isLoggedIn(!0);
  let sess=await i.sessionInfo();
  if(isLogged){
    this.noteSession({loggedIn:!0,expires:sess.expires});
    await this.saveCookies(i);
    let n=await i.creditsLeft().catch(()=>null);let dName=await i.fetchDolaDisplayName().catch(()=>null);if(dName){this.set({name:dName});e(`👤 Tên tài khoản Dola: ${dName}`);}
    if(n!==null){
      this.set({credits:n,credits_date:mt()});
      e(`✅ Đã đăng nhập Dola thành công (${n} credit)`);
    }else{
      e("✅ Đã đăng nhập Dola thành công");
    }
    this.store.update(t.id,{status:"done",result:{login:!0,credits:n},finished:T()});
  }else{
    this.noteSession({loggedIn:!1,expires:null});
    this.set({login:!1,session_expires:null,credits:0,rest_reason:"Bị văng phiên Dola (Cookie đã chết / hết hạn)"});
    b.warn(this.displayName,"Kiểm tra: Cookie Dola ĐÃ CHẾT / Bị văng phiên. Yêu cầu đăng nhập lại!");
    e("❌ KIỂM TRA PHÁT HIỆN: Cookie Dola ĐÃ CHẾT hoặc bị thu hồi! Yêu cầu đăng nhập lại.");
    this.store.update(t.id,{status:"done",result:{login:!1,credits:0,error:"Cookie Dola đã chết / Bị văng phiên"},finished:T()});
  }
}};var di=[5,10,15,30],mn=20*1024*1024,gi=500,fn={"2.5":"Seedance 2.5 (2 credit)","2.0":"Seedance 2.0 Fast","1.0":"Seedance 1.0 (1 credit)"},yn={"9:16":"d\u1ECDc","16:9":"ngang","1:1":"vu\xF4ng","3:4":"d\u1ECDc 3:4","4:3":"ngang 4:3","21:9":"si\xEAu r\u1ED9ng"},m=class extends Error{constructor(e,i){super(i);this.status=e}};function L(s,t=400){try{return s()}catch(e){throw e instanceof m?e:new m(t,e instanceof Error?e.message:String(e))}}function parseBulkDolaCookies(rawInput) {
  let s = String(rawInput ?? '').trim();
  if (!s) return [];

  if (s.startsWith('{') || s.startsWith('[')) {
    try {
      let parsed = JSON.parse(s);
      if (parsed && Array.isArray(parsed.profiles)) {
        return parsed.profiles.map(p => ({
          name: p.name || undefined,
          proxy: p.proxy || undefined,
          rawCookie: JSON.stringify(p.cookies || p)
        }));
      }
      if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object' && (Array.isArray(parsed[0].cookies) || parsed[0].cookie)) {
        return parsed.map(p => ({
          name: p.name || undefined,
          proxy: p.proxy || undefined,
          rawCookie: typeof p.cookies === 'object' ? JSON.stringify(p.cookies) : (p.cookie || JSON.stringify(p))
        }));
      }
      if (Array.isArray(parsed) && parsed.length > 0 && Array.isArray(parsed[0])) {
        return parsed.map(arr => ({
          rawCookie: JSON.stringify(arr)
        }));
      }
    } catch {}
  }

  let jsonArrayRegex = /\[\s*\{[\s\S]*?\}\s*\]/g;
  let matches = [...s.matchAll(jsonArrayRegex)];
  if (matches.length > 1 || (matches.length === 1 && s.trim() === matches[0][0].trim())) {
    return matches.map(m => ({ rawCookie: m[0] }));
  }

  let blocks = [];
  let lines = s.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  for (let line of lines) {
    if (!line || line.startsWith('#')) continue;
    if (line.includes('|')) {
      let parts = line.split('|').map(p => p.trim()).filter(Boolean);
      let cookiePart = parts.find(p => p.includes('sessionid') || p.includes('sid_tt') || /^[a-fA-F0-9]{32}$/.test(p));
      let nonCookie = parts.filter(p => p !== cookiePart);
      let customName = nonCookie[0] || undefined;
      let rawCookie = cookiePart || line;
      blocks.push({ name: customName, rawCookie });
    } else {
      blocks.push({ rawCookie: line });
    }
  }

  return blocks;
}

var Jt=class{baseDir;headless;idleCloseMs;uploadsDir;registry;store;scheduler;settingsStore;assets;workers=new Map;proxyRotateTimers=new Map;clientFactory;onVideoDone;onJobFinished;openViewer;viewerIds;started=!1;pendingCookies=new Map;statsCache=null;usedOutputDirs=new Set;noteOutputDir(){let t=this.outputDir;R.default.dirname(t)===this.baseDir&&this.usedOutputDirs.add(R.default.basename(t))}constructor(t={}){this.baseDir=t.baseDir??St,this.headless=!!t.headless,this.idleCloseMs=t.idleCloseMs??18e4,this.clientFactory=t.clientFactory,this.onVideoDone=t.onVideoDone,this.onJobFinished=t.onJobFinished,this.openViewer=t.openViewer,this.viewerIds=t.viewerIds,this.uploadsDir=R.default.join(this.baseDir,"uploads");let e=t.settingsFile===void 0?R.default.join(this.baseDir,"settings.json"):t.settingsFile;this.settingsStore=new Mt(e,t.outputDir?{output_dir:t.outputDir}:{}),this.noteOutputDir(),this.registry=new Lt(this.baseDir,()=>this.usedOutputDirs),this.store=new At(R.default.join(this.baseDir,"jobs.json")),this.scheduler=new Rt(this.store,()=>this.registry.eligibleIds()),this.scheduler.getMaxThreads=()=>Number(this.settingsStore.get().max_threads)||5,this.assets=new $t(R.default.join(this.baseDir,"assets")),this.store.onLog=(i,n)=>{let r=i.assigned?this.registry.get(i.assigned)?.name??i.assigned:i.profile!=="auto"?this.registry.get(i.profile)?.name??i.profile:"h\xE0ng \u0111\u1EE3i";b.push(me(n),r,`#${i.seq} ${n}`)}}get settings(){return this.settingsStore.get()}get outputDir(){return this.settingsStore.get().output_dir||_t}start(){if(!this.started){this.started=!0,A.default.mkdirSync(this.outputDir,{recursive:!0}),A.default.mkdirSync(this.uploadsDir,{recursive:!0});for(let t of this.registry.all()){this.startWorker(t.id);if(t.proxy_rotate&&t.proxy_key)this.setupProxyRotation(t.id);}b.info("app",`b\u1EAFt \u0111\u1EA7u nh\u1EADn job, ${this.registry.all().length} t\xE0i kho\u1EA3n`),this.startSessionHealthMonitor()}}startSessionHealthMonitor(){if(this.sessionHealthTimer)clearInterval(this.sessionHealthTimer);const getIntervalMs=()=>{const hrs=Number(this.settings?.session_health_interval||3);return Math.max(1,Math.min(24,hrs))*3600*1000;};const runHealthCheck=async()=>{try{const allProfiles=this.registry.all().filter(p=>p.enabled);for(const prof of allProfiles){const worker=this.workers.get(prof.id);const isBusy=!!(prof.current_job||worker?.profile?.current_job||(worker&&worker.state!=="idle"&&worker.state!=="off"));if(isBusy)continue;try{const cookies=(typeof this.dolaCookies==="function"?this.dolaCookies(prof.id):[])||[];const hasSession=cookies.some(c=>(c.name==="sessionid"||c.name==="sid_tt")&&c.value);if(!hasSession){this.registry.update(prof.id,{login:!1,health_status:"re-auth_required",last_check:new Date().toISOString()});continue;}if(prof.session_expires&&new Date(prof.session_expires).getTime()<Date.now()){this.registry.update(prof.id,{login:!1,health_status:"re-auth_required",last_check:new Date().toISOString()});continue;}this.registry.update(prof.id,{health_status:"healthy",last_check:new Date().toISOString()});}catch(err){b.warn("session_health",`Lỗi kiểm tra session của «${prof.name}»: `+(err?.message||err));}}}catch(e){b.warn("session_health","Lỗi daemon session health: "+(e?.message||e));}};this.sessionHealthTimer=setInterval(runHealthCheck,getIntervalMs());}get isStarted(){return this.started}startWorker(t){if(!this.started)return;let e=this.workers.get(t);return e&&e.running||(e=new Nt({profileId:t,registry:this.registry,scheduler:this.scheduler,store:this.store,getOutputDir:()=>this.outputDir,getSettings:()=>this.settings,headless:this.headless,idleCloseMs:this.idleCloseMs,clientFactory:this.clientFactory,onVideoDone:this.onVideoDone,onJobFinished:this.onJobFinished,getRenderAvgS:i=>oi(this.stats(),i.model,i.duration),thumbFile:i=>this.thumbFile(i),cacheCookies:(i,n)=>this.cacheCookies(i,n),googleCred:i=>this.googleCred(i),sendTelegramAlert:opts=>this.sendTelegramAlert(opts),takeCookies:i=>{let n=this.pendingCookies.get(i)??null;return this.pendingCookies.delete(i),n}}),this.workers.set(t,e),e.start()),e}async stop(t=1e4){let e=[...this.workers.values()].map(i=>i.stop());this.scheduler.stop(),await Promise.race([Promise.allSettled(e),new Promise(i=>setTimeout(i,t))]),this.store.flush()}stats(){if(this.store.size>2e3&&this.statsCache&&Date.now()-this.statsCache.at<1e4)return this.statsCache.value;let t=si(this.store.list(!1));return this.statsCache={at:Date.now(),value:t},t}state(){for(let n of this.registry.rescan())this.startWorker(n);let t=this.registry.all().map(n=>this.registry.toJSON(n)),e=new Map(t.map(n=>[n.id,n.name])),i=this.store.list().map(n=>({...n,log:n.log.slice(-40),assigned_name:n.assigned?e.get(n.assigned)??n.assigned:null,profile_name:n.profile==="auto"?"T\u1EF1 \u0111\u1ED9ng":e.get(n.profile)??n.profile}));return{profiles:t,jobs:i,meta:{models:Object.keys(K).map(n=>({id:n,label:fn[n]??n,credits:re[n]??null})),ratios:gt,ratio_labels:yn,durations:di,output_dir:this.outputDir,headless:this.headless,started:this.started,paused:this.scheduler.isPaused,stats:this.stats(),settings:this.settings,assets:this.assets.list().length,max_ref_images:Et,log_seq:b.lastSeq,viewers:this.viewerIds?this.viewerIds():[]}}}updateSettings(t){let e=this.outputDir,i=L(()=>this.settingsStore.update(t));return i.settings.output_dir!==e&&(this.noteOutputDir(),b.info("app",`\u0111\u1ED5i th\u01B0 m\u1EE5c l\u01B0u video: ${i.settings.output_dir}`)),this.scheduler.poke(),i}filenamePreview(t){return{preview:L(()=>$e(t)),placeholders:Dt}}submitGenerate(t,e=null){if(t.max_threads){try{let mt=Number(t.max_threads)||5;this.settingsStore.update({max_threads:mt});if(this.scheduler)this.scheduler.maxThreads=mt;}catch(e){}}let isPro=t.mode==="pro";let hasItems=Array.isArray(t.items)&&t.items.length>0;let itemsList=[];if(hasItems){for(let it of t.items){let pStr=String(it.prompt??"").trim();if(!pStr)continue;let imgPaths=(Array.isArray(it.image_ids)?it.image_ids:[]).map(f=>this.uploadPath(f)).filter(Boolean);itemsList.push({id:it.id||("p_"+se.default.randomBytes(4).toString("hex")),prompt:pStr,images:imgPaths});}}let i=hasItems?itemsList.map(x=>x.prompt):(Array.isArray(t.prompts)?t.prompts:[t.prompt??""]).map(f=>String(f??"").trim()).filter(Boolean);if(!i.length)throw new m(400,"prompt tr\u1ED1ng");let n=t.model??"2.5";if(!(n in K)&&!Object.values(K).includes(n))throw new m(400,"model kh\xF4ng h\u1EE3p l\u1EC7");let r=Number(t.duration??30);if(isPro)r=Math.min(30,r||30);if(!Number.isInteger(r)||r<1||r>300)throw new m(400,"\u0111\u1ED9 d\xE0i kh\xF4ng h\u1EE3p l\u1EC7");let o=t.ratio||null;if(o&&!gt.includes(o))throw new m(400,"ratio kh\xF4ng h\u1EE3p l\u1EC7");let targetProfiles=Array.isArray(t.profiles)&&t.profiles.length?t.profiles.filter(p=>p&&this.registry.get(p)):null;let a=t.profile||"auto";if(a!=="auto"&&!targetProfiles&&!this.registry.get(a))throw new m(400,"profile kh\xF4ng t\u1ED3n t\u1EA1i");let l=this.settings,c=Math.min(20,Math.max(1,Number(t.copies??1)||1)),d=Math.min(120,Math.max(1,Number(t.wait??l.wait_minutes)||l.wait_minutes)),u=typeof t.remove_watermark=="boolean"?t.remove_watermark:l.remove_watermark,h=(t.image_ids??[]).map(f=>this.uploadPath(f)),p=t.per_image&&h.length>1?h.map(f=>[f]):[h],y=hasItems?itemsList.length*c:i.length*p.length*c;if(y>gi)throw new m(400,`M\u1ED9t l\u1EA7n t\u1ED1i \u0111a ${gi} video (\u0111ang xin ${y}). B\u1EDBt prompt, \u1EA3nh ho\u1EB7c s\u1ED1 b\u1EA3n.`);let x=this.quotaLeft(e,y),N=se.default.randomBytes(3).toString("hex"),g=[];
let allProfs=this.registry.all().filter(prof=>prof.enabled&&prof.login!==!1&&!je(prof));
let getCreds=(prof)=>prof.credits_date===mt()?(typeof prof.credits==="number"?Math.max(0,prof.credits):2):2;
let isBusy=(id)=>{let prof=this.registry.get(id);return !prof||prof.state==="busy"||prof.state==="starting"||prof.state==="login"||this.store.list().some(j=>j.status==="running"&&j.assigned===id)};

let targetProfileList=(targetProfiles&&targetProfiles.length)?targetProfiles:null;
let candList=targetProfileList?targetProfileList.map(id=>this.registry.get(id)).filter(p=>p&&p.enabled&&p.login!==!1&&p.health_status!=="re-auth_required"&&!je(p)&&getCreds(p)>0):allProfs.filter(p=>getCreds(p)>0);
if(targetProfileList&&!candList.length) throw new m(400, "Các tài khoản đã chọn đều không khả dụng (bị văng hoặc hết credit hôm nay). Vui lòng kiểm tra tab Tài khoản.");

let jobProfile=a;
let jobTargets=null;
if(a==="auto"){
  jobProfile="auto";
}else if(targetProfileList&&targetProfileList.length>0){
  if(targetProfileList.length===1){
    jobProfile=targetProfileList[0];
  }else{
    jobProfile="auto";
    jobTargets=targetProfileList;
  }
}else if(a!=="auto"&&!targetProfileList){
  let chosen=this.registry.get(a);
  if(chosen&&isBusy(a)){
    let idleAlt=allProfs.find(p=>p.id!==a&&!isBusy(p.id)&&getCreds(p)>0);
    if(idleAlt){
      b.info("hàng đợi",`Nick «${chosen.name}» đang bận — Tự động chuyển prompt sang «${idleAlt.name}» để chạy song song ngay!`);
      jobProfile=idleAlt.id;
    }
  }
}

t:for(let idx=0;idx<i.length;idx++)for(let _ of(hasItems?[itemsList[idx].images]:p)){let f=i[idx];
  let I=this.assets.resolveMentions(f,Math.max(0,Et-_.length));
  for(let X=0;X<c;X++){
    if(g.length>=x)break t;
    let currentItem=hasItems?itemsList[idx]:null;let promptId=currentItem?currentItem.id:("p_"+se.default.randomBytes(4).toString("hex"));let q=wt({kind:"generate",profile:jobProfile,target_profiles:jobTargets,prompt_id:promptId,prompt:I.prompt,model:n,duration:r,ratio:o,images:[..._,...I.images],assets:I.tags,batch:N,dry_run:!!t.dry_run,remove_watermark:u,wait:d,mode:isPro?"pro":"normal",auto_retry_acc:t.auto_retry_acc!==false});
    this.scheduler.submit(q),g.push(q.id)
  }
}
this.scheduler.poke();return b.info("h\xE0ng \u0111\u1EE3i",`th\xEAm ${g.length} video v\xE0o h\xE0ng \u0111\u1EE3i (${i.length} prompt \xD7 ${p.length} b\u1ED9 \u1EA3nh \xD7 ${c} b\u1EA3n)`),g}quotaLeft(t,e){return e;}retry(t,e=null,i={}){let n=this.store.get(t);if(!n)throw new m(404,"kh\xF4ng c\xF3 job");if(n.status==="queued"||n.status==="running")throw new m(400,"job \u0111ang ch\u1EA1y ho\u1EB7c \u0111ang ch\u1EDD");n.kind==="generate"&&!n.dry_run&&this.quotaLeft(e,1);let r=ei(n);r.profile="auto";r.auto_retry_acc=!0;r.tried=[n.assigned,n.profile].filter(p=>p&&p!=="auto");return i.duration&&di.includes(i.duration)&&(r.duration=i.duration),this.scheduler.submit(r),r.id}
async rescanVideo(jobId) {
  let job = this.store.get(jobId);
  if (!job) throw new m(404, "Không tìm thấy task");
  if (job.kind !== "generate" || job.dry_run) throw new m(400, "Chỉ quét lại được video của task tạo video");

  let convUrl = job.result?.conversation_url || job.conversation_url || job.recover_url;
  let profileId = job.assigned || (job.tried && job.tried.length ? job.tried[job.tried.length - 1] : null) || (job.profile !== 'auto' ? job.profile : null) || [...this.registry.eligibleIds()][0];
  if (!profileId) throw new m(400, "Không tìm thấy tài khoản để quét Dola");

  let prof = this.registry.get(profileId);
  let displayName = prof?.name || profileId;
  this.store.log(job.id, "🔍 [Quét lại trang] Đang quét tìm video trên Dola của «" + displayName + "»...");

  const extractVideoScript = `(async () => {
    try {
      let pageTxt = (document.body ? document.body.innerText : "") || "";
      if (/for copyright protection|can(?:'|’)?t\\s+show\\s+you\\s+the\\s+generated\\s+video|copyright protection|chính sách bản quyền|bảo vệ bản quyền/i.test(pageTxt)) {
        return { found: false, refusal: "copyright", message: "⚠️ Dola từ chối do vi phạm bản quyền (For copyright protection). Không có video để lấy." };
      }
      function isRealVideoUrl(u){if(!u||typeof u!=="string")return!1;let s=u.toLowerCase().trim();if(!s.startsWith("http://")&&!s.startsWith("https://")&&!s.startsWith("blob:"))return!1;if(s.includes("ibyteimg")||s.includes("image-sign")||s.includes("/image/")||s.includes("format=image"))return!1;if(s.includes(".png")||s.includes(".jpg")||s.includes(".jpeg")||s.includes(".webp")||s.includes(".gif")||s.includes(".svg"))return!1;if(s.includes("avatar")||s.includes("poster")||s.includes("cover")||s.includes("thumbnail")||s.includes("preview_low"))return!1;if(s.startsWith("blob:")||s.includes(".mp4")||s.includes(".webm")||s.includes("mime_type=video")||s.includes("/video/tos/"))return!0;if(s.includes("byteoversea")||s.includes("tiktokcdn")||s.includes("dola.com")){if(s.includes("/video/")||s.includes("play_url")||s.includes("download_url")||s.includes("video_url"))return!0;}return!1;}
      let hookVids = (window.__dolaHook && window.__dolaHook.videos) || [];
      if (Array.isArray(hookVids) && hookVids.length > 0) {
        let validHookVids = hookVids.filter(v => isRealVideoUrl(v));
        if (validHookVids.length > 0) {
          let clean = validHookVids.find(v => v.includes("unwatermarked") || v.includes("lr=unwatermarked")) || validHookVids[0];
          if (clean && clean.startsWith("http")) return { found: true, url: clean, type: "hook" };
        }
      }

      // Kích hoạt click vào nút Play / thẻ video để mở player
      let playTargets = [
        ...document.querySelectorAll('button[aria-label*="play" i], [class*="play"], svg[class*="play"], polygon'),
        ...document.querySelectorAll('[class*="block-video"], [class*="video-card"], [class*="video-player"], [class*="aspect-[9/16]"], [class*="aspect-[16/9]"], [data-container-type="block-v2"]'),
        ...document.querySelectorAll('[class*="aspect-"], div[class*="overflow-hidden"]')
      ];
      for (let pt of playTargets.slice(0, 4)) {
        try { pt.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })); } catch {}
        try { pt.click(); } catch {}
      }

      let vids = [...document.querySelectorAll("video")];
      for (let v of vids.reverse()) {
        let src = v.currentSrc || v.src || v.querySelector("source")?.src;
        if (src && isRealVideoUrl(src)) {
          return { found: true, url: src, type: "video_tag" };
        }
      }

      // Quét React Fiber cả props và state
      let allElements = [
        ...document.querySelectorAll('[class*="block-video"], [data-plugin-identifier*="video"], [class*="video-card"], [class*="video-player"], [class*="aspect-"], [data-container-type="block-v2"]'),
        ...document.querySelectorAll('.v_list_row, [data-target-id="message-box-target-id"], [data-role="assistant"], [class*="bubble"]'),
        ...document.querySelectorAll('div[class*="overflow-hidden"]')
      ];

      let fiberVideoUrl = null;
      let visited = new Set();
      function scanObj(obj, d) {
        if (!obj || typeof obj !== 'object' || d > 6 || visited.has(obj) || fiberVideoUrl) return;
        visited.add(obj);
        if (Array.isArray(obj)) {
          for (let it of obj) {
            scanObj(it, d + 1);
            if (fiberVideoUrl) return;
          }
          return;
        }
        for (let k of Object.keys(obj)) {
          let val = obj[k];
          if (typeof val === 'string' && isRealVideoUrl(val)) {
            fiberVideoUrl = val;
            return;
          }
          if (val && typeof val === 'object' && d < 6) {
            scanObj(val, d + 1);
            if (fiberVideoUrl) return;
          }
        }
      }

      for (let el of allElements) {
        if (!el || fiberVideoUrl) break;
        let fk = Object.keys(el).find(k => k.startsWith('__reactFiber') || k.startsWith('__reactInternalInstance'));
        if (!fk) continue;
        let curr = el[fk];
        let depth = 0;
        while (curr && depth < 35 && !fiberVideoUrl) {
          depth++;
          if (curr.memoizedProps) scanObj(curr.memoizedProps, 0);
          if (curr.memoizedState) scanObj(curr.memoizedState, 0);
          curr = curr.return;
        }
      }

      if (fiberVideoUrl) return { found: true, url: fiberVideoUrl, type: "fiber_scan" };

      let downloadLinks = [...document.querySelectorAll('a[download], a[href*=".mp4"], a[href*="byteoversea"]')];
      for (let a of downloadLinks) {
        let href = a.href || "";
        if (isRealVideoUrl(href)) {
          return { found: true, url: href, type: "download_link" };
        }
      }

      return { found: false, message: "Chưa thấy video trên trang Dola của task này. Dola có thể vẫn đang dựng video, hãy đợi thêm rồi bấm lại." };
    } catch (e) {
      return { found: false, message: "Lỗi quét trang: " + (e?.message || e) };
    }
  })()`;

  let videoUrl = null;

  // 1. Kiểm tra worker page đang chạy tác vụ
  if (!videoUrl) {
    try {
      let worker = this.workers.get(profileId);
      let cl = worker?.client;
      let pg = (cl?.page && !cl.page.isClosed()) ? cl.page : ((cl?.viewerPage && !cl.viewerPage.isClosed()) ? cl.viewerPage : null);
      if (pg) {
        this.store.log(job.id, "🔍 [Quét lại trang] Đang kiểm tra trang Worker đang chạy...");
        await pg.evaluate(() => { window.scrollTo(0, document.body.scrollHeight); }).catch(() => {});
        await new Promise(r => setTimeout(r, 600));
        let res = await pg.evaluate(extractVideoScript).catch(() => null);
        if (res?.found && res.url) {
          videoUrl = res.url;
          this.store.log(job.id, "🎯 [Quét lại trang] Bắt được video từ Worker page (" + res.type + ")!");
        }
      }
    } catch (err) {
      b.warn("rescanVideo", "Lỗi quét worker page: " + (err?.message || err));
    }
  }

  // 2. Kiểm tra nếu người dùng đang mở Chrome của profile này (activeBrowsers)
  if (!videoUrl && this.activeBrowsers && this.activeBrowsers.has(profileId)) {
    try {
      let c = this.activeBrowsers.get(profileId);
      let pages = c.pages().filter(p => !p.isClosed());
      for (let pg of pages) {
        let u = pg.url() || "";
        if (u.includes("dola.com") || (convUrl && u.includes(convUrl.split("?")[0]))) {
          this.store.log(job.id, "🔍 [Quét lại trang] Đang kiểm tra cửa sổ Chrome đang mở...");
          await pg.evaluate(() => { window.scrollTo(0, document.body.scrollHeight); }).catch(() => {});
          await new Promise(r => setTimeout(r, 600));
          let res = await pg.evaluate(extractVideoScript).catch(() => null);
          if (res?.found && res.url) {
            videoUrl = res.url;
            this.store.log(job.id, "🎯 [Quét lại trang] Bắt được video từ cửa sổ Chrome (" + res.type + ")!");
            break;
          }
        }
      }
    } catch (err) {
      b.warn("rescanVideo", "Lỗi quét activeBrowsers: " + (err?.message || err));
    }
  }

  // 3. Nếu vẫn chưa có và không có trình duyệt nào đang mở: mở phiên Playwright tạm thời
  let workerRunning = !!this.workers.get(profileId)?.client?.alive;
  let browserRunning = !!(this.activeBrowsers && this.activeBrowsers.has(profileId));

  if (!videoUrl && !workerRunning && !browserRunning) {
    let targetUrl = convUrl || "https://dola.com";
    this.store.log(job.id, "🔍 [Quét lại trang] Đang mở cuộc trò chuyện trên Dola để quét (" + targetUrl + ")...");
    let tempClient = new It({
      profileDir: this.registry.dir(profileId),
      outputDir: this.outputDir,
      headless: true,
      log: msg => this.store.log(job.id, "[Scan] " + msg),
      proxy: prof?.proxy ? B(prof.proxy) : null
    });

    try {
      await tempClient.start();
      let page = tempClient.page;
      let cdpHandler = async (res) => {
        try {
          let ct = (res.headers()["content-type"] || "").toLowerCase();
          let u = res.url() || "";
          if ((ct.startsWith('video/') || isRealVideoUrl(u)) && !/ibyteimg|flow-image-sign|\.(?:png|jpe?g|webp)/i.test(u)) {
            await page.evaluate((url) => {
              window.__dolaHook = window.__dolaHook || { videos: [] };
              if (!window.__dolaHook.videos.includes(url)) window.__dolaHook.videos.unshift(url);
            }, u).catch(() => {});
          }
        } catch {}
      };
      page.on("response", cdpHandler);

      await page.goto(targetUrl, { waitUntil: "domcontentloaded", timeout: 35000 }).catch(() => {});
      await new Promise(r => setTimeout(r, 2000));
      await page.evaluate(() => { window.scrollTo(0, document.body.scrollHeight); }).catch(() => {});
      await new Promise(r => setTimeout(r, 800));

      let res = await page.evaluate(extractVideoScript).catch(() => null);
      if (res?.found && res.url) {
        videoUrl = res.url;
        this.store.log(job.id, "🎯 [Quét lại trang] Bắt được video (" + res.type + ")!");
      }
    } catch (err) {
      this.store.log(job.id, "⚠️ [Scan] Lỗi: " + (err?.message || err));
    } finally {
      try { await tempClient.close(); } catch {}
    }
  }

  if (!videoUrl) {
    this.store.log(job.id, "⚠️ [Quét lại trang] Chưa thấy video trên trang Dola. Dola có thể vẫn đang dựng video.");
    return { ok: false, found: false, message: "Chưa thấy video trên trang Dola của task này. Dola có thể vẫn đang dựng video, hãy đợi thêm rồi bấm lại." };
  }

  // Tải video về máy và hoàn thành task
  let cleanUrl = String(videoUrl).replace(/([?&])lr=watermarked\b/gi, "$1lr=unwatermarked").replace(/([?&])logo_type=(?:watermarked|wm)\b/gi, "$1logo_type=unwatermarked").replace(/([?&])watermark=(?:1|true)\b/gi, "$1watermark=0").replace(/([?&])wm=(?:1|true)\b/gi, "$1wm=0");
  let outDir = this.outputDir;
  let filename = `${Je()}-${Ne(job.prompt)}.mp4`;
  let outPath = require('path').join(outDir, filename);

  this.store.log(job.id, "⬇️ [Quét lại trang] Đang tải video về: " + filename + "...");
  let downloadedPath = null;
  let workerClient = this.workers.get(profileId)?.client;

  if (workerClient && workerClient.alive) {
    downloadedPath = await workerClient.download(cleanUrl, outPath).catch(async () => {
      return await workerClient.download(videoUrl, outPath).catch(() => null);
    });
  } else {
    let dummyClient = new It({ profileDir: this.registry.dir(profileId), outputDir: this.outputDir, headless: true });
    downloadedPath = await dummyClient.download(cleanUrl, outPath).catch(async () => {
      return await dummyClient.download(videoUrl, outPath).catch(() => null);
    });
  }

  if (!downloadedPath || !fs.existsSync(downloadedPath)) {
    this.store.log(job.id, "⚠️ [Quét lại trang] Không thể tải video về máy từ link: " + videoUrl.slice(0, 80));
    return { ok: false, found: true, url: videoUrl, message: "Đã tìm thấy video nhưng không tải về được file." };
  }

  let finalRes = {
    path: outPath,
    video_url: cleanUrl,
    conversation_url: convUrl,
    recovered_at: new Date().toISOString()
  };

  this.store.update(job.id, {
    status: "done",
    progress: 100,
    stage: "Hoàn thành",
    stage_percent: 100,
    result: finalRes,
    error: null
  });

  this.store.log(job.id, "🎉 [Quét lại trang] Đã hoàn thành task và lưu video vào: " + outPath);
  try { this.onVideoDone?.(); } catch (cbErr) {}

  return {
    ok: true,
    found: true,
    path: outPath,
    video_url: cleanUrl,
    message: "Đã quét được video và tự động tải về máy thành công!"
  };
}

recover(t,e=null){let i=this.store.get(t);if(!i)throw new m(404,"kh\xF4ng c\xF3 job");if(i.kind!=="generate"||i.dry_run)throw new m(400,"ch\u1EC9 l\u1EA5y l\u1EA1i \u0111\u01B0\u1EE3c video c\u1EE7a job t\u1EA1o video");if(i.status==="queued"||i.status==="running")throw new m(400,"job \u0111ang ch\u1EA1y ho\u1EB7c \u0111ang ch\u1EDD");let n=i.result?.conversation_url||i.conversation_url;if(!n)throw new m(400,"Job n\xE0y ch\u01B0a g\u1EEDi \u0111\u01B0\u1EE3c y\xEAu c\u1EA7u t\u1EDBi Dola n\xEAn kh\xF4ng c\xF3 g\xEC \u0111\u1EC3 l\u1EA5y l\u1EA1i. B\u1EA5m \xABCh\u1EA1y l\u1EA1i\xBB.");let r=i.assigned||(i.tried&&i.tried.length?i.tried[i.tried.length-1]:null)||(i.profile!=="auto"?i.profile:null);if(!r||!this.registry.get(r)){r=[...this.registry.eligibleIds()][0]||null;}if(!r)throw new m(400,"Không có tài khoản khả dụng để mở lại Dola lấy video");if(this.quotaLeft(e,1),i.profile=r,i.recover_url=n,this.startWorker(r),!this.scheduler.resubmit(t))throw new m(400,"kh\xF4ng \u0111\u01B0a job v\xE0o h\xE0ng \u0111\u1EE3i \u0111\u01B0\u1EE3c");return this.store.log(t,"l\u1EA5y l\u1EA1i video t\u1EEB cu\u1ED9c tr\xF2 chuy\u1EC7n c\u0169 tr\xEAn Dola, kh\xF4ng g\u1EEDi y\xEAu c\u1EA7u m\u1EDBi"),t}async cancel(t){let job=this.store.get(t);if(!job)throw new m(404,"Không tìm thấy job");if(job.status==="queued"){if(!this.scheduler.cancel(t))throw new m(400,"Không thể huỷ job đang chờ");return;}if(job.status==="running"){this.store.patch(t,{status:"cancelled",stage:"cancelled",stage_note:"Đã dừng task tức thì theo yêu cầu",finished:T(),error:"Đã dừng theo yêu cầu người dùng"});this.store.log(t,"Đã bấm dừng task tức thì — đang giải phóng luồng...");let targetWorker=[...this.workers.values()].find(w=>w.profileId===job.assigned||w.profile?.current_job===t);if(targetWorker){await targetWorker.abortCurrentJob(t).catch(()=>{})}this.scheduler.signal?.notifyAll?.();this.scheduler.poke?.();return;}throw new m(400,"Job đã kết thúc, không thể huỷ");}delete(t){let e=this.store.get(t);if(!e)throw new m(404,"kh\xF4ng c\xF3 job");if(e.status==="running")throw new m(400,"job \u0111ang ch\u1EA1y, ch\u1EDD xong r\u1ED3i xo\xE1");e.status==="queued"&&this.scheduler.cancel(t),this.store.remove(t);try{A.default.rmSync(this.thumbFile(t),{force:!0})}catch{}}bulk(t,e,i=null){let n=["error","interrupted","cancelled"],r;t==="retry_failed"?r=this.store.list(!1).filter(l=>l.kind==="generate"&&n.includes(l.status)).map(l=>l.id):t==="delete_done"?r=this.store.list(!1).filter(l=>l.status==="done").map(l=>l.id):t==="cancel_queued"?r=this.store.queued().map(l=>l.id):r=Array.isArray(e)?e.map(String):[];let o=t.startsWith("retry")?"retry":t.startsWith("delete")?"delete":"cancel",a={ok:0,skipped:0,errors:[]};for(let l of r)try{o==="retry"?this.retry(l,i):o==="delete"?this.delete(l):this.cancel(l),a.ok++}catch(c){if(c instanceof m&&c.status===402)throw new m(402,`${c.message} (\u0111\xE3 l\xE0m ${a.ok}/${r.length})`);a.skipped++,a.errors.length<3&&a.errors.push(c instanceof Error?c.message:String(c))}return a}pause(t){this.scheduler.pause(t),b.info("h\xE0ng \u0111\u1EE3i",t?"t\u1EA1m d\u1EEBng h\xE0ng \u0111\u1EE3i - job \u0111ang ch\u1EA1y v\u1EABn ch\u1EA1y n\u1ED1t":"ch\u1EA1y ti\u1EBFp h\xE0ng \u0111\u1EE3i")}videoPath(t){let e=this.store.get(t),i=e?.result?.path;if(!e||!i)throw new m(404,"ch\u01B0a c\xF3 video");if(!A.default.existsSync(i))throw new m(404,"file kh\xF4ng c\xF2n t\u1ED3n t\u1EA1i");return i}galleryVideoPath(filename){let bn=R.default.basename(filename);let fp=R.default.join(this.outputDir,bn);if(!A.default.existsSync(fp))throw new m(404,"Không tìm thấy video");return fp;}
galleryThumbFile(filename){let sn=R.default.basename(filename).replace(/[^a-zA-Z0-9_\-\.]/g,"_");return R.default.join(this.thumbsDir,`gal_${sn}.jpg`);}
async galleryThumbPath(filename){let th=this.galleryThumbFile(filename);if(A.default.existsSync(th))return th;let vp=this.galleryVideoPath(filename);await Tt(vp,th);if(A.default.existsSync(th))return th;throw new m(404,"Không tạo được thumbnail");}
async listGalleryVideos(){let dir=this.outputDir;if(!A.default.existsSync(dir))return[];let files=A.default.readdirSync(dir);let jobList=this.store.list();let jobByPath=new Map();let jobByFile=new Map();for(let j of jobList){if(j.result?.path){jobByPath.set(R.default.resolve(j.result.path).toLowerCase(),j);jobByFile.set(R.default.basename(j.result.path).toLowerCase(),j);}}let videos=[];for(let f of files){if(!f.toLowerCase().endsWith('.mp4')||f.includes('.tmp.')||f.endsWith('.part'))continue;let full=R.default.join(dir,f);try{let st=A.default.statSync(full);if(!st.isFile()||st.size<1000)continue;let matchedJob=jobByPath.get(R.default.resolve(full).toLowerCase())||jobByFile.get(f.toLowerCase());videos.push({name:f,path:full,size:st.size,mtime:st.mtimeMs||st.mtime.getTime(),job_id:matchedJob?.id||null,prompt:matchedJob?.prompt||'',model:matchedJob?.model||'2.5',duration:matchedJob?.duration||null,ratio:matchedJob?.ratio||null,created:matchedJob?.created||new Date(st.mtimeMs||st.mtime).toISOString()});}catch(e){}}videos.sort((a,b)=>b.mtime-a.mtime);return videos;}
async mergeVideos(fileList,title="",trims={}){if(!Array.isArray(fileList)||fileList.length<2)throw new m(400,"Cần chọn ít nhất 2 video để ghép");let validPaths=[];for(let f of fileList){let p=typeof f==="string"?(A.default.existsSync(f)?f:R.default.join(this.outputDir,R.default.basename(f))):null;if(!p||!A.default.existsSync(p))throw new m(400,`Video không tồn tại: ${f}`);validPaths.push(p);}let outDir=this.outputDir;A.default.mkdirSync(outDir,{recursive:!0});let timeStr=new Date().toISOString().slice(0,19).replace(/[^0-9]/g,"_");let safeTitle=(title||"").trim().replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF\s\-]/g,"").slice(0,40)||"Merged";let outName=`Seedance_${safeTitle}_${timeStr}.mp4`;let outPath=R.default.join(outDir,outName);let tempDir=R.default.join(this.baseDir,"scratch");A.default.mkdirSync(tempDir,{recursive:!0});let listTxtPath=R.default.join(tempDir,`concat_${Date.now()}.txt`);let hasTrims=false;let content=validPaths.map(p=>{let fn=R.default.basename(p);let t=trims&&trims[fn];let lines=[`file '${p.replace(/'/g,"'\\''")}'`];if(t&&Number(t.start)>0){lines.push(`inpoint ${Number(t.start)}`);hasTrims=true;}if(t&&Number(t.end)>0&&Number(t.end)>Number(t.start||0)){lines.push(`outpoint ${Number(t.end)}`);hasTrims=true;}return lines.join("\n");}).join("\n");A.default.writeFileSync(listTxtPath,content,"utf-8");b.info("hàng đợi",`Bắt đầu ghép ${validPaths.length} video thành ${outName}...`);let copyOk=false;if(!hasTrims){let runCopy=await pt(Z(),["-y","-f","concat","-safe","0","-i",listTxtPath,"-c","copy","-movflags","+faststart",outPath]);copyOk=runCopy.code===0&&A.default.existsSync(outPath)&&A.default.statSync(outPath).size>10000;}if(!copyOk){b.info("hàng đợi",`Ghép và mã hóa chuẩn H.264 (áp dụng cắt phân cảnh)...`);try{if(A.default.existsSync(outPath))A.default.unlinkSync(outPath);}catch(e){}let runEncode=await pt(Z(),["-y","-f","concat","-safe","0","-i",listTxtPath,"-c:v","libx264","-crf","18","-preset","veryfast","-pix_fmt","yuv420p","-c:a","aac","-b:a","192k","-movflags","+faststart",outPath]);if(runEncode.code!==0||!A.default.existsSync(outPath)||A.default.statSync(outPath).size===0){try{A.default.unlinkSync(listTxtPath);}catch(e){}throw new m(500,`Lỗi ghép video (FFmpeg): ${runEncode.stderr.slice(-250)}`);}}try{A.default.unlinkSync(listTxtPath);}catch(e){}let outStat=A.default.statSync(outPath);let th=this.galleryThumbFile(outName);try{await Tt(outPath,th);}catch(e){}b.info("hàng đợi",`Ghép video thành công! Đã lưu: ${outName} (${(outStat.size/1e6).toFixed(1)} MB)`);return{ok:!0,filename:outName,path:outPath,size:outStat.size};}
async deleteGalleryVideo(filename){let vp=this.galleryVideoPath(filename);try{A.default.unlinkSync(vp);}catch(e){}try{let th=this.galleryThumbFile(filename);if(A.default.existsSync(th))A.default.unlinkSync(th);}catch(e){}return{ok:!0};}
async deleteAllGalleryVideos(){let dir=this.outputDir;if(!A.default.existsSync(dir))return{ok:!0,count:0};let files=A.default.readdirSync(dir);let count=0;for(let f of files){if(!f.toLowerCase().endsWith('.mp4')||f.includes('.tmp.')||f.endsWith('.part'))continue;try{A.default.unlinkSync(R.default.join(dir,f));count++;}catch(e){}try{let th=this.galleryThumbFile(f);if(A.default.existsSync(th))A.default.unlinkSync(th);}catch(e){}}return{ok:!0,count};}
async delogoGalleryVideos(fileList){if(!Array.isArray(fileList)||fileList.length<1)throw new m(400,"Cần chọn ít nhất 1 video để xóa logo");let validPaths=[];for(let f of fileList){let p=typeof f==="string"?(A.default.existsSync(f)?f:R.default.join(this.outputDir,R.default.basename(f))):null;if(!p||!A.default.existsSync(p))throw new m(400,`Video không tồn tại: ${f}`);validPaths.push({name:R.default.basename(p),path:p});}b.info("hàng đợi",`Bắt đầu xóa logo Dola AI cho ${validPaths.length} video...`);let processed=0;let results=[];for(let i=0;i<validPaths.length;i++){let item=validPaths[i];try{b.info("hàng đợi",`[${i+1}/${validPaths.length}] Đang xử lý xóa logo: ${item.name}...`);let res=await He(item.path,{removeWatermark:!0,log:msg=>b.info("hàng đợi",`[Delogo] ${msg}`)});let th=this.galleryThumbFile(item.name);try{if(A.default.existsSync(th))A.default.unlinkSync(th);await Tt(item.path,th);}catch(e){}let st=A.default.existsSync(item.path)?A.default.statSync(item.path):null;processed++;results.push({name:item.name,ok:!0,watermarkRemoved:res?.watermarkRemoved,size:st?.size||0});}catch(err){b.error("hàng đợi",`Lỗi xóa logo ${item.name}: ${err?.message||err}`);results.push({name:item.name,ok:!1,error:err?.message||String(err)});}}b.info("hàng đợi",`Hoàn thành xóa logo Dola AI: ${processed}/${validPaths.length} video thành công!`);return{ok:!0,total:validPaths.length,processed,results};}
get thumbsDir(){return R.default.join(this.baseDir,"thumbs")}thumbFile(t){return R.default.join(this.thumbsDir,`${t}.jpg`)}async thumbPath(t){let e=this.thumbFile(t);if(A.default.existsSync(e))return e;let i=this.videoPath(t);if(!await Tt(i,e))throw new m(404,"kh\xF4ng t\u1EA1o \u0111\u01B0\u1EE3c \u1EA3nh thu nh\u1ECF");let r=this.store.get(t);return r&&this.store.patch(t,{result:{...r.result||{},thumb:!0}}),e}activeQuickAdd=null;async quickAddStart(t,e={}){let name=String(t||"").trim();if(!name){let count=this.registry.all().length+1;name="Nick "+count;}let isRotate=!!e.proxy_rotate;let rotKey=e.proxy_key?String(e.proxy_key).trim():null;if(!rotKey&&e.proxy&&isTopProxyKey(e.proxy)){isRotate=!0;rotKey=String(e.proxy).trim();}if(!rotKey&&isRotate&&e.proxy){rotKey=String(e.proxy).trim();}let proxyStr=null;
if(e.proxy&&!isTopProxyKey(e.proxy)){try{proxyStr=nt(B(e.proxy));}catch{}}
if(isRotate&&rotKey){if(!proxyStr){try{let d=await fetchProxyXoay(rotKey);let rawP=d.proxyhttp||d.proxy_http;if(rawP){let clean=String(rawP).replace(/::+$/,"").replace(/:+$/,"");proxyStr=nt(B(clean));}}catch{}}}
let p=L(()=>this.registry.add(name));
if(isRotate&&rotKey){this.registry.update(p.id,{proxy_rotate:true,proxy_key:rotKey,proxy:proxyStr});this.setupProxyRotation(p.id);}
else if(proxyStr){this.registry.update(p.id,{proxy:proxyStr});}if(this.activeQuickAdd){try{await this.activeQuickAdd.client?.close()}catch{}this.activeQuickAdd=null;}let client=new It({profileDir:this.registry.dir(p.id),outputDir:this.outputDir,headless:!1,log:msg=>b.info(p.name,msg),proxy:proxyStr?B(proxyStr):null});try{await client.start();await client.ensureOnDola().catch(()=>{});this.activeQuickAdd={profileId:p.id,client};return{ok:!0,profile:this.registry.toJSON(p)};}catch(err){try{await client.close()}catch{}try{await this.removeProfile(p.id)}catch{}throw err;}}async quickAddConfirm(t,e){let targetId=t||this.activeQuickAdd?.profileId;if(!targetId)throw new m(400,"Không có phiên đăng nhập nhanh nào đang chờ.");let p=this.registry.get(targetId);if(!p)throw new m(404,"Không tìm thấy profile.");if(typeof e=="string"&&e.trim()&&e.trim()!==p.name){this.registry.update(targetId,{name:e.trim()});p=this.registry.get(targetId);}let client=this.activeQuickAdd?.client,cookies=[],sess=null;if(client&&client.alive){cookies=await client.exportCookies();sess=await client.sessionInfo();}else{let tempClient=new It({profileDir:this.registry.dir(targetId),outputDir:this.outputDir,headless:!0,log:()=>{},proxy:p.proxy?B(p.proxy):null});try{await tempClient.start();cookies=await tempClient.exportCookies();sess=await tempClient.sessionInfo();}finally{await tempClient.close().catch(()=>{});}}let hasSession=cookies.some(c=>(c.name==="sessionid"||c.name==="sid_tt")&&c.value);if(!sess?.loggedIn&&!hasSession){throw new m(400,"Chưa phát hiện phiên đăng nhập Dola trên trình duyệt. Vui lòng đăng nhập trên cửa sổ Chrome vừa mở rồi bấm lại nút này.");}this.cacheCookies(targetId,cookies);let credits=null;let dolaDisplayName=null;if(client&&client.alive){credits=await client.creditsLeft().catch(()=>null);// Try to fetch Dola display name (only if name is still numeric/default and user didn't rename)
let curName=(p.name||"").trim();let nameIsDefault=/^\d+$/.test(curName)||/^nick\s*\d+$/i.test(curName)||curName===targetId;if(nameIsDefault){try{dolaDisplayName=await client.fetchDolaDisplayName().catch(()=>null);}catch{}}}this.registry.update(targetId,{enabled:!0,login:!0,session_expires:sess?.expires||null,last_check:new Date().toISOString(),...(credits!==null?{credits,credits_date:mt()}:{}),...(dolaDisplayName?{name:dolaDisplayName}:{})});if(client){await client.close().catch(()=>{});}this.activeQuickAdd=null;this.startWorker(targetId);let finalName=dolaDisplayName||p.name;b.info("app","Thêm tài khoản nhanh thành công: "+finalName+" ("+cookies.length+" cookie)"+(dolaDisplayName?" [tên Dola: "+dolaDisplayName+"]":""));return{ok:!0,profile:this.registry.toJSON(this.registry.get(targetId))};}async quickAddCancel(t){let targetId=t||this.activeQuickAdd?.profileId;if(this.activeQuickAdd){try{await this.activeQuickAdd.client?.close()}catch{}this.activeQuickAdd=null;}if(targetId){let p=this.registry.get(targetId);if(p&&p.login!==!0){await this.removeProfile(targetId).catch(()=>{});}}return{ok:!0};}async quickAddFb(rawFbData,opts={}){let parsed=parseFbAccount(rawFbData);if(!parsed.cookies.length&&!(parsed.username&&parsed.password))throw new m(400,"Dữ liệu Facebook không hợp lệ (cần Cookie FB có c_user/xs hoặc Tài khoản dạng UID|Pass|2FA).");let name=String(opts.name||"").trim();if(!name){if(parsed.uid){name="FB - "+parsed.uid}else if(parsed.username){name="FB - "+parsed.username}else{let count=this.registry.all().length+1;name="Nick "+count}}let isRotateFb=!!opts.proxy_rotate;let rotKeyFb=opts.proxy_key?String(opts.proxy_key).trim():null;if(!rotKeyFb&&opts.proxy&&isTopProxyKey(opts.proxy)){isRotateFb=!0;rotKeyFb=String(opts.proxy).trim();}if(!rotKeyFb&&isRotateFb&&opts.proxy){rotKeyFb=String(opts.proxy).trim();}let proxyStr=null;
if(opts.proxy&&!isTopProxyKey(opts.proxy)){try{proxyStr=nt(B(opts.proxy));}catch{}}
if(isRotateFb&&rotKeyFb){if(!proxyStr){try{let d=await fetchProxyXoay(rotKeyFb);let rawP=d.proxyhttp||d.proxy_http;if(rawP){let clean=String(rawP).replace(/::+$/,"").replace(/:+$/,"");proxyStr=nt(B(clean));}}catch{}}}
let p=L(()=>this.registry.add(name));
if(isRotateFb&&rotKeyFb){this.registry.update(p.id,{proxy_rotate:true,proxy_key:rotKeyFb,proxy:proxyStr});this.setupProxyRotation(p.id);}
else if(proxyStr){this.registry.update(p.id,{proxy:proxyStr});}if(parsed&&parsed.username&&parsed.password){this.cacheFbCred(p.id,{uid:parsed.uid||parsed.username,username:parsed.username,password:parsed.password,twoFactor:parsed.twoFactor||null});}let client=new It({profileDir:this.registry.dir(p.id),outputDir:this.outputDir,headless:opts.headless!==undefined?!!opts.headless:!0,log:msg=>b.info(p.name,msg),proxy:proxyStr?B(proxyStr):null});try{await client.start();let fbCookies=parsed.cookies||[],dolaCookies=[],loggedInOk=!1;if(fbCookies.length>0){try{b.info(p.name,`Đang thử đăng nhập Dola bằng Cookie FB (${fbCookies.length} cookie)...`);dolaCookies=await client.autoLoginFacebook(fbCookies,msg=>b.info(p.name,msg));loggedInOk=!0}catch(cErr){b.warn(p.name,`Cookie FB hết hạn hoặc lỗi (${cErr?.message||cErr}). Tự đổi sang đăng nhập bằng TK|MK|2FA...`)}}if(!loggedInOk&&parsed.username&&parsed.password){b.info(p.name,`Đang đăng nhập Facebook bằng UID & Pass & 2FA (${parsed.username})...`);fbCookies=await client.loginFacebookWithCredentials(parsed,msg=>b.info(p.name,msg));dolaCookies=await client.autoLoginFacebook(fbCookies,msg=>b.info(p.name,msg));loggedInOk=!0}if(!loggedInOk||!dolaCookies.length){throw new S("Không thể đăng nhập Dola bằng cả Cookie và TK|MK Facebook đã nhập.");}this.cacheCookies(p.id,dolaCookies);try{let freshFb=await client.context.cookies(["https://www.facebook.com","https://facebook.com"]).catch(()=>[]);this.cacheFbCookies(p.id,freshFb&&freshFb.length?freshFb:parsed.cookies)}catch{this.cacheFbCookies(p.id,parsed.cookies)}let credits=null;try{credits=await client.creditsLeft()}catch{}let sess=null;try{sess=await client.sessionInfo()}catch{}let dolaName=null;try{dolaName=await client.fetchDolaDisplayName()}catch{}this.registry.update(p.id,{...(dolaName?{name:dolaName}:{}),enabled:!0,login:!0,session_expires:sess?.expires||null,last_check:new Date().toISOString(),...(credits!==null?{credits,credits_date:mt()}:{})});await client.close().catch(()=>{});this.startWorker(p.id);b.info("app","Thêm tài khoản FB tự động thành công: "+p.name+" ("+dolaCookies.length+" cookie)");return{ok:!0,profile:this.registry.toJSON(this.registry.get(p.id))}}catch(err){let scrPath=null;try{scrPath=R.default.join(this.outputDir,`login-err-${p.id}-${Date.now()}.png`);if(client?.page&&!client.page.isClosed()){await client.screenshot(scrPath);}}catch{}try{await client.close()}catch{}let errMsg=err instanceof Error?err.message:String(err);this.registry.update(p.id,{enabled:!1,login:!1,rest_reason:errMsg,last_check:new Date().toISOString()});try{let setts=this.settings;if(setts.telegram_token&&setts.telegram_chat_id&&setts.telegram_notify_login_err!==!1){let teleMsg=`🚨 <b>BÁO LỖI ĐĂNG NHẬP DOLA / FB</b>\n👤 <b>Tài khoản:</b> ${p.name}\n❌ <b>Lý do lỗi:</b> ${errMsg}\n⏱ <b>Thời gian:</b> ${new Date().toLocaleString('vi-VN')}`;await this.sendTelegramAlert({text:teleMsg,photoPath:scrPath});}}catch{}throw err;}}async updateFbCookies(t,e){let i=this.registry.get(t);if(!i)throw new m(400,"profile không tồn tại");if(i.current_job)throw new m(400,`«${i.name}» đang bận chạy video, vui lòng đợi video xong.`);let n=parseFbAccount(e);if(!n.cookies.length&&!(n.username&&n.password))throw new m(400,"Dữ liệu Facebook không hợp lệ (cần Cookie FB có c_user/xs hoặc Tài khoản dạng UID|Pass|2FA).");this.activeBrowsers&&this.activeBrowsers.has(t)&&(this.activeBrowsers.get(t).close().catch(()=>{}),this.activeBrowsers.delete(t));let r=this.workers.get(t);if(r&&r.client){let a=r.client;r.client=null,r.loggedIn=null;try{await a.close()}catch{}}let o=new It({profileDir:this.registry.dir(i.id),outputDir:this.outputDir,headless:!0,log:a=>b.info(i.name,a),proxy:i.proxy?B(i.proxy):null});try{await o.start();let fbCookies=n.cookies;if(!fbCookies.length&&n.username&&n.password){fbCookies=await o.loginFacebookWithCredentials(n,l=>b.info(i.name,l));}let a=await o.autoLoginFacebook(fbCookies,l=>b.info(i.name,l));this.cacheCookies(i.id,a);try{let freshFb=await o.context.cookies(["https://www.facebook.com","https://facebook.com"]).catch(()=>[]);this.cacheFbCookies(i.id,freshFb&&freshFb.length?freshFb:n.cookies)}catch{this.cacheFbCookies(i.id,n.cookies)}let l=null;try{l=await o.creditsLeft()}catch{}let c=null;try{c=await o.sessionInfo()}catch{}let dolaName=null;try{dolaName=await o.fetchDolaDisplayName()}catch{}this.registry.update(i.id,{...(dolaName?{name:dolaName}:{}),enabled:!0,login:!0,session_expires:c?.expires||null,last_check:new Date().toISOString(),...l!==null?{credits:l,credits_date:mt()}:{}}),await o.close().catch(()=>{}),this.startWorker(i.id),b.info("app",`Cập nhật cookie FB thành công cho ${i.name} (${a.length} cookie Dola)`);return{ok:!0,profile:this.registry.toJSON(this.registry.get(i.id))}}catch(a){try{await o.close()}catch{}throw a}};async reloginFbProfile(t){let i=this.registry.get(t);if(!i)throw new m(404,"Không tìm thấy profile.");let cred=this.fbCred(t);let fbc=this.fbCookies(t);if(!cred&&(!fbc||!fbc.length))throw new m(400,"Tài khoản này chưa lưu thông tin đăng nhập Facebook (UID|Pass|2FA hoặc Cookie FB).");b.info(i.name,"Đang đăng nhập lại Facebook để cấp lại phiên Dola...");let r=this.workers.get(t);if(r&&r.client){let a=r.client;r.client=null,r.loggedIn=null;try{await a.close()}catch{}}let o=new It({profileDir:this.registry.dir(i.id),outputDir:this.outputDir,headless:!0,log:a=>b.info(i.name,a),proxy:i.proxy?B(i.proxy):null});try{await o.start();let dolaCookies=[],relogOk=!1;if(fbc&&fbc.length>0){try{b.info(i.name,`Thử cấp phiên bằng Cookie FB cũ (${fbc.length} cookie)...`);dolaCookies=await o.autoLoginFacebook(fbc,l=>b.info(i.name,l));relogOk=!0}catch(fbcErr){b.warn(i.name,`Cookie FB cũ không còn hạn. Tự động dùng TK|MK|2FA để đăng nhập lại...`)}}if(!relogOk&&cred&&cred.username&&cred.password){b.info(i.name,`Đang đăng nhập FB bằng UID ${cred.username}...`);let freshFb=await o.loginFacebookWithCredentials(cred,l=>b.info(i.name,l));dolaCookies=await o.autoLoginFacebook(freshFb,l=>b.info(i.name,l));relogOk=!0;try{let allFb=await o.context.cookies(["https://www.facebook.com","https://facebook.com"]).catch(()=>[]);if(allFb&&allFb.length)this.cacheFbCookies(i.id,allFb)}catch{}}if(!relogOk||!dolaCookies.length)throw new S("Cấp lại phiên thất bại: Cookie FB hết hạn và không thể đăng nhập bằng TK|MK.");this.cacheCookies(i.id,dolaCookies);let a=dolaCookies;try{let freshFb=await o.context.cookies(["https://www.facebook.com","https://facebook.com"]).catch(()=>[]);if(freshFb&&freshFb.length)this.cacheFbCookies(i.id,freshFb);}catch{}let sess=await o.sessionInfo().catch(()=>null);this.registry.update(i.id,{login:!0,enabled:!0,session_expires:sess?.expires||null,last_check:new Date().toISOString(),rest_until:null,rest_reason:null});await o.close().catch(()=>{});this.startWorker(i.id);this.scheduler.poke();b.info("app",`Cấp lại phiên Dola thành công cho ${i.name} (${a.length} cookie)`);return{ok:!0,profile:this.registry.toJSON(this.registry.get(i.id))};}catch(err){try{await o.close()}catch{}let errMsg=err instanceof Error?err.message:String(err);this.registry.update(i.id,{login:!1,rest_reason:errMsg,last_check:new Date().toISOString()});throw err;}}async autoResetProfileCredit(t){let i=this.registry.get(t);if(!i)throw new m(400,"profile không tồn tại");if(i.current_job)throw new m(400,`«${i.name}» đang bận chạy video. Vui lòng đợi video xong.`);this.activeBrowsers&&this.activeBrowsers.has(t)&&(this.activeBrowsers.get(t).close().catch(()=>{}),this.activeBrowsers.delete(t));let r=this.workers.get(t);if(r&&r.client){let a=r.client;r.client=null,r.loggedIn=null;try{await a.close()}catch{}}It.killOrphans(this.registry.dir(i.id));await new Promise(res=>setTimeout(res,600));let fbc=this.fbCookies(i.id);b.info(i.name,"[Auto Reset] Chạy trực tiếp không qua proxy để xóa nick và đăng nhập lại...");let o=new It({profileDir:this.registry.dir(i.id),outputDir:this.outputDir,headless:!1,log:a=>b.info(i.name,a),proxy:null,executablePath:xt()});try{await o.start();await Promise.resolve(o?.showWindow?.(!0)).catch(()=>{});let a=await o.autoResetCredit(fbc,l=>b.info(i.name,l));this.cacheCookies(i.id,a);try{let freshFb=await o.context.cookies(["https://www.facebook.com","https://facebook.com"]).catch(()=>[]);freshFb&&freshFb.length&&this.cacheFbCookies(i.id,freshFb)}catch{}let l=null;try{l=await o.creditsLeft()}catch{}if(l===null)l=10;let c=null;try{c=await o.sessionInfo()}catch{}let dolaName=null;try{dolaName=await o.fetchDolaDisplayName()}catch{}this.registry.update(i.id,{...(dolaName?{name:dolaName}:{}),enabled:!0,login:!0,session_expires:c?.expires||null,last_check:new Date().toISOString(),rest_until:null,rest_reason:null,...l!==null?{credits:l,credits_date:mt()}:{}});await o.close().catch(()=>{});this.startWorker(i.id);this.scheduler.poke();b.info("app",`Auto reset credit thành công cho ${i.name} (Credit mới: ${l??'đã cập nhật'})`);return{ok:!0,profile:this.registry.toJSON(this.registry.get(i.id)),credits:l}}catch(a){try{await o.close()}catch{}throw a}};addProfile(t,e={}){let name=String(t??"").trim();if(!name){let existingNames=new Set(this.registry.all().map(p=>(p.name||"").trim()));let nextNum=1;while(existingNames.has(String(nextNum))){nextNum++;}name=String(nextNum);}let i=null;if(typeof e.cookies=="string"&&e.cookies.trim()){i=L(()=>Ot(e.cookies));let newSess=i.find(c=>(c.name==="sessionid"||c.name==="sid_tt")&&c.value)?.value;let newUid=i.find(c=>(c.name==="uid_tt"||c.name==="passport_uid"||c.name==="user_id")&&c.value)?.value;for(let existing of this.registry.all()){let existCookies=this.pendingCookies.get(existing.id)||[];if(!existCookies.length)existCookies=this.dolaCookies(existing.id);if(existCookies&&existCookies.length){let exSess=existCookies.find(c=>(c.name==="sessionid"||c.name==="sid_tt")&&c.value)?.value;let exUid=existCookies.find(c=>(c.name==="uid_tt"||c.name==="passport_uid"||c.name==="user_id")&&c.value)?.value;if(newSess&&exSess&&newSess===exSess){throw new m(400,`Tài khoản này đã tồn tại trong danh sách (trùng phiên với «${existing.name}»). Không thể thêm trùng lặp.`);}if(newUid&&exUid&&newUid===exUid){throw new m(400,`Tài khoản này đã tồn tại trong danh sách (trùng UID Dola với «${existing.name}»). Không thể thêm trùng lặp.`);}}}}let isRotate=!!e.proxy_rotate;let rotKey=e.proxy_key?String(e.proxy_key).trim():null;if(!rotKey&&e.proxy&&isTopProxyKey(e.proxy)){isRotate=!0;rotKey=String(e.proxy).trim();}if(!rotKey&&isRotate&&e.proxy){rotKey=String(e.proxy).trim();}let n=e.proxy&&!isTopProxyKey(e.proxy)?L(()=>nt(B(e.proxy))):null,r=L(()=>this.registry.add(name));if(isRotate&&rotKey){this.registry.update(r.id,{proxy_rotate:!0,proxy_key:rotKey,...(n?{proxy:n}:{})});this.setupProxyRotation(r.id);}else if(n){this.registry.update(r.id,{proxy:n});}this.startWorker(r.id);return i?(this.cacheCookies(r.id,i),this.pendingCookies.set(r.id,i),{profile:this.registry.toJSON(r),login_job:this.pinnedJob(r.id,"cookies")}):{profile:this.registry.toJSON(r),login_job:this.requestLogin(r.id)}}addProfilesBulk(t,e="",opts={}){let parsedBlocks=parseBulkDolaCookies(t);let i=parsedBlocks.length>0?parsedBlocks:wn(t).map(raw=>({rawCookie:raw}));if(!i.length)throw new m(400,"Ch\u01B0a c\xF3 b\u1ED9 cookie n\xE0o. M\u1ED7i t\xE0i kho\u1EA3n m\u1ED9t kh\u1ED1i JSON (Cookie-Editor \u2192 Export) ho\u1EB7c m\u1ED9t d\xF2ng name=value; \u2026");let pMode=(opts&&opts.proxy_mode)?opts.proxy_mode:(isTopProxyKey(e)?'topproxy':'static');let topKey=(opts&&opts.topproxy_key)?String(opts.topproxy_key).trim():(pMode==='topproxy'||isTopProxyKey(e)?String(e).trim():null);let n=String(e??"").split(/\r?\n/).map(l=>l.trim()).filter(Boolean),r={added:[],errors:[]},o=new Set;let existingProfiles=this.registry.all();let knownSessions=new Map();let knownUids=new Map();for(let ep of existingProfiles){let cs=this.pendingCookies.get(ep.id)||[];if(!cs.length)cs=this.dolaCookies(ep.id);let sVal=cs.find(c=>(c.name==="sessionid"||c.name==="sid_tt")&&c.value)?.value;let uVal=cs.find(c=>(c.name==="uid_tt"||c.name==="passport_uid")&&c.value)?.value;if(sVal)knownSessions.set(sVal,ep.name);if(uVal)knownUids.set(uVal,ep.name);}let a=existingProfiles.length;return i.forEach((item,c)=>{let l=typeof item==="object"&&item.rawCookie?item.rawCookie:item;let customName=typeof item==="object"&&item.name?item.name:null;let customProxy=typeof item==="object"&&item.proxy?item.proxy:null;try{let d=Ot(l);let u=d.find(x=>(x.name==="sessionid"||x.name==="sid_tt")&&x.value)?.value??"";let uid=d.find(x=>(x.name==="uid_tt"||x.name==="passport_uid")&&x.value)?.value??"";if(u&&knownSessions.has(u)){r.errors.push({line:c+1,reason:`trùng phiên với nick «${knownSessions.get(u)}» đã có sẵn, đã bỏ`});return;}if(uid&&knownUids.has(uid)){r.errors.push({line:c+1,reason:`trùng UID với nick «${knownUids.get(uid)}» đã có sẵn, đã bỏ`});return;}if(u&&o.has(u)){r.errors.push({line:c+1,reason:"trùng phiên với một khối ở trên trong danh sách dán, đã bỏ"});return;}u&&o.add(u);let h=d.find(x=>x.name==="uid_tt")?.value??"",p=customName||(h?`Nick ${h.slice(-6)}`:`Nick ${a+r.added.length+1}`);let profileOpts={cookies:l};if(customProxy){profileOpts.proxy=customProxy;}else if(topKey){profileOpts.proxy_rotate=!0;profileOpts.proxy_key=topKey;}else if(n.length>0){let proxyItem=n[c%n.length];if(isTopProxyKey(proxyItem)){profileOpts.proxy_rotate=!0;profileOpts.proxy_key=proxyItem;}else{profileOpts.proxy=proxyItem;}}let y=this.addProfile(p,profileOpts);r.added.push({id:y.profile.id,name:y.profile.name});if(u)knownSessions.set(u,y.profile.name);if(uid)knownUids.set(uid,y.profile.name);}catch(d){r.errors.push({line:c+1,reason:d instanceof Error?d.message:String(d)})}}),b.info("app",`th\xEAm nhi\u1EC1u nick: ${r.added.length} t\xE0i kho\u1EA3n, ${r.errors.length} kh\u1ED1i l\u1ED7i${topKey?' (TopProxy key: '+topKey+')':n.length?(' ('+n.length+' proxy, loop '+r.added.length+' nick)'):''}`),r}importCookies(t,e){let target=this.registry.get(t);if(!target)throw new m(404,"kh\xF4ng c\xF3 profile");let i=L(()=>Ot(e));let newSess=i.find(c=>(c.name==="sessionid"||c.name==="sid_tt")&&c.value)?.value;let newUid=i.find(c=>(c.name==="uid_tt"||c.name==="passport_uid"||c.name==="user_id")&&c.value)?.value;for(let existing of this.registry.all()){if(existing.id===t)continue;let existCookies=this.pendingCookies.get(existing.id)||[];if(!existCookies.length)existCookies=this.dolaCookies(existing.id);if(existCookies&&existCookies.length){let exSess=existCookies.find(c=>(c.name==="sessionid"||c.name==="sid_tt")&&c.value)?.value;let exUid=existCookies.find(c=>(c.name==="uid_tt"||c.name==="passport_uid"||c.name==="user_id")&&c.value)?.value;if(newSess&&exSess&&newSess===exSess){throw new m(400,`Cookie n\xE0y thu\u1ED9c v\u1EC1 t\xE0i kho\u1EA3n \xAB${existing.name}\xBB \u0111\xE3 c\xF3 trong danh s\xE1ch. Kh\xF4ng th\u1EC3 g\xE1n tr\xF9ng l\u1EB7p.`);}if(newUid&&exUid&&newUid===exUid){throw new m(400,`Cookie n\xE0y thu\u1ED9c v\u1EC1 t\xE0i kho\u1EA3n \xAB${existing.name}\xBB (tr\xF9ng UID). Kh\xF4ng th\u1EC3 g\xE1n tr\xF9ng l\u1EB7p.`);}}}this.cacheCookies(t,i);return this.pendingCookies.set(t,i),this.pinnedJob(t,"cookies")}async removeProfile(t){
  this.clearProxyRotation(t);
  let e=this.registry.get(t);
  if(!e)throw new m(404,"Không tìm thấy profile");
  if(e.current_job)throw new m(400,`«${e.name}» đang chạy job, chờ xong rồi xoá`);
  for(let n of this.store.queued())n.profile===t&&this.scheduler.cancel(n.id);
  if(this.activeBrowsers&&this.activeBrowsers.has(t)){
    let c=this.activeBrowsers.get(t);
    try{await c.close()}catch{}
    this.activeBrowsers.delete(t);
  }
  let i=this.workers.get(t);
  if(i){
    try{await i.close()}catch{}
    let n=i.stop();
    this.scheduler.poke();
    await Promise.race([n,new Promise(r=>setTimeout(r,4000))]);
    this.workers.delete(t);
  }
  let pDir=this.registry.dir(t);
  try{It.killOrphans(pDir)}catch{}
  if(process.platform==="win32"){
    try{
      let escPath=pDir.replace(/\\/g,"\\\\");
      require("node:child_process").execSync(`powershell -NoProfile -Command "Get-CimInstance Win32_Process -Filter \\\"name = 'chrome.exe'\\\" | Where-Object { \\$_.CommandLine -like '*${escPath}*' } | ForEach-Object { Stop-Process -Id \\$_.ProcessId -Force -ErrorAction SilentlyContinue }"`,{timeout:5000,stdio:'ignore'});
    }catch{}
  }
  for(let fn of ["google-credentials.json","fb-credentials.json","fb-cookies.json","dola-cookies.json"]){
    try{C.default.rmSync(j.default.join(pDir,fn),{force:!0})}catch{}
  }
  this.pendingCookies.delete(t);
  this.registry.remove(t);
  this.scheduler.poke();
}
checkAll(){let t=[];for(let e of this.registry.all())e.current_job||t.push(this.requestCheck(e.id));return t}


googleCredFile(t) { return R.default.join(this.registry.dir(t), "google-credentials.json"); }
cacheGoogleCred(t, e) {
  try {
    A.default.mkdirSync(this.registry.dir(t), { recursive: true });
    A.default.writeFileSync(this.googleCredFile(t), JSON.stringify(e, null, 2));
  } catch {}
}
googleCred(t) {
  try {
    let e = JSON.parse(A.default.readFileSync(this.googleCredFile(t), "utf-8"));
    return e && typeof e === "object" ? e : null;
  } catch { return null; }
}

async reloginGoogleProfile(t) {
  let i = this.registry.get(t);
  if (!i) throw new m(404, "Không tìm thấy profile.");
  let cred = this.googleCred(t);
  if (!cred || !cred.email || !cred.password) {
    throw new m(400, "Tài khoản này chưa lưu thông tin đăng nhập Google (Email & Password).");
  }
  b.info(i.name, `Đang tự động đăng nhập lại Google (${cred.email}) để cấp lại phiên Dola...`);
  let r = this.workers.get(t);
  if (r && r.client) {
    let a = r.client; r.client = null; r.loggedIn = null;
    try { await a.close(); } catch {}
  }
  let gridPos = calculateWindowGrid(0, 1);
  let o = new It({
    profileDir: this.registry.dir(i.id),
    outputDir: this.outputDir,
    headless: false,
    log: a => b.info(i.name, a),
    proxy: i.proxy ? B(i.proxy) : null,
    windowSize: { width: gridPos.width, height: gridPos.height },
    windowPosition: { x: gridPos.x, y: gridPos.y }
  });
  try {
    await o.start();
    let dolaCookies = await o.loginGoogleWithCredentials(cred, msg => b.info(i.name, msg), { holdOnError: true });
    this.cacheCookies(i.id, dolaCookies);
    let sess = await o.sessionInfo().catch(() => null);
    let credits = await o.creditsLeft().catch(() => null);
    let dolaName = await o.fetchDolaDisplayName().catch(() => null);
    this.registry.update(i.id, {
      ...(dolaName ? { name: dolaName } : {}),
      login: true,
      enabled: true,
      health_status: 'healthy',
      session_expires: sess?.expires || null,
      last_check: new Date().toISOString(),
      rest_until: null,
      rest_reason: null,
      ...(credits !== null ? { credits, credits_date: mt() } : {})
    });
    await o.close().catch(() => {});
    this.startWorker(i.id);
    this.scheduler.poke();
    b.info("app", `Cấp lại phiên Google thành công cho ${i.name} (${dolaCookies.length} cookie)`);
    return { ok: true, profile: this.registry.toJSON(this.registry.get(i.id)) };
  } catch (err) {
    try { await o.close(); } catch {}
    let errMsg = err instanceof Error ? err.message : String(err);
    this.registry.update(i.id, { login: false, health_status: 're-auth_required', rest_reason: errMsg, last_check: new Date().toISOString() });
    throw err;
  }
}

async reloginAllFailedGoogle() {
  let failed = this.registry.all().filter(p => (p.login === false || p.health_status === 're-auth_required') && this.googleCred(p.id));
  if (!failed.length) return { ok: true, total: 0, reloaded: 0 };
  b.info("app", `Bắt đầu đăng nhập lại ${failed.length} tài khoản Google bị lỗi...`);
  let okCount = 0;
  for (let p of failed) {
    try {
      await this.reloginGoogleProfile(p.id);
      okCount++;
    } catch (e) {
      b.warn(p.name, `Đăng nhập lại lỗi: ` + (e?.message || e));
    }
  }
  return { ok: true, total: failed.length, reloaded: okCount };
}

async quickAddGoogleBulk(rawInput, opts = {}) {
  let lines = String(rawInput || "").split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  let parsedAccounts = [];
  for (let line of lines) {
    if (line.startsWith("#")) continue;
    let parts = line.split("|").map(p => p.trim());
    if (parts.length >= 2) {
      let email = parts[0];
      let password = parts[1];
      let twoFactor = parts[2] || null;
      let recoveryOrProxy = parts[3] || null;
      let proxyPart = parts[4] || null;
      let recovery = null;
      let lineProxy = null;
      if (recoveryOrProxy) {
        if (recoveryOrProxy.includes(":") || recoveryOrProxy.startsWith("http") || recoveryOrProxy.startsWith("socks")) {
          lineProxy = recoveryOrProxy;
        } else if (recoveryOrProxy.includes("@")) {
          recovery = recoveryOrProxy;
        } else {
          twoFactor = twoFactor || recoveryOrProxy;
        }
      }
      if (proxyPart) lineProxy = proxyPart;
      parsedAccounts.push({ email, password, twoFactor, recovery, proxy: lineProxy });
    }
  }

  if (!parsedAccounts.length) throw new m(400, "Không nhận dạng được tài khoản Google nào (Cần định dạng: email|password hoặc email|password|2FA).");

  let concurrency = Math.min(8, Math.max(1, Number(opts.concurrency || opts.threads || 3)));
  b.info("app", `Bắt đầu thêm tự động ${parsedAccounts.length} tài khoản Google (chạy ${concurrency} tab song song)...`);

  let results = { total: parsedAccounts.length, success: 0, failed: 0, items: [] };
  let queue = [...parsedAccounts];

  const runAccount = async (acc, slotIdx) => {
    let name = acc.email;
    let proxyStr = acc.proxy || opts.proxy || null;

    if (!proxyStr && opts.proxy_pool && opts.proxy_pool.length) {
      proxyStr = opts.proxy_pool[slotIdx % opts.proxy_pool.length];
    }
    if (proxyStr) {
      try { proxyStr = nt(B(proxyStr)); } catch { proxyStr = null; }
    }

    let p = L(() => this.registry.add(name));
    this.registry.update(p.id, {
      login_method: 'google',
      ...(proxyStr ? { proxy: proxyStr } : {})
    });
    this.cacheGoogleCred(p.id, {
      email: acc.email,
      password: acc.password,
      twoFactor: acc.twoFactor,
      recovery: acc.recovery
    });

    let gridPos = calculateWindowGrid(slotIdx, concurrency);
    let client = new It({
      profileDir: this.registry.dir(p.id),
      outputDir: this.outputDir,
      headless: false,
      log: msg => b.info(p.name, msg),
      proxy: proxyStr ? B(proxyStr) : null,
      windowSize: { width: gridPos.width, height: gridPos.height },
      windowPosition: { x: gridPos.x, y: gridPos.y }
    });

    try {
      await client.start();
      let dolaCookies = await client.loginGoogleWithCredentials(acc, msg => b.info(p.name, msg), { holdOnError: true });
      this.cacheCookies(p.id, dolaCookies);
      let sess = await client.sessionInfo().catch(() => null);
      let credits = await client.creditsLeft().catch(() => null);
      this.registry.update(p.id, {
        login: true,
        enabled: true,
        health_status: 'healthy',
        session_expires: sess?.expires || null,
        last_check: new Date().toISOString(),
        rest_until: null,
        rest_reason: null,
        ...(credits !== null ? { credits, credits_date: mt() } : {})
      });
      await client.close().catch(() => {});
      this.startWorker(p.id);
      results.success++;
      results.items.push({ email: acc.email, ok: true });
    } catch (err) {
      try { await client.close(); } catch {}
      let errMsg = err instanceof Error ? err.message : String(err);
      this.registry.update(p.id, {
        login: false,
        health_status: 're-auth_required',
        rest_reason: errMsg,
        last_check: new Date().toISOString()
      });
      results.failed++;
      results.items.push({ email: acc.email, ok: false, error: errMsg });
    }
  };

  let inFlight = [];
  let availableSlots = Array.from({ length: concurrency }, (_, i) => i);

  for (let acc of queue) {
    if (availableSlots.length === 0) {
      await Promise.race(inFlight);
    }
    let slot = availableSlots.shift();
    let promise = runAccount(acc, slot).finally(() => {
      availableSlots.push(slot);
      inFlight = inFlight.filter(p => p !== promise);
    });
    inFlight.push(promise);
  }
  await Promise.all(inFlight);

  b.info("app", `Hoàn tất thêm hàng loạt Google: ${results.success}/${results.total} thành công, ${results.failed} lỗi.`);
  return results;
}

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
    let rawP = data.proxyhttp || data.proxy_http;
    if ((data.status === 100 || rawP) && rawP) {
      let clean = String(rawP).replace(/::+$/, "").replace(/:+$/, "");
      let parsed = B(clean);
      let canonical = nt(parsed);
      this.registry.update(profileId, { proxy: canonical });
      b.info(profile.name, "[TopProxy] Đã nhận IP: " + clean + (data["Vi Tri"] ? " (" + data["Vi Tri"] + ")" : ""));
      let w = this.workers.get(profileId);
      if (w && !profile.current_job) {
        await w.close().catch(() => {});
        w.stop();
        this.workers.delete(profileId);
        this.startWorker(profileId);
      }
      return canonical;
    } else {
      b.warn(profile.name, "[TopProxy] Chưa lấy được IP: " + (data.message || "status " + data.status));
    }
  } catch (err) {
    b.warn(profile.name, "[TopProxy] Lỗi kết nối API xoay: " + err.message);
  }
  return null;
}

async checkRotatingProxy(key) {
  let k = String(key || "").trim();
  if (!k) throw new m(400, "Vui lòng nhập key TopProxy / Proxy xoay");
  try {
    let data = await fetchProxyXoay(k);
    let rawP = data.proxyhttp || data.proxy_http;
    if ((data.status === 100 || rawP) && rawP) {
      let clean = String(rawP).replace(/::+$/, "").replace(/:+$/, "");
      let parsed = B(clean);
      return {
        ok: true,
        status: data.status,
        proxyhttp: clean,
        canonical: nt(parsed),
        masked: Pt(parsed),
        ip: clean,
        message: data.message || "Kết nối thành công",
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
assignProxies(){
  let s=this.settings;
  if(s.proxy_mode==="topproxy"){
    let rawKeys=String(s.topproxy_key||"").split(/[\r\n,;]+/).map(k=>k.trim()).filter(Boolean);
    if(!rawKeys.length)throw new m(400,"Vui lòng nhập Key TopProxy trong Cài đặt trước khi gán proxy.");
    let allP=this.registry.all();
    if(!allP.length)return{pool:rawKeys.length,assigned:0,shared:0,without:0};
    let count=0;
    for(let i=0;i<allP.length;i++){
      let r=allP[i];
      let k=rawKeys[i % rawKeys.length];
      this.registry.update(r.id,{proxy_rotate:!0,proxy_key:k});
      this.setupProxyRotation(r.id);
      count++;
    }
    b.info("app",`Đã gán ${rawKeys.length} Key TopProxy (API xoay) cho toàn bộ ${count} tài khoản`);
    return{pool:rawKeys.length,assigned:count,shared:0,without:0,mode:"topproxy"};
  }
  let t=s.proxy_pool,e=this.registry.all().filter(r=>!r.proxy);
  if(!t.length)throw new m(400,"Danh sách proxy tĩnh ở Cài đặt đang trống. Dán proxy vào đó trước (mỗi dòng một proxy) hoặc chọn chế độ TopProxy.");
  if(!e.length)return{pool:t.length,assigned:0,shared:0,without:0};
  let i=0;
  e.forEach((r,o)=>{this.registry.update(r.id,{proxy:t[o%t.length]}),i++});
  let n=Math.max(0,e.length-t.length);
  return b.info("app",`chia proxy: ${i} nick nhận proxy từ ${t.length} proxy${n?`, ${n} nick phải dùng chung (Loop Proxy)`:""}`),{pool:t.length,assigned:i,shared:n,without:0};
}wakeProfile(t){let p=this.registry.get(t);if(!p)throw new m(404,"Không tìm thấy tài khoản");if(p.login===!1)throw new m(400,"Tài khoản đã bị văng phiên Dola, bắt buộc phải đăng nhập lại!");let e=this.registry.update(t,{rest_until:null,rest_reason:null,credits:null,credits_date:null,enabled:!0});return this.scheduler.poke(),this.registry.toJSON(e)}wakeAllProfiles(t){let e=this.registry.all();if(Array.isArray(t)&&t.length>0){let s=new Set(t.map(String));e=e.filter(i=>s.has(i.id))}let n=0,r=0;for(let i of e){if(i.login===!1){r++;continue}let o=(i.credits_date===mt()&&i.credits===0)||je(i)||i.rest_until||!i.enabled;if(o){this.registry.update(i.id,{rest_until:null,rest_reason:null,credits:null,credits_date:null,enabled:!0});n++}}if(n>0)this.scheduler.poke();return{ok:!0,woken:n,skipped_vang:r}}async checkProxies(t){let e=(Array.isArray(t)?t:[]).map(String).map(o=>o.trim()).filter(Boolean).slice(0,50),i=[],n=0,r=async()=>{for(;n<e.length;){let o=e[n++],a;try{a=B(o)}catch(l){i.push({text:o,ok:!1,ms:0,error:l.message});continue}i.push({text:o,...await _e(a)})}};return await Promise.all(Array.from({length:Math.min(8,e.length)},r)),e.map(o=>i.find(a=>a.text===o))}pinnedJob(t,e){let i=this.registry.get(t);if(!i)throw new m(404,"kh\xF4ng c\xF3 profile");if(i.current_job)throw new m(400,`profile \xAB${i.name}\xBB \u0111ang b\u1EADn, ch\u1EDD job hi\u1EC7n t\u1EA1i xong`);this.startWorker(t);let n=wt({kind:e,profile:t,prompt:`[${e}] ${i.name}`});return this.scheduler.submit(n),n.id}requestLogin(t){return this.pinnedJob(t,"login")}requestCheck(t){return this.pinnedJob(t,"check")}cookieFile(t){return R.default.join(this.registry.dir(t),"dola-cookies.json")}cacheCookies(t,e){try{if(!Array.isArray(e)||e.length===0)return;A.default.mkdirSync(this.registry.dir(t),{recursive:!0});let f=this.cookieFile(t),old=[];if(A.default.existsSync(f)){try{let r=JSON.parse(A.default.readFileSync(f,"utf-8"));Array.isArray(r)&&(old=r)}catch{}}let hasNewSess=e.some(c=>(c.name==="sessionid"||c.name==="sessionid_ss"||c.name==="sid_tt")&&c.value),hasOldSess=old.some(c=>(c.name==="sessionid"||c.name==="sessionid_ss"||c.name==="sid_tt")&&c.value),toWrite=e;if(hasOldSess&&!hasNewSess){let m=new Map;for(let c of old)m.set(`${c.domain||""}|${c.path||""}|${c.name}`,c);for(let c of e)m.set(`${c.domain||""}|${c.path||""}|${c.name}`,c);let oldSess=old.find(c=>c.name==="sessionid"&&c.value);oldSess&&!e.some(c=>c.name==="sessionid"&&c.value)&&m.set(`${oldSess.domain||""}|${oldSess.path||""}|sessionid`,oldSess);let oldSid=old.find(c=>c.name==="sid_tt"&&c.value);oldSid&&!e.some(c=>c.name==="sid_tt"&&c.value)&&m.set(`${oldSid.domain||""}|${oldSid.path||""}|sid_tt`,oldSid);toWrite=[...m.values()]}A.default.writeFileSync(f,JSON.stringify(toWrite,null,2))}catch{}}dolaCookies(t){try{let e=JSON.parse(A.default.readFileSync(this.cookieFile(t),"utf-8"));return Array.isArray(e)?e:[]}catch{return[]}}fbCookieFile(t){return R.default.join(this.registry.dir(t),"fb-cookies.json")}fbCredFile(t){return R.default.join(this.registry.dir(t),"fb-credentials.json")}cacheFbCred(t,e){try{A.default.mkdirSync(this.registry.dir(t),{recursive:!0}),A.default.writeFileSync(this.fbCredFile(t),JSON.stringify(e,null,2))}catch{}}fbCred(t){try{let e=JSON.parse(A.default.readFileSync(this.fbCredFile(t),"utf-8"));return e&&typeof e==="object"?e:null}catch{return null}}cacheFbCookies(t,e){try{A.default.mkdirSync(this.registry.dir(t),{recursive:!0}),A.default.writeFileSync(this.fbCookieFile(t),JSON.stringify(e))}catch{}}fbCookies(t){try{let e=JSON.parse(A.default.readFileSync(this.fbCookieFile(t),"utf-8"));return Array.isArray(e)?e:[]}catch{return[]}}async openRealBrowser(t,targetUrl=null){
  let i=this.registry.get(t);
  if(!i)throw new m(400,"profile không tồn tại");
  let worker=this.workers.get(t);
  let isBusy=!!(i.current_job||worker?.profile?.current_job||(worker&&worker.state==="busy")||(this.store&&this.store.list().some(j=>j.status==="running"&&(j.assigned===t||j.profile===t))));
  const needsLogin=!i.login||!!i.rest_reason;
  let dir=this.registry.dir(t);

  // NẾU ĐANG CHẠY TASK (isBusy):
  // TUYỆT ĐỐI KHÔNG GỌI cl.close() VÀ KHÔNG GỌI killOrphans!
  if(isBusy&&!needsLogin){
    let runningJob=i.current_job?this.store.get(i.current_job):null;
    let convUrl=targetUrl||runningJob?.result?.conversation_url||runningJob?.conversation_url||worker?.conversationUrl||worker?.client?.conversationUrl||G;
    if(worker&&worker.client){
      b.info("app",`Đang mở cửa sổ xem cuộc trò chuyện của task cho «${i.name}»`);
      (async()=>{
        try{
          if(worker.client.alive&&worker.client.page&&!worker.client.page.isClosed()){
            await Promise.resolve(worker.client?.showWindow?.(!0)).catch(()=>{});
            await worker.client.page.bringToFront().catch(()=>{});
            await Re(dir).catch(()=>{});
            return;
          }
          await worker.client.relaunchIfClosed(convUrl).catch(()=>{});
          await Promise.resolve(worker.client?.showWindow?.(!0)).catch(()=>{});
          if(worker.client.page&&!worker.client.page.isClosed()){
            await worker.client.page.bringToFront().catch(()=>{});
          }
          await Re(dir).catch(()=>{});
        }catch{}
      })();
      return;
    }
  }

  this.activeBrowsers=this.activeBrowsers||new Map();
  if(this.activeBrowsers.has(t)){
    let c=this.activeBrowsers.get(t);
    try{
      let p=c.pages().filter(pg=>!pg.isClosed());
      if(p.length){
        let curU=p[0].url()||"";
        let needNav=targetUrl&&curU.split('?')[0].replace(/\/+$/,'')!==targetUrl.split('?')[0].replace(/\/+$/,'');
        if(needNav){
          p[0].goto(targetUrl,{waitUntil:"domcontentloaded"}).catch(()=>{});
        }
        p[0].bringToFront().catch(()=>{});
        Re(dir).catch(()=>{});
        return;
      }
    }catch{}
    this.activeBrowsers.delete(t);
  }

  let w=this.workers.get(t);
  if(w&&w.client&&!isBusy){
    let cl=w.client;
    w.client=null;
    w.loggedIn=null;
    try{cl.close()}catch{}
  }
  if(!isBusy){
    It.killOrphans(dir);
  }
  let exe=xt();
  if(!exe)throw new m(400,"Không tìm thấy Chromium.");
  let po=void 0,cr=void 0;let effectiveProxy=i.proxy;if(!effectiveProxy){let setts=this.settings;if(setts.proxy_pool&&setts.proxy_pool.length>0){let allP=this.registry.all();let pIdx=allP.findIndex(x=>x.id===t);effectiveProxy=setts.proxy_pool[(pIdx>=0?pIdx:0)%setts.proxy_pool.length];}}if(effectiveProxy)try{let bp=B(effectiveProxy);po={server:bp.server};bp.username&&(cr={username:bp.username,password:bp.password||""})}catch{}
  let _slot=(globalThis.__loginWindowSlot=(globalThis.__loginWindowSlot||0)+1)%6;
  let _wW=860,_wH=720;
  let _wX=Math.max(80,120+(_slot%3)*50),_wY=Math.max(60,60+Math.floor(_slot/3)*40);
  return (async()=>{
    let ctx=await We.chromium.launchPersistentContext(dir,{
      headless:!1,
      executablePath:exe,
      viewport:null,
      proxy:po,
      httpCredentials:cr,
      args:[
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-blink-features=AutomationControlled",
        `--window-size=${_wW},${_wH}`,
        `--window-position=${_wX},${_wY}`
      ]
    });
    this.activeBrowsers.set(t,ctx);
    Re(dir).catch(()=>{});
    let lastSeenCredits=null,lastSeenLoggedIn=!1,lastSessionExpires=null,closedHandled=!1,dolaAccountName=null;
    let doSync=async()=>{
      try{
        let allCookies=await ctx.cookies().catch(()=>[]);
        if(allCookies&&allCookies.length){
          let dola=allCookies.filter(c=>/dola\.com|bytedance|byteoversea|tiktok/i.test(c.domain||""));
          if(dola.length){
            this.cacheCookies(t,dola);
            let sessCookie=dola.find(c=>c.name==="sessionid"||c.name==="sid_tt");
            if(sessCookie&&sessCookie.value){
              lastSeenLoggedIn=!0;
              if(sessCookie.expires>0)lastSessionExpires=new Date(sessCookie.expires*1000).toISOString();
            }
          }
          let fb=allCookies.filter(c=>/facebook\.com/i.test(c.domain||""));
          if(fb.length)this.cacheFbCookies(t,fb);
        }
        let pages=ctx.pages();
        for(let p of pages){
          if(p.isClosed())continue;
          let u=p.url()||"";if(!u.includes("dola.com"))continue;let txt=await p.innerText("body").catch(()=>"");
          let match=txt.match(Xi);
          if(match)lastSeenCredits=Number(match[1]);
          let hasAvatar=await p.locator('img[src*="ibyteimg"], img[src*="user-avatar"]').first().isVisible().catch(()=>false);
          if(hasAvatar)lastSeenLoggedIn=!0;

          // Quét tên tài khoản Dola thật nếu người dùng chưa đặt tên riêng
          if(!dolaAccountName){
            try{
              dolaAccountName=await p.evaluate(()=>{
                let btn=document.querySelector('button[class*="user"], div[class*="user-info"], [class*="avatar"] + span, [class*="avatar"] + div, div[class*="truncate"]');
                if(btn&&btn.innerText&&btn.innerText.trim().length>1&&btn.innerText.trim().length<50){
                  return btn.innerText.trim();
                }
                for(let k=0;k<localStorage.length;k++){
                  let key=localStorage.key(k);
                  if(/user|profile|account/i.test(key)){
                    try{
                      let val=JSON.parse(localStorage.getItem(key));
                      let n=val?.nickname||val?.user_name||val?.username||val?.name||val?.user_info?.nickname;
                      if(n&&typeof n==='string'&&n.trim().length>1) return n.trim();
                    }catch{}
                  }
                }
                return null;
              }).catch(()=>null);
            }catch{}
          }
        }
      }catch{}
    };
    let syncTimer=setInterval(doSync,6000);
    let onClosed=async()=>{
      if(closedHandled)return;
      closedHandled=!0;
      clearInterval(syncTimer);
      this.activeBrowsers.delete(t);
      try{await doSync()}catch{}
      let curCookies=this.dolaCookies(t);
      let hasSess=curCookies.some(c=>(c.name==="sessionid"||c.name==="sessionid_ss"||c.name==="sid_tt")&&c.value);
      let prof=this.registry.get(t);
      let isLog=hasSess||lastSeenLoggedIn||(prof&&prof.login===true);
      let shouldUpdateName=dolaAccountName&&prof&&(!prof.name||/^(\d+|Nick\s*\d+|Profile\s*\d+)$/i.test(prof.name));
      this.registry.update(t,{
        ...(shouldUpdateName?{name:dolaAccountName}:{}),
        login:isLog,
        session_expires:lastSessionExpires,
        last_check:new Date().toISOString(),
        ...(lastSeenCredits!==null?{credits:lastSeenCredits,credits_date:mt()}:{}),
        ...(isLog?{rest_reason:null}:{rest_reason:"Bị văng phiên Dola"})
      });
      this.startWorker(t);
      this.scheduler.poke();
      let displayName=shouldUpdateName?dolaAccountName:(prof?.name||i.name);
      b.info("app",`Đã đóng trình duyệt «${displayName}»: tự động cập nhật cookie (${curCookies.length} cookie), trạng thái: ${isLog?'đã đăng nhập':'chưa đăng nhập'}${lastSeenCredits!==null?', '+lastSeenCredits+' credit':''}`);
    };
    ctx.on("close",onClosed);
    ctx.on("page",newP=>{
      newP.on("close",async()=>{
        await doSync();
        let activeP=ctx.pages().filter(p=>!p.isClosed());
        if(activeP.length===0){
          try{await ctx.close()}catch{}
        }
      });
    });
    try{
      let fbc=this.fbCookies(t);
      if(fbc.length){
        let oneYear=Math.floor(Date.now()/1000)+365*86400;
        let normFb=fbc.map(c=>({
          name:c.name.trim(),
          value:c.value.trim(),
          domain:c.domain&&c.domain.includes("facebook")?c.domain:".facebook.com",
          path:c.path||"/",
          secure:!0,
          httpOnly:c.httpOnly??(c.name==="xs"||c.name==="datr"),
          sameSite:"Lax",
          expires:c.expires&&c.expires>0?Math.floor(c.expires):(c.expirationDate&&c.expirationDate>0?Math.floor(c.expirationDate):oneYear)
        }));
        await ctx.addCookies(normFb);
      }
      let dlc=this.dolaCookies(t);
      if(dlc.length)await ctx.addCookies(dlc);
    }catch{}
    let existingP=ctx.pages();
    let pg=existingP.length>0?existingP[0]:await ctx.newPage();
    for(let k=1;k<existingP.length;k++){
      if(!existingP[k].isClosed()&&(existingP[k].url()==="about:blank"||existingP[k].url().startsWith("chrome://"))){
        try{await existingP[k].close()}catch{}
      }
    }
    try{
      let cdp=await ctx.newCDPSession(pg);
      let{windowId:wId}=await cdp.send("Browser.getWindowForTarget");
      await cdp.send("Browser.setWindowBounds",{windowId:wId,bounds:{left:_wX,top:_wY,width:_wW,height:_wH,windowState:"normal"}});
      await cdp.send("Page.bringToFront").catch(()=>{});
      await cdp.detach().catch(()=>{});
    }catch{}
    let dest=targetUrl||G;
    let u=pg.url();
    (!u||u==="about:blank"||u.startsWith("chrome://")||targetUrl)&&await pg.goto(dest,{waitUntil:"domcontentloaded"}).catch(()=>{});
    await pg.bringToFront().catch(()=>{});
    await Re(dir).catch(()=>{});
  })();
}async showProfileWindow(t,e=!0,mode,targetUrl=null){
  let i=this.registry.get(t);
  if(!i)throw new m(400,"profile không tồn tại");
  let worker=this.workers.get(t);
  let isBusy=!!(i.current_job||worker?.profile?.current_job||(worker&&worker.state==="busy")||(this.store&&this.store.list().some(j=>j.status==="running"&&(j.assigned===t||j.profile===t))));
  let dir=this.registry.dir(t);

  // Nếu người dùng yêu cầu đóng cửa sổ (show: false)
  if(!e){
    if(this.activeBrowsers&&this.activeBrowsers.has(t)){
      let c=this.activeBrowsers.get(t);
      try{await c.close()}catch{}
      this.activeBrowsers.delete(t);
    }
    if(worker&&worker.client&&worker.client.alive&&!isBusy){
      await Promise.resolve(worker.client?.showWindow?.(!1)).catch(()=>{});
    }
    return{ok:!0};
  }

  // 1. NẾU PROFILE ĐANG CHẠY TẠO VIDEO (isBusy):
  // ƯU TIÊN HÀNG ĐẦU — Dù người dùng bấm mở bao nhiêu lần (lần 1, 2, 3...)
  // VẪN LUÔN HIỆN CỬA SỔ LÊN ĐƯỢC VÀ TUYỆT ĐỐI KHÔNG LÀM HỎNG TASK!
  const needsLogin=!i.login||!!i.rest_reason;
  if(isBusy&&!needsLogin){
    let runningJob=i.current_job?this.store.get(i.current_job):null;
    if(!runningJob&&this.store){
      runningJob=this.store.list().find(j=>j.status==="running"&&(j.assigned===t||j.profile===t))||null;
    }
    let convUrl=targetUrl||runningJob?.result?.conversation_url||runningJob?.conversation_url||worker?.conversationUrl||worker?.client?.conversationUrl||G;

    if(worker&&worker.client){
      b.info("app",`Đang mở cửa sổ xem cuộc trò chuyện của task cho «${i.name}»`);
      // Nếu Chrome đang sống: kéo ra giữa màn hình và kích hoạt focus
      if(worker.client.alive&&worker.client.page&&!worker.client.page.isClosed()){
        await Promise.resolve(worker.client?.showWindow?.(!0)).catch(()=>{});
        await worker.client.page.bringToFront().catch(()=>{});
        await Re(dir).catch(()=>{});
        return{ok:!0};
      }
      // Nếu Chrome đã bị đóng ngoài ý muốn: tự động hồi sinh / mở lại tại đúng convUrl của task đó
      await worker.client.relaunchIfClosed(convUrl).catch(()=>{});
      await Promise.resolve(worker.client?.showWindow?.(!0)).catch(()=>{});
      if(worker.client.page&&!worker.client.page.isClosed()){
        await worker.client.page.bringToFront().catch(()=>{});
      }
      await Re(dir).catch(()=>{});
      return{ok:!0};
    }
    return{ok:!0};
  }

  // 2. Kiểm tra nếu Chrome của profile này đã mở sẵn trong activeBrowsers
  if(this.activeBrowsers&&this.activeBrowsers.has(t)){
    let c=this.activeBrowsers.get(t);
    try{
      let p=c.pages().filter(pg=>!pg.isClosed());
      if(p.length){
        let curU=p[0].url()||"";
        let needNav=targetUrl&&curU.split('?')[0].replace(/\/+$/,'')!==targetUrl.split('?')[0].replace(/\/+$/,'');
        if(needNav){
          await p[0].goto(targetUrl,{waitUntil:"domcontentloaded"}).catch(()=>{});
        }
        await p[0].bringToFront().catch(()=>{});
        await Re(dir).catch(()=>{});
        return{ok:!0};
      }
    }catch{}
    this.activeBrowsers.delete(t);
  }

  // 3. Nếu không bận: đóng client idle nếu có để mở khóa thư mục profile
  if(worker&&worker.client){
    let cl=worker.client;
    worker.client=null;
    worker.loggedIn=null;
    try{await cl.close()}catch{}
  }
  // Mở trình duyệt Chrome thật
  return await this.openRealBrowser(t,targetUrl);
}listAssets(){return this.assets.list()}addAsset(t){return L(()=>this.assets.add(t))}updateAsset(t,e){return L(()=>this.assets.update(t,e))}removeAsset(t){return L(()=>this.assets.remove(t))}removeAllAssets(ids=null){return L(()=>{if(!ids||!ids.length){let c=this.assets.items.size;this.assets.clear();return{ok:!0,removed:c};}let c=0;for(let id of ids){try{this.assets.remove(id);c++;}catch(_){}}return{ok:!0,removed:c};})}addAssetImage(t,e){return L(()=>this.assets.addImage(t,e))}removeAssetImage(t,e){L(()=>this.assets.removeImage(t,e))}setAssetImageRole(t,e,i){L(()=>this.assets.setImageRole(t,e,i))}assetImagePath(t,e){return L(()=>this.assets.imagePath(t,e),404)}saveUpload(t,e){let i=String(e??"").split(",").pop()??"",n=Buffer.from(i,"base64");if(!n.length||n.length>mn)throw new m(400,"\u1EA3nh r\u1ED7ng ho\u1EB7c qu\xE1 20 MB");let r=String(t??"image").replace(/[^A-Za-z0-9._-]+/g,"-").replace(/^[-.]+|[-.]+$/g,"")||"image",o=`${se.default.randomBytes(4).toString("hex")}-${r}`;return A.default.mkdirSync(this.uploadsDir,{recursive:!0}),A.default.writeFileSync(R.default.join(this.uploadsDir,o),n),{id:o,name:t,size:n.length}}uploadPath(t){if(!t)throw new m(400,"id ảnh không hợp lệ");let safeName=R.default.basename(t);let e=R.default.join(this.uploadsDir,safeName);if(A.default.existsSync(e))return e;if(A.default.existsSync(t)&&A.default.statSync(t).isFile())return t;throw new m(400,`ảnh ${safeName} chưa được tải lên`);}folderFor(t){let e=t?R.default.dirname(this.videoPath(t)):this.outputDir;return A.default.mkdirSync(e,{recursive:!0}),e}
parseTelegramChatIds(raw){
  if(!raw)return[];
  let list=[];
  if(Array.isArray(raw))list=raw.map(String);
  else list=String(raw).split(/[\r\n,;\s]+/);
  let seen=new Set(),res=[];
  for(let s of list){
    s=s.trim();
    if(s&&/^-?\d+$/.test(s)&&!seen.has(s)){
      seen.add(s);
      res.push(s);
    }
  }
  return res;
}
async sendTelegramAlert({accountName=null,errorCode=null,text,photoPath=null}){
  try{
    let setts=this.settings;
    let tok=getTelegramBotToken(this.baseDir,setts);
    let chatIds=this.parseTelegramChatIds(setts.telegram_chat_id);
    if(!tok||!chatIds.length)return!1;
    if(!telegramRateLimiter.canSend(accountName,errorCode))return!1;
    let photoBuf=null;
    if(setts.telegram_send_screenshot!==false&&photoPath&&A.default.existsSync(photoPath)){
      try{photoBuf=A.default.readFileSync(photoPath);}catch(_){}
    }
    let successCount=0;
    for(let cid of chatIds){
      try{
        let sent=!1;
        if(photoBuf){
          try{
            let form=new FormData();
            form.append("chat_id",cid);
            form.append("caption",text.slice(0,1024));
            form.append("parse_mode","HTML");
            form.append("photo",new Blob([photoBuf],{type:"image/png"}),"error_screenshot.png");
            let res=await fetch(`https://api.telegram.org/bot${encodeURIComponent(tok)}/sendPhoto`,{method:"POST",body:form});
            if(res.ok)sent=!0;
          }catch(err){b.warn("telegram",`Gửi ảnh tới admin ${cid} lỗi: `+(err?.message||err));}
        }
        if(!sent){
          let res=await fetch(`https://api.telegram.org/bot${encodeURIComponent(tok)}/sendMessage`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:cid,text,parse_mode:"HTML"})});
          if(res.ok)sent=!0;
        }
        if(sent)successCount++;
      }catch(err){b.warn("telegram",`Lỗi gửi Telegram tới ${cid}: `+(err?.message||err));}
    }
    if(successCount>0){
      telegramRateLimiter.recordSent(accountName,errorCode);
      return!0;
    }
    return!1;
  }catch(err){
    b.warn("telegram","Lỗi Telegram: "+(err?.message||err));
    return!1;
  }
}
async testTelegram(token,chatId){let rawTk=String(token||"").trim();let tok=(!rawTk||rawTk.includes("•"))?getTelegramBotToken(this.baseDir,this.settings):rawTk;let cleanTok=String(tok||"").replace(/^https?:\/\/api\.telegram\.org\/bot/i,"").replace(/^bot/i,"").trim();let chatIds=this.parseTelegramChatIds(chatId||this.settings.telegram_chat_id);if(!cleanTok||!chatIds.length)throw new m(400,"Vui lòng nhập đầy đủ Telegram Bot Token và ít nhất một Chat ID admin (chỉ gồm số).");let text=`✅ <b>Alex Bright Tool - Test Kết Nối Telegram Thành Công!</b>\n🤖 Bot đã sẵn sàng nhận thông báo lỗi tạo video và tài khoản.\n👥 Đang gửi tới <b>${chatIds.length} admin</b>.\n⏱ Thời gian test: ${new Date().toLocaleString('vi-VN')}`;let success=[],fails=[];for(let cid of chatIds){try{let res=await fetch(`https://api.telegram.org/bot${cleanTok}/sendMessage`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:cid,text,parse_mode:"HTML"})});let json=await res.json().catch(()=>({}));if(res.ok&&json.ok){success.push(cid);}else{let desc=json.description||res.statusText||String(res.status);if(/chat not found/i.test(desc))desc+=" (Bạn cần mở Bot trên Telegram và bấm START)";else if(/Unauthorized/i.test(desc))desc="Token bot không đúng hoặc đã bị thu hồi";fails.push(`${cid} (${desc})`);}}catch(err){fails.push(`${cid} (${err?.message||err})`);}}if(success.length===0){throw new m(400,`Gửi test thất bại cho toàn bộ ${chatIds.length} Chat ID: ${fails.join(', ')}`);}let msg=`Gửi tin nhắn test thành công tới ${success.length}/${chatIds.length} admin!`;if(fails.length>0){msg+=` (Lỗi ${fails.length} ID: ${fails.join(', ')})`;}return{ok:!0,message:msg,success_count:success.length,total:chatIds.length};}
exportProfileCookies(t){let p=this.registry.get(t);if(!p)throw new m(404,"Không tìm thấy profile.");let cs=this.dolaCookies(t);return{ok:!0,profile:{id:p.id,name:p.name},cookies:cs,cookie_string:cs.map(c=>`${c.name}=${c.value}`).join("; "),total:cs.length}}
exportAllCookies(){let list=this.registry.all().map(p=>{let cs=this.dolaCookies(p.id);return{id:p.id,name:p.name,proxy:p.proxy||null,enabled:p.enabled,login:p.login,credits:p.credits,total_cookies:cs.length,cookie_string:cs.map(c=>`${c.name}=${c.value}`).join("; "),cookies:cs}});return{ok:!0,total_profiles:list.length,profiles:list}}
exportCookiesToFile(profileId=null){
  let data;
  let filename;
  let count=0;
  if(profileId){
    let p=this.registry.get(profileId);
    let cs=this.dolaCookies(profileId);
    data=JSON.stringify(cs,null,2);
    filename=`dola_cookie_${(p?.name||profileId).replace(/[^a-zA-Z0-9_-]/g,'_')}.json`;
    count=cs.length;
  }else{
    let all=this.exportAllCookies();
    data=JSON.stringify(all,null,2);
    filename=`dola_cookies_all_${new Date().toISOString().slice(0,10)}.json`;
    count=all.total_profiles;
  }
  let outDir=this.outputDir;
  A.default.mkdirSync(outDir,{recursive:!0});
  let outPath=R.default.join(outDir,filename);
  A.default.writeFileSync(outPath,data,'utf8');
  try{
    const {shell}=require('electron');
    shell.showItemInFolder(outPath);
  }catch{}
  return{ok:!0,path:outPath,filename,count};
}
};function wn(s){let t=String(s??""),e=[],i=0,n=-1,r=!1,o=!1,a="",l=()=>{for(let c of a.split(/\r?\n/))c.trim()&&e.push(c.trim());a=""};for(let c=0;c<t.length;c++){let d=t[c];if(i===0){if(d==="["||d==="{"){l(),i=1,n=c,r=!1;continue}a+=d;continue}if(r){o?o=!1:d==="\\"?o=!0:d==='"'&&(r=!1);continue}d==='"'?r=!0:d==="["||d==="{"?i++:(d==="]"||d==="}")&&(i--,i===0&&(e.push(t.slice(n,c+1)),n=-1))}return i>0&&n>=0&&(a+=t.slice(n)),l(),e}/* TOR_PROXY_INTEGRATION_V1 */
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
var vn=32*1024*1024,pi={".ttf":"font/ttf",".woff2":"font/woff2",".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".svg":"image/svg+xml",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8"};function w(s,t,e){let i=Buffer.from(JSON.stringify(e));s.writeHead(t,{"Content-Type":"application/json; charset=utf-8","Content-Length":i.length}),s.end(i)}function $(s){return new Promise((t,e)=>{let i=[],n=0;s.on("data",r=>{if(n+=r.length,n>vn){e(new m(413,"body qu\xE1 l\u1EDBn")),s.destroy();return}i.push(r)}),s.on("end",()=>{let r=Buffer.concat(i).toString("utf-8");if(!r.trim())return t({});try{t(JSON.parse(r))}catch{e(new m(400,"JSON kh\xF4ng h\u1EE3p l\u1EC7"))}}),s.on("error",e)})}function Wt(s,t,e,i,n=!1){let r=tt.default.statSync(e).size,o=Q.default.basename(e),a={"Content-Type":i,"Accept-Ranges":"bytes","Content-Disposition":`${n?"attachment":"inline"}; filename="${o.replace(/"/g, "")}"; filename*=UTF-8''${encodeURIComponent(o)}`},l=s.headers.range,c=l&&/^bytes=(\d*)-(\d*)$/.exec(l);if(c){let d=c[1]?Number(c[1]):0,u=c[2]?Number(c[2]):r-1;if(!c[1]&&c[2]&&(d=Math.max(0,r-Number(c[2])),u=r-1),d>u||d>=r){t.writeHead(416,{"Content-Range":`bytes */${r}`}),t.end();return}u=Math.min(u,r-1),t.writeHead(206,{...a,"Content-Range":`bytes ${d}-${u}/${r}`,"Content-Length":u-d+1}),tt.default.createReadStream(e,{start:d,end:u}).pipe(t);return}t.writeHead(200,{...a,"Content-Length":r}),tt.default.createReadStream(e).pipe(t)}function fi(s,t=0){let{studio:e}=s;async function i(r,o){let a=new URL(r.url||"/","http://127.0.0.1"),l=(r.method||"GET").toUpperCase(),c=a.pathname.split("/").filter(Boolean);if(c.length===0&&l==="GET"){let g=tt.default.readFileSync(s.uiFile);return o.writeHead(200,{"Content-Type":"text/html; charset=utf-8","Content-Length":g.length,"Cache-Control":"no-store"}),void o.end(g)}if(c[0]==="assets"&&l==="GET"){let g=c.slice(1).join("/"),f=Q.default.join(Q.default.dirname(s.uiFile),"assets"),_=Q.default.join(f,g);if(g.includes("..")||!_.startsWith(f)||!tt.default.existsSync(_)||!tt.default.statSync(_).isFile())throw new m(404,"kh\xF4ng c\xF3 file n\xE0y");return o.setHeader("Cache-Control","no-cache"),Wt(r,o,_,pi[Q.default.extname(_)]||"application/octet-stream")}if(c[0]!=="api")throw new m(404,"kh\xF4ng c\xF3 \u0111\u01B0\u1EDDng d\u1EABn n\xE0y");let[,u,h,p,y]=c;if(u==="jobs"&&(l==="POST"||l==="PUT")&&(!s.license||!s.license.authorizeJob())){throw new m(403,s.license?.reason||"Bản quyền chưa được kích hoạt hoặc đã hết hạn ân hạn.");}if(u!=="license"&&!(r.headers["x-token"]===s.token||a.searchParams.get("t")===s.token))throw new m(401,"thi\u1EBFu token");if(u==="tor"){if(l==="GET")return w(o,200,torManager.status());if(h==="rotate"&&l==="POST"){await torManager.rotateIp();return w(o,200,{ok:!0,status:torManager.status()})}if(h==="start"&&l==="POST"){await torManager.start();return w(o,200,{ok:!0,status:torManager.status()})}if(h==="stop"&&l==="POST"){torManager.stop();return w(o,200,{ok:!0,status:torManager.status()})}}if(u==="license"){if(l==="GET"&&!h){return w(o,200,s.license?s.license.status():{ok:!1,verified:!1,reason:"Chưa khởi tạo bản quyền"});}if(l==="POST"&&h==="trial"){return w(o,200,s.license?await s.license.recheck():{ok:!1});}if(l==="POST"&&h==="activate"){let body=await $(r);let res=s.license?await s.license.activate(body?.key):{ok:!1,reason:"Chưa khởi tạo license manager"};return w(o,200,res);}}let x=s.license?s.license.status():null,N=!0;if(u==="state"&&l==="GET")return w(o,200,e.state());if(u==="logs"){if(l==="GET"&&!h){let g=Number(a.searchParams.get("since")??0)||0,f=a.searchParams.get("level")??"",_=a.searchParams.get("scope")??"";return w(o,200,{entries:b.since(g,{level:f,scope:_}),last_seq:b.lastSeq,scopes:b.scopes()})}if(l==="GET"&&h==="export"){let g=Buffer.from(b.exportText(),"utf-8");return o.writeHead(200,{"Content-Type":"text/plain; charset=utf-8","Content-Length":g.length,"Content-Disposition":`attachment; filename="seedance-video-log-${new Date().toISOString().slice(0,10)}.txt"`}),void o.end(g)}if(l==="POST"&&h==="clear")return b.clear(),w(o,200,{ok:!0})}if(u==="settings"){if(l==="GET"&&!h)return w(o,200,{settings:e.settings,placeholders:e.filenamePreview(e.settings.filename_template).placeholders});if(l==="POST"&&!h)return w(o,200,e.updateSettings(await $(r)));if(l==="GET"&&h==="filename-preview")return w(o,200,e.filenamePreview(a.searchParams.get("template")??""));if(l==="POST"&&h==="test-telegram"){let g=await $(r);return w(o,200,await e.testTelegram(g.token,g.chat_id))}}if(u==="pick-folder"&&l==="POST"){if(!s.pickFolder)throw new m(400,"Chọn thư mục chỉ dùng được trong app.");return w(o,200,{path:await s.pickFolder()})}if(u==="dev"&&h==="screenshot"&&l==="GET"&&s.captureWindow){let g=await s.captureWindow();o.writeHead(200,{"Content-Type":"image/png","Content-Length":g.length}),o.end(g);return}if(u==="gallery"){
  if(l==="GET"&&!h)return w(o,200,{videos:await e.listGalleryVideos()});
  if(l==="POST"&&h==="merge"){let g=await $(r);return w(o,200,await e.mergeVideos(g.files,g.title,g.trims));}
  if(l==="POST"&&h==="delogo"){let g=await $(r);let files=Array.isArray(g.filenames)?g.filenames:(g.filename?[g.filename]:(g.files||[]));return w(o,200,await e.delogoGalleryVideos(files));}
  if(l==="POST"&&h==="delete"){let g=await $(r);if(g.all)return w(o,200,await e.deleteAllGalleryVideos());if(Array.isArray(g.filenames)){for(let f of g.filenames){await e.deleteGalleryVideo(f);}return w(o,200,{ok:!0});}return w(o,200,await e.deleteGalleryVideo(g.filename));}
  if(l==="GET"&&h==="video"){let fn=a.searchParams.get("file");let vp=e.galleryVideoPath(fn);let isDl=a.searchParams.get("dl")==="1"||a.searchParams.get("download")==="1";return Wt(r,o,vp,"video/mp4",isDl);}
  if(l==="GET"&&h==="thumb"){let fn=a.searchParams.get("file");return Wt(r,o,await e.galleryThumbPath(fn),"image/jpeg");}
  if(l==="POST"&&h==="open-folder"){let op=e.outputDir;try{require("electron").shell.openPath(op)}catch(err){}return w(o,200,{ok:!0,path:op});}
}if(u==="jobs"){if(l==="POST"&&!h){if(!s.license?.isPro)throw new m(403,"Bản quyền chưa được kích hoạt hoặc đã hết hạn. Vui lòng kích hoạt key.");let g=await $(r);return w(o,200,{ids:await e.submitGenerate(g,null)})}if(h==="bulk"&&!p&&l==="POST"){let g=await $(r),f=String(g.action??"");if(f==="delete"&&g.filter==="done")f="delete_done";if(f==="retry"&&g.filter==="error")f="retry_failed";if(f==="cancel"&&g.filter==="queued")f="cancel_queued";if(!["retry","delete","cancel","retry_failed","delete_done","cancel_queued"].includes(f))throw new m(400,"action kh\xF4ng h\u1EE3p l\u1EC7");return w(o,200,await e.bulk(f,g.ids,x?.remaining??null))}if(h==="pause"&&!p&&l==="POST"){let g=await $(r);return e.pause(g.paused!==!1),w(o,200,{paused:e.scheduler.isPaused})}if(h==="start"&&!p&&l==="POST"){e.pause(!1);e.scheduler.poke();return w(o,200,{ok:!0,paused:!1})}if(h==="stop"&&!p&&l==="POST"){e.pause(!0);let q=e.store.queued();for(let it of q)e.store.cancel(it.id);e.scheduler.poke();return w(o,200,{ok:!0,cancelled:q.length})}if(h&&p==="images"&&(l==="PATCH"||l==="POST")){let g=await $(r);let jb=e.store.get(h);if(!jb)throw new m(404,"Không tìm thấy job");if(jb.status!=="queued")throw new m(400,"Chỉ có thể đổi ảnh khi job đang ở trạng thái chờ");let imgs=Array.isArray(g.images)?g.images:(g.image_ids?g.image_ids:[]);jb.images=imgs;jb.image_ids=imgs.map(im=>typeof im==="object"?im.id:im).filter(Boolean);e.store.save();return w(o,200,{ok:!0,id:h,images:jb.images,image_ids:jb.image_ids})}if(h&&p==="prompt"&&(l==="PATCH"||l==="POST")){let g=await $(r);let np=String(g.prompt||"").trim();if(!np)throw new m(400,"Prompt không được để trống");let jb=e.store.get(h);if(!jb)throw new m(404,"Không tìm thấy job");if(jb.status!=="queued")throw new m(400,"Chỉ có thể sửa prompt khi job đang ở trạng thái chờ");jb.prompt=np;e.store.save();e.scheduler.poke();return w(o,200,{ok:!0,id:h,prompt:np})}if(h&&p==="video"&&l==="GET"){let _vp=e.videoPath(h);try{await He(_vp)}catch(err){}return Wt(r,o,_vp,"video/mp4");}if(h&&p==="thumb"&&l==="GET")return Wt(r,o,await e.thumbPath(h),"image/jpeg");if(h&&p==="cancel"&&l==="POST")return await e.cancel(h),w(o,200,{ok:!0});if(h&&p==="retry"&&l==="POST"){let g=await $(r).catch(()=>({})),f=Number(g?.duration);return w(o,200,{id:await e.retry(h,x?.remaining??null,Number.isFinite(f)&&f>0?{duration:f}:{})})}if(h&&p==="rescan-video"&&l==="POST")return w(o,200,await e.rescanVideo(h));if(h&&p==="recover"&&l==="POST")return w(o,200,{id:await e.recover(h,x?.remaining??null)});if(h&&!p&&l==="DELETE")return await e.delete(h),w(o,200,{ok:!0})}if(u==="upload"&&l==="POST"){let g=await $(r);return w(o,200,e.saveUpload(String(g.name??"image"),String(g.data_b64??"")))}if((u==="uploads"||u==="upload")&&l==="GET"&&h){let safeName=Q.default.basename(decodeURIComponent(h));let filePath=R.default.join(e.uploadsDir,safeName);if(tt.default.existsSync(filePath)&&tt.default.statSync(filePath).isFile()){let ext=Q.default.extname(filePath).toLowerCase();let mimeType=pi[ext]||"image/jpeg";return Wt(r,o,filePath,mimeType);}throw new m(404,"Không tìm thấy ảnh tải lên: "+safeName);}if(u==="profiles"){if(h==="export-file"&&l==="POST"){let g=await $(r).catch(()=>({}));return w(o,200,e.exportCookiesToFile(g.profile_id||null));}if(h==="export-all-cookies"&&l==="GET")return w(o,200,e.exportAllCookies());if(h&&p==="cookies"&&l==="GET")return w(o,200,e.exportProfileCookies(h));if(h==="quick-add"&&p==="start"&&l==="POST"){let g=await $(r);return w(o,200,await e.quickAddStart(String(g.name??""),{proxy:typeof g.proxy=="string"?g.proxy:null,proxy_rotate:!!g.proxy_rotate,proxy_key:typeof g.proxy_key=="string"?g.proxy_key:null}))}if(h==="quick-add"&&p==="confirm"&&l==="POST"){let g=await $(r);return w(o,200,await e.quickAddConfirm(String(g.id??""),typeof g.name=="string"?g.name:void 0))}if(h==="quick-add"&&p==="cancel"&&l==="POST"){let g=await $(r);return w(o,200,await e.quickAddCancel(String(g.id??"")))};if(h==="quick-add-fb"&&l==="POST"){let g=await $(r);return w(o,200,await e.quickAddFb(String(g.fbData??""),{name:typeof g.name=="string"?g.name:void 0,proxy:typeof g.proxy=="string"?g.proxy:null,proxy_rotate:!!g.proxy_rotate,proxy_key:typeof g.proxy_key=="string"?g.proxy_key:null,headless:typeof g.headless=="boolean"?g.headless:undefined}))}if(l==="POST"&&!h){let g=await $(r);return w(o,200,e.addProfile(String(g.name??""),{cookies:typeof g.cookies=="string"?g.cookies:void 0,proxy:typeof g.proxy=="string"?g.proxy:null,proxy_rotate:!!g.proxy_rotate,proxy_key:typeof g.proxy_key=="string"?g.proxy_key:null}))}if(h==="check-all"&&!p&&l==="POST")return w(o,200,{ids:e.checkAll()});if(h==="bulk"&&!p&&l==="POST"){let g=await $(r);return w(o,200,e.addProfilesBulk(String(g.cookies??""),String(g.proxies??""),{proxy_mode:g.proxy_mode,topproxy_key:g.topproxy_key}))}if(h==="assign-proxy"&&!p&&l==="POST")return w(o,200,e.assignProxies());if(h&&!p&&l==="PATCH")return w(o,200,await e.patchProfile(h,await $(r)));if(h&&!p&&l==="DELETE")return await e.removeProfile(h),w(o,200,{ok:!0});if(h&&p==="cookies"&&l==="POST"){let g=await $(r);return w(o,200,{id:e.importCookies(h,String(g.cookies??""))})}
if(h==="quick-add-google-bulk"&&l==="POST"){let g=await $(r);return w(o,200,await e.quickAddGoogleBulk(String(g.accounts??""),g))}if(h&&p==="relogin-google"&&l==="POST")return w(o,200,await e.reloginGoogleProfile(h));if(h==="relogin-failed-google"&&l==="POST")return w(o,200,await e.reloginAllFailedGoogle());
if(h&&p==="relogin-fb"&&l==="POST")return w(o,200,await e.reloginFbProfile(h));if(h&&p==="reset-credit"&&l==="POST")return w(o,200,await e.autoResetProfileCredit(h));if(h&&p==="fb-cookies"&&l==="POST"){let g=await $(r);return w(o,200,await e.updateFbCookies(h,String(g.fbData??"")))}if(h&&p==="login"&&l==="POST")return w(o,200,{id:e.requestLogin(h)});if(h&&p==="check"&&l==="POST")return w(o,200,{id:e.requestCheck(h)});if(h==="wake-all"&&l==="POST"){let g=await $(r).catch(()=>({}));return w(o,200,e.wakeAllProfiles(g?.ids));}if(h&&p==="wake"&&l==="POST")return w(o,200,e.wakeProfile(h));if(h&&p==="window"&&l==="POST"){let g=await $(r);return await e.showProfileWindow(h,g.show!==!1,g.mode,g.url),w(o,200,{ok:!0})}}if(u==="proxy"&&h==="check"&&l==="POST"){let g=await $(r),f=Array.isArray(g.proxies)?g.proxies:String(g.text??"").split(/[\r\n;,]+/);return w(o,200,{results:await e.checkProxies(f)})}if(u==="proxy"&&h==="check-rotating"&&l==="POST"){let g=await $(r);let rawInput=g.keys||g.key||"";let rawKeys=Array.isArray(rawInput)?rawInput:String(rawInput).split(/[\r\n,;]+/).map(k=>k.trim()).filter(Boolean);if(rawKeys.length>1){let rList=await Promise.all(rawKeys.map(async k=>{try{let res=await e.checkRotatingProxy(k);return Object.assign({key:k},res);}catch(err){return {key:k,ok:!1,message:err.message};}}));return w(o,200,{results:rList});}let singleKey=rawKeys[0]||"";return w(o,200,await e.checkRotatingProxy(singleKey))}if(u==="assets"){if(l==="GET"&&!h)return w(o,200,{assets:e.listAssets()});if(l==="DELETE"&&!h){let g=await $(r).catch(()=>({}));return w(o,200,await e.removeAllAssets(g.ids||null));}if(l==="POST"&&!h)return w(o,200,e.addAsset(await $(r)));if(h&&!p&&l==="PATCH")return w(o,200,e.updateAsset(h,await $(r)));if(h&&!p&&l==="DELETE")return e.removeAsset(h),w(o,200,{ok:!0});if(h&&p==="images"&&!y&&l==="POST")return w(o,200,e.addAssetImage(h,await $(r)));if(h&&p==="images"&&y&&l==="GET"){let g=e.assetImagePath(h,y);return Wt(r,o,g,pi[Q.default.extname(g)]||"image/png")}if(h&&p==="images"&&y&&l==="PATCH"){let g=await $(r);return e.setAssetImageRole(h,y,String(g.role??"other")),w(o,200,{ok:!0})}if(h&&p==="images"&&y&&l==="DELETE")return e.removeAssetImage(h,y),w(o,200,{ok:!0})}if(u==="open-folder"&&l==="POST"){let g=await $(r),f=e.folderFor(g.job_id??null);return await s.openFolder?.(f),w(o,200,{path:f})}throw new m(404,"kh\xF4ng c\xF3 \u0111\u01B0\u1EDDng d\u1EABn n\xE0y")}let n=mi.default.createServer((r,o)=>{i(r,o).catch(a=>{let l=a instanceof m?a.status:500;l>=500&&b.error("app",`API ${r.method} ${r.url}: ${a instanceof Error?a.stack||a.message:a}`),o.headersSent?o.end():w(o,l,{detail:a instanceof Error?a.message:String(a)})})});return new Promise((r,o)=>{n.once("error",o),n.listen(t,"127.0.0.1",()=>{let a=n.address();r({url:`http://127.0.0.1:${a.port}`,port:a.port,close:()=>new Promise(l=>n.close(()=>l()))})})})}var Bt = !0, kn = "https://api.hopdenai.com", ot = null, Ht = null, P = null, oe = !1;
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
`)+`#${s.seq} ${s.prompt}`.slice(0,120);try{let r=new v.Notification({title:i,body:n,silent:!0});r.on("click",()=>{try{if(P&&!P.isDestroyed()){P.isMinimized()&&P.restore(),P.show(),P.focus()}}catch{}}),r.show(),P?.flashFrame(!0)}catch(r){b.warn("app",`kh\xF4ng hi\u1EC7n \u0111\u01B0\u1EE3c th\xF4ng b\xE1o Windows: ${r instanceof Error?r.message:r}`)}}var et=new Map;function _n(s){let t=String(s.domain||"").replace(/^\./,""),e=s.path||"/",i=String(s.sameSite||"").toLowerCase(),n={url:`https://${t}${e}`,name:s.name,value:s.value,path:e,secure:!!s.secure,httpOnly:!!s.httpOnly,sameSite:i==="none"?"no_restriction":i==="lax"?"lax":i==="strict"?"strict":"unspecified"};return s.domain&&(n.domain=s.domain),typeof s.expires=="number"&&s.expires>0&&(n.expirationDate=s.expires),n}var xn=s=>`data:text/html;charset=utf-8,${encodeURIComponent(`<!doctype html><meta charset=utf-8><style>html,body{height:100%;margin:0}body{background:#0a0912;color:#e8efec;font:15px/1.6 system-ui,Segoe UI,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px}.r{width:44px;height:44px;border-radius:50%;border:3px solid rgba(124,92,255,.25);border-top-color:#7c5cff;animation:s 1s linear infinite}@keyframes s{to{transform:rotate(360deg)}}.d{color:#8b93a7;font-size:13px}b{color:#b9a7ff}</style><div class=r></div><div>\u0110ang m\u1EDF trang Dola cho <b>${s.replace(/[<>&]/g,"")}</b>\u2026</div><div class=d>\u0110ang k\u1EBFt n\u1ED1i t\u1EDBi Dola.</div><div class=d>\u0110\u1EEBng \u0111\xF3ng c\u1EEDa s\u1ED5, trang s\u1EBD t\u1EF1 hi\u1EC7n.</div>`)}`;async function Pn(s,t){if(ot&&typeof ot.showProfileWindow==="function"){return await ot.showProfileWindow(s.profileId,t,"browser",s.url);}globalThis.__viewerWindows=et;let e=et.get(s.profileId);if(!t){e&&!e.isDestroyed()&&e.close();return}if(e&&!e.isDestroyed()){e.isMinimized()&&e.restore(),e.show(),e.focus();return}let i=`persist:nick-${s.profileId}`,n=v.session.fromPartition(i,{cache:!0});if(s.proxy)try{let a=B(s.proxy),l=new URL(a.server),c=l.protocol.startsWith("socks")?`socks5://${l.host}`:`http=${l.host};https=${l.host}`;await n.setProxy({proxyRules:c,proxyBypassRules:"<local>"}),a.username&&(n._dolaProxyAuth={username:a.username,password:a.password||""})}catch(a){b.warn(s.name,`proxy cho c\u1EEDa s\u1ED5 xem kh\xF4ng d\xF9ng \u0111\u01B0\u1EE3c: ${a instanceof Error?a.message:a}`)}let r=new v.BrowserWindow({width:1180,height:860,minWidth:760,minHeight:560,title:`Dola \u2014 ${s.name}`,autoHideMenuBar:!0,backgroundColor:"#0a0912",webPreferences:{partition:i,contextIsolation:!0,nodeIntegration:!1}});et.set(s.profileId,r),r.on("closed",()=>et.delete(s.profileId));let o=n._dolaProxyAuth;o&&r.webContents.on("login",(a,l,c,d)=>{c.isProxy&&(a.preventDefault(),d(o.username,o.password))}),r.webContents.setWindowOpenHandler(({url:a})=>({action:"allow",overrideBrowserWindowOptions:{autoHideMenuBar:!0,backgroundColor:"#0a0912",webPreferences:{partition:i,contextIsolation:!0,nodeIntegration:!1}}})),r.webContents.on("did-create-window",ch=>{o&&ch.webContents.on("login",(ca,cl,cc,cd)=>{cc.isProxy&&(ca.preventDefault(),cd(o.username,o.password))})}),await r.loadURL(xn(s.name)),(async()=>{let a=[];try{a=await s.getCookies()}catch(l){b.warn(s.name,`kh\xF4ng l\u1EA5y \u0111\u01B0\u1EE3c phi\xEAn cho c\u1EEDa s\u1ED5 xem: ${l instanceof Error?l.message:l}`)}if(!r.isDestroyed()){for(let l of a)try{await n.cookies.set(_n(l))}catch{}r.isDestroyed()||await r.webContents.loadURL(s.url).catch(l=>{b.warn(s.name,`kh\xF4ng m\u1EDF \u0111\u01B0\u1EE3c trang Dola trong c\u1EEDa s\u1ED5 xem: ${l?.message??l}`)})}})()}function Dn(){for(let s of et.values())try{s.isDestroyed()||s.close()}catch{}et.clear()}
async function Cn() {
  if (!xt()) {
    v.dialog.showErrorBox("Thiếu Chromium", "Không tìm thấy Chromium đi kèm (resources/bin/chromium). Cài lại ứng dụng hoặc đặt biến DOLA_CHROMIUM.");
    v.app.quit();
    return;
  }
  let s;
  ot = new Jt({
    headless: process.env.DOLA_HEADLESS !== "0",
    onVideoDone: () => { try { if (s && typeof s.consume === "function") s.consume(); } catch {} },
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
  try { require('fs').writeFileSync(require('path').join(__dirname, '../../scratch/versions_result.json'), JSON.stringify(process.versions, null, 2)); } catch(e){} 
  try { require('fs').writeFileSync(require('path').join(require('os').tmpdir(), 'alex_electron_versions.json'), JSON.stringify(process.versions, null, 2)); } catch(e){} 
  console.log(`[alex-bright-tool] api ${Ht.url} (dev=${Bt})`);
  try { ot?.start(); } catch (e) {}
  s.recheck().catch(() => {});
  let n = bn();
  P = new v.BrowserWindow({
    width: n.width ?? 1320,
    height: n.height ?? 920,
    x: n.x,
    y: n.y,
    minWidth: 900,
    minHeight: 600,
    title: "ALEX BRIGHT TOOL",
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
}

process.on('uncaughtException', err => console.error('[UNCAUGHT EXCEPTION]', err));
process.on('unhandledRejection', err => console.error('[UNHANDLED REJECTION]', err));

async function le(from = 'unknown') {
  console.log('[DEBUG] le() called from:', from, 'oe:', oe);
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
  console.error('[CRITICAL] Cn failed:', s);
  v.dialog.showErrorBox("Tool Seedance", String(s?.stack || s));
  v.app.quit();
});
v.app.on("window-all-closed", () => { le('window-all-closed'); });
v.app.on("before-quit", s => { oe || (s.preventDefault(), le('before-quit')); });
for(let s of["SIGTERM","SIGINT"])process.on(s,()=>{le(s)});
