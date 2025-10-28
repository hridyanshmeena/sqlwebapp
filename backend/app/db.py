from pathlib import Path
from typing import Optional, Dict, Any, List
import sqlite3
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base, relationship

from .utils import ensure_user_db

ROOT = Path(__file__).resolve().parents[1]
MAIN_DB_PATH = ROOT / "sql_runner.db"

Base = declarative_base()

# ===================== MODELS =====================
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable=False)
    queries = relationship("UserQueries", back_populates="user")


class UserQueries(Base):
    __tablename__ = "user_queries"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    query = Column(String)
    run_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="queries")


# ===================== DB CONNECTION =====================
def get_engine():
    return create_engine(f"sqlite:///{MAIN_DB_PATH}", connect_args={"check_same_thread": False})

def get_session():
    Session = sessionmaker(bind=get_engine())
    return Session()

def init_main_db():
    engine = get_engine()
    Base.metadata.create_all(bind=engine)

# ===================== USER OPS =====================
def create_user(username: str, hashed_password: str):
    session = get_session()
    try:
        user = User(username=username, hashed_password=hashed_password)
        session.add(user)
        session.commit()
        return {"id": user.id, "username": user.username}
    except Exception as e:
        session.rollback()
        if "UNIQUE" in str(e).upper():
            return {"error": "username_taken"}
        return {"error": str(e)}
    finally:
        session.close()

def get_user_by_username(username: str):
    session = get_session()
    try:
        return session.query(User).filter(User.username == username).first()
    finally:
        session.close()


# ===================== USER QUERY LOGGING =====================
def log_user_query(username: str, query: str):
    session = get_session()
    try:
        user = session.query(User).filter(User.username == username).first()
        if user:
            q = UserQueries(user_id=user.id, query=query)
            session.add(q)
            session.commit()
    except Exception as e:
        print("⚠️ Error logging query:", e)
        session.rollback()
    finally:
        session.close()

def get_recent_queries(username: str) -> List[Dict[str, Any]]:
    session = get_session()
    try:
        user = session.query(User).filter(User.username == username).first()
        if not user:
            return []
        qlist = (
            session.query(UserQueries)
            .filter(UserQueries.user_id == user.id)
            .order_by(UserQueries.run_at.desc())
            .limit(10)
            .all()
        )
        return [{"id": q.id, "query": q.query, "run_at": q.run_at.isoformat()} for q in qlist]
    finally:
        session.close()


# ===================== SQLITE HELPERS =====================
def _connect_sqlite(path):
    conn = sqlite3.connect(path, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def execute_query_on_user_db(username: str, sql: str) -> Dict[str, Any]:
    db_path = ensure_user_db(username)
    conn = _connect_sqlite(db_path)
    cur = conn.cursor()
    try:
        cur.execute(sql)
        if cur.description:
            cols = [c[0] for c in cur.description]
            rows = [dict(r) for r in cur.fetchall()]
            log_user_query(username, sql)
            return {"rows": rows, "columns": cols}
        else:
            conn.commit()
            log_user_query(username, sql)
            return {"rows": [], "columns": [], "message": f"{cur.rowcount} rows affected."}
    except sqlite3.Error as e:
        return {"error": str(e)}
    finally:
        conn.close()

def list_tables_in_user_db(username: str):
    db_path = ensure_user_db(username)
    conn = _connect_sqlite(db_path)
    cur = conn.cursor()
    cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
    tables = [r[0] for r in cur.fetchall()]
    conn.close()
    # Hide system tables
    hidden = {"users", "user_queries"}
    visible_tables = [t for t in tables if t.lower() not in hidden]
    return {"tables": visible_tables}

def get_table_info_user_db(username: str, table_name: str):
    db_path = ensure_user_db(username)
    conn = _connect_sqlite(db_path)
    cur = conn.cursor()
    cur.execute(f"PRAGMA table_info('{table_name}');")
    columns = [{"name": r[1], "type": r[2]} for r in cur.fetchall()]
    cur.execute(f"SELECT * FROM '{table_name}' LIMIT 5;")
    rows = [dict(row) for row in cur.fetchall()]
    conn.close()
    return {"columns": columns, "sample_rows": rows}



def get_main_engine():
    return create_engine(f"sqlite:///{MAIN_DB_PATH}", connect_args={"check_same_thread": False})
