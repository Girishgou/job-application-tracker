import os
from contextlib import contextmanager
from datetime import date
from enum import Enum
from typing import Optional

import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, field_validator
from fastapi.middleware.cors import CORSMiddleware

from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Job Application Tracker")
app.add_middleware(
    CORSMiddleware,
   allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://YOUR-NEW-FRONTEND.vercel.app",
], # Allows requests from your Vercel frontend and localhost
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_URL = (os.environ.get("DATABASE_URL") or "").replace("DATABASE_URL=", "").strip().strip("'\"")

# ---------- Database ----------

@contextmanager
def get_cursor():
    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            yield cur
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db():
    with get_cursor() as cur:
        cur.execute("""
            CREATE TABLE IF NOT EXISTS applications (
                id SERIAL PRIMARY KEY,
                company_name TEXT NOT NULL,
                job_role TEXT NOT NULL,
                application_date DATE NOT NULL,
                job_url TEXT,
                status TEXT NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
        """)


# ---------- Models ----------

class Status(str, Enum):
    applied = "Applied"
    interview = "Interview"
    selected = "Selected"
    rejected = "Rejected"


class ApplicationIn(BaseModel):
    company_name: str
    job_role: str
    application_date: date
    job_url: Optional[str] = None
    status: Status = Status.applied

    @field_validator("company_name", "job_role")
    @classmethod
    def not_blank(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("must not be empty")
        return v

    @field_validator("job_url")
    @classmethod
    def valid_url(cls, v):
        if v is None:
            return None
        v = v.strip()
        if not v:
            return None
        if not v.startswith(("http://", "https://")) or "." not in v:
            raise ValueError("must be a valid URL starting with http:// or https://")
        return v


# ---------- Routes ----------

@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/applications", status_code=201)
def create_application(a: ApplicationIn):
    with get_cursor() as cur:
        cur.execute(
            """
            INSERT INTO applications
                (company_name, job_role, application_date, job_url, status)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING *
            """,
            (
                a.company_name,
                a.job_role,
                a.application_date,
                a.job_url,
                a.status.value,
            ),
        )
        return cur.fetchone()


@app.get("/api/applications")
def list_applications(
    search: Optional[str] = None,
    status: Optional[Status] = None,
    sort: str = Query("desc", pattern="^(asc|desc)$"),
):
    sql = "SELECT * FROM applications WHERE 1=1"
    params = []

    if search and search.strip():
        sql += " AND (company_name ILIKE %s OR job_role ILIKE %s)"
        like = f"%{search.strip()}%"
        params += [like, like]

    if status:
        sql += " AND status = %s"
        params.append(status.value)

    # safe: `sort` can only be "asc" or "desc" (validated by the pattern above)
    sql += f" ORDER BY application_date {sort}, id {sort}"

    with get_cursor() as cur:
        cur.execute(sql, params)
        return cur.fetchall()


@app.get("/api/applications/{app_id}")
def get_application(app_id: int):
    with get_cursor() as cur:
        cur.execute("SELECT * FROM applications WHERE id = %s", (app_id,))
        row = cur.fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Application not found")
    return row

@app.put("/api/applications/{app_id}")
def update_application(app_id: int, a: ApplicationIn):
    with get_cursor() as cur:
        cur.execute(
            """
            UPDATE applications
            SET company_name = %s,
                job_role = %s,
                application_date = %s,
                job_url = %s,
                status = %s,
                updated_at = NOW()
            WHERE id = %s
            RETURNING *
            """,
            (a.company_name, a.job_role, a.application_date, a.job_url, a.status.value, app_id),
        )
        row = cur.fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Application not found")
    return row


@app.delete("/api/applications/{app_id}", status_code=204)
def delete_application(app_id: int):
    with get_cursor() as cur:
        cur.execute("DELETE FROM applications WHERE id = %s RETURNING id", (app_id,))
        row = cur.fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Application not found")
    
@app.get("/api/stats")
def get_stats():
    with get_cursor() as cur:
        cur.execute("SELECT status, COUNT(*) AS n FROM applications GROUP BY status")
        counts = {r["status"]: r["n"] for r in cur.fetchall()}
    result = {s.value: counts.get(s.value, 0) for s in Status}
    result["Total"] = sum(result.values())
    return result