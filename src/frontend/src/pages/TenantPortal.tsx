import { Building2, FileText, Home, LogOut, Receipt, Zap } from "lucide-react";
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
import { Skeleton } from "../components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { useActor } from "../hooks/useActor";
import {
  currentMonth,
  currentYear,
  formatCurrency,
  formatDate,
  isOverdueBill,
  isOverdueRent,
  monthName,
} from "../utils/format";

interface Props {
  tenantRecord: Tenant;
  onLogout: () => void;
}

function getDisplayName(raw: string): string {
  const idx = raw.indexOf("|");
  return idx === -1 ? raw : raw.slice(0, idx).trim();
}

export default function TenantPortal({ tenantRecord, onLogout }: Props) {
  const { actor } = useActor();
  const [rentPayments, setRentPayments] = useState<RentPayment[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [deposit, setDeposit] = useState<SecurityDeposit | null>(null);
  const [agreement, setAgreement] = useState<RentalAgreement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!actor) return;
    const id = tenantRecord.id;
    Promise.all([
      actor.getRentPayments(id),
      actor.getBillsByTenant(id),
      actor.getSecurityDeposit(id),
      actor.getRentalAgreement(id),
    ])
      .then(([rp, b, dep, agr]) => {
        setRentPayments(rp);
        setBills(b);
        setDeposit(dep);
        setAgreement(agr);
      })
      .finally(() => setLoading(false));
  }, [actor, tenantRecord.id]);

  const currentRent = rentPayments.find(
    (p) =>
      Number(p.month) === currentMonth() && Number(p.year) === currentYear(),
  );
  const overdueBills = bills.filter((b) =>
    isOverdueBill(b.dueDate, b.paidStatus),
  );
  const overdueRent =
    currentRent &&
    isOverdueRent(
      Number(currentRent.dueDay),
      Number(currentRent.month),
      Number(currentRent.year),
      currentRent.paidStatus,
    );

  const displayName = getDisplayName(tenantRecord.name);

  return (
    <div className="min-h-screen bg-gray-50" data-ocid="tenant_portal.page">
      {/* Header */}
      <div className="bg-indigo-600 text-white px-4 pt-10 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            <span className="font-bold text-lg">Renqo</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-indigo-700"
            onClick={onLogout}
            data-ocid="tenant_portal.logout_button"
          >
            <LogOut className="h-4 w-4 mr-1" /> Logout
          </Button>
        </div>
        <div>
          <p className="text-indigo-200 text-sm">Welcome back,</p>
          <h2 className="text-2xl font-bold">{displayName}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Home className="h-4 w-4 text-indigo-200" />
            <span className="text-indigo-100">
              Unit {tenantRecord.unitNumber}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4">
        {/* Alert banners */}
        {(overdueRent || overdueBills.length > 0) && (
          <div
            className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 space-y-1"
            data-ocid="tenant_portal.error_state"
          >
            {overdueRent && (
              <p className="text-red-700 text-sm font-medium">
                ⚠ Rent payment overdue for {monthName(currentMonth())}{" "}
                {currentYear()}
              </p>
            )}
            {overdueBills.length > 0 && (
              <p className="text-red-700 text-sm">
                ⚠ {overdueBills.length} bill(s) overdue — please clear them
                soon.
              </p>
            )}
          </div>
        )}

        <Tabs
          defaultValue="overview"
          className="mt-2"
          data-ocid="tenant_portal.tab"
        >
          <TabsList className="w-full grid grid-cols-4 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="rent">Rent</TabsTrigger>
            <TabsTrigger value="bills">Bills</TabsTrigger>
            <TabsTrigger value="docs">Docs</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="space-y-3">
            {loading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <>
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      Tenancy Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <Row label="Unit" value={tenantRecord.unitNumber} />
                    <Row
                      label="Move In"
                      value={formatDate(tenantRecord.moveInDate)}
                    />
                    <Row
                      label="Leaving Date"
                      value={
                        tenantRecord.leavingDate
                          ? formatDate(tenantRecord.leavingDate)
                          : "Not set"
                      }
                    />
                    {agreement && (
                      <>
                        <Row
                          label="Agreement Start"
                          value={formatDate(agreement.startDate)}
                        />
                        <Row
                          label="Agreement End"
                          value={formatDate(agreement.endDate)}
                        />
                      </>
                    )}
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      Security Deposit
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    {deposit ? (
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-lg">
                          {formatCurrency(deposit.amount)}
                        </span>
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
                    ) : (
                      <p className="text-gray-400">No deposit record</p>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Rent */}
          <TabsContent value="rent" className="space-y-3">
            {loading ? (
              <Skeleton className="h-48 w-full" />
            ) : rentPayments.length === 0 ? (
              <div
                className="text-center py-10 text-gray-400"
                data-ocid="tenant_portal.rent.empty_state"
              >
                No rent records found.
              </div>
            ) : (
              rentPayments
                .sort(
                  (a, b) =>
                    Number(b.year) - Number(a.year) ||
                    Number(b.month) - Number(a.month),
                )
                .map((p, i) => (
                  <Card
                    key={`${p.year}-${p.month}`}
                    className="border-0 shadow-sm"
                    data-ocid={`tenant_portal.rent.item.${i + 1}`}
                  >
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">
                            {monthName(Number(p.month))} {String(p.year)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Due: {String(p.dueDay)}th of month
                          </p>
                          {p.paidStatus && p.paymentDate && (
                            <p className="text-xs text-gray-400">
                              Paid on {formatDate(p.paymentDate)}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">
                            {formatCurrency(p.rentAmount)}
                          </p>
                          <Badge
                            className={
                              p.paidStatus
                                ? "bg-green-100 text-green-700"
                                : isOverdueRent(
                                      Number(p.dueDay),
                                      Number(p.month),
                                      Number(p.year),
                                      false,
                                    )
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                            }
                          >
                            {p.paidStatus
                              ? "Paid"
                              : isOverdueRent(
                                    Number(p.dueDay),
                                    Number(p.month),
                                    Number(p.year),
                                    false,
                                  )
                                ? "Overdue"
                                : "Pending"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </TabsContent>

          {/* Bills */}
          <TabsContent value="bills" className="space-y-3">
            {loading ? (
              <Skeleton className="h-48 w-full" />
            ) : bills.length === 0 ? (
              <div
                className="text-center py-10 text-gray-400"
                data-ocid="tenant_portal.bills.empty_state"
              >
                No bills found.
              </div>
            ) : (
              bills.map((b, i) => (
                <Card
                  key={String(b.id)}
                  className="border-0 shadow-sm"
                  data-ocid={`tenant_portal.bills.item.${i + 1}`}
                >
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-yellow-500" />
                          <p className="font-semibold capitalize">
                            {b.billType}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500">
                          {b.billingPeriod}
                        </p>
                        <p className="text-xs text-gray-400">
                          Due: {formatDate(b.dueDate)}
                        </p>
                        {b.paidStatus && b.paymentDate && (
                          <p className="text-xs text-gray-400">
                            Paid on {formatDate(b.paymentDate)}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          {formatCurrency(b.amountDue)}
                        </p>
                        <Badge
                          className={
                            b.paidStatus
                              ? "bg-green-100 text-green-700"
                              : isOverdueBill(b.dueDate, false)
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                          }
                        >
                          {b.paidStatus
                            ? "Paid"
                            : isOverdueBill(b.dueDate, false)
                              ? "Overdue"
                              : "Pending"}
                        </Badge>
                      </div>
                    </div>
                    {b.notes && (
                      <p className="text-xs text-gray-400 mt-2">{b.notes}</p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Docs */}
          <TabsContent value="docs" className="space-y-3">
            {loading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Rental Agreement
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  {agreement ? (
                    <div className="space-y-2">
                      <Row
                        label="Start Date"
                        value={formatDate(agreement.startDate)}
                      />
                      <Row
                        label="End Date"
                        value={formatDate(agreement.endDate)}
                      />
                      {new Date(agreement.endDate) < new Date() && (
                        <Badge className="bg-red-100 text-red-700">
                          Expired
                        </Badge>
                      )}
                      {new Date(agreement.endDate) > new Date() && (
                        <Badge className="bg-green-100 text-green-700">
                          Active
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-400">No agreement on file</p>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
