
import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { pushToast } from '../store'
import { playTone } from '../lib/sound'

export default function AchievementWatcher() {
  const achievements = useSelector(s => s.auth.achievements)
  const prevIds = useRef(new Set())
  const dispatch = useDispatch()

  useEffect(() => {
    const current = new Set((achievements || []).map(a => a.id))
    const newly = (achievements || []).filter(a => !prevIds.current.has(a.id))
    if (newly.length) {
      newly.forEach(a => {
        dispatch(pushToast({ title: `Ачивка получена: ${a.title}`, message: a.description }))
        playTone('achievement')
      })
    }
    prevIds.current = current
  }, [achievements])

  return null
}
