import { useState, useEffect } from 'react';
import ProblemCard from '../components/ProblemCard';

const Revise = () => {
  const [dueToday, setDueToday] = useState([]);
  const [allProblems, setAllProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchRevisions = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const res = await fetch('http://localhost:5001/api/revisions/today', { headers });

      if (res.ok) {
        const data = await res.json();
        setDueToday([...data.overdue, ...data.dueToday]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedule = async (page = 1) => {
    setScheduleLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const res = await fetch(`http://localhost:5001/api/problems?page=${page}&limit=${limit}`, { headers });

      if (res.ok) {
        const data = await res.json();
        setAllProblems(data.problems);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setScheduleLoading(false);
    }
  };

  const handleToggleRevision = async (problemId, day, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const newStatus = currentStatus === 'done' ? 'pending' : 'done';
      const res = await fetch(`http://localhost:5001/api/problems/${problemId}/revision/${day}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, confidence: newStatus === 'done' ? 'Medium' : null })
      });
      if (res.ok) {
        fetchRevisions();
        fetchSchedule(currentPage);
      }
    } catch (err) {
      console.error(err);
    }
  };




  useEffect(() => {
    fetchRevisions();
    fetchSchedule(1);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchSchedule(newPage);
    }
  };

  if (loading) return <div className="font-mono text-primary animate-pulse">Scanning Revisions...</div>;



  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-mono text-primary font-bold mb-2">&gt; REVISION_QUEUE</h1>
      </header>




      <section>
        <h2 className="text-xl font-mono text-destructive mb-4 flex items-center gap-2">
          &gt; DUE_TODAY
          <span className="bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full pulse-amber">
            {dueToday.length}
          </span>
        </h2>
        {dueToday.length === 0 ? (
          <div className="text-muted-foreground font-mono p-8 border border-dashed border-border rounded-lg text-center bg-card">
            Queue empty.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dueToday.map(problem => (
              <ProblemCard key={problem._id} problem={problem} onUpdate={fetchRevisions} />
            ))}
          </div>
        )}
      </section>

      <section className="pt-8 border-t border-border/50 overflow-x-auto">
        <h2 className="text-xl font-mono text-muted-foreground mb-4">&gt; REVISION_SCHEDULE</h2>
        <div className="bg-card border border-border rounded-lg overflow-hidden min-w-[800px]">
          <table className="w-full text-left font-mono">
            <thead className="bg-muted text-muted-foreground text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Question</th>
                <th className="px-4 py-3 text-center">Rev 1</th>
                <th className="px-4 py-3 text-center">Rev 2</th>
                <th className="px-4 py-3 text-center">Rev 3</th>
                <th className="px-4 py-3 text-center">Rev 4</th>
                <th className="px-4 py-3 text-center">Rev 5</th>
                <th className="px-4 py-3 text-center">Rev 6</th>
                <th className="px-4 py-3 text-center">Rev 7</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {scheduleLoading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center">
                    <div className="flex items-center justify-center gap-2 text-primary font-mono animate-pulse">
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      FETCHING_SCHEDULE...
                    </div>
                  </td>
                </tr>
              ) : allProblems.map(problem => (
                <tr key={problem._id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-bold text-foreground">
                    <a href={problem.url} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                      {problem.title}
                    </a>
                  </td>
                  {[1, 3, 7, 15, 30, 60, 120].map(day => {
                    const rev = problem.revisionSchedule.find(r => r.day === day);
                    const isChecked = rev?.status === 'done';
                    const dateStr = rev ? new Date(rev.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
                    return (
                      <td key={day} className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-1.5 mt-1">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleRevision(problem._id, day, rev?.status)}
                            className="w-4 h-4 accent-primary bg-input border-border rounded cursor-pointer"
                          />
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap">{dateStr}</span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
              {!scheduleLoading && allProblems.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-muted-foreground">
                    No problems added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-4 py-3 bg-muted/30 border-t border-border flex items-center justify-between font-mono mt-0">
            <div className="text-xs text-muted-foreground">
              Showing Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-xs border border-border rounded hover:bg-input disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                PREV
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => handlePageChange(i + 1)}
                  className={`px-3 py-1 text-xs border rounded transition-colors ${currentPage === i + 1
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border hover:bg-input text-muted-foreground'
                    }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-xs border border-border rounded hover:bg-input disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                NEXT
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Revise;
