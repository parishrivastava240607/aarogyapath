"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Plus,
  MapPin,
  Shield,
  HeartHandshake,
  Send,
  CheckCircle2,
  X,
  MessageSquare,
  HelpCircle,
} from "lucide-react";
import { HelpRequest, HelpMessage, HelpCategory, HelpUrgency } from "@/types/help";

export default function HelpPage() {
  const t = useTranslations("help");

  const [activeTab, setActiveTab] = useState<"nearby" | "my">("nearby");
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Ask for Help Modal
  const [showModal, setShowModal] = useState(false);
  const [category, setCategory] = useState<HelpCategory>("medicine");
  const [urgency, setUrgency] = useState<HelpUrgency>("high");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Chat thread drawer
  const [activeRequest, setActiveRequest] = useState<HelpRequest | null>(null);
  const [threadMessages, setThreadMessages] = useState<HelpMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [loadingThread, setLoadingThread] = useState(false);

  // Fetch help requests
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/help?lat=22.7196&lng=75.8577&radius=10");
      const json = await res.json();
      if (json.success && json.requests) {
        setRequests(json.requests);
      }
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Fetch thread messages for active request
  const openThread = async (req: HelpRequest) => {
    setActiveRequest(req);
    setLoadingThread(true);
    try {
      const res = await fetch(`/api/help/messages?requestId=${req.id}`);
      const json = await res.json();
      if (json.success) {
        setThreadMessages(json.messages || []);
      }
    } catch {
      setThreadMessages([]);
    } finally {
      setLoadingThread(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        requester_name: "Paris (Citizen)",
        category,
        message,
        urgency,
        city: "Indore",
        approx_area: "Indore Central (approx 500m)",
        lat: 22.7196,
        lng: 75.8577,
      };

      const res = await fetch("/api/help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        setShowModal(false);
        setMessage("");
        setSuccessNotice("Your help request has been broadcast to nearby helpers!");
        setTimeout(() => setSuccessNotice(null), 4000);
        fetchRequests();
      }
    } catch {
      // error handling
    } finally {
      setSubmitting(false);
    }
  };

  const handleAcceptRequest = async (req: HelpRequest) => {
    try {
      const res = await fetch("/api/help", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: req.id,
          helper_name: "Dr. Neha (Healthcare Helper)",
          helper_id: "helper-1",
        }),
      });
      const json = await res.json();
      if (json.success) {
        fetchRequests();
        openThread(json.request);
      }
    } catch {
      // error
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeRequest) return;

    try {
      const res = await fetch("/api/help/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: activeRequest.id,
          sender_name: "Dr. Neha",
          body: chatInput.trim(),
        }),
      });
      const json = await res.json();
      if (json.success && json.message) {
        setThreadMessages((prev) => [...prev, json.message]);
        setChatInput("");
      }
    } catch {
      // error
    }
  };

  const categoriesMap: Record<HelpCategory, string> = {
    medicine: t("catMedicine"),
    blood: t("catBlood"),
    oxygen: t("catOxygen"),
    transport: t("catTransport"),
    medical_advice: t("catAdvice"),
    other: t("catOther"),
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-4 sm:px-6 sm:py-6">
      {/* Title & Floating "Ask for help" Action */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text-heading sm:text-2xl">
            {t("title")}
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-muted">
            {t("subtitle")}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-card transition-transform hover:scale-105 active:scale-95 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>{t("askForHelp")}</span>
        </button>
      </div>

      {/* Success Notice */}
      {successNotice && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-xs font-semibold text-success animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Tabs Row: Nearby Requests vs My Requests */}
      <div className="mb-6 flex items-center gap-2 border-b border-border pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("nearby")}
          className={`rounded-pill px-4 py-1.5 text-xs font-bold transition-all ${
            activeTab === "nearby"
              ? "bg-pastel-peach text-primary shadow-xs"
              : "text-muted hover:text-text"
          }`}
        >
          {t("tabNearby")} ({requests.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("my")}
          className={`rounded-pill px-4 py-1.5 text-xs font-bold transition-all ${
            activeTab === "my"
              ? "bg-pastel-peach text-primary shadow-xs"
              : "text-muted hover:text-text"
          }`}
        >
          {t("tabMy")} (1)
        </button>
      </div>

      {/* Feed Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Requests Cards (lg: 7 cols) */}
        <div className="space-y-4 lg:col-span-7">
          {loading && (
            <div className="space-y-3">
              {[1, 2].map((n) => (
                <div key={n} className="h-40 animate-pulse rounded-card border border-border bg-surfaceGrey" />
              ))}
            </div>
          )}

          {!loading && requests.length === 0 && (
            <div className="rounded-card border border-dashed border-border p-10 text-center">
              <HelpCircle className="mx-auto h-8 w-8 text-muted" />
              <p className="mt-2 text-xs font-semibold text-muted">{t("noRequests")}</p>
            </div>
          )}

          {!loading &&
            requests.map((req) => {
              const isResolved = req.status === "resolved";
              const hasHelper = req.status === "helper_found";

              return (
                <div
                  key={req.id}
                  className="rounded-card border border-border bg-white p-5 shadow-card transition-all hover:border-primary/50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-pastel-pink px-2.5 py-0.5 text-[10px] font-bold text-primary uppercase">
                        {categoriesMap[req.category] || req.category}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          req.urgency === "critical"
                            ? "bg-red-100 text-sos"
                            : req.urgency === "high"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-surfaceGrey text-muted"
                        }`}
                      >
                        {req.urgency.toUpperCase()}
                      </span>
                      <span className="text-xs text-muted">
                        {req.distance ? `${req.distance} km` : "Nearby"}
                      </span>
                    </div>

                    <span
                      className={`text-[11px] font-bold ${
                        isResolved
                          ? "text-success"
                          : hasHelper
                          ? "text-blue-600"
                          : "text-muted"
                      }`}
                    >
                      {isResolved
                        ? t("statusResolved")
                        : hasHelper
                        ? t("statusHelperFound")
                        : t("statusOpen")}
                    </span>
                  </div>

                  <p className="mt-3 text-sm font-semibold text-text-heading leading-relaxed">
                    &ldquo;{req.message}&rdquo;
                  </p>

                  {/* Approximate Location Notice (PRD 500m privacy rule) */}
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-muted">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>{req.approx_area}</span>
                  </div>

                  {/* Actions & Thread */}
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                    <div className="text-xs font-medium text-muted">
                      Requested by <span className="font-bold text-text">{req.requester_name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {req.status === "open" ? (
                        <button
                          type="button"
                          onClick={() => handleAcceptRequest(req)}
                          className="flex items-center gap-1 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:opacity-95"
                        >
                          <HeartHandshake className="h-3.5 w-3.5" />
                          <span>{t("iCanHelp")}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openThread(req)}
                          className="flex items-center gap-1 rounded-xl border border-border bg-pastel-blue/30 px-3 py-1.5 text-xs font-bold text-[#1E4E8C] hover:bg-pastel-blue/60"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>{t("accepted")}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Right Column: Active Thread / Community Rules (lg: 5 cols) */}
        <div className="lg:col-span-5">
          {activeRequest ? (
            <div className="rounded-card border border-border bg-white p-5 shadow-card sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold text-text-heading">{t("threadTitle")}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRequest(null)}
                  className="rounded-full p-1 text-muted hover:bg-surfaceGrey"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="my-3 rounded-xl bg-surfaceGrey/50 p-2.5 text-xs text-muted">
                Connecting with <span className="font-bold text-text">{activeRequest.requester_name}</span> for {activeRequest.category}.
              </div>

              {/* Thread Messages */}
              <div className="max-h-64 min-h-40 overflow-y-auto space-y-2.5 py-2">
                {loadingThread && <p className="text-xs text-muted">Loading messages...</p>}
                {!loadingThread && threadMessages.length === 0 && (
                  <p className="text-xs text-muted text-center py-4">
                    Thread initiated. Send a message to coordinate medical help safely.
                  </p>
                )}
                {threadMessages.map((msg) => (
                  <div key={msg.id} className="rounded-xl border border-border bg-surfaceGrey/30 p-2.5 text-xs">
                    <span className="font-bold text-text-heading block mb-0.5">{msg.sender_name}</span>
                    <p className="text-text">{msg.body}</p>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={t("typeMessage")}
                  className="w-full rounded-xl border border-border bg-surfaceGrey/50 px-3 py-2 text-xs text-text focus:border-primary focus:bg-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-xl bg-primary p-2 text-white hover:opacity-95"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>
          ) : (
            <div className="rounded-card border border-border bg-pastel-peach/30 p-5 shadow-card space-y-3 sticky top-24">
              <div className="flex items-center gap-2 text-xs font-bold text-primary">
                <Shield className="h-4 w-4" />
                <span>Crowd Help Safety & Privacy</span>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                {t("approxLocationNotice")}
              </p>
              <ul className="text-xs text-text space-y-1 list-disc list-inside">
                <li>No monetary transactions or medicine sales allowed.</li>
                <li>Volunteer helpers are self-declared.</li>
                <li>In severe medical distress, always dial 108 first.</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Ask for Help Stepped Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-card border border-border bg-white p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="text-base font-bold text-text-heading">{t("askForHelp")}</h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-full p-1 text-muted hover:bg-surfaceGrey"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-heading mb-1.5">
                  {t("category")}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["medicine", "blood", "oxygen", "transport", "medical_advice", "other"] as HelpCategory[]).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`rounded-xl border p-2.5 text-xs font-semibold text-left transition-all ${
                        category === cat
                          ? "border-primary bg-pastel-peach text-primary font-bold shadow-xs"
                          : "border-border bg-white text-text hover:bg-surfaceGrey"
                      }`}
                    >
                      {categoriesMap[cat]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-heading mb-1.5">
                  {t("urgency")}
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(["low", "medium", "high", "critical"] as HelpUrgency[]).map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setUrgency(u)}
                      className={`rounded-xl border py-2 text-xs font-bold capitalize transition-all ${
                        urgency === u
                          ? u === "critical"
                            ? "border-sos bg-red-100 text-sos"
                            : "border-primary bg-pastel-peach text-primary"
                          : "border-border bg-white text-muted hover:text-text"
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-text-heading mb-1.5">
                  {t("message")}
                </label>
                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("messagePlaceholder")}
                  className="w-full rounded-xl border border-border bg-surfaceGrey/40 p-3 text-xs text-text focus:border-primary focus:bg-white focus:outline-none"
                />
              </div>

              <div className="rounded-xl bg-surfaceGrey/50 p-3 text-[11px] text-muted">
                {t("approxLocationNotice")}
              </div>

              <button
                type="submit"
                disabled={submitting || !message.trim()}
                className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-card hover:opacity-95 disabled:opacity-50"
              >
                {submitting ? t("submitting") : t("submitRequest")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
