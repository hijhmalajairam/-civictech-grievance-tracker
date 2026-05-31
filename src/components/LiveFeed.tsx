import { useState, useEffect } from 'react';
import { LiveAlert, IssueLevel, ReportedIssue, IssueCategory, IssuePriority } from '../types';
import { Radio, Users, HeartPulse, Send, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';
import { LIVE_TICKER_TEMPLATES } from '../data/mockData';

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
  onUpvoteFromAlert,
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
      message: 'New e-waste litter hazard report logged at Madhapur corridor.',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      type: 'report',
      locationName: 'Madhapur (Hitec City), Hyderabad'
    }
  ]);

  const displayAlerts = propAlerts || alerts;

  // Current counter representing online simulated active observers
  const [liveObservers, setLiveObservers] = useState(25);

  useEffect(() => {
    // Oscillate observer numbers to simulate organic real-time client logins
    const obsInterval = setInterval(() => {
      setLiveObservers(prev => {
        const delta = Math.floor(Math.random() * 5) - 2;
        const nextVal = prev + delta;
        return nextVal > 12 ? nextVal : 12;
      });
    }, 4000);

    // Only run simulated ticker if parent didn't supply real-time server synced alerts
    let feedInterval: NodeJS.Timeout | null = null;
    if (!propAlerts) {
      feedInterval = setInterval(() => {
        const isReportType = Math.random() > 0.45;
        
        if (isReportType) {
          const rawTpl = LIVE_TICKER_TEMPLATES[Math.floor(Math.random() * LIVE_TICKER_TEMPLATES.length)];
          
          const newAlert: LiveAlert = {
            id: `alert-dyn-${Date.now()}`,
            message: isReportType 
              ? `${rawTpl.text} - awaiting community prioritization upvotes.`
              : `Department assigned crew to inspect location: ${rawTpl.locationName}`,
            timestamp: new Date().toISOString(),
            type: 'report',
            locationName: rawTpl.locationName
          };

          setAlerts(prev => [newAlert, ...prev.slice(0, 7)]);
          onReceiveExtAlert(newAlert);

          onAdmitNewAlertAsIssue({
            title: rawTpl.text,
            description: `Telemetry system auto-detection report. Citizen concerns regarding ${rawTpl.category.toLowerCase()} issues have been flagged near ${rawTpl.locationName}. Urgently requires resolution.`,
            category: rawTpl.category as IssueCategory,
            location: rawTpl.locationName,
            level: rawTpl.level as IssueLevel,
            lat: 15 + Math.floor(Math.random() * 65),
            lng: 15 + Math.floor(Math.random() * 65),
            reporter: 'Live Sensor Node',
            priority: 'Medium' as IssuePriority,
            priorityScore: 5,
            image: null
          });

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

          setAlerts(prev => [newAlert, ...prev.slice(0, 7)]);
          onReceiveExtAlert(newAlert);
        }

      }, 18000);
    }

    return () => {
      clearInterval(obsInterval);
      if (feedInterval) clearInterval(feedInterval);
    };
  }, [level, onReceiveExtAlert, onAdmitNewAlertAsIssue, propAlerts]);

  return (
    <div id="live-public-ticker-column" className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden flex flex-col h-[400px] text-slate-800 animate-fade-in hover:shadow-md transition-all duration-300">
      
      <div className="flex justify-between items-center pb-4 border-b border-slate-200/50 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1 px-1.5 bg-rose-50 rounded-full text-rose-500 border border-rose-100/40">
            <Radio className="w-4 h-4 animate-ping" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-sans tracking-tight">Active Transmissions Stream</h3>
            <p className="text-[10px] text-slate-500 font-bold font-mono tracking-wide uppercase">Consensus Terminal Node</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200/50 rounded-xl text-slate-600 font-mono text-[9px] font-bold tracking-wider">
          <Users className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
          <span className="text-blue-700 font-extrabold">{liveObservers}</span> ONLINE
        </div>
      </div>

      <div className="flex-1 space-y-3.5 overflow-y-auto pr-1 scrollbar-thin">
        {displayAlerts.map((alert) => {
          const isResolve = alert.type === 'resolve';
          
          return (
            <div 
              key={alert.id}
              className={`p-3.5 rounded-2xl border text-xs flex gap-3 items-start transition-all duration-300 animate-slide-in ${
                isResolve 
                  ? 'bg-emerald-50/60 border-emerald-250 text-slate-100 shadow-[0_2px_12px_rgba(16,185,129,0.03)]' 
                  : 'bg-slate-50 border-slate-200/70 shadow-2xs'
              }`}
            >
              <div className="mt-0.5 outline-none">
                {isResolve ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-blue-600 flex-shrink-0 animate-pulse" />
                )}
              </div>

              <div className="flex-1 space-y-1.5">
                <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-0.5 font-bold tracking-tight">
                  <span className={`${isResolve ? 'text-emerald-800' : 'text-slate-705'} font-bold`}>{alert.locationName}</span>
                  <span className="text-slate-400/80 font-semibold">
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <p className="text-[11px] text-slate-800 leading-relaxed font-sans font-semibold">{alert.message}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200/50 text-center flex items-center justify-center gap-1.5 text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
        <HeartPulse className="w-4 h-4 text-rose-500 animate-pulse" />
        Geographical live nodes synchronizing.
      </div>
    </div>
  );
}
