/* sceneScenarios.js — DATA cho các "cảnh tình huống EQ" (hệ thống mini-RPG pixel).
   Mỗi scenario là THUần TUỶ dữ liệu: môi trường, nhân vật + vị trí, hội thoại,
   timeline hành động, điểm quyết định, lựa chọn, và timeline hậu quả theo lựa chọn.
   KHÔNG chứa logic animation — runtime (sceneRuntime.js) đọc dữ liệu và diễn.

   Quy tắc dữ liệu:
   - timeline: mảng sự kiện {at (ms), char?, do, ...}. `at` là mốc TƯƠNG ĐỐI
     so với đầu timeline → kịch bản XÁC ĐỊNH, không random.
   - `do: "decisionPoint"` → runtime dừng kịch, hiện lựa chọn.
   - consequences: map idLựaChọn → mảng sự kiện hậu quả (1–4s).
   - scores: mỗi lựa chọn chấm các chiều EQ (0–3). Mọi lựa chọn trong một
     scenario dùng CÙNG bộ khoá chiều.
   - labels tiếng Việt; không sao chép tài sản game nào. */

export const SCENE_SCENARIOS = [
  {
    id: "scene-idea-credit",
    label: "PHÒNG HỌP",
    title: "Ý tưởng của bạn",
    environment: "office",
    characters: [
      { id: "player", x: 96, mood: "neutral" },
      { id: "manager", x: 160, mood: "neutral" },
      { id: "coworker", x: 224, mood: "neutral" },
      { id: "teammate", x: 272, mood: "neutral" },
    ],
    // Hội thoại mở màn: runtime gõ chữ trong khi timeline dưới đây diễn song song.
    dialogue: [
      "Buổi sáng họp nhóm. Đồng nghiệp của bạn bước tới bảng, tự tin giới thiệu một ý tưởng mới.",
      "Đó chính là ý tưởng bạn đã gợi ý với anh ấy ngày hôm qua.",
    ],
    dialogueSpeaker: "NHÓM DỰ ÁN",
    dialogueAs: "coworker",
    // Timeline chính: nhân vật vừa idle vừa hành động; kết thúc tại điểm quyết định.
    timeline: [
      { at: 200, char: "coworker", do: "walkTo", x: 208 },
      { at: 900, char: "coworker", do: "face", dir: "left" },
      { at: 1050, char: "manager", do: "lookAt", target: "coworker" },
      { at: 1150, char: "teammate", do: "lookAt", target: "coworker" },
      { at: 1300, char: "coworker", do: "talk", mood: "happy" },
      { at: 1750, char: "manager", do: "happy" },
      { at: 2050, char: "teammate", do: "nod" },
      { at: 2450, char: "player", do: "lookAt", target: "coworker" },
      { at: 2700, char: "player", do: "surprised" },
      { at: 2900, do: "reaction", glyph: "!", char: "player" },
      { at: 3300, char: "player", do: "annoyed" },
      { at: 3700, do: "decisionPoint" },
    ],
    choices: [
      {
        id: "A",
        code: "A",
        text: "Nêu thẳng ngay trong cuộc họp: “Đó là ý tôi đề xuất hôm qua.”",
        strategy: "Thẳng thắn nhưng đúng lúc nhạy cảm nhất.",
        consequence: "Phòng họp im đi một nhịp. Đồng nghiệp trở nên phòng vệ, bầu không khí căng lại.",
        scores: { assertiveness: 3, tact: 1, collaboration: 1, selfAwareness: 2 },
      },
      {
        id: "B",
        code: "B",
        text: "Để cuộc họp kết thúc, rồi tìm anh ấy nói riêng sau.",
        strategy: "Giữ thể diện cho cả hai, xử lý khi cảm xúc hạ nhiệt.",
        consequence: "Họp tan. Bạn bước tới bên anh ấy, giọng bình tĩnh. Anh ấy nghe và gật đầu.",
        scores: { assertiveness: 2, tact: 3, collaboration: 3, selfAwareness: 2 },
      },
      {
        id: "C",
        code: "C",
        text: "Im lặng, để mọi chuyện qua cho xong buổi họp.",
        strategy: "Tránh xung đột, nhưng cảm xúc tích lại trong bạn.",
        consequence: "Buổi họp tiếp diễn. Bạn ngồi yên, nhưng vẻ mặt dần thất vọng.",
        scores: { assertiveness: 0, tact: 2, collaboration: 2, selfAwareness: 1 },
      },
    ],
    consequences: {
      A: [
        { at: 100, char: "player", do: "talk", mood: "annoyed" },
        { at: 500, char: "coworker", do: "surprised" },
        { at: 900, char: "coworker", do: "annoyed" },
        { at: 1100, char: "manager", do: "annoyed" },
        { at: 1300, do: "reaction", glyph: "...", char: "manager" },
        { at: 1800, char: "teammate", do: "lookAt", target: "player" },
        { at: 2200, char: "player", do: "idle", mood: "annoyed" },
      ],
      B: [
        { at: 100, char: "manager", do: "talk", mood: "neutral" },
        { at: 700, do: "fade", to: 0.9 },
        { at: 1100, char: "player", do: "walkTo", x: 200 },
        { at: 1700, char: "player", do: "face", dir: "right" },
        { at: 1850, char: "coworker", do: "lookAt", target: "player" },
        { at: 2100, char: "player", do: "talk", mood: "neutral" },
        { at: 2800, char: "coworker", do: "nod" },
        { at: 3100, char: "coworker", do: "idle", mood: "neutral" },
        { at: 3500, char: "player", do: "idle", mood: "happy" },
      ],
      C: [
        { at: 100, char: "coworker", do: "talk", mood: "happy" },
        { at: 700, char: "manager", do: "nod" },
        { at: 1200, char: "player", do: "idle", mood: "sad" },
        { at: 1900, do: "reaction", glyph: "...", char: "player" },
        { at: 2500, char: "player", do: "idle", mood: "sad" },
      ],
    },
    // Gợi ý phản hồi học tập (hiện sau hậu quả, trước chuyển cảnh).
    practice: {
      signal: "Căng thẳng nhất là khoảnh khắc bạn vừa nhận ra ý tưởng bị ‘chiếm’.",
      stronger: "Xử lý riêng sau (B) vừa giữ thể diện, vừa cho cả hai bình tĩnh — thường là cách bảo toàn hợp tác tốt nhất.",
      principle: "Quản lý xung đột: chọn KỲ ĐIỂM và CÁCH thức, không chỉ chọn nói gì.",
    },
  },
]

export const SCENE_BY_ID = Object.fromEntries(SCENE_SCENARIOS.map((s) => [s.id, s]))
