/* landing.js — màn mở đầu của VIBECHECK: tiêu đề, một câu giới thiệu, nút bắt đầu và hàng chip linh vật.
   Sản phẩm là một trainer theo vòng: đánh giá → hiểu → luyện → đánh giá lại → tiến bộ.
   Không phải bài kiểm tra dán nhãn con người: chỉ có kỹ năng luyện được và những tình huống thực tế. */

import { el } from "../core/dom.js"
import { MASCOTS } from "../data/mascots.js"
import { TOTAL_SCENARIOS } from "../core/eqScoring.js"
import { mascotArt } from "../ui/parts.js"

/** Nút chính: bàn phím và chuột đều đi qua navigate() của app shell. */
function primaryButton(label, href, navigate) {
  const btn = el("button", { class: "btn btn--accent btn--lg", attrs: { type: "button" } })
  btn.append(el("span", { class: "pxf-in", text: label }))
  btn.addEventListener("click", () => navigate(href))
  return btn
}

export function renderLanding(mount, { navigate }) {
  const startBtn = primaryButton("Bắt đầu", "/assessment", navigate)

  /* Hàng chip linh vật: một chip một con — ảnh pixel 20px + tên chữ thường,
     nền tint nhạt từ màu của linh vật, chữ mực đậm cho rõ. Chỉ để nhìn. */
  const chips = el("div", { class: "hero__chips", attrs: { "aria-label": "Bảy linh vật cảm xúc của trang" } })
  MASCOTS.forEach((mascot) => {
    const chip = el(
      "span",
      { class: "hero__chip" },
      el("span", { class: "hero__chip__art", html: mascotArt(mascot, 20) }),
      el("span", { class: "hero__chip__name", text: mascot.name }),
    )
    chip.style.setProperty("--mc", mascot.colors.main)
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
        text: `${TOTAL_SCENARIOS} khoảnh khắc ở giảng đường, KTX, căng tin — chọn điều bạn thật sự sẽ làm; cuối bài, nhận linh vật cảm xúc của riêng bạn.`,
      }),
      el("div", { class: "hero__cta" }, startBtn),
      chips,
    ),
  )

  mount.append(hero)

  return { destroy: () => mount.replaceChildren() }
}
