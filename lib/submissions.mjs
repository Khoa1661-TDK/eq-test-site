/* submissions.mjs — lưu từng lượt làm E-Quest và trang quản trị đọc lại.
   Dùng chung cho server.mjs (chạy máy) và các hàm Vercel trong api/.

   Mỗi lượt lưu: thời điểm, thời gian làm, các lựa chọn (mã câu → mã phương án) và điểm năm đặc tính.
   Điểm được chấm lại ở máy chủ từ các lựa chọn, không tin số liệu trình duyệt gửi lên.
   Không lưu IP, tên, user-agent hay bất kỳ thông tin nhận dạng nào.

   Kho lưu:
   - Upstash Redis (REST) khi có KV_REST_API_URL + KV_REST_API_TOKEN (Vercel tự đặt khi gắn Upstash)
     hoặc UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN;
   - không có thì ghi file data/submissions.jsonl (chỉ dùng được khi chạy máy, Vercel không ghi được đĩa). */

import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises"
import { createHash, randomUUID, timingSafeEqual } from "node:crypto"
import { join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { QUEST_BY_ID, scoreQuestAnswers } from "../public/js/core/questScoring.js"

export const BANDS = ["high", "mid", "low"]
const MAX_KEPT = 100_000
const LIST_KEY = "eq:subs"
const STATS_KEY = "eq:stats"

const DEFAULT_DATA_DIR = resolve(fileURLToPath(new URL("../data", import.meta.url)))

export function bandOf(mean) {
  return mean >= 70 ? "high" : mean >= 45 ? "mid" : "low"
}

/** Từ thân yêu cầu thô → bản ghi sạch, hoặc null nếu không hợp lệ.
    Nhận cả dạng cũ { band, t } (không có lựa chọn) để trình duyệt còn giữ bản cũ vẫn được đếm. */
export function buildSubmission(payload, now = new Date()) {
  if (!payload || typeof payload !== "object") return null
  const t = Number(payload.t)
  const seconds = Number.isFinite(t) ? Math.min(86_400, Math.max(0, Math.round(t))) : null

  const answers = {}
  if (payload.answers && typeof payload.answers === "object") {
    for (const [id, choiceId] of Object.entries(payload.answers)) {
      if (QUEST_BY_ID[id]?.choices.some((c) => c.id === choiceId)) answers[id] = choiceId
    }
  }

  const base = { id: randomUUID(), at: now.toISOString(), seconds }
  if (Object.keys(answers).length) {
    const scored = scoreQuestAnswers(answers)
    const traits = Object.fromEntries(scored.traits.map((tr) => [tr.key, tr.score]))
    const mean = Math.round(scored.traits.reduce((sum, tr) => sum + tr.score, 0) / scored.traits.length)
    return { ...base, band: bandOf(mean), mean, top: scored.top, traits, answers }
  }
  const band = String(payload.band || "")
  return BANDS.includes(band) ? { ...base, band, mean: null, top: null, traits: null, answers: null } : null
}

/* ----------------------------------------------------------------- kho lưu */

function emptyStats() {
  return { total: 0, bands: { high: 0, mid: 0, low: 0 }, updatedAt: null }
}

function redisConfig(env) {
  const url = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL
  const token = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN
  return url && token ? { url: url.replace(/\/+$/, ""), token } : null
}

function redisStore({ url, token }) {
  async function pipeline(commands) {
    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(commands),
    })
    if (!res.ok) throw new Error(`redis ${res.status}`)
    const out = await res.json()
    const failed = out.find((r) => r.error)
    if (failed) throw new Error(`redis: ${failed.error}`)
    return out.map((r) => r.result)
  }

  return {
    kind: "redis",
    async add(sub) {
      const cmds = [
        ["LPUSH", LIST_KEY, JSON.stringify(sub)],
        ["LTRIM", LIST_KEY, "0", String(MAX_KEPT - 1)],
        ["HINCRBY", STATS_KEY, "total", "1"],
        ["HINCRBY", STATS_KEY, sub.band, "1"],
        ["HSET", STATS_KEY, "updatedAt", sub.at],
      ]
      if (sub.seconds != null) cmds.push(["HSET", STATS_KEY, "lastSeconds", String(sub.seconds)])
      await pipeline(cmds)
    },
    async stats() {
      const [flat] = await pipeline([["HGETALL", STATS_KEY]])
      const h = {}
      for (let i = 0; i + 1 < (flat?.length ?? 0); i += 2) h[flat[i]] = flat[i + 1]
      const stats = emptyStats()
      stats.total = Number(h.total) || 0
      for (const band of BANDS) stats.bands[band] = Number(h[band]) || 0
      stats.updatedAt = h.updatedAt || null
      if (h.lastSeconds != null) stats.lastSeconds = Number(h.lastSeconds)
      return stats
    },
    async list() {
      const [rows] = await pipeline([["LRANGE", LIST_KEY, "0", "-1"]])
      return (rows ?? []).map(parseRow).filter(Boolean)
    },
  }
}

function parseRow(line) {
  try {
    return JSON.parse(line)
  } catch {
    return null
  }
}

function fileStore(dir) {
  const statsFile = join(dir, "stats.json")
  const subsFile = join(dir, "submissions.jsonl")

  async function stats() {
    try {
      const parsed = JSON.parse(await readFile(statsFile, "utf8"))
      // Dạng cũ đếm theo mã phân loại cũ ({ types: {...} }) không còn dùng: coi như chưa có dữ liệu EQ.
      if (!parsed?.bands || typeof parsed.bands !== "object") return emptyStats()
      const out = emptyStats()
      out.total = Number(parsed.total) || 0
      for (const band of BANDS) out.bands[band] = Number(parsed.bands[band]) || 0
      out.updatedAt = typeof parsed.updatedAt === "string" ? parsed.updatedAt : null
      const last = Number(parsed.lastSeconds)
      if (Number.isFinite(last)) out.lastSeconds = last
      return out
    } catch {
      return emptyStats()
    }
  }

  return {
    kind: "file",
    stats,
    async add(sub) {
      await mkdir(dir, { recursive: true })
      await appendFile(subsFile, JSON.stringify(sub) + "\n", "utf8")
      const s = await stats()
      s.total += 1
      s.bands[sub.band] += 1
      s.updatedAt = sub.at
      if (sub.seconds != null) s.lastSeconds = sub.seconds
      await writeFile(statsFile, JSON.stringify(s, null, 2) + "\n", "utf8")
    },
    async list() {
      let text = ""
      try {
        text = await readFile(subsFile, "utf8")
      } catch {
        return []
      }
      // Mới nhất trước, giống Redis LPUSH.
      return text.split("\n").filter(Boolean).map(parseRow).filter(Boolean).reverse()
    },
  }
}

export function storeFor(env = process.env, { dataDir = DEFAULT_DATA_DIR, allowFile = true } = {}) {
  const redis = redisConfig(env)
  if (redis) return redisStore(redis)
  return allowFile ? fileStore(dataDir) : null
}

/* -------------------------------------------------------------- xác thực */

const digest = (s) => createHash("sha256").update(String(s)).digest()

const same = (a, b) => timingSafeEqual(digest(a), digest(b))

/** Đăng nhập bằng tên + mật khẩu (ADMIN_USER, ADMIN_PASSWORD), gửi dạng "Basic base64(tên:mật khẩu)".
    "ok" | "missing-config" | "denied". trustLocal: máy chạy thử chưa đặt mật khẩu thì cho qua. */
export function checkAdmin(request, env = process.env, { trustLocal = false } = {}) {
  const user = env.ADMIN_USER
  const password = env.ADMIN_PASSWORD
  if (!user || !password) return trustLocal ? "ok" : "missing-config"
  const header = request.headers.get("authorization") || ""
  if (!header.startsWith("Basic ")) return "denied"
  const decoded = Buffer.from(header.slice(6), "base64").toString("utf8")
  const sep = decoded.indexOf(":")
  if (sep < 0) return "denied"
  // Kiểm cả hai, không dừng sớm, để thời gian trả lời không lộ tên đăng nhập có đúng hay không.
  const userOk = same(decoded.slice(0, sep), user)
  const passOk = same(decoded.slice(sep + 1), password)
  return userOk && passOk ? "ok" : "denied"
}

/* -------------------------------------------------------------- xử lý HTTP */

const json = (status, body, extra = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...extra },
  })

/** /api/stats — GET: số đếm công khai; POST: ghi một lượt làm. */
export async function handleStats(request, { env = process.env, store = storeFor(env) } = {}) {
  if (request.method === "GET") {
    return json(200, store ? await store.stats() : emptyStats())
  }
  if (request.method === "POST") {
    const text = await request.text()
    if (text.length > 8 * 1024) return json(413, { ok: false })
    let payload = null
    try {
      payload = JSON.parse(text || "{}")
    } catch {
      payload = null
    }
    const sub = buildSubmission(payload)
    if (!sub) return json(400, { ok: false })
    if (!store) return json(503, { ok: false, error: "storage not configured" })
    await store.add(sub)
    return json(202, { ok: true })
  }
  return json(405, { error: "method not allowed" }, { Allow: "GET, POST" })
}

/** /api/admin — GET: toàn bộ lượt làm (mới nhất trước) + số đếm, cần tên + mật khẩu quản trị. */
export async function handleAdmin(request, { env = process.env, store = storeFor(env), trustLocal = false } = {}) {
  if (request.method !== "GET") return json(405, { error: "method not allowed" }, { Allow: "GET" })
  const auth = checkAdmin(request, env, { trustLocal })
  if (auth === "missing-config") return json(503, { error: "ADMIN_USER / ADMIN_PASSWORD chưa được đặt trên máy chủ" })
  // Không gửi WWW-Authenticate: Basic, để trình duyệt không bật hộp đăng nhập riêng đè lên trang.
  if (auth !== "ok") return json(401, { error: "sai tên đăng nhập hoặc mật khẩu" })
  if (!store) return json(503, { error: "chưa gắn kho lưu (Upstash Redis)" })
  const [stats, submissions] = await Promise.all([store.stats(), store.list()])
  return json(200, { storage: store.kind, stats, submissions })
}
