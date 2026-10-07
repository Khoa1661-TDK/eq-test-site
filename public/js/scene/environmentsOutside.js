/* environmentsOutside.js — bốn bối cảnh pixel ngoài trường (nhà buổi tối, phố
   trước cổng trường, công viên, quán trà sữa). Cùng chữ ký và bảng màu với
   environmentsMore.js: mỗi hàm trả về chuỗi <svg class="scn-env__svg"> khung
   STAGE_W × STAGE_H, mặt sàn ở GROUND_Y, chỉ dùng rect (vài circle), toạ độ
   nguyên. Chuyển động phụ chỉ qua class scn-* trên nhóm <g>. Hàm thuần, không DOM.
   Vùng y 120–186 không đặt vật cao: nhân vật đứng ngay phía trước. */

function painter(w, h) {
  const r = []
  const rect = (x, y, wd, ht, fill, extra = "") =>
    r.push(`<rect x="${x}" y="${y}" width="${wd}" height="${ht}" fill="${fill}" ${extra}/>`)
  const circle = (cx, cy, rad, fill, extra = "") =>
    r.push(`<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${fill}" ${extra}/>`)
  const group = (cls, draw) => {
    r.push(`<g class="${cls}">`)
    draw()
    r.push("</g>")
  }
  const svg = () =>
    `<svg class="scn-env__svg" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" aria-hidden="true">${r.join("")}</svg>`
  return { rect, circle, group, svg }
}

/* Tán cây pixel: khối tròn bằng các dải rect + vài điểm sáng. */
function crown(rect, cx, cy, rw, rh, dark, mid, light) {
  for (let j = 0; j < rh; j += 2) {
    const t = (j - rh / 2 + 1) / (rh / 2)
    const half = Math.round(rw * Math.sqrt(Math.max(0, 1 - t * t)))
    rect(cx - half, cy + j, half * 2, 2, j < rh / 3 ? light : j < (rh * 2) / 3 ? mid : dark)
  }
}

/* ------------------------------------------------------------------ nhà */
export function homeSVG({ STAGE_W, STAGE_H, GROUND_Y }) {
  /* Phòng khách kiêm bàn ăn buổi tối: tường kem ấm, cửa sổ chạng vạng, quạt
     trần, ảnh gia đình, bàn thờ nhỏ + lịch, tủ TV sáng, bàn ăn thấp có bát cơm,
     sàn gạch hoa. */
  const w = STAGE_W, h = STAGE_H
  const { rect, circle, group, svg } = painter(w, h)
  rect(0, 0, w, GROUND_Y, "#e2cfa6")
  rect(0, 0, w, 6, "#cdb98e")
  rect(0, 96, w, GROUND_Y - 96, "#d6c08f")
  rect(0, 94, w, 3, "#96714e")
  rect(0, GROUND_Y - 4, w, 4, "#7a5c3e")
  // sàn gạch hoa
  rect(0, GROUND_Y, w, h - GROUND_Y, "#d9cdb0")
  for (let row = 0; row < 2; row++)
    for (let i = 0; i * 24 < w; i++)
      if ((i + row) % 2) rect(i * 24, GROUND_Y + row * 14, 24, 14, "#c9ba98")
  for (let x = 24; x < w; x += 24) rect(x, GROUND_Y, 2, h - GROUND_Y, "#b8a883")
  rect(0, 186, w, 2, "#b8a883")
  // vệt đèn vàng trên sàn
  rect(110, 174, 100, 3, "#e8d49a")
  // cửa sổ chạng vạng (trái) + rèm
  rect(12, 24, 54, 62, "#16181c")
  rect(15, 27, 48, 56, "#3a4f6b")
  rect(15, 27, 48, 24, "#5a5f86")
  rect(15, 51, 48, 14, "#c98a5a")
  rect(15, 65, 48, 18, "#31556b")
  rect(37, 27, 3, 56, "#16181c")
  rect(15, 55, 48, 3, "#16181c")
  rect(46, 33, 3, 3, "#f4efe2")
  rect(22, 35, 2, 2, "#f4efe2")
  rect(8, 21, 62, 3, "#5d4530")
  rect(10, 24, 9, 62, "#96503c")
  rect(59, 24, 9, 62, "#96503c")
  rect(10, 86, 58, 3, "#b8a883")
  // ảnh gia đình (nhiều khung)
  rect(86, 26, 40, 30, "#5d4530")
  rect(89, 29, 34, 24, "#e9e5d9")
  rect(94, 40, 5, 11, "#31556b")
  rect(101, 36, 6, 15, "#96503c")
  rect(109, 40, 5, 11, "#6b8047")
  rect(95, 34, 3, 4, "#c9b68f")
  rect(102, 30, 4, 5, "#c9b68f")
  rect(110, 34, 3, 4, "#c9b68f")
  rect(88, 62, 14, 12, "#5d4530")
  rect(90, 64, 10, 8, "#d6c78c")
  rect(110, 62, 16, 12, "#5d4530")
  rect(112, 64, 12, 8, "#9fb4c4")
  // quạt trần: cánh quay (hiệu ứng mờ nhấp nháy)
  rect(158, 0, 3, 14, "#5d4530")
  rect(152, 14, 15, 5, "#7a5c3e")
  group("scn-steam", () => {
    rect(120, 20, 36, 3, "#b8a883")
    rect(163, 20, 36, 3, "#b8a883")
  })
  // kệ bàn thờ + lịch (giữa-phải)
  rect(214, 26, 22, 30, "#e9e5d9")
  rect(214, 26, 22, 7, "#b0563f")
  rect(218, 37, 14, 3, "#16181c")
  rect(218, 43, 14, 3, "#8f9aa6")
  rect(218, 49, 8, 3, "#8f9aa6")
  rect(250, 30, 54, 3, "#5d4530")
  rect(254, 33, 4, 8, "#5d4530")
  rect(296, 33, 4, 8, "#5d4530")
  rect(256, 22, 8, 8, "#d6c78c")
  rect(268, 20, 10, 10, "#b0563f")
  rect(282, 22, 8, 8, "#d6c78c")
  rect(272, 12, 2, 8, "#cfc9b6")
  group("scn-steam", () => {
    rect(272, 6, 2, 4, "#e9e5d9")
    rect(274, 2, 2, 4, "#e9e5d9")
  })
  rect(270, 18, 2, 2, "#b0563f")
  // tủ TV bên phải (thấp, sau hàng đứng)
  rect(236, 100, 66, 44, "#16181c")
  group("scn-screen", () => {
    rect(240, 104, 58, 36, "#31556b")
    rect(240, 104, 58, 14, "#5f7b8f")
    rect(246, 124, 14, 12, "#e4d9a4")
    rect(266, 120, 24, 3, "#e9e5d9")
    rect(266, 127, 18, 3, "#e9e5d9")
  })
  rect(262, 144, 14, 4, "#3a3f47")
  rect(232, 148, 74, 6, "#7a5c3e")
  rect(232, 154, 74, 18, "#5d4530")
  rect(236, 157, 32, 12, "#96714e")
  rect(272, 157, 30, 12, "#96714e")
  rect(300, 148, 12, 24, "#5d4530")
  // bàn ăn thấp có bát cơm (giữa)
  rect(98, 154, 104, 5, "#96714e")
  rect(98, 159, 104, 3, "#7a5c3e")
  rect(104, 162, 6, 10, "#5d4530")
  rect(190, 162, 6, 10, "#5d4530")
  for (const [x, c] of [[110, "#f4efe2"], [138, "#f4efe2"], [170, "#f4efe2"]]) {
    rect(x, 150, 10, 4, "#31556b")
    rect(x + 1, 148, 8, 2, c)
  }
  rect(124, 149, 14, 5, "#96503c")
  rect(124, 148, 14, 1, "#d6c78c")
  rect(152, 150, 14, 4, "#6b8047")
  rect(184, 146, 6, 8, "#c9b68f")
  group("scn-steam", () => {
    rect(113, 143, 2, 3, "#f4efe2")
    rect(141, 143, 2, 3, "#f4efe2")
    rect(173, 143, 2, 3, "#f4efe2")
  })
  // ghế đẩu nhựa
  rect(70, 156, 16, 3, "#b0563f")
  rect(72, 159, 3, 13, "#7a3e30")
  rect(81, 159, 3, 13, "#7a3e30")
  rect(212, 156, 16, 3, "#b0563f")
  rect(214, 159, 3, 13, "#7a3e30")
  rect(223, 159, 3, 13, "#7a3e30")
  return svg()
}

/* ------------------------------------------------------------------ phố */
export function streetSVG({ STAGE_W, STAGE_H, GROUND_Y }) {
  /* Phố trước cổng trường buổi chiều: trời xanh có mây, dãy nhà phố nhiều
     màu có biển hiệu và ban công, dây điện, biển + ghế trạm xe buýt, xe máy
     đỗ, xe đẩy đồ ăn, vỉa hè lát gạch. */
  const w = STAGE_W, h = STAGE_H
  const { rect, group, svg } = painter(w, h)
  rect(0, 0, w, GROUND_Y, "#bfd2da")
  rect(0, 0, w, 40, "#a9c3d0")
  rect(30, 16, 36, 5, "#f4efe2")
  rect(40, 12, 20, 4, "#f4efe2")
  rect(190, 24, 44, 5, "#f4efe2")
  rect(200, 20, 22, 4, "#f4efe2")
  // dãy nhà phố
  const house = (x, wd, top, wall, trim, door) => {
    rect(x, top, wd, 140 - top + 32, wall)
    rect(x, top, wd, 4, trim)
    // cửa sổ có ban công
    for (let wx = x + 6; wx + 12 <= x + wd - 4; wx += 20) {
      rect(wx, top + 12, 12, 16, "#16181c")
      rect(wx + 2, top + 14, 8, 12, "#7d95a8")
      rect(wx - 2, top + 28, 16, 3, "#5d4530")
      rect(wx - 2, top + 30, 16, 2, "#7a5c3e")
    }
    // tầng trệt: cửa cuốn / cửa hàng
    rect(x + 4, 104, wd - 8, 68, "#16181c")
    rect(x + 6, 106, wd - 12, 64, door)
    for (let sy = 108; sy < 170; sy += 5) rect(x + 6, sy, wd - 12, 1, "#00000022")
    rect(x, 96, wd, 8, trim)
  }
  house(0, 66, 40, "#d6b87a", "#96503c", "#b8b19c")
  house(66, 56, 56, "#c9d3b0", "#4f6033", "#e4d9a4")
  house(122, 70, 36, "#dcb4a0", "#7a3e30", "#7d95a8")
  house(192, 58, 52, "#cfd6e0", "#31556b", "#c9b68f")
  house(250, 70, 44, "#e4d9a4", "#b0563f", "#b8b19c")
  // biển hiệu
  rect(10, 86, 46, 9, "#b0563f")
  rect(14, 89, 38, 3, "#f4efe2")
  rect(128, 84, 56, 10, "#31556b")
  rect(132, 87, 48, 3, "#f4efe2")
  rect(258, 84, 50, 10, "#4f6033")
  rect(262, 87, 42, 3, "#e4d9a4")
  // dây điện + cột
  rect(92, 0, 5, 180, "#7a5c3e")
  rect(80, 14, 30, 3, "#5d4530")
  rect(0, 26, 320, 1, "#16181c")
  rect(0, 33, 320, 1, "#16181c")
  rect(0, 40, 320, 1, "#3a3f47")
  rect(204, 22, 2, 4, "#16181c")
  rect(250, 22, 2, 4, "#16181c")
  // vỉa hè + bó vỉa
  rect(0, GROUND_Y, w, h - GROUND_Y, "#cfc9b6")
  for (let i = 0; i * 24 < w; i++) rect(i * 24, GROUND_Y + 2, 2, h - GROUND_Y, "#b8b19c")
  rect(0, 186, w, 2, "#b8b19c")
  rect(0, GROUND_Y - 4, w, 4, "#b8b19c")
  rect(0, GROUND_Y - 6, w, 2, "#e9e5d9")
  // biển trạm xe buýt + ghế (trái-giữa)
  rect(142, 108, 3, 64, "#8f9aa6")
  rect(130, 98, 26, 12, "#3a6f8f")
  rect(133, 101, 20, 3, "#f4efe2")
  rect(133, 105, 12, 2, "#f4efe2")
  rect(106, 150, 40, 4, "#96714e")
  rect(106, 154, 40, 2, "#7a5c3e")
  rect(108, 156, 4, 16, "#3a3f47")
  rect(140, 156, 4, 16, "#3a3f47")
  rect(106, 142, 40, 3, "#96714e")
  rect(108, 145, 3, 5, "#5d4530")
  rect(141, 145, 3, 5, "#5d4530")
  // xe máy đỗ (thấp, kề nhà)
  const bike = (x, body, flip) => {
    rect(x, 164, 8, 8, "#16181c")
    rect(x + 26, 164, 8, 8, "#16181c")
    rect(x + 2, 166, 4, 4, "#8f9aa6")
    rect(x + 28, 166, 4, 4, "#8f9aa6")
    rect(x + 6, 156, 22, 8, body)
    rect(x + (flip ? 4 : 18), 152, 10, 4, "#16181c")
    rect(x + (flip ? 24 : 4), 148, 6, 8, body)
    rect(x + (flip ? 24 : 2), 146, 8, 2, "#3a3f47")
    rect(x + (flip ? 10 : 12), 160, 10, 4, "#3a3f47")
  }
  bike(8, "#96503c", false)
  bike(52, "#3a6f8f", true)
  // xe đẩy đồ ăn vặt (phải)
  rect(206, 124, 56, 5, "#b0563f")
  for (let i = 0; i < 7; i++) rect(206 + i * 8, 129, 8, 5, i % 2 ? "#f4efe2" : "#b0563f")
  rect(232, 106, 3, 18, "#7a5c3e")
  rect(214, 134, 3, 36, "#5d4530")
  rect(252, 134, 3, 36, "#5d4530")
  rect(210, 146, 50, 4, "#96714e")
  rect(210, 150, 50, 12, "#7a5c3e")
  rect(214, 138, 16, 8, "#e4d9a4")
  rect(234, 138, 18, 8, "#96503c")
  rect(240, 130, 10, 8, "#8f9aa6")
  rect(208, 162, 8, 10, "#16181c")
  rect(256, 162, 8, 10, "#16181c")
  group("scn-steam", () => {
    rect(243, 124, 3, 4, "#f4efe2")
    rect(246, 119, 3, 4, "#f4efe2")
    rect(242, 114, 3, 4, "#f4efe2")
  })
  return svg()
}

/* ------------------------------------------------------------------ công viên */
export function parkSVG({ STAGE_W, STAGE_H, GROUND_Y }) {
  /* Công viên thành phố: trời trong, hàng cây, mặt hồ có lan can, ghế đá, đèn
     đường, luống hoa, lối đi lát gạch. */
  const w = STAGE_W, h = STAGE_H
  const { rect, group, svg } = painter(w, h)
  rect(0, 0, w, 90, "#bfd2da")
  rect(0, 0, w, 36, "#a9c3d0")
  rect(120, 18, 40, 5, "#f4efe2")
  rect(130, 14, 20, 4, "#f4efe2")
  rect(250, 30, 36, 4, "#f4efe2")
  // nhà cao tầng xa mờ
  rect(150, 62, 18, 40, "#9fb4c4")
  rect(172, 54, 22, 48, "#8fa6b8")
  rect(198, 70, 16, 32, "#9fb4c4")
  // bờ cỏ xa + hồ
  rect(0, 90, w, 14, "#8aa060")
  rect(0, 104, w, 56, "#7d95a8")
  rect(0, 104, w, 3, "#9fb4c4")
  for (const [x, y, l] of [[24, 114, 16], [90, 124, 20], [180, 112, 18], [250, 128, 22], [140, 134, 14]])
    rect(x, y, l, 2, "#9fb4c4")
  rect(210, 124, 12, 4, "#6b8047")
  // cây hai bên (thân + tán), lá rơi nhẹ
  const tree = (x, top, cw, ch) => {
    rect(x - 3, top + ch - 6, 7, 160 - top - ch + 6, "#5d4530")
    crown(rect, x, top, cw, ch, "#4f6033", "#6b8047", "#8aa060")
  }
  tree(30, 14, 30, 46)
  tree(96, 36, 22, 34)
  tree(292, 10, 32, 50)
  tree(244, 40, 20, 30)
  group("scn-rain", () => {
    rect(54, 66, 3, 2, "#8aa060")
    rect(70, 92, 3, 2, "#8aa060")
    rect(262, 76, 3, 2, "#8aa060")
    rect(276, 104, 3, 2, "#8aa060")
    rect(120, 98, 3, 2, "#6b8047")
  })
  // lan can hồ
  rect(0, 140, w, 3, "#cfc9b6")
  rect(0, 144, w, 1, "#8f9aa6")
  for (let x = 4; x < w; x += 14) rect(x, 143, 3, 20, "#cfc9b6")
  rect(0, 160, w, 12, "#8aa060")
  rect(0, 160, w, 2, "#8f9aa6")
  // đèn đường + ghế đá
  const lamp = (x) => {
    rect(x, 62, 3, 104, "#3a3f47")
    rect(x - 4, 56, 11, 7, "#3a3f47")
    rect(x - 2, 58, 7, 4, "#e4d9a4")
    rect(x - 3, 164, 9, 4, "#3a3f47")
  }
  lamp(66)
  lamp(214)
  const bench = (x) => {
    rect(x, 146, 34, 3, "#96714e")
    rect(x, 150, 34, 3, "#7a5c3e")
    rect(x + 2, 153, 3, 16, "#5d4530")
    rect(x + 29, 153, 3, 16, "#5d4530")
    rect(x, 158, 34, 3, "#96714e")
  }
  bench(122)
  bench(268)
  bench(8)
  // luống hoa
  const bed = (x, wd) => {
    rect(x, 164, wd, 8, "#5d4530")
    rect(x, 162, wd, 3, "#6b8047")
    const cs = ["#d98b8b", "#e4d9a4", "#e9e5d9", "#c98ab0"]
    for (let i = 0, fx = x + 2; fx + 3 < x + wd; i++, fx += 6) {
      rect(fx, 158 + (i % 2) * 2, 3, 3, cs[i % cs.length])
      rect(fx + 1, 161, 1, 2, "#4f6033")
    }
  }
  bed(94, 22)
  bed(166, 26)
  bed(232, 24)
  // lối đi lát gạch
  rect(0, GROUND_Y, w, h - GROUND_Y, "#d6cdb4")
  for (let row = 0; row < 2; row++)
    for (let i = 0; i * 20 < w; i++)
      if ((i + row) % 2) rect(i * 20 + (row ? 10 : 0), GROUND_Y + row * 14, 20, 14, "#cbc1a4")
  rect(0, 186, w, 2, "#b8b19c")
  rect(0, GROUND_Y - 4, w, 4, "#8aa060")
  rect(0, GROUND_Y - 1, w, 1, "#b8b19c")
  return svg()
}

/* ------------------------------------------------------------------ quán trà sữa */
export function cafeSVG({ STAGE_W, STAGE_H, GROUND_Y }) {
  /* Quán trà sữa: tường hồng kem, bảng menu trên quầy có ly nhiều màu, đèn dây
     nhấp nháy, cửa kính nhìn ra phố (phải), bàn nhỏ + ghế đẩu, sàn gạch caro. */
  const w = STAGE_W, h = STAGE_H
  const { rect, circle, group, svg } = painter(w, h)
  rect(0, 0, w, GROUND_Y, "#ecd5c4")
  rect(0, 100, w, GROUND_Y - 100, "#dcb9a2")
  rect(0, 98, w, 3, "#96503c")
  rect(0, GROUND_Y - 4, w, 4, "#b89580")
  rect(0, GROUND_Y, w, h - GROUND_Y, "#d9cdb0")
  for (let row = 0; row < 2; row++)
    for (let i = 0; i * 20 < w; i++)
      if ((i + row) % 2) rect(i * 20, GROUND_Y + row * 14, 20, 14, "#c9b99a")
  for (let x = 20; x < w; x += 20) rect(x, GROUND_Y, 2, h - GROUND_Y, "#b8a883")
  rect(0, 186, w, 2, "#b8a883")
  // cửa kính nhìn ra phố (phải)
  rect(214, 28, 94, 138, "#16181c")
  rect(218, 32, 86, 130, "#bfd2da")
  rect(218, 32, 86, 40, "#a9c3d0")
  rect(226, 76, 30, 80, "#e4d9a4")
  rect(262, 60, 38, 96, "#c9d3b0")
  rect(230, 84, 8, 10, "#7d95a8")
  rect(244, 84, 8, 10, "#7d95a8")
  rect(268, 70, 10, 12, "#7d95a8")
  rect(284, 70, 10, 12, "#7d95a8")
  rect(218, 154, 86, 8, "#cfc9b6")
  rect(259, 32, 3, 130, "#16181c")
  rect(218, 94, 86, 3, "#16181c")
  rect(226, 38, 22, 4, "#f4efe2")
  // chữ trên kính (biển đảo)
  rect(228, 100, 28, 8, "#b0563f")
  rect(231, 103, 22, 2, "#f4efe2")
  // đèn dây nhấp nháy
  rect(0, 12, w, 1, "#16181c")
  rect(0, 13, 1, 3, "#16181c")
  group("scn-screen", () => {
    const cs = ["#e4d9a4", "#d98b8b", "#f4efe2", "#9fc4a0"]
    for (let x = 6, i = 0; x < w; x += 12, i++) {
      const y = 14 + (i % 2 ? 2 : 0)
      rect(x, y, 4, 4, cs[i % 4])
    }
  })
  // bảng menu
  rect(26, 22, 108, 56, "#5d4530")
  rect(30, 26, 100, 48, "#2f4a3a")
  rect(52, 30, 56, 4, "#e4d9a4")
  for (const [dy, dw] of [[40, 40], [47, 32], [54, 44], [61, 36]]) {
    rect(36, dy, dw, 3, "#e9e5d9")
    rect(108, dy, 16, 3, "#e4d9a4")
  }
  rect(36, 67, 8, 4, "#d98b8b")
  rect(116, 66, 8, 5, "#9fc4a0")
  // quầy
  rect(14, 100, 146, 5, "#e9e5d9")
  rect(14, 105, 146, 3, "#b8b19c")
  rect(14, 108, 146, 64, "#96503c")
  for (const x of [20, 62, 104]) {
    rect(x, 114, 36, 50, "#7a3e30")
    rect(x + 3, 117, 30, 44, "#b0563f")
  }
  rect(14, 164, 146, 8, "#5d4530")
  // ly trà sữa trên quầy + máy
  const cup = (x, c, top) => {
    rect(x, 86, 9, 12, "#f4efe2")
    rect(x + 1, 90, 7, 8, c)
    rect(x, 84, 9, 2, top)
    rect(x + 4, 78, 1, 7, "#16181c")
  }
  cup(24, "#c9a272", "#e9e5d9")
  cup(38, "#d98b8b", "#e9e5d9")
  cup(52, "#9fc4a0", "#e9e5d9")
  cup(66, "#c9a272", "#e9e5d9")
  cup(80, "#e4d9a4", "#e9e5d9")
  rect(104, 82, 40, 18, "#8f9aa6")
  rect(104, 82, 40, 4, "#cfc9b6")
  rect(108, 90, 12, 8, "#16181c")
  rect(124, 88, 16, 12, "#b0563f")
  group("scn-steam", () => {
    rect(112, 76, 3, 4, "#f4efe2")
    rect(116, 71, 3, 4, "#f4efe2")
  })
  // bàn nhỏ + ghế đẩu (thấp)
  const table = (x) => {
    rect(x, 152, 30, 4, "#f4efe2")
    rect(x + 2, 156, 26, 2, "#b8b19c")
    rect(x + 13, 158, 4, 14, "#5d4530")
    rect(x + 8, 170, 14, 2, "#5d4530")
    rect(x + 4, 146, 5, 6, "#f4efe2")
    rect(x + 5, 148, 3, 4, "#d98b8b")
    rect(x + 18, 146, 5, 6, "#f4efe2")
    rect(x + 19, 148, 3, 4, "#c9a272")
  }
  table(170)
  const stool = (x) => {
    rect(x, 158, 12, 4, "#d98b8b")
    rect(x + 1, 162, 3, 10, "#7a3e30")
    rect(x + 8, 162, 3, 10, "#7a3e30")
  }
  stool(164)
  stool(200)
  return svg()
}
