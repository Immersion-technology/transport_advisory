import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Shield, Bell, FileText, Car, Search, CheckCircle, Clock, Package,
  ArrowRight, Star, MapPin, Zap, Users, Award,
} from 'lucide-react';
import { LogoMark } from '../components/ui/Logo';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  {
    icon: Bell,
    title: 'Automated Reminders',
    desc: 'SMS and email alerts 30, 7, and 1 days before your documents expire. Never get caught off guard by VIO, FRSC, or LASTMA again.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: FileText,
    title: 'Online Renewal',
    desc: 'Renew Motor Insurance, Vehicle License, and Roadworthiness without a single visit to a licensing office.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Search,
    title: 'Pre-Purchase Checks',
    desc: 'Verify any vehicle against the NIID database before buying. Avoid stolen vehicles and falsified documents.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: Package,
    title: 'Nationwide Delivery',
    desc: 'Get your completed documents delivered anywhere in Nigeria — standard, express, or same-day in Lagos.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: Shield,
    title: 'Hackney Permits',
    desc: 'Dedicated service for commercial operators — Keke, Danfo, taxis, and ride-hailing vehicles.',
    color: 'bg-rose-50 text-rose-600',
  },
  {
    icon: Car,
    title: 'Fleet Dashboard',
    desc: 'Corporate and transport companies can track up to 20 vehicles from one unified dashboard.',
    color: 'bg-cyan-50 text-cyan-600',
  },
];

const STEPS = [
  { step: '1', title: 'Register your vehicle', desc: 'Enter your plate number — we auto-fetch your insurance details from NIID.' },
  { step: '2', title: 'Set your reminders', desc: 'Choose your preferred channels (SMS, email, WhatsApp) and reminder timing.' },
  { step: '3', title: 'Renew when it\'s time', desc: 'Initiate renewal from your dashboard. Pay via Paystack. Receive soft copy + optional delivery.' },
];

const PRICING = [
  {
    tier: 'Founding Member',
    price: 'Free',
    subtitle: 'First 50 subscribers',
    features: ['Up to 3 vehicles', 'All reminder channels', 'Online renewals', 'Pre-purchase checks'],
    cta: 'Claim Free Spot',
    highlight: true,
  },
  {
    tier: 'Standard',
    price: '₦5,000',
    subtitle: 'per year',
    features: ['Up to 3 vehicles', 'All reminder channels', 'Online renewals', 'Pre-purchase checks'],
    cta: 'Get Started',
    highlight: false,
  },
  {
    tier: 'Fleet',
    price: '₦15,000',
    subtitle: 'per year',
    features: ['Up to 20 vehicles', 'Unified dashboard', 'Priority support', 'Bulk verification'],
    cta: 'Go Fleet',
    highlight: false,
  },
];

const STATS = [
  { value: '3', label: 'Compulsory documents tracked', icon: FileText },
  { value: '36', label: 'States covered nationwide', icon: MapPin },
  { value: '24/7', label: 'Reminder monitoring', icon: Clock },
  { value: '50+', label: 'Free founding spots', icon: Star },
];

export default function OverviewPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#F5F7F2]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#F5F7F2]/80 backdrop-blur-md border-b border-gray-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <LogoMark size={36} />
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-gray-900 leading-none">Transport Advisory</p>
              <p className="text-[11px] text-gray-500 mt-0.5">Vehicle Compliance Platform</p>
            </div>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 hidden md:block">Features</a>
            <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 hidden md:block">How it works</a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 hidden md:block">Pricing</a>
            {user ? (
              <Link to={user.role === 'ADMIN' ? '/admin' : '/dashboard'}>
                <Button size="sm" icon={<ArrowRight size={15} />}>Open Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-700 font-medium hover:text-[#0A3828] px-3 py-1.5">
                  Sign in
                </Link>
                <Link to="/register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#F5F7F2] via-emerald-50/40 to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-16 sm:pb-24 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full mb-6">
              <Star size={13} className="text-amber-600 fill-amber-500" />
              <span className="text-xs font-semibold text-amber-800">First 50 subscribers free for life</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight">
              Your vehicle documents,<br />
              <span className="bg-gradient-to-r from-[#0A3828] to-emerald-600 bg-clip-text text-transparent">
                always in order.
              </span>
            </h1>
            <p className="text-base sm:text-lg text-gray-600 mt-5 sm:mt-6 leading-relaxed max-w-2xl mx-auto">
              Track Motor Insurance, Vehicle License, and Roadworthiness in one place.
              Receive SMS and email reminders before documents expire, and renew online —
              no licensing office visits required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto" icon={<ArrowRight size={18} />}>
                  Create Free Account
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  I already have an account
                </Button>
              </Link>
            </div>
            <p className="text-xs text-gray-500 mt-4">No credit card required · Cancel anytime</p>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                <Icon size={18} className="text-[#0A3828] mb-2" />
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500 mt-1 leading-snug">{label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Problem/solution */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid md:grid-cols-2 gap-6 sm:gap-10 items-center">
          <div>
            <div className="inline-block px-2.5 py-1 bg-red-50 border border-red-200 rounded-full text-xs font-semibold text-red-700 mb-4">
              The Problem
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
              Missed one document expiry can cost you ₦50,000+ in fines
            </h2>
            <p className="text-gray-600 mt-4 leading-relaxed">
              Vehicle owners in Nigeria check three separate government portals — <span className="font-semibold">askniid.org</span>, <span className="font-semibold">verify.autoreg.ng</span>, and <span className="font-semibold">dvis.lg.gov.ng</span> —
              and most discover expired documents only when stopped by VIO, FRSC, or LASTMA.
            </p>
            <div className="mt-6 space-y-2">
              {[
                'Vehicle impoundment — average ₦15,000 to release',
                'On-the-spot fines up to ₦50,000 per offence',
                'Hours wasted at licensing offices',
                'Risk of stolen-vehicle fraud when buying used',
              ].map(item => (
                <div key={item} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-red-500 mt-1">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#0A3828] to-[#166534] rounded-3xl p-8 sm:p-10 text-white">
            <div className="inline-block px-2.5 py-1 bg-emerald-400/20 border border-emerald-300/30 rounded-full text-xs font-semibold text-emerald-200 mb-4">
              Our Solution
            </div>
            <h3 className="text-xl sm:text-2xl font-bold leading-tight">
              One dashboard. Every document. Always current.
            </h3>
            <p className="text-emerald-100/80 mt-3 leading-relaxed">
              We consolidate tracking of all three compulsory documents into one place, watch expiry dates for you, and handle renewals on your behalf.
            </p>
            <div className="mt-6 space-y-3">
              {[
                'Auto-populated insurance via NIID',
                'Multi-channel reminders: SMS, email, WhatsApp',
                'One-tap renewal with Paystack',
                'Soft copies + physical delivery nationwide',
              ].map(item => (
                <div key={item} className="flex items-center gap-2.5 text-sm">
                  <CheckCircle size={16} className="text-emerald-300 flex-shrink-0" />
                  <span className="text-white/90">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 leading-tight">Everything you need in one place</h2>
          <p className="text-gray-600 mt-3 sm:mt-4">Built for private owners, commercial operators, and fleet managers — same platform, features that scale to your usage.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {FEATURES.map(({ icon: Icon, title, desc, color }, idx) => (
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
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-white py-12 sm:py-20 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 leading-tight">Set up in minutes</h2>
            <p className="text-gray-600 mt-3 sm:mt-4">Three steps from sign-up to peace of mind.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
            {STEPS.map(({ step, title, desc }, idx) => (
              <div key={step} className="relative">
                <div className="w-12 h-12 rounded-2xl bg-[#0A3828] text-white text-lg font-bold flex items-center justify-center mb-4">
                  {step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1.5">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
                {idx < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-full w-full -translate-x-1/2 h-px bg-gradient-to-r from-gray-200 to-transparent" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-900 leading-tight">Simple, transparent pricing</h2>
          <p className="text-gray-600 mt-3 sm:mt-4">Dashboard access is a flat annual fee. Renewals billed per transaction at government cost + a small service charge.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 max-w-5xl mx-auto">
          {PRICING.map(plan => (
            <div
              key={plan.tier}
              className={`
                rounded-2xl p-6 sm:p-7 relative transition-all
                ${plan.highlight
                  ? 'bg-gradient-to-br from-[#0A3828] to-[#166534] text-white shadow-xl md:scale-105 border border-emerald-400/30'
                  : 'bg-white border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]'}
              `}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-400 text-amber-900 text-xs font-bold rounded-full">
                  Most Popular
                </div>
              )}
              <h3 className={`text-sm font-semibold ${plan.highlight ? 'text-emerald-200' : 'text-gray-500'}`}>
                {plan.tier}
              </h3>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className={`text-3xl sm:text-4xl font-bold ${plan.highlight ? 'text-white' : 'text-gray-900'}`}>
                  {plan.price}
                </span>
                <span className={`text-sm ${plan.highlight ? 'text-emerald-200' : 'text-gray-500'}`}>
                  {plan.subtitle}
                </span>
              </div>
              <ul className={`mt-5 space-y-2.5 ${plan.highlight ? 'text-white/90' : 'text-gray-700'}`}>
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <CheckCircle size={15} className={plan.highlight ? 'text-emerald-300 mt-0.5 flex-shrink-0' : 'text-emerald-600 mt-0.5 flex-shrink-0'} />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="block mt-6">
                <button
                  className={`
                    w-full py-2.5 rounded-xl text-sm font-semibold transition-all
                    ${plan.highlight
                      ? 'bg-white text-[#0A3828] hover:bg-emerald-50'
                      : 'bg-[#0A3828] text-white hover:bg-[#0d4a35]'}
                  `}
                >
                  {plan.cta}
                </button>
              </Link>
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
            Join the first 50 vehicle owners and get lifetime free access to the dashboard.
          </p>
          <Link to="/register" className="inline-block mt-6">
            <button className="px-6 py-3 bg-white text-[#0A3828] rounded-xl font-semibold text-sm hover:bg-emerald-50 inline-flex items-center gap-2">
              Create Free Account <ArrowRight size={16} />
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <LogoMark size={28} />
            <div>
              <p className="text-xs font-bold text-gray-900">Transport Advisory</p>
              <p className="text-[11px] text-gray-500">© {new Date().getFullYear()} · Lagos, Nigeria</p>
            </div>
          </div>
          <div className="flex items-center gap-5 text-xs text-gray-500">
            <Link to="/login" className="hover:text-gray-900">Sign in</Link>
            <Link to="/register" className="hover:text-gray-900">Register</Link>
            <a href="#features" className="hover:text-gray-900">Features</a>
            <a href="#pricing" className="hover:text-gray-900">Pricing</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
