from app.db.database import SessionLocal
from app.seed import init_demo_data


def main() -> None:
    with SessionLocal() as db:
        init_demo_data(db)
        print("Demo seed data inserted successfully.")


if __name__ == "__main__":
    main()
