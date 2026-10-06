/* eqResult.js — trang HỒ SƠ SÁU KỸ NĂNG: so sánh với lần trước, điểm mạnh và kỹ năng
   cần luyện (mỗi kết luận kèm tình huống bạn đã chọn), mẫu chiến lược hay lặp lại,
   bài tập và lối vào luyện tập. Toàn bộ số liệu đến từ core/eqScoring.js.
   Trang mô tả việc bạn LÀM trong từng tình huống, không mô tả bạn là ai. */

import { el, frame } from "../core/dom.js"
import { EQ_BY_KEY } from "../data/eqDimensions.js"
import {
  CHANGE_THRESHOLD,
  attempts,
  clearAllData,
  compareResults,
  nextForm,
  practiceQueue,
  practiceSince,
  scoreAttempt,
} from "../core/eqScoring.js"
import { dimRow, exerciseList } from "../ui/parts.js"

const CHANGE_LABEL = { improved: "Tiến bộ", steady: "Ổn định", dipped: "Giảm" }
const CHANGE_CHIP = { improved: "chip--olive", steady: "chip--ink", dipped: "chip--amber" }

function dateText(ms) {
  if (!ms) return ""
  try {
    return new Date(ms).toLocaleDateString("vi-VN", { day: "numeric", month: "numeric", year: "numeric" })
  } catch {
    return ""
  }
}

/** Một câu bằng chứng: tình huống, lựa chọn của bạn, và cách mạnh hơn nếu có. */
function moment(m, { showStronger = true } = {}) {
  const stronger = showStronger && m.strongest && m.strongest.id !== m.choice.id
  return el(
    "li",
    { class: "evidence__item" },
    el("p", { class: "evidence__title", text: `«${m.item.title}»` }),
    el("p", { class: "evidence__line" }, el("strong", { text: "Bạn chọn: " }), m.choice.text),
    stronger ? el("p", { class: "evidence__line" }, el("strong", { text: "Cách mạnh hơn: " }), m.strongest.text) : null,
    stronger && m.item.practice?.principle ? el("p", { class: "evidence__why", text: m.item.practice.principle }) : null,
  )
}

export function renderEqResult(mount, { navigate }) {
  const all = attempts()
  const current = all.at(-1) ?? null
  const previous = all.at(-2) ?? null
  const result = scoreAttempt(current)
  const before = scoreAttempt(previous)
  const view = el("div", { class: "result" })

  const go = (href) => (event) => {
    event.preventDefault()
    navigate(href)
  }
  const link = (href, text, cls = "btn btn--ghost") => {
    const a = el("a", { class: cls, href }, el("span", { class: "pxf-in", text }))
    a.addEventListener("click", go(href))
    return a
  }

  const crumb = el("div", { class: "crumbs" })
  const home = el("a", { href: "/", text: "Trang chủ" })
  home.addEventListener("click", go("/"))
  const again = el("a", { href: "/assessment", text: "Đánh giá lại" })
  again.addEventListener("click", go("/assessment"))
  crumb.append(home, el("span", { class: "crumbs__sep", text: "·" }), again)
  view.append(crumb)

  if (!result || !result.answered) {
    view.append(
      frame(
        el(
          "div",
          { class: "empty" },
          el("h1", { class: "band__title", text: "Chưa có hồ sơ kỹ năng" }),
          el("p", { class: "prose", text: "Bạn chưa hoàn thành lần đánh giá nào trên máy này, nên chưa có gì để tổng hợp." }),
          el("p", { class: "actions" }, link("/assessment", "Bắt đầu đánh giá", "btn btn--accent btn--lg")),
        ),
        { size: "lg", cls: "result__empty" },
      ),
    )
    mount.append(view)
    return { destroy: () => mount.replaceChildren() }
  }

  const byKey = Object.fromEntries(result.dimensions.map((d) => [d.key, d]))
  const patternKeys = result.patterns.filter((p) => !p.effective).map((p) => p.key)

  /* --------------------------------------------------------------- đầu trang */
  view.append(
    el(
      "section",
      { class: "verdict" },
      el(
        "div",
        { class: "verdict__body" },
        el("p", { class: "hero__eyebrow", text: `HỒ SƠ SÁU KỸ NĂNG · LẦN ${all.length}` }),
        el("h1", { class: "verdict__name", text: "Bạn đang xử lý cảm xúc và tình huống xã hội tới đâu" }),
        el("p", {
          class: "verdict__quote",
          text: "Mỗi con số dưới đây đến từ các lựa chọn của bạn trong bài vừa làm. Nó cho biết cách phản ứng nào đang hiệu quả, chỗ nào còn hụt, và nên luyện gì tiếp.",
        }),
        el("p", {
          class: "verdict__meta",
          text: `Đề ${current.form} · ${result.answered}/${result.total} tình huống · ${dateText(current.finishedAt)}`,
        }),
      ),
      el(
        "div",
        { class: "verdict__side" },
        el("div", { class: "verdict__score", text: String(result.overall) }),
        el("div", { class: "verdict__outof", text: "trung bình sáu kỹ năng /100" }),
      ),
    ),
  )

  /* ---------------------------------------------------------- so với lần trước */
  if (before) {
    const diff = compareResults(before, result)
    const growthKeys = new Set(result.growth.map((d) => d.key))
    const reps = practiceSince(previous.finishedAt || 0)
    diff.sort((a, b) => Number(growthKeys.has(b.key)) - Number(growthKeys.has(a.key)))
    const rows = diff.map((d) => {
      const dipped = d.change === "dipped" ? byKey[d.key]?.evidence.missed[0] : null
      return el(
        "li",
        { class: "change" },
        el(
          "div",
          { class: "change__head" },
          el("span", { class: "change__name", text: d.name }),
          el("span", { class: "change__nums", text: `${d.before ?? "—"} → ${d.after ?? "—"}` }),
          d.change ? el("span", { class: `chip ${CHANGE_CHIP[d.change]}`, text: `${CHANGE_LABEL[d.change]}${d.delta ? ` ${d.delta > 0 ? "+" : ""}${d.delta}` : ""}` }) : null,
        ),
        el("p", { class: "change__reps", text: `${reps[d.key].practised} lượt luyện kỹ năng này kể từ lần trước.` }),
        dipped ? el("ul", { class: "evidence" }, moment(dipped)) : null,
        dipped ? el("p", { class: "change__reps" }, link(`/practice?skill=${d.key}`, `Luyện ${d.name.toLowerCase()}`)) : null,
      )
    })
    view.append(
      el(
        "section",
        { class: "band band--soft result__block" },
        el("h2", { class: "band__title", text: "So với lần trước" }),
        el("p", {
          class: "band__lead",
          text: `Lần trước bạn làm đề ${previous.form} (${dateText(previous.finishedAt)}). Chỉ gọi là tiến bộ hay giảm khi lệch từ ${CHANGE_THRESHOLD} điểm trở lên; ít hơn thế là dao động bình thường.`,
        }),
        el("ul", { class: "changes" }, rows),
      ),
    )
  }

  /* ------------------------------------------------------ điểm mạnh / cần luyện */
  const strengthTitle = result.strengthMode === "clear" ? "Điểm mạnh lúc này" : "Kỹ năng bạn dùng vững nhất lúc này"
  const strengthCol = el(
    "div",
    { class: "pair__col" },
    el("h3", { class: "pair__title", text: strengthTitle }),
    ...result.strengths.map((d) =>
      el(
        "div",
        { class: "pair__item" },
        el("p", { class: "pair__name", text: `${d.name} · ${d.score}/100` }),
        el("p", { class: "prose", text: d.band?.meaning ?? "" }),
        d.evidence.nailed.length ? el("ul", { class: "evidence" }, d.evidence.nailed.slice(0, 1).map((m) => moment(m, { showStronger: false }))) : null,
      ),
    ),
  )

  const growthCol = el(
    "div",
    { class: "pair__col pair__col--focus" },
    el("h3", { class: "pair__title", text: "Nên luyện tiếp" }),
    ...result.growth.map((d) => {
      const detail = EQ_BY_KEY[d.key]
      const count = practiceQueue(d.key, { patterns: patternKeys }).length
      return el(
        "div",
        { class: "pair__item" },
        el("p", { class: "pair__name", text: `${d.name} · ${d.score}/100` }),
        el("p", { class: "prose", text: d.band?.meaning ?? "" }),
        d.evidence.missed.length ? el("ul", { class: "evidence" }, d.evidence.missed.map((m) => moment(m))) : null,
        el("div", { class: "dim__exlist-head", text: "Hai bài tập bắt đầu ngay tuần này" }),
        exerciseList(detail, { limit: 2 }),
        el("p", { class: "pair__cta" }, link(`/practice?skill=${d.key}`, `Luyện ${count} tình huống về ${d.name.toLowerCase()}`, "btn btn--accent")),
      )
    }),
  )
  view.append(el("section", { class: "band result__block" }, el("div", { class: "pair" }, strengthCol, growthCol)))

  /* -------------------------------------------------------- mẫu chiến lược lặp */
  if (result.patterns.length) {
    view.append(
      el(
        "section",
        { class: "band band--soft result__block" },
        el("h2", { class: "band__title", text: "Cách phản ứng bạn hay lặp lại" }),
        el("p", { class: "band__lead", text: "Đây là thói quen trong lựa chọn, không phải con người bạn — và thói quen thì đổi được." }),
        ...result.patterns.map((p) =>
          el(
            "div",
            { class: "pattern" },
            el("p", { class: "pair__name", text: p.label }),
            el("p", { class: "prose muted", text: `Bạn chọn cách này ở ${p.picks}/${p.available} tình huống có lựa chọn kiểu đó.` }),
            el("p", { class: "prose" }, el("strong", { text: p.effective ? "Giữ lại: " : "Lần tới thử: " }), p.swap),
            el("p", { class: "prose" }, el("strong", { text: "Dấu hiệu nhận ra: " }), p.cue),
            p.moments[0] ? el("ul", { class: "evidence" }, moment(p.moments[0], { showStronger: !p.effective })) : null,
          ),
        ),
      ),
    )
  }

  /* ------------------------------------------------------------ sáu kỹ năng */
  const dims = el("section", { class: "band band--soft result__block" })
  dims.append(
    el("h2", { class: "band__title", text: "Sáu kỹ năng" }),
    el("p", { class: "band__lead", text: "Bấm vào từng kỹ năng để xem điểm này nghĩa là gì, kèm ví dụ và bài tập luyện." }),
  )
  const dimList = el("div", { class: "dims" })
  for (const dim of result.dimensions) {
    const node = dimRow(dim, { open: dim.key === result.weakest?.key, practiceHref: `/practice?skill=${dim.key}` })
    node.querySelector(".dim__body").append(el("div", { class: "dim__exlist-head", text: "Bài tập luyện" }), exerciseList(EQ_BY_KEY[dim.key]))
    node.querySelector(".dim__link")?.addEventListener("click", go(`/practice?skill=${dim.key}`))
    dimList.append(node)
  }
  dims.append(dimList)
  view.append(dims)

  /* ------------------------------------------------------------ cách chấm */
  const ledger = (k, v) => el("div", { class: "ledger__item" }, el("span", { class: "ledger__k", text: k }), el("span", { class: "ledger__v", text: v }))
  view.append(
    el(
      "section",
      { class: "band band--soft result__block" },
      el("h2", { class: "band__title", text: "Điểm được tính thế nào?" }),
      el(
        "div",
        { class: "ledger method" },
        ledger("Từng tình huống", "Mỗi tình huống đo một kỹ năng chính (trọng số 1) và một đến hai kỹ năng phụ (trọng số 0,5). Mỗi lựa chọn có 0–3 điểm hiệu quả cho từng kỹ năng đó."),
        ledger("Từng kỹ năng", "Điểm bạn đạt chia cho điểm của lựa chọn mạnh nhất ở cùng các tình huống, quy về thang 100. Chọn cách mạnh nhất ở mọi tình huống thì được đúng 100."),
        ledger("Chưa đủ dữ liệu", "Một kỹ năng cần ít nhất 3 tình huống chính đã trả lời mới có điểm, để một lần bấm không quyết định cả kết quả."),
        ledger("Số trung bình", "Trung bình cộng sáu kỹ năng, chỉ để theo dõi tiến độ. Hồ sơ thật là sáu kỹ năng và những tình huống đứng sau chúng."),
        ledger("Giới hạn", "Đây là công cụ học tập, không phải thang đo tâm lý đã được kiểm định và không dùng để chẩn đoán. Điểm đổi theo ngày, theo tâm trạng và theo luyện tập — điều đó là bình thường."),
      ),
    ),
  )

  /* -------------------------------------------------------------- hành động */
  const wipe = el("button", { class: "btn btn--ghost", attrs: { type: "button" } }, el("span", { class: "pxf-in", text: "Xoá dữ liệu trên máy này" }))
  wipe.addEventListener("click", () => {
    if (!window.confirm("Xoá mọi lần đánh giá và lượt luyện đã lưu trên trình duyệt này? Không thể hoàn tác.")) return
    clearAllData()
    navigate("/")
  })
  view.append(
    el(
      "section",
      { class: "actions" },
      link("/assessment", `Đánh giá lại (đề ${nextForm()})`, "btn btn--accent"),
      link("/practice", "Luyện tập"),
      link("/", "Về trang chủ"),
      wipe,
      el("p", {
        class: "actions__note",
        text: "Kết quả chỉ được lưu trên trình duyệt này để bạn so sánh lần sau — không có tài khoản, không gửi câu trả lời lên máy chủ.",
      }),
    ),
  )

  mount.append(view)
  document.title = "Hồ sơ sáu kỹ năng EQ"

  return {
    destroy: () => mount.replaceChildren(),
  }
}
