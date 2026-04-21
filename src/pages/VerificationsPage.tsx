import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import api from '../api/client';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Spinner from '../components/ui/Spinner';
import { formatDate } from '../utils';
import type { VehicleVerification } from '../types';

const getVerificationsFn = () =>
  api.get('/verifications').then(r => r.data.data || []);

const runVerificationFn = (data: { plateNumber: string }) =>
  api.post('/verifications', data);

function SectionRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between text-xs">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900 text-right truncate ml-2">{value}</span>
    </div>
  );
}

function SourceBadge({ source }: { source?: string }) {
  if (source === 'NIID_LIVE') {
    return <span className="text-[10px] px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-medium">Live NIID</span>;
  }
  if (source === 'TRANSPORT_ADVISORY_DB') {
    return <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-medium">TA Verified</span>;
  }
  return null;
}

function VerificationCard({ v }: { v: VehicleVerification }) {
  const report: any = v.reportData;
  const insurance = report?.insurance;
  const license = report?.license;
  const rw = report?.roadworthiness;
  const hackney = report?.hackneyPermit;
  const vehicleInfo = report?.vehicleInfo;

  const hasAnyData = insurance?.status === 'found' || license || rw || hackney || vehicleInfo;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-bold text-gray-900">{v.plateNumber}</h4>
          <p className="text-xs text-gray-500 mt-0.5">{formatDate(v.createdAt)}</p>
        </div>
        {hasAnyData ? <Badge variant="success">Verified</Badge> : <Badge variant="danger">Not Found</Badge>}
      </div>

      {!hasAnyData ? (
        <div className="flex items-start gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs">
          <XCircle size={14} className="flex-shrink-0 mt-0.5" />
          <span className="font-medium">No records found — verify with seller before purchase</span>
        </div>
      ) : (
        <div className="space-y-3">
          {vehicleInfo && (
            <div className="border border-gray-100 rounded-lg p-3 bg-gray-50">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Vehicle</p>
              <SectionRow label="Make & Model" value={[vehicleInfo.make, vehicleInfo.model].filter(Boolean).join(' ')} />
              <SectionRow label="Year" value={vehicleInfo.year?.toString()} />
              <SectionRow label="Color" value={vehicleInfo.color} />
              <SectionRow label="Registered State" value={vehicleInfo.registeredState} />
              <SectionRow label="Owner" value={vehicleInfo.ownerName} />
            </div>
          )}

          {insurance?.status === 'found' && (
            <div className="border border-emerald-100 rounded-lg p-3 bg-emerald-50/40">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wide flex items-center gap-1">
                  <CheckCircle size={11} /> Motor Insurance
                </p>
                <SourceBadge source={insurance.source} />
              </div>
              <SectionRow label="Insurer" value={insurance.insurer} />
              <SectionRow label="Policy #" value={insurance.policyNumber} />
              <SectionRow label="Expires" value={insurance.expiryDate} />
              <SectionRow label="Cover" value={insurance.coverType} />
            </div>
          )}

          {license && (
            <div className="border border-blue-100 rounded-lg p-3 bg-blue-50/40">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] font-semibold text-blue-700 uppercase tracking-wide">Vehicle License</p>
                <SourceBadge source={license.source} />
              </div>
              <SectionRow label="License #" value={license.licenseNumber} />
              <SectionRow label="Expires" value={license.expiryDate} />
              <SectionRow label="Status" value={license.statusFlag} />
            </div>
          )}

          {rw && (
            <div className="border border-purple-100 rounded-lg p-3 bg-purple-50/40">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] font-semibold text-purple-700 uppercase tracking-wide">Roadworthiness</p>
                <SourceBadge source={rw.source} />
              </div>
              <SectionRow label="Certificate #" value={rw.certNumber} />
              <SectionRow label="Inspection" value={rw.inspectionDate} />
              <SectionRow label="Expires" value={rw.expiryDate} />
            </div>
          )}

          {hackney && (
            <div className="border border-amber-100 rounded-lg p-3 bg-amber-50/40">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] font-semibold text-amber-700 uppercase tracking-wide">Hackney Permit</p>
                <SourceBadge source={hackney.source} />
              </div>
              <SectionRow label="Permit #" value={hackney.permitNumber} />
              <SectionRow label="Operator" value={hackney.operator} />
              <SectionRow label="Expires" value={hackney.expiryDate} />
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export default function VerificationsPage() {
  const qc = useQueryClient();

  const { data: verifications = [], isLoading } = useQuery({
    queryKey: ['verifications'],
    queryFn: getVerificationsFn,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<{ plateNumber: string }>();

  const verifyMutation = useMutation({
    mutationFn: runVerificationFn,
    onSuccess: (res) => {
      const report = res.data.data?.report;
      const source = report?.insurance?.source;
      if (source === 'NIID_LIVE') toast.success('Live NIID data confirmed');
      else if (source === 'TRANSPORT_ADVISORY_DB' || report?.license || report?.roadworthiness) {
        toast.success('Vehicle data located in registry');
      } else {
        toast('No records found — verify with seller', { icon: '⚠️' });
      }
      qc.invalidateQueries({ queryKey: ['verifications'] });
      reset();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Verification failed'),
  });

  const onSubmit = (data: { plateNumber: string }) => verifyMutation.mutate(data);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Vehicle Verification</h2>
        <p className="text-sm text-gray-500 mt-0.5">Check a vehicle's insurance record before purchase — free</p>
      </div>

      {/* Verify form */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-[#0A3828]/8 rounded-xl flex items-center justify-center">
            <Shield size={20} className="text-[#0A3828]" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Pre-Purchase Vehicle Check</h3>
            <p className="text-xs text-gray-500">Verify insurance status via NIID database</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="Enter plate number e.g. LAG 234 AB"
              leftIcon={<Search size={16} />}
              {...register('plateNumber', { required: 'Required', minLength: { value: 6, message: 'Invalid plate' } })}
              error={errors.plateNumber?.message}
            />
          </div>
          <Button type="submit" loading={verifyMutation.isPending} icon={<Search size={16} />}>
            Verify
          </Button>
        </form>

        <div className="mt-5 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: CheckCircle, label: 'Insurance Status', desc: 'via NIID database', color: 'text-emerald-600 bg-emerald-50' },
            { icon: Search, label: 'Policy Details', desc: 'Insurer, policy no.', color: 'text-blue-600 bg-blue-50' },
            { icon: AlertTriangle, label: 'Fraud Alert', desc: 'Flag missing records', color: 'text-amber-600 bg-amber-50' },
          ].map(({ icon: Icon, label, desc, color }) => (
            <div key={label} className="p-3 bg-gray-50 rounded-xl">
              <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center mx-auto mb-2`}>
                <Icon size={16} />
              </div>
              <p className="text-xs font-medium text-gray-900">{label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* History */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Previous Checks</h3>
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : verifications.length === 0 ? (
          <Card className="p-8">
            <EmptyState
              icon={<Shield size={28} />}
              title="No verifications yet"
              description="Run a verification check to see the results here."
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {verifications.map((v: VehicleVerification) => <VerificationCard key={v.id} v={v} />)}
          </div>
        )}
      </div>
    </div>
  );
}
