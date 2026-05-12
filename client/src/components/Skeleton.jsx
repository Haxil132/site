export default function Skeleton() {
  return (
    <div className="glass-card animate-pulse overflow-hidden p-4">
      <div className="mb-4 h-6 w-44 rounded bg-white/10" />
      <div className="mb-3 h-4 w-full rounded bg-white/10" />
      <div className="mb-3 h-4 w-4/5 rounded bg-white/10" />
      <div className="h-64 rounded-3xl bg-white/10" />
      <div className="mt-4 flex gap-3">
        <div className="h-10 w-24 rounded-full bg-white/10" />
        <div className="h-10 w-24 rounded-full bg-white/10" />
      </div>
    </div>
  )
}
