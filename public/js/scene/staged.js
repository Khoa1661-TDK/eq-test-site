/* staged.js — biến một tình huống (chữ hoặc cảnh) thành dữ liệu cho sceneRuntime.
   Tình huống chữ có dàn dựng trong data/staging.js thì được diễn như cảnh động; nội dung
   (lời thoại, phương án, điểm) vẫn lấy từ chính tình huống nên việc chấm điểm không đổi. */

import { STAGING } from "../data/staging.js"

export function isStaged(item) {
  return Boolean(item && (item.kind === "scene" || STAGING[item.id]))
}

/** Phương án của tình huống chữ có mã `${id}_${chữ cái gốc}`; trả về chữ cái gốc. */
function originalLetter(item, choice) {
  return choice.id.startsWith(`${item.id}_`) ? choice.id.slice(item.id.length + 1) : choice.code
}

export function toScene(item) {
  if (!item) return null
  if (item.kind === "scene" || !STAGING[item.id]) return item.kind === "scene" ? item : null
  const st = STAGING[item.id]
  const dialogue = (item.dialogue ?? []).map((text, i) => ({ who: st.speakers?.[i] ?? "narrator", text }))
  const consequences = {}
  for (const choice of item.choices) consequences[choice.id] = st.consequences?.[originalLetter(item, choice)] ?? []
  return {
    ...item,
    environment: st.environment,
    label: st.label ?? item.title,
    dialogueSpeaker: st.place ?? "",
    chatTitle: st.chatTitle,
    characters: st.cast,
    dialogue,
    timeline: st.timeline ?? [{ at: 300, do: "decisionPoint" }],
    consequences,
    ...(st.extras !== undefined ? { extras: st.extras } : {}),
  }
}
