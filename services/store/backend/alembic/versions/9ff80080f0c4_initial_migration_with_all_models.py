"""Initial migration with all models

Revision ID: 9ff80080f0c4
Revises: 
Create Date: 2025-08-15 14:07:16.584642

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9ff80080f0c4'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create initial database schema"""
    # This migration creates the complete database schema
    # Since we're setting up a new migration system, we'll create all tables at once
    
    # Skip if tables already exist (avoid duplicate creation errors)
    connection = op.get_bind()
    inspector = sa.inspect(connection)
    existing_tables = inspector.get_table_names()
    
    if existing_tables:
        # Tables already exist, skip creation to avoid duplicate errors
        print(f"Skipping table creation - {len(existing_tables)} tables already exist")
        return
    
    # Only create tables if database is empty
    from app.core.database import Base
    # Import all models to ensure they are registered
    from app.models import users, products, orders, payments, invoices, sso, analytics
    
    # Create all tables using the metadata only if needed
    Base.metadata.create_all(bind=connection)



def downgrade() -> None:
    """Drop all database tables"""
    # Drop tables in reverse order to handle dependencies
    op.drop_table('analytics')
    op.drop_table('sso')
    op.drop_table('invoices')
    op.drop_table('payments')
    op.drop_table('orders')
    op.drop_table('products')
    op.drop_table('users')
