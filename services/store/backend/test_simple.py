#!/usr/bin/env python3
"""
Simple test to validate basic functionality
"""

import pytest
from fastapi.testclient import TestClient

def test_basic_app_creation():
    """Test that we can create a basic FastAPI app"""
    from fastapi import FastAPI
    
    app = FastAPI(title="Test App")
    
    @app.get("/health")
    async def health():
        return {"status": "ok"}
    
    client = TestClient(app)
    response = client.get("/health")
    
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_configuration():
    """Test configuration loading"""
    from app.core.config import settings
    
    assert settings.APP_NAME == "BrainSAIT Store API"
    assert settings.APP_VERSION == "1.0.0"
    assert settings.ENVIRONMENT == "development"
    assert isinstance(settings.DEBUG, bool)
    assert settings.SECRET_KEY is not None

def test_database_configuration():
    """Test database configuration"""
    from app.core.config import settings
    
    assert settings.DATABASE_URL is not None
    assert "postgresql" in settings.DATABASE_URL or "sqlite" in settings.DATABASE_URL
    assert settings.REDIS_URL is not None

def test_pydantic_models():
    """Test basic Pydantic model functionality"""
    from pydantic import BaseModel
    from typing import Optional
    from decimal import Decimal
    
    class TestProduct(BaseModel):
        name: str
        price: Decimal
        description: Optional[str] = None
        
    product = TestProduct(name="Test Product", price=Decimal("99.99"))
    assert product.name == "Test Product"
    assert product.price == Decimal("99.99")
    assert product.description is None

def test_currency_utilities():
    """Test basic currency handling"""
    from decimal import Decimal
    
    # Test Saudi Riyal formatting
    price = Decimal("150.75")
    formatted_price = f"{price:.2f}"
    assert formatted_price == "150.75"
    
    # Test VAT calculation (15% in Saudi Arabia)
    vat_rate = Decimal("0.15")
    base_price = Decimal("100.00")
    vat_amount = base_price * vat_rate
    total_price = base_price + vat_amount
    
    assert vat_amount == Decimal("15.00")
    assert total_price == Decimal("115.00")

if __name__ == "__main__":
    pytest.main([__file__, "-v"])