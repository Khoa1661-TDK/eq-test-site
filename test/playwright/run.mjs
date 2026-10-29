/* run.mjs — kiểm tra vòng E-Quest trên trình duyệt thật, ở điện thoại 390×844 và màn rộng 1440×900:
   trang chủ → "Trước khi bắt đầu" → 10 tình huống (cảnh + câu hỏi + bốn phương án cùng nằm trong
   khung nhìn, bấm một lần là sang câu) → kết quả profile (avatar, tên EN + VI, xu hướng, kỹ năng, chìa khóa mở cửa,
   năm thanh nhóm EQ) → /history, /profiles, trang chủ có dải lịch sử, /practice và /scenes không còn.
   Ảnh chụp lưu vào reports/ để soi bằng mắt.

   Chạy: node test/playwright/run.mjs            (tự bật máy chủ trên một cổng trống)
         node test/playwright/run.mjs --url http://127.0.0.1:8787 */

import { chromium } from "playwright"
import { spawn } from "node:child_process"
import { mkdir, mkdtemp } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
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
  // EQ_DATA_DIR: thống kê của lượt chạy thử không ghi vào data/ thật.
  const dataDir = await mkdtemp(join(tmpdir(), "equest-e2e-"))
  server = spawn(process.execPath, ["server.mjs", "--port", String(port)], { cwd: ROOT, stdio: "ignore", env: { ...process.env, EQ_DATA_DIR: dataDir } })
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
  for (const t of ["Hồ sơ EQ của bạn", "Nhóm EQ của bạn", "Đặc tính EQ của bạn", "Sau những lựa chọn của bạn, đây là điều chúng mình muốn nói.", "Xu hướng phản ứng", "Kỹ năng nổi bật", "Kỹ năng cần nâng cấp", "Chìa khóa mở khóa EQ", "không phải"]) {
    check(`kết quả: có "${t}"`, text.includes(t))
  }
  const h1 = await page.textContent(".eqr-hero__name")
  const vi = await page.textContent(".eqr-hero__vi")
  check("kết quả: tên EN (The …) kèm (VIẾT TẮT) và tên VI", /^The .+ \([A-Z]{3,4}\)$/.test(h1 ?? "") && Boolean(vi?.trim()), `${h1} / ${vi}`)
  check("kết quả: có avatar pixel", (await page.locator(".eqr-hero__art svg rect").count()) > 40)
  check("kết quả: bỏ khối nghiêng về, không còn câu cũ", !/nghiêng về|Có một câu dành riêng|EQ Profile của bạn/.test(text) && (await page.locator(".eqr-lean").count()) === 0)
  const barNums = await page.locator(".eqr-bar__num").allTextContents()
  const barNames = await page.locator(".eqr-bar__name").allTextContents()
  check("kết quả: 5 thanh nhóm EQ có điểm 0–100", barNums.length === 5 && barNums.every((n) => /^\d+$/.test(n) && +n <= 100), `${barNames.join(" | ")} = ${barNums.join(",")}`)
  check("kết quả: đúng 5 tên nhóm EQ", ["Tự nhận thức", "Làm chủ cảm xúc", "Động lực tự thân", "Sự thấu cảm", "Kỹ năng xã hội"].every((n) => barNames.includes(n)))
  check("kết quả: thanh tô đúng độ rộng", (await page.locator(".eqr-bar__fill").evaluateAll((ns) => ns.map((n) => n.style.width))).every((w, i) => w === `${barNums[i]}%`))
  check("kết quả: không có liên kết luyện tập", (await page.locator("a[href*='practice']").count()) === 0)
  await page.screenshot({ path: `${REPORTS}/${shotPrefix}-04-result.png`, fullPage: true })

  await page.getByRole("button", { name: /Chìa khóa mở khóa EQ/ }).click()
  await page.waitForTimeout(3600)
  const quote = await page.locator("[role=dialog]").textContent()
  check("chìa khóa: mở ra một câu của profile", Boolean(quote?.trim()))
  await page.screenshot({ path: `${REPORTS}/${shotPrefix}-05-key.png` })
  await page.keyboard.press("Escape")

  // Xem lại cùng một lượt qua /result?id=… cho cùng profile và cùng chìa khóa.
  const resultUrl = page.url()
  await page.goto(`${BASE}/history`, { waitUntil: "networkidle" })
  check("lịch sử: có một dòng vừa làm xong", (await page.locator(".hist__row").count()) >= 1)
  check("lịch sử: hiện thời lượng", /phút|giây/.test((await page.locator(".hist__row").first().textContent()) ?? ""))
  await page.screenshot({ path: `${REPORTS}/${shotPrefix}-06-history.png`, fullPage: true })
  await page.locator(".hist__row").first().click()
  await page.waitForURL(/\/result\?id=/)
  check("lịch sử: mở lại đúng kết quả", (await page.textContent(".eqr-hero__name")) === h1)
  void resultUrl

  await page.goto(`${BASE}/`, { waitUntil: "networkidle" })
  check("trang chủ: dải lịch sử có lần vừa làm", (await page.locator(".hist--strip .hist__row").count()) === 1)
  check("trang chủ: không còn chữ luyện tập", !/luyện/i.test((await page.textContent("main")) ?? ""))
  await page.screenshot({ path: `${REPORTS}/${shotPrefix}-07-landing-history.png` })

  await page.goto(`${BASE}/profiles`, { waitUntil: "networkidle" })
  check("thư viện: đủ 10 thẻ", (await page.locator(".plib__card").count()) === 10)
  await page.screenshot({ path: `${REPORTS}/${shotPrefix}-08-profiles.png`, fullPage: true })
  await page.locator(".plib__card").nth(4).click()
  await page.waitForURL(/\/profiles\?p=kindAccommodator/)
  const detail = await page.textContent("#plib-detail")
  check("thư viện: chi tiết có kỹ năng và 3 chìa khóa", detail.includes("Kỹ năng nổi bật") && detail.includes("Kỹ năng cần nâng cấp") && (await page.locator(".plib__keys li").count()) === 3)
  await page.screenshot({ path: `${REPORTS}/${shotPrefix}-09-profile-detail.png` })

  for (const gone of ["/practice", "/scenes"]) {
    await page.goto(`${BASE}${gone}`, { waitUntil: "networkidle" })
    check(`${gone} không còn (404)`, (await page.textContent("main")).includes("404"))
  }
  const nav = await page.locator(".topnav").textContent()
  check("thanh điều hướng: Lịch sử ngay sau Trang chủ, không còn Luyện/Cảnh", /^\s*Trang chủ\s*Lịch sử/.test(nav) && !/Luyện|Cảnh/.test(nav), nav.replace(/\s+/g, " "))

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
