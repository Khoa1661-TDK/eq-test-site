/* run.mjs — kiểm tra vòng E-Quest trên trình duyệt thật, ở điện thoại 390×844 và màn rộng 1440×900:
   trang chủ → "Trước khi bắt đầu" → 10 tình huống (cảnh + câu hỏi + bốn phương án cùng nằm trong
   khung nhìn, bấm một lần là sang câu) → hồ sơ EQ (5 thanh, lịch sử, chìa khóa mở cửa) → làm lại.
   Ảnh chụp lưu vào reports/ để soi bằng mắt.

   Chạy: node test/playwright/run.mjs            (tự bật máy chủ trên một cổng trống)
         node test/playwright/run.mjs --url http://127.0.0.1:8787 */

import { chromium } from "playwright"
import { spawn } from "node:child_process"
import { mkdir } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { resolve } from "node:path"
import { createServer } from "node:net"

const ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)))
const REPORTS = resolve(ROOT, "reports")
await mkdir(REPORTS, { recursive: true })

const failures = []
function check(name, ok, detail = "") {
  if (!ok) failures.push(`${name}${detail ? ` — ${detail}` : ""}`)
  console.log(`${ok ? "  ok  " : "  FAIL"} ${name}${detail ? `  (${detail})` : ""}`)
}

/* ------------------------------------------------------------ máy chủ */
async function freePort() {
  return new Promise((res) => {
    const srv = createServer()
    srv.listen(0, "127.0.0.1", () => {
      const { port } = srv.address()
      srv.close(() => res(port))
    })
  })
}

const argUrl = process.argv.indexOf("--url")
let server = null
let BASE = argUrl > -1 ? process.argv[argUrl + 1].replace(/\/$/, "") : null
if (!BASE) {
  const port = await freePort()
  server = spawn(process.execPath, ["server.mjs", "--port", String(port)], { cwd: ROOT, stdio: "ignore" })
  BASE = `http://127.0.0.1:${port}`
  for (let i = 0; i < 50; i += 1) {
    try {
      if ((await fetch(BASE)).ok) break
    } catch {
      /* chưa lên */
    }
    await new Promise((r) => setTimeout(r, 100))
  }
}

/* ------------------------------------------------------------ một vòng chơi */
const browser = await chromium.launch()

async function playRound(label, viewport, shotPrefix) {
  console.log(`— ${label} —`)
  const page = await browser.newPage({ viewport })
  const errors = []
  page.on("pageerror", (err) => errors.push(String(err)))
  page.on("console", (msg) => msg.type() === "error" && errors.push(msg.text()))

  await page.goto(`${BASE}/`, { waitUntil: "networkidle" })
  check("trang chủ: tiêu đề mới", (await page.textContent("h1"))?.includes("Cùng một câu chuyện, mỗi người một cảm xúc."))
  check("trang chủ: tên E-Quest", (await page.title()).includes("E-Quest"))
  await page.screenshot({ path: `${REPORTS}/${shotPrefix}-01-landing.png` })

  await page.goto(`${BASE}/assessment`, { waitUntil: "networkidle" })
  const intro = await page.textContent(".quiz-intro")
  check("bảng mở đầu: ba mục mới", ["Về E-Quest", "Cách chơi", "Một điều nhỏ cần nhớ"].every((t) => intro.includes(t)))
  await page.screenshot({ path: `${REPORTS}/${shotPrefix}-02-intro.png`, fullPage: true })
  await page.locator(".quiz-intro button:visible", { hasText: /Bắt đầu|Làm lại bài test/ }).click()

  let maxBottom = 0
  let minStage = Infinity
  for (let i = 0; i < 10; i += 1) {
    await page.locator(".choice").nth(3).waitFor({ state: "visible" })
    await page.waitForTimeout(400)
    const count = await page.textContent(".hud__count")
    check(`câu ${i + 1}: đếm đúng`, count?.includes(`${i + 1}/10`), count)
    const bottom = await page.locator(".choice").nth(3).evaluate((n) => n.getBoundingClientRect().bottom)
    check(`câu ${i + 1}: HUD ở mép trên`, (await page.locator(".hud").evaluate((n) => n.getBoundingClientRect().top)) <= 1)
    maxBottom = Math.max(maxBottom, bottom)
    const fit = await page.evaluate(() => {
      const hud = document.querySelector(".hud").getBoundingClientRect()
      const st = document.querySelector(".scn-stage-wrap").getBoundingClientRect()
      return { stageTop: st.top, stageBottom: st.bottom, stageH: st.height, hudBottom: hud.bottom }
    })
    check(`câu ${i + 1}: cảnh nằm trọn trong khung nhìn, dưới HUD`, fit.stageTop >= fit.hudBottom - 1 && fit.stageBottom <= viewport.height, JSON.stringify(fit))
    minStage = Math.min(minStage, fit.stageH)
    if (i === 0) await page.screenshot({ path: `${REPORTS}/${shotPrefix}-03-question.png` })
    await page.locator(".choice").nth((i * 3) % 4).click()
  }
  check("bốn phương án luôn nằm trong khung nhìn", maxBottom <= viewport.height, `đáy thấp nhất ${Math.round(maxBottom)} / ${viewport.height}`)
  console.log(`       cảnh nhỏ nhất cao ${Math.round(minStage)}px, đáy phương án thấp nhất ${Math.round(maxBottom)}px / ${viewport.height}`)

  await page.waitForURL(/\/result/)
  await page.waitForTimeout(900)
  const text = await page.textContent("main")
  for (const t of ["Tự nhận thức", "Làm chủ cảm xúc", "Động lực tự thân", "Sự thấu cảm", "Kỹ năng xã hội", "Kỹ năng nổi bật", "Kỹ năng cần nâng cấp", "Lịch sử làm bài", "Goleman"]) {
    check(`hồ sơ: có "${t}"`, text.includes(t))
  }
  check("hồ sơ: không còn chữ điểm mạnh / điểm yếu", !/điểm mạnh|điểm yếu/i.test(text))
  await page.screenshot({ path: `${REPORTS}/${shotPrefix}-04-result.png`, fullPage: true })

  await page.getByRole("button", { name: /Chìa khóa EQ/ }).click()
  await page.waitForTimeout(3600)
  const quote = await page.locator("[role=dialog]").textContent()
  check("chìa khóa: mở ra câu nói của nhóm", Boolean(quote?.trim()))
  await page.screenshot({ path: `${REPORTS}/${shotPrefix}-05-key.png` })
  await page.keyboard.press("Escape")

  // "Luyện kỹ năng này" mở đúng phiên luyện của thành phần cần nâng cấp.
  await page.locator("a", { hasText: "Luyện kỹ năng này" }).first().click()
  await page.waitForURL(/\/practice\?skill=/)
  await page.waitForTimeout(600)
  const practiceTag = await page.textContent(".hud__tag")
  check("luyện: mở phiên của một đặc tính", /Luyện: (Tự nhận thức|Làm chủ cảm xúc|Động lực tự thân|Sự thấu cảm|Kỹ năng xã hội)/.test(practiceTag ?? ""), practiceTag)
  await page.goto(`${BASE}/practice`, { waitUntil: "networkidle" })
  const practiceText = await page.textContent("main")
  check("luyện: năm đặc tính EQ, không còn sáu kỹ năng cũ", practiceText.includes("Năm đặc tính EQ") && !/Sáu kỹ năng|Nhận biết xã hội|Quản lý quan hệ/.test(practiceText))
  await page.screenshot({ path: `${REPORTS}/${shotPrefix}-06-practice.png`, fullPage: true })

  check("không có lỗi trong console", errors.length === 0, errors.join(" | "))
  check("không cuộn ngang", (await page.evaluate(() => document.documentElement.scrollWidth)) <= viewport.width)
  await page.close()
}

try {
  await playRound("điện thoại 390", { width: 390, height: 844 }, "flow-m")
  await playRound("màn rộng 1440", { width: 1440, height: 900 }, "flow")
  await playRound("iPhone Safari 390 (trừ thanh trình duyệt)", { width: 390, height: 664 }, "flow-s")
  await playRound("điện thoại nhỏ 360", { width: 360, height: 640 }, "flow-xs")
  await playRound("laptop 1366", { width: 1366, height: 657 }, "flow-l")
} finally {
  await browser.close()
  server?.kill()
}

if (failures.length) {
  console.log(`\n✗ ${failures.length} lỗi:\n  ${failures.join("\n  ")}`)
  process.exit(1)
}
console.log("\n✓ E2E E-Quest: mọi phép kiểm đạt.")
