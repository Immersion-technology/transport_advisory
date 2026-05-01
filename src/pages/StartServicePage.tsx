import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, CheckCircle, Mail, ShieldCheck,
  Car, RefreshCw, FilePlus, AlertTriangle, Upload, X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { LogoMark } from '../components/ui/Logo';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import YearPicker from '../components/ui/YearPicker';
import * as authApi from '../api/auth';
import * as publicApi from '../api/public';
import type { CheckoutPayload } from '../api/auth';
import type { PricingMatrix, UploadResult } from '../api/public';
import type { DocumentType } from '../types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormShape {
  // Step 1
  kind: 'RENEWAL' | 'FRESH';
  documentType: DocumentType;
  // Step 2 — shared
  plateNumber: string;
  // Step 2 — FRESH only
  make: string;
  model: string;
  year: number;
  stateOfRegistration: string;
  colour: string;
  chassisNumber: string;
  engineNumber: string;
  categoryId: string;
  // Step 3 — applicant
  firstName: string;
  lastName: string;
  othernames: string;
  gender: '' | 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  address: string;
  email: string;
  phone: string;
  // Step 3 — delivery
  deliveryTier: '' | 'STANDARD' | 'EXPRESS' | 'SAME_DAY';
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DOCUMENT_OPTIONS_RENEWAL = [
  { value: 'MOTOR_INSURANCE', label: 'Motor Insurance' },
  { value: 'VEHICLE_LICENSE', label: 'Vehicle Licence' },
  { value: 'ROADWORTHINESS', label: 'Roadworthiness Certificate' },
  { value: 'HACKNEY_PERMIT', label: 'Commercial Vehicles Permit (Hackney)' },
];

const DOCUMENT_OPTIONS_FRESH = [
  ...DOCUMENT_OPTIONS_RENEWAL,
  { value: 'CHANGE_OF_OWNERSHIP', label: 'Change of Ownership' },
];

const DELIVERY_OPTIONS = [
  { value: '', label: 'No delivery (soft copy only)' },
  { value: 'STANDARD', label: 'Standard delivery (3–5 days) — ₦2,000' },
  { value: 'EXPRESS', label: 'Express delivery (1–2 days) — ₦4,500' },
  { value: 'SAME_DAY', label: 'Same-day Lagos delivery — ₦8,000' },
];

const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
  { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
];

const NIGERIAN_STATES = [
  'Lagos', 'Abuja', 'Ogun', 'Oyo', 'Rivers', 'Kano', 'Kaduna',
  'Anambra', 'Enugu', 'Edo', 'Delta', 'Imo', 'Plateau', 'Cross River',
  'Akwa Ibom', 'Other',
];

const STEP_LABELS = ['Service', 'Vehicle', 'Your Details', 'Review'];

// ─── Photo upload widget ───────────────────────────────────────────────────────

interface PhotoInputProps {
  label: string;
  required?: boolean;
  kind: publicApi.UploadKind;
  value?: UploadResult | null;
  onChange: (result: UploadResult | null) => void;
}

function PhotoInput({ label, required, kind, value, onChange }: PhotoInputProps) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    setUploading(true);
    try {
      const result = await publicApi.uploadPhoto(file, kind);
      onChange(result);
    } catch {
      toast.error('Photo upload failed — please try again');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <p className="text-sm font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </p>
      {value ? (
        <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <img src={value.url} alt="preview" className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
          <span className="text-xs text-emerald-800 font-medium flex-1 truncate">Photo uploaded</span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-emerald-700 hover:text-red-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={uploading}
          className="w-full flex flex-col items-center gap-2 py-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-[#0A3828] hover:bg-emerald-50/40 transition-all disabled:opacity-50"
        >
          {uploading ? (
            <div className="w-5 h-5 border-2 border-[#0A3828] border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload size={20} className="text-gray-400" />
          )}
          <span className="text-sm text-gray-500">{uploading ? 'Uploading…' : 'Tap to upload photo'}</span>
        </button>
      )}
      <input
        ref={ref}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNaira(n: number) {
  return '₦' + n.toLocaleString('en-NG');
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StartServicePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [submitting, setSubmitting] = useState(false);
  const [emailSentTo, setEmailSentTo] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);

  // Photo upload state (outside RHF — binary data)
  const [chassisPhoto, setChassisPhoto] = useState<UploadResult | null>(null);
  const [licensePhoto, setLicensePhoto] = useState<UploadResult | null>(null);

  // Pricing matrix (loaded once)
  const [pricing, setPricing] = useState<PricingMatrix | null>(null);

  useEffect(() => {
    publicApi.getPublicPricing()
      .then((r) => setPricing(r.data.data ?? null))
      .catch(() => { /* non-fatal — quote just won't show */ });
  }, []);

  const {
    register, control, handleSubmit, watch, trigger, setValue,
    formState: { errors },
  } = useForm<FormShape>({
    defaultValues: {
      kind: 'RENEWAL',
      documentType: 'VEHICLE_LICENSE',
      stateOfRegistration: 'Lagos',
      deliveryState: 'Lagos',
      deliveryTier: '',
      year: 2020,
      gender: '',
    },
  });

  const kind = watch('kind');
  const documentType = watch('documentType');
  const deliveryTier = watch('deliveryTier');
  const categoryId = watch('categoryId');

  // Change of Ownership only available under FRESH
  const documentOptions = kind === 'FRESH' ? DOCUMENT_OPTIONS_FRESH : DOCUMENT_OPTIONS_RENEWAL;
  if (kind !== 'FRESH' && documentType === 'CHANGE_OF_OWNERSHIP') {
    setValue('documentType', 'VEHICLE_LICENSE');
  }

  // Category options from pricing matrix
  const categoryOptions = pricing
    ? pricing.categories
        .filter((c) => c.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((c) => ({ value: c.id, label: c.label }))
    : [];

  // Compute price quote
  const quote = pricing && categoryId && documentType
    ? publicApi.computeQuote(pricing, categoryId, documentType as DocumentType)
    : null;

  const isFresh = kind === 'FRESH';
  const needsLicensePhoto = documentType === 'CHANGE_OF_OWNERSHIP';

  // ── Navigation ────────────────────────────────────────────────────────────

  const step1Fields: (keyof FormShape)[] = ['kind', 'documentType'];

  const step2FieldsRenewal: (keyof FormShape)[] = ['plateNumber'];
  const step2FieldsFresh: (keyof FormShape)[] = [
    'plateNumber', 'make', 'model', 'year', 'stateOfRegistration',
    'colour', 'chassisNumber', 'engineNumber', 'categoryId',
  ];

  const step3Fields: (keyof FormShape)[] = [
    'firstName', 'lastName', 'email', 'phone', 'address',
  ];

  const goNext = async () => {
    let fields: (keyof FormShape)[] = [];
    if (step === 1) fields = step1Fields;
    else if (step === 2) fields = isFresh ? step2FieldsFresh : step2FieldsRenewal;
    else if (step === 3) fields = step3Fields;

    // Validate photo for FRESH
    if (step === 2 && isFresh) {
      if (!chassisPhoto) { toast.error('Please upload a photo of the chassis number'); return; }
      if (needsLicensePhoto && !licensePhoto) { toast.error('Please upload a photo of the vehicle licence'); return; }
    }

    const ok = await trigger(fields as any);
    if (ok) setStep((s) => (s < 4 ? (s + 1) as 1 | 2 | 3 | 4 : s));
  };

  const onSubmit = async (data: FormShape) => {
    setSubmitting(true);
    try {
      const payload: CheckoutPayload = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        othernames: data.othernames?.trim() || undefined,
        email: data.email.trim().toLowerCase(),
        phone: data.phone.trim(),
        gender: (data.gender as CheckoutPayload['gender']) || undefined,
        address: data.address.trim() || undefined,
        vehicle: isFresh
          ? {
              plateNumber: data.plateNumber.trim().toUpperCase(),
              make: data.make.trim(),
              model: data.model.trim(),
              year: Number(data.year),
              stateOfRegistration: data.stateOfRegistration,
              colour: data.colour.trim(),
              chassisNumber: data.chassisNumber.trim(),
              engineNumber: data.engineNumber.trim(),
              categoryId: data.categoryId,
              chassisPhotoUrl: chassisPhoto?.url,
              chassisPhotoPublicId: chassisPhoto?.publicId,
              ...(needsLicensePhoto && licensePhoto && {
                licensePhotoUrl: licensePhoto.url,
                licensePhotoPublicId: licensePhoto.publicId,
              }),
            }
          : {
              plateNumber: data.plateNumber.trim().toUpperCase(),
            },
        service: {
          documentType: data.documentType,
          kind: data.kind,
          ...(data.deliveryTier && {
            delivery: {
              tier: data.deliveryTier as 'STANDARD' | 'EXPRESS' | 'SAME_DAY',
              address: data.deliveryAddress.trim(),
              city: data.deliveryCity.trim(),
              state: data.deliveryState,
            },
          }),
        },
      };

      const res = await authApi.checkout(payload);
      const { isNewUser: created, emailSentTo: email } = res.data.data!;
      setIsNewUser(created);
      setEmailSentTo(email);
      setStep(4);
      toast.success(created ? 'Account created — check your email!' : 'Login link sent — check your email!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit your request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F5F7F2]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <LogoMark size={32} />
            <div>
              <p className="text-sm font-bold text-gray-900 leading-none">Transport Advisory Services</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Vehicle Compliance · Not Government Owned</p>
            </div>
          </Link>
          <Link to="/" className="text-sm text-gray-500 hover:text-gray-900 inline-flex items-center gap-1.5">
            <ArrowLeft size={14} /> Back home
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Stepper */}
        {step < 4 && (
          <div className="flex items-center justify-center gap-1.5 mb-8 overflow-x-auto pb-1">
            {STEP_LABELS.map((label, idx) => {
              const n = idx + 1;
              const done = step > n;
              const active = step === n;
              return (
                <div key={n} className="flex items-center gap-1.5 flex-shrink-0">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        done ? 'bg-[#0A3828] text-white' : active ? 'bg-[#0A3828] text-white' : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {done ? <CheckCircle size={13} /> : n}
                    </div>
                    <span className={`text-xs font-medium hidden sm:block ${active ? 'text-gray-900' : 'text-gray-400'}`}>
                      {label}
                    </span>
                  </div>
                  {n < 4 && <div className={`w-8 sm:w-12 h-px flex-shrink-0 ${done ? 'bg-[#0A3828]' : 'bg-gray-200'}`} />}
                </div>
              );
            })}
          </div>
        )}

        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6 sm:p-8"
        >
          {/* ── STEP 1: Service type ─────────────────────────────────────── */}
          {step === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); goNext(); }} className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">What do you need?</h1>
                <p className="text-sm text-gray-500 mt-1">Choose the service type and document</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'RENEWAL', label: 'Renewal', desc: 'Existing document', icon: RefreshCw },
                  { value: 'FRESH', label: 'New Application', desc: 'First-time / fresh', icon: FilePlus },
                ].map(({ value, label, desc, icon: Icon }) => (
                  <label
                    key={value}
                    className={`cursor-pointer rounded-2xl border-2 p-4 transition-all ${
                      kind === value ? 'border-[#0A3828] bg-emerald-50/40' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input type="radio" value={value} {...register('kind', { required: true })} className="sr-only" />
                    <Icon size={18} className={kind === value ? 'text-[#0A3828]' : 'text-gray-400'} />
                    <p className="font-semibold text-sm text-gray-900 mt-2">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </label>
                ))}
              </div>

              <div>
                <Select
                  label="Document"
                  required
                  options={documentOptions}
                  {...register('documentType', { required: 'Select a document' })}
                  error={errors.documentType?.message}
                />
                {kind === 'FRESH' && (
                  <p className="text-xs text-gray-500 mt-1.5">
                  </p>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" icon={<ArrowRight size={16} />}>Continue</Button>
              </div>
            </form>
          )}

          {/* ── STEP 2: Vehicle details ──────────────────────────────────── */}
          {step === 2 && (
            <form onSubmit={(e) => { e.preventDefault(); goNext(); }} className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isFresh ? 'Vehicle details' : 'Plate number'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {isFresh
                    ? 'Provide your vehicle information and chassis photo for the fresh application.'
                    : 'We only need your plate number — our team will fill in the remaining details.'}
                </p>
              </div>

              <Input
                label="Plate number"
                placeholder="e.g. LAG 234 AB"
                required
                {...register('plateNumber', {
                  required: 'Plate number is required',
                  minLength: { value: 6, message: 'Looks too short' },
                })}
                error={errors.plateNumber?.message}
                hint={isFresh ? undefined : 'We auto-check your insurance and document status from the vehicle database.'}
              />

              {isFresh && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Make"
                      placeholder="Toyota"
                      required
                      {...register('make', { required: 'Required' })}
                      error={errors.make?.message}
                    />
                    <Input
                      label="Model"
                      placeholder="Camry"
                      required
                      {...register('model', { required: 'Required' })}
                      error={errors.model?.message}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Controller
                      control={control}
                      name="year"
                      rules={{
                        required: 'Required',
                        min: { value: 1980, message: 'Too old' },
                        max: { value: new Date().getFullYear() + 1, message: 'Invalid year' },
                      }}
                      render={({ field }) => (
                        <YearPicker
                          label="Year"
                          required
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.year?.message as string | undefined}
                        />
                      )}
                    />
                    <Select
                      label="State of registration"
                      required
                      options={NIGERIAN_STATES.map((s) => ({ value: s, label: s }))}
                      {...register('stateOfRegistration', { required: true })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Colour"
                      placeholder="e.g. Silver"
                      required
                      {...register('colour', { required: 'Required' })}
                      error={errors.colour?.message}
                    />
                    <Select
                      label="Vehicle category"
                      required
                      options={categoryOptions.length ? categoryOptions : [{ value: '', label: 'Loading…' }]}
                      {...register('categoryId', { required: 'Select a category' })}
                      error={errors.categoryId?.message}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Chassis number"
                      placeholder="17-digit VIN"
                      required
                      {...register('chassisNumber', { required: 'Required' })}
                      error={errors.chassisNumber?.message}
                    />
                    <Input
                      label="Engine number"
                      placeholder="Engine serial"
                      required
                      {...register('engineNumber', { required: 'Required' })}
                      error={errors.engineNumber?.message}
                    />
                  </div>

                  <PhotoInput
                    label="Clear photo of chassis number on the vehicle"
                    required
                    kind="chassis"
                    value={chassisPhoto}
                    onChange={setChassisPhoto}
                  />

                  {needsLicensePhoto && (
                    <PhotoInput
                      label="Clear photo of current Vehicle Licence"
                      required
                      kind="license"
                      value={licensePhoto}
                      onChange={setLicensePhoto}
                    />
                  )}
                </>
              )}

              <div className="flex justify-between pt-2">
                <Button type="button" variant="outline" onClick={() => setStep(1)} icon={<ArrowLeft size={16} />}>
                  Back
                </Button>
                <Button type="submit" icon={<ArrowRight size={16} />}>Continue</Button>
              </div>
            </form>
          )}

          {/* ── STEP 3: Applicant details ────────────────────────────────── */}
          {step === 3 && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Your details</h1>
                <p className="text-sm text-gray-500 mt-1">We'll create your account automatically and send a login link to your email.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Surname"
                  required
                  {...register('lastName', { required: 'Required' })}
                  error={errors.lastName?.message}
                />
                <Input
                  label="First name"
                  required
                  {...register('firstName', { required: 'Required' })}
                  error={errors.firstName?.message}
                />
              </div>

              <Input
                label="Other names"
                placeholder="Middle name / other names (optional)"
                {...register('othernames')}
              />

              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Gender"
                  options={[{ value: '', label: 'Select…' }, ...GENDER_OPTIONS]}
                  {...register('gender')}
                />
                <Input
                  label="Phone number"
                  type="tel"
                  placeholder="08012345678"
                  required
                  {...register('phone', {
                    required: 'Phone is required',
                    minLength: { value: 10, message: 'Too short' },
                  })}
                  error={errors.phone?.message}
                />
              </div>

              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                required
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
                })}
                error={errors.email?.message}
                hint="We'll email your dashboard login link here."
              />

              <Input
                label="Home / delivery address"
                placeholder="Street, house number, area"
                required
                {...register('address', { required: 'Address is required' })}
                error={errors.address?.message}
              />

              {/* Delivery */}
              <div className="border-t border-gray-100 pt-5">
                <Select
                  label="Physical document delivery (optional)"
                  options={DELIVERY_OPTIONS}
                  {...register('deliveryTier')}
                />
                {deliveryTier && (
                  <div className="space-y-3 mt-3">
                    <Input
                      label="Delivery address"
                      placeholder="Street + house number"
                      required
                      {...register('deliveryAddress', {
                        required: deliveryTier ? 'Address is required' : false,
                      })}
                      error={errors.deliveryAddress?.message}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="City"
                        required
                        {...register('deliveryCity', {
                          required: deliveryTier ? 'City is required' : false,
                        })}
                        error={errors.deliveryCity?.message}
                      />
                      <Select
                        label="State"
                        required
                        options={NIGERIAN_STATES.map((s) => ({ value: s, label: s }))}
                        {...register('deliveryState', { required: !!deliveryTier })}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-3">
                <ShieldCheck size={18} className="text-emerald-700 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-emerald-900"></p>
                  <p className="text-xs text-emerald-800/80 mt-0.5">
                    A one-time login link will be sent to your email. You can set a password later from your dashboard.
                  </p>
                </div>
              </div>

              {/* Price preview (FRESH + categoryId set) */}
              {isFresh && quote && (
                <div className="bg-[#F5F7F2] border border-gray-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Estimated charges</p>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm text-gray-700">
                      <span>Government / base fee</span>
                      <span>{formatNaira(quote.basePrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-700">
                      <span>Service fee (15% VAT-inclusive)</span>
                      <span>{formatNaira(quote.serviceFee)}</span>
                    </div>
                    {quote.notes && (
                      <p className="text-xs text-gray-400 italic mt-1">{quote.notes}</p>
                    )}
                    <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-200 mt-2">
                      <span>Total</span>
                      <span>{formatNaira(quote.total)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Payment is due at checkout inside your dashboard.</p>
                </div>
              )}

              {isFresh && !quote && categoryId && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-xs text-amber-800">Pricing for this category is not yet set — an admin will confirm the total before payment.</p>
                </div>
              )}

              {!isFresh && (
                <div className="bg-[#F5F7F2] border border-gray-200 rounded-xl p-4">
                  <p className="text-xs text-gray-500">
                    Pricing for renewal applications is confirmed after vehicle details are verified.
                    You won't be charged until then.
                  </p>
                </div>
              )}

              <div className="flex justify-between pt-2">
                <Button type="button" variant="outline" onClick={() => setStep(2)} icon={<ArrowLeft size={16} />}>
                  Back
                </Button>
                <Button type="submit" loading={submitting} icon={<ArrowRight size={16} />}>
                  Submit & Send Link
                </Button>
              </div>
            </form>
          )}

          {/* ── STEP 4: Confirmation ─────────────────────────────────────── */}
          {step === 4 && emailSentTo && (
            <div className="text-center py-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
                <Mail size={26} className="text-emerald-700" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mt-5">
                {isNewUser ? 'Account created!' : 'You\'re all set!'}
              </h2>
              <p className="text-gray-600 mt-2 leading-relaxed max-w-md mx-auto">
                We've sent a {isNewUser ? 'welcome' : 'login'} link to{' '}
                <span className="font-semibold text-gray-900">{emailSentTo}</span>.
                Click it to access your dashboard and continue your application.
              </p>
              <p className="text-xs text-gray-500 mt-3">
                The link expires in 30 minutes and can only be used once. Didn't get it? Check spam, or{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="text-[#0A3828] font-semibold hover:underline"
                >
                  request a fresh link
                </button>.
              </p>

              <div className="mt-8 grid grid-cols-3 gap-3 max-w-md mx-auto">
                {[
                  { label: '✓ Reminders', desc: 'Always free' },
                  { label: '✓ Pay later', desc: 'Only at renewal' },
                  { label: '✓ Delivery', desc: 'Soft + physical' },
                ].map(({ label, desc }) => (
                  <div key={label} className="bg-[#F5F7F2] rounded-xl p-3 border border-gray-100">
                    <p className="text-xs font-bold text-[#0A3828]">{label}</p>
                    <p className="text-[11px] text-gray-500 mt-0.5">{desc}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Link to="/"><Button variant="outline">Back to home</Button></Link>
              </div>
            </div>
          )}
        </motion.div>

        {/* Caveat */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mt-8 bg-amber-50/80 border border-amber-200 rounded-2xl p-5"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle size={16} className="text-amber-700 flex-shrink-0 mt-0.5" />
            <div className="space-y-1.5 text-xs sm:text-sm text-amber-900/90 leading-relaxed">
              {/* <p>
                <span className="font-bold">Not government owned.</span>{' '}
                Transport Advisory Services is a privately operated vehicle compliance service. We are not affiliated with VIO, FRSC, LASTMA, LIRS, NIID, AutoReg, DVIS, or any government agency.
              </p> */}
              <p className="text-amber-900/70">
                Government fees are charged at cost; service fees are shown before payment. Government processing timelines are outside our control.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
