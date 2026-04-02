"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "../../lib/supabase/client";

type Mode = "login" | "signup";

export default function AuthPage() {
  const supabase = createClientComponentClient();
  const router   = useRouter();

  const [mode, setMode]       = useState<Mode>("login");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (mode === "login") {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        router.push("/dashboard");
      } else {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });
        if (err) throw err;
        setSuccess("Compte créé ! Vérifiez votre email pour confirmer votre inscription.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Une erreur est survenue.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "13px 16px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    color: "#f0ece0",
    fontFamily: "var(--font-body)",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-base)",
        display: "flex",
        fontFamily: "var(--font-body)",
        overflow: "hidden",
      }}
    >
      {/* Left decorative panel */}
      <div
        style={{
          flex: 1,
          background: "linear-gradient(145deg, #0d0d1a 0%, #12121e 100%)",
          borderRight: "1px solid rgba(212,175,55,0.1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow orbs */}
        <div style={{ position: "absolute", top: "20%", left: "30%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "20%", right: "20%", width: "200px", height: "200px", background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

        {/* Logo */}
        <div style={{ marginBottom: "48px", textAlign: "center" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              background: "linear-gradient(135deg, #d4af37, #b8860b)",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-heading)",
              fontWeight: 900,
              fontSize: "24px",
              color: "#0a0a0f",
              margin: "0 auto 16px",
              boxShadow: "0 0 40px rgba(212,175,55,0.3), 0 8px 32px rgba(0,0,0,0.4)",
              animation: "float 5s ease-in-out infinite",
            }}
          >
            SB
          </div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "32px", fontWeight: 800, color: "#f0ece0", margin: 0 }}>
            School<span style={{ color: "#d4af37" }}>Box</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", marginTop: "6px" }}>Bénin</p>
        </div>

        {/* Feature points */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "340px" }}>
          {[
            { icon: "📦", text: "Composez la box scolaire de votre enfant en quelques clics" },
            { icon: "🚚", text: "Livraison en 24-48h à Cotonou, Porto-Novo et tout le Bénin" },
            { icon: "💳", text: "Paiement par MTN Money, Moov Money ou à la livraison" },
            { icon: "✦",  text: "Accès Standard ou Premium selon votre budget" },
          ].map((f) => (
            <div key={f.text} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "rgba(212,175,55,0.08)",
                  border: "1px solid rgba(212,175,55,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  flexShrink: 0,
                }}
              >
                {f.icon}
              </div>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", lineHeight: 1.6, margin: 0, paddingTop: "6px" }}>
                {f.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Form panel */}
      <div
        style={{
          width: "480px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 48px",
        }}
      >
        {/* Mode switcher */}
        <div
          style={{
            display: "flex",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            padding: "4px",
            marginBottom: "36px",
            width: "100%",
          }}
        >
          {(["login", "signup"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); setSuccess(""); }}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: 600,
                fontFamily: "var(--font-body)",
                transition: "all 0.2s",
                background:
                  mode === m
                    ? "linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.08))"
                    : "transparent",
                color: mode === m ? "#f0ece0" : "rgba(255,255,255,0.4)",
                borderBottom: mode === m ? "1px solid rgba(212,175,55,0.3)" : "1px solid transparent",
              }}
            >
              {m === "login" ? "Connexion" : "Inscription"}
            </button>
          ))}
        </div>

        {/* Heading */}
        <div style={{ textAlign: "center", marginBottom: "32px", width: "100%" }}>
          <h2
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "24px",
              fontWeight: 800,
              color: "#f0ece0",
              marginBottom: "8px",
            }}
          >
            {mode === "login" ? "Bon retour 👋" : "Créer un compte"}
          </h2>
          <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.4)" }}>
            {mode === "login"
              ? "Connectez-vous pour accéder à votre espace parent"
              : "Rejoignez SchoolBox et simplifiez la rentrée"}
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}
        >
          {mode === "signup" && (
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "7px" }}>
                Nom complet
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ex: Koffi Adjakou"
                required
                style={inputStyle}
                onFocus={(e) => {
                  (e.target as HTMLInputElement).style.borderColor = "rgba(212,175,55,0.5)";
                  (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(212,175,55,0.08)";
                }}
                onBlur={(e) => {
                  (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.1)";
                  (e.target as HTMLInputElement).style.boxShadow = "none";
                }}
              />
            </div>
          )}

          <div>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: "7px" }}>
              Adresse email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              required
              style={inputStyle}
              onFocus={(e) => {
                (e.target as HTMLInputElement).style.borderColor = "rgba(212,175,55,0.5)";
                (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(212,175,55,0.08)";
              }}
              onBlur={(e) => {
                (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.1)";
                (e.target as HTMLInputElement).style.boxShadow = "none";
              }}
            />
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "7px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>
                Mot de passe
              </label>
              {mode === "login" && (
                <span style={{ fontSize: "12px", color: "#d4af37", cursor: "pointer" }}>
                  Oublié ?
                </span>
              )}
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "login" ? "••••••••" : "8 caractères minimum"}
              required
              style={inputStyle}
              onFocus={(e) => {
                (e.target as HTMLInputElement).style.borderColor = "rgba(212,175,55,0.5)";
                (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(212,175,55,0.08)";
              }}
              onBlur={(e) => {
                (e.target as HTMLInputElement).style.borderColor = "rgba(255,255,255,0.1)";
                (e.target as HTMLInputElement).style.boxShadow = "none";
              }}
            />
          </div>

          {/* Messages */}
          {error && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "10px",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
                color: "#fca5a5",
                fontSize: "13px",
                lineHeight: 1.5,
              }}
            >
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div
              style={{
                padding: "12px 16px",
                borderRadius: "10px",
                background: "rgba(34,197,94,0.1)",
                border: "1px solid rgba(34,197,94,0.2)",
                color: "#86efac",
                fontSize: "13px",
                lineHeight: 1.5,
              }}
            >
              ✅ {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "15px",
              borderRadius: "14px",
              border: "none",
              background: "linear-gradient(135deg, #d4af37, #b8860b)",
              color: "#0a0a0f",
              fontWeight: 800,
              fontSize: "15px",
              cursor: loading ? "wait" : "pointer",
              opacity: loading ? 0.7 : 1,
              letterSpacing: "0.04em",
              boxShadow: "0 4px 24px rgba(212,175,55,0.3)",
              transition: "transform 0.2s, box-shadow 0.2s",
              fontFamily: "var(--font-body)",
            }}
          >
            {loading
              ? "Traitement…"
              : mode === "login"
                ? "Se connecter →"
                : "Créer mon compte →"}
          </button>
        </form>

        <p style={{ marginTop: "24px", fontSize: "13px", color: "rgba(255,255,255,0.3)", textAlign: "center" }}>
          En continuant, vous acceptez nos{" "}
          <span style={{ color: "#d4af37", cursor: "pointer" }}>Conditions d&apos;utilisation</span>.
        </p>

        <div style={{ marginTop: "32px", textAlign: "center" }}>
          <a
            href="/"
            style={{ fontSize: "12px", color: "rgba(255,255,255,0.25)", textDecoration: "none" }}
          >
            ← Retour au site
          </a>
        </div>
      </div>
    </div>
  );
}
