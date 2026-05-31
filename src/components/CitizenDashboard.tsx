import { ReportedIssue, IssueLevel } from '../types';
import { 
  ShieldCheck, Hourglass, CheckCircle2, TrendingUp, 
  BarChart4, Star, Shield, Award, Activity 
} from 'lucide-react';

interface CitizenDashboardProps {
  level: IssueLevel;
  issues: ReportedIssue[];
}

export default function CitizenDashboard({ level, issues }: CitizenDashboardProps) {
  // Filter issues based on level
  const filtered = issues.filter(issue => issue.level === level);

  const total = filtered.length;
  const pending = filtered.filter(i => i.status === 'Pending').length;
  const assigned = filtered.filter(i => i.status === 'Assigned').length;
  const resolved = filtered.filter(i => i.status === 'Resolved').length;

  // Calculate Average Safety and Hygiene Ratings
  const ratedIssues = filtered.filter(i => i.safetyRating !== undefined && i.hygieneRating !== undefined);
  const avgSafety = ratedIssues.length > 0 
    ? (ratedIssues.reduce((acc, curr) => acc + (curr.safetyRating || 5), 0) / ratedIssues.length).toFixed(1)
    : "4.8"; // Default starting score
    
  const avgHygiene = ratedIssues.length > 0 
    ? (ratedIssues.reduce((acc, curr) => acc + (curr.hygieneRating || 5), 0) / ratedIssues.length).toFixed(1)
    : "4.5"; // Default starting score

  const safetyPercentage = (parseFloat(avgSafety) / 5) * 100;

  // Generate Municipal Leaderboard (Group by Location and count Resolved)
  const locationStats = filtered.reduce((acc, issue) => {
    // Extract just the first part of the location (e.g., "Madhapur")
    const loc = issue.location.split(',')[0].trim() || 'General Zone';
    if (!acc[loc]) acc[loc] = { resolved: 0, total: 0 };
    acc[loc].total += 1;
    if (issue.status === 'Resolved') acc[loc].resolved += 1;
    return acc;
  }, {} as Record<string, {resolved: number, total: number}>);

  const leaderboard = Object.entries(locationStats)
    .sort((a, b) => b[1].resolved - a[1].resolved)
    .slice(0, 4); // Top 4 performing wards

  // Category occurrences
  const categories: Record<string, number> = {};
  filtered.forEach(i => {
    categories[i.category] = (categories[i.category] || 0) + 1;
  });
  const highestCategoryCount = Math.max(...Object.values(categories), 1);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* CROWDSOURCED METRICS: Safety & Cleanliness */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Safety Meter */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 shadow-md text-white relative overflow-hidden flex items-center justify-between">
          <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
            <Shield className="w-48 h-48 -mr-10 -mt-10" />
          </div>
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2 text-blue-100 font-bold text-xs uppercase tracking-wider font-mono">
              <Activity className="w-4 h-4 animate-pulse" /> Live Area Safety Meter
            </div>
            <div className="text-4xl font-extrabold tracking-tight font-sans">
              {safetyPercentage.toFixed(0)}% <span className="text-lg text-blue-200 font-medium">Secure</span>
            </div>
            <p className="text-xs text-blue-100 max-w-xs leading-relaxed">
              Calculated dynamically from {ratedIssues.length} recent citizen structural and lighting audits in this zone.
            </p>
          </div>
          <div className="relative z-10 bg-white/20 p-4 rounded-full backdrop-blur-sm border border-white/30">
            <Shield className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Hygiene Index */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-wider font-mono">
              <Star className="w-4 h-4 text-amber-500" /> Public Cleanliness Index
            </div>
            <div className="text-4xl font-extrabold tracking-tight text-slate-800 font-sans">
              {avgHygiene} <span className="text-lg text-slate-400 font-medium">/ 5.0</span>
            </div>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              Aggregate crowdsourced rating for local water points, public toilets, and sanitation grids.
            </p>
          </div>
          <div className="bg-amber-50 p-4 rounded-full border border-amber-100">
            <Star className="w-10 h-10 text-amber-500 fill-amber-500" />
          </div>
        </div>
      </div>

      {/* Dynamic Key Stat Numbers Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Open Log</span>
            <h4 className="text-2xl font-extrabold text-slate-800">{pending}</h4>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-xl text-slate-500 border border-slate-100">
            <Hourglass className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-blue-200/60 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest font-mono">Dispatched</span>
            <h4 className="text-2xl font-extrabold text-blue-600">{assigned}</h4>
          </div>
          <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600 border border-blue-100">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-emerald-200/60 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest font-mono">Resolved</span>
            <h4 className="text-2xl font-extrabold text-emerald-600">{resolved}</h4>
          </div>
          <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-rose-200/60 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest font-mono">Critical</span>
            <h4 className="text-2xl font-extrabold text-rose-600">
              {filtered.filter(i => i.priority === 'Critical' && i.status !== 'Resolved').length}
            </h4>
          </div>
          <div className="p-2.5 bg-rose-50 rounded-xl text-rose-600 border border-rose-100">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEADERBOARD: Wall of Fame */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg border border-purple-100">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-sans tracking-tight">Municipal Ward Leaderboard</h3>
              <p className="text-[10px] text-slate-500 font-mono">Top performing areas by resolution rate</p>
            </div>
          </div>

          <div className="flex-1 space-y-3">
            {leaderboard.length > 0 ? leaderboard.map(([location, stats], index) => {
              const resolutionRate = Math.round((stats.resolved / stats.total) * 100) || 0;
              return (
                <div key={location} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      index === 0 ? 'bg-amber-100 text-amber-700 border border-amber-300' :
                      index === 1 ? 'bg-slate-200 text-slate-700 border border-slate-300' :
                      index === 2 ? 'bg-orange-100 text-orange-800 border border-orange-300' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      #{index + 1}
                    </span>
                    <div>
                      <div className="text-xs font-bold text-slate-800">{location}</div>
                      <div className="text-[10px] text-slate-500">{stats.resolved} issues resolved</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-extrabold text-emerald-600">{resolutionRate}%</div>
                    <div className="text-[9px] font-mono text-slate-400 uppercase">Clear Rate</div>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-8 text-xs text-slate-400 font-medium bg-slate-50 rounded-xl border border-dashed border-slate-200">
                Awaiting resolution data to generate rankings.
              </div>
            )}
          </div>
        </div>

        {/* Categories Analysis */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
              <BarChart4 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-sans tracking-tight">Category Distribution</h3>
              <p className="text-[10px] text-slate-500 font-mono">Volume of public utility reports</p>
            </div>
          </div>

          <div className="flex-1 space-y-4 flex flex-col justify-center">
            {Object.entries(categories).map(([category, count]) => {
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={category} className="flex items-center gap-3">
                  <span className="w-32 text-[11px] font-bold text-slate-700 truncate font-sans" title={category}>
                    {category}
                  </span>
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden relative">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${(count / highestCategoryCount) * 100}%` }}
                    ></div>
                  </div>
                  <span className="w-12 text-right text-[10px] font-mono font-bold text-slate-500">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
