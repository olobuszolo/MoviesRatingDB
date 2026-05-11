import type {
  Director,
  DirectorCreatePayload,
  DirectorMovieAssignmentPayload,
  DirectedMovie,
} from '../types/director'

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

export async function assignDirectorToMovie(
  payload: DirectorMovieAssignmentPayload,
): Promise<void> {
  const response = await fetch(`${API_URL}/directors/assign-movie`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Nie udalo sie przypisac rezysera do filmu.')
  }
}

export async function fetchDirectorMovies(directorId: string): Promise<DirectedMovie[]> {
  const response = await fetch(`${API_URL}/directors/${directorId}/movies`)

  if (!response.ok) {
    throw new Error('Nie udalo sie pobrac filmow rezysera.')
  }

  return (await response.json()) as DirectedMovie[]
}
