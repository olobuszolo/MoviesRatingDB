from pydantic import BaseModel, Field


class MovieCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    duration_minutes: int = Field(ge=1, le=500)


class Movie(MovieCreate):
    id: str


class UserCreate(BaseModel):
    username: str = Field(min_length=2, max_length=80)
    country: str = Field(min_length=2, max_length=80)
    age: int = Field(ge=0, le=120)


class User(UserCreate):
    id: str

class CategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)

class Category(CategoryCreate):
    id: str

class DirectorCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    country: str = Field(min_length=2, max_length=80)

class Director(DirectorCreate):
    id: str

class ActorCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    age: int = Field(ge=0, le=120)
    country: str = Field(min_length=2, max_length=80)


class Actor(ActorCreate):
    id: str


# class RatingCreate(BaseModel):
#     user_id: str
#     movie_id: str
#     score: int = Field(ge=1, le=10)
#     review: str | None = Field(default=None, max_length=1000)


# class Rating(BaseModel):
#     user: User
#     movie: Movie
#     score: int
#     review: str | None = None
