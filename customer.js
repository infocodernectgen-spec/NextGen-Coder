const products = [
  // Cakes
  { id: 101, name: "Chocolate Truffle Cake", price: 550, description: "Rich chocolate layer cake (500g).", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80", category: "cakes" },
  { id: 102, name: "Red Velvet Cake", price: 600, description: "Classic red velvet with cream cheese (500g).", image: "https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?auto=format&fit=crop&w=800&q=80", category: "cakes" },
  { id: 103, name: "Black Forest Cake", price: 500, description: "Chocolate sponge with cherries (500g).", image: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80", category: "cakes" },
  { id: 104, name: "Pineapple Cake", price: 450, description: "Fresh cream pineapple cake (500g).", image: "https://images.unsplash.com/photo-1506459225024-1428097a7e18?auto=format&fit=crop&w=800&q=80", category: "cakes" },
  { id: 105, name: "Fruit Cake", price: 550, description: "Loaded with fresh seasonal fruits (500g).", image: "https://images.unsplash.com/photo-1488477304112-4944851de03d?auto=format&fit=crop&w=800&q=80", category: "cakes" },
  
  // Breads
  { id: 201, name: "Sourdough Loaf", price: 120, description: "Artisanal sourdough bread.", image: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&w=800&q=80", category: "breads" },
  { id: 202, name: "Whole Wheat Bread", price: 45, description: "Healthy whole wheat sliced bread.", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80", category: "breads" },
  { id: 203, name: "Multigrain Bread", price: 60, description: "Rich with 7 grains and seeds.", image: "https://images.unsplash.com/photo-1598373182133-52452f7691f5?auto=format&fit=crop&w=800&q=80", category: "breads" },
  { id: 204, name: "Burger Buns", price: 40, description: "Pack of 4 soft burger buns.", image: "https://images.unsplash.com/photo-1558230044-8d4e414c9f13?auto=format&fit=crop&w=800&q=80", category: "breads" },
  
  // Pastries
  { id: 301, name: "Croissant", price: 80, description: "Buttery flaky croissant.", image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80", category: "pastries" },
  { id: 302, name: "Blueberry Muffin", price: 60, description: "Soft muffin with fresh blueberries.", image: "https://images.unsplash.com/photo-1558401367-94467f57d977?auto=format&fit=crop&w=800&q=80", category: "pastries" },
  { id: 303, name: "Chocolate Eclair", price: 70, description: "Filled with cream and topped with chocolate.", image: "https://images.unsplash.com/photo-1612203985729-70726954388c?auto=format&fit=crop&w=800&q=80", category: "pastries" },
  { id: 304, name: "Fruit Tart", price: 90, description: "Crunchy tart with custard and fruits.", image: "https://images.unsplash.com/photo-1567171466295-4afa63d45416?auto=format&fit=crop&w=800&q=80", category: "pastries" },
  
  // Cookies
  { id: 401, name: "Choco Chip Cookies", price: 150, description: "Pack of 6 chewy cookies.", image: "https://images.unsplash.com/photo-1499636138143-bd649043ea52?auto=format&fit=crop&w=800&q=80", category: "cookies" },
  { id: 402, name: "Oatmeal Raisin", price: 140, description: "Healthy oats and raisin cookies.", image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80", category: "cookies" },
  { id: 403, name: "Macarons", price: 350, description: "Box of 5 assorted macarons.", image: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=800&q=80", category: "cookies" },
  { id: 404, name: "Butter Cookies", price: 120, description: "Classic melt-in-mouth butter cookies.", image: "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=800&q=80", category: "cookies" }
];

// Data Access
const getProducts = () => {
  try { const v = localStorage.getItem("bakeryProducts"); return v ? JSON.parse(v) : products } catch { return products }
};

const getCart = () => {
  try { const v = localStorage.getItem("cart"); return v ? JSON.parse(v) : [] } catch { return [] }
};

const addToCart = (product) => {
  const cart = getCart();
  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();
  alert(`${product.name} added to cart!`);
};

const updateCartBadge = () => {
  const cart = getCart();
  const count = cart.reduce((acc, item) => acc + item.qty, 0);
  const badge = document.getElementById("cartBadge");
  if (badge) {
    badge.textContent = count > 0 ? count : "";
    badge.style.display = count > 0 ? "inline-block" : "none";
  }
};

const addCustomCake = (details) => {
  const cart = getCart();
  cart.push({
    id: Date.now(),
    name: "Custom Cake",
    price: details.price,
    description: `${details.flavor}, ${details.weight}kg, Msg: ${details.message}`,
    image: "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&w=800&q=80",
    qty: 1,
    isCustom: true
  });
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();
  window.location.href = "cart.html";
};

// Render Functions
let currentCategory = "";

const renderProducts = (containerId, filterCat = "", searchTerm = "", sortOrder = "none") => {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  if (filterCat !== null) currentCategory = filterCat;
  
  const all = getProducts();
  let filtered = currentCategory ? all.filter(p => p.category === currentCategory) : all;
  
  if (searchTerm) {
    filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }
  
  if (sortOrder === "low") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortOrder === "high") {
    filtered.sort((a, b) => b.price - a.price);
  }
  
  if (filtered.length === 0) {
    container.innerHTML = `<p class="text-center col-span-4 py-8">No products found matching your search.</p>`;
    return;
  }

  container.innerHTML = filtered.map(p => `
    <article class="card">
      <img src="${p.image}" alt="${p.name}">
      <div class="card-body">
        <h3>${p.name}</h3>
        <p class="text-sm text-muted">${p.description}</p>
        <div class="flex justify-between items-center mt-2">
          <span class="price">₹${p.price}</span>
          <button class="btn primary sm" onclick="addToCart({id:${p.id}, name:'${p.name}', price:${p.price}, image:'${p.image}'})">Add</button>
        </div>
      </div>
    </article>
  `).join("");
};

window.handleFilterChange = () => {
  const searchTerm = document.getElementById("productSearch")?.value || "";
  const sortOrder = document.getElementById("priceSort")?.value || "none";
  renderProducts("allProductsGrid", null, searchTerm, sortOrder);
};

// Initial Load
document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  
  // Sync Wallet and Admin UI on Dashboard
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const updatedUser = users.find(u => u.email === user.email) || user;
    
    const dashWallet = document.getElementById("dashWalletBalance");
    if (dashWallet) dashWallet.textContent = `₹${updatedUser.wallet || 0}`;
    
    const adminSec = document.getElementById("adminLinkSection");
    if (adminSec && updatedUser.role === "admin") {
      adminSec.style.display = "block";
    }
  }

  if (document.getElementById("featuredGrid")) renderProducts("featuredGrid", "cakes");
  if (document.getElementById("allProductsGrid")) renderProducts("allProductsGrid");
});

// Expose to window for onclick handlers
window.addToCart = addToCart;
