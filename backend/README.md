# Backend (FastAPI)

This backend uses Poetry for dependency management and packaging.

Recommended Python: 3.10+

Quickstart

1. Install Poetry (if not installed):

```bash
curl -sSL https://install.python-poetry.org | python3 -
# then ensure $HOME/.local/bin is on your PATH, or follow the installer output
```

1. Install project dependencies:

```bash
cd backend
poetry install
```

1. Run the server using Poetry:

```bash
poetry run uvicorn backend.server:app --host 0.0.0.0 --port 8000
```

1. Export requirements for Docker / environments that expect requirements.txt:

```bash
poetry export -f requirements.txt --output requirements.txt --without-hashes
```

Notes

- `pyproject.toml` contains the dependencies and metadata.
- Use `poetry shell` to spawn a shell with the virtualenv activated, or `poetry run <cmd>` to run commands inside the environment.
