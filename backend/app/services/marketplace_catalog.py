from typing import Dict, Any, List, Optional
from pydantic import BaseModel

class ServiceOffering(BaseModel):
    id: str
    industry: str
    service_name: str
    headline: str
    description: str
    typical_price_aed: float
    min_price_aed: float
    max_price_aed: float
    upfront_deposit_pct: float  # e.g., 50.0 for 50% upfront
    delivery_hours: int
    sales_cycle_hours: int
    conversion_difficulty: str  # Very Low, Low, Medium, High
    success_probability: float  # 0.0 - 1.0
    zero_budget_viable: bool
    target_audiences: List[str]
    intent_keywords: List[str]
    deliverables: List[str]
    sample_pitch_hook: str

SERVICE_MARKETPLACE: Dict[str, Dict[str, Any]] = {
    "AI Agents": {
        "industry": "AI Agents",
        "category_badge": "RAPID_CASH_FLOW",
        "description": "Custom autonomous AI agents, WhatsApp sales bots, lead qualification pipelines, and internal company knowledge bases.",
        "services": [
            ServiceOffering(
                id="ai_agent_whatsapp_closer",
                industry="AI Agents",
                service_name="24/7 WhatsApp AI Lead Qualifier & Appointment Setter",
                headline="AI Sales Assistant that qualifies inbound leads & books meetings on WhatsApp in under 60 seconds",
                description="Custom-trained GPT/Claude agent connected directly to WhatsApp Business API and Google Calendar/CRM, handling objection handling and booking calls 24/7.",
                typical_price_aed=2500.0,
                min_price_aed=1500.0,
                max_price_aed=4500.0,
                upfront_deposit_pct=50.0,
                delivery_hours=24,
                sales_cycle_hours=12,
                conversion_difficulty="Low",
                success_probability=0.88,
                zero_budget_viable=True,
                target_audiences=["Real Estate Agencies", "Dental Clinics", "Car Rental Companies", "E-commerce Brands"],
                intent_keywords=["need a bot", "whatsapp automation", "qualify leads faster", "customer service bot", "ai agent"],
                deliverables=["Meta WhatsApp Cloud webhook setup", "Custom prompt & knowledge embeddings", "Google Sheets/CRM auto-sync", "30-day monitoring warranty"],
                sample_pitch_hook="Salam {name}, noticed your team receives high inbound WhatsApp inquiries. We build custom AI sales reps that answer questions in 5 seconds and double booked meetings. Can I deploy a 10-minute demo for your company today?"
            ),
            ServiceOffering(
                id="ai_agent_customer_support_kb",
                industry="AI Agents",
                service_name="Internal AI Knowledge Base & Automated Ticket Resolver",
                headline="AI Support Operator that resolves 70% of repetitive customer inquiries instantly",
                description="Embeds company SOPs, pricing sheets, and policies into a secure vector database with website widget and Slack/Discord sync.",
                typical_price_aed=3500.0,
                min_price_aed=2000.0,
                max_price_aed=6000.0,
                upfront_deposit_pct=50.0,
                delivery_hours=36,
                sales_cycle_hours=24,
                conversion_difficulty="Low",
                success_probability=0.84,
                zero_budget_viable=True,
                target_audiences=["SaaS Startups", "Logistics Firms", "Online Academies", "Legal/Accounting Firms"],
                intent_keywords=["support automation", "sop bot", "internal ai assistant", "knowledge base search"],
                deliverables=["Vector DB embedding of all SOPs", "Web embed widget", "Admin management dashboard", "Escalation to human logic"],
                sample_pitch_hook="Hi {name}, saw your post regarding scaling support volume. We can build and install a private AI support bot trained on your documentation in 36 hours for a flat fee. Open to a 5-minute preview?"
            )
        ]
    },
    "Website Development": {
        "industry": "Website Development",
        "category_badge": "HIGH_DEMAND_EXPRESS",
        "description": "High-converting modern landing pages, Next.js web applications, speed optimization, and full company revamps.",
        "services": [
            ServiceOffering(
                id="web_express_landing_page",
                industry="Website Development",
                service_name="24-Hour High-Converting Next.js / Tailwind Landing Page",
                headline="Lightning-fast, mobile-optimized landing page designed to turn cold traffic into paying customers",
                description="Ultra-modern responsive landing page built with Next.js, interactive animations, SEO meta tags, and automated lead capture form.",
                typical_price_aed=2000.0,
                min_price_aed=1200.0,
                max_price_aed=3500.0,
                upfront_deposit_pct=50.0,
                delivery_hours=24,
                sales_cycle_hours=8,
                conversion_difficulty="Low",
                success_probability=0.92,
                zero_budget_viable=True,
                target_audiences=["Founders Launching MVPs", "Local Dubai Businesses", "Consultants", "Event Organizers"],
                intent_keywords=["need a website", "landing page developer", "redesign my site", "nextjs developer", "fast turnaround website"],
                deliverables=["Next.js responsive code bundle", "Vercel 1-click deployment", "SEO & OpenGraph tags", "WhatsApp & Email lead webhook"],
                sample_pitch_hook="Hi {name}, I saw your launch announcement! We can build a state-of-the-art Next.js landing page with premium aesthetics within 24 hours for a flat 2,000 AED (50% on completion). Would you like to see 3 sample designs?"
            ),
            ServiceOffering(
                id="web_full_corporate_redesign",
                industry="Website Development",
                service_name="Corporate Website Modernization & Page Speed Sprint",
                headline="Transform an outdated website into a sleek, high-trust digital storefront with 99+ Google PageSpeed",
                description="Full website migration to modern tech stack with glassmorphic UI, dynamic copy, and interactive case study layouts.",
                typical_price_aed=4500.0,
                min_price_aed=3000.0,
                max_price_aed=8000.0,
                upfront_deposit_pct=50.0,
                delivery_hours=48,
                sales_cycle_hours=24,
                conversion_difficulty="Medium",
                success_probability=0.81,
                zero_budget_viable=True,
                target_audiences=["Established SMEs", "B2B Service Agencies", "Financial Consultancies", "Clinics"],
                intent_keywords=["rebrand website", "slow website", "modernize wordpress", "corporate site overhaul"],
                deliverables=["5-page custom Next.js site", "Interactive contact forms", "CMS integration", "Speed score 95+ guarantee"],
                sample_pitch_hook="Dear {name}, your business offers exceptional services, but your current website loading speed is over 4.2s on mobile. We can revamp it into a modern responsive portal in 48 hours. Let's do a quick audit call."
            )
        ]
    },
    "Automation Services": {
        "industry": "Automation Services",
        "category_badge": "FASTEST_TURNAROUND",
        "description": "No-code and low-code integrations connecting CRMs, payment gateways, Google Sheets, Make.com, Zapier, and n8n.",
        "services": [
            ServiceOffering(
                id="auto_crm_leads_sync",
                industry="Automation Services",
                service_name="End-to-End Inbound Lead Routing & CRM Sync Workflow",
                headline="Eliminate manual data entry by routing every lead from Meta/Google/Website directly to CRM & Telegram alerts in real-time",
                description="Builds bulletproof n8n / Make.com pipelines that capture leads, validate contact info, notify sales reps on Telegram, and send auto-replies.",
                typical_price_aed=1800.0,
                min_price_aed=1000.0,
                max_price_aed=3000.0,
                upfront_deposit_pct=50.0,
                delivery_hours=12,
                sales_cycle_hours=6,
                conversion_difficulty="Very Low",
                success_probability=0.94,
                zero_budget_viable=True,
                target_audiences=["Real Estate Brokers", "Gyms & Personal Trainers", "Marketing Agencies", "Solar Installers"],
                intent_keywords=["zapier expert", "make.com workflow", "n8n automation", "connect stripe to crm", "auto lead alert"],
                deliverables=["Make/n8n blueprint", "Telegram instant alert bot", "Google Sheet backup", "Error recovery fallback"],
                sample_pitch_hook="Hey {name}, saw you're managing lead intake manually across sheets. We can automate your entire lead intake to Telegram & CRM in under 12 hours for 1,500 AED. Can I show you a 2-minute video of how it works?"
            )
        ]
    },
    "Mobile Apps": {
        "industry": "Mobile Apps",
        "category_badge": "HIGH_TICKET_APP",
        "description": "Cross-platform mobile applications for iOS & Android built with React Native / Expo and Flutter.",
        "services": [
            ServiceOffering(
                id="app_mvp_sprint",
                industry="Mobile Apps",
                service_name="Cross-Platform Mobile MVP in 72 Hours (iOS & Android)",
                headline="Launch your functional mobile app concept with authentication, database, push notifications, and payment processing",
                description="Rapid mobile prototype built with React Native / Expo and Supabase, ready for TestFlight and internal beta testing.",
                typical_price_aed=6500.0,
                min_price_aed=4000.0,
                max_price_aed=12000.0,
                upfront_deposit_pct=50.0,
                delivery_hours=72,
                sales_cycle_hours=36,
                conversion_difficulty="Medium",
                success_probability=0.76,
                zero_budget_viable=True,
                target_audiences=["Startup Founders", "Service Aggregators", "Fitness Coaches", "Community Managers"],
                intent_keywords=["need a flutter dev", "react native developer", "build mobile app mvp", "ios app for my business"],
                deliverables=["Full React Native source code", "Supabase DB schema", "TestFlight build export", "App Store submission guide"],
                sample_pitch_hook="Hi {name}, loved your app concept! We specialize in 72-hour cross-platform MVP sprints for founders. We can deliver a working iOS/Android prototype with Auth and Payments this week. Let's review the scope."
            )
        ]
    },
    "Custom Software": {
        "industry": "Custom Software",
        "category_badge": "ENTERPRISE_TOOLING",
        "description": "Tailored internal operations dashboards, custom booking engines, and API middleware.",
        "services": [
            ServiceOffering(
                id="soft_internal_admin_portal",
                industry="Custom Software",
                service_name="Custom Internal Operations & Analytics Dashboard",
                headline="Centralized internal software tailored precisely to your operational workflow and KPI tracking",
                description="Full-stack FastAPI + React dashboard connecting multiple database sources, user permission roles, and PDF export reports.",
                typical_price_aed=5000.0,
                min_price_aed=3500.0,
                max_price_aed=15000.0,
                upfront_deposit_pct=50.0,
                delivery_hours=48,
                sales_cycle_hours=24,
                conversion_difficulty="Medium",
                success_probability=0.82,
                zero_budget_viable=True,
                target_audiences=["Logistics Companies", "Wholesale Distributors", "Real Estate Brokerages", "Private Clinics"],
                intent_keywords=["internal tool", "custom software developer", "fastapi backend", "need custom dashboard", "api integration"],
                deliverables=["FastAPI backend + React frontend", "Role-based auth", "Docker container", "Full database migration"],
                sample_pitch_hook="Dear {name}, replacing fragmented spreadsheets with a single custom operational dashboard saves 15+ hours weekly. We can build your internal portal in 48 hours. When are you free for a quick scoping call?"
            )
        ]
    },
    "SaaS Products": {
        "industry": "SaaS Products",
        "category_badge": "RECURRING_REVENUE",
        "description": "Turnkey micro-SaaS setups, white-label client management portals, and paid subscription systems.",
        "services": [
            ServiceOffering(
                id="saas_whitelabel_portal",
                industry="SaaS Products",
                service_name="White-Label Client Portal & Paid Subscription Membership",
                headline="Launch a branded customer dashboard with recurring Stripe subscriptions and secure client file vaults",
                description="Turnkey SaaS architecture with user authentication, Stripe Billing, customer onboarding wizard, and responsive UI.",
                typical_price_aed=3000.0,
                min_price_aed=1800.0,
                max_price_aed=5000.0,
                upfront_deposit_pct=50.0,
                delivery_hours=36,
                sales_cycle_hours=18,
                conversion_difficulty="Low",
                success_probability=0.86,
                zero_budget_viable=True,
                target_audiences=["Coaching Collectives", "Agency Owners", "Financial Analysts", "Newsletter Creators"],
                intent_keywords=["client portal", "stripe subscription setup", "whitelabel saas", "member dashboard"],
                deliverables=["Customer portal codebase", "Stripe webhook billing integration", "Magic link auth", "Admin analytics pane"],
                sample_pitch_hook="Hi {name}, if you're looking to monetize your client community with recurring subscriptions, we have a turnkey portal ready to deploy under your brand in 36 hours for 2,500 AED. Want to see the live demo?"
            )
        ]
    },
    "Marketing Services": {
        "industry": "Marketing Services",
        "category_badge": "OUTBOUND_GROWTH",
        "description": "Cold outreach infrastructure, B2B lead generation lists, high-converting offer copy, and funnel optimization.",
        "services": [
            ServiceOffering(
                id="mktg_cold_outreach_engine",
                industry="Marketing Services",
                service_name="B2B Cold Outreach Infrastructure & Lead Scraping Setup",
                headline="Automated outbound engine delivering 50+ verified decision-maker leads daily with inbox deliverability warming",
                description="Domain configuration (SPF, DKIM, DMARC), email warming pipeline, Apollo/LinkedIn lead scraper, and 3-step personalized copywriting.",
                typical_price_aed=2200.0,
                min_price_aed=1500.0,
                max_price_aed=4000.0,
                upfront_deposit_pct=50.0,
                delivery_hours=24,
                sales_cycle_hours=12,
                conversion_difficulty="Low",
                success_probability=0.89,
                zero_budget_viable=True,
                target_audiences=["B2B Agencies", "Consultants", "Software Companies", "Recruiters"],
                intent_keywords=["cold email setup", "b2b lead generation", "outreach agency", "need more b2b clients"],
                deliverables=["Secondary domain & DNS setup", "Scraped list of 500 verified B2B leads", "3 tailored outreach templates", "Campaign sequence scheduler"],
                sample_pitch_hook="Salam {name}, we build cold outreach engines that generate 10+ qualified sales calls monthly for B2B firms. We can configure your entire outbound system in 24 hours. Can I send you a 1-page breakdown?"
            )
        ]
    },
    "Real Estate": {
        "industry": "Real Estate",
        "category_badge": "MAX_COMMISSION",
        "description": "Dubai off-market distress resale matching, foreign buyer syndication dossiers, and 2% brokerage commission deal locks.",
        "services": [
            ServiceOffering(
                id="re_distress_deal_match",
                industry="Real Estate",
                service_name="Off-Market Distress Property Brokerage & Escrow Deal Match",
                headline="Connect urgent distress sellers (10-25% below OP) with pre-approved cash buyers to earn standard 2% brokerage fees",
                description="Deep portal and community scraping to match motivated relocation sellers with international family offices and cash investors.",
                typical_price_aed=40000.0,
                min_price_aed=10000.0,
                max_price_aed=150000.0,
                upfront_deposit_pct=0.0,  # 2% on closing
                delivery_hours=72,
                sales_cycle_hours=48,
                conversion_difficulty="Medium",
                success_probability=0.72,
                zero_budget_viable=True,
                target_audiences=["European & GCC Cash Investors", "Relocating High-Earners", "Family Offices"],
                intent_keywords=["dubai distress property", "cash buyer dubai", "below market real estate", "urgent seller dubai"],
                deliverables=["Form F / MOU draft coordination", "DLD Trustee Office settlement booking", "Title deed validation", "2% commission collection"],
                sample_pitch_hook="Salam {name}, we registered an off-market 17.5% below OP unit in Dubai Marina with motivated owner requiring 7-day closing. Would you like the title deed and ROI breakdown?"
            ),
            ServiceOffering(
                id="re_intelligence_dossier",
                industry="Real Estate",
                service_name="Private Dubai Real Estate Investment Intelligence Dossier",
                headline="Independent 15-page off-plan & resale cash flow audit for first-time foreign investors",
                description="Comprehensive ROI, developer escrow verification, and service charge feasibility report with 1-on-1 advisory session.",
                typical_price_aed=999.0,
                min_price_aed=499.0,
                max_price_aed=1999.0,
                upfront_deposit_pct=100.0,
                delivery_hours=12,
                sales_cycle_hours=8,
                conversion_difficulty="Very Low",
                success_probability=0.91,
                zero_budget_viable=True,
                target_audiences=["First-time foreign investors", "Relocating expatriates"],
                intent_keywords=["dubai investment guide", "independent property review", "roi report dubai"],
                deliverables=["15-page PDF Intelligence Dossier", "1-on-1 Zoom strategy session", "Curated developer comparison sheet"],
                sample_pitch_hook="Hi {name}, following your inquiry on Dubai property investments. We offer an independent, un-biased 15-page ROI and escrow audit for 999 AED before you commit any deposit. Let me know if you'd like a sample."
            )
        ]
    }
}

class MarketplaceService:
    """
    Catalog helper for retrieving services, searching by industry, or matching intent keywords.
    """
    @staticmethod
    def get_all_industries() -> List[str]:
        return list(SERVICE_MARKETPLACE.keys())

    @staticmethod
    def get_all_services() -> List[ServiceOffering]:
        all_svcs = []
        for cat in SERVICE_MARKETPLACE.values():
            all_svcs.extend(cat["services"])
        return all_svcs

    @staticmethod
    def get_services_by_industry(industry: str) -> List[ServiceOffering]:
        for ind_name, data in SERVICE_MARKETPLACE.items():
            if ind_name.lower() == industry.lower():
                return data["services"]
        return []

    @staticmethod
    def match_service_by_intent(text: str) -> Optional[ServiceOffering]:
        low = text.lower()
        all_svcs = MarketplaceService.get_all_services()
        best_match = None
        max_matches = 0
        for svc in all_svcs:
            matches = sum(1 for kw in svc.intent_keywords if kw in low)
            if matches > max_matches:
                max_matches = matches
                best_match = svc
        return best_match

marketplace_service = MarketplaceService()
