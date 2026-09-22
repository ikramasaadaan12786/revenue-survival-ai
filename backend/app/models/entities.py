import datetime
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(String(50), default="operator")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    missions = relationship("Mission", back_populates="user", cascade="all, delete-orphan")


class Mission(Base):
    __tablename__ = "missions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    title = Column(String(255), nullable=False)
    goal_amount = Column(Float, nullable=False, default=1000.0)
    currency = Column(String(10), default="AED")
    deadline_hours = Column(Integer, default=72)
    budget = Column(Float, default=0.0)
    spent = Column(Float, default=0.0)
    revenue_generated = Column(Float, default=0.0)
    pipeline_value = Column(Float, default=0.0)
    total_commission_potential = Column(Float, default=0.0)
    industry = Column(String(255), default="All Industries")
    industries = Column(JSON, default=list)
    status = Column(String(50), default="ACTIVE")  # ACTIVE, PIVOTING, CRITICAL, COMPLETED, PAUSED
    current_day = Column(Integer, default=1)
    total_days = Column(Integer, default=3)
    ai_strategy = Column(Text, nullable=True)
    next_best_action = Column(Text, nullable=True)
    confidence_score = Column(Float, default=85.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="missions")
    opportunities = relationship("Opportunity", back_populates="mission", cascade="all, delete-orphan")
    offers = relationship("Offer", back_populates="mission", cascade="all, delete-orphan")
    leads = relationship("Lead", back_populates="mission", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="mission", cascade="all, delete-orphan")
    communications = relationship("Communication", back_populates="mission", cascade="all, delete-orphan")
    revenue_entries = relationship("RevenueTracking", back_populates="mission", cascade="all, delete-orphan")
    experiments = relationship("Experiment", back_populates="mission", cascade="all, delete-orphan")
    real_estate_deals = relationship("RealEstateDeal", back_populates="mission", cascade="all, delete-orphan")
    daily_cycles = relationship("DailyCycleLog", back_populates="mission", cascade="all, delete-orphan")
    market_signals = relationship("MarketSignal", back_populates="mission", cascade="all, delete-orphan")
    seller_listings = relationship("SellerListing", back_populates="mission", cascade="all, delete-orphan")
    revenue_opportunities = relationship("RevenueOpportunity", back_populates="mission", cascade="all, delete-orphan")
    proposals = relationship("Proposal", back_populates="mission", cascade="all, delete-orphan")
    revenue_learnings = relationship("RevenueLearning", back_populates="mission", cascade="all, delete-orphan")


class MarketSignal(Base):
    __tablename__ = "market_signals"

    id = Column(Integer, primary_key=True, index=True)
    mission_id = Column(Integer, ForeignKey("missions.id"), nullable=False)
    source = Column(String(100), nullable=False)  # BUYER_RADAR, TELEGRAM, REDDIT, YOUTUBE, LINKEDIN
    signal_text = Column(Text, nullable=False)
    lead_name = Column(String(255), nullable=True)
    country = Column(String(100), default="United Arab Emirates")
    intent_score = Column(String(50), default="Warm")  # Cold, Warm, Qualified, Hot
    channel = Column(String(50), default="WhatsApp")
    raw_metadata = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    mission = relationship("Mission", back_populates="market_signals")


class SellerListing(Base):
    __tablename__ = "seller_listings"

    id = Column(Integer, primary_key=True, index=True)
    mission_id = Column(Integer, ForeignKey("missions.id"), nullable=False)
    seller_name = Column(String(255), nullable=False)
    project_name = Column(String(255), nullable=False)
    location = Column(String(150), nullable=False)
    original_price = Column(Float, default=0.0)
    distress_price = Column(Float, default=0.0)
    discount_pct = Column(Float, default=0.0)
    urgency_score = Column(Float, default=85.0)  # 0 to 100
    motivation_tier = Column(String(50), default="HIGH_MOTIVATION")  # CRITICAL_EXIT, HIGH_MOTIVATION, STANDARD
    equity_cushion_aed = Column(Float, default=0.0)
    handover_date = Column(String(100), nullable=True)
    reason = Column(Text, nullable=True)
    contact_phone = Column(String(50), nullable=True)
    status = Column(String(50), default="ACTIVE")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    mission = relationship("Mission", back_populates="seller_listings")


class RevenueOpportunity(Base):
    __tablename__ = "revenue_opportunities"

    id = Column(Integer, primary_key=True, index=True)
    mission_id = Column(Integer, ForeignKey("missions.id"), nullable=False)
    name = Column(String(255), nullable=False)
    company = Column(String(255), nullable=True)
    industry = Column(String(100), nullable=False)
    source = Column(String(100), default="Direct Search")
    requirement = Column(Text, nullable=False)
    estimated_value = Column(Float, default=0.0)
    urgency_score = Column(Float, default=85.0)
    conversion_score = Column(Float, default=85.0)
    intent_score = Column(Float, default=85.0)
    closing_probability = Column(Float, default=0.85)
    priority = Column(String(50), default="HOT")  # HOT, QUALIFIED, WARM, COLD
    status = Column(String(50), default="QUALIFIED")  # DISCOVERED, QUALIFIED, CONVERTED, CLOSED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    mission = relationship("Mission", back_populates="revenue_opportunities")


class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(Integer, primary_key=True, index=True)
    mission_id = Column(Integer, ForeignKey("missions.id"), nullable=False)
    problem = Column(Text, nullable=False)
    target_customer = Column(String(255), nullable=False)
    market = Column(String(255), nullable=False)
    offer_idea = Column(Text, nullable=False)
    price_estimate = Column(Float, default=0.0)
    difficulty = Column(String(50), default="Low")
    confidence_score = Column(Float, default=88.0)
    sources = Column(JSON, default=list)
    status = Column(String(50), default="DISCOVERED")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    mission = relationship("Mission", back_populates="opportunities")
    offers = relationship("Offer", back_populates="opportunity")


class Offer(Base):
    __tablename__ = "offers"

    id = Column(Integer, primary_key=True, index=True)
    mission_id = Column(Integer, ForeignKey("missions.id"), nullable=False)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"), nullable=True)
    product_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    pricing = Column(Float, nullable=False)
    currency = Column(String(10), default="AED")
    target_audience = Column(String(255), nullable=False)
    landing_page_copy = Column(Text, nullable=True)
    sales_message = Column(Text, nullable=True)
    marketing_angle = Column(String(255), nullable=True)
    faq = Column(JSON, default=list)
    status = Column(String(50), default="DRAFT")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    mission = relationship("Mission", back_populates="offers")
    opportunity = relationship("Opportunity", back_populates="offers")
    leads = relationship("Lead", back_populates="offer")


class Lead(Base):
    __tablename__ = "leads"

    id = Column(Integer, primary_key=True, index=True)
    mission_id = Column(Integer, ForeignKey("missions.id"), nullable=False)
    offer_id = Column(Integer, ForeignKey("offers.id"), nullable=True)
    name = Column(String(255), nullable=False)
    company_name = Column(String(255), nullable=True)
    source = Column(String(100), default="Telegram Public")
    country = Column(String(100), default="United Arab Emirates")
    interest = Column(Text, nullable=True)
    intent_score = Column(String(50), default="Warm")
    contact_info = Column(String(255), nullable=True)
    channel = Column(String(50), default="WhatsApp")
    status = Column(String(50), default="NEW")  # Standard / CRM Funnel
    pipeline_stage = Column(String(50), default="DISCOVERED")  # Upgraded stages: DISCOVERED, QUALIFIED, OFFER_CREATED, CONTACT_PENDING, CONTACTED, DISCOVERY_CALL, PROPOSAL_SENT, FOLLOW_UP, OBJECTION, NEGOTIATION, CLOSING, PAYMENT_PENDING, WON, LOST
    stage_duration_hours = Column(Float, default=1.0)
    expected_value = Column(Float, default=0.0)
    commission_potential = Column(Float, default=0.0)
    revenue_probability = Column(Float, default=0.80)
    
    # AI Qualification v3 Fields
    qualification_score = Column(Float, default=75.0)  # 0 to 100
    classification = Column(String(50), default="QUALIFIED")  # HOT, QUALIFIED, WARM, COLD
    buying_intent = Column(String(50), default="HIGH")  # HIGH, MEDIUM, LOW
    estimated_budget = Column(Float, default=3500.0)
    decision_stage = Column(String(50), default="EVALUATION")  # PROBLEM_AWARE, EVALUATION, DECISION, READY_TO_BUY
    decision_maker_probability = Column(Float, default=0.85)
    qualification_notes = Column(Text, nullable=True)
    
    # Phase 16 & 17 Real Evidence & Verification Layer
    source_type = Column(String(50), default="REAL")  # REAL, SYSTEM, TEST
    verification_status = Column(String(50), default="VERIFIED")  # VERIFIED, PENDING, UNVERIFIED
    client_identity = Column(String(255), nullable=True)
    proposal_id = Column(Integer, nullable=True)
    payment_status = Column(String(50), nullable=True)  # SETTLED, PENDING, UNPAID, FAILED
    payment_reference = Column(String(255), nullable=True)
    revenue_verification_status = Column(String(50), default="UNVERIFIED")  # VERIFIED, PENDING, UNVERIFIED

    # Phase 17 Real Evidence Fields
    source_platform = Column(String(100), default="Telegram")  # Telegram, LinkedIn, Instagram, Reddit, YouTube, Web Search
    source_url = Column(Text, nullable=True)
    profile_url = Column(Text, nullable=True)
    evidence_reference = Column(String(255), nullable=True)
    discovery_timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    calendar_event_id = Column(String(255), nullable=True)
    meeting_link = Column(String(255), nullable=True)
    call_status = Column(String(50), default="NONE")  # NONE, CALL_REQUESTED, CALL_BOOKED, CALL_COMPLETED, QUALIFIED
    call_notes = Column(Text, nullable=True)
    call_completed_at = Column(DateTime, nullable=True)

    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    mission = relationship("Mission", back_populates="leads")
    offer = relationship("Offer", back_populates="leads")
    communications = relationship("Communication", back_populates="lead", cascade="all, delete-orphan")
    proposals = relationship("Proposal", back_populates="lead", cascade="all, delete-orphan")


class Communication(Base):
    __tablename__ = "communications"

    id = Column(Integer, primary_key=True, index=True)
    mission_id = Column(Integer, ForeignKey("missions.id"), nullable=False)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=False)
    channel = Column(String(50), default="WhatsApp")
    message_type = Column(String(50), default="INITIAL_PITCH")  # INITIAL_PITCH, FOLLOW_UP_1, FOLLOW_UP_2, OBJECTION_RESPONSE
    sequence_step = Column(Integer, default=1)
    subject = Column(String(255), nullable=True)
    body = Column(Text, nullable=False)
    recipient = Column(String(255), nullable=True)
    provider_name = Column(String(50), default="WHATSAPP_BUSINESS")  # WHATSAPP_BUSINESS, TWILIO, SENDGRID_EMAIL
    provider_message_id = Column(String(255), nullable=True)
    provider_confirmation = Column(String(255), nullable=True)
    delivery_confirmation = Column(String(255), nullable=True)
    reply_source = Column(String(50), default="CLIENT_DIRECT")  # CLIENT_DIRECT, INBOUND_WEBHOOK, SIMULATED
    reply_status = Column(String(50), default="NONE")  # NONE, REPLIED_INTERESTED, REPLIED_NEED_INFO, REPLIED_PRICE_CONCERN, REPLIED_TIMING_ISSUE, REPLIED_NOT_INTERESTED, REPLIED_MEETING_REQUEST
    reply_classification = Column(String(100), nullable=True)
    followup_sequence_step = Column(Integer, default=0)  # 0=Initial, 1=4h Value, 2=24h ROI, 3=48h Final
    source_type = Column(String(50), default="REAL")  # REAL, SYSTEM, TEST
    verification_status = Column(String(50), default="VERIFIED")  # VERIFIED, PENDING, UNVERIFIED
    requires_approval = Column(Boolean, default=True)
    approval_status = Column(String(50), default="PENDING")  # PENDING, APPROVED, REJECTED, MODIFIED
    delivery_status = Column(String(50), default="DRAFT")  # DRAFT, APPROVAL_REQUIRED, APPROVED, QUEUED, SENT, DELIVERED, READ, REPLIED, FAILED
    scheduled_for = Column(DateTime, nullable=True)
    sent_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    read_at = Column(DateTime, nullable=True)
    response_received = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    mission = relationship("Mission", back_populates="communications")
    lead = relationship("Lead", back_populates="communications")


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    mission_id = Column(Integer, ForeignKey("missions.id"), nullable=False)
    agent_name = Column(String(100), nullable=False)
    day_number = Column(Integer, default=1)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="PENDING")
    source_type = Column(String(50), default="SYSTEM")  # REAL, SYSTEM, TEST
    verification_status = Column(String(50), default="VERIFIED")  # VERIFIED, PENDING, UNVERIFIED
    output_summary = Column(Text, nullable=True)
    logs = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    mission = relationship("Mission", back_populates="tasks")


class RealEstateDeal(Base):
    __tablename__ = "real_estate_deals"

    id = Column(Integer, primary_key=True, index=True)
    mission_id = Column(Integer, ForeignKey("missions.id"), nullable=False)
    deal_type = Column(String(50), default="DISTRESS")
    title = Column(String(255), nullable=False)
    developer = Column(String(100), nullable=True)
    location = Column(String(150), nullable=False)
    original_price = Column(Float, default=0.0)
    deal_price = Column(Float, default=0.0)
    commission_amount = Column(Float, default=0.0)
    projected_net_roi = Column(String(50), default="8.5%")
    payment_plan = Column(String(255), nullable=True)
    buyer_profile_match = Column(String(255), nullable=True)
    match_score = Column(Float, default=90.0)
    contact_name = Column(String(100), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    status = Column(String(50), default="ACTIVE")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    mission = relationship("Mission", back_populates="real_estate_deals")


class DailyCycleLog(Base):
    __tablename__ = "daily_cycles"

    id = Column(Integer, primary_key=True, index=True)
    mission_id = Column(Integer, ForeignKey("missions.id"), nullable=False)
    cycle_date = Column(String(50), default=lambda: datetime.date.today().isoformat())
    phase = Column(String(50), default="MORNING")
    summary = Column(Text, nullable=False)
    metrics_snapshot = Column(JSON, default=dict)
    actions_taken = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    mission = relationship("Mission", back_populates="daily_cycles")


class LongTermMemory(Base):
    __tablename__ = "long_term_memories"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(100), default="SUCCESSFUL_STRATEGY")  # CAMPAIGN_RESULT, SUCCESSFUL_STRATEGY, FAILED_APPROACH, MARKET_LEARNING
    title = Column(String(255), nullable=False)
    insight = Column(Text, nullable=False)
    metrics = Column(JSON, default=dict)
    tags = Column(JSON, default=list)
    confidence = Column(Float, default=0.95)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class AgentMemory(Base):
    __tablename__ = "agent_memory"

    id = Column(Integer, primary_key=True, index=True)
    agent_name = Column(String(100), nullable=False)
    category = Column(String(100), default="LEARNING")
    key = Column(String(255), nullable=False)
    value = Column(JSON, nullable=False)
    confidence = Column(Float, default=0.9)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class RevenueTracking(Base):
    __tablename__ = "revenue_tracking"

    id = Column(Integer, primary_key=True, index=True)
    mission_id = Column(Integer, ForeignKey("missions.id"), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="AED")
    source = Column(String(255), nullable=False)
    payer_name = Column(String(255), nullable=True)
    client_identity = Column(String(255), nullable=True)
    proposal_id = Column(Integer, nullable=True)
    payment_id = Column(String(255), nullable=True)
    transaction_reference = Column(String(255), nullable=True)
    payment_status = Column(String(50), default="SETTLED")  # SETTLED, PENDING, UNPAID, FAILED, REFUNDED
    payment_reference = Column(String(255), nullable=True)
    settlement_date = Column(DateTime, default=datetime.datetime.utcnow)
    revenue_verification_status = Column(String(50), default="VERIFIED")  # VERIFIED, PENDING, UNVERIFIED
    deal_status = Column(String(50), default="CONFIRMED")
    commission_collected = Column(Float, default=0.0)
    source_type = Column(String(50), default="REAL")  # REAL, SYSTEM, TEST
    verification_status = Column(String(50), default="VERIFIED")  # VERIFIED, PENDING, UNVERIFIED
    audit_hash = Column(String(255), nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    notes = Column(Text, nullable=True)

    mission = relationship("Mission", back_populates="revenue_entries")


class Experiment(Base):
    __tablename__ = "experiments"

    id = Column(Integer, primary_key=True, index=True)
    mission_id = Column(Integer, ForeignKey("missions.id"), nullable=False)
    name = Column(String(255), nullable=False)
    hypothesis = Column(Text, nullable=False)
    variant_a = Column(Text, nullable=False)
    variant_b = Column(Text, nullable=False)
    metrics_a = Column(JSON, default=lambda: {"sent": 0, "replied": 0, "converted": 0})
    metrics_b = Column(JSON, default=lambda: {"sent": 0, "replied": 0, "converted": 0})
    winning_variant = Column(String(50), nullable=True)
    status = Column(String(50), default="RUNNING")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    mission = relationship("Mission", back_populates="experiments")


class Analytics(Base):
    __tablename__ = "analytics"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(100), nullable=False)
    agent_name = Column(String(100), nullable=True)
    payload = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)


class ConnectorAuth(Base):
    __tablename__ = "connector_auths"

    id = Column(Integer, primary_key=True, index=True)
    connector_name = Column(String(50), unique=True, index=True, nullable=False)  # REDDIT, TELEGRAM, YOUTUBE, LINKEDIN, WEB_SEARCH, BUSINESS_DIRECTORIES
    auth_type = Column(String(50), default="API_KEY")  # API_KEY, OAUTH2, BOT_TOKEN, COOKIE, PUBLIC
    credentials = Column(JSON, default=dict)
    status = Column(String(50), default="CONNECTED")  # CONNECTED, CONFIGURED, ERROR, DISCONNECTED
    last_tested = Column(DateTime, default=datetime.datetime.utcnow)
    latency_ms = Column(Integer, default=45)
    capabilities = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class Proposal(Base):
    __tablename__ = "proposals"

    id = Column(Integer, primary_key=True, index=True)
    mission_id = Column(Integer, ForeignKey("missions.id"), nullable=False)
    lead_id = Column(Integer, ForeignKey("leads.id"), nullable=True)
    opportunity_id = Column(Integer, nullable=True)
    proposal_title = Column(String(255), nullable=False)
    proposal_type = Column(String(100), default="AI_AGENT")  # AI_AGENT, SOFTWARE, WEBSITE, SAAS, REAL_ESTATE, MARKETING
    client_name = Column(String(255), nullable=False)
    client_summary = Column(Text, nullable=False)
    problem_statement = Column(Text, nullable=False)
    proposed_solution = Column(Text, nullable=False)
    deliverables = Column(JSON, default=list)
    timeline_days = Column(Integer, default=3)
    pricing_amount = Column(Float, nullable=False)
    currency = Column(String(10), default="AED")
    payment_terms = Column(String(255), default="50% upfront deposit, 50% upon deployment")
    payment_status = Column(String(50), default="UNPAID")  # UNPAID, SETTLED, PENDING, REFUNDED
    payment_reference = Column(String(255), nullable=True)
    recipient_confirmation = Column(String(255), nullable=True)
    client_response = Column(Text, nullable=True)
    viewed_at = Column(DateTime, nullable=True)
    accepted_at = Column(DateTime, nullable=True)
    rejected_at = Column(DateTime, nullable=True)
    source_type = Column(String(50), default="REAL")  # REAL, SYSTEM, TEST
    verification_status = Column(String(50), default="VERIFIED")  # VERIFIED, PENDING, UNVERIFIED
    expected_outcomes = Column(JSON, default=list)
    full_proposal_markdown = Column(Text, nullable=True)
    status = Column(String(50), default="DRAFT")  # DRAFT, SENT, VIEWED, ACCEPTED, REJECTED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    mission = relationship("Mission", back_populates="proposals")
    lead = relationship("Lead", back_populates="proposals")


class RevenueLearning(Base):
    __tablename__ = "revenue_learnings"

    id = Column(Integer, primary_key=True, index=True)
    mission_id = Column(Integer, ForeignKey("missions.id"), nullable=True)
    industry = Column(String(100), nullable=True)
    offer_type = Column(String(100), nullable=True)
    source = Column(String(100), nullable=True)
    conversion_rate = Column(Float, default=0.0)
    reply_rate = Column(Float, default=0.0)
    avg_closing_hours = Column(Float, default=24.0)
    avg_deal_value = Column(Float, default=5000.0)
    sample_size = Column(Integer, default=1)
    learning_insight = Column(Text, nullable=False)
    recommendation = Column(Text, nullable=False)
    action_priority = Column(String(50), default="HIGH")  # CRITICAL, HIGH, MEDIUM
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    mission = relationship("Mission", back_populates="revenue_learnings")


class CEODecisionMemory(Base):
    __tablename__ = "ceo_decision_memories"

    id = Column(Integer, primary_key=True, index=True)
    mission_id = Column(Integer, ForeignKey("missions.id"), nullable=True)
    decision_type = Column(String(100), default="STRATEGY_PIVOT")  # STRATEGY_PIVOT, OFFER_SCALE, INDUSTRY_FOCUS, BUDGET_ESCALATION, RISK_ALERT
    recommendation = Column(Text, nullable=False)
    reason = Column(Text, nullable=False)
    confidence_score = Column(Float, default=87.0)  # 0 to 100
    expected_impact_aed = Column(Float, default=0.0)
    action_taken = Column(String(255), nullable=True)
    result_status = Column(String(50), default="EXECUTED")  # EXECUTED, SUCCESS, FAILED, PENDING
    actual_revenue_impact_aed = Column(Float, default=0.0)
    metrics_snapshot = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    mission = relationship("Mission")


class BusinessGrowthMemory(Base):
    __tablename__ = "business_growth_memories"

    id = Column(Integer, primary_key=True, index=True)
    mission_id = Column(Integer, ForeignKey("missions.id"), nullable=True)
    cycle_type = Column(String(100), default="AUTONOMOUS_CYCLE")  # AUTONOMOUS_CYCLE, PIVOT, SCALING, MARKET_SHIFT, OFFER_EVOLUTION
    insight_summary = Column(Text, nullable=False)
    best_industries = Column(JSON, default=list)
    best_offers = Column(JSON, default=list)
    best_sources = Column(JSON, default=list)
    winning_strategies = Column(JSON, default=list)
    revenue_generated_aed = Column(Float, default=0.0)
    efficiency_gain_pct = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    mission = relationship("Mission")


class OperatorActionLog(Base):
    __tablename__ = "operator_action_logs"

    id = Column(Integer, primary_key=True, index=True)
    mission_id = Column(Integer, ForeignKey("missions.id"), nullable=True)
    action_type = Column(String(100), nullable=False)  # CREATE_MISSION, OPTIMIZE_OFFER, SCALE_CHANNEL, PIVOT_INDUSTRY, DISPATCH_LEAD_HUNTER, STAGE_OUTREACH
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="PENDING_APPROVAL")  # PENDING_APPROVAL, APPROVED, EXECUTED, REJECTED
    action_payload = Column(JSON, default=dict)
    revenue_impact_aed = Column(Float, default=0.0)
    confidence_score = Column(Float, default=90.0)
    source_type = Column(String(50), default="SYSTEM")  # REAL, SYSTEM, TEST
    verification_status = Column(String(50), default="VERIFIED")  # VERIFIED, PENDING, UNVERIFIED
    executed_by = Column(String(100), default="AUTONOMOUS_OPERATOR")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    executed_at = Column(DateTime, nullable=True)

    mission = relationship("Mission")


class CompanyDepartmentLog(Base):
    __tablename__ = "company_department_logs"

    id = Column(Integer, primary_key=True, index=True)
    mission_id = Column(Integer, ForeignKey("missions.id"), nullable=True)
    department = Column(String(100), nullable=False)  # CEO, SALES, MARKETING, LEAD_GEN, PRODUCT, FINANCE, CUSTOMER_SUCCESS
    agent_role = Column(String(100), nullable=False)
    status = Column(String(50), default="ACTIVE")
    goals = Column(JSON, default=list)
    kpis = Column(JSON, default=dict)
    tasks = Column(JSON, default=list)
    performance_metrics = Column(JSON, default=dict)
    recommendations = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    mission = relationship("Mission")


class ClientAccount(Base):
    __tablename__ = "client_accounts"

    id = Column(Integer, primary_key=True, index=True)
    mission_id = Column(Integer, ForeignKey("missions.id"), nullable=True)
    client_name = Column(String(255), nullable=False)
    company_name = Column(String(255), nullable=True)
    industry = Column(String(100), default="AI Automation")
    contract_value = Column(Float, default=15000.0)
    ltv = Column(Float, default=30000.0)
    health_score = Column(Float, default=92.0)  # 0 to 100
    satisfaction_rating = Column(Float, default=4.8)  # 1 to 5
    status = Column(String(50), default="ACTIVE")  # ACTIVE, AT_RISK, RENEWAL_DUE, CHURNED
    renewal_date = Column(DateTime, nullable=True)
    upsell_opportunity = Column(String(255), nullable=True)
    upsell_value_aed = Column(Float, default=12500.0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    mission = relationship("Mission")


class CompanyPerformanceScorecard(Base):
    __tablename__ = "company_performance_scorecards"

    id = Column(Integer, primary_key=True, index=True)
    agent_role = Column(String(100), nullable=False)
    department = Column(String(100), nullable=False)
    tasks_completed = Column(Integer, default=0)
    revenue_attributed_aed = Column(Float, default=0.0)
    success_rate = Column(Float, default=95.0)
    efficiency_score = Column(Float, default=92.0)
    grade = Column(String(10), default="A+")
    period = Column(String(50), default="DAILY")
    metrics_snapshot = Column(JSON, default=dict)
    evaluated_at = Column(DateTime, default=datetime.datetime.utcnow)


class ScalingIntelligenceLog(Base):
    __tablename__ = "scaling_intelligence_logs"

    id = Column(Integer, primary_key=True, index=True)
    mission_id = Column(Integer, ForeignKey("missions.id"), nullable=True)
    category = Column(String(100), nullable=False)  # HIRING, OUTSOURCING, PARTNERSHIP, INVESTOR, MARKET_EXPANSION, COMPETITOR
    title = Column(String(255), nullable=False)
    recommendation = Column(Text, nullable=False)
    action_type = Column(String(100), default="EXPAND")  # HIRE, OUTSOURCE, PARTNER, INVEST, EXPAND, DEFEND
    expected_roi_multiplier = Column(Float, default=3.5)
    estimated_cost_aed = Column(Float, default=0.0)
    projected_revenue_aed = Column(Float, default=0.0)
    confidence_score = Column(Float, default=92.0)
    status = Column(String(50), default="ACTIVE")  # ACTIVE, EXECUTED, ARCHIVED
    details = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    mission = relationship("Mission")


class BrandContentPipeline(Base):
    __tablename__ = "brand_content_pipelines"

    id = Column(Integer, primary_key=True, index=True)
    mission_id = Column(Integer, ForeignKey("missions.id"), nullable=True)
    platform = Column(String(50), default="LINKEDIN")  # LINKEDIN, INSTAGRAM, YOUTUBE, X
    content_type = Column(String(50), default="POST")  # POST, VIDEO_SCRIPT, ARTICLE, CASE_STUDY
    title = Column(String(255), nullable=False)
    hook = Column(Text, nullable=False)
    body = Column(Text, nullable=True)
    call_to_action = Column(String(255), nullable=True)
    target_audience = Column(String(255), default="B2B Founders & Real Estate Leaders")
    status = Column(String(50), default="SCHEDULED")  # DRAFT, SCHEDULED, PUBLISHED
    scheduled_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    mission = relationship("Mission")


class EnterpriseCompany(Base):
    __tablename__ = "enterprise_companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, index=True)
    industry = Column(String(100), default="AI Automation")
    country = Column(String(100), default="United Arab Emirates")
    currency = Column(String(10), default="AED")
    tier_plan = Column(String(50), default="PROFESSIONAL")  # STARTER, PROFESSIONAL, BUSINESS, ENTERPRISE
    status = Column(String(50), default="ACTIVE")
    settings = Column(JSON, default=dict)
    business_metrics = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    ai_employees = relationship("CompanyAIEmployeeAssignment", back_populates="company", cascade="all, delete-orphan")
    assistant_sessions = relationship("ClientFacingAssistantSession", back_populates="company", cascade="all, delete-orphan")
    subscriptions = relationship("EnterpriseSubscriptionBilling", back_populates="company", cascade="all, delete-orphan")


class CompanyAIEmployeeAssignment(Base):
    __tablename__ = "company_ai_employee_assignments"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("enterprise_companies.id"), nullable=False)
    employee_catalog_id = Column(String(100), nullable=False)
    name = Column(String(255), nullable=False)
    role = Column(String(100), nullable=False)
    department = Column(String(100), nullable=False)
    skills = Column(JSON, default=list)
    custom_goals = Column(JSON, default=list)
    assigned_tasks = Column(JSON, default=list)
    status = Column(String(50), default="ACTIVE")  # ACTIVE, IDLE, PAUSED
    performance_score = Column(Float, default=95.0)
    monthly_fee_aed = Column(Float, default=2500.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    company = relationship("EnterpriseCompany", back_populates="ai_employees")


class ClientFacingAssistantSession(Base):
    __tablename__ = "client_facing_assistant_sessions"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("enterprise_companies.id"), nullable=False)
    assistant_type = Column(String(50), default="SALES")  # SALES, SUPPORT, PROPERTY, CONSULTANT
    client_name = Column(String(255), nullable=False)
    client_contact = Column(String(255), nullable=True)
    channel = Column(String(50), default="WhatsApp")
    query = Column(Text, nullable=False)
    requirements_extracted = Column(JSON, default=dict)
    ai_recommendations = Column(JSON, default=list)
    report_summary = Column(Text, nullable=True)
    status = Column(String(50), default="RESOLVED")  # RESOLVED, ESCALATED, IN_PROGRESS
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    company = relationship("EnterpriseCompany", back_populates="assistant_sessions")


class EnterpriseSubscriptionBilling(Base):
    __tablename__ = "enterprise_subscription_billings"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("enterprise_companies.id"), nullable=False)
    plan_name = Column(String(50), default="PROFESSIONAL")  # STARTER, PROFESSIONAL, BUSINESS, ENTERPRISE
    monthly_price_aed = Column(Float, default=4999.0)
    billing_cycle = Column(String(50), default="MONTHLY")
    ai_employee_limit = Column(Integer, default=5)
    ai_employees_active = Column(Integer, default=3)
    api_call_quota = Column(Integer, default=50000)
    api_calls_used = Column(Integer, default=1240)
    status = Column(String(50), default="ACTIVE")  # ACTIVE, UPGRADED, PAST_DUE
    renews_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    company = relationship("EnterpriseCompany", back_populates="subscriptions")


class OvernightExecutionLog(Base):
    __tablename__ = "overnight_execution_logs"

    id = Column(Integer, primary_key=True, index=True)
    mission_id = Column(Integer, ForeignKey("missions.id"), nullable=False)
    cycle_type = Column(String(100), default="INTERVAL_15M")  # INTERVAL_15M, HOURLY_BOTTLENECK, CEO_REVIEW_6H, MORNING_REPORT
    status = Column(String(50), default="SUCCESS")
    summary = Column(Text, nullable=False)
    leads_audited = Column(Integer, default=0)
    replies_processed = Column(Integer, default=0)
    followups_staged = Column(Integer, default=0)
    proposals_prepared = Column(Integer, default=0)
    bottlenecks_detected = Column(JSON, default=list)
    strategy_recommendations = Column(JSON, default=list)
    metrics_snapshot = Column(JSON, default=dict)
    source_type = Column(String(50), default="SYSTEM")
    verification_status = Column(String(50), default="VERIFIED")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    mission = relationship("Mission")








