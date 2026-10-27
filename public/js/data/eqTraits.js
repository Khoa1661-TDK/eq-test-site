/* eqTraits.js — năm thành phần EQ của bài đánh giá E-Quest.

   Khung lấy theo mô hình năm thành phần trí tuệ cảm xúc của Daniel Goleman
   (Emotional Intelligence, 1995; "What Makes a Leader?", Harvard Business Review, 1998).
   Thứ tự trong mảng là thứ tự hiển thị trên hồ sơ và là thứ tự phá thế hoà khi chọn
   thành phần nổi bật nhất. Nguồn hiển thị cho người dùng nằm ở EQ_SOURCES. */

export const EQ_TRAITS = [
  {
    key: "selfAwareness",
    code: "TN",
    name: "Tự nhận thức",
    en: "Self-awareness",
    color: "#e98aa8",
    summary: "Nhận ra mình đang cảm thấy gì, vì sao, và cảm xúc đó đang đẩy mình làm gì.",
  },
  {
    key: "selfManagement",
    code: "LC",
    name: "Làm chủ cảm xúc",
    en: "Self-regulation",
    color: "#e8b06a",
    summary: "Giữ được bình tĩnh khi bị bất ngờ hay bực bội, phản ứng có chủ đích thay vì bốc đồng.",
  },
  {
    key: "motivation",
    code: "ĐL",
    name: "Động lực tự thân",
    en: "Motivation",
    color: "#8fc79a",
    summary: "Tự đứng dậy sau thất bại và tiếp tục vì mục tiêu của mình, không cần ai thúc.",
  },
  {
    key: "empathy",
    code: "TC",
    name: "Sự thấu cảm",
    en: "Empathy",
    color: "#8fa8e0",
    summary: "Đặt mình vào chỗ người khác, hiểu họ đang cảm thấy gì trước khi phản ứng.",
  },
  {
    key: "socialSkills",
    code: "XH",
    name: "Kỹ năng xã hội",
    en: "Social skills",
    color: "#b79ae0",
    summary: "Nói rõ điều mình cần, giữ ranh giới và giải quyết va chạm mà vẫn giữ được quan hệ.",
  },
]

export const EQ_TRAIT_BY_KEY = Object.fromEntries(EQ_TRAITS.map((t) => [t.key, t]))
export const EQ_TRAIT_KEYS = EQ_TRAITS.map((t) => t.key)

export const EQ_SOURCES = [
  {
    text: "Goleman, D. (1995). Emotional Intelligence: Why It Can Matter More Than IQ. Bantam Books.",
    href: "https://www.danielgoleman.info/topics/emotional-intelligence/",
  },
  {
    text: "Goleman, D. (1998). What Makes a Leader? Harvard Business Review, 76(6), 93–102.",
    href: "https://hbr.org/2004/01/what-makes-a-leader",
  },
  {
    text: "Mayer, J. D., Salovey, P., & Caruso, D. R. (2008). Emotional intelligence: New ability or eclectic traits? American Psychologist, 63(6), 503–517.",
    href: "https://doi.org/10.1037/0003-066X.63.6.503",
  },
]

/* Kho luyện tập (data/forms.js PRACTICE_IDS + 12 tình huống đại học UN_ cũ, nay không còn trong bài
   đánh giá) được xếp theo năm thành phần: kỹ năng chính cũ → thành phần, trừ vài tình huống về
   ý chí và tự đứng dậy được gán thẳng cho "Động lực tự thân" (mô hình cũ không có kỹ năng này). */
export const TRAIT_OF_DOMAIN = {
  selfAwareness: "selfAwareness",
  regulation: "selfManagement",
  empathy: "empathy",
  socialAwareness: "empathy",
  communication: "socialSkills",
  relationship: "socialSkills",
}
const MOTIVATION_IDS = new Set(["RG_01", "NX_01", "UN_04", "UN_05"])

export function practiceTrait(item) {
  return MOTIVATION_IDS.has(item.id) ? "motivation" : TRAIT_OF_DOMAIN[item.domain]
}
