import { Bell, ShieldCheck } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/vehicles': 'My Vehicles',
  '/applications': 'Applications',
  '/verifications': 'Vehicle Verification',
  '/settings': 'Settings',
  '/admin': 'Admin Overview',
  '/admin/applications': 'All Applications',
  '/admin/users': 'Users',
  '/admin/deliveries': 'Deliveries',
  '/admin/reminders': 'Reminder Queue',
};

export default function TopBar() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const title = routeTitles[pathname.replace(/\/[a-f0-9-]{10,}.*/, '')] || routeTitles[pathname] || 'Transport Advisory';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-30 bg-[#F5F7F2]/80 backdrop-blur-md border-b border-gray-200/60 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          {isAdmin && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-semibold">
              <ShieldCheck size={12} />
              Admin Mode
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-all shadow-sm relative">
            <Bell size={17} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </button>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold ${isAdmin ? 'bg-amber-600' : 'bg-[#0A3828]'}`}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
        </div>
      </div>
    </header>
  );
}
