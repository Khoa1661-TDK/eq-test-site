/* sceneView.js — view cho route /scenes: chạy các "cảnh tình huống EQ".
   Bản vertical slice: một scenario hoàn chỉnh (môi trường, 4 nhân vật, idle,
   hội thoại, quyết định, hậu quả, chuyển sang câu tiếp theo / kết thúc).
   Tái dùng console.js / choices.js / typewriter.js / sound.js — không tự vẽ
   lại UI hội thoại. */

import { el, frame } from "../core/dom.js"
import { TIMING } from "../core/motion.js"
import { soundToggle } from "../core/sound.js"
import { createSceneRuntime } from "../scene/sceneRuntime.js"
import { SCENE_SCENARIOS } from "../data/sceneScenarios.js"

export function renderSceneView(mount, { navigate } = {}) {
  const wrap = el("div", { class: "scene-view" })

  const hud = el("div", { class: "scene-hud" })
  const countEl = el("span", { class: "scene-hud__count", text: `Cảnh 1/${SCENE_SCENARIOS.length}` })
  const bar = el("div", { class: "bar", attrs: { role: "progressbar", "aria-label": "Tiến độ các cảnh" } })
  const barFill = el("div", { class: "bar__fill" })
  const barEdge = el("div", { class: "bar__edge" })
  bar.append(barFill, barEdge)
  const back = el("button", { class: "btn btn--ghost", text: "← Trang chủ", attrs: { type: "button" } })
  const snd = soundToggle()
  hud.append(countEl, bar, back, snd)

  const stageHost = el("div", { class: "scene-stage-host" })

  wrap.append(hud, stageHost)
  mount.append(wrap)

  back.addEventListener("click", () => navigate("/"))

  let idx = 0
  let runtime = null
  const answers = []

  function setProgress() {
    const p = ((idx + 1) / SCENE_SCENARIOS.length) * 100
    barFill.style.width = `${p}%`
    bar.setAttribute("aria-valuenow", String(Math.round(p)))
  }

  function loadScenario(i) {
    idx = i
    const scenario = SCENE_SCENARIOS[i]
    countEl.textContent = `Cảnh ${i + 1}/${SCENE_SCENARIOS.length}`
    setProgress()
    if (runtime) runtime.destroy()

    runtime = createSceneRuntime(stageHost, scenario, {
      onAnswer(id) { answers[i] = id },
      onDone() {
        // Kết thúc cảnh → phản hồi học tập ngắn → chuyển cảnh / kết thúc.
        if (i + 1 < SCENE_SCENARIOS.length) {
          afterFeedback(() => loadScenario(i + 1))
        } else {
          finish()
        }
      },
    })
    runtime.start()
  }

  let feedbackTimer = 0
  function afterFeedback(next) {
    const scenario = SCENE_SCENARIOS[idx]
    const chosen = answers[idx]
    const choice = scenario.choices.find((c) => c.id === chosen)
    const tip = el("div", { class: "scene-tip" })
    tip.append(
      frame(
        el("div", { class: "scene-tip__in" },
          el("p", { class: "scene-tip__title", text: "Bạn vừa chọn" }),
          el("p", { class: "scene-tip__body", text: choice ? choice.consequence : "" }),
          el("p", { class: "scene-tip__body", text: scenario.practice ? scenario.practice.stronger : "" }),
        ),
        { size: "sm", cls: "scene-tip__frame" },
      ),
    )
    stageHost.append(tip)
    feedbackTimer = setTimeout(() => {
      tip.remove()
      next()
    }, TIMING.nextQuestion + 900)
  }

  function finish() {
    if (runtime) { runtime.destroy(); runtime = null }
    const done = el("div", { class: "scene-done" })
    done.append(
      el("h2", { class: "scene-done__title", text: "Bạn đã đi qua các tình huống." }),
      el("p", { class: "scene-done__sub", text: "Đây là bản cắt dọc (vertical slice) — hệ thống cảnh đang được mở rộng." }),
    )
    const again = el("button", { class: "btn", text: "Chơi lại", attrs: { type: "button" } })
    const home = el("button", { class: "btn btn--ghost", text: "Trang chủ", attrs: { type: "button" } })
    again.addEventListener("click", () => {
      answers.length = 0
      loadScenario(0)
    })
    home.addEventListener("click", () => navigate("/"))
    done.append(again, home)
    stageHost.replaceChildren(done)
  }

  loadScenario(0)

  return {
    destroy() {
      clearTimeout(feedbackTimer)
      if (runtime) runtime.destroy()
      mount.replaceChildren()
    },
  }
}
