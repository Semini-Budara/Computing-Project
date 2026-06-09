from app.db.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    result = conn.execute(text("DESCRIBE subjects"))
    rows = result.fetchall()
    for row in rows:
        print(row)

    result2 = conn.execute(text("DESCRIBE teachers"))
    rows2 = result2.fetchall()
    for row in rows2:
        print(row)