"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/dashboard",  label: "Tableau de bord", icon: "⬡" },
  { href: "/ma-box",     label: "Ma Box",           icon: "📦" },
  { href: "/catalogue",  label: "Catalogue",        icon: "🗂" },
  { href: "/profil",     label: "Mon Profil",       icon: "👤" },
  { href: "/commandes",  label: "Mes Commandes",    icon: "🧾" },
];

export default function UserNav() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: "240px",
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0b0b16 0%, #0f0f1a 100%)",
        borderRight: "1px solid rgba(212,175,55,0.1)",
        display: "flex",
        flexDirection: "column",
        padding: "0",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 60,
        fontFamily: "var(--font-body)",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "28px 24px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            textDecoration: "none",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              background: "linear-gradient(135deg, #d4af37, #b8860b)",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: "15px",
              color: "#0a0a0f",
              fontFamily: "var(--font-heading)",
              flexShrink: 0,
              boxShadow: "0 0 20px rgba(212,175,55,0.3)",
            }}
          >
            SB
          </div>
          <span
            style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 800,
              fontSize: "18px",
              color: "#f0ece0",
              letterSpacing: "-0.02em",
            }}
          >
            School<span style={{ color: "#d4af37" }}>Box</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav style={{ padding: "16px 12px", flex: 1 }}>
        <p
          style={{
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.25)",
            padding: "0 12px",
            marginBottom: "8px",
          }}
        >
          Menu principal
        </p>
        {navLinks.map((link) => {
          const active = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px 12px",
                borderRadius: "12px",
                textDecoration: "none",
                marginBottom: "2px",
                transition: "background 0.2s, color 0.2s",
                background: active
                  ? "linear-gradient(135deg, rgba(212,175,55,0.12), rgba(212,175,55,0.06))"
                  : "transparent",
                border: active
                  ? "1px solid rgba(212,175,55,0.2)"
                  : "1px solid transparent",
                color: active ? "#f0ece0" : "rgba(255,255,255,0.5)",
                fontSize: "14px",
                fontWeight: active ? 600 : 400,
              }}
            >
              <span style={{ fontSize: "16px", lineHeight: 1, flexShrink: 0 }}>
                {link.icon}
              </span>
              <span>{link.label}</span>
              {active && (
                <span
                  style={{
                    marginLeft: "auto",
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#d4af37",
                    flexShrink: 0,
                  }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom CTA */}
      <div
        style={{
          padding: "16px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <Link
          href="/catalogue"
          style={{
            display: "block",
            padding: "12px 16px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #d4af37, #b8860b)",
            color: "#0a0a0f",
            fontWeight: 800,
            fontSize: "13px",
            textDecoration: "none",
            textAlign: "center",
            letterSpacing: "0.04em",
            boxShadow: "0 4px 20px rgba(212,175,55,0.25)",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
        >
          + Composer ma Box
        </Link>
        <Link
          href="/"
          style={{
            display: "block",
            padding: "10px",
            textAlign: "center",
            fontSize: "12px",
            color: "rgba(255,255,255,0.25)",
            textDecoration: "none",
            marginTop: "8px",
          }}
        >
          ← Retour au site
        </Link>
      </div>
    </aside>
  );
}
