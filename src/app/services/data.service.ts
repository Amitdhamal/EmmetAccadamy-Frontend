import { Injectable, signal, computed } from '@angular/core';
import { Notice, Staff, Student, Course, Batch, User } from '../models/models';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class DataService {
  istoggleStatus = false
  constructor(private http: HttpClient) {
    this.getAllstudents();
    this.getAllcourses();
    this.getAllbatches();
    this.getAllStaff();
    this.getAllNotices();
  }
  // ===========================
  // NOTICES
  // ===========================
  private _notices = signal<Notice[]>([]);

  getAllNotices() {
    this.http.get<any>(`${environment.baseUrl}notices`).subscribe((res) => {
      console.log('Fetched notices from APIII:', res);
      res = res.data ?? res;
      let data = res.map((s: any) => ({
        ...s,
        expiryDate: s.expiryDate ? new Date(s.expiryDate) : undefined,
        createdAt: s.createdAt ? new Date(s.createdAt) : new Date(),
        updatedAt: s.updatedAt ? new Date(s.updatedAt) : new Date()
      }));
      this._notices.set(data);
      console.log('Notices after setting state:', this._notices());
    });
  }

  readonly notices = this._notices.asReadonly();
  readonly activeNotices = computed(() => this._notices().filter(n => n.isActive));
  readonly pinnedNotices = computed(() => this._notices().filter(n => n.isPinned && n.isActive));

  addNotice(notice: Omit<Notice, '_id' | 'createdAt' | 'updatedAt'>): void {
    const payload: any = { ...notice };
    if (payload.expiryDate instanceof Date) {
      payload.expiryDate = payload.expiryDate.toISOString();
    }
    console.log('Sending create notice request', payload);
    this.http.post<Notice | any>(`${environment.baseUrl}notices`, payload).subscribe({
      next: res => {
        console.log('Notice added successfully:', res);
        const createdNotice = res.data ?? res;
        if (createdNotice && createdNotice._id) {
          this._notices.update(list => [createdNotice, ...list]);
        }
      },
      error: err => {
        console.error('Notice add failed:', err);
      }
    });
  }

  updateNotice(id: string, updates: Partial<Notice>): void {
    const payload = { ...updates } as any;
    if (payload.expiryDate instanceof Date) {
      payload.expiryDate = payload.expiryDate.toISOString();
    }
    this.http.put<any>(`${environment.baseUrl}notices/${id}`, payload).subscribe({
      next: res => {
        console.log('Notice updated successfully:', res);
        const updatedNotice = res?.data ?? res;
        if (updatedNotice && (updatedNotice._id || updatedNotice.id)) {
          this._notices.update(list =>
            list.map(n => n._id === id ? { ...n, ...updatedNotice } : n)
          );
        }
      },
      error: err => {
        console.error('Notice update failed:', err);
      }
    });
  }

  deleteNotice(id: string): void {
    this.http.delete<any>(`${environment.baseUrl}notices/${id}`).subscribe({
      next: res => {
        console.log('Notice deleted successfully:', res);
        this._notices.update(list => list.filter(n => n._id !== id));
      },
      error: err => {
        console.error('Notice delete failed:', err);
      }
    });
  }

  getNoticeById(id: string): Notice | undefined {
    return this._notices().find(n => n._id === id);
  }

  // ===========================
  // STAFF
  // ===========================
  private _staff = signal<Staff[]>([]);

  getAllStaff() {
    this.http.get<any>(`${environment.baseUrl}staffs`).subscribe((res) => {
      console.log('Fetched staff from API:', res);
      let data = res.data.map((s: any) => ({
        ...s
      }));
      this._staff.set(data);
      console.log('Staff after setting statessssssss:', this._staff());
    });
  }

  readonly staff = this._staff.asReadonly();
  readonly activeStaff = computed(() => this._staff().filter(s => s.isActive));

  addStaff(staff: Omit<Staff, '_id' | 'createdAt'>): Staff | any{
   const payload: any = { ...staff };
     if (payload.joi instanceof Date) {
      payload.joiningDateStr = payload.joiningDateStr.toISOString();
    }
    this.http.post<Staff | any>(`${environment.baseUrl}staffs`, payload).subscribe({
      next: res => {
        console.log('Staff added successfully:', res);
      },
      error: err => {
        console.log('Staff add failed:', err);
      },
      complete: () => {
        this.getAllStaff();
      }
    });
  }

  updateStaff(id: string, updates: Partial<Staff>): void {
    const payload = { ...updates } as any;
    if (payload.joiningDateStr instanceof Date) {
      payload.joiningDateStr = payload.joiningDateStr.toISOString();
    }
    this.http.patch<Staff | any>(`${environment.baseUrl}staffs/${id}`, payload).subscribe({
      next: res => {
        console.log('Staff updated successfully:', res);
        const updatedStaff = res?.data ?? res;
        if (updatedStaff && (updatedStaff.id || updatedStaff._id)) {
          this._staff.update(list =>
            list.map(s => s._id === id ? { ...s, ...updatedStaff } : s)
          );
        } else {
          this.getAllStaff();
        }
      },
      error: err => {
        console.log('Staff update failed:', err);
      }
    });
  }

  deleteStaff(id: string): void {
    this.http.delete<any>(`${environment.baseUrl}staffs/${id}`).subscribe({
      next: res => {
        console.log('Staff deleted successfully:', res);
        this._staff.update(list => list.filter(s => s._id !== id));
      },
      error: err => {
        console.log('Staff delete failed:', err);
      }
    });
    this.getAllStaff();
  }

  getAllusers() {
    this.http.get<any>(`${environment.baseUrl}users`).subscribe((res) => {
      console.log('Fetched users from API:', res);
      let data = res.data.map((s: any) => ({
        ...s
      }));
      this._users.set(data);
    });
  }
  private _users = signal<User[]>([]);
  updateuser(id: string, updates: Partial<User>): void {
    const payload = { ...updates } as any;
    this.http.patch<any>(`${environment.baseUrl}users/${id}/${this.istoggleStatus}`, payload).subscribe({
      next: res => {
        console.log('User updated successfully:', res);
      },
      error: err => {
        console.log('User update failed:', err);
      }
    });
    this.istoggleStatus = false
  }

  getStaffById(id: string): Staff | undefined {
    return this._staff().find(s => s._id === id);
  }

  // ===========================
  // STUDENTS
  // ===========================

  getAllstudents() {
    this.http.get<any>(`${environment.baseUrl}students`).subscribe((res) => {
      console.log('Fetched students from API:', res);
      let data = res.data.map((s: any) => ({
        ...s
      }));
      this._students.set(data);
    })
  }
  private _students = signal<Student[]>([]);

  readonly students = this._students.asReadonly();

  addStudent(student: Omit<Student, '_id' | 'createdAt'>): void {
    const payload: any = { ...student };

    this.http.post<Student | any>(`${environment.baseUrl}students`, payload).subscribe({
      next: res => {
        console.log('Student added successfully:', res);
        const createdStudent = res.data ?? res;

        if (createdStudent && (createdStudent._id || createdStudent.id)) {
          this._students.update(list => [createdStudent, ...list]);
          this.getAllcourses();
          this.getAllbatches();
          this.getAllstudents();
          return;
        }

      },
      error: err => {
        console.log('Student add failed:', err);
      }
    });

  }

  updateStudent(id: string, updates: Partial<Student>): void {
    console.log('Updating student with ID:', id, 'Updates:', updates);
    const payload = { ...updates } as any;
    if (payload.enrollmentDate instanceof Date) {
      payload.enrollmentDate = payload.enrollmentDate.toISOString();
    }

    this.http.put<any>(`${environment.baseUrl}students/${id}`, payload).subscribe({
      next: res => {
        console.log('Student updated successfully:', res);
        const updatedStudent = res?.data ?? res;
        if (updatedStudent && (updatedStudent._id || updatedStudent.id)) {
          this._students.update(list =>
            list.map(s => s._id === id ? { ...s, ...updatedStudent } : s)
          );
        } else {
          this.getAllstudents();
        }
      },
      error: err => {
        console.log('Student update failed:', err);
      }
    });
  }

  deleteStudent(id: string): void {
    this.http.delete<any>(`${environment.baseUrl}students/${id}`).subscribe({
      next: res => {
        console.log('Student deleted successfully:', res);
        this._students.update(list => list.filter(s => s._id !== id));
      },
      error: err => {
        console.log('Student delete failed:', err);
      }
    });
  }

  getStudentById(id: string): Student | undefined {
    return this._students().find(s => s._id === id);
  }

  // ===========================
  // COURSES
  // ===========================
  private _courses = signal<Course[]>([]);

  getAllcourses() {
    this.http.get<any>(`${environment.baseUrl}courses`).subscribe(async(res) => {
      console.log('Fetched courses from API:', res);
      let data = await res.data.map((s: any) => ({
        ...s
      }))
      console.log('data',data)
      this._courses.set(data);
    });
    console.log(this._courses())
  }

  readonly courses = this._courses.asReadonly();
  getcatories() {
    const cats = new Set(this._courses().map(c => c.category));
    return Array.from(cats);
  }
  getCouseStatus() {
    const status = new Set(this._courses().map(c => c.status));
    return Array.from(status);
  }

  getAllDepartments() {
    const depts = new Set(this._staff().map(s => s.department));
    return Array.from(depts);
  }

  getAllStaffRoles() {
    const roles = new Set(this._staff().map(s => s.role));
    return Array.from(roles);
  }

  addCourse(course: Omit<Course, '_id' | 'createdAt'>): void {
    const payload: any = { ...course };
    if (payload.startDate instanceof Date) {
      payload.startDate = payload.startDate.toISOString();
    }

    this.http.post<Course | any>(`${environment.baseUrl}courses`, payload).subscribe({
      next: res => {
        console.log('Course added successfully:', res);
        const createdCourse = res.data ?? res;
        console.log('Created course object:', createdCourse);

        if (createdCourse && createdCourse._id) {
          this._courses.update(list => [createdCourse, ...list]);
          return;
        }

        this.getAllcourses();
      },
      error: err => {
        console.log('Course add failed:', err);
      }
    });
  }

  updateCourse(id: string, updates: Partial<Course>): void {
    const payload = { ...updates } as any;
    if (payload.startDate instanceof Date) {
      payload.startDate = payload.startDate.toISOString();
    }

    this.http.patch<any>(`${environment.baseUrl}courses/${id}`, payload).subscribe({
      next: res => {
        console.log('Course updated successfully:', res);
        const updatedCourse = res?.data ?? res;
        if (updatedCourse && (updatedCourse._id || updatedCourse.id)) {
          this._courses.update(list =>
            list.map(c => c._id === id ? { ...c, ...updatedCourse } : c)
          );
        }
        this.getAllcourses();
      },
      error: err => {
        console.log('Course update failed:', err);
      }
    });
  }

  deleteCourse(id: string): void {
    this.http.delete<any>(`${environment.baseUrl}courses/${id}`).subscribe({
      next: res => {
        console.log('Course deleted successfully:', res);
        this._courses.update(list => list.filter(c => c._id !== id));
      },
      error: err => {
        console.log('Course delete failed:', err);
      }
    });
  }

  // ===========================
  // BATCHES
  // ===========================
  private _batches = signal<Batch[]>([]);

  readonly batches = this._batches.asReadonly();
 

  private normalizeBatch(raw: any): Batch {
    return {
      id: raw._id ?? raw.id,
      name: raw.name,
      courseId: raw.courseId,
      courseName: raw.courseName,
      startDate: raw.startDate ? new Date(raw.startDate) : new Date(),
      endDate: raw.endDate ? new Date(raw.endDate) : new Date(),
      timing: raw.timing,
      instructor: raw.instructor,
      room: raw.room,
      capacity: raw.capacity,
      enrolled: raw.enrolled,
      status: raw.status,
      createdAt: raw.createdAt ? new Date(raw.createdAt) : new Date()
    };
  }

  getAllbatches() {
    this.http.get<any>(`${environment.baseUrl}batches`).subscribe((res) => {
      console.log('Fetched batches from API:', res);
      const data = (res.data ?? []).map((s: any) => this.normalizeBatch(s));
      this._batches.set(data);
    });
  }

  addBatch(batch: Omit<Batch, 'id' | 'createdAt'>): void {
    const payload: any = { ...batch };
    if (payload.startDate instanceof Date) {
      payload.startDate = payload.startDate.toISOString();
    }
    if (payload.endDate instanceof Date) {
      payload.endDate = payload.endDate.toISOString();
    }

    this.http.post<Batch | any>(`${environment.baseUrl}batches`, payload).subscribe({
      next: res => {
        console.log('Batch added successfully:', res);
        const createdBatch = this.normalizeBatch(res.data ?? res);
        if (createdBatch && createdBatch.id) {
          this._batches.update(list => [createdBatch, ...list]);
          return;
        }
        this.getAllbatches();
      },
      error: err => {
        console.log('Batch add failed:', err);
      }
    });
  }

  updateBatch(id: string, updates: Partial<Batch>): void {
    this.http.patch<any>(`${environment.baseUrl}batches/${id}`, updates).subscribe({
      next: res => {
        console.log('Batch updated successfully:', res);
        const updatedBatch = res?.data ?? res;
        if (updatedBatch && (updatedBatch._id || updatedBatch.id)) {
          this._batches.update(list =>
            list.map(b => b.id === id ? { ...b, ...updatedBatch } : b)
          );
        }
      },
      error: err => {
        console.log('Batch update failed:', err);
      }
    });
  }

  deleteBatch(id: string): void {
    this.http.delete<any>(`${environment.baseUrl}batches/${id}`).subscribe({
      next: res => {
        console.log('Batch deleted successfully:', res);
        this._batches.update(list => list.filter(b => b.id !== id));
      },
      error: err => {
        console.log('Batch delete failed:', err);
      }
    });
  }

  // Dashboard stats
  getDashboardStats() {
    const students = this._students();
    const staff = this._staff();
    const courses = this._courses();
    const notices = this._notices();
    return {
      totalStudents: students.length,
      activeStudents: students.filter(s => s.status === 'active').length,
      totalStaff: staff.filter(s => s.isActive).length,
      totalCourses: courses.filter(c => c.status === 'active').length,
      activeNotices: notices.filter(n => n.isActive).length,
      totalRevenue: students.reduce((sum, s) => sum + s.paidAmount, 0),
      pendingFees: students.reduce((sum, s) => sum + (s.totalFee - s.paidAmount), 0),
      ongoingBatches: this._batches().filter(b => b.status === 'ongoing').length,
    };
  }

  private genId(prefix: string): string {
    return `${prefix}${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  }
}
