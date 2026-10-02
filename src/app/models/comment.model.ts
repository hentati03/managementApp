import { User } from './user.model';

export interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  taskId: string;
  authorId: string;
  author?: User;
}

export interface CreateCommentRequest {
  content: string;
  taskId: string;
}

export interface UpdateCommentRequest {
  content: string;
}
