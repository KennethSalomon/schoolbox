"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@/lib/supabase/client";

type OrderStatus =
  | "en_attente"
  | "confirmée"
  | "en_préparation"
  | "en_livraison"
  | "livré"
  | "annulée";

interface OrderItem {
  product_id: string;
  name: string;
  tier: string;
  qty: number;
  subtotal: number;
}

interface Order {
  id: string;
  order_number: string;
  created_at: string;
  delivery_name: string;
  delivery_phone: string;
  delivery_city: string;
  delivery_district: string;
  delivery_address?: string;
  grade: string;
  items: OrderItem[];
  total_price: number;
  payment_method: string;
  payment_status: string;
  status: OrderStatus;
  location_lat?: number | null;
  location_lng?: number | null;
  schools?: { name: string };
  profiles?: { full_name: string; email: string };
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; next?: OrderStatus }> = {
  en_attente:     { label: "En attente",              color: "#ff9800", next: "confirmée" },
  confirmée:      { label: "Confirmée",               color: "#2196f3", next: "en_préparation" },
  en_préparation: { label: "En préparation",          color: "#9c27b0", next: "en_livraison" },
  en_livraison:   { label: "En cours de livraison",   color: "#03a9f4", next: "livré" },
  livré:          { label: "Livré",                   color: "#4caf50" },
  annulée:        { label: "Annulée",                 color: "#ef5350" },
};

const formatFCFA = (n: number) =>
  new Intl.NumberFormat("fr-BJ", { style: "currency", currency: "XOF", maximumFractionDigits: 0 }).format(n);

const formatDate = (d: string) =>
  new Intl.DateTimeFormat("fr-BJ", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(d));

export default function OrdersDashboard() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login"); return; }
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if ((data as { role?: string } | null)?.role !== "admin") {
        router.push("/");
      }
    };
    checkAdmin();
  }, [supabase, router]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("orders")
      .select("*, schools(name), profiles(full_name, email)")
      .order("created_at", { ascending: false });

    if (filterStatus !== "all") {
      query = query.eq("status", filterStatus);
    }

    const { data, error } = await query;
    if (!error && data) setOrders(data as Order[]);
    setLoading(false);
  }, [filterStatus, supabase]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  useEffect(() => {
    const channel = supabase
      .channel("orders-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, fetchOrders)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchOrders, supabase]);

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    await supabase.from("order_status_history").insert({ order_id: orderId, status: newStatus });
    await fetchOrders();
    setUpdatingId(null);
    if (selectedOrder?.id === orderId) {
      setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const stats = {
    total: orders.length,
    revenue: orders.filter((o) => o.payment_status === "payé").reduce((s, o) => s + o.total_price, 0),
    pending: orders.filter((o) => o.status === "en_attente").length,
    inDelivery: orders.filter((o) => o.status === "en_livraison").length,
  };

  const displayed = orders.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o.order_number.toLowerCase().includes(q) ||
      o.delivery_name.toLowerCase().includes(q) ||
      o.delivery_phone.includes(q)
    );
  });

  const cellStyle: React.CSSProperties = { padding: "12px 14px", fontSize: "13px", verticalAlign: "middle" };

  return (
    <div style={{ minHeight: "100vh", background: "#080810", padding: "24px", fontFamily: "'DM Sans', sans-serif", color: "#e8e8e8" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", color: "#f0ece0", margin: "0 0 4px" }}>Admin Dashboard</h1>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", margin: 0 }}>Gestion des commandes School Box</p>
        </div>
        <button onClick={fetchOrders} disabled={loading} style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid rgba(212,175,55,0.3)", background: "transparent", color: "#d4af37", fontSize: "13px", cursor: "pointer" }}>
          {loading ? "…" : "↻ Actualiser"}
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
        {[
          { label: "Commandes", value: stats.total },
          { label: "Chiffre d'affaires", value: formatFCFA(stats.revenue) },
          { label: "En attente", value: stats.pending },
          { label: "En livraison", value: stats.inDelivery },
        ].map((k) => (
          <div key={k.label} style={{ background: "linear-gradient(145deg,#12121a,#1a1a26)", border: "1px solid rgba(212,175,55,0.12)", borderRadius: "12px", padding: "16px" }}>
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.4)", margin: "0 0 6px" }}>{k.label}</p>
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "22px", fontWeight: 700, color: "#d4af37", margin: 0 }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" as const }}>
        <input type="search" placeholder="🔍 Rechercher commande, nom…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1, minWidth: "200px", background: "#12121a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "9px 14px", color: "#e8e8e8", fontSize: "13px", outline: "none" }} />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as OrderStatus | "all")} style={{ background: "#12121a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "9px 14px", color: "#e8e8e8", fontSize: "13px", outline: "none" }}>
          <option value="all">Tous les statuts</option>
          {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Tableau */}
      <div style={{ overflowX: "auto", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.06)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["N° Commande", "Date", "Client", "Ville", "Total", "Paiement", "Statut", "Actions"].map((h) => (
                <th key={h} style={{ background: "#0d0d15", padding: "12px 14px", textAlign: "left", fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "rgba(212,175,55,0.6)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.3)" }}>Chargement…</td></tr>
            )}
            {!loading && displayed.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.3)" }}>Aucune commande trouvée.</td></tr>
            )}
            {displayed.map((order) => {
              const cfg = STATUS_CONFIG[order.status];
              const nextStatus = cfg.next;
              return (
                <tr key={order.id} onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", background: selectedOrder?.id === order.id ? "rgba(212,175,55,0.04)" : "transparent" }}>
                  <td style={cellStyle}><span style={{ fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "#d4af37" }}>{order.order_number}</span></td>
                  <td style={{ ...cellStyle, fontSize: "12px", color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>{formatDate(order.created_at)}</td>
                  <td style={cellStyle}>
                    <p style={{ fontWeight: 600, margin: "0 0 2px" }}>{order.delivery_name}</p>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", margin: 0 }}>{order.delivery_phone}</p>
                  </td>
                  <td style={cellStyle}>
                    <p style={{ fontWeight: 500, margin: "0 0 2px" }}>{order.delivery_city}</p>
                    <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", margin: 0 }}>{order.delivery_district}</p>
                  </td>
                  <td style={cellStyle}><span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, color: "#d4af37" }}>{formatFCFA(order.total_price)}</span></td>
                  <td style={cellStyle}><span style={{ padding: "2px 8px", borderRadius: "10px", fontSize: "11px", fontWeight: 600, background: order.payment_status === "payé" ? "rgba(76,175,80,0.15)" : "rgba(255,255,255,0.08)", color: order.payment_status === "payé" ? "#4caf50" : "rgba(255,255,255,0.6)" }}>{order.payment_method === "livraison" ? "À la livraison" : order.payment_status}</span></td>
                  <td style={cellStyle}><span style={{ padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 600, background: cfg.color + "22", color: cfg.color, border: `1px solid ${cfg.color}44`, whiteSpace: "nowrap" }}>{cfg.label}</span></td>
                  <td style={cellStyle} onClick={(e) => e.stopPropagation()}>
                    {nextStatus && (
                      <button disabled={updatingId === order.id} onClick={() => updateStatus(order.id, nextStatus)} style={{ padding: "5px 10px", borderRadius: "7px", border: "1px solid rgba(212,175,55,0.3)", background: "transparent", color: "#d4af37", fontSize: "11px", fontWeight: 600, cursor: "pointer", marginRight: "4px", whiteSpace: "nowrap" }}>
                        {updatingId === order.id ? "…" : `→ ${STATUS_CONFIG[nextStatus].label}`}
                      </button>
                    )}
                    {order.status !== "annulée" && order.status !== "livré" && (
                      <button disabled={updatingId === order.id} onClick={() => updateStatus(order.id, "annulée")} style={{ padding: "5px 8px", borderRadius: "7px", border: "1px solid rgba(239,83,80,0.3)", background: "transparent", color: "#ef5350", fontSize: "11px", cursor: "pointer" }}>✕</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Panneau détail */}
      {selectedOrder && (
        <div style={{ position: "fixed", right: 0, top: 0, bottom: 0, width: "360px", background: "#0f0f1a", borderLeft: "1px solid rgba(212,175,55,0.15)", zIndex: 1000, overflowY: "auto", boxShadow: "-10px 0 40px rgba(0,0,0,0.5)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "sticky", top: 0, background: "#0f0f1a", zIndex: 1 }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "18px", color: "#f0ece0", margin: 0 }}>Commande {selectedOrder.order_number}</h3>
            <button onClick={() => setSelectedOrder(null)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: "18px", cursor: "pointer" }}>✕</button>
          </div>
          <div style={{ padding: "20px" }}>
            <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "rgba(212,175,55,0.6)", margin: "0 0 12px" }}>Articles</p>
            {selectedOrder.items?.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: "13px" }}>
                <span style={{ flex: 1 }}>{item.name} <span style={{ fontSize: "9px", padding: "1px 5px", borderRadius: "8px", background: item.tier === "premium" ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.1)", color: item.tier === "premium" ? "#d4af37" : "rgba(255,255,255,0.4)", fontWeight: 700 }}>{item.tier}</span></span>
                <span>×{item.qty}</span>
                <span style={{ fontFamily: "'DM Mono', monospace" }}>{formatFCFA(item.subtotal)}</span>
              </div>
            ))}
            <p style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, color: "#d4af37", textAlign: "right", marginTop: "10px" }}>Total : {formatFCFA(selectedOrder.total_price)}</p>
            {selectedOrder.location_lat && selectedOrder.location_lng && (
              <div style={{ marginTop: "20px" }}>
                <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "rgba(212,175,55,0.6)", margin: "0 0 8px" }}>Coordonnées GPS</p>
                <a href={`https://maps.google.com/?q=${selectedOrder.location_lat},${selectedOrder.location_lng}`} target="_blank" rel="noopener noreferrer" style={{ color: "#4fc3f7", fontSize: "13px" }}>📍 Voir sur Google Maps</a>
              </div>
            )}
          </div>
        </div>
      )}
      
    </div>

  );

}