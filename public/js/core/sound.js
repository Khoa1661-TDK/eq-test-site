/* sound.js — âm thanh pixel tổng hợp bằng WebAudio.
   Nguyên tắc: rất khẽ, rất ngắn, chỉ phát sau khi người dùng đã tương tác,
   có công tắc rõ ràng, không dùng âm thanh/tiếng động lấy từ game khác.

   Giọng thoại: mỗi ký tự hiện ra một tiếng "blip" vuông rất ngắn, cao độ NHẢY
   giữa các ký tự (không trượt trong từng tiếng) nên nghe như đang nói. Tiếng gắt
   kiểu chip 8-bit có được nhờ hai xung vuông lệch nhau vài Hz chồng lên nhau.
   Mỗi biểu cảm của nhân vật có một hồ sơ giọng riêng (cao/thấp/nhanh/chậm). */

const KEY = "sbti_sound"
const VOICE_GAP = 34 /* ms — giãn nhịp để không bao giờ thành tiếng rè liên hồi */
const VOICE_TONE = 5000 /* Hz — chỉ cắt hài âm rất cao, giữ độ gắt đặc trưng */
const VOICE_DETUNE = 0.0135 /* hai xung lệch nhau ~1,35% -> tiếng đục, gắt, không "sạch" */

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
    if (this.enabled) this.blip({ freq: 660, dur: 0.05, gain: 0.03 })
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
    this.blip({ freq: 620, dur: 0.024, gain: 0.03, type: "square", tone: 6000 })
  }

  /** Chọn xong: hai nốt đi lên (quãng năm) — tiếng xác nhận kiểu menu game. */
  confirm() {
    this.blip({ freq: 660, dur: 0.04, gain: 0.032, type: "square", tone: 6000 })
    this.blip({ freq: 990, dur: 0.09, gain: 0.03, type: "square", tone: 6000, when: 0.05 })
  }

  /** Mở màn chơi: ba bậc đi lên. */
  open() {
    this.blip({ freq: 440, dur: 0.045, gain: 0.03, type: "square", tone: 6000 })
    this.blip({ freq: 587, dur: 0.045, gain: 0.03, type: "square", tone: 6000, when: 0.06 })
    this.blip({ freq: 784, dur: 0.09, gain: 0.03, type: "square", tone: 6000, when: 0.12 })
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