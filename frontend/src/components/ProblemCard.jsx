import { useState } from 'react';
import { ExternalLink, Tag, Sparkles, Loader2 } from 'lucide-react';
import RevisionTimeline from './RevisionTimeline';

const ProblemCard = ({ problem, onUpdate }) => {
  const [hint, setHint] = useState({ text: '', type: null, loading: false });

  const diffColor = {
    Easy: 'text-easy border-easy/20 bg-easy/10',
    Medium: 'text-medium border-medium/20 bg-medium/10',
    Hard: 'text-hard border-hard/20 bg-hard/10'
  }[problem.difficulty];

  const fetchHint = async (type) => {
    if (hint.type === type && hint.text) {
      setHint({ text: '', type: null, loading: false });
      return;
    }

    setHint({ text: '', type, loading: true });
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://dsa-mastery-tool.onrender.com/api/problems/${problem._id}/hint/${type}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setHint({ text: data.hint, type, loading: false });
      } else {
        setHint({ text: 'Failed to fetch hint.', type, loading: false });
      }
    } catch (err) {
      setHint({ text: 'Error connecting to server.', type, loading: false });
    }
  };

  return (
    <div className="bg-card border border-border p-4 rounded-lg shadow-sm hover:border-primary/50 transition-colors group relative">
      {problem.isMastered && (
        <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold font-mono px-2 py-1 rounded-bl-lg z-10">
          MASTERED
        </div>
      )}

      <div className="flex justify-between items-start mb-2 pr-12">
        <h3 className="font-mono text-lg text-foreground font-bold truncate">
          <a href={problem.url} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors flex items-center gap-2">
            {problem.title}
            {problem.url && <ExternalLink size={14} className="text-muted-foreground" />}
          </a>
        </h3>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`text-xs font-mono px-2 py-0.5 rounded border ${diffColor}`}>
          {problem.difficulty}
        </span>
        <span className="text-xs font-mono px-2 py-0.5 rounded border border-border bg-muted text-muted-foreground">
          {problem.platform}
        </span>
      </div>

      {problem.topics && problem.topics.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          <Tag size={12} className="text-muted-foreground mt-0.5" />
          {problem.topics.map(topic => (
            <span key={topic} className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
              #{topic}
            </span>
          ))}
        </div>
      )}

      {(problem.timeComplexity || problem.spaceComplexity) && (
        <div className="flex gap-4 mb-3 bg-muted/50 p-2 rounded border border-border/50">
          {problem.timeComplexity && (
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground font-mono uppercase">Time</span>
              <span className="text-xs font-mono text-secondary">O({problem.timeComplexity})</span>
            </div>
          )}
          {problem.spaceComplexity && (
            <div className="flex flex-col">
              <span className="text-[10px] text-muted-foreground font-mono uppercase">Space</span>
              <span className="text-xs font-mono text-secondary">O({problem.spaceComplexity})</span>
            </div>
          )}
        </div>
      )}

      {problem.approachNotes && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground line-clamp-2 italic border-l-2 border-primary/30 pl-2">
            "{problem.approachNotes}"
          </p>
        </div>
      )}

      {/* Hint Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => fetchHint(1)}
          className={`flex-1 font-mono text-[10px] py-1.5 rounded border transition-all flex items-center justify-center gap-1 ${hint.type === 1 ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/30 border-border text-muted-foreground hover:border-primary/50'
            }`}
        >
          {hint.loading && hint.type === 1 ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
          HINT_1 (BRUTE)
        </button>
        <button
          onClick={() => fetchHint(2)}
          className={`flex-1 font-mono text-[10px] py-1.5 rounded border transition-all flex items-center justify-center gap-1 ${hint.type === 2 ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/30 border-border text-muted-foreground hover:border-primary/50'
            }`}
        >
          {hint.loading && hint.type === 2 ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
          HINT_2 (BETTER)
        </button>
        <button
          onClick={() => fetchHint(3)}
          className={`flex-1 font-mono text-[10px] py-1.5 rounded border transition-all flex items-center justify-center gap-1 ${hint.type === 3 ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/30 border-border text-muted-foreground hover:border-primary/50'
            }`}
        >
          {hint.loading && hint.type === 3 ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
          HINT_3 (OPTIMAL)
        </button>
      </div>

      {/* Hint Display */}
      {hint.text && (
        <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-md animate-in fade-in slide-in-from-top-1 duration-200">
          <p className="text-xs font-mono text-primary/90 leading-relaxed">
            <span className="font-bold uppercase mr-1">Hint {hint.type}:</span>
            {hint.text}
          </p>
        </div>
      )}

      <RevisionTimeline
        problemId={problem._id}
        revisionSchedule={problem.revisionSchedule}
        onUpdate={onUpdate}
      />
    </div>
  );
};

export default ProblemCard;
