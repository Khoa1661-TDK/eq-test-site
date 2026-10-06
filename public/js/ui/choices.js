/* choices.js — danh sách lựa chọn kiểu game pixel.
   - Nút thật (<button>) để bàn phím và trình đọc màn hình dùng được.
   - tabindex kiểu "roving": mục đang trỏ tới nhận tabindex 0, còn lại -1.
   - Không phụ thuộc hover: mục đang trỏ tới luôn nhìn thấy rõ.
   Giao diện: { el, build, reveal, setActive, confirm, lock, clear, move, selectActive, get activeOption } */

import { el } from "../core/dom.js"
import { TIMING, prefersReducedMotion } from "../core/motion.js"

export function createChoiceList({ onSelect, onMove } = {}) {
  const list = el("div", { class: "choices", attrs: { role: "group", "aria-label": "Các phương án trả lời" } })
  let items = []
  let active = -1
  let locked = true

  function setActive(index, { focus = false, silent = false } = {}) {
    if (!items.length) return
    const next = ((index % items.length) + items.length) % items.length
    if (next === active) {
      if (focus) items[next].node.focus({ preventScroll: true })
      return
    }
    active = next
    items.forEach((item, i) => {
      item.node.classList.toggle("is-active", i === active)
      item.node.tabIndex = i === active ? 0 : -1
    })
    if (focus) items[active].node.focus({ preventScroll: true })
    if (!silent) onMove?.(items[active].option)
  }

  /** Dựng danh sách cho một câu hỏi. answerId: đáp án đã lưu (nếu quay lại câu cũ). */
  function build(options, { answerId = null } = {}) {
    list.textContent = ""
    list.classList.remove("is-locked", "is-open")
    locked = true
    items = options.map((option, index) => {
      const cursor = el("span", { class: "choice__cursor", text: ">", attrs: { "aria-hidden": "true" } })
      const code = el("span", { class: "choice__code", text: option.code, attrs: { "aria-hidden": "true" } })
      const text = el("span", { class: "choice__text", text: option.text })
      const node = el(
        "button",
        {
          class: "choice",
          dataset: { choice: option.id, value: option.value == null ? "" : String(option.value) },
          attrs: { type: "button", tabindex: "-1" },
        },
        cursor,
        code,
        text,
      )
      node.addEventListener("click", () => {
        if (locked) return
        setActive(index, { silent: true })
        onSelect?.(option)
      })
      node.addEventListener("mouseenter", () => {
        if (locked) return
        // rê chuột thì đổi mục đang trỏ nhưng KHÔNG kêu, tránh tiếng động liên tục
        setActive(index, { focus: false, silent: true })
      })
      node.addEventListener("focus", () => {
        if (locked) return
        setActive(index, { focus: false })
      })
      list.append(node)
      return { option, node, index }
    })

    const found = options.findIndex((option) => option.id === answerId)
    active = -1
    setActive(found >= 0 ? found : 0, { silent: true })
    return items
  }

  /** Cho danh sách hiện ra (bố cục đã được chừa chỗ từ trước nên khung không giật). */
  function open() {
    list.classList.add("is-open")
  }

  function reveal() {
    const step = TIMING.choiceStagger
    items.forEach((item, index) => {
      if (prefersReducedMotion() || !step) {
        item.node.classList.add("is-in")
        return
      }
      window.setTimeout(() => item.node.classList.add("is-in"), 20 + index * step)
    })
  }

  function confirm(optionId) {
    lock(true)
    for (const item of items) {
      const chosen = item.option.id === optionId
      item.node.classList.toggle("is-confirmed", chosen)
      if (chosen) item.node.setAttribute("aria-pressed", "true")
      else item.node.setAttribute("aria-disabled", "true")
    }
  }

  function lock(on) {
    locked = !!on
    list.classList.toggle("is-locked", locked)
  }

  function clear() {
    list.textContent = ""
    list.classList.remove("is-open")
    items = []
    active = -1
    locked = true
  }

  return {
    el: list,
    build,
    open,
    reveal,
    setActive,
    confirm,
    lock,
    clear,
    get locked() {
      return locked
    },
    get activeIndex() {
      return active
    },
    get activeOption() {
      return items[active]?.option ?? null
    },
    get count() {
      return items.length
    },
    move(delta, opts = {}) {
      if (!items.length) return
      setActive(active + delta, opts)
    },
    selectActive() {
      if (locked || !items.length || active < 0) return
      onSelect?.(items[active].option)
    },
    focusActive() {
      if (!items.length || active < 0) return
      items[active].node.focus({ preventScroll: true })
    },
  }
}