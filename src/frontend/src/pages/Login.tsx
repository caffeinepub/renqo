import { Building2, Shield, User } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function Login() {
  const { login, isLoggingIn } = useInternetIdentity();
  const [selected, setSelected] = useState<"owner" | "tenant" | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo & Title */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="bg-indigo-600 p-3 rounded-2xl">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">RentEase</h1>
          <p className="text-gray-500 mt-1">Smart Property Management</p>
        </div>

        {/* Role Selection */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 text-center">
            I am a...
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              data-ocid="login.owner_button"
              onClick={() => setSelected("owner")}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                selected === "owner"
                  ? "border-indigo-600 bg-indigo-50"
                  : "border-gray-200 bg-white hover:border-indigo-300"
              }`}
            >
              <Shield
                className={`h-6 w-6 mb-2 ${selected === "owner" ? "text-indigo-600" : "text-gray-400"}`}
              />
              <div className="font-semibold text-gray-900">Owner</div>
              <div className="text-xs text-gray-500 mt-0.5">
                Manage properties & tenants
              </div>
            </button>
            <button
              type="button"
              data-ocid="login.tenant_button"
              onClick={() => setSelected("tenant")}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                selected === "tenant"
                  ? "border-indigo-600 bg-indigo-50"
                  : "border-gray-200 bg-white hover:border-indigo-300"
              }`}
            >
              <User
                className={`h-6 w-6 mb-2 ${selected === "tenant" ? "text-indigo-600" : "text-gray-400"}`}
              />
              <div className="font-semibold text-gray-900">Tenant</div>
              <div className="text-xs text-gray-500 mt-0.5">
                View your property details
              </div>
            </button>
          </div>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Sign In / Register</CardTitle>
            <CardDescription>
              {selected === "owner"
                ? "Sign in with Internet Identity to access your owner dashboard."
                : selected === "tenant"
                  ? "Sign in with Internet Identity to view your tenancy details."
                  : "Select your role above, then sign in to continue."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              data-ocid="login.submit_button"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-11"
              onClick={login}
              disabled={isLoggingIn || !selected}
            >
              {isLoggingIn
                ? "Signing in..."
                : "Continue with Internet Identity"}
            </Button>
            <p className="text-xs text-center text-gray-400">
              New users are automatically registered on first sign in. Owners
              get full access; tenants see only their own unit.
            </p>
          </CardContent>
        </Card>

        <p className="text-xs text-center text-gray-400">
          Secured by Internet Computer blockchain identity
        </p>
      </div>
    </div>
  );
}
