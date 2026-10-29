/* skip-cutscene.mjs — bấm đúp / Space hai lần tua hết đoạn cảnh đang diễn.
   Trước lựa chọn: lựa chọn hiện ngay. Sau lựa chọn: tua hết hậu quả rồi dừng ở nút
   "câu tiếp theo" (onDone chỉ chạy khi bấm nút — hợp đồng mới trong sceneRuntime.js).
   Bấm một lần thì không tua.

   Chạy: node test/playwright/skip-cutscene.mjs */

import { chromium } from "playwright"
import { spawn } from "node:child_process"
import { createServer } from "node:net"
import { fileURLToPath } from "node:url"
import { resolve } from "node:path"
import { tmpdir } from "node:os"

const ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)))
const port = await new Promise((res) => {
  const srv = createServer()
  srv.listen(0, "127.0.0.1", () => { const { port } = srv.address(); srv.close(() => res(port)) })
})
const server = spawn(process.execPath, ["server.mjs", "--port", String(port)], { cwd: ROOT, stdio: "ignore", env: { ...process.env, EQ_DATA_DIR: tmpdir() + "/equest-skip-cutscene" } })
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
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" })
  await page.evaluate(async (itemId) => {
    const { QUEST_BANK } = await import("/js/data/questBank.js")
    const { STAGING_QUEST } = await import("/js/data/stagingQuest.js")
    const { createSceneRuntime } = await import("/js/scene/sceneRuntime.js")
    const item = QUEST_BANK.find((q) => q.id === itemId)
    const st = STAGING_QUEST[itemId]
    // dựng cảnh từ câu hỏi E-Quest, nhưng chạy ở chế độ thường (không "quick") để thử tua
    const scene = {
      id: item.id, label: st.label, environment: st.environment, dialogueSpeaker: st.place ?? "", chatTitle: st.chatTitle,
      characters: st.cast, ...(st.extras !== undefined ? { extras: st.extras } : {}),
      context: item.context, prompt: item.prompt, choices: item.choices.map((c) => ({ id: c.id, code: c.code, text: c.text })),
      // chế độ thường: lời kể + dàn dựng, rồi dừng ở điểm quyết định; hậu quả để trống (câu hỏi E-Quest không diễn hậu quả)
      dialogue: [{ who: "narrator", text: item.context }],
      timeline: [...(st.timeline ?? []), { at: Math.max(0, ...(st.timeline ?? []).map((e) => e.at)) + 300, do: "decisionPoint" }],
      consequences: Object.fromEntries(item.choices.map((c) => [c.id, []])),
    }
    const main = document.querySelector("#main")
    main.replaceChildren()
    const host = document.createElement("div")
    host.className = "scene-stage-host"
    main.append(host)
    window.__pv = { done: false }
    createSceneRuntime(host, scene, {
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

for (const [id, how] of [["EQ_01", "click"], ["EQ_10", "space"], ["EQ_12", "click"], ["EQ_16", "space"]]) {
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
    // hậu quả tua xong giờ DỪNG lại chờ bấm nút "câu tiếp theo" → bấm nút đó rồi mới tính onDone
    const tDone = await waitFor(page, async () => {
      await page.evaluate(() => document.querySelector(".scene-stage-host .scn-tap:not([hidden]) .scn-tap__btn")?.click())
      return page.evaluate(() => window.__pv.done)
    }, 2000)
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
