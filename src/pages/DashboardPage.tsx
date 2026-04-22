import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Car, FileText, AlertTriangle, CheckCircle, Plus, ArrowRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getVehicles } from '../api/vehicles';
import { getApplications } from '../api/applications';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { PageLoader } from '../components/ui/Spinner';
import { formatDate, daysUntilExpiry, getDocumentStatus, getStatusColor, docTypeLabel, formatNaira } from '../utils';
import type { Document, Vehicle } from '../types';

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

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

function DocumentRow({ doc, plateNumber }: { doc: Document; plateNumber: string }) {
  const status = getDocumentStatus(doc.expiryDate);
  const days = daysUntilExpiry(doc.expiryDate);
  const statusClass = getStatusColor(status);

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${status === 'valid' ? 'bg-emerald-500' : status === 'expiring_soon' ? 'bg-amber-500' : 'bg-red-500'}`} />
        <div>
          <p className="text-sm font-medium text-gray-900">{docTypeLabel(doc.type)}</p>
          <p className="text-xs text-gray-500">{plateNumber} · Expires {formatDate(doc.expiryDate)}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusClass}`}>
          {days < 0 ? 'Expired' : days === 0 ? 'Today' : `${days}d`}
        </span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: vehiclesData, isLoading: loadingV } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => getVehicles().then(r => r.data.data || []),
  });
  const { data: applicationsData, isLoading: loadingA } = useQuery({
    queryKey: ['applications'],
    queryFn: () => getApplications().then(r => r.data.data || []),
  });

  if (loadingV || loadingA) return <PageLoader />;

  const vehicles = vehiclesData || [];
  const applications = applicationsData || [];

  const allDocs = vehicles.flatMap(v => v.documents.map(d => ({ ...d, plateNumber: v.plateNumber })));
  const expiredCount = allDocs.filter(d => getDocumentStatus(d.expiryDate) === 'expired').length;
  const criticalCount = allDocs.filter(d => ['critical', 'expiring_soon'].includes(getDocumentStatus(d.expiryDate))).length;
  const pendingApps = applications.filter(a => ['PENDING', 'PROCESSING', 'SUBMITTED'].includes(a.status)).length;

  const urgentDocs = allDocs
    .filter(d => ['expired', 'critical', 'expiring_soon'].includes(getDocumentStatus(d.expiryDate)))
    .sort((a, b) => daysUntilExpiry(a.expiryDate) - daysUntilExpiry(b.expiryDate))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div {...fadeUp} transition={{ duration: 0.4 }}>
        <div className="flex items-start sm:items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Good morning, {user?.firstName} 👋
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Here's your vehicle compliance overview</p>
          </div>
          <Link to="/vehicles/new">
            <Button icon={<Plus size={16} />} size="sm">Add Vehicle</Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.05 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Car} label="Vehicles" value={vehicles.length}
          sub={`of ${user?.subscriptionTier === 'FLEET' ? 20 : 3} allowed`}
          color="bg-[#0A3828]/10 text-[#0A3828]"
        />
        <StatCard
          icon={FileText} label="Documents" value={allDocs.length}
          sub="tracked documents"
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={AlertTriangle} label="Attention" value={expiredCount + criticalCount}
          sub="need action"
          color={expiredCount > 0 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}
        />
        <StatCard
          icon={Clock} label="In Progress" value={pendingApps}
          sub="active applications"
          color="bg-purple-50 text-purple-600"
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Urgent Documents */}
        <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.1 }} className="lg:col-span-2">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Documents Requiring Attention</h3>
              <Link to="/vehicles" className="text-xs text-[#0A3828] font-medium hover:underline flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            {urgentDocs.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <CheckCircle size={32} className="text-emerald-500 mb-3" />
                <p className="text-sm font-medium text-gray-700">All documents are up to date</p>
                <p className="text-xs text-gray-500 mt-1">Great work keeping your vehicles compliant!</p>
              </div>
            ) : (
              <div>
                {urgentDocs.map(doc => (
                  <DocumentRow key={doc.id} doc={doc} plateNumber={doc.plateNumber} />
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Right sidebar */}
        <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.15 }} className="space-y-4">
          {/* Subscription */}
          <Card className="p-5 bg-gradient-to-br from-[#0A3828] to-[#15803d] text-white border-0">
            <div className="flex items-center justify-between mb-3">
              <Badge variant="gold">
                {user?.subscriptionTier === 'FOUNDING_FREE' ? '⭐ Founding Member' :
                  user?.subscriptionTier === 'FLEET' ? 'Fleet' : 'Standard'}
              </Badge>
              {user?.subscriberNumber && (
                <span className="text-white/60 text-xs">#{user.subscriberNumber}</span>
              )}
            </div>
            <p className="text-lg font-bold text-white">
              {user?.subscriptionTier === 'FOUNDING_FREE' ? 'Free Access' :
                user?.subscriptionTier === 'FLEET' ? formatNaira(15000) + '/yr' : formatNaira(5000) + '/yr'}
            </p>
            <p className="text-white/60 text-xs mt-1">
              Up to {user?.subscriptionTier === 'FLEET' ? 20 : 3} vehicles
            </p>
          </Card>

          {/* Quick actions */}
          <Card className="p-5">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Quick Actions</h3>
            <div className="space-y-2">
              <Link to="/vehicles/new">
                <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left">
                  <div className="w-8 h-8 bg-[#0A3828]/8 rounded-lg flex items-center justify-center">
                    <Plus size={16} className="text-[#0A3828]" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Add a vehicle</span>
                </button>
              </Link>
              <Link to="/applications/new">
                <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    <FileText size={16} className="text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Renew a document</span>
                </button>
              </Link>
              <Link to="/verifications">
                <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left">
                  <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                    <AlertTriangle size={16} className="text-amber-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Check a vehicle</span>
                </button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Vehicles overview */}
      {vehicles.length > 0 && (
        <motion.div {...fadeUp} transition={{ duration: 0.4, delay: 0.2 }}>
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">My Vehicles</h3>
              <Link to="/vehicles" className="text-xs text-[#0A3828] font-medium hover:underline flex items-center gap-1">
                Manage <ArrowRight size={12} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.slice(0, 3).map(vehicle => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const worstDoc = vehicle.documents.reduce((worst, doc) => {
    const s = getDocumentStatus(doc.expiryDate);
    const order = ['expired', 'critical', 'expiring_soon', 'valid'];
    if (!worst || order.indexOf(s) < order.indexOf(getDocumentStatus(worst.expiryDate))) return doc;
    return worst;
  }, null as Document | null);

  const overallStatus = worstDoc ? getDocumentStatus(worstDoc.expiryDate) : 'valid';

  return (
    <Link to={`/vehicles/${vehicle.id}`}>
      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
        <div className="w-10 h-10 bg-[#0A3828] rounded-xl flex items-center justify-center flex-shrink-0">
          <Car size={18} className="text-white" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-gray-900">{vehicle.plateNumber}</p>
            <div className={`w-2 h-2 rounded-full ${
              overallStatus === 'valid' ? 'bg-emerald-500' :
              overallStatus === 'expiring_soon' ? 'bg-amber-500' : 'bg-red-500'
            }`} />
          </div>
          <p className="text-xs text-gray-500 truncate">{vehicle.make} {vehicle.model} {vehicle.year}</p>
          <p className="text-xs text-gray-400 mt-0.5">{vehicle.documents.length} doc{vehicle.documents.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
    </Link>
  );
}
