from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from neo4j import Session

from app.config import settings
from app.database import db, get_session
from app.repositories import (
    create_category,
    create_constraints,
    create_movie,
    create_user,
    list_categories,
    list_movies,
    list_users
)
from app.schemas import Category, CategoryCreate, Movie, MovieCreate, User, UserCreate


@asynccontextmanager
async def lifespan(app: FastAPI):
    db.connect()

    with db.session() as session:
        create_constraints(session)

    yield
    db.close()


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DbSession = Annotated[Session, Depends(get_session)]

@app.post("/movies", response_model=Movie, status_code=status.HTTP_201_CREATED)
def add_movie(payload: MovieCreate, session: DbSession) -> dict:
    return create_movie(session, payload)


@app.get("/movies", response_model=list[Movie])
def get_movies(session: DbSession) -> list[dict]:
    return list_movies(session)


@app.post("/users", response_model=User, status_code=status.HTTP_201_CREATED)
def add_user(payload: UserCreate, session: DbSession) -> dict:
    return create_user(session, payload)


@app.get("/users", response_model=list[User])
def get_users(session: DbSession) -> list[dict]:
    return list_users(session)


@app.post("/categories", response_model=Category, status_code=status.HTTP_201_CREATED)
def add_category(payload: CategoryCreate, session: DbSession) -> dict:
    return create_category(session, payload)


@app.get("/categories", response_model=list[Category])
def get_categories(session: DbSession) -> list[dict]:
    return list_categories(session)
