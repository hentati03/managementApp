import { Component, OnInit } from '@angular/core';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { TaskService } from '../../../../core/services/task.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Task } from '../../../../models';
import { ToastrService } from 'ngx-toastr';

interface KanbanColumn {
  id: string;
  title: string;
  status: string;
  tasks: Task[];
  color: string;
}

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
})
export class TaskListComponent implements OnInit {
  columns: KanbanColumn[] = [
    { id: 'todo', title: 'To Do', status: 'TODO', tasks: [], color: '#6B7280' },
    {
      id: 'in-progress',
      title: 'In Progress',
      status: 'IN_PROGRESS',
      tasks: [],
      color: '#3B82F6',
    },
    { id: 'done', title: 'Done', status: 'DONE', tasks: [], color: '#10B981' },
  ];

  allTasks: Task[] = [];
  projectOptions: { id: string; name: string }[] = [];
  projectFilter = '';
  assigneeFilter = '';
  isLoading = true;
  showCreateModal = false;
  showTimeEntryModal = false;
  showTaskDetailModal = false;
  selectedTask: Task | null = null;
  taskForTimeEntry: { task: Task; newStatus: string } | null = null;

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadTasks();
    this.loadProjectOptions();
  }

  get canFilterByAssignee(): boolean {
    return this.authService.isManager();
  }

  loadTasks(): void {
    this.isLoading = true;

    const params: any = {};
    if (this.projectFilter) params.projectId = this.projectFilter;

    // For team members, always show only their tasks
    if (!this.authService.isManager()) {
      params.assigneeId = this.authService.getCurrentUser()?.id;
    } else if (this.assigneeFilter === 'me') {
      params.assigneeId = this.authService.getCurrentUser()?.id;
    }

    this.taskService.getAll(params).subscribe({
      next: (response) => {
        this.allTasks = response.data || [];
        this.distributeTasksToColumns();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Failed to load tasks');
      },
    });
  }

  loadProjectOptions(): void {
    this.taskService.getAll().subscribe({
      next: (response) => {
        const tasks = response.data || [];
        const projectMap = new Map<string, string>();
        tasks.forEach((task) => {
          if (task.project) {
            projectMap.set(task.project.id, task.project.name);
          }
        });
        this.projectOptions = Array.from(projectMap.entries()).map(
          ([id, name]) => ({ id, name })
        );
      },
    });
  }

  distributeTasksToColumns(): void {
    this.columns.forEach((column) => {
      column.tasks = this.allTasks.filter(
        (task) => task.status === column.status
      );
    });
  }

  onDrop(event: CdkDragDrop<Task[]>, column: KanbanColumn): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      const task = event.previousContainer.data[event.previousIndex];
      const newStatus = column.status;

      // Store the drag context for the modal
      this.taskForTimeEntry = { task, newStatus };
      this.showTimeEntryModal = true;

      // Store the event context for later use
      (this as any)._pendingDrop = {
        event,
        column,
      };
    }
  }

  openTaskDetail(task: Task): void {
    this.selectedTask = task;
    this.showTaskDetailModal = true;
  }

  openCreateDialog(): void {
    this.showCreateModal = true;
  }

  handleCreateModalClose(result: any): void {
    this.showCreateModal = false;
    if (result) {
      const column = this.columns.find((c) => c.status === result.status);
      if (column) {
        column.tasks.unshift(result);
      }
      this.allTasks.push(result);
    }
  }

  handleTaskDetailClose(): void {
    this.showTaskDetailModal = false;
    this.selectedTask = null;
  }

  handleTimeEntryClose(result: any): void {
    this.showTimeEntryModal = false;
    if (result?.success && this.taskForTimeEntry) {
      // Handle the drag and drop success
      const task = this.taskForTimeEntry.task;
      const newStatus = this.taskForTimeEntry.newStatus;
      task.status = newStatus as any;
      this.loadTasks(); // Reload to get updated data
    }
    this.taskForTimeEntry = null;
  }

  isOverdue(task: Task): boolean {
    if (!task.dueDate || task.status === 'DONE') return false;
    return new Date(task.dueDate) < new Date();
  }
}
