/* forms.js — hai đề đánh giá song song (A, B) và kho luyện tập.
   Lần làm lại luôn dùng đề còn lại (A → B → A …), còn luyện tập không bao giờ
   lấy tình huống của hai đề, để lần đánh giá lại đo kỹ năng chứ không đo trí nhớ.

   Mỗi đề: 18 tình huống chữ (mỗi kỹ năng chính 3 tình huống, ghép cặp theo độ khó giữa
   hai đề) và 2 cảnh động. Danh sách được cố định: một tình huống đã xuất bản không đổi
   đề, để các lần làm cũ vẫn chấm lại được. Tạo bằng cách ghép cặp theo tỉ lệ điểm trung
   bình của một lựa chọn ngẫu nhiên so với lựa chọn mạnh nhất. */

export const FORMS = {
  A: [
    "EU_02",
    "AW_02",
    "AW_04",
    "ER_03",
    "ER_02",
    "ER_01",
    "EM_01",
    "EM_02",
    "EM_05",
    "SO_05",
    "SO_04",
    "EM_04",
    "CM_02",
    "RS_05",
    "CM_01",
    "RL_02",
    "RL_05",
    "RS_04",
    "scene-idea-credit",
    "scene-quiet-teammate",
  ],
  B: [
    "EU_05",
    "AW_01",
    "AW_06",
    "ER_05",
    "RG_03",
    "RG_02",
    "EU_03",
    "EP_02",
    "EP_03",
    "SO_02",
    "SO_03",
    "SO_01",
    "CM_03",
    "CM_04",
    "RS_01",
    "ER_06",
    "RL_04",
    "RL_01",
    "scene-hard-feedback",
    "scene-public-criticism",
  ],
}

export const FORM_ORDER = ["A", "B"]

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
]
