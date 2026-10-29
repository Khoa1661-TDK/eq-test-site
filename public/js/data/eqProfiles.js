/* eqProfiles.js — 10 EQ profile của E-Quest (nội dung chép nguyên văn từ tài liệu "Bảng nội dung 10 EQ Profiles").
   Mỗi đáp án trong data/questBank.js gắn với đúng một profile qua trường `profile`; profile có nhiều đáp án
   nhất sau 10 tình huống là kết quả chính (xem core/questScoring.js).
   abbr: tên viết tắt (chữ cái đầu của tên tiếng Anh, tính cả "The"), hiện cạnh tên: The Steady Navigator (TSN).
   avatar: key trong data/mascots.js. keys: 3 câu "Chìa khóa mở khóa EQ", mỗi lần xem hiện một câu.
   Đây là công cụ tự khám phá xu hướng phản ứng, không phải nhãn tính cách cố định hay chẩn đoán. */

export const EQ_PROFILES = {
  steadyNavigator: {
    key: "steadyNavigator",
    en: "The Steady Navigator",
    abbr: "TSN",
    name: "Người vững vàng",
    avatar: "steadyNavigator",
    description: "Bình tĩnh, cân nhắc trước khi phản ứng và cố gắng nhìn nhận vấn đề thực tế.",
    strengths: "Giữ bình tĩnh dưới áp lực, suy xét tình huống và kiểm soát phản ứng.",
    levelUp: "Thể hiện cảm xúc thật và chấp nhận rằng không phải mọi tình huống đều có thể kiểm soát.",
    keys: [
      "Bạn không cần kiểm soát mọi con sóng để học cách chèo lái.",
      "Bình tĩnh không có nghĩa là không cảm nhận, mà là biết cách đối diện với cảm xúc.",
      "Bạn có thể vững vàng mà vẫn cho phép mình yếu lòng.",
    ],
  },
  bridgeBuilder: {
    key: "bridgeBuilder",
    en: "The Bridge Builder",
    abbr: "TBB",
    name: "Người kết nối",
    avatar: "bridgeBuilder",
    description: "Quan tâm đến cảm xúc của người khác, tìm kiếm tiếng nói chung và muốn mọi người hiểu nhau.",
    strengths: "Đồng cảm, lắng nghe và giải quyết bất đồng theo hướng xây dựng.",
    levelUp: "Tôn trọng sự khác biệt, đặt giới hạn và không tự tạo áp lực phải làm hài lòng tất cả mọi người.",
    keys: [
      "Thấu hiểu không có nghĩa là phải đồng tình với tất cả.",
      "Bạn có thể xây cầu nối mà không cần gánh tất cả mọi người qua sông.",
      "Hãy lắng nghe để thấu hiểu, không chỉ để đáp lời.",
    ],
  },
  boldInitiator: {
    key: "boldInitiator",
    en: "The Bold Initiator",
    abbr: "TBI",
    name: "Người tiên phong",
    avatar: "boldInitiator",
    description: "Chủ động bắt đầu, sẵn sàng thử thách và tìm cách tiến lên khi gặp vấn đề.",
    strengths: "Chủ động hành động, đón nhận thử thách và đưa ra quyết định.",
    levelUp: "Cân nhắc rủi ro, kiên nhẫn và tiếp thu góc nhìn của người khác trước khi hành động.",
    keys: [
      "Bạn không cần biết hết mọi thứ mới có thể bắt đầu.",
      "Can đảm không phải là chắc chắn thành công, mà là vẫn dám thử sức.",
      "Hãy tự tin dẫn bước và khiêm tốn để trưởng thành.",
    ],
  },
  quietObserver: {
    key: "quietObserver",
    en: "The Quiet Observer",
    abbr: "TQO",
    name: "Người quan sát thầm lặng",
    avatar: "quietObserver",
    description: "Thường quan sát và tìm hiểu tình hình trước khi tham gia hoặc lên tiếng.",
    strengths: "Quan sát chi tiết, suy nghĩ độc lập và phân tích tình huống trước khi phản ứng.",
    levelUp: "Chủ động giao tiếp, thể hiện quan điểm và tham gia tương tác khi cần thiết.",
    keys: [
      "Bạn không cần là người nói nhiều nhất để tạo nên sự khác biệt.",
      "Suy nghĩ của bạn cũng xứng đáng được lắng nghe.",
      "Hãy dành thời gian quan sát, nhưng đừng quên bước vào cuộc trò chuyện.",
    ],
  },
  kindAccommodator: {
    key: "kindAccommodator",
    en: "The Kind Accommodator",
    abbr: "TKA",
    name: "Người luôn nghĩ cho người khác",
    avatar: "kindAccommodator",
    description: "Dễ ưu tiên nhu cầu và cảm xúc của người khác, đôi khi chấp nhận thiệt thòi để tránh làm mất lòng.",
    strengths: "Quan tâm, hỗ trợ người khác và duy trì sự hòa hợp trong các mối quan hệ.",
    levelUp: "Từ chối một cách khéo léo, thiết lập ranh giới cá nhân và tôn trọng nhu cầu của bản thân.",
    keys: [
      "Bạn có thể tử tế mà không cần đồng ý với tất cả mọi điều.",
      "Nhu cầu của bạn cũng quan trọng, ngay cả khi người khác cần đến bạn.",
      "Đôi khi, biết nói không với người khác chính là biết nói có với bản thân.",
    ],
  },
  midnightThinker: {
    key: "midnightThinker",
    en: "The Midnight Thinker",
    abbr: "TMT",
    name: "Người hay suy tư",
    avatar: "midnightThinker",
    description: "Có xu hướng suy nghĩ đi suy nghĩ lại, lo lắng về kết quả hoặc cách người khác đánh giá mình.",
    strengths: "Tự nhìn nhận, cân nhắc hậu quả và chú ý đến những chi tiết dễ bị bỏ qua.",
    levelUp: "Quản lý lo lắng, giảm tự chỉ trích và chuyển từ suy nghĩ sang hành động cụ thể.",
    keys: [
      "Không phải suy nghĩ nào cũng cần bạn bận tâm, không phải nỗi sợ nào cũng sẽ thành hiện thực.",
      "Bạn được phép bắt đầu ngay cả khi chưa hiểu rõ mọi thứ.",
      "Một bước nhỏ về phía trước có giá trị hơn hàng nghìn kế hoạch hoàn hảo.",
    ],
  },
  directCommunicator: {
    key: "directCommunicator",
    en: "The Direct Communicator",
    abbr: "TDC",
    name: "Người thẳng thắn",
    avatar: "directCommunicator",
    description: "Thích nói rõ suy nghĩ, nêu vấn đề trực tiếp và không ngại bảo vệ quan điểm.",
    strengths: "Giao tiếp rõ ràng, bày tỏ quan điểm và bảo vệ lập trường.",
    levelUp: "Điều chỉnh cách diễn đạt, lắng nghe chủ động và cân nhắc cảm xúc của người đối diện.",
    keys: [
      "Sự chân thành có sức mạnh, nhưng lòng tử tế mới khiến nó trở nên ý nghĩa.",
      "Bạn có thể giữ vững lập trường mà không cần đối đầu với tất cả mọi người.",
      "Mục tiêu không chỉ là được lắng nghe, mà còn là được thấu hiểu.",
    ],
  },
  quickReactor: {
    key: "quickReactor",
    en: "The Quick Reactor",
    abbr: "TQR",
    name: "Người phản ứng nhanh",
    avatar: "quickReactor",
    description: "Phản ứng nhanh và mạnh khi cảm thấy tức giận, bất công hoặc bị thách thức.",
    strengths: "Nhận biết điều khiến bản thân khó chịu, thể hiện cảm xúc rõ ràng và bảo vệ quan điểm cá nhân.",
    levelUp: "Điều chỉnh phản ứng cảm xúc, kiểm soát sự bốc đồng và bình tĩnh trước khi đưa ra phản hồi.",
    keys: [
      "Bạn không phải lúc nào cũng chọn được cảm xúc, nhưng có thể lựa chọn cách phản ứng.",
      "Dừng lại một chút không phải là yếu đuối, mà là sức mạnh biết kiểm soát.",
      "Hãy lắng nghe cảm xúc, nhưng đừng để chúng quyết định mọi thứ thay bạn.",
    ],
  },
  emotionKeeper: {
    key: "emotionKeeper",
    en: "The Emotion Keeper",
    abbr: "TEK",
    name: "Người giữ cảm xúc trong lòng",
    avatar: "emotionKeeper",
    description: "Có thể trải qua cảm xúc mạnh nhưng thường giữ trong lòng, im lặng hoặc rút lui thay vì nói ra.",
    strengths: "Tự suy ngẫm, quan sát cảm xúc bên trong và tránh phản ứng bộc phát trong nhiều tình huống.",
    levelUp: "Nhận diện cảm xúc, diễn đạt nhu cầu cá nhân và tìm kiếm sự hỗ trợ khi cần thiết.",
    keys: [
      "Mạnh mẽ không có nghĩa là phải âm thầm chịu đựng mọi thứ.",
      "Cảm xúc của bạn không phải gánh nặng, mà là một phần câu chuyện của bạn.",
      "Bạn cũng xứng đáng được thấu hiểu, chứ không chỉ luôn là người thấu hiểu người khác.",
    ],
  },
  lastMinuteSprinter: {
    key: "lastMinuteSprinter",
    en: "The Last-Minute Sprinter",
    abbr: "TLMS",
    name: "Người chạy nước rút phút cuối",
    avatar: "lastMinuteSprinter",
    description: "Thường trì hoãn việc bắt đầu, khó chia nhỏ nhiệm vụ hoặc chỉ bắt tay làm khi thời hạn đến gần.",
    strengths: "Tập trung trong thời gian ngắn, xoay xở khi gặp áp lực và tìm cách hoàn thành nhiệm vụ gấp.",
    levelUp: "Quản lý thời gian, chia nhỏ công việc và xây dựng thói quen bắt đầu sớm.",
    keys: [
      "Bạn không nhất thiết phải có động lực mới bắt đầu; đôi khi, chính việc bắt đầu tạo ra động lực.",
      "Tiến bộ bắt đầu khi bạn ngừng chờ đợi thời điểm hoàn hảo.",
      "Phiên bản tương lai của bạn sẽ biết ơn bước đi nhỏ mà bạn thực hiện hôm nay.",
    ],
  },
}

/** Thứ tự cố định của 10 profile: dùng để phá thế hoà cuối cùng và để hiển thị thư viện. */
export const EQ_PROFILE_KEYS = Object.keys(EQ_PROFILES)
