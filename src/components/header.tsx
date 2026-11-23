"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Menu,
  X,
  Bell,
  MapPin,
  Search,
  ChevronDown,
  User,
  HeartPulse,
} from "lucide-react";
import { LanguageToggle } from "./language-toggle";
import { cn } from "@/lib/utils";

export function Header() {
  const t = useTranslations("common");
  const tNav = useTranslations("nav");
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: tNav("home") },
    { href: "/nearby", label: tNav("nearby") },
    { href: "/help", label: tNav("help") },
    { href: "/chat", label: tNav("chat") },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6">
        {/* Left side: Mobile Hamburger + Brand Logo */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger menu button (<768px only) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-text transition-colors hover:border-primary hover:text-primary md:hidden"
            aria-label={t("menu")}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Logo with clean healthcare aesthetic */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pastel-pink text-primary transition-transform group-hover:scale-105">
              <HeartPulse className="h-6 w-6 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold leading-tight tracking-tight text-text-heading">
                {t("appName")}
              </span>
              <span className="hidden text-[10px] font-medium text-muted lg:inline">
                {t("tagline")}
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Center/Nav Links (>=768px): Home, Nearby, Help, Chat */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-pastel-peach text-primary"
                    : "text-muted hover:bg-surfaceGrey hover:text-text"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop: Location selector and Pill Search bar */}
        <div className="hidden items-center gap-3 lg:flex">
          {/* Location Selector */}
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-1.5 text-xs font-semibold text-text hover:border-primary"
          >
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span>{t("defaultCity")}</span>
            <ChevronDown className="h-3 w-3 text-muted" />
          </button>

          {/* Pill Search bar */}
          <div className="relative w-64 xl:w-72">
            <input
              type="text"
              readOnly
              placeholder={t("searchPlaceholder")}
              className="w-full rounded-pill border border-border bg-surfaceGrey/50 py-2 pl-4 pr-10 text-xs text-text placeholder:text-muted focus:border-primary focus:bg-white focus:outline-none"
            />
            <Search className="absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          </div>
        </div>

        {/* Right side controls: Language toggle, Notification bell, Profile avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageToggle />

          {/* Notification bell (thin-outlined circular icon container) */}
          <button
            type="button"
            aria-label={t("notifications")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-text transition-colors hover:border-primary hover:text-primary active:scale-95"
          >
            <Bell className="h-4 w-4" />
          </button>

          {/* Profile avatar (Desktop) */}
          <Link
            href="/profile"
            aria-label={t("profile")}
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-border bg-pastel-mint text-primary transition-colors hover:border-primary md:flex"
          >
            <User className="h-5 w-5 text-primary" />
          </Link>
        </div>
      </div>

      {/* Mobile Drawer Menu (<768px) */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-white px-4 py-4 md:hidden">
          {/* Location selector on mobile */}
          <div className="mb-4 flex items-center justify-between rounded-xl bg-surfaceGrey p-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-text">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{t("defaultCity")}</span>
            </div>
            <button className="text-xs font-semibold text-primary">
              Change
            </button>
          </div>

          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
                    isActive
                      ? "bg-pastel-peach text-primary"
                      : "text-text hover:bg-surfaceGrey"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-text hover:bg-surfaceGrey"
            >
              <User className="h-4 w-4 text-muted" />
              <span>{t("profile")}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
