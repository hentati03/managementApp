import { Component } from '@angular/core';

@Component({
  selector: 'app-auth-layout',
  template: `
    <div class="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <svg class="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-white">Project Manager</h1>
          <p class="text-primary-200 mt-1">Manage your projects efficiently</p>
        </div>

        <!-- Content -->
        <div class="bg-white rounded-2xl shadow-xl p-8">
          <router-outlet></router-outlet>
        </div>

        <!-- Footer -->
        <p class="text-center text-primary-200 text-sm mt-6">
          © 2024 Project Manager. All rights reserved.
        </p>
      </div>
    </div>
  `,
  styles: [],
})
export class AuthLayoutComponent {}
