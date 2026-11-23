import { z } from "zod";

export const signUpSchema = z.object({
  email: z.string().email({ message: "invalidEmail" }),
  password: z.string().min(6, { message: "passwordMin" }),
  name: z.string().min(2, { message: "nameMin" }),
  gender: z.enum(["female", "male", "other", "prefer_not_to_say"]),
  city: z.string().min(2, { message: "cityMin" }),
  lat: z.number().default(22.7196),
  lng: z.number().default(75.8577),
  role: z.enum(["citizen", "doctor", "nurse", "student"]),
  specialty: z.string().optional(),
  regNo: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email({ message: "invalidEmail" }),
  password: z.string().min(6, { message: "passwordMin" }),
});

export const profileUpdateSchema = z.object({
  name: z.string().min(2, { message: "nameMin" }),
  gender: z.enum(["female", "male", "other", "prefer_not_to_say"]),
  city: z.string().min(2, { message: "cityMin" }),
  role: z.enum(["citizen", "doctor", "nurse", "student"]),
  specialty: z.string().optional().nullable(),
  reg_no: z.string().optional().nullable(),
  is_available: z.boolean(),
  language: z.string(),
  emergency_contact: z.string().optional().nullable(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
