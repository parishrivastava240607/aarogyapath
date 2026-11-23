import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateAIHealthGuidance, detectRedFlags } from "@/lib/ai";

const chatRequestSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(1000),
  language: z.enum(["en", "hi"]).default("en"),
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const result = chatRequestSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.format() },
        { status: 400 }
      );
    }

    const { message, language } = result.data;

    // Detect red flags immediately
    const redFlagData = detectRedFlags(message);

    // Generate AI Guidance
    const aiResponse = await generateAIHealthGuidance(message, language);

    return NextResponse.json({
      success: true,
      reply: aiResponse.reply,
      isRedFlag: redFlagData.isRedFlag,
      redFlagReason: redFlagData.reason,
      suggestedSpecialty: aiResponse.suggestedSpecialty,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
