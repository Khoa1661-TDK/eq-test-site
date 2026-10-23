/**
 * Kiểm tra 16 kiểu cảm xúc của trang hồ sơ (không cần trình duyệt).
 *
 *   node test/types.test.mjs
 *
 * Quy tắc: đủ 16 kiểu, key và mã không trùng, mọi mẫu chiến lược dùng trong
 * bảng trọng số phải có trong data/eqPatterns.js, mọi key linh vật phải có
 * trong data/mascots.js, mã/tên/mô tả/màu đúng bảng đặc tả; pickType: bộ toàn
 * lựa chọn né → GHOST, chọn mạnh nhất mọi câu → một kiểu hợp lệ, chưa trả lời
 * gì → IDK; và mô phỏng seed cố định (types-sim.mjs, 2000 người chơi chọn ngẫu
 * nhiên): mọi kiểu xuất hiện ≥ 1%, không kiểu nào vượt 18%, IDK ≤ 12%.
 */
import { FORMS, FORM_ORDER, ITEM_BY_ID, strongestChoice } from "../public/js/core/eqScoring.js"
import { EQ_PATTERNS } from "../public/js/data/eqPatterns.js"
import { MASCOTS_BY_KEY } from "../public/js/data/mascots.js"
import { TYPES, TYPE_BY_KEY, pickType } from "../public/js/data/types.js"
import { simulate } from "./types-sim.mjs"

let passed = 0
const failures = []
const ok = (condition, label, detail) => (condition ? (passed += 1) : failures.push(detail ? `${label} — ${detail}` : label))
const eq = (actual, expected, label) => ok(actual === expected, label, `nhận ${JSON.stringify(actual)}, mong ${JSON.stringify(expected)}`)

/* ── 1. Đủ 16 kiểu, đúng bảng đặc tả (key, mã, tên, mô tả, màu, linh vật) ── */
const SPEC = [
  ["salty", "SALTY", "The Bitter One", "Khó chịu khi bị chê, dễ để bụng chuyện nhỏ.", "#f6dede", "#7a2430", "empathy"],
  ["cope", "COPE", "The Justifier", "Luôn tìm lý do để tự thuyết phục rằng mình không sai.", "#e6e1f3", "#3d2f6b", "selfAwareness"],
  ["ghost", "GHOST", "The Disappearing Act", "Biến mất khỏi cuộc trò chuyện khi mọi thứ trở nên căng thẳng.", "#dde9f3", "#1f3f5c", "avoider"],
  ["yikes", "YIKES", "The Panic Button", "Dễ hoảng khi tình huống xã hội trở nên khó xử.", "#f6e9d2", "#6a4512", "socialAwareness"],
  ["chill", "CHILL", "The Cool Head", "Bình tĩnh, không dễ bị cuốn theo drama.", "#e2eedf", "#2c5a2a", "regulation"],
  ["ouch", "OUCH", "The Sensitive One", "Dễ bị lời nói hoặc thái độ của người khác làm tổn thương.", "#f3e0e8", "#6d2346", "empathy"],
  ["idk", "IDK", "The Indecisive One", "Khó quyết định khi phải chọn giữa nhiều cảm xúc hoặc lợi ích.", "#e6e6e6", "#333333", "selfAwareness"],
  ["bruh", "BRUH", "The Done One", "Phản ứng bằng bất lực, chán nản hoặc cà khịa khi gặp chuyện.", "#f6e4d3", "#6b3a14", "avoider"],
  ["real", "REAL", "The Straight Shooter", "Thẳng thắn, dám nói thật nhưng cần học cách chọn lời.", "#e2eedf", "#24502c", "communication"],
  ["main", "MAIN", "The Main Character", "Dễ đặt góc nhìn của mình làm trung tâm tình huống.", "#e6e1f3", "#352a63", "socialAwareness"],
  ["petty", "PETTY", "The Scorekeeper", "Nhớ dai những lần bị đối xử không công bằng, thích đáp trả.", "#f6dede", "#7a2430", "communication"],
  ["bet", "BET", "The Doer", "Sẵn sàng hành động thay vì ngồi than phiền mãi.", "#dde9f3", "#1d3d5e", "relationship"],
  ["oops", "OOPS", "The Oopsie", "Lỡ phản ứng bốc đồng rồi mới nhận ra hậu quả.", "#f6e9d2", "#64430f", "communication"],
  ["sure", "SURE.", "The Passive-Aggressive One", "Nói “ừ, sao cũng được” nhưng thái độ lại nói điều khác.", "#f3e0e8", "#6a2244", "empathy"],
  ["welp", "WELP", "The Resigned One", "Dễ buông xuôi khi mọi thứ không diễn ra như mong đợi.", "#e6e6e6", "#2f2f2f", "avoider"],
  ["slay", "SLAY", "The Confident One", "Tự tin thể hiện bản thân, dám đứng ra xử lý tình huống.", "#e2eedf", "#24502c", "relationship"],
]

eq(TYPES.length, 16, "đúng 16 kiểu")
eq(new Set(TYPES.map((t) => t.key)).size, 16, "key không trùng")
eq(new Set(TYPES.map((t) => t.code)).size, 16, "mã không trùng")

SPEC.forEach(([key, code, title, desc, bg, ink, mascot], i) => {
  const at = `[${key}]`
  eq(TYPES[i]?.key, key, `kiểu thứ ${i + 1} là "${key}"`)
  const t = TYPE_BY_KEY[key]
  ok(Boolean(t), `${at} có trong TYPE_BY_KEY`)
  if (!t) return
  eq(t.code, code, `${at} đúng mã`)
  eq(t.title, title, `${at} đúng tên`)
  eq(t.desc, desc, `${at} đúng mô tả`)
  eq(t.colors?.bg, bg, `${at} đúng màu nền`)
  eq(t.colors?.ink, ink, `${at} đúng màu chữ`)
  eq(t.mascot, mascot, `${at} đúng linh vật`)
  eq(t.strengths?.length, 2, `${at} có hai điểm mạnh`)
  eq(t.watchOuts?.length, 2, `${at} có hai điều nên để ý`)
  ok(typeof t.tip === "string" && t.tip.trim().length > 0, `${at} có một mẹo`)
  ok(t.patterns && typeof t.patterns === "object", `${at} có bảng trọng số mẫu`)
  for (const pattern of Object.keys(t.patterns)) ok(pattern in EQ_PATTERNS, `${at} mẫu "${pattern}" có trong eqPatterns.js`)
  ok(Boolean(MASCOTS_BY_KEY[t.mascot]), `${at} linh vật "${t.mascot}" có trong mascots.js`)
})

/* ── 2. pickType trên các bộ câu trả lời giả định ────────────────────────── */
const ids = FORMS[FORM_ORDER[0]]
const items = ids.map((id) => ITEM_BY_ID[id])

// Bộ 1: mọi câu có lựa chọn "avoids" đều chọn né → GHOST thắng tuyệt đối.
const allAvoids = Object.fromEntries(
  items.map((i) => [i.id, i.choices.find((c) => c.pattern === "avoids")?.id]).filter(([, choiceId]) => choiceId),
)
ok(Object.keys(allAvoids).length >= 2, `bộ giả định có ≥ 2 lựa chọn né (${Object.keys(allAvoids).length})`)
eq(pickType(allAvoids).type?.key, "ghost", "toàn bộ lựa chọn né → GHOST")

// Bộ 2: chọn mạnh nhất mọi tình huống → vẫn ra một kiểu hợp lệ.
const best = Object.fromEntries(items.map((i) => [i.id, strongestChoice(i).id]))
ok(Boolean(pickType(best).type?.key) && Boolean(TYPE_BY_KEY[pickType(best).type.key]), "chọn mạnh nhất mọi câu → một kiểu hợp lệ")

// Bộ 3: chưa trả lời gì → IDK, không có kiểu nhì.
const empty = pickType({})
eq(empty.type?.key, "idk", "chưa có câu trả lời → IDK")
eq(empty.alt, null, "IDK không kèm kiểu nhì")

/* ── 3. Đám đông chọn ngẫu nhiên, seed cố định (chung RNG với types-sim.mjs) ── */
{
  const n = 2000
  const tally = simulate(n)
  const pct = Object.fromEntries(TYPES.map((t) => [t.key, (tally[t.key] / n) * 100]))
  const at = (key) => TYPES.find((t) => t.key === key).code
  for (const t of TYPES) ok(pct[t.key] >= 1, `kiểu "${t.code}" đạt ≥ 1% khi mô phỏng ${n} người`, `${pct[t.key].toFixed(2)}%`)
  for (const t of TYPES) ok(pct[t.key] <= 18, `kiểu "${t.code}" không vượt 18% khi mô phỏng ${n} người`, `${pct[t.key].toFixed(2)}%`)
  ok(pct.idk <= 12, `IDK ≤ 12% khi mô phỏng ${n} người`, `${pct.idk.toFixed(2)}%`)
  console.log(`  mô phỏng ${n} người: ${TYPES.map((t) => `${at(t.key)} ${pct[t.key].toFixed(1)}`).join(" · ")}`)
}

/* ── Kết luận ──────────────────────────────────────────────────────────── */
if (failures.length) {
  console.error(`\n✗ KIỂU: ${failures.length} lỗi (${passed} phép kiểm đạt):`)
  for (const failure of failures.slice(0, 60)) console.error(`  · ${failure}`)
  process.exit(1)
}
console.log(`\n✓ KIỂU: ${passed} phép kiểm đạt, 0 lỗi.`)
