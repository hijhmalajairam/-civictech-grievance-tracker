import { useState } from 'react';
import { CivicPoll, IssueLevel } from '../types';
import { Vote, Radio, Sparkles, AlertCircle } from 'lucide-react';
import { INITIAL_POLLS } from '../data/mockData';

interface CivicPollsProps {
  level: IssueLevel;
  onPollVote?: (pollId: string, optionId: string) => void;
  polls?: CivicPoll[];
}

export default function CivicPolls({ level, polls: propPolls, onPollVote }: CivicPollsProps) {
  const [localPolls, setLocalPolls] = useState<CivicPoll[]>(INITIAL_POLLS);

  const activePolls = propPolls || localPolls;

  const handleVote = (pollId: string, optionId: string) => {
    if (onPollVote) {
      onPollVote(pollId, optionId);
      return;
    }

    setLocalPolls(prevPolls => 
      prevPolls.map(poll => {
        if (poll.id !== pollId) return poll;
        
        if (poll.votedOptionId) return poll;

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
      })
    );
  };

  const levelPolls = activePolls.filter(p => p.level === level);

  return (
    <div id="civic-polls-section" className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm relative overflow-hidden animate-fade-in">
      <div className="absolute -top-6 -right-6 p-4 opacity-[0.02]">
        <Vote className="w-32 h-32 text-blue-600" />
      </div>

      <div className="flex items-center gap-2.5 mb-6">
        <div className="p-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl text-blue-600 border border-blue-200/40">
          <Radio className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 font-sans tracking-tight">Active Public Consensus Polls</h3>
          <p className="text-xs text-slate-500 font-medium">Consensus logs for {level === 'City' ? 'Greater Hyderabad Municipal Area' : level === 'State' ? 'Telangana State' : 'National Sector'}</p>
        </div>
      </div>

      <div className="space-y-6">
        {levelPolls.length > 0 ? (
          levelPolls.map((poll) => {
            const hasVoted = !!poll.votedOptionId;

            return (
              <div key={poll.id} className="bg-slate-50/60 p-5 rounded-2xl border border-slate-200/60 space-y-4">
                <h4 className="text-xs font-bold text-slate-800 font-sans tracking-tight leading-relaxed">
                  {poll.question}
                </h4>

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
                              ? 'bg-blue-50/80 border-blue-300 text-blue-900'
                              : 'bg-white/40 border-slate-200/80 text-slate-400'
                            : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-400 text-slate-800 shadow-2xs hover:shadow-xs cursor-pointer'
                        }`}
                      >
                        {/* Progressive Background Percentage Meter */}
                        {hasVoted && (
                          <div 
                            className={`absolute inset-y-0 left-0 transition-all duration-1000 ease-out z-0 ${
                              isSelected ? 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10' : 'bg-slate-200/10'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        )}

                        <span className={`text-xs z-10 transition-colors duration-250 ${
                          isSelected ? 'text-blue-700 font-extrabold' : 'font-medium'
                        }`}>
                          {option.text}
                        </span>

                        <span className={`text-xs font-mono font-bold z-10 ${
                          isSelected ? 'text-blue-700' : 'text-slate-400'
                        }`}>
                          {hasVoted ? `${pct}%` : `${option.votes} votes`}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 pt-3 border-t border-slate-200/50">
                  <span>Compiled consensus tally: {poll.totalVotes} responses</span>
                  {hasVoted && (
                    <span className="flex items-center gap-1 text-emerald-600 font-bold tracking-wide">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                      SECURE consenso lock registered
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500 bg-slate-50/50 rounded-2xl border border-slate-200/60 shadow-inner">
            <AlertCircle className="w-8 h-8 text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-slate-400">No active consensus questionnaires at this tier.</p>
          </div>
        )}
      </div>
    </div>
  );
}
