"""Domain Web search API — reuses domain-finder-bot discovery."""

from __future__ import annotations

import asyncio
import os
import sys
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

BOT_DIR = os.environ.get("DOMAIN_FINDER_BOT_DIR", "/opt/domain-finder-bot")
if BOT_DIR not in sys.path:
    sys.path.insert(0, BOT_DIR)

from discovery import (  # noqa: E402
    MAX_BATCH_DOMAINS,
    discover_batch_with_timeout,
    discover_with_timeout,
    format_batch_domains_column,
    format_batch_full_report,
    format_batch_ips_column,
    format_batch_v2fly_column,
    format_domains_column,
    format_full_report,
    format_ips_column,
    format_v2fly_column,
    parse_domains_from_message,
)
from router_bat import (  # noqa: E402
    format_router_bat,
    format_router_bat_batch,
    sanitize_bat_filename,
    sanitize_batch_bat_filename,
)
from v2fly_lookup import start_background_sync  # noqa: E402

MAX_CONCURRENT = max(1, int(os.environ.get("MAX_CONCURRENT_SEARCHES", "4")))
_SEARCH_SEM = asyncio.Semaphore(MAX_CONCURRENT)


class SearchRequest(BaseModel):
    domain: str | None = None
    domains: list[str] | None = None


class SearchResponse(BaseModel):
    domains: list[str]
    is_batch: bool
    report: str
    domains_column: str
    ips_column: str
    geosite_geoip: str
    bat_content: str
    bat_filename: str


def _resolve_domains(body: SearchRequest) -> list[str]:
    if body.domains:
        raw = "\n".join(body.domains)
    elif body.domain:
        raw = body.domain
    else:
        raise HTTPException(status_code=400, detail="Provide domain or domains")

    domains = parse_domains_from_message(raw)
    if not domains:
        raise HTTPException(status_code=400, detail="No valid domains")
    if len(domains) > MAX_BATCH_DOMAINS:
        raise HTTPException(
            status_code=400,
            detail=f"Max {MAX_BATCH_DOMAINS} domains per request",
        )
    return domains


def _build_response(domains: list[str], results: list[Any]) -> SearchResponse:
    is_batch = len(domains) > 1
    if is_batch:
        report = format_batch_full_report(results)
        domains_column = format_batch_domains_column(results)
        ips_column = format_batch_ips_column(results)
        geosite_geoip = format_batch_v2fly_column(results)
        bat_content = format_router_bat_batch(results)
        bat_filename = sanitize_batch_bat_filename(domains[0], len(domains))
    else:
        result = results[0]
        domain = domains[0]
        report = format_full_report(result)
        domains_column = format_domains_column(result)
        ips_column = format_ips_column(result)
        geosite_geoip = format_v2fly_column(result)
        bat_content = format_router_bat(domain, result)
        bat_filename = sanitize_bat_filename(domain)

    return SearchResponse(
        domains=domains,
        is_batch=is_batch,
        report=report,
        domains_column=domains_column,
        ips_column=ips_column,
        geosite_geoip=geosite_geoip,
        bat_content=bat_content,
        bat_filename=bat_filename,
    )


@asynccontextmanager
async def lifespan(_app: FastAPI):
    start_background_sync()
    yield


app = FastAPI(title="Domain Web Search API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/search", response_model=SearchResponse)
async def search(body: SearchRequest) -> SearchResponse:
    domains = _resolve_domains(body)
    async with _SEARCH_SEM:
        if len(domains) == 1:
            results = [await discover_with_timeout(domains[0])]
        else:
            results = await discover_batch_with_timeout(domains)
    return _build_response(domains, results)
