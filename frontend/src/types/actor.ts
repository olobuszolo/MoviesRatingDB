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
