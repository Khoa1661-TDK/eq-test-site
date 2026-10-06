/* sceneView.js — view cho route /scenes: "Một tuần ở nhóm dự án".
   Năm cảnh nối nhau, mỗi cảnh một quyết định. Sau mỗi quyết định: hậu quả diễn
   trên stage, rồi một khung phản hồi ngắn (người chơi tự bấm Tiếp tục).
   Cuối chuỗi: hồ sơ sáu kỹ năng (thanh đo, điểm mạnh, điểm cần luyện, mẹo
   luyện cho từng kỹ năng) và so sánh với lần chơi trước nếu có.
   Tái dùng console.js / choices.js / typewriter.js / sound.js qua sceneRuntime. */

import { el, frame } from "../core/dom.js"
import { soundToggle } from "../core/sound.js"
import { createSceneRuntime } from "../scene/sceneRuntime.js"
import { SCENE_SCENARIOS } from "../data/sceneScenarios.js"
import { scoreStory } from "../data/storySkills.js"
import { meterCells } from "../ui/meter.js"

const LAST_RUN_KEY = "eq_story_last_v1"

function loadLastRun() {
  try {
    const raw = localStorage.getItem(LAST_RUN_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    return parsed && typeof parsed === "object" ? parsed : null
  } catch {
    return null
  }
}

function saveRun(skills) {
  try {
    const pcts = Object.fromEntries(skills.map((s) => [s.key, s.pct]))
    localStorage.setItem(LAST_RUN_KEY, JSON.stringify({ at: new Date().toISOString(), pcts }))
  } catch {
    /* bộ nhớ trình duyệt bị chặn: vẫn hiện kết quả, chỉ không so sánh được lần sau */
  }
}

function button(text, { primary = false, onClick } = {}) {
  const b = el(
    "button",
    { class: primary ? "btn btn--primary" : "btn btn--ghost", attrs: { type: "button" } },
    el("span", { class: "pxf-in", text }),
  )
  if (onClick) b.addEventListener("click", onClick)
  return b
}

export function renderSceneView(mount, { navigate } = {}) {
  const total = SCENE_SCENARIOS.length
  const wrap = el("div", { class: "scene-view" })

  const hud = el("div", { class: "scene-hud" })
  const countEl = el("span", { class: "scene-hud__count", text: `Cảnh 1/${total}` })
  const bar = el("div", {
    class: "bar",
    attrs: { role: "progressbar", "aria-label": "Tiến độ các cảnh", "aria-valuemin": 0, "aria-valuemax": 100 },
  })
  const barFill = el("div", { class: "bar__fill" })
  const barEdge = el("div", { class: "bar__edge" })
  bar.append(barFill, barEdge)
  const back = el("button", { class: "btn btn--ghost", attrs: { type: "button" } }, el("span", { class: "pxf-in", text: "← Trang chủ" }))
  const snd = soundToggle()
  hud.append(countEl, bar, back, snd)

  const stageHost = el("div", { class: "scene-stage-host" })

  wrap.append(hud, stageHost)
  mount.append(wrap)

  back.addEventListener("click", () => navigate("/"))

  let idx = 0
  let runtime = null
  const answers = []

  function setProgress(done) {
    const p = (done / total) * 100
    barFill.style.width = `${p}%`
    bar.setAttribute("aria-valuenow", String(Math.round(p)))
  }

  function intro() {
    countEl.textContent = `${total} cảnh`
    setProgress(0)
    const card = el(
      "div",
      { class: "story-intro" },
      el("p", { class: "story-kicker", text: "Chế độ câu chuyện" }),
      el("h1", { class: "story-title", text: "Một tuần ở nhóm dự án" }),
      el("p", {
        class: "prose",
        text: `Bạn vừa vào một nhóm dự án mới. Trong ${total} ngày tới sẽ có ${total} tình huống khó. Mỗi tình huống, bạn chọn một cách phản ứng và xem điều gì xảy ra tiếp theo.`,
      }),
      el("p", {
        class: "prose",
        text: "Cuối tuần, bạn sẽ thấy mình đang mạnh và yếu ở đâu trong sáu kỹ năng cảm xúc, kèm một cách luyện cụ thể cho từng kỹ năng. Không có “kiểu người” nào ở đây cả: chỉ có kỹ năng, và kỹ năng thì luyện được.",
      }),
      el("p", { class: "story-actions" }, button("Bắt đầu thứ Hai", { primary: true, onClick: () => loadScenario(0) })),
    )
    stageHost.replaceChildren(frame(card, { size: "lg" }))
  }

  function loadScenario(i) {
    idx = i
    const scenario = SCENE_SCENARIOS[i]
    countEl.textContent = `Cảnh ${i + 1}/${total}`
    setProgress(i)
    if (runtime) runtime.destroy()
    stageHost.replaceChildren()

    runtime = createSceneRuntime(stageHost, scenario, {
      onAnswer(id) {
        answers[i] = id
      },
      onDone() {
        setProgress(i + 1)
        showFeedback()
      },
    })
    runtime.start()
  }

  function showFeedback() {
    const scenario = SCENE_SCENARIOS[idx]
    const choice = scenario.choices.find((c) => c.id === answers[idx])
    const last = idx + 1 >= total
    const next = button(last ? "Xem hồ sơ kỹ năng" : "Sang ngày tiếp theo →", {
      primary: true,
      onClick: () => (last ? finish() : loadScenario(idx + 1)),
    })
    const tip = el(
      "div",
      { class: "scene-tip" },
      frame(
        el(
          "div",
          { class: "scene-tip__in" },
          el("p", { class: "scene-tip__title", text: "Điều vừa xảy ra" }),
          el("p", { class: "scene-tip__body", text: choice ? choice.consequence : "" }),
          choice ? el("p", { class: "scene-tip__body scene-tip__dim", text: choice.strategy }) : null,
          scenario.practice ? el("p", { class: "scene-tip__title", text: "Nhìn lại" }) : null,
          scenario.practice ? el("p", { class: "scene-tip__body", text: scenario.practice.stronger }) : null,
          el("p", { class: "story-actions" }, next),
        ),
        { size: "sm", cls: "scene-tip__frame" },
      ),
    )
    stageHost.append(tip)
    tip.scrollIntoView({ block: "nearest", behavior: "smooth" })
    next.focus({ preventScroll: true })
  }

  function finish() {
    if (runtime) {
      runtime.destroy()
      runtime = null
    }
    countEl.textContent = "Hồ sơ kỹ năng"
    setProgress(total)

    const previous = loadLastRun()
    const { skills, strengths, weaknesses } = scoreStory(SCENE_SCENARIOS, answers)
    saveRun(skills)

    const rows = skills.map((s) => {
      const prev = previous?.pcts?.[s.key]
      const delta = Number.isFinite(prev) ? s.pct - prev : null
      return el(
        "li",
        { class: "story-skill" },
        el(
          "div",
          { class: "meter__head" },
          el("span", { class: "story-skill__name", text: s.name }),
          el(
            "span",
            { class: "meter__val" },
            String(s.pct),
            el("small", { text: "/100" }),
            delta ? el("small", { class: delta > 0 ? "story-delta is-up" : "story-delta is-down", text: `${delta > 0 ? "+" : ""}${delta}` }) : null,
          ),
        ),
        meterCells(s.pct, 100),
        el("p", { class: "story-skill__short", text: s.short }),
        el("p", { class: "story-skill__tip" }, el("strong", { text: "Luyện: " }), s.tip),
      )
    })

    const card = (title, list, kind) =>
      frame(
        el(
          "div",
          { class: `story-card story-card--${kind}` },
          el("h2", { class: "story-card__title", text: title }),
          list.length
            ? null
            : el("p", {
                class: "prose",
                text:
                  kind === "strong"
                    ? "Tuần này chưa có kỹ năng nào nổi bật hẳn. Bắt đầu với một kỹ năng ở cột bên cạnh là đủ."
                    : "Không có kỹ năng nào thấp rõ rệt trong tuần này. Thử chế độ Luyện EQ để giữ phong độ ở các tình huống khác.",
              }),
          ...list.map((s) =>
            el(
              "div",
              { class: "story-card__item" },
              el("p", { class: "story-card__name", text: `${s.name} · ${s.pct}/100` }),
              el("p", { class: "prose", text: kind === "strong" ? s.strong : s.weak }),
              kind === "weak" ? el("p", { class: "story-skill__tip" }, el("strong", { text: "Mẹo luyện: " }), s.tip) : null,
            ),
          ),
        ),
        { size: "lg" },
      )

    const result = el(
      "div",
      { class: "story-result" },
      el("p", { class: "story-kicker", text: "Hết tuần" }),
      el("h1", { class: "story-title", text: "Hồ sơ sáu kỹ năng cảm xúc của bạn" }),
      el("p", {
        class: "prose",
        text: previous
          ? "Điểm dựa trên năm quyết định bạn vừa chọn. Số nhỏ bên cạnh là thay đổi so với lần chơi trước."
          : "Điểm dựa trên năm quyết định bạn vừa chọn. Đây là ảnh chụp cách bạn phản ứng trong tuần này, không phải nhãn cố định: chơi lại sau khi luyện để xem mình tiến bộ ra sao.",
      }),
      el("div", { class: "story-cards" }, card("Điểm mạnh", strengths, "strong"), card("Nên luyện tiếp", weaknesses, "weak")),
      frame(el("div", { class: "story-skills-wrap" }, el("h2", { class: "story-card__title", text: "Sáu kỹ năng" }), el("ul", { class: "story-skills" }, rows)), {
        size: "lg",
      }),
      el(
        "p",
        { class: "story-actions" },
        button("Chơi lại tuần này", {
          primary: true,
          onClick: () => {
            answers.length = 0
            loadScenario(0)
          },
        }),
        button("Luyện thêm tình huống", { onClick: () => navigate("/practice") }),
        button("Trang chủ", { onClick: () => navigate("/") }),
      ),
      el("p", {
        class: "story-note",
        text: "Đây là công cụ học tập, không phải thang đo tâm lý đã được kiểm định.",
      }),
    )
    stageHost.replaceChildren(result)
    window.scrollTo({ top: 0, behavior: "auto" })
  }

  intro()

  return {
    destroy() {
      if (runtime) runtime.destroy()
      mount.replaceChildren()
    },
  }
}
