from typing import Optional
from starlette.types import ASGIApp, Receive, Scope, Send, Message

"""
Middleware to add strong security headers to HTTP responses.

Usage (FastAPI / Starlette):

    app = FastAPI()
    app.add_middleware(SecurityHeadersMiddleware)
"""



class SecurityHeadersMiddleware:
    """
    ASGI middleware that injects common security headers into HTTP responses.
    """

    def __init__(
        self,
        app: ASGIApp,
        *,
        hsts: Optional[str] = None,
        csp: Optional[str] = None,
        referrer_policy: str = "no-referrer-when-downgrade",
        permissions_policy: str = "geolocation=(), microphone=()",
    ) -> None:
        self.app = app
        # sensible defaults; callers can override via add_middleware(...)
        self.hsts = hsts or "max-age=63072000; includeSubDomains; preload"
        self.csp = csp or (
            "default-src 'self'; "
            "script-src 'self'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data:; "
            "connect-src 'self'; "
            "font-src 'self' data:; "
            "object-src 'none'; "
            "base-uri 'self'; "
            "frame-ancestors 'none';"
        )
        self.referrer_policy = referrer_policy
        self.permissions_policy = permissions_policy

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope.get("type") != "http":
            await self.app(scope, receive, send)
            return

        async def send_wrapper(message: Message) -> None:
            if message["type"] == "http.response.start":
                # ensure we have a mutable headers list
                headers = list(message.get("headers", []))

                # helper to avoid duplicate headers (case-insensitive)
                existing = {k.decode().lower() for k, _ in headers}

                def add(name: str, value: str) -> None:
                    if name.lower() not in existing:
                        headers.append((name.encode("latin-1"), value.encode("latin-1")))

                add("Strict-Transport-Security", self.hsts)
                add("X-Content-Type-Options", "nosniff")
                add("X-Frame-Options", "DENY")
                add("Referrer-Policy", self.referrer_policy)
                add("Content-Security-Policy", self.csp)
                add("Permissions-Policy", self.permissions_policy)
                # modern browsers ignore X-XSS-Protection but some older clients still use it
                add("X-XSS-Protection", "0")

                message["headers"] = headers

            await send(message)

        await self.app(scope, receive, send_wrapper)