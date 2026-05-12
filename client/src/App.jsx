import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { api } from './lib/api'
import { setAuth, setAchievements, pushToast } from './store'
import Navbar from './components/Navbar'
import FooterStats from './components/FooterStats'
import ParticlesBg from './components/ParticlesBg'
import ToastHost from './components/ToastHost'
import CreatePost from './components/CreatePost'
import AuthModal from './components/AuthModal'
import Feed from './components/Feed'
import ProfilePage from './components/ProfilePage'
import BottomNav from './components/BottomNav'
import AchievementWatcher from './components/AchievementWatcher'
import { motion } from 'framer-motion'
import { Flame, Shield } from 'lucide-react'

function HomePage({ onCreate, onAuthOpen, refreshKey, setRefreshKey }) {
  return (
    <div className="space-y-6">
      <section className="hero-card">
        <div className="max-w-3xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.25em]">
            <Shield size={14} /> Anonymous first
          </div>
          <h1 className="text-4xl font-black leading-tight md:text-6xl">
            Лента, где анонимность не убивает
            <span className="block bg-gradient-to-r from-fuchsia-400 via-cyan-300 to-lime-300 bg-clip-text text-transparent">характер, репутацию и игру.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 opacity-78 md:text-lg">
            Посты без регистрации, реакций и комментариев, репутация, ачивки и мягкая PoW-защита от мусора.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={onCreate} className="rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-5 py-3 font-semibold text-black">Создать пост</button>
            <button onClick={onAuthOpen} className="rounded-full border border-white/10 bg-white/10 px-5 py-3 font-semibold">Войти / Регистрация</button>
          </div>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <MiniCard title="Репутация" text="За лайки, комментарии и активность." />
          <MiniCard title="Ачивки" text="15+ игровых достижений с иконками." />
          <MiniCard title="Анонимность" text="Можно писать вообще без аккаунта." />
        </div>
      </section>

      <Feed refreshKey={refreshKey} />
    </div>
  )
}

function MiniCard({ title, text }) {
  return <div className="glass-card p-5"><div className="text-lg font-bold">{title}</div><div className="mt-1 text-sm opacity-75">{text}</div></div>
}

function ProfileRoute() {
  const { username } = useParams()
  return <ProfilePage username={username} />
}

export default function App() {
  const [createOpen, setCreateOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const dispatch = useDispatch()
  const auth = useSelector(s => s.auth)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    api('/api/auth/me', { token }).then(data => {
      dispatch(setAuth({ token, user: data.user, achievements: data.achievements }))
      dispatch(setAchievements(data.achievements))
    }).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen text-white dark:text-white">
      <ParticlesBg />
      <Navbar onCreate={() => setCreateOpen(true)} onAuthOpen={() => setAuthOpen(true)} />
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-6">
        <Routes>
          <Route path="/" element={<HomePage onCreate={() => setCreateOpen(true)} onAuthOpen={() => setAuthOpen(true)} refreshKey={refreshKey} setRefreshKey={setRefreshKey} />} />
          <Route path="/u/:username" element={<ProfileRoute />} />
        </Routes>
        <FooterStats />
      </main>

      <CreatePost open={createOpen} onClose={() => setCreateOpen(false)} onCreated={() => setRefreshKey(v => v + 1)} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <BottomNav onCreate={() => setCreateOpen(true)} user={auth.user} />
      <ToastHost />
      <AchievementWatcher />

      <button
        className="fixed bottom-6 right-6 z-20 hidden h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-black shadow-2xl shadow-fuchsia-500/30 md:grid"
        onClick={() => setCreateOpen(true)}
      >
        <Flame size={24} />
      </button>
    </div>
  )
}
