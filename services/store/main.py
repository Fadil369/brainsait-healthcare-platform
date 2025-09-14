from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
import asyncio
from datetime import datetime
from audit_logger import AuditMiddleware, log_audit_event, AUDIT_ACTIONS

app = FastAPI(
    title="BrainSAIT Store API",
    description="E-commerce platform for BrainSAIT targeting Middle East market",
    version="2.0.0"
)

# Add audit middleware first
app.add_middleware(AuditMiddleware)

# CORS middleware for cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "message": "BrainSAIT Store API",
        "version": "2.0.0",
        "region": os.getenv("REGION", "saudi-arabia"),
        "currency": os.getenv("CURRENCY", "SAR"),
        "language": os.getenv("LANGUAGE", "ar"),
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

@app.get("/ready")
async def readiness_check():
    # Add database connectivity check here
    return {"status": "ready", "timestamp": datetime.utcnow().isoformat()}

@app.get("/api/products")
async def get_products():
    # Sample products for Middle East market
    return {
        "products": [
            {
                "id": 1,
                "name": "منتج طبي متقدم",
                "name_en": "Advanced Medical Product",
                "price": 299.99,
                "currency": "SAR",
                "category": "medical-devices",
                "region": "saudi-arabia"
            },
            {
                "id": 2,
                "name": "نظام إدارة المستشفيات",
                "name_en": "Hospital Management System",
                "price": 4999.99,
                "currency": "SAR",
                "category": "software",
                "region": "middle-east"
            }
        ]
    }

@app.get("/api/orders")
async def get_orders():
    return {
        "orders": [],
        "total": 0,
        "currency": "SAR"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
