import { useQuery } from '@tanstack/react-query';
import { Users, Car, FileText, TrendingUp, Bell, Package, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAdminStats, getAdminApplications } from '../../api/admin';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import { formatNaira, formatDate, applicationStatusColor, docTypeLabel } from '../../utils';
import { Application, DocumentType } from '../../types';

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} />
        </div>
      </div>
    </Card>
  );
}

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => getAdminStats().then(r => r.data.data),
    refetchInterval: 30000,
  });

  const { data: recentApps = [], isLoading: appsLoading } = useQuery({
    queryKey: ['admin-applications', 'recent'],
    queryFn: () => getAdminApplications({ limit: 5 }).then(r => r.data.data || []),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Admin Overview</h2>
        <p className="text-sm text-gray-500 mt-0.5">Platform-wide statistics and recent activity</p>
      </div>

      {statsLoading ? (
        <div className="flex justify-center py-10"><Spinner size={32} /></div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Users" value={stats?.totalUsers || 0} color="bg-blue-50 text-blue-600" />
          <StatCard icon={Car} label="Vehicles" value={stats?.totalVehicles || 0} color="bg-[#0A3828]/10 text-[#0A3828]" />
          <StatCard
            icon={FileText} label="Pending Apps" value={stats?.pendingApplications || 0}
            sub="need attention"
            color={stats?.pendingApplications ? 'bg-amber-50 text-amber-600' : 'bg-gray-100 text-gray-500'}
          />
          <StatCard
            icon={TrendingUp} label="Revenue" value={formatNaira(stats?.totalRevenue || 0)}
            sub="from service fees"
            color="bg-emerald-50 text-emerald-600"
          />
          <StatCard
            icon={Bell} label="Unconfirmed" value={stats?.unconfirmedReminders || 0}
            sub="reminders needing follow-up"
            color={stats?.unconfirmedReminders ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-500'}
          />
          <StatCard
            icon={Package} label="Active Deliveries" value={stats?.activeDeliveries || 0}
            color="bg-purple-50 text-purple-600"
          />
        </div>
      )}

      {/* Alerts */}
      {(stats?.unconfirmedReminders || 0) > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-800">
                {stats?.unconfirmedReminders} users haven't confirmed reminder receipts
              </p>
              <p className="text-xs text-red-600">These users may need a phone follow-up to confirm awareness of upcoming document expiry.</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Recent Applications */}
      <Card className="overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Recent Applications</h3>
        </div>
        {appsLoading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {['User', 'Vehicle', 'Document', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-500 px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentApps.map((app: Application) => (
                <tr key={app.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                  <td className="px-5 py-3 text-sm font-medium text-gray-900">
                    {(app as any).user?.firstName} {(app as any).user?.lastName}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">
                    {app.vehicle?.plateNumber}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">
                    {docTypeLabel(app.documentType as DocumentType)}
                  </td>
                  <td className="px-5 py-3 text-sm font-medium text-gray-900">
                    {formatNaira(app.totalAmount)}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${applicationStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-400">{formatDate(app.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
