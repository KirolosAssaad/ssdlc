from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.middleware.sec_headers import SecurityHeadersMiddleware
from contextlib import asynccontextmanager
from app.utils.db import init_engine, dispose_engine, get_session
from app.routes.Auth import router as AuthRouter
from app.routes.books import router as BooksRouter  # ← ADD THIS LINE
import uvicorn
from sqlalchemy.future import select

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_engine()
    async with get_session() as session:
        await session.execute(select(1))
    yield
    await dispose_engine()

app = FastAPI(
    title="ssdlc-backend", 
    docs_url="/api/docs", 
    redoc_url="/api/redoc", 
    lifespan=lifespan
)

# Add CORS middleware to allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)

app.add_middleware(SecurityHeadersMiddleware)

app.include_router(AuthRouter)
app.include_router(BooksRouter)  # ← ADD THIS LINE

@app.get("/health")
async def health() -> dict:
    """Health check endpoint.
    
    Returns a small JSON payload indicating service health.
    """
    return {"status": "ok"}

@app.get("/cors-test")
async def cors_test() -> dict:
    """CORS test endpoint.
    
    Returns a simple response to test CORS configuration.
    """
    return {
        "message": "CORS is working!",
        "status": "success",
        "cors_enabled": True
    }

def run(host: str = "0.0.0.0", port: int = 8000, reload: bool = True) -> None:
    uvicorn.run("app.server:app", host=host, port=port, reload=reload)

if __name__ == "__main__":
    run()