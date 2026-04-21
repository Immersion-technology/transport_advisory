import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { verifyPayment } from '../api/applications';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export default function PaymentCallbackPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const reference = searchParams.get('reference') || searchParams.get('trxref') || '';
  const [state, setState] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [message, setMessage] = useState('Confirming your payment…');

  useEffect(() => {
    if (!reference) {
      setState('failed');
      setMessage('No payment reference found in the URL.');
      return;
    }
    (async () => {
      try {
        await verifyPayment(reference);
        setState('success');
        setMessage('Your payment was successful. Our team will process your renewal shortly.');
      } catch (err: any) {
        setState('failed');
        setMessage(err?.response?.data?.message || 'Payment could not be verified.');
      }
    })();
  }, [reference]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7F2] px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-5">
            {state === 'verifying' && (
              <div className="w-16 h-16 bg-[#0A3828]/10 rounded-2xl flex items-center justify-center">
                <Loader2 size={28} className="animate-spin text-[#0A3828]" />
              </div>
            )}
            {state === 'success' && (
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center">
                <CheckCircle size={28} className="text-emerald-600" />
              </div>
            )}
            {state === 'failed' && (
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
                <XCircle size={28} className="text-red-600" />
              </div>
            )}
          </div>

          <h1 className="text-xl font-bold text-gray-900 mb-2">
            {state === 'verifying' && 'Verifying Payment'}
            {state === 'success' && 'Payment Successful'}
            {state === 'failed' && 'Verification Failed'}
          </h1>

          <p className="text-sm text-gray-600 mb-6">{message}</p>

          {reference && (
            <p className="text-xs text-gray-400 mb-6 font-mono break-all">Ref: {reference}</p>
          )}

          {state !== 'verifying' && (
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => navigate(id ? `/applications` : '/dashboard')}
                icon={<ArrowRight size={16} />}
              >
                {id ? 'View Application' : 'Go to Dashboard'}
              </Button>
              {state === 'failed' && (
                <Link to="/applications" className="text-xs text-gray-500 hover:text-gray-700">
                  Back to Applications
                </Link>
              )}
            </div>
          )}
        </Card>
      </motion.div>
    </div>
  );
}
