/* quest.test.mjs — bộ 20 tình huống E-Quest: dữ liệu, dàn dựng cảnh, rút đề và chấm điểm. */
import assert from "node:assert/strict"
import { QUEST_BANK } from "../public/js/data/questBank.js"
import { STAGING_QUEST } from "../public/js/data/stagingQuest.js"
import { EQ_TRAIT_KEYS, practiceTrait } from "../public/js/data/eqTraits.js"
import { FORMS, ITEM_BY_ID, PRACTICE_IDS } from "../public/js/core/eqScoring.js"
import { EQ_PROFILES } from "../public/js/data/eqProfiles.js"
import { PER_TRAIT, QUEST_LENGTH, drawQuest, scoreQuestAnswers } from "../public/js/core/questScoring.js"

let checks = 0
const ok = (cond, msg) => {
  assert.ok(cond, msg)
  checks += 1
}

ok(QUEST_BANK.length === 20, "đủ 20 tình huống")
for (const key of EQ_TRAIT_KEYS) {
  ok(QUEST_BANK.filter((q) => q.trait === key).length === 4, `${key}: 4 tình huống chính`)
  ok(EQ_PROFILES[key], `${key}: có nhóm hồ sơ`)
}
for (const q of QUEST_BANK) {
  ok(q.choices.length === 4, `${q.id}: 4 phương án`)
  ok(q.weights[q.trait] === 1, `${q.id}: thành phần chính có trọng số 1`)
  ok(STAGING_QUEST[q.id]?.timeline?.length > 0, `${q.id}: có dàn dựng cảnh`)
  ok(!/Thầy Trí|thầy Trí/.test(JSON.stringify(q) + JSON.stringify(STAGING_QUEST[q.id])), `${q.id}: giảng viên là thầy Đức`)
  for (const c of q.choices) for (const key of Object.keys(q.weights)) ok(Number.isInteger(c.scores[key]) && c.scores[key] >= 0 && c.scores[key] <= 3, `${c.id}: điểm ${key} 0–3`)
}

for (let run = 0; run < 200; run += 1) {
  const order = drawQuest()
  ok(order.length === QUEST_LENGTH && new Set(order).size === QUEST_LENGTH, "rút đủ 10 tình huống khác nhau")
  for (const key of EQ_TRAIT_KEYS) ok(order.filter((id) => QUEST_BANK.find((q) => q.id === id).trait === key).length === PER_TRAIT, `mỗi thành phần ${PER_TRAIT} tình huống`)
}

// Chọn phương án tốt nhất (tổng điểm có trọng số cao nhất) ở mọi câu → mọi thành phần gần 100.
// Không đúng 100 hết vì EQ_09, EQ_11 không có phương án nào cao nhất trên cả hai thành phần.
const best = {}
for (const q of QUEST_BANK) {
  const total = (c) => Object.entries(q.weights).reduce((s, [k, w]) => s + w * c.scores[k], 0)
  best[q.id] = [...q.choices].sort((a, b) => total(b) - total(a))[0].id
}
const top = scoreQuestAnswers(best)
ok(top.answered === 20, "chấm đủ 20 câu")
for (const t of top.traits) ok(t.score >= 90, `${t.key}: chọn tốt nhất → ≥ 90 (được ${t.score})`)

const worst = Object.fromEntries(QUEST_BANK.map((q) => [q.id, q.choices.find((c) => c.code === "A").id]))
const mixed = scoreQuestAnswers(worst)
ok(mixed.traits.every((t) => t.score >= 0 && t.score <= 100), "điểm trong 0–100")
ok(mixed.strengths.length === 2 && mixed.toGrow.length === 2, "hai kỹ năng nổi bật, hai kỹ năng cần nâng cấp")
ok(!mixed.strengths.some((k) => mixed.toGrow.includes(k)), "nổi bật và cần nâng cấp không trùng nhau")

// Kho luyện xếp theo năm thành phần: mỗi thành phần có ít nhất 4 tình huống chữ.
const practicePool = [...PRACTICE_IDS, ...FORMS.A].map((id) => ITEM_BY_ID[id]).filter((item) => item?.kind === "text")
for (const item of practicePool) ok(EQ_TRAIT_KEYS.includes(practiceTrait(item)), `${item.id}: thuộc một thành phần`)
for (const key of EQ_TRAIT_KEYS) {
  const n = practicePool.filter((item) => practiceTrait(item) === key).length
  ok(n >= 4, `luyện ${key}: ít nhất 4 tình huống (có ${n})`)
}

console.log(`\n✓ E-QUEST: ${checks} phép kiểm đạt, 0 lỗi.`)
