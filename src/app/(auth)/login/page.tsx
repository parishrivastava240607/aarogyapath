"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Shield, ArrowRight, AlertCircle, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || t("errors.general"));
      }

      setSuccessMsg(true);
      setTimeout(() => {
        router.push("/profile");
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("errors.general");
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-140px)] w-full max-w-[1200px] items-center justify-center px-4 py-6 sm:px-6">
      <div className="w-full max-w-md rounded-card border border-border bg-white p-6 shadow-card sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-pastel-pink text-primary">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-text-heading">
            {t("welcomeBack")}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-muted">
            {t("loginSubtitle")}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-sos">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3 text-xs font-medium text-success">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{t("loginSuccess")}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
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
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-card transition-transform active:scale-98 hover:opacity-95 disabled:opacity-50"
          >
            <span>{loading ? tCommon("loading") : tCommon("login")}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 text-center border-t border-border pt-4">
          <p className="text-xs text-muted">
            {t("dontHaveAccount")}{" "}
            <Link href="/signup" className="font-bold text-primary hover:underline">
              {tCommon("signup")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
