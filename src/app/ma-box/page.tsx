"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { createClientComponentClient } from "../../lib/supabase/client";
import UserNav from "../../components/UserNav";
import type { Tier } from "../../components/ProductCard";

const fmt = (n: number) =>
  new Intl.NumberFormat("fr-BJ", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(n);

interface BoxItem {
  product_id: string;
  name: string;
  category: string;
  tier: Tier;
  qty: number;
  unit_price: number;
  subtotal: number;
  image_url: string | null;
  price_standard: number;
  price_premium: number | null;
}

const DELIVERY_FEE = 1500;

export default function MaBoxPage() {
  const supabase = createClientComponentClient();
  const [items, setItems] = useState<BoxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [boxRef] = useState<React.RefObject<HTMLDivElement>>({ current: null });
  const svgBoxRef = useRef<SVGSVGElement>(null);
  const fillRef = useRef<SVGRectElement>(null);

  // Load draft from local storage (simulating a persisted cart)
  useEffect(() => {
    // Try fetching from a orders draft in Supabase or local storage
    const saved = localStorage.getItem("sb_box_draft");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {
        setItems([]);
      }
    }
    setLoading(false);
  }, []);

  // Persist to local storage
  useEffect(() => {
    localStorage.setItem("sb_box_draft", JSON.stringify(items));
  }, [items]);

  // Also try to fetch from Supabase (latest pending order items)
  useEffect(() => {
    const fetchDraft = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return;
      const { data } = await supabase
        .from("orders")
        .select("items")
        .eq("user_id", auth.user.id)
        .eq("status", "en_attente")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      if (data?.items && Array.isArray(data.items)) {
        setItems(data.items as BoxItem[]);
      }
    };
    fetchDraft();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalQty   = items.reduce((s, i) => s + i.qty, 0);
  const totalPrice = items.reduce((s, i) => s + i.subtotal, 0);
  const grandTotal = totalPrice + DELIVERY_FEE;
  const MAX_FILL   = 20;
  const fillPct    = Math.min((totalQty / MAX_FILL) * 100, 100);

  // Animate the SVG fill on item change
  useEffect(() => {
    if (fillRef.current) {
      const targetH = (fillPct / 100) * 58;
      gsap.to(fillRef.current, {
        attr: { y: 90 - targetH, height: targetH },
        duration: 0.8,
        ease: "elastic.out(1, 0.6)",
      });
    }
    if (svgBoxRef.current && totalQty > 0) {
      gsap.fromTo(svgBoxRef.current,
        { rotation: -3 },
        { rotation: 3, yoyo: true, repeat: 3, duration: 0.1, ease: "power1.inOut",
          onComplete: () => { gsap.set(svgBoxRef.current, { rotation: 0 }); } }
      );
    }
  }, [fillPct, totalQty]);

  const toggleTier = (productId: string) => {
    setItems(prev =>
      prev.map(item => {
        if (item.product_id !== productId) return item;
        const newTier: Tier = item.tier === "standard" ? "premium" : "standard";
        const newPrice =
          newTier === "standard"
            ? item.price_standard
            : (item.price_premium ?? item.price_standard);
        return {
          ...item,
          tier: newTier,
          unit_price: newPrice,
          subtotal: newPrice * item.qty,
        };
      })
    );
  };

  const updateQty = (productId: string, delta: number) => {
    setItems(prev =>
      prev
        .map(item => {
          if (item.product_id !== productId) return item;
          const newQty = Math.max(0, item.qty + delta);
          return {
            ...item,
            qty: newQty,
            subtotal: item.unit_price * newQty,
          };
        })
        .filter(item => item.qty > 0)
    );
  };

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(i => i.product_id !== productId));
  };

  const clearBox = () => {
    setItems([]);
    localStorage.removeItem("sb_box_draft");
  };

  // Group by category
  const categories = [...new Set(items.map(i => i.category))];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg-base)" }}>
      <UserNav />

      <main
        style={{
          marginLeft: "240px",
          flex: 1,
          fontFamily: "var(--font-body)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top Header */}
        <div
          style={{
            padding: "32px 48px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#d4af37", marginBottom: "6px" }}>
              ✦ Ma Box
            </p>
            <h1
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "28px",
                fontWeight: 800,
                color: "var(--text-primary)",
              }}
            >
              Votre Box scolaire
            </h1>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {items.length > 0 && (
              <button
                onClick={clearBox}
                style={{
                  padding: "10px 18px",
                  borderRadius: "10px",
                  border: "1px solid rgba(239,68,68,0.3)",
                  background: "rgba(239,68,68,0.08)",
                  color: "#ef4444",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Vider la Box
              </button>
            )}
            <Link
              href="/catalogue"
              style={{
                padding: "10px 20px",
                borderRadius: "10px",
                border: "1px solid rgba(212,175,55,0.3)",
                background: "rgba(212,175,55,0.08)",
                color: "#d4af37",
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              + Ajouter des articles
            </Link>
          </div>
        </div>

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Items List */}
          <div
            style={{
              flex: 1,
              padding: "32px 48px",
              overflowY: "auto",
            }}
          >
            {loading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} style={{ height: "80px", borderRadius: "16px", background: "rgba(255,255,255,0.04)", marginBottom: "12px", animation: "skeleton 1.5s ease-in-out infinite" }} />
              ))
            ) : items.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <div
                  ref={el => { if (el) { (boxRef as { current: HTMLDivElement | null }).current = el; } }}
                  style={{
                    width: "180px",
                    height: "180px",
                    margin: "0 auto 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    animation: "float 4s ease-in-out infinite",
                  }}
                >
                  <svg viewBox="0 0 120 120" width="180" height="180">
                    <ellipse cx="60" cy="112" rx="36" ry="6" fill="rgba(0,0,0,0.3)" />
                    <rect x="20" y="50" width="80" height="58" rx="4" fill="#1a1a2e" stroke="rgba(212,175,55,0.4)" strokeWidth="1.5" />
                    <path d="M20 50 Q25 24 60 28 Q95 24 100 50" fill="#12121e" stroke="rgba(212,175,55,0.4)" strokeWidth="1.5" />
                    <path d="M20 50 L36 30 L60 28" fill="#1a1a30" stroke="rgba(212,175,55,0.3)" strokeWidth="1" />
                    <path d="M100 50 L84 30 L60 28" fill="#1a1a30" stroke="rgba(212,175,55,0.3)" strokeWidth="1" />
                    <text x="60" y="84" textAnchor="middle" fontSize="12" fontWeight="900" fill="rgba(212,175,55,0.25)" fontFamily="serif">SB</text>
                    <text x="60" y="65" textAnchor="middle" fontSize="22">📭</text>
                  </svg>
                </div>
                <p style={{ fontFamily: "var(--font-heading)", fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
                  Votre box est vide
                </p>
                <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "24px" }}>
                  Parcourez le catalogue et ajoutez les fournitures de votre enfant.
                </p>
                <Link
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
                  Parcourir le catalogue →
                </Link>
              </div>
            ) : (
              <>
                {categories.map(cat => (
                  <div key={cat} style={{ marginBottom: "32px" }}>
                    <p
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "rgba(212,175,55,0.6)",
                        marginBottom: "12px",
                      }}
                    >
                      {cat}
                    </p>
                    {items
                      .filter(i => i.category === cat)
                      .map(item => (
                        <div
                          key={item.product_id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "16px",
                            padding: "16px 20px",
                            borderRadius: "16px",
                            background: "linear-gradient(145deg, #12121e, #1a1a2e)",
                            border: `1px solid ${item.tier === "premium" ? "rgba(212,175,55,0.2)" : "rgba(255,255,255,0.06)"}`,
                            marginBottom: "10px",
                            transition: "border-color 0.3s",
                          }}
                        >
                          {/* Image placeholder */}
                          <div
                            style={{
                              width: "52px",
                              height: "52px",
                              borderRadius: "12px",
                              background: "rgba(255,255,255,0.05)",
                              border: "1px solid rgba(255,255,255,0.08)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "24px",
                              flexShrink: 0,
                            }}
                          >
                            {item.image_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={item.image_url} alt={item.name} style={{ width: "40px", height: "40px", objectFit: "contain" }} />
                            ) : "📝"}
                          </div>

                          {/* Info */}
                          <div style={{ flex: 1 }}>
                            <p style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-primary)", marginBottom: "4px" }}>
                              {item.name}
                            </p>
                            {/* Tier Toggle */}
                            {item.price_premium && (
                              <div
                                style={{
                                  display: "inline-flex",
                                  borderRadius: "30px",
                                  background: "rgba(0,0,0,0.4)",
                                  padding: "2px",
                                  gap: "2px",
                                }}
                              >
                                {(["standard", "premium"] as Tier[]).map(t => (
                                  <button
                                    key={t}
                                    onClick={() => item.tier !== t && toggleTier(item.product_id)}
                                    style={{
                                      padding: "3px 10px",
                                      borderRadius: "20px",
                                      border: "none",
                                      fontSize: "11px",
                                      fontWeight: 700,
                                      cursor: "pointer",
                                      letterSpacing: "0.04em",
                                      background: item.tier === t
                                        ? t === "premium"
                                          ? "linear-gradient(135deg, #d4af37, #b8860b)"
                                          : "rgba(255,255,255,0.15)"
                                        : "transparent",
                                      color: item.tier === t
                                        ? t === "premium" ? "#0a0a0f" : "#fff"
                                        : "rgba(255,255,255,0.4)",
                                      transition: "all 0.2s",
                                    }}
                                  >
                                    {t === "premium" ? "✦ Premium" : "Standard"}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Qty controls */}
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <button
                              onClick={() => updateQty(item.product_id, -1)}
                              style={{ width: "30px", height: "30px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#d4af37", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            >
                              −
                            </button>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "14px", fontWeight: 700, width: "24px", textAlign: "center" }}>
                              {item.qty}
                            </span>
                            <button
                              onClick={() => updateQty(item.product_id, 1)}
                              style={{ width: "30px", height: "30px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#d4af37", fontSize: "16px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            >
                              +
                            </button>
                          </div>

                          {/* Price */}
                          <div style={{ textAlign: "right", minWidth: "100px" }}>
                            <p style={{ fontFamily: "var(--font-mono)", fontSize: "15px", fontWeight: 700, color: item.tier === "premium" ? "#d4af37" : "var(--text-primary)" }}>
                              {fmt(item.subtotal)}
                            </p>
                            <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                              {fmt(item.unit_price)} / u
                            </p>
                          </div>

                          {/* Remove */}
                          <button
                            onClick={() => removeItem(item.product_id)}
                            style={{ width: "28px", height: "28px", borderRadius: "8px", border: "none", background: "rgba(239,68,68,0.1)", color: "#ef4444", fontSize: "14px", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Right Panel — Visual Box + Summary */}
          <div
            style={{
              width: "320px",
              borderLeft: "1px solid rgba(255,255,255,0.05)",
              padding: "32px 28px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              overflowY: "auto",
            }}
          >
            {/* Interactive SVG Box */}
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(212,175,55,0.5)", marginBottom: "16px" }}>
                Aperçu de votre Box
              </p>
              <div
                style={{
                  position: "relative",
                  display: "inline-block",
                  filter: "drop-shadow(0 20px 40px rgba(212,175,55,0.15))",
                  animation: items.length > 0 ? "float 5s ease-in-out infinite" : "none",
                }}
              >
                <svg
                  ref={svgBoxRef}
                  viewBox="0 0 120 120"
                  width="200"
                  height="200"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Shadow */}
                  <ellipse cx="60" cy="114" rx="38" ry="6" fill="rgba(0,0,0,0.35)" />

                  {/* Box body */}
                  <rect x="20" y="50" width="80" height="60" rx="4" fill="#1a1a2e" stroke="rgba(212,175,55,0.5)" strokeWidth="1.5" />

                  {/* Fill indicator */}
                  <clipPath id="box-clip-large">
                    <rect x="21" y="51" width="78" height="58" rx="3" />
                  </clipPath>
                  <rect
                    ref={fillRef}
                    x="21"
                    y="109"
                    width="78"
                    height="0"
                    fill={`hsl(${Math.max(0, 120 - fillPct * 1.2)}, 70%, 45%)`}
                    opacity="0.4"
                    clipPath="url(#box-clip-large)"
                    style={{ transition: "fill 0.5s" }}
                  />

                  {/* Lid */}
                  <path d="M20 50 Q25 24 60 28 Q95 24 100 50" fill="#12121e" stroke="rgba(212,175,55,0.5)" strokeWidth="1.5" />
                  <path d="M20 50 L36 30 L60 28" fill="#181828" stroke="rgba(212,175,55,0.35)" strokeWidth="1" />
                  <path d="M100 50 L84 30 L60 28" fill="#181828" stroke="rgba(212,175,55,0.35)" strokeWidth="1" />

                  {/* Center stripe */}
                  <rect x="56" y="50" width="8" height="60" fill="rgba(212,175,55,0.12)" />

                  {/* Logo */}
                  <text x="60" y="86" textAnchor="middle" fontSize="11" fontWeight="900" fill="rgba(212,175,55,0.35)" fontFamily="serif">SB</text>

                  {/* Item count badge */}
                  {totalQty > 0 && (
                    <>
                      <circle cx="96" cy="46" r="12" fill="#d4af37" />
                      <text x="96" y="50" textAnchor="middle" fontSize="10" fontWeight="900" fill="#0a0a0f" fontFamily="sans-serif">{totalQty}</text>
                    </>
                  )}
                </svg>
              </div>

              {/* Fill progress bar */}
              {items.length > 0 && (
                <div style={{ marginTop: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px" }}>
                    <span>Remplissage</span>
                    <span style={{ color: "#d4af37", fontWeight: 700 }}>{Math.round(fillPct)}%</span>
                  </div>
                  <div style={{ height: "4px", background: "rgba(255,255,255,0.08)", borderRadius: "2px", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${fillPct}%`,
                        background: "linear-gradient(90deg, #d4af37, #f0d060)",
                        borderRadius: "2px",
                        transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Price Summary */}
            {items.length > 0 && (
              <>
                <div
                  style={{
                    background: "linear-gradient(145deg, #12121e, #1a1a2e)",
                    border: "1px solid rgba(212,175,55,0.1)",
                    borderRadius: "16px",
                    padding: "20px",
                  }}
                >
                  <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>
                    Récapitulatif
                  </h3>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "var(--text-muted)", marginBottom: "8px" }}>
                    <span>Articles ({totalQty})</span>
                    <span style={{ fontFamily: "var(--font-mono)" }}>{fmt(totalPrice)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "var(--text-muted)", paddingBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <span>Livraison</span>
                    <span style={{ fontFamily: "var(--font-mono)" }}>{fmt(DELIVERY_FEE)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px" }}>
                    <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>Total</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "20px", fontWeight: 800, color: "#d4af37" }}>
                      {fmt(grandTotal)}
                    </span>
                  </div>
                </div>

                <Link
                  href="/commande"
                  style={{
                    display: "block",
                    padding: "16px",
                    borderRadius: "14px",
                    background: "linear-gradient(135deg, #d4af37, #b8860b)",
                    color: "#0a0a0f",
                    fontWeight: 800,
                    fontSize: "15px",
                    textDecoration: "none",
                    textAlign: "center",
                    letterSpacing: "0.04em",
                    boxShadow: "0 8px 32px rgba(212,175,55,0.3)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(212,175,55,0.4)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(212,175,55,0.3)";
                  }}
                >
                  Valider ma Box → {fmt(grandTotal)}
                </Link>

                <p style={{ fontSize: "11px", color: "var(--text-muted)", textAlign: "center", lineHeight: 1.6 }}>
                  🔒 Paiement sécurisé · MTN Money · Moov Money · Livraison
                </p>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
