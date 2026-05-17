import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { ToastService } from '../../services/toast.service';
import { Staff } from '../../models/models';

@Component({
  selector: 'app-staff',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl:'./staff.component.html',
  styleUrls: ['./staff.component.scss']
})
export class StaffComponent implements OnInit ,OnDestroy{
  data = inject(DataService);
  toast = inject(ToastService);
  fb = inject(FormBuilder);

  AlldeptsArray:string[] | any = []
  AllStaffRolesArray:string[] | any = []

  search = '';
  filterDept = '';
  filterRole = '';
  modalOpen = signal(false);
  editing = signal(false);
  editId = signal('');
  deleteTarget = signal<Staff | null>(null);

  staffForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    role: ['instructor'],
    department: ['frontend'],
    qualification: [''],
    salary: [0],
    joiningDateStr: [new Date().toISOString().split('T')[0]],
    subjectsStr: [''],
    isActive: [true]
  });

  instructorCount = computed(() => this.data.activeStaff().filter(s => s.role === 'instructor').length);
  totalSalary = computed(() => this.data.activeStaff().reduce((sum, s) => sum + s.salary, 0));

  filteredStaff = computed(() => {
    let list = this.data.staff();
    // if (this.search) {
    //   const s = this.search.toLowerCase();
    //   list = list.filter(x => x.name.toLowerCase().includes(s) || x.email.toLowerCase().includes(s));
    // }
    // if (this.filterDept) list = list.filter(x => x.department === this.filterDept);
    // if (this.filterRole) list = list.filter(x => x.role === this.filterRole);
    return list;
  });

  emptyForm() {
    return { name: '', email: '', phone: '', role: 'instructor' as Staff['role'], department: 'frontend' as Staff['department'], qualification: '', salary: 0, joiningDateStr: new Date().toISOString().split('T')[0], subjectsStr: '', isActive: true };
  }

  ngOnInit(): void {
    this.AlldeptsArray = this.data.getAllDepartments();
    this.AllStaffRolesArray = this.data.getAllStaffRoles();
  }

  onInputChange() {
    // Trigger change detection by re-computing the filtered list
    this.filteredStaff = computed(() => {
      let list = this.data.staff();
      if (this.search) {
        const s = this.search.toLowerCase();
        list = list.filter(x => x.name.toLowerCase().includes(s) || x.email.toLowerCase().includes(s));
      }
      if (this.filterDept) list = list.filter(x => x.department === this.filterDept);
      if (this.filterRole) list = list.filter(x => x.role === this.filterRole);
      return list;
    });
  }

  openModal(staff?: Staff) {
    if (staff) {
      this.editing.set(true);
      this.editId.set(staff._id);
      this.staffForm.reset({
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        role: staff.role,
        department: staff.department,
        qualification: staff.qualification,
        salary: staff.salary,
        joiningDateStr: new Date(staff.joiningDate).toISOString().split('T')[0],
        subjectsStr: staff.subjects.join(', '),
        isActive: staff.isActive
      });
    } else {
      this.editing.set(false);
      this.editId.set('');
      this.staffForm.reset(this.emptyForm());
    }
    this.modalOpen.set(true);
  }

  closeModal(e: Event) { if (e.target === e.currentTarget) this.closeModalDirect(); }
  closeModalDirect() { this.modalOpen.set(false); }

  saveStaff() {
    if (this.staffForm.invalid) {
      this.staffForm.markAllAsTouched();
      this.toast.error('Name and email are required.');
      return;
    }
    const formValue = this.staffForm.value as {
      name: string;
      email: string;
      phone: string;
      role: Staff['role'];
      department: Staff['department'];
      qualification: string;
      salary: number;
      joiningDateStr: string;
      subjectsStr: string;
      isActive: boolean;
    };
    const payload = {
      name: formValue.name,
      email: formValue.email,
      phone: formValue.phone,
      role: formValue.role,
      department: formValue.department,
      qualification: formValue.qualification,
      salary: Number(formValue.salary),
      joiningDate: new Date(formValue.joiningDateStr),
      subjects: formValue.subjectsStr.split(',').map(s => s.trim()).filter(Boolean),
      isActive: formValue.isActive
    };
    if (this.editing()) {
      this.data.updateStaff(this.editId(), payload);
      this.toast.success('Staff updated!');
    } else {
      this.data.addStaff(payload);
      this.toast.success('Staff member added!');
    }
    this.closeModalDirect();
  }

  toggleStatus(s: Staff) {
    this.data.istoggleStatus = true
    this.data.updateStaff(s._id, { isActive: !s.isActive });
    this.data.updateuser(s._id, { isActive: !s.isActive })
    this.toast.info(s.isActive ? `${s.name} deactivated.` : `${s.name} activated.`);
  }

  confirmDelete(s: Staff) { this.deleteTarget.set(s); }
  doDelete() {
    if (this.deleteTarget()) { this.data.deleteStaff(this.deleteTarget()!._id); this.toast.success('Staff removed.'); this.deleteTarget.set(null); }
  }

  initials(name: string) { return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2); }

  ngOnDestroy(): void {
    // Reset signals to prevent memory leaks
    this.modalOpen.set(false);
    this.editing.set(false);
    this.editId.set('');
    this.deleteTarget.set(null);
  }
}
