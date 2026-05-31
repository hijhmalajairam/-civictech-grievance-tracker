import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

// Set port for Render
const PORT = process.env.PORT || 8080;

// Initialize Google Gemini AI Client
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || 'MISSING_KEY' 
});

// --- FAST, ERROR-FREE IN-MEMORY STORAGE ---
let issues: any[] = [];
let alerts: any[] = [];
let polls = [
  {
    id: "poll-1",
    level: "City",
    question: "Should GHMC allocate more budget to smart street lighting or pothole repair?",
    options: [
      { id: "opt-1", text: "Smart Street Lighting", votes: 145 },
      { id: "opt-2", text: "Pothole Repair", votes: 312 }
    ],
    totalVotes: 457
  },
  {
    id: "poll-2",
    level: "State",
    question: "Which highway infrastructure needs the most urgent upgrade?",
    options: [
      { id: "opt-3", text: "NH-65 (Hyderabad-Warangal)", votes: 890 },
      { id: "opt-4", text: "NH-44 (Hyderabad-Nagpur)", votes: 654 }
    ],
    totalVotes: 1544
  }
];

// --- API ENDPOINTS ---

app.get('/api/issues', (req, res) => {
  res.json({ issues });
});

app.post('/api/issues', (req, res) => {
  const newIssue = req.body;
  issues.unshift(newIssue);
  
  const newAlert = {
    id: `alert-${Date.now()}`,
    message: `New issue reported: ${newIssue.title}`,
    timestamp: new Date().toISOString(),
    type: 'report',
    locationName: newIssue.location
  };
  alerts.unshift(newAlert);
  if (alerts.length > 20) alerts.pop();
  
  res.json({ success: true, issue: newIssue, alert: newAlert });
});

app.post('/api/issues/:id/upvote', (req, res) => {
  const issue = issues.find(i => i.id === req.params.id);
  if (issue) {
    issue.upvotes = (issue.upvotes || 0) + 1;
    res.json({ success: true, upvotes: issue.upvotes });
  } else {
    res.status(404).json({ error: 'Issue not found' });
  }
});

app.post('/api/issues/:id/status', (req, res) => {
  const issue = issues.find(i => i.id === req.params.id);
  if (issue) {
    issue.status = req.body.status;
    
    const newAlert = {
      id: `alert-${Date.now()}`,
      message: `Issue resolved by crew: ${issue.title}`,
      timestamp: new Date().toISOString(),
      type: 'resolve',
      locationName: issue.location
    };
    alerts.unshift(newAlert);
    if (alerts.length > 20) alerts.pop();
    
    res.json({ success: true, status: issue.status, alert: newAlert });
  } else {
    res.status(404).json({ error: 'Issue not found' });
  }
});

app.get('/api/polls', (req, res) => {
  res.json({ polls });
});

app.post('/api/polls/:id/vote', (req, res) => {
  const poll = polls.find(p => p.id === req.params.id);
  if (poll) {
    const option = poll.options.find(o => o.id === req.body.optionId);
    if (option) {
      option.votes++;
      poll.totalVotes++;
      res.json({ success: true, poll });
    } else {
      res.status(400).json({ error: 'Option not found' });
    }
  } else {
    res.status(404).json({ error: 'Poll not found' });
  }
});

app.get('/api/alerts', (req, res) => {
  res.json({ alerts });
});

// --- SUPER SMART AI ROUTE (Crash-Proofed) ---
app.post('/api/analyze-civic-issue', async (req, res) => {
  try {
    const { title, description, category, location, level } = req.body;
    
    const prompt = `
    You are the CivicPlus AI Agent for the Greater Hyderabad Municipal Corporation (GHMC) and Telangana State.
    Analyze the following civic grievance:
    Title: ${title}
    Description: ${description}
    Category: ${category}
    Location: ${location}
    Level: ${level}

    Determine:
    1. department: The exact government department responsible.
    2. priorityScore: Score from 1-10 based on threat severity.
    3. priorityLevel: "Low", "Medium", "High", or "Critical".
    4. resolvedChecklist: Array of 3-4 engineering/resolution steps.
    5. officialLetterDraft: A formal complaint letter addressed to the department.
    6. authorityContact: Phone/Email of the department.
    7. suggestedActionPlan: 1-2 sentences on what citizens should do right now.

    Return the result strictly as a valid JSON object matching this exact schema.
    `;

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MISSING_KEY') {
      return res.json({
        result: {
          department: "General Municipal Wing (Fallback Mode)",
          priorityScore: 5,
          priorityLevel: "Medium",
          resolvedChecklist: ["Dispatch inspection unit", "Assess site safety", "Schedule repair operations"],
          officialLetterDraft: `To,\nThe Zonal Commissioner,\n\nSubject: Grievance regarding ${title}\n\nPlease look into the issue at ${location} immediately.`,
          authorityContact: "Contact Local Ward Office",
          suggestedActionPlan: "Wait for official crew inspection. Use caution around the area."
        }
      });
    }

    // STRICT JSON ENFORCEMENT ADDED HERE
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    
    const rawText = response.text || "{}";
    const result = JSON.parse(rawText);

    res.json({ result });
  } catch (error) {
    console.error("AI Analysis Error:", error);
    res.status(500).json({ error: "Failed to process civic issue analysis." });
  }
});

// --- SERVE THE REACT FRONTEND ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`CivicPlus Master Node backend running on port ${PORT}`);
});
