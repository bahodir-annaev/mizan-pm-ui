import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { resetPassword } from '@/app/auth/auth.service';
import type { ResetPasswordDto } from '@/types/api';

type FormValues = {
  newPassword: string;
  confirmPassword: string;
};

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormValues>();

  const onSubmit = async ({ newPassword }: FormValues) => {
    try {
      const dto: ResetPasswordDto = { token, newPassword };
      await resetPassword(dto);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch {
      (document.getElementById('reset-error') as HTMLElement).textContent =
        'Reset link is invalid or has expired. Please request a new one.';
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="w-full max-w-md p-8 rounded-xl shadow-lg border text-center space-y-4" style={{
          backgroundColor: 'var(--surface-primary)',
          borderColor: 'var(--border-primary)'
        }}>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Invalid or missing reset token.
          </p>
          <Link to="/forgot-password" style={{ color: 'var(--accent-primary)' }} className="text-sm">
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="w-full max-w-md p-8 rounded-xl shadow-lg border" style={{
        backgroundColor: 'var(--surface-primary)',
        borderColor: 'var(--border-primary)'
      }}>
        {success ? (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: 'var(--status-success-bg)' }}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--status-success)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>Password Updated</h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Your password has been reset. Redirecting to sign in…
            </p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Reset Password</h1>
            <p className="mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Enter your new password below.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>New Password</label>
                <input
                  type="password"
                  {...register('newPassword', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Min 8 characters' },
                  })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                />
                {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
              </div>

              <div>
                <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Confirm Password</label>
                <input
                  type="password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (val) => val === watch('newPassword') || 'Passwords do not match',
                  })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
              </div>

              <p id="reset-error" className="text-red-500 text-xs min-h-[1rem]" />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2 rounded-lg font-medium transition-opacity disabled:opacity-60"
                style={{ backgroundColor: 'var(--accent-primary)', color: '#ffffff' }}
              >
                {isSubmitting ? 'Updating…' : 'Reset Password'}
              </button>
            </form>

            <p className="mt-4 text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
              <Link to="/login" style={{ color: 'var(--accent-primary)' }}>Back to Sign In</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
