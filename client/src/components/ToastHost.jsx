import { useDispatch, useSelector } from 'react-redux'
import { AnimatePresence, motion } from 'framer-motion'
import { removeToast } from '../store'

export default function ToastHost() {
  const toasts = useSelector(s => s.toasts)
  const dispatch = useDispatch()
  return (
    <div className="fixed right-4 top-4 z-50 flex w-[320px] max-w-[calc(100vw-2rem)] flex-col gap-3">
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20 }}
            className="rounded-2xl border border-white/10 bg-zinc-950/85 p-4 text-white shadow-glass backdrop-blur-xl dark:bg-white/10"
            onClick={() => dispatch(removeToast(t.id))}
          >
            <div className="text-sm font-semibold">{t.title}</div>
            <div className="text-sm opacity-80">{t.message}</div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
