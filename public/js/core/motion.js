/* motion.js — tôn trọng prefers-reduced-motion, cung cấp nhịp chuyển động dùng chung */

const mq = typeof window !== "undefined" && window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null

export const prefersReducedMotion = () => !!mq?.matches

/** Theo dõi thay đổi cài đặt chuyển động của hệ điều hành. */
export function onMotionChange(handler) {
  if (!mq) return () => {}
  const listener = (event) => handler(event.matches)
  mq.addEventListener("change", listener)
  return () => mq.removeEventListener("change", listener)
}

/** Nhịp chuyển cảnh: ngắn khi người dùng muốn giảm chuyển động. */
export function beat(ms) {
  return prefersReducedMotion() ? Math.min(ms, 40) : ms
}

export const TIMING = {
  enter: beat(240),
  out: beat(160),
  confirm: beat(170),
  choiceStagger: prefersReducedMotion() ? 0 : 45,
  nextQuestion: beat(280),
}

/** Đánh thức layout một lần để đo chiều cao thật của phần tử. */
export function measureHeight(node) {
  const prevDisplay = node.style.display
  node.style.display = "block"
  const h = node.getBoundingClientRect().height
  node.style.display = prevDisplay
  return h
}