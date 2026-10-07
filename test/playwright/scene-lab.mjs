/* scene-lab.mjs — phòng thử cho bộ máy cảnh: dựng MỘT cảnh mẫu dùng mọi hành động mới
   (người nói, bong bóng thoại, biểu cảm, cử chỉ, máy quay, sắc độ, điện thoại, người
   qua lại phía sau), bấm qua hội thoại, chọn một phương án, rồi kiểm tra DOM theo hợp đồng
   ghi trong đầu sceneRuntime.js. Ảnh chụp lưu vào reports/scene-lab-*.png.

   Chạy: node test/playwright/scene-lab.mjs [--only speakers,emotes,...]
   Nhóm kiểm tra: speakers · say · emotes · gestures · camera · tint · phone · extras · flow */

import { chromium } from "playwright"
import { spawn } from "node:child_process"
import { createServer } from "node:net"
import { mkdir } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { resolve } from "node:path"

const ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)))
const REPORTS = resolve(ROOT, "reports")
await mkdir(REPORTS, { recursive: true })

const onlyArg = process.argv.indexOf("--only")
const ONLY = onlyArg > -1 ? new Set(process.argv[onlyArg + 1].split(",")) : null
const failures = []
function check(group, name, ok, detail = "") {
  if (ONLY && !ONLY.has(group)) return
  if (!ok) failures.push(`[${group}] ${name}${detail ? ` — ${detail}` : ""}`)
  console.log(`${ok ? "  ok  " : "  FAIL"} [${group}] ${name}${detail ? `  (${detail})` : ""}`)
}

/* Cảnh mẫu: lớp học, ba nhân vật, mọi hành động mới. */
const LAB = {
  id: "lab",
  label: "PHÒNG THỬ",
  title: "Cảnh thử",
  environment: "classroom",
  domain: "empathy",
  weights: { empathy: 1, communication: 0.5 },
  characters: [
    { id: "player", x: 90, mood: "neutral", name: "Bạn" },
    { id: "friend", x: 200, mood: "concerned", name: "Linh" },
    { id: "classmate", x: 270, mood: "neutral", name: "Minh" },
  ],
  dialogue: [
    { who: "narrator", text: "Giờ ra chơi. Lớp ồn ào, nhưng Linh ngồi im." },
    { who: "friend", text: "Mình ổn mà. Thật đấy." },
    { who: "classmate", text: "Ê, ra căng tin không?" },
  ],
  timeline: [
    { at: 200, char: "friend", do: "emote", kind: "sweat" },
    { at: 500, char: "classmate", do: "say", text: "Đi nhanh kẻo hết bánh!" },
    { at: 900, char: "classmate", do: "hop" },
    { at: 1200, char: "friend", do: "slump" },
    { at: 1400, do: "tint", tone: "tense" },
    { at: 1600, do: "chat", from: "Nhóm lớp", text: "Ai có đề cương Sử không?" },
    { at: 1900, do: "chat", from: "Bạn", text: "Tớ có, để tớ gửi.", me: true },
    { at: 2300, do: "chatClose" },
    { at: 2500, do: "zoom", target: "friend", scale: 1.3 },
    { at: 3200, do: "zoomReset" },
    { at: 3400, do: "decisionPoint" },
  ],
  choices: [
    { id: "A", code: "A", text: "Ngồi xuống cạnh Linh và hỏi nhỏ.", scores: { empathy: 3, communication: 3 }, pattern: "checks_in", strategy: "x", consequence: "x" },
    { id: "B", code: "B", text: "Đi căng tin với Minh.", scores: { empathy: 1, communication: 1 }, pattern: "avoids", strategy: "x", consequence: "x" },
  ],
  consequences: {
    A: [
      { at: 100, char: "player", do: "walkTo", x: 170 },
      { at: 700, char: "player", do: "say", text: "Cậu muốn kể không? Tớ ở đây." },
      { at: 1300, char: "friend", do: "emote", kind: "heart" },
      { at: 1500, char: "friend", do: "say", text: "Cảm ơn cậu…" },
    ],
    B: [
      { at: 100, char: "classmate", do: "say", text: "Đi thôi!" },
      { at: 600, char: "friend", do: "emote", kind: "ellipsis" },
      { at: 900, char: "friend", do: "shiver" },
    ],
  },
  practice: { signal: "x", stronger: "x", principle: "x" },
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
const page = await browser.newPage({ viewport: { width: 1280, height: 860 } })
const errors = []
page.on("pageerror", (e) => errors.push(e.message))
page.on("console", (m) => m.type() === "error" && errors.push(m.text()))
await page.goto(`${BASE}/practice`, { waitUntil: "networkidle" })

await page.evaluate(async (scene) => {
  const { createSceneRuntime } = await import("/js/scene/sceneRuntime.js")
  const main = document.querySelector("#main")
  main.replaceChildren()
  const host = document.createElement("div")
  host.className = "scene-stage-host"
  main.append(host)
  window.__lab = { answered: null, done: false }
  const rt = createSceneRuntime(host, scene, {
    onAnswer(id) { window.__lab.answered = id },
    onDone() { window.__lab.done = true },
  })
  window.__labRt = rt
  rt.start()
}, LAB)

const q = (sel) => page.locator(`.scene-stage-host ${sel}`)
const click = () => page.evaluate(() => document.querySelector(".scene-stage-host .scn-stage")?.click())

/* -------- trước lựa chọn: lấy mẫu trạng thái theo thời gian */
const seen = { talkingFriend: false, hintFriend: false, say: "", sweat: false, hop: false, slump: false, tint: false, chatMsgs: 0, chatMe: false, zoom: 1, extras: 0, faceTurn: false }
for (let i = 0; i < 70; i += 1) {
  const s = await page.evaluate(() => {
    const root = document.querySelector(".scene-stage-host")
    const charNode = (id) => root.querySelector(`.scn-char[data-char="${id}"]`)
    const friend = charNode("friend")
    const cam = root.querySelector(".scn-camera")
    const m = cam ? /scale\(([\d.]+)\)/.exec(cam.style.transform || "") : null
    return {
      talkingFriend: Boolean(friend?.classList.contains("is-talking")),
      hint: root.querySelector(".console__hint")?.textContent || "",
      say: [...root.querySelectorAll(".scn-say")].map((n) => n.textContent).join(" | "),
      sweat: Boolean(root.querySelector('.scn-emote[data-kind="sweat"]')),
      hop: root.querySelector(".scn-char[data-gesture='hop']") !== null,
      slump: root.querySelector(".scn-char[data-gesture='slump']") !== null,
      tint: root.querySelector('.scn-tint[data-tone="tense"]') !== null,
      chatMsgs: root.querySelectorAll(".scn-phone .scn-chat-msg").length,
      chatMe: root.querySelector(".scn-phone .scn-chat-msg.is-me") !== null,
      zoom: m ? Number(m[1]) : 1,
      extras: root.querySelectorAll(".scn-extras .scn-extra").length,
      choices: root.querySelectorAll(".choices.is-open .choice").length,
      player: charNode("player")?.style.transform || "",
    }
  })
  seen.talkingFriend ||= s.talkingFriend
  seen.hintFriend ||= /linh/i.test(s.hint)
  if (s.say) seen.say += ` ${s.say}`
  seen.sweat ||= s.sweat
  seen.hop ||= s.hop
  seen.slump ||= s.slump
  seen.tint ||= s.tint
  seen.chatMsgs = Math.max(seen.chatMsgs, s.chatMsgs)
  seen.chatMe ||= s.chatMe
  seen.zoom = Math.max(seen.zoom, s.zoom)
  seen.extras = Math.max(seen.extras, s.extras)
  if (i === 12) await page.screenshot({ path: `${REPORTS}/scene-lab-1.png` })
  if (s.choices > 0) break
  if (i % 3 === 2) await click()
  await page.waitForTimeout(140)
}

check("flow", "mỗi nhân vật có data-char", (await q(".scn-char[data-char]").count()) === 3)
check("speakers", "người đang nói có class is-talking", seen.talkingFriend)
check("speakers", "khung thoại ghi tên người nói", seen.hintFriend)
check("say", "bong bóng .scn-say hiện lời của Minh", /kẻo hết bánh/.test(seen.say), seen.say.slice(0, 80))
check("emotes", "biểu cảm sweat hiện trên đầu", seen.sweat)
check("gestures", "cử chỉ hop", seen.hop)
check("gestures", "cử chỉ slump", seen.slump)
check("tint", "sắc độ tense", seen.tint)
check("phone", "điện thoại hiện 2 tin nhắn", seen.chatMsgs === 2, `${seen.chatMsgs}`)
check("phone", "tin nhắn của mình có is-me", seen.chatMe)
check("camera", "máy quay phóng to > 1.2", seen.zoom > 1.2, `${seen.zoom}`)
check("extras", "lớp học có người qua lại phía sau", seen.extras >= 2, `${seen.extras}`)
const decisionOn = await page.evaluate(() => document.querySelector(".scene-stage-host .scn-stage")?.dataset.decision === "on")
check("camera", "lúc quyết định: data-decision=on", decisionOn)
await page.screenshot({ path: `${REPORTS}/scene-lab-2-decision.png` })

/* -------- chọn A, xem hậu quả */
const choiceCount = await q(".choices.is-open .choice").count()
check("flow", "hiện 2 lựa chọn", choiceCount === 2, `${choiceCount}`)
if (choiceCount) await q(".choice").first().click()
let afterSay = ""
let heart = false
for (let i = 0; i < 40; i += 1) {
  const s = await page.evaluate(() => ({
    say: [...document.querySelectorAll(".scene-stage-host .scn-say")].map((n) => n.textContent).join(" | "),
    heart: Boolean(document.querySelector('.scene-stage-host .scn-emote[data-kind="heart"]')),
    done: window.__lab.done,
  }))
  if (s.say) afterSay += ` ${s.say}`
  heart ||= s.heart
  if (i === 10) await page.screenshot({ path: `${REPORTS}/scene-lab-3-consequence.png` })
  if (s.done) break
  await page.waitForTimeout(150)
}
check("say", "sau lựa chọn, nhân vật nói thành tiếng", /Tớ ở đây/.test(afterSay), afterSay.slice(0, 80))
check("emotes", "biểu cảm heart sau lựa chọn", heart)
check("flow", "onAnswer nhận A", (await page.evaluate(() => window.__lab.answered)) === "A")
check("flow", "onDone được gọi", await page.evaluate(() => window.__lab.done))
check("flow", "không có lỗi console", errors.length === 0, errors.slice(0, 3).join(" | "))

await browser.close()
server.kill()
if (failures.length) {
  console.error(`\n✗ PHÒNG THỬ CẢNH: ${failures.length} lỗi`)
  for (const f of failures) console.error(`  · ${f}`)
  process.exit(1)
}
console.log("\n✓ PHÒNG THỬ CẢNH: mọi hành động mới chạy đúng hợp đồng.")
