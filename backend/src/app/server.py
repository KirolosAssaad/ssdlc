from fastapi import FastAPI
from app.middleware.sec_headers import SecurityHeadersMiddleware
from contextlib import asynccontextmanager
from app.utils.db import init_engine, dispose_engine

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_engine()
    # (Optional) Run a quick sanity check:
    # async with engine.connect() as conn:
    #     await conn.execute(text("SET statement_timeout = '5s'"))
    yield
    await dispose_engine()

app = FastAPI(title="ssdlc-backend", lifespan=lifespan)
app.add_middleware(SecurityHeadersMiddleware)

@app.get("/health")
async def health() -> dict:
	"""Health check endpoint.

	Returns a small JSON payload indicating service health.
	"""
	return {"status": "ok"}


def run(host: str = "0.0.0.0", port: int = 8000, reload: bool = True) -> None:
	"""Programmatic entrypoint for running the app with Uvicorn.

	This is used by the Poetry script `backend.server:run` so you can run:
	  poetry run start
	"""
	import uvicorn

	uvicorn.run("app.server:app", host=host, port=port, reload=reload)


if __name__ == "__main__":
	# Allow running directly for local development: `python app/server.py`

	run()
