import { useState } from 'react';
import { CivicPoll, IssueLevel } from '../types';
import { Vote, Radio, Sparkles, AlertCircle, TrendingUp, CheckCircle, Flame } from 'lucide-react';

interface CivicPollsProps {
  level: IssueLevel;
  onPollVote?: (pollId: string, optionId: string) => void;
  polls?: CivicPoll[];
}

// Fallback dynamic polls if the server doesn't provide them yet
const DYNAMIC_POLLS: CivicPoll[] = [
  {
    id: "poll-budget-1",
    level: "City",
    question: "Participatory Budget: How should the remaining ₹50L Ward CSR fund be allocated this quarter?",
    totalVotes: 1245,
    options: [
      { id: "opt-1", text: "Install 20 Smart CCTV & Lighting Poles", votes: 680 },
      { id: "opt-2", text: "Repair & Unclog Stormwater Drains", votes: 410 },
      { id: "opt-3", text: "Build 5 New Public Free Bathrooms", votes: 155 }
    ]
  },
  {
    id: "poll-petition-1",
    level: "City",
    question: "Community Petition: Demand immediate municipal intervention for the recurring garbage dumping near Cyber Towers.",
    totalVotes: 890,
    options: [
      { id: "opt-4", text: "Sign Petition (Escalate to Zonal Commissioner)", votes: 845 },
      { id: "opt-5", text: "Dismiss (Not a priority)", votes: 45 }
    ]
  }
];

export default function CivicPolls({ level, polls: propPolls, onPollVote }: CivicPollsProps) {
  const [localPolls, setLocalPolls] = useState<CivicPoll[]>(DYNAMIC_POLLS);

  const activePolls = propPolls && propPolls.length > 0 ? propPolls : localPolls;
  const levelPolls = activePolls.filter(p => p.level === level);

  const handleVote = (pollId: string, optionId: string) => {
    if (onPollVote) {
      onPollVote(pollId, optionId);
      return;
    }

    setLocalPolls(prevPolls => 
      prevPolls.map(poll => {
        if (poll.id !== pollId) return poll;
        if (poll.votedOptionId) return poll;

        const updatedOptions = poll.options.map(opt => 
          opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
        );

        return {
          ...poll,
          options: updatedOptions,
          totalVotes: poll.totalVotes + 1,
          votedOptionId: optionId
        };
      })
    );
  };

  return (
    <div id="civic-polls-section" className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden animate-fade-in">
      <div className="absolute -top-6 -right-6 p-4 opacity-[0.03] pointer-events-none">
        <Vote className="w-40 h-40 text-blue-600" />
      </div>

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-indigo-50 to-blue-100 rounded-xl text-indigo-600 border border-indigo-200/50">
            <Vote className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 font-sans tracking-tight">Participatory Budgeting & Petitions</h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">Vote directly on local infrastructure funds</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg border border-rose-100 text-[10px] font-bold uppercase tracking-widest font-mono">
          <Flame className="w-3.5 h-3.5" /> High Impact
        </div>
      </div>

      <div className="space-y-6 relative z-10">
        {levelPolls.length > 0 ? (
          levelPolls.map((poll) => {
            const hasVoted = !!poll.votedOptionId;
            const isPetition = poll.question.includes('Petition');

            return (
              <div key={poll.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4 hover:shadow-md transition-shadow duration-300">
                <div className="flex gap-2 items-start">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 mt-0.5 ${isPetition ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {isPetition ? 'Petition' : 'Budget'}
                  </span>
                  <h4 className="text-xs font-bold text-slate-800 font-sans leading-relaxed">
                    {poll.question}
                  </h4>
                </div>

                <div className="space-y-3">
                  {poll.options.map((option) => {
                    const isSelected = poll.votedOptionId === option.id;
                    const pct = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0;

                    return (
                      <button
                        key={option.id}
                        disabled={hasVoted}
                        onClick={() => handleVote(poll.id, option.id)}
                        className={`w-full text-left p-3.5 rounded-xl relative overflow-hidden transition-all duration-300 border flex justify-between items-center ${
                          hasVoted 
                            ? isSelected
                              ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-sm'
                              : 'bg-white/60 border-slate-200 text-slate-500'
                            : 'bg-white hover:bg-slate-100 border-slate-200 hover:border-blue-300 text-slate-700 shadow-sm cursor-pointer'
                        }`}
                      >
                        {hasVoted && (
                          <div 
                            className={`absolute inset-y-0 left-0 transition-all duration-1000 ease-out z-0 ${
                              isSelected ? 'bg-blue-200/40' : 'bg-slate-200/40'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        )}

                        <span className={`text-xs z-10 transition-colors duration-250 ${
                          isSelected ? 'font-extrabold text-blue-800' : 'font-semibold'
                        }`}>
                          {option.text}
                        </span>

                        <span className={`text-xs font-mono z-10 ${
                          isSelected ? 'font-extrabold text-blue-700' : 'font-bold text-slate-500'
                        }`}>
                          {hasVoted ? `${pct}%` : `${option.votes} votes`}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-3 border-t border-slate-200/80">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                    Consensus tally: <span className="font-bold text-slate-600">{poll.totalVotes} verified citizens</span>
                  </span>
                  {hasVoted && (
                    <span className="flex items-center gap-1 text-emerald-600 font-bold tracking-wide bg-emerald-50 px-2 py-1 rounded">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Vote Registered
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            <AlertCircle className="w-8 h-8 text-slate-300 mb-3" />
            <p className="text-xs font-semibold text-slate-500">No active budgeting polls at this jurisdiction level.</p>
          </div>
        )}
      </div>
    </div>
  );
}
