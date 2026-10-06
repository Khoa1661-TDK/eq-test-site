/**
 * Kiểm tra dữ liệu + chấm điểm EQ (không cần trình duyệt).
 *
 *   node test/eq-data.test.mjs
 *
 * Bộ này kiểm những bất biến mà bộ Playwright không thấy được: hình dạng dữ
 * liệu, tính công bằng của điểm tối đa, tính tất định của kết quả, và biên
 * điểm. Chạy trước bộ Playwright — nếu dữ liệu hỏng thì mọi con số trên giao
 * diện đều vô nghĩa.
 */
import { EQ_DIMENSIONS, EQ_BY_KEY } from "../public/js/data/eqDimensions.js";
import {
  SCENARIOS,
  SCENARIO_BY_ID,
  SCENARIOS_BY_DOMAIN,
  EQ_DOMAIN_ORDER,
} from "../public/js/data/scenarios.js";
import {
  MAX_CHOICE_SCORE,
  BAND_HIGH,
  BAND_MID,
  measuredKeys,
  maxPointsByDimension,
  levelFor,
  bandFor,
  scoreAnswers,
} from "../public/js/core/eqScoring.js";

let passed = 0;
const failures = [];

function ok(condition, label, detail) {
  if (condition) {
    passed += 1;
    return;
  }
  failures.push(detail ? `${label} — ${detail}` : label);
}

function eq(actual, expected, label) {
  ok(actual === expected, label, `nhận ${JSON.stringify(actual)}, mong ${JSON.stringify(expected)}`);
}

const DIM_KEYS = EQ_DIMENSIONS.map((d) => d.key);
const VIETNAMESE = /[àáảãạăằắẳẵặâầấẩẫậđèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ]/i;

/* ── 1. Khung chiều ────────────────────────────────────────────────────── */
eq(EQ_DIMENSIONS.length, 5, "có đúng 5 kỹ năng");
eq(EQ_DOMAIN_ORDER.length, 5, "EQ_DOMAIN_ORDER có 5 khoá");
eq(EQ_DOMAIN_ORDER.join(","), DIM_KEYS.join(","), "thứ tự khoá chiều khớp giữa hai file");
if (EQ_DIMENSIONS.length)
  console.log(
    `  kỹ năng: ${EQ_DIMENSIONS.map((d) => `${d.code}=${d.key}`).join(" · ")}`
  );

/* ── 2. Hình dạng tình huống ───────────────────────────────────────────── */
ok(SCENARIOS.length >= 24, "có ít nhất 24 tình huống", `nhận ${SCENARIOS.length}`);
eq(Object.keys(SCENARIO_BY_ID).length, SCENARIOS.length, "SCENARIO_BY_ID đủ mọi tình huống");

const seenIds = new Set();
for (const s of SCENARIOS) {
  const at = `[${s.id}]`;
  ok(!seenIds.has(s.id), `${at} id không trùng`, "id bị lặp");
  seenIds.add(s.id);

  ok(DIM_KEYS.includes(s.domain), `${at} domain thuộc 5 chiều`, `domain="${s.domain}"`);
  ok(typeof s.face === "string" && s.face.length > 0, `${at} có face`);
  ok(typeof s.title === "string" && s.title.trim().length > 0, `${at} có title`);
  ok(typeof s.prompt === "string" && s.prompt.trim().length > 0, `${at} có prompt`);
  ok(VIETNAMESE.test(s.prompt), `${at} prompt là tiếng Việt có dấu`);

  const dialogue = Array.isArray(s.dialogue) ? s.dialogue : [];
  ok(dialogue.length >= 2 && dialogue.length <= 4, `${at} có 2–4 nhịp thoại`, `nhận ${dialogue.length}`);
  for (const line of dialogue) {
    ok(typeof line === "string" && line.trim().length > 0, `${at} nhịp thoại không rỗng`);
  }

  /* Dung lượng chữ: nhịp thoại và lựa chọn phải vừa khung thoại trên mobile. */
  for (const line of dialogue) {
    ok(line.length <= 200, `${at} nhịp thoại ≤ 200 ký tự`, `nhận ${line.length}`);
  }

  const choices = Array.isArray(s.choices) ? s.choices : [];
  eq(choices.length, 4, `${at} có đúng 4 phương án`);

  const codes = choices.map((c) => c.code);
  eq(codes.join(""), "ABCD", `${at} mã phương án là A,B,C,D`);

  const keySets = choices.map((c) => Object.keys(c.scores || {}).sort().join("+"));
  eq(new Set(keySets).size, 1, `${at} mọi phương án đo cùng tập chiều`, keySets.join(" | "));

  for (const key of Object.keys(choices[0]?.scores || {})) {
    ok(DIM_KEYS.includes(key), `${at} khoá điểm "${key}" là chiều hợp lệ`);
  }

  const choiceIds = new Set();
  for (const c of choices) {
    const cAt = `${at}${c.code}`;
    ok(!choiceIds.has(c.id), `${cAt} id phương án không trùng`, `"${c.id}"`);
    choiceIds.add(c.id);

    ok(typeof c.text === "string" && c.text.trim().length > 0, `${cAt} có nội dung`);
    ok(VIETNAMESE.test(c.text || ""), `${cAt} nội dung là tiếng Việt có dấu`);
    ok((c.text || "").length <= 220, `${cAt} nội dung ≤ 220 ký tự`, `nhận ${(c.text || "").length}`);
    ok(typeof c.strategy === "string" && c.strategy.trim().length > 0, `${cAt} có strategy`);
    ok(typeof c.consequence === "string" && c.consequence.trim().length > 0, `${cAt} có consequence`);

    for (const [key, value] of Object.entries(c.scores || {})) {
      ok(Number.isInteger(value), `${cAt}.${key} là số nguyên`, `nhận ${value}`);
      ok(value >= 0 && value <= MAX_CHOICE_SCORE, `${cAt}.${key} trong 0..${MAX_CHOICE_SCORE}`, `nhận ${value}`);
    }
  }

  /* Đáp án trùng chữ nghĩa thì lựa chọn trở nên vô nghĩa. */
  const texts = choices.map((c) => (c.text || "").trim().toLowerCase());
  eq(new Set(texts).size, 4, `${at} 4 phương án khác nhau về chữ`);

  /* Phải có một phương án rõ ràng kém và một khoảng cách đủ lớn, nếu không thì
     tình huống không đo được gì. Hai phương án cùng điểm cao nhất là chấp nhận
     được — thực tế có nhiều cách xử lý tốt như nhau. */
  const totals = choices.map((c) =>
    Object.values(c.scores || {}).reduce((a, b) => a + b, 0)
  );
  const sorted = [...totals].sort((a, b) => b - a);
  ok(sorted[0] - sorted[3] >= 3, `${at} khoảng cách tốt nhất–kém nhất ≥ 3`, totals.join("/"));
  ok(sorted[3] <= 2, `${at} có ít nhất một phương án kém rõ ràng`, `kém nhất ${sorted[3]}`);

  ok(s.practice && typeof s.practice === "object", `${at} có khối practice`);
  for (const field of ["signal", "stronger", "principle"]) {
    ok(
      typeof s.practice?.[field] === "string" && s.practice[field].trim().length > 0,
      `${at} practice.${field} có nội dung`
    );
  }
}

/* ── 3. Phân bổ theo chiều ─────────────────────────────────────────────── */
const byDomain = {};
const measuredBy = {};
for (const key of DIM_KEYS) {
  byDomain[key] = 0;
  measuredBy[key] = 0;
}
for (const s of SCENARIOS) {
  byDomain[s.domain] = (byDomain[s.domain] || 0) + 1;
  for (const key of measuredKeys(s)) measuredBy[key] += 1;
}
console.log(
  `  tình huống: ${DIM_KEYS.map((k) => `${k} ${byDomain[k]}/đo ${measuredBy[k]}`).join(" · ")}`
);

for (const key of DIM_KEYS) {
  ok(byDomain[key] >= 5, `chiều ${key} có ít nhất 5 tình huống chính`, `nhận ${byDomain[key]}`);
  ok(measuredBy[key] >= 6, `chiều ${key} được đo ít nhất 6 lần`, `nhận ${measuredBy[key]}`);
}

/* Mỗi chiều phải có đúng số tình huống mà SCENARIOS_BY_DOMAIN khai báo. */
for (const key of DIM_KEYS) {
  eq((SCENARIOS_BY_DOMAIN[key] || []).length, byDomain[key], `SCENARIOS_BY_DOMAIN["${key}"] khớp`);
}

/* ── 4. Điểm tối đa ────────────────────────────────────────────────────── */
const maxima = maxPointsByDimension();
let maxTotal = 0;
for (const key of DIM_KEYS) {
  eq(maxima[key], MAX_CHOICE_SCORE * measuredBy[key], `điểm tối đa ${key} = 3 × số tình huống đo`);
  ok(maxima[key] > 0, `điểm tối đa ${key} > 0`);
  maxTotal += maxima[key];
}
console.log(`  tổng điểm tối đa: ${maxTotal}`);

/* ── 5. Chấm điểm: biên, tất định, đơn điệu ────────────────────────────── */
const best = {};
const worst = {};
const lazy = {};
for (const s of SCENARIOS) {
  const totals = s.choices.map((c) => ({
    id: c.id,
    n: Object.values(c.scores).reduce((a, b) => a + b, 0),
  }));
  best[s.id] = totals.reduce((a, b) => (b.n > a.n ? b : a)).id;
  worst[s.id] = totals.reduce((a, b) => (b.n < a.n ? b : a)).id;
  lazy[s.id] = s.choices[0].id;
}

const bestResult = scoreAnswers(best);
const worstResult = scoreAnswers(worst);
const lazyResult = scoreAnswers(lazy);

ok(bestResult.complete, "bộ đáp án tốt nhất được coi là hoàn thành");
eq(bestResult.answered, SCENARIOS.length, "bộ đáp án tốt nhất trả lời đủ câu");
eq(bestResult.total, SCENARIOS.length, "total = số tình huống");

for (const result of [bestResult, worstResult, lazyResult]) {
  ok(Number.isInteger(result.overall), "điểm tổng là số nguyên");
  ok(result.overall >= 0 && result.overall <= 100, "điểm tổng trong 0..100", `nhận ${result.overall}`);
  for (const dim of result.dimensions) {
    ok(Number.isInteger(dim.score), `${dim.key} là số nguyên`);
    ok(dim.score >= 0 && dim.score <= 100, `${dim.key} trong 0..100`, `nhận ${dim.score}`);
    ok(dim.possible === maxima[dim.key], `${dim.key} possible khớp điểm tối đa`);
    ok(dim.earned >= 0 && dim.earned <= dim.possible, `${dim.key} earned trong biên`);
    eq(dim.score, Math.round((dim.earned / dim.possible) * 100), `${dim.key} score = earned/possible`);
  }
}

ok(bestResult.overall > worstResult.overall, "chọn tốt nhất > chọn tệ nhất", `${bestResult.overall} vs ${worstResult.overall}`);
ok(bestResult.overall < 100, "không có điểm tuyệt đối 100", `nhận ${bestResult.overall}`);
ok(worstResult.overall > 0, "chọn tệ nhất vẫn có điểm > 0", `nhận ${worstResult.overall}`);
console.log(
  `  điểm tổng: tốt nhất ${bestResult.overall} · luôn chọn A ${lazyResult.overall} · tệ nhất ${worstResult.overall}`
);
console.log(
  `  tốt nhất theo chiều: ${bestResult.dimensions.map((d) => `${d.code} ${d.score}`).join(" · ")}`
);

/* Cùng một tập đáp án phải ra cùng kết quả (không phụ thuộc thứ tự khoá). */
const shuffledAnswers = Object.fromEntries(Object.entries(best).reverse());
ok(
  JSON.stringify(scoreAnswers(shuffledAnswers)) === JSON.stringify(bestResult),
  "kết quả tất định, không phụ thuộc thứ tự trả lời"
);

/* Đổi một câu sang phương án tệ nhất thì điểm tổng không được tăng. */
let monotonic = true;
const perScenario = [];
for (const s of SCENARIOS) {
  const mutated = { ...best, [s.id]: worst[s.id] };
  const result = scoreAnswers(mutated);
  if (result.overall > bestResult.overall) monotonic = false;
  perScenario.push({ id: s.id, drop: bestResult.overall - result.overall });
}
ok(monotonic, "hạ một câu xuống tệ nhất không làm điểm tổng tăng");

/* Mỗi tình huống phải thực sự ảnh hưởng tới điểm tổng — không có câu nào vô dụng. */
const inert = perScenario.filter((p) => p.drop <= 0).map((p) => p.id);
ok(inert.length === 0, "mọi tình huống đều ảnh hưởng tới điểm tổng", `không ảnh hưởng: ${inert.join(", ")}`);

/* ── 6. Ngưỡng và xếp loại ─────────────────────────────────────────────── */
eq(levelFor(BAND_HIGH), "high", "levelFor(70) = high");
eq(levelFor(BAND_HIGH - 1), "mid", "levelFor(69) = mid");
eq(levelFor(BAND_MID), "mid", "levelFor(45) = mid");
eq(levelFor(BAND_MID - 1), "low", "levelFor(44) = low");
eq(levelFor(0), "low", "levelFor(0) = low");
eq(levelFor(100), "high", "levelFor(100) = high");

for (const key of DIM_KEYS) {
  ok(bandFor(key, 90).label.length > 0, `bandFor("${key}", 90) có nhãn`);
  ok(bandFor(key, 10).meaning.length > 0, `bandFor("${key}", 10) có giải thích`);
}
// Nhãn band viết riêng cho từng chiều (ví dụ "Rõ ràng và nhạy" cho nhận biết)
// nên chỉ kiểm ba band của CÙNG một chiều là khác nhau, không kiểm giữa các chiều.
for (const key of DIM_KEYS) {
  const labels = ["high", "mid", "low"].map((band) => bandFor(key, { high: 90, mid: 55, low: 10 }[band]).label);
  eq(new Set(labels).size, 3, `band của ${key} có ba nhãn khác nhau`);
}

/* ── 7. Trạng thái chưa đủ dữ liệu ─────────────────────────────────────── */
const empty = scoreAnswers({});
eq(empty.answered, 0, "bộ đáp án rỗng: answered = 0");
eq(empty.complete, false, "bộ đáp án rỗng: complete = false");
ok(Number.isInteger(empty.overall), "bộ đáp án rỗng vẫn trả điểm tổng là số nguyên");

const partial = scoreAnswers({ [SCENARIOS[0].id]: SCENARIOS[0].choices[0].id });
eq(partial.answered, 1, "trả lời 1 câu: answered = 1");
eq(partial.complete, false, "trả lời 1 câu: complete = false");

/* Đáp án của tình huống khác không được tính vào câu này. */
const foreign = scoreAnswers({ [SCENARIOS[0].id]: SCENARIOS[1].choices[0].id });
eq(foreign.answered, 0, "mã phương án không thuộc tình huống bị bỏ qua");

/* ── 8. Mọi chiều đều có tên, tagline và bài tập ───────────────────────── */
for (const dim of EQ_DIMENSIONS) {
  const at = `[${dim.key}]`;
  ok(typeof dim.code === "string" && dim.code.length > 0, `${at} có mã hiển thị`);
  ok(typeof dim.name === "string" && dim.name.trim().length > 0, `${at} có tên`);
  ok(VIETNAMESE.test(dim.name), `${at} tên là tiếng Việt có dấu`);
  ok(typeof dim.tagline === "string" && dim.tagline.trim().length > 0, `${at} có tagline`);
  ok(typeof dim.question === "string" && dim.question.trim().length > 0, `${at} có câu hỏi trắc nghiệm`);
  ok(Array.isArray(dim.includes) && dim.includes.length >= 3, `${at} có danh sách bao gồm`);
  ok(Array.isArray(dim.exercises) && dim.exercises.length >= 5, `${at} có ít nhất 5 bài tập`, `nhận ${dim.exercises?.length}`);
  for (const ex of dim.exercises || []) {
    ok(typeof ex.name === "string" && ex.name.trim().length > 0, `${at} bài tập có tên`);
    ok(typeof ex.how === "string" && ex.how.trim().length > 0, `${at} bài tập "${ex.name}" có cách làm`);
    ok(typeof ex.why === "string" && ex.why.trim().length > 0, `${at} bài tập "${ex.name}" có lý do`);
  }
  for (const band of ["high", "mid", "low"]) {
    const b = dim.bands?.[band];
    ok(b && typeof b.label === "string" && b.label.trim().length > 0, `${at} band ${band} có nhãn`);
    ok(b && typeof b.meaning === "string" && b.meaning.trim().length > 0, `${at} band ${band} có giải thích`);
    ok(Array.isArray(b?.examples) && b.examples.length >= 2, `${at} band ${band} có ví dụ`);
  }
  eq(EQ_BY_KEY[dim.key], dim, `EQ_BY_KEY["${dim.key}"] trỏ đúng object`);
}

/* ── Kết luận ──────────────────────────────────────────────────────────── */
if (failures.length) {
  console.error(`\n✗ ${failures.length} lỗi (${passed} phép kiểm đạt):`);
  for (const failure of failures) console.error(`  · ${failure}`);
  process.exit(1);
}
console.log(`\n✓ DỮ LIỆU + CHẤM ĐIỂM EQ: ${passed} phép kiểm đạt, 0 lỗi.`);