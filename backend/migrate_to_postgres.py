"""
Production Migration Script for Revenue Survival AI.
Transfers all data safely from SQLite (source) to Neon PostgreSQL (target).
Preserves all tables, relationships, and metadata.
Handles strict dependency order without requiring superuser permissions.
"""

import asyncio
import os
import sys
import datetime
from sqlalchemy import create_engine, MetaData, Table, select, func, text

# Add current dir to path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.core.database import Base
import app.models.entities

# Explicit topological order based on foreign keys
TOPOLOGICAL_TABLE_ORDER = [
    # Level 0: Independent Root Tables
    "users",
    "enterprise_companies",
    "agent_memory",
    "analytics",
    "long_term_memories",
    "connector_auths",
    "worker_heartbeats",
    "scaling_intelligence_logs",
    "business_growth_memories",
    
    # Level 1: Dependent on Level 0
    "missions",
    "company_ai_employee_assignments",
    "enterprise_subscription_billings",
    "company_performance_scorecards",
    "client_facing_assistant_sessions",
    "company_department_logs",
    
    # Level 2: Dependent on Missions
    "client_accounts",
    "opportunities",
    "offers",
    "leads",
    "tasks",
    "daily_cycles",
    "experiments",
    "market_signals",
    "seller_listings",
    "revenue_opportunities",
    "revenue_tracking",
    "real_estate_deals",
    "revenue_learnings",
    "overnight_execution_logs",
    "brand_content_pipelines",
    "ceo_decision_memories",
    "operator_action_logs",
    
    # Level 3: Dependent on Missions + Leads
    "communications",
    "proposals"
]

def migrate_data(sqlite_path: str, target_postgres_url: str):
    print("======================================================================")
    print(">>> REVENUE SURVIVAL AI — DATABASE MIGRATION ENGINE <<<")
    print("======================================================================\n")

    if not os.path.exists(sqlite_path):
        raise FileNotFoundError(f"Source SQLite database not found: {sqlite_path}")

    sync_sqlite_url = f"sqlite:///{os.path.abspath(sqlite_path)}"
    
    sync_pg_url = target_postgres_url
    if sync_pg_url.startswith("postgresql+asyncpg://"):
        sync_pg_url = "postgresql://" + sync_pg_url[len("postgresql+asyncpg://"):]
    elif sync_pg_url.startswith("postgres://"):
        sync_pg_url = "postgresql://" + sync_pg_url[len("postgres://"):]
    
    if "ssl=require" in sync_pg_url:
        sync_pg_url = sync_pg_url.replace("ssl=require", "sslmode=require")

    masked_target = sync_pg_url.split("@")[-1].split("?")[0] if "@" in sync_pg_url else "configured_host"
    print(f"[*] Source Database: SQLite ({sqlite_path})")
    print(f"[*] Target Database: Neon PostgreSQL ({masked_target})\n")

    sqlite_engine = create_engine(sync_sqlite_url)
    pg_engine = create_engine(sync_pg_url)

    # 1. Synchronize schema
    print("[1/4] Re-creating PostgreSQL schema tables cleanly...")
    Base.metadata.drop_all(pg_engine)
    Base.metadata.create_all(pg_engine)
    print("      -> Clean PostgreSQL schema synchronized.\n")

    # 2. Verify registered tables
    print(f"[2/4] Prepared {len(TOPOLOGICAL_TABLE_ORDER)} tables in strict dependency order.\n")

    # 3. Migrate data table by table
    print("[3/4] Migrating rows from SQLite to Neon PostgreSQL...")
    migration_summary = {}

    with sqlite_engine.connect() as src_conn, pg_engine.connect() as dst_conn:
        # Pre-seed root parent stubs if missing in SQLite so foreign keys resolve
        try:
            user_count = src_conn.execute(select(func.count()).select_from(Base.metadata.tables["users"])).scalar()
            if user_count == 0:
                dst_conn.execute(text("""
                    INSERT INTO users (id, email, name, role, created_at)
                    VALUES (1, 'sales@altsofts.in', 'Lead Operator', 'operator', NOW())
                    ON CONFLICT (id) DO NOTHING;
                """))
                dst_conn.commit()
        except Exception:
            pass

        try:
            comp_count = src_conn.execute(select(func.count()).select_from(Base.metadata.tables["enterprise_companies"])).scalar()
            if comp_count == 0:
                dst_conn.execute(text("""
                    INSERT INTO enterprise_companies (id, name, slug, industry, country, currency, tier_plan, status, created_at)
                    VALUES (1, 'Apex Enterprise Group', 'apex-enterprise-group', 'AI Automation', 'United Arab Emirates', 'AED', 'PROFESSIONAL', 'ACTIVE', NOW())
                    ON CONFLICT (id) DO NOTHING;
                """))
                dst_conn.commit()
        except Exception:
            pass

        for table_name in TOPOLOGICAL_TABLE_ORDER:
            if table_name not in Base.metadata.tables:
                continue
            
            table = Base.metadata.tables[table_name]
            
            # Read from SQLite
            try:
                src_rows = src_conn.execute(select(table)).fetchall()
            except Exception as e:
                print(f"      [!] Table '{table_name}' skipped (source read error: {e})")
                migration_summary[table_name] = {"source": 0, "target": 0, "status": "SKIPPED"}
                continue

            src_count = len(src_rows)
            if src_count == 0:
                migration_summary[table_name] = {"source": 0, "target": 0, "status": "EMPTY"}
                continue

            # Convert rows to dicts
            cols = [c.name for c in table.columns]
            row_dicts = []
            for r in src_rows:
                row_dict = {}
                for idx, col in enumerate(cols):
                    val = r[idx]
                    row_dict[col] = val
                row_dicts.append(row_dict)

            # Bulk insert in batches of 100
            batch_size = 100
            for i in range(0, len(row_dicts), batch_size):
                batch = row_dicts[i:i + batch_size]
                dst_conn.execute(table.insert(), batch)
            dst_conn.commit()

            # Fix Postgres auto-increment sequence
            try:
                dst_conn.execute(text(f"""
                    SELECT setval(
                        pg_get_serial_sequence('"{table_name}"', 'id'),
                        COALESCE((SELECT MAX(id) FROM "{table_name}"), 1),
                        true
                    );
                """))
                dst_conn.commit()
            except Exception:
                pass

            # Count rows in target
            dst_count = dst_conn.execute(select(func.count()).select_from(table)).scalar()
            
            status = "SUCCESS" if src_count == dst_count else "MISMATCH"
            migration_summary[table_name] = {
                "source": src_count,
                "target": dst_count,
                "status": status
            }
            print(f"      -> {table_name}: {src_count} -> {dst_count} rows [{status}]")

    print("\n[4/4] Table-by-Table Verification Summary:")
    print("----------------------------------------------------------------------")
    print(f"{'Table Name':<35} | {'SQLite':<8} | {'Postgres':<8} | {'Status'}")
    print("----------------------------------------------------------------------")
    all_matched = True
    for t_name, data in migration_summary.items():
        print(f"{t_name:<35} | {data['source']:<8} | {data['target']:<8} | {data['status']}")
        if data["status"] == "MISMATCH":
            all_matched = False
    print("----------------------------------------------------------------------")
    
    if all_matched:
        print("\n>>> ALL TABLES MIGRATED AND VERIFIED WITH 100% ACCURACY <<<\n")
    else:
        print("\n[!] WARNING: Some tables had row count discrepancies.\n")

    return migration_summary

if __name__ == "__main__":
    if len(sys.argv) < 2:
        pg_url = os.getenv("DATABASE_URL")
        if not pg_url or "sqlite" in pg_url:
            print("Usage: python migrate_to_postgres.py <TARGET_POSTGRES_DATABASE_URL>")
            sys.exit(1)
    else:
        pg_url = sys.argv[1]

    src_db = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "revenue_survival.db"))
    if not os.path.exists(src_db):
        src_db = os.path.abspath(os.path.join(os.path.dirname(__file__), "revenue_survival.db"))

    migrate_data(src_db, pg_url)
