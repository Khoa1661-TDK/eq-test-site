/* sound.js — âm thanh pixel tổng hợp bằng WebAudio.
   Nguyên tắc: rất khẽ, rất ngắn, chỉ phát sau khi người dùng đã tương tác,
   có công tắc rõ ràng, không dùng âm thanh/tiếng động lấy từ game khác.

   Giọng thoại: mỗi ký tự hiện ra một tiếng "blip" vuông rất ngắn, cao độ NHẢY
   giữa các ký tự (không trượt trong từng tiếng) nên nghe như đang nói. Tiếng gắt
   kiểu chip 8-bit có được nhờ hai xung vuông lệch nhau vài Hz chồng lên nhau.
   Mỗi biểu cảm của nhân vật có một hồ sơ giọng riêng (cao/thấp/nhanh/chậm).

   note(): nốt có bao ADSR, trộn vuông ↔ tam giác — dùng cho các tiếng "sống"
   (tick, arpeggio, chuông, jingle). Nhạc nền: vòng 8 nhịp ~100 BPM lên lịch
   nhìn trước (không lệch bằng setInterval), chỉ chạy lúc âm thanh đang bật. */

const KEY = "sbti_sound"
const VOICE_GAP = 34 /* ms — giãn nhịp để không bao giờ thành tiếng rè liên hồi */
const VOICE_TONE = 5000 /* Hz — chỉ cắt hài âm rất cao, giữ độ gắt đặc trưng */
const VOICE_DETUNE = 0.0135 /* hai xung lệch nhau ~1,35% -> tiếng đục, gắt, không "sạch" */

/* Nhạc nền: vòng 8 nhịp, thang năm cung nhẹ nhàng. [beat bắt đầu, nốt MIDI, độ dài beat].
   Lên lịch nhìn trước: mỗi nhịp tick chỉ ghi nốt cho VÙNG THỜI GIAN TƯƠNG LAI tính theo
   đồng hồ AudioContext, nên nhịp không bao giờ lệch dù setInterval có trễ. */
const MUSIC_BPM = 100
const MUSIC_TICK_MS = 120
const MUSIC_LOOKAHEAD = 0.5
const MUSIC_GAIN = 0.06
const MUSIC_LOOP_BEATS = 32
const MUSIC_MELODY = [
  [0, 72, 1.5], [2, 76, 0.5], [3, 79, 1],
  [4, 81, 2], [6, 79, 2],
  [8, 76, 1.5], [10, 74, 0.5], [11, 76, 1],
  [12, 74, 2], [14, 72, 2],
  [16, 76, 2], [18, 79, 2],
  [20, 81, 1.5], [22, 79, 0.5], [23, 76, 1],
  [24, 74, 2], [26, 76, 2],
  [28, 72, 3], [31, 76, 1],
]
const MUSIC_BASS = [
  [0, 48, 4], [4, 43, 4], [8, 45, 4], [12, 48, 4],
  [16, 48, 4], [20, 45, 4], [24, 43, 4], [28, 48, 4],
]

/** Nốt nhạc nền: MIDI → tần số, bao ADSR mềm; mix 0 = tam giác hẳn cho trầm trầm. */
function musicNote(midi, t0, durSec, gain, mix) {
  return { freq: 440 * 2 ** ((midi - 69) / 12), t0, dur: durSec, gain, mix, attack: 0.02, decay: 0.15, sustain: 0.5, release: 0.2 }
}

/** Hồ sơ giọng theo biểu cảm của nhân vật. */
const VOICES = {
  neutral: { f0: 175, jitter: 0.12, dur: 0.030, gain: 0.019 },
  blink: { f0: 175, jitter: 0.12, dur: 0.030, gain: 0.019 },
  thinking: { f0: 156, jitter: 0.11, dur: 0.032, gain: 0.018 },
  concerned: { f0: 147, jitter: 0.11, dur: 0.032, gain: 0.018 },
  happy: { f0: 208, jitter: 0.14, dur: 0.028, gain: 0.019 },
  surprised: { f0: 247, jitter: 0.15, dur: 0.026, gain: 0.019 },
}

class SoundEngine {
  constructor() {
    this.enabled = readPref() !== "off"
    this.ctx = null
    this.master = null
    this._lastVoice = 0
    this._voice = VOICES.neutral
    this._drift = 0
    this._listeners = new Set()
    this._music = null // { loopStart, melodyAt, bassAt, timer } khi vòng nhạc đang chạy
    this._musicGain = null
    this._musicWanted = false
  }

  subscribe(fn) {
    this._listeners.add(fn)
    fn(this.enabled)
    return () => this._listeners.delete(fn)
  }

  setEnabled(on) {
    this.enabled = !!on
    for (const fn of this._listeners) fn(this.enabled)
    try {
      localStorage.setItem(KEY, this.enabled ? "on" : "off")
    } catch {
      /* chế độ riêng tư: bỏ qua */
    }
    if (this.enabled) {
      this.blip({ freq: 660, dur: 0.05, gain: 0.03 })
      if (this._musicWanted) this._startMusicLoop()
    } else {
      this._stopMusicLoop()
    }
  }

  toggle() {
    this.setEnabled(!this.enabled)
  }

  /** Khởi tạo audio chỉ trong một cử chỉ người dùng. */
  _ensure() {
    if (!this.enabled) return null
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    if (!this.ctx) {
      try {
        this.ctx = new AC()
        this.master = this.ctx.createGain()
        this.master.gain.value = 0.5
        this.master.connect(this.ctx.destination)
      } catch {
        this.ctx = null
        return null
      }
    }
    if (this.ctx.state === "suspended") this.ctx.resume().catch(() => {})
    return this.ctx
  }

  blip({ freq = 880, dur = 0.02, gain = 0.03, type = "square", glide = 0, when = 0, tone = 0, detune = 0 }) {
    const ctx = this._ensure()
    if (!ctx || !this.master) return
    const t0 = ctx.currentTime + when
    const osc = ctx.createOscillator()
    const env = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, t0)
    if (glide) osc.frequency.exponentialRampToValueAtTime(Math.max(60, freq + glide), t0 + dur)
    env.gain.setValueAtTime(0.0001, t0)
    env.gain.exponentialRampToValueAtTime(gain, t0 + 0.0015)
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
    osc.connect(env)
    const oscs = [osc]
    if (detune) {
      // xung thứ hai lệch vài Hz: hai tần số đập vào nhau tạo độ gắt, đục kiểu chip
      const twin = ctx.createOscillator()
      const twinGain = ctx.createGain()
      twin.type = type
      twin.frequency.setValueAtTime(freq * (1 + detune), t0)
      twinGain.gain.value = 0.6
      twin.connect(twinGain)
      twinGain.connect(env)
      oscs.push(twin)
    }
    if (tone) {
      const lp = ctx.createBiquadFilter()
      lp.type = "lowpass"
      lp.frequency.setValueAtTime(tone, t0)
      lp.connect(this.master)
      env.connect(lp)
    } else {
      env.connect(this.master)
    }
    for (const o of oscs) {
      o.start(t0)
      o.stop(t0 + dur + 0.02)
    }
  }

  /** Nốt có bao ADSR, trộn vuông ↔ tam giác theo mix (1 = vuông hẳn, 0 = tam giác hẳn). */
  note({ freq, dur = 0.12, gain = 0.03, mix = 1, attack = 0.004, decay = 0.05, sustain = 0.5, release = 0.06, when = 0, dest = null }) {
    const ctx = this._ensure()
    if (!ctx) return
    this._playNote(ctx, dest || this.master, { freq, t0: ctx.currentTime + when, dur, gain, mix, attack, decay, sustain, release })
  }

  _playNote(ctx, dest, { freq, t0, dur, gain, mix, attack, decay, sustain, release }) {
    if (!dest) return
    const env = ctx.createGain()
    const sus = Math.max(0.0001, gain * sustain)
    env.gain.setValueAtTime(0.0001, t0)
    env.gain.linearRampToValueAtTime(Math.max(0.0002, gain), t0 + attack)
    env.gain.exponentialRampToValueAtTime(sus, t0 + attack + decay)
    const off = Math.max(t0 + attack + decay + 0.001, t0 + dur)
    env.gain.setValueAtTime(sus, off)
    env.gain.exponentialRampToValueAtTime(0.0001, off + release)
    const stop = off + release + 0.02
    const voice = (type, weight) => {
      if (weight <= 0) return
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = type
      osc.frequency.setValueAtTime(freq, t0)
      g.gain.value = weight
      osc.connect(g)
      g.connect(env)
      osc.start(t0)
      osc.stop(stop)
    }
    voice("square", mix)
    voice("triangle", 1 - mix)
    env.connect(dest)
  }

  /** Đổi hồ sơ giọng theo biểu cảm đang hiện của nhân vật. */
  setVoice(face) {
    this._voice = VOICES[face] || VOICES.neutral
    this._drift = 0
  }

  /** Một tiếng "blip" cho ký tự vừa hiện ra. Khoảng trắng thì im lặng. */
  voice(char = "") {
    if (!this.enabled) return
    if (!char.trim()) return
    const now = performance.now()
    if (now - this._lastVoice < VOICE_GAP) return
    this._lastVoice = now
    const v = this._voice
    // Cao độ NHẢY giữa các ký tự (có quán tính nhẹ cho liền mạch) nhưng KHÔNG trượt
    // trong từng tiếng: trượt xuống chính là thứ nghe ra "tiếng vỗ cánh".
    this._drift = this._drift * 0.55 + (Math.random() * 2 - 1) * 0.45
    const accent = ((char.codePointAt(0) % 7) / 7) * 0.05 - 0.025
    const freq = v.f0 * (1 + this._drift * v.jitter + accent)
    this.blip({ freq, dur: v.dur, gain: v.gain, type: "square", tone: VOICE_TONE, detune: VOICE_DETUNE })
  }

  /** Di chuyển giữa các lựa chọn: một tiếng "tách" ngắn, phẳng, dứt khoát. */
  move() {
    this.note({ freq: 740, dur: 0.03, gain: 0.03, mix: 0.85, attack: 0.002, decay: 0.02, sustain: 0.25, release: 0.03 })
  }

  /** Chọn xong: ba nốt rải đi lên (Đô trưởng) — tiếng xác nhận vui. */
  confirm() {
    this.note({ freq: 523.25, dur: 0.07, gain: 0.032, mix: 0.6 })
    this.note({ freq: 659.25, dur: 0.07, gain: 0.032, mix: 0.6, when: 0.07 })
    this.note({ freq: 783.99, dur: 0.16, gain: 0.032, mix: 0.6, when: 0.14 })
  }

  /** Mở màn chơi: bốn nốt chuông đi lên (rải Sol trưởng). */
  open() {
    this.note({ freq: 392, dur: 0.08, gain: 0.028, mix: 0.3, when: 0 })
    this.note({ freq: 493.88, dur: 0.08, gain: 0.028, mix: 0.3, when: 0.08 })
    this.note({ freq: 587.33, dur: 0.08, gain: 0.028, mix: 0.3, when: 0.16 })
    this.note({ freq: 783.99, dur: 0.2, gain: 0.028, mix: 0.3, when: 0.24 })
  }

  /** Bấm "Tiếp ▶": một tiếng "bốp" ngắn, tròn. */
  tap() {
    this.note({ freq: 560, dur: 0.035, gain: 0.035, mix: 0.5, attack: 0.002, decay: 0.03, sustain: 0.3, release: 0.04 })
  }

  /** Hậu quả kết thúc: hai nốt mềm đi xuống. */
  softEnd() {
    this.note({ freq: 783.99, dur: 0.1, gain: 0.024, mix: 0.15, attack: 0.01, decay: 0.08, sustain: 0.4, release: 0.12 })
    this.note({ freq: 587.33, dur: 0.24, gain: 0.024, mix: 0.15, attack: 0.01, decay: 0.08, sustain: 0.4, release: 0.2, when: 0.14 })
  }

  /** Trang kết quả hiện ra: khúc jingle "chiến thắng" ngắn. */
  result() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1318.51]
    notes.forEach((freq, i) => {
      this.note({ freq, dur: i === notes.length - 1 ? 0.3 : 0.09, gain: 0.03, mix: 0.45, when: i * 0.09 })
    })
  }

  /** Xin vòng nhạc nền (chỉ chạy khi âm thanh đang bật; nhớ ý định để bật lại sau). */
  startMusic() {
    this._musicWanted = true
    if (this.enabled) this._startMusicLoop()
  }

  /** Tắt hẳn nhạc nền (rời trang / huỷ). */
  stopMusic() {
    this._musicWanted = false
    this._stopMusicLoop()
  }

  _stopMusicLoop() {
    if (this._music) clearInterval(this._music.timer)
    this._music = null
  }

  _startMusicLoop() {
    if (this._music) return
    const ctx = this._ensure()
    if (!ctx) return
    if (!this._musicGain) {
      this._musicGain = ctx.createGain()
      this._musicGain.gain.value = MUSIC_GAIN
      this._musicGain.connect(ctx.destination)
    }
    const beatSec = 60 / MUSIC_BPM
    const state = { loopStart: ctx.currentTime + 0.2, melodyAt: 0, bassAt: 0, timer: 0 }
    this._music = state
    const tick = () => {
      if (!this._music || !this.enabled) return
      const horizon = ctx.currentTime + MUSIC_LOOKAHEAD
      while (state.melodyAt < MUSIC_MELODY.length && state.loopStart + MUSIC_MELODY[state.melodyAt][0] * beatSec < horizon) {
        const [beat, midi, dur] = MUSIC_MELODY[state.melodyAt]
        this._playNote(ctx, this._musicGain, musicNote(midi, state.loopStart + beat * beatSec, dur * beatSec, 0.55, 0.35))
        state.melodyAt += 1
      }
      while (state.bassAt < MUSIC_BASS.length && state.loopStart + MUSIC_BASS[state.bassAt][0] * beatSec < horizon) {
        const [beat, midi, dur] = MUSIC_BASS[state.bassAt]
        this._playNote(ctx, this._musicGain, musicNote(midi, state.loopStart + beat * beatSec, dur * beatSec, 0.45, 0))
        state.bassAt += 1
      }
      if (state.melodyAt >= MUSIC_MELODY.length && state.bassAt >= MUSIC_BASS.length) {
        // hết vòng: quay về đầu, dịch mốc thời gian (không trừ khoảng trễ của tick → không lệch nhịp)
        state.loopStart += MUSIC_LOOP_BEATS * beatSec
        state.melodyAt = 0
        state.bassAt = 0
      }
    }
    tick()
    state.timer = setInterval(tick, MUSIC_TICK_MS)
  }
}

function readPref() {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export const sound = new SoundEngine()

/** Nút bật/tắt âm thanh dùng chung, tự đồng bộ giữa các vị trí. */
export function soundToggle({ cls = "" } = {}) {
  const dot = document.createElement("span")
  dot.className = "sound-toggle__dot"
  const label = document.createElement("span")
  label.className = "sound-toggle__label"
  const inner = document.createElement("span")
  inner.className = "pxf-in"
  inner.append(dot, label)
  const btn = document.createElement("button")
  btn.type = "button"
  btn.className = `btn btn--ghost sound-toggle ${cls}`.trim()
  btn.appendChild(inner)
  sound.subscribe((on) => {
    btn.dataset.sound = on ? "on" : "off"
    label.textContent = on ? "Âm thanh: bật" : "Âm thanh: tắt"
    btn.setAttribute("aria-pressed", String(on))
    btn.setAttribute("aria-label", on ? "Tắt âm thanh" : "Bật âm thanh")
  })
  btn.addEventListener("click", () => sound.toggle())
  return btn
}