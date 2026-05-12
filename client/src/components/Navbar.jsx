import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, LogOut, Plus, UserRound } from 'lucide-react'
import ThemeSwitcher from './ThemeSwitcher'
import { logout, toggleSound, pushToast } from '../store'

export default function Navbar({ onCreate, onAuthOpen }) {
  const { user, soundEnabled } = useSelector(s => s.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-zinc-950/40 backdrop-blur-xl dark:bg-black/35">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-500 via-indigo-500 to-cyan-400 text-white shadow-xl shadow-fuchsia-500/20">
            <Heart size={18} />
          </div>
          <div>
            <div className="text-lg font-black tracking-tight">Анонимная Медиа-Лента</div>
            <div className="text-xs opacity-65">Без регистрации. С репутацией. С характером.</div>
          </div>
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeSwitcher />
          <button onClick={() => dispatch(toggleSound())} className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-sm">
            {soundEnabled ? 'Звук: вкл' : 'Звук: выкл'}
          </button>
          {user ? (
            <>
              <button onClick={() => navigate(`/u/${user.username}`)} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-sm">
                <UserRound size={16} />
                {user.username}
              </button>
              <button onClick={() => { dispatch(logout()); dispatch(pushToast({ title: 'Выйдено', message: 'Сессия завершена.' })) }} className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-sm">
                <LogOut size={16} className="inline-block" /> Выйти
              </button>
            </>
          ) : (
            <button onClick={onAuthOpen} className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-sm">
              Войти / Регистрация
            </button>
          )}
          <button onClick={onCreate} className="rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-black shadow-lg shadow-fuchsia-500/25">
            <Plus size={16} className="mr-1 inline-block" /> Пост
          </button>
        </div>
      </div>
    </header>
  )
}
