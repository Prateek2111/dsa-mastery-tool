import { useState, useEffect } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import ProblemCard from '../components/ProblemCard';
import ContestSection from '../components/ContestSection';
import { Flame, Code2, Terminal, Calendar, Clock } from 'lucide-react';



const Home = () => {
  const [stats, setStats] = useState(null);
  const [dueToday, setDueToday] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());


  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [statsRes, revRes] = await Promise.all([
        fetch('http://localhost:5001/api/stats/dashboard', { headers }),
        fetch('http://localhost:5001/api/revisions/today', { headers })
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (revRes.ok) {
        const revData = await revRes.json();
        setDueToday([...revData.overdue, ...revData.dueToday]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);


  if (!stats) return <div className="font-mono text-primary animate-pulse">Loading System Data...</div>;

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });


  return (
    <div className="space-y-8">
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-mono text-primary font-bold mb-2">&gt; DSA_DASHBOARD</h1>
          <p className="text-muted-foreground font-mono">Welcome back. Your mastery journey continues.</p>
        </div>
        <div className="flex flex-col items-start md:items-end gap-2 font-mono">
          <div className="flex items-center gap-2 text-primary/80 text-sm">
            <Calendar size={16} />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2 text-primary font-bold text-lg">
            <Clock size={18} />
            <span>{formattedTime}</span>
          </div>
        </div>
      </header>


      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-4 rounded-lg flex flex-col items-center justify-center text-center">
          <Flame className="text-orange-500 mb-2" size={32} />
          <span className="text-3xl font-mono text-foreground font-bold">{stats.streak}</span>
          <span className="text-xs font-mono text-muted-foreground uppercase">Day Streak</span>
        </div>
        <div className="bg-card border border-border p-4 rounded-lg flex flex-col items-center justify-center text-center">
          <Terminal className="text-primary mb-2" size={32} />
          <span className="text-3xl font-mono text-foreground font-bold">{stats.totalSolved}</span>
          <span className="text-xs font-mono text-muted-foreground uppercase">Total Solved</span>
        </div>
        <div className="bg-card border border-border p-4 rounded-lg flex flex-col items-center justify-center text-center">
          <Code2 className="text-yellow-400 mb-2" size={32} />
          <span className="text-3xl font-mono text-foreground font-bold">{stats.leetCodeCount}</span>
          <span className="text-xs font-mono text-muted-foreground uppercase">LeetCode</span>
        </div>
        <div className="bg-card border border-border p-4 rounded-lg flex flex-col items-center justify-center text-center">
          <Code2 className="text-green-500 mb-2" size={32} />
          <span className="text-3xl font-mono text-foreground font-bold">{stats.gfgCount}</span>
          <span className="text-xs font-mono text-muted-foreground uppercase">GeeksforGeeks</span>
        </div>
      </div>

      {/* Contest Section */}
      <ContestSection />

      {/* Heatmap */}

      <div className="bg-card border border-border p-6 rounded-lg overflow-x-auto">
        <h2 className="text-xl font-mono text-primary mb-4">&gt; ACTIVITY_LOG</h2>
        <div className="min-w-[700px]">
          <CalendarHeatmap
            startDate={new Date('2026-05-01')}
            endDate={new Date('2027-04-30')}
            values={stats.heatmapData}
            classForValue={(value) => {
              if (!value) return 'color-empty';
              if (value.count === 1) return 'color-scale-1';
              if (value.count === 2) return 'color-scale-2';
              if (value.count === 3) return 'color-scale-3';
              if (value.count === 4) return 'color-scale-4';
              return 'color-scale-5';
            }}
            transformDayElement={(element, value, index) => {
              // react-calendar-heatmap's index is relative to the start of the week (Sunday)
              // containing the startDate. We need to calculate the actual date correctly.
              const calendarStart = new Date('2026-05-01');
              const offset = calendarStart.getDay(); // Sunday is 0, Friday is 5

              const date = new Date(calendarStart);
              date.setDate(date.getDate() + (index - offset));
              const day = date.getDate();

              return (
                <g key={index}>
                  {element}
                  <text
                    x={parseFloat(element.props.x) + (day < 10 ? 2.2 : 0.8)}
                    y={parseFloat(element.props.y) + 6.5}
                    style={{
                      fontSize: '4px',
                      fill: 'rgba(0, 0, 0, 0.8)',
                      pointerEvents: 'none',
                      fontFamily: 'monospace',
                      fontWeight: '900'
                    }}
                  >
                    {day}
                  </text>
                </g>
              );
            }}
            tooltipDataAttrs={value => {
              return {
                'data-tip': `${value.date ? value.date : ''} : ${value.count || 0} problems`
              };
            }}
          />
        </div>
      </div>

      {/* Revise Today */}
      <div>
        <h2 className="text-xl font-mono text-primary mb-4 flex items-center gap-2">
          &gt; REVISE_TODAY
          <span className="bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full pulse-amber">
            {dueToday.length} DUE
          </span>
        </h2>

        {dueToday.length === 0 ? (
          <div className="text-muted-foreground font-mono p-8 border border-dashed border-border rounded-lg text-center bg-card">
            No revisions due today. Excellent work.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {dueToday.map(problem => (
              <ProblemCard key={problem._id} problem={problem} onUpdate={fetchData} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
