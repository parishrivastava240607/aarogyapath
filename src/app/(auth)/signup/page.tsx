"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  User,
  Shield,
  Stethoscope,
  GraduationCap,
  HeartHandshake,
  MapPin,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { UserRole, Gender } from "@/types";

export default function SignupPage() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [gender, setGender] = useState<Gender>("prefer_not_to_say");
  const [city, setCity] = useState("Indore");
  const [role, setRole] = useState<UserRole>("citizen");
  const [specialty, setSpecialty] = useState("");
  const [regNo, setRegNo] = useState("");
  const [locating, setLocating] = useState(false);
  const [locCoordinates, setLocCoordinates] = useState({ lat: 22.7196, lng: 75.8577 });

  const isHelperRole = role !== "citizen";

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setCity("Indore");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocCoordinates({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocating(false);
      },
      () => {
        // Fallback gracefully without blocking
        setLocating(false);
      },
      { timeout: 8000 }
    );
  };

  const validateStep1 = () => {
    setErrorMsg(null);
    if (!email || !email.includes("@")) {
      setErrorMsg(t("errors.invalidEmail"));
      return false;
    }
    if (password.length < 6) {
      setErrorMsg(t("errors.passwordMin"));
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    setErrorMsg(null);
    if (name.trim().length < 2) {
      setErrorMsg(t("errors.nameMin"));
      return false;
    }
    if (!city.trim()) {
      setErrorMsg(t("errors.cityMin"));
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const payload = {
        email,
        password,
        name,
        gender,
        city,
        lat: locCoordinates.lat,
        lng: locCoordinates.lng,
        role,
        specialty: isHelperRole ? specialty : undefined,
        regNo: isHelperRole ? regNo : undefined,
      };

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || t("errors.general"));
      }

      // Store in local storage for demo continuity
      localStorage.setItem("aarogyapath_demo_user", JSON.stringify({
        name,
        email,
        role,
        city,
        gender,
        specialty,
        is_available: isHelperRole,
      }));

      setSuccessMsg(true);
      setTimeout(() => {
        router.push("/profile");
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("errors.general");
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const roleOptions: { id: UserRole; title: string; desc: string; icon: React.ElementType; bg: string }[] = [
    {
      id: "citizen",
      title: t("roleCitizen"),
      desc: t("roleCitizenDesc"),
      icon: User,
      bg: "bg-pastel-blue",
    },
    {
      id: "doctor",
      title: t("roleDoctor"),
      desc: t("roleDoctorDesc"),
      icon: Stethoscope,
      bg: "bg-pastel-pink",
    },
    {
      id: "nurse",
      title: t("roleNurse"),
      desc: t("roleNurseDesc"),
      icon: HeartHandshake,
      bg: "bg-pastel-mint",
    },
    {
      id: "student",
      title: t("roleStudent"),
      desc: t("roleStudentDesc"),
      icon: GraduationCap,
      bg: "bg-pastel-purple",
    },
  ];

  return (
    <div className="mx-auto flex min-h-[calc(100vh-140px)] w-full max-w-[1200px] items-center justify-center px-4 py-6 sm:px-6">
      <div className="w-full max-w-lg rounded-card border border-border bg-white p-6 shadow-card sm:p-8">
        {/* Header */}
        <div className="mb-6 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-pastel-peach px-3 py-1 text-xs font-bold text-primary">
            <Shield className="h-3.5 w-3.5" />
            <span>
              {t("step")} {step} {t("of")} 3
            </span>
          </span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-text-heading">
            {t("createAccount")}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted">
            {step === 1 && t("step1Title")}
            {step === 2 && t("step2Title")}
            {step === 3 && t("step3Title")}
          </p>
        </div>

        {/* Progress Bar (4px scale) */}
        <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-surfaceGrey">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Error / Success Feedback */}
        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-sos">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-xs font-medium text-success">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{t("signupSuccess")}</span>
          </div>
        )}

        <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
          {/* STEP 1: Email & Password */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-heading">
                  {t("email")}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("emailPlaceholder")}
                  className="mt-1.5 w-full rounded-xl border border-border bg-surfaceGrey/40 px-4 py-3 text-sm text-text focus:border-primary focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-heading">
                  {t("password")}
                </label>
                <div className="relative mt-1.5">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("passwordPlaceholder")}
                    className="w-full rounded-xl border border-border bg-surfaceGrey/40 px-4 py-3 pr-11 text-sm text-text focus:border-primary focus:bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-text"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-card transition-transform active:scale-98 hover:opacity-95"
              >
                <span>{t("next")}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Name, Gender & City (with location auto-detect) */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-heading">
                  {t("fullName")}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("namePlaceholder")}
                  className="mt-1.5 w-full rounded-xl border border-border bg-surfaceGrey/40 px-4 py-3 text-sm text-text focus:border-primary focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-heading">
                  {t("gender")}
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender)}
                  className="mt-1.5 w-full rounded-xl border border-border bg-surfaceGrey/40 px-4 py-3 text-sm text-text focus:border-primary focus:bg-white focus:outline-none"
                >
                  <option value="prefer_not_to_say">{t("genderPreferNot")}</option>
                  <option value="female">{t("genderFemale")}</option>
                  <option value="male">{t("genderMale")}</option>
                  <option value="other">{t("genderOther")}</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-heading">
                    {t("city")}
                  </label>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={locating}
                    className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline disabled:opacity-50"
                  >
                    <MapPin className="h-3 w-3" />
                    <span>{locating ? tCommon("loading") : t("detectLocation")}</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={t("cityPlaceholder")}
                  className="mt-1.5 w-full rounded-xl border border-border bg-surfaceGrey/40 px-4 py-3 text-sm text-text focus:border-primary focus:bg-white focus:outline-none"
                />
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center justify-center gap-1 rounded-xl border border-border bg-white px-4 py-3.5 text-sm font-semibold text-text hover:bg-surfaceGrey"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>{t("back")}</span>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-card transition-transform active:scale-98 hover:opacity-95"
                >
                  <span>{t("next")}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Role Selection Chips (Citizen, Doctor, Nurse, Student) */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-heading">
                  {t("role")}
                </label>
                <p className="mt-0.5 text-xs text-muted">{t("roleSubtitle")}</p>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {roleOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = role === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setRole(opt.id)}
                      className={`flex items-start gap-3 rounded-card border p-3.5 text-left transition-all ${
                        isSelected
                          ? "border-primary bg-pastel-peach/40 shadow-sm"
                          : "border-border bg-white hover:border-primary/40 hover:bg-surfaceGrey/40"
                      }`}
                    >
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${opt.bg} ${
                          isSelected ? "text-primary" : "text-text"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-text-heading">
                            {opt.title}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                          )}
                        </div>
                        <p className="mt-0.5 text-[11px] text-muted line-clamp-1">
                          {opt.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Conditional Helper Fields for Doctor / Nurse / Student */}
              {isHelperRole && (
                <div className="mt-4 space-y-3 rounded-card border border-border/80 bg-surfaceGrey/40 p-4 animate-in fade-in">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                    <Shield className="h-3.5 w-3.5" />
                    <span>{t("helperBadge")}</span>
                    <span className="ml-auto rounded-full bg-border px-2 py-0.5 text-[10px] text-muted">
                      {t("notVerifiedBadge")}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-text">
                      {t("specialty")}
                    </label>
                    <input
                      type="text"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      placeholder={t("specialtyPlaceholder")}
                      className="mt-1 w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-text">
                      {t("regNo")}
                    </label>
                    <input
                      type="text"
                      value={regNo}
                      onChange={(e) => setRegNo(e.target.value)}
                      placeholder={t("regNoPlaceholder")}
                      className="mt-1 w-full rounded-xl border border-border bg-white px-3.5 py-2.5 text-xs text-text focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center justify-center gap-1 rounded-xl border border-border bg-white px-4 py-3.5 text-sm font-semibold text-text hover:bg-surfaceGrey"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>{t("back")}</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-card transition-transform active:scale-98 hover:opacity-95 disabled:opacity-50"
                >
                  <span>{loading ? t("submitting") : t("submitSignup")}</span>
                  <CheckCircle2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </form>

        {/* Footer switch to Login */}
        <div className="mt-6 text-center border-t border-border pt-4">
          <p className="text-xs text-muted">
            {t("haveAccount")}{" "}
            <Link href="/login" className="font-bold text-primary hover:underline">
              {tCommon("login")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
