from fastapi import FastAPI
from app.routers import health,auth,protected,customers,cloth_stock,payments,dashboard,expenses,employees,orders,owners
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI(
    title="SilaiBook API",
    description="Tailoring Shop Management System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # React dev server
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(protected.router)
app.include_router(customers.router)
app.include_router(cloth_stock.router)
app.include_router(payments.router)
app.include_router(dashboard.router)
app.include_router(expenses.router)
app.include_router(employees.router)
app.include_router(owners.router)
app.include_router(orders.router)

# Ensure static directory exists
os.makedirs("app/static/photos", exist_ok=True)
app.mount("/static", StaticFiles(directory="app/static"), name="static")

@app.get("/")
def root():
    return {"message": "SilaiBook backend is running"}
