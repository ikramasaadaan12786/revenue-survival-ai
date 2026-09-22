import sqlite3
import os

DB_PATHS = [
    "revenue_survival.db",
    "backend/revenue_survival.db"
]

COLUMNS_TO_ADD = {
    "leads": [
        ("source_type", "TEXT DEFAULT 'REAL'"),
        ("verification_status", "TEXT DEFAULT 'VERIFIED'"),
        ("client_identity", "TEXT"),
        ("proposal_id", "INTEGER"),
        ("payment_status", "TEXT"),
        ("payment_reference", "TEXT"),
        ("revenue_verification_status", "TEXT DEFAULT 'UNVERIFIED'")
    ],
    "communications": [
        ("recipient", "TEXT"),
        ("delivery_confirmation", "TEXT"),
        ("reply_source", "TEXT DEFAULT 'CLIENT_DIRECT'"),
        ("source_type", "TEXT DEFAULT 'REAL'"),
        ("verification_status", "TEXT DEFAULT 'VERIFIED'")
    ],
    "revenue_tracking": [
        ("client_identity", "TEXT"),
        ("proposal_id", "INTEGER"),
        ("payment_status", "TEXT DEFAULT 'SETTLED'"),
        ("payment_reference", "TEXT"),
        ("revenue_verification_status", "TEXT DEFAULT 'VERIFIED'"),
        ("source_type", "TEXT DEFAULT 'REAL'"),
        ("verification_status", "TEXT DEFAULT 'VERIFIED'"),
        ("audit_hash", "TEXT")
    ],
    "proposals": [
        ("payment_status", "TEXT DEFAULT 'UNPAID'"),
        ("payment_reference", "TEXT"),
        ("source_type", "TEXT DEFAULT 'REAL'"),
        ("verification_status", "TEXT DEFAULT 'VERIFIED'")
    ],
    "tasks": [
        ("source_type", "TEXT DEFAULT 'SYSTEM'"),
        ("verification_status", "TEXT DEFAULT 'VERIFIED'")
    ],
    "operator_action_logs": [
        ("source_type", "TEXT DEFAULT 'SYSTEM'"),
        ("verification_status", "TEXT DEFAULT 'VERIFIED'")
    ]
}

def migrate_db(db_path: str):
    if not os.path.exists(db_path):
        print(f"[SKIP] DB not found at {db_path}")
        return
    print(f"[MIGRATING] {db_path}...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

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
    print(f"[SUCCESS] Migration completed for {db_path}")

if __name__ == "__main__":
    for p in DB_PATHS:
        migrate_db(p)
