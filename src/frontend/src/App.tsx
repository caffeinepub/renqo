import {
  Bell,
  Building2,
  Home,
  LayoutDashboard,
  LogOut,
  Receipt,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { Tenant } from "./backend.d";
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

function App() {
  const { identity, isInitializing, clear } = useInternetIdentity();
  const { actor, isFetching } = useActor();
  const [appState, setAppState] = useState<
    "loading" | "login" | "register" | "owner-app" | "tenant-portal"
  >("loading");
  const [isAdmin, setIsAdmin] = useState(false);
  const [tenantRecord, setTenantRecord] = useState<Tenant | null>(null);
  const [page, setPage] = useState<Page>("dashboard");
  const [selectedTenantId, setSelectedTenantId] = useState<bigint | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<bigint | null>(
    null,
  );

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
        const admin = await actor.isCallerAdmin();
        setIsAdmin(admin);
        if (admin) {
          setAppState("owner-app");
        } else {
          const tenants = await actor.getAllTenants();
          const matched = tenants.find(
            (t) => t.name.toLowerCase() === profile.name.toLowerCase(),
          );
          if (matched) {
            setTenantRecord(matched);
            setAppState("tenant-portal");
          } else {
            setAppState("tenant-portal");
          }
        }
      })
      .catch(() => setAppState("register"));
  }, [identity, actor, isInitializing, isFetching]);

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
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
          <Building2
            className="h-12 w-12 mb-4"
            style={{ color: "oklch(0.7 0.1 280)" }}
          />
          <h2 className="text-xl font-bold text-foreground mb-2">
            Account Pending
          </h2>
          <p className="text-muted-foreground text-center text-sm mb-4">
            Your account has been registered. Please ask your property owner to
            link your unit number to your name in the system.
          </p>
          <button
            type="button"
            onClick={clear}
            className="text-sm underline"
            style={{ color: "oklch(0.42 0.22 280)" }}
          >
            Sign Out
          </button>
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
