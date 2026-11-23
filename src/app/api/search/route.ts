import { NextRequest, NextResponse } from "next/server";
import { searchQueryParamsSchema } from "@/lib/validations/search";
import { calculateDistanceKm } from "@/lib/geo";
import { Hospital, DiseaseSpecialty } from "@/types/hospital";
import hospitalsData from "@/data/hospitals.json";
import diseaseSpecialtyMap from "@/data/disease-specialty-map.json";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryObj = Object.fromEntries(searchParams.entries());

    const result = searchQueryParamsSchema.safeParse(queryObj);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid search parameters", details: result.error.format() },
        { status: 400 }
      );
    }

    const {
      q,
      lat,
      lng,
      radius,
      type,
      emergencyOnly,
      icuOnly,
      ayushmanOnly,
      sortBy,
    } = result.data;

    const normalizedQuery = q.trim().toLowerCase();

    // 1. Identify matched specialty from disease-specialty-map.json
    let matchedSpecialty: string | null = null;
    let matchedDisease: DiseaseSpecialty | null = null;

    if (normalizedQuery) {
      const diseases = diseaseSpecialtyMap as DiseaseSpecialty[];
      for (const d of diseases) {
        if (
          d.id.toLowerCase() === normalizedQuery ||
          d.name_en.toLowerCase().includes(normalizedQuery) ||
          d.name_hi.includes(normalizedQuery) ||
          d.aliases.some((alias) => alias.toLowerCase().includes(normalizedQuery) || normalizedQuery.includes(alias.toLowerCase()))
        ) {
          matchedSpecialty = d.specialty;
          matchedDisease = d;
          break;
        }
      }
    }

    // 2. Filter hospitals
    const hospitals = hospitalsData as Hospital[];

    let filtered = hospitals.map((hosp) => {
      const distance = calculateDistanceKm(lat, lng, hosp.lat, hosp.lng);
      return {
        ...hosp,
        distance,
      };
    });

    // Distance filter
    filtered = filtered.filter((h) => h.distance <= radius);

    // Specialty or text match filter
    if (matchedSpecialty) {
      filtered = filtered.filter((h) =>
        h.specialties.some(
          (s) => s.toLowerCase() === matchedSpecialty?.toLowerCase()
        )
      );
    } else if (normalizedQuery) {
      filtered = filtered.filter(
        (h) =>
          h.name.toLowerCase().includes(normalizedQuery) ||
          h.specialties.some((s) => s.toLowerCase().includes(normalizedQuery)) ||
          h.facilities.some((f) => f.toLowerCase().includes(normalizedQuery))
      );
    }

    // Govt / Private filter
    if (type !== "all") {
      filtered = filtered.filter((h) => h.type === type);
    }

    // Feature filters
    if (emergencyOnly === "true") {
      filtered = filtered.filter((h) => h.emergency_247);
    }
    if (icuOnly === "true") {
      filtered = filtered.filter((h) => h.icu_beds > 0);
    }
    if (ayushmanOnly === "true") {
      filtered = filtered.filter((h) => h.ayushman);
    }

    // Sorting
    filtered.sort((a, b) => {
      if (sortBy === "beds") {
        return b.total_beds - a.total_beds;
      }
      if (sortBy === "rating") {
        return (b.rating || 0) - (a.rating || 0);
      }
      return a.distance - b.distance;
    });

    return NextResponse.json({
      success: true,
      query: q,
      matchedSpecialty,
      matchedDisease,
      totalCount: filtered.length,
      hospitals: filtered,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
