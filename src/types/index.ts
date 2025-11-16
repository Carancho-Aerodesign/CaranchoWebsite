import type { Timestamp } from 'firebase/firestore';

export type NotificationKind = 'success' | 'error' | 'info';

export interface NotificationState {
  message: string;
  type: NotificationKind;
}

export interface TeamAssignment {
  department: string;
  role: string;
}

export interface TeamMember {
  id: string;
  name: string;
  age?: number;
  course?: string;
  img?: string;
  generalRoles?: string[];
  assignments?: TeamAssignment[];
  quote?: string;
  badges?: string[];
}

export interface TeamDepartment {
  id: string;
  name: string;
}

export interface TeamHierarchy {
  captain: string | null;
  departments: TeamDepartment[];
  members: TeamMember[];
}

export interface Sponsor {
  id: string;
  name: string;
  logo: string;
  amount: number;
  dateReceived?: Timestamp | Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  year: number;
  imageUrl: string;
}

export interface SiteSettings {
  heroImageUrl: string;
  participations: number;
  monthlyDues: number;
  history?: string;
  mission?: string;
  vision?: string;
}

export interface PaymentRecord {
  id: string;
  memberId: string;
  year: number;
  month: number;
  amount: number;
  datePaid?: Timestamp | Date;
}

export interface FinancialSnapshot {
  payments: PaymentRecord[];
  sponsorships: Sponsor[];
}

export type AppPage = 'home' | 'about' | 'projects' | 'login' | 'register' | 'admin';
