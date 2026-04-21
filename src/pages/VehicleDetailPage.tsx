import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Car, FileText, Plus, Calendar } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { getVehicle, upsertDocument } from '../api/vehicles';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import { PageLoader } from '../components/ui/Spinner';
import { formatDate, daysUntilExpiry, getDocumentStatus, getStatusColor, docTypeLabel } from '../utils';
import type { DocumentType } from '../types';

const DOC_TYPES: DocumentType[] = ['MOTOR_INSURANCE', 'VEHICLE_LICENSE', 'ROADWORTHINESS', 'HACKNEY_PERMIT'];

const SERVICE_FEES: Record<string, number> = {
  MOTOR_INSURANCE: 1500,
  VEHICLE_LICENSE: 2500,
  ROADWORTHINESS: 2000,
  HACKNEY_PERMIT: 2500,
};

function DocumentCard({ doc, vehicleId, activeApps }: { doc: any; vehicleId: string; activeApps: any[] }) {
  const status = getDocumentStatus(doc.expiryDate);
  const days = daysUntilExpiry(doc.expiryDate);
  const colorClass = getStatusColor(status);

  const activeApp = activeApps.find(
    (a) => a.documentType === doc.type && ['PENDING', 'PROCESSING', 'SUBMITTED', 'READY'].includes(a.status)
  );

  const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
    valid: 'success',
    expiring_soon: 'warning',
    critical: 'danger',
    expired: 'danger',
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-semibold text-gray-900 text-sm">{docTypeLabel(doc.type)}</h4>
          <p className="text-xs text-gray-500 mt-0.5">Last updated {formatDate(doc.updatedAt || doc.createdAt)}</p>
        </div>
        <Badge variant={statusVariant[status]}>
          {status === 'expired' ? 'Expired' : status === 'critical' ? 'Critical' : status === 'expiring_soon' ? 'Expiring Soon' : 'Valid'}
        </Badge>
      </div>
      <div className={`flex items-center justify-between p-3 rounded-xl border ${colorClass}`}>
        <div className="flex items-center gap-2">
          <Calendar size={14} />
          <span className="text-xs font-medium">Expires {formatDate(doc.expiryDate)}</span>
        </div>
        <span className="text-xs font-bold">
          {days < 0 ? `${Math.abs(days)}d ago` : days === 0 ? 'Today!' : `${days} days`}
        </span>
      </div>
      {activeApp ? (
        <div className="mt-3">
          <Link to={`/applications`}>
            <Button variant="secondary" size="sm" className="w-full" icon={<FileText size={14} />}>
              Renewal in progress — {activeApp.status}
            </Button>
          </Link>
        </div>
      ) : status !== 'valid' && (
        <div className="mt-3">
          <Link to={`/applications/new?vehicleId=${vehicleId}&type=${doc.type}`}>
            <Button variant="primary" size="sm" className="w-full" icon={<FileText size={14} />}>
              Renew — ₦{(12000 + SERVICE_FEES[doc.type]).toLocaleString()}
            </Button>
          </Link>
        </div>
      )}
    </Card>
  );
}

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [addDocModal, setAddDocModal] = useState(false);

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ['vehicle', id],
    queryFn: () => getVehicle(id!).then(r => r.data.data),
  });

  const { register, handleSubmit, formState: { errors }, reset } = useForm<{
    type: string; expiryDate: string;
  }>();

  const addDocMutation = useMutation({
    mutationFn: (data: { type: string; expiryDate: string }) =>
      upsertDocument({ vehicleId: id!, type: data.type, expiryDate: data.expiryDate }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vehicle', id] });
      qc.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Document saved');
      setAddDocModal(false);
      reset();
    },
    onError: () => toast.error('Failed to save document'),
  });

  if (isLoading) return <PageLoader />;
  if (!vehicle) return <div className="p-8 text-gray-500">Vehicle not found</div>;

  const docTypes = vehicle.documents.map(d => d.type);
  const missingDocs = DOC_TYPES.filter(t => !docTypes.includes(t));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/vehicles">
          <button className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors shadow-sm">
            <ArrowLeft size={17} />
          </button>
        </Link>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{vehicle.plateNumber}</h2>
          <p className="text-sm text-gray-500">{vehicle.make} {vehicle.model} · {vehicle.year} · {vehicle.stateOfRegistration}</p>
        </div>
      </div>

      {/* Vehicle overview card */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-[#0A3828] to-[#166534] p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center">
              <Car size={26} className="text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{vehicle.plateNumber}</h3>
              <p className="text-emerald-200">{vehicle.make} {vehicle.model} {vehicle.year}</p>
              <p className="text-emerald-300/70 text-sm">{vehicle.stateOfRegistration} State Registration</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Documents */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Document Status</h3>
          {missingDocs.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setAddDocModal(true)} icon={<Plus size={14} />}>
              Add Document
            </Button>
          )}
        </div>

        {vehicle.documents.length === 0 ? (
          <Card className="p-8">
            <div className="text-center">
              <FileText size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="font-medium text-gray-700">No documents tracked</p>
              <p className="text-sm text-gray-500 mb-4">Add your document expiry dates to start receiving reminders</p>
              <Button onClick={() => setAddDocModal(true)} icon={<Plus size={16} />}>
                Add First Document
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicle.documents.map(doc => (
              <DocumentCard key={doc.id} doc={doc} vehicleId={id!} activeApps={(vehicle as any).applications || []} />
            ))}
          </div>
        )}
      </div>

      {/* Add Document Modal */}
      <Modal open={addDocModal} onClose={() => { setAddDocModal(false); reset(); }} title="Add Document">
        <form onSubmit={handleSubmit(data => addDocMutation.mutate(data))} className="space-y-4">
          <Select
            label="Document Type"
            required
            {...register('type', { required: 'Required' })}
            error={errors.type?.message}
            options={DOC_TYPES.map(t => ({ value: t, label: docTypeLabel(t) }))}
            placeholder="Select document type"
          />
          <Input
            label="Expiry Date"
            type="date"
            required
            {...register('expiryDate', { required: 'Required' })}
            error={errors.expiryDate?.message}
            hint="Enter the expiry date shown on your physical document"
          />
          <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            You can find the expiry date on your physical certificate. For Motor Insurance, we auto-populate from NIID when you add a vehicle.
          </p>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setAddDocModal(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" loading={addDocMutation.isPending}>Save Document</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
