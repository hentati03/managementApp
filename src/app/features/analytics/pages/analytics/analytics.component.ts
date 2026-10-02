import { Component } from '@angular/core';

@Component({
  selector: 'app-analytics',
  template: `
    <div>
      <app-page-header
        title="Analytics"
        subtitle="View insights and reports on your projects"
      ></app-page-header>

      <div class="card">
        <app-empty-state
          icon="folder"
          title="Analytics Dashboard"
          message="Analytics and reporting features coming soon. You'll see charts and insights about your projects and team productivity."
        ></app-empty-state>
      </div>
    </div>
  `,
})
export class AnalyticsComponent {}
