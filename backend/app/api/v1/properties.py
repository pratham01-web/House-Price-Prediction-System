from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.property_service import PropertyService
from app.schemas.property import PropertyListResponse, PropertyResponse

router = APIRouter(prefix="/properties", tags=["Properties"])


@router.get("", response_model=PropertyListResponse)
def list_properties(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price filter"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price filter"),
    bedrooms: Optional[int] = Query(None, ge=0, description="Exact bedroom count"),
    bathrooms: Optional[float] = Query(None, ge=0, description="Minimum bathroom count"),
    zipcode: Optional[str] = Query(None, description="King County 5-digit ZIP code"),
    waterfront: Optional[int] = Query(None, ge=0, le=1, description="Waterfront filter (0 or 1)"),
    sort_by: str = Query("price", description="Sort attribute: price, sqft_living, yr_built, grade_score"),
    sort_order: str = Query("desc", description="Sort direction: asc or desc"),
    db: Session = Depends(get_db),
):
    """Explores real King County property records with multidimensional filtering and pagination."""
    service = PropertyService(db)
    return service.search_properties(
        page=page,
        page_size=page_size,
        min_price=min_price,
        max_price=max_price,
        bedrooms=bedrooms,
        bathrooms=bathrooms,
        zipcode=zipcode,
        waterfront=waterfront,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get("/{property_id}", response_model=PropertyResponse)
def get_property(property_id: int, db: Session = Depends(get_db)):
    """Retrieves full specification of a single property by primary key."""
    service = PropertyService(db)
    prop = service.get_property(property_id)
    if not prop:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property with ID {property_id} not found",
        )
    return prop
