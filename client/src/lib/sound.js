export function playTone(type = 'like') {
  const enabled = localStorage.getItem('sound') !== 'off'
  if (!enabled) return
  const ctx = new (window.AudioContext || window.webkitAudioContext)()
  const o = ctx.createOscillator()
  const g = ctx.createGain()
  o.connect(g)
  g.connect(ctx.destination)
  const now = ctx.currentTime

  const preset = {
    like: { f1: 520, f2: 780, dur: 0.12 },
    achievement: { f1: 880, f2: 1320, dur: 0.18 },
    post: { f1: 300, f2: 520, dur: 0.14 }
  }[type] || { f1: 440, f2: 660, dur: 0.12 }

  o.type = 'sine'
  o.frequency.setValueAtTime(preset.f1, now)
  o.frequency.exponentialRampToValueAtTime(preset.f2, now + preset.dur)
  g.gain.setValueAtTime(0.0001, now)
  g.gain.exponentialRampToValueAtTime(0.12, now + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, now + preset.dur)
  o.start(now)
  o.stop(now + preset.dur + 0.03)
}
