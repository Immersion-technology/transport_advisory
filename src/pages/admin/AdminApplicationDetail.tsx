import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, FileText, User as UserIcon, Car, Upload, Clock, CheckCircle,
  Package, Download, Phone, Mail, Calendar, MapPin, CreditCard,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { getAdminApplication, updateApplicationStatus, uploadCompletedDoc } from '../../api/admin';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import { PageLoader } from '../../components/ui/Spinner';
import { formatDate, formatNaira, applicationStatusColor, docTypeLabel } from '../../utils';
import type { ApplicationStatus, DocumentType } from '../../types';

const STATUS_OPTIONS: ApplicationStatus[] = ['PENDING', 'PROCESSING', 'SUBMITTED', 'READY', 'DELIVERED', 'CANCELLED'];

export default function AdminApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [statusModal, setStatusModal] = useState(false);
  const [uploadModal, setUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const { data: app, isLoading } = useQuery({
    queryKey: ['admin-application', id],
    queryFn: () => getAdminApplication(id!).then(r => r.data.data),
  });

  const { register, handleSubmit, reset } = useForm<{ status: string; notes: string }>();

  const statusMutation = useMutation({
    mutationFn: (data: { status: string; notes?: string }) =>
      updateApplicationStatus(id!, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-application', id] });
      qc.invalidateQueries({ queryKey: ['admin-applications'] });
      toast.success('Status updated — user notified');
      setStatusModal(false);
      reset();
    },
    onError: () => toast.error('Failed to update'),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadCompletedDoc(id!, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-application', id] });
      toast.success('Document uploaded — user notified');
      setUploadModal(false);
      setUploadFile(null);
    },
    onError: () => toast.error('Upload failed'),
  });

  if (isLoading) return <PageLoader />;
  if (!app) return <div className="p-8 text-gray-500">Application not found</div>;

  const user = (app as any).user;
  const vehicle = app.vehicle as any;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/admin/applications')}
          className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors shadow-sm"
        >
          <ArrowLeft size={17} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">
              {docTypeLabel(app.documentType as DocumentType)}
            </h2>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${applicationStatusColor(app.status)}`}>
              {app.status}
            </span>
            {app.isPaid ? (
              <Badge variant="success">Paid</Badge>
            ) : (
              <Badge variant="warning">Unpaid</Badge>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5 font-mono">#{app.id.slice(0, 8).toUpperCase()}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setStatusModal(true)}
            icon={<Clock size={16} />}
          >
            Update Status
          </Button>
          <Button
            onClick={() => setUploadModal(true)}
            icon={<Upload size={16} />}
            disabled={!app.isPaid}
          >
            Upload Document
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Info */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <UserIcon size={16} className="text-gray-500" />
              <h3 className="font-semibold text-gray-900">Applicant</h3>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-[#0A3828] rounded-2xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="text-sm font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 flex items-center gap-1"><Mail size={10} />Email</p>
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 flex items-center gap-1"><Phone size={10} />Phone</p>
                  <a href={`tel:${user?.phone}`} className="text-sm font-medium text-[#0A3828] hover:underline">{user?.phone}</a>
                </div>
              </div>
            </div>
          </Card>

          {/* Vehicle Info */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Car size={16} className="text-gray-500" />
              <h3 className="font-semibold text-gray-900">Vehicle</h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                <Car size={22} className="text-blue-600" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
                <div>
                  <p className="text-xs text-gray-500">Plate</p>
                  <p className="text-sm font-bold text-gray-900">{vehicle?.plateNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Make</p>
                  <p className="text-sm font-medium text-gray-900">{vehicle?.make}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Model</p>
                  <p className="text-sm font-medium text-gray-900">{vehicle?.model}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Year</p>
                  <p className="text-sm font-medium text-gray-900">{vehicle?.year}</p>
                </div>
                <div className="col-span-2 sm:col-span-4">
                  <p className="text-xs text-gray-500">State of Registration</p>
                  <p className="text-sm font-medium text-gray-900">{vehicle?.stateOfRegistration}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Supporting Documents */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-gray-500" />
                <h3 className="font-semibold text-gray-900">Supporting Documents</h3>
              </div>
              <span className="text-xs text-gray-500">
                {app.documents?.length || 0} uploaded by user
              </span>
            </div>
            {(!app.documents || app.documents.length === 0) ? (
              <p className="text-sm text-gray-500 text-center py-6">No supporting documents uploaded</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {app.documents.map(doc => (
                  <a
                    key={doc.id}
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText size={16} className="text-gray-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{doc.fileName}</p>
                      <p className="text-xs text-gray-500">{formatDate(doc.uploadedAt)}</p>
                    </div>
                    <Download size={14} className="text-gray-400" />
                  </a>
                ))}
              </div>
            )}
          </Card>

          {/* Completed Document */}
          {app.completedFileUrl && (
            <Card className="p-5 border-emerald-200 bg-emerald-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <CheckCircle size={20} className="text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Completed Document</h3>
                    <p className="text-xs text-gray-500">Uploaded {app.completedAt ? formatDate(app.completedAt) : '—'}</p>
                  </div>
                </div>
                <a href={app.completedFileUrl} target="_blank" rel="noreferrer">
                  <Button variant="secondary" size="sm" icon={<Download size={14} />}>
                    Download
                  </Button>
                </a>
              </div>
            </Card>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Fees Summary */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={16} className="text-gray-500" />
              <h3 className="font-semibold text-gray-900">Payment</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Government fee</span>
                <span className="font-medium">{formatNaira(app.governmentFee)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Service charge</span>
                <span className="font-medium">{formatNaira(app.serviceFee)}</span>
              </div>
              {app.delivery && (
                <div className="flex justify-between text-gray-600">
                  <span>Delivery ({app.delivery.tier})</span>
                  <span className="font-medium">{formatNaira(app.delivery.fee)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>{formatNaira(app.totalAmount)}</span>
              </div>
              {app.paystackRef && (
                <p className="text-xs text-gray-400 pt-2 border-t border-gray-100 font-mono break-all">
                  Ref: {app.paystackRef}
                </p>
              )}
              {app.paidAt && (
                <p className="text-xs text-emerald-600 flex items-center gap-1">
                  <CheckCircle size={12} />
                  Paid {formatDate(app.paidAt)}
                </p>
              )}
            </div>
          </Card>

          {/* Delivery */}
          {app.delivery && (
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Package size={16} className="text-gray-500" />
                <h3 className="font-semibold text-gray-900">Delivery</h3>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <MapPin size={13} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-900">{app.delivery.address}</p>
                    <p>{app.delivery.city}, {app.delivery.state}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <UserIcon size={13} className="text-gray-400" />
                  <span>{app.delivery.recipientName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-gray-400" />
                  <a href={`tel:${app.delivery.recipientPhone}`} className="text-[#0A3828] hover:underline">
                    {app.delivery.recipientPhone}
                  </a>
                </div>
                {app.delivery.trackingCode && (
                  <div className="p-2 bg-gray-50 rounded-lg font-mono text-xs">
                    {app.delivery.trackingCode}
                  </div>
                )}
                <div className="pt-2 border-t border-gray-100">
                  <Badge variant={
                    app.delivery.status === 'DELIVERED' ? 'success' :
                    app.delivery.status === 'DISPATCHED' ? 'warning' : 'neutral'
                  }>
                    {app.delivery.status}
                  </Badge>
                </div>
              </div>
            </Card>
          )}

          {/* Status Timeline */}
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={16} className="text-gray-500" />
              <h3 className="font-semibold text-gray-900">Timeline</h3>
            </div>
            <div className="space-y-3">
              {app.statusHistory?.map((h, i) => (
                <div key={h.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-2.5 h-2.5 rounded-full ${i === 0 ? 'bg-[#0A3828]' : 'bg-gray-300'}`} />
                    {i < (app.statusHistory?.length || 0) - 1 && (
                      <div className="w-0.5 flex-1 bg-gray-200 my-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-2">
                    <p className="text-sm font-medium text-gray-900">{h.status}</p>
                    {h.notes && <p className="text-xs text-gray-500 mt-0.5">{h.notes}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(h.changedAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Status Modal */}
      <Modal open={statusModal} onClose={() => setStatusModal(false)} title="Update Status" size="sm">
        <form onSubmit={handleSubmit(data => statusMutation.mutate(data))} className="space-y-4">
          <Select
            label="New Status"
            required
            {...register('status', { required: 'Required' })}
            options={STATUS_OPTIONS.map(s => ({ value: s, label: s }))}
            placeholder="Select status"
          />
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Notes (sent to user)</label>
            <textarea
              {...register('notes')}
              rows={3}
              placeholder="Optional note to include in the user notification..."
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white border border-gray-200 focus:border-[#0A3828] focus:ring-2 focus:ring-[#0A3828]/10 outline-none resize-none"
            />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setStatusModal(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" loading={statusMutation.isPending}>Update & Notify</Button>
          </div>
        </form>
      </Modal>

      {/* Upload Modal */}
      <Modal open={uploadModal} onClose={() => setUploadModal(false)} title="Upload Completed Document" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Upload the finished {docTypeLabel(app.documentType as DocumentType)} PDF. The user will receive an email with a download link.
          </p>
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              uploadFile ? 'border-[#0A3828] bg-[#0A3828]/5' : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => document.getElementById('doc-upload-detail')?.click()}
          >
            <Upload size={24} className="mx-auto text-gray-400 mb-2" />
            {uploadFile ? (
              <p className="text-sm font-medium text-[#0A3828]">{uploadFile.name}</p>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-700">Click to select file</p>
                <p className="text-xs text-gray-500 mt-1">PDF, JPG, or PNG · max 10MB</p>
              </>
            )}
            <input
              id="doc-upload-detail"
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
              onClick={() => uploadFile && uploadMutation.mutate(uploadFile)}
            >
              Upload & Notify User
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
