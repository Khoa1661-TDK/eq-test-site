/* eqResult.js — HỒ SƠ EQ: nhóm của bạn (thành phần nổi bật nhất), năm thanh đặc tính,
   kỹ năng nổi bật / cần nâng cấp, chìa khóa EQ (hoạt ảnh mở cửa), lịch sử làm bài, nguồn tham khảo. */

import { el, frame } from "../core/dom.js"
import { MASCOTS_BY_KEY } from "../data/mascots.js"
import { EQ_SOURCES, EQ_TRAITS, EQ_TRAIT_BY_KEY } from "../data/eqTraits.js"
import { EQ_PROFILES, PRACTICE_SKILL, TRAIT_NOTES } from "../data/eqProfiles.js"
import { clearQuestHistory, questAttempt, questAttempts, scoreQuest } from "../core/questScoring.js"
import { mascotArt } from "../ui/parts.js"

const reduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

const fmtDate = (ms) => {
  if (!ms) return "không rõ ngày"
  const d = new Date(ms)
  const p = (n) => String(n).padStart(2, "0")
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} lúc ${p(d.getHours())}:${p(d.getMinutes())}`
}

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

    const all = questAttempts()
    const latest = all.at(-1) ?? null
    const wantedId = new URL(location.href).searchParams.get("id")
    const current = (wantedId && questAttempt(wantedId)) || latest
    const result = current ? scoreQuest(current) : null

    if (!current || !result?.answered) {
      view.append(
        frame(
          el(
            "div",
            { class: "empty" },
            el("h1", { class: "band__title", text: "Chưa có hồ sơ EQ" }),
            el("p", { class: "prose", text: "Bạn chưa làm bài nào trên máy này nên chưa có hồ sơ để xem. Làm thử một lượt, chỉ mất vài phút." }),
            el("p", { class: "actions" }, link("/assessment", "Bắt đầu làm bài", "btn btn--accent btn--lg")),
          ),
          { size: "lg", cls: "result__empty" },
        ),
      )
      return
    }

    const profile = EQ_PROFILES[result.top]
    const mascot = MASCOTS_BY_KEY[profile.mascot]

    /* ---------------------------------------------------------- cửa sổ ---- */
    const bar = el(
      "div",
      { class: "syswin__bar" },
      el("span", { class: "syswin__title", text: "Hồ sơ EQ của bạn" }),
      el(
        "span",
        { class: "syswin__dots", attrs: { "aria-hidden": "true" } },
        el("i", { class: "syswin__dot" }),
        el("i", { class: "syswin__dot" }),
        el("i", { class: "syswin__dot" }),
      ),
    )

    const topTrait = EQ_TRAIT_BY_KEY[result.top]
    const hero = el(
      "section",
      { class: "eqr-hero", attrs: { "aria-labelledby": "eqr-group" } },
      el("div", { class: "eqr-hero__art", html: mascotArt(mascot, 120, profile.name) }),
      el(
        "div",
        { class: "eqr-hero__text" },
        el("p", { class: "eqr-kicker", text: "Nhóm EQ của bạn" }),
        el("h1", { class: "eqr-hero__name", id: "eqr-group", text: profile.name }),
        el("p", { class: "eqr-hero__en", text: `${profile.en} · nổi bật nhất: ${topTrait.name}` }),
        el("p", { class: "eqr-hero__tag", text: profile.tagline }),
        el("p", { class: "eqr-hero__desc", text: profile.description }),
      ),
    )
    hero.style.setProperty("--eqr-accent", topTrait.color)

    /* Thanh đặc tính */
    const fills = []
    const bars = el(
      "section",
      { class: "eqr-sec" },
      el("h2", { class: "syswin__heading", text: "Đặc tính EQ của bạn" }),
      el(
        "ul",
        { class: "eqr-bars" },
        result.traits.map((t) => {
          const fill = el("span", { class: "eqr-bar__fill", style: { background: t.color } })
          fills.push([fill, t.score])
          return el(
            "li",
            { class: "eqr-bar" },
            el("div", { class: "eqr-bar__head" }, el("span", { class: "eqr-bar__name", text: t.name }), el("span", { class: "eqr-bar__num", text: String(t.score) })),
            el("div", { class: "eqr-bar__track", attrs: { role: "img", "aria-label": `${t.name}: ${t.score} trên 100` } }, fill),
          )
        }),
      ),
    )
    const animate = reduced()
    fills.forEach(([f, s]) => (f.style.width = animate ? `${s}%` : "0%"))
    if (!animate) {
      const raf = requestAnimationFrame(() => requestAnimationFrame(() => fills.forEach(([f, s]) => (f.style.width = `${s}%`))))
      cleanup.push(() => cancelAnimationFrame(raf))
    }

    /* Hai hộp */
    const box = (title, keys, kind) =>
      el(
        "div",
        { class: `eqr-box eqr-box--${kind}` },
        el("h2", { class: "eqr-box__title", text: title }),
        el(
          "ul",
          { class: "eqr-box__list" },
          keys.map((k) => {
            const t = EQ_TRAIT_BY_KEY[k]
            const href = `/practice?skill=${PRACTICE_SKILL[k]}`
            const li = el(
              "li",
              { class: "eqr-box__item" },
              el("p", { class: "eqr-box__name", text: t.name }),
              el("p", { class: "eqr-box__note", text: TRAIT_NOTES[k][kind === "up" ? "upgrade" : "standout"] }),
              kind === "up" ? link(href, "Luyện kỹ năng này", "eqr-box__link") : null,
            )
            li.style.setProperty("--c", t.color)
            return li
          }),
        ),
      )
    const boxes = el("section", { class: "eqr-boxes" }, box("Kỹ năng nổi bật", result.strengths, "star"), box("Kỹ năng cần nâng cấp", result.toGrow, "up"))

    /* Chìa khóa */
    const keyBtn = el(
      "button",
      { class: "eqr-keybtn", type: "button" },
      el("span", { class: "eqr-keybtn__icon", html: KEY_SVG }),
      el("span", { class: "eqr-keybtn__text", text: "Chìa khóa EQ của bạn" }),
    )
    keyBtn.addEventListener("click", () => openKey(profile, topTrait.color, keyBtn))
    const keySec = el("section", { class: "eqr-key" }, el("p", { class: "eqr-key__hint", text: "Có một câu dành riêng cho nhóm của bạn. Mở khóa để đọc." }), keyBtn)

    /* Lịch sử */
    const viewingOld = current.id !== latest.id
    const history = el(
      "section",
      { class: "eqr-sec" },
      el("h2", { class: "syswin__heading", text: "Lịch sử làm bài" }),
      viewingOld ? el("p", { class: "eqr-note", text: `Đang xem lần làm ngày ${fmtDate(current.finishedAt)}.` }) : null,
      el(
        "ul",
        { class: "eqr-hist" },
        [...all].reverse().map((a) => {
          const r = scoreQuest(a)
          const p = r?.answered ? EQ_PROFILES[r.top] : null
          const here = a.id === current.id
          const row = el(
            "a",
            { class: `eqr-hist__row${here ? " is-here" : ""}`, href: `/result?id=${encodeURIComponent(a.id)}`, attrs: { "aria-current": here ? "true" : null } },
            el("span", { class: "eqr-hist__date", text: fmtDate(a.finishedAt) }),
            el("span", { class: "eqr-hist__group", text: p?.name ?? "—" }),
            el("span", { class: "eqr-hist__trait", text: r?.answered ? EQ_TRAIT_BY_KEY[r.top].name : "" }),
            here ? el("span", { class: "eqr-hist__tag", text: "Đang xem" }) : null,
          )
          row.addEventListener("click", (e) => {
            e.preventDefault()
            navigate(`/result?id=${encodeURIComponent(a.id)}`)
          })
          return el("li", {}, row)
        }),
      ),
    )

    /* Nguồn */
    const sources = el(
      "section",
      { class: "eqr-sec" },
      el("h2", { class: "syswin__heading", text: "Nguồn tham khảo" }),
      el("p", { class: "eqr-src__p", text: "Năm đặc tính trong bài theo mô hình trí tuệ cảm xúc của Daniel Goleman. Đây là công cụ để bạn tự nhìn lại mình, không phải bài trắc nghiệm tâm lý đã được kiểm định." }),
      el(
        "ul",
        { class: "eqr-src" },
        EQ_SOURCES.map((s) => el("li", {}, el("a", { href: s.href, target: "_blank", rel: "noopener", text: s.text }))),
      ),
    )

    /* Hành động */
    const clearBtn = el("button", { class: "btn btn--ghost", type: "button" }, el("span", { class: "pxf-in", text: "Xóa lịch sử" }))
    clearBtn.addEventListener("click", () => {
      if (!confirm("Xóa toàn bộ lịch sử làm bài trên máy này? Việc này không hoàn tác được.")) return
      clearQuestHistory()
      if (location.search) navigate("/result")
      else draw()
    })
    const actions = el("div", { class: "actions eqr-actions" }, link("/assessment", "Làm lại bài test", "btn btn--accent"), clearBtn)

    const win = el(
      "div",
      { class: "syswin" },
      bar,
      el("div", { class: "syswin__body" }, hero, bars, boxes, keySec, history, sources, actions),
    )
    view.append(frame(win, { size: "lg", cls: "syswin-frame" }))
  }

  /* ---------------------------------------------------- hoạt ảnh chìa khóa */
  function openKey(profile, color, opener) {
    const skip = reduced()
    const quote = el(
      "figure",
      { class: "kfx__quote" },
      el("blockquote", { text: `“${profile.quote.text}”` }),
      profile.quote.author ? el("figcaption", { text: `— ${profile.quote.author}` }) : el("figcaption", { text: profile.name }),
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
      { class: `kfx${skip ? " kfx--skip" : ""}`, role: "dialog", attrs: { "aria-modal": "true", "aria-label": "Chìa khóa EQ của bạn" } },
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
