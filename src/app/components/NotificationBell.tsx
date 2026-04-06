import { Bell, Check, CheckCheck } from 'lucide-react';
import { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from './ui/dropdown-menu';
import { ScrollArea } from './ui/scroll-area';
import { useNotifications, useUnreadCount, useMarkAllRead, useMarkRead } from '@/hooks/api/useNotifications';
import type { Notification } from '@/types/domain';

const TYPE_ICONS: Record<string, string> = {
  TASK_ASSIGNED: '📋',
  TASK_UPDATED: '✏️',
  COMMENT_ADDED: '💬',
  PROJECT_UPDATED: '📁',
  DEADLINE_APPROACHING: '⏰',
  MENTION: '@',
};

function NotificationItem({ notification, onRead }: { notification: Notification; onRead: (id: string) => void }) {
  return (
    <div
      className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors"
      style={{
        backgroundColor: notification.isRead ? 'transparent' : 'var(--surface-secondary)',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--surface-tertiary)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = notification.isRead ? 'transparent' : 'var(--surface-secondary)'; }}
      onClick={() => !notification.isRead && onRead(notification.id)}
    >
      <span className="text-lg flex-shrink-0 mt-0.5">{TYPE_ICONS[notification.type] ?? '🔔'}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
          {notification.title}
        </p>
        <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
          {notification.body}
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
          {notification.timeAgo}
        </p>
      </div>
      {!notification.isRead && (
        <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
      )}
    </div>
  );
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data: notifications = [] } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadCount();
  const markAllRead = useMarkAllRead();
  const markRead = useMarkRead();

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="relative p-2 rounded-lg transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(59,130,246,0.8)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'; }}
          title="Notifications"
        >
          <Bell style={{ width: '20px', height: '20px' }} />
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: '#EF4444', fontSize: '10px', padding: '0 4px' }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 p-0"
        style={{ backgroundColor: 'var(--surface-primary)', borderColor: 'var(--border-primary)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: 'var(--border-primary)' }}
        >
          <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
            Notifications {unreadCount > 0 && <span className="text-blue-500">({unreadCount})</span>}
          </span>
          {unreadCount > 0 && (
            <button
              className="flex items-center gap-1 text-xs transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onClick={() => markAllRead.mutate()}
            >
              <CheckCheck className="w-3 h-3" />
              Mark all read
            </button>
          )}
        </div>

        {/* List */}
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="py-8 text-center" style={{ color: 'var(--text-tertiary)' }}>
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <div>
              {notifications.map((n) => (
                <NotificationItem key={n.id} notification={n} onRead={(id) => markRead.mutate(id)} />
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
