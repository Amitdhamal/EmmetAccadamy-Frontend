import { Routes } from '@angular/router';
import { authGuard, guestGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
  canActivate: [guestGuard],
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./components/admin/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      { path: 'dashboard', loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'notices', loadComponent: () => import('./components/notices/notices.component').then(m => m.NoticesComponent) },
      { path: 'staff', loadComponent: () => import('./components/staff/staff.component').then(m => m.StaffComponent) },
      { path: 'students', loadComponent: () => import('./components/students/students.component').then(m => m.StudentsComponent) },
      { path: 'courses', loadComponent: () => import('./components/courses/courses.component').then(m => m.CoursesComponent) },
      { path: 'batches', loadComponent: () => import('./components/batches/batches.component').then(m => m.BatchesComponent) },
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
