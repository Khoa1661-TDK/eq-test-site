/* landing.js — màn mở đầu của VIBECHECK: tiêu đề, một câu giới thiệu, nút bắt đầu và hàng chip 16 kiểu.
   Sản phẩm là một trainer theo vòng: đánh giá → hiểu → luyện → đánh giá lại → tiến bộ.
   Không phải bài kiểm tra dán nhãn con người: chỉ có kỹ năng luyện được và những tình huống thực tế. */

import { el } from "../core/dom.js"
import { TYPES } from "../data/types.js"
import { TOTAL_SCENARIOS } from "../core/eqScoring.js"

/** Nút chính: bàn phím và chuột đều đi qua navigate() của app shell. */
function primaryButton(label, href, navigate) {
  const btn = el("button", { class: "btn btn--accent btn--lg", attrs: { type: "button" } })
  btn.append(el("span", { class: "pxf-in", text: label }))
  btn.addEventListener("click", () => navigate(href))
  return btn
}

export function renderLanding(mount, { navigate }) {
  const startBtn = primaryButton("Bắt đầu", "/assessment", navigate)

  /* Hàng chip 16 kiểu: mỗi chip một mã, nền pastel và chữ mực lấy từ bảng màu
     riêng của kiểu (--mc, --mi do JS gắn). Chỉ để nhìn, không phải nút bấm. */
  const chips = el("div", { class: "hero__chips", attrs: { "aria-label": "Mười sáu kiểu cảm xúc của trang" } })
  TYPES.forEach((type) => {
    const chip = el("span", { class: "hero__chip", text: type.code })
    chip.style.setProperty("--mc", type.colors.bg)
    chip.style.setProperty("--mi", type.colors.ink)
    chips.append(chip)
  })

  const hero = el("section", { class: "hero" })
  hero.append(
    el(
      "div",
      { class: "shell" },
      el("h1", { class: "hero__title" }, "Bạn xử lý cảm xúc kiểu gì khi đời sinh viên “quay xe”?"),
      el("p", {
        class: "hero__tag",
        text: `${TOTAL_SCENARIOS} khoảnh khắc ở giảng đường, KTX, căng tin — chọn điều bạn thật sự sẽ làm.`,
      }),
      el("div", { class: "hero__cta" }, startBtn),
      chips,
      el("p", { class: "hero__chips-note", text: "Cuối bài, bạn là kiểu nào trong 16 kiểu?" }),
    ),
  )

  mount.append(hero)

  return { destroy: () => mount.replaceChildren() }
}
