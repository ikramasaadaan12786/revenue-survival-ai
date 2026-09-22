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
    provider_name = Column(String(50), default="WHATSAPP_BUSINESS")  # WHATSAPP_BUSINESS, TWILIO, SENDGRID_EMAIL
    provider_message_id = Column(String(255), nullable=True)
    requires_approval = Column(Boolean, default=True)
    approval_status = Column(String(50), default="PENDING")  # PENDING, APPROVED, REJECTED, MODIFIED
    delivery_status = Column(String(50), default="DRAFT")  # DRAFT, QUEUED, SENT, DELIVERED, READ, REPLIED, FAILED
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
    deal_status = Column(String(50), default="CONFIRMED")
    commission_collected = Column(Float, default=0.0)
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
    expected_outcomes = Column(JSON, default=list)
    full_proposal_markdown = Column(Text, nullable=True)
    status = Column(String(50), default="DRAFT")  # DRAFT, SENT, ACCEPTED, REJECTED
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



