/* eqPatterns.js — các KIỂU CHIẾN LƯỢC (không phải kiểu người) mà một lựa chọn thể hiện.
   Mỗi mẫu có: tên ngắn, một câu "đổi thành" cụ thể và một dấu hiệu để tự nhận ra. */

export const EQ_PATTERNS = {
  names_feeling: {
    label: "Gọi đúng tên cảm xúc",
    effective: true,
    swap: "Khi thấy có gì đó đang dâng lên, hãy dừng 10 giây, gọi tên cảm xúc bằng một từ thật chính xác kèm mức từ 1 đến 10, rồi mới chọn làm gì tiếp.",
    cue: "Bạn hay nói 'không biết sao nữa' hoặc 'tự nhiên thấy khó chịu' mà không gọi được tên thứ đang diễn ra trong mình.",
  },
  ignores_feeling: {
    label: "Lờ cảm xúc đi",
    effective: false,
    swap: "Thay vì lờ đi, hãy dành một câu cho cảm xúc đó: 'Mình đang thấy gì, mức mấy?', rồi quyết định xử lý ngay hay để lúc khác.",
    cue: "Ai đó đang kể chuyện mà câu đầu tiên trong đầu bạn là 'có gì đâu mà'.",
  },
  pauses: {
    label: "Dừng lại rồi mới đáp",
    effective: true,
    swap: "Hãy giữ khoảng dừng đó, dù chỉ là một hơi thở dài trước câu trả lời đầu tiên.",
    cue: "Bạn kịp nhận ra tim đập nhanh hay mặt nóng bừng ngay trước khi lời nói bật ra.",
  },
  vents: {
    label: "Xả thẳng vào người khác",
    effective: false,
    swap: "Khi cần xả, hãy chọn chỗ an toàn trước: viết ra, đi bộ, hoặc kể với một người không liên quan. Sau đó mới quay lại nói chuyện với người trong cuộc.",
    cue: "Bạn đã gõ tin nhắn thứ hai khi tin đầu tiên còn chưa được trả lời.",
  },
  suppresses: {
    label: "Nuốt vào trong cho qua",
    effective: false,
    swap: "Thay vì nuốt xuống, hãy nói một câu nhỏ về điều bạn cần ngay khi chuyện còn nhỏ, trước khi nó tích thành ấm ức.",
    cue: "Bạn gật đầu 'ừ' với một điều mà trong lòng không đồng ý, rồi thấy nặng nặng trong ngực.",
  },
  avoids: {
    label: "Né cho nhẹ người",
    effective: false,
    swap: "Thay vì tránh mặt, hãy hẹn một lúc cụ thể để nói chuyện, ví dụ: 'Tối mai cậu rảnh không, mình muốn nói chuyện đó mười phút.'",
    cue: "Bạn bắt đầu né gặp, né nhắn, hoặc 'quên' mở lại cuộc trò chuyện đó.",
  },
  escalates: {
    label: "Đẩy cãi vã lên cao",
    effective: false,
    swap: "Khi thấy câu sắp nói còn nặng hơn câu trước, hãy dừng một nhịp và kéo về một việc cụ thể: 'Mình chỉ nói chuyện này thôi.'",
    cue: "Bạn bắt đầu nói 'lúc nào cũng', 'chẳng bao giờ', hoặc lôi chuyện cũ ra.",
  },
  checks_in: {
    label: "Hỏi trước rồi mới giúp",
    effective: true,
    swap: "Dù nghĩ mình đã biết người kia cần gì, vẫn nên hỏi một câu: 'Lúc này cậu cần gì?' rồi nghe câu trả lời.",
    cue: "Bạn thấy mình sắp khuyên, sắp sửa hộ, hoặc sắp kết luận thay người kia.",
  },
  assumes: {
    label: "Tự đoán mà không hỏi",
    effective: false,
    swap: "Thay vì tự đoán lý do, hãy hỏi thẳng một câu nhẹ nhàng: 'Mình đoán cậu im lặng vì bận, đúng không?'",
    cue: "Bạn bắt đầu nghĩ 'chắc nó đang…' hay 'nó hẳn là…' mà chẳng có bằng chứng nào.",
  },
  fixes_too_fast: {
    label: "Vội đưa giải pháp",
    effective: false,
    swap: "Trước khi khuyên, hãy hỏi: 'Cậu muốn mình nghe thôi hay muốn mình góp ý?' rồi đợi câu trả lời.",
    cue: "Người kia mới kể được nửa câu mà đầu bạn đã soạn xong giải pháp.",
  },
  reads_room: {
    label: "Đọc được không khí",
    effective: true,
    swap: "Hãy giữ thói quen quan sát một phút trước khi lên tiếng: không khí thế nào, ai đang căng, và lúc này có nên nói không.",
    cue: "Bạn kịp nhận ra cả nhóm đang im lặng hoặc đổi chủ đề đúng lúc mình định nói.",
  },
  misreads_room: {
    label: "Nói sai thời điểm",
    effective: false,
    swap: "Trước khi nói, hãy dừng một nhịp và tự hỏi: ở đây, lúc này, với những người này, lời đó có nên nói không? Nếu chưa, hãy đổi kênh hoặc đổi giờ.",
    cue: "Bạn thấy mình đang nói đúng lúc không khí vừa căng lên, hoặc khi ai đó đang vội.",
  },
  states_need: {
    label: "Nói thẳng điều mình cần",
    effective: true,
    swap: "Hãy tiếp tục dùng khung 'khi… mình thấy… mình mong…' cho những chuyện quan trọng, và gắn nó với một việc cụ thể thay vì nói chung chung.",
    cue: "Bạn sắp nói kiểu 'cậu lúc nào cũng…', tức là nói về cả con người họ chứ không phải một việc cụ thể.",
  },
  hints: {
    label: "Bắt người khác tự đoán",
    effective: false,
    swap: "Thay vì nói bóng gió hay mỉa mai, hãy nói thẳng điều bạn cần bằng một câu ngắn, rõ ràng.",
    cue: "Bạn đang soạn câu 'tự hiểu đi' hoặc một câu mỉa mai, và mong người kia tự hiểu ra.",
  },
  blames: {
    label: "Đổ hết lỗi cho người kia",
    effective: false,
    swap: "Thay vì đổ hết nguyên nhân cho người kia, hãy nói phần mình trước: 'Mình thấy… và mình cần…', rồi mới nói đến phần việc của họ.",
    cue: "Câu đầu tiên của bạn mở đầu bằng 'tại cậu' hoặc 'lỗi ở cậu'.",
  },
  repairs: {
    label: "Quay lại hàn gắn",
    effective: true,
    swap: "Hãy giữ thói quen chủ động nhắn một câu hỏi thăm sau lúc căng thẳng, dù chuyện cũ chưa giải quyết xong.",
    cue: "Đã vài ngày bạn chưa nhắn gì mà vẫn cứ nghĩ về chuyện đó.",
  },
  people_pleases: {
    label: "Gật cho yên chuyện",
    effective: false,
    swap: "Trước khi gật, hãy tự hỏi: 'Làm xong việc này mình có thấy bực không?' Nếu có, hãy nói 'để mình xem lịch đã nhé' thay vì 'ừ'.",
    cue: "Bạn gật đầu rất nhanh, nhanh hơn cả lúc kịp nghĩ.",
  },
  sets_boundary: {
    label: "Đặt giới hạn, giọng bình tĩnh",
    effective: true,
    swap: "Khi cần đặt giới hạn, hãy nói ngắn gọn và rõ ràng, không cần giải thích dài: 'Lần này mình không thể…'",
    cue: "Bạn sắp đồng ý với một việc mà mình biết là sau đó sẽ hối hận.",
  },
  self_blames: {
    label: "Tự trách hết về mình",
    effective: false,
    swap: "Thay vì kết luận về bản thân, hãy mô tả một việc cụ thể mình đã làm và một điều mình có thể làm khác đi lần sau.",
    cue: "Bạn bắt đầu nói 'mình tệ quá' hay 'lần nào mình cũng thế' chỉ vì một chuyện cụ thể.",
  },
}

export const PATTERN_KEYS = Object.keys(EQ_PATTERNS)
