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
        meaning: "Bạn thường nhận ra cảm xúc của mình khá sớm, gọi được tên, biết nó mạnh cỡ nào và truy ra được nó đến từ đâu. Bạn cũng nhận ra khi trong lòng vừa tức vừa tủi cùng lúc, và phân biệt được điều mình quan sát với điều mình suy ra. Kỹ năng này vẫn thay đổi theo hoàn cảnh: lúc mệt hoặc bị dồn ép, bạn có thể khó nhận ra rõ như vậy.",
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
        label: "Hay lướt qua cảm xúc của mình",
        meaning: "Bạn hay chỉ phát hiện ra cảm xúc khi nó đã quá mạnh, hoặc khi người xung quanh nhắc. Bạn dễ gán nguyên nhân cho người gần nhất có mặt, trong khi ngòi nổ thật sự nằm ở chuyện khác từ sáng. Đây không phải điều gì cố định ở bạn, chỉ là kỹ năng bạn chưa luyện nhiều. Chỉ cần những lần dừng lại rất ngắn là nó đã rõ dần lên.",
        examples: [
          "Bạn nhận ra mình đã quá tải sau khi trả lời cộc lốc cả nhóm và bỏ luôn buổi học nhóm.",
          "Bạn gắt với em mình vì một chuyện nhỏ, trong khi cả ngày đang lo về học phí kỳ tới, và chỉ hiểu ra khi bố mẹ hỏi.",
        ],
      },
    },
    exercises: [
      {
        name: "Gọi tên cảm xúc trong 60 giây",
        how: "Ba lần mỗi ngày, dừng lại và tự hỏi: lúc này mình đang cảm thấy gì? Viết ra một từ chính xác kèm một con số từ 1 đến 10, cố đừng dùng chữ chung chung như 'mệt' hay 'khó chịu'. Nếu bí, chọn giữa vui, buồn, tức, sợ, lo, ngạc nhiên, xấu hổ, tủi thân, ghen tị, nhẹ nhõm. Sau một tuần, xem lại từ mức mấy thì bạn bắt đầu khó giữ bình tĩnh.",
        why: "Vốn từ cảm xúc càng rộng và bạn càng quen đo mức, bạn càng gọi đúng tên được thứ mình đang trải qua.",
      },
      {
        name: "Quét tín hiệu cơ thể",
        how: "Khi thấy có gì đó lạ, quét từ đầu xuống: hàm có siết không, vai có cứng không, bụng có nặng không, hơi thở có nông không. Ghi lại những tín hiệu hay lặp lại và cảm xúc đi kèm với chúng. Làm vài lần, bạn sẽ có một bản đồ riêng: tín hiệu nào báo cảm xúc nào.",
        why: "Cơ thể thường báo trước, khi bạn còn chưa kịp biết mình đang cảm thấy gì.",
      },
      {
        name: "Lần ra ngòi nổ qua ba câu hỏi",
        how: "Khi có một cảm xúc mạnh, tự hỏi ba câu: chuyện gì vừa xảy ra, chuyện đó có ý nghĩa gì với mình, và mình đang sợ mất điều gì. Ghi lại câu trả lời thứ ba vì đó thường là gốc. Nếu câu thứ ba vẫn còn chung chung, hỏi thêm một câu nữa.",
        why: "Cảm xúc mạnh thường không đến từ chuyện vừa xảy ra mà từ điều ta sợ mất.",
      },
      {
        name: "Đặt hai cảm xúc cạnh nhau",
        how: "Khi thấy rối, thử đặt hai cảm xúc cạnh nhau: ví dụ vui vì được khen, nhưng cũng khó chịu vì phần mình làm bị bỏ qua. Cho mỗi cảm xúc một mức từ 1 đến 10, rồi xem cả hai có cùng đến từ một chuyện không.",
        why: "Cho phép mình có nhiều cảm xúc cùng lúc thì bạn không phải chọn một cái rồi phủ nhận phần còn lại.",
      },
      {
        name: "Ý nghĩ hay cảm xúc",
        how: "Viết một câu bạn đang nghĩ trong đầu, ví dụ 'nó coi thường mình'. Tự hỏi: đây là chuyện đã xảy ra thật, hay chỉ là cách mình đang hiểu? Thử viết lại câu đó thành điều mình quan sát được, rồi xem cảm xúc có thay đổi không.",
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
        meaning: "Bạn thường kịp nhận ra cơn cảm xúc trước khi nó điều khiển việc mình làm. Bạn biết đổi cách nhìn để bớt căng, và đã quen dừng lại một chút trước khi phản ứng. Không phải lúc nào cũng được như vậy, có hôm bạn vẫn bùng lên, và điều đó là bình thường.",
        examples: [
          "Bạn đọc tin nhắn khiến mình tức, cất điện thoại đi 10 phút rồi mới trả lời, nói rõ điều mình muốn bằng một câu.",
          "Khi một bạn trong nhóm trễ hẹn lần thứ ba, bạn nói thẳng là mình cần mọi người đúng giờ thay vì đăng status than thở.",
        ],
      },
      mid: {
        label: "Có lúc giữ được",
        meaning: "Bạn biết mình nên dừng lại, nhưng chỉ làm được khi cảm xúc chưa quá mạnh. Lúc bị dồn ép hoặc đang mệt, bạn dễ phản ứng ngay rồi sau đó hối hận. Bạn đã biết cần làm gì, giờ chỉ cần luyện để khoảng dừng ngắn ấy thành phản xạ.",
        examples: [
          "Bạn giữ được bình tĩnh khi bị góp ý trong nhóm, nhưng lại nổi nóng khi bố mẹ nhắc chuyện học.",
          "Bạn biết nên chờ rồi mới nhắn lại, nhưng vẫn bấm gửi vì sợ im lặng là thua.",
        ],
      },
      low: {
        label: "Cảm xúc đi trước",
        meaning: "Bạn thường nói hoặc làm ngay khi cảm xúc vừa dâng, rồi mới thấy hối. Bạn hay nói 'tại nó chọc mình trước' vì lúc đó có cảm giác như mình chẳng còn cách nào khác. Kỹ năng này luyện được bằng những khoảng dừng rất ngắn, bắt đầu từ vài giây.",
        examples: [
          "Bạn trả lời cộc lốc trong nhóm lớp rồi phải nhắn xin lỗi cả nhóm.",
          "Bạn đứng dậy bỏ ra khỏi buổi học nhóm, và tối đó không muốn mở lại cuộc trò chuyện.",
        ],
      },
    },
    exercises: [
      {
        name: "Bốn bước khi cơn tới",
        how: "Bước 1: dừng lại, thở một hơi dài. Bước 2: gọi tên cảm xúc và cho nó một mức trên thang 10. Bước 3: tìm ra điều gì thật sự châm ngòi. Bước 4: chọn một việc cụ thể để làm trong mười phút tới, ví dụ đi rửa mặt hoặc viết tin nhắn nháp nhưng chưa gửi.",
        why: "Bốn bước ngắn này giúp bạn cầm lại tay lái, thay vì để cảm xúc tự lái.",
      },
      {
        name: "Đổi cách nhìn",
        how: "Khi có chuyện làm bạn cáu, hãy viết ra cách mình đang hiểu về nó. Rồi tự ép mình nghĩ thêm hai cách hiểu khác nghe vẫn hợp lý, ví dụ bạn kia im lặng vì mệt chứ không phải vì coi thường mình. Chọn cách hiểu làm mình đỡ khó chịu hơn mà không phải tự lừa mình.",
        why: "Cùng một chuyện, cách hiểu khác nhau sẽ cho ra cảm xúc rất khác nhau.",
      },
      {
        name: "Chờ 90 giây",
        how: "Khi vừa bị chạm vào chỗ nhạy cảm, hãy đặt đồng hồ 90 giây và không nói, không nhắn, không quyết định gì. Chỉ để ý hơi thở và cơn sóng trong người: nó dâng lên rồi sẽ bắt đầu hạ xuống. Hết giờ mới nghĩ xem làm gì tiếp.",
        why: "Cơn cảm xúc dữ dội thường tự hạ xuống sau khoảng một phút rưỡi nếu bạn không đổ thêm dầu vào lửa.",
      },
      {
        name: "Tách cảm giác khỏi hành động",
        how: "Viết hai cột: cột một là điều bạn đang cảm thấy, cột hai là điều bạn có thể làm. Nối chúng bằng chữ 'nhưng' thay vì chữ 'nên', ví dụ 'mình đang tức nhưng mình chưa cần nói ngay'. Chọn một việc ở cột hai mà sau này bạn sẽ không phải hối hận.",
        why: "Cảm giác nào cũng có thật, nhưng không phải cảm giác nào cũng cần biến thành hành động.",
      },
      {
        name: "Xử lý bây giờ hay để sau",
        how: "Với mỗi chuyện đang nóng, tự hỏi ba câu: nói lúc này có giúp giải quyết được gì không, người kia có đủ bình tĩnh để nghe không, và mình đang nói vì muốn hiểu hay vì muốn thắng. Nếu có từ hai câu trả lời là “không”, hãy hẹn một lúc cụ thể để nói sau.",
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
        meaning: "Bạn thường tự hỏi chuyện này trông thế nào từ phía người kia trước khi kết luận. Bạn phân biệt được điều mình thấy và điều mình phỏng đoán, nên ít khi gán ý xấu cho người khác. Bạn cũng biết công nhận cảm xúc của họ mà không cần đồng ý với mọi thứ họ làm. Tất nhiên vẫn có lúc bạn kết luận vội, nhất là khi đang bực, và đó là lúc nên luyện thêm.",
        examples: [
          "Khi bạn cùng nhóm nộp bài trễ, bạn hỏi tuần này họ có chuyện gì thay vì kết luận họ lười.",
          "Bạn nhắn cho đứa bạn đang buồn: 'Tao ở đây, mày muốn kể hay muốn tao ngồi im cùng mày?'",
        ],
      },
      mid: {
        label: "Hiểu nhưng vội kết luận",
        meaning: "Bạn thật sự muốn hiểu người khác và thường đoán khá đúng. Nhưng khi đang bực hoặc đang vội, bạn dễ biến phỏng đoán thành sự thật và nhảy vào khuyên trước khi hỏi. Người kia dễ thấy mình bị đánh giá, dù ý bạn là tốt. Chỉ cần tập thói quen hỏi một câu trước khi kết luận là sẽ khác hẳn.",
        examples: [
          "Bạn thấy bạn mình im lặng trong nhóm lớp và nghĩ ngay là nó đang giận mình.",
          "Bạn đưa ra ba lời khuyên cho đứa bạn vừa bị điểm kém, rồi mới nhận ra nó chỉ cần được ngồi yên một lúc.",
        ],
      },
      low: {
        label: "Hay nhìn từ phía mình",
        meaning: "Khi có chuyện, bạn thường nhìn từ chỗ mình đứng trước, nên dễ thấy như người khác đang nhắm vào mình. Bạn cũng hay khuyên ngay khi thấy ai đó buồn, vì bạn thật lòng muốn giúp. Cả hai đều cải thiện được bằng một câu hỏi trước khi kết luận, và sẽ khá lên dần nếu bạn luyện đều.",
        examples: [
          "Bạn và bạn thân cùng nộp bài, bạn ấy được khen còn bạn thì không, nên bạn thấy mình bị coi thường.",
          "Bạn nhắn liên tục cho người đang bận, vì với bạn, im lặng nghĩa là có chuyện không ổn.",
        ],
      },
    },
    exercises: [
      {
        name: "Đổi chỗ trong một chuyện thật",
        how: "Chọn một chuyện đang làm bạn khó chịu với ai đó. Viết nửa trang về chuyện đó theo góc nhìn của họ: họ đang sợ gì, muốn gì, thấy mình bị hiểu sai ở đâu. Đừng cố viết cho đúng, chỉ cần viết điều có thể xảy ra. Sau đó đánh dấu ba câu bạn chưa chắc và tìm dịp hỏi lại họ.",
        why: "Viết ra giúp bạn thấy những điều mà ngồi nghĩ trong đầu thì không thấy.",
      },
      {
        name: "Quan sát và phỏng đoán",
        how: "Khi bực ai đó, kẻ hai cột. Cột “Quan sát” chỉ ghi điều bạn thật sự thấy hoặc nghe, ví dụ 'hai ngày rồi nó không trả lời tin nhắn'. Cột “Phỏng đoán” ghi điều bạn đang suy ra, ví dụ 'nó coi thường mình'. Với cột thứ hai, tự hỏi còn cách giải thích nào khác không.",
        why: "Phần lớn hiểu lầm bắt đầu khi ta coi phỏng đoán là sự thật.",
      },
      {
        name: "Hỏi trước khi khuyên",
        how: "Khi thấy ai đó đang có chuyện, đừng mở đầu bằng lời khuyên. Hãy hỏi: “Cậu muốn mình nghe thôi hay muốn mình góp ý?” Nếu họ chỉ muốn kể, cứ ngồi nghe, đừng cố sửa gì. Chỉ khuyên khi họ nói là muốn nghe.",
        why: "Người đang buồn thường cần được lắng nghe trước, rồi mới cần ai chỉ cách.",
      },
      {
        name: "Công nhận mà không đồng ý",
        how: "Tập nói một câu công nhận cảm xúc của người kia mà không phải đồng ý với việc họ làm, ví dụ: 'Mình hiểu vì sao cậu thấy bị bỏ rơi.' Rồi nói riêng một câu nữa: 'Mình vẫn không thấy ổn với cách cậu nói lúc đó.' Tách thành hai câu, đừng gộp vào một câu có chữ “nhưng” ở giữa. Làm vài lần cho quen.",
        why: "Hiểu và đồng ý là hai chuyện khác nhau, tách được thì bạn vừa gần người kia vừa giữ được giới hạn.",
      },
      {
        name: "Đọc điều chưa nói ra",
        how: "Trong một cuộc trò chuyện, để ý những chỗ người kia nói lướt qua hoặc đổi chủ đề. Viết ra một phỏng đoán về điều họ chưa nói, ví dụ họ sợ bị bỏ lại. Rồi hỏi lại bằng một câu nhẹ nhàng, không khẳng định, và sẵn sàng nghe nếu họ nói mình đoán sai.",
        why: "Đồng cảm đúng đến từ việc kiểm tra lại điều mình đoán, không phải từ việc đoán giỏi.",
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
      "Cảm nhận không khí của nhóm hoặc lớp học ngay khi bước vào",
      "Thấy những quy tắc ngầm mà không ai nói ra",
      "Nhận ra ai đang có nhiều ảnh hưởng, ai đang bị bỏ ngoài lề",
      "Chọn đúng lúc, đúng nơi để nói một điều nhạy cảm",
    ],
    bands: {
      high: {
        label: "Đọc được cả căn phòng",
        meaning: "Bạn thường nhận ra không khí của nhóm trước khi nó lộ ra thành lời: ai đang căng, ai đang bị bỏ ngoài lề, và lúc nào nên nói điều nhạy cảm. Bạn cũng để ý được những quy tắc ngầm mà không ai nói ra, nên ít khi nói điều gì làm người khác bất ngờ. Khi mệt hoặc ở chỗ mới, bạn vẫn có thể bỏ sót tín hiệu, nhưng sẽ đọc tốt dần lên nếu luyện.",
        examples: [
          "Bạn nhận ra cả lớp đang mệt sau tiết kiểm tra, nên giữ câu hỏi phản biện lại cho giờ ra chơi.",
          "Trong nhóm chat lớp, bạn thấy không khí bắt đầu căng về cách chia việc, nên chủ động đề nghị gặp trực tiếp thay vì tranh luận thêm bằng tin nhắn.",
        ],
      },
      mid: {
        label: "Thấy khi chịu để ý",
        meaning: "Bạn đọc được không khí khi nhớ để ý, nhưng lúc đang bận hoặc đang bực thì dễ nói thẳng luôn mà quên xem mọi người đã sẵn sàng nghe chưa. Bạn cũng hay đến khi chuyện đã xảy ra mới nhận ra mình bỏ sót một người im lặng ở rìa. Phần này tiến bộ nhanh nếu bạn tập quan sát có chủ đích.",
        examples: [
          "Bạn đưa ý kiến hay trong lúc cả nhóm đang tức tối, và nó bị hiểu là bạn đang đứng về phe kia.",
          "Bạn thấy một bạn trong nhóm cứ bị hỏi là im lặng, nhưng đến khi buổi họp kết thúc mới nhận ra.",
        ],
      },
      low: {
        label: "Dễ nói trúng lúc sai",
        meaning: "Bạn thường chỉ nghĩ đến điều mình muốn nói mà ít để ý người nghe: không khí ra sao, ai đang căng, và lúc này có nên nói không. Vì thế bạn hay nói đúng lúc dễ bị hiểu sai nhất, rồi sau mới nhận ra chỗ và giờ đó không hợp. Đây là kỹ năng luyện được, và nó bắt đầu từ một phút quan sát trước khi lên tiếng.",
        examples: [
          "Bạn kể chuyện buồn của mình trước cả lớp đúng lúc ai cũng đang chuẩn bị vào bài, và thấy như chẳng ai nghe.",
          "Bạn gửi tin nhắn dài vào nhóm chat lúc mười một giờ đêm, và sáng hôm sau mọi người đọc nó như một bản tuyên bố.",
        ],
      },
    },
    exercises: [
      {
        name: "Một phút chỉ quan sát",
        how: "Trong buổi họp nhóm hoặc hoạt động của lớp, dành phút đầu chỉ quan sát, chưa nói gì: ai im lặng, ai khoanh tay, ai nói nhiều, không khí đang căng hay thoải mái. Ghi lại một điều bạn nhận ra, ví dụ 'cô giáo không nói gì nhưng cả nhóm cứ liếc sang cô mỗi khi căng'. Thử với hai nhóm khác nhau trong tuần để so sánh.",
        why: "Không khí thường cho bạn biết điều cần biết trước khi ai kịp lên tiếng.",
      },
      {
        name: "Chuyện sẽ đi tới đâu",
        how: "Chọn một chuyện đang căng trong nhóm và viết ra ba mốc: hôm nay, ba ngày nữa nếu không ai nói gì, và hai tuần nữa. Ở mỗi mốc, ghi một câu về điều sẽ xảy ra với cả nhóm, không chỉ với riêng bạn. Đọc lại, rồi chọn một việc nhỏ để làm ngay hôm nay.",
        why: "Hình dung trước chuyện sẽ đi tới đâu giúp bạn chen vào đúng lúc, khi mọi thứ còn dễ sửa.",
      },
      {
        name: "Bản đồ quy tắc ngầm",
        how: "Chọn một nhóm bạn hay ở cùng và viết ra những quy tắc không ai nói thành lời: mấy giờ thì không nên nhắn, ai là người quyết định, chuyện gì nói trước lớp thì ổn nhưng nói trong nhóm chat thì không. Hỏi một người bạn tin tưởng xem bạn đoán có đúng không. Sửa lại bản đồ khi thấy quy tắc đổi, vì nó không đứng yên.",
        why: "Nhiều hiểu lầm xảy ra vì mỗi người đang theo một luật riêng mà không ai nói ra.",
      },
      {
        name: "Người đang ở rìa",
        how: "Lần tới cả nhóm đi chơi hay làm việc chung, hãy để ý người ít nói nhất và người nói nhiều nhất. Thử kéo người ở rìa vào bằng một câu hỏi mở mà chỉ họ mới trả lời được. Cuối buổi tự hỏi: mình có vô tình để ai đó chỉ ngồi nghe không?",
        why: "Một nhóm chỉ hoạt động tốt khi mỗi người trong đó có chỗ để lên tiếng.",
      },
      {
        name: "Chọn kênh, chọn giờ",
        how: "Trước khi nói một điều nhạy cảm với nhóm, dừng lại và hỏi: lúc này mọi người có sẵn sàng nghe không, và nói trước cả nhóm hay nói riêng thì hợp hơn? Chọn một kênh và một thời điểm cụ thể thay vì “để hôm nào”. Nếu ai đó trong nhóm đang bận hoặc đang bực, hãy chọn lúc khác, lời bạn sẽ được nghe tốt hơn.",
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
        meaning: "Bạn nói được điều mình cần mà không biến nó thành lời trách, thường theo kiểu 'khi… mình thấy… mình mong…'. Bạn cũng nghe xong mới đáp, và hay hỏi lại để chắc mình hiểu đúng thay vì tự đoán. Kỹ năng này vẫn thay đổi theo hoàn cảnh: lúc mệt hoặc đang tức, lời bạn nói cũng dễ gắt hơn.",
        examples: [
          "Bạn nói với bạn nhóm: 'Khi phần việc của mình bị chia sát giờ, mình thấy lo không kịp. Lần sau mình mong nhận việc trước hai ngày.'",
          "Khi bạn thân kể chuyện buồn ở nhà, bạn nghe xong rồi hỏi: 'Cậu cần mình nghe thôi, hay cần mình góp ý?' thay vì nhảy vào khuyên ngay.",
        ],
      },
      mid: {
        label: "Biết nói, nhưng vội",
        meaning: "Bạn hiểu mình cần nói điều gì, nhưng câu đầu tiên hay tuột ra thành lời trách trước khi kịp chọn cách nói. Khi nghe, bạn hay chen vào bằng chuyện của mình hoặc bằng giải pháp, nên người kia chưa kịp nói hết. Cả hai đều luyện được, bắt đầu từ việc viết sẵn câu định nói và đợi người kia nói hết câu.",
        examples: [
          "Bạn định nói điều mình cần, nhưng câu đầu tiên thành 'Sao lần nào cũng là tao làm hết', và thế là người kia phòng thủ ngay.",
          "Bạn nghe bạn kể chuyện mà trong đầu đang soạn câu trả lời, nên bạn lỡ mất nửa sau của câu chuyện.",
        ],
      },
      low: {
        label: "Nói thì cụt, nghe thì lệch",
        meaning: "Bạn hay ngại không nói điều mình cần, rồi để nó tích thành ấm ức, hoặc nói ra thành một tràng trách móc khiến người kia chỉ thấy mình bị tấn công. Khi nghe, bạn dễ tự điền vào chỗ trống những gì bạn nghĩ họ muốn nói. Đây là kỹ năng chứ không phải số phận, và sẽ khá lên rõ rệt nếu bạn tập từ những cuộc nói chuyện nhỏ.",
        examples: [
          "Bạn cứ nghĩ 'tự nó hiểu đi' mà không nói, và ba tuần sau vẫn còn ấm ức vì một chuyện nhỏ.",
          "Khi bị góp ý, bạn đáp ngay 'có mấy khi đâu', thế là lời góp ý chưa kịp tới nơi đã bị chặn lại.",
        ],
      },
    },
    exercises: [
      {
        name: "Nói rõ điều mình cần",
        how: "Viết lại điều bạn muốn nói theo ba phần: khi [việc cụ thể], mình thấy [cảm xúc], mình mong [đề nghị rõ ràng]. Ví dụ: khi tuần này việc được chia sát giờ, mình thấy gấp và lo, mình mong lần sau được chia trước hai ngày. Bỏ hết những từ như 'lúc nào cũng', 'chẳng bao giờ'. Đọc lại một lần trước khi nói, xem nó có đang nhắm vào chính con người họ không.",
        why: "Nói về điều mình cần dễ được lắng nghe hơn nhiều so với nói người kia tệ chỗ nào.",
      },
      {
        name: "Nghe mà không sửa",
        how: "Lần tới khi ai đó kể chuyện, hãy tập chỉ nghe và gật đầu, không chen vào bằng chuyện của mình, không đưa giải pháp. Khi họ dừng, kể lại ngắn gọn điều bạn vừa nghe và hỏi xem mình hiểu đúng chưa. Chịu được vài giây im lặng là phần quan trọng của bài này.",
        why: "Người ta chỉ kể tiếp khi thấy mình không bị ngắt lời và không bị sửa ngay.",
      },
      {
        name: "Hỏi lại cho rõ",
        how: "Trong mỗi cuộc trò chuyện quan trọng, hãy hỏi ít nhất một câu để hiểu cho rõ trước khi nói ý mình, ví dụ 'Ý cậu là deadline thứ Năm, đúng không?'. Hỏi ngắn, một câu thôi, và đừng hỏi kiểu vặn lại. Nếu câu trả lời khác điều bạn nghĩ, để ý xem cảm xúc của mình thay đổi ra sao.",
        why: "Một câu hỏi lại giúp bạn khỏi phải cãi với điều người kia chưa từng nói.",
      },
      {
        name: "Chọn kênh cho lời quan trọng",
        how: "Trước khi gửi một lời quan trọng, hãy chọn kênh theo mức độ nhạy cảm: việc rõ ràng thì nhắn tin được, còn lời xin lỗi hay điều bạn đang cần thì nên nói trực tiếp. Chọn lúc người kia rảnh, đừng chọn lúc họ đang bận hoặc đang bực. Viết nháp, đọc lại một lần, và sửa nếu nghe giống trách móc dù bạn không có ý đó.",
        why: "Cùng một lời, chọn sai kênh và sai giờ thì người kia chỉ nghe thấy giọng điệu chứ không nghe được ý.",
      },
      {
        name: "Cho và nhận góp ý",
        how: "Khi góp ý, chọn một việc cụ thể, nói ngắn gọn, và nói cả điều bạn thấy người kia đang làm tốt. Khi bị góp ý, thử nói một câu ghi nhận trước khi giải thích: “Cảm ơn cậu đã nói, để mình xem lại.” Bạn cũng có thể hỏi thêm một câu để chắc mình hiểu đúng ý họ.",
        why: "Góp ý là cách để hai bên biết người kia cần gì; nếu nói đúng cách thì nó không phải là tấn công.",
      },
    ],
  },
  {
    key: "relationship",
    code: "QH",
    name: "Quản lý quan hệ",
    tagline: "Giữ và sửa mối quan hệ theo thời gian, kể cả sau va chạm.",
    question: "Sau một va chạm, bạn có quay lại để giữ mối quan hệ này không?",
    includes: [
      "Quay lại hàn gắn sau một trận căng thẳng thay vì để khoảng cách kéo dài",
      "Đặt và giữ giới hạn cho điều mình chấp nhận",
      "Giữ những lời hứa nhỏ và để ý khi mình không giữ lời",
      "Hỏi thăm sau một khoảng căng, và sống chung được với khác biệt",
    ],
    bands: {
      high: {
        label: "Biết giữ, biết sửa",
        meaning: "Sau một va chạm, bạn thường quay lại nói chuyện và sửa, thay vì để khoảng cách tự lớn dần. Bạn giữ được những lời hứa nhỏ, và để ý khi mình lỡ không giữ lời. Bạn chấp nhận rằng có những khác biệt sẽ không bao giờ hết, miễn là hai bên biết cách sống chung. Lúc mệt, bạn cũng có thể quên hỏi thăm, nhưng điều đó sửa được.",
        examples: [
          "Sau trận cãi với bạn cùng phòng, bạn chờ cả hai nguôi rồi nhắn: 'Tối nay mình nói chuyện lại được không? Mình xin nhận phần mình sai trước.'",
          "Bạn hứa với bạn nhóm sẽ gửi phần bài trước thứ Ba, và tối thứ Hai bạn gửi, dù chưa ai phải nhắc.",
        ],
      },
      mid: {
        label: "Yên ổn, căng thì né",
        meaning: "Khi mọi chuyện vui vẻ thì quan hệ của bạn khá tốt, nhưng đến lúc căng thẳng bạn chọn im lặng cho yên, và khoảng cách cứ lớn dần mà không ai nói gì. Bạn hay nói 'cho êm chuyện' rồi đồng ý với điều mình không muốn, và để sự khó chịu tích lại. Phần này luyện được bằng những việc nhỏ và đều, như một tin nhắn hỏi thăm đúng lúc.",
        examples: [
          "Bạn chọn không nhắn gì cho đứa bạn đã làm mình buồn, và hai tuần sau vẫn thấy khó chịu mỗi khi gặp.",
          "Bạn đồng ý cho bạn chép bài 'cho êm chuyện', rồi cả tuần sau đó vẫn bực trong lòng.",
        ],
      },
      low: {
        label: "Để khoảng cách lớn dần",
        meaning: "Khi xung đột kéo dài, bạn thường chỉ có hai cách quen thuộc: nhịn hết cho yên rồi để im lặng thành khoảng cách, hoặc bùng lên rồi cắt liên lạc. Bạn ít khi quay lại nói chuyện cho ra nhẽ, nên mỗi va chạm để lại một vết nhỏ mà không ai dọn. Đây là một kỹ năng, và bạn có thể bắt đầu luyện bằng một câu hỏi thăm ngắn.",
        examples: [
          "Bạn nhịn cả học kỳ chuyện nhóm trưởng giao việc, đến buổi cuối thì bùng lên khiến cả nhóm sững người.",
          "Bạn chặn người kia sau một trận cãi nhau, và không còn cách nào để nói lại chuyện đó.",
        ],
      },
    },
    exercises: [
      {
        name: "Hàn gắn sau một trận cãi",
        how: "Đợi đến khi cả hai đã nguội, rồi nhắn một câu ngắn xin nói chuyện lại. Mở đầu bằng phần bạn thấy mình làm chưa ổn, dù chỉ là một phần nhỏ. Hỏi người kia điều gì khiến họ nổi nóng, rồi nói điều bạn cần ở lần sau. Mục tiêu là hiểu nhau, không phải phân thắng thua.",
        why: "Quay lại sau xung đột là việc khó nhất, và cũng là việc giữ được mối quan hệ.",
      },
      {
        name: "Đặt một giới hạn cụ thể",
        how: "Chọn một chuyện bạn hay bị cuốn vào, ví dụ trả lời tin nhắn lúc nửa đêm hoặc cho mượn tiền. Viết ra một câu giới hạn rõ ràng, đủ ngắn để nói ngay khi cần. Tập nói cho trơn trước gương, và nhớ là giới hạn không cần kèm lời giải thích dài.",
        why: "Có giới hạn rõ ràng thì quan hệ bền hơn là cứ nhịn cho tới lúc không chịu nổi nữa.",
      },
      {
        name: "Giữ một lời hứa nhỏ",
        how: "Chọn một lời hứa nhỏ bạn đã nói với ai đó trong tuần: gửi bài, nhắc lịch, giữ chỗ, nhắn lại. Ghi ra: hứa gì, với ai, trước lúc nào. Làm xong trước khi người kia phải nhắc. Với lời hứa chưa giữ được, hãy nói thật là khi nào mình sẽ làm, đừng để người kia tự đoán.",
        why: "Quan hệ được xây từ những lời hứa nhỏ mà mình giữ được, chứ không phải từ những lời hứa to tát.",
      },
      {
        name: "Tin nhắn hỏi thăm sau căng thẳng",
        how: "Trong vòng ba ngày sau một lần căng thẳng, nhắn cho người kia một câu ngắn: 'Chuyện hôm đó mình vẫn nghĩ mãi, cậu ổn không?' Đừng nhắc lại chuyện cũ, đừng đòi ai phải nói gì. Nếu họ trả lời dài, cứ nghe; nếu họ chưa sẵn sàng, cứ để yên và để ngỏ cửa.",
        why: "Một câu hỏi thăm đúng lúc cho người kia biết mối quan hệ này vẫn còn đó, dù chuyện cũ chưa xong.",
      },
      {
        name: "Sống chung với khác biệt",
        how: "Chọn một điểm khác biệt có thật với một người quan trọng: giờ giấc, cách học, thói quen ăn uống. Viết ra ba điều bạn chấp nhận được và một điều bạn cần họ giữ. Chỉ nói về điều cần giữ, dùng câu 'mình cần…', còn lại cứ để yên. Hãy nhớ khác biệt không phải chuyện để phân thắng thua.",
        why: "Quan hệ bền khi hai người biết chỗ nào cần giống nhau và chỗ nào được phép khác nhau.",
      },
    ],
  },
]

export const EQ_BY_KEY = Object.fromEntries(EQ_DIMENSIONS.map((d) => [d.key, d]))

export const EQ_SKILL_ORDER = EQ_DIMENSIONS.map((d) => d.key)
