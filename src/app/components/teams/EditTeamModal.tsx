import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ModalHeader } from '../ModalHeader';
import { useUpdateTeam } from '@/hooks/api/useTeams';
import type { ApiTeam } from '@/types/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  team: ApiTeam;
}

interface FormValues {
  name: string;
  description: string;
}

export function EditTeamModal({ isOpen, onClose, team }: Props) {
  const updateTeam = useUpdateTeam();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: { name: team.name, description: team.description ?? '' },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ name: team.name, description: team.description ?? '' });
    }
  }, [isOpen, team, reset]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      const root = document.getElementById('root');
      if (root) root.style.pointerEvents = 'none';
      return () => { if (root) root.style.pointerEvents = ''; };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const onSubmit = (values: FormValues) => {
    updateTeam.mutate(
      {
        id: team.id,
        dto: {
          name: values.name.trim(),
          description: values.description.trim() || undefined,
        },
      },
      { onSuccess: () => onClose() },
    );
  };

  return (
    <>
      <div
        style={{
          position: 'fixed', inset: 0,
          backdropFilter: 'blur(5px)', WebkitBackdropFilter: 'blur(5px)',
          zIndex: 49, pointerEvents: 'none',
        }}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ pointerEvents: 'auto' }}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="relative w-full max-w-md overflow-hidden rounded-2xl"
          style={{
            backgroundColor: 'var(--surface-primary)',
            border: '1px solid var(--border-primary)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}
        >
          <ModalHeader title="Edit Team" onClose={onClose} />

          <div className="px-6 py-6 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Team name *
              </label>
              <input
                {...register('name', { required: 'Name is required' })}
                type="text"
                placeholder="e.g. Design Team"
                className="w-full px-4 py-2.5 rounded-lg outline-none text-sm"
                style={inputStyle(!!errors.name)}
              />
              {errors.name && <p className="mt-1 text-xs" style={{ color: '#EF4444' }}>{errors.name.message}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Description <span style={{ color: 'var(--text-tertiary)' }}>(optional)</span>
              </label>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="What does this team work on?"
                className="w-full px-4 py-2.5 rounded-lg outline-none text-sm resize-none"
                style={inputStyle(false)}
              />
            </div>
          </div>

          <div
            className="flex items-center justify-end gap-3 px-6 py-4 border-t"
            style={{ borderColor: 'var(--border-primary)' }}
          >
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium hover:opacity-70 transition-opacity"
              style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-primary)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateTeam.isPending}
              className="px-5 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              style={{ backgroundColor: 'var(--accent-primary)', color: '#ffffff' }}
            >
              {updateTeam.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

function inputStyle(hasError: boolean): React.CSSProperties {
  return {
    backgroundColor: 'var(--surface-secondary)',
    border: `1px solid ${hasError ? '#EF4444' : 'var(--border-primary)'}`,
    color: 'var(--text-primary)',
  };
}
