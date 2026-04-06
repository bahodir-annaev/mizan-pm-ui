import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/websocket';
import { USE_MOCK_DATA } from '@/lib/config';

export interface WebSocketState {
  isConnected: boolean;
  isMock: boolean;
}

export function useWebSocket(): WebSocketState {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (USE_MOCK_DATA) return;

    const socket = getSocket();
    if (!socket) return;

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    setIsConnected(socket.connected);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return { isConnected, isMock: USE_MOCK_DATA };
}
