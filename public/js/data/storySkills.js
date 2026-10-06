/* storySkills.js — sáu kỹ năng EQ mà chuỗi cảnh /scenes đo.
   Đây là kỹ năng luyện được, không phải "kiểu người". Mỗi kỹ năng có:
   một câu mô tả, một câu khi đó là điểm mạnh, một câu khi đó là điểm yếu,
   và MỘT mẹo luyện tập cụ thể để thử ngay trong tuần này. */

export const STORY_SKILLS = [
  {
    key: "selfAwareness",
    name: "Tự nhận thức",
    short: "Nhận ra mình đang cảm thấy gì, ngay lúc nó xảy ra.",
    strong: "Bạn bắt được cảm xúc của mình sớm, trước khi nó quyết định thay bạn.",
    weak: "Bạn thường phản ứng trước rồi mới nhận ra mình đang tức, lo hay tổn thương.",
    tip: "Ba lần mỗi ngày, dừng 10 giây và gọi tên cảm xúc bằng một từ chính xác kèm mức 1–10 (ví dụ: “bực, 6/10”).",
  },
  {
    key: "regulation",
    name: "Điều chỉnh cảm xúc",
    short: "Giữ được bình tĩnh đủ lâu để chọn cách phản ứng.",
    strong: "Khi bị dồn ép, bạn vẫn tạo được một khoảng nghỉ trước khi trả lời.",
    weak: "Khi cảm xúc lên cao, lời nói hoặc sự im lặng của bạn thường đi trước suy nghĩ.",
    tip: "Khi thấy nóng mặt hay tim đập nhanh: thở ra dài 4 nhịp hai lần, rồi mới nói câu đầu tiên.",
  },
  {
    key: "empathy",
    name: "Đồng cảm",
    short: "Hiểu và tôn trọng cảm xúc của người khác.",
    strong: "Bạn để ý tới cảm giác của người đối diện, kể cả khi bạn không đồng ý với họ.",
    weak: "Bạn dễ tập trung vào việc cần làm mà quên mất người kia đang cảm thấy thế nào.",
    tip: "Trước khi góp ý hay phản hồi ai đó, tự hỏi một câu: “Nếu là họ lúc này, mình đang lo điều gì?”",
  },
  {
    key: "socialAwareness",
    name: "Nhận biết xã hội",
    short: "Đọc được không khí, thời điểm và động lực trong nhóm.",
    strong: "Bạn đọc tốt không khí trong phòng và chọn đúng lúc, đúng nơi để lên tiếng.",
    weak: "Bạn dễ bỏ qua tín hiệu của nhóm: ai đang căng, lúc nào không nên nói, chỗ nào nên nói riêng.",
    tip: "Trong buổi họp tới, dành 1 phút chỉ quan sát: ai im lặng, ai khoanh tay, ai nói nhiều. Ghi lại một điều bạn nhận ra.",
  },
  {
    key: "communication",
    name: "Giao tiếp",
    short: "Nói rõ điều mình cần, theo cách người khác nghe được.",
    strong: "Bạn nói thẳng điều cần nói, rõ ràng mà không làm người khác phải phòng thủ.",
    weak: "Bạn hay nói quá gắt, hoặc không nói gì cả, nên người khác khó biết bạn thực sự cần gì.",
    tip: "Tập một câu theo khung: “Khi [việc cụ thể], mình thấy [cảm xúc], mình mong [đề nghị rõ ràng].”",
  },
  {
    key: "relationship",
    name: "Quản lý quan hệ",
    short: "Giữ và sửa các mối quan hệ, kể cả sau va chạm.",
    strong: "Bạn xử lý va chạm theo cách quan hệ vẫn còn nguyên, thậm chí tốt hơn sau đó.",
    weak: "Sau va chạm, bạn dễ để lại khoảng cách: tránh mặt, nói sau lưng hoặc giữ ấm ức.",
    tip: "Tuần này, chủ động hỏi han một người bạn từng căng thẳng: một tin nhắn ngắn, không nhắc lại chuyện cũ.",
  },
]

export const STORY_SKILL_BY_KEY = Object.fromEntries(STORY_SKILLS.map((s) => [s.key, s]))

export const STORY_MAX_CHOICE = 3
export const STRONG_AT = 60
export const WEAK_BELOW = 70

/** Chấm điểm chuỗi cảnh. answers: mảng id lựa chọn theo thứ tự cảnh.
    Mỗi kỹ năng: điểm đạt / (3 × số cảnh đo kỹ năng đó) → phần trăm 0–100. */
export function scoreStory(scenes, answers) {
  const got = Object.fromEntries(STORY_SKILLS.map((s) => [s.key, 0]))
  const max = Object.fromEntries(STORY_SKILLS.map((s) => [s.key, 0]))
  scenes.forEach((scene, i) => {
    const choice = scene.choices.find((c) => c.id === answers[i])
    for (const key of Object.keys(scene.choices[0].scores)) {
      max[key] += STORY_MAX_CHOICE
      if (choice) got[key] += choice.scores[key] || 0
    }
  })
  const skills = STORY_SKILLS.map((s) => ({
    ...s,
    pct: max[s.key] ? Math.round((got[s.key] / max[s.key]) * 100) : 0,
  }))
  const ranked = [...skills].sort((a, b) => b.pct - a.pct)
  return {
    skills,
    // chỉ gọi là "mạnh" khi đủ cao, "cần luyện" khi thật sự thấp
    strengths: ranked.filter((s) => s.pct >= STRONG_AT).slice(0, 2),
    weaknesses: ranked.filter((s) => s.pct < WEAK_BELOW).slice(-2).reverse(),
  }
}
