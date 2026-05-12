import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

export default function ImageLightbox({ src, onClose }) {
  return (
    <AnimatePresence>
      {src ? (
        <motion.div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div className="relative max-h-[90vh] max-w-[92vw]" initial={{ scale: 0.94 }} animate={{ scale: 1 }} exit={{ scale: 0.94 }} onClick={e => e.stopPropagation()}>
            <button className="absolute -right-3 -top-3 rounded-full bg-white p-2 text-black shadow-xl" onClick={onClose}><X size={18} /></button>
            <img src={src} className="max-h-[90vh] rounded-3xl object-contain" />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
