/* submissions.test.mjs — ghi lượt làm, chấm lại ở máy chủ, khoá trang quản trị. */
import assert from "node:assert/strict"
import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { QUEST_BANK } from "../public/js/data/questBank.js"
import { scoreQuestAnswers } from "../public/js/core/questScoring.js"
import { EQ_PROFILE_KEYS } from "../public/js/data/eqProfiles.js"
import { buildSubmission, handleAdmin, handleStats, storeFor } from "../lib/submissions.mjs"

const best = Object.fromEntries(QUEST_BANK.slice(0, 10).map((q) => [q.id, q.choices.find((c) => c.code === "D")?.id ?? q.choices[0].id]))

// Chấm lại từ lựa chọn, bỏ qua mã lạ và band do trình duyệt gửi.
const sub = buildSubmission({ band: "low", t: 123.4, answers: { ...best, EQ_99: "x", EQ_01: best.EQ_01 } })
assert.equal(sub.seconds, 123)
assert.equal(Object.keys(sub.answers).length, 10)
assert.equal(Object.keys(sub.traits).length, 5)
assert.ok(sub.mean >= 0 && sub.mean <= 100)
assert.equal(sub.band, sub.mean >= 70 ? "high" : sub.mean >= 45 ? "mid" : "low")
assert.equal(sub.profile, scoreQuestAnswers(best, sub.order).profile.top, "lưu kèm profile kết quả")
assert.ok(EQ_PROFILE_KEYS.includes(sub.profile))

// Dạng cũ chỉ có band vẫn đếm được; rác thì từ chối.
assert.equal(buildSubmission({ band: "mid", t: 5 }).traits, null)
assert.equal(buildSubmission({ band: "nope" }), null)
assert.equal(buildSubmission({ answers: { EQ_01: "EQ_02_A" } }), null)
assert.equal(buildSubmission(null), null)

// Kho file: POST rồi admin đọc lại.
const dir = await mkdtemp(join(tmpdir(), "eq-subs-"))
try {
  const store = storeFor({}, { dataDir: dir })
  const post = (body) => handleStats(new Request("http://x/api/stats", { method: "POST", body: JSON.stringify(body) }), { store })
  assert.equal((await post({ t: 60, answers: best })).status, 202)
  assert.equal((await post({ band: "high", t: 10 })).status, 202)
  assert.equal((await post({ band: "?" })).status, 400)

  const stats = await (await handleStats(new Request("http://x/api/stats"), { store })).json()
  assert.equal(stats.total, 2)

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
  assert.equal(body.submissions[0].band, "high", "mới nhất trước")

  // Chưa đặt tài khoản: đóng, trừ khi máy chạy thử cho phép loopback.
  assert.equal((await handleAdmin(new Request("http://x/api/admin"), { env: {}, store })).status, 503)
  assert.equal((await handleAdmin(new Request("http://x/api/admin"), { env: {}, store, trustLocal: true })).status, 200)
} finally {
  await rm(dir, { recursive: true, force: true })
}

// Vercel không có Redis: không ghi đĩa, báo 503 thay vì lỗi.
const none = storeFor({}, { allowFile: false })
assert.equal(none, null)
assert.equal((await handleStats(new Request("http://x/api/stats", { method: "POST", body: JSON.stringify({ band: "mid" }) }), { store: none })).status, 503)

// Redis: lệnh gửi đúng dạng pipeline REST của Upstash.
const calls = []
globalThis.fetch = async (url, init) => {
  calls.push({ url, init })
  const cmds = JSON.parse(init.body)
  return new Response(JSON.stringify(cmds.map(([c]) => ({ result: c === "LRANGE" ? [JSON.stringify(sub)] : c === "HGETALL" ? ["total", "7", "high", "3"] : 1 }))))
}
const redis = storeFor({ KV_REST_API_URL: "https://kv.example/", KV_REST_API_TOKEN: "tok" })
assert.equal(redis.kind, "redis")
await redis.add(sub)
assert.equal(calls[0].url, "https://kv.example/pipeline")
assert.equal(calls[0].init.headers.Authorization, "Bearer tok")
assert.deepEqual(JSON.parse(calls[0].init.body)[0].slice(0, 2), ["LPUSH", "eq:subs"])
assert.equal((await redis.stats()).total, 7)
assert.equal((await redis.list())[0].id, sub.id)

console.log("submissions: ok")
