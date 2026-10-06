/* eqResult.js — trang HỒ SƠ EQ: điểm tổng, năm kỹ năng, mạnh nhất, cần luyện tiếp,
   bài tập cụ thể và lối vào chế độ luyện tập. Toàn bộ số liệu đến từ core/eqScoring.js. */

import { el, frame } from "../core/dom.js"
import { EQ_BY_KEY } from "../data/eqDimensions.js"
import { SCENARIOS_BY_DOMAIN } from "../data/scenarios.js"
import { loadAssessment, scoreAnswers } from "../core/eqScoring.js"
import { dimRow, exerciseList, levelChip } from "../ui/parts.js"

const OVERALL_READ = {
  high: "Bạn nhận ra cảm xúc khá sớm và thường chọn được cách phản ứng mà sau đó không phải hối. Kỹ năng này vẫn đổi theo tình huống: khi mệt, khi bị dồn, hoặc khi người đối diện là người bạn quan tâm nhất, nó sẽ xuống.",
  mid: "Bạn thấy được cảm xúc của mình và của người khác, nhưng thường nhận ra hơi muộn hoặc xử lý vội. Phần lớn mọi người ở đây — đây là mức bình thường, và là mức tiến bộ nhanh nhất nếu luyện đều.",
  low: "Lúc này cảm xúc thường đi trước bạn: bạn biết mình đã sai ở đâu sau khi chuyện đã xong. Điều này không nói lên bản tính của bạn, chỉ nói rằng những cách phản ứng khác chưa được luyện đủ.",
}

export function renderEqResult(mount, { navigate }) {
  const { answers } = loadAssessment()
  const result = scoreAnswers(answers)
  const view = el("div", { class: "result" })

  const crumb = el("div", { class: "crumbs" })
  const home = el("a", { href: "/", text: "Trang chủ" })
  home.addEventListener("click", (event) => {
    event.preventDefault()
    navigate("/")
  })
  const again = el("a", { href: "/assessment", text: "Làm lại bài đánh giá" })
  again.addEventListener("click", (event) => {
    event.preventDefault()
    navigate("/assessment")
  })
  crumb.append(home, el("span", { class: "crumbs__sep", text: "·" }), again)
  view.append(crumb)

  if (!result.answered) {
    view.append(
      frame(
        el(
          "div",
          { class: "empty" },
          el("h1", { class: "band__title", text: "Chưa có hồ sơ EQ" }),
          el("p", { class: "prose", text: "Bạn chưa trả lời tình huống nào, nên chưa có gì để tổng hợp." }),
          el(
            "p",
            { class: "actions" },
            el("a", { class: "btn btn--accent btn--lg", href: "/assessment" }, el("span", { class: "pxf-in", text: "Bắt đầu đánh giá EQ" })),
          ),
        ),
        { size: "lg", cls: "result__empty" },
      ),
    )
    mount.append(view)
    return { destroy: () => mount.replaceChildren() }
  }

  const weakest = result.weakest
  const strongest = result.strongest
  const weakestDim = weakest ? EQ_BY_KEY[weakest.key] : null
  const strongestDim = strongest ? EQ_BY_KEY[strongest.key] : null

  /* --------------------------------------------------------------- tổng */
  view.append(
    el(
      "section",
      { class: "verdict" },
      el(
        "div",
        { class: "verdict__body" },
        el("p", { class: "hero__eyebrow", text: "HỒ SƠ EQ" }),
        el("h1", { class: "verdict__name", text: `Điểm EQ tổng: ${result.overall}` }),
        el("p", { class: "verdict__quote", text: OVERALL_READ[result.overallLevel] }),
        el("p", { class: "verdict__meta", text: `Đã trả lời ${result.answered}/${result.total} tình huống.` }),
      ),
      el(
        "div",
        { class: "verdict__side" },
        el("div", { class: "verdict__score", text: String(result.overall) }),
        el("div", { class: "verdict__outof", text: "/100" }),
        levelChip({ level: result.overallLevel, band: { label: result.overallLevel === "high" ? "Vững" : result.overallLevel === "mid" ? "Đang lên" : "Cần luyện" } }),
      ),
    ),
  )

  /* ------------------------------------------------------- năm kỹ năng */
  const dims = el("section", { class: "band band--soft result__block" })
  dims.append(
    el("h2", { class: "band__title", text: "Năm kỹ năng" }),
    el("p", { class: "band__lead", text: "Bấm vào từng kỹ năng để xem điểm này nghĩa là gì, kèm ví dụ và bài tập luyện." }),
  )
  const dimList = el("div", { class: "dims" })
  for (const dim of result.dimensions) {
    const detail = EQ_BY_KEY[dim.key]
    const node = dimRow(dim, {
      open: dim.key === weakest?.key,
      practiceHref: `/practice?skill=${dim.key}`,
    })
    const body = node.querySelector(".dim__body")
    body.append(el("div", { class: "dim__exlist-head", text: "Bài tập luyện" }), exerciseList(detail))
    body.querySelector(".dim__link")?.addEventListener("click", (event) => {
      event.preventDefault()
      navigate(`/practice?skill=${dim.key}`)
    })
    dimList.append(node)
  }
  dims.append(dimList)
  view.append(dims)

  /* ------------------------------------------------------ mạnh / cần luyện */
  const pair = el("section", { class: "band result__block" })
  pair.append(
    el(
      "div",
      { class: "pair" },
      el(
        "div",
        { class: "pair__col" },
        el("h3", { class: "pair__title", text: "Mạnh nhất" }),
        el("p", { class: "pair__name", text: `${strongest.code} · ${strongest.name}` }),
        el("p", { class: "pair__score", text: `${strongest.score}/100` }),
        el("p", { class: "prose", text: strongest.band?.meaning ?? "" }),
        el("p", { class: "pair__example", text: strongest.band?.examples?.[0] ?? "" }),
      ),
      el(
        "div",
        { class: "pair__col pair__col--focus" },
        el("h3", { class: "pair__title", text: "Cần luyện tiếp" }),
        el("p", { class: "pair__name", text: `${weakest.code} · ${weakest.name}` }),
        el("p", { class: "pair__score", text: `${weakest.score}/100` }),
        el("p", { class: "prose", text: weakest.band?.meaning ?? "" }),
        el("p", { class: "pair__example", text: weakest.band?.examples?.[0] ?? "" }),
        el(
          "p",
          { class: "pair__cta" },
          el(
            "a",
            { class: "btn btn--accent", href: `/practice?skill=${weakest.key}` },
            el("span", { class: "pxf-in", text: `Luyện ${weakestDim.name.toLowerCase()}` }),
          ),
        ),
      ),
    ),
  )
  pair.querySelector(".pair__cta a")?.addEventListener("click", (event) => {
    event.preventDefault()
    navigate(`/practice?skill=${weakest.key}`)
  })
  view.append(pair)

  /* ---------------------------------------------------- khuyến nghị luyện */
  const recos = el("section", { class: "band band--soft result__block" })
  recos.append(
    el("h2", { class: "band__title", text: `Khuyến nghị cho bạn: ${weakestDim.name.toLowerCase()}` }),
    el("p", { class: "band__lead", text: weakestDim.tagline }),
    el("p", { class: "prose", text: weakestDim.question }),
    exerciseList(weakestDim, { limit: 3 }),
  )
  const practiceCount = SCENARIOS_BY_DOMAIN[weakest.key]?.length ?? 0
  recos.append(
    el(
      "div",
      { class: "result__actions" },
      el(
        "a",
        { class: "btn btn--accent btn--lg", href: `/practice?skill=${weakest.key}` },
        el("span", { class: "pxf-in", text: `Luyện ${practiceCount} tình huống về ${weakestDim.name.toLowerCase()}` }),
      ),
      el(
        "a",
        { class: "btn btn--ghost", href: "/practice" },
        el("span", { class: "pxf-in", text: "Xem tất cả kỹ năng" }),
      ),
    ),
  )
  recos.querySelectorAll(".result__actions a").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault()
      navigate(link.getAttribute("href"))
    })
  })
  view.append(recos)

  /* ------------------------------------------------------------ cách chấm */
  const method = el(
    "section",
    { class: "band band--soft result__block" },
    el("h2", { class: "band__title", text: "Điều này có nghĩa gì?" }),
    el(
      "div",
      { class: "ledger method" },
      el("div", { class: "ledger__item" }, el("span", { class: "ledger__k", text: "Cách tính" }), el("span", { class: "ledger__v", text: "Mỗi phương án mang điểm hiệu quả 0–3 cho từng kỹ năng mà tình huống đó đo. Điểm của một kỹ năng = điểm bạn đạt / điểm tối đa của chính kỹ năng đó." })),
      el("div", { class: "ledger__item" }, el("span", { class: "ledger__k", text: "Điểm tổng" }), el("span", { class: "ledger__v", text: "Tổng điểm đạt trên tổng điểm tối đa, quy về thang 100. Không có điểm tuyệt đối: nhiều tình huống không có một đáp án đúng duy nhất." })),
      el("div", { class: "ledger__item" }, el("span", { class: "ledger__k", text: "Cách chọn phương án" }), el("span", { class: "ledger__v", text: "Điểm hiệu quả dựa trên các chiến lược được xem là hữu ích trong tài liệu về điều chỉnh cảm xúc, đồng cảm và xử lý xung đột — không phải trên một thang đo đã kiểm định." })),
      el("div", { class: "ledger__item" }, el("span", { class: "ledger__k", text: "Giới hạn" }), el("span", { class: "ledger__v", text: "Đây là công cụ học tập, không phải chẩn đoán và không đo trí tuệ. Điểm số đổi theo ngày, theo tâm trạng và theo trải nghiệm sống — điều đó là bình thường." })),
    ),
  )
  view.append(method)

  const actions = el(
    "section",
    { class: "actions" },
    el("a", { class: "btn btn--accent", href: "/assessment" }, el("span", { class: "pxf-in", text: "Làm lại bài đánh giá" })),
    el("a", { class: "btn btn--ghost", href: "/" }, el("span", { class: "pxf-in", text: "Về trang chủ" })),
    el("p", { class: "actions__note", text: "Bài làm chỉ được lưu trong phiên làm việc này của trình duyệt — không có tài khoản, không lưu trên máy chủ." }),
  )
  actions.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault()
      navigate(link.getAttribute("href"))
    })
  })
  view.append(actions)

  mount.append(view)
  document.title = `Hồ sơ EQ — ${result.overall}/100`

  return {
    destroy: () => mount.replaceChildren(),
  }
}