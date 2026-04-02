"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "../../lib/supabase/client";
import ProductCard, { Product, CartItem } from "../../components/ProductCard";
import InteractiveBox, { BoxHandle } from "../../components/interactivebox";

export default function CataloguePage() {
  const supabase = createClientComponentClient();
  const boxRef = useRef<HTMLDivElement>(null);
  const boxHandleRef = useRef<BoxHandle>(null);

  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [schools, setSchools] = useState<{ id: string; name: string }[]>([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [category, setCategory] = useState("all");

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("sb_box_draft");
    if (saved) {
      try {
        setCart(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse cart", e);
      }
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("sb_box_draft", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const fetchSchools = async () => {
      const { data } = await supabase.from("schools").select("id, name").order("name");
      if (data) setSchools(data);
    };
    fetchSchools();
  }, [supabase]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      let query = supabase.from("products").select("*").order("category");
      if (selectedSchool) query = query.eq("school_id", selectedSchool);
      if (selectedGrade) query = query.eq("grade", selectedGrade);
      const { data } = await query;
      if (data) setProducts(data as Product[]);
      setLoading(false);
    };
    fetchProducts();
  }, [supabase, selectedSchool, selectedGrade]);

  const handleAdd = (item: CartItem) => {
    setCart(prev => {
      const key = `${item.product_id}-${item.tier}`;
      const existing = prev.find(c => `${c.product_id}-${c.tier}` === key);
      if (existing) {
        return prev.map(c => `${c.product_id}-${c.tier}` === key
          ? { ...c, qty: c.qty + item.qty, subtotal: (c.qty + item.qty) * c.unit_price }
          : c
        );
      }
      return [...prev, item];
    });
  };

  const categories = ["all", ...Array.from(new Set(products.map(p => p.category)))];
  const filtered = category === "all" ? products : products.filter(p => p.category === category);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080810",
      fontFamily: "var(--font-geist-sans), 'DM Sans', sans-serif",
      color: "#e8e8e8",
    }}>
      {/* Header */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(8,8,16,0.9)", backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(212,175,55,0.1)",
        padding: "16px 24px",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <a href="/" style={{
            fontWeight: 800, fontSize: "18px", color: "#f0ece0",
            textDecoration: "none", marginRight: "8px",
          }}>School<span style={{ color: "#d4af37" }}>Box</span></a>

          <select
            value={selectedSchool}
            onChange={e => setSelectedSchool(e.target.value)}
            style={{
              flex: 1, minWidth: "180px", maxWidth: "260px",
              background: "#12121a", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "10px", padding: "9px 14px", color: "#e8e8e8",
              fontSize: "13px", outline: "none",
            }}
          >
            <option value="">🏫 Toutes les écoles</option>
            {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          <input
            type="text"
            placeholder="Classe (ex: CM2, 6ème…)"
            value={selectedGrade}
            onChange={e => setSelectedGrade(e.target.value)}
            style={{
              width: "180px", background: "#12121a",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "10px", padding: "9px 14px", color: "#e8e8e8",
              fontSize: "13px", outline: "none",
            }}
          />
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 24px 120px" }}>
        {/* Page title */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{
            fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800,
            color: "#f0ece0", margin: "0 0 8px", letterSpacing: "-0.02em",
          }}>
            Catalogue <span style={{ color: "#d4af37" }}>Fournitures</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px", margin: 0 }}>
            {loading ? "Chargement…" : `${filtered.length} article${filtered.length > 1 ? "s" : ""} disponible${filtered.length > 1 ? "s" : ""}`}
          </p>
        </div>

        {/* Category filter */}
        {categories.length > 1 && (
          <div style={{ display: "flex", gap: "8px", marginBottom: "28px", flexWrap: "wrap" }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  padding: "7px 16px", borderRadius: "20px", border: "none",
                  background: category === cat ? "linear-gradient(135deg, #d4af37, #b8860b)" : "rgba(255,255,255,0.06)",
                  color: category === cat ? "#0a0a0f" : "rgba(255,255,255,0.6)",
                  fontWeight: category === cat ? 700 : 500,
                  fontSize: "12px", cursor: "pointer", letterSpacing: "0.04em",
                  textTransform: "capitalize",
                }}
              >{cat === "all" ? "Tout" : cat}</button>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
            {[...Array(8)].map((_, i) => (
              <div key={i} style={{
                height: "320px", borderRadius: "16px",
                background: "linear-gradient(145deg, #12121a, #1a1a26)",
                border: "1px solid rgba(212,175,55,0.08)",
                animation: "pulse 1.5s ease-in-out infinite",
              }} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📦</div>
            <h2 style={{ color: "#f0ece0", marginBottom: "8px" }}>Aucun produit trouvé</h2>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "14px" }}>
              Sélectionnez une école ou une classe, ou vérifiez que des produits ont été ajoutés dans votre base Supabase.
            </p>
            <a href="/admin" style={{
              display: "inline-block", marginTop: "20px",
              padding: "12px 24px", borderRadius: "10px",
              background: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)",
              color: "#d4af37", textDecoration: "none", fontSize: "14px", fontWeight: 600,
            }}>Gérer les produits →</a>
          </div>
        )}

        {/* Products grid */}
        {!loading && filtered.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "16px",
          }}>
            {filtered.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                boxRef={boxRef as React.RefObject<HTMLDivElement>}
                onAdd={item => {
                  handleAdd(item);
                  boxHandleRef.current?.shake();
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Interactive Box */}
      <div ref={boxRef}>
        <InteractiveBox
          ref={boxHandleRef}
          items={cart}
          onCheckout={() => router.push("/ma-box")}
        />
      </div>

      {/* Go to Ma Box CTA */}
      {cart.length > 0 && (
         <div style={{
           position: "fixed", bottom: "100px", right: "24px", zIndex: 150,
         }}>
           <button 
             onClick={() => router.push("/ma-box")}
             style={{
               padding: "16px 32px", borderRadius: "16px", border: "none",
               background: "linear-gradient(135deg, #d4af37, #b8860b)",
               color: "#0a0a0f", fontWeight: 800, fontSize: "14px", cursor: "pointer",
               boxShadow: "0 8px 32px rgba(212,175,55,0.3)", display: "flex", alignItems: "center", gap: "8px"
             }}
           >
             Voir ma Box ({cart.length}) →
           </button>
         </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}