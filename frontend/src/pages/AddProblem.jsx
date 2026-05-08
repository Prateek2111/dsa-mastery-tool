import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AddProblem = () => {
  const navigate = useNavigate();
  const [isFetching, setIsFetching] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    platform: 'LeetCode',
    url: '',
    difficulty: 'Easy',
    topics: '',
    approachNotes: '',
    timeComplexity: '',
    spaceComplexity: '',
    confidenceLevel: 'Medium',
    solvedDate: new Date().toISOString().split('T')[0]
  });

  const fetchMetadata = async (url) => {
    if (!url || !url.startsWith('http')) return;

    setIsFetching(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5001/api/problems/fetch-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ url })
      });

      if (res.ok) {
        const metadata = await res.json();
        setFormData(prev => ({
          ...prev,
          title: metadata.title || prev.title,
          platform: metadata.platform || prev.platform,
          difficulty: metadata.difficulty || prev.difficulty,
          timeComplexity: metadata.timeComplexity || prev.timeComplexity,
          spaceComplexity: metadata.spaceComplexity || prev.spaceComplexity
        }));
      }
    } catch (err) {
      console.error('Fetch metadata error:', err);
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...formData,
        topics: formData.topics.split(',').map(t => t.trim()).filter(Boolean)
      };

      const res = await fetch('http://localhost:5001/api/problems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        navigate('/');
      } else {
        alert('Failed to save problem');
      }
    } catch (err) {
      console.error(err);
      alert('Server error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-mono text-primary mb-6">&gt; ADD_NEW_PROBLEM</h1>

      <form onSubmit={handleSubmit} className="bg-card border border-border p-6 rounded-lg space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-mono text-muted-foreground mb-1">
              TITLE {isFetching && <span className="text-primary animate-pulse ml-2">(AUTO-SCANNING...)</span>}
            </label>
            <input
              type="text"
              required
              className="w-full bg-input border border-border rounded px-3 py-2 text-foreground font-mono focus:outline-none focus:border-primary"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-mono text-muted-foreground mb-1">PLATFORM</label>
            <select
              className="w-full bg-input border border-border rounded px-3 py-2 text-foreground font-mono focus:outline-none focus:border-primary"
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
            >
              <option>LeetCode</option>
              <option>GFG</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-mono text-muted-foreground mb-1">DIFFICULTY</label>
            <select
              className="w-full bg-input border border-border rounded px-3 py-2 text-foreground font-mono focus:outline-none focus:border-primary"
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-mono text-muted-foreground mb-1">URL (Optional)</label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="Paste problem link to auto-fill details"
                className="flex-1 bg-input border border-border rounded px-3 py-2 text-foreground font-mono focus:outline-none focus:border-primary"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
              <button
                type="button"
                onClick={() => fetchMetadata(formData.url)}
                disabled={isFetching || !formData.url}
                className="bg-primary/20 text-primary border border-primary/30 font-mono px-4 py-2 rounded hover:bg-primary/30 disabled:opacity-50 transition-all flex items-center gap-2 whitespace-nowrap"
              >
                {isFetching ? 'SCANNING...' : 'AUTO-FILL'}
              </button>
            </div>
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-mono text-muted-foreground mb-1">TOPICS (Comma separated)</label>
            <input
              type="text"
              placeholder="e.g. Arrays, DP, Graph"
              className="w-full bg-input border border-border rounded px-3 py-2 text-foreground font-mono focus:outline-none focus:border-primary"
              value={formData.topics}
              onChange={(e) => setFormData({ ...formData, topics: e.target.value })}
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-mono text-muted-foreground mb-1">APPROACH NOTES</label>
            <textarea
              rows={4}
              className="w-full bg-input border border-border rounded px-3 py-2 text-foreground font-mono focus:outline-none focus:border-primary resize-y"
              value={formData.approachNotes}
              onChange={(e) => setFormData({ ...formData, approachNotes: e.target.value })}
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-mono text-muted-foreground mb-1">TIME COMPLEXITY</label>
            <input
              type="text"
              placeholder="e.g. N log N"
              className="w-full bg-input border border-border rounded px-3 py-2 text-foreground font-mono focus:outline-none focus:border-primary"
              value={formData.timeComplexity}
              onChange={(e) => setFormData({ ...formData, timeComplexity: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-mono text-muted-foreground mb-1">SPACE COMPLEXITY</label>
            <input
              type="text"
              placeholder="e.g. 1"
              className="w-full bg-input border border-border rounded px-3 py-2 text-foreground font-mono focus:outline-none focus:border-primary"
              value={formData.spaceComplexity}
              onChange={(e) => setFormData({ ...formData, spaceComplexity: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-mono text-muted-foreground mb-1">CONFIDENCE</label>
            <select
              className="w-full bg-input border border-border rounded px-3 py-2 text-foreground font-mono focus:outline-none focus:border-primary"
              value={formData.confidenceLevel}
              onChange={(e) => setFormData({ ...formData, confidenceLevel: e.target.value })}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-mono text-muted-foreground mb-1">SOLVED DATE</label>
            <input
              type="date"
              required
              className="w-full bg-input border border-border rounded px-3 py-2 text-foreground font-mono focus:outline-none focus:border-primary"
              value={formData.solvedDate}
              onChange={(e) => setFormData({ ...formData, solvedDate: e.target.value })}
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="bg-primary text-primary-foreground font-mono font-bold py-2 px-6 rounded hover:bg-primary/90 transition-colors"
          >
            EXECUTE SAVE
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProblem;
