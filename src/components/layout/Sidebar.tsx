import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Car, FileText, Search,
  Settings, LogOut, Users, ChevronRight, X,
  Bell, Package, ShieldCheck, Database,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { LogoMark } from '../ui/Logo';

const userNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/vehicles', icon: Car, label: 'My Vehicles' },
  { to: '/applications', icon: FileText, label: 'Applications' },
  { to: '/verifications', icon: Search, label: 'Vehicle Check' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

type AdminNavItem = { to: string; icon: any; label: string; permission?: string; superAdminOnly?: boolean };

const adminNavItems: AdminNavItem[] = [
  { to: '/admin', icon: LayoutDashboard, label: 'Overview' },
  { to: '/admin/applications', icon: FileText, label: 'Applications', permission: 'MANAGE_APPLICATIONS' },
  { to: '/admin/users', icon: Users, label: 'Users', permission: 'MANAGE_USERS' },
  { to: '/admin/deliveries', icon: Package, label: 'Deliveries', permission: 'MANAGE_DELIVERIES' },
  { to: '/admin/reminders', icon: Bell, label: 'Reminders', permission: 'MANAGE_REMINDERS' },
  { to: '/admin/registry', icon: Database, label: 'Plate Registry', permission: 'MANAGE_APPLICATIONS' },
  { to: '/admin/staff', icon: ShieldCheck, label: 'Admin Staff', superAdminOnly: true },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ mobileOpen = false, onClose }: SidebarProps = {}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';
  const isSuperAdmin = !!user?.isSuperAdmin;
  const perms = user?.permissions || [];

  const visibleAdminItems = adminNavItems.filter(item => {
    if (item.superAdminOnly) return isSuperAdmin;
    if (item.permission && !isSuperAdmin) return perms.includes(item.permission);
    return true;
  });

  const navItems = isAdmin ? visibleAdminItems : userNavItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const tierBadge = {
    FOUNDING_FREE: { label: 'Founding Member', color: 'bg-amber-50 text-amber-700 border border-amber-200' },
    STANDARD: { label: 'Standard', color: 'bg-gray-100 text-gray-700' },
    FLEET: { label: 'Fleet', color: 'bg-blue-50 text-blue-700' },
  }[user?.subscriptionTier || 'STANDARD'];

  return (
    <aside
      className={`
        w-64 bg-[#0A3828] text-white flex flex-col h-dvh fixed left-0 top-0 z-40
        transition-transform duration-300 ease-out
        lg:translate-x-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      {/* Logo + mobile close */}
      <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LogoMark size={36} />
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">Transport Advisory</h1>
            <p className="text-xs text-emerald-300/70">Vehicle Compliance</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* User Info */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="bg-white/8 rounded-xl p-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/30 flex items-center justify-center text-emerald-200 font-semibold text-sm flex-shrink-0">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-emerald-300/70 truncate">{user?.email}</p>
            </div>
          </div>
          {!isAdmin && (
            <div className="mt-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tierBadge?.color}`}>
                {tierBadge?.label}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard' || to === '/admin'}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              transition-all duration-150 group
              ${isActive
                ? 'bg-white/15 text-white'
                : 'text-white/60 hover:text-white hover:bg-white/8'
              }
            `}
          >
            {({ isActive }) => (
              <>
                <Icon size={17} className={isActive ? 'text-emerald-300' : 'text-white/50 group-hover:text-white/80'} />
                <span>{label}</span>
                {isActive && <ChevronRight size={14} className="ml-auto text-emerald-300/60" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/8 transition-all duration-150"
        >
          <LogOut size={17} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
