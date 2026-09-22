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


