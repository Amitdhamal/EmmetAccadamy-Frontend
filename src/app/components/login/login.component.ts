import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl:'./login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });
  error = signal('');
  loading = signal(false);
  showPwd = signal(false);

  fillDemo(role: 'admin' | 'staff' | 'student') {
    const creds = {
      admin: { email: 'vasudev@emmetacademy.in', password: 'admin123' },
      staff: { email: 'dronacharya@emmetacademy.in', password: 'staff123' },
      student: { email: 'eklavya@emmetacademy.in', password: 'student123' }
    };
    this.loginForm.patchValue({
      email: creds[role].email,
      password: creds[role].password
    });
    this.error.set('');
  }

  onLogin() {
    this.error.set('');
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.error.set('Please enter email and password.');
      return;
    }

    this.loading.set(true);
    const { email, password } = this.loginForm.value;

    setTimeout(() => {
      const result = this.auth.login(email ?? '', password ?? '');
      this.loading.set(false);
      if (result.success) {
        this.toast.success('Welcome back!');
        this.router.navigate(['/dashboard']);
      } else {
        this.error.set(result.message);
      }
    }, 600);
  }
}
