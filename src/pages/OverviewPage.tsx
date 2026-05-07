import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, Bell, FileText, Car, Search, CheckCircle, Clock,
  ArrowRight, MapPin, Zap, Award, AlertTriangle, Building2,
  Truck, RefreshCw, FilePlus, ArrowLeftRight, Users,
} from 'lucide-react';
import { LogoMark } from '../components/ui/Logo';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const SERVICES = [
  {
    icon: RefreshCw,
    title: 'Document Renewals',
    desc: 'Renew Motor Insurance, Vehicle License, and Roadworthiness Certificate online. We handle the queue — you keep driving.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: FilePlus,
    title: 'New Vehicle Registration',
    desc: 'First-time registration done online. Submit details, pay, and we deliver your new papers.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: ArrowLeftRight,
    title: 'Change of Ownership',
    desc: 'Transfer vehicle ownership documents the right way — full paperwork handled end-to-end.',
    color: 'bg-indigo-50 text-indigo-600',
  },
  {
    icon: Truck,
    title: 'Articulated & Heavy Vehicle Registration',
    desc: 'Trucks, trailers, and articulated vehicles registered correctly with all axle and weight permits.',
    color: 'bg-orange-50 text-orange-600',
  },
  {
    icon: Shield,
    title: 'Commercial Vehicles Permit',
    desc: 'Hackney Permits for trucks (Hilux, etc.) and ride-hailing operators — Uber, Bolt, Shuttlers, Keke, Danfo, taxis.',
    color: 'bg-rose-50 text-rose-600',
  },
  {
    icon: Search,
    title: 'Pre-Purchase Vehicle Checks',
    desc: 'Verify any vehicle against the insurance / autoreg / VIO vehicle database before buying. Avoid stolen vehicles and falsified documents.',
    color: 'bg-cyan-50 text-cyan-600',
  },
  {
    icon: Bell,
    title: 'Free Expiry Reminders',
    desc: 'SMS and email alerts 30, 7, and 1 days before any document expires. Reminders are completely free — you only pay a small service charge when you renew with us.',
    color: 'bg-purple-50 text-purple-600',
  },
];

const STEPS = [
  { step: '1', title: 'Register your vehicle', desc: 'Enter your plate number — we autofetch your vehicle documents and expiry dates from the vehicle database.' },
  { step: '2', title: 'Set your reminders', desc: 'Free SMS and email alerts before every document expires — no charge for tracking, ever.' },
  { step: '3', title: 'Renew or apply online', desc: 'Start a renewal or a new application from your dashboard. Pay the government fee plus our service charge. Soft copy + delivery to your doorstep.' },
];


const STATS = [
  { value: '3–4', label: 'Compulsory documents tracked', icon: FileText },
  { value: '36', label: 'States covered nationwide', icon: MapPin },
  { value: '24/7', label: 'Reminder monitoring', icon: Clock },
  { value: '₦0', label: 'Tracking & reminders — always free', icon: Bell },
];

// JSON-LD: Service + FAQ. Search engines surface these as rich results
// (FAQ rich snippets, sitelinks, knowledge cards). Inlined into the page
// so it's part of the static HTML — react-helmet-async also picks it up.
const SERVICE_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Transport Advisory Services — Vehicle Compliance & Document Renewal',
  serviceType: 'Vehicle document tracking and renewal facilitation',
  provider: {
    '@type': 'Organization',
    name: 'Transport Advisory Services',
    url: 'https://transportadvisory.ng',
    address: { '@type': 'PostalAddress', addressLocality: 'Lagos', addressCountry: 'NG' },
  },
  areaServed: { '@type': 'Country', name: 'Nigeria' },
  description:
    'Transport Advisory Services tracks Vehicle Insurance, Vehicle Licence, and Roadworthiness expiry; sends free SMS and email reminders; and handles online renewal, change of ownership, new vehicle registration, articulated registration, and commercial vehicle / ride-hailing permits. Not government owned.',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'NGN',
    description: 'Tracking and reminders are free. Service charges apply only at the point of renewal or new application.',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Transport Advisory Services services',
    itemListElement: [
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Motor Insurance renewal' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Vehicle Licence renewal' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Roadworthiness Certificate renewal' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Commercial Vehicles Permit (Hackney)' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Ride-hailing operator permit' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'New vehicle registration' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Change of vehicle ownership' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Articulated / heavy vehicle registration' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Pre-purchase vehicle verification' } },
      { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Fleet vehicle compliance management' } },
    ],
  },
};

const FAQ_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is Transport Advisory Services government owned?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Transport Advisory Services is a privately owned vehicle compliance service that facilitates document tracking, renewal, and delivery on behalf of vehicle owners. We are not a government agency.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need to pay a subscription fee?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. There is no subscription, no annual fee, and no per-vehicle fee. Tracking your vehicles and receiving SMS / email expiry reminders is always free. You only pay the government fee plus a small service charge when you actually renew a document or submit a new application.',
      },
    },
    {
      '@type': 'Question',
      name: 'How big are the Lagos State fines for expired documents?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Lagos State road users can incur up to ₦60,000 in fines for missing the renewal of their vehicle documents — even if expired by just one minute (60 seconds) — through ANPR cameras placed at different spots on Lagos roads. Vehicles can also be impounded with a minimum ₦20,000 release fee, plus an LIRS Tax clearance requirement before release.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which documents does Transport Advisory Services track?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Transport Advisory Services tracks the 3 to 4 compulsory vehicle documents: Motor Insurance, Vehicle Licence, Roadworthiness Certificate, and (for commercial vehicles) the Hackney / Commercial Vehicles Permit.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need to create an account before using Transport Advisory Services?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. There is no separate registration page. You submit your vehicle and contact details when starting a service request, and an account is created for you automatically. A one-time login link is sent to your email so you can access your dashboard.',
      },
    },
  ],
};

export default function OverviewPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#F5F7F2]">
      {/* Page-specific structured data — Service catalog + FAQ for rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SERVICE_JSONLD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_JSONLD) }}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#F5F7F2]/80 backdrop-blur-md border-b border-gray-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <LogoMark size={36} />
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-gray-900 leading-none">Transport Advisory Services</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Vehicle Compliance Platform</p>
            </div>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            <a href="#problem" className="text-sm text-gray-600 hover:text-gray-900 hidden md:block">The Problem</a>
            <a href="#services" className="text-sm text-gray-600 hover:text-gray-900 hidden md:block">Services</a>
            <a href="#fleet" className="text-sm text-gray-600 hover:text-gray-900 hidden md:block">Fleet</a>
            {user ? (
              <Link to={user.role === 'ADMIN' ? '/admin' : '/dashboard'}>
                <Button size="sm" icon={<ArrowRight size={15} />}>Open Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-700 font-medium hover:text-[#0A3828] px-3 py-1.5">
                  Sign in
                </Link>
                <Link to="/start">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* PROBLEM / SOLUTION — moved to top, made conspicuous */}
      <section id="problem" className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-red-50/40 via-[#F5F7F2] to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-10 sm:pb-14 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-8 sm:mb-10"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 border border-red-300 rounded-full mb-4">
              <AlertTriangle size={13} className="text-red-700" />
              <span className="text-xs font-bold text-red-800 uppercase tracking-wide">Why this matters</span>
            </div>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-[1.1] tracking-tight">
              Lagos drivers are losing <span className="text-red-600">₦60,000+</span> in fines every day —<br className="hidden sm:block" /> often without realising it.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-6 items-stretch">
            {/* THE PROBLEM */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-red-200 shadow-[0_8px_32px_rgba(239,68,68,0.08)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 rounded-full blur-3xl opacity-50" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-red-100 border border-red-200 rounded-full text-xs font-bold text-red-700 mb-4 uppercase tracking-wide">
                  <AlertTriangle size={12} />
                  The Problem
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
                  Up to ₦60,000+ in fines for not renewing your documents
                </h3>
                <p className="text-gray-700 mt-3 leading-relaxed text-sm sm:text-base">
                  Lagos State road users get up to <span className="font-bold text-red-600">₦60,000 in fines</span> for missing the renewal of their documents — even if it's <span className="font-semibold">expired by just one minute (60 seconds)</span> — through ANPR cameras located at different spots on Lagos State roads.
                </p>
                <p className="text-gray-700 mt-3 leading-relaxed text-sm sm:text-base">
                  Most users only discover expired documents when fined. At best, when stopped by VIO, FRSC, LASTMA, or Police — and even that may slip your mind after driving off, until an SMS about the fine arrives.
                </p>

                <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-2xl">
                  <p className="text-xs font-bold text-red-800 uppercase tracking-wide mb-2">Penalty</p>
                  <div className="space-y-1.5 text-sm text-red-900">
                    <div className="flex items-start gap-2">
                      <span className="text-red-600 mt-0.5">•</span>
                      <span><span className="font-semibold">Vehicle impoundment</span> — minimum ₦20,000 release fee</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-red-600 mt-0.5">•</span>
                      <span><span className="font-semibold">LIRS Tax clearance</span> required before vehicle release</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-red-600 mt-0.5">•</span>
                      <span>On-the-spot fines and lost productivity</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* OUR SOLUTION */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gradient-to-br from-[#0A3828] to-[#166534] rounded-3xl p-6 sm:p-8 text-white shadow-[0_8px_32px_rgba(10,56,40,0.18)] relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/20 rounded-full blur-3xl" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-emerald-400/20 border border-emerald-300/40 rounded-full text-xs font-bold text-emerald-200 mb-4 uppercase tracking-wide">
                  <CheckCircle size={12} />
                  Our Solution
                </div>
                <h3 className="text-xl sm:text-2xl font-bold leading-tight">
                  One dashboard. Every document. Always current.
                </h3>
                <p className="text-emerald-100/90 mt-3 leading-relaxed text-sm sm:text-base">
                  Transport Advisory Services consolidates all your vehicle compliance into one place. We track expiry, send free reminders, and handle renewal end-to-end — soft copy and physical delivery included.
                </p>

                <div className="mt-5 space-y-2.5">
                  {[
                    { label: 'New vehicle registration', icon: FilePlus },
                    { label: 'Change of ownership', icon: ArrowLeftRight },
                    { label: 'Articulated / heavy-vehicle registration', icon: Truck },
                    { label: 'Fleet vehicle care (per-vehicle pricing)', icon: Car },
                    { label: 'Commercial vehicles permit (Hackney, ride-hailing)', icon: Shield },
                    { label: 'Pre-purchase vehicle database checks', icon: Search },
                    { label: 'Free reminders — pay only at renewal', icon: Bell },
                  ].map(({ label, icon: Icon }) => (
                    <div key={label} className="flex items-center gap-2.5 text-sm">
                      <Icon size={15} className="text-emerald-300 flex-shrink-0" />
                      <span className="text-white/95">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* CTAs under the problem/solution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mt-8 sm:mt-10"
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/start" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto" icon={<ArrowRight size={18} />}>
                  Start a Renewal
                </Button>
              </Link>
              <a href="#services" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  See All Services
                </Button>
              </a>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              No registration page — your account is created automatically when you submit a service request, and a login link is sent to your email.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Hero / value prop — now sits below the problem */}
      <section className="relative overflow-hidden border-t border-gray-200/60 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-12 sm:pb-16 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full mb-6">
              <Bell size={13} className="text-emerald-700" />
              <span className="text-xs font-semibold text-emerald-800">Tracking & reminders are free — you only pay at renewal</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight">
              Your vehicle documents,<br />
              road traffic and vehicular concerns,<br />
              <span className="bg-gradient-to-r from-[#0A3828] to-emerald-600 bg-clip-text text-transparent">
                always in order.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 mt-5 sm:mt-6 leading-relaxed max-w-2xl mx-auto">
              Track Vehicle Insurance, Vehicle License, and Roadworthiness expiry — all in one place.
              Receive SMS and e-mail reminders before any document expires, get it renewed online, and have it delivered to you (virtual or at your doorstep).
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
              <Link to="/start" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto" icon={<ArrowRight size={18} />}>
                  Start a Renewal
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  I already have an account
                </Button>
              </Link>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Free reminders · Pay only when you renew with us · Account created at checkout
            </p>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="bg-[#F5F7F2] rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <Icon size={18} className="text-[#0A3828] mb-2" />
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500 mt-1 leading-snug">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 leading-tight">Everything you need in one place</h2>
          <p className="text-gray-600 mt-3 sm:mt-4">From renewals to new applications, change of ownership, commercial permits, and pre-purchase checks — built for private owners, commercial operators, and fleet managers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {SERVICES.map(({ icon: Icon, title, desc, color }, idx) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all"
            >
              <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center mb-4`}>
                <Icon size={20} />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1.5">{title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Renewal vs new application split */}
        <div className="mt-10 grid md:grid-cols-2 gap-4 sm:gap-5">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 sm:p-7">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw size={18} className="text-emerald-700" />
              <h4 className="font-bold text-emerald-900">Renewals</h4>
            </div>
            <p className="text-sm text-emerald-900/80 leading-relaxed">
              Existing document expiring soon? Renew Insurance, Vehicle Licence, Roadworthiness, or your Commercial Vehicles Permit — submit details, pay, and we deliver.
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 sm:p-7">
            <div className="flex items-center gap-2 mb-2">
              <FilePlus size={18} className="text-blue-700" />
              <h4 className="font-bold text-blue-900">New Applications</h4>
            </div>
            <p className="text-sm text-blue-900/80 leading-relaxed">
              First-time registration, change of ownership, or articulated / heavy-vehicle registration — handled separately from renewals so nothing gets mixed up.
            </p>
          </div>
        </div>
      </section>

      {/* FLEET — made pronounced */}
      <section id="fleet" className="bg-white border-y border-gray-100 py-12 sm:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-cyan-100 border border-cyan-200 rounded-full text-xs font-bold text-cyan-800 mb-4 uppercase tracking-wide">
                <Building2 size={12} />
                For Fleet Managers
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 leading-tight">
                Fleet management,<br />
                <span className="text-[#0A3828]">all your vehicles in one view.</span>
              </h2>
              <p className="text-gray-600 mt-4 leading-relaxed">
                Run a logistics company, ride-hailing fleet, or corporate motor pool? Transport Advisory Services tracks every vehicle's documents in one unified dashboard. Tracking is free — you're only charged the standard service fee at the point of renewal or new application, per document.
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  { icon: Car, label: 'Unlimited vehicles' },
                  { icon: Bell, label: 'Bulk reminders' },
                  { icon: Users, label: 'Multi-driver assignment' },
                  { icon: Award, label: 'Dedicated account manager' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 p-3 bg-[#F5F7F2] rounded-xl border border-gray-100">
                    <Icon size={16} className="text-[#0A3828]" />
                    <span className="text-sm font-medium text-gray-800">{label}</span>
                  </div>
                ))}
              </div>
              <Link to="/start" className="inline-block mt-6">
                <Button size="lg" icon={<ArrowRight size={16} />}>
                  Set Up Your Fleet
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-br from-[#0A3828] to-[#166534] rounded-3xl p-6 sm:p-8 text-white shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold text-emerald-200 uppercase tracking-wide">Fleet Dashboard</p>
                  <p className="text-2xl font-bold mt-1">42 vehicles</p>
                </div>
                <div className="px-3 py-1 bg-amber-400/20 border border-amber-300/40 rounded-full text-xs font-bold text-amber-200">
                  3 expiring soon
                </div>
              </div>
              <div className="space-y-2.5">
                {[
                  { plate: 'LAG-247-AB', doc: 'Insurance', days: 'Expires in 2 days', urgent: true },
                  { plate: 'LAG-512-XY', doc: 'Roadworthiness', days: 'Expires in 6 days', urgent: true },
                  { plate: 'LAG-094-CD', doc: 'Hackney Permit', days: 'Expires in 30 days', urgent: false },
                  { plate: 'LAG-733-EF', doc: 'Vehicle Licence', days: 'Renewed · 11 months left', urgent: false },
                ].map(row => (
                  <div key={row.plate} className="flex items-center justify-between bg-white/10 rounded-xl px-3 py-2.5">
                    <div>
                      <p className="text-sm font-semibold">{row.plate}</p>
                      <p className="text-xs text-emerald-100/70">{row.doc}</p>
                    </div>
                    <span className={`text-xs font-medium ${row.urgent ? 'text-amber-200' : 'text-emerald-200/80'}`}>
                      {row.days}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-emerald-200/70 mt-5 text-center">Sample dashboard — your live view will look like this.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 leading-tight">Set up in minutes</h2>
          <p className="text-gray-600 mt-3 sm:mt-4">Three steps from sign-up to peace of mind.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
          {STEPS.map(({ step, title, desc }, idx) => (
            <div key={step} className="relative bg-white rounded-2xl p-6 border border-gray-100">
              <div className="w-12 h-12 rounded-2xl bg-[#0A3828] text-white text-lg font-bold flex items-center justify-center mb-4">
                {step}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1.5">{title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
              {idx < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-12 left-full w-full -translate-x-1/2 h-px bg-gradient-to-r from-gray-200 to-transparent" />
              )}
            </div>
          ))}
        </div>
      </section>


      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="bg-gradient-to-br from-[#0A3828] to-[#166534] rounded-3xl p-8 sm:p-12 text-center text-white">
          <Zap size={28} className="text-emerald-300 mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold leading-tight">
            Stop worrying about expired documents
          </h2>
          <p className="text-emerald-100/80 mt-3 max-w-xl mx-auto leading-relaxed">
            Track free, renew online, and stay clear of LASTMA, FRSC, VIO and ANPR fines. Account created at checkout — no separate signup needed.
          </p>
          <Link to="/start" className="inline-block mt-6">
            <button className="px-6 py-3 bg-white text-[#0A3828] rounded-xl font-semibold text-sm hover:bg-emerald-50 inline-flex items-center gap-2">
              Start a Service <ArrowRight size={16} />
            </button>
          </Link>
        </div>
      </section>

      {/* Disclosure / caveats — placed near the bottom so it doesn't dominate
         above the fold but is still surfaced before the footer */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.4 }}
          className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 sm:p-6"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-700 flex-shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm text-amber-900/90 leading-relaxed">
              <p>
                <span className="font-bold">Not government owned.</span>{' '}
                Transport Advisory Services is a privately operated vehicle compliance service. We are not affiliated with VIO, FRSC, LASTMA, LIRS, NIID, AutoReg, DVIS, or any government agency.
              </p>
              <p className="text-amber-900/70 text-xs">
                We facilitate document tracking, reminders, renewals, change of ownership, and delivery on your behalf. Government fees are charged at cost; service fees are clearly displayed before payment. Government processing timelines are outside our control.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <LogoMark size={28} />
            <div>
              <p className="text-xs font-bold text-gray-900">Transport Advisory Services</p>
              <p className="text-[11px] text-gray-500">© {new Date().getFullYear()} · Lagos, Nigeria · Not government owned</p>
            </div>
          </div>
          <div className="flex items-center gap-5 text-xs text-gray-500">
            <Link to="/login" className="hover:text-gray-900">Sign in</Link>
            <a href="#services" className="hover:text-gray-900">Services</a>
            <a href="#fleet" className="hover:text-gray-900">Fleet</a>
            <a href="#pricing" className="hover:text-gray-900">Pricing</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
