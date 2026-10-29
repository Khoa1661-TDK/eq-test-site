/* admin.js — trang /admin: đọc /api/admin, tính tổng hợp ngay trên trình duyệt, xuất CSV/JSON.
   Lượt làm cũ (bản năm đặc tính) chưa có profile: được chấm lại từ các lựa chọn bằng cùng bộ chấm với trang chính;
   lượt chỉ có mức (không có lựa chọn) không quy được về profile nên chỉ tính vào tổng. */

import { QUEST_BANK } from "./data/questBank.js"
import { EQ_PROFILES, EQ_PROFILE_KEYS } from "./data/eqProfiles.js"
import { scoreQuestAnswers } from "./core/questScoring.js"

const TOKEN_KEY = "eq-admin-token"
const PAGE = 50
const PROFILE_COLORS = ["#e98aa8", "#e8b06a", "#8fc79a", "#8fa8e0", "#b79ae0", "#6fc7c7", "#e8896a", "#c9b458", "#9aa0b4", "#d98ad0"]
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

async function load() {
  const token = getToken()
  const res = await fetch("api/admin", { headers: token ? { Authorization: `Basic ${token}` } : {}, cache: "no-store" })
  if (res.status === 401) return showLogin(token ? "Sai tên đăng nhập hoặc mật khẩu." : "")
  const body = await res.json().catch(() => ({}))
  if (!res.ok) return showLogin(body.error || `Lỗi máy chủ (${res.status}).`)
  data = body
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

/** Profile kết quả của một lượt: có sẵn, hoặc chấm lại từ lựa chọn (lượt cũ); null nếu không có lựa chọn nào. */
function profileOf(s) {
  if (s.profile && EQ_PROFILES[s.profile]) return s.profile
  if (s.answers && Object.keys(s.answers).length) {
    const r = scoreQuestAnswers(s.answers, s.order)
    return r.answered ? r.top : null
  }
  return null
}

const profileName = (key) => (key && EQ_PROFILES[key] ? `${EQ_PROFILES[key].name} (${EQ_PROFILES[key].en.replace(/^The /, "")})` : "—")

/* ------------------------------------------------------------------- vẽ */

function render() {
  const subs = filtered()
  const detailed = subs.filter((s) => profileOf(s))
  $("storage").textContent = data.storage === "redis" ? "Kho: Upstash Redis" : "Kho: file trên máy"
  renderTiles(subs, detailed)
  renderProfiles(detailed)
  renderDays(data.submissions)
  renderQuestions(detailed)
  renderTable(subs)
}

function tile(label, value, note) {
  return el("div", { class: "adm-tile" }, el("span", { class: "adm-tile__label" }, label), el("strong", {}, value), note ? el("small", {}, note) : null)
}

function renderTiles(subs, detailed) {
  const secs = subs.map((s) => s.seconds).filter((x) => x != null)
  const today = dayKey(new Date())
  const tally = {}
  for (const s of detailed) tally[profileOf(s)] = (tally[profileOf(s)] || 0) + 1
  const topKey = Object.keys(tally).sort((a, b) => tally[b] - tally[a])[0]
  $("tiles").replaceChildren(
    tile("Tổng lượt từ trước tới nay", String(data.stats.total), "gồm cả lượt cũ chỉ đếm theo mức"),
    tile("Lượt trong khoảng đã chọn", String(subs.length), `${detailed.length} lượt có lựa chọn chi tiết`),
    tile("Hôm nay", String(data.submissions.filter((s) => dayKey(new Date(s.at)) === today).length)),
    tile("Thời gian làm (trung vị)", fmtSec(median(secs))),
    tile("Profile phổ biến nhất", topKey ? EQ_PROFILES[topKey].name : "—", topKey ? `${tally[topKey]} lượt · ${pct(tally[topKey], detailed.length)}%` : "chưa có dữ liệu"),
    tile("Lượt chưa quy được profile", String(subs.length - detailed.length), "lượt cũ chỉ có mức, không có lựa chọn"),
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

function renderProfiles(detailed) {
  if (!detailed.length) return $("profiles").replaceChildren(el("p", { class: "adm-empty" }, "Chưa có lượt làm có chi tiết."))
  const tally = Object.fromEntries(EQ_PROFILE_KEYS.map((k) => [k, 0]))
  for (const s of detailed) tally[profileOf(s)] += 1
  const max = Math.max(1, ...Object.values(tally))
  $("profiles").replaceChildren(
    ...EQ_PROFILE_KEYS.map((k, i) => bar(EQ_PROFILES[k].name, tally[k], max, PROFILE_COLORS[i % PROFILE_COLORS.length], `${tally[k]} · ${pct(tally[k], detailed.length)}%`)),
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
      return el(
        "details",
        { class: "adm-q" },
        el("summary", {}, el("b", {}, q.id.replace("EQ_", "Câu ")), ` ${q.title} `, el("small", {}, `${picks.length} lượt`)),
        el("p", { class: "adm-q__ctx" }, q.context),
        ...q.choices.map((c, i) => {
          const n = picks.filter((id) => id === c.id).length
          return bar(c.code, n, picks.length, PROFILE_COLORS[EQ_PROFILE_KEYS.indexOf(c.profile) % PROFILE_COLORS.length], `${pct(n, picks.length)}% (${n})`)
        }),
        el(
          "ol",
          { class: "adm-q__choices", type: "A" },
          ...q.choices.map((c) => el("li", {}, c.text, el("span", { class: "adm-q__profile" }, ` → ${profileName(c.profile)}`))),
        ),
      )
    }),
  )
}

function renderTable(subs) {
  const head = el(
    "thead",
    {},
    el("tr", {}, ["Thời điểm", "Thời gian", "Profile", "Lựa chọn"].map((h) => el("th", { scope: "col" }, h))),
  )
  const rows = subs.slice(0, shown).map((s) => {
    const key = profileOf(s)
    return el(
      "tr",
      {},
      el("td", {}, fmtTime(s.at)),
      el("td", {}, fmtSec(s.seconds)),
      el("td", {}, key ? el("span", { class: "adm-profile", style: `border-left-color:${PROFILE_COLORS[EQ_PROFILE_KEYS.indexOf(key) % PROFILE_COLORS.length]}` }, profileName(key)) : "—"),
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
    )
  })
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
  const cols = ["id", "at", "seconds", "profile", ...EQ_PROFILE_KEYS.map((k) => `votes_${k}`), ...QUEST_BANK.map((q) => q.id)]
  const lines = subs.map((s) => {
    const key = profileOf(s)
    const counts = s.counts ?? (s.answers ? scoreQuestAnswers(s.answers, s.order).counts : null)
    return [s.id, s.at, s.seconds, key, ...EQ_PROFILE_KEYS.map((k) => counts?.[k]), ...QUEST_BANK.map((q) => s.answers?.[q.id]?.slice(-1))].map(cell).join(",")
  })
  // BOM để Excel đọc đúng tiếng Việt.
  return "\ufeff" + [cols.join(","), ...lines].join("\n") + "\n"
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
