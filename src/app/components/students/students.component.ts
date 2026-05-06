import { Component, inject, signal, computed, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { ToastService } from '../../services/toast.service';
import { Student } from '../../models/models';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.scss']
})
export class StudentsComponent  implements OnDestroy{
  data = inject(DataService);
  toast = inject(ToastService);
  fb = inject(FormBuilder);

  search = '';
  filterStatus = '';
  filterFee = '';
  modalOpen = signal(false);
  editing = signal(false);
  editId = signal('');
  deleteTarget = signal<Student | null>(null);

  studentForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    course: ['', Validators.required],
    batch: ['', Validators.required],
    status: ['active', Validators.required],
    totalFee: [{ value: 0, disabled: true }],
    paidAmount: [0],
    enrollmentDateStr: [new Date().toISOString().split('T')[0], Validators.required],
    address: ['', Validators.required]
  });

  pendingFeeCount = computed(() => this.data.students().filter(s => s.paidAmount < s.totalFee).length);

  filteredStudents = computed(() => {
    let list = this.data.students();
    if (this.search) { const s = this.search.toLowerCase(); list = list.filter(x => x.name.toLowerCase().includes(s) || x.email.toLowerCase().includes(s)); }
    if (this.filterStatus) list = list.filter(x => x.status === this.filterStatus);
    if (this.filterFee === 'paid') list = list.filter(x => x.paidAmount >= x.totalFee);
    if (this.filterFee === 'pending') list = list.filter(x => x.paidAmount < x.totalFee);
    return list;
  });

  byStatus(status: string) { return this.data.students().filter(s => s.status === status).length; }

  emptyForm() {
    return { name: '', email: '', phone: '', course: '', batch: '', status: 'active' as Student['status'], totalFee: 0, paidAmount: 0, enrollmentDateStr: new Date().toISOString().split('T')[0], address: '' };
  }

  onInputChange() {
    // Trigger change detection by re-computing the filtered listd
    this.filteredStudents = computed(() => {
      let list = this.data.students();
      if (this.search) { const s = this.search.toLowerCase(); list = list.filter(x => x.name.toLowerCase().includes(s) || x.email.toLowerCase().includes(s)); }
      if (this.filterStatus) list = list.filter(x => x.status === this.filterStatus);
      if (this.filterFee === 'paid') list = list.filter(x => x.paidAmount >= x.totalFee);
      if (this.filterFee === 'pending') list = list.filter(x => x.paidAmount < x.totalFee);
      return list;
    });
  }

  oncourseselect() {
    const selectedCourse = this.studentForm.get('course')?.value;
    const fees = this.data.courses().find(c => c.title === selectedCourse)?.fee ?? 0;
    this.studentForm.get('totalFee')?.setValue(fees);
  }

  openModal(student?: Student) {
    console.log('Opening modal for student:', student);
    if (student) {
      this.editing.set(true);
      this.editId.set(student._id);
      this.studentForm.reset({
        name: student.name,
        email: student.email,
        phone: student.phone,
        course: student.course,
        batch: student.batch,
        status: student.status,
        totalFee: student.totalFee,
        paidAmount: student.paidAmount,
        enrollmentDateStr: new Date(student.enrollmentDate).toISOString().split('T')[0],
        address: student.address
      });
      this.studentForm.get('totalFee')?.disable();
    } else {
      this.editing.set(false);
      this.editId.set('');
      this.studentForm.reset(this.emptyForm());
      this.studentForm.get('totalFee')?.disable();
    }
    this.modalOpen.set(true);
  }

  closeModal(e: Event) { if (e.target === e.currentTarget) this.closeModalDirect(); }
  closeModalDirect() { this.modalOpen.set(false); }

  saveStudent() {
    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      this.toast.error('Please fill all required fields before enrolling.');
      return;
    }

    const formValue = this.studentForm.getRawValue() as {
      name: string;
      email: string;
      phone: string;
      course: string;
      batch: string;
      status: Student['status'];
      totalFee: number;
      paidAmount: number;
      enrollmentDateStr: string;
      address: string;
    };

    const payload = {
      name: formValue.name,
      email: formValue.email,
      phone: formValue.phone,
      course: formValue.course,
      batch: formValue.batch,
      status: formValue.status,
      totalFee: formValue.totalFee,
      paidAmount: formValue.paidAmount,
      feePaid: formValue.paidAmount >= formValue.totalFee,
      enrollmentDate: new Date(formValue.enrollmentDateStr),
      address: formValue.address
    };

    if (this.editing()) {
      this.data.updateStudent(this.editId(), payload);
      this.toast.success('Student updated!');
    } else {
      this.data.addStudent(payload);
      console.log('Student added:', payload);
      this.toast.success('Student enrolled!');
    }
    this.closeModalDirect();
  }

  confirmDelete(s: Student) { this.deleteTarget.set(s); }
  doDelete() { if (this.deleteTarget()) { this.data.deleteStudent(this.deleteTarget()!._id); this.toast.success('Student removed.'); this.deleteTarget.set(null); } }

  getStatusBadge(status: string) {
    const m: Record<string, string> = { active: 'badge-success', completed: 'badge-info', dropped: 'badge-danger', pending: 'badge-warning' };
    return m[status] ?? 'badge-secondary';
  }
  initials(name: string) { return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2); }

  ngOnDestroy() {
    // Reset signals to prevent memory leaks
    this.modalOpen.set(false);
    this.editing.set(false);
    this.editId.set('');
    this.deleteTarget.set(null);
  }
}
