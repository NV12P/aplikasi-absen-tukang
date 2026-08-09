// ─── Tipe data global untuk seluruh aplikasi ────────────────────────────────
// Migrasi dari Laravel API Resources (response shapes)

import type { AttendanceStatus } from "@prisma/client";

// ─── Auth ───────────────────────────────────────────────────────────────────

export interface SessionUser {
  id: string;
  name: string;
  email: string;
}

// ─── Positions (setara PositionResource) ────────────────────────────────────

export interface Position {
  id: number;
  name: string;
  daily_wage: number;
  overtime_wage: number;
  casting_wage: number;
  created_at: string;
  updated_at: string;
}

// ─── Projects (setara ProjectResource) ──────────────────────────────────────

export interface Project {
  id: number;
  name: string;
  location: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ─── Workers (setara WorkerResource) ────────────────────────────────────────

export interface Worker {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  is_active: boolean;
  project_id: number;
  position_id: number;
  project?: Pick<Project, "id" | "name">;
  position?: Pick<Position, "id" | "name" | "daily_wage" | "overtime_wage" | "casting_wage">;
  created_at: string;
  updated_at: string;
}

// ─── Attendance (setara AttendanceResource) ──────────────────────────────────

export interface Attendance {
  id: number;
  worker_id: number;
  date: string;
  status: AttendanceStatus;
  wage: number;
  worker?: Pick<Worker, "id" | "name">;
  created_at: string;
  updated_at: string;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardStats {
  today_present: number;
  today_overtime: number;
  today_cor: number;
  today_alpha: number;
  today_expense: number;
  total_workers: number;
  total_projects: number;
  active_projects: number;
  active_workers: number;
}

// ─── Attendance Input ────────────────────────────────────────────────────────

export interface WorkerAttendanceRow {
  worker_id: number;
  worker_name: string;
  position: string;
  current_status: AttendanceStatus | null; // null = belum absen hari ini
}

export interface BulkAttendancePayload {
  project_id: number;
  date: string;
  attendances: Array<{
    worker_id: number;
    status: AttendanceStatus;
  }>;
}

// ─── Rekap / Report ──────────────────────────────────────────────────────────

export interface ReportSummary {
  project: string;
  period: string;
  total_workers: number;
  total_expense: number;
}

export interface WorkerReportRow {
  worker_id: number;
  worker_name: string;
  position: string;
  daily_wage: number;
  days: Record<string, AttendanceStatus>; // key: "YYYY-MM-DD"
  total_wage: number;
}

export interface WeeklyReport {
  summary: ReportSummary;
  workers: WorkerReportRow[];
}

// ─── API Response wrapper ─────────────────────────────────────────────────────

export interface ApiSuccess<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  error: string;
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
