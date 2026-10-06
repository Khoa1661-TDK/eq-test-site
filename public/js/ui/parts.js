/* parts.js — vài mảnh giao diện dùng ở nhiều màn của phần đánh giá EQ:
   thang đo pixel, hàng chiều hướng (mở ra xem nghĩa + bài tập), thẻ kỹ năng, khung xem trước. */

import { el } from "../core/dom.js"
import { meterCells } from "./meter.js"

export { meterCells }

/** Nhãn mức độ của một chiều: dùng chung cho thẻ và bảng kết quả. */
export function levelChip(dim) {
  const cls = dim.level === "high" ? "chip--olive" : dim.level === "mid" ? "chip--amber" : "chip--ink"
  return el("span", { class: `chip ${cls}`, text: dim.band?.label ?? "" })
}

/** Một hàng chiều hướng ở trang kết quả: bấm vào để mở phần giải thích và bài tập. */
export function dimRow(dim, { open = false, practiceHref = null } = {}) {
  const head = el(
    "summary",
    { class: "dim__head" },
    el("span", { class: "dim__code", text: dim.code, attrs: { "aria-hidden": "true" } }),
    el("span", { class: "dim__name", text: dim.name }),
    el("span", { class: "dim__val", text: `${dim.score}%` }),
    el("span", { class: "dim__meter" }, meterCells(dim.score, 100, { cells: 16, cls: "meter__cells" })),
    el("span", { class: "dim__sign", text: "＋", attrs: { "aria-hidden": "true" } }),
  )

  const body = el(
    "div",
    { class: "dim__body" },
    el("p", { class: "dim__band", text: dim.band?.label ?? "" }),
    el("p", { class: "dim__meaning", text: dim.band?.meaning ?? "" }),
    el(
      "ul",
      { class: "dim__examples" },
      (dim.band?.examples ?? []).map((text) => el("li", { text })),
    ),
    el("p", {
      class: "dim__exact",
      text: `Điểm tình huống: ${dim.earned}/${dim.possible} — đo qua ${Math.round(dim.possible / 3)} tình huống có chạm tới kỹ năng này.`,
    }),
    practiceHref ? el("a", { class: "dim__link", href: practiceHref, text: `Luyện ${dim.name.toLowerCase()} →` }) : null,
  )

  return el("details", { class: "dim", open: open || null }, head, body)
}

/** Danh sách bài tập của một chiều hướng (3–5 bài). */
export function exerciseList(dim, { limit = 5 } = {}) {
  const box = el("div", { class: "exlist" })
  const exercises = (dim.exercises ?? []).slice(0, limit)
  exercises.forEach((ex, index) => {
    box.append(
      el(
        "div",
        { class: "ex" },
        el("span", { class: "ex__n", text: String(index + 1) }),
        el("div", { class: "ex__main" },
          el("div", { class: "ex__name", text: ex.name }),
          el("p", { class: "ex__how", text: ex.how }),
          el("p", { class: "ex__why", text: ex.why }),
        ),
      ),
    )
  })
  return box
}

/** Thẻ một kỹ năng ở trang luyện tập: số tình huống đã luyện / tổng số. */
export function skillCard(dim, { practised = 0, total = 0, href = null } = {}) {
  const node = el("a", { class: "skill", href, attrs: { "aria-label": `Luyện ${dim.name}` } })
  node.append(
    el(
      "div",
      { class: "skill__in" },
      el("div", { class: "skill__top" },
        el("span", { class: "skill__code", text: dim.code }),
        el("span", { class: "skill__name", text: dim.name }),
      ),
      el("p", { class: "skill__tagline", text: dim.tagline }),
      el("div", { class: "skill__meter" }, meterCells(practised, total || 1, { cells: 14, cls: "meter__cells" })),
      el("p", { class: "skill__count", text: `${practised}/${total} tình huống đã luyện` }),
    ),
  )
  return node
}

/** Khung xem trước tĩnh của một tình huống: cho thấy trải nghiệm thật trước khi bắt đầu. */
export function scenarioPeek(scenario) {
  const board = el(
    "div",
    { class: "console peek__board", dataset: { cue: "off", hint: "off" } },
    el(
      "div",
      { class: "console__in" },
      el("div", { class: "console__top" }, el("span", { class: "console__page", text: "TÌNH HUỐNG" })),
      el("div", { class: "console__text" }, el("span", { text: scenario.dialogue[0] })),
      el("div", { class: "console__top" }, el("span", { class: "console__page", text: "CÂU HỎI" })),
      el("div", { class: "console__text" }, el("span", { text: scenario.prompt })),
      el(
        "div",
        { class: "choices is-open" },
        scenario.choices.map((choice) =>
          el(
            "div",
            { class: "choice is-in" },
            el("span", { class: "choice__cursor", text: ">", attrs: { "aria-hidden": "true" } }),
            el("span", { class: "choice__code", text: choice.code, attrs: { "aria-hidden": "true" } }),
            el("span", { class: "choice__text", text: choice.text }),
          ),
        ),
      ),
    ),
  )
  return board
}