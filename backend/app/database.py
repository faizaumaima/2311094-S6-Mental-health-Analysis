import os
from collections.abc import Iterator
from functools import lru_cache

from sqlalchemy import Engine
from sqlalchemy.pool import NullPool
from sqlmodel import Session, SQLModel, create_engine


@lru_cache
def get_engine() -> Engine:
    # DATABASE_URL must be set before the server starts.
    # NullPool: serverless functions should not keep connections open.
    return create_engine(os.environ["DATABASE_URL"], poolclass=NullPool)


def create_db_and_tables() -> None:
    from app.records import models  # noqa: F401

    SQLModel.metadata.create_all(get_engine())


def get_session() -> Iterator[Session]:
    with Session(get_engine()) as session:
        yield session