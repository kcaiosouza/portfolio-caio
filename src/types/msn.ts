export type MsnStatus = 'online' | 'busy' | 'away' | 'offline';

export interface MsnContact {
  id: string;
  name: string;
  status: MsnStatus;
  personalMessage: string;
  avatar?: string;
  group: 'online' | 'direct' | 'offline';
  isDirectContact?: boolean;
}

export interface MsnMessage {
  id: string;
  sender: 'user' | 'caio' | 'system';
  senderName: string;
  text: string;
  timestamp: number;
  type?: 'chat' | 'nudge' | 'system';
}
