/* admin.js — trang /admin: đọc /api/admin, tính tổng hợp ngay trên trình duyệt, xuất CSV/JSON. */

import { QUEST_BANK } from "./data/questBank.js"
import { EQ_TRAITS } from "./data/eqTraits.js"
import { scoreQuestAnswers, strongestChoice } from "./core/questScoring.js"

const TOKEN_KEY = "eq-admin-token"
const PAGE = 50
const BAND_LABEL = { high: "Cao", mid: "Trung bình", low: "Thấp" }
const $ = (id) => document.getElementById(id)

let data = null
let shown = PAGE

function getToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || ""
  } catch {
    return ""
  }
}

function setToken(value) {
  try {
    if (value) sessionStorage.setItem(TOKEN_KEY, value)
    else sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    /* chế độ riêng tư: bỏ qua */
  }
}

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag)
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v
    else if (k === "style") node.style.cssText = v
    else node.setAttribute(k, v)
  }
  for (const child of children.flat()) if (child != null) node.append(child)
  return node
}

const pct = (n, d) => (d ? Math.round((100 * n) / d) : 0)
const avg = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null)
const fmtSec = (s) => (s == null ? "—" : `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`)
const fmtTime = (iso) => new Date(iso).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })
const dayKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

function median(xs) {
  if (!xs.length) return null
  const s = [...xs].sort((a, b) => a - b)
  const m = s.length >> 1
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

/* ------------------------------------------------------------------- tải dữ liệu */

/** Bản ghi lưu theo bản 10 profile (có profile/counts, không có điểm đặc tính): chấm lại từ lựa chọn. */
function withTraits(s) {
  if (s.traits || !s.answers || !Object.keys(s.answers).length) return s
  const r = scoreQuestAnswers(s.answers, s.order)
  if (!r.answered) return s
  const traits = Object.fromEntries(r.traits.map((t) => [t.key, t.score]))
  const mean = Math.round(r.traits.reduce((sum, t) => sum + t.score, 0) / r.traits.length)
  return { ...s, traits, mean, top: r.top, band: mean >= 70 ? "high" : mean >= 45 ? "mid" : "low" }
}

async function load() {
  const token = getToken()
  const res = await fetch("api/admin", { headers: token ? { Authorization: `Basic ${token}` } : {}, cache: "no-store" })
  if (res.status === 401) return showLogin(token ? "Sai tên đăng nhập hoặc mật khẩu." : "")
  const body = await res.json().catch(() => ({}))
  if (!res.ok) return showLogin(body.error || `Lỗi máy chủ (${res.status}).`)
  data = body
  data.submissions = (data.submissions ?? []).map(withTraits)
  shown = PAGE
  $("error").textContent = ""
  $("login").hidden = true
  $("dash").hidden = false
  $("actions").hidden = false
  render()
}

function showLogin(message) {
  $("dash").hidden = true
  $("actions").hidden = true
  $("login").hidden = false
  $("error").textContent = message
  $("user").focus()
}

function filtered() {
  const days = $("range").value
  if (days === "all") return data.submissions
  const from = new Date()
  from.setHours(0, 0, 0, 0)
  from.setDate(from.getDate() - (Number(days) - 1))
  return data.submissions.filter((s) => new Date(s.at) >= from)
}

/* ------------------------------------------------------------------- vẽ */

function render() {
  const subs = filtered()
  const detailed = subs.filter((s) => s.traits)
  $("storage").textContent = data.storage === "redis" ? "Kho: Upstash Redis" : "Kho: file trên máy"
  renderTiles(subs, detailed)
  renderTraits(detailed)
  renderDays(data.submissions)
  renderQuestions(detailed)
  renderTable(subs)
}

function tile(label, value, note) {
  return el("div", { class: "adm-tile" }, el("span", { class: "adm-tile__label" }, label), el("strong", {}, value), note ? el("small", {}, note) : null)
}

function renderTiles(subs, detailed) {
  const counts = { high: 0, mid: 0, low: 0 }
  for (const s of subs) counts[s.band] = (counts[s.band] || 0) + 1
  const mean = avg(detailed.map((s) => s.mean))
  const secs = subs.map((s) => s.seconds).filter((x) => x != null)
  const today = dayKey(new Date())
  $("tiles").replaceChildren(
    tile("Tổng lượt từ trước tới nay", String(data.stats.total), "gồm cả lượt cũ chỉ đếm theo mức"),
    tile("Lượt trong khoảng đã chọn", String(subs.length), `${detailed.length} lượt có lựa chọn chi tiết`),
    tile("Hôm nay", String(data.submissions.filter((s) => dayKey(new Date(s.at)) === today).length)),
    tile("Điểm EQ trung bình", mean == null ? "—" : String(Math.round(mean)), "trên 100, trung bình 5 đặc tính"),
    tile("Thời gian làm (trung vị)", fmtSec(median(secs))),
    tile(
      "Mức EQ cao",
      `${pct(counts.high, subs.length)}%`,
      `Cao ${counts.high} · Trung bình ${counts.mid} · Thấp ${counts.low}`,
    ),
  )
}

function bar(label, value, max, color, note) {
  return el(
    "div",
    { class: "adm-bar" },
    el("span", { class: "adm-bar__label" }, label),
    el("span", { class: "adm-bar__track" }, el("span", { class: "adm-bar__fill", style: `width:${pct(value, max)}%;background:${color}` })),
    el("span", { class: "adm-bar__value" }, note),
  )
}

function renderTraits(detailed) {
  if (!detailed.length) return $("traits").replaceChildren(el("p", { class: "adm-empty" }, "Chưa có lượt làm có chi tiết."))
  $("traits").replaceChildren(
    ...EQ_TRAITS.map((t) => {
      const v = avg(detailed.map((s) => s.traits[t.key]).filter((x) => x != null))
      return bar(t.name, v ?? 0, 100, t.color, v == null ? "—" : String(Math.round(v)))
    }),
  )
}

function renderDays(all) {
  const counts = new Map()
  for (const s of all) counts.set(dayKey(new Date(s.at)), (counts.get(dayKey(new Date(s.at))) || 0) + 1)
  const days = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push({ key: dayKey(d), label: `${d.getDate()}/${d.getMonth() + 1}`, n: counts.get(dayKey(d)) || 0 })
  }
  const max = Math.max(1, ...days.map((d) => d.n))
  $("days").replaceChildren(
    ...days.map((d) =>
      el(
        "div",
        { class: "adm-day", title: `${d.label}: ${d.n} lượt` },
        el("span", { class: "adm-day__n" }, d.n ? String(d.n) : ""),
        el("span", { class: "adm-day__col", style: `height:${pct(d.n, max)}%` }),
        el("span", { class: "adm-day__label" }, d.label),
      ),
    ),
  )
}

function renderQuestions(detailed) {
  $("questions").replaceChildren(
    ...QUEST_BANK.map((q) => {
      const picks = detailed.map((s) => s.answers?.[q.id]).filter(Boolean)
      const best = strongestChoice(q).id
      return el(
        "details",
        { class: "adm-q" },
        el("summary", {}, el("b", {}, q.id.replace("EQ_", "Câu ")), ` ${q.title} `, el("small", {}, `${picks.length} lượt`)),
        el("p", { class: "adm-q__ctx" }, q.context),
        ...q.choices.map((c) => {
          const n = picks.filter((id) => id === c.id).length
          return bar(`${c.code}${c.id === best ? " ★" : ""}`, n, picks.length, c.id === best ? "var(--mint)" : "var(--blue)", `${pct(n, picks.length)}% (${n})`)
        }),
        el("ol", { class: "adm-q__choices", type: "A" }, ...q.choices.map((c) => el("li", {}, c.text))),
      )
    }),
  )
}

function renderTable(subs) {
  const head = el(
    "thead",
    {},
    el("tr", {}, ["Thời điểm", "Thời gian", "Mức", "Điểm", ...EQ_TRAITS.map((t) => t.code), "Lựa chọn"].map((h) => el("th", { scope: "col" }, h))),
  )
  const rows = subs.slice(0, shown).map((s) =>
    el(
      "tr",
      {},
      el("td", {}, fmtTime(s.at)),
      el("td", {}, fmtSec(s.seconds)),
      el("td", {}, el("span", { class: `adm-band adm-band--${s.band}` }, BAND_LABEL[s.band] || s.band)),
      el("td", {}, s.mean == null ? "—" : String(s.mean)),
      ...EQ_TRAITS.map((t) => el("td", {}, s.traits ? String(s.traits[t.key]) : "—")),
      el(
        "td",
        { class: "adm-answers" },
        s.answers
          ? Object.entries(s.answers)
              .sort()
              .map(([q, c]) => `${q.replace("EQ_", "")}${c.slice(-1)}`)
              .join(" ")
          : "—",
      ),
    ),
  )
  $("subs").replaceChildren(head, el("tbody", {}, rows))
  $("subs-note").textContent = `${Math.min(shown, subs.length)} / ${subs.length} · mới nhất trước`
  $("more").hidden = shown >= subs.length
}

/* ------------------------------------------------------------------- xuất file */

function download(name, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const a = el("a", { href: url, download: name })
  document.body.append(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function toCsv(subs) {
  const cell = (v) => (v == null ? "" : /[",\n]/.test(String(v)) ? `"${String(v).replaceAll('"', '""')}"` : String(v))
  const cols = ["id", "at", "seconds", "band", "mean", "top", ...EQ_TRAITS.map((t) => t.key), ...QUEST_BANK.map((q) => q.id)]
  const lines = subs.map((s) =>
    [s.id, s.at, s.seconds, s.band, s.mean, s.top, ...EQ_TRAITS.map((t) => s.traits?.[t.key]), ...QUEST_BANK.map((q) => s.answers?.[q.id]?.slice(-1))]
      .map(cell)
      .join(","),
  )
  // BOM để Excel đọc đúng tiếng Việt.
  return "﻿" + [cols.join(","), ...lines].join("\n") + "\n"
}

const stamp = () => dayKey(new Date())

/* ------------------------------------------------------------------- sự kiện */

$("login").addEventListener("submit", (e) => {
  e.preventDefault()
  // base64 qua UTF-8 để tên/mật khẩu có dấu tiếng Việt vẫn gửi đúng.
  const bytes = new TextEncoder().encode(`${$("user").value.trim()}:${$("token").value}`)
  setToken(btoa(String.fromCharCode(...bytes)))
  $("token").value = ""
  load()
})
$("logout").addEventListener("click", () => {
  setToken("")
  data = null
  showLogin("")
})
$("refresh").addEventListener("click", () => load())
$("range").addEventListener("change", () => {
  shown = PAGE
  render()
})
$("more").addEventListener("click", () => {
  shown += PAGE
  renderTable(filtered())
})
$("csv").addEventListener("click", () => download(`equest-${stamp()}.csv`, toCsv(filtered()), "text/csv;charset=utf-8"))
$("json").addEventListener("click", () =>
  download(`equest-${stamp()}.json`, JSON.stringify({ ...data, submissions: filtered() }, null, 2), "application/json"),
)

load().catch((error) => showLogin(`Không tải được dữ liệu: ${error.message}`))
