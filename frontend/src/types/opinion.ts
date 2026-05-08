export type OpinionCreatePayload = {
  user_id: string
  movie_id: string
  score: number
  platform: string
}

export type OpinionForm = {
  user_id: string
  movie_id: string
  score: string
  platform: string
}

export type MovieOpinion = {
  username: string
  score: number
  platform: string
}
