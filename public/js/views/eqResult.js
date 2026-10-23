/* eqResult.js — trang HỒ SƠ CẢM XÚC: một cửa sổ hệ thống duy nhất, linh vật theo
   nhóm lựa chọn nổi bật nhất, hai cột điểm mạnh / điểm cần để ý, và phần nhìn lại
   từng lựa chọn kèm điều thường xảy ra tiếp theo. Không chấm điểm, không xếp loại:
   trang chỉ mô tả việc bạn LÀM trong từng tình huống và hậu quả thường gặp của nó. */

import { copyText, el, frame } from "../core/dom.js"
import { sound } from "../core/sound.js"
import { pickMascot } from "../data/mascots.js"
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

  const mascot = pickMascot(result, current.answers)

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

  /* Linh vật: ảnh pixel đặt trên ô nền màu riêng của nó (halo) + tên + một câu
     tagline + vài dòng mô tả ấm áp. */
  const hero = el(
    "section",
    { class: "mascot" },
    el("div", { class: "mascot__art", html: mascotArt(mascot), style: { background: mascot.colors.bg, borderColor: mascot.colors.main } }),
    el(
      "div",
      { class: "mascot__text" },
      el("h1", { class: "mascot__name", text: mascot.name }),
      el("p", { class: "mascot__tagline", text: mascot.tagline }),
      el("p", { class: "mascot__desc", text: mascot.description }),
    ),
  )

  /* Hai cột: hai kỹ năng nổi bật nhất + ba điều nên giữ; hai kỹ năng
     cần thêm chú ý + hai điều nên để ý; mẹo thực tế của linh vật. */
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
    colLines(mascot.strengths),
  )
  const watchCol = el(
    "div",
    { class: "col col--watch" },
    el("h2", { class: "col__title", text: "Điểm cần để ý" }),
    el("ul", { class: "col__skills" }, result.growth.map(colItem)),
    colLines(mascot.watchOuts),
    el("p", { class: "col__tip" }, el("strong", { text: "Mẹo: " }), mascot.tip),
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
    const ok = await copyText(`Mình là ${mascot.name} trên VIBECHECK`)
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

  const body = el("div", { class: "syswin__body" }, hero, el("div", { class: "syswin__cols" }, strengthCol, watchCol), lookback, compare, actions)
  const win = el("div", { class: "syswin" }, bar, body)
  view.append(frame(win, { size: "lg", cls: "result__window", fill: "#fffdf7" }))

  mount.append(view)
  document.title = "Hồ sơ cảm xúc"
  sound.result()

  return {
    destroy: () => mount.replaceChildren(),
  }
}