/* types.js — 16 kiểu cảm xúc của VIBECHECK, quyết định theo MẪU LỰA CHỌN mà người
   chơi đã chọn trong bài đánh giá: mỗi kiểu đếm một vài mẫu chiến lược
   (data/eqPatterns.js) với trọng số riêng. Không phải bói toán, không xếp loại
   con người — mỗi kiểu mô tả một kiểu phản ứng phổ biến ở sinh viên, ai cũng có
   chút chất của vài kiểu.
   Linh vật pixel đi kèm tham chiếu theo key trong data/mascots.js. */

import { ITEM_BY_ID, patternCounts, formIds, FORM_ORDER } from "../core/eqScoring.js"

export const TYPES = [
  {
    key: "salty",
    code: "SALTY",
    title: "The Bitter One",
    desc: "Khó chịu khi bị chê, dễ để bụng chuyện nhỏ.",
    mascot: "empathy",
    colors: { bg: "#f6dede", ink: "#7a2430" },
    strengths: [
      "Thật với cảm xúc của mình, không giả bộ 'không sao' cho xong",
      "Rất sòng phẳng: ai bị đối xử không công bằng là bạn nhớ liền",
    ],
    watchOuts: [
      "Chuyện nhỏ bị để bụng lâu sẽ thành chuyện to lúc nào không hay",
      "Lúc đang khó chịu, bạn dễ đổ hết phần lỗi cho người kia — thử nhìn lại phần mình xem",
    ],
    tip: "Viết chuyện đang bực ra nháp, để đó một ngày; hôm sau vẫn muốn nói thì hãy nói, còn thấy nhỏ lại thì cho qua cho nhẹ.",
    patterns: { blames: 1, suppresses: 0.2 },
  },
  {
    key: "cope",
    code: "COPE",
    title: "The Justifier",
    desc: "Luôn tìm lý do để tự thuyết phục rằng mình không sai.",
    mascot: "selfAwareness",
    colors: { bg: "#e6e1f3", ink: "#3d2f6b" },
    strengths: [
      "Tự an ủi bản thân khá giỏi — ít khi tự dằn vặt lâu",
      "Luôn tìm được cách hiểu ổn cho mọi chuyện nên giữ được bình tĩnh",
    ],
    watchOuts: [
      "Lý do bạn tự thuyết phục mình thường là đoán chứ chưa phải bằng chứng",
      "Có lúc 'mình không sai' chỉ là cách để khỏi phải nhìn phần của mình",
    ],
    tip: "Đổi một câu 'chắc nó đang…' thành 'hay là…?' — hỏi một câu nhẹ nhàng trước khi tin vào lời tự đoán.",
    patterns: { assumes: 1 },
  },
  {
    key: "ghost",
    code: "GHOST",
    title: "The Disappearing Act",
    desc: "Biến mất khỏi cuộc trò chuyện khi mọi thứ trở nên căng thẳng.",
    mascot: "avoider",
    colors: { bg: "#dde9f3", ink: "#1f3f5c" },
    strengths: [
      "Biết giữ năng lượng, không đổ thêm dầu vào lửa",
      "Không kéo ai vào drama của mình — bạn tự xử phần của mình",
    ],
    watchOuts: [
      "Chuyện né hôm nay sẽ quay lại nguyên vẹn vào tuần sau, thường là to hơn",
      "Người kia không thấy lý do bạn biến mất — họ chỉ thấy bạn biến mất",
    ],
    tip: "Hẹn một lúc cụ thể cho chuyện đang né: 'Tối mai cậu rảnh không, mình muốn nói chuyện đó mười phút.'",
    patterns: { avoids: 1 },
  },
  {
    key: "yikes",
    code: "YIKES",
    title: "The Panic Button",
    desc: "Dễ hoảng khi tình huống xã hội trở nên khó xử.",
    mascot: "socialAwareness",
    colors: { bg: "#f6e9d2", ink: "#6a4512" },
    strengths: [
      "Nhạy với không khí — bạn biết ngay lúc nào đang có chuyện",
      "Gật cho vui toàn với người bạn quý, đó là tử tế chứ không phải yếu",
    ],
    watchOuts: [
      "Gật nhanh quá thành nhận việc, rồi bực âm thầm — cái bực đó là nợ bạn tự vay",
      "Hoảng lúc đông người là bình thường, nhưng đừng để nó quyết định thay bạn",
    ],
    tip: "Trước khi gật, đếm ba giây: 'mình có thật sự muốn không?' — trễ một nhịp không ai trách bạn đâu.",
    patterns: { people_pleases: 1 },
  },
  {
    key: "chill",
    code: "CHILL",
    title: "The Cool Head",
    desc: "Bình tĩnh, không dễ bị cuốn theo drama.",
    mascot: "regulation",
    colors: { bg: "#e2eedf", ink: "#2c5a2a" },
    strengths: [
      "Có khoảng dừng quý giá giữa cảm xúc và hành động — thứ nhiều người ước có",
      "Gọi được tên cảm xúc của mình thay vì để một mớ trộn chung",
    ],
    watchOuts: [
      "Bình tĩnh lâu quá dễ bị hiểu thành 'chẳng quan tâm' — nói một câu cho người ta biết",
      "Có những lúc nên nóng — đừng để bình tĩnh thành quán tính",
    ],
    tip: "Dùng khoảng dừng của bạn cho cả chuyện vui, không chỉ chuyện căng — và nhớ nói ra điều mình đã nghĩ.",
    patterns: { pauses: 1, names_feeling: 0.4 },
  },
  {
    key: "ouch",
    code: "OUCH",
    title: "The Sensitive One",
    desc: "Dễ bị lời nói hoặc thái độ của người khác làm tổn thương.",
    mascot: "empathy",
    colors: { bg: "#f3e0e8", ink: "#6d2346" },
    strengths: [
      "Cảm nhận rất sâu, cả chuyện của bạn lẫn chuyện của người khác",
      "Bạn có tiêu chuẩn rõ, chỉ là đang nhắm nó vào trong hơi nhiều",
    ],
    watchOuts: [
      "Một câu nói bình thường cũng có thể bị bạn đọc thành 'tại mình tệ'",
      "Lỗi hai bên thì bạn hay nhận hết về mình — chia lại cho công bằng một chút",
    ],
    tip: "Mỗi lần tự trách, viết đúng một việc đã làm và một điều làm khác lần sau — đủ rồi, đừng kết luận cả con người mình.",
    patterns: { self_blames: 1 },
  },
  {
    key: "idk",
    code: "IDK",
    title: "The Indecisive One",
    desc: "Khó quyết định khi phải chọn giữa nhiều cảm xúc hoặc lợi ích.",
    mascot: "selfAwareness",
    colors: { bg: "#e6e6e6", ink: "#333333" },
    strengths: [
      "Thấy được cả hai phía của vấn đề — ít khi bạn kết luận bừa",
      "Bạn chậm vì đang cân nhắc thật, không phải vì lười chọn",
    ],
    watchOuts: [
      "Đứng giữa quá lâu thì cả hai phía đều phải chờ — chọn một hướng rồi sửa sau cũng được",
      "Nhiều lúc 'chưa biết' là vì chưa dám hỏi, không phải vì không có câu trả lời",
    ],
    tip: "Khi kẹt, tự hỏi 'mình cần gì nhất ở đây' rồi chọn theo đúng một câu đó thôi — phần còn lại tính sau.",
    patterns: {},
  },
  {
    key: "bruh",
    code: "BRUH",
    title: "The Done One",
    desc: "Phản ứng bằng bất lực, chán nản hoặc cà khịa khi gặp chuyện.",
    mascot: "avoider",
    colors: { bg: "#f6e4d3", ink: "#6b3a14" },
    strengths: [
      "Biết để chuyện nhỏ là chuyện nhỏ — không làm mọi thứ to ra",
      "Cà khịa là cách bạn xả, và nó có tác dụng thật",
    ],
    watchOuts: [
      "Hôm nay là 'có gì đâu mà', cuối tuần sau chuyện đó quay lại với giọng khác",
      "Bất lực tích nhiều thành chán dai — để ý lúc chữ 'kệ' bắt đầu nặng",
    ],
    tip: "Trước khi lờ một cảm xúc, dành cho nó đúng một câu: 'mình đang thấy gì, mức mấy?' — rồi hãy quyết định.",
    patterns: { ignores_feeling: 1 },
  },
  {
    key: "real",
    code: "REAL",
    title: "The Straight Shooter",
    desc: "Thẳng thắn, dám nói thật nhưng cần học cách chọn lời.",
    mascot: "communication",
    colors: { bg: "#e2eedf", ink: "#24502c" },
    strengths: [
      "Nói được điều mình cần mà người nghe không phải phòng thủ",
      "Ở gần bạn đỡ phải đoán — ai cũng biết bạn đang nghĩ gì",
    ],
    watchOuts: [
      "Chọn lúc mà nói: lời thẳng lúc người ta đang mệt dễ gắt hơn bạn nghĩ",
      "Im lặng cũng là một câu trả lời — đừng để người khác phải tự đoán ý bạn",
    ],
    tip: "Giữ khung 'khi… mình thấy… mình mong…' cho chuyện quan trọng, và gắn nó với một việc cụ thể thôi.",
    patterns: { states_need: 1 },
  },
  {
    key: "main",
    code: "MAIN",
    title: "The Main Character",
    desc: "Dễ đặt góc nhìn của mình làm trung tâm tình huống.",
    mascot: "socialAwareness",
    colors: { bg: "#e6e1f3", ink: "#352a63" },
    strengths: [
      "Tự nhiên đứng ra khi cả phòng đang chờ một ai đó",
      "Có chính kiến rõ — ý của bạn dễ nghe và dễ làm theo",
    ],
    watchOuts: [
      "Lúc không khí vừa căng lên là lúc nên chậm một nhịp, không phải lúc nên hăng",
      "Góc nhìn của bạn đúng với bạn, chưa chắc đúng với những người đang nghe",
    ],
    tip: "Trước khi lên tiếng, dành một phút nhìn cả phòng: ai đang căng, ai chưa được nói, lúc này có phải lúc không.",
    patterns: { misreads_room: 1 },
  },
  {
    key: "petty",
    code: "PETTY",
    title: "The Scorekeeper",
    desc: "Nhớ dai những lần bị đối xử không công bằng, thích đáp trả.",
    mascot: "communication",
    colors: { bg: "#f6dede", ink: "#7a2430" },
    strengths: [
      "Rất sòng phẳng — ai bị xử tệ bạn thấy liền, và hay lên tiếng giùm",
      "Nhớ dai nghĩa là bạn để tâm; qua mặt bạn không dễ đâu",
    ],
    watchOuts: [
      "Đẩy chuyện lên cao đã thành phản xạ — có lúc chỉ cần nói đúng chuyện này thôi",
      "Ghi bàn mãi mà không chịu xóa sổ là mệt cho bạn trước tiên",
    ],
    tip: "Khi câu sắp nói nặng hơn câu trước, dừng một nhịp và kéo về đúng một việc cụ thể: 'mình chỉ nói chuyện này thôi.'",
    patterns: { escalates: 1 },
  },
  {
    key: "bet",
    code: "BET",
    title: "The Doer",
    desc: "Sẵn sàng hành động thay vì ngồi than phiền mãi.",
    mascot: "relationship",
    colors: { bg: "#dde9f3", ink: "#1d3d5e" },
    strengths: [
      "Hành động thay vì than — chuyện qua tay bạn là có tiến độ",
      "Sẵn sàng quay lại nối lại sau lúc căng — thứ đó xây được niềm tin",
    ],
    watchOuts: [
      "Người ta mới kể nửa câu mà bạn đã soạn xong giải pháp — có khi họ chỉ cần được nghe",
      "Hay sửa hộ mọi người, nhớ cũng để ai đó sửa lại phần cho bạn",
    ],
    tip: "Trước khi khuyên, hỏi trước một câu: 'cậu muốn mình nghe thôi hay muốn mình góp ý?' rồi hãy nói.",
    patterns: { fixes_too_fast: 1, repairs: 0.3 },
  },
  {
    key: "oops",
    code: "OOPS",
    title: "The Oopsie",
    desc: "Lỡ phản ứng bốc đồng rồi mới nhận ra hậu quả.",
    mascot: "communication",
    colors: { bg: "#f6e9d2", ink: "#64430f" },
    strengths: [
      "Cảm xúc ra là ra liền — bạn không để chuyện âm ỉ lâu",
      "Biết mình lỡ và hay quay lại sửa — không phải ai cũng làm được",
    ],
    watchOuts: [
      "Bạn hay xả thẳng vào người đang nghe gần nhất, mà họ thường chẳng liên quan gì",
      "Gõ tin thứ hai khi tin đầu chưa được trả lời — chậm một nhịp thôi",
    ],
    tip: "Chọn chỗ xả an toàn trước: viết ra, đi bộ, kể với người ngoài cuộc — rồi mới quay lại nói chuyện chính.",
    patterns: { vents: 1 },
  },
  {
    key: "sure",
    code: "SURE.",
    title: "The Passive-Aggressive One",
    desc: "Nói “ừ, sao cũng được” nhưng thái độ lại nói điều khác.",
    mascot: "empathy",
    colors: { bg: "#f3e0e8", ink: "#6a2244" },
    strengths: [
      "Ít khi nói to — bạn giữ hòa khí cho cả nhóm",
      "Thái độ 'nói điều khác' nghĩa là trong bạn vẫn có ý kiến, chỉ là chưa được nói ra",
    ],
    watchOuts: [
      "Bóng gió thì người kia phải tự đoán, mà họ toàn đoán sai",
      "Gật cho xong lâu ngày tích thành ấm — cái ấm đó hay nổ đúng lúc không nên",
    ],
    tip: "Nói thẳng điều bạn cần bằng một câu ngắn, rõ — nói rõ không mất lịch sự, nói rõ là đỡ cho cả hai.",
    patterns: { hints: 1 },
  },
  {
    key: "welp",
    code: "WELP",
    title: "The Resigned One",
    desc: "Dễ buông xuôi khi mọi thứ không diễn ra như mong đợi.",
    mascot: "avoider",
    colors: { bg: "#e6e6e6", ink: "#2f2f2f" },
    strengths: [
      "Biết buông những chuyện mình không đổi được — đỡ mệt hơn ai cứ cố chấp",
      "Bạn hay nhường cho xong, thường vì lo cho người khác trước",
    ],
    watchOuts: [
      "Gật 'ừ, sao cũng được' mà lòng không phục thì chữ 'ừ' đó nặng lắm đấy",
      "Buông lâu ngày thành khoảng cách — người quanh bạn toàn tưởng bạn ổn",
    ],
    tip: "Nói một câu nhỏ về điều bạn cần ngay khi chuyện còn nhỏ, trước khi nó tích thành ấm ức.",
    patterns: { suppresses: 1 },
  },
  {
    key: "slay",
    code: "SLAY",
    title: "The Confident One",
    desc: "Tự tin thể hiện bản thân, dám đứng ra xử lý tình huống.",
    mascot: "relationship",
    colors: { bg: "#e2eedf", ink: "#24502c" },
    strengths: [
      "Đặt giới hạn bằng giọng bình tĩnh — hàng hiếm, và ai quanh bạn cũng cần nó",
      "Hỏi trước rồi mới giúp, đọc được không khí trước khi lên tiếng",
    ],
    watchOuts: [
      "Tự tin dễ bị đọc thành 'biết hết rồi' — nhớ hỏi trước khi khuyên",
      "Đứng ra xử lý nhiều quá thì phần của bạn dễ bị bỏ quên",
    ],
    tip: "Giữ nguyên bộ kỹ năng này, chỉ nhớ nói ra điều bạn đọc được bằng một câu cụ thể — nhóm cần nó lúc bạn không có mặt.",
    patterns: { sets_boundary: 0.7, checks_in: 0.5, reads_room: 0.5, repairs: 0.4 },
  },
]

export const TYPE_BY_KEY = Object.fromEntries(TYPES.map((t) => [t.key, t]))

/** Chọn kiểu theo mẫu lựa chọn, có chuẩn hóa theo CƠ HỘI: điểm mỗi kiểu = tỷ lệ
    raw / avail, trong đó raw là tổng trọng số các mẫu khớp với câu trả lời đã cho,
    còn avail là điểm tối đa mà 12 tình huống đánh giá có thể mang lại cho kiểu đó
    (tổng trọng số cao nhất mà lựa chọn của từng tình huống offer cho kiểu). Chuẩn
    hóa để kiểu có nhiều mẫu không chiếm sân, kiểu ít mẫu vẫn có cửa. Trong những
    kiểu có raw ≥ 1.5, tỷ lệ cao nhất thắng; hòa thì theo câu trả lời gần nhất
    trong số những kiểu hòa, rồi theo thứ tự TYPES; không có kiểu nào đạt → IDK.
    Kiểu nhì (raw ≥ 1, tỷ lệ cao nhất còn lại) trả về kèm làm alt. Trả về
    { type, alt, scores } với scores là tỷ lệ. */
export function pickType(answers = {}) {
  const { counts } = patternCounts(answers)
  const items = formIds(FORM_ORDER[0]).map((id) => ITEM_BY_ID[id]).filter(Boolean)
  let lastPattern = null
  for (const [id, choiceId] of Object.entries(answers ?? {})) {
    const choice = ITEM_BY_ID[id]?.choices.find((c) => c.id === choiceId)
    if (choice?.pattern) lastPattern = choice.pattern
  }
  const raw = Object.fromEntries(TYPES.map((t) => [t.key, 0]))
  const scores = Object.fromEntries(TYPES.map((t) => [t.key, 0]))
  for (const type of TYPES) {
    for (const [pattern, weight] of Object.entries(type.patterns)) {
      raw[type.key] += weight * (counts[pattern] ?? 0)
    }
    const avail = items.reduce((sum, item) => sum + Math.max(...item.choices.map((c) => type.patterns[c.pattern] ?? 0)), 0)
    scores[type.key] = avail > 0 ? raw[type.key] / avail : 0
  }
  const best = (pool) => {
    const top = Math.max(...pool.map((t) => scores[t.key]))
    const tied = pool.filter((t) => scores[t.key] === top)
    return tied.find((t) => t.patterns[lastPattern] > 0) ?? tied[0]
  }
  const qualifying = TYPES.filter((t) => raw[t.key] >= 1.5)
  const winner = qualifying.length ? best(qualifying) : TYPE_BY_KEY.idk
  const others = TYPES.filter((t) => t.key !== winner.key && raw[t.key] >= 1)
  const alt = others.length ? best(others) : null
  return { type: winner, alt, scores }
}
