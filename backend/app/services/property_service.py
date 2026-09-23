from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from app.repositories.property_repository import PropertyRepository
from app.schemas.property import PropertyListResponse, PropertyResponse
from app.models import Property


class PropertyService:
    """Business service coordinating property retrieval, filtering, and pagination."""

    def __init__(self, db: Session):
        self.db = db
        self.repo = PropertyRepository(db)

    def get_property(self, property_id: int) -> Optional[PropertyResponse]:
        """Fetches a single property by primary key."""
        prop = self.repo.get_by_id(property_id)
        if not prop:
            return None
        return PropertyResponse.model_validate(prop)

    def search_properties(
        self,
        page: int = 1,
        page_size: int = 20,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        bedrooms: Optional[int] = None,
        bathrooms: Optional[float] = None,
        zipcode: Optional[str] = None,
        waterfront: Optional[int] = None,
        sort_by: str = "price",
        sort_order: str = "desc",
    ) -> PropertyListResponse:
        """Returns paginated property records based on client filters."""
        # Sanitize parameters
        page = max(1, page)
        page_size = max(1, min(100, page_size))
        skip = (page - 1) * page_size

        allowed_sort_fields = ["price", "sqft_living", "yr_built", "bedrooms", "bathrooms", "grade_score"]
        if sort_by not in allowed_sort_fields:
            sort_by = "price"

        items, total_count = self.repo.list_properties(
            skip=skip,
            limit=page_size,
            min_price=min_price,
            max_price=max_price,
            bedrooms=bedrooms,
            bathrooms=bathrooms,
            zipcode=zipcode,
            waterfront=waterfront,
            sort_by=sort_by,
            sort_order=sort_order,
        )

        total_pages = (total_count + page_size - 1) // page_size if total_count > 0 else 1

        return PropertyListResponse(
            total_count=total_count,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
            items=[PropertyResponse.model_validate(i) for i in items],
        )
