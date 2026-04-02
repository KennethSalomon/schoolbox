"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import UserNav from "../../components/UserNav";
import CheckoutForm from "../../components/checkoutform";
import type { CartItem } from "../../components/ProductCard";

export default function CommandePage() {
  const router = useRouter();
  const [items, setItems]             = useState<CartItem[]>([]);
  const [schoolId, setSchoolId]       = useState("");
  const [grade, setGrade]             = useState("");
  const [loading, setLoading]         = useState(true);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("sb_box_draft");
    if (saved) {
      try {
        const parsedItems = JSON.parse(saved) as CartItem[];
        setItems(parsedItems);
      } catch {
        setItems([]);
      }
    }

    // Try to recover school/grade from profile saved in localStorage
    const profileStr = localStorage.getItem("sb_profile_draft");
    if (profileStr) {
      try {
        const prof = JSON.parse(profileStr);
        if (prof.school_id) setSchoolId(prof.school_id);
        if (prof.child_grade) setGrade(prof.child_grade);
      } catch {/* ignore */}
    }

    setLoading(false);
  }, []);

  const handleSuccess = (orderId: string) => {
    localStorage.removeItem("sb_box_draft");
    setOrderSuccess(orderId);
    router.push(`/commandes/${orderId}/confirmation`);
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-BJ", { style: "currency", currency: "XOF", maximumFractionDigits: 0 }).format(n);

  if (loading) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-base)" }}>
        <UserNav />
        <main style={{ marginLeft: "240px", flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px", animation: "spin-slow 2s linear infinite", display: "inline-block" }}>⚙️</div>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Chargement…</p>
          </div>
        </main>
      </div>
    );
  }

  if (items.length === 0 && !orderSuccess) {
    return (
      <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-base)" }}>
        <UserNav />
        <main
          style={{
            marginLeft: "240px",
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
            fontFamily: "var(--font-body)",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: "400px" }}>
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>📭</div>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "10px" }}>
              Votre Box est vide
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "24px", lineHeight: 1.7 }}>
              Vous devez d&apos;abord composer votre Box avant de passer commande.
            </p>
            <a
              href="/catalogue"
              style={{
                display: "inline-block",
                padding: "14px 32px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #d4af37, #b8860b)",
                color: "#0a0a0f",
                fontWeight: 800,
                fontSize: "14px",
                textDecoration: "none",
                boxShadow: "0 4px 24px rgba(212,175,55,0.3)",
              }}
            >
              Composer ma Box →
            </a>
          </div>
        </main>
      </div>
    );
  }

  const totalPrice = items.reduce((s, i) => s + i.subtotal, 0);
  const DELIVERY_FEE = 1500;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-base)" }}>
      <UserNav />

      <main
        style={{
          marginLeft: "240px",
          flex: 1,
          fontFamily: "var(--font-body)",
        }}
      >
        {/* Header bar */}
        <div
          style={{
            padding: "28px 48px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#d4af37", marginBottom: "6px" }}>
              ✦ Finalisation
            </p>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "26px", fontWeight: 800, color: "var(--text-primary)" }}>
              Passer commande
            </h1>
          </div>

          {/* Mini cart summary */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "12px 20px",
              borderRadius: "12px",
              background: "linear-gradient(145deg, #12121e, #1a1a2e)",
              border: "1px solid rgba(212,175,55,0.1)",
            }}
          >
            <div style={{ fontSize: "22px" }}>🛒</div>
            <div>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                {items.length} article{items.length > 1 ? "s" : ""}
              </p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "16px", fontWeight: 700, color: "#d4af37" }}>
                {fmt(totalPrice + DELIVERY_FEE)}
              </p>
            </div>
            <a
              href="/ma-box"
              style={{
                fontSize: "12px",
                color: "rgba(255,255,255,0.4)",
                textDecoration: "none",
                padding: "6px 12px",
                borderRadius: "8px",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              ← Modifier
            </a>
          </div>
        </div>

        {/* Payment steps indicator */}
        <div
          style={{
            padding: "16px 48px",
            display: "flex",
            gap: "8px",
            alignItems: "center",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          {[
            { n: "1", label: "Ma Box", done: true },
            { n: "2", label: "Livraison & Paiement", done: false, active: true },
            { n: "3", label: "Confirmation", done: false },
          ].map((step, idx) => (
            <div key={step.n} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: step.done
                      ? "linear-gradient(135deg, #22c55e, #16a34a)"
                      : step.active
                        ? "linear-gradient(135deg, #d4af37, #b8860b)"
                        : "rgba(255,255,255,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: 800,
                    color: step.done || step.active ? "#fff" : "var(--text-muted)",
                    flexShrink: 0,
                  }}
                >
                  {step.done ? "✓" : step.n}
                </div>
                <span
                  style={{
                    fontSize: "13px",
                    fontWeight: step.active ? 700 : 400,
                    color: step.active ? "var(--text-primary)" : step.done ? "#22c55e" : "var(--text-muted)",
                  }}
                >
                  {step.label}
                </span>
              </div>
              {idx < 2 && (
                <div style={{ width: "32px", height: "1px", background: "rgba(255,255,255,0.1)" }} />
              )}
            </div>
          ))}
        </div>

        {/* CheckoutForm */}
        <div style={{ padding: "40px 48px", maxWidth: "880px" }}>
          <CheckoutForm
            items={items}
            schoolId={schoolId}
            grade={grade}
            onSuccess={handleSuccess}
          />
        </div>
      </main>
    </div>
  );
}
