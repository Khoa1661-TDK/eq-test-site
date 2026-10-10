/* hifi/characterKit.js — PROTOTYPE: bộ dựng nhân vật pixel độ phân giải cao (teen thật, ~6 đầu).

   KHÔNG nối vào game. Đây là bản thử để chủ dự án duyệt phong cách trước khi vẽ lại toàn bộ.

   Khác với sprites.js (lưới gõ tay), nhân vật ở đây được SINH từ các lớp:
     1. Hình khối (đùi, tay, thân, đầu, tóc...) là các "part": capsule / ellipsoid / hồ sơ từng hàng.
     2. Mỗi part tự tô bóng theo MỘT nguồn sáng cố định (trên-trái) thành 4 sắc (sáng, nền, tối, sâu)
        nên ánh sáng luôn nhất quán cho mọi nhân vật, mọi tư thế.
     3. Bóng đổ giữa các part (tóc xuống trán, cằm xuống cổ, tay áo xuống thân, vạt váy xuống đùi...)
        và nét viền ngoài có màu (không dùng đen tuyền) được thêm bằng các lượt xử lý chung.
     4. Khuôn mặt là các "mảng biểu cảm" nhỏ (lông mày, mắt, miệng, má hồng, nước mắt) đặt lên đầu.
     5. Tư thế (idle, thở, đi bộ, tay chống hông...) chỉ là bộ toạ độ khớp; đổi tư thế = dựng lại.

   Khung 36 x 60 ô, mỗi ô 2 điểm ảnh => 72 x 120 px. Chân đứng ở đáy khung (hàng 58, viền hàng 59).

   Kết quả cùng dạng với engine hiện tại:
     { frames: { "neutral-idle": rows, "neutral-talk": rows, ... }, palette: { ký tự: "#rrggbb" } }
   rows là mảng chuỗi dài 36 ký tự, "." = trong suốt. Đưa vào svgFor(rows, palette) của sprites.js được ngay.

   Tên khung:
     <mood>-idle, <mood>-talk   mood: neutral happy sad annoyed concerned defensive
     neutral-react              ngạc nhiên (engine dùng cho "react")
     neutral-blink              nhắm mắt (để engine chớp mắt)
     neutral-breathe            nhịp thở: vai/ngực nhấc 1 ô (xen với neutral-idle)
     walk-a, walk-b             hai tư thế chạm đất (engine hiện chỉ xen hai khung này)
     walk-c, walk-d             hai tư thế lướt qua; chu kỳ đủ 4 nhịp: WALK_CYCLE

   DÀN NHÂN VẬT (cast.js dùng các SPECS bên dưới):
     linh, minh                teen đã duyệt (Minh không còn khăn quàng đỏ: cấp 3 không quàng; giữ huy hiệu Đoàn ở túi)
     mai, duc                  nữ sinh đuôi ngựa nâu / nam sinh vạm vỡ da rám tóc gai
     ban                       "Bạn": đồng phục + cardigan ô-liu (jacket), tóc ngắn trung tính, dáng trung tính
     hanh                      cô giáo ~35t: áo dài xanh ngọc (top "aodai", tunic = vạt áo dài tới bắp chân), quần trắng, búi thấp
     thay                      thầy ~45t: sơ mi xanh xắn tay (sleeve "rolled"), kính (glasses), tóc muối tiêu, nếp cười (lines)
     me                        mẹ ~45t: áo ấm tay lỡ (sleeve "threeq"), quần vải nâu, tóc ngang vai
     bin                       em ~9t: dáng trẻ con (BODIES.kid dựng trên 47 hàng rồi đệm 13 hàng trống), quần short
   Người lớn dựng trên khung 60 hàng rồi KÉO DÀI (stretch: chèn bản sao hàng ở ngực/đùi/cẳng chân) thành 68 hàng,
   nên cao hơn teen ~13%; chân vẫn ở hàng cuối khung. Mọi nhân vật khác vẫn 36 x 60. */

export const COLS = 36
export const ROWS = 60
export const CELL = 2
export const MOODS = ["neutral", "happy", "sad", "annoyed", "concerned", "defensive"]
export const WALK_CYCLE = ["walk-a", "walk-c", "walk-b", "walk-d"]
/** Hộp đầu (cột x0..x1, hàng y0..y1, loại trừ x1/y1) để cắt khung làm chân dung phóng to trong hộp thoại. */
export const HEAD_BOX = { x0: 8, y0: 0, x1: 28, y1: 17 }

const CX = 18 // trục đối xứng: ranh giới giữa cột 17 và 18
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const lerp = (a, b, t) => a + (b - a) * t

/* ============================================================ vai trò màu → ký tự */
const ROLES = [
  "skin0", "skin1", "skin2", "skin3", "skinO",
  "hair0", "hair1", "hair2", "hair3", "hairO",
  "top0", "top1", "top2", "top3", "topO",
  "bot0", "bot1", "bot2", "bot3", "botO",
  "shoe0", "shoe1", "shoe2", "shoe3", "shoeO",
  "sock0", "sock1", "sock2",
  "sole0", "sole1",
  "acc0", "acc1", "acc2", "accO",
  "belt", "buckle", "badge0", "badge1",
  "eyeW", "iris", "pupil", "lash", "spec", "brow",
  "lip", "lipD", "mouthIn", "teeth", "tongue", "blush", "tear",
  "jkt0", "jkt1", "jkt2", "jkt3", "jktO", "frame",
]
const CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
export const ROLE_CHAR = Object.fromEntries(ROLES.map((r, i) => [r, CHARS[i]]))

/* ============================================================ bảng màu theo nhân vật */
const SKINS = {
  fair: {
    skin0: "#fde8d6", skin1: "#f6cdac", skin2: "#e0a483", skin3: "#b97b66", skinO: "#74403c",
    blush: "#f4a094", lip: "#d4766f", lipD: "#9b4a50", teeth: "#fffaf2", mouthIn: "#5b2431", tongue: "#dc7a84", tear: "#b9e3f6",
  },
  warm: {
    skin0: "#f7d6b4", skin1: "#e8af87", skin2: "#cb8668", skin3: "#a0634f", skinO: "#603530",
    blush: "#e98f7d", lip: "#bd665f", lipD: "#853c42", teeth: "#fff6ea", mouthIn: "#4e1f2b", tongue: "#d5707a", tear: "#b9e3f6",
  },
}
/* thêm: da sáng ấm (peach) và da rám (tan) */
SKINS.peach = {
  skin0: "#fbe0c6", skin1: "#f1bd96", skin2: "#d79672", skin3: "#aa6e58", skinO: "#693b39",
  blush: "#ee9a8a", lip: "#c76f68", lipD: "#8f4249", teeth: "#fff8ee", mouthIn: "#522330", tongue: "#d97983", tear: "#b9e3f6",
}
SKINS.tan = {
  skin0: "#efc39a", skin1: "#d99d72", skin2: "#b87858", skin3: "#8d5945", skinO: "#522f30",
  blush: "#d9806f", lip: "#a95a55", lipD: "#78363d", teeth: "#fff4e6", mouthIn: "#471b27", tongue: "#cc6a74", tear: "#b9e3f6",
}
const HAIRS = {
  black: { hair0: "#8189b4", hair1: "#3c4168", hair2: "#292d4a", hair3: "#191c2f", hairO: "#0a0b12", brow: "#4a3f58" },
  espresso: { hair0: "#9c8478", hair1: "#54413b", hair2: "#392d2a", hair3: "#211a19", hairO: "#0d0909", brow: "#4d3a35" },
  chestnut: { hair0: "#c79b72", hair1: "#85583b", hair2: "#5d3b28", hair3: "#3b241b", hairO: "#170d09", brow: "#5a3c2c" },
  walnut: { hair0: "#a9907c", hair1: "#6d5142", hair2: "#4b362b", hair3: "#2e211a", hairO: "#120b08", brow: "#54402f" },
  grey: { hair0: "#b3b7c6", hair1: "#7f8498", hair2: "#585c70", hair3: "#383b4c", hairO: "#14151f", brow: "#4a4c5b" },
  mahogany: { hair0: "#b78f84", hair1: "#7a4a45", hair2: "#53302f", hair3: "#351d1f", hairO: "#170a0d", brow: "#4f3030" },
}
const SHIRT_WHITE = { top0: "#ffffff", top1: "#f3f5fb", top2: "#d3dae9", top3: "#a8b2cd", topO: "#5b6688" }
const NAVY = { bot0: "#566ba3", bot1: "#3a4e84", bot2: "#293a64", bot3: "#1b284c", botO: "#0c1328" }
const JEANS = { bot0: "#86a9d3", bot1: "#648aba", bot2: "#4a6e9f", bot3: "#355379", botO: "#16243f" }
const TEE_CORAL = { top0: "#ffbaab", top1: "#f58c7d", top2: "#d7665f", top3: "#a84849", topO: "#5c2331" }
const TEE_TEAL = { top0: "#93ddd3", top1: "#52b8ae", top2: "#399390", top3: "#296e6f", topO: "#133b42" }
const SHOE_BLACK = { shoe0: "#6a7292", shoe1: "#363b52", shoe2: "#24283c", shoe3: "#171a29", shoeO: "#0a0b13", sole0: "#eef0f6", sole1: "#b9bfd3" }
const SHOE_WHITE = { shoe0: "#ffffff", shoe1: "#f2f4fa", shoe2: "#d0d7e8", shoe3: "#a0aac8", shoeO: "#4c5575", sole0: "#ffffff", sole1: "#d9a3ab" }
const SOCK = { sock0: "#ffffff", sock1: "#eaedf6", sock2: "#bec6de" }
const BOW_RED = { acc0: "#f6857e", acc1: "#d44b4c", acc2: "#a22e3c", accO: "#581624" }
const SCARF_RED = { acc0: "#f78c82", acc1: "#da4c46", acc2: "#ac2f38", accO: "#5e151e" }
const CARDI_OLIVE = { jkt0: "#a8b176", jkt1: "#7a874b", jkt2: "#5a6739", jkt3: "#3f4a29", jktO: "#1e2511" }
const SHIRT_BLUE = { top0: "#eef5fc", top1: "#c9dcef", top2: "#9db9d8", top3: "#738fb6", topO: "#34476b" }
const AODAI_TEAL = { top0: "#a6d1c9", top1: "#72aaa4", top2: "#518986", top3: "#396c6c", topO: "#1c3b42" }
const WHITE_PANTS = { bot0: "#ffffff", bot1: "#f3f4f8", bot2: "#d2d7e5", bot3: "#a7afc6", botO: "#586180" }
const CHARCOAL = { bot0: "#8c8997", bot1: "#686573", bot2: "#4b4959", bot3: "#343341", botO: "#16151f" }
const BEIGE_PANTS = { bot0: "#a28a74", bot1: "#7e6753", bot2: "#5f4b3c", bot3: "#43332a", botO: "#1f1712" }
const KHAKI = { bot0: "#dac79b", bot1: "#bda676", bot2: "#97805a", bot3: "#6f5d41", botO: "#33281a" }
const BLOUSE_ROSE = { top0: "#fbe7a0", top1: "#ecc050", top2: "#c4953a", top3: "#8f6a28", topO: "#43300f" }
const SHOE_BROWN = { shoe0: "#cba783", shoe1: "#9c7050", shoe2: "#704930", shoe3: "#4b2d1d", shoeO: "#21110a", sole0: "#e7d8c3", sole1: "#b59d7f" }
const SHOE_NUDE = { shoe0: "#f4dfc7", shoe1: "#dfc0a0", shoe2: "#bc977b", shoe3: "#8d6b57", shoeO: "#4a3030", sole0: "#ffffff", sole1: "#cdb094" }
const TIE_YELLOW = { acc0: "#fde68c", acc1: "#f0bf40", acc2: "#c4902c", accO: "#5a3a14" }
const MISC = { belt: "#1d2030", buckle: "#d9c58a", badge0: "#f1c64f", badge1: "#c8412f", eyeW: "#fbf8f3", iris: "#4a2e2a", pupil: "#130e15", lash: "#2c1c28", spec: "#ffffff", frame: "#727c97" }

/* ============================================================ đặc tả nhân vật */
export const SPECS = {
  linh: {
    id: "linh", body: "girl", skin: "fair", hair: { style: "long", color: "black" },
    top: "uniformShirt", bottom: "skirt", neckwear: "bow", shoes: "sneaker",
    colors: { ...SHIRT_WHITE, ...NAVY, ...SHOE_WHITE, ...SOCK, ...BOW_RED },
  },
  minh: {
    id: "minh", body: "boy", skin: "warm", hair: { style: "shortSide", color: "espresso" },
    top: "uniformShirt", bottom: "trousers", neckwear: null, shoes: "leather", pocket: true, /* học sinh cấp 3 không quàng khăn đỏ; giữ huy hiệu Đoàn ở túi */
    colors: { ...SHIRT_WHITE, ...NAVY, ...SHOE_BLACK, ...SOCK },
  },
  /* friend2: nữ sinh buộc đuôi ngựa, tóc nâu hạt dẻ, da ấm, không nơ */
  mai: {
    id: "mai", body: "girl", skin: "warm", hair: { style: "ponytail", color: "chestnut" },
    top: "uniformShirt", bottom: "skirt", neckwear: null, shoes: "sneaker",
    colors: { ...SHIRT_WHITE, ...NAVY, ...SHOE_WHITE, ...SOCK, ...TIE_YELLOW },
  },
  /* classmate2: nam sinh vạm vỡ hơn, da rám, tóc đen dựng gai, không túi áo */
  duc: {
    id: "duc", body: "boyBroad", skin: "tan", hair: { style: "spiky", color: "black" },
    top: "uniformShirt", bottom: "trousers", neckwear: null, shoes: "leather",
    colors: { ...SHIRT_WHITE, ...NAVY, ...SHOE_BLACK, ...SOCK },
  },
  /* player "Bạn": đồng phục + áo len cardigan ô-liu (nhận ra ở mọi cảnh), tóc ngắn trung tính, dáng trung tính */
  ban: {
    id: "ban", body: "neutral", skin: "peach", hair: { style: "neutralCut", color: "walnut" },
    top: "uniformShirt", bottom: "trousers", neckwear: null, shoes: "sneaker", jacket: "cardigan", sleeve: "long",
    colors: { ...SHIRT_WHITE, ...NAVY, ...SHOE_WHITE, ...SOCK, ...CARDI_OLIVE },
  },
  /* teacherF: cô Hạnh ~35 tuổi, áo dài xanh ngọc dịu, quần trắng, búi tóc thấp */
  hanh: {
    id: "hanh", body: "woman", skin: "fair", hair: { style: "lowBun", color: "espresso" },
    top: "aodai", bottom: "trousers", neckwear: null, shoes: "leather", sleeve: "long", legFlare: 0.35, neckClip: 14,
    tunic: [[30.5, 4.7], [36, 4.2], [42, 3.8], [48, 3.6], [51, 3.6]],
    colors: { ...AODAI_TEAL, ...WHITE_PANTS, ...SHOE_NUDE, ...SOCK, lip: "#c9525e", lipD: "#8e3444" },
  },
  /* teacher: thầy ~45 tuổi, sơ mi xanh nhạt xắn tay, quần tây, kính, tóc muối tiêu */
  thay: {
    id: "thay", body: "man", skin: "peach", hair: { style: "combed", color: "grey" },
    top: "uniformShirt", bottom: "trousers", neckwear: null, shoes: "leather", sleeve: "rolled", pocket: "plain", glasses: true, lines: true,
    colors: { ...SHIRT_BLUE, ...CHARCOAL, ...SHOE_BLACK, ...SOCK },
  },
  /* mom: mẹ ~45 tuổi, áo bà ba ấm ở nhà, quần vải, tóc ngang vai, dép */
  me: {
    id: "me", body: "woman", skin: "warm", hair: { style: "shoulder", color: "mahogany" },
    top: "tee", logo: false, bottom: "trousers", neckwear: null, shoes: "leather", sleeve: "threeq", lines: true, neckClip: 14,
    colors: { ...BLOUSE_ROSE, ...BEIGE_PANTS, ...SHOE_BROWN, ...SOCK, lip: "#b85c58", lipD: "#843a40" },
  },
  /* kid: em nhỏ ~9 tuổi, áo thun + quần short + tất trắng giày thể thao */
  bin: {
    id: "bin", body: "kid", skin: "peach", hair: { style: "kidTousle", color: "walnut" },
    top: "tee", bottom: "shorts", neckwear: null, shoes: "sneaker",
    colors: { ...TEE_TEAL, ...KHAKI, ...SHOE_WHITE, ...SOCK },
  },
}

/* biến thể đồ thường ngày: buildCharacter({ ...SPECS.linh, ...CASUAL.girl }) */
export const CASUAL = {
  girl: { top: "tee", bottom: "jeans", neckwear: null, shoes: "sneaker", colors: { ...TEE_CORAL, ...JEANS, ...SHOE_WHITE, ...SOCK, ...BOW_RED } },
  boy: { top: "tee", bottom: "jeans", neckwear: null, shoes: "sneaker", pocket: false, colors: { ...TEE_TEAL, ...JEANS, ...SHOE_WHITE, ...SOCK, ...SCARF_RED } },
}

export function paletteFor(spec) {
  const out = {}
  const all = { ...SKINS[spec.skin], ...HAIRS[spec.hair.color], ...MISC, ...spec.colors }
  for (const role of ROLES) if (all[role]) out[ROLE_CHAR[role]] = all[role]
  return out
}

/* ============================================================ vật liệu & ánh sáng */
const MATS = {
  skin: { ramp: ["skin0", "skin1", "skin2", "skin3"], line: "skinO", bands: [0.84, 0.10, -0.42], prio: 3 },
  hair: { ramp: ["hair0", "hair1", "hair2", "hair3"], line: "hairO", bands: [0.88, 0.10, -0.40], prio: 6 },
  top: { ramp: ["top0", "top1", "top2", "top3"], line: "topO", bands: [0.86, 0.04, -0.46], prio: 4 },
  bot: { ramp: ["bot0", "bot1", "bot2", "bot3"], line: "botO", bands: [0.86, 0.12, -0.42], prio: 5 },
  shoe: { ramp: ["shoe0", "shoe1", "shoe2", "shoe3"], line: "shoeO", bands: [0.84, 0.14, -0.42], prio: 7 },
  sock: { ramp: ["sock0", "sock1", "sock2", "sock2"], line: "topO", bands: [0.84, 0.04, -0.45], prio: 2 },
  acc: { ramp: ["acc0", "acc1", "acc2", "acc2"], line: "accO", bands: [0.86, 0.14, -0.4], prio: 8 },
  jkt: { ramp: ["jkt0", "jkt1", "jkt2", "jkt3"], line: "jktO", bands: [0.86, 0.08, -0.44], prio: 4.5 },
  belt: { ramp: ["belt", "belt", "belt", "belt"], line: "botO", bands: [9, 9, 9], prio: 1 },
}
/* ánh sáng từ TRÊN-TRÁI, hơi hướng về người xem */
const LIGHT = (() => { const v = [-0.62, -0.58, 0.53]; const n = Math.hypot(...v); return v.map((c) => c / n) })()
const bandTone = (bands, I) => (I >= bands[0] ? 0 : I >= bands[1] ? 1 : I >= bands[2] ? 2 : 3)

/* ============================================================ bộ đệm ô */
/* Số hàng của bộ đệm đang dựng (60 cho teen; thấp hơn cho dáng trẻ con, rồi được đệm thêm hàng trống ở trên). */
let H = ROWS
const at = (x, y) => y * COLS + x
const inb = (x, y) => x >= 0 && y >= 0 && x < COLS && y < H

function makeBuf() {
  const n = COLS * H
  return {
    mat: new Array(n).fill(null),
    tone: new Int8Array(n),
    part: new Int16Array(n).fill(-1),
    raw: new Array(n).fill(null),
    line: new Array(n).fill(null),
    parts: [],
  }
}
const DROP = Symbol("drop")

/** Tô một part: { mat, sample(px,py,x,y)->[nx,ny,nz]|null, bias, casts, tone(x,y,t,n,I), cells:[[x,y,tone|role]] } */
function paintPart(buf, part) {
  const id = buf.parts.length
  buf.parts.push(part)
  const m = MATS[part.mat]
  const mine = []
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      const n = part.sample(x + 0.5, y + 0.5, x, y)
      if (!n) continue
      const I = n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2] + (part.bias || 0)
      let t = bandTone(m.bands, I)
      let raw = null
      if (part.tone) {
        const r = part.tone(x, y, t, n, I)
        if (r === DROP) continue
        if (typeof r === "number") t = clamp(r, 0, 3)
        else if (typeof r === "string") raw = r
      }
      const k = at(x, y)
      buf.mat[k] = part.mat
      buf.tone[k] = t
      buf.part[k] = id
      buf.raw[k] = raw
      mine.push(k)
    }
  }
  if (part.clean !== false) despeckle(buf, id, mine)
  if (part.cells) {
    for (const [x, y, v] of part.cells) {
      if (!inb(x, y)) continue
      const k = at(x, y)
      if (buf.part[k] !== id) continue
      if (typeof v === "number") { buf.tone[k] = clamp(v, 0, 3); buf.raw[k] = null } else buf.raw[k] = v
    }
  }
}

/** Dọn nhiễu: ô sắc đơn lẻ (không có láng giềng 4 hướng cùng sắc trong cùng part) đổi sang sắc phổ biến nhất xung quanh. */
function despeckle(buf, id, ks) {
  const changes = []
  for (const k of ks) {
    if (buf.raw[k]) continue
    const x = k % COLS
    const y = (k / COLS) | 0
    const t = buf.tone[k]
    const cnt = [0, 0, 0, 0]
    let same = 0
    for (const [dx, dy] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) {
      if (!inb(x + dx, y + dy)) continue
      const nk = at(x + dx, y + dy)
      if (buf.part[nk] !== id || buf.raw[nk]) continue
      cnt[buf.tone[nk]] += 1
      if (buf.tone[nk] === t) same += 1
    }
    if (same > 0) continue
    let best = t
    let bc = 0
    for (let v = 0; v < 4; v += 1) if (cnt[v] > bc) { bc = cnt[v]; best = v }
    if (bc >= 2) changes.push([k, best])
  }
  for (const [k, v] of changes) buf.tone[k] = v
}

/* ============================================================ bộ lấy mẫu hình khối */
function ell(cx, cy, rx, ry) {
  return (px, py) => {
    const dx = (px - cx) / rx
    const dy = (py - cy) / ry
    const d = dx * dx + dy * dy
    if (d > 1) return null
    return [dx, dy, Math.sqrt(1 - d)]
  }
}

/** Chuỗi capsule pts=[[x,y,r],...]; pháp tuyến 3D của mặt trụ nên bóng đúng cho mọi hướng chi. */
function chain(pts) {
  return (px, py) => {
    let best = null
    let bestD = 2
    for (let i = 0; i < pts.length - 1; i += 1) {
      const a = pts[i]
      const b = pts[i + 1]
      const vx = b[0] - a[0]
      const vy = b[1] - a[1]
      const len2 = vx * vx + vy * vy || 1
      const t = clamp(((px - a[0]) * vx + (py - a[1]) * vy) / len2, 0, 1)
      const qx = a[0] + vx * t
      const qy = a[1] + vy * t
      const r = lerp(a[2], b[2], t)
      const dx = (px - qx) / r
      const dy = (py - qy) / r
      const d = dx * dx + dy * dy
      if (d <= 1 && d < bestD) { bestD = d; best = [dx, dy, Math.sqrt(1 - d)] }
    }
    return best
  }
}

/** Hồ sơ theo hàng: keys=[[y, xl, xr], ...] nội suy tuyến tính; pháp tuyến trụ (nx theo bề ngang). */
function prof(keys, ny = 0, yc = 0, hy = 1) {
  return (px, py) => {
    if (py < keys[0][0] || py > keys[keys.length - 1][0]) return null
    let i = 0
    while (i < keys.length - 2 && py > keys[i + 1][0]) i += 1
    const a = keys[i]
    const b = keys[i + 1]
    const t = (py - a[0]) / (b[0] - a[0] || 1)
    const xl = lerp(a[1], b[1], t)
    const xr = lerp(a[2], b[2], t)
    if (px < xl || px > xr) return null
    const mid = (xl + xr) / 2
    const hw = (xr - xl) / 2 || 1
    const nx = clamp((px - mid) / hw, -1, 1)
    const nyv = ny ? clamp((py - yc) / hy, -1, 1) * ny : 0
    return [nx, nyv, Math.sqrt(Math.max(0.04, 1 - nx * nx))]
  }
}
const symKeys = (keys) => keys.map(([y, hw]) => [y, CX - hw, CX + hw])

/** Hàng tường minh: spans = { y: [[x0,x1], ...] }; `nrm(px,py)` trả pháp tuyến. */
function rowsShape(spans, nrm) {
  return (px, py, x, y) => {
    const row = spans[y]
    if (!row) return null
    for (const [a, b] of row) if (x >= a && x <= b) return nrm(px, py)
    return null
  }
}

/* ============================================================ khung xương theo thể hình */
const BODIES = {
  boy: {
    face: { 3: [[15, 20]], 4: [[14, 21]], 5: [[14, 21]], 6: [[14, 21]], 7: [[14, 21]], 8: [[14, 21]], 9: [[14, 21]], 10: [[14, 21]], 11: [[15, 20]] },
    ears: true,
    neckR: 2.3,
    torso: [[14.0, 4.4], [15.0, 5.7], [16.0, 6.0], [18.5, 6.0], [21.5, 5.7], [24.5, 5.4], [27.5, 5.2], [28.9, 5.3]],
    shoulder: { x: 6.6, y: 16.1, r: 2.25 }, elbow: { x: 7.3, y: 25.4, r: 1.75 }, wrist: { x: 7.5, y: 32.4, r: 1.4 }, hand: { y: 37.4, r: 1.5 },
    sleeveEnd: 21.4,
    hip: { x: 2.5, y: 32.6, r: 2.65 }, knee: { x: 2.8, y: 45.0, r: 2.4 }, ankle: { x: 3.2, y: 54.0, r: 2.05 },
    pelvis: [[27.2, 5.3], [29.0, 5.5], [31.0, 5.5], [33.6, 5.2]],
  },
  girl: {
    face: { 3: [[15, 20]], 4: [[14, 21]], 5: [[14, 21]], 6: [[14, 21]], 7: [[14, 21]], 8: [[14, 21]], 9: [[14, 21]], 10: [[15, 20]], 11: [[16, 19]] },
    ears: false,
    neckR: 1.9,
    torso: [[14.0, 4.1], [15.0, 5.5], [16.0, 5.8], [18.5, 5.7], [21.5, 5.3], [24.5, 4.8], [27.0, 4.5], [28.5, 4.8]],
    shoulder: { x: 6.2, y: 16.1, r: 2.15 }, elbow: { x: 6.8, y: 25.2, r: 1.65 }, wrist: { x: 6.9, y: 31.8, r: 1.3 }, hand: { y: 36.4, r: 1.4 },
    sleeveEnd: 21.0,
    hip: { x: 2.4, y: 33.0, r: 2.5 }, knee: { x: 2.7, y: 46.0, r: 2.0 }, calf: 2.0, ankle: { x: 3.0, y: 54.4, r: 1.55 },
    pelvis: [[27.4, 4.9], [29.0, 5.4], [31.5, 5.8], [34.0, 5.8]],
  },
}

/* Dáng thêm cho dàn nhân vật. Người lớn dựng trên cùng khung 60 hàng rồi được KÉO DÀI thêm hàng ở ngực/đùi/cẳng
   chân (stretch) nên cao hơn teen ~13%. Trẻ con dựng trên khung 47 hàng (rows) rồi đệm hàng trống phía trên (padTop). */
const widen = (keys, k) => keys.map(([y, hw]) => [y, hw + k])
BODIES.neutral = {
  fw: 6,
  face: { 3: [[15, 20]], 4: [[14, 21]], 5: [[14, 21]], 6: [[14, 21]], 7: [[14, 21]], 8: [[14, 21]], 9: [[14, 21]], 10: [[15, 20]], 11: [[15, 20]] },
  ears: false,
  neckR: 2.1,
  torso: [[14.0, 4.2], [15.0, 5.6], [16.0, 5.9], [18.5, 5.85], [21.5, 5.5], [24.5, 5.1], [27.0, 4.9], [28.7, 5.0]],
  shoulder: { x: 6.4, y: 16.1, r: 2.2 }, elbow: { x: 7.0, y: 25.3, r: 1.7 }, wrist: { x: 7.2, y: 32.1, r: 1.35 }, hand: { y: 36.9, r: 1.45 },
  sleeveEnd: 21.2,
  hip: { x: 2.45, y: 32.8, r: 2.55 }, knee: { x: 2.75, y: 45.5, r: 2.2 }, ankle: { x: 3.1, y: 54.2, r: 1.8 },
  pelvis: [[27.3, 5.1], [29.0, 5.45], [31.2, 5.65], [33.8, 5.5]],
}
BODIES.boyBroad = {
  ...BODIES.boy,
  fw: 7,
  neckR: 2.55,
  torso: widen(BODIES.boy.torso, 0.45),
  shoulder: { x: 7.0, y: 16.1, r: 2.4 }, elbow: { x: 7.9, y: 25.4, r: 1.9 }, wrist: { x: 8.1, y: 32.4, r: 1.5 }, hand: { y: 37.4, r: 1.6 },
  hip: { x: 2.7, y: 32.6, r: 2.85 }, knee: { x: 3.0, y: 45.0, r: 2.6 }, ankle: { x: 3.4, y: 54.0, r: 2.15 },
  pelvis: widen(BODIES.boy.pelvis, 0.45),
}
BODIES.man = {
  ...BODIES.boy,
  fw: 7,
  neckR: 2.6,
  torso: [[14.0, 4.6], [15.0, 6.2], [16.0, 6.6], [18.5, 6.6], [21.5, 6.5], [24.5, 6.3], [27.5, 6.1], [28.9, 6.1]],
  shoulder: { x: 7.1, y: 16.1, r: 2.4 }, elbow: { x: 8.0, y: 25.4, r: 1.9 }, wrist: { x: 8.2, y: 32.4, r: 1.5 }, hand: { y: 37.4, r: 1.6 },
  sleeveEnd: 27.5,
  hip: { x: 2.8, y: 32.6, r: 2.9 }, knee: { x: 3.0, y: 45.0, r: 2.5 }, ankle: { x: 3.3, y: 54.0, r: 2.05 },
  pelvis: [[27.2, 6.0], [29.0, 6.2], [31.0, 6.2], [33.6, 5.9]],
  stretch: [[18, 2], [40, 3], [49, 3]],
}
BODIES.woman = {
  ...BODIES.girl,
  neckR: 1.85,
  torso: [[14.0, 3.9], [15.0, 5.1], [16.0, 5.5], [18.5, 5.4], [21.5, 4.8], [24.5, 4.0], [27.0, 3.6], [28.8, 4.4]],
  shoulder: { x: 5.9, y: 16.1, r: 2.1 }, elbow: { x: 6.5, y: 25.2, r: 1.6 }, wrist: { x: 6.7, y: 32.0, r: 1.3 }, hand: { y: 36.8, r: 1.4 },
  hip: { x: 2.5, y: 33.0, r: 2.5 }, knee: { x: 2.8, y: 46.0, r: 2.25 }, calf: 2.2, ankle: { x: 3.0, y: 54.4, r: 1.75 },
  pelvis: [[27.4, 4.8], [29.0, 5.2], [31.5, 5.6], [34.0, 5.6]],
  stretch: [[18, 2], [40, 3], [49, 3]],
}
BODIES.kid = {
  rows: 47, ty: -2, ps: 0.72, fw: 4, hem: 25.6, jawRow: 10, kidFace: true, earRows: [6, 7], padTop: 13,
  face: { 3: [[15, 20]], 4: [[14, 21]], 5: [[14, 21]], 6: [[14, 21]], 7: [[14, 21]], 8: [[14, 21]], 9: [[15, 20]], 10: [[16, 19]] },
  ears: true,
  neckR: 1.75, neckEnd: 13.6,
  torso: [[12.0, 3.2], [12.9, 4.0], [13.8, 4.3], [16.5, 4.3], [19.5, 4.2], [22.0, 4.1], [24.0, 4.2]],
  shoulder: { x: 4.6, y: 14.0, r: 1.75 }, elbow: { x: 4.9, y: 21.0, r: 1.35 }, wrist: { x: 5.0, y: 26.2, r: 1.15 }, hand: { y: 30.0, r: 1.25 },
  sleeveEnd: 18.0,
  hip: { x: 1.9, y: 25.6, r: 2.0 }, knee: { x: 2.1, y: 33.6, r: 1.65 }, ankle: { x: 2.3, y: 41.0, r: 1.35 },
  pelvis: [[23.4, 4.2], [25.0, 4.3], [26.8, 4.4], [28.4, 4.2]],
  shoe: { rx: 3.0, ry: 2.1, cy: 2.6, sole: 1.2 },
}

/* ============================================================ tư thế (độ lệch toạ độ khớp) */
const POSES = {
  stand: { legR: { an: [0.4, -0.9] }, armR: { el: [-0.2, 0], wr: [-0.4, 0.2], hd: [-0.6, 0.2] } },
  breathe: { lift: 1 },
  happy: { armL: { el: [-0.4, -0.3], wr: [-0.5, -1.2], hd: [-0.5, -1.2] }, armR: { el: [0.4, -0.3], wr: [0.5, -1.2], hd: [0.5, -1.2] } },
  sad: { dy: 1, head: [0, 1], armL: { sh: [0.3, 0.3], el: [0.6, 0.2], wr: [0.8, 0], hd: [0.8, 0] }, armR: { sh: [-0.3, 0.3], el: [-0.6, 0.2], wr: [-0.8, 0], hd: [-0.8, 0] } },
  annoyed: { armL: { el: [-2.6, -1.0], wr: [1.4, -3.4], hd: [1.8, -4.2] }, armR: { el: [2.6, -1.0], wr: [-1.4, -3.4], hd: [-1.8, -4.2] } },
  concerned: { armL: { el: [0.1, 0.9], wr: [5.4, -2.6], hd: [6.8, -6.0] }, armR: { el: [-0.1, 0.9], wr: [-5.4, -2.2], hd: [-6.8, -5.6] } },
  defensive: { armL: { el: [0.5, 1.0], wr: [10.2, -9.0], hd: [13.2, -14.4] }, armR: { el: [-0.5, 0.4], wr: [-9.6, -7.2], hd: [-12.0, -12.2] } },
  "walk-a": { dy: 1, legL: { an: [-0.5, 0.6] }, legR: { an: [0.1, -2.2], kn: [0.2, -0.6] }, armL: { wr: [0.2, 1.0], hd: [0.2, 1.0] }, armR: { el: [-0.3, -1.4], wr: [-1.0, -3.2], hd: [-1.0, -3.4] } },
  "walk-b": { dy: 1, legR: { an: [0.5, 0.6] }, legL: { an: [-0.1, -2.2], kn: [-0.2, -0.6] }, armR: { wr: [-0.2, 1.0], hd: [-0.2, 1.0] }, armL: { el: [0.3, -1.4], wr: [1.0, -3.2], hd: [1.0, -3.4] } },
  "walk-c": { dy: -1, legL: { an: [0, 0] }, legR: { an: [-0.4, -3.0], kn: [-0.3, -1.6] }, armL: { wr: [0.1, 0.5], hd: [0.1, 0.5] }, armR: { wr: [-0.3, -0.5], hd: [-0.3, -0.5] } },
  "walk-d": { dy: -1, legR: { an: [0, 0] }, legL: { an: [0.4, -3.0], kn: [0.3, -1.6] }, armR: { wr: [-0.1, 0.5], hd: [-0.1, 0.5] }, armL: { wr: [0.3, -0.5], hd: [0.3, -0.5] } },
}

/* ============================================================ biểu cảm: các mảng mặt
   Cột fx 0..7 = ô 14..21; hàng theo y tuyệt đối (3..12).
   Chú giải: B mày, L mi, W tròng trắng, P đồng tử, m môi, l môi tối/khoé, M trong miệng, T răng,
   G lưỡi, b má hồng, t nước mắt, n/N/k/s các sắc da. */
const LEGEND = {
  B: "brow", L: "lash", W: "eyeW", P: "pupil", I: "iris", S: "spec", m: "lip", l: "lipD", M: "mouthIn", T: "teeth", G: "tongue",
  b: "blush", t: "tear", N: "skin0", s: "skin1", n: "skin2", k: "skin3", F: "frame",
}
const FX0 = 14
const patch = (y0, rows, x0 = FX0) => {
  const out = []
  rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i += 1) {
      const c = row[i]
      if (c !== "." && c !== " ") out.push([x0 + i, y0 + j, LEGEND[c]])
    }
  })
  return out
}
const pick = (v, g) => (Array.isArray(v) ? v : v[g] ?? v.all)

/* mày: hàng y=4,5 */
const BROWS = {
  neutral: { y: 5, f: [".BB..BB."], m: [".BB..BB."] },
  happy: { y: 4, f: [".BB..BB."], m: [".BB..BB."] },
  sad: { y: 4, f: ["..B..B..", ".B....B."], m: ["..B..B..", ".B....B."] },
  annoyed: { y: 4, f: [".BB..BB.", "..B..B.."], m: [".BB..BB.", "..B..B.."] },
  concerned: { y: 4, f: ["..B..BB.", ".B......"], m: ["..B..BB.", ".B......"] },
  defensive: { y: 4, f: ["..B..B..", ".BB..BB."], m: ["..B..B..", ".BB..BB."] },
  surprised: { y: 4, f: [".BB..BB."], m: [".BB..BB."] },
}
/* mắt: hàng y=6,7,8 — mặc định nhìn sang PHẢI (hướng về người đối thoại) */
const EYES = {
  neutral: { f: [".Lk..kL.", ".WP..WP.", "........"], m: [".Lk..kL.", ".WP..WP.", "........"] },
  happy: { f: [".Lk..kL.", ".WP..WP.", "........"], m: [".Lk..kL.", ".WP..WP.", "........"] },
  sad: { f: [".Lk..kL.", ".WP..WP.", "........"], m: [".Lk..kL.", ".WP..WP.", "........"] },
  annoyed: { f: [".LL..LL.", "..P...P.", "........"], m: [".LL..LL.", "..P...P.", "........"] },
  concerned: { f: [".Lk..kL.", ".WP..WP.", "........"], m: [".Lk..kL.", ".WP..WP.", "........"] },
  defensive: { f: [".Lk..kL.", ".PW..PW.", "........"], m: [".Lk..kL.", ".PW..PW.", "........"] },
  surprised: { f: [".LL..LL.", ".WP..WP.", ".WW..WW."], m: [".LL..LL.", ".WP..WP.", ".WW..WW."] },
  blink: { f: ["........", ".LL..LL.", "........"], m: ["........", ".LL..LL.", "........"] },
}
/* miệng: hàng y=9,10,11 */
const MOUTHS = {
  neutral: ["........", "...mm...", "........"],
  happy: ["..l..l..", "...mm...", "........"],
  sad: ["........", "...mm...", "..l..l.."],
  annoyed: ["........", "..llll..", "........"],
  concerned: ["........", "..lmm...", "........"],
  defensive: ["........", "..lll...", "........"],
  surprised: ["........", "..lMMl..", "..lMMl.."],
  neutralTalk: ["........", "..lMMl..", "........"],
  neutralTalk2: ["........", "..lmml..", "..lMMl.."],
  happyTalk: ["........", "..lTTl..", "...mm..."],
  happyTalk2: ["........", "..lTTl..", "...GG..."],
  sadTalk: ["........", "...MM...", "..l..l.."],
  annoyedTalk: ["........", "..lMMl..", "........"],
  concernedTalk: ["........", "..lMM...", "........"],
  defensiveTalk: ["........", "..lMMl..", "........"],
}
/* phụ: má hồng, nước mắt, bóng mũi */
const NOSE = ["...N....", "....n...", "........"]
const EXTRAS = {
  concerned: { y: 8, rows: ["......tt", ".......t"] },
  happy: { y: 8, rows: [".b....b."] },
  sad: { y: 8, rows: [".t....t.", ".t......"] },
}

/* kính gọng chữ nhật (thầy): viền dưới liền, hai góc trên + hai bên, cầu kính giữa mũi */
const GLASSES = ["........", "F..FF..F", "F......F", ".FF..FF."]
/* nếp cười/nếp mũi-má nhẹ cho người lớn tuổi (da tối hơn một nấc) */
const LINES = ["n......n", "n......n"]

/* Mặt trẻ con thấp hơn mặt teen một hàng: bỏ hàng 8 (hàng mắt thứ ba + má), kéo các hàng 9.. lên 1. */
function kidFace(cells) {
  const out = []
  for (const [x, y, r] of cells) {
    if (y === 8) { if (r === "blush" || r === "tear") out.push([x, 8, r]); continue }
    out.push(y >= 9 ? [x, y - 1, r] : [x, y, r])
  }
  return out
}

function faceCells(expr, talk, blink, g, spec = {}, body = {}) {
  let cells = []
  const add = (y, rows) => cells.push(...patch(y, rows))
  add(7, NOSE)
  const bw = BROWS[expr] ?? BROWS.neutral
  add(bw.y, pick(bw, g))
  add(6, pick(blink ? EYES.blink : EYES[expr] ?? EYES.neutral, g))
  const key = talk ? `${expr}Talk${talk === 2 ? "2" : ""}` : expr
  add(9, MOUTHS[key] ?? MOUTHS[`${expr}Talk`] ?? MOUTHS.neutralTalk)
  const ex = EXTRAS[expr]
  if (ex) add(ex.y, ex.rows)
  if (spec.lines) add(9, LINES)
  if (body.kidFace) cells = kidFace(cells)
  if (spec.glasses) add(5, GLASSES)
  return cells
}
const OPEN_JAW = new Set(["surprised"])

/* ============================================================ kiểu tóc */
/* mỗi kiểu trả về { back:[part], front:[part] } theo độ dời đầu (dy) */
function domeNormal(cy, rx, ry) {
  return (px, py) => {
    const nx = clamp((px - CX) / rx, -1, 1)
    const ny = clamp((py - cy) / ry, -1, 1)
    return [nx, ny, Math.sqrt(Math.max(0.05, 1 - nx * nx * 0.85 - ny * ny * 0.85))]
  }
}
const inEllipse = (cy, rx, ry, px, py) => ((px - CX) / rx) ** 2 + ((py - cy) / ry) ** 2 <= 1

/** Mũ tóc = elip sọ ∩ (hàng ≤ bottom[cột]); bottom[cột] bị thiếu = không có tóc ở cột đó. */
function capShape(cy, rx, ry, bottom) {
  const nrm = domeNormal(cy, rx, ry)
  return (px, py, x) => {
    const b = bottom[x]
    if (b === undefined || py > b + 1) return null
    if (!inEllipse(cy, rx, ry, px, py)) return null
    return nrm(px, py)
  }
}

/** Gợn sợi tóc: cộng sóng vào pháp tuyến ngang để mỗi búi tóc có mặt sáng (trái) và mặt tối (phải). */
function ridged(base, phase, amp) {
  return (px, py, x, y) => {
    const n = base(px, py, x, y)
    if (!n) return null
    return [clamp(n[0] + amp * Math.sin(phase(px, py)), -1, 1), n[1], n[2]]
  }
}
const lockPhase = (px, py) => ((px + 0.9 * Math.sin(py * 0.42)) * Math.PI * 2) / 3.6
const radial = (ox, oy, k) => (px, py) => Math.atan2(py - oy, px - ox) * k

const HAIR_BANDS = [0.98, 0.12, -0.34]
const hairTone = (x, y, t, n, I) => {
  /* tóc: sắc nền chiếm đa số; vệt bóng hẹp ở trên-trái; cụm tối ở dưới-phải */
  const lo = I < HAIR_BANDS[2] ? 3 : I < HAIR_BANDS[1] ? 2 : I >= HAIR_BANDS[0] ? 0 : 1
  return lo
}

const HAIR_STYLES = {
  /* tóc dài đen, rẽ ngôi lệch, hai lọn xuôi qua vai (Linh) */
  long(dy) {
    const bottom = {}
    for (const x of [12, 13, 22, 23]) bottom[x] = 99
    ;[5, 3, 3, 3, 3, 3, 3, 5].forEach((v, i) => { bottom[14 + i] = v + dy })
    const cap = ridged(capShape(6.7 + dy, 6.3, 6.0, bottom), radial(19.4, 0.4, 9), 0.34)
    const lockL = ridged(prof([[8.5, 11.9, 14.1], [11, 11.6, 14.2], [12.5, 11.3, 15.0], [14, 10.7, 15.8], [17, 10.5, 15.6], [20, 10.6, 15.2], [23, 11.0, 14.9], [26, 11.6, 14.6], [28, 12.4, 14.0], [29.6, 13.0, 13.6]]), lockPhase, 0.55)
    const lockR = ridged(prof([[8.5, 21.9, 24.1], [11, 21.8, 24.4], [12.5, 21.1, 24.7], [14, 20.3, 25.2], [17, 20.5, 25.3], [20, 21.0, 25.2], [22.5, 21.9, 24.8], [24.5, 22.8, 24.2]]), (px, py) => lockPhase(px + 1.3, py + 1.7), 0.55)
    const back = prof([[5.5, 12, 24], [8, 11.6, 24.4], [12, 11.4, 24.6], [14, 11.2, 24.8], [18, 11.0, 25.0], [24, 11.4, 24.6], [27, 12.6, 23.4], [28.6, 14, 22]])
    return {
      back: [{ mat: "hair", sample: back, bias: -0.3, tone: (x, y, t) => (t < 2 ? 2 : t) }],
      front: [
        { mat: "hair", sample: lockL, tone: hairTone },
        { mat: "hair", sample: lockR, tone: hairTone },
        { mat: "hair", sample: cap, casts: true, tone: hairTone },
      ],
    }
  },
  /* tóc ngắn rẽ ngôi, mái hất sang một bên (Minh) */
  shortSide(dy) {
    const bottom = {}
    ;[13, 22, 12, 23].forEach((x) => { bottom[x] = 5 + dy })
    ;[3, 3, 3, 4, 4, 4, 4, 5].forEach((v, i) => { bottom[14 + i] = v + dy })
    const cap = ridged(capShape(6.5 + dy, 6.3, 5.8, bottom), radial(16.4, 0.2, 8), 0.3)
    return { back: [], front: [{ mat: "hair", sample: cap, casts: true, tone: hairTone }] }
  },
  /* tóc buộc đuôi ngựa, trán lộ, đuôi rủ sau vai phải (nữ) */
  ponytail(dy) {
    const bottom = {}
    ;[12, 13, 22, 23].forEach((x) => { bottom[x] = 6 + dy })
    ;[4, 3, 3, 3, 3, 3, 3, 4].forEach((v, i) => { bottom[14 + i] = v + dy })
    const cap = ridged(capShape(6.7 + dy, 6.3, 5.9, bottom), radial(17.5, 0.2, 9), 0.34)
    const tail = ridged(prof([[5.0, 23.2, 25.8], [7, 23.6, 26.9], [10, 24.0, 27.7], [14, 24.6, 28.0], [18, 25.0, 28.0], [22, 25.2, 27.7], [25.5, 25.8, 27.2], [27.2, 26.2, 26.8]]), lockPhase, 0.5)
    const tie = prof([[5.6, 23.4, 25.6], [7.0, 23.4, 25.8]])
    return {
      back: [{ mat: "hair", sample: tail, tone: hairTone, bias: -0.1 }],
      front: [
        { mat: "hair", sample: cap, casts: true, tone: hairTone },
        { mat: "acc", sample: tie, tone: (x, y, t) => (x < 24 ? 1 : 2) },
      ],
    }
  },
  /* tóc bob ngang cằm (nữ) */
  bob(dy) {
    const bottom = {}
    for (const x of [12, 13, 22, 23]) bottom[x] = 99
    ;[4, 3, 3, 3, 3, 3, 4, 5].forEach((v, i) => { bottom[14 + i] = v + dy })
    const cap = ridged(capShape(6.7 + dy, 6.4, 6.0, bottom), radial(19.6, 0.2, 9), 0.34)
    const lockL = ridged(prof([[8.5, 11.8, 14.2], [11, 11.4, 14.3], [13, 11.3, 14.6], [14.6, 11.7, 15.2], [15.6, 12.8, 14.8]]), lockPhase, 0.5)
    const lockR = ridged(prof([[8.5, 21.8, 24.2], [11, 21.7, 24.6], [13, 21.4, 24.7], [14.6, 21.0, 24.3], [15.6, 21.8, 23.5]]), (px, py) => lockPhase(px + 1.1, py + 1.5), 0.5)
    const back = prof([[6, 12, 24], [10, 11.6, 24.4], [13.5, 11.8, 24.2], [15.2, 13.4, 22.6]])
    return {
      back: [{ mat: "hair", sample: back, bias: -0.3, tone: (x, y, t) => (t < 2 ? 2 : t) }],
      front: [{ mat: "hair", sample: lockL, tone: hairTone }, { mat: "hair", sample: lockR, tone: hairTone }, { mat: "hair", sample: cap, casts: true, tone: hairTone }],
    }
  },
  /* tóc dựng gai (nam) */
  spiky(dy) {
    const bottom = {}
    ;[13, 22, 12, 23].forEach((x) => { bottom[x] = 5 + dy })
    ;[4, 3, 4, 3, 4, 3, 4, 4].forEach((v, i) => { bottom[14 + i] = v + dy })
    const dome = ridged(capShape(7.0 + dy, 6.3, 5.6, bottom), radial(18.0, 2.0, 8), 0.34)
    const spike = (x0, x1, tip) => prof([[tip + dy, (x0 + x1) / 2 - 0.4, (x0 + x1) / 2 + 0.4], [2.6 + dy, x0, x1]])
    const spikes = [spike(13.4, 16.4, 0.6), spike(16.0, 19.4, 0.0), spike(19.0, 22.2, 0.5), spike(21.4, 24.0, 1.8)]
    return { back: [], front: [{ mat: "hair", sample: dome, casts: true, tone: hairTone }, ...spikes.map((sp) => ({ mat: "hair", sample: ridged(sp, radial(18, 3, 8), 0.3), tone: hairTone }))] }
  },
  /* tóc ngắn trung tính của "Bạn": mái lệch nhẹ, mai tóc phủ tai, đọc được như mọi giới */
  neutralCut(dy) {
    const bottom = {}
    ;[12, 13, 22, 23].forEach((x) => { bottom[x] = 7 + dy })
    ;[5, 4, 3, 3, 3, 3, 4, 5].forEach((v, i) => { bottom[14 + i] = v + dy })
    const cap = ridged(capShape(6.7 + dy, 6.3, 5.9, bottom), radial(16.8, 0.2, 8), 0.3)
    return { back: [], front: [{ mat: "hair", sample: cap, casts: true, tone: hairTone }] }
  },
  /* búi thấp sau gáy, tóc vuốt gọn, trán lộ (cô giáo) */
  lowBun(dy) {
    const bottom = {}
    ;[12, 13, 22, 23].forEach((x) => { bottom[x] = 7 + dy })
    ;[4, 3, 3, 3, 3, 3, 3, 4].forEach((v, i) => { bottom[14 + i] = v + dy })
    const cap = ridged(capShape(6.7 + dy, 6.3, 5.9, bottom), radial(19.4, 0.2, 9), 0.3)
    const nape = prof([[7.0 + dy, 12.2, 23.8], [10.0 + dy, 12.6, 24.4], [11.5 + dy, 15.0, 24.6]])
    const bun = ridged(ell(24.6, 11.9 + dy, 2.7, 2.5), (px, py) => Math.atan2(py - 11.9, px - 24.6) * 2, 0.4)
    return {
      back: [{ mat: "hair", sample: nape, tone: (x, y, t) => (t < 2 ? 2 : t), bias: -0.3 }, { mat: "hair", sample: bun, casts: true, tone: hairTone }],
      front: [{ mat: "hair", sample: cap, casts: true, tone: hairTone }],
    }
  },
  /* tóc ngang vai, gợn sóng, đuôi tóc hơi vểnh ra (mẹ) */
  shoulder(dy) {
    const bottom = {}
    for (const x of [12, 13, 22, 23]) bottom[x] = 99
    ;[4, 3, 3, 3, 3, 3, 4, 5].forEach((v, i) => { bottom[14 + i] = v + dy })
    const cap = ridged(capShape(6.7 + dy, 6.4, 6.0, bottom), radial(19.6, 0.2, 9), 0.34)
    const lockL = ridged(prof([[8.5, 11.8, 14.2], [11, 11.4, 14.3], [13, 11.0, 14.7], [14.4, 10.5, 14.9], [15.6, 10.3, 14.2]]), lockPhase, 0.5)
    const lockR = ridged(prof([[8.5, 21.8, 24.2], [11, 21.7, 24.6], [13, 21.3, 25.0], [14.4, 21.1, 25.5], [15.6, 21.8, 25.7]]), (px, py) => lockPhase(px + 1.2, py + 1.6), 0.5)
    const back = prof([[6, 12, 24], [10, 11.5, 24.5], [13.5, 11.0, 25.0], [15.4, 10.9, 25.1]])
    return {
      back: [{ mat: "hair", sample: back, bias: -0.3, tone: (x, y, t) => (t < 2 ? 2 : t) }],
      front: [{ mat: "hair", sample: lockL, tone: hairTone }, { mat: "hair", sample: lockR, tone: hairTone }, { mat: "hair", sample: cap, casts: true, tone: hairTone }],
    }
  },
  /* tóc ngắn chải gọn, trán cao, thái dương lùi (thầy) */
  combed(dy) {
    const bottom = {}
    ;[13, 22].forEach((x) => { bottom[x] = 3 + dy })
    ;[12, 23].forEach((x) => { bottom[x] = 4 + dy })
    ;[1, 2, 2, 2, 2, 2, 2, 1].forEach((v, i) => { bottom[14 + i] = v + dy })
    const cap = ridged(capShape(6.5 + dy, 6.2, 5.6, bottom), radial(16.0, 0.4, 8), 0.28)
    return { back: [], front: [{ mat: "hair", sample: cap, casts: true, tone: hairTone }] }
  },
  /* tóc trẻ con rối nhẹ, một cọng dựng (bé) */
  kidTousle(dy) {
    const bottom = {}
    ;[12, 13, 22, 23].forEach((x) => { bottom[x] = 5 + dy })
    ;[4, 3, 3, 3, 3, 3, 3, 4].forEach((v, i) => { bottom[14 + i] = v + dy })
    const cap = ridged(capShape(5.5 + dy, 6.2, 5.3, bottom), radial(17.0, 0.2, 8), 0.34)
    const tuft = prof([[0.0 + dy, 20.4, 22.6], [1.6 + dy, 19.6, 23.4]])
    return { back: [], front: [{ mat: "hair", sample: cap, casts: true, tone: hairTone }, { mat: "hair", sample: ridged(tuft, lockPhase, 0.4), tone: hairTone }] }
  },
  /* tóc cua ngắn gọn (nam) */
  crew(dy) {
    const bottom = {}
    ;[13, 22].forEach((x) => { bottom[x] = 4 + dy })
    ;[12, 23].forEach((x) => { bottom[x] = 5 + dy })
    ;[3, 3, 3, 3, 3, 3, 3, 3].forEach((v, i) => { bottom[14 + i] = v + dy })
    const cap = ridged(capShape(6.6 + dy, 6.1, 5.5, bottom), radial(18.0, 1.0, 8), 0.3)
    return { back: [], front: [{ mat: "hair", sample: cap, casts: true, tone: hairTone }] }
  },
}

/* ============================================================ dựng một khung hình */
const SLEEVE_REACH = { rolled: 0.1, threeq: 0.55, long: 1.0 }

function buildFigure(spec, poseName, expr, opts = {}) {
  const body = BODIES[spec.body]
  H = body.rows ?? ROWS
  const pose = { ...POSES.stand, ...POSES[poseName] }
  const buf = makeBuf()
  const g = spec.body === "girl" || spec.body === "woman" ? "f" : "m"
  const lift = pose.lift || 0
  const dy = pose.dy || 0
  const up = dy - lift // độ dời thân trên
  const ty = body.ty || 0 // dời đỉnh thân (trẻ con: đầu thấp hơn nên vai/cổ cao lên)
  const ps = body.ps || 1 // tỉ lệ biên độ tay (trẻ con tay ngắn hơn)
  const hd = pose.head || [0, 0]
  const hy = up + hd[1]
  const hx = hd[0]
  const jaw = OPEN_JAW.has(expr) || /^happy$/.test(expr) && opts.talk ? 1 : 0
  const flare = spec.legFlare || 0

  const A = (side, key, base) => {
    const d = pose[`arm${side}`]?.[key] ?? [0, 0]
    return [base[0] + d[0] * ps, base[1] + d[1] * ps]
  }
  const sgn = (side) => (side === "L" ? -1 : 1)

  const arm = {}
  for (const side of ["L", "R"]) {
    const s = sgn(side)
    arm[side] = {
      sh: A(side, "sh", [CX + s * body.shoulder.x, body.shoulder.y + up]),
      el: A(side, "el", [CX + s * body.elbow.x, body.elbow.y + dy * 0.5]),
      wr: A(side, "wr", [CX + s * body.wrist.x, body.wrist.y + dy * 0.3]),
      hd: A(side, "hd", [CX + s * body.wrist.x, body.hand.y + dy * 0.3]),
    }
  }
  const leg = {}
  for (const side of ["L", "R"]) {
    const s = sgn(side)
    const p = pose[`leg${side}`] || {}
    const kd = p.kn || [0, 0]
    const ad = p.an || [0, 0]
    leg[side] = {
      hip: [CX + s * body.hip.x, body.hip.y + dy],
      knee: [CX + s * body.knee.x + kd[0], body.knee.y + dy * 0.5 + kd[1]],
      ankle: [CX + s * body.ankle.x + ad[0], body.ankle.y + ad[1]],
    }
  }

  const parts = []
  const push = (p) => { parts.push(p); return p }
  const hair = HAIR_STYLES[spec.hair.style](hy)

  /* 1. tóc phía sau */
  for (const p of hair.back) push(p)

  /* 2. chân, tất, giày (chân trái vẽ sau để đổ bóng vào khe giữa) */
  const skirt = spec.bottom === "skirt"
  const shorts = spec.bottom === "shorts"
  for (const side of ["R", "L"]) {
    const l = leg[side]
    const R = body
    const calf = R.calf ? [[lerp(l.knee[0], l.ankle[0], 0.55), lerp(l.knee[1], l.ankle[1], 0.55), R.calf + flare]] : []
    const legChain = chain([[l.hip[0], l.hip[1], R.hip.r], [l.knee[0], l.knee[1], R.knee.r + flare], ...calf, [l.ankle[0], l.ankle[1], R.ankle.r + flare]])
    if (skirt || shorts) {
      push({ mat: "skin", sample: legChain, casts: true, tone: (x, y, t) => (y >= Math.floor(l.ankle[1]) - 1 ? DROP : t) })
      push({ mat: "sock", sample: chain([[l.ankle[0], l.ankle[1] - 1.2, R.ankle.r + 0.1], [l.ankle[0], l.ankle[1] + 1.6, R.ankle.r + 0.2]]) })
    } else {
      push({ mat: "bot", sample: legChain, casts: true, tone: creaseTone(l) })
    }
    push(shoePart(spec, l.ankle, side, body))
  }

  /* 3. thân dưới: quần (nam, jean), quần short (bé) hoặc váy (nữ) */
  if (skirt) {
    const k = [[26.8, CX - 4.8, CX + 4.8], [29, CX - 5.4, CX + 5.4], [33, CX - 6.1, CX + 6.1], [38, CX - 6.5, CX + 6.5], [43.4, CX - 7.1, CX + 7.1]]
    push({ mat: "bot", sample: prof(k, 0.1, 36, 10), casts: true, tone: pleatTone, cells: waistband() })
  } else if (shorts) {
    push({ mat: "bot", sample: prof(symKeys(body.pelvis), 0.15, 26, 4), casts: true })
    for (const side of ["R", "L"]) {
      const l = leg[side]
      const e = [lerp(l.hip[0], l.knee[0], 0.64), lerp(l.hip[1], l.knee[1], 0.64)]
      push({ mat: "bot", sample: chain([[l.hip[0], l.hip[1], body.hip.r + 0.4], [e[0], e[1], body.hip.r + 0.15]]), casts: true, tone: (x, y, t) => (y >= Math.floor(e[1] + 0.6) ? Math.min(3, t + 1) : t) })
    }
  } else {
    const fly = [[CX - 1, 29, 2], [CX - 1, 30, 2], [CX - 1, 31, 2], [CX - 1, 32, 2]]
    push({ mat: "bot", sample: prof(symKeys(body.pelvis), 0.15, 31, 4), casts: true, cells: spec.top === "uniformShirt" ? fly : [] })
  }

  /* 4. thân trên: áo */
  const tk = body.torso.map(([y, hw]) => [y - lift * Math.max(0, (28 - y) / 14), CX - hw, CX + hw])
  const lastHw = body.torso[body.torso.length - 1][1]
  if (spec.top === "tee") tk.push([body.hem ?? 31.5, CX - lastHw - 0.3, CX + lastHw + 0.3])
  if (spec.tunic) for (const [y, hw] of spec.tunic) tk.push([y, CX - hw, CX + hw])
  push({ mat: "top", sample: prof(tk, 0.28, 21 + ty, 8), casts: true, tone: spec.tunic ? tunicTone(spec) : undefined, cells: shirtDetails(spec, lift, body) })
  if (!skirt && !shorts && spec.top === "uniformShirt") {
    push({ mat: "belt", sample: prof([[27.6, CX - 5.8, CX + 5.8], [29.0, CX - 5.9, CX + 5.9]]), cells: [[CX - 1, 28, "buckle"], [CX, 28, "buckle"]] })
  }
  if (spec.jacket) for (const p of cardiganParts(body, lift)) push(p)

  /* 5. cổ */
  push({ mat: "skin", sample: chain([[CX + hx * 0.3, 11.2 + ty + hy * 0.4, body.neckR], [CX, (body.neckEnd ?? 14.6) + up + ty, body.neckR + 0.3]]),
    tone: (x, y, t) => (y > (spec.neckClip ?? 99) + up + ty ? DROP : y <= 12 + ty + hy * 0.4 ? 2 : y === 13 + ty ? Math.max(t, 1) : t) })
  const neck = collarParts(spec, body, up)
  for (const p of neck.under) push(p)

  /* 6. tay: cánh tay, bàn tay, tay áo */
  const reach = SLEEVE_REACH[spec.sleeve]
  for (const side of ["R", "L"]) {
    const a = arm[side]
    const R = body
    push({ mat: "skin", sample: chain([[a.sh[0], a.sh[1], R.shoulder.r - 0.2], [a.el[0], a.el[1], R.elbow.r], [a.wr[0], a.wr[1], R.wrist.r]]), casts: true })
    const palm = [lerp(a.wr[0], a.hd[0], 0.42), lerp(a.wr[1], a.hd[1], 0.42)]
    push({ mat: "skin", sample: chain([[a.wr[0], a.wr[1], R.wrist.r], [palm[0], palm[1], R.hand.r + 0.2], [a.hd[0], a.hd[1], R.hand.r - 0.1]]), casts: true, cells: handDetails(side, a, palm) })
    if (reach !== undefined) {
      const end = [lerp(a.el[0], a.wr[0], reach), lerp(a.el[1], a.wr[1], reach)]
      const endR = lerp(R.elbow.r + 0.55, R.wrist.r + 0.45, reach)
      push({
        mat: spec.jacket ? "jkt" : "top",
        sample: chain([[a.sh[0], a.sh[1] - 0.2, R.shoulder.r + 0.45], [a.el[0], a.el[1], R.elbow.r + 0.55], [end[0], end[1], endR]]),
        casts: true,
        tone: (x, y, t) => (Math.hypot(x + 0.5 - end[0], y + 0.5 - end[1]) < 1.35 ? Math.min(3, t + 1) : t),
      })
    } else {
      const sEnd = spec.sleeveEnd ?? body.sleeveEnd
      push({ mat: "top", sample: sleeveShape(a, body, sEnd), casts: true, tone: (x, y, t) => (y >= Math.floor(sEnd) ? Math.min(3, t + 1) : t) })
    }
  }

  /* 7. đầu */
  for (const p of headParts(body, hx, hy, jaw)) push(p)

  /* 8. tóc phía trước */
  for (const p of hair.front) push(p)

  /* 9. nơ / khăn quàng */
  for (const p of neck.over) push(p)

  for (const p of parts) paintPart(buf, p)

  const cells = faceCells(expr, opts.talk || 0, opts.blink || false, g, spec, body).map(([x, y, r]) => [x + hx, y + hy, r])
  stampFace(buf, cells)

  castShadows(buf)
  outlinePass(buf)
  return toRows(buf)
}

function stampFace(buf, cells) {
  for (const [x, y, role] of cells) {
    if (!inb(x, y)) continue
    const k = at(x, y)
    if (buf.mat[k] !== "skin" || buf.part[k] < 0) continue
    buf.raw[k] = role
  }
}

/* ============================================================ chi tiết từng phần */
function creaseTone(l) {
  const [kx, ky] = l.knee
  const ay = l.ankle[1]
  return (x, y, t) => {
    // nếp quần: đường sáng dọc phía trước từ gối xuống cổ chân; nếp dồn ở gấu quần
    if (y >= ky + 1 && y <= ay - 2 && x === Math.floor(kx - 0.4) && t > 0) return Math.max(0, t - 1)
    if (y === Math.round(ay) - 1 && t < 3) return t + 1
    return t
  }
}

const waistband = () => {
  const c = []
  for (let x = CX - 5; x <= CX + 4; x += 1) c.push([x, 27, x < CX ? 0 : 1])
  return c
}

function pleatTone(x, y, t) {
  if (y < 29) return t
  const phase = (((x - CX) % 4) + 4) % 4
  if (phase === 0) return Math.min(3, t + 1)
  if (phase === 2) return Math.max(0, t - 1)
  return t
}

function shirtDetails(spec, lift, body = {}) {
  const c = []
  const ty = body.ty || 0
  const ys = (y) => Math.round(y - lift * Math.max(0, (28 - y) / 14)) + ty
  if (spec.top === "uniformShirt") {
    /* nẹp áo + cúc */
    for (let y = 17; y <= 27; y += 1) c.push([CX - 1, ys(y), 2])
    for (const y of [19, 22, 25]) c.push([CX - 1, ys(y), 3], [CX, ys(y), 1])
  } else if (spec.top === "aodai") {
    /* áo dài: nẹp cài chéo từ cổ xuống nách phải rồi xuống thân, ba nút bấm nhỏ */
    for (const [x, y] of [[CX, 15], [CX, 16], [CX + 1, 17], [CX + 2, 18], [CX + 3, 19], [CX + 3, 20], [CX + 4, 21], [CX + 4, 22], [CX + 4, 23]]) c.push([x, ys(y), 3])
    for (const [x, y] of [[CX + 1, 16], [CX + 2, 17], [CX + 3, 18]]) c.push([x, ys(y), 0])
  } else if (spec.logo !== false) {
    /* áo thun: logo nhỏ trước ngực */
    for (const [x, y, v] of [[CX - 2, 20, "badge0"], [CX - 1, 20, "badge1"], [CX, 20, "badge1"], [CX + 1, 20, "badge0"], [CX - 1, 21, "badge0"], [CX, 21, "badge0"]]) c.push([x, ys(y), v])
  }
  /* nếp áo dưới nách và dồn eo (có chủ đích: đoạn chéo ngắn) */
  const w = body.fw ?? (spec.body === "boy" ? 6 : 5)
  if (spec.top !== "aodai") {
    c.push([CX - w, ys(19), 2], [CX - w + 1, ys(20), 2], [CX - w + 2, ys(21), 2], [CX - w + 2, ys(22), 2])
    c.push([CX + w - 1, ys(19), 3], [CX + w - 2, ys(20), 3], [CX + w - 3, ys(21), 3], [CX + w - 3, ys(22), 3])
  }
  if (spec.top === "uniformShirt") for (let x = CX - w + 1; x <= CX + w - 2; x += 1) c.push([x, ys(27), x < CX ? 2 : 3])
  if (spec.pocket) {
    // túi ngực (bên phải người xem) + huy hiệu (Đoàn) hoặc bút cài túi (thầy)
    for (const [x, y, t] of [[20, 19, 2], [21, 19, 2], [22, 19, 2], [20, 20, 1], [20, 21, 1], [20, 22, 2], [21, 22, 2], [22, 22, 2], [22, 20, 2], [22, 21, 2]]) c.push([x, ys(y), t])
    if (spec.pocket === true) c.push([21, ys(20), "badge1"], [21, ys(21), "badge0"])
    else c.push([21, ys(19), "buckle"], [21, ys(20), "belt"], [21, ys(21), 1])
  }
  return c
}

/** Áo dài: nếp vải dọc ở vạt trước và gấu áo tối hơn một nấc. */
function tunicTone(spec) {
  const hem = spec.tunic[spec.tunic.length - 1][0]
  return (x, y, t) => {
    if (y < 30) return t
    if (y >= hem - 1.2) return Math.min(3, t + 1)
    if (x === CX - 2) return Math.max(0, t - 1)
    if (x === CX + 1) return Math.min(3, t + 1)
    return t
  }
}

/** Áo len cardigan: hai vạt trước hở chữ V để lộ áo sơ mi, viền nẹp tối, hàng cúc, gấu bo rib. */
function cardiganParts(body, lift) {
  const last = body.torso[body.torso.length - 1][1]
  const tk = body.torso.map(([y, hw]) => [y - lift * Math.max(0, (28 - y) / 14), CX - hw - 0.55, CX + hw + 0.55])
  tk.push([30.6, CX - last - 0.6, CX + last + 0.6])
  const vHalf = (y) => (y <= 22 ? (23 - y) * 0.36 : -1)
  const ys = (y) => Math.round(y - lift * Math.max(0, (28 - y) / 14))
  const cells = []
  for (let y = 23; y <= 30; y += 1) cells.push([CX - 1, ys(y), 3])
  for (const y of [24, 27]) cells.push([CX - 1, ys(y), "buckle"], [CX, ys(y), "buckle"])
  return [{
    mat: "jkt",
    sample: prof(tk, 0.28, 21, 8),
    casts: true,
    cells,
    tone: (x, y, t) => {
      const d = Math.abs(x + 0.5 - CX)
      const v = vHalf(y)
      if (v >= 0 && d <= v) return DROP
      if (v >= 0 && d <= v + 1.15) return Math.min(3, t + 1)
      if (y >= 29) return (x + y) % 2 ? Math.min(3, t + 1) : t
      return t
    },
  }]
}

function sleeveShape(a, body, end = body.sleeveEnd) {
  const f = chain([[a.sh[0], a.sh[1] - 0.2, body.shoulder.r + 0.45], [a.el[0], lerp(a.sh[1], a.el[1], 0.45), body.elbow.r + 0.55]])
  return (px, py) => (py > end ? null : f(px, py))
}

function handDetails(side, a, palm) {
  // ngón cái tách khỏi bàn tay bằng một vệt tối phía trong; hai vạch ngón ở đầu bàn tay
  const inner = side === "L" ? 1 : -1
  const x = Math.floor(palm[0])
  const y = Math.floor(palm[1])
  const tx = Math.floor(a.hd[0])
  const ty = Math.floor(a.hd[1])
  return [[x + (inner > 0 ? 1 : 0), y, 2], [x + (inner > 0 ? 1 : 0), y + 1, 2], [tx, ty, 2], [tx, ty + 1, 3]]
}

function shoePart(spec, ankle, side, body = {}) {
  const [ax, ay] = ankle
  const sneaker = spec.shoes === "sneaker"
  const sz = body.shoe ?? { rx: 3.35, ry: 2.35, cy: 2.9, sole: 1.4 }
  const cy = ay + sz.cy
  const sx = ax + (side === "L" ? -0.3 : 0.3)
  const base = ell(sx, cy, sz.rx, sz.ry)
  const tx = Math.floor(sx - 0.5)
  const ty = Math.floor(cy - 1.2)
  return {
    mat: "shoe",
    clean: false,
    cells: [[tx, ty, 0], [tx + 1, ty, 0], [tx, ty + 1, 2], [tx + 1, ty + 1, 1]],
    sample: (px, py) => (py > H - 1.01 ? null : base(px, py)),
    tone: (x, y, t) => {
      const yy = Math.floor(cy + sz.sole)
      if (y >= yy) return sneaker ? "sole0" : "sole1"
      if (y === yy - 1 && t < 3) return Math.min(3, t + 1) // mũi giày: đường may mép
      return t
    },
  }
}

function collarParts(spec, body, up) {
  const under = []
  const over = []
  const ty = body.ty || 0
  const put = (map, x, y, t) => map.set(`${x},${y + up + ty}`, t)
  if (spec.top === "aodai") {
    /* cổ đứng của áo dài: dải vải ôm cổ hai hàng, đầu cổ loe nhẹ ở hàng dưới */
    const stand = new Map()
    for (let x = 15; x <= 20; x += 1) put(stand, x, 13, x < CX ? 1 : 2)
    for (let x = 14; x <= 21; x += 1) put(stand, x, 14, x < CX ? 1 : 3)
    put(stand, 17, 13, 0)
    put(stand, 16, 13, 0)
    under.push({ mat: "top", casts: true, clean: false, sample: (px, py, x, y) => (stand.has(`${x},${y}`) ? [0, 0, 1] : null), tone: (x, y) => stand.get(`${x},${y}`) })
  } else if (spec.top === "uniformShirt") {
    /* cổ áo sơ mi: hai ve áo trắng, ve trái (phía người xem) sáng hơn, ve phải đổ bóng */
    const flap = new Map()
    const left = [[14, 13, 1], [15, 13, 0], [14, 14, 1], [15, 14, 0], [16, 14, 1], [16, 15, 1], [15, 15, 2], [13, 14, 2], [16, 13, 1]]
    const right = [[21, 13, 2], [20, 13, 1], [21, 14, 2], [20, 14, 1], [19, 14, 2], [19, 15, 2], [20, 15, 3], [22, 14, 3], [19, 13, 2]]
    for (const [x, y, t] of [...left, ...right]) put(flap, x, y, t)
    under.push({ mat: "top", casts: true, clean: false, sample: (px, py, x, y) => (flap.has(`${x},${y}`) ? [0, 0, 1] : null), tone: (x, y) => flap.get(`${x},${y}`) })
  } else {
    const band = new Map()
    for (let x = 15; x <= 20; x += 1) put(band, x, 14, x < CX ? 2 : 3)
    for (let x = 16; x <= 19; x += 1) put(band, x, 15, x < CX ? 2 : 3)
    under.push({ mat: "top", clean: false, sample: (px, py, x, y) => (band.has(`${x},${y}`) ? [0, 0, 1] : null), tone: (x, y) => band.get(`${x},${y}`) })
  }
  if (spec.neckwear) {
    const grid = spec.neckwear === "scarf" ? SCARF_GRID : BOW_GRID
    const m = new Map()
    grid.rows.forEach((row, j) => {
      for (let i = 0; i < row.length; i += 1) if (row[i] !== ".") put(m, grid.x0 + i, grid.y0 + j, Number(row[i]))
    })
    over.push({ mat: "acc", casts: true, clean: false, sample: (px, py, x, y) => (m.has(`${x},${y}`) ? [0, 0, 1] : null), tone: (x, y) => m.get(`${x},${y}`) })
  }
  return { under, over }
}
/* nơ (nữ) và khăn quàng đỏ (nam): chữ số = sắc 0..3 của nhóm acc */
const BOW_GRID = { x0: 14, y0: 15, rows: ["10..22..", "1100.011", "1110.221", "..2332..", "..2..3.."].map((r) => r.padEnd(8, ".")) }
const SCARF_GRID = { x0: 14, y0: 14, rows: ["11000222", ".110.222", "..11022.", "..1122..", "...12...", "....2..."] }

function headParts(body, hx, hy, jaw) {
  const spans = {}
  const rows = body.face
  const shift = (r) => r.map(([a, b]) => [a + hx, b + hx])
  for (const k of Object.keys(rows)) {
    const y = Number(k)
    spans[(jaw && y >= (body.jawRow ?? 11) ? y + 1 : y) + hy] = shift(rows[k])
  }
  // hàm mặt: pháp tuyến phẳng hơn mặt cầu để mặt nhỏ không bị chia nửa sáng-tối quá gắt
  const nrm = (px, py) => {
    const nx = clamp((px - CX - hx) / 5.0, -1, 1)
    const ny = clamp((py - (7.4 + hy)) / 6.0, -1, 1) * 0.35
    return [nx, ny, Math.sqrt(Math.max(0.05, 1 - nx * nx - ny * ny))]
  }
  const parts = [{ mat: "skin", sample: rowsShape(spans, nrm), casts: true, bias: 0.04 }]
  if (body.ears) {
    const e = {}
    const er = body.earRows ?? [6, 7, 8]
    for (const y of er) e[y + hy] = [[13 + hx, 13 + hx], [22 + hx, 22 + hx]]
    const cl = [1, 2, 1]
    const cr = [2, 3, 2]
    const cells = []
    er.forEach((y, i) => cells.push([13 + hx, y + hy, cl[i]], [22 + hx, y + hy, cr[i]]))
    parts.unshift({ mat: "skin", sample: rowsShape(e, () => [0, 0, 1]), bias: -0.05, cells })
  }
  return parts
}

/* ============================================================ hậu xử lý */
const CAST_RECV = new Set(["skin", "top", "bot", "sock", "jkt"])
function castShadows(buf) {
  const next = buf.tone.slice()
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      const k = at(x, y)
      const id = buf.part[k]
      if (id < 0 || buf.raw[k] || !CAST_RECV.has(buf.mat[k])) continue
      for (const [dx, dy] of [[0, -1], [-1, 0], [-1, -1]]) {
        const nx = x + dx
        const ny = y + dy
        if (!inb(nx, ny)) continue
        const q = buf.part[at(nx, ny)]
        if (q > id && buf.parts[q].casts) { next[k] = Math.min(3, next[k] + 1); break }
      }
    }
  }
  buf.tone = next
}

/* Viền ngoài có màu: mặt hướng sáng (viền ở bên trái/trên của khối) dùng sắc tối thứ ba của chính vật liệu
   — nhẹ hơn, tạo cảm giác ánh sáng bao quanh; mặt khuất dùng sắc viền đậm. */
const LIT_LINE = { skin: "skin3", top: "top3", sock: "sock2", bot: "bot2", jkt: "jkt3" }

function outlinePass(buf) {
  const out = []
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < COLS; x += 1) {
      const k = at(x, y)
      if (buf.part[k] >= 0) continue
      let best = null
      let bp = -1
      let lit = false
      for (const [dx, dy] of [[0, 1], [1, 0], [-1, 0], [0, -1]]) {
        const nx = x + dx
        const ny = y + dy
        if (!inb(nx, ny)) continue
        const nk = at(nx, ny)
        if (buf.part[nk] < 0) continue
        const m = buf.mat[nk]
        if (MATS[m].prio > bp) { bp = MATS[m].prio; best = m; lit = dx === 1 || dy === 1 }
      }
      if (best) out.push([k, lit && LIT_LINE[best] ? LIT_LINE[best] : MATS[best].line])
    }
  }
  for (const [k, role] of out) buf.line[k] = role
}

function toRows(buf) {
  const rows = []
  for (let y = 0; y < H; y += 1) {
    let s = ""
    for (let x = 0; x < COLS; x += 1) {
      const k = at(x, y)
      let role = null
      if (buf.part[k] >= 0) role = buf.raw[k] ?? MATS[buf.mat[k]].ramp[buf.tone[k]]
      else if (buf.line[k]) role = buf.line[k]
      s += role ? ROLE_CHAR[role] : "."
    }
    rows.push(s)
  }
  return rows
}

/* ============================================================ API công khai */
function frameList() {
  const list = []
  const mood = (m, pose, expr) => {
    list.push([`${m}-idle`, pose, expr, {}])
    list.push([`${m}-talk`, pose, expr, { talk: 1 }])
  }
  mood("neutral", "stand", "neutral")
  mood("happy", "happy", "happy")
  mood("sad", "sad", "sad")
  mood("annoyed", "annoyed", "annoyed")
  mood("concerned", "concerned", "concerned")
  mood("defensive", "defensive", "defensive")
  list.push(["neutral-react", "stand", "surprised", {}])
  list.push(["neutral-blink", "stand", "neutral", { blink: true }])
  list.push(["neutral-breathe", "breathe", "neutral", {}])
  for (const w of ["walk-a", "walk-b", "walk-c", "walk-d"]) list.push([w, w, "neutral", {}])
  return list
}

/**
 * Dựng toàn bộ khung cho một nhân vật.
 * @param {object} spec  một mục của SPECS (hoặc SPECS.x trộn với CASUAL.*)
 * @returns {{frames: Record<string,string[]>, palette: Record<string,string>, cols:number, rows:number, cell:number}}
 */
export function buildCharacter(spec) {
  const body = BODIES[spec.body]
  const frames = {}
  for (const [name, pose, expr, opts] of frameList()) {
    let rows = buildFigure(spec, pose, expr, opts)
    if (body.stretch) rows = stretchRows(rows, body.stretch)
    if (body.padTop) rows = [...Array(body.padTop).fill(".".repeat(COLS)), ...rows]
    frames[name] = rows
  }
  const nRows = frames["neutral-idle"].length
  return { frames, palette: paletteFor(spec), cols: COLS, rows: nRows, cell: CELL }
}

/** Kéo dài: sau hàng r chèn thêm n bản sao của hàng đó (plan = [[r, n], ...] theo toạ độ gốc). */
function stretchRows(rows, plan) {
  const extra = new Map(plan)
  const out = []
  rows.forEach((row, y) => {
    out.push(row)
    for (let i = 0; i < (extra.get(y) || 0); i += 1) out.push(row)
  })
  return out
}

export const buildLinh = () => buildCharacter(SPECS.linh)
export const buildMinh = () => buildCharacter(SPECS.minh)
