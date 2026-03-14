import { CheckCircle, Download } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { RentPayment, Tenant } from "../backend.d";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";
import { useActor } from "../hooks/useActor";
import { exportPaymentsCSV } from "../utils/export";
import {
  currentMonth,
  currentYear,
  formatCurrency,
  formatDate,
  isOverdueRent,
  monthName,
  todayISO,
} from "../utils/format";

interface Props {
  isAdmin: boolean;
}

export default function Payments({ isAdmin }: Props) {
  const { actor } = useActor();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [paymentsMap, setPaymentsMap] = useState<Map<string, RentPayment[]>>(
    new Map(),
  );
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState(String(currentMonth()));
  const [filterYear, setFilterYear] = useState(String(currentYear()));
  const [markOpen, setMarkOpen] = useState(false);
  const [markTarget, setMarkTarget] = useState<{
    tenant: Tenant;
    payment: RentPayment;
  } | null>(null);
  const [markDate, setMarkDate] = useState(todayISO());
  const [markNotes, setMarkNotes] = useState("");
  const [markSaving, setMarkSaving] = useState(false);

  const load = useCallback(async () => {
    if (!actor) return;
    const ts = await actor.getAllTenants();
    setTenants(ts);
    const map = new Map<string, RentPayment[]>();
    await Promise.all(
      ts.map((t) =>
        actor.getRentPayments(t.id).then((ps) => map.set(String(t.id), ps)),
      ),
    );
    setPaymentsMap(map);
  }, [actor]);

  useEffect(() => {
    if (actor) load().finally(() => setLoading(false));
  }, [actor, load]);

  const month = Number.parseInt(filterMonth);
  const year = Number.parseInt(filterYear);

  const rows = tenants
    .map((t) => {
      const ps = paymentsMap.get(String(t.id)) || [];
      const payment = ps.find(
        (p) => Number(p.month) === month && Number(p.year) === year,
      );
      return { tenant: t, payment };
    })
    .filter((r) => r.payment !== undefined) as {
    tenant: Tenant;
    payment: RentPayment;
  }[];

  async function markPaid() {
    if (!actor || !markTarget) return;
    setMarkSaving(true);
    await actor.updateRentPaymentStatus(
      markTarget.tenant.id,
      markTarget.payment.month,
      markTarget.payment.year,
      true,
      markDate,
      markNotes,
    );
    await load();
    setMarkSaving(false);
    setMarkOpen(false);
    setMarkTarget(null);
  }

  const paidCount = rows.filter((r) => r.payment.paidStatus).length;
  const totalExpected = rows.reduce(
    (s, r) => s + Number(r.payment.rentAmount),
    0,
  );
  const totalCollected = rows
    .filter((r) => r.payment.paidStatus)
    .reduce((s, r) => s + Number(r.payment.rentAmount), 0);

  return (
    <div className="p-4 space-y-4" data-ocid="payments.page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payments</h1>
          <p className="text-sm text-gray-500">
            {paidCount}/{rows.length} paid
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          data-ocid="payments.export_button"
          onClick={() => exportPaymentsCSV(tenants, paymentsMap)}
        >
          <Download className="h-4 w-4 mr-1" /> Export
        </Button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <Select value={filterMonth} onValueChange={setFilterMonth}>
          <SelectTrigger data-ocid="payments.month_select" className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => (
              <SelectItem key={i + 1} value={String(i + 1)}>
                {monthName(i + 1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          className="w-24"
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          placeholder="2025"
        />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-green-50 rounded-xl p-3">
          <p className="text-xs text-gray-500">Collected</p>
          <p className="font-bold text-green-700">
            {formatCurrency(BigInt(totalCollected))}
          </p>
        </div>
        <div className="bg-red-50 rounded-xl p-3">
          <p className="text-xs text-gray-500">Pending</p>
          <p className="font-bold text-red-600">
            {formatCurrency(BigInt(totalExpected - totalCollected))}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div
          className="text-center py-10 text-gray-400"
          data-ocid="payments.empty_state"
        >
          No rent records for {monthName(month)} {year}.
        </div>
      ) : (
        <div className="space-y-2" data-ocid="payments.list">
          {rows.map(({ tenant: t, payment: p }, i) => {
            const overdue = isOverdueRent(
              Number(p.dueDay),
              Number(p.month),
              Number(p.year),
              p.paidStatus,
            );
            return (
              <Card
                key={i}
                className={`border-0 shadow-sm ${overdue ? "ring-1 ring-red-200" : ""}`}
                data-ocid={`payments.item.${i + 1}`}
              >
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded">
                          {t.unitNumber}
                        </span>
                        <span className="font-semibold">{t.name}</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Due {String(p.dueDay)}th{" "}
                        {p.paidStatus && `· Paid ${formatDate(p.paymentDate)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="font-bold">
                          {formatCurrency(p.rentAmount)}
                        </p>
                        <Badge
                          className={
                            p.paidStatus
                              ? "bg-green-100 text-green-700"
                              : overdue
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                          }
                        >
                          {p.paidStatus
                            ? "Paid"
                            : overdue
                              ? "Overdue"
                              : "Pending"}
                        </Badge>
                      </div>
                      {!p.paidStatus && isAdmin && (
                        <button
                          data-ocid={`payments.mark_paid_button.${i + 1}`}
                          onClick={() => {
                            setMarkTarget({ tenant: t, payment: p });
                            setMarkOpen(true);
                          }}
                          className="p-2 bg-green-50 rounded-lg hover:bg-green-100"
                        >
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={markOpen} onOpenChange={setMarkOpen}>
        <DialogContent data-ocid="payments.mark_paid_dialog">
          <DialogHeader>
            <DialogTitle>Mark Rent Paid</DialogTitle>
          </DialogHeader>
          {markTarget && (
            <p className="text-sm text-gray-600">
              {markTarget.tenant.name} ·{" "}
              {formatCurrency(markTarget.payment.rentAmount)}
            </p>
          )}
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Payment Date</Label>
              <Input
                type="date"
                data-ocid="payments.mark_paid_date_input"
                value={markDate}
                onChange={(e) => setMarkDate(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">Notes</Label>
              <Input
                data-ocid="payments.mark_paid_notes_input"
                value={markNotes}
                onChange={(e) => setMarkNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="payments.mark_paid_cancel_button"
              onClick={() => setMarkOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-green-600"
              data-ocid="payments.mark_paid_confirm_button"
              onClick={markPaid}
              disabled={markSaving}
            >
              {markSaving ? "Saving..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
