import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../lib/api'
import { solvePow } from '../lib/pow'
import { useDispatch, useSelector } from 'react-redux'
import { pushToast, setAchievements } from '../store'
import { X, Upload, ImagePlus, Video, Mic } from 'lucide-react'
import { playTone } from '../lib/sound'

export default function CreatePost({ open, onClose, onCreated }) {
  const [text, setText] = useState('')
  const [images, setImages] = useState([])
  const [video, setVideo] = useState(null)
  const [audio, setAudio] = useState(null)
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const token = useSelector(s => s.auth.token)

  const clear = () => { setText(''); setImages([]); setVideo(null); setAudio(null) }

  const submit = async e => {
    e.preventDefault()
    setLoading(true)
    try {
      const pow = await api('/api/pow/challenge')
      const nonce = await solvePow(pow.challenge, pow.difficulty)
      const form = new FormData()
      form.append('text', text)
      form.append('powChallenge', pow.challenge)
      form.append('powNonce', nonce)
      images.forEach(f => form.append('images', f))
      if (video) form.append('video', video)
      if (audio) form.append('audio', audio)
      const data = await api('/api/posts', { method: 'POST', body: form, isForm: true, token })
      onCreated?.(data.post)
      dispatch(setAchievements(data.achievements || []))
      dispatch(pushToast({ title: 'Пост опубликован', message: 'Лента обновлена.' }))
      playTone('post')
      clear()
      onClose()
    } catch (err) {
      dispatch(pushToast({ title: 'Ошибка', message: err.message }))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-40 bg-black/70 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div
            className="mx-auto mt-10 w-full max-w-2xl rounded-[28px] border border-white/10 bg-zinc-950/90 p-5 shadow-glass dark:bg-white/10"
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black">Создать пост</h2>
              <button className="rounded-full border border-white/10 bg-white/10 p-2" onClick={onClose}><X size={18} /></button>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Что у тебя на уме?"
                className="min-h-40 w-full rounded-3xl border border-white/10 bg-black/20 p-4 outline-none ring-0 placeholder:opacity-50"
              />
              <div className="grid gap-3 md:grid-cols-3">
                <label className="glass-input">
                  <ImagePlus size={16} /> Фото до 10
                  <input type="file" accept="image/*" multiple className="hidden" onChange={e => setImages(Array.from(e.target.files || []).slice(0, 10))} />
                </label>
                <label className="glass-input">
                  <Video size={16} /> Видео 1 шт
                  <input type="file" accept="video/*" className="hidden" onChange={e => setVideo(e.target.files?.[0] || null)} />
                </label>
                <label className="glass-input">
                  <Mic size={16} /> Аудио 1 шт
                  <input type="file" accept="audio/*" className="hidden" onChange={e => setAudio(e.target.files?.[0] || null)} />
                </label>
              </div>
              {(images.length || video || audio) ? (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-sm opacity-85">
                  <div>Фото: {images.length}</div>
                  <div>Видео: {video?.name || 'нет'}</div>
                  <div>Аудио: {audio?.name || 'нет'}</div>
                </div>
              ) : null}
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs opacity-60">PoW подпись выполняется незаметно перед публикацией.</span>
                <button disabled={loading} className="rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-5 py-3 font-semibold text-black transition hover:scale-[1.02] disabled:opacity-50">
                  <Upload size={16} className="mr-2 inline-block" />
                  {loading ? 'Публикация…' : 'Опубликовать'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
