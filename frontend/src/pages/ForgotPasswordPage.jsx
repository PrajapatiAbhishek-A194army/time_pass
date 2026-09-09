import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiCheckCircle, FiInfo } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await forgotPassword(email);
      setSubmitted(true);
      if (res.resetUrl) {
        setDevResetUrl(res.resetUrl);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to request reset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-premium">
        {/* Back Link */}
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-800 transition mb-6"
        >
          <FiArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
        </Link>

        {submitted ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <FiCheckCircle className="w-7 h-7" />
            </div>
            <h2 className="font-display font-black text-2xl text-slate-900 mb-2">
              Instructions Dispatched
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
              If an account is associated with <strong className="text-slate-800">{email}</strong>, you will receive a secure password reset email powered by Brevo SMTP within a few minutes.
            </p>

            {devResetUrl && (
              <div className="p-3 bg-brand-50 rounded-xl border border-brand-200 text-left mb-6">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-brand-900 mb-1">
                  <FiInfo className="w-3.5 h-3.5 text-brand-700" />
                  <span>Development Reset Link:</span>
                </div>
                <a
                  href={devResetUrl}
                  className="text-[11px] text-brand-700 underline break-all font-mono"
                >
                  {devResetUrl}
                </a>
              </div>
            )}

            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setSubmitted(false);
                setEmail('');
                setDevResetUrl(null);
              }}
              className="w-full"
            >
              Send Another Request
            </Button>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
                Reset Password
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Enter your account email to receive a password reset link via Brevo SMTP.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Account Email
                </label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-11 pr-4 py-3 bg-[#F8FAF9] border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="luxury"
                size="md"
                loading={loading}
                className="w-full"
              >
                Send Reset Link
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
