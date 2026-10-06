/**
 * Chấm điểm EQ — mô hình sáu kỹ năng (eq6-v1).
 *
 * Mỗi tình huống (chữ hoặc cảnh động) đo một kỹ năng CHÍNH với trọng số 1 và một
 * đến hai kỹ năng PHỤ với trọng số 0,5. Mỗi phương án có 0–3 điểm cho từng kỹ năng
 * được đo. Trần điểm của một tình huống là điểm của phương án mạnh nhất (không phải
 * 3 cố định), và dữ liệu bắt buộc có một phương án mạnh nhất trên MỌI kỹ năng được đo
 * — nên chọn đúng hết thì mọi kỹ năng và điểm tổng đều đúng 100.
 *
 *   điểm kỹ năng k = 100 × Σ(trọng số × điểm đạt) / Σ(trọng số × trần)
 *
 * Chỉ tính những tình huống đã trả lời. Một kỹ năng cần ít nhất EVIDENCE_FLOOR tình
 * huống chính đã trả lời mới có điểm; thiếu thì hiện "chưa đủ dữ liệu".
 * Điểm tổng là trung bình cộng các kỹ năng đã có điểm và KHÔNG có nhãn riêng.
 *
 * ĐÂY KHÔNG PHẢI là một thang đo đã được kiểm định tâm lý. Đây là công cụ học tập:
 * điểm phản ánh mức hiệu quả của chiến lược đã chọn trong từng tình huống,
 * không phải bạn là người thế nào.
 */

import { EQ_DIMENSIONS, EQ_BY_KEY } from "../data/eqDimensions.js"
import { EQ_PATTERNS } from "../data/eqPatterns.js"
import { SCENARIOS } from "../data/scenarios.js"
import { SCENE_SCENARIOS } from "../data/sceneScenarios.js"
import { FORMS, FORM_ORDER, PRACTICE_IDS } from "../data/forms.js"

export const MODEL_VERSION = "eq6-v1"
export const MAX_CHOICE_SCORE = 3
export const PRIMARY_WEIGHT = 1
export const SECONDARY_WEIGHT = 0.5
export const BAND_HIGH = 70
export const BAND_MID = 45
export const EVIDENCE_FLOOR = 3
export const CHANGE_THRESHOLD = 10
export const STRENGTH_MIN = 55
export const STRENGTH_ABOVE_MEAN = 8
export const PATTERN_MIN_PICKS = 3
export const PATTERN_MIN_SHARE = 0.4
/** Gợi ý (không khoá) trước khi đánh giá lại. */
export const RETAKE_WAIT_DAYS = 7
export const RETAKE_PRACTICE_REPS = 6

export const SKILL_KEYS = EQ_DIMENSIONS.map((d) => d.key)

/* ------------------------------------------------------- ngân hàng tình huống */

export const ITEMS = [
  ...SCENARIOS.map((s) => ({ ...s, kind: "text" })),
  ...SCENE_SCENARIOS.map((s) => ({ ...s, kind: "scene" })),
]
export const ITEM_BY_ID = Object.fromEntries(ITEMS.map((item) => [item.id, item]))

export { FORMS, FORM_ORDER, PRACTICE_IDS }

export function formIds(form) {
  return FORMS[form] ?? FORMS[FORM_ORDER[0]]
}

/** Số tình huống của một lượt đánh giá (mỗi đề có cùng độ dài). */
export const TOTAL_SCENARIOS = formIds(FORM_ORDER[0]).length

/** Trọng số các kỹ năng mà tình huống đo. Cảnh cũ chưa khai báo thì suy ra từ domain. */
export function weightsOf(item) {
  if (item?.weights && typeof item.weights === "object") return item.weights
  const keys = Object.keys(item?.choices?.[0]?.scores ?? {})
  return Object.fromEntries(
    keys.map((key) => [key, !item.domain || key === item.domain ? PRIMARY_WEIGHT : SECONDARY_WEIGHT]),
  )
}

export function measuredKeys(item) {
  return Object.keys(weightsOf(item))
}

/** Trần điểm của một kỹ năng trong tình huống: điểm cao nhất mà một phương án đạt được. */
export function ceilingOf(item, key) {
  return Math.max(...item.choices.map((choice) => Number(choice.scores?.[key] ?? 0)))
}

export function weightedPoints(item, choice) {
  return Object.entries(weightsOf(item)).reduce((sum, [key, w]) => sum + w * Number(choice.scores?.[key] ?? 0), 0)
}

/** Phương án mạnh nhất: đạt trần trên mọi kỹ năng được đo (dữ liệu bảo đảm có). */
export function strongestChoice(item) {
  return item.choices.reduce((best, choice) => (weightedPoints(item, choice) > weightedPoints(item, best) ? choice : best))
}

function chosenFor(item, answers) {
  const id = answers?.[item.id]
  return id ? item.choices.find((choice) => choice.id === id) ?? null : null
}

/* ------------------------------------------------------------------ mức điểm */

export function levelFor(score) {
  if (score === null || score === undefined) return null
  if (score >= BAND_HIGH) return "high"
  if (score >= BAND_MID) return "mid"
  return "low"
}

export function bandFor(key, score) {
  const dim = EQ_BY_KEY[key]
  const level = levelFor(score)
  if (!dim || !level) return null
  return { level, ...dim.bands[level] }
}

/* ------------------------------------------------------------------- chấm bài */

/**
 * @param {Record<string,string>} answers  mã tình huống → mã phương án
 * @param {string[]} ids  các tình huống của lượt làm (mặc định: đề A)
 */
export function scoreAnswers(answers = {}, ids = formIds(FORM_ORDER[0])) {
  const items = ids.map((id) => ITEM_BY_ID[id]).filter(Boolean)
  const acc = Object.fromEntries(
    SKILL_KEYS.map((key) => [key, { earned: 0, possible: 0, primary: 0, measured: 0, moments: [] }]),
  )
  const patternStats = {}
  let answered = 0

  for (const item of items) {
    const choice = chosenFor(item, answers)
    if (!choice) continue
    answered += 1
    if (acc[item.domain]) acc[item.domain].primary += 1

    const strongest = strongestChoice(item)
    for (const [key, weight] of Object.entries(weightsOf(item))) {
      const slot = acc[key]
      if (!slot) continue
      const ceiling = ceilingOf(item, key)
      const got = Number(choice.scores?.[key] ?? 0)
      slot.earned += weight * got
      slot.possible += weight * ceiling
      slot.measured += 1
      slot.moments.push({ item, choice, strongest, weight, got, ceiling, lost: weight * (ceiling - got) })
    }

    const available = new Set(item.choices.map((c) => c.pattern).filter((p) => EQ_PATTERNS[p]))
    for (const pattern of available) {
      patternStats[pattern] ??= { picks: 0, available: 0, moments: [] }
      patternStats[pattern].available += 1
    }
    if (EQ_PATTERNS[choice.pattern]) {
      patternStats[choice.pattern].picks += 1
      patternStats[choice.pattern].moments.push({ item, choice, strongest })
    }
  }

  const dimensions = EQ_DIMENSIONS.map((dim) => {
    const slot = acc[dim.key]
    const enough = slot.possible > 0 && slot.primary >= EVIDENCE_FLOOR
    const score = enough ? Math.round((slot.earned / slot.possible) * 100) : null
    const missed = slot.moments.filter((m) => m.lost > 0).sort((a, b) => b.lost - a.lost || b.weight - a.weight)
    const nailed = slot.moments.filter((m) => m.got === m.ceiling).sort((a, b) => b.weight - a.weight)
    return {
      key: dim.key,
      code: dim.code,
      name: dim.name,
      tagline: dim.tagline,
      earned: slot.earned,
      possible: slot.possible,
      score,
      enough,
      level: levelFor(score),
      band: bandFor(dim.key, score),
      primaryAnswered: slot.primary,
      measured: slot.measured,
      evidence: { missed: missed.slice(0, 2), nailed: nailed.slice(0, 2) },
    }
  })

  const scored = dimensions.filter((d) => d.enough)
  const mean = scored.length ? scored.reduce((sum, d) => sum + d.score, 0) / scored.length : 0
  const overall = Math.round(mean)

  // Thấp → cao; cùng điểm thì kỹ năng có nhiều bằng chứng hơn đứng trước (kết luận chắc hơn).
  const ranked = [...scored].sort((a, b) => a.score - b.score || b.primaryAnswered - a.primaryAnswered)

  const clear = [...scored]
    .filter((d) => d.score >= STRENGTH_MIN && d.score >= mean + STRENGTH_ABOVE_MEAN)
    .sort((a, b) => b.score - a.score || b.primaryAnswered - a.primaryAnswered)
    .slice(0, 2)
  const strengths = clear.length ? clear : ranked.slice(-1)
  const strengthMode = clear.length ? "clear" : "relative"

  const strengthKeys = new Set(strengths.map((d) => d.key))
  const rest = ranked.filter((d) => !strengthKeys.has(d.key))
  // Hai kỹ năng thấp nhất là trọng tâm luyện; các kỹ năng khác vẫn có bài tập ở bảng sáu kỹ năng.
  const growth = rest.slice(0, 2)

  const patterns = Object.entries(patternStats)
    .filter(([, s]) => s.picks >= PATTERN_MIN_PICKS && s.picks / s.available >= PATTERN_MIN_SHARE)
    .map(([key, s]) => ({ key, ...EQ_PATTERNS[key], picks: s.picks, available: s.available, moments: s.moments }))
    .sort((a, b) => Number(a.effective) - Number(b.effective) || b.picks - a.picks)
    .slice(0, 2)

  return {
    modelVersion: MODEL_VERSION,
    overall,
    // Chỉ dùng cho thống kê ẩn danh; giao diện không gắn nhãn cho điểm tổng.
    overallLevel: levelFor(overall) ?? "low",
    dimensions,
    ranked,
    strengths,
    strengthMode,
    growth,
    strongest: strengths[0] ?? null,
    weakest: growth[0] ?? null,
    patterns,
    answered,
    total: items.length,
    complete: items.length > 0 && answered === items.length,
  }
}

/** So sánh hai lần đánh giá: chỉ gọi là thay đổi khi lệch từ CHANGE_THRESHOLD điểm trở lên. */
export function compareResults(before, after) {
  return EQ_DIMENSIONS.map((dim) => {
    const b = before?.dimensions.find((d) => d.key === dim.key)?.score ?? null
    const a = after?.dimensions.find((d) => d.key === dim.key)?.score ?? null
    const delta = a !== null && b !== null ? a - b : null
    let change = null
    if (delta !== null) change = delta >= CHANGE_THRESHOLD ? "improved" : delta <= -CHANGE_THRESHOLD ? "dipped" : "steady"
    return { key: dim.key, name: dim.name, code: dim.code, before: b, after: a, delta, change }
  })
}

/* ------------------------------------------------------------------ xáo thứ tự */

export function shuffleIds(ids) {
  const out = [...ids]
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** Giữ tên cũ cho các màn hình đang dùng: thứ tự một lượt làm đề. */
export function shuffleScenarios(form = FORM_ORDER[0]) {
  return shuffleIds(formIds(form))
}

/* ------------------------------------------------------------------- lưu trữ */

export const HISTORY_KEY = "eq_history_v1"
export const PRACTICE_KEY = "eq_practice_v2"
const LEGACY_ASSESSMENT_KEY = "eq_assessment_v1"
const LEGACY_PRACTICE_KEY = "eq_practice_v1"
const MAX_ATTEMPTS = 50
const MAX_REPS = 500

function store(kind) {
  try {
    return kind === "session" ? globalThis.sessionStorage ?? null : globalThis.localStorage ?? null
  } catch {
    return null
  }
}

function readJSON(kind, key) {
  try {
    const raw = store(kind)?.getItem(key)
    const value = raw ? JSON.parse(raw) : null
    return value && typeof value === "object" ? value : null
  } catch {
    return null
  }
}

function writeJSON(kind, key, value) {
  try {
    store(kind)?.setItem(key, JSON.stringify(value))
  } catch {
    /* trình duyệt chặn lưu trữ: bài làm vẫn chạy trong phiên hiện tại */
  }
}

function removeKey(kind, key) {
  try {
    store(kind)?.removeItem(key)
  } catch {
    /* bỏ qua */
  }
}

/** Chỉ giữ câu trả lời khớp một phương án thật của tình huống trong danh sách. */
export function pruneAnswers(answers = {}, ids = null) {
  const allowed = ids ? new Set(ids) : null
  const clean = {}
  for (const [id, choiceId] of Object.entries(answers ?? {})) {
    if (allowed && !allowed.has(id)) continue
    if (ITEM_BY_ID[id]?.choices.some((c) => c.id === choiceId)) clean[id] = choiceId
  }
  return clean
}

function cleanOrder(order, form) {
  const ids = new Set(formIds(form))
  const list = Array.isArray(order) ? order.filter((id) => ids.has(id)) : []
  return list.length === ids.size ? list : null
}

function cleanAttempt(raw) {
  if (!raw || typeof raw !== "object") return null
  const form = FORMS[raw.form] ? raw.form : FORM_ORDER[0]
  const order = Array.isArray(raw.order) ? raw.order.filter((id) => ITEM_BY_ID[id]) : formIds(form)
  const answers = pruneAnswers(raw.answers, order)
  if (!Object.keys(answers).length) return null
  return {
    id: String(raw.id ?? raw.finishedAt ?? Date.now()),
    form,
    modelVersion: String(raw.modelVersion ?? MODEL_VERSION),
    startedAt: Number(raw.startedAt) || null,
    finishedAt: Number(raw.finishedAt) || null,
    order,
    answers,
  }
}

function cleanCurrent(raw) {
  if (!raw || typeof raw !== "object") return null
  const form = FORMS[raw.form] ? raw.form : FORM_ORDER[0]
  return {
    form,
    order: cleanOrder(raw.order, form),
    answers: pruneAnswers(raw.answers, formIds(form)),
    index: Math.max(0, Number(raw.index) || 0),
    startedAt: Number(raw.startedAt) || null,
  }
}

/** Đọc lịch sử; lần đầu thì chuyển bài đang làm dở từ sessionStorage cũ sang. */
export function loadHistory() {
  const saved = readJSON("local", HISTORY_KEY)
  if (saved) {
    return {
      attempts: (Array.isArray(saved.attempts) ? saved.attempts : []).map(cleanAttempt).filter(Boolean),
      current: cleanCurrent(saved.current),
    }
  }
  const history = { attempts: [], current: null }
  const legacy = readJSON("session", LEGACY_ASSESSMENT_KEY)
  if (legacy?.answers && Object.keys(legacy.answers).length) {
    history.current = cleanCurrent({ form: FORM_ORDER[0], answers: legacy.answers, order: legacy.order, index: legacy.index })
    saveHistory(history)
    removeKey("session", LEGACY_ASSESSMENT_KEY)
  }
  return history
}

export function saveHistory(history) {
  writeJSON("local", HISTORY_KEY, {
    attempts: history.attempts.slice(-MAX_ATTEMPTS),
    current: history.current ?? null,
  })
}

/** Đề cho lượt kế tiếp: luân phiên A → B → A … theo lần hoàn thành gần nhất. */
export function nextForm(history = loadHistory()) {
  const last = history.attempts.at(-1)
  if (!last) return FORM_ORDER[0]
  return FORM_ORDER[(FORM_ORDER.indexOf(last.form) + 1) % FORM_ORDER.length]
}

/** Bài đang làm dở (hoặc một bài mới trên đề kế tiếp). */
export function loadAssessment() {
  const history = loadHistory()
  if (history.current) return history.current
  return { form: nextForm(history), order: null, answers: {}, index: 0, startedAt: null }
}

export function saveAssessment(current) {
  const history = loadHistory()
  history.current = cleanCurrent(current)
  saveHistory(history)
}

export function clearAssessment() {
  const history = loadHistory()
  history.current = null
  saveHistory(history)
}

/** Chốt bài đang làm thành một lần đánh giá trong lịch sử. */
export function finishAttempt(now = Date.now()) {
  const history = loadHistory()
  const current = history.current
  if (!current) return null
  const order = current.order ?? formIds(current.form)
  const attempt = cleanAttempt({
    id: String(now),
    form: current.form,
    modelVersion: MODEL_VERSION,
    startedAt: current.startedAt,
    finishedAt: now,
    order,
    answers: current.answers,
  })
  if (!attempt) return null
  history.attempts.push(attempt)
  history.current = null
  saveHistory(history)
  return attempt
}

/** Chấm lại một lần đánh giá từ câu trả lời gốc, với mô hình hiện tại. */
export function scoreAttempt(attempt) {
  return attempt ? scoreAnswers(attempt.answers, attempt.order) : null
}

export function attempts() {
  return loadHistory().attempts
}

export function latestAttempt() {
  return attempts().at(-1) ?? null
}

export function previousAttempt() {
  return attempts().at(-2) ?? null
}

export function hasResult() {
  return attempts().length > 0
}

/* ------------------------------------------------------------------ luyện tập */

export function loadPractice() {
  const saved = readJSON("local", PRACTICE_KEY)
  const reps = Array.isArray(saved?.reps)
    ? saved.reps.filter((r) => ITEM_BY_ID[r?.id] && typeof r.choiceId === "string")
    : []
  const answers = {}
  for (const rep of reps) answers[rep.id] = rep.choiceId
  if (!saved) {
    // Bản cũ chỉ có bảng { mã tình huống: mã phương án } trong sessionStorage.
    const legacy = readJSON("session", LEGACY_PRACTICE_KEY)
    Object.assign(answers, pruneAnswers(legacy?.answers))
  }
  return { reps, answers }
}

/** Ghi một lượt luyện. Luyện tập không bao giờ làm thay đổi điểm đánh giá. */
export function recordPractice(itemId, choiceId, now = Date.now()) {
  const item = ITEM_BY_ID[itemId]
  const choice = item?.choices.find((c) => c.id === choiceId)
  if (!choice) return null
  const { reps } = loadPractice()
  const rep = { id: itemId, skill: item.domain, choiceId, strongest: strongestChoice(item).id === choiceId, at: now }
  reps.push(rep)
  writeJSON("local", PRACTICE_KEY, { reps: reps.slice(-MAX_REPS) })
  return rep
}

/** Giữ API cũ của màn luyện tập: ghi lại các câu mới trong bảng trả lời. */
export function savePractice(answers = {}) {
  const known = loadPractice().answers
  for (const [id, choiceId] of Object.entries(answers)) {
    if (known[id] !== choiceId) recordPractice(id, choiceId)
  }
}

/** Số lượt luyện theo kỹ năng kể từ một thời điểm (mặc định: lần đánh giá gần nhất). */
export function practiceSince(since = latestAttempt()?.finishedAt ?? 0) {
  const out = Object.fromEntries(SKILL_KEYS.map((key) => [key, { practised: 0, choseStrongest: 0 }]))
  for (const rep of loadPractice().reps) {
    if (rep.at < since || !out[rep.skill]) continue
    out[rep.skill].practised += 1
    if (rep.strongest) out[rep.skill].choseStrongest += 1
  }
  return out
}

/** Hàng đợi luyện cho một kỹ năng: đúng kỹ năng chính, có mẫu chiến lược hay lặp lại, chưa luyện trước. */
export function practiceQueue(skill, { patterns = [] } = {}) {
  const pool = PRACTICE_IDS.map((id) => ITEM_BY_ID[id]).filter(Boolean)
  const done = loadPractice().answers
  const wanted = new Set(patterns)
  const rank = (item) => [
    skill && item.domain !== skill ? 1 : 0,
    item.choices.some((c) => wanted.has(c.pattern)) ? 0 : 1,
    done[item.id] ? 1 : 0,
  ]
  return pool
    .filter((item) => !skill || measuredKeys(item).includes(skill))
    .sort((a, b) => {
      const ra = rank(a)
      const rb = rank(b)
      for (let i = 0; i < ra.length; i += 1) if (ra[i] !== rb[i]) return ra[i] - rb[i]
      return 0
    })
}

/** Xoá toàn bộ dữ liệu đã lưu trên máy này. */
export function clearAllData() {
  removeKey("local", HISTORY_KEY)
  removeKey("local", PRACTICE_KEY)
  removeKey("session", LEGACY_ASSESSMENT_KEY)
  removeKey("session", LEGACY_PRACTICE_KEY)
}
