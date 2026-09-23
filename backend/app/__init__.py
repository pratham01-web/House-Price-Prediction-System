"""House Price Intelligence Platform - Backend Application Package."""

import sys
from pathlib import Path

# Ensure the backend directory is in sys.path so 'from app...' resolves regardless of CWD
_backend_dir = str(Path(__file__).resolve().parent.parent)
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

__version__ = "1.0.0"

