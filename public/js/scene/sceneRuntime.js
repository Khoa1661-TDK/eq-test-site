/* sceneRuntime.js — bộ runtime dựng "cảnh tình huống EQ" dạng mini RPG pixel.
   KHÔNG phải game engine: không vật lý, không điều khiển di chuyển, không va chạm.
   Một timeline sự kiện (DATA) điều khiển môi trường, nhiều nhân vật, hội thoại gõ chữ,
   máy quay, điện thoại, đám đông phía sau, rồi điểm quyết định → lựa chọn → hậu quả.
   Mọi hành vi quan trọng là XÁC ĐỊNH; random chỉ dành cho lớp "sống" (nhịp bob, chớp mắt,
   liếc nhìn) để nhân vật không bao giờ đứng chết.

   ============================================================== HỢP ĐỒNG CẢNH
   API: createSceneRuntime(mount, scene, { onAnswer(id), onDone(), onSkip() })
        → { start(), skip(), destroy() }

   scene = {
     label,            // nhãn chữ hoa ở đầu khung thoại
     environment,      // office | canteen | corridor | bedroom | library | classroom | schoolyard
     characters: [{ id, x, mood, name }],   // x = tâm nhân vật (0–320); name hiện ở dấu nhắc
     dialogue: [ "chuỗi" | { who, text } ],  // who = id nhân vật hoặc "narrator"
     dialogueAs,       // (cũ) nhân vật nói các chuỗi thuần; thiếu → người dẫn chuyện
     dialogueSpeaker,  // tên người dẫn chuyện ở dấu nhắc (và tên cho chuỗi cũ nếu có dialogueAs)
     prompt,           // câu hỏi gõ làm dòng cuối trước khi hiện lựa chọn
     chatTitle,        // tên cuộc trò chuyện trên điện thoại (thiếu → người gửi đầu tiên không phải "me")
     extras,           // false = không người qua lại; mảng = thay mặc định (ENV_AMBIENT)
     timeline: [ { at(ms), char?, do, ... } ],
     choices, consequences: { <id>: [ …sự kiện… ] }
   }
   Dòng thoại nhân vật: người đó mở miệng khi gõ chữ (class is-talking), dấu nhắc ghi tên, các
   nhân vật đang rảnh quay mặt về phía người nói. Người dẫn chuyện: không ai nói, dấu nhắc =
   dialogueSpeaker. Mỗi 3–6 giây nhân vật rảnh liếc sang người nói gần nhất hoặc người khác.

   Hành động (do) — ngoài `at`, `char` là id nhân vật khi hành động thuộc về nhân vật:
     Di chuyển   walkTo{x}  leave{dir}  face{dir}  turn{dir}  point{dir}  lookAt{target}
     Tâm trạng   idle{mood} (cũng bỏ slump)  talk{mood,stop}  happy  sad  angry  annoyed
                 surprised  nervous  thinking  nod (= nodYes + react)  shakeHead (= shakeNo + react)
     Cử chỉ      hop  shiver  slump (giữ tới idle/cử chỉ kế)  lean{target}  stepBack{target}
                 (lùi 16px khỏi target)  bounce  nodYes  shakeNo — node có data-gesture khi diễn
     Lời         say{text,ms?} bóng thoại .scn-say, miệng mấp máy ms (700+40×độ dài, tối đa 3500)
                 think{text}   bóng mây .scn-say.is-think, miệng im
     Biểu cảm    emote{kind} .scn-emote[data-kind] — sweat anger heart sparkle question exclaim
                 ellipsis tear music zzz gloom
     Máy quay    zoom{target(id|x), scale=1.25, ms=700}  zoomReset  pan{x}   (.scn-camera, data-zoom)
     Sắc độ      tint{tone}  tense | warm | cool | dim | none   (.scn-tint[data-tone])
     Điện thoại  chat{from,text,me?}  typing{from}  chatClose   (.scn-phone, tối đa 5 tin)
     Cảnh        decisionPoint (chờ hết thoại → gõ prompt → data-decision="on", đẩy máy quay
                 1.05 + .scn-vignette → mở lựa chọn)  reaction{glyph}  screenShake
                 cameraFocus{target}  fade{to}
   prefers-reduced-motion: không mấp máy miệng, cử chỉ, nổi lên, máy quay, đám đông di chuyển;
   bóng thoại, biểu cảm, sắc độ và điện thoại vẫn hiện. */

import { el } from "../core/dom.js"
import { prefersReducedMotion, onMotionChange, beat } from "../core/motion.js"
import { sound } from "../core/sound.js"
import { rateFor } from "../core/typewriter.js"
import { CHARACTERS, CHARACTER_PALETTES, createSpriteSet, EMOTES, emoteSVG, EXTRAS, extraSVG } from "./sprites.js"
import { environmentSVG, ENV_AMBIENT } from "./environments.js"
import { createConsole } from "../ui/console.js"
import { createChoiceList } from "../ui/choices.js"

/* ------------------------------------------------------------------ kích thước
   Stage logic 320px rộng (1:1 với lưới điểm ảnh); CSS scale theo container.
   Nhân vật render cao ~96px (24 ô × 4px). */
const STAGE_W = 320
const STAGE_H = 200
const SPRITE_H = 96
const GROUND_Y = STAGE_H - 28
/** Chân nhân vật chính (khớp `.scn-char { bottom: 14px }`); dải sàn GROUND_Y..FEET_Y là chỗ của người ở xa. */
const FEET_Y = STAGE_H - 14
const EMOTE_CELL = 2.5
const EXTRA_CELL = 2.5
const MAX_CHAT = 5
const GESTURE_MS = { hop: 620, shiver: 1000, bounce: 900, nodYes: 900, shakeNo: 900, lean: 1600, stepBack: 500 }

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))

/* ------------------------------------------------------------------ bảng hành động
   Hành động của NHÂN VẬT: handler(charCtrl, ev, api). */
const ACTIONS = {
  /* chuyển động */
  walkTo(c, { x }) { c.walkTo(x) },
  leave(c, { dir = "left" }) { c.leave(dir) },

  /* tư thế / cảm xúc */
  idle(c, { mood }) { c.clearGesture(); c.setMood(mood || "neutral") },
  talk(c, { mood, stop = false }) { c.setMood(mood || c.mood, { talking: true }); if (stop) c.stopTalk() },
  nod(c) { c.react("happy"); c.gesture("nodYes") },
  shakeHead(c) { c.react("annoyed"); c.gesture("shakeNo") },
  point(c, { dir = "right" }) { c.face(dir) },
  lookAt(c, { target }, api) { c.lookAt(api.charX(target)) },
  turn(c, { dir }) { c.face(dir) },
  face(c, { dir }) { c.face(dir) },
  happy(c) { c.react("happy"); c.setMood("happy") },
  sad(c) { c.react("sad"); c.setMood("sad") },
  angry(c) { c.react("angry"); c.setMood("annoyed") },
  annoyed(c) { c.react("annoyed"); c.setMood("annoyed") },
  surprised(c) { c.react("surprised") },
  nervous(c) { c.setMood("defensive") },
  thinking(c) { c.react("thinking") },

  /* cử chỉ */
  hop(c) { c.gesture("hop") },
  shiver(c) { c.gesture("shiver") },
  slump(c) { c.gesture("slump") },
  bounce(c) { c.gesture("bounce") },
  nodYes(c) { c.gesture("nodYes") },
  shakeNo(c) { c.gesture("shakeNo") },
  lean(c, { target }, api) { c.gesture("lean", api.charX(target)) },
  stepBack(c, { target }, api) { c.stepBack(api.charX(target)) },

  /* lời + biểu cảm */
  say(c, ev, api) { api.speak(c, ev.text, { ms: ev.ms }) },
  think(c, ev, api) { api.speak(c, ev.text, { think: true, ms: ev.ms }) },
  emote(c, ev, api) { api.emote(c, ev.kind) },
}

/* Hành động cấp CẢNH: handler(api, ev). `char` (nếu có) chỉ là chỗ đặt hiệu ứng. */
const SCENE_ACTIONS = {
  reaction(api, ev) { api.showReaction(ev.glyph, ev.char) },
  screenShake(api) { api.shake() },
  cameraFocus(api, ev) { api.focus(ev.target) },
  fade(api, ev) { api.fadeTo(ev.to) },
  zoom(api, ev) { api.zoom(ev.target, ev.scale ?? 1.25, ev.ms ?? 700) },
  zoomReset(api, ev) { api.zoomReset(ev.ms ?? 700) },
  pan(api, ev) { api.pan(ev.x, ev.ms ?? 700) },
  tint(api, ev) { api.tint(ev.tone) },
  chat(api, ev) { api.chat(ev) },
  typing(api, ev) { api.typing(ev.from) },
  chatClose(api) { api.chatClose() },
}

export function createSceneRuntime(mount, scenario, { onAnswer, onDone, onSkip } = {}) {
  const timers = []
  let destroyed = false
  let rAF = 0
  let stageScale = 1
  let choicesShown = false
  let decisionStarted = false
  let chosen = false
  let lastSpeaker = null

  const isRM = () => prefersReducedMotion()

  /* `after` co lại khi giảm chuyển động (nhịp chuyển cảnh); `later` giữ nguyên thời gian thật
     cho thứ người đọc cần thấy (bóng thoại, biểu cảm, cử chỉ, timeline). */
  function after(ms, fn) {
    const id = setTimeout(() => { if (!destroyed) fn() }, beat(ms))
    timers.push(id)
    return id
  }
  function later(ms, fn) {
    const id = setTimeout(() => { if (!destroyed) fn() }, ms)
    timers.push(id)
    return id
  }
  function delay(ms) {
    return new Promise((resolve) => {
      const id = setTimeout(() => resolve(), ms)
      timers.push(id)
    })
  }

  /* ------------------------------------------------------------- stage + máy quay + môi trường */
  const stageWrap = el("div", { class: "scn-stage-wrap" })
  const stage = el("div", { class: "scn-stage", attrs: { role: "img", "aria-label": "Cảnh tình huống đang diễn" } })
  stage.dataset.decision = "off"
  const camera = el("div", { class: "scn-camera" })
  camera.dataset.zoom = "1"
  const envLayer = el("div", { class: "scn-env" })
  const extrasLayer = el("div", { class: "scn-extras", attrs: { "aria-hidden": "true" } })
  const charLayer = el("div", { class: "scn-chars" })
  const overLayer = el("div", { class: "scn-over" })
  const fxLayer = el("div", { class: "scn-fx" })
  camera.append(envLayer, extrasLayer, charLayer, overLayer, fxLayer)

  const tintEl = el("div", { class: "scn-tint", attrs: { "aria-hidden": "true" } })
  tintEl.dataset.tone = "none"
  const vignette = el("div", { class: "scn-vignette", attrs: { "aria-hidden": "true" } })

  /* điện thoại */
  const phoneTitle = el("div", { class: "scn-phone__title", text: scenario.chatTitle || "" })
  const phoneList = el("div", { class: "scn-phone__list" })
  const phone = el("div", { class: "scn-phone", attrs: { "aria-hidden": "true" } },
    el("div", { class: "scn-phone__bar" }, el("span", { class: "scn-phone__dot" }), phoneTitle),
    phoneList)

  stage.append(camera, tintEl, vignette, phone)
  stageWrap.append(stage)

  buildEnvironment(envLayer, scenario.environment)
  buildExtras(extrasLayer, scenario.extras === undefined ? ENV_AMBIENT[scenario.environment] ?? [] : scenario.extras)

  /* ------------------------------------------------------------- nhân vật */
  const chars = new Map()
  const api = {
    charX,
    speak,
    emote: showEmote,
    showReaction: (glyph, charId) => showReaction(glyph, charId),
    shake,
    focus,
    fadeTo,
    zoom,
    zoomReset,
    pan,
    tint,
    chat,
    typing,
    chatClose,
    others: (self) => [...chars.values()].filter((c) => c !== self),
    getLastSpeaker: () => lastSpeaker,
    later,
  }
  for (const spec of scenario.characters || []) {
    const frames = CHARACTERS[spec.id]
    if (!frames) continue
    const node = el("div", { class: "scn-char", attrs: { style: `left:${spec.x}px`, "data-char": spec.id } })
    const body = el("div", { class: "scn-char__body" })
    const spriteBox = el("div", { class: "scn-char__sprite" })
    const set = createSpriteSet(spriteBox, frames, CHARACTER_PALETTES[spec.id])
    const bubble = el("div", { class: "scn-bubble", attrs: { hidden: true, "aria-hidden": "true" } })
    body.append(spriteBox)
    node.append(bubble, body)
    charLayer.append(node)
    chars.set(spec.id, makeCharCtrl(node, body, set, bubble, spec, api, isRM, frames))
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

  function charX(target) {
    if (typeof target === "number") return target
    const c = chars.get(target)
    if (c) return c.x
    const n = Number(target)
    return Number.isFinite(n) ? n : STAGE_W / 2
  }

  /* ------------------------------------------------------------- vòng lặp rAF (lớp trang trí)
   Một vòng loop duy nhất cho CẢ stage: bob/chớp/mấp máy/liếc của mỗi nhân vật.
   Mỗi nhân vật có offset pha riêng → không bao giờ đồng bộ với nhau. */
  function tick(t) {
    if (destroyed) return
    if (!isRM()) {
      for (const c of chars.values()) c.decor(t)
    }
    rAF = requestAnimationFrame(tick)
  }

  /* ------------------------------------------------------------- timeline player */
  async function playTimeline(events) {
    const t0 = performance.now()
    for (const ev of events) {
      if (destroyed) return
      const wait = t0 + ev.at - performance.now()
      if (wait > 0) await delay(wait)
      if (destroyed) return
      runEvent(ev)
    }
  }

  function runEvent(ev) {
    if (ev.do === "decisionPoint") {
      runDecision()
      return
    }
    try {
      const sceneFn = SCENE_ACTIONS[ev.do]
      if (sceneFn) {
        sceneFn(api, ev)
        return
      }
      const fn = ACTIONS[ev.do]
      if (!fn || !ev.char) return
      const c = chars.get(ev.char)
      if (c) fn(c, ev, api)
    } catch (err) {
      console.warn("[scene] hành động lỗi:", ev.do, err)
    }
  }

  /* ------------------------------------------------------------- hội thoại
    State machine: "typing" → "waiting" → resolve → next line.
    Click / Enter / Space advances. Không race vì chỉ MỘT trạng thái tại một thời điểm. */
  let dialogueDone = Promise.resolve()
  let dialogueState = "idle" // "typing" | "waiting"
  let resolveDialogue = null

  function normalizeLine(line) {
    if (typeof line === "string") {
      const as = scenario.dialogueAs ? chars.get(scenario.dialogueAs) : null
      return { text: line, speaker: as || null, hint: scenario.dialogueSpeaker || as?.name || "" }
    }
    const who = line.who
    const c = who && who !== "narrator" ? chars.get(who) : null
    return { text: line.text, speaker: c || null, hint: c ? c.name : scenario.dialogueSpeaker || "" }
  }

  function queueLine(line) {
    const info = normalizeLine(line)
    dialogueDone = dialogueDone.then(() => typeLine(info))
    return dialogueDone
  }

  function typeLine({ text, speaker, hint }) {
    return new Promise((resolve) => {
      if (destroyed) { resolve(); return }
      resolveDialogue = resolve
      dialogueState = "typing"
      consoleApi.setCue(false)
      if (speaker) {
        lastSpeaker = speaker
        speaker.setDialogueTalk(true)
        for (const o of api.others(speaker)) o.turnToward(speaker.x)
      }
      const tw = consoleApi.typewriter
      tw.onDone = () => {
        consoleApi.setCue(true)
        dialogueState = "waiting"
        if (speaker) speaker.setDialogueTalk(false)
      }
      tw.type(text, { msPerChar: rateFor(text) })
      consoleApi.setHint(hint)
      consoleApi.announce(text)
      sound.open()
    })
  }

  /** Gõ câu hỏi làm dòng cuối; resolve khi gõ xong (không cần bấm). */
  function typePrompt(text) {
    return new Promise((resolve) => {
      if (destroyed) { resolve(); return }
      dialogueState = "typing"
      consoleApi.setCue(false)
      const tw = consoleApi.typewriter
      tw.onDone = () => {
        dialogueState = "idle"
        resolve()
      }
      tw.type(text, { msPerChar: rateFor(text) })
      consoleApi.setHint(text)
      consoleApi.announce(text)
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

  /* ------------------------------------------------------------- điểm quyết định + lựa chọn */
  function playerCtrl() {
    return chars.get("player") || chars.values().next().value || null
  }

  async function runDecision() {
    if (decisionStarted) return
    decisionStarted = true
    await dialogueDone
    if (destroyed) return
    if (scenario.prompt) await typePrompt(scenario.prompt)
    if (destroyed) return
    stage.dataset.decision = "on"
    const p = playerCtrl()
    camTo(p ? p.x : STAGE_W / 2, 1.05, 1800)
    after(450, showChoices)
  }

  function showChoices() {
    choicesShown = true
    consoleApi.setHint(scenario.prompt || "Bạn sẽ làm gì?")
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
    stage.dataset.decision = "off"
    zoomReset(500)
    onAnswer && onAnswer(id)
    after(220, () => {
      const seq = scenario.consequences ? scenario.consequences[id] : null
      if (seq && seq.length) {
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

  /* ------------------------------------------------------------- bóng thoại + biểu cảm */
  const bubbleBoxes = new Map() // node → {l, r, h, bottom}

  function showEmote(c, kind) {
    const rows = EMOTES[kind]
    if (!rows) return
    const w = rows[0].length * EMOTE_CELL
    const h = rows.length * EMOTE_CELL
    const node = el("div", { class: "scn-emote", attrs: { "aria-hidden": "true" } })
    node.dataset.kind = kind
    node.innerHTML = emoteSVG(kind)
    node.style.width = `${w}px`
    node.style.height = `${h}px`
    // đặt cạnh đầu, phía bên còn chỗ
    const side = c.x + 16 + w > STAGE_W - 4 ? -1 : 1
    const left = side > 0 ? c.x + 14 : c.x - 14 - w
    node.style.left = `${clamp(left, 2, STAGE_W - w - 2)}px`
    node.style.top = `${Math.max(2, c.headY - 2 - h * 0.35)}px`
    overLayer.append(node)
    later(1450, () => node.remove())
  }

  function speak(c, text, { think = false, ms } = {}) {
    if (!text) return
    c.dropSay()
    const node = el("div", { class: think ? "scn-say is-think" : "scn-say", attrs: { "aria-hidden": "true" } })
    node.append(el("span", { class: "scn-say__text", text }))
    node.style.visibility = "hidden"
    overLayer.append(node)
    c.setSay(node)

    let w = node.offsetWidth
    let h = node.offsetHeight
    // bóng quá cao (chữ dài) → nới ngang dần cho tới khi vừa khoảng trống phía trên đầu
    const room = c.headY - (think ? 12 : 8) - 14
    for (const mw of [180, 210, 240]) {
      if (h <= room) break
      node.style.maxWidth = `${mw}px`
      w = node.offsetWidth
      h = node.offsetHeight
    }
    const left = clamp(c.x - w / 2, 3, STAGE_W - w - 3)
    let bottom = STAGE_H - c.headY + (think ? 12 : 8)
    // xếp chồng nếu cắt ngang bong bóng khác
    for (const [other, box] of bubbleBoxes) {
      if (!other.isConnected) { bubbleBoxes.delete(other); continue }
      if (left < box.r && left + w > box.l) bottom = Math.max(bottom, box.bottom + box.h + 4)
    }
    bottom = Math.min(bottom, STAGE_H - h - 14) // chừa mép trên cho máy quay đẩy gần
    node.style.left = `${left}px`
    node.style.bottom = `${bottom}px`
    node.style.setProperty("--tail", `${clamp(c.x - left, 8, w - 8)}px`)
    node.style.visibility = ""
    bubbleBoxes.set(node, { l: left, r: left + w, h, bottom })

    const talkMs = ms ?? Math.min(3500, 700 + 40 * text.length)
    if (!think) c.talkFor(talkMs)
    const life = Math.max(talkMs, 1400) + 600
    later(life, () => node.classList.add("is-out"))
    later(life + 320, () => { node.remove(); bubbleBoxes.delete(node) })
  }

  /* ------------------------------------------------------------- máy quay */
  const cam = { scale: 1, tx: 0, ty: 0 }
  function camTo(cx, scale, ms, cy = FEET_Y - 88) { // cy cao hơn ngực: chừa chỗ cho bóng thoại trên đầu
    const s = Math.max(1, scale)
    cam.scale = s
    cam.tx = clamp(STAGE_W / 2 - cx * s, STAGE_W - STAGE_W * s, 0)
    cam.ty = clamp(STAGE_H * 0.46 - cy * s, STAGE_H - STAGE_H * s, 0)
    camera.dataset.zoom = String(+s.toFixed(3))
    if (isRM()) return // giảm chuyển động: giữ nguyên khung hình
    camera.style.setProperty("--cam-ms", `${ms}ms`)
    camera.style.transform = `translate(${cam.tx.toFixed(1)}px, ${cam.ty.toFixed(1)}px) scale(${s})`
  }
  function zoom(target, scale, ms) { camTo(charX(target), scale, ms) }
  function zoomReset(ms = 700) {
    cam.scale = 1
    cam.tx = 0
    cam.ty = 0
    camera.dataset.zoom = "1"
    if (isRM()) return
    camera.style.setProperty("--cam-ms", `${ms}ms`)
    camera.style.transform = "translate(0px, 0px) scale(1)"
  }
  function pan(x, ms) { camTo(charX(x), cam.scale > 1 ? cam.scale : 1.15, ms) }

  /* ------------------------------------------------------------- sắc độ */
  function tint(tone = "none") { tintEl.dataset.tone = tone }

  /* ------------------------------------------------------------- điện thoại */
  let typingNode = null
  let phoneNamed = Boolean(scenario.chatTitle)
  let phoneClearTimer = 0

  function openPhone(sender) {
    if (!phoneNamed && sender) {
      phoneTitle.textContent = sender
      phoneNamed = true
    }
    clearTimeout(phoneClearTimer)
    phone.classList.add("is-open")
  }
  function trimChat() {
    while (phoneList.children.length > MAX_CHAT) phoneList.firstElementChild.remove()
  }
  const senderName = (from) => chars.get(from)?.name ?? from
  function chat({ from = "", text = "", me = false }) {
    from = senderName(from)
    openPhone(me ? null : from)
    const node = el("div", { class: me ? "scn-chat-msg is-me" : "scn-chat-msg" })
    if (!me && from) node.append(el("span", { class: "scn-chat-msg__from", text: from }))
    node.append(el("span", { class: "scn-chat-msg__text", text }))
    if (typingNode && typingNode.dataset.from === from && typingNode.isConnected) {
      typingNode.replaceWith(node)
    } else {
      phoneList.append(node)
    }
    typingNode = null
    trimChat()
  }
  function typing(from = "") {
    from = senderName(from)
    openPhone(from)
    if (typingNode) typingNode.remove()
    typingNode = el("div", { class: "scn-chat-msg is-typing" },
      el("span", { class: "scn-chat-msg__from", text: from }),
      el("span", { class: "scn-chat-msg__text", text: "…" }))
    typingNode.dataset.from = from
    phoneList.append(typingNode)
    trimChat()
  }
  function chatClose() {
    phone.classList.remove("is-open")
    clearTimeout(phoneClearTimer)
    phoneClearTimer = later(450, () => {
      if (phone.classList.contains("is-open")) return
      phoneList.replaceChildren()
      typingNode = null
    })
  }

  /* ------------------------------------------------------------- FX cũ */
  function showReaction(glyph, charId) {
    // charId tới qua sự kiện {char: "..."}
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
    for (const line of scenario.dialogue || []) queueLine(line)
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

  const offMotion = onMotionChange((reduced) => {
    for (const c of chars.values()) c.resetDecor()
    if (reduced) {
      camera.style.transform = ""
    } else if (cam.scale > 1) {
      camera.style.transform = `translate(${cam.tx.toFixed(1)}px, ${cam.ty.toFixed(1)}px) scale(${cam.scale})`
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
      offMotion && offMotion()
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
function makeCharCtrl(node, body, spriteSet, bubble, spec, api, isRM, rawFrames) {
  let x = spec.x
  let mood = spec.mood || "neutral"
  const name = spec.name || String(spec.id).toUpperCase()
  let dialogueTalk = false
  let talkUntil = 0
  let facing = 1
  let move = null // { from, to, start, dur, walk }
  let bob = 0
  let squash = 1
  let sayNode = null
  let gestureTimer = 0
  const hasFrame = (n) => spriteSet.frames.has(n)
  // pha trang trí riêng cho từng nhân vật → không đồng bộ
  const phase = (spec.x * 1.7) % 6.28
  let blinkNext = performance.now() + 2200 + ((spec.x * 37) % 2600)
  let blinkUntil = 0
  let reactUntil = 0
  let reactKind = null
  let nextGlance = performance.now() + 3000 + Math.random() * 3000

  // hàng đầu tiên có điểm ảnh → đỉnh đầu thật (cao thấp khác nhau theo nhân vật)
  const idleRows = rawFrames["neutral-idle"] || []
  let firstRow = idleRows.findIndex((r) => /[^. ]/.test(r))
  if (firstRow < 0) firstRow = 0
  const headY = FEET_Y - SPRITE_H + (firstRow * SPRITE_H) / Math.max(1, idleRows.length || 24)

  /* <mood>-x → neutral-x → null */
  function pick(kind) {
    const a = `${mood}-${kind}`
    if (hasFrame(a)) return a
    const b = `neutral-${kind}`
    return hasFrame(b) ? b : null
  }
  const idleFrame = () => pick("idle") || "neutral-idle"

  const isTalking = (t) => dialogueTalk || t < talkUntil

  function frameFor(t) {
    if (move && move.walk) {
      const n = Math.floor((t - move.start) / 150) % 2 ? "walk-a" : "walk-b"
      return hasFrame(n) ? n : idleFrame()
    }
    if (t < reactUntil && reactKind) {
      const n = `${reactKind}-react`
      if (hasFrame(n)) return n
      return hasFrame("neutral-react") ? "neutral-react" : idleFrame()
    }
    if (isTalking(t)) {
      const talk = pick("talk")
      if (!talk) return idleFrame()
      if (isRM()) return talk
      return Math.floor(t / 130) % 2 ? talk : idleFrame()
    }
    return idleFrame()
  }

  function applyFrame() {
    const t = performance.now()
    node.classList.toggle("is-talking", isTalking(t))
    spriteSet.setFrame(frameFor(t))
  }

  function place() {
    node.style.left = `${x - 36}px`
    node.style.transform = `translateY(${bob.toFixed(2)}px) scaleX(${facing}) scaleY(${squash})`
  }

  function setMood(m, opts = {}) {
    mood = m
    if (opts.talking !== undefined) dialogueTalk = opts.talking
    applyFrame()
  }
  function stopTalk() { dialogueTalk = false; applyFrame() }
  function setDialogueTalk(on) { dialogueTalk = on; applyFrame() }
  function talkFor(ms) {
    talkUntil = performance.now() + ms
    applyFrame()
    api.later(ms + 30, applyFrame)
  }
  function react(kind) {
    reactKind = kind
    reactUntil = performance.now() + 620
    applyFrame()
    api.later(660, applyFrame)
  }
  function face(dir) {
    facing = dir === "left" ? -1 : 1
    place()
  }
  function lookAt(tx) {
    face(tx >= x ? "right" : "left")
  }
  /** Quay mặt về phía người nói — chỉ khi đang rảnh (không đi, không nói). */
  function turnToward(tx) {
    if (move && move.walk) return
    if (isTalking(performance.now())) return
    if (Math.abs(tx - x) < 4) return
    lookAt(tx)
  }
  function startMove(to, dur, walk) {
    to = clamp(to, -80, STAGE_W + 80)
    if (isRM()) {
      x = to
      move = null
      place()
      applyFrame()
      return
    }
    move = { from: x, to, start: performance.now(), dur, walk }
  }
  function walkTo(tx) {
    const dist = Math.abs(tx - x)
    startMove(tx, Math.min(1600, Math.max(320, dist * 6)), true)
    face(tx >= x ? "right" : "left")
  }
  function leave(dir) {
    startMove(dir === "left" ? -60 : STAGE_W + 60, 900, true)
    face(dir)
  }
  function stepBack(tx) {
    const away = x >= tx ? 1 : -1
    gesture("stepBack")
    face(away > 0 ? "left" : "right") // vẫn nhìn về phía người kia
    startMove(clamp(x + away * 16, 18, STAGE_W - 18), 420, false)
  }

  function gesture(kind, targetX) {
    clearTimeout(gestureTimer)
    delete node.dataset.gesture
    void node.offsetWidth // khởi động lại animation khi lặp cùng cử chỉ
    body.style.removeProperty("--gdx")
    if (kind === "lean" && targetX !== undefined) {
      const dir = targetX >= x ? 1 : -1
      body.style.setProperty("--gdx", String(dir * facing))
    }
    node.dataset.gesture = kind
    const ms = GESTURE_MS[kind]
    if (ms) gestureTimer = api.later(ms, () => { delete node.dataset.gesture })
  }
  function clearGesture() {
    clearTimeout(gestureTimer)
    delete node.dataset.gesture
  }

  function setSay(n) { sayNode = n }
  function dropSay() {
    if (sayNode) sayNode.remove()
    sayNode = null
  }

  /* lớp trang trí: bob + chớp + đi + mấp máy + liếc — gọi mỗi frame rAF */
  function decor(t) {
    if (move) {
      const p = Math.min(1, (t - move.start) / move.dur)
      x = move.from + (move.to - move.from) * p
      if (p >= 1) move = null
    }
    // bob theo mood
    let bobAmp = 1.2
    let bobSpeed = 0.0021
    if (mood === "happy") { bobAmp = 1.8; bobSpeed = 0.0032 }
    if (mood === "annoyed") { bobAmp = 0.8; bobSpeed = 0.0026 }
    if (mood === "sad") { bobAmp = 0.6; bobSpeed = 0.0014 }
    bob = Math.sin(t * bobSpeed + phase) * bobAmp
    // chớp mắt: co giãn Y nhẹ thay vì đổi frame
    if (t > blinkNext && t > blinkUntil) {
      blinkUntil = t + 110
      blinkNext = t + 2400 + ((x * 53) % 2200)
    }
    squash = t < blinkUntil ? 0.92 : 1
    // thỉnh thoảng liếc sang người nói gần nhất hoặc người khác
    if (t > nextGlance) {
      nextGlance = t + 3000 + Math.random() * 3000
      if (!move && !isTalking(t)) {
        const last = api.getLastSpeaker()
        const others = api.others(self)
        let target = null
        if (last && last !== self && Math.random() < 0.55) target = last
        else if (others.length) target = others[Math.floor(Math.random() * others.length)]
        if (target) lookAt(target.x)
      }
    }
    node.classList.toggle("is-talking", isTalking(t))
    spriteSet.setFrame(frameFor(t))
    place()
  }

  function resetDecor() {
    bob = 0
    squash = 1
    place()
    applyFrame()
  }

  face("right")
  applyFrame()

  const self = {
    id: spec.id,
    name,
    node,
    bubble,
    headY,
    get x() { return x },
    get mood() { return mood },
    setMood,
    stopTalk,
    setDialogueTalk,
    talkFor,
    react,
    face,
    lookAt,
    turnToward,
    walkTo,
    leave,
    stepBack,
    gesture,
    clearGesture,
    setSay,
    dropSay,
    decor,
    resetDecor,
  }
  return self
}

/* ================================================================== môi trường
   Phòng/cảnh pixel tự vẽ (SVG) + lớp chuyển động phụ: quạt quay, đồng hồ,
   màn hình nhấp, đèn bàn. Tất cả bằng CSS animation (transform/opacity). */
function buildEnvironment(envLayer, envName) {
  envLayer.innerHTML = environmentSVG(envName, { STAGE_W, STAGE_H, GROUND_Y })
}

/* ================================================================== người qua lại phía sau
   Mỗi người là một .scn-extra (CSS keyframes lo chuyển động). Nhỏ + nhạt hơn nhân vật chính. */
function buildExtras(layer, list) {
  if (!Array.isArray(list)) return
  for (const e of list) {
    const kind = e.kind || "stand"
    const variant = e.variant ?? 0
    const node = el("div", { class: "scn-extra", attrs: { "data-kind": kind, "data-variant": String(variant) } })
    const inner = el("div", { class: "scn-extra__body" })
    const cols = kind === "cat" ? 12 : EXTRAS.cols
    const rows = kind === "cat" ? 5 : EXTRAS.rows
    const w = cols * EXTRA_CELL
    const h = rows * EXTRA_CELL
    node.style.width = `${w}px`
    node.style.height = `${h}px`
    node.style.top = `${(e.y ?? GROUND_Y + 5) - h}px`
    const svg = (frame, cls = "") => el("div", { class: `scn-extra__f ${cls}`.trim(), html: extraSVG(variant, frame) })
    if (kind === "walk") {
      const from = e.from ?? -24
      const to = e.to ?? STAGE_W + 24
      node.style.setProperty("--from", `${from}px`)
      node.style.setProperty("--to", `${to}px`)
      node.style.setProperty("--mid", `${Math.round((from + to) / 2)}px`)
      node.style.setProperty("--dur", `${e.dur ?? 16}s`)
      node.style.setProperty("--delay", `${e.delay ?? 0}s`)
      node.style.setProperty("--f0", to >= from ? "1" : "-1")
      inner.append(svg("walk-a", "is-a"), svg("walk-b", "is-b"))
    } else if (kind === "cat") {
      node.style.left = `${e.x ?? 0}px`
      inner.append(svg("cat"))
    } else {
      node.style.left = `${e.x ?? 0}px`
      node.style.setProperty("--bob-delay", `${((e.x ?? 0) % 7) * 0.3}s`)
      inner.append(svg(kind === "sit" ? "sit" : "stand"))
    }
    node.append(inner)
    layer.append(node)
  }
}
