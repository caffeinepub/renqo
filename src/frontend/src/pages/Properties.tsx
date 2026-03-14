import { Bath, Bed, Building2, MapPin, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import type { PropertyListing } from "../backend.d";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { useActor } from "../hooks/useActor";
import { formatCurrency } from "../utils/format";

interface Props {
  onNavigate: (page: string, id?: bigint) => void;
  isAdmin: boolean;
}

export default function Properties({ onNavigate, isAdmin }: Props) {
  const { actor } = useActor();
  const [listings, setListings] = useState<PropertyListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!actor) return;
    (isAdmin ? actor.getMyPropertyListings() : actor.getAllPropertyListings())
      .then(setListings)
      .finally(() => setLoading(false));
  }, [actor, isAdmin]);

  return (
    <div className="p-4 space-y-5" data-ocid="properties.page">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "oklch(0.13 0.025 270)" }}
          >
            My Properties
          </h1>
          <p className="text-sm" style={{ color: "oklch(0.5 0.04 270)" }}>
            {listings.length} listing{listings.length !== 1 ? "s" : ""}
          </p>
        </div>
        {isAdmin && (
          <Button
            data-ocid="properties.add_button"
            onClick={() => onNavigate("add-property")}
            className="gap-2"
            style={{
              background: "oklch(0.42 0.22 280)",
              color: "oklch(1 0 0)",
            }}
          >
            <Plus className="h-4 w-4" /> Add Property
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      ) : listings.length === 0 ? (
        <div
          data-ocid="properties.empty_state"
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{
              background: "oklch(0.92 0.04 280)",
              color: "oklch(0.42 0.22 280)",
            }}
          >
            <Building2 className="h-8 w-8" />
          </div>
          <h3
            className="mb-1 text-lg font-semibold"
            style={{ color: "oklch(0.13 0.025 270)" }}
          >
            No properties listed yet
          </h3>
          <p className="mb-5 text-sm" style={{ color: "oklch(0.5 0.04 270)" }}>
            Add your first property to start attracting tenants.
          </p>
          {isAdmin && (
            <Button
              data-ocid="properties.add_button"
              onClick={() => onNavigate("add-property")}
              style={{
                background: "oklch(0.42 0.22 280)",
                color: "oklch(1 0 0)",
              }}
            >
              <Plus className="h-4 w-4 mr-2" /> List a Property
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2" data-ocid="properties.list">
          {listings.map((listing, i) => (
            <button
              type="button"
              key={String(listing.id)}
              data-ocid={`properties.item.${i + 1}`}
              className="group text-left"
              onClick={() => onNavigate("property-detail", listing.id)}
            >
              <Card
                className="overflow-hidden border-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                style={{
                  boxShadow: "0 2px 16px oklch(0.42 0.22 280 / 0.08)",
                  border: "1px solid oklch(0.9 0.015 270)",
                }}
              >
                {/* Photo area */}
                <div className="relative h-48 overflow-hidden">
                  {listing.photoUrls.length > 0 ? (
                    <img
                      src={listing.photoUrls[0]}
                      alt={listing.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center"
                      style={{
                        background:
                          "linear-gradient(135deg, oklch(0.88 0.06 280), oklch(0.82 0.1 300))",
                      }}
                    >
                      <Building2
                        className="h-12 w-12"
                        style={{ color: "oklch(0.55 0.18 280 / 0.6)" }}
                      />
                    </div>
                  )}
                  <div className="absolute right-3 top-3">
                    <Badge
                      className="text-xs font-semibold"
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
                  {listing.photoUrls.length > 1 && (
                    <div
                      className="absolute bottom-3 right-3 rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{
                        background: "oklch(0 0 0 / 0.5)",
                        color: "oklch(1 0 0)",
                      }}
                    >
                      +{listing.photoUrls.length - 1} photos
                    </div>
                  )}
                </div>

                <CardContent className="p-4">
                  <h3
                    className="mb-1 truncate text-base font-bold"
                    style={{ color: "oklch(0.13 0.025 270)" }}
                  >
                    {listing.title}
                  </h3>
                  <div
                    className="mb-3 flex items-center gap-1.5 text-xs"
                    style={{ color: "oklch(0.5 0.04 270)" }}
                  >
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{listing.address}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div
                      className="flex items-center gap-3 text-xs"
                      style={{ color: "oklch(0.45 0.06 270)" }}
                    >
                      <span className="flex items-center gap-1">
                        <Bed className="h-3.5 w-3.5" />
                        {String(listing.bedrooms)} bed
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath className="h-3.5 w-3.5" />
                        {String(listing.bathrooms)} bath
                      </span>
                    </div>
                    <span
                      className="text-base font-bold"
                      style={{ color: "oklch(0.42 0.22 280)" }}
                    >
                      {formatCurrency(listing.rentPrice)}
                      <span
                        className="text-xs font-normal"
                        style={{ color: "oklch(0.6 0.04 270)" }}
                      >
                        /mo
                      </span>
                    </span>
                  </div>
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
