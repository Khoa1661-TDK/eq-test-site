/**
 * Chấm điểm EQ.
 *
 * Cách chấm: mỗi phương án mang điểm "tính hiệu quả" 0–3 cho từng chiều mà tình huống đo.
 * Mọi phương án trong cùng một tình huống mang cùng tập chiều, nên điểm tối đa của một chiều
 * là 3 × (số tình huống đo chiều đó) — công bằng với mọi lựa chọn.
 *
 * Điểm phần trăm của một chiều = điểm đạt được / điểm tối đa của chính người đó.
 * Điểm tổng = tổng điểm đạt / tổng điểm tối đa.
 *
 * ĐÂY KHÔNG PHẢI là một thang đo đã được kiểm định tâm lý. Đây là công cụ học tập:
 * bài làm càng nhất quán với các chiến lược được xem là hiệu quả thì điểm càng cao.
 */

import { EQ_DIMENSIONS, EQ_BY_KEY } from "../data/eqDimensions.js"
import { SCENARIOS, SCENARIO_BY_ID, EQ_DOMAIN_ORDER } from "../data/scenarios.js"

export const MAX_CHOICE_SCORE = 3
export const BAND_HIGH = 70
export const BAND_MID = 45

export const TOTAL_SCENARIOS = SCENARIOS.length

/** Thứ tự tình huống của một phiên làm bài: xáo một lần rồi giữ nguyên cho tới khi làm lại. */
export function shuffleScenarios() {
  const ids = SCENARIOS.map((s) => s.id)
  for (let i = ids.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    const swap = ids[i]
    ids[i] = ids[j]
    ids[j] = swap
  }
  return ids
}

export const ASSESSMENT_KEY = "eq_assessment_v1"
export const PRACTICE_KEY = "eq_practice_v1"

/** Các chiều mà một tình huống đo được (mọi phương án dùng cùng tập khoá). */
export function measuredKeys(scenario) {
  return Object.keys(scenario.choices[0].scores)
}

/** Điểm tối đa mỗi chiều nếu người làm trả lời hết mọi tình huống. */
export function maxPointsByDimension() {
  const max = Object.fromEntries(EQ_DOMAIN_ORDER.map((key) => [key, 0]))
  for (const scenario of SCENARIOS) {
    for (const key of measuredKeys(scenario)) max[key] += MAX_CHOICE_SCORE
  }
  return max
}

export function levelFor(score) {
  if (score >= BAND_HIGH) return "high"
  if (score >= BAND_MID) return "mid"
  return "low"
}

export function bandFor(key, score) {
  const dim = EQ_BY_KEY[key]
  if (!dim) return null
  return { level: levelFor(score), ...dim.bands[levelFor(score)] }
}

/**
 * @param {Record<string, string>} answers  mã tình huống → mã phương án
 * @returns {{ overall:number, dimensions:Array, ranked:Array, strongest:Object|null,
 *             weakest:Object|null, answered:number, total:number, complete:boolean }}
 */
export function scoreAnswers(answers = {}) {
  const totals = Object.fromEntries(EQ_DOMAIN_ORDER.map((key) => [key, { earned: 0, possible: 0 }]))

  for (const scenario of SCENARIOS) {
    const keys = measuredKeys(scenario)
    const choiceId = answers[scenario.id]
    const choice = choiceId ? scenario.choices.find((c) => c.id === choiceId) : null
    for (const key of keys) {
      totals[key].possible += MAX_CHOICE_SCORE
      if (choice) totals[key].earned += Number(choice.scores[key] || 0)
    }
  }

  const dimensions = EQ_DIMENSIONS.map((dim) => {
    const { earned, possible } = totals[dim.key]
    const score = possible ? Math.round((earned / possible) * 100) : 0
    return {
      key: dim.key,
      code: dim.code,
      name: dim.name,
      tagline: dim.tagline,
      earned,
      possible,
      score,
      level: levelFor(score),
      band: bandFor(dim.key, score),
    }
  })

  const earnedAll = dimensions.reduce((sum, d) => sum + d.earned, 0)
  const possibleAll = dimensions.reduce((sum, d) => sum + d.possible, 0)
  const overall = possibleAll ? Math.round((earnedAll / possibleAll) * 100) : 0

  // Chỉ đếm những câu trả lời thực sự khớp một phương án của chính tình huống
  // đó: một id cũ/mã lạ còn sót trong sessionStorage không được tính là đã làm.
  const answered = SCENARIOS.filter((s) => s.choices.some((c) => c.id === answers[s.id])).length
  const byScore = [...dimensions].sort((a, b) => a.score - b.score)
  const lowest = byScore[0] || null
  const highest = byScore[byScore.length - 1] || null

  return {
    overall,
    overallLevel: levelFor(overall),
    dimensions,
    ranked: byScore,
    weakest: lowest,
    strongest: highest,
    improvement: byScore.slice(0, 2),
    answered,
    total: SCENARIOS.length,
    complete: answered === SCENARIOS.length,
  }
}

/* ----------------------------------------------------------- lưu trữ tạm */

function readStore(store, key) {
  try {
    const raw = store.getItem(key)
    const value = raw ? JSON.parse(raw) : null
    return value && typeof value === "object" ? value : {}
  } catch {
    return {}
  }
}

function writeStore(store, key, value) {
  try {
    store.setItem(key, JSON.stringify(value))
  } catch {
    /* trình duyệt chặn lưu trữ: bài làm vẫn chạy trong phiên hiện tại */
  }
}

export function loadAssessment() {
  const saved = readStore(sessionStorage, ASSESSMENT_KEY)
  const answers = saved.answers && typeof saved.answers === "object" ? saved.answers : {}
  const savedOrder = Array.isArray(saved.order) ? saved.order.filter((id) => SCENARIO_BY_ID[id]) : []
  const order = savedOrder.length === SCENARIOS.length ? savedOrder : null
  return { index: Number(saved.index) || 0, answers, order }
}

export function saveAssessment(answers, index, order = null) {
  const saved = readStore(sessionStorage, ASSESSMENT_KEY)
  writeStore(sessionStorage, ASSESSMENT_KEY, { answers, index, order: order ?? saved.order ?? null })
}

/** Loại bỏ mã tình huống không còn tồn tại (dữ liệu cũ trong sessionStorage). */
export function pruneAnswers(answers = {}) {
  const clean = {}
  for (const [id, choiceId] of Object.entries(answers)) {
    const scenario = SCENARIO_BY_ID[id]
    if (scenario?.choices.some((c) => c.id === choiceId)) clean[id] = choiceId
  }
  return clean
}

export function clearAssessment() {
  try {
    sessionStorage.removeItem(ASSESSMENT_KEY)
  } catch {
    /* bỏ qua */
  }
}

export function hasResult() {
  const { answers } = loadAssessment()
  return SCENARIOS.some((s) => answers[s.id])
}

export function loadPractice() {
  const saved = readStore(sessionStorage, PRACTICE_KEY)
  return saved.answers && typeof saved.answers === "object" ? { answers: saved.answers } : { answers: {} }
}

export function savePractice(answers) {
  writeStore(sessionStorage, PRACTICE_KEY, { answers })
}
