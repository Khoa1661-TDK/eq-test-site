/* environmentsMore.js — bốn bối cảnh pixel chi tiết (căng-tin, hành lang, phòng
   ngủ buổi tối, thư viện) cho cảnh tình huống EQ, vẽ lại cho khớp nhân vật độ
   phân giải cao (hifi/characterKit.js). Cùng chữ ký như environments.js: mỗi hàm
   trả về chuỗi <svg class="scn-env__svg"> khung STAGE_W × STAGE_H, mặt sàn ở
   GROUND_Y.

   Quy ước vẽ (cùng lưới với nhân vật: ô 2 điểm ảnh):
   - Mọi toạ độ và kích thước đều CHẴN (lưới 2 px). Chỉ dùng <rect> và <path> gồm
     các ô vuông 2 px; không dùng nét viền hay đường cong thật.
   - Ánh sáng ấm duy nhất từ TRÊN-TRÁI (cửa sổ, đèn): cạnh trên/trái của vật sáng,
     cạnh dưới/phải tối, bóng đổ rơi sang phải-xuống. Mỗi chất liệu có thang 4 sắc
     (sáng, nền, tối, sâu) trong RAMP; chuyển sắc bằng các dải/bậc thang 2 px.
   - Bóng tường–sàn và bóng đổ của đồ vật là các dải mờ nửa trong suốt chồng lên
     sàn nên hoa văn gạch/ván vẫn thấy qua.
   - Chỗ giữa cảnh (x 20–300, y 70–186) giữ yên, độ tương phản và độ bão hoà thấp
     hơn nhân vật để người và bong bóng thoại nổi lên.
   Chuyển động phụ chỉ qua class scn-* trên nhóm <g> (steam, screen, clock, rain).
   Hàm thuần, không DOM. */

/* Bộ sinh số giả ngẫu nhiên có hạt giống: cùng đầu vào luôn ra cùng một bức tranh. */
function seeded(seed) {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
}

const ev = (n) => Math.round(n / 2) * 2

/* trộn hai màu #rrggbb (t = 0..1 về phía b) để tạo sắc sáng/tối cho từng gáy sách */
function mix(a, b, t) {
  const p = (s) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16))
  const [ar, ag, ab] = p(a), [br, bg, bb] = p(b)
  const c = (x, y) => Math.round(x + (y - x) * t).toString(16).padStart(2, "0")
  return `#${c(ar, br)}${c(ag, bg)}${c(ab, bb)}`
}

/* Bảng 4 sắc cho từng chất liệu: [sáng, nền, tối, sâu]. Giữ nhạt hơn nhân vật. */
const RAMP = {
  wall: ["#f0ebdc", "#e5dfcd", "#d5ceb8", "#bfb79f"],
  wood: ["#bf9a6e", "#a07a56", "#7f5f43", "#5d4533"],
  woodDk: ["#94714f", "#775a40", "#5d4632", "#443224"],
  steel: ["#dbe0e3", "#b3bcc4", "#868f9b", "#5f6975"],
  slate: ["#5d6773", "#4a5460", "#3a424d", "#2b313a"],
  brick: ["#dc9580", "#c0705c", "#98503f", "#6e3733"],
  linen: ["#fbf7ec", "#f0eadb", "#d9d2bd", "#b7af98"],
  board: ["#52735e", "#406049", "#314c3a", "#243a2b"],
  tile: ["#ddd6c1", "#d0c9b3", "#bdb59d", "#a59d86"],
  sage: ["#cad2b5", "#b9c3a2", "#a2ad8b", "#8a9674"],
  leaf: ["#8da362", "#708848", "#54692f", "#3d4f27"],
  sky: ["#f6e9b4", "#ecd99c", "#dfc582", "#cdb06a"],
  navy: ["#4d6798", "#37507f", "#283c64", "#1b2a4a"],
  blue: ["#7ba3b9", "#5b869f", "#436b84", "#31506a"],
}
const INK = "#2f2a2a" /* nét tối nhất của phông: mềm hơn nét viền nhân vật */
const SHADOW = "#3b2e2a" /* bóng đổ ấm trên sàn/tường */
const SUN = "#fff1bd" /* nắng ấm */

/* Bộ vẽ chung: gom thẻ vào mảng r rồi bọc thành <svg>. */
function painter(w, h) {
  const r = []
  const rect = (x, y, wd, ht, fill, extra = "") =>
    r.push(`<rect x="${x}" y="${y}" width="${wd}" height="${ht}" fill="${fill}"${extra ? ` ${extra}` : ""}/>`)
  const tone = (x, y, wd, ht, fill, op) => rect(x, y, wd, ht, fill, `fill-opacity="${op}"`)
  const group = (cls, draw) => {
    r.push(`<g class="${cls}">`)
    draw()
    r.push("</g>")
  }
  const solid = (path, fill, op) =>
    r.push(`<path d="${path}" fill="${fill}"${op < 1 ? ` fill-opacity="${op}"` : ""}/>`)
  // vẽ bitmap chữ '#' theo hàng, gộp các điểm liền nhau thành một rect (ô 2 px)
  const pix = (x, y, rows, fill, s = 2) => {
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
  /* thớ gỗ / vân vải: các nét ngang 2 px dài ngắn ngẫu nhiên (hạt giống cố định) */
  const grain = (x, y, wd, ht, fill, seed, { gap = [6, 20], len = [4, 14], skip = 0.35, op = 1, step = 4 } = {}) => {
    const rnd = seeded(seed)
    let d = ""
    for (let yy = y; yy < y + ht; yy += step) {
      if (rnd() < skip) continue
      let xx = x + ev(rnd() * gap[1])
      while (xx < x + wd - 2) {
        const l = ev(len[0] + rnd() * (len[1] - len[0]))
        const l2 = Math.max(2, Math.min(l, x + wd - xx))
        d += `M${xx} ${yy}h${l2}v2h${-l2}z`
        xx += l2 + ev(gap[0] + rnd() * (gap[1] - gap[0]))
      }
    }
    if (d) solid(d, fill, op)
  }
  /* quầng sáng bậc thang: các elip dải 2 px chồng nhau, mỗi lớp nhỏ dần và đậm dần */
  const halo = (cx, cy, rx, ry, fill, op, steps = 3) => {
    for (let s = 0; s < steps; s++) {
      const k = 1 - (s / steps) * 0.62
      const rrx = rx * k, rry = ry * k
      let d = ""
      let prev = null
      const rows = []
      for (let dy = -ev(rry); dy < ev(rry); dy += 2) {
        const t = (dy + 1) / rry
        const hw = ev(rrx * Math.sqrt(Math.max(0, 1 - t * t)))
        const y0 = cy + dy
        if (prev && prev.hw === hw) prev.h += 2
        else rows.push((prev = { hw, y: y0, h: 2 }))
      }
      for (const rw of rows) {
        const x0 = Math.max(0, cx - rw.hw)
        const x1 = Math.min(w, cx + rw.hw)
        const y0 = Math.max(0, rw.y)
        const y1 = Math.min(h, rw.y + rw.h)
        if (x1 > x0 && y1 > y0) d += `M${x0} ${y0}h${x1 - x0}v${y1 - y0}h${x0 - x1}z`
      }
      if (d) solid(d, fill, op)
    }
  }
  /* khối phẳng có cạnh sáng trên/trái và cạnh tối dưới/phải theo thang 4 sắc */
  const slab = (x, y, wd, ht, ramp, { lit = 2, sh = 2, left = true, deep = false } = {}) => {
    rect(x, y, wd, ht, ramp[1])
    rect(x, y, wd, lit, ramp[0])
    if (left) rect(x, y, lit, ht, ramp[0])
    rect(x, y + ht - sh, wd, sh, ramp[2])
    rect(x + wd - sh, y, sh, ht, ramp[2])
    if (deep) rect(x, y + ht - 2, wd, 2, ramp[3])
  }
  /* đĩa tròn pixel quanh MỘT ô tâm 2×2 tại (cx, cy) (cx, cy chẵn); rc = bán kính tính bằng ô */
  const cdisc = (cx, cy, rc, fill) => {
    for (let j = -rc; j <= rc; j++) {
      const hw = Math.round(Math.sqrt(rc * rc + 0.4 - j * j))
      rect(cx - hw * 2, cy + j * 2, (hw * 2 + 1) * 2, 2, fill)
    }
  }
  /* mảng nắng chiếu xiên xuống sàn: hình bình hành bậc thang (mỗi dòng 2 px lệch sang phải) */
  const sunPatch = (x, y, wd, ht, slant, fill, op) => {
    let d = ""
    for (let j = 0; j < ht; j += 2) {
      const sx = x + ev((j / ht) * slant)
      d += `M${sx} ${y + j}h${wd}v2h${-wd}z`
    }
    solid(d, fill, op)
  }
  /* bóng đổ của đồ vật đứng trên sàn: dải mờ dưới chân, lệch sang phải theo ánh sáng trên-trái */
  const castShadow = (x0, x1, footY, { depth = 8, shift = 8, op = 0.2 } = {}) => {
    tone(x0, footY - 2, x1 - x0 + 2, 4, SHADOW, op)
    tone(x0 + 2, footY + 2, x1 - x0 + shift, depth - 2, SHADOW, op * 0.65)
    tone(x0 + 6, footY + depth, x1 - x0 + shift + 2, 2, SHADOW, op * 0.35)
  }
  const svg = () =>
    `<svg class="scn-env__svg" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" aria-hidden="true">${r.join("")}</svg>`
  return { rect, tone, group, solid, pix, grain, halo, slab, cdisc, sunPatch, castShadow, svg }
}

/* ------------------------------------------------------------------ căng-tin */
export function canteenSVG({ STAGE_W, STAGE_H, GROUND_Y }) {
  /* Căng-tin: tường kem trên – ốp gạch men xanh lá nhạt dưới, hai cửa sổ nắng bên trái
     (nguồn sáng ấm), bảng thực đơn phấn, quầy cơm bên phải có mái hiên sọc + nồi bốc
     khói + chồng khay, hai bàn dài với ghế băng, sàn gạch caro, hai đèn thả. */
  const w = STAGE_W, h = STAGE_H
  const { rect, tone, group, solid, grain, halo, slab, sunPatch, castShadow, svg } = painter(w, h)
  const WL = RAMP.wall, WD = RAMP.wood, ST = RAMP.steel, SL = RAMP.slate
  const SG = RAMP.sage, TL = RAMP.tile, BL = RAMP.board, BR = RAMP.brick, LN = RAMP.linen

  /* ---- tường: kem, tối dần lên trần và về phía quầy; quầng nắng quanh cửa sổ */
  rect(0, 0, w, 100, WL[1])
  rect(0, 0, w, 4, WL[2])
  tone(0, 4, w, 2, WL[2], 0.7)
  tone(0, 6, w, 2, WL[2], 0.4)
  tone(0, 8, w, 2, WL[2], 0.2)
  halo(62, 58, 112, 76, SUN, 0.1, 3)
  tone(172, 10, 44, 90, SHADOW, 0.03)
  tone(192, 10, 24, 90, SHADOW, 0.03)
  tone(206, 10, 10, 90, SHADOW, 0.03)

  /* ---- ốp gạch men xanh lá nhạt 16×16, mép trên sáng, mạch vữa tối một bậc */
  rect(0, 100, w, 66, SG[1])
  let hl = "", gr = ""
  for (let row = 0; row < 4; row++) {
    const y = 100 + row * 16
    for (let col = 0; col < 20; col++) hl += `M${col * 16} ${y}h14v2h-14z`
    gr += `M0 ${y + 14}h${w}v2h${-w}z`
  }
  for (let col = 0; col < 20; col++) gr += `M${col * 16 + 14} 100h2v64h-2z`
  solid(hl, SG[0], 0.9)
  solid(gr, SG[2], 1)
  // gờ trên của ốp gạch + bóng nó đổ lên gạch
  rect(0, 96, w, 2, "#dde3cb")
  rect(0, 98, w, 2, SG[3])
  tone(0, 100, w, 2, SHADOW, 0.14)
  // chân tường
  rect(0, 164, w, 8, SG[2])
  rect(0, 164, w, 2, SG[0])
  rect(0, 170, w, 2, SG[3])

  /* ---- sàn gạch caro 28×14 */
  rect(0, GROUND_Y, w, h - GROUND_Y, TL[1])
  for (let row = 0; row < 2; row++)
    for (let i = 0; i * 28 < w; i++)
      if ((i + row) % 2) rect(i * 28, GROUND_Y + row * 14, Math.min(28, w - i * 28), 14, TL[0])
  let fg = "", fh = ""
  for (let x = 0; x < w; x += 28) fg += `M${x + 26} 172h2v28h-2z`
  fg += `M0 184h${w}v2h${-w}z`
  for (let row = 0; row < 2; row++) for (let i = 0; i * 28 < w; i++) fh += `M${i * 28} ${174 + row * 14}h24v2h-24z`
  solid(fh, "#efe9d6", 0.55)
  solid(fg, TL[2], 1)
  // bóng tường–sàn
  tone(0, 172, w, 4, SHADOW, 0.26)
  tone(0, 176, w, 4, SHADOW, 0.13)
  tone(0, 180, w, 2, SHADOW, 0.06)

  /* ---- hai cửa sổ nắng + mảng nắng hắt xuống sàn */
  const windowPane = (x, y, wd, ht, seed) => {
    const gx = x + 4, gy = y + 4, gw = wd - 8, gh = ht - 8
    // khung sơn trắng ngà
    slab(x, y, wd, ht, ["#f6f1e1", "#e6dfca", "#c3baa0", "#9f967f"], { lit: 2, sh: 2 })
    // kính: trời nắng ấm
    rect(gx, gy, gw, gh, RAMP.sky[1])
    rect(gx, gy, gw, 14, RAMP.sky[0])
    rect(gx, gy + 14, gw, 6, "#f1e1a6")
    // dải cây ngoài sân: đường viền gồ ghề, mép trên-trái sáng
    const prof = [8, 10, 14, 12, 16, 12, 10, 12, 8, 10]
    const nCols = Math.ceil(gw / 4)
    for (let c = 0; c < nCols; c++) {
      const ph = prof[(c + seed) % prof.length]
      const cx = gx + c * 4
      const cw = Math.min(4, gx + gw - cx)
      rect(cx, gy + gh - ph, cw, ph, RAMP.leaf[2])
      rect(cx, gy + gh - ph, cw, 2, RAMP.leaf[1])
    }
    // mặt trời loang trên lá (nhấp nháy rất nhẹ)
    group("scn-rain", () => {
      for (let c = 1; c < nCols; c += 2) {
        const ph = prof[(c + seed) % prof.length]
        rect(gx + c * 4, gy + gh - ph + 4, 2, 2, RAMP.leaf[0])
        if (c % 4 === 1) rect(gx + c * 4 - 2, gy + gh - ph + 8, 2, 2, RAMP.leaf[1])
      }
    })
    // thanh dọc + ngang (2 sắc: trái sáng, phải tối)
    const mx = x + wd / 2 - 2, my = y + 30
    rect(mx, gy, 4, gh, "#e6dfca")
    rect(mx, gy, 2, gh, "#f6f1e1")
    rect(mx + 2, gy, 2, gh, "#c3baa0")
    rect(gx, my, gw, 4, "#e6dfca")
    rect(gx, my, gw, 2, "#f6f1e1")
    rect(gx, my + 2, gw, 2, "#c3baa0")
    // bóng thành cửa trên kính + vệt loá chéo
    tone(gx, gy, gw, 2, SHADOW, 0.14)
    tone(gx, gy, 2, gh, SHADOW, 0.08)
    for (let k = 0; k < 5; k++) rect(gx + 4 + k * 2, gy + 14 - k * 2, 4, 2, "#fffaf0", `fill-opacity="0.7"`)
    // bệ cửa + bóng dưới bệ
    rect(x - 4, y + ht, wd + 8, 2, "#f6f1e1")
    rect(x - 4, y + ht + 2, wd + 8, 2, "#d3cab0")
    tone(x - 2, y + ht + 4, wd + 8, 4, SHADOW, 0.13)
    tone(x, y + ht + 8, wd + 6, 2, SHADOW, 0.06)
  }
  windowPane(16, 24, 40, 54, 0)
  windowPane(64, 24, 40, 54, 4)
  // nắng rơi xuống sàn, lệch sang phải theo chiều ánh sáng
  sunPatch(34, 174, 26, 26, 14, SUN, 0.34)
  sunPatch(82, 174, 26, 26, 14, SUN, 0.34)

  /* ---- bảng thực đơn phấn (giữa) */
  slab(118, 20, 88, 48, WD)
  grain(120, 22, 84, 44, WD[2], 11, { op: 0.5, step: 6 })
  rect(122, 24, 80, 40, BL[1])
  rect(122, 24, 80, 2, BL[3])
  rect(122, 24, 2, 40, BL[2])
  sunPatch(126, 26, 14, 36, 10, "#e3f3e0", 0.08)
  sunPatch(150, 26, 8, 36, 10, "#e3f3e0", 0.06)
  tone(132, 54, 44, 4, LN[1], 0.05)
  // tiêu đề + bốn món (tên) + giá, dòng chấm dẫn
  rect(146, 28, 32, 2, "#ebe5d0")
  rect(140, 28, 2, 2, "#ebe5d0")
  rect(182, 28, 2, 2, "#ebe5d0")
  let dots = ""
  for (const [dy, dw] of [[36, 38], [42, 28], [48, 44], [54, 32]]) {
    rect(128, dy, dw, 2, "#e9e3ce")
    rect(178, dy, 18, 2, "#e8d99c")
    for (let x = 128 + dw + 4; x < 174; x += 4) dots += `M${x} ${dy}h2v2h-2z`
  }
  solid(dots, "#e9e3ce", 0.4)
  // khay phấn + viên phấn
  rect(116, 68, 92, 2, WD[0])
  rect(116, 70, 92, 2, WD[2])
  rect(126, 66, 6, 2, "#f6f1e1")
  rect(136, 66, 4, 2, "#e8d99c")
  // bóng bảng đổ lên tường (rơi sang phải-xuống)
  tone(208, 24, 4, 48, SHADOW, 0.13)
  tone(122, 72, 90, 4, SHADOW, 0.13)

  /* ---- quầy cơm bên phải */
  // khung hộc bếp + mặt trong ốp gạch men tối
  rect(214, 16, 106, 86, WD[2])
  rect(214, 16, 2, 86, WD[1])
  rect(220, 36, 96, 62, "#69747f")
  for (let y = 46; y < 98; y += 8) rect(220, y, 96, 2, "#5b6671")
  for (let y = 38, k = 0; y < 98; y += 8, k++)
    for (let x = 220 + (k % 2) * 8; x < 316; x += 16) rect(x, y, 2, 8, "#5b6671")
  tone(220, 36, 2, 62, SHADOW, 0.1)
  // tối dần dưới mái hiên
  tone(220, 36, 96, 4, "#1f242c", 0.3)
  tone(220, 40, 96, 4, "#1f242c", 0.16)
  tone(220, 44, 96, 4, "#1f242c", 0.07)
  // giá treo muỗng + vá
  rect(228, 46, 42, 2, ST[2])
  for (const [x, len] of [[232, 12], [244, 10], [256, 14]]) {
    rect(x, 48, 2, len, ST[1])
    rect(x - 2, 48 + len, 6, 4, ST[0])
    rect(x + 2, 48 + len, 2, 4, ST[2])
  }
  // kệ lọ phải
  rect(280, 64, 34, 2, WD[1])
  rect(280, 66, 34, 2, "#2a2f38")
  rect(282, 54, 8, 10, BR[1]); rect(282, 54, 2, 10, BR[0]); rect(288, 54, 2, 10, BR[2])
  rect(294, 58, 6, 6, "#d5c7a0"); rect(294, 58, 2, 6, "#e9dfc0")
  rect(304, 52, 6, 12, RAMP.leaf[1]); rect(304, 52, 2, 12, RAMP.leaf[0])
  // mái hiên sọc đỏ–kem, rìa lượn
  rect(214, 14, 106, 4, WD[2])
  rect(214, 14, 106, 2, WD[0])
  for (let i = 0; i < 13; i++) {
    const x = 216 + i * 8
    const red = i % 2 === 0
    rect(x, 18, 8, 14, red ? BR[1] : LN[1])
    rect(x, 18, 8, 2, red ? BR[0] : LN[0])
    rect(x, 30, 8, 2, red ? BR[2] : LN[2])
    if (red) rect(x + 6, 20, 2, 10, BR[2], `fill-opacity="0.5"`)
    rect(x + 2, 32, 4, 4, red ? BR[2] : LN[2])
    rect(x + 2, 32, 2, 2, red ? BR[1] : LN[1])
  }
  tone(214, 36, 106, 2, SHADOW, 0.1)
  // mặt quầy inox + vệt sáng, thân quầy gỗ 3 cánh có ô nổi
  rect(212, 100, 108, 2, ST[0])
  rect(212, 102, 108, 4, ST[1])
  rect(212, 106, 108, 2, ST[2])
  rect(222, 102, 18, 2, ST[0])
  rect(274, 102, 24, 2, ST[0])
  rect(212, 108, 108, 54, WD[2])
  tone(212, 108, 108, 4, SHADOW, 0.22)
  tone(212, 112, 108, 2, SHADOW, 0.1)
  for (const x of [218, 252, 286]) {
    rect(x, 114, 30, 44, WD[1])
    rect(x, 114, 30, 2, WD[0])
    rect(x, 114, 2, 44, WD[0])
    rect(x, 156, 30, 2, WD[2])
    rect(x + 28, 114, 2, 44, WD[2])
    // ô nổi (lõm): cạnh trên-trái tối, dưới-phải sáng
    rect(x + 6, 120, 18, 32, WD[1])
    rect(x + 6, 120, 18, 2, WD[2])
    rect(x + 6, 120, 2, 32, WD[2])
    rect(x + 6, 150, 18, 2, WD[0])
    rect(x + 22, 120, 2, 32, WD[0])
    grain(x + 2, 116, 26, 40, WD[2], x, { op: 0.45, step: 6 })
    rect(x + 24, 130, 2, 10, ST[1])
    rect(x + 24, 130, 2, 2, ST[0])
  }
  rect(212, 160, 108, 2, ST[1])
  rect(212, 162, 108, 12, SL[1])
  rect(212, 162, 108, 2, SL[0])
  rect(212, 172, 108, 2, SL[2])
  castShadow(212, 316, 174, { depth: 8, shift: 0, op: 0.22 })
  // chồng khay
  for (let k = 0; k < 3; k++) {
    rect(216, 92 + k * 4, 22, 4, RAMP.blue[1])
    rect(216, 92 + k * 4, 22, 2, RAMP.blue[0])
    rect(216, 94 + k * 4, 22, 2, RAMP.blue[2])
  }
  rect(216, 88, 22, 4, RAMP.blue[1])
  rect(216, 88, 22, 2, RAMP.blue[0])
  rect(216, 90, 22, 2, RAMP.blue[2])
  tone(238, 90, 4, 10, SHADOW, 0.2)
  // nồi canh: thân + nắp + quai + núm
  rect(246, 86, 30, 14, ST[1])
  rect(246, 86, 4, 14, ST[0])
  rect(270, 86, 6, 14, ST[2])
  rect(246, 96, 30, 4, ST[2])
  rect(244, 84, 34, 2, ST[0])
  rect(248, 78, 26, 6, ST[1])
  rect(248, 78, 6, 6, ST[0])
  rect(268, 78, 6, 6, ST[2])
  rect(258, 74, 4, 4, SL[3])
  rect(240, 88, 6, 4, SL[3])
  rect(276, 88, 6, 4, SL[3])
  // hơi nước bốc từ nồi (nhóm chuyển động)
  group("scn-steam", () => {
    rect(254, 70, 4, 4, "#f4f1e6")
    rect(260, 64, 4, 4, "#f4f1e6")
    rect(256, 58, 4, 4, "#f4f1e6")
    rect(262, 52, 4, 4, "#f4f1e6")
  })
  // khay thức ăn: cơm / rau / thịt kho
  ;[LN[1], RAMP.leaf[1], BR[1]].forEach((c, i) => {
    const x = 286 + i * 11 - ((i * 11) % 2)
    rect(x, 96, 10, 4, ST[2])
    rect(x, 96, 10, 2, ST[1])
    rect(x, 92, 10, 4, c)
    rect(x, 92, 4, 2, i === 0 ? "#fff" : i === 1 ? RAMP.leaf[0] : BR[0])
  })

  /* ---- hai bàn dài + ghế băng (sau hàng đứng của nhân vật) */
  const table = (x0, len, seed) => {
    const x1 = x0 + len
    // bóng đổ xuống sàn trước, rồi mới vẽ đồ lên trên
    tone(x0 + 14, 174, len + 8, 6, SHADOW, 0.15)
    tone(x0 + 18, 180, len + 6, 4, SHADOW, 0.09)
    tone(x0 + 2, 170, len - 4, 6, SHADOW, 0.07)
    // chân bàn (tối) + thanh giằng
    rect(x0 + 8, 132, 4, 44, WD[2])
    rect(x0 + 8, 132, 2, 44, WD[1])
    rect(x1 - 12, 132, 4, 44, WD[3])
    rect(x1 - 12, 132, 2, 44, WD[2])
    rect(x0 + 12, 136, len - 24, 4, WD[2])
    rect(x0 + 12, 136, len - 24, 2, WD[1])
    tone(x0 + 12, 140, len - 24, 4, SHADOW, 0.14)
    // mặt bàn dày 8: cạnh trên sáng, thân, cạnh dưới tối
    rect(x0, 124, len, 8, WD[1])
    rect(x0, 124, len, 2, WD[0])
    rect(x0, 130, len, 2, WD[2])
    rect(x0, 124, 2, 8, WD[0])
    rect(x1 - 2, 124, 2, 8, WD[2])
    grain(x0 + 2, 126, len - 4, 4, WD[2], seed, { op: 0.55, step: 2, gap: [8, 24], len: [6, 20], skip: 0.4 })
    // ghế băng
    rect(x0 + 4, 154, 4, 26, WD[2])
    rect(x1 - 8, 154, 4, 26, WD[3])
    rect(x0 - 2, 148, len + 4, 6, WD[1])
    rect(x0 - 2, 148, len + 4, 2, WD[0])
    rect(x0 - 2, 152, len + 4, 2, WD[2])
    tone(x0, 154, len, 4, SHADOW, 0.16)
    grain(x0, 150, len, 2, WD[2], seed + 7, { op: 0.45, step: 2, gap: [10, 26], len: [6, 16], skip: 0.5 })
  }
  table(10, 94, 3)
  table(114, 94, 5)
  // khay cơm trên bàn: khay xanh + bát + ly (bớt còn bốn khay cho thoáng)
  const tray = (x, bowl, soup) => {
    rect(x, 122, 16, 2, RAMP.blue[1])
    rect(x + 2, 118, 8, 4, bowl)
    rect(x + 2, 118, 2, 4, "#ffffff", `fill-opacity="0.6"`)
    rect(x + 2, 118, 8, 2, soup)
    rect(x + 12, 118, 2, 4, "#e9e5d9")
  }
  tray(24, LN[1], BR[1])
  tray(74, LN[1], RAMP.leaf[1])
  tray(128, LN[1], BR[1])
  tray(174, LN[1], RAMP.sky[2])

  /* ---- hai đèn thả ấm */
  const pendant = (x) => {
    halo(x, 30, 40, 30, SUN, 0.09, 3)
    rect(x, 0, 2, 12, "#4b4640")
    rect(x - 4, 12, 10, 2, RAMP.leaf[1])
    rect(x - 6, 14, 14, 2, RAMP.leaf[1])
    rect(x - 8, 16, 18, 2, RAMP.leaf[2])
    rect(x - 10, 18, 22, 2, RAMP.leaf[2])
    rect(x - 4, 12, 2, 6, RAMP.leaf[0])
    rect(x - 10, 18, 22, 2, RAMP.leaf[2])
    rect(x - 6, 20, 14, 2, "#fff4c8")
  }
  pendant(40)
  pendant(150)
  return svg()
}


/* ------------------------------------------------------------------ hành lang */
export function corridorSVG({ STAGE_W, STAGE_H, GROUND_Y }) {
  /* Hành lang: cửa sổ nắng bên trái (nguồn sáng ấm) rọi xuống sàn gạch dài, bảng tin
     bần có giấy ghim, hai cửa lớp 11A1 / 11A2 có biển số bằng khối pixel và ô kính,
     bình nước uống ở cuối hành lang, đèn tuýp trên trần. */
  const w = STAGE_W, h = STAGE_H
  const { rect, tone, solid, pix, grain, halo, slab, sunPatch, castShadow, svg, group } = painter(w, h)
  const WL = RAMP.wall, WD = RAMP.wood, ST = RAMP.steel, TL = RAMP.tile, LN = RAMP.linen
  const DW = ["#cfae88", "#b8946f", "#9b7a58", "#775e45"] /* gỗ cửa: nhạt và ít bão hoà hơn WD */
  const TE = ["#c3d2cf", "#b0c3bf", "#98ada9", "#7f9693"] /* sơn lam xám chân tường */

  /* ---- trần + tường kem; ánh nắng ấm lan từ cửa sổ bên trái */
  rect(0, 0, w, 108, WL[1])
  rect(0, 0, w, 8, WL[2])
  rect(0, 8, w, 2, WL[3])
  tone(0, 10, w, 2, SHADOW, 0.12)
  tone(0, 12, w, 2, SHADOW, 0.06)
  halo(40, 70, 120, 86, SUN, 0.1, 3)
  tone(220, 14, 100, 94, SHADOW, 0.03)
  tone(264, 14, 56, 94, SHADOW, 0.03)
  // đèn tuýp ấm trên trần (bên trái sáng hơn)
  for (const [x, o] of [[44, 0.13], [186, 0.08]]) {
    rect(x, 2, 64, 4, LN[0])
    rect(x, 2, 64, 2, "#ffffff")
    rect(x, 6, 64, 2, WL[3])
    halo(x + 32, 16, 54, 20, SUN, o, 3)
  }

  /* ---- lan can gỗ giữa tường + chân tường sơn lam xám (có vết sơn, thớ phẳng) */
  rect(0, 110, w, 56, TE[1])
  grain(0, 112, w, 52, TE[2], 41, { op: 0.35, step: 6, gap: [14, 40], len: [6, 22], skip: 0.5 })
  grain(0, 114, w, 48, TE[0], 43, { op: 0.45, step: 8, gap: [20, 60], len: [4, 12], skip: 0.6 })
  tone(0, 110, w, 4, SHADOW, 0.16)
  tone(0, 114, w, 2, SHADOW, 0.08)
  rect(0, 106, w, 4, WD[1])
  rect(0, 106, w, 2, WD[0])
  rect(0, 108, w, 2, WD[2])
  // chân tường
  rect(0, 164, w, 8, TE[2])
  rect(0, 164, w, 2, TE[0])
  rect(0, 170, w, 2, TE[3])

  /* ---- sàn gạch dài xếp so le, bóng tường–sàn */
  rect(0, GROUND_Y, w, h - GROUND_Y, TL[1])
  let jg = "", hl = ""
  for (let row = 0; row < 2; row++) {
    const y0 = GROUND_Y + row * 14
    for (let x = row ? 14 : 0; x < w; x += 28) {
      jg += `M${x + 26} ${y0}h2v14h-2z`
      hl += `M${x} ${y0 + 2}h24v2h-24z`
    }
  }
  jg += `M0 184h${w}v2h${-w}z`
  solid(hl, "#efe9d6", 0.5)
  solid(jg, TL[2], 1)
  for (let i = 0; i < 6; i++) rect(i * 56 + 6, 174 + (i % 2) * 14, 8, 2, TL[0], `fill-opacity="0.8"`)
  tone(0, 172, w, 4, SHADOW, 0.26)
  tone(0, 176, w, 4, SHADOW, 0.13)
  tone(0, 180, w, 2, SHADOW, 0.06)

  /* ---- hai cửa sổ cao bên trái: trời, tán cây, mây */
  const win = (x, seed) => {
    const y = 34, wd = 28, ht = 72
    slab(x, y, wd, ht, ["#f6f1e1", "#e6dfca", "#c3baa0", "#9f967f"])
    const gx = x + 4, gy = y + 4, gw = wd - 8, gh = ht - 8
    rect(gx, gy, gw, gh, "#bdd3dd")
    rect(gx, gy, gw, 16, "#cfe0e6")
    rect(gx, gy + 16, gw, 6, "#c6dae2")
    // mây
    rect(gx + 2, gy + 10, 10, 2, "#f4f6f3")
    rect(gx + 6, gy + 8, 8, 2, "#f4f6f3")
    rect(gx + 8, gy + 24, 12, 2, "#eef3f0")
    // tán cây ngoài sân
    const prof = [12, 16, 20, 16, 12, 18, 14, 10]
    for (let c = 0; c < gw / 4; c++) {
      const ph = prof[(c + seed) % prof.length]
      rect(gx + c * 4, gy + gh - ph, 4, ph, RAMP.leaf[2])
      rect(gx + c * 4, gy + gh - ph, 4, 2, RAMP.leaf[1])
    }
    group("scn-rain", () => {
      for (let c = 0; c < gw / 4; c++) {
        const ph = prof[(c + seed) % prof.length]
        rect(gx + c * 4, gy + gh - ph + 4, 2, 2, RAMP.leaf[0])
      }
    })
    // thanh ngang (hai ô kính)
    const my = y + 40
    rect(gx, my, gw, 4, "#e6dfca")
    rect(gx, my, gw, 2, "#f6f1e1")
    rect(gx, my + 2, gw, 2, "#c3baa0")
    tone(gx, gy, gw, 2, SHADOW, 0.14)
    tone(gx, gy, 2, gh, SHADOW, 0.08)
    for (let k = 0; k < 4; k++) rect(gx + 4 + k * 2, gy + 24 - k * 2, 4, 2, "#ffffff", `fill-opacity="0.6"`)
    // bệ cửa + bóng
    rect(x - 2, y + ht, wd + 4, 2, "#f6f1e1")
    rect(x - 2, y + ht + 2, wd + 4, 2, "#d3cab0")
    tone(x, y + ht + 4, wd + 4, 4, SHADOW, 0.12)
  }
  win(14, 0)
  win(48, 3)
  // nắng rơi xuống sàn lệch sang phải
  sunPatch(34, 174, 20, 26, 14, SUN, 0.34)
  sunPatch(68, 174, 20, 26, 14, SUN, 0.34)

  /* ---- bảng tin bần: khung gỗ, giấy ghim có bóng đổ */
  slab(96, 42, 56, 52, WD)
  grain(98, 44, 52, 48, WD[2], 51, { op: 0.45, step: 6 })
  rect(100, 46, 48, 44, "#c3a57c")
  rect(100, 46, 48, 2, "#9a7d58")
  rect(100, 46, 2, 44, "#9a7d58")
  grain(102, 48, 44, 40, "#a58763", 53, { op: 0.8, step: 2, gap: [4, 10], len: [2, 4], skip: 0.55 })
  grain(102, 50, 44, 38, "#d9bf97", 57, { op: 0.8, step: 2, gap: [4, 12], len: [2, 4], skip: 0.6 })
  const note = (x, y, nw, nh, fill, lines, pin) => {
    tone(x + 2, y + 2, nw, nh, SHADOW, 0.22)
    rect(x, y, nw, nh, fill)
    rect(x, y, nw, 2, "#ffffff", `fill-opacity="0.6"`)
    rect(x, y + nh - 2, nw, 2, SHADOW, `fill-opacity="0.12"`)
    for (let i = 0; i < lines; i++) rect(x + 4, y + 8 + i * 4, nw - 8 - (i % 2) * 2, 2, "#98a1ab")
    rect(x + nw / 2 - 2, y + 2, 4, 4, pin)
    rect(x + nw / 2 - 2, y + 2, 2, 2, "#ffffff", `fill-opacity="0.55"`)
  }
  note(104, 50, 20, 24, LN[1], 3, "#c0574a")
  note(128, 52, 16, 16, "#f0e2a6", 2, "#3b6a86")
  note(104, 78, 16, 10, "#e9ddd8", 1, "#3b6a86")
  note(124, 72, 20, 14, LN[0], 2, "#c0574a")

  /* ---- hai cửa lớp: khung gỗ, ô kính, hai ô nổi, tay nắm, biển số */
  const glyph = {
    "1": [".#.", "##.", ".#.", ".#.", "###"],
    "2": ["##.", "..#", ".#.", "#..", "###"],
    A: [".#.", "#.#", "###", "#.#", "#.#"],
  }
  const door = (x, label) => {
    // bóng cửa đổ lên tường bên phải
    tone(x + 48, 40, 4, 130, SHADOW, 0.11)
    // biển số lớp
    rect(x + 6, 18, 38, 18, "#6a7d92")
    rect(x + 6, 18, 38, 2, "#8fa3b6")
    rect(x + 6, 34, 38, 2, "#4d5f74")
    rect(x + 8, 20, 34, 14, "#37507f")
    tone(x + 8, 36, 38, 2, SHADOW, 0.14)
    let gx = x + 10
    for (const ch of label) {
      pix(gx, 22, glyph[ch], "#f4efe2", 2)
      gx += 8
    }
    // khung + cánh cửa
    slab(x, 38, 48, 134, DW, { lit: 2, sh: 2 })
    rect(x + 4, 42, 40, 128, DW[1])
    rect(x + 4, 42, 40, 2, DW[2])
    rect(x + 4, 42, 2, 128, DW[2])
    grain(x + 6, 44, 36, 124, DW[2], x + 7, { op: 0.4, step: 6 })
    // ô kính: nhìn thấy lớp học mờ + vệt loá chéo
    rect(x + 8, 48, 32, 32, DW[2])
    rect(x + 10, 50, 28, 28, "#9db8c6")
    rect(x + 10, 50, 28, 12, "#b3cad5")
    rect(x + 10, 64, 28, 14, "#8aa6b5")
    rect(x + 24, 50, 2, 28, "#7d95a4")
    for (let k = 0; k < 5; k++) rect(x + 12 + k * 2, 60 - k * 2 + 6, 4, 2, "#ffffff", `fill-opacity="0.45"`)
    tone(x + 10, 50, 28, 2, SHADOW, 0.18)
    tone(x + 10, 50, 2, 28, SHADOW, 0.1)
    // hai ô nổi
    for (const py of [88, 124]) {
      rect(x + 8, py, 32, 30, DW[1])
      rect(x + 8, py, 32, 2, DW[2])
      rect(x + 8, py, 2, 30, DW[2])
      rect(x + 8, py + 28, 32, 2, DW[0])
      rect(x + 38, py, 2, 30, DW[0])
    }
    // tay nắm + ổ khoá
    rect(x + 36, 100, 4, 10, ST[2])
    rect(x + 36, 100, 2, 10, ST[0])
    rect(x + 36, 112, 4, 4, ST[1])
    // thanh chắn chân cửa + khe cửa
    rect(x + 4, 158, 40, 10, ST[1])
    rect(x + 4, 158, 40, 2, ST[0])
    rect(x + 4, 166, 40, 2, ST[2])
    rect(x + 4, 168, 40, 2, WD[3])
    castShadow(x + 2, x + 46, 172, { depth: 8, shift: 6, op: 0.18 })
  }
  door(168, "11A1")
  door(232, "11A2")

  /* ---- bình nước uống: bình xanh trên thân trắng có hai vòi */
  const dx = 290
  castShadow(dx, dx + 22, 172, { depth: 8, shift: 8, op: 0.2 })
  rect(dx + 2, 82, 18, 4, RAMP.blue[2])
  rect(dx, 86, 22, 28, "#bfd6df")
  rect(dx, 86, 6, 28, "#e1eef1")
  rect(dx + 16, 86, 6, 28, "#8fb0bf")
  rect(dx + 4, 94, 2, 10, "#ffffff", `fill-opacity="0.8"`)
  rect(dx + 2, 108, 18, 6, "#a8c6d3")
  rect(dx - 2, 114, 26, 6, LN[1])
  rect(dx - 2, 114, 26, 2, LN[0])
  rect(dx - 2, 118, 26, 2, LN[2])
  rect(dx - 2, 120, 26, 48, LN[1])
  rect(dx - 2, 120, 4, 48, LN[0])
  rect(dx + 18, 120, 6, 48, LN[2])
  rect(dx + 2, 124, 6, 6, RAMP.blue[1])
  rect(dx + 12, 124, 6, 6, "#c0574a")
  rect(dx + 2, 134, 18, 4, LN[2])
  rect(dx + 4, 136, 14, 2, ST[1])
  rect(dx - 2, 164, 26, 6, LN[2])
  rect(dx - 2, 168, 26, 2, "#9a9382")
  return svg()
}

/* ------------------------------------------------------------------ phòng ngủ */
export function bedroomSVG({ STAGE_W, STAGE_H, GROUND_Y }) {
  /* Phòng ngủ buổi tối: cửa sổ trời chạng vạng có trăng lưỡi liềm và rèm vải, bàn học
     với đèn bàn ấm (nguồn sáng ấm duy nhất, trên-trái) hắt chùm sáng xuống mặt bàn,
     áp phích, kệ nhỏ, đồng hồ, giường chăn trần bông xanh dưới lá cờ đỏ sao vàng,
     sàn gỗ ván + thảm. */
  const w = STAGE_W, h = STAGE_H
  const { rect, tone, group, solid, pix, grain, halo, slab, cdisc, castShadow, svg } = painter(w, h)
  const WD = RAMP.wood, LN = RAMP.linen, ST = RAMP.steel
  const BW = ["#d3d1c6", "#c3c3bb", "#adb1b2", "#959ca6"] /* tường chiều tối */
  const FL = ["#d1b68f", "#c2a27b", "#aa8964", "#8d6e50"] /* ván sàn */
  const CT = ["#cd8b75", "#b46e5b", "#92524a", "#6e3c3a"] /* rèm vải */
  const DV = ["#86ad9b", "#678f7e", "#4e7566", "#3a584d"] /* chăn trần bông */
  const GOLD = ["#f4dc92", "#d9b95c", "#a98a3c"]

  /* ---- tường: sọc giấy dán nhạt, tối dần lên trần và về bên phải */
  rect(0, 0, w, 172, BW[1])
  for (let x = 6; x < w; x += 16) tone(x, 10, 2, 154, BW[3], 0.14)
  for (let x = 14; x < w; x += 16) tone(x, 10, 2, 154, "#ffffff", 0.06)
  rect(0, 0, w, 8, BW[2])
  rect(0, 8, w, 2, BW[3])
  tone(0, 10, w, 2, SHADOW, 0.14)
  tone(0, 12, w, 2, SHADOW, 0.07)
  tone(0, 0, w, 172, "#31556b", 0.08)
  tone(200, 14, 120, 150, "#1c2a44", 0.05)
  tone(250, 14, 70, 150, "#1c2a44", 0.05)
  tone(292, 14, 28, 150, "#1c2a44", 0.05)
  // chân tường sơn trắng
  rect(0, 164, w, 8, "#cfccc0")
  rect(0, 164, w, 2, "#e8e5da")
  rect(0, 170, w, 2, "#a9a69a")

  /* ---- cửa sổ trời chạng vạng: dải màu từ xanh thẫm xuống cam đào, mái nhà, trăng, sao */
  slab(16, 24, 60, 56, ["#9a7a58", "#775a40", "#5d4632", "#443224"])
  const bands = [["#2d3f63", 28], ["#3b5580", 36], ["#586f98", 44], ["#8d86a0", 52], ["#d09a82", 60], ["#e2b68c", 68]]
  for (const [c, y] of bands) rect(20, y, 52, y === 68 ? 8 : 8, c)
  // sao + trăng lưỡi liềm (sáng ở trái-trên)
  for (const [x, y] of [[54, 32], [64, 30], [66, 38], [58, 42], [48, 46]]) rect(x, y, 2, 2, "#f4efe2")
  pix(26, 32, ["..###.", ".##...", "##....", "##....", ".##...", "..###."], "#f6f0dc", 2)
  // mái nhà hàng xóm + ô cửa sáng đèn + cột điện
  const roofs = [[20, 68, 14, 8], [34, 64, 16, 12], [50, 70, 12, 6], [62, 66, 10, 10]]
  for (const [x, y, rw, rh] of roofs) {
    rect(x, y, rw, rh, "#2e3858")
    rect(x, y, rw, 2, "#47547a")
  }
  rect(38, 68, 2, 2, "#f1d48a")
  rect(44, 72, 2, 2, "#f1d48a")
  rect(66, 70, 2, 2, "#f1d48a")
  rect(26, 72, 2, 2, "#f1d48a")
  rect(54, 56, 2, 14, "#232a42")
  rect(52, 56, 6, 2, "#232a42")
  rect(52, 60, 6, 2, "#232a42")
  // thanh cửa sổ (chữ thập) + bóng khung lên kính
  rect(44, 28, 4, 48, "#775a40")
  rect(44, 28, 2, 48, "#9a7a58")
  rect(20, 52, 52, 4, "#775a40")
  rect(20, 52, 52, 2, "#9a7a58")
  tone(20, 28, 52, 2, "#000000", 0.18)
  tone(20, 28, 2, 48, "#000000", 0.1)
  rect(12, 80, 68, 2, "#9a7a58")
  rect(12, 82, 68, 2, "#5d4632")
  tone(14, 84, 66, 4, SHADOW, 0.14)
  // rèm vải hai bên: nếp dọc theo thang 4 sắc, thanh treo + núm
  const curtain = (x0, mirror) => {
    const pat = mirror ? [2, 1, 0, 1, 1, 2, 1] : [1, 0, 1, 1, 2, 1, 2]
    pat.forEach((t, i) => rect(x0 + i * 2, 22, 2, 62, CT[t]))
    rect(x0, 20, 14, 4, CT[3])
    rect(x0, 82, 14, 2, CT[3])
    tone(x0 + (mirror ? -2 : 14), 24, 2, 58, SHADOW, 0.12)
  }
  curtain(10, false)
  curtain(70, true)
  rect(6, 16, 82, 4, WD[2])
  rect(6, 16, 82, 2, WD[0])
  rect(4, 14, 4, 8, GOLD[1])
  rect(86, 14, 4, 8, GOLD[1])
  tone(8, 20, 80, 2, SHADOW, 0.1)

  /* ---- đồng hồ treo tường: mặt tròn pixel, kim phút nhóm scn-clock */
  cdisc(292, 34, 6, "#6b5a4d")
  cdisc(292, 34, 5, "#f4efe2")
  rect(292, 24, 2, 2, "#6b5a4d"); rect(292, 44, 2, 2, "#6b5a4d")
  rect(284, 34, 2, 2, "#6b5a4d"); rect(300, 34, 2, 2, "#6b5a4d")
  tone(284, 24, 20, 2, SHADOW, 0.08)
  group("scn-clock", () => {
    rect(292, 34, 6, 2, "#3a3430")
    rect(292, 26, 2, 10, "#3a3430")
    rect(292, 34, 2, 2, "#9a3b3b")
  })
  tone(296, 46, 12, 4, SHADOW, 0.1)

  /* ---- áp phích bóng đá (giấy dán băng keo, bóng đổ sang phải-xuống) */
  tone(124, 36, 34, 48, SHADOW, 0.2)
  rect(122, 34, 32, 46, "#e4e0d2")
  rect(122, 34, 32, 2, "#fffdf4")
  rect(124, 36, 28, 42, "#5b8051")
  rect(124, 36, 28, 2, "#6f9461")
  rect(124, 36, 2, 42, "#6f9461")
  for (let y = 40; y < 76; y += 8) tone(124, y, 28, 4, "#000000", 0.07)
  const pl = "#e9efe0"
  rect(128, 40, 20, 2, pl); rect(128, 74, 20, 2, pl)
  rect(128, 40, 2, 36, pl); rect(146, 40, 2, 36, pl)
  rect(128, 56, 20, 2, pl)
  rect(136, 54, 4, 6, pl)
  rect(132, 40, 12, 4, pl, `fill-opacity="0.0"`)
  rect(134, 40, 8, 4, "#5b8051"); rect(134, 40, 8, 2, pl)
  rect(134, 72, 8, 4, "#5b8051"); rect(134, 74, 8, 2, pl)
  rect(122, 34, 4, 2, "#e7d794"); rect(150, 34, 4, 2, "#e7d794")

  /* ---- kệ treo nhỏ: sách, chậu cây, cúp */
  tone(168, 84, 48, 4, SHADOW, 0.16)
  tone(170, 88, 44, 2, SHADOW, 0.08)
  rect(166, 80, 46, 4, WD[1])
  rect(166, 80, 46, 2, WD[0])
  rect(166, 82, 46, 2, WD[2])
  rect(170, 84, 4, 6, WD[2]); rect(204, 84, 4, 6, WD[3])
  const book = (x, bw, bh, c) => {
    rect(x, 80 - bh, bw, bh, c[1])
    rect(x, 80 - bh, bw, 2, c[0])
    rect(x, 80 - bh, 2, bh, c[0])
    rect(x + bw - 2, 80 - bh, 2, bh, c[2])
  }
  book(168, 4, 14, RAMP.blue)
  book(172, 4, 12, RAMP.brick)
  book(176, 4, 16, RAMP.leaf)
  book(180, 4, 10, RAMP.sky)
  // chậu cây
  rect(188, 72, 10, 8, "#b3684f"); rect(188, 72, 10, 2, "#cc8366"); rect(196, 72, 2, 8, "#8d4b3b")
  rect(190, 64, 6, 8, RAMP.leaf[1]); rect(186, 62, 6, 6, RAMP.leaf[0]); rect(194, 60, 6, 8, RAMP.leaf[2]); rect(190, 58, 4, 6, RAMP.leaf[1])
  // cúp
  rect(202, 72, 8, 4, GOLD[0]); rect(202, 72, 2, 4, "#ffffff", `fill-opacity="0.5"`); rect(208, 72, 2, 4, GOLD[2])
  rect(204, 76, 2, 2, GOLD[1]); rect(202, 78, 8, 2, GOLD[2])

  /* ---- cờ đỏ sao vàng treo trên giường */
  tone(234, 50, 32, 22, SHADOW, 0.16)
  rect(228, 44, 38, 4, WD[2]); rect(228, 44, 38, 2, WD[0])
  rect(230, 48, 32, 22, "#c0504a")
  rect(230, 48, 32, 2, "#d96b5f")
  rect(230, 68, 32, 2, "#9a3b3b")
  for (const x of [238, 250, 258]) tone(x, 50, 2, 18, "#000000", 0.1)
  tone(244, 50, 2, 18, "#ffffff", 0.08)
  pix(240, 52, ["..#..", ".###.", "#####", ".###.", ".#.#."], "#e9cf6a", 2)

  /* ---- sàn gỗ ván nằm ngang, ba hàng, màu ván lệch nhẹ + thớ gỗ + mạch nối so le */
  rect(0, GROUND_Y, w, h - GROUND_Y, FL[1])
  const rows = [[172, 8], [180, 10], [190, 10]]
  const joints = [[40, 130, 250], [20, 100, 180, 280], [60, 150, 240]]
  rows.forEach(([y, hh], r) => {
    // mỗi tấm một sắc nhẹ
    const xs = [0, ...joints[r], w]
    for (let i = 0; i < xs.length - 1; i++) {
      const t = (i + r) % 3
      if (t === 1) tone(xs[i], y, xs[i + 1] - xs[i], hh, "#ffffff", 0.07)
      if (t === 2) tone(xs[i], y, xs[i + 1] - xs[i], hh, SHADOW, 0.06)
    }
    rect(0, y + hh - 2, w, 2, FL[3], `fill-opacity="0.55"`)
    for (const jx of joints[r]) rect(jx, y, 2, hh - 2, FL[3], `fill-opacity="0.55"`)
    rect(0, y, w, 2, "#ffffff", `fill-opacity="0.12"`)
    grain(0, y + 2, w, hh - 4, FL[2], 70 + r, { op: 0.5, step: 4, gap: [10, 40], len: [6, 22], skip: 0.35 })
  })
  tone(0, 172, w, 4, SHADOW, 0.28)
  tone(0, 176, w, 4, SHADOW, 0.14)
  tone(0, 180, w, 2, SHADOW, 0.06)

  /* ---- thảm nhỏ: hình thang trên sàn, viền kem, tua hai đầu, dệt thớ */
  const RG = ["#9fb1c1", "#869ab0", "#6d8199", "#556a82"]
  for (let y = 178; y < 196; y += 2) {
    const t = (y - 178) / 18
    const x0 = 86 - ev(16 * t), x1 = 190 + ev(16 * t)
    rect(x0, y, x1 - x0, 2, RG[1])
    rect(x0, y, 2, 2, RG[3]); rect(x1 - 2, y, 2, 2, RG[3])
    rect(x0 + 6, y, 2, 2, "#ece6d4"); rect(x1 - 8, y, 2, 2, "#ece6d4")
    rect(x0 - 2, y, 2, 2, "#d9d2bd", `fill-opacity="${y % 4 ? 0.8 : 0.4}"`); rect(x1, y, 2, 2, "#d9d2bd", `fill-opacity="${y % 4 ? 0.8 : 0.4}"`)
  }
  rect(86, 178, 104, 2, RG[0]); rect(88, 182, 100, 2, "#ece6d4"); rect(70, 194, 136, 2, RG[3]); rect(74, 190, 128, 2, "#ece6d4")
  grain(92, 184, 94, 4, RG[0], 91, { op: 0.8, step: 2, gap: [8, 24], len: [4, 12], skip: 0.4 })
  grain(84, 186, 108, 4, RG[2], 92, { op: 0.8, step: 2, gap: [10, 30], len: [4, 10], skip: 0.5 })

  /* ---- bàn học: mặt bàn, chân trái, tủ ngăn kéo phải */
  castShadow(14, 112, 174, { depth: 8, shift: 10, op: 0.24 })
  rect(12, 128, 4, 46, WD[2]); rect(12, 128, 2, 46, WD[1])
  rect(80, 128, 32, 46, WD[2])
  rect(80, 128, 2, 46, WD[1]); rect(110, 128, 2, 46, WD[3])
  for (const dy of [132, 150]) {
    slab(84, dy, 24, 16, WD)
    grain(86, dy + 2, 20, 12, WD[2], dy, { op: 0.5, step: 4 })
    rect(94, dy + 6, 4, 2, GOLD[1]); rect(94, dy + 6, 2, 2, GOLD[0])
  }
  tone(16, 128, 64, 6, SHADOW, 0.24)
  slab(8, 120, 106, 8, WD)
  grain(10, 122, 102, 4, WD[2], 82, { op: 0.55, step: 2, gap: [8, 28], len: [6, 22], skip: 0.4 })
  // ghế học nhìn nghiêng
  castShadow(46, 78, 180, { depth: 6, shift: 8, op: 0.2 })
  rect(72, 130, 4, 20, RAMP.navy[2]); rect(72, 130, 2, 20, RAMP.navy[1])
  rect(70, 128, 8, 4, RAMP.navy[1]); rect(70, 128, 8, 2, RAMP.navy[0])
  rect(46, 148, 32, 6, RAMP.navy[1]); rect(46, 148, 32, 2, RAMP.navy[0]); rect(46, 152, 32, 2, RAMP.navy[3])
  rect(50, 154, 4, 26, "#3a3d4a"); rect(70, 154, 4, 26, "#2c2f3a")

  /* ---- đồ trên bàn: chồng sách, vở mở, hộp bút, điện thoại sáng màn hình */
  const bk = (x, y, bw, c) => {
    rect(x, y, bw, 6, c[1]); rect(x, y, bw, 2, c[0]); rect(x, y + 4, bw, 2, c[2])
    rect(x + bw - 2, y + 2, 2, 2, "#ece6d4")
  }
  bk(18, 114, 26, RAMP.blue)
  bk(20, 108, 22, RAMP.brick)
  bk(22, 102, 18, RAMP.leaf)
  rect(66, 116, 18, 4, LN[0]); rect(66, 118, 18, 2, LN[2]); rect(74, 116, 2, 4, "#b9b19a")
  rect(68, 118, 4, 2, "#98a1ab"); rect(78, 118, 4, 2, "#98a1ab")
  rect(46, 110, 8, 10, RAMP.leaf[1]); rect(46, 110, 2, 10, RAMP.leaf[0]); rect(52, 110, 2, 10, RAMP.leaf[2])
  rect(46, 108, 8, 2, RAMP.leaf[3])
  rect(48, 104, 2, 4, "#e4d9a4"); rect(52, 102, 2, 6, "#c0504a")
  rect(56, 106, 8, 14, "#272b36")
  rect(56, 106, 8, 2, "#4a5062")
  group("scn-screen", () => {
    rect(58, 108, 4, 10, "#4b8fb3")
    rect(58, 110, 4, 2, "#e9e5d9")
    rect(58, 114, 2, 2, "#b3d3e3")
  })
  // đèn bàn: chân, thân, cần, chao hắt sáng sang trái-xuống; chùm sáng ấm lên mặt bàn
  for (let k = 0; k < 6; k++) rect(76 - k * 2, 110 + k * 2, 16 + k * 4, 2, "#fff0b8", `fill-opacity="${0.34 - k * 0.02}"`)
  halo(82, 112, 80, 54, "#f6d98f", 0.08, 3)
  rect(100, 116, 14, 4, "#3a3d4a"); rect(100, 116, 14, 2, "#5a5f72")
  rect(104, 100, 2, 16, "#3a3d4a")
  rect(86, 98, 20, 2, "#3a3d4a")
  rect(78, 100, 12, 2, "#b3684f"); rect(76, 102, 16, 2, "#b3684f")
  rect(74, 104, 20, 2, "#cc8366"); rect(72, 106, 24, 2, "#8d4b3b")
  rect(78, 100, 4, 2, "#e0a082")
  rect(76, 108, 16, 2, "#fff6d0")

  /* ---- giường: thành chân + thành đầu, khung, nệm, chăn trần bông, gối */
  tone(212, 160, 96, 12, SHADOW, 0.24)
  castShadow(212, 316, 174, { depth: 10, shift: 0, op: 0.3 })
  rect(214, 160, 4, 12, WD[2]); rect(298, 160, 4, 12, WD[3])
  rect(210, 152, 94, 8, WD[1]); rect(210, 152, 94, 2, WD[0]); rect(210, 158, 94, 2, WD[2])
  rect(214, 142, 90, 10, LN[1]); rect(214, 142, 90, 2, LN[0])
  // chăn: nền + hàng chỉ chần thoi + nếp gấp + mép buông xuống
  rect(214, 130, 84, 24, DV[1])
  rect(214, 130, 84, 2, DV[0])
  rect(214, 130, 2, 24, DV[0])
  rect(214, 150, 84, 4, DV[2])
  rect(296, 130, 2, 24, DV[2])
  let qs = ""
  for (let y = 134; y < 150; y += 6) for (let x = 220 + ((y / 6) % 2) * 6; x < 292; x += 12) qs += `M${x} ${y}h2v2h-2z`
  solid(qs, DV[0], 0.9)
  tone(214, 138, 84, 2, DV[3], 0.45)
  tone(222, 144, 60, 2, DV[3], 0.35)
  tone(260, 132, 10, 8, DV[3], 0.18)
  rect(214, 152, 84, 2, DV[3])
  // gối + vệt lõm
  tone(280, 134, 22, 4, SHADOW, 0.2)
  rect(280, 120, 22, 14, LN[0]); rect(280, 120, 22, 2, "#ffffff"); rect(280, 132, 22, 2, LN[2]); rect(300, 120, 2, 14, LN[2])
  rect(284, 126, 12, 2, LN[2], `fill-opacity="0.7"`)
  // thành đầu giường cao (phải) có ô nổi + thành chân thấp (trái)
  slab(302, 96, 12, 76, WD)
  rect(304, 100, 8, 24, WD[1]); rect(304, 100, 8, 2, WD[2]); rect(304, 100, 2, 24, WD[2]); rect(304, 122, 8, 2, WD[0])
  grain(304, 128, 8, 40, WD[2], 99, { op: 0.5, step: 4 })
  slab(206, 134, 8, 38, WD)
  return svg()
}

/* ------------------------------------------------------------------ thư viện */
export function librarySVG({ STAGE_W, STAGE_H, GROUND_Y }) {
  /* Thư viện: hai tủ sách cao gáy sách nhiều màu (đã nhạt bớt) ở hai bên, cửa sổ sáng
     dịu ở giữa rọi chùm nắng chéo xuống bàn đọc và sàn thảm, biển "giữ yên lặng" bằng
     khối pixel, tờ nội quy, bàn đọc có đèn xanh + sách, đèn thả, thảm xanh. */
  const w = STAGE_W, h = STAGE_H
  const { rect, tone, group, pix, grain, halo, slab, sunPatch, castShadow, svg } = painter(w, h)
  const rnd = seeded(2024)
  const WL = RAMP.wall, WD = RAMP.woodDk, LN = RAMP.linen, ST = RAMP.steel
  const CP = ["#93a8b9", "#7f95a8", "#6c8397", "#5a7186"] /* thảm xanh */

  /* ---- tường kem, tối dần lên trần và về phía phải */
  rect(0, 0, w, 164, WL[1])
  rect(0, 0, w, 6, WL[2])
  tone(0, 6, w, 2, WL[2], 0.6)
  tone(0, 8, w, 2, WL[2], 0.3)
  halo(158, 70, 110, 76, SUN, 0.1, 3)
  tone(200, 10, 120, 154, SHADOW, 0.03)
  tone(250, 10, 70, 154, SHADOW, 0.03)
  // chân tường gỗ tối + bóng
  rect(0, 164, w, 8, WD[1])
  rect(0, 164, w, 2, WD[0])
  rect(0, 170, w, 2, WD[3])

  /* ---- sàn thảm xanh: thớ ngắn sáng/tối, đường viền, bóng tường–sàn */
  rect(0, GROUND_Y, w, h - GROUND_Y, CP[1])
  grain(0, 174, w, 26, CP[0], 31, { op: 0.55, step: 2, gap: [6, 20], len: [2, 6], skip: 0.35 })
  grain(0, 174, w, 26, CP[2], 33, { op: 0.6, step: 2, gap: [6, 22], len: [2, 6], skip: 0.4 })
  rect(0, 188, w, 2, CP[2], `fill-opacity="0.5"`)
  tone(0, 172, w, 4, SHADOW, 0.26)
  tone(0, 176, w, 4, SHADOW, 0.13)
  tone(0, 180, w, 2, SHADOW, 0.06)

  /* ---- cửa sổ sáng dịu ở giữa: khung gỗ, kính trắng xanh, bóng cây, bệ đá */
  slab(128, 24, 60, 56, ["#f2edde", "#e2dbc6", "#bfb69b", "#9a917a"])
  rect(132, 28, 52, 48, "#d7e3e8")
  rect(132, 28, 52, 20, "#e8f0f1")
  rect(132, 48, 52, 8, "#dfe9ec")
  // cành cây mờ + mây
  rect(138, 56, 16, 14, "#b4c9ce")
  rect(142, 54, 8, 4, "#9db8bd")
  rect(164, 36, 12, 4, "#f7f8f4")
  rect(168, 34, 8, 2, "#f7f8f4")
  // thanh cửa
  rect(156, 28, 4, 48, "#e2dbc6"); rect(156, 28, 2, 48, "#f2edde"); rect(158, 28, 2, 48, "#bfb69b")
  rect(132, 50, 52, 4, "#e2dbc6"); rect(132, 50, 52, 2, "#f2edde"); rect(132, 52, 52, 2, "#bfb69b")
  tone(132, 28, 52, 2, SHADOW, 0.12)
  tone(132, 28, 2, 48, SHADOW, 0.07)
  for (let k = 0; k < 4; k++) rect(138 + k * 2, 44 - k * 2, 4, 2, "#ffffff", `fill-opacity="0.6"`)
  rect(124, 80, 68, 2, "#f2edde")
  rect(124, 82, 68, 2, "#cfc7ad")
  tone(126, 84, 68, 4, SHADOW, 0.13)
  tone(128, 88, 66, 2, SHADOW, 0.06)
  // chùm nắng chéo từ cửa sổ rọi xuống phải-xuống (lấp lánh nhẹ), qua tường rồi tới sàn
  group("scn-rain", () => {
    sunPatch(134, 88, 22, 84, 34, "#fffbe0", 0.2)
    sunPatch(162, 88, 22, 84, 34, "#fffbe0", 0.2)
    sunPatch(176, 174, 22, 26, 10, "#ffe9a0", 0.26)
    sunPatch(204, 174, 22, 26, 10, "#ffe9a0", 0.26)
  })

  /* ---- tờ nội quy ghim bên trái cửa sổ, biển "giữ yên lặng" bên phải */
  tone(106, 38, 16, 26, SHADOW, 0.2)
  rect(104, 36, 16, 26, LN[1]); rect(104, 36, 16, 2, "#ffffff", `fill-opacity="0.7"`); rect(104, 60, 16, 2, LN[2])
  rect(107 - 1, 42, 10, 2, "#98a1ab"); rect(106, 46, 10, 2, "#98a1ab"); rect(106, 50, 8, 2, "#98a1ab"); rect(106, 54, 6, 2, "#98a1ab")
  rect(110, 38, 4, 4, "#c0574a"); rect(110, 38, 2, 2, "#ffffff", `fill-opacity="0.55"`)
  tone(196, 26, 26, 36, SHADOW, 0.2)
  rect(194, 24, 26, 34, "#6a7d92")
  rect(194, 24, 26, 2, "#8fa3b6"); rect(194, 56, 26, 2, "#4d5f74")
  rect(196, 26, 22, 30, "#37507f")
  pix(198, 30, ["....#...", "...##.#.", "##.###.#", "##.###.#", "##.###.#", "...##.#.", "....#..."], "#f4efe2", 2)
  for (let i = 0; i < 7; i++) rect(198 + i * 2, 30 + i * 2, 4, 2, "#d9694f")
  rect(200, 48, 14, 2, "#f4efe2"); rect(202, 52, 10, 2, "#f4efe2")

  /* ---- tủ sách cao: khung gỗ, ván ngăn, gáy sách nhiều màu (nhạt bớt, có bóng) */
  const palette = ["#4a6f8a", "#6b8a4f", "#b0644e", "#c97a58", "#d3bd7c", "#7f9bb0", "#e7e0cc", "#3f6a58", "#a98258", "#6f8ba0", "#7f9a5e", "#c2ad86"]
  const bookcase = (x, wd, dim) => {
    rect(x, 12, wd, 160, WD[1])
    rect(x, 12, 2, 160, WD[0])
    rect(x + wd - 2, 12, 2, 160, WD[2])
    rect(x + 4, 16, wd - 8, 150, "#6a5340")
    for (let k = 0; k < 5; k++) {
      const top = 16 + 30 * k
      const base = top + 26
      // bóng của ván phía trên và của thành bên trái lên ngăn
      tone(x + 4, top, wd - 8, 4, "#000000", 0.22)
      tone(x + 4, top + 4, wd - 8, 2, "#000000", 0.14)
      tone(x + 4, top, 2, 26, "#000000", 0.18)
      let cx = x + 6
      const end = x + wd - 6 - (rnd() < 0.28 ? 4 + 2 * Math.floor(rnd() * 8) : 0)
      while (cx + 4 <= end) {
        const bw = rnd() < 0.55 ? 4 : 6
        if (cx + bw > end) break
        const bh = 14 + 2 * Math.floor(rnd() * 6)
        const c = mix(palette[Math.floor(rnd() * palette.length)], "#8a7a68", 0.28)
        rect(cx, base - bh, bw, bh, c)
        rect(cx, base - bh, bw, 2, mix(c, "#ffffff", 0.22))
        rect(cx + bw - 2, base - bh + 2, 2, bh - 2, mix(c, "#000000", 0.18))
        if (rnd() < 0.4) rect(cx, base - bh + 4, bw, 2, "#e4dcc3", `fill-opacity="0.75"`)
        if (rnd() < 0.2) rect(cx, base - 6, bw, 2, "#d7b86c", `fill-opacity="0.8"`)
        cx += bw
        if (rnd() < 0.1) cx += 2 + 2 * Math.floor(rnd() * 2)
      }
      // ván ngăn: mép trên sáng
      rect(x + 4, base, wd - 8, 4, WD[1])
      rect(x + 4, base, wd - 8, 2, WD[0])
      rect(x + 4, base + 2, wd - 8, 2, WD[2])
    }
    // mũ tủ + chân tủ
    rect(x, 12, wd, 4, WD[1]); rect(x, 12, wd, 2, WD[0])
    rect(x, 166, wd, 6, WD[2]); rect(x, 166, wd, 2, WD[1])
    if (dim) tone(x, 12, wd, 160, SHADOW, dim)
  }
  bookcase(4, 96, 0)
  bookcase(220, 96, 0.08)
  // bóng tủ trái đổ lên tường
  tone(100, 16, 6, 150, SHADOW, 0.13)
  tone(106, 20, 2, 146, SHADOW, 0.06)
  castShadow(4, 100, 174, { depth: 8, shift: 6, op: 0.22 })
  castShadow(220, 316, 174, { depth: 8, shift: 0, op: 0.22 })

  /* ---- bàn đọc: mặt dày, chân, thanh ngang, bóng đổ xuống thảm */
  tone(116, 174, 108, 6, SHADOW, 0.16)
  tone(120, 180, 106, 4, SHADOW, 0.1)
  // hai ghế đẩu cất dưới bàn
  for (const x of [124, 172]) {
    rect(x, 146, 22, 4, RAMP.navy[1]); rect(x, 146, 22, 2, RAMP.navy[0]); rect(x, 148, 22, 2, RAMP.navy[3])
    rect(x + 4, 150, 2, 24, "#3a3d4a"); rect(x + 16, 150, 2, 24, "#2c2f3a")
  }
  rect(112, 134, 4, 42, WD[2]); rect(112, 134, 2, 42, WD[1])
  rect(204, 134, 4, 42, WD[3]); rect(204, 134, 2, 42, WD[2])
  rect(116, 136, 88, 4, WD[2]); rect(116, 136, 88, 2, WD[1])
  tone(116, 140, 88, 4, SHADOW, 0.14)
  slab(106, 126, 108, 8, WD)
  grain(108, 128, 104, 4, WD[2], 61, { op: 0.55, step: 2, gap: [8, 26], len: [6, 22], skip: 0.4 })
  rect(106, 126, 108, 2, "#a9855f")
  // sách trên bàn: chồng sách, quyển mở, hộp bút
  rect(116, 118, 20, 4, RAMP.blue[1]); rect(116, 118, 20, 2, RAMP.blue[0]); rect(132, 118, 4, 4, "#e7e0cc")
  rect(118, 122, 18, 4, RAMP.brick[1]); rect(118, 122, 18, 2, RAMP.brick[0]); rect(116, 122, 2, 4, RAMP.blue[2])
  rect(140, 122, 12, 4, LN[0]); rect(152, 122, 12, 4, LN[0])
  rect(150, 122, 4, 4, "#b9b19a")
  rect(142, 124, 8, 2, "#98a1ab"); rect(156, 124, 6, 2, "#98a1ab")
  tone(140, 126, 26, 2, SHADOW, 0.16)
  rect(168, 116, 8, 10, RAMP.leaf[1]); rect(168, 116, 2, 10, RAMP.leaf[0]); rect(174, 116, 2, 10, RAMP.leaf[2])
  rect(170, 110, 2, 6, "#e4d9a4"); rect(174, 108, 2, 8, "#c0574a")
  // đèn bàn xanh + chùm sáng ấm
  for (let k = 0; k < 6; k++) rect(188 - k * 2, 114 + k * 2, 16 + k * 4, 2, "#fff0b8", `fill-opacity="${0.34 - k * 0.03}"`)
  halo(194, 116, 34, 22, "#f6d98f", 0.1, 3)
  rect(188, 122, 14, 4, "#2f343d"); rect(188, 122, 14, 2, "#4a5062")
  rect(194, 112, 2, 10, "#2f343d")
  rect(186, 104, 18, 2, RAMP.leaf[2]); rect(184, 106, 22, 2, RAMP.leaf[2]); rect(182, 108, 26, 2, RAMP.leaf[3])
  rect(186, 104, 4, 2, RAMP.leaf[1]); rect(184, 106, 4, 2, RAMP.leaf[1])
  rect(186, 110, 16, 2, "#fff6d0")

  /* ---- đèn thả trên trần */
  halo(160, 24, 42, 22, SUN, 0.08, 3)
  rect(160, 0, 2, 12, "#4b4640")
  rect(156, 12, 10, 2, RAMP.leaf[1]); rect(152, 14, 18, 2, RAMP.leaf[1]); rect(150, 16, 22, 2, RAMP.leaf[2])
  rect(156, 12, 2, 6, RAMP.leaf[0])
  rect(154, 18, 14, 2, "#fff4c8")
  return svg()
}
