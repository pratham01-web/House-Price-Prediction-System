from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings
from app.core.logging import logger

# Configure connection pooling and engine
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    settings.DATABASE_URL,
    echo=False,
    pool_pre_ping=True,
    pool_size=10 if not settings.DATABASE_URL.startswith("sqlite") else None,
    max_overflow=20 if not settings.DATABASE_URL.startswith("sqlite") else None,
    pool_recycle=3600 if not settings.DATABASE_URL.startswith("sqlite") else None,
    connect_args=connect_args,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that yields a database session per request."""
    db: Session = SessionLocal()
    try:
        yield db
    except Exception as exc:
        db.rollback()
        logger.error(f"Database session rollback due to exception: {exc}")
        raise
    finally:
        db.close()
