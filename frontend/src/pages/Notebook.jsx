import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import RevisionTimeline from '../components/RevisionTimeline';

const Notebook = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    platform: '',
    difficulty: ''
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchProblems = async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = `http://localhost:5001/api/problems?page=${page}&limit=${limit}`;

      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      if (filters.platform) url += `&platform=${filters.platform}`;
      if (filters.difficulty) url += `&difficulty=${filters.difficulty}`;

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setProblems(data.problems);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems(1);
  }, [searchTerm, filters]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchProblems(newPage);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-mono text-primary font-bold mb-2">&gt; MASTER_NOTEBOOK</h1>
      </header>

      {/* Filters */}
      <div className="bg-card border border-border p-4 rounded-lg flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Search problems..."
            className="w-full bg-input border border-border rounded pl-10 pr-3 py-2 text-foreground font-mono focus:outline-none focus:border-primary"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="bg-input border border-border rounded px-3 py-2 text-foreground font-mono focus:outline-none focus:border-primary"
          value={filters.platform}
          onChange={e => setFilters({ ...filters, platform: e.target.value })}
        >
          <option value="">All Platforms</option>
          <option value="LeetCode">LeetCode</option>
          <option value="GFG">GFG</option>
          <option value="Other">Other</option>
        </select>
        <select
          className="bg-input border border-border rounded px-3 py-2 text-foreground font-mono focus:outline-none focus:border-primary"
          value={filters.difficulty}
          onChange={e => setFilters({ ...filters, difficulty: e.target.value })}
        >
          <option value="">All Difficulties</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono">
            <thead className="bg-muted text-muted-foreground text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Platform</th>
                <th className="px-4 py-3">Difficulty</th>
                <th className="px-4 py-3">Solved Date</th>
                <th className="px-4 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center">
                    <div className="flex items-center justify-center gap-2 text-primary font-mono animate-pulse">
                      <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      FETCHING_DATA...
                    </div>
                  </td>
                </tr>
              ) : problems.map(problem => (
                <React.Fragment key={problem._id}>
                  <tr className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-bold text-foreground">
                      {problem.title}
                      {problem.isMastered && <span className="ml-2 text-[10px] bg-primary text-primary-foreground px-1 py-0.5 rounded">MASTERED</span>}
                    </td>
                    <td className="px-4 py-3 text-sm">{problem.platform}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-0.5 rounded border ${problem.difficulty === 'Easy' ? 'text-easy border-easy/20 bg-easy/10' :
                        problem.difficulty === 'Medium' ? 'text-medium border-medium/20 bg-medium/10' :
                          'text-hard border-hard/20 bg-hard/10'
                        }`}>
                        {problem.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{new Date(problem.solvedDate).toISOString().split('T')[0]}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setExpandedId(expandedId === problem._id ? null : problem._id)}
                        className="text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                      >
                        {expandedId === problem._id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                    </td>
                  </tr>
                  {expandedId === problem._id && (
                    <tr className="bg-muted/20">
                      <td colSpan="5" className="px-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-xs text-muted-foreground uppercase mb-2">Approach Notes</h4>
                            <p className="text-sm italic border-l-2 border-primary/30 pl-2">
                              {problem.approachNotes || "No notes provided."}
                            </p>

                            <div className="flex gap-4 mt-4">
                              {problem.timeComplexity && (
                                <div>
                                  <span className="text-[10px] text-muted-foreground uppercase">Time</span>
                                  <div className="text-sm text-secondary">O({problem.timeComplexity})</div>
                                </div>
                              )}
                              {problem.spaceComplexity && (
                                <div>
                                  <span className="text-[10px] text-muted-foreground uppercase">Space</span>
                                  <div className="text-sm text-secondary">O({problem.spaceComplexity})</div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="bg-card p-4 rounded border border-border">
                            <RevisionTimeline
                              problemId={problem._id}
                              revisionSchedule={problem.revisionSchedule}
                              onUpdate={() => fetchProblems(currentPage)}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {!loading && problems.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-muted-foreground">
                    No records found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-4 py-3 bg-muted/30 border-t border-border flex items-center justify-between font-mono">
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
      </div>
    </div>
  );
};

export default Notebook;
