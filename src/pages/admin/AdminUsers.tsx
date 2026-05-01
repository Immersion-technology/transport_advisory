import { useQuery } from '@tanstack/react-query';
import { Users, Car, FileText } from 'lucide-react';
import { getAdminUsers } from '../../api/admin';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';
import { formatDate } from '../../utils';

export default function AdminUsers() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => getAdminUsers().then(r => r.data.data || []),
  });

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
                  {['Name', 'Email', 'Phone', 'Vehicles', 'Applications', 'Joined'].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-gray-500 px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user: any) => (
                  <tr key={user.id} className="border-t border-gray-50 hover:bg-gray-50/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#0A3828] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
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
                    <td className="px-4 py-3 text-xs text-gray-400">{formatDate(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
