import { useEffect, useState } from 'react'
import { api } from '../lib/api'

export default function FooterStats() {
  const [stats, setStats] = useState({ anon: 0, users: 0, totalPosts: 0 })
  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const data = await api('/api/stats')
        if (active) setStats(data)
      } catch {}
    }
    load()
    const id = setInterval(load, 15000)
    return () => { active = false; clearInterval(id) }
  }, [])
  return (
    <footer className="mt-8 border-t border-white/10 py-5 text-sm opacity-80">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span>Сейчас онлайн: {stats.anon} анонимов, {stats.users} пользователей</span>
        <span>Всего постов: {stats.totalPosts}</span>
      </div>
    </footer>
  )
}
