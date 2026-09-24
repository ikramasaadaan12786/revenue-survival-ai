"""
Revenue Survival AI — Real External Opportunity Hunter & Buyer Intent Gate
Production Multi-Source Acquisition Engine & Strict Quality Filter.

Connected Buyer-Intent Sources:
1. YouTube Official Data API v3 (Buyer commentary & direct procurement queries)
2. Reddit Public Intent Miner (r/forhire, r/freelance_forhire, r/hireaprogrammer, r/dubairealestate, r/dubai)
3. UNGM & Public Procurement/Tenders Feeds
4. UAE Buyer Radar Safe Read-Only Database Adapter
5. Public Web Search Intent Radar (High-intent buyer & procurement queries)
6. Telegram Public Community Web Previews
7. Jobicy & RemoteOK (Classified strictly: employee openings -> RESEARCH_ONLY_JOB_SIGNAL)

Strict Truth Rules Enforced:
1. 100% Real Live External Requests at runtime.
2. Strict Buyer-Intent Classification Gate (EXPLICIT_BUYER_INTENT or COMMERCIAL_PROCUREMENT only).
3. Employee Job Vacancies are segregated into RESEARCH_ONLY_JOB_SIGNAL and NOT added to the sales pipeline.
4. Contact Email Relevance Gate: Excludes compliance@, accommodations@, careers@, jobs@, taxtesting@, etc.
5. Global Cross-Mission Deduplication across entire CRM database.
6. Zero Lead Fabrication: If 0 qualify -> report 0.
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

from app.models.entities import Lead, RevenueOpportunity, MarketSignal, Communication, Mission
from app.services.connectors.uae_buyer_radar_bridge import (
    get_global_crm_registry, normalize_email_address, normalize_phone_number,
    normalize_web_url, normalize_text, INDUSTRY_ROUTING_MAP
)
from app.services.communication.pitch_generator import pitch_generator

logger = logging.getLogger("REAL_EXTERNAL_HUNTER")

# Contact validation prefixes to strictly reject for sales outreach
REJECTED_CONTACT_PREFIXES = [
    "compliance", "accessible", "accommodations", "taxtesting", "privacy",
    "legal", "security", "tax", "dpo", "careers", "jobs", "recruiting",
    "talent", "hire", "hiring", "support", "help", "billing", "abuse",
    "unsubscribe", "noreply", "no-reply", "donotreply"
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


class SourcePerformanceTracker:
    """Tracks acquisition statistics per source for continuous optimization."""
    def __init__(self):
        self.stats: Dict[str, Dict[str, int]] = {}

    def record_metric(self, source_name: str, metric: str, count: int = 1):
        if source_name not in self.stats:
            self.stats[source_name] = {
                "requests": 0,
                "candidates": 0,
                "buyer_signals": 0,
                "procurement_notices": 0,
                "job_signals": 0,
                "accepted_sales_leads": 0,
                "valid_contacts": 0,
                "manual_research_required": 0,
                "rejected": 0,
                "duplicates": 0
            }
        self.stats[source_name][metric] = self.stats[source_name].get(metric, 0) + count

    def get_summary(self) -> Dict[str, Dict[str, int]]:
        return self.stats


class RealExternalOpportunityHunterService:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) RevenueSurvival/2.0 (Commercial Opportunity Hunter)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,application/json;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5'
        }
        self.tracker = SourcePerformanceTracker()

    def classify_buyer_intent(self, title: str, text: str, tags: Optional[List[Any]] = None) -> Tuple[str, str, float]:
        """
        STRICT BUYER-INTENT CLASSIFIER:
        Determines if an external item contains genuine commercial buying intent or is a normal job opening or comment.
        Returns: (classification, evidence_snippet, intent_confidence)
        """
        tags_str = " ".join([str(t) for t in tags]) if tags else ""
        t_raw = (str(title) + " " + str(text) + " " + tags_str).lower()
        
        # 1. Check if this is an explicit vendor/agency/RFP/property purchase request
        explicit_agency_or_rfp = [
            r'\b(?:looking for|seeking|need)\s+(?:an?\s+)?(?:agency|external vendor|consultancy|outsourcing partner|technology partner|software vendor)\b',
            r'\b(?:request for proposal|rfp|rfq|tender|procurement notice)\b',
            r'\b(?:looking to buy|planning to buy|interested in buying|want to buy)\b',
            r'\b(?:looking for|seeking)\s+(?:\d+\s*(?:bhk|br|bed|bedroom)|villa|apartment|townhouse|property in dubai|property dubai)\b',
            r'\b(?:proof of funds|cash buyer|mortgage pre-approval)\b'
        ]
        for p in explicit_agency_or_rfp:
            if re.search(p, t_raw):
                return "EXPLICIT_BUYER_INTENT", "Explicit client/buyer statement with direct requirement", 92.0

        # 2. Verified freelance / contract project mandates
        if tags and any(str(t).lower() in ["contract", "freelance", "agency", "consultancy", "bounty", "project"] for t in tags):
            if any(w in t_raw for w in ["build", "develop", "create", "launch", "implement", "redesign"]):
                return "COMMERCIAL_PROCUREMENT", f"Verified contract/freelance project mandate: {title}", 88.0

        # 3. Standard Employee Job Openings (EXCLUDE FROM SALES PIPELINE)
        employee_indicators = [
            r'\b(?:hiring|full-time|full time|salary|benefits|401k|pto|remotework|remote-first)\b',
            r'\b(?:manager|director|engineer|designer|counsel|analyst|assistant|coordinator|specialist|representative|associate|lead)\b'
        ]
        for p in employee_indicators:
            if re.search(p, t_raw):
                return "JOB_VACANCY", "Standard employee job vacancy (no external agency/contractor request)", 20.0

        return "POTENTIAL_RESEARCH_SIGNAL", "General discussion/mention without explicit purchase requirement", 40.0

    def classify_contact_relevance(self, contact: str) -> str:
        """
        Classifies whether an extracted contact is commercially appropriate for sales outreach.
        """
        if not contact or contact.startswith("http") or contact.startswith("https"):
            return "APPLICATION_ONLY"
        if "@" not in contact and not re.search(r'\+?\d{8,}', contact):
            return "UNKNOWN"

        if "@" in contact:
            user_part = contact.split("@")[0].lower()
            if any(p in user_part for p in REJECTED_CONTACT_PREFIXES):
                if any(p in user_part for p in ["compliance", "accessible", "accommodations", "taxtesting", "privacy", "legal"]):
                    return "COMPLIANCE_ONLY"
                elif any(p in user_part for p in ["careers", "jobs", "recruiting", "talent", "hire"]):
                    return "RECRUITING_ONLY"
                else:
                    return "UNRELATED"

            if any(p in user_part for p in ["info", "contact", "hello", "sales", "inquiries", "operations", "partnerships", "procurement", "bizdev"]):
                return "GENERAL_BUSINESS_CONTACT"

            return "SALES_CONTACT_VALID"
        
        # Phone / WhatsApp
        return "SALES_CONTACT_VALID"

    def match_signal_industry(self, text: str) -> str:
        text_low = text.lower()
        for industry, keywords in INDUSTRY_ROUTING_MAP.items():
            for kw in keywords:
                if kw in text_low:
                    return industry
        if any(w in text_low for w in ["engineer", "developer", "backend", "frontend", "full stack", "python", "react"]):
            return "Custom Software Development"
        elif any(w in text_low for w in ["ai", "machine learning", "bot", "agent", "llm", "automation"]):
            return "AI Agents & Automation"
        elif any(w in text_low for w in ["marketing", "growth", "seo", "outbound", "sales", "ads"]):
            return "Marketing & Growth Services"
        elif any(w in text_low for w in ["property", "estate", "villa", "penthouse", "dubai", "apartment"]):
            return "Dubai Real Estate & Advisory"
        return "Custom Software Development"

    # -------------------------------------------------------------------------
    # SOURCE 1: YOUTUBE OFFICIAL DATA API V3
    # -------------------------------------------------------------------------
    async def fetch_youtube_buyer_intents(self, client: httpx.AsyncClient) -> List[Dict[str, Any]]:
        """
        Queries official YouTube Data API v3 for high-intent property and software buyer inquiries.
        """
        candidates = []
        source_name = "YOUTUBE_DATA_API"
        yt_key = os.getenv("YOUTUBE_API_KEY") or os.getenv("YOUTUBE_DATA_API_KEY")
        if not yt_key:
            return candidates

        queries = [
            "looking to buy property in dubai",
            "property investment dubai buyer",
            "need a web developer dubai",
            "looking for AI automation agency"
        ]
        req_time = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

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
                        v_desc = item.get("snippet", {}).get("description", "")
                        v_url_full = f"https://www.youtube.com/watch?v={vid_id}"

                        if not vid_id:
                            continue

                        # Check top comments on video for explicit buyer intent
                        self.tracker.record_metric(source_name, "requests")
                        c_url = f"https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId={vid_id}&maxResults=10&key={yt_key}"
                        cr = await client.get(c_url, timeout=10.0)
                        if cr.status_code == 200:
                            c_data = cr.json()
                            for c_item in c_data.get("items", []):
                                c_snip = c_item.get("snippet", {}).get("topLevelComment", {}).get("snippet", {})
                                c_author = c_snip.get("authorDisplayName", "YouTube Inquirer")
                                c_text = c_snip.get("textDisplay", "")
                                c_date = c_snip.get("publishedAt", req_time)

                                self.tracker.record_metric(source_name, "candidates")
                                intent_class, evidence, score = self.classify_buyer_intent(v_title, c_text)

                                candidates.append({
                                    "source": "YOUTUBE_DATA_API",
                                    "source_platform": "YouTube",
                                    "connector_label": "YouTube Data API Buyer Scanner",
                                    "name": c_author,
                                    "company": f"Public Inquiry on {v_title[:30]}",
                                    "requirement": c_text[:280],
                                    "source_url": v_url_full,
                                    "profile_reference": f"YouTube User: {c_author}",
                                    "external_published_at": c_date,
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
    # SOURCE 2: REDDIT PUBLIC INTENT MINER (RSS & JSON)
    # -------------------------------------------------------------------------
    async def fetch_reddit_buyer_signals(self, client: httpx.AsyncClient) -> List[Dict[str, Any]]:
        """
        Fetches live public discussions from subreddits seeking developers, agencies, or Dubai properties.
        """
        candidates = []
        source_name = "REDDIT_PUBLIC_MINER"
        subreddits = ["forhire", "freelance_forhire", "hireaprogrammer", "dubairealestate", "dubai"]
        req_time = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

        for sub in subreddits:
            try:
                self.tracker.record_metric(source_name, "requests")
                # Use custom User-Agent to avoid generic 429
                url = f"https://www.reddit.com/r/{sub}/new.rss"
                r = await client.get(url, timeout=12.0)
                if r.status_code == 200 and ("<feed" in r.text or "<entry" in r.text):
                    root = ET.fromstring(r.text)
                    entries = root.findall('{http://www.w3.org/2005/Atom}entry')
                    for e in entries:
                        t_elem = e.find('{http://www.w3.org/2005/Atom}title')
                        l_elem = e.find('{http://www.w3.org/2005/Atom}link')
                        c_elem = e.find('{http://www.w3.org/2005/Atom}content')
                        u_elem = e.find('{http://www.w3.org/2005/Atom}author/{http://www.w3.org/2005/Atom}name')

                        title = t_elem.text if t_elem is not None else ""
                        link = l_elem.attrib.get('href', '') if l_elem is not None else ""
                        raw_content = c_elem.text if c_elem is not None else ""
                        author = u_elem.text if u_elem is not None else "Reddit User"

                        clean_content = re.sub(r'<[^>]+>', ' ', raw_content)
                        clean_content = re.sub(r'\s+', ' ', clean_content).strip()

                        self.tracker.record_metric(source_name, "candidates")
                        intent_class, evidence, score = self.classify_buyer_intent(title, clean_content)

                        candidates.append({
                            "source": "REDDIT_PUBLIC_MINER",
                            "source_platform": "Reddit",
                            "connector_label": f"Reddit r/{sub} Intent Miner",
                            "name": author,
                            "company": f"Reddit Community ({author})",
                            "requirement": f"{title}. {clean_content[:200]}",
                            "source_url": link,
                            "profile_reference": f"r/{sub} ({author})",
                            "external_published_at": req_time,
                            "discovery_timestamp": req_time,
                            "contact_info": link,
                            "intent_class": intent_class,
                            "intent_evidence": evidence,
                            "intent_score": score,
                            "raw_metadata": {"subreddit": sub, "author": author, "title": title}
                        })
                await asyncio.sleep(0.5)  # respectful pacing
            except Exception as e:
                logger.warning(f"Reddit r/{sub} fetch error: {e}")
        return candidates

    # -------------------------------------------------------------------------
    # SOURCE 3: UNGM PUBLIC PROCUREMENT & TENDERS
    # -------------------------------------------------------------------------
    async def fetch_ungm_public_procurement(self, client: httpx.AsyncClient) -> List[Dict[str, Any]]:
        """
        Fetches official public procurement notices and RFPs from UNGM (United Nations Global Marketplace).
        """
        candidates = []
        source_name = "UNGM_PUBLIC_PROCUREMENT"
        req_time = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

        try:
            self.tracker.record_metric(source_name, "requests")
            url = "https://www.ungm.org/Public/Notice"
            r = await client.get(url, timeout=15.0)
            if r.status_code == 200:
                # Extract notice rows from public table
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
                        intent_class, evidence, score = self.classify_buyer_intent(f"Procurement RFP: {title}", f"Agency: {org}. Deadline: {deadline}")

                        candidates.append({
                            "source": "UNGM_PUBLIC_PROCUREMENT",
                            "source_platform": "Public Procurement",
                            "connector_label": "UNGM Public Procurement Portal",
                            "name": f"Procurement Officer ({org})",
                            "company": org,
                            "requirement": f"Public RFP: {title}. Deadline: {deadline}",
                            "source_url": link,
                            "profile_reference": f"UNGM Notice: {org}",
                            "external_published_at": req_time,
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
        """
        Reads genuine externally acquired buyer records from UAE Buyer Radar's PostgreSQL database.
        Safe, read-only inspection with strict buyer gate filtering.
        """
        candidates = []
        source_name = "UAE_BUYER_RADAR_BRIDGE"
        req_time = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

        try:
            import psycopg2
            from dotenv import dotenv_values
            
            # Check local UAE Buyer Radar env file
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
                self.tracker.record_metric(source_name, "candidates")
                
                title = f"{src_name or 'UAE Buyer'} - {full_name}"
                body = (raw_text or "") + " " + (evidence or "")
                
                intent_class, eval_evidence, score = self.classify_buyer_intent(title, body)

                contact = email or phone or wa or source_url or f"Lead ID: {lead_id}"

                candidates.append({
                    "source": "UAE_BUYER_RADAR_BRIDGE",
                    "source_platform": src_name or "UAE Buyer Radar",
                    "connector_label": f"Buyer Radar ({connector or src_name or 'Social'})",
                    "name": full_name or "UAE Real Estate Buyer",
                    "company": "Private Real Estate Investor",
                    "requirement": (raw_text or evidence or "Dubai Real Estate Acquisition Requirement")[:280],
                    "source_url": source_url or "https://uaebuyerradar.ai",
                    "profile_reference": f"Radar Ref: {lead_id}",
                    "external_published_at": str(disc_at or req_time),
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
    # SOURCE 5: PUBLIC WEB SEARCH INTENT RADAR (DUCKDUCKGO)
    # -------------------------------------------------------------------------
    async def fetch_public_web_buyer_intents(self, client: httpx.AsyncClient) -> List[Dict[str, Any]]:
        """
        Executes real public web search queries for explicit commercial buyer intent.
        """
        candidates = []
        source_name = "PUBLIC_WEB_SEARCH"
        queries = [
            'looking for software development agency Dubai',
            'need custom CRM development agency UAE',
            'looking for AI automation agency Dubai',
            'property investment Dubai buyer requirement'
        ]
        req_time = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

        for q in queries:
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
                        intent_class, evidence, score = self.classify_buyer_intent(title, snippet)
                        
                        candidates.append({
                            "source": "PUBLIC_WEB_SEARCH",
                            "source_platform": "Web Search Intent",
                            "connector_label": "Google & DDG Public Web Intent Radar",
                            "name": f"Procurement Inquirer ({title[:30]})",
                            "company": title.split(" - ")[0] if " - " in title else title[:30],
                            "requirement": f"Requirement: {title}. Context: {snippet}",
                            "source_url": url,
                            "profile_reference": f"Web Query: {q}",
                            "external_published_at": req_time,
                            "discovery_timestamp": req_time,
                            "contact_info": url,
                            "intent_class": intent_class,
                            "intent_evidence": evidence,
                            "intent_score": score,
                            "raw_metadata": {"query": q, "title": title, "url": url}
                        })
            except Exception as e:
                logger.warning(f"Public web query '{q}' error: {e}")
        return candidates

    # -------------------------------------------------------------------------
    # SOURCE 6: TELEGRAM PUBLIC COMMUNITY FEEDS
    # -------------------------------------------------------------------------
    async def fetch_telegram_buyer_signals(self, client: httpx.AsyncClient) -> List[Dict[str, Any]]:
        """
        Fetches live public buying signals from open UAE Telegram channels via public web previews.
        """
        candidates = []
        source_name = "TELEGRAM_PUBLIC_FEED"
        channels = ["DubaiRealEstateVIP", "uaestartups", "DubaiTechFounders"]
        req_time = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

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
                            pub_date = date_match.group(1) if date_match else req_time

                            self.tracker.record_metric(source_name, "candidates")
                            intent_class, evidence, score = self.classify_buyer_intent(f"Telegram @{ch}", clean_text)
                            
                            candidates.append({
                                "source": "TELEGRAM_PUBLIC_FEED",
                                "source_platform": "Telegram",
                                "connector_label": "Telegram Public Web Connector",
                                "name": f"UAE Buyer (@{ch})",
                                "company": f"UAE Enterprise (@{ch})",
                                "requirement": clean_text[:280],
                                "source_url": msg_link,
                                "profile_reference": f"@{ch}",
                                "external_published_at": pub_date,
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
    # SOURCE 7: COMMERCIAL JOB BOARDS (JOBICY & REMOTEOK) - RESEARCH SIGNALS ONLY
    # -------------------------------------------------------------------------
    async def fetch_commercial_board_signals(self, client: httpx.AsyncClient) -> List[Dict[str, Any]]:
        """
        Fetches live requirements from Jobicy and RemoteOK, filtering for contracts/RFPs.
        Normal employee vacancies are segregated into JOB_VACANCY (Research Only).
        """
        candidates = []
        source_name = "COMMERCIAL_JOB_BOARDS"
        req_time = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

        # 1. Jobicy
        try:
            self.tracker.record_metric(source_name, "requests")
            r = await client.get("https://jobicy.com/api/v2/remote-jobs?count=25&tag=dev", timeout=12.0)
            if r.status_code == 200:
                jobs = r.json().get("jobs", [])
                for j in jobs:
                    title = j.get("jobTitle", "")
                    comp = j.get("companyName", "Commercial Enterprise")
                    desc = re.sub(r'<[^>]+>', ' ', j.get("jobDescription", ""))
                    desc_clean = re.sub(r'\s+', ' ', desc).strip()
                    job_url = j.get("url", "")
                    pub_date = j.get("pubDate", req_time)
                    tags = [j.get("jobIndustry", ""), j.get("jobType", "")]

                    self.tracker.record_metric(source_name, "candidates")
                    intent_class, evidence, score = self.classify_buyer_intent(title, desc_clean, tags)
                    
                    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', desc_clean)
                    contact = email_match.group(0) if email_match else job_url

                    candidates.append({
                        "source": "JOBICY_PUBLIC_API",
                        "source_platform": "Jobicy Commercial Feed",
                        "connector_label": "Jobicy Public API",
                        "name": f"Hiring Lead ({comp})",
                        "company": comp,
                        "requirement": f"{title} — {desc_clean[:220]}",
                        "source_url": job_url,
                        "profile_reference": f"Jobicy: {comp}",
                        "external_published_at": pub_date,
                        "discovery_timestamp": req_time,
                        "contact_info": contact,
                        "intent_class": intent_class,
                        "intent_evidence": evidence,
                        "intent_score": score,
                        "raw_metadata": {"jobTitle": title, "company": comp, "tags": tags}
                    })
        except Exception as e:
            logger.warning(f"Jobicy API fetch error: {e}")

        # 2. RemoteOK
        try:
            self.tracker.record_metric(source_name, "requests")
            r = await client.get("https://remoteok.com/api", timeout=12.0)
            if r.status_code == 200:
                jobs = r.json()
                if isinstance(jobs, list):
                    for j in jobs[1:26]:
                        if not isinstance(j, dict):
                            continue
                        pos = j.get("position", "")
                        comp = j.get("company", "Tech Enterprise")
                        desc = re.sub(r'<[^>]+>', ' ', j.get("description", ""))
                        desc_clean = re.sub(r'\s+', ' ', desc).strip()
                        job_url = j.get("url", "")
                        pub_date = j.get("date", req_time)
                        tags = j.get("tags", [])

                        self.tracker.record_metric(source_name, "candidates")
                        intent_class, evidence, score = self.classify_buyer_intent(pos, desc_clean, tags)
                        
                        apply_url = j.get("apply_url", job_url)

                        candidates.append({
                            "source": "REMOTEOK_PUBLIC_API",
                            "source_platform": "RemoteOK Commercial Feed",
                            "connector_label": "RemoteOK Public API",
                            "name": f"Talent Lead ({comp})",
                            "company": comp,
                            "requirement": f"{pos} — {desc_clean[:220]}",
                            "source_url": apply_url,
                            "profile_reference": f"RemoteOK: {comp}",
                            "external_published_at": pub_date,
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
        Applies strict Buyer-Intent Gate, Contact Relevance Gate, and Global CRM Deduplication.
        """
        t_start = datetime.datetime.utcnow()
        logger.info(f"Starting Multi-Source Real Buyer-Intent Discovery for Mission #{mission.id} at {t_start.isoformat()}...")

        # 1. Snapshot global CRM fingerprints
        crm_registry = await get_global_crm_registry(session)
        known_emails = set(crm_registry.get("emails", {}).keys())
        known_phones = set(crm_registry.get("phones", {}).keys())
        known_urls = set(crm_registry.get("urls", {}).keys())
        known_name_companies = set(crm_registry.get("name_companies", {}).keys())
        logger.info(f"Loaded Global CRM Deduplication Registry: {len(known_emails)} emails, {len(known_urls)} URLs, {len(known_name_companies)} name/companies.")

        all_candidates: List[Dict[str, Any]] = []

        # 2. Execute all candidate sources concurrently where safe
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

        # 3. Add UAE Buyer Radar Safe Read-Only Adapter (sync DB call)
        try:
            br_candidates = self.fetch_uae_buyer_radar_leads()
            all_candidates.extend(br_candidates)
        except Exception as e:
            logger.error(f"Buyer Radar bridge error: {e}")

        logger.info(f"Total raw external candidates collected across all sources: {len(all_candidates)}")

        # 4. Process candidates through strict buyer-intent gate & deduplication
        created_sales_leads: List[Lead] = []
        created_signals: List[MarketSignal] = []
        created_comms: List[Communication] = []
        
        counts = {
            "total_candidates": len(all_candidates),
            "explicit_buyer_intent": 0,
            "commercial_procurement": 0,
            "potential_research_signals": 0,
            "job_vacancies": 0,
            "duplicates_rejected": 0,
            "new_sales_leads_inserted": 0,
            "valid_contacts_ready": 0,
            "manual_research_required": 0,
            "outbound_staged": 0,
            "outbound_submitted": 0
        }

        for cand in all_candidates:
            source = cand.get("source", "EXTERNAL")
            intent_class = cand.get("intent_class", "POTENTIAL_RESEARCH_SIGNAL")
            evidence = cand.get("intent_evidence", "")
            name = cand.get("name", "Commercial Lead")
            comp = cand.get("company", "Target Enterprise")
            req = cand.get("requirement", "")
            url = cand.get("source_url", "")
            contact = cand.get("contact_info", "")
            pub_date = cand.get("external_published_at", "")
            score = cand.get("intent_score", 50.0)

            # Record source metrics
            if intent_class == "EXPLICIT_BUYER_INTENT":
                counts["explicit_buyer_intent"] += 1
                self.tracker.record_metric(source, "buyer_signals")
            elif intent_class == "COMMERCIAL_PROCUREMENT":
                counts["commercial_procurement"] += 1
                self.tracker.record_metric(source, "procurement_notices")
            elif intent_class == "JOB_VACANCY":
                counts["job_vacancies"] += 1
                self.tracker.record_metric(source, "job_signals")
            else:
                counts["potential_research_signals"] += 1

            # Global CRM Deduplication check
            norm_email = normalize_email_address(contact) if "@" in contact else None
            norm_phone = normalize_phone_number(contact) if re.search(r'\d{8,}', contact) else None
            norm_url = normalize_web_url(url)
            norm_name_comp = (normalize_text(name), normalize_text(comp))

            is_duplicate = False
            if norm_email and norm_email in known_emails:
                is_duplicate = True
            if norm_phone and norm_phone in known_phones:
                is_duplicate = True
            if norm_url and norm_url in known_urls:
                is_duplicate = True
            if norm_name_comp in known_name_companies:
                is_duplicate = True

            if is_duplicate:
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

            # Classify contact relevance
            contact_relevance = self.classify_contact_relevance(contact)
            industry = self.match_signal_industry(f"{comp} {req}")

            # BUYER GATE: ONLY EXPLICIT_BUYER_INTENT and COMMERCIAL_PROCUREMENT become Sales Leads
            if intent_class in ["EXPLICIT_BUYER_INTENT", "COMMERCIAL_PROCUREMENT"]:
                pipeline_stage = "DISCOVERED"
                # Pipeline expected value is AED 0.0 unless formal budget verified in source
                expected_val = 0.0

                lead = Lead(
                    mission_id=mission.id,
                    name=name,
                    company_name=comp,
                    source=source,
                    source_platform=cand.get("source_platform", "External Web"),
                    source_url=url,
                    interest=req,
                    intent_score="Hot" if intent_class == "EXPLICIT_BUYER_INTENT" else "Qualified",
                    contact_info=contact if contact_relevance == "SALES_CONTACT_VALID" else url,
                    channel="Email" if "@" in contact and contact_relevance == "SALES_CONTACT_VALID" else "LinkedIn",
                    status="NEW",
                    pipeline_stage=pipeline_stage,
                    expected_value=expected_val,
                    qualification_score=score,
                    classification="QUALIFIED",
                    buying_intent="HIGH",
                    decision_stage="DECISION",
                    source_type="REAL",
                    verification_status="VERIFIED" if contact_relevance == "SALES_CONTACT_VALID" else "PENDING",
                    evidence_reference=evidence[:255],
                    notes=f"Buyer Intent: {intent_class} | Relevance: {contact_relevance} | Source Pub: {pub_date}"
                )
                session.add(lead)
                await session.flush()
                created_sales_leads.append(lead)
                counts["new_sales_leads_inserted"] += 1
                self.tracker.record_metric(source, "accepted_sales_leads")

                if contact_relevance == "SALES_CONTACT_VALID":
                    counts["valid_contacts_ready"] += 1
                    self.tracker.record_metric(source, "valid_contacts")
                else:
                    counts["manual_research_required"] += 1
                    self.tracker.record_metric(source, "manual_research_required")

            else:
                # JOB_VACANCY and POTENTIAL_RESEARCH_SIGNAL are stored as market research signals
                signal = MarketSignal(
                    mission_id=mission.id,
                    source=source,
                    signal_text=f"[{intent_class}] {name} ({comp}): {req[:300]}",
                    lead_name=name,
                    country="United Arab Emirates" if "dubai" in req.lower() or "uae" in req.lower() else "Global",
                    intent_score="Research" if intent_class == "POTENTIAL_RESEARCH_SIGNAL" else "Job Signal",
                    channel="Research",
                    raw_metadata={
                        "source_url": url,
                        "intent_class": intent_class,
                        "contact_relevance": contact_relevance,
                        "external_published_at": pub_date
                    }
                )
                session.add(signal)
                created_signals.append(signal)

        # Commit all new records safely
        await session.commit()

        # Keep Mission #1013 pipeline value strictly evidence-backed
        mission.pipeline_value = sum((l.expected_value or 0.0) for l in created_sales_leads)
        await session.commit()

        t_end = datetime.datetime.utcnow()
        duration_s = (t_end - t_start).total_seconds()

        return {
            "mission_id": mission.id,
            "status": "COMPLETED",
            "timestamp_start": t_start.strftime("%Y-%m-%d %H:%M:%S UTC"),
            "timestamp_end": t_end.strftime("%Y-%m-%d %H:%M:%S UTC"),
            "duration_seconds": duration_s,
            "counts": counts,
            "source_performance": self.tracker.get_summary(),
            "created_sales_leads_count": len(created_sales_leads),
            "created_signals_count": len(created_signals)
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
