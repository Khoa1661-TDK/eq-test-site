/* sceneRuntime.js — bộ runtime dựng "cảnh tình huống EQ" dạng mini RPG pixel.
   KHÔNG phải game engine: không vật lý, không điều khiển di chuyển, không va chạm.
   Một timeline sự kiện (DATA) điều khiển:
     - môi trường (phòng họp + đạo cụ pixel tự vẽ, có chuyển động phụ nhẹ)
     - nhiều nhân vật (sprite SVG, luôn idle nhẹ, đổi cảm xúc theo script)
     - hội thoại gõ chữ (tái dùng console.js / typewriter.js)
     - điểm quyết định → hiện lựa chọn → timeline hậu quả theo lựa chọn
   Mọi hành vi quan trọng là XÁC ĐỊNH (không random). Random chỉ cho lớp trang
   trí idle (nhịp bob, chớp mắt) để nhân vật không bao giờ đứng "chết". */

import { el } from "../core/dom.js"
import { prefersReducedMotion, onMotionChange, beat, TIMING } from "../core/motion.js"
import { sound } from "../core/sound.js"
import { rateFor } from "../core/typewriter.js"
import { CHARACTERS, CHARACTER_PALETTES, createSpriteSet } from "./sprites.js"
import { environmentSVG } from "./environments.js"
import { createConsole } from "../ui/console.js"
import { createChoiceList } from "../ui/choices.js"

/* ------------------------------------------------------------------ kích thước
   Stage logic 320px rộng (1:1 với lưới điểm ảnh); CSS scale theo container.
   Nhân vật render cao ~96px (24 ô × 4px). */
const STAGE_W = 320
const STAGE_H = 200
const SPRITE_H = 96
const GROUND_Y = STAGE_H - 28

/* ------------------------------------------------------------------ bảng hành động
   Mỗi action trong timeline có dạng {char, do, ...}. Bảng này map tên do →
   handler(charCtrl, arg, scene). Đây là "từ vựng" dùng lại cho mọi scenario. */
const ACTIONS = {
  /* chuyển động */
  walkTo(c, { x }, sc) { c.walkTo(x) },
  leave(c, { dir = "left" }, sc) { c.leave(dir) },

  /* tư thế / cảm xúc */
  idle(c, { mood }, sc) { c.setMood(mood || "neutral") },
  talk(c, { mood, stop = false }, sc) { c.setMood(mood || c.mood, { talking: true }); if (stop) c.stopTalk() },
  nod(c) { c.react("happy") },
  shakeHead(c) { c.react("annoyed") },
  point(c, { dir = "right" }, sc) { c.face(dir) },
  lookAt(c, { target }, sc) { c.lookAt(sc.charX(target)) },
  turn(c, { dir }, sc) { c.face(dir) },
  face(c, { dir }, sc) { c.face(dir) },
  happy(c) { c.react("happy"); c.setMood("happy") },
  sad(c) { c.react("sad"); c.setMood("sad") },
  angry(c) { c.react("angry"); c.setMood("annoyed") },
  annoyed(c) { c.react("annoyed"); c.setMood("annoyed") },
  surprised(c) { c.react("surprised") },
  nervous(c) { c.setMood("defensive") },
  thinking(c) { c.react("thinking") },

  /* phản ứng môi trường / stage */
  reaction(sc, { glyph }) { sc.showReaction(glyph, sc.charId) },
  screenShake(sc) { sc.shake() },
  cameraFocus(sc, { target }) { sc.focus(target) },
  fade(sc, { to }) { sc.fadeTo(to) },
}

export function createSceneRuntime(mount, scenario, { onAnswer, onDone, onSkip } = {}) {
  const timers = []
  let destroyed = false
  let rAF = 0
  let stageScale = 1
  let paused = false
  let choicesShown = false
  let chosen = false

  const isRM = () => prefersReducedMotion()

  function after(ms, fn) {
    const id = setTimeout(() => { if (!destroyed) fn() }, beat(ms))
    timers.push(id)
    return id
  }
  function delay(ms) {
    return new Promise((resolve) => {
      const id = setTimeout(() => resolve(), beat(ms))
      timers.push(id)
    })
  }

  /* ------------------------------------------------------------- stage + môi trường */
  const stageWrap = el("div", { class: "scn-stage-wrap" })
  const stage = el("div", { class: "scn-stage", attrs: { role: "img", "aria-label": "Cảnh tình huống đang diễn" } })
  const envLayer = el("div", { class: "scn-env" })
  const charLayer = el("div", { class: "scn-chars" })
  const fxLayer = el("div", { class: "scn-fx" })
  stage.append(envLayer, charLayer, fxLayer)
  stageWrap.append(stage)

  buildEnvironment(envLayer, scenario.environment)

  /* ------------------------------------------------------------- nhân vật */
  const chars = new Map()
  for (const spec of scenario.characters) {
    const frames = CHARACTERS[spec.id]
    if (!frames) continue
    const node = el("div", { class: "scn-char", attrs: { style: `left:${spec.x}px` } })
    const spriteBox = el("div", { class: "scn-char__sprite" })
    const set = createSpriteSet(spriteBox, frames, CHARACTER_PALETTES[spec.id])
    const bubble = el("div", { class: "scn-bubble", attrs: { hidden: true, "aria-hidden": "true" } })
    node.append(bubble, spriteBox)
    charLayer.append(node)
    chars.set(spec.id, makeCharCtrl(node, set, bubble, spec))
  }

  /* ------------------------------------------------------------- hội thoại + lựa chọn */
  const consoleApi = createConsole({ page: scenario.label || "", onChar: (ch) => sound.voice(ch) })
  const choices = createChoiceList({
    onSelect(opt) { choose(opt.id) },
  })
  const choiceSlot = el("div", { class: "choices-slot" }, choices.el)
  consoleApi.mountSlot(choiceSlot)

  const board = el("div", { class: "scn-board" }, consoleApi.el, choiceSlot)
  mount.append(stageWrap, board)

  function charX(id) {
    const c = chars.get(id)
    return c ? c.x : STAGE_W / 2
  }

  /* ------------------------------------------------------------- vòng lặp rAF (lớp trang trí)
   Một vòng loop duy nhất cho CẢ stage: bob/chớp/nhấp của mỗi nhân vật + đạo cụ.
   Mỗi nhân vật có offset pha riêng → không bao giờ đồng bộ với nhau. */
  let lastT = 0
  function tick(t) {
    if (destroyed) return
    const dt = lastT ? Math.min(50, t - lastT) : 16
    lastT = t
    if (!isRM() && !paused) {
      for (const c of chars.values()) c.decor(t)
    }
    rAF = requestAnimationFrame(tick)
  }

  /* ------------------------------------------------------------- timeline player */
  async function playTimeline(events) {
    const t0 = performance.now()
    for (const ev of events) {
      if (destroyed) return
      const at = t0 + ev.at
      const delta = at - performance.now()
      if (delta > 0) await delay(delta)
      if (destroyed) return
      runEvent(ev)
    }
  }

  const sceneApi = {
    charX,
    showReaction: (glyph, charId) => showReaction(glyph, charId),
    shake,
    focus,
    fadeTo,
  }

  // Các action nhận đối số `sc` (scene) thay vì nhân vật → xử lý ở nhánh scene,
  // kể cả khi sự kiện có `char` (vd: reaction "!" gắn lên đầu nhân vật).
  const SCENE_ACTIONS = new Set(["reaction", "screenShake", "cameraFocus", "fade"])

  function runEvent(ev) {
    if (ev.do === "decisionPoint") {
      showChoices()
      return
    }
    const fn = ACTIONS[ev.do]
    if (!fn) return
    if (SCENE_ACTIONS.has(ev.do)) {
      // action cấp scene; `char` (nếu có) chỉ định nhân vật đặt hiệu ứng lên đầu.
      const r = fn(sceneApi, ev, { ...sceneApi, charId: ev.char })
      if (r && typeof r.then === "function") r.catch(() => {})
    } else if (ev.char) {
      const c = chars.get(ev.char)
      if (c) {
        const r = fn(c, ev, sceneApi)
        if (r && typeof r.then === "function") r.catch(() => {})
      }
    }
  }

  /* ------------------------------------------------------------- hội thoại
    State machine: "typing" → "waiting" → resolve → next line.
    Click / Enter / Space advances. Không race vì chỉ MỘT trạng thái tại một thời điểm. */
  let dialogueDone = Promise.resolve()
  let dialogueState = "idle" // "typing" | "waiting"
  let resolveDialogue = null

  function queueDialogue(text, speaker, speakerChar) {
    dialogueDone = dialogueDone.then(() => typeLine(text, speaker, speakerChar))
    return dialogueDone
  }

  function typeLine(text, speaker, speakerChar) {
    return new Promise((resolve) => {
      resolveDialogue = resolve
      dialogueState = "typing"
      consoleApi.setCue(false)
      if (speakerChar) speakerChar.setMood(speakerChar.mood, { talking: true })
      const tw = consoleApi.typewriter
      const prevDone = tw.onDone
      tw.onDone = () => {
        consoleApi.setCue(true)
        dialogueState = "waiting"
        if (speakerChar) speakerChar.stopTalk()
        prevDone && prevDone()
      }
      tw.type(text, { msPerChar: rateFor(text) })
      if (speaker) consoleApi.setHint(speaker)
      consoleApi.announce(text)
      sound.open()
    })
  }

  function advanceDialogue() {
    if (dialogueState === "typing") {
      consoleApi.typewriter.finish()
    } else if (dialogueState === "waiting") {
      dialogueState = "idle"
      const r = resolveDialogue
      resolveDialogue = null
      r && r()
    }
  }

  function onStageClick() {
    advanceDialogue()
  }
  stage.addEventListener("click", onStageClick)

  /* keyboard: Enter/Space tiến hội thoại, mũi tên điều hướng lựa chọn */
  function onKeydown(e) {
    if (e.key === "Enter" || e.key === " ") {
      if (dialogueState !== "idle" && !choicesShown) {
        e.preventDefault()
        advanceDialogue()
      }
    }
  }
  mount.addEventListener("keydown", onKeydown)

  /* ------------------------------------------------------------- lựa chọn */
  function showChoices() {
    choicesShown = true
    paused = true
    consoleApi.setHint("Bạn sẽ làm gì?")
    consoleApi.setCue(false)
    choices.build(scenario.choices.map((c) => ({ id: c.id, code: c.code, text: c.text })))
    choiceSlot.classList.add("is-open")
    choices.open()
    choices.lock(false)
    if (prefersReducedMotion()) {
      choices.el.querySelectorAll(".choice").forEach((n) => n.classList.add("is-in"))
    } else {
      choices.reveal()
    }
    sound.confirm()
  }

  async function choose(id) {
    if (chosen || !choicesShown) return
    chosen = true
    choices.lock(true)
    choices.confirm(id)
    sound.confirm()
    onAnswer && onAnswer(id)
    after(220, () => {
      const seq = scenario.consequences ? scenario.consequences[id] : null
      if (seq) {
        paused = false
        playTimeline(seq).then(() => finish())
      } else {
        finish()
      }
    })
  }

  function finish() {
    if (destroyed) return
    after(300, () => { onDone && onDone() })
  }

  /* ------------------------------------------------------------- FX */
  function showReaction(glyph, charId) {
    // charId tới qua sự kiện {char: "..."} → runner truyền thêm làm arg thứ 3.
    const c = charId ? chars.get(charId) : null
    const target = c ? c.bubble : fxLayer
    target.textContent = glyph
    target.hidden = false
    target.classList.remove("is-pop")
    void target.offsetWidth
    target.classList.add("is-pop")
    after(900, () => { target.hidden = true; target.textContent = "" })
  }
  function shake() {
    if (isRM()) return
    stage.classList.remove("is-shake")
    void stage.offsetWidth
    stage.classList.add("is-shake")
    after(320, () => stage.classList.remove("is-shake"))
  }
  function focus(targetId) {
    for (const c of chars.values()) c.node.classList.toggle("is-focus-out", c.id !== targetId)
    after(1200, () => { for (const c of chars.values()) c.node.classList.remove("is-focus-out") })
  }
  function fadeTo(opacity) {
    stage.style.opacity = opacity != null ? opacity : 1
    after(400, () => { stage.style.opacity = 1 })
  }

  /* ------------------------------------------------------------- khởi tạo */
  async function start() {
    resize()
    rAF = requestAnimationFrame(tick)
    if (scenario.dialogue && scenario.dialogue.length) {
      const speakerChar = scenario.dialogueAs ? chars.get(scenario.dialogueAs) : null
      for (const line of scenario.dialogue) {
        queueDialogue(line, scenario.dialogueSpeaker, speakerChar)
      }
    }
    // timeline chính chạy SONG SONG với hội thoại (nhân vật vừa idle vừa hành động)
    playTimeline(scenario.timeline || [])
  }

  /* ------------------------------------------------------------- responsive scale */
  function resize() {
    const w = stageWrap.clientWidth || STAGE_W
    stageScale = Math.min(1.6, w / STAGE_W)
    stage.style.width = `${STAGE_W}px`
    stage.style.height = `${STAGE_H}px`
    stage.style.transform = `scale(${stageScale})`
    stage.style.transformOrigin = "top left"
    // căn giữa stage khi khung rộng hơn mức phóng tối đa
    stage.style.left = `${Math.max(0, (w - STAGE_W * stageScale) / 2)}px`
    stageWrap.style.height = `${STAGE_H * stageScale + 8}px`
  }
  const ro = new ResizeObserver(() => resize())
  ro.observe(stageWrap)

  onMotionChange(() => {
    if (isRM()) {
      for (const c of chars.values()) c.resetDecor()
    }
  })

  return {
    start,
    skip() {
      if (!choicesShown) advanceDialogue()
      onSkip && onSkip()
    },
    destroy() {
      destroyed = true
      cancelAnimationFrame(rAF)
      ro.disconnect()
      stage.removeEventListener("click", onStageClick)
      mount.removeEventListener("keydown", onKeydown)
      for (const t of timers) clearTimeout(t)
      consoleApi.typewriter.destroy && consoleApi.typewriter.destroy()
      choices.clear()
      mount.replaceChildren()
    },
  }
}

/* ================================================================== nhân vật */
function makeCharCtrl(node, spriteSet, bubble, spec) {
  let x = spec.x
  let mood = spec.mood || "neutral"
  let talking = false
  let facing = 1
  let leaving = null
  // pha trang trí riêng cho từng nhân vật → không đồng bộ
  const phase = (spec.x * 1.7) % 6.28
  let blinkNext = performance.now() + 2200 + ((spec.x * 37) % 2600)
  let lastBlink = 0
  let blinkUntil = 0
  let reactUntil = 0
  let reactKind = null


  /* sprite chỉ có MỘT số biến thể cảm xúc cho mỗi nhân vật; map mood → biến thể
     thật sự tồn tại (fallback theo bậc: cùng mood → neutral). Không bao giờ
     snap về frame lạ: decor() tự chọn frame hợp lệ mỗi tick. */
  function moodVariant() {
    // ưu tiên mood hiện tại nếu có sprite, nếu không về neutral.
    if (spriteSet.frames.has(`${mood}-idle`) || spriteSet.frames.has(`${mood}-talk`)) return mood
    return "neutral"
  }
  function frameName() {
    const now = performance.now()
    if (now < reactUntil && reactKind) return `${reactKind}-react`
    if (talking) return `${moodVariant()}-talk`
    if (now < blinkUntil) return "blink"
    return `${moodVariant()}-idle`
  }

  function setMood(m, opts = {}) {
    mood = m
    if (opts.talking !== undefined) talking = opts.talking
    applyFrame()
  }
  function stopTalk() { talking = false; applyFrame() }
  function react(kind) {
    reactKind = kind
    reactUntil = performance.now() + 620
    applyFrame()
  }
  function face(dir) {
    facing = dir === "left" ? -1 : 1
    // decor() sở hữu transform; face() chỉ đổi hướng + cập nhật left ngay
    node.style.left = `${x - 36}px`
  }
  function lookAt(tx) {
    face(tx >= x ? "right" : "left")
  }
  function walkTo(tx) {
    const dist = Math.abs(tx - x)
    const dur = Math.min(1600, Math.max(320, dist * 6))
    leaving = { from: x, to: tx, start: performance.now(), dur }
    face(tx >= x ? "right" : "left")
  }
  function leave(dir) {
    const tx = dir === "left" ? -60 : STAGE_W + 60
    leaving = { from: x, to: tx, start: performance.now(), dur: 900 }
    face(dir)
  }

  function applyFrame() {
    const name = frameName()
    const has = spriteSet.frames.get(name)
    spriteSet.setFrame(has ? name : "neutral-idle")
  }

  /* lớp trang trí: bob + chớp + đi — gọi mỗi frame rAF */
  function decor(t) {
    // di chuyển
    let walkFrame = 0
    if (leaving) {
      const p = Math.min(1, (t - leaving.start) / leaving.dur)
      x = leaving.from + (leaving.to - leaving.from) * p
      walkFrame = Math.floor((t - leaving.start) / 150) % 2
      if (p >= 1) {
        leaving = null
        applyFrame()
      }
    }
    node.style.left = `${x - 36}px`
    // bob theo mood
    let bobAmp = 1.2
    let bobSpeed = 0.0021
    if (mood === "happy") { bobAmp = 1.8; bobSpeed = 0.0032 }
    if (mood === "annoyed") { bobAmp = 0.8; bobSpeed = 0.0026 }
    if (mood === "sad") { bobAmp = 0.6; bobSpeed = 0.0014 }
    const bob = Math.sin(t * bobSpeed + phase) * bobAmp
    // chớp mắt: co giãn Y nhẹ (mắt khép) thay vì đổi frame
    if (t > blinkNext && t > blinkUntil) {
      blinkUntil = t + 110
      blinkNext = t + 2400 + ((x * 53) % 2200)
    }
    const blinkSquash = t < blinkUntil ? 0.92 : 1
    // frame
    const now = performance.now()
    let name
    if (leaving) name = walkFrame ? "walk-a" : "walk-b"
    else if (now < reactUntil && reactKind) name = `${reactKind}-react`
    else if (talking) name = `${moodVariant()}-talk`
    else name = `${moodVariant()}-idle`
    if (!spriteSet.frames.has(name)) name = "neutral-idle"
    spriteSet.setFrame(name)
    node.style.transform = `translateY(${bob.toFixed(2)}px) scaleX(${facing}) scaleY(${blinkSquash})`
  }

  function resetDecor() {
    node.style.transform = ""
    applyFrame()
  }

  face(facing)
  applyFrame()

  return {
    id: spec.id,
    node,
    bubble,
    get x() { return x },
    get mood() { return mood },
    setMood,
    stopTalk,
    react,
    face,
    lookAt,
    walkTo,
    leave,
    decor,
    resetDecor,
  }
}

/* ================================================================== môi trường
   Phòng họp pixel tự vẽ (SVG) + lớp chuyển động phụ: quạt quay, đồng hồ,
   màn hình nhấp, đèn bàn. Tất cả bằng CSS animation (transform/opacity). */
 function buildEnvironment(envLayer, envName) {
   const svg = environmentSVG(envName, { STAGE_W, STAGE_H, GROUND_Y })
   envLayer.innerHTML = svg
   // lớp chuyển động phụ (mưa, màn hình, khói, đồng hồ) chạy bằng CSS animation.
 }


