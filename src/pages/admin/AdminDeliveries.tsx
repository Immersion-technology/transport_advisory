import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, MapPin, Phone, Truck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { getAdminDeliveries, updateDeliveryStatus } from '../../api/admin';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';
import { formatDate, formatNaira } from '../../utils';

const getDeliveries = () =>
  getAdminDeliveries().then(r => (r.data.data as any) || []).catch(() => []);

const deliveryStatusVariant: Record<string, 'neutral' | 'warning' | 'success'> = {
  PENDING: 'neutral',
  DISPATCHED: 'warning',
  DELIVERED: 'success',
};

export default function AdminDeliveries() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<any>(null);
  const [modal, setModal] = useState(false);

  const { data: deliveries = [], isLoading } = useQuery({
    queryKey: ['admin-deliveries'],
    queryFn: getDeliveries,
  });

  const { register, handleSubmit } = useForm<{ status: string; trackingCode: string }>();

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: string; trackingCode?: string } }) =>
      updateDeliveryStatus(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-deliveries'] });
      toast.success('Delivery updated');
      setModal(false);
    },
    onError: () => toast.error('Update failed'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Deliveries</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage document delivery requests</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size={32} /></div>
      ) : deliveries.length === 0 ? (
        <Card className="p-8">
          <EmptyState icon={<Package size={28} />} title="No deliveries yet" description="Delivery requests will appear here." />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deliveries.map((d: any) => (
            <Card key={d.id} className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Package size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900">{d.recipientName}</p>
                    <p className="text-xs text-gray-500">{d.tier} delivery</p>
                  </div>
                </div>
                <Badge variant={deliveryStatusVariant[d.status] || 'neutral'}>{d.status}</Badge>
              </div>
              <div className="space-y-1.5 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin size={13} className="text-gray-400" />
                  {d.address}, {d.city}, {d.state}
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-gray-400" />
                  {d.recipientPhone}
                </div>
                <div className="flex items-center gap-2">
                  <Truck size={13} className="text-gray-400" />
                  Fee: {formatNaira(d.fee)}
                  {d.trackingCode && ` · ${d.trackingCode}`}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline" size="sm"
                  onClick={() => { setSelected(d); setModal(true); }}
                >
                  Update Status
                </Button>
                <p className="text-xs text-gray-400 ml-auto self-center">{formatDate(d.createdAt)}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Update Delivery" size="sm">
        <form onSubmit={handleSubmit(data => {
          if (!selected) return;
          mutation.mutate({ id: selected.id, data });
        })} className="space-y-4">
          <Select
            label="Delivery Status"
            required
            {...register('status', { required: 'Required' })}
            options={[
              { value: 'PENDING', label: 'Pending' },
              { value: 'DISPATCHED', label: 'Dispatched' },
              { value: 'DELIVERED', label: 'Delivered' },
            ]}
          />
          <Input label="Tracking Code (optional)" placeholder="e.g. GIG-12345" {...register('trackingCode')} />
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setModal(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" loading={mutation.isPending}>Update</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
