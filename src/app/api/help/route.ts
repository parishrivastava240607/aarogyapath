import { NextRequest, NextResponse } from "next/server";
import { createHelpRequestSchema } from "@/lib/validations/help";
import { calculateDistanceKm } from "@/lib/geo";
import { HelpRequest } from "@/types/help";

// In-memory demo store for immediate zero-key preview / fallback
const localRequests: HelpRequest[] = [
  {
    id: "req-1",
    requester_id: "demo-user-1",
    requester_name: "Sunita Sharma",
    category: "medicine",
    message: "Urgent: Need insulin injection Lantus (Glargin) for my elderly mother near Palasia.",
    urgency: "high",
    city: "Indore",
    approx_area: "Old Palasia, near Saket (approx 500m)",
    lat: 22.7230,
    lng: 75.8880,
    status: "open",
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    id: "req-2",
    requester_id: "demo-user-2",
    requester_name: "Rahul Verma",
    category: "blood",
    message: "Requirement of 1 unit B+ blood for relative admitted in MY Hospital emergency ward.",
    urgency: "critical",
    city: "Indore",
    approx_area: "Sanyogitaganj, near MY Hospital (approx 500m)",
    lat: 22.7161,
    lng: 75.8752,
    status: "open",
    created_at: new Date(Date.now() - 45 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 45 * 60000).toISOString(),
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat") || "22.7196");
    const lng = parseFloat(searchParams.get("lng") || "75.8577");
    const radius = parseFloat(searchParams.get("radius") || "10");

    const requestsWithDistance = localRequests.map((req) => ({
      ...req,
      distance: calculateDistanceKm(lat, lng, req.lat, req.lng),
    }));

    const filtered = requestsWithDistance.filter((r) => r.distance <= radius);

    return NextResponse.json({
      success: true,
      count: filtered.length,
      requests: filtered,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const result = createHelpRequestSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.format() },
        { status: 400 }
      );
    }

    const { requester_name, category, message, urgency, city, approx_area, lat, lng } =
      result.data;

    const newRequest: HelpRequest = {
      id: `req-${Date.now()}`,
      requester_id: `user-${Date.now()}`,
      requester_name,
      category,
      message,
      urgency,
      city,
      approx_area,
      lat,
      lng,
      status: "open",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    localRequests.unshift(newRequest);

    return NextResponse.json({
      success: true,
      request: newRequest,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const json = await request.json();
    const { requestId, helper_name, helper_id, status } = json;

    const found = localRequests.find((r) => r.id === requestId);
    if (!found) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (helper_name) {
      found.helper_name = helper_name;
      found.helper_id = helper_id || "helper-1";
      found.status = "helper_found";
    }

    if (status) {
      found.status = status;
    }

    found.updated_at = new Date().toISOString();

    return NextResponse.json({ success: true, request: found });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
