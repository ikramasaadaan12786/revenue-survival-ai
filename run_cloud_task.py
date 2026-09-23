"""
Root entrypoint for GitHub Actions Autonomous Workflows.
Invokes app.cli.autonomous_runner with task argument.
"""

import os
import sys

# Ensure backend root is in sys.path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "backend"))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app.cli.autonomous_runner import main
import asyncio

if __name__ == "__main__":
    asyncio.run(main())
