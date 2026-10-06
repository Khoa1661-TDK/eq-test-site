/* questionScene.js — máy trạng thái của một câu hỏi (phần "game" của sản phẩm).
   ENTERING → DIALOGUE_TYPING → DIALOGUE_READY → NEXT_DIALOGUE → QUESTION_PROMPT → CHOOSING
            → CONFIRMING → TRANSITIONING → (câu kế tiếp)

   Quy tắc chống lỗi:
   - MỘT hàm xử lý duy nhất cho mỗi cử chỉ; mỗi lần bấm chỉ làm ĐÚNG MỘT việc theo trạng thái.
     Nhờ vậy cú bấm để hiện hết chữ không thể đồng thời nhảy sang đoạn thoại kế tiếp.
   - Mọi setTimeout đều nằm trong danh sách và bị huỷ khi đổi câu → không rò trạng thái cũ.
   - Đáp án chỉ được báo MỘT lần cho mỗi câu (cờ answeredFor) và được lưu ngay khi xác nhận. */

import { el } from "../core/dom.js"
import { TIMING, prefersReducedMotion } from "../core/motion.js"
import { rateFor } from "../core/typewriter.js"
import { sound } from "../core/sound.js"
import { createConsole } from "../ui/console.js"
import { createChoiceList } from "../ui/choices.js"
import { createCharacter } from "../ui/character.js"

export const STATE = {
  IDLE: "IDLE",
  ENTERING: "ENTERING",
  DIALOGUE_TYPING: "DIALOGUE_TYPING",
  DIALOGUE_READY: "DIALOGUE_READY",
  NEXT_DIALOGUE: "NEXT_DIALOGUE",
  QUESTION_PROMPT: "QUESTION_PROMPT",
  CHOOSING: "CHOOSING",
  CONFIRMING: "CONFIRMING",
  TRANSITIONING: "TRANSITIONING",
}

const TYPE_START_DELAY = 70
const CHOICE_REVEAL_DELAY = 150
const TOUCH = typeof window !== "undefined" && window.matchMedia?.("(hover: none)").matches

export function createQuestionScene({ onAnswer, onAdvance, onMove } = {}) {
  const sprite = el("div", { class: "figure__sprite" })
  const ground = el("div", { class: "figure__ground", attrs: { "aria-hidden": "true" } })
  const figure = el("div", { class: "figure", attrs: { "aria-hidden": "true" } }, sprite, ground)

  const board = createConsole({ page: "", onChar: (char) => sound.voice(char) })
  const choices = createChoiceList({
    onSelect: choose,
    onMove: () => sound.move(),
  })
  const slot = el("div", { class: "choices-slot" }, choices.el)
  board.mountSlot(slot)

  const scene = el("div", { class: "scene", dataset: { state: STATE.IDLE } }, figure, board.el)
  const character = createCharacter(sprite)

  let question = null
  let beats = []
  let beatIndex = 0
  let state = STATE.IDLE
  let answeredFor = null
  let timers = []
  let destroyed = false
  let endAction = null // việc cần làm khi đã đi hết các nhịp được nối thêm (chế độ luyện tập)
  let endHintText = null
  let feedbackPage = "PHẢN HỒI"

  /* ------------------------------------------------------------- tiện ích */
  const later = (fn, ms) => {
    const id = window.setTimeout(() => {
      timers = timers.filter((t) => t !== id)
      if (!destroyed) fn()
    }, ms)
    timers.push(id)
    return id
  }

  function clearTimers() {
    for (const id of timers) window.clearTimeout(id)
    timers = []
  }

  function setState(next) {
    state = next
    scene.dataset.state = next
  }

  /** Giữ chiều cao văn bản bằng đoạn dài nhất để khung không nhảy giữa các đoạn. */
  function reserveText(texts) {
    const node = board.textEl
    node.style.minHeight = ""
    const cssMin = parseFloat(getComputedStyle(node).minHeight) || 0
    let max = 0
    for (const text of texts) {
      node.textContent = text
      max = Math.max(max, node.getBoundingClientRect().height)
    }
    node.textContent = ""
    node.style.minHeight = `${Math.ceil(Math.max(max, cssMin)) + 1}px`
  }

  /** Chốt chiều cao cả khung (đã gồm danh sách lựa chọn) để hiện lựa chọn không làm khung giãn ra. */
  function lockBoardHeight() {
    board.el.style.minHeight = ""
    const height = board.el.getBoundingClientRect().height
    board.el.style.minHeight = `${Math.ceil(height) + 1}px`
  }

  function relayout() {
    if (!question) return
    const keep = board.textEl.textContent
    reserveText(beats.map((beat) => beat.text))
    lockBoardHeight()
    board.textEl.textContent = keep
  }

  /* --------------------------------------------------------- luồng chính */
  function show(next, { dir = "next", answer = null } = {}) {
    clearTimers()
    board.typewriter.cancel()
    question = next
    beatIndex = 0
    answeredFor = null
    endAction = null
    endHintText = null
    beats = [...next.dialogue.map((text) => ({ text, kind: "dialogue" })), { text: next.prompt, kind: "prompt" }]

    board.setCue(false)
    board.setHint(null)
    board.setPage("TÌNH HUỐNG")
    board.announce("")
    figure.classList.remove("is-talk")
    character.setFace(next.face)
    sound.setVoice(next.face)
    character.stopTalk()
    choices.clear()
    choices.lock(true)
    slot.classList.remove("is-open", "is-instant")

    scene.classList.remove("is-leaving")
    scene.removeAttribute("data-dir")
    void scene.offsetWidth // buộc tính lại để hoạt ảnh vào sân khấu chạy lại
    scene.dataset.dir = dir

    reserveText(beats.map((beat) => beat.text))
    choices.build(next.choices ?? next.options ?? [], { answerId: answer?.id ?? null })
    lockBoardHeight()

    if (answer) {
      // quay lại câu đã trả lời: hiện ngay, không bắt người dùng gõ chữ lại
      beatIndex = beats.length - 1
      setState(STATE.CHOOSING)
      board.setPage("CÂU HỎI")
      board.textEl.textContent = next.prompt
      board.announce(next.prompt)
      openChoices({ instant: true })
      return
    }

    setState(STATE.ENTERING)
    later(() => typeBeat(0), prefersReducedMotion() ? 0 : TYPE_START_DELAY)
  }

  function typeBeat(index) {
    const beat = beats[index]
    if (!beat) return
    beatIndex = index
    const isPrompt = beat.kind === "prompt"
    board.setCue(false)
    board.setHint(null)
    board.setPage(isPrompt ? "CÂU HỎI" : beat.kind === "feedback" ? feedbackPage : "TÌNH HUỐNG")
    figure.classList.add("is-talk")
    character.startTalk()
    setState(isPrompt ? STATE.QUESTION_PROMPT : STATE.DIALOGUE_TYPING)
    board.typewriter.type(beat.text, { msPerChar: rateFor(beat.text) })
  }

  function onTyped() {
    const beat = beats[beatIndex]
    if (!beat) return
    figure.classList.remove("is-talk")
    character.stopTalk()
    board.announce(beat.text)

    if (beat.kind === "prompt") {
      setState(STATE.CHOOSING)
      later(openChoices, prefersReducedMotion() ? 0 : CHOICE_REVEAL_DELAY)
      return
    }
    setState(STATE.DIALOGUE_READY)
    const atEnd = endAction && beatIndex === beats.length - 1
    board.setHint(atEnd && endHintText ? endHintText : TOUCH ? "Chạm để tiếp tục" : "Nhấn để tiếp tục")
    board.setCue(true)
  }

  board.typewriter.onDone = onTyped

  function openChoices({ instant = false } = {}) {
    board.setCue(false)
    board.setHint(null)
    setState(STATE.CHOOSING)
    slot.classList.toggle("is-instant", instant)
    slot.classList.add("is-open")
    choices.open()
    choices.lock(false)
    if (instant) {
      choices.el.querySelectorAll(".choice").forEach((node) => node.classList.add("is-in"))
    } else {
      choices.reveal()
    }
  }

  function nextBeat() {
    if (beatIndex >= beats.length - 1) {
      const action = endAction
      endAction = null
      endHintText = null
      if (action) {
        board.setCue(false)
        board.setHint(null)
        action()
      }
      return
    }
    board.setCue(false)
    board.setHint(null)
    setState(STATE.NEXT_DIALOGUE)
    typeBeat(beatIndex + 1)
  }

  /** Nối thêm nhịp thoại ngay sau nhịp hiện tại (phản hồi ở chế độ Luyện tập).
      Khi người dùng đi hết các nhịp mới, `onEnd` được gọi — máy trạng thái câu hỏi
      không cần biết gì về cách chấm điểm EQ. */
  function pushBeats(lines, { page = "PHẢN HỒI", onEnd = null, endHint = null } = {}) {
    const items = (Array.isArray(lines) ? lines : [lines]).filter((line) => line != null && line !== "")
    if (!items.length) return
    beats = beats.slice(0, beatIndex + 1)
    for (const line of items) beats.push({ text: typeof line === "string" ? line : line.text, kind: "feedback" })
    feedbackPage = page
    endAction = onEnd
    endHintText = endHint
    reserveText(beats.map((beat) => beat.text))
    lockBoardHeight()
    nextBeat()
  }

  /** Điểm vào duy nhất cho click/chạm/phím. Mỗi lần gọi chỉ làm một việc. */
  function activate(source) {
    if (!question) return
    if (state === STATE.DIALOGUE_TYPING || state === STATE.QUESTION_PROMPT) {
      board.typewriter.finish()
      return
    }
    if (state === STATE.DIALOGUE_READY) {
      nextBeat()
      return
    }
    if (state === STATE.CHOOSING && source === "key") {
      choices.selectActive()
    }
  }

  function choose(option) {
    if (!question || state !== STATE.CHOOSING) return
    if (answeredFor === question.id) return
    answeredFor = question.id
    setState(STATE.CONFIRMING)
    sound.confirm()
    choices.confirm(option.id)
    board.announce(`Đã chọn ${option.code}. ${option.text}`)
    const answered = question
    onAnswer?.(answered, option) // lưu ngay, trước mọi hoạt ảnh
    later(() => {
      setState(STATE.TRANSITIONING)
      onAdvance?.(answered, option)
    }, TIMING.confirm)
  }

  /* ---------------------------------------------------------- tương tác */
  function onSceneClick() {
    activate("pointer")
  }

  function onKeyDown(event) {
    if (destroyed || event.defaultPrevented) return
    if (event.ctrlKey || event.metaKey || event.altKey) return
    const target = event.target
    if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return
    const key = event.key
    const onChoice = !!target?.classList?.contains("choice")

    if (state === STATE.CHOOSING) {
      if (key === "ArrowUp" || key === "w" || key === "W") {
        event.preventDefault()
        choices.move(-1, { focus: onChoice })
      } else if (key === "ArrowDown" || key === "s" || key === "S") {
        event.preventDefault()
        choices.move(1, { focus: onChoice })
      } else if (key === "Enter" || key === " ") {
        // nếu tiêu điểm đang ở một nút lựa chọn, để trình duyệt tự phát sinh click
        if (onChoice) return
        event.preventDefault()
        activate("key")
      }
      return
    }

    if (key === "Enter" || key === " ") {
      event.preventDefault()
      activate("key")
    }
  }

  scene.addEventListener("click", onSceneClick)
  document.addEventListener("keydown", onKeyDown)

  // đổi cài đặt giảm chuyển động giữa chừng
  const motionQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)")
  const onMotionChange = () => {
    if (state === STATE.DIALOGUE_TYPING || state === STATE.QUESTION_PROMPT) board.typewriter.finish()
  }
  motionQuery?.addEventListener("change", onMotionChange)

  document.fonts?.ready?.then(() => {
    if (!destroyed) relayout()
  })

  return {
    el: scene,
    show,
    pushBeats,
    choices,
    board,
    character,
    get state() {
      return state
    },
    get question() {
      return question
    },
    /** Rời sân khấu rồi trả quyền cho view. */
    async leave() {
      clearTimers()
      board.typewriter.cancel()
      figure.classList.remove("is-talk")
      character.stopTalk()
      scene.classList.add("is-leaving")
      if (!prefersReducedMotion()) {
        await new Promise((resolve) => window.setTimeout(resolve, TIMING.out))
      }
      scene.classList.remove("is-leaving")
    },
    destroy() {
      destroyed = true
      clearTimers()
      board.typewriter.cancel()
      character.destroy()
      scene.removeEventListener("click", onSceneClick)
      document.removeEventListener("keydown", onKeyDown)
      motionQuery?.removeEventListener("change", onMotionChange)
      scene.remove()
    },
  }
}