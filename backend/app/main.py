from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import db
from .api import endpoints

# Initialize DB tables
db.init_db()

app = FastAPI(title="QuMail Backend", version="1.0.0")

# CORS (Allow Frontend)
origins = [
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

app.include_router(endpoints.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "QuMail Quantum Secure Backend Running"}
