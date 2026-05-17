import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from '../../services/data.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl:  './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  auth = inject(AuthService);
  data = inject(DataService);
  today = new Date();

  stats = computed(() => this.data.getDashboardStats());
  recentNotices = computed(() => this.data.activeNotices().slice(0, 4));
  ongoingBatches = computed(() => this.data.batches().filter(b => b.status === 'ongoing'));

  greeting(): string {
    const h = this.today.getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  }

  getCategoryColor(cat: string): string {
    const map: Record<string, string> = {
      general: 'secondary', exam: 'warning', holiday: 'success',
      event: 'info', urgent: 'danger', fee: 'warning'
    };
    return map[cat] ?? 'secondary';
  }
}
