"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Home, Compass, Users, MessageSquareHeart } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const tNav = useTranslations("nav");
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      label: tNav("home"),
      icon: Home,
    },
    {
      href: "/nearby",
      label: tNav("nearby"),
      icon: Compass,
    },
    {
      href: "/help",
      label: tNav("help"),
      icon: Users,
    },
    {
      href: "/chat",
      label: tNav("chat"),
      icon: MessageSquareHeart,
    },
  ];

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-white/95 pb-safe backdrop-blur-sm md:hidden"
    >
      <div className="grid h-16 grid-cols-4 items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-1 text-center transition-colors",
                isActive ? "text-primary font-bold" : "text-muted hover:text-text"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 transition-transform",
                  isActive ? "stroke-[2.5px] scale-110 text-primary" : "stroke-[1.75px]"
                )}
              />
              <span className="text-[11px] leading-none tracking-tight">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
