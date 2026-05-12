import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import ReactPlayer from 'react-player'
import { api, assetUrl } from '../lib/api'
import { useDispatch, useSelector } from 'react-redux'
import { pushToast } from '../store'
import { playTone } from '../lib/sound'
import { Heart, ThumbsDown, MessageCircle, Flag, Send, X } from 'lucide-react'
import AudioWave from './AudioWave'
import ImageLightbox from './ImageLightbox'

export default function PostCard({ post, onUpdate }) {
  const [comment, setComment] = useState('')
  const [openComments, setOpenComments] = useState(false)
  const [lightbox, setLightbox] = useState('')
  const [busy, setBusy] = useState(false)
  const [localComments, setLocalComments] = useState(post.comments || [])
  const ref = useRef(null)
  const token = useSelector(s => s.auth.token)
  const user = useSelector(s => s.auth.user)
  const dispatch = useDispatch()

  useEffect(() => setLocalComments(post.comments || []), [post.comments])

  const title = post.author ? post.author.username : 'Аноним'
  const avatar = post.author?.avatarUrl ? assetUrl(post.author.avatarUrl) : null
  const media = post.media || []

  const submitReact = async reaction => {
    setBusy(true)
    try {
      const data = await api(`/api/posts/${post.id}/react`, { method: 'POST', body: { reaction }, token })
      onUpdate?.(data.post)
      playTone('like')
    } catch (err) {
      dispatch(pushToast({ title: 'Ошибка', message: err.message }))
    } finally {
      setBusy(false)
    }
  }

  const submitComment = async e => {
    e.preventDefault()
    if (!comment.trim()) return
    setBusy(true)
    try {
      const data = await api(`/api/posts/${post.id}/comment`, { method: 'POST', body: { text: comment }, token })
      setLocalComments(prev => [...prev, data.comment])
      setComment('')
      onUpdate?.({ ...post, commentsCount: (post.commentsCount || 0) + 1 })
      dispatch(pushToast({ title: 'Комментарий отправлен', message: 'Голос в ленте добавлен.' }))
    } catch (err) {
      dispatch(pushToast({ title: 'Ошибка', message: err.message }))
    } finally {
      setBusy(false)
    }
  }

  const report = async () => {
    try {
      await api(`/api/posts/${post.id}/report`, { method: 'POST', body: { reason: 'spam' }, token })
      dispatch(pushToast({ title: 'Жалоба отправлена', message: 'Спасибо за сигнал.' }))
    } catch (err) {
      dispatch(pushToast({ title: 'Ошибка', message: err.message }))
    }
  }

  const parallaxStyle = useMemo(() => ({ transform: 'translate3d(0,0,0)' }), [])
  const images = media.filter(m => m.type === 'image')
  const videos = media.filter(m => m.type === 'video')
  const audios = media.filter(m => m.type === 'audio')

  return (
    <>
      <motion.article
        ref={ref}
        whileHover={{ y: -4, scale: 1.005 }}
        className="glass-card group overflow-hidden"
      >
        <div className="flex items-start gap-3">
          <div className="mt-1 h-11 w-11 overflow-hidden rounded-2xl border border-white/10 bg-white/10">
            {avatar ? <img src={avatar} className="h-full w-full object-cover" /> : <div className="grid h-full w-full place-items-center font-black">{title.slice(0, 1).toUpperCase()}</div>}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="font-bold">{title}</div>
              <div className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs opacity-70">{new Date(post.createdAt).toLocaleString()}</div>
              {post.nightPost ? <div className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs text-indigo-200">ночной пост</div> : null}
            </div>
            {post.author ? <div className="text-xs opacity-60">Репутация: {post.author.reputation?.toFixed?.(1) ?? post.author.reputation}</div> : <div className="text-xs opacity-60">Пост анонима</div>}
          </div>
        </div>

        {post.text ? <div className="mt-4 whitespace-pre-wrap text-[15px] leading-7 opacity-95">{post.text}</div> : null}

        {images.length ? (
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {images.map((m, i) => (
              <button key={i} onClick={() => setLightbox(assetUrl(m.url))} className="overflow-hidden rounded-3xl border border-white/10">
                <img src={assetUrl(m.url)} className="h-72 w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
              </button>
            ))}
          </div>
        ) : null}

        {videos.map((m, i) => (
          <div key={i} className="mt-4 overflow-hidden rounded-3xl border border-white/10 bg-black/30">
            <ReactPlayer url={assetUrl(m.url)} controls width="100%" height="360px" />
          </div>
        ))}

        {audios.map((m, i) => (
          <div key={i} className="mt-4 space-y-2">
            <AudioWave url={assetUrl(m.url)} />
            <audio controls className="w-full" src={assetUrl(m.url)} />
          </div>
        ))}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button onClick={() => submitReact('like')} disabled={busy} className="post-action">
            <Heart size={16} /> {post.likesCount || 0}
          </button>
          <button onClick={() => submitReact('dislike')} disabled={busy} className="post-action">
            <ThumbsDown size={16} /> {post.dislikesCount || 0}
          </button>
          <button onClick={() => setOpenComments(v => !v)} className="post-action">
            <MessageCircle size={16} /> {post.commentsCount || 0}
          </button>
          <button onClick={report} className="post-action ml-auto">
            <Flag size={16} /> Жалоба
          </button>
        </div>

        {openComments ? (
          <div className="mt-4 rounded-3xl border border-white/10 bg-black/15 p-4">
            <div className="space-y-3">
              {localComments.map(c => (
                <div key={c.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="text-sm font-semibold">{c.author?.username || 'Аноним'}</div>
                  <div className="text-sm opacity-85">{c.text}</div>
                </div>
              ))}
            </div>
            <form onSubmit={submitComment} className="mt-4 flex gap-2">
              <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Комментарий…" className="glass-field flex-1" />
              <button className="rounded-2xl bg-white px-4 py-3 font-semibold text-black"><Send size={16} /></button>
            </form>
          </div>
        ) : null}
      </motion.article>
      <ImageLightbox src={lightbox} onClose={() => setLightbox('')} />
    </>
  )
}
