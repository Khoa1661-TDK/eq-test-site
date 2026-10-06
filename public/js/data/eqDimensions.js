// Năm chiều hướng trí tuệ cảm xúc (EQ) dành cho học sinh cấp 3 và sinh viên.
// Mỗi chiều hướng là một kỹ năng có thể luyện tập và thay đổi theo tình huống,
// không dùng để dán nhãn hay kết luận cố định về con người bạn.

export const EQ_DIMENSIONS = [
  {
    key: "awareness",
    code: "NB",
    name: "Nhận biết cảm xúc",
    tagline: "Gọi đúng tên điều đang diễn ra trong bạn.",
    question: "Lúc này bạn đang cảm thấy gì, mạnh đến mức nào, và cơ thể bạn báo hiệu ra sao?",
    includes: [
      "Nhận ra cảm xúc ngay khi nó vừa xuất hiện",
      "Gọi tên cảm xúc bằng từ chính xác, không nói chung chung",
      "Đọc tín hiệu cơ thể đi kèm mỗi cảm xúc",
      "Phân biệt những cảm xúc na ná nhau nhưng khác gốc",
    ],
    bands: {
      high: {
        label: "Rõ ràng và nhạy",
        meaning: "Bạn thường nhận ra cảm xúc của mình khá sớm, gọi được tên và biết nó đang mạnh cỡ nào. Nhờ vậy bạn ít bị cảm xúc cuốn đi mà không hay, và người xung quanh cũng thấy bạn dễ hiểu. Kỹ năng này vẫn đổi theo tình huống: khi mệt hoặc bị dồn ép, bạn sẽ khó nhận ra hơn một chút.",
        examples: [
          "Trong buổi thuyết trình nhóm, bạn nhận ra tim đập nhanh là do lo, không phải do hứng thú.",
          "Khi bị bỏ ra khỏi nhóm chung của lớp, bạn gọi được tên cảm giác đó là tủi thân và biết nó chỉ mới ở mức 4/10.",
        ],
      },
      mid: {
        label: "Biết nhưng còn mơ hồ",
        meaning: "Bạn nhận ra là mình đang có chuyện, nhưng thường chỉ nói được chung chung kiểu 'thấy khó chịu' hoặc 'thấy mệt'. Cảm xúc mạnh thì bạn thấy rõ, còn những lần nhẹ và đến từ từ thì dễ lướt qua. Chuyện này rất phổ biến và luyện tập sẽ rõ hơn nhiều.",
        examples: [
          "Bạn cáu với bạn cùng phòng cả buổi mà đến tối mới biết đó là do bực chuyện điểm kiểm tra.",
          "Trước giờ kiểm tra bạn chỉ thấy 'bồn chồn', chưa phân biệt được đâu là lo thiếu bài, đâu là hồi hộp muốn thử sức.",
        ],
      },
      low: {
        label: "Còn lướt qua chính mình",
        meaning: "Bạn hay chỉ phát hiện ra cảm xúc khi nó đã quá mạnh, hoặc khi người xung quanh nhắc. Bạn dễ nói 'không sao đâu' rồi vài hôm sau thấy trong người nặng nề mà không hiểu vì sao. Đây không phải bản tính cố định, chỉ là kỹ năng bạn chưa luyện nhiều.",
        examples: [
          "Bạn nhận ra mình đã quá tải sau khi trả lời cộc lốc cả nhóm và bỏ luôn buổi học nhóm.",
          "Bạn chỉ biết mình buồn khi nghe lại một bài nhạc cũ, còn cả ngày trước đó vẫn tưởng là bình thường.",
        ],
      },
    },
    exercises: [
      {
        name: "Gọi tên cảm xúc trong 60 giây",
        how: "Ba lần mỗi ngày, dừng lại và tự hỏi: lúc này mình đang cảm thấy gì? Viết ra một từ chính xác, cố đừng dùng chữ chung chung như 'mệt' hay 'khó chịu'. Nếu bí, chọn giữa vui, buồn, tức, sợ, lo, ngạc nhiên, xấu hổ, tủi thân, ghen tị, nhẹ nhõm.",
        why: "Vốn từ cảm xúc càng rộng thì bạn càng gọi đúng tên được thứ mình đang trải qua.",
      },
      {
        name: "Thang đo 1 đến 10",
        how: "Mỗi lần nhận ra một cảm xúc, cho nó một con số từ 1 đến 10. Ghi thêm một câu ngắn xem con số đó khiến bạn làm gì, ví dụ 6/10 thì bạn im lặng. Sau một tuần, xem lại xem từ mức nào thì bạn bắt đầu khó giữ bình tĩnh.",
        why: "Biết ngưỡng của mình giúp bạn xử lý ở mức 4 thay vì đợi đến lúc đã là mức 9.",
      },
      {
        name: "Quét tín hiệu cơ thể",
        how: "Khi thấy có gì đó lạ, quét từ đầu xuống: hàm có siết không, vai có cứng không, bụng có nặng không, hơi thở có nông không. Ghi lại cảm xúc đi kèm những tín hiệu lặp đi lặp lại nhiều lần. Bạn sẽ có bản đồ riêng của chính mình.",
        why: "Cơ thể thường báo trước khi bạn kịp ý thức được là mình đang có cảm xúc gì.",
      },
      {
        name: "Phân biệt hai cảm xúc gần giống",
        how: "Chọn một cặp bạn hay nhầm: lo lắng và hồi hộp, ghen tị và bất an, tức giận và bị tổn thương. Hỏi hai câu: mình đang sợ mất điều gì, và mình đang muốn điều gì. Viết câu trả lời rồi tự chọn tên đúng hơn cho cảm xúc đó.",
        why: "Gọi sai tên thì cách mình xử lý cũng sẽ sai theo.",
      },
      {
        name: "Nhật ký ba dòng",
        how: "Cuối ngày viết ba dòng: chuyện gì đã xảy ra, mình cảm thấy gì với mức mấy trên 10, và cơ thể phản ứng ra sao. Chỉ ba dòng, đừng viết dài. Làm đều trong hai tuần bạn sẽ thấy quy luật của riêng mình.",
        why: "Viết ngắn mà đều giúp bạn nhận ra cảm xúc nhanh hơn nhiều so với viết dài một lần.",
      },
    ],
  },
  {
    key: "understanding",
    code: "HI",
    name: "Hiểu cảm xúc",
    tagline: "Hiểu vì sao cảm xúc đó xuất hiện và nó sẽ đi về đâu.",
    question: "Điều gì đã châm ngòi cho cảm xúc này, và nếu để nguyên thì nó sẽ diễn tiến thế nào?",
    includes: [
      "Tìm ra nguyên nhân thật sự đứng sau cảm xúc",
      "Nhận ra khi trong lòng có nhiều cảm xúc trộn lẫn",
      "Thấy trước cảm xúc sẽ leo thang ra sao",
      "Phân biệt điều mình đang nghĩ với điều mình đang cảm",
    ],
    bands: {
      high: {
        label: "Hiểu khá sâu",
        meaning: "Bạn thường truy được nguyên nhân đứng sau cảm xúc, kể cả khi nó không rõ ràng ngay từ đầu. Bạn nhận ra mình có thể vừa giận vừa thương một người, và đoán được chuyện sẽ căng lên nếu không xử lý. Khi quá mệt, khả năng này vẫn có thể giảm, nên đừng coi đó là điều hiển nhiên.",
        examples: [
          "Khi bị phê bình trước lớp, bạn nhận ra cơn tức thật ra đến từ nỗi sợ bị xem là kém cỏi.",
          "Bạn biết nếu hai đứa cứ nhắn qua lại kiểu này thì tối nay sẽ cãi nhau, nên bạn đề nghị nói chuyện trực tiếp.",
        ],
      },
      mid: {
        label: "Hiểu được phần nổi",
        meaning: "Bạn thường hiểu đúng cảm xúc của mình, nhưng hay dừng ở nguyên nhân gần nhất mà chưa thấy gốc. Khi trong lòng có nhiều thứ trộn lẫn, bạn dễ chọn đại một cái để giải thích cho tất cả. Điều này khiến bạn xử lý trúng phần nổi nhưng chưa trúng vấn đề.",
        examples: [
          "Bạn nghĩ mình cáu vì bạn kia đi muộn, nhưng thật ra là vì đã nhắc ba lần mà không được coi trọng.",
          "Bạn biết mình buồn sau buổi họp nhóm, nhưng chưa nhận ra đó là cảm giác ý kiến của mình bị gạt đi.",
        ],
      },
      low: {
        label: "Dễ nhầm ngòi nổ",
        meaning: "Bạn thường thấy cảm xúc xuất hiện mà không rõ từ đâu, và hay gán nguyên nhân cho người gần nhất có mặt lúc đó. Chuyện trong lòng trộn nhiều cảm xúc cũng dễ làm bạn bối rối, nên bạn hay chọn im lặng hoặc nổi cáu. Đây là kỹ năng có thể luyện, không phải bản tính.",
        examples: [
          "Bạn gắt với em mình vì một chuyện nhỏ, trong khi cả ngày đang lo về học phí kỳ tới.",
          "Bạn nói mình ổn, rồi vài tiếng sau thấy trống rỗng mà không hiểu vì sao.",
        ],
      },
    },
    exercises: [
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
        name: "Đường leo thang",
        how: "Chọn một chuyện đang căng, viết ra ba mốc: hôm nay, sau ba ngày nữa nếu không ai nói gì, và sau hai tuần. Ở mỗi mốc ghi một câu về điều sẽ xảy ra. Đọc lại rồi quyết định xem bạn có muốn đi tới đó không.",
        why: "Nhìn thấy trước cái kết giúp bạn chọn xử lý sớm khi mọi chuyện còn dễ.",
      },
      {
        name: "Cảm xúc không đứng yên",
        how: "Khi đang rất khó chịu, hẹn giờ 20 phút rồi quay lại tự cho điểm từ 1 đến 10. Làm thêm hai lần nữa vào cuối ngày và hôm sau. Ghi lại đường đi của con số thay vì chỉ nhớ cảm giác lúc đỉnh điểm.",
        why: "Thấy cảm xúc tự hạ nhiệt giúp bạn bớt hành động vội lúc đang cao trào.",
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
    name: "Đồng cảm & nhìn từ phía người khác",
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
        label: "Hay đặt mình vào chỗ khác",
        meaning: "Bạn thường tự hỏi chuyện này trông thế nào từ phía người kia trước khi kết luận. Bạn phân biệt được điều mình thấy và điều mình phỏng đoán, nên ít khi gán ý xấu cho người khác. Bạn cũng biết công nhận cảm xúc của họ mà không cần đồng ý với mọi thứ họ làm.",
        examples: [
          "Khi bạn cùng nhóm nộp bài trễ, bạn hỏi tuần này họ có chuyện gì thay vì kết luận họ lười.",
          "Bạn nhắn cho đứa bạn đang buồn: 'Tao ở đây, mày muốn kể hay muốn tao ngồi im cùng mày?'",
        ],
      },
      mid: {
        label: "Hiểu nhưng vội kết luận",
        meaning: "Bạn thật sự muốn hiểu người khác và thường đoán khá đúng. Nhưng khi đang bực hoặc đang vội, bạn dễ biến phỏng đoán thành sự thật và nhảy vào khuyên trước khi hỏi. Điều này làm người kia thấy bị đánh giá dù ý bạn là tốt.",
        examples: [
          "Bạn thấy bạn mình im lặng trong nhóm lớp và nghĩ ngay là nó đang giận mình.",
          "Bạn đưa ra ba lời khuyên cho đứa bạn vừa bị điểm kém, rồi mới nhận ra nó chỉ cần được ngồi yên một lúc.",
        ],
      },
      low: {
        label: "Dễ thấy mình là trung tâm",
        meaning: "Khi có chuyện, bạn thường nhìn từ chỗ mình đứng trước tiên, nên dễ thấy người khác đang nhắm vào mình. Bạn cũng hay khuyên ngay khi thấy ai đó buồn, vì bạn thật lòng muốn giúp. Cả hai điều này đều sửa được bằng một câu hỏi trước khi kết luận.",
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
    key: "relationship",
    code: "QH",
    name: "Quan hệ & xử lý xung đột",
    tagline: "Nói điều mình cần và cùng sửa khi mọi thứ đổ vỡ.",
    question: "Bạn có nói được điều mình cần và cùng người kia sửa lại sau khi căng thẳng không?",
    includes: [
      "Nói rõ điều mình cần mà không công kích người khác",
      "Đặt giới hạn cho điều mình chấp nhận",
      "Hàn gắn lại sau một trận căng thẳng",
      "Nghe thật sự và nhận góp ý mà không phòng thủ",
    ],
    bands: {
      high: {
        label: "Nói được và sửa được",
        meaning: "Bạn thường nói được điều mình cần mà không biến nó thành đòn công kích người khác. Khi căng thẳng xảy ra, bạn có xu hướng quay lại tìm cách sửa thay vì im lặng cắt liên lạc. Bạn cũng chấp nhận rằng có những khác biệt sẽ không bao giờ được giải quyết, chỉ cần hai bên biết cách sống chung.",
        examples: [
          "Khi nhóm giao việc không đều, bạn nêu rõ phần mình đang làm và đề nghị chia lại, không nhắc chuyện cũ.",
          "Sau trận cãi với bạn cùng phòng, bạn nhắn hỏi tối nay nói chuyện được không và mở đầu bằng phần mình sai.",
        ],
      },
      mid: {
        label: "Có lúc nói được",
        meaning: "Bạn biết mình muốn gì nhưng hay diễn đạt thành lời trách móc, nên người kia phòng thủ thay vì lắng nghe. Khi mọi chuyện vui vẻ, bạn nói khá ổn, đến lúc căng thì bạn chọn im cho yên. Im lặng tạm thời giúp bạn tránh cãi nhau, nhưng chuyện thật thì vẫn còn đó.",
        examples: [
          "Bạn nói với bạn nhóm: 'Sao lần nào cũng là tao làm hết', và thế là cả nhóm im, chuyện không đi tới đâu.",
          "Bạn chọn không nhắn gì cho đứa bạn đã làm mình buồn, rồi hai tuần sau vẫn thấy khó chịu khi gặp.",
        ],
      },
      low: {
        label: "Hoặc im, hoặc nổ",
        meaning: "Trong xung đột, bạn thường chỉ có hai lựa chọn quen thuộc: nhịn hết cho yên, hoặc bùng lên rồi căng thẳng kéo dài. Bạn khó nói ra điều mình cần vào đúng lúc vì sợ bị coi là khó tính. Phần này luyện được bằng cách bắt đầu từ những chuyện nhỏ và nhẹ.",
        examples: [
          "Bạn nhịn suốt học kỳ chuyện nhóm trưởng giao việc, đến buổi cuối thì nói một tràng khiến ai cũng sững.",
          "Bạn chặn tài khoản người kia sau một trận cãi, rồi không còn cách nào nói lại chuyện đó nữa.",
        ],
      },
    },
    exercises: [
      {
        name: "Nói rõ điều mình cần",
        how: "Viết lại điều bạn muốn nói theo ba phần: chuyện đã xảy ra, cảm xúc của bạn, và điều bạn cần ở lần sau. Ví dụ: tuần này bạn gửi tin nhắn lúc mười một giờ; mình thấy gấp và lo; mình cần việc được chia trước hai ngày. Bỏ hết những từ như 'lúc nào cũng', 'chẳng bao giờ'.",
        why: "Nói về điều mình cần dễ được nghe hơn nhiều so với nói về việc người kia có tệ hay không.",
      },
      {
        name: "Đặt một giới hạn cụ thể",
        how: "Chọn một chuyện bạn hay bị cuốn vào, ví dụ trả lời tin nhắn lúc nửa đêm hoặc cho mượn tiền. Viết ra một câu giới hạn rõ ràng và nói được ngay khi cần. Tập nói cho trơn trước gương, và nhớ rằng giới hạn không cần kèm lời giải thích dài.",
        why: "Giới hạn rõ ràng giúp quan hệ bền hơn là nhịn cho tới lúc hết chịu nổi.",
      },
      {
        name: "Hàn gắn sau một trận cãi",
        how: "Chờ đến khi cả hai đã nguội, rồi nhắn một câu ngắn xin nói chuyện lại. Mở đầu bằng phần bạn thấy mình làm chưa ổn, dù chỉ một phần nhỏ. Hỏi người kia điều gì khiến họ nổi nóng, và nói điều bạn cần ở lần sau. Mục tiêu là hiểu nhau, không phải tìm ra ai thắng.",
        why: "Quay lại sau xung đột là việc khó nhất và cũng là việc giữ được quan hệ.",
      },
      {
        name: "Nghe mà không sửa",
        how: "Trong lần tới ai đó kể chuyện, tập chỉ nghe và gật, không chen vào bằng chuyện của mình, không đưa giải pháp. Khi họ dừng, kể lại vắn tắt điều bạn vừa nghe và hỏi xem có đúng không. Chịu được vài giây im lặng là phần quan trọng của bài này.",
        why: "Người ta chỉ thật sự kể khi thấy mình không bị ngắt và không bị đánh giá.",
      },
      {
        name: "Cho và nhận góp ý",
        how: "Khi góp ý, chọn một việc cụ thể, nói ngắn, và nói cả điều bạn thấy người kia đang làm tốt. Khi bị góp ý, thử nói câu ghi nhận trước khi giải thích: cảm ơn bạn đã nói, để mình xem lại. Có thể hỏi thêm một câu để chắc mình hiểu đúng điều họ muốn.",
        why: "Góp ý là cách hai bên biết điều người kia cần, nếu nói đúng cách thì nó không phải là cuộc tấn công.",
      },
    ],
  },
]

export const EQ_BY_KEY = Object.fromEntries(EQ_DIMENSIONS.map((d) => [d.key, d]))