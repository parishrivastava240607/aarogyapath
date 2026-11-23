"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  User,
  Shield,
  Stethoscope,
  HeartHandshake,
  GraduationCap,
  MapPin,
  Phone,
  Save,
  CheckCircle2,
  AlertCircle,
  Radio,
  LogOut,
} from "lucide-react";
import { UserRole, Gender } from "@/types";
import { LanguageToggle } from "@/components/language-toggle";

export default function ProfilePage() {
  const t = useTranslations("profile");
  const tAuth = useTranslations("auth");
  const tCommon = useTranslations("common");

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Profile data
  const [name, setName] = useState("Dr. Ramesh Verma");
  const [gender, setGender] = useState<Gender>("male");
  const [city, setCity] = useState("Indore");
  const [role, setRole] = useState<UserRole>("doctor");
  const [specialty, setSpecialty] = useState("General Medicine & Critical Care");
  const [regNo, setRegNo] = useState("MP-MED-2024-8971");
  const [isAvailable, setIsAvailable] = useState(true);
  const [emergencyContact, setEmergencyContact] = useState("+91 98260 12345");

  // Load from local storage or server session if available
  useEffect(() => {
    const cached = localStorage.getItem("aarogyapath_demo_user");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.name) setName(parsed.name);
        if (parsed.gender) setGender(parsed.gender);
        if (parsed.city) setCity(parsed.city);
        if (parsed.role) setRole(parsed.role);
        if (parsed.specialty) setSpecialty(parsed.specialty);
        if (parsed.regNo) setRegNo(parsed.regNo);
        if (parsed.is_available !== undefined) setIsAvailable(parsed.is_available);
      } catch {
        // ignore parse error
      }
    }
  }, []);

  const isHelper = role !== "citizen";

  const getRoleLabel = (r: UserRole): string => {
    switch (r) {
      case "citizen":
        return tAuth("roleCitizen");
      case "doctor":
        return tAuth("roleDoctor");
      case "nurse":
        return tAuth("roleNurse");
      case "student":
        return tAuth("roleStudent");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(false);

    try {
      const payload = {
        name,
        gender,
        city,
        role,
        specialty: isHelper ? specialty : null,
        reg_no: isHelper ? regNo : null,
        is_available: isAvailable,
        language: "en",
        emergency_contact: emergencyContact,
      };

      // Save to localStorage for demo persistence
      localStorage.setItem("aarogyapath_demo_user", JSON.stringify(payload));

      // Attempt API update
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // Demo fallback still works
      }

      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch {
      setSuccessMsg(true); // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  const roleIcons = {
    citizen: User,
    doctor: Stethoscope,
    nurse: HeartHandshake,
    student: GraduationCap,
  };

  const RoleIcon = roleIcons[role] || User;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6">
      {/* Header Info Banner */}
      <div className="mb-6 rounded-card border border-border bg-pastel-peach/50 p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-xs">
              <RoleIcon className="h-8 w-8 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-text-heading sm:text-2xl">
                  {name}
                </h1>
                {isHelper && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-pastel-mint px-2.5 py-0.5 text-xs font-bold text-[#1F5C40]">
                    <Shield className="h-3 w-3" />
                    <span>{tAuth("helperBadge")}</span>
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted flex items-center gap-2">
                <span>{getRoleLabel(role)}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-primary" />
                  {city}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LanguageToggle size="sm" />
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem("aarogyapath_demo_user");
                window.location.href = "/login";
              }}
              className="flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-muted hover:border-sos hover:text-sos"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>{tCommon("logout")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-xs font-medium text-success">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{t("savedSuccess")}</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-sos">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Personal and Role settings */}
        <div className="space-y-6 lg:col-span-7">
          <div className="rounded-card border border-border bg-white p-6 shadow-card">
            <h2 className="text-base font-bold text-text-heading mb-4">
              {tAuth("step2Title")}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-heading">
                  {tAuth("fullName")}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-border bg-surfaceGrey/40 px-4 py-2.5 text-sm text-text focus:border-primary focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-heading">
                    {tAuth("gender")}
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                    className="mt-1.5 w-full rounded-xl border border-border bg-surfaceGrey/40 px-4 py-2.5 text-sm text-text focus:border-primary focus:bg-white focus:outline-none"
                  >
                    <option value="prefer_not_to_say">{tAuth("genderPreferNot")}</option>
                    <option value="female">{tAuth("genderFemale")}</option>
                    <option value="male">{tAuth("genderMale")}</option>
                    <option value="other">{tAuth("genderOther")}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-text-heading">
                    {tAuth("city")}
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-border bg-surfaceGrey/40 px-4 py-2.5 text-sm text-text focus:border-primary focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-heading">
                  {t("emergencyContact")}
                </label>
                <div className="relative mt-1.5">
                  <input
                    type="tel"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder={t("emergencyContactPlaceholder")}
                    className="w-full rounded-xl border border-border bg-surfaceGrey/40 px-4 py-2.5 pl-10 text-sm text-text focus:border-primary focus:bg-white focus:outline-none"
                  />
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                </div>
              </div>
            </div>
          </div>

          {/* Role selection & Helper fields */}
          <div className="rounded-card border border-border bg-white p-6 shadow-card">
            <h2 className="text-base font-bold text-text-heading mb-1">
              {tAuth("role")}
            </h2>
            <p className="text-xs text-muted mb-4">{tAuth("roleSubtitle")}</p>

            <div className="grid grid-cols-2 gap-2.5">
              {(["citizen", "doctor", "nurse", "student"] as UserRole[]).map((r) => {
                const isSelected = role === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={`flex items-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all ${
                      isSelected
                        ? "border-primary bg-pastel-peach/50 text-primary"
                        : "border-border bg-white text-text hover:bg-surfaceGrey"
                    }`}
                  >
                    <Radio className={`h-3.5 w-3.5 ${isSelected ? "text-primary" : "text-muted"}`} />
                    <span>{getRoleLabel(r)}</span>
                  </button>
                );
              })}
            </div>

            {isHelper && (
              <div className="mt-4 space-y-3 rounded-xl border border-border/80 bg-surfaceGrey/30 p-4">
                <div>
                  <label className="block text-xs font-semibold text-text">
                    {tAuth("specialty")}
                  </label>
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder={tAuth("specialtyPlaceholder")}
                    className="mt-1 w-full rounded-xl border border-border bg-white px-3.5 py-2 text-xs text-text focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-text">
                      {tAuth("regNo")}
                    </label>
                    <span className="rounded-full bg-border px-2 py-0.5 text-[9px] font-bold text-muted">
                      {tAuth("notVerifiedBadge")}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    placeholder={tAuth("regNoPlaceholder")}
                    className="mt-1 w-full rounded-xl border border-border bg-white px-3.5 py-2 text-xs text-text focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Helper Availability toggle & Actions */}
        <div className="space-y-6 lg:col-span-5">
          {/* Helper Availability Toggle Card */}
          <div className="rounded-card border border-border bg-white p-6 shadow-card">
            <h2 className="text-base font-bold text-text-heading mb-2">
              {t("helperStatus")}
            </h2>

            <div className="flex items-start justify-between gap-4 rounded-xl border border-border/80 bg-pastel-mint/30 p-4">
              <div>
                <span className="text-sm font-bold text-text-heading">
                  {t("availableToHelp")}
                </span>
                <p className="mt-1 text-xs text-muted leading-relaxed">
                  {t("availableDesc")}
                </p>
              </div>

              {/* Toggle switch */}
              <button
                type="button"
                onClick={() => setIsAvailable(!isAvailable)}
                className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isAvailable ? "bg-success" : "bg-border"
                }`}
                aria-pressed={isAvailable}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    isAvailable ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs font-semibold">
              <span className={`h-2 w-2 rounded-full ${isAvailable ? "bg-success" : "bg-muted"}`} />
              <span className={isAvailable ? "text-success" : "text-muted"}>
                {isAvailable ? t("on") : t("off")}
              </span>
            </div>
          </div>

          {/* Unverified note */}
          <div className="rounded-card border border-dashed border-border bg-surfaceGrey/40 p-4 text-xs text-muted leading-relaxed">
            {t("unverifiedNotice")}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-card transition-transform active:scale-98 hover:opacity-95 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{loading ? tCommon("saving") : tCommon("save")}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
