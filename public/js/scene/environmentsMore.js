/* environmentsMore.js — bốn bối cảnh pixel bổ sung (căng-tin, hành lang, phòng
   ngủ buổi tối, thư viện) cho cảnh tình huống EQ. Cùng chữ ký và cùng bảng màu
   với environments.js: mỗi hàm trả về chuỗi <svg class="scn-env__svg"> khung
   STAGE_W × STAGE_H, mặt sàn ở GROUND_Y, chỉ dùng rect (vài circle), toạ độ
   nguyên. Chuyển động phụ chỉ qua class scn-* trên nhóm <g>. Hàm thuần, không DOM. */

/* Bộ vẽ nhỏ dùng chung: gom thẻ vào mảng r rồi bọc thành <svg>. */
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
  // vẽ bitmap chữ '#' theo hàng, gộp các điểm liền nhau thành một rect
  const pix = (x, y, rows, fill, s = 1) => {
    rows.forEach((row, j) => {
      let i = 0
      while (i < row.length) {
        if (row[i] !== "#") { i++; continue }
        let k = i
        while (k < row.length && row[k] === "#") k++
        rect(x + i * s, y + j * s, (k - i) * s, s, fill)
        i = k
      }
    })
  }
  const svg = () =>
    `<svg class="scn-env__svg" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" aria-hidden="true">${r.join("")}</svg>`
  return { rect, circle, group, pix, svg }
}

/* Bộ sinh số giả ngẫu nhiên có hạt giống: cùng đầu vào luôn ra cùng một bức tranh. */
function seeded(seed) {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
}

/* Cửa sổ ban ngày: khung đen, kính nắng, thanh ngang/dọc, bệ cửa. */
function dayWindow(rect, x, y, wd, ht, { top = "#e4d9a4", bottom = "#d6c78c", cross = true } = {}) {
  rect(x, y, wd, ht, "#16181c")
  rect(x + 3, y + 3, wd - 6, ht - 6, bottom)
  rect(x + 3, y + 3, wd - 6, Math.floor((ht - 6) / 2), top)
  if (cross) {
    rect(x + Math.floor(wd / 2) - 1, y + 3, 3, ht - 6, "#16181c")
    rect(x + 3, y + Math.floor(ht / 2) - 1, wd - 6, 3, "#16181c")
  }
  rect(x - 2, y + ht, wd + 4, 3, "#b8b19c")
}

/* ------------------------------------------------------------------ căng-tin */
export function canteenSVG({ STAGE_W, STAGE_H, GROUND_Y }) {
  /* Căng-tin: tường sơn hai tông, hai cửa sổ nắng, bảng thực đơn chép tay,
     quầy bán cơm có nồi bốc khói + chồng khay + khay thức ăn, hai bàn dài
     với ghế băng nhìn nghiêng, sàn gạch caro. */
  const w = STAGE_W, h = STAGE_H
  const { rect, group, svg } = painter(w, h)
  // tường + chân tường sơn xanh
  rect(0, 0, w, GROUND_Y, "#e9e5d9")
  rect(0, 94, w, GROUND_Y - 94, "#cfc9b6")
  rect(0, 94, w, 4, "#4f6033")
  rect(0, 98, w, 2, "#b8b19c")
  // sàn gạch caro
  rect(0, GROUND_Y, w, h - GROUND_Y, "#cfc9b6")
  for (let row = 0; row < 2; row++)
    for (let i = 0; i * 20 < w; i++)
      if ((i + row) % 2) rect(i * 20, GROUND_Y + row * 14, 20, 14, "#c4bda8")
  for (let x = 20; x < w; x += 20) rect(x, GROUND_Y, 2, h - GROUND_Y, "#b8b19c")
  rect(0, 186, w, 2, "#b8b19c")
  rect(0, GROUND_Y - 4, w, 4, "#b8b19c")
  // vệt nắng trên sàn
  rect(24, 175, 34, 4, "#ddd2a0")
  rect(18, 179, 34, 4, "#ddd2a0")
  rect(70, 175, 28, 4, "#ddd2a0")
  rect(64, 179, 28, 4, "#ddd2a0")
  // hai cửa sổ nắng (trái) + tán cây ngoài sân
  dayWindow(rect, 12, 26, 40, 56)
  dayWindow(rect, 60, 26, 40, 56)
  rect(15, 62, 14, 17, "#6b8047")
  rect(63, 60, 16, 19, "#6b8047")
  // đèn treo
  rect(40, 0, 2, 12, "#16181c")
  rect(34, 12, 14, 5, "#4f6033")
  rect(150, 0, 2, 8, "#16181c")
  rect(144, 8, 14, 5, "#4f6033")
  // bảng thực đơn (giữa)
  rect(118, 20, 88, 48, "#5d4530")
  rect(122, 24, 80, 40, "#2f4a3a")
  rect(146, 28, 32, 3, "#e4d9a4")
  rect(140, 28, 4, 3, "#e4d9a4")
  rect(180, 28, 4, 3, "#e4d9a4")
  // bốn món: tên món (trắng) + giá (vàng phấn)
  for (const [dy, dw] of [[36, 40], [43, 30], [50, 46], [57, 34]]) {
    rect(128, dy, dw, 3, "#e9e5d9")
    rect(176, dy, 20, 3, "#e4d9a4")
  }
  // quầy bán cơm (phải): cửa sổ bếp có mái hiên sọc
  rect(216, 18, 104, 3, "#5d4530")
  for (let i = 0; i < 13; i++) rect(216 + i * 8, 21, 8, 9, i % 2 ? "#f4efe2" : "#96503c")
  for (let i = 0; i < 13; i++) rect(216 + i * 8 + 2, 30, 4, 3, i % 2 ? "#f4efe2" : "#96503c")
  rect(216, 33, 104, 2, "#5d4530")
  rect(216, 34, 104, 66, "#5d4530")
  rect(220, 38, 96, 58, "#3a3f47")
  // trong bếp: giá treo muỗng và kệ lọ
  rect(228, 44, 40, 2, "#8f9aa6")
  rect(232, 46, 2, 12, "#8f9aa6")
  rect(230, 58, 6, 4, "#8f9aa6")
  rect(242, 46, 2, 10, "#8f9aa6")
  rect(240, 56, 6, 3, "#8f9aa6")
  rect(254, 46, 2, 13, "#8f9aa6")
  rect(252, 59, 6, 4, "#8f9aa6")
  rect(280, 62, 28, 3, "#2f343d")
  rect(282, 52, 8, 10, "#96503c")
  rect(293, 54, 7, 8, "#c9b68f")
  rect(302, 50, 6, 12, "#4f6033")
  // quầy: mặt inox + thân gỗ
  rect(212, 100, 108, 6, "#8f9aa6")
  rect(212, 100, 108, 2, "#cfc9b6")
  rect(212, 106, 108, 62, "#5d4530")
  for (const x of [218, 252, 286]) {
    rect(x, 112, 30, 44, "#7a5c3e")
    rect(x + 3, 115, 24, 38, "#96714e")
  }
  rect(212, 158, 108, 4, "#8f9aa6")
  rect(212, 162, 108, 6, "#3a3f47")
  // chồng khay
  rect(214, 97, 20, 3, "#31556b")
  rect(214, 94, 20, 3, "#3a6f8f")
  rect(214, 91, 20, 3, "#31556b")
  rect(214, 88, 20, 3, "#3a6f8f")
  // nồi canh + nắp
  rect(244, 88, 30, 12, "#8f9aa6")
  rect(266, 88, 8, 12, "#5f7b8f")
  rect(242, 86, 34, 3, "#cfc9b6")
  rect(246, 82, 26, 4, "#5f7b8f")
  rect(257, 79, 4, 3, "#16181c")
  rect(238, 90, 5, 4, "#16181c")
  rect(275, 90, 5, 4, "#16181c")
  // hơi nước bốc từ nồi
  group("scn-steam", () => {
    rect(254, 74, 3, 4, "#e9e5d9")
    rect(259, 70, 3, 4, "#e9e5d9")
    rect(255, 65, 3, 4, "#e9e5d9")
    rect(262, 61, 3, 4, "#e9e5d9")
  })
  // khay thức ăn (cơm / rau / thịt kho)
  const pans = ["#f4efe2", "#6b8047", "#96503c"]
  pans.forEach((c, i) => {
    rect(285 + i * 11, 96, 9, 4, "#8f9aa6")
    rect(285 + i * 11, 93, 9, 3, c)
  })
  // hai bàn dài + ghế băng nhìn nghiêng (sau hàng đứng của nhân vật)
  const table = (x0, len) => {
    rect(x0, 126, len, 4, "#96714e")
    rect(x0, 130, len, 3, "#7a5c3e")
    rect(x0 + 6, 133, 4, 33, "#5d4530")
    rect(x0 + len - 10, 133, 4, 33, "#5d4530")
    rect(x0 + 10, 133, len - 20, 3, "#5d4530")
    rect(x0 - 2, 144, len + 4, 4, "#96714e")
    rect(x0 - 2, 148, len + 4, 2, "#7a5c3e")
    rect(x0 + 4, 150, 4, 16, "#5d4530")
    rect(x0 + len - 8, 150, 4, 16, "#5d4530")
  }
  table(10, 94)
  table(114, 94)
  // khay cơm trên bàn: khay xanh + bát + ly
  const tray = (x, bowl, soup) => {
    rect(x, 123, 16, 3, "#31556b")
    rect(x + 2, 119, 7, 4, bowl)
    rect(x + 3, 119, 5, 1, soup)
    rect(x + 11, 120, 3, 3, "#e9e5d9")
  }
  tray(22, "#f4efe2", "#96503c")
  tray(54, "#e9e5d9", "#6b8047")
  tray(80, "#f4efe2", "#d6c78c")
  tray(126, "#e9e5d9", "#96503c")
  tray(166, "#f4efe2", "#6b8047")
  tray(186, "#e9e5d9", "#d6c78c")
  return svg()
}

/* ------------------------------------------------------------------ hành lang */
export function corridorSVG({ STAGE_W, STAGE_H, GROUND_Y }) {
  /* Hành lang: hai cửa lớp 11A1 / 11A2 có biển số bằng khối pixel, bảng tin
     có giấy ghim, bình nước uống, cửa sổ nắng ở bên phải rọi xuống sàn gạch dài. */
  const w = STAGE_W, h = STAGE_H
  const { rect, pix, svg } = painter(w, h)
  // trần + tường + chân tường
  rect(0, 0, w, GROUND_Y, "#e9e5d9")
  rect(0, 0, w, 8, "#cfc9b6")
  rect(0, 8, w, 2, "#b8b19c")
  rect(60, 2, 56, 4, "#f4efe2")
  rect(190, 2, 56, 4, "#f4efe2")
  rect(0, 108, w, GROUND_Y - 108, "#cfc9b6")
  rect(0, 106, w, 3, "#b8b19c")
  // sàn gạch dài
  rect(0, GROUND_Y, w, h - GROUND_Y, "#cfc9b6")
  for (let row = 0; row < 2; row++)
    for (let i = 0; i * 28 < w; i++)
      if ((i + row) % 2) rect(i * 28, GROUND_Y + row * 14, Math.min(28, w - i * 28), 14, "#d9d3c1")
  for (let x = 28; x < w; x += 28) rect(x, GROUND_Y, 2, h - GROUND_Y, "#b8b19c")
  rect(0, 186, w, 2, "#b8b19c")
  rect(0, GROUND_Y - 4, w, 4, "#b8b19c")
  // hai cửa sổ ban ngày (phải) với trời xanh, tán cây
  const sky = (x) => {
    dayWindow(rect, x, 34, 28, 70, { top: "#9fb4c4", bottom: "#cddbe0", cross: false })
    rect(x + 3, 62, 22, 3, "#16181c")
    rect(x + 5, 80, 18, 21, "#6b8047")
    rect(x + 9, 74, 10, 7, "#4f6033")
    rect(x + 17, 40, 6, 6, "#f4efe2")
  }
  sky(250)
  sky(284)
  // vệt nắng rọi xuống sàn
  rect(236, 174, 34, 4, "#ddd2a0")
  rect(228, 178, 34, 4, "#ddd2a0")
  rect(220, 182, 34, 4, "#ddd2a0")
  rect(272, 174, 30, 4, "#ddd2a0")
  rect(264, 178, 30, 4, "#ddd2a0")
  // cửa lớp + biển số lớp
  const doorSign = (x, label) => {
    rect(x + 6, 16, 36, 18, "#16181c")
    rect(x + 8, 18, 32, 14, "#31556b")
    const glyph = {
      "1": [".#.", "##.", ".#.", ".#.", "###"],
      "2": ["##.", "..#", ".#.", "#..", "###"],
      A: [".#.", "#.#", "###", "#.#", "#.#"],
    }
    let gx = x + 9
    for (const ch of label) {
      pix(gx, 20, glyph[ch], "#f4efe2", 2)
      gx += 8
    }
  }
  const door = (x, label) => {
    rect(x, 38, 48, 130, "#5d4530")
    rect(x + 3, 41, 42, 127, "#7a5c3e")
    rect(x + 8, 48, 32, 28, "#16181c")
    rect(x + 10, 50, 28, 24, "#7d95a8")
    rect(x + 10, 50, 28, 11, "#9fb4c4")
    rect(x + 26, 50, 4, 24, "#7d95a8")
    rect(x + 8, 84, 32, 30, "#5d4530")
    rect(x + 10, 86, 28, 26, "#96714e")
    rect(x + 8, 122, 32, 28, "#5d4530")
    rect(x + 10, 124, 28, 24, "#96714e")
    rect(x + 3, 156, 42, 8, "#5d4530")
    rect(x + 38, 100, 4, 10, "#8f9aa6")
    rect(x + 36, 104, 6, 3, "#cfc9b6")
    doorSign(x, label)
  }
  door(12, "11A1")
  door(84, "11A2")
  // bình cứu hoả giữa hai cửa và bảng tin
  rect(138, 130, 9, 24, "#b0563f")
  rect(138, 130, 9, 4, "#7a3e30")
  rect(140, 126, 5, 4, "#16181c")
  rect(138, 123, 9, 3, "#16181c")
  rect(136, 138, 13, 3, "#3a3f47")
  // bảng tin: khung gỗ, nền bần, giấy ghim
  rect(156, 40, 64, 52, "#7a5c3e")
  rect(160, 44, 56, 44, "#c9b68f")
  rect(164, 47, 30, 6, "#4f6033")
  rect(166, 49, 16, 2, "#e9e5d9")
  rect(166, 57, 14, 18, "#f4efe2")
  rect(169, 61, 8, 2, "#8f9aa6")
  rect(169, 65, 8, 2, "#8f9aa6")
  rect(169, 69, 6, 2, "#8f9aa6")
  rect(184, 56, 12, 14, "#e9e5d9")
  rect(187, 60, 6, 2, "#8f9aa6")
  rect(187, 64, 6, 2, "#8f9aa6")
  rect(200, 48, 12, 12, "#e4d9a4")
  rect(202, 52, 8, 2, "#8f9aa6")
  rect(204, 74, 10, 10, "#f4efe2")
  rect(200, 62, 12, 10, "#c9a8a0")
  rect(184, 74, 16, 11, "#f4efe2")
  rect(187, 77, 10, 2, "#8f9aa6")
  rect(187, 81, 7, 2, "#8f9aa6")
  rect(171, 55, 3, 3, "#b0563f")
  rect(188, 54, 3, 3, "#31556b")
  rect(204, 46, 3, 3, "#b0563f")
  rect(204, 72, 3, 3, "#16181c")
  rect(190, 72, 3, 3, "#31556b")
  rect(205, 60, 3, 3, "#31556b")
  // bình nước uống
  rect(230, 86, 14, 3, "#31556b")
  rect(228, 89, 18, 22, "#9fb4c4")
  rect(228, 89, 5, 22, "#cddbe0")
  rect(226, 111, 22, 16, "#e9e5d9")
  rect(228, 112, 18, 3, "#f4efe2")
  rect(230, 119, 4, 6, "#31556b")
  rect(240, 119, 4, 6, "#b0563f")
  rect(230, 127, 14, 3, "#16181c")
  rect(228, 130, 18, 38, "#f4efe2")
  rect(242, 130, 4, 38, "#b8b19c")
  rect(231, 136, 10, 3, "#cfc9b6")
  return svg()
}

/* ------------------------------------------------------------------ phòng ngủ */
export function bedroomSVG({ STAGE_W, STAGE_H, GROUND_Y }) {
  /* Phòng ngủ buổi tối: cửa sổ trời nhá nhem có trăng, bàn học với đèn bàn ấm,
     sách + điện thoại sáng màn hình, áp phích, kệ nhỏ, giường chăn xanh, đồng hồ. */
  const w = STAGE_W, h = STAGE_H
  const { rect, circle, group, pix, svg } = painter(w, h)
  // quầng sáng giả elip từ các dải ngang (độ trong suốt làm ánh sáng ấm)
  const glow = (cx, cy, rx, ry, fill, op) => {
    for (let dy = -ry; dy < ry; dy += 4) {
      const t = (dy + 2) / ry
      const hw = Math.round((rx * Math.sqrt(Math.max(0, 1 - t * t))) / 2) * 2
      if (hw > 0) {
        const x0 = Math.max(0, cx - hw)
        rect(x0, cy + dy, Math.min(w, cx + hw) - x0, 4, fill, `fill-opacity="${op}"`)
      }
    }
  }
  // tường tối dần lên trần + sàn gỗ
  rect(0, 0, w, GROUND_Y, "#cfc9b6")
  rect(0, 0, w, 14, "#b8b19c")
  rect(0, 14, w, 12, "#c4bda8")
  rect(0, GROUND_Y, w, h - GROUND_Y, "#c9b68f")
  for (const y of [180, 188, 195]) rect(0, y, w, 2, "#b8a47c")
  for (const [x, y] of [[40, 172], [112, 180], [180, 188], [250, 180], [70, 188], [150, 172], [284, 188]])
    rect(x, y, 2, 8, "#b8a47c")
  rect(0, GROUND_Y - 4, w, 4, "#96714e")
  // chiều muộn: phủ nhẹ sắc xanh lên cả phòng, rồi ánh đèn bàn lan ra tường
  rect(0, 0, w, GROUND_Y, "#31556b", `fill-opacity="0.07"`)
  glow(80, 112, 84, 60, "#f2d89a", "0.2")
  glow(80, 112, 54, 40, "#f2d89a", "0.22")
  // cửa sổ trời nhá nhem + trăng lưỡi liềm + sao
  rect(14, 22, 64, 56, "#16181c")
  rect(18, 26, 56, 48, "#2f4a5e")
  rect(18, 42, 56, 10, "#31556b")
  rect(18, 52, 56, 8, "#5f7b8f")
  rect(18, 60, 56, 6, "#b0725a")
  rect(18, 66, 56, 8, "#c98f6a")
  circle(28, 35, 6, "#f4efe2")
  circle(31, 33, 5, "#2f4a5e")
  rect(52, 31, 2, 2, "#f4efe2")
  rect(64, 29, 2, 2, "#f4efe2")
  rect(68, 38, 2, 2, "#cfc9b6")
  rect(56, 40, 2, 2, "#cfc9b6")
  // mái nhà hàng xóm, ô cửa sáng đèn, cột điện
  rect(18, 64, 14, 10, "#2f343d")
  rect(20, 62, 10, 2, "#2f343d")
  rect(32, 60, 16, 14, "#3a3f47")
  rect(34, 58, 12, 2, "#3a3f47")
  rect(36, 64, 3, 3, "#e4d9a4")
  rect(42, 66, 3, 3, "#e4d9a4")
  rect(48, 66, 26, 8, "#2f343d")
  rect(58, 52, 2, 22, "#16181c")
  rect(52, 56, 14, 2, "#16181c")
  rect(60, 68, 3, 3, "#e4d9a4")
  // thanh cửa sổ + rèm
  rect(44, 22, 3, 56, "#16181c")
  rect(14, 75, 64, 3, "#16181c")
  rect(10, 18, 72, 3, "#5d4530")
  rect(12, 21, 11, 58, "#96503c")
  rect(69, 21, 11, 58, "#96503c")
  for (const x of [15, 19, 72, 76]) rect(x, 21, 2, 58, "#7a3e30")
  // đồng hồ treo tường (cùng toạ độ với lớp scn-clock)
  group("scn-clock", () => {
    circle(292, 34, 12, "#f4efe2", `stroke="#16181c" stroke-width="2"`)
    rect(291, 26, 2, 9, "#16181c")
    rect(292, 33, 7, 2, "#16181c")
  })
  // áp phích bóng đá
  rect(122, 34, 32, 46, "#16181c")
  rect(124, 36, 28, 42, "#4f6033")
  rect(127, 39, 22, 36, "none", `stroke="#e9e5d9" stroke-width="1"`)
  rect(127, 56, 22, 1, "#e9e5d9")
  circle(138, 57, 5, "none", `stroke="#e9e5d9" stroke-width="1"`)
  rect(133, 39, 10, 4, "none", `stroke="#e9e5d9" stroke-width="1"`)
  rect(133, 71, 10, 4, "none", `stroke="#e9e5d9" stroke-width="1"`)
  // kệ nhỏ trên tường: sách, chậu cây, cúp
  rect(166, 80, 46, 4, "#7a5c3e")
  rect(170, 84, 3, 6, "#5d4530")
  rect(204, 84, 3, 6, "#5d4530")
  rect(168, 66, 4, 14, "#31556b")
  rect(172, 68, 4, 12, "#96503c")
  rect(176, 64, 4, 16, "#4f6033")
  rect(180, 69, 3, 11, "#d6c78c")
  rect(188, 70, 8, 10, "#96503c")
  rect(186, 62, 12, 8, "#6b8047")
  rect(190, 58, 4, 6, "#4f6033")
  rect(200, 72, 8, 3, "#d6c78c")
  rect(203, 75, 2, 5, "#d6c78c")
  // cờ đỏ sao vàng treo trên giường
  rect(232, 48, 30, 20, "#b0563f")
  pix(243, 52, ["...#...", "..###..", "#######", ".#####.", "..###..", "..#.#..", ".#...#."], "#e4d9a4")
  rect(230, 46, 34, 2, "#5d4530")
  // bàn học: mặt bàn, chân trái, tủ ngăn kéo phải
  rect(8, 120, 106, 6, "#7a5c3e")
  rect(8, 120, 106, 2, "#96714e")
  rect(12, 126, 5, 40, "#5d4530")
  rect(80, 126, 32, 40, "#5d4530")
  rect(83, 129, 26, 12, "#7a5c3e")
  rect(83, 144, 26, 12, "#7a5c3e")
  rect(94, 133, 5, 3, "#e4d9a4")
  rect(94, 148, 5, 3, "#e4d9a4")
  // ghế học nhìn nghiêng
  rect(72, 130, 5, 20, "#3a3f47")
  rect(46, 146, 31, 5, "#31556b")
  rect(48, 151, 4, 15, "#2f343d")
  rect(70, 151, 4, 15, "#2f343d")
  // ba lô cạnh bàn
  rect(118, 148, 20, 20, "#31556b")
  rect(120, 142, 16, 7, "#31556b")
  rect(122, 154, 12, 8, "#3a6f8f")
  rect(118, 148, 20, 2, "#5f7b8f")
  // chùm sáng đèn bàn hắt xuống mặt bàn (vẽ trước đồ vật để chúng nằm trên)
  for (let i = 0; i < 6; i++) rect(72 - i * 2, 109 + i * 2, 22 + i * 4, 2, "#f6e7a6", `fill-opacity="0.42"`)
  // chồng sách + vở trên bàn
  rect(18, 114, 26, 6, "#31556b")
  rect(20, 108, 22, 6, "#96503c")
  rect(22, 102, 18, 6, "#4f6033")
  rect(22, 100, 18, 2, "#f4efe2")
  rect(50, 117, 18, 3, "#f4efe2")
  rect(50, 119, 18, 1, "#cfc9b6")
  // hộp bút
  rect(48, 110, 8, 10, "#4f6033")
  rect(50, 105, 2, 6, "#e4d9a4")
  rect(53, 103, 2, 8, "#96503c")
  // điện thoại dựng, màn hình sáng nhẹ
  rect(60, 106, 8, 14, "#16181c")
  group("scn-screen", () => {
    rect(61, 107, 6, 11, "#3a6f8f")
    rect(62, 109, 4, 2, "#e9e5d9")
    rect(62, 113, 3, 2, "#9fb4c4")
  })
  // đèn bàn ấm: chân, cần, chao, chùm sáng
  rect(94, 117, 16, 3, "#3a3f47")
  rect(100, 98, 3, 19, "#3a3f47")
  rect(82, 96, 20, 3, "#3a3f47")
  rect(76, 98, 14, 3, "#96503c")
  rect(73, 101, 20, 3, "#96503c")
  rect(70, 104, 26, 3, "#b0563f")
  rect(74, 107, 18, 2, "#f4efe2")
  // giường: thành đầu + thành chân + khung + nệm + chăn + gối
  rect(210, 152, 98, 8, "#5d4530")
  rect(212, 160, 6, 8, "#5d4530")
  rect(298, 160, 6, 8, "#5d4530")
  rect(214, 142, 90, 12, "#e9e5d9")
  rect(284, 132, 20, 12, "#e9e5d9")
  rect(214, 130, 70, 24, "#4f6033")
  rect(214, 130, 70, 3, "#6b8047")
  rect(214, 140, 70, 2, "#6b8047")
  rect(214, 146, 70, 2, "#6b8047")
  rect(214, 150, 70, 4, "#2f4a3a")
  rect(282, 122, 22, 14, "#f4efe2")
  rect(282, 134, 22, 2, "#cfc9b6")
  rect(302, 92, 12, 76, "#7a5c3e")
  rect(305, 96, 6, 26, "#96714e")
  rect(207, 136, 7, 32, "#7a5c3e")
  rect(207, 136, 7, 3, "#96714e")
  // thảm nhỏ trên sàn
  rect(70, 177, 132, 18, "#7a3e30")
  rect(72, 179, 128, 14, "#96503c")
  for (let x = 78; x < 196; x += 12) rect(x, 184, 6, 4, "#e4d9a4")
  return svg()
}

/* ------------------------------------------------------------------ thư viện */
export function librarySVG({ STAGE_W, STAGE_H, GROUND_Y }) {
  /* Thư viện: hai tủ sách cao với gáy sách nhiều màu ở hai bên, cửa sổ sáng dịu
     ở giữa, biển "giữ yên lặng" vẽ bằng khối pixel, bàn đọc có đèn xanh và sách,
     thảm xanh. */
  const w = STAGE_W, h = STAGE_H
  const { rect, pix, svg } = painter(w, h)
  const rnd = seeded(2024)
  // tường dịu + sàn thảm
  rect(0, 0, w, GROUND_Y, "#e9e5d9")
  rect(0, 0, w, 6, "#cfc9b6")
  rect(0, GROUND_Y, w, h - GROUND_Y, "#7d95a8")
  for (const y of [180, 188, 195]) rect(0, y, w, 2, "#5f7b8f")
  rect(0, GROUND_Y - 4, w, 4, "#5d4530")
  // cửa sổ sáng dịu ở giữa
  rect(128, 24, 60, 54, "#16181c")
  rect(131, 27, 54, 48, "#cddbe0")
  rect(131, 27, 54, 22, "#e4ecee")
  rect(156, 27, 3, 48, "#16181c")
  rect(131, 49, 54, 3, "#16181c")
  rect(138, 56, 14, 16, "#9fb4c4")
  rect(164, 36, 12, 8, "#f4efe2")
  rect(126, 78, 64, 4, "#b8b19c")
  // dải nắng dịu rọi xuống tường và sàn
  for (let i = 0; i < 12; i++) rect(136 - i * 3, 84 + i * 4, 44, 4, "#f1ecdf")
  rect(96, 176, 40, 4, "#9fb4c4")
  rect(104, 180, 40, 4, "#9fb4c4")
  // tờ nội quy ghim bên trái cửa sổ
  rect(104, 36, 16, 26, "#f4efe2")
  rect(107, 41, 10, 2, "#8f9aa6")
  rect(107, 46, 10, 2, "#8f9aa6")
  rect(107, 51, 7, 2, "#8f9aa6")
  rect(110, 34, 3, 3, "#b0563f")
  // biển "giữ yên lặng": loa gạch chéo đỏ + hai vạch chữ
  rect(194, 24, 22, 34, "#16181c")
  rect(196, 26, 18, 30, "#31556b")
  pix(197, 30, ["....#...", "...##.#.", "##.###.#", "##.###.#", "##.###.#", "...##.#.", "....#..."], "#f4efe2", 2)
  for (let i = 0; i < 7; i++) rect(198 + i * 2, 30 + i * 2, 3, 3, "#d9694f")
  rect(199, 48, 12, 2, "#f4efe2")
  rect(201, 52, 8, 2, "#f4efe2")
  // tủ sách cao: khung, lưng, ván ngăn, gáy sách nhiều màu
  const palette = ["#31556b", "#4f6033", "#96503c", "#b0563f", "#d6c78c", "#7d95a8", "#f4efe2", "#2f4a3a", "#96714e", "#5f7b8f", "#6b8047", "#c9b68f"]
  const bookcase = (x, wd) => {
    rect(x, 12, wd, 160, "#7a5c3e")
    rect(x + 4, 16, wd - 8, 150, "#5d4530")
    for (let k = 0; k < 5; k++) {
      const base = 16 + 30 * k + 26
      rect(x + 4, base, wd - 8, 4, "#7a5c3e")
      let cx = x + 6
      const end = x + wd - 6 - (rnd() < 0.3 ? Math.floor(rnd() * 24) : 0)
      while (cx + 3 <= end) {
        const bw = 3 + Math.floor(rnd() * 4)
        if (cx + bw > end) break
        const bh = 14 + Math.floor(rnd() * 10)
        const colour = palette[Math.floor(rnd() * palette.length)]
        rect(cx, base - bh, bw, bh, colour)
        if (bw >= 4 && rnd() < 0.4) rect(cx, base - bh + 4, bw, 2, "#e9e5d9")
        if (rnd() < 0.2) rect(cx, base - bh, bw, 2, "#16181c")
        cx += bw
        if (rnd() < 0.12) cx += 1 + Math.floor(rnd() * 3)
      }
    }
    rect(x, 12, wd, 4, "#7a5c3e")
    rect(x, 168, wd, 4, "#5d4530")
  }
  bookcase(4, 96)
  bookcase(220, 96)
  // bàn đọc: mặt, chân, thanh ngang
  rect(106, 126, 108, 4, "#96714e")
  rect(106, 130, 108, 3, "#7a5c3e")
  rect(112, 133, 5, 33, "#5d4530")
  rect(203, 133, 5, 33, "#5d4530")
  rect(117, 133, 86, 3, "#5d4530")
  // hai ghế đẩu cất dưới bàn
  rect(124, 144, 22, 4, "#31556b")
  rect(128, 148, 3, 18, "#2f343d")
  rect(140, 148, 3, 18, "#2f343d")
  rect(172, 144, 22, 4, "#31556b")
  rect(176, 148, 3, 18, "#2f343d")
  rect(188, 148, 3, 18, "#2f343d")
  // sách trên bàn: chồng sách, quyển mở, hộp bút
  rect(116, 119, 20, 3, "#31556b")
  rect(118, 122, 18, 4, "#96503c")
  rect(116, 122, 2, 4, "#31556b")
  rect(140, 123, 11, 3, "#f4efe2")
  rect(152, 123, 11, 3, "#f4efe2")
  rect(150, 122, 3, 4, "#7a5c3e")
  rect(142, 124, 7, 1, "#8f9aa6")
  rect(155, 124, 6, 1, "#8f9aa6")
  rect(168, 117, 8, 9, "#4f6033")
  rect(170, 112, 2, 6, "#e4d9a4")
  rect(173, 111, 2, 7, "#b0563f")
  // đèn bàn xanh + ánh sáng ấm
  rect(186, 122, 14, 4, "#2f343d")
  rect(192, 112, 3, 10, "#2f343d")
  rect(182, 104, 24, 4, "#2f4a3a")
  rect(186, 108, 16, 3, "#4f6033")
  rect(188, 111, 12, 2, "#f4efe2")
  for (let i = 0; i < 5; i++) rect(190 - 2 - i * 3, 113 + i * 2, 12 + i * 6, 2, "#f0dfa0", `fill-opacity="0.28"`)
  // đèn thả trên trần
  rect(159, 0, 2, 12, "#16181c")
  rect(150, 12, 20, 5, "#2f4a3a")
  rect(152, 17, 16, 2, "#f4efe2")
  return svg()
}
