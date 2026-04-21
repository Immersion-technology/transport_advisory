import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { FileText, Plus, ExternalLink, CheckCircle, Clock, AlertCircle, Package } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { getApplications, createApplication, initPayment } from '../api/applications';
import { getVehicles } from '../api/vehicles';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import EmptyState from '../components/ui/EmptyState';
import Spinner from '../components/ui/Spinner';
import { formatDate, applicationStatusColor, docTypeLabel, formatNaira, NIGERIAN_STATES } from '../utils';
import type { Application, DocumentType } from '../types';

const RENEWAL_FEES: Record<string, { gov: number; service: number }> = {
  MOTOR_INSURANCE: { gov: 15000, service: 1500 },
  VEHICLE_LICENSE: { gov: 15000, service: 2500 },
  ROADWORTHINESS: { gov: 12000, service: 2000 },
  HACKNEY_PERMIT: { gov: 0, service: 2500 },
};
const FRESH_FEES: Record<string, { gov: number; service: number }> = {
  MOTOR_INSURANCE: { gov: 15000, service: 3500 },
  VEHICLE_LICENSE: { gov: 15000, service: 3500 },
  ROADWORTHINESS: { gov: 12000, service: 3500 },
  HACKNEY_PERMIT: { gov: 0, service: 3500 },
};

const DELIVERY_FEES: Record<string, number> = {
  STANDARD: 2000, EXPRESS: 4500, SAME_DAY: 8000,
};

const statusIcon: Record<string, React.ElementType> = {
  PENDING: Clock,
  PROCESSING: Clock,
  SUBMITTED: Clock,
  READY: CheckCircle,
  DELIVERED: Package,
  CANCELLED: AlertCircle,
};

function ApplicationCard({ app }: { app: Application }) {
  const StatusIcon = statusIcon[app.status] || Clock;
  const colorClass = applicationStatusColor(app.status);

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0A3828]/8 rounded-xl flex items-center justify-center">
            <FileText size={18} className="text-[#0A3828]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900 text-sm">{docTypeLabel(app.documentType as DocumentType)}</h4>
              {app.kind === 'FRESH' && (
                <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-medium uppercase tracking-wide">Fresh</span>
              )}
            </div>
            <p className="text-xs text-gray-500">{app.vehicle?.plateNumber} · {app.vehicle?.make} {app.vehicle?.model}</p>
          </div>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${colorClass}`}>
          <StatusIcon size={11} />
          {app.status}
        </span>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between text-gray-600">
          <span>Government fee</span>
          <span className="font-medium">{formatNaira(app.governmentFee)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Service charge</span>
          <span className="font-medium">{formatNaira(app.serviceFee)}</span>
        </div>
        {app.delivery && (
          <div className="flex justify-between text-gray-600">
            <span>Delivery ({app.delivery.tier})</span>
            <span className="font-medium">{formatNaira(app.delivery.fee)}</span>
          </div>
        )}
        <div className="flex justify-between text-gray-900 font-semibold pt-1 border-t border-gray-100">
          <span>Total</span>
          <span>{formatNaira(app.totalAmount)}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {/* Unpaid → Pay Now */}
        {!app.isPaid && app.status !== 'CANCELLED' && (
          <PayButton applicationId={app.id} />
        )}

        {/* Paid but no completed doc yet → Awaiting status */}
        {app.isPaid && !app.completedFileUrl && app.status !== 'CANCELLED' && (
          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl">
            <Clock size={14} className="text-blue-600 animate-pulse flex-shrink-0" />
            <div className="text-xs">
              <p className="font-semibold text-blue-800">Awaiting renewed document</p>
              <p className="text-blue-600">Admin will upload once ready</p>
            </div>
          </div>
        )}

        {/* Completed doc ready → Download */}
        {app.completedFileUrl && (
          <a href={app.completedFileUrl} target="_blank" rel="noreferrer" className="flex-1">
            <Button variant="secondary" size="sm" className="w-full" icon={<ExternalLink size={13} />}>
              Download Document
            </Button>
          </a>
        )}

        {/* Cancelled → banner */}
        {app.status === 'CANCELLED' && (
          <div className="flex-1 flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-xs">
            <AlertCircle size={14} className="text-red-600" />
            <p className="font-semibold text-red-800">Application cancelled</p>
          </div>
        )}

        <p className="text-xs text-gray-400 ml-auto whitespace-nowrap">{formatDate(app.createdAt)}</p>
      </div>
    </Card>
  );
}

function PayButton({ applicationId }: { applicationId: string }) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await initPayment(applicationId);
      const { authorizationUrl } = res.data.data!;
      // Redirect in the same tab so Paystack's success URL returns the user
      // back to our callback page, which verifies the transaction server-side.
      window.location.href = authorizationUrl;
    } catch {
      toast.error('Payment initialization failed');
      setLoading(false);
    }
  };

  return (
    <Button size="sm" className="flex-1" loading={loading} onClick={handlePay}>
      Pay Now
    </Button>
  );
}

interface AppForm {
  vehicleId: string;
  documentType: string;
  kind: 'RENEWAL' | 'FRESH';
  deliveryTier: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  recipientName: string;
  recipientPhone: string;
}

export default function ApplicationsPage() {
  const [searchParams] = useSearchParams();
  const [showModal, setShowModal] = useState(!!searchParams.get('vehicleId'));
  const qc = useQueryClient();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => getApplications().then(r => r.data.data || []),
    refetchOnWindowFocus: true,
  });
  const { data: vehicles = [] } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => getVehicles().then(r => r.data.data || []),
  });

  // Re-fetch whenever the tab regains focus — catches users who close Paystack
  // without completing the callback redirect
  useEffect(() => {
    const handler = () => qc.invalidateQueries({ queryKey: ['applications'] });
    window.addEventListener('focus', handler);
    return () => window.removeEventListener('focus', handler);
  }, [qc]);

  const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<AppForm>({
    defaultValues: {
      vehicleId: searchParams.get('vehicleId') || '',
      documentType: searchParams.get('type') || '',
      kind: (searchParams.get('kind') as 'RENEWAL' | 'FRESH') || 'RENEWAL',
      deliveryTier: '',
    },
  });

  const docType = watch('documentType');
  const vehicleId = watch('vehicleId');
  const kind = watch('kind');
  const deliveryTier = watch('deliveryTier');
  const feeTable = kind === 'FRESH' ? FRESH_FEES : RENEWAL_FEES;
  const fees = feeTable[docType] || { gov: 0, service: 3500 };
  const deliveryFee = DELIVERY_FEES[deliveryTier] || 0;
  const total = fees.gov + fees.service + deliveryFee;

  // Document types that already have an active application for the selected vehicle
  const blockedDocTypes = vehicleId
    ? new Set(
        applications
          .filter(a => a.vehicleId === vehicleId && ['PENDING', 'PROCESSING', 'SUBMITTED', 'READY'].includes(a.status))
          .map(a => a.documentType)
      )
    : new Set<string>();
  const hasBlocked = !!docType && blockedDocTypes.has(docType);

  const createMutation = useMutation({
    mutationFn: createApplication,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Application created');
      setShowModal(false);
      reset();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create application'),
  });

  const onSubmit = (data: AppForm) => {
    createMutation.mutate({
      vehicleId: data.vehicleId,
      documentType: data.documentType,
      kind: data.kind,
      ...(data.deliveryTier && {
        deliveryTier: data.deliveryTier,
        deliveryAddress: data.deliveryAddress,
        deliveryCity: data.deliveryCity,
        deliveryState: data.deliveryState,
        recipientName: data.recipientName,
        recipientPhone: data.recipientPhone,
      }),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Applications</h2>
          <p className="text-sm text-gray-500 mt-0.5">Renewal and application requests</p>
        </div>
        <Button onClick={() => setShowModal(true)} icon={<Plus size={16} />}>
          New Application
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size={32} /></div>
      ) : applications.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={<FileText size={28} />}
            title="No applications yet"
            description="Start a renewal application for any of your vehicle documents."
            action={<Button onClick={() => setShowModal(true)} icon={<Plus size={16} />}>New Application</Button>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {applications.map(app => <ApplicationCard key={app.id} app={app} />)}
        </div>
      )}

      <Modal open={showModal} onClose={() => { setShowModal(false); reset(); }} title="New Application" size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Application Kind Toggle */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Application Type</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'RENEWAL', title: 'Renewal', desc: 'Existing document is expiring soon' },
                { value: 'FRESH', title: 'Fresh Application', desc: 'Newly purchased vehicle or first-time registration' },
              ].map(({ value, title, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue('kind', value as 'RENEWAL' | 'FRESH')}
                  className={`
                    p-4 rounded-xl border-2 text-left transition-all
                    ${kind === value
                      ? 'border-[#0A3828] bg-[#0A3828]/5'
                      : 'border-gray-200 hover:border-gray-300 bg-white'}
                  `}
                >
                  <p className="text-sm font-semibold text-gray-900">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Vehicle"
              required
              {...register('vehicleId', { required: 'Required' })}
              error={errors.vehicleId?.message}
              options={vehicles.map(v => ({ value: v.id, label: `${v.plateNumber} — ${v.make} ${v.model}` }))}
              placeholder="Select vehicle"
            />
            <Select
              label="Document Type"
              required
              {...register('documentType', { required: 'Required' })}
              error={errors.documentType?.message}
              options={[
                { value: 'MOTOR_INSURANCE', label: `Motor Insurance${blockedDocTypes.has('MOTOR_INSURANCE') ? ' — in progress' : ''}` },
                { value: 'VEHICLE_LICENSE', label: `Vehicle License${blockedDocTypes.has('VEHICLE_LICENSE') ? ' — in progress' : ''}` },
                { value: 'ROADWORTHINESS', label: `Roadworthiness Certificate${blockedDocTypes.has('ROADWORTHINESS') ? ' — in progress' : ''}` },
                { value: 'HACKNEY_PERMIT', label: `Hackney Permit${blockedDocTypes.has('HACKNEY_PERMIT') ? ' — in progress' : ''}` },
              ]}
              placeholder="Select document"
            />
          </div>

          {hasBlocked && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                This vehicle already has an active application for this document. Complete or cancel the existing one first.
              </p>
            </div>
          )}

          {/* Fee summary */}
          {docType && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Government fee</span><span className="font-medium">{formatNaira(fees.gov)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Service charge</span><span className="font-medium">{formatNaira(fees.service)}</span>
              </div>
              {deliveryFee > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span><span className="font-medium">{formatNaira(deliveryFee)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-900 font-bold border-t border-gray-200 pt-2">
                <span>Total</span><span>{formatNaira(total)}</span>
              </div>
            </div>
          )}

          {/* Delivery */}
          <div>
            <Select
              label="Delivery Option"
              {...register('deliveryTier')}
              options={[
                { value: 'STANDARD', label: 'Standard Delivery (3–5 days) — ₦2,000' },
                { value: 'EXPRESS', label: 'Express Delivery (1–2 days) — ₦4,500' },
                { value: 'SAME_DAY', label: 'Same Day Delivery (Lagos only) — ₦8,000' },
              ]}
              placeholder="Download soft copy only (no delivery)"
            />
          </div>

          {deliveryTier && (
            <div className="grid grid-cols-1 gap-3">
              <Input label="Delivery Address" placeholder="123 Main Street" required {...register('deliveryAddress', { required: 'Required' })} error={errors.deliveryAddress?.message} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="City" placeholder="Lagos" required {...register('deliveryCity', { required: 'Required' })} error={errors.deliveryCity?.message} />
                <Select label="State" required {...register('deliveryState', { required: 'Required' })} error={errors.deliveryState?.message} options={NIGERIAN_STATES.map(s => ({ value: s, label: s }))} placeholder="Select state" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Recipient Name" placeholder="Full name" required {...register('recipientName', { required: 'Required' })} error={errors.recipientName?.message} />
                <Input label="Recipient Phone" placeholder="0801..." required {...register('recipientPhone', { required: 'Required' })} error={errors.recipientPhone?.message} />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" loading={createMutation.isPending} disabled={hasBlocked}>Create Application</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
