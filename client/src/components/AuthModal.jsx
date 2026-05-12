import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../lib/api'
import { solvePow } from '../lib/pow'
import { useDispatch } from 'react-redux'
import { setAuth, setAchievements, pushToast } from '../store'
import { X, LogIn, UserPlus } from 'lucide-react'
import { playTone } from '../lib/sound'

export default function AuthModal({ open, onClose }) {
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const pow = await api('/api/pow/challenge')
      const nonce = await solvePow(pow.challenge, pow.difficulty)
      const payload = { username, password, powChallenge: pow.challenge, powNonce: nonce }
      const data = await api(`/api/auth/${mode}`, { method: 'POST', body: payload })
      dispatch(setAuth({ token: data.token, user: data.user, achievements: data.achievements }))
      dispatch(setAchievements(data.achievements))
      dispatch(pushToast({ title: mode === 'login' ? 'Вход выполнен' : 'Аккаунт создан', message: `Привет, ${data.user.username}` }))
      playTone('achievement')
      onClose()
    } catch (err) {
      dispatch(pushToast({ title: 'Ошибка авторизации', message: err.message }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-40 grid place-items-center bg-black/70 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div className="w-full max-w-md rounded-[28px] border border-white/10 bg-zinc-950/90 p-5 shadow-glass dark:bg-white/10" initial={{ y: 30, scale: 0.98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, opacity: 0 }} onClick={e => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <div className="text-xl font-black">{mode === 'login' ? 'Вход' : 'Регистрация'}</div>
              <button className="rounded-full border border-white/10 bg-white/10 p-2" onClick={onClose}><X size={18} /></button>
            </div>
            <div className="mb-4 grid grid-cols-2 gap-2">
              <button onClick={() => setMode('login')} className={`rounded-2xl px-4 py-3 text-sm font-semibold ${mode === 'login' ? 'bg-white text-black' : 'bg-white/5'}`}><LogIn size={16} className="mr-1 inline-block" /> Войти</button>
              <button onClick={() => setMode('register')} className={`rounded-2xl px-4 py-3 text-sm font-semibold ${mode === 'register' ? 'bg-white text-black' : 'bg-white/5'}`}><UserPlus size={16} className="mr-1 inline-block" /> Регистрация</button>
            </div>
            <form onSubmit={submit} className="space-y-3">
              <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Логин" className="glass-field" />
              <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Пароль" type="password" className="glass-field" />
              <button disabled={loading} className="w-full rounded-2xl bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-4 py-3 font-semibold text-black disabled:opacity-50">
                {loading ? 'Подождите…' : mode === 'login' ? 'Войти' : 'Создать аккаунт'}
              </button>
              <p className="text-xs opacity-60">Логин от 3 символов, пароль от 4. Без email и подтверждений.</p>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
