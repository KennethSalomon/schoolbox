"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "../../lib/supabase/client";
import UserNav from "../../components/UserNav";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-BJ", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(n);

interface Profile {
  id: string;
  full_name: string;
  phone: string;
  city: string;
  child_name: string;
  child_grade: string;
  school_id: string;
  school_name?: string;
  referral_code: string;
}

interface Order {
  id: string;
  order_number?: string;
  created_at: string;
  status: string;
  total_price: number;
  delivery_city: string;
  items: Array<{ name: string; qty: number; tier: string }>;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string; step: number }> = {
  en_attente:   { label: "En attente",    color: "#f59e0b", icon: "⏳", step: 0 },
  confirme:     { label: "Confirmée",     color: "#3b82f6", icon: "✅", step: 1 },
  preparation:  { label: "Préparation",   color: "#8b5cf6", icon: "📦", step: 2 },
  en_livraison: { label: "En livraison",  color: "#06b6d4", icon: "🚚", step: 3 },
  livre:        { label: "Livré",         color: "#22c55e", icon: "🏠", step: 4 },
  annule:       { label: "Annulée",       color: "#ef4444", icon: "✗",  step: -1 },
};

const STEPS = ["En attente", "Confirmée", "Préparation", "En livraison", "Livré"];

const VILLES = [
  "Cotonou", "Porto-Novo", "Abomey-Calavi", "Parakou",
  "Bohicon", "Natitingou", "Ouidah", "Lokossa",
];

type Tab = "profil" | "commandes" | "parrainage";

export default function ProfilPage() {
  const supabase = createClientComponentClient();

  const [activeTab, setActiveTab] = useState<Tab>("profil");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Editable fields
  const [fullName, setFullName]     = useState("");
  const [phone, setPhone]           = useState("");
  const [city, setCity]             = useState("Cotonou");
  const [childName, setChildName]   = useState("");
  const [childGrade, setChildGrade] = useState("");
  const [schoolId, setSchoolId]     = useState("");

  useEffect(() => {
    const loadAll = async () => {
      const [{ data: schoolData }, { data: orderData }] = await Promise.all([
        supabase.from("schools").select("id, name").order("name"),
        supabase.from("orders")
          .select("id, order_number, created_at, status, total_price, delivery_city, items")
          .order("created_at", { ascending: false })
          .limit(20),
      ]);
      if (schoolData) setSchools(schoolData);
      if (orderData) setOrders(orderData as Order[]);

      // Simulated profile (in real app, fetch from `profiles` table)
      const mockProfile: Profile = {
        id: "user-001",
        full_name: "",
        phone: "",
        city: "Cotonou",
        child_name: "",
        child_grade: "",
        school_id: "",
        referral_code: "SB" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      };

      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authData.user.id)
          .single();
        if (profileData) {
          Object.assign(mockProfile, profileData);
        }
      }

      setProfile(mockProfile);
      setFullName(mockProfile.full_name || "");
      setPhone(mockProfile.phone || "");
      setCity(mockProfile.city || "Cotonou");
      setChildName(mockProfile.child_name || "");
      setChildGrade(mockProfile.child_grade || "");
      setSchoolId(mockProfile.school_id || "");
      setLoading(false);
    };
    loadAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { data: authData } = await supabase.auth.getUser();
    if (authData?.user) {
      await supabase.from("profiles").upsert({
        id: authData.user.id,
        full_name: fullName,
        phone,
        city,
        child_name: childName,
        child_grade: childGrade,
        school_id: schoolId,
        referral_code: profile?.referral_code,
        updated_at: new Date().toISOString(),
      });
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const inputStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    padding: "11px 14px",
    color: "var(--text-primary)",
    fontFamily: "var(--font-body)",
    fontSize: "14px",
    outline: "none",
    width: "100%",
    transition: "border-color 0.2s",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "var(--text-muted)",
    marginBottom: "7px",
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "profil",     label: "Mon profil",    icon: "👤" },
    { id: "commandes",  label: "Commandes",     icon: "🧾" },
    { id: "parrainage", label: "Parrainage",    icon: "🎁" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-base)" }}>
      <UserNav />

      <main
        style={{
          marginLeft: "var(--content-margin)",
          flex: 1,
          padding: "40px 48px",
          fontFamily: "var(--font-body)",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#d4af37", marginBottom: "6px" }}>
            ✦ Espace Personnel
          </p>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "28px", fontWeight: 800, color: "var(--text-primary)" }}>
            Mon Profil
          </h1>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: "4px",
            marginBottom: "32px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "14px",
            padding: "4px",
            width: "fit-content",
          }}
        >
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 20px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: 600,
                fontFamily: "var(--font-body)",
                transition: "all 0.2s",
                background: activeTab === tab.id
                  ? "linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.08))"
                  : "transparent",
                color: activeTab === tab.id ? "#f0ece0" : "var(--text-muted)",
                borderBottom: activeTab === tab.id ? "1px solid rgba(212,175,55,0.3)" : "1px solid transparent",
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: "grid", gap: "16px" }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ height: "60px", borderRadius: "12px", background: "rgba(255,255,255,0.04)", animation: "skeleton 1.5s ease-in-out infinite" }} />
            ))}
          </div>
        ) : (
          <>
            {/* ═══ TAB: PROFIL ═══ */}
            {activeTab === "profil" && (
              <div style={{ maxWidth: "640px", display: "flex", flexDirection: "column", gap: "20px" }}>
                
                {/* Parent Info */}
                <div
                  style={{
                    background: "linear-gradient(145deg, #12121e, #1a1a2e)",
                    border: "1px solid rgba(212,175,55,0.1)",
                    borderRadius: "20px",
                    padding: "28px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.08))", border: "1px solid rgba(212,175,55,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>
                      👤
                    </div>
                    <div>
                      <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                        Informations personnelles
                      </h2>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Vos coordonnées de contact</p>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={labelStyle}>Nom complet</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        placeholder="Ex: Koffi Adjakou"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Téléphone</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+229 6X XXX XXX"
                        style={{ ...inputStyle, fontFamily: "var(--font-mono)" }}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Ville</label>
                      <select value={city} onChange={e => setCity(e.target.value)} style={inputStyle}>
                        {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Child Info */}
                <div
                  style={{
                    background: "linear-gradient(145deg, #12121e, #1a1a2e)",
                    border: "1px solid rgba(212,175,55,0.1)",
                    borderRadius: "20px",
                    padding: "28px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
                    <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px" }}>
                      🎒
                    </div>
                    <div>
                      <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                        Informations de l&apos;enfant
                      </h2>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>Pour personnaliser les fournitures</p>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <label style={labelStyle}>Prénom de l&apos;enfant</label>
                      <input
                        type="text"
                        value={childName}
                        onChange={e => setChildName(e.target.value)}
                        placeholder="Ex: Ines"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Classe</label>
                      <input
                        type="text"
                        value={childGrade}
                        onChange={e => setChildGrade(e.target.value)}
                        placeholder="Ex: CM2, 6ème, Terminale…"
                        style={inputStyle}
                      />
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={labelStyle}>École</label>
                      <select value={schoolId} onChange={e => setSchoolId(e.target.value)} style={inputStyle}>
                        <option value="">Sélectionner une école…</option>
                        {schools.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    padding: "16px",
                    borderRadius: "14px",
                    background: saved
                      ? "rgba(34,197,94,0.15)"
                      : "linear-gradient(135deg, #d4af37, #b8860b)",
                    color: saved ? "#22c55e" : "#0a0a0f",
                    fontWeight: 800,
                    fontSize: "15px",
                    cursor: saving ? "wait" : "pointer",
                    opacity: saving ? 0.7 : 1,
                    border: saved ? "1px solid rgba(34,197,94,0.3)" : "1px solid transparent",
                    transition: "all 0.3s",
                    fontFamily: "var(--font-body)",
                    letterSpacing: "0.04em",
                    boxShadow: saved ? "none" : "0 4px 24px rgba(212,175,55,0.25)",
                  }}
                >
                  {saving ? "Enregistrement…" : saved ? "✓ Profil sauvegardé !" : "Enregistrer les modifications"}
                </button>
              </div>
            )}

            {/* ═══ TAB: COMMANDES ═══ */}
            {activeTab === "commandes" && (
              <div>
                {orders.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "80px 0" }}>
                    <p style={{ fontSize: "48px", marginBottom: "16px" }}>📭</p>
                    <p style={{ fontFamily: "var(--font-heading)", fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>Aucune commande</p>
                    <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Vous n&apos;avez pas encore passé de commande.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "800px" }}>
                    {orders.map(order => {
                      const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.en_attente;
                      const isExpanded = expandedOrder === order.id;
                      return (
                        <div
                          key={order.id}
                          style={{
                            background: "linear-gradient(145deg, #12121e, #1a1a2e)",
                            border: `1px solid ${isExpanded ? "rgba(212,175,55,0.25)" : "rgba(255,255,255,0.06)"}`,
                            borderRadius: "18px",
                            overflow: "hidden",
                            transition: "border-color 0.2s",
                          }}
                        >
                          {/* Order header */}
                          <button
                            onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                            style={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              gap: "16px",
                              padding: "18px 20px",
                              border: "none",
                              background: "transparent",
                              cursor: "pointer",
                              textAlign: "left",
                              fontFamily: "var(--font-body)",
                            }}
                          >
                            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: `${cfg.color}1a`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>
                              {cfg.icon}
                            </div>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
                                #{order.order_number ?? order.id.slice(0, 8).toUpperCase()}
                              </p>
                              <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                                {new Date(order.created_at).toLocaleDateString("fr-BJ", { day: "numeric", month: "long", year: "numeric" })} · {order.delivery_city}
                              </p>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <p style={{ fontFamily: "var(--font-mono)", fontSize: "16px", fontWeight: 700, color: "#d4af37", marginBottom: "4px" }}>
                                {fmt(order.total_price)}
                              </p>
                              <span style={{ fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "20px", background: `${cfg.color}22`, color: cfg.color }}>
                                {cfg.label}
                              </span>
                            </div>
                            <span style={{ color: "var(--text-muted)", fontSize: "18px", transition: "transform 0.2s", transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>
                              ⌄
                            </span>
                          </button>

                          {/* Expanded: Progress + Items */}
                          {isExpanded && cfg.step >= 0 && (
                            <div style={{ padding: "0 20px 20px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                              {/* Progress tracker */}
                              <div style={{ display: "flex", alignItems: "center", margin: "20px 0" }}>
                                {STEPS.map((step, idx) => {
                                  const done   = idx < cfg.step;
                                  const active = idx === cfg.step;
                                  return (
                                    <div key={step} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <div
                                          style={{
                                            width: "28px",
                                            height: "28px",
                                            borderRadius: "50%",
                                            background: done
                                              ? "linear-gradient(135deg, #22c55e, #16a34a)"
                                              : active
                                                ? "linear-gradient(135deg, #d4af37, #b8860b)"
                                                : "rgba(255,255,255,0.08)",
                                            border: "none",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "11px",
                                            fontWeight: 800,
                                            color: done || active ? "#fff" : "var(--text-muted)",
                                            boxShadow: active ? "0 0 12px rgba(212,175,55,0.4)" : "none",
                                            transition: "all 0.3s",
                                          }}
                                        >
                                          {done ? "✓" : idx + 1}
                                        </div>
                                        <span style={{ fontSize: "9px", color: active ? "#d4af37" : "var(--text-muted)", marginTop: "4px", textAlign: "center", whiteSpace: "nowrap", fontWeight: active ? 700 : 400 }}>
                                          {step}
                                        </span>
                                      </div>
                                      {idx < STEPS.length - 1 && (
                                        <div
                                          style={{
                                            flex: 1,
                                            height: "2px",
                                            background: idx < cfg.step
                                              ? "linear-gradient(90deg, #22c55e, #16a34a)"
                                              : "rgba(255,255,255,0.08)",
                                            margin: "0 4px",
                                            marginBottom: "20px",
                                            transition: "background 0.5s",
                                          }}
                                        />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Articles */}
                              {order.items && (
                                <>
                                  <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "10px" }}>
                                    Articles commandés
                                  </p>
                                  {order.items.map((item, idx) => (
                                    <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", fontSize: "13px" }}>
                                      <span style={{ color: "var(--text-secondary)" }}>
                                        {item.name} ×{item.qty}
                                      </span>
                                      <span
                                        style={{
                                          fontSize: "10px",
                                          padding: "2px 8px",
                                          borderRadius: "10px",
                                          background: item.tier === "premium" ? "rgba(212,175,55,0.15)" : "rgba(255,255,255,0.08)",
                                          color: item.tier === "premium" ? "#d4af37" : "var(--text-muted)",
                                          fontWeight: 700,
                                        }}
                                      >
                                        {item.tier}
                                      </span>
                                    </div>
                                  ))}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ═══ TAB: PARRAINAGE ═══ */}
            {activeTab === "parrainage" && (
              <div style={{ maxWidth: "560px" }}>
                <div
                  style={{
                    background: "linear-gradient(145deg, rgba(212,175,55,0.08), rgba(212,175,55,0.03))",
                    border: "1px solid rgba(212,175,55,0.2)",
                    borderRadius: "24px",
                    padding: "40px",
                    textAlign: "center",
                    position: "relative",
                    overflow: "hidden",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "-60px",
                      right: "-60px",
                      width: "200px",
                      height: "200px",
                      background: "radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)",
                    }}
                  />
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>🎁</div>
                  <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "22px", fontWeight: 800, color: "var(--text-primary)", marginBottom: "8px" }}>
                    Parrainez vos amis !
                  </h2>
                  <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "28px", lineHeight: 1.7 }}>
                    Partagez votre code unique. Vos amis bénéficient de <strong style={{ color: "#d4af37" }}>5% de réduction</strong> sur leur première commande, et vous gagnez des points fidélité.
                  </p>

                  {/* Code display */}
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "16px",
                      padding: "16px 28px",
                      borderRadius: "16px",
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid rgba(212,175,55,0.3)",
                      marginBottom: "20px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "26px",
                        fontWeight: 800,
                        color: "#d4af37",
                        letterSpacing: "0.12em",
                      }}
                    >
                      {profile?.referral_code ?? "—"}
                    </span>
                    <button
                      onClick={() => profile && navigator.clipboard.writeText(profile.referral_code)}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "10px",
                        border: "1px solid rgba(212,175,55,0.3)",
                        background: "rgba(212,175,55,0.1)",
                        color: "#d4af37",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "var(--font-body)",
                      }}
                    >
                      Copier
                    </button>
                  </div>

                  <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    Partagez ce code avec vos amis parents pour leur offrir une réduction.
                  </p>
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  {[
                    { label: "Filleuls inscrits", value: "0", icon: "👥", color: "#8b5cf6" },
                    { label: "Économies générées", value: "0 FCFA", icon: "💰", color: "#22c55e" },
                  ].map(s => (
                    <div
                      key={s.label}
                      style={{
                        background: "linear-gradient(145deg, #12121e, #1a1a2e)",
                        border: "1px solid rgba(212,175,55,0.1)",
                        borderRadius: "16px",
                        padding: "24px",
                        textAlign: "center",
                      }}
                    >
                      <div style={{ fontSize: "28px", marginBottom: "10px" }}>{s.icon}</div>
                      <p style={{ fontFamily: "var(--font-heading)", fontSize: "22px", fontWeight: 800, color: s.color, marginBottom: "4px" }}>
                        {s.value}
                      </p>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
