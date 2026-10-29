/* eqTraits.js — năm tiêu chí EQ mà bộ câu hỏi bao phủ (data/questBank.js: primary / secondary).
   Dùng để rút đề cho đủ bao phủ, không tính điểm; kết quả cuối bài là một trong 10 profile (data/eqProfiles.js).

   Khung lấy theo mô hình năm thành phần trí tuệ cảm xúc của Daniel Goleman
   (Emotional Intelligence, 1995; "What Makes a Leader?", Harvard Business Review, 1998).
   Thứ tự trong mảng là thứ tự khai báo của năm tiêu chí. */

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
