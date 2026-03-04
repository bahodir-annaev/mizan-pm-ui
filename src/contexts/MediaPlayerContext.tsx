import { createContext, useContext, useState, ReactNode } from 'react';

interface MediaPlayerContextType {
  playingTaskId: string | null;
  setPlayingTaskId: (taskId: string | null) => void;
}

const MediaPlayerContext = createContext<MediaPlayerContextType | undefined>(undefined);

export function MediaPlayerProvider({ children }: { children: ReactNode }) {
  const [playingTaskId, setPlayingTaskId] = useState<string | null>(null);

  return (
    <MediaPlayerContext.Provider value={{ playingTaskId, setPlayingTaskId }}>
      {children}
    </MediaPlayerContext.Provider>
  );
}

export function useMediaPlayer() {
  const context = useContext(MediaPlayerContext);
  if (context === undefined) {
    throw new Error('useMediaPlayer must be used within a MediaPlayerProvider');
  }
  return context;
}
