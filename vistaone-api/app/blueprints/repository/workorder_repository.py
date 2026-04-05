
from app.models import WorkOrder, db
from sqlalchemy import select


def add_workorder(workorder: WorkOrder):
    db.session.add(workorder)
    db.session.commit()
    return workorder