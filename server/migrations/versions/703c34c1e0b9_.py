"""empty message

Revision ID: 703c34c1e0b9
Revises: b8d6364b81a9
Create Date: 2024-01-25 16:09:44.862458

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '703c34c1e0b9'
down_revision = 'b8d6364b81a9'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('product', sa.Column('costofpurchase', sa.Integer(), nullable=False))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('product', 'costofpurchase')
    # ### end Alembic commands ###