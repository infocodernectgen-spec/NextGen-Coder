// Utility
const getStore = (key, defaultVal = []) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : defaultVal } catch { return defaultVal }
};
const setStore = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
};

// --- Tab Management ---
window.showTab = (tabName) => {
  document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
  document.querySelectorAll('.tabs .btn').forEach(b => b.classList.remove('active-tab', 'primary'));
  
  document.getElementById(tabName + 'Tab').style.display = 'block';
  const activeBtn = Array.from(document.querySelectorAll('.tabs .btn')).find(b => b.textContent.toLowerCase() === tabName);
  if (activeBtn) {
    activeBtn.classList.add('active-tab');
    activeBtn.classList.remove('outline');
  }
  
  // Add outline to others
  document.querySelectorAll('.tabs .btn').forEach(b => {
    if (!b.classList.contains('active-tab')) b.classList.add('outline');
  });

  if (tabName === 'orders') renderOrders();
  if (tabName === 'products') renderProducts();
  if (tabName === 'users') renderUsers();
  if (tabName === 'gallery') renderGallery();
  if (tabName === 'blogs') renderBlogs();
  if (tabName === 'reviews') renderReviews();
  if (tabName === 'videos') renderVideos();
  if (tabName === 'analytics') renderAnalytics();
};

// --- Analytics ---
let orderChart = null;
let revenueChart = null;

const renderAnalytics = () => {
  const orders = getStore("orders");
  const ctx1 = document.getElementById('orderChart').getContext('2d');
  const ctx2 = document.getElementById('revenueChart').getContext('2d');

  // Aggregation
  const categories = ["cakes", "breads", "pastries", "cookies"];
  const revByCat = categories.map(cat => {
    return orders.reduce((acc, o) => {
      const catTotal = o.items.filter(i => {
        // Find category from products store
        const products = getStore("bakeryProducts", defaultProducts);
        const p = products.find(prod => prod.name === i.name);
        return p && p.category === cat;
      }).reduce((sum, i) => sum + (i.price * (i.qty || 1)), 0);
      return acc + catTotal;
    }, 0);
  });

  if (orderChart) orderChart.destroy();
  if (revenueChart) revenueChart.destroy();

  orderChart = new Chart(ctx1, {
    type: 'line',
    data: {
      labels: orders.slice(-7).map(o => o.date.split(',')[0]),
      datasets: [{ label: 'Order Value', data: orders.slice(-7).map(o => Number(o.total.replace(/[^\d]/g, ''))), borderColor: '#db2777', fill: false }]
    }
  });

  revenueChart = new Chart(ctx2, {
    type: 'doughnut',
    data: {
      labels: categories.map(c => c.charAt(0).toUpperCase() + c.slice(1)),
      datasets: [{ data: revByCat, backgroundColor: ['#db2777', '#9333ea', '#2563eb', '#059669'] }]
    }
  });
};

// --- Orders Management ---
// ... (lines 32-85 unchanged)
const renderOrders = () => {
  const orders = getStore("orders");
  const tbody = document.getElementById("ordersTable");
  
  // Update Stats
  document.getElementById("totalOrders").textContent = orders.length;
  const rev = orders.reduce((acc, o) => acc + Number(o.total.replace(/[^\d]/g, '')), 0);
  document.getElementById("totalRevenue").textContent = `₹${rev}`;
  document.getElementById("pendingOrders").textContent = orders.filter(o => o.status !== 'Delivered').length;

  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center p-4">No orders found.</td></tr>`;
    return;
  }

  tbody.innerHTML = orders.map(o => `
    <tr>
      <td>${o.id}</td>
      <td>${o.date}</td>
      <td>${o.customerName || 'N/A'}<br><small>${o.customerEmail || ''}</small></td>
      <td>${o.items.map(i => i.name).join(", ")}</td>
      <td>${o.total}</td>
      <td>${o.payment || 'N/A'}</td>
      <td>
        <select class="form-group" style="padding:0.25rem; margin-bottom:0;" onchange="updateOrderStatus('${o.id}', this.value)">
          <option value="Received" ${o.status === 'Received' ? 'selected' : ''}>Received</option>
          <option value="Baking" ${o.status === 'Baking' ? 'selected' : ''}>Baking</option>
          <option value="Ready" ${o.status === 'Ready' ? 'selected' : ''}>Ready</option>
          <option value="Out for delivery" ${o.status === 'Out for delivery' ? 'selected' : ''}>Out for Delivery</option>
          <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
        </select>
      </td>
      <td>
        <div class="flex gap-2">
          <button class="btn sm outline" onclick="viewInvoice('${o.id}')">Invoice</button>
          <button class="btn sm outline" onclick="deleteOrder('${o.id}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");
};

window.updateOrderStatus = (id, status) => {
  const orders = getStore("orders");
  const idx = orders.findIndex(o => o.id === id);
  if (idx >= 0) {
    orders[idx].status = status;
    setStore("orders", orders);
    renderOrders();
  }
};

window.deleteOrder = (id) => {
  if (!confirm("Delete this order?")) return;
  const orders = getStore("orders");
  setStore("orders", orders.filter(o => o.id !== id));
  renderOrders();
};

// --- Products Management ---
// ... (lines 88-191 unchanged)
const defaultProducts = [
  { id: 101, name: "Chocolate Truffle Cake", price: 550, description: "Rich chocolate layer cake (500g).", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80", category: "cakes" },
  { id: 102, name: "Red Velvet Cake", price: 600, description: "Classic red velvet with cream cheese (500g).", image: "https://images.unsplash.com/photo-1616541823729-00fe0aacd32c?auto=format&fit=crop&w=800&q=80", category: "cakes" },
  { id: 201, name: "Sourdough Loaf", price: 120, description: "Artisanal sourdough bread.", image: "https://images.unsplash.com/photo-1585478564381-e0df37348039?auto=format&fit=crop&w=800&q=80", category: "breads" }
];

const renderProducts = () => {
  const products = getStore("bakeryProducts", defaultProducts);
  const tbody = document.getElementById("adminProductsTable");
  
  tbody.innerHTML = products.map(p => `
    <tr>
      <td><img src="${p.image}" alt=""></td>
      <td>${p.name}</td>
      <td style="text-transform: capitalize;">${p.category}</td>
      <td>₹${p.price}</td>
      <td>
        <div class="flex gap-2">
          <button class="btn sm outline" onclick="openProductModal(${p.id})">Edit</button>
          <button class="btn sm outline" onclick="deleteProduct(${p.id})">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");
};

window.openProductModal = (id = null) => {
  const modal = document.getElementById("productModal");
  const title = document.getElementById("modalTitle");
  const form = document.getElementById("productForm");
  
  if (id) {
    const products = getStore("bakeryProducts", defaultProducts);
    const p = products.find(prod => prod.id === id);
    if (p) {
      title.textContent = "Edit Product";
      document.getElementById("prodId").value = p.id;
      document.getElementById("prodName").value = p.name;
      document.getElementById("prodCategory").value = p.category;
      document.getElementById("prodPrice").value = p.price;
      document.getElementById("prodDesc").value = p.description;
    }
  } else {
    title.textContent = "Add Product";
    form.reset();
    document.getElementById("prodId").value = "";
  }
  modal.style.display = "flex";
};

window.closeProductModal = () => {
  document.getElementById("productModal").style.display = "none";
};

window.saveProduct = (e) => {
  e.preventDefault();
  const idStr = document.getElementById("prodId").value;
  const products = getStore("bakeryProducts", defaultProducts);
  const fileInput = document.getElementById("prodImage");
  
  const finishSave = (imgData) => {
    const productData = {
      id: idStr ? parseInt(idStr) : Date.now(),
      name: document.getElementById("prodName").value,
      category: document.getElementById("prodCategory").value,
      price: parseInt(document.getElementById("prodPrice").value),
      description: document.getElementById("prodDesc").value,
      image: imgData
    };

    if (idStr) {
      const idx = products.findIndex(p => p.id === parseInt(idStr));
      if (idx >= 0) {
        if (!imgData) productData.image = products[idx].image;
        products[idx] = productData;
      }
    } else {
      if (!imgData) productData.image = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80";
      products.push(productData);
    }

    setStore("bakeryProducts", products);
    closeProductModal();
    renderProducts();
  };

  if (fileInput.files && fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = (event) => finishSave(event.target.result);
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    finishSave(null);
  }
};

window.deleteProduct = (id) => {
  if (!confirm("Delete this product?")) return;
  const products = getStore("bakeryProducts", defaultProducts);
  setStore("bakeryProducts", products.filter(p => p.id !== id));
  renderProducts();
};

// --- Users Management ---
const renderUsers = () => {
  const users = getStore("users", [{name: "Admin", email: "admin@gyan.com", role: "admin", password: "admin", wallet: 0}]);
  const tbody = document.getElementById("usersTable");
  
  tbody.innerHTML = users.map(u => `
    <tr>
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td>${u.role || 'customer'}</td>
      <td>₹${u.wallet || 0}</td>
      <td>
        <div class="flex gap-2">
          <button class="btn sm outline" style="border: 1px solid #e5e7eb; color: var(--text);" onclick="alert('Viewing profile for: ${u.email}')">
            View
          </button>
          <button class="btn sm text-danger" style="border: none; background: transparent; color: #ef4444; font-size: 0.8rem;" onclick="deleteUser('${u.email}')" ${u.role === 'admin' ? 'disabled' : ''}>
            Delete
          </button>
        </div>
      </td>
    </tr>
  `).join("");
};

window.deleteUser = (email) => {
  if (!confirm("Delete this user?")) return;
  const users = getStore("users");
  setStore("users", users.filter(u => u.email !== email));
  renderUsers();
};

// --- Gallery Management ---
const defaultGallery = [
  "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1551024601-bec0273e132e?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?auto=format&fit=crop&w=800&q=80"
];

const renderGallery = () => {
  const gallery = getStore("bakeryGallery", defaultGallery);
  const tbody = document.getElementById("adminGalleryTable");
  
  tbody.innerHTML = gallery.map((img, idx) => `
    <tr>
      <td><img src="${img}" style="width: 100px; height: 60px; object-fit: cover; border-radius: 4px;"></td>
      <td>
        <button class="btn sm outline" onclick="openGalleryModal(${idx})">Edit</button>
        <button class="btn sm text-danger" onclick="deleteGalleryImage(${idx})">Delete</button>
      </td>
    </tr>
  `).join("");
};

window.openGalleryModal = (idx = -1) => {
  const modal = document.getElementById("galleryModal");
  const form = document.getElementById("galleryForm");
  const title = document.getElementById("galleryModalTitle");
  const editIdxInput = document.getElementById("galleryEditIdx");
  
  modal.style.display = "flex";
  form.reset();
  editIdxInput.value = idx;
  
  if (idx === -1) {
    title.textContent = "Add Gallery Image";
    toggleGalleryInput('url');
  } else {
    title.textContent = "Edit Gallery Image";
    const gallery = getStore("bakeryGallery", defaultGallery);
    const imgSrc = gallery[idx];
    
    if (imgSrc.startsWith('data:')) {
      toggleGalleryInput('upload');
      document.getElementById("galleryType").value = 'upload';
    } else {
      toggleGalleryInput('url');
      document.getElementById("galleryType").value = 'url';
      document.getElementById("galleryUrlInput").value = imgSrc;
    }
  }
};

window.closeGalleryModal = () => {
  document.getElementById("galleryModal").style.display = "none";
};

window.toggleGalleryInput = (type) => {
  document.getElementById("galleryUrlGroup").style.display = type === 'url' ? 'block' : 'none';
  document.getElementById("galleryUploadGroup").style.display = type === 'upload' ? 'block' : 'none';
};

window.saveGalleryImage = (e) => {
  e.preventDefault();
  const type = document.getElementById("galleryType").value;
  const editIdx = parseInt(document.getElementById("galleryEditIdx").value);
  const gallery = getStore("bakeryGallery", defaultGallery);

  const saveImage = (imgSrc) => {
    if (!imgSrc) return;
    
    if (editIdx === -1) {
      gallery.push(imgSrc);
    } else {
      gallery[editIdx] = imgSrc;
    }
    
    setStore("bakeryGallery", gallery);
    closeGalleryModal();
    renderGallery();
  };

  if (type === 'url') {
    saveImage(document.getElementById("galleryUrlInput").value);
  } else {
    const fileInput = document.getElementById("galleryUploadInput");
    if (fileInput.files && fileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => saveImage(event.target.result);
      reader.readAsDataURL(fileInput.files[0]);
    } else if (editIdx !== -1) {
       // If editing and no new file selected, keep existing (though user might want to change type)
       closeGalleryModal();
    }
  }
};

window.deleteGalleryImage = (idx) => {
  if (!confirm("Delete this gallery image?")) return;
  const gallery = getStore("bakeryGallery", defaultGallery);
  gallery.splice(idx, 1);
  setStore("bakeryGallery", gallery);
  renderGallery();
};

// --- Blog Management ---
const defaultBlogs = [
  { title: "Secrets of a Perfect Sourdough", summary: "Learn the science behind the crust and crumb.", content: "Full content here...", image: "https://images.unsplash.com/photo-1585478259715-876acc5be8eb?auto=format&fit=crop&w=800&q=80", date: "Feb 5, 2026" },
  { title: "Why Eggless Baking is Trending", summary: "Discover how we make cakes fluffy without eggs.", content: "Full content here...", image: "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&w=800&q=80", date: "Feb 3, 2026" },
  { title: "Top 5 Pastry Pairings", summary: "The best coffees to match with our croissants.", content: "Full content here...", image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80", date: "Feb 1, 2026" },
  { title: "Summer Fruit Cake Festival", summary: "Get ready for the season's freshest bakes.", content: "Full content here...", image: "https://images.unsplash.com/photo-1488477304112-4944851de03d?auto=format&fit=crop&w=800&q=80", date: "Jan 28, 2026" },
  { title: "The History of Gyan Bakery", summary: "How we grew from a small kitchen to your favorite bakery.", content: "Full content here...", image: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=800&q=80", date: "Jan 25, 2026" }
];

const renderBlogs = () => {
  const blogs = getStore("bakeryBlogs", defaultBlogs);
  const tbody = document.getElementById("adminBlogsTable");
  tbody.innerHTML = blogs.map((blog, idx) => `
    <tr>
      <td>${blog.title}</td>
      <td>${blog.date}</td>
      <td>
        <button class="btn sm outline" onclick="openBlogModal(${idx})">Edit</button>
        <button class="btn sm text-danger" onclick="deleteBlog(${idx})">Delete</button>
      </td>
    </tr>
  `).join("");
};

window.openBlogModal = (idx = -1) => {
  document.getElementById("blogModal").style.display = "flex";
  document.getElementById("blogForm").reset();
  document.getElementById("blogEditIdx").value = idx;
  document.getElementById("blogModalTitle").textContent = idx === -1 ? "Create Blog Post" : "Edit Blog Post";
  
  if (idx !== -1) {
    const blogs = getStore("bakeryBlogs", []);
    const b = blogs[idx];
    document.getElementById("blogTitleInput").value = b.title;
    document.getElementById("blogSummaryInput").value = b.summary;
    document.getElementById("blogContentInput").value = b.content;
    document.getElementById("blogImageInput").value = b.image.startsWith('data:') ? '' : b.image;
  }
};

window.closeBlogModal = () => document.getElementById("blogModal").style.display = "none";

window.saveBlogPost = (e) => {
  e.preventDefault();
  const idx = parseInt(document.getElementById("blogEditIdx").value);
  const blogs = getStore("bakeryBlogs", []);
  
  const finish = (img) => {
    const post = {
      title: document.getElementById("blogTitleInput").value,
      summary: document.getElementById("blogSummaryInput").value,
      content: document.getElementById("blogContentInput").value,
      image: img || document.getElementById("blogImageInput").value || 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d',
      date: new Date().toLocaleDateString()
    };
    if (idx === -1) blogs.unshift(post);
    else blogs[idx] = post;
    setStore("bakeryBlogs", blogs);
    closeBlogModal();
    renderBlogs();
  };

  const file = document.getElementById("blogUploadInput").files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (ev) => finish(ev.target.result);
    reader.readAsDataURL(file);
  } else finish();
};

window.deleteBlog = (idx) => {
  if (!confirm("Delete this blog post?")) return;
  const blogs = getStore("bakeryBlogs", []);
  blogs.splice(idx, 1);
  setStore("bakeryBlogs", blogs);
  renderBlogs();
};

// --- Review Management ---
const defaultReviews = [
  { name: "Rahul S.", rating: 5, comment: "The Choco Truffle is out of this world! Highly recommend." },
  { name: "Priya M.", rating: 5, comment: "Best sourdough in the city. Fresh and authentic." },
  { name: "James B.", rating: 4, comment: "Love the atmosphere and the snacks. Great service!" },
  { name: "Ananya K.", rating: 5, comment: "Best eggless options I've ever found. So soft!" },
  { name: "Vikram R.", rating: 5, comment: "Ordered a custom cake for my daughter's birthday. Perfect!" }
];

const renderReviews = () => {
  const reviews = getStore("bakeryReviews", defaultReviews);
  const tbody = document.getElementById("adminReviewsTable");
  tbody.innerHTML = reviews.map((rev, idx) => `
    <tr>
      <td>${rev.name}</td>
      <td>${'★'.repeat(rev.rating)}</td>
      <td>${rev.comment}</td>
      <td>
        <button class="btn sm outline" onclick="openReviewModal(${idx})">Edit</button>
        <button class="btn sm text-danger" onclick="deleteReview(${idx})">Delete</button>
      </td>
    </tr>
  `).join("");
};

window.openReviewModal = (idx = -1) => {
  document.getElementById("reviewModal").style.display = "flex";
  document.getElementById("reviewForm").reset();
  document.getElementById("reviewEditIdx").value = idx;
  document.getElementById("reviewModalTitle").textContent = idx === -1 ? "Add Customer Review" : "Edit Review";
  
  if (idx !== -1) {
    const reviews = getStore("bakeryReviews", []);
    const r = reviews[idx];
    document.getElementById("reviewNameInput").value = r.name;
    document.getElementById("reviewRatingInput").value = r.rating;
    document.getElementById("reviewCommentInput").value = r.comment;
  }
};

window.closeReviewModal = () => document.getElementById("reviewModal").style.display = "none";

window.saveReview = (e) => {
  e.preventDefault();
  const idx = parseInt(document.getElementById("reviewEditIdx").value);
  const reviews = getStore("bakeryReviews", []);
  const rev = {
    name: document.getElementById("reviewNameInput").value,
    rating: parseInt(document.getElementById("reviewRatingInput").value),
    comment: document.getElementById("reviewCommentInput").value
  };
  if (idx === -1) reviews.unshift(rev);
  else reviews[idx] = rev;
  setStore("bakeryReviews", reviews);
  closeReviewModal();
  renderReviews();
};

window.deleteReview = (idx) => {
  if (!confirm("Delete this review?")) return;
  const reviews = getStore("bakeryReviews", []);
  reviews.splice(idx, 1);
  setStore("bakeryReviews", reviews);
  renderReviews();
};

// --- Video Management ---
const defaultVideos = [
  { title: "Artisanal Bread Baking", src: "https://www.youtube.com/watch?v=2T9pP6nN07M", type: "url" },
  { title: "Perfect Cake Frosting", src: "https://www.youtube.com/watch?v=kYv_8E4A0sI", type: "url" },
  { title: "Morning in the Bakery", src: "https://www.youtube.com/watch?v=Xv6S3E2R7_I", type: "url" },
  { title: "Chocolate Cookie Magic", src: "https://www.youtube.com/watch?v=Jv2D6VvS9g8", type: "url" },
  { title: "French Pastry Masterclass", src: "https://www.youtube.com/watch?v=l_LqB6tJ-qQ", type: "url" }
];

const renderVideos = () => {
  const videos = getStore("bakeryVideos", defaultVideos);
  const tbody = document.getElementById("adminVideosTable");
  tbody.innerHTML = videos.map((v, idx) => `
    <tr>
      <td>${v.title}</td>
      <td>${v.type === 'url' ? 'URL' : 'Upload'}</td>
      <td>
        <button class="btn sm outline" onclick="openVideoModal(${idx})">Edit</button>
        <button class="btn sm text-danger" onclick="deleteVideo(${idx})">Delete</button>
      </td>
    </tr>
  `).join("");
};

window.openVideoModal = (idx = -1) => {
  document.getElementById("videoModal").style.display = "flex";
  document.getElementById("videoForm").reset();
  document.getElementById("videoEditIdx").value = idx;
  document.getElementById("videoModalTitle").textContent = idx === -1 ? "Add Video Highlight" : "Edit Video";
  toggleVideoInput('url');
  
  if (idx !== -1) {
    const videos = getStore("bakeryVideos", []);
    const v = videos[idx];
    document.getElementById("videoTitleInput").value = v.title;
    document.getElementById("videoType").value = v.src.startsWith('data:') ? 'upload' : 'url';
    toggleVideoInput(document.getElementById("videoType").value);
    if (v.src.startsWith('http')) document.getElementById("videoUrlInput").value = v.src;
  }
};

window.closeVideoModal = () => document.getElementById("videoModal").style.display = "none";

window.toggleVideoInput = (type) => {
  document.getElementById("videoUrlGroup").style.display = type === 'url' ? 'block' : 'none';
  document.getElementById("videoUploadGroup").style.display = type === 'upload' ? 'block' : 'none';
};

window.saveVideo = (e) => {
  e.preventDefault();
  const idx = parseInt(document.getElementById("videoEditIdx").value);
  const videos = getStore("bakeryVideos", []);
  
  const finish = (src) => {
    const vid = {
      title: document.getElementById("videoTitleInput").value,
      src: src || document.getElementById("videoUrlInput").value,
      type: document.getElementById("videoType").value
    };
    if (idx === -1) videos.unshift(vid);
    else videos[idx] = vid;
    setStore("bakeryVideos", videos);
    closeVideoModal();
    renderVideos();
  };

  const file = document.getElementById("videoUploadInput").files[0];
  if (file && document.getElementById("videoType").value === 'upload') {
    const reader = new FileReader();
    reader.onload = (ev) => finish(ev.target.result);
    reader.readAsDataURL(file);
  } else finish();
};

window.deleteVideo = (idx) => {
  if (!confirm("Delete this video?")) return;
  const videos = getStore("bakeryVideos", []);
  videos.splice(idx, 1);
  setStore("bakeryVideos", videos);
  renderVideos();
};

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  renderOrders();
  if (!localStorage.getItem("bakeryProducts")) {
    setStore("bakeryProducts", defaultProducts);
  }
});
