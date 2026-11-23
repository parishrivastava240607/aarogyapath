export type UserRole = "citizen" | "doctor" | "nurse" | "student";

export type Gender = "female" | "male" | "other" | "prefer_not_to_say";

export interface Profile {
  id: string;
  name: string;
  gender: Gender;
  city: string;
  lat: number;
  lng: number;
  role: UserRole;
  specialty?: string | null;
  reg_no?: string | null;
  is_available: boolean;
  language: string;
  emergency_contact?: string | null;
  created_at?: string;
  updated_at?: string;
}
