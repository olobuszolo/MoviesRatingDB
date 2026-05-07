from collections.abc import Generator
from contextlib import contextmanager

from neo4j import Driver, GraphDatabase, Session

from app.config import settings


class Neo4jDatabase:
    def __init__(self) -> None:
        self._driver: Driver | None = None

    def connect(self) -> None:
        self._driver = GraphDatabase.driver(
            settings.neo4j_uri,
            auth=(settings.neo4j_user, settings.neo4j_password),
        )
        self._driver.verify_connectivity()

    def close(self) -> None:
        if self._driver is not None:
            self._driver.close()
            self._driver = None

    @contextmanager
    def session(self) -> Generator[Session, None, None]:
        if self._driver is None:
            raise RuntimeError("Neo4j driver is not connected.")

        with self._driver.session() as session:
            yield session


db = Neo4jDatabase()


def get_session() -> Generator:
    with db.session() as session:
        yield session
