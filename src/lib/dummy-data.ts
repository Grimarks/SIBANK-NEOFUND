export const customerLoans = [
  {
    id: "LN-2024-001",
    amount: 15000000,
    duration: 12,
    rate: 8.5,
    status: "approved" as const,
    remainingBalance: 10250000,
    paid: 4,
    total: 12,
    monthlyPayment: 1354167,
    startDate: "2024-01-15",
    nextDue: "2024-06-15",
  },
  {
    id: "LN-2024-002",
    amount: 5000000,
    duration: 6,
    rate: 7.0,
    status: "completed" as const,
    remainingBalance: 0,
    paid: 6,
    total: 6,
    monthlyPayment: 858333,
    startDate: "2023-10-01",
    nextDue: "-",
  },
  {
    id: "LN-2024-003",
    amount: 25000000,
    duration: 24,
    rate: 9.0,
    status: "pending" as const,
    remainingBalance: 25000000,
    paid: 0,
    total: 24,
    monthlyPayment: 1135417,
    startDate: "-",
    nextDue: "-",
  },
];

export const recentTransactions = [
  {
    id: "TXN-001",
    date: "2024-05-10",
    description: "Installment Payment - LN-2024-001",
    amount: -1354167,
    type: "payment",
  },
  {
    id: "TXN-002",
    date: "2024-04-10",
    description: "Installment Payment - LN-2024-001",
    amount: -1354167,
    type: "payment",
  },
  {
    id: "TXN-003",
    date: "2024-03-10",
    description: "Installment Payment - LN-2024-001",
    amount: -1354167,
    type: "payment",
  },
  {
    id: "TXN-004",
    date: "2024-01-15",
    description: "Loan Disbursement - LN-2024-001",
    amount: 15000000,
    type: "disbursement",
  },
  {
    id: "TXN-005",
    date: "2024-03-01",
    description: "Installment Payment - LN-2024-002",
    amount: -858333,
    type: "payment",
  },
];

export const adminCustomers = [
  {
    id: "C-001",
    name: "Ahmad Rizki",
    email: "ahmad@email.com",
    phone: "+62812345678",
    status: "active" as const,
    totalLoans: 2,
    creditScore: 780,
    joinDate: "2023-06-15",
    verified: true,
  },
  {
    id: "C-002",
    name: "Siti Nurhaliza",
    email: "siti@email.com",
    phone: "+62813456789",
    status: "active" as const,
    totalLoans: 1,
    creditScore: 720,
    joinDate: "2023-08-20",
    verified: true,
  },
  {
    id: "C-003",
    name: "Budi Santoso",
    email: "budi@email.com",
    phone: "+62814567890",
    status: "suspended" as const,
    totalLoans: 3,
    creditScore: 580,
    joinDate: "2023-03-10",
    verified: true,
  },
  {
    id: "C-004",
    name: "Dewi Lestari",
    email: "dewi@email.com",
    phone: "+62815678901",
    status: "active" as const,
    totalLoans: 1,
    creditScore: 810,
    joinDate: "2024-01-05",
    verified: false,
  },
  {
    id: "C-005",
    name: "Eko Prasetyo",
    email: "eko@email.com",
    phone: "+62816789012",
    status: "active" as const,
    totalLoans: 0,
    creditScore: 650,
    joinDate: "2024-02-18",
    verified: true,
  },
];

export const adminLoans = [
  {
    id: "LN-2024-001",
    customer: "Ahmad Rizki",
    amount: 15000000,
    duration: 12,
    rate: 8.5,
    status: "approved" as const,
    riskLevel: "low" as const,
    appliedDate: "2024-01-10",
  },
  {
    id: "LN-2024-002",
    customer: "Ahmad Rizki",
    amount: 5000000,
    duration: 6,
    rate: 7.0,
    status: "completed" as const,
    riskLevel: "low" as const,
    appliedDate: "2023-09-25",
  },
  {
    id: "LN-2024-003",
    customer: "Dewi Lestari",
    amount: 25000000,
    duration: 24,
    rate: 9.0,
    status: "pending" as const,
    riskLevel: "medium" as const,
    appliedDate: "2024-05-01",
  },
  {
    id: "LN-2024-004",
    customer: "Siti Nurhaliza",
    amount: 10000000,
    duration: 12,
    rate: 8.0,
    status: "pending" as const,
    riskLevel: "low" as const,
    appliedDate: "2024-05-05",
  },
  {
    id: "LN-2024-005",
    customer: "Budi Santoso",
    amount: 50000000,
    duration: 36,
    rate: 10.5,
    status: "rejected" as const,
    riskLevel: "high" as const,
    appliedDate: "2024-04-20",
  },
];

export const monthlyRevenue = [
  { month: "Jan", revenue: 12500000, loans: 5 },
  { month: "Feb", revenue: 14200000, loans: 7 },
  { month: "Mar", revenue: 13800000, loans: 6 },
  { month: "Apr", revenue: 16500000, loans: 9 },
  { month: "May", revenue: 18200000, loans: 11 },
  { month: "Jun", revenue: 17800000, loans: 8 },
];

export const loanDistribution = [
  { name: "Personal", value: 45 },
  { name: "Business", value: 30 },
  { name: "Education", value: 15 },
  { name: "Emergency", value: 10 },
];

export const paymentRecords = [
  {
    id: "PAY-001",
    customer: "Ahmad Rizki",
    loanId: "LN-2024-001",
    amount: 1354167,
    date: "2024-05-10",
    status: "verified" as const,
    proofUploaded: true,
  },
  {
    id: "PAY-002",
    customer: "Siti Nurhaliza",
    loanId: "LN-2024-004",
    amount: 900000,
    date: "2024-05-08",
    status: "pending" as const,
    proofUploaded: true,
  },
  {
    id: "PAY-003",
    customer: "Ahmad Rizki",
    loanId: "LN-2024-001",
    amount: 1354167,
    date: "2024-04-10",
    status: "verified" as const,
    proofUploaded: true,
  },
  {
    id: "PAY-004",
    customer: "Budi Santoso",
    loanId: "LN-2024-005",
    amount: 1600000,
    date: "2024-04-15",
    status: "overdue" as const,
    proofUploaded: false,
  },
];

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
}

export function formatDate(date: string): string {
  if (date === "-") return "-";
  return new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}
