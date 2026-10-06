// Sáu kỹ năng trí tuệ cảm xúc (EQ) dành cho học sinh cấp 3 và sinh viên.
// Mỗi kỹ năng là thứ bạn có thể luyện và nó đổi theo tình huống,
// không dùng để dán nhãn hay kết luận cố định về con người bạn.

export const EQ_DIMENSIONS = [
  {
    key: "selfAwareness",
    code: "NB",
    name: "Tự nhận thức",
    tagline: "Gọi đúng tên cảm xúc, biết nó mạnh cỡ nào và đến từ đâu.",
    question: "Lúc này bạn đang cảm thấy gì, mạnh đến mức nào, và điều gì đã châm ngòi cho nó?",
    includes: [
      "Nhận ra và gọi tên cảm xúc ngay khi nó vừa xuất hiện",
      "Đo mức độ mạnh yếu thay vì nói chung chung là 'mệt' hay 'khó chịu'",
      "Truy ngược ra ngòi nổ thật sự đứng sau cảm xúc",
      "Nhận ra khi trong lòng trộn nhiều cảm xúc, và tách ý nghĩ khỏi cảm xúc",
    ],
    bands: {
      high: {
        label: "Rõ ràng và nhạy",
        meaning: "Bạn thường nhận ra cảm xúc của mình khá sớm, gọi được tên, biết nó mạnh cỡ nào và truy ra được nó đến từ đâu. Bạn cũng nhận ra khi trong lòng vừa tức vừa tủi cùng lúc, và phân biệt được điều mình quan sát với điều mình suy ra. Kỹ năng này vẫn đổi theo tình huống: khi mệt hoặc bị dồn ép, bạn sẽ thấy khó rõ hơn một chút.",
        examples: [
          "Trong buổi thuyết trình nhóm, bạn nhận ra tim đập nhanh là do lo, không phải do hứng thú.",
          "Khi bị bỏ ra khỏi nhóm chung của lớp, bạn gọi được tên cảm giác đó là tủi thân, biết nó mới ở mức 4/10 và thấy nó đến từ chuyện bị quên, không phải vì mình kém.",
        ],
      },
      mid: {
        label: "Biết nhưng còn mơ hồ",
        meaning: "Bạn nhận ra là mình đang có chuyện, nhưng thường chỉ nói được chung chung kiểu 'thấy khó chịu' hoặc 'thấy mệt'. Khi trong lòng có nhiều thứ trộn lẫn, bạn dễ chọn đại một cảm xúc để giải thích cho tất cả, và hay nhầm giữa điều đã xảy ra với điều mình đang nghĩ. Chuyện này rất phổ biến, và luyện tập đều đặn sẽ giúp bạn rõ hơn nhiều.",
        examples: [
          "Bạn cáu với bạn cùng phòng cả buổi mà đến tối mới biết đó là do bực chuyện điểm kiểm tra.",
          "Bạn tự nói 'mình ổn', nhưng trong đầu đang lặp đi lặp lại câu 'nó coi thường mình' mà chưa tách được đâu là điều đã xảy ra, đâu là điều mình suy ra.",
        ],
      },
      low: {
        label: "Còn lướt qua chính mình",
        meaning: "Bạn hay chỉ phát hiện ra cảm xúc khi nó đã quá mạnh, hoặc khi người xung quanh nhắc. Bạn dễ gán nguyên nhân cho người gần nhất có mặt, trong khi ngòi nổ thật sự nằm ở chuyện khác từ sáng. Đây không phải điều cố định về bạn, chỉ là kỹ năng bạn chưa luyện nhiều, và nó bắt đầu rõ lên từ những lần dừng lại rất ngắn.",
        examples: [
          "Bạn nhận ra mình đã quá tải sau khi trả lời cộc lốc cả nhóm và bỏ luôn buổi học nhóm.",
          "Bạn gắt với em mình vì một chuyện nhỏ, trong khi cả ngày đang lo về học phí kỳ tới, và chỉ hiểu ra khi bố mẹ hỏi.",
        ],
      },
    },
    exercises: [
      {
        name: "Gọi tên cảm xúc trong 60 giây",
        how: "Ba lần mỗi ngày, dừng lại và tự hỏi: lúc này mình đang cảm thấy gì? Viết ra một từ chính xác kèm một con số từ 1 đến 10, cố đừng dùng chữ chung chung như 'mệt' hay 'khó chịu'. Nếu bí, chọn giữa vui, buồn, tức, sợ, lo, ngạc nhiên, xấu hổ, tủi thân, ghen tị, nhẹ nhõm. Sau một tuần, xem lại xem từ mức nào thì bạn bắt đầu khó giữ bình tĩnh.",
        why: "Vốn từ cảm xúc càng rộng và bạn càng quen đo mức, bạn càng gọi đúng tên được thứ mình đang trải qua.",
      },
      {
        name: "Quét tín hiệu cơ thể",
        how: "Khi thấy có gì đó lạ, quét từ đầu xuống: hàm có siết không, vai có cứng không, bụng có nặng không, hơi thở có nông không. Ghi lại cảm xúc đi kèm những tín hiệu lặp đi lặp lại nhiều lần. Làm vài lần bạn sẽ có bản đồ riêng, biết trước tín hiệu nào báo hiệu cảm xúc nào.",
        why: "Cơ thể thường báo trước khi bạn kịp ý thức được là mình đang có cảm xúc gì.",
      },
      {
        name: "Truy ngòi nổ ba lớp",
        how: "Khi có cảm xúc, hỏi ba lần: chuyện gì vừa xảy ra, điều đó nghĩa gì với mình, và mình đang sợ mất điều gì. Ghi lại câu trả lời thứ ba vì đó thường là gốc. Nếu câu thứ ba vẫn còn chung chung, hỏi thêm một lần nữa.",
        why: "Cảm xúc mạnh thường không đến từ chuyện vừa xảy ra mà từ điều ta sợ mất.",
      },
      {
        name: "Vẽ hai cảm xúc cùng lúc",
        how: "Khi thấy rối, thử đặt hai cảm xúc cạnh nhau: ví dụ vui vì được khen và khó chịu vì phần mình làm bị bỏ qua. Cho mỗi cảm xúc một mức từ 1 đến 10. Xem cả hai có cùng đến từ một sự việc hay không.",
        why: "Cho phép mình có nhiều cảm xúc cùng lúc giúp bạn không phải chọn một rồi phủ nhận phần còn lại.",
      },
      {
        name: "Ý nghĩ hay cảm xúc",
        how: "Viết một câu bạn đang nghĩ trong đầu, ví dụ 'nó coi thường mình'. Tự hỏi: đây là sự thật đã xảy ra, hay chỉ là cách mình đang hiểu. Đổi câu đó thành mô tả điều quan sát được, rồi để ý xem cảm xúc thay đổi thế nào.",
        why: "Tách ý nghĩ khỏi cảm xúc giúp bạn không biến phỏng đoán thành sự thật.",
      },
    ],
  },
  {
    key: "regulation",
    code: "ĐC",
    name: "Điều chỉnh cảm xúc",
    tagline: "Chọn cách phản ứng thay vì để cảm xúc tự lái.",
    question: "Khi cảm xúc dâng lên, bạn giữ được quyền chọn cách mình sẽ hành động không?",
    includes: [
      "Dừng lại đủ lâu để không nói hoặc làm ngay",
      "Đổi cách nhìn để cơn cảm xúc nhẹ đi",
      "Tách cảm giác ra khỏi hành động",
      "Chọn lúc nào nên xử lý và lúc nào nên chờ",
    ],
    bands: {
      high: {
        label: "Giữ được tay lái",
        meaning: "Bạn thường kịp nhận ra cơn cảm xúc trước khi nó điều khiển hành động của mình. Bạn biết cách đổi cách nhìn để bớt căng, và có những khoảng dừng đã thành thói quen. Không phải lúc nào cũng vậy, có hôm bạn vẫn bùng lên, và điều đó là bình thường.",
        examples: [
          "Bạn đọc tin nhắn khiến mình tức, cất điện thoại 10 phút rồi mới trả lời bằng một câu nói rõ điều mình muốn.",
          "Khi bạn nhóm trễ hẹn lần thứ ba, bạn nói thẳng về việc bạn cần đúng giờ thay vì đăng trạng thái than thở.",
        ],
      },
      mid: {
        label: "Có lúc giữ được",
        meaning: "Bạn biết mình nên dừng lại, nhưng chỉ làm được khi cơn cảm xúc chưa quá mạnh. Lúc bị dồn ép hoặc đang mệt, bạn dễ phản ứng ngay rồi hối hận sau đó. Bạn đã có ý thức, phần còn lại là luyện cho khoảng dừng ngắn trở thành phản xạ.",
        examples: [
          "Bạn giữ được bình tĩnh khi bị góp ý trong nhóm, nhưng lại nổi nóng khi bố mẹ nhắc chuyện học.",
          "Bạn biết nên chờ rồi mới nhắn lại, nhưng vẫn bấm gửi vì sợ im lặng là thua.",
        ],
      },
      low: {
        label: "Cảm xúc đi trước",
        meaning: "Bạn thường nói hoặc làm ngay khi cảm xúc vừa dâng, rồi mới thấy hối. Bạn hay nói 'tại nó chọc mình trước' vì lúc đó cảm giác như mình không còn lựa chọn nào khác. Kỹ năng này có thể luyện bằng những khoảng dừng rất ngắn, bắt đầu từ vài giây.",
        examples: [
          "Bạn trả lời cộc trong nhóm lớp rồi phải nhắn riêng xin lỗi cả nhóm.",
          "Bạn đứng dậy bỏ ra khỏi buổi học nhóm, và tối đó không muốn mở lại cuộc trò chuyện.",
        ],
      },
    },
    exercises: [
      {
        name: "Bốn bước khi cơn tới",
        how: "Dừng lại và thở một hơi dài. Gọi tên cảm xúc rồi cho nó một mức trên 10. Chỉ ra ngòi nổ thật sự. Sau đó chọn một hành động cụ thể cho mười phút tới, ví dụ đi rửa mặt hoặc viết tin nhắn nháp nhưng chưa gửi.",
        why: "Bốn bước ngắn này biến cơn cảm xúc từ chỗ tự lái thành chỗ bạn cầm lái.",
      },
      {
        name: "Đổi cách nhìn",
        how: "Khi một chuyện làm bạn cáu, viết ra cách hiểu hiện tại của mình. Rồi buộc mình viết thêm hai cách hiểu khác mà vẫn hợp lý, ví dụ bạn kia im lặng vì mệt chứ không phải vì coi thường bạn. Chọn cách hiểu bớt đau nhưng không tự lừa mình.",
        why: "Cùng một chuyện, cách hiểu khác nhau sẽ cho ra cảm xúc rất khác nhau.",
      },
      {
        name: "Chờ 90 giây",
        how: "Khi vừa bị chạm vào chỗ nhạy, đặt đồng hồ 90 giây và không nói, không nhắn, không quyết định gì. Chỉ để ý hơi thở và cơn sóng trong người đang đi lên rồi bắt đầu xuống. Hết giờ mới cân nhắc làm gì tiếp.",
        why: "Cơn cảm xúc dữ dội thường tự hạ xuống sau khoảng một phút rưỡi nếu bạn không tiếp thêm dầu.",
      },
      {
        name: "Tách cảm giác khỏi hành động",
        how: "Viết hai cột: cột một là điều bạn đang cảm thấy, cột hai là điều bạn có thể làm. Nối chúng bằng chữ 'nhưng' thay vì chữ 'nên', ví dụ 'mình đang tức nhưng mình chưa cần nói ngay'. Chọn một hành động ở cột hai mà sau này bạn không phải hối.",
        why: "Cảm giác nào cũng có thật, nhưng không phải cảm giác nào cũng cần biến thành hành động.",
      },
      {
        name: "Xử lý bây giờ hay để sau",
        how: "Với mỗi chuyện đang nóng, hỏi ba điều: nói lúc này có giúp giải quyết không, người kia có đang đủ bình tĩnh để nghe không, và mình đang nói vì muốn hiểu hay vì muốn thắng. Nếu có hai câu trả lời là không, hẹn một thời điểm cụ thể để nói lại.",
        why: "Chọn đúng thời điểm quan trọng gần bằng chọn đúng lời.",
      },
    ],
  },
  {
    key: "empathy",
    code: "PT",
    name: "Đồng cảm",
    tagline: "Thử đứng ở chỗ người kia rồi nhìn lại.",
    question: "Nếu đứng ở vị trí người kia, chuyện này trông ra sao và họ đang cần điều gì?",
    includes: [
      "Thử nhìn sự việc từ vị trí của người kia",
      "Tách điều quan sát được khỏi điều mình suy đoán",
      "Hỏi người kia cần gì trước khi cho lời khuyên",
      "Công nhận cảm xúc của họ mà không phải đồng ý hết",
    ],
    bands: {
      high: {
        label: "Hay nhìn từ phía người kia",
        meaning: "Bạn thường tự hỏi chuyện này trông thế nào từ phía người kia trước khi kết luận. Bạn phân biệt được điều mình thấy và điều mình phỏng đoán, nên ít khi gán ý xấu cho người khác. Bạn cũng biết công nhận cảm xúc của họ mà không cần đồng ý với mọi thứ họ làm. Dĩ nhiên có những lúc bạn vẫn kết luận vội, nhất là khi đang bực, và đó là lúc kỹ năng này cần được luyện thêm.",
        examples: [
          "Khi bạn cùng nhóm nộp bài trễ, bạn hỏi tuần này họ có chuyện gì thay vì kết luận họ lười.",
          "Bạn nhắn cho đứa bạn đang buồn: 'Tao ở đây, mày muốn kể hay muốn tao ngồi im cùng mày?'",
        ],
      },
      mid: {
        label: "Hiểu nhưng vội kết luận",
        meaning: "Bạn thật sự muốn hiểu người khác và thường đoán khá đúng. Nhưng khi đang bực hoặc đang vội, bạn dễ biến phỏng đoán thành sự thật và nhảy vào khuyên trước khi hỏi. Điều này làm người kia thấy bị đánh giá dù ý bạn là tốt. Tốt hơn sẽ đến khi bạn tập thói quen hỏi một câu trước khi kết luận.",
        examples: [
          "Bạn thấy bạn mình im lặng trong nhóm lớp và nghĩ ngay là nó đang giận mình.",
          "Bạn đưa ra ba lời khuyên cho đứa bạn vừa bị điểm kém, rồi mới nhận ra nó chỉ cần được ngồi yên một lúc.",
        ],
      },
      low: {
        label: "Thiên về phía mình",
        meaning: "Khi có chuyện, bạn thường nhìn từ chỗ mình đứng trước tiên, nên dễ thấy người khác đang nhắm vào mình. Bạn cũng hay khuyên ngay khi thấy ai đó buồn, vì bạn thật lòng muốn giúp. Cả hai điều này đều sửa được bằng một câu hỏi trước khi kết luận, và sẽ rõ dần khi bạn luyện đều.",
        examples: [
          "Bạn và bạn thân cùng nộp bài, bạn kia được khen còn bạn thì không, và bạn thấy như bị coi thường.",
          "Bạn nhắn liên tục cho người đang bận, vì với bạn im lặng nghĩa là đang có chuyện.",
        ],
      },
    },
    exercises: [
      {
        name: "Đổi chỗ trong một chuyện thật",
        how: "Chọn một chuyện đang khó chịu với ai đó. Viết nửa trang về chuyện đó từ vị trí của họ: họ đang sợ gì, đang muốn gì, đang thấy mình bị hiểu sai ở đâu. Đừng viết cho đúng, viết cho có thể. Sau đó đánh dấu ba câu bạn chưa chắc và hỏi lại họ.",
        why: "Tự viết ra sẽ buộc bạn nhìn thấy những điều không xuất hiện khi chỉ ngồi nghĩ trong đầu.",
      },
      {
        name: "Quan sát và phỏng đoán",
        how: "Khi bực ai đó, kẻ hai cột. Cột quan sát chỉ ghi điều bạn thật sự thấy hoặc nghe, ví dụ 'nó không trả lời tin nhắn hai ngày'. Cột phỏng đoán ghi điều bạn đang suy ra, ví dụ 'nó coi thường mình'. Tự hỏi cột thứ hai có bằng chứng nào khác không.",
        why: "Hầu hết hiểu lầm bắt đầu từ chỗ ta đọc phỏng đoán như đọc sự thật.",
      },
      {
        name: "Hỏi trước khi khuyên",
        how: "Khi thấy ai đó đang có chuyện, câu đầu tiên thay vì lời khuyên hãy là: bạn muốn mình nghe thôi hay muốn mình góp ý. Nếu họ chỉ muốn kể, ngồi nghe và đừng sửa gì. Chỉ đưa lời khuyên khi họ nói là muốn nghe.",
        why: "Người đang buồn thường cần được nghe trước khi cần được chỉ cách.",
      },
      {
        name: "Công nhận mà không đồng ý",
        how: "Tập nói câu công nhận cảm xúc mà không phải đồng ý hành động, ví dụ 'mình hiểu vì sao bạn thấy bị bỏ rơi, nhưng mình vẫn không thấy ổn với cách bạn nói lúc đó'. Nói thành hai câu riêng, đừng trộn thành một câu 'nhưng'. Làm vài lần để quen.",
        why: "Hiểu và đồng ý là hai chuyện khác nhau, tách được thì bạn vừa gần người kia vừa giữ được giới hạn.",
      },
      {
        name: "Đọc điều chưa nói ra",
        how: "Trong một cuộc trò chuyện, để ý những chỗ người kia nói lướt qua hoặc đổi chủ đề. Viết ra một phỏng đoán về điều họ chưa nói, ví dụ họ sợ bị bỏ lại. Rồi kiểm tra bằng một câu nhẹ nhàng, không khẳng định, và chấp nhận nếu họ nói mình đoán sai.",
        why: "Đồng cảm chính xác đến từ việc kiểm tra phỏng đoán, không phải từ việc đoán giỏi.",
      },
    ],
  },
  {
    key: "socialAwareness",
    code: "XH",
    name: "Nhận biết xã hội",
    tagline: "Đọc được không khí, quy tắc ngầm và thời điểm của cả nhóm.",
    question: "Trong nhóm này lúc này: không khí ra sao, ai đang căng, và lúc này có nên nói điều đó không?",
    includes: [
      "Cảm nhận không khí của nhóm hoặc phòng học ngay khi vào cuộc",
      "Thấy những quy tắc ngầm mà không ai nói ra",
      "Nhận ra ai đang có nhiều ảnh hưởng, ai đang bị bỏ ngoài lề",
      "Chọn đúng lúc, đúng nơi để nói một điều nhạy cảm",
    ],
    bands: {
      high: {
        label: "Đọc được cả căn phòng",
        meaning: "Bạn thường nhận ra không khí của nhóm trước khi nó lộ ra thành lời: ai đang căng, ai đang bị bỏ ngoài lề, và lúc nào nên nói điều nhạy cảm. Bạn cũng để ý được những quy tắc ngầm mà không ai nói ra, nên bạn ít khi làm người khác bất ngờ. Khi mệt hoặc ở môi trường mới, bạn cũng có thể bỏ sót tín hiệu, và bạn sẽ đọc tốt dần lên theo luyện tập.",
        examples: [
          "Bạn nhận ra cả lớp đang mệt sau tiết kiểm tra, nên giữ câu hỏi phản biện lại cho giờ ra chơi.",
          "Trong nhóm chat lớp, bạn thấy không khí bắt đầu căng về cách chia việc, nên chủ động đề nghị gặp trực tiếp thay vì tranh luận thêm bằng tin nhắn.",
        ],
      },
      mid: {
        label: "Thấy khi cố nhìn",
        meaning: "Bạn đọc được không khí khi bạn nhớ để ý, nhưng đến lúc đang bận hoặc đang bực, bạn dễ nói thẳng mà quên hỏi xem phòng này đang sẵn sàng chưa. Bạn cũng hay nhận ra sau khi có chuyện là mình vừa bỏ sót một người im lặng ở rìa. Phần này tiến bộ nhanh nếu bạn tập quan sát có chủ đích.",
        examples: [
          "Bạn đưa ý kiến hay trong lúc cả nhóm đang tức tối, và nó bị hiểu là bạn đang đứng về phe kia.",
          "Bạn phát hiện ra đứa bạn trong nhóm luôn im lặng khi được hỏi, nhưng chỉ nhận ra sau khi buổi họp đã kết thúc.",
        ],
      },
      low: {
        label: "Dễ nói trúng lúc sai",
        meaning: "Bạn thường tập trung vào lời mình muốn nói hơn là vào phòng đang nghe lời đó: không khí ra sao, ai đang căng, và lúc này có nên nói không. Kết quả là bạn hay nói chuyện đúng vào lúc nó dễ bị hiểu sai nhất, rồi mới hiểu ra là chỗ và giờ không hợp. Đây là kỹ năng luyện được, và nó bắt đầu từ một phút quan sát trước khi lên tiếng.",
        examples: [
          "Bạn kể chuyện buồn của mình trước cả lớp khi ai cũng đang chuẩn bị vào bài, và cảm giác như không ai nghe.",
          "Bạn gửi tin nhắn dài vào nhóm chat lúc mười một giờ đêm, và sáng hôm sau nó được đọc như một lời tuyên bố.",
        ],
      },
    },
    exercises: [
      {
        name: "Một phút chỉ quan sát",
        how: "Trong một buổi họp nhóm hoặc hoạt động của lớp, dành phút đầu chỉ quan sát mà không nói: ai im lặng, ai khoanh tay, ai nói nhiều, không khí đang căng hay lỏng. Ghi lại một điều bạn nhận ra, ví dụ 'cô giáo im lặng nhưng cả nhóm đều ngó sang cô mỗi khi căng'. Làm với hai nhóm khác nhau trong tuần để so sánh.",
        why: "Không khí thường cho biết điều cần biết trước khi bất kỳ ai mở miệng.",
      },
      {
        name: "Đường leo thang của nhóm",
        how: "Chọn một chuyện đang căng trong nhóm, viết ra ba mốc: hôm nay, sau ba ngày nữa nếu không ai nói gì, và sau hai tuần. Ở mỗi mốc ghi một câu về điều sẽ xảy ra với cả nhóm, không chỉ với bạn. Đọc lại rồi chọn một việc nhỏ để làm ngay trong hôm nay.",
        why: "Nhìn thấy trước chuyện sẽ đi tới đâu giúp bạn chọn thời điểm can thiệp khi mọi thứ còn dễ sửa.",
      },
      {
        name: "Bản đồ quy tắc ngầm",
        how: "Chọn một nhóm bạn hay ở, viết ra những quy tắc không ai nói ra: giờ nào không nên nhắn, ai là người quyết định, chuyện gì nói trước lớp thì ổn còn nói trong nhóm thì không. Kiểm tra lại với một người tin cậy xem bạn có đọc đúng không. Cập nhật bản đồ khi thấy quy tắc thay đổi, vì nó không đứng yên.",
        why: "Nhiều hiểu lầm đến từ chỗ mỗi người chơi theo một bộ luật mà không ai nói thành tiếng.",
      },
      {
        name: "Người đang ở rìa",
        how: "Trong lần tới cả nhóm đi chơi hay làm việc chung, để ý người ít nói nhất và người luôn nói nhiều. Tìm cách đưa người ở rìa vào bằng một câu hỏi mở mà chỉ họ mới trả lời được. Cuối buổi tự hỏi: mình có vô tình để ai đó chỉ ngồi nghe không.",
        why: "Một nhóm chỉ hoạt động tốt khi mỗi người trong đó có chỗ để lên tiếng.",
      },
      {
        name: "Chọn kênh, chọn giờ",
        how: "Trước khi nói một điều nhạy cảm với nhóm, dừng lại và hỏi: không khí lúc này có đang sẵn sàng không, và nói trước cả nhóm hay nói riêng thì hợp hơn. Chọn một kênh và một thời điểm cụ thể thay vì 'để hôm nào'. Nếu thấy ai đó trong nhóm đang bận hoặc đang bực, chọn lúc khác, lời đó sẽ được nghe tốt hơn.",
        why: "Cùng một lời, nói đúng chỗ và đúng lúc thì nhóm nghe, nói sai chỗ thì thành tấn công.",
      },
    ],
  },
  {
    key: "communication",
    code: "GT",
    name: "Giao tiếp",
    tagline: "Nói một lần cho rõ điều mình cần, và nghe cho đúng điều họ nói.",
    question: "Điều bạn cần nói lần này có đến được với người kia, và bạn có hiểu đúng điều họ vừa nói không?",
    includes: [
      "Nói điều mình cần theo khung 'khi… mình thấy… mình mong…' mà không đổ lỗi",
      "Chọn đúng kênh và thời điểm cho một lời quan trọng",
      "Nghe xong rồi phản hồi, và hỏi lại để chắc mình hiểu đúng",
      "Cho và nhận góp ý về một việc cụ thể",
    ],
    bands: {
      high: {
        label: "Nói trúng, nghe trúng",
        meaning: "Bạn nói được điều mình cần trong một cuộc trao đổi mà không biến nó thành lời trách, thường theo kiểu 'khi… mình thấy… mình mong…'. Bạn cũng nghe xong rồi mới phản hồi, và hay hỏi lại để chắc mình hiểu đúng thay vì tự đoán. Khả năng này vẫn phụ thuộc vào tình huống: khi bạn mệt hoặc tức, câu chữ của bạn cũng dễ gắt hơn.",
        examples: [
          "Bạn nói với bạn nhóm: 'Khi phần việc của mình được chia sau chót, mình thấy lo không kịp, mình mong lần sau nhận việc trước hai ngày.'",
          "Khi bạn thân kể chuyện với bố mẹ, bạn nghe xong rồi hỏi: 'Bạn cần mình nghe thôi, hay cần mình góp ý?' thay vì nhảy vào khuyên ngay.",
        ],
      },
      mid: {
        label: "Biết nói, nhưng vội",
        meaning: "Bạn hiểu mình cần nói điều gì, nhưng câu đầu tiên thường tuột ra thành lời trách trước khi kịp chọn cách nói. Khi nghe, bạn hay chen vào bằng câu chuyện của mình hoặc bằng giải pháp, nên người kia chỉ được nghe một nửa. Cả hai đều luyện được, bắt đầu từ việc viết sẵn câu nói và chờ hết câu của người kia.",
        examples: [
          "Bạn định nói điều mình cần, nhưng câu đầu tiên thành 'Sao lần nào cũng là tao làm hết', và thế là người kia phòng thủ ngay.",
          "Bạn nghe bạn kể chuyện mà trong đầu đang soạn câu trả lời, nên bạn lỡ mất nửa sau của câu chuyện.",
        ],
      },
      low: {
        label: "Nói thì cụt, nghe thì lệch",
        meaning: "Bạn hay không nói điều mình cần vì ngại, rồi để nó tích thành ấm ức, hoặc nói thành một tràng trách móc khiến người kia chỉ nghe được sự tấn công. Khi nghe, bạn dễ tự điền vào chỗ trống những gì bạn nghĩ họ muốn nói. Đây là kỹ năng, không phải số phận, và nó cải thiện rõ khi bạn tập từ những cuộc nói chuyện nhỏ.",
        examples: [
          "Bạn cứ nghĩ 'nó tự hiểu đi' mà không nói, và ba tuần sau vẫn ấm ức vì một việc nhỏ.",
          "Khi bị góp ý, bạn đáp ngay 'có mấy khi đâu', và thế là câu góp ý chưa kịp đi tới đâu.",
        ],
      },
    },
    exercises: [
      {
        name: "Nói rõ điều mình cần",
        how: "Viết lại điều bạn muốn nói theo ba phần: khi [việc cụ thể], mình thấy [cảm xúc], mình mong [đề nghị rõ]. Ví dụ: khi tuần này việc được chia sau chót; mình thấy gấp và lo; mình mong lần sau chia trước hai ngày. Bỏ hết những từ như 'lúc nào cũng', 'chẳng bao giờ'. Đọc lại một lần trước khi nói, xem nó còn nhắm vào con người người kia không.",
        why: "Nói về điều mình cần dễ được nghe hơn nhiều so với nói về việc người kia có tệ hay không.",
      },
      {
        name: "Nghe mà không sửa",
        how: "Trong lần tới ai đó kể chuyện, tập chỉ nghe và gật, không chen vào bằng chuyện của mình, không đưa giải pháp. Khi họ dừng, kể lại vắn tắt điều bạn vừa nghe và hỏi xem có đúng không. Chịu được vài giây im lặng là phần quan trọng của bài này.",
        why: "Người ta chỉ thật sự kể tiếp khi thấy mình không bị ngắt và không bị sửa ngay.",
      },
      {
        name: "Hỏi câu làm rõ",
        how: "Mỗi cuộc trò chuyện quan trọng, đặt ít nhất một câu hỏi làm rõ trước khi bạn nêu ý mình, ví dụ 'ý bạn là deadline thứ Năm, đúng không?'. Hỏi ngắn, một câu, và không hỏi theo kiểu phản biện. Nếu câu trả lời khác với điều bạn nghĩ, để ý xem cảm xúc của bạn thay đổi thế nào.",
        why: "Một câu hỏi làm rõ giúp bạn không phải chiến đấu với điều người kia chưa bao giờ nói.",
      },
      {
        name: "Chọn kênh cho lời quan trọng",
        how: "Trước khi gửi một lời quan trọng, chọn kênh theo mức độ nhạy cảm: một việc rõ ràng thì nhắn tin được, một lời xin lỗi hay một điều cần thì nói trực tiếp. Chọn giờ người kia rảnh, không chọn lúc họ đang bận hoặc đang bực. Viết nháp, đọc lại một lần, và sửa nếu nó nghe như trách móc dù bạn không có ý đó.",
        why: "Cùng một lời, kênh và giờ chọn sai thì người kia chỉ nghe được giọng, không nghe được ý.",
      },
      {
        name: "Cho và nhận góp ý",
        how: "Khi góp ý, chọn một việc cụ thể, nói ngắn, và nói cả điều bạn thấy người kia đang làm tốt. Khi bị góp ý, thử nói câu ghi nhận trước khi giải thích: cảm ơn bạn đã nói, để mình xem lại. Có thể hỏi thêm một câu để chắc mình hiểu đúng điều họ muốn nói.",
        why: "Góp ý là cách hai bên biết điều người kia cần, nếu nói đúng cách thì nó không phải là cuộc tấn công.",
      },
    ],
  },
  {
    key: "relationship",
    code: "QH",
    name: "Quản lý quan hệ",
    tagline: "Giữ và sửa mối quan hệ theo thời gian, kể cả sau va chạm.",
    question: "Sau một va chạm, bạn có quay lại để quan hệ này vẫn còn không?",
    includes: [
      "Quay lại hàn gắn sau một trận căng thẳng thay vì để khoảng cách kéo dài",
      "Đặt và giữ giới hạn cho điều mình chấp nhận",
      "Giữ những lời hứa nhỏ và để ý khi mình không giữ lời",
      "Hỏi thăm sau một khoảng căng, và sống chung được với khác biệt",
    ],
    bands: {
      high: {
        label: "Biết giữ, biết sửa",
        meaning: "Sau một va chạm, bạn có xu hướng quay lại nói chuyện và sửa, thay vì để khoảng cách tự lớn lên. Bạn giữ được những lời hứa nhỏ với người khác, và cũng để ý khi mình không giữ lời. Bạn chấp nhận rằng có những khác biệt sẽ không bao giờ giống nhau, chỉ cần hai bên biết cách sống chung. Khi mệt, bạn cũng có thể trễ nhịp hỏi thăm, và điều đó sửa được.",
        examples: [
          "Sau trận cãi với bạn cùng phòng, bạn chờ cả hai nguôi rồi nhắn: 'Tối nay nói chuyện lại được không? Mình bắt đầu bằng phần mình sai.'",
          "Bạn hứa với bạn nhóm sẽ gửi phần bài trước thứ Ba, và tối thứ Hai bạn gửi, dù chưa đến lúc bị nhắc.",
        ],
      },
      mid: {
        label: "Yên ổn, căng thì né",
        meaning: "Khi mọi chuyện vui vẻ, quan hệ của bạn khá tốt, nhưng đến lúc căng bạn chọn im cho yên, và khoảng cách cứ thế lớn dần mà không ai nói gì. Bạn hay nói 'để giữ hoà khí' khi đồng ý với điều mình không muốn, rồi để sự phật ý tích lại. Phần này luyện được bằng những hành động nhỏ và đều, như một tin nhắn hỏi thăm đúng lúc.",
        examples: [
          "Bạn chọn không nhắn gì cho đứa bạn đã làm mình buồn, và hai tuần sau vẫn thấy khó chịu mỗi khi gặp.",
          "Bạn đồng ý giúp bạn chép bài 'để giữ hoà khí', rồi trong lòng phật ý suốt tuần vì đã phải làm.",
        ],
      },
      low: {
        label: "Để khoảng cách lớn dần",
        meaning: "Trong xung đột kéo dài, bạn thường chỉ có hai lựa chọn quen thuộc: nhịn hết cho yên rồi để sự im lặng thành khoảng cách, hoặc bùng lên rồi cắt liên lạc. Bạn ít quay lại nói chuyện lại, nên mỗi va chạm để lại một vết nhỏ mà không ai dọn. Đây là kỹ năng, và nó bắt đầu được luyện từ việc quay lại với một câu hỏi thăm ngắn.",
        examples: [
          "Bạn nhịn suốt học kỳ chuyện nhóm trưởng giao việc, đến buổi cuối bùng lên một tràng khiến cả nhóm sững lại.",
          "Bạn chặn tài khoản người kia sau một trận cãi, và không còn cách nào để nói lại chuyện đó.",
        ],
      },
    },
    exercises: [
      {
        name: "Hàn gắn sau một trận cãi",
        how: "Chờ đến khi cả hai đã nguội, rồi nhắn một câu ngắn xin nói chuyện lại. Mở đầu bằng phần bạn thấy mình làm chưa ổn, dù chỉ một phần nhỏ. Hỏi người kia điều gì khiến họ nổi nóng, và nói điều bạn cần ở lần sau. Mục tiêu là hiểu nhau, không phải tìm ra ai thắng.",
        why: "Quay lại sau xung đột là việc khó nhất và cũng là việc giữ được quan hệ.",
      },
      {
        name: "Đặt một giới hạn cụ thể",
        how: "Chọn một chuyện bạn hay bị cuốn vào, ví dụ trả lời tin nhắn lúc nửa đêm hoặc cho mượn tiền. Viết ra một câu giới hạn rõ ràng và nói được ngay khi cần. Tập nói cho trơn trước gương, và nhớ rằng giới hạn không cần kèm lời giải thích dài.",
        why: "Giới hạn rõ ràng giúp quan hệ bền hơn là nhịn cho tới lúc hết chịu nổi.",
      },
      {
        name: "Giữ một lời hứa nhỏ",
        how: "Chọn một lời hứa nhỏ bạn đã nói với ai đó trong tuần: gửi bài, nhắc lịch, giữ chỗ, nhắn lại. Ghi ra: hứa gì, với ai, trước lúc nào. Đến hạn, làm trước khi người kia phải nhắc. Với những lời chưa giữ được, nói thật là mình sẽ làm lúc nào, thay vì để người kia tự đoán.",
        why: "Quan hệ được xây từ những lời nhỏ mà được giữ, không phải từ những lời to.",
      },
      {
        name: "Tin nhắn hỏi thăm sau căng thẳng",
        how: "Trong vòng ba ngày sau một cuộc căng thẳng, nhắn một câu ngắn cho người kia: 'Mình nhớ hôm đó, bạn ổn không?'. Không nhắc lại chuyện cũ, không đòi ai phải nói gì. Nếu họ trả lời dài, cứ nghe; nếu họ chưa sẵn sàng, để yên và để cửa mở.",
        why: "Một câu hỏi thăm đúng lúc cho người kia thấy quan hệ này vẫn còn, dù chuyện cũ chưa xong.",
      },
      {
        name: "Sống chung với khác biệt",
        how: "Chọn một khác biệt thực sự với một người quan trọng: giờ giấc, cách học, cách ăn. Viết ra ba điều bạn chấp nhận được và một điều bạn cần họ giữ. Chỉ nói về điều cần giữ, dùng câu 'mình cần…', và để yên phần còn lại. Nhớ rằng khác biệt không phải là chuyện để thắng thua.",
        why: "Mối quan hệ bền khi hai người biết đâu là chỗ cần đồng nhất và đâu là chỗ được phép khác.",
      },
    ],
  },
]

export const EQ_BY_KEY = Object.fromEntries(EQ_DIMENSIONS.map((d) => [d.key, d]))

export const EQ_SKILL_ORDER = EQ_DIMENSIONS.map((d) => d.key)
