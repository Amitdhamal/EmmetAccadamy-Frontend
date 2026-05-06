import { Component, inject, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';
import { Notice } from '../../models/models';

@Component({
  selector: 'app-notices',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './notices.component.html',
  styleUrls: ['notices.component.scss']
})
export class NoticesComponent implements OnDestroy {
  data = inject(DataService);
  toast = inject(ToastService);
  auth = inject(AuthService);
  fb = inject(FormBuilder);

  search = '';
  filterCategory = '';
  filterAudience : any = '';
  modalOpen = signal(false);
  editing = signal(false);
  editId = signal('');
  deleteTarget = signal<Notice | null>(null);

  noticeForm = this.fb.group({
    title: ['', Validators.required],
    content: ['', Validators.required],
    category: ['general'],
    targetAudience: ['all'],
    expiryDateStr: [''],
    isPinned: [false],
    isActive: [true]
  });

  pinnedNotices = computed(() =>
    this.data.activeNotices().filter(n => n.isPinned)
  );

  filteredNotices = computed(() => {
    let notices = this.data.notices();
    // if (this.search) {
    //   const s = this.search.toLowerCase();
    //   notices = notices.filter(n => n.title.toLowerCase().includes(s) || n.content.toLowerCase().includes(s));
    // }
    // if (this.filterCategory) notices = notices.filter(n => n.category === this.filterCategory);
    if (this.filterAudience) notices = notices.filter(n => n.targetAudience === this.filterAudience);
    return notices;
  });

  emptyForm() {
    return { title: '', content: '', category: 'general' as Notice['category'], targetAudience: 'all' as Notice['targetAudience'], isPinned: false, isActive: true, expiryDateStr: '' };
  }

  openModal(notice?: Notice) {
    if (notice) {
      this.editing.set(true);
      this.editId.set(notice.id);
      this.noticeForm.reset({
        title: notice.title,
        content: notice.content,
        category: notice.category,
        targetAudience: notice.targetAudience,
        expiryDateStr: notice.expiryDate ? new Date(notice.expiryDate).toISOString().split('T')[0] : '',
        isPinned: notice.isPinned,
        isActive: notice.isActive
      });
    } else {
      this.editing.set(false);
      this.editId.set('');
      this.noticeForm.reset(this.emptyForm());
    }
    this.modalOpen.set(true);
  }

  onInputChange() {
    // Trigger change detection by re-computing the filtered list
    this.filteredNotices = computed(() => {
      let notices = this.data.notices();
      if (this.search) {
        const s = this.search.toLowerCase();
        notices = notices.filter(n => n.title.toLowerCase().includes(s) || n.content.toLowerCase().includes(s));
      }
      if (this.filterCategory) notices = notices.filter(n => n.category === this.filterCategory);
      if (this.filterAudience) notices = notices.filter(n => n.targetAudience === this.filterAudience);
      return notices;
    });
  }

  closeModal(e: Event) { if (e.target === e.currentTarget) this.closeModalDirect(); }
  closeModalDirect() { this.modalOpen.set(false); }

  saveNotice() {
    if (this.noticeForm.invalid) {
      this.noticeForm.markAllAsTouched();
      this.toast.error('Title and content are required.');
      return;
    }

    const formValue = this.noticeForm.value as {
      title: string;
      content: string;
      category: Notice['category'];
      targetAudience: Notice['targetAudience'];
      expiryDateStr: string;
      isPinned: boolean;
      isActive: boolean;
    };

    const payload = {
      title: formValue.title,
      content: formValue.content,
      category: formValue.category,
      targetAudience: formValue.targetAudience,
      isPinned: formValue.isPinned,
      isActive: formValue.isActive,
      postedBy: this.auth.currentUser()?.name ?? 'Admin',
      expiryDate: formValue.expiryDateStr ? new Date(formValue.expiryDateStr) : undefined
    };
    if (this.editing()) {
      this.data.updateNotice(this.editId(), payload);
      this.toast.success('Notice updated successfully!');
    } else {
      this.data.addNotice(payload);
      this.toast.success('Notice published!');
    }
    this.closeModalDirect();
  }

  togglePin(notice: Notice) {
    this.data.updateNotice(notice.id, { isPinned: !notice.isPinned });
    this.toast.info(notice.isPinned ? 'Notice unpinned.' : 'Notice pinned!');
  }

  confirmDelete(notice: Notice) { this.deleteTarget.set(notice); }
  doDelete() {
    if (this.deleteTarget()) {
      this.data.deleteNotice(this.deleteTarget()!.id);
      this.toast.success('Notice deleted.');
      this.deleteTarget.set(null);
    }
  }

  getCatColor(cat: string): string {
    const m: Record<string, string> = { general: 'secondary', exam: 'warning', holiday: 'success', event: 'info', urgent: 'danger', fee: 'warning' };
    return m[cat] ?? 'secondary';
  }

  ngOnDestroy(): void {
    // Reset signals to prevent memory leaks
    this.modalOpen.set(false);
    this.editing.set(false);
    this.editId.set('');
    this.deleteTarget.set(null);
  }
}
