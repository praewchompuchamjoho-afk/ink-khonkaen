"use strict";
const MAX_SHOW = 12; // จำนวนรูปสูงสุดที่แสดงต่อร้าน
const MAX_UP = 6; // จำนวนรูปสูงสุดที่ร้านใหม่อัปโหลดผ่านฟอร์มได้ (ต้องไม่เกิน MAX_PHOTOS ใน Code.gs)
const reviewsByKey = {}; // รีวิวจากผู้ใช้เว็บที่อนุมัติแล้ว จัดกลุ่มตามคีย์ร้าน
// ====== รายการสไตล์/ความสนใจ แก้หรือเพิ่มได้ที่นี่ ======
// แต่ละแถว: [ชื่อที่แสดง, กลุ่ม, คำที่คนมักพิมพ์ค้นหา (คั่นด้วย ,), สไตล์ใกล้เคียง (ใช้ชื่อให้ตรงกับแถวอื่น)]
// ถ้าต้องการเพิ่มสไตล์ใหม่ เพิ่มแถวใหม่ แล้วใส่ชื่อเดียวกันใน styles:[...] ของร้านใน shops-data.js
const STYLE_CATALOG = [
  ["ลายเส้น","สไตล์งาน","line,fine line,fineline,line art,ไลน์,เส้นบาง,ลายเส้นเล็ก","มินิมอล,ภาพประกอบ,ลายขนาดเล็ก"],
  ["ภาพประกอบ","สไตล์งาน","illustration,illustrative,drawing,วาดมือ,อาร์ต","ลายเส้น,การ์ตูน/อนิเมะ,สีน้ำ"],
  ["เหมือนจริง","สไตล์งาน","realistic,realism,เรียลลิสติก,สมจริง,เหมือนรูปถ่าย","ไมโครเรียลลิสติก,พอร์ตเทรต/ภาพบุคคล,ขาวดำ/เฉดเทา"],
  ["ไมโครเรียลลิสติก","สไตล์งาน","micro realism,micro realistic,microrealism,เหมือนจริงขนาดเล็ก","เหมือนจริง,ลายขนาดเล็ก,ลายเส้น"],
  ["มินิมอล","สไตล์งาน","minimal,minimalist,minimalism,มินิ,เรียบง่าย,ลายเล็ก","ลายเส้น,ลายขนาดเล็ก,เรขาคณิต/มันดาลา"],
  ["ลายทึบ (Blackwork)","สไตล์งาน","blackwork,black work,ทึบ,ดำทึบ,แบล็กเวิร์ก","ขาวดำ/เฉดเทา,ดอตเวิร์ก,ไทบัล"],
  ["ขาวดำ/เฉดเทา","สไตล์งาน","black and grey,black & grey,black grey,bnw,ขาวดำ,เฉดเทา,เทา","ลายทึบ (Blackwork),เหมือนจริง"],
  ["สีสด (Color)","สไตล์งาน","color,colour,colorful,colour tattoo,สีสด,สี,คัลเลอร์,ลายสี","สีน้ำ,ญี่ปุ่น,นีโอแทรดิชันนอล"],
  ["สีน้ำ","สไตล์งาน","watercolor,water color,watercolour","สีสด (Color),ภาพประกอบ"],
  ["ญี่ปุ่น","สไตล์งาน","japanese,irezumi,อิเรซึมิ,ลายญี่ปุ่น,ซามูไร,โคอิ","ดั้งเดิม (Traditional),มังกร/ลายจีน,สีสด (Color)"],
  ["ดั้งเดิม (Traditional)","สไตล์งาน","traditional,old school,oldschool,american traditional,โอลด์สคูล,ดั้งเดิม","นีโอแทรดิชันนอล,ญี่ปุ่น"],
  ["นีโอแทรดิชันนอล","สไตล์งาน","neo traditional,neotraditional,neo trad,นีโอ","ดั้งเดิม (Traditional),สีสด (Color)"],
  ["ดอตเวิร์ก","สไตล์งาน","dotwork,dot work,stipple,stippling,จุด,ลายจุด","ลายทึบ (Blackwork),เรขาคณิต/มันดาลา"],
  ["เรขาคณิต/มันดาลา","สไตล์งาน","geometric,geometry,mandala,geo,เรขาคณิต,มันดาลา","ดอตเวิร์ก,มินิมอล,ลายทึบ (Blackwork)"],
  ["ไทบัล","สไตล์งาน","tribal,ลายชนเผ่า,ชนเผ่า","ลายทึบ (Blackwork),ดอตเวิร์ก"],
  ["การ์ตูน/อนิเมะ","สไตล์งาน","cartoon,anime,manga,การ์ตูน,อนิเมะ,มังงะ","ภาพประกอบ,สีสด (Color)"],
  ["ยันต์ไทย","ลายที่ลูกค้านิยม","yant,sak yant,sakyant,thai yant,ยันต์,สักยันต์,ยันต์เก้ายอด,ยันต์เสือ","อักษรไทย,ลายไทย,สักมือ (Hand-poke)"],
  ["อักษรไทย","ลายที่ลูกค้านิยม","thai letter,thai letters,thai text,thai script,ตัวอักษรไทย,อักขระ,ภาษาไทย,ตัวหนังสือไทย","ยันต์ไทย,เลตเตอริ่ง/ตัวอักษร"],
  ["เลตเตอริ่ง/ตัวอักษร","ลายที่ลูกค้านิยม","lettering,letter,text,font,quote,script,ตัวอักษร,ตัวหนังสือ,ข้อความ,เลตเตอริ่ง","อักษรไทย,มินิมอล"],
  ["ลายไทย","ลายที่ลูกค้านิยม","thai art,thai pattern,กนก,ลายกนก,หนุมาน,ครุฑ,พญานาค,ลายไทยประยุกต์","ยันต์ไทย,ภาพประกอบ"],
  ["มังกร/ลายจีน","ลายที่ลูกค้านิยม","dragon,chinese,china,มังกร,ลายจีน,จีน","ญี่ปุ่น,ลายสัตว์"],
  ["ลายสัตว์","ลายที่ลูกค้านิยม","animal,animals,tiger,lion,wolf,เสือ,สิงโต,หมาป่า,สัตว์,นก","เหมือนจริง,มังกร/ลายจีน"],
  ["ดอกไม้/ใบไม้","ลายที่ลูกค้านิยม","flower,floral,botanical,rose,plant,ดอกไม้,กุหลาบ,ใบไม้,ธรรมชาติ,ต้นไม้","ลายเส้น,สีน้ำ"],
  ["พอร์ตเทรต/ภาพบุคคล","ลายที่ลูกค้านิยม","portrait,face,people,ภาพบุคคล,พอร์ตเทรต,ใบหน้า,หน้าคน,รูปคน","เหมือนจริง,ขาวดำ/เฉดเทา"],
  ["ลายคู่/คู่รัก","ลายที่ลูกค้านิยม","couple,matching,pair,คู่,คู่รัก,ลายคู่,ลายเหมือนกัน","ลายขนาดเล็ก,มินิมอล"],
  ["ลายขนาดเล็ก","ลายที่ลูกค้านิยม","small,tiny,mini,mini tattoo,ลายเล็ก,จิ๋ว,ตัวเล็ก,ขนาดเล็ก","มินิมอล,ลายเส้น"],
  ["แขนเต็ม/หลังเต็ม","ลายที่ลูกค้านิยม","sleeve,full sleeve,back piece,backpiece,large,แขนเต็ม,หลังเต็ม,ลายใหญ่,ขนาดใหญ่,ขาเต็ม","เหมือนจริง,ญี่ปุ่น"],
  ["ปิดทับรอยเก่า","บริการและความสนใจ","cover up,coverup,ทับลาย,ปิดลายเก่า,ปิดทับ,ทับลายเก่า","ปิดรอยแผลเป็น,แก้ไข/เติมสีลายเก่า,ลายทึบ (Blackwork)"],
  ["ปิดรอยแผลเป็น","บริการและความสนใจ","scar,scars,scar cover,scar tattoo,แผลเป็น,รอยแผล,ปิดแผล","ปิดทับรอยเก่า,ลบรอยสัก"],
  ["ลบรอยสัก","บริการและความสนใจ","removal,remove,tattoo removal,laser,เลเซอร์,ลบ,ลบลาย,ลบรอย","ปิดทับรอยเก่า,แก้ไข/เติมสีลายเก่า"],
  ["แก้ไข/เติมสีลายเก่า","บริการและความสนใจ","touch up,touchup,fix,repair,rework,เติมสี,ซ่อมลาย,แก้ลาย,แก้ไขลาย","ปิดทับรอยเก่า,ลบรอยสัก"],
  ["ออกแบบลายเฉพาะ","บริการและความสนใจ","custom,custom design,design,ออกแบบ,ลายเฉพาะ,ปรึกษา,ออกแบบลาย","ภาพประกอบ,ลายเส้น"],
  ["สักมือ (Hand-poke)","บริการและความสนใจ","hand poke,handpoke,stick and poke,stick poke,สักมือ,แทงมือ,ไม้แทง","ยันต์ไทย,มินิมอล"],
  ["เจาะ (Piercing)","บริการและความสนใจ","piercing,pierce,เจาะ,เจาะหู,เจาะจมูก,เจาะสะดือ",""]
];
const MAX_STYLES = 12; // จำนวนสไตล์สูงสุดที่เลือกได้ต่อร้าน
const normQ = (s) => String(s || "").toLowerCase().replace(/[()\[\]{}\-_.,/&]+/g, " ").replace(/\s+/g, " ").trim();
const STYLES = STYLE_CATALOG.map(([name, group, alias, near]) => ({ name, group, al: [normQ(name), ...alias.split(",").map(normQ)].filter(Boolean), near: near ? near.split(",") : [] }));
const STYLE_GROUPS = [...new Set(STYLES.map((s) => s.group))];
const STYLE_LIST = STYLES.map((s) => s.name);
let relSet = new Set(); // ร้านที่แสดงเพราะ "ใกล้เคียง" ไม่ได้ตรงกับคำค้นโดยตรง
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const safeUrl = (u) => (/^https?:\/\//i.test(u || "") ? u : "");
const safeTel = (t) => String(t || "").replace(/[^0-9+]/g, "").slice(0, 15);
const safeImg = (u) => (/^https:\/\/(drive\.google\.com|lh3\.googleusercontent\.com)\//i.test(u || "") || /^images\/[\w.\-\/]+$/i.test(u || "") ? u : "");
const dirUrl = (s) => `https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`;

let shops = window.SHOPS.map((s) => ({ ...s }));
let activeStyle = "ทั้งหมด";
let query = "";
let picking = false;
let draftPin = null;

// ---------- map ----------
const map = L.map("mapbox").setView([16.44, 102.82], 11);
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap contributors",
}).addTo(map);
const markers = L.layerGroup().addTo(map);

// ---------- render ----------
function typeLabel(s) { return s.type === "yant" ? "สำนักสักยันต์" : "สตูดิโอ"; }

function links(s) {
  let h = `<a class="go" href="${dirUrl(s)}" target="_blank" rel="noopener">นำทาง</a>`;
  if (safeUrl(s.fb)) h += `<a href="${esc(s.fb)}" target="_blank" rel="noopener">Facebook</a>`;
  if (safeUrl(s.ig)) h += `<a href="${esc(s.ig)}" target="_blank" rel="noopener">Instagram</a>`;
  if (safeTel(s.tel)) h += `<a href="tel:${esc(safeTel(s.tel))}">โทร ${esc(safeTel(s.tel))}</a>`;
  if (!safeUrl(s.fb) && !safeUrl(s.ig) && !safeTel(s.tel)) h += `<span class="na">ไม่พบช่องทางติดต่อ</span>`;
  return h;
}

function summary(s) {
  if (s.about) return s.about;
  const kind = s.type === "yant" ? "สำนักสักยันต์" : "สตูดิโอสักลาย";
  let t = `${kind}ในจังหวัดขอนแก่น`;
  if (s.styles && s.styles.length) t += ` ถนัด ${s.styles.join(", ")}`;
  if (s.rating) t += ` คะแนน Google ${Number(s.rating).toFixed(1)} จาก ${s.count} รีวิว`;
  return t;
}

function card(s) {
  const idx = shops.indexOf(s);
  const rate = s.rating ? `<p class="r"><b>★ ${esc(Number(s.rating).toFixed(1))}</b> Google · ${esc(s.count)} รีวิว</p>` : `<p class="r na">ร้านใหม่ ยังไม่มีคะแนน</p>`;
  const sty = s.styles && s.styles.length ? esc(s.styles.join(", ")) : "ยังไม่ระบุ";
  const q = s.about ? `<p class="ab3">${esc(s.about)}</p>` : (s.quote ? `<q>${esc(s.quote)}</q>` : "");
  const cover = (s.photos || []).map(safeImg).filter(Boolean)[0];
  const img = cover ? `<img class="cp" src="${esc(cover)}" alt="รูปร้าน ${esc(s.name)}" loading="lazy" referrerpolicy="no-referrer">` : "";
  return `<article class="c">${img}<div class="h"><span class="t${s.type === "yant" ? " y" : ""}">${typeLabel(s)}</span>${s.isNew ? '<span class="t">เพิ่มใหม่</span>' : ""}${relSet.has(s) ? '<span class="t">ใกล้เคียง</span>' : ""}</div><h3><button type="button" class="tl more" data-i="${idx}">${esc(s.name)}</button></h3>${rate}${siteLine(s)}<p class="s"><b>ถนัด</b> ${sty}</p>${q}<div class="a"><button type="button" class="pm more" data-i="${idx}">ดูรายละเอียด</button>${links(s)}</div></article>`;
}

// ---------- ค้นหาแบบยืดหยุ่น: ชื่อร้าน สไตล์ คำพ้อง คำอธิบายร้าน พิมพ์ผิดเล็กน้อย และสไตล์ใกล้เคียง ----------
function dice(a, b) {
  if (a.length < 2 || b.length < 2) return 0;
  const grams = (s) => { const g = []; for (let i = 0; i < s.length - 1; i++) g.push(s.slice(i, i + 2)); return g; };
  const ga = grams(a), gb = grams(b), m = new Map();
  gb.forEach((x) => m.set(x, (m.get(x) || 0) + 1));
  let c = 0;
  ga.forEach((x) => { if (m.get(x) > 0) { c++; m.set(x, m.get(x) - 1); } });
  return (2 * c) / (ga.length + gb.length);
}
function styleHits(t) { // สไตล์ในรายการที่ตรงกับคำค้น t พร้อมน้ำหนัก
  const hits = new Map();
  STYLES.forEach((st) => {
    let best = 0;
    st.al.forEach((a) => {
      if (a === t || (t.length >= 2 && a.includes(t))) best = Math.max(best, 10);
      else if (a.length >= 3 && t.includes(a)) best = Math.max(best, 7);
      else if (t.length >= 4 && a.length >= 4 && dice(t, a) >= 0.6) best = Math.max(best, 5);
    });
    if (best) hits.set(st.name, best);
  });
  return hits;
}
function nearOf(hits) { // สไตล์ใกล้เคียงของสไตล์ที่ตรง
  const near = new Set();
  hits.forEach((w, name) => { if (w >= 7) STYLES.find((s) => s.name === name).near.forEach((n) => { if (!hits.has(n)) near.add(n); }); });
  return near;
}
function scoreShop(s, tokens, hits, near) {
  const name = normQ(s.name), text = normQ((s.about || "") + " " + (s.quote || "") + " " + typeLabel(s));
  const sty = s.styles || [];
  let score = 0, direct = false;
  tokens.forEach((t, i) => {
    let best = 0;
    if (name.includes(t)) best = 10;
    else if (t.length >= 4 && name.split(" ").some((w) => w.length >= 4 && dice(t, w) >= 0.6)) best = 5;
    sty.forEach((x) => {
      const h = hits[i].get(x);
      if (h) best = Math.max(best, h);
      else if (normQ(x).includes(t)) best = Math.max(best, 10); // สไตล์ที่พิมพ์เองนอกรายการ
    });
    if (best < 7 && text.includes(t)) best = Math.max(best, 3);
    if (best >= 5) direct = true;
    else if (sty.some((x) => near[i].has(x))) best = Math.max(best, 3);
    score += best;
  });
  return { score, direct };
}
const STOP_WORDS = new Set(["tattoo", "tattoos", "tatoo", "studio", "shop", "ink", "ร้าน", "สัก", "สักลาย", "ร้านสัก", "ขอนแก่น", "khonkaen", "khon kaen"]);
function isStop(t) { return STOP_WORDS.has(t) || (t.length >= 4 && /^[a-z]+$/.test(t) && dice(t, "tattoo") >= 0.7); } // คำที่อยู่ในเกือบทุกร้าน ไม่ช่วยแยกร้าน
function visible() {
  relSet = new Set();
  const base = shops.filter((s) => activeStyle === "ทั้งหมด" || (s.styles || []).includes(activeStyle));
  const qn = normQ(query);
  if (!qn) return base;
  const raw = qn.split(" ").filter((t) => t.length >= 2 && !(/^[a-z0-9]+$/.test(t) && t.length < 3));
  if (!raw.length) return base.filter((s) => normQ(s.name).includes(qn)); // พิมพ์ได้แค่ 1 ตัวอักษร ค้นเฉพาะชื่อ
  const tokens = raw.filter((t) => !isStop(t));
  if (!tokens.length) return base; // มีแต่คำทั่วไป เช่น tattoo, สัก ให้แสดงทุกร้าน
  const hits = tokens.map(styleHits), near = hits.map(nearOf);
  const scored = base.map((s) => ({ s, ...scoreShop(s, tokens, hits, near) })).filter((x) => x.score > 0);
  scored.sort((a, b) => (b.direct - a.direct) || (b.score - a.score));
  scored.forEach((x) => { if (!x.direct) relSet.add(x.s); });
  return scored.map((x) => x.s);
}
function emptyMsg() {
  return query ? `<p class="sub">ไม่พบร้านที่ตรงหรือใกล้เคียงกับ “${esc(query)}” ลองคำอื่น เช่น ลายเส้น มินิมอล ยันต์ ปิดแผลเป็น หรือกด ทั้งหมด</p>` : '<p class="sub">ไม่พบร้านที่ตรงกับตัวกรอง ลองเลือก ทั้งหมด</p>';
}

function render() {
  const list = visible();
  $("grid").innerHTML = list.length ? list.map(card).join("") : emptyMsg();
  const nRel = list.filter((s) => relSet.has(s)).length, nDir = list.length - nRel;
  $("count").textContent = !query ? `แสดง ${list.length} จาก ${shops.length} ร้าน` : nRel && !nDir ? `ไม่มีร้านที่ตรงกับ “${query}” พบ ${nRel} ร้านที่ใกล้เคียง` : nRel ? `พบ ${nDir} ร้านที่ตรง และ ${nRel} ร้านที่ใกล้เคียงกับ “${query}”` : `พบ ${nDir} ร้านที่ตรงกับ “${query}”`;
  markers.clearLayers();
  list.forEach((s) => {
    const m = L.marker([s.lat, s.lng]).addTo(markers);
    m.bindPopup(`<strong>${esc(s.name)}</strong><br>${typeLabel(s)}<br><a href="${dirUrl(s)}" target="_blank" rel="noopener">นำทาง</a><br><button type="button" class="pm more" data-i="${shops.indexOf(s)}">ดูรายละเอียด</button>`);
  });
  const yant = shops.filter((s) => s.type === "yant").length;
  $("stats").innerHTML = `<div><b>${shops.length}</b><span>ร้านและสำนักทั้งหมด</span></div><div><b>${shops.length - yant}</b><span>สตูดิโอสักลาย</span></div><div><b>${yant}</b><span>สำนักสักยันต์</span></div>`;
}

function renderChips() {
  const set = new Set(["ทั้งหมด"]);
  shops.forEach((s) => (s.styles || []).forEach((x) => set.add(x)));
  $("chips").innerHTML = [...set].map((x) => `<button type="button" class="k" aria-pressed="${x === activeStyle}">${esc(x)}</button>`).join("");
  $("chips").querySelectorAll("button").forEach((b) => b.addEventListener("click", () => { activeStyle = b.textContent; renderChips(); render(); }));
}

$("q").addEventListener("input", (e) => { query = e.target.value.trim(); render(); });

// ---------- add-shop form ----------
$("styleBoxes").innerHTML = STYLE_GROUPS.map((g) => `<p class="kh">${esc(g)}</p>` + STYLES.filter((s) => s.group === g).map((s) => `<label><input type="checkbox" name="style" value="${esc(s.name)}"> ${esc(s.name)}</label>`).join("")).join("");
if ($("qlist")) $("qlist").innerHTML = STYLE_LIST.map((x) => `<option value="${esc(x)}">`).join("");
const f = $("f");
const say = (t) => { $("msg").textContent = t; };
$("styleBoxes").addEventListener("change", (e) => {
  if (e.target.checked && f.querySelectorAll('input[name="style"]:checked').length > MAX_STYLES) { e.target.checked = false; say("เลือกสไตล์ได้สูงสุด " + MAX_STYLES + " อย่าง"); }
});

const inKK = (lat, lng) => lat >= 15.5 && lat <= 17.5 && lng >= 101.5 && lng <= 103.5;
let accCircle = null;
const pinSay = (t) => { say(t); $("pinTxt").textContent = t; };

function clearPin() {
  if (draftPin) { map.removeLayer(draftPin); draftPin = null; }
  if (accCircle) { map.removeLayer(accCircle); accCircle = null; }
  picking = false;
  $("pinBar").hidden = true;
}

// ปักหมุดร้าน: opts.keepView = ไม่ซูมใหม่, opts.scroll = false ไม่เลื่อนหน้าไปที่แผนที่, opts.accuracy = รัศมีความคลาดเคลื่อน (เมตร)
function setPin(lat, lng, opts = {}) {
  lat = Number(lat); lng = Number(lng);
  f.lat.value = lat.toFixed(6);
  f.lng.value = lng.toFixed(6);
  if (draftPin) {
    draftPin.setLatLng([lat, lng]);
  } else {
    draftPin = L.marker([lat, lng], { draggable: true }).addTo(map).bindPopup("ตำแหน่งร้านของคุณ ลากหมุดเพื่อปรับได้");
    draftPin.on("dragend", () => { const p = draftPin.getLatLng(); setPin(p.lat, p.lng, { keepView: true, scroll: false }); });
  }
  if (accCircle) { map.removeLayer(accCircle); accCircle = null; }
  if (opts.accuracy) accCircle = L.circle([lat, lng], { radius: opts.accuracy, weight: 1, fillOpacity: 0.12 }).addTo(map);
  if (!opts.keepView) map.setView([lat, lng], 17);
  $("pinBar").hidden = false;
  if (opts.scroll !== false) $("map").scrollIntoView({ behavior: "smooth", block: "start" });
  if (!inKK(lat, lng)) pinSay("ตำแหน่งนี้อยู่นอกพื้นที่ขอนแก่น ลากหมุดหรือคลิกบนแผนที่ไปตำแหน่งร้านของคุณ");
  else if (opts.accuracy > 200) pinSay("ปักหมุดที่ตำแหน่งของคุณแล้ว แต่คลาดเคลื่อนได้ประมาณ " + Math.round(opts.accuracy) + " เมตร (เครื่องที่ไม่มี GPS มักคลาด) ลากหมุดไปให้ตรงหน้าร้าน");
  else pinSay("ปักหมุดแล้ว ลากหมุดหรือคลิกบนแผนที่เพื่อปรับ เมื่อตรงกับหน้าร้านกด \"ใช้ตำแหน่งนี้\"");
}

function geoError(err) {
  if (err && err.code === 1) return "เบราว์เซอร์ไม่ได้รับอนุญาตให้ใช้ตำแหน่ง คลิกไอคอนแม่กุญแจข้างช่องที่อยู่ เลือกตำแหน่งเป็น อนุญาต แล้วกดปุ่มอีกครั้ง (บน Windows ต้องเปิด Settings > Privacy & security > Location ด้วย) หรือกดปักหมุดบนแผนที่แทน";
  if (err && err.code === 2) return "หาตำแหน่งของเครื่องนี้ไม่ได้ เปิดบริการตำแหน่งและ Wi-Fi แล้วลองอีกครั้ง หรือกดปักหมุดบนแผนที่แทน";
  return "หาตำแหน่งนานเกินไป ลองกดอีกครั้ง หรือกดปักหมุดบนแผนที่แทน";
}

$("gps").addEventListener("click", () => {
  if (!navigator.geolocation) return say("เบราว์เซอร์นี้ไม่รองรับการระบุตำแหน่ง กดปักหมุดบนแผนที่แทน");
  if (!window.isSecureContext) return say("ใช้ตำแหน่งปัจจุบันได้เมื่อเปิดเว็บผ่านลิงก์ https เท่านั้น กดปักหมุดบนแผนที่แทน");
  const btn = $("gps");
  btn.disabled = true;
  say("กำลังหาตำแหน่ง... ถ้าเบราว์เซอร์ถามสิทธิ์ ให้กดอนุญาต");
  const ok = (p) => { btn.disabled = false; setPin(p.coords.latitude, p.coords.longitude, { accuracy: p.coords.accuracy }); };
  const fail = (err) => { btn.disabled = false; say(geoError(err)); };
  navigator.geolocation.getCurrentPosition(ok, (err) => {
    if (err.code === 1) return fail(err);
    // ลองอีกครั้งแบบประหยัดพลังงาน (ใช้ Wi-Fi/เครือข่ายช่วยหาตำแหน่ง)
    navigator.geolocation.getCurrentPosition(ok, fail, { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 });
  }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
});

$("pick").addEventListener("click", () => {
  picking = true;
  if (draftPin) {
    const p = draftPin.getLatLng();
    map.setView(p, Math.max(map.getZoom(), 16));
    $("map").scrollIntoView({ behavior: "smooth", block: "start" });
    pinSay("ลากหมุดหรือคลิกบนแผนที่ไปตำแหน่งร้าน แล้วกด \"ใช้ตำแหน่งนี้\"");
  } else {
    const c = map.getCenter();
    setPin(c.lat, c.lng, { keepView: true }); // วางหมุดกลางแผนที่ให้ก่อน แล้วลากหรือคลิกปรับได้
    pinSay("วางหมุดไว้กลางแผนที่แล้ว ลากหมุดหรือคลิกบนแผนที่ไปตำแหน่งร้าน แล้วกด \"ใช้ตำแหน่งนี้\"");
  }
});
map.on("click", (e) => { if (picking) setPin(e.latlng.lat, e.latlng.lng, { keepView: true, scroll: false }); });

$("pinDone").addEventListener("click", () => {
  picking = false;
  f.lat.scrollIntoView({ behavior: "smooth", block: "center" });
  say("บันทึกตำแหน่งในฟอร์มแล้ว กรอกข้อมูลร้านที่เหลือและกดส่งข้อมูลร้าน");
});

// พิมพ์ละติจูด/ลองจิจูดเอง หมุดบนแผนที่จะย้ายตาม
[f.lat, f.lng].forEach((el) => el.addEventListener("change", () => {
  const la = parseFloat(f.lat.value), ln = parseFloat(f.lng.value);
  if (Number.isFinite(la) && Number.isFinite(ln) && inKK(la, ln)) setPin(la, ln, { scroll: false });
}));

f.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (f.website.value) return; // ช่องดักบอท
  const lat = parseFloat(f.lat.value), lng = parseFloat(f.lng.value);
  if (!f.name.value.trim()) return say("กรอกชื่อร้าน");
  if (!(lat >= 15.5 && lat <= 17.5 && lng >= 101.5 && lng <= 103.5)) return say("พิกัดอยู่นอกพื้นที่ขอนแก่น ตรวจละติจูดและลองจิจูดอีกครั้ง");
  if (!f.ok.checked) return say("ติ๊กยืนยันว่าเป็นเจ้าของร้านและยินยอมให้แสดงข้อมูล");
  const data = {
    name: f.name.value.trim(), type: f.type.value,
    styles: [...f.querySelectorAll('input[name="style"]:checked')].map((c) => c.value),
    lat, lng, tel: safeTel(f.tel.value), fb: safeUrl(f.fb.value), ig: safeUrl(f.ig.value),
    about: f.about.value.trim().slice(0, 300),
    hours: f.hours.value.trim().slice(0, 120),
  };
  const api = (window.CONFIG || {}).API_URL;
  if (api) data.photos = photoData.slice(0, MAX_UP);
  if (!api) {
    $("out").hidden = false;
    $("out").textContent = JSON.stringify(data, null, 2);
    return say("ยังไม่ได้ตั้งค่าที่เก็บข้อมูลของเว็บ คัดลอกข้อมูลด้านล่างส่งให้ผู้ดูแลเว็บ (รูปภาพส่งได้เมื่อตั้งค่าที่เก็บข้อมูลแล้ว)");
  }
  const btn = f.querySelector('button[type="submit"]');
  btn.disabled = true; say("กำลังส่งข้อมูล...");
  try {
    await fetch(api, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(data) });
    say("ส่งข้อมูลแล้ว ทีมงานจะตรวจสอบก่อนแสดงบนเว็บ");
    f.reset();
    photoData.length = 0; renderThumbs(); $("aboutN").textContent = "0/300";
    clearPin();
  } catch (err) {
    say("ส่งไม่สำเร็จ ตรวจอินเทอร์เน็ตแล้วลองอีกครั้ง");
  } finally {
    btn.disabled = false;
  }
});

// ---------- load approved shops from the sheet ----------
function clean(x) {
  const lat = Number(x.lat), lng = Number(x.lng);
  if (!x.name || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { name: String(x.name).slice(0, 80), type: x.type === "yant" ? "yant" : "studio", styles: Array.isArray(x.styles) ? x.styles.map(String).slice(0, MAX_STYLES) : [], lat, lng, tel: safeTel(x.tel), fb: safeUrl(x.fb), ig: safeUrl(x.ig), about: String(x.about || "").slice(0, 300), hours: String(x.hours || "").slice(0, 120), photos: (Array.isArray(x.photos) ? x.photos : []).map(String).map(safeImg).filter(Boolean).slice(0, MAX_SHOW), isNew: true };
}
async function loadRemote() {
  const api = (window.CONFIG || {}).API_URL;
  if (!api) return;
  try {
    const j = await (await fetch(api)).json();
    (j.shops || []).map(clean).filter(Boolean).forEach((s) => shops.push(s));
    addReviews(j.reviews);
    renderChips(); render();
  } catch (err) { console.warn("โหลดร้านที่เพิ่มเองไม่สำเร็จ", err); }
}

renderChips(); render(); loadRemote();

// ---------- search place while typing (Photon, fallback Nominatim; both OpenStreetMap data) ----------
const placeList = $("placeList");
let placeTimer = null, placeReq = 0;

function photonLabel(p) {
  const parts = [p.name, p.housenumber && p.street ? p.housenumber + " " + p.street : p.street, p.district || p.locality, p.city || p.county, p.state];
  return parts.filter((x, i, arr) => x && arr.indexOf(x) === i).join(", ");
}
async function fetchPlaces(q) {
  try {
    const r = await fetch("https://photon.komoot.io/api/?limit=6&lat=16.44&lon=102.82&bbox=101.5,15.5,103.5,17.5&q=" + encodeURIComponent(q));
    if (!r.ok) throw new Error("photon " + r.status);
    const j = await r.json();
    return (j.features || []).map((ft) => ({ lat: ft.geometry.coordinates[1], lng: ft.geometry.coordinates[0], name: photonLabel(ft.properties) }));
  } catch (e) {
    const r = await fetch("https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&accept-language=th&countrycodes=th&bounded=1&viewbox=101.5,17.5,103.5,15.5&q=" + encodeURIComponent(q));
    if (!r.ok) throw new Error("nominatim " + r.status);
    return (await r.json()).map((p) => ({ lat: Number(p.lat), lng: Number(p.lon), name: p.display_name }));
  }
}
async function searchPlace() {
  const q = $("place").value.trim();
  if (q.length < 3) { placeList.hidden = true; return; }
  const id = ++placeReq;
  try {
    const list = (await fetchPlaces(q)).filter((p) => p.lat >= 15.5 && p.lat <= 17.5 && p.lng >= 101.5 && p.lng <= 103.5);
    if (id !== placeReq) return; // มีการพิมพ์ใหม่แล้ว ทิ้งผลเก่า
    placeList.hidden = false;
    if (!list.length) { placeList.innerHTML = '<li class="none">ไม่พบสถานที่นี้ในขอนแก่น ลองพิมพ์ชื่อถนนหรือจุดสังเกตใกล้ร้าน หรือกดปักหมุดบนแผนที่แทน</li>'; return; }
    placeList.innerHTML = list.map((p, i) => `<li><button type="button" data-i="${i}">${esc(p.name)}</button></li>`).join("");
    placeList.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
      const p = list[Number(b.dataset.i)];
      placeList.hidden = true;
      $("place").value = p.name;
      setPin(p.lat, p.lng);
    }));
  } catch (err) {
    if (id !== placeReq) return;
    placeList.hidden = false;
    placeList.innerHTML = '<li class="none">ค้นหาไม่สำเร็จ ตรวจอินเทอร์เน็ต หรือกดปักหมุดบนแผนที่แทน</li>';
  }
}
$("place").addEventListener("input", () => { clearTimeout(placeTimer); placeTimer = setTimeout(searchPlace, 600); });
$("place").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); clearTimeout(placeTimer); searchPlace(); } });

// ---------- shop detail dialog ----------
const dlg = $("dlg");
function openShop(s) {
  if (!s) return;
  const token = ++dlgToken;
  const ph = (s.photos || []).map(safeImg).filter(Boolean).slice(0, MAX_SHOW);
  const rate = s.rating ? `<p class="r"><b>★ ${esc(Number(s.rating).toFixed(1))}</b> Google · ${esc(s.count)} รีวิว</p>` : `<p class="r na">ร้านใหม่ ยังไม่มีคะแนน</p>`;
  const sty = s.styles && s.styles.length ? esc(s.styles.join(", ")) : "ยังไม่ระบุ";
  const thumbs = ph.length > 1 ? `<div class="gt">${ph.map((p, i) => `<button type="button" data-src="${esc(p)}" aria-label="ดูรูปที่ ${i + 1}"${i === 0 ? ' aria-current="true"' : ""}><img src="${esc(p)}" alt="" referrerpolicy="no-referrer"></button>`).join("")}</div>` : "";
  const gal = ph.length ? `<div class="gal"><img id="gMain" src="${esc(ph[0])}" alt="รูปร้าน ${esc(s.name)}" referrerpolicy="no-referrer">${thumbs}</div>` : '<div class="nophoto">ยังไม่มีรูปภาพของร้านนี้</div>';
  const note = s.about ? "" : '<p class="hint">สรุปจากข้อมูลที่มี ยังไม่มีคำแนะนำร้านจากเจ้าของ</p>';
  const q = !s.about && s.quote ? `<q>${esc(s.quote)}</q>` : "";
  dlg.innerHTML = `<div class="di"><div class="xr"><button type="button" class="x" aria-label="ปิด">✕</button></div>
    <div class="h"><span class="t${s.type === "yant" ? " y" : ""}">${typeLabel(s)}</span>${s.isNew ? '<span class="t">เพิ่มใหม่</span>' : ""}</div>
    <h3 id="dlgTitle">${esc(s.name)}</h3>${rate}${gal}
    <h4>แนะนำร้าน</h4><p class="ab">${esc(summary(s))}</p>${note}
    <p class="s"><b>ถนัด</b> ${sty}</p>${q}<div class="a">${links(s)}</div>${extraSections(s)}</div>`;
  dlg.querySelector(".x").addEventListener("click", () => dlg.close());
  const main = dlg.querySelector("#gMain");
  if (main) main.addEventListener("error", () => { main.replaceWith(Object.assign(document.createElement("div"), { className: "nophoto", textContent: "โหลดรูปภาพไม่สำเร็จ" })); });
  dlg.querySelectorAll(".gt button").forEach((b) => b.addEventListener("click", () => {
    if (main) main.src = b.dataset.src;
    dlg.querySelectorAll(".gt button").forEach((x) => x.removeAttribute("aria-current"));
    b.setAttribute("aria-current", "true");
  }));
  dlg.showModal();
  dlg.scrollTop = 0;
  renderSiteReviews(s);
  bindReviewForm(s);
  loadPlaceInfo(s, token);
}
dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
$("grid").addEventListener("click", (e) => { const b = e.target.closest(".more"); if (b) openShop(shops[Number(b.dataset.i)]); });
map.on("popupopen", (e) => {
  const b = e.popup.getElement().querySelector(".more");
  if (b) b.addEventListener("click", () => { map.closePopup(); openShop(shops[Number(b.dataset.i)]); });
});

// ---------- about counter + photo upload (resize in the browser) ----------
const photoData = [];
$("about").addEventListener("input", (e) => { $("aboutN").textContent = e.target.value.length + "/300"; });

function renderThumbs() {
  $("thumbs").innerHTML = photoData.map((p, i) => `<div class="th"><img src="${p}" alt="ตัวอย่างรูปที่ ${i + 1}"><button type="button" data-i="${i}" aria-label="ลบรูปที่ ${i + 1}">✕</button></div>`).join("");
}
function fileToJpeg(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const k = Math.min(1, 1000 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(img.width * k)); c.height = Math.max(1, Math.round(img.height * k));
      const g = c.getContext("2d");
      g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height);
      let q = 0.8, out = c.toDataURL("image/jpeg", q);
      while (out.length > 450000 && q > 0.4) { q -= 0.1; out = c.toDataURL("image/jpeg", q); }
      out.length > 600000 ? reject(new Error("too big")) : resolve(out);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("bad image")); };
    img.src = url;
  });
}
$("photos").addEventListener("change", async (e) => {
  const all = [...e.target.files];
  photoData.length = 0;
  if (all.length > MAX_UP) say("เลือกได้สูงสุด " + MAX_UP + " รูป ใช้ " + MAX_UP + " รูปแรก");
  for (const file of all.slice(0, MAX_UP)) {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { say("รับเฉพาะไฟล์ JPG, PNG, WebP"); continue; }
    try { photoData.push(await fileToJpeg(file)); } catch (err) { say("อ่านรูป " + file.name + " ไม่ได้ ลองรูปอื่น"); }
  }
  renderThumbs();
});
$("thumbs").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  photoData.splice(Number(b.dataset.i), 1);
  $("photos").value = "";
  renderThumbs();
});

// ---------- opening hours, Google info, and customer reviews ----------
let dlgToken = 0;
function starText(n) { const k = Math.max(0, Math.min(5, Math.round(Number(n) || 0))); return "★".repeat(k) + "☆".repeat(5 - k); }
function shopKey(s) { return (s.name + "|" + Number(s.lat).toFixed(4) + "|" + Number(s.lng).toFixed(4)).replace(/^[=+\-@\s]+/, ""); }

function addReviews(list) {
  Object.keys(reviewsByKey).forEach((k) => delete reviewsByKey[k]);
  (Array.isArray(list) ? list : []).forEach((r) => {
    const rating = Math.round(Number(r.rating));
    if (!r.key || !(rating >= 1 && rating <= 5)) return;
    if (!reviewsByKey[r.key]) reviewsByKey[r.key] = [];
    reviewsByKey[r.key].push({ rating, nick: String(r.nick || "").slice(0, 30), text: String(r.text || "").slice(0, 300), time: String(r.time || "").slice(0, 10) });
  });
}
function siteLine(s) {
  const l = reviewsByKey[shopKey(s)];
  if (!l || !l.length) return "";
  const avg = l.reduce((a, r) => a + r.rating, 0) / l.length;
  return `<p class="r2">ผู้ใช้เว็บให้ <b>★ ${esc(avg.toFixed(1))}</b> (${esc(l.length)} รีวิว)</p>`;
}

// เวลาเปิด-ปิดที่พิมพ์เองใน shops-data.js (hours:"..." หรือ hours:["จ. 10:00-20:00", ...])
function manualHours(s) {
  const h = s.hours;
  if (Array.isArray(h) && h.length) return `<ul class="hl">${h.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
  if (typeof h === "string" && h.trim()) return `<p class="ab">${esc(h)}</p>`;
  return "";
}
function hasManualHours(s) { return (Array.isArray(s.hours) && s.hours.length) || (typeof s.hours === "string" && s.hours.trim()); }

function reviewForm() {
  return `<form id="rf" class="rf" novalidate><h5>เขียนรีวิวความพึงพอใจของคุณ</h5>
    <div class="rs" role="group" aria-label="ให้คะแนน">${[1, 2, 3, 4, 5].map((n) => `<button type="button" class="star" data-v="${n}" aria-label="${n} ดาว" aria-pressed="false">★</button>`).join("")}</div>
    <label>ชื่อที่แสดง (ไม่ต้องใช้ชื่อจริง)<input name="nick" maxlength="30"></label>
    <label>ความคิดเห็น<textarea name="text" maxlength="300" rows="3" placeholder="เล่าประสบการณ์ เช่น ความสะอาด ความสุภาพ ผลงาน การตรงต่อเวลา"></textarea></label>
    <label class="ck1"><input type="checkbox" name="ok"> <span>ฉันเคยใช้บริการร้านนี้จริง รีวิวนี้เป็นความเห็นของฉันเอง และไม่มีข้อมูลส่วนตัวของผู้อื่น</span></label>
    <input name="website" class="trap" tabindex="-1" autocomplete="off">
    <button type="submit" class="pm">ส่งรีวิว</button>
    <p class="hint" id="rmsg" role="status">รีวิวจะแสดงหลังผู้ดูแลตรวจสอบ</p></form>`;
}

function gmapsLink(s) {
  const q = s.placeId ? "&query_place_id=" + encodeURIComponent(s.placeId) : "";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.name + " ขอนแก่น")}${q}`;
}
const googleLive = () => !!((window.CONFIG || {}).API_URL && (window.CONFIG || {}).GOOGLE_LIVE);

function extraSections(s) {
  const api = (window.CONFIG || {}).API_URL;
  return `<section class="xs"><h4>เวลาเปิด-ปิด</h4><div id="hrs">${googleLive() ? '<p class="hint">กำลังโหลดข้อมูลจาก Google...</p>' : manualHours(s)}</div><p class="hint"><a href="${esc(gmapsLink(s))}" target="_blank" rel="noopener">ดูเวลาเปิด-ปิดและรีวิวล่าสุดของร้านบน Google Maps</a></p></section>
    <section class="xs" id="gsec" hidden></section>
    <section class="xs"><h4>รีวิวจากผู้ใช้เว็บ</h4><div id="srev"></div>${api ? reviewForm() : '<p class="hint">ระบบรีวิวจะเปิดเมื่อตั้งค่าที่เก็บข้อมูลของเว็บแล้ว</p>'}</section>`;
}

function renderSiteReviews(s) {
  const box = $("srev");
  if (!box) return;
  const l = (reviewsByKey[shopKey(s)] || []).slice().reverse().slice(0, 20);
  if (!l.length) { box.innerHTML = '<p class="hint">ยังไม่มีรีวิวจากผู้ใช้เว็บ เป็นคนแรกที่รีวิวได้เลย</p>'; return; }
  const all = reviewsByKey[shopKey(s)];
  const avg = all.reduce((a, r) => a + r.rating, 0) / all.length;
  box.innerHTML = `<p class="r"><b>★ ${esc(avg.toFixed(1))}</b> จาก ${esc(all.length)} รีวิวของผู้ใช้เว็บ</p><ul class="rl">${l.map((r) => `<li class="sr"><b>${esc(r.nick)}</b> <span class="stars">${starText(r.rating)}</span> <span class="when">${esc(r.time)}</span><p>${esc(r.text)}</p></li>`).join("")}</ul>`;
}

function bindReviewForm(s) {
  const rf = $("rf");
  if (!rf) return;
  const api = (window.CONFIG || {}).API_URL;
  const key = shopKey(s), lk = "rv:" + key;
  const msg = (t) => { $("rmsg").textContent = t; };
  let sent = false;
  try { sent = !!localStorage.getItem(lk); } catch (e) { /* ignore */ }
  if (sent) { rf.innerHTML = '<p class="hint">คุณส่งรีวิวร้านนี้จากเบราว์เซอร์นี้แล้ว รีวิวจะแสดงหลังผู้ดูแลตรวจสอบ</p>'; return; }
  let rating = 0;
  rf.querySelectorAll(".star").forEach((b) => b.addEventListener("click", () => {
    rating = Number(b.dataset.v);
    rf.querySelectorAll(".star").forEach((x) => {
      x.classList.toggle("on", Number(x.dataset.v) <= rating);
      x.setAttribute("aria-pressed", String(Number(x.dataset.v) === rating));
    });
  }));
  rf.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (rf.website.value) return; // ช่องดักบอท
    const nick = rf.nick.value.trim(), text = rf.text.value.trim();
    if (!rating) return msg("เลือกคะแนนดาวก่อน");
    if (!nick) return msg("กรอกชื่อที่แสดง");
    if (text.length < 5) return msg("เขียนความคิดเห็นอย่างน้อย 5 ตัวอักษร");
    if (!rf.ok.checked) return msg("ติ๊กยืนยันก่อนส่งรีวิว");
    const btn = rf.querySelector('button[type="submit"]');
    btn.disabled = true; msg("กำลังส่ง...");
    try {
      await fetch(api, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ kind: "review", key, shop: s.name, rating, nick: nick.slice(0, 30), text: text.slice(0, 300) }) });
      try { localStorage.setItem(lk, "1"); } catch (e2) { /* ignore */ }
      rf.innerHTML = '<p class="hint">ส่งรีวิวแล้ว ขอบคุณครับ รีวิวจะแสดงหลังผู้ดูแลตรวจสอบ</p>';
    } catch (err) {
      btn.disabled = false; msg("ส่งไม่สำเร็จ ตรวจอินเทอร์เน็ตแล้วลองอีกครั้ง");
    }
  });
}

// ดึงเวลาเปิด-ปิด คะแนน และรีวิวจาก Google สด ๆ ผ่าน Apps Script (ไม่เก็บข้อมูล Google ไว้ในเว็บหรือชีต)
async function loadPlaceInfo(s, token) {
  const api = (window.CONFIG || {}).API_URL;
  if (!api || !googleLive()) return; // โหมดฟรี: ไม่เรียก Google API (เปิดได้ด้วย GOOGLE_LIVE:true ใน config.js ซึ่งต้องมี billing)
  const fallback = () => { if (token === dlgToken && $("hrs")) $("hrs").innerHTML = manualHours(s); };
  try {
    const u = api + "?action=google&name=" + encodeURIComponent(s.name) + "&lat=" + encodeURIComponent(s.lat) + "&lng=" + encodeURIComponent(s.lng) + (s.placeId ? "&pid=" + encodeURIComponent(s.placeId) : "");
    const j = await (await fetch(u)).json();
    if (token !== dlgToken || !dlg.open) return;
    if (!j.ok || !j.place) return fallback();
    const p = j.place;
    const gm = safeUrl(p.mapsUri);
    const attr = `<p class="gm">ข้อมูลจาก ${gm ? `<a href="${esc(gm)}" target="_blank" rel="noopener">Google Maps</a>` : "Google Maps"}</p>`;
    const hours = Array.isArray(p.hours) ? p.hours : [];
    if (hours.length) {
      const badge = p.openNow === true ? '<p class="on">เปิดอยู่ตอนนี้</p>' : p.openNow === false ? '<p class="off">ปิดอยู่ตอนนี้</p>' : "";
      $("hrs").innerHTML = `<div class="gbox">${badge}<ul class="hl">${hours.map((h) => `<li>${esc(h)}</li>`).join("")}</ul>${attr}</div>`;
    } else if (hasManualHours(s)) {
      fallback();
    } else {
      $("hrs").innerHTML = `<div class="gbox"><p class="hint">Google ยังไม่มีข้อมูลเวลาเปิด-ปิดของร้านนี้</p>${attr}</div>`;
    }
    const revs = Array.isArray(p.reviews) ? p.reviews : [];
    if (p.rating || revs.length) {
      const head = p.rating ? `<p class="r"><b>★ ${esc(Number(p.rating).toFixed(1))}</b> Google · ${esc(p.count)} รีวิว</p>` : "";
      const items = revs.map((r) => {
        const ph = safeImg(r.photo), au = safeUrl(r.authorUri), nm = esc(r.author || "ผู้ใช้ Google");
        return `<li class="gr">${ph ? `<img class="av" src="${esc(ph)}" alt="" referrerpolicy="no-referrer">` : ""}<div><b>${au ? `<a href="${esc(au)}" target="_blank" rel="noopener">${nm}</a>` : nm}</b> <span class="stars">${starText(r.rating)}</span> <span class="when">${esc(r.when)}</span><p>${esc(String(r.text || "").slice(0, 500))}</p></div></li>`;
      }).join("");
      const gs = $("gsec");
      gs.innerHTML = `<h4>รีวิวจาก Google</h4><div class="gbox">${head}${items ? `<p class="hint">รีวิวที่ Google จัดว่าเกี่ยวข้องที่สุด สูงสุด 5 รายการ</p><ul class="rl">${items}</ul>` : ""}${attr}</div>`;
      gs.hidden = false;
    }
  } catch (err) { fallback(); }
}

// ---------- สลับมุมมอง: กดแท็บ "เพิ่มร้านของคุณ" (#add) แสดงเฉพาะแผนที่กับฟอร์มเพิ่มร้าน ----------
function syncView(initial) {
  const on = location.hash === "#add";
  document.body.classList.toggle("view-add", on); // ซ่อนหัวเว็บใหญ่และรายการร้านทั้งหมดผ่าน CSS
  $("add").hidden = !on;
  map.invalidateSize();
  if (on) { window.scrollTo({ top: 0 }); return; }
  if (initial) return;
  const t = location.hash.length > 1 ? document.getElementById(location.hash.slice(1)) : null;
  if (t) t.scrollIntoView({ block: "start" }); else window.scrollTo({ top: 0 });
}
window.addEventListener("hashchange", () => syncView(false));
syncView(true);
