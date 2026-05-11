import type { Movie } from './movie'

export type Category = {
  id: string
  name: string
}

export type CategoryCreatePayload = {
  name: string
}

export type CategoryForm = {
  name: string
}

export type CategoryTopMovie = {
  movie: Movie
  average_score: number
  opinions_count: number
}
