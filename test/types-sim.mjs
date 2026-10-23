/**
 * Mô phỏng đám đông người chơi chọn ngẫu nhiên, seed cố định — chạy bao nhiêu lần
 * cũng ra cùng một kết quả.
 *
 *   node test/types-sim.mjs
 *
 * Mỗi người chơi chọn ngẫu nhiên đều một trong bốn phương án của từng tình huống
 * đánh giá, rồi pickType quyết định kiểu. Chạy trực tiếp: 5000 người, in % theo
 * kiểu. Tệp này cũng là RNG chung cho types.test.mjs (2000 người).
 */
import { fileURLToPath } from "node:url"
import { formIds, FORM_ORDER, ITEM_BY_ID } from "../public/js/core/eqScoring.js"
import { TYPES, pickType } from "../public/js/data/types.js"

/** mulberry32 — RNG nhỏ với seed cố định để đám đông tái lập được. */
export function rng(seed = 20261023) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Cho `n` người chơi giả định chọn ngẫu nhiên; trả về số người theo từng key kiểu. */
export function simulate(n, seed = 20261023) {
  const rand = rng(seed)
  const items = formIds(FORM_ORDER[0]).map((id) => ITEM_BY_ID[id]).filter(Boolean)
  const tally = Object.fromEntries(TYPES.map((t) => [t.key, 0]))
  for (let p = 0; p < n; p += 1) {
    const answers = {}
    for (const item of items) answers[item.id] = item.choices[Math.floor(rand() * item.choices.length)].id
    tally[pickType(answers).type.key] += 1
  }
  return tally
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const n = 5000
  const tally = simulate(n)
  console.log(`Mô phỏng ${n} người chơi chọn ngẫu nhiên (seed 20261023):`)
  for (const t of TYPES) console.log(`  ${t.code.padEnd(6)} ${((tally[t.key] / n) * 100).toFixed(1)}%`)
}
