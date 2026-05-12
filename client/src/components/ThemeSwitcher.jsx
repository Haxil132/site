
import { useDispatch, useSelector } from 'react-redux'
import { Moon, Sun } from 'lucide-react'
import { toggleTheme } from '../store'
import { motion } from 'framer-motion'

export default function ThemeSwitcher() {
  const mode = useSelector(s => s.theme.mode)
  const dispatch = useDispatch()
  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      className="rounded-full border border-white/10 bg-white/10 px-3 py-2 text-sm backdrop-blur-xl transition hover:scale-105 dark:bg-white/5"
    >
      <motion.div
        key={mode}
        initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        exit={{ opacity: 0 }}
        className="flex items-center gap-2"
      >
        {mode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        <span>{mode === 'dark' ? 'Светлая' : 'Тёмная'}</span>
      </motion.div>
    </button>
  )
}
