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
  birthDate?: string | Date | Timestamp;
  course?: string;
  img?: string;
  generalRoles?: string[];
  assignments?: TeamAssignment[];
  membershipType?: 'member' | 'trainee';
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
  raffleTicketPrice?: number;
  rafflePrize?: string;
  raffleValidationCode?: string;
  raffleClosed?: boolean;
}

export interface PaymentRecord {
  id: string;
  memberId: string;
  memberName?: string;
  year: number;
  month: number;
  amount: number;
  datePaid?: Timestamp | Date;
}

export interface FinancialSnapshot {
  payments: PaymentRecord[];
  sponsorships: Sponsor[];
}

export interface RaffleSale {
  id: string;
  ticketNumber: string;
  buyerName: string;
  sellerId?: string;
  sellerName?: string;
  contact?: string;
  amount: number;
  received?: boolean;
  dateSold?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

export interface PurchaseRecord {
  id: string;
  description: string;
  vendor?: string;
  category?: string;
  amount: number;
  date: Timestamp | Date;
  notes?: string;
}

export type AppPage = 'home' | 'about' | 'projects' | 'login' | 'register' | 'admin' | 'raffle';
