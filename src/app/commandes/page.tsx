"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClientComponentClient } from "../../lib/supabase/client";
import UserNav from "../../components/UserNav";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-BJ", { style: "currency", currency: "XOF", maximumFractionDigits: 0 }).format(n);

interface Order {
  id: string;
  order_number?: string;
  created_at: string;
  status: string;
  total_price: number;
  delivery_city: string;
  delivery_name: string;
  items: Array<{ name: string; qty: number; tier: string }>;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  en_attente:   { label: "En attente",   color: "#f59e0b", icon: "⏳" },
  confirme:     { label: "Confirmée",    color: "#3b82f6", icon: "✅" },
  preparation:  { label: "Préparation",  color: "#8b5cf6", icon: "📦" },
  en_livraison: { label: "En livraison", color: "#06b6d4", icon: "🚚" },
  livre:        { label: "Livré",        color: "#22c55e", icon: "🏠" },
  annule:       { label: "Annulée",      color: "#ef4444", icon: "✗"  },
};

const ALL_STATUSES = ["tous", "en_attente", "preparation", "en_livraison", "livre", "annule"];

export default function CommandesPage() {
  const supabase = createClientComponentClient();
  const [orders, setOrders]     = useState<Order[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("tous");
  const [search, setSearch]     = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      const { data } = await supabase
        .from("orders")
        .select("id, order_number, created_at, status, total_price, delivery_city, delivery_name, items")
        .order("created_at", { ascending: false });
      if (data) setOrders(data as Order[]);
      setLoading(false);
    };
    fetchOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = orders.filter((o) => {
    const matchStatus = filter === "tous" || o.status === filter;
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      (o.order_number ?? o.id).toLowerCase().includes(q) ||
      o.delivery_name.toLowerCase().includes(q) ||
      o.delivery_city.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-base)" }}>
      <UserNav />

      <main
        style={{
          marginLeft: "240px",
          flex: 1,
          padding: "40px 48px",
          fontFamily: "var(--font-body)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "32px" }}>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#d4af37", marginBottom: "6px" }}>
              ✦ Suivi
            </p>
            <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "28px", fontWeight: 800, color: "var(--text-primary)" }}>
              Mes Commandes
            </h1>
          </div>
          <Link
            href="/catalogue"
            style={{
              padding: "11px 22px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #d4af37, #b8860b)",
              color: "#0a0a0f",
              fontWeight: 800,
              fontSize: "13px",
              textDecoration: "none",
              boxShadow: "0 4px 16px rgba(212,175,55,0.25)",
            }}
          >
            + Nouvelle Box
          </Link>
        </div>

        {/* Search + Filter bar */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "28px", flexWrap: "wrap" }}>
          {/* Search */}
          <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
            <span
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "14px",
                color: "var(--text-muted)",
                pointerEvents: "none",
              }}
            >
              🔍
            </span>
            <input
              type="text"
              placeholder="Rechercher par numéro, nom, ville…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "11px 14px 11px 38px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
                color: "var(--text-primary)",
                fontFamily: "var(--font-body)",
                fontSize: "14px",
                outline: "none",
              }}
            />
          </div>

          {/* Status filter buttons */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {ALL_STATUSES.map((s) => {
              const cfg = s === "tous" ? { label: "Tous", color: "#d4af37" } : (STATUS_CONFIG[s] ?? { label: s, color: "#666" });
              const active = filter === s;
              return (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "20px",
                    border: `1px solid ${active ? `${cfg.color}55` : "rgba(255,255,255,0.08)"}`,
                    background: active ? `${cfg.color}15` : "transparent",
                    color: active ? cfg.color : "var(--text-muted)",
                    fontSize: "12px",
                    fontWeight: active ? 700 : 500,
                    cursor: "pointer",
                    fontFamily: "var(--font-body)",
                    transition: "all 0.2s",
                    letterSpacing: "0.02em",
                  }}
                >
                  {s !== "tous" && <span style={{ marginRight: "5px" }}>{(STATUS_CONFIG[s] ?? {}).icon}</span>}
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary count */}
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "16px" }}>
          {loading ? "Chargement…" : `${filtered.length} commande${filtered.length > 1 ? "s" : ""} trouvée${filtered.length > 1 ? "s" : ""}`}
        </p>

        {/* Orders list */}
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ height: "88px", borderRadius: "16px", background: "rgba(255,255,255,0.04)", animation: "skeleton 1.5s ease-in-out infinite" }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ fontSize: "48px", marginBottom: "16px" }}>📭</p>
            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
              {search || filter !== "tous" ? "Aucun résultat" : "Aucune commande"}
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
              {search || filter !== "tous"
                ? "Essayez d'autres critères de recherche."
                : "Composez votre première Box pour commencer !"}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {filtered.map((order) => {
              const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.en_attente;
              const itemCount = order.items?.reduce((s, i) => s + i.qty, 0) ?? 0;
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
                      padding: "20px 24px",
                      borderRadius: "18px",
                      background: "linear-gradient(145deg, #12121e, #1a1a2e)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      cursor: "pointer",
                      transition: "border-color 0.2s, transform 0.2s",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,175,55,0.25)";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)";
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    }}
                  >
                    {/* Status icon */}
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "12px",
                        background: `${cfg.color}15`,
                        border: `1px solid ${cfg.color}30`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "22px",
                        flexShrink: 0,
                      }}
                    >
                      {cfg.icon}
                    </div>

                    {/* Order info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <p style={{ fontFamily: "var(--font-mono)", fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                          #{order.order_number ?? order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: "20px",
                            background: `${cfg.color}18`,
                            color: cfg.color,
                            letterSpacing: "0.04em",
                          }}
                        >
                          {cfg.label}
                        </span>
                      </div>
                      <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                        {order.delivery_name} · {order.delivery_city} · {itemCount} article{itemCount > 1 ? "s" : ""}
                      </p>
                    </div>

                    {/* Amount + Date */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ fontFamily: "var(--font-mono)", fontSize: "17px", fontWeight: 800, color: "#d4af37", marginBottom: "4px" }}>
                        {fmt(order.total_price)}
                      </p>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        {new Date(order.created_at).toLocaleDateString("fr-BJ", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    <span style={{ color: "var(--text-muted)", fontSize: "20px", marginLeft: "8px" }}>›</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
