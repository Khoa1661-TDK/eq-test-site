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

/* Trang có thể nằm dưới một thư mục con (vd. GitHub Pages: /eq-test-site/). Mọi đường dẫn
   trong app vẫn viết như ở gốc ("/practice"); BASE chỉ được thêm vào URL thật của trình duyệt. */
const BASE = new URL(document.baseURI).pathname.replace(/\/+$/, "")
const appPath = (pathname) => (BASE && pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname).replace(/\/+$/, "") || "/"

/** Thêm BASE vào mọi liên kết nội bộ, giữ đường dẫn gốc trong data-app-href. */
function fixLinks(root = document) {
  for (const a of root.querySelectorAll('a[href^="/"]:not([data-app-href])')) {
    const href = a.getAttribute("href")
    a.dataset.appHref = href
    a.setAttribute("href", BASE + href)
  }
}
const SKILLS = EQ_DIMENSIONS.map((dim) => dim.key)

const TITLES = {
  "/": "MoodQuest — Luyện 6 kỹ năng cảm xúc qua từng tình huống",
  "/assessment": "Đánh giá EQ",
  "/result": "Hồ sơ EQ",
  "/practice": "Luyện EQ",
  "/scenes": "Cảnh tình huống EQ",
}

let view = null

function navigate(path) {
  const target = new URL(path, location.origin)
  const url = new URL(BASE + appPath(target.pathname) + target.search, location.origin)
  if (url.pathname + url.search === location.pathname + location.search) return
  history.pushState({}, "", url)
  render()
  window.scrollTo({ top: 0, behavior: "auto" })
}

function route() {
  const url = new URL(location.href)
  const path = appPath(url.pathname)

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
  fixLinks()
  // đồng bộ trạng thái điều hướng
  const path = appPath(location.pathname)
  for (const link of qsa("[data-nav]")) {
    if (link.dataset.nav === path) link.setAttribute("aria-current", "page")
    else link.removeAttribute("aria-current")
  }
  main.setAttribute("tabindex", "-1")
  main.focus({ preventScroll: true })
}

// Liên kết tạo sau (phản hồi luyện tập, kết quả…) cũng được thêm BASE.
new MutationObserver(() => fixLinks(main)).observe(main, { childList: true, subtree: true })

// Bấm liên kết nội bộ: đi trong app thay vì tải lại trang (màn hình nào đã tự xử lý thì bỏ qua).
document.addEventListener("click", (event) => {
  const link = event.target.closest?.("a[data-app-href]")
  if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  event.preventDefault()
  navigate(link.dataset.appHref)
})

window.addEventListener("popstate", () => {
  render()
  window.scrollTo({ top: 0, behavior: "auto" })
})

render()