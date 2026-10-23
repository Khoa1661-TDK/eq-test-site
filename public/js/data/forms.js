/* forms.js — bộ tình huống đánh giá và kho luyện tập.

   Đánh giá gồm đúng một bộ 12 tình huống đại học (UN_01 … UN_12): mỗi kỹ năng đúng 2
   tình huống chính. Lần làm lại dùng lại đúng 12 tình huống đó, xáo thứ tự, nên kết quả
   so sánh được mà vẫn đo kỹ năng chứ không đo trí nhớ từng câu.

   Luyện tập lấy từ phần ngân hàng còn lại (tình huống chữ cũ và cảnh động), không bao giờ
   lấy 12 tình huống của bộ đánh giá. Danh sách được cố định: một tình huống đã xuất bản
   không đổi đề, để các lần làm cũ vẫn chấm lại được. */

export const FORMS = {
  A: [
    "UN_01",
    "UN_02",
    "UN_03",
    "UN_04",
    "UN_05",
    "UN_06",
    "UN_07",
    "UN_08",
    "UN_09",
    "UN_10",
    "UN_11",
    "UN_12",
  ],
}

export const FORM_ORDER = ["A"]

export const PRACTICE_IDS = [
  "EU_04",
  "AW_03",
  "AW_05",
  "EU_01",
  "ER_04",
  "RG_01",
  "EM_03",
  "EP_01",
  "RS_02",
  "RS_06",
  "RS_03",
  "RL_03",
  "scene-late-deadline",
  "scene-exam-board",
  "scene-chat-pile-on",
  "scene-broken-promise",
  "NX_01",
  "NX_02",
  "NX_03",
  "NX_04",
  "NX_05",
  "NX_06",
]
