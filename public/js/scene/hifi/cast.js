/* cast.js — dàn nhân vật chi tiết (bản vẽ hi-fi) cho mọi id mà cảnh dùng.

   Mỗi mục có cùng dạng với buildCharacter() của characterKit.js:
     HIFI_CAST[id] = { frames: { "<mood>-idle": rows, … }, palette, cols, rows, cell }
   Mọi khung của một nhân vật có đúng `rows` hàng x `cols` ký tự; ký tự "." = trong suốt, còn lại là khoá bảng màu.

   Kích thước theo thân hình (chân luôn chạm hàng cuối của khung nên cùng một đường chân y≈186):
     teen (friend, friend2, classmate, classmate2, player)   36 x 60 ô  (72 x 120 px)
     người lớn (teacher, teacherF, mom)                       36 x 68 ô  (72 x 136 px), cao hơn teen ~13%
     bé (kid)                                                 36 x 60 ô, dáng thấp ~47 hàng, 13 hàng trên cùng để trống

   Tên khung: <mood>-idle / <mood>-talk (neutral happy sad annoyed concerned defensive), neutral-react,
   neutral-blink, neutral-breathe, walk-a walk-b walk-c walk-d. */

import { buildCharacter, SPECS, MOODS, HEAD_BOX } from "./characterKit.js"

/** id của cảnh → đặc tả nhân vật trong characterKit.SPECS. */
const CAST_SPECS = {
  friend: SPECS.linh, // Linh: tóc dài đen, nơ đỏ
  classmate: SPECS.minh, // Minh: tóc nâu rẽ ngôi, huy hiệu Đoàn (không khăn quàng đỏ)
  friend2: SPECS.mai, // nữ sinh đuôi ngựa nâu
  classmate2: SPECS.duc, // nam sinh vạm vỡ, tóc gai, da rám
  player: SPECS.ban, // "Bạn": áo len ô-liu, tóc ngắn trung tính
  teacherF: SPECS.hanh, // cô Hạnh: áo dài xanh ngọc, búi tóc thấp
  teacher: SPECS.thay, // thầy: kính, tóc muối tiêu, sơ mi xanh
  mom: SPECS.me, // mẹ: áo ấm, tóc ngang vai
  kid: SPECS.bin, // em nhỏ ~9 tuổi
}

export const HIFI_CAST = Object.fromEntries(Object.entries(CAST_SPECS).map(([id, spec]) => [id, buildCharacter(spec)]))

/* ------------------------------------------------------------------ chân dung */
const firstInk = (rows) => {
  const i = rows.findIndex((r) => /[^. ]/.test(r))
  return i < 0 ? 0 : i
}

const portraitCache = new Map()

/**
 * Chân dung đầu-vai của nhân vật để phóng to cạnh khung thoại: cột HEAD_BOX.x0..x1, 18 hàng tính từ đỉnh tóc thật.
 * @param {string} id       id trong HIFI_CAST
 * @param {string} mood     neutral | happy | sad | annoyed | concerned | defensive (khác → neutral); "react", "blink" cũng được
 * @param {boolean} talking miệng mở (dùng khung <mood>-talk)
 * @returns {{rows: string[], palette: Record<string,string>, cols: number}|null}
 */
export function portraitFor(id, mood = "neutral", talking = false) {
  const cast = HIFI_CAST[id]
  if (!cast) return null
  const m = mood === "react" || mood === "surprised" ? "react" : mood === "blink" ? "blink" : MOODS.includes(mood) ? mood : "neutral"
  const name = m === "react" ? "neutral-react" : m === "blink" ? "neutral-blink" : `${m}-${talking ? "talk" : "idle"}`
  const key = `${id}|${name}`
  if (portraitCache.has(key)) return portraitCache.get(key)
  const src = cast.frames[name] ?? cast.frames["neutral-idle"]
  const top = firstInk(cast.frames["neutral-idle"])
  const out = {
    rows: src.slice(top, top + 18).map((r) => r.slice(HEAD_BOX.x0, HEAD_BOX.x1)),
    palette: cast.palette,
    cols: HEAD_BOX.x1 - HEAD_BOX.x0,
  }
  portraitCache.set(key, out)
  return out
}
