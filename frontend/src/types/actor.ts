import type { Movie } from './movie'

export type Actor = {
  id: string
  name: string
  age: number
  country: string
}

export type ActorCreatePayload = {
  name: string
  age: number
  country: string
}

export type ActorForm = {
  name: string
  age: string
  country: string
}

export type ActorFilterForm = {
  age: string
  country: string
}

export type ActorMovieAssignmentPayload = {
  actor_id: string
  movie_id: string
  role_type: string
}

export type ActorMovieAssignmentForm = {
  actor_id: string
  movie_id: string
  role_type: string
}

export type ActedMovie = {
  movie: Movie
  role_type: string
}
