import type { Movie, MovieCreatePayload } from '../types/movie'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

export async function fetchMovies(): Promise<Movie[]> {
  const response = await fetch(`${API_URL}/movies`)

  if (!response.ok) {
    throw new Error('Nie udalo sie pobrac filmow.')
  }

  return (await response.json()) as Movie[]
}

export async function createMovie(payload: MovieCreatePayload): Promise<Movie> {
  const response = await fetch(`${API_URL}/movies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Nie udalo sie dodac filmu.')
  }

  return (await response.json()) as Movie
}
