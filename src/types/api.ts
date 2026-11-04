// Shapes returned by the Better Edibles backend's /api/employee-app routes.
// Accounting owns hours, pay and PTO; the app only displays them.

export interface Employee {
  id: string;
  name: string;
  email: string | null;
  employeeType: string;
  isDriver: boolean;
}

export type ClockStatus = 'clocked_out' | 'clocked_in' | 'on_meal';
export type ClockAction = 'clock-in' | 'clock-out' | 'meal-out' | 'meal-in';

export interface ClockState {
  status: ClockStatus;
  clockInAt: string | null;
  mealOutAt: string | null;
  mealInAt: string | null;
  canClockIn: boolean;
  canClockOut: boolean;
  canMealOut: boolean;
  canMealIn: boolean;
}

export interface LocationSnapshot {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  capturedAt: string;
}

export interface Punch {
  id: string;
  workDate: string;
  clockIn: string;
  mealOut: string | null;
  mealIn: string | null;
  clockOut: string | null;
  open: boolean;
  hours: number;
  regularHours: number;
  overtimeHours: number;
}

/** The four times on a punch that an employee can correct. */
export type PunchTimes = Pick<Punch, 'clockIn' | 'mealOut' | 'mealIn' | 'clockOut'>;

export interface WeekSummary {
  payPeriodStart: string;
  payPeriodEnd: string;
  payDate: string;
  payType: 'hourly' | 'salaried';
  hourlyRate: number | null;
  punches: Punch[];
  totals: { hours: number; regularHours: number; overtimeHours: number };
  estimatedGross: number | null;
  approved: boolean;
}

export interface PayRun {
  payPeriodStart: string;
  payPeriodEnd: string;
  payDate: string;
  status: 'approved' | 'paid';
  payType: 'hourly' | 'salaried';
  hourlyRate: number;
  regularHours: number;
  overtimeHours: number;
  totalHours: number;
  hourlyPay: number;
  salaryPay: number;
  commission: number;
  grossPay: number;
}

export interface PayHistory {
  runs: PayRun[];
  yearToDate: { year: number; grossPay: number; totalHours: number };
}

export interface Pto {
  accruedDays: number;
  usedDays: number;
  availableDays: number;
  annualDays: number;
  eligible: boolean;
  hireDate: string | null;
}

export interface Profile {
  id: string;
  name: string;
  loginName: string;
  email: string | null;
  phone: string | null;
  address: { street?: string; city?: string; state?: string; zip?: string } | null;
  emergencyContact: { name?: string; relationship?: string; phone?: string } | null;
  employeeType: string;
  isDriver: boolean;
  beEmployeeId: string | null;
  payType: 'hourly' | 'salaried';
  hourlyRate: number | null;
}

/** Whether the backend could reach this employee's Accounting record. */
export interface AccountingLink {
  linked: boolean;
  available: boolean;
  message: string | null;
}

export interface MeResponse {
  employee: Profile;
  /** Null when Accounting is down or the employee is not linked to it yet. */
  pto: Pto | null;
  olccPermit: { status?: string } | null;
  accounting?: AccountingLink;
}

export interface HrDoc {
  slug: string;
  label: string;
  order: number;
  onFile: boolean;
  filename: string | null;
  uploadedAt: string | null;
  hrStatus: string | null;
  required: boolean | null;
  /** The blank form to print, fill in and sign; the same file for every employee. */
  templateFilename: string | null;
  templateAvailable: boolean;
}

export type DocStatus = 'completed' | 'pending' | 'missing';

/** A photo of a work permit or ID card the employee has uploaded. */
export interface PermitCard {
  slug: string;
  order: number;
  label: string;
  onFile: boolean;
  filename: string | null;
  mimeType: string | null;
  uploadedAt: string | null;
}

export interface TimeOffRequest {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD, inclusive
  days: number;
  note: string | null;
  status: 'pending' | 'approved' | 'denied';
  createdAt: string;
}

export interface Stop {
  id: string;
  order: number;
  storeName: string;
  address: string;
  city: string;
  state: string;
  scheduledAt: string;
  status: string;
  done: boolean;
  disposition: string[];
  amount: number;
  paymentAction: string;
  orderNumber: number | null;
  notes: string | null;
  hasNote: boolean;
}

export interface Transcription {
  transcript: string;
  summary: string;
}

/** Error body the backend sends; `code: 'PIN_REQUIRED'` means the time clock needs the employee's PIN. */
export interface ApiErrorBody {
  message?: string;
  error?: string;
  code?: string;
}
