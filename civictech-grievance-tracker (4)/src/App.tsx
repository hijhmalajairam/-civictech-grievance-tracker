import { useState, useEffect } from 'react';
import { ReportedIssue, IssueLevel, LiveAlert, CivicPoll } from './types';
import { INITIALLY_REPORTED_ISSUES } from './data/mockData';
import CivicMap from './components/CivicMap';
import CitizenDashboard from './components/CitizenDashboard';
import GrievanceTracker from './components/GrievanceTracker';
import CivicPolls from './components/CivicPolls';
import LiveFeed from './components/LiveFeed';
import { 
  Building2, MapPin, BarChart3, HelpCircle, AlertCircle, CheckCircle2, 
  Map, Sparkles, Megaphone, Terminal, Clock, Heart, BookOpen
} from 'lucide-react';

export default function App() {
  const [currentTime, setCurrentTime] = useState<string>(() =>
    new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata'
    })
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(
        new Date().toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata'
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const level: IssueLevel = 'City';
  const [issues, setIssues] = useState<ReportedIssue[]>([]);
  const [polls, setPolls] = useState<CivicPoll[]>([]);
  const [alerts, setAlerts] = useState<LiveAlert[]>([]);
  
  const [theme, setTheme] = useState<'slate' | 'cyber' | 'forest'>(() => {
    try {
      const saved = localStorage.getItem('civic_tech_theme');
      return (saved === 'cyber' || saved === 'forest' || saved === 'slate') ? saved : 'slate';
    } catch {
      return 'slate';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('civic_tech_theme', theme);
    } catch (e) {
      console.error(e);
    }
  }, [theme]);
  
  const [votedPollIds, setVotedPollIds] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('civic_tech_voted_polls');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [upvotedIssueIds, setUpvotedIssueIds] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('civic_tech_upvoted_issues');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tracker' | 'polls'>('tracker');
  
  // Interactive coordinates clicked on map
  const [tempPin, setTempPin] = useState<{ lat: number; lng: number; locationName: string } | null>(null);
  
  // Realtime floating alerts state
  const [toastAlert, setToastAlert] = useState<LiveAlert | null>(null);
  const [lastAlertId, setLastAlertId] = useState<string | null>(null);

  // Sync state from server API
  const syncStateWithServer = async () => {
    try {
      const [issuesRes, pollsRes, alertsRes] = await Promise.all([
        fetch('/api/issues').then(r => r.json()),
        fetch('/api/polls').then(r => r.json()),
        fetch('/api/alerts').then(r => r.json())
      ]);

      if (issuesRes.issues) {
        const enrichedIssues = issuesRes.issues.map((issue: ReportedIssue) => ({
          ...issue,
          hasUpvoted: !!upvotedIssueIds[issue.id]
        }));
        setIssues(enrichedIssues);
      }

      if (pollsRes.polls) {
        const enrichedPolls = pollsRes.polls.map((poll: CivicPoll) => ({
          ...poll,
          votedOptionId: votedPollIds[poll.id] || undefined
        }));
        setPolls(enrichedPolls);
      }

      if (alertsRes.alerts) {
        setAlerts(alertsRes.alerts);
      }
    } catch (err) {
      console.error("Real-time synchronization failed:", err);
    }
  };

  // Sync on mount and run a polling loop every 3 seconds
  useEffect(() => {
    syncStateWithServer();

    const syncInterval = setInterval(() => {
      syncStateWithServer();
    }, 3000);

    return () => clearInterval(syncInterval);
  }, [votedPollIds, upvotedIssueIds]);

  // Persist voted items and upvotes locally
  useEffect(() => {
    try {
      localStorage.setItem('civic_tech_voted_polls', JSON.stringify(votedPollIds));
    } catch (e) {
      console.error(e);
    }
  }, [votedPollIds]);

  useEffect(() => {
    try {
      localStorage.setItem('civic_tech_upvoted_issues', JSON.stringify(upvotedIssueIds));
    } catch (e) {
      console.error(e);
    }
  }, [upvotedIssueIds]);

  // Toast a notification when a new server-side alert is generated
  useEffect(() => {
    if (alerts && alerts.length > 0) {
      const latest = alerts[0];
      if (latest.id !== lastAlertId) {
        setLastAlertId(latest.id);
        // Avoid initial mount visual clutter
        if (lastAlertId !== null) {
          setToastAlert(latest);
          setTimeout(() => {
            setToastAlert(curr => curr?.id === latest.id ? null : curr);
          }, 5000);
        }
      }
    }
  }, [alerts, lastAlertId]);

  const handleAddIssue = async (newIssue: ReportedIssue) => {
    // Optimistically prepend
    setIssues(prev => [newIssue, ...prev]);
    setSelectedIssueId(newIssue.id);
    handleClearTempPin();

    try {
      const response = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIssue)
      });
      const data = await response.json();
      if (data.alert) {
        setToastAlert(data.alert);
      }
      syncStateWithServer();
    } catch (err) {
      console.error("Failed to sync newly added issue to server database:", err);
    }
  };

  const handleAdmitNewAlertAsIssue = (newIssueData: Omit<ReportedIssue, 'id' | 'createdAt' | 'upvotes' | 'status'>) => {
    // Background dynamic entries are handled by server background scheduler
  };

  const handleMapIncidentClick = (lat: number, lng: number, locationName: string) => {
    setTempPin({ lat, lng, locationName });
    setActiveTab('tracker'); // Swap to reporting form tab automatically
  };

  const handleClearTempPin = () => {
    setTempPin(null);
  };

  const handleUpvoteIssue = async (issueId: string) => {
    // Optimistic client upvote state update
    setUpvotedIssueIds(prev => ({ ...prev, [issueId]: true }));
    setIssues(prev => prev.map(issue => {
      if (issue.id === issueId) {
        return { ...issue, upvotes: issue.upvotes + 1, hasUpvoted: true };
      }
      return issue;
    }));

    try {
      const res = await fetch(`/api/issues/${issueId}/upvote`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.alert) {
        setToastAlert(data.alert);
      }
      syncStateWithServer();
    } catch (err) {
      console.error("Failed to upvote on server:", err);
    }
  };

  const handleResolveIssue = async (issueId: string) => {
    // Optimistic status update
    setIssues(prev => prev.map(issue => {
      if (issue.id === issueId) {
        return { ...issue, status: 'Resolved' };
      }
      return issue;
    }));

    try {
      const res = await fetch(`/api/issues/${issueId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Resolved' })
      });
      const data = await res.json();
      if (data.alert) {
        setToastAlert(data.alert);
      }
      syncStateWithServer();
    } catch (err) {
      console.error("Failed to resolve issue on server:", err);
    }
  };

  const handlePollVote = async (pollId: string, optionId: string) => {
    // Return if already voted
    if (votedPollIds[pollId]) return;

    setVotedPollIds(prev => ({ ...prev, [pollId]: optionId }));
    setPolls(prevPolls => prevPolls.map(poll => {
      if (poll.id !== pollId) return poll;
      const updatedOptions = poll.options.map(opt => {
        if (opt.id === optionId) {
          return { ...opt, votes: opt.votes + 1 };
        }
        return opt;
      });
      return {
        ...poll,
        options: updatedOptions,
        totalVotes: poll.totalVotes + 1,
        votedOptionId: optionId
      };
    }));

    try {
      const res = await fetch(`/api/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId })
      });
      const data = await res.json();
      if (data.alert) {
        setToastAlert(data.alert);
      }
      syncStateWithServer();
    } catch (err) {
      console.error("Failed to register poll vote on server:", err);
    }
  };

  const handleUpvoteFromAlert = (issueId: string) => {
    handleUpvoteIssue(issueId);
  };

  // Process incoming simulated alert toaster
  const handleReceiveExtAlert = (alert: LiveAlert) => {
    setToastAlert(alert);
    setTimeout(() => {
      setToastAlert(curr => curr?.id === alert.id ? null : curr);
    }, 5500);
  };

  const THEMES = {
    slate: {
      bg: "bg-slate-50/60 text-slate-900 border-none",
      header: "border-b border-slate-200/70 bg-white/80 backdrop-blur-md",
      brand: "from-blue-600 to-indigo-600 shadow-blue-500/20",
      bannerBg: "from-slate-900 to-slate-950 text-white",
      bannerText: "text-slate-300",
      bannerIcon: "text-blue-300 border-white/10",
      glowColor: "from-blue-500/8",
      activeTabClass: "border-blue-600 text-blue-600",
      accentBg: "bg-blue-50/60 border-blue-200/50",
      accentText: "text-blue-600",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      badgeGlow: "bg-emerald-500",
    },
    cyber: {
      bg: "bg-[#080b11] text-slate-100",
      header: "border-b border-slate-800 bg-[#0f172a]/90 backdrop-blur-md",
      brand: "from-cyan-500 to-blue-600 shadow-cyan-500/20",
      bannerBg: "from-[#0d1527] to-[#121c32] border border-cyan-500/20 text-slate-100",
      bannerText: "text-slate-400",
      bannerIcon: "text-cyan-400 border-cyan-500/10",
      glowColor: "from-cyan-500/12",
      activeTabClass: "border-cyan-400 text-cyan-400 font-extrabold",
      accentBg: "bg-slate-900/60 border-slate-800",
      accentText: "text-cyan-400",
      badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      badgeGlow: "bg-cyan-400",
    },
    forest: {
      bg: "bg-[#f4f3ef] text-slate-850",
      header: "border-b border-emerald-950/10 bg-[#FAF9F5]/90 backdrop-blur-md",
      brand: "from-emerald-600 to-teal-700 shadow-emerald-500/15",
      bannerBg: "from-emerald-950 to-teal-950 text-white",
      bannerText: "text-emerald-100",
      bannerIcon: "text-emerald-300 border-emerald-500/10",
      glowColor: "from-emerald-600/5",
      activeTabClass: "border-emerald-600 text-emerald-700",
      accentBg: "bg-emerald-50/50 border-emerald-100",
      accentText: "text-emerald-700",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      badgeGlow: "bg-emerald-500",
    }
  };

  const t = THEMES[theme];

  return (
    <div id="civic-tech-app" className={`min-h-screen ${t.bg} flex flex-col font-sans selection:bg-blue-600 selection:text-white relative pb-12`}>
      
      {/* GLOBAL THEME SPECIFIC STYLES INJECTIONS */}
      {theme === 'cyber' && (
        <style dangerouslySetInnerHTML={{ __html: `
          #civic-tech-app .bg-white {
            background-color: #0f172a !important;
            border-color: #1e293b !important;
            color: #f1f5f9 !important;
          }
          #civic-tech-app .text-slate-900, 
          #civic-tech-app .text-slate-850,
          #civic-tech-app .text-slate-800,
          #civic-tech-app .text-slate-705,
          #civic-tech-app .text-slate-700 {
            color: #cbd5e1 !important;
          }
          #civic-tech-app .text-slate-950,
          #civic-tech-app .text-slate-900 h1,
          #civic-tech-app h2,
          #civic-tech-app h3,
          #civic-tech-app h4 {
            color: #f8fafc !important;
          }
          #civic-tech-app .bg-slate-50,
          #civic-tech-app .bg-slate-50\\/60 {
            background-color: #080b11 !important;
          }
          #civic-tech-app .bg-slate-50\\/50,
          #civic-tech-app .bg-slate-100,
          #civic-tech-app .bg-slate-100\\/85,
          #civic-tech-app .bg-slate-100\\/50 {
            background-color: #1e293b !important;
            border-color: #334155 !important;
          }
          #civic-tech-app .border-slate-200,
          #civic-tech-app .border-slate-200\\/80,
          #civic-tech-app .border-slate-200\\/70,
          #civic-tech-app .border-slate-200\\/60,
          #civic-tech-app .border-slate-200\\/55,
          #civic-tech-app .border-slate-200\\/50 {
            border-color: #1e293b !important;
          }
          #civic-tech-app input, #civic-tech-app textarea, #civic-tech-app select {
            background-color: #0f172a !important;
            border-color: #334155 !important;
            color: #f8fafc !important;
          }
          #civic-tech-app button.bg-white {
            background-color: #1e293b !important;
            border-color: #334155 !important;
            color: #cbd5e1 !important;
          }
          #civic-tech-app button.bg-white:hover {
            background-color: #334155 !important;
          }
          #civic-tech-app .text-slate-500,
          #civic-tech-app .text-slate-400 {
            color: #94a3b8 !important;
          }
          #civic-tech-app .bg-blue-50\\/60,
          #civic-tech-app .bg-blue-50 {
            background-color: rgb(30 41 59 / 0.5) !important;
            border-color: rgb(56 189 248 / 0.2) !important;
          }
          #civic-tech-app .text-blue-600 {
            color: #22d3ee !important;
          }
          #civic-tech-app .text-blue-700 {
            color: #38bdf8 !important;
          }
          #civic-tech-app .bg-blue-600 {
            background-color: #06b6d4 !important;
          }
          #civic-tech-app .from-blue-650, #civic-tech-app .to-indigo-600 {
            background-image: linear-gradient(to bottom right, #06b6d4, #3b82f6) !important;
          }
        ` }} />
      )}

      {theme === 'forest' && (
        <style dangerouslySetInnerHTML={{ __html: `
          #civic-tech-app .text-blue-600,
          #civic-tech-app .text-blue-700 {
            color: #059669 !important;
          }
          #civic-tech-app .bg-blue-600 {
            background-color: #059669 !important;
          }
          #civic-tech-app .bg-blue-50,
          #civic-tech-app .bg-blue-50\\/60 {
            background-color: #f0fdf4 !important;
            border-color: #d1fae5 !important;
          }
        ` }} />
      )}
      
      {/* SHADOW RADAR ACCENT - PREMIUM AMBIENCE */}
      <div className={`absolute top-0 left-1/4 right-1/4 h-48 bg-gradient-to-b ${t.glowColor} to-transparent rounded-full blur-[120px] pointer-events-none`} />

      {/* FLOAT TOASTER INCIDENT PANEL - ENHANCED CHROME LOOK */}
      {toastAlert && (
        <div id="live-floating-alert" className="fixed bottom-6 right-6 z-[100] max-w-sm bg-white/95 backdrop-blur-md border border-slate-200/80 p-4.5 rounded-2xl shadow-2xl flex gap-3.5 animate-slide-in items-start pointer-events-auto">
          <div className="mt-0.5 p-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl text-blue-600 border border-blue-200/40">
            {toastAlert.type === 'resolve' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <Sparkles className="w-5 h-5 text-blue-600 animate-spin-slow" />
            )}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex justify-between items-center text-[9px] font-mono tracking-wider text-slate-500 font-bold">
              <span className="flex items-center gap-1.5 uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                TRANSMISSION DETECTED ({toastAlert.locationName.split(',')[0].toUpperCase()})
              </span>
              <button onClick={() => setToastAlert(null)} className="text-slate-400 hover:text-slate-600 font-bold ml-2 transition-colors cursor-pointer">✕</button>
            </div>
            <p className="text-xs text-slate-800 font-semibold leading-relaxed font-sans">{toastAlert.message}</p>
          </div>
        </div>
      )}

      {/* PRIMARY APPLICATION PORT MANIFEST HEADER */}
      <header className={`border-b border-slate-200/70 ${theme === 'cyber' ? 'bg-[#0f172a]/95' : theme === 'forest' ? 'bg-[#FAF9F5]/95' : 'bg-white/85'} backdrop-blur-md sticky top-0 z-40 transition-all shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Brand Logo Section */}
          <div className="flex items-center gap-3.5">
            <div className={`p-2.5 bg-gradient-to-br ${t.brand} rounded-xl text-white shadow-lg`}>
              <Building2 className="w-5.5 h-5.5" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold font-sans tracking-tight">CivicPulse</h1>
                <span className={`px-2 py-0.5 text-[9px] border rounded-full font-bold uppercase tracking-wider flex items-center gap-1 ${theme === 'cyber' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${theme === 'cyber' ? 'bg-cyan-400' : 'bg-emerald-500'} animate-pulse`}></span>
                  Node Live
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">{theme === 'forest' ? 'Eco-Preserve Citizen Tracking Desk' : 'Hyderabad Municipal Area • Real-Time Citizen Grievance Hub'}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* INTERACTIVE UI PRESET OPTIONS */}
            <div className={`flex items-center gap-1 p-1 rounded-xl border text-[11px] font-sans ${theme === 'cyber' ? 'bg-slate-900 border-slate-800' : theme === 'forest' ? 'bg-emerald-100/30 border-emerald-900/10' : 'bg-slate-100 border-slate-200/50'}`}>
              <span className="text-slate-400 px-1.5 font-bold">UI Theme:</span>
              {(['slate', 'cyber', 'forest'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setTheme(mode)}
                  className={`px-2.5 py-1 rounded-lg capitalize transition-all cursor-pointer font-bold ${
                    theme === mode 
                      ? mode === 'cyber'
                        ? 'bg-[#0f172a] text-cyan-400 shadow-sm border border-cyan-500/25'
                        : mode === 'forest'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-white text-blue-700 shadow-sm border border-slate-200/40'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Time & User telemetry block - ULTRA SHARP */}
            <div className={`flex items-center gap-3 text-xs font-mono p-2 px-3 rounded-2xl border ${theme === 'cyber' ? 'bg-slate-905 border-slate-800 text-cyan-400' : 'bg-slate-100/85 border-slate-200/50 text-slate-500'}`}>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>IST: <span className={`${theme === 'cyber' ? 'text-cyan-400' : 'text-slate-950'} font-bold`}>{currentTime}</span></span>
              </div>
              <span className="text-slate-300">/</span>
              <div className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-blue-600" />
                <span>Operator: <span className="text-blue-700 font-bold uppercase tracking-wide">shreyas</span></span>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* MAIN LAYOUT CANVAS VIEWPORT */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6 flex-1 w-full">
        
        {/* HACKATHON WELCOME INFORMATIONAL BANNER */}
        <div id="hackathon-banner" className="bg-gradient-to-r from-slate-900 to-slate-950 text-white p-5 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden shadow-md">
          <div className="absolute right-0 top-0 opacity-[0.08] bg-blue-500 w-96 h-96 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
          
          <div className="flex items-start md:items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl text-blue-300 border border-white/10 shadow-inner flex-shrink-0">
              <BookOpen className="w-5.5 h-5.5 text-blue-400" />
            </div>
            <div className="space-y-1 text-left">
              <h2 className="text-base font-bold font-sans tracking-tight text-white flex items-center gap-2">
                Municipal Command Redressal & Consensus Desk
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed max-w-3xl font-sans">
                A high-fidelity dashboard enabling real-time municipal grievance mapping, rapid telemetry status changes, and Gemini AI analysis. Configured specifically for municipal ward networks and infrastructure grids.
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 text-xs font-mono shrink-0">
            <div className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 flex items-center gap-1.5 font-bold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              EMERGENCY PORT ACTIVE
            </div>
          </div>
        </div>

        {/* REGIONAL COVERAGE INDICATOR - LOCKED TO CITY LEVEL ONLY */}
        <div id="focus-area-tabs-container" className="bg-blue-50/60 border border-blue-200/50 p-4.5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl shadow-md shadow-blue-500/10">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="text-[10px] font-mono leading-none tracking-widest uppercase font-bold text-blue-600 flex items-center gap-1">
                Active Governance Bounds
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-1 font-sans tracking-tight">Hyderabad Municipal Area (City Level Node)</h3>
              <p className="text-xs text-slate-500 mt-0.5">Lodging, analysis, upvoting, and dispatch actions are currently configured with high-precision local coordinates.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono shrink-0">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 border border-blue-200 rounded-xl font-bold uppercase tracking-wider text-[9px] shadow-2xs">
              MUNICIPALITY CONTROLLED
            </span>
          </div>
        </div>

        {/* MAP & UTILITIES DOUBLE COLUMN BLOCK */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* MAP CANVAS GRID (Left column, spanning 2 grid spaces on desktop) */}
          <div className="lg:col-span-2">
            <CivicMap 
              level={level}
              issues={issues}
              selectedIssueId={selectedIssueId}
              onSelectIssue={setSelectedIssueId}
              onMapClick={handleMapIncidentClick}
              tempPin={tempPin}
              onUpvoteIssue={handleUpvoteIssue}
              onResolveIssue={handleResolveIssue}
              theme={theme}
            />
          </div>

          {/* REALTIME FEED CLINT COLUMN (Right column, occupies 1 space) */}
          <div className="lg:col-span-1 border-none">
            <LiveFeed 
              level={level}
              activeIssues={issues}
              onReceiveExtAlert={handleReceiveExtAlert}
              onUpvoteFromAlert={handleUpvoteFromAlert}
              onAdmitNewAlertAsIssue={handleAdmitNewAlertAsIssue}
              alerts={alerts}
            />
          </div>

        </div>

        {/* VIEWS SELECTION BLOCK BAR - ELEGANT TAB COMPONENT */}
        <div id="view-tabs-container" className="flex border-b border-slate-200/80 gap-6 pt-2">
          <button
            onClick={() => setActiveTab('tracker')}
            className={`py-3 px-1 border-b-2.5 font-sans text-xs font-bold transition-all flex items-center gap-2 relative ${
              activeTab === 'tracker' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-400 hover:text-slate-800'
            }`}
          >
            <Map className="w-4 h-4" />
            Lodge & Track Grievances
            {activeTab === 'tracker' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full" />
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-3 px-1 border-b-2.5 font-sans text-xs font-bold transition-all flex items-center gap-2 relative ${
              activeTab === 'dashboard' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-400 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            System Analytics Board
            {activeTab === 'dashboard' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full" />
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('polls')}
            className={`py-3 px-1 border-b-2.5 font-sans text-xs font-bold transition-all flex items-center gap-2 relative ${
              activeTab === 'polls' 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-slate-400 hover:text-slate-800'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            Consensus Sentiment Polls
            {activeTab === 'polls' && (
              <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full" />
            )}
          </button>
        </div>

        {/* ACTIVE SECTION CARDS DRAWER RENDERING */}
        <div id="render-panel-deck" className="transition-all duration-300">
          {activeTab === 'tracker' && (
            <GrievanceTracker 
              level={level}
              issues={issues}
              onAddIssue={handleAddIssue}
              onSelectIssue={setSelectedIssueId}
              selectedIssueId={selectedIssueId}
              tempPin={tempPin}
              onClearTempPin={handleClearTempPin}
              onUpvoteIssue={handleUpvoteIssue}
            />
          )}

          {activeTab === 'dashboard' && (
            <CitizenDashboard 
              level={level}
              issues={issues}
            />
          )}

          {activeTab === 'polls' && (
            <CivicPolls 
              level={level}
              polls={polls}
              onPollVote={handlePollVote}
            />
          )}
        </div>

      </main>

      {/* CORE FRAMEWORK MINI CREDITS RAIL WITH DETAILED TECH STACK SPECIFICATIONS */}
      <footer className="mt-12 text-center text-slate-400 border-t border-slate-200/80 pt-8 pb-12">
        <div className="max-w-xl mx-auto mb-6 px-4">
          <p className="text-[11px] font-mono text-slate-400 uppercase tracking-widest mb-3">Core Application Architecture System Specs</p>
          <div className="flex flex-wrap justify-center gap-2 text-[10px] font-mono">
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md border border-blue-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
              React 19 Frontend
            </span>
            <span className="px-2.5 py-1 bg-sky-50 text-sky-700 rounded-md border border-sky-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
              Vite 6 Bundler
            </span>
            <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-md border border-green-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              Node & Express Backend
            </span>
            <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-md border border-purple-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
              Google Gemini 2.5 API
            </span>
            <span className="px-2.5 py-1 bg-teal-50 text-teal-700 rounded-md border border-teal-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
              Tailwind CSS v4 Styling
            </span>
            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
              TypeScript & LocalStorage
            </span>
          </div>
        </div>

        <div className="flex justify-center items-center gap-2 text-[10px] font-mono">
          <span>CivicPulse Comando Hub v1.0.0</span>
          <span>•</span>
          <span className="flex items-center gap-1 text-slate-500">
            Made with <Heart className="w-3 h-3 fill-red-500 text-red-500 inline" /> for Telangana Hackathons
          </span>
        </div>
      </footer>

    </div>
  );
}