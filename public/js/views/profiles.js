/* profiles.js — THƯ VIỆN PROFILE (/profiles): lưới 10 profile; bấm một thẻ để xem chi tiết
   (/profiles?p=<key>): xu hướng phản ứng, kỹ năng nổi bật, kỹ năng cần nâng cấp và cả 3 chìa khóa.
   Xem được mà không cần làm bài test trước. */

import { el, frame } from "../core/dom.js"
import { EQ_PROFILES, EQ_PROFILE_KEYS } from "../data/eqProfiles.js"
import { profileAccent, profileAvatar } from "../ui/parts.js"

export function renderProfiles(mount, { navigate }) {
  const wanted = new URL(location.href).searchParams.get("p")
  const open = EQ_PROFILES[wanted] ? wanted : null

  const go = (href) => (event) => {
    event.preventDefault()
    navigate(href)
  }
  const link = (href, text, cls = "btn btn--ghost") => {
    const a = el("a", { class: cls, href }, el("span", { class: "pxf-in", text }))
    a.addEventListener("click", go(href))
    return a
  }

  const card = (key) => {
    const p = EQ_PROFILES[key]
    const a = el(
      "a",
      { class: `plib__card${key === open ? " is-open" : ""}`, href: `/profiles?p=${key}`, attrs: { "aria-current": key === open ? "true" : null } },
      el("span", { class: "plib__art", html: profileAvatar(key, 96, { decorative: true }) }),
      el("span", { class: "plib__en", text: p.en }),
      el("span", { class: "plib__vi", text: p.name }),
      el("span", { class: "plib__desc", text: p.description }),
    )
    a.style.setProperty("--pc", profileAccent(key))
    a.addEventListener("click", go(`/profiles?p=${key}`))
    return a
  }

  const detail = (key) => {
    const p = EQ_PROFILES[key]
    const section = (title, body) => el("section", { class: "plib__sec" }, el("h3", { class: "syswin__heading", text: title }), body)
    const panel = el(
      "section",
      { class: "plib__detail", id: "plib-detail", attrs: { "aria-labelledby": "plib-detail-h" } },
      el(
        "div",
        { class: "plib__head" },
        el("div", { class: "plib__bigart", html: profileAvatar(key, 128) }),
        el(
          "div",
          { class: "plib__titles" },
          el("h2", { class: "plib__h", id: "plib-detail-h", text: p.en }),
          el("p", { class: "plib__hvi", text: p.name }),
        ),
        link("/profiles", "Đóng", "btn btn--ghost btn--sm plib__close"),
      ),
      section("Xu hướng phản ứng", el("p", { class: "eqr-text", text: p.description })),
      el(
        "div",
        { class: "eqr-boxes" },
        el("div", { class: "eqr-box eqr-box--star" }, el("h4", { class: "eqr-box__title", text: "Kỹ năng nổi bật" }), el("p", { class: "eqr-box__note", text: p.strengths })),
        el("div", { class: "eqr-box eqr-box--up" }, el("h4", { class: "eqr-box__title", text: "Kỹ năng cần nâng cấp" }), el("p", { class: "eqr-box__note", text: p.levelUp })),
      ),
      section("Chìa khóa mở khóa EQ", el("ul", { class: "plib__keys" }, p.keys.map((q) => el("li", { text: `“${q}”` })))),
    )
    panel.style.setProperty("--pc", profileAccent(key))
    return panel
  }

  const grid = el("div", { class: "plib__grid" }, EQ_PROFILE_KEYS.map(card))
  const win = el(
    "div",
    { class: "syswin" },
    el(
      "div",
      { class: "syswin__bar" },
      el("span", { class: "syswin__title", text: "Thư viện Profile" }),
      el("span", { class: "syswin__dots", attrs: { "aria-hidden": "true" } }, el("i", { class: "syswin__dot" }), el("i", { class: "syswin__dot" }), el("i", { class: "syswin__dot" })),
    ),
    el(
      "div",
      { class: "syswin__body" },
      el("h1", { class: "band__title", text: "10 EQ Profile của E-Quest" }),
      el("p", { class: "prose", text: "Mỗi profile mô tả một xu hướng phản ứng thường gặp, không phải nhãn tính cách cố định. Bạn xem được tất cả mà không cần làm bài test trước." }),
      open ? detail(open) : null,
      grid,
      el("p", { class: "actions" }, link("/assessment", "Làm bài test để biết xu hướng của bạn", "btn btn--accent")),
    ),
  )
  const view = el("div", { class: "result eqr plib" }, frame(win, { size: "lg", cls: "syswin-frame" }))
  mount.append(view)

  if (open) {
    const panel = view.querySelector("#plib-detail")
    requestAnimationFrame(() => panel.scrollIntoView({ block: "start", behavior: "auto" }))
  }
  return { destroy: () => mount.replaceChildren() }
}
