/* sceneView.js — view cho route /scenes: "Một tuần ở lớp" — chế độ LUYỆN bằng cảnh động.
   Các cảnh nối nhau, mỗi cảnh một quyết định. Sau mỗi quyết định: hậu quả diễn trên
   stage, rồi một khung phản hồi (người chơi tự bấm Tiếp tục). Cuối tuần: nhìn lại từng
   cảnh, cách mạnh hơn, và kỹ năng mà mỗi cảnh luyện.

   Chỉ dùng cảnh của kho luyện (không trùng hai đề đánh giá), và chỉ ghi lượt luyện:
   điểm sáu kỹ năng đến từ bài đánh giá, nơi có cả tình huống chữ lẫn cảnh động.
   Tái dùng console.js / choices.js / typewriter.js / sound.js qua sceneRuntime. */

import { el, frame } from "../core/dom.js"
import { soundToggle } from "../core/sound.js"
import { createSceneRuntime } from "../scene/sceneRuntime.js"
import { EQ_BY_KEY } from "../data/eqDimensions.js"
import { ITEMS, ITEM_BY_ID, PRACTICE_IDS, hasResult, recordPractice, strongestChoice } from "../core/eqScoring.js"

function storyScenes() {
  const pool = PRACTICE_IDS.map((id) => ITEM_BY_ID[id]).filter((item) => item?.kind === "scene")
  return pool.length ? pool : ITEMS.filter((item) => item.kind === "scene")
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
  const scenes = storyScenes()
  const total = scenes.length
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
      el("p", { class: "story-kicker", text: "Luyện bằng cảnh động" }),
      el("h1", { class: "story-title", text: "Một tuần ở lớp" }),
      el("p", {
        class: "prose",
        text: `Tuần này có ${total} tình huống khó ở trường. Ở mỗi tình huống, bạn chọn một cách phản ứng rồi xem chuyện gì xảy ra tiếp theo: các nhân vật sẽ diễn lại hậu quả cho bạn xem.`,
      }),
      el("p", {
        class: "prose",
        text: "Sau mỗi cảnh, bạn sẽ thấy lựa chọn của mình dẫn tới đâu và đâu là cách mạnh hơn. Phần này chỉ để luyện: không chấm điểm, chỉ ghi lại bạn đã luyện kỹ năng nào để so sánh ở lần đánh giá sau.",
      }),
      el("p", { class: "story-actions" }, button("Bắt đầu", { primary: true, onClick: () => loadScenario(0) })),
    )
    stageHost.replaceChildren(frame(card, { size: "lg" }))
  }

  function loadScenario(i) {
    idx = i
    const scenario = scenes[i]
    countEl.textContent = `Cảnh ${i + 1}/${total}`
    setProgress(i)
    if (runtime) runtime.destroy()
    stageHost.replaceChildren()

    runtime = createSceneRuntime(stageHost, scenario, {
      onAnswer(id) {
        answers[i] = id
        recordPractice(scenario.id, id)
      },
      onDone() {
        setProgress(i + 1)
        showFeedback()
      },
    })
    runtime.start()
  }

  function showFeedback() {
    const scenario = scenes[idx]
    const choice = scenario.choices.find((c) => c.id === answers[idx])
    const best = strongestChoice(scenario)
    const last = idx + 1 >= total
    const next = button(last ? "Nhìn lại cả tuần" : "Sang cảnh tiếp theo →", {
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
          el("p", { class: "scene-tip__title", text: choice?.id === best.id ? "Bạn đã chọn cách mạnh nhất" : "Nhìn lại" }),
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
    countEl.textContent = "Nhìn lại cả tuần"
    setProgress(total)

    let strongest = 0
    const rows = scenes.map((scene, i) => {
      const choice = scene.choices.find((c) => c.id === answers[i])
      const best = strongestChoice(scene)
      const nailed = choice?.id === best.id
      if (nailed) strongest += 1
      const skill = EQ_BY_KEY[scene.domain]
      return el(
        "li",
        { class: "story-skill" },
        el(
          "div",
          { class: "meter__head" },
          el("span", { class: "story-skill__name", text: scene.title }),
          el("span", { class: nailed ? "story-delta is-up" : "story-delta", text: nailed ? "cách mạnh nhất" : "còn cách mạnh hơn" }),
        ),
        el("p", { class: "story-skill__short", text: `Luyện: ${skill?.name ?? scene.domain}` }),
        choice ? el("p", { class: "story-skill__short" }, el("strong", { text: "Bạn chọn: " }), choice.text) : null,
        nailed ? null : el("p", { class: "story-skill__tip" }, el("strong", { text: "Cách mạnh hơn: " }), best.text),
        scene.practice?.principle ? el("p", { class: "story-skill__tip" }, el("strong", { text: "Nhớ: " }), scene.practice.principle) : null,
      )
    })

    const result = el(
      "div",
      { class: "story-result" },
      el("p", { class: "story-kicker", text: "Hết tuần" }),
      el("h1", { class: "story-title", text: `Bạn chọn cách mạnh nhất ở ${strongest}/${total} cảnh` }),
      el("p", {
        class: "prose",
        text: "Phần này chỉ để luyện nên không có điểm. Muốn biết sáu kỹ năng của mình đang ở đâu và tiến bộ tới đâu, hãy làm bài đánh giá, trong đó cũng có cảnh động.",
      }),
      frame(el("div", { class: "story-skills-wrap" }, el("h2", { class: "story-card__title", text: "Từng cảnh" }), el("ul", { class: "story-skills" }, rows)), { size: "lg" }),
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
        button(hasResult() ? "Đánh giá lại" : "Làm bài đánh giá", { onClick: () => navigate("/assessment") }),
        button("Luyện thêm tình huống", { onClick: () => navigate("/practice") }),
      ),
      el("p", { class: "story-note", text: "Đây là công cụ học tập, không phải thang đo tâm lý đã được kiểm định." }),
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
