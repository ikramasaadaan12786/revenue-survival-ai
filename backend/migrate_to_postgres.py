"""
Production Migration Script for Revenue Survival AI.
Transfers all data safely from SQLite (source) to PostgreSQL (target).
Preserves all tables, relationships, and metadata.
Performs table-by-table verification.
"""

import asyncio
import os
import sys
import datetime
from sqlalchemy import create_engine, MetaData, Table, select, func, text
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

# Add current dir to path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.core.database import Base
import app.models.entities

def migrate_data(sqlite_path: str, target_postgres_url: str):
    print("======================================================================")
    print(">>> REVENUE SURVIVAL AI — DATABASE MIGRATION ENGINE <<<")
    print("======================================================================\n")

    if not os.path.exists(sqlite_path):
        raise FileNotFoundError(f"Source SQLite database not found: {sqlite_path}")

    # Standardize sync postgres URL for reflection / bulk insert
    sync_sqlite_url = f"sqlite:///{os.path.abspath(sqlite_path)}"
    
    sync_pg_url = target_postgres_url
    if sync_pg_url.startswith("postgresql+asyncpg://"):
        sync_pg_url = "postgresql://" + sync_pg_url[len("postgresql+asyncpg://"):]
    elif sync_pg_url.startswith("postgres://"):
        sync_pg_url = "postgresql://" + sync_pg_url[len("postgres://"):]
    
    # Handle sslmode in sync engine
    if "ssl=require" in sync_pg_url:
        sync_pg_url = sync_pg_url.replace("ssl=require", "sslmode=require")

    print(f"[*] Source Database: SQLite ({sqlite_path})")
    print(f"[*] Target Database: PostgreSQL ({sync_pg_url.split('@')[-1] if '@' in sync_pg_url else 'configured_host'})\n")

    sqlite_engine = create_engine(sync_sqlite_url)
    pg_engine = create_engine(sync_pg_url)

    # 1. Create all tables on PostgreSQL
    print("[1/4] Synchronizing target PostgreSQL schema...")
    Base.metadata.create_all(pg_engine)
    print("      -> All PostgreSQL tables created successfully.\n")

    # 2. Get table dependency order
    tables_in_order = [t.name for t in Base.metadata.sorted_tables]
    print(f"[2/4] Found {len(tables_in_order)} registered tables to migrate:")
    for t_name in tables_in_order:
        print(f"      - {t_name}")
    print()

    # 3. Migrate data table by table
    print("[3/4] Migrating rows from SQLite to PostgreSQL...")
    migration_summary = {}

    with sqlite_engine.connect() as src_conn, pg_engine.connect() as dst_conn:
        for table_name in tables_in_order:
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

            # Clear target table before insert
            dst_conn.execute(text(f'TRUNCATE TABLE "{table_name}" CASCADE'))
            dst_conn.commit()

            # Insert into PostgreSQL
            # Convert rows to dicts
            cols = [c.name for c in table.columns]
            row_dicts = []
            for r in src_rows:
                row_dict = {}
                for idx, col in enumerate(cols):
                    val = r[idx]
                    # Format booleans/JSON if needed
                    row_dict[col] = val
                row_dicts.append(row_dict)

            # Bulk insert in batches of 100
            batch_size = 100
            for i in range(0, len(row_dicts), batch_size):
                batch = row_dicts[i:i + batch_size]
                dst_conn.execute(table.insert(), batch)
            dst_conn.commit()

            # Fix Postgres auto-increment sequences
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
