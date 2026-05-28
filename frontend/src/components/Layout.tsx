import { Bell, Building2, FileText, Home, Landmark, LogOut, Moon, ReceiptText, Settings, Users } from 'lucide-react';
import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { Button, cn } from './ui';

const ownerLinks = [
  { to: '/owner', label: 'Dashboard', icon: Home },
  { to: '/properties', label: 'Properties', icon: Landmark },
  { to: '/tenants', label: 'Tenants', icon: Users },
  { to: '/payments', label: 'Payments', icon: ReceiptText },
  { to: '/invoices', label: 'Invoices', icon: FileText },
  { to: '/agreements', label: 'Agreements', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const tenantLinks = [
  { to: '/tenant', label: 'Dashboard', icon: Home },
  { to: '/payments', label: 'Payments', icon: ReceiptText },
  { to: '/invoices', label: 'Invoices', icon: FileText },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Layout() {
  const auth = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const links = auth.roles.includes('OWNER') || auth.roles.includes('ADMIN') ? ownerLinks : tenantLinks;

  useEffect(() => {
    const publicPaths = new Set(['/', '/login', '/register']);
    if (!auth.token && !publicPaths.has(location.pathname)) {
      nav('/login', { replace: true, state: { from: location.pathname } });
    }
  }, [auth.token, location.pathname, nav]);

  function logout() {
    auth.logout();
    nav('/');
  }

  return <div className="min-h-screen kolam-bg text-slate-950 dark:text-slate-50">
    <nav className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-black md:text-xl"><Building2 className="text-kolam" /> Veetu Vadagai <span className="hidden text-sm text-marigold sm:inline">வீட்டு வாடகை</span></Link>
        <div className="flex items-center gap-3">
          {auth.token ? <Link to="/notifications" aria-label="Notifications"><Bell size={20} /></Link> : null}
          <button aria-label="Toggle theme" onClick={() => document.documentElement.classList.toggle('dark')}><Moon size={20} /></button>
          {auth.token ? <Button onClick={logout} className="h-10 w-10 px-0" aria-label="Logout"><LogOut size={16} /></Button> : <Link to="/login" className="font-semibold">Login</Link>}
        </div>
      </div>
      {auth.token ? <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-3">
        {links.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => cn('inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-white dark:text-slate-300', isActive && 'bg-slate-950 text-white shadow dark:bg-marigold dark:text-slate-950')}><Icon size={16} />{label}</NavLink>)}
      </div> : null}
    </nav>
    <main className="mx-auto max-w-7xl px-4 py-8"><Outlet /></main>
  </div>;
}
