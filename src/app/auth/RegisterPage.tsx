import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/app/auth/AuthContext';
import type { RegisterDto } from '@/types/api';

export function RegisterPage() {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterDto>();

  const onSubmit = async (data: RegisterDto) => {
    try {
      await authRegister(data);
      navigate('/');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Registration failed';
      (document.getElementById('register-error') as HTMLElement).textContent = msg;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="w-full max-w-md p-8 rounded-xl shadow-lg border" style={{
        backgroundColor: 'var(--surface-primary)',
        borderColor: 'var(--border-primary)'
      }}>
        <h1 className="text-2xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Create Account</h1>
        <p className="mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Create your account and get started.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>First Name</label>
              <input
                {...register('firstName', { required: 'Required' })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Last Name</label>
              <input
                {...register('lastName', { required: 'Required' })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Email</label>
            <input
              type="email"
              {...register('email', { required: 'Email is required' })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none"
              style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Password</label>
            <input
              type="password"
              {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' } })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none"
              style={{ backgroundColor: 'var(--surface-secondary)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <p id="register-error" className="text-red-500 text-xs min-h-[1rem]" />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 rounded-lg font-medium transition-opacity disabled:opacity-60"
            style={{ backgroundColor: 'var(--accent-primary)', color: '#ffffff' }}
          >
            {isSubmitting ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="mt-4 text-sm text-center" style={{ color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-primary)' }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}
