// mascots.js — linh vật của trang hồ sơ: một con cho mỗi kỹ năng nổi bật nhất,
// thêm một con cho những bạn chọn kiểu "kệ" nhiều hơn là chọn đối diện.
// Linh vật gọi tên một nhóm lựa chọn, không phải một lời kết về con người bạn.
// Lưới pixel 16×16: '.' là trong suốt, mọi chữ cái khác phải có trong bảng màu đi kèm.

import { patternCounts } from "../core/eqScoring.js"

const INK = "#1a1d23"

export const MASCOTS = [
  {
    key: "selfAwareness",
    name: "Cú Soi Lòng",
    animal: "cú",
    tagline: "Thấy cảm xúc từ lúc nó còn đang nhen.",
    description:
      "Bạn nhận ra cảm xúc của mình khá sớm và gọi được tên nó, kể cả những lúc trong lòng trộn nhiều thứ cùng lúc. Đây là kỹ năng khó nhất trong sáu kỹ năng, và bạn làm nó một cách tự nhiên.",
    strengths: [
      "Gọi được tên cảm xúc thay vì nói chung là 'khó chịu'",
      "Biết cảm xúc đến từ đâu, không đổ hết cho người gần nhất",
      "Nhận ra lúc trong lòng có hai thứ cùng lúc",
    ],
    watchOuts: [
      "Lúc mệt thì màn 'soi lòng' cũng mờ đi, chuyện đó bình thường",
      "Hiểu mình rồi thì nhớ nói cho người khác biết với — họ không đọc được ý nghĩ",
    ],
    tip: "Khi gọi được tên một cảm xúc, thử nói luôn một câu cho người đang ở đó — ngắn thôi cũng được.",
    colors: { bg: "#fff1d6", main: "#9a6a43", accent: "#f6a21a" },
    palette: { o: INK, B: "#9a6a43", V: "#c99a62", L: "#f6e3bd", W: "#ffffff", E: "#1d1b2e", Y: "#f6a21a" },
    pixels: [
      "................",
      "..oo........oo..",
      ".oBBo......oBBo.",
      ".oBBBooooooBBBo.",
      "oBBBBBBBBBBBBBBo",
      "oBBWWWWBBWWWWBBo",
      "oBWWEEWWWWEEWWBo",
      "oBWWEWWBBWEWWWBo",
      "oBBWWWWYYWWWWBBo",
      "oBBBLLLYYLLLBBBo",
      ".oBLLVLLLLVLLBo.",
      ".oBLLLLVVLLLLBo.",
      "..oBLLLLLLLLBo..",
      "...oooooooooo...",
      "....YYo..oYY....",
      "................",
    ],
  },
  {
    key: "regulation",
    name: "Rùa Bình Tĩnh",
    animal: "rùa",
    tagline: "Chậm một nhịp, tới đích nguyên vẹn.",
    description:
      "Bạn có khoảng dừng quý giá giữa cảm xúc và hành động — thứ mà nhiều người ước có. Bạn không bùng; bạn chọn lúc nào nên xử lý và lúc nào nên chờ.",
    strengths: [
      "Dừng được một nhịp trước khi nói hoặc làm",
      "Biết chọn thời điểm, không xử lý lúc đang nóng",
      "Cơn cảm xúc đi qua tay lái, không phải nó qua bạn",
    ],
    watchOuts: [
      "Chậm mà chắc là tốt, nhưng đừng để 'để sau' thành 'quên luôn'",
      "Có những lần nên nhanh — đừng để nhịp dừng thành lý do né",
    ],
    tip: "Tự đặt luật: cảm xúc nào 'để sau' quá một ngày mà chưa nói thì phải tự nhắc lại nó.",
    colors: { bg: "#e3f8ec", main: "#24875a", accent: "#ffd36b" },
    palette: { o: INK, G: "#3fbf7f", D: "#24875a", Y: "#ffd36b", S: "#b7e57e", E: "#1d1b2e", P: "#ff8fab" },
    pixels: [
      "................",
      "................",
      "................",
      "....oooooo......",
      "...oGGDDGGo.....",
      "..oGDGGGGDGo.ooo",
      ".oGGDGGGGDGGoSEo",
      ".oDGGDDDDGGDoSPo",
      "oYYYYYYYYYYYYSSo",
      ".oooooooooooooo.",
      "..oSSo....oSSo..",
      "..oooo....oooo..",
      "................",
      "................",
      "................",
      "................",
    ],
  },
  {
    key: "empathy",
    name: "Mèo Hiểu Ý",
    animal: "mèo",
    tagline: "Nhìn một cái là biết đang có chuyện.",
    description:
      "Bạn hay thử đứng ở chỗ người kia trước khi kết luận, và biết công nhận cảm xúc của họ mà không cần đồng ý hết. Người quanh bạn thường thấy mình được nghe.",
    strengths: [
      "Đoán ý người khác khá đúng, nhất là lúc bình tĩnh",
      "Hỏi trước khi khuyên — thứ ai cũng cần mà ít ai được nhận",
      "Công nhận cảm xúc của họ mà không cần thấy mình đúng hết",
    ],
    watchOuts: [
      "Lúc đang bực thì mèo cũng đoán ẩu được — kiểm tra lại trước khi tin",
      "Hiểu người khác rồi thì cũng chừa chỗ cho cảm xúc của mình nữa",
    ],
    tip: "Với người thân, tập nói một câu về điều bạn cần trước khi hỏi thăm họ.",
    colors: { bg: "#ffeede", main: "#e8893f", accent: "#ff7b9c" },
    palette: { o: INK, C: "#ffb36b", D: "#e8893f", P: "#ff7b9c", E: "#1d1b2e", W: "#ffffff" },
    pixels: [
      "................",
      "..o..........o..",
      ".oCo........oCo.",
      ".oPCo......oCPo.",
      ".oPCCooooooCCPo.",
      ".oCCDCCDDCCDCCo.",
      "oCCCCCCCCCCCCCCo",
      "oCCEECCCCCCEECCo",
      "oCCEWCCCCCCEWCCo",
      "oPPCCCCPPCCCCPPo",
      "oCCCCCoCCoCCCCCo",
      ".oCCCCCooCCCCCo.",
      "..oCCCCCCCCCCo..",
      "...oooooooooo...",
      "................",
      "................",
    ],
  },
  {
    key: "socialAwareness",
    name: "Tắc Kè Bắt Vibe",
    animal: "tắc kè",
    tagline: "Bước vào là biết cả phòng đang thế nào.",
    description:
      "Bạn đọc được không khí trước khi nó kịp lộ ra thành lời: ai đang căng, ai đang bị bỏ ngoài lề, lúc này có nên nói không. Cả nhóm hưởng điều này nhiều mà ít ai biết.",
    strengths: [
      "Cảm nhận không khí nhóm rất nhanh",
      "Biết chọn lúc, chọn nơi cho chuyện nhạy cảm",
      "Thấy người bị bỏ ngoài lề trước khi họ lên tiếng",
    ],
    watchOuts: [
      "Đổi màu theo phòng mãi thì cũng mệt — nhớ giữ màu của mình nữa",
      "Đọc vibe giúp bạn im đúng lúc, nhưng có lúc nên là người lên tiếng",
    ],
    tip: "Cái bạn đọc được bằng mắt, tập nói ra bằng một câu cụ thể — nhóm sẽ cần nó lúc bạn không có mặt.",
    colors: { bg: "#e6fae3", main: "#2f9e57", accent: "#3fa9ff" },
    palette: { o: INK, G: "#5fd35f", D: "#2f9e57", Y: "#ffd84a", B: "#3fa9ff", W: "#ffffff", E: "#1d1b2e", P: "#ff7b9c" },
    pixels: [
      "................",
      "................",
      "...ooooo........",
      "..oGGGGGoo......",
      ".oGWWWGGGGoo....",
      ".oGWEEWGGGGGoo..",
      ".oGWWWGYGGBGGGo.",
      "oGGGGGGYGGBGGGGo",
      "oPGGGGGYGGBGGGDo",
      ".ooooGGYGGBGGDo.",
      "....oGoooGooGDo.",
      "....oo...oo.oDo.",
      "........ooo.oDo.",
      "........oDDDDo..",
      ".........oooo...",
      "................",
    ],
  },
  {
    key: "communication",
    name: "Vẹt Nói Trúng",
    animal: "vẹt",
    tagline: "Nói một câu, đúng luôn điều cần nói.",
    description:
      "Bạn nói được điều mình cần mà không biến nó thành lời trách, và nghe xong rồi mới đáp. Chuyện quan trọng qua tay bạn là tới nơi, không phải tới tai rồi lệch.",
    strengths: [
      "Nói điều mình cần mà người nghe không phải phòng thủ",
      "Nghe hết câu rồi mới đáp, và hay hỏi lại cho chắc",
      "Góp ý việc cụ thể, không phán cả con người",
    ],
    watchOuts: [
      "Nói giỏi hai chiều rồi, nhớ để ý lúc mình im lặng — im cũng là một câu trả lời",
      "Lời hay nói lúc mệt cũng dễ gắt hơn — chọn lúc mà nói",
    ],
    tip: "Chọn một chuyện bạn đang để trong lòng, viết nó thành 'khi… mình thấy… mình mong…' và nói trong tuần này.",
    colors: { bg: "#ffe6e9", main: "#e0303f", accent: "#2f8cff" },
    palette: { o: INK, R: "#ff4d5e", B: "#2f8cff", Y: "#ffcf3a", G: "#3fc46f", W: "#ffffff", E: "#1d1b2e" },
    pixels: [
      "................",
      ".....oooo.......",
      "....oRRRRo......",
      "...oRRRRRRo.....",
      "..oRWWRRRRRo....",
      "..oRWERRRRRo....",
      ".oYYYoRRRRRRo...",
      ".oYYYoRRRRRRo...",
      "..oYoRRRBBBRo...",
      "...ooRRBBBBBo...",
      "....oRRBBBBBo...",
      "....oRRBBBBo....",
      ".....oRBBBo.....",
      "......oGGGo.....",
      "......oGoGo.....",
      ".......o.o......",
    ],
  },
  {
    key: "relationship",
    name: "Ong Kết Nối",
    animal: "ong",
    tagline: "Cãi xong vẫn quay lại xây tiếp.",
    description:
      "Sau một va chạm, bạn thường là đứa quay lại — nhắn hỏi thăm, nói phần mình, giữ mối quan hệ sống. Bạn giữ những lời hứa nhỏ, và đó chính là thứ xây nên niềm tin.",
    strengths: [
      "Quay lại hàn gắn thay vì để khoảng cách lớn dần",
      "Giữ những lời hứa nhỏ, và biết lúc mình lỡ hứa",
      "Chấp nhận khác biệt mà không cần phân thắng bại",
    ],
    watchOuts: [
      "Hay đi nối mọi người, nhớ cũng để ai đó nối lại với bạn",
      "Hàn gắn nhiều mà quên phần mình thì cũng tới lúc đầy",
    ],
    tip: "Điểm danh những lần bạn gật cho vui gần đây — chọn một chuyện mà nói, trước khi nó thành ba chuyện.",
    colors: { bg: "#fff6cc", main: "#3a2f2a", accent: "#ffd23f" },
    palette: { o: INK, Y: "#ffd23f", K: "#3a2f2a", W: "#d8f1ff", P: "#ff8fab", E: "#1d1b2e" },
    pixels: [
      "....o......o....",
      ".....o....o.....",
      ".oo..oooooo..oo.",
      "oWWWoYYYYYYoWWWo",
      "oWWWYYYYYYYYWWWo",
      ".oWoYEYYYYEYoWo.",
      "..ooYYYYYYYYoo..",
      "..oYPYYooYYPYo..",
      "..oKKKKKKKKKKo..",
      "..oYYYYYYYYYYo..",
      "..oKKKKKKKKKKo..",
      "...oYYYYYYYYo...",
      "....oKKKKKKo....",
      ".....oooooo.....",
      ".......oo.......",
      "................",
    ],
  },
  {
    key: "avoider",
    name: "Lười Chill Kệ Đời",
    animal: "lười",
    tagline: "Kệ đó, nhưng trong lòng thì chưa kệ xong.",
    description:
      "Bạn chọn né, lờ hoặc nuốt cho qua nhiều hơn là đối diện — thường vì lúc đó đó là cách nhẹ nhất, không phải vì bạn không quan tâm. Chỉ là mấy chuyện để kệ hay đi đường dài hơn dự kiến, nên đây là vài dòng cho riêng bạn.",
    strengths: [
      "Biết để chuyện nhỏ là chuyện nhỏ, không làm to mọi thứ",
      "Không kéo người khác vào drama của mình",
      "Có khoảng lặng riêng mà nhiều người cần mà không có",
    ],
    watchOuts: [
      "Chuyện kệ lâu thường quay lại to hơn, nguyên vẹn như lúc nó ra đi",
      "Né với người này thì được, né với chính mình thì lâu dài hơi",
    ],
    tip: "Chọn một chuyện đang để kệ, nhắn một câu hỏi thăm trong ba ngày tới — một câu thôi là đủ để mở cửa.",
    colors: { bg: "#f3ebe2", main: "#6e5440", accent: "#5fbf4f" },
    palette: { o: INK, T: "#7c5a3a", F: "#b08a68", L: "#f3dfc4", D: "#6e5440", E: "#1d1b2e", N: "#3a2a22", G: "#5fbf4f" },
    pixels: [
      "....G......G....",
      "TTTTTTTTTTTTTTTT",
      "..oo..G.....oo..",
      "..oFo......oFo..",
      "..oFoooooooFFo..",
      "..oFFFFFFFFFFo..",
      ".oFFLLLLLLLLFFo.",
      ".oFDDLLLLLLDDFo.",
      ".oFDEELLLLEEDFo.",
      ".oFLLLLNNLLLLFo.",
      ".oFLLLLooLLLLFo.",
      "..oFLLLLLLLLFo..",
      "..oFFFFFFFFFFo..",
      "...oFFFFFFFFo...",
      "....oooooooo....",
      "................",
    ],
  },
]

export const MASCOTS_BY_KEY = Object.fromEntries(MASCOTS.map((m) => [m.key, m]))

// Nhóm "kệ": né, lờ, nuốt — từ 40% số câu đã trả lời trở lên thì chú lười lên ngôi.
const AVOID_PATTERNS = ["avoids", "ignores_feeling", "suppresses"]
const AVOID_SHARE = 0.4

/** Chọn linh vật cho một kết quả: ưu tiên nhóm "kệ", còn lại theo kỹ năng nổi bật nhất. */
export function pickMascot(result, answers = null) {
  if (answers && result?.answered) {
    const { counts } = patternCounts(answers)
    const picks = AVOID_PATTERNS.reduce((sum, p) => sum + (counts[p] ?? 0), 0)
    if (picks / result.answered >= AVOID_SHARE) return MASCOTS_BY_KEY.avoider
  }
  const scored = (result?.dimensions ?? []).filter((d) => d.score !== null)
  if (!scored.length) return MASCOTS_BY_KEY.selfAwareness
  const top = scored.reduce((best, d) => (d.score > best.score ? d : best))
  return MASCOTS_BY_KEY[top.key] ?? MASCOTS_BY_KEY.selfAwareness
}