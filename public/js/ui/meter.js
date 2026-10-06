/* meter.js — thang đo pixel: một hàng ô, ô sáng = tỉ lệ đạt được. */

import { el } from "../core/dom.js"

export function meterCells(value, max, { cells = 20, cls = "meter__cells" } = {}) {
  const box = el("div", { class: cls, attrs: { "aria-hidden": "true" } })
  const on = Math.max(0, Math.min(cells, Math.round((value / (max || 1)) * cells)))
  for (let i = 0; i < cells; i += 1) box.append(el("i", { class: i < on ? "on" : "" }))
  return box
}