/* server.mjs — máy chủ tĩnh nhỏ cho website đánh giá & luyện EQ + /api/stats, /api/admin và trang /admin.
   Chạy: node server.mjs [--port 8787]
   Tài khoản /admin: ADMIN_USER + ADMIN_PASSWORD, đọc từ biến môi trường hoặc file .env (không đưa lên git).
   Chưa đặt thì chỉ máy này (loopback) mở được /admin. */

import { createServer } from "node:http"
import { readFile, stat } from "node:fs/promises"
import { extname, join, normalize, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { handleAdmin, handleStats } from "./lib/submissions.mjs"

// .env cạnh server.mjs (nếu có); biến môi trường đã đặt sẵn thì giữ nguyên, không bị ghi đè.
try {
  process.loadEnvFile(fileURLToPath(new URL("./.env", import.meta.url)))
} catch {
  /* không có .env: bỏ qua */
}

const ROOT = resolve(fileURLToPath(new URL("./public", import.meta.url)))

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
  return pathname === "/admin" ? "admin.html" : "index.html"
}

const LOOPBACK = new Set(["127.0.0.1", "::1", "::ffff:127.0.0.1"])

/** Node IncomingMessage → Web Request, để dùng chung bộ xử lý với hàm Vercel. */
async function toRequest(req, url) {
  let body
  if (req.method !== "GET" && req.method !== "HEAD") {
    const chunks = []
    let size = 0
    for await (const chunk of req) {
      size += chunk.length
      if (size > 16 * 1024) break
      chunks.push(chunk)
    }
    body = Buffer.concat(chunks)
  }
  return new Request(url, { method: req.method, headers: req.headers, body })
}

async function sendResponse(res, response) {
  res.writeHead(response.status, Object.fromEntries(response.headers))
  res.end(Buffer.from(await response.arrayBuffer()))
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
      await sendResponse(res, await handleStats(await toRequest(req, url)))
      return
    }
    if (pathname === "/api/admin") {
      const trustLocal = LOOPBACK.has(req.socket.remoteAddress)
      await sendResponse(res, await handleAdmin(await toRequest(req, url), { trustLocal }))
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