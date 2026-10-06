/* typewriter.js — hiệu ứng gõ chữ theo nhịp thời gian thực (không dùng setTimeout từng ký tự).
   - Đo trước chiều cao văn bản đầy đủ để khung không nhảy khi chữ hiện dần.
   - Dừng lâu hơn một chút sau dấu câu, nhưng không gây sốt ruột.
   - Tôn trọng prefers-reduced-motion: hiện toàn bộ ngay lập tức. */

import { prefersReducedMotion } from "./motion.js"

const SOFT_PAUSE = new Set([",", ";", ":", "—", "–"])
const HARD_PAUSE = new Set([".", "!", "?", "…"])
const SOFT_MS = 62
const HARD_MS = 138
const DEFAULT_MS_PER_CHAR = 26

export class TypewriterText {
  constructor(el, { onTick, onDone } = {}) {
    this.el = el
    this.onTick = onTick
    this.onDone = onDone
    this.text = ""
    this.index = 0
    this._raf = 0
    this._acc = 0
    this._last = 0
    this._hold = 0
    this._ms = DEFAULT_MS_PER_CHAR
    this._active = false
    this._finished = false
  }

  get typing() {
    return this._active && !this._finished
  }

  /** Bắt đầu gõ một đoạn mới. */
  type(text, { msPerChar = DEFAULT_MS_PER_CHAR } = {}) {
    this.cancel()
    this.text = text
    this.index = 0
    this._ms = msPerChar
    this._acc = 0
    this._hold = 0
    this._active = true
    this._finished = false

    // đo chiều cao văn bản đầy đủ rồi khoá chiều cao tối thiểu -> khung đứng yên.
    // Giữ mức đã đo trước đó (đoạn dài nhất của câu) để dấu nhắc không nhảy lên xuống.
    const reserved = parseFloat(this.el.style.minHeight) || 0
    this.el.style.minHeight = ""
    this.el.textContent = text
    const full = this.el.getBoundingClientRect().height
    const target = Math.max(full, reserved)
    if (target > 0) this.el.style.minHeight = `${Math.ceil(target) + 1}px`

    if (prefersReducedMotion()) {
      this.el.textContent = text
      this.index = text.length
      this._complete()
      return
    }

    this.el.textContent = ""
    this._last = performance.now()
    this._raf = requestAnimationFrame(this._step)
  }

  /** Kết thúc ngay đoạn hiện tại (người dùng bấm để hiện hết chữ). */
  finish() {
    if (!this._active || this._finished) return false
    cancelAnimationFrame(this._raf)
    this.el.textContent = this.text
    this.index = this.text.length
    this._complete()
    return true
  }

  cancel() {
    cancelAnimationFrame(this._raf)
    this._raf = 0
    this._active = false
    this._finished = false
  }

  _complete() {
    this._active = false
    this._finished = true
    this._raf = 0
    this.onDone?.()
  }

  _step = (now) => {
    if (!this._active) return
    const dt = Math.min(64, now - this._last)
    this._last = now

    if (now < this._hold) {
      this._raf = requestAnimationFrame(this._step)
      return
    }

    this._acc += dt
    while (this._acc >= this._ms && this.index < this.text.length) {
      this._acc -= this._ms
      this.index += 1
      const char = this.text[this.index - 1]
      this.el.textContent = this.text.slice(0, this.index)
      this.onTick?.(char)

      if (this.index >= this.text.length) {
        this._complete()
        return
      }
      if (HARD_PAUSE.has(char)) {
        this._hold = now + HARD_MS
        this._acc = 0
        break
      }
      if (SOFT_PAUSE.has(char)) {
        this._hold = now + SOFT_MS
        this._acc = 0
        break
      }
    }

    if (this.index >= this.text.length) {
      this._complete()
      return
    }
    this._raf = requestAnimationFrame(this._step)
  }
}

/** Nhịp gõ phù hợp độ dài: đoạn dài vẫn không gây sốt ruột. */
export function rateFor(text) {
  const n = text?.length ?? 0
  if (n > 260) return 15
  if (n > 150) return 19
  return DEFAULT_MS_PER_CHAR
}