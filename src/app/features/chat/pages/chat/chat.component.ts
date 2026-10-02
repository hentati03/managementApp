import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProjectService } from '../../../../core/services/project.service';
import { WebSocketService } from '../../../../core/services/websocket.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Project, ChatMessage, User } from '../../../../models';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-chat',
  template: `
    <div class="h-[calc(100vh-8rem)] flex">
      <!-- Project List -->
      <div class="w-80 bg-white border-r border-secondary-200 flex flex-col">
        <div class="p-4 border-b border-secondary-200">
          <h2 class="font-semibold text-secondary-900">Project Chats</h2>
        </div>
        
        <div *ngIf="isLoading" class="flex justify-center py-8">
          <app-loading-spinner></app-loading-spinner>
        </div>

        <div class="flex-1 overflow-y-auto">
          <div
            *ngFor="let project of projects"
            class="px-4 py-3 border-b border-secondary-100 cursor-pointer hover:bg-secondary-50 transition-colors"
            [class.bg-primary-50]="selectedProject?.id === project.id"
            (click)="selectProject(project)"
          >
            <p class="font-medium text-secondary-900 truncate">{{ project.name }}</p>
            <p class="text-sm text-secondary-500 truncate">{{ project.description || 'No description' }}</p>
          </div>
        </div>
      </div>

      <!-- Chat Area -->
      <div class="flex-1 flex flex-col bg-secondary-50">
        <div *ngIf="!selectedProject" class="flex-1 flex items-center justify-center">
          <app-empty-state
            icon="chat"
            title="Select a project"
            description="Choose a project from the list to start chatting with your team."
          ></app-empty-state>
        </div>

        <ng-container *ngIf="selectedProject">
          <!-- Chat Header -->
          <div class="px-6 py-4 bg-white border-b border-secondary-200">
            <h3 class="font-semibold text-secondary-900">{{ selectedProject.name }}</h3>
            <p class="text-sm text-secondary-500">
              {{ selectedProject.members?.length || 0 }} members
            </p>
          </div>

          <!-- Messages -->
          <div class="flex-1 overflow-y-auto p-6 space-y-4">
            <div *ngIf="messages.length === 0" class="text-center py-8">
              <p class="text-secondary-500">No messages yet. Start the conversation!</p>
            </div>

            <div *ngFor="let message of messages" class="flex gap-3" [class.flex-row-reverse]="isOwnMessage(message)">
              <app-avatar
                [name]="message.sender?.firstName + ' ' + message.sender?.lastName"
                size="sm"
              ></app-avatar>
              <div [class.items-end]="isOwnMessage(message)" class="flex flex-col max-w-md">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-sm font-medium text-secondary-900">
                    {{ message.sender?.firstName }} {{ message.sender?.lastName }}
                  </span>
                  <span class="text-xs text-secondary-500">
                    {{ message.createdAt | date:'shortTime' }}
                  </span>
                </div>
                <div
                  class="px-4 py-2 rounded-2xl"
                  [ngClass]="isOwnMessage(message) ? 'bg-primary-600 text-white' : 'bg-white text-secondary-900'"
                >
                  {{ message.content }}
                </div>
              </div>
            </div>
          </div>

          <!-- Message Input -->
          <div class="px-6 py-4 bg-white border-t border-secondary-200">
            <form (submit)="sendMessage($event)" class="flex gap-3">
              <input
                type="text"
                [(ngModel)]="newMessage"
                name="message"
                placeholder="Type a message..."
                class="flex-1 input-field"
              />
              <button type="submit" class="btn-primary" [disabled]="!newMessage.trim()">
                Send
              </button>
            </form>
          </div>
        </ng-container>
      </div>
    </div>
  `,
  styles: [],
})
export class ChatComponent implements OnInit, OnDestroy {
  projects: Project[] = [];
  selectedProject: Project | null = null;
  messages: ChatMessage[] = [];
  newMessage = '';
  isLoading = true;
  currentUser: User | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private projectService: ProjectService,
    private wsService: WebSocketService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    this.loadProjects();
    this.setupWebSocket();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.selectedProject) {
      this.wsService.leaveProject(this.selectedProject.id);
    }
    this.wsService.disconnectChat();
  }

  loadProjects(): void {
    this.projectService.getMyProjects().subscribe({
      next: (response) => {
        this.projects = response.data || [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  setupWebSocket(): void {
    this.wsService.connectChat();
    
    this.wsService.onNewMessage()
      .pipe(takeUntil(this.destroy$))
      .subscribe((message) => {
        if (message.projectId === this.selectedProject?.id) {
          this.messages.push(message);
        }
      });
  }

  selectProject(project: Project): void {
    if (this.selectedProject) {
      this.wsService.leaveProject(this.selectedProject.id);
    }
    
    this.selectedProject = project;
    this.messages = [];
    
    this.wsService.joinProject(project.id).subscribe({
      next: (response) => {
        this.messages = response.messages || [];
      },
    });
  }

  isOwnMessage(message: ChatMessage): boolean {
    return message.senderId === this.currentUser?.id;
  }

  sendMessage(event: Event): void {
    event.preventDefault();
    if (!this.newMessage.trim() || !this.selectedProject) return;

    this.wsService.sendMessage(this.newMessage, this.selectedProject.id).subscribe({
      next: () => {
        this.newMessage = '';
      },
    });
  }
}
