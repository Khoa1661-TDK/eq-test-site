/* questBank.js — bộ 20 câu hỏi EQ (EQ_01 … EQ_20), chép nguyên văn từ tài liệu "Bộ 20 câu hỏi"
   (EQ_09 theo bản sửa trong tài liệu "Cập nhật hệ thống câu hỏi và kết quả").

   primary / secondary: tiêu chí EQ chính và phụ (bảng "Phân loại 20 câu hỏi theo 5 tiêu chí EQ"),
   dùng để rút đề cho đủ bao phủ năm tiêu chí và để rà soát nội dung.
   trait / weights / scores: hệ chấm điểm năm nhóm EQ (khôi phục nguyên văn từ bản 965d65c): trait là nhóm chính của câu,
   weights là trọng số (chính 1, phụ 0,5), scores là điểm 0–3 của từng đáp án cho từng nhóm. Riêng EQ_09 đã đổi bốn đáp án
   nên scores viết mới theo trọng số cũ { motivation: 1, selfAwareness: 0.5 }: D (dừng, ưu tiên, làm ngay) 3/3,
   B (lo lắng, không hành động) 1/2, C (trì hoãn, "giỏi khi bị dí") 1/1, A (bỏ cuộc) 0/1.
   Quy đổi: Self-awareness = selfAwareness · Self-regulation = selfManagement · Motivation = motivation
            Empathy = empathy · Social skills = socialSkills.
   Ghi chú theo tài liệu: câu 10 liệt kê cả Empathy lẫn Social skills ở mục chính (lấy Empathy làm chính,
   Social skills làm phụ); câu 16 không có tiêu chí chính (lấy Social skills làm chính).

   profile: profile mà đáp án đó góp một phiếu (data/eqProfiles.js). Bản gán đáp án → profile này do kỹ sư suy ra
   từ ý nghĩa từng đáp án so với mô tả profile, VÌ tài liệu chưa kèm danh sách của nhóm. Khi nhóm gửi danh sách
   chính thức, chỉ cần sửa trường `profile` ở từng đáp án rồi chạy `npm test` (test/quest.test.mjs kiểm tra:
   bốn đáp án của một câu thuộc bốn profile khác nhau; mỗi profile có 6–10 đáp án; mỗi profile xuất hiện ở các câu
   có ít nhất 3 tiêu chí chính khác nhau; mô phỏng 20.000 lượt để chắc không profile nào quá dễ hay quá khó thắng).

   Bảng gán (A/B/C/D → profile):
   EQ_01  A quickReactor       B midnightThinker    C emotionKeeper      D steadyNavigator
   EQ_02  A lastMinuteSprinter B steadyNavigator    C bridgeBuilder      D quietObserver
   EQ_03  A kindAccommodator   B directCommunicator C midnightThinker    D bridgeBuilder
   EQ_04  A directCommunicator B emotionKeeper      C steadyNavigator    D midnightThinker
   EQ_05  A quietObserver      B kindAccommodator   C boldInitiator      D bridgeBuilder
   EQ_06  A boldInitiator      B lastMinuteSprinter C directCommunicator D midnightThinker
   EQ_07  A emotionKeeper      B quickReactor       C bridgeBuilder      D kindAccommodator
   EQ_08  A quietObserver      B midnightThinker    C steadyNavigator    D boldInitiator
   EQ_09  A emotionKeeper      B midnightThinker    C lastMinuteSprinter D boldInitiator
   EQ_10  A emotionKeeper      B quickReactor       C quietObserver      D lastMinuteSprinter
   EQ_11  A quickReactor       B emotionKeeper      C lastMinuteSprinter D midnightThinker
   EQ_12  A directCommunicator B quietObserver      C emotionKeeper      D steadyNavigator
   EQ_13  A kindAccommodator   B quietObserver      C boldInitiator      D emotionKeeper
   EQ_14  A midnightThinker    B directCommunicator C quickReactor       D steadyNavigator
   EQ_15  A quickReactor       B kindAccommodator   C quietObserver      D bridgeBuilder
   EQ_16  A directCommunicator B kindAccommodator   C quietObserver      D bridgeBuilder
   EQ_17  A lastMinuteSprinter B steadyNavigator    C bridgeBuilder      D emotionKeeper
   EQ_18  A boldInitiator      B bridgeBuilder      C quickReactor       D emotionKeeper
   EQ_19  A boldInitiator      B midnightThinker    C quickReactor       D steadyNavigator
   EQ_20  A directCommunicator B steadyNavigator    C kindAccommodator   D bridgeBuilder
*/
export const QUEST_BANK = [
  {
    id: "EQ_01",
    trait: "motivation",
    weights: { motivation: 1, selfAwareness: 0.5 },
    primary: "selfAwareness",
    secondary: ["motivation"],
    title: "Nỗ lực nhiều nhưng điểm vẫn thấp",
    context: "Bạn dành nhiều ngày ôn thi, thậm chí bỏ cả những buổi đi chơi để học. Nhưng khi nhận kết quả, điểm số lại thấp hơn mong đợi, trong khi người bạn chỉ ôn bài vào tối hôm trước lại đạt điểm cao hơn bạn.",
    prompt: "Bạn sẽ phản ứng thế nào?",
    choices: [
      { id: "EQ_01_A", code: "A", text: "Cảm thấy bất công, khó chịu vì người khác học ít hơn mà vẫn đạt điểm cao hơn mình.", profile: "quickReactor", scores: { motivation: 1, selfAwareness: 1 } },
      { id: "EQ_01_B", code: "B", text: "Thất vọng, nghi ngờ năng lực của bản thân dù đã cố gắng rất nhiều.", profile: "midnightThinker", scores: { motivation: 0, selfAwareness: 1 } },
      { id: "EQ_01_C", code: "C", text: "Tỏ ra bình thường, chúc mừng bạn nhưng âm thầm so sánh mình với họ.", profile: "emotionKeeper", scores: { motivation: 1, selfAwareness: 0 } },
      { id: "EQ_01_D", code: "D", text: "Chấp nhận cảm giác thất vọng, xem lại bài thi để tìm cách cải thiện kết quả lần sau.", profile: "steadyNavigator", scores: { motivation: 3, selfAwareness: 3 } },
    ],
  },
  {
    id: "EQ_02",
    trait: "selfManagement",
    weights: { selfManagement: 1, socialSkills: 0.5 },
    primary: "selfManagement",
    secondary: ["selfAwareness"],
    title: "Bất ngờ bị thầy Đức gọi tên",
    context: "Trong giờ học, bạn đang lơ đễnh nên không nghe thầy Đức giảng. Bỗng thầy gọi bạn đứng dậy trả lời câu hỏi vừa rồi, cả lớp đều quay lại nhìn, nhưng bạn chẳng biết thầy đang hỏi gì.",
    prompt: "Bạn sẽ phản ứng thế nào?",
    choices: [
      { id: "EQ_02_A", code: "A", text: "Đứng dậy, lắp bắp trả lời lan man để kéo dài thời gian.", profile: "lastMinuteSprinter", scores: { selfManagement: 1, socialSkills: 0 } },
      { id: "EQ_02_B", code: "B", text: "Thành thật xin thầy nhắc lại câu hỏi hoặc gợi ý thêm.", profile: "steadyNavigator", scores: { selfManagement: 3, socialSkills: 3 } },
      { id: "EQ_02_C", code: "C", text: "Liếc sang bạn bên cạnh cầu cứu, mong được mớm đáp án.", profile: "bridgeBuilder", scores: { selfManagement: 1, socialSkills: 1 } },
      { id: "EQ_02_D", code: "D", text: "Cười trừ, im lặng vì không biết trả lời và chấp nhận bị phạt hoặc trừ điểm.", profile: "quietObserver", scores: { selfManagement: 2, socialSkills: 1 } },
    ],
  },
  {
    id: "EQ_03",
    trait: "selfAwareness",
    weights: { selfAwareness: 1, socialSkills: 0.5 },
    primary: "empathy",
    secondary: ["socialSkills"],
    title: "Bạn thân nhờ vả nhưng bản thân đang quá tải",
    context: "Đứa bạn thân nhắn tin nhờ làm hộ slide thuyết trình trong lúc bạn đang ngập ngụa deadline.",
    prompt: "Quyết định thực tế của bạn?",
    choices: [
      { id: "EQ_03_A", code: "A", text: "Trong lòng bực dọc nhưng vẫn bấm bụng nhận lời vì sợ mất lòng.", profile: "kindAccommodator", scores: { selfAwareness: 1, socialSkills: 1 } },
      { id: "EQ_03_B", code: "B", text: "Từ chối thẳng thừng: \"Tao đang ngập đầu, tự lo đi\".", profile: "directCommunicator", scores: { selfAwareness: 2, socialSkills: 0 } },
      { id: "EQ_03_C", code: "C", text: "Day dứt, trằn trọc lo sợ bạn sẽ giận mình vì từ chối.", profile: "midnightThinker", scores: { selfAwareness: 1, socialSkills: 1 } },
      { id: "EQ_03_D", code: "D", text: "Từ chối khéo và quăng cho nó vài tài liệu để tự mày mò.", profile: "bridgeBuilder", scores: { selfAwareness: 3, socialSkills: 3 } },
    ],
  },
  {
    id: "EQ_04",
    trait: "selfManagement",
    weights: { selfManagement: 1, socialSkills: 0.5 },
    primary: "socialSkills",
    secondary: ["selfAwareness"],
    title: "Bị người khác hiểu lầm và nói xấu sau lưng",
    context: "Bạn nghe tin có người nói xấu mình, cho rằng bạn hay tranh công và chỉ biết nghĩ cho bản thân.",
    prompt: "Bạn sẽ phản ứng thế nào?",
    choices: [
      { id: "EQ_04_A", code: "A", text: "Chủ động tìm gặp người đó để nói chuyện thẳng thắn và làm rõ sự việc.", profile: "directCommunicator", scores: { selfManagement: 3, socialSkills: 3 } },
      { id: "EQ_04_B", code: "B", text: "Giả vờ như không có chuyện gì, nhưng dần giữ khoảng cách với mọi người.", profile: "emotionKeeper", scores: { selfManagement: 1, socialSkills: 0 } },
      { id: "EQ_04_C", code: "C", text: "Không quan tâm đến lời bàn tán, tiếp tục làm việc của mình.", profile: "steadyNavigator", scores: { selfManagement: 2, socialSkills: 1 } },
      { id: "EQ_04_D", code: "D", text: "Bắt đầu nghi ngờ bản thân, tự hỏi liệu mình có thật sự từng hành xử như vậy không.", profile: "midnightThinker", scores: { selfManagement: 1, socialSkills: 0 } },
    ],
  },
  {
    id: "EQ_05",
    trait: "empathy",
    weights: { empathy: 1, socialSkills: 0.5 },
    primary: "socialSkills",
    secondary: ["selfAwareness"],
    title: "Lạc lõng giữa buổi hội nhóm đông người lạ",
    context: "Vào câu lạc bộ mới, mọi người nói cười rôm rả, bạn đứng một góc cầm ly nước không biết bắt chuyện từ đâu.",
    prompt: "Bạn sẽ làm gì?",
    choices: [
      { id: "EQ_05_A", code: "A", text: "Cắm mặt vào điện thoại giả vờ bận rộn để che giấu sự ngượng ngùng.", profile: "quietObserver", scores: { empathy: 0, socialSkills: 0 } },
      { id: "EQ_05_B", code: "B", text: "Cố gượng cười chen vào một nhóm bất kỳ và hùa theo mấy chuyện chẳng hiểu gì.", profile: "kindAccommodator", scores: { empathy: 1, socialSkills: 1 } },
      { id: "EQ_05_C", code: "C", text: "Quan sát rồi chủ động bắt chuyện với một đứa cô đơn giống mình.", profile: "boldInitiator", scores: { empathy: 3, socialSkills: 3 } },
      { id: "EQ_05_D", code: "D", text: "Tìm kiếm bạn của bạn hoặc người bạn quen để đỡ lạc lõng.", profile: "bridgeBuilder", scores: { empathy: 1, socialSkills: 2 } },
    ],
  },
  {
    id: "EQ_06",
    trait: "motivation",
    weights: { motivation: 1, selfManagement: 0.5 },
    primary: "motivation",
    secondary: ["selfAwareness", "selfManagement"],
    title: "Giảng viên random nhóm , chỉ định cho bạn làm leader của nhóm và project khá là nặng.",
    context: "Giảng viên chỉ định bạn làm leader project khá khó, áp lực khủng khiếp và rủi ro cao.",
    prompt: "Bạn sẽ làm gì?",
    choices: [
      { id: "EQ_06_A", code: "A", text: "Dù có chút lo lắng, bạn vẫn sẵn sàng đón nhận thử thách và xem đây là cơ hội để chứng minh năng lực của bản thân.", profile: "boldInitiator", scores: { motivation: 3, selfManagement: 3 } },
      { id: "EQ_06_B", code: "B", text: "Tìm cách chuyển giao trách nhiệm cho một người bạn để tránh phải đảm nhận vai trò leader.", profile: "lastMinuteSprinter", scores: { motivation: 1, selfManagement: 1 } },
      { id: "EQ_06_C", code: "C", text: "Nhận thấy dự án vượt quá khả năng của mình nên thẳng thắn từ chối ngay từ đầu.", profile: "directCommunicator", scores: { motivation: 1, selfManagement: 2 } },
      { id: "EQ_06_D", code: "D", text: "Lo lắng mất ăn mất ngủ, tưởng tượng đủ viễn cảnh thảm họa.", profile: "midnightThinker", scores: { motivation: 1, selfManagement: 0 } },
    ],
  },
  {
    id: "EQ_07",
    trait: "empathy",
    weights: { empathy: 1, selfManagement: 0.5 },
    primary: "selfManagement",
    secondary: ["empathy", "socialSkills"],
    title: "Ý tưởng tâm huyết bị nhóm bỏ qua phũ phàng",
    context: "Ý tưởng thức đêm suy nghĩ bị cả nhóm gạt đi vì cho là không khả thi.",
    prompt: "Bạn sẽ phản ứng như nào?",
    choices: [
      { id: "EQ_07_A", code: "A", text: "Im lặng từ đó đến cuối buổi, tự ái ngầm và mặc kệ nhóm muốn làm gì thì làm.", profile: "emotionKeeper", scores: { empathy: 0, selfManagement: 1 } },
      { id: "EQ_07_B", code: "B", text: "Nổi nóng cãi tay đôi để bảo vệ ý tưởng vì tổn thương tự trọng.", profile: "quickReactor", scores: { empathy: 0, selfManagement: 0 } },
      { id: "EQ_07_C", code: "C", text: "Hụt hẫng chút rồi nhanh chóng dẹp cái tôi để nghe lý do của nhóm.", profile: "bridgeBuilder", scores: { empathy: 3, selfManagement: 3 } },
      { id: "EQ_07_D", code: "D", text: "Đồng tình hùa theo số đông ngay lập tức cho nhanh gọn.", profile: "kindAccommodator", scores: { empathy: 1, selfManagement: 2 } },
    ],
  },
  {
    id: "EQ_08",
    trait: "selfAwareness",
    weights: { selfAwareness: 1, motivation: 0.5 },
    primary: "selfAwareness",
    secondary: ["selfManagement"],
    title: "Nhận lời khen bất ngờ trước tập thể",
    context: "Thầy Đức bất ngờ tuyên dương bài làm của bạn trước toàn lớp.",
    prompt: "Bạn sẽ phản ứng như nào?",
    choices: [
      { id: "EQ_08_A", code: "A", text: "Ngượng chín mặt, chỉ muốn tìm chỗ trốn ngay lập tức.", profile: "quietObserver", scores: { selfAwareness: 1, motivation: 1 } },
      { id: "EQ_08_B", code: "B", text: "Thầm nghĩ thầy khen xã giao chứ mình có giỏi gì đâu.", profile: "midnightThinker", scores: { selfAwareness: 0, motivation: 1 } },
      { id: "EQ_08_C", code: "C", text: "Vui vẻ đón nhận, thấy nỗ lực của mình đã được đền đáp xứng đáng.", profile: "steadyNavigator", scores: { selfAwareness: 3, motivation: 3 } },
      { id: "EQ_08_D", code: "D", text: "Thầm kiêu ngạo, thấy bản thân thực sự vượt trội hơn lớp.", profile: "boldInitiator", scores: { selfAwareness: 1, motivation: 2 } },
    ],
  },
  {
    id: "EQ_09",
    trait: "motivation",
    weights: { motivation: 1, selfAwareness: 0.5 },
    primary: "motivation",
    secondary: ["selfAwareness", "selfManagement"],
    title: "Trì hoãn ngập đầu sát nút deadline",
    context: "Chỉ còn vài giờ nữa là đến hạn nộp bài, nhưng bạn đã dành phần lớn thời gian để lướt mạng xã hội và chơi game.",
    prompt: "Bạn sẽ làm gì tiếp theo?",
    choices: [
      { id: "EQ_09_A", code: "A", text: "Chấp nhận không hoàn thành bài vì cho rằng hiện tại đã quá muộn để bắt đầu.", profile: "emotionKeeper", scores: { motivation: 0, selfAwareness: 1 } },
      { id: "EQ_09_B", code: "B", text: "Tiếp tục lo lắng vì chưa biết bắt đầu từ đâu, nhưng chưa thực hiện hành động cụ thể nào.", profile: "midnightThinker", scores: { motivation: 1, selfAwareness: 2 } },
      { id: "EQ_09_C", code: "C", text: "Cho rằng mình luôn làm việc tốt nhất dưới áp lực thời gian nên tiếp tục trì hoãn.", profile: "lastMinuteSprinter", scores: { motivation: 1, selfAwareness: 1 } },
      { id: "EQ_09_D", code: "D", text: "Tạm dừng mạng xã hội, xác định những phần quan trọng nhất của bài và bắt tay làm ngay.", profile: "boldInitiator", scores: { motivation: 3, selfAwareness: 3 } },
    ],
  },
  {
    id: "EQ_10",
    trait: "empathy",
    weights: { empathy: 1, socialSkills: 0.5 },
    primary: "empathy",
    secondary: ["socialSkills"],
    title: "Khi các thành viên trong nhóm xảy ra mâu thuẫn",
    context: "Sắp đến ngày thuyết trình dự án môn học, hai thành viên chủ chốt trong nhóm xảy ra tranh cãi gay gắt, liên tục công kích nhau và không ai chịu nhường ai.",
    prompt: "Bạn sẽ phản ứng như nào?",
    choices: [
      { id: "EQ_10_A", code: "A", text: "Tắt thông báo nhóm, tránh tham gia vào cuộc tranh cãi và mặc kệ mọi chuyện.", profile: "emotionKeeper", scores: { empathy: 0, socialSkills: 0 } },
      { id: "EQ_10_B", code: "B", text: "Bực bội vì mâu thuẫn của hai người đang ảnh hưởng đến tiến độ và kết quả chung của cả nhóm.", profile: "quickReactor", scores: { empathy: 2, socialSkills: 1 } },
      { id: "EQ_10_C", code: "C", text: "Âm thầm theo dõi cuộc tranh cãi, ngoài mặt tỏ ra muốn hòa giải nhưng vẫn tò mò xem ai đúng, ai sai.", profile: "quietObserver", scores: { empathy: 1, socialSkills: 1 } },
      { id: "EQ_10_D", code: "D", text: "Cảm thấy bất lực, chán nản và không còn muốn tiếp tục làm dự án nữa.", profile: "lastMinuteSprinter", scores: { empathy: 1, socialSkills: 0 } },
    ],
  },
  {
    id: "EQ_11",
    trait: "selfManagement",
    weights: { selfManagement: 1, motivation: 0.5 },
    primary: "selfManagement",
    secondary: ["motivation"],
    title: "Biến cố phút chót phá nát kế hoạch",
    context: "Bạn đang chuẩn bị đi quay phỏng vấn cho dự án môn học thì trời bất ngờ đổ mưa lớn, thiết bị gặp trục trặc, khiến mọi công sức chuẩn bị trước đó gần như đổ bể.",
    prompt: "Bạn sẽ phản ứng như nào?",
    choices: [
      { id: "EQ_11_A", code: "A", text: "Chửi thề vì quá bực tức, gặp gì cũng muốn trút giận để xả hết sự khó chịu.", profile: "quickReactor", scores: { selfManagement: 0, motivation: 0 } },
      { id: "EQ_11_B", code: "B", text: "Ngồi thẫn thờ nhìn trời mưa, mất hết động lực và không muốn tiếp tục công việc nữa.", profile: "emotionKeeper", scores: { selfManagement: 1, motivation: 0 } },
      { id: "EQ_11_C", code: "C", text: "Tự than trời vì quá đen đủi, rồi tự an ủi rằng thôi thì ở nhà ngủ cho sướng.", profile: "lastMinuteSprinter", scores: { selfManagement: 2, motivation: 0 } },
      { id: "EQ_11_D", code: "D", text: "Hoảng hốt vì sợ bị trừ điểm, rồi bắt đầu cáu gắt và trút sự bực bội lên những người xung quanh.", profile: "midnightThinker", scores: { selfManagement: 0, motivation: 1 } },
    ],
  },
  {
    id: "EQ_12",
    trait: "socialSkills",
    weights: { socialSkills: 1, selfManagement: 0.5 },
    primary: "socialSkills",
    secondary: ["selfManagement"],
    title: "Đồng đội quay xe phút chót",
    context: "Cả nhóm thức khuya chạy deadline cho bài thuyết trình. Đến sát ngày nộp, một thành viên lại nói với giảng viên rằng mình làm gần hết bài, còn những người khác chẳng đóng góp gì.",
    prompt: "Bạn sẽ phản ứng như nào?",
    choices: [
      { id: "EQ_12_A", code: "A", text: "Tức quá nên nhắn vào nhóm hỏi cho ra lẽ, nói thẳng những gì người đó đã làm.", profile: "directCommunicator", scores: { socialSkills: 1, selfManagement: 0 } },
      { id: "EQ_12_B", code: "B", text: "Giả vờ như chưa biết chuyện, âm thầm lưu lại tin nhắn và những phần mình đã làm để phòng khi cần.", profile: "quietObserver", scores: { socialSkills: 2, selfManagement: 2 } },
      { id: "EQ_12_C", code: "C", text: "Thất vọng vì công sức của mình bị phủ nhận, từ đó không muốn làm việc chung với người đó nữa.", profile: "emotionKeeper", scores: { socialSkills: 0, selfManagement: 1 } },
      { id: "EQ_12_D", code: "D", text: "Bình tĩnh gom lại bằng chứng đóng góp của từng người để giải thích rõ với giảng viên.", profile: "steadyNavigator", scores: { socialSkills: 3, selfManagement: 3 } },
    ],
  },
  {
    id: "EQ_13",
    trait: "motivation",
    weights: { motivation: 1, socialSkills: 0.5 },
    primary: "socialSkills",
    secondary: ["selfManagement"],
    title: "Group chat bỗng dưng im lặng đến đáng sợ",
    context: "Leader tag cả nhóm vào group chat nhắc tiến độ bài báo cáo, nhưng chẳng ai trả lời dù ai cũng đã xem tin nhắn.",
    prompt: "Bạn sẽ phản ứng như nào?",
    choices: [
      { id: "EQ_13_A", code: "A", text: "Bực mình vì ai cũng im thin thít, muốn nhảy vào nhắc cho một trận nhưng lại sợ cả nhóm căng thẳng.", profile: "kindAccommodator", scores: { motivation: 1, socialSkills: 1 } },
      { id: "EQ_13_B", code: "B", text: "Thấy chẳng ai nói gì nên mình cũng im luôn, cứ làm xong phần của mình trước đã.", profile: "quietObserver", scores: { motivation: 2, socialSkills: 0 } },
      { id: "EQ_13_C", code: "C", text: "Nhắn riêng từng đứa hỏi xem làm tới đâu rồi, tiện nhắc luôn cho khỏi quên.", profile: "boldInitiator", scores: { motivation: 3, socialSkills: 3 } },
      { id: "EQ_13_D", code: "D", text: "Chán nản vì cả nhóm chẳng ai chịu lên tiếng, cảm thấy làm việc với nhóm kiểu này thật mệt mỏi.", profile: "emotionKeeper", scores: { motivation: 0, socialSkills: 0 } },
    ],
  },
  {
    id: "EQ_14",
    trait: "selfManagement",
    weights: { selfManagement: 1, socialSkills: 0.5 },
    primary: "selfManagement",
    secondary: ["socialSkills"],
    title: "Thuyết trình nhóm bị giảng viên nhắc nhở số liệu sai",
    context: "Nhóm đang đứng trên bục giảng thuyết trình thì bị thầy Đức cắt ngang, chỉ thẳng vào slide và bảo số liệu này không chính xác",
    prompt: "Phản ứng đối phó tức thời của bạn?",
    choices: [
      { id: "EQ_14_A", code: "A", text: "Đứng hình toàn tập, mặt cắt không còn giọt máu, lắp bắp không nói nên lời trước cả lớp.", profile: "midnightThinker", scores: { selfManagement: 0, socialSkills: 1 } },
      { id: "EQ_14_B", code: "B", text: "Cố cãi cùn để bảo vệ quan điểm đến cùng dù biết slide có chỗ sơ hở.", profile: "directCommunicator", scores: { selfManagement: 0, socialSkills: 0 } },
      { id: "EQ_14_C", code: "C", text: "Đổ vội trách nhiệm cho đứa làm slide phần đó bằng một ánh mắt hoặc câu lấp lửng.", profile: "quickReactor", scores: { selfManagement: 1, socialSkills: 0 } },
      { id: "EQ_14_D", code: "D", text: "Cười trừ nhận lỗi thẳng thắn, khéo léo xin phép nhóm bổ sung lại số liệu sau buổi học.", profile: "steadyNavigator", scores: { selfManagement: 3, socialSkills: 3 } },
    ],
  },
  {
    id: "EQ_15",
    trait: "socialSkills",
    weights: { socialSkills: 1, selfAwareness: 0.5 },
    primary: "socialSkills",
    secondary: [],
    title: "Đồ cá nhân bỗng thành đồ dùng chung",
    context: "Bạn phát hiện bạn cùng phòng thường xuyên lấy mỹ phẩm, đồ ăn và quần áo của mình dùng mà không hỏi trước. Khi bạn bắt đầu cất riêng đồ đạc, người đó nói: “Ở chung với nhau mà tính toán từng chút, có mấy món đồ cũng tiếc!”",
    prompt: "Bạn sẽ phản ứng như thế nào?",
    choices: [
      { id: "EQ_15_A", code: "A", text: "Tức giận, hỏi thẳng tại sao người đó cứ tự ý lấy đồ của mình.", profile: "quickReactor", scores: { socialSkills: 1, selfAwareness: 2 } },
      { id: "EQ_15_B", code: "B", text: "Dù khó chịu nhưng vẫn bỏ qua, vì không muốn mất hòa khí chỉ vì vài món đồ.", profile: "kindAccommodator", scores: { socialSkills: 1, selfAwareness: 0 } },
      { id: "EQ_15_C", code: "C", text: "Cất kỹ đồ đạc hơn, món nào dễ bị lấy thì giấu đi, không muốn nói chuyện trực tiếp.", profile: "quietObserver", scores: { socialSkills: 1, selfAwareness: 1 } },
      { id: "EQ_15_D", code: "D", text: "Nói rõ rằng mình vẫn sẵn lòng cho mượn nếu được hỏi trước, chứ không phải cứ ở chung là có thể tự ý dùng đồ của nhau.", profile: "bridgeBuilder", scores: { socialSkills: 3, selfAwareness: 3 } },
    ],
  },
  {
    id: "EQ_16",
    trait: "socialSkills",
    weights: { socialSkills: 1, selfManagement: 0.5 },
    primary: "socialSkills",
    secondary: ["selfManagement", "empathy"],
    title: "Bạn cùng phòng dẫn người yêu về ngủ",
    context: "Bạn đi học về sau một ngày dài thì thấy bạn cùng phòng dẫn người yêu về ngủ mà không báo trước, khiến bạn khó chịu ngay trong chính căn phòng của mình.",
    prompt: "Bạn sẽ phản ứng như nào?",
    choices: [
      { id: "EQ_16_A", code: "A", text: "Tức giận, nói thẳng vì cảm thấy quyền riêng tư của mình không được tôn trọng.", profile: "directCommunicator", scores: { socialSkills: 1, selfManagement: 0 } },
      { id: "EQ_16_B", code: "B", text: "Dù khó chịu vẫn im lặng, cố tránh ở phòng để khỏi phải chạm mặt.", profile: "kindAccommodator", scores: { socialSkills: 0, selfManagement: 1 } },
      { id: "EQ_16_C", code: "C", text: "Không nói gì, nhưng bắt đầu tính chuyện chuyển phòng.", profile: "quietObserver", scores: { socialSkills: 1, selfManagement: 1 } },
      { id: "EQ_16_D", code: "D", text: "Bình tĩnh nói rõ sự bất tiện và đề nghị thống nhất quy tắc chung.", profile: "bridgeBuilder", scores: { socialSkills: 3, selfManagement: 3 } },
    ],
  },
  {
    id: "EQ_17",
    trait: "selfAwareness",
    weights: { selfAwareness: 1, socialSkills: 0.5 },
    primary: "selfAwareness",
    secondary: ["socialSkills"],
    title: "Khi bạn bè rủ đi chơi mà mình hết tiền",
    context: "Bạn bè thường rủ nhau đi ăn, cà phê hay mua sắm, nhưng tiền tiêu vặt của bạn có hạn. Bạn muốn đi cùng mọi người nhưng lại lo không đủ tiền tiêu đến cuối tháng.",
    prompt: "Bạn sẽ làm gì?",
    choices: [
      { id: "EQ_17_A", code: "A", text: "Cứ đi cùng mọi người, hết tiền rồi tính sau.", profile: "lastMinuteSprinter", scores: { selfAwareness: 0, socialSkills: 1 } },
      { id: "EQ_17_B", code: "B", text: "Từ chối những buổi đi chơi để tiết kiệm tiền.", profile: "steadyNavigator", scores: { selfAwareness: 2, socialSkills: 0 } },
      { id: "EQ_17_C", code: "C", text: "Nói thật với bạn bè và rủ mọi người đi những chỗ rẻ hơn.", profile: "bridgeBuilder", scores: { selfAwareness: 3, socialSkills: 3 } },
      { id: "EQ_17_D", code: "D", text: "Vẫn đi cùng nhưng cố tỏ ra bình thường, dù trong lòng khá áp lực.", profile: "emotionKeeper", scores: { selfAwareness: 1, socialSkills: 1 } },
    ],
  },
  {
    id: "EQ_18",
    trait: "empathy",
    weights: { empathy: 1, selfManagement: 0.5 },
    primary: "selfManagement",
    secondary: ["socialSkills"],
    title: "Mất mũ bảo hiểm ở bãi giữ xe",
    context: "Tan học, bạn ra bãi giữ xe và phát hiện chiếc mũ bảo hiểm của mình đã biến mất. Bạn tìm quanh một lúc nhưng vẫn không thấy. Bạn không biết ai đã lấy mũ hay chuyện gì đã xảy ra.",
    prompt: "Bạn sẽ làm gì?",
    choices: [
      { id: "EQ_18_A", code: "A", text: "Báo với nhân viên giữ xe và nhờ hỗ trợ tìm lại chiếc mũ.", profile: "boldInitiator", scores: { empathy: 3, selfManagement: 3 } },
      { id: "EQ_18_B", code: "B", text: "Chụp ảnh đăng Locket than thở vì mất mũ.", profile: "bridgeBuilder", scores: { empathy: 1, selfManagement: 1 } },
      { id: "EQ_18_C", code: "C", text: "Lấy tạm một chiếc mũ khác trong bãi xe vì nghĩ người lấy mũ của mình cũng đã làm như vậy.", profile: "quickReactor", scores: { empathy: 0, selfManagement: 0 } },
      { id: "EQ_18_D", code: "D", text: "Bực mình bỏ về, tự nhủ lần sau sẽ cẩn thận hơn.", profile: "emotionKeeper", scores: { empathy: 2, selfManagement: 1 } },
    ],
  },
  {
    id: "EQ_19",
    trait: "selfAwareness",
    weights: { selfAwareness: 1, motivation: 0.5 },
    primary: "selfAwareness",
    secondary: ["selfManagement"],
    title: "Cả lớp mang laptop, chỉ mình bạn không mang",
    context: "Giảng viên đã báo trước về bài kiểm tra trên laptop, nhưng bạn không chú ý nghe nên quên mất. Đến lớp, ai cũng có laptop, chỉ mình bạn không mang và bài kiểm tra sắp bắt đầu.",
    prompt: "Bạn sẽ làm gì?",
    choices: [
      { id: "EQ_19_A", code: "A", text: "Giải thích với giảng viên và chủ động tìm cách giải quyết.", profile: "boldInitiator", scores: { selfAwareness: 3, motivation: 3 } },
      { id: "EQ_19_B", code: "B", text: "Xấu hổ, lo lắng vì sợ bị giảng viên đánh giá thiếu trách nhiệm.", profile: "midnightThinker", scores: { selfAwareness: 1, motivation: 0 } },
      { id: "EQ_19_C", code: "C", text: "Bực bội, cho rằng giảng viên nên nhắc lại trước giờ kiểm tra.", profile: "quickReactor", scores: { selfAwareness: 0, motivation: 0 } },
      { id: "EQ_19_D", code: "D", text: "Chấp nhận hậu quả vì biết mình đã không chú ý nghe thông báo.", profile: "steadyNavigator", scores: { selfAwareness: 2, motivation: 1 } },
    ],
  },
  {
    id: "EQ_20",
    trait: "socialSkills",
    weights: { socialSkills: 1, empathy: 0.5 },
    primary: "socialSkills",
    secondary: ["empathy"],
    title: "Người luôn cho mình là đúng",
    context: "Trong lúc làm bài tập nhóm, một thành viên luôn cho rằng ý kiến của mình là tốt nhất và liên tục bác bỏ ý kiến của người khác. Bạn ấy còn tỏ thái độ coi thường khi mọi người không đồng tình với mình.",
    prompt: "Bạn sẽ làm gì?",
    choices: [
      { id: "EQ_20_A", code: "A", text: "Thẳng thắn phản biện và bảo vệ ý kiến của mình.", profile: "directCommunicator", scores: { socialSkills: 1, empathy: 0 } },
      { id: "EQ_20_B", code: "B", text: "Đưa ra lý lẽ để cả nhóm cùng đánh giá các ý tưởng một cách công bằng.", profile: "steadyNavigator", scores: { socialSkills: 3, empathy: 3 } },
      { id: "EQ_20_C", code: "C", text: "Im lặng cho qua vì không muốn tranh cãi.", profile: "kindAccommodator", scores: { socialSkills: 0, empathy: 0 } },
      { id: "EQ_20_D", code: "D", text: "Trao đổi với các thành viên khác để cùng tìm cách giải quyết.", profile: "bridgeBuilder", scores: { socialSkills: 2, empathy: 2 } },
    ],
  },
];
