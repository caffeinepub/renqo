import {
  CheckCircle,
  ChevronLeft,
  Edit,
  Home,
  Mail,
  Phone,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import type {
  Bill,
  RentPayment,
  RentalAgreement,
  SecurityDeposit,
  Tenant,
} from "../backend.d";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Textarea } from "../components/ui/textarea";
import { useActor } from "../hooks/useActor";
import {
  currentMonth,
  currentYear,
  formatCurrency,
  formatDate,
  isOverdueBill,
  isOverdueRent,
  monthName,
  rupeesToPaise,
  todayISO,
} from "../utils/format";

interface Props {
  tenantId: bigint;
  onBack: () => void;
  isAdmin: boolean;
}

export default function TenantDetail({ tenantId, onBack, isAdmin }: Props) {
  const { actor } = useActor();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [rentPayments, setRentPayments] = useState<RentPayment[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [deposit, setDeposit] = useState<SecurityDeposit | null>(null);
  const [agreement, setAgreement] = useState<RentalAgreement | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit tenant state
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<Omit<Tenant, "id">>({
    name: "",
    phone: "",
    email: "",
    unitNumber: "",
    moveInDate: "",
    leavingDate: "",
    brokerName: "",
    brokerContact: "",
    notes: "",
  });
  const [editSaving, setEditSaving] = useState(false);

  // Delete state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Add rent payment state
  const [addRentOpen, setAddRentOpen] = useState(false);
  const [rentForm, setRentForm] = useState({
    month: String(currentMonth()),
    year: String(currentYear()),
    amount: "",
    rentAmount: "",
    dueDay: "1",
  });
  const [addRentSaving, setAddRentSaving] = useState(false);

  // Mark rent paid state
  const [markRentOpen, setMarkRentOpen] = useState(false);
  const [markRentTarget, setMarkRentTarget] = useState<RentPayment | null>(
    null,
  );
  const [markRentDate, setMarkRentDate] = useState(todayISO());
  const [markRentNotes, setMarkRentNotes] = useState("");
  const [markRentSaving, setMarkRentSaving] = useState(false);

  // Add bill state
  const [addBillOpen, setAddBillOpen] = useState(false);
  const [billForm, setBillForm] = useState({
    billType: "electricity",
    billingPeriod: "",
    amountDue: "",
    dueDate: "",
    notes: "",
  });
  const [addBillSaving, setAddBillSaving] = useState(false);

  // Mark bill paid state
  const [markBillOpen, setMarkBillOpen] = useState(false);
  const [markBillTarget, setMarkBillTarget] = useState<Bill | null>(null);
  const [markBillDate, setMarkBillDate] = useState(todayISO());
  const [markBillNotes, setMarkBillNotes] = useState("");
  const [markBillSaving, setMarkBillSaving] = useState(false);

  // Deposit / Agreement
  const [depForm, setDepForm] = useState({
    amount: "",
    paidStatus: "true",
    dateReceived: todayISO(),
  });
  const [agrForm, setAgrForm] = useState({ startDate: "", endDate: "" });
  const [depSaving, setDepSaving] = useState(false);
  const [agrSaving, setAgrSaving] = useState(false);

  async function reload() {
    if (!actor) return;
    const [t, rp, b, dep, agr] = await Promise.all([
      actor.getTenant(tenantId),
      actor.getRentPayments(tenantId),
      actor.getBillsByTenant(tenantId),
      actor.getSecurityDeposit(tenantId),
      actor.getRentalAgreement(tenantId),
    ]);
    setTenant(t);
    setRentPayments(rp);
    setBills(b);
    setDeposit(dep);
    setAgreement(agr);
  }

  useEffect(() => {
    if (!actor) return;
    reload().finally(() => setLoading(false));
  }, [actor, tenantId]);

  useEffect(() => {
    if (tenant) {
      setEditForm({
        name: tenant.name,
        phone: tenant.phone,
        email: tenant.email,
        unitNumber: tenant.unitNumber,
        moveInDate: tenant.moveInDate,
        leavingDate: tenant.leavingDate,
        brokerName: tenant.brokerName,
        brokerContact: tenant.brokerContact,
        notes: tenant.notes,
      });
    }
  }, [tenant]);

  useEffect(() => {
    if (deposit)
      setDepForm({
        amount: String(Number(deposit.amount) / 100),
        paidStatus: String(deposit.paidStatus),
        dateReceived: deposit.dateReceived,
      });
    if (agreement)
      setAgrForm({
        startDate: agreement.startDate,
        endDate: agreement.endDate,
      });
  }, [deposit, agreement]);

  async function saveEdit() {
    if (!actor) return;
    setEditSaving(true);
    await actor.updateTenant(
      tenantId,
      editForm.name,
      editForm.phone,
      editForm.email,
      editForm.unitNumber,
      editForm.moveInDate,
      editForm.leavingDate,
      editForm.brokerName,
      editForm.brokerContact,
      editForm.notes,
    );
    await reload();
    setEditSaving(false);
    setEditOpen(false);
  }

  async function deleteTenant() {
    if (!actor) return;
    setDeleting(true);
    await actor.deleteTenant(tenantId);
    setDeleting(false);
    setDeleteOpen(false);
    onBack();
  }

  async function addRentPayment() {
    if (!actor) return;
    setAddRentSaving(true);
    await actor.addRentPayment(
      tenantId,
      BigInt(rentForm.month),
      BigInt(rentForm.year),
      rupeesToPaise(rentForm.amount),
      rupeesToPaise(rentForm.rentAmount),
      BigInt(rentForm.dueDay),
    );
    await reload();
    setAddRentSaving(false);
    setAddRentOpen(false);
  }

  async function markRentPaid() {
    if (!actor || !markRentTarget) return;
    setMarkRentSaving(true);
    await actor.updateRentPaymentStatus(
      tenantId,
      markRentTarget.month,
      markRentTarget.year,
      true,
      markRentDate,
      markRentNotes,
    );
    await reload();
    setMarkRentSaving(false);
    setMarkRentOpen(false);
    setMarkRentTarget(null);
  }

  async function addBill() {
    if (!actor) return;
    setAddBillSaving(true);
    await actor.addBill(
      tenantId,
      billForm.billType,
      billForm.billingPeriod,
      rupeesToPaise(billForm.amountDue),
      billForm.dueDate,
      billForm.notes,
    );
    await reload();
    setAddBillSaving(false);
    setAddBillOpen(false);
  }

  async function markBillPaid() {
    if (!actor || !markBillTarget) return;
    setMarkBillSaving(true);
    await actor.updateBillStatus(
      markBillTarget.id,
      true,
      markBillDate,
      markBillNotes,
    );
    await reload();
    setMarkBillSaving(false);
    setMarkBillOpen(false);
    setMarkBillTarget(null);
  }

  async function saveDeposit() {
    if (!actor) return;
    setDepSaving(true);
    await actor.addSecurityDeposit(
      tenantId,
      rupeesToPaise(depForm.amount),
      depForm.paidStatus === "true",
      depForm.dateReceived,
    );
    await reload();
    setDepSaving(false);
  }

  async function saveAgreement() {
    if (!actor) return;
    setAgrSaving(true);
    await actor.addRentalAgreement(
      tenantId,
      agrForm.startDate,
      agrForm.endDate,
    );
    await reload();
    setAgrSaving(false);
  }

  if (loading)
    return (
      <div className="p-4">
        <Skeleton
          className="h-40 w-full"
          data-ocid="tenant_detail.loading_state"
        />
      </div>
    );
  if (!tenant) return <div className="p-4">Tenant not found.</div>;

  const sortedRentPayments = [...rentPayments].sort(
    (a, b) =>
      Number(b.year) - Number(a.year) || Number(b.month) - Number(a.month),
  );

  return (
    <div className="pb-20" data-ocid="tenant_detail.page">
      {/* Header */}
      <div className="bg-indigo-600 text-white px-4 pt-10 pb-6">
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={onBack}
            data-ocid="tenant_detail.back_button"
            className="p-1 rounded-lg hover:bg-indigo-500"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-indigo-200 text-sm">Back to Tenants</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <div className="bg-white/20 text-white text-sm px-2 py-0.5 rounded inline-block mb-2">
              {tenant.unitNumber}
            </div>
            <h1 className="text-2xl font-bold">{tenant.name}</h1>
          </div>
          {isAdmin && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditOpen(true)}
                data-ocid="tenant_detail.edit_button"
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setDeleteOpen(true)}
                data-ocid="tenant_detail.delete_button"
                className="p-2 bg-red-500/50 rounded-lg hover:bg-red-500/70"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 -mt-2">
        <Tabs defaultValue="overview" data-ocid="tenant_detail.tab">
          <TabsList className="w-full grid grid-cols-4 mb-4">
            <TabsTrigger value="overview">Info</TabsTrigger>
            <TabsTrigger value="rent">Rent</TabsTrigger>
            <TabsTrigger value="bills">Bills</TabsTrigger>
            <TabsTrigger value="deposit">Deposit</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-3">
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-4 space-y-3">
                <InfoRow
                  icon={<Phone className="h-4 w-4" />}
                  label="Phone"
                  value={tenant.phone}
                />
                <InfoRow
                  icon={<Mail className="h-4 w-4" />}
                  label="Email"
                  value={tenant.email || "-"}
                />
                <InfoRow
                  icon={<Home className="h-4 w-4" />}
                  label="Move In"
                  value={formatDate(tenant.moveInDate)}
                />
                {tenant.leavingDate && (
                  <InfoRow
                    icon={<Home className="h-4 w-4" />}
                    label="Leaving"
                    value={formatDate(tenant.leavingDate)}
                  />
                )}
                {tenant.brokerName && (
                  <InfoRow
                    icon={<User className="h-4 w-4" />}
                    label="Broker"
                    value={`${tenant.brokerName} (${tenant.brokerContact})`}
                  />
                )}
                {tenant.notes && (
                  <div className="pt-1 border-t">
                    <p className="text-xs text-gray-500">Notes</p>
                    <p className="text-sm mt-1">{tenant.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* RENT TAB */}
          <TabsContent value="rent" className="space-y-3">
            {isAdmin && (
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                data-ocid="tenant_detail.add_rent_button"
                onClick={() => setAddRentOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Rent Record
              </Button>
            )}
            {sortedRentPayments.length === 0 ? (
              <div
                className="text-center py-8 text-gray-400"
                data-ocid="tenant_detail.rent.empty_state"
              >
                No rent records.
              </div>
            ) : (
              sortedRentPayments.map((p, i) => {
                const overdue = isOverdueRent(
                  Number(p.dueDay),
                  Number(p.month),
                  Number(p.year),
                  p.paidStatus,
                );
                return (
                  <Card
                    key={i}
                    className={`border-0 shadow-sm ${overdue ? "ring-1 ring-red-300" : ""}`}
                    data-ocid={`tenant_detail.rent.item.${i + 1}`}
                  >
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">
                            {monthName(Number(p.month))} {String(p.year)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Due {String(p.dueDay)}th · Rent{" "}
                            {formatCurrency(p.rentAmount)}
                          </p>
                          {p.paidStatus && (
                            <p className="text-xs text-gray-400">
                              Paid: {formatDate(p.paymentDate)}
                            </p>
                          )}
                          {p.notes && (
                            <p className="text-xs text-gray-400">{p.notes}</p>
                          )}
                        </div>
                        <div className="text-right space-y-1">
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
                          {!p.paidStatus && isAdmin && (
                            <button
                              type="button"
                              data-ocid={`tenant_detail.mark_rent_paid_button.${i + 1}`}
                              onClick={() => {
                                setMarkRentTarget(p);
                                setMarkRentOpen(true);
                              }}
                              className="flex items-center gap-1 text-xs text-indigo-600 font-medium"
                            >
                              <CheckCircle className="h-3 w-3" /> Mark Paid
                            </button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          {/* BILLS TAB */}
          <TabsContent value="bills" className="space-y-3">
            {isAdmin && (
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                data-ocid="tenant_detail.add_bill_button"
                onClick={() => setAddBillOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Bill
              </Button>
            )}
            {bills.length === 0 ? (
              <div
                className="text-center py-8 text-gray-400"
                data-ocid="tenant_detail.bills.empty_state"
              >
                No bills.
              </div>
            ) : (
              bills.map((b, i) => {
                const overdue = isOverdueBill(b.dueDate, b.paidStatus);
                return (
                  <Card
                    key={i}
                    className={`border-0 shadow-sm ${overdue ? "ring-1 ring-red-300" : ""}`}
                    data-ocid={`tenant_detail.bills.item.${i + 1}`}
                  >
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold capitalize">
                            {b.billType}
                          </p>
                          <p className="text-sm text-gray-500">
                            {b.billingPeriod}
                          </p>
                          <p className="text-xs text-gray-400">
                            Due: {formatDate(b.dueDate)}
                          </p>
                          {b.paidStatus && (
                            <p className="text-xs text-gray-400">
                              Paid: {formatDate(b.paymentDate)}
                            </p>
                          )}
                          {b.notes && (
                            <p className="text-xs text-gray-400">{b.notes}</p>
                          )}
                        </div>
                        <div className="text-right space-y-1">
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
                          {!b.paidStatus && isAdmin && (
                            <button
                              type="button"
                              data-ocid={`tenant_detail.mark_bill_paid_button.${i + 1}`}
                              onClick={() => {
                                setMarkBillTarget(b);
                                setMarkBillOpen(true);
                              }}
                              className="flex items-center gap-1 text-xs text-indigo-600 font-medium"
                            >
                              <CheckCircle className="h-3 w-3" /> Mark Paid
                            </button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          {/* DEPOSIT TAB */}
          <TabsContent value="deposit" className="space-y-3">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Security Deposit</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {deposit && (
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Amount</span>
                      <span className="font-bold">
                        {formatCurrency(deposit.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status</span>
                      <Badge
                        className={
                          deposit.paidStatus
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }
                      >
                        {deposit.paidStatus ? "Paid" : "Pending"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date Received</span>
                      <span>{formatDate(deposit.dateReceived)}</span>
                    </div>
                  </div>
                )}
                {isAdmin && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Amount (₹)</Label>
                        <Input
                          data-ocid="tenant_detail.deposit_amount_input"
                          value={depForm.amount}
                          onChange={(e) =>
                            setDepForm((f) => ({
                              ...f,
                              amount: e.target.value,
                            }))
                          }
                          placeholder="50000"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Status</Label>
                        <Select
                          value={depForm.paidStatus}
                          onValueChange={(v) =>
                            setDepForm((f) => ({ ...f, paidStatus: v }))
                          }
                        >
                          <SelectTrigger data-ocid="tenant_detail.deposit_status_select">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Paid</SelectItem>
                            <SelectItem value="false">Pending</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Date Received</Label>
                      <Input
                        type="date"
                        data-ocid="tenant_detail.deposit_date_input"
                        value={depForm.dateReceived}
                        onChange={(e) =>
                          setDepForm((f) => ({
                            ...f,
                            dateReceived: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <Button
                      className="w-full bg-indigo-600 hover:bg-indigo-700"
                      data-ocid="tenant_detail.deposit_save_button"
                      onClick={saveDeposit}
                      disabled={depSaving}
                    >
                      {depSaving ? "Saving..." : "Save Deposit"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Rental Agreement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {agreement && (
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Start Date</span>
                      <span>{formatDate(agreement.startDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">End Date</span>
                      <span>{formatDate(agreement.endDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Status</span>
                      <Badge
                        className={
                          new Date(agreement.endDate) > new Date()
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }
                      >
                        {new Date(agreement.endDate) > new Date()
                          ? "Active"
                          : "Expired"}
                      </Badge>
                    </div>
                  </div>
                )}
                {isAdmin && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs">Start Date</Label>
                        <Input
                          type="date"
                          data-ocid="tenant_detail.agreement_start_input"
                          value={agrForm.startDate}
                          onChange={(e) =>
                            setAgrForm((f) => ({
                              ...f,
                              startDate: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs">End Date</Label>
                        <Input
                          type="date"
                          data-ocid="tenant_detail.agreement_end_input"
                          value={agrForm.endDate}
                          onChange={(e) =>
                            setAgrForm((f) => ({
                              ...f,
                              endDate: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <Button
                      className="w-full bg-indigo-600 hover:bg-indigo-700"
                      data-ocid="tenant_detail.agreement_save_button"
                      onClick={saveAgreement}
                      disabled={agrSaving}
                    >
                      {agrSaving ? "Saving..." : "Save Agreement"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Tenant Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent
          className="max-h-[90vh] overflow-y-auto"
          data-ocid="tenant_detail.edit_dialog"
        >
          <DialogHeader>
            <DialogTitle>Edit Tenant</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {(
              [
                "name",
                "phone",
                "email",
                "unitNumber",
                "brokerName",
                "brokerContact",
              ] as const
            ).map((field) => (
              <div key={field}>
                <Label className="text-xs capitalize">
                  {field.replace(/([A-Z])/g, " $1")}
                </Label>
                <Input
                  data-ocid={`tenant_detail.edit_${field}_input`}
                  value={editForm[field]}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, [field]: e.target.value }))
                  }
                />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Move In Date</Label>
                <Input
                  type="date"
                  value={editForm.moveInDate}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, moveInDate: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label className="text-xs">Leaving Date</Label>
                <Input
                  type="date"
                  value={editForm.leavingDate}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, leavingDate: e.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Notes</Label>
              <Textarea
                value={editForm.notes}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, notes: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="tenant_detail.edit_cancel_button"
              onClick={() => setEditOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-indigo-600"
              data-ocid="tenant_detail.edit_save_button"
              onClick={saveEdit}
              disabled={editSaving}
            >
              {editSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent data-ocid="tenant_detail.delete_dialog">
          <DialogHeader>
            <DialogTitle>Delete Tenant?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            This will permanently delete <strong>{tenant.name}</strong> and all
            associated records.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="tenant_detail.delete_cancel_button"
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              data-ocid="tenant_detail.delete_confirm_button"
              onClick={deleteTenant}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Rent Dialog */}
      <Dialog open={addRentOpen} onOpenChange={setAddRentOpen}>
        <DialogContent data-ocid="tenant_detail.add_rent_dialog">
          <DialogHeader>
            <DialogTitle>Add Rent Record</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Month</Label>
                <Select
                  value={rentForm.month}
                  onValueChange={(v) =>
                    setRentForm((f) => ({ ...f, month: v }))
                  }
                >
                  <SelectTrigger data-ocid="tenant_detail.rent_month_select">
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
              </div>
              <div>
                <Label className="text-xs">Year</Label>
                <Input
                  value={rentForm.year}
                  onChange={(e) =>
                    setRentForm((f) => ({ ...f, year: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Rent Amount (₹)</Label>
                <Input
                  data-ocid="tenant_detail.rent_amount_input"
                  placeholder="10000"
                  value={rentForm.rentAmount}
                  onChange={(e) =>
                    setRentForm((f) => ({ ...f, rentAmount: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label className="text-xs">Due Day</Label>
                <Input
                  data-ocid="tenant_detail.rent_due_day_input"
                  placeholder="1-31"
                  value={rentForm.dueDay}
                  onChange={(e) =>
                    setRentForm((f) => ({ ...f, dueDay: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="tenant_detail.add_rent_cancel_button"
              onClick={() => setAddRentOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-indigo-600"
              data-ocid="tenant_detail.add_rent_save_button"
              onClick={addRentPayment}
              disabled={addRentSaving}
            >
              {addRentSaving ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark Rent Paid Dialog */}
      <Dialog open={markRentOpen} onOpenChange={setMarkRentOpen}>
        <DialogContent data-ocid="tenant_detail.mark_rent_dialog">
          <DialogHeader>
            <DialogTitle>Mark Rent as Paid</DialogTitle>
          </DialogHeader>
          {markRentTarget && (
            <p className="text-sm text-gray-600">
              {monthName(Number(markRentTarget.month))}{" "}
              {String(markRentTarget.year)} ·{" "}
              {formatCurrency(markRentTarget.rentAmount)}
            </p>
          )}
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Payment Date</Label>
              <Input
                type="date"
                data-ocid="tenant_detail.mark_rent_date_input"
                value={markRentDate}
                onChange={(e) => setMarkRentDate(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">Notes (optional)</Label>
              <Input
                data-ocid="tenant_detail.mark_rent_notes_input"
                value={markRentNotes}
                onChange={(e) => setMarkRentNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="tenant_detail.mark_rent_cancel_button"
              onClick={() => setMarkRentOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-green-600"
              data-ocid="tenant_detail.mark_rent_confirm_button"
              onClick={markRentPaid}
              disabled={markRentSaving}
            >
              {markRentSaving ? "Saving..." : "Confirm Paid"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Bill Dialog */}
      <Dialog open={addBillOpen} onOpenChange={setAddBillOpen}>
        <DialogContent data-ocid="tenant_detail.add_bill_dialog">
          <DialogHeader>
            <DialogTitle>Add Bill</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Bill Type</Label>
              <Select
                value={billForm.billType}
                onValueChange={(v) =>
                  setBillForm((f) => ({ ...f, billType: v }))
                }
              >
                <SelectTrigger data-ocid="tenant_detail.bill_type_select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "electricity",
                    "water",
                    "maintenance",
                    "gas",
                    "internet",
                    "other",
                  ].map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Billing Period (e.g. Jan 2025)</Label>
              <Input
                data-ocid="tenant_detail.bill_period_input"
                value={billForm.billingPeriod}
                onChange={(e) =>
                  setBillForm((f) => ({ ...f, billingPeriod: e.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Amount Due (₹)</Label>
                <Input
                  data-ocid="tenant_detail.bill_amount_input"
                  placeholder="2000"
                  value={billForm.amountDue}
                  onChange={(e) =>
                    setBillForm((f) => ({ ...f, amountDue: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label className="text-xs">Due Date</Label>
                <Input
                  type="date"
                  data-ocid="tenant_detail.bill_due_date_input"
                  value={billForm.dueDate}
                  onChange={(e) =>
                    setBillForm((f) => ({ ...f, dueDate: e.target.value }))
                  }
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">Notes</Label>
              <Input
                data-ocid="tenant_detail.bill_notes_input"
                value={billForm.notes}
                onChange={(e) =>
                  setBillForm((f) => ({ ...f, notes: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="tenant_detail.add_bill_cancel_button"
              onClick={() => setAddBillOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-indigo-600"
              data-ocid="tenant_detail.add_bill_save_button"
              onClick={addBill}
              disabled={addBillSaving}
            >
              {addBillSaving ? "Adding..." : "Add Bill"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark Bill Paid Dialog */}
      <Dialog open={markBillOpen} onOpenChange={setMarkBillOpen}>
        <DialogContent data-ocid="tenant_detail.mark_bill_dialog">
          <DialogHeader>
            <DialogTitle>Mark Bill as Paid</DialogTitle>
          </DialogHeader>
          {markBillTarget && (
            <p className="text-sm text-gray-600 capitalize">
              {markBillTarget.billType} ·{" "}
              {formatCurrency(markBillTarget.amountDue)}
            </p>
          )}
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Payment Date</Label>
              <Input
                type="date"
                data-ocid="tenant_detail.mark_bill_date_input"
                value={markBillDate}
                onChange={(e) => setMarkBillDate(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">Notes (optional)</Label>
              <Input
                data-ocid="tenant_detail.mark_bill_notes_input"
                value={markBillNotes}
                onChange={(e) => setMarkBillNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="tenant_detail.mark_bill_cancel_button"
              onClick={() => setMarkBillOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-green-600"
              data-ocid="tenant_detail.mark_bill_confirm_button"
              onClick={markBillPaid}
              disabled={markBillSaving}
            >
              {markBillSaving ? "Saving..." : "Confirm Paid"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-gray-400 mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
