import os
import sys

# Ensure backend folder is in sys.path
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_dir = os.path.join(root_dir, "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from app.main import app, WHATSAPP_COEXISTENCE_HTML
from fastapi.responses import HTMLResponse

@app.get("/whatsapp-coexistence.html", response_class=HTMLResponse)
@app.get("/whatsapp-coexistence", response_class=HTMLResponse)
async def serve_whatsapp_coexistence():
    return HTMLResponse(content=WHATSAPP_COEXISTENCE_HTML, status_code=200, media_type="text/html")
