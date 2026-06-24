import { useState, useEffect, createContext, useContext, useReducer } from "react";

// ─── CONTEXTS ─────────────────────────────────────────────────────────────────
const AuthCtx = createContext(null);
const CartCtx = createContext(null);

// ─── CART REDUCER ─────────────────────────────────────────────────────────────
function cartReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const ex = state.find(i => i._id === action.item._id);
      if (ex) return state.map(i => i._id === action.item._id ? { ...i, qty: i.qty + 1 } : i);
      return [...state, { ...action.item, qty: 1 }];
    }
    case "REMOVE": return state.filter(i => i._id !== action.id);
    case "QTY": return state.map(i => i._id === action.id ? { ...i, qty: action.qty } : i);
    case "CLEAR": return [];
    default: return state;
  }
}

// ─── MOCK DATA ─────────────────────────────────────────────────────────────────
const PRODUCTS = [
  { _id:"1", name:"Wireless Earbuds Pro", price:12500, category:"Electronics", image:"https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=500&q=80", rating:4.5, stock:20, description:"Premium sound with active noise cancellation and 30hr battery life." },
  { _id:"2", name:"Linen Blend Shirt", price:8900, category:"Fashion", image:"https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&q=80", rating:4.2, stock:15, description:"Breathable linen-cotton blend. Perfect for warm weather." },
  { _id:"3", name:"Ceramic Coffee Mug", price:3500, category:"Home", image:"https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&q=80", rating:4.8, stock:50, description:"Handcrafted ceramic mug, 350ml. Dishwasher safe." },
  { _id:"4", name:"Yoga Mat Premium", price:15000, category:"Sports", image:"https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=500&q=80", rating:4.6, stock:12, description:"Non-slip, 6mm thick. Eco-friendly materials." },
  { _id:"5", name:"Leather Wallet", price:6500, category:"Fashion", image:"https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&q=80", rating:4.3, stock:30, description:"Slim bifold. Genuine leather, RFID blocking." },
  { _id:"6", name:"LED Desk Lamp", price:9800, category:"Electronics", image:"https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80", rating:4.4, stock:8, description:"Touch control, 5 brightness levels, USB-C charging." },
  { _id:"7", name:"Steel Water Bottle", price:4200, category:"Home", image:"https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&q=80", rating:4.7, stock:45, description:"750ml. Keeps cold 24h, hot 12h. BPA-free." },
  { _id:"8", name:"Running Shoes", price:22000, category:"Sports", image:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80", rating:4.5, stock:18, description:"Lightweight foam sole with breathable mesh upper." },
  { _id:"9", name:"Sunglasses Classic", price:7800, category:"Fashion", image:"https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&q=80", rating:4.1, stock:25, description:"UV400 protection. Polarised lenses. Unisex design." },
  { _id:"10", name:"Bluetooth Speaker", price:18500, category:"Electronics", image:"https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80", rating:4.6, stock:10, description:"360° surround sound. 12hr battery. Waterproof." },
  { _id:"11", name:"Scented Candle Set", price:5500, category:"Home", image:"https://images.unsplash.com/photo-1602607813742-e64ea0d14b5e?w=500&q=80", rating:4.9, stock:35, description:"Pack of 3. Lavender, vanilla, sandalwood." },
  { _id:"12", name:"Jump Rope Pro", price:3200, category:"Sports", image:"https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=500&q=80", rating:4.3, stock:60, description:"Ball bearing handles. Adjustable cable length." },
];

const CATS = ["All","Electronics","Fashion","Home","Sports"];
const fmt = n => `₦${Number(n).toLocaleString()}`;
const stars = r => "★".repeat(Math.round(r)) + "☆".repeat(5-Math.round(r));

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 2800); return () => clearTimeout(t); }, []);
  return (
    <div style={{position:"fixed",bottom:80,right:16,background:"#1a1a2e",color:"#fff",padding:"12px 18px",borderRadius:10,fontSize:13,zIndex:9999,boxShadow:"0 8px 32px rgba(0,0,0,.4)",border:"1px solid #6c63ff44",display:"flex",alignItems:"center",gap:8}}>
      <span style={{color:"#6c63ff",fontSize:16}}>✓</span> {msg}
    </div>
  );
}

// ─── NAVBAR ──────────────────────────────────────────────────────────────────
function Navbar({ page, setPage }) {
  const { user, logout } = useContext(AuthCtx);
  const [cart] = useContext(CartCtx);
  const count = cart.reduce((s,i) => s+i.qty, 0);
  return (
    <nav style={{background:"#0f0e17",borderBottom:"1px solid #1e1d2e",position:"sticky",top:0,zIndex:100}}>
      <div style={{maxWidth:1200,margin:"0 auto",padding:"0 16px",display:"flex",alignItems:"center",justifyContent:"space-between",height:60}}>
        <button onClick={() => setPage("home")} style={{background:"none",border:"none",cursor:"pointer",fontWeight:900,fontSize:22,color:"#6c63ff",letterSpacing:"-1px"}}>
          K<span style={{color:"#fff"}}>aravan</span>
        </button>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          {user ? (
            <>
              <button onClick={() => setPage("account")} style={{background:"none",border:"none",cursor:"pointer",color:"#aaa",fontSize:13,display:"flex",alignItems:"center",gap:4}}>
                <span style={{width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#6c63ff,#a855f7)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:"#fff"}}>{user.name[0]}</span>
              </button>
              {user.isAdmin && <button onClick={() => setPage("admin")} style={{background:"#6c63ff22",border:"1px solid #6c63ff55",color:"#6c63ff",borderRadius:6,padding:"4px 10px",fontSize:12,fontWeight:700,cursor:"pointer"}}>Admin</button>}
              <button onClick={() => { logout(); setPage("home"); }} style={{background:"none",border:"none",color:"#555",cursor:"pointer",fontSize:12}}>Sign out</button>
            </>
          ) : (
            <button onClick={() => setPage("login")} style={{background:"none",border:"1px solid #2a2a40",color:"#aaa",borderRadius:8,padding:"6px 14px",fontSize:13,cursor:"pointer"}}>Sign in</button>
          )}
          <button onClick={() => setPage("cart")} style={{background:"none",border:"none",cursor:"pointer",color:"#fff",position:"relative",display:"flex"}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            {count>0 && <span style={{position:"absolute",top:-6,right:-6,background:"#6c63ff",color:"#fff",borderRadius:"50%",width:17,height:17,fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700}}>{count}</span>}
          </button>
        </div>
      </div>
    </nav>
  );
}

// ─── HOME ────────────────────────────────────────────────────────────────────
function Home({ setPage, setProduct }) {
  const [,dispatch] = useContext(CartCtx);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState("default");
  const [toast, setToast] = useState(null);

  let list = PRODUCTS
    .filter(p => cat==="All" || p.category===cat)
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  if (sort==="low") list=[...list].sort((a,b)=>a.price-b.price);
  if (sort==="high") list=[...list].sort((a,b)=>b.price-a.price);
  if (sort==="top") list=[...list].sort((a,b)=>b.rating-a.rating);

  const add = p => { dispatch({type:"ADD",item:p}); setToast(`${p.name} added!`); };

  return (
    <div style={{background:"#0a0a12",minHeight:"100vh"}}>
      {/* Hero */}
      <div style={{background:"linear-gradient(135deg,#130d2e 0%,#0f0e17 50%,#0d0b20 100%)",padding:"56px 20px 40px",textAlign:"center"}}>
        <p style={{color:"#6c63ff",fontWeight:700,fontSize:12,letterSpacing:3,textTransform:"uppercase",marginBottom:14}}>Nigeria's General Store</p>
        <h1 style={{color:"#fff",fontSize:"clamp(2rem,7vw,3.8rem)",fontWeight:900,lineHeight:1.1,margin:"0 0 14px"}}>
          Everything you need,<br/><span style={{background:"linear-gradient(90deg,#8b7fff,#6c63ff)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>delivered to you</span>
        </h1>
        <p style={{color:"#666",fontSize:15,marginBottom:32}}>Quality products. Secure checkout. Fast delivery across Nigeria.</p>
        <div style={{display:"flex",maxWidth:500,margin:"0 auto",background:"#1a1a2e",borderRadius:12,border:"1px solid #2a2a40",overflow:"hidden"}}>
          <span style={{padding:"0 14px",display:"flex",alignItems:"center",color:"#555"}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="17" height="17"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products…" style={{flex:1,background:"none",border:"none",outline:"none",color:"#fff",fontSize:15,padding:"14px 0"}} />
        </div>
      </div>

      {/* Filters */}
      <div style={{background:"#0f0e17",borderBottom:"1px solid #1e1d2e"}}>
        <div style={{maxWidth:1200,margin:"0 auto",padding:"10px 16px",display:"flex",gap:8,overflowX:"auto",alignItems:"center"}}>
          {CATS.map(c => (
            <button key={c} onClick={()=>setCat(c)} style={{background:cat===c?"#6c63ff":"#1a1a2e",color:cat===c?"#fff":"#888",border:"none",borderRadius:20,padding:"6px 16px",cursor:"pointer",whiteSpace:"nowrap",fontSize:13,fontWeight:600,flexShrink:0}}>
              {c}
            </button>
          ))}
          <select value={sort} onChange={e=>setSort(e.target.value)} style={{marginLeft:"auto",background:"#1a1a2e",color:"#888",border:"1px solid #2a2a40",borderRadius:8,padding:"6px 10px",fontSize:12,outline:"none",flexShrink:0}}>
            <option value="default">Sort</option>
            <option value="low">Price ↑</option>
            <option value="high">Price ↓</option>
            <option value="top">Top rated</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div style={{maxWidth:1200,margin:"0 auto",padding:"28px 16px"}}>
        <p style={{color:"#444",fontSize:13,marginBottom:20}}>{list.length} products</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:20}}>
          {list.map(p => (
            <div key={p._id} style={{background:"#0f0e17",border:"1px solid #1e1d2e",borderRadius:14,overflow:"hidden",display:"flex",flexDirection:"column",cursor:"pointer",transition:"transform .2s,box-shadow .2s"}}
              onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow="0 12px 40px rgba(108,99,255,.2)";}}
              onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>
              <div style={{position:"relative"}} onClick={()=>{setProduct(p);setPage("product");}}>
                <img src={p.image} alt={p.name} style={{width:"100%",height:190,objectFit:"cover",display:"block"}} />
                <span style={{position:"absolute",top:10,left:10,background:"rgba(10,10,18,.85)",color:"#6c63ff",border:"1px solid #6c63ff44",borderRadius:6,padding:"3px 10px",fontSize:11,fontWeight:700,backdropFilter:"blur(4px)"}}>{p.category}</span>
              </div>
              <div style={{padding:"14px 14px 16px",flex:1,display:"flex",flexDirection:"column"}}>
                <p onClick={()=>{setProduct(p);setPage("product");}} style={{color:"#fff",fontWeight:700,fontSize:14,margin:"0 0 5px",lineHeight:1.3}}>{p.name}</p>
                <p style={{color:"#6c63ff",fontSize:12,margin:"0 0 10px"}}>{stars(p.rating)}</p>
                <p style={{color:"#fff",fontWeight:900,fontSize:19,margin:"0 0 14px"}}>{fmt(p.price)}</p>
                <button onClick={()=>add(p)} style={{marginTop:"auto",background:"#6c63ff",color:"#fff",border:"none",borderRadius:8,padding:"10px",fontWeight:700,fontSize:14,cursor:"pointer"}}>
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
        {list.length===0 && <div style={{textAlign:"center",color:"#444",padding:60,fontSize:15}}>No products match "{search}"</div>}
      </div>

      {/* Features */}
      <div style={{background:"#0f0e17",borderTop:"1px solid #1e1d2e",padding:"40px 20px"}}>
        <div style={{maxWidth:900,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:24,textAlign:"center"}}>
          {[["🚚","Fast Delivery","Across all 36 states"],["🔒","Secure Payment","Paystack protected"],["↩️","Easy Returns","7-day return policy"],["💬","24/7 Support","Always here to help"]].map(([i,t,s])=>(
            <div key={t}>
              <div style={{fontSize:28,marginBottom:8}}>{i}</div>
              <p style={{color:"#fff",fontWeight:700,margin:"0 0 4px",fontSize:14}}>{t}</p>
              <p style={{color:"#555",fontSize:12,margin:0}}>{s}</p>
            </div>
          ))}
        </div>
      </div>

      {toast && <Toast msg={toast} onClose={()=>setToast(null)} />}
    </div>
  );
}

// ─── PRODUCT DETAIL ──────────────────────────────────────────────────────────
function ProductDetail({ product, setPage }) {
  const [,dispatch] = useContext(CartCtx);
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState(null);
  if (!product) return null;

  const add = () => {
    for (let i=0;i<qty;i++) dispatch({type:"ADD",item:product});
    setToast("Added to cart!");
  };

  return (
    <div style={{background:"#0a0a12",minHeight:"100vh",padding:"32px 20px"}}>
      <div style={{maxWidth:900,margin:"0 auto"}}>
        <button onClick={()=>setPage("home")} style={{background:"none",border:"none",color:"#6c63ff",cursor:"pointer",fontSize:14,marginBottom:24,display:"flex",alignItems:"center",gap:6}}>
          ← Back
        </button>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:32,background:"#0f0e17",border:"1px solid #1e1d2e",borderRadius:16,overflow:"hidden"}}>
          <img src={product.image} alt={product.name} style={{width:"100%",height:"100%",minHeight:320,objectFit:"cover",display:"block"}} />
          <div style={{padding:28}}>
            <span style={{background:"#6c63ff22",color:"#6c63ff",border:"1px solid #6c63ff44",borderRadius:6,padding:"3px 12px",fontSize:12,fontWeight:700}}>{product.category}</span>
            <h1 style={{color:"#fff",fontSize:24,fontWeight:900,margin:"14px 0 8px"}}>{product.name}</h1>
            <p style={{color:"#6c63ff",fontSize:13,marginBottom:8}}>{stars(product.rating)} {product.rating}/5</p>
            <p style={{color:"#777",lineHeight:1.7,marginBottom:20,fontSize:14}}>{product.description}</p>
            <p style={{color:"#fff",fontWeight:900,fontSize:30,marginBottom:8}}>{fmt(product.price)}</p>
            <p style={{color:product.stock>5?"#4ade80":"#f59e0b",fontSize:13,marginBottom:20}}>{product.stock} in stock</p>
            <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:20}}>
              <button onClick={()=>setQty(q=>Math.max(1,q-1))} style={{background:"#1a1a2e",border:"1px solid #2a2a40",color:"#fff",borderRadius:8,width:36,height:36,cursor:"pointer",fontSize:18}}>−</button>
              <span style={{color:"#fff",fontWeight:700,minWidth:28,textAlign:"center",fontSize:16}}>{qty}</span>
              <button onClick={()=>setQty(q=>Math.min(product.stock,q+1))} style={{background:"#1a1a2e",border:"1px solid #2a2a40",color:"#fff",borderRadius:8,width:36,height:36,cursor:"pointer",fontSize:18}}>+</button>
            </div>
            <button onClick={add} style={{background:"#6c63ff",color:"#fff",border:"none",borderRadius:10,padding:"14px",fontWeight:800,fontSize:15,cursor:"pointer",width:"100%"}}>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
      {toast && <Toast msg={toast} onClose={()=>setToast(null)} />}
    </div>
  );
}

// ─── CART ────────────────────────────────────────────────────────────────────
function Cart({ setPage }) {
  const [cart,dispatch] = useContext(CartCtx);
  const { user } = useContext(AuthCtx);
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);

  if (!cart.length) return (
    <div style={{minHeight:"80vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#0a0a12"}}>
      <div style={{fontSize:56,marginBottom:16}}>🛒</div>
      <p style={{color:"#555",fontSize:16,marginBottom:20}}>Your cart is empty</p>
      <button onClick={()=>setPage("home")} style={{background:"#6c63ff",color:"#fff",border:"none",borderRadius:10,padding:"12px 28px",fontWeight:700,cursor:"pointer"}}>Shop Now</button>
    </div>
  );

  return (
    <div style={{background:"#0a0a12",minHeight:"100vh",padding:"32px 16px"}}>
      <div style={{maxWidth:760,margin:"0 auto"}}>
        <h1 style={{color:"#fff",fontWeight:900,marginBottom:28,fontSize:24}}>Your Cart <span style={{color:"#555",fontWeight:400,fontSize:16}}>({cart.length} items)</span></h1>
        <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:24}}>
          {cart.map(item=>(
            <div key={item._id} style={{background:"#0f0e17",border:"1px solid #1e1d2e",borderRadius:12,padding:14,display:"flex",gap:14,alignItems:"center"}}>
              <img src={item.image} alt={item.name} style={{width:70,height:70,objectFit:"cover",borderRadius:8,flexShrink:0}} />
              <div style={{flex:1,minWidth:0}}>
                <p style={{color:"#fff",fontWeight:700,fontSize:13,margin:"0 0 4px",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{item.name}</p>
                <p style={{color:"#6c63ff",fontWeight:800,margin:0}}>{fmt(item.price)}</p>
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
                <button onClick={()=>dispatch({type:"QTY",id:item._id,qty:Math.max(1,item.qty-1)})} style={{background:"#1a1a2e",border:"1px solid #2a2a40",color:"#fff",borderRadius:6,width:28,height:28,cursor:"pointer"}}>−</button>
                <span style={{color:"#fff",minWidth:18,textAlign:"center",fontSize:13}}>{item.qty}</span>
                <button onClick={()=>dispatch({type:"QTY",id:item._id,qty:item.qty+1})} style={{background:"#1a1a2e",border:"1px solid #2a2a40",color:"#fff",borderRadius:6,width:28,height:28,cursor:"pointer"}}>+</button>
              </div>
              <p style={{color:"#fff",fontWeight:700,minWidth:70,textAlign:"right",fontSize:13,flexShrink:0}}>{fmt(item.price*item.qty)}</p>
              <button onClick={()=>dispatch({type:"REMOVE",id:item._id})} style={{background:"none",border:"none",color:"#555",cursor:"pointer",fontSize:16,flexShrink:0}}>✕</button>
            </div>
          ))}
        </div>
        <div style={{background:"#0f0e17",border:"1px solid #1e1d2e",borderRadius:12,padding:22}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,color:"#888",fontSize:14}}><span>Subtotal</span><span>{fmt(total)}</span></div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:16,color:"#888",fontSize:14}}><span>Delivery</span><span style={{color:"#4ade80"}}>Free</span></div>
          <div style={{height:1,background:"#1e1d2e",marginBottom:16}} />
          <div style={{display:"flex",justifyContent:"space-between",color:"#fff",fontWeight:900,fontSize:20,marginBottom:20}}>
            <span>Total</span><span style={{color:"#6c63ff"}}>{fmt(total)}</span>
          </div>
          <button onClick={()=>user?setPage("checkout"):setPage("login")} style={{background:"#6c63ff",color:"#fff",border:"none",borderRadius:10,padding:"14px",fontWeight:800,fontSize:15,cursor:"pointer",width:"100%"}}>
            {user?"Proceed to Checkout →":"Sign in to Checkout"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── CHECKOUT ─────────────────────────────────────────────────────────────────
function Checkout({ setPage }) {
  const [cart,dispatch] = useContext(CartCtx);
  const { user } = useContext(AuthCtx);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name:user?.name||"", email:user?.email||"", phone:"", address:"", city:"", state:"Lagos" });
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);

  const pay = () => {
    setPaying(true);
    setTimeout(()=>{ setDone(true); dispatch({type:"CLEAR"}); }, 2000);
  };

  if (done) return (
    <div style={{minHeight:"80vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#0a0a12",gap:16}}>
      <div style={{width:72,height:72,borderRadius:"50%",background:"#6c63ff22",border:"2px solid #6c63ff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28}}>✓</div>
      <h2 style={{color:"#fff",fontWeight:900,margin:0}}>Order Placed!</h2>
      <p style={{color:"#888",margin:0}}>We'll send you a confirmation shortly.</p>
      <button onClick={()=>setPage("home")} style={{background:"#6c63ff",color:"#fff",border:"none",borderRadius:10,padding:"12px 28px",fontWeight:700,cursor:"pointer"}}>Continue Shopping</button>
    </div>
  );

  const STATES = ["Lagos","Abuja","Rivers","Oyo","Delta","Edo","Kano","Anambra","Enugu","Kaduna"];

  return (
    <div style={{background:"#0a0a12",minHeight:"100vh",padding:"32px 16px"}}>
      <div style={{maxWidth:640,margin:"0 auto"}}>
        <h1 style={{color:"#fff",fontWeight:900,marginBottom:24,fontSize:24}}>Checkout</h1>

        {/* Steps */}
        <div style={{display:"flex",alignItems:"center",gap:0,marginBottom:28}}>
          {["Delivery","Payment","Review"].map((s,i)=>(
            <div key={s} style={{display:"flex",alignItems:"center",flex: i<2?1:"auto"}}>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{width:26,height:26,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:12,background:step>i+1?"#6c63ff":step===i+1?"#6c63ff":"#1a1a2e",color:step>=i+1?"#fff":"#555",border:step===i+1?"2px solid #8b7fff":"2px solid transparent"}}>{step>i+1?"✓":i+1}</span>
                <span style={{color:step===i+1?"#fff":"#555",fontSize:13,fontWeight:step===i+1?700:400}}>{s}</span>
              </div>
              {i<2 && <div style={{flex:1,height:1,background:"#2a2a40",margin:"0 10px"}} />}
            </div>
          ))}
        </div>

        {step===1 && (
          <div style={{background:"#0f0e17",border:"1px solid #1e1d2e",borderRadius:12,padding:24}}>
            <h3 style={{color:"#fff",fontWeight:700,marginBottom:20,margin:"0 0 20px"}}>Delivery Details</h3>
            {[["Full Name","name","text"],["Email","email","email"],["Phone","phone","tel"],["Address","address","text"],["City","city","text"]].map(([l,k,t])=>(
              <div key={k} style={{marginBottom:14}}>
                <label style={{color:"#888",fontSize:12,display:"block",marginBottom:5}}>{l}</label>
                <input type={t} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} style={{width:"100%",background:"#1a1a2e",border:"1px solid #2a2a40",borderRadius:8,padding:"11px",color:"#fff",outline:"none",fontSize:14,boxSizing:"border-box"}} />
              </div>
            ))}
            <div style={{marginBottom:20}}>
              <label style={{color:"#888",fontSize:12,display:"block",marginBottom:5}}>State</label>
              <select value={form.state} onChange={e=>setForm(f=>({...f,state:e.target.value}))} style={{width:"100%",background:"#1a1a2e",border:"1px solid #2a2a40",borderRadius:8,padding:"11px",color:"#fff",outline:"none",fontSize:14}}>
                {STATES.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <button onClick={()=>setStep(2)} style={{background:"#6c63ff",color:"#fff",border:"none",borderRadius:10,padding:"13px",fontWeight:700,cursor:"pointer",width:"100%",fontSize:15}}>Continue →</button>
          </div>
        )}

        {step===2 && (
          <div style={{background:"#0f0e17",border:"1px solid #1e1d2e",borderRadius:12,padding:24}}>
            <h3 style={{color:"#fff",fontWeight:700,margin:"0 0 20px"}}>Payment Method</h3>
            <div style={{background:"#6c63ff11",border:"2px solid #6c63ff",borderRadius:10,padding:16,display:"flex",gap:14,alignItems:"center",marginBottom:16}}>
              <span style={{fontSize:26}}>💳</span>
              <div>
                <p style={{color:"#fff",fontWeight:700,margin:"0 0 2px"}}>Paystack</p>
                <p style={{color:"#888",fontSize:13,margin:0}}>Card, bank transfer, USSD — all secured</p>
              </div>
              <span style={{marginLeft:"auto",color:"#6c63ff",fontSize:18}}>✓</span>
            </div>
            <p style={{color:"#555",fontSize:13,marginBottom:20}}>Total: <strong style={{color:"#6c63ff"}}>{fmt(total)}</strong> will be charged via Paystack's secure page.</p>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>setStep(1)} style={{flex:1,background:"#1a1a2e",color:"#aaa",border:"1px solid #2a2a40",borderRadius:10,padding:"12px",fontWeight:700,cursor:"pointer"}}>Back</button>
              <button onClick={()=>setStep(3)} style={{flex:2,background:"#6c63ff",color:"#fff",border:"none",borderRadius:10,padding:"12px",fontWeight:700,cursor:"pointer",fontSize:15}}>Review Order →</button>
            </div>
          </div>
        )}

        {step===3 && (
          <div style={{background:"#0f0e17",border:"1px solid #1e1d2e",borderRadius:12,padding:24}}>
            <h3 style={{color:"#fff",fontWeight:700,margin:"0 0 16px"}}>Review & Pay</h3>
            {cart.map(i=>(
              <div key={i._id} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid #1a1a2e",fontSize:14}}>
                <span style={{color:"#aaa"}}>{i.name} × {i.qty}</span>
                <span style={{color:"#fff",fontWeight:600}}>{fmt(i.price*i.qty)}</span>
              </div>
            ))}
            <div style={{display:"flex",justifyContent:"space-between",padding:"16px 0 0",color:"#fff",fontWeight:900,fontSize:20}}>
              <span>Total</span><span style={{color:"#6c63ff"}}>{fmt(total)}</span>
            </div>
            <div style={{display:"flex",gap:10,marginTop:20}}>
              <button onClick={()=>setStep(2)} style={{flex:1,background:"#1a1a2e",color:"#aaa",border:"1px solid #2a2a40",borderRadius:10,padding:"12px",fontWeight:700,cursor:"pointer"}}>Back</button>
              <button onClick={pay} disabled={paying} style={{flex:2,background:paying?"#4a3fa0":"#6c63ff",color:"#fff",border:"none",borderRadius:10,padding:"12px",fontWeight:800,cursor:"pointer",fontSize:16}}>
                {paying?"Processing…":`Pay ${fmt(total)}`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
function Auth({ mode, setPage }) {
  const { login, register } = useContext(AuthCtx);
  const [form, setForm] = useState({name:"",email:"",password:""});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isLogin = mode==="login";

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
    <div style={{minHeight:"100vh",background:"#0a0a12",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:"#0f0e17",border:"1px solid #1e1d2e",borderRadius:16,padding:36,width:"100%",maxWidth:400}}>
        <h2 style={{color:"#fff",fontWeight:900,margin:"0 0 4px",textAlign:"center",fontSize:22}}>{isLogin?"Welcome back":"Create account"}</h2>
        <p style={{color:"#555",textAlign:"center",marginBottom:26,fontSize:13}}>{isLogin?"Sign in to continue shopping":"Join Karavan today"}</p>

        {error && <div style={{background:"#ff4b4b22",border:"1px solid #ff4b4b55",color:"#ff7070",borderRadius:8,padding:"10px 14px",marginBottom:16,fontSize:13}}>{error}</div>}

        {!isLogin && (
          <div style={{marginBottom:14}}>
            <label style={{color:"#888",fontSize:12,display:"block",marginBottom:5}}>Full Name</label>
            <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Amaka Johnson" style={{width:"100%",background:"#1a1a2e",border:"1px solid #2a2a40",borderRadius:8,padding:"11px",color:"#fff",outline:"none",fontSize:14,boxSizing:"border-box"}} />
          </div>
        )}
        <div style={{marginBottom:14}}>
          <label style={{color:"#888",fontSize:12,display:"block",marginBottom:5}}>Email</label>
          <input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} placeholder="you@email.com" style={{width:"100%",background:"#1a1a2e",border:"1px solid #2a2a40",borderRadius:8,padding:"11px",color:"#fff",outline:"none",fontSize:14,boxSizing:"border-box"}} />
        </div>
        <div style={{marginBottom:24}}>
          <label style={{color:"#888",fontSize:12,display:"block",marginBottom:5}}>Password</label>
          <input type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} placeholder="••••••••" style={{width:"100%",background:"#1a1a2e",border:"1px solid #2a2a40",borderRadius:8,padding:"11px",color:"#fff",outline:"none",fontSize:14,boxSizing:"border-box"}} />
        </div>
        <button onClick={submit} disabled={loading} style={{width:"100%",background:"#6c63ff",color:"#fff",border:"none",borderRadius:10,padding:"13px",fontWeight:800,fontSize:15,cursor:"pointer"}}>
          {loading?"Please wait…":isLogin?"Sign In":"Create Account"}
        </button>
        <p style={{textAlign:"center",color:"#555",fontSize:13,marginTop:18}}>
          {isLogin?"No account? ":"Have an account? "}
          <button onClick={()=>setPage(isLogin?"register":"login")} style={{background:"none",border:"none",color:"#6c63ff",cursor:"pointer",fontWeight:700,fontSize:13}}>
            {isLogin?"Register →":"Sign in →"}
          </button>
        </p>
        {isLogin && <p style={{textAlign:"center",color:"#444",fontSize:11,marginTop:8}}>Demo admin: admin@karavan.com / admin123</p>}
      </div>
    </div>
  );
}

// ─── ACCOUNT ─────────────────────────────────────────────────────────────────
function Account({ setPage }) {
  const { user, logout } = useContext(AuthCtx);
  if (!user) { setPage("login"); return null; }
  const orders = [
    { id:"KRV-001", date:"2025-06-10", total:21400, status:"Delivered", items:2 },
    { id:"KRV-002", date:"2025-06-19", total:9800, status:"Processing", items:1 },
  ];
  const sc = { Delivered:"#4ade80", Processing:"#f59e0b", Shipped:"#60a5fa", Cancelled:"#f87171" };
  return (
    <div style={{background:"#0a0a12",minHeight:"100vh",padding:"32px 16px"}}>
      <div style={{maxWidth:680,margin:"0 auto"}}>
        <div style={{background:"#0f0e17",border:"1px solid #1e1d2e",borderRadius:14,padding:24,marginBottom:20,display:"flex",gap:16,alignItems:"center"}}>
          <div style={{width:52,height:52,borderRadius:"50%",background:"linear-gradient(135deg,#6c63ff,#a855f7)",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:20,color:"#fff",flexShrink:0}}>{user.name[0]}</div>
          <div style={{flex:1}}>
            <p style={{color:"#fff",fontWeight:800,margin:"0 0 2px"}}>{user.name}</p>
            <p style={{color:"#555",margin:0,fontSize:13}}>{user.email}</p>
          </div>
          <button onClick={()=>{logout();setPage("home");}} style={{background:"none",border:"1px solid #2a2a40",color:"#888",borderRadius:8,padding:"7px 14px",cursor:"pointer",fontSize:13}}>Sign Out</button>
        </div>
        <h3 style={{color:"#fff",fontWeight:700,marginBottom:14,fontSize:16}}>Order History</h3>
        {orders.map(o=>(
          <div key={o.id} style={{background:"#0f0e17",border:"1px solid #1e1d2e",borderRadius:12,padding:18,display:"flex",gap:14,alignItems:"center",marginBottom:10}}>
            <div style={{flex:1}}>
              <p style={{color:"#fff",fontWeight:700,margin:"0 0 3px",fontSize:14}}>{o.id}</p>
              <p style={{color:"#555",fontSize:12,margin:0}}>{o.date} · {o.items} item{o.items>1?"s":""}</p>
            </div>
            <span style={{color:sc[o.status],fontSize:13,fontWeight:600}}>{o.status}</span>
            <span style={{color:"#6c63ff",fontWeight:800}}>{fmt(o.total)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ADMIN ────────────────────────────────────────────────────────────────────
function Admin({ setPage }) {
  const { user } = useContext(AuthCtx);
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState(PRODUCTS);
  const [showForm, setShowForm] = useState(false);
  const [editP, setEditP] = useState(null);
  const [form, setForm] = useState({ name:"",price:"",category:"Electronics",stock:"",description:"",image:"" });
  const [toast, setToast] = useState(null);

  if (!user?.isAdmin) return (
    <div style={{minHeight:"80vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#0a0a12",gap:14}}>
      <p style={{color:"#ff6b6b",fontSize:18}}>Access Denied</p>
      <button onClick={()=>setPage("home")} style={{background:"#6c63ff",color:"#fff",border:"none",borderRadius:8,padding:"10px 24px",cursor:"pointer",fontWeight:700}}>Go Home</button>
    </div>
  );

  const save = () => {
    if (editP) setProducts(p=>p.map(x=>x._id===editP._id?{...x,...form,price:+form.price,stock:+form.stock}:x));
    else setProducts(p=>[...p,{...form,_id:Date.now().toString(),price:+form.price,stock:+form.stock,rating:4.0}]);
    setToast(editP?"Product updated":"Product added");
    setShowForm(false); setEditP(null); setForm({name:"",price:"",category:"Electronics",stock:"",description:"",image:""});
  };

  const del = id => { setProducts(p=>p.filter(x=>x._id!==id)); setToast("Deleted"); };
  const openEdit = p => { setEditP(p); setForm({name:p.name,price:String(p.price),category:p.category,stock:String(p.stock),description:p.description,image:p.image}); setShowForm(true); };

  const MOCK_ORDERS = [
    {id:"KRV-001",customer:"Amaka J.",total:21400,status:"Delivered",date:"2025-06-10"},
    {id:"KRV-002",customer:"Emeka O.",total:9800,status:"Processing",date:"2025-06-18"},
    {id:"KRV-003",customer:"Bola A.",total:34000,status:"Pending",date:"2025-06-19"},
  ];
  const sc = {Delivered:"#4ade80",Processing:"#f59e0b",Pending:"#60a5fa",Cancelled:"#f87171"};
  const stats = [{l:"Products",v:products.length,i:"📦"},{l:"Orders",v:MOCK_ORDERS.length,i:"🧾"},{l:"Revenue",v:fmt(MOCK_ORDERS.reduce((s,o)=>s+o.total,0)),i:"💰"},{l:"Users",v:12,i:"👥"}];

  return (
    <div style={{background:"#0a0a12",minHeight:"100vh",padding:"28px 16px"}}>
      <div style={{maxWidth:1080,margin:"0 auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <h1 style={{color:"#fff",fontWeight:900,margin:0,fontSize:22}}>Admin Dashboard</h1>
          <button onClick={()=>setPage("home")} style={{background:"none",border:"1px solid #2a2a40",color:"#888",borderRadius:8,padding:"7px 14px",cursor:"pointer",fontSize:13}}>← Store</button>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:14,marginBottom:24}}>
          {stats.map(s=>(
            <div key={s.l} style={{background:"#0f0e17",border:"1px solid #1e1d2e",borderRadius:12,padding:18}}>
              <p style={{fontSize:24,margin:"0 0 8px"}}>{s.i}</p>
              <p style={{color:"#6c63ff",fontWeight:800,fontSize:22,margin:"0 0 2px"}}>{s.v}</p>
              <p style={{color:"#555",fontSize:12,margin:0}}>{s.l}</p>
            </div>
          ))}
        </div>

        <div style={{display:"flex",gap:8,marginBottom:18}}>
          {["products","orders"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{background:tab===t?"#6c63ff":"#1a1a2e",color:tab===t?"#fff":"#888",border:"none",borderRadius:8,padding:"8px 18px",cursor:"pointer",fontWeight:600,textTransform:"capitalize"}}>{t}</button>
          ))}
        </div>

        {tab==="products" && (
          <>
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:14}}>
              <button onClick={()=>{setShowForm(!showForm);setEditP(null);setForm({name:"",price:"",category:"Electronics",stock:"",description:"",image:""}); }} style={{background:"#6c63ff",color:"#fff",border:"none",borderRadius:8,padding:"9px 18px",cursor:"pointer",fontWeight:700,fontSize:14}}>+ Add Product</button>
            </div>
            {showForm && (
              <div style={{background:"#0f0e17",border:"1px solid #6c63ff44",borderRadius:12,padding:22,marginBottom:16}}>
                <h3 style={{color:"#fff",margin:"0 0 16px",fontSize:15}}>{editP?"Edit Product":"New Product"}</h3>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                  {[["Name","name"],["Price (₦)","price"],["Stock","stock"],["Image URL","image"]].map(([l,k])=>(
                    <div key={k}>
                      <label style={{color:"#888",fontSize:11,display:"block",marginBottom:4}}>{l}</label>
                      <input value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} style={{width:"100%",background:"#1a1a2e",border:"1px solid #2a2a40",borderRadius:7,padding:"9px",color:"#fff",outline:"none",fontSize:13,boxSizing:"border-box"}} />
                    </div>
                  ))}
                  <div>
                    <label style={{color:"#888",fontSize:11,display:"block",marginBottom:4}}>Category</label>
                    <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} style={{width:"100%",background:"#1a1a2e",border:"1px solid #2a2a40",borderRadius:7,padding:"9px",color:"#fff",outline:"none",fontSize:13}}>
                      {CATS.filter(c=>c!=="All").map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{color:"#888",fontSize:11,display:"block",marginBottom:4}}>Description</label>
                    <input value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} style={{width:"100%",background:"#1a1a2e",border:"1px solid #2a2a40",borderRadius:7,padding:"9px",color:"#fff",outline:"none",fontSize:13,boxSizing:"border-box"}} />
                  </div>
                </div>
                <div style={{display:"flex",gap:10,marginTop:14}}>
                  <button onClick={save} style={{background:"#6c63ff",color:"#fff",border:"none",borderRadius:8,padding:"9px 22px",fontWeight:700,cursor:"pointer"}}>Save</button>
                  <button onClick={()=>setShowForm(false)} style={{background:"#1a1a2e",color:"#888",border:"1px solid #2a2a40",borderRadius:8,padding:"9px 22px",cursor:"pointer"}}>Cancel</button>
                </div>
              </div>
            )}
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {products.map(p=>(
                <div key={p._id} style={{background:"#0f0e17",border:"1px solid #1e1d2e",borderRadius:10,padding:14,display:"flex",gap:12,alignItems:"center"}}>
                  <img src={p.image} alt={p.name} style={{width:50,height:50,objectFit:"cover",borderRadius:7,flexShrink:0}} />
                  <div style={{flex:1,minWidth:0}}>
                    <p style={{color:"#fff",fontWeight:700,margin:"0 0 2px",fontSize:13}}>{p.name}</p>
                    <p style={{color:"#555",fontSize:11,margin:0}}>{p.category} · {p.stock} in stock</p>
                  </div>
                  <span style={{color:"#6c63ff",fontWeight:700,fontSize:13,flexShrink:0}}>{fmt(p.price)}</span>
                  <button onClick={()=>openEdit(p)} style={{background:"#1a1a2e",border:"1px solid #2a2a40",color:"#aaa",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:12}}>Edit</button>
                  <button onClick={()=>del(p._id)} style={{background:"#ff4b4b22",border:"1px solid #ff4b4b44",color:"#ff7070",borderRadius:6,padding:"5px 10px",cursor:"pointer",fontSize:12}}>Del</button>
                </div>
              ))}
            </div>
          </>
        )}

        {tab==="orders" && (
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {MOCK_ORDERS.map(o=>(
              <div key={o.id} style={{background:"#0f0e17",border:"1px solid #1e1d2e",borderRadius:10,padding:18,display:"flex",gap:14,alignItems:"center"}}>
                <div style={{flex:1}}>
                  <p style={{color:"#fff",fontWeight:700,margin:"0 0 2px",fontSize:14}}>{o.id}</p>
                  <p style={{color:"#555",fontSize:12,margin:0}}>{o.customer} · {o.date}</p>
                </div>
                <span style={{color:sc[o.status],fontWeight:600,fontSize:13}}>{o.status}</span>
                <span style={{color:"#6c63ff",fontWeight:700}}>{fmt(o.total)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      {toast && <Toast msg={toast} onClose={()=>setToast(null)} />}
    </div>
  );
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────
function Footer({ setPage }) {
  return (
    <footer style={{background:"#0f0e17",borderTop:"1px solid #1e1d2e",padding:"36px 20px 20px"}}>
      <div style={{maxWidth:1200,margin:"0 auto"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:28,marginBottom:28}}>
          <div>
            <p style={{color:"#fff",fontWeight:900,fontSize:20,margin:"0 0 8px"}}>K<span style={{color:"#6c63ff"}}>aravan</span></p>
            <p style={{color:"#555",fontSize:13,lineHeight:1.6,margin:0}}>Nigeria's general marketplace. Quality products delivered nationwide.</p>
          </div>
          {[["Shop",["Electronics","Fashion","Home","Sports"]],["Help",["Contact","Returns","Shipping","FAQ"]]].map(([h,links])=>(
            <div key={h}>
              <p style={{color:"#888",fontWeight:600,fontSize:12,marginBottom:10,letterSpacing:1}}>{h.toUpperCase()}</p>
              {links.map(l=><p key={l} style={{color:"#555",fontSize:13,marginBottom:6,cursor:"pointer"}}>{l}</p>)}
            </div>
          ))}
          <div>
            <p style={{color:"#888",fontWeight:600,fontSize:12,marginBottom:10,letterSpacing:1}}>PAYMENT</p>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {["Paystack","Visa","Mastercard","USSD"].map(b=>(
                <span key={b} style={{background:"#1a1a2e",color:"#888",borderRadius:6,padding:"4px 10px",fontSize:11,border:"1px solid #2a2a40"}}>{b}</span>
              ))}
            </div>
          </div>
        </div>
        <div style={{borderTop:"1px solid #1a1a2e",paddingTop:18,display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
          <p style={{color:"#444",fontSize:12,margin:0}}>© 2025 Karavan. All rights reserved.</p>
          <p style={{color:"#444",fontSize:12,margin:0}}>Built by courage.builds</p>
        </div>
      </div>
    </footer>
  );
}

// ─── PWA INSTALL BANNER ──────────────────────────────────────────────────────
function InstallBanner() {
  const [prompt, setPrompt] = useState(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const h = e => { e.preventDefault(); setPrompt(e); setVisible(true); };
    window.addEventListener("beforeinstallprompt", h);
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);
  const install = async () => { if (!prompt) return; prompt.prompt(); const {outcome} = await prompt.userChoice; if (outcome==="accepted") setVisible(false); };
  if (!visible) return null;
  return (
    <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#0f0e17",borderTop:"1px solid #6c63ff55",padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",zIndex:999,gap:12}}>
      <div>
        <p style={{color:"#fff",fontWeight:700,margin:0,fontSize:14}}>Install Karavan</p>
        <p style={{color:"#888",fontSize:12,margin:0}}>Add to home screen for quick access</p>
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={()=>setVisible(false)} style={{background:"none",border:"1px solid #2a2a40",color:"#888",borderRadius:8,padding:"7px 12px",cursor:"pointer",fontSize:13}}>Later</button>
        <button onClick={install} style={{background:"#6c63ff",color:"#fff",border:"none",borderRadius:8,padding:"7px 16px",fontWeight:700,cursor:"pointer",fontSize:13}}>Install</button>
      </div>
    </div>
  );
}

// ─── AUTH PROVIDER ────────────────────────────────────────────────────────────
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = async (email, password) => {
    await new Promise(r=>setTimeout(r,700));
    if (email==="admin@karavan.com" && password==="admin123") {
      setUser({_id:"1",name:"Admin",email,isAdmin:true});
    } else if (email && password.length>=6) {
      setUser({_id:"2",name:email.split("@")[0],email,isAdmin:false});
    } else {
      throw new Error("Invalid email or password");
    }
  };

  const register = async (name,email,password) => {
    await new Promise(r=>setTimeout(r,700));
    if (!name||!email||password.length<6) throw new Error("Fill all fields. Password min 6 chars.");
    setUser({_id:Date.now().toString(),name,email,isAdmin:false});
  };

  const logout = () => setUser(null);
  return <AuthCtx.Provider value={{user,login,register,logout}}>{children}</AuthCtx.Provider>;
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [product, setProduct] = useState(null);
  const [cart, dispatch] = useReducer(cartReducer, []);

  const render = () => {
    switch(page) {
      case "home":     return <Home setPage={setPage} setProduct={setProduct} />;
      case "product":  return <ProductDetail product={product} setPage={setPage} />;
      case "cart":     return <Cart setPage={setPage} />;
      case "checkout": return <Checkout setPage={setPage} />;
      case "login":    return <Auth mode="login" setPage={setPage} />;
      case "register": return <Auth mode="register" setPage={setPage} />;
      case "account":  return <Account setPage={setPage} />;
      case "admin":    return <Admin setPage={setPage} />;
      default:         return <Home setPage={setPage} setProduct={setProduct} />;
    }
  };

  return (
    <AuthProvider>
      <CartCtx.Provider value={[cart,dispatch]}>
        <div style={{fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"}}>
          <Navbar page={page} setPage={setPage} />
          {render()}
          {page!=="admin" && <Footer setPage={setPage} />}
          <InstallBanner />
        </div>
      </CartCtx.Provider>
    </AuthProvider>
  );
}
