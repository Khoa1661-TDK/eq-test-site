/* landing.js — màn mở đầu của E-Quest: tiêu đề, một câu giới thiệu, nút bắt đầu, dải "Lịch sử làm bài"
   (3 lần gần nhất) và hàng 10 avatar dẫn tới thư viện profile.
   Mục tiêu là khám phá xu hướng phản ứng của bản thân qua các tình huống đời sống đại học; không phải bài kiểm tra
   dán nhãn con người và không có phần luyện tập. */

import { el } from "../core/dom.js"
import { EQ_PROFILES, EQ_PROFILE_KEYS } from "../data/eqProfiles.js"
import { QUEST_LENGTH, questAttempts } from "../core/questScoring.js"
import { historyEntry, profileAccent, profileAvatar } from "../ui/parts.js"

/** Nút chính: bàn phím và chuột đều đi qua navigate() của app shell. */
function primaryButton(label, href, navigate) {
  const btn = el("button", { class: "btn btn--accent btn--lg", attrs: { type: "button" } })
  btn.append(el("span", { class: "pxf-in", text: label }))
  btn.addEventListener("click", () => navigate(href))
  return btn
}

export function renderLanding(mount, { navigate }) {
  const startBtn = primaryButton("Bắt đầu", "/assessment", navigate)

  /* Dải lịch sử: 3 lần gần nhất; chưa có thì một dòng mời bắt đầu. */
  const recent = [...questAttempts()].sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0)).slice(0, 3)
  const strip = el("section", { class: "hist hist--strip", attrs: { "aria-labelledby": "hist-strip-h" } })
  strip.append(
    el(
      "div",
      { class: "hist__top" },
      el("h2", { class: "hist__h", id: "hist-strip-h", text: "Lịch sử làm bài" }),
      recent.length ? el("a", { class: "hist__all", href: "/history", text: "Xem tất cả →" }) : null,
    ),
  )
  if (recent.length) {
    strip.append(el("div", { class: "hist__list" }, recent.map((a) => historyEntry(a))))
  } else {
    strip.append(
      el(
        "div",
        { class: "hist__empty hist__empty--strip" },
        el("p", { class: "prose", text: "Bạn chưa có lần làm bài nào. Kết quả mỗi lượt sẽ được lưu ở đây để xem lại." }),
        el("a", { class: "hist__all", href: "/assessment", text: "Bắt đầu bài test →" }),
      ),
    )
  }

  /* Hàng 10 avatar: mỗi avatar mở một profile trong thư viện. */
  const avatars = el("ul", { class: "hero__avatars", attrs: { "aria-label": "10 EQ profile" } })
  for (const key of EQ_PROFILE_KEYS) {
    const p = EQ_PROFILES[key]
    const a = el("a", { class: "hero__avatar", href: `/profiles?p=${key}`, attrs: { title: `${p.en} — ${p.name}`, "aria-label": `${p.en} — ${p.name}` } })
    a.style.setProperty("--pc", profileAccent(key))
    a.append(el("span", { html: profileAvatar(key, 56, { decorative: true }) }))
    avatars.append(el("li", {}, a))
  }

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
      strip,
      el("p", { class: "hero__chips-note", text: `${QUEST_LENGTH} tình huống, cuối bài bạn khám phá xu hướng phản ứng của bản thân qua một trong 10 EQ profile.` }),
      avatars,
      el("p", { class: "hero__chips-note" }, el("a", { class: "hist__all", href: "/profiles", text: "Xem thư viện Profile →" })),
    ),
  )

  mount.append(hero)

  return { destroy: () => mount.replaceChildren() }
}
