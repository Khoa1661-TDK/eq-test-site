/* environments.js — các bối cảnh pixel tự vẽ (SVG) cho cảnh tình huống EQ.
   Mỗi bối cảnh là một hàm trả về chuỗi <svg class="scn-env__svg"> cùng khung
   STAGE_W × STAGE_H, mặt sàn ở GROUND_Y. Lớp chuyển động phụ (mưa, màn hình,
   khói, đồng hồ, lá cây) chạy bằng CSS animation theo class scn-*. */

import { canteenSVG, corridorSVG, bedroomSVG, librarySVG } from "./environmentsMore.js"
import { homeSVG, streetSVG, parkSVG, cafeSVG } from "./environmentsOutside.js"

function officeSVG({ STAGE_W, STAGE_H, GROUND_Y }) {
  /* Phòng họp: tường giấy, cửa sổ mưa nhẹ, bảng trắng, bàn họp, ghế, cây,
     đồng hồ, màn hình máy tính nhấp nhẹ. Toàn bộ vẽ tay bằng rect SVG. */
  const w = STAGE_W, h = STAGE_H
  const r = []
  const rect = (x, y, wd, ht, fill, extra = "") =>
    r.push(`<rect x="${x}" y="${y}" width="${wd}" height="${ht}" fill="${fill}" ${extra}/>`)
  // tường + sàn
  rect(0, 0, w, GROUND_Y, "#e9e5d9")
  rect(0, GROUND_Y, w, h - GROUND_Y, "#cfc9b6")
  rect(0, GROUND_Y - 4, w, 4, "#b8b19c")
  // cửa sổ (trái) với trời xám + mưa
  rect(14, 22, 64, 56, "#31556b")
  rect(18, 26, 56, 48, "#5f7b8f")
  rect(18, 26, 56, 24, "#7d95a8")
  // mây mưa
  r.push(`<g class="scn-rain" fill="#9fb4c4">
    <rect x="24" y="34" width="10" height="3"/>
    <rect x="44" y="30" width="12" height="3"/>
    <rect x="60" y="38" width="8" height="3"/>
    <rect x="30" y="50" width="12" height="3"/>
    <rect x="52" y="56" width="10" height="3"/>
  </g>`)
  // khung cửa sổ
  rect(14, 22, 64, 3, "#16181c")
  rect(14, 75, 64, 3, "#16181c")
  rect(14, 22, 3, 56, "#16181c")
  rect(75, 22, 3, 56, "#16181c")
  rect(44, 22, 3, 56, "#16181c")
  // đồng hồ (trần phải)
  r.push(`<g class="scn-clock">
    <circle cx="292" cy="34" r="12" fill="#f4efe2" stroke="#16181c" stroke-width="2"/>
    <rect x="291" y="26" width="2" height="9" fill="#16181c"/>
    <rect x="292" y="33" width="7" height="2" fill="#16181c"/>
  </g>`)
  // bảng trắng (giữa)
  rect(120, 26, 96, 54, "#f4efe2")
  rect(120, 26, 96, 54, "none", `stroke="#16181c" stroke-width="2"`)
  rect(128, 36, 52, 3, "#8f9aa6")
  rect(128, 44, 64, 3, "#8f9aa6")
  rect(128, 52, 44, 3, "#8f9aa6")
  rect(128, 60, 58, 3, "#b8b19c")
  // máy tính + màn hình nhấp (trên bàn)
  rect(236, 60, 40, 28, "#16181c")
  r.push(`<rect class="scn-screen" x="239" y="63" width="34" height="22" fill="#3a6f8f"/>`)
  rect(239, 67, 20, 2, "#e9e5d9")
  rect(239, 72, 26, 2, "#e9e5d9")
  rect(252, 88, 14, 4, "#16181c")
  // bàn họp
  rect(108, 108, 168, 10, "#7a5c3e")
  rect(112, 118, 8, 40, "#5d4530")
  rect(260, 118, 8, 40, "#5d4530")
  // ly cà phê + khói
  rect(124, 98, 12, 10, "#4f6033")
  r.push(`<g class="scn-steam" fill="#e9e5d9">
    <rect x="127" y="90" width="3" height="4"/>
    <rect x="131" y="86" width="3" height="4"/>
    <rect x="128" y="81" width="3" height="4"/>
  </g>`)
  // cây (phải)
  rect(296, 96, 16, 22, "#7a5c3e")
  rect(292, 74, 24, 24, "#4f6033")
  rect(296, 66, 16, 12, "#6b8047")
  // ghế (2 chiếc)
  rect(150, 128, 26, 8, "#3a3f47")
  rect(154, 136, 4, 22, "#2f343d")
  rect(168, 136, 4, 22, "#2f343d")
  rect(200, 128, 26, 8, "#3a3f47")
  rect(204, 136, 4, 22, "#2f343d")
  rect(218, 136, 4, 22, "#2f343d")
  return `<svg class="scn-env__svg" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" aria-hidden="true">${r.join("")}</svg>`
}

function classroomSVG({ STAGE_W, STAGE_H, GROUND_Y }) {
  /* Lớp học: bảng xanh, bàn giáo viên với sách và hộp bút, 2 hàng bàn học
     (sau hàng đứng của nhân vật), cửa sổ nắng với cây đung đưa, đồng hồ,
     bảng thông báo, quạt trần, sàn gạch. */
  const w = STAGE_W, h = STAGE_H
  const r = []
  const rect = (x, y, wd, ht, fill, extra = "") =>
    r.push(`<rect x="${x}" y="${y}" width="${wd}" height="${ht}" fill="${fill}" ${extra}/>`)
  // tường + sàn gạch
  rect(0, 0, w, GROUND_Y, "#e9e5d9")
  rect(0, GROUND_Y, w, h - GROUND_Y, "#cfc9b6")
  rect(0, GROUND_Y - 4, w, 4, "#b8b19c")
  for (let x = 32; x < w; x += 32) rect(x, GROUND_Y, 2, h - GROUND_Y, "#b8b19c")
  rect(0, 185, w, 2, "#b8b19c")
  // cửa sổ (trái) với nắng + cây ngoài sân
  rect(14, 22, 64, 56, "#31556b")
  rect(18, 26, 56, 48, "#d6c78c")
  rect(18, 26, 56, 22, "#e4d9a4")
  rect(58, 30, 10, 10, "#f4efe2")
  rect(26, 50, 6, 24, "#7a5c3e")
  r.push(`<g class="scn-rain">
    <rect x="18" y="38" width="16" height="16" fill="#4f6033"/>
    <rect x="30" y="32" width="14" height="12" fill="#4f6033"/>
    <rect x="24" y="42" width="10" height="8" fill="#6b8047"/>
    <rect x="20" y="52" width="12" height="8" fill="#6b8047"/>
  </g>`)
  // vệt nắng trên sàn
  rect(84, 150, 44, 10, "#ddd2a0")
  // khung cửa sổ
  rect(14, 22, 64, 3, "#16181c")
  rect(14, 75, 64, 3, "#16181c")
  rect(14, 22, 3, 56, "#16181c")
  rect(75, 22, 3, 56, "#16181c")
  rect(44, 22, 3, 56, "#16181c")
  // đồng hồ (tường, trái bảng)
  r.push(`<g class="scn-clock">
    <circle cx="96" cy="38" r="11" fill="#f4efe2" stroke="#16181c" stroke-width="2"/>
    <rect x="95" y="31" width="2" height="8" fill="#16181c"/>
    <rect x="96" y="37" width="6" height="2" fill="#16181c"/>
  </g>`)
  // quạt trần
  rect(162, 0, 8, 5, "#16181c")
  rect(158, 5, 16, 7, "#31556b")
  r.push(`<g class="scn-rain">
    <rect x="126" y="9" width="30" height="5" fill="#5d4530"/>
    <rect x="180" y="9" width="30" height="5" fill="#5d4530"/>
  </g>`)
  // bảng xanh (giữa) + dòng ngày + khay phấn
  rect(114, 22, 104, 62, "#5d4530")
  rect(118, 26, 96, 54, "#2f4a3a")
  rect(176, 32, 30, 2, "#e9e5d9")
  rect(126, 44, 44, 3, "#e9e5d9")
  rect(126, 52, 60, 3, "#cfc9b6")
  rect(126, 60, 38, 3, "#e9e5d9")
  rect(114, 84, 104, 4, "#7a5c3e")
  rect(124, 81, 8, 3, "#f4efe2")
  rect(136, 81, 6, 3, "#cfc9b6")
  // bảng thông báo (phải) với giấy ghim
  rect(232, 26, 64, 48, "#7a5c3e")
  rect(236, 30, 56, 40, "#c9b68f")
  rect(240, 34, 14, 16, "#f4efe2")
  rect(262, 36, 14, 14, "#e9e5d9")
  rect(242, 54, 12, 12, "#e9e5d9")
  rect(264, 56, 14, 12, "#f4efe2")
  rect(246, 33, 3, 3, "#16181c")
  rect(268, 35, 3, 3, "#16181c")
  rect(247, 53, 3, 3, "#16181c")
  rect(270, 55, 3, 3, "#16181c")
  // bàn giáo viên (phải) với chồng sách + hộp bút
  rect(228, 116, 64, 8, "#7a5c3e")
  rect(232, 124, 6, 40, "#5d4530")
  rect(282, 124, 6, 40, "#5d4530")
  rect(244, 124, 36, 12, "#96714e")
  rect(234, 111, 22, 5, "#31556b")
  rect(236, 106, 18, 5, "#4f6033")
  rect(238, 101, 14, 5, "#96503c")
  rect(270, 102, 14, 14, "#31556b")
  rect(272, 96, 3, 7, "#e4d9a4")
  rect(277, 94, 3, 9, "#96503c")
  // 2 hàng bàn học nhìn nghiêng, sau hàng đứng của nhân vật
  for (const x of [36, 88, 140, 192]) {
    rect(x, 132, 36, 4, "#7a5c3e")
    rect(x + 2, 136, 4, 24, "#5d4530")
    rect(x + 30, 136, 4, 24, "#5d4530")
  }
  rect(46, 128, 12, 4, "#f4efe2")
  rect(150, 128, 12, 4, "#f4efe2")
  for (const x of [62, 122, 182]) {
    rect(x, 148, 38, 5, "#7a5c3e")
    rect(x + 3, 153, 4, 17, "#5d4530")
    rect(x + 31, 153, 4, 17, "#5d4530")
  }
  rect(132, 144, 14, 4, "#e9e5d9")
  return `<svg class="scn-env__svg" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" aria-hidden="true">${r.join("")}</svg>`
}

function schoolyardSVG({ STAGE_W, STAGE_H, GROUND_Y }) {
  /* Sân trường giờ ra chơi: trời, dãy phòng học mái ngói đỏ, cây bàng lớn
     với ghế đá, ki-ốt nước giải khát, tường thấp, sân lát gạch. */
  const w = STAGE_W, h = STAGE_H
  const r = []
  const rect = (x, y, wd, ht, fill, extra = "") =>
    r.push(`<rect x="${x}" y="${y}" width="${wd}" height="${ht}" fill="${fill}" ${extra}/>`)
  // trời + mây
  rect(0, 0, w, 148, "#e9e5d9")
  rect(36, 12, 30, 6, "#cfc9b6")
  rect(118, 18, 26, 5, "#cfc9b6")
  rect(168, 8, 22, 5, "#cfc9b6")
  // sân lát gạch
  rect(0, 148, w, h - 148, "#cfc9b6")
  rect(0, GROUND_Y - 4, w, 4, "#b8b19c")
  for (let x = 0; x < w; x += 40) rect(x, GROUND_Y, 2, h - GROUND_Y, "#b8b19c")
  rect(0, 186, w, 2, "#b8b19c")
  // dãy phòng học (trái) với mái ngói đỏ
  rect(4, 24, 224, 8, "#96503c")
  for (let x = 8; x < 228; x += 8) rect(x, 30, 3, 3, "#7a3e30")
  rect(8, 32, 216, 118, "#e9e5d9")
  const win = (x, y) => {
    rect(x, y, 32, 24, "#16181c")
    rect(x + 2, y + 2, 28, 20, "#31556b")
    rect(x + 2, y + 2, 28, 9, "#7d95a8")
    rect(x + 15, y + 2, 2, 20, "#16181c")
  }
  for (const x of [24, 72, 120, 168]) win(x, 48)
  for (const x of [24, 72, 168]) win(x, 88)
  // cửa chính + bệ tường
  rect(104, 108, 28, 42, "#5d4530")
  rect(108, 112, 20, 38, "#7a5c3e")
  rect(112, 118, 6, 10, "#96714e")
  rect(122, 118, 6, 10, "#96714e")
  rect(126, 134, 2, 3, "#16181c")
  rect(8, 144, 216, 6, "#b8b19c")
  // tường thấp (trái)
  rect(4, 124, 96, 5, "#b8b19c")
  rect(8, 129, 88, 19, "#cfc9b6")
  for (const x of [30, 52, 74]) rect(x, 129, 2, 19, "#b8b19c")
  // ki-ốt nước giải khát
  for (let i = 0; i < 6; i++) rect(168 + i * 8, 104, 8, 8, i % 2 ? "#e9e5d9" : "#96503c")
  rect(168, 112, 4, 36, "#5d4530")
  rect(212, 112, 4, 36, "#5d4530")
  rect(166, 120, 52, 5, "#5d4530")
  rect(168, 125, 48, 23, "#7a5c3e")
  rect(176, 112, 5, 8, "#31556b")
  rect(184, 112, 5, 8, "#4f6033")
  rect(192, 112, 5, 8, "#96503c")
  // cây bàng lớn (phải)
  rect(256, 84, 12, 64, "#7a5c3e")
  rect(240, 98, 16, 6, "#7a5c3e")
  rect(268, 90, 18, 6, "#7a5c3e")
  rect(216, 30, 96, 46, "#4f6033")
  rect(228, 18, 72, 14, "#6b8047")
  rect(206, 42, 14, 20, "#4f6033")
  rect(306, 42, 14, 20, "#4f6033")
  r.push(`<g class="scn-rain" fill="#6b8047">
    <rect x="210" y="34" width="12" height="8"/>
    <rect x="300" y="24" width="12" height="8"/>
    <rect x="252" y="10" width="14" height="8"/>
    <rect x="286" y="46" width="12" height="8"/>
  </g>`)
  // hoa phượng điểm trên tán
  rect(232, 42, 4, 4, "#b0563f")
  rect(272, 34, 4, 4, "#b0563f")
  rect(294, 54, 4, 4, "#b0563f")
  rect(248, 58, 4, 4, "#b0563f")
  rect(282, 66, 4, 4, "#b0563f")
  // ghế đá dưới cây
  rect(248, 114, 4, 20, "#5d4530")
  rect(288, 114, 4, 20, "#5d4530")
  rect(246, 118, 48, 4, "#7a5c3e")
  rect(246, 125, 48, 4, "#7a5c3e")
  rect(244, 134, 52, 5, "#7a5c3e")
  rect(248, 139, 4, 9, "#5d4530")
  rect(288, 139, 4, 9, "#5d4530")
  return `<svg class="scn-env__svg" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" aria-hidden="true">${r.join("")}</svg>`
}

const ENVIRONMENTS = {
  office: officeSVG,
  canteen: canteenSVG,
  corridor: corridorSVG,
  bedroom: bedroomSVG,
  library: librarySVG,
  classroom: classroomSVG,
  schoolyard: schoolyardSVG,
  home: homeSVG,
  street: streetSVG,
  park: parkSVG,
  cafe: cafeSVG,
}

export function environmentSVG(name, dims) {
  return (ENVIRONMENTS[name] ?? officeSVG)(dims)
}

/* Người qua lại phía sau theo bối cảnh (phông, nhỏ và nhạt hơn nhân vật chính).
   {kind:"walk", y, from, to, dur, delay, variant}  — đi qua lại dọc y (mép chân), dur giây
   {kind:"sit"|"chat"|"stand", x, y, variant}       — đứng/ngồi tại chỗ
   {kind:"cat", x, y}                               — mèo ngủ
   y là toạ độ mép chân trong khung 320x200; cảnh có thể ghi đè bằng scene.extras. */
export const ENV_AMBIENT = {
  classroom: [
    { kind: "walk", y: 179, from: -30, to: 350, dur: 16, delay: 1, variant: 0 },
    { kind: "walk", y: 177, from: 350, to: -30, dur: 20, delay: 7, variant: 1 },
    { kind: "chat", x: 232, y: 178, variant: 0 },
    { kind: "chat", x: 246, y: 178, variant: 2 },
  ],
  schoolyard: [
    { kind: "walk", y: 180, from: -30, to: 350, dur: 14, delay: 0, variant: 1 },
    { kind: "walk", y: 177, from: 350, to: -30, dur: 18, delay: 5, variant: 0 },
    { kind: "chat", x: 20, y: 178, variant: 2 },
    { kind: "chat", x: 34, y: 178, variant: 0 },
  ],
  canteen: [
    { kind: "walk", y: 179, from: -30, to: 350, dur: 18, delay: 2, variant: 0 },
    { kind: "sit", x: 40, y: 179, variant: 1 },
    { kind: "sit", x: 252, y: 179, variant: 2 },
    { kind: "stand", x: 150, y: 178, variant: 0 },
  ],
  corridor: [
    { kind: "walk", y: 179, from: -30, to: 350, dur: 12, delay: 0, variant: 0 },
    { kind: "walk", y: 177, from: 350, to: -30, dur: 15, delay: 4, variant: 1 },
    { kind: "walk", y: 180, from: -30, to: 350, dur: 22, delay: 9, variant: 2 },
    { kind: "chat", x: 250, y: 178, variant: 1 },
    { kind: "chat", x: 264, y: 178, variant: 0 },
  ],
  library: [
    { kind: "sit", x: 36, y: 180, variant: 0 },
    { kind: "sit", x: 252, y: 180, variant: 1 },
    { kind: "walk", y: 178, from: -30, to: 350, dur: 26, delay: 3, variant: 2 },
  ],
  bedroom: [
    { kind: "cat", x: 250, y: 172 },
  ],
  home: [
    { kind: "cat", x: 120, y: 185 },
  ],
  street: [
    { kind: "walk", y: 179, from: -30, to: 350, dur: 17, delay: 0, variant: 1 },
    { kind: "walk", y: 177, from: 350, to: -30, dur: 21, delay: 6, variant: 2 },
    { kind: "walk", y: 180, from: -30, to: 350, dur: 25, delay: 11, variant: 0 },
    { kind: "stand", x: 128, y: 178, variant: 0 },
  ],
  park: [
    { kind: "walk", y: 179, from: -30, to: 350, dur: 22, delay: 1, variant: 0 },
    { kind: "walk", y: 177, from: 350, to: -30, dur: 18, delay: 8, variant: 1 },
    { kind: "walk", y: 180, from: -30, to: 350, dur: 28, delay: 14, variant: 2 },
    { kind: "chat", x: 150, y: 178, variant: 2 },
  ],
  cafe: [
    { kind: "sit", x: 176, y: 179, variant: 1 },
    { kind: "sit", x: 212, y: 179, variant: 2 },
    { kind: "stand", x: 90, y: 178, variant: 0 },
  ],
  office: [
    { kind: "walk", y: 179, from: -30, to: 350, dur: 20, delay: 2, variant: 2 },
    { kind: "sit", x: 30, y: 180, variant: 2 },
    { kind: "stand", x: 292, y: 178, variant: 1 },
  ],
}
