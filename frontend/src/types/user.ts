export type User = {
  id: string
  username: string
  country: string
  age: number
}

export type UserCreatePayload = {
  username: string
  country: string
  age: number
}

export type UserForm = {
  username: string
  country: string
  age: string
}
