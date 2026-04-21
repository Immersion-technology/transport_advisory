import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  ShieldCheck, UserPlus, Trash2, ToggleLeft, ToggleRight,
  Mail, Phone, Key, Users, FileText, Package, Bell, Shield,
} from 'lucide-react';
import {
  getAllAdmins, createAdmin, updateAdminPermissions, toggleAdminActive, deleteAdmin,
  AdminStaff as AdminStaffType,
} from '../../api/admin';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';
import { formatDate } from '../../utils';

const PERMISSION_OPTIONS = [
  { key: 'MANAGE_APPLICATIONS', label: 'Manage Applications', desc: 'View, update status, upload completed documents', icon: FileText },
  { key: 'MANAGE_USERS', label: 'Manage Users', desc: 'View all registered users', icon: Users },
  { key: 'MANAGE_DELIVERIES', label: 'Manage Deliveries', desc: 'Update delivery status and tracking', icon: Package },
  { key: 'MANAGE_REMINDERS', label: 'Reminder Follow-up', desc: 'View unconfirmed reminder queue', icon: Bell },
  { key: 'MANAGE_ADMINS', label: 'Manage Admins', desc: 'Note: Super Admin privilege only', icon: Shield },
];

interface CreateForm {
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  password: string;
}

function PermissionPicker({
  value, onChange, disabled = false,
}: { value: string[]; onChange: (v: string[]) => void; disabled?: boolean }) {
  const toggle = (perm: string) => {
    if (disabled) return;
    if (value.includes(perm)) {
      onChange(value.filter(p => p !== perm));
    } else {
      onChange([...value, perm]);
    }
  };

  return (
    <div className="space-y-2">
      {PERMISSION_OPTIONS.filter(p => p.key !== 'MANAGE_ADMINS').map(({ key, label, desc, icon: Icon }) => {
        const active = value.includes(key);
        return (
          <button
            key={key}
            type="button"
            onClick={() => toggle(key)}
            disabled={disabled}
            className={`
              w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all
              ${active
                ? 'border-[#0A3828] bg-[#0A3828]/5'
                : 'border-gray-200 hover:border-gray-300 bg-white'}
              ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              active ? 'bg-[#0A3828] text-white' : 'bg-gray-100 text-gray-500'
            }`}>
              <Icon size={15} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900">{label}</p>
              <p className="text-xs text-gray-500">{desc}</p>
            </div>
            <div className={`mt-1 w-4 h-4 rounded-full border-2 flex-shrink-0 ${
              active ? 'bg-[#0A3828] border-[#0A3828]' : 'border-gray-300'
            }`}>
              {active && <div className="w-full h-full bg-white rounded-full scale-[0.3]" />}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function AdminCard({ admin }: { admin: AdminStaffType }) {
  const qc = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [perms, setPerms] = useState<string[]>(admin.permissions);

  const updateMutation = useMutation({
    mutationFn: (p: string[]) => updateAdminPermissions(admin.id, p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-staff'] });
      toast.success('Permissions updated');
      setEditMode(false);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const toggleMutation = useMutation({
    mutationFn: () => toggleAdminActive(admin.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-staff'] });
      toast.success(admin.isActive ? 'Admin deactivated' : 'Admin activated');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteAdmin(admin.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-staff'] });
      toast.success('Admin removed');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-bold ${
            admin.isSuperAdmin ? 'bg-amber-600' : 'bg-[#0A3828]'
          }`}>
            {admin.firstName?.[0]}{admin.lastName?.[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-900 text-sm">{admin.firstName} {admin.lastName}</p>
              {admin.isSuperAdmin && <Badge variant="gold" size="sm">Super Admin</Badge>}
              {!admin.isActive && <Badge variant="danger" size="sm">Inactive</Badge>}
            </div>
            <p className="text-xs text-gray-500">{admin.email}</p>
            <p className="text-xs text-gray-400 mt-0.5">Joined {formatDate(admin.createdAt)}</p>
          </div>
        </div>

        {!admin.isSuperAdmin && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => toggleMutation.mutate()}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              title={admin.isActive ? 'Deactivate' : 'Activate'}
            >
              {admin.isActive ? <ToggleRight size={18} className="text-emerald-600" /> : <ToggleLeft size={18} />}
            </button>
            <button
              onClick={() => {
                if (confirm(`Remove ${admin.firstName} ${admin.lastName}?`)) deleteMutation.mutate();
              }}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Remove admin"
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Permissions */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Permissions</p>
          {!admin.isSuperAdmin && !editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="text-xs text-[#0A3828] font-medium hover:underline"
            >
              Edit
            </button>
          )}
        </div>

        {admin.isSuperAdmin ? (
          <p className="text-xs text-gray-500">Super Admin has full access to all platform areas.</p>
        ) : editMode ? (
          <>
            <PermissionPicker value={perms} onChange={setPerms} />
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline" size="sm"
                onClick={() => { setEditMode(false); setPerms(admin.permissions); }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                loading={updateMutation.isPending}
                onClick={() => updateMutation.mutate(perms)}
              >
                Save
              </Button>
            </div>
          </>
        ) : admin.permissions.length === 0 ? (
          <p className="text-xs text-gray-400 italic">No permissions assigned</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {admin.permissions.map(p => (
              <span key={p} className="text-xs px-2 py-0.5 bg-[#0A3828]/8 text-[#0A3828] rounded-full font-medium">
                {p.replace('MANAGE_', '').toLowerCase()}
              </span>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

export default function AdminStaff() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [newPerms, setNewPerms] = useState<string[]>([]);

  const { data: admins = [], isLoading } = useQuery({
    queryKey: ['admin-staff'],
    queryFn: () => getAllAdmins().then(r => r.data.data || []),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateForm>();

  const createMutation = useMutation({
    mutationFn: (data: CreateForm) => createAdmin({ ...data, permissions: newPerms }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-staff'] });
      toast.success('Admin created — credentials emailed');
      setShowModal(false);
      reset();
      setNewPerms([]);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Create failed'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck size={20} className="text-amber-600" />
            Admin Staff
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage admin users and their permissions</p>
        </div>
        <Button onClick={() => setShowModal(true)} icon={<UserPlus size={16} />}>
          Add Admin
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size={32} /></div>
      ) : admins.length === 0 ? (
        <Card className="p-8">
          <EmptyState icon={<ShieldCheck size={28} />} title="No admins yet" />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {admins.map(a => <AdminCard key={a.id} admin={a} />)}
        </div>
      )}

      {/* Create Admin Modal */}
      <Modal
        open={showModal}
        onClose={() => { setShowModal(false); reset(); setNewPerms([]); }}
        title="Add New Admin"
        size="lg"
      >
        <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="First Name" required
              {...register('firstName', { required: 'Required' })}
              error={errors.firstName?.message}
            />
            <Input
              label="Last Name" required
              {...register('lastName', { required: 'Required' })}
              error={errors.lastName?.message}
            />
          </div>
          <Input
            label="Email" type="email" required leftIcon={<Mail size={15} />}
            {...register('email', { required: 'Required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })}
            error={errors.email?.message}
          />
          <Input
            label="Phone Number" required leftIcon={<Phone size={15} />}
            {...register('phone', { required: 'Required' })}
            error={errors.phone?.message}
          />
          <Input
            label="Temporary Password" required leftIcon={<Key size={15} />}
            {...register('password', { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } })}
            error={errors.password?.message}
            hint="Admin will receive this by email and should change after first login"
          />

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Assign Permissions</label>
            <PermissionPicker value={newPerms} onChange={setNewPerms} />
            {newPerms.length === 0 && (
              <p className="text-xs text-amber-600 mt-2">⚠ No permissions selected — this admin will only see the Overview page</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => { setShowModal(false); reset(); setNewPerms([]); }}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={createMutation.isPending}>
              Create Admin
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
