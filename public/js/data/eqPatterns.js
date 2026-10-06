/* eqPatterns.js — các KIỂU CHIẾN LƯỢC (không phải kiểu người) mà một lựa chọn thể hiện.
   Mỗi mẫu có: tên ngắn, một câu "đổi thành" cụ thể và một dấu hiệu để tự nhận ra. */

export const EQ_PATTERNS = {
  names_feeling: {
    label: "Gọi đúng tên cảm xúc",
    effective: true,
    swap: "Khi thấy có gì đang dâng, dừng 10 giây, gọi tên cảm xúc đó bằng một từ chính xác kèm mức 1–10, rồi mới chọn việc làm tiếp.",
    cue: "Bạn bắt đầu nói 'không biết tại sao' hay 'chỉ thấy khó chịu' mà không gọi được tên thứ đang xảy ra trong mình.",
  },
  ignores_feeling: {
    label: "Trượt qua cảm xúc",
    effective: false,
    swap: "Thay vì bỏ qua, dành một câu cho cảm xúc đó: 'Mình đang thấy gì, mức mấy', rồi quyết định là xử lý ngay hay chờ.",
    cue: "Nghe ai đó nói mà câu đầu tiên trong đầu bạn là 'chuyện đó có gì đâu'.",
  },
  pauses: {
    label: "Dừng lại trước khi đáp",
    effective: true,
    swap: "Hãy giữ khoảng dừng đó, kể cả khi nó chỉ là một hơi thở dài trước câu trả lời đầu tiên.",
    cue: "Bạn kịp thấy tim đập nhanh hoặc mặt nóng lên ngay trước khi câu chữ tuột ra.",
  },
  vents: {
    label: "Đổ ngay lên người khác",
    effective: false,
    swap: "Khi cần xả, chọn nơi an toàn trước: viết ra, đi bộ, hoặc nói với người không liên quan, rồi quay lại chuyện với người trong cuộc.",
    cue: "Ngón tay bạn đã bắt đầu gõ tin nhắn thứ hai trước khi tin nhắn đầu tiên được trả lời.",
  },
  suppresses: {
    label: "Nín nhịn cho qua",
    effective: false,
    swap: "Thay vì nuốt xuống, nói một câu nhỏ về điều bạn cần ngay khi nó còn nhỏ, trước khi nó tích thành ấm ức.",
    cue: "Bạn thấy mình gật đầu 'ừ' với điều trong lòng đang không đồng ý, và sau đó ngực cứ nặng.",
  },
  avoids: {
    label: "Rời đi cho nhẹ",
    effective: false,
    swap: "Thay vì tránh mặt, hẹn một thời điểm cụ thể để nói chuyện, ví dụ 'Tối mai rảnh không, mình muốn nói chuyện đó mười phút.'",
    cue: "Bạn bắt đầu né gặp, né nhắn, hoặc 'quên' mở lại cuộc hội thoại đó.",
  },
  escalates: {
    label: "Nâng trận lên",
    effective: false,
    swap: "Khi thấy câu nói tiếp theo sẽ lớn hơn câu trước, dừng một nhịp và kéo về một việc cụ thể: 'Mình nói về chuyện này thôi.'",
    cue: "Bạn bắt đầu nói 'lúc nào cũng', 'chẳng bao giờ', hoặc lôi chuyện cũ ra.",
  },
  checks_in: {
    label: "Hỏi trước khi định",
    effective: true,
    swap: "Kể cả khi bạn nghĩ mình đã biết đáp án, hãy hỏi một câu 'Bạn đang cần gì lúc này?' và nghe câu trả lời.",
    cue: "Bạn thấy mình sắp khuyên, sắp sửa, hoặc sắp kết luận thay người kia.",
  },
  assumes: {
    label: "Kết luận mà chưa hỏi",
    effective: false,
    swap: "Thay vì tự định lý do, hỏi thẳng một câu nhẹ: 'Mình đoán bạn im lặng vì bận, có phải không?'",
    cue: "Bạn bắt đầu dùng 'nó hẳn là' hay 'chắc nó đang' mà không có thêm bằng chứng nào.",
  },
  fixes_too_fast: {
    label: "Sửa quá vội",
    effective: false,
    swap: "Trước khi đưa lời khuyên, hỏi 'Bạn muốn mình nghe, hay muốn mình góp ý?' và đợi câu trả lời.",
    cue: "Người kia mới kể được nửa câu mà đầu bạn đã đang soạn giải pháp.",
  },
  reads_room: {
    label: "Đọc được không khí",
    effective: true,
    swap: "Hãy giữ thói quen quan sát một phút trước khi lên tiếng: không khí thế nào, ai đang căng, và lúc này có nên nói không.",
    cue: "Bạn kịp nhận ra cả nhóm im lặng hoặc đổi chủ đề vào đúng lúc mình chuẩn bị nói.",
  },
  misreads_room: {
    label: "Nói trúng lúc sai",
    effective: false,
    swap: "Trước khi nói, dừng một nhịp và hỏi: chỗ này, lúc này, với những người này, lời đó có nên nói không, và nếu không thì đổi kênh hay đổi giờ.",
    cue: "Bạn thấy mình đang nói trong lúc không khí vừa căng lên, hoặc trong lúc ai đó đang vội.",
  },
  states_need: {
    label: "Nói thẳng điều mình cần",
    effective: true,
    swap: "Hãy tiếp tục dùng khung 'khi… mình thấy… mình mong…' cho những điều quan trọng, và gắn nó vào một việc cụ thể thay vì tính chung.",
    cue: "Bạn thấy mình sắp nói về con người ai đó, kiểu 'bạn lúc nào cũng…', thay vì về một việc cụ thể.",
  },
  hints: {
    label: "Chờ người khác đoán",
    effective: false,
    swap: "Thay vì ám chỉ hay nói mỉa, hãy nói thẳng một câu điều bạn cần, ngắn và rõ.",
    cue: "Bạn đang soạn câu 'tự hiểu đi' hoặc câu mỉa mà mong người kia tự hiểu.",
  },
  blames: {
    label: "Gán hết cho người kia",
    effective: false,
    swap: "Thay vì gán toàn bộ nguyên nhân, nói phần mình trước: 'Mình thấy… và mình cần…', rồi mới nói đến phần việc của họ.",
    cue: "Câu đầu tiên của bạn bắt đầu bằng 'tại bạn' hoặc 'lỗi ở bạn'.",
  },
  repairs: {
    label: "Quay lại hàn gắn",
    effective: true,
    swap: "Hãy giữ việc chủ động nhắn một câu hỏi thăm sau căng thẳng, dù chuyện cũ chưa giải quyết xong.",
    cue: "Bạn thấy mình đã vài ngày không nhắn mà vẫn nghĩ về chuyện đó.",
  },
  people_pleases: {
    label: "Nói có để yên",
    effective: false,
    swap: "Trước khi gật, tự hỏi 'Mình có làm điều này mà không phật ý không?', và nếu không, nói 'để mình xem lịch đã nhé' thay vì 'ừ'.",
    cue: "Bạn thấy mình gật đầu rất nhanh, nhanh hơn cả lúc bạn kịp suy nghĩ.",
  },
  sets_boundary: {
    label: "Giới hạn rõ, giọng bình",
    effective: true,
    swap: "Khi cần giới hạn, hãy nói ngắn và rõ một câu, không cần giải thích dài: 'Lần này mình không thể…'",
    cue: "Bạn thấy mình sắp đồng ý với điều mà mình biết sẽ phải hối sau đó.",
  },
  self_blames: {
    label: "Tự nhận hết về mình",
    effective: false,
    swap: "Thay vì kết luận về bản thân, hãy mô tả một việc cụ thể mình đã làm và một điều mình có thể làm khác lần sau.",
    cue: "Bạn bắt đầu nói 'mình thật tệ' hay 'mình bao giờ cũng thế' cho một chuyện cụ thể.",
  },
}

export const PATTERN_KEYS = Object.keys(EQ_PATTERNS)
