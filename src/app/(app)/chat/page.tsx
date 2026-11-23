"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Sparkles,
  Send,
  AlertTriangle,
  PhoneCall,
  Search,
  Bot,
  User,
  Shield,
  Loader2,
} from "lucide-react";
import { useLocaleSwitcher } from "@/components/locale-provider";

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  isRedFlag?: boolean;
  suggestedSpecialty?: string;
}

export default function ChatPage() {
  const t = useTranslations("chat");
  const { locale } = useLocaleSwitcher();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "assistant",
      text:
        locale === "hi"
          ? "नमस्ते! मैं आरोग्यपथ AI स्वास्थ्य सहायक हूँ। आप अपने लक्षण हिंदी या अंग्रेजी में साझा कर सकते हैं। मैं आपको सुरक्षित प्राथमिक देखभाल और सही दिशा-निर्देश प्रदान करूँगा।"
          : "Hello! I am your AarogyaPath AI Health Assistant. Describe any health symptoms or concerns, and I will provide immediate first steps and guide you to the right medical care.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeRedFlag, setActiveRedFlag] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const quickPrompts = [
    t("promptFever"),
    t("promptChestPain"),
    t("promptBreathless"),
    t("promptHeadache"),
    t("promptStomach"),
  ];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend.trim(),
          language: locale === "hi" ? "hi" : "en",
        }),
      });

      const json = await res.json();

      if (json.isRedFlag) {
        setActiveRedFlag(true);
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text: json.reply || "I am currently unable to provide guidance. Please consult a doctor.",
        isRedFlag: json.isRedFlag,
        suggestedSpecialty: json.suggestedSpecialty,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "assistant",
        text:
          locale === "hi"
            ? "नेटवर्क त्रुटि के कारण संदेश नहीं भेजा जा सका। कृपया पुनः प्रयास करें या आपातकाल में 108 पर कॉल करें।"
            : "Network error occurred. Please try again or dial 108 in case of an emergency.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[720px] px-4 py-4 sm:px-6">
      {/* Header */}
      <div className="mb-4 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-pastel-purple text-primary shadow-xs">
          <Sparkles className="h-6 w-6 text-[#6B46C1]" />
        </div>
        <h1 className="mt-2 text-xl font-bold tracking-tight text-text-heading sm:text-2xl">
          {t("title")}
        </h1>
        <p className="text-xs text-muted">{t("subtitle")}</p>
      </div>

      {/* Red-Flag Emergency Banner (PRD Section 5 F5 & 8.1 in #DC2626) */}
      {activeRedFlag && (
        <div className="mb-4 rounded-card border-2 border-sos bg-red-50 p-4 shadow-md animate-in slide-in-from-top-2">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sos text-white">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-black text-sos">
                {t("emergencyBannerTitle")}
              </h2>
              <p className="mt-0.5 text-xs font-semibold text-text leading-relaxed">
                {t("emergencyBannerDesc")}
              </p>

              {/* Call 108 & SOS Action Buttons */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <a
                  href="tel:108"
                  className="flex items-center gap-1.5 rounded-xl bg-sos px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700"
                >
                  <PhoneCall className="h-3.5 w-3.5" />
                  <span>{t("callAmbulance")}</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    const btn = document.querySelector('button[aria-label="SOS"]') as HTMLButtonElement | null;
                    btn?.click();
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-sos bg-white px-3.5 py-2 text-xs font-bold text-sos hover:bg-red-50"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>{t("pressSos")}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Prompts Chips */}
      <div className="mb-4">
        <span className="text-[11px] font-bold text-muted uppercase tracking-wider block mb-2">
          {t("quickPromptsTitle")}
        </span>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {quickPrompts.map((promptText, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendMessage(promptText)}
              className="shrink-0 rounded-pill border border-border bg-white px-3.5 py-1.5 text-xs font-semibold text-text shadow-xs transition-all hover:border-primary hover:bg-pastel-peach/40"
            >
              {promptText}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Thread Container (Max width ~720px centred column) */}
      <div className="min-h-[380px] max-h-[520px] overflow-y-auto rounded-card border border-border bg-white p-4 shadow-card space-y-4">
        {messages.map((m) => {
          const isUser = m.sender === "user";
          return (
            <div
              key={m.id}
              className={`flex items-start gap-2.5 ${
                isUser ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  isUser
                    ? "bg-primary text-white"
                    : m.isRedFlag
                    ? "bg-sos text-white"
                    : "bg-pastel-purple text-[#6B46C1]"
                }`}
              >
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? "bg-primary text-white rounded-br-xs"
                    : m.isRedFlag
                    ? "border border-sos/30 bg-red-50/70 text-text rounded-bl-xs"
                    : "border border-border bg-surfaceGrey/60 text-text rounded-bl-xs"
                }`}
              >
                <p className="whitespace-pre-line">{m.text}</p>

                {/* "Find hospitals for this" Handoff CTA (PRD F5) */}
                {!isUser && m.suggestedSpecialty && (
                  <div className="mt-3 border-t border-black/10 pt-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(
                          `/search?q=${encodeURIComponent(m.suggestedSpecialty || "")}`
                        )
                      }
                      className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-primary shadow-xs border border-primary/30 hover:bg-pastel-peach/40"
                    >
                      <Search className="h-3.5 w-3.5" />
                      <span>
                        {t("findHospitals")} ({m.suggestedSpecialty}) →
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-muted p-2">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span>AI is reviewing symptoms...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }}
        className="mt-4"
      >
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("inputPlaceholder")}
            className="w-full rounded-search border border-border bg-white py-3.5 pl-5 pr-14 text-sm text-text placeholder:text-muted shadow-card focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="absolute right-3 rounded-full bg-primary p-2 text-white shadow-xs transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
            aria-label={t("send")}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>

      {/* Medical Safety Disclaimer Footer */}
      <div className="mt-3 flex items-center justify-center gap-1.5 text-center text-[10px] text-muted">
        <Shield className="h-3 w-3 text-primary shrink-0" />
        <span>{t("disclaimer")}</span>
      </div>
    </div>
  );
}
