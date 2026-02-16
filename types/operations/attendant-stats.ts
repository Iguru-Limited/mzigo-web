/**
 * Attendant stats report types
 */

export interface PaymentBreakdown {
  payment_mode: string;
  count: string;
  total_amount: string;
}

export interface ReportSummary {
  total_packages: string;
  total_amount: string;
}

export interface AttendantStatsData {
  date_range: {
    start_date: string;
    end_date: string;
  };
  summary: ReportSummary;
  payment_breakdown: PaymentBreakdown[];
}

export interface AttendantStatsResponse {
  status: string;
  data: AttendantStatsData;
}

export interface AttendantStatsParams {
  start_date: string;
  end_date: string;
  user_id?: string;
}
