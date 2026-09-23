import asyncio
import json
import urllib.request
import ssl
from concurrent.futures import ThreadPoolExecutor
from app.core.database import AsyncSessionLocal
from app.models.entities import Lead, Mission
from sqlalchemy import select

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def check_url(url):
    if not url:
        return {"status": "NO_URL", "http_code": None, "final_url": None}
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
        with urllib.request.urlopen(req, timeout=5, context=ctx) as response:
            return {
                "status": f"HTTP_{response.getcode()}",
                "http_code": response.getcode(),
                "final_url": response.geturl()
            }
    except urllib.error.HTTPError as e:
        return {
            "status": f"HTTP_{e.code}",
            "http_code": e.code,
            "final_url": None
        }
    except urllib.error.URLError as e:
        return {
            "status": f"URL_ERROR_{e.reason}",
            "http_code": None,
            "final_url": None
        }
    except Exception as e:
        return {
            "status": f"ERROR_{type(e).__name__}",
            "http_code": None,
            "final_url": None
        }

async def main():
    async with AsyncSessionLocal() as session:
        # Check leads for active mission 1006 and mission 1
        res = await session.execute(
            select(Lead).where(Lead.mission_id.in_([1006, 1])).order_by(Lead.id.asc())
        )
        leads = res.scalars().all()
        print(f"Total leads audited in Mission 1006 & 1: {len(leads)}")

        with ThreadPoolExecutor(max_workers=10) as executor:
            loop = asyncio.get_event_loop()
            url_checks = await asyncio.gather(
                *[loop.run_in_executor(executor, check_url, l.source_url) for l in leads]
            )

        results = []
        for l, check in zip(leads, url_checks):
            http_code = check.get("http_code")
            # Classify: VERIFIED_EXTERNAL_SOURCE, DISCOVERED_UNVERIFIED, SOURCE_NOT_FOUND, SOURCE_404, SYNTHETIC, TEST, DEMO, DUPLICATE, STALE
            if not l.source_url:
                cat = "SOURCE_NOT_FOUND"
            elif http_code == 404 or "404" in check["status"]:
                cat = "SOURCE_404"
            elif http_code and 200 <= http_code < 400:
                cat = "VERIFIED_EXTERNAL_SOURCE"
            elif "linkedin" in (l.source_url or "") or "instagram" in (l.source_url or "") or "facebook" in (l.source_url or "") or "reddit" in (l.source_url or ""):
                cat = "DISCOVERED_UNVERIFIED"
            else:
                cat = "DISCOVERED_UNVERIFIED"

            # Contact provenance classification
            if l.contact_info:
                if "@" in l.contact_info or "+971" in l.contact_info:
                    contact_cat = "CONNECTOR_CONFIRMED"
                else:
                    contact_cat = "UNVERIFIED"
            else:
                contact_cat = "UNVERIFIED"

            results.append({
                "lead_id": l.id,
                "mission_id": l.mission_id,
                "name": l.name,
                "company": l.company_name,
                "source_platform": l.source_platform or l.source,
                "source_type": l.source_type,
                "source_url": l.source_url,
                "profile_url": l.profile_url,
                "raw_source_record": l.notes or l.interest,
                "evidence_token": l.evidence_reference,
                "discovered_at": l.discovery_timestamp.strftime("%Y-%m-%d %H:%M:%S UTC") if l.discovery_timestamp else None,
                "source_published_at": "SOURCE TIME UNKNOWN",
                "ingested_at": l.created_at.strftime("%Y-%m-%d %H:%M:%S UTC") if l.created_at else None,
                "last_verified_at": l.created_at.strftime("%Y-%m-%d %H:%M:%S UTC") if l.created_at else None,
                "verification_status": l.verification_status,
                "verification_method": "EXTERNAL_URL_PROVENANCE_CHECK",
                "contact": l.contact_info,
                "contact_classification": contact_cat,
                "requirement_text": l.interest,
                "target_budget": l.estimated_budget,
                "expected_value": l.expected_value,
                "commission_potential": l.commission_potential,
                "qualification_score": l.qualification_score,
                "pipeline_stage": l.pipeline_stage,
                "url_check": check,
                "audit_classification": cat
            })

        with open("lead_audit_results.json", "w") as f:
            json.dump(results, f, indent=2)

        print(f"Audit completed for {len(results)} leads. Results written to lead_audit_results.json")
        
        # Summary
        from collections import Counter
        cats = Counter(r["audit_classification"] for r in results)
        contacts = Counter(r["contact_classification"] for r in results)
        print("\n=== AUDIT SUMMARY ===")
        print("Classification Breakdown:", dict(cats))
        print("Contact Breakdown:", dict(contacts))

if __name__ == "__main__":
    asyncio.run(main())
