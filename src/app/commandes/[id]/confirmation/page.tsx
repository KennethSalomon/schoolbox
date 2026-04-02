"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { createClientComponentClient } from "../../../../lib/supabase/client";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-BJ", { style: "currency", currency: "XOF", maximumFractionDigits: 0 }).format(n);

interface Order {
  id: string;
  order_number?: string;
  created_at: string;
  status: string;
  total_price: number;
  delivery_city: string;
  delivery_district: string;
  delivery_name: string;
  delivery_phone: string;
  payment_method: string;
  items: Array<{ name: string; qty: number; tier: string; subtotal: number }>;
  subtotal: number;
  delivery_fee: number;
  discount: number;
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: string }> = {
  en_attente:   { label: "En attente de confirmation", color: "#f59e0b", icon: "⏳" },
  confirme:     { label: "Confirmée",                  color: "#3b82f6", icon: "✅" },
  preparation:  { label: "En préparation",             color: "#8b5cf6", icon: "📦" },
  en_livraison: { label: "En cours de livraison",      color: "#06b6d4", icon: "🚚" },
  livre:        { label: "Livrée avec succès",         color: "#22c55e", icon: "🏠" },
  annule:       { label: "Annulée",                    color: "#ef4444", icon: "✗"  },
};

const PAY_LABELS: Record<string, string> = {
  mtn_money:  "🟡 MTN Mobile Money",
  moov_money: "🔵 Moov Money",
  livraison:  "🚚 Paiement à la livraison",
};

export default function ConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const supabase = createClientComponentClient();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .single();
      if (data) setOrder(data as Order);
      setLoading(false);
    };
    fetch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg-base)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-body)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "16px", animation: "float 2s ease-in-out infinite", display: "inline-block" }}>📦</div>
          <p style={{ color: "var(--text-muted)" }}>Chargement de votre commande…</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg-base)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-body)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "48px", marginBottom: "16px" }}>❓</p>
          <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>Commande introuvable.</p>
          <Link href="/dashboard" style={{ color: "#d4af37", textDecoration: "none" }}>← Retour au tableau de bord</Link>
        </div>
      </div>
    );
  }

  const cfg = STATUS_MAP[order.status] ?? STATUS_MAP.en_attente;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-base)",
        fontFamily: "var(--font-body)",
        padding: "0",
      }}
    >
      {/* Top Nav */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(8,8,16,0.9)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(212,175,55,0.1)",
          padding: "16px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link href="/" style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "18px", color: "var(--text-primary)", textDecoration: "none" }}>
          School<span style={{ color: "#d4af37" }}>Box</span>
        </Link>
        <div style={{ display: "flex", gap: "16px" }}>
          <Link href="/dashboard" style={{ fontSize: "13px", color: "var(--text-muted)", textDecoration: "none" }}>Tableau de bord</Link>
          <Link href="/catalogue" style={{ padding: "8px 18px", borderRadius: "8px", background: "linear-gradient(135deg, #d4af37, #b8860b)", color: "#0a0a0f", fontWeight: 700, fontSize: "13px", textDecoration: "none" }}>
            Nouvelle Box
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: "680px", margin: "0 auto", padding: "60px 24px" }}>

        {/* Success header */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "48px",
            padding: "48px 40px",
            background: "linear-gradient(145deg, #0f1a0f, #111e11)",
            border: "1px solid rgba(34,197,94,0.2)",
            borderRadius: "24px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(circle at 50% 30%, rgba(34,197,94,0.08) 0%, transparent 60%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.08))",
              border: "2px solid rgba(34,197,94,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "36px",
              margin: "0 auto 24px",
              animation: "pulse-gold 2s ease-in-out infinite",
            }}
          >
            ✅
          </div>
          <h1
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "28px",
              fontWeight: 800,
              color: "var(--text-primary)",
              marginBottom: "10px",
            }}
          >
            Commande passée !
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "15px", lineHeight: 1.7 }}>
            Votre box scolaire est enregistrée. Vous serez contacté sous peu pour confirmer la livraison.
          </p>
          <div
            style={{
              display: "inline-block",
              marginTop: "20px",
              padding: "8px 20px",
              borderRadius: "30px",
              background: `${cfg.color}1a`,
              border: `1px solid ${cfg.color}44`,
              color: cfg.color,
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            {cfg.icon} {cfg.label}
          </div>
        </div>

        {/* Order reference */}
        <div
          style={{
            background: "linear-gradient(145deg, #12121e, #1a1a2e)",
            border: "1px solid rgba(212,175,55,0.15)",
            borderRadius: "20px",
            padding: "28px",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "6px" }}>
                Numéro de commande
              </p>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "22px", fontWeight: 800, color: "#d4af37" }}>
                #{order.order_number ?? id.slice(0, 8).toUpperCase()}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "6px" }}>
                Date
              </p>
              <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                {new Date(order.created_at).toLocaleDateString("fr-BJ", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>

          {/* Items */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "16px" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "12px" }}>
              Articles commandés
            </p>
            {order.items?.map((item, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: "13px" }}>
                <span style={{ color: "var(--text-secondary)" }}>
                  {item.name} ×{item.qty}
                  <span
                    style={{
                      marginLeft: "8px",
                      fontSize: "10px",
                      padding: "2px 6px",
                      borderRadius: "10px",
                      background: item.tier === "premium" ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.08)",
                      color: item.tier === "premium" ? "#d4af37" : "var(--text-muted)",
                      fontWeight: 700,
                    }}
                  >
                    {item.tier}
                  </span>
                </span>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
                  {fmt(item.subtotal)}
                </span>
              </div>
            ))}

            {/* Totals */}
            <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "var(--text-muted)" }}>
                <span>Livraison</span>
                <span style={{ fontFamily: "var(--font-mono)" }}>{fmt(order.delivery_fee ?? 1500)}</span>
              </div>
              {order.discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#22c55e" }}>
                  <span>Réduction parrainage</span>
                  <span style={{ fontFamily: "var(--font-mono)" }}>−{fmt(order.discount)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "17px", fontWeight: 800, color: "var(--text-primary)", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "10px", marginTop: "4px" }}>
                <span>Total payé</span>
                <span style={{ fontFamily: "var(--font-mono)", color: "#d4af37" }}>{fmt(order.total_price)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Delivery & Payment info */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div style={{ background: "linear-gradient(145deg, #12121e, #1a1a2e)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "20px" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "12px" }}>🚚 Livraison</p>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px" }}>{order.delivery_name}</p>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "2px" }}>{order.delivery_phone}</p>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>{order.delivery_district}, {order.delivery_city}</p>
          </div>
          <div style={{ background: "linear-gradient(145deg, #12121e, #1a1a2e)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "20px" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "12px" }}>💳 Paiement</p>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
              {PAY_LABELS[order.payment_method] ?? order.payment_method}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link
            href="/dashboard"
            style={{
              flex: 1,
              display: "block",
              padding: "15px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #d4af37, #b8860b)",
              color: "#0a0a0f",
              fontWeight: 800,
              fontSize: "14px",
              textDecoration: "none",
              textAlign: "center",
              boxShadow: "0 4px 20px rgba(212,175,55,0.3)",
            }}
          >
            Tableau de bord →
          </Link>
          <Link
            href="/catalogue"
            style={{
              flex: 1,
              display: "block",
              padding: "15px",
              borderRadius: "14px",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "var(--text-secondary)",
              fontWeight: 600,
              fontSize: "14px",
              textDecoration: "none",
              textAlign: "center",
            }}
          >
            Nouvelle commande
          </Link>
        </div>
      </div>
    </div>
  );
}
