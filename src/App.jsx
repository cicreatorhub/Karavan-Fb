import { useState, useEffect, createContext, useContext, useReducer } from "react";
import { api, getToken } from "./api";

// ─── CONTEXTS ────────────────────────────────────────────────────────────────
const AuthContext = createContext(null);
const CartContext = createContext(null);

// ─── CART REDUCER ────────────────────────────────────────────────────────────
function cartReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const exists = state.find((i) => i._id === action.item._id);
      if (exists) return state.map((i) => i._id === action.item._id ? { ...i, qty: i.qty + 1 } : i);
      return [...state, { ...action.item, qty: 1 }];
    }
    case "REMOVE": return state.filter((i) => i._id !== action.id);
    case "UPDATE_QTY": return state.map((i) => i._id === action.id ? { ...i, qty: action.qty } : i);
    case "CLEAR": return [];
    default: return state;
  }
}

// ─── DATA ──────────────────────────────────────────────────────────────────── = ["All", "Electronics", "Fashion", "Home", "Sports"];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const fmt = (n) => `₦${Number(n).toLocaleString()}`;
const stars = (r) => "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r));

// ─── ICONS (inline SVG) ───────────────────────────────────────────────────────
const Icon = {
  cart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  user: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  close: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  menu: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  trash: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18"><polyline points="20 6 9 17 4 12"/></svg>,
  arrow: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  home: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  grid: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  logout: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  plus: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  edit: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  package: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  users: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  orders: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
};

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{ position:"fixed", bottom:24, right:24, background:"#1a1a2e", color:"#fff", padding:"12px 20px", borderRadius:10, display:"flex", alignItems:"center", gap:10, zIndex:9999, boxShadow:"0 8px 32px rgba(0,0,0,.3)", fontSize:14 }}>
      <span style={{ color:"#6c63ff" }}>{Icon.check}</span>{msg}
    </div>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar({ page, setPage }) {
  const { user, logout } = useContext(AuthContext);
  const [cart] = useContext(CartContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const count = cart.reduce((s, i) => s + i.qty, 0);

  return (
    <nav style={{ background:"#0f0e17", borderBottom:"1px solid #1e1d2e", position:"sticky", top:0, zIndex:100 }}>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 20px", display:"flex", alignItems:"center", justifyContent:"space-between", height:64 }}>
        <button onClick={() => setPage("home")} style={{ background:"none", border:"none", cursor:"pointer", fontWeight:800, fontSize:20, color:"#6c63ff", letterSpacing:"-0.5px" }}>
          Market<span style={{ color:"#fff" }}>Hub</span>
        </button>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {user && (
            <button onClick={() => setPage("account")} style={{ background:"none", border:"none", cursor:"pointer", color:"#aaa", display:"flex", alignItems:"center", gap:6, fontSize:13 }}>
              {Icon.user}<span style={{ display:"none" }}>{user.name}</span>
            </button>
          )}
          {!user && (
            <button onClick={() => setPage("login")} style={{ background:"none", border:"none", cursor:"pointer", color:"#aaa", display:"flex", alignItems:"center", gap:6, fontSize:13 }}>
              {Icon.user}
            </button>
          )}
          <button onClick={() => setPage("cart")} style={{ background:"none", border:"none", cursor:"pointer", color:"#fff", position:"relative", display:"flex", alignItems:"center" }}>
            {Icon.cart}
            {count > 0 && <span style={{ position:"absolute", top:-6, right:-6, background:"#6c63ff", color:"#fff", borderRadius:"50%", width:18, height:18, fontSize:11, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700 }}>{count}</span>}
          </button>
          {user?.isAdmin && (
            <button onClick={() => setPage("admin")} style={{ background:"#6c63ff22", border:"1px solid #6c63ff44", cursor:"pointer", color:"#6c63ff", borderRadius:6, padding:"4px 10px", fontSize:12, fontWeight:600 }}>
              Admin
            </button>
          )}
          {user && (
            <button onClick={logout} style={{ background:"none", border:"none", cursor:"pointer", color:"#666", display:"flex" }}>
              {Icon.logout}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

// ─── HOME / PRODUCT LISTING ───────────────────────────────────────────────────
function HomePage({ setPage, setSelectedProduct }) {
  const [, dispatch] = useContext(CartContext);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("default");
  const [toast, setToast] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getProducts({ search, category, sort })
      .then(d => setProducts(d.products))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [search, category, sort]);

  const addToCart = (p) => { dispatch({ type: "ADD", item: p }); setToast(`${p.name} added to cart`); };

  return (
    <div style={{ minHeight:"100vh", background:"#0a0a12" }}>
      {/* Hero */}
      <div style={{ background:"linear-gradient(135deg,#1a1040 0%,#0f0e17 60%,#120b2e 100%)", padding:"60px 20px 40px", textAlign:"center" }}>
        <p style={{ color:"#6c63ff", fontWeight:600, fontSize:13, letterSpacing:2, textTransform:"uppercase", marginBottom:12 }}>Welcome to</p>
        <h1 style={{ color:"#fff", fontSize:"clamp(2rem,6vw,3.5rem)", fontWeight:900, margin:"0 0 12px", lineHeight:1.1 }}>
          MarketHub — <span style={{ color:"#6c63ff" }}>Everything</span><br />in one place
        </h1>
        <p style={{ color:"#888", fontSize:16, marginBottom:32 }}>Quality products. Fast delivery. Secure checkout.</p>
        {/* Search */}
        <div style={{ display:"flex", maxWidth:480, margin:"0 auto", background:"#1a1a2e", borderRadius:12, overflow:"hidden", border:"1px solid #2a2a40" }}>
          <span style={{ padding:"0 14px", display:"flex", alignItems:"center", color:"#555" }}>{Icon.search}</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…" style={{ flex:1, background:"none", border:"none", outline:"none", color:"#fff", fontSize:15, padding:"14px 0" }} />
        </div>
      </div>

      {/* Filters */}
      <div style={{ background:"#0f0e17", borderBottom:"1px solid #1e1d2e", padding:"0 20px" }}>
        <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", gap:8, overflowX:"auto", padding:"12px 0", alignItems:"center" }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{ background: category===c ? "#6c63ff" : "#1a1a2e", color: category===c ? "#fff" : "#aaa", border: "none", borderRadius:20, padding:"6px 18px", cursor:"pointer", whiteSpace:"nowrap", fontSize:13, fontWeight:600, transition:"all .2s" }}>
              {c}
            </button>
          ))}
          <div style={{ marginLeft:"auto", flexShrink:0 }}>
            <select value={sort} onChange={e => setSort(e.target.value)} style={{ background:"#1a1a2e", color:"#aaa", border:"1px solid #2a2a40", borderRadius:8, padding:"6px 12px", fontSize:13, outline:"none" }}>
              <option value="default">Sort: Default</option>
              <option value="low">Price: Low → High</option>
              <option value="high">Price: High → Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"32px 20px" }}>
        <p style={{ color:"#555", fontSize:13, marginBottom:20 }}>{loading ? "Loading…" : `${products.length} product${products.length!==1?"s":""} found`}</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:24 }}>
          {products.map(p => (
            <div key={p._id} style={{ background:"#0f0e17", border:"1px solid #1e1d2e", borderRadius:14, overflow:"hidden", display:"flex", flexDirection:"column", transition:"transform .2s,box-shadow .2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow="0 12px 40px rgba(108,99,255,.15)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; }}>
              <div style={{ position:"relative", cursor:"pointer" }} onClick={() => { setSelectedProduct(p); setPage("product"); }}>
                <img src={p.image} alt={p.name} style={{ width:"100%", height:200, objectFit:"cover", display:"block" }} />
                <span style={{ position:"absolute", top:10, left:10, background:"#6c63ff22", color:"#6c63ff", border:"1px solid #6c63ff44", borderRadius:6, padding:"3px 10px", fontSize:11, fontWeight:600 }}>{p.category}</span>
              </div>
              <div style={{ padding:16, flex:1, display:"flex", flexDirection:"column" }}>
                <h3 onClick={() => { setSelectedProduct(p); setPage("product"); }} style={{ color:"#fff", fontSize:15, fontWeight:700, margin:"0 0 6px", cursor:"pointer" }}>{p.name}</h3>
                <p style={{ color:"#6c63ff", fontSize:12 }}>{stars(p.rating)} <span style={{ color:"#555" }}>({p.rating})</span></p>
                <p style={{ color:"#fff", fontWeight:800, fontSize:18, margin:"8px 0 14px" }}>{fmt(p.price)}</p>
                <button onClick={() => addToCart(p)} style={{ marginTop:"auto", background:"#6c63ff", color:"#fff", border:"none", borderRadius:8, padding:"10px", fontWeight:700, cursor:"pointer", fontSize:14 }}>
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
        {products.length === 0 && <div style={{ textAlign:"center", color:"#555", padding:60 }}>No products found for "{search}"</div>}
      </div>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

// ─── PRODUCT DETAIL ───────────────────────────────────────────────────────────
function ProductPage({ product, setPage }) {
  const [, dispatch] = useContext(CartContext);
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState(null);
  if (!product) return null;
  const add = () => { for (let i=0;i<qty;i++) dispatch({ type:"ADD", item:product }); setToast("Added to cart!"); };
  return (
    <div style={{ minHeight:"100vh", background:"#0a0a12", padding:"40px 20px" }}>
      <div style={{ maxWidth:900, margin:"0 auto" }}>
        <button onClick={() => setPage("home")} style={{ background:"none", border:"none", color:"#6c63ff", cursor:"pointer", fontSize:14, marginBottom:24, display:"flex", alignItems:"center", gap:6 }}>
          ← Back to products
        </button>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:40, background:"#0f0e17", border:"1px solid #1e1d2e", borderRadius:16, overflow:"hidden" }}>
          <img src={product.image} alt={product.name} style={{ width:"100%", height:"100%", minHeight:340, objectFit:"cover", display:"block" }} />
          <div style={{ padding:32 }}>
            <span style={{ background:"#6c63ff22", color:"#6c63ff", border:"1px solid #6c63ff44", borderRadius:6, padding:"3px 12px", fontSize:12, fontWeight:600 }}>{product.category}</span>
            <h1 style={{ color:"#fff", fontSize:26, fontWeight:900, margin:"16px 0 8px" }}>{product.name}</h1>
            <p style={{ color:"#6c63ff", fontSize:14, marginBottom:8 }}>{stars(product.rating)} {product.rating}/5</p>
            <p style={{ color:"#888", lineHeight:1.6, marginBottom:20 }}>{product.description}</p>
            <p style={{ color:"#fff", fontWeight:900, fontSize:28, marginBottom:24 }}>{fmt(product.price)}</p>
            <p style={{ color: product.stock > 5 ? "#4ade80" : "#f59e0b", fontSize:13, marginBottom:20 }}>
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </p>
            <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:20 }}>
              <button onClick={() => setQty(q => Math.max(1,q-1))} style={{ background:"#1a1a2e", border:"1px solid #2a2a40", color:"#fff", borderRadius:8, width:36, height:36, cursor:"pointer", fontSize:18 }}>−</button>
              <span style={{ color:"#fff", fontWeight:700, minWidth:24, textAlign:"center" }}>{qty}</span>
              <button onClick={() => setQty(q => Math.min(product.stock,q+1))} style={{ background:"#1a1a2e", border:"1px solid #2a2a40", color:"#fff", borderRadius:8, width:36, height:36, cursor:"pointer", fontSize:18 }}>+</button>
            </div>
            <button onClick={add} disabled={product.stock===0} style={{ background:"#6c63ff", color:"#fff", border:"none", borderRadius:10, padding:"14px 32px", fontWeight:800, fontSize:16, cursor:"pointer", width:"100%" }}>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

// ─── CART ─────────────────────────────────────────────────────────────────────
function CartPage({ setPage }) {
  const [cart, dispatch] = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const total = cart.reduce((s,i) => s + i.price * i.qty, 0);
  if (cart.length === 0) return (
    <div style={{ minHeight:"80vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"#0a0a12", color:"#555" }}>
      <div style={{ fontSize:64, marginBottom:16 }}>🛒</div>
      <p style={{ fontSize:18, marginBottom:20 }}>Your cart is empty</p>
      <button onClick={() => setPage("home")} style={{ background:"#6c63ff", color:"#fff", border:"none", borderRadius:10, padding:"12px 28px", fontWeight:700, cursor:"pointer" }}>Browse Products</button>
    </div>
  );
  return (
    <div style={{ minHeight:"100vh", background:"#0a0a12", padding:"40px 20px" }}>
      <div style={{ maxWidth:800, margin:"0 auto" }}>
        <h1 style={{ color:"#fff", fontWeight:900, marginBottom:32 }}>Your Cart <span style={{ color:"#555", fontWeight:400, fontSize:18 }}>({cart.length} items)</span></h1>
        <div style={{ display:"flex", flexDirection:"column", gap:16, marginBottom:32 }}>
          {cart.map(item => (
            <div key={item._id} style={{ background:"#0f0e17", border:"1px solid #1e1d2e", borderRadius:12, padding:16, display:"flex", gap:16, alignItems:"center" }}>
              <img src={item.image} alt={item.name} style={{ width:80, height:80, objectFit:"cover", borderRadius:8 }} />
              <div style={{ flex:1 }}>
                <p style={{ color:"#fff", fontWeight:700, marginBottom:4 }}>{item.name}</p>
                <p style={{ color:"#6c63ff", fontWeight:800 }}>{fmt(item.price)}</p>
              </div>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <button onClick={() => dispatch({ type:"UPDATE_QTY", id:item._id, qty:Math.max(1,item.qty-1) })} style={{ background:"#1a1a2e", border:"1px solid #2a2a40", color:"#fff", borderRadius:6, width:30, height:30, cursor:"pointer" }}>−</button>
                <span style={{ color:"#fff", minWidth:20, textAlign:"center" }}>{item.qty}</span>
                <button onClick={() => dispatch({ type:"UPDATE_QTY", id:item._id, qty:item.qty+1 })} style={{ background:"#1a1a2e", border:"1px solid #2a2a40", color:"#fff", borderRadius:6, width:30, height:30, cursor:"pointer" }}>+</button>
              </div>
              <p style={{ color:"#fff", fontWeight:700, minWidth:80, textAlign:"right" }}>{fmt(item.price * item.qty)}</p>
              <button onClick={() => dispatch({ type:"REMOVE", id:item._id })} style={{ background:"none", border:"none", color:"#555", cursor:"pointer", display:"flex" }}>{Icon.trash}</button>
            </div>
          ))}
        </div>
        <div style={{ background:"#0f0e17", border:"1px solid #1e1d2e", borderRadius:12, padding:24 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8, color:"#888" }}>
            <span>Subtotal</span><span>{fmt(total)}</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8, color:"#888" }}>
            <span>Delivery</span><span style={{ color:"#4ade80" }}>Free</span>
          </div>
          <div style={{ height:1, background:"#1e1d2e", margin:"16px 0" }} />
          <div style={{ display:"flex", justifyContent:"space-between", color:"#fff", fontWeight:800, fontSize:20, marginBottom:24 }}>
            <span>Total</span><span style={{ color:"#6c63ff" }}>{fmt(total)}</span>
          </div>
          <button onClick={() => user ? setPage("checkout") : setPage("login")} style={{ background:"#6c63ff", color:"#fff", border:"none", borderRadius:10, padding:"14px", fontWeight:800, fontSize:16, cursor:"pointer", width:"100%" }}>
            {user ? "Proceed to Checkout" : "Login to Checkout"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CHECKOUT ─────────────────────────────────────────────────────────────────
function CheckoutPage({ setPage }) {
  const [cart, dispatch] = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: user?.name||"", email: user?.email||"", phone:"", address:"", city:"", state:"Lagos" });
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);
  const total = cart.reduce((s,i) => s + i.price * i.qty, 0);

  const [error, setError] = useState("");

  const handlePay = async () => {
    setPaying(true); setError("");
    try {
      const items = cart.map(i => ({ productId: i._id, qty: i.qty }));
      const { authorization_url } = await api.createOrder(items, form);
      window.location.href = authorization_url; // redirect to Paystack
    } catch (e) {
      setError(e.message); setPaying(false);
    }
  };

  if (done) return (
    <div style={{ minHeight:"80vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"#0a0a12" }}>
      <div style={{ background:"#6c63ff22", border:"1px solid #6c63ff44", borderRadius:"50%", width:80, height:80, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:20 }}>
        <span style={{ color:"#6c63ff", fontSize:36 }}>{Icon.check}</span>
      </div>
      <h2 style={{ color:"#fff", fontWeight:900, marginBottom:8 }}>Order Placed!</h2>
      <p style={{ color:"#888", marginBottom:24 }}>You'll receive a confirmation soon.</p>
      <button onClick={() => setPage("home")} style={{ background:"#6c63ff", color:"#fff", border:"none", borderRadius:10, padding:"12px 28px", fontWeight:700, cursor:"pointer" }}>Continue Shopping</button>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#0a0a12", padding:"40px 20px" }}>
      <div style={{ maxWidth:680, margin:"0 auto" }}>
        <h1 style={{ color:"#fff", fontWeight:900, marginBottom:8 }}>Checkout</h1>
        {/* Steps */}
        <div style={{ display:"flex", gap:8, marginBottom:32 }}>
          {["Delivery","Payment","Review"].map((s,i) => (
            <div key={s} style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:13, background: step>i+1 ? "#6c63ff" : step===i+1 ? "#6c63ff" : "#1a1a2e", color: step>=i+1?"#fff":"#555" }}>{step>i+1 ? "✓" : i+1}</span>
              <span style={{ color: step===i+1?"#fff":"#555", fontSize:13 }}>{s}</span>
              {i<2 && <span style={{ color:"#2a2a40" }}>—</span>}
            </div>
          ))}
        </div>

        {step===1 && (
          <div style={{ background:"#0f0e17", border:"1px solid #1e1d2e", borderRadius:12, padding:24 }}>
            <h3 style={{ color:"#fff", fontWeight:700, marginBottom:20 }}>Delivery Information</h3>
            {[["Full Name","name","text"],["Email","email","email"],["Phone","phone","tel"],["Address","address","text"],["City","city","text"]].map(([label,key,type]) => (
              <div key={key} style={{ marginBottom:16 }}>
                <label style={{ color:"#888", fontSize:13, display:"block", marginBottom:6 }}>{label}</label>
                <input type={type} value={form[key]} onChange={e => setForm(f=>({...f,[key]:e.target.value}))} style={{ width:"100%", background:"#1a1a2e", border:"1px solid #2a2a40", borderRadius:8, padding:"12px", color:"#fff", outline:"none", fontSize:14, boxSizing:"border-box" }} />
              </div>
            ))}
            <div style={{ marginBottom:16 }}>
              <label style={{ color:"#888", fontSize:13, display:"block", marginBottom:6 }}>State</label>
              <select value={form.state} onChange={e => setForm(f=>({...f,state:e.target.value}))} style={{ width:"100%", background:"#1a1a2e", border:"1px solid #2a2a40", borderRadius:8, padding:"12px", color:"#fff", outline:"none", fontSize:14 }}>
                {["Lagos","Abuja","Rivers","Oyo","Delta","Edo","Kano","Anambra"].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <button onClick={() => setStep(2)} style={{ background:"#6c63ff", color:"#fff", border:"none", borderRadius:10, padding:"14px", fontWeight:700, cursor:"pointer", width:"100%", marginTop:8 }}>Continue to Payment</button>
          </div>
        )}

        {step===2 && (
          <div style={{ background:"#0f0e17", border:"1px solid #1e1d2e", borderRadius:12, padding:24 }}>
            <h3 style={{ color:"#fff", fontWeight:700, marginBottom:20 }}>Payment Method</h3>
            <div style={{ background:"#6c63ff11", border:"2px solid #6c63ff", borderRadius:10, padding:16, display:"flex", gap:12, alignItems:"center", marginBottom:16 }}>
              <span style={{ fontSize:24 }}>💳</span>
              <div>
                <p style={{ color:"#fff", fontWeight:700, margin:0 }}>Paystack</p>
                <p style={{ color:"#888", fontSize:13, margin:0 }}>Pay securely with card, bank transfer or USSD</p>
              </div>
              <span style={{ marginLeft:"auto", color:"#6c63ff" }}>{Icon.check}</span>
            </div>
            <div style={{ background:"#1a1a2e", borderRadius:10, padding:16, marginBottom:20 }}>
              <p style={{ color:"#888", fontSize:13, margin:0 }}>You'll be redirected to Paystack's secure payment page to complete your purchase of <strong style={{ color:"#6c63ff" }}>{fmt(total)}</strong></p>
            </div>
            <div style={{ display:"flex", gap:12 }}>
              <button onClick={() => setStep(1)} style={{ flex:1, background:"#1a1a2e", color:"#aaa", border:"1px solid #2a2a40", borderRadius:10, padding:"12px", fontWeight:700, cursor:"pointer" }}>Back</button>
              <button onClick={() => setStep(3)} style={{ flex:2, background:"#6c63ff", color:"#fff", border:"none", borderRadius:10, padding:"12px", fontWeight:700, cursor:"pointer" }}>Review Order</button>
            </div>
          </div>
        )}

        {step===3 && (
          <div style={{ background:"#0f0e17", border:"1px solid #1e1d2e", borderRadius:12, padding:24 }}>
            <h3 style={{ color:"#fff", fontWeight:700, marginBottom:16 }}>Order Summary</h3>
            {error && <div style={{ background:"#ff4b4b22", border:"1px solid #ff4b4b44", color:"#ff6b6b", borderRadius:8, padding:"10px 14px", marginBottom:16, fontSize:14 }}>{error}</div>}
            {cart.map(item => (
              <div key={item._id} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid #1e1d2e" }}>
                <span style={{ color:"#aaa", fontSize:14 }}>{item.name} × {item.qty}</span>
                <span style={{ color:"#fff", fontWeight:600 }}>{fmt(item.price*item.qty)}</span>
              </div>
            ))}
            <div style={{ display:"flex", justifyContent:"space-between", padding:"16px 0 0", color:"#fff", fontWeight:800, fontSize:18 }}>
              <span>Total</span><span style={{ color:"#6c63ff" }}>{fmt(total)}</span>
            </div>
            <div style={{ display:"flex", gap:12, marginTop:20 }}>
              <button onClick={() => setStep(2)} style={{ flex:1, background:"#1a1a2e", color:"#aaa", border:"1px solid #2a2a40", borderRadius:10, padding:"12px", fontWeight:700, cursor:"pointer" }}>Back</button>
              <button onClick={handlePay} disabled={paying} style={{ flex:2, background: paying?"#4a3fa0":"#6c63ff", color:"#fff", border:"none", borderRadius:10, padding:"12px", fontWeight:700, cursor:"pointer", fontSize:16 }}>
                {paying ? "Processing…" : `Pay ${fmt(total)}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AUTH PAGES ───────────────────────────────────────────────────────────────
function AuthPage({ mode, setPage }) {
  const { login, register } = useContext(AuthContext);
  const [form, setForm] = useState({ name:"", email:"", password:"" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isLogin = mode === "login";

  const submit = async () => {
    setError(""); setLoading(true);
    try {
      if (isLogin) await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
      setPage("home");
    } catch(e) { setError(e.message); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:"100vh", background:"#0a0a12", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:"#0f0e17", border:"1px solid #1e1d2e", borderRadius:16, padding:40, width:"100%", maxWidth:420 }}>
        <h2 style={{ color:"#fff", fontWeight:900, marginBottom:6, textAlign:"center" }}>{isLogin ? "Welcome back" : "Create account"}</h2>
        <p style={{ color:"#555", textAlign:"center", marginBottom:28, fontSize:14 }}>{isLogin ? "Sign in to your account" : "Start shopping today"}</p>
        {error && <div style={{ background:"#ff4b4b22", border:"1px solid #ff4b4b44", color:"#ff6b6b", borderRadius:8, padding:"10px 14px", marginBottom:16, fontSize:14 }}>{error}</div>}
        {!isLogin && (
          <div style={{ marginBottom:16 }}>
            <label style={{ color:"#888", fontSize:13, display:"block", marginBottom:6 }}>Full Name</label>
            <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="John Doe" style={{ width:"100%", background:"#1a1a2e", border:"1px solid #2a2a40", borderRadius:8, padding:"12px", color:"#fff", outline:"none", fontSize:14, boxSizing:"border-box" }} />
          </div>
        )}
        <div style={{ marginBottom:16 }}>
          <label style={{ color:"#888", fontSize:13, display:"block", marginBottom:6 }}>Email</label>
          <input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="you@example.com" style={{ width:"100%", background:"#1a1a2e", border:"1px solid #2a2a40", borderRadius:8, padding:"12px", color:"#fff", outline:"none", fontSize:14, boxSizing:"border-box" }} />
        </div>
        <div style={{ marginBottom:24 }}>
          <label style={{ color:"#888", fontSize:13, display:"block", marginBottom:6 }}>Password</label>
          <input type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} placeholder="••••••••" style={{ width:"100%", background:"#1a1a2e", border:"1px solid #2a2a40", borderRadius:8, padding:"12px", color:"#fff", outline:"none", fontSize:14, boxSizing:"border-box" }} />
        </div>
        <button onClick={submit} disabled={loading} style={{ width:"100%", background:"#6c63ff", color:"#fff", border:"none", borderRadius:10, padding:"14px", fontWeight:800, fontSize:16, cursor:"pointer" }}>
          {loading ? "Please wait…" : isLogin ? "Sign In" : "Create Account"}
        </button>
        <p style={{ textAlign:"center", color:"#555", fontSize:14, marginTop:20 }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setPage(isLogin ? "register" : "login")} style={{ background:"none", border:"none", color:"#6c63ff", cursor:"pointer", fontWeight:700 }}>
            {isLogin ? "Register" : "Sign In"}
          </button>
        </p>
        {isLogin && (
          <p style={{ textAlign:"center", color:"#444", fontSize:12, marginTop:12 }}>
            Demo: <span style={{ color:"#6c63ff" }}>admin@markethub.com / admin123</span>
          </p>
        )}
      </div>
    </div>
  );
}

// ─── ACCOUNT ──────────────────────────────────────────────────────────────────
function AccountPage({ setPage }) {
  const { user, logout } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  useEffect(() => { if (user) api.myOrders().then(setOrders).catch(() => {}); }, [user]);
  if (!user) { setPage("login"); return null; }
  const statusColor = { Delivered:"#4ade80", Processing:"#f59e0b", Pending:"#60a5fa", Shipped:"#a78bfa", Cancelled:"#f87171" };
  return (
    <div style={{ minHeight:"100vh", background:"#0a0a12", padding:"40px 20px" }}>
      <div style={{ maxWidth:700, margin:"0 auto" }}>
        <div style={{ background:"#0f0e17", border:"1px solid #1e1d2e", borderRadius:16, padding:28, marginBottom:24, display:"flex", gap:20, alignItems:"center" }}>
          <div style={{ width:60, height:60, borderRadius:"50%", background:"linear-gradient(135deg,#6c63ff,#a855f7)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:800, fontSize:22, color:"#fff" }}>{user.name[0]}</div>
          <div>
            <h2 style={{ color:"#fff", fontWeight:800, margin:0 }}>{user.name}</h2>
            <p style={{ color:"#555", margin:0, fontSize:14 }}>{user.email}</p>
            {user.isAdmin && <span style={{ background:"#6c63ff22", color:"#6c63ff", border:"1px solid #6c63ff44", borderRadius:6, padding:"2px 8px", fontSize:11, fontWeight:700 }}>Admin</span>}
          </div>
          <button onClick={() => { logout(); setPage("home"); }} style={{ marginLeft:"auto", background:"none", border:"1px solid #2a2a40", color:"#888", borderRadius:8, padding:"8px 16px", cursor:"pointer", fontSize:13 }}>Sign Out</button>
        </div>
        <h3 style={{ color:"#fff", fontWeight:700, marginBottom:16 }}>Order History</h3>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {orders.map(o => (
            <div key={o._id} style={{ background:"#0f0e17", border:"1px solid #1e1d2e", borderRadius:12, padding:20, display:"flex", gap:16, alignItems:"center" }}>
              <div>{Icon.orders}</div>
              <div style={{ flex:1 }}>
                <p style={{ color:"#fff", fontWeight:700, margin:"0 0 4px" }}>{o._id}</p>
                <p style={{ color:"#555", fontSize:13, margin:0 }}>{new Date(o.createdAt).toLocaleDateString()} • {o.items.length} item{o.items.length>1?"s":""}</p>
              </div>
              <span style={{ color: statusColor[o.status], fontSize:13, fontWeight:600 }}>{o.status}</span>
              <span style={{ color:"#6c63ff", fontWeight:700 }}>{fmt(o.totalPrice)}</span>
            </div>
          ))}
          {orders.length===0 && <p style={{ color:"#555" }}>No orders yet.</p>}
        </div>
      </div>
    </div>
  );
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
function AdminPage({ setPage }) {
  const { user } = useContext(AuthContext);
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({ name:"", price:"", category:"Electronics", stock:"", description:"", image:"" });
  const [toast, setToast] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try { const url = await api.uploadImage(file); setForm(f => ({ ...f, image: url })); }
    catch (err) { setToast(err.message); }
    setUploading(false);
  };

  const loadProducts = () => api.getProducts({ limit: 100 }).then(d => setProducts(d.products)).catch(() => {});
  useEffect(() => { loadProducts(); }, []);

  if (!user?.isAdmin) return (
    <div style={{ minHeight:"80vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#0a0a12", flexDirection:"column", gap:16 }}>
      <p style={{ color:"#ff6b6b", fontSize:18 }}>Access Denied</p>
      <button onClick={() => setPage("home")} style={{ background:"#6c63ff", color:"#fff", border:"none", borderRadius:8, padding:"10px 24px", cursor:"pointer" }}>Go Home</button>
    </div>
  );

  const [orders, setOrders] = useState([]);
  useEffect(() => { if (user?.isAdmin) api.allOrders().then(setOrders).catch(() => {}); }, [user]);

  const updateStatus = async (id, status) => {
    try { await api.updateOrderStatus(id, status); setOrders(o => o.map(x => x._id===id ? { ...x, status } : x)); }
    catch (e) { setToast(e.message); }
  };

  const stats = [
    { label:"Total Products", value:products.length, icon:"📦" },
    { label:"Total Orders", value:orders.length, icon:"🧾" },
    { label:"Revenue", value:fmt(orders.reduce((s,o)=>s+(o.isPaid?o.totalPrice:0),0)), icon:"💰" },
    { label:"Users", value:"—", icon:"👥" },
  ];

  const saveProduct = async () => {
    try {
      const payload = { ...form, price: +form.price, stock: +form.stock };
      if (editProduct) {
        await api.updateProduct(editProduct._id, payload);
        setToast("Product updated");
      } else {
        await api.createProduct(payload);
        setToast("Product added");
      }
      loadProducts();
    } catch (e) { setToast(e.message); }
    setShowForm(false); setEditProduct(null); setForm({ name:"", price:"", category:"Electronics", stock:"", description:"", image:"" });
  };

  const deleteProduct = async (id) => {
    try { await api.deleteProduct(id); setToast("Product deleted"); loadProducts(); }
    catch (e) { setToast(e.message); }
  };

  const openEdit = (p) => { setEditProduct(p); setForm({ name:p.name, price:String(p.price), category:p.category, stock:String(p.stock), description:p.description, image:p.image }); setShowForm(true); };

  const statusColor = { Delivered:"#4ade80", Processing:"#f59e0b", Pending:"#60a5fa", Cancelled:"#f87171" };

  return (
    <div style={{ minHeight:"100vh", background:"#0a0a12", padding:"32px 20px" }}>
      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28 }}>
          <h1 style={{ color:"#fff", fontWeight:900, margin:0 }}>Admin Dashboard</h1>
          <button onClick={() => setPage("home")} style={{ background:"none", border:"1px solid #2a2a40", color:"#888", borderRadius:8, padding:"8px 16px", cursor:"pointer", fontSize:13 }}>← Store</button>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:16, marginBottom:28 }}>
          {stats.map(s => (
            <div key={s.label} style={{ background:"#0f0e17", border:"1px solid #1e1d2e", borderRadius:12, padding:20 }}>
              <p style={{ fontSize:28, margin:"0 0 8px" }}>{s.icon}</p>
              <p style={{ color:"#6c63ff", fontWeight:800, fontSize:22, margin:"0 0 4px" }}>{s.value}</p>
              <p style={{ color:"#555", fontSize:13, margin:0 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:8, marginBottom:20 }}>
          {["products","orders"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ background: tab===t?"#6c63ff":"#1a1a2e", color: tab===t?"#fff":"#888", border:"none", borderRadius:8, padding:"8px 20px", cursor:"pointer", fontWeight:600, textTransform:"capitalize" }}>{t}</button>
          ))}
        </div>

        {tab === "products" && (
          <>
            <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:16 }}>
              <button onClick={() => { setShowForm(!showForm); setEditProduct(null); setForm({ name:"", price:"", category:"Electronics", stock:"", description:"", image:"" }); }} style={{ background:"#6c63ff", color:"#fff", border:"none", borderRadius:8, padding:"10px 20px", cursor:"pointer", fontWeight:700, display:"flex", alignItems:"center", gap:8 }}>
                {Icon.plus} Add Product
              </button>
            </div>

            {showForm && (
              <div style={{ background:"#0f0e17", border:"1px solid #6c63ff44", borderRadius:12, padding:24, marginBottom:20 }}>
                <h3 style={{ color:"#fff", marginBottom:16 }}>{editProduct ? "Edit Product" : "New Product"}</h3>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                  {[["Product Name","name"],["Price (₦)","price"],["Stock","stock"]].map(([l,k]) => (
                    <div key={k}>
                      <label style={{ color:"#888", fontSize:12, display:"block", marginBottom:4 }}>{l}</label>
                      <input value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} style={{ width:"100%", background:"#1a1a2e", border:"1px solid #2a2a40", borderRadius:8, padding:"10px", color:"#fff", outline:"none", fontSize:14, boxSizing:"border-box" }} />
                    </div>
                  ))}
                  <div>
                    <label style={{ color:"#888", fontSize:12, display:"block", marginBottom:4 }}>Product Image</label>
                    <input type="file" accept="image/*" onChange={handleImageSelect} style={{ width:"100%", background:"#1a1a2e", border:"1px solid #2a2a40", borderRadius:8, padding:"8px", color:"#aaa", outline:"none", fontSize:13, boxSizing:"border-box" }} />
                    {uploading && <p style={{ color:"#6c63ff", fontSize:12, marginTop:4 }}>Uploading…</p>}
                    {form.image && !uploading && <img src={form.image} alt="preview" style={{ width:60, height:60, objectFit:"cover", borderRadius:6, marginTop:8 }} />}
                  </div>
                  <div>
                    <label style={{ color:"#888", fontSize:12, display:"block", marginBottom:4 }}>Category</label>
                    <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} style={{ width:"100%", background:"#1a1a2e", border:"1px solid #2a2a40", borderRadius:8, padding:"10px", color:"#fff", outline:"none", fontSize:14 }}>
                      {CATEGORIES.filter(c=>c!=="All").map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ color:"#888", fontSize:12, display:"block", marginBottom:4 }}>Description</label>
                    <input value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} style={{ width:"100%", background:"#1a1a2e", border:"1px solid #2a2a40", borderRadius:8, padding:"10px", color:"#fff", outline:"none", fontSize:14, boxSizing:"border-box" }} />
                  </div>
                </div>
                <div style={{ display:"flex", gap:10, marginTop:16 }}>
                  <button onClick={saveProduct} style={{ background:"#6c63ff", color:"#fff", border:"none", borderRadius:8, padding:"10px 24px", fontWeight:700, cursor:"pointer" }}>Save</button>
                  <button onClick={() => setShowForm(false)} style={{ background:"#1a1a2e", color:"#888", border:"1px solid #2a2a40", borderRadius:8, padding:"10px 24px", cursor:"pointer" }}>Cancel</button>
                </div>
              </div>
            )}

            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {products.map(p => (
                <div key={p._id} style={{ background:"#0f0e17", border:"1px solid #1e1d2e", borderRadius:10, padding:16, display:"flex", gap:14, alignItems:"center" }}>
                  <img src={p.image} alt={p.name} style={{ width:56, height:56, objectFit:"cover", borderRadius:8 }} />
                  <div style={{ flex:1 }}>
                    <p style={{ color:"#fff", fontWeight:700, margin:"0 0 2px", fontSize:14 }}>{p.name}</p>
                    <p style={{ color:"#555", fontSize:12, margin:0 }}>{p.category} • {p.stock} in stock</p>
                  </div>
                  <span style={{ color:"#6c63ff", fontWeight:700 }}>{fmt(p.price)}</span>
                  <button onClick={() => openEdit(p)} style={{ background:"#1a1a2e", border:"1px solid #2a2a40", color:"#aaa", borderRadius:6, padding:"6px 12px", cursor:"pointer", display:"flex", gap:4, alignItems:"center", fontSize:12 }}>{Icon.edit} Edit</button>
                  <button onClick={() => deleteProduct(p._id)} style={{ background:"#ff4b4b22", border:"1px solid #ff4b4b44", color:"#ff6b6b", borderRadius:6, padding:"6px 10px", cursor:"pointer", display:"flex" }}>{Icon.trash}</button>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "orders" && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {orders.map(o => (
              <div key={o._id} style={{ background:"#0f0e17", border:"1px solid #1e1d2e", borderRadius:10, padding:20, display:"flex", gap:16, alignItems:"center" }}>
                <div style={{ flex:1 }}>
                  <p style={{ color:"#fff", fontWeight:700, margin:"0 0 2px" }}>{o._id}</p>
                  <p style={{ color:"#555", fontSize:13, margin:0 }}>{o.user?.name} • {new Date(o.createdAt).toLocaleDateString()}</p>
                </div>
                <span style={{ color: statusColor[o.status], fontWeight:600, fontSize:13 }}>{o.status}</span>
                <span style={{ color:"#6c63ff", fontWeight:700 }}>{fmt(o.totalPrice)}</span>
                <select value={o.status} onChange={e => updateStatus(o._id, e.target.value)} style={{ background:"#1a1a2e", border:"1px solid #2a2a40", color:"#aaa", borderRadius:6, padding:"6px 10px", fontSize:12, outline:"none" }}>
                  {["Pending","Processing","Shipped","Delivered","Cancelled"].map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
            ))}
            {orders.length===0 && <p style={{ color:"#555" }}>No orders yet.</p>}
          </div>
        )}
      </div>
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer({ setPage }) {
  return (
    <footer style={{ background:"#0f0e17", borderTop:"1px solid #1e1d2e", padding:"40px 20px 24px" }}>
      <div style={{ maxWidth:1200, margin:"0 auto" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:32, marginBottom:32 }}>
          <div>
            <p style={{ color:"#fff", fontWeight:800, fontSize:18, marginBottom:8 }}>Market<span style={{ color:"#6c63ff" }}>Hub</span></p>
            <p style={{ color:"#555", fontSize:13, lineHeight:1.6 }}>Your one-stop shop for quality products across all categories.</p>
          </div>
          <div>
            <p style={{ color:"#888", fontWeight:600, marginBottom:12, fontSize:13 }}>SHOP</p>
            {CATEGORIES.filter(c=>c!=="All").map(c => (
              <p key={c} style={{ color:"#555", fontSize:13, marginBottom:6, cursor:"pointer" }}>{c}</p>
            ))}
          </div>
          <div>
            <p style={{ color:"#888", fontWeight:600, marginBottom:12, fontSize:13 }}>SUPPORT</p>
            {["Contact Us","Returns","Shipping","FAQ"].map(l => <p key={l} style={{ color:"#555", fontSize:13, marginBottom:6, cursor:"pointer" }}>{l}</p>)}
          </div>
          <div>
            <p style={{ color:"#888", fontWeight:600, marginBottom:12, fontSize:13 }}>PAYMENT</p>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              {["Visa","Mastercard","Paystack","Bank"].map(b => (
                <span key={b} style={{ background:"#1a1a2e", color:"#888", borderRadius:6, padding:"4px 10px", fontSize:11 }}>{b}</span>
              ))}
            </div>
          </div>
        </div>
        <div style={{ borderTop:"1px solid #1e1d2e", paddingTop:20, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:12 }}>
          <p style={{ color:"#444", fontSize:12, margin:0 }}>© 2025 MarketHub. All rights reserved.</p>
          <p style={{ color:"#444", fontSize:12, margin:0 }}>Built with React + Node.js + MongoDB</p>
        </div>
      </div>
    </footer>
  );
}

// ─── ORDER SUCCESS (Paystack redirect lands here) ────────────────────────────
function OrderSuccessPage({ setPage }) {
  const [, dispatch] = useContext(CartContext);
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("reference");
    if (!ref) { setStatus("error"); return; }
    api.verifyPayment(ref)
      .then(d => { if (d.verified) { dispatch({ type:"CLEAR" }); setStatus("success"); } else setStatus("failed"); })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div style={{ minHeight:"80vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"#0a0a12" }}>
      {status === "checking" && <p style={{ color:"#888" }}>Verifying payment…</p>}
      {status === "success" && (<>
        <div style={{ background:"#6c63ff22", border:"1px solid #6c63ff44", borderRadius:"50%", width:80, height:80, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:20 }}>
          <span style={{ color:"#6c63ff", fontSize:36 }}>{Icon.check}</span>
        </div>
        <h2 style={{ color:"#fff", fontWeight:900, marginBottom:8 }}>Order Placed!</h2>
        <p style={{ color:"#888", marginBottom:24 }}>Payment confirmed. You'll receive a confirmation soon.</p>
      </>)}
      {(status === "failed" || status === "error") && (<>
        <h2 style={{ color:"#ff6b6b", fontWeight:900, marginBottom:8 }}>Payment not confirmed</h2>
        <p style={{ color:"#888", marginBottom:24 }}>If you were charged, contact support with your reference.</p>
      </>)}
      <button onClick={() => setPage("home")} style={{ background:"#6c63ff", color:"#fff", border:"none", borderRadius:10, padding:"12px 28px", fontWeight:700, cursor:"pointer" }}>Continue Shopping</button>
    </div>
  );
}

// ─── AUTH PROVIDER ────────────────────────────────────────────────────────────
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (getToken()) api.profile().then(setUser).catch(() => localStorage.removeItem("token")).finally(() => setLoading(false));
    else setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    localStorage.setItem("token", data.token);
    setUser(data);
  };

  const register = async (name, email, password) => {
    const data = await api.register(name, email, password);
    localStorage.setItem("token", data.token);
    setUser(data);
  };

  const logout = () => { localStorage.removeItem("token"); setUser(null); };

  return <AuthContext.Provider value={{ user, login, register, logout, loading }}>{children}</AuthContext.Provider>;
}

// ─── PWA INSTALL BANNER ──────────────────────────────────────────────────────
function InstallBanner() {
  const [prompt, setPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setPrompt(e); setVisible(true); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const install = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setVisible(false);
  };

  if (!visible) return null;
  return (
    <div style={{ position:"fixed", bottom:0, left:0, right:0, background:"#0f0e17", borderTop:"1px solid #6c63ff44", padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", zIndex:999, gap:12 }}>
      <div>
        <p style={{ color:"#fff", fontWeight:700, margin:0, fontSize:14 }}>Install Karavan</p>
        <p style={{ color:"#888", fontSize:12, margin:0 }}>Add to your home screen for quick access</p>
      </div>
      <div style={{ display:"flex", gap:8 }}>
        <button onClick={() => setVisible(false)} style={{ background:"none", border:"1px solid #2a2a40", color:"#888", borderRadius:8, padding:"8px 14px", cursor:"pointer", fontSize:13 }}>Not now</button>
        <button onClick={install} style={{ background:"#6c63ff", color:"#fff", border:"none", borderRadius:8, padding:"8px 16px", fontWeight:700, cursor:"pointer", fontSize:13 }}>Install</button>
      </div>
    </div>
  );
}


export default function App() {
  const [page, setPage] = useState("home");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, dispatch] = useReducer(cartReducer, []);

  const renderPage = () => {
    switch (page) {
      case "home":     return <HomePage setPage={setPage} setSelectedProduct={setSelectedProduct} />;
      case "product":  return <ProductPage product={selectedProduct} setPage={setPage} />;
      case "cart":     return <CartPage setPage={setPage} />;
      case "checkout": return <CheckoutPage setPage={setPage} />;
      case "order-success": return <OrderSuccessPage setPage={setPage} />;
      case "login":    return <AuthPage mode="login" setPage={setPage} />;
      case "register": return <AuthPage mode="register" setPage={setPage} />;
      case "account":  return <AccountPage setPage={setPage} />;
      case "admin":    return <AdminPage setPage={setPage} />;
      default:         return <HomePage setPage={setPage} setSelectedProduct={setSelectedProduct} />;
    }
  };

  return (
    <AuthProvider>
      <CartContext.Provider value={[cart, dispatch]}>
        <div style={{ fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif", minHeight:"100vh" }}>
          <Navbar page={page} setPage={setPage} />
          {renderPage()}
          {page !== "admin" && <Footer setPage={setPage} />}
          <InstallBanner />
        </div>
      </CartContext.Provider>
    </AuthProvider>
  );
}
