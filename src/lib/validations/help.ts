import { z } from "zod";

export const createHelpRequestSchema = z.object({
  requester_name: z.string().min(2),
  category: z.enum([
    "medicine",
    "blood",
    "oxygen",
    "transport",
    "medical_advice",
    "other",
  ]),
  message: z.string().min(5).max(500),
  urgency: z.enum(["low", "medium", "high", "critical"]),
  city: z.string().default("Indore"),
  approx_area: z.string().default("Indore Central (within 500m)"),
  lat: z.number().default(22.7196),
  lng: z.number().default(75.8577),
});

export const acceptHelpRequestSchema = z.object({
  requestId: z.string().min(1),
  helper_name: z.string().min(2),
  helper_id: z.string().optional(),
});

export const helpMessageSchema = z.object({
  requestId: z.string().min(1),
  sender_name: z.string().min(2),
  body: z.string().min(1).max(500),
});

export const updateHelpStatusSchema = z.object({
  requestId: z.string().min(1),
  status: z.enum(["open", "helper_found", "resolved", "cancelled"]),
});
