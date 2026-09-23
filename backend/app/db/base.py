import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


def utc_now() -> datetime:
    """Returns current timezone-aware UTC datetime."""
    return datetime.now(timezone.utc)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy domain models."""
    pass
