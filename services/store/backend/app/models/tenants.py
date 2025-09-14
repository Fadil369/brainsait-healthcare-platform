"""
Tenant models for multi-tenant SaaS platform
"""

import enum
import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import (
    JSON,
    Boolean,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class TenantStatus(str, enum.Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    CANCELLED = "cancelled"
    TRIAL = "trial"


class TenantPlan(str, enum.Enum):
    STARTER = "starter"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"
    CUSTOM = "custom"


class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug = Column(String(50), nullable=False, unique=True, index=True)
    
    # Organization Info
    name = Column(String(255), nullable=False)
    name_ar = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    description_ar = Column(Text, nullable=True)
    
    # Contact Information
    contact_email = Column(String(255), nullable=False)
    contact_phone = Column(String(20), nullable=True)
    website = Column(String(255), nullable=True)
    
    # Address
    address = Column(JSON, nullable=True)
    
    # Business Information
    industry = Column(String(100), nullable=True)
    company_size = Column(String(50), nullable=True)
    tax_id = Column(String(50), nullable=True)
    registration_number = Column(String(50), nullable=True)
    
    # Subscription & Status
    status = Column(Enum(TenantStatus), nullable=False, default=TenantStatus.TRIAL)
    plan = Column(Enum(TenantPlan), nullable=False, default=TenantPlan.STARTER)
    
    # Billing
    billing_email = Column(String(255), nullable=True)
    payment_method_id = Column(String(255), nullable=True)
    
    # Features & Limits
    max_users = Column(Integer, nullable=False, default=5)
    max_storage_gb = Column(Integer, nullable=False, default=10)
    features = Column(JSON, nullable=True)  # Feature flags
    
    # Customization
    logo_url = Column(String(500), nullable=True)
    primary_color = Column(String(7), nullable=True)  # Hex color
    custom_domain = Column(String(255), nullable=True)
    
    # Localization
    default_language = Column(String(5), nullable=False, default="en")
    timezone = Column(String(50), nullable=False, default="Asia/Riyadh")
    currency = Column(String(3), nullable=False, default="SAR")
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    trial_ends_at = Column(DateTime(timezone=True), nullable=True)
    last_active_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    users = relationship("User", back_populates="tenant")
    sso_configs = relationship("TenantSSO", back_populates="tenant")
    
    # Indexes
    __table_args__ = (
        Index("idx_tenants_status", "status"),
        Index("idx_tenants_plan", "plan"),
        Index("idx_tenants_created", "created_at"),
    )

    def __repr__(self):
        return f"<Tenant {self.slug}>"


class TenantAuditLog(Base):
    __tablename__ = "tenant_audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey("tenants.id"), nullable=False)
    
    # Event Information
    event_type = Column(String(50), nullable=False)  # user_login, config_change, etc.
    event_category = Column(String(30), nullable=False)  # auth, config, data, etc.
    description = Column(String(500), nullable=False)
    
    # Actor Information
    user_id = Column(UUID(as_uuid=True), nullable=True)
    user_email = Column(String(255), nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)
    
    # Event Details
    resource_type = Column(String(50), nullable=True)  # user, product, order, etc.
    resource_id = Column(String(255), nullable=True)
    old_values = Column(JSON, nullable=True)
    new_values = Column(JSON, nullable=True)
    event_metadata = Column(JSON, nullable=True)
    
    # Risk Assessment
    risk_level = Column(String(20), nullable=False, default="low")  # low, medium, high
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    tenant = relationship("Tenant")
    
    # Indexes
    __table_args__ = (
        Index("idx_audit_logs_tenant", "tenant_id"),
        Index("idx_audit_logs_user", "user_id"),
        Index("idx_audit_logs_event", "event_type"),
        Index("idx_audit_logs_created", "created_at"),
        Index("idx_audit_logs_risk", "risk_level"),
    )

    def __repr__(self):
        return f"<TenantAuditLog {self.event_type}>"