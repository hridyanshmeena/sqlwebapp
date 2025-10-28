from app.db import Base, get_main_engine
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class UserQuery(Base):
    __tablename__ = "user_queries"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    query = Column(String)
    run_at = Column(DateTime, default=datetime.utcnow)

def init_main_db():
    engine = get_main_engine()
    Base.metadata.create_all(bind=engine)
    print("✅ Main DB initialized at sql_runner_main.db")

if __name__ == "__main__":
    init_main_db()
