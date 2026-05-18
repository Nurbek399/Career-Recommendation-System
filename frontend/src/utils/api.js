function getBaseUrl() {
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL
  }

  if (
    typeof window !== 'undefined' &&
    ['localhost', '127.0.0.1'].includes(window.location.hostname) &&
    window.location.port === '3000'
  ) {
    return 'http://localhost:8000'
  }

  return ''
}

const BASE = getBaseUrl()

export async function getRecommendation(profile) {
  const res = await fetch(`${BASE}/recommend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export async function sendChat(sessionId, history, message) {
  const res = await fetch(`${BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      session_id: sessionId,
      message,
      history: history.map(m => ({ role: m.role, content: m.content })),
    }),
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export async function sendChatStream(payload, signal) {
  const res = await fetch(`${BASE}/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `API error: ${res.status}`);
  }

  return res;
}

export async function parseResume(file) {
  const res = await fetch(`${BASE}/parse-resume`, {
    method: 'POST',
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
      'X-Filename': encodeURIComponent(file.name || 'resume'),
    },
    body: await file.arrayBuffer(),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `API error: ${res.status}`)
  }
  return res.json()
}
