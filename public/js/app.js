/* app.js — bộ định tuyến nhỏ: điều phối các màn hình, không giữ trạng thái bài đánh giá.
   Kết quả EQ nằm trong sessionStorage (xem core/eqScoring.js), không nằm trên URL. */

import { el, frame, qs, qsa } from "./core/dom.js"
import { EQ_DIMENSIONS } from "./data/eqDimensions.js"
import { renderLanding } from "./views/landing.js"
import { renderAssessment } from "./views/assessment.js"
import { renderEqResult } from "./views/eqResult.js"
import { renderPractice } from "./views/practice.js"
import { renderSceneView } from "./views/sceneView.js"

const main = qs("#main")
const SKILLS = EQ_DIMENSIONS.map((dim) => dim.key)

const TITLES = {
  "/": "EQ Học đường — Luyện 6 kỹ năng cảm xúc, 20 tình huống mỗi lần",
  "/assessment": "Đánh giá EQ",
  "/result": "Hồ sơ EQ",
  "/practice": "Luyện EQ",
  "/scenes": "Cảnh tình huống EQ",
}

let view = null

function navigate(path) {
  const url = new URL(path, location.origin)
  if (url.pathname + url.search === location.pathname + location.search) return
  history.pushState({}, "", url)
  render()
  window.scrollTo({ top: 0, behavior: "auto" })
}

function route() {
  const url = new URL(location.href)
  const path = url.pathname.replace(/\/+$/, "") || "/"

  if (path === "/") {
    document.title = TITLES["/"]
    return renderLanding(main, { navigate })
  }

  if (path === "/assessment") {
    document.title = TITLES["/assessment"]
    return renderAssessment(main, { navigate })
  }

  if (path === "/result") {
    document.title = TITLES["/result"]
    return renderEqResult(main, { navigate })
  }

  if (path === "/practice") {
    const asked = url.searchParams.get("skill")
    const skill = asked === "random" || SKILLS.includes(asked) ? asked : null
    document.title = TITLES["/practice"]
    return renderPractice(main, { navigate, skill })
  }

  if (path === "/scenes") {
    document.title = TITLES["/scenes"]
    return renderSceneView(main, { navigate })
  }

  document.title = "Không có trang này — Đánh giá EQ"
  const back = el("a", { class: "btn btn--ghost", href: "/" }, el("span", { class: "pxf-in", text: "Về trang chủ" }))
  back.addEventListener("click", (event) => {
    event.preventDefault()
    navigate("/")
  })
  const notFound = el(
    "div",
    { class: "result" },
    el(
      "div",
      { class: "shell" },
      frame(
        el(
          "div",
          { style: { padding: "22px" } },
          el("h1", { class: "band__title", text: "404" }),
          el("p", { class: "prose", text: "Không có trang này. Có thể đường dẫn bị sai." }),
          el("p", { style: { marginTop: "18px" } }, back),
        ),
        { size: "lg" },
      ),
    ),
  )
  main.replaceChildren(notFound)
  return { destroy: () => main.replaceChildren() }
}

function render() {
  view?.destroy?.()
  main.replaceChildren()
  view = route()
  // đồng bộ trạng thái điều hướng
  const path = location.pathname.replace(/\/+$/, "") || "/"
  for (const link of qsa("[data-nav]")) {
    if (link.dataset.nav === path) link.setAttribute("aria-current", "page")
    else link.removeAttribute("aria-current")
  }
  main.setAttribute("tabindex", "-1")
  main.focus({ preventScroll: true })
}

window.addEventListener("popstate", () => {
  render()
  window.scrollTo({ top: 0, behavior: "auto" })
})

render()