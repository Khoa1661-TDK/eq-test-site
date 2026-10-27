/* landing.js — màn mở đầu của E-Quest: tiêu đề, một câu giới thiệu, nút bắt đầu và hàng chip năm thành phần EQ.
   Sản phẩm là một trainer theo vòng: đánh giá → hiểu → luyện → đánh giá lại → tiến bộ.
   Không phải bài kiểm tra dán nhãn con người: chỉ có kỹ năng luyện được và những tình huống thực tế. */

import { el } from "../core/dom.js"
import { EQ_TRAITS } from "../data/eqTraits.js"
import { QUEST_LENGTH } from "../core/questScoring.js"

/** Nút chính: bàn phím và chuột đều đi qua navigate() của app shell. */
function primaryButton(label, href, navigate) {
  const btn = el("button", { class: "btn btn--accent btn--lg", attrs: { type: "button" } })
  btn.append(el("span", { class: "pxf-in", text: label }))
  btn.addEventListener("click", () => navigate(href))
  return btn
}

export function renderLanding(mount, { navigate }) {
  const startBtn = primaryButton("Bắt đầu", "/assessment", navigate)

  /* Hàng chip năm thành phần EQ mà hồ sơ cuối bài đo: chỉ để nhìn, không phải nút bấm. */
  const chips = el("div", { class: "hero__chips", attrs: { "aria-label": "Năm thành phần EQ được đánh giá" } })
  EQ_TRAITS.forEach((trait) => {
    const chip = el("span", { class: "hero__chip", text: trait.name })
    chip.style.setProperty("--mc", `color-mix(in srgb, ${trait.color} 28%, var(--paper))`)
    chip.style.setProperty("--mi", "var(--ink)")
    chips.append(chip)
  })

  const hero = el("section", { class: "hero" })
  hero.append(
    el(
      "div",
      { class: "shell" },
      el("h1", { class: "hero__title" }, "Cùng một câu chuyện, mỗi người một cảm xúc."),
      el("p", {
        class: "hero__tag",
        text: "Giữa những tình huống chẳng ai giống ai của cuộc sống đại học, cách bạn phản ứng có thể tiết lộ những điều mà chính bạn cũng chưa từng nhận ra.",
      }),
      el("div", { class: "hero__cta" }, startBtn),
      chips,
      el("p", { class: "hero__chips-note", text: `${QUEST_LENGTH} tình huống, cuối bài là hồ sơ EQ với năm đặc tính của riêng bạn.` }),
    ),
  )

  mount.append(hero)

  return { destroy: () => mount.replaceChildren() }
}
