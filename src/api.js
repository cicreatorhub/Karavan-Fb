const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getToken() { return localStorage.getItem("token"); }

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export const api = {
  // auth
  login: (email, password) => request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  register: (name, email, password) => request("/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) }),
  profile: () => request("/auth/profile"),

  // products
  getProducts: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/products?${q}`);
  },
  getProduct: (id) => request(`/products/${id}`),
  createProduct: (data) => request("/products", { method: "POST", body: JSON.stringify(data) }),
  updateProduct: (id, data) => request(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: "DELETE" }),

  // orders
  createOrder: (items, shippingAddress) => request("/orders", { method: "POST", body: JSON.stringify({ items, shippingAddress }) }),
  verifyPayment: (reference) => request(`/orders/verify/${reference}`),
  myOrders: () => request("/orders/myorders"),
  allOrders: () => request("/orders"),
  updateOrderStatus: (id, status) => request(`/orders/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
};

export { getToken };
