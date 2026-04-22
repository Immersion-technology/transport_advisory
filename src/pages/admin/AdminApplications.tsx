import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, FileText, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { getAdminApplications, updateApplicationStatus, uploadCompletedDoc } from '../../api/admin';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import { formatDate, formatNaira, applicationStatusColor, docTypeLabel } from '../../utils';
import { Application, ApplicationStatus, DocumentType } from '../../types';

const STATUS_OPTIONS: ApplicationStatus[] = ['PENDING', 'PROCESSING', 'SUBMITTED', 'READY', 'DELIVERED', 'CANCELLED'];

export default function AdminApplications() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [statusModal, setStatusModal] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['admin-applications', filterStatus],
    queryFn: () => getAdminApplications({ status: filterStatus || undefined }).then(r => r.data.data || []),
  });

  const { register, handleSubmit, reset } = useForm<{ status: string; notes: string }>();

  const statusMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: string; notes?: string } }) =>
      updateApplicationStatus(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-applications'] });
      toast.success('Status updated');
      setStatusModal(false);
      reset();
    },
    onError: () => toast.error('Failed to update'),
  });

  const uploadMutation = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => uploadCompletedDoc(id, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-applications'] });
      toast.success('Document uploaded');
      setUploadModal(false);
      setUploadFile(null);
    },
    onError: () => toast.error('Upload failed'),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start sm:items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Applications</h2>
          <p className="text-sm text-gray-500 mt-0.5">{applications.length} applications</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:border-[#0A3828]"
          >
            <option value="">All Status</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size={32} /></div>
      ) : applications.length === 0 ? (
        <Card className="p-8">
          <EmptyState icon={<FileText size={28} />} title="No applications found" />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['User', 'Vehicle', 'Document', 'Total', 'Paid', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-gray-500 px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {applications.map((app: Application) => (
                  <tr key={app.id} className="border-t border-gray-50 hover:bg-gray-50/40 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">
                        {(app as any).user?.firstName} {(app as any).user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{(app as any).user?.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{app.vehicle?.plateNumber}</p>
                      <p className="text-xs text-gray-500">{app.vehicle?.make} {app.vehicle?.model}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {docTypeLabel(app.documentType as DocumentType)}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {formatNaira(app.totalAmount)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        app.isPaid ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {app.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${applicationStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {formatDate(app.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="ghost" size="sm"
                          icon={<Eye size={13} />}
                          onClick={() => navigate(`/admin/applications/${app.id}`)}
                        >
                          View
                        </Button>
                        <Button
                          variant="outline" size="sm"
                          onClick={() => { setSelectedApp(app); setStatusModal(true); }}
                        >
                          Status
                        </Button>
                        <Button
                          variant="outline" size="sm"
                          icon={<Upload size={13} />}
                          onClick={() => { setSelectedApp(app); setUploadModal(true); }}
                          disabled={!app.isPaid}
                        >
                          Upload
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Status Modal */}
      <Modal open={statusModal} onClose={() => setStatusModal(false)} title="Update Application Status" size="sm">
        <form onSubmit={handleSubmit(data => {
          if (!selectedApp) return;
          statusMutation.mutate({ id: selectedApp.id, data: { status: data.status, notes: data.notes } });
        })} className="space-y-4">
          <Select
            label="New Status"
            required
            {...register('status', { required: 'Required' })}
            options={STATUS_OPTIONS.map(s => ({ value: s, label: s }))}
            placeholder="Select status"
          />
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Notes (optional)</label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white border border-gray-200 focus:border-[#0A3828] focus:ring-2 focus:ring-[#0A3828]/10 outline-none resize-none"
              placeholder="Optional notes for the user..."
            />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setStatusModal(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" loading={statusMutation.isPending}>Update</Button>
          </div>
        </form>
      </Modal>

      {/* Upload Modal */}
      <Modal open={uploadModal} onClose={() => setUploadModal(false)} title="Upload Completed Document" size="sm">
        <div className="space-y-4">
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              uploadFile ? 'border-[#0A3828] bg-[#0A3828]/5' : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => document.getElementById('doc-upload')?.click()}
          >
            <Upload size={24} className="mx-auto text-gray-400 mb-2" />
            {uploadFile ? (
              <p className="text-sm font-medium text-[#0A3828]">{uploadFile.name}</p>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-700">Click to select file</p>
                <p className="text-xs text-gray-500 mt-1">PDF, JPG, or PNG</p>
              </>
            )}
            <input
              id="doc-upload"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={e => setUploadFile(e.target.files?.[0] || null)}
            />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setUploadModal(false)}>Cancel</Button>
            <Button
              className="flex-1"
              loading={uploadMutation.isPending}
              disabled={!uploadFile}
              onClick={() => {
                if (!selectedApp || !uploadFile) return;
                uploadMutation.mutate({ id: selectedApp.id, file: uploadFile });
              }}
            >
              Upload
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
