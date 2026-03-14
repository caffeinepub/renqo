import { ArrowLeft, ImagePlus, Loader2, Plus, X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { useActor } from "../hooks/useActor";
import { useBlobStorage } from "../hooks/useBlobStorage";
import { todayISO } from "../utils/format";

interface Props {
  onBack: () => void;
  onSaved: (id: bigint) => void;
}

export default function AddProperty({ onBack, onSaved }: Props) {
  const { actor } = useActor();
  const { uploadFile } = useBlobStorage();

  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [address, setAddress] = useState("");
  const [description, setDescription] = useState("");
  const [bedrooms, setBedrooms] = useState("1");
  const [bathrooms, setBathrooms] = useState("1");
  const [rentPrice, setRentPrice] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [amenityInput, setAmenityInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function addPhotos(files: FileList | null) {
    if (!files) return;
    const newPhotos = Array.from(files)
      .slice(0, 10 - photos.length)
      .map((f) => ({ file: f, preview: URL.createObjectURL(f) }));
    setPhotos((prev) => [...prev, ...newPhotos]);
  }

  function removePhoto(idx: number) {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[idx].preview);
      return prev.filter((_, i) => i !== idx);
    });
  }

  function addAmenity() {
    const val = amenityInput.trim();
    if (val && !amenities.includes(val)) {
      setAmenities((prev) => [...prev, val]);
      setAmenityInput("");
    }
  }

  async function handleSubmit() {
    if (!actor) return;
    if (!title.trim() || !address.trim() || !rentPrice) {
      setError("Title, address, and rent price are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      setUploading(true);
      const photoUrls = await Promise.all(
        photos.map((p) => uploadFile(p.file)),
      );
      setUploading(false);
      const id = await actor.createPropertyListing(
        title.trim(),
        address.trim(),
        description.trim(),
        BigInt(Number.parseInt(bedrooms) || 1),
        BigInt(Number.parseInt(bathrooms) || 1),
        BigInt(Math.round((Number.parseFloat(rentPrice) || 0) * 100)),
        amenities,
        photoUrls,
        todayISO(),
      );
      onSaved(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save property.");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "oklch(0.98 0.005 270)" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-10 flex items-center gap-3 border-b px-4 py-3"
        style={{
          background: "oklch(1 0 0)",
          borderColor: "oklch(0.9 0.015 270)",
        }}
      >
        <Button
          variant="ghost"
          size="icon"
          data-ocid="add_property.back_button"
          onClick={onBack}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1
          className="text-lg font-bold"
          style={{ color: "oklch(0.13 0.025 270)" }}
        >
          List a Property
        </h1>
      </header>

      <div className="mx-auto max-w-xl space-y-6 p-4 pb-24">
        {/* Photo Upload */}
        <section>
          <Label
            className="mb-2 block font-semibold"
            style={{ color: "oklch(0.25 0.06 280)" }}
          >
            Photos ({photos.length}/10)
          </Label>
          {/* Drop zone */}
          <div
            data-ocid="add_property.photos_upload"
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              addPhotos(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 transition-colors"
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
              className="h-8 w-8"
              style={{ color: "oklch(0.55 0.15 280)" }}
            />
            <p
              className="text-sm font-medium"
              style={{ color: "oklch(0.42 0.22 280)" }}
            >
              Click or drag photos here
            </p>
            <p className="text-xs" style={{ color: "oklch(0.6 0.04 270)" }}>
              Up to 10 photos • JPG, PNG, WEBP
            </p>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => addPhotos(e.target.files)}
            />
          </div>

          {/* Previews */}
          {photos.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {photos.map((p, i) => (
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
                    onClick={(e) => {
                      e.stopPropagation();
                      removePhoto(i);
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
          )}
        </section>

        {/* Title */}
        <div className="space-y-1.5">
          <Label htmlFor="prop-title" style={{ color: "oklch(0.25 0.06 280)" }}>
            Property Title *
          </Label>
          <Input
            id="prop-title"
            data-ocid="add_property.title_input"
            placeholder="e.g. Sunny 2BHK in Koramangala"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Address */}
        <div className="space-y-1.5">
          <Label
            htmlFor="prop-address"
            style={{ color: "oklch(0.25 0.06 280)" }}
          >
            Address *
          </Label>
          <Input
            id="prop-address"
            data-ocid="add_property.address_input"
            placeholder="Full address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="prop-desc" style={{ color: "oklch(0.25 0.06 280)" }}>
            Description
          </Label>
          <Textarea
            id="prop-desc"
            data-ocid="add_property.description_textarea"
            placeholder="Describe the property, nearby landmarks, special features..."
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Bedrooms / Bathrooms / Rent */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="prop-bed" style={{ color: "oklch(0.25 0.06 280)" }}>
              Bedrooms
            </Label>
            <Input
              id="prop-bed"
              type="number"
              min="0"
              data-ocid="add_property.bedrooms_input"
              value={bedrooms}
              onChange={(e) => setBedrooms(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="prop-bath"
              style={{ color: "oklch(0.25 0.06 280)" }}
            >
              Bathrooms
            </Label>
            <Input
              id="prop-bath"
              type="number"
              min="0"
              data-ocid="add_property.bathrooms_input"
              value={bathrooms}
              onChange={(e) => setBathrooms(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label
              htmlFor="prop-rent"
              style={{ color: "oklch(0.25 0.06 280)" }}
            >
              Rent (₹/mo) *
            </Label>
            <Input
              id="prop-rent"
              type="number"
              min="0"
              data-ocid="add_property.rent_input"
              placeholder="15000"
              value={rentPrice}
              onChange={(e) => setRentPrice(e.target.value)}
            />
          </div>
        </div>

        {/* Amenities */}
        <div className="space-y-2">
          <Label style={{ color: "oklch(0.25 0.06 280)" }}>Amenities</Label>
          <div className="flex gap-2">
            <Input
              data-ocid="add_property.amenities_input"
              placeholder="e.g. Parking, Gym, Pool"
              value={amenityInput}
              onChange={(e) => setAmenityInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), addAmenity())
              }
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
                    className="ml-0.5 rounded-full opacity-60 hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm" style={{ color: "oklch(0.577 0.245 27)" }}>
            {error}
          </p>
        )}

        {/* Submit */}
        <Button
          data-ocid="add_property.submit_button"
          className="w-full py-6 text-base font-semibold"
          style={{ background: "oklch(0.42 0.22 280)", color: "oklch(1 0 0)" }}
          onClick={handleSubmit}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {uploading ? "Uploading photos..." : "Saving..."}
            </>
          ) : (
            "List Property"
          )}
        </Button>
      </div>
    </div>
  );
}
