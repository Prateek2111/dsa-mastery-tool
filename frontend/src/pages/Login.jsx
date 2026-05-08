import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    try {
      const res = await fetch(`https://dsa-mastery-tool.onrender.com${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
        navigate('/');
      } else {
        alert(data.msg || 'Error');
      }
    } catch (err) {
      console.error(err);
      alert('Server error');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="bg-card p-8 rounded-lg border border-border w-full max-w-md shadow-[0_0_15px_rgba(57,255,20,0.1)]">
        <h2 className="text-2xl font-mono text-primary mb-6 text-center tracking-wider">
          {isLogin ? '> LOGIN' : '> REGISTER'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-mono text-muted-foreground mb-1">NAME</label>
              <input
                type="text"
                required
                className="w-full bg-input border border-border rounded px-3 py-2 text-foreground font-mono focus:outline-none focus:border-primary"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-mono text-muted-foreground mb-1">EMAIL</label>
            <input
              type="email"
              required
              className="w-full bg-input border border-border rounded px-3 py-2 text-foreground font-mono focus:outline-none focus:border-primary"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-mono text-muted-foreground mb-1">PASSWORD</label>
            <input
              type="password"
              required
              className="w-full bg-input border border-border rounded px-3 py-2 text-foreground font-mono focus:outline-none focus:border-primary"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground font-mono font-bold py-2 rounded hover:bg-primary/90 transition-colors mt-6"
          >
            {isLogin ? 'EXECUTE LOGIN' : 'INITIATE USER'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-mono text-muted-foreground hover:text-primary transition-colors"
          >
            {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
