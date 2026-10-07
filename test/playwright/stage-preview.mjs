/* stage-preview.mjs — chơi thử dàn dựng của một hay nhiều tình huống chữ trong trình duyệt thật.
   Bấm qua lời kể, chụp lúc đang diễn và lúc quyết định, chọn từng phương án (A→D) rồi chụp hậu
   quả, và báo lỗi console nếu có. Ảnh: reports/stage-<id>-*.png.

   Chạy: node test/playwright/stage-preview.mjs AW_01 [SO_02 …]   (không có mã = mọi cảnh đã dàn dựng) */

import { chromium } from "playwright"
import { spawn } from "node:child_process"
import { createServer } from "node:net"
import { mkdir } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { resolve } from "node:path"
import { STAGING } from "../../public/js/data/staging.js"
import { SCENARIO_BY_ID } from "../../public/js/data/scenarios.js"

const ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)))
const REPORTS = resolve(ROOT, "reports")
await mkdir(REPORTS, { recursive: true })
const ids = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(STAGING)
const unknown = ids.filter((id) => !STAGING[id] || !SCENARIO_BY_ID[id])
if (unknown.length) {
  console.error(`chưa có dàn dựng cho: ${unknown.join(", ")}`)
  process.exit(1)
}

async function freePort() {
  return new Promise((res) => {
    const srv = createServer()
    srv.listen(0, "127.0.0.1", () => {
      const { port } = srv.address()
      srv.close(() => res(port))
    })
  })
}
const port = await freePort()
const server = spawn(process.execPath, ["server.mjs", "--port", String(port)], { cwd: ROOT, stdio: "ignore" })
const BASE = `http://127.0.0.1:${port}`
for (let i = 0; i < 50; i += 1) {
  try {
    if ((await fetch(BASE)).ok) break
  } catch {
    /* chưa lên */
  }
  await new Promise((r) => setTimeout(r, 100))
}

const browser = await chromium.launch()
const failures = []
const shots = []

async function play(id, letterIndex, { capture }) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 860 } })
  const errors = []
  page.on("pageerror", (e) => errors.push(e.message))
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()))
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
    const rt = createSceneRuntime(host, toScene({ ...SCENARIO_BY_ID[itemId], kind: "text" }), {
      onAnswer() {},
      onDone() { window.__pv.done = true },
    })
    rt.start()
  }, id)
  let opened = false
  for (let i = 0; i < 90; i += 1) {
    opened = await page.evaluate(() => Boolean(document.querySelector(".scene-stage-host .choices.is-open .choice")))
    if (capture && i === 10) {
      const f = `${REPORTS}/stage-${id}-1-acting.png`
      await page.screenshot({ path: f })
      shots.push(f)
    }
    if (opened) break
    if (i % 3 === 2) await page.evaluate(() => document.querySelector(".scene-stage-host .scn-stage")?.click())
    await page.waitForTimeout(150)
  }
  if (!opened) failures.push(`${id}: lựa chọn không hiện`)
  if (capture && opened) {
    const f = `${REPORTS}/stage-${id}-2-decision.png`
    await page.screenshot({ path: f })
    shots.push(f)
  }
  const letter = "ABCD"[letterIndex]
  const choiceId = `${id}_${letter}`
  const text = SCENARIO_BY_ID[id].choices.find((c) => c.id === choiceId)?.text ?? ""
  if (opened) await page.locator(".scene-stage-host .choice", { hasText: text.slice(0, 30) }).first().click()
  for (let i = 0; i < 50; i += 1) {
    if (i === 10) {
      const f = `${REPORTS}/stage-${id}-3-${letter}.png`
      await page.screenshot({ path: f })
      shots.push(f)
    }
    if (await page.evaluate(() => window.__pv.done)) break
    await page.waitForTimeout(150)
  }
  if (!(await page.evaluate(() => window.__pv.done))) failures.push(`${id} ${letter}: hậu quả không kết thúc`)
  if (errors.length) failures.push(`${id} ${letter}: lỗi console — ${errors.slice(0, 2).join(" | ")}`)
  await page.close()
}

for (const id of ids) {
  const count = SCENARIO_BY_ID[id].choices.length
  for (let k = 0; k < count; k += 1) await play(id, k, { capture: k === 0 })
  console.log(`  đã chơi ${id} (${count} phương án)`)
}

await browser.close()
server.kill()
console.log("ảnh:\n" + shots.map((s) => `  ${s}`).join("\n"))
if (failures.length) {
  console.error(`\n✗ XEM THỬ DÀN DỰNG: ${failures.length} lỗi`)
  for (const f of failures) console.error(`  · ${f}`)
  process.exit(1)
}
console.log(`\n✓ XEM THỬ DÀN DỰNG: ${ids.length} cảnh chạy hết mọi phương án, không lỗi.`)
