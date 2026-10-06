/* run.mjs — kiểm tra hành vi + chụp ảnh cho trải nghiệm câu hỏi.
   Chạy: node test/playwright/run.mjs [--url http://127.0.0.1:8787] [--keep]
   Không chỉ khẳng định: ảnh chụp được lưu vào reports/ để soi bằng mắt. */

import { chromium, devices } from "playwright"
import { mkdir, writeFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { resolve } from "node:path"

import { QUESTIONS, QUESTION_BY_ID, DIMENSION_ORDER } from "../../public/js/data/questions.js"
import { computeRawScores, encodeScores } from "../../public/js/core/scoring.js"

const argUrl = process.argv.indexOf("--url")
const URL_BASE = (argUrl > -1 ? process.argv[argUrl + 1] : "http://127.0.0.1:8787").replace(/\/$/, "")
const REPORTS = resolve(fileURLToPath(new URL("../../reports", import.meta.url)))
await mkdir(REPORTS, { recursive: true })

const journal = []
const shots = []
const failures = []
let step = 0

function check(name, ok, detail = "") {
  journal.push({ name, ok: !!ok, detail })
  if (!ok) failures.push(`${name}${detail ? ` — ${detail}` : ""}`)
  console.log(`${ok ? "  ok  " : "  FAIL"} ${name}${detail ? `  (${detail})` : ""}`)
}

const shot = async (page, name) => {
  const file = `${REPORTS}/${name}.png`
  await page.screenshot({ path: file, fullPage: false })
  shots.push(file)
  return file
}

const state = (page) => page.evaluate(() => document.querySelector(".scene")?.dataset.state || "none")
const boardHeight = (page) => page.evaluate(() => Math.round(document.querySelector(".console")?.getBoundingClientRect().height || 0))
const consoleText = (page) => page.evaluate(() => document.querySelector(".console__text")?.textContent || "")
const choiceCount = (page) => page.locator(".choice:visible").count()
const activeIndex = (page) =>
  page.evaluate(() => {
    const items = [...document.querySelectorAll(".choice")]
    return items.findIndex((n) => n.classList.contains("is-active"))
  })
const confirmedIds = (page) =>
  page.evaluate(() => [...document.querySelectorAll(".choice.is-confirmed")].map((n) => n.dataset.choice))
const progress = async (page) => {
  const text = await page.locator(".hud__progress").first().textContent()
  return Number((text || "").replace(/[^\d/]/g, "").split("/")[0])
}
const currentQid = (page) =>
  page.evaluate(() => {
    const first = document.querySelector(".choice")
    return first ? first.dataset.choice.replace(/_\d+$/, "") : null
  })
const overflow = (page) =>
  page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    innerW: window.innerWidth,
    bad: document.documentElement.scrollWidth > window.innerWidth + 1,
  }))

/** Quét toàn bộ câu hỏi để đối chiếu văn bản hiện trên màn hình với dữ liệu gốc. */
const BEAT_TEXTS = QUESTIONS.flatMap((q) => [...q.dialogue, q.prompt])

async function questionFromPartial(page, partial) {
  const clean = partial.trim()
  if (clean.length < 2) return null
  const matches = QUESTIONS.filter((q) => [...q.dialogue, q.prompt].some((t) => t.startsWith(clean)))
  return matches.length === 1 ? matches[0] : null
}

/** Bấm liên tục để đi hết các đoạn thoại cho tới khi tới phần hỏi (CHOOSING). */
async function dialogsToPrompt(page, { max = 30 } = {}) {
  for (let i = 0; i < max; i += 1) {
    if ((await choiceCount(page)) > 0) return true
    await nudge(page)
    await page.waitForTimeout(80)
  }
  return (await choiceCount(page)) > 0
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** Đẩy nhanh: phát một sự kiện click ngay trên sân khấu (không qua kiểm tra che khuất).
    Các phép kiểm tra tương tác chính vẫn dùng chuột/bàn phím thật. */
const nudge = (page) => page.evaluate(() => document.querySelector(".scene")?.click())

/* ======================================================= vòng 1: desktop */
const browser = await chromium.launch()
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "vi-VN" })
const page = await context.newPage()

const consoleErrors = []
page.on("console", (m) => {
  if (m.type() === "error") consoleErrors.push(m.text())
})
page.on("pageerror", (e) => consoleErrors.push(`pageerror: ${e.message}`))

console.log("\n— desktop 1440×900 —")
await page.goto(`${URL_BASE}/`, { waitUntil: "networkidle" })
await page.waitForSelector(".hero__title")
await shot(page, "01-landing-1440")

check("trang chủ hiển thị tiêu đề", await page.locator(".hero__title").first().isVisible())
check("bảng xếp hạng có 25 kiểu thường", (await page.locator(".rank__row").count()) === 25, `${await page.locator(".rank__row").count()} dòng`)
let o = await overflow(page)
check("không tràn ngang (trang chủ)", !o.bad, `${o.scrollW}/${o.innerW}`)

await page.click(".hero__cta .btn--accent")
await page.waitForSelector(".quiz-intro")
await shot(page, "02-quiz-intro")
check("màn mở đầu không lộ khung thoại rỗng", (await page.locator(".stage .scene").count()) === 0)

// công tắc âm thanh: rõ ràng, đổi trạng thái được, ghi nhớ lựa chọn
const soundBtn = page.locator(".quiz-intro .sound-toggle")
const soundOn = await soundBtn.getAttribute("data-sound")
await soundBtn.click()
const soundOff = await soundBtn.getAttribute("data-sound")
const saved = await page.evaluate(() => localStorage.getItem("sbti_sound"))
check("công tắc âm thanh tắt được và ghi nhớ", soundOn === "on" && soundOff === "off" && saved === "off", `${soundOn}→${soundOff}/${saved}`)
check("công tắc âm thanh có aria-pressed đúng", (await soundBtn.getAttribute("aria-pressed")) === "false")
await soundBtn.click()
check("bật lại âm thanh được", (await soundBtn.getAttribute("data-sound")) === "on")
await page.evaluate(() => { try { localStorage.removeItem("sbti_sound") } catch {} })

await page.click(".quiz-intro__actions .btn")
await page.waitForSelector(".scene")
await page.waitForFunction(() => (document.querySelector(".console__text")?.textContent || "").length >= 2, null, { timeout: 5000 })

const sTyping = await state(page)
check("câu hỏi tải và bắt đầu gõ chữ", sTyping === "DIALOGUE_TYPING", `state=${sTyping}`)
await shot(page, "03-dialogue-typing")
await page.waitForTimeout(320)
const partial = await consoleText(page)
await shot(page, "04-dialogue-mid")
check("chữ đang hiện dần (chưa đủ)", partial.length > 2)

// bấm 1 lần khi đang gõ: phải hiện hết chữ và KHÔNG được nhảy sang đoạn khác
await page.click(".scene", { position: { x: 30, y: 14 } })
await page.waitForTimeout(30)
const afterFinish = await consoleText(page)
const sAfterFinish = await state(page)
const cueOn = await page.locator('.console[data-cue="on"]').count()
await page.waitForTimeout(420)
const stillSame = await consoleText(page)
const sStill = await state(page)
check("bấm khi đang gõ → hiện hết chữ ngay", afterFinish.length > partial.length, `${partial.length} → ${afterFinish.length}`)
check("bấm khi đang gõ → KHÔNG nhảy sang đoạn kế", stillSame === afterFinish && sStill === "DIALOGUE_READY", `state=${sAfterFinish}/${sStill}`)
check("dấu nhắc tiếp tục hiện đúng lúc", cueOn === 1)
const fullBeat = await questionFromPartial(page, afterFinish)
check("đoạn thoại khớp dữ liệu gốc (không bịa chữ)", !!fullBeat && fullBeat.dialogue[0] === afterFinish, fullBeat ? fullBeat.id : "không khớp câu nào")
await shot(page, "05-dialogue-done")

// bấm lần nữa: phải sang đoạn kế tiếp và bắt đầu gõ lại
await page.click(".scene", { position: { x: 30, y: 14 } })
await page.waitForTimeout(120)
const sNext = await state(page)
const nextText = await consoleText(page)
check(
  "bấm sau khi gõ xong → sang đoạn kế",
  nextText !== afterFinish && ["DIALOGUE_TYPING", "QUESTION_PROMPT", "CHOOSING", "DIALOGUE_READY"].includes(sNext),
  `state=${sNext}`,
)

// đi hết đoạn thoại để tới phần lựa chọn
const boardTypingH = await boardHeight(page)
const reached = await dialogsToPrompt(page)
check("câu hỏi chính và các lựa chọn hiện ra", reached && (await choiceCount(page)) > 0, `${await choiceCount(page)} lựa chọn, state=${await state(page)}`)
await page.waitForTimeout(400)
const picked = {}
const qid = await currentQid(page)
const question = QUESTION_BY_ID[qid]
check("lựa chọn khớp đúng câu hỏi đang xem", !!question && question.options.length === (await choiceCount(page)), `${qid} / ${question?.options.length}`)
const boardChoicesH = await boardHeight(page)
check(
  "khung thoại lớn dần khi hiện lựa chọn (không chờ sẵn khoảng trống)",
  boardChoicesH > boardTypingH + 80,
  `${boardTypingH}px → ${boardChoicesH}px`,
)
await shot(page, "06-choices")

// bàn phím: ↓ rồi ↑
const a0 = await activeIndex(page)
await page.keyboard.press("ArrowDown")
await page.waitForTimeout(60)
const a1 = await activeIndex(page)
await page.keyboard.press("ArrowUp")
await page.waitForTimeout(60)
const a2 = await activeIndex(page)
check("phím ↓ đổi lựa chọn đang trỏ", a1 === (a0 + 1) % (await choiceCount(page)), `${a0} → ${a1}`)
check("phím ↑ quay lại lựa chọn trước", a2 === a0, `${a1} → ${a2}`)

await page.keyboard.press("ArrowDown")
await page.waitForTimeout(80)
await shot(page, "07-choice-active")
const before = await progress(page)
const pickIndex = await activeIndex(page)
const pickId = await page.evaluate(() => document.querySelector(".choice.is-active")?.dataset.choice)
picked[qid] = question.options[pickIndex].value
await page.keyboard.press("Enter")
await page.waitForTimeout(60)
const confirmed = await confirmedIds(page)
const afterOne = await progress(page)
check("Enter chọn được lựa chọn đang trỏ", confirmed.length === 1 && confirmed[0] === pickId, `${confirmed} vs ${pickId}`)
check("có phản hồi chọn ngay lập tức", (await page.locator(".choice.is-confirmed").count()) === 1)
check("đáp án được lưu đúng một lần", afterOne === before + 1, `${before} → ${afterOne}`)
await shot(page, "08-choice-confirmed")

// bấm loạn vào lựa chọn khác ngay sau khi đã chọn: không được ghi thêm
for (let i = 0; i < 4; i += 1) {
  await page.click(".choices", { position: { x: 30, y: 20 }, force: true }).catch(() => {})
  await page.waitForTimeout(15)
}
const afterSpam = await progress(page)
check("bấm loạn sau khi chọn → không ghi trùng", afterSpam === before + 1, `${afterSpam}`)

// chờ sang câu kế
await page.waitForFunction(() => document.querySelector(".scene")?.dataset.state === "DIALOGUE_TYPING", null, { timeout: 6000 })
await page.waitForTimeout(120)
check("câu kế tiếp xuất hiện", ((await page.locator(".hud__count").first().textContent()) || "").includes("2"), await page.locator(".hud__count").first().textContent())
check("trạng thái câu trước không rò sang câu mới", (await confirmedIds(page)).length === 0 && (await choiceCount(page)) === 0)
check("lựa chọn câu trước không còn trong khung nhìn", (await page.locator(".choice:visible").count()) === 0)
await shot(page, "09-next-question")

/* ---- vòng lặp trả lời tới hết (đáp án đã chọn được ghi lại để đối chiếu điểm) ---- */
/** Danh sách lựa chọn đã mở và đã mở khoá (tức là đang thật sự chờ người trả lời). */
const choicesReady = (page) =>
  page.evaluate(() => {
    const list = document.querySelector(".choices")
    if (!list) return false
    const open = list.classList.contains("is-open") && !list.classList.contains("is-locked")
    return open && document.querySelectorAll(".choice").length > 0
  })

/** Đi hết các đoạn thoại rồi chọn phương án đầu tiên. */
async function answerFirstOption(page, picked) {
  for (let i = 0; i < 24; i += 1) {
    if (await page.locator(".result").count()) return
    if (await choicesReady(page)) break
    await nudge(page)
    await page.waitForTimeout(55)
  }
  if (await page.locator(".result").count()) return
  if (!(await choicesReady(page))) return
  const id = await currentQid(page)
  const q = QUESTION_BY_ID[id]
  if (q) picked[id] = q.options[0].value
  await page.click(".choice:visible >> nth=0")
  await page.waitForTimeout(150)
}

for (let guard = 0; guard < 90; guard += 1) {
  if (await page.locator(".result").count()) break
  await answerFirstOption(page, picked)
}

check("đi hết được tới màn kết quả", (await page.locator(".result").count()) > 0)
const url = page.url()
const encoded = new URL(url).searchParams.get("result")
check("kết quả có mã DNA 16 ký tự", /^\d{16}$/.test(encoded || ""), encoded || "thiếu")
// đối chiếu độc lập: tự tính điểm từ đáp án đã ghi lại
const expected = encodeScores(computeRawScores(picked), false)
check("mã DNA khớp phép tính độc lập từ 30 đáp án", expected === encoded, `tính lại ${expected} vs ${encoded}`)
check("đủ 30 câu + câu cổng", Object.keys(picked).length >= 30, `${Object.keys(picked).length} câu`)
await page.waitForSelector(".verdict__code")
await shot(page, "10-result")
const verdict = await page.locator(".verdict__code").first().textContent()
check("màn kết quả hiện kiểu tính cách", !!verdict, verdict)
check("hồ sơ 15 chiều hướng hiện ra", (await page.locator(".dim").count()) === 15, `${await page.locator(".dim").count()} chiều`)
o = await overflow(page)
check("không tràn ngang (kết quả)", !o.bad, `${o.scrollW}/${o.innerW}`)

// kiểm tra đã gửi số liệu lên /api/stats đúng một lần cho lượt chơi vừa rồi
const stats = await (await fetch(`${URL_BASE}/api/stats`)).json()
check("có ghi nhận thống kê lượt hoàn thành", (stats.total || 0) >= 1, JSON.stringify(stats.types || {}))

// trang danh sách + chi tiết kiểu
await page.goto(`${URL_BASE}/types`, { waitUntil: "networkidle" })
await page.waitForSelector(".tcard")
check("trang 27 kiểu hiển thị đủ thẻ", (await page.locator(".tcard").count()) === 27, `${await page.locator(".tcard").count()}`)
await shot(page, "11-types-1440")
await page.click(".tcard >> nth=0")
await page.waitForSelector(".verdict__code")
check("trang chi tiết kiểu mở được", (await page.locator(".dim").count()) === 15)
await shot(page, "12-type-detail")

// hành vi khi tải lại giữa bài: quay về màn mở đầu (giống bản gốc, không lưu tiến độ)
await page.goto(`${URL_BASE}/quiz`, { waitUntil: "networkidle" })
await page.waitForSelector(".quiz-intro")
check("tải lại giữa bài → về màn mở đầu (giống bản gốc)", (await page.locator(".stage .scene").count()) === 0)

check("không có lỗi console ở desktop", consoleErrors.length === 0, consoleErrors.slice(0, 3).join(" | "))

/* ============================================================ mobile 390 */
console.log("\n— mobile 390×844 —")
const mob = await browser.newContext({ ...devices["iPhone 12"], locale: "vi-VN", viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })
const mp = await mob.newPage()
const mobErrors = []
mp.on("console", (m) => m.type() === "error" && mobErrors.push(m.text()))
mp.on("pageerror", (e) => mobErrors.push(`pageerror: ${e.message}`))
await mp.goto(`${URL_BASE}/quiz`, { waitUntil: "networkidle" })
await mp.click(".quiz-intro__actions .btn")
await mp.waitForSelector(".scene")
await mp.waitForFunction(() => (document.querySelector(".console__text")?.textContent || "").length >= 2)
await shot(mp, "13-mobile-dialogue")
await dialogsToPrompt(mp)
await mp.waitForTimeout(400)
await shot(mp, "14-mobile-choices")
const box = await mp.locator(".choice >> nth=0").boundingBox()
check("ô lựa chọn đủ lớn để chạm (≥44px)", (box?.height || 0) >= 44, `${Math.round(box?.height || 0)}px`)
o = await overflow(mp)
check("không tràn ngang (mobile)", !o.bad, `${o.scrollW}/${o.innerW}`)
const beforeTap = await progress(mp)
await mp.locator(".choice >> nth=0").tap()
await mp.waitForTimeout(120)
check("chạm được lựa chọn trên mobile", (await confirmedIds(mp)).length === 1)
check("đáp án trên mobile lưu đúng một lần", (await progress(mp)) === beforeTap + 1)
await shot(mp, "15-mobile-confirmed")

/* =========================================================== narrow 320 */
console.log("\n— narrow 320×700 —")
const narrow = await browser.newContext({ locale: "vi-VN", viewport: { width: 320, height: 700 }, isMobile: true, hasTouch: true })
const np = await narrow.newPage()
const narrowErrors = []
np.on("console", (m) => m.type() === "error" && narrowErrors.push(m.text()))
np.on("pageerror", (e) => narrowErrors.push(`pageerror: ${e.message}`))
await np.goto(`${URL_BASE}/quiz`, { waitUntil: "networkidle" })
await np.click(".quiz-intro__actions .btn")
await np.waitForFunction(() => (document.querySelector(".console__text")?.textContent || "").length >= 2)
await dialogsToPrompt(np)
await np.waitForTimeout(400)
await shot(np, "16-narrow-choices")
o = await overflow(np)
check("không tràn ngang (320px)", !o.bad, `${o.scrollW}/${o.innerW}`)
const clip = await np.evaluate(() => {
  const box = document.querySelector(".console__text")
  return box ? { overflowY: box.scrollHeight > box.clientHeight + 2, h: box.clientHeight, sh: box.scrollHeight } : null
})
check("chữ trong khung thoại không bị cắt (320px)", clip && !clip.overflowY, JSON.stringify(clip))
// lựa chọn dài nhất không được tràn khỏi nút
const textClip = await np.evaluate(() =>
  [...document.querySelectorAll(".choice")].some((n) => {
    const t = n.querySelector(".choice__text")
    return t && t.scrollWidth > n.clientWidth + 2
  }),
)
check("chữ trong lựa chọn không tràn (320px)", !textClip)

/* ============================================================ giọng thoại */
// Không nghe được bằng tai trong CI: giả lập WebAudio để ĐẾM và ĐO tiếng blip thật.
console.log("\n— giọng thoại kể chuyện —")
const audioStub = () => {
  const rec = { osc: [], pending: [], last: 0 }
  window.__voice = rec
  const node = () => ({ connect: (t) => t })
  class FakeCtx {
    constructor() {
      this.currentTime = 0
      this.state = "running"
      this.sampleRate = 48000
      this.destination = node()
    }
    resume() { return Promise.resolve() }
    createGain() {
      // phong bì gắn vào xung ĐẦU TIÊN của tiếng blip đang dựng
      const lead = rec.pending[0] || rec.osc[rec.osc.length - 1]
      return { ...node(), gain: { value: 0, setValueAtTime() {}, exponentialRampToValueAtTime(v, t) { if (lead) (lead.ramps = lead.ramps || []).push({ v, t }) } } }
    }
    createBiquadFilter() {
      // lọc lowpass đánh dấu cả cụm xung của tiếng blip này = tiếng có chủ đích
      for (const o of rec.pending) o.toned = true
      rec.pending.length = 0
      return { ...node(), type: "", frequency: { setValueAtTime() {} } }
    }
    createOscillator() {
      const now = performance.now()
      if (!rec.last || now - rec.last > 4 || rec.pending.length > 2) rec.pending.length = 0
      rec.last = now
      const o = {
        type: "square", freqs: [], ramps: [], freqRamps: [], at: 0, toned: false,
        lead: rec.pending.length === 0,
        frequency: {
          setValueAtTime: (v) => {
            o.freqs.push(v)
            o.f0 = v
            // xung thứ hai lệch ~1,35% so với xung đầu = tiếng giọng thoại (không phải tiếng menu)
            const lead = rec.pending[0]
            if (lead && lead !== o && lead.f0 && Math.abs(v / lead.f0 - 1.0135) < 0.004) {
              o.voice = true
              lead.voice = true
            }
          },
          exponentialRampToValueAtTime: (v, t) => { o.freqRamps.push({ v, t }) },
        },
        connect: (t) => t,
        start() { o.at = performance.now() },
        stop() {},
      }
      rec.osc.push(o)
      rec.pending.push(o)
      return o
    }
  }
  window.AudioContext = FakeCtx
  window.webkitAudioContext = FakeCtx
}
const voiceOf = (page) => page.evaluate(() => window.__voice.osc.filter((o) => o.voice && o.lead).map((o) => ({ f: o.f0, at: o.at })))

const vc = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "vi-VN" })
const vp = await vc.newPage()
const vErrors = []
vp.on("pageerror", (e) => vErrors.push(e.message))
vp.on("console", (m) => { if (m.type() === "error") vErrors.push(m.text()) })
await vp.addInitScript(audioStub)
await vp.goto(`${URL_BASE}/quiz`, { waitUntil: "networkidle" })
await vp.click(".quiz-intro__actions .btn")
await vp.waitForSelector(".scene .console")
let typingBlips = 0
let typingLen = 0
for (let i = 0; i < 80; i += 1) {
  const st = await state(vp)
  if (st === "DIALOGUE_TYPING" || st === "QUESTION_PROMPT") {
    typingBlips = Math.max(typingBlips, (await voiceOf(vp)).length)
    typingLen = Math.max(typingLen, (await consoleText(vp)).length)
    await vp.waitForTimeout(140)
    continue
  }
  if (await choicesReady(vp)) break
  if (st === "DIALOGUE_READY") await nudge(vp)
  await vp.waitForTimeout(130)
}
check("giọng thoại: mỗi ký tự hiện ra có tiếng blip riêng", typingBlips >= 10 && typingBlips <= typingLen, `${typingBlips} blip / ${typingLen} ký tự`)

const vAt = await voiceOf(vp)
const gaps = vAt.slice(1).map((o, i) => o.at - vAt[i].at)
const minGap = gaps.length ? Math.min(...gaps) : 0
check("giọng thoại: nhịp blip được hãm, không rè liên hồi", minGap >= 28, `gap nhỏ nhất ${minGap.toFixed(1)}ms`)

const slide = await vp.evaluate(() => {
  const leads = window.__voice.osc.filter((o) => o.voice && o.lead)
  const glided = leads.filter((o) => o.freqRamps.length > 0)
  const twins = window.__voice.osc.filter((o) => o.voice).length
  return { leads: leads.length, glided: glided.length, perBlip: twins / (leads.length || 1) }
})
check("giọng thoại: KHÔNG trượt cao độ trong từng tiếng (hết kiểu 'vỗ cánh')", slide.glided === 0, `${slide.glided}/${slide.leads} tiếng có trượt`)
check("giọng thoại: hai xung lệch nhau tạo độ gắt kiểu chip", slide.perBlip >= 1.9, `${slide.perBlip.toFixed(2)} xung / tiếng`)

const shape = await vp.evaluate(() => {
  const o = window.__voice.osc.filter((x) => x.voice && x.ramps.length >= 2).map((x) => ({ peak: x.ramps[0].v, dur: x.ramps[1].t - x.ramps[0].t }))
  return { n: o.length, peak: Math.max(...o.map((x) => x.peak)), maxDur: Math.max(...o.map((x) => x.dur)) }
})
check("giọng thoại: blip rất ngắn và rất khẽ (không chói)", shape.n > 0 && shape.peak <= 0.04 && shape.maxDur <= 0.05, `đỉnh ${shape.peak} · dài ${(shape.maxDur * 1000).toFixed(0)}ms`)

const distinct = new Set(vAt.map((o) => Math.round(o.f)))
const fMin = Math.min(...vAt.map((o) => o.f))
const fMax = Math.max(...vAt.map((o) => o.f))
check("giọng thoại: cao độ trôi, không phải tiếng bíp cố định", distinct.size >= 4 && fMax - fMin >= 8, `${distinct.size} cao độ, ${fMin.toFixed(0)}–${fMax.toFixed(0)}Hz`)

await vp.waitForTimeout(500)
const afterDone = (await voiceOf(vp)).length
await vp.waitForTimeout(700)
check("giọng thoại: chữ hiện xong thì im", (await voiceOf(vp)).length === afterDone, `${afterDone} blip`)

// đổi biểu cảm -> đổi hồ sơ giọng (gọi thẳng module, cùng một instance với app)
const voiceMeans = {}
for (const face of ["concerned", "happy"]) {
  voiceMeans[face] = await vp.evaluate(async (f) => {
    const { sound } = await import("/js/core/sound.js")
    sound.setVoice(f)
    const start = window.__voice.osc.length
    for (let i = 0; i < 8; i += 1) {
      sound.voice("ẫ")
      await new Promise((r) => setTimeout(r, 55))
    }
    const got = window.__voice.osc.slice(start).filter((o) => o.voice && o.lead).map((o) => o.f0)
    return got.reduce((a, b) => a + b, 0) / (got.length || 1)
  }, face)
}
check("giọng thoại: biểu cảm khác nhau thì giọng khác nhau", voiceMeans.happy > voiceMeans.concerned + 20, `lo lắng ${voiceMeans.concerned.toFixed(0)}Hz vs vui ${voiceMeans.happy.toFixed(0)}Hz`)

// tắt âm thanh thì tuyệt đối im lặng
const muteCtx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "vi-VN" })
await muteCtx.addInitScript(() => { try { localStorage.setItem("sbti_sound", "off") } catch {} })
await muteCtx.addInitScript(audioStub)
const mutePage = await muteCtx.newPage()
await mutePage.goto(`${URL_BASE}/quiz`, { waitUntil: "networkidle" })
await mutePage.click(".quiz-intro__actions .btn")
await mutePage.waitForSelector(".scene .console")
await mutePage.waitForTimeout(900)
const mutedBlips = await mutePage.evaluate(() => window.__voice.osc.length)
check("giọng thoại: tắt âm thanh thì không phát gì", mutedBlips === 0, `${mutedBlips} blip`)
check("giọng thoại: không lỗi console", vErrors.length === 0, vErrors.join(" | "))
await muteCtx.close()
await vc.close()

/* ===================================================== giảm chuyển động */
console.log("\n— prefers-reduced-motion —")
const rm = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce", locale: "vi-VN" })
const rp = await rm.newPage()
const rmErrors = []
rp.on("pageerror", (e) => rmErrors.push(e.message))
await rp.goto(`${URL_BASE}/quiz`, { waitUntil: "networkidle" })
await rp.click(".quiz-intro__actions .btn")
await rp.waitForSelector(".scene")
await rp.waitForTimeout(180)
const rmText = await consoleText(rp)
const rmState = await state(rp)
check("giảm chuyển động: chữ hiện ngay, không gõ từng ký tự", rmText.length > 20 && rmState === "DIALOGUE_READY", `state=${rmState} len=${rmText.length}`)
for (let i = 0; i < 16; i += 1) {
  if (await choicesReady(rp)) break
  await nudge(rp)
  await rp.waitForTimeout(60)
}
check("giảm chuyển động: vẫn đi tiếp được tới phần lựa chọn", await choicesReady(rp))
const rmAnswered = await progress(rp)
await rp.click(".choice:visible >> nth=0")
await rp.waitForTimeout(160)
check("giảm chuyển động: chọn được đáp án", (await progress(rp)) === rmAnswered + 1)
await shot(rp, "17-reduced-motion")

/* ============================================================ tổng kết */
const allErrors = [...consoleErrors, ...mobErrors, ...narrowErrors, ...rmErrors]
check("không có lỗi console trên mọi ngữ cảnh", allErrors.length === 0, allErrors.slice(0, 4).join(" | "))

await context.close()
await mob.close()
await narrow.close()
await rm.close()
if (!process.argv.includes("--keep")) await browser.close()

const summary = {
  url: URL_BASE,
  at: new Date().toISOString(),
  passed: journal.filter((j) => j.ok).length,
  failed: failures.length,
  failures,
  journal,
  screenshots: shots,
}
await writeFile(`${REPORTS}/playwright-report.json`, JSON.stringify(summary, null, 2), "utf8")
console.log(`\n===== ${summary.passed} đạt / ${summary.failed} lỗi =====`)
if (failures.length) {
  console.log("LỖI:\n- " + failures.join("\n- "))
  process.exitCode = 1
}
console.log(`ảnh chụp: ${shots.length} → reports/`)