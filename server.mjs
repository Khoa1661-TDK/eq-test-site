/* server.mjs — máy chủ tĩnh nhỏ cho website đánh giá & luyện EQ + điểm cuối /api/stats.
   Chạy: node server.mjs [--port 8787] */

import { createServer } from "node:http"
import { readFile, writeFile, mkdir, stat } from "node:fs/promises"
import { extname, join, normalize, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = resolve(fileURLToPath(new URL("./public", import.meta.url)))
const DATA_DIR = resolve(fileURLToPath(new URL("./data", import.meta.url)))
const STATS_FILE = join(DATA_DIR, "stats.json")

const argPort = process.argv.indexOf("--port")
const PORT = Number(argPort > -1 ? process.argv[argPort + 1] : process.env.PORT || 8787)

/* --host 0.0.0.0 để mở cho điện thoại trong cùng mạng LAN (mặc định chỉ loopback). */
const argHost = process.argv.indexOf("--host")
const HOST = argHost > -1 ? process.argv[argHost + 1] : process.env.HOST || "127.0.0.1"

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
}

/** SPA: các đường dẫn không có phần mở rộng đều trả về shell index.html. */
function shellFor(pathname) {
  return "index.html"
}

const BANDS = ["high", "mid", "low"]

function emptyStats() {
  return { total: 0, bands: { high: 0, mid: 0, low: 0 }, updatedAt: null }
}

/** Thống kê ẩn danh: chỉ tổng số lượt hoàn thành và số lượt theo mức EQ.
    Không bao giờ đọc hay ghi câu trả lời, mã tình huống, mã phương án hay bất kỳ nội dung nào khác. */
async function readStats() {
  try {
    const parsed = JSON.parse(await readFile(STATS_FILE, "utf8"))
    // Dạng cũ đếm theo mã phân loại cũ ({ types: {...} }) không còn dùng: coi như chưa có dữ liệu EQ.
    if (!parsed || typeof parsed !== "object" || !parsed.bands || typeof parsed.bands !== "object") {
      return emptyStats()
    }
    const stats = emptyStats()
    stats.total = Number(parsed.total) || 0
    for (const band of BANDS) stats.bands[band] = Number(parsed.bands[band]) || 0
    stats.updatedAt = typeof parsed.updatedAt === "string" ? parsed.updatedAt : null
    const last = Number(parsed.lastSeconds)
    if (Number.isFinite(last)) stats.lastSeconds = last
    return stats
  } catch {
    return emptyStats()
  }
}

async function sendFile(res, filePath) {
  const info = await stat(filePath)
  if (!info.isFile()) throw new Error("not a file")
  const body = await readFile(filePath)
  res.writeHead(200, {
    "Content-Type": MIME[extname(filePath)] || "application/octet-stream",
    "Content-Length": body.length,
    "Cache-Control": extname(filePath) === ".html" ? "no-cache" : "public, max-age=300",
  })
  res.end(body)
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`)
  const pathname = decodeURIComponent(url.pathname)

  try {
    if (pathname === "/api/stats") {
      if (req.method === "GET") {
        const stats = await readStats()
        res.writeHead(200, { "Content-Type": MIME[".json"], "Cache-Control": "no-store" })
        res.end(JSON.stringify(stats))
        return
      }
      if (req.method === "POST") {
        const chunks = []
        let size = 0
        for await (const chunk of req) {
          size += chunk.length
          if (size > 8 * 1024) break
          chunks.push(chunk)
        }
        let payload = {}
        try {
          payload = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}")
        } catch {
          payload = {}
        }
        const band = String(payload.band || "")
        const t = Number(payload.t)
        const ok = BANDS.includes(band)
        if (ok) {
          const stats = await readStats()
          stats.bands[band] = (stats.bands[band] || 0) + 1
          stats.total = (stats.total || 0) + 1
          stats.updatedAt = new Date().toISOString()
          if (Number.isFinite(t)) stats.lastSeconds = t
          await mkdir(DATA_DIR, { recursive: true })
          await writeFile(STATS_FILE, JSON.stringify(stats, null, 2) + "\n", "utf8")
        }
        res.writeHead(ok ? 202 : 400, { "Content-Type": MIME[".json"] })
        res.end(JSON.stringify({ ok }))
        return
      }
      res.writeHead(405, { "Content-Type": MIME[".json"], Allow: "GET, POST" })
      res.end(JSON.stringify({ error: "method not allowed" }))
      return
    }

    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405)
      res.end("method not allowed")
      return
    }

    const target = normalize(join(ROOT, pathname))
    if (!target.startsWith(ROOT)) {
      res.writeHead(403)
      res.end("forbidden")
      return
    }

    const isShell = !extname(pathname)
    if (isShell) {
      res.writeHead(200, { "Content-Type": MIME[".html"], "Cache-Control": "no-cache" })
      res.end(await readFile(join(ROOT, shellFor(pathname))))
      return
    }

    try {
      await sendFile(res, target)
    } catch {
      res.writeHead(404, { "Content-Type": MIME[".html"], "Cache-Control": "no-cache" })
      res.end(await readFile(join(ROOT, "index.html")))
    }
  } catch (error) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" })
    res.end(`lỗi máy chủ: ${error.message}`)
  }
})

server.listen(PORT, HOST, () => {
  const label = HOST === "0.0.0.0" || HOST === "::" ? "mọi giao diện" : HOST
  console.log(`EQ HỌC ĐƯỜNG đang chạy tại http://${HOST === "0.0.0.0" ? "127.0.0.1" : HOST}:${PORT}/ (${label})`)
})