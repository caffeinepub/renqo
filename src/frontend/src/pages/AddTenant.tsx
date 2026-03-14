import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { useActor } from "../hooks/useActor";
import { rupeesToPaise, todayISO } from "../utils/format";

interface Props {
  onBack: () => void;
  onSaved: (id: bigint) => void;
}

export default function AddTenant({ onBack, onSaved }: Props) {
  const { actor } = useActor();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    unitNumber: "",
    moveInDate: todayISO(),
    leavingDate: "",
    brokerName: "",
    brokerContact: "",
    notes: "",
    rentAmount: "",
    dueDay: "1",
    depositAmount: "",
    depositPaid: "true",
    depositDate: todayISO(),
    agreementStart: "",
    agreementEnd: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function save() {
    if (!actor || !form.name || !form.phone || !form.unitNumber) {
      setError("Name, phone and unit number are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const id = await actor.createTenant(
        form.name,
        form.phone,
        form.email,
        form.unitNumber,
        form.moveInDate,
        form.leavingDate,
        form.brokerName,
        form.brokerContact,
        form.notes,
      );
      if (form.rentAmount)
        await actor.addRentPayment(
          id,
          1n,
          BigInt(new Date().getFullYear()),
          0n,
          rupeesToPaise(form.rentAmount),
          BigInt(form.dueDay),
        );
      if (form.depositAmount)
        await actor.addSecurityDeposit(
          id,
          rupeesToPaise(form.depositAmount),
          form.depositPaid === "true",
          form.depositDate,
        );
      if (form.agreementStart && form.agreementEnd)
        await actor.addRentalAgreement(
          id,
          form.agreementStart,
          form.agreementEnd,
        );
      onSaved(id);
    } catch {
      setError("Failed to save tenant. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="pb-20" data-ocid="add_tenant.page">
      <div className="bg-indigo-600 text-white px-4 pt-10 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={onBack}
            data-ocid="add_tenant.back_button"
            className="p-1 rounded-lg hover:bg-indigo-500"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-indigo-200 text-sm">Back</span>
        </div>
        <h1 className="text-2xl font-bold">Add New Tenant</h1>
      </div>

      <div className="px-4 pt-4 space-y-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Tenant Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field label="Full Name *">
              <Input
                data-ocid="add_tenant.name_input"
                value={form.name}
                onChange={set("name")}
                placeholder="Rahul Sharma"
              />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Unit Number *">
                <Input
                  data-ocid="add_tenant.unit_input"
                  value={form.unitNumber}
                  onChange={set("unitNumber")}
                  placeholder="A-101"
                />
              </Field>
              <Field label="Phone *">
                <Input
                  data-ocid="add_tenant.phone_input"
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder="9876543210"
                />
              </Field>
            </div>
            <Field label="Email">
              <Input
                data-ocid="add_tenant.email_input"
                type="email"
                value={form.email}
                onChange={set("email")}
              />
            </Field>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Move In Date">
                <Input
                  type="date"
                  value={form.moveInDate}
                  onChange={set("moveInDate")}
                />
              </Field>
              <Field label="Leaving Date">
                <Input
                  type="date"
                  value={form.leavingDate}
                  onChange={set("leavingDate")}
                />
              </Field>
            </div>
            <Field label="Notes">
              <Textarea
                data-ocid="add_tenant.notes_input"
                value={form.notes}
                onChange={set("notes")}
                rows={2}
              />
            </Field>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Broker Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Field label="Broker Name">
                <Input
                  data-ocid="add_tenant.broker_name_input"
                  value={form.brokerName}
                  onChange={set("brokerName")}
                />
              </Field>
              <Field label="Broker Contact">
                <Input
                  data-ocid="add_tenant.broker_contact_input"
                  value={form.brokerContact}
                  onChange={set("brokerContact")}
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Rent Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Field label="Monthly Rent (₹)">
                <Input
                  data-ocid="add_tenant.rent_amount_input"
                  placeholder="10000"
                  value={form.rentAmount}
                  onChange={set("rentAmount")}
                />
              </Field>
              <Field label="Due Day of Month">
                <Input
                  data-ocid="add_tenant.rent_due_day_input"
                  placeholder="1"
                  value={form.dueDay}
                  onChange={set("dueDay")}
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Security Deposit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Field label="Deposit Amount (₹)">
                <Input
                  data-ocid="add_tenant.deposit_amount_input"
                  placeholder="50000"
                  value={form.depositAmount}
                  onChange={set("depositAmount")}
                />
              </Field>
              <Field label="Paid Status">
                <Select
                  value={form.depositPaid}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, depositPaid: v }))
                  }
                >
                  <SelectTrigger data-ocid="add_tenant.deposit_paid_select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Paid</SelectItem>
                    <SelectItem value="false">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Date Received">
              <Input
                type="date"
                value={form.depositDate}
                onChange={set("depositDate")}
              />
            </Field>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Rental Agreement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Field label="Start Date">
                <Input
                  type="date"
                  value={form.agreementStart}
                  onChange={set("agreementStart")}
                />
              </Field>
              <Field label="End Date">
                <Input
                  type="date"
                  value={form.agreementEnd}
                  onChange={set("agreementEnd")}
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        {error && (
          <p
            className="text-red-500 text-sm"
            data-ocid="add_tenant.error_state"
          >
            {error}
          </p>
        )}

        <Button
          className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base"
          data-ocid="add_tenant.submit_button"
          onClick={save}
          disabled={saving}
        >
          {saving ? "Saving..." : "Add Tenant"}
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
