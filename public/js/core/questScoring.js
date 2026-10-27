/**
 * Chấm điểm E-Quest — năm thành phần EQ (data/eqTraits.js), bộ 20 tình huống (data/questBank.js).
 *
 * Mỗi lượt làm rút 10 tình huống: mỗi thành phần đúng 2 tình huống chính, xáo thứ tự.
 * Mỗi tình huống đo một thành phần CHÍNH (trọng số 1) và một thành phần PHỤ (0,5);
 * mỗi phương án có 0–3 điểm cho từng thành phần được đo. Trần điểm của một tình huống
 * cho từng thành phần là điểm cao nhất trong bốn phương án (có câu không phương án nào
 * đạt 3), nên chọn phương án tốt nhất ở mọi câu thì mọi thành phần đều đúng 100.
 *
 *   điểm thành phần k = 100 × Σ(trọng số × điểm đạt) / Σ(trọng số × trần)
 *
 * ĐÂY KHÔNG PHẢI là một thang đo đã được kiểm định tâm lý: điểm phản ánh lựa chọn trong
 * 10 tình huống của lượt làm này, không phải bạn là người thế nào.
 *
 * Lịch sử lưu ở localStorage (khóa riêng, tách khỏi bài đánh giá sáu kỹ năng cũ).
 */

import { EQ_TRAITS, EQ_TRAIT_BY_KEY, EQ_TRAIT_KEYS } from "../data/eqTraits.js"
import { QUEST_BANK } from "../data/questBank.js"

export const QUEST_MODEL = "equest5-v1"
export const PER_TRAIT = 2
export const QUEST_LENGTH = PER_TRAIT * EQ_TRAITS.length

export const QUEST_BY_ID = Object.fromEntries(QUEST_BANK.map((q) => [q.id, q]))

const STORE_KEY = "equest_history_v1"
const MAX_ATTEMPTS = 50

/* ------------------------------------------------------------------ rút đề */

function shuffle(list, rand = Math.random) {
  const out = [...list]
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** 10 mã tình huống: mỗi thành phần PER_TRAIT tình huống chính, rồi xáo cả bộ. */
export function drawQuest(rand = Math.random) {
  const picked = []
  for (const key of EQ_TRAIT_KEYS) {
    const pool = QUEST_BANK.filter((q) => q.trait === key).map((q) => q.id)
    picked.push(...shuffle(pool, rand).slice(0, PER_TRAIT))
  }
  return shuffle(picked, rand)
}

/* ------------------------------------------------------------------ chấm điểm */

function ceilingOf(item, key) {
  return Math.max(...item.choices.map((c) => c.scores[key] ?? 0))
}

/**
 * Chấm một bộ câu trả lời { [mãTìnhHuống]: mãPhươngÁn }.
 * Trả về { answered, traits: [{ key, name, en, color, summary, score }], ranked, top, strengths, toGrow }.
 */
export function scoreQuestAnswers(answers = {}) {
  const got = Object.fromEntries(EQ_TRAIT_KEYS.map((k) => [k, 0]))
  const max = Object.fromEntries(EQ_TRAIT_KEYS.map((k) => [k, 0]))
  let answered = 0
  for (const [id, choiceId] of Object.entries(answers)) {
    const item = QUEST_BY_ID[id]
    const choice = item?.choices.find((c) => c.id === choiceId)
    if (!choice) continue
    answered += 1
    for (const [key, weight] of Object.entries(item.weights)) {
      if (!(key in got)) continue
      got[key] += weight * (choice.scores[key] ?? 0)
      max[key] += weight * ceilingOf(item, key)
    }
  }
  const traits = EQ_TRAITS.map((t) => ({ ...t, score: max[t.key] ? Math.round((100 * got[t.key]) / max[t.key]) : 0 }))
  // Sắp xếp ổn định: hoà điểm thì giữ thứ tự của EQ_TRAITS.
  const ranked = [...traits].sort((a, b) => b.score - a.score)
  return {
    answered,
    traits,
    ranked,
    top: ranked[0]?.key ?? EQ_TRAIT_KEYS[0],
    strengths: ranked.slice(0, 2).map((t) => t.key),
    toGrow: ranked.slice(-2).reverse().map((t) => t.key),
  }
}

export function scoreQuest(attempt) {
  return attempt ? scoreQuestAnswers(attempt.answers) : null
}

export const traitName = (key) => EQ_TRAIT_BY_KEY[key]?.name ?? key

/* ------------------------------------------------------------------- lưu trữ */

function storage() {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

function cleanAnswers(answers, order) {
  const clean = {}
  for (const id of order) {
    const choiceId = answers?.[id]
    if (QUEST_BY_ID[id]?.choices.some((c) => c.id === choiceId)) clean[id] = choiceId
  }
  return clean
}

function cleanOrder(order) {
  const list = Array.isArray(order) ? order.filter((id) => QUEST_BY_ID[id]) : []
  return list.length === QUEST_LENGTH ? list : null
}

function load() {
  let saved = null
  try {
    saved = JSON.parse(storage()?.getItem(STORE_KEY) ?? "null")
  } catch {
    saved = null
  }
  const attempts = (Array.isArray(saved?.attempts) ? saved.attempts : [])
    .map((a) => {
      const order = cleanOrder(a?.order)
      if (!order) return null
      const answers = cleanAnswers(a.answers, order)
      if (Object.keys(answers).length !== order.length) return null
      return { id: String(a.id ?? a.finishedAt), startedAt: Number(a.startedAt) || null, finishedAt: Number(a.finishedAt) || null, order, answers }
    })
    .filter(Boolean)
  const order = cleanOrder(saved?.current?.order)
  const current = order
    ? {
        order,
        answers: cleanAnswers(saved.current.answers, order),
        index: Math.min(Math.max(0, Number(saved.current.index) || 0), order.length - 1),
        startedAt: Number(saved.current.startedAt) || null,
      }
    : null
  return { attempts, current }
}

function save(state) {
  try {
    storage()?.setItem(STORE_KEY, JSON.stringify({ attempts: state.attempts.slice(-MAX_ATTEMPTS), current: state.current ?? null }))
  } catch {
    /* trình duyệt chặn lưu trữ: bài làm vẫn chạy trong phiên hiện tại */
  }
}

/** Bài đang làm dở, hoặc null. */
export function loadQuest() {
  return load().current
}

export function saveQuest(current) {
  const state = load()
  state.current = current
  save(state)
}

export function clearQuest() {
  const state = load()
  state.current = null
  save(state)
}

/** Chốt bài đang làm thành một lần trong lịch sử; trả về lần đó (hoặc null nếu chưa đủ câu). */
export function finishQuest(now = Date.now()) {
  const state = load()
  const current = state.current
  if (!current || Object.keys(current.answers).length !== current.order.length) return null
  const attempt = { id: String(now), startedAt: current.startedAt, finishedAt: now, order: current.order, answers: current.answers }
  state.attempts.push(attempt)
  state.current = null
  save(state)
  return attempt
}

/** Mọi lần đã hoàn thành, cũ nhất trước. */
export function questAttempts() {
  return load().attempts
}

export function questAttempt(id) {
  return load().attempts.find((a) => a.id === String(id)) ?? null
}

export function clearQuestHistory() {
  save({ attempts: [], current: null })
}
