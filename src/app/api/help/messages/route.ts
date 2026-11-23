import { NextRequest, NextResponse } from "next/server";
import { helpMessageSchema } from "@/lib/validations/help";
import { HelpMessage } from "@/types/help";

const messagesStore: HelpMessage[] = [
  {
    id: "m-1",
    request_id: "req-1",
    sender_id: "helper-1",
    sender_name: "Dr. Neha",
    body: "I am nearby at Palasia. I have spare Lantus cartridges. Can I assist?",
    created_at: new Date(Date.now() - 5 * 60000).toISOString(),
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const requestId = searchParams.get("requestId");

  if (!requestId) {
    return NextResponse.json({ error: "requestId required" }, { status: 400 });
  }

  const thread = messagesStore.filter((m) => m.request_id === requestId);
  return NextResponse.json({ success: true, messages: thread });
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const result = helpMessageSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const { requestId, sender_name, body } = result.data;
    const newMsg: HelpMessage = {
      id: `msg-${Date.now()}`,
      request_id: requestId,
      sender_id: `user-${Date.now()}`,
      sender_name,
      body,
      created_at: new Date().toISOString(),
    };

    messagesStore.push(newMsg);
    return NextResponse.json({ success: true, message: newMsg });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
