"use client";

import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { gsap } from "gsap";
import type { CartItem } from "./ProductCard";

interface InteractiveBoxProps {
  items: CartItem[];
  onCheckout: () => void;
}

export interface BoxHandle {
  shake: () => void;
}

const MAX_ITEMS_VISUAL = 12;

const formatFCFA = (n: number) =>
  new Intl.NumberFormat("fr-BJ", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(n);

const InteractiveBox = forwardRef<BoxHandle, InteractiveBoxProps>(
  ({ items, onCheckout }, ref) => {
    const boxEl = useRef<HTMLDivElement>(null);
    const countEl = useRef<HTMLSpanElement>(null);

    const totalItems = items.reduce((s, i) => s + i.qty, 0);
    const fillPct = Math.min((totalItems / MAX_ITEMS_VISUAL) * 100, 100);
    const totalPrice = items.reduce((s, i) => s + i.subtotal, 0);

    useImperativeHandle(ref, () => ({
      shake: () => {
        const el = boxEl.current;
        if (!el) return;
        gsap.fromTo(
          el,
          { rotation: -5 },
          {
            rotation: 5,
            yoyo: true,
            repeat: 5,
            duration: 0.07,
            ease: "power1.inOut",
            onComplete: () => { gsap.set(el, { rotation: 0 }); }
          }
        );
      },
    }));

    useEffect(() => {
      const el = countEl.current;
      if (!el) return;
      gsap.fromTo(
        el,
        { scale: 1.4, color: "#d4af37" },
        { scale: 1, color: "#ffffff", duration: 0.4, ease: "back.out(2)" }
      );
    }, [totalItems]);

    // Couleur de remplissage selon le taux
    const hue = Math.max(0, 120 - fillPct * 1.2);
    const fillColor = `hsl(${hue}, 70%, 45%)`;
    const fillH = Math.min((totalItems / MAX_ITEMS_VISUAL) * 28, 28);

    return (
      <div
        ref={boxEl}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
          padding: "16px 12px",
          background: "linear-gradient(180deg, #0f0f1a, #0a0a12)",
          borderTop: "1px solid rgba(212,175,55,0.2)",
          position: "fixed",
          bottom: 0,
          right: "24px",
          width: "160px",
          borderRadius: "20px 20px 0 0",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.6)",
          zIndex: 500,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* SVG Box */}
        <div style={{ position: "relative", width: "72px", height: "72px" }}>
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="72" height="72">
            <ellipse cx="50" cy="95" rx="30" ry="5" fill="rgba(0,0,0,0.4)" />
            <rect
              x="15" y="40" width="70" height="50" rx="3"
              fill="#1a1a2e" stroke="rgba(212,175,55,0.6)" strokeWidth="1.5"
            />
            <clipPath id="box-clip">
              <rect x="16" y="41" width="68" height="48" rx="2" />
            </clipPath>
            {fillH > 0 && (
              <rect
                x="16"
                y={89 - fillH}
                width="68"
                height={fillH}
                fill={fillColor}
                opacity="0.4"
                clipPath="url(#box-clip)"
                style={{ transition: "all 0.5s" }}
              />
            )}
            <path
              d="M15 40 Q20 18 50 22 Q80 18 85 40"
              fill="#0d0d1a"
              stroke="rgba(212,175,55,0.5)"
              strokeWidth="1.5"
            />
            <path d="M15 40 L30 25 L50 22" fill="#161628" stroke="rgba(212,175,55,0.4)" strokeWidth="1" />
            <path d="M85 40 L70 25 L50 22" fill="#161628" stroke="rgba(212,175,55,0.4)" strokeWidth="1" />
            <rect x="46" y="40" width="8" height="50" fill="rgba(212,175,55,0.15)" />
            <text x="50" y="70" textAnchor="middle" fontSize="10" fontWeight="900" fill="rgba(212,175,55,0.4)" fontFamily="serif">SB</text>
          </svg>

          {/* Badge compteur */}
          <span
            ref={countEl}
            style={{
              position: "absolute",
              top: "-4px",
              right: "-4px",
              width: "20px",
              height: "20px",
              background: "linear-gradient(135deg, #d4af37, #b8860b)",
              color: "#0a0a0f",
              fontSize: "10px",
              fontWeight: 900,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'DM Mono', monospace",
            }}
            aria-live="polite"
          >
            {totalItems}
          </span>
        </div>

        {/* Infos */}
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(212,175,55,0.5)", margin: 0 }}>
            Ma Box
          </p>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: "14px", fontWeight: 700, color: "#d4af37", margin: "2px 0 0" }}>
            {formatFCFA(totalPrice)}
          </p>
          <p style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)", margin: 0 }}>
            {totalItems} article{totalItems > 1 ? "s" : ""}
          </p>
        </div>

        {totalItems > 0 && (
          <button
            onClick={onCheckout}
            style={{
              width: "100%",
              padding: "10px 8px",
              borderRadius: "10px",
              border: "none",
              background: "linear-gradient(135deg, #d4af37, #b8860b)",
              color: "#0a0a0f",
              fontSize: "11px",
              fontWeight: 800,
              letterSpacing: "0.05em",
              cursor: "pointer",
            }}
          >
            Valider ma Box →
          </button>
        )}
      </div>
    );
  }
);

InteractiveBox.displayName = "InteractiveBox";
export default InteractiveBox;