# app/db.py
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, create_async_engine, async_sessionmaker
from contextlib import asynccontextmanager
from app.core.settings import settings

engine: AsyncEngine | None = None
AsyncSessionLocal: async_sessionmaker[AsyncSession] | None = None


async def init_engine() -> None:
    global engine, AsyncSessionLocal
    engine = create_async_engine(
        settings.DATABASE_URL,
        pool_size=settings.DB_POOL_SIZE,
        max_overflow=settings.DB_MAX_OVERFLOW,
        pool_pre_ping=True,  # validates stale connections
    )
    AsyncSessionLocal = async_sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autoflush=False,
        autocommit=False,
    )


async def dispose_engine() -> None:
    if engine is not None:
        await engine.dispose()

@asynccontextmanager
async def get_session():
    """
    Session-per-request. Yields a transactional AsyncSession.
    Use in routes: Depends(get_session)
    """
    if AsyncSessionLocal is None:
        raise RuntimeError("DB not initialized")
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
