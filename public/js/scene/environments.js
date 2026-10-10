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

/* ------------------------------------------------------------------ bộ vẽ pixel độ phân giải cao
   Hai bối cảnh dưới đây (lớp học, sân trường) được vẽ như nhân vật hi-fi: một "tấm vải" ô 2 x 2 px
   (160 x 100 ô trên sân khấu 320 x 200), mỗi ô một màu, tô bóng 3–4 sắc theo MỘT nguồn sáng
   trên-trái, rồi gộp các ô liền kề cùng màu thành đường <path> (mọi toạ độ đều chẵn). Lớp cần
   chuyển động (lá, quạt, đồng hồ, vệt nắng) là tấm vải riêng, bọc trong <g class="scn-*">. */

const hfClamp = (v, a, b) => Math.max(a, Math.min(b, v))
/* bước mượt a→b (a có thể lớn hơn b để đảo chiều) */
function hfSmooth(a, b, x) {
  const t = hfClamp((x - a) / (b - a), 0, 1)
  return t * t * (3 - 2 * t)
}
function hfRng(seed) {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 4294967296
  }
}
/* nhiễu cố định theo ô: cùng ô luôn ra cùng giá trị, không phụ thuộc thứ tự vẽ */
function hfNoise(cx, cy, k = 0) {
  let n = Math.imul(cx + 374761393, 668265263) ^ Math.imul(cy + 1274126177 + k * 97, 2246822519)
  n = Math.imul(n ^ (n >>> 13), 1274126177)
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296
}
/* chọn màu trong dải ramp (0 = sáng nhất) theo giá trị liên tục v; quanh ranh giới hai sắc
   là một dải caro 2 px hẹp (phối màu kiểu pixel-art) thay vì chuyển mờ */
function hfTone(ramp, v, edge, cx, cy) {
  const n = ramp.length - 1
  v = hfClamp(v, 0, n)
  const i = Math.floor(v)
  if (i >= n) return ramp[n]
  const f = v - i
  if (f < 0.5 - edge) return ramp[i]
  if (f > 0.5 + edge) return ramp[i + 1]
  return (cx + cy) & 1 ? ramp[i] : ramp[i + 1]
}

/* Tấm vải ô 2 px. (ox, oy) là góc trên-trái trên sân khấu; mọi hàm nhận toạ độ px sân khấu. */
function hfCanvas(w, h, ox = 0, oy = 0) {
  const W = w >> 1
  const H = h >> 1
  const cells = new Array(W * H).fill(null)
  const at = (x, y) => {
    const cx = (x - ox) >> 1
    const cy = (y - oy) >> 1
    return cx >= 0 && cy >= 0 && cx < W && cy < H ? cy * W + cx : -1
  }
  const api = {
    set(x, y, col) {
      const i = at(x, y)
      if (i >= 0) cells[i] = col
    },
    get(x, y) {
      const i = at(x, y)
      return i >= 0 ? cells[i] : null
    },
    rect(x, y, wd, ht, col) {
      for (let py = y; py < y + ht; py += 2) for (let px = x; px < x + wd; px += 2) api.set(px, py, col)
    },
    /* caro 2 px (phase 0/1) */
    dith(x, y, wd, ht, col, phase = 0) {
      for (let py = y; py < y + ht; py += 2)
        for (let px = x; px < x + wd; px += 2) if ((((px >> 1) + (py >> 1)) & 1) === phase) api.set(px, py, col)
    },
    /* tô từng ô bằng fn(cx_px, cy_px, ôX, ôY) → màu | null (toạ độ truyền vào là TÂM ô) */
    fill(x, y, wd, ht, fn) {
      for (let py = y; py < y + ht; py += 2)
        for (let px = x; px < x + wd; px += 2) {
          const col = fn(px + 1, py + 1, px >> 1, py >> 1)
          if (col) api.set(px, py, col)
        }
    },
    /* elip tâm (cx, cy) bán kính rx, ry; col là màu hoặc fn(px, py, nx, ny, ôX, ôY) với nx, ny ∈ [-1, 1] */
    ellipse(cx, cy, rx, ry, col) {
      const x0 = (cx - rx) & ~1
      const y0 = (cy - ry) & ~1
      for (let py = y0; py <= cy + ry; py += 2)
        for (let px = x0; px <= cx + rx; px += 2) {
          const nx = (px + 1 - cx) / rx
          const ny = (py + 1 - cy) / ry
          if (nx * nx + ny * ny > 1) continue
          const c = typeof col === "function" ? col(px + 1, py + 1, nx, ny, px >> 1, py >> 1) : col
          if (c) api.set(px, py, c)
        }
    },
    /* viền đổi màu cho các ô giáp ô trống: fn(hướngX, hướngY, màuHiệnTại) → màu */
    rim(fn) {
      const edits = []
      for (let cy = 0; cy < H; cy++)
        for (let cx = 0; cx < W; cx++) {
          const col = cells[cy * W + cx]
          if (!col) continue
          let nx = 0
          let ny = 0
          if (cx > 0 && !cells[cy * W + cx - 1]) nx -= 1
          if (cx < W - 1 && !cells[cy * W + cx + 1]) nx += 1
          if (cy > 0 && !cells[(cy - 1) * W + cx]) ny -= 1
          if (cy < H - 1 && !cells[(cy + 1) * W + cx]) ny += 1
          if (nx || ny) edits.push([cy * W + cx, fn(nx, ny, col)])
        }
      for (const [i, col] of edits) if (col) cells[i] = col
    },
    /* chép các ô có màu của tấm vải khác (cùng gốc toạ độ sân khấu) lên tấm này */
    blit(o) {
      o.each((x, y, col) => api.set(x, y, col))
    },
    each(fn) {
      for (let cy = 0; cy < H; cy++)
        for (let cx = 0; cx < W; cx++) {
          const col = cells[cy * W + cx]
          if (col) fn(ox + cx * 2, oy + cy * 2, col)
        }
    },
    /* gộp ô liền kề cùng màu thành hình chữ nhật, mỗi màu một <path> */
    paths() {
      const byCol = new Map()
      let open = new Map()
      const emit = (r) => {
        const d = byCol.get(r.col) ?? byCol.set(r.col, []).get(r.col)
        const wd = (r.x1 - r.x0) * 2
        const ht = (r.y1 - r.y0) * 2
        d.push(`M${ox + r.x0 * 2} ${oy + r.y0 * 2}h${wd}v${ht}h${-wd}z`)
      }
      for (let cy = 0; cy < H; cy++) {
        const next = new Map()
        let cx = 0
        while (cx < W) {
          const col = cells[cy * W + cx]
          if (!col) {
            cx++
            continue
          }
          let e = cx + 1
          while (e < W && cells[cy * W + e] === col) e++
          const key = `${col}|${cx}|${e}`
          const prev = open.get(key)
          if (prev) {
            prev.y1 = cy + 1
            next.set(key, prev)
            open.delete(key)
          } else next.set(key, { col, x0: cx, x1: e, y0: cy, y1: cy + 1 })
          cx = e
        }
        for (const r of open.values()) emit(r)
        open = next
      }
      for (const r of open.values()) emit(r)
      return [...byCol].map(([col, d]) => `<path fill="${col}" d="${d.join("")}"/>`).join("")
    },
  }
  return api
}

/* hộp vát sáng trên-trái: hi (viền sáng trên + trái), lo (viền tối dưới + phải) */
function hfBox(c, x, y, wd, ht, hi, main, lo, t = 2) {
  c.rect(x, y, wd, ht, main)
  c.rect(x, y, wd, t, hi)
  c.rect(x, y, t, ht, hi)
  c.rect(x, y + ht - t, wd, t, lo)
  c.rect(x + wd - t, y, t, ht, lo)
}

/* cụm nhóm (tán lá, mây): elip tô sáng ở trên-trái, tối ở dưới-phải */
function hfBlob(c, cx, cy, rx, ry, ramp, { bias = 0, k = 1.5, noise = 0, clipY = 1e9 } = {}) {
  c.ellipse(cx, cy, rx, ry, (px, py, nx, ny, ux, uy) => {
    if (py > clipY) return null
    const q = -0.62 * nx - 0.78 * ny
    const v = 1.35 - q * k + bias + (hfNoise(ux, uy) - 0.5) * noise
    return hfTone(ramp, v, 0.09, ux, uy)
  })
}

/* vân gỗ: các nét ngang 2 px ngắn, màu lệch nhẹ so với nền */
function hfGrain(c, x, y, wd, ht, tones, rnd, density = 0.5) {
  for (let py = y; py < y + ht; py += 2) {
    let px = x + Math.floor(rnd() * 8) * 2
    while (px < x + wd) {
      const len = (3 + Math.floor(rnd() * 8)) * 2
      if (rnd() < density) c.rect(px, py, Math.min(len, x + wd - px), 2, tones[Math.floor(rnd() * tones.length)])
      px += len + (1 + Math.floor(rnd() * 5)) * 2
    }
  }
}

/* bóng đổ hình bình hành xuống sàn: lệch dần sang phải (shear px) khi đi xuống; trả 0..1, mép mềm */
function hfShadowAmount(list, px, py) {
  let m = 0
  for (const s of list) {
    const t = hfClamp((py - s.y0) / (s.y1 - s.y0), 0, 1)
    const sh = s.shear * t
    const d = Math.min(px - (s.x0 + sh), s.x1 + sh - px, py - s.y0, s.y1 - py)
    m = Math.max(m, hfSmooth(-2, 3, d))
  }
  return m
}

const hfSvg = (w, h, body) =>
  `<svg class="scn-env__svg" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" aria-hidden="true">${body}</svg>`

function classroomSVG({ STAGE_W, STAGE_H, GROUND_Y }) {
  /* Lớp học buổi sáng, ánh nắng từ cửa sổ trên-trái: bảng xanh, bàn giáo viên với sách và hộp
     bút, hai hàng bàn ghế học sinh (sau hàng đứng của nhân vật), cửa sổ nắng với cây đung đưa,
     đồng hồ, bảng thông báo, quạt trần, sàn gạch. Tường 4 sắc, vệt nắng chéo từ cửa sổ xuống sàn,
     bóng đổ của đồ đạc sang phải. Vẽ trên lưới ô 2 px (xem hfCanvas). */
  const w = STAGE_W
  const h = STAGE_H
  const G = GROUND_Y
  const rnd = hfRng(11)
  const c = hfCanvas(w, h)

  const WALL = ["#ede7d5", "#e2dbc7", "#d6cdb8", "#c4baa5"]
  const FLOOR = ["#e0d6bc", "#d1c6a9", "#c0b495", "#a99d7f", "#908469"]
  const GROUT = ["#b6aa8d", "#a09479", "#8a7e66"]
  const INK = ["#6b7188", "#474c62", "#2f3347", "#1d2031"] // khung cửa sổ, vành đồng hồ, kim
  const WOOD = ["#b58f68", "#98724f", "#7b5a40", "#5b4332", "#3f2f25"] // gỗ gần (bảng, bàn giáo viên)
  const DESK = ["#b09578", "#987b5f", "#80644c", "#644e3e", "#4a3a2e"] // gỗ bàn học: nhạt, bớt tương phản
  const CROWN = [[24, 46, 6, 5], [34, 44, 8, 6], [28, 38, 10, 7], [38, 36, 6, 6], [24, 33, 6, 5], [32, 31, 7, 5]]
  const clamp3 = (v) => hfClamp(v, 0, 3)
  const BAND = [[18, 44], [48, 74]] // hai ô kính → hai vệt nắng chéo 45° (dx = dy)

  /* ---- tường: sáng quanh cửa sổ, tối dần sang phải, sát trần và sát chân tường */
  c.fill(0, 0, w, G, (px, py, cx, cy) => {
    let d = 1.05
    d -= Math.max(0, 1 - Math.hypot((px - 46) * 0.85, py - 54) / 84)
    d += 0.9 * hfSmooth(180, 320, px)
    d += 0.75 * hfSmooth(14, 0, py)
    d += 0.5 * hfSmooth(8, 0, px)
    d += 0.7 * hfSmooth(146, G - 4, py)
    return hfTone(WALL, d, 0.035, cx, cy)
  })
  /* ---- sàn gạch: hai hàng, lệch mạch; sáng ở vệt nắng, tối ở chân tường và dưới bóng đồ đạc */
  const shadows = []
  const deskX = [30, 82, 134, 186]
  for (const x of deskX) shadows.push({ x0: x + 2, x1: x + 36, y0: 172, y1: 182, shear: 8 })
  shadows.push({ x0: 228, x1: 292, y0: 172, y1: 182, shear: 10 })
  const lit = (px, py) => {
    let m = 0
    for (const [a, b] of BAND) {
      const dy = py - 74
      m = Math.max(m, hfSmooth(0, 7, Math.min(px - (a + dy), b + dy - px)))
    }
    return m
  }
  const rowsDef = [
    { y0: G, y1: G + 14, tw: 32, off: 0 },
    { y0: G + 14, y1: h, tw: 36, off: -18 },
  ]
  for (const r of rowsDef) {
    for (let tx = r.off; tx < w; tx += r.tw) {
      // mỗi viên gạch một sắc nguyên (tối dần sang phải, vài viên lệch ±1) để mặt gạch phẳng, chỉ mép mới phối caro
      const mid = tx + r.tw / 2
      const tile = 1 + (mid > 150 ? 1 : 0) + (rnd() < 0.3 ? 1 : 0) - (mid < 90 && rnd() < 0.45 ? 1 : 0)
      const x0 = Math.max(0, tx)
      const x1 = Math.min(w, tx + r.tw)
      c.fill(x0, r.y0, x1 - x0, r.y1 - r.y0, (px, py, cx, cy) => {
        const m = lit(px, py)
        const sh = hfShadowAmount(shadows, px, py)
        if (py >= r.y1 - 2 || px < tx + 2)
          return hfTone(GROUT, Math.round(1 - 0.8 * m + sh + 0.6 * hfSmooth(150, 320, px)), 0, cx, cy)
        const ao = py < G + 4 ? 1 : py < G + 6 && (cx + cy) & 1 ? 1 : 0 // bóng sát chân tường
        let v = tile + ao + sh - 2 * m
        if ((py < r.y0 + 2 && r.y0 > G) || px < tx + 4) v -= 1 // vát sáng mép trên + trái
        const fl = hfNoise(cx, cy, 3)
        if (fl > 0.965) v -= 1 // lấm tấm sáng
        else if (fl < 0.03) v += 1 // lấm tấm tối
        return hfTone(FLOOR, v, 0.1, cx, cy)
      })
    }
  }

  /* ---- len tường: gỗ tối, vát sáng trên, bóng sát sàn */
  const BB = ["#cfbfa1", "#aa9a7a", "#86765b", "#65574a"]
  c.fill(0, G - 8, w, 8, (px, py, cx, cy) => {
    const row = py - (G - 8)
    const v = (row < 2 ? 0 : row < 6 ? 1 : 3) + (hfSmooth(180, 320, px) > 0.5 ? 1 : 0) * (row < 2 ? 0 : 1) - (px < 60 && row >= 2 && row < 6 ? 0.3 : 0)
    return hfTone(BB, v, 0.1, cx, cy)
  })

  /* ---- bóng đổ trên tường của vật treo (sang phải và xuống dưới, 4 px) */
  const wallShadow = (x, y, wd, ht) => {
    c.rect(x + wd, y + 4, 2, ht - 4, WALL[2])
    c.dith(x + wd + 2, y + 4, 2, ht - 4, WALL[2])
    c.rect(x + 4, y + ht, wd, 2, WALL[2])
    c.dith(x + 4, y + ht + 2, wd, 2, WALL[2], 1)
  }
  wallShadow(114, 22, 104, 66) // bảng xanh + khay
  wallShadow(232, 26, 64, 48) // bảng thông báo

  /* ---- cửa sổ trái: trời, cây đung đưa ngoài sân, khung xám xanh, bệ cửa */
  const SKY = ["#a9cfe0", "#c3dde5", "#dbead9", "#efecc8"]
  const LAWN = ["#b4cd82", "#97b86b", "#7a9d57"]
  const HILL = ["#a7c0a8", "#92ae98"]
  const LEAF = ["#a9c86e", "#80a652", "#5f8647", "#456a3a"]
  c.rect(14, 22, 64, 56, INK[2])
  c.fill(18, 26, 56, 48, (px, py, cx, cy) => {
    const sd = Math.hypot(px - 64, py - 38)
    if (sd < 5) return "#fffbea"
    if (sd < 9) return (cx + cy) & 1 ? "#fbf5d6" : hfTone(SKY, clamp3((py - 26) / 10), 0.1, cx, cy)
    if (py >= 64) return hfTone(LAWN, (py - 64) / 5 + (px < 46 ? 0 : -0.4), 0.1, cx, cy)
    if (py >= 56) return hfTone(HILL, (py - 56) / 8, 0.1, cx, cy)
    return hfTone(SKY, clamp3((py - 26) / 10), 0.1, cx, cy)
  })
  // thân cây + tán (cụm lá tô sáng trên-trái, viền lá tối ở mép dưới/phải)
  c.rect(26, 50, 2, 24, "#8f6e4c")
  c.rect(28, 50, 2, 24, "#6f533c")
  c.rect(30, 50, 2, 24, "#4f3c2d")
  c.rect(24, 70, 10, 4, "#6f533c")
  const crown = hfCanvas(26, 48, 18, 26)
  for (const [bx, by, rx, ry] of CROWN) hfBlob(crown, bx, by, rx, ry, LEAF, { k: 1.45, noise: 0.5 })
  crown.rim((nx, ny, col) => (nx > 0 || ny > 0 ? LEAF[3] : col === LEAF[0] ? LEAF[1] : null))
  c.blit(crown)
  // khung + thanh dọc/ngang (vát sáng trên-trái)
  c.rect(14, 22, 64, 4, INK[2])
  c.rect(14, 74, 64, 4, INK[2])
  c.rect(14, 22, 4, 56, INK[2])
  c.rect(74, 22, 4, 56, INK[2])
  c.rect(44, 26, 4, 48, INK[2])
  c.rect(18, 48, 56, 2, INK[2])
  c.rect(14, 22, 64, 2, INK[1])
  c.rect(14, 22, 2, 56, INK[1])
  c.rect(44, 26, 2, 48, INK[1])
  c.rect(18, 48, 26, 2, INK[1])
  c.rect(48, 48, 26, 2, INK[1])
  c.rect(14, 76, 64, 2, INK[3])
  c.rect(76, 22, 2, 56, INK[3])
  c.rect(46, 26, 2, 48, INK[3])
  // bệ cửa + bóng của nó trên tường
  c.rect(10, 78, 72, 2, "#f2ecd9")
  c.rect(10, 80, 72, 2, "#ddd4bb")
  c.rect(10, 82, 72, 2, "#b3a98f")
  c.rect(14, 84, 66, 2, WALL[3])
  c.rect(14, 86, 66, 2, WALL[2])
  c.dith(14, 88, 66, 2, WALL[2])

  /* ---- quạt trần: thanh treo + động cơ (tĩnh); cánh quạt ở lớp chuyển động */
  c.rect(164, 0, 4, 6, INK[2])
  c.rect(164, 0, 2, 6, INK[1])
  hfBox(c, 156, 6, 20, 6, INK[0], INK[1], INK[3])
  c.dith(126, 16, 30, 2, WALL[2])
  c.dith(178, 16, 30, 2, WALL[2], 1)

  /* ---- bảng xanh: khung gỗ, mặt bảng bóng loáng, chữ phấn, khay phấn */
  hfBox(c, 114, 22, 104, 60, WOOD[0], WOOD[2], WOOD[4])
  const BG = ["#4f7564", "#3d6152", "#314f43", "#253e35"]
  c.fill(118, 26, 96, 52, (px, py, cx, cy) => {
    if (py < 28) return BG[3] // bóng của khung đổ lên mặt bảng (trên + trái)
    if (py < 30 || px < 120) return BG[2]
    let v = 1 + 0.38 * hfSmooth(150, 214, px)
    const d = px - 118 - (py - 26)
    if (d > 22 && d < 31) v -= 0.95
    if (d > 37 && d < 41) v -= 0.6
    return hfTone(BG, v, 0.1, cx, cy)
  })
  for (let i = 0; i < 16; i++) c.rect(124 + Math.floor(rnd() * 40) * 2, 68 + Math.floor(rnd() * 4) * 2, rnd() < 0.5 ? 2 : 4, 2, BG[0]) // bụi phấn
  const chalk = (y, x1, col) => {
    let x = 126
    while (x < x1) {
      const len = (3 + Math.floor(rnd() * 6)) * 2
      c.rect(x, y, Math.min(len, x1 - x), 2, col)
      x += len + 4
    }
  }
  c.rect(176, 32, 30, 2, "#ece7d6")
  chalk(44, 172, "#ece7d6")
  chalk(52, 188, "#cfcab6")
  chalk(60, 162, "#ece7d6")
  // khay phấn: mặt trên sáng, mặt trước, đáy tối
  c.rect(114, 82, 104, 2, "#bf9a6c")
  c.rect(114, 84, 104, 2, WOOD[2])
  c.rect(114, 86, 104, 2, WOOD[4])
  c.rect(124, 80, 8, 2, "#f4efe2")
  c.rect(136, 80, 6, 2, "#cfc9b6")
  c.rect(190, 76, 14, 6, "#3e4756")
  c.rect(190, 76, 14, 2, "#c9b68f")

  /* ---- bảng thông báo: khung gỗ, nền bần lốm đốm, giấy ghim có bóng */
  hfBox(c, 232, 26, 64, 48, WOOD[0], WOOD[2], WOOD[4])
  const CORK = ["#dcc99d", "#cbb485", "#b59c70", "#9b835b"]
  c.fill(236, 30, 56, 40, (px, py, cx, cy) => {
    const n = hfNoise(cx, cy, 5)
    let v = 1 + (n > 0.84 ? 1.7 : n < 0.12 ? -0.9 : 0)
    if (py < 34) v += 0.9
    if (px < 240) v += 0.5
    return hfTone(CORK, v, 0, cx, cy)
  })
  const paper = (x, y, wd, ht, col, pin, lines) => {
    c.rect(x + 2, y + 2, wd, ht, CORK[3])
    c.rect(x, y, wd, ht, col)
    c.rect(x, y, wd, 2, "#fbf8ec")
    c.rect(x + wd - 2, y + 2, 2, ht - 2, "#d6cfba")
    c.rect(x, y + ht - 2, wd, 2, "#d6cfba")
    for (let i = 0; i < lines; i++) c.rect(x + 2, y + 6 + i * 4, wd - 6 - (i % 2) * 2, 2, "#a8a3b0")
    c.rect(x + (wd >> 2 << 1), y + 2, 2, 2, pin)
  }
  paper(240, 34, 14, 16, "#f1ebd8", "#c4493b", 3)
  paper(262, 36, 14, 14, "#e5dfcc", "#3c6ea5", 2)
  paper(242, 54, 12, 12, "#e8e2cf", "#d6a935", 2)
  paper(264, 56, 14, 12, "#f1ebd8", "#c4493b", 2)

  /* ---- bàn giáo viên (phải): mặt bàn có vân, hai chân, tấm chắn, sách, hộp bút */
  c.rect(238, 152, 46, 12, "#9e947e")
  c.dith(238, 164, 46, 8, "#65574a", 1)
  c.rect(294, 124, 2, G - 8 - 124, WALL[2])
  c.dith(296, 124, 2, G - 8 - 124, WALL[2])
  c.rect(226, 116, 68, 8, WOOD[2])
  c.rect(226, 116, 68, 2, WOOD[0])
  c.rect(226, 118, 68, 2, WOOD[1])
  c.rect(226, 122, 68, 2, WOOD[4])
  hfGrain(c, 228, 118, 64, 4, [WOOD[0], WOOD[2]], rnd, 0.45)
  c.rect(226, 116, 2, 8, WOOD[0])
  for (const [lx, hiC] of [[228, WOOD[1]], [284, WOOD[1]]]) {
    c.rect(lx, 124, 8, 50, WOOD[3])
    c.rect(lx, 124, 2, 50, hiC)
    c.rect(lx + 6, 124, 2, 50, WOOD[4])
  }
  hfBox(c, 236, 124, 48, 28, WOOD[1], WOOD[2], WOOD[4])
  c.rect(238, 126, 44, 2, WOOD[4])
  for (const sx of [250, 264]) {
    c.rect(sx, 128, 2, 22, WOOD[3])
    c.rect(sx + 2, 128, 2, 22, WOOD[1])
  }
  c.rect(256, 138, 8, 2, "#d6b25a") // tay nắm
  const book = (x, y, wd, hi, main, lo) => {
    c.rect(x, y, wd, 6, main)
    c.rect(x, y, wd, 2, hi)
    c.rect(x, y + 4, wd, 2, lo)
    c.rect(x + wd - 2, y + 2, 2, 2, "#efe7cf")
  }
  book(232, 110, 24, "#5d7fa6", "#41628a", "#2b4565")
  book(234, 104, 20, "#7d9c63", "#5c7c46", "#3f5a33")
  book(236, 98, 16, "#b8705a", "#99503f", "#6e342b")
  hfBox(c, 270, 100, 14, 16, "#7f9fc2", "#527299", "#35506e")
  c.rect(270, 100, 14, 2, "#2c4258")
  c.rect(272, 90, 2, 10, "#eadfae")
  c.rect(276, 86, 2, 14, "#b4503f")
  c.rect(280, 92, 2, 8, "#5b7fa8")

  /* ---- bàn ghế liền khối (hàng sau): mặt bàn, hai chân, tấm ngồi nằm giữa hai chân; gỗ nhạt, bớt tương phản */
  const desk = (x, y) => {
    c.rect(x + 4, y + 22, 28, 6, DESK[2]) // tấm ngồi (sau chân bàn)
    c.rect(x + 4, y + 22, 28, 2, DESK[0])
    c.rect(x + 4, y + 26, 28, 2, DESK[4])
    c.rect(x + 6, y + 28, 24, 2, DESK[3])
    c.rect(x + 6, y + 6, 24, 4, DESK[2]) // thanh ngang dưới mặt bàn
    c.rect(x + 6, y + 6, 24, 2, DESK[3])
    for (const lx of [x + 2, x + 30]) {
      c.rect(lx, y + 6, 4, 40, DESK[3])
      c.rect(lx, y + 6, 2, 40, DESK[1])
      c.rect(lx + 2, y + 6, 2, 40, DESK[4])
    }
    c.rect(x, y, 36, 6, DESK[2]) // mặt bàn
    c.rect(x, y, 36, 2, DESK[0])
    c.rect(x, y + 2, 36, 2, DESK[1])
    c.rect(x, y + 4, 36, 2, DESK[4])
    c.rect(x, y, 2, 6, DESK[0])
    hfGrain(c, x + 2, y + 2, 32, 2, [DESK[0], DESK[2]], rnd, 0.35)
  }
  for (const x of deskX) desk(x, 130)
  c.rect(42, 126, 12, 4, "#f1ebd8") // tờ giấy + quyển vở trên bàn
  c.rect(42, 126, 12, 2, "#fbf8ec")
  c.rect(146, 124, 12, 6, "#6f8fb3")
  c.rect(146, 124, 12, 2, "#8fb0cf")
  c.rect(146, 128, 12, 2, "#4b6d92")

  /* ---- lớp chuyển động + ánh sáng */
  const sway = hfCanvas(26, 24, 18, 28) // lá lung linh: đúng các ô sáng nhất của tán cây trong ô kính trái
  sway.fill(18, 28, 26, 24, (px, py, cx, cy) =>
    c.get(px - 1, py - 1) === LEAF[0] && hfNoise(cx, cy, 9) > 0.3 ? "#d6ea94" : null,
  )
  const blades = hfCanvas(100, 8, 122, 8)
  for (const [bx, ex] of [[122, 156], [176, 210]]) {
    const left = bx === 122
    for (const [by, col] of [[8, "#9a7550"], [10, "#76563c"], [12, "#4d392b"]]) {
      const x0 = left ? bx + (by === 8 ? 8 : 0) : bx
      const x1 = left ? ex : ex - (by === 8 ? 8 : 0)
      blades.rect(x0, by, x1 - x0, 2, col)
    }
  }
  // vệt nắng chéo: quầng ngoài mờ + lõi sáng (chỉ trên tường; trên sàn nắng nằm trong màu gạch)
  const beamOuter = hfCanvas(w, G, 0, 0)
  const beamCore = hfCanvas(w, G, 0, 0)
  for (const [a, b] of BAND) {
    for (let py = 84; py < G; py += 2) {
      const dy = py - 74
      beamOuter.rect(a + dy - 4, py, b - a + 8, 2, "#fff1c2")
      beamCore.rect(a + dy, py, b - a, 2, "#fff1c2")
    }
  }

  /* ---- đồng hồ: nền tối + mặt có bóng (tĩnh) | kim giây (đúng là phần tử rect thứ 2 của nhóm,
     CSS quay quanh tâm riêng của nó) | kim giờ + chốt */
  c.ellipse(99, 41, 11, 11, WALL[2])
  const face = hfCanvas(26, 26, 84, 26)
  face.ellipse(97, 39, 11, 11, (px, py, nx, ny, ux, uy) => {
    const dx = px - 97
    const dy = py - 39
    if (Math.hypot(dx, dy) > 9) return dx + dy < -6 ? INK[1] : dx + dy > 6 ? INK[3] : INK[2]
    return hfTone(["#f8f3e4", "#ece6d3", "#d9d2bc"], 0.7 + (dx + dy) / 11, 0.1, ux, uy)
  })
  for (const [tx, ty] of [[96, 30], [96, 46], [88, 38], [104, 38]]) face.rect(tx, ty, 2, 2, INK[2])
  const clock =
    `<g class="scn-clock"><g>${face.paths()}</g>` +
    `<rect x="96" y="32" width="2" height="8" fill="${INK[3]}"/>` +
    `<rect x="92" y="38" width="6" height="2" fill="${INK[2]}"/>` +
    `<rect x="96" y="38" width="2" height="2" fill="#c9553f"/></g>`

  return hfSvg(
    w,
    h,
    c.paths() +
      `<g class="scn-rain">${sway.paths()}</g>` +
      `<g class="scn-rain">${blades.paths()}</g>` +
      clock +
      `<g opacity=".12">${beamOuter.paths()}</g>` +
      `<g opacity=".18"><g class="scn-rain">${beamCore.paths()}</g></g>`,
  )
}

function schoolyardSVG({ STAGE_W, STAGE_H, GROUND_Y }) {
  /* Sân trường giờ ra chơi, nắng sáng từ trên-trái: trời có mây, dãy phòng học hai tầng mái ngói đỏ
     (tường vàng nhạt, cửa xanh), tường thấp, ki-ốt nước giải khát mái hiên sọc, cây phượng lớn với
     ghế đá dưới tán, tường rào + hàng cây xa mờ, sân lát xi măng có vệt bóng cây đổ sang phải.
     Mặt sân bắt đầu từ chân tường (y 150); hàng gạch từ y 172 là phần gần người xem. */
  const w = STAGE_W
  const h = STAGE_H
  const G = GROUND_Y
  const Y0 = 150 // chân tường: bắt đầu mặt sân
  const rnd = hfRng(23)
  const c = hfCanvas(w, h)

  const SKY = ["#b1d0e0", "#c7dfe7", "#dcebe1", "#eeeed4"]
  const CLOUD = ["#fdfbf1", "#eef1ea", "#d2dee3"]
  const BW = ["#f0e9cf", "#e4dbbc", "#d3c9a6", "#b9ad8a"] // tường vàng nhạt
  const ROOF = ["#d4825f", "#b6644b", "#904a3c", "#693633"]
  const FRAME = ["#93b0a3", "#6f8f83", "#557469", "#3d5750"] // khung cửa xanh rêu
  const GLASS = ["#dcecf0", "#b3d2df", "#8db3c9", "#6c92ad"]
  const WOODS = ["#b79677", "#9b7b5e", "#80644b", "#624d3d", "#473829"] // gỗ nhạt, bớt tương phản
  const BARK = ["#a98763", "#82634a", "#5f4733", "#3f3023"]
  const LEAF = ["#b4cf77", "#89ac58", "#698f4a", "#4d713d", "#35543a"]
  const PAVE = ["#e0d9c4", "#d1c9b2", "#bfb69e", "#a8a089", "#8e8772"]
  const JOINT = ["#b4ab93", "#9f9680", "#898270"]

  /* ---- trời: xanh nhạt → vàng kem sát đường chân trời, sáng hơn về góc trên-trái (phía mặt trời) */
  c.fill(0, 0, w, Y0, (px, py, cx, cy) =>
    hfTone(SKY, hfClamp(py / 112, 0, 1) * 3 - 0.8 * Math.max(0, 1 - Math.hypot(px, py) / 180), 0.06, cx, cy),
  )
  const cloud = (parts) => {
    for (const [cx, cy, rx, ry, clip] of parts) hfBlob(c, cx, cy, rx, ry, CLOUD, { k: 1.05, bias: 0.15, clipY: clip })
  }
  cloud([[34, 11, 9, 5, 14], [46, 12, 10, 4, 14], [24, 13, 7, 3, 14]])
  cloud([[124, 9, 8, 4, 12], [136, 10, 10, 3, 12]])
  cloud([[188, 5, 8, 3, 8], [198, 6, 8, 3, 8]])

  /* ---- hàng cây xa mờ + tường rào (bên phải, sau cây phượng) */
  const FARC = ["#aec8b1", "#9ab5a0", "#86a290"]
  for (const [cx, cy, rx, ry] of [[236, 126, 14, 10], [256, 120, 16, 12], [280, 122, 16, 12], [302, 126, 16, 10], [318, 120, 10, 12]])
    hfBlob(c, cx, cy, rx, ry, FARC, { k: 1, bias: 0.3, noise: 0.35 })
  c.fill(222, 136, 98, 14, (px, py, cx, cy) => {
    if (py < 138) return "#efe8d2"
    return hfTone(["#e6dec6", "#d4cbb0", "#bdb398"], (py - 138) / 12 + 0.2 + 0.5 * hfSmooth(222, 320, px), 0.1, cx, cy)
  })
  for (const px of [238, 278, 316]) {
    c.rect(px, 130, 8, 20, "#e0d8bd")
    c.rect(px, 130, 8, 2, "#f3ecd6")
    c.rect(px + 6, 132, 2, 18, "#bdb398")
  }

  /* ---- dãy phòng học: mái ngói 3 hàng, diềm, tường vàng, gờ sàn giữa hai tầng */
  c.fill(0, 40, 224, Y0 - 40, (px, py, cx, cy) => {
    let v = 0.9 - 0.35 * hfSmooth(110, 8, px) + 0.5 * hfSmooth(70, 224, px)
    v += 1.5 * hfSmooth(54, 40, py) // bóng mái hiên
    v += 0.8 * hfSmooth(196, 224, px)
    v += 0.7 * hfSmooth(134, 150, py)
    return hfTone(BW, v, 0.035, cx, cy)
  })
  c.rect(0, 40, 2, Y0 - 40, "#f6f0dd")
  c.rect(222, 40, 2, Y0 - 40, BW[3])
  c.rect(0, 20, 222, 2, ROOF[0])
  c.rect(0, 22, 222, 2, ROOF[2])
  c.fill(0, 24, 228, 12, (px, py, cx, cy) => {
    const k = Math.floor((py - 24) / 4)
    const off = (k & 1) * 4
    const lx = (((px - 4 + off) % 8) + 8) % 8
    const mid = px - lx + 4
    const side = mid > 190 ? 2 : mid > 100 ? 1 : 0
    let v = (py - 24) % 4 < 2 ? 0 : 1
    if (lx === 7) v += 1
    return ROOF[hfClamp(v + side, 0, 3)]
  })
  c.rect(0, 36, 228, 2, "#f1ead4")
  c.rect(0, 38, 228, 2, "#b3a684")
  c.rect(0, 78, 224, 2, "#f5efdb") // gờ sàn tầng hai
  c.rect(0, 80, 224, 2, "#d9ceac")
  c.rect(0, 82, 224, 2, BW[3])
  c.rect(0, 84, 224, 2, BW[2])
  c.dith(0, 86, 224, 2, BW[2])
  c.rect(0, 144, 224, 2, "#d3c9a7") // bệ chân tường
  c.rect(0, 146, 224, 4, "#a79c7c")

  const win = (x, y) => {
    c.rect(x, y, 32, 24, FRAME[2])
    c.rect(x, y, 32, 2, FRAME[1])
    c.rect(x, y, 2, 24, FRAME[1])
    c.rect(x, y + 22, 32, 2, FRAME[3])
    c.rect(x + 30, y, 2, 24, FRAME[3])
    c.fill(x + 4, y + 4, 24, 16, (px, py, cx, cy) => {
      const d = px - x - 4 + (py - y - 4) * 0.9
      let v = 0.4 + ((py - y - 4) / 16) * 1.8
      if (d > 10 && d < 16) v -= 0.7 // vệt phản quang chéo
      if (d > 21 && d < 24) v -= 0.4
      if (py < y + 6) v += 0.7 // bóng khung đổ xuống kính
      return hfTone(GLASS, v, 0.1, cx, cy)
    })
    c.rect(x + 14, y + 4, 4, 16, FRAME[2])
    c.rect(x + 14, y + 4, 2, 16, FRAME[1])
    c.rect(x + 16, y + 4, 2, 16, FRAME[3])
    c.rect(x - 2, y + 24, 36, 2, "#f3edd5") // bệ cửa
    c.rect(x - 2, y + 26, 36, 2, "#cdc2a0")
    c.rect(x, y + 28, 32, 2, BW[3])
    c.dith(x + 2, y + 30, 32, 2, BW[2])
  }
  for (const x of [24, 72, 120, 168]) win(x, 48)
  for (const x of [24, 72]) win(x, 88)

  /* cửa chính: khung kem, hai cánh xanh có lá sách, ô kính, bậc thềm */
  const DOOR = ["#7ea08d", "#5d8170", "#436253", "#2e473d"]
  c.rect(118, 104, 34, 46, "#ece4c8")
  c.rect(118, 104, 34, 2, "#f6f0dc")
  c.rect(118, 104, 2, 46, "#f6f0dc")
  c.rect(150, 104, 2, 46, "#bfb592")
  c.fill(122, 108, 26, 42, (px, py, cx, cy) => {
    if (px >= 134 && px < 136) return DOOR[3] // khe giữa hai cánh
    const left = px < 134
    const lx = left ? px - 122 : px - 136
    if (py < 124 && lx > 2 && lx < 10 + (left ? 0 : 0)) return hfTone(GLASS, 0.5 + (py - 108) / 14, 0.1, cx, cy) // ô kính
    if (py >= 126 && py < 146) return ((py - 126) >> 1) & 1 ? DOOR[3] : DOOR[1] // lá sách
    return lx < 2 ? DOOR[0] : lx > 10 ? DOOR[3] : DOOR[2]
  })
  c.rect(122, 108, 26, 2, DOOR[3])
  c.rect(130, 132, 2, 4, "#d8b85a")
  c.rect(138, 132, 2, 4, "#d8b85a")
  c.rect(114, 150, 42, 2, "#e6dec4") // bậc thềm
  c.rect(114, 152, 42, 2, "#b6aa8a")

  /* ---- tường thấp bên trái: trụ + tường quét vôi, đổ bóng dưới nắp */
  const LW = ["#e8e0c6", "#d6cdaf", "#c0b695", "#a69b7a"]
  c.fill(0, 126, 104, 26, (px, py, cx, cy) => {
    if (py < 128) return "#f1ead3"
    if (py < 130) return LW[2]
    let v = 0.9 + (px > 60 ? 0.5 : 0) + (py > 146 ? 1 : 0) + (py < 134 ? 0.9 : 0)
    return hfTone(LW, v, 0.05, cx, cy)
  })
  for (const px of [0, 32, 64, 96]) {
    c.rect(px, 120, 8, 32, LW[1])
    c.rect(px, 120, 8, 2, "#f6f0dc")
    c.rect(px, 122, 2, 30, "#f1ead3")
    c.rect(px + 6, 122, 2, 30, LW[2])
    c.rect(px, 150, 8, 2, LW[3])
  }

  /* ---- ki-ốt nước giải khát: mái hiên sọc, quầy gỗ, chai nước */
  c.rect(168, 112, 48, 10, "#54443a")
  c.rect(168, 112, 48, 4, "#3b2f2a")
  for (const [i, col, hi] of [[0, "#4f7fa3", "#86b0cf"], [1, "#5f9157", "#97c58b"], [2, "#d2593f", "#f08a6c"], [3, "#d7ab38", "#f2d278"]]) {
    const bx = 172 + i * 10
    c.rect(bx, 114, 6, 6, col)
    c.rect(bx + 2, 112, 2, 2, "#e9e2c9")
    c.rect(bx, 114, 2, 6, hi)
  }
  c.rect(164, 120, 56, 2, "#cfab7a")
  c.rect(164, 122, 56, 2, "#9d7b55")
  c.fill(166, 124, 52, 32, (px, py, cx, cy) => {
    const lx = (px - 166) % 10
    const v = lx < 2 ? 0 : lx > 7 ? 3 : 1.4
    return hfTone(WOODS, v + (py > 148 ? 1 : 0) + (px > 190 ? 0.3 : 0), 0.0, cx, cy)
  })
  c.rect(166, 154, 52, 2, WOODS[4])
  for (const px of [164, 216]) {
    c.rect(px, 100, 4, 56, WOODS[3])
    c.rect(px, 100, 2, 56, WOODS[1])
    c.rect(px + 2, 100, 2, 56, WOODS[4])
  }
  const AW = [["#d9715a", "#b9503e", "#8f3d33"], ["#fbf6e4", "#e6dec3", "#c8bd9d"]]
  c.fill(166, 98, 52, 4, (px, py, cx, cy) => AW[(Math.floor((px - 160) / 8) & 1)][py < 100 ? 0 : 1])
  for (let i = 0; i < 8; i++) {
    const sx = 160 + i * 8
    const [hi, mid, lo] = AW[i & 1]
    c.rect(sx, 102, 8, 8, mid)
    c.rect(sx, 102, 8, 2, hi)
    c.rect(sx, 102, 2, 8, hi)
    c.rect(sx + 6, 104, 2, 6, lo)
    c.rect(sx + 2, 110, 4, 2, lo) // diềm hình vòm
  }

  /* ---- mặt sân: bốn hàng gạch, rộng dần về phía người xem, lệch mạch; lấm tấm; bóng đổ sang phải */
  const shadows = [
    { x0: 6, x1: 102, y0: 150, y1: 160, shear: 8 },
    { x0: 166, x1: 220, y0: 154, y1: 164, shear: 10 },
    { x0: 244, x1: 294, y0: 160, y1: 170, shear: 8 },
    { x0: 258, x1: 272, y0: 158, y1: 172, shear: 46 },
  ]
  const dapple = (px, py, cx, cy) => {
    const e = ((px - 276) / 56) ** 2 + ((py - 168) / 18) ** 2
    if (e > 1) return 0
    return hfNoise(cx >> 1, cy >> 1, 7) < 0.78 - 0.55 * e ? 1 : 0 // bóng tán lá: mảng 4 px, thưa dần ra mép
  }
  const rowsDef = [
    { y0: Y0, y1: 160, tw: 20, off: -8 },
    { y0: 160, y1: G, tw: 26, off: 0 },
    { y0: G, y1: G + 14, tw: 34, off: -16 },
    { y0: G + 14, y1: h, tw: 40, off: 0 },
  ]
  for (const r of rowsDef) {
    for (let tx = r.off; tx < w; tx += r.tw) {
      const mid = tx + r.tw / 2
      const tile = 1 + (mid > 190 ? 1 : 0) + (rnd() < 0.28 ? 1 : 0) - (mid < 90 && rnd() < 0.45 ? 1 : 0)
      const x0 = Math.max(0, tx)
      const x1 = Math.min(w, tx + r.tw)
      c.fill(x0, r.y0, x1 - x0, r.y1 - r.y0, (px, py, cx, cy) => {
        const sh = Math.max(hfShadowAmount(shadows, px, py), dapple(px, py, cx, cy))
        if (py >= r.y1 - 2 || px < tx + 2) return hfTone(JOINT, Math.round(1 + sh * 0.6 + (px > 230 ? 0.4 : 0)), 0, cx, cy)
        const ao = py < Y0 + 2 ? 1 : py < Y0 + 4 && (cx + cy) & 1 ? 1 : 0 // bóng sát chân tường
        let v = tile + Math.min(1.3, ao + sh)
        if ((py < r.y0 + 2 && r.y0 > Y0) || px < tx + 4) v -= 1
        const fl = hfNoise(cx, cy, 3)
        if (fl > 0.965) v -= 1
        else if (fl < 0.03) v += 1
        return hfTone(PAVE, v, 0.1, cx, cy)
      })
    }
  }
  // cánh hoa phượng rơi dưới tán
  for (let i = 0; i < 12; i++) {
    const x = 232 + Math.floor(rnd() * 44) * 2
    const y = 156 + Math.floor(rnd() * 15) * 2
    c.rect(x, y, 2, 2, i % 3 ? "#cf5742" : "#e7806a")
  }

  /* ---- cây phượng lớn: thân có vân vỏ + gốc xoè, hai cành, tán nhiều cụm, hoa đỏ */
  for (let py = 76; py < 160; py += 2) {
    const flare = Math.max(0, Math.round(((py - 140) / 20) * 2)) * 2
    const x0 = 258 - flare
    const x1 = 270 + flare
    for (let px = x0; px < x1; px += 2) {
      const u = (px + 1 - x0) / (x1 - x0)
      let t = u < 0.2 ? 0 : u < 0.5 ? 1 : u < 0.8 ? 2 : 3
      const n = hfNoise(px >> 1, py >> 2, 11)
      if (n > 0.82) t = Math.min(3, t + 1)
      else if (n < 0.1) t = Math.max(0, t - 1)
      c.set(px, py, BARK[t])
    }
  }
  const crown = hfCanvas(114, 72, 206, 14)
  const BLOBS = [[268, 24, 20, 10], [240, 34, 18, 12], [296, 34, 20, 12], [258, 40, 22, 14], [286, 46, 22, 14], [226, 48, 16, 12], [310, 52, 14, 12], [246, 56, 20, 12], [272, 60, 22, 12], [298, 64, 18, 10], [230, 66, 14, 8], [256, 70, 16, 8], [284, 72, 16, 8], [268, 78, 12, 5]]
  for (const [bx, by, rx, ry] of BLOBS) hfBlob(crown, bx, by, rx, ry, LEAF, { k: 1.55, bias: ((by - 40) / 60) * 0.5, noise: 0.6 })
  crown.rim((nx, ny) => (nx > 0 || ny > 0 ? LEAF[4] : LEAF[2]))
  for (let i = 0; i < 18; i++) {
    const x = 208 + Math.floor(rnd() * 54) * 2
    const y = 18 + Math.floor(rnd() * 32) * 2
    if (!crown.get(x, y) || !crown.get(x + 2, y)) continue
    crown.rect(x, y, 4, 2, "#d5523d")
    crown.rect(x, y, 2, 2, "#ec7f63")
    if (rnd() < 0.5) crown.rect(x + 2, y + 2, 2, 2, "#b53f33")
  }
  c.blit(crown)

  /* ---- ghế đá dưới cây: lưng tựa hai thanh, mặt ghế, chân; gỗ nhạt */
  for (const px of [244, 286]) {
    c.rect(px, 128, 4, 34, WOODS[3])
    c.rect(px, 128, 2, 34, WOODS[1])
    c.rect(px + 2, 128, 2, 34, WOODS[4])
  }
  for (const py of [130, 138]) {
    c.rect(240, py, 56, 6, WOODS[2])
    c.rect(240, py, 56, 2, WOODS[0])
    c.rect(240, py + 4, 56, 2, WOODS[4])
    c.rect(240, py, 2, 6, WOODS[0])
    hfGrain(c, 242, py + 2, 52, 2, [WOODS[0], WOODS[2]], rnd, 0.3)
  }
  c.rect(240, 148, 56, 6, WOODS[2])
  c.rect(240, 148, 56, 2, WOODS[0])
  c.rect(240, 152, 56, 2, WOODS[4])
  c.rect(240, 148, 2, 6, WOODS[0])
  hfGrain(c, 242, 150, 52, 2, [WOODS[0], WOODS[2]], rnd, 0.3)

  /* ---- lớp chuyển động: lá phượng lung linh (các ô sáng nhất của tán) */
  const sway = hfCanvas(114, 72, 206, 14)
  sway.fill(206, 14, 114, 72, (px, py, cx, cy) =>
    crown.get(px - 1, py - 1) === LEAF[0] && hfNoise(cx, cy, 13) > 0.4 ? "#dcee98" : null,
  )

  return hfSvg(w, h, c.paths() + `<g class="scn-rain">${sway.paths()}</g>`)
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
/* Người qua lại phía sau: tắt. Bản thử dùng người tí hon mờ đứng sau nhân vật chính trông như
   bóng ma và làm cảnh rối mắt, nên mọi bối cảnh để trống; cảnh nào thật cần thì khai báo
   `extras` riêng trong dữ liệu. */
export const ENV_AMBIENT = {}
