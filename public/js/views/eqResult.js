/* eqResult.js — trang HỒ SƠ CẢM XÚC: một cửa sổ hệ thống duy nhất, thẻ kiểu cảm
   xúc (16 kiểu, quyết định theo mẫu lựa chọn — xem data/types.js), hai cột điểm
   mạnh / điểm cần để ý, phần nhìn lại từng lựa chọn, và lưới 16 kiểu ở cuối trang.
   Không chấm điểm, không xếp loại: trang chỉ mô tả việc bạn LÀM trong từng tình
   huống và hậu quả thường gặp của nó. */

import { copyText, el, frame } from "../core/dom.js"
import { sound } from "../core/sound.js"
import { MASCOTS_BY_KEY } from "../data/mascots.js"
import { TYPES, pickType } from "../data/types.js"
import { attempts, clearAllData, compareResults, ITEM_BY_ID, scoreAttempt } from "../core/eqScoring.js"
import { LEVEL_WORD, qualMeter, mascotArt } from "../ui/parts.js"

const CHANGE_WORD = { improved: "rõ hơn", steady: "giữ nguyên", dipped: "đang dao động" }

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

  if (!result || !result.answered) {
    view.append(
      frame(
        el(
          "div",
          { class: "empty" },
          el("h1", { class: "band__title", text: "Chưa có hồ sơ cảm xúc" }),
          el("p", { class: "prose", text: "Bạn chưa hoàn thành lần đánh giá nào trên máy này nên chưa có gì để tổng hợp." }),
          el("p", { class: "actions" }, link("/assessment", "Bắt đầu đánh giá", "btn btn--accent btn--lg")),
        ),
        { size: "lg", cls: "result__empty" },
      ),
    )
    mount.append(view)
    return { destroy: () => mount.replaceChildren() }
  }

  const { type, alt } = pickType(current.answers)
  const mascot = MASCOTS_BY_KEY[type.mascot]

  /* ------------------------------------------------------------- cửa sổ ----- */
  const bar = el(
    "div",
    { class: "syswin__bar" },
    el("span", { class: "syswin__title", text: "HỒ SƠ CẢM XÚC.exe" }),
    el(
      "span",
      { class: "syswin__dots", attrs: { "aria-hidden": "true" } },
      el("i", { class: "syswin__dot syswin__dot--a" }),
      el("i", { class: "syswin__dot syswin__dot--b" }),
      el("i", { class: "syswin__dot syswin__dot--c" }),
    ),
  )

  /* Thẻ kiểu: mã lớn, tên tiếng Anh, một câu mô tả, ảnh pixel ngồi bên phải,
     và dòng "chất kiểu nhì" khi có. Nền pastel + chữ mực theo bảng màu riêng
     của kiểu (--tc-bg, --tc-ink). */
  const hero = el(
    "section",
    { class: "typecard" },
    el(
      "div",
      { class: "typecard__main" },
      el("h1", { class: "typecard__code", text: type.code }),
      el("p", { class: "typecard__title", text: type.title }),
      el("p", { class: "typecard__desc", text: type.desc }),
      alt ? el("p", { class: "typecard__alt" }, el("span", { text: "Bạn cũng có chút chất " }), el("strong", { text: alt.code })) : null,
    ),
    el("div", { class: "typecard__art", html: mascotArt(mascot, 96, `${type.code} — ${type.title}`) }),
  )
  hero.style.setProperty("--tc-bg", type.colors.bg)
  hero.style.setProperty("--tc-ink", type.colors.ink)

  /* Hai cột: hai kỹ năng nổi bật nhất + hai điểm mạnh của kiểu; hai kỹ năng
     cần thêm chú ý + hai điều nên để ý; mẹo thực tế của kiểu. */
  const colItem = (dim) =>
    el(
      "li",
      { class: "col__item", attrs: { "data-skill": dim.key } },
      el("span", { class: "col__name", text: dim.name }),
      qualMeter(dim.level),
      el("span", { class: "col__word", text: LEVEL_WORD[dim.level] ?? "" }),
    )
  const colLines = (lines) => el("ul", { class: "col__list" }, lines.map((t) => el("li", { text: t })))

  const strengthCol = el(
    "div",
    { class: "col" },
    el("h2", { class: "col__title", text: "Điểm mạnh" }),
    el("ul", { class: "col__skills" }, result.strengths.map(colItem)),
    colLines(type.strengths),
  )
  const watchCol = el(
    "div",
    { class: "col col--watch" },
    el("h2", { class: "col__title", text: "Điểm cần để ý" }),
    el("ul", { class: "col__skills" }, result.growth.map(colItem)),
    colLines(type.watchOuts),
    el("p", { class: "col__tip" }, el("strong", { text: "Mẹo: " }), type.tip),
  )

  /* Nhìn lại: từng tình huống, lựa chọn của bạn, và điều thường xảy ra
     tiếp theo — mô tả, không phán xét, không đúng/sai. */
  const answeredItems = (current.order ?? []).map((id) => ITEM_BY_ID[id]).filter(Boolean)
  const lookback = el(
    "section",
    { class: "lookback" },
    el("h2", { class: "syswin__heading", text: "Nhìn lại lựa chọn của bạn" }),
    el("p", { class: "lookback__lead", text: "Không có đáp án đúng — chỉ có điều thường xảy ra tiếp theo từ mỗi lựa chọn." }),
    el(
      "ul",
      { class: "lookback__list" },
      answeredItems.map((item) => {
        const choice = item.choices.find((c) => c.id === current.answers[item.id])
        if (!choice) return null
        return el(
          "li",
          { class: "lookback__item" },
          el("p", { class: "lookback__title", text: item.title }),
          el("p", { class: "lookback__choice" }, el("strong", { text: "Bạn chọn: " }), choice.text),
          choice.consequence ? el("p", { class: "lookback__next" }, el("strong", { text: "Điều thường xảy ra tiếp theo: " }), choice.consequence) : null,
        )
      }),
    ),
  )

  /* So với lần trước: chữ thôi, không số. */
  let compare = null
  if (before) {
    const rows = compareResults(before, result)
      .filter((d) => d.change)
      .map((d) =>
        el(
          "li",
          { class: "compare__row" },
          el("span", { class: "compare__name", text: d.name }),
          el("span", { class: "compare__word", text: CHANGE_WORD[d.change] }),
        ),
      )
    if (rows.length) {
      compare = el(
        "section",
        { class: "compare" },
        el("h2", { class: "syswin__heading", text: "So với lần trước" }),
        el("p", { class: "lookback__lead", text: "Chỉ nói là rõ hơn hay giữ nguyên, không có số." }),
        el("ul", { class: "compare__list" }, rows),
      )
    }
  }

  /* Hành động. */
  const share = el("button", { class: "btn btn--ghost", attrs: { type: "button" } }, el("span", { class: "pxf-in", text: "Chia sẻ" }))
  share.addEventListener("click", async () => {
    const label = share.querySelector(".pxf-in")
    const ok = await copyText(`Mình là ${type.code} — ${type.title} trên VIBECHECK`)
    if (!ok) return
    label.textContent = "Đã sao chép!"
    setTimeout(() => (label.textContent = "Chia sẻ"), 1600)
  })
  const wipe = el("button", { class: "btn btn--ghost", attrs: { type: "button" } }, el("span", { class: "pxf-in", text: "Xóa dữ liệu trên máy này" }))
  wipe.addEventListener("click", () => {
    if (!window.confirm("Xóa mọi lần đánh giá và lượt luyện đã lưu trên trình duyệt này? Không thể hoàn tác.")) return
    clearAllData()
    navigate("/")
  })
  const actions = el(
    "section",
    { class: "syswin__actions" },
    link("/practice", "Luyện thêm", "btn btn--accent"),
    link("/assessment", "Làm lại", "btn btn--ghost"),
    share,
    wipe,
    el("p", {
      class: "syswin__note",
      text: "Kết quả chỉ được lưu trên trình duyệt này để bạn tự so sánh ở lần sau. Không có tài khoản, và câu trả lời của bạn không được gửi lên máy chủ.",
    }),
  )

  /* Lưới 16 kiểu ở cuối trang: mỗi thẻ một màu riêng, thẻ của bạn có viền
     mực và nhãn "Bạn". */
  const typeGrid = el(
    "section",
    { class: "typegrid" },
    el("h2", { class: "syswin__heading", text: "16 kiểu trong VIBECHECK" }),
    el(
      "div",
      { class: "typegrid__list" },
      TYPES.map((t) => {
        const card = el(
          "div",
          { class: t.key === type.key ? "typegrid__card is-you" : "typegrid__card" },
          t.key === type.key ? el("span", { class: "typegrid__badge", text: "Bạn" }) : null,
          el("p", { class: "typegrid__code", text: t.code }),
          el("p", { class: "typegrid__title", text: t.title }),
          el("p", { class: "typegrid__desc", text: t.desc }),
        )
        card.style.setProperty("--tc-bg", t.colors.bg)
        card.style.setProperty("--tc-ink", t.colors.ink)
        return card
      }),
    ),
  )

  const body = el("div", { class: "syswin__body" }, hero, el("div", { class: "syswin__cols" }, strengthCol, watchCol), lookback, compare, actions, typeGrid)
  const win = el("div", { class: "syswin" }, bar, body)
  view.append(frame(win, { size: "lg", cls: "result__window", fill: "#fffdf7" }))

  mount.append(view)
  document.title = "Hồ sơ cảm xúc"
  sound.result()

  return {
    destroy: () => mount.replaceChildren(),
  }
}