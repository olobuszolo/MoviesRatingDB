import type { User, UserCreatePayload } from '../types/user'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

export async function fetchUsers(): Promise<User[]> {
  const response = await fetch(`${API_URL}/users`)

  if (!response.ok) {
    throw new Error('Nie udalo sie pobrac uzytkownikow.')
  }

  return (await response.json()) as User[]
}

export async function createUser(payload: UserCreatePayload): Promise<User> {
  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Nie udalo sie dodac uzytkownika.')
  }

  return (await response.json()) as User
}
