import logging
import sys
from typing import Any, Dict


class StandardFormatter(logging.Formatter):
    """Clean, high-visibility formatter for console logging."""

    grey = "\x1b[38;20m"
    cyan = "\x1b[36;20m"
    yellow = "\x1b[33;20m"
    red = "\x1b[31;20m"
    bold_red = "\x1b[31;1m"
    reset = "\x1b[0m"
    format_str = "%(asctime)s | %(levelname)-8s | %(name)s:%(funcName)s:%(lineno)d - %(message)s"

    FORMATS: Dict[int, str] = {
        logging.DEBUG: grey + format_str + reset,
        logging.INFO: cyan + format_str + reset,
        logging.WARNING: yellow + format_str + reset,
        logging.ERROR: red + format_str + reset,
        logging.CRITICAL: bold_red + format_str + reset,
    }

    def format(self, record: logging.LogRecord) -> str:
        log_fmt = self.FORMATS.get(record.levelno, self.format_str)
        formatter = logging.Formatter(log_fmt, datefmt="%Y-%m-%d %H:%M:%S")
        return formatter.format(record)


def setup_logging(log_level: str = "INFO") -> logging.Logger:
    """Configures structured console logging across the backend."""
    logger = logging.getLogger("house_price_intelligence")
    level = getattr(logging, log_level.upper(), logging.INFO)
    logger.setLevel(level)

    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(level)
        handler.setFormatter(StandardFormatter())
        logger.addHandler(handler)

    logger.propagate = False
    return logger


logger = setup_logging()
