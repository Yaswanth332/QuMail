from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import db

# Initialize DB tables
db.init_db()

app = FastAPI(title="QuMail Backend", version="1.0.0")

# 🔴 CORS MUST COME HERE — BEFORE ROUTERS
origins = [
    "https://qumailcom.vercel.app",
    "https://qumailcom.vercel.app/", # Added trailing slash variant
    "https://qu-mail-mkdo.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ⬇️ ONLY AFTER CORS
from .api import endpoints
app.include_router(endpoints.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "QuMail Quantum Secure Backend Running"}
