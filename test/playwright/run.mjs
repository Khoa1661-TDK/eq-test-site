/* run.mjs — kiểm tra cả vòng ĐÁNH GIÁ → HIỂU → LUYỆN → ĐÁNH GIÁ LẠI trên trình duyệt thật,
   ở màn rộng 1440 và điện thoại 390, và chụp ảnh vào reports/ để soi bằng mắt.

   Chạy: node test/playwright/run.mjs            (tự bật máy chủ trên một cổng trống)
         node test/playwright/run.mjs --url http://127.0.0.1:8787

   Để chạy nhanh, phần lớn câu trả lời được nạp sẵn vào localStorage; MỘT cảnh động và MỘT
   tình huống chữ vẫn được chơi bằng chuột như người thật, rồi bấm "Xem kết quả". */

import { chromium, devices } from "playwright"
import { spawn } from "node:child_process"
import { mkdir } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { resolve } from "node:path"
import { createServer } from "node:net"

import { FORMS, ITEM_BY_ID, HISTORY_KEY, strongestChoice, weightedPoints } from "../../public/js/core/eqScoring.js"

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

/* ------------------------------------------------------------ dữ liệu bài làm */
const weakest = (item) => item.choices.reduce((lo, c) => (weightedPoints(item, c) < weightedPoints(item, lo) ? c : lo))

/** Một bài dở: một cảnh động và một tình huống chữ ở đầu chưa trả lời, phần còn lại đã trả lời. */
function seededCurrent(form, pick) {
  const ids = FORMS[form]
  const scene = ids.find((id) => ITEM_BY_ID[id].kind === "scene")
  const text = ids.find((id) => ITEM_BY_ID[id].kind === "text")
  const order = [scene, text, ...ids.filter((id) => id !== scene && id !== text)].filter(Boolean)
  const answers = {}
  for (const id of order.slice(2)) answers[id] = pick(ITEM_BY_ID[id]).id
  return { form, order, answers, index: 0, startedAt: Date.now() }
}

const BANNED = /kiểu người|bạn là (một )?người(?! thế nào)|tính cách|loại người|\bMBTI\b|\bSBTI\b/i

const overflow = (page) =>
  page.evaluate(() => ({ scrollW: document.documentElement.scrollWidth, innerW: window.innerWidth }))

async function shot(page, name, fullPage = false) {
  await page.screenshot({ path: `${REPORTS}/${name}.png`, fullPage })
}

/* ------------------------------------------------------------ thao tác */
const choicesOpen = (page, scope) =>
  page.evaluate((sel) => {
    const list = document.querySelector(`${sel} .choices`)
    return Boolean(list && list.classList.contains("is-open") && !list.classList.contains("is-locked") && list.querySelector(".choice"))
  }, scope)

async function pickByText(page, scope, text) {
  const target = page.locator(`${scope} .choice`, { hasText: text.slice(0, 40) }).first()
  await target.click()
}

/** Chơi một cảnh động: bấm sân khấu cho tới khi hiện lựa chọn, rồi chọn theo nội dung. */
async function playScene(page, item, choice) {
  for (let i = 0; i < 120; i += 1) {
    if (await choicesOpen(page, ".scene-stage-host")) break
    await page.evaluate(() => document.querySelector(".scene-stage-host .scn-stage")?.click())
    await page.waitForTimeout(120)
  }
  check(`cảnh «${item.title}» hiện lựa chọn`, await choicesOpen(page, ".scene-stage-host"))
  await pickByText(page, ".scene-stage-host", choice.text)
}

/** Trả lời một tình huống chữ: bấm khung thoại tới khi có lựa chọn. */
async function playText(page, item, choice) {
  for (let i = 0; i < 80; i += 1) {
    if (await choicesOpen(page, ".stage .scene")) break
    await page.evaluate(() => document.querySelector(".stage .scene")?.click())
    await page.waitForTimeout(80)
  }
  check(`tình huống «${item.title}» hiện lựa chọn`, await choicesOpen(page, ".stage .scene"))
  await pickByText(page, ".stage .scene", choice.text)
}

/** Tình huống chữ có dàn dựng được diễn như cảnh động; còn lại dùng khung thoại. */
async function playAny(page, item, choice) {
  for (let i = 0; i < 40; i += 1) {
    if (await page.locator(".scene-stage-host .scn-stage").count()) return playScene(page, item, choice)
    if (await page.locator(".stage .scene").count()) return playText(page, item, choice)
    await page.waitForTimeout(150)
  }
  check(`«${item.title}» hiện ra`, false)
}

async function finishSeeded(page, current, pick) {
  const [sceneId, textId] = current.order
  await page.goto(`${BASE}/`, { waitUntil: "domcontentloaded" })
  await page.evaluate(
    ([key, cur, prev]) => {
      const saved = JSON.parse(localStorage.getItem(key) || "null") || { attempts: [], current: null }
      saved.current = cur
      if (prev) saved.attempts = prev
      localStorage.setItem(key, JSON.stringify(saved))
    },
    [HISTORY_KEY, current, null],
  )
  await page.goto(`${BASE}/assessment`, { waitUntil: "networkidle" })
  await page.getByText("Tiếp tục bài đang làm").click()
  const scene = ITEM_BY_ID[sceneId]
  await playScene(page, scene, pick(scene))
  const text = ITEM_BY_ID[textId]
  await playAny(page, text, pick(text))
  for (let i = 0; i < 60 && !(await page.locator(".result").count()); i += 1) {
    const submit = page.locator(".hud__actions .btn--accent")
    if (await submit.isVisible().catch(() => false)) await submit.click().catch(() => {})
    else await page.evaluate(() => document.querySelector(".stage .scene")?.click())
    await page.waitForTimeout(150)
  }
}

/* ======================================================= màn rộng 1440 */
const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "vi-VN" })
const page = await ctx.newPage()
const errors = []
page.on("pageerror", (e) => errors.push(e.message))
page.on("console", (m) => m.type() === "error" && errors.push(m.text()))

console.log("— trang chủ —")
await page.goto(`${BASE}/`, { waitUntil: "networkidle" })
check("trang chủ không chứa ngôn ngữ xếp kiểu người", !BANNED.test(await page.locator("main").innerText()))
await shot(page, "flow-01-landing")

console.log("— đánh giá lần 1 (đề A, chọn mạnh nhất) —")
await finishSeeded(page, seededCurrent("A", strongestChoice), strongestChoice)
check("tới trang kết quả", (await page.locator(".result").count()) > 0)
await page.waitForSelector(".dim")
check("hồ sơ có đúng 6 kỹ năng", (await page.locator(".dim").count()) === 6, `${await page.locator(".dim").count()}`)
check("chọn mạnh nhất ở mọi tình huống → trung bình 100", (await page.locator(".verdict__score").innerText()).trim() === "100")
const resultText = await page.locator(".result").innerText()
check("trang kết quả không chứa ngôn ngữ xếp kiểu người", !BANNED.test(resultText), resultText.match(BANNED)?.[0])
check("lần đầu: chưa có phần so với lần trước", !resultText.includes("So với lần trước"))
check("có ít nhất một bằng chứng tình huống", (await page.locator(".evidence__item").count()) >= 1)
await shot(page, "flow-02-result-A", true)

console.log("— luyện tập —")
await page.goto(`${BASE}/practice`, { waitUntil: "networkidle" })
check("trang luyện có 6 thẻ kỹ năng", (await page.locator(".skills .skill").count()) === 6)
await page.locator(".skills .skill").first().click()
await page.waitForSelector(".stage .scene, .scene-stage-host .scn-stage")
const practiceScope = (await page.locator(".scene-stage-host .scn-stage").count()) ? ".scene-stage-host" : ".stage .scene"
for (let i = 0; i < 120 && !(await choicesOpen(page, practiceScope)); i += 1) {
  await page.evaluate((sc) => document.querySelector(sc === ".scene-stage-host" ? ".scene-stage-host .scn-stage" : ".stage .scene")?.click(), practiceScope)
  await page.waitForTimeout(120)
}
await page.locator(`${practiceScope} .choice`).first().click()
await page.waitForTimeout(1500)
const reps = await page.evaluate(() => JSON.parse(localStorage.getItem("eq_practice_v2") || "{}").reps?.length ?? 0)
check("một lượt luyện được ghi lại", reps === 1, `${reps}`)
await shot(page, "flow-03-practice")

console.log("— cảnh động (luyện) —")
await page.goto(`${BASE}/scenes`, { waitUntil: "networkidle" })
await page.getByText("Bắt đầu", { exact: true }).click()
await page.waitForSelector(".scene-stage-host .scn-stage")
const envText = await page.evaluate(() => document.querySelector(".scn-env__svg")?.outerHTML.length ?? 0)
check("cảnh có bối cảnh vẽ", envText > 500)
await shot(page, "flow-04-scene")
for (let i = 0; i < 120 && !(await choicesOpen(page, ".scene-stage-host")); i += 1) {
  await page.evaluate(() => document.querySelector(".scene-stage-host .scn-stage")?.click())
  await page.waitForTimeout(120)
}
await page.locator(".scene-stage-host .choice").first().click()
await page.waitForSelector(".scene-tip", { timeout: 15000 })
check("sau lựa chọn có khung phản hồi", (await page.locator(".scene-tip").count()) === 1)
await shot(page, "flow-05-scene-feedback")

console.log("— đánh giá lại (đề B, chọn yếu nhất) —")
await page.goto(`${BASE}/assessment`, { waitUntil: "networkidle" })
check("màn mở đầu báo đây là đánh giá lại", (await page.locator(".quiz-intro").innerText()).includes("Đánh giá lại"))
check("lần đánh giá lại dùng đề B", (await page.locator(".quiz-intro").innerText()).includes("đề B"))
await finishSeeded(page, seededCurrent("B", weakest), weakest)
await page.waitForSelector(".dim")
const retakeText = await page.locator(".result").innerText()
check("có phần so với lần trước", retakeText.includes("So với lần trước"))
check("có nhãn thay đổi", (await page.locator(".changes .chip").count()) >= 1)
check("có kỹ năng giảm khi chọn yếu nhất", /giảm/i.test(retakeText))
await shot(page, "flow-06-result-B-compare", true)

let o = await overflow(page)
check("màn rộng: không tràn ngang", o.scrollW <= o.innerW, `${o.scrollW}/${o.innerW}`)
check("màn rộng: không có lỗi console", errors.length === 0, errors.slice(0, 3).join(" | "))

/* ======================================================= điện thoại 390 */
console.log("\n— điện thoại 390×844 —")
const mob = await browser.newContext({ ...devices["iPhone 12"], locale: "vi-VN", viewport: { width: 390, height: 844 } })
const mp = await mob.newPage()
const mErrors = []
mp.on("pageerror", (e) => mErrors.push(e.message))
mp.on("console", (m) => m.type() === "error" && mErrors.push(m.text()))
for (const [path, name] of [["/", "flow-m1-landing"], ["/practice", "flow-m2-practice"]]) {
  await mp.goto(`${BASE}${path}`, { waitUntil: "networkidle" })
  o = await overflow(mp)
  check(`điện thoại ${path}: không tràn ngang`, o.scrollW <= o.innerW, `${o.scrollW}/${o.innerW}`)
  await shot(mp, name)
}
await finishSeeded(mp, seededCurrent("A", strongestChoice), strongestChoice)
await mp.waitForSelector(".dim")
o = await overflow(mp)
check("điện thoại /result: không tràn ngang", o.scrollW <= o.innerW, `${o.scrollW}/${o.innerW}`)
await shot(mp, "flow-m3-result")
await mp.goto(`${BASE}/scenes`, { waitUntil: "networkidle" })
await mp.getByText("Bắt đầu", { exact: true }).click()
await mp.waitForSelector(".scene-stage-host .scn-stage")
await mp.waitForTimeout(1500)
o = await overflow(mp)
check("điện thoại /scenes: không tràn ngang", o.scrollW <= o.innerW, `${o.scrollW}/${o.innerW}`)
await shot(mp, "flow-m4-scene")
check("điện thoại: không có lỗi console", mErrors.length === 0, mErrors.slice(0, 3).join(" | "))

await browser.close()
server?.kill()

if (failures.length) {
  console.error(`\n✗ TRÌNH DUYỆT: ${failures.length} lỗi`)
  for (const f of failures) console.error(`  · ${f}`)
  process.exit(1)
}
console.log("\n✓ TRÌNH DUYỆT: cả vòng đánh giá → luyện → đánh giá lại chạy trên màn rộng và điện thoại.")
