import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../context/auth';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import Button from './Button';

const LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/team', label: 'Team' },
];

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-soft text-ink' : 'text-muted hover:text-ink'}`;

// Top bar and page frame for logged-in pages. Below the md width the links move into a menu.
const AppShell = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // moving to another page closes the menu
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-30 border-b border-line bg-bg/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-page items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-6">
            <Logo to="/dashboard" />
            <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
              {LINKS.map((link) => <NavLink key={link.to} to={link.to} className={linkClass}>{link.label}</NavLink>)}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <span className="hidden max-w-[12rem] truncate text-sm text-muted md:inline" title={user.email}>{user.userName}</span>
            <Button variant="secondary" onClick={handleLogout} className="hidden md:inline-flex">Log out</Button>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink hover:bg-soft md:hidden"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="app-menu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div id="app-menu" className="border-t border-line px-4 py-3 md:hidden">
            <nav className="flex flex-col gap-1" aria-label="Main">
              {LINKS.map((link) => <NavLink key={link.to} to={link.to} className={linkClass}>{link.label}</NavLink>)}
            </nav>
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
              <span className="truncate text-sm text-muted">{user.userName}</span>
              <Button variant="secondary" onClick={handleLogout}>Log out</Button>
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-page px-4 py-8 sm:py-10">
        <Outlet />
      </main>
    </div>
  );
};

export default AppShell;
