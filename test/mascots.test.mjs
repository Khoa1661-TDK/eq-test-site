/**
 * Kiểm tra ảnh pixel của linh vật (không cần trình duyệt).
 *
 *   node test/mascots.test.mjs
 *
 * Quy tắc: đủ bảy lưới pixel cho bảy key mà data/types.js tham chiếu, key không
 * trùng, mỗi lưới đúng 16 dòng × 16 ký tự, mỗi ký tự là '.' hoặc có trong bảng
 * màu của chính linh vật đó; phần chữ của kiểu nằm bên data/types.js.
 */
import { MASCOTS, MASCOTS_BY_KEY } from "../public/js/data/mascots.js"
import { TYPES } from "../public/js/data/types.js"

let passed = 0
const failures = []
const ok = (condition, label, detail) => (condition ? (passed += 1) : failures.push(detail ? `${label} — ${detail}` : label))
const eq = (actual, expected, label) => ok(actual === expected, label, `nhận ${JSON.stringify(actual)}, mong ${JSON.stringify(expected)}`)

const GROUPS = ["selfAwareness", "regulation", "empathy", "socialAwareness", "communication", "relationship", "avoider"]

/* ── 1. Đủ bảy lưới, key không trùng, mọi kiểu trỏ vào một lưới có thật ─── */
eq(MASCOTS.length, GROUPS.length, "đúng bảy linh vật")
eq(new Set(MASCOTS.map((m) => m.key)).size, GROUPS.length, "key linh vật không trùng")
for (const key of GROUPS) ok(Boolean(MASCOTS_BY_KEY[key]), `có linh vật cho nhóm "${key}"`)
for (const t of TYPES) ok(Boolean(MASCOTS_BY_KEY[t.mascot]), `kiểu "${t.key}" trỏ vào linh vật "${t.mascot}" có thật`)

/* ── 2. Lưới pixel và bảng màu ──────────────────────────────────────────── */
for (const m of MASCOTS) {
  const at = `[${m.key}]`
  ok(m.palette && typeof m.palette === "object" && Object.keys(m.palette).length > 0, `${at} có bảng màu`)

  /* Lưới pixel: 16 dòng × 16 ký tự, mỗi ký tự là '.' hoặc có trong bảng màu. */
  eq(m.pixels?.length, 16, `${at} lưới đúng 16 dòng`)
  m.pixels.forEach((row, i) => {
    eq(row.length, 16, `${at} dòng ${i} đúng 16 ký tự`)
    for (const ch of row) ok(ch === "." || ch in m.palette, `${at} dòng ${i}: ký tự «${ch}» nằm trong bảng màu`)
  })
}

/* ── Kết luận ──────────────────────────────────────────────────────────── */
if (failures.length) {
  console.error(`\n✗ LINH VẬT: ${failures.length} lỗi (${passed} phép kiểm đạt):`)
  for (const failure of failures.slice(0, 60)) console.error(`  · ${failure}`)
  process.exit(1)
}
console.log(`\n✓ LINH VẬT: ${passed} phép kiểm đạt, 0 lỗi.`)
