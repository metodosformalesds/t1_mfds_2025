"""Make review order_id optional

Revision ID: c8f9e7d2a1b3
Revises: a50601c0dba9
Create Date: 2025-11-19 04:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c8f9e7d2a1b3'
down_revision: Union[str, Sequence[str], None] = 'a50601c0dba9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Make order_id nullable in review table
    op.alter_column('review', 'order_id',
               existing_type=sa.INTEGER(),
               nullable=True)


def downgrade() -> None:
    """Downgrade schema."""
    # Make order_id non-nullable again (only if all order_id values are not null)
    op.alter_column('review', 'order_id',
               existing_type=sa.INTEGER(),
               nullable=False)
