async function sha256Hex(input) {
  const enc = new TextEncoder().encode(input)
  const hash = await crypto.subtle.digest('SHA-256', enc)
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export async function solvePow(challenge, difficulty = 3) {
  let nonce = 0
  const prefix = '0'.repeat(difficulty)
  while (true) {
    const hash = await sha256Hex(`${challenge}:${nonce}`)
    if (hash.startsWith(prefix)) return String(nonce)
    nonce += 1
    if (nonce % 250 === 0) await new Promise(r => setTimeout(r, 0))
  }
}
