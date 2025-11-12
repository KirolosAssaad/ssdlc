from fastapi import FastAPI
from app.middleware.sec_headers import SecurityHeadersMiddleware
from contextlib import asynccontextmanager
from app.utils.db import init_engine, dispose_engine, get_session
import uvicorn
from sqlalchemy.future import select
from app.routes.Auth import router as AuthRouter
from app.routes.search import router as SearchRouter
from app.routes.cart import router as CartRouter
from app.routes.checkout import router as CheckoutRouter

@asynccontextmanager
async def lifespan(app: FastAPI):
	await init_engine()
	async with get_session() as session:
		await session.execute(select(1))
	yield
	await dispose_engine()

app = FastAPI(title="ssdlc-backend", docs_url="/api/docs", redoc_url="/api/redoc", lifespan=lifespan)

app.add_middleware(SecurityHeadersMiddleware)

app.include_router(CartRouter)
app.include_router(CheckoutRouter)
app.include_router(SearchRouter)
app.include_router(AuthRouter)

@app.get("/health")
async def health() -> dict:
	"""Health check endpoint.

	Returns a small JSON payload indicating service health.
	"""
	return {"status": "ok"}


def run(host: str = "0.0.0.0", port: int = 8000, reload: bool = True) -> None:
	uvicorn.run("app.server:app", host=host, port=port, reload=reload)


if __name__ == "__main__":
	run()
