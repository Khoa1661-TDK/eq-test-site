/**
 * Kiểm tra tính nhất quán của mười hai tình huống đại học (UN_01 … UN_12).
 *
 *   node test/uni-consistency.test.mjs
 *
 * Ba quy tắc cơ khí:
 *   1. staging `speakers` phải đủ một người nói cho mỗi câu thoại, và mọi
 *      người nói phải có trong `cast` (hoặc là "narrator");
 *   2. tên riêng xuất hiện trong chữ của tình huống (thoại, câu hỏi, phương án,
 *      hậu quả, practice, chữ diễn trên sân khấu) phải khớp tên trong `cast`
 *      hoặc trong lời thoại — không "Ngọc" chỗ này, "Ngân" chỗ kia;
 *   3. tên ngoài danh sách cho phép chỉ được dùng nếu nằm trong allowlist
 *      những người chỉ được nhắc tên, không đứng trong cảnh.
 */
import { UNI_SCENARIOS } from "../public/js/data/scenariosUni.js"
import { STAGING_UNI } from "../public/js/data/stagingUni.js"

/** Tên riêng hay gặp trong dữ liệu — dùng để bắt lỗi gọi sai tên giữa các chỗ. */
const KNOWN_NAMES = [
  "An", "Bin", "Chi", "Dũng", "Đạt", "Đức", "Hà", "Hải", "Hân", "Hằng", "Hạnh", "Hùng", "Hưng", "Hương", "Huy",
  "Khang", "Khánh", "Khôi", "Lan", "Linh", "Long", "Mai", "Mi", "Minh", "My", "Nam", "Ngân", "Ngọc", "Phúc",
  "Quân", "Quỳnh", "Thắng", "Thảo", "Thanh", "Thư", "Thu", "Trang", "Trí", "Tuấn", "Tú", "Tí", "Vy",
]
/** Người chỉ được nhắc tên trong chữ, không đứng trong cảnh → không bắt buộc có trong cast. */
const MENTIONED_ONLY = new Set(["Long", "Hương"])

let passed = 0
const failures = []

function ok(condition, label, detail) {
  if (condition) {
    passed += 1
    return
  }
  failures.push(detail ? `${label} — ${detail}` : label)
}

/** Gom mọi chữ hiển thị của một tình huống: phần chữ + phần diễn trên sân khấu. */
function allTexts(scenario, staging) {
  const texts = [
    scenario.title,
    scenario.prompt,
    ...scenario.dialogue,
    ...scenario.choices.flatMap((c) => [c.text, c.strategy, c.consequence]),
    ...Object.values(scenario.practice ?? {}),
    staging.label,
    staging.place,
    staging.chatTitle ?? "",
    ...(staging.cast ?? []).map((c) => c.name),
  ]
  const events = [...(staging.timeline ?? []), ...Object.values(staging.consequences ?? {}).flat()]
  for (const ev of events) {
    if (typeof ev.text === "string") texts.push(ev.text)
    if (typeof ev.from === "string") texts.push(ev.from)
  }
  return texts
}

for (const scenario of UNI_SCENARIOS) {
  const at = `[${scenario.id}]`
  const staging = STAGING_UNI[scenario.id]
  ok(staging, `${at} có dàn dựng trong stagingUni`)
  if (!staging) continue

  const castIds = new Set((staging.cast ?? []).map((c) => c.id))

  // 1+2. mỗi câu thoại một người nói, người nói có trong cảnh.
  ok((staging.speakers ?? []).length === scenario.dialogue.length, `${at} số người nói khớp số câu thoại`)
  for (const who of staging.speakers ?? []) ok(who === "narrator" || castIds.has(who), `${at} người nói "${who}" có trong cast`)

  // 3. tên riêng trong chữ phải khớp cast hoặc lời thoại.
  const castNames = (staging.cast ?? []).map((c) => c.name)
  const texts = allTexts(scenario, staging)
  for (const name of KNOWN_NAMES) {
    const re = new RegExp(`(^|[^\\p{L}])${name}([^\\p{L}]|$)`, "u")
    const found = texts.some((t) => re.test(t))
    if (!found) continue
    const inCast = castNames.some((n) => re.test(n))
    const inDialogue = scenario.dialogue.some((d) => re.test(d))
    ok(inCast || inDialogue || MENTIONED_ONLY.has(name), `${at} tên "${name}" xuất hiện trong chữ mà không khớp cast hay lời thoại`)
  }
}

if (failures.length) {
  console.error(`\n✗ NHẤT QUÁN UN_: ${failures.length} lỗi (${passed} phép kiểm đạt):`)
  for (const failure of failures) console.error(`  · ${failure}`)
  process.exit(1)
}
console.log(`✓ NHẤT QUÁN UN_: ${UNI_SCENARIOS.length} tình huống, ${passed} phép kiểm đạt, 0 lỗi.`)
