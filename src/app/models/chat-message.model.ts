import { User } from './user.model';

export interface ChatMessage {
  id: string;
  content: string;
  createdAt: Date;
  projectId: string;
  senderId: string;
  sender?: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export interface CreateMessageRequest {
  content: string;
  projectId: string;
}
