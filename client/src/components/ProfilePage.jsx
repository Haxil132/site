import { useEffect, useState } from 'react'
import { api, assetUrl } from '../lib/api'
import { useDispatch, useSelector } from 'react-redux'
import { pushToast, setAuth, setAchievements } from '../store'
import AchievementBadge from './AchievementBadge'
import { motion } from 'framer-motion'

export default function ProfilePage({ username }) {
  const [profile, setProfile] = useState(null)
  const dispatch = useDispatch()
  const auth = useSelector(s => s.auth)

  useEffect(() => {
    api(`/api/users/${username}`)
      .then(setProfile)
      .catch(err => dispatch(pushToast({ title: 'Профиль', message: err.message })))
  }, [username])

  const upload = async e => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const form = new FormData()
      form.append('avatar', file)
      const data = await api('/api/auth/avatar', { method: 'POST', body: form, isForm: true, token: auth.token })
      dispatch(setAuth({ user: data.user, achievements: data.achievements }))
      dispatch(setAchievements(data.achievements))
      setProfile(prev => prev ? { ...prev, user: data.user, achievements: data.achievements } : prev)
      dispatch(pushToast({ title: 'Аватар обновлён', message: 'Профиль стал ярче.' }))
    } catch (err) {
      dispatch(pushToast({ title: 'Ошибка', message: err.message }))
    }
  }

  if (!profile) return <div className="glass-card p-6">Загрузка профиля…</div>

  const user = profile.user
  return (
    <div className="space-y-6">
      <div className="glass-card grid gap-5 md:grid-cols-[auto,1fr]">
        <div className="relative">
          <div className="h-28 w-28 overflow-hidden rounded-[32px] border border-white/10 bg-white/10">
            {user.avatarUrl ? <img src={assetUrl(user.avatarUrl)} className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center text-3xl font-black">{user.username.slice(0,1).toUpperCase()}</div>}
          </div>
          {auth.user?.id === user.id ? (
            <label className="mt-3 inline-flex cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-white/10 px-4 py-2 text-sm">
              Сменить аватар
              <input type="file" accept="image/*" className="hidden" onChange={upload} />
            </label>
          ) : null}
        </div>

        <div className="space-y-3">
          <div>
            <h1 className="text-3xl font-black">{user.username}</h1>
            <p className="opacity-70">Уровень: {user.reputation >= 200 ? 'Бог' : user.reputation >= 50 ? 'Легенда' : user.reputation >= 10 ? 'Бывалый' : 'Новичок'}</p>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <Stat label="Репутация" value={user.reputation.toFixed(1)} />
            <Stat label="Посты" value={profile.stats.posts} />
            <Stat label="Комментариев" value={profile.stats.commentsReceived} />
            <Stat label="Ачивок" value={profile.stats.achievements} />
          </div>
          <ProgressBar rep={user.reputation} />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-xl font-black">Достижения</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {profile.achievements.map(a => <AchievementBadge key={a.id} achievement={a} unlocked />)}
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }) {
  return <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="text-xs opacity-65">{label}</div><div className="text-2xl font-black">{value}</div></div>
}

function ProgressBar({ rep }) {
  const level = rep >= 200 ? { name: 'Бог', from: 200, to: 200 } : rep >= 50 ? { name: 'Легенда', from: 50, to: 200 } : rep >= 10 ? { name: 'Бывалый', from: 10, to: 50 } : { name: 'Новичок', from: 0, to: 10 }
  const progress = level.to === level.from ? 1 : Math.max(0, Math.min(1, (rep - level.from) / (level.to - level.from)))
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-2 flex justify-between text-sm">
        <span>{level.name}</span>
        <span>{rep.toFixed(1)} репутации</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-black/25">
        <motion.div initial={{ width: 0 }} animate={{ width: `${progress * 100}%` }} className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400" />
      </div>
    </div>
  )
}
