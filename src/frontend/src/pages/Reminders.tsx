import { Bell, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { Reminder, Tenant } from "../backend.d";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Skeleton } from "../components/ui/skeleton";
import { Textarea } from "../components/ui/textarea";
import { useActor } from "../hooks/useActor";
import { formatDate, todayISO } from "../utils/format";

interface Props {
  isAdmin: boolean;
}

export default function Reminders({ isAdmin }: Props) {
  const { actor } = useActor();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [remindersMap, setRemindersMap] = useState<Map<string, Reminder[]>>(
    new Map(),
  );
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    tenantId: "",
    billType: "rent",
    message: "",
  });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!actor) return;
    const ts = await actor.getAllTenants();
    setTenants(ts);
    const map = new Map<string, Reminder[]>();
    await Promise.all(
      ts.map((t) =>
        actor.getReminders(t.id).then((rs) => map.set(String(t.id), rs)),
      ),
    );
    setRemindersMap(map);
  }, [actor]);

  useEffect(() => {
    if (actor) load().finally(() => setLoading(false));
  }, [actor, load]);

  const allReminders: Array<{ tenant: Tenant; reminder: Reminder }> = [];
  for (const t of tenants) {
    const rs = remindersMap.get(String(t.id)) || [];
    for (const r of rs) {
      allReminders.push({ tenant: t, reminder: r });
    }
  }
  allReminders.sort((a, b) =>
    b.reminder.createdDate.localeCompare(a.reminder.createdDate),
  );

  async function addReminder() {
    if (!actor || !form.tenantId || !form.message) return;
    setSaving(true);
    await actor.addReminder(
      BigInt(form.tenantId),
      form.billType,
      form.message,
      todayISO(),
      "sent",
    );
    await load();
    setSaving(false);
    setAddOpen(false);
    setForm({ tenantId: "", billType: "rent", message: "" });
  }

  return (
    <div className="p-4 space-y-4" data-ocid="reminders.page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reminders</h1>
          <p className="text-sm text-gray-500">{allReminders.length} total</p>
        </div>
        {isAdmin && (
          <Button
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700"
            data-ocid="reminders.add_button"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" /> Log Reminder
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
            <Skeleton // biome-ignore lint/suspicious/noArrayIndexKey: stable list
              key={i}
              className="h-16 w-full"
            />
          ))}
        </div>
      ) : allReminders.length === 0 ? (
        <div
          className="text-center py-10 text-gray-400"
          data-ocid="reminders.empty_state"
        >
          <Bell className="h-10 w-10 mx-auto mb-2 text-gray-300" />
          <p>No reminders logged yet.</p>
        </div>
      ) : (
        <div className="space-y-2" data-ocid="reminders.list">
          {allReminders.map(({ tenant: t, reminder: r }, i) => (
            <Card
              key={`${t.id}-${r.message}`}
              className="border-0 shadow-sm"
              data-ocid={`reminders.item.${i + 1}`}
            >
              <CardContent className="py-3 px-4">
                <div className="flex items-start gap-3">
                  <div className="bg-orange-100 p-2 rounded-lg mt-0.5">
                    <Bell className="h-4 w-4 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{t.name}</span>
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
                        {t.unitNumber}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded capitalize">
                        {r.billType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-0.5">{r.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(r.createdDate)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent data-ocid="reminders.add_dialog">
          <DialogHeader>
            <DialogTitle>Log a Reminder</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-gray-500">
            Record that you reminded a tenant about a pending payment. This is
            an in-app log.
          </p>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Tenant</Label>
              <Select
                value={form.tenantId}
                onValueChange={(v) => setForm((f) => ({ ...f, tenantId: v }))}
              >
                <SelectTrigger data-ocid="reminders.tenant_select">
                  <SelectValue placeholder="Select tenant" />
                </SelectTrigger>
                <SelectContent>
                  {tenants.map((t) => (
                    <SelectItem key={String(t.id)} value={String(t.id)}>
                      {t.name} ({t.unitNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">About</Label>
              <Select
                value={form.billType}
                onValueChange={(v) => setForm((f) => ({ ...f, billType: v }))}
              >
                <SelectTrigger data-ocid="reminders.type_select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "rent",
                    "electricity",
                    "water",
                    "maintenance",
                    "gas",
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
              <Label className="text-xs">Message / Note</Label>
              <Textarea
                data-ocid="reminders.message_input"
                rows={3}
                value={form.message}
                onChange={(e) =>
                  setForm((f) => ({ ...f, message: e.target.value }))
                }
                placeholder="e.g. Called tenant on phone, requested payment by 5th"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              data-ocid="reminders.add_cancel_button"
              onClick={() => setAddOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-indigo-600"
              data-ocid="reminders.add_save_button"
              onClick={addReminder}
              disabled={saving || !form.tenantId || !form.message}
            >
              {saving ? "Saving..." : "Log Reminder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
