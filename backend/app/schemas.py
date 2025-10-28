from pydantic import BaseModel

class SignupRequest(BaseModel):
    username: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

class QueryRequest(BaseModel):
    sql: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    username: str
