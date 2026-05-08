import type { MovieOpinion, OpinionCreatePayload } from '../types/opinion'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

export async function createOpinion(payload: OpinionCreatePayload): Promise<void> {
  const response = await fetch(`${API_URL}/opinions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Nie udalo sie dodac opinii.')
  }
}

export async function fetchMovieOpinions(movieId: string): Promise<MovieOpinion[]> {
  const response = await fetch(`${API_URL}/movies/${movieId}/opinions`)

  if (!response.ok) {
    throw new Error('Nie udalo sie pobrac opinii filmu.')
  }

  return (await response.json()) as MovieOpinion[]
}
