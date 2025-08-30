export interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  profile_image_url: string;
  email?: string;
}

export interface WheelSettings {
  colors: string[];
  winnerText: string;
  spinDuration: number;
}

export interface Participant {
  username: string;
  joinedAt: number;
  weight: number;
}

export interface ConnectionStatus {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  message: string;
}

export interface AudioSettings {
  enabled: boolean;
  context?: AudioContext;
}

export interface Theme {
  current: 'light' | 'dark';
}

export interface NotificationData {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface SpinAnimation {
  isSpinning: boolean;
  duration: number;
  startTime?: number;
  rotation: number;
}