/** One payment in the paid-expenses ledger (`GET /api/paid-expenses`). */
export interface PaidExpense {
  _id: string;
  amount: number;
  /** ISO date of the payment. */
  date: string;
  student: string;
  createdAt?: string;
  studentDetails: {
    _id: string;
    code: number;
    name: string;
    image?: string;
    phone_1?: string[];
    phone_2?: string[];
    phone_3?: string[];
    active_status?: string;
  };
}

export interface PaidExpensesSummary {
  totalAmount: number;
  paymentsCount: number;
  studentsCount: number;
  averagePayment: number;
}

export interface PaidExpensesResponse {
  data: PaidExpense[];
  metaData: { total: number; count: number; pageNumber: number; totalPages: number };
  /** Totals for the whole filtered set, not just the returned page. */
  summary: PaidExpensesSummary;
}

/** `GET /api/paid-expenses/monthly?year=` */
export interface PaidExpensesMonthly {
  year: number;
  months: { month: number; total: number; count: number }[];
  yearTotal: number;
}
