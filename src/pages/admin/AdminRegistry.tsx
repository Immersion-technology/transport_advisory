import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  Database, Plus, Search, Edit3, Trash2, Car, Shield, FileText, Wrench, Hash,
} from 'lucide-react';
import {
  getRegistryEntries, upsertRegistryEntry, deleteRegistryEntry,
  PlateRegistryEntry,
} from '../../api/admin';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';
import YearPicker from '../../components/ui/YearPicker';
import { formatDate, NIGERIAN_STATES } from '../../utils';

const STATUS_OPTIONS = [
  { value: '', label: '—' },
  { value: 'Active', label: 'Active' },
  { value: 'Expired', label: 'Expired' },
  { value: 'Suspended', label: 'Suspended' },
  { value: 'Revoked', label: 'Revoked' },
];

const TABS = [
  { key: 'vehicle', label: 'Vehicle Info', icon: Car },
  { key: 'insurance', label: 'Insurance', icon: Shield },
  { key: 'license', label: 'Vehicle License', icon: FileText },
  { key: 'rw', label: 'Roadworthiness', icon: Wrench },
  { key: 'hackney', label: 'Hackney Permit', icon: Hash },
];

type FormData = Partial<PlateRegistryEntry>;

function RegistryCard({ entry, onEdit, onDelete }: {
  entry: PlateRegistryEntry; onEdit: () => void; onDelete: () => void;
}) {
  const completeness = [
    entry.insurer || entry.insuranceExpiryDate,
    entry.licenseNumber || entry.licenseExpiryDate,
    entry.rwCertNumber || entry.rwExpiryDate,
    entry.make || entry.model,
  ].filter(Boolean).length;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-[#0A3828] rounded-xl flex items-center justify-center text-white text-sm font-bold tracking-wider">
            {entry.plateNumber.slice(0, 3)}
          </div>
          <div>
            <h4 className="font-bold text-gray-900">{entry.plateNumber}</h4>
            <p className="text-xs text-gray-500">
              {entry.make && entry.model ? `${entry.make} ${entry.model} ${entry.year || ''}` : 'Vehicle details incomplete'}
            </p>
            {entry.ownerName && <p className="text-xs text-gray-400">Owner: {entry.ownerName}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onEdit} className="p-1.5 rounded-lg text-gray-400 hover:text-[#0A3828] hover:bg-gray-100">
            <Edit3 size={14} />
          </button>
          <button onClick={onDelete} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="space-y-2 text-xs">
        {[
          { label: 'Insurance', exp: entry.insuranceExpiryDate, extra: entry.insurer },
          { label: 'License', exp: entry.licenseExpiryDate, extra: entry.licenseNumber },
          { label: 'Roadworthiness', exp: entry.rwExpiryDate, extra: entry.rwCertNumber },
          { label: 'Hackney', exp: entry.hackneyExpiryDate, extra: entry.hackneyPermitNumber },
        ].map(row => (
          <div key={row.label} className="flex items-center justify-between">
            <span className="text-gray-500">{row.label}</span>
            {row.exp ? (
              <span className="text-gray-900 font-medium">{formatDate(row.exp)}{row.extra && ` · ${row.extra}`}</span>
            ) : (
              <span className="text-gray-300">—</span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
        <Badge variant={completeness >= 3 ? 'success' : completeness >= 1 ? 'warning' : 'neutral'}>
          {completeness}/4 sections filled
        </Badge>
        <span className="text-gray-400">Updated {formatDate(entry.updatedAt)}</span>
      </div>
    </Card>
  );
}

export default function AdminRegistry() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PlateRegistryEntry | null>(null);
  const [activeTab, setActiveTab] = useState('vehicle');

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['admin-registry', search],
    queryFn: () => getRegistryEntries({ search: search || undefined }).then(r => r.data.data || []),
  });

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormData>();
  const yearValue = watch('year');

  const openNew = () => {
    setEditing(null);
    reset({
      plateNumber: '', year: 2020,
    });
    setActiveTab('vehicle');
    setModalOpen(true);
  };

  const openEdit = (entry: PlateRegistryEntry) => {
    setEditing(entry);
    const prepared: FormData = {
      ...entry,
      insuranceStartDate: entry.insuranceStartDate?.split('T')[0],
      insuranceExpiryDate: entry.insuranceExpiryDate?.split('T')[0],
      licenseIssueDate: entry.licenseIssueDate?.split('T')[0],
      licenseExpiryDate: entry.licenseExpiryDate?.split('T')[0],
      rwInspectionDate: entry.rwInspectionDate?.split('T')[0],
      rwExpiryDate: entry.rwExpiryDate?.split('T')[0],
      hackneyIssueDate: entry.hackneyIssueDate?.split('T')[0],
      hackneyExpiryDate: entry.hackneyExpiryDate?.split('T')[0],
    };
    reset(prepared);
    setActiveTab('vehicle');
    setModalOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: upsertRegistryEntry,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-registry'] });
      toast.success(editing ? 'Registry entry updated' : 'Registry entry created');
      setModalOpen(false);
      reset();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Save failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRegistryEntry,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-registry'] });
      toast.success('Entry removed');
    },
    onError: () => toast.error('Delete failed'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Database size={20} className="text-[#0A3828]" />
            Plate Registry
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Curated verification data — shown in Vehicle Check when live portal data is unavailable
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search plate or owner..."
              className="pl-9 pr-3 py-2 w-64 border border-gray-200 rounded-xl text-sm outline-none focus:border-[#0A3828] bg-white"
            />
          </div>
          <Button onClick={openNew} icon={<Plus size={16} />}>Add Entry</Button>
        </div>
      </div>

      {/* Info card */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <p className="text-xs text-blue-900">
          <strong>How this works:</strong> Admins populate this registry with data from NIID / AutoReg / DVIS checker pages for each car. When anyone runs a Vehicle Verification,
          the system first tries live NIID scraping. If that fails or returns no match, it falls back to this registry so users always get a response.
        </p>
      </Card>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size={32} /></div>
      ) : entries.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={<Database size={28} />}
            title={search ? 'No matches' : 'Registry is empty'}
            description={search ? 'Try a different plate number or owner name' : 'Add plate data to provide verification results when live APIs are unavailable'}
            action={!search && <Button onClick={openNew} icon={<Plus size={16} />}>Add First Entry</Button>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {entries.map(e => (
            <RegistryCard
              key={e.id}
              entry={e}
              onEdit={() => openEdit(e)}
              onDelete={() => {
                if (confirm(`Delete registry entry for ${e.plateNumber}?`)) deleteMutation.mutate(e.id);
              }}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); reset(); }}
        title={editing ? `Edit ${editing.plateNumber}` : 'Add Registry Entry'}
        size="xl"
      >
        <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="space-y-5">
          {/* Plate Number */}
          <Input
            label="Plate Number"
            placeholder="e.g. LAG 234 AB"
            required
            disabled={!!editing}
            {...register('plateNumber', { required: 'Required' })}
            error={errors.plateNumber?.message as string}
          />

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  activeTab === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>

          {/* Vehicle Info Tab */}
          {activeTab === 'vehicle' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Make" placeholder="Toyota" {...register('make')} />
                <Input label="Model" placeholder="Camry" {...register('model')} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <input type="hidden" {...register('year', { valueAsNumber: true })} />
                  <YearPicker
                    label="Year"
                    value={yearValue}
                    onChange={(y) => setValue('year', y)}
                  />
                </div>
                <Input label="Color" placeholder="Black" {...register('color')} />
                <Select
                  label="State"
                  {...register('registeredState')}
                  options={NIGERIAN_STATES.map(s => ({ value: s, label: s }))}
                  placeholder="Select"
                />
              </div>
              <Input label="Owner Name" placeholder="Full name on registration" {...register('ownerName')} />
            </div>
          )}

          {/* Insurance Tab */}
          {activeTab === 'insurance' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Insurer" placeholder="AIICO, Leadway, etc." {...register('insurer')} />
                <Input label="Policy Number" {...register('policyNumber')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input label="Start Date" type="date" {...register('insuranceStartDate')} />
                <Input label="Expiry Date" type="date" {...register('insuranceExpiryDate')} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Cover Type"
                  {...register('insuranceCoverType')}
                  options={[
                    { value: 'Third Party', label: 'Third Party' },
                    { value: 'Comprehensive', label: 'Comprehensive' },
                    { value: 'Third Party Fire & Theft', label: 'Third Party Fire & Theft' },
                  ]}
                  placeholder="—"
                />
                <Select label="Status" {...register('insuranceStatus')} options={STATUS_OPTIONS} placeholder="—" />
              </div>
            </div>
          )}

          {/* License Tab */}
          {activeTab === 'license' && (
            <div className="space-y-3">
              <Input label="License Number" {...register('licenseNumber')} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Issue Date" type="date" {...register('licenseIssueDate')} />
                <Input label="Expiry Date" type="date" {...register('licenseExpiryDate')} />
              </div>
              <Select label="Status" {...register('licenseStatus')} options={STATUS_OPTIONS} placeholder="—" />
            </div>
          )}

          {/* Roadworthiness Tab */}
          {activeTab === 'rw' && (
            <div className="space-y-3">
              <Input label="Certificate Number" {...register('rwCertNumber')} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Inspection Date" type="date" {...register('rwInspectionDate')} />
                <Input label="Expiry Date" type="date" {...register('rwExpiryDate')} />
              </div>
              <Select label="Status" {...register('rwStatus')} options={STATUS_OPTIONS} placeholder="—" />
            </div>
          )}

          {/* Hackney Tab */}
          {activeTab === 'hackney' && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500">For commercial vehicles (Keke, Danfo, taxi, ride-hailing).</p>
              <Input label="Permit Number" {...register('hackneyPermitNumber')} />
              <Input label="Operator Name" {...register('hackneyOperator')} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Issue Date" type="date" {...register('hackneyIssueDate')} />
                <Input label="Expiry Date" type="date" {...register('hackneyExpiryDate')} />
              </div>
              <Select label="Status" {...register('hackneyStatus')} options={STATUS_OPTIONS} placeholder="—" />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Internal Notes</label>
            <textarea
              {...register('notes')}
              rows={2}
              placeholder="Optional — admin-only notes about this entry"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white border border-gray-200 focus:border-[#0A3828] outline-none resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" loading={saveMutation.isPending}>
              {editing ? 'Save Changes' : 'Create Entry'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
