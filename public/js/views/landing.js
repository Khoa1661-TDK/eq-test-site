/* landing.js — trang chủ của website đánh giá & luyện Trí tuệ Cảm xúc cho học sinh.
   Sáu khối: mở đầu · xem trước một tình huống · năm kỹ năng · cách tính điểm · hai chế độ · giới hạn.
   Không còn mô hình phân loại con người: chỉ có 5 kỹ năng cảm xúc và 28 tình huống. */

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

  const assessButton = primaryButton("Bắt đầu đánh giá EQ", "/assessment", navigate)
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
        frame(el("span", { text: "ĐÁNH GIÁ EQ CHO HỌC SINH" }), {
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
          el("b", { text: "Cảm xúc không quyết định bạn — cách bạn phản ứng mới là thứ luyện được." }),
        ),
        el("p", {
          class: "prose hero__desc",
          text:
            "Khám phá cách bạn nhận biết, hiểu và xử lý cảm xúc qua những tình huống thực tế của đời sống học sinh.",
        }),
        el("div", { class: "hero__cta" }, assessButton, practiceGhost),
        el("p", {
          class: "hero__meta",
          text: `${TOTAL_SCENARIOS} tình huống · ${EQ_DIMENSIONS.length} kỹ năng · 8–12 phút · không có một đáp án đúng duy nhất cho mỗi tình huống`,
        }),
      ),
      el(
        "div",
        { class: "facts", attrs: { "aria-label": "Thông số của bài đánh giá EQ" } },
        factCard(
          TOTAL_SCENARIOS,
          "tình huống thật: bài nhóm, điểm kiểm tra, bạn bè, gia đình, áp lực thi cử",
        ),
        factCard(EQ_DIMENSIONS.length, `kỹ năng cảm xúc: ${skillNames}`),
        factCard(TOTAL_SCENARIOS * 4, `cách phản ứng để chọn (${TOTAL_SCENARIOS} tình huống × 4)`),
        factCard(0, "đáp án đúng duy nhất — nhiều cách đều có lý, chỉ khác nhau ở hệ quả", {
          on: 0,
          max: TOTAL_SCENARIOS,
        }),
        el("p", {
          class: "facts__note",
          text:
            "Tình huống lấy từ đời sống học sinh. Điểm số nói cách phản ứng hiệu quả tới đâu, không nói bạn là người thế nào.",
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
      el("h2", { class: "band__title", text: "Một tình huống trông như thế nào" }),
      el("p", {
        class: "band__lead",
        text:
          "Không có danh sách câu phát biểu để chấm điểm 1–5. Bạn bước vào một cảnh ngắn của đời sống học sinh, đọc lời thoại, rồi trả lời ngay trong khung hội thoại đó.",
      }),
      scenarioPeek(SCENARIO_BY_ID.ER_01),
      el("p", {
        class: "prose muted",
        style: { marginTop: "var(--gap-4)" },
        text:
          "Bốn phương án đều là những cách người thật hay làm. Không có phương án nào “tốt” sẵn — chúng chỉ khác nhau ở hệ quả.",
      }),
    ),
  )

  // 3 — NĂM KỸ NĂNG -------------------------------------------------------
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
  const skillsBand = el("section", { class: "band" })
  skillsBand.append(
    el(
      "div",
      { class: "shell" },
      el("h2", { class: "band__title", text: "Năm kỹ năng" }),
      el("p", {
        class: "band__lead",
        text:
          "Mỗi tình huống đo từ một đến ba kỹ năng. Không kỹ năng nào là “điểm mạnh bẩm sinh”: cả năm đều luyện được, và cả năm đều đang ở mức nào đó trong mỗi người.",
      }),
      skills,
    ),
  )

  // 4 — CÁCH TÍNH ĐIỂM ----------------------------------------------------
  const method = el("section", { class: "band band--soft" })
  method.append(
    el(
      "div",
      { class: "shell" },
      el("h2", { class: "band__title", text: "Cách tính điểm" }),
      el("p", {
        class: "band__lead",
        text:
          "Điểm được tính từ những lựa chọn bạn thật sự làm, không từ việc bạn có biết đáp án “đúng” hay không.",
      }),
      el(
        "div",
        { class: "ledger" },
        ledgerItem(
          "Mỗi phương án",
          "Mỗi phương án mang điểm hiệu quả 0–3 cho từng kỹ năng mà tình huống đo. Một tình huống đo 1–3 kỹ năng, và điểm tối đa luôn tính theo chính kỹ năng đó — nên chọn cách nào cũng được tính công bằng.",
        ),
        ledgerItem(
          "Điểm tổng",
          "Điểm tổng = tổng điểm đạt / tổng điểm tối đa, quy về thang 100. Không có điểm tuyệt đối, vì phần lớn tình huống không có một đáp án đúng duy nhất.",
        ),
        ledgerItem(
          "Căn cứ chấm",
          "Điểm dựa trên những chiến lược được xem là hữu ích trong tài liệu về điều chỉnh cảm xúc, đồng cảm và xử lý xung đột — không phải trên một thang đo đã kiểm định.",
        ),
      ),
      el(
        "div",
        { class: "formula" },
        `Ví dụ: Nhận biết 72 · Hiểu 64 · Điều chỉnh 51 · Đồng cảm 78 · Quan hệ 59 → điểm tổng 65/100`,
        el("br"),
        "Kỹ năng thấp nhất không bị dán nhãn, mà nhận bài tập cụ thể: bốn bước khi cơn tới, chờ 90 giây, tách cảm giác khỏi hành động.",
      ),
    ),
  )

  // 5 — HAI CHẾ ĐỘ --------------------------------------------------------
  const modes = el("section", { class: "band" })
  modes.append(
    el(
      "div",
      { class: "shell" },
      el("h2", { class: "band__title", text: "Hai chế độ" }),
      el("p", {
        class: "band__lead",
        text:
          "Cùng một kho tình huống, hai cách dùng: một để nhìn lại mình, một để thử cách khác đi.",
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
              "Không hiện điểm trong lúc làm — bạn chỉ thấy kết quả ở cuối. Nhờ vậy bạn trả lời theo cách mình thật sự làm, không phải theo cách mình nghĩ là nên làm.",
          }),
          el(
            "p",
            { class: "hero__cta", style: { marginTop: "var(--gap-4)", marginBottom: "0" } },
            primaryButton("Bắt đầu đánh giá EQ", "/assessment", navigate),
          ),
        ),
        el(
          "div",
          { class: "ledger__item" },
          el("div", { class: "ledger__k", text: "Luyện tập" }),
          el("div", {
            class: "ledger__v",
            text:
              "Chơi thêm tình huống, không có điểm và không có xếp hạng. Sau mỗi lựa chọn, bạn được giải thích chiến lược mình vừa dùng, hệ quả thường thấy, một cách mạnh hơn và một nguyên tắc để nhớ.",
          }),
          el(
            "p",
            { class: "hero__cta", style: { marginTop: "var(--gap-4)", marginBottom: "0" } },
            ghostLink("Luyện EQ", "/practice", navigate),
          ),
        ),
      ),
    ),
  )

  // 6 — GIỚI HẠN CỦA CÔNG CỤ ---------------------------------------------
  const honesty = el("section", { class: "band band--soft" })
  honesty.append(
    el(
      "div",
      { class: "shell" },
      el("h2", { class: "band__title", text: "Trang này không làm gì" }),
      el("p", {
        class: "band__lead",
        text:
          "Đây là công cụ học tập và tự phát triển, không phải một thang đo đã được kiểm định tâm lý và không dùng để chẩn đoán. Kết quả không nói bạn là người thế nào.",
      }),
      el("p", {
        class: "prose",
        text:
          "Câu trả lời của bạn chỉ nằm trong phiên làm việc này của trình duyệt: không có tài khoản, không lưu nội dung câu trả lời ở đâu khác. Máy chủ chỉ nhận một số đếm hoàn thành ẩn danh, không kèm tình huống hay phương án bạn đã chọn.",
      }),
    ),
  )

  mount.append(hero, preview, skillsBand, method, modes, honesty)

  return { destroy: () => mount.replaceChildren() }
}