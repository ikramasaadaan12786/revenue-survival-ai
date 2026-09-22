from typing import Dict, Any, Optional

MESSAGE_TEMPLATES = {
    "OFF_MARKET_DISTRESS_ALERT": {
        "channel": "WhatsApp",
        "category": "MARKET_OPPORTUNITY",
        "template": (
            "Salam {name}, this is Tariq from the Private Client Desk in Dubai. "
            "We just registered an off-market distress opportunity in {location} ({project_name}) "
            "priced at {distress_price} AED ({discount_pct}% below OP). The owner is relocating and requires 7-day settlement. "
            "Would you like the full DD dossier and title verification sheet sent over WhatsApp?"
        ),
        "required_variables": ["name", "location", "project_name", "distress_price", "discount_pct"]
    },
    "VIP_BUYER_BRIEF": {
        "channel": "WhatsApp",
        "category": "INVESTMENT_MATCH",
        "template": (
            "Hi {name}, following up on your inquiry for prime {target_area} real estate in Dubai. "
            "We have screened 3 vetted cash-flowing units matching your {budget_aed} AED parameter, "
            "delivering 9.2% net ROI with direct developer escrow protection. "
            "Let me know if you have 5 minutes today for a quick walkthrough."
        ),
        "required_variables": ["name", "target_area", "budget_aed"]
    },
    "EXCLUSIVE_MOU_DEPOSIT_URGENCY": {
        "channel": "WhatsApp",
        "category": "DEAL_CLOSING",
        "template": (
            "{name}, urgent update: Our pre-approved European buyer has signed the Form F offer at {offer_price} AED. "
            "To secure the 10% escrow deposit cheque before Friday cutoff, please confirm your Emirates ID copy & title deed. "
            "Can we finalize the agreement today?"
        ),
        "required_variables": ["name", "offer_price"]
    },
    "DIRECT_CONSULTING_ACCELERATOR": {
        "channel": "Email",
        "category": "HIGH_TICKET_SERVICE",
        "subject": "Private Brief: Dubai Market Intelligence & Direct Acquisition Mandate",
        "template": (
            "Dear {name},\n\n"
            "I noticed your recent expansion into the UAE market. "
            "We specialize in rapid Golden Visa portfolio structuring and off-market prime property syndications.\n\n"
            "We have prepared a customized 1-page feasibility and cash yield matrix for your entity.\n\n"
            "Are you open to a brief 10-minute executive briefing this week?\n\n"
            "Warm regards,\n"
            "Revenue Survival Advisory Group\nDIFC, Dubai, UAE"
        ),
        "required_variables": ["name"]
    }
}

class TemplateEngine:
    """
    Renders message templates with variable substitution and compliance validation.
    """
    @staticmethod
    def render(template_name: str, variables: Dict[str, Any]) -> Dict[str, str]:
        if template_name not in MESSAGE_TEMPLATES:
            # Fallback custom template
            return {
                "body": variables.get("body", "Hello from Revenue Survival Advisory"),
                "subject": variables.get("subject", "Dubai Opportunity Brief"),
                "channel": variables.get("channel", "WhatsApp")
            }
        
        tpl = MESSAGE_TEMPLATES[template_name]
        body = tpl["template"]
        for key in tpl.get("required_variables", []):
            placeholder = f"{{{key}}}"
            val = str(variables.get(key, f"[{key}]"))
            body = body.replace(placeholder, val)

        subject = tpl.get("subject", None)
        if subject:
            for key in tpl.get("required_variables", []):
                placeholder = f"{{{key}}}"
                val = str(variables.get(key, f"[{key}]"))
                subject = subject.replace(placeholder, val)

        return {
            "body": body,
            "subject": subject,
            "channel": tpl.get("channel", "WhatsApp"),
            "category": tpl.get("category", "GENERAL")
        }

template_engine = TemplateEngine()
