import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { LogoMark } from '../components/ui/Logo';

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
      const stored = localStorage.getItem('ta_user');
      const role = stored ? JSON.parse(stored).role : 'USER';
      toast.success('Welcome back!');
      navigate(role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — branding */}
      <div className="hidden lg:flex flex-1 bg-[#0A3828] text-white flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <LogoMark size={40} />
          <div>
            <h1 className="text-base font-bold">Transport Advisory</h1>
            <p className="text-xs text-emerald-300/70">Vehicle Compliance Platform</p>
          </div>
        </div>

        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold leading-tight mb-6">
              Your vehicle documents,<br />
              <span className="text-emerald-300">always in order.</span>
            </h2>
            <p className="text-white/60 text-lg max-w-md leading-relaxed">
              Nigeria's smarter way to track Motor Insurance, Vehicle License, and Roadworthiness — all in one place.
            </p>
          </motion.div>

          <div className="mt-12 grid grid-cols-3 gap-6">
            {[
              { value: '3', label: 'Documents tracked' },
              { value: '50+', label: 'Free early spots' },
              { value: '0', label: 'Office visits needed' },
            ].map(({ value, label }) => (
              <div key={label} className="bg-white/8 rounded-xl p-4">
                <p className="text-3xl font-bold text-emerald-300">{value}</p>
                <p className="text-white/60 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/30 text-xs">© 2026 Transport Advisory · Lagos, Nigeria</p>
      </div>

      {/* Right — form */}
      <div className="flex-1 lg:max-w-md flex flex-col justify-center px-8 py-12 bg-[#F5F7F2]">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm mx-auto"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <LogoMark size={40} />
            <span className="text-base font-bold text-[#0A3828]">Transport Advisory</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Sign in</h2>
            <p className="text-gray-500 text-sm mt-1">Enter your credentials to access your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              required
              {...register('email', { required: 'Email is required' })}
              error={errors.email?.message}
            />
            <Input
              label="Password"
              type={showPwd ? 'text' : 'password'}
              placeholder="••••••••"
              required
              {...register('password', { required: 'Password is required' })}
              error={errors.password?.message}
              rightElement={
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
            <Button type="submit" loading={loading} size="lg" className="w-full mt-2" icon={<ArrowRight size={16} />}>
              Sign In
            </Button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#0A3828] font-semibold hover:underline">
              Create account
            </Link>
          </p>

          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-xs text-amber-800 font-medium">🎉 Founding Member Offer</p>
            <p className="text-xs text-amber-700 mt-1">First 50 subscribers get lifetime free access to the dashboard.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
