/* eqProfiles.js — nhóm EQ (theo thành phần nổi bật nhất) và ghi chú theo từng thành phần. */

export const EQ_PROFILES = {
  selfAwareness: {
    key: "selfAwareness",
    name: "Người Soi Chiếu",
    en: "The Mirror",
    tagline: "Bạn đọc được cảm xúc của chính mình rất rõ.",
    description:
      "Bạn thường biết mình đang cảm thấy gì và vì sao. Nhờ vậy bạn ít bị cảm xúc kéo đi mà không hay biết.",
    mascot: "selfAwareness",
    quote: { text: "Hiểu mình là khởi đầu của mọi sự thay đổi." },
  },
  selfManagement: {
    key: "selfManagement",
    name: "Người Giữ Nhịp",
    en: "The Anchor",
    tagline: "Bạn giữ được bình tĩnh khi mọi thứ rối lên.",
    description:
      "Khi bị bất ngờ hay bực bội, bạn dừng lại một nhịp rồi mới phản ứng. Bạn chọn cách đáp lại thay vì bốc đồng.",
    mascot: "regulation",
    quote: { text: "Giữa kích thích và phản ứng luôn có một khoảng lặng. Trong khoảng lặng ấy là quyền lựa chọn của bạn." },
  },
  motivation: {
    key: "motivation",
    name: "Người Bền Lửa",
    en: "The Spark",
    tagline: "Thất bại làm bạn chậm lại chứ không làm bạn dừng.",
    description:
      "Bạn tự tìm động lực từ mục tiêu của mình. Vấp ngã xong, bạn rút bài học và đi tiếp.",
    mascot: "communication",
    quote: { text: "Ngã bảy lần, đứng dậy tám lần." },
  },
  empathy: {
    key: "empathy",
    name: "Người Thấu Hiểu",
    en: "The Insider",
    tagline: "Bạn cảm được người khác đang nghĩ gì trước khi họ nói.",
    description:
      "Bạn dễ đặt mình vào vị trí của người khác. Mọi người thường thấy được lắng nghe khi ở cạnh bạn.",
    mascot: "empathy",
    quote: { text: "Muốn hiểu một người, hãy thử đi trong đôi giày của họ một quãng đường." },
  },
  socialSkills: {
    key: "socialSkills",
    name: "Người Kết Nối",
    en: "The Bridge",
    tagline: "Bạn nói rõ điều mình cần mà vẫn giữ được quan hệ.",
    description:
      "Bạn biết cách trao đổi, giữ ranh giới và gỡ va chạm nhẹ nhàng. Nhóm có bạn thường dễ làm việc với nhau hơn.",
    mascot: "relationship",
    quote: { text: "Đi nhanh thì đi một mình, đi xa thì đi cùng nhau." },
  },
}

export const TRAIT_NOTES = {
  selfAwareness: {
    standout: "Bạn nhận ra cảm xúc của mình khá nhanh và biết nó đang thúc đẩy bạn làm gì.",
    upgrade: "Cuối ngày, ghi một dòng: hôm nay mình cảm thấy gì và điều gì gây ra nó.",
  },
  selfManagement: {
    standout: "Bạn giữ được bình tĩnh và phản ứng có chủ đích khi gặp chuyện bất ngờ.",
    upgrade: "Khi bực, hít vào bốn nhịp, thở ra sáu nhịp rồi hãy trả lời tin nhắn hay lên tiếng.",
  },
  motivation: {
    standout: "Bạn tự đứng dậy sau thất bại và tiếp tục theo mục tiêu của mình.",
    upgrade: "Chia mục tiêu lớn thành bước nhỏ trong tuần và tự thưởng mình sau mỗi bước hoàn thành.",
  },
  empathy: {
    standout: "Bạn nhạy với cảm xúc của người khác và hiểu họ trước khi phản ứng.",
    upgrade: "Trước khi góp ý, hỏi một câu: Bạn đang thấy thế nào về chuyện này?",
  },
  socialSkills: {
    standout: "Bạn diễn đạt rõ điều mình cần và xử lý va chạm mà vẫn giữ được quan hệ.",
    upgrade: "Tập nói theo mẫu: Khi... mình thấy..., mình mong... thay vì trách người kia.",
  },
}

export const PRACTICE_SKILL = {
  selfAwareness: "selfAwareness",
  selfManagement: "selfManagement",
  motivation: "motivation",
  empathy: "empathy",
  socialSkills: "socialSkills",
}
