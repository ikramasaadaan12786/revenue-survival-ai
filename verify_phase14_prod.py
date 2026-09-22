import urllib.request
import re

url = 'https://frontend-one-eta-44.vercel.app'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, timeout=10) as resp:
    html = resp.read().decode('utf-8')

scripts = re.findall(r'src="([^"]+\.js)"', html)
print(f"Total script bundles loaded: {len(scripts)}")
found_p14 = False
for s in scripts:
    s_url = s if s.startswith('http') else 'https://frontend-one-eta-44.vercel.app' + s
    try:
        with urllib.request.urlopen(s_url, timeout=10) as js_resp:
            js = js_resp.read().decode('utf-8')
            if 'REVENUE EXECUTION WAR ROOM' in js or 'Hot Buyer Terminal' in js or 'Deal Room CRM' in js:
                print(f"[SUCCESS] Found Phase 14 Execution Engine in: {s_url}")
                found_p14 = True
    except Exception as e:
        print(f"Error reading {s_url}: {e}")

print(f"Phase 14 Production Verification Status: {'PASSED' if found_p14 else 'FAILED'}")
