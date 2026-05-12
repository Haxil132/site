import { useEffect, useRef } from 'react'
import WaveSurfer from 'wavesurfer.js'

export default function AudioWave({ url }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!url || !ref.current) return
    const ws = WaveSurfer.create({
      container: ref.current,
      waveColor: 'rgba(255,255,255,0.30)',
      progressColor: 'rgba(255,255,255,0.90)',
      height: 60,
      barWidth: 2,
      barGap: 2,
      barRadius: 2,
      cursorWidth: 0
    })
    ws.load(url)
    return () => ws.destroy()
  }, [url])

  return <div ref={ref} className="w-full overflow-hidden rounded-2xl border border-white/10 bg-black/20 p-2" />
}
