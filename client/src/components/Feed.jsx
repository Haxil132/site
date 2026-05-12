import { useEffect, useRef, useState } from 'react'
import PostCard from './PostCard'
import Skeleton from './Skeleton'
import { api } from '../lib/api'
import { useDispatch } from 'react-redux'
import { pushToast } from '../store'

export default function Feed({ refreshKey }) {
  const [posts, setPosts] = useState([])
  const [cursor, setCursor] = useState(null)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const sentinel = useRef(null)
  const dispatch = useDispatch()

  const load = async (reset = false) => {
    if (loading) return
    setLoading(true)
    try {
      const q = new URLSearchParams()
      q.set('limit', '8')
      if (!reset && cursor) q.set('cursor', String(cursor))
      const data = await api(`/api/posts?${q.toString()}`)
      setPosts(prev => reset ? data.posts : [...prev, ...data.posts])
      setCursor(data.nextCursor)
      setHasMore(data.hasMore)
    } catch (err) {
      dispatch(pushToast({ title: 'Лента', message: err.message }))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load(true) }, [refreshKey])

  useEffect(() => {
    const el = sentinel.current
    if (!el) return
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) load(false)
    }, { rootMargin: '800px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [hasMore, loading, cursor])

  const updatePost = updated => setPosts(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p))

  return (
    <div className="space-y-5">
      {posts.map(post => <PostCard key={post.id} post={post} onUpdate={updatePost} />)}
      {loading ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} />) : null}
      <div ref={sentinel} className="h-8" />
      {!hasMore && posts.length ? <div className="py-8 text-center text-sm opacity-65">Это конец ленты. Но не конец хаоса.</div> : null}
    </div>
  )
}
