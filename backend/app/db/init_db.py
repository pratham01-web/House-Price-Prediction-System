"""Database schema initialization and verification utility."""

import sys
from sqlalchemy import inspect
from app.core.logging import logger
from app.db.session import engine
from app.models import Base, DatasetVersion, Property, ModelVersion, Prediction


def init_db() -> bool:
    """Creates all database tables defined in the SQLAlchemy models if they do not exist."""
    try:
        logger.info(f"Connecting to database and verifying schema...")
        Base.metadata.create_all(bind=engine)

        inspector = inspect(engine)
        table_names = inspector.get_table_names()
        expected_tables = ["dataset_versions", "properties", "model_versions", "predictions"]

        logger.info(f"Database schema initialized successfully.")
        logger.info(f"Existing tables in database: {table_names}")

        missing = [t for t in expected_tables if t not in table_names]
        if missing:
            logger.error(f"Missing expected tables: {missing}")
            return False

        for table in expected_tables:
            columns = inspector.get_columns(table)
            indexes = inspector.get_indexes(table)
            logger.info(f"Table '{table}': {len(columns)} columns, {len(indexes)} indexes verified.")

        return True
    except Exception as exc:
        logger.error(f"Failed to initialize database schema: {exc}", exc_info=True)
        return False


if __name__ == "__main__":
    success = init_db()
    sys.exit(0 if success else 1)
