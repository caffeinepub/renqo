import type {
  Bill,
  RentPayment,
  RentalAgreement,
  SecurityDeposit,
  Tenant,
} from "../backend.d";
import { formatCurrency, formatDate } from "./format";

function toCSV(
  headers: string[],
  rows: (string | number | boolean)[][],
): string {
  const csvEscape = (v: string | number | boolean) =>
    `"${String(v).replace(/"/g, '""')}"`;
  return [
    headers.map(csvEscape).join(","),
    ...rows.map((r) => r.map(csvEscape).join(",")),
  ].join("\n");
}

function download(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportTenantsCSV(
  tenants: Tenant[],
  deposits: Map<string, SecurityDeposit | null>,
  agreements: Map<string, RentalAgreement | null>,
) {
  const headers = [
    "Unit",
    "Name",
    "Phone",
    "Email",
    "Move In",
    "Leaving Date",
    "Broker Name",
    "Broker Contact",
    "Security Deposit",
    "Deposit Paid",
    "Agreement Start",
    "Agreement End",
    "Notes",
  ];
  const rows = tenants.map((t) => {
    const dep = deposits.get(String(t.id));
    const agr = agreements.get(String(t.id));
    return [
      t.unitNumber,
      t.name,
      t.phone,
      t.email,
      formatDate(t.moveInDate),
      formatDate(t.leavingDate),
      t.brokerName,
      t.brokerContact,
      dep ? formatCurrency(dep.amount) : "",
      dep ? (dep.paidStatus ? "Yes" : "No") : "",
      agr ? formatDate(agr.startDate) : "",
      agr ? formatDate(agr.endDate) : "",
      t.notes,
    ];
  });
  download(toCSV(headers, rows), "rentease_tenants.csv");
}

export function exportPaymentsCSV(
  tenants: Tenant[],
  payments: Map<string, RentPayment[]>,
) {
  const headers = [
    "Unit",
    "Tenant",
    "Month",
    "Year",
    "Rent Amount",
    "Amount Paid",
    "Due Day",
    "Status",
    "Payment Date",
    "Notes",
  ];
  const rows: (string | number | boolean)[][] = [];
  for (const t of tenants) {
    const ps = payments.get(String(t.id)) || [];
    for (const p of ps) {
      rows.push([
        t.unitNumber,
        t.name,
        p.month.toString(),
        p.year.toString(),
        formatCurrency(p.rentAmount),
        formatCurrency(p.amountPaid),
        p.dueDay.toString(),
        p.paidStatus ? "Paid" : "Unpaid",
        formatDate(p.paymentDate),
        p.notes,
      ]);
    }
  }
  download(toCSV(headers, rows), "rentease_payments.csv");
}

export function exportBillsCSV(tenants: Tenant[], bills: Bill[]) {
  const tenantMap = new Map(tenants.map((t) => [String(t.id), t]));
  const headers = [
    "Unit",
    "Tenant",
    "Bill Type",
    "Billing Period",
    "Amount Due",
    "Due Date",
    "Status",
    "Payment Date",
    "Notes",
  ];
  const rows = bills.map((b) => {
    const t = tenantMap.get(String(b.tenantId));
    return [
      t?.unitNumber || "",
      t?.name || "",
      b.billType,
      b.billingPeriod,
      formatCurrency(b.amountDue),
      formatDate(b.dueDate),
      b.paidStatus ? "Paid" : "Unpaid",
      formatDate(b.paymentDate),
      b.notes,
    ];
  });
  download(toCSV(headers, rows), "rentease_bills.csv");
}
