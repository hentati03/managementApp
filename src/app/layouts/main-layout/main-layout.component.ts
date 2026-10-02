import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../models';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[];
}

@Component({
  selector: 'app-main-layout',
  template: `
    <div class="min-h-screen bg-secondary-50 flex">
      <!-- Sidebar -->
      <aside
        class="fixed inset-y-0 left-0 z-50 w-64 bg-secondary-900 transform transition-transform duration-300 lg:translate-x-0"
        [class.-translate-x-full]="!sidebarOpen"
      >
        <!-- Logo -->
        <div class="h-16 flex items-center px-6 border-b border-secondary-800">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span class="text-white font-semibold text-lg">PM App</span>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="mt-6 px-3">
          <div class="space-y-1">
            <a
              *ngFor="let item of visibleNavItems"
              [routerLink]="item.route"
              routerLinkActive="bg-secondary-800 text-white"
              [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
              class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary-400 hover:bg-secondary-800 hover:text-white transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  [attr.d]="item.icon"
                />
              </svg>
              {{ item.label }}
            </a>
          </div>
        </nav>

        <!-- User Info at Bottom -->
        <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-secondary-800">
          <div class="flex items-center gap-3">
            <a routerLink="/profile" class="block">
              <div
                *ngIf="!currentUser?.avatar"
                class="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium"
              >
                {{ userInitials }}
              </div>
              <img
                *ngIf="currentUser?.avatar"
                [src]="currentUser!.avatar"
                class="w-10 h-10 rounded-full object-cover"
                alt="Avatar"
              />
            </a>
            <div class="flex-1 min-w-0">
              <a routerLink="/profile" class="text-white text-sm font-medium truncate block hover:text-primary-400">
                {{ userName }}
              </a>
              <p class="text-secondary-400 text-xs truncate">{{ userRole }}</p>
            </div>
            <button
              (click)="logout()"
              class="p-2 text-secondary-400 hover:text-white transition-colors"
              title="Logout"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <!-- Overlay -->
      <div
        *ngIf="sidebarOpen"
        class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        (click)="sidebarOpen = false"
      ></div>

      <!-- Main Content -->
      <div class="flex-1 lg:ml-64">
        <!-- Top Bar -->
        <header class="h-16 bg-white border-b border-secondary-200 flex items-center px-4 lg:px-6 sticky top-0 z-30">
          <button
            class="p-2 -ml-2 lg:hidden text-secondary-600 hover:text-secondary-900"
            (click)="sidebarOpen = !sidebarOpen"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div class="flex-1"></div>

          <!-- Search -->
          <div class="hidden md:flex items-center mr-4">
            <div class="relative">
              <svg class="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search..."
                class="pl-10 pr-4 py-2 w-64 bg-secondary-100 border-0 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:bg-white"
              />
            </div>
          </div>

          <!-- Notifications -->
          <button class="p-2 text-secondary-600 hover:text-secondary-900 relative">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <!-- User Menu -->
          <div class="ml-3 relative" [matMenuTriggerFor]="userMenu">
            <button class="flex items-center gap-2 p-1 rounded-lg hover:bg-secondary-100">
              <div
                *ngIf="!currentUser?.avatar"
                class="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium"
              >
                {{ userInitials }}
              </div>
              <img
                *ngIf="currentUser?.avatar"
                [src]="currentUser!.avatar"
                class="w-8 h-8 rounded-full object-cover"
                alt="Avatar"
              />
              <svg class="w-4 h-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          <mat-menu #userMenu="matMenu" xPosition="before">
            <button mat-menu-item routerLink="/profile">
              <svg class="w-5 h-5 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Profile</span>
            </button>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="logout()">
              <svg class="w-5 h-5 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Logout</span>
            </button>
          </mat-menu>
        </header>

        <!-- Page Content -->
        <main class="p-4 lg:p-6">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [],
})
export class MainLayoutComponent {
  sidebarOpen = false;

  navItems: NavItem[] = [
    {
      label: 'Dashboard',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      route: '/dashboard',
    },
    {
      label: 'Projects',
      icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
      route: '/projects',
    },
    {
      label: 'Tasks',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
      route: '/tasks',
    },
    {
      label: 'Time Tracking',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      route: '/time-tracking',
    },
    {
      label: 'Chat',
      icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
      route: '/chat',
    },
    // {
    //   label: 'Analytics',
    //   icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    //   route: '/analytics',
    //   roles: ['ADMIN', 'PROJECT_MANAGER'],
    // },
    {
      label: 'Users',
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      route: '/users',
      roles: ['ADMIN'],
    },
  ];

  constructor(private authService: AuthService, private router: Router) {}

  get currentUser(): User | null {
    return this.authService.currentUser;
  }

  get userName(): string {
    if (!this.currentUser) return '';
    return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
  }

  get userInitials(): string {
    if (!this.currentUser) return '?';
    return (
      this.currentUser.firstName.charAt(0) +
      this.currentUser.lastName.charAt(0)
    ).toUpperCase();
  }

  get userRole(): string {
    if (!this.currentUser) return '';
    return this.currentUser.role.replace('_', ' ');
  }

  get visibleNavItems(): NavItem[] {
    return this.navItems.filter((item) => {
      if (!item.roles) return true;
      return this.authService.hasRole(item.roles);
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
