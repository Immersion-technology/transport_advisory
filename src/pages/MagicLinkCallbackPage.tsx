import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, AlertTriangle, Loader2, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { LogoMark } from '../components/ui/Logo';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import * as authApi from '../api/auth';
import { useAuth } from '../context/AuthContext';

type State =
  | { kind: 'loading' }
  | { kind: 'success'; firstLogin: boolean }
  | { kind: 'error'; message: string };

export default function MagicLinkCallbackPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [state, setState] = useState<State>({ kind: 'loading' });
  const [resending, setResending] = useState(false);
  const { register: regField, handleSubmit, formState: { errors } } = useForm<{ email: string }>();

  useEffect(() => {
    if (!token) {
      setState({ kind: 'error', message: 'No login token in the URL.' });
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await authApi.consumeMagicLink({ token });
        const { user, token: jwt, isFirstLogin } = res.data.data!;
        if (cancelled) return;
        loginWithToken(jwt, user);
        setState({ kind: 'success', firstLogin: isFirstLogin });
        // Auto-redirect after a moment so the user sees the confirmation
        setTimeout(() => {
          navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard');
        }, 1500);
      } catch (err: any) {
        if (cancelled) return;
        const msg = err.response?.data?.message || 'This login link could not be used.';
        setState({ kind: 'error', message: msg });
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleResend = async (data: { email: string }) => {
    setResending(true);
    try {
      await authApi.requestMagicLink({ email: data.email.trim().toLowerCase() });
      toast.success('If that email is registered, a fresh login link has been sent.');
    } catch {
      toast.error('Could not send a new link. Try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7F2] flex flex-col">
      <header className="bg-white border-b border-gray-200/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-2.5">
          <LogoMark size={32} />
          <div>
            <p className="text-sm font-bold text-gray-900 leading-none">Transport Advisory Services</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Vehicle Compliance · Not Government Owned</p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-6 sm:p-8 text-center">
          {state.kind === 'loading' && (
            <>
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
                <Loader2 size={24} className="text-emerald-700 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mt-5">Signing you in…</h1>
              <p className="text-sm text-gray-500 mt-2">Hold tight while we verify your link.</p>
            </>
          )}

          {state.kind === 'success' && (
            <>
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
                <CheckCircle size={26} className="text-emerald-700" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mt-5">
                {state.firstLogin ? 'Welcome to Transport Advisory Services!' : 'Welcome back!'}
              </h1>
              <p className="text-sm text-gray-500 mt-2">Taking you to your dashboard…</p>
            </>
          )}

          {state.kind === 'error' && (
            <>
              <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto">
                <AlertTriangle size={24} className="text-red-700" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mt-5">Couldn't sign you in</h1>
              <p className="text-sm text-gray-600 mt-2">{state.message}</p>

              <form onSubmit={handleSubmit(handleResend)} className="mt-6 space-y-3 text-left">
                <Input
                  label="Email a new login link to:"
                  type="email"
                  placeholder="you@example.com"
                  leftIcon={<Mail size={15} />}
                  required
                  {...regField('email', {
                    required: 'Email is required',
                    pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
                  })}
                  error={errors.email?.message}
                />
                <Button type="submit" loading={resending} className="w-full">
                  Send a fresh link
                </Button>
              </form>

              <div className="mt-6 flex items-center justify-center gap-3 text-sm">
                <Link to="/" className="text-gray-500 hover:text-gray-900">Back home</Link>
                <span className="text-gray-300">·</span>
                <Link to="/login" className="text-[#0A3828] font-semibold hover:underline">Try sign in</Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
