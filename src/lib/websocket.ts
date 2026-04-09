import { io, Socket } from 'socket.io-client';
import { WS_URL } from './config';
import { getAccessToken } from '@/app/auth/auth-storage';

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function isSocketConnected(): boolean {
  return socket?.connected ?? false;
}

export function connectSocket(): void {
  if (socket?.connected) return;

  const token = getAccessToken();
  if (!token) return;

  // Clean up a stale disconnected socket before creating a new one
  if (socket && !socket.connected) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  socket = io(WS_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });

  socket.on('connect', () => {
    console.debug('[WS] Connected');
  });

  socket.on('disconnect', (reason) => {
    console.debug('[WS] Disconnected:', reason);
  });

  socket.on('connect_error', (err) => {
    console.warn('[WS] Connection error:', err.message);
  });
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function joinProjectRoom(projectId: string): void {
  socket?.emit('join:project', projectId);
}

export function leaveProjectRoom(projectId: string): void {
  socket?.emit('leave:project', projectId);
}

export type WsEventName =
  | 'task:created'
  | 'task:updated'
  | 'task:deleted'
  | 'project:created'
  | 'project:updated'
  | 'time:logged';

export function onWsEvent(event: WsEventName, handler: (data: unknown) => void): () => void {
  if (!socket) return () => {};
  socket.on(event, handler);
  return () => socket?.off(event, handler);
}
