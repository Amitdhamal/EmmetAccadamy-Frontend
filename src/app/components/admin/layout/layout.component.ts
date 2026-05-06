import { Component, signal, inject, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

interface NavItem {
  path: string;
  icon: string;
  label: string;
  adminOnly?: boolean;
  badge?: string;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl:'./layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnDestroy {
  auth = inject(AuthService);
  sidebarOpen = signal(false);
  role = 'User';
  constructor() {
    const user = this.auth.currentUser();
    const role = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Unknown';
    this.role = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Unknown';
  }
  mainNav: NavItem[] = [
    { path: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: 'notices', icon: 'campaign', label: 'Notices' },
  ];

  managementNav: NavItem[] = [
    { path: 'staff', icon: 'people', label: 'Staff', adminOnly: true },
    { path: 'students', icon: 'school', label: 'Students', },
    { path: 'courses', icon: 'menu_book', label: 'Courses' },
    { path: 'batches', icon: 'group_work', label: 'Batches' },
  ];

  ngOnDestroy(): void {
    // Reset sidebar state to prevent memory leaks
    this.sidebarOpen.set(false);
  }
}
