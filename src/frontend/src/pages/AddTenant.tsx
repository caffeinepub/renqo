import { ChevronLeft, FileText, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
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
import { useBlobStorage } from "../hooks/useBlobStorage";
import { rupeesToPaise, todayISO } from "../utils/format";

interface Props {
  onBack: () => void;
  onSaved: (id: bigint) => void;
}

export default function AddTenant({ onBack, onSaved }: Props) {
  const { actor } = useActor();
  const { uploadFile } = useBlobStorage();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    unitNumber: "",
    moveInDate: todayISO(),
    leavingDate: "",
    brokerName: "",
    brokerContact: "",
    permanentAddress: "",
    notes: "",
    rentAmount: "",
    dueDay: "1",
    depositAmount: "",
    depositPaid: "true",
    depositDate: todayISO(),
    agreementStart: "",
    agreementEnd: "",
    electricityAmount: "",
    electricityPeriod: "",
    electricityDueDate: "",
  });
  const [uploadedDocs, setUploadedDocs] = useState<
    { name: string; blobId: string }[]
  >([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadingDoc(true);
    try {
      for (const file of Array.from(files)) {
        const blobId = await uploadFile(file);
        setUploadedDocs((prev) => [...prev, { name: file.name, blobId }]);
      }
    } catch {
      setError("Failed to upload one or more documents.");
    } finally {
      setUploadingDoc(false);
    }
  }

  function removeDoc(index: number) {
    setUploadedDocs((prev) => prev.filter((_, i) => i !== index));
  }

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
        form.permanentAddress,
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
      if (form.electricityAmount) {
        const period =
          form.electricityPeriod ||
          new Date().toLocaleString("default", {
            month: "long",
            year: "numeric",
          });
        const dueDate = form.electricityDueDate || todayISO();
        await actor.addBill(
          id,
          "Electricity",
          period,
          rupeesToPaise(form.electricityAmount),
          dueDate,
          "",
        );
      }
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
            type="button"
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
        {/* Tenant Details */}
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
            <Field label="Permanent Address">
              <Textarea
                data-ocid="add_tenant.permanent_address_input"
                value={form.permanentAddress}
                onChange={set("permanentAddress")}
                placeholder="123, Main Street, City, State - 400001"
                rows={2}
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
              <Field label="Rent Due Day">
                <Input
                  data-ocid="add_tenant.rent_due_day_input"
                  placeholder="1"
                  value={form.dueDay}
                  onChange={set("dueDay")}
                  type="number"
                  min="1"
                  max="31"
                />
              </Field>
            </div>
            <Field label="Leaving Date">
              <Input
                type="date"
                value={form.leavingDate}
                onChange={set("leavingDate")}
              />
            </Field>
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

        {/* Broker Info */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Broker Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-gray-500">
              Fill only if tenant came through a broker.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Broker Name">
                <Input
                  data-ocid="add_tenant.broker_name_input"
                  value={form.brokerName}
                  onChange={set("brokerName")}
                  placeholder="Suresh Kumar"
                />
              </Field>
              <Field label="Broker Contact">
                <Input
                  data-ocid="add_tenant.broker_contact_input"
                  value={form.brokerContact}
                  onChange={set("brokerContact")}
                  placeholder="9876500000"
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        {/* Rent Setup */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Rent Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Field label="Monthly Rent (₹)">
              <Input
                data-ocid="add_tenant.rent_amount_input"
                placeholder="10000"
                value={form.rentAmount}
                onChange={set("rentAmount")}
              />
            </Field>
          </CardContent>
        </Card>

        {/* Electricity Bill */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Electricity Bill</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-gray-500">
              Add initial electricity bill amount (optional).
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Bill Amount (₹)">
                <Input
                  data-ocid="add_tenant.electricity_amount_input"
                  placeholder="1500"
                  value={form.electricityAmount}
                  onChange={set("electricityAmount")}
                  type="number"
                />
              </Field>
              <Field label="Billing Period">
                <Input
                  data-ocid="add_tenant.electricity_period_input"
                  placeholder="March 2026"
                  value={form.electricityPeriod}
                  onChange={set("electricityPeriod")}
                />
              </Field>
            </div>
            <Field label="Due Date">
              <Input
                type="date"
                data-ocid="add_tenant.electricity_due_date_input"
                value={form.electricityDueDate}
                onChange={set("electricityDueDate")}
              />
            </Field>
          </CardContent>
        </Card>

        {/* Security Deposit */}
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

        {/* Rental Agreement Dates */}
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

        {/* Documents Upload */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-gray-500">
              Upload agreement, ID proof, or other tenant documents.
            </p>

            {/* Drop Zone */}
            <button
              type="button"
              data-ocid="add_tenant.dropzone"
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
                dragOver
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
              }`}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  fileInputRef.current?.click();
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFiles(e.dataTransfer.files);
              }}
            >
              <Upload className="h-8 w-8 text-indigo-400" />
              <p className="text-sm text-gray-600 font-medium">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-400">
                PDF, JPG, PNG up to 10MB each
              </p>
              {uploadingDoc && (
                <p className="text-xs text-indigo-500 animate-pulse">
                  Uploading...
                </p>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              data-ocid="add_tenant.upload_button"
              onChange={(e) => handleFiles(e.target.files)}
            />

            {/* Uploaded Files List */}
            {uploadedDocs.length > 0 && (
              <div className="space-y-2">
                {uploadedDocs.map((doc, i) => (
                  <div
                    key={doc.blobId || doc.name}
                    className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2"
                    data-ocid={`add_tenant.document.item.${i + 1}`}
                  >
                    <FileText className="h-4 w-4 text-indigo-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 flex-1 truncate">
                      {doc.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeDoc(i)}
                      className="text-gray-400 hover:text-red-500 flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
