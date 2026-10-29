/**
 * Chấm điểm E-Quest — 10 EQ profile (data/eqProfiles.js), bộ 20 tình huống (data/questBank.js).
 *
 * Rút đề: mỗi lượt làm rút 10 trong 20 tình huống, xáo thứ tự, sao cho
 *   - năm tiêu chí EQ (data/eqTraits.js) đều là tiêu chí CHÍNH của ít nhất một tình huống được rút;
 *   - mỗi profile là đáp án của ít nhất MIN_PROFILE_OPTIONS (2) tình huống được rút, để profile nào
 *     cũng có cơ hội thắng. Cách làm: rút ngẫu nhiên rồi thử lại (tối đa MAX_TRIES lần); nếu hết lượt
 *     thử vẫn không đạt thì dùng bộ cố định DETERMINISTIC_FALLBACK (đã đạt cả hai điều kiện).
 *
 * Chấm điểm chạy song song hai hệ:
 *   - NĂM NHÓM EQ (hiện ở trang kết quả dưới dạng thanh tiến độ): mỗi đáp án có điểm 0–3 cho từng nhóm được đo
 *     (`scores` trong questBank.js); nhóm chính của câu (`trait`) trọng số 1, nhóm phụ 0,5 (`weights`).
 *       điểm nhóm k = 100 × Σ(trọng số × điểm đạt) / Σ(trọng số × trần), trần = điểm cao nhất trong bốn đáp án.
 *   - 10 PROFILE (phân loại đáp án): mỗi đáp án chọn góp một phiếu cho profile của nó (trường `profile` trong questBank.js).
 * Profile có nhiều phiếu nhất là kết quả chính; profile thứ hai là "runnerUp".
 *
 * QUY TẮC PHÁ THẾ HOÀ (tài liệu để ngỏ): trong các profile đồng phiếu cao nhất, thắng là profile có
 * phiếu GẦN NHẤT theo thứ tự câu hỏi của lượt làm (phản ứng ở những câu sau cùng được coi là xu hướng
 * hiện rõ nhất). Truyền `order` (thứ tự các câu của lượt) vào scoreQuestAnswers; không truyền thì
 * lấy thứ tự khai báo trong questBank. Nếu vẫn hoà (không xảy ra khi có order) thì theo thứ tự EQ_PROFILE_KEYS.
 * Bảng xếp hạng đầy đủ dùng cùng quy tắc: phiếu giảm dần, hoà thì phiếu gần hơn đứng trước.
 *
 * Câu "Chìa khóa mở khóa EQ" là một trong ba câu của profile, chọn cố định theo mã lượt làm
 * (keyQuoteFor) nên xem lại cùng một lượt luôn thấy cùng một câu.
 *
 * ĐÂY KHÔNG PHẢI là thang đo tâm lý đã kiểm định: kết quả phản ánh lựa chọn trong 10 tình huống của
 * lượt này, không phải bạn là người thế nào.
 *
 * Lịch sử lưu ở localStorage. Mã tình huống/phương án không đổi so với bản năm đặc tính cũ nên các lượt
 * đã lưu vẫn chấm lại được bằng cách gán profile mới: giữ nguyên khóa lưu trữ.
 */

import { EQ_TRAITS, EQ_TRAIT_KEYS } from "../data/eqTraits.js"
import { EQ_PROFILES, EQ_PROFILE_KEYS } from "../data/eqProfiles.js"
import { QUEST_BANK } from "../data/questBank.js"

export const QUEST_MODEL = "equest5p10-v1"
export const QUEST_LENGTH = 10
export const MIN_PROFILE_OPTIONS = 2
export const MAX_TRIES = 500

export const QUEST_BY_ID = Object.fromEntries(QUEST_BANK.map((q) => [q.id, q]))
const CHOICE_BY_ID = Object.fromEntries(QUEST_BANK.flatMap((q) => q.choices.map((c) => [c.id, c])))
const BANK_INDEX = Object.fromEntries(QUEST_BANK.map((q, i) => [q.id, i]))

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

/** Bộ 10 mã có đạt điều kiện bao phủ không: đủ 5 tiêu chí chính, đủ 5 nhóm `trait` và mỗi profile ≥ MIN_PROFILE_OPTIONS lần. */
export function coversQuest(ids) {
  if (ids.length !== QUEST_LENGTH || new Set(ids).size !== QUEST_LENGTH) return false
  const items = ids.map((id) => QUEST_BY_ID[id])
  if (items.some((q) => !q)) return false
  if (!EQ_TRAIT_KEYS.every((k) => items.some((q) => q.primary === k))) return false
  // Mỗi nhóm EQ phải là nhóm chính (`trait`) của ít nhất một câu, để thanh nào cũng có điểm.
  if (!EQ_TRAIT_KEYS.every((k) => items.some((q) => q.trait === k))) return false
  const seen = Object.fromEntries(EQ_PROFILE_KEYS.map((k) => [k, 0]))
  for (const q of items) for (const c of q.choices) seen[c.profile] += 1
  return EQ_PROFILE_KEYS.every((k) => seen[k] >= MIN_PROFILE_OPTIONS)
}

/* Bộ dự phòng cố định (chỉ dùng khi MAX_TRIES lần rút ngẫu nhiên đều trượt); test kiểm nó đạt coversQuest. */
export const DETERMINISTIC_FALLBACK = ["EQ_01", "EQ_02", "EQ_03", "EQ_04", "EQ_05", "EQ_06", "EQ_07", "EQ_08", "EQ_09", "EQ_12"]

/** 10 mã tình huống khác nhau từ 20 câu, đạt coversQuest, đã xáo thứ tự. */
export function drawQuest(rand = Math.random) {
  const all = QUEST_BANK.map((q) => q.id)
  for (let i = 0; i < MAX_TRIES; i += 1) {
    const picked = shuffle(all, rand).slice(0, QUEST_LENGTH)
    if (coversQuest(picked)) return picked
  }
  return shuffle(DETERMINISTIC_FALLBACK, rand)
}

/* ------------------------------------------------------------------ chấm điểm */

function ceilingOf(item, key) {
  return Math.max(...item.choices.map((c) => c.scores[key] ?? 0))
}

/** Phương án mạnh nhất của một câu: tổng điểm có trọng số cao nhất (trang quản trị đánh dấu ★). */
export function strongestChoice(item) {
  const points = (c) => Object.entries(item.weights).reduce((sum, [key, w]) => sum + w * (c.scores[key] ?? 0), 0)
  return item.choices.reduce((best, c) => (points(c) > points(best) ? c : best))
}

/**
 * Chấm một bộ câu trả lời { [mãTìnhHuống]: mãPhươngÁn }.
 * order: thứ tự các câu trong lượt (để phá thế hoà giữa các profile, xem đầu file).
 * Trả về { answered, traits: [{ key, name, en, color, summary, score }], ranked, top, strengths, toGrow,
 *          profile: { counts: { [profile]: n }, ranked: [{ key, count }], top, runnerUp } }.
 * (traits/ranked/top/strengths/toGrow là hệ năm nhóm EQ; `profile` là hệ 10 profile.)
 */
export function scoreQuestAnswers(answers = {}, order = null) {
  const counts = Object.fromEntries(EQ_PROFILE_KEYS.map((k) => [k, 0]))
  const last = Object.fromEntries(EQ_PROFILE_KEYS.map((k) => [k, -1]))
  const got = Object.fromEntries(EQ_TRAIT_KEYS.map((k) => [k, 0]))
  const max = Object.fromEntries(EQ_TRAIT_KEYS.map((k) => [k, 0]))
  const sequence = Array.isArray(order) && order.length ? order : QUEST_BANK.map((q) => q.id)
  const rank = (id) => {
    const at = sequence.indexOf(id)
    return at >= 0 ? at : sequence.length + BANK_INDEX[id]
  }
  let answered = 0
  for (const [id, choiceId] of Object.entries(answers)) {
    const item = QUEST_BY_ID[id]
    const choice = item && CHOICE_BY_ID[choiceId]
    if (!choice || !choiceId.startsWith(`${id}_`) || !(choice.profile in counts)) continue
    answered += 1
    counts[choice.profile] += 1
    last[choice.profile] = Math.max(last[choice.profile], rank(id))
    for (const [key, weight] of Object.entries(item.weights)) {
      if (!(key in got)) continue
      got[key] += weight * (choice.scores[key] ?? 0)
      max[key] += weight * ceilingOf(item, key)
    }
  }
  const traits = EQ_TRAITS.map((t) => ({ ...t, score: max[t.key] ? Math.round((100 * got[t.key]) / max[t.key]) : 0 }))
  // Sắp xếp ổn định: hoà điểm thì giữ thứ tự của EQ_TRAITS.
  const traitRanked = [...traits].sort((a, b) => b.score - a.score)
  // Profile: phiếu giảm dần; hoà thì phiếu gần nhất đứng trước; vẫn hoà thì theo thứ tự EQ_PROFILE_KEYS (sort ổn định).
  const ranked = EQ_PROFILE_KEYS.map((key) => ({ key, count: counts[key] }))
    .sort((a, b) => b.count - a.count || last[b.key] - last[a.key])
  return {
    answered,
    traits,
    ranked: traitRanked,
    top: traitRanked[0]?.key ?? EQ_TRAIT_KEYS[0],
    strengths: traitRanked.slice(0, 2).map((t) => t.key),
    toGrow: traitRanked.slice(-2).reverse().map((t) => t.key),
    profile: { counts, ranked, top: ranked[0].key, runnerUp: ranked[1]?.count ? ranked[1].key : null },
  }
}

export function scoreQuest(attempt) {
  return attempt ? scoreQuestAnswers(attempt.answers, attempt.order) : null
}

/** Một trong ba câu "Chìa khóa" của profile, chọn cố định theo mã lượt làm. */
export function keyQuoteFor(profileKey, attemptId = "") {
  const keys = EQ_PROFILES[profileKey]?.keys ?? []
  if (!keys.length) return ""
  let h = 2166136261
  for (const ch of `${attemptId}:${profileKey}`) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return keys[(h >>> 0) % keys.length]
}

/** Thời gian làm bài (giây) của một lượt, hoặc null nếu không có thời điểm bắt đầu. */
export function attemptSeconds(attempt) {
  if (!attempt?.startedAt || !attempt?.finishedAt) return null
  return Math.max(0, Math.round((attempt.finishedAt - attempt.startedAt) / 1000))
}

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
