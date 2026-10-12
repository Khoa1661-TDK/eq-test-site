/* skip-cutscene.mjs — bấm đúp / Space hai lần tua hết đoạn cảnh đang diễn.
   Trước lựa chọn: lựa chọn hiện ngay. Sau lựa chọn: hậu quả kết thúc ngay. Bấm một lần thì không tua.

   Chạy: node test/playwright/skip-cutscene.mjs */

import { chromium } from "playwright"
import { spawn } from "node:child_process"
import { createServer } from "node:net"
import { fileURLToPath } from "node:url"
import { resolve } from "node:path"

const ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)))
const port = await new Promise((res) => {
  const srv = createServer()
  srv.listen(0, "127.0.0.1", () => { const { port } = srv.address(); srv.close(() => res(port)) })
})
const server = spawn(process.execPath, ["server.mjs", "--port", String(port)], { cwd: ROOT, stdio: "ignore" })
const BASE = `http://127.0.0.1:${port}`
for (let i = 0; i < 50; i += 1) {
  try { if ((await fetch(BASE)).ok) break } catch { /* chưa lên */ }
  await new Promise((r) => setTimeout(r, 100))
}

const browser = await chromium.launch()
const failures = []

async function open(id) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 860 } })
  const errors = []
  page.on("pageerror", (e) => errors.push(e.message))
  await page.goto(`${BASE}/practice`, { waitUntil: "networkidle" })
  await page.evaluate(async (itemId) => {
    const { SCENARIO_BY_ID } = await import("/js/data/scenarios.js")
    const { toScene } = await import("/js/scene/staged.js")
    const { createSceneRuntime } = await import("/js/scene/sceneRuntime.js")
    const main = document.querySelector("#main")
    main.replaceChildren()
    const host = document.createElement("div")
    host.className = "scene-stage-host"
    main.append(host)
    window.__pv = { done: false }
    createSceneRuntime(host, toScene({ ...SCENARIO_BY_ID[itemId], kind: "text" }), {
      onAnswer() {},
      onDone() { window.__pv.done = true },
    }).start()
  }, id)
  return { page, errors }
}
const choicesOpen = (page) => page.evaluate(() => Boolean(document.querySelector(".scene-stage-host .choices.is-open .choice")))
const doubleClick = (page) => page.evaluate(() => {
  const s = document.querySelector(".scene-stage-host .scn-stage")
  s.click(); s.click()
})
async function waitFor(page, fn, ms) {
  const t0 = Date.now()
  while (Date.now() - t0 < ms) {
    if (await fn()) return Date.now() - t0
    await page.waitForTimeout(50)
  }
  return -1
}

for (const [id, how] of [["AW_01", "click"], ["EP_02", "space"], ["NX_02", "click"], ["RS_05", "space"]]) {
  const { page, errors } = await open(id)
  await page.waitForTimeout(600)
  // một lần bấm: không được nhảy tới lựa chọn
  await page.evaluate(() => document.querySelector(".scene-stage-host .scn-stage").click())
  await page.waitForTimeout(500)
  if (await choicesOpen(page)) failures.push(`${id}: bấm một lần đã nhảy tới lựa chọn`)
  if (how === "space") { await page.keyboard.press("Space"); await page.keyboard.press("Space") } else await doubleClick(page)
  const tChoices = await waitFor(page, () => choicesOpen(page), 2500)
  if (tChoices < 0) failures.push(`${id}: ${how} hai lần không tua tới lựa chọn`)
  else {
    await page.locator(".scene-stage-host .choice").first().click()
    await page.waitForTimeout(400)
    if (how === "space") { await page.keyboard.press("Space"); await page.keyboard.press("Space") } else await doubleClick(page)
    const tDone = await waitFor(page, () => page.evaluate(() => window.__pv.done), 2000)
    if (tDone < 0) failures.push(`${id}: ${how} hai lần không tua hết hậu quả`)
    console.log(`  ${id} (${how}): lựa chọn sau ${tChoices}ms, hậu quả xong sau ${tDone}ms`)
  }
  if (errors.length) failures.push(`${id}: lỗi trang — ${errors[0]}`)
  await page.close()
}

await browser.close()
server.kill()
if (failures.length) {
  console.error(`✗ TUA CẢNH: ${failures.length} lỗi\n  ${failures.join("\n  ")}`)
  process.exit(1)
}
console.log("✓ TUA CẢNH: bấm đúp và Space hai lần đều tua được, bấm một lần thì không.")
