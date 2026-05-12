
import { motion } from 'framer-motion'

function IconShell({ children }) {
  return (
    <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-black/20">
      {children}
    </div>
  )
}

function StarIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l2.9 5.9L21 10l-4.5 4.4L17.6 21 12 17.9 6.4 21l1.1-6.6L3 10l6.1-1.1L12 3z"/></svg>
}
function StackIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2 3 7l9 5 9-5-9-5z"/><path d="M3 12l9 5 9-5"/><path d="M3 17l9 5 9-5"/></svg>
}
function ChatIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 5h16v11H7l-3 3z"/></svg>
}
function HeartIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8z"/></svg>
}
function CameraIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h3l2-3h6l2 3h3v13H4z"/><circle cx="12" cy="13" r="4"/></svg>
}
function MoonIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>
}
function CrownIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7l4 4 4-7 4 7 4-4-1 11H5L4 7z"/></svg>
}
function FlameIcon() {
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2s2 2 2 5-2 4-2 6 1 3 3 3a6 6 0 1 1-12 0c0-4 3-7 9-14z"/></svg>
}

const icons = {
  spark: StarIcon,
  layers: StackIcon,
  'badge-plus': StarIcon,
  'message-square': ChatIcon,
  'messages-square': ChatIcon,
  'heart-handshake': HeartIcon,
  'image-plus': CameraIcon,
  'log-in': StarIcon,
  'calendar-heart': MoonIcon,
  film: CameraIcon,
  'audio-lines': CameraIcon,
  'moon-star': MoonIcon,
  'thumbs-up': HeartIcon,
  crown: CrownIcon,
  flame: FlameIcon,
  sparkles: StarIcon,
  speech: ChatIcon
}

export default function AchievementBadge({ achievement, unlocked }) {
  const Icon = icons[achievement.icon] || StarIcon
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      className={`rounded-2xl border p-4 transition ${unlocked ? 'border-fuchsia-400/35 bg-fuchsia-500/10' : 'border-white/10 bg-white/5 opacity-45 grayscale'}`}
    >
      <div className="flex items-start gap-3">
        <IconShell><Icon /></IconShell>
        <div className="min-w-0">
          <div className="font-semibold">{achievement.title}</div>
          <div className="text-sm opacity-75">{achievement.description}</div>
        </div>
      </div>
    </motion.div>
  )
}
