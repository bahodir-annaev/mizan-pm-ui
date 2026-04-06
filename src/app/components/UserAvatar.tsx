import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { cn } from './ui/utils';

export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

const SIZE_CLASSES: Record<string, string> = {
  xs: 'size-6 text-[10px]',
  sm: 'size-8 text-xs',
  md: 'size-10 text-sm',
  lg: 'size-12 text-base',
};

interface UserAvatarProps {
  name: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Background color override (hex or CSS variable) */
  color?: string;
  className?: string;
}

export function UserAvatar({
  name,
  src,
  size = 'md',
  color,
  className,
}: UserAvatarProps) {
  const sizeClass = SIZE_CLASSES[size];

  return (
    <Avatar className={cn(sizeClass, className)}>
      {src && <AvatarImage src={src} alt={name} />}
      <AvatarFallback
        className={cn('font-semibold', sizeClass)}
        style={
          color
            ? { backgroundColor: `${color}20`, color }
            : { backgroundColor: 'var(--surface-tertiary)', color: 'var(--text-secondary)' }
        }
      >
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
