import { Injectable, signal, computed } from '@angular/core';
import { Notice, Staff, Student, Course, Batch } from '../models/models';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class DataService {
  constructor(private http: HttpClient) {
    this.getAllstudents();
    this.getAllcourses();
    this.getAllbatches();
  }
  // ===========================
  // NOTICES
  // ===========================
  private _notices = signal<Notice[]>([
    {
      id: 'n1', title: 'Welcome to EmmetAcademy  Batch 2025!',
      content: 'We are excited to welcome all new students to the January 2025 batch. Orientation will be held on January 15th at 10 AM. Please bring all required documents and your enrollment receipt.',
      category: 'general', targetAudience: 'all', postedBy: 'Admin Kumar',
      isActive: true, isPinned: true,
      expiryDate: new Date('2025-02-01'), createdAt: new Date('2025-01-10'),
      updatedAt: new Date('2025-01-10')
    },
    {
      id: 'n2', title: 'React & Angular Module Exam Schedule',
      content: 'Exams for the React.js and Angular modules will be held on January 25th and 26th respectively. Students are advised to complete all assignments before the exam date. Revision sessions will be conducted on January 22nd and 23rd.',
      category: 'exam', targetAudience: 'students', postedBy: 'Priya Sharma',
      isActive: true, isPinned: false,
      expiryDate: new Date('2025-01-27'), createdAt: new Date('2025-01-12'),
      updatedAt: new Date('2025-01-12')
    },
    {
      id: 'n3', title: 'Republic Day Holiday — January 26th',
      content: 'The academy will remain closed on January 26th, 2025 on account of Republic Day. All scheduled classes and sessions will be rescheduled accordingly. Happy Republic Day!',
      category: 'holiday', targetAudience: 'staff', postedBy: 'Admin Kumar',
      isActive: true, isPinned: false,
      createdAt: new Date('2025-01-20'), updatedAt: new Date('2025-01-20')
    },
    {
      id: 'n4', title: 'Fee Submission Deadline — February 5th',
      content: 'All students are reminded to submit their second installment fees by February 5th, 2025. A late fee of ₹500 will be charged after the due date. Contact the accounts office for any queries.',
      category: 'fee', targetAudience: 'students', postedBy: 'Admin Kumar',
      isActive: true, isPinned: true,
      expiryDate: new Date('2025-02-10'), createdAt: new Date('2025-01-18'),
      updatedAt: new Date('2025-01-18')
    },
    {
      id: 'n5', title: 'Guest Lecture: Node.js Microservices',
      content: 'We are pleased to announce a guest lecture by Mr. Ankit Verma, Senior Backend Engineer at Flipkart. Topic: Building Scalable Microservices with Node.js. Date: February 2nd, 2025 at 2 PM. All students and staff are invited.',
      category: 'event', targetAudience: 'all', postedBy: 'Priya Sharma',
      isActive: true, isPinned: false,
      expiryDate: new Date('2025-02-03'), createdAt: new Date('2025-01-22'),
      updatedAt: new Date('2025-01-22')
    }
  ]);

  readonly notices = this._notices.asReadonly();
  readonly activeNotices = computed(() => this._notices().filter(n => n.isActive));
  readonly pinnedNotices = computed(() => this._notices().filter(n => n.isPinned && n.isActive));

  addNotice(notice: Omit<Notice, 'id' | 'createdAt' | 'updatedAt'>): Notice {
    const newNotice: Notice = { ...notice, id: this.genId('n'), createdAt: new Date(), updatedAt: new Date() };
    this._notices.update(list => [newNotice, ...list]);
    return newNotice;
  }

  updateNotice(id: string, updates: Partial<Notice>): void {
    this._notices.update(list =>
      list.map(n => n.id === id ? { ...n, ...updates, updatedAt: new Date() } : n)
    );
  }

  deleteNotice(id: string): void {
    this._notices.update(list => list.filter(n => n.id !== id));
  }

  getNoticeById(id: string): Notice | undefined {
    return this._notices().find(n => n.id === id);
  }

  // ===========================
  // STAFF
  // ===========================
  private _staff = signal<Staff[]>([
    {
      id: 's1', name: 'Priya Sharma', email: 'priya@emmetacademy.in', phone: '9876543210',
      role: 'instructor', department: 'frontend', qualification: 'B.Tech Computer Science',
      joiningDate: new Date('2023-06-01'), salary: 65000, isActive: true,
      subjects: ['HTML/CSS', 'JavaScript', 'React.js', 'Angular'], createdAt: new Date('2023-06-01')
    },
    {
      id: 's2', name: 'Rohit Desai', email: 'rohit@emmetacademy.in', phone: '9765432109',
      role: 'instructor', department: 'backend', qualification: 'MCA',
      joiningDate: new Date('2023-08-15'), salary: 70000, isActive: true,
      subjects: ['Node.js', 'Express.js', 'MongoDB', 'MySQL'], createdAt: new Date('2023-08-15')
    },
    {
      id: 's3', name: 'Sneha Kulkarni', email: 'sneha@emmetacademy.in', phone: '9654321098',
      role: 'coordinator', department: 'management', qualification: 'MBA',
      joiningDate: new Date('2023-09-01'), salary: 45000, isActive: true,
      subjects: [], createdAt: new Date('2023-09-01')
    },
    {
      id: 's4', name: 'Amit Joshi', email: 'amit@emmetacademy.in', phone: '9543210987',
      role: 'instructor', department: 'fullstack', qualification: 'B.E. Information Technology',
      joiningDate: new Date('2024-01-10'), salary: 72000, isActive: true,
      subjects: ['React.js', 'Node.js', 'TypeScript', 'Docker'], createdAt: new Date('2024-01-10')
    },
    {
      id: 's5', name: 'Meera Nair', email: 'meera@emmetacademy.in', phone: '9432109876',
      role: 'support', department: 'management', qualification: 'BCA',
      joiningDate: new Date('2024-03-05'), salary: 30000, isActive: false,
      subjects: [], createdAt: new Date('2024-03-05')
    }
  ]);

  readonly staff = this._staff.asReadonly();
  readonly activeStaff = computed(() => this._staff().filter(s => s.isActive));

  addStaff(staff: Omit<Staff, 'id' | 'createdAt'>): Staff {
    const newStaff: Staff = { ...staff, id: this.genId('st'), createdAt: new Date() };
    this._staff.update(list => [newStaff, ...list]);
    return newStaff;
  }

  updateStaff(id: string, updates: Partial<Staff>): void {
    this._staff.update(list => list.map(s => s.id === id ? { ...s, ...updates } : s));
  }

  deleteStaff(id: string): void {
    this._staff.update(list => list.filter(s => s.id !== id));
  }

  getStaffById(id: string): Staff | undefined {
    return this._staff().find(s => s.id === id);
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
    if (payload.enrollmentDate instanceof Date) {
      payload.enrollmentDate = payload.enrollmentDate.toISOString();
    }

    this.http.post<Student | any>(`${environment.baseUrl}students`, payload).subscribe({
      next: res => {
        console.log('Student added successfully:', res);
        const createdStudent = res.data ?? res;

        if (createdStudent && (createdStudent._id || createdStudent.id)) {
          this._students.update(list => [createdStudent, ...list]);
          this.getAllcourses();
          this.getAllbatches();
          return;
        }

        this.getAllstudents();
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
