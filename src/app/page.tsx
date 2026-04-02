import Link from "next/link";

export default function Home() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "#080810",
      fontFamily: "var(--font-geist-sans), 'DM Sans', sans-serif",
      color: "#e8e8e8",
      overflowX: "hidden",
    }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 40px",
        background: "rgba(8,8,16,0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(212,175,55,0.1)",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "36px", height: "36px",
            background: "linear-gradient(135deg, #d4af37, #b8860b)",
            borderRadius: "8px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 900, fontSize: "15px", color: "#0a0a0f",
            fontFamily: "var(--font-heading)",
            boxShadow: "0 0 16px rgba(212,175,55,0.25)",
          }}>SB</div>
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "18px", color: "#f0ece0", letterSpacing: "-0.02em" }}>
            School<span style={{ color: "#d4af37" }}>Box</span>
          </span>
        </div>

        {/* Nav links */}
        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          {[
            { href: "/catalogue",  label: "Catalogue" },
            { href: "/dashboard",  label: "Mon Espace" },
            { href: "/ma-box",     label: "Ma Box" },
            { href: "/commandes",  label: "Commandes" },
          ].map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                color: "rgba(255,255,255,0.55)",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: 500,
                padding: "8px 14px",
                borderRadius: "8px",
                transition: "color 0.2s, background 0.2s",
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right CTAs */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Link href="/auth" style={{
            padding: "9px 18px", borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.04)",
            color: "rgba(255,255,255,0.7)", fontWeight: 600, fontSize: "13px",
            textDecoration: "none",
          }}>Connexion</Link>
          <Link href="/catalogue" style={{
            padding: "9px 20px", borderRadius: "10px",
            background: "linear-gradient(135deg, #d4af37, #b8860b)",
            color: "#0a0a0f", fontWeight: 800, fontSize: "13px",
            textDecoration: "none", letterSpacing: "0.02em",
            boxShadow: "0 4px 16px rgba(212,175,55,0.3)",
          }}>Commander →</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: "100vh",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "120px 24px 80px",
        position: "relative",
      }}>
        {/* Glow background */}
        <div style={{
          position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, -50%)",
          width: "600px", height: "600px",
          background: "radial-gradient(circle, rgba(212,175,55,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          padding: "6px 14px", borderRadius: "20px",
          border: "1px solid rgba(212,175,55,0.3)",
          background: "rgba(212,175,55,0.06)",
          fontSize: "12px", fontWeight: 600, color: "#d4af37",
          letterSpacing: "0.08em", textTransform: "uppercase",
          marginBottom: "28px",
        }}>✦ Rentrée scolaire au Bénin</div>

        <h1 style={{
          fontSize: "clamp(42px, 7vw, 80px)",
          fontWeight: 800,
          lineHeight: 1.08,
          color: "#f0ece0",
          margin: "0 0 24px",
          letterSpacing: "-0.03em",
          maxWidth: "800px",
        }}>
          La box scolaire<br />
          <span style={{
            background: "linear-gradient(135deg, #d4af37 0%, #f0d060 50%, #b8860b 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>livrée chez vous</span>
        </h1>

        <p style={{
          fontSize: "18px", color: "rgba(255,255,255,0.5)",
          maxWidth: "520px", lineHeight: 1.7,
          margin: "0 auto 44px",
        }}>
          Commandez tous les fournitures scolaires de votre enfant en ligne.
          Livraison rapide à Cotonou, Porto-Novo et partout au Bénin.
        </p>

        <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/catalogue" style={{
            padding: "16px 36px", borderRadius: "14px",
            background: "linear-gradient(135deg, #d4af37, #b8860b)",
            color: "#0a0a0f", fontWeight: 800, fontSize: "15px",
            textDecoration: "none", letterSpacing: "0.02em",
            boxShadow: "0 8px 32px rgba(212,175,55,0.3)",
          }}>Composer ma Box →</Link>
          <Link href="#how" style={{
            padding: "16px 36px", borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#e8e8e8", fontWeight: 600, fontSize: "15px",
            textDecoration: "none",
            background: "rgba(255,255,255,0.04)",
          }}>Comment ça marche</Link>
        </div>

        {/* Stats */}
        <div style={{
          display: "flex", gap: "48px", marginTop: "72px",
          padding: "24px 48px",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "16px",
        }}>
          {[
            { value: "500+", label: "Élèves servis" },
            { value: "48h", label: "Délai de livraison" },
            { value: "100%", label: "Satisfaction garantie" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "#d4af37", fontFamily: "var(--font-geist-mono), monospace" }}>{s.value}</div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginTop: "4px", letterSpacing: "0.04em" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how" style={{ padding: "100px 24px", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.12em", color: "#d4af37", textTransform: "uppercase", marginBottom: "12px" }}>Simple & rapide</p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#f0ece0", margin: 0, letterSpacing: "-0.02em" }}>
            3 étapes, c'est tout
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
          {[
            {
              num: "01",
              icon: "🏫",
              title: "Choisissez votre école",
              desc: "Sélectionnez l'école et la classe de votre enfant. La liste des fournitures requises est automatiquement chargée.",
            },
            {
              num: "02",
              icon: "📦",
              title: "Composez votre Box",
              desc: "Choisissez entre les versions Standard et Premium pour chaque article. Ajoutez tout à votre box en un clic.",
            },
            {
              num: "03",
              icon: "🚚",
              title: "Recevez à domicile",
              desc: "Payez via MTN Money, Moov Money ou à la livraison. Votre Box arrive en 24 à 48h partout au Bénin.",
            },
          ].map(step => (
            <div key={step.num} style={{
              padding: "32px",
              background: "linear-gradient(145deg, #12121a, #1a1a26)",
              border: "1px solid rgba(212,175,55,0.1)",
              borderRadius: "20px",
              position: "relative",
              overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: "20px", right: "24px",
                fontSize: "48px", fontWeight: 900, color: "rgba(212,175,55,0.06)",
                fontFamily: "serif", lineHeight: 1,
              }}>{step.num}</div>
              <div style={{ fontSize: "36px", marginBottom: "20px" }}>{step.icon}</div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#f0ece0", margin: "0 0 10px", letterSpacing: "-0.01em" }}>{step.title}</h3>
              <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: 0 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TIERS ── */}
      <section style={{ padding: "80px 24px", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px",
        }}>
          {/* Standard */}
          <div style={{
            padding: "40px",
            background: "linear-gradient(145deg, #12121a, #1a1a26)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px",
          }}>
            <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", textTransform: "uppercase", marginBottom: "12px" }}>Standard</div>
            <h3 style={{ fontSize: "28px", fontWeight: 800, color: "#f0ece0", margin: "0 0 16px" }}>L'essentiel</h3>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: "24px" }}>
              Toutes les fournitures nécessaires pour une rentrée réussie, à prix accessible.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {["Fournitures de qualité", "Prix optimisés", "Disponible immédiatement", "Livraison incluse"].map(f => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "rgba(255,255,255,0.6)" }}>
                  <span style={{ color: "#4caf50", fontWeight: 700 }}>✓</span> {f}
                </div>
              ))}
            </div>
          </div>

          {/* Premium */}
          <div style={{
            padding: "40px",
            background: "linear-gradient(145deg, #1a1508, #2a2010)",
            border: "1px solid rgba(212,175,55,0.3)",
            borderRadius: "20px",
            position: "relative",
          }}>
            <div style={{
              position: "absolute", top: "20px", right: "20px",
              background: "linear-gradient(135deg, #d4af37, #b8860b)",
              color: "#0a0a0f", fontSize: "10px", fontWeight: 800,
              letterSpacing: "0.06em", textTransform: "uppercase",
              padding: "4px 10px", borderRadius: "20px",
            }}>Recommandé</div>
            <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", color: "#d4af37", textTransform: "uppercase", marginBottom: "12px" }}>✦ Premium</div>
            <h3 style={{ fontSize: "28px", fontWeight: 800, color: "#f0ece0", margin: "0 0 16px" }}>Le meilleur</h3>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: "24px" }}>
              Les meilleures marques et matériaux pour une expérience scolaire exceptionnelle.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {["Marques premium sélectionnées", "Durabilité garantie", "Emballage soigné", "Support prioritaire"].map(f => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "rgba(255,255,255,0.7)" }}>
                  <span style={{ color: "#d4af37", fontWeight: 700 }}>✦</span> {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        padding: "100px 24px",
        textAlign: "center",
      }}>
        <div style={{
          maxWidth: "680px", margin: "0 auto",
          padding: "64px 48px",
          background: "linear-gradient(145deg, #12121a, #1a1a26)",
          border: "1px solid rgba(212,175,55,0.2)",
          borderRadius: "24px",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: "-40px", left: "50%", transform: "translateX(-50%)",
            width: "300px", height: "300px",
            background: "radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          <h2 style={{ fontSize: "clamp(24px, 4vw, 38px)", fontWeight: 800, color: "#f0ece0", margin: "0 0 16px", letterSpacing: "-0.02em" }}>
            Prêt pour la rentrée ?
          </h2>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.5)", marginBottom: "36px", lineHeight: 1.7 }}>
            Commandez votre Box maintenant et recevez toutes les fournitures scolaires directement chez vous.
          </p>
          <Link href="/catalogue" style={{
            display: "inline-block",
            padding: "18px 48px", borderRadius: "14px",
            background: "linear-gradient(135deg, #d4af37, #b8860b)",
            color: "#0a0a0f", fontWeight: 800, fontSize: "16px",
            textDecoration: "none", letterSpacing: "0.02em",
            boxShadow: "0 8px 40px rgba(212,175,55,0.3)",
          }}>Composer ma Box maintenant →</Link>

          <div style={{ marginTop: "28px", display: "flex", justifyContent: "center", gap: "32px" }}>
            {["🟡 MTN Money", "🔵 Moov Money", "🚚 Paiement livraison"].map(m => (
              <span key={m} style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>{m}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "48px 40px 32px",
        background: "rgba(8,8,16,0.5)",
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "40px", marginBottom: "48px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <div style={{ width: "32px", height: "32px", background: "linear-gradient(135deg, #d4af37, #b8860b)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: "13px", color: "#0a0a0f" }}>SB</div>
                <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "16px", color: "#f0ece0" }}>School<span style={{ color: "#d4af37" }}>Box</span></span>
              </div>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.35)", lineHeight: 1.7 }}>Fournitures scolaires livrées en 24&#8209;48h partout au Bénin.</p>
            </div>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.3)", marginBottom: "12px" }}>Navigation</p>
              {[
                { href: "/",          label: "Accueil" },
                { href: "/catalogue", label: "Catalogue" },
                { href: "/dashboard", label: "Mon Espace" },
                { href: "/ma-box",    label: "Ma Box" },
              ].map(l => (
                <Link key={l.href} href={l.href} style={{ display: "block", fontSize: "13px", color: "rgba(255,255,255,0.4)", textDecoration: "none", marginBottom: "8px" }}>{l.label}</Link>
              ))}
            </div>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.3)", marginBottom: "12px" }}>Mon Compte</p>
              {[
                { href: "/auth",      label: "Connexion" },
                { href: "/profil",    label: "Mon Profil" },
                { href: "/commandes", label: "Mes Commandes" },
                { href: "/admin",     label: "Espace Admin" },
              ].map(l => (
                <Link key={l.href} href={l.href} style={{ display: "block", fontSize: "13px", color: "rgba(255,255,255,0.4)", textDecoration: "none", marginBottom: "8px" }}>{l.label}</Link>
              ))}
            </div>
            <div>
              <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.3)", marginBottom: "12px" }}>Paiement</p>
              {["🟡 MTN Mobile Money", "🔵 Moov Money", "🚚 À la livraison"].map(m => (
                <p key={m} style={{ fontSize: "13px", color: "rgba(255,255,255,0.4)", marginBottom: "8px" }}>{m}</p>
              ))}
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.2)" }}>© 2025 SchoolBox Bénin. Tous droits réservés.</span>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.15)" }}>Conçu avec ✦ pour les parents du Bénin</span>
          </div>
        </div>
      </footer>
    </main>
  );
}