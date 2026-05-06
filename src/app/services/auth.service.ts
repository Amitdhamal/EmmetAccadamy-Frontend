import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { User, AuthState } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly STORAGE_KEY = 'EmmetAcademy _auth';

  // Seed users
  private readonly users: User[] = [
    {
      id: 'u1',
      name: 'Prashant Barkale',
      email: 'vasudev@emmetacademy.in',
      password: 'admin123',
      role: 'admin',
      avatar: '',
      createdAt: new Date('2024-01-01'),
      isActive: true
    },
    {
      id: 'u2',
      name: 'Priya Sharma',
      email: 'dronacharya@emmetacademy.in',
      password: 'staff123',
      role: 'staff',
      avatar: '',
      createdAt: new Date('2024-02-15'),
      isActive: true
    },
    {
      id: 'u3',
      name: 'Rahul Patil',
      email: 'eklavya@emmetacademy.in',
      password: 'student123',
      role: 'student',
      avatar: '',
      createdAt: new Date('2024-03-01'),
      isActive: true
    }
  ];

  private _authState = signal<AuthState>({ user: null, isLoggedIn: false });

  readonly authState = this._authState.asReadonly();
  readonly currentUser = computed(() => {
    return this._authState().user
  });
  readonly isLoggedIn = computed(() => this._authState().isLoggedIn);
  readonly isAdmin = computed(() => this._authState().user?.role === 'admin');

  constructor(private router: Router) {
    this.restoreSession();
  }

  login(email: string, password: string): { success: boolean; message: string } {
    const user = this.users.find(u =>
      u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!user) return { success: false, message: 'Invalid email or password.' };
    if (!user.isActive) return { success: false, message: 'Account is deactivated. Contact admin.' };

    const state: AuthState = { user, isLoggedIn: true };
    this._authState.set(state);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify({ userId: user.id }));
    return { success: true, message: 'Login successful!' };
  }

  register(name: string, email: string, password: string, role: 'staff' | 'student' = 'student'): { success: boolean; message: string } {
    const existing = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) return { success: false, message: 'Email is already registered.' };

    const newUser: User = {
      id: `u${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role,
      avatar: '',
      createdAt: new Date(),
      isActive: true
    };

    this.users.push(newUser);
    return { success: true, message: 'Registration successful. Please sign in.' };
  }

  logout(): void {
    this._authState.set({ user: null, isLoggedIn: false });
    localStorage.removeItem(this.STORAGE_KEY);
    this.router.navigate(['/login']);
  }

  private restoreSession(): void {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return;
      const { userId } = JSON.parse(raw);
      const user = this.users.find(u => u.id === userId);
      if (user) this._authState.set({ user, isLoggedIn: true });
    } catch { /* ignore */ }
  }

  getUserInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }
}
