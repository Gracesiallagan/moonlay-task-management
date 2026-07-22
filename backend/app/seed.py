"""
Seed data sederhana untuk login dan daftar assignee.
Dijalankan otomatis saat startup (lihat main.py) supaya reviewer
tidak perlu insert manual sebelum mencoba aplikasi.
"""
from sqlalchemy.orm import Session

from app.auth import hash_password
from app.models import User

DEFAULT_USERS = [
    {"name": "Ges Silaban", "username": "ges_test", "password": "password123"},
    {"name": "Gres", "username": "gres_test", "password": "password123"},
    {"name": "Evelin", "username": "evelin_test", "password": "password123"},
    {"name": "Siallagan", "username": "siallagan_test", "password": "password123"},
    {"name": "Jekey", "username": "jekey_test", "password": "password123"},
]


def seed_users(db: Session):
    for u in DEFAULT_USERS:
        print(f"DEBUG: Seeding user: {u['username']}, password value: '{u['password']}', length: {len(u['password'])}")
        exists = db.query(User).filter(User.username == u["username"]).first()
        if not exists:
            db.add(
                User(
                    name=u["name"],
                    username=u["username"],
                    hashed_password=hash_password(u["password"]),
                )
            )
    db.commit()
