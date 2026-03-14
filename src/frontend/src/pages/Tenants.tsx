import { ChevronRight, Download, Phone, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import type { RentalAgreement, SecurityDeposit, Tenant } from "../backend.d";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import { useActor } from "../hooks/useActor";
import { exportTenantsCSV } from "../utils/export";
import { formatDate } from "../utils/format";

interface Props {
  onNavigate: (page: string, id?: bigint) => void;
  isAdmin: boolean;
}

function tenantStatus(t: Tenant): "active" | "leaving" | "departed" {
  if (!t.leavingDate) return "active";
  const leaving = new Date(t.leavingDate);
  const today = new Date();
  const diff = (leaving.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  if (diff < 0) return "departed";
  if (diff <= 30) return "leaving";
  return "active";
}

export default function Tenants({ onNavigate, isAdmin }: Props) {
  const { actor } = useActor();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [deposits, setDeposits] = useState<Map<string, SecurityDeposit | null>>(
    new Map(),
  );
  const [agreements, setAgreements] = useState<
    Map<string, RentalAgreement | null>
  >(new Map());

  useEffect(() => {
    if (!actor) return;
    actor
      .getAllTenants()
      .then(async (ts) => {
        setTenants(ts);
        const dMap = new Map<string, SecurityDeposit | null>();
        const aMap = new Map<string, RentalAgreement | null>();
        await Promise.all(
          ts.map(async (t) => {
            const [dep, agr] = await Promise.all([
              actor.getSecurityDeposit(t.id),
              actor.getRentalAgreement(t.id),
            ]);
            dMap.set(String(t.id), dep);
            aMap.set(String(t.id), agr);
          }),
        );
        setDeposits(dMap);
        setAgreements(aMap);
      })
      .finally(() => setLoading(false));
  }, [actor]);

  const filtered = tenants.filter(
    (t) =>
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.unitNumber.toLowerCase().includes(query.toLowerCase()),
  );

  const statusColors = {
    active: "bg-green-100 text-green-700",
    leaving: "bg-yellow-100 text-yellow-700",
    departed: "bg-gray-100 text-gray-500",
  };

  return (
    <div className="p-4 space-y-4" data-ocid="tenants.page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
          <p className="text-gray-500 text-sm">{tenants.length} total</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            data-ocid="tenants.export_button"
            onClick={() => exportTenantsCSV(tenants, deposits, agreements)}
          >
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
          {isAdmin && (
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700"
              data-ocid="tenants.add_button"
              onClick={() => onNavigate("add-tenant")}
            >
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          )}
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          data-ocid="tenants.search_input"
          className="pl-9"
          placeholder="Search by name or unit..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="text-center py-10 text-gray-400"
          data-ocid="tenants.empty_state"
        >
          <p>No tenants found.</p>
          {isAdmin && (
            <Button
              className="mt-3 bg-indigo-600"
              onClick={() => onNavigate("add-tenant")}
              data-ocid="tenants.add_first_button"
            >
              Add First Tenant
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2" data-ocid="tenants.list">
          {filtered.map((t, i) => {
            const status = tenantStatus(t);
            return (
              <button
                type="button"
                key={String(t.id)}
                className="w-full"
                data-ocid={`tenants.item.${i + 1}`}
                onClick={() => onNavigate("tenant-detail", t.id)}
              >
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow text-left">
                  <CardContent className="py-3 px-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded">
                            {t.unitNumber}
                          </span>
                          <span className="font-semibold text-gray-900 truncate">
                            {t.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {t.phone}
                          </span>
                        </div>
                        {t.leavingDate && (
                          <p className="text-xs text-gray-400">
                            Leaving: {formatDate(t.leavingDate)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${statusColors[status]}`}>
                          {status === "active"
                            ? "Active"
                            : status === "leaving"
                              ? "Leaving Soon"
                              : "Departed"}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
