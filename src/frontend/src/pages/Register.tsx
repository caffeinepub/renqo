import { Building2, CheckCircle2, Shield, User } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useActor } from "../hooks/useActor";

interface Props {
  onComplete: (role: "owner" | "tenant") => void;
}

export default function Register({ onComplete }: Props) {
  const { actor } = useActor();
  const [step, setStep] = useState<"role" | "details" | "success">("role");
  const [role, setRole] = useState<"owner" | "tenant">("owner");
  const [name, setName] = useState("");
  const [unitNumber, setUnitNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!actor || !name.trim()) return;
    setLoading(true);
    setError("");
    try {
      const profileName =
        role === "tenant" && unitNumber.trim()
          ? `${name.trim()}|${unitNumber.trim()}`
          : name.trim();
      await actor.saveCallerUserProfile({ name: profileName });
      if (role === "tenant") {
        setStep("success");
        setTimeout(() => onComplete("tenant"), 2000);
      } else {
        onComplete("owner");
      }
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-3">
            <div className="bg-indigo-600 p-3 rounded-2xl">
              <Building2 className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Renqo</h1>
          <p className="text-gray-500 mt-1">Complete your registration</p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>
              Tell us about yourself to get started.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === "role" && (
              <>
                <p className="text-sm font-medium text-gray-700">
                  I am registering as...
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    data-ocid="register.owner_button"
                    onClick={() => setRole("owner")}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      role === "owner"
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-gray-200 bg-white hover:border-indigo-300"
                    }`}
                  >
                    <Shield
                      className={`h-6 w-6 mb-2 ${role === "owner" ? "text-indigo-600" : "text-gray-400"}`}
                    />
                    <div className="font-semibold">Owner</div>
                    <div className="text-xs text-gray-500">
                      Full management access
                    </div>
                  </button>
                  <button
                    type="button"
                    data-ocid="register.tenant_button"
                    onClick={() => setRole("tenant")}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      role === "tenant"
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-gray-200 bg-white hover:border-indigo-300"
                    }`}
                  >
                    <User
                      className={`h-6 w-6 mb-2 ${role === "tenant" ? "text-indigo-600" : "text-gray-400"}`}
                    />
                    <div className="font-semibold">Tenant</div>
                    <div className="text-xs text-gray-500">
                      View my property
                    </div>
                  </button>
                </div>
                <Button
                  data-ocid="register.next_button"
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => setStep("details")}
                >
                  Next
                </Button>
              </>
            )}

            {step === "details" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="reg-name">Full Name</Label>
                  <Input
                    data-ocid="register.name_input"
                    id="reg-name"
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                {role === "tenant" && (
                  <div className="space-y-2">
                    <Label htmlFor="reg-unit">Unit / Flat Number</Label>
                    <Input
                      data-ocid="register.unit_input"
                      id="reg-unit"
                      placeholder="e.g. A-101"
                      value={unitNumber}
                      onChange={(e) => setUnitNumber(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      Your unit number helps the owner link your account to your
                      tenancy.
                    </p>
                  </div>
                )}
                {error && (
                  <p
                    data-ocid="register.error_state"
                    className="text-sm text-red-500"
                  >
                    {error}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setStep("role")}
                    className="flex-1"
                    data-ocid="register.cancel_button"
                  >
                    Back
                  </Button>
                  <Button
                    data-ocid="register.submit_button"
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                    onClick={handleSubmit}
                    disabled={loading || !name.trim()}
                  >
                    {loading ? "Saving..." : "Complete Registration"}
                  </Button>
                </div>
              </>
            )}

            {step === "success" && (
              <div
                className="text-center py-6 space-y-4"
                data-ocid="register.success_state"
              >
                <div className="flex justify-center">
                  <CheckCircle2 className="h-14 w-14 text-green-500" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-gray-800 text-lg">
                    Registration complete!
                  </p>
                  <p className="text-sm text-gray-500">
                    Your owner will link your unit and you'll get access.
                  </p>
                </div>
                <p className="text-xs text-gray-400">Redirecting…</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
