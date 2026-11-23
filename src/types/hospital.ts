export type HospitalType = "govt" | "private";

export interface Hospital {
  id: string;
  name: string;
  type: HospitalType;
  address: string;
  city: string;
  lat: number;
  lng: number;
  phone: string;
  total_beds: number;
  icu_beds: number;
  oxygen_beds: number;
  emergency_247: boolean;
  ambulance: boolean;
  blood_bank: boolean;
  pharmacy: boolean;
  ayushman: boolean;
  specialties: string[];
  facilities: string[];
  rating?: number;
  updated_at: string;
}

export interface DiseaseSpecialty {
  id: string;
  name_en: string;
  name_hi: string;
  aliases: string[];
  specialty: string;
  category: string;
}
