import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private chatSocket: Socket | null = null;
  private commentsSocket: Socket | null = null;

  private chatConnected = new BehaviorSubject<boolean>(false);
  private commentsConnected = new BehaviorSubject<boolean>(false);

  public chatConnected$ = this.chatConnected.asObservable();
  public commentsConnected$ = this.commentsConnected.asObservable();

  constructor(private storageService: StorageService) {}

  // Chat WebSocket
  connectChat(): void {
    if (this.chatSocket?.connected) return;

    const token = this.storageService.getToken();
    if (!token) return;

    this.chatSocket = io(`${environment.wsUrl}/chat`, {
      auth: { token },
      transports: ['websocket'],
    });

    this.chatSocket.on('connect', () => {
      console.log('Chat WebSocket connected');
      this.chatConnected.next(true);
    });

    this.chatSocket.on('disconnect', () => {
      console.log('Chat WebSocket disconnected');
      this.chatConnected.next(false);
    });

    this.chatSocket.on('connect_error', (error) => {
      console.error('Chat WebSocket connection error:', error);
      this.chatConnected.next(false);
    });
  }

  disconnectChat(): void {
    if (this.chatSocket) {
      this.chatSocket.disconnect();
      this.chatSocket = null;
      this.chatConnected.next(false);
    }
  }

  // Chat methods
  joinProject(projectId: string): Observable<any> {
    return new Observable((observer) => {
      if (!this.chatSocket) {
        observer.error('Chat socket not connected');
        return;
      }
      this.chatSocket.emit('joinProject', { projectId }, (response: any) => {
        if (response.error) {
          observer.error(response.error);
        } else {
          observer.next(response);
          observer.complete();
        }
      });
    });
  }

  leaveProject(projectId: string): void {
    if (this.chatSocket) {
      this.chatSocket.emit('leaveProject', { projectId });
    }
  }

  sendMessage(content: string, projectId: string): Observable<any> {
    return new Observable((observer) => {
      if (!this.chatSocket) {
        observer.error('Chat socket not connected');
        return;
      }
      this.chatSocket.emit('sendMessage', { content, projectId }, (response: any) => {
        if (response.error) {
          observer.error(response.error);
        } else {
          observer.next(response);
          observer.complete();
        }
      });
    });
  }

  deleteMessage(messageId: string, projectId: string): Observable<any> {
    return new Observable((observer) => {
      if (!this.chatSocket) {
        observer.error('Chat socket not connected');
        return;
      }
      this.chatSocket.emit('deleteMessage', { messageId, projectId }, (response: any) => {
        if (response.error) {
          observer.error(response.error);
        } else {
          observer.next(response);
          observer.complete();
        }
      });
    });
  }

  sendTyping(projectId: string, isTyping: boolean): void {
    if (this.chatSocket) {
      this.chatSocket.emit('typing', { projectId, isTyping });
    }
  }

  onNewMessage(): Observable<any> {
    return new Observable((observer) => {
      if (!this.chatSocket) return;
      this.chatSocket.on('newMessage', (message) => observer.next(message));
    });
  }

  onMessageDeleted(): Observable<any> {
    return new Observable((observer) => {
      if (!this.chatSocket) return;
      this.chatSocket.on('messageDeleted', (data) => observer.next(data));
    });
  }

  onUserJoined(): Observable<any> {
    return new Observable((observer) => {
      if (!this.chatSocket) return;
      this.chatSocket.on('userJoined', (data) => observer.next(data));
    });
  }

  onUserLeft(): Observable<any> {
    return new Observable((observer) => {
      if (!this.chatSocket) return;
      this.chatSocket.on('userLeft', (data) => observer.next(data));
    });
  }

  onUserTyping(): Observable<any> {
    return new Observable((observer) => {
      if (!this.chatSocket) return;
      this.chatSocket.on('userTyping', (data) => observer.next(data));
    });
  }

  // Comments WebSocket
  connectComments(): void {
    if (this.commentsSocket?.connected) return;

    const token = this.storageService.getToken();
    if (!token) return;

    this.commentsSocket = io(`${environment.wsUrl}/comments`, {
      auth: { token },
      transports: ['websocket'],
    });

    this.commentsSocket.on('connect', () => {
      console.log('Comments WebSocket connected');
      this.commentsConnected.next(true);
    });

    this.commentsSocket.on('disconnect', () => {
      console.log('Comments WebSocket disconnected');
      this.commentsConnected.next(false);
    });
  }

  disconnectComments(): void {
    if (this.commentsSocket) {
      this.commentsSocket.disconnect();
      this.commentsSocket = null;
      this.commentsConnected.next(false);
    }
  }

  // Comment methods
  joinTask(taskId: string): void {
    if (this.commentsSocket) {
      this.commentsSocket.emit('joinTask', { taskId });
    }
  }

  leaveTask(taskId: string): void {
    if (this.commentsSocket) {
      this.commentsSocket.emit('leaveTask', { taskId });
    }
  }

  onCommentCreated(): Observable<any> {
    return new Observable((observer) => {
      if (!this.commentsSocket) return;
      this.commentsSocket.on('commentCreated', (comment) => observer.next(comment));
    });
  }

  onCommentAdded(): Observable<any> {
    return new Observable((observer) => {
      if (!this.commentsSocket) {
        // Connect if not already connected
        this.connectComments();
      }
      this.commentsSocket?.on('commentCreated', (comment) => observer.next(comment));
      this.commentsSocket?.on('newComment', (comment) => observer.next(comment));
    });
  }

  onCommentUpdated(): Observable<any> {
    return new Observable((observer) => {
      if (!this.commentsSocket) return;
      this.commentsSocket.on('commentUpdated', (comment) => observer.next(comment));
    });
  }

  onCommentDeleted(): Observable<any> {
    return new Observable((observer) => {
      if (!this.commentsSocket) return;
      this.commentsSocket.on('commentDeleted', (data) => observer.next(data));
    });
  }

  // Disconnect all
  disconnectAll(): void {
    this.disconnectChat();
    this.disconnectComments();
  }
}
