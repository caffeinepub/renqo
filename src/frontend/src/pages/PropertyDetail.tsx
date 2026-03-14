import {
  ArrowLeft,
  Bath,
  Bed,
  Building2,
  CheckCircle2,
  ImagePlus,
  Loader2,
  MapPin,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { PropertyListing } from "../backend.d";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { useActor } from "../hooks/useActor";
import { useBlobStorage } from "../hooks/useBlobStorage";
import { formatCurrency } from "../utils/format";

interface Props {
  propertyId: bigint;
  onBack: () => void;
  isAdmin: boolean;
}

export default function PropertyDetail({ propertyId, onBack, isAdmin }: Props) {
  const { actor } = useActor();
  const { uploadFile } = useBlobStorage();
  const [listing, setListing] = useState<PropertyListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentPhotoIdx, setCurrentPhotoIdx] = useState(0);

  // Edit form state
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [bedrooms, setBedrooms] = useState("1");
  const [bathrooms, setBathrooms] = useState("1");
  const [rentPrice, setRentPrice] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [amenityInput, setAmenityInput] = useState("");
  const [existingPhotos, setExistingPhotos] = useState<string[]>([]);
  const [newPhotos, setNewPhotos] = useState<{ file: File; preview: string }[]>(
    [],
  );
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!actor) return;
    actor
      .getPropertyListing(propertyId)
      .then((p) => {
        setListing(p);
        resetEditForm(p);
      })
      .finally(() => setLoading(false));
  }, [actor, propertyId]);

  function resetEditForm(p: PropertyListing) {
    setTitle(p.title);
    setAddress(p.address);
    setDescription(p.description);
    setBedrooms(String(p.bedrooms));
    setBathrooms(String(p.bathrooms));
    setRentPrice(String(Number(p.rentPrice) / 100));
    setAmenities([...p.amenities]);
    setExistingPhotos([...p.photoUrls]);
    setNewPhotos([]);
  }

  function addNewPhotos(files: FileList | null) {
    if (!files) return;
    const total = existingPhotos.length + newPhotos.length;
    const incoming = Array.from(files)
      .slice(0, 10 - total)
      .map((f) => ({ file: f, preview: URL.createObjectURL(f) }));
    setNewPhotos((prev) => [...prev, ...incoming]);
  }

  function addAmenity() {
    const val = amenityInput.trim();
    if (val && !amenities.includes(val)) {
      setAmenities((prev) => [...prev, val]);
      setAmenityInput("");
    }
  }

  async function handleSave() {
    if (!actor || !listing) return;
    setSaving(true);
    try {
      setUploading(true);
      const uploadedUrls = await Promise.all(
        newPhotos.map((p) => uploadFile(p.file)),
      );
      setUploading(false);
      const allPhotos = [...existingPhotos, ...uploadedUrls];
      await actor.updatePropertyListing(
        listing.id,
        title.trim(),
        address.trim(),
        description.trim(),
        BigInt(Number.parseInt(bedrooms) || 1),
        BigInt(Number.parseInt(bathrooms) || 1),
        BigInt(Math.round((Number.parseFloat(rentPrice) || 0) * 100)),
        amenities,
        listing.isAvailable,
        allPhotos,
      );
      const updated = await actor.getPropertyListing(propertyId);
      setListing(updated);
      resetEditForm(updated);
      setEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
      setUploading(false);
    }
  }

  async function handleToggleAvailability() {
    if (!actor || !listing) return;
    await actor.updatePropertyListing(
      listing.id,
      listing.title,
      listing.address,
      listing.description,
      listing.bedrooms,
      listing.bathrooms,
      listing.rentPrice,
      listing.amenities,
      !listing.isAvailable,
      listing.photoUrls,
    );
    setListing({ ...listing, isAvailable: !listing.isAvailable });
  }

  async function handleDelete() {
    if (!actor || !listing) return;
    setDeleting(true);
    try {
      await actor.deletePropertyListing(listing.id);
      onBack();
    } finally {
      setDeleting(false);
      setShowDelete(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2
          className="h-8 w-8 animate-spin"
          style={{ color: "oklch(0.42 0.22 280)" }}
        />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6">
        <p style={{ color: "oklch(0.5 0.04 270)" }}>Property not found.</p>
        <Button variant="ghost" onClick={onBack} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "oklch(0.98 0.005 270)" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-10 flex items-center justify-between border-b px-4 py-3"
        style={{
          background: "oklch(1 0 0)",
          borderColor: "oklch(0.9 0.015 270)",
        }}
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            data-ocid="property_detail.back_button"
            onClick={() => {
              if (editing) {
                setEditing(false);
                resetEditForm(listing);
              } else {
                onBack();
              }
            }}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1
            className="truncate text-base font-bold"
            style={{ color: "oklch(0.13 0.025 270)" }}
          >
            {editing ? "Edit Property" : listing.title}
          </h1>
        </div>
        {isAdmin && !editing && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              data-ocid="property_detail.edit_button"
              onClick={() => setEditing(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              data-ocid="property_detail.delete_button"
              onClick={() => setShowDelete(true)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </header>

      {!editing ? (
        /* ── View Mode ── */
        <div className="mx-auto max-w-xl pb-24">
          {/* Photo gallery */}
          {listing.photoUrls.length > 0 ? (
            <div className="relative">
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={listing.photoUrls[currentPhotoIdx]}
                  alt={listing.title}
                  className="h-full w-full object-cover"
                />
              </div>
              {listing.photoUrls.length > 1 && (
                <div className="flex gap-1.5 overflow-x-auto p-3">
                  {listing.photoUrls.map((url, i) => (
                    <button
                      type="button"
                      key={url}
                      onClick={() => setCurrentPhotoIdx(i)}
                      className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg transition-all"
                      style={{
                        outline:
                          i === currentPhotoIdx
                            ? "2px solid oklch(0.42 0.22 280)"
                            : "none",
                        outlineOffset: "2px",
                      }}
                    >
                      <img
                        src={url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div
              className="flex aspect-video w-full items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.88 0.06 280), oklch(0.82 0.1 300))",
              }}
            >
              <Building2
                className="h-16 w-16"
                style={{ color: "oklch(0.55 0.18 280 / 0.5)" }}
              />
            </div>
          )}

          <div className="space-y-5 p-4">
            {/* Title + availability */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2
                  className="text-xl font-bold"
                  style={{ color: "oklch(0.13 0.025 270)" }}
                >
                  {listing.title}
                </h2>
                <div
                  className="mt-1 flex items-center gap-1.5 text-sm"
                  style={{ color: "oklch(0.5 0.04 270)" }}
                >
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>{listing.address}</span>
                </div>
              </div>
              <Badge
                className="shrink-0 text-xs font-semibold"
                style={{
                  background: listing.isAvailable
                    ? "oklch(0.52 0.19 145)"
                    : "oklch(0.5 0.04 270)",
                  color: "oklch(1 0 0)",
                  border: "none",
                }}
              >
                {listing.isAvailable ? "Available" : "Rented"}
              </Badge>
            </div>

            {/* Price + bed/bath */}
            <div
              className="flex items-center justify-between rounded-2xl p-4"
              style={{ background: "oklch(0.94 0.02 280)" }}
            >
              <div>
                <p className="text-xs" style={{ color: "oklch(0.5 0.06 280)" }}>
                  Monthly Rent
                </p>
                <p
                  className="text-2xl font-bold"
                  style={{ color: "oklch(0.42 0.22 280)" }}
                >
                  {formatCurrency(listing.rentPrice)}
                </p>
              </div>
              <div
                className="flex gap-4 text-sm"
                style={{ color: "oklch(0.4 0.06 270)" }}
              >
                <span className="flex items-center gap-1.5">
                  <Bed className="h-4 w-4" />
                  {String(listing.bedrooms)} Bed
                </span>
                <span className="flex items-center gap-1.5">
                  <Bath className="h-4 w-4" />
                  {String(listing.bathrooms)} Bath
                </span>
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div>
                <h3
                  className="mb-1.5 font-semibold"
                  style={{ color: "oklch(0.25 0.06 280)" }}
                >
                  Description
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "oklch(0.4 0.04 270)" }}
                >
                  {listing.description}
                </p>
              </div>
            )}

            {/* Amenities */}
            {listing.amenities.length > 0 && (
              <div>
                <h3
                  className="mb-2 font-semibold"
                  style={{ color: "oklch(0.25 0.06 280)" }}
                >
                  Amenities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {listing.amenities.map((a) => (
                    <span
                      key={a}
                      className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                      style={{
                        background: "oklch(0.92 0.04 280)",
                        color: "oklch(0.3 0.12 280)",
                      }}
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Admin actions */}
            {isAdmin && (
              <Button
                data-ocid="property_detail.availability_toggle"
                className="w-full"
                variant="outline"
                onClick={handleToggleAvailability}
                style={{
                  borderColor: listing.isAvailable
                    ? "oklch(0.5 0.04 270)"
                    : "oklch(0.52 0.19 145)",
                  color: listing.isAvailable
                    ? "oklch(0.5 0.04 270)"
                    : "oklch(0.52 0.19 145)",
                }}
              >
                Mark as {listing.isAvailable ? "Rented" : "Available"}
              </Button>
            )}
          </div>
        </div>
      ) : (
        /* ── Edit Mode ── */
        <div className="mx-auto max-w-xl space-y-5 p-4 pb-24">
          {/* Photos */}
          <section>
            <Label
              className="mb-2 block font-semibold"
              style={{ color: "oklch(0.25 0.06 280)" }}
            >
              Photos ({existingPhotos.length + newPhotos.length}/10)
            </Label>

            <button
              type="button"
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                addNewPhotos(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-6 transition-colors"
              style={{
                borderColor: dragOver
                  ? "oklch(0.42 0.22 280)"
                  : "oklch(0.82 0.04 280)",
                background: dragOver
                  ? "oklch(0.94 0.03 280)"
                  : "oklch(0.97 0.01 280)",
              }}
            >
              <ImagePlus
                className="h-6 w-6"
                style={{ color: "oklch(0.55 0.15 280)" }}
              />
              <p className="text-sm" style={{ color: "oklch(0.42 0.22 280)" }}>
                Add more photos
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => addNewPhotos(e.target.files)}
              />
            </button>

            <div className="mt-3 grid grid-cols-4 gap-2">
              {existingPhotos.map((url, i) => (
                <div
                  key={url}
                  className="group relative aspect-square overflow-hidden rounded-xl"
                >
                  <img
                    src={url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setExistingPhotos((prev) =>
                        prev.filter((_, j) => j !== i),
                      )
                    }
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                    style={{
                      background: "oklch(0 0 0 / 0.6)",
                      color: "oklch(1 0 0)",
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {newPhotos.map((p, i) => (
                <div
                  key={p.preview}
                  className="group relative aspect-square overflow-hidden rounded-xl"
                >
                  <img
                    src={p.preview}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      URL.revokeObjectURL(p.preview);
                      setNewPhotos((prev) => prev.filter((_, j) => j !== i));
                    }}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                    style={{
                      background: "oklch(0 0 0 / 0.6)",
                      color: "oklch(1 0 0)",
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <div className="space-y-1.5">
            <Label style={{ color: "oklch(0.25 0.06 280)" }}>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label style={{ color: "oklch(0.25 0.06 280)" }}>Address</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label style={{ color: "oklch(0.25 0.06 280)" }}>Description</Label>
            <Textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label style={{ color: "oklch(0.25 0.06 280)" }}>Bedrooms</Label>
              <Input
                type="number"
                min="0"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label style={{ color: "oklch(0.25 0.06 280)" }}>Bathrooms</Label>
              <Input
                type="number"
                min="0"
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label style={{ color: "oklch(0.25 0.06 280)" }}>Rent (₹)</Label>
              <Input
                type="number"
                min="0"
                value={rentPrice}
                onChange={(e) => setRentPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label style={{ color: "oklch(0.25 0.06 280)" }}>Amenities</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add amenity..."
                value={amenityInput}
                onChange={(e) => setAmenityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addAmenity();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={addAmenity}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {amenities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {amenities.map((a) => (
                  <span
                    key={a}
                    className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
                    style={{
                      background: "oklch(0.92 0.04 280)",
                      color: "oklch(0.3 0.12 280)",
                    }}
                  >
                    {a}
                    <button
                      type="button"
                      onClick={() =>
                        setAmenities((prev) => prev.filter((x) => x !== a))
                      }
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <Button
            data-ocid="property_detail.save_button"
            className="w-full py-6 text-base font-semibold"
            style={{
              background: "oklch(0.42 0.22 280)",
              color: "oklch(1 0 0)",
            }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {uploading ? "Uploading..." : "Saving..."}
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent data-ocid="property_detail.dialog">
          <DialogHeader>
            <DialogTitle>Delete Property?</DialogTitle>
            <DialogDescription>
              This will permanently remove <strong>{listing.title}</strong> from
              your listings. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              data-ocid="property_detail.cancel_button"
              onClick={() => setShowDelete(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="property_detail.confirm_button"
              onClick={handleDelete}
              disabled={deleting}
              style={{
                background: "oklch(0.577 0.245 27)",
                color: "oklch(1 0 0)",
              }}
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
