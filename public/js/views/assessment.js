/* assessment.js — màn ĐÁNH GIÁ: HUD + sân khấu tình huống + điều phối việc lưu câu trả lời.
   Không hiển thị điểm trong lúc làm; toàn bộ việc chấm nằm ở core/eqScoring.js. */

import { el, frame } from "../core/dom.js"
import { sound, soundToggle } from "../core/sound.js"
import { createQuestionScene } from "../scene/questionScene.js"
import { SCENARIO_BY_ID } from "../data/scenarios.js"
import {
  TOTAL_SCENARIOS,
  loadAssessment,
  saveAssessment,
  scoreAnswers,
  shuffleScenarios,
} from "../core/eqScoring.js"

export function renderAssessment(mount, { navigate }) {
  let answers = {}
  let order = []
  let index = 0
  let startedAt = 0
  let finished = false
  let statsSent = false
  let started = false
  let resumable = 0

  const list = () => order.map((id) => SCENARIO_BY_ID[id]).filter(Boolean)
  const current = () => list()[index]
  const answeredCount = () => list().filter((scenario) => answers[scenario.id]).length
  const choiceFor = (scenario) =>
    scenario ? scenario.choices.find((choice) => choice.id === answers[scenario.id]) ?? null : null

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
  mount.append(el("div", { class: "quiz-wrap" }, hud, stage))

  const scene = createQuestionScene({ onAnswer: handleAnswer, onAdvance: handleAdvance })

  /* ------------------------------------------------------------ màn mở đầu */
  const startBtn = el("button", { class: "btn btn--accent btn--lg", attrs: { type: "button" } })
  startBtn.append(el("span", { class: "pxf-in", text: "Bắt đầu đánh giá" }))
  startBtn.addEventListener("click", () => start({ fresh: true }))

  const resumeBtn = el("button", { class: "btn btn--accent btn--lg", attrs: { type: "button" } })
  resumeBtn.append(el("span", { class: "pxf-in", text: "Tiếp tục bài đang làm" }))
  resumeBtn.style.display = "none"
  resumeBtn.addEventListener("click", () => start({ fresh: false }))

  const intro = frame(
    el(
      "div",
      { class: "quiz-intro__in" },
      el("h2", { class: "px-head", text: "Trước khi bắt đầu" }),
      el(
        "div",
        { class: "quiz-intro__note" },
        el("p", { class: "prose", text: `${TOTAL_SCENARIOS} tình huống thật của đời sống học sinh: bài nhóm, điểm kiểm tra, bạn bè, gia đình, áp lực thi cử.` }),
        el("p", { class: "prose", text: "Mỗi tình huống có bốn cách phản ứng, cách nào cũng có lý. Chọn cách gần với bạn nhất — không phải cách bạn nghĩ là đúng." }),
        el("p", { class: "prose", text: "Trong lúc làm, bạn sẽ không thấy điểm. Kết quả hiện ra ở cuối, kèm gợi ý luyện tập cho kỹ năng cần luyện nhất." }),
        el("p", { class: "prose muted", text: "Mất khoảng 8–12 phút. Đây là công cụ học tập và tự phát triển, không phải một thang đo đã được kiểm định tâm lý và không dùng để chẩn đoán." }),
      ),
      el("div", { class: "quiz-intro__actions" }, resumeBtn, startBtn, soundToggle()),
    ),
    { size: "lg", cls: "quiz-intro" },
  )

  stage.append(intro)

  /* ------------------------------------------------------------- điều phối */
  function start({ fresh }) {
    const saved = fresh ? { answers: {}, index: 0, order: null } : loadAssessment()
    answers = { ...(saved.answers || {}) }
    order = saved.order ?? shuffleScenarios()
    index = fresh ? 0 : Math.min(Math.max(saved.index, 0), TOTAL_SCENARIOS - 1)
    if (fresh || !answers[current()?.id]) {
      const firstOpen = list().findIndex((scenario) => !answers[scenario.id])
      if (firstOpen >= 0) index = firstOpen
    }
    started = true
    finished = false
    statsSent = false
    startedAt = Date.now()
    saveAssessment(answers, index, order)

    intro.remove()
    stage.append(scene.el)
    hud.style.display = ""
    sound.open()
    updateHud()
    scene.show(current(), { dir: "next", answer: choiceFor(current()) })
    window.scrollTo({ top: 0, behavior: "auto" })
  }

  /** Lưu ngay khi người dùng xác nhận — trước mọi hoạt ảnh chuyển câu. */
  function handleAnswer(scenario, choice) {
    answers[scenario.id] = choice.id
    saveAssessment(answers, index, order)
    updateHud()
  }

  function updateHud() {
    const scenarios = list()
    const scenario = scenarios[index]
    const done = answeredCount()
    countEl.textContent = scenario ? `Tình huống ${index + 1}` : ""
    progressEl.textContent = `${done}/${scenarios.length} hoàn thành`
    backBtn.disabled = index <= 0
    submitBtn.style.display = done === scenarios.length ? "" : "none"
    const pct = scenarios.length ? done / scenarios.length : 0
    const width = `${(pct * 100).toFixed(2)}%`
    barFill.style.width = width
    barEdge.style.left = `calc(${width} - 5px)`
  }

  function goBack() {
    if (!started || index <= 0) return
    index -= 1
    const scenario = current()
    saveAssessment(answers, index, order)
    updateHud()
    scene.show(scenario, { dir: "back", answer: choiceFor(scenario) })
  }

  async function handleAdvance() {
    await scene.leave()
    const scenarios = list()
    if (index < scenarios.length - 1) {
      index += 1
      saveAssessment(answers, index, order)
      updateHud()
      scene.show(current(), { dir: "next", answer: choiceFor(current()) })
      return
    }
    const firstOpen = scenarios.findIndex((scenario) => !answers[scenario.id])
    if (firstOpen >= 0) {
      index = firstOpen
      saveAssessment(answers, index, order)
      updateHud()
      scene.show(current(), { dir: "back", answer: choiceFor(current()) })
      return
    }
    finish()
  }

  function finish() {
    // Chốt một lần duy nhất cho mỗi lượt làm bài, dù nút được bấm liên tục.
    if (!started || finished) return
    const scenarios = list()
    if (scenarios.some((scenario) => !answers[scenario.id])) return
    finished = true
    saveAssessment(answers, index, order)
    reportStats()
    navigate("/result")
  }

  function reportStats() {
    if (statsSent) return
    statsSent = true
    const elapsed = Math.max(0, Math.round((Date.now() - startedAt) / 1000))
    // Chỉ gửi mức tổng dạng bậc và thời gian làm bài: không gửi câu trả lời, không gửi mã tình huống.
    const band = scoreAnswers(answers).overallLevel
    window
      .fetch?.("/api/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ band, t: elapsed }),
        keepalive: true,
      })
      ?.catch(() => {})
  }

  /* --------------------------------------------------------- bài đang làm */
  const saved = loadAssessment()
  resumable = Object.keys(saved.answers || {}).length
  if (resumable > 0) {
    resumeBtn.style.display = ""
    startBtn.replaceChildren(el("span", { class: "pxf-in", text: "Làm lại từ đầu" }))
    startBtn.classList.remove("btn--accent")
    startBtn.classList.add("btn--ghost")
    intro.querySelector(".quiz-intro__note")?.append(
      el("p", { class: "prose", text: `Bạn đang làm dở: đã trả lời ${resumable}/${TOTAL_SCENARIOS} tình huống.` }),
    )
  }

  return {
    destroy() {
      scene.destroy()
      mount.textContent = ""
    },
  }
}