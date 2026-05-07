import type { Category, CategoryCreatePayload } from '../types/category'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'

export async function fetchCategories(): Promise<Category[]> {
  const response = await fetch(`${API_URL}/categories`)

  if (!response.ok) {
    throw new Error('Nie udalo sie pobrac kategorii.')
  }

  return (await response.json()) as Category[]
}

export async function createCategory(payload: CategoryCreatePayload): Promise<Category> {
  const response = await fetch(`${API_URL}/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Nie udalo sie dodac kategorii.')
  }

  return (await response.json()) as Category
}
