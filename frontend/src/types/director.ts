import type { Movie } from './movie'

export type Director = {
  id: string
  name: string
  country: string
}

export type DirectorCreatePayload = {
  name: string
  country: string
}

export type DirectorForm = {
  name: string
  country: string
}

export type DirectorMovieAssignmentPayload = {
  director_id: string
  movie_id: string
  release_year: number
}

export type DirectorMovieAssignmentForm = {
  director_id: string
  movie_id: string
  release_year: string
}

export type DirectedMovie = {
  movie: Movie
  release_year: number
}
