/* quest.test.mjs — bộ 20 tình huống E-Quest: dữ liệu, gán đáp án → profile, rút đề, chấm điểm, mô phỏng cân bằng. */
import assert from "node:assert/strict"
import { QUEST_BANK } from "../public/js/data/questBank.js"
import { STAGING_QUEST } from "../public/js/data/stagingQuest.js"
import { EQ_TRAIT_KEYS } from "../public/js/data/eqTraits.js"
import { EQ_PROFILES, EQ_PROFILE_KEYS } from "../public/js/data/eqProfiles.js"
import { MASCOTS_BY_KEY } from "../public/js/data/mascots.js"
import { DETERMINISTIC_FALLBACK, QUEST_LENGTH, coversQuest, drawQuest, keyQuoteFor, scoreQuestAnswers, strongestChoice } from "../public/js/core/questScoring.js"

let checks = 0
const ok = (cond, msg) => {
  assert.ok(cond, msg)
  checks += 1
}

/* ---- 10 profile ---- */
ok(EQ_PROFILE_KEYS.length === 10, "đủ 10 profile")
for (const key of EQ_PROFILE_KEYS) {
  const p = EQ_PROFILES[key]
  ok(p.key === key && p.en?.startsWith("The ") && p.name && p.description && p.strengths && p.levelUp, `${key}: đủ trường chữ`)
  ok(Array.isArray(p.keys) && p.keys.length === 3 && p.keys.every((k) => k.length > 10), `${key}: đủ 3 chìa khóa`)
  ok(MASCOTS_BY_KEY[p.avatar], `${key}: có avatar`)
}

/* ---- ngân hàng câu hỏi ---- */
ok(QUEST_BANK.length === 20, "đủ 20 tình huống")
const mapped = Object.fromEntries(EQ_PROFILE_KEYS.map((k) => [k, { n: 0, primaries: new Set() }]))
for (const q of QUEST_BANK) {
  ok(q.choices.length === 4, `${q.id}: 4 phương án`)
  ok(EQ_TRAIT_KEYS.includes(q.primary), `${q.id}: tiêu chí chính hợp lệ`)
  ok(Array.isArray(q.secondary) && q.secondary.every((k) => EQ_TRAIT_KEYS.includes(k) && k !== q.primary), `${q.id}: tiêu chí phụ hợp lệ`)
  ok(EQ_TRAIT_KEYS.includes(q.trait) && q.weights[q.trait] === 1, `${q.id}: có trait chính trọng số 1`)
  ok(Object.keys(q.weights).every((k) => EQ_TRAIT_KEYS.includes(k)) && Object.values(q.weights).every((w) => w === 1 || w === 0.5), `${q.id}: weights hợp lệ`)
  ok(STAGING_QUEST[q.id]?.timeline?.length > 0, `${q.id}: có dàn dựng cảnh`)
  ok(!/Thầy Trí|thầy Trí/.test(JSON.stringify(q) + JSON.stringify(STAGING_QUEST[q.id])), `${q.id}: giảng viên là thầy Đức`)
  ok(new Set(q.choices.map((c) => c.profile)).size === 4, `${q.id}: bốn đáp án thuộc bốn profile khác nhau`)
  for (const c of q.choices) {
    ok(Object.keys(q.weights).every((k) => Number.isInteger(c.scores?.[k]) && c.scores[k] >= 0 && c.scores[k] <= 3), `${c.id}: scores 0–3 cho từng nhóm được đo`)
    ok(EQ_PROFILES[c.profile], `${c.id}: profile hợp lệ`)
    mapped[c.profile].n += 1
    mapped[c.profile].primaries.add(q.primary)
  }
}
for (const key of EQ_PROFILE_KEYS) {
  ok(mapped[key].n >= 6 && mapped[key].n <= 10, `${key}: 6–10 đáp án (có ${mapped[key].n})`)
  ok(mapped[key].primaries.size >= 3, `${key}: có mặt ở ≥ 3 tiêu chí chính khác nhau (có ${mapped[key].primaries.size})`)
}
for (const key of EQ_TRAIT_KEYS) ok(QUEST_BANK.some((q) => q.primary === key), `${key}: có ít nhất một câu chính`)
for (const key of EQ_TRAIT_KEYS) ok(QUEST_BANK.some((q) => q.trait === key), `${key}: là trait của ít nhất một câu`)
for (const key of EQ_PROFILE_KEYS) ok(/^T[A-Z]+$/.test(EQ_PROFILES[key].abbr) && EQ_PROFILES[key].abbr === EQ_PROFILES[key].en.split(/[ -]/).map((w) => w[0]).join(""), `${key}: abbr là chữ cái đầu tên tiếng Anh`)

// Câu 9 theo bản mới của tài liệu.
const q9 = QUEST_BANK.find((q) => q.id === "EQ_09")
ok(q9.context.startsWith("Chỉ còn vài giờ nữa") && q9.prompt === "Bạn sẽ làm gì tiếp theo?", "EQ_09: bối cảnh và câu hỏi mới")
ok(q9.choices[3].text.startsWith("Tạm dừng mạng xã hội"), "EQ_09: đáp án D mới")

/* ---- bộ dự phòng và rút đề ---- */
ok(coversQuest(DETERMINISTIC_FALLBACK), "bộ dự phòng cố định đạt điều kiện bao phủ")
ok(coversQuest(drawQuest(() => 0)), "rút đề với rand xấu vẫn trả bộ đạt điều kiện")
ok(!coversQuest(["EQ_01", "EQ_01", ...QUEST_BANK.slice(2, 10).map((q) => q.id)]), "coversQuest từ chối bộ có câu lặp")

// mulberry32: bộ sinh số ngẫu nhiên có hạt giống, để mô phỏng lặp lại được.
const rng = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

/* ---- chấm điểm và quy tắc phá thế hoà ---- */
const pick = (profile) => (id) => QUEST_BANK.find((q) => q.id === id).choices.find((c) => c.profile === profile)?.id
{
  // 2 phiếu cho steadyNavigator (câu 1, 2) và 2 phiếu cho quickReactor (câu 7, 11): hoà → phiếu gần nhất (theo order) thắng.
  const ans = { EQ_01: "EQ_01_D", EQ_02: "EQ_02_B", EQ_07: "EQ_07_B", EQ_11: "EQ_11_A" }
  const a = scoreQuestAnswers(ans, ["EQ_01", "EQ_02", "EQ_07", "EQ_11"])
  ok(a.profile.top === "quickReactor" && a.profile.runnerUp === "steadyNavigator", "hoà phiếu: profile có phiếu sau cùng thắng")
  const b = scoreQuestAnswers(ans, ["EQ_07", "EQ_11", "EQ_01", "EQ_02"])
  ok(b.profile.top === "steadyNavigator" && b.profile.runnerUp === "quickReactor", "đảo thứ tự câu → đảo người thắng")
  ok(a.answered === 4 && a.profile.counts.quickReactor === 2 && a.profile.ranked[0].count === 2 && a.profile.ranked.length === 10, "đếm phiếu và xếp hạng đủ 10 profile")
  const empty = scoreQuestAnswers({})
  ok(empty.answered === 0 && empty.profile.runnerUp === null, "chưa trả lời: chưa có kết quả")
  // Năm nhóm EQ: chọn đáp án mạnh nhất ở mọi câu thì điểm rất cao (có câu phương án mạnh nhất không đạt trần ở nhóm phụ); chọn tệ nhất thì thấp.
  const order10 = drawQuest(rng(7))
  const bestAns = Object.fromEntries(order10.map((id) => [id, strongestChoice(QUEST_BANK.find((q) => q.id === id)).id]))
  const full = scoreQuestAnswers(bestAns, order10)
  ok(full.traits.length === 5 && full.traits.every((t) => t.score >= 85), "đáp án mạnh nhất ở mọi câu → điểm rất cao ở mọi nhóm")
  ok(full.strengths.length === 2 && full.toGrow.length === 2 && full.top === full.ranked[0].key, "strengths/toGrow/top của năm nhóm")
  const worstAns = Object.fromEntries(order10.map((id) => [id, QUEST_BANK.find((q) => q.id === id).choices.reduce((w, c) => (strongestChoice({ ...QUEST_BANK.find((q) => q.id === id), choices: [c, w] }) === c ? w : c)).id]))
  ok(scoreQuestAnswers(worstAns, order10).traits.every((t) => t.score < 60), "đáp án thấp nhất → điểm thấp")
  const bogus = scoreQuestAnswers({ EQ_01: "EQ_02_A", EQ_99: "x" })
  ok(bogus.answered === 0, "bỏ qua phương án không thuộc câu và mã lạ")
}
ok(keyQuoteFor("quickReactor", "1700000000000") === keyQuoteFor("quickReactor", "1700000000000"), "chìa khóa ổn định theo mã lượt")
ok(EQ_PROFILES.quickReactor.keys.includes(keyQuoteFor("quickReactor", "x")), "chìa khóa thuộc 3 câu của profile")
ok(new Set(Array.from({ length: 40 }, (_, i) => keyQuoteFor("quickReactor", String(i)))).size === 3, "cả 3 chìa khóa đều có thể xuất hiện")

/* ---- mô phỏng: 20.000 lượt, đáp án đồng đều ngẫu nhiên ---- */
const RUNS = 20000
const rand = rng(20261029)
const wins = Object.fromEntries(EQ_PROFILE_KEYS.map((k) => [k, 0]))
for (let run = 0; run < RUNS; run += 1) {
  const order = drawQuest(rand)
  ok(coversQuest(order), "mọi lượt rút đạt điều kiện bao phủ")
  const items = order.map((id) => QUEST_BANK.find((q) => q.id === id))
  ok(EQ_TRAIT_KEYS.every((k) => items.some((q) => q.trait === k)), "mọi nhóm EQ là trait của ≥ 1 câu được rút")
  ok(EQ_TRAIT_KEYS.every((k) => items.some((q) => q.primary === k)), "mọi tiêu chí là primary của ≥ 1 câu được rút")
  for (const p of EQ_PROFILE_KEYS) ok(items.filter((q) => q.choices.some((c) => c.profile === p)).length >= 2, "mỗi profile là đáp án của ≥ 2 câu được rút")
  const answers = {}
  for (const id of order) {
    const q = QUEST_BANK.find((x) => x.id === id)
    answers[id] = q.choices[Math.floor(rand() * 4)].id
  }
  const r = scoreQuestAnswers(answers, order)
  ok(r.answered === QUEST_LENGTH, "chấm đủ 10 câu")
  ok(r.traits.every((t) => t.score >= 0 && t.score <= 100), "điểm nhóm trong 0–100")
  wins[r.profile.top] += 1
}
const rates = Object.fromEntries(EQ_PROFILE_KEYS.map((k) => [k, wins[k] / RUNS]))
for (const k of EQ_PROFILE_KEYS) ok(rates[k] >= 0.03 && rates[k] <= 0.25, `${k}: tỉ lệ thắng ${(rates[k] * 100).toFixed(1)}% nằm trong 3–25%`)
if (process.env.QUEST_SIM_REPORT) console.log(JSON.stringify(Object.fromEntries(EQ_PROFILE_KEYS.map((k) => [k, +(rates[k] * 100).toFixed(2)]))))

console.log(`\n✓ E-QUEST: ${checks} phép kiểm đạt, 0 lỗi.`)
