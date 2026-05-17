import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth.service';
import { Course } from '../../models/models';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl:'./courses.component.html',
  styleUrls: ['./courses.component.scss']
})
export class CoursesComponent  implements OnInit ,OnDestroy{
  data = inject(DataService);
  toast = inject(ToastService);
  auth = inject(AuthService);
  fb = inject(FormBuilder);
  filtercats: string[] = [];
  filterStatusArr: string[] = [];

  search = '';
  filterCat = '';
  filterStatus:any = '';
  modalOpen = signal(false);
  editing = signal(false);
  editId = signal('');
  deleteTarget = signal<Course | null>(null);

  courseForm = this.fb.group({
    title: ['', Validators.required],
    code: ['', Validators.required],
    category: ['frontend'],
    status: ['active'],
    duration: ['3 months'],
    fee: [0],
    instructor: [''],
    maxCapacity: [30],
    startDateStr: [new Date().toISOString().split('T')[0]],
    description: [''],
    topicsStr: ['']
  });

  filteredCourses = computed(() => {
    let list = this.data.courses();
    console.log('Filtered courses:', list);
    if (this.filterCat) list = list.filter(x => x.category === this.filterCat);
    if (this.filterStatus) list = list.filter(x => x.status === this.filterStatus);
    return list;
  });

  ngOnInit() {
    this.filtercats = this.data.getcatories();
    this.filterStatusArr = this.data.getCouseStatus();
  }

  emptyForm() {
    return { title: '', code: '', category: 'frontend' as Course['category'], status: 'active' as Course['status'], duration: '3 months', fee: 0, instructor: '', maxCapacity: 30, startDateStr: new Date().toISOString().split('T')[0], description: '', topicsStr: '' };
  }

  openModal(course?: Course) {
    if (course) {
      this.editing.set(true);
      this.editId.set(course._id);
      this.courseForm.reset({
        title: course.title,
        code: course.code,
        category: course.category,
        status: course.status,
        duration: course.duration,
        fee: course.fee,
        instructor: course.instructor,
        maxCapacity: course.maxCapacity,
        startDateStr: new Date(course.startDate).toISOString().split('T')[0],
        description: course.description,
        topicsStr: course.topics.join(', ')
      });
    } else {
      this.editing.set(false);
      this.editId.set('');
      this.courseForm.reset(this.emptyForm());
    }
    this.modalOpen.set(true);
  }

  closeModal(e: Event) { if (e.target === e.currentTarget) this.closeModalDirect(); }
  closeModalDirect() { this.modalOpen.set(false); }

  async saveCourse() {
    if (this.courseForm.invalid) {
      this.courseForm.markAllAsTouched();
      this.toast.error('Title and code are required.');
      return;
    }

    const formValue = this.courseForm.value as {
      title: string;
      code: string;
      category: Course['category'];
      status: Course['status'];
      duration: string;
      fee: number;
      instructor: string;
      maxCapacity: number;
      startDateStr: string;
      description: string;
      topicsStr: string;
    };

    const basePayload = {
      title: formValue.title,
      code: formValue.code,
      category: formValue.category,
      status: formValue.status,
      duration: formValue.duration,
      fee: Number(formValue.fee),
      instructor: formValue.instructor,
      maxCapacity: Number(formValue.maxCapacity),
      enrolledCount: 0,
      startDate: new Date(formValue.startDateStr),
      description: formValue.description,
      topics: formValue.topicsStr.split(',').map(t => t.trim()).filter(Boolean)
    };

    if (this.editing()) {
      await this.data.updateCourse(this.editId(), basePayload);
      this.toast.success('Course updated!');
    } else {
      await this.data.addCourse(basePayload);
      this.toast.success('Course added!');
    }
    this.closeModalDirect();
  }
  oninptChange(){
    this.filteredCourses = computed(() => {
    let list = this.data.courses();
    if (this.search) { const s = this.search.toLowerCase(); list = list.filter(x => x.title.toLowerCase().includes(s) || x.code.toLowerCase().includes(s)); }
    if (this.filterCat) list = list.filter(x => x.category === this.filterCat);
    if (this.filterStatus) list = list.filter(x => x.status === this.filterStatus);
    return list;
  });
  }

  confirmDelete(c: Course) { this.deleteTarget.set(c); }
  doDelete() { if (this.deleteTarget()) { this.data.deleteCourse(this.deleteTarget()!._id); this.toast.success('Course deleted.'); this.deleteTarget.set(null); } }

  getCatColor(cat: string) { const m: Record<string,string> = { frontend: 'info', backend: 'warning', fullstack: 'success', devops: 'danger', mobile: 'secondary' }; return m[cat] ?? 'secondary'; }
  getStatusColor(s: string) { const m: Record<string,string> = { active: 'success', upcoming: 'warning', completed: 'info', draft: 'secondary' }; return m[s] ?? 'secondary'; }

  ngOnDestroy(): void {
    // Reset signals to prevent memory leaks
    this.modalOpen.set(false);
    this.editing.set(false);
    this.editId.set('');
    this.deleteTarget.set(null);
  }
}
