/* character.js — nhân vật pixel tự vẽ (không sao chép tài sản của game nào khác).
   Lưới 24x30 khớp đúng tỉ lệ khung 96x120 nên mỗi ô là 4x4 điểm ảnh, không bao giờ mờ.
   Dáng: mũ lưỡi trai, tóc mái đen xanh, kính gọng sáng, áo đấu số 78, quần đùi, giày trắng.
   Biểu cảm: neutral · blink · thinking · concerned · happy · surprised (kèm biến thể "-t" khi đang nói). */

import { el } from "../core/dom.js"
import { prefersReducedMotion } from "../core/motion.js"

const PALETTE = {
  o: "#141821", // viền mực
  G: "#6f7f4f", // áo len xanh ô-liu dịu (màu chính của nhân vật)
  q: "#4f5c37", // áo len — tay áo & nếp gấp
  C: "#f4efe2", // kem: sơ mi trong, gọng kính, bàn tay
  a: "#d9b969", // thẻ tên (hổ phách)
  T: "#474b54", // quần âu xám ấm
  t: "#363a42", // quần âu — nếp tối
  S: "#6b4f39", // giày da nâu
  H: "#3a2a1f", // tóc nâu sẫm
  h: "#55402e", // tóc — vệt sáng
  s: "#f0c9a3", // da
  E: "#141821", // đồng tử
  m: "#7d3038", // miệng
}

const ROWS = [
  "........oooooo..........", // 0  đỉnh đầu
  "......ooHHHHHHoo........", // 1  tóc
  ".....oHhHHHHHHHHo.......", // 2
  "....oHhHHHHHHHHHHHo.....", // 3  tóc có vệt sáng
  "...ohHHHHHHHHHHHHHHHo...", // 4  tóc xoà hai bên
  "...oHHHHHHHHHHHHHHHHo...", // 5
  "...oHHsHsssHHssHssHHo...", // 6  trán + mái tóc lởm chởm
  "...oHHssssssssssssHHo...", // 7  trán
  "...oHHsCCCsCCCssssHHo...", // 8  gọng kính (vành trên)
  "...oHHsCECsCECssssHHo...", // 9  mắt sau gọng kính
  "...oHHssssmmmsssssHHo...", // 10 miệng
  "....oHHssssssssssHHo....", // 11 cằm
  "..........ossso.........", // 12 cổ
  ".....oGGGqCCCCqGGGo.....", // 13 vai + cổ áo sơ mi
  "..oqqoGGGqCCCCqGGGoqqo..", // 14 áo len khoác ngoài, sơ mi ở giữa
  "..oqqoGGGqCaaCqGGGoqqo..", // 15 thẻ tên
  "..oqqoGGGqCaaCqGGGoqqo..", // 16 thẻ tên
  "..oqqoGGGqCCCCqGGGoqqo..", // 17
  "..oqqoGGGqCCCCqGGGoCCo..", // 18 bàn tay phải
  "..oCCoGGGqCCCCqGGGoCCo..", // 19 bàn tay hai bên
  "..oCCoGGGqCCCCqGGGoqqo..", // 20 bàn tay trái
  ".....otTTTTTTTTTTto.....", // 21 cạp quần
  "....otTTTTTTTTTTTTto....", // 22 quần âu
  "....oTTTTTTooTTTTTTo....", // 23
  "....oTTTTTTooTTTTTTo....", // 24
  "......oTTTo..oTTTo......", // 25 ống quần
  "......oTTTo..oTTTo......", // 26
  "......oTTTo..oTTTo......", // 27
  ".....oSSSSSooSSSSSo.....", // 28 giày da
  "......ooooo..ooooo......", // 29 đế giày
]

const TALK_ROWS = {
  10: "...oHHsssmmmmsssssHHo...",
  11: "....oHHssssmmmsssHHo....",
}

const PATCHES = {
  neutral: {},
  blink: { 9: "...oHHsCsCsCsCssssHHo..." },
  thinking: { 9: "...oHHsCECsCsCssssHHo...", 10: "...oHHsssssmssssssHHo..." },
  concerned: { 11: "....oHHsssssmssssHHo...." },
  happy: { 10: "...oHHsssmmmmmssssHHo..." },
  surprised: { 11: "....oHHsssmmmssssHHo...." },
}

export const FACES = Object.keys(PATCHES)

function rowsFor(face, talking) {
  const rows = ROWS.slice()
  const patch = PATCHES[face] || PATCHES.neutral
  for (const [row, value] of Object.entries(patch)) rows[Number(row)] = value
  if (talking) for (const [row, value] of Object.entries(TALK_ROWS)) rows[Number(row)] = value
  return rows
}

/** Gộp các ô cùng màu nằm liền nhau thành một <rect> cho gọn cây DOM. */
function svgFor(rows) {
  const rects = []
  for (let y = 0; y < rows.length; y += 1) {
    const row = rows[y]
    let x = 0
    while (x < row.length) {
      const ch = row[x]
      if (ch === ".") {
        x += 1
        continue
      }
      let w = 1
      while (x + w < row.length && row[x + w] === ch) w += 1
      rects.push(`<rect x="${x}" y="${y}" width="${w}" height="1" fill="${PALETTE[ch] || "#000"}"/>`)
      x += w
    }
  }
  return `<svg viewBox="0 0 24 30" shape-rendering="crispEdges" aria-hidden="true" focusable="false">${rects.join("")}</svg>`
}

const TALK_MS = 130
const BLINK_MIN = 2800
const BLINK_MAX = 4200
const BLINK_MS = 110

/**
 * Gắn nhân vật vào phần tử .figure__sprite.
 * @returns {{setFace(name:string):void, startTalk():void, stopTalk():void, destroy():void}}
 */
export function createCharacter(container) {
  const frames = new Map()
  const ids = ["neutral", "neutral-t", "blink"]
  for (const face of FACES) {
    ids.push(face, `${face}-t`)
  }
  for (const id of new Set(ids)) {
    const node = el("div", { class: "sprite__frame" })
    const talking = id.endsWith("-t")
    node.innerHTML = svgFor(rowsFor(talking ? id.slice(0, -2) : id, talking))
    node.dataset.frame = id
    frames.set(id, node)
    container.append(node)
  }

  let face = "neutral"
  let talking = false
  let flap = false
  let flapTimer = 0
  let blinkTimer = 0
  let blinkStop = 0

  function show(id) {
    for (const [key, node] of frames) node.classList.toggle("is-on", key === id)
  }

  function render() {
    if (talking && flap) {
      const key = `${face}-t`
      show(frames.has(key) ? key : face)
      return
    }
    show(frames.has(face) ? face : "neutral")
  }

  function scheduleBlink() {
    clearTimeout(blinkTimer)
    if (prefersReducedMotion() || talking) return
    const delay = BLINK_MIN + Math.random() * (BLINK_MAX - BLINK_MIN)
    blinkTimer = window.setTimeout(() => {
      if (talking) return
      show("blink")
      blinkStop = window.setTimeout(() => {
        render()
        scheduleBlink()
      }, BLINK_MS)
    }, delay)
  }

  function setFace(name) {
    face = FACES.includes(name) ? name : "neutral"
    render()
  }

  function startTalk() {
    if (talking) return
    talking = true
    clearTimeout(blinkTimer)
    if (prefersReducedMotion()) {
      render()
      return
    }
    flapTimer = window.setInterval(() => {
      flap = !flap
      render()
    }, TALK_MS)
  }

  function stopTalk() {
    if (!talking) return
    talking = false
    flap = false
    clearInterval(flapTimer)
    render()
    scheduleBlink()
  }

  const onMotionChange = () => {
    if (prefersReducedMotion()) {
      clearInterval(flapTimer)
      clearTimeout(blinkTimer)
      flap = false
      render()
    } else {
      scheduleBlink()
    }
  }
  const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)")
  mq?.addEventListener("change", onMotionChange)

  render()
  scheduleBlink()

  return {
    setFace,
    startTalk,
    stopTalk,
    destroy() {
      clearInterval(flapTimer)
      clearTimeout(blinkTimer)
      clearTimeout(blinkStop)
      mq?.removeEventListener("change", onMotionChange)
    },
  }
}