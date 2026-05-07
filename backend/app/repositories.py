from uuid import uuid4

from neo4j import Session

from app.schemas import CategoryCreate, MovieCreate, UserCreate


def create_constraints(session: Session) -> None:
    session.run("CREATE CONSTRAINT movie_id_unique IF NOT EXISTS FOR (m:Movie) REQUIRE m.id IS UNIQUE")
    session.run("CREATE CONSTRAINT user_id_unique IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE")
    session.run("CREATE CONSTRAINT username_unique IF NOT EXISTS FOR (u:User) REQUIRE u.username IS UNIQUE")
    session.run("CREATE CONSTRAINT category_id_unique IF NOT EXISTS FOR (c:Category) REQUIRE c.id IS UNIQUE")
    session.run("CREATE CONSTRAINT category_name_unique IF NOT EXISTS FOR (c:Category) REQUIRE c.name IS UNIQUE")


def create_movie(session: Session, payload: MovieCreate) -> dict:
    movie_id = str(uuid4())
    result = session.run(
        """
        CREATE (m:Movie {
            id: $id,
            title: $title,
            duration_minutes: $duration_minutes
        })
        RETURN m
        """,
        id=movie_id,
        title=payload.title,
        duration_minutes=payload.duration_minutes,
    )
    return dict(result.single()["m"])


def list_movies(session: Session) -> list[dict]:
    result = session.run(
        """
        MATCH (m:Movie)
        RETURN m
        ORDER BY m.title
        """
    )
    return [dict(record["m"]) for record in result]


def create_user(session: Session, payload: UserCreate) -> dict:
    user_id = str(uuid4())
    result = session.run(
        """
        CREATE (u:User {
            id: $id,
            username: $username,
            country: $country,
            age: $age
        })
        RETURN u
        """,
        id=user_id,
        username=payload.username,
        country=payload.country,
        age=payload.age,
    )
    return dict(result.single()["u"])


def list_users(session: Session) -> list[dict]:
    result = session.run(
        """
        MATCH (u:User)
        RETURN u
        ORDER BY u.username
        """
    )
    return [dict(record["u"]) for record in result]

def create_category(session: Session, payload: CategoryCreate) -> dict:
    category_id = str(uuid4())
    result = session.run(
        """
        CREATE (c:Category {
            id: $id,
            name: $name
        })
        RETURN c
        """,
        id=category_id,
        name=payload.name,
    )
    return dict(result.single()["c"])

def list_categories(session: Session) -> list[dict]:
    result = session.run(
        """
        MATCH (c:Category)
        RETURN c
        ORDER BY c.name
        """
    )
    return [dict(record["c"]) for record in result]


# def create_rating(session: Session, payload: RatingCreate) -> dict | None:
#     result = session.run(
#         """
#         MATCH (u:User {id: $user_id})
#         MATCH (m:Movie {id: $movie_id})
#         MERGE (u)-[r:RATED]->(m)
#         SET r.score = $score,
#             r.review = $review
#         RETURN u, m, r
#         """,
#         user_id=payload.user_id,
#         movie_id=payload.movie_id,
#         score=payload.score,
#         review=payload.review,
#     )
#     record = result.single()

#     if record is None:
#         return None

#     return {
#         "user": dict(record["u"]),
#         "movie": dict(record["m"]),
#         "score": record["r"]["score"],
#         "review": record["r"].get("review"),
#     }


# def list_user_ratings(session: Session, user_id: str) -> list[dict]:
#     result = session.run(
#         """
#         MATCH (u:User {id: $user_id})-[r:RATED]->(m:Movie)
#         RETURN u, m, r
#         ORDER BY m.title
#         """,
#         user_id=user_id,
#     )
#     return [
#         {
#             "user": dict(record["u"]),
#             "movie": dict(record["m"]),
#             "score": record["r"]["score"],
#             "review": record["r"].get("review"),
#         }
#         for record in result
#     ]
