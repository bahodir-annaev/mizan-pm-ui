import { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, User, Mail, Lock, Briefcase, ChevronDown, Check } from 'lucide-react';
import { ModalHeader } from './ModalHeader';
import { useCreateUser } from '@/hooks/api/useUsers';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ROLE_OPTIONS = [
  { value: 'member',  label: 'Member',  description: 'Can view and contribute to projects' },
  { value: 'manager', label: 'Manager', description: 'Can manage projects and team members' },
];

export function AddMemberModal({ isOpen, onClose }: AddMemberModalProps) {
  const createUser = useCreateUser();
  const firstNameRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'member',
  });

  const [errors, setErrors] = useState<Partial<typeof formData>>({});

  // Reset form on open
  useEffect(() => {
    if (isOpen) {
      setFormData({ firstName: '', lastName: '', email: '', password: '', role: 'member' });
      setErrors({});
      setShowPassword(false);
      setTimeout(() => firstNameRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Disable background interactions
  useEffect(() => {
    if (isOpen) {
      const root = document.getElementById('root');
      if (root) root.style.pointerEvents = 'none';
      return () => { if (root) root.style.pointerEvents = ''; };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const next: Partial<typeof formData> = {};
    if (!formData.firstName.trim()) next.firstName = 'Required';
    if (!formData.lastName.trim()) next.lastName = 'Required';
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) next.email = 'Valid email required';
    if (formData.password.length < 6) next.password = 'Min 6 characters';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    createUser.mutate(
      {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      },
      { onSuccess: () => onClose() },
    );
  };

  const selectedRole = ROLE_OPTIONS.find(r => r.value === formData.role)!;

  return (
    <>
      {/* Blur backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          zIndex: 49,
          pointerEvents: 'none',
        }}
      />

      {/* Modal container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ pointerEvents: 'auto' }}>
        <div
          className="relative w-full max-w-md overflow-hidden rounded-2xl"
          style={{
            backgroundColor: 'var(--surface-primary)',
            border: '1px solid var(--border-primary)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 1px rgba(0, 0, 0, 0.2)',
          }}
        >
          <ModalHeader title="Add Team Member" onClose={onClose} />

          {/* Content */}
          <div className="px-6 py-6 space-y-5">
            {/* First & Last name row */}
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="First name *"
                error={errors.firstName}
                icon={<User style={{ width: '14px', height: '14px' }} />}
              >
                <input
                  ref={firstNameRef}
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="First name"
                  className="w-full px-4 py-2.5 rounded-lg outline-none text-sm pl-9"
                  style={inputStyle(!!errors.firstName)}
                />
              </Field>

              <Field label="Last name *" error={errors.lastName}>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Last name"
                  className="w-full px-4 py-2.5 rounded-lg outline-none text-sm"
                  style={inputStyle(!!errors.lastName)}
                />
              </Field>
            </div>

            {/* Email */}
            <Field
              label="Email *"
              error={errors.email}
              icon={<Mail style={{ width: '14px', height: '14px' }} />}
            >
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@company.com"
                className="w-full px-4 py-2.5 rounded-lg outline-none text-sm pl-9"
                style={inputStyle(!!errors.email)}
              />
            </Field>

            {/* Password */}
            <Field
              label="Password *"
              error={errors.password}
              icon={<Lock style={{ width: '14px', height: '14px' }} />}
            >
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min 6 characters"
                  className="w-full px-4 py-2.5 rounded-lg outline-none text-sm pl-9 pr-10"
                  style={inputStyle(!!errors.password)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  {showPassword
                    ? <EyeOff style={{ width: '14px', height: '14px' }} />
                    : <Eye style={{ width: '14px', height: '14px' }} />}
                </button>
              </div>
            </Field>

            {/* Role */}
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Role
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-all"
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    border: '1px solid var(--border-primary)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Briefcase style={{ width: '14px', height: '14px', color: 'var(--text-tertiary)' }} />
                    <span className="text-xs font-medium">{selectedRole.label}</span>
                    <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>— {selectedRole.description}</span>
                  </div>
                  <ChevronDown
                    style={{
                      width: '14px',
                      height: '14px',
                      color: 'var(--text-tertiary)',
                      transform: showRoleDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                    }}
                  />
                </button>

                {showRoleDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowRoleDropdown(false)} />
                    <div
                      className="absolute top-full left-0 mt-1 w-full rounded-lg overflow-hidden z-20"
                      style={{
                        backgroundColor: 'var(--surface-primary)',
                        border: '1px solid var(--border-primary)',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                      }}
                    >
                      {ROLE_OPTIONS.map((option) => {
                        const isSelected = formData.role === option.value;
                        return (
                          <button
                            key={option.value}
                            onClick={() => { setFormData({ ...formData, role: option.value }); setShowRoleDropdown(false); }}
                            className="w-full flex items-center justify-between px-4 py-3 transition-colors"
                            style={{ backgroundColor: isSelected ? 'var(--surface-hover)' : 'transparent' }}
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-hover)'; }}
                            onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                          >
                            <div className="text-left">
                              <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{option.label}</p>
                              <p className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{option.description}</p>
                            </div>
                            {isSelected && <Check style={{ width: '14px', height: '14px', color: 'var(--accent-primary)', flexShrink: 0 }} />}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-end gap-3 px-6 py-4 border-t"
            style={{ borderColor: 'var(--border-primary)' }}
          >
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-primary)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={createUser.isPending}
              className="px-5 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ backgroundColor: 'var(--accent-primary)', color: '#ffffff' }}
            >
              {createUser.isPending ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Helpers

function inputStyle(hasError: boolean): React.CSSProperties {
  return {
    backgroundColor: 'var(--surface-secondary)',
    border: `1px solid ${hasError ? '#EF4444' : 'var(--border-primary)'}`,
    color: 'var(--text-primary)',
  };
}

interface FieldProps {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

function Field({ label, error, icon, children }: FieldProps) {
  return (
    <div>
      <label className="block text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-tertiary)' }}
          >
            {icon}
          </span>
        )}
        {children}
      </div>
      {error && <p className="mt-1 text-xs" style={{ color: '#EF4444' }}>{error}</p>}
    </div>
  );
}
