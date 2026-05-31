import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { INITIALLY_REPORTED_ISSUES, INITIAL_POLLS, LIVE_TICKER_TEMPLATES } from "./src/data/mockData";
import { ReportedIssue, CivicPoll, LiveAlert } from "./src/types";

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = 3000;

// --- IN-MEMORY REALTIME DATABASE ---
let serverIssues: ReportedIssue[] = JSON.parse(JSON.stringify(INITIALLY_REPORTED_ISSUES));
let serverPolls: CivicPoll[] = JSON.parse(JSON.stringify(INITIAL_POLLS));
let serverAlerts: LiveAlert[] = [
  {
    id: 'alert-initial-1',
    message: 'GHMC road crew dispatched to water clogged Begumpet section.',
    timestamp: new Date(Date.now() - 45000).toISOString(),
    type: 'resolve',
    locationName: 'Begumpet, Hyderabad'
  },
  {
    id: 'alert-initial-2',
    message: 'New e-waste litter hazard report logged at Madhapur corridor.',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    type: 'report',
    locationName: 'Madhapur (Hitec City), Hyderabad'
  }
];

// Autonomous generator of global real-time activity context
setInterval(() => {
  const isReportType = Math.random() > 0.45;
  if (isReportType) {
    const rawTpl = LIVE_TICKER_TEMPLATES[Math.floor(Math.random() * LIVE_TICKER_TEMPLATES.length)];
    if (!serverIssues.some(i => i.title === rawTpl.text)) {
      const newIssue: ReportedIssue = {
        id: `auto-issue-${Date.now()}`,
        title: rawTpl.text,
        description: `Telemetry system auto-detection report. Citizen concerns regarding ${rawTpl.category.toLowerCase()} issues have been flagged near ${rawTpl.locationName}. Urgently requires resolution.`,
        category: rawTpl.category as any,
        location: rawTpl.locationName,
        level: rawTpl.level as any,
        lat: 15 + Math.floor(Math.random() * 65),
        lng: 15 + Math.floor(Math.random() * 65),
        reporter: 'Live Sensor Node',
        upvotes: Math.floor(Math.random() * 8) + 1,
        status: 'Pending',
        priority: 'Medium',
        priorityScore: 5,
        createdAt: new Date().toISOString(),
        image: null,
        aiResponse: null
      };
      
      serverIssues.unshift(newIssue);
      
      const newAlert: LiveAlert = {
        id: `alert-dyn-${Date.now()}`,
        message: `${rawTpl.text} - awaiting community prioritization upvotes.`,
        timestamp: new Date().toISOString(),
        type: 'report',
        locationName: rawTpl.locationName
      };
      serverAlerts.unshift(newAlert);
      if (serverAlerts.length > 30) serverAlerts.pop();
    }
  } else {
    const resolvedOptions = [
      'GHMC vacuum suction clears drainage on Sector 3 Madhapur road.',
      'TSSPDCL substation technician repairs open distribution box near Begumpet.',
      'State High-speed Highway patrol clears sand silt piles off NH-163.',
      'Karimnagar water maintenance team completes local pipeline pressure sealing.',
      'Central transport engineers mount solar delineator signposts near Telangana state border.'
    ];

    const rMessage = resolvedOptions[Math.floor(Math.random() * resolvedOptions.length)];

    const newAlert: LiveAlert = {
      id: `alert-dyn-${Date.now()}`,
      message: `✔️ ${rMessage}`,
      timestamp: new Date().toISOString(),
      type: 'resolve',
      locationName: 'Telangana Region'
    };
    serverAlerts.unshift(newAlert);
    if (serverAlerts.length > 30) serverAlerts.pop();
  }
}, 25000);


// Initialize Gemini Client
let ai: GoogleGenAI | null = null;
const API_KEY = process.env.GEMINI_API_KEY;

if (API_KEY && API_KEY !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini AI Engine successfully initialized.");
  } catch (error) {
    console.error("Failed to initialize Gemini Client:", error);
  }
} else {
  console.warn("WARN: GEMINI_API_KEY is not configured or left as default. AI features will fallback to server-side heuristics.");
}

// ----------------------------------------------------
// Core API Routes (Precede Vite Middleware)
// ----------------------------------------------------

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// AI Analyze Endpoint
app.post("/api/analyze-civic-issue", async (req, res) => {
  const { title, description, category, location, level } = req.body;

  if (!title || !description) {
    return res.status(400).json({ error: "Missing required fields: title and description are required." });
  }

  // Fallback heuristic calculations if Gemini is unavailable
  const calculateFallback = () => {
    let dept = "Local Municipality";
    let helpline = "Civic Helpline: 100 / 103";
    let score = 5;
    let priority: 'Low' | 'Medium' | 'High' | 'Critical' = 'Medium';

    if (level === 'City') {
      if (category === 'Women Safety & Lights') {
        dept = 'GHMC Street Lighting & Women Safety Wing';
        helpline = 'Women Safety Desk: 1091 | Police SHE-Teams: 100';
      } else if (category === 'Water & Sanitation') {
        dept = 'HMWSSB Water & Sewerage Supply Control';
        helpline = 'HMWSSB Customer Portal: 155313';
      } else if (category === 'Garbage & Waste') {
        dept = 'GHMC Department of Waste & Sanitation';
        helpline = 'GHMC Solid Waste Wing: 040-21111111';
      } else {
        dept = 'Greater Hyderabad Municipal Corporation (GHMC)';
        helpline = 'GHMC Center: 040-21111111';
      }
    } else if (level === 'State') {
      if (category === 'Women Safety & Lights') {
        dept = 'Telangana Police She-Teams State HQ';
        helpline = 'She-Teams Call Desk: 040-23450121';
      } else if (category === 'Garbage & Waste') {
        dept = 'Telangana State Pollution Control Board (TSPCB)';
        helpline = 'TSPCB Paryavarana Desk: 040-23887500';
      } else {
        dept = 'Telangana State Urban Infrastructure Corporation';
        helpline = 'Telangana State Portal: 040-23450121';
      }
    } else {
      dept = 'Ministry of Housing and Urban Affairs / NHAI';
      helpline = 'National Swachh Bharat Helpdesk: 1969';
    }

    if (category === 'Women Safety & Lights' || description.toLowerCase().includes('dark') || description.toLowerCase().includes('woman') || description.toLowerCase().includes('hostel')) {
      score = 10;
      priority = 'Critical';
    } else if (category === 'Garbage & Waste' && (description.toLowerCase().includes('burning') || description.toLowerCase().includes('toxic') || description.toLowerCase().includes('smoke'))) {
      score = 9;
      priority = 'High';
    } else if (category === 'Water & Sanitation' && (description.toLowerCase().includes('clog') || description.toLowerCase().includes('flood') || description.toLowerCase().includes('overflow'))) {
      score = 8;
      priority = 'High';
    }

    return {
      department: dept,
      priorityScore: score,
      priorityLevel: priority,
      resolvedChecklist: [
        `Inspecting physical location at ${location}`,
        `Clear active debris and set safety security hazard tape`,
        `Formal audit report submitted to Divisional Officer`,
        `Undertaking technical corrections and verifying resolution`
      ],
      officialLetterDraft: `To,\nThe Chief Officer,\n${dept},\nTelangana, India.\n\nSubject: Civic Grievance Complaint - ${title}\n\nDear Sir/Madam,\n\nI wish to report a critical civic problem concerning: "${title}" at location: "${location}".\n\nIssue Details:\n${description}\n\nThis matter causing severe inconvenience and daily hazards to general commuting citizens. Please escalate this reporting record for urgent resolution.\n\nWarm regards,\nReporting Citizen.`,
      authorityContact: helpline,
      suggestedActionPlan: "Mobilize nearby residential groups, share on active ward whatsapp groups, and track ticket status using the CivicTech platform."
    };
  };

  if (!ai) {
    console.log("Using server-side heuristic fallback for analysis task.");
    return res.json({ result: calculateFallback(), note: "Gemini server client not active. Result was generated using structural analytics." });
  }

  try {
    const prompt = `
      You are an expert civic engineer and administrative consultant for the Government of India, the state of Telangana, and the city of Hyderabad. Your job is to analyze reported citizen grievances and categorize them perfectly.
      
      Here are the grievance metadata:
      - Title: "${title}"
      - Category: "${category}" (Focusing on 'Garbage & Waste', 'Water & Sanitation', 'Women Safety & Lights', 'Roads & Mobility', or 'Other')
      - Location Area: "${location}"
      - Focus Level: "${level}" (City focuses strictly on Greater Hyderabad Municipal Corporation or HMWSSB, State focuses on Telangana State departments like TSPCB, and National focuses on central ministries or NHAI).
      - Full Context: "${description}"

      Specifically target the relevant authorities:
      - If level is 'City', direct to Greater Hyderabad Municipal Corporation (GHMC) Solid Waste Dept, HMWSSB (Sewerage/Water), GHMC Street Lighting & Women Safety Wing, or Hyderabad/Telangana SHE-teams.
      - If level is 'State', direct to Telangana State Pollution Control Board (TSPCB), Telangana Road Development, or Telangana Police SHE-Teams State HQ.
      - If level is 'National', direct to NHAI, Ministry of Environment, Forest and Climate Change, National Disaster Response, etc.

      Calculate:
      1. A realistic "department" name.
      2. An urgency "priorityScore" integer between 1 and 10 (Critical life risks = 9-10, severe mobility blocks = 7-8, medium inconveniences = 4-6, low cosmetic problems = 1-3).
      3. A corresponding "priorityLevel" text value string exactly matching one of: "Low", "Medium", "High", "Critical".
      4. A "resolvedChecklist" containing 4 specific, actionable engineering/maintenance steps the authority/department crew needs to physical deploy at the location site.
      5. An "officialLetterDraft": A formal, elegant, and persuasive grievance letter in English addressed to the department administrative director. State the specifics clearly, highlight the threat matrix, and frame a timeline for emergency work. Mention specific landmarks or context from the description.
      6. "authorityContact": A real or realistic phone hotline and email address for this department.
      7. "suggestedActionPlan": A practical 2-sentence advice for local residents on how they can pressure the ward corporator or use local collective action of Telangana civic circles (like Basti committees or resident associations).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            department: {
              type: Type.STRING,
              description: "The specific local, state, or national authority department matching the focus area."
            },
            priorityScore: {
              type: Type.INTEGER,
              description: "Priority scoring between 1 (lowest priority/cosmetic) to 10 (immediate threat to life/electricity sparking)."
            },
            priorityLevel: {
              type: Type.STRING,
              description: "Must be 'Low', 'Medium', 'High', or 'Critical'."
            },
            resolvedChecklist: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "4 clear engineering steps for physical fix execution."
            },
            officialLetterDraft: {
              type: Type.STRING,
              description: "A beautifully written, high-fidelity official letter directed to the administrative wing."
            },
            authorityContact: {
              type: Type.STRING,
              description: "Contact number/email for the direct escalation officer."
            },
            suggestedActionPlan: {
              type: Type.STRING,
              description: "Practical action checklist advice for the citizens reporting of Hyderabad/Telangana nodes."
            }
          },
          required: ["department", "priorityScore", "priorityLevel", "resolvedChecklist", "officialLetterDraft", "authorityContact", "suggestedActionPlan"]
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error("Received empty text answer from Gemini SDK.");
    }

    const data = JSON.parse(responseText.trim());
    return res.json({ result: data });

  } catch (err: any) {
    console.error("Gemini API call failed:", err);
    // Graceful fallback to avoid throwing 500
    return res.json({
      result: calculateFallback(),
      errorWarning: err.message,
      note: "Gemini server error happened. Reverting to local heuristic calculations."
    });
  }
});

// GET all reported issues
app.get("/api/issues", (req, res) => {
  res.json({ issues: serverIssues });
});

// POST a new issue
app.post("/api/issues", (req, res) => {
  const newIssue = req.body;
  serverIssues.unshift(newIssue);
  
  // Save/broadcast warning alert
  const newAlert: LiveAlert = {
    id: `alert-issue-${Date.now()}`,
    message: `New issue registered: "${newIssue.title}" has been successfully logged to the public node.`,
    timestamp: new Date().toISOString(),
    type: 'report',
    locationName: newIssue.location
  };
  serverAlerts.unshift(newAlert);
  if (serverAlerts.length > 30) serverAlerts.pop();

  res.status(201).json({ issue: newIssue, alert: newAlert });
});

// POST upvote an issue
app.post("/api/issues/:id/upvote", (req, res) => {
  const { id } = req.params;
  const issue = serverIssues.find(i => i.id === id);
  if (issue) {
    issue.upvotes += 1;
    
    const newAlert: LiveAlert = {
      id: `alert-upv-${Date.now()}`,
      message: `Citizen upvoted grievance: "${issue.title}". Escalation urgency increased.`,
      timestamp: new Date().toISOString(),
      type: 'report',
      locationName: issue.location
    };
    serverAlerts.unshift(newAlert);
    if (serverAlerts.length > 30) serverAlerts.pop();

    res.json({ issue, alert: newAlert });
  } else {
    res.status(404).json({ error: "Issue not found" });
  }
});

// POST update grievance status (resolving an issue)
app.post("/api/issues/:id/status", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const issue = serverIssues.find(i => i.id === id);
  if (issue) {
    issue.status = status || 'Resolved';
    
    const newAlert: LiveAlert = {
      id: `alert-res-${Date.now()}`,
      message: `✔️ Civic issue resolved! "${issue.title}" marked as ${issue.status}.`,
      timestamp: new Date().toISOString(),
      type: 'resolve',
      locationName: issue.location
    };
    serverAlerts.unshift(newAlert);
    if (serverAlerts.length > 30) serverAlerts.pop();

    res.json({ issue, alert: newAlert });
  } else {
    res.status(404).json({ error: "Issue not found" });
  }
});

// GET all polls
app.get("/api/polls", (req, res) => {
  res.json({ polls: serverPolls });
});

// POST vote on a poll
app.post("/api/polls/:id/vote", (req, res) => {
  const { id } = req.params;
  const { optionId } = req.body;
  const poll = serverPolls.find(p => p.id === id);
  if (poll) {
    const option = poll.options.find(o => o.id === optionId);
    if (option) {
      option.votes += 1;
      poll.totalVotes += 1;

      const newAlert: LiveAlert = {
        id: `alert-poll-vote-${Date.now()}`,
        message: `Public vote casted on: "${poll.question.substring(0, 48)}..."`,
        timestamp: new Date().toISOString(),
        type: 'system',
        locationName: 'Democracy Portal'
      };
      serverAlerts.unshift(newAlert);
      if (serverAlerts.length > 30) serverAlerts.pop();

      res.json({ poll, alert: newAlert });
    } else {
      res.status(404).json({ error: "Option not found" });
    }
  } else {
    res.status(404).json({ error: "Poll not found" });
  }
});

// GET all live alerts
app.get("/api/alerts", (req, res) => {
  res.json({ alerts: serverAlerts });
});


// ----------------------------------------------------
// Serve Frontend Assets & Vite integration
// ----------------------------------------------------

async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Setting up Vite development middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Setting up production static file serving...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[CivicTech Server] listening successfully at http://0.0.0.0:${PORT}`);
  });
}

setupServer();
