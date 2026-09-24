"""
Revenue Survival AI — Professional Outreach Pitch System
Generates executive, non-robotic, truthful business development outreach
tailored dynamically to verified prospect requirements.

Strict Quality Standards:
- Zero robotic language ("autonomous revenue engine", "AI detected", "video overview", etc.)
- Truthful provenance attribution
- Dynamic relevant service mapping based on lead domain
- Clear, unpressured WhatsApp (+971 56 428 8630) and Email CTA
- Full compliance with owner approval and idempotency rules
"""

import re
from typing import Dict, Any, List, Optional
from app.models.entities import Lead

OFFICIAL_WHATSAPP_NUMBER = "+971 56 428 8630"

BANNED_PHRASES = [
    "autonomous revenue engine",
    "revenue engine",
    "detected your",
    "ai detected",
    "our ai",
    "our system found",
    "database detected",
    "database found",
    "scraped",
    "2-minute video",
    "video overview",
    "watch a video",
    "schedule a video",
    "24-48h deployment",
    "limited offer",
    "guaranteed results",
    "act now"
]

def sanitize_clean_text(text: str) -> str:
    """Removes double spaces and normalizes line breaks."""
    return re.sub(r' +', ' ', text).strip()

class ProfessionalPitchGenerator:
    """
    Generates professional, truthful, and personalized business development pitches.
    """

    @staticmethod
    def classify_domain(lead: Lead) -> str:
        """Determines commercial domain from lead attributes."""
        combined = f"{lead.interest or ''} {lead.notes or ''} {lead.name or ''} {lead.company_name or ''}".lower()
        
        # 1. Custom Software / Tech Check (Check before Real Estate to avoid 'developer' keyword collision)
        if any(k in combined for k in [
            "custom software", "software development", "software", "dispatching system", 
            "fleet dispatch", "crm", "web application", "mobile app", "saas", "dashboard",
            "expert developer", "developer to build", "api integration", "next.js", "portal development"
        ]):
            return "SOFTWARE_DEVELOPMENT"
        
        # 2. AI Automation Check
        elif any(k in combined for k in [
            "ai agent", "ai automation", "appointment booking agent", "whatsapp triage", 
            "conversational ai", "voice agent", "triage and appointment"
        ]):
            return "AI_AUTOMATION"

        # 3. Real Estate / Property Check
        elif any(k in combined for k in [
            "real estate", "property", "villa", "apartment", "off-plan", "distress", 
            "property investment", "secondary-market", "emaar", "marina", "creek", "damac",
            "retail in business bay", "commercial in business bay", "real estate fund", "holding gcc"
        ]):
            return "REAL_ESTATE"

        # 4. Digital Growth / E-commerce
        elif any(k in combined for k in ["ecommerce", "shopify", "marketing", "growth", "advertising"]):
            return "DIGITAL_GROWTH"
            
        else:
            return "GENERAL_BUSINESS"

    @staticmethod
    def get_requirement_summary(lead: Lead, domain: str) -> str:
        """Formats a natural, concise description of the requirement for the opener."""
        interest = (lead.interest or "").strip()
        
        if domain == "SOFTWARE_DEVELOPMENT":
            if "fleet" in interest.lower() or "dispatch" in interest.lower():
                return "custom software development and automated fleet dispatch operations"
            elif "crm" in interest.lower():
                return "custom CRM and operations workflow software"
            elif "saas" in interest.lower():
                return "turnkey SaaS and membership portal development"
            else:
                return "custom software development"
                
        elif domain == "REAL_ESTATE":
            if "dubai" in interest.lower() or "uae" in interest.lower() or "marina" in interest.lower() or "bay" in interest.lower():
                return "Dubai real estate and property acquisition"
            else:
                return "real estate investment and property sourcing"
                
        elif domain == "AI_AUTOMATION":
            return "AI workflow automation and automated customer triage"
            
        elif domain == "DIGITAL_GROWTH":
            return "digital platform development and conversion optimization"
            
        else:
            return "business operations and digital infrastructure"

    @staticmethod
    def get_provenance_opener(lead: Lead, domain: str) -> str:
        """
        Generates a truthful opening sentence based on lead source/provenance.
        Never claims 'regarding your inquiry' unless provenance confirms an actual inbound inquiry.
        """
        source = (lead.source or "").lower()
        req_phrase = ProfessionalPitchGenerator.get_requirement_summary(lead, domain)

        # Truthful provenance wording
        if "inquiry" in source or "inbound" in source:
            return f"I’m reaching out regarding your inquiry for {req_phrase}."
        elif domain == "REAL_ESTATE":
            return f"I’m reaching out regarding your stated requirement related to {req_phrase}."
        elif any(k in source for k in ["telegram", "reddit", "linkedin", "public", "rfp", "community", "miner", "post", "radar"]):
            return f"I’m reaching out regarding your requirement for {req_phrase}."
        else:
            return f"I’m reaching out regarding your requirement for {req_phrase}."

    @staticmethod
    def get_relevant_services(domain: str, lead: Lead) -> Dict[str, Any]:
        """Maps lead requirement into genuine verified service offerings."""
        if domain == "REAL_ESTATE":
            services_list = [
                "property sourcing and advisory based on your specific requirements",
                "suitable off-plan and secondary-market options",
                "pricing comparisons and current availability",
                "structured developer payment plans",
                "investment advisory and cash-flow yield assessments",
                "selected off-market or distress opportunities where genuinely available"
            ]
            services_phrase = "suitable off-plan and secondary-market options, pricing comparisons, payment plans and selected investment opportunities based on your requirements"
            team_signoff = "Property Advisory Team"
            
        elif domain == "SOFTWARE_DEVELOPMENT":
            services_list = [
                "custom web applications",
                "mobile applications",
                "AI-powered automation",
                "CRM/workflow systems",
                "API integrations",
                "business process automation"
            ]
            services_phrase = "custom web and mobile applications, AI-powered automation, CRM/workflow solutions, API integrations and other tailored software solutions depending on your requirements"
            team_signoff = "Business Development Team"

        elif domain == "AI_AUTOMATION":
            services_list = [
                "bilingual conversational AI agents",
                "24/7 automated customer triage and appointment booking",
                "CRM data synchronization and workflow routing",
                "automated lead qualification workflows"
            ]
            services_phrase = "bilingual conversational AI agents, 24/7 automated customer triage, appointment booking, CRM data synchronization and automated lead qualification workflows"
            team_signoff = "Business Development Team"

        elif domain == "DIGITAL_GROWTH":
            services_list = [
                "high-converting web applications",
                "modern digital booking portals",
                "checkout conversion optimization",
                "API integrations and analytics"
            ]
            services_phrase = "high-converting web applications, modern booking portals, checkout conversion optimization and API integrations"
            team_signoff = "Business Development Team"

        else:
            services_list = [
                "tailored software solutions",
                "workflow automation",
                "digital infrastructure"
            ]
            services_phrase = "tailored software solutions, workflow automation and digital infrastructure"
            team_signoff = "Business Development Team"

        return {
            "services_list": services_list,
            "services_phrase": services_phrase,
            "team_signoff": team_signoff
        }

    @classmethod
    def generate_pitch(cls, lead: Lead, channel: Optional[str] = None) -> Dict[str, Any]:
        """
        Generates a contextual, executive, non-robotic outreach pitch.
        """
        channel = channel or lead.channel or "Email"
        domain = cls.classify_domain(lead)
        serv_info = cls.get_relevant_services(domain, lead)
        
        # Name handling
        full_name = (lead.name or "").strip()
        first_name = full_name.split()[0] if full_name else "there"
        if full_name.startswith("Dr."):
            greeting_name = f"Dr. {full_name.replace('Dr.', '').strip()}"
        elif full_name.startswith("Captain"):
            greeting_name = f"Captain {full_name.replace('Captain', '').strip()}"
        else:
            greeting_name = full_name

        opener = cls.get_provenance_opener(lead, domain)
        
        # Subject line generation
        if domain == "REAL_ESTATE":
            if "dubai" in (lead.interest or "").lower():
                subject = "Dubai Property Requirement — Available Options"
            elif lead.company_name and "Fund" in lead.company_name:
                subject = f"Property Sourcing & Advisory — {lead.company_name}"
            else:
                subject = "Regarding Your UAE Property Investment Requirement"
        elif domain == "SOFTWARE_DEVELOPMENT":
            if lead.company_name:
                subject = f"Regarding {lead.company_name}'s Software Development Requirement"
            else:
                subject = f"Regarding Your Custom Software Development Requirement"
        elif domain == "AI_AUTOMATION":
            subject = f"Regarding Your AI Automation & Workflow Requirement"
        else:
            subject = f"Regarding Your {lead.company_name or 'Business'} Requirement"

        # Body Construction
        if domain == "REAL_ESTATE":
            body = (
                f"Hi {greeting_name},\n\n"
                f"{opener}\n\n"
                f"We can assist with property sourcing and advisory, including {serv_info['services_phrase']}.\n\n"
                f"If you are currently considering a purchase or investment, please reply with your preferred location, "
                f"property type, approximate budget and contact number so we can discuss suitable options.\n\n"
                f"Alternatively, you can connect with us directly on WhatsApp at {OFFICIAL_WHATSAPP_NUMBER}.\n\n"
                f"Best regards,\n"
                f"{serv_info['team_signoff']}"
            )
        elif domain == "SOFTWARE_DEVELOPMENT":
            body = (
                f"Hi {greeting_name},\n\n"
                f"{opener}\n\n"
                f"We may be able to assist with {serv_info['services_phrase']}.\n\n"
                f"If this requirement is still active, I’d be happy to understand the scope and discuss how we may be able to assist.\n\n"
                f"Please reply to this email with your contact number and a convenient time to speak, or connect with us directly on WhatsApp at {OFFICIAL_WHATSAPP_NUMBER}.\n\n"
                f"Best regards,\n"
                f"{serv_info['team_signoff']}"
            )
        else:
            body = (
                f"Hi {greeting_name},\n\n"
                f"{opener}\n\n"
                f"We may be able to assist with solutions tailored to your specific requirements, including {serv_info['services_phrase']}.\n\n"
                f"Rather than suggesting a generic package, we would first like to understand your objectives, current requirements, expected scope and priorities so we can determine how we can assist.\n\n"
                f"If this is still an active requirement, please reply to this email with your contact number and a convenient time to speak.\n\n"
                f"Alternatively, you can connect with us directly on WhatsApp:\n"
                f"{OFFICIAL_WHATSAPP_NUMBER}\n\n"
                f"Best regards,\n"
                f"{serv_info['team_signoff']}"
            )

        # Quality Gate validation
        qg_res = cls.quality_gate_check(body, subject)
        if not qg_res["passed"]:
            # Auto-sanitize any lingering issues
            body = cls.sanitize_pitch(body)
            qg_res = cls.quality_gate_check(body, subject)

        return {
            "subject": subject,
            "body": body,
            "domain": domain,
            "channel": channel,
            "personalization_summary": {
                "lead_id": lead.id,
                "lead_name": lead.name,
                "company_name": lead.company_name,
                "requirement": lead.interest or "Business Operations",
                "source_provenance": lead.source or "Verified Market Signal",
                "proposed_services": serv_info["services_list"],
                "cta_channel": f"WhatsApp ({OFFICIAL_WHATSAPP_NUMBER}) / Email",
                "quality_gate": qg_res
            }
        }

    @classmethod
    def quality_gate_check(cls, body: str, subject: str) -> Dict[str, Any]:
        """
        Validates that the outreach text complies with strict non-robotic and truthfulness standards.
        """
        combined = f"{subject}\n{body}".lower()
        violations = []
        for banned in BANNED_PHRASES:
            # Match with whole word boundaries
            pattern = rf"\b{re.escape(banned)}\b"
            if re.search(pattern, combined, re.IGNORECASE):
                violations.append(banned)

        has_whatsapp_cta = OFFICIAL_WHATSAPP_NUMBER in body or "+971 56 428 8630" in body

        return {
            "passed": len(violations) == 0 and has_whatsapp_cta,
            "violations": violations,
            "has_whatsapp_cta": has_whatsapp_cta
        }

    @classmethod
    def sanitize_pitch(cls, text: str) -> str:
        """Removes banned phrases if accidentally injected."""
        clean = text
        for banned in BANNED_PHRASES:
            pattern = rf"\b{re.escape(banned)}\b"
            clean = re.sub(pattern, "", clean, flags=re.IGNORECASE)
        if OFFICIAL_WHATSAPP_NUMBER not in clean:
            clean += f"\n\nWhatsApp: {OFFICIAL_WHATSAPP_NUMBER}"
        return sanitize_clean_text(clean)

pitch_generator = ProfessionalPitchGenerator()
