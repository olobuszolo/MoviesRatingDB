import argparse
from dataclasses import dataclass

from neo4j import GraphDatabase, Session

from app.config import settings
from app.repositories import create_constraints


@dataclass(frozen=True)
class MovieSeed:
    id: str
    title: str
    duration_minutes: int
    category_id: str
    category_name: str
    release_year: int
    director_id: str


CATEGORIES = [
    {"id": "seed-category-sci-fi", "name": "Sci-Fi"},
    {"id": "seed-category-drama", "name": "Drama"},
    {"id": "seed-category-comedy", "name": "Comedy"},
]

USERS = [
    {"id": "seed-user-01", "username": "anna_k", "country": "Poland", "age": 24},
    {"id": "seed-user-02", "username": "bartek_m", "country": "Poland", "age": 31},
    {"id": "seed-user-03", "username": "celina_s", "country": "Germany", "age": 28},
    {"id": "seed-user-04", "username": "dawid_p", "country": "Poland", "age": 35},
    {"id": "seed-user-05", "username": "ewa_nowak", "country": "France", "age": 22},
    {"id": "seed-user-06", "username": "filip_w", "country": "Poland", "age": 41},
    {"id": "seed-user-07", "username": "gosia_l", "country": "Spain", "age": 29},
    {"id": "seed-user-08", "username": "hubert_z", "country": "Italy", "age": 33},
    {"id": "seed-user-09", "username": "iga_r", "country": "Poland", "age": 26},
    {"id": "seed-user-10", "username": "jan_b", "country": "United States", "age": 38},
    {"id": "seed-user-11", "username": "klaudia_t", "country": "Poland", "age": 45},
    {"id": "seed-user-12", "username": "lukasz_c", "country": "Canada", "age": 30},
]

DIRECTORS = [
    {"id": "seed-director-01", "name": "Alicja Wronska", "country": "Poland"},
    {"id": "seed-director-02", "name": "Mark Stone", "country": "United States"},
    {"id": "seed-director-03", "name": "Sofia Moretti", "country": "Italy"},
    {"id": "seed-director-04", "name": "Kenji Tanaka", "country": "Japan"},
    {"id": "seed-director-05", "name": "Laura Bennett", "country": "United Kingdom"},
    {"id": "seed-director-06", "name": "Mateusz Krol", "country": "Poland"},
]

ACTORS = [
    {"id": "seed-actor-01", "name": "Maja Zielinska", "age": 29, "country": "Poland"},
    {"id": "seed-actor-02", "name": "Adam Nowicki", "age": 34, "country": "Poland"},
    {"id": "seed-actor-03", "name": "Lena Brooks", "age": 31, "country": "United States"},
    {"id": "seed-actor-04", "name": "Tom Carter", "age": 42, "country": "United Kingdom"},
    {"id": "seed-actor-05", "name": "Nora Weiss", "age": 37, "country": "Germany"},
    {"id": "seed-actor-06", "name": "Pawel Lis", "age": 45, "country": "Poland"},
    {"id": "seed-actor-07", "name": "Clara Martin", "age": 27, "country": "France"},
    {"id": "seed-actor-08", "name": "Diego Alvarez", "age": 39, "country": "Spain"},
    {"id": "seed-actor-09", "name": "Julia Evans", "age": 33, "country": "Canada"},
    {"id": "seed-actor-10", "name": "Oskar Berg", "age": 48, "country": "Sweden"},
    {"id": "seed-actor-11", "name": "Emilia Rossi", "age": 30, "country": "Italy"},
    {"id": "seed-actor-12", "name": "Victor Huang", "age": 36, "country": "China"},
    {"id": "seed-actor-13", "name": "Sara Cohen", "age": 41, "country": "Israel"},
    {"id": "seed-actor-14", "name": "Kamil Witek", "age": 25, "country": "Poland"},
    {"id": "seed-actor-15", "name": "Amelia Green", "age": 44, "country": "Ireland"},
    {"id": "seed-actor-16", "name": "Noah Smith", "age": 28, "country": "Australia"},
    {"id": "seed-actor-17", "name": "Hanna Meyer", "age": 32, "country": "Germany"},
    {"id": "seed-actor-18", "name": "Rafael Costa", "age": 46, "country": "Brazil"},
    {"id": "seed-actor-19", "name": "Natalia Sokol", "age": 35, "country": "Poland"},
    {"id": "seed-actor-20", "name": "Erik Larsen", "age": 40, "country": "Norway"},
]

ROLE_TYPES = ["Lead", "Supporting", "Cameo", "Guest"]
PLATFORMS = ["Netflix", "HBO", "Amazon", "Disney", "TV"]


def build_movies() -> list[MovieSeed]:
    titles_by_category = {
        "seed-category-sci-fi": [
            "Orbit Echo",
            "Neon Colony",
            "Quantum Harbor",
            "Signal From Europa",
            "Solar Drift",
            "The Last Android",
            "Moonbase Aurora",
            "Gravity Window",
            "Starfall Protocol",
            "Memory of Mars",
        ],
        "seed-category-drama": [
            "Silent Letters",
            "Winter Courtyard",
            "After the Rain",
            "The Blue Apartment",
            "Small Town Promise",
            "Broken Violin",
            "Harbor Lights",
            "Road to Gdansk",
            "A Quiet Sunday",
            "The Orchard House",
        ],
        "seed-category-comedy": [
            "Weekend Plan",
            "The Wrong Suitcase",
            "Dinner at Eight",
            "Almost Famous Cousins",
            "Taxi to Nowhere",
            "My Neighbor's Dog",
            "Office Karaoke",
            "The Wedding Backup",
            "Holiday Mix-Up",
            "Grandma Goes Viral",
        ],
    }

    movies: list[MovieSeed] = []
    movie_number = 1

    for category_id, titles in titles_by_category.items():
        category_name = next(category["name"] for category in CATEGORIES if category["id"] == category_id)

        for index, title in enumerate(titles):
            movies.append(
                MovieSeed(
                    id=f"seed-movie-{movie_number:02d}",
                    title=title,
                    duration_minutes=88 + ((movie_number * 7) % 55),
                    category_id=category_id,
                    category_name=category_name,
                    release_year=1995 + ((movie_number * 3 + index) % 29),
                    director_id=DIRECTORS[(movie_number + index) % len(DIRECTORS)]["id"],
                )
            )
            movie_number += 1

    return movies


MOVIES = build_movies()


def reset_seed_data(session: Session) -> None:
    session.run(
        """
        MATCH (n)
        WHERE n.id STARTS WITH 'seed-'
        DETACH DELETE n
        """
    )


def seed_categories(session: Session) -> None:
    session.run(
        """
        UNWIND $categories AS row
        MERGE (c:Category {name: row.name})
        ON CREATE SET c.id = row.id
        """,
        categories=CATEGORIES,
    )


def seed_users(session: Session) -> None:
    session.run(
        """
        UNWIND $users AS row
        MERGE (u:User {id: row.id})
        SET u.username = row.username,
            u.country = row.country,
            u.age = row.age
        """,
        users=USERS,
    )


def seed_directors(session: Session) -> None:
    session.run(
        """
        UNWIND $directors AS row
        MERGE (d:Director {id: row.id})
        SET d.name = row.name,
            d.country = row.country
        """,
        directors=DIRECTORS,
    )


def seed_actors(session: Session) -> None:
    session.run(
        """
        UNWIND $actors AS row
        MERGE (a:Actor {id: row.id})
        SET a.name = row.name,
            a.age = row.age,
            a.country = row.country
        """,
        actors=ACTORS,
    )


def seed_movies(session: Session) -> None:
    movies = [movie.__dict__ for movie in MOVIES]
    session.run(
        """
        UNWIND $movies AS row
        MATCH (c:Category {name: row.category_name})
        MERGE (m:Movie {id: row.id})
        SET m.title = row.title,
            m.duration_minutes = row.duration_minutes
        MERGE (m)-[:BELONGS_TO]->(c)
        """,
        movies=movies,
    )


def seed_directed_relations(session: Session) -> None:
    relations = [
        {
            "movie_id": movie.id,
            "director_id": movie.director_id,
            "release_year": movie.release_year,
        }
        for movie in MOVIES
    ]
    session.run(
        """
        UNWIND $relations AS row
        MATCH (d:Director {id: row.director_id})
        MATCH (m:Movie {id: row.movie_id})
        MERGE (d)-[r:DIRECTED]->(m)
        SET r.release_year = row.release_year
        """,
        relations=relations,
    )


def seed_acted_relations(session: Session) -> None:
    relations = []

    for movie_index, movie in enumerate(MOVIES):
        for offset in range(5):
            actor = ACTORS[(movie_index * 3 + offset) % len(ACTORS)]
            relations.append(
                {
                    "movie_id": movie.id,
                    "actor_id": actor["id"],
                    "role_type": ROLE_TYPES[offset % len(ROLE_TYPES)],
                }
            )

    session.run(
        """
        UNWIND $relations AS row
        MATCH (a:Actor {id: row.actor_id})
        MATCH (m:Movie {id: row.movie_id})
        MERGE (a)-[r:ACTED_IN]->(m)
        SET r.role_type = row.role_type
        """,
        relations=relations,
    )


def seed_watched_relations(session: Session) -> None:
    relations = []

    for movie_index, movie in enumerate(MOVIES):
        for offset in range(10):
            user = USERS[(movie_index + offset) % len(USERS)]
            relations.append(
                {
                    "movie_id": movie.id,
                    "user_id": user["id"],
                    "score": ((movie_index * 2 + offset) % 10) + 1,
                    "platform": PLATFORMS[(movie_index + offset) % len(PLATFORMS)],
                }
            )

    session.run(
        """
        UNWIND $relations AS row
        MATCH (u:User {id: row.user_id})
        MATCH (m:Movie {id: row.movie_id})
        MERGE (u)-[r:WATCHED]->(m)
        SET r.score = row.score,
            r.platform = row.platform
        """,
        relations=relations,
    )


def count_seed_data(session: Session) -> dict[str, int]:
    result = session.run(
        """
        MATCH (n)
        WHERE n.id STARTS WITH 'seed-'
        WITH labels(n)[0] AS label, count(n) AS count
        RETURN collect({label: label, count: count}) AS nodes
        """
    )
    nodes = result.single()["nodes"]

    relationships = session.run(
        """
        MATCH (a)-[r]->(b)
        WHERE a.id STARTS WITH 'seed-' AND b.id STARTS WITH 'seed-'
        RETURN type(r) AS type, count(r) AS count
        ORDER BY type
        """
    )

    counts = {item["label"]: item["count"] for item in nodes}
    counts.update({record["type"]: record["count"] for record in relationships})
    return counts


def seed_database(reset: bool) -> dict[str, int]:
    driver = GraphDatabase.driver(
        settings.neo4j_uri,
        auth=(settings.neo4j_user, settings.neo4j_password),
    )

    try:
        driver.verify_connectivity()

        with driver.session() as session:
            create_constraints(session)

            if reset:
                reset_seed_data(session)

            seed_categories(session)
            seed_users(session)
            seed_directors(session)
            seed_actors(session)
            seed_movies(session)
            seed_directed_relations(session)
            seed_acted_relations(session)
            seed_watched_relations(session)

            return count_seed_data(session)
    finally:
        driver.close()


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed Neo4j with sample MoviesRatingDB data.")
    parser.add_argument(
        "--reset-seed",
        action="store_true",
        help="Delete existing nodes with ids starting with 'seed-' before inserting data.",
    )
    args = parser.parse_args()

    counts = seed_database(reset=args.reset_seed)

    print("Seed data loaded:")
    for key in sorted(counts):
        print(f"- {key}: {counts[key]}")


if __name__ == "__main__":
    main()
