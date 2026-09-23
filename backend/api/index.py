import os
import sys

# Ensure backend root is in sys.path for Vercel Python runtime
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from app.main import app, WHATSAPP_COEXISTENCE_HTML
from fastapi.responses import HTMLResponse

@app.get("/whatsapp-coexistence.html", response_class=HTMLResponse)
@app.get("/whatsapp-coexistence", response_class=HTMLResponse)
async def serve_whatsapp_coexistence():
    return HTMLResponse(content=WHATSAPP_COEXISTENCE_HTML, status_code=200, media_type="text/html")
