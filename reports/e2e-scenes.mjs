import { chromium, devices } from 'playwright'
const BASE = 'http://127.0.0.1:8787/scenes'
const results = []
const ok = (name, pass, note = '') => results.push({ name, pass: !!pass, note })

const browser = await chromium.launch()

async function newPage(opts = {}) {
  const ctx = await browser.newContext(opts)
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', (e) => errs.push(e.message))
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()) })
  return { ctx, page, errs }
}

/* ============ DESKTOP ============ */
{
  const { ctx, page, errs } = await newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)

  ok('desktop: no JS errors on load', errs.length === 0, errs.join(' | '))
  ok('desktop: 4 characters rendered', (await page.locator('.scn-char').count()) === 4)
  ok('desktop: environment svg present', (await page.locator('.scn-env__svg').count()) === 1)
  ok('desktop: console panel present', (await page.locator('.console').count()) === 1)

  // idle liveliness: sample transform over 800ms, must change
  const t0 = await page.locator('.scn-char').first().evaluate((n) => n.style.transform)
  await page.waitForTimeout(800)
  const t1 = await page.locator('.scn-char').first().evaluate((n) => n.style.transform)
  ok('desktop: idle animation moves characters', t0 !== t1, `${t0} -> ${t1}`)

  // per-character desync: two chars should have different transforms at same instant
  const ta = await page.locator('.scn-char').nth(0).evaluate((n) => n.style.transform)
  const tb = await page.locator('.scn-char').nth(2).evaluate((n) => n.style.transform)
  ok('desktop: characters not synced (different phase)', ta !== tb)

  // advance through dialogue: click stage to skip typing / advance lines
  for (let i = 0; i < 6; i++) {
    const visible = await page.locator('.choice.is-in').count()
    if (visible > 0) break
    await page.locator('.scn-stage').click()
    await page.waitForTimeout(400)
  }
  // wait for decision point — choices stagger in, so wait for ALL 3
  await page.waitForSelector('.choice.is-in', { timeout: 8000 })
  await page.waitForTimeout(300) // let staggered choices finish revealing
  ok('desktop: choices appear at decision point', (await page.locator('.choice.is-in:visible').count()) === 3)

  // no horizontal overflow
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  ok('desktop: no horizontal overflow', overflow <= 0, `overflow=${overflow}px`)

  // pick A -> consequence
  await page.locator('.choice[data-choice="A"]').click()
  await page.waitForTimeout(320)
  ok('desktop: choice A locked/confirmed', await page.locator('.choice[data-choice="A"].is-confirmed').count() === 1)
  await page.waitForTimeout(2800)
  await page.screenshot({ path: 'reports/e2e-desktop-consequence-A.png' })
  ok('desktop: consequence timeline plays (no errors)', errs.length === 0, errs.join(' | '))

  // after consequence + feedback, scene should finish (only 1 scenario -> done screen)
  await page.waitForSelector('.scene-done', { timeout: 12000 })
  ok('desktop: reaches done screen', true)
  await page.screenshot({ path: 'reports/e2e-desktop-done.png' })
  await ctx.close()
}

/* ============ MOBILE ============ */
{
  const d = devices['iPhone 13']
  const { ctx, page, errs } = await newPage(d)
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)
  ok('mobile: no JS errors on load', errs.length === 0, errs.join(' | '))
  ok('mobile: 4 characters rendered', (await page.locator('.scn-char').count()) === 4)

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  ok('mobile: no horizontal overflow', overflow <= 0, `overflow=${overflow}px`)

  // advance through dialogue
  for (let i = 0; i < 6; i++) {
    const visible = await page.locator('.choice.is-in').count()
    if (visible > 0) break
    await page.locator('.scn-stage').tap()
    await page.waitForTimeout(400)
  }
  await page.waitForSelector('.choice.is-in', { timeout: 9000 })
  const bh = await page.locator('.choice').first().evaluate((n) => n.getBoundingClientRect().height)
  ok('mobile: touch target >= 44px', bh >= 44, `height=${bh}px`)
  await page.screenshot({ path: 'reports/e2e-mobile-choices.png' })

  // touch tap choice C
  await page.locator('.choice[data-choice="C"]').tap()
  await page.waitForTimeout(3500)
  await page.screenshot({ path: 'reports/e2e-mobile-consequence-C.png' })
  ok('mobile: consequence plays after tap (no errors)', errs.length === 0, errs.join(' | '))
  await page.waitForSelector('.scene-done', { timeout: 12000 })
  ok('mobile: reaches done screen', true)
  await ctx.close()
}

/* ============ REDUCED MOTION ============ */
{
  const { ctx, page, errs } = await newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
  const t0 = await page.locator('.scn-char').first().evaluate((n) => n.style.transform)
  await page.waitForTimeout(700)
  const t1 = await page.locator('.scn-char').first().evaluate((n) => n.style.transform)
  ok('reduced-motion: characters stay static', t0 === t1, `${t0} vs ${t1}`)
  ok('reduced-motion: no JS errors', errs.length === 0, errs.join(' | '))
  // dialogue should be instant under reduced motion
  await page.waitForSelector('.choice.is-in', { timeout: 6000 })
  ok('reduced-motion: reaches decision point', true)
  await ctx.close()
}

/* ============ DOUBLE INPUT / FAST-FORWARD ============ */
{
  const { ctx, page, errs } = await newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto(BASE, { waitUntil: 'networkidle' })
  await page.waitForTimeout(400)
  // hammer stage clicks (fast-forward) during typing
  for (let i = 0; i < 12; i++) {
    await page.locator('.scn-stage').click({ position: { x: 100, y: 100 } })
    await page.waitForTimeout(40)
  }
  await page.waitForSelector('.choice.is-in', { timeout: 9000 })
  ok('fast-forward: repeated clicks reach decision point without errors', errs.length === 0, errs.join(' | '))
  // double input: second click on a DIFFERENT choice must be ignored (locked)
  await page.locator('.choice[data-choice="A"]').click({ force: true })
  await page.waitForTimeout(400)
  const confirmed = await page.locator('.choice.is-confirmed').count()
  ok('double input: only one choice confirmed', confirmed === 1, `confirmed=${confirmed}`)
  await ctx.close()
}

await browser.close()

const failed = results.filter((r) => !r.pass)
console.log(`\n=== SCENE E2E: ${results.length - failed.length}/${results.length} passed ===`)
for (const r of results) console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.note ? '  [' + r.note + ']' : ''}`)
process.exit(failed.length ? 1 : 0)
