/* assessment.js — màn ĐÁNH GIÁ E-Quest: bảng "Trước khi bắt đầu", rồi 10 tình huống rút từ bộ 20
   (đủ năm tiêu chí EQ và đủ 10 profile, xem core/questScoring.js).
   Mỗi tình huống là một cảnh pixel diễn MỘT lần cùng lúc với bối cảnh, câu hỏi và bốn phương án,
   gọn trong một màn hình; bấm một phương án là sang câu tiếp, không hiện kết quả từng câu.
   Bài dở được lưu trên máy (localStorage) nên đóng tab vẫn làm tiếp được. */

import { el, frame } from "../core/dom.js"
import { sound, soundToggle } from "../core/sound.js"
import { createSceneRuntime } from "../scene/sceneRuntime.js"
import { STAGING_QUEST } from "../data/stagingQuest.js"
import { QUEST_BY_ID, QUEST_LENGTH, clearQuest, drawQuest, finishQuest, loadQuest, questAttempts, saveQuest } from "../core/questScoring.js"

const CODES = "ABCD"

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

function toQuestScene(item, seed) {
  const rand = seeded(`${seed}:${item.id}`)
  const choices = [...item.choices]
  for (let i = choices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1))
    ;[choices[i], choices[j]] = [choices[j], choices[i]]
  }
  const st = STAGING_QUEST[item.id] ?? { environment: "classroom", cast: [{ id: "player", x: 160, mood: "neutral", name: "Bạn" }], timeline: [] }
  return {
    id: item.id,
    label: st.label ?? item.title.toUpperCase(),
    environment: st.environment,
    dialogueSpeaker: st.place ?? "",
    chatTitle: st.chatTitle,
    characters: st.cast,
    timeline: st.timeline ?? [],
    ...(st.extras !== undefined ? { extras: st.extras } : {}),
    context: item.context,
    prompt: item.prompt,
    choices: choices.map((c, i) => ({ id: c.id, code: CODES[i], text: c.text })),
  }
}

export function renderAssessment(mount, { navigate }) {
  let order = []
  let answers = {}
  let index = 0
  let startedAt = 0
  let started = false
  let finished = false
  let runtime = null

  const current = () => QUEST_BY_ID[order[index]]
  const answeredCount = () => order.filter((id) => answers[id]).length
  const persist = () => saveQuest({ order, answers, index, startedAt })

  /* ---------------------------------------------------------------- khung */
  const countEl = el("span", { class: "hud__count", text: "" })
  const progressEl = el("span", { class: "hud__progress", text: "" })

  const backBtn = el("button", { class: "btn btn--ghost btn--sm", attrs: { type: "button", "aria-label": "Quay lại tình huống trước" } })
  backBtn.append(el("span", { class: "pxf-in", text: "←" }))
  backBtn.addEventListener("click", goBack)

  const barFill = el("div", { class: "bar__fill" })
  const barEdge = el("div", { class: "bar__edge" })
  const bar = el("div", { class: "bar" }, barFill, barEdge)

  const hud = el(
    "div",
    { class: "hud hud--quest" },
    el("div", { class: "hud__row" }, backBtn, countEl, el("span", { class: "hud__spacer" }), progressEl, soundToggle()),
    el("div", { class: "hud__bar" }, bar),
  )
  hud.style.display = "none"

  const stage = el("div", { class: "stage" })
  const sceneHost = el("div", { class: "scene-stage-host assess-scene" })
  mount.append(el("div", { class: "quiz-wrap quiz-wrap--quest" }, hud, stage))

  /* ------------------------------------------------------------ màn mở đầu */
  const saved = loadQuest()
  const resumable = saved ? Object.keys(saved.answers).length : 0
  const isRetake = questAttempts().length > 0

  const startBtn = el("button", { class: "btn btn--accent btn--lg", attrs: { type: "button" } })
  startBtn.append(el("span", { class: "pxf-in", text: isRetake ? "Làm lại bài test" : "Bắt đầu" }))
  startBtn.addEventListener("click", () => start({ fresh: true }))

  const resumeBtn = el("button", { class: "btn btn--accent btn--lg", attrs: { type: "button" } })
  resumeBtn.append(el("span", { class: "pxf-in", text: "Tiếp tục bài đang làm" }))
  resumeBtn.style.display = "none"
  resumeBtn.addEventListener("click", () => start({ fresh: false }))

  const section = (icon, title, ...body) =>
    el(
      "section",
      { class: "quiz-intro__sec" },
      el("h3", { class: "quiz-intro__h" }, el("span", { class: "quiz-intro__icon", text: icon, attrs: { "aria-hidden": "true" } }), el("span", { text: title })),
      ...body,
    )

  const howTo = el("ul", { class: "quiz-intro__rules" })
  for (const text of [
    "Đọc từng tình huống và chọn cách bạn sẽ phản ứng.",
    "Hãy chọn theo suy nghĩ thật của mình, đừng chọn đáp án chỉ vì nghĩ rằng nó tốt nhất.",
    "Sau khi hoàn thành, khám phá kết quả và những điều bạn có thể nhận ra về bản thân.",
  ]) {
    howTo.append(el("li", { text }))
  }

  const note = el("div", { class: "quiz-intro__note" })
  const intro = frame(
    el(
      "div",
      { class: "quiz-intro__in" },
      el("p", { class: "quiz-intro__kicker", text: "Unlock your EQ" }),
      el("h2", { class: "px-head", text: "Trước khi bắt đầu..." }),
      el("p", { class: "quiz-intro__sub", text: "Một chút thông tin để bạn sẵn sàng bước vào trò chơi." }),
      section("♡", "Về E-Quest", el("p", { class: "prose", text: "E-Quest là nơi bạn khám phá cách mình suy nghĩ, cảm nhận và phản ứng trước những tình huống quen thuộc trong cuộc sống sinh viên." })),
      section("▶", "Cách chơi", howTo),
      section("✦", "Một điều nhỏ cần nhớ", el("p", { class: "prose", text: "Không có lựa chọn nào định nghĩa hoàn toàn con người bạn. Đây không phải bài thi đúng hay sai, mà là cơ hội để hiểu mình hơn." })),
      note,
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
    note.append(el("p", { class: "prose", text: `Bạn đang làm dở: đã trả lời ${resumable}/${QUEST_LENGTH} tình huống.` }))
  }

  /* ------------------------------------------------------------- điều phối */
  function start({ fresh }) {
    const state = fresh ? null : loadQuest()
    order = state?.order ?? drawQuest()
    answers = state ? { ...state.answers } : {}
    startedAt = state?.startedAt ?? Date.now()
    const firstOpen = order.findIndex((id) => !answers[id])
    index = firstOpen >= 0 ? firstOpen : order.length - 1
    started = true
    finished = false
    persist()

    intro.remove()
    document.body.classList.add("is-questing")
    hud.style.display = ""
    stage.append(sceneHost)
    sound.open()
    sound.startMusic()
    showItem()
  }

  function showItem() {
    const item = current()
    if (!item) return
    runtime?.destroy()
    sceneHost.replaceChildren()
    updateHud()
    runtime = createSceneRuntime(sceneHost, toQuestScene(item, startedAt), {
      quick: true,
      topInset: () => hud.offsetHeight,
      onAnswer(choiceId) {
        answers[item.id] = choiceId
        persist()
        updateHud()
      },
      onDone: advance,
    })
    runtime.start()
    // Đẩy thanh đầu trang ra khỏi khung nhìn: HUD dính ở mép trên, cả màn hình dành cho cảnh và câu hỏi.
    // (đo khối bao ngoài: HUD dính nên vị trí của chính nó không phải vị trí trong trang)
    window.scrollTo({ top: hud.parentElement.getBoundingClientRect().top + window.scrollY, behavior: "auto" })
  }

  function updateHud() {
    const done = answeredCount()
    countEl.textContent = `Tình huống ${index + 1}/${order.length}`
    progressEl.textContent = `${done}/${order.length}`
    backBtn.disabled = index <= 0
    const width = `${((order.length ? done / order.length : 0) * 100).toFixed(2)}%`
    barFill.style.width = width
    barEdge.style.left = `calc(${width} - 5px)`
  }

  function goBack() {
    if (!started || index <= 0) return
    index -= 1
    persist()
    showItem()
  }

  function advance() {
    const nextOpen = order.findIndex((id, i) => i > index && !answers[id])
    const anyOpen = nextOpen >= 0 ? nextOpen : order.findIndex((id) => !answers[id])
    if (anyOpen >= 0) {
      index = anyOpen
      persist()
      showItem()
      return
    }
    finish()
  }

  function finish() {
    // Chốt một lần duy nhất cho mỗi lượt làm bài.
    if (!started || finished) return
    finished = true
    const attempt = finishQuest()
    if (!attempt) {
      clearQuest()
      return
    }
    reportStats(attempt)
    navigate("/result")
  }

  function reportStats(attempt) {
    const elapsed = Math.max(0, Math.round(((attempt.finishedAt || Date.now()) - (attempt.startedAt || Date.now())) / 1000))
    // Gửi ẩn danh các lựa chọn và thời gian làm bài cho thống kê (trang /admin); máy chủ tự chấm lại.
    // Không gửi tên, không có mã người dùng. order gửi kèm để máy chủ phá thế hoà đúng như trình duyệt.
    window
      .fetch?.("api/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ t: elapsed, order: attempt.order, answers: attempt.answers }),
        keepalive: true,
      })
      ?.catch(() => {})
  }

  return {
    destroy() {
      document.body.classList.remove("is-questing")
      runtime?.destroy()
      sound.stopMusic()
      mount.textContent = ""
    },
  }
}
