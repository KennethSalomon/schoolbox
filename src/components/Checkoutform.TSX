"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "../lib/supabase/client";
import type { CartItem } from "./ProductCard";

type PaymentMethod = "mtn_money" | "moov_money" | "livraison";

interface CheckoutFormProps {
  items: CartItem[];
  schoolId: string;
  grade: string;
  onSuccess: (orderId: string) => void;
}

interface GeoPosition {
  lat: number;
  lng: number;
}

const formatFCFA = (n: number) =>
  new Intl.NumberFormat("fr-BJ", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(n);

const VILLES = [
  "Cotonou", "Porto-Novo", "Abomey-Calavi", "Parakou",
  "Bohicon", "Natitingou", "Ouidah", "Lokossa", "Kandi", "Djougou",
];

export default function CheckoutForm({
  items, schoolId, grade, onSuccess,
}: CheckoutFormProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Cotonou");
  const [district, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [geo, setGeo] = useState<GeoPosition | null>(null);
  const [geoStatus, setGeoStatus] = useState<"idle" | "loading" | "ok" | "denied">("idle");
  const [payMethod, setPayMethod] = useState<PaymentMethod>("mtn_money");
  const [mobileNumber, setMobileNumber] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [referralValid, setReferralValid] = useState<boolean | null>(null);
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const DELIVERY_FEE = 1500;
  const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
  const total = subtotal + DELIVERY_FEE - discount;

  const requestGeo = () => {
    if (!navigator.geolocation) return;
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus("ok");
      },
      () => setGeoStatus("denied"),
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const validateReferral = async () => {
    if (!referralCode.trim()) return;
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("referral_code", referralCode.trim().toUpperCase())
      .single();
    if (data) {
      setReferralValid(true);
      setDiscount(Math.round(subtotal * 0.05));
    } else {
      setReferralValid(false);
      setDiscount(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !phone || !district) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setLoading(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id ?? null;

      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .insert({
          user_id: userId,
          school_id: schoolId,
          grade,
          items: items.map((i) => ({
            product_id: i.product_id,
            name: i.name,
            tier: i.tier,
            qty: i.qty,
            unit_price: i.unit_price,
            subtotal: i.subtotal,
            payment_method: payMethod,
    payment_phone: mobileNumber || phone, // AJOUTEZ CETTE LIGNE ICI
    payment_status: "en_attente",
          })),
          subtotal,
          delivery_fee: DELIVERY_FEE,
          discount,
          total_price: total,
          payment_method: payMethod,
          payment_status: "en_attente",
          delivery_name: name,
          delivery_phone: phone,
          delivery_city: city,
          delivery_district: district,
          delivery_address: address,
          location_lat: geo?.lat ?? null,
          location_lng: geo?.lng ?? null,
          referral_code_used: referralValid ? referralCode.toUpperCase() : null,
          status: "en_attente",
        })
        .select("id, order_number")
        .single();

      if (orderErr) throw orderErr;
      onSuccess(order.id as string);
      router.push(`/commandes/${order.id}/confirmation`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    background: "#0d0d15",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    padding: "10px 14px",
    color: "#f0ece0",
    fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    width: "100%",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "0.06em",
    color: "rgba(255,255,255,0.5)",
    marginBottom: "6px",
  };

  const sectionStyle: React.CSSProperties = {
    background: "linear-gradient(145deg, #12121a, #1a1a26)",
    border: "1px solid rgba(212,175,55,0.12)",
    borderRadius: "16px",
    padding: "20px",
    marginBottom: "16px",
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase" as const,
    color: "rgba(212,175,55,0.7)",
    margin: "0 0 16px",
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      style={{
        maxWidth: "640px",
        margin: "0 auto",
        fontFamily: "'DM Sans', sans-serif",
        color: "#e8e8e8",
      }}
    >
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px", fontWeight: 700, color: "#f0ece0", margin: "0 0 24px" }}>
        Finaliser ma Box
      </h2>

      {/* Récapitulatif */}
      <section style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Récapitulatif</h3>
        {items.map((item) => (
          <div key={`${item.product_id}-${item.tier}`} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <span>
              {item.name}{" "}
              <span style={{ fontSize: "9px", padding: "1px 6px", borderRadius: "10px", background: item.tier === "premium" ? "rgba(212,175,55,0.2)" : "rgba(255,255,255,0.1)", color: item.tier === "premium" ? "#d4af37" : "rgba(255,255,255,0.5)", fontWeight: 700 }}>
                {item.tier}
              </span>
              {" "}×{item.qty}
            </span>
            <span style={{ fontFamily: "'DM Mono', monospace" }}>{formatFCFA(item.subtotal)}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "rgba(255,255,255,0.5)", padding: "4px 0" }}>
          <span>Livraison</span><span>{formatFCFA(DELIVERY_FEE)}</span>
        </div>
        {discount > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#4caf50", padding: "4px 0" }}>
            <span>Réduction parrainage (5%)</span><span>−{formatFCFA(discount)}</span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "16px", fontWeight: 700, color: "#f0ece0", borderTop: "1px solid rgba(255,255,255,0.1)", marginTop: "8px", paddingTop: "10px" }}>
          <span>Total</span>
          <span style={{ fontFamily: "'DM Mono', monospace", color: "#d4af37" }}>{formatFCFA(total)}</span>
        </div>
      </section>

      {/* Livraison */}
      <section style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Informations de livraison</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
          <div><label style={labelStyle}>Nom complet *</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Adjakou Kossi" required style={inputStyle} /></div>
          <div><label style={labelStyle}>Téléphone *</label><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+229 6X XXX XXX" required style={inputStyle} /></div>
          <div>
            <label style={labelStyle}>Ville *</label>
            <select value={city} onChange={(e) => setCity(e.target.value)} style={inputStyle}>
              {VILLES.map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div><label style={labelStyle}>Quartier *</label><input type="text" value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Ex: Akpakpa…" required style={inputStyle} /></div>
        </div>
        <div style={{ marginBottom: "12px" }}>
          <label style={labelStyle}>Description de la maison</label>
          <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Derrière l'église rouge, maison bleue…" rows={2} style={{ ...inputStyle, resize: "vertical" }} />
        </div>

        {/* Géoloc */}
        {geoStatus === "idle" && (
          <button type="button" onClick={requestGeo} style={{ padding: "8px 16px", borderRadius: "8px", border: "1px dashed rgba(212,175,55,0.4)", background: "transparent", color: "rgba(212,175,55,0.8)", fontSize: "13px", cursor: "pointer" }}>
            📍 Partager ma position GPS
          </button>
        )} 
        {geoStatus === "loading" && <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>Localisation en cours…</p>}
        {geoStatus === "ok" && <p style={{ fontSize: "12px", color: "#4caf50" }}>✓ Position capturée ({geo?.lat.toFixed(5)}, {geo?.lng.toFixed(5)})</p>}
        {geoStatus === "denied" && <p style={{ fontSize: "12px", color: "#ff7043" }}>Localisation refusée — remplissez l'adresse manuellement.</p>}
      </section>

      {/* Paiement */}
      <section style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Mode de paiement</h3>
        {(["mtn_money", "moov_money", "livraison"] as PaymentMethod[]).map((method) => {
          const labels: Record<PaymentMethod, string> = {
            mtn_money: "🟡 MTN Mobile Money",
            moov_money: "🔵 Moov Money",
            livraison: "🚚 Paiement à la livraison",
          };
          return (
            <div key={method} onClick={() => setPayMethod(method)} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", borderRadius: "12px", border: `1px solid ${payMethod === method ? "rgba(212,175,55,0.5)" : "rgba(255,255,255,0.08)"}`, background: payMethod === method ? "rgba(212,175,55,0.06)" : "#0d0d15", cursor: "pointer", marginBottom: "8px" }}>
              <span style={{ flex: 1, fontSize: "14px", fontWeight: 500 }}>{labels[method]}</span>
              {payMethod === method && <span style={{ color: "#d4af37", fontWeight: 700 }}>✓</span>}
            </div>
          );
        })}
        {(payMethod === "mtn_money" || payMethod === "moov_money") && (
          <div style={{ marginTop: "8px" }}>
            <label style={labelStyle}>Numéro {payMethod === "mtn_money" ? "MTN" : "Moov"} *</label>
            <input type="tel" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} placeholder="+229 6X XXX XXX" style={{ ...inputStyle, fontFamily: "'DM Mono', monospace" }} />
          </div>
        )}
      </section>

      {/* Parrainage */}
      <section style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Code de parrainage (optionnel)</h3>
        <div style={{ display: "flex", gap: "8px" }}>
          <input type="text" value={referralCode} onChange={(e) => { setReferralCode(e.target.value.toUpperCase()); setReferralValid(null); }} placeholder="Ex: AB12CD34" style={{ ...inputStyle, flex: 1, fontFamily: "'DM Mono', monospace", borderColor: referralValid === true ? "#4caf50" : referralValid === false ? "#ef5350" : undefined }} />
          <button type="button" onClick={validateReferral} style={{ padding: "10px 16px", borderRadius: "10px", border: "1px solid rgba(212,175,55,0.4)", background: "transparent", color: "#d4af37", fontSize: "13px", fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>
            Valider
          </button>
        </div>
        {referralValid === true && <p style={{ fontSize: "12px", color: "#4caf50", marginTop: "6px" }}>✓ Code valide ! −{formatFCFA(discount)} appliqué</p>}
        {referralValid === false && <p style={{ fontSize: "12px", color: "#ef5350", marginTop: "6px" }}>✗ Code invalide.</p>}
      </section>

      {error && (
        <p style={{ background: "rgba(239,83,80,0.1)", border: "1px solid rgba(239,83,80,0.3)", borderRadius: "10px", padding: "12px 16px", fontSize: "13px", color: "#ef9a9a", marginBottom: "16px" }}>
          {error}
        </p>
      )}

      <button type="submit" disabled={loading || items.length === 0} style={{ width: "100%", padding: "16px", borderRadius: "14px", border: "none", background: "linear-gradient(135deg, #d4af37, #b8860b)", color: "#0a0a0f", fontSize: "15px", fontWeight: 800, letterSpacing: "0.04em", cursor: loading ? "wait" : "pointer", opacity: loading || items.length === 0 ? 0.5 : 1 }}>
        {loading ? "Traitement…" : `Commander & Payer ${formatFCFA(total)} →`}
      </button>
    </form>
  );
}