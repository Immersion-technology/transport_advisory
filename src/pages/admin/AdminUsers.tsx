import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Car, FileText, ShieldOff, ShieldX, ShieldCheck, X, AlertTriangle } from 'lucide-react';
import { getAdminUsers, updateUserStatus } from '../../api/admin';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';
import { formatDate } from '../../utils';

type ActionType = 'SUSPEND' | 'BLOCK' | 'ACTIVATE';

interface ModalState {
  userId: string;
  firstName: string;
  lastName: string;
  action: ActionType;
}

function StatusBadge({ isActive, suspensionReason }: { isActive: boolean; suspensionReason?: string | null }) {
  if (isActive) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 text-green-700 text-xs font-semibold border border-green-100">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
        Active
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-xs font-semibold border border-red-100 cursor-default"
      title={suspensionReason || undefined}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
      Suspended
    </span>
  );
}

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<ModalState | null>(null);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const reasonRef = useRef<HTMLTextAreaElement>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => getAdminUsers().then(r => r.data.data || []),
  });

  const mutation = useMutation({
    mutationFn: ({ id, action, reason }: { id: string; action: ActionType; reason?: string }) =>
      updateUserStatus(id, { action, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setModal(null);
      setReason('');
      setError('');
    },
    onError: () => setError('Failed to update user status. Please try again.'),
  });

  useEffect(() => {
    if (modal && modal.action !== 'ACTIVATE') {
      setTimeout(() => reasonRef.current?.focus(), 50);
    }
  }, [modal]);

  const openModal = (user: any, action: ActionType) => {
    setReason('');
    setError('');
    setModal({ userId: user.id, firstName: user.firstName, lastName: user.lastName, action });
  };

  const handleConfirm = () => {
    if (!modal) return;
    if (modal.action !== 'ACTIVATE' && !reason.trim()) {
      setError('Please provide a reason.');
      return;
    }
    mutation.mutate({ id: modal.userId, action: modal.action, reason: reason.trim() || undefined });
  };

  const actionMeta: Record<ActionType, { label: string; icon: React.ReactNode; color: string; description: string }> = {
    SUSPEND: {
      label: 'Suspend User',
      icon: <ShieldOff size={18} />,
      color: 'text-amber-600',
      description: 'The user will be notified by email with the reason you provide.',
    },
    BLOCK: {
      label: 'Block User',
      icon: <ShieldX size={18} />,
      color: 'text-red-600',
      description: 'The user will be permanently blocked and notified by email.',
    },
    ACTIVATE: {
      label: 'Reactivate User',
      icon: <ShieldCheck size={18} />,
      color: 'text-green-600',
      description: 'The user will regain access and receive an email notification.',
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Users</h2>
        <p className="text-sm text-gray-500 mt-0.5">{users.length} registered users</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size={32} /></div>
      ) : users.length === 0 ? (
        <Card className="p-8">
          <EmptyState icon={<Users size={28} />} title="No users yet" />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Name', 'Email', 'Phone', 'Vehicles', 'Applications', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-gray-500 px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user: any) => (
                  <tr key={user.id} className="border-t border-gray-50 hover:bg-gray-50/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${user.isActive ? 'bg-[#0A3828]' : 'bg-gray-400'}`}>
                          {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{user.phone}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Car size={13} />
                        {user._count?.vehicles || 0}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <FileText size={13} />
                        {user._count?.applications || 0}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge isActive={user.isActive} suspensionReason={user.suspensionReason} />
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {user.isActive ? (
                          <>
                            <button
                              onClick={() => openModal(user, 'SUSPEND')}
                              className="p-1.5 rounded-lg text-amber-500 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                              title="Suspend user"
                            >
                              <ShieldOff size={15} />
                            </button>
                            <button
                              onClick={() => openModal(user, 'BLOCK')}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                              title="Block user"
                            >
                              <ShieldX size={15} />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => openModal(user, 'ACTIVATE')}
                            className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors"
                            title="Reactivate user"
                          >
                            <ShieldCheck size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Action modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div className={`flex items-center gap-2 font-semibold text-base ${actionMeta[modal.action].color}`}>
                {actionMeta[modal.action].icon}
                {actionMeta[modal.action].label}
              </div>
              <button
                onClick={() => { setModal(null); setReason(''); setError(''); }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-1">
              User: <span className="font-semibold text-gray-900">{modal.firstName} {modal.lastName}</span>
            </p>
            <p className="text-sm text-gray-500 mb-5">{actionMeta[modal.action].description}</p>

            {modal.action !== 'ACTIVATE' && (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  ref={reasonRef}
                  value={reason}
                  onChange={e => { setReason(e.target.value); setError(''); }}
                  rows={3}
                  placeholder="Describe why this account is being suspended/blocked. This will be sent to the user."
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-[#0A3828]/20 focus:border-[#0A3828] transition-all"
                />
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
                <AlertTriangle size={14} />
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setModal(null); setReason(''); setError(''); }}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                disabled={mutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={mutation.isPending}
                className={`flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors disabled:opacity-60 ${
                  modal.action === 'ACTIVATE'
                    ? 'bg-green-600 hover:bg-green-700'
                    : modal.action === 'SUSPEND'
                    ? 'bg-amber-500 hover:bg-amber-600'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {mutation.isPending ? 'Processing…' : actionMeta[modal.action].label}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
