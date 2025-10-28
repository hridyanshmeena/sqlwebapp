from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from .db import *
from .auth import *
from .schemas import *
import sqlite3

app = FastAPI(title="SQL Runner API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_main_db()

@app.post("/api/signup")
def signup(payload: SignupRequest):
    if get_user_by_username(payload.username):
        raise HTTPException(status_code=400, detail="Username already exists")
    hashed = get_password_hash(payload.password)
    res = create_user(payload.username, hashed)
    return {"message": "User created", "user": res}

@app.post("/api/login", response_model=TokenResponse)
def login(payload: LoginRequest):
    user = get_user_by_username(payload.username)
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer", "username": user.username}

@app.get("/api/tables")
def tables(current_user=Depends(get_current_user)):
    return list_tables_in_user_db(current_user["username"])

@app.get("/api/tables/{table_name}")
def table_info(table_name: str, current_user=Depends(get_current_user)):
    return get_table_info_user_db(current_user["username"], table_name)

@app.post("/api/query")
def query(payload: QueryRequest, current_user=Depends(get_current_user)):
    return execute_query_on_user_db(current_user["username"], payload.sql)
@app.get("/api/queries/recent")
def recent_queries(current_user=Depends(get_current_user)):
    return {"queries": get_recent_queries(current_user["username"])}
def ensure_user_queries_table():
    conn = sqlite3.connect("sql_runner.db")
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS user_queries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            query TEXT,
            run_at TEXT
        )
    """)
    conn.commit()
    conn.close()

@app.on_event("startup")
def startup_event():
    ensure_user_queries_table()