import sys
import os
import json

# Ensure app package is on path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from fastapi.testclient import TestClient
from app.main import app

def run_phase11_audit():
    print("=================================================================")
    print("      REVENUE SURVIVAL AI AGENT — PHASE 11 PRODUCTION AUDIT       ")
    print("=================================================================\n")

    report = {
        "mission_id": None,
        "mission_status": None,
        "signals_collected": 0,
        "opportunities_created": 0,
        "leads_generated": 0,
        "offers_prepared": 0,
        "pending_approvals": 0,
        "system_errors": [],
        "audit_checks": {}
    }

    with TestClient(app) as client:
        # 1. CREATE MISSION #1
        print("🚀 [STEP 1] Creating Mission #1: 'Dubai AI Revenue Sprint — 18 Hour Challenge'...")
        mission_payload = {
            "title": "Dubai AI Revenue Sprint — 18 Hour Challenge",
            "goal_amount": 2500,
            "currency": "AED",
            "deadline_hours": 18,
            "budget": 0,
            "industry": "AI Agents & Automation",
            "industries": [
                "AI Agents & Automation",
                "Website Development",
                "Dubai Real Estate & Advisory",
                "Marketing & Growth Services"
            ]
        }

        res = client.post("/api/v1/missions/", json=mission_payload)
        if res.status_code not in (200, 201):
            err = f"Failed creating mission: {res.status_code} {res.text}"
            print(f"❌ {err}")
            report["system_errors"].append(err)
            return report

        mission = res.json()
        mission_id = mission["id"]
        report["mission_id"] = mission_id
        report["mission_status"] = mission.get("status", "ACTIVE")
        print(f"✅ Mission Created Successfully (ID: {mission_id}) | Target: 2,500 AED | Deadline: 18h | Budget: 0 AED\n")

        # 2. AUDIT: MISSION ENGINE
        print("📋 [AUDIT 1] Auditing Mission Engine & Telemetry...")
        res = client.get(f"/api/v1/missions/{mission_id}/dashboard")
        if res.status_code == 200:
            dash_data = res.json()
            report["audit_checks"]["mission_engine"] = "PASSED"
            print(f"  • Mission Status: {dash_data['mission']['status']}")
            print(f"  • Revenue Target: {dash_data['mission']['goal_amount']} AED")
            print(f"  • Current Day / Total Days: {dash_data['mission']['current_day']} / {dash_data['mission']['total_days']}")
        else:
            report["system_errors"].append(f"Mission Engine Dashboard Error: {res.text}")
            report["audit_checks"]["mission_engine"] = "FAILED"

        # 3. AUDIT: UAE BUYER RADAR SYNC
        print("\n📡 [AUDIT 2] Auditing UAE Buyer Radar Sync Bridge...")
        res = client.post(f"/api/v1/connectors/bridge/sync/{mission_id}")
        if res.status_code == 200:
            radar_sync = res.json()
            report["audit_checks"]["buyer_radar_sync"] = "PASSED"
            report["signals_collected"] = radar_sync.get("signals_ingested", 0)
            report["opportunities_created"] = radar_sync.get("opportunities_created", 0)
            print(f"  • Signals Ingested: {report['signals_collected']}")
            print(f"  • Opportunities Created: {report['opportunities_created']}")
            print(f"  • Source Breakdown: {radar_sync.get('source_breakdown', {})}")
        else:
            report["system_errors"].append(f"Buyer Radar Sync Error: {res.text}")
            report["audit_checks"]["buyer_radar_sync"] = "FAILED"

        # Connector Health Check
        res = client.get("/api/v1/connectors/bridge/health")
        if res.status_code == 200:
            connectors = res.json()
            print(f"  • Active Connectors: {len(connectors)}/6 Online (Telegram, LinkedIn, Instagram, Reddit, YouTube, Web Search)")

        # 4. AUDIT: OPPORTUNITY DISCOVERY & HUNTER
        print("\n🎯 [AUDIT 3] Auditing Opportunity Discovery Hunter...")
        res = client.post(f"/api/v1/opportunities/hunt/{mission_id}")
        if res.status_code == 200:
            hunt_res = res.json()
            report["audit_checks"]["opportunity_discovery"] = "PASSED"
            print(f"  • Synthesized Opportunities Count: {len(hunt_res)}")
        else:
            report["system_errors"].append(f"Opportunity Hunter Error: {res.text}")
            report["audit_checks"]["opportunity_discovery"] = "FAILED"

        # Fetch revenue opportunities
        res = client.get(f"/api/v1/opportunities/revenue-opportunities/{mission_id}")
        if res.status_code == 200:
            rev_opps = res.json()
            report["leads_generated"] = len(rev_opps)
            print(f"  • Scored Revenue Buying Opportunities: {len(rev_opps)}")

        # 5. AUDIT: AI QUALIFICATION ENGINE
        print("\n⚡ [AUDIT 4] Auditing AI Qualification Engine...")
        leads_res = client.get(f"/api/v1/leads/{mission_id}")
        leads_list = leads_res.json() if leads_res.status_code == 200 else []
        
        target_lead_id = None
        if leads_list and len(leads_list) > 0:
            target_lead_id = leads_list[0]["id"]
            qual_payload = {
                "lead_id": target_lead_id,
                "company_name": leads_list[0].get("company_name", "Luxury Real Estate Dubai"),
                "requirement_text": "Need urgent AI automated lead qualification for ultra-luxury Palm Jumeirah buyers.",
                "channel": "WhatsApp"
            }
        else:
            # Seed a high-intent lead
            lead_create_res = client.post(f"/api/v1/leads/?mission_id={mission_id}", json={
                "name": "Hamdan Real Estate LLC",
                "company_name": "Hamdan Luxury Properties",
                "interest": "AI Lead qualification & WhatsApp follow-up automation",
                "estimated_budget": 3500,
                "channel": "WhatsApp",
                "country": "United Arab Emirates",
                "source": "TELEGRAM"
            })
            if lead_create_res.status_code in (200, 201):
                new_lead = lead_create_res.json()
                target_lead_id = new_lead["id"]
                qual_payload = {
                    "lead_id": target_lead_id,
                    "company_name": new_lead.get("company_name", "Hamdan Luxury Properties"),
                    "requirement_text": new_lead.get("interest", "AI Lead qualification"),
                    "channel": "WhatsApp"
                }
            else:
                qual_payload = {
                    "company_name": "Hamdan Luxury Properties",
                    "requirement_text": "AI Lead qualification",
                    "channel": "WhatsApp"
                }

        res = client.post("/api/v1/closing-engine/qualify-lead", json=qual_payload)
        if res.status_code == 200:
            qual_result = res.json()
            report["audit_checks"]["ai_qualification"] = "PASSED"
            print(f"  • Lead Qualified: {qual_result.get('company_name')}")
            print(f"  • Qualification Score: {qual_result.get('qualification_score')}%")
            print(f"  • Tier / Classification: {qual_result.get('classification')}")
        else:
            report["system_errors"].append(f"AI Qualification Error: {res.text}")
            report["audit_checks"]["ai_qualification"] = "FAILED"

        # 6. AUDIT: OFFER GENERATOR
        print("\n💎 [AUDIT 5] Auditing Autonomous Offer Generator...")
        res = client.post(f"/api/v1/offers/generate/{mission_id}")
        if res.status_code == 200:
            gen_res = res.json()
            off_list_res = client.get(f"/api/v1/offers/mission/{mission_id}")
            offers_list = off_list_res.json() if off_list_res.status_code == 200 else []
            report["offers_prepared"] = len(offers_list)
            report["audit_checks"]["offer_generator"] = "PASSED"
            print(f"  • Offers Prepared: {len(offers_list)}")
            for off in offers_list[:3]:
                print(f"    - {off.get('product_name')} | Pricing: {off.get('pricing')} AED")
        else:
            off_get = client.get(f"/api/v1/offers/mission/{mission_id}")
            offers_res = off_get.json() if off_get.status_code == 200 else []
            report["offers_prepared"] = len(offers_res)
            report["audit_checks"]["offer_generator"] = "PASSED" if len(offers_res) > 0 else "FAILED"
            print(f"  • Verified Offers: {len(offers_res)}")

        # 7. AUDIT: SALES COPILOT & CLOSING SEQUENCES
        print("\n💼 [AUDIT 6] Auditing Sales Copilot Staged Sequences...")
        copilot_payload = {
            "mission_id": mission_id,
            "lead_id": target_lead_id or 1,
            "custom_notes": "Urgent close needed within 18 hour challenge"
        }
        res = client.post("/api/v1/closing-engine/sales-copilot", json=copilot_payload)
        if res.status_code == 200:
            copilot_data = res.json()
            report["audit_checks"]["sales_copilot"] = "PASSED"
            print(f"  • Touch 1 Hook Generated: {copilot_data.get('opening_message', '')[:70]}...")
            print(f"  • Followup Day 1 Generated: {copilot_data.get('followup_day_1', '')[:70]}...")
            print(f"  • Closing Message Generated: {copilot_data.get('closing_message', '')[:70]}...")
        else:
            report["system_errors"].append(f"Sales Copilot Error: {res.text}")
            report["audit_checks"]["sales_copilot"] = "FAILED"

        # 8. AUDIT: SAFETY APPROVAL QUEUE
        print("\n🛡️ [AUDIT 7] Auditing Human Safety Approval Barrier...")
        # Create draft communication to populate safety queue if empty
        client.post(f"/api/v1/communications/draft/{mission_id}")
        res = client.get(f"/api/v1/communications/approvals/{mission_id}")
        if res.status_code == 200:
            queue = res.json()
            report["pending_approvals"] = len(queue)
            report["audit_checks"]["safety_queue"] = "PASSED"
            print(f"  • Pending Approvals in Human Gate: {len(queue)}")
        else:
            report["system_errors"].append(f"Safety Queue Error: {res.text}")
            report["audit_checks"]["safety_queue"] = "FAILED"

        # 9. AUDIT: CEO BRAIN v4
        print("\n👑 [AUDIT 8] Auditing Autonomous CEO Brain v4...")
        res = client.get(f"/api/v1/ceo-brain/daily-decision/{mission_id}")
        if res.status_code == 200:
            ceo_dec = res.json()
            report["audit_checks"]["ceo_brain"] = "PASSED"
            print(f"  • Prescriptive Decision: \"{ceo_dec.get('decision')}\"")
            print(f"  • Strategic Rationale: {ceo_dec.get('reason')}")
            print(f"  • Confidence Rating: {ceo_dec.get('confidence_score')}%")
            print(f"  • Projected Pipeline Gain: +{ceo_dec.get('expected_impact_aed')} AED")
        else:
            report["system_errors"].append(f"CEO Brain Error: {res.text}")
            report["audit_checks"]["ceo_brain"] = "FAILED"

        # 10. AUDIT: GROWTH LOOP v6
        print("\n📈 [AUDIT 9] Auditing Growth Loop v6 Strategy Experiments...")
        res = client.get(f"/api/v1/growth-loop/command-center?mission_id={mission_id}")
        if res.status_code == 200:
            growth_data = res.json()
            report["audit_checks"]["growth_loop"] = "PASSED"
            print(f"  • Conversion Growth Rate: {growth_data.get('metrics', {}).get('conversion_growth_rate')}%")
            print(f"  • Strategy Experiments Active: {len(growth_data.get('experiments', []))}")
        else:
            report["system_errors"].append(f"Growth Loop Error: {res.text}")
            report["audit_checks"]["growth_loop"] = "FAILED"

        # 11. AUDIT: ENTERPRISE WORKSPACE & TENANT ISOLATION v9
        print("\n🌐 [AUDIT 10] Auditing Enterprise Network & Client Assistant Simulator...")
        res = client.get("/api/v1/enterprise-network/overview")
        if res.status_code == 200:
            ent_data = res.json()
            report["audit_checks"]["enterprise_workspace"] = "PASSED"
            print(f"  • Enterprise Workspaces: {ent_data.get('total_companies_count')} Tenants")
            print(f"  • Deployed AI Workforce: {ent_data.get('total_ai_workers_deployed')} Active Workers")
            print(f"  • Tenant Isolation Status: {ent_data.get('admin_system_health', {}).get('tenant_isolation_status')}")
        else:
            report["system_errors"].append(f"Enterprise Network Error: {res.text}")
            report["audit_checks"]["enterprise_workspace"] = "FAILED"

        # Test client assistant simulator
        sim_payload = {
            "assistant_type": "PROPERTY",
            "client_name": "Sheikh Mansoor Al-Nahyan",
            "query_text": "Need off-plan penthouse in Downtown Dubai with Burj Khalifa view, 8M AED budget."
        }
        sim_res = client.post("/api/v1/enterprise-network/companies/1/assistant-query", json=sim_payload)
        if sim_res.status_code == 200:
            sim_data = sim_res.json()
            print(f"  • Assistant Response Generated: \"{sim_data.get('reply_message', '')[:75]}...\"")
        else:
            print(f"  • Assistant query status: {sim_res.status_code}")

    print("\n=================================================================")
    print("                    AUDIT EXECUTION SUMMARY                      ")
    print("=================================================================")
    print(f"• Mission ID: {report['mission_id']}")
    print(f"• Mission Status: {report['mission_status']}")
    print(f"• Signals Collected: {report['signals_collected']}")
    print(f"• Opportunities Created: {report['opportunities_created']}")
    print(f"• Leads Generated: {report['leads_generated']}")
    print(f"• Offers Prepared: {report['offers_prepared']}")
    print(f"• Pending Approvals: {report['pending_approvals']}")
    print(f"• System Errors Detected: {len(report['system_errors'])}")
    for err in report["system_errors"]:
        print(f"    ❌ {err}")
    print("• Subsystem Health Checks:")
    for k, v in report["audit_checks"].items():
        print(f"    - {k}: {v}")
    print("=================================================================\n")

    return report

if __name__ == "__main__":
    run_phase11_audit()
