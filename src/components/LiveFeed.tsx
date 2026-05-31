import { useState, useEffect } from 'react';
import { LiveAlert, IssueLevel, ReportedIssue, IssueCategory, IssuePriority } from '../types';
import { Radio, Users, HeartPulse, ShieldAlert, CheckCircle2, Droplet, Star, Shield } from 'lucide-react';

interface LiveFeedProps {
  level: IssueLevel;
  onReceiveExtAlert: (alert: LiveAlert) => void;
  activeIssues: ReportedIssue[];
  onUpvoteFromAlert: (issueId: string) => void;
  onAdmitNewAlertAsIssue: (newIssueData: Omit<ReportedIssue, 'id' | 'createdAt' | 'upvotes' | 'status'>) => void;
  alerts?: LiveAlert[];
}

export default function LiveFeed({ 
  level, 
  onReceiveExtAlert, 
  activeIssues, 
  onAdmitNewAlertAsIssue,
  alerts: propAlerts
}: LiveFeedProps) {
  const [alerts, setAlerts] = useState<LiveAlert[]>([
    {
      id: 'alert-initial-1',
      message: 'GHMC road crew dispatched to water clogged Begumpet section.',
      timestamp: new Date(Date.now() - 45000).toISOString(),
      type: 'resolve',
      locationName: 'Begumpet, Hyderabad'
    },
    {
      id: 'alert-initial-2',
      message: 'Citizen verified clean Public Toilet facility (5 Stars).',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      type: 'report',
      locationName: 'Madhapur, Hyderabad'
    }
  ]);

  const displayAlerts = propAlerts || alerts;
  const [liveObservers, setLiveObservers] = useState(25);

  useEffect(() => {
    const obsInterval = setInterval(() => {
      setLiveObservers(prev => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.max(12, prev + delta);
      });
    }, 4000);

    let feedInterval: NodeJS.Timeout | null = null;
    if (!propAlerts) {
      feedInterval = setInterval(() => {
        const rand = Math.random();
        
        let newAlert: LiveAlert;
        
        if (rand > 0.6) {
          // Simulate a new utility/rating log
          newAlert = {
            id: `alert-dyn-${Date.now()}`,
            message: `New Free Water Point mapped by community volunteer.`,
            timestamp: new Date().toISOString(),
            type: 'report',
            locationName: 'Kukatpally Zone'
          };
        } else if (rand > 0.3) {
          // Simulate a hazard report
          newAlert = {
            id: `alert-dyn-${Date.now()}`,
            message: `High Priority Hazard: Broken street lights. Awaiting community verification.`,
            timestamp: new Date().toISOString(),
            type: 'hazard',
            locationName: 'Gachibowli'
          };
        } else {
          // Simulate a resolution
          newAlert = {
            id: `alert-dyn-${Date.now()}`,
            message: `✔️ Maintenance team completed pressure sealing on local pipeline.`,
            timestamp: new Date().toISOString(),
            type: 'resolve',
            locationName: 'Telangana Region'
          };
        }

        setAlerts(prev => [newAlert, ...prev.slice(0, 15)]);
        onReceiveExtAlert(newAlert);
      }, 22000);
    }

    return () => {
      clearInterval(obsInterval);
      if (feedInterval) clearInterval(feedInterval);
    };
  }, [level, onReceiveExtAlert, propAlerts]);

  // Determine icon and color based on alert content
  const getAlertUI = (alert: LiveAlert) => {
    if (alert.type === 'resolve') {
      return { icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />, bg: 'bg-emerald-50/60 border-emerald-250 text-slate-800' };
    }
    if (alert.message.includes('Water Point') || alert.message.includes('Toilet')) {
      return { icon: <Droplet className="w-5 h-5 text-cyan-600 flex-shrink-0" />, bg: 'bg-cyan-50 border-cyan-200 text-slate-800' };
    }
    if (alert.message.includes('Stars') || alert.message.includes('rating')) {
      return { icon: <Star className="w-5 h-5 text-amber-500 flex-shrink-0" />, bg: 'bg-amber-50 border-amber-200 text-slate-800' };
    }
    return { icon: <ShieldAlert className="w-5 h-5 text-rose-500 flex-shrink-0 animate-pulse" />, bg: 'bg-rose-50 border-rose-200 text-slate-800' };
  };

  return (
    <div id="live-public-ticker-column" className="bg-slate-50 border-none p-4 relative overflow-hidden flex flex-col h-[350px] animate-fade-in">
      
      <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 px-1.5 bg-blue-100 rounded-full text-blue-600 border border-blue-200">
            <Radio className="w-3.5 h-3.5 animate-ping" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 tracking-tight uppercase">Live Sensor Node</h3>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 font-mono text-[9px] font-bold">
          <Users className="w-3 h-3 text-blue-600 animate-pulse" />
          <span className="text-blue-700">{liveObservers}</span> ONLINE
        </div>
      </div>

      <div className="flex-1 space-y-2.5 overflow-y-auto pr-1 scrollbar-thin">
        {displayAlerts.map((alert) => {
          const ui = getAlertUI(alert);
          
          return (
            <div key={alert.id} className={`p-3 rounded-xl border text-xs flex gap-2.5 items-start transition-all duration-300 animate-slide-in shadow-sm ${ui.bg}`}>
              <div className="mt-0.5 outline-none">{ui.icon}</div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between text-[9px] font-mono text-slate-500 font-bold uppercase">
                  <span className="text-slate-700 truncate max-w-[120px]">{alert.locationName}</span>
                  <span>{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-[11px] font-semibold leading-relaxed font-sans">{alert.message}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 pt-2 border-t border-slate-200 text-center flex items-center justify-center gap-1 text-[9px] font-mono text-slate-400 font-bold uppercase">
        <HeartPulse className="w-3 h-3 text-rose-500 animate-pulse" />
        Syncing geographical data
      </div>
    </div>
  );
}
