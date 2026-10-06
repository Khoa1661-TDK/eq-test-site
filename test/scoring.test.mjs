/**
 * Kiểm tra bộ chấm điểm sáu kỹ năng và phần lưu tiến độ (không cần trình duyệt).
 *
 *   node test/scoring.test.mjs
 *
 * Bất biến chính: chọn phương án mạnh nhất ở mọi tình huống thì MỌI kỹ năng và
 * điểm tổng đều đúng 100; điểm luôn trong 0..100; kết quả tất định; một câu tệ
 * hơn không bao giờ làm điểm tăng; thiếu bằng chứng thì không cho điểm; và lịch sử
 * lưu, luân phiên đề, so sánh trước–sau hoạt động đúng.
 */
import {
  ITEM_BY_ID,
  FORMS,
  FORM_ORDER,
  SKILL_KEYS,
  BAND_HIGH,
  BAND_MID,
  EVIDENCE_FLOOR,
  CHANGE_THRESHOLD,
  PATTERN_MIN_PICKS,
  levelFor,
  scoreAnswers,
  compareResults,
  strongestChoice,
  weightedPoints,
  loadHistory,
  loadAssessment,
  saveAssessment,
  finishAttempt,
  nextForm,
  scoreAttempt,
  latestAttempt,
  hasResult,
  recordPractice,
  practiceSince,
  loadPractice,
  clearAllData,
  HISTORY_KEY,
} from "../public/js/core/eqScoring.js"

let passed = 0
const failures = []
const ok = (condition, label, detail) => (condition ? (passed += 1) : failures.push(detail ? `${label} — ${detail}` : label))
const eq = (actual, expected, label) => ok(actual === expected, label, `nhận ${JSON.stringify(actual)}, mong ${JSON.stringify(expected)}`)

function memoryStorage() {
  const map = new Map()
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    clear: () => map.clear(),
  }
}
globalThis.localStorage = memoryStorage()
globalThis.sessionStorage = memoryStorage()

const weakestChoice = (item) =>
  item.choices.reduce((low, c) => (weightedPoints(item, c) < weightedPoints(item, low) ? c : low))

for (const form of FORM_ORDER) {
  const ids = FORMS[form]
  const items = ids.map((id) => ITEM_BY_ID[id])
  const best = Object.fromEntries(items.map((i) => [i.id, strongestChoice(i).id]))
  const worst = Object.fromEntries(items.map((i) => [i.id, weakestChoice(i).id]))
  const lazy = Object.fromEntries(items.map((i) => [i.id, i.choices[0].id]))

  /* ── 1. Điểm tối đa đúng 100 ─────────────────────────────────────────── */
  const top = scoreAnswers(best, ids)
  eq(top.overall, 100, `đề ${form}: chọn mạnh nhất → điểm tổng 100`)
  for (const d of top.dimensions) eq(d.score, 100, `đề ${form}: chọn mạnh nhất → ${d.key} = 100`)
  ok(top.complete, `đề ${form}: bộ mạnh nhất được coi là hoàn thành`)

  /* ── 2. Biên, tất định, đơn điệu ─────────────────────────────────────── */
  const low = scoreAnswers(worst, ids)
  const mid = scoreAnswers(lazy, ids)
  for (const r of [low, mid]) {
    ok(Number.isInteger(r.overall) && r.overall >= 0 && r.overall <= 100, `đề ${form}: điểm tổng trong 0..100`, `${r.overall}`)
    for (const d of r.dimensions) ok(Number.isInteger(d.score) && d.score >= 0 && d.score <= 100, `đề ${form}: ${d.key} trong 0..100`, `${d.score}`)
  }
  ok(low.overall < top.overall, `đề ${form}: chọn yếu nhất < chọn mạnh nhất`, `${low.overall}`)
  console.log(`  đề ${form}: mạnh nhất ${top.overall} · luôn chọn A ${mid.overall} · yếu nhất ${low.overall} (${low.dimensions.map((d) => `${d.code} ${d.score}`).join(" · ")})`)

  const reversed = Object.fromEntries(Object.entries(best).reverse())
  ok(JSON.stringify(scoreAnswers(reversed, ids).dimensions.map((d) => d.score)) === JSON.stringify(top.dimensions.map((d) => d.score)),
    `đề ${form}: kết quả không phụ thuộc thứ tự trả lời`)

  let monotonic = true
  for (const item of items) {
    const r = scoreAnswers({ ...best, [item.id]: worst[item.id] }, ids)
    for (const d of r.dimensions) if (d.score > 100) monotonic = false
    if (r.overall > top.overall) monotonic = false
    if (weightedPoints(item, weakestChoice(item)) < weightedPoints(item, strongestChoice(item)) && r.overall >= top.overall) monotonic = false
  }
  ok(monotonic, `đề ${form}: hạ một câu xuống yếu nhất luôn làm điểm tổng giảm`)

  /* ── 3. Chưa đủ bằng chứng thì không cho điểm ────────────────────────── */
  for (const key of SKILL_KEYS) {
    const primary = items.filter((i) => i.domain === key)
    const partial = Object.fromEntries(primary.slice(0, EVIDENCE_FLOOR - 1).map((i) => [i.id, best[i.id]]))
    const r = scoreAnswers(partial, ids)
    eq(r.dimensions.find((d) => d.key === key).score, null, `đề ${form}: ${key} với ${EVIDENCE_FLOOR - 1} câu chính → chưa đủ dữ liệu`)
  }
  const empty = scoreAnswers({}, ids)
  eq(empty.answered, 0, `đề ${form}: chưa trả lời → answered 0`)
  eq(empty.complete, false, `đề ${form}: chưa trả lời → chưa hoàn thành`)
  ok(empty.dimensions.every((d) => d.score === null), `đề ${form}: chưa trả lời → mọi kỹ năng chưa có điểm`)

  /* ── 4. Điểm mạnh, cần luyện, bằng chứng ─────────────────────────────── */
  ok(low.strengths.length >= 1, `đề ${form}: luôn có ít nhất một điểm mạnh`)
  ok(low.growth.length >= 2, `đề ${form}: luôn có ít nhất hai kỹ năng cần luyện`)
  ok(!low.growth.some((g) => low.strengths.some((s) => s.key === g.key)), `đề ${form}: một kỹ năng không vừa mạnh vừa cần luyện`)
  for (const g of low.growth) ok(g.evidence.missed.length >= 1, `đề ${form}: ${g.key} cần luyện có tình huống làm bằng chứng`)
}

/* ── 5. Mẫu chiến lược lặp lại ────────────────────────────────────────── */
{
  const ids = FORMS[FORM_ORDER[0]]
  const counts = {}
  for (const id of ids) for (const c of ITEM_BY_ID[id].choices) if (c.pattern) counts[c.pattern] = (counts[c.pattern] ?? 0) + 1
  const pattern = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0]
  const answers = {}
  for (const id of ids) {
    const item = ITEM_BY_ID[id]
    answers[id] = (item.choices.find((c) => c.pattern === pattern) ?? strongestChoice(item)).id
  }
  const r = scoreAnswers(answers, ids)
  ok(counts[pattern] >= PATTERN_MIN_PICKS, `mẫu "${pattern}" có trong ≥ ${PATTERN_MIN_PICKS} tình huống`)
  ok(r.patterns.some((p) => p.key === pattern), `chọn "${pattern}" mọi lúc → hiện thành mẫu lặp lại`)
  ok(r.patterns.length <= 2, "hiện tối đa 2 mẫu lặp lại")
}

/* ── 6. Mức và so sánh trước–sau ──────────────────────────────────────── */
eq(levelFor(BAND_HIGH), "high", "levelFor(70) = high")
eq(levelFor(BAND_HIGH - 1), "mid", "levelFor(69) = mid")
eq(levelFor(BAND_MID), "mid", "levelFor(45) = mid")
eq(levelFor(BAND_MID - 1), "low", "levelFor(44) = low")
eq(levelFor(null), null, "levelFor(null) = null")

const fake = (scores) => ({ dimensions: SKILL_KEYS.map((key, i) => ({ key, score: scores[i] })) })
const diff = compareResults(fake([50, 50, 50, 50, 50, null]), fake([60, 59, 41, 40, 50, 70]))
eq(diff.map((d) => d.change).join(","), "improved,steady,steady,dipped,steady,", "nhãn thay đổi theo ngưỡng ±10")
eq(diff[0].delta, CHANGE_THRESHOLD, "delta tính đúng")

/* ── 7. Lưu tiến độ, luân phiên đề, chuyển dữ liệu cũ ─────────────────── */
clearAllData()
const legacyIds = FORMS.A.slice(0, 3)
sessionStorage.setItem("eq_assessment_v1", JSON.stringify({
  answers: Object.fromEntries(legacyIds.map((id) => [id, ITEM_BY_ID[id].choices[0].id])),
  index: 2,
  order: null,
}))
const migrated = loadHistory()
eq(Object.keys(migrated.current?.answers ?? {}).length, 3, "bài dở trong sessionStorage cũ được chuyển sang")
eq(sessionStorage.getItem("eq_assessment_v1"), null, "khoá sessionStorage cũ được xoá sau khi chuyển")
ok(localStorage.getItem(HISTORY_KEY), "lịch sử nằm trong localStorage")

clearAllData()
eq(hasResult(), false, "sau khi xoá dữ liệu: chưa có kết quả")
eq(nextForm(), "A", "lần đầu làm đề A")
const formA = FORMS.A
const bestA = Object.fromEntries(formA.map((id) => [id, strongestChoice(ITEM_BY_ID[id]).id]))
saveAssessment({ form: "A", order: formA, answers: bestA, index: formA.length - 1, startedAt: 1000 })
eq(loadAssessment().form, "A", "bài đang làm giữ đúng đề")
const first = finishAttempt(2000)
ok(first && first.form === "A", "chốt lần 1 trên đề A")
eq(loadHistory().current, null, "chốt xong thì không còn bài dở")
eq(nextForm(), "B", "lần làm lại dùng đề B")
eq(scoreAttempt(latestAttempt()).overall, 100, "chấm lại lần đã lưu từ câu trả lời gốc")
recordPractice(formA[0], ITEM_BY_ID[formA[0]].choices[0].id, 3000)
eq(loadPractice().reps.length, 1, "ghi một lượt luyện")
const since = practiceSince(2000)
eq(since[ITEM_BY_ID[formA[0]].domain].practised, 1, "đếm lượt luyện theo kỹ năng kể từ lần đánh giá")
eq(scoreAttempt(latestAttempt()).overall, 100, "luyện tập không đổi điểm đánh giá")
clearAllData()
eq(localStorage.getItem(HISTORY_KEY), null, "nút xoá dữ liệu xoá lịch sử")

/* ── Kết luận ──────────────────────────────────────────────────────────── */
if (failures.length) {
  console.error(`\n✗ CHẤM ĐIỂM + LƯU TIẾN ĐỘ: ${failures.length} lỗi (${passed} phép kiểm đạt):`)
  for (const failure of failures.slice(0, 60)) console.error(`  · ${failure}`)
  process.exit(1)
}
console.log(`\n✓ CHẤM ĐIỂM + LƯU TIẾN ĐỘ: ${passed} phép kiểm đạt, 0 lỗi.`)
