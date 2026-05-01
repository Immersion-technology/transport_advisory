import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { User, Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { updateProfile, changePassword } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { formatDate } from '../utils';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Lock },
];

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl overflow-x-auto -mx-4 sm:mx-0 sm:w-fit px-4 sm:px-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && <ProfileTab user={user} updateUser={updateUser} />}
      {activeTab === 'security' && <SecurityTab />}
    </div>
  );
}

function ProfileTab({ user, updateUser }: any) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
    },
  });

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (res) => {
      updateUser(res.data.data);
      toast.success('Profile updated');
    },
    onError: () => toast.error('Update failed'),
  });

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-[#0A3828] rounded-2xl flex items-center justify-center text-white text-xl font-bold">
          {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{user?.firstName} {user?.lastName}</h3>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <p className="text-xs text-gray-400 mt-0.5">Member since {user?.createdAt ? formatDate(user.createdAt) : '—'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="First name" {...register('firstName', { required: 'Required' })} error={errors.firstName?.message as string} />
          <Input label="Last name" {...register('lastName', { required: 'Required' })} error={errors.lastName?.message as string} />
        </div>
        <Input label="Email" value={user?.email} disabled className="bg-gray-50 text-gray-500" />
        <Input label="Phone number" {...register('phone', { required: 'Required' })} error={errors.phone?.message as string} />
        <Button type="submit" loading={mutation.isPending}>Save Changes</Button>
      </form>
    </Card>
  );
}

function SecurityTab() {
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm<{
    currentPassword: string; newPassword: string; confirmPassword: string;
  }>();
  const pwd = watch('newPassword');

  const mutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully');
      setShowForm(false);
      reset();
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to change password'),
  });

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-gray-900">Password</h3>
          <p className="text-sm text-gray-500">Update your account password</p>
        </div>
        {!showForm && (
          <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>Change Password</Button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(data => mutation.mutate(data))} className="space-y-4">
          <Input label="Current password" type="password" required {...register('currentPassword', { required: 'Required' })} error={errors.currentPassword?.message as string} />
          <Input label="New password" type="password" required {...register('newPassword', { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } })} error={errors.newPassword?.message as string} />
          <Input label="Confirm new password" type="password" required {...register('confirmPassword', { required: 'Required', validate: v => v === pwd || 'Passwords do not match' })} error={errors.confirmPassword?.message as string} />
          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => { setShowForm(false); reset(); }}>Cancel</Button>
            <Button type="submit" loading={mutation.isPending}>Update Password</Button>
          </div>
        </form>
      )}
    </Card>
  );
}

