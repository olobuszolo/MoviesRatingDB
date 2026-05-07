import type { Category } from './category'

export type Movie = {
  id: string
  title: string
  duration_minutes: number
  category: Category
}

export type MovieCreatePayload = {
  title: string
  duration_minutes: number
  category_id: string
}

export type MovieForm = {
  title: string
  duration_minutes: string
  category_id: string
}
