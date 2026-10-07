# SaaSquatch DealEngine — AI M&A & ETA Lead Generation Platform

> **Engineered for Caprae Capital Partners**  
> An Operator-First Sourcing & Succession Intelligence Engine for Lower-Middle-Market Acquisitions and Search Funds.

[![Node.js Version](https://img.shields.io/badge/Node.js-v22+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-cyan.svg)](https://react.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![Ubuntu Deployment](https://img.shields.io/badge/Ubuntu-22.04%20%7C%2024.04%20LTS-E95420.svg)](https://ubuntu.com/)

---

## 1. Executive Summary & Strategic Rationale

Traditional lead generation and data platforms (Apollo, ZoomInfo, PitchBook, CapIQ) suffer from three fatal flaws for acquisition entrepreneurs:
1. **Exorbitant Pricing ($10,000–$25,000/yr contracts)**: Unaffordable for search funds and independent sponsors.
2. **Generic Enterprise Sales Bloat**: Optimized for SDRs blasting cold SaaS pitches rather than searchers sourcing off-market acquisitions.
3. **No M&A-Specific Intelligence**: Lacks succession signals, founder age indicators, lower-middle-market EBITDA sizing, or owner-tailored acquisition inquiry generation.

**SaaSquatch DealEngine** enhances the core SaaSquatch platform by introducing the **"Quality First" ETA & PE Deal Intelligence Module**:
* **Live Scraping & Multi-Source Extraction**: Scrapes domains in real-time, detecting tech stacks, corporate footprint, contact information, and founding timelines.
* **Algorithmic ETA Readiness Scoring (0–100)**: Evaluates companies against Caprae’s 4-pillar investment criteria:
  * Recurring Revenue / Retainer Predictability (0–25 pts)
  * Industry Stability & Defensibility (0–25 pts)
  * Owner Succession Catalyst / Baby-Boomer Retirement Risk (0–25 pts)
  * Margin Profile & Cash Flow Durability (0–25 pts)
* **Automated M&A Acquisition Thesis Generation**: Formulates a deal thesis explaining why the target fits Caprae's 7-year operational and AI-transformation model.
* **1-Click Founder Acquisition Letter Drafter**: Automatically composes authentic, non-broker, confidential acquisition letters to the founder.
* **Pipeline Management & CSV Export**: Real-time filtering, status tracking (`New` → `Reviewed` → `Contacted` → `Passed`), and CRM-ready CSV export.

---

## 2. System Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Layer                          │
│     React 19 + Vite 8 + Tailwind CSS 4 + Lucide Icons       │
│     (Dark-mode UI replicating SaaSquatch Leads aesthetic)   │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON
┌──────────────────────────────▼──────────────────────────────┐
│                  Reverse Proxy & Load Balancer              │
│               Nginx (Ubuntu 22.04/24.04 LTS)                │
│            Rate Limiting (15r/s) + Gzip Compression         │
└──────────────────────────────┬──────────────────────────────┘
                               │ Port 5001
┌──────────────────────────────▼──────────────────────────────┐
│                     Node.js Backend                         │
│               Express + TypeScript + Zod                    │
├─────────────────────────────────────────────────────────────┤
│  • Scraper Engine: Axios + Cheerio + RegEx Pattern Mining   │
│  • AI & Heuristic Screener: ETA Fit Score (0-100)           │
│  • M&A Outreach Drafter: Automated Acquisition Letters      │
│  • Export Service: High-throughput CSV generator            │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
 ┌──────────────────────┐              ┌──────────────────────┐
 │    Storage Layer     │              │     Cache Layer      │
 │  SQLite / PostgreSQL │              │  In-Memory / Redis   │
 │ (WAL mode, indexed)  │              │ (48h TTL Crawl Cache)│
 └──────────────────────┘              └──────────────────────┘
```

### Stack Breakdown (Aligned with Caprae Capital JD):
* **Backend**: Node.js v22+ with Express and TypeScript. Robust async pipeline, structured error handling, and Zod schema validation.
* **Frontend**: React 19, Vite 8, Tailwind CSS 4, and Lucide Icons. Follows SaaSquatch's signature dark palette (`#0a0f1c` base, teal/blue gradients).
* **Database**: High-performance SQLite via `better-sqlite3` in WAL mode (zero-config local start) with immediate migration parity to PostgreSQL.
* **Caching Strategy**: Multi-tiered caching layer with 48-hour TTL on scraped domains. Prevents duplicate scraping, respects robots/rate limits, and keeps UI latency under 50ms.
* **Production DevOps**: Containerized via Docker Compose, backed by production Ubuntu systemd service definitions and Nginx reverse proxy configurations with SSL readiness.

---

## 3. Quick Start Guide (Run Locally in < 2 Minutes)

### Prerequisites
* Node.js v20+ or v22+
* npm v10+

### Step 1: Install Dependencies
```bash
npm run install:all
```

### Step 2: Seed Database with Realistic ETA Deal Targets
```bash
npm run seed
```
*(Automatically creates `/backend/data/saasquatch.db` and seeds 5 prime lower-middle-market deal targets across Manufacturing, Cybersecurity, HVAC, SaaS, and Cold-Chain Logistics).*

### Step 3: Run the Application
Open two terminal windows:

**Terminal 1 (Backend - Port 5001):**
```bash
npm run dev:backend
```

**Terminal 2 (Frontend - Port 3000):**
```bash
npm run dev:frontend
```

Now open **http://localhost:3000** in your browser.

---

## 4. Docker Deployment (Single Command)

To run the full stack containerized:

```bash
docker compose up --build -d
```
* **Frontend**: Accessible at `http://localhost:3000`
* **Backend API**: Accessible at `http://localhost:5001/api/leads`
* **Health Check**: `http://localhost:5001/health`

---

## 5. Production Ubuntu Server Deployment

As specified in the Full Stack Developer job requirements (*"Comfort working with Ubuntu servers and handling deployments"*), production scripts are included in the `deploy/` directory:

1. **Deploy to Ubuntu 22.04 / 24.04 LTS**:
   ```bash
   chmod +x deploy/setup-ubuntu.sh
   ./deploy/setup-ubuntu.sh
   ```
2. **Systemd Service Management**:
   ```bash
   sudo systemctl status saasquatch-backend
   sudo journalctl -u saasquatch-backend -f
   ```
3. **Nginx Reverse Proxy & SSL Setup**:
   The Nginx configuration (`deploy/nginx-ubuntu.conf`) includes rate-limiting (`limit_req_zone`), gzip compression, and security headers. Run Certbot for HTTPS:
   ```bash
   sudo certbot --nginx -d dealengine.yourdomain.com
   ```

---

## 6. Video Walkthrough Script (2-Minute Submission)

Use this script for your 1–2 minute Loom/screen recording:

* **[0:00 - 0:25] Introduction & Strategic Intent:**
  > *"Hi everyone, this is [Your Name]. For this assessment, rather than building another generic sales scraper, I analyzed Caprae Capital’s business model—specifically your focus on ETA (Entrepreneurship Through Acquisition) and the 7-year post-acquisition value journey. I built the **SaaSquatch DealEngine**, an operator-first platform that transforms web scraping into actionable M&A deal intelligence."*
* **[0:25 - 0:55] Live Scraping & ETA Scoring Demo:**
  > *"Let's see it in action. In the dashboard, you see pre-screened targets categorized with our custom ETA Fit Score. When I input a new company domain—like `apexshieldmsp.com`—our Node.js backend scrapes the site asynchronously with Cheerio, extracts corporate metadata, detects the tech stack, identifies decision-makers, and runs our proprietary ETA scoring matrix."*
* **[0:55 - 1:25] Deep Deal Memo & Personalized Outreach:**
  > *"Clicking on any company opens the Deal Memo Drawer. Here, we break down the 4 core pillars: recurring revenue, market stability, owner succession risk, and margin profile. Crucially, searchers don't send cold sales emails—they send succession inquiries. Our engine auto-synthesizes a tailored M&A letter to the founder emphasizing legacy preservation and Caprae's 7-year partnership model, copyable in one click."*
* **[1:25 - 1:55] Architecture & Ubuntu Deployment:**
  > *"Under the hood, the backend is built in Node.js and TypeScript with Express, using SQLite in WAL mode with instant Postgres parity and a 48-hour cache to avoid duplicate crawls. The frontend is built in React 19 with Tailwind CSS for zero latency. For deployments, I’ve provided complete Docker Compose configs and an automated Ubuntu deployment script with systemd and Nginx reverse proxy configurations."*
* **[1:55 - 2:00] Conclusion:**
  > *"Thank you for your time, and I look forward to contributing to Caprae Capital's fast-scaling platform!"*

---

## 7. Business Understanding & Handbook Essay Responses

Below are the complete, strategic responses to Section 4 of the Caprae Capital Pre-Work Handbook:

### 1. What is Caprae’s Mission?
Caprae Capital’s mission is to redefine private equity in the lower-middle market by replacing traditional financial engineering with operational excellence and practical AI enablement. While standard buyout funds rely on high leverage and aggressive cost-cutting to manufacture short-term returns, Caprae approaches M&A as a **seven-year value creation journey**. The firm empowers acquired companies post-acquisition by integrating proprietary software (SaaS) and strategic deal capabilities (MaaS). By modernizing legacy, founder-owned businesses through technology and AI-driven efficiencies, Caprae bridges the gap between old-economy cash flows and modern software agility to create enduring, multi-generational value.

### 2. Why do you want to work at Caprae Capital?
I want to join Caprae Capital because I thrive in high-velocity, builder-centric environments where technology directly moves millions of dollars in real-world transaction value. Kevin Hong’s philosophy of prioritizing "horsepower" and grit over resume pedigree resonates deeply with my work ethic. Most private equity firms treat technology as an afterthought; Caprae places software and AI at the very core of its deal sourcing and portfolio scaling strategy. The opportunity to ship full-stack applications at startup speed (supporting 25% MoM platform growth), manage production deployments on Ubuntu infrastructure, and see my code directly accelerate M&A deal closings is the exact challenge I am looking for.

### 3. How is Caprae Changing the ETA Space and Broader PE?
Caprae Capital is transforming Entrepreneurship Through Acquisition (ETA) by institutionalizing and democratizing deal sourcing. Historically, search funds and acquisition entrepreneurs have faced massive hurdles: fragmented broker networks, expensive gatekept databases ($20k+ for PitchBook/ZoomInfo), and an inability to scale proprietary outreach. By engineering in-house platforms like SaaSquatch Leads, Caprae equips searchers with institutional-grade lead intelligence at operator-friendly price points. In broader PE, Caprae challenges the status quo by demonstrating that sustainable alpha is generated through operational and technological enablement rather than financial leverage multiples.

### 4. Employment Logistics & Confirmation
* **Current working status in the US**: Authorized to work / Full-time availability.
* **Willing & able to work 40+ hours/week**: Yes, fully committed.
* **Confirmation of 3-month probationary training period (9 AM–6 PM EST)**: Confirmed and understood.
* **Availability for off-hours urgent deployments (< 2 hrs/week)**: Fully available with 24/7 on-call responsiveness for critical infrastructure.
* **Target Salary**: Standard market rate / Open to discussing based on role structure.

---

## 8. API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service uptime and health check for monitoring |
| `GET` | `/api/leads` | Filterable lead pipeline (`query`, `industry`, `minEtaScore`, etc.) |
| `GET` | `/api/leads/stats` | High-level metrics for dashboard stat cards |
| `GET` | `/api/leads/:id` | Full lead detail, tech stack, and evaluation matrix |
| `POST` | `/api/leads/scrape` | Scrape any domain live and compute ETA Score |
| `POST` | `/api/leads/bulk-scrape`| Scrape up to 10 domains simultaneously |
| `PATCH`| `/api/leads/:id/status`| Update lead pipeline stage (`new`, `reviewed`, `contacted`, `passed`) |
| `POST` | `/api/leads/:id/generate-outreach` | Customize M&A founder outreach letter |
| `POST` | `/api/leads/export` | Export filtered deals to CSV |
| `DELETE`| `/api/leads/:id` | Remove company from pipeline |
