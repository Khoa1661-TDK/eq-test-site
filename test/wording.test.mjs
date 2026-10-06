/**
 * Kiểm tra lời văn: trang này luyện KỸ NĂNG, không xếp người vào "kiểu".
 *
 *   node test/wording.test.mjs
 *
 * Quét chữ hiển thị trong dữ liệu, các màn hình và index.html. Một cụm từ kiểu
 * "bạn là người…" chỉ được phép khi nó đang bị phủ định ("không nói bạn là người
 * thế nào"), và mọi dòng chú thích mã nguồn đều được bỏ qua.
 */
import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"

const ROOT = new URL("../public/", import.meta.url).pathname
const FILES = [
  join(ROOT, "index.html"),
  ...readdirSync(join(ROOT, "js/data")).map((f) => join(ROOT, "js/data", f)),
  ...readdirSync(join(ROOT, "js/views")).map((f) => join(ROOT, "js/views", f)),
].filter((f) => /\.(js|html)$/.test(f))

const BANNED = [
  /kiểu người/i,
  /bạn là (một )?người/i,
  /tính cách/i,
  /loại người/i,
  /nhóm tính cách/i,
  /bạn thuộc (kiểu|nhóm|loại)/i,
  /\bMBTI\b|\bSBTI\b/,
  /\b[EI][SN][TF][JP]\b/,
  /personality type/i,
]
const NEGATION = /không|chẳng|chứ không/i

const failures = []
let lines = 0
for (const file of FILES) {
  const text = readFileSync(file, "utf8").split("\n")
  text.forEach((line, i) => {
    const trimmed = line.trim()
    if (/^(\/\/|\/\*|\*)/.test(trimmed)) return
    lines += 1
    for (const rule of BANNED) {
      const match = rule.exec(line)
      if (!match) continue
      const before = line.slice(Math.max(0, match.index - 40), match.index)
      if (NEGATION.test(before)) continue
      failures.push(`${file.replace(ROOT, "public/")}:${i + 1} «${match[0]}» — ${trimmed.slice(0, 120)}`)
    }
  })
}

if (failures.length) {
  console.error(`✗ LỜI VĂN: ${failures.length} chỗ dùng ngôn ngữ xếp "kiểu người":`)
  for (const f of failures) console.error(`  · ${f}`)
  process.exit(1)
}
console.log(`✓ LỜI VĂN: ${FILES.length} tệp, ${lines} dòng, không có ngôn ngữ xếp "kiểu người".`)
