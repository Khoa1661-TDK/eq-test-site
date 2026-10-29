/* eqResult.js — KẾT QUẢ EQ: avatar và tên profile (EN + VI), xu hướng phản ứng, kỹ năng nổi bật / cần nâng cấp,
   chìa khóa EQ (hoạt ảnh mở cửa, một câu cố định theo lượt làm), vài lựa chọn nghiêng về, liên kết thư viện profile.
   /result?id=<mã lượt> xem lại một lượt cũ; không có id thì xem lượt mới nhất. Danh sách lịch sử nằm ở /history. */

import { el, frame } from "../core/dom.js"
import { EQ_PROFILES } from "../data/eqProfiles.js"
import { attemptSeconds, keyQuoteFor, questAttempt, questAttempts, scoreQuest } from "../core/questScoring.js"
import { fmtDateTime, fmtDuration, profileAccent, profileAvatar } from "../ui/parts.js"

const reduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

const KEY_SVG = `<svg viewBox="0 0 32 16" width="96" height="48" shape-rendering="crispEdges" aria-hidden="true">
<path fill="#1d1b2e" d="M1 3h7v1h1v8H8v1H1v-1H0V4h1z"/>
<path fill="#ffcb3a" d="M2 4h5v1h1v6H7v1H2v-1H1V5h1z"/><path fill="#1d1b2e" d="M4 7h2v2H4z"/>
<path fill="#1d1b2e" d="M9 6h20v4H9z"/><path fill="#ffcb3a" d="M9 7h19v2H9z"/>
<path fill="#1d1b2e" d="M23 10h3v4h-3zM28 10h3v3h-3z"/><path fill="#c79a1a" d="M24 10h1v3h-1zM29 10h1v2h-1z"/>
</svg>`

const LOCK_SVG = `<svg viewBox="0 0 16 20" width="64" height="80" shape-rendering="crispEdges" aria-hidden="true">
<path fill="#1d1b2e" d="M4 0h8v1h1v7h-3V3H6v5H3V1h1z"/><path fill="#9aa0b4" d="M5 1h6v1h1v6h-1V3h-1V2H6v1H5v5H4V2h1z"/>
<path fill="#1d1b2e" d="M1 8h14v12H1z"/><path fill="#ffcb3a" d="M2 9h12v10H2z"/><path fill="#c79a1a" d="M2 16h12v3H2z"/>
<path fill="#1d1b2e" d="M7 11h2v3H7z"/><path fill="#1d1b2e" d="M6 11h4v2H6z"/>
</svg>`

export function renderEqResult(mount, { navigate }) {
  const view = el("div", { class: "result eqr" })
  let cleanup = []

  const go = (href) => (event) => {
    event.preventDefault()
    navigate(href)
  }
  const link = (href, text, cls = "btn btn--ghost") => {
    const a = el("a", { class: cls, href }, el("span", { class: "pxf-in", text }))
    a.addEventListener("click", go(href))
    return a
  }

  function draw() {
    cleanup.forEach((fn) => fn())
    cleanup = []
    view.replaceChildren()

    const latest = questAttempts().at(-1) ?? null
    const wantedId = new URL(location.href).searchParams.get("id")
    const asked = wantedId ? questAttempt(wantedId) : null
    const current = wantedId ? asked : latest
    const result = current ? scoreQuest(current) : null

    if (!current || !result?.answered) {
      view.append(
        frame(
          el(
            "div",
            { class: "empty" },
            el("h1", { class: "band__title", text: "Chưa có kết quả" }),
            el("p", { class: "prose", text: wantedId ? "Không tìm thấy lần làm bài này trên máy. Có thể lịch sử đã bị xóa." : "Bạn chưa làm bài nào trên máy này nên chưa có kết quả để xem. Làm thử một lượt, chỉ mất vài phút." }),
            el("p", { class: "actions" }, link("/assessment", "Bắt đầu bài test", "btn btn--accent btn--lg"), link("/profiles", "Xem thư viện Profile")),
          ),
          { size: "lg", cls: "result__empty" },
        ),
      )
      return
    }

    const profile = EQ_PROFILES[result.top]
    const accent = profileAccent(profile.key)
    const viewingOld = Boolean(latest) && current.id !== latest.id

    /* ---------------------------------------------------------- cửa sổ ---- */
    const bar = el(
      "div",
      { class: "syswin__bar" },
      el("span", { class: "syswin__title", text: "Kết quả của bạn" }),
      el(
        "span",
        { class: "syswin__dots", attrs: { "aria-hidden": "true" } },
        el("i", { class: "syswin__dot" }),
        el("i", { class: "syswin__dot" }),
        el("i", { class: "syswin__dot" }),
      ),
    )

    const seconds = attemptSeconds(current)
    const hero = el(
      "section",
      { class: "eqr-hero", attrs: { "aria-labelledby": "eqr-group" } },
      el("div", { class: "eqr-hero__art", html: profileAvatar(profile.key, 108) }),
      el(
        "div",
        { class: "eqr-hero__text" },
        el("p", { class: "eqr-kicker", text: "EQ Profile của bạn" }),
        el("h1", { class: "eqr-hero__name", id: "eqr-group", text: profile.en }),
        el("p", { class: "eqr-hero__vi", text: profile.name }),
        el("p", { class: "eqr-hero__en", text: [fmtDateTime(current.finishedAt), fmtDuration(seconds)].filter(Boolean).join(" · ") }),
      ),
    )
    hero.style.setProperty("--eqr-accent", accent)

    const text = (title, body, cls = "") =>
      el("section", { class: `eqr-sec ${cls}` }, el("h2", { class: "syswin__heading", text: title }), el("p", { class: "eqr-text", text: body }))

    /* Hai hộp: kỹ năng nổi bật / cần nâng cấp */
    const box = (title, body, kind) =>
      el("div", { class: `eqr-box eqr-box--${kind}` }, el("h2", { class: "eqr-box__title", text: title }), el("p", { class: "eqr-box__note", text: body }))
    const boxes = el("section", { class: "eqr-boxes" }, box("Kỹ năng nổi bật", profile.strengths, "star"), box("Kỹ năng cần nâng cấp", profile.levelUp, "up"))

    /* Chìa khóa: một câu, cố định theo lượt làm */
    const quote = keyQuoteFor(profile.key, current.id)
    const keyBtn = el(
      "button",
      { class: "eqr-keybtn", type: "button" },
      el("span", { class: "eqr-keybtn__icon", html: KEY_SVG }),
      el("span", { class: "eqr-keybtn__text", text: "Chìa khóa mở khóa EQ" }),
    )
    keyBtn.addEventListener("click", () => openKey(profile, quote, accent, keyBtn))
    const keySec = el("section", { class: "eqr-key" }, el("p", { class: "eqr-key__hint", text: "Có một câu dành riêng cho profile của bạn. Mở khóa để đọc." }), keyBtn)

    /* Nghiêng về: top 3 profile theo số lần chọn */
    const lean = el(
      "section",
      { class: "eqr-sec" },
      el("h2", { class: "syswin__heading", text: "Lựa chọn của bạn nghiêng về" }),
      el(
        "ul",
        { class: "eqr-lean" },
        result.ranked
          .slice(0, 3)
          .filter((r) => r.count > 0)
          .map((r) => {
            const p = EQ_PROFILES[r.key]
            return el(
              "li",
              { class: "eqr-lean__row" },
              el("span", { class: "eqr-lean__art", html: profileAvatar(r.key, 32, { decorative: true }) }),
              el("span", { class: "eqr-lean__name", text: p.name }),
              el("span", { class: "eqr-lean__bar", attrs: { "aria-hidden": "true" } }, el("i", { style: { width: `${(100 * r.count) / result.answered}%` } })),
              el("span", { class: "eqr-lean__num", text: `${r.count}/${result.answered}` }),
            )
          }),
      ),
      el("p", { class: "eqr-note", text: "Chỉ là số lần bạn chọn đáp án thuộc từng nhóm trong lượt làm này; profile có nhiều lựa chọn nhất được chọn làm kết quả." }),
    )

    const disclaimer = el("p", {
      class: "eqr-src__p",
      text: "Đây là công cụ giúp bạn tự khám phá xu hướng phản ứng của mình qua một lượt tình huống, không phải nhãn tính cách cố định, không phải thang đo tâm lý đã được kiểm định và không dùng để chẩn đoán. Làm lại vào lúc khác, bạn có thể nhận kết quả khác.",
    })

    const actions = el(
      "div",
      { class: "actions eqr-actions" },
      link("/assessment", "Làm lại bài test", "btn btn--accent"),
      link(`/profiles?p=${profile.key}`, "Xem hồ sơ trong thư viện"),
      link("/history", "Lịch sử làm bài"),
    )

    const win = el(
      "div",
      { class: "syswin" },
      bar,
      el(
        "div",
        { class: "syswin__body" },
        viewingOld ? el("p", { class: "eqr-note", text: `Đang xem lại lần làm bài ngày ${fmtDateTime(current.finishedAt)}.` }) : null,
        hero,
        text("Xu hướng phản ứng", profile.description),
        boxes,
        keySec,
        lean,
        disclaimer,
        actions,
      ),
    )
    view.append(frame(win, { size: "lg", cls: "syswin-frame" }))
  }

  /* ---------------------------------------------------- hoạt ảnh chìa khóa */
  function openKey(profile, text, color, opener) {
    const skip = reduced()
    const quote = el(
      "figure",
      { class: "kfx__quote" },
      el("blockquote", { text: `“${text}”` }),
      el("figcaption", { text: profile.name }),
    )
    const closeBtn = el("button", { class: "kfx__close", type: "button", attrs: { "aria-label": "Đóng" }, text: "×" })
    const door = (side) => el("div", { class: `kfx__door kfx__door--${side}` }, el("i", { class: "kfx__plank" }), el("i", { class: "kfx__plank" }), el("i", { class: "kfx__knob" }))
    const stage = el(
      "div",
      { class: "kfx__stage" },
      el("div", { class: "kfx__light" }),
      quote,
      el("div", { class: "kfx__doors" }, door("l"), door("r")),
      el("div", { class: "kfx__lock", html: LOCK_SVG }),
      el("div", { class: "kfx__key", html: KEY_SVG }),
      el("div", { class: "kfx__flash" }),
    )
    const overlay = el(
      "div",
      { class: `kfx${skip ? " kfx--skip" : ""}`, role: "dialog", attrs: { "aria-modal": "true", "aria-label": "Chìa khóa mở khóa EQ" } },
      el("div", { class: "kfx__panel" }, closeBtn, stage),
    )
    overlay.style.setProperty("--kc", color)
    document.body.append(overlay)
    document.body.classList.add("kfx-open")
    closeBtn.focus()
    if (!skip) requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add("kfx--play")))

    const close = () => {
      overlay.remove()
      document.body.classList.remove("kfx-open")
      document.removeEventListener("keydown", onKey, true)
      opener?.focus?.()
    }
    const onKey = (e) => {
      if (e.key === "Escape") {
        e.preventDefault()
        close()
      } else if (e.key === "Tab") {
        e.preventDefault()
        closeBtn.focus()
      }
    }
    document.addEventListener("keydown", onKey, true)
    closeBtn.addEventListener("click", close)
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close()
    })
    cleanup.push(() => {
      if (overlay.isConnected) close()
    })
  }

  draw()
  mount.append(view)
  return {
    destroy: () => {
      cleanup.forEach((fn) => fn())
      cleanup = []
      document.body.classList.remove("kfx-open")
      mount.replaceChildren()
    },
  }
}
