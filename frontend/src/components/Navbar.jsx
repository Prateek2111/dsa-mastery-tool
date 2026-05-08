import { NavLink } from 'react-router-dom';
import { Home, PlusSquare, CalendarCheck, BarChart2, BookOpen, LogOut } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { logout } = useContext(AuthContext);

  const links = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/add', icon: PlusSquare, label: 'Add' },
    { to: '/revise', icon: CalendarCheck, label: 'Revise' },
    { to: '/notebook', icon: BookOpen, label: 'Notebook' },
  ];

  return (
    <>
      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 px-2 py-3 flex justify-around">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 text-xs ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`
            }
          >
            <link.icon size={20} />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Desktop Sidebar */}
      <nav className="hidden md:flex w-64 bg-card border-r border-border h-screen flex-col p-4 sticky top-0">
        <div className="mb-8 font-mono text-xl text-primary font-bold tracking-wider">
          DSA_MASTERY<span className="animate-pulse">_</span>
        </div>
        <div className="flex-1 flex flex-col gap-4">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`
              }
            >
              <link.icon size={20} />
              <span className="font-mono text-sm uppercase tracking-wide">{link.label}</span>
            </NavLink>
          ))}
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors mt-auto"
        >
          <LogOut size={20} />
          <span className="font-mono text-sm uppercase tracking-wide">Logout</span>
        </button>
      </nav>
    </>
  );
};

export default Navbar;
