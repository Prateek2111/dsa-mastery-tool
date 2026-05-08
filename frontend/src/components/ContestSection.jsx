import { useState, useEffect } from 'react';
import { Timer, Plus, Trash2, ExternalLink, Bell } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import contestBg1 from '../assets/contest_bg_1.png';
import contestBg2 from '../assets/contest_bg_2.png';

const ContestSection = () => {
  const [contests, setContests] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContest, setNewContest] = useState({
    title: '',
    startTime: '',
    platform: 'LeetCode',
    url: ''
  });

  const fetchContests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/contests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setContests(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchContests();
  }, []);

  const handleAddContest = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/contests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newContest)
      });
      if (res.ok) {
        setNewContest({ title: '', startTime: '', platform: 'LeetCode', url: '' });
        setShowAddForm(false);
        fetchContests();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteContest = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5001/api/contests/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchContests();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-mono text-primary font-bold flex items-center gap-2">
          &gt; UPCOMING_CONTESTS
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-primary/10 text-primary border border-primary/20 p-2 rounded-full hover:bg-primary hover:text-primary-foreground transition-all"
        >
          <Plus size={20} />
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddContest} className="bg-card border border-border p-6 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-mono text-muted-foreground uppercase">Contest Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Weekly Contest 501"
                className="w-full bg-background border border-border p-2 rounded font-mono text-sm focus:ring-1 focus:ring-primary outline-none"
                value={newContest.title}
                onChange={(e) => setNewContest({ ...newContest, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-mono text-muted-foreground uppercase">Start Time</label>
              <input
                type="datetime-local"
                required
                className="w-full bg-background border border-border p-2 rounded font-mono text-sm focus:ring-1 focus:ring-primary outline-none"
                value={newContest.startTime}
                onChange={(e) => setNewContest({ ...newContest, startTime: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-mono text-muted-foreground uppercase">Platform</label>
              <select
                className="w-full bg-background border border-border p-2 rounded font-mono text-sm focus:ring-1 focus:ring-primary outline-none"
                value={newContest.platform}
                onChange={(e) => setNewContest({ ...newContest, platform: e.target.value })}
              >
                <option value="LeetCode">LeetCode</option>
                <option value="Codeforces">Codeforces</option>
                <option value="GFG">GeeksforGeeks</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-mono text-muted-foreground uppercase">URL (Optional)</label>
              <input
                type="url"
                placeholder="https://leetcode.com/contest/..."
                className="w-full bg-background border border-border p-2 rounded font-mono text-sm focus:ring-1 focus:ring-primary outline-none"
                value={newContest.url}
                onChange={(e) => setNewContest({ ...newContest, url: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-sm font-mono text-muted-foreground hover:text-foreground"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-6 py-2 rounded font-mono text-sm font-bold uppercase tracking-wider hover:opacity-90 transition-opacity"
            >
              ADD CONTEST
            </button>
          </div>
        </form>
      )}

      {contests.length === 0 && !showAddForm ? (
        <div className="text-center py-12 border border-dashed border-border rounded-xl bg-card/50">
          <p className="text-muted-foreground font-mono italic">No upcoming contests scheduled.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {contests.map((contest, index) => (
            <ContestCard key={contest._id} contest={contest} bgIndex={index % 2} onDelete={handleDeleteContest} />
          ))}
        </div>
      )}
    </div>
  );
};

const ContestCard = ({ contest, bgIndex, onDelete }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const start = new Date(contest.startTime);
      const diff = start.getTime() - now.getTime();

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        let timeStr = '';
        if (days > 0) timeStr += `${days}d `;
        timeStr += `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
        setTimeLeft(timeStr);
      } else {
        setTimeLeft('STARTED');
      }
    };


    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [contest.startTime]);

  const bg = bgIndex === 0 ? contestBg1 : contestBg2;

  return (
    <div className="relative group overflow-hidden rounded-2xl aspect-[16/9] md:aspect-[21/9] flex flex-col justify-end border border-white/10 shadow-2xl transition-transform hover:scale-[1.01]">
      {/* Background Image */}
      <img
        src={bg}
        alt="Contest Background"
        className="absolute inset-0 w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
      />

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Countdown Tag */}
      <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full flex items-center gap-2 font-mono text-xs text-white">
        <Timer size={14} className="animate-pulse" />
        <span>{timeLeft}</span>
      </div>

      {/* Content */}
      <div className="relative p-6 flex items-end justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">{contest.title}</h3>
          <p className="text-white/70 font-mono text-xs md:text-sm">
            {format(new Date(contest.startTime), 'eee, MMM d, HH:mm')} {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {contest.url && (
            <a
              href={contest.url}
              target="_blank"
              rel="noreferrer"
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 p-3 rounded-full text-white transition-all"
            >
              <ExternalLink size={20} />
            </a>
          )}
          <button
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 p-3 rounded-full text-white transition-all"
          >
            <Bell size={20} />
          </button>
          <button
            onClick={() => onDelete(contest._id)}
            className="bg-destructive/20 hover:bg-destructive/40 backdrop-blur-md border border-destructive/30 p-3 rounded-full text-destructive-foreground transition-all opacity-0 group-hover:opacity-100"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContestSection;
