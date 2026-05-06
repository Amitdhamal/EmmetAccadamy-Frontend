import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit{
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  getfullYear() {
    return new Date().getFullYear();
  }

  registerForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    role: ['student', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', Validators.required]
  });

  error = signal('');
  loading = signal(false);
  showPwd = signal(false);

  ngOnInit(): void {
      
  }

  onRegister() {
    this.error.set('');
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.error.set('Please complete the registration form.');
      return;
    }

    const { name, email, password, confirmPassword } = this.registerForm.value;
    if (password !== confirmPassword) {
      this.error.set('Passwords do not match.');
      return;
    }

    this.loading.set(true);
    setTimeout(() => {
      const role = (this.registerForm.value.role as 'staff' | 'student') ?? 'student';
      const result = this.auth.register(name ?? '', email ?? '', password ?? '', role);
      this.loading.set(false);
      if (result.success) {
        this.toast.success(result.message);
        this.router.navigate(['/login']);
      } else {
        this.error.set(result.message);
      }
    }, 600);
  }
}
