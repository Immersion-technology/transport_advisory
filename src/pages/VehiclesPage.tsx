import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Car, MapPin, ChevronRight, Trash2, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { getVehicles, addVehicle, deleteVehicle, lookupPlate } from '../api/vehicles';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import YearPicker from '../components/ui/YearPicker';
import { daysUntilExpiry, getDocumentStatus, getStatusColor, docTypeLabel, NIGERIAN_STATES } from '../utils';
import type { Vehicle, Document } from '../types';

interface AddVehicleForm {
  plateNumber: string;
  make: string;
  model: string;
  year: string;
  stateOfRegistration: string;
}

function DocumentBadge({ doc }: { doc: Document }) {
  const status = getDocumentStatus(doc.expiryDate);
  const days = daysUntilExpiry(doc.expiryDate);
  const colorClass = getStatusColor(status);

  return (
    <div className={`flex items-center justify-between text-xs px-3 py-1.5 rounded-lg border ${colorClass}`}>
      <span className="font-medium">{docTypeLabel(doc.type)}</span>
      <span>{days < 0 ? 'Expired' : days === 0 ? 'Today' : `${days}d`}</span>
    </div>
  );
}

function VehicleCard({ vehicle, onDelete }: { vehicle: Vehicle; onDelete: (id: string) => void }) {
  const docCount = vehicle.documents.length;
  const expiredDocs = vehicle.documents.filter(d => getDocumentStatus(d.expiryDate) === 'expired');
  const criticalDocs = vehicle.documents.filter(d => ['critical', 'expiring_soon'].includes(getDocumentStatus(d.expiryDate)));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
    >
      <Card className="overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#0A3828] to-[#15803d] p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center">
                <Car size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{vehicle.plateNumber}</h3>
                <p className="text-emerald-300/80 text-sm">{vehicle.make} {vehicle.model} · {vehicle.year}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {expiredDocs.length > 0 && (
                <Badge variant="danger" size="sm">{expiredDocs.length} expired</Badge>
              )}
              {expiredDocs.length === 0 && criticalDocs.length > 0 && (
                <Badge variant="warning" size="sm">{criticalDocs.length} urgent</Badge>
              )}
              {expiredDocs.length === 0 && criticalDocs.length === 0 && docCount > 0 && (
                <Badge variant="success" size="sm">All valid</Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 mt-3 text-emerald-300/70 text-xs">
            <MapPin size={12} />
            <span>{vehicle.stateOfRegistration} State</span>
          </div>
        </div>

        {/* Documents */}
        <div className="p-4">
          {docCount === 0 ? (
            <p className="text-xs text-gray-500 text-center py-2">No documents tracked yet</p>
          ) : (
            <div className="space-y-1.5">
              {vehicle.documents.map(doc => <DocumentBadge key={doc.id} doc={doc} />)}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-gray-100 px-4 py-3 flex items-center gap-2">
          <Link to={`/vehicles/${vehicle.id}`} className="flex-1">
            <Button variant="secondary" size="sm" className="w-full" icon={<ChevronRight size={14} />}>
              Manage
            </Button>
          </Link>
          <Link to={`/applications/new?vehicleId=${vehicle.id}`}>
            <Button variant="outline" size="sm" icon={<FileText size={14} />}>
              Renew
            </Button>
          </Link>
          <button
            onClick={() => onDelete(vehicle.id)}
            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </Card>
    </motion.div>
  );
}

export default function VehiclesPage() {
  const qc = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [niidData, setNiidData] = useState<any>(null);

  const { data: vehicles = [], isLoading } = useQuery({
    queryKey: ['vehicles'],
    queryFn: () => getVehicles().then(r => r.data.data || []),
  });

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<AddVehicleForm>({
    defaultValues: { year: '2020' },
  });
  const plateValue = watch('plateNumber');
  const yearValue = watch('year');

  const addMutation = useMutation({
    mutationFn: (data: AddVehicleForm) => addVehicle({
      ...data, year: Number(data.year),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Vehicle added successfully');
      setShowAddModal(false);
      reset();
      setNiidData(null);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to add vehicle'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVehicle,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['vehicles'] });
      toast.success('Vehicle removed');
    },
    onError: () => toast.error('Failed to remove vehicle'),
  });

  const handlePlateBlur = async () => {
    if (!plateValue || plateValue.length < 6) return;
    setLookingUp(true);
    try {
      const res = await lookupPlate(plateValue);
      const data = res.data.data as any;
      if (data?.status === 'found') {
        setNiidData(data);
        toast.success('Insurance details found on NIID');
      }
    } catch (_) {}
    finally { setLookingUp(false); }
  };

  const onSubmit = (data: AddVehicleForm) => addMutation.mutate(data);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">My Vehicles</h2>
          <p className="text-sm text-gray-500 mt-0.5">{vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} registered</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} icon={<Plus size={16} />}>
          Add Vehicle
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size={32} /></div>
      ) : vehicles.length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={<Car size={28} />}
            title="No vehicles yet"
            description="Add your first vehicle to start tracking document expiry and receive timely reminders."
            action={<Button onClick={() => setShowAddModal(true)} icon={<Plus size={16} />}>Add Your First Vehicle</Button>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <AnimatePresence>
            {vehicles.map(v => (
              <VehicleCard
                key={v.id}
                vehicle={v}
                onDelete={(id) => {
                  if (confirm('Remove this vehicle?')) deleteMutation.mutate(id);
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add Vehicle Modal */}
      <Modal open={showAddModal} onClose={() => { setShowAddModal(false); reset(); setNiidData(null); }} title="Add Vehicle">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {niidData && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-emerald-700 mb-1">✓ NIID Insurance Found</p>
              <p className="text-xs text-emerald-600">{niidData.insurer} · Expires {niidData.expiryDate}</p>
            </div>
          )}

          <Input
            label="Plate Number"
            placeholder="e.g. AAA 123 BC"
            required
            {...register('plateNumber', { required: 'Required', minLength: { value: 6, message: 'Invalid plate' } })}
            error={errors.plateNumber?.message}
            onBlur={handlePlateBlur}
            rightElement={lookingUp ? <Spinner size={16} /> : undefined}
            hint="We'll auto-lookup insurance status from NIID"
          />

          <div className="grid grid-cols-2 gap-3">
            <Input label="Make" placeholder="Toyota" required {...register('make', { required: 'Required' })} error={errors.make?.message} />
            <Input label="Model" placeholder="Camry" required {...register('model', { required: 'Required' })} error={errors.model?.message} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <input type="hidden" {...register('year', { required: 'Required' })} />
              <YearPicker
                label="Year"
                required
                value={yearValue}
                onChange={(y) => setValue('year', String(y), { shouldValidate: true })}
                error={errors.year?.message as string}
                hint="Type or scroll to change"
              />
            </div>
            <Select
              label="State of Registration"
              required
              {...register('stateOfRegistration', { required: 'Required' })}
              error={errors.stateOfRegistration?.message}
              options={NIGERIAN_STATES.map(s => ({ value: s, label: s }))}
              placeholder="Select state"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => { setShowAddModal(false); reset(); }}>Cancel</Button>
            <Button type="submit" className="flex-1" loading={addMutation.isPending}>Add Vehicle</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
