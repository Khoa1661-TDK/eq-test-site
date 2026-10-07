/* landing.js — trang chủ của website LUYỆN Trí tuệ Cảm xúc (EQ) cho học sinh.
   Bảy khối: mở đầu · xem trước một tình huống · vòng luyện · sáu kỹ năng · cách tính điểm · ba chế độ · giới hạn.
   Sản phẩm là một trainer theo vòng: đánh giá → hiểu → luyện → đánh giá lại → tiến bộ.
   Không phải bài kiểm tra dán nhãn con người: chỉ có 6 kỹ năng luyện được và những tình huống thực tế. */

import { el, frame } from "../core/dom.js"
import { EQ_DIMENSIONS } from "../data/eqDimensions.js"
import { SCENARIO_BY_ID } from "../data/scenarios.js"
import { TOTAL_SCENARIOS } from "../core/eqScoring.js"
import { meterCells, scenarioPeek } from "../ui/parts.js"

/** Nút chính: bàn phím và chuột đều đi qua navigate() của app shell. */
function primaryButton(label, href, navigate) {
  const btn = el("button", { class: "btn btn--accent btn--lg", attrs: { type: "button" } })
  btn.append(el("span", { class: "pxf-in", text: label }))
  btn.addEventListener("click", () => navigate(href))
  return btn
}

/** Liên kết phụ: <a href> thật để mở tab mới / chia sẻ được, nhưng vẫn đi qua navigate(). */
function ghostLink(label, href, navigate) {
  const link = el("a", { class: "btn btn--ghost", href })
  link.append(el("span", { class: "pxf-in", text: label }))
  link.addEventListener("click", (event) => {
    event.preventDefault()
    navigate(href)
  })
  return link
}

/** Thẻ số liệu: một con số, một nhãn, một thang đo pixel. */
function factCard(value, label, { on = value, max = value || 1 } = {}) {
  return frame(
    el(
      "div",
      { class: "facts__in" },
      el("div", { class: "facts__num", text: String(value) }),
      el("div", { class: "facts__label", text: label }),
      meterCells(on, max, { cells: 12, cls: "facts__meter" }),
    ),
    { size: "sm" },
  )
}

function ledgerItem(key, value) {
  return el(
    "div",
    { class: "ledger__item" },
    el("div", { class: "ledger__k", text: key }),
    el("div", { class: "ledger__v", text: value }),
  )
}

export function renderLanding(mount, { navigate }) {
  const skillNames = EQ_DIMENSIONS.map((dim) => dim.name.toLowerCase()).join(" · ")

  const assessButton = primaryButton("Bắt đầu đánh giá", "/assessment", navigate)
  const practiceGhost = ghostLink("Luyện EQ", "/practice", navigate)

  // 1 — MỞ ĐẦU ------------------------------------------------------------
  const hero = el("section", { class: "hero" })
  hero.append(
    el(
      "div",
      { class: "shell hero__grid" },
      el(
        "div",
        {},
        frame(el("span", { text: "LUYỆN EQ CHO HỌC SINH" }), {
          size: "sm",
          cls: "chip chip--olive hero__eyebrow",
        }),
        el(
          "h1",
          { class: "hero__title" },
          "Hiểu cảm xúc.",
          el("span", { class: "l2", text: "Chọn phản ứng tốt hơn." }),
        ),
        el(
          "p",
          { class: "hero__tag" },
          el("b", { text: "Đánh giá để biết mình đang ở đâu, luyện để lần sau phản ứng tốt hơn." }),
        ),
        el("p", {
          class: "prose hero__desc",
          text:
            "Trả lời 20 tình huống của đời học sinh, xem kỹ năng nào còn yếu, luyện đúng chỗ đó, rồi đánh giá lại bằng đề khác để thấy mình tiến bộ.",
        }),
        el("div", { class: "hero__cta" }, assessButton, practiceGhost),
        el("p", {
          class: "hero__meta",
          text: `${TOTAL_SCENARIOS} tình huống mỗi lần · 6 kỹ năng · 10–15 phút · có cảnh động`,
        }),
      ),
      el(
        "div",
        { class: "facts", attrs: { "aria-label": "Thông số của bài đánh giá EQ" } },
        factCard(
          TOTAL_SCENARIOS,
          "tình huống mỗi lần đánh giá: làm bài nhóm, điểm kiểm tra, bạn bè, gia đình, áp lực thi cử",
        ),
        factCard(EQ_DIMENSIONS.length, `kỹ năng cảm xúc: ${skillNames}`),
        factCard(2, "hai đề song song, A và B: đánh giá lại thì làm đề còn lại"),
        factCard(0, "nhãn dán lên bạn: chỉ có kỹ năng và tình huống", {
          on: 0,
          max: TOTAL_SCENARIOS,
        }),
        el("p", {
          class: "facts__note",
          text:
            "Các tình huống lấy từ đời sống học sinh. Điểm số cho biết cách phản ứng của bạn hiệu quả tới đâu, chứ không phán xét con người bạn.",
        }),
      ),
    ),
  )

  // 2 — XEM TRƯỚC MỘT TÌNH HUỐNG -----------------------------------------
  const preview = el("section", { class: "band band--soft" })
  preview.append(
    el(
      "div",
      { class: "shell" },
      el("h2", { class: "band__title", text: "Một tình huống trông ra sao" }),
      el("p", {
        class: "band__lead",
        text:
          "Ở đây không có danh sách câu để bạn chấm từ 1 đến 5. Bạn bước vào một tình huống ngắn ở trường hay ở nhà, đọc lời thoại, rồi chọn cách trả lời ngay trong khung hội thoại. Có tình huống là cảnh động pixel, nơi các nhân vật tự diễn lại chuyện cho bạn xem.",
      }),
      scenarioPeek(SCENARIO_BY_ID.ER_01),
      el("p", {
        class: "prose muted",
        style: { marginTop: "var(--gap-4)" },
        text:
          "Cả bốn phương án đều là những cách người ta hay làm thật. Không có phương án nào “tốt” sẵn, chúng chỉ khác nhau ở hệ quả.",
      }),
    ),
  )

  // 3 — VÒNG LUYỆN ---------------------------------------------------------
  const loop = el("section", { class: "band" })
  loop.append(
    el(
      "div",
      { class: "shell" },
      el("h2", { class: "band__title", text: "Vòng luyện" }),
      el("p", {
        class: "band__lead",
        text:
          "Cả trang xoay quanh một vòng năm bước. Bạn có thể lặp lại vòng này bao nhiêu lần cũng được.",
      }),
      el(
        "div",
        { class: "ledger" },
        ledgerItem(
          "Đánh giá",
          `Trả lời ${TOTAL_SCENARIOS} tình huống, có chữ và có cảnh động, theo cách bạn thật sự sẽ làm. Điểm không hiện trong lúc làm, nên bạn không bị cuốn vào việc đoán đáp án.`,
        ),
        ledgerItem(
          "Hiểu",
          "Kết quả chỉ ra kỹ năng mạnh và kỹ năng cần luyện, mỗi cái kèm đúng tình huống và lựa chọn của bạn. Cách phản ứng bạn hay lặp lại được gọi tên, kèm một cách thay thế cụ thể và hai bài tập.",
        ),
        ledgerItem(
          "Luyện",
          "Làm các tình huống luyện tập theo từng kỹ năng, có cả cảnh động. Không tính điểm: mỗi lựa chọn là một lượt luyện, và được đếm để so sánh ở lần sau.",
        ),
        ledgerItem(
          "Đánh giá lại",
          "Làm đề còn lại: lần trước đề A thì lần này đề B, để đo kỹ năng chứ không đo trí nhớ. Kết quả cho thấy từng kỹ năng trước → sau.",
        ),
        ledgerItem(
          "Tiến bộ",
          "Chỉ ghi “Tiến bộ”, “Ổn định” hay “Giảm” khi điểm thay đổi từ 10 trở lên. Mọi số liệu được lưu trong trình duyệt này, nên lần sau vào lại là so sánh được ngay.",
        ),
      ),
    ),
  )

  // 4 — SÁU KỸ NĂNG --------------------------------------------------------
  const skills = el("div", { class: "skills" })
  for (const dim of EQ_DIMENSIONS) {
    skills.append(
      frame(
        el(
          "div",
          { class: "skill__in" },
          el(
            "div",
            { class: "skill__top" },
            el("span", { class: "skill__code", text: dim.code }),
            el("span", { class: "skill__name", text: dim.name }),
          ),
          el("p", { class: "skill__tagline", text: dim.tagline }),
          el("p", { class: "prose muted", style: { fontSize: "14px" }, text: dim.question }),
        ),
        { size: "sm" },
      ),
    )
  }
  const skillsBand = el("section", { class: "band band--soft" })
  skillsBand.append(
    el(
      "div",
      { class: "shell" },
      el("h2", { class: "band__title", text: "Sáu kỹ năng" }),
      el("p", {
        class: "band__lead",
        text:
          "Mỗi tình huống đo một kỹ năng chính và một hoặc hai kỹ năng phụ. Không ai sinh ra đã có sẵn kỹ năng nào: cả sáu đều luyện được, và cả sáu đều đang ở một mức nào đó trong bạn.",
      }),
      skills,
    ),
  )

  // 5 — CÁCH TÍNH ĐIỂM ----------------------------------------------------
  const method = el("section", { class: "band" })
  method.append(
    el(
      "div",
      { class: "shell" },
      el("h2", { class: "band__title", text: "Cách tính điểm" }),
      el("p", {
        class: "band__lead",
        text:
          "Điểm được tính từ những lựa chọn bạn thật sự đưa ra trong từng tình huống, không dựa vào một đáp án “đúng” duy nhất.",
      }),
      el(
        "div",
        { class: "ledger" },
        ledgerItem(
          "Mỗi tình huống đo gì",
          "Mỗi tình huống đo một kỹ năng chính với trọng số 1 và một hoặc hai kỹ năng phụ với trọng số 0,5. Mỗi phương án được 0–3 điểm cho từng kỹ năng được đo.",
        ),
        ledgerItem(
          "Điểm tối đa",
          "Điểm của một kỹ năng = điểm bạn đạt ÷ điểm tối đa có thể đạt ở đúng những tình huống đó, nhân 100. Chọn phương án mạnh nhất ở mọi tình huống thì được đúng 100.",
        ),
        ledgerItem(
          "Cần đủ tình huống",
          "Một kỹ năng phải có ít nhất 3 tình huống chính đã trả lời thì mới có điểm, thiếu thì hiện “chưa đủ dữ liệu”. Con số tổng chỉ là trung bình của sáu kỹ năng, không kèm xếp loại nào.",
        ),
      ),
      el(
        "div",
        { class: "formula" },
        "Ví dụ: Tự nhận thức 72 · Điều chỉnh 66 · Đồng cảm 58 · Nhận biết xã hội 70 · Giao tiếp 56 · Quản lý quan hệ 62 → trung bình 64/100",
        el("br"),
        "Kỹ năng thấp nhất không bị gắn nhãn gì. Nó chỉ nhận thêm bài tập và tình huống luyện, rồi bạn đánh giá lại để xem nó có nhích lên không.",
      ),
    ),
  )

  // 6 — BA CHẾ ĐỘ ----------------------------------------------------------
  const modes = el("section", { class: "band band--soft" })
  modes.append(
    el(
      "div",
      { class: "shell" },
      el("h2", { class: "band__title", text: "Ba chế độ" }),
      el("p", {
        class: "band__lead",
        text:
          "Cùng một kho tình huống, có ba cách dùng: nhìn lại mình, luyện thêm, và kiểm tra lại sau.",
      }),
      el(
        "div",
        { class: "ledger", style: { gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" } },
        el(
          "div",
          { class: "ledger__item" },
          el("div", { class: "ledger__k", text: "Đánh giá" }),
          el("div", {
            class: "ledger__v",
            text:
              `Trả lời ${TOTAL_SCENARIOS} tình huống, điểm không hiện trong lúc làm. Kết quả cuối bài chỉ ra kỹ năng mạnh, kỹ năng cần luyện, kèm các tình huống làm bằng chứng và bài tập.`,
          }),
          el(
            "p",
            { class: "hero__cta", style: { marginTop: "var(--gap-4)", marginBottom: "0" } },
            primaryButton("Bắt đầu đánh giá", "/assessment", navigate),
          ),
        ),
        el(
          "div",
          { class: "ledger__item" },
          el("div", { class: "ledger__k", text: "Luyện tập" }),
          el("div", {
            class: "ledger__v",
            text:
              "Tình huống theo từng kỹ năng, không tính điểm, chỉ đếm lượt luyện. Sau mỗi lựa chọn, bạn thấy cách mình vừa chọn, điều thường xảy ra sau đó và một cách mạnh hơn.",
          }),
          el(
            "p",
            { class: "hero__cta", style: { marginTop: "var(--gap-4)", marginBottom: "0" } },
            ghostLink("Luyện EQ", "/practice", navigate),
          ),
        ),
        el(
          "div",
          { class: "ledger__item" },
          el("div", { class: "ledger__k", text: "Đánh giá lại" }),
          el("div", {
            class: "ledger__v",
            text:
              "Làm đề còn lại (lần trước đề A thì lần này đề B) để đo kỹ năng chứ không đo trí nhớ. Kết quả so sánh trước → sau từng kỹ năng, kèm số lượt luyện bạn đã làm ở giữa.",
          }),
          el(
            "p",
            { class: "hero__cta", style: { marginTop: "var(--gap-4)", marginBottom: "0" } },
            ghostLink("Luyện bằng cảnh động", "/scenes", navigate),
          ),
        ),
      ),
    ),
  )

  // 7 — GIỚI HẠN CỦA CÔNG CỤ ---------------------------------------------
  const honesty = el("section", { class: "band" })
  honesty.append(
    el(
      "div",
      { class: "shell" },
      el("h2", { class: "band__title", text: "Những điều trang này không làm" }),
      el("p", {
        class: "band__lead",
        text:
          "Đây là công cụ học tập và tự rèn luyện, không phải thang đo tâm lý đã được kiểm định và không dùng để chẩn đoán. Kết quả chỉ nói về cách bạn phản ứng, không phán xét con người bạn.",
      }),
      el("p", {
        class: "prose",
        text:
          "Tiến độ của bạn chỉ được lưu trong trình duyệt này, để lần sau vào lại là so sánh trước → sau được. Không có tài khoản. Máy chủ chỉ nhận một con số đếm ẩn danh mỗi khi có người làm xong bài, không kèm tình huống hay phương án bạn chọn. Trang kết quả có nút xóa sạch dữ liệu đã lưu.",
      }),
    ),
  )

  mount.append(hero, preview, loop, skillsBand, method, modes, honesty)

  return { destroy: () => mount.replaceChildren() }
}
