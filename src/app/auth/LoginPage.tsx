import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/app/auth/AuthContext';
import type { LoginDto } from '@/types/api';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginDto>();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data: LoginDto) => {
    try {
      await login(data);
      navigate('/');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Login failed';
      // Surface error — functional state via local var since we avoid useState import here
      (document.getElementById('login-error') as HTMLElement).textContent = msg;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="w-full max-w-md p-8 rounded-xl shadow-lg border" style={{
        backgroundColor: 'var(--surface-primary)',
        borderColor: 'var(--border-primary)'
      }}>
        <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Sign In</h1>
        <p className="mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Welcome back! Sign in to your account.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Email</label>
            <input
              type="email"
              {...register('email', { required: 'Email is required' })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password', { required: 'Password is required' })}
                className="w-full px-3 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2"
                style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-tertiary)' }}
              >
                {showPassword
                  ? <EyeOff style={{ width: '16px', height: '16px' }} />
                  : <Eye style={{ width: '16px', height: '16px' }} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            <div className="mt-1 text-right">
              <Link to="/forgot-password" className="text-xs" style={{ color: 'var(--accent-primary)' }}>
                Forgot password?
              </Link>
            </div>
          </div>

          <p id="login-error" className="text-red-500 text-xs min-h-[1rem]" />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 rounded-lg font-medium transition-opacity disabled:opacity-60"
            style={{ backgroundColor: 'var(--accent-primary)', color: '#ffffff' }}
          >
            {isSubmitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="mt-4 text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
          Don&apos;t have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent-primary)' }}>Register</Link>
        </p>
      </div>
    </div>
  );
}
