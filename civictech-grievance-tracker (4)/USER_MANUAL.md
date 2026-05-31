# 📖 CivicPlus — User Manual

**Built by**: Shreyas | Jairam | Akhil | Aman
**Version**: 1.0.0 | Swecha CivicTech Hackathon 2025

---

## 🔰 Getting Started
Open the app at `http://localhost:3000` after setup.

Select your **Focus Level** from the top navigation:
| Level | Coverage |
|---|---|
| 🏙️ City | Hyderabad GHMC zones |
| 🗾 State | All Telangana districts |
| 🇮🇳 National | Pan-India issues |

---

## 📊 1. Citizen Dashboard
*Built by: Shreyas & Akhil*

Shows real-time statistics for your selected level.

| Stat Card | What it Shows |
|---|---|
| Open Grievances | Pending + under-review issues |
| Crew Assigned | Issues with a department assigned |
| Resolved Work | Successfully closed complaints |
| Avg Response Time | Estimated resolution time in hours |

**Charts:**
- **Severity Chart** — Critical / High / Medium / Low breakdown with color bars
- **Category Chart** — Which civic issue types are most reported

---

## 🗺️ 2. Civic Map
*Built by: Shreyas*

Interactive pin map showing all reported issues.

**Pin Colors:**
| Color | Category |
|---|---|
| 🔴 Red | Garbage & Waste |
| 🔵 Blue | Water & Sanitation |
| 🟣 Purple | Women Safety & Lights |
| 🟡 Yellow | Roads & Mobility |
| 🟢 Green | Free Water Points 💧 |

Click any pin to view full issue details.

---

## 📝 3. GrievanceTracker — Report an Issue
*Built by: Akhil*

1. Click **"Report New Issue"**
2. Fill in the form:
   - **Title** — Short description of the problem
   - **Category** — Select issue type
   - **Location** — Area name / landmark
   - **Level** — City / State / National
   - **Description** — Detailed explanation
   - **Photo** *(optional)*
3. Click **"Submit & Analyze with AI"**
4. Gemini AI instantly generates:
   - 🎯 Priority score (1–10)
   - 🏢 Responsible department
   - 📄 Official complaint letter
   - 📞 Authority contact details
   - 💡 Citizen action plan

---

## 💧 4. Free Water Points *(Summer Feature)*
*Idea by: Jairam | Built by: Akhil & Shreyas*

Hyderabad summers reach 45°C+ — find free water near you!

**How to report a water point:**
1. Select category → **"Free Water Points"**
2. Add location (street name / landmark)
3. Describe: Pyaau / Water ATM / GHMC Tanker
4. Submit — it appears as a 🟢 Green pin on the map immediately

---

## 📡 5. Live Feed
*Built by: Akhil*

Real-time stream of civic alerts across the city.
- 🟢 Green cards = issues resolved by authorities
- 🔵 Blue cards = new citizen reports coming in
- Auto-updates every 18 seconds
- Shows live observer count

---

## 🗳️ 6. Civic Polls
*Built by: Aman*

Vote on important city decisions:
1. Read the poll question
2. Click your preferred option
3. See live % results after voting
4. Each user can vote once per poll

---

## ❓ FAQ

**Q: Can I report anonymously?**
A: Yes — reporter name is optional.

**Q: How does AI prioritization work?**
A: Gemini AI reads your description and assigns severity, department, and drafts an official letter automatically.

**Q: What if AI is unavailable?**
A: The system auto-falls back to smart rule-based heuristics — always returns a useful result.

**Q: Which areas are covered?**
A: All GHMC circles in Hyderabad, all 33 Telangana districts, and national highways for India-level issues.

---

## 📞 Support
Open an issue: `https://code.swecha.org/hijhmalajairam/civicplus/issues`
