import { Routes } from '@angular/router';

import { AppShellComponent } from './core/layout/app-shell/app-shell.component';

export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'tasks'
      },
      {
        path: 'tasks',
        loadComponent: () =>
          import('./features/tasks/pages/task-list-page/task-list-page.component').then(
            (module) => module.TaskListPageComponent
          )
      },
      {
        path: 'tasks/new',
        loadComponent: () =>
          import('./features/tasks/pages/task-form-page/task-form-page.component').then(
            (module) => module.TaskFormPageComponent
          )
      },
      {
        path: 'tasks/:id/edit',
        loadComponent: () =>
          import('./features/tasks/pages/task-form-page/task-form-page.component').then(
            (module) => module.TaskFormPageComponent
          )
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/users/pages/user-list-page/user-list-page.component').then(
            (module) => module.UserListPageComponent
          )
      },
      {
        path: 'users/new',
        loadComponent: () =>
          import('./features/users/pages/user-form-page/user-form-page.component').then(
            (module) => module.UserFormPageComponent
          )
      },
      {
        path: 'users/:id/edit',
        loadComponent: () =>
          import('./features/users/pages/user-form-page/user-form-page.component').then(
            (module) => module.UserFormPageComponent
          )
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'tasks'
  }
];
