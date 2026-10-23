/**
 * Kiểm tra linh vật trang hồ sơ (không cần trình duyệt).
 *
 *   node test/mascots.test.mjs
 *
 * Quy tắc: đủ bảy nhóm (sáu kỹ năng + nhóm "kệ"), pickMascot trả về một linh vật
 * hợp lệ cho vài bộ câu trả lời giả định — bao gồm bộ toàn lựa chọn né/lờ/nuốt thì
 * phải ra chú lười — và mọi lưới pixel đúng 16 dòng × 16 ký tự, mỗi ký tự là '.'
 * hoặc có trong bảng màu của chính linh vật đó.
 */
import { FORMS, FORM_ORDER, ITEM_BY_ID, scoreAnswers, strongestChoice } from "../public/js/core/eqScoring.js"
import { MASCOTS, MASCOTS_BY_KEY, pickMascot } from "../public/js/data/mascots.js"

let passed = 0
const failures = []
const ok = (condition, label, detail) => (condition ? (passed += 1) : failures.push(detail ? `${label} — ${detail}` : label))
const eq = (actual, expected, label) => ok(actual === expected, label, `nhận ${JSON.stringify(actual)}, mong ${JSON.stringify(expected)}`)

const GROUPS = ["selfAwareness", "regulation", "empathy", "socialAwareness", "communication", "relationship", "avoider"]

/* ── 1. Đủ bảy nhóm, mỗi nhóm đủ thông tin ─────────────────────────────── */
eq(MASCOTS.length, GROUPS.length, "đúng bảy linh vật")
for (const key of GROUPS) ok(Boolean(MASCOTS_BY_KEY[key]), `có linh vật cho nhóm "${key}"`)

const AVOID_PATTERNS = new Set(["avoids", "ignores_feeling", "suppresses"])
for (const m of MASCOTS) {
  const at = `[${m.key}]`
  ok(typeof m.name === "string" && m.name.trim().length > 0, `${at} có tên`)
  ok(typeof m.animal === "string" && m.animal.trim().length > 0, `${at} có tên loài`)
  ok(typeof m.tagline === "string" && m.tagline.trim().length > 0, `${at} có tagline`)
  ok(typeof m.description === "string" && m.description.trim().length > 0, `${at} có mô tả`)
  eq(m.strengths?.length, 3, `${at} có ba điểm mạnh`)
  eq(m.watchOuts?.length, 2, `${at} có hai điều nên để ý`)
  ok(typeof m.tip === "string" && m.tip.trim().length > 0, `${at} có một mẹo`)
  for (const c of ["bg", "main", "accent"]) ok(/^#[0-9a-f]{6}$/i.test(m.colors?.[c] ?? ""), `${at} colors.${c} là mã màu hex`)
  ok(m.palette && typeof m.palette === "object", `${at} có bảng màu`)

  /* Lưới pixel: 16 dòng × 16 ký tự, mỗi ký tự là '.' hoặc có trong bảng màu. */
  eq(m.pixels?.length, 16, `${at} lưới đúng 16 dòng`)
  m.pixels.forEach((row, i) => {
    eq(row.length, 16, `${at} dòng ${i} đúng 16 ký tự`)
    for (const ch of row) ok(ch === "." || ch in m.palette, `${at} dòng ${i}: ký tự «${ch}» nằm trong bảng màu`)
  })
}

/* ── 2. pickMascot trên các bộ câu trả lời giả định ─────────────────────── */
const ids = FORMS[FORM_ORDER[0]]
const items = ids.map((id) => ITEM_BY_ID[id])

// Bộ 1: chọn mạnh nhất mọi tình huống → linh vật theo kỹ năng điểm cao nhất.
const best = Object.fromEntries(items.map((i) => [i.id, strongestChoice(i).id]))
const rBest = scoreAnswers(best, ids)
const topSkill = rBest.dimensions.filter((d) => d.score !== null).reduce((a, b) => (b.score > a.score ? b : a))
eq(pickMascot(rBest, best), MASCOTS_BY_KEY[topSkill.key], `chọn mạnh nhất mọi câu → linh vật nhóm ${topSkill.key}`)
ok(Boolean(pickMascot(rBest, best)?.name), "bộ mạnh nhất → linh vật hợp lệ")

// Bộ 2: toàn lựa chọn né/lờ/nuốt (còn lại chọn yếu nhất) → chú lười.
const lazy = Object.fromEntries(
  items.map((i) => [i.id, (i.choices.find((c) => AVOID_PATTERNS.has(c.pattern)) ?? i.choices[0]).id]),
)
const avoidPicks = items.filter((i) => AVOID_PATTERNS.has(ITEM_BY_ID[i.id].choices.find((c) => c.id === lazy[i.id])?.pattern)).length
ok(avoidPicks / items.length >= 0.4, `bộ giả định có ≥ 40% lựa chọn né/lờ/nuốt (${avoidPicks}/${items.length})`)
eq(pickMascot(scoreAnswers(lazy, ids), lazy), MASCOTS_BY_KEY.avoider, "≥ 40% lựa chọn né/lờ/nuốt → Lười Chill Kệ Đời")

// Bộ 3: chưa trả lời gì → vẫn trả về một linh vật hợp lệ (mặc định an toàn).
const empty = scoreAnswers({}, ids)
ok(GROUPS.includes(pickMascot(empty, {})?.key), "chưa có câu trả lời → vẫn ra một linh vật hợp lệ")

/* ── Kết luận ──────────────────────────────────────────────────────────── */
if (failures.length) {
  console.error(`\n✗ LINH VẬT: ${failures.length} lỗi (${passed} phép kiểm đạt):`)
  for (const failure of failures.slice(0, 60)) console.error(`  · ${failure}`)
  process.exit(1)
}
console.log(`\n✓ LINH VẬT: ${passed} phép kiểm đạt, 0 lỗi.`)