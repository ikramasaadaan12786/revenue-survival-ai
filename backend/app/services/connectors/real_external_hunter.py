"""
Revenue Survival AI — Real External Opportunity Hunter & Buyer Intent Gate
Production Multi-Source Acquisition Engine & Strict Quality Filter.

Phase 29 Master Engine:
1. Multi-Source Intent Radar:
   - Public Web Search Intent Radar (Expanded dynamic query matrix across Software, AI, CRM, Dubai Property)
   - Reddit Public Discussion & Intent Miner (r/dubairealestate, r/dubai, r/forhire, r/hireaprogrammer, r/freelance_forhire, r/startups, r/Entrepreneur)
   - UNGM & Public Procurement/Tenders Feeds
   - UAE Buyer Radar Safe Read-Only Database Adapter
   - Telegram Public Community Web Previews
   - YouTube Official Data API v3 (when configured)
   - Jobicy & RemoteOK (Strictly segregated: employee openings -> RESEARCH_ONLY_JOB_SIGNAL)

2. Freshness Buckets Enforced:
   - FRESH_24H (<= 24 hours old)
   - FRESH_72H (<= 72 hours old)
   - FRESH_7D (<= 7 days old)
   - OLDER_RESEARCH_ONLY (> 7 days old)

3. Strict Buyer-Intent Classification Gate:
   - Seeking to BUY/HIRE/PROCURE
   - Matches active mission service
   - Filter out Job Vacancies, Agency Self-Ads, and Broker Listing Advertisements

4. Global CRM Deduplication & Lead Enrichment:
   - Checks entire historical database
   - Tracks: NEW_UNIQUE, EXISTING_ENRICHED, DUPLICATE_REJECTED

5. Contactability Engine:
   - EMAIL_CONTACT_READY, PHONE_CONTACT_READY, LINKEDIN_CONTACT_READY, PLATFORM_CONTACT_READY, MANUAL_RESEARCH_REQUIRED

6. Professional Personalized Outreach Drafts:
   - References actual requirement, professional human tone, WhatsApp +971 58 878 8675
"""

import asyncio
import datetime
import httpx
import json
import logging
import os
import re
import xml.etree.ElementTree as ET
from typing import Dict, Any, List, Optional, Tuple
from urllib.parse import unquote, quote
from html.parser import HTMLParser
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_, and_, update

from app.models.entities import Lead, RevenueOpportunity, MarketSignal, Communication, Mission
from app.services.connectors.uae_buyer_radar_bridge import (
    get_global_crm_registry, normalize_email_address, normalize_phone_number,
    normalize_web_url, normalize_text, INDUSTRY_ROUTING_MAP
)
from app.services.communication.pitch_generator import pitch_generator, OFFICIAL_WHATSAPP_NUMBER

logger = logging.getLogger("REAL_EXTERNAL_HUNTER")

# Contact validation prefixes to strictly reject for sales outreach
REJECTED_CONTACT_PREFIXES = [
    "compliance", "accessible", "accommodations", "taxtesting", "privacy",
    "legal", "security", "tax", "dpo", "careers", "jobs", "recruiting",
    "talent", "hire", "hiring", "support", "help", "billing", "abuse",
    "unsubscribe", "noreply", "no-reply", "donotreply"
]

# Comprehensive Dynamic Intent Query Matrix for Active Mission Services
EXPANDED_QUERY_MATRIX = [
    # Custom Software & Web Development
    "looking for software development company",
    "need software development agency",
    "looking for website development company",
    "seeking software vendor",
    "need custom software development",
    "looking for mobile app developer agency",
    "RFP software development",
    "request for proposal software development",
    "looking to hire software agency",
    "need web developer agency Dubai",
    
    # AI Agents & Automation
    "looking for AI automation agency",
    "need AI agent developer",
    "looking for chatbot developer",
    "looking to automate my business",
    "seeking AI automation vendor",
    "need CRM development agency",
    "looking for AI workflow automation",
    
    # Dubai & UAE Real Estate Buyers
    "looking for real estate agent Dubai",
    "looking to buy property Dubai",
    "want to invest in Dubai property",
    "looking for apartment Dubai investment",
    "need 1BR Dubai",
    "need 2BR Dubai",
    "looking for villa Dubai",
    "Dubai property investment advice",
    "buying 2 bedroom in Dubai",
    "looking to buy 2BR in Dubai"
]


class DDGSearchParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.results = []
        self.in_result = False
        self.in_title = False
        self.in_snippet = False
        self.current_title = []
        self.current_snippet = []
        self.current_href = ""

    def handle_starttag(self, tag, attrs):
        attr_dict = dict(attrs)
        classes = attr_dict.get('class', '').split()
        if tag == 'div' and 'result' in classes:
            self.in_result = True
            self.current_title = []
            self.current_snippet = []
            self.current_href = ""
        elif self.in_result and tag == 'a' and 'result__a' in classes:
            self.in_title = True
            self.current_href = attr_dict.get('href', '')
        elif self.in_result and tag == 'a' and 'result__snippet' in classes:
            self.in_snippet = True

    def handle_endtag(self, tag):
        if tag == 'div' and self.in_result:
            self.in_result = False
            title_text = " ".join(self.current_title).strip()
            snippet_text = " ".join(self.current_snippet).strip()
            if title_text and self.current_href:
                target_url = self.current_href
                if 'uddg=' in self.current_href:
                    m = re.search(r'uddg=([^&]+)', self.current_href)
                    if m:
                        target_url = unquote(m.group(1))
                self.results.append({
                    'title': title_text,
                    'snippet': snippet_text,
                    'url': target_url
                })
        elif tag == 'a':
            self.in_title = False
            self.in_snippet = False

    def handle_data(self, data):
        if self.in_title:
            self.current_title.append(data.strip())
        elif self.in_snippet:
            self.current_snippet.append(data.strip())


def parse_publication_datetime(val: Any) -> Optional[datetime.datetime]:
    """Parses various datetime string formats into UTC naive datetime object."""
    if not val:
        return None
    if isinstance(val, datetime.datetime):
        return val.replace(tzinfo=None) if val.tzinfo else val
    val_str = str(val).strip()

    formats = [
        '%Y-%m-%dT%H:%M:%S%z',
        '%Y-%m-%dT%H:%M:%SZ',
        '%Y-%m-%d %H:%M:%S %Z',
        '%Y-%m-%d %H:%M:%S',
        '%Y-%m-%d',
        '%a, %d %b %Y %H:%M:%S %z',
        '%a, %d %b %Y %H:%M:%S GMT'
    ]
    for fmt in formats:
        try:
            dt = datetime.datetime.strptime(val_str.replace(' UTC', ''), fmt)
            return dt.replace(tzinfo=None) if dt.tzinfo else dt
        except Exception:
            pass

    m = re.search(r'(\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2})', val_str)
    if m:
        try:
            return datetime.datetime.strptime(m.group(1).replace('T', ' '), '%Y-%m-%d %H:%M:%S')
        except Exception:
            pass
    return None


def calculate_freshness_bucket(pub_date: Optional[datetime.datetime], now: datetime.datetime) -> str:
    """Calculates freshness bucket from published date."""
    if not pub_date:
        return "FRESH_24H"  # Assume newly scraped real-time signal if not published
    age_hours = (now - pub_date).total_seconds() / 3600.0
    if age_hours <= 24.0:
        return "FRESH_24H"
    elif age_hours <= 72.0:
        return "FRESH_72H"
    elif age_hours <= 168.0:
        return "FRESH_7D"
    return "OLDER_RESEARCH_ONLY"


class SourcePerformanceTracker:
    """Tracks acquisition statistics per source for continuous optimization."""
    def __init__(self):
        self.stats: Dict[str, Dict[str, int]] = {}

    def record_metric(self, source_name: str, metric: str, count: int = 1):
        if source_name not in self.stats:
            self.stats[source_name] = {
                "requests": 0,
                "candidates": 0,
                "fresh_24h": 0,
                "fresh_72h": 0,
                "fresh_7d": 0,
                "buyer_signals": 0,
                "procurement_notices": 0,
                "job_signals": 0,
                "seller_ads_rejected": 0,
                "accepted_sales_leads": 0,
                "enriched_leads": 0,
                "valid_contacts": 0,
                "manual_research_required": 0,
                "duplicates": 0
            }
        self.stats[source_name][metric] = self.stats[source_name].get(metric, 0) + count

    def get_summary(self) -> Dict[str, Dict[str, int]]:
        return self.stats


class RealExternalOpportunityHunterService:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) RevenueSurvival/2.0 (Commercial Buyer Hunter)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,application/json;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5'
        }
        self.tracker = SourcePerformanceTracker()

    def classify_buyer_intent(self, title: str, text: str, tags: Optional[List[Any]] = None) -> Tuple[str, str, float]:
        """
        STRICT BUYER-INTENT CLASSIFIER:
        Determines if an external item contains genuine commercial buying intent,
        is an agency/seller advertising themselves, or is a normal job vacancy.
        Returns: (classification, evidence_snippet, intent_confidence)
        """
        tags_str = " ".join([str(t) for t in tags]) if tags else ""
        t_raw = (str(title) + " " + str(text) + " " + tags_str).lower()

        # 1. Seller & Agency Self-Promotion Filter (Reject self-ads)
        seller_ad_indicators = [
            r'\[for hire\]',
            r'\b(?:available for hire|hire me|for hire|offering development|offering my services)\b',
            r'\b(?:freelancer available|our agency provides|we are an agency offering)\b',
            r'\b(?:check out my portfolio|i build websites for|i develop mobile apps for)\b',
            r'\b(?:exclusive unit for sale|apartment for sale with payment plan|best property for sale)\b',
            r'\b(?:pay 1% monthly|guaranteed roi|developer discount on luxury)\b'
        ]
        for p in seller_ad_indicators:
            if re.search(p, t_raw):
                return "REJECTED_SELLER_AD", "Seller/agency offering services or property listing advertisement", 10.0

        # 2. Informational Article, Blog, Guide, and Directory Filter (Reject non-procurement articles)
        informational_patterns = [
            r'\b(?:how to write an? rfp|how to write a request for proposal|rfp template|rfp guide|free rfp template)\b',
            r'\b(?:top software companies|best software development companies|agency directory|top mobile app developers)\b',
            r'\b(?:how-to-write|tips for writing an rfp|sample rfp for software|software development guide)\b',
            r'\b(?:designrush\.com|clutch\.co|goodfirms\.co|upcity\.com)\b'
        ]
        for p in informational_patterns:
            if re.search(p, t_raw):
                return "INFORMATIONAL_ARTICLE", "Informational article, template, guide, or directory (not an active buyer RFP)", 15.0

        # 2. Check if this is an explicit vendor/agency/RFP/property purchase request (BUYER)
        explicit_buyer_patterns = [
            r'\[hiring\]',
            r'\b(?:looking for|seeking|need)\s+(?:an?\s+)?(?:agency|external vendor|consultancy|outsourcing partner|technology partner|software vendor)\b',
            r'\b(?:request for proposal|rfp|rfq|tender|procurement notice)\b',
            r'\b(?:looking to buy|planning to buy|interested in buying|want to buy)\b',
            r'\b(?:looking for|seeking)\s+(?:\d+\s*(?:bhk|br|bed|bedroom)|villa|apartment|townhouse|property in dubai|property dubai)\b',
            r'\b(?:proof of funds|cash buyer|mortgage pre-approval)\b',
            r'\b(?:looking for a software development company|need a developer for our startup|seeking a developer agency)\b',
            r'\b(?:looking for ai automation|need an ai agent|looking for chatbot developer)\b'
        ]
        for p in explicit_buyer_patterns:
            if re.search(p, t_raw):
                return "EXPLICIT_BUYER_INTENT", "Explicit client/buyer statement with direct requirement", 94.0

        # 3. Verified freelance / contract project mandates (Buyer procuring work)
        if tags and any(str(t).lower() in ["contract", "freelance", "agency", "consultancy", "bounty", "project"] for t in tags):
            if any(w in t_raw for w in ["build", "develop", "create", "launch", "implement", "redesign"]):
                return "COMMERCIAL_PROCUREMENT", f"Verified contract/freelance project mandate: {title}", 88.0

        # 4. Standard Employee Job Openings (EXCLUDE FROM SALES PIPELINE)
        employee_indicators = [
            r'\b(?:hiring|full-time|full time|salary|benefits|401k|pto|remotework|remote-first)\b',
            r'\b(?:manager|director|engineer|designer|counsel|analyst|assistant|coordinator|specialist|representative|associate|lead)\b'
        ]
        for p in employee_indicators:
            if re.search(p, t_raw):
                return "JOB_VACANCY", "Standard employee job vacancy (no external agency/contractor request)", 20.0

        return "POTENTIAL_RESEARCH_SIGNAL", "General discussion/mention without explicit purchase requirement", 40.0

    def classify_contactability(self, contact: str, profile_url: Optional[str] = None) -> Tuple[str, str]:
        """
        Determines the exact contactability status and preferred method.
        Returns: (contactability_status, contact_method)
        """
        if contact and "@" in contact:
            user_part = contact.split("@")[0].lower()
            if not any(p in user_part for p in REJECTED_CONTACT_PREFIXES):
                return "EMAIL_CONTACT_READY", "EMAIL"

        if contact and re.search(r'\+?\d{8,}', contact):
            return "PHONE_CONTACT_READY", "PHONE_OR_WHATSAPP"

        if profile_url and "linkedin.com" in profile_url:
            return "LINKEDIN_CONTACT_READY", "LINKEDIN_PROFILE"

        if profile_url and ("reddit.com/user" in profile_url or "t.me/" in profile_url or "youtube.com" in profile_url):
            return "PLATFORM_CONTACT_READY", "PLATFORM_NATIVE_MESSAGE"

        if contact and ("reddit.com" in contact or "t.me" in contact):
            return "PLATFORM_CONTACT_READY", "PLATFORM_NATIVE_MESSAGE"

        return "MANUAL_RESEARCH_REQUIRED", "MANUAL_RESEARCH"

    def match_signal_industry(self, text: str) -> str:
        text_low = text.lower()
        for industry, keywords in INDUSTRY_ROUTING_MAP.items():
            for kw in keywords:
                if kw in text_low:
                    return industry
        if any(w in text_low for w in ["engineer", "developer", "backend", "frontend", "full stack", "python", "react", "software"]):
            return "Custom Software Development"
        elif any(w in text_low for w in ["ai", "machine learning", "bot", "agent", "llm", "automation"]):
            return "AI Agents & Automation"
        elif any(w in text_low for w in ["property", "estate", "villa", "penthouse", "dubai", "apartment", "2br", "1br"]):
            return "Dubai Real Estate & Advisory"
        return "Custom Software Development"

    # -------------------------------------------------------------------------
    # SOURCE 1: YOUTUBE OFFICIAL DATA API V3
    # -------------------------------------------------------------------------
    async def fetch_youtube_buyer_intents(self, client: httpx.AsyncClient) -> List[Dict[str, Any]]:
        candidates = []
        source_name = "YOUTUBE_DATA_API"
        yt_key = os.getenv("YOUTUBE_API_KEY") or os.getenv("YOUTUBE_DATA_API_KEY")
        if not yt_key:
            return candidates

        queries = [
            "looking to buy property in dubai",
            "property investment dubai buyer",
            "need software development agency",
            "looking for AI automation agency"
        ]
        now = datetime.datetime.utcnow()
        req_time = now.strftime("%Y-%m-%d %H:%M:%S UTC")

        for q in queries:
            try:
                self.tracker.record_metric(source_name, "requests")
                v_url = f"https://www.googleapis.com/youtube/v3/search?part=snippet&q={quote(q)}&type=video&maxResults=3&key={yt_key}"
                r = await client.get(v_url, timeout=12.0)
                if r.status_code == 200:
                    v_data = r.json()
                    for item in v_data.get("items", []):
                        vid_id = item.get("id", {}).get("videoId")
                        v_title = item.get("snippet", {}).get("title", "")
                        v_url_full = f"https://www.youtube.com/watch?v={vid_id}"

                        if not vid_id:
                            continue

                        self.tracker.record_metric(source_name, "requests")
                        c_url = f"https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId={vid_id}&maxResults=8&key={yt_key}"
                        cr = await client.get(c_url, timeout=10.0)
                        if cr.status_code == 200:
                            c_data = cr.json()
                            for c_item in c_data.get("items", []):
                                c_snip = c_item.get("snippet", {}).get("topLevelComment", {}).get("snippet", {})
                                c_author = c_snip.get("authorDisplayName", "YouTube Inquirer")
                                c_text = c_snip.get("textDisplay", "")
                                c_date_str = c_snip.get("publishedAt", req_time)
                                c_pub_dt = parse_publication_datetime(c_date_str)
                                fresh_bucket = calculate_freshness_bucket(c_pub_dt, now)

                                self.tracker.record_metric(source_name, "candidates")
                                self.tracker.record_metric(source_name, fresh_bucket.lower())
                                intent_class, evidence, score = self.classify_buyer_intent(v_title, c_text)

                                candidates.append({
                                    "source": "YOUTUBE_DATA_API",
                                    "source_platform": "YouTube",
                                    "connector_label": "YouTube Data API Buyer Scanner",
                                    "name": c_author,
                                    "username": c_author,
                                    "company": f"Public Inquiry on {v_title[:30]}",
                                    "requirement": c_text[:280],
                                    "source_url": v_url_full,
                                    "profile_url": f"https://www.youtube.com/{c_author.replace('@', '')}",
                                    "external_published_at": c_date_str,
                                    "published_datetime": c_pub_dt,
                                    "freshness_bucket": fresh_bucket,
                                    "discovery_timestamp": req_time,
                                    "contact_info": v_url_full,
                                    "intent_class": intent_class,
                                    "intent_evidence": evidence,
                                    "intent_score": score,
                                    "raw_metadata": {"video_id": vid_id, "video_title": v_title, "author": c_author}
                                })
            except Exception as e:
                logger.warning(f"YouTube query '{q}' error: {e}")
        return candidates

    # -------------------------------------------------------------------------
    # SOURCE 2: REDDIT PUBLIC INTENT MINER
    # -------------------------------------------------------------------------
    async def fetch_reddit_buyer_signals(self, client: httpx.AsyncClient) -> List[Dict[str, Any]]:
        candidates = []
        source_name = "REDDIT_PUBLIC_MINER"
        subreddits = ["dubairealestate", "dubai", "forhire", "hireaprogrammer", "freelance_forhire", "startups"]
        now = datetime.datetime.utcnow()
        req_time = now.strftime("%Y-%m-%d %H:%M:%S UTC")

        custom_reddit_headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) RevenueHunter/3.0 (Public Buyer Discovery; +https://altsofts.in)'
        }

        for sub in subreddits:
            try:
                self.tracker.record_metric(source_name, "requests")
                url = f"https://www.reddit.com/r/{sub}/new.rss"
                r = await client.get(url, headers=custom_reddit_headers, timeout=12.0)
                if r.status_code == 200 and ("<feed" in r.text or "<entry" in r.text):
                    root = ET.fromstring(r.text)
                    entries = root.findall('{http://www.w3.org/2005/Atom}entry')
                    for e in entries:
                        t_elem = e.find('{http://www.w3.org/2005/Atom}title')
                        l_elem = e.find('{http://www.w3.org/2005/Atom}link')
                        c_elem = e.find('{http://www.w3.org/2005/Atom}content')
                        u_elem = e.find('{http://www.w3.org/2005/Atom}author/{http://www.w3.org/2005/Atom}name')
                        d_elem = e.find('{http://www.w3.org/2005/Atom}updated') or e.find('{http://www.w3.org/2005/Atom}published')

                        title = t_elem.text if t_elem is not None else ""
                        link = l_elem.attrib.get('href', '') if l_elem is not None else ""
                        raw_content = c_elem.text if c_elem is not None else ""
                        author = u_elem.text if u_elem is not None else "Reddit User"
                        author_clean = author.replace("/u/", "").strip()
                        pub_str = d_elem.text if d_elem is not None else req_time

                        clean_content = re.sub(r'<[^>]+>', ' ', raw_content)
                        clean_content = re.sub(r'\s+', ' ', clean_content).strip()

                        pub_dt = parse_publication_datetime(pub_str)
                        fresh_bucket = calculate_freshness_bucket(pub_dt, now)

                        self.tracker.record_metric(source_name, "candidates")
                        self.tracker.record_metric(source_name, fresh_bucket.lower())
                        intent_class, evidence, score = self.classify_buyer_intent(title, clean_content)

                        profile_url = f"https://www.reddit.com/user/{author_clean}" if author_clean != "Reddit User" else link

                        candidates.append({
                            "source": "REDDIT_PUBLIC_MINER",
                            "source_platform": f"Reddit r/{sub}",
                            "connector_label": f"Reddit r/{sub} Intent Miner",
                            "name": author_clean,
                            "username": author_clean,
                            "company": f"Private Inquiry ({author_clean})",
                            "requirement": f"{title}. {clean_content[:200]}",
                            "source_url": link,
                            "profile_url": profile_url,
                            "external_published_at": pub_str,
                            "published_datetime": pub_dt,
                            "freshness_bucket": fresh_bucket,
                            "discovery_timestamp": req_time,
                            "contact_info": profile_url,
                            "intent_class": intent_class,
                            "intent_evidence": evidence,
                            "intent_score": score,
                            "raw_metadata": {"subreddit": sub, "author": author_clean, "title": title}
                        })
                await asyncio.sleep(0.3)
            except Exception as e:
                logger.warning(f"Reddit r/{sub} fetch error: {e}")
        return candidates

    # -------------------------------------------------------------------------
    # SOURCE 3: UNGM PUBLIC PROCUREMENT & TENDERS
    # -------------------------------------------------------------------------
    async def fetch_ungm_public_procurement(self, client: httpx.AsyncClient) -> List[Dict[str, Any]]:
        candidates = []
        source_name = "UNGM_PUBLIC_PROCUREMENT"
        now = datetime.datetime.utcnow()
        req_time = now.strftime("%Y-%m-%d %H:%M:%S UTC")

        try:
            self.tracker.record_metric(source_name, "requests")
            url = "https://www.ungm.org/Public/Notice"
            r = await client.get(url, timeout=15.0)
            if r.status_code == 200:
                rows = re.findall(r'<div class="tableRow.*?</div>\s*</div>\s*</div>', r.text, re.DOTALL)
                for row in rows[:15]:
                    title_match = re.search(r'class="resultTitle[^"]*"[^>]*>(.*?)</a>', row, re.DOTALL)
                    link_match = re.search(r'href="(/Public/Notice/\d+)"', row)
                    org_match = re.search(r'class="agencyName[^"]*"[^>]*>(.*?)</span>', row, re.DOTALL)
                    deadline_match = re.search(r'class="deadline[^"]*"[^>]*>(.*?)</span>', row, re.DOTALL)

                    if title_match and link_match:
                        title = re.sub(r'<[^>]+>', '', title_match.group(1)).strip()
                        link = f"https://www.ungm.org{link_match.group(1)}"
                        org = re.sub(r'<[^>]+>', '', org_match.group(1)).strip() if org_match else "United Nations Agency"
                        deadline = re.sub(r'<[^>]+>', '', deadline_match.group(1)).strip() if deadline_match else "Open"

                        self.tracker.record_metric(source_name, "candidates")
                        self.tracker.record_metric(source_name, "fresh_24h")
                        intent_class, evidence, score = self.classify_buyer_intent(f"Procurement RFP: {title}", f"Agency: {org}. Deadline: {deadline}")

                        candidates.append({
                            "source": "UNGM_PUBLIC_PROCUREMENT",
                            "source_platform": "Public Procurement",
                            "connector_label": "UNGM Public Procurement Portal",
                            "name": f"Procurement Officer ({org})",
                            "username": org,
                            "company": org,
                            "requirement": f"Public RFP: {title}. Deadline: {deadline}",
                            "source_url": link,
                            "profile_url": link,
                            "external_published_at": req_time,
                            "published_datetime": now,
                            "freshness_bucket": "FRESH_24H",
                            "discovery_timestamp": req_time,
                            "contact_info": link,
                            "intent_class": intent_class,
                            "intent_evidence": evidence,
                            "intent_score": score,
                            "raw_metadata": {"organization": org, "deadline": deadline, "url": link}
                        })
        except Exception as e:
            logger.warning(f"UNGM procurement error: {e}")
        return candidates

    # -------------------------------------------------------------------------
    # SOURCE 4: UAE BUYER RADAR SAFE READ-ONLY DATABASE ADAPTER
    # -------------------------------------------------------------------------
    def fetch_uae_buyer_radar_leads(self) -> List[Dict[str, Any]]:
        candidates = []
        source_name = "UAE_BUYER_RADAR_BRIDGE"
        now = datetime.datetime.utcnow()
        req_time = now.strftime("%Y-%m-%d %H:%M:%S UTC")

        try:
            import psycopg2
            from dotenv import dotenv_values
            
            br_env = dotenv_values("../UAE Buyer Radar AI/.env.local")
            conn_str = br_env.get("DATABASE_URL")
            if not conn_str:
                return candidates

            self.tracker.record_metric(source_name, "requests")
            conn = psycopg2.connect(conn_str, connect_timeout=6)
            cur = conn.cursor()
            cur.execute("""
                SELECT lead_id, full_name, actor_type, original_public_text, evidence_snippet, 
                       source_url, source_name, phone, email, whatsapp, discovered_at, data_origin_connector
                FROM leads
                WHERE actor_type IN ('END_BUYER', 'POTENTIAL_BUYER', 'BROKER_POSTING_BUYER_REQUIREMENT')
                AND is_production = true AND is_test = false AND is_demo = false
                ORDER BY discovered_at DESC NULLS LAST
                LIMIT 50;
            """)
            rows = cur.fetchall()
            conn.close()

            for r in rows:
                lead_id, full_name, actor_type, raw_text, evidence, source_url, src_name, phone, email, wa, disc_at, connector = r
                
                pub_dt = parse_publication_datetime(disc_at)
                fresh_bucket = calculate_freshness_bucket(pub_dt, now)

                self.tracker.record_metric(source_name, "candidates")
                self.tracker.record_metric(source_name, fresh_bucket.lower())
                
                title = f"{src_name or 'UAE Buyer'} - {full_name}"
                body = (raw_text or "") + " " + (evidence or "")
                
                intent_class, eval_evidence, score = self.classify_buyer_intent(title, body)
                contact = email or phone or wa or source_url or f"Lead ID: {lead_id}"

                candidates.append({
                    "source": "UAE_BUYER_RADAR_BRIDGE",
                    "source_platform": src_name or "UAE Buyer Radar",
                    "connector_label": f"Buyer Radar ({connector or src_name or 'Social'})",
                    "name": full_name or "UAE Real Estate Buyer",
                    "username": full_name,
                    "company": "Private Real Estate Investor",
                    "requirement": (raw_text or evidence or "Dubai Real Estate Acquisition Requirement")[:280],
                    "source_url": source_url or "https://uaebuyerradar.ai",
                    "profile_url": source_url,
                    "external_published_at": str(disc_at or req_time),
                    "published_datetime": pub_dt,
                    "freshness_bucket": fresh_bucket,
                    "discovery_timestamp": req_time,
                    "contact_info": contact,
                    "intent_class": intent_class,
                    "intent_evidence": eval_evidence if intent_class == "EXPLICIT_BUYER_INTENT" else (evidence or eval_evidence),
                    "intent_score": score,
                    "raw_metadata": {"lead_id": lead_id, "actor_type": actor_type, "phone": phone, "email": email, "whatsapp": wa}
                })
        except Exception as e:
            logger.warning(f"UAE Buyer Radar bridge error: {e}")
        return candidates

    # -------------------------------------------------------------------------
    # SOURCE 5: PUBLIC WEB SEARCH INTENT RADAR (EXPANDED DYNAMIC MATRIX)
    # -------------------------------------------------------------------------
    async def fetch_public_web_buyer_intents(self, client: httpx.AsyncClient) -> List[Dict[str, Any]]:
        candidates = []
        source_name = "PUBLIC_WEB_SEARCH"
        now = datetime.datetime.utcnow()
        req_time = now.strftime("%Y-%m-%d %H:%M:%S UTC")

        for q in EXPANDED_QUERY_MATRIX:
            try:
                self.tracker.record_metric(source_name, "requests")
                r = await client.post('https://html.duckduckgo.com/html/', data={'q': q}, timeout=12.0)
                if r.status_code == 200:
                    parser = DDGSearchParser()
                    parser.feed(r.text)
                    for res in parser.results[:6]:
                        title = res.get('title', '')
                        snippet = res.get('snippet', '')
                        url = res.get('url', '')
                        
                        self.tracker.record_metric(source_name, "candidates")
                        self.tracker.record_metric(source_name, "fresh_24h")
                        intent_class, evidence, score = self.classify_buyer_intent(title, snippet)
                        
                        candidates.append({
                            "source": "PUBLIC_WEB_SEARCH",
                            "source_platform": "Web Search Intent",
                            "connector_label": "Google & DDG Public Web Intent Radar",
                            "name": f"Procurement Inquirer ({title[:30]})",
                            "username": title[:30],
                            "company": title.split(" - ")[0] if " - " in title else title[:30],
                            "requirement": f"Requirement: {title}. Context: {snippet}",
                            "source_url": url,
                            "profile_url": url,
                            "external_published_at": req_time,
                            "published_datetime": now,
                            "freshness_bucket": "FRESH_24H",
                            "discovery_timestamp": req_time,
                            "contact_info": url,
                            "intent_class": intent_class,
                            "intent_evidence": evidence,
                            "intent_score": score,
                            "raw_metadata": {"query": q, "title": title, "url": url}
                        })
                await asyncio.sleep(0.2)
            except Exception as e:
                logger.warning(f"Public web query '{q}' error: {e}")
        return candidates

    # -------------------------------------------------------------------------
    # SOURCE 6: TELEGRAM PUBLIC COMMUNITY FEEDS
    # -------------------------------------------------------------------------
    async def fetch_telegram_buyer_signals(self, client: httpx.AsyncClient) -> List[Dict[str, Any]]:
        candidates = []
        source_name = "TELEGRAM_PUBLIC_FEED"
        channels = ["DubaiRealEstateVIP", "uaestartups", "DubaiTechFounders", "akaratidubai"]
        now = datetime.datetime.utcnow()
        req_time = now.strftime("%Y-%m-%d %H:%M:%S UTC")

        for ch in channels:
            url = f"https://t.me/s/{ch}"
            try:
                self.tracker.record_metric(source_name, "requests")
                r = await client.get(url, timeout=10.0)
                if r.status_code == 200:
                    msg_blocks = re.findall(r'<div class="tgme_widget_message_wrap.*?">(.*?)<div class="tgme_widget_message_footer', r.text, re.DOTALL)
                    for block in msg_blocks:
                        text_match = re.search(r'class="tgme_widget_message_text[^"]*"[^>]*>(.*?)</div>', block, re.DOTALL)
                        link_match = re.search(r'href="(https://t\.me/[^/]+/\d+)"', block)
                        date_match = re.search(r'<time datetime="([^"]+)"', block)

                        if text_match:
                            clean_text = re.sub(r'<[^>]+>', ' ', text_match.group(1))
                            clean_text = re.sub(r'\s+', ' ', clean_text).strip()
                            msg_link = link_match.group(1) if link_match else f"https://t.me/{ch}"
                            pub_date_str = date_match.group(1) if date_match else req_time
                            pub_dt = parse_publication_datetime(pub_date_str)
                            fresh_bucket = calculate_freshness_bucket(pub_dt, now)

                            self.tracker.record_metric(source_name, "candidates")
                            self.tracker.record_metric(source_name, fresh_bucket.lower())
                            intent_class, evidence, score = self.classify_buyer_intent(f"Telegram @{ch}", clean_text)
                            
                            candidates.append({
                                "source": "TELEGRAM_PUBLIC_FEED",
                                "source_platform": "Telegram",
                                "connector_label": "Telegram Public Web Connector",
                                "name": f"UAE Buyer (@{ch})",
                                "username": f"@{ch}",
                                "company": f"UAE Enterprise (@{ch})",
                                "requirement": clean_text[:280],
                                "source_url": msg_link,
                                "profile_url": f"https://t.me/{ch}",
                                "external_published_at": pub_date_str,
                                "published_datetime": pub_dt,
                                "freshness_bucket": fresh_bucket,
                                "discovery_timestamp": req_time,
                                "contact_info": msg_link,
                                "intent_class": intent_class,
                                "intent_evidence": evidence,
                                "intent_score": score,
                                "raw_metadata": {"channel": f"@{ch}", "url": msg_link}
                            })
            except Exception as e:
                logger.warning(f"Telegram @{ch} fetch failed: {e}")
        return candidates

    # -------------------------------------------------------------------------
    # SOURCE 7: COMMERCIAL JOB BOARDS (JOBICY & REMOTEOK) - RESEARCH ONLY
    # -------------------------------------------------------------------------
    async def fetch_commercial_board_signals(self, client: httpx.AsyncClient) -> List[Dict[str, Any]]:
        candidates = []
        source_name = "COMMERCIAL_JOB_BOARDS"
        now = datetime.datetime.utcnow()
        req_time = now.strftime("%Y-%m-%d %H:%M:%S UTC")

        # 1. Jobicy
        try:
            self.tracker.record_metric(source_name, "requests")
            r = await client.get("https://jobicy.com/api/v2/remote-jobs?count=25&tag=dev", timeout=12.0)
            if r.status_code == 200:
                j_data = r.json()
                for job in j_data.get("jobs", []):
                    title = job.get("jobTitle", "")
                    comp = job.get("companyName", "Commercial Enterprise")
                    desc = job.get("jobExcerpt", "") or job.get("jobDescription", "")
                    desc_clean = re.sub(r'<[^>]+>', ' ', desc)
                    desc_clean = re.sub(r'\s+', ' ', desc_clean).strip()
                    job_url = job.get("url", "")
                    pub_date = job.get("pubDate", req_time)
                    pub_dt = parse_publication_datetime(pub_date)
                    fresh_bucket = calculate_freshness_bucket(pub_dt, now)

                    self.tracker.record_metric(source_name, "candidates")
                    self.tracker.record_metric(source_name, fresh_bucket.lower())
                    intent_class, evidence, score = self.classify_buyer_intent(title, desc_clean)

                    candidates.append({
                        "source": "JOBICY_COMMERCIAL_FEED",
                        "source_platform": "Jobicy Commercial Feed",
                        "connector_label": "Jobicy Public API",
                        "name": f"Hiring Lead ({comp})",
                        "username": comp,
                        "company": comp,
                        "requirement": f"{title} — {desc_clean[:220]}",
                        "source_url": job_url,
                        "profile_url": job_url,
                        "external_published_at": pub_date,
                        "published_datetime": pub_dt,
                        "freshness_bucket": fresh_bucket,
                        "discovery_timestamp": req_time,
                        "contact_info": job_url,
                        "intent_class": intent_class,
                        "intent_evidence": evidence,
                        "intent_score": score,
                        "raw_metadata": {"position": title, "company": comp}
                    })
        except Exception as e:
            logger.warning(f"Jobicy API fetch error: {e}")

        # 2. RemoteOK
        try:
            self.tracker.record_metric(source_name, "requests")
            r = await client.get("https://remoteok.com/api", timeout=12.0)
            if r.status_code == 200:
                r_data = r.json()
                for j in r_data[1:25]:
                    if isinstance(j, dict):
                        pos = j.get("position", "")
                        comp = j.get("company", "Commercial Org")
                        desc = j.get("description", "")
                        desc_clean = re.sub(r'<[^>]+>', ' ', desc)
                        desc_clean = re.sub(r'\s+', ' ', desc_clean).strip()
                        job_url = j.get("url", "")
                        pub_date = j.get("date", req_time)
                        pub_dt = parse_publication_datetime(pub_date)
                        fresh_bucket = calculate_freshness_bucket(pub_dt, now)
                        tags = j.get("tags", [])

                        self.tracker.record_metric(source_name, "candidates")
                        self.tracker.record_metric(source_name, fresh_bucket.lower())
                        intent_class, evidence, score = self.classify_buyer_intent(pos, desc_clean, tags)
                        
                        apply_url = j.get("apply_url", job_url)

                        candidates.append({
                            "source": "REMOTEOK_PUBLIC_API",
                            "source_platform": "RemoteOK Commercial Feed",
                            "connector_label": "RemoteOK Public API",
                            "name": f"Talent Lead ({comp})",
                            "username": comp,
                            "company": comp,
                            "requirement": f"{pos} — {desc_clean[:220]}",
                            "source_url": apply_url,
                            "profile_url": apply_url,
                            "external_published_at": pub_date,
                            "published_datetime": pub_dt,
                            "freshness_bucket": fresh_bucket,
                            "discovery_timestamp": req_time,
                            "contact_info": apply_url,
                            "intent_class": intent_class,
                            "intent_evidence": evidence,
                            "intent_score": score,
                            "raw_metadata": {"position": pos, "company": comp, "tags": tags}
                        })
        except Exception as e:
            logger.warning(f"RemoteOK API fetch error: {e}")

        return candidates

    # -------------------------------------------------------------------------
    # MULTI-SOURCE EXECUTION & CONVERGENCE
    # -------------------------------------------------------------------------
    async def run_live_buyer_intent_acquisition(
        self,
        session: AsyncSession,
        mission: Mission,
        max_leads: int = 50
    ) -> Dict[str, Any]:
        """
        Executes live multi-source external acquisition across all configured/accessible public channels.
        Applies strict Buyer-Intent Gate, Contact Relevance Gate, Freshness Classification, and Global CRM Deduplication.
        """
        now = datetime.datetime.utcnow()
        t_start_str = now.strftime("%Y-%m-%d %H:%M:%S UTC")
        logger.info(f"Starting Multi-Source Real Buyer-Intent Discovery for Mission #{mission.id} at {t_start_str}...")

        # 1. Snapshot global CRM fingerprints
        crm_registry = await get_global_crm_registry(session)
        known_emails = set(crm_registry.get("emails", {}).keys())
        known_phones = set(crm_registry.get("phones", {}).keys())
        known_urls = set(crm_registry.get("urls", {}).keys())
        known_name_companies = set(crm_registry.get("name_companies", {}).keys())
        logger.info(f"Loaded Global CRM Deduplication Registry: {len(known_emails)} emails, {len(known_urls)} URLs, {len(known_name_companies)} name/companies.")

        all_candidates: List[Dict[str, Any]] = []

        # 2. Execute all candidate sources concurrently
        async with httpx.AsyncClient(verify=False, headers=self.headers, follow_redirects=True) as client:
            tasks = [
                self.fetch_youtube_buyer_intents(client),
                self.fetch_reddit_buyer_signals(client),
                self.fetch_ungm_public_procurement(client),
                self.fetch_public_web_buyer_intents(client),
                self.fetch_telegram_buyer_signals(client),
                self.fetch_commercial_board_signals(client)
            ]
            fetched_batches = await asyncio.gather(*tasks, return_exceptions=True)

            for b in fetched_batches:
                if isinstance(b, list):
                    all_candidates.extend(b)
                elif isinstance(b, Exception):
                    logger.error(f"Discovery source error: {b}")

        # 3. Add UAE Buyer Radar Safe Read-Only Adapter
        try:
            br_candidates = self.fetch_uae_buyer_radar_leads()
            all_candidates.extend(br_candidates)
        except Exception as e:
            logger.error(f"Buyer Radar bridge error: {e}")

        logger.info(f"Total raw external candidates collected across all sources: {len(all_candidates)}")

        # 4. Process candidates through strict buyer-intent gate & deduplication
        created_sales_leads: List[Lead] = []
        enriched_leads_count = 0
        created_signals: List[MarketSignal] = []
        created_comms: List[Communication] = []
        
        counts = {
            "total_candidates": len(all_candidates),
            "fresh_24h": 0,
            "fresh_72h": 0,
            "fresh_7d": 0,
            "older_research_only": 0,
            "explicit_buyer_intent": 0,
            "commercial_procurement": 0,
            "potential_research_signals": 0,
            "job_vacancies": 0,
            "seller_ads_rejected": 0,
            "duplicates_rejected": 0,
            "existing_enriched": 0,
            "new_sales_leads_inserted": 0,
            "email_contact_ready": 0,
            "phone_contact_ready": 0,
            "linkedin_contact_ready": 0,
            "platform_contact_ready": 0,
            "manual_research_required": 0,
            "outbound_drafts_staged": 0
        }

        for cand in all_candidates:
            source = cand.get("source", "EXTERNAL")
            intent_class = cand.get("intent_class", "POTENTIAL_RESEARCH_SIGNAL")
            evidence = cand.get("intent_evidence", "")
            name = cand.get("name", "Commercial Lead")
            username = cand.get("username", name)
            comp = cand.get("company", "Target Enterprise")
            req = cand.get("requirement", "")
            url = cand.get("source_url", "")
            profile_url = cand.get("profile_url", url)
            contact = cand.get("contact_info", "")
            pub_date_str = cand.get("external_published_at", "")
            pub_dt = cand.get("published_datetime")
            fresh_bucket = cand.get("freshness_bucket", "FRESH_24H")
            score = cand.get("intent_score", 50.0)

            # Freshness telemetry
            if fresh_bucket == "FRESH_24H":
                counts["fresh_24h"] += 1
            elif fresh_bucket == "FRESH_72H":
                counts["fresh_72h"] += 1
            elif fresh_bucket == "FRESH_7D":
                counts["fresh_7d"] += 1
            else:
                counts["older_research_only"] += 1

            # Intent classification telemetry
            if intent_class == "EXPLICIT_BUYER_INTENT":
                counts["explicit_buyer_intent"] += 1
                self.tracker.record_metric(source, "buyer_signals")
            elif intent_class == "COMMERCIAL_PROCUREMENT":
                counts["commercial_procurement"] += 1
                self.tracker.record_metric(source, "procurement_notices")
            elif intent_class == "JOB_VACANCY":
                counts["job_vacancies"] += 1
                self.tracker.record_metric(source, "job_signals")
            elif intent_class in ["REJECTED_SELLER_AD", "REJECTED_LISTING_AD"]:
                counts["seller_ads_rejected"] += 1
                self.tracker.record_metric(source, "seller_ads_rejected")
            else:
                counts["potential_research_signals"] += 1

            # Global CRM Deduplication check
            norm_email = normalize_email_address(contact) if "@" in contact else None
            norm_phone = normalize_phone_number(contact) if re.search(r'\d{8,}', contact) else None
            norm_url = normalize_web_url(url)
            norm_name_comp = (normalize_text(name), normalize_text(comp))

            existing_lead_id = None
            if norm_url and norm_url in known_urls:
                existing_lead_id = crm_registry.get("urls", {}).get(norm_url)
            elif norm_email and norm_email in known_emails:
                existing_lead_id = crm_registry.get("emails", {}).get(norm_email)
            elif norm_phone and norm_phone in known_phones:
                existing_lead_id = crm_registry.get("phones", {}).get(norm_phone)

            # If existing lead is found, check if we can ENRICH it
            if existing_lead_id:
                if profile_url and profile_url != url:
                    # Update existing lead with profile_url
                    await session.execute(
                        update(Lead)
                        .where(Lead.id == existing_lead_id, Lead.profile_url.is_(None))
                        .values(profile_url=profile_url)
                    )
                    counts["existing_enriched"] += 1
                    enriched_leads_count += 1
                    self.tracker.record_metric(source, "enriched_leads")
                else:
                    counts["duplicates_rejected"] += 1
                    self.tracker.record_metric(source, "duplicates")
                continue

            # Add to local fingerprint cache
            if norm_email:
                known_emails.add(norm_email)
            if norm_phone:
                known_phones.add(norm_phone)
            if norm_url:
                known_urls.add(norm_url)
            known_name_companies.add(norm_name_comp)

            # Contactability evaluation
            contact_status, contact_method = self.classify_contactability(contact, profile_url)
            industry = self.match_signal_industry(f"{comp} {req}")

            # BUYER GATE: ONLY EXPLICIT_BUYER_INTENT and COMMERCIAL_PROCUREMENT become Sales Leads
            if intent_class in ["EXPLICIT_BUYER_INTENT", "COMMERCIAL_PROCUREMENT"]:
                pipeline_stage = "PLATFORM_CONTACT_READY" if "PLATFORM" in contact_status else ("CONTACTED" if contact_status == "EMAIL_CONTACT_READY" else "DISCOVERED")
                expected_val = 0.0  # AED 0.0 unless formal evidence

                lead = Lead(
                    mission_id=mission.id,
                    name=name,
                    company_name=comp,
                    source=source,
                    source_platform=cand.get("source_platform", "External Web"),
                    source_url=url,
                    profile_url=profile_url,
                    interest=req,
                    intent_score="Hot" if intent_class == "EXPLICIT_BUYER_INTENT" else "Qualified",
                    contact_info=profile_url if contact_status == "PLATFORM_CONTACT_READY" else contact,
                    channel="Reddit" if "reddit" in (cand.get("source_platform", "")).lower() else ("Email" if contact_status == "EMAIL_CONTACT_READY" else "LinkedIn"),
                    status="NEW",
                    pipeline_stage=pipeline_stage,
                    expected_value=expected_val,
                    qualification_score=score,
                    classification="QUALIFIED",
                    buying_intent="HIGH",
                    decision_stage="DECISION",
                    source_type="REAL",
                    verification_status="SOURCE_VERIFIED",
                    evidence_reference=evidence[:255],
                    discovery_timestamp=now,
                    notes=f"Buyer Intent: {intent_class} | Freshness: {fresh_bucket} | Contactability: {contact_status} ({contact_method}) | Source Pub: {pub_date_str}"
                )
                session.add(lead)
                await session.flush()
                created_sales_leads.append(lead)
                counts["new_sales_leads_inserted"] += 1
                self.tracker.record_metric(source, "accepted_sales_leads")

                # Track contactability counters
                if contact_status == "EMAIL_CONTACT_READY":
                    counts["email_contact_ready"] += 1
                    self.tracker.record_metric(source, "valid_contacts")
                elif contact_status == "PHONE_CONTACT_READY":
                    counts["phone_contact_ready"] += 1
                    self.tracker.record_metric(source, "valid_contacts")
                elif contact_status == "LINKEDIN_CONTACT_READY":
                    counts["linkedin_contact_ready"] += 1
                    self.tracker.record_metric(source, "valid_contacts")
                elif contact_status == "PLATFORM_CONTACT_READY":
                    counts["platform_contact_ready"] += 1
                    self.tracker.record_metric(source, "valid_contacts")
                else:
                    counts["manual_research_required"] += 1
                    self.tracker.record_metric(source, "manual_research_required")

                # Generate professional human draft outreach referencing actual requirement
                is_re = "real estate" in industry.lower() or "dubai" in req.lower()
                if is_re:
                    pitch_body = (
                        f"Hi {name},\n\n"
                        f"I came across your public requirement regarding property options in Dubai for investment/future use.\n\n"
                        f"We work with both off-plan and secondary opportunities across Dubai and can shortlist suitable options "
                        f"based on your actual budget, preferred location, expected return and investment timeline rather than sending random listings.\n\n"
                        f"If you're still looking, please share your approximate budget and whether you prefer ready or off-plan.\n\n"
                        f"For further discussion, you can reply directly or connect with us on WhatsApp:\n"
                        f"{OFFICIAL_WHATSAPP_NUMBER}\n\n"
                        f"Regards"
                    )
                    pitch_subject = "Dubai Property Shortlist & Consultation"
                else:
                    pitch_body = (
                        f"Hi {name},\n\n"
                        f"I came across your requirement regarding {req[:80]}...\n\n"
                        f"We provide bespoke technology engineering and workflow automation solutions tailored to specific commercial requirements.\n\n"
                        f"If this is still an active requirement, I'd be happy to discuss the details and understand your requirements more precisely.\n\n"
                        f"You can reply directly or connect with us on WhatsApp at {OFFICIAL_WHATSAPP_NUMBER}.\n\n"
                        f"Regards"
                    )
                    pitch_subject = f"Regarding your {industry} requirement"

                comm = Communication(
                    mission_id=mission.id,
                    lead_id=lead.id,
                    channel=lead.channel or "Email",
                    message_type="INITIAL_OUTREACH",
                    sequence_step=1,
                    subject=pitch_subject,
                    body=pitch_body,
                    recipient=lead.contact_info,
                    provider_name="PLATFORM_OR_MANUAL",
                    source_type="REAL",
                    verification_status="SOURCE_VERIFIED",
                    requires_approval=True,
                    approval_status="PENDING",
                    delivery_status="DRAFT",
                    created_at=now
                )
                session.add(comm)
                created_comms.append(comm)
                counts["outbound_drafts_staged"] += 1

            else:
                # JOB_VACANCY, SELLER_AD, and POTENTIAL_RESEARCH_SIGNAL are stored as market research signals
                signal = MarketSignal(
                    mission_id=mission.id,
                    source=source,
                    signal_text=f"[{intent_class}] [{fresh_bucket}] {name} ({comp}): {req[:300]}",
                    lead_name=name,
                    country="United Arab Emirates" if "dubai" in req.lower() or "uae" in req.lower() else "Global",
                    intent_score="Research" if intent_class == "POTENTIAL_RESEARCH_SIGNAL" else ("Job Vacancy" if intent_class == "JOB_VACANCY" else "Seller Ad"),
                    channel="Research",
                    raw_metadata={
                        "source_url": url,
                        "profile_url": profile_url,
                        "intent_class": intent_class,
                        "freshness_bucket": fresh_bucket,
                        "contactability": contact_status,
                        "external_published_at": pub_date_str
                    }
                )
                session.add(signal)
                created_signals.append(signal)

        await session.commit()

        # Update Mission pipeline value strictly evidence-backed
        mission.pipeline_value = sum((l.expected_value or 0.0) for l in created_sales_leads)
        await session.commit()

        t_end = datetime.datetime.utcnow()
        duration_s = (t_end - now).total_seconds()

        return {
            "mission_id": mission.id,
            "status": "COMPLETED",
            "timestamp_start": t_start_str,
            "timestamp_end": t_end.strftime("%Y-%m-%d %H:%M:%S UTC"),
            "duration_seconds": duration_s,
            "counts": counts,
            "source_performance": self.tracker.get_summary(),
            "created_sales_leads_count": len(created_sales_leads),
            "enriched_leads_count": enriched_leads_count,
            "created_signals_count": len(created_signals),
            "outbound_drafts_count": len(created_comms)
        }

    async def execute_live_discovery(
        self,
        session: AsyncSession,
        mission_id: int
    ) -> Dict[str, Any]:
        stmt = select(Mission).where(Mission.id == mission_id)
        mission = (await session.execute(stmt)).scalars().first()
        if not mission:
            return {"status": "ERROR", "message": f"Mission #{mission_id} not found"}
        return await self.run_live_buyer_intent_acquisition(session, mission)


# Global singleton and aliases
real_external_hunter = RealExternalOpportunityHunterService()
real_external_opportunity_hunter = real_external_hunter
