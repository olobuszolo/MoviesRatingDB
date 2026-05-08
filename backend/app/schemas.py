from pydantic import BaseModel, Field


class CategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)


class Category(CategoryCreate):
    id: str


class MovieCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    duration_minutes: int = Field(ge=1, le=500)
    category_id: str


class Movie(BaseModel):
    id: str
    title: str
    duration_minutes: int
    category: "Category"


class UserCreate(BaseModel):
    username: str = Field(min_length=2, max_length=80)
    country: str = Field(min_length=2, max_length=80)
    age: int = Field(ge=0, le=120)


class User(UserCreate):
    id: str

class DirectorCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    country: str = Field(min_length=2, max_length=80)

class Director(DirectorCreate):
    id: str


class DirectorMovieAssignmentCreate(BaseModel):
    director_id: str
    movie_id: str
    release_year: int = Field(ge=1900, le=2100)


class DirectorMovieAssignment(BaseModel):
    director: Director
    movie: Movie
    release_year: int


class DirectedMovie(BaseModel):
    movie: Movie
    release_year: int


class ActorCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    age: int = Field(ge=0, le=120)
    country: str = Field(min_length=2, max_length=80)


class Actor(ActorCreate):
    id: str


class ActorMovieAssignmentCreate(BaseModel):
    actor_id: str
    movie_id: str
    role_type: str = Field(min_length=1, max_length=80)


class ActorMovieAssignment(BaseModel):
    actor: Actor
    movie: Movie
    role_type: str


class ActedMovie(BaseModel):
    movie: Movie
    role_type: str
