import { Home, PlusCircle, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function BottomNav({ onCreate, user }) {
  return (
    <nav className="fixed bottom-3 left-1/2 z-30 flex w-[min(94vw,460px)] -translate-x-1/2 items-center justify-between rounded-full border border-white/10 bg-zinc-950/70 px-3 py-2 backdrop-blur-xl md:hidden">
      <Link to="/" className="grid h-12 w-12 place-items-center rounded-full bg-white/10"><Home size={18} /></Link>
      <button onClick={onCreate} className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-black"><PlusCircle size={22} /></button>
      <Link to={user ? `/u/${user.username}` : '/'} className="grid h-12 w-12 place-items-center rounded-full bg-white/10"><UserRound size={18} /></Link>
    </nav>
  )
}
