/* sprites.js — nhân vật chi tiết (hi-fi) + biểu cảm + người qua lại cho hệ thống cảnh tình huống EQ.

   NHÂN VẬT không còn là lưới gõ tay: mọi id mà cảnh dùng (player, classmate, classmate2, friend,
   friend2, teacher, teacherF, mom, kid) lấy từ HIFI_CAST trong hifi/cast.js:
     HIFI_CAST[id] = { frames, palette, cols, rows, cell }   (36 x 60 ô, 2 px/ô => 72 x 120 px)
   Tên khung (xem hifi/characterKit.js):
     <mood>-idle / <mood>-talk   mood: neutral happy sad annoyed concerned defensive
     neutral-react               phản ứng ngắn (ngạc nhiên, sững lại...)
     neutral-blink               nhắm mắt (runtime dùng để chớp)
     neutral-breathe             nhịp thở (xen thưa thớt khi đứng yên)
     walk-a walk-b walk-c walk-d chu kỳ đi: a, c, b, d
   Mood hiện tại quyết định khung nào được render; runtime xen các micro-beat (blink, breathe,
   glance, weight-shift) XUNG QUANH khung mood đó.

   Cùng file này còn có EMOTES (lưới nhỏ trên đầu) và EXTRAS (người tí hon phía sau). */

import { el } from "../core/dom.js"
import * as CAST from "./hifi/cast.js"

/** Bảng màu mặc định cho svgFor khi không truyền bảng màu (chỉ viền mực). */
const P = { o: "#16181c" }

/* ------------------------------------------------------------------ dàn nhân vật */
const HIFI_CAST = CAST.HIFI_CAST ?? {}

/** frames của từng nhân vật: { "<mood>-idle": rows, ... } */
export const CHARACTERS = Object.fromEntries(Object.entries(HIFI_CAST).filter(([, c]) => c?.frames).map(([id, c]) => [id, c.frames]))

/** Bảng màu riêng theo nhân vật (ký tự → "#rrggbb"). */
export const CHARACTER_PALETTES = Object.fromEntries(Object.entries(HIFI_CAST).filter(([, c]) => c?.frames).map(([id, c]) => [id, c.palette]))

const isBlankRow = (row) => !/[^. ]/.test(row)
const metricsCache = new Map()

/**
 * Kích thước thật của một nhân vật, suy ra từ chính các khung đã vẽ (không đoán):
 *   w, h         cỡ sprite theo px sân khấu (cols x cell, rows x cell)
 *   firstRow     hàng đầu tiên có điểm ảnh của khung đứng nghỉ (đỉnh tóc)
 *   lastRow      hàng cuối cùng có điểm ảnh (gót giày)
 *   headTop      khoảng từ đỉnh khung sprite tới đỉnh đầu (px) = firstRow x cell
 *   footPad      px trống dưới chân trong khung; runtime hạ khung xuống để chân vẫn đứng đúng y≈186
 */
export function characterMetrics(id) {
  if (metricsCache.has(id)) return metricsCache.get(id)
  const cast = HIFI_CAST[id]
  if (!cast?.frames) return null
  const frames = cast.frames
  const rows = frames["neutral-idle"] ?? Object.values(frames)[0] ?? []
  const cell = cast.cell ?? 2
  const nRows = cast.rows ?? rows.length
  const nCols = cast.cols ?? (rows[0]?.length ?? 36)
  let firstRow = rows.findIndex((r) => !isBlankRow(r))
  if (firstRow < 0) firstRow = 0
  let lastRow = rows.length - 1
  while (lastRow > firstRow && isBlankRow(rows[lastRow])) lastRow -= 1
  const m = {
    cols: nCols,
    rows: nRows,
    cell,
    w: nCols * cell,
    h: nRows * cell,
    firstRow,
    lastRow,
    headTop: firstRow * cell,
    footPad: Math.max(0, nRows - 1 - lastRow) * cell,
  }
  metricsCache.set(id, m)
  return m
}

/* ------------------------------------------------------------------ chân dung
   Hộp chân dung bên cạnh khung thoại: dùng portraitFor(id, mood, talking) của cast.js nếu có,
   không thì cắt phần đầu (18 hàng x 20 cột, tính từ đỉnh tóc thật của nhân vật) từ chính khung. */
const PORTRAIT_COLS = [8, 28]
const PORTRAIT_ROWS = 18
const portraitCache = new Map()

function viewBoxOf(svg) {
  const m = /viewBox="[\d.\s-]*?([\d.]+)\s+([\d.]+)"/.exec(svg)
  return m ? { cols: Number(m[1]), rows: Number(m[2]) } : null
}

/**
 * Chân dung của một nhân vật: { svg, cols, rows } (svg là chuỗi HTML), hoặc null nếu không có nhân vật.
 * @param {string} id
 * @param {string} mood      neutral | happy | sad | annoyed | concerned | defensive
 * @param {boolean} talking  miệng mở
 * @param {string} [frame]   tên khung hiện tại của sprite (để chân dung chớp mắt/phản ứng khớp); chỉ dùng khi tự cắt
 */
export function portraitSVG(id, mood = "neutral", talking = false, frame = null) {
  const cast = HIFI_CAST[id]
  if (!cast?.frames) return null
  const key = `${id}|${mood}|${talking ? 1 : 0}|${frame ?? ""}`
  if (portraitCache.has(key)) return portraitCache.get(key)
  let out = null
  if (typeof CAST.portraitFor === "function") {
    try { out = fromPortraitFor(CAST.portraitFor(id, mood, talking), cast) } catch (err) { console.warn("[sprites] portraitFor lỗi:", id, err) }
  }
  out ??= cropPortrait(id, cast, mood, talking, frame)
  portraitCache.set(key, out)
  return out
}

/** portraitFor có thể trả: chuỗi <svg>, mảng hàng, {svg}, hoặc {rows: string[], palette?}. */
function fromPortraitFor(got, cast) {
  if (!got) return null
  if (typeof got === "string") {
    const vb = viewBoxOf(got)
    return got.trimStart().startsWith("<svg") && vb ? { svg: got, ...vb } : null
  }
  if (Array.isArray(got)) return rowsPortrait(got, cast.palette)
  if (typeof got.svg === "string") return fromPortraitFor(got.svg, cast)
  if (Array.isArray(got.rows)) return rowsPortrait(got.rows, got.palette ?? cast.palette)
  return null
}
function rowsPortrait(rows, palette) {
  if (!rows.length || typeof rows[0] !== "string") return null
  return { svg: svgFor(rows, palette), cols: rows[0].length, rows: rows.length }
}

function cropPortrait(id, cast, mood, talking, frame) {
  const frames = cast.frames
  const name = [frame, `${mood}-${talking ? "talk" : "idle"}`, `neutral-${talking ? "talk" : "idle"}`, "neutral-idle"].find((n) => n && frames[n])
  const src = frames[name] ?? Object.values(frames)[0]
  if (!src) return null
  const top = characterMetrics(id)?.firstRow ?? 0
  const rows = src.slice(top, top + PORTRAIT_ROWS).map((r) => r.slice(PORTRAIT_COLS[0], PORTRAIT_COLS[1]))
  return rowsPortrait(rows, cast.palette)
}

/**
 * Dựng một node SVG từ lưới ký tự. Trả về chuỗi HTML <svg> viewBox khớp lưới.
 * @param {string[]} rows
 * @returns {string}
 */
export function svgFor(rows, palette = P) {
  const h = rows.length
  const w = rows[0].length
  const rects = []
  for (let y = 0; y < h; y += 1) {
    const row = rows[y]
    let x = 0
    while (x < row.length) {
      const ch = row[x]
      if (ch === "." || ch === " ") {
        x += 1
        continue
      }
      let run = 1
      while (x + run < row.length && row[x + run] === ch) run += 1
      rects.push(`<rect x="${x}" y="${y}" width="${run}" height="1" fill="${palette[ch] || "#000"}"/>`)
      x += run
    }
  }
  return `<svg viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${rects.join("")}</svg>`
}

/**
 * Tạo một sprite container chứa MỌI biến thể của một nhân vật (ẩn/show theo class).
 * Mỗi khung hi-fi có hàng trăm <rect>, mà một nhân vật có ~20 khung: nên node SVG của khung chỉ được
 * dựng LẦN ĐẦU khi khung đó được hiện (`frames` biết đủ tên khung từ đầu: `frames.has(name)` đúng
 * ngay, còn `frames.get(name)` là null tới khi khung từng hiện); khung nghỉ đầu tiên dựng sẵn.
 * @returns {{setFrame(name:string):void, frames:Map<string,Element|null>}}
 */
export function createSpriteSet(container, frames, palette = P) {
  const set = new Map(Object.keys(frames).map((name) => [name, null]))
  let current = null
  function build(name) {
    const node = el("div", { class: "scn-sprite__frame", attrs: { "data-frame": name } })
    node.innerHTML = svgFor(frames[name], palette ?? P)
    container.append(node)
    set.set(name, node)
    return node
  }
  function setFrame(name) {
    if (name === current || !set.has(name)) return
    const next = set.get(name) ?? build(name)
    if (current) set.get(current)?.classList.remove("is-on")
    next.classList.add("is-on")
    current = name
  }
  return { setFrame, frames: set }
}

/* ================================================================== biểu cảm (emote)
   Lưới điểm ảnh nhỏ hiện trên đầu nhân vật. Mỗi emote là một mảng chuỗi cùng độ dài;
   "." = trong suốt. Khoá màu nằm trong EMOTE_PALETTE. */
export const EMOTE_PALETTE = {
  o: "#16181c", // viền mực
  w: "#fbf8ee", // trắng kem
  b: "#4a90c8", // xanh nước
  B: "#a9d3ee", // xanh nhạt (ánh)
  r: "#d1443b", // đỏ
  R: "#f08a7e", // đỏ nhạt
  y: "#f2c230", // vàng
  Y: "#fff0a8", // vàng nhạt
  p: "#e0607e", // hồng
  v: "#7a58b8", // tím
  g: "#8f9aa6", // xám
  G: "#4a5058", // xám tối
}

export const EMOTES = {
  sweat: [
    "....o....",
    "...oBo...",
    "..oBbbo..",
    "..oBbbo..",
    ".oBbbbbo.",
    ".obbbbbo.",
    ".obbbbbo.",
    "..obbbo..",
    "...ooo...",
  ],
  anger: [
    "oo.....oo",
    "orro.orro",
    ".orrrorr.",
    "..orrro..",
    "...orro..",
    "..orrrro.",
    ".orro.rro",
    "orro...ro",
    "oo.....oo",
  ],
  heart: [
    ".ooo.ooo.",
    "oRRroRrro",
    "oRwrrrrro",
    "orrrrrrro",
    ".orrrrro.",
    "..orrro..",
    "...oro...",
    "....o....",
  ],
  sparkle: [
    "....o....",
    "...oyo...",
    "...oyo...",
    ".oooYooo.",
    "oyyYYYyyo",
    ".oooYooo.",
    "...oyo...",
    "...oyo...",
    "....o....",
  ],
  question: [
    "..ooooo..",
    ".obbbbbo.",
    "obBooobbo",
    "ooo.obbo.",
    "....obo..",
    "...obbo..",
    "...obo...",
    "...ooo...",
    "...obo...",
    "...ooo...",
  ],
  exclaim: [
    "...ooo...",
    "..orrro..",
    "..orRro..",
    "..orrro..",
    "..orrro..",
    "...orro..",
    "...ooo...",
    "...orro..",
    "...ooo...",
  ],
  ellipsis: [
    "ooo.ooo.ooo",
    "oGo.oGo.oGo",
    "ooo.ooo.ooo",
  ],
  tear: [
    "...o...",
    "..oBo..",
    "..oBbo.",
    ".oBbbbo",
    ".obbbbo",
    ".obbbbo",
    "..obbo.",
    "...oo..",
  ],
  music: [
    "...oooooo",
    "...ovvvvo",
    "...ovooo.",
    "...ov.o..",
    "...ov.o..",
    ".ooov.o..",
    "ovvvo.o..",
    "ovvvo....",
    ".ooo.....",
  ],
  zzz: [
    "ooooooo.",
    "obbbbbo.",
    "oooobbo.",
    "...obo..",
    "..obo...",
    ".obooooo",
    "obbbbbbo",
    "oooooooo",
  ],
  gloom: [
    "...ooo....",
    "..oGGGo.o.",
    ".oGGGGGoGo",
    "oGGGGGGGGo",
    "oGGGGGGGGo",
    ".oooooooo.",
    "..b..b..b.",
    ".b..b..b..",
    "..b..b....",
  ],
}

/** Chuỗi SVG của một emote, hoặc "" nếu không có loại đó. */
export function emoteSVG(kind) {
  const rows = EMOTES[kind]
  return rows ? svgFor(rows, EMOTE_PALETTE) : ""
}

/* ================================================================== người qua lại (EXTRAS)
   Học sinh tí hon ~10x16 ô làm phông phía sau: đứng, đi (hai nhịp), ngồi. Ba biến thể đồng phục.
   Khoá: o viền, h tóc, s da, E mắt, S áo, T quần/váy. */
const EXTRA_FRAMES = {
  stand: [
    "..oooooo..",
    ".ohhhhhho.",
    ".ohhhhhho.",
    ".ohssssho.",
    ".osEssEso.",
    ".osssssso.",
    "..oossoo..",
    ".oSSSSSSo.",
    "oSSSSSSSSo",
    "oSSSSSSSSo",
    "oSSSSSSSSo",
    ".oSSSSSSo.",
    ".oTTTTTTo.",
    ".oTTooTTo.",
    ".oTo..oTo.",
    ".ooo..ooo.",
  ],
  "walk-a": [
    "..oooooo..",
    ".ohhhhhho.",
    ".ohhhhhho.",
    ".ohssssho.",
    ".osEssEso.",
    ".osssssso.",
    "..oossoo..",
    ".oSSSSSSo.",
    "oSSSSSSSSo",
    "oSSSSSSSSo",
    ".oSSSSSSo.",
    ".oSSSSSSo.",
    ".oTTTTTTo.",
    "oTTTooTTTo",
    "oTTo..oTTo",
    "ooo....ooo",
  ],
  "walk-b": [
    "..oooooo..",
    ".ohhhhhho.",
    ".ohhhhhho.",
    ".ohssssho.",
    ".osEssEso.",
    ".osssssso.",
    "..oossoo..",
    ".oSSSSSSo.",
    "oSSSSSSSSo",
    "oSSSSSSSSo",
    ".oSSSSSSo.",
    ".oSSSSSSo.",
    ".oTTTTTTo.",
    ".oTTooTTo.",
    "..oTooTo..",
    "..ooo.ooo.",
  ],
  sit: [
    "..oooooo..",
    ".ohhhhhho.",
    ".ohhhhhho.",
    ".ohssssho.",
    ".osEssEso.",
    ".osssssso.",
    "..oossoo..",
    ".oSSSSSSo.",
    "oSSSSSSSSo",
    "oSSSSSSSSo",
    ".oSSSSSSo.",
    ".oTTTTTTTo",
    ".oTTTTTTTo",
    "..oTo..oTo",
    "..ooo..ooo",
    "..........",
  ],
}

const EXTRA_PALETTES = [
  { o: "#16181c", h: "#3a2a1f", s: "#f0c9a3", E: "#16181c", S: "#efece3", T: "#2e3f63" },
  { o: "#16181c", h: "#23262b", s: "#d9a878", E: "#16181c", S: "#efece3", T: "#2e3f63" },
  { o: "#16181c", h: "#6b4f39", s: "#f0c9a3", E: "#16181c", S: "#6b8047", T: "#3f4652" },
]

/* Con mèo ngủ cuộn tròn (phòng ngủ). */
const EXTRA_CAT = [
  "..o.o.......",
  ".oGGGGoooo..",
  "oGGGGGGGGGo.",
  "oGgGGGGGGGGo",
  ".oooooooooo.",
]
const CAT_PALETTE = { o: "#16181c", G: "#8f7a60", g: "#5d4530" }

export const EXTRAS = {
  frames: EXTRA_FRAMES,
  palettes: EXTRA_PALETTES,
  cat: EXTRA_CAT,
  cols: 10,
  rows: 16,
}

/** SVG của một người qua lại: variant 0-2, frame stand | walk-a | walk-b | sit | cat. */
export function extraSVG(variant = 0, frame = "stand") {
  if (frame === "cat") return svgFor(EXTRA_CAT, CAT_PALETTE)
  const rows = EXTRA_FRAMES[frame] ?? EXTRA_FRAMES.stand
  const pal = EXTRA_PALETTES[variant % EXTRA_PALETTES.length]
  return svgFor(rows, pal)
}
