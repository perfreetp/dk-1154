export interface Message {
  id: string;
  type: 'invite' | 'chat' | 'system';
  title?: string;
  content: string;
  fromUserId?: string;
  fromUserName?: string;
  fromUserAvatar?: string;
  toUserId: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
}

export interface ChatMessage {
  id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  type: 'text' | 'image' | 'card';
  createdAt: string;
}
