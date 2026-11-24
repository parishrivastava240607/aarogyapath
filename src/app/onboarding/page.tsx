"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Stethoscope,
  HeartHandshake,
  GraduationCap,
  Users,
  MapPin,
  Phone,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  HeartPulse,
  ChevronDown,
  AlertCircle,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type Role = "doctor" | "nurse" | "medical_student" | "none";

interface SubSpecialties {
  doctor: string[];
  nurse: string[];
  medical_student: string[];
}

// ─── Sub-specialty options ────────────────────────────────────────────────────
const SUB_SPECIALTIES: SubSpecialties = {
  doctor: [
    "General Medicine",
    "Cardiology",
    "Neurology",
    "Orthopedics",
    "Pediatrics",
    "Gynecology & Obstetrics",
    "Oncology",
    "Dermatology",
    "Ophthalmology",
    "ENT (Ear, Nose & Throat)",
    "Psychiatry",
    "Radiology",
    "Anesthesiology",
    "Emergency Medicine",
    "Pulmonology",
    "Gastroenterology",
    "Nephrology",
    "Endocrinology",
    "Rheumatology",
    "Urology",
    "Other",
  ],
  nurse: [
    "General Nursing",
    "ICU / Critical Care",
    "Pediatric Nursing",
    "Neonatal Nursing",
    "Oncology Nursing",
    "Operation Theatre",
    "Emergency & Trauma",
    "Psychiatric Nursing",
    "Community Health",
    "Midwifery",
    "Other",
  ],
  medical_student: [
    "MBBS (1st Year)",
    "MBBS (2nd Year)",
    "MBBS (3rd Year)",
    "MBBS (Final Year)",
    "Intern (House Surgeon)",
    "PG Resident – Medicine",
    "PG Resident – Surgery",
    "PG Resident – Pediatrics",
    "PG Resident – OBG",
    "PG Resident – Other",
    "BDS / Dental",
    "BAMS / Ayurveda",
    "BHMS / Homeopathy",
    "BPT / Physiotherapy",
    "B.Sc Nursing",
    "Other",
  ],
};

// ─── Role config ──────────────────────────────────────────────────────────────
const ROLE_OPTIONS: {
  id: Role;
  title: string;
  desc: string;
  icon: React.ElementType;
  bg: string;
  iconColor: string;
}[] = [
  {
    id: "doctor",
    title: "Doctor",
    desc: "Licensed medical practitioner",
    icon: Stethoscope,
    bg: "bg-pastel-pink",
    iconColor: "text-[#B33951]",
  },
  {
    id: "nurse",
    title: "Nurse",
    desc: "Registered / community nurse",
    icon: HeartHandshake,
    bg: "bg-pastel-mint",
    iconColor: "text-[#226F54]",
  },
  {
    id: "medical_student",
    title: "Medical Student",
    desc: "Studying medicine or allied health",
    icon: GraduationCap,
    bg: "bg-pastel-purple",
    iconColor: "text-[#6B46C1]",
  },
  {
    id: "none",
    title: "None of the above",
    desc: "Patient, carer, or general visitor",
    icon: Users,
    bg: "bg-pastel-blue",
    iconColor: "text-[#2B6CB0]",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function InputField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  icon: Icon,
  error,
  maxLength,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon?: React.ElementType;
  error?: string;
  maxLength?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-text-heading mb-1.5">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted pointer-events-none" />
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`w-full rounded-xl border ${
            error ? "border-red-300" : "border-border"
          } bg-surfaceGrey/40 ${
            Icon ? "pl-10" : "pl-4"
          } pr-4 py-3 text-sm text-text focus:border-primary focus:bg-white focus:outline-none transition-colors`}
        />
      </div>
      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs text-sos">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 fields
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");

  // Step 2 fields
  const [role, setRole] = useState<Role | null>(null);
  const [specialty, setSpecialty] = useState("");

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  // Redirect if already registered
  useEffect(() => {
    const existing = localStorage.getItem("aarogyapath_demo_user");
    if (existing) {
      try {
        const u = JSON.parse(existing);
        if (u.name) router.replace("/");
      } catch {
        /* ignore */
      }
    }
  }, [router]);

  // ── Validation ──────────────────────────────────────────────────────────────
  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (name.trim().length < 2) errs.name = "Please enter your full name (at least 2 characters)";
    const ageNum = parseInt(age, 10);
    if (!age || isNaN(ageNum) || ageNum < 1 || ageNum > 120)
      errs.age = "Please enter a valid age between 1 and 120";
    if (location.trim().length < 2) errs.location = "Please enter your city or locality";
    const cleanPhone = phone.replace(/\s+/g, "");
    if (!/^[6-9]\d{9}$/.test(cleanPhone) && !/^\+91[6-9]\d{9}$/.test(cleanPhone))
      errs.phone = "Enter a valid 10-digit Indian mobile number";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!role) errs.role = "Please select a role to continue";
    if (role && role !== "none" && !specialty) errs.specialty = "Please select your specialty";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Navigation ──────────────────────────────────────────────────────────────
  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = () => {
    if (!validateStep2()) return;
    setSubmitted(true);

    const userData = {
      name: name.trim(),
      age: parseInt(age, 10),
      city: location.trim(),
      phone: phone.trim(),
      role: role === "none" ? "citizen" : role,
      specialty: role && role !== "none" ? specialty : null,
      is_available: role !== "none",
      onboarded: true,
    };

    localStorage.setItem("aarogyapath_demo_user", JSON.stringify(userData));

    setTimeout(() => {
      router.push("/");
    }, 1200);
  };

  // ── Derived ─────────────────────────────────────────────────────────────────
  const hasSubSpecialty = role && role !== "none";
  const subOptions = hasSubSpecialty ? SUB_SPECIALTIES[role as keyof SubSpecialties] : [];

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto flex min-h-[calc(100vh-72px)] w-full max-w-[1200px] items-center justify-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-md">
        {/* ── Card ── */}
        <div className="rounded-card border border-border bg-white p-6 shadow-card sm:p-8">

          {/* ── Header ── */}
          <div className="mb-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-pastel-pink text-primary shadow-sm">
              <HeartPulse className="h-7 w-7" />
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-text-heading">
              {step === 1 ? "Welcome to AarogyaPath" : "Tell us your role"}
            </h1>
            <p className="mt-1 text-xs text-muted sm:text-sm">
              {step === 1
                ? "Let's set up your health profile in a few quick steps"
                : "This helps us personalise your experience and community help"}
            </p>
          </div>

          {/* ── Step indicator ── */}
          <div className="mb-6 flex items-center justify-center gap-2">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step
                    ? "w-8 bg-primary"
                    : s < step
                    ? "w-4 bg-primary/40"
                    : "w-4 bg-border"
                }`}
              />
            ))}
            <span className="ml-2 text-[11px] font-semibold text-muted">
              Step {step} of 2
            </span>
          </div>

          {/* ── SUCCESS state ── */}
          {submitted && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-xs font-semibold text-success">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Profile saved! Taking you to the app…</span>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              STEP 1 — Personal details
          ══════════════════════════════════════════════════════ */}
          <div className={`transition-opacity duration-200 ${step===1?'opacity-100':'opacity-0 h-0 overflow-hidden'}`}>
            <div className="space-y-4">
              <InputField
                label="Full Name"
                value={name}
                onChange={setName}
                placeholder="e.g. Dr. Ramesh Verma"
                icon={User}
                error={errors.name}
              />

              <InputField
                label="Age"
                type="number"
                value={age}
                onChange={setAge}
                placeholder="e.g. 28"
                error={errors.age}
                maxLength={3}
              />

              <InputField
                label="City / Location"
                value={location}
                onChange={setLocation}
                placeholder="e.g. Indore, Bhopal"
                icon={MapPin}
                error={errors.location}
              />

              <InputField
                label="Phone Number"
                type="tel"
                value={phone}
                onChange={setPhone}
                placeholder="e.g. 9876543210"
                icon={Phone}
                error={errors.phone}
                maxLength={13}
              />

              <button
                type="button"
                onClick={handleNext}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-card transition-transform hover:opacity-95 active:scale-[0.98]"
              >
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              STEP 2 — Role & Specialty
          ══════════════════════════════════════════════════════ */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Role cards */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-heading mb-2">
                  I am a…
                </label>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {ROLE_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = role === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setRole(opt.id);
                          setSpecialty("");
                          setErrors((e) => ({ ...e, role: "", specialty: "" }));
                        }}
                        className={`flex items-start gap-3 rounded-card border p-3.5 text-left transition-all ${
                          isSelected
                            ? "border-primary bg-pastel-peach/40 shadow-sm"
                            : "border-border bg-white hover:border-primary/40 hover:bg-surfaceGrey/40"
                        }`}
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${opt.bg}`}
                        >
                          <Icon className={`h-5 w-5 ${isSelected ? "text-primary" : opt.iconColor}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-text-heading">{opt.title}</span>
                            {isSelected && (
                              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                            )}
                          </div>
                          <p className="mt-0.5 text-[11px] text-muted line-clamp-1">{opt.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                {errors.role && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-sos">
                    <AlertCircle className="h-3 w-3" />
                    {errors.role}
                  </p>
                )}
              </div>

              {/* Sub-specialty dropdown — only for doctor / nurse / medical_student */}
              {hasSubSpecialty && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-heading mb-1.5">
                    {role === "doctor"
                      ? "Medical Specialization"
                      : role === "nurse"
                      ? "Nursing Specialization"
                      : "Current Stage / Stream"}
                  </label>
                  <div className="relative">
                    <select
                      value={specialty}
                      onChange={(e) => {
                        setSpecialty(e.target.value);
                        setErrors((err) => ({ ...err, specialty: "" }));
                      }}
                      className={`w-full appearance-none rounded-xl border ${
                        errors.specialty ? "border-red-300" : "border-border"
                      } bg-surfaceGrey/40 py-3 pl-4 pr-10 text-sm text-text focus:border-primary focus:bg-white focus:outline-none`}
                    >
                      <option value="" disabled>
                        Select {role === "doctor" ? "specialty" : role === "nurse" ? "specialization" : "stage"}…
                      </option>
                      {subOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  </div>
                  {errors.specialty && (
                    <p className="mt-1 flex items-center gap-1 text-xs text-sos">
                      <AlertCircle className="h-3 w-3" />
                      {errors.specialty}
                    </p>
                  )}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setStep(1); setErrors({}); }}
                  className="flex items-center justify-center gap-1 rounded-xl border border-border bg-white px-4 py-3.5 text-sm font-semibold text-text hover:bg-surfaceGrey transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitted}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-card transition-transform hover:opacity-95 active:scale-[0.98] disabled:opacity-60"
                >
                  <span>{submitted ? "Setting up…" : "Get Started"}</span>
                  <CheckCircle2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer note */}
        <p className="mt-4 text-center text-[11px] text-muted">
          Your details are saved locally on this device only.{" "}
          <span className="text-primary font-semibold">No account required.</span>
        </p>
      </div>
    </div>
  );
}
