/* history.js — LỊCH SỬ LÀM BÀI (/history): mọi lượt đã hoàn thành trên máy này, mới nhất trước.
   Mỗi dòng có avatar + tên profile, ngày giờ, thời lượng và dẫn tới /result?id=…; có nút xóa lịch sử (hỏi lại). */

import { el, frame } from "../core/dom.js"
import { clearQuestHistory, questAttempts } from "../core/questScoring.js"
import { historyEntry } from "../ui/parts.js"

export function renderHistory(mount, { navigate }) {
  const view = el("div", { class: "result eqr hist" })

  const link = (href, text, cls = "btn btn--ghost") => {
    const a = el("a", { class: cls, href }, el("span", { class: "pxf-in", text }))
    a.addEventListener("click", (event) => {
      event.preventDefault()
      navigate(href)
    })
    return a
  }

  function draw() {
    const attempts = [...questAttempts()].sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0))
    let content
    if (!attempts.length) {
      content = el(
        "div",
        { class: "hist__empty" },
        el("p", { class: "prose", text: "Bạn chưa có lần làm bài nào trên máy này. Làm một lượt, chỉ mất vài phút, rồi kết quả sẽ được lưu ở đây để xem lại bất cứ lúc nào." }),
        el("p", { class: "actions" }, link("/assessment", "Bắt đầu bài test", "btn btn--accent btn--lg"), link("/profiles", "Xem thư viện Profile")),
      )
    } else {
      const clearBtn = el("button", { class: "btn btn--ghost btn--sm", type: "button" }, el("span", { class: "pxf-in", text: "Xóa lịch sử" }))
      clearBtn.addEventListener("click", () => {
        if (!confirm("Xóa toàn bộ lịch sử làm bài trên máy này? Việc này không hoàn tác được.")) return
        clearQuestHistory()
        draw()
      })
      content = el(
        "div",
        {},
        el("p", { class: "eqr-note", text: `${attempts.length} lần làm bài, lưu trên trình duyệt của bạn.` }),
        el("div", { class: "hist__list" }, attempts.map((a) => historyEntry(a))),
        el("p", { class: "actions" }, link("/assessment", "Làm lại bài test", "btn btn--accent"), clearBtn),
      )
    }
    const win = el(
      "div",
      { class: "syswin" },
      el(
        "div",
        { class: "syswin__bar" },
        el("span", { class: "syswin__title", text: "Lịch sử làm bài" }),
        el("span", { class: "syswin__dots", attrs: { "aria-hidden": "true" } }, el("i", { class: "syswin__dot" }), el("i", { class: "syswin__dot" }), el("i", { class: "syswin__dot" })),
      ),
      el("div", { class: "syswin__body" }, el("h1", { class: "band__title", text: "Lịch sử làm bài" }), content),
    )
    view.replaceChildren(frame(win, { size: "lg", cls: "syswin-frame" }))
  }

  draw()
  mount.append(view)
  return { destroy: () => mount.replaceChildren() }
}
