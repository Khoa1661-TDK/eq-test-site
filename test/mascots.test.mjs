/**
 * Kiểm tra avatar pixel của 10 EQ profile (không cần trình duyệt).
 *
 *   node test/mascots.test.mjs
 *
 * Quy tắc: mỗi profile trong data/eqProfiles.js trỏ vào đúng một lưới pixel có thật (và ngược lại), key không
 * trùng, mỗi lưới đúng 16 dòng × 16 ký tự, mỗi ký tự là '.' hoặc có trong bảng màu của chính avatar,
 * hình đủ lớn để nhận ra (≥ 40 ô tô màu), không có hai avatar giống hệt nhau.
 */
import { MASCOTS, MASCOTS_BY_KEY } from "../public/js/data/mascots.js"
import { EQ_PROFILES, EQ_PROFILE_KEYS } from "../public/js/data/eqProfiles.js"

let passed = 0
const failures = []
const ok = (condition, label, detail) => (condition ? (passed += 1) : failures.push(detail ? `${label} — ${detail}` : label))
const eq = (actual, expected, label) => ok(actual === expected, label, `nhận ${JSON.stringify(actual)}, mong ${JSON.stringify(expected)}`)

eq(MASCOTS.length, EQ_PROFILE_KEYS.length, "đúng 10 avatar")
eq(new Set(MASCOTS.map((m) => m.key)).size, MASCOTS.length, "key avatar không trùng")
eq(new Set(MASCOTS.map((m) => m.pixels.join("|"))).size, MASCOTS.length, "không có hai avatar giống hệt nhau")
for (const key of EQ_PROFILE_KEYS) ok(MASCOTS_BY_KEY[EQ_PROFILES[key].avatar], `profile "${key}" trỏ vào avatar có thật`)
for (const m of MASCOTS) ok(Object.values(EQ_PROFILES).some((p) => p.avatar === m.key), `avatar "${m.key}" được một profile dùng`)

for (const m of MASCOTS) {
  const at = `[${m.key}]`
  ok(m.palette && typeof m.palette === "object" && Object.keys(m.palette).length > 1, `${at} có bảng màu`)
  eq(m.pixels?.length, 16, `${at} lưới đúng 16 dòng`)
  let filled = 0
  m.pixels.forEach((row, i) => {
    eq(row.length, 16, `${at} dòng ${i} đúng 16 ký tự`)
    for (const ch of row) {
      ok(ch === "." || ch in m.palette, `${at} dòng ${i}: ký tự «${ch}» nằm trong bảng màu`)
      if (ch !== ".") filled += 1
    }
  })
  ok(filled >= 40, `${at} đủ lớn để nhận ra`, `chỉ ${filled} ô tô màu`)
  for (const key of Object.keys(m.palette)) ok(m.pixels.some((row) => row.includes(key)), `${at} màu «${key}» có được dùng`)
}

if (failures.length) {
  console.error(`\n✗ AVATAR: ${failures.length} lỗi (${passed} phép kiểm đạt):`)
  for (const failure of failures.slice(0, 60)) console.error(`  · ${failure}`)
  process.exit(1)
}
console.log(`\n✓ AVATAR: ${passed} phép kiểm đạt, 0 lỗi.`)
