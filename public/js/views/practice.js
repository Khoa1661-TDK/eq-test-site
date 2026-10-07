/* practice.js — chế độ LUYỆN TẬP: chơi các tình huống của kho luyện theo từng kỹ năng.
   Khác với chế độ đánh giá: sau mỗi lựa chọn, người học được giải thích ngay
   (chiến lược mình vừa dùng, hệ quả thường thấy, cách mạnh hơn, nguyên tắc ghi nhớ).
   Kho luyện tách khỏi hai đề đánh giá, và luyện tập không bao giờ đổi điểm đánh giá:
   nó chỉ ghi lại số lượt luyện để trang kết quả cho thấy bạn đã luyện gì giữa hai lần đánh giá. */

import { el, frame } from "../core/dom.js"
import { sound, soundToggle } from "../core/sound.js"
import { createQuestionScene } from "../scene/questionScene.js"
import { createSceneRuntime } from "../scene/sceneRuntime.js"
import { isStaged, toScene } from "../scene/staged.js"
import { EQ_DIMENSIONS, EQ_BY_KEY } from "../data/eqDimensions.js"
import {
  ITEM_BY_ID,
  PRACTICE_IDS,
  latestAttempt,
  loadPractice,
  practiceQueue,
  recordPractice,
  scoreAttempt,
  shuffleIds,
} from "../core/eqScoring.js"
import { skillCard } from "../ui/parts.js"

const textPool = () => PRACTICE_IDS.map((id) => ITEM_BY_ID[id]).filter((item) => item && item.kind === "text")

export function renderPractice(mount, { navigate, skill = null }) {
  const practised = { ...loadPractice().answers }
  const latest = scoreAttempt(latestAttempt())
  const growthKeys = latest ? latest.growth.map((d) => d.key) : []
  const patternKeys = latest ? latest.patterns.filter((p) => !p.effective).map((p) => p.key) : []

  const go = (href) => (event) => {
    event.preventDefault()
    navigate(href)
  }

  /* --------------------------------------------------- chọn kỹ năng */
  if (!skill) {
    const pool = textPool()
    const view = el("div", { class: "result practice-index" })
    const done = pool.filter((item) => practised[item.id]).length
    view.append(
      el(
        "section",
        { class: "band band--soft result__block" },
        el("h1", { class: "band__title", text: "Luyện EQ" }),
        el("p", { class: "band__lead", text: "Chọn một kỹ năng, hoặc làm lần lượt các tình huống ngẫu nhiên." }),
        el("p", { class: "prose", text: "Ở đây không có điểm hay xếp hạng. Sau mỗi lựa chọn, bạn sẽ thấy cách mình vừa chọn, điều thường xảy ra sau đó, một cách mạnh hơn, và một câu để nhớ." }),
        growthKeys.length
          ? el("p", { class: "prose" }, el("strong", { text: "Gợi ý từ lần đánh giá gần nhất: " }), growthKeys.map((k) => EQ_BY_KEY[k].name.toLowerCase()).join(" và "), ".")
          : null,
        el("p", { class: "prose muted", text: `Bạn đã luyện ${done}/${pool.length} tình huống trên máy này.` }),
      ),
    )

    const randomBtn = el("a", { class: "btn btn--accent btn--lg", href: "/practice?skill=random" }, el("span", { class: "pxf-in", text: "Tình huống ngẫu nhiên" }))
    randomBtn.addEventListener("click", go("/practice?skill=random"))
    const scenesBtn = el("a", { class: "btn btn--ghost btn--lg", href: "/scenes" }, el("span", { class: "pxf-in", text: "Luyện bằng cảnh động" }))
    scenesBtn.addEventListener("click", go("/scenes"))

    const grid = el("div", { class: "skills" })
    const ordered = [...EQ_DIMENSIONS].sort((a, b) => Number(growthKeys.includes(b.key)) - Number(growthKeys.includes(a.key)))
    for (const dim of ordered) {
      const items = pool.filter((item) => item.domain === dim.key)
      const taken = items.filter((item) => practised[item.id]).length
      const card = skillCard(dim, { practised: taken, total: items.length, href: `/practice?skill=${dim.key}` })
      if (growthKeys.includes(dim.key)) card.classList.add("skill--focus")
      card.addEventListener("click", go(`/practice?skill=${dim.key}`))
      grid.append(card)
    }

    const band = el("section", { class: "band result__block" })
    band.append(el("h2", { class: "band__title", text: "Sáu kỹ năng" }), grid)
    view.append(
      el(
        "section",
        { class: "result__block practice-index__cta" },
        frame(el("div", {}, el("p", { class: "prose", text: "Không biết bắt đầu từ đâu?" }), randomBtn, scenesBtn), { size: "lg", cls: "practice-intro", innerCls: "practice-intro__in" }),
      ),
      band,
      el(
        "section",
        { class: "actions" },
        el("a", { class: "btn btn--ghost", href: "/assessment" }, el("span", { class: "pxf-in", text: latest ? "Đánh giá lại" : "Làm bài đánh giá EQ" })),
        el("a", { class: "btn btn--ghost", href: "/" }, el("span", { class: "pxf-in", text: "Về trang chủ" })),
      ),
    )
    view.querySelectorAll(".actions a").forEach((link) => link.addEventListener("click", go(link.getAttribute("href"))))

    mount.append(view)
    document.title = "Luyện EQ"
    return { destroy: () => mount.replaceChildren() }
  }

  /* ------------------------------------------------------ phiên luyện tập */
  const isRandom = skill === "random"
  const dim = isRandom ? null : EQ_BY_KEY[skill]
  const queue = isRandom
    ? shuffleIds(textPool().map((item) => item.id)).map((id) => ITEM_BY_ID[id])
    : practiceQueue(skill, { patterns: patternKeys }).filter((item) => item.kind === "text")
  let cursor = 0

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
  const sceneHost = el("div", { class: "scene-stage-host assess-scene" })
  let runtime = null

  /* ------------------------------------------------------------- điều phối */
  const current = () => queue[cursor] ?? null
  const practisedCount = () => queue.filter((item) => practised[item.id]).length

  function updateHud() {
    countEl.textContent = queue.length ? `Tình huống ${cursor + 1}/${queue.length}` : ""
    const done = practisedCount()
    progressEl.textContent = `${done}/${queue.length} đã luyện`
    const pct = queue.length ? done / queue.length : 0
    const width = `${(pct * 100).toFixed(2)}%`
    barFill.style.width = width
    barEdge.style.left = `calc(${width} - 5px)`
  }

  function stopRuntime() {
    runtime?.destroy()
    runtime = null
    sceneHost.replaceChildren()
  }

  /** Tình huống có dàn dựng thì diễn như cảnh động; còn lại dùng khung thoại chữ. */
  function showCurrent() {
    const item = current()
    if (!item) return
    updateHud()
    if (isStaged(item)) {
      scene.el.remove()
      stopRuntime()
      if (!sceneHost.isConnected) stage.append(sceneHost)
      let picked = null
      runtime = createSceneRuntime(sceneHost, toScene(item), {
        onAnswer(choiceId) {
          picked = item.choices.find((c) => c.id === choiceId) ?? null
          if (picked) handleAnswer(item, picked)
        },
        onDone() {
          if (picked) showFeedback(item, picked)
        },
      })
      runtime.start()
      return
    }
    stopRuntime()
    sceneHost.remove()
    if (!scene.el.isConnected) stage.append(scene.el)
    scene.show(item, { dir: "next" })
  }

  /** Ghi lượt luyện ngay, rồi dựng phản hồi học tập. */
  function handleAnswer(item, choice) {
    practised[item.id] = choice.id
    recordPractice(item.id, choice.id)
    updateHud()
  }

  /** Phản hồi sau một cảnh động: điều vừa xảy ra, tín hiệu, cách mạnh hơn, câu để nhớ. */
  function showFeedback(item, choice) {
    const last = cursor >= queue.length - 1
    const next = el("button", { class: "btn btn--primary", attrs: { type: "button" } }, el("span", { class: "pxf-in", text: last ? "Về danh sách kỹ năng" : "Tình huống tiếp theo →" }))
    next.addEventListener("click", () => advanceToNext(last))
    const tip = el(
      "div",
      { class: "scene-tip" },
      frame(
        el(
          "div",
          { class: "scene-tip__in" },
          el("p", { class: "scene-tip__title", text: "Điều vừa xảy ra" }),
          el("p", { class: "scene-tip__body", text: `${choice.strategy}. ${choice.consequence}` }),
          el("p", { class: "scene-tip__title", text: "Tín hiệu quan trọng" }),
          el("p", { class: "scene-tip__body", text: item.practice.signal }),
          el("p", { class: "scene-tip__title", text: "Cách mạnh hơn" }),
          el("p", { class: "scene-tip__body", text: item.practice.stronger }),
          el("p", { class: "scene-tip__body scene-tip__dim", text: `Nhớ: ${item.practice.principle}` }),
          el("p", { class: "story-actions" }, next),
        ),
        { size: "sm", cls: "scene-tip__frame" },
      ),
    )
    sceneHost.append(tip)
    tip.scrollIntoView({ block: "nearest", behavior: "smooth" })
    next.focus({ preventScroll: true })
  }

  /** Sau hoạt ảnh xác nhận: không rời sân khấu, mà nối các nhịp phản hồi vào chính khung thoại. */
  function handleAdvance(item, choice) {
    const last = cursor >= queue.length - 1
    scene.pushBeats(
      [
        `Bạn chọn: “${choice.text}”`,
        `${choice.strategy}. ${choice.consequence}`,
        `Tín hiệu quan trọng: ${item.practice.signal}`,
        `Cách mạnh hơn: ${item.practice.stronger} — Nhớ: ${item.practice.principle}`,
      ],
      {
        page: "PHẢN HỒI",
        endHint: last ? "Nhấn để quay lại danh sách kỹ năng" : "Nhấn để sang tình huống tiếp theo",
        onEnd: () => advanceToNext(last),
      },
    )
  }

  async function advanceToNext(last) {
    if (last) {
      navigate("/practice")
      return
    }
    if (!runtime && scene.el.isConnected) await scene.leave()
    cursor += 1
    showCurrent()
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "auto" })
  }

  if (!queue.length) {
    stage.replaceChildren(
      frame(
        el("div", { class: "quiz-intro__in" }, el("p", { class: "prose", text: "Chưa có tình huống luyện cho kỹ năng này." }), backBtn),
        { size: "lg", cls: "quiz-intro" },
      ),
    )
  } else {
    sound.open()
    showCurrent()
  }
  document.title = isRandom ? "Luyện EQ — tình huống ngẫu nhiên" : `Luyện EQ — ${dim?.name ?? ""}`

  return {
    destroy() {
      stopRuntime()
      scene.destroy()
      mount.textContent = ""
    },
  }
}
