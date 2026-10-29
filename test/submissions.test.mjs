/* submissions.test.mjs — ghi lượt làm, chấm lại profile ở máy chủ, khoá trang quản trị. */
import assert from "node:assert/strict"
import { mkdtemp, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { QUEST_BANK } from "../public/js/data/questBank.js"
import { EQ_PROFILE_KEYS } from "../public/js/data/eqProfiles.js"
import { scoreQuestAnswers } from "../public/js/core/questScoring.js"
import { buildSubmission, handleAdmin, handleStats, storeFor } from "../lib/submissions.mjs"

const order = QUEST_BANK.slice(0, 10).map((q) => q.id)
const best = Object.fromEntries(QUEST_BANK.slice(0, 10).map((q) => [q.id, q.choices.find((c) => c.code === "D")?.id ?? q.choices[0].id]))

// Chấm lại từ lựa chọn, bỏ qua mã lạ và profile/band do trình duyệt gửi.
const sub = buildSubmission({ band: "low", profile: "quickReactor", t: 123.4, order: [...order, "EQ_99", "constructor"], answers: { ...best, EQ_99: "x", EQ_01: best.EQ_01 } })
assert.equal(sub.seconds, 123)
assert.equal(Object.keys(sub.answers).length, 10)
assert.deepEqual(sub.order, order)
assert.equal(Object.keys(sub.counts).length, 10)
assert.equal(Object.values(sub.counts).reduce((a, b) => a + b, 0), 10)
assert.ok(EQ_PROFILE_KEYS.includes(sub.profile))
assert.equal(sub.counts[sub.profile], Math.max(...Object.values(sub.counts)), "profile kết quả có nhiều phiếu nhất")
assert.equal(sub.profile, scoreQuestAnswers(best, order).top, "khớp quy tắc chấm của trình duyệt")
assert.ok(!("band" in sub) && !("traits" in sub), "không còn band/traits")

// Không có lựa chọn hợp lệ thì từ chối (kể cả dạng cũ chỉ có band).
assert.equal(buildSubmission({ band: "mid", t: 5 }), null)
assert.equal(buildSubmission({ band: "nope" }), null)
assert.equal(buildSubmission({ answers: { EQ_01: "EQ_02_A" } }), null)
assert.equal(buildSubmission(null), null)
// Không gửi order vẫn chấm được.
assert.ok(buildSubmission({ answers: { EQ_01: "EQ_01_A" } }).order.length === 0)

// Kho file: POST rồi admin đọc lại.
const dir = await mkdtemp(join(tmpdir(), "eq-subs-"))
try {
  const store = storeFor({}, { dataDir: dir })
  const post = (body) => handleStats(new Request("http://x/api/stats", { method: "POST", body: JSON.stringify(body) }), { store })
  assert.equal((await post({ t: 60, order, answers: best })).status, 202)
  assert.equal((await post({ t: 10, answers: { EQ_01: "EQ_01_D" } })).status, 202)
  assert.equal((await post({ band: "?" })).status, 400)

  const stats = await (await handleStats(new Request("http://x/api/stats"), { store })).json()
  assert.equal(stats.total, 2)
  assert.equal(Object.values(stats.profiles).reduce((a, b) => a + b, 0), 2)
  assert.equal(stats.profiles[sub.profile] >= 1, true)

  const env = { ADMIN_USER: "quản trị", ADMIN_PASSWORD: "s3:cret" }
  const basic = (u, p) => ({ Authorization: `Basic ${Buffer.from(`${u}:${p}`).toString("base64")}` })
  const admin = (headers = {}) => handleAdmin(new Request("http://x/api/admin", { headers }), { env, store })
  assert.equal((await admin()).status, 401)
  assert.equal((await admin(basic("quản trị", "wrong"))).status, 401)
  assert.equal((await admin(basic("khác", "s3:cret"))).status, 401)
  assert.equal((await admin({ Authorization: "Bearer s3:cret" })).status, 401)
  const ok = await admin(basic("quản trị", "s3:cret"))
  assert.equal(ok.status, 200)
  const body = await ok.json()
  assert.equal(body.storage, "file")
  assert.equal(body.submissions.length, 2)
  assert.equal(body.submissions[0].profile, "steadyNavigator", "mới nhất trước (câu 1 đáp án D → steadyNavigator)")
  assert.equal(body.submissions[1].profile, sub.profile)

  // Chưa đặt tài khoản: đóng, trừ khi máy chạy thử cho phép loopback.
  assert.equal((await handleAdmin(new Request("http://x/api/admin"), { env: {}, store })).status, 503)
  assert.equal((await handleAdmin(new Request("http://x/api/admin"), { env: {}, store, trustLocal: true })).status, 200)
} finally {
  await rm(dir, { recursive: true, force: true })
}

// Kho file có sẵn stats.json cũ (bản năm đặc tính): đọc được, không mất số đếm cũ, ghi thêm profile mới.
const legacyDir = await mkdtemp(join(tmpdir(), "eq-legacy-"))
try {
  await writeFile(join(legacyDir, "stats.json"), JSON.stringify({ total: 5, bands: { high: 1, mid: 3, low: 1 }, updatedAt: "2026-01-01T00:00:00.000Z" }))
  await writeFile(join(legacyDir, "submissions.jsonl"), JSON.stringify({ id: "old", at: "2026-01-01T00:00:00.000Z", seconds: 90, band: "mid", mean: 50, top: "empathy", traits: { empathy: 80 }, answers: { EQ_01: "EQ_01_D" } }) + "\n")
  const store = storeFor({ EQ_DATA_DIR: legacyDir })
  assert.equal(store.kind, "file")
  assert.equal((await store.stats()).total, 5)
  assert.equal((await store.list()).length, 1)
  await store.add(sub)
  const after = await store.stats()
  assert.equal(after.total, 6)
  assert.equal(after.profiles[sub.profile], 1)
  assert.equal(after.bands.mid, 3)
  assert.equal((await store.list())[0].id, sub.id)
} finally {
  await rm(legacyDir, { recursive: true, force: true })
}

// Vercel không có Redis: không ghi đĩa, báo 503 thay vì lỗi.
const none = storeFor({}, { allowFile: false })
assert.equal(none, null)
assert.equal((await handleStats(new Request("http://x/api/stats", { method: "POST", body: JSON.stringify({ answers: best }) }), { store: none })).status, 503)

// Redis: lệnh gửi đúng dạng pipeline REST của Upstash.
const calls = []
globalThis.fetch = async (url, init) => {
  calls.push({ url, init })
  const cmds = JSON.parse(init.body)
  return new Response(JSON.stringify(cmds.map(([c]) => ({ result: c === "LRANGE" ? [JSON.stringify(sub)] : c === "HGETALL" ? ["total", "7", "profile:quickReactor", "3", "high", "2"] : 1 }))))
}
const redis = storeFor({ KV_REST_API_URL: "https://kv.example/", KV_REST_API_TOKEN: "tok" })
assert.equal(redis.kind, "redis")
await redis.add(sub)
assert.equal(calls[0].url, "https://kv.example/pipeline")
assert.equal(calls[0].init.headers.Authorization, "Bearer tok")
assert.deepEqual(JSON.parse(calls[0].init.body)[0].slice(0, 2), ["LPUSH", "eq:subs"])
assert.ok(JSON.parse(calls[0].init.body).some((c) => c[0] === "HINCRBY" && c[2] === `profile:${sub.profile}`))
const rs = await redis.stats()
assert.equal(rs.total, 7)
assert.equal(rs.profiles.quickReactor, 3)
assert.equal(rs.bands.high, 2, "giữ số đếm theo mức của bản cũ")
assert.equal((await redis.list())[0].id, sub.id)

console.log("submissions: ok")
