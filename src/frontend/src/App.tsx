import {
  Bell,
  Building2,
  CheckCircle2,
  Home,
  LayoutDashboard,
  Loader2,
  LogOut,
  Receipt,
  RefreshCw,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { Tenant } from "./backend.d";
import { Button } from "./components/ui/button";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import AddProperty from "./pages/AddProperty";
import AddTenant from "./pages/AddTenant";
import Bills from "./pages/Bills";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Payments from "./pages/Payments";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import Register from "./pages/Register";
import Reminders from "./pages/Reminders";
import TenantDetail from "./pages/TenantDetail";
import TenantPortal from "./pages/TenantPortal";
import Tenants from "./pages/Tenants";

type Page =
  | "dashboard"
  | "tenants"
  | "tenant-detail"
  | "add-tenant"
  | "payments"
  | "bills"
  | "reminders"
  | "properties"
  | "property-detail"
  | "add-property";

function parseProfileName(raw: string): {
  displayName: string;
  unitNumber: string;
} {
  const idx = raw.indexOf("|");
  if (idx === -1) return { displayName: raw, unitNumber: "" };
  return {
    displayName: raw.slice(0, idx).trim(),
    unitNumber: raw.slice(idx + 1).trim(),
  };
}

function matchTenant(
  tenants: Tenant[],
  profileName: string,
): Tenant | undefined {
  const { displayName, unitNumber } = parseProfileName(profileName);
  return tenants.find(
    (t) =>
      t.name.toLowerCase() === displayName.toLowerCase() ||
      (unitNumber && t.unitNumber.toLowerCase() === unitNumber.toLowerCase()),
  );
}

function App() {
  const { identity, isInitializing, clear } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const [appState, setAppState] = useState<
    "loading" | "login" | "register" | "owner-app" | "tenant-portal"
  >("loading");
  const [isAdmin, setIsAdmin] = useState(false);
  const [tenantRecord, setTenantRecord] = useState<Tenant | null>(null);
  const [profileName, setProfileName] = useState("");
  const [page, setPage] = useState<Page>("dashboard");
  const [selectedTenantId, setSelectedTenantId] = useState<bigint | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<bigint | null>(
    null,
  );
  const [refreshing, setRefreshing] = useState(false);
  const [refreshFound, setRefreshFound] = useState(false);

  useEffect(() => {
    if (isInitializing || isFetching) return;
    if (!identity) {
      setAppState("login");
      return;
    }
    if (!actor) return;

    actor
      .getCallerUserProfile()
      .then(async (profile) => {
        if (!profile) {
          setAppState("register");
          return;
        }
        setProfileName(profile.name);
        const admin = await actor.isCallerAdmin();
        setIsAdmin(admin);
        if (admin) {
          setAppState("owner-app");
        } else {
          const tenants = await actor.getAllTenants();
          const matched = matchTenant(tenants, profile.name);
          if (matched) {
            setTenantRecord(matched);
          }
          setAppState("tenant-portal");
        }
      })
      .catch(() => setAppState("register"));
  }, [identity, actor, isInitializing, isFetching]);

  async function handleRefreshCheck() {
    if (!actor) return;
    setRefreshing(true);
    try {
      const tenants = await actor.getAllTenants();
      const matched = matchTenant(tenants, profileName);
      if (matched) {
        setRefreshFound(true);
        setTenantRecord(matched);
        setTimeout(() => setRefreshFound(false), 1500);
      }
    } finally {
      setRefreshing(false);
    }
  }

  function handleRegisterComplete(role: "owner" | "tenant") {
    if (role === "owner") setAppState("owner-app");
    else setAppState("tenant-portal");
  }

  function navigate(p: string, id?: bigint) {
    setPage(p as Page);
    if (p === "tenant-detail" && id !== undefined) setSelectedTenantId(id);
    if (p === "property-detail" && id !== undefined) setSelectedPropertyId(id);
  }

  if (appState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div
            className="p-3 rounded-2xl inline-block"
            style={{ background: "oklch(0.42 0.22 280)" }}
          >
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <p className="text-muted-foreground">Loading Renqo...</p>
        </div>
      </div>
    );
  }

  if (appState === "login") return <Login />;
  if (appState === "register")
    return <Register onComplete={handleRegisterComplete} />;

  if (appState === "tenant-portal") {
    if (!tenantRecord) {
      const { displayName, unitNumber } = parseProfileName(profileName);
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-50 to-blue-50">
          <div className="w-full max-w-sm">
            {/* Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 p-8 text-center space-y-5">
              {/* Icon */}
              <div
                className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "oklch(0.95 0.04 280)" }}
              >
                <Building2
                  className="h-8 w-8"
                  style={{ color: "oklch(0.42 0.22 280)" }}
                />
              </div>

              {/* Title */}
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-gray-900">
                  Registration Complete!
                </h2>
                <p className="text-sm text-gray-500">
                  Waiting for owner to link your account
                </p>
              </div>

              {/* Info pills */}
              <div className="bg-indigo-50 rounded-xl p-4 text-left space-y-3">
                <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">
                  Your Details
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Name</span>
                  <span className="text-sm font-semibold text-gray-800">
                    {displayName || "—"}
                  </span>
                </div>
                {unitNumber && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Unit</span>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "oklch(0.42 0.22 280)" }}
                    >
                      {unitNumber}
                    </span>
                  </div>
                )}
              </div>

              {/* Message */}
              <p className="text-sm text-gray-600 leading-relaxed">
                Once your owner adds you as a tenant using the name{" "}
                <span className="font-semibold text-gray-800">
                  "{displayName}"
                </span>
                {unitNumber && (
                  <>
                    {" "}
                    and unit{" "}
                    <span
                      className="font-semibold"
                      style={{ color: "oklch(0.42 0.22 280)" }}
                    >
                      {unitNumber}
                    </span>
                  </>
                )}
                , you'll get full access here.
              </p>

              {/* Refresh button */}
              {refreshFound ? (
                <div
                  className="flex items-center justify-center gap-2 py-2"
                  data-ocid="pending.success_state"
                >
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium text-green-600">
                    Account linked! Loading your portal…
                  </span>
                </div>
              ) : (
                <Button
                  data-ocid="pending.primary_button"
                  className="w-full text-white"
                  style={{ background: "oklch(0.42 0.22 280)" }}
                  onClick={handleRefreshCheck}
                  disabled={refreshing}
                >
                  {refreshing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Checking…
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh / Check Again
                    </>
                  )}
                </Button>
              )}

              {/* Sign out */}
              <button
                type="button"
                data-ocid="pending.cancel_button"
                onClick={clear}
                className="text-sm text-gray-400 hover:text-gray-600 underline"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      );
    }
    return <TenantPortal tenantRecord={tenantRecord} onLogout={clear} />;
  }

  // Owner App
  const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
    {
      id: "dashboard",
      label: "Home",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    { id: "tenants", label: "Tenants", icon: <Users className="h-5 w-5" /> },
    {
      id: "payments",
      label: "Payments",
      icon: <Receipt className="h-5 w-5" />,
    },
    { id: "bills", label: "Bills", icon: <Zap className="h-5 w-5" /> },
    { id: "reminders", label: "Reminders", icon: <Bell className="h-5 w-5" /> },
    ...(isAdmin
      ? [
          {
            id: "properties" as Page,
            label: "Properties",
            icon: <Home className="h-5 w-5" />,
          },
        ]
      : []),
  ];

  function renderPage() {
    if (page === "tenant-detail" && selectedTenantId !== null) {
      return (
        <TenantDetail
          tenantId={selectedTenantId}
          onBack={() => setPage("tenants")}
          isAdmin={isAdmin}
        />
      );
    }
    if (page === "add-tenant") {
      return (
        <AddTenant
          onBack={() => setPage("tenants")}
          onSaved={(id) => {
            setSelectedTenantId(id);
            setPage("tenant-detail");
          }}
        />
      );
    }
    if (page === "property-detail" && selectedPropertyId !== null) {
      return (
        <PropertyDetail
          propertyId={selectedPropertyId}
          onBack={() => setPage("properties")}
          isAdmin={isAdmin}
        />
      );
    }
    if (page === "add-property") {
      return (
        <AddProperty
          onBack={() => setPage("properties")}
          onSaved={(id) => {
            setSelectedPropertyId(id);
            setPage("property-detail");
          }}
        />
      );
    }
    switch (page) {
      case "dashboard":
        return <Dashboard onNavigate={navigate} />;
      case "tenants":
        return <Tenants onNavigate={navigate} isAdmin={isAdmin} />;
      case "payments":
        return <Payments isAdmin={isAdmin} />;
      case "bills":
        return <Bills isAdmin={isAdmin} />;
      case "reminders":
        return <Reminders isAdmin={isAdmin} />;
      case "properties":
        return <Properties onNavigate={navigate} isAdmin={isAdmin} />;
      default:
        return <Dashboard onNavigate={navigate} />;
    }
  }

  const showNav = ![
    "tenant-detail",
    "add-tenant",
    "property-detail",
    "add-property",
  ].includes(page);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar - desktop only */}
      <header
        className="hidden md:flex items-center justify-between px-6 py-3 bg-card border-b shadow-sm"
        style={{ borderColor: "oklch(0.9 0.015 270)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="p-1.5 rounded-lg"
            style={{ background: "oklch(0.42 0.22 280)" }}
          >
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg text-foreground">Renqo</span>
        </div>
        <nav className="flex items-center gap-1">
          {navItems.map((n) => (
            <button
              type="button"
              key={n.id}
              data-ocid={`nav.${n.id}_link`}
              onClick={() => setPage(n.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                page === n.id
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
            >
              {n.icon} {n.label}
            </button>
          ))}
        </nav>
        <button
          type="button"
          onClick={clear}
          data-ocid="nav.logout_button"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-2xl mx-auto w-full">{renderPage()}</main>

      {/* Bottom tab bar - mobile */}
      {showNav && (
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg flex z-50"
          style={{ borderColor: "oklch(0.9 0.015 270)" }}
          data-ocid="nav.bottom_tab"
        >
          {navItems.map((n) => (
            <button
              type="button"
              key={n.id}
              data-ocid={`nav.mobile_${n.id}_tab`}
              onClick={() => setPage(n.id)}
              className={`flex-1 flex flex-col items-center py-2 gap-0.5 text-xs font-medium transition-colors ${
                page === n.id ? "" : "text-muted-foreground"
              }`}
              style={page === n.id ? { color: "oklch(0.42 0.22 280)" } : {}}
            >
              {n.icon}
              <span>{n.label}</span>
            </button>
          ))}
        </nav>
      )}
      {showNav && <div className="h-16 md:hidden" />}
    </div>
  );
}

export default App;
