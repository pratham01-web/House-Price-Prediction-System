"""
House Price Intelligence Platform - Unified Local Development Launcher
Launches both the FastAPI ML Backend (port 8000) and Next.js Frontend (port 3000).
"""

import os
import sys
import subprocess
import time
import signal
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent

# Locate Python in virtual environment if available
venv_python_win = ROOT_DIR / ".venv" / "Scripts" / "python.exe"
venv_python_nix = ROOT_DIR / ".venv" / "bin" / "python"

if venv_python_win.exists():
    PYTHON_EXE = str(venv_python_win)
elif venv_python_nix.exists():
    PYTHON_EXE = str(venv_python_nix)
else:
    PYTHON_EXE = sys.executable

def main():
    print("=" * 70)
    print("  House Price Intelligence & Prediction Platform (RealEstateIQ)")
    print("=" * 70)
    print(f"[*] Workspace Root: {ROOT_DIR}")
    print(f"[*] Python Executable: {PYTHON_EXE}")

    # Set environment variables
    env = os.environ.copy()
    backend_dir = str(ROOT_DIR / "backend")
    env["PYTHONPATH"] = f"{backend_dir}{os.pathsep}{env.get('PYTHONPATH', '')}"

    processes = []

    try:
        # 1. Start FastAPI Backend
        print("\n[1/2] Starting FastAPI Backend on http://localhost:8000...")
        backend_proc = subprocess.Popen(
            [
                PYTHON_EXE,
                "-m",
                "uvicorn",
                "app.main:app",
                "--app-dir",
                "backend",
                "--host",
                "127.0.0.1",
                "--port",
                "8000",
                "--reload",
            ],
            cwd=str(ROOT_DIR),
            env=env,
        )
        processes.append(("FastAPI Backend", backend_proc))

        # Give backend a moment to initialize
        time.sleep(2)

        # 2. Start Next.js Frontend
        print("[2/2] Starting Next.js Frontend on http://localhost:3000...")
        npm_cmd = "npm.cmd" if sys.platform == "win32" else "npm"
        frontend_proc = subprocess.Popen(
            [npm_cmd, "run", "dev"],
            cwd=str(ROOT_DIR / "frontend"),
            env=env,
        )
        processes.append(("Next.js Frontend", frontend_proc))

        print("\n" + "=" * 70)
        print("  ✓ RealEstateIQ Platform is running successfully!")
        print("  - Frontend UI:    http://localhost:3000")
        print("  - Backend API:   http://localhost:8000")
        print("  - Swagger Docs:  http://localhost:8000/docs")
        print("  - Health Check:  http://localhost:8000/api/v1/health")
        print("=" * 70)
        print("Press Ctrl+C to terminate both servers.\n")

        # Monitor processes
        while True:
            for name, proc in processes:
                poll = proc.poll()
                if poll is not None:
                    print(f"\n[!] Warning: {name} exited with return code {poll}.")
                    return
            time.sleep(1)

    except KeyboardInterrupt:
        print("\n[*] Stopping all platform processes...")
    finally:
        for name, proc in processes:
            if proc.poll() is None:
                print(f"[*] Terminating {name}...")
                proc.terminate()
                try:
                    proc.wait(timeout=3)
                except subprocess.TimeoutExpired:
                    proc.kill()
        print("[*] All services stopped.")

if __name__ == "__main__":
    main()
