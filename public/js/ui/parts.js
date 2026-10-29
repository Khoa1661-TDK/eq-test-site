/* parts.js — vài mảnh giao diện dùng chung: avatar pixel của profile, định dạng ngày/giờ,
   và một dòng lịch sử làm bài (trang chủ, /history). */

import { el } from "../core/dom.js"
import { EQ_PROFILES } from "../data/eqProfiles.js"
import { MASCOTS_BY_KEY } from "../data/mascots.js"
import { attemptSeconds, scoreQuest } from "../core/questScoring.js"

/** Avatar pixel vẽ từ lưới 16×16, nét cứng, không mờ. Cỡ ảnh và nhãn aria-label là tham số. */
export function mascotArt(mascot, size = 160, label = "") {
  const rects = []
  mascot.pixels.forEach((row, y) => {
    ;[...row].forEach((ch, x) => {
      if (ch === "." || !mascot.palette[ch]) return
      rects.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="${mascot.palette[ch]}"/>`)
    })
  })
  const alt = label ? `role="img" aria-label="${label}"` : `aria-hidden="true"`
  return `<svg viewBox="0 0 16 16" width="${size}" height="${size}" shape-rendering="crispEdges" ${alt} fill="none">${rects.join("")}</svg>`
}

/** HTML avatar của một profile (theo key trong eqProfiles). decorative: true khi tên đã có chữ ngay cạnh. */
export function profileAvatar(profileKey, size = 96, { decorative = false } = {}) {
  const profile = EQ_PROFILES[profileKey]
  const mascot = profile && MASCOTS_BY_KEY[profile.avatar]
  return mascot ? mascotArt(mascot, size, decorative ? "" : `${profile.en} — ${profile.name}`) : ""
}

/** Màu nhấn của profile: màu chính thứ hai trong bảng màu avatar (sau màu viền mực). */
export function profileAccent(profileKey) {
  const palette = MASCOTS_BY_KEY[EQ_PROFILES[profileKey]?.avatar]?.palette ?? {}
  return Object.entries(palette).find(([k]) => k !== "o")?.[1] ?? "#ffd23f"
}

const pad = (n) => String(n).padStart(2, "0")

/** "29/10/2026, 14:05" theo định dạng vi-VN. */
export function fmtDateTime(ms) {
  if (!ms) return "không rõ ngày"
  return new Date(ms).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false })
}

/** "4 phút 12 giây" / "45 giây". */
export function fmtDuration(seconds) {
  if (seconds == null) return ""
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m ? `${m} phút ${pad(s)} giây` : `${s} giây`
}

/** Một dòng lịch sử: avatar + tên profile + ngày giờ + thời lượng, bấm để xem lại ở /result?id=… */
export function historyEntry(attempt, { here = false } = {}) {
  const result = scoreQuest(attempt)
  const profile = result?.answered ? EQ_PROFILES[result.profile.top] : null
  const seconds = attemptSeconds(attempt)
  return el(
    "a",
    { class: `hist__row${here ? " is-here" : ""}`, href: `/result?id=${encodeURIComponent(attempt.id)}` },
    el("span", { class: "hist__avatar", html: profile ? profileAvatar(profile.key, 48, { decorative: true }) : "" }),
    el(
      "span",
      { class: "hist__main" },
      el("span", { class: "hist__name", text: profile?.name ?? "Chưa đủ dữ liệu" }),
      el("span", { class: "hist__en", text: profile ? `${profile.en} (${profile.abbr})` : "" }),
      el("span", { class: "hist__meta", text: [fmtDateTime(attempt.finishedAt), fmtDuration(seconds)].filter(Boolean).join(" · ") }),
    ),
    el("span", { class: "hist__go", text: "Xem →", attrs: { "aria-hidden": "true" } }),
  )
}
