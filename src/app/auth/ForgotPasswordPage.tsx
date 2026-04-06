import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { forgotPassword } from '@/app/auth/auth.service';
import type { ForgotPasswordDto } from '@/types/api';

export function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordDto>();

  const onSubmit = async (data: ForgotPasswordDto) => {
    try {
      await forgotPassword(data);
      setSubmitted(true);
    } catch {
      (document.getElementById('forgot-error') as HTMLElement).textContent =
        'Something went wrong. Please try again.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="w-full max-w-md p-8 rounded-xl shadow-lg border" style={{
        backgroundColor: 'var(--surface-primary)',
        borderColor: 'var(--border-primary)'
      }}>
        {submitted ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: 'var(--status-success-bg)' }}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--status-success)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Check your email</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              We sent a password reset link to your email address. The link expires in 1 hour.
            </p>
            <Link
              to="/login"
              className="block w-full py-2 rounded-lg font-medium text-center transition-opacity"
              style={{ backgroundColor: 'var(--accent-primary)', color: '#ffffff' }}
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Forgot Password</h1>
            <p className="mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Enter your email and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Email</label>
                <input
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                  placeholder="you@example.com"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <p id="forgot-error" className="text-red-500 text-xs min-h-[1rem]" />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 rounded-lg font-medium transition-opacity disabled:opacity-60"
                style={{ backgroundColor: 'var(--accent-primary)', color: '#ffffff' }}
              >
                {isSubmitting ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>

            <p className="mt-4 text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
              Remember your password?{' '}
              <Link to="/login" style={{ color: 'var(--accent-primary)' }}>Sign In</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
