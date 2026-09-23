from typing import List, Optional, Tuple
from sqlalchemy import select, func, desc, asc
from sqlalchemy.orm import Session
from app.models import Property


class PropertyRepository:
    """Data access repository for Property domain entities."""

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, property_id: int) -> Optional[Property]:
        """Fetches a single property by primary key."""
        return self.db.scalar(select(Property).where(Property.id == property_id))

    def get_by_external_id(self, external_id: str) -> Optional[Property]:
        """Fetches a single property by unique external ID."""
        return self.db.scalar(select(Property).where(Property.external_id == external_id))

    def list_properties(
        self,
        skip: int = 0,
        limit: int = 20,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        bedrooms: Optional[int] = None,
        bathrooms: Optional[float] = None,
        zipcode: Optional[str] = None,
        waterfront: Optional[int] = None,
        sort_by: str = "price",
        sort_order: str = "desc",
    ) -> Tuple[List[Property], int]:
        """Filters, sorts, and paginates properties with total count."""
        query = select(Property)

        if min_price is not None:
            query = query.where(Property.price >= min_price)
        if max_price is not None:
            query = query.where(Property.price <= max_price)
        if bedrooms is not None:
            query = query.where(Property.bedrooms == bedrooms)
        if bathrooms is not None:
            query = query.where(Property.bathrooms >= bathrooms)
        if zipcode is not None:
            query = query.where(Property.zipcode == zipcode)
        if waterfront is not None:
            query = query.where(Property.waterfront == waterfront)

        # Count total matches before pagination
        count_query = select(func.count()).select_from(query.subquery())
        total_count = self.db.scalar(count_query) or 0

        # Apply sorting
        sort_column = getattr(Property, sort_by, Property.price)
        if sort_order.lower() == "asc":
            query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(sort_column))

        # Apply pagination
        query = query.offset(skip).limit(limit)
        items = list(self.db.scalars(query).all())

        return items, total_count
