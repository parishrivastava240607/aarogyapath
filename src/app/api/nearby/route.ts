import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import hospitalsData from "@/data/hospitals.json";
import pharmaciesData from "@/data/pharmacies.json";
import { calculateDistanceKm } from "@/lib/geo";

const nearbyQuerySchema = z.object({
  type: z.enum(["hospital", "pharmacy"]).default("hospital"),
  lat: z.coerce.number().default(22.7196),
  lng: z.coerce.number().default(75.8577),
  radius: z.coerce.number().default(10), // in km
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const parseResult = nearbyQuerySchema.safeParse(
      Object.fromEntries(searchParams.entries())
    );

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid parameters", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { type, lat, lng, radius } = parseResult.data;

    if (type === "pharmacy") {
      const pharmacies = pharmaciesData.map((p) => {
        const distance = calculateDistanceKm(lat, lng, p.lat, p.lng);
        return {
          ...p,
          distance,
        };
      });

      const filtered = pharmacies
        .filter((p) => p.distance <= radius)
        .sort((a, b) => a.distance - b.distance);

      return NextResponse.json({
        success: true,
        type: "pharmacy",
        count: filtered.length,
        items: filtered,
      });
    }

    // Default: Hospitals
    const hospitals = hospitalsData.map((h) => {
      const distance = calculateDistanceKm(lat, lng, h.lat, h.lng);
      return {
        ...h,
        distance,
      };
    });

    const filtered = hospitals
      .filter((h) => h.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    return NextResponse.json({
      success: true,
      type: "hospital",
      count: filtered.length,
      items: filtered,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
