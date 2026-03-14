import { CheckCircle, Download, Zap } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { Bill, Tenant } from "../backend.d";
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
import { exportBillsCSV } from "../utils/export";
import {
  formatCurrency,
  formatDate,
  isOverdueBill,
  rupeesToPaise,
  todayISO,
} from "../utils/format";

interface Props {
  isAdmin: boolean;
}

export default function Bills({ isAdmin }: Props) {
  const { actor } = useActor();
  const [bills, setBills] = useState<Bill[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [markOpen, setMarkOpen] = useState(false);
  const [markTarget, setMarkTarget] = useState<Bill | null>(null);
  const [markDate, setMarkDate] = useState(todayISO());
  const [markNotes, setMarkNotes] = useState("");
  const [markSaving, setMarkSaving] = useState(false);

  const tenantMap = new Map(tenants.map((t) => [String(t.id), t]));

  const load = useCallback(async () => {
    if (!actor) return;
    const [b, ts] = await Promise.all([
      actor.getAllBills(),
      actor.getAllTenants(),
    ]);
    setBills(b);
    setTenants(ts);
  }, [actor]);

  useEffect(() => {
    if (actor) load().finally(() => setLoading(false));
  }, [actor, load]);

  async function markPaid() {
    if (!actor || !markTarget) return;
    setMarkSaving(true);
    await actor.updateBillStatus(markTarget.id, true, markDate, markNotes);
    await load();
    setMarkSaving(false);
    setMarkOpen(false);
    setMarkTarget(null);
  }

  const filtered = bills.filter((b) => {
    if (filterType !== "all" && b.billType !== filterType) return false;
    if (filterStatus === "paid" && !b.paidStatus) return false;
    if (filterStatus === "unpaid" && b.paidStatus) return false;
    return true;
  });

  const billTypes = Array.from(new Set(bills.map((b) => b.billType)));

  return (
    <div className="p-4 space-y-4" data-ocid="bills.page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bills</h1>
          <p className="text-sm text-gray-500">
            {bills.filter((b) => !b.paidStatus).length} unpaid
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          data-ocid="bills.export_button"
          onClick={() => exportBillsCSV(tenants, bills)}
        >
          <Download className="h-4 w-4 mr-1" /> Export
        </Button>
      </div>

      <div className="flex gap-2">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger
            data-ocid="bills.type_filter_select"
            className="flex-1"
          >
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {billTypes.map((t) => (
              <SelectItem key={t} value={t} className="capitalize">
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger
            data-ocid="bills.status_filter_select"
            className="flex-1"
          >
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="unpaid">Unpaid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="text-center py-10 text-gray-400"
          data-ocid="bills.empty_state"
        >
          No bills found.
        </div>
      ) : (
        <div className="space-y-2" data-ocid="bills.list">
          {filtered.map((b, i) => {
            const tenant = tenantMap.get(String(b.tenantId));
            const overdue = isOverdueBill(b.dueDate, b.paidStatus);
            return (
              <Card
                key={i}
                className={`border-0 shadow-sm ${overdue ? "ring-1 ring-red-200" : ""}`}
                data-ocid={`bills.item.${i + 1}`}
              >
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-500" />
                        <span className="font-semibold capitalize">
                          {b.billType}
                        </span>
                        {tenant && (
                          <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
                            {tenant.unitNumber}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {tenant?.name} · {b.billingPeriod}
                      </p>
                      <p className="text-xs text-gray-400">
                        Due: {formatDate(b.dueDate)}
                      </p>
                      {b.paidStatus && (
                        <p className="text-xs text-gray-400">
                          Paid: {formatDate(b.paymentDate)}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="font-bold">
                          {formatCurrency(b.amountDue)}
                        </p>
                        <Badge
                          className={
                            b.paidStatus
                              ? "bg-green-100 text-green-700"
                              : overdue
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                          }
                        >
                          {b.paidStatus
                            ? "Paid"
                            : overdue
                              ? "Overdue"
                              : "Pending"}
                        </Badge>
                      </div>
                      {!b.paidStatus && isAdmin && (
                        <button
                          data-ocid={`bills.mark_paid_button.${i + 1}`}
                          onClick={() => {
                            setMarkTarget(b);
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
        <DialogContent data-ocid="bills.mark_paid_dialog">
          <DialogHeader>
            <DialogTitle>Mark Bill Paid</DialogTitle>
          </DialogHeader>
          {markTarget && (
            <p className="text-sm text-gray-600 capitalize">
              {markTarget.billType} · {formatCurrency(markTarget.amountDue)}
            </p>
          )}
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Payment Date</Label>
              <Input
                type="date"
                data-ocid="bills.mark_paid_date_input"
                value={markDate}
                onChange={(e) => setMarkDate(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">Notes</Label>
              <Input
                data-ocid="bills.mark_paid_notes_input"
                value={markNotes}
                onChange={(e) => setMarkNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="bills.mark_paid_cancel_button"
              onClick={() => setMarkOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-green-600"
              data-ocid="bills.mark_paid_confirm_button"
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
