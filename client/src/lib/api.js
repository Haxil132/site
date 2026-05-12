const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export async function api(path, { method = 'GET', body, headers = {}, token, isForm = false, credentials = 'include' } = {}) {
  const opts = {
    method,
    credentials,
    headers: { ...headers }
  }

  if (token) opts.headers.Authorization = `Bearer ${token}`
  if (body && !isForm) {
    opts.headers['Content-Type'] = 'application/json'
    opts.body = JSON.stringify(body)
  } else if (body && isForm) {
    opts.body = body
  }

  const res = await fetch(`${API_URL}${path}`, opts)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export function assetUrl(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${API_URL}${url}`
}
