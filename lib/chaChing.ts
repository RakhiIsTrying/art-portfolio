// A cash register's "cha-ching", synthesised so there's no sound file to download.

/** The "cha": a short burst of filtered noise, like the drawer being hit. */
function cha(ctx: BaseAudioContext, at: number, out: AudioNode) {
  const length = Math.floor(ctx.sampleRate * 0.08)
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
  const noise = ctx.createBufferSource()
  noise.buffer = buffer
  const filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 2400
  filter.Q.value = 0.8
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.5, at)
  gain.gain.exponentialRampToValueAtTime(0.001, at + 0.08)
  noise.connect(filter).connect(gain).connect(out)
  noise.start(at)
}

/** The "ching": a bell, made of a few high notes fading at different speeds. */
function ching(ctx: BaseAudioContext, at: number, out: AudioNode) {
  for (const [freq, level, fade] of [[2637, 0.3, 0.9], [3951, 0.22, 0.7], [5274, 0.14, 0.5], [7040, 0.07, 0.3]]) {
    const bell = ctx.createOscillator()
    bell.type = 'sine'
    bell.frequency.value = freq
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(level, at)
    gain.gain.exponentialRampToValueAtTime(0.0001, at + fade)
    bell.connect(gain).connect(out)
    bell.start(at)
    bell.stop(at + fade)
  }
}

export function playChaChing(ctx: BaseAudioContext, { volume = 0.6 } = {}) {
  const at = ctx.currentTime + 0.01
  const out = ctx.createGain()
  out.gain.value = volume
  out.connect(ctx.destination)
  cha(ctx, at, out)
  ching(ctx, at + 0.09, out)
}
