#!/usr/bin/env node
/**
 * Patches GeoExport SPA bundle: export preview/download fixes + shared fetch helper.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bundlePath = path.join(__dirname, "assets", "index-VQj200iM.js");

const HELPER = `async function _gxf(cats,type,fmt,source,label){const w=new URLSearchParams;cats.forEach(z=>w.append("category",z)),w.set("type",type);const af=fmt==="single-line"||fmt==="keenetic-ip"?"plain-lines":fmt;w.set("format",af),source&&w.set("source",source);const r=await fetch(\`/api/export?\${w}\`);if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e.detail||r.statusText||"Ошибка экспорта")}let t=await r.text();if(!t.trim())return"Нет данных для выбранных категорий, типа или источника. Попробуйте «Все» в фильтре источников или тип «Домены» / «IPv4».";if(fmt==="single-line")t=t.trim().split(/\\r?\\n/).join(",");if(fmt==="keenetic-ip"){const lines=t.trim().split(/\\r?\\n/).filter(x=>/^\\d/.test(x)&&x.includes("/")&&!x.includes(":"));t=lines.length?lines.map(line=>{const[ip,bits]=line.split("/"),n=parseInt(bits??"32",10),mask=n===32?"255.255.255.255":Array.from({length:4},(_,i)=>(65280>>Math.min(8,Math.max(0,n-i*8)))&255).join(".");return\`route ADD \${ip} MASK \${mask} 0.0.0.0 & rem \${label||cats[0]||"export"}\`}).join("\\n"):"Нет IPv4-подсетей для Keenetic. Выберите тип «IPv4» или «Домены + IPv4»."}return t}`;

const REPLACEMENTS = [
  {
    from: "function bm({svc:e,sources:t,sourceFilter:n})",
    to: `${HELPER}function bm({svc:e,sources:t,sourceFilter:n})`,
  },
  {
    from: 'p=async()=>{if(f){a(!0);try{const w=new URLSearchParams;C.forEach(z=>w.append("category",z.full_name)),w.set("type",m),w.set("format",c==="single-line"?"plain-lines":c),n!=="all"&&w.set("source",n);let P=await(await fetch(`/api/export?${w}`)).text();c==="single-line"&&(P=P.trim().split(/\\r?\\n/).join(",")),o(P)}finally{a(!1)}}}',
    to: 'p=async()=>{if(f){a(!0);try{o(await _gxf(C.map(z=>z.full_name),m,c,n!=="all"?n:"",e.name))}catch(w){o(w.message||"Ошибка экспорта")}finally{a(!1)}}}',
  },
  {
    from: 'function qm(){const[e]=hi(),t=e.getAll("category"),n=e.get("source"),[r,l]=k.useState("domains,ip4,ip6"),[s,o]=k.useState("plain-lines"),',
    to: 'function qm(){const[e]=hi(),t=e.getAll("category"),n=e.get("source"),[r,l]=k.useState(e.get("type")||"domains,ip4,ip6"),[s,o]=k.useState(e.get("format")||"plain-lines"),',
  },
  {
    from: 'const p=k.useCallback(async()=>{if(t.length){y(!0),C(null);try{const S=new URLSearchParams;t.forEach(T=>S.append("category",T)),S.set("type",r),S.set("format",s==="single-line"?"plain-lines":s),n&&S.set("source",n);const P=await fetch(`/api/export?${S}`);if(!P.ok){const T=await P.json().catch(()=>({}));C(T.detail??P.statusText),a(""),h(0);return}let z=await P.text();s==="single-line"&&(z=z.trim().split(/\\r?\\n/).join(",")),a(z),h(z.trim()?z.trim().split(/[,\\r?\\n]/).filter(Boolean).length:0)}finally{y(!1)}}},[t.join(","),r,s,n]);',
    to: 'const p=k.useCallback(async()=>{if(!t.length){a(""),C(null),h(0);return}y(!0),C(null);try{const z=await _gxf(t,r,s,n||"",t[0]);a(z),h(z.trim()&&!z.startsWith("Нет ")?z.trim().split(/[,\\r?\\n]/).filter(Boolean).length:0)}catch(S){C(S.message||"Ошибка экспорта"),a(""),h(0)}finally{y(!1)}},[t.join(","),r,s,n]);',
  },
  {
    from: 'value:g?"Загрузка…":j?"":i,readOnly:!0,className:"w-full h-80',
    to: 'value:g?"Загрузка…":j||i||(!t.length?"Выберите категории на главной и нажмите «Открыть экспорт →», либо добавьте ?category=geoip:telegram в адрес.":""),readOnly:!0,className:"w-full h-80',
  },
];

let src = fs.readFileSync(bundlePath, "utf8");

if (src.includes("async function _gxf(")) {
  console.log("Already patched:", bundlePath);
  process.exit(0);
}

for (const { from, to } of REPLACEMENTS) {
  if (!src.includes(from)) {
    console.error("Patch anchor not found:", from.slice(0, 80));
    process.exit(1);
  }
  src = src.replace(from, to);
}

fs.writeFileSync(bundlePath, src);
console.log("Patched", bundlePath);
