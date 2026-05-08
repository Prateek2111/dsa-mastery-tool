import { useState } from 'react';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';

const RevisionTimeline = ({ problemId, revisionSchedule, onUpdate }) => {
  const [popover, setPopover] = useState(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const doneCount = revisionSchedule.filter(r => r.status === 'done').length;

  const handleMarkRevision = async (day, confidence) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://dsa-mastery-tool.onrender.com/api/problems/${problemId}/revision/${day}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'done', confidence })
      });
      if (res.ok) {
        onUpdate();
        setPopover(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-border/50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono text-muted-foreground uppercase">Revision Timeline</span>
        <span className="text-xs font-mono text-primary">{doneCount}/7 done</span>
      </div>

      <div className="flex justify-between items-start relative">
        {revisionSchedule.map((rev, index) => {
          const revDate = new Date(rev.date);
          revDate.setHours(0, 0, 0, 0);
          const isToday = revDate.getTime() === today.getTime();
          const isOverdue = revDate < today && rev.status === 'pending';

          let icon = <Circle size={16} className="text-muted-foreground" />;
          let label = 'upcoming';
          let textColor = 'text-muted-foreground';

          if (rev.status === 'done') {
            icon = <CheckCircle2 size={16} className="text-primary" />;
            label = 'done';
            textColor = 'text-primary';
          } else if (isToday) {
            icon = <Circle size={16} fill="currentColor" className="text-yellow-400 pulse-amber" />;
            label = 'TODAY';
            textColor = 'text-yellow-400 font-bold';
          } else if (isOverdue) {
            icon = <AlertCircle size={16} className="text-destructive" />;
            label = 'overdue';
            textColor = 'text-destructive';
          }

          const formattedDate = revDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

          return (
            <div key={rev.day} className="flex flex-col items-center gap-1 relative">
              <span className="text-[10px] font-mono text-muted-foreground">{formattedDate}</span>
              <button
                className="hover:scale-110 transition-transform focus:outline-none"
                onClick={() => {
                  if (rev.status === 'pending' && (isToday || isOverdue)) {
                    setPopover(popover === rev.day ? null : rev.day);
                  }
                }}
              >
                {icon}
              </button>
              <span className={`text-[9px] font-mono uppercase tracking-wider ${textColor}`}>
                {label}
              </span>

              {/* Popover */}
              {popover === rev.day && (
                <div className={`absolute bottom-full mb-2 bg-card border border-border p-3 rounded shadow-xl z-50 w-48 ${index === 0 ? 'left-0 translate-x-0' :
                  index === revisionSchedule.length - 1 ? 'right-0 translate-x-0' :
                    'left-1/2 -translate-x-1/2'
                  }`}>
                  <p className="text-xs font-mono mb-2 text-foreground text-center">Mark as Revised?</p>
                  <div className="flex flex-col gap-1">
                    {['Low', 'Medium', 'High'].map(conf => (
                      <button
                        key={conf}
                        onClick={() => handleMarkRevision(rev.day, conf)}
                        className="text-xs font-mono py-1 px-2 hover:bg-muted rounded text-left border border-transparent hover:border-border"
                      >
                        Confidence: <span className={
                          conf === 'High' ? 'text-primary' : conf === 'Medium' ? 'text-yellow-400' : 'text-destructive'
                        }>{conf}</span>
                      </button>
                    ))}
                    <div className="border-t border-border mt-1 pt-1">
                      <button
                        onClick={async () => {
                          try {
                            const token = localStorage.getItem('token');
                            const res = await fetch(`https://dsa-mastery-tool.onrender.com/api/problems/${problemId}/revision/${rev.day}`, {
                              method: 'PUT',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                              },
                              body: JSON.stringify({ status: 'skipped' })
                            });
                            if (res.ok) {
                              onUpdate();
                              setPopover(null);
                            }
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        className="w-full text-xs font-mono py-1.5 px-2 hover:bg-destructive/10 text-destructive rounded text-left border border-transparent transition-colors"
                      >
                        SKIP_REVISION
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RevisionTimeline;
