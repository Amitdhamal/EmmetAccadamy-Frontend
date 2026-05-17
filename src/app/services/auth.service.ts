import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User, AuthState } from '../models/models';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  http = inject(HttpClient);
  appCurrentUser = signal<User | null>(null);
  private readonly STORAGE_KEY = 'auth';

  // Seed users
  private readonly users: User[] = []

  private _authState = signal<AuthState>({ user: null, isLoggedIn: false});

  readonly authState = this._authState.asReadonly();
  readonly currentUser = computed(() => {
    localStorage.setItem('currentUser', JSON.stringify(this._authState().user));
    return this._authState().user
  });
  readonly isLoggedIn = computed(() => this._authState().isLoggedIn);
  readonly isAdmin = computed(() => this._authState().user?.role === 'admin');
  readonly isActive = computed(() => this._authState().user?.isActive);
  readonly isStaff = computed(() => ((this._authState().user?.role === 'staff') || this._authState().user?.role === 'admin'));
  readonly isStudent = computed(() => this._authState().user?.role === 'student');

  constructor(private router: Router) {
    this.restoreSession();
  }

  login(email: string, password: string): any {
    this.http.post<any>(`${environment.baseUrl}users/login`, { email, password }).subscribe({
      next: (res) => {
        if (res?.status === 'success' && res?.data?.token) {  
          const { token, user } = res.data;
          console.log('Login successful:', user);
          this._authState.set({ user, isLoggedIn: true });
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify({ token, userId: user.id }));
          this.appCurrentUser.set(user);
          this.router.navigate(['/dashboard']);
        } else {
          console.error('Login failed:', res);
        }
        console.log('authState:', this.authState());
        return { success: res?.status === 'success', message: res?.message || 'Login failed' };
      },
      error: (err) => {
        console.error('Login error:', err);
        return { success: false, message: 'An error occurred during login' };
      }
    });
    
  }

  register(name: string, email: string, password: string, role: 'staff' | 'student' = 'student') {
    return this.http.post<any>(`${environment.baseUrl}users/register`, { name, email, password, role });
  }

  logout(): void {
    this._authState.set({ user: null, isLoggedIn: false });
    localStorage.removeItem(this.STORAGE_KEY);
    this.router.navigate(['/login']);
  }

  getAllUsers(): User[]  {
    this.http.get<any>(`${environment.baseUrl}users`).subscribe({
      next: (res) => {
        if (res?.status === 'success' && Array.isArray(res.data)) {
          this.users.splice(0, this.users.length, ...res.data);
        }
      }
    });
    return this.users;
  }

  private async restoreSession(): Promise<void> {
    try {
      const user = this.appCurrentUser() || JSON.parse(localStorage.getItem('currentUser') || 'null');
      console.log('Restoring session, current user:', user);
      if (user) this._authState.set({ user, isLoggedIn: true});
    } catch { /* ignore */ }
  }

  getUserInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
