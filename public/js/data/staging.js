/* staging.js — dàn dựng cảnh động cho các tình huống CHỮ.

   Lời thoại, câu hỏi, phương án và điểm vẫn nằm ở scenarios.js / scenariosMore.js (một nguồn duy
   nhất cho nội dung và chấm điểm). Ở đây chỉ có phần DIỄN: bối cảnh, ai đứng đâu, ai nói câu nào,
   nhân vật làm gì trong lúc kể, và mỗi phương án dẫn tới hậu quả nào trên sân khấu.

   Mỗi mục, theo mã tình huống:
   {
     environment: "classroom" | "schoolyard" | "canteen" | "corridor" | "bedroom" | "library",
     label: "TIẾT VĂN · LỚP 11A2",          // nhãn chữ hoa ở khung thoại
     place: "LỚP 11A2",                     // tên người kể khi câu thoại là của người dẫn chuyện
     chatTitle?: "Nhóm lớp 11A2",           // tên nhóm trên điện thoại, nếu cảnh có tin nhắn
     cast: [{ id, x, mood, name }],          // luôn có "player"; id là nhân vật trong sprites.js
     speakers: ["narrator", "teacherF", …],  // mỗi câu trong dialogue của tình huống: ai nói
     timeline: [ …sự kiện…, { at, do: "decisionPoint" } ],
     consequences: { A: [ … ], B: [ … ], C: [ … ], D: [ … ] },  // theo chữ cái GỐC của phương án
     extras?: false | [ … ],                 // thay người qua lại mặc định của bối cảnh
   }
   Danh sách hành động và trường của từng sự kiện: xem chú thích đầu scene/sceneRuntime.js. */

import { STAGING_1 } from "./staging1.js"
import { STAGING_2 } from "./staging2.js"
import { STAGING_3 } from "./staging3.js"
import { STAGING_4 } from "./staging4.js"
import { STAGING_5 } from "./staging5.js"
import { STAGING_6 } from "./staging6.js"

export const STAGING = { ...STAGING_1, ...STAGING_2, ...STAGING_3, ...STAGING_4, ...STAGING_5, ...STAGING_6 }
