/* console.js — bảng hội thoại pixel (khung tối) chứa văn bản gõ chữ, lựa chọn và dấu nhắc.
   Không quyết định luồng: mọi chuyển trạng thái do questionScene điều khiển. */

import { el, frame } from "../core/dom.js"
import { TypewriterText } from "../core/typewriter.js"

export function createConsole({ page = "", onChar } = {}) {
  const pageEl = el("span", { class: "console__page", text: page })
  const top = el("div", { class: "console__top" }, pageEl)

  const textEl = el("p", { class: "console__text" })
  const live = el("p", { class: "sr-only", attrs: { "aria-live": "polite", "aria-atomic": "true" } })

  const hint = el("span", { class: "console__hint", text: "" })
  const arrow = el("span", { class: "cursor cursor--down blink", attrs: { "aria-hidden": "true" } })
  const cue = el("div", { class: "console__cue" }, hint, arrow)

  const inner = el("div", { class: "console__in" }, top, textEl, cue, live)
  const panel = frame(inner, {
    size: "lg",
    cls: "console",
    attrs: { role: "group", "aria-label": "Khung hội thoại câu hỏi" },
  })
  panel.dataset.cue = "off"
  panel.dataset.hint = "off"

  const typewriter = new TypewriterText(textEl, { onTick: onChar })

  function setPage(value) {
    pageEl.textContent = value
    pageEl.hidden = !value
  }

  function setHint(value) {
    const has = !!value
    hint.textContent = value || ""
    panel.dataset.hint = has ? "on" : "off"
  }

  function setCue(on) {
    panel.dataset.cue = on ? "on" : "off"
  }

  function announce(value) {
    live.textContent = value
  }

  /** Chèn một khối (ví dụ khe chứa danh sách lựa chọn) xuống dưới hàng dấu nhắc. */
  function mountSlot(node) {
    inner.insertBefore(node, live)
  }

  return {
    el: panel,
    textEl,
    topEl: top,
    cueEl: cue,
    typewriter,
    setPage,
    setHint,
    setCue,
    announce,
    mountSlot,
  }
}