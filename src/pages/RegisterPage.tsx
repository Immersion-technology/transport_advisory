import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, ArrowRight, Star } from 'lucide-react';
import { LogoMark } from '../components/ui/Logo';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>();
  const pwd = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    try {
      await registerUser({
        email: data.email,
        phone: data.phone,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });
      toast.success('Account created! Welcome to Transport Advisory.');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-72 bg-[#0A3828] text-white flex-col p-10 justify-between">
        <div className="flex items-center gap-3">
          <LogoMark size={40} />
          <span className="font-bold text-sm">Transport Advisory</span>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Join Nigeria's vehicle compliance platform</h2>
          <div className="space-y-3">
            {[
              'Auto-track Motor Insurance expiry',
              'SMS & Email reminders before expiry',
              'Renew documents without office visits',
              'Physical delivery nationwide',
              'Pre-purchase vehicle verification',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-white/80">
                <Star size={13} className="text-emerald-300 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/30 text-xs">© 2026 Transport Advisory</p>
      </div>

      <div className="flex-1 flex flex-col justify-center px-8 py-12 bg-[#F5F7F2] overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
            <p className="text-gray-500 text-sm mt-1">Manage all your vehicle documents in one place</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First name"
                placeholder="Adebayo"
                required
                {...register('firstName', { required: 'Required' })}
                error={errors.firstName?.message}
              />
              <Input
                label="Last name"
                placeholder="Okafor"
                required
                {...register('lastName', { required: 'Required' })}
                error={errors.lastName?.message}
              />
            </div>
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              required
              {...register('email', { required: 'Required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' } })}
              error={errors.email?.message}
            />
            <Input
              label="Phone number"
              type="tel"
              placeholder="0801 234 5678"
              required
              {...register('phone', { required: 'Required', minLength: { value: 11, message: 'Enter a valid Nigerian number' } })}
              error={errors.phone?.message}
            />
            <Input
              label="Password"
              type={showPwd ? 'text' : 'password'}
              placeholder="Min. 8 characters"
              required
              {...register('password', { required: 'Required', minLength: { value: 8, message: 'Min. 8 characters' } })}
              error={errors.password?.message}
              rightElement={
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-gray-400 hover:text-gray-600">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
            <Input
              label="Confirm password"
              type={showPwd ? 'text' : 'password'}
              placeholder="Re-enter password"
              required
              {...register('confirmPassword', {
                required: 'Required',
                validate: (v) => v === pwd || 'Passwords do not match',
              })}
              error={errors.confirmPassword?.message}
            />
            <Button type="submit" loading={loading} size="lg" className="w-full mt-2" icon={<ArrowRight size={16} />}>
              Create Account
            </Button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#0A3828] font-semibold hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
