export function formatCurrency(paise: bigint | number): string {
  const rupees = Number(paise) / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}

export function formatDate(iso: string): string {
  if (!iso) return "-";
  try {
    const [y, m, d] = iso.split("-");
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${d} ${months[Number.parseInt(m) - 1]} ${y}`;
  } catch {
    return iso;
  }
}

export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

export function currentMonth(): number {
  return new Date().getMonth() + 1;
}
export function currentYear(): number {
  return new Date().getFullYear();
}

export function monthName(m: number): string {
  return (
    [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ][m - 1] || ""
  );
}

export function isOverdueRent(
  dueDay: number,
  month: number,
  year: number,
  paid: boolean,
): boolean {
  if (paid) return false;
  const today = new Date();
  const due = new Date(year, month - 1, dueDay);
  return today > due;
}

export function isOverdueBill(dueDate: string, paid: boolean): boolean {
  if (paid || !dueDate) return false;
  return new Date() > new Date(dueDate);
}

export function rupeesToPaise(rupees: string): bigint {
  const n = Number.parseFloat(rupees) || 0;
  return BigInt(Math.round(n * 100));
}
