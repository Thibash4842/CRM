import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, CheckCircle } from 'lucide-react';
import { authApi } from '../../services/api';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md glass-card animate-fade-in">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-8 h-8 text-indigo-600" />
          <span className="text-2xl font-bold">Reset Password</span>
        </div>

        {sent ? (
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Check your email</h3>
            <p className="text-slate-500 mb-6">We've sent a password reset link to {email}</p>
            <Link to="/login"><Button variant="secondary">Back to Login</Button></Link>
          </div>
        ) : (
          <>
            <p className="text-slate-500 mb-6">Enter your email and we'll send you a reset link.</p>
            {error && <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Button type="submit" loading={loading} className="w-full">Send Reset Link</Button>
            </form>
          </>
        )}

        <Link to="/login" className="flex items-center gap-2 mt-6 text-sm text-indigo-600 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>
      </div>
    </div>
  );
}
