import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Revise from './pages/Revise';
import Notebook from './pages/Notebook';
import AddProblem from './pages/AddProblem';
import Login from './pages/Login';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
        {user && <Navbar />}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto pb-20 md:pb-8">
          <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/add" element={<PrivateRoute><AddProblem /></PrivateRoute>} />
            <Route path="/revise" element={<PrivateRoute><Revise /></PrivateRoute>} />

            <Route path="/notebook" element={<PrivateRoute><Notebook /></PrivateRoute>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
