import { AlertCircle, Receipt, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import type { DashboardStats, RentPayment, Tenant } from "../backend.d";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { useActor } from "../hooks/useActor";
import {
  currentMonth,
  currentYear,
  formatCurrency,
  isOverdueRent,
  monthName,
} from "../utils/format";

interface Props {
  onNavigate: (page: string, id?: bigint) => void;
}

export default function Dashboard({ onNavigate }: Props) {
  const { actor } = useActor();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [allPayments, setAllPayments] = useState<Map<string, RentPayment[]>>(
    new Map(),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!actor) return;
    Promise.all([actor.getDashboardStats(), actor.getAllTenants()])
      .then(async ([s, ts]) => {
        setStats(s);
        setTenants(ts);
        const payMap = new Map<string, RentPayment[]>();
        await Promise.all(
          ts.map((t) =>
            actor
              .getRentPayments(t.id)
              .then((ps) => payMap.set(String(t.id), ps)),
          ),
        );
        setAllPayments(payMap);
      })
      .finally(() => setLoading(false));
  }, [actor]);

  const overdueList = tenants.filter((t) => {
    const ps = allPayments.get(String(t.id)) || [];
    return ps.some(
      (p) =>
        Number(p.month) === currentMonth() &&
        Number(p.year) === currentYear() &&
        isOverdueRent(
          Number(p.dueDay),
          Number(p.month),
          Number(p.year),
          p.paidStatus,
        ),
    );
  });

  const upcomingList = tenants.filter((t) => {
    const ps = allPayments.get(String(t.id)) || [];
    const curr = ps.find(
      (p) =>
        Number(p.month) === currentMonth() && Number(p.year) === currentYear(),
    );
    if (!curr || curr.paidStatus) return false;
    const today = new Date();
    const due = new Date(
      currentYear(),
      currentMonth() - 1,
      Number(curr.dueDay),
    );
    const diff = (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  });

  return (
    <div className="p-4 space-y-5" data-ocid="dashboard.page">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm">
          {monthName(currentMonth())} {currentYear()}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<Users className="h-5 w-5 text-indigo-500" />}
            label="Total Tenants"
            value={String(stats?.totalTenants ?? 0)}
            bg="bg-indigo-50"
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5 text-green-500" />}
            label="Expected Rent"
            value={formatCurrency(stats?.totalExpectedRentThisMonth ?? 0n)}
            bg="bg-green-50"
          />
          <StatCard
            icon={<AlertCircle className="h-5 w-5 text-red-500" />}
            label="Overdue Rents"
            value={String(stats?.overdueRents ?? 0)}
            bg="bg-red-50"
            highlight={Number(stats?.overdueRents) > 0}
          />
          <StatCard
            icon={<Receipt className="h-5 w-5 text-orange-500" />}
            label="Overdue Bills"
            value={String(stats?.overdueBills ?? 0)}
            bg="bg-orange-50"
            highlight={Number(stats?.overdueBills) > 0}
          />
        </div>
      )}

      {overdueList.length > 0 && (
        <section data-ocid="dashboard.overdue.list">
          <h2 className="font-semibold text-gray-800 mb-2 text-sm uppercase tracking-wide">
            Overdue Rents
          </h2>
          <div className="space-y-2">
            {overdueList.map((t, i) => {
              const ps = allPayments.get(String(t.id)) || [];
              const curr = ps.find(
                (p) =>
                  Number(p.month) === currentMonth() &&
                  Number(p.year) === currentYear(),
              );
              return (
                <button
                  type="button"
                  key={String(t.id)}
                  data-ocid={`dashboard.overdue.item.${i + 1}`}
                  className="w-full"
                  onClick={() => onNavigate("tenant-detail", t.id)}
                >
                  <Card className="border border-red-200 bg-red-50 text-left hover:bg-red-100 transition-colors">
                    <CardContent className="py-3 px-4 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-800">{t.name}</p>
                        <p className="text-sm text-gray-500">
                          Unit {t.unitNumber}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-600">
                          {curr ? formatCurrency(curr.rentAmount) : "-"}
                        </p>
                        <Badge className="bg-red-100 text-red-700 text-xs">
                          Overdue
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {upcomingList.length > 0 && (
        <section data-ocid="dashboard.upcoming.list">
          <h2 className="font-semibold text-gray-800 mb-2 text-sm uppercase tracking-wide">
            Due This Week
          </h2>
          <div className="space-y-2">
            {upcomingList.map((t, i) => {
              const ps = allPayments.get(String(t.id)) || [];
              const curr = ps.find(
                (p) =>
                  Number(p.month) === currentMonth() &&
                  Number(p.year) === currentYear(),
              );
              return (
                <button
                  type="button"
                  key={String(t.id)}
                  data-ocid={`dashboard.upcoming.item.${i + 1}`}
                  className="w-full"
                  onClick={() => onNavigate("tenant-detail", t.id)}
                >
                  <Card className="border border-yellow-200 bg-yellow-50 text-left hover:bg-yellow-100 transition-colors">
                    <CardContent className="py-3 px-4 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-800">{t.name}</p>
                        <p className="text-sm text-gray-500">
                          Due {String(curr?.dueDay)}th
                        </p>
                      </div>
                      <p className="font-bold text-yellow-700">
                        {curr ? formatCurrency(curr.rentAmount) : "-"}
                      </p>
                    </CardContent>
                  </Card>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {!loading && overdueList.length === 0 && upcomingList.length === 0 && (
        <div
          className="text-center py-8 text-gray-400"
          data-ocid="dashboard.empty_state"
        >
          <Receipt className="h-10 w-10 mx-auto mb-2 text-gray-300" />
          <p>All payments are up to date!</p>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  bg,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bg: string;
  highlight?: boolean;
}) {
  return (
    <Card
      className={`border-0 shadow-sm ${bg} ${highlight ? "ring-2 ring-red-300" : ""}`}
    >
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center gap-2 mb-1">
          {icon}
          <span className="text-xs text-gray-500">{label}</span>
        </div>
        <p
          className={`text-xl font-bold ${highlight ? "text-red-600" : "text-gray-900"}`}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
