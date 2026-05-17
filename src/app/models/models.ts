// ===== USER / AUTH MODELS =====
export interface User {
  _id: string;
  name: string;
  email: string;
  password: string; // plain text for demo (in prod: hashed)
  role: 'admin' | 'staff' | 'student';
  avatar?: string;
  createdAt: Date;
  isActive: boolean;
}

export interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
}

// ===== STAFF MODEL =====
export interface Staff {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'instructor' | 'coordinator' | 'support' | 'admin';
  department: 'frontend' | 'backend' | 'fullstack' | 'devops' | 'management';
  qualification: string;
  joiningDate: Date;
  salary: number;
  isActive: boolean;
  avatar?: string;
  subjects: string[];
  createdAt: Date;
}

// ===== STUDENT MODEL =====
export interface Student {
  _id: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  batch: string;
  enrollmentDate: Date;
  status: 'active' | 'completed' | 'dropped' | 'pending';
  feePaid: boolean;
  totalFee: number;
  paidAmount: number;
  avatar?: string;
  address: string;
  createdAt: Date;
}

// ===== COURSE MODEL =====
export interface Course {
  _id: string;
  title: string;
  code: string;
  category: 'frontend' | 'backend' | 'fullstack' | 'devops' | 'mobile';
  description: string;
  duration: string;  // e.g. "3 months"
  fee: number;
  instructor: string;
  enrolledCount: number;
  maxCapacity: number;
  status: 'active' | 'upcoming' | 'completed' | 'draft';
  topics: string[];
  startDate: Date;
  createdAt: Date;
}

// ===== NOTICE MODEL =====
export interface Notice {
  _id: string;
  title: string;
  content: string;
  category: 'general' | 'exam' | 'holiday' | 'event' | 'urgent' | 'fee';
  targetAudience: 'all' | 'students' | 'staff';
  postedBy: string;
  isActive: boolean;
  isPinned: boolean;
  expiryDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ===== BATCH MODEL =====
export interface Batch {
  id: string;
  name: string;
  courseId: string;
  courseName: string;
  startDate: Date;
  endDate: Date;
  timing: string;
  instructor: string;
  room: string;
  capacity: number;
  enrolled: number;
  status: 'ongoing' | 'upcoming' | 'completed';
  createdAt: Date;
}

// ===== TOAST NOTIFICATION =====
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}
