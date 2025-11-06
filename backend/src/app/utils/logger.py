import logging
import os
import threading
from datetime import datetime, timedelta
from typing import Optional

# /home/kiro/Desktop/ssdlc/backend/src/app/utils/logger.py
"""
Daily rotating file logger.
- Logs written to ./logs/<YYYY-MM-DD>.log
- New file created each day.
- Old log files (by modification time) are removed after retention_days (default 7).
- Thread-safe rollover.
"""



class DailyFileLogger:
    def __init__(
        self,
        name: str = "app",
        logs_dir: str = "logs",
        level: int = logging.INFO,
        retention_days: int = 7,
        fmt: Optional[str] = None,
    ):
        self.name = name
        self.logs_dir = os.path.abspath(logs_dir)
        self.level = level
        self.retention_days = int(retention_days)
        self.format = fmt or "%(asctime)s %(levelname)s [%(name)s] %(message)s"
        self._lock = threading.Lock()

        os.makedirs(self.logs_dir, exist_ok=True)

        # internal logger
        self.logger = logging.getLogger(self.name)
        self.logger.setLevel(self.level)
        self.logger.propagate = False

        # remove any existing handlers on this logger (avoid duplicate logs)
        for h in list(self.logger.handlers):
            self.logger.removeHandler(h)
            try:
                h.close()
            except Exception:
                pass

        self._current_date = None
        self._handler: Optional[logging.Handler] = None

        # initial setup (and cleanup of old logs)
        with self._lock:
            self._rollover_if_needed(force=True)
            self._cleanup_old_logs()

    def _current_date_str(self) -> str:
        return datetime.utcnow().strftime("%Y-%m-%d")

    def _log_file_path_for_date(self, date_str: str) -> str:
        return os.path.join(self.logs_dir, f"{date_str}.log")

    def _create_handler_for_date(self, date_str: str) -> logging.Handler:
        path = self._log_file_path_for_date(date_str)
        handler = logging.FileHandler(path, mode="a", encoding="utf-8")
        formatter = logging.Formatter(self.format)
        handler.setFormatter(formatter)
        handler.setLevel(self.level)
        return handler

    def _cleanup_old_logs(self) -> None:
        """Delete log files older than retention_days based on file mtime."""
        try:
            now = datetime.utcnow()
            cutoff = now - timedelta(days=self.retention_days)
            for fname in os.listdir(self.logs_dir):
                if not fname.lower().endswith(".log"):
                    continue
                full = os.path.join(self.logs_dir, fname)
                try:
                    mtime = datetime.utcfromtimestamp(os.path.getmtime(full))
                    if mtime < cutoff:
                        os.remove(full)
                except FileNotFoundError:
                    pass
                except Exception:
                    # ignore deletion errors
                    pass
        except Exception:
            # keep logger working if cleanup fails
            pass

    def _rollover_if_needed(self, force: bool = False) -> None:
        """Switch to a new file if the date has changed (or forced)."""
        date_str = self._current_date_str()
        if force or date_str != self._current_date:
            # close old handler
            if self._handler:
                try:
                    self.logger.removeHandler(self._handler)
                except Exception:
                    pass
                try:
                    self._handler.close()
                except Exception:
                    pass
                self._handler = None

            # create new handler for today
            handler = self._create_handler_for_date(date_str)
            self.logger.addHandler(handler)
            self._handler = handler
            self._current_date = date_str

            # cleanup old logs when rotating
            self._cleanup_old_logs()

    # Logging methods
    def debug(self, msg: str, *args, **kwargs) -> None:
        with self._lock:
            self._rollover_if_needed()
            self.logger.debug(msg, *args, **kwargs)

    def info(self, msg: str, *args, **kwargs) -> None:
        with self._lock:
            self._rollover_if_needed()
            self.logger.info(msg, *args, **kwargs)

    def warning(self, msg: str, *args, **kwargs) -> None:
        with self._lock:
            self._rollover_if_needed()
            self.logger.warning(msg, *args, **kwargs)

    warn = warning  # backwards compat

    def error(self, msg: str, *args, **kwargs) -> None:
        with self._lock:
            self._rollover_if_needed()
            self.logger.error(msg, *args, **kwargs)

    def critical(self, msg: str, *args, **kwargs) -> None:
        with self._lock:
            self._rollover_if_needed()
            self.logger.critical(msg, *args, **kwargs)

    def exception(self, msg: str, *args, exc_info=True, **kwargs) -> None:
        with self._lock:
            self._rollover_if_needed()
            self.logger.error(msg, *args, exc_info=exc_info, **kwargs)

    def set_level(self, level: int) -> None:
        with self._lock:
            self.level = level
            self.logger.setLevel(level)
            if self._handler:
                self._handler.setLevel(level)

    def close(self) -> None:
        with self._lock:
            if self._handler:
                try:
                    self.logger.removeHandler(self._handler)
                except Exception:
                    pass
                try:
                    self._handler.close()
                except Exception:
                    pass
                self._handler = None

logger = DailyFileLogger()
# Example usage:
# from app.utils.logger import DailyFileLogger
# log = DailyFileLogger(name="myapp", logs_dir="logs", level=logging.DEBUG)
# log.info("Application started")