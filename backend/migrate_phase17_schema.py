import sqlite3
import os

DB_PATHS = [
    "revenue_survival.db",
    "backend/revenue_survival.db"
]

COLUMNS_TO_ADD = {
    "leads": [
        ("source_platform", "TEXT DEFAULT 'Telegram'"),
        ("source_url", "TEXT"),
        ("profile_url", "TEXT"),
        ("evidence_reference", "TEXT"),
        ("discovery_timestamp", "TIMESTAMP"),
        ("calendar_event_id", "TEXT"),
        ("meeting_link", "TEXT"),
        ("call_status", "TEXT DEFAULT 'NONE'"),
        ("call_notes", "TEXT"),
        ("call_completed_at", "TIMESTAMP")
    ],
    "communications": [
        ("provider_confirmation", "TEXT"),
        ("reply_status", "TEXT DEFAULT 'NONE'"),
        ("reply_classification", "TEXT"),
        ("followup_sequence_step", "INTEGER DEFAULT 0")
    ],
    "proposals": [
        ("recipient_confirmation", "TEXT"),
        ("client_response", "TEXT"),
        ("viewed_at", "TIMESTAMP"),
        ("accepted_at", "TIMESTAMP"),
        ("rejected_at", "TIMESTAMP")
    ],
    "revenue_tracking": [
        ("payment_id", "TEXT"),
        ("transaction_reference", "TEXT"),
        ("settlement_date", "TIMESTAMP")
    ]
}

CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS overnight_execution_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mission_id INTEGER NOT NULL,
    cycle_type TEXT DEFAULT 'INTERVAL_15M',
    status TEXT DEFAULT 'SUCCESS',
    summary TEXT NOT NULL,
    leads_audited INTEGER DEFAULT 0,
    replies_processed INTEGER DEFAULT 0,
    followups_staged INTEGER DEFAULT 0,
    proposals_prepared INTEGER DEFAULT 0,
    bottlenecks_detected TEXT,
    strategy_recommendations TEXT,
    metrics_snapshot TEXT,
    source_type TEXT DEFAULT 'SYSTEM',
    verification_status TEXT DEFAULT 'VERIFIED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(mission_id) REFERENCES missions(id)
);
"""

def migrate_db(db_path: str):
    if not os.path.exists(db_path):
        print(f"[SKIP] DB not found at {db_path}")
        return
    print(f"[MIGRATING] {db_path}...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Create new tables
    cursor.execute(CREATE_TABLE_SQL)

    for table, cols in COLUMNS_TO_ADD.items():
        cursor.execute(f"PRAGMA table_info({table})")
        existing_cols = [row[1] for row in cursor.fetchall()]
        if not existing_cols:
            continue
        for col_name, col_type in cols:
            if col_name not in existing_cols:
                sql = f"ALTER TABLE {table} ADD COLUMN {col_name} {col_type}"
                try:
                    cursor.execute(sql)
                    print(f"  + Added {col_name} to {table}")
                except Exception as e:
                    print(f"  ! Error adding {col_name} to {table}: {e}")

    conn.commit()
    conn.close()
    print(f"[SUCCESS] Phase 17 migration completed for {db_path}")

if __name__ == "__main__":
    for p in DB_PATHS:
        migrate_db(p)
