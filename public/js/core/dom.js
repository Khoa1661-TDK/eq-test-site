/* dom.js — trợ giúp DOM tối giản, không phụ thuộc thư viện */

export const qs = (sel, root = document) => root.querySelector(sel)
export const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel))

export function el(tag, props = {}, ...kids) {
  const node = document.createElement(tag)
  for (const [key, val] of Object.entries(props)) {
    if (val === null || val === undefined || val === false) continue
    if (key === "class") node.className = val
    else if (key === "text") node.textContent = val
    else if (key === "html") node.innerHTML = val
    else if (key === "dataset") Object.assign(node.dataset, val)
    else if (key === "attrs" && typeof val === "object") {
      for (const [name, v] of Object.entries(val)) {
        if (v === null || v === undefined || v === false) continue
        node.setAttribute(name, v === true ? "" : String(v))
      }
    }
    else if (key === "style" && typeof val === "object") Object.assign(node.style, val)
    else if (key.startsWith("on") && typeof val === "function") node.addEventListener(key.slice(2), val)
    else if (val === true) node.setAttribute(key, "")
    else node.setAttribute(key, String(val))
  }
  append(node, kids)
  return node
}

export function append(parent, kids) {
  for (const kid of kids.flat(6)) {
    if (kid === null || kid === undefined || kid === false) continue
    parent.appendChild(kid instanceof Node ? kid : document.createTextNode(String(kid)))
  }
  return parent
}

/** Khung pixel hai lớp: lớp ngoài là viền, lớp trong là nền. */
export function frame(inner, { size = "", cls = "", innerCls = "", fill = null, frame: frameColor = null, attrs = {} } = {}) {
  const outerClass = ["pxf", size && `pxf--${size}`, cls].filter(Boolean).join(" ")
  if (fill) attrs.style = { ...(attrs.style || {}), "--fill": fill }
  if (frameColor) attrs.style = { ...(attrs.style || {}), "--frame": frameColor }
  const shell = el("div", { ...attrs, class: outerClass })
  const box = el("div", { class: ["pxf-in", innerCls].filter(Boolean).join(" ") })
  append(box, [inner])
  shell.appendChild(box)
  return shell
}

/** Nội dung bên trong một khung pixel đã dựng. */
export const frameInner = (node) => node.querySelector(".pxf-in")

/** SVG 8x8 "dấu hiệu" thương hiệu: khối pixel nhỏ, tự vẽ, không sao chép asset ngoài. */
export function sigil(color = "currentColor") {
  const rows = [
    "..####..",
    ".######.",
    "##....##",
    "#..##..#",
    "#..##..#",
    "##....##",
    ".######.",
    "..####..",
  ]
  const cells = []
  rows.forEach((row, y) => {
    let x = 0
    while (x < row.length) {
      if (row[x] === "#") {
        let run = 1
        while (row[x + run] === "#") run += 1
        cells.push(`<rect x="${x}" y="${y}" width="${run}" height="1"/>`)
        x += run
      } else x += 1
    }
  })
  return `<svg viewBox="0 0 8 8" width="22" height="22" shape-rendering="crispEdges" aria-hidden="true" fill="${color}">${cells.join(
    "",
  )}</svg>`
}

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export function copyText(text) {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text).then(() => true, () => false)
  try {
    const ta = document.createElement("textarea")
    ta.value = text
    ta.setAttribute("readonly", "")
    ta.style.position = "fixed"
    ta.style.opacity = "0"
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand("copy")
    ta.remove()
    return Promise.resolve(ok)
  } catch {
    return Promise.resolve(false)
  }
}