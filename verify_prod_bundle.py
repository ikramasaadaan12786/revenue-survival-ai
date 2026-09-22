import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

import urllib.request
import re

url = "https://frontend-one-eta-44.vercel.app"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
html = urllib.request.urlopen(req).read().decode("utf-8")

scripts = re.findall(r'src="(/_next/static/[^"]+)"', html)
print(f"Total script bundles found: {len(scripts)}")

found_marker = False
found_old_482 = False

for s in scripts:
    script_url = url + s
    s_req = urllib.request.Request(script_url, headers={"User-Agent": "Mozilla/5.0"})
    content = urllib.request.urlopen(s_req).read().decode("utf-8")
    if "LUXURY V2 ACTIVE" in content:
        print(f"[FOUND] 'LUXURY V2 ACTIVE' in bundle: {s}")
        found_marker = True
    if "482,500" in content:
        print(f"[OLD DETECTED] '482,500' in bundle: {s}")
        found_old_482 = True

print(f"\nProduction Live Summary:")
print(f"• 'LUXURY V2 ACTIVE' Verified in Production Bundle: {found_marker}")
print(f"• Old Demo Numbers (482,500) in Production Bundle: {found_old_482}")
