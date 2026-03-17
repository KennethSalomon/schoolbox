"use client";

import { useState, useRef } from "react";

import { gsap } from "gsap";

// ─── Types ───────────────────────────────────────────────────
export type Tier = "standard" | "premium";

export interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  price_standard: number;
  price_premium: number | null;
  brand_standard: string;
  brand_premium: string | null;
  image_url: string | null;
  image_premium_url: string | null;
  unit: string;
  stock_standard: number;
  stock_premium: number;
}

export interface CartItem {
  product_id: string;
  name: string;
  tier: Tier;
  qty: number;
  unit_price: number;
  subtotal: number;
  image_url: string | null;
}

interface ProductCardProps {
  product: Product;
  boxRef: React.RefObject<HTMLDivElement>;
  onAdd: (item: CartItem) => void;
  isRequired?: boolean;
}

const formatFCFA = (n: number) =>
  new Intl.NumberFormat("fr-BJ", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  }).format(n);

export default function ProductCard({
  product,
  boxRef,
  onAdd,
  isRequired = false,
}: ProductCardProps) {
  const [tier, setTier] = useState<Tier>("standard");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  const hasPremium =
    product.price_premium !== null && product.brand_premium !== null;
  const unitPrice =
    tier === "standard"
      ? product.price_standard
      : (product.price_premium ?? product.price_standard);
  const stock =
    tier === "standard" ? product.stock_standard : product.stock_premium;
  const imageUrl =
    tier === "premium" && product.image_premium_url
      ? product.image_premium_url
      : product.image_url;

  const flyToBox = () => {
    const srcEl = imgRef.current;
    const boxEl = boxRef.current;
    if (!srcEl || !boxEl) return;

    const from = srcEl.getBoundingClientRect();
    const to = boxEl.getBoundingClientRect();

    const clone = srcEl.cloneNode(true) as HTMLElement;
    Object.assign(clone.style, {
      position: "fixed",
      top: `${from.top}px`,
      left: `${from.left}px`,
      width: `${from.width}px`,
      height: `${from.height}px`,
      zIndex: "9999",
      borderRadius: "12px",
      pointerEvents: "none",
      boxShadow: "0 0 20px rgba(212, 175, 55, 0.6)",
    });
    document.body.appendChild(clone);

    const targetX = to.left + to.width / 2 - from.left - from.width / 2;
    const targetY = to.top + to.height / 2 - from.top - from.height / 2;

    gsap.to(clone, {
      x: targetX,
      y: targetY,
      scale: 0.25,
      opacity: 0,
      duration: 0.75,
      ease: "power3.in",
      onComplete: () => {
        clone.remove();
        // Capture la ref dans une variable locale pour éviter l'issue null en closure
        const currentBox = boxRef.current;
        if (currentBox) {
          gsap.fromTo(
            currentBox,
            { scale: 1 },
            { scale: 1.08, duration: 0.15, yoyo: true, repeat: 1, ease: "power2.out" }
          );
        }
      },
    });
  };

  const handleAdd = () => {
    if (stock < qty) return;
    flyToBox();
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
    onAdd({
      product_id: product.id,
      name: product.name,
      tier,
      qty,
      unit_price: unitPrice,
      subtotal: unitPrice * qty,
      image_url: imageUrl,
    });
  };

  return (
    <article
      style={{
        position: "relative",
        background: "linear-gradient(145deg, #12121a, #1a1a26)",
        border: "1px solid rgba(212, 175, 55, 0.15)",
        borderRadius: "16px",
        overflow: "hidden",
        transition: "border-color 0.3s, transform 0.3s, box-shadow 0.3s",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {isRequired && (
        <span
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            zIndex: 10,
            background: "linear-gradient(135deg, #d4af37, #f0d060)",
            color: "#0a0a0f",
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.05em",
            padding: "3px 8px",
            borderRadius: "20px",
          }}
        >
          ★ Requis
        </span>
      )}

      {/* Zone image */}
      <div
        ref={imgRef}
        style={{
          position: "relative",
          height: "140px",
          background: "#0d0d15",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={product.name}
            style={{ maxHeight: "100px", objectFit: "contain" }}
          />
        ) : (
          <span
            style={{
              fontSize: "32px",
              fontWeight: 900,
              color: "rgba(212, 175, 55, 0.3)",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            {product.category.slice(0, 2).toUpperCase()}
          </span>
        )}

        {hasPremium && (
          <div
            style={{
              position: "absolute",
              bottom: "8px",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(10px)",
              borderRadius: "30px",
              padding: "3px",
              gap: "3px",
              whiteSpace: "nowrap",
            }}
          >
            <button
              onClick={() => setTier("standard")}
              style={{
                padding: "4px 12px",
                borderRadius: "20px",
                border: "none",
                background: tier === "standard" ? "#1f1f2e" : "transparent",
                color: tier === "standard" ? "#fff" : "rgba(255,255,255,0.5)",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Standard
            </button>
            <button
              onClick={() => setTier("premium")}
              style={{
                padding: "4px 12px",
                borderRadius: "20px",
                border: "none",
                background:
                  tier === "premium"
                    ? "linear-gradient(135deg, #d4af37, #b8860b)"
                    : "transparent",
                color: tier === "premium" ? "#0a0a0f" : "rgba(255,255,255,0.5)",
                fontSize: "11px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              ✦ Premium
            </button>
          </div>
        )}
      </div>

      {/* Infos */}
      <div style={{ padding: "14px" }}>
        <p
          style={{
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "rgba(212,175,55,0.7)",
            margin: "0 0 4px",
          }}
        >
          {tier === "standard" ? product.brand_standard : product.brand_premium}
        </p>
        <h3
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "14px",
            fontWeight: 600,
            color: "#f0ece0",
            margin: "0 0 6px",
            lineHeight: 1.3,
          }}
        >
          {product.name}
        </h3>

        <div
          style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}
        >
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: "18px",
              fontWeight: 700,
              color: tier === "premium" ? "#d4af37" : "#e8e8e8",
            }}
          >
            {formatFCFA(unitPrice)}
          </span>
        </div>

        {/* Quantité */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#0d0d15",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.08)",
              overflow: "hidden",
            }}
          >
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              style={{
                width: "30px",
                height: "30px",
                border: "none",
                background: "transparent",
                color: "#d4af37",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              −
            </button>
            <span
              style={{
                width: "30px",
                textAlign: "center",
                fontFamily: "'DM Mono', monospace",
                fontSize: "13px",
                fontWeight: 700,
                color: "#fff",
              }}
            >
              {qty}
            </span>
            <button
              onClick={() => setQty((q) => Math.min(stock, q + 1))}
              style={{
                width: "30px",
                height: "30px",
                border: "none",
                background: "transparent",
                color: "#d4af37",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              +
            </button>
          </div>
          <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
            {stock > 0 ? `${stock} en stock` : "Rupture"}
          </span>
        </div>

        <p
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: "11px",
            color: "rgba(212,175,55,0.6)",
            margin: "0 0 10px",
            textAlign: "right",
          }}
        >
          Total : {formatFCFA(unitPrice * qty)}
        </p>

        <button
          onClick={handleAdd}
          disabled={stock < qty || stock === 0}
          style={{
            width: "100%",
            padding: "11px",
            borderRadius: "10px",
            border: added ? "1px solid #4caf50" : "1px solid rgba(212,175,55,0.4)",
            background: added ? "rgba(76,175,80,0.15)" : "transparent",
            color: added ? "#4caf50" : "#d4af37",
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.06em",
            cursor: stock === 0 ? "not-allowed" : "pointer",
            opacity: stock === 0 ? 0.35 : 1,
            transition: "all 0.3s",
          }}
        >
          {added ? "✓ Ajouté !" : "Ajouter à la Box"}
        </button>
      </div>
    </article>
  );
}