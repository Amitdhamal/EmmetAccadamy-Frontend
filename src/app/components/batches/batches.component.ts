import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';
import { Batch } from '../../models/models';

@Component({
  selector: 'app-batches',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './batches.component.html',
  styleUrls: ['batches.component.scss']
})
export class BatchesComponent {
  data = inject(DataService);
  toast = inject(ToastService);
  auth = inject(AuthService);
  fb = inject(FormBuilder);

  search = '';
  filterStatus = '';
  modalOpen = signal(false);
  editing = signal(false);
  editId = signal('');
  deleteTarget = signal<Batch | null>(null);

  batchForm = this.fb.group({
    name: ['', Validators.required],
    courseId: ['', Validators.required],
    courseName: [''],
    instructor: ['', Validators.required],
    room: ['Lab 1'],
    startDateStr: ['', Validators.required],
    endDateStr: ['', Validators.required],
    timing: ['', Validators.required],
    capacity: [30, Validators.required],
    enrolled: [0],
    status: ['upcoming', Validators.required]
  });

  filteredBatches = computed(() => {
    let list = this.data.batches();
    return list;
  });

  emptyForm() {
    return { name: '', courseId: '', courseName: '', instructor: '', room: 'Lab 1', startDateStr: '', endDateStr: '', timing: '', capacity: 30, enrolled: 0, status: 'upcoming' as Batch['status'] };
  }

  onCourseSelect() {
    const courseId = this.batchForm.get('courseId')?.value;
    const course = this.data.courses().find(c => c._id === courseId);
    if (course) {
      this.batchForm.patchValue({
        courseName: course.title,
        instructor: course.instructor,
        capacity: course.maxCapacity
      });
    }
  }

  openModal(batch?: Batch) {
    if (batch) {
      this.editing.set(true);
      this.editId.set(batch.id);
      this.batchForm.reset({
        name: batch.name,
        courseId: batch.courseId,
        courseName: batch.courseName,
        instructor: batch.instructor,
        room: batch.room,
        startDateStr: new Date(batch.startDate).toISOString().split('T')[0],
        endDateStr: new Date(batch.endDate).toISOString().split('T')[0],
        timing: batch.timing,
        capacity: batch.capacity,
        enrolled: batch.enrolled,
        status: batch.status
      });
    } else {
      this.editing.set(false);
      this.editId.set('');
      this.batchForm.reset(this.emptyForm());
    }
    this.modalOpen.set(true);
  }

  onInputChange() {
    // Trigger change detection by re-computing the filtered list
    this.filteredBatches = computed(() => {
      let list = this.data.batches();
      if (this.search) { const s = this.search.toLowerCase(); list = list.filter(x => x.name.toLowerCase().includes(s) || x.courseName.toLowerCase().includes(s)); }
      if (this.filterStatus) list = list.filter(x => x.status === this.filterStatus);
      return list;
    });
  }

  closeModal(e: Event) { if (e.target === e.currentTarget) this.closeModalDirect(); }
  closeModalDirect() { this.modalOpen.set(false); }

  saveBatch() {
    if (this.batchForm.invalid) {
      this.toast.error('Please fill all required batch fields.');
      return;
    }

    const formValue = this.batchForm.value as {
      name: string;
      courseId: string;
      courseName: string;
      instructor: string;
      room: string;
      startDateStr: string;
      endDateStr: string;
      timing: string;
      capacity: number;
      enrolled: number;
      status: Batch['status'];
    };

    const payload = {
      name: formValue.name,
      courseId: formValue.courseId,
      courseName: formValue.courseName,
      instructor: formValue.instructor,
      room: formValue.room,
      startDate: new Date(formValue.startDateStr || ''),
      endDate: new Date(formValue.endDateStr || ''),
      timing: formValue.timing,
      capacity: formValue.capacity,
      enrolled: formValue.enrolled,
      status: formValue.status
    };

    if (this.editing()) {
      this.data.updateBatch(this.editId(), payload);
      this.toast.success('Batch updated!');
    } else {
      this.data.addBatch(payload);
      this.toast.success('Batch added!');
    }
    this.closeModalDirect();
  }

  confirmDelete(b: Batch) { this.deleteTarget.set(b); }
  doDelete() { if (this.deleteTarget()) { this.data.deleteBatch(this.deleteTarget()!.id); this.toast.success('Batch deleted.'); this.deleteTarget.set(null); } }

  getStatusBadge(s: string) { const m: Record<string,string> = { ongoing: 'badge-success', upcoming: 'badge-warning', completed: 'badge-info' }; return m[s] ?? 'badge-secondary'; }
}
