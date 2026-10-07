/* assessment.js — màn ĐÁNH GIÁ: HUD + sân khấu tình huống + điều phối việc lưu câu trả lời.
   Mỗi lượt làm một đề (A hoặc B, luân phiên); đề gồm tình huống chữ và cảnh động.
   Không hiển thị điểm trong lúc làm; toàn bộ việc chấm và lưu nằm ở core/eqScoring.js.
   Bài dở được lưu trên máy (localStorage) nên đóng tab vẫn làm tiếp được. */

import { el, frame } from "../core/dom.js"
import { sound, soundToggle } from "../core/sound.js"
import { createQuestionScene } from "../scene/questionScene.js"
import { createSceneRuntime } from "../scene/sceneRuntime.js"
import { isStaged, toScene } from "../scene/staged.js"
import {
  ITEM_BY_ID,
  RETAKE_PRACTICE_REPS,
  RETAKE_WAIT_DAYS,
  finishAttempt,
  formIds,
  latestAttempt,
  loadAssessment,
  practiceSince,
  saveAssessment,
  scoreAttempt,
  shuffleScenarios,
} from "../core/eqScoring.js"

const CODES = "ABCDEF"
const DAY = 24 * 60 * 60 * 1000

/** Thứ tự phương án được xáo cố định theo lượt làm, để vị trí không gắn với điểm. */
function seeded(seedText) {
  let h = 2166136261
  for (const ch of seedText) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    h ^= h >>> 16
    return (h >>> 0) / 4294967296
  }
}

function displayItem(item, seed) {
  const rand = seeded(`${seed}:${item.id}`)
  const choices = [...item.choices]
  for (let i = choices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1))
    ;[choices[i], choices[j]] = [choices[j], choices[i]]
  }
  return { ...item, choices: choices.map((c, i) => ({ ...c, code: CODES[i] })) }
}

export function renderAssessment(mount, { navigate }) {
  let form = "A"
  let answers = {}
  let order = []
  let index = 0
  let startedAt = 0
  let finished = false
  let started = false
  let runtime = null

  const list = () => order.map((id) => ITEM_BY_ID[id]).filter(Boolean)
  const current = () => list()[index]
  const answeredCount = () => list().filter((item) => answers[item.id]).length
  const view = (item) => (item ? displayItem(item, startedAt) : item)
  const choiceFor = (item) => (item ? view(item).choices.find((c) => c.id === answers[item.id]) ?? null : null)
  const persist = () => saveAssessment({ form, order, answers, index, startedAt })

  /* ---------------------------------------------------------------- khung */
  const countEl = el("span", { class: "hud__count", text: "" })
  const progressEl = el("span", { class: "hud__progress", text: "" })

  const backBtn = el("button", { class: "btn btn--ghost", attrs: { type: "button" } })
  backBtn.append(el("span", { class: "pxf-in", text: "← Quay lại" }))
  backBtn.addEventListener("click", goBack)

  const submitBtn = el("button", { class: "btn btn--accent", attrs: { type: "button" } })
  submitBtn.append(el("span", { class: "pxf-in", text: "Xem kết quả" }))
  submitBtn.style.display = "none"
  submitBtn.addEventListener("click", finish)

  const barFill = el("div", { class: "bar__fill" })
  const barEdge = el("div", { class: "bar__edge" })
  const bar = el("div", { class: "bar" }, barFill, barEdge)

  const hud = el(
    "div",
    { class: "hud" },
    el("div", { class: "hud__row" }, countEl, el("span", { class: "hud__spacer" }), progressEl),
    el("div", { class: "hud__bar" }, bar),
    el("div", { class: "hud__actions" }, backBtn, submitBtn, soundToggle()),
  )
  hud.style.display = "none"

  const stage = el("div", { class: "stage" })
  const sceneHost = el("div", { class: "scene-stage-host assess-scene" })
  mount.append(el("div", { class: "quiz-wrap" }, hud, stage))

  const scene = createQuestionScene({ onAnswer: handleAnswer, onAdvance: handleAdvance })

  /* ------------------------------------------------------------ màn mở đầu */
  const saved = loadAssessment()
  const last = latestAttempt()
  const isRetake = Boolean(last)
  const total = formIds(saved.form).length
  const resumable = Object.keys(saved.answers || {}).length

  const startBtn = el("button", { class: "btn btn--accent btn--lg", attrs: { type: "button" } })
  startBtn.append(el("span", { class: "pxf-in", text: isRetake ? "Bắt đầu đánh giá lại" : "Bắt đầu đánh giá" }))
  startBtn.addEventListener("click", () => start({ fresh: true }))

  const resumeBtn = el("button", { class: "btn btn--accent btn--lg", attrs: { type: "button" } })
  resumeBtn.append(el("span", { class: "pxf-in", text: "Tiếp tục bài đang làm" }))
  resumeBtn.style.display = "none"
  resumeBtn.addEventListener("click", () => start({ fresh: false }))

  const notes = [
    el("p", {
      class: "prose",
      text: `${total} tình huống thật của đời sống học sinh — có cả những cảnh động, nơi nhân vật diễn lại điều xảy ra sau lựa chọn của bạn.`,
    }),
    el("p", { class: "prose", text: "Cách nào cũng có lý. Chọn cách gần với điều bạn thật sự sẽ làm — không phải cách bạn nghĩ là đúng." }),
    el("p", { class: "prose", text: "Trong lúc làm, bạn sẽ không thấy điểm. Cuối bài là sáu kỹ năng, kèm những tình huống cho thấy vì sao, và cách luyện kỹ năng cần luyện nhất." }),
  ]
  if (isRetake) {
    const days = Math.floor((Date.now() - (last.finishedAt || 0)) / DAY)
    const reps = Object.values(practiceSince(last.finishedAt || 0)).reduce((sum, r) => sum + r.practised, 0)
    notes.push(
      el("p", {
        class: "prose",
        text: `Lần này dùng bộ tình huống khác (đề ${saved.form}) để đo kỹ năng chứ không đo trí nhớ. Cuối bài bạn sẽ thấy từng kỹ năng thay đổi thế nào so với lần trước.`,
      }),
    )
    if (days < RETAKE_WAIT_DAYS || reps < RETAKE_PRACTICE_REPS) {
      notes.push(
        el("p", {
          class: "prose muted",
          text: `Gợi ý: kết quả rõ hơn khi bạn đợi khoảng ${RETAKE_WAIT_DAYS} ngày và luyện ít nhất ${RETAKE_PRACTICE_REPS} tình huống. Hiện tại: ${days} ngày, ${reps} lượt luyện. Bạn vẫn có thể làm ngay.`,
        }),
      )
    }
  }
  notes.push(
    el("p", { class: "prose muted", text: "Mất khoảng 10–15 phút. Đây là công cụ học tập và tự phát triển, không phải một thang đo đã được kiểm định tâm lý và không dùng để chẩn đoán." }),
  )

  const intro = frame(
    el(
      "div",
      { class: "quiz-intro__in" },
      el("h2", { class: "px-head", text: isRetake ? "Đánh giá lại" : "Trước khi bắt đầu" }),
      el("div", { class: "quiz-intro__note" }, ...notes),
      el("div", { class: "quiz-intro__actions" }, resumeBtn, startBtn, soundToggle()),
    ),
    { size: "lg", cls: "quiz-intro" },
  )
  stage.append(intro)

  if (resumable > 0) {
    resumeBtn.style.display = ""
    startBtn.replaceChildren(el("span", { class: "pxf-in", text: "Làm lại từ đầu" }))
    startBtn.classList.remove("btn--accent")
    startBtn.classList.add("btn--ghost")
    intro.querySelector(".quiz-intro__note")?.append(
      el("p", { class: "prose", text: `Bạn đang làm dở: đã trả lời ${resumable}/${total} tình huống.` }),
    )
  }

  /* ------------------------------------------------------------- điều phối */
  function start({ fresh }) {
    const state = loadAssessment()
    form = state.form
    answers = fresh ? {} : { ...(state.answers || {}) }
    order = fresh || !state.order ? shuffleScenarios(form) : state.order
    startedAt = fresh || !state.startedAt ? Date.now() : state.startedAt
    index = fresh ? 0 : Math.min(Math.max(state.index, 0), order.length - 1)
    if (fresh || !answers[current()?.id]) {
      const firstOpen = list().findIndex((item) => !answers[item.id])
      if (firstOpen >= 0) index = firstOpen
    }
    started = true
    finished = false
    persist()

    intro.remove()
    hud.style.display = ""
    sound.open()
    updateHud()
    showItem("next")
    window.scrollTo({ top: 0, behavior: "auto" })
  }

  function stopRuntime() {
    runtime?.destroy()
    runtime = null
    sceneHost.replaceChildren()
  }

  function showItem(dir) {
    const item = current()
    if (!item) return
    if (isStaged(item)) {
      scene.el.remove()
      stopRuntime()
      stage.append(sceneHost)
      runtime = createSceneRuntime(sceneHost, toScene(view(item)), {
        onAnswer(choiceId) {
          const choice = item.choices.find((c) => c.id === choiceId)
          if (choice) handleAnswer(item, choice)
        },
        onDone() {
          advance()
        },
      })
      runtime.start()
      return
    }
    stopRuntime()
    sceneHost.remove()
    if (!scene.el.isConnected) stage.append(scene.el)
    scene.show(view(item), { dir, answer: choiceFor(item) })
  }

  /** Lưu ngay khi người dùng xác nhận — trước mọi hoạt ảnh chuyển câu. */
  function handleAnswer(item, choice) {
    answers[item.id] = choice.id
    persist()
    updateHud()
  }

  function updateHud() {
    const items = list()
    const item = items[index]
    const done = answeredCount()
    countEl.textContent = item ? `Tình huống ${index + 1}` : ""
    progressEl.textContent = `${done}/${items.length} hoàn thành`
    backBtn.disabled = index <= 0
    submitBtn.style.display = done === items.length ? "" : "none"
    const pct = items.length ? done / items.length : 0
    const width = `${(pct * 100).toFixed(2)}%`
    barFill.style.width = width
    barEdge.style.left = `calc(${width} - 5px)`
  }

  async function goBack() {
    if (!started || index <= 0) return
    index -= 1
    persist()
    updateHud()
    showItem("back")
  }

  async function handleAdvance() {
    await scene.leave()
    advance()
  }

  function advance() {
    const items = list()
    if (index < items.length - 1) {
      index += 1
      persist()
      updateHud()
      showItem("next")
      return
    }
    const firstOpen = items.findIndex((item) => !answers[item.id])
    if (firstOpen >= 0) {
      index = firstOpen
      persist()
      updateHud()
      showItem("back")
      return
    }
    finish()
  }

  function finish() {
    // Chốt một lần duy nhất cho mỗi lượt làm bài, dù nút được bấm liên tục.
    if (!started || finished) return
    if (list().some((item) => !answers[item.id])) return
    finished = true
    persist()
    const attempt = finishAttempt()
    reportStats(attempt)
    navigate("/result")
  }

  function reportStats(attempt) {
    if (!attempt) return
    const elapsed = Math.max(0, Math.round(((attempt.finishedAt || Date.now()) - (attempt.startedAt || Date.now())) / 1000))
    // Chỉ gửi mức tổng dạng bậc và thời gian làm bài: không gửi câu trả lời, không gửi mã tình huống.
    const band = scoreAttempt(attempt)?.overallLevel ?? "low"
    window
      .fetch?.("/api/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ band, t: elapsed }),
        keepalive: true,
      })
      ?.catch(() => {})
  }

  return {
    destroy() {
      stopRuntime()
      scene.destroy()
      mount.textContent = ""
    },
  }
}
