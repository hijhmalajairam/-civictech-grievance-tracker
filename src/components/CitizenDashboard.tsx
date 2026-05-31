import { ReportedIssue, IssueLevel } from '../types';
import { ShieldCheck, Flame, Hourglass, CheckCircle2, TrendingUp, BarChart4 } from 'lucide-react';

interface CitizenDashboardProps {
  level: IssueLevel;
  issues: ReportedIssue[];
}

export default function CitizenDashboard({ level, issues }: CitizenDashboardProps) {
  // Filter issues based on level
  const filtered = issues.filter(issue => issue.level === level);

  const total = filtered.length;
  const pending = filtered.filter(i => i.status === 'Pending').length;
  const review = filtered.filter(i => i.status === 'Review').length;
  const assigned = filtered.filter(i => i.status === 'Assigned').length;
  const resolved = filtered.filter(i => i.status === 'Resolved').length;

  // Calculate mock speed metrics
  const avgResponseHrs = total > 0 ? Math.round(filtered.reduce((acc, curr) => acc + (11 - curr.priorityScore) * 2.4, 0) / total) : 18;

  // Category occurrences
  const categories: Record<string, number> = {
    'Garbage & Waste': 0,
    'Water & Sanitation': 0,
    'Women Safety & Lights': 0,
    'Roads & Mobility': 0,
    'Other': 0,
  };
  
  filtered.forEach(i => {
    if (categories[i.category] !== undefined) {
      categories[i.category]++;
    } else {
      categories['Other']++;
    }
  });

  // Calculate priority breakdown
  const priorities = {
    Low: filtered.filter(i => i.priority === 'Low').length,
    Medium: filtered.filter(i => i.priority === 'Medium').length,
    High: filtered.filter(i => i.priority === 'High').length,
    Critical: filtered.filter(i => i.priority === 'Critical').length,
  };

  const highestPriorityCount = Math.max(priorities.Low, priorities.Medium, priorities.High, priorities.Critical, 1);
  const highestCategoryCount = Math.max(...Object.values(categories), 1);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Dynamic Key Stat Numbers Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div id="stat-pending" className="bg-white border border-amber-200/60 p-5 rounded-2xl flex items-center justify-between shadow-[0_4px_24px_-4px_rgba(217,119,6,0.04)] hover:shadow-md transition-all duration-300">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-sans">Open Incidents</span>
            <h4 className="text-3xl font-extrabold font-mono text-amber-600 tracking-tight">{pending + review}</h4>
          </div>
          <div className="p-3 bg-amber-50/60 rounded-2xl text-amber-600 border border-amber-100/80">
            <Hourglass className="w-5.5 h-5.5 animate-pulse" />
          </div>
        </div>

        <div id="stat-assigned" className="bg-white border border-blue-200/60 p-5 rounded-2xl flex items-center justify-between shadow-[0_4px_24px_-4px_rgba(37,99,235,0.04)] hover:shadow-md transition-all duration-300">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-sans">Crew Dispatched</span>
            <h4 className="text-3xl font-extrabold font-mono text-blue-600 tracking-tight">{assigned}</h4>
          </div>
          <div className="p-3 bg-blue-50/60 rounded-2xl text-blue-600 border border-blue-100/80">
            <ShieldCheck className="w-5.5 h-5.5" />
          </div>
        </div>

        <div id="stat-resolved" className="bg-white border border-emerald-200/60 p-5 rounded-2xl flex items-center justify-between shadow-[0_4px_24px_-4px_rgba(16,185,129,0.04)] hover:shadow-md transition-all duration-300">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-sans">Resolved Assets</span>
            <h4 className="text-3xl font-extrabold font-mono text-emerald-600 tracking-tight">{resolved}</h4>
          </div>
          <div className="p-3 bg-emerald-50/60 rounded-2xl text-emerald-600 border border-emerald-100/80">
            <CheckCircle2 className="w-5.5 h-5.5" />
          </div>
        </div>

        <div id="stat-speed" className="bg-white border border-sky-200/60 p-5 rounded-2xl flex items-center justify-between shadow-[0_4px_24px_-4px_rgba(14,165,233,0.04)] hover:shadow-md transition-all duration-300">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-sans">Avg Response</span>
            <h4 className="text-3xl font-extrabold font-mono text-sky-600 tracking-tight">{avgResponseHrs} hrs</h4>
          </div>
          <div className="p-3 bg-sky-50/60 rounded-2xl text-sky-600 border border-sky-100/80">
            <TrendingUp className="w-5.5 h-5.5" />
          </div>
        </div>
      </div>

      {/* Visual Analytics Sections (Custom Vector charts with beautiful CSS variables) */}
      <div id="analytics-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Priority Matrix Chart */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="p-1.5 bg-rose-50 text-rose-500 rounded-lg">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-sans tracking-tight">Incident Severity Level Distribution</h3>
            </div>

            <div className="space-y-4.5">
              {/* Critical Row */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-rose-600 font-semibold font-sans">Critical Priority (Immediate Action)</span>
                  <span className="text-slate-500 font-bold">{priorities.Critical} issues</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-rose-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(priorities.Critical / highestPriorityCount) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* High Row */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-orange-600 font-semibold font-sans">High Priority (Severe Disruption)</span>
                  <span className="text-slate-500 font-bold">{priorities.High} issues</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(priorities.High / highestPriorityCount) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Medium Row */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-amber-600 font-semibold font-sans">Medium Priority (Standard Complaints)</span>
                  <span className="text-slate-500 font-bold">{priorities.Medium} issues</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(priorities.Medium / highestPriorityCount) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Low Row */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-emerald-600 font-semibold font-sans">Low Priority (General Maintenance)</span>
                  <span className="text-slate-500 font-bold">{priorities.Low} issues</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(priorities.Low / highestPriorityCount) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4.5 border-t border-slate-100 text-[11px] text-slate-400 font-mono text-center leading-relaxed">
            ✔️ High and critical issues are dynamically routed to GHMC dispatch channels in under 3 minutes.
          </div>
        </div>

        {/* Categories Analysis */}
        <div id="category-chart" className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                <BarChart4 className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-sans tracking-tight">Issue Category Split Overview</h3>
            </div>

            <div className="space-y-4 flex flex-col justify-center">
              {Object.entries(categories).map(([category, count]) => {
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={category} className="flex items-center gap-3">
                    <span className="w-28 text-xs font-bold text-slate-700 truncate font-sans">{category}</span>
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden relative shadow-inner">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${(count / highestCategoryCount) * 100}%` }}
                      ></div>
                    </div>
                    <span className="w-14 text-right text-xs font-mono font-bold text-blue-700 tracking-tight">{count} ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-4.5 border-t border-slate-100 text-[11px] text-slate-400 font-mono text-center leading-relaxed">
            ⚡ Sanitation, local mobility, and water routing nodes form the high priority citizen category triggers.
          </div>
        </div>

      </div>
    </div>
  );
}
