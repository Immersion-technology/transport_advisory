import { useQuery } from '@tanstack/react-query';
import { Bell, Phone, Calendar, AlertCircle } from 'lucide-react';
import { getUnconfirmedReminders } from '../../api/admin';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import Spinner from '../../components/ui/Spinner';
import { formatDate, docTypeLabel } from '../../utils';
import { DocumentType } from '../../types';

export default function AdminReminders() {
  const { data: reminders = [], isLoading } = useQuery({
    queryKey: ['admin-reminders'],
    queryFn: () => getUnconfirmedReminders().then(r => r.data.data || []),
    refetchInterval: 60000,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Unconfirmed Reminder Queue</h2>
        <p className="text-sm text-gray-500 mt-0.5">Users who haven't acknowledged their document expiry reminders</p>
      </div>

      {(reminders as any[]).length > 0 && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <AlertCircle size={20} className="text-red-600" />
          <p className="text-sm text-red-800 font-medium">
            {(reminders as any[]).length} users need a phone follow-up call
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size={32} /></div>
      ) : (reminders as any[]).length === 0 ? (
        <Card className="p-8">
          <EmptyState
            icon={<Bell size={28} />}
            title="No unconfirmed reminders"
            description="All users have acknowledged their reminder emails. Great engagement!"
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {(reminders as any[]).map(reminder => (
            <Card key={reminder.id} className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center">
                    <Bell size={20} className="text-red-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900 text-sm">
                        {reminder.document?.vehicle?.user?.firstName} {reminder.document?.vehicle?.user?.lastName}
                      </p>
                      <Badge variant={reminder.triggerDays === 7 ? 'danger' : 'warning'}>
                        {reminder.triggerDays}-day reminder
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      {docTypeLabel(reminder.document?.type as DocumentType)} · {reminder.document?.vehicle?.plateNumber}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Reminder sent {formatDate(reminder.sentAt)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 items-end">
                  <a
                    href={`tel:${reminder.document?.vehicle?.user?.phone}`}
                    className="flex items-center gap-2 px-3 py-2 bg-[#0A3828] text-white rounded-lg text-xs font-medium hover:bg-[#0d4a35] transition-colors"
                  >
                    <Phone size={13} />
                    {reminder.document?.vehicle?.user?.phone}
                  </a>
                  <p className="text-xs text-gray-400">{reminder.document?.vehicle?.user?.email}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
