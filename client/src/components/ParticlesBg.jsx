import { useEffect, useRef } from 'react'

export default function ParticlesBg() {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    let raf = 0
    const particles = Array.from({ length: 42 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00035,
      vy: (Math.random() - 0.5) * 0.00035,
      r: 1 + Math.random() * 2.6
    }))
    const resize = () => { canvas.width = window.innerWidth * devicePixelRatio; canvas.height = window.innerHeight * devicePixelRatio }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > 1) p.vx *= -1
        if (p.y < 0 || p.y > 1) p.vy *= -1
        const x = p.x * canvas.width
        const y = p.y * canvas.height
        ctx.beginPath()
        ctx.arc(x, y, p.r * devicePixelRatio, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255,255,255,.22)'
        ctx.fill()
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j]
          const dx = (p.x - q.x) * canvas.width
          const dy = (p.y - q.y) * canvas.height
          const d = Math.sqrt(dx*dx + dy*dy)
          if (d < 180) {
            ctx.strokeStyle = `rgba(255,255,255,${0.07 * (1 - d/180)})`
            ctx.beginPath()
            ctx.moveTo(x, y)
            ctx.lineTo(q.x * canvas.width, q.y * canvas.height)
            ctx.stroke()
          }
        }
      })
      raf = requestAnimationFrame(draw)
    }
    resize()
    window.addEventListener('resize', resize)
    raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 -z-10 h-full w-full opacity-70" />
}
