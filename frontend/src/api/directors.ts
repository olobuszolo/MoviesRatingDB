import type { Director, DirectorCreatePayload } from '../types/director'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

export async function fetchDirectors(): Promise<Director[]> {
  const response = await fetch(`${API_URL}/directors`)

  if (!response.ok) {
    throw new Error('Nie udalo sie pobrac rezyserow.')
  }

  return (await response.json()) as Director[]
}

export async function createDirector(payload: DirectorCreatePayload): Promise<Director> {
  const response = await fetch(`${API_URL}/directors`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Nie udalo sie dodac rezysera.')
  }

  return (await response.json()) as Director
}
