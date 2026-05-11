import type {
  ActedMovie,
  Actor,
  ActorCreatePayload,
  ActorMovieAssignmentPayload,
} from '../types/actor'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

export async function fetchActors(filters?: { age?: string; country?: string }): Promise<Actor[]> {
  const params = new URLSearchParams()

  if (filters?.age) {
    params.set('age', filters.age)
  }

  const country = filters?.country?.trim()

  if (country) {
    params.set('country', country)
  }

  const query = params.toString()
  const response = await fetch(`${API_URL}/actors${query ? `?${query}` : ''}`)

  if (!response.ok) {
    throw new Error('Nie udalo sie pobrac aktorow.')
  }

  return (await response.json()) as Actor[]
}

export async function createActor(payload: ActorCreatePayload): Promise<Actor> {
  const response = await fetch(`${API_URL}/actors`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Nie udalo sie dodac aktora.')
  }

  return (await response.json()) as Actor
}

export async function assignActorToMovie(payload: ActorMovieAssignmentPayload): Promise<void> {
  const response = await fetch(`${API_URL}/actors/assign-movie`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Nie udalo sie przypisac aktora do filmu.')
  }
}

export async function fetchActorMovies(actorId: string): Promise<ActedMovie[]> {
  const response = await fetch(`${API_URL}/actors/${actorId}/movies`)

  if (!response.ok) {
    throw new Error('Nie udalo sie pobrac filmow aktora.')
  }

  return (await response.json()) as ActedMovie[]
}
