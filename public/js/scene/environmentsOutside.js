/* environmentsOutside.js — bốn bối cảnh pixel ngoài trường (nhà buổi tối, phố
   trước cổng trường, công viên, quán trà sữa), vẽ lại theo phong cách chi tiết
   của nhân vật mới (hifi/characterKit.js).

   Cùng chữ ký và định dạng trả về với environmentsMore.js: mỗi hàm trả về chuỗi
   <svg class="scn-env__svg"> khung STAGE_W × STAGE_H, mặt sàn ở GROUND_Y (172).
   Hàm thuần, không DOM, cùng đầu vào luôn ra cùng một bức tranh (hạt giống cố định).

   Quy ước vẽ (khớp nhân vật 2 px / ô):
   - mọi toạ độ và kích thước nằm trên lưới 2 px CHẴN (painter tự làm tròn về chẵn);
   - MỘT nguồn sáng từ trên-trái: mặt trái/trên sáng, mặt phải/dưới tối, bóng đổ rơi
     xuống-phải; mỗi chất liệu có 3–4 sắc (sáng, nền, tối, sâu) và bóng nền hơi ngả tím lạnh;
   - các chấm/vệt là rect 2×2 (gộp thành <path> cho gọn), có thêm lớp mờ (fill-opacity)
     cho vùng sáng/bóng; ánh sáng chuyển sắc bằng nét điểm ảnh xen kẽ (dither);
   - chuyển động phụ chỉ qua class scn-* trên nhóm <g> (scn-steam, scn-screen, scn-rain);
   - vùng giữa (x 20–300, y 70–186) giữ êm, độ tương phản thấp hơn nhân vật. */

const ev = (n) => Math.floor(n / 2) * 2 // làm tròn xuống số chẵn
const evc = (n) => Math.ceil(n / 2) * 2 // làm tròn lên số chẵn
const lerp = (a, b, t) => a + (b - a) * t

/* Bộ sinh số giả ngẫu nhiên có hạt giống. */
function seeded(seed) {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
}

/* Bộ vẽ nhỏ: gom thẻ vào mảng r rồi bọc thành <svg>. */
function painter(w, h) {
  const r = []
  const al = (o) => (o == null || o >= 1 ? "" : ` fill-opacity="${Math.round(o * 1000) / 1000}"`)
  const rect = (x, y, wd, ht, fill, o) => {
    if (wd <= 0 || ht <= 0) return
    r.push(`<rect x="${ev(x)}" y="${ev(y)}" width="${evc(wd)}" height="${evc(ht)}" fill="${fill}"${al(o)}/>`)
  }
  /* nhiều ô cùng màu → một <path>; mỗi phần tử [x, y, w = 2, h = 2] */
  const cells = (fill, list, o) => {
    if (!list.length) return
    const d = list.map(([x, y, a = 2, b = 2]) => `M${ev(x)} ${ev(y)}h${evc(a)}v${evc(b)}h${-evc(a)}z`).join("")
    r.push(`<path d="${d}" fill="${fill}"${al(o)}/>`)
  }
  const group = (cls, draw) => {
    r.push(`<g class="${cls}">`)
    draw()
    r.push("</g>")
  }
  /* elip bằng các dải cao 2 px */
  const ellipse = (cx, cy, rx, ry, fill, o) => {
    const rows = []
    for (let j = 0; j < ry * 2; j += 2) {
      const t = (j + 1 - ry) / ry
      const half = rx * Math.sqrt(Math.max(0, 1 - t * t))
      const l = ev(Math.round(cx - half))
      const rr = evc(Math.round(cx + half))
      if (rr > l) rows.push([l, cy - ry + j, rr - l, 2])
    }
    cells(fill, rows, o)
  }
  /* vầng sáng: các elip lồng nhau, mỗi lớp cộng thêm độ mờ */
  const glow = (cx, cy, rx, ry, fill, steps = 3, o = 0.07) => {
    for (let i = 0; i < steps; i++) {
      const k = 1 - (i / steps) * 0.72
      ellipse(cx, cy, rx * k, ry * k, fill, o)
    }
  }
  /* hình thang dải 2 px: chùm sáng, bóng nghiêng */
  const trap = (x0, y0, w0, x1, y1, w1, fill, o) => {
    const rows = []
    for (let y = y0; y < y1; y += 2) {
      const t = (y - y0) / (y1 - y0)
      const l = ev(Math.round(lerp(x0, x1, t)))
      rows.push([l, y, evc(Math.round(lerp(w0, w1, t))), 2])
    }
    cells(fill, rows, o)
  }
  /* bàn cờ 2×2 (điểm ảnh xen kẽ) */
  const dither = (x, y, wd, ht, fill, phase = 0, o) => {
    const list = []
    for (let j = 0; j < ht; j += 2)
      for (let i = 0; i < wd; i += 2) if (((i + j) / 2 + phase) % 2 === 0) list.push([x + i, y + j])
    cells(fill, list, o)
  }
  /* rắc ô 2×2 ngẫu nhiên: vân vữa, hạt cỏ, thớ gỗ */
  const speck = (x, y, wd, ht, fill, n, seed, o, sz = 2, szw = sz) => {
    const rnd = seeded(seed)
    const list = []
    for (let i = 0; i < n; i++) list.push([x + ev(rnd() * (wd - szw)), y + ev(rnd() * (ht - sz)), szw, sz])
    cells(fill, list, o)
  }
  /* các dải màu chồng dọc, mép giữa hai dải chuyển bằng ba hàng điểm ảnh 25/50/75 % */
  const bands = (x, y, wd, list, soft = true) => {
    let cy = y
    list.forEach(([fill, hh], i) => {
      rect(x, cy, wd, hh, fill)
      if (soft && i > 0 && hh >= 4) {
        const prev = list[i - 1][0]
        const row = (yy, keep) => {
          const out = []
          for (let c = 0; c < wd / 2; c++) if (keep(c)) out.push([x + c * 2, yy])
          return out
        }
        cells(fill, row(cy - 2, (c) => c % 4 === 0)) // 25 % màu mới trong dải cũ
        cells(prev, row(cy, (c) => c % 2 === 1)) // 50 % xen kẽ
        cells(prev, row(cy + 2, (c) => c % 4 === 2)) // 25 % màu cũ trong dải mới
      }
      cy += hh
    })
  }
  /* khối nổi sáng trên-trái: nền + mép sáng trên/trái + mép tối phải/dưới */
  const lit = (x, y, wd, ht, [hi, base, sh, deep]) => {
    rect(x, y, wd, ht, base)
    rect(x, y, wd, 2, hi)
    rect(x, y, 2, ht, hi)
    rect(x + wd - 2, y + 2, 2, ht - 2, sh)
    rect(x + 2, y + ht - 2, wd - 2, 2, sh)
    if (deep) rect(x + wd - 2, y + ht - 2, 2, 2, deep)
  }
  /* khối vải/rèm: các cột 2 px lặp theo mẫu nếp gấp, đáy lượn nhẹ */
  const drape = (x, y, wd, ht, ramp, pattern, wave = 0) => {
    for (let c = 0; c < wd / 2; c++) {
      const tone = pattern[c % pattern.length]
      const extra = wave ? (c % 3 === 1 ? wave : c % 3 === 2 ? wave / 2 : 0) : 0
      rect(x + c * 2, y, 2, ht + extra, ramp[tone])
    }
  }
  const svg = () =>
    `<svg class="scn-env__svg" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" aria-hidden="true">${r.join("")}</svg>`
  return { rect, cells, group, ellipse, glow, trap, dither, speck, bands, lit, drape, svg }
}

/* Viền tối dần ở mép khung (bóng tối góc phòng / tán cây): các dải mờ chồng nhau. */
function vignette(p, w, h, color, { l = 24, r = 24, t = 0, b = 0, o = 0.09, y0 = 0, y1 = h } = {}) {
  const steps = [[1, 0.5], [0.75, 0.5], [0.5, 0.5], [0.25, 0.5]]
  for (const [k, m] of steps) {
    if (l) p.rect(0, y0, l * k, y1 - y0, color, o * m)
    if (r) p.rect(w - r * k, y0, r * k, y1 - y0, color, o * m)
    if (t) p.rect(0, y0, w, t * k, color, o * m)
    if (b) p.rect(0, y1 - b * k, w, b * k, color, o * m)
  }
}

/* Mây pixel: các elip chồng, đáy xám xanh, đỉnh trắng (sáng trên-trái). */
function cloud(p, cx, cy, s = 1) {
  const parts = [[0, 0, 22, 6], [-14, 3, 12, 4], [14, 3, 14, 4], [-3, -4, 12, 5], [8, -2, 9, 4]]
  for (const [dx, dy, rx, ry] of parts) p.ellipse(cx + dx * s, cy + dy * s + 2, rx * s, ry * s, "#bccfe2")
  for (const [dx, dy, rx, ry] of parts) p.ellipse(cx + dx * s, cy + dy * s, rx * s, ry * s, "#e6eff6")
  for (const [dx, dy, rx, ry] of parts) p.ellipse(cx + dx * s - 2, cy + dy * s - 2, rx * s * 0.72, ry * s * 0.62, "#ffffff")
}

/* Dây điện võng: từng đoạn 2 px, đáy võng ở giữa hai cột. */
function wire(p, xa, xb, ya, yb, sag, color, o = 0.85) {
  const list = []
  for (let x = Math.min(xa, xb); x < Math.max(xa, xb); x += 2) {
    const t = (x - xa) / (xb - xa)
    list.push([x, Math.round(lerp(ya, yb, t) + sag * 4 * t * (1 - t))])
  }
  p.cells(color, list, o)
}

/* ------------------------------------------------------------------ nhà */
export function homeSVG({ STAGE_W, STAGE_H, GROUND_Y }) {
  /* Phòng khách kiêm bàn ăn buổi tối: tường kem ấm, ốp gỗ chân tường, cửa sổ
     chạng vạng có rèm, đèn thả rọi vàng xuống bàn ăn thấp có bát cơm, bàn thờ nhỏ
     trên kệ, tủ TV sáng xanh, cây lưỡi hổ, sàn gạch bóng. */
  const w = STAGE_W, h = STAGE_H
  const p = painter(w, h)
  const { rect, group, ellipse, glow, trap, dither, speck, bands, lit, drape, cells } = p
  const WALL = ["#eed8aa", "#d9bf92", "#bda080", "#9a8076"]
  const WOOD = ["#c99a6c", "#ab7c56", "#8a6049", "#60443f"]
  const FLOOR = ["#d9c9a4", "#c8b590", "#b09e80", "#928070"]
  const SHADOW = "#2b2142"
  const LAMP = "#ffe9aa"

  /* tường: nền + chân trần + vân vữa */
  rect(0, 0, w, GROUND_Y, WALL[1])
  rect(0, 0, w, 6, WALL[3])
  rect(0, 6, w, 2, WALL[2])
  rect(0, 8, w, 2, WALL[2], 0.5)
  speck(0, 10, w, 116, WALL[2], 70, 11, 0.28)
  speck(0, 10, w, 116, WALL[0], 60, 12, 0.5)

  /* vầng sáng đèn thả lên tường (giữa-trái) rồi tối dần ra góc */
  glow(150, 46, 150, 100, LAMP, 6, 0.07)
  vignette(p, w, GROUND_Y, SHADOW, { l: 64, r: 64, t: 24, o: 0.2 })

  /* ốp gỗ chân tường (beadboard): thanh dọc, rãnh tối + vệt sáng bên phải rãnh */
  rect(0, 122, w, 44, WOOD[1])
  for (let x = 0; x < w; x += 12) {
    rect(x, 126, 2, 38, WOOD[2])
    rect(x + 2, 126, 2, 38, WOOD[0], 0.55)
  }
  speck(0, 126, w, 38, WOOD[3], 18, 21, 0.28, 2, 6)
  rect(0, 122, w, 2, WOOD[0])
  rect(0, 124, w, 2, WOOD[1])
  rect(0, 126, w, 2, WOOD[3], 0.5)
  rect(0, 128, w, 2, SHADOW, 0.1)
  // phào chân tường
  rect(0, 164, w, 8, WOOD[2])
  rect(0, 164, w, 2, WOOD[0])
  rect(0, 166, w, 2, WOOD[1])
  rect(0, 170, w, 2, WOOD[3])
  // bóng tường dưới thanh ốp
  rect(0, 120, w, 2, SHADOW, 0.1)

  /* cửa sổ chạng vạng + rèm (trái) */
  rect(14, 22, 56, 80, "#5a4538") // khung
  rect(14, 22, 56, 2, "#8f6c55")
  rect(14, 22, 2, 80, "#8f6c55")
  rect(68, 24, 2, 78, "#3c2d2c")
  rect(16, 100, 54, 2, "#3c2d2c")
  // kính: trời tím → cam chân trời
  bands(18, 26, 48, [
    ["#2b3159", 14],
    ["#3f4580", 12],
    ["#6d5a8a", 10],
    ["#c37e63", 6],
    ["#e49c68", 6],
    ["#2a2f55", 24],
  ])
  // đường chân trời: toà nhà đen xanh, ô cửa sáng
  const sky = [[18, 80, 8], [26, 70, 10], [36, 78, 6], [44, 66, 8], [52, 76, 8], [60, 82, 6]]
  for (const [bx, top, bw] of sky) {
    rect(bx, top, bw, 98 - top, "#1f2347")
    rect(bx, top, bw, 2, "#3a3566")
  }
  cells("#f7d27c", [[28, 76], [28, 84], [30, 92], [46, 72], [48, 82], [54, 84], [62, 90], [20, 88], [36, 86], [46, 90]])
  // sao + trăng khuyết
  cells("#f6efd8", [[24, 32], [34, 42], [58, 48], [48, 30]])
  cells("#f6efd8", [[54, 34, 4, 2], [52, 36, 2, 4], [54, 40, 4, 2]])
  // thanh kính + ô ngang + vệt phản chiếu
  rect(40, 26, 4, 72, "#5a4538")
  rect(40, 26, 2, 72, "#8f6c55")
  rect(18, 56, 48, 4, "#5a4538")
  rect(18, 56, 48, 2, "#8f6c55")
  cells("#ffffff", [[20, 30], [22, 32], [24, 34], [26, 36], [28, 38], [30, 40], [32, 42], [34, 44], [36, 46], [38, 48]], 0.1)
  cells("#ffffff", [[46, 62], [48, 64], [50, 66], [52, 68], [54, 70], [56, 72], [58, 74]], 0.08)
  // bệ cửa + bóng dưới bệ
  rect(10, 102, 66, 4, "#a98670")
  rect(10, 102, 66, 2, "#d3b093")
  rect(10, 106, 66, 2, SHADOW, 0.22)
  rect(12, 108, 62, 2, SHADOW, 0.1)
  // thanh treo rèm + đầu thanh
  rect(8, 18, 70, 4, "#6d4f3c")
  rect(8, 18, 70, 2, "#a07a58")
  rect(4, 16, 4, 8, "#d3ad6a")
  rect(78, 16, 4, 8, "#d3ad6a")
  rect(8, 22, 70, 2, SHADOW, 0.2)
  // hai nửa rèm có nếp gấp 4 sắc
  const CURT = ["#cf7c68", "#b2604f", "#8c4a45", "#643744"]
  drape(8, 22, 14, 82, CURT, [0, 1, 1, 2, 3, 2, 1], 0)
  drape(62, 22, 14, 82, CURT, [1, 0, 1, 1, 2, 3, 2], 0)
  rect(8, 22, 14, 4, CURT[3], 0.5)
  rect(62, 22, 14, 4, CURT[3], 0.5)
  // dây buộc rèm
  rect(8, 74, 14, 4, "#d3ad6a")
  rect(62, 74, 14, 4, "#d3ad6a")
  rect(8, 76, 14, 2, "#a07a38")
  rect(62, 76, 14, 2, "#a07a38")
  // gấu rèm: tối dần xuống chân
  rect(8, 96, 14, 8, SHADOW, 0.1)
  rect(62, 96, 14, 8, SHADOW, 0.1)
  // bóng rèm đổ lên tường (rơi sang phải)
  rect(76, 24, 4, 80, SHADOW, 0.1)
  rect(80, 26, 2, 76, SHADOW, 0.06)

  /* khung ảnh gia đình + khung nhỏ */
  rect(98, 30, 38, 30, SHADOW, 0.16) // bóng đổ phải-dưới
  rect(100, 32, 38, 30, SHADOW, 0.08)
  lit(94, 26, 38, 30, ["#a97c58", "#8a6049", "#654537", "#432f33"])
  rect(98, 30, 30, 22, "#ece1c6")
  rect(98, 30, 30, 2, "#cdbf9f")
  rect(98, 30, 2, 22, "#cdbf9f")
  // ba người trong ảnh
  rect(103, 38, 6, 12, "#44648d")
  rect(103, 38, 2, 12, "#6486b0")
  rect(104, 33, 4, 4, "#e3b48e")
  rect(111, 34, 6, 16, "#a85b4a")
  rect(111, 34, 2, 16, "#c6786a")
  rect(112, 31, 4, 4, "#e3b48e")
  rect(119, 40, 6, 10, "#6e8a52")
  rect(119, 40, 2, 10, "#8aa468")
  rect(120, 36, 4, 4, "#e3b48e")
  rect(98, 50, 30, 2, "#bfae8a")
  rect(98, 30, 30, 22, "#ffffff", 0.07)
  lit(180, 36, 18, 22, ["#a97c58", "#8a6049", "#654537", "#432f33"])
  rect(184, 40, 10, 14, "#9fb2c6")
  rect(184, 40, 10, 6, "#c3d3df")
  rect(188, 44, 4, 4, "#e3b48e")
  rect(186, 48, 6, 6, "#a85b4a")
  rect(184, 40, 10, 2, "#ffffff", 0.2)
  rect(198, 40, 2, 20, SHADOW, 0.12)

  /* kệ bàn thờ nhỏ (phải-trên): hương khói, đĩa quả, đèn điện đỏ */
  rect(228, 56, 82, 6, SHADOW, 0.14)
  rect(228, 62, 4, 12, SHADOW, 0.1)
  lit(224, 52, 82, 6, ["#c99a6c", "#ab7c56", "#8a6049", "#60443f"])
  rect(232, 58, 4, 12, "#8a6049")
  rect(232, 58, 2, 12, "#c99a6c")
  rect(294, 58, 4, 12, "#60443f")
  rect(232, 58, 66, 2, SHADOW, 0.2)
  // lư hương
  rect(244, 46, 14, 6, "#b88a45")
  rect(244, 46, 14, 2, "#f0cd7c")
  rect(256, 48, 2, 4, "#7c5a2c")
  rect(246, 44, 10, 2, "#d8aa5a")
  rect(250, 30, 2, 14, "#c9a66c")
  rect(254, 34, 2, 10, "#c9a66c")
  rect(250, 30, 2, 2, "#ff7a4a")
  rect(254, 34, 2, 2, "#ff7a4a")
  group("scn-steam", () => {
    cells("#f1ebdc", [[250, 24], [252, 20]], 0.7)
    cells("#f1ebdc", [[254, 28], [256, 24]], 0.5)
  })
  // đĩa quả
  rect(270, 48, 20, 4, "#efe6d2")
  rect(270, 48, 20, 2, "#ffffff")
  rect(272, 52, 16, 2, "#bfb39a")
  rect(272, 42, 8, 6, "#e88f3c")
  rect(272, 42, 4, 4, "#ffc16a")
  rect(280, 44, 8, 4, "#d9742e")
  rect(282, 42, 4, 2, "#ffb04c")
  rect(276, 40, 2, 2, "#5f7a3c")
  // đèn điện đỏ nhỏ
  rect(294, 40, 8, 12, "#c3463f")
  rect(294, 40, 2, 12, "#ec6f64")
  rect(300, 42, 2, 10, "#8f2f36")
  rect(294, 38, 8, 2, "#f2c562")
  glow(298, 44, 14, 10, "#ff6a4a", 3, 0.05)

  /* đèn thả: dây, chụp nón 3 sắc, bóng đèn sáng + chùm sáng xuống bàn */
  rect(150, 0, 2, 22, "#4a3a36")
  rect(146, 20, 10, 2, "#6d5a4c")
  const shadeRows = [[22, 10], [24, 14], [26, 18], [28, 22], [30, 26], [32, 30], [34, 32]]
  for (const [yy, ww] of shadeRows) {
    rect(151 - ww / 2, yy, ww, 2, "#b5624a")
    rect(151 - ww / 2, yy, 4, 2, "#e08a6a")
    rect(151 + ww / 2 - 4, yy, 4, 2, "#8a4640")
  }
  rect(135, 36, 32, 2, "#6c3a3e")
  rect(139, 38, 24, 2, "#fff4cc")
  rect(143, 40, 16, 2, "#ffe9a4", 0.8)
  // chùm sáng (hai lớp) và quầng quanh bóng
  trap(138, 40, 26, 62, 172, 178, LAMP, 0.055)
  trap(142, 40, 18, 96, 172, 110, LAMP, 0.05)
  group("scn-screen", () => {
    glow(151, 42, 46, 24, LAMP, 4, 0.08)
  })

  /* tủ TV (phải): màn hình xanh lạnh, ánh phản lên tường/tủ */
  rect(254, 104, 56, 4, SHADOW, 0.0)
  glow(280, 118, 50, 32, "#8cc0f0", 3, 0.045)
  rect(252, 98, 54, 38, "#2a2c3a")
  rect(252, 98, 54, 2, "#555870")
  rect(252, 98, 2, 38, "#555870")
  rect(304, 100, 2, 36, "#14151f")
  rect(254, 134, 52, 2, "#14151f")
  group("scn-screen", () => {
    bands(256, 102, 46, [
      ["#6fa2c8", 8],
      ["#4f84ac", 10],
      ["#35607f", 14],
    ])
    rect(256, 120, 46, 2, "#e8f0f6", 0.0)
    rect(262, 108, 14, 10, "#2a4a62", 0.7)
    rect(264, 106, 10, 2, "#f1e6b8")
    rect(280, 110, 18, 2, "#e8f0f6", 0.7)
    rect(280, 114, 12, 2, "#e8f0f6", 0.5)
    rect(262, 124, 34, 2, "#e8f0f6", 0.55)
    rect(260, 104, 2, 2, "#ffffff", 0.25)
    cells("#ffffff", [[258, 104], [260, 106], [262, 108], [264, 110]], 0.1)
  })
  rect(272, 136, 16, 4, "#14151f")
  // tủ gỗ dưới TV
  rect(248, 140, 66, 6, SHADOW, 0.0)
  lit(246, 140, 62, 32, WOOD)
  rect(248, 142, 58, 2, WOOD[0])
  rect(246, 156, 62, 2, WOOD[3], 0.5)
  rect(274, 144, 2, 24, WOOD[3])
  rect(276, 144, 2, 24, WOOD[0], 0.5)
  rect(258, 148, 8, 2, "#d8b96e")
  rect(286, 148, 8, 2, "#d8b96e")
  rect(250, 164, 54, 2, WOOD[3], 0.5)
  rect(246, 168, 4, 4, WOOD[3])
  rect(302, 168, 4, 4, WOOD[3])
  // ánh xanh từ màn hình xuống mặt tủ
  rect(250, 140, 52, 2, "#a8d4ff", 0.3)
  // bóng tủ TV lên tường (phải)
  rect(308, 106, 4, 66, SHADOW, 0.14)

  /* cây lưỡi hổ (trái, thấp) + chậu men */
  const BLADE = ["#8fbe74", "#5d9150", "#3d6c47", "#274a3c"]
  const blade = (bx, top, bw, bh) => {
    for (let yy = 0; yy < bh; yy += 2) {
      const grow = yy < 6 ? yy / 2 + 1 : bw / 2 // mũi nhọn: rộng dần 2 → bw
      const ww = Math.min(bw, grow * 2)
      const x0 = bx + (bw - ww) / 2
      rect(x0, top + yy, ww, 2, BLADE[1])
      rect(x0, top + yy, 2, 2, BLADE[0])
      if (ww > 2) rect(x0 + ww - 2, top + yy, 2, 2, BLADE[2])
      if (yy > 8 && yy % 8 === 0 && ww > 4) rect(x0 + 2, top + yy, ww - 4, 2, BLADE[2], 0.55) // vằn ngang
    }
    rect(bx + bw - 2, top + 6, 2, bh - 6, BLADE[3], 0.45)
  }
  blade(20, 118, 8, 40)
  blade(30, 104, 8, 54)
  blade(40, 116, 8, 42)
  blade(12, 132, 8, 26)
  blade(48, 128, 6, 30)
  rect(10, 154, 46, 4, SHADOW, 0.0)
  // chậu men có gờ miệng, bóng tròn bên trái, bóng đổ phải
  rect(12, 148, 38, 4, "#8fbcb4")
  rect(12, 148, 38, 2, "#bfe0d6")
  rect(48, 148, 2, 4, "#4e7677")
  lit(14, 152, 34, 20, ["#9bc2bc", "#6c9a96", "#4e7677", "#2f4d58"])
  rect(16, 156, 2, 10, "#ffffff", 0.2)
  rect(14, 152, 34, 2, SHADOW, 0.3)
  rect(50, 152, 4, 20, SHADOW, 0.16)

  /* bàn ăn thấp + bát cơm + ghế đẩu nhựa */
  // bóng bàn trên sàn và lên tường phía sau
  rect(108, 154, 96, 18, SHADOW, 0.1)
  /* sàn */
  rect(0, GROUND_Y, w, h - GROUND_Y, FLOOR[1])
  for (let row = 0; row < 2; row++) {
    const y0 = GROUND_Y + row * 14
    const off = row ? 16 : 0
    const rnd = seeded(40 + row)
    for (let x = -off; x < w; x += 32) {
      const t = rnd()
      rect(x, y0, 32, 14, t < 0.34 ? FLOOR[0] : t < 0.7 ? FLOOR[1] : "#cdbc99")
      rect(x, y0, 32, 2, "#ffffff", 0.1)
      rect(x + 30, y0, 2, 14, FLOOR[2])
    }
    rect(0, y0 + 12, w, 2, FLOOR[2])
  }
  // sàn bóng: vệt phản chiếu đèn và ánh ấm
  ellipse(150, 188, 108, 12, LAMP, 0.1)
  ellipse(150, 188, 74, 8, LAMP, 0.1)
  ellipse(150, 188, 42, 5, LAMP, 0.1)
  rect(0, 172, w, 4, SHADOW, 0.18)
  rect(0, 176, w, 2, SHADOW, 0.08)
  vignette(p, w, h, SHADOW, { l: 28, r: 28, o: 0.08, y0: 172 })

  // bàn
  rect(114, 160, 6, 12, WOOD[2])
  rect(114, 160, 2, 12, WOOD[0])
  rect(192, 160, 6, 12, WOOD[3])
  rect(192, 160, 2, 12, WOOD[1])
  rect(116, 156, 82, 4, WOOD[2])
  rect(116, 156, 82, 2, WOOD[1])
  rect(108, 150, 98, 6, WOOD[1])
  rect(108, 150, 98, 2, WOOD[0])
  rect(108, 154, 98, 2, WOOD[2])
  rect(204, 152, 2, 4, WOOD[3])
  rect(108, 150, 2, 6, "#ddb589")
  speck(112, 152, 90, 2, WOOD[2], 6, 51, 0.7, 4, 2)
  // ánh đèn trên mặt bàn
  rect(130, 150, 40, 2, "#fff0c0", 0.3)
  // bát cơm + đũa
  const bowl = (x) => {
    rect(x, 146, 10, 6, "#f0e7d4")
    rect(x, 146, 10, 2, "#ffffff")
    rect(x, 148, 10, 2, "#47688f")
    rect(x + 8, 148, 2, 4, "#2f496b")
    rect(x + 2, 152, 6, 2, "#bdb09a")
    rect(x + 2, 144, 6, 2, "#fffaf0")
    rect(x + 4, 142, 2, 2, "#fffaf0")
    rect(x + 2, 144, 2, 2, "#ffffff")
  }
  bowl(118)
  bowl(180)
  bowl(194)
  rect(120, 142, 8, 2, "#c99a6c")
  // đĩa thịt kho + rau + canh
  rect(134, 148, 18, 4, "#f0e7d4")
  rect(134, 148, 18, 2, "#ffffff")
  rect(136, 144, 12, 4, "#8c4a36")
  rect(136, 144, 6, 2, "#bd7050")
  rect(144, 146, 4, 2, "#5e2c27")
  rect(156, 148, 16, 4, "#f0e7d4")
  rect(156, 148, 16, 2, "#ffffff")
  rect(158, 144, 12, 4, "#5f8a46")
  rect(158, 144, 6, 2, "#8fb866")
  rect(166, 146, 4, 2, "#3d6a3f")
  group("scn-steam", () => {
    cells("#f6efe0", [[120, 138], [122, 134], [182, 138], [184, 134], [196, 138], [196, 134]], 0.65)
    cells("#f6efe0", [[138, 140], [140, 136]], 0.5)
  })
  // bóng đồ ăn lên mặt bàn (phải)
  rect(128, 152, 2, 2, SHADOW, 0.2)
  // ghế đẩu nhựa đỏ
  const stool = (x) => {
    rect(x + 2, 164, 2, 8, "#7a3a38")
    rect(x + 14, 164, 2, 8, "#5c2c33")
    rect(x + 4, 164, 2, 8, "#9a4a42", 0.0)
    rect(x, 158, 18, 6, "#c4584c")
    rect(x, 158, 18, 2, "#ec8472")
    rect(x, 158, 2, 6, "#ec8472")
    rect(x + 16, 160, 2, 4, "#8f3a3c")
    rect(x + 2, 162, 14, 2, "#8f3a3c")
    rect(x + 6, 168, 6, 2, "#7a3a38", 0.7)
  }
  stool(78)
  stool(214)
  rect(80, 172, 24, 4, SHADOW, 0.14)
  rect(216, 172, 24, 4, SHADOW, 0.14)
  // bóng đổ xuống sàn của bàn / tủ / chậu (rơi sang phải-dưới)
  rect(112, 172, 104, 4, SHADOW, 0.16)
  rect(118, 176, 98, 2, SHADOW, 0.08)
  rect(246, 172, 66, 4, SHADOW, 0.18)
  rect(14, 172, 40, 4, SHADOW, 0.16)

  return p.svg()
}

/* ------------------------------------------------------------------ phố */
export function streetSVG({ STAGE_W, STAGE_H, GROUND_Y }) {
  /* Phố trước cổng trường buổi chiều: nắng xiên từ trên-trái, dãy nhà phố nhiều
     màu có cửa sổ, biển hiệu, mái hiên, cửa cuốn; dây điện, biển trạm xe buýt,
     xe máy đỗ, xe đẩy đồ ăn, vỉa hè lát gạch có bóng đổ. */
  const w = STAGE_W, h = STAGE_H
  const p = painter(w, h)
  const { rect, group, ellipse, glow, trap, speck, bands, lit, cells } = p
  const SHADOW = "#2b2142"
  const SUN = "#fff0b8"
  const PLINTH = ["#cfc5b2", "#b0a695", "#8f8677"]

  /* trời + nắng + mây */
  bands(0, 0, w, [["#6ca6d8", 14], ["#84bae4", 14], ["#a0cfec", 14], ["#c0e0ee", 18], ["#dcecec", 30]])
  glow(0, 0, 120, 70, SUN, 3, 0.06)
  cloud(p, 232, 20, 1)
  cloud(p, 46, 40, 0.8)
  cloud(p, 150, 12, 0.55)

  /* một căn nhà phố: tường 4 sắc, vữa, gờ mái + bóng, cửa sổ lõm */
  const house = (x, wd, top, T, win) => {
    const base = T.base
    rect(x, top, wd, GROUND_Y - top, base)
    rect(x, top, 2, GROUND_Y - top, T.hi)
    rect(x + wd - 2, top, 2, GROUND_Y - top, T.sh)
    speck(x + 2, top + 12, wd - 4, 140, T.sh, Math.round(wd * 0.5), x + 3, 0.2)
    speck(x + 2, top + 12, wd - 4, 140, T.hi, Math.round(wd * 0.45), x + 7, 0.4)
    // gờ mái sáng trên-trái, bóng gờ đổ xuống tường
    rect(x, top - 2, wd, 8, T.trim[1])
    rect(x, top - 2, wd, 2, T.trim[0])
    rect(x, top + 4, wd, 2, T.trim[2])
    rect(x, top + 6, wd, 4, SHADOW, 0.2)
    rect(x, top + 10, wd, 2, SHADOW, 0.1)
    // cửa sổ lõm: bóng trên + trái bên trong, kính phản chiếu trời
    const n = wd >= 66 ? 3 : 2
    const ww = 14
    const gap = ev((wd - n * ww) / (n + 1))
    for (let k = 0; k < n; k++) {
      const wx = x + gap + k * (ww + gap)
      const wy = top + 16
      const wh = 22
      rect(wx - 2, wy - 2, ww + 4, wh + 4, "#e2d8c2")
      rect(wx - 2, wy - 2, ww + 4, 2, "#fff8e8")
      rect(wx - 2, wy - 2, 2, wh + 4, "#fff8e8")
      rect(wx + ww, wy, 2, wh, "#b0a690")
      rect(wx, wy, ww, wh, "#6a98c2")
      rect(wx, wy, ww, 8, "#98c0de")
      rect(wx, wy + 14, ww, 8, "#557fa8")
      rect(wx + ww / 2 - 2, wy, 2, wh, "#e2d8c2")
      rect(wx, wy + 10, ww, 2, "#e2d8c2")
      cells("#ffffff", [[wx + 2, wy + 2], [wx + 4, wy + 4], [wx + 2, wy + 14], [wx + 4, wy + 16]], 0.35)
      rect(wx, wy, ww, 4, SHADOW, 0.32)
      rect(wx, wy, 4, wh, SHADOW, 0.22)
      // bệ cửa + bóng dưới bệ
      rect(wx - 4, wy + wh + 2, ww + 8, 2, T.hi)
      rect(wx - 4, wy + wh + 4, ww + 8, 2, T.sh)
      rect(wx - 4, wy + wh + 6, ww + 8, 4, SHADOW, 0.16)
      // chậu cây/ cửa chớp xen kẽ
      if ((k + win) % 3 === 0) {
        rect(wx - 2, wy + wh - 2, ww + 4, 4, "#8a5a44")
        rect(wx - 2, wy + wh - 2, ww + 4, 2, "#b8805c")
        cells("#5f8a46", [[wx - 2, wy + wh - 6], [wx + 2, wy + wh - 8], [wx + 6, wy + wh - 6], [wx + 10, wy + wh - 8]])
        cells("#e88aa0", [[wx, wy + wh - 8], [wx + 8, wy + wh - 6], [wx + 12, wy + wh - 10]])
      } else if ((k + win) % 3 === 1) {
        rect(wx - 8, wy - 2, 6, wh + 4, "#6f9468")
        rect(wx + ww + 2, wy - 2, 6, wh + 4, "#5a7e56")
        for (let ly = wy; ly < wy + wh; ly += 4) {
          rect(wx - 8, ly, 6, 2, "#3f6049", 0.55)
          rect(wx + ww + 2, ly, 6, 2, "#34553f", 0.55)
        }
        rect(wx - 8, wy - 2, 2, wh + 4, "#98b88a")
      }
    }
    // chân nhà (bậc đá) + bóng chân tường
    rect(x, 164, wd, 8, PLINTH[1])
    rect(x, 164, wd, 2, PLINTH[0])
    rect(x, 170, wd, 2, PLINTH[2])
  }

  const T0 = { hi: "#f2dcaa", base: "#e4c88c", sh: "#c4a278", deep: "#9a7b6c", trim: ["#cd7a62", "#a95c4c", "#7e4640"] }
  const T1 = { hi: "#d6e0bc", base: "#bfcba4", sh: "#9cac8a", deep: "#788a70", trim: ["#7ea06a", "#5c8056", "#436044"] }
  const T2 = { hi: "#f0cdbc", base: "#e0b6a4", sh: "#c0937f", deep: "#9a7480", trim: ["#b8665c", "#8f4a48", "#69383e"] }
  const T3 = { hi: "#dce5f0", base: "#c6d2e2", sh: "#a2b0c8", deep: "#808ca8", trim: ["#6f92b8", "#4f759c", "#385878"] }
  const T4 = { hi: "#f8eac0", base: "#ecdaa2", sh: "#caB684", deep: "#a39274", trim: ["#d8805a", "#b45f42", "#843f34"] }
  house(0, 64, 40, T0, 0)
  house(64, 56, 32, T1, 1)
  house(120, 72, 38, T2, 2)
  house(192, 58, 28, T3, 0)
  house(250, 70, 36, T4, 1)

  /* bảng hiệu: ván 3 sắc + dòng chữ giả */
  const sign = (x, y, wd, [hi, base, sh], ink, lines) => {
    rect(x + 2, y + 2, wd, 10, SHADOW, 0.2)
    rect(x, y, wd, 10, base)
    rect(x, y, wd, 2, hi)
    rect(x, y + 8, wd, 2, sh)
    lines.forEach(([dx, ww], i) => rect(x + dx, y + 3 + i * 3, ww, 2, ink))
  }
  /* cửa cuốn: nhiều nan ngang, hộp cuốn phía trên, bóng mái hiên */
  const shutter = (x, wd, [hi, base, sh]) => {
    rect(x + 4, 104, wd - 8, 60, base)
    for (let yy = 108; yy < 160; yy += 4) rect(x + 4, yy, wd - 8, 2, sh, 0.65)
    rect(x + 4, 104, wd - 8, 4, hi)
    rect(x + 4, 160, wd - 8, 4, sh)
    rect(x + 4, 104, 2, 60, hi, 0.7)
    rect(x + wd - 6, 104, 2, 60, sh, 0.7)
    rect(x + wd / 2 - 4, 150, 8, 2, "#d9cfb6")
    rect(x + 4, 108, wd - 8, 8, SHADOW, 0.22)
    rect(x + 4, 116, wd - 8, 4, SHADOW, 0.1)
    speck(x + 6, 120, wd - 12, 36, "#ffffff", 4, x, 0.15, 6, 2)
  }
  /* cửa kính mở: lòng cửa hàng tối, kệ + hàng màu dịu, kính chói chéo */
  const glassFront = (x, wd, interior, shelf, items) => {
    rect(x + 4, 104, wd - 8, 60, "#3a3648")
    rect(x + 6, 106, wd - 12, 58, interior)
    for (const sy of [122, 138, 154]) {
      rect(x + 6, sy, wd - 12, 2, shelf)
      rect(x + 6, sy + 2, wd - 12, 2, SHADOW, 0.25)
    }
    items.forEach(([ix, iy, iw, ih, c]) => rect(x + ix, iy, iw, ih, c))
    cells("#ffffff", [[x + 10, 112], [x + 12, 114], [x + 14, 116], [x + 16, 118], [x + 18, 120], [x + 20, 122]], 0.14)
    rect(x + 6, 106, wd - 12, 10, SHADOW, 0.32)
    rect(x + 6, 116, wd - 12, 4, SHADOW, 0.14)
    rect(x + 4, 104, wd - 8, 2, "#8a8296")
    rect(x + wd - 6, 106, 2, 58, SHADOW, 0.3)
    rect(x + wd / 2 - 1, 106, 2, 58, "#7a728a", 0.7)
  }

  // nhà 0: tạp hoá, cửa cuốn xanh xám
  sign(8, 92, 48, ["#e07c64", "#c05c4c", "#8a3f3c"], "#f6ecd4", [[4, 22], [4, 30]])
  shutter(0, 64, ["#a9bcc6", "#8ba0ae", "#6d8394"])
  // nhà 1: cửa hàng mở, kệ hàng
  sign(70, 94, 44, ["#6c9a62", "#4f7a4f", "#365a3c"], "#f2e6a8", [[4, 28], [4, 20]])
  glassFront(64, 56, "#5a4e5e", "#8a7a6a", [[10, 112, 6, 8, "#c47a5a"], [20, 112, 8, 8, "#d8b45a"], [32, 112, 6, 8, "#6f9a7a"], [12, 128, 8, 8, "#8aa6c0"], [24, 128, 6, 8, "#d88a9a"], [34, 128, 8, 8, "#c9b078"], [10, 144, 10, 8, "#d8c7a0"], [26, 144, 8, 8, "#b46a54"]])
  // nhà 2: quán nước, mái hiên sọc
  rect(120, 98, 72, 2, "#00000000")
  glassFront(120, 72, "#c89a64", "#a07048", [[10, 128, 12, 10, "#f0d9a0"], [28, 126, 10, 12, "#e8b0a0"], [44, 128, 12, 10, "#f0d9a0"]])
  for (let yy = 0; yy < 10; yy += 2) {
    const inset = yy
    for (let xx = 120 + inset; xx < 192 - inset; xx += 8) {
      const stripe = ((xx - 120) / 8) % 2 === 0
      rect(xx, 96 + yy, Math.min(8, 192 - inset - xx), 2, stripe ? "#d8604f" : "#f6ecd8")
    }
  }
  rect(122, 106, 68, 2, "#f6ecd8")
  rect(122, 108, 68, 2, "#a8443f")
  rect(122, 110, 68, 6, SHADOW, 0.25)
  cells("#a8443f", [[124, 110], [132, 110], [140, 110], [148, 110], [156, 110], [164, 110], [172, 110], [180, 110]])
  rect(128, 88, 56, 8, "#3f648a")
  rect(128, 88, 56, 2, "#6f96bc")
  rect(128, 94, 56, 2, "#2c4668")
  rect(134, 90, 20, 2, "#f6ecd8")
  rect(158, 90, 18, 2, "#e8d49a")
  // nhà 3: cửa cuốn xanh lá
  sign(198, 90, 46, ["#4e8ab0", "#3a6a92", "#284c6c"], "#f4efe0", [[4, 30], [4, 22]])
  shutter(192, 58, ["#8fb0a0", "#6f9486", "#547668"])
  // nhà 4: hiệu thuốc, thánh giá xanh
  sign(256, 90, 52, ["#6ca87a", "#4a8a60", "#336c48"], "#f4efe0", [[4, 34], [4, 26]])
  glassFront(250, 70, "#d6e2dc", "#a8bab0", [[10, 112, 10, 8, "#8fb8a0"], [24, 112, 8, 8, "#f0d9a0"], [38, 112, 10, 8, "#d8a0a0"], [12, 128, 8, 8, "#a0b8d0"], [28, 128, 10, 8, "#f0d9a0"], [44, 128, 8, 8, "#8fb8a0"], [10, 144, 12, 8, "#e8d8b8"], [30, 144, 10, 8, "#b8c8d8"]])
  rect(278, 112, 8, 2, "#4a8a60", 0.0)

  /* nắng ấm quét từ góc trên-trái lên mặt tiền */
  glow(0, 0, 150, 90, SUN, 3, 0.04)

  /* cột điện + dây (phải) */
  rect(304, 10, 6, 162, "#7a6a60")
  rect(304, 10, 2, 162, "#a89888")
  rect(308, 10, 2, 162, "#54463e")
  rect(292, 12, 30, 4, "#6d5c52")
  rect(292, 12, 30, 2, "#a89888")
  rect(296, 8, 2, 4, "#d8d0c0")
  rect(306, 6, 2, 6, "#d8d0c0")
  rect(316, 8, 2, 4, "#d8d0c0")
  rect(310, 12, 8, 160, SHADOW, 0.0)
  // dây võng về bên trái
  wire(p, 0, 298, 22, 15, 10, "#2f3550")
  wire(p, 0, 308, 28, 15, 12, "#2f3550")
  // bóng cột đổ lên tường
  rect(312, 10, 4, 162, SHADOW, 0.12)

  /* trạm xe buýt: cột + biển xanh có hình xe */
  rect(52, 100, 4, 72, "#a9b2bc")
  rect(52, 100, 2, 72, "#d8dee4")
  rect(54, 100, 2, 72, "#7a8490")
  rect(40, 94, 28, 16, "#3a74a4")
  rect(40, 94, 28, 2, "#6aa4d0")
  rect(40, 94, 2, 16, "#6aa4d0")
  rect(66, 96, 2, 14, "#26507a")
  rect(40, 108, 28, 2, "#26507a")
  rect(46, 98, 16, 8, "#f4efe0")
  rect(46, 98, 16, 2, "#ffffff")
  rect(48, 102, 4, 4, "#3a74a4")
  rect(56, 102, 4, 4, "#3a74a4")
  rect(70, 98, 2, 12, SHADOW, 0.18)

  /* xe máy đỗ (trái, thấp) */
  const wheel = (cx, cy) => {
    ellipse(cx, cy, 8, 8, "#26272f")
    ellipse(cx, cy, 5, 5, "#8d95a2")
    ellipse(cx, cy, 2, 2, "#3a3c48")
    cells("#5a5d6c", [[cx - 6, cy - 4], [cx - 4, cy - 6], [cx - 2, cy - 8]])
  }
  const BIKE = ["#cf7a62", "#b45a4c", "#8a4040", "#5a2c36"]
  // bóng bánh xe đổ xuống vỉa hè
  ellipse(30, 176, 28, 3, SHADOW, 0.22)
  wheel(14, 164)
  wheel(40, 164)
  rect(10, 146, 22, 14, BIKE[1]) // thân sau
  rect(10, 146, 22, 2, BIKE[0])
  rect(10, 146, 2, 14, BIKE[0])
  rect(30, 150, 2, 10, BIKE[2])
  rect(10, 158, 22, 2, BIKE[2])
  rect(8, 142, 18, 4, "#30313b") // yên
  rect(8, 142, 12, 2, "#5a5d6c")
  rect(32, 156, 8, 4, BIKE[2])
  rect(34, 138, 6, 20, BIKE[1]) // chắn gió trước
  rect(34, 138, 2, 20, BIKE[0])
  rect(38, 140, 2, 18, BIKE[2])
  rect(32, 134, 12, 2, "#30313b")
  rect(38, 130, 4, 4, "#8d95a2")
  rect(40, 142, 4, 4, "#fff4c4")
  rect(40, 142, 4, 2, "#ffffff")
  rect(20, 158, 12, 2, "#30313b")
  rect(12, 148, 2, 2, "#ffffff", 0.45)

  /* xe đẩy đồ ăn (phải): mái dù sọc, tủ kính, bánh xe, hơi nóng */
  const CART = ["#cf9c6c", "#b07a52", "#8a5c44", "#5e3d3a"]
  ellipse(262, 176, 36, 3, SHADOW, 0.22)
  rect(228, 150, 62, 14, CART[1])
  rect(228, 150, 62, 2, CART[0])
  rect(228, 150, 2, 14, CART[0])
  rect(288, 152, 2, 12, CART[2])
  rect(228, 162, 62, 2, CART[2])
  for (let xx = 232; xx < 286; xx += 12) {
    rect(xx, 154, 8, 6, "#5f8a96")
    rect(xx, 154, 8, 2, "#8bb6c0")
    rect(xx + 6, 156, 2, 4, "#44707c")
  }
  rect(232, 164, 6, 8, CART[3])
  rect(282, 164, 6, 8, CART[3])
  wheel(238, 166)
  wheel(280, 166)
  // tủ kính + đồ ăn
  rect(232, 134, 54, 16, "#9ec4d0")
  rect(232, 134, 54, 2, "#d2ecf4")
  rect(232, 134, 2, 16, "#d2ecf4")
  rect(284, 136, 2, 14, "#6a98a6")
  rect(236, 142, 10, 8, "#d8a060")
  rect(236, 142, 4, 4, "#f0c88a")
  rect(250, 144, 10, 6, "#b8503f")
  rect(264, 142, 10, 8, "#e8d49a")
  rect(264, 142, 4, 4, "#f8ecc0")
  cells("#ffffff", [[236, 136], [238, 138]], 0.5)
  rect(232, 148, 54, 2, SHADOW, 0.2)
  // mái dù sọc đỏ-kem + bóng dưới mái
  rect(256, 118, 4, 16, "#7a6a60")
  for (let yy = 0; yy < 12; yy += 2) {
    const inset = 28 - Math.min(28, 4 + yy * 3)
    for (let xx = 226 + inset; xx < 294 - inset; xx += 8) {
      const stripe = ((xx - 226) / 8) % 2 === 0
      rect(xx, 108 + yy, Math.min(8, 294 - inset - xx), 2, stripe ? "#d8604f" : "#f6ecd8")
    }
  }
  rect(226, 120, 68, 2, "#a8443f")
  rect(228, 122, 64, 4, SHADOW, 0.2)
  group("scn-steam", () => {
    cells("#fffaf0", [[254, 102], [256, 98]], 0.7)
    cells("#fffaf0", [[262, 104], [264, 100]], 0.5)
  })

  /* vỉa hè lát gạch, nắng ấm, bóng đổ */
  const PAVE = ["#e2d9c4", "#d2c8b0", "#b9ad96", "#9c9282"]
  rect(0, GROUND_Y, w, h - GROUND_Y, PAVE[1])
  for (let row = 0; row < 2; row++) {
    const y0 = GROUND_Y + row * 14
    const off = row ? 12 : 0
    const rnd = (function () { let sd = 90 + row; return () => ((sd = (Math.imul(sd, 1664525) + 1013904223) >>> 0) / 4294967296) })()
    for (let x = -off; x < w; x += 24) {
      const t = rnd()
      rect(x, y0, 24, 14, t < 0.3 ? PAVE[0] : t < 0.75 ? PAVE[1] : "#c6bca4")
      rect(x, y0, 24, 2, "#ffffff", 0.14)
      rect(x + 22, y0, 2, 14, PAVE[2])
    }
    rect(0, y0 + 12, w, 2, PAVE[2])
  }
  rect(0, 172, w, 4, SHADOW, 0.2)
  rect(0, 176, w, 2, SHADOW, 0.08)
  // vùng nắng ấm trên vỉa hè (rộng, mờ)
  glow(60, 186, 150, 18, "#fff0b0", 3, 0.07)
  // bóng đổ của biển, xe, cột (rơi sang phải)
  rect(56, 174, 24, 2, SHADOW, 0.18)
  rect(310, 174, 10, 2, SHADOW, 0.18)
  return p.svg()
}

/* ------------------------------------------------------------------ công viên */
export function parkSVG({ STAGE_W, STAGE_H, GROUND_Y }) {
  /* Công viên buổi chiều: trời trong có mây, hàng cây + nhà xa mờ, mặt hồ lấp
     lánh nắng, lan can trắng, bãi cỏ có vệt nắng, hai cây lớn đổ bóng lốm đốm,
     đèn đường cổ, ghế đá, luống hoa, lối đi lát gạch. */
  const w = STAGE_W, h = STAGE_H
  const p = painter(w, h)
  const { rect, group, ellipse, glow, speck, bands, cells } = p
  const SHADOW = "#2a2c4c"
  const SUN = "#fff0b8"
  const rnd = seeded(7)

  /* trời + nắng + mây */
  bands(0, 0, w, [["#72aedc", 14], ["#8ac4e6", 14], ["#a6d6ee", 16], ["#c6e4ee", 18], ["#dcedea", 24]])
  glow(0, 0, 130, 80, SUN, 3, 0.08)
  cloud(p, 210, 22, 1)
  cloud(p, 120, 44, 0.6)
  cloud(p, 50, 18, 0.5)

  /* nhà xa mờ (xanh nhạt, ít tương phản) + hàng cây xa */
  const far = [[62, 76, 12], [80, 70, 14], [100, 64, 16], [122, 72, 12], [150, 62, 16], [170, 54, 20], [194, 68, 14], [212, 60, 18], [234, 70, 12]]
  for (const [bx, top, bw] of far) {
    rect(bx, top, bw, 96 - top, "#a8bcd6")
    rect(bx, top, 2, 96 - top, "#bccee4")
    rect(bx + bw - 2, top, 2, 96 - top, "#92a8c6")
    for (let wy = top + 6; wy < 90; wy += 8) cells("#c8d8ea", [[bx + 4, wy], [bx + bw - 6, wy]], 0.6)
  }
  for (let x = -8; x < w + 10; x += 20) {
    const r = 10 + Math.floor(rnd() * 4) * 2
    ellipse(x, 92, r + 4, r - 2, "#7ea27a")
    ellipse(x - 2, 90, r, r - 4, "#98b890")
  }
  rect(0, 94, w, 8, "#8cb06c")
  rect(0, 94, w, 2, "#a6c882")
  rect(0, 100, w, 2, "#5e8a58", 0.5)

  /* hồ: dải màu + gợn sóng + nắng lấp lánh + bóng cây dưới nước */
  bands(0, 102, w, [["#86bcd4", 8], ["#72aac6", 10], ["#5e98b8", 10], ["#4e86a8", 6]])
  for (let y = 106; y < 128; y += 4) {
    const n = 3 + Math.floor(rnd() * 3)
    for (let k = 0; k < n; k++) {
      const x = Math.floor(rnd() * 300)
      const len = 6 + Math.floor(rnd() * 5) * 2
      rect(x, y, len, 2, "#c4e2ee", 0.55)
      rect(x + 4, y + 2, len - 2, 2, "#356c8c", 0.3)
    }
  }
  for (let y = 106; y < 128; y += 4) {
    const x0 = 64 + Math.floor(rnd() * 40)
    rect(x0, y, 4 + Math.floor(rnd() * 3) * 2, 2, "#ffffff", 0.8)
    if (y % 8 === 2) rect(x0 + 12, y + 2, 4, 2, "#ffffff", 0.6)
  }
  for (const cx of [40, 296]) {
    for (let y = 104; y < 126; y += 2) {
      const wd = 8 + Math.floor(rnd() * 12) * 2
      rect(cx - wd / 2 + Math.floor(rnd() * 6) * 2, y, wd, 2, "#3f6e5a", y % 4 === 0 ? 0.32 : 0.2)
    }
  }

  /* lan can trắng + bờ kè đá */
  rect(0, 128, w, 2, "#fffaf0")
  rect(0, 130, w, 4, "#ece6d6")
  rect(0, 134, w, 2, "#b8ae98", 0.8)
  // dải cỏ ven hồ phía sau lan can
  rect(0, 136, w, 16, "#6d9a58")
  rect(0, 136, w, 2, "#a4c878")
  rect(0, 138, w, 2, SHADOW, 0.12)
  speck(0, 140, w, 12, "#4e7a4c", 40, 61, 0.6)
  speck(0, 140, w, 12, "#9cc474", 30, 62, 0.6)
  rect(0, 144, w, 2, "#d8d0bc", 0.0)
  for (let x = 6; x < w; x += 16) {
    rect(x, 126, 4, 26, "#e4dcc8")
    rect(x, 126, 2, 26, "#fffaf0")
    rect(x + 2, 128, 2, 24, "#b8ae98")
    rect(x - 2, 124, 8, 2, "#fffaf0")
    rect(x - 2, 126, 8, 2, "#d8d0bc")
  }
  rect(0, 152, w, 4, "#cdc4b0")
  rect(0, 152, w, 2, "#ece6d6")

  /* bãi cỏ: 3 dải, vệt nắng ấm, hạt cỏ */
  const GRASS = ["#aed07c", "#88ae62", "#668f58", "#486d4c"]
  rect(0, 156, w, 16, GRASS[1])
  rect(0, 158, w, 4, GRASS[0], 0.5)
  rect(0, 166, w, 6, GRASS[2], 0.4)
  rect(0, 156, w, 2, SHADOW, 0.16)
  speck(0, 158, w, 14, GRASS[0], 70, 71, 0.8, 2, 2)
  speck(0, 158, w, 14, GRASS[3], 46, 72, 0.55, 2, 2)
  speck(0, 158, w, 14, GRASS[0], 28, 73, 0.8, 2, 4)
  glow(120, 164, 150, 10, SUN, 3, 0.06)

  /* cây: thân vỏ sần + tán lá nhiều cụm sáng trên-trái */
  const BARK = ["#b08462", "#86604a", "#5e4238", "#3c2c2e"]
  const LEAF = ["#b0cf80", "#80a65e", "#5c8052", "#3e5f48"]
  const clump = (cx, cy, rx, ry) => {
    ellipse(cx, cy, rx, ry, LEAF[3])
    ellipse(cx - 2, cy - 2, rx - 4, ry - 4, LEAF[2])
    ellipse(cx - 4, cy - 4, rx - 8, Math.max(4, ry - 8), LEAF[1])
    if (rx - 14 > 2 && ry - 14 > 2) ellipse(cx - 7, cy - 7, rx - 14, ry - 14, LEAF[0])
    // lá lẻ: điểm sáng ở rìa trên-trái, điểm tối rìa dưới-phải
    const list = []
    for (let k = 0; k < 7; k++) list.push([cx - rx + 4 + Math.floor(rnd() * rx), cy - ry + 2 + Math.floor(rnd() * ry * 0.7)])
    cells(LEAF[0], list, 0.85)
    const dk = []
    for (let k = 0; k < 7; k++) dk.push([cx + 2 + Math.floor(rnd() * rx * 0.8), cy + ry * 0.2 + Math.floor(rnd() * ry * 0.7)])
    cells(LEAF[3], dk, 0.8)
    // rìa lá lởm chởm: nụ 2 px quanh chu vi (sáng ở trên-trái, tối ở dưới-phải)
    for (let a = 0; a < 6.28; a += 0.3) {
      const ex = cx + Math.cos(a) * (rx + 1)
      const ey = cy + Math.sin(a) * (ry + 1)
      const up = Math.cos(a) + Math.sin(a) < 0
      cells(up ? LEAF[1] : LEAF[3], [[ex - 1, ey - 1, 2 + Math.floor(rnd() * 2) * 2, 2]])
      if (up && rnd() < 0.5) cells(LEAF[0], [[ex + 1, ey + 1]])
    }
  }
  const trunk = (x, top, wd) => {
    for (let y = top; y < 168; y += 2) {
      const flare = y > 150 ? (y - 150) / 3 : 0
      const l = x - flare
      const ww = wd + flare * 2
      rect(l, y, ww, 2, BARK[1])
      rect(l, y, 4, 2, BARK[0])
      rect(l + ww - 4, y, 4, 2, BARK[2])
      rect(l + ww - 2, y, 2, 2, BARK[3], 0.6)
    }
    speck(x + 2, top + 8, wd - 4, 100, BARK[3], 14, x, 0.7, 2, 2)
    speck(x + 2, top + 8, wd - 4, 100, BARK[0], 8, x + 1, 0.8, 2, 2)
  }
  // bóng cây đổ xuống cỏ + lối đi (phải-dưới)
  ellipse(66, 164, 44, 5, SHADOW, 0.24)
  ellipse(80, 184, 54, 6, SHADOW, 0.14)
  ellipse(310, 164, 22, 4, SHADOW, 0.24)
  trunk(22, 52, 14)
  trunk(292, 50, 14)
  for (const [cx, cy, rx, ry] of [[6, 32, 34, 26], [34, 22, 28, 22], [54, 40, 28, 20], [20, 54, 30, 18], [-2, 58, 20, 14]]) clump(cx, cy, rx, ry)
  for (const [cx, cy, rx, ry] of [[312, 30, 36, 28], [284, 24, 28, 22], [270, 42, 24, 18], [302, 56, 28, 18]]) clump(cx, cy, rx, ry)

  /* đèn đường cổ giữa hai cây */
  const IRON = ["#6a7478", "#3c4448", "#262c30"]
  ellipse(168, 176, 14, 2, SHADOW, 0.22)
  rect(158, 160, 12, 12, IRON[1])
  rect(158, 160, 12, 2, IRON[0])
  rect(158, 160, 2, 12, IRON[0])
  rect(164, 80, 4, 80, IRON[1])
  rect(164, 80, 2, 80, IRON[0])
  rect(166, 80, 2, 80, IRON[2], 0.6)
  rect(160, 76, 12, 4, IRON[1])
  rect(158, 56, 16, 20, "#dfe8d0")
  rect(158, 56, 4, 20, "#fffbe0")
  rect(170, 56, 4, 20, "#b8c4a8")
  rect(158, 56, 16, 2, IRON[1])
  rect(158, 74, 16, 2, IRON[1])
  rect(156, 52, 20, 4, IRON[1])
  rect(160, 48, 12, 4, IRON[0])
  rect(164, 44, 4, 4, IRON[1])
  rect(164, 40, 4, 4, "#d8c070")

  /* ghế đá gỗ + sắt */
  const WOOD = ["#d8a674", "#b88056", "#8e5e44", "#5e3e3a"]
  const bench = (x) => {
    ellipse(x + 24, 172, 24, 2, SHADOW, 0.22)
    rect(x + 4, 160, 4, 10, IRON[1])
    rect(x + 4, 160, 2, 10, IRON[0])
    rect(x + 34, 160, 4, 10, IRON[1])
    rect(x + 34, 160, 2, 10, IRON[0])
    rect(x + 2, 168, 8, 2, IRON[2])
    rect(x + 32, 168, 8, 2, IRON[2])
    // lưng tựa + chỗ ngồi: hai ván + một ván
    for (const [yy, hh] of [[144, 4], [150, 4], [158, 4]]) {
      rect(x, yy, 44, hh, WOOD[1])
      rect(x, yy, 44, 2, WOOD[0])
      rect(x, yy + hh - 2, 44, 2, WOOD[2])
      rect(x + 42, yy, 2, hh, WOOD[3], 0.5)
    }
    rect(x + 2, 144, 4, 16, IRON[1])
    rect(x + 38, 144, 4, 16, IRON[1])
    rect(x + 2, 144, 2, 16, IRON[0])
    rect(x + 38, 144, 2, 16, IRON[0])
    rect(x, 162, 44, 2, SHADOW, 0.18)
  }
  bench(2)
  bench(268)

  /* luống hoa nhỏ */
  const bed = (x, wd, flowers) => {
    ellipse(x + wd / 2 + 2, 172, wd / 2 + 4, 2, SHADOW, 0.2)
    rect(x, 164, wd, 8, "#6e4a3c")
    rect(x, 164, wd, 2, "#9a6e50")
    rect(x + wd - 2, 166, 2, 6, "#4a3030")
    for (let fx = x + 2, i = 0; fx + 4 <= x + wd - 2; fx += 4, i++) {
      cells("#4f8248", [[fx, 160 + (i % 2) * 2, 2, 6]])
      cells(flowers[i % flowers.length], [[fx - 2 + (i % 2) * 2, 158 + (i % 3) * 2, 4, 4]])
      cells("#ffffff", [[fx - 2 + (i % 2) * 2, 158 + (i % 3) * 2, 2, 2]], 0.35)
    }
  }
  bed(98, 24, ["#ec8aa4", "#f4e08a", "#f6f0e4"])
  bed(224, 28, ["#c58ad2", "#f4e08a", "#ec8aa4"])

  /* lá rơi nhẹ giữa không trung (nhấp nháy) */
  group("scn-rain", () => {
    cells("#9cc060", [[58, 70], [72, 94], [254, 76], [270, 106], [124, 100], [190, 84]])
    cells("#c8d878", [[60, 70], [256, 76]], 0.8)
  })

  /* lối đi lát gạch, bóng cây lốm đốm */
  const PATH = ["#e4dcc6", "#d4cab2", "#bbb09a", "#9c9482"]
  rect(0, GROUND_Y, w, h - GROUND_Y, PATH[1])
  for (let row = 0; row < 2; row++) {
    const y0 = GROUND_Y + row * 14
    const off = row ? 10 : 0
    const r2 = seeded(120 + row)
    for (let x = -off; x < w; x += 20) {
      const t = r2()
      rect(x, y0, 20, 14, t < 0.3 ? PATH[0] : t < 0.75 ? PATH[1] : "#c8bea6")
      rect(x, y0, 20, 2, "#ffffff", 0.14)
      rect(x + 18, y0, 2, 14, PATH[2])
    }
    rect(0, y0 + 12, w, 2, PATH[2])
  }
  rect(0, 170, w, 2, "#e8e0cc")
  rect(0, 172, w, 4, SHADOW, 0.2)
  rect(0, 176, w, 2, SHADOW, 0.08)
  // vệt nắng + bóng lá lốm đốm trên lối đi
  glow(200, 190, 130, 14, SUN, 3, 0.07)
  const dap = seeded(333)
  for (let k = 0; k < 26; k++) {
    const x = 6 + Math.floor(dap() * 140)
    const y = 176 + Math.floor(dap() * 20)
    rect(x, y, 2 + Math.floor(dap() * 3) * 2, 2, SHADOW, 0.13)
  }
  for (let k = 0; k < 12; k++) {
    const x = 6 + Math.floor(dap() * 140)
    const y = 176 + Math.floor(dap() * 20)
    rect(x, y, 2, 2, SUN, 0.28)
  }
  return p.svg()
}

/* ------------------------------------------------------------------ quán trà sữa */
export function cafeSVG({ STAGE_W, STAGE_H, GROUND_Y }) {
  /* Quán trà sữa buổi tối: tường hồng kem + ốp gạch men xanh bạc hà, quầy gỗ nan
     có ly trà sữa, bảng menu phấn, đèn dây ấm chiếu sáng cả quán, cửa kính nhìn ra
     phố chạng vạng có biển neon, bàn nhỏ + ghế đẩu, sàn gạch caro bóng. */
  const w = STAGE_W, h = STAGE_H
  const p = painter(w, h)
  const { rect, group, ellipse, glow, trap, speck, bands, lit, cells } = p
  const WALL = ["#f0d2c2", "#e0b8a8", "#c09488", "#9a7886"]
  const MINT = ["#c4e2d2", "#a4cab8", "#84ad9c", "#648c7e"]
  const WOOD = ["#d49468", "#aa6c4c", "#84503f", "#5a3a3a"]
  const SHADOW = "#35223e"
  const WARM = "#ffd68a"
  const rnd = seeded(5)

  /* tường hồng + vân vữa */
  rect(0, 0, w, 100, WALL[1])
  speck(0, 0, w, 100, WALL[2], 50, 3, 0.25)
  speck(0, 0, w, 100, WALL[0], 50, 4, 0.45)
  /* ốp gạch men subway bạc hà: mạch ngang + mạch dọc so le */
  rect(0, 100, w, 72, MINT[1])
  for (let row = 0; row < 9; row++) {
    const y = 100 + row * 8
    rect(0, y + 2, w, 2, MINT[0], 0.35)
    rect(0, y, w, 2, MINT[3], 0.5)
    const list = []
    for (let x = row % 2 ? 8 : 0; x < w; x += 16) list.push([x, y + 2, 2, 6])
    p.cells(MINT[3], list, 0.45)
  }
  rect(0, 96, w, 6, "#e8cfc0")
  rect(0, 96, w, 2, "#fbeee2")
  rect(0, 100, w, 2, "#b79484")
  rect(0, 102, w, 4, SHADOW, 0.2)
  rect(0, 106, w, 2, SHADOW, 0.1)

  /* ánh đèn dây ấm chiếu lên tường */
  glow(160, 14, 190, 70, WARM, 5, 0.06)

  /* bảng menu phấn trên quầy */
  rect(30, 24, 112, 52, SHADOW, 0.18)
  lit(26, 18, 112, 52, ["#c68a62", "#9a603f", "#744638", "#4a2f34"])
  rect(30, 22, 104, 44, "#2c3b38")
  rect(30, 22, 104, 2, "#1c2826")
  rect(30, 22, 2, 44, "#1c2826")
  rect(30, 56, 104, 10, "#34453f", 0.5)
  speck(32, 24, 100, 40, "#506a60", 14, 17, 0.22, 4, 2)
  // tiêu đề + dòng món + giá bằng nét phấn
  rect(60, 26, 44, 2, "#f6ecd4")
  rect(66, 30, 32, 2, "#f6ecd4", 0.7)
  cells("#f4a6b8", [[36, 26], [38, 28], [40, 30], [42, 28], [44, 26], [38, 26]])
  rect(38, 32, 4, 6, "#f6ecd4")
  for (const [dy, dw] of [[40, 44], [46, 34], [52, 48], [58, 38]]) {
    rect(38, dy, dw, 2, "#e8ddc4", 0.9)
    rect(108, dy, 18, 2, "#f4d68a")
  }
  cells("#f4a6b8", [[110, 60]])
  rect(28, 66, 108, 2, SHADOW, 0.2)
  // dây treo bảng
  rect(40, 12, 2, 8, "#3a2e34")
  rect(122, 12, 2, 8, "#3a2e34")

  /* cửa kính nhìn ra phố chạng vạng (phải) */
  rect(212, 28, 98, 142, "#4a3034")
  rect(212, 28, 98, 2, "#8a6450")
  rect(212, 28, 2, 142, "#8a6450")
  rect(308, 30, 2, 140, "#2c2028")
  // trời tím xanh → cam chân trời
  bands(218, 34, 86, [
    ["#27406a", 14],
    ["#3d5a8a", 12],
    ["#68689a", 12],
    ["#b87c78", 8],
    ["#e29a6c", 8],
  ])
  // dãy nhà đối diện (tối) + ô cửa sáng
  const opp = [[218, 78, 14], [232, 70, 16], [248, 82, 12], [260, 66, 18], [278, 76, 14], [292, 72, 12]]
  for (const [bx, top, bw] of opp) {
    rect(bx, top, bw, 124 - top, "#242a52")
    rect(bx, top, bw, 2, "#3a3a68")
  }
  cells("#f6cf7c", [[222, 90], [226, 98], [238, 82], [242, 90], [252, 96], [266, 80], [270, 90], [282, 88], [296, 86], [298, 96], [238, 102], [270, 104]])
  // đường phố tối + hai cột đèn đường (đầu đèn ấm, quầng nhỏ)
  rect(218, 124, 86, 34, "#222744")
  rect(218, 124, 86, 2, "#3a3c68")
  rect(218, 132, 86, 2, "#2e3358", 0.7)
  for (const lx of [238, 288]) {
    rect(lx, 100, 2, 28, "#1a1e3c")
    rect(lx - 2, 98, 6, 2, "#1a1e3c")
    rect(lx - 2, 100, 6, 2, "#ffd88a")
    ellipse(lx + 1, 104, 10, 6, "#ffc468", 0.16)
    ellipse(lx + 1, 104, 5, 3, "#ffd88a", 0.2)
    ellipse(lx + 1, 128, 8, 2, "#ffc468", 0.2)
  }
  cells("#ff9ab8", [[256, 136], [262, 138]], 0.7)
  // thanh dọc + thanh ngang cửa kính
  rect(258, 34, 4, 124, "#4a3034")
  rect(258, 34, 2, 124, "#8a6450")
  rect(218, 96, 86, 4, "#4a3034")
  rect(218, 96, 86, 2, "#8a6450")
  // vệt phản chiếu
  trap(222, 38, 4, 262, 92, 4, "#ffffff", 0.0)
  cells("#ffffff", [[224, 38], [226, 40], [228, 42], [230, 44], [232, 46], [234, 48], [236, 50], [238, 52], [240, 54], [242, 56], [244, 58], [246, 60]], 0.1)
  cells("#ffffff", [[270, 104], [272, 106], [274, 108], [276, 110], [278, 112], [280, 114], [282, 116], [284, 118]], 0.1)
  // biển neon hình ly (trong kính)
  rect(228, 46, 16, 2, "#ff86b0")
  rect(230, 48, 2, 14, "#ff86b0")
  rect(240, 48, 2, 14, "#ff86b0")
  rect(232, 62, 8, 2, "#ff86b0")
  rect(238, 38, 2, 8, "#ffb8d0")
  rect(234, 52, 4, 4, "#ffd0e0")
  group("scn-screen", () => {
    glow(236, 54, 22, 18, "#ff7aa8", 3, 0.07)
  })
  // chân kính gỗ + bệ cửa sổ có chậu cây nhỏ
  rect(212, 158, 98, 12, "#6a4a40")
  rect(212, 158, 98, 2, "#a07a60")
  rect(212, 168, 98, 2, "#3e2c2e")
  rect(218, 156, 86, 2, SHADOW, 0.0)
  rect(224, 148, 10, 8, "#c4584c")
  rect(224, 148, 10, 2, "#e8806c")
  cells("#5f8a46", [[224, 142], [228, 140], [232, 144], [226, 144]])
  rect(222, 138, 14, 6, "#6f9a4e")
  rect(222, 138, 6, 2, "#98c070")
  // ánh phố lạnh hắt xuống sàn (nhạt)
  trap(216, 172, 90, 150, 200, 110, "#8aa0e0", 0.05)

  /* quầy gỗ nan: mặt đá trắng + thân nan 3 sắc + gờ chân */
  rect(160, 108, 4, 64, SHADOW, 0.14)
  lit(8, 104, 146, 6, ["#ffffff", "#f4eee6", "#cfc3bd", "#a89a98"])
  rect(10, 110, 142, 4, SHADOW, 0.32)
  rect(10, 114, 142, 2, SHADOW, 0.14)
  for (let x = 8; x < 152; x += 6) {
    rect(x, 110, 6, 56, WOOD[1])
    rect(x, 110, 2, 56, WOOD[0])
    rect(x + 4, 110, 2, 56, WOOD[2])
    if (x % 18 === 8) speck(x, 116, 6, 46, WOOD[3], 3, x, 0.5, 2, 2)
  }
  rect(8, 110, 144, 4, SHADOW, 0.3)
  rect(8, 166, 146, 6, WOOD[3])
  rect(8, 166, 146, 2, WOOD[2])
  rect(150, 104, 4, 68, WOOD[3], 0.5)

  /* ly trà sữa trên quầy + máy hàn ly */
  const cup = (x, liquid, top, dy = 0) => {
    rect(x + 6, 80 + dy, 2, 8, "#e8d4c0") // ống hút
    rect(x + 6, 80 + dy, 2, 2, "#f4a6b8")
    rect(x - 1, 86 + dy, 10, 2, "#f6f0ea") // nắp
    rect(x, 88 + dy, 8, 14, "#eef4f4") // thân trong
    rect(x, 88 + dy, 2, 14, "#ffffff")
    rect(x + 6, 90 + dy, 2, 12, "#c6d4d6")
    rect(x + 1, 92 + dy, 6, 10, liquid)
    rect(x + 1, 92 + dy, 2, 10, top)
    rect(x + 1, 100 + dy, 6, 2, "#4a3030")
    cells("#4a3030", [[x + 2, 98 + dy], [x + 4, 100 + dy]])
    rect(x, 102 + dy, 8, 2, SHADOW, 0.16)
  }
  cup(18, "#d8b080", "#f0d6b0")
  cup(32, "#f0a0b4", "#ffc4d0")
  cup(46, "#a8d4b0", "#c8ecd0")
  cup(60, "#d8b080", "#f0d6b0")
  rect(110, 84, 36, 20, "#b8c0c8")
  rect(110, 84, 36, 2, "#e8eef2")
  rect(110, 84, 2, 20, "#e8eef2")
  rect(144, 86, 2, 18, "#8a929c")
  rect(114, 92, 12, 12, "#2c3038")
  rect(114, 92, 12, 2, "#4a505a")
  rect(130, 90, 12, 8, "#d8707a")
  rect(130, 90, 12, 2, "#f0929a")
  rect(134, 94, 4, 2, "#ffe9a0")
  group("scn-steam", () => {
    cells("#fff6ec", [[116, 78], [118, 74]], 0.7)
    cells("#fff6ec", [[124, 80], [126, 76]], 0.5)
  })

  /* bàn tròn nhỏ + ghế đẩu hồng (thấp) */
  ellipse(188, 174, 22, 3, SHADOW, 0.22)
  rect(168, 152, 36, 4, "#f4eee6")
  rect(168, 152, 36, 2, "#ffffff")
  rect(170, 156, 32, 2, "#bfb3a8")
  rect(186, 158, 4, 12, "#6a6470")
  rect(186, 158, 2, 12, "#9a94a0")
  rect(178, 170, 20, 2, "#5a5460")
  rect(178, 170, 20, 2, "#8a8490", 0.0)
  cup(172, "#f0a0b4", "#ffc4d0", 48)
  cup(188, "#d8b080", "#f0d6b0", 48)
  rect(172, 138, 2, 2, "#ffffff", 0.0)
  const stool = (x) => {
    rect(x + 2, 164, 2, 8, "#8a4a5a")
    rect(x + 14, 164, 2, 8, "#6a3a4a")
    rect(x, 158, 18, 6, "#e090a4")
    rect(x, 158, 18, 2, "#ffb8c8")
    rect(x, 158, 2, 6, "#ffb8c8")
    rect(x + 16, 160, 2, 4, "#b86478")
    rect(x + 2, 162, 14, 2, "#b86478")
    rect(x + 4, 168, 10, 2, "#6a3a4a", 0.7)
  }
  stool(152)
  stool(204)
  rect(154, 172, 24, 4, SHADOW, 0.14)
  rect(206, 172, 24, 4, SHADOW, 0.14)

  /* sàn gạch caro bóng, phản chiếu đèn dây */
  rect(0, GROUND_Y, w, h - GROUND_Y, "#cfb89c")
  for (let row = 0; row < 2; row++) {
    const y0 = GROUND_Y + row * 14
    for (let i = 0; i * 20 < w; i++) {
      const dark = (i + row) % 2
      rect(i * 20, y0, 20, 14, dark ? "#c9a58a" : "#d9c4a8")
      rect(i * 20, y0, 20, 2, "#ffffff", dark ? 0.08 : 0.16)
      rect(i * 20 + 18, y0, 2, 14, "#a07c68", 0.6)
    }
    rect(0, y0 + 12, w, 2, "#a07c68", 0.6)
  }
  ellipse(130, 188, 130, 12, WARM, 0.08)
  ellipse(130, 188, 86, 8, WARM, 0.08)
  rect(0, 172, w, 4, SHADOW, 0.2)
  rect(0, 176, w, 2, SHADOW, 0.08)
  // bóng quầy + bàn lên sàn
  rect(8, 172, 160, 4, SHADOW, 0.18)
  rect(168, 172, 44, 4, SHADOW, 0.14)

  /* đèn dây: dây võng 3 nhịp + bóng nhiều màu + quầng sáng nhấp nháy */
  const hooks = [0, 106, 214, 318]
  const bulbs = []
  hooks.slice(0, -1).forEach((hx, k) => {
    const x1 = hooks[k + 1]
    wire(p, hx, x1, 8, 8, 10, "#3a2e34")
    for (let x = hx + 10; x < x1 - 4; x += 12) {
      const t = (x - hx) / (x1 - hx)
      bulbs.push([x, Math.round(8 + 10 * 4 * t * (1 - t)) + 2])
    }
  })
  const BC = [["#ffe9a8", "#fff7d6"], ["#ffb8a0", "#ffd8c8"], ["#fff2c0", "#ffffff"], ["#b8e8c4", "#e0fff0"]]
  bulbs.forEach(([bx, by], i) => {
    const [c, hi] = BC[i % 4]
    rect(bx, by, 4, 2, "#3a2e34")
    rect(bx, by + 2, 4, 6, c)
    rect(bx, by + 2, 2, 4, hi)
    rect(bx + 2, by + 6, 2, 2, "#d8a060", 0.5)
  })
  group("scn-screen", () => {
    bulbs.forEach(([bx, by], i) => ellipse(bx + 2, by + 4, 10, 8, BC[i % 4][0], 0.12))
  })
  trap(0, 24, 320, 0, 100, 320, WARM, 0.0)
  vignette(p, w, GROUND_Y, SHADOW, { l: 46, r: 30, t: 0, o: 0.14 })
  return p.svg()
}
