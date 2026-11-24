import os
from pathlib import Path
from collections.abc import Iterator
from functools import lru_cache

from dotenv import load_dotenv
from sqlalchemy import Engine
from sqlalchemy.pool import NullPool
from sqlmodel import Session, SQLModel, create_engine

load_dotenv(Path(__file__).resolve().parents[1] / ".env")


@lru_cache
def get_engine() -> Engine:
    # DATABASE_URL must be set before the server starts.
    # NullPool: serverless functions should not keep connections open.
    return create_engine(os.environ["DATABASE_URL"], poolclass=NullPool)


def create_db_and_tables() -> None:
    from app.records import models  # noqa: F401
    from app.auth import models as auth_models  # noqa: F401
    from app.admin import models as admin_models  # noqa: F401

    SQLModel.metadata.create_all(get_engine())


def get_session() -> Iterator[Session]:
    with Session(get_engine()) as session:
        yield session