import { NextRequest, NextResponse } from "next/server";
import { Hospital } from "@/types/hospital";
import hospitalsData from "@/data/hospitals.json";
import { calculateDistanceKm } from "@/lib/geo";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const hospitals = hospitalsData as Hospital[];
    const hospital = hospitals.find((h) => h.id === id);

    if (!hospital) {
      return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const userLat = parseFloat(searchParams.get("lat") || "22.7196");
    const userLng = parseFloat(searchParams.get("lng") || "75.8577");

    const distance = calculateDistanceKm(userLat, userLng, hospital.lat, hospital.lng);

    return NextResponse.json({
      success: true,
      hospital: {
        ...hospital,
        distance,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
