#!/usr/bin/env node
/**
 * fetch-fonts.mjs — tự host font có hỗ trợ tiếng Việt.
 * Be Vietnam Pro (400/500/700/800) — font chính cho chữ nội dung và tiêu đề.
 * Handjet (dot-matrix, biến thiên) — chỉ cho wordmark, HUD, nhãn nhỏ in hoa.
 * VT323 (monospace terminal) — chỉ cho mã/nhãn trang trí nhỏ.
 * Chỉ lấy các subset vietnamese / latin-ext / latin.
 */
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const FONT_DIR = path.join(ROOT, "public", "assets", "fonts")
const CSS_OUT = path.join(ROOT, "public", "css", "fonts.css")
fs.mkdirSync(FONT_DIR, { recursive: true })

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
const URL_CSS =
  "https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;700;800&family=Handjet:wght@400..800&family=VT323&display=swap"

const KEEP = ["vietnamese", "latin-ext", "latin"]

const css = await (await fetch(URL_CSS, { headers: { "User-Agent": UA } })).text()
fs.writeFileSync(path.join(ROOT, "tools", ".fonts-google.css"), css)

const blocks = []
const re = /\/\*\s*([\w-]+)\s*\*\/\s*(@font-face\s*\{[^}]+\})/g
let m
while ((m = re.exec(css))) blocks.push({ subset: m[1], body: m[2] })

const out = []
let n = 0
for (const { subset, body } of blocks) {
  if (!KEEP.includes(subset)) continue
  const family = body.match(/font-family:\s*'([^']+)'/)[1]
  const weight = body.match(/font-weight:\s*([^;]+);/)[1].trim()
  const style = (body.match(/font-style:\s*([^;]+);/) || [, "normal"])[1].trim()
  const src = body.match(/url\((https:[^)]+\.woff2)\)/)[1]
  const range = body.match(/unicode-range:\s*([^;]+);/)[1].trim()
  // Tên file kèm cân nặng: một họ nhiều cân nặng (Be Vietnam Pro) thì mỗi cân
  // nặng một file, không đè nhau.
  const wslug = weight.replace(/\s+/g, "-")
  const file = `${family.toLowerCase().replace(/\s+/g, "-")}-${subset}-${wslug}.woff2`
  const buf = Buffer.from(await (await fetch(src, { headers: { "User-Agent": UA } })).arrayBuffer())
  fs.writeFileSync(path.join(FONT_DIR, file), buf)
  n++
  out.push(
    `/* ${family} · ${subset} · ${weight} */\n@font-face {\n  font-family: '${family}';\n  font-style: ${style};\n  font-weight: ${weight};\n  font-display: swap;\n  src: url('../assets/fonts/${file}') format('woff2');\n  unicode-range: ${range};\n}`,
  )
  console.log(`  ✓ ${file} (${(buf.length / 1024).toFixed(1)} KB) ${subset} ${weight}`)
}

fs.writeFileSync(CSS_OUT, `/* Tự host — sinh bởi tools/fetch-fonts.mjs */\n\n${out.join("\n\n")}\n`)
console.log(`\n${n} file woff2 → ${CSS_OUT}`)