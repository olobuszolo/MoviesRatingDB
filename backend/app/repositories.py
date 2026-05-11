from uuid import uuid4

from neo4j import Session

from app.schemas import (
    ActorCreate,
    ActorMovieAssignmentCreate,
    CategoryCreate,
    DirectorCreate,
    DirectorMovieAssignmentCreate,
    MovieCreate,
    OpinionCreate,
    UserCreate,
)


def create_constraints(session: Session) -> None:
    session.run("CREATE CONSTRAINT movie_id_unique IF NOT EXISTS FOR (m:Movie) REQUIRE m.id IS UNIQUE")
    session.run("CREATE CONSTRAINT movie_title_unique IF NOT EXISTS FOR (m:Movie) REQUIRE m.title IS UNIQUE")
    session.run("CREATE CONSTRAINT user_id_unique IF NOT EXISTS FOR (u:User) REQUIRE u.id IS UNIQUE")
    session.run("CREATE CONSTRAINT username_unique IF NOT EXISTS FOR (u:User) REQUIRE u.username IS UNIQUE")
    session.run("CREATE CONSTRAINT category_id_unique IF NOT EXISTS FOR (c:Category) REQUIRE c.id IS UNIQUE")
    session.run("CREATE CONSTRAINT category_name_unique IF NOT EXISTS FOR (c:Category) REQUIRE c.name IS UNIQUE")
    session.run("CREATE CONSTRAINT director_id_unique IF NOT EXISTS FOR (d:Director) REQUIRE d.id IS UNIQUE")
    session.run("CREATE CONSTRAINT director_name_unique IF NOT EXISTS FOR (d:Director) REQUIRE d.name IS UNIQUE")
    session.run("CREATE CONSTRAINT actor_id_unique IF NOT EXISTS FOR (a:Actor) REQUIRE a.id IS UNIQUE")
    session.run("CREATE CONSTRAINT actor_name_unique IF NOT EXISTS FOR (a:Actor) REQUIRE a.name IS UNIQUE")


def create_movie(session: Session, payload: MovieCreate) -> dict | None:
    movie_id = str(uuid4())
    result = session.run(
        """
        MATCH (c:Category {id: $category_id})
        CREATE (m:Movie {
            id: $id,
            title: $title,
            duration_minutes: $duration_minutes
        })
        CREATE (m)-[:BELONGS_TO]->(c)
        RETURN m, c
        """,
        id=movie_id,
        title=payload.title,
        duration_minutes=payload.duration_minutes,
        category_id=payload.category_id,
    )
    record = result.single()

    if record is None:
        return None

    return {
        **dict(record["m"]),
        "category": dict(record["c"]),
    }


def list_movies(session: Session) -> list[dict]:
    result = session.run(
        """
        MATCH (m:Movie)-[:BELONGS_TO]->(c:Category)
        RETURN m, c
        ORDER BY m.title
        """
    )
    return [
        {
            **dict(record["m"]),
            "category": dict(record["c"]),
        }
        for record in result
    ]


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


def create_opinion(session: Session, payload: OpinionCreate) -> dict | None:
    result = session.run(
        """
        MATCH (u:User {id: $user_id})
        MATCH (m:Movie {id: $movie_id})-[:BELONGS_TO]->(c:Category)
        MERGE (u)-[r:WATCHED]->(m)
        SET r.score = $score,
            r.platform = $platform
        RETURN u, m, c, r
        """,
        user_id=payload.user_id,
        movie_id=payload.movie_id,
        score=payload.score,
        platform=payload.platform,
    )
    record = result.single()

    if record is None:
        return None

    return {
        "user": dict(record["u"]),
        "movie": {
            **dict(record["m"]),
            "category": dict(record["c"]),
        },
        "score": record["r"]["score"],
        "platform": record["r"]["platform"],
    }


def list_movie_opinions(session: Session, movie_id: str) -> list[dict] | None:
    movie_exists = session.run(
        """
        MATCH (m:Movie {id: $movie_id})
        RETURN m
        """,
        movie_id=movie_id,
    ).single()

    if movie_exists is None:
        return None

    result = session.run(
        """
        MATCH (u:User)-[r:WATCHED]->(m:Movie {id: $movie_id})
        RETURN u.username AS username,
               r.score AS score,
               r.platform AS platform
        ORDER BY r.score DESC, u.username
        """,
        movie_id=movie_id,
    )

    return [
        {
            "username": record["username"],
            "score": record["score"],
            "platform": record["platform"],
        }
        for record in result
    ]


def recommend_movies_for_movie(session: Session, movie_id: str) -> list[dict] | None:
    movie_exists = session.run(
        """
        MATCH (m:Movie {id: $movie_id})
        RETURN m
        """,
        movie_id=movie_id,
    ).single()

    if movie_exists is None:
        return None

    top_users = session.run(
        """
        MATCH (u:User)-[r:WATCHED]->(:Movie {id: $movie_id})
        WITH u, max(r.score) AS best_score
        RETURN u.id AS user_id,
               u.username AS username,
               best_score AS source_score
        ORDER BY best_score DESC, u.username
        LIMIT 5
        """,
        movie_id=movie_id,
    )

    recommendations: list[dict] = []
    used_movie_ids = {movie_id}

    for user in top_users:
        candidates = session.run(
            """
            MATCH (:User {id: $user_id})-[r:WATCHED]->(m:Movie)-[:BELONGS_TO]->(c:Category)
            WHERE m.id <> $source_movie_id
            RETURN m, c, r
            ORDER BY r.score DESC, m.title
            """,
            user_id=user["user_id"],
            source_movie_id=movie_id,
        )

        for candidate in candidates:
            candidate_movie = dict(candidate["m"])

            if candidate_movie["id"] in used_movie_ids:
                continue

            used_movie_ids.add(candidate_movie["id"])
            recommendations.append(
                {
                    "movie": {
                        **candidate_movie,
                        "category": dict(candidate["c"]),
                    },
                    "recommended_by": user["username"],
                    "user_score": candidate["r"]["score"],
                    "platform": candidate["r"]["platform"],
                }
            )
            break

    return recommendations

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


def list_top_movies_by_category(session: Session, category_id: str) -> list[dict] | None:
    category_exists = session.run(
        """
        MATCH (c:Category {id: $category_id})
        RETURN c
        """,
        category_id=category_id,
    ).single()

    if category_exists is None:
        return None

    result = session.run(
        """
        MATCH (m:Movie)-[:BELONGS_TO]->(c:Category {id: $category_id})
        MATCH (:User)-[r:WATCHED]->(m)
        WITH m, c, avg(r.score) AS average_score, count(r) AS opinions_count
        RETURN m, c, average_score, opinions_count
        ORDER BY average_score DESC, opinions_count DESC, m.title
        LIMIT 5
        """,
        category_id=category_id,
    )

    return [
        {
            "movie": {
                **dict(record["m"]),
                "category": dict(record["c"]),
            },
            "average_score": round(record["average_score"], 2),
            "opinions_count": record["opinions_count"],
        }
        for record in result
    ]

def create_director(session: Session, payload: DirectorCreate) -> dict:
    director_id = str(uuid4())
    result = session.run(
        """
        CREATE (d:Director {
            id: $id,
            name: $name,
            country: $country
        })
        RETURN d
        """,
        id=director_id,
        name=payload.name,
        country=payload.country,
    )
    return dict(result.single()["d"])

def list_directors(session: Session) -> list[dict]:
    result = session.run(
        """
        MATCH (d:Director)
        RETURN d
        ORDER BY d.name
        """
    )
    return [dict(record["d"]) for record in result]

def assign_director_to_movie(
    session: Session,
    payload: DirectorMovieAssignmentCreate,
) -> dict | None:
    result = session.run(
        """
        MATCH (d:Director {id: $director_id})
        MATCH (m:Movie {id: $movie_id})-[:BELONGS_TO]->(c:Category)
        MERGE (d)-[r:DIRECTED]->(m)
        SET r.release_year = $release_year
        RETURN d, m, c, r
        """,
        director_id=payload.director_id,
        movie_id=payload.movie_id,
        release_year=payload.release_year,
    )
    record = result.single()

    if record is None:
        return None

    return {
        "director": dict(record["d"]),
        "movie": {
            **dict(record["m"]),
            "category": dict(record["c"]),
        },
        "release_year": record["r"]["release_year"],
    }


def list_director_movies(session: Session, director_id: str) -> list[dict] | None:
    director_exists = session.run(
        """
        MATCH (d:Director {id: $director_id})
        RETURN d
        """,
        director_id=director_id,
    ).single()

    if director_exists is None:
        return None

    result = session.run(
        """
        MATCH (d:Director {id: $director_id})-[r:DIRECTED]->(m:Movie)-[:BELONGS_TO]->(c:Category)
        RETURN m, c, r
        ORDER BY r.release_year, m.title
        """,
        director_id=director_id,
    )

    return [
        {
            "movie": {
                **dict(record["m"]),
                "category": dict(record["c"]),
            },
            "release_year": record["r"]["release_year"],
        }
        for record in result
    ]

def create_actor(session: Session, payload: ActorCreate) -> dict:
    actor_id = str(uuid4())
    result = session.run(
        """
        CREATE (a:Actor {
            id: $id,
            name: $name,
            age: $age,
            country: $country
        })
        RETURN a
        """,
        id=actor_id,
        name=payload.name,
        age=payload.age,
        country=payload.country,
    )
    return dict(result.single()["a"])

def list_actors(session: Session, age: int | None = None, country: str | None = None) -> list[dict]:
    result = session.run(
        """
        MATCH (a:Actor)
        WHERE ($age IS NULL OR a.age = $age)
          AND ($country IS NULL OR toLower(a.country) = toLower($country))
        RETURN a
        ORDER BY a.name
        """,
        age=age,
        country=country,
    )
    return [dict(record["a"]) for record in result]


def assign_actor_to_movie(
    session: Session,
    payload: ActorMovieAssignmentCreate,
) -> dict | None:
    result = session.run(
        """
        MATCH (a:Actor {id: $actor_id})
        MATCH (m:Movie {id: $movie_id})-[:BELONGS_TO]->(c:Category)
        MERGE (a)-[r:ACTED_IN]->(m)
        SET r.role_type = $role_type
        RETURN a, m, c, r
        """,
        actor_id=payload.actor_id,
        movie_id=payload.movie_id,
        role_type=payload.role_type,
    )
    record = result.single()

    if record is None:
        return None

    return {
        "actor": dict(record["a"]),
        "movie": {
            **dict(record["m"]),
            "category": dict(record["c"]),
        },
        "role_type": record["r"]["role_type"],
    }


def list_actor_movies(session: Session, actor_id: str) -> list[dict] | None:
    actor_exists = session.run(
        """
        MATCH (a:Actor {id: $actor_id})
        RETURN a
        """,
        actor_id=actor_id,
    ).single()

    if actor_exists is None:
        return None

    result = session.run(
        """
        MATCH (a:Actor {id: $actor_id})-[r:ACTED_IN]->(m:Movie)-[:BELONGS_TO]->(c:Category)
        RETURN m, c, r
        ORDER BY m.title
        """,
        actor_id=actor_id,
    )

    return [
        {
            "movie": {
                **dict(record["m"]),
                "category": dict(record["c"]),
            },
            "role_type": record["r"]["role_type"],
        }
        for record in result
    ]

def list_movies_watched_by_user(session: Session, user_id: str) -> list[dict] | None:
    user_exists = session.run(
        """
        MATCH (u:User {id: $user_id})
        RETURN u
        """,
        user_id=user_id,
    ).single()

    if user_exists is None:
        return None

    result = session.run(
        """
        MATCH (u:User {id: $user_id})-[r:WATCHED]->(m:Movie)-[:BELONGS_TO]->(c:Category)
        RETURN m, c, r
        ORDER BY r.score DESC, m.title
        """,
        user_id=user_id,
    )

    return [
        {
            "movie": {
                **dict(record["m"]),
                "category": dict(record["c"]),
            },
            "score": record["r"]["score"],
            "platform": record["r"]["platform"],
        }
        for record in result
    ]
