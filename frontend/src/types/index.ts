export interface Mission {
  id: number;
  user_id?: number;
  title: string;
  goal_amount: number;
  currency: string;
  deadline_hours: number;
  budget: number;
  spent: number;
  revenue_generated: number;
  pipeline_value: number;
  total_commission_potential: number;
  industry: string;
  industries?: string[];
  status: "ACTIVE" | "PIVOTING" | "CRITICAL" | "COMPLETED" | "PAUSED";
  current_day: number;
  total_days: number;
  ai_strategy?: string;
  next_best_action?: string;
  confidence_score: number;
  created_at: string;
  expires_at?: string;
}

export interface Opportunity {
  id: number;
  mission_id: number;
  problem: string;
  target_customer: string;
  market: string;
  offer_idea: string;
  price_estimate: number;
  difficulty: "Low" | "Medium" | "High";
  confidence_score: number;
  sources: string[];
  status: "DISCOVERED" | "VALIDATED" | "ACTIVE" | "REJECTED";
  created_at: string;
}

export interface Offer {
  id: number;
  mission_id: number;
  opportunity_id?: number;
  product_name: string;
  description: string;
  pricing: number;
  currency: string;
  target_audience: string;
  landing_page_copy?: string;
  sales_message?: string;
  marketing_angle?: string;
  faq: { question: string; answer: string }[];
  status: "DRAFT" | "APPROVED" | "ACTIVE" | "ARCHIVED";
  created_at: string;
}

export type CRMStage = 
  | "NEW"
  | "AI_VERIFIED"
  | "CONTACT_READY"
  | "CONTACTED"
  | "REPLIED"
  | "MEETING"
  | "DEAL"
  | "COMMISSION";

export type PipelineStage =
  | "DISCOVERED"
  | "QUALIFIED"
  | "OFFER_CREATED"
  | "CONTACT_PENDING"
  | "CONTACTED"
  | "DISCOVERY_CALL"
  | "PROPOSAL_SENT"
  | "FOLLOW_UP"
  | "OBJECTION"
  | "NEGOTIATION"
  | "CLOSING"
  | "PAYMENT_PENDING"
  | "WON"
  | "LOST";

export interface Lead {
  id: number;
  mission_id: number;
  offer_id?: number;
  name: string;
  company_name?: string;
  source: string;
  country: string;
  interest?: string;
  intent_score: "Cold" | "Warm" | "Qualified" | "Hot";
  contact_info?: string;
  channel: "WhatsApp" | "Email" | "LinkedIn" | "Telegram";
  status: CRMStage;
  pipeline_stage?: PipelineStage;
  stage_duration_hours?: number;
  expected_value: number;
  commission_potential: number;
  revenue_probability?: number;
  qualification_score?: number;
  classification?: "HOT" | "QUALIFIED" | "WARM" | "COLD";
  buying_intent?: "HIGH" | "MEDIUM" | "LOW";
  estimated_budget?: number;
  decision_stage?: "PROBLEM_AWARE" | "EVALUATION" | "DECISION" | "READY_TO_BUY";
  decision_maker_probability?: number;
  qualification_notes?: string;
  notes?: string;
  created_at: string;
}

export interface Proposal {
  id: number;
  mission_id: number;
  lead_id?: number;
  opportunity_id?: number;
  proposal_title: string;
  proposal_type: "AI_AGENT" | "SOFTWARE" | "WEBSITE" | "SAAS" | "REAL_ESTATE" | "MARKETING";
  client_name: string;
  client_summary: string;
  problem_statement: string;
  proposed_solution: string;
  deliverables: string[];
  timeline_days: number;
  pricing_amount: number;
  currency: string;
  payment_terms: string;
  expected_outcomes: string[];
  full_proposal_markdown?: string;
  status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED";
  created_at: string;
}

export interface SalesClosingStrategy {
  lead_name: string;
  company_name: string;
  industry: string;
  discovery_questions: { question: string; purpose: string }[];
  objection_handling: { objection: string; script: string; tactical_pivot: string }[];
  negotiation_strategy: {
    recommended_starting_price: number;
    minimum_acceptable_floor: number;
    target_profit_margin: string;
    suggested_payment_terms: string;
    value_justification: string;
    upsell_opportunity?: {
      upsell_package_name?: string;
      upsell_price?: number;
      deliverables?: string[];
      upsell_deliverables?: string[];
    };
  };
  recommended_next_action: string;
}

export interface RevenueLearning {
  id: number;
  mission_id?: number;
  industry?: string;
  offer_type?: string;
  source?: string;
  conversion_rate: number;
  reply_rate: number;
  avg_closing_hours: number;
  avg_deal_value: number;
  sample_size: number;
  learning_insight: string;
  recommendation: string;
  action_priority: "CRITICAL" | "HIGH" | "MEDIUM";
  created_at: string;
}

export interface PerformanceReport {
  mission_id: number;
  best_performing_industry: string;
  best_offer: string;
  best_source: string;
  biggest_bottleneck: string;
  recommended_strategy_change: string;
  intelligence_metrics: {
    total_leads: number;
    qualified_leads: number;
    hot_leads: number;
    active_negotiations: number;
    proposals_sent: number;
    deals_won: number;
    revenue_generated: number;
    conversion_rate_pct: number;
    avg_deal_size_aed: number;
    pipeline_coverage_ratio: number;
  };
  actionable_recommendations: string[];
}


export interface RealEstateDeal {
  id: number;
  mission_id: number;
  deal_type: "BUYER_NEED" | "SELLER_OPPORTUNITY" | "DISTRESS";
  title: string;
  developer?: string;
  location: string;
  original_price: number;
  deal_price: number;
  commission_amount: number;
  projected_net_roi: string;
  payment_plan?: string;
  buyer_profile_match?: string;
  match_score: number;
  contact_name?: string;
  contact_phone?: string;
  status: "ACTIVE" | "MATCHED" | "UNDER_OFFER" | "CLOSED";
  created_at: string;
}

export interface DailyCycleLog {
  id: number;
  mission_id: number;
  cycle_date: string;
  phase: "MORNING" | "DISCOVERY" | "REVIEW" | "STRATEGY";
  summary: string;
  metrics_snapshot: Record<string, any>;
  actions_taken: string[];
  created_at: string;
}

export interface Communication {
  id: number;
  mission_id: number;
  lead_id: number;
  channel: "WhatsApp" | "Email" | "LinkedIn" | "Telegram";
  message_type: string;
  subject?: string;
  body: string;
  requires_approval: boolean;
  approval_status: "PENDING" | "APPROVED" | "REJECTED" | "MODIFIED";
  delivery_status: "DRAFT" | "QUEUED" | "SENT" | "DELIVERED" | "READ" | "REPLIED" | "FAILED";
  sent_at?: string;
  response_received?: string;
  created_at: string;
}

export interface Task {
  id: number;
  mission_id: number;
  agent_name: string;
  day_number: number;
  title: string;
  description?: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "SKIPPED";
  output_summary?: string;
  logs: { timestamp: string; event: string; details?: string }[];
  created_at: string;
  completed_at?: string;
}

export interface RevenueTracking {
  id: number;
  mission_id: number;
  amount: number;
  currency: string;
  source: string;
  payer_name?: string;
  deal_status: "PENDING" | "CONFIRMED" | "REFUNDED";
  commission_collected: number;
  timestamp: string;
  notes?: string;
}

export interface Experiment {
  id: number;
  mission_id: number;
  name: string;
  hypothesis: string;
  variant_a: string;
  variant_b: string;
  metrics_a: { sent: number; replied: number; converted: number };
  metrics_b: { sent: number; replied: number; converted: number };
  winning_variant?: string;
  status: "RUNNING" | "CONCLUDED" | "ABANDONED";
  created_at: string;
}

export interface AgentMemory {
  id: number;
  agent_name: string;
  category: string;
  key: string;
  value: any;
  confidence: number;
  created_at: string;
}

export interface DashboardSummary {
  mission?: Mission;
  hours_remaining: number;
  target_amount: number;
  revenue_achieved: number;
  pipeline_expected: number;
  total_commission_potential: number;
  budget_spent: number;
  survival_status: "ACTIVE" | "PIVOTING" | "CRITICAL" | "COMPLETED" | "PAUSED";
  confidence_score: number;
  opportunities_count: number;
  leads_count: number;
  messages_sent: number;
  replies_count: number;
  meetings_count: number;
  deals_count: number;
  commission_earned: number;
  next_best_action: string;
  active_agent: string;
  recent_tasks: Task[];
  pending_approvals: number;
  crm_funnel_counts: Record<string, number>;
}

export interface MarketSignal {
  id: number;
  source: string;
  signal_text: string;
  lead_name?: string;
  country: string;
  intent_score: "Cold" | "Warm" | "Qualified" | "Hot";
  channel: string;
  created_at?: string;
}

export interface SellerListing {
  id: number;
  mission_id: number;
  seller_name: string;
  project_name: string;
  location: string;
  original_price: number;
  distress_price: number;
  discount_pct: number;
  urgency_score: number;
  motivation_tier: "CRITICAL_EXIT" | "HIGH_MOTIVATION" | "STANDARD";
  equity_cushion_aed: number;
  commission_potential: number;
  handover_date?: string;
  reason?: string;
  contact_phone?: string;
  status: string;
  created_at?: string;
}

export interface LongTermMemory {
  id: number;
  category: "SUCCESSFUL_STRATEGY" | "FAILED_APPROACH" | "CAMPAIGN_RESULT" | "AGENT_LEARNING" | "MARKET_LEARNING";
  title: string;
  insight: string;
  metrics: Record<string, any>;
  tags: string[];
  confidence: number;
  created_at: string;
}

export interface OutreachPipelineItem {
  lead_id: number;
  lead_name: string;
  lead_country: string;
  intent_score: string;
  channel: string;
  crm_status: string;
  steps_count: number;
  steps: {
    id: number;
    step: number;
    type: string;
    channel: string;
    subject?: string;
    body: string;
    approval_status: string;
    delivery_status: string;
    scheduled_for?: string;
    sent_at?: string;
  }[];
}

export interface BottleneckReport {
  bottleneck_detected: boolean;
  bottleneck_stage: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  diagnosis: string;
  remedy_action: string;
  suggested_agent: string;
}

export interface DailyStrategyDecision {
  mission_id: number;
  day_number: number;
  phase: string;
  strategy_theme: string;
  daily_focus: string;
  target_kpi: string;
  prescribed_actions: string[];
  confidence_rating: number;
}

export interface MessageTemplate {
  id: string;
  name: string;
  channel: string;
  category: string;
  template: string;
  required_variables: string[];
}

export interface RoadmapPhase {
  phase: string;
  focus: string;
  target_metric: string;
  commission_milestone_aed: number;
  key_actions: string[];
}

export interface LiveRoadmapResponse {
  mission_id: number;
  goal_amount: number;
  currency: string;
  total_days: number;
  current_day: number;
  phases: RoadmapPhase[];
}

export interface LiveCycleExecutionResult {
  status: string;
  mission_id: number;
  signals_acquired: number;
  browser_deals_detected: number;
  seller_listings_active: number;
  campaign_staged_leads: number;
  total_commission_potential_aed: number;
  pipeline_value_aed: number;
  next_best_action: string;
  bottleneck: BottleneckReport;
}

export interface ServiceOffering {
  id: string;
  industry: string;
  service_name: string;
  headline: string;
  description: string;
  typical_price_aed: number;
  min_price_aed: number;
  max_price_aed: number;
  upfront_deposit_pct: number;
  delivery_hours: number;
  sales_cycle_hours: number;
  conversion_difficulty: string;
  success_probability: number;
  zero_budget_viable: boolean;
  target_audiences: string[];
  intent_keywords: string[];
  deliverables: string[];
  sample_pitch_hook: string;
}

export interface EvaluatedRevenuePath {
  service_id: string;
  industry: string;
  service_name: string;
  headline: string;
  unit_price_aed: number;
  required_clients: number;
  upfront_deposit_pct: number;
  immediate_cash_collected_aed: number;
  total_deal_value_aed: number;
  estimated_leads_needed: number;
  delivery_hours: number;
  sales_cycle_hours: number;
  total_time_required_hours: number;
  fits_deadline: boolean;
  feasibility_score: number;
  sample_pitch_hook: string;
}

export interface RevenueEvaluationResult {
  target_amount: number;
  deadline_hours: number;
  budget: number;
  currency: string;
  goal_tier: string;
  primary_industry: string;
  primary_service: EvaluatedRevenuePath;
  secondary_backup_industry: string;
  secondary_service?: EvaluatedRevenuePath;
  strategic_thesis: string;
  confidence_score: number;
  calculation_matrix: {
    target_amount: number;
    deadline_hours: number;
    budget: number;
    currency: string;
    optimal_recommendation: EvaluatedRevenuePath;
    fastest_velocity_path: EvaluatedRevenuePath;
    minimal_clients_path: EvaluatedRevenuePath;
    all_evaluated_paths: EvaluatedRevenuePath[];
  };
}

export interface RevenueOpportunity {
  id: number;
  mission_id: number;
  name: string;
  company?: string;
  industry: string;
  source: string;
  requirement: string;
  estimated_value: number;
  urgency_score: number;
  conversion_score: number;
  intent_score: number;
  closing_probability: number;
  priority: "HOT" | "QUALIFIED" | "WARM" | "COLD";
  status: string;
  created_at: string;
}

export interface GlobalActiveMissionItem {
  id: number;
  title: string;
  goal_amount: number;
  revenue_generated: number;
  pipeline_value: number;
  opportunities_count: number;
  leads_count: number;
  time_remaining_hours: number;
  status: string;
  industry: string;
  currency: string;
  confidence_score: number;
}

export interface GlobalMissionsOverview {
  total_active_missions: number;
  total_missions: number;
  total_opportunities: number;
  hot_opportunities: number;
  total_pipeline_value: number;
  total_revenue_generated: number;
  source_breakdown: Record<string, number>;
  active_missions: GlobalActiveMissionItem[];
}

export interface ConnectorHealth {
  connector_id: string;
  source: string;
  protocol: string;
  target_channels: string;
  last_sync: string;
  signals_found_today: number;
  status: "ONLINE" | "ACTIVE" | "ERROR" | "CONNECTING";
  latency_ms: number;
  errors: string;
  reliability_score: string;
}

export interface BridgeSyncResult {
  status: string;
  mission_id: number;
  timestamp: string;
  total_signals_imported: number;
  source_breakdown: {
    telegram: number;
    linkedin: number;
    instagram: number;
    reddit: number;
    youtube: number;
    web_search: number;
  };
  opportunities_created: number;
  leads_created: number;
  total_pipeline_value_added_aed: number;
  target_math?: any;
}

export interface TargetMath {
  mission_id: number;
  target_amount: number;
  revenue_achieved: number;
  remaining_target: number;
  currency: string;
  deadline_hours: number;
  required_deals: number;
  required_proposals: number;
  required_conversations: number;
  required_qualified_leads: number;
  required_scanned_opportunities: number;
  required_revenue_velocity_per_hour: number;
  target_summary: string;
}

export interface RevenueCommandCenterMetrics {
  mission_id: number;
  todays_signals: number;
  new_qualified_opportunities: number;
  hot_leads: number;
  offers_ready: number;
  messages_pending_approval: number;
  expected_revenue_aed: number;
  pipeline_value_aed: number;
  revenue_generated_aed: number;
  target_math: TargetMath;
}

export interface DailySurvivalReport {
  mission_id: number;
  mission_title: string;
  report_date: string;
  signals_found: number;
  qualified_leads: number;
  industries_breakdown: Record<string, number>;
  expected_revenue_aed: number;
  pipeline_value_aed: number;
  target_math: TargetMath;
  top_10_opportunities: Array<{
    id: number;
    name: string;
    company: string;
    industry: string;
    source: string;
    estimated_value_aed: number;
    intent_score: number;
    urgency_score: number;
    priority: string;
    requirement_snippet: string;
  }>;
  recommended_actions: string[];
}

export interface PrioritizedOpportunity {
  lead_id: number;
  name: string;
  company: string;
  interest: string;
  country: string;
  channel: string;
  classification: "HOT BUYER" | "WARM BUYER" | "NURTURE" | "REJECT" | string;
  qualification_score: number;
  deal_value_aed: number;
  closing_probability: number;
  weighted_value_aed: number;
  pipeline_stage: string;
  decision_stage: string;
  priority_rank: number;
}

export interface ContactFirstItem {
  lead_id: number;
  name: string;
  company: string;
  channel: string;
  deal_value_aed: number;
  reason: string;
}

export interface DailyExecutionPlan {
  mission_id: number;
  plan_date: string;
  todays_goal: string;
  target_amount_aed: number;
  revenue_achieved_aed: number;
  remaining_target_aed: number;
  hourly_velocity_required_aed: number;
  deals_needed: number;
  proposals_needed: number;
  calls_needed: number;
  expected_revenue_forecast_aed: number;
  top_20_opportunities: PrioritizedOpportunity[];
  who_to_contact_first: ContactFirstItem[];
  recommended_actions: string[];
}

export interface SalesCopilotSequence {
  client_summary: string;
  pain_point: string;
  recommended_solution: string;
  channel: string;
  opening_message: string;
  followup_day_1: string;
  followup_day_3: string;
  closing_message: string;
  requires_approval: boolean;
  approval_status: string;
  staged_communication_ids?: number[];
}

export interface CEODailyDecision {
  decision_id: number;
  mission_id: number;
  decision: string;
  recommendation: string;
  reason: string;
  confidence_score: number;
  expected_impact_aed: number;
  best_industry: string;
  best_offer: string;
  best_source: string;
  risk_alert?: string;
  gap_analysis?: any;
  created_at?: string;
}

export interface IndustryPerformanceItem {
  industry: string;
  opportunities_generated: number;
  qualified_leads: number;
  proposals_sent: number;
  won_deals: number;
  lost_deals: number;
  revenue_generated_aed: number;
  pipeline_value_aed: number;
  conversion_rate_pct: number;
  performance_tier: "BEST_PERFORMING" | "NEEDS_IMPROVEMENT" | "LOW_PRIORITY";
  recommendation: string;
}

export interface OfferOptimizationItem {
  offer_id: number;
  product_name: string;
  unit_pricing_aed: number;
  target_audience: string;
  created_count: number;
  replies_count: number;
  deals_won_count: number;
  revenue_generated_aed: number;
  conversion_rate_pct: number;
  reply_rate_pct: number;
  action: "SCALE_OFFER" | "MODIFY_PRICING" | "MODIFY_PITCH" | "PAUSE";
  recommendation: string;
  confidence_score: number;
}

export interface SourcePerformanceItem {
  source_name: string;
  display_name: string;
  signals_found: number;
  qualified_leads: number;
  deals_won: number;
  revenue_generated_aed: number;
  pipeline_value_aed: number;
  conversion_rate_pct: number;
  efficiency_tier: string;
  efficiency_label: string;
}

export interface RevenueGapAnalysis {
  mission_id: number;
  target_revenue_aed: number;
  confirmed_revenue_aed: number;
  raw_pipeline_value_aed: number;
  weighted_pipeline_value_aed: number;
  net_revenue_gap_aed: number;
  deadline_hours: number;
  required_velocity_aed_per_hour: number;
  required_qualified_leads: number;
  required_discovery_calls: number;
  required_proposals: number;
  required_closing_deals: number;
  action_summary: string;
}

export interface TopPriorityAction {
  lead_id: number;
  mission_id: number;
  prospect_name: string;
  company: string;
  channel: string;
  action_title: string;
  action_type: string;
  deal_value_aed: number;
  closing_probability: number;
  qualification_score: number;
  priority_score: number;
  recommendation_reason: string;
  rank: number;
}

export interface WeeklyBusinessReport {
  mission_id: number;
  report_period: string;
  revenue: {
    generated_aed: number;
    pipeline_aed: number;
    target_aed: number;
    deals_won_count: number;
    deals_lost_count: number;
  };
  performance: {
    best_source: string;
    best_industry: string;
    best_offer: string;
    overall_conversion_rate_pct: number;
  };
  problems_and_bottlenecks: string[];
  next_week_strategy: string[];
}

export interface CEOBriefing {
  mission_id: number;
  briefing_date: string;
  yesterday_performance: {
    revenue_closed_aed: number;
    active_leads_in_pipeline: number;
    hot_opportunities_active: number;
  };
  today_revenue_target_aed: number;
  top_opportunities_summary: string;
  top_actions: TopPriorityAction[];
  risk_alerts: string[];
  recommended_strategy: string;
}

export interface ControlRoomTelemetry {
  total_active_missions: number;
  total_missions_count: number;
  current_mission: {
    id: number | null;
    title: string;
    goal_amount: number;
    revenue_generated: number;
    currency: string;
    status: string;
  } | null;
  total_revenue_target_aed: number;
  total_revenue_achieved_aed: number;
  total_active_pipeline_aed: number;
  total_leads_in_pipeline: number;
  pending_approvals_count: number;
  best_performing_industry: string;
  best_performing_source: string;
  best_performing_offer: string;
  hunter_fleet: HunterFleetItem[];
  timestamp: string;
}

export interface HunterFleetItem {
  source_key: string;
  display_name: string;
  efficiency_tier: string;
  signals_discovered: number;
  deals_won: number;
  revenue_generated_aed: number;
  priority_level: string;
  recommended_action: string;
  status: string;
}

export interface MissionBlueprint {
  mission_name: string;
  goal_amount: number;
  currency: string;
  deadline_hours: number;
  selected_industries: string[];
  selected_sources: string[];
  strategy_summary: string;
  creation_rationale: string;
  confidence_score: number;
  expected_revenue_aed: number;
  estimated_leads_needed: number;
  generated_at: string;
}

export interface TieredOfferPackage {
  tier: "STARTER" | "GROWTH" | "ENTERPRISE";
  package_name: string;
  price_aed: number;
  delivery_days: number;
  deliverables: string[];
  expected_roi: string;
  pitch: string;
}

export interface TieredOfferMatrix {
  industry: string;
  lead_requirement: string;
  tiers: {
    starter: TieredOfferPackage;
    growth: TieredOfferPackage;
    enterprise: TieredOfferPackage;
  };
}

export interface OperatorActionItem {
  id: number;
  type: "OPERATOR_ACTION";
  action_type: string;
  title: string;
  description: string;
  confidence_score: number;
  revenue_impact_aed: number;
  created_at: string;
  status: string;
  payload: Record<string, any>;
}

export interface OperatorCommunicationItem {
  id: number;
  type: "OUTREACH_COMMUNICATION";
  channel: string;
  message_type: string;
  subject: string;
  body: string;
  lead_id: number;
  created_at: string;
  status: string;
}

export interface PendingApprovalQueue {
  total_pending_count: number;
  pending_operator_actions: OperatorActionItem[];
  pending_communications: OperatorCommunicationItem[];
}

export interface BusinessGrowthMemoryItem {
  id: number;
  mission_id?: number;
  cycle_type: string;
  insight_summary: string;
  best_industries: string[];
  best_offers: string[];
  best_sources: string[];
  winning_strategies: string[];
  revenue_generated_aed: number;
  efficiency_gain_pct: number;
  created_at: string;
}

export interface GrowthCommandCenterStats {
  growth_score: number;
  best_strategy: string;
  winning_offer: string;
  winning_source: string;
  active_experiments_count: number;
  concluded_experiments_count: number;
  learning_metrics: {
    won_deals_count: number;
    lost_deals_count: number;
    total_revenue_generated_aed: number;
    overall_conversion_rate: number;
    best_performing_industry: string;
    best_performing_source: string;
    best_performing_offer: string;
    best_pitch_strategy: string;
    optimization_recommendations: string[];
    growth_score: number;
  };
  experiments: {
    id: number;
    name: string;
    hypothesis: string;
    variant_a: string;
    variant_b: string;
    status: string;
    winning_variant: string;
    confidence_score: number;
    recommendation: string;
  }[];
  strategy_pivots: {
    type: string;
    target: string;
    action: string;
    expected_impact: string;
    confidence_score: number;
    trigger_reason: string;
  }[];
  pricing_intelligence: {
    offer_name: string;
    current_price_aed: number;
    historical_conversion_rate: number;
    pricing_recommendation: string;
    recommended_new_price_aed: number;
    rationale: string;
    confidence_score: number;
  }[];
}

export interface DepartmentSummary {
  name: string;
  department_type?: string;
  status: string;
  active_tasks_count?: number;
  workload_level?: string;
  revenue_attributed_aed?: number;
  agents_count?: number;
  metrics?: Record<string, any>;
}

export interface EmployeeScorecard {
  employee_id?: string;
  agent_role?: string;
  role?: string;
  department: string;
  tasks_completed_today?: number;
  tasks_completed?: number;
  revenue_attributed_aed?: number;
  revenue_generated_aed?: number;
  success_rate_pct?: number;
  efficiency_score?: number;
  workload_score?: number;
  status?: string;
  grade?: string;
  strengths?: string[];
}

export interface MorningCEOReport {
  report_title: string;
  date: string;
  time_gst: string;
  company_health_status: string;
  yesterday: {
    revenue_closed_aed: number;
    deals_won_count: number;
    deals_lost_count: number;
    summary: string;
  };
  today: {
    daily_revenue_target_aed: number;
    priority_actions: string[];
    department_tasks: Record<string, string>;
  };
  future: {
    growth_opportunities: {
      vector: string;
      projected_upside_aed: number;
      timeline: string;
    }[];
    executive_directive: string;
  };
}

export interface RevenueEmpireData {
  company_name: string;
  operating_status: string;
  company_revenue_aed: number;
  net_profit_aed: number;
  active_pipeline_aed: number;
  growth_score: number;
  total_active_departments: number;
  org_chart: {
    company_name: string;
    headquarters: string;
    structure: string;
    total_departments: number;
    departments: Record<string, any>;
    operational_status: string;
    last_synced_at: string;
  };
  departments: {
    sales: any;
    marketing: any;
    lead_gen: any;
    product: any;
    finance: any;
    customer_success: any;
  };
  employee_scorecards: EmployeeScorecard[];
  morning_ceo_report: MorningCEOReport;
  financial_forecast: {
    "30_day_forecast_aed": number;
    "60_day_forecast_aed": number;
    "90_day_forecast_aed": number;
    confidence_level: string;
    primary_growth_driver: string;
  };
  top_opportunities: {
    lead_id: number;
    name: string;
    company: string;
    deal_value_aed: number;
    qualification_score: number;
    current_stage: string;
    recommended_action: string;
    closing_probability_pct: number;
  }[];
  strategic_recommendations: string[];
}

export interface ScalingEngineData {
  scaling_engine_status: string;
  company_growth_score: number;
  scaling_modules_active: number;
  hiring_intelligence: {
    active_workload_summary: {
      active_pipeline_leads: number;
      total_workload_index_pct: number;
      bottlenecks_detected: number;
    };
    department_workloads: any[];
    hiring_recommendations: {
      role_needed: string;
      engagement_type: string;
      target_department: string;
      reason: string;
      estimated_monthly_cost_aed: number;
      projected_revenue_unlocked_aed: number;
      expected_roi_multiplier: number;
      urgency: string;
      status: string;
    }[];
    executive_summary: string;
  };
  outsource_intelligence: {
    kpis: {
      active_outsource_packages: number;
      total_outsource_budget_aed: number;
      total_client_value_unlocked_aed: number;
      blended_margin_pct: number;
    };
    outsource_packages: any[];
    vendor_guidelines: string[];
  };
  partnership_intelligence: {
    kpis: {
      active_partner_opportunities: number;
      total_partner_pipeline_aed: number;
      highest_impact_niche: string;
      ecosystem_expansion_rate: string;
    };
    partnerships: any[];
    partnership_principles: string[];
  };
  investor_intelligence: {
    kpis: {
      funding_readiness_score: number;
      implied_valuation_range_aed: string;
      optimal_fundraising_timeline: string;
      primary_growth_narrative: string;
    };
    investor_profiles: any[];
    capital_strategy_recommendations: string[];
  };
  market_expansion: {
    kpis: {
      markets_analyzed_count: number;
      expand_markets_count: number;
      test_markets_count: number;
      ignore_markets_count: number;
      total_expansion_tam_aed: number;
    };
    markets: any[];
    strategic_expansion_directives: string[];
  };
  competitor_intelligence: {
    kpis: {
      competitors_tracked_count: number;
      market_gaps_identified_count: number;
      pricing_competitiveness_index: string;
      speed_to_value_multiplier: string;
    };
    competitors: any[];
    market_gaps: string[];
    competitive_advantage_recommendations: string[];
  };
  brand_growth: {
    kpis: {
      platforms_active_count: number;
      total_weekly_content_touchpoints: number;
      authority_index_score: number;
      monthly_organic_reach_target: number;
    };
    platforms_strategy: any[];
    brand_milestones: any[];
    authority_recommendations: string[];
  };
  content_pipeline: {
    kpis: {
      daily_content_batch_size: number;
      platforms_covered: string[];
      content_readiness_score: number;
      projected_weekly_impressions: number;
    };
    daily_assets: {
      platform: string;
      content_type: string;
      title: string;
      hook: string;
      body: string;
      call_to_action: string;
      target_audience: string;
      status: string;
    }[];
    content_factory_rules: string[];
  };
  sales_automation: {
    kpis: {
      active_pipeline_leads: number;
      stalled_deals_monitored: number;
      deal_rescues_active: number;
      upsell_pipeline_potential_aed: number;
      automated_closing_velocity_multiplier: number;
    };
    prioritized_leads: any[];
    deal_rescue_recommendations: any[];
    follow_up_intelligence: any[];
    upsell_opportunities: any[];
  };
  top_scaling_directives: string[];
  last_evaluated_at: string;
}

export interface EnterpriseCompanyOverview {
  id: number;
  name: string;
  slug: string;
  industry: string;
  country: string;
  currency: string;
  tier_plan: string;
  status: string;
  active_ai_employees_count: number;
  business_metrics: {
    monthly_revenue_aed: number;
    pipeline_value_aed: number;
    active_clients_count: number;
    efficiency_score: number;
  };
  created_at: string;
}

export interface AIEmployeeCatalogItem {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar_icon: string;
  skills: string[];
  tasks: string[];
  performance_score: number;
  monthly_fee_aed: number;
  monthly_value_delivered_aed: number;
  roi_multiplier: number;
  availability: string;
}

export interface EnterpriseNetworkData {
  network_status: string;
  total_companies_count: number;
  total_ai_workers_deployed: number;
  total_mrr_aed: number;
  total_arr_aed: number;
  total_client_interactions_processed: number;
  companies: EnterpriseCompanyOverview[];
  marketplace_catalog: AIEmployeeCatalogItem[];
  available_plans: {
    plan_name: string;
    monthly_price_aed: number;
    ai_employee_limit: number;
    api_call_quota: number;
    included_features: string[];
    target_business_size: string;
  }[];
  plan_distribution: Record<string, number>;
  admin_system_health: {
    tenant_isolation_status: string;
    memory_leak_check: string;
    webhook_uptime_pct: number;
    api_latency_ms: number;
  };
  last_synced_at: string;
}








