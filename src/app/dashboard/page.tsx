"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClientComponentClient } from "../../lib/supabase/client";
import UserNav from "../../components/UserNav";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-BJ", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(n);

interface Order {
  id: string;
  order_number?: string;
  total_price: number;
  status: string;
  created_at: string;
  delivery_city: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  en_attente:  { label: "En attente",   color: "#f59e0b", icon: "⏳" },
  confirme:    { label: "Confirmée",    color: "#3b82f6", icon: "✔" },
  preparation: { label: "Préparation",  color: "#8b5cf6", icon: "📦" },
  en_livraison:{ label: "En livraison", color: "#06b6d4", icon: "🚚" },
  livre:       { label: "Livré",        color: "#22c55e", icon: "✅" },
  annule:      { label: "Annulée",      color: "#ef4444", icon: "✗" },
};

export default function DashboardPage() {
  const supabase = createClientComponentClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [now] = useState(new Date());

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, order_number, total_price, status, created_at, delivery_city")
        .order("created_at", { ascending: false })
        .limit(5);
      if (data) setOrders(data as Order[]);
      setLoading(false);
    };
    fetch();
  }, [supabase]);

  const activeOrders   = orders.filter(o => !["livre", "annule"].includes(o.status));
  const totalSpent     = orders.reduce((s, o) => s + o.total_price, 0);
  const deliveredCount = orders.filter(o => o.status === "livre").length;

  const greeting = () => {
    const h = now.getHours();
    if (h < 12) return "Bonjour";
    if (h < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  const stats = [
    {
      icon: "📦",
      label: "Commandes actives",
      value: activeOrders.length.toString(),
      sub: "en cours",
      color: "#8b5cf6",
      bg: "rgba(139,92,246,0.1)",
    },
    {
      icon: "✅",
      label: "Commandes livrées",
      value: deliveredCount.toString(),
      sub: "reçues avec succès",
      color: "#22c55e",
      bg: "rgba(34,197,94,0.1)",
    },
    {
      icon: "💰",
      label: "Total dépensé",
      value: fmt(totalSpent),
      sub: "toutes commandes",
      color: "#d4af37",
      bg: "rgba(212,175,55,0.1)",
    },
    {
      icon: "🚚",
      label: "Délai moyen",
      value: "36h",
      sub: "de livraison",
      color: "#06b6d4",
      bg: "rgba(6,182,212,0.1)",
    },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-base)" }}>
      <UserNav />

      {/* Main content */}
      <main
        style={{
          marginLeft: "var(--content-margin)",
          flex: 1,
          padding: "40px 48px",
          fontFamily: "var(--font-body)",
          overflowX: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "40px",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#d4af37",
                marginBottom: "6px",
              }}
            >
              ✦ Espace Parent
            </p>
            <h1
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "32px",
                fontWeight: 800,
                color: "var(--text-primary)",
                marginBottom: "6px",
              }}
            >
              {greeting()}, Parent 👋
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              {now.toLocaleDateString("fr-BJ", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <Link
            href="/catalogue"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #d4af37, #b8860b)",
              color: "#0a0a0f",
              fontWeight: 800,
              fontSize: "14px",
              textDecoration: "none",
              boxShadow: "0 4px 24px rgba(212,175,55,0.3)",
            }}
          >
            <span style={{ fontSize: "18px" }}>📦</span>
            Composer ma Box
          </Link>
        </div>

        {/* Stats Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "linear-gradient(145deg, #12121e, #1a1a2e)",
                border: "1px solid rgba(212,175,55,0.1)",
                borderRadius: "20px",
                padding: "24px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Glow dot */}
              <div
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
                  width: "40px",
                  height: "40px",
                  borderRadius: "10px",
                  background: stat.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                }}
              >
                {stat.icon}
              </div>
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  marginBottom: "12px",
                }}
              >
                {stat.label}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: stat.value.length > 8 ? "20px" : "28px",
                  fontWeight: 800,
                  color: stat.color,
                  marginBottom: "4px",
                  lineHeight: 1.1,
                }}
              >
                {stat.value}
              </p>
              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                {stat.sub}
              </p>
            </div>
          ))}
        </div>

        {/* Two-column layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "24px" }}>

          {/* Recent Orders */}
          <div
            style={{
              background: "linear-gradient(145deg, #12121e, #1a1a2e)",
              border: "1px solid rgba(212,175,55,0.1)",
              borderRadius: "20px",
              padding: "28px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "24px",
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                }}
              >
                Commandes récentes
              </h2>
              <Link
                href="/commandes"
                style={{
                  fontSize: "12px",
                  color: "#d4af37",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Tout voir →
              </Link>
            </div>

            {loading ? (
              [...Array(3)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: "64px",
                    borderRadius: "12px",
                    background: "rgba(255,255,255,0.04)",
                    marginBottom: "12px",
                    animation: "skeleton 1.5s ease-in-out infinite",
                  }}
                />
              ))
            ) : orders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0" }}>
                <p style={{ fontSize: "40px", marginBottom: "12px" }}>📭</p>
                <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                  Aucune commande pour l&apos;instant
                </p>
                <Link
                  href="/catalogue"
                  style={{
                    display: "inline-block",
                    marginTop: "16px",
                    padding: "10px 20px",
                    borderRadius: "10px",
                    background: "rgba(212,175,55,0.1)",
                    border: "1px solid rgba(212,175,55,0.3)",
                    color: "#d4af37",
                    textDecoration: "none",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  Composer ma première Box →
                </Link>
              </div>
            ) : (
              orders.map((order) => {
                const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.en_attente;
                return (
                  <Link
                    key={order.id}
                    href={`/commandes/${order.id}/confirmation`}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        padding: "14px 16px",
                        borderRadius: "14px",
                        border: "1px solid rgba(255,255,255,0.05)",
                        marginBottom: "10px",
                        transition: "background 0.2s, border-color 0.2s",
                        cursor: "pointer",
                      }}
                      onMouseEnter={e =>
                        ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)")
                      }
                      onMouseLeave={e =>
                        ((e.currentTarget as HTMLElement).style.background = "transparent")
                      }
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "10px",
                          background: `rgba(${cfg.color.slice(1).match(/.{2}/g)?.map(x => parseInt(x,16)).join(",")}, 0.12)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "18px",
                          flexShrink: 0,
                        }}
                      >
                        {cfg.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "3px" }}>
                          Commande #{order.order_number ?? order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                          {order.delivery_city} ·{" "}
                          {new Date(order.created_at).toLocaleDateString("fr-BJ")}
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "14px",
                            fontWeight: 700,
                            color: "#d4af37",
                            marginBottom: "3px",
                          }}
                        >
                          {fmt(order.total_price)}
                        </p>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: "20px",
                            background: `${cfg.color}22`,
                            color: cfg.color,
                            letterSpacing: "0.04em",
                          }}
                        >
                          {cfg.label}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          {/* Quick Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Quick Links */}
            <div
              style={{
                background: "linear-gradient(145deg, #12121e, #1a1a2e)",
                border: "1px solid rgba(212,175,55,0.1)",
                borderRadius: "20px",
                padding: "24px",
              }}
            >
              <h2
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: "16px",
                }}
              >
                Actions rapides
              </h2>
              {[
                { icon: "📋", label: "Voir le catalogue",   href: "/catalogue",  color: "#8b5cf6" },
                { icon: "📦", label: "Ma Box en cours",      href: "/ma-box",     color: "#d4af37" },
                { icon: "👤", label: "Mon profil",           href: "/profil",     color: "#06b6d4" },
                { icon: "🧾", label: "Historique commandes", href: "/commandes",  color: "#22c55e" },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 14px",
                    borderRadius: "12px",
                    textDecoration: "none",
                    marginBottom: "8px",
                    border: "1px solid rgba(255,255,255,0.06)",
                    transition: "background 0.2s, border-color 0.2s",
                  }}
                  onMouseEnter={e =>
                    ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)")
                  }
                  onMouseLeave={e =>
                    ((e.currentTarget as HTMLElement).style.background = "transparent")
                  }
                >
                  <span
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "8px",
                      background: `${action.color}1a`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                      flexShrink: 0,
                    }}
                  >
                    {action.icon}
                  </span>
                  <span
                    style={{
                      fontSize: "13px",
                      fontWeight: 500,
                      color: "var(--text-secondary)",
                    }}
                  >
                    {action.label}
                  </span>
                  <span style={{ marginLeft: "auto", color: "var(--text-muted)", fontSize: "14px" }}>
                    →
                  </span>
                </Link>
              ))}
            </div>

            {/* Tip Card */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(212,175,55,0.08), rgba(212,175,55,0.03))",
                border: "1px solid rgba(212,175,55,0.2)",
                borderRadius: "20px",
                padding: "24px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "-20px",
                  right: "-20px",
                  width: "120px",
                  height: "120px",
                  background: "radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)",
                  pointerEvents: "none",
                }}
              />
              <p style={{ fontSize: "24px", marginBottom: "10px" }}>💡</p>
              <h3
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#d4af37",
                  marginBottom: "8px",
                }}
              >
                Conseil du jour
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6 }}>
                Commandez vos fournitures 2 semaines avant la rentrée pour bénéficier de stock
                complet et d&apos;une livraison prioritaire.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
