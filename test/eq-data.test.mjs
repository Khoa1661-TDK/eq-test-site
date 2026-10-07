/**
 * Kiểm tra dữ liệu EQ (không cần trình duyệt) — mô hình sáu kỹ năng.
 *
 *   node test/eq-data.test.mjs
 *
 * Bộ này giữ các quy tắc soạn tình huống mà điểm số dựa vào: đúng sáu kỹ năng,
 * trọng số chính/phụ, mọi phương án đo cùng tập kỹ năng, một phương án mạnh nhất
 * trên mọi kỹ năng (để điểm tối đa đúng 100), mỗi tình huống thật sự phân loại được,
 * và mỗi phương án gắn một mẫu chiến lược. Chạy trước scoring.test.mjs.
 */
import { EQ_DIMENSIONS, EQ_BY_KEY } from "../public/js/data/eqDimensions.js"
import { EQ_PATTERNS, PATTERN_KEYS } from "../public/js/data/eqPatterns.js"
import { SCENARIOS, SCENARIO_BY_ID, SCENARIOS_BY_DOMAIN, EQ_DOMAIN_ORDER } from "../public/js/data/scenarios.js"
import { SCENE_SCENARIOS } from "../public/js/data/sceneScenarios.js"
import { FORMS, FORM_ORDER, PRACTICE_IDS } from "../public/js/data/forms.js"
import { STAGING } from "../public/js/data/staging.js"
import { CHARACTERS } from "../public/js/scene/sprites.js"
import {
  ITEMS,
  ITEM_BY_ID,
  MAX_CHOICE_SCORE,
  PRIMARY_WEIGHT,
  SECONDARY_WEIGHT,
  EVIDENCE_FLOOR,
  ceilingOf,
} from "../public/js/core/eqScoring.js"

let passed = 0
const failures = []

function ok(condition, label, detail) {
  if (condition) {
    passed += 1
    return
  }
  failures.push(detail ? `${label} — ${detail}` : label)
}

function eq(actual, expected, label) {
  ok(actual === expected, label, `nhận ${JSON.stringify(actual)}, mong ${JSON.stringify(expected)}`)
}

const SKILLS = ["selfAwareness", "regulation", "empathy", "socialAwareness", "communication", "relationship"]
const VIETNAMESE = /[àáảãạăằắẳẵặâầấẩẫậđèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ]/i
/** Cảnh động được kiểm chặt sau khi chuyển về bối cảnh trường học (bước 8). */
const STRICT_SCENES = SCENE_SCENARIOS.every((s) => s.weights && s.domain)

/* ── 1. Sáu kỹ năng ────────────────────────────────────────────────────── */
eq(EQ_DIMENSIONS.map((d) => d.key).join(","), SKILLS.join(","), "đúng sáu kỹ năng theo thứ tự")
eq(EQ_DOMAIN_ORDER.join(","), SKILLS.join(","), "EQ_DOMAIN_ORDER khớp sáu kỹ năng")
eq(new Set(EQ_DIMENSIONS.map((d) => d.code)).size, EQ_DIMENSIONS.length, "mã hiển thị không trùng")

for (const dim of EQ_DIMENSIONS) {
  const at = `[${dim.key}]`
  ok(typeof dim.code === "string" && dim.code.length > 0, `${at} có mã hiển thị`)
  ok(VIETNAMESE.test(dim.name ?? ""), `${at} tên là tiếng Việt có dấu`)
  for (const field of ["tagline", "question"]) {
    ok(typeof dim[field] === "string" && dim[field].trim().length > 0, `${at} có ${field}`)
  }
  eq(dim.includes?.length, 4, `${at} có 4 mục bao gồm`)
  eq(dim.exercises?.length, 5, `${at} có 5 bài tập`)
  for (const ex of dim.exercises ?? []) {
    for (const field of ["name", "how", "why"]) {
      ok(typeof ex[field] === "string" && ex[field].trim().length > 0, `${at} bài tập "${ex.name}" có ${field}`)
    }
  }
  const labels = new Set()
  for (const band of ["high", "mid", "low"]) {
    const b = dim.bands?.[band]
    ok(b && typeof b.label === "string" && b.label.trim().length > 0, `${at} band ${band} có nhãn`)
    ok(b && typeof b.meaning === "string" && b.meaning.trim().length > 0, `${at} band ${band} có giải thích`)
    eq(b?.examples?.length, 2, `${at} band ${band} có 2 ví dụ`)
    labels.add(b?.label)
  }
  eq(labels.size, 3, `${at} ba band có ba nhãn khác nhau`)
  eq(EQ_BY_KEY[dim.key], dim, `EQ_BY_KEY["${dim.key}"] trỏ đúng object`)
}

/* ── 2. Mẫu chiến lược ─────────────────────────────────────────────────── */
eq(PATTERN_KEYS.length, 19, "có 19 mẫu chiến lược")
for (const key of PATTERN_KEYS) {
  const p = EQ_PATTERNS[key]
  for (const field of ["label", "swap", "cue"]) {
    ok(typeof p?.[field] === "string" && p[field].trim().length > 0, `[pattern ${key}] có ${field}`)
  }
  ok(typeof p?.effective === "boolean", `[pattern ${key}] có effective true/false`)
}

/* ── 3. Quy tắc chung cho mọi tình huống (chữ và cảnh) ─────────────────── */
function checkScoring(item, at, { strict = true } = {}) {
  const choices = Array.isArray(item.choices) ? item.choices : []
  ok(SKILLS.includes(item.domain), `${at} domain là một trong sáu kỹ năng`, `domain="${item.domain}"`)

  const weights = item.weights ?? {}
  const keys = Object.keys(weights)
  ok(keys.length >= 2 && keys.length <= 3, `${at} đo 2–3 kỹ năng`, `nhận ${keys.join(",")}`)
  eq(weights[item.domain], PRIMARY_WEIGHT, `${at} kỹ năng chính có trọng số 1`)
  for (const key of keys) {
    ok(SKILLS.includes(key), `${at} trọng số "${key}" là kỹ năng hợp lệ`)
    if (key !== item.domain) eq(weights[key], SECONDARY_WEIGHT, `${at} kỹ năng phụ ${key} có trọng số 0,5`)
  }

  const keySet = keys.slice().sort().join("+")
  for (const c of choices) {
    eq(Object.keys(c.scores ?? {}).sort().join("+"), keySet, `${at}${c.code} chấm đúng tập kỹ năng của trọng số`)
    for (const [key, value] of Object.entries(c.scores ?? {})) {
      ok(Number.isInteger(value) && value >= 0 && value <= MAX_CHOICE_SCORE, `${at}${c.code}.${key} là số nguyên 0..3`, `nhận ${value}`)
    }
    if (strict) ok(PATTERN_KEYS.includes(c.pattern), `${at}${c.code} có mẫu chiến lược hợp lệ`, `pattern="${c.pattern}"`)
  }
  if (!choices.length || !keys.length) return

  const primary = choices.map((c) => c.scores?.[item.domain] ?? 0)
  eq(Math.max(...primary), MAX_CHOICE_SCORE, `${at} có phương án đạt 3 ở kỹ năng chính`)
  ok(Math.min(...primary) <= 1, `${at} có phương án ≤ 1 ở kỹ năng chính`, primary.join("/"))

  // Một phương án đạt trần trên MỌI kỹ năng: điểm tối đa của bài là đúng 100.
  const dominant = choices.filter((c) => keys.every((key) => (c.scores?.[key] ?? 0) === ceilingOf(item, key)))
  ok(dominant.length >= 1, `${at} có một phương án mạnh nhất trên mọi kỹ năng được đo`,
    choices.map((c) => `${c.code}:${keys.map((k) => c.scores?.[k]).join(",")}`).join(" "))

  ok(item.practice && typeof item.practice === "object", `${at} có khối practice`)
  for (const field of ["signal", "stronger", "principle"]) {
    ok(typeof item.practice?.[field] === "string" && item.practice[field].trim().length > 0, `${at} practice.${field} có nội dung`)
  }
}

/* ── 4. Tình huống chữ ─────────────────────────────────────────────────── */
ok(SCENARIOS.length >= 24, "có ít nhất 24 tình huống chữ", `nhận ${SCENARIOS.length}`)
eq(Object.keys(SCENARIO_BY_ID).length, SCENARIOS.length, "SCENARIO_BY_ID đủ mọi tình huống")

for (const s of SCENARIOS) {
  const at = `[${s.id}]`
  ok(typeof s.face === "string" && s.face.length > 0, `${at} có face`)
  ok(typeof s.title === "string" && s.title.trim().length > 0, `${at} có title`)
  ok(VIETNAMESE.test(s.prompt ?? ""), `${at} prompt là tiếng Việt có dấu`)
  const dialogue = Array.isArray(s.dialogue) ? s.dialogue : []
  ok(dialogue.length >= 2 && dialogue.length <= 4, `${at} có 2–4 nhịp thoại`, `nhận ${dialogue.length}`)
  for (const line of dialogue) ok(typeof line === "string" && line.length > 0 && line.length <= 200, `${at} nhịp thoại 1–200 ký tự`)

  const choices = s.choices ?? []
  eq(choices.map((c) => c.code).join(""), "ABCD", `${at} có 4 phương án A,B,C,D`)
  eq(new Set(choices.map((c) => c.id)).size, choices.length, `${at} id phương án không trùng`)
  eq(new Set(choices.map((c) => (c.text ?? "").trim().toLowerCase())).size, choices.length, `${at} các phương án khác nhau về chữ`)
  for (const c of choices) {
    ok(VIETNAMESE.test(c.text ?? "") && c.text.length <= 220, `${at}${c.code} nội dung tiếng Việt ≤ 220 ký tự`)
    ok(typeof c.strategy === "string" && c.strategy.trim().length > 0, `${at}${c.code} có strategy`)
    ok(typeof c.consequence === "string" && c.consequence.trim().length > 0, `${at}${c.code} có consequence`)
  }
  checkScoring(s, at)
}

/* ── 5. Cảnh động ──────────────────────────────────────────────────────── */
for (const scene of SCENE_SCENARIOS) {
  const at = `[${scene.id}]`
  ok(Array.isArray(scene.choices) && scene.choices.length >= 3, `${at} có ít nhất 3 lựa chọn`)
  ok(scene.consequences && scene.choices.every((c) => Array.isArray(scene.consequences[c.id])), `${at} mỗi lựa chọn có hậu quả diễn ra`)
  if (STRICT_SCENES) checkScoring(scene, at)
}
if (!STRICT_SCENES) console.log("  (cảnh động: chưa kiểm chặt — chờ bước chuyển về trường học)")

/* ── 6. Ngân hàng, đề A/B, kho luyện ───────────────────────────────────── */
eq(new Set(ITEMS.map((i) => i.id)).size, ITEMS.length, "mã tình huống không trùng giữa chữ và cảnh")
for (const form of FORM_ORDER) {
  const ids = FORMS[form] ?? []
  ok(ids.length > 0, `đề ${form} có tình huống`)
  ok(ids.every((id) => ITEM_BY_ID[id]), `đề ${form} chỉ chứa tình huống có thật`)
  eq(new Set(ids).size, ids.length, `đề ${form} không lặp tình huống`)
  const primaryCount = Object.fromEntries(SKILLS.map((k) => [k, 0]))
  for (const id of ids) if (ITEM_BY_ID[id]) primaryCount[ITEM_BY_ID[id].domain] += 1
  for (const key of SKILLS) {
    ok(primaryCount[key] >= EVIDENCE_FLOOR, `đề ${form}: ${key} là kỹ năng chính ở ≥ ${EVIDENCE_FLOOR} tình huống`, `nhận ${primaryCount[key]}`)
  }
  console.log(`  đề ${form}: ${ids.length} tình huống · ${SKILLS.map((k) => `${EQ_BY_KEY[k]?.code ?? k} ${primaryCount[k]}`).join(" · ")}`)
}
ok(PRACTICE_IDS.every((id) => ITEM_BY_ID[id]), "kho luyện chỉ chứa tình huống có thật")

const byDomain = Object.fromEntries(SKILLS.map((k) => [k, (SCENARIOS_BY_DOMAIN[k] ?? []).length]))
eq(Object.values(byDomain).reduce((a, b) => a + b, 0), SCENARIOS.length, "SCENARIOS_BY_DOMAIN phủ đủ mọi tình huống chữ")
console.log(`  tình huống chữ theo kỹ năng chính: ${SKILLS.map((k) => `${k} ${byDomain[k]}`).join(" · ")}`)

/* ── 7. Dàn dựng cảnh cho tình huống chữ ──────────────────────────────── */
const PLACES = ["classroom", "schoolyard", "canteen", "corridor", "bedroom", "library", "home", "street", "park", "cafe"]
const ACTIONS = new Set([
  "walkTo", "leave", "idle", "talk", "nod", "shakeHead", "point", "lookAt", "turn", "face", "happy", "sad",
  "angry", "annoyed", "surprised", "nervous", "thinking", "reaction", "screenShake", "cameraFocus", "fade",
  "say", "think", "emote", "hop", "shiver", "slump", "lean", "stepBack", "bounce", "nodYes", "shakeNo",
  "zoom", "zoomReset", "pan", "tint", "chat", "typing", "chatClose", "decisionPoint",
])
const EMOTE_KINDS = new Set(["sweat", "anger", "heart", "sparkle", "question", "exclaim", "ellipsis", "tear", "music", "zzz", "gloom"])
/** Bật khi mọi tình huống chữ đã có dàn dựng. */
const STRICT_STAGING = SCENARIOS.every((s) => STAGING[s.id])

function checkEvents(events, at, castIds, { needsDecision }) {
  ok(Array.isArray(events) && events.length > 0, `${at} có sự kiện`)
  if (!Array.isArray(events)) return
  let last = -1
  for (const ev of events) {
    ok(ACTIONS.has(ev.do), `${at} hành động "${ev.do}" có thật`)
    ok(Number.isFinite(ev.at) && ev.at >= last, `${at} mốc thời gian tăng dần`, `${ev.at}`)
    last = ev.at ?? last
    if (ev.char) ok(castIds.has(ev.char), `${at} nhân vật "${ev.char}" có trong cảnh`)
    if (["walkTo"].includes(ev.do)) ok(ev.x >= 20 && ev.x <= 300, `${at} walkTo x trong 20..300`, `${ev.x}`)
    if (ev.do === "say" || ev.do === "think") ok(typeof ev.text === "string" && ev.text.length > 0 && ev.text.length <= 70 && VIETNAMESE.test(ev.text), `${at} say ≤ 70 ký tự tiếng Việt`, ev.text)
    if (ev.do === "emote") ok(EMOTE_KINDS.has(ev.kind), `${at} emote "${ev.kind}" có thật`)
    if (ev.do === "chat") ok(typeof ev.text === "string" && ev.text.length <= 90, `${at} tin nhắn ≤ 90 ký tự`)
    if (["lean", "stepBack", "lookAt", "zoom"].includes(ev.do) && typeof ev.target === "string") ok(castIds.has(ev.target), `${at} target "${ev.target}" có trong cảnh`)
  }
  if (needsDecision) eq(events.at(-1)?.do, "decisionPoint", `${at} kết thúc bằng decisionPoint`)
  else ok(!events.some((e) => e.do === "decisionPoint"), `${at} hậu quả không có decisionPoint`)
  const end = events.at(-1)?.at ?? 0
  ok(end <= (needsDecision ? 8000 : 6000), `${at} không kéo quá dài`, `${end}ms`)
}

for (const [id, st] of Object.entries(STAGING)) {
  const at = `[stage ${id}]`
  const item = SCENARIO_BY_ID[id]
  ok(item, `${at} là một tình huống chữ có thật`)
  if (!item) continue
  ok(PLACES.includes(st.environment), `${at} bối cảnh hợp lệ`, st.environment)
  const cast = Array.isArray(st.cast) ? st.cast : []
  const castIds = new Set(cast.map((c) => c.id))
  eq(castIds.size, cast.length, `${at} không lặp nhân vật`)
  ok(castIds.has("player"), `${at} có người chơi`)
  // Cảnh chỉ có người chơi cầm điện thoại (tin nhắn nhóm) được phép đứng một mình.
  const phoneOnly = [...(st.timeline ?? []), ...Object.values(st.consequences ?? {}).flat()].some((e) => e.do === "chat")
  ok(cast.length >= (phoneOnly ? 1 : 2) && cast.length <= 4, `${at} ${phoneOnly ? "1" : "2"}–4 nhân vật`)
  for (const c of cast) {
    ok(CHARACTERS[c.id], `${at} nhân vật "${c.id}" có sprite`)
    ok(c.x >= 20 && c.x <= 300, `${at} ${c.id} đứng trong khung`, `${c.x}`)
    ok(typeof c.name === "string" && c.name.length > 0, `${at} ${c.id} có tên`)
  }
  eq(st.speakers?.length, item.dialogue.length, `${at} mỗi câu thoại có người nói`)
  for (const who of st.speakers ?? []) ok(who === "narrator" || castIds.has(who), `${at} người nói "${who}" có trong cảnh`)
  checkEvents(st.timeline, `${at} timeline`, castIds, { needsDecision: true })
  for (const choice of item.choices) {
    const letter = choice.id.slice(id.length + 1)
    checkEvents(st.consequences?.[letter], `${at} hậu quả ${letter}`, castIds, { needsDecision: false })
  }
}
console.log(`  dàn dựng: ${Object.keys(STAGING).length}/${SCENARIOS.length} tình huống chữ${STRICT_STAGING ? "" : " (chưa đủ — chưa kiểm chặt)"}`)
if (STRICT_STAGING) ok(SCENARIOS.every((s) => STAGING[s.id]), "mọi tình huống chữ đều có dàn dựng")

/* ── Kết luận ──────────────────────────────────────────────────────────── */
if (failures.length) {
  console.error(`\n✗ DỮ LIỆU EQ: ${failures.length} lỗi (${passed} phép kiểm đạt):`)
  for (const failure of failures.slice(0, 80)) console.error(`  · ${failure}`)
  if (failures.length > 80) console.error(`  · … và ${failures.length - 80} lỗi nữa`)
  process.exit(1)
}
console.log(`\n✓ DỮ LIỆU EQ: ${passed} phép kiểm đạt, 0 lỗi.`)
