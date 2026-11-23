import type { Metadata } from "next";
import { Inter, Noto_Sans_Devanagari } from "next/font/google";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { Header } from "@/components/header";
import { BottomNav } from "@/components/bottom-nav";
import { SosButton } from "@/components/sos-button";
import { LocaleProvider, Locale } from "@/components/locale-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-sans-devanagari",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AarogyaPath — Smart Health Navigation",
  description: "Search your treatment, not a hospital name. Find the right care nearby.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value as Locale | undefined;
  const currentLocale: Locale = cookieLocale === "hi" ? "hi" : "en";
  const messages = await getMessages();

  return (
    <html
      lang={currentLocale}
      className={`${inter.variable} ${notoSansDevanagari.variable}`}
    >
      <body className="min-h-screen bg-background font-sans text-text antialiased selection:bg-pastel-pink selection:text-primary">
        <NextIntlClientProvider locale={currentLocale} messages={messages}>
          <LocaleProvider initialLocale={currentLocale}>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1 pb-24 md:pb-12">{children}</main>
              <BottomNav />
              <SosButton />
            </div>
          </LocaleProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
