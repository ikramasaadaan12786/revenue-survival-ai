from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    email: str
    name: str
    role: Optional[str] = "operator"

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True


# Revenue Opportunity Schemas
class RevenueOpportunityBase(BaseModel):
    name: str
    company: Optional[str] = None
    industry: str
    source: str = "Direct Search"
    requirement: str
    estimated_value: float = 0.0
    urgency_score: float = 85.0
    conversion_score: float = 85.0
    status: str = "QUALIFIED"

class RevenueOpportunityCreate(RevenueOpportunityBase):
    mission_id: int

class RevenueOpportunityResponse(RevenueOpportunityBase):
    id: int
    mission_id: int
    created_at: datetime
    class Config:
        from_attributes = True


# Opportunity Schemas
class OpportunityBase(BaseModel):
    problem: str
    target_customer: str
    market: str
    offer_idea: str
    price_estimate: float = 0.0
    difficulty: str = "Low"
    confidence_score: float = 88.0
    sources: List[str] = []
    status: str = "DISCOVERED"

class OpportunityCreate(OpportunityBase):
    mission_id: int

class OpportunityResponse(OpportunityBase):
    id: int
    mission_id: int
    created_at: datetime
    class Config:
        from_attributes = True


# Offer Schemas
class OfferBase(BaseModel):
    product_name: str
    description: str
    pricing: float
    currency: str = "AED"
    target_audience: str
    landing_page_copy: Optional[str] = None
    sales_message: Optional[str] = None
    marketing_angle: Optional[str] = None
    faq: List[Dict[str, str]] = []
    status: str = "DRAFT"

class OfferCreate(OfferBase):
    mission_id: int
    opportunity_id: Optional[int] = None

class OfferResponse(OfferBase):
    id: int
    mission_id: int
    opportunity_id: Optional[int] = None
    created_at: datetime
    class Config:
        from_attributes = True


# Lead Schemas (8-Stage CRM: NEW, AI_VERIFIED, CONTACT_READY, CONTACTED, REPLIED, MEETING, DEAL, COMMISSION)
class LeadBase(BaseModel):
    name: str
    source: str = "Telegram Public"
    country: str = "United Arab Emirates"
    interest: Optional[str] = None
    intent_score: str = "Warm"  # Cold, Warm, Qualified, Hot
    contact_info: Optional[str] = None
    channel: str = "WhatsApp"
    status: str = "NEW"
    expected_value: float = 0.0
    commission_potential: float = 0.0
    notes: Optional[str] = None

class LeadCreate(LeadBase):
    mission_id: int
    offer_id: Optional[int] = None

class LeadResponse(LeadBase):
    id: int
    mission_id: int
    offer_id: Optional[int] = None
    created_at: datetime
    class Config:
        from_attributes = True


# Real Estate Deal Schemas
class RealEstateDealBase(BaseModel):
    deal_type: str = "DISTRESS"  # BUYER_NEED, SELLER_OPPORTUNITY, DISTRESS
    title: str
    developer: Optional[str] = None
    location: str
    original_price: float = 0.0
    deal_price: float = 0.0
    commission_amount: float = 0.0
    projected_net_roi: str = "8.5%"
    payment_plan: Optional[str] = None
    buyer_profile_match: Optional[str] = None
    match_score: float = 90.0
    contact_name: Optional[str] = None
    contact_phone: Optional[str] = None
    status: str = "ACTIVE"

class RealEstateDealCreate(RealEstateDealBase):
    mission_id: int

class RealEstateDealResponse(RealEstateDealBase):
    id: int
    mission_id: int
    created_at: datetime
    class Config:
        from_attributes = True


# Daily Cycle Schemas
class DailyCycleBase(BaseModel):
    phase: str = "MORNING"  # MORNING, DISCOVERY, REVIEW, STRATEGY
    summary: str
    metrics_snapshot: Dict[str, Any] = {}
    actions_taken: List[str] = []

class DailyCycleResponse(DailyCycleBase):
    id: int
    mission_id: int
    cycle_date: str
    created_at: datetime
    class Config:
        from_attributes = True


# Communication Schemas
class CommunicationBase(BaseModel):
    lead_id: int
    channel: str = "WhatsApp"
    message_type: str = "INITIAL_PITCH"
    subject: Optional[str] = None
    body: str
    requires_approval: bool = True
    approval_status: str = "PENDING"
    delivery_status: str = "DRAFT"

class CommunicationCreate(CommunicationBase):
    mission_id: int

class CommunicationApprovalUpdate(BaseModel):
    approval_status: str  # APPROVED, REJECTED, MODIFIED
    modified_body: Optional[str] = None

class CommunicationResponse(CommunicationBase):
    id: int
    mission_id: int
    sent_at: Optional[datetime] = None
    response_received: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True


# Task Schemas
class TaskBase(BaseModel):
    agent_name: str
    day_number: int = 1
    title: str
    description: Optional[str] = None
    status: str = "PENDING"
    output_summary: Optional[str] = None
    logs: List[Dict[str, Any]] = []

class TaskCreate(TaskBase):
    mission_id: int

class TaskResponse(TaskBase):
    id: int
    mission_id: int
    created_at: datetime
    completed_at: Optional[datetime] = None
    class Config:
        from_attributes = True


# Revenue Tracking Schemas
class RevenueTrackingBase(BaseModel):
    amount: float
    currency: str = "AED"
    source: str
    payer_name: Optional[str] = None
    deal_status: str = "CONFIRMED"
    commission_collected: float = 0.0
    notes: Optional[str] = None

class RevenueTrackingCreate(RevenueTrackingBase):
    mission_id: int

class RevenueTrackingResponse(RevenueTrackingBase):
    id: int
    mission_id: int
    timestamp: datetime
    class Config:
        from_attributes = True


# Experiment Schemas
class ExperimentBase(BaseModel):
    name: str
    hypothesis: str
    variant_a: str
    variant_b: str
    metrics_a: Dict[str, Any] = {"sent": 0, "replied": 0, "converted": 0}
    metrics_b: Dict[str, Any] = {"sent": 0, "replied": 0, "converted": 0}
    winning_variant: Optional[str] = None
    status: str = "RUNNING"

class ExperimentCreate(ExperimentBase):
    mission_id: int

class ExperimentResponse(ExperimentBase):
    id: int
    mission_id: int
    created_at: datetime
    class Config:
        from_attributes = True


# Agent Memory Schemas
class AgentMemoryBase(BaseModel):
    agent_name: str
    category: str = "LEARNING"
    key: str
    value: Dict[str, Any]
    confidence: float = 0.9

class AgentMemoryCreate(AgentMemoryBase):
    pass

class AgentMemoryResponse(AgentMemoryBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True


# Mission Schemas
class MissionBase(BaseModel):
    title: str
    goal_amount: float = 1000.0
    currency: str = "AED"
    deadline_hours: int = 72
    budget: float = 0.0
    industry: Optional[str] = "All Industries"
    industries: Optional[List[str]] = Field(default_factory=list)

class MissionCreate(MissionBase):
    user_id: Optional[int] = None

class MissionResponse(MissionBase):
    id: int
    user_id: Optional[int] = None
    spent: float
    revenue_generated: float
    pipeline_value: float
    total_commission_potential: float = 0.0
    status: str
    current_day: int
    total_days: int
    ai_strategy: Optional[str] = None
    next_best_action: Optional[str] = None
    confidence_score: float
    created_at: datetime
    expires_at: Optional[datetime] = None
    class Config:
        from_attributes = True


# Dashboard HUD Summary
class DashboardSummary(BaseModel):
    mission: Optional[MissionResponse] = None
    hours_remaining: float = 72.0
    target_amount: float = 1000.0
    revenue_achieved: float = 0.0
    pipeline_expected: float = 0.0
    total_commission_potential: float = 0.0
    budget_spent: float = 0.0
    survival_status: str = "ACTIVE"
    confidence_score: float = 85.0
    opportunities_count: int = 0
    leads_count: int = 0
    messages_sent: int = 0
    replies_count: int = 0
    meetings_count: int = 0
    deals_count: int = 0
    commission_earned: float = 0.0
    next_best_action: str = "Analyze incoming market trends and initialize outreach approval queue."
    active_agent: str = "Survival Manager"
    recent_tasks: List[TaskResponse] = []
    pending_approvals: int = 0
    crm_funnel_counts: Dict[str, int] = {}


# Market Signal Schemas
class MarketSignalBase(BaseModel):
    source: str  # BUYER_RADAR, TELEGRAM, REDDIT, YOUTUBE, LINKEDIN, CUSTOM
    signal_text: str
    lead_name: Optional[str] = None
    country: str = "United Arab Emirates"
    intent_score: str = "Warm"  # Cold, Warm, Qualified, Hot
    channel: str = "WhatsApp"
    raw_metadata: Dict[str, Any] = {}

class MarketSignalCreate(MarketSignalBase):
    mission_id: int

class MarketSignalResponse(MarketSignalBase):
    id: int
    mission_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class SignalIngestionRequest(BaseModel):
    mission_id: int
    source: str = "TELEGRAM"
    signal_text: str
    lead_name: Optional[str] = None
    country: str = "United Arab Emirates"
    intent_score: Optional[str] = None
    channel: str = "WhatsApp"
    raw_metadata: Dict[str, Any] = {}


# Seller Listing Schemas
class SellerListingBase(BaseModel):
    seller_name: str
    project_name: str
    location: str
    original_price: float = 0.0
    distress_price: float = 0.0
    discount_pct: float = 0.0
    urgency_score: float = 85.0
    motivation_tier: str = "HIGH_MOTIVATION"  # CRITICAL_EXIT, HIGH_MOTIVATION, STANDARD
    equity_cushion_aed: float = 0.0
    handover_date: Optional[str] = None
    reason: Optional[str] = None
    contact_phone: Optional[str] = None
    status: str = "ACTIVE"

class SellerListingCreate(SellerListingBase):
    mission_id: int

class SellerListingResponse(SellerListingBase):
    id: int
    mission_id: int
    created_at: datetime
    class Config:
        from_attributes = True

class SellerScoringRequest(BaseModel):
    original_price: float
    distress_price: float
    handover_date: Optional[str] = None
    reason: Optional[str] = None
    urgency_level: Optional[str] = "HIGH"


# Long Term Memory Schemas
class LongTermMemoryBase(BaseModel):
    category: str = "SUCCESSFUL_STRATEGY"  # CAMPAIGN_RESULT, SUCCESSFUL_STRATEGY, FAILED_APPROACH, MARKET_LEARNING, AGENT_LEARNING
    title: str
    insight: str
    metrics: Dict[str, Any] = {}
    tags: List[str] = []
    confidence: float = 0.95

class LongTermMemoryCreate(LongTermMemoryBase):
    pass

class LongTermMemoryResponse(LongTermMemoryBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True


# Outreach Campaign Schemas
class OutreachCampaignCreate(BaseModel):
    mission_id: int
    lead_ids: Optional[List[int]] = None
    target_intent: Optional[str] = "Hot"
    custom_pitch_angle: Optional[str] = None

class CampaignSequenceResponse(BaseModel):
    status: str
    lead_id: int
    sequence_steps_created: int
    steps: List[Dict[str, Any]] = []


# Survival Strategy & Bottleneck Schemas
class BottleneckReport(BaseModel):
    bottleneck_detected: bool
    bottleneck_stage: str
    severity: str  # LOW, MEDIUM, HIGH, CRITICAL
    diagnosis: str
    remedy_action: str
    suggested_agent: str

class DailyStrategyDecision(BaseModel):
    mission_id: int
    day_number: int
    phase: str
    strategy_theme: str
    daily_focus: str
    target_kpi: str
    prescribed_actions: List[str]
    confidence_rating: float

