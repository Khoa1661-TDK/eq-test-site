/* practice.js — chế độ LUYỆN TẬP: chơi lại các tình huống theo từng kỹ năng.
   Khác với chế độ đánh giá: sau mỗi lựa chọn, người học được giải thích ngay
   (chiến lược mình vừa dùng, hệ quả thường thấy, cách mạnh hơn, nguyên tắc ghi nhớ).
   Việc chấm điểm EQ không xuất hiện ở đây — chỉ có phản hồi học tập. */

import { el, frame } from "../core/dom.js"
import { sound, soundToggle } from "../core/sound.js"
import { createQuestionScene } from "../scene/questionScene.js"
import { EQ_DIMENSIONS, EQ_BY_KEY } from "../data/eqDimensions.js"
import { SCENARIOS, SCENARIOS_BY_DOMAIN } from "../data/scenarios.js"
import { loadPractice, savePractice } from "../core/eqScoring.js"
import { skillCard } from "../ui/parts.js"

export function renderPractice(mount, { navigate, skill = null }) {
  const store = loadPractice()
  const practised = { ...store.answers }

  /* --------------------------------------------------- chọn kỹ năng */
  if (!skill) {
    const view = el("div", { class: "result practice-index" })
    const done = Object.keys(practised).length
    view.append(
      el(
        "section",
        { class: "band band--soft result__block" },
        el("h1", { class: "band__title", text: "Luyện EQ" }),
        el("p", { class: "band__lead", text: "Chọn một kỹ năng, hoặc để hệ thống đưa bạn đi qua các tình huống ngẫu nhiên." }),
        el("p", { class: "prose", text: "Ở đây không có điểm và không có xếp hạng. Sau mỗi lựa chọn, bạn sẽ thấy mình vừa dùng chiến lược gì, hệ quả thường thấy của nó, cách mạnh hơn, và một câu để nhớ." }),
        el("p", { class: "prose muted", text: `Bạn đã luyện ${done}/${SCENARIOS.length} tình huống trong phiên làm việc này.` }),
      ),
    )

    const randomBtn = el(
      "a",
      { class: "btn btn--accent btn--lg", href: "/practice?skill=random" },
      el("span", { class: "pxf-in", text: "Tình huống ngẫu nhiên" }),
    )
    randomBtn.addEventListener("click", (event) => {
      event.preventDefault()
      navigate("/practice?skill=random")
    })

    const grid = el("div", { class: "skills" })
    for (const dim of EQ_DIMENSIONS) {
      const total = SCENARIOS_BY_DOMAIN[dim.key]?.length ?? 0
      const taken = (SCENARIOS_BY_DOMAIN[dim.key] ?? []).filter((scenario) => practised[scenario.id]).length
      const card = skillCard(dim, { practised: taken, total, href: `/practice?skill=${dim.key}` })
      card.addEventListener("click", (event) => {
        event.preventDefault()
        navigate(`/practice?skill=${dim.key}`)
      })
      grid.append(card)
    }

    const band = el("section", { class: "band result__block" })
    band.append(el("h2", { class: "band__title", text: "Năm kỹ năng" }), grid)
    view.append(
      el("section", { class: "result__block practice-index__cta" }, frame(el("div", {}, el("p", { class: "prose", text: "Không biết bắt đầu từ đâu?" }), randomBtn), { size: "lg", cls: "practice-intro", innerCls: "practice-intro__in" })),
      band,
      el(
        "section",
        { class: "actions" },
        el("a", { class: "btn btn--ghost", href: "/assessment" }, el("span", { class: "pxf-in", text: "Làm bài đánh giá EQ" })),
        el("a", { class: "btn btn--ghost", href: "/" }, el("span", { class: "pxf-in", text: "Về trang chủ" })),
      ),
    )
    view.querySelectorAll(".actions a").forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault()
        navigate(link.getAttribute("href"))
      })
    })

    mount.append(view)
    document.title = "Luyện EQ"
    return { destroy: () => mount.replaceChildren() }
  }

  /* ------------------------------------------------------ phiên luyện tập */
  const isRandom = skill === "random"
  const dim = isRandom ? null : EQ_BY_KEY[skill]
  const queue = isRandom ? shuffle(SCENARIOS) : (SCENARIOS_BY_DOMAIN[skill] ?? [])
  let cursor = 0
  let answered = null

  const label = isRandom ? "Tình huống ngẫu nhiên" : `Luyện: ${dim?.name ?? ""}`

  const countEl = el("span", { class: "hud__count", text: "" })
  const progressEl = el("span", { class: "hud__progress", text: "" })

  const backBtn = el("button", { class: "btn btn--ghost", attrs: { type: "button" } })
  backBtn.append(el("span", { class: "pxf-in", text: "← Đổi kỹ năng" }))
  backBtn.addEventListener("click", () => navigate("/practice"))

  const barFill = el("div", { class: "bar__fill" })
  const barEdge = el("div", { class: "bar__edge" })
  const bar = el("div", { class: "bar" }, barFill, barEdge)

  const hud = el(
    "div",
    { class: "hud" },
    el("div", { class: "hud__row" }, el("span", { class: "hud__tag", text: label }), countEl, el("span", { class: "hud__spacer" }), progressEl),
    el("div", { class: "hud__bar" }, bar),
    el("div", { class: "hud__actions" }, backBtn, soundToggle()),
  )

  const stage = el("div", { class: "stage" })
  mount.append(el("div", { class: "quiz-wrap" }, hud, stage))

  const scene = createQuestionScene({ onAnswer: handleAnswer, onAdvance: handleAdvance })
  stage.append(scene.el)

  /* ------------------------------------------------------------- điều phối */
  const current = () => queue[cursor] ?? null
  const practisedCount = () => queue.filter((scenario) => practised[scenario.id]).length

  function updateHud() {
    countEl.textContent = `Tình huống ${cursor + 1}/${queue.length}`
    const done = practisedCount()
    progressEl.textContent = `${done}/${queue.length} đã luyện`
    const pct = queue.length ? done / queue.length : 0
    const width = `${(pct * 100).toFixed(2)}%`
    barFill.style.width = width
    barEdge.style.left = `calc(${width} - 5px)`
  }

  function showCurrent() {
    const scenario = current()
    if (!scenario) return
    answered = null
    updateHud()
    scene.show(scenario, { dir: "next" })
  }

  /** Lưu lựa chọn ngay (chống trùng theo mã tình huống), rồi dựng phản hồi học tập. */
  function handleAnswer(scenario, choice) {
    answered = choice
    practised[scenario.id] = choice.id
    savePractice(practised)
    updateHud()
  }

  /** Sau hoạt ảnh xác nhận: không rời sân khấu, mà nối các nhịp phản hồi vào chính khung thoại. */
  function handleAdvance(scenario, choice) {
    const last = cursor >= queue.length - 1
    scene.pushBeats(
      [
        `Bạn chọn: “${choice.text}”`,
        `${choice.strategy}. ${choice.consequence}`,
        `Tín hiệu quan trọng: ${scenario.practice.signal}`,
        `Cách mạnh hơn: ${scenario.practice.stronger} — Nhớ: ${scenario.practice.principle}`,
      ],
      {
        page: "PHẢN HỒI",
        endHint: last ? (isRandom ? "Nhấn để quay lại danh sách kỹ năng" : "Nhấn để xem lại danh sách kỹ năng") : "Nhấn để sang tình huống tiếp theo",
        onEnd: () => advanceToNext(last),
      },
    )
  }

  async function advanceToNext(last) {
    if (last) {
      navigate("/practice")
      return
    }
    await scene.leave()
    cursor += 1
    showCurrent()
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "auto" })
  }

  sound.open()
  showCurrent()
  if (isRandom) {
    document.title = "Luyện EQ — tình huống ngẫu nhiên"
  } else {
    document.title = `Luyện EQ — ${dim.name}`
  }

  return {
    destroy() {
      scene.destroy()
      mount.textContent = ""
    },
  }
}

function shuffle(list) {
  const out = list.slice()
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const swap = out[i]
    out[i] = out[j]
    out[j] = swap
  }
  return out
}