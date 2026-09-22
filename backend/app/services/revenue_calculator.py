import math
from typing import Dict, Any, List, Optional
from app.services.marketplace_catalog import marketplace_service, ServiceOffering

class RevenueCalculator:
    """
    Mathematical Revenue & Conversion Calculator:
    Evaluates Target Amount, Deadline, and Budget to compute required client volume,
    cash collection velocity, sales cycle feasibility, and down-payment structures.
    """
    def compute_revenue_options(
        self,
        target_amount: float,
        deadline_hours: int,
        budget: float = 0.0,
        currency: str = "AED"
    ) -> Dict[str, Any]:
        all_services = marketplace_service.get_all_services()
        evaluated_paths: List[Dict[str, Any]] = []

        for svc in all_services:
            unit_price = svc.typical_price_aed
            if unit_price <= 0:
                continue

            # Calculate clients needed to hit target
            required_clients = max(1, math.ceil(target_amount / unit_price))
            total_potential_revenue = required_clients * unit_price

            # Upfront cash factoring
            upfront_factor = svc.upfront_deposit_pct / 100.0 if svc.upfront_deposit_pct > 0 else 0.5
            upfront_cash_per_client = unit_price * upfront_factor
            total_immediate_deposit = required_clients * upfront_cash_per_client

            # Lead volume needed: assuming 15% conversion rate for hot outbound
            estimated_leads_needed = max(5, math.ceil(required_clients / 0.15))

            # Time calculation: Total turnaround = sales cycle + delivery time
            total_time_hours = svc.sales_cycle_hours + (svc.delivery_hours * min(2, required_clients))
            time_fit = total_time_hours <= deadline_hours

            # Feasibility score formula (0-100)
            feasibility = svc.success_probability * 100.0
            if not time_fit:
                feasibility -= min(40.0, ((total_time_hours - deadline_hours) / deadline_hours) * 50.0)
            if required_clients > 5:
                feasibility -= (required_clients - 5) * 4.0
            if budget == 0.0 and svc.zero_budget_viable:
                feasibility += 5.0
            feasibility = max(10.0, min(98.0, round(feasibility, 1)))

            evaluated_paths.append({
                "service_id": svc.id,
                "industry": svc.industry,
                "service_name": svc.service_name,
                "headline": svc.headline,
                "unit_price_aed": unit_price,
                "required_clients": required_clients,
                "upfront_deposit_pct": svc.upfront_deposit_pct,
                "immediate_cash_collected_aed": round(total_immediate_deposit, 2),
                "total_deal_value_aed": round(total_potential_revenue, 2),
                "estimated_leads_needed": estimated_leads_needed,
                "delivery_hours": svc.delivery_hours,
                "sales_cycle_hours": svc.sales_cycle_hours,
                "total_time_required_hours": total_time_hours,
                "fits_deadline": time_fit,
                "feasibility_score": feasibility,
                "sample_pitch_hook": svc.sample_pitch_hook
            })

        # Sort evaluated paths by highest feasibility score
        evaluated_paths.sort(key=lambda x: x["feasibility_score"], reverse=True)

        # Build 3 standard strategic packages
        # 1. Fastest Velocity Path (Fewest hours required)
        fastest_path = min(evaluated_paths, key=lambda x: x["total_time_required_hours"])
        # 2. Maximum Probability Path (Highest feasibility)
        highest_prob_path = evaluated_paths[0]
        # 3. Highest Ticket / Lowest Client Count Path
        lowest_client_path = min(evaluated_paths, key=lambda x: x["required_clients"])

        return {
            "target_amount": target_amount,
            "deadline_hours": deadline_hours,
            "budget": budget,
            "currency": currency,
            "optimal_recommendation": highest_prob_path,
            "fastest_velocity_path": fastest_path,
            "minimal_clients_path": lowest_client_path,
            "all_evaluated_paths": evaluated_paths
        }

revenue_calculator = RevenueCalculator()
