# 🤖 AGENTS.md — CivicPlus AI Agent Documentation

**Maintained by**: Jairam (Backend) | Aman (Docs)
**Last Updated**: May 2026

---

## Overview
CivicPlus uses **Google Gemini AI** as its core intelligence engine to analyze civic grievances, prioritize issues, and generate actionable outputs for citizens and authorities automatically.

---

## 🧠 Agent: Civic Issue Analyzer

**Built by: Jairam**

### Purpose
Analyzes submitted civic grievances and produces structured, actionable government-level intelligence in real time.

### Endpoint
```
POST /api/analyze-civic-issue
```

### Input Schema
```json
{
  "title": "Broken street lights near hostel",
  "description": "300m stretch completely dark after 6:30 PM...",
  "category": "Women Safety & Lights",
  "location": "Gachibowli, Hyderabad",
  "level": "City"
}
```

### What the Agent Does — Step by Step
1. **Reads** grievance title, description, category, location, and level
2. **Identifies** the correct government department (GHMC / HMWSSB / TSPCB / NHAI)
3. **Scores** urgency from 1–10 based on real threat severity
4. **Classifies** priority: `Low` / `Medium` / `High` / `Critical`
5. **Generates** a 4-step engineering resolution checklist
6. **Drafts** a formal official complaint letter to the department
7. **Provides** authority contact details (phone + email)
8. **Suggests** citizen action plan (ward corporator, social media escalation)

### Output Schema
```json
{
  "department": "GHMC Street Lighting & Women Safety Wing",
  "priorityScore": 10,
  "priorityLevel": "Critical",
  "resolvedChecklist": [
    "Dispatch emergency electrician squad...",
    "Replace burnt copper cabling...",
    "Integrate with She-Teams nodes...",
    "Clear tree branches blocking light..."
  ],
  "officialLetterDraft": "To,\nThe Zonal Commissioner...",
  "authorityContact": "GHMC: 040-23225397 | safety.elec@ghmc.gov.in",
  "suggestedActionPlan": "Raise alert via Hawk-Eye App and tag Police Commissioner..."
}
```

---

## 🔄 Fallback Behavior
**Built by: Jairam**

If Gemini API is unavailable, the system **automatically falls back** to a rule-based heuristic engine with zero downtime:

| Trigger | Fallback Action |
|---|---|
| No API key configured | Use keyword-matching heuristics |
| API timeout / error | Return heuristic-based result |
| JSON parse failure | Return safe structured default |

---

## 🗂️ Department Routing Logic

| Level | Category | Department Assigned |
|---|---|---|
| City | Garbage & Waste | GHMC Solid Waste Wing |
| City | Water & Sanitation | HMWSSB — `155313` |
| City | Women Safety & Lights | GHMC Street Lighting + She-Teams |
| City | Roads & Mobility | GHMC Roads Division |
| City | Free Water Points | GHMC Water Supply Wing |
| State | Garbage & Waste | Telangana State Pollution Control Board (TSPCB) |
| State | Women Safety | Telangana Police She-Teams State HQ |
| State | Roads | Telangana Road Development Corporation |
| National | Roads | NHAI |
| National | Environment | Ministry of Environment, Forest & Climate Change |

---

## ⚙️ Model Configuration

| Setting | Value |
|---|---|
| Model | `gemini-3.5-flash` |
| Response Format | JSON (strict schema enforced) |
| Max Tokens | 1000 |
| API Key | Server-side only (`.env.local`) |

---

## 🔐 Security
- API key stored in `.env.local` — **never committed to Git**
- All Gemini calls are **server-side only** — key never exposed to frontend
- Input sanitized before sending to Gemini API

---

## 👥 Agent Contribution Map

| Agent Feature | Built By |
|---|---|
| Gemini API integration & server setup | **Jairam** |
| Priority scoring + department routing logic | **Jairam** & **Akhil** |
| Fallback heuristic engine | **Jairam** |
| Official letter draft template | **Shreyas** & **Aman** |
| Frontend AI result display (GrievanceTracker) | **Akhil** |
| Agent documentation | **Aman** |

---

## 🚀 Future Agent Enhancements
- [ ] **Image Analysis Agent** — Scan uploaded photos for issue severity (Shreyas)
- [ ] **Multilingual Agent** — Telugu & Urdu response generation (Aman)
- [ ] **Predictive Agent** — Forecast civic hotspots from historical data (Akhil)
- [ ] **SMS/WhatsApp Agent** — Send resolution updates via Twilio (Jairam)
