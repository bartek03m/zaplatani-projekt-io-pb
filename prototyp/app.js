// ===== PRODUCT DATA =====
const PRODUCTS = [
  {
    id: 1, name: 'Miś Przytulanka', category: 'maskotki', price: 129,
    image: 'images/mascot_bear.png', badge: 'new', badgeText: 'Nowość',
    colors: ['#F5C6C6', '#D4A0A0', '#C4A882'],
    description: 'Uroczy miś amigurumi, idealny na prezent.'
  },
  {
    id: 2, name: 'Króliczek Lawendowy', category: 'maskotki', price: 119, oldPrice: 139,
    image: 'images/mascot_bunny.png', badge: 'sale', badgeText: '-15%',
    colors: ['#C8B8E0', '#F0D4D4', '#FFFFFF'],
    description: 'Delikatny króliczek w pastelowych kolorach.'
  },
  {
    id: 3, name: 'Lisek Amigurumi', category: 'maskotki', price: 139,
    image: 'images/mascot_fox.png', badge: 'custom', badgeText: 'Custom',
    colors: ['#E8A060', '#F5C6C6', '#C4A882'],
    description: 'Sprytny lisek — możesz wybrać kolory!'
  },
  {
    id: 4, name: 'Top Boho', category: 'koszulki', price: 189,
    image: 'images/crochet_top.png', badge: 'new', badgeText: 'Nowość',
    colors: ['#F5E6D3', '#FFFFFF', '#D4C4B0'],
    description: 'Modny top szydełkowy w stylu boho na lato.'
  },
  {
    id: 5, name: 'Szalik Jesienny', category: 'szaliki', price: 89,
    image: 'images/crochet_scarf.png', badge: null,
    colors: ['#E8C07D', '#C47D3A', '#8B5E3C'],
    description: 'Ciepły szalik w jesiennych barwach.'
  },
  {
    id: 6, name: 'Czapka Różowa', category: 'czapki', price: 69, oldPrice: 89,
    image: 'images/crochet_hat.png', badge: 'sale', badgeText: '-22%',
    colors: ['#F5C6C6', '#FFFFFF', '#E8D8D0'],
    description: 'Przytulna czapka na zimowe spacery.'
  },
  {
    id: 7, name: 'Torba Boho Sage', category: 'torby', price: 159,
    image: 'images/crochet_bag.png', badge: 'new', badgeText: 'Nowość',
    colors: ['#A0C4B8', '#C4A882', '#E8D8D0'],
    description: 'Elegancka torba w odcieniach szałwii.'
  },
  {
    id: 8, name: 'Torebka Crossbody Rose', category: 'torby', price: 139,
    image: 'images/crochet_bag2.png', badge: 'custom', badgeText: 'Custom',
    colors: ['#D4A0A0', '#F0D4D4', '#C4A882'],
    description: 'Modna torebka na ramię z frędzlami.'
  }
];

// ===== APP STATE =====
const state = {
  cart: [],
  isLoggedIn: false,
  isAdmin: false,
  currentUser: null,
  activeFilter: 'all',
  discountApplied: false,
  discountPercent: 0
};

let scrollObserver = null;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  renderProducts('all');
  initNavbar();
  initAuthModal();
  initCartSidebar();
  initFAQ();
  initForms();
  initScrollAnimations();
  initCategoryCards();
  initMobileMenu();
});

// ===== RENDER PRODUCTS =====
function renderProducts(filter) {
  const grid = document.getElementById('products-grid');
  const filtered = filter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);

  grid.innerHTML = '';

  filtered.forEach((product, index) => {
    const card = document.createElement('div');
    card.className = 'product-card animate-on-scroll';
    card.dataset.category = product.category;
    card.style.animationDelay = `${index * 0.1}s`;

    const badgeHTML = product.badge
      ? `<span class="product-badge badge-${product.badge}">${product.badgeText}</span>`
      : '';

    const oldPriceHTML = product.oldPrice
      ? `<span class="price-old">${product.oldPrice},00 zł</span>`
      : '';

    const colorsHTML = product.colors.map(c =>
      `<span class="color-dot" style="background:${c}" title="${c}"></span>`
    ).join('');

    card.innerHTML = `
      <div class="product-image">
        ${badgeHTML}
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        <div class="product-actions-overlay">
          <button class="product-action-btn" title="Dodaj do koszyka" onclick="addToCart(${product.id})" id="add-cart-${product.id}">🛒</button>
          <button class="product-action-btn" title="Podgląd" onclick="showToast('Podgląd produktu: ${product.name}', 'info')">👁️</button>
          <button class="product-action-btn" title="Ulubione" onclick="showToast('Dodano do ulubionych!', 'success')">❤️</button>
        </div>
      </div>
      <div class="product-info">
        <div class="product-category">${getCategoryLabel(product.category)}</div>
        <div class="product-name">${product.name}</div>
        <div class="product-price">
          <span class="price-current">${product.price},00 zł</span>
          ${oldPriceHTML}
        </div>
        <div class="product-colors">${colorsHTML}</div>
      </div>
    `;

    grid.appendChild(card);
  });

  // Re-observe newly added product cards
  setTimeout(() => {
    document.querySelectorAll('.product-card.animate-on-scroll').forEach(el => {
      if (scrollObserver) {
        scrollObserver.observe(el);
      }
      // Immediately show if in viewport
      if (isElementInViewport(el)) {
        el.classList.add('visible');
      }
    });
  }, 50);
}

function getCategoryLabel(cat) {
  const labels = {
    maskotki: 'Maskotki',
    koszulki: 'Koszulki / Topy',
    szaliki: 'Szaliki',
    czapki: 'Czapki',
    torby: 'Torby'
  };
  return labels[cat] || cat;
}

// ===== PRODUCT FILTER =====
document.getElementById('products-filter').addEventListener('click', (e) => {
  if (!e.target.classList.contains('filter-btn')) return;

  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  e.target.classList.add('active');

  const filter = e.target.dataset.filter;
  state.activeFilter = filter;
  renderProducts(filter);
});

// ===== CATEGORY CARDS =====
function initCategoryCards() {
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      const category = card.dataset.category;

      // Update filter buttons
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      const filterBtn = document.querySelector(`[data-filter="${category}"]`);
      if (filterBtn) filterBtn.classList.add('active');

      state.activeFilter = category;
      renderProducts(category);

      // Scroll to products section
      document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
    });
  });
}

// ===== NAVBAR =====
function initNavbar() {
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });
}

// ===== MOBILE MENU =====
function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('nav-links');

  toggle.addEventListener('click', () => {
    nav.classList.toggle('mobile-open');
  });

  // Close on link click
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('mobile-open');
    });
  });
}

// ===== AUTH MODAL =====
function initAuthModal() {
  const modal = document.getElementById('auth-modal');
  const openBtn = document.getElementById('btn-open-auth');
  const closeBtn = document.getElementById('auth-modal-close');

  openBtn.addEventListener('click', () => {
    if (state.isLoggedIn) {
      showUserMenu();
    } else {
      modal.classList.add('active');
    }
  });

  closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });

  // Tab switching
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
      tab.classList.add('active');
      document.querySelector(`[data-form="${target}"]`).classList.add('active');
    });
  });

  // Quick links
  document.getElementById('link-go-register').addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('[data-tab="register"]').click();
  });
  document.getElementById('link-go-login').addEventListener('click', (e) => {
    e.preventDefault();
    document.querySelector('[data-tab="login"]').click();
  });

  // Login form
  document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;

    // Simulate admin login
    if (email === 'admin@szydełkowyzakatek.pl' || email === 'admin@admin.pl') {
      state.isAdmin = true;
    }

    state.isLoggedIn = true;
    state.currentUser = {
      name: state.isAdmin ? 'Właścicielka' : email.split('@')[0],
      email: email
    };

    modal.classList.remove('active');
    updateAuthUI();
    showToast(`Witaj, ${state.currentUser.name}! 👋`, 'success');

    if (state.isAdmin) {
      showToast('Zalogowano jako administrator', 'info');
    }
  });

  // Register form
  document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const pass = document.getElementById('reg-password').value;
    const passConfirm = document.getElementById('reg-password-confirm').value;

    if (pass !== passConfirm) {
      showToast('Hasła nie są identyczne!', 'error');
      return;
    }

    if (pass.length < 6) {
      showToast('Hasło musi mieć min. 6 znaków!', 'error');
      return;
    }

    state.isLoggedIn = true;
    state.currentUser = { name, email };
    modal.classList.remove('active');
    updateAuthUI();
    showToast(`Konto utworzone! Witaj, ${name}! 🎉`, 'success');
  });
}

function updateAuthUI() {
  const btn = document.getElementById('btn-open-auth');
  if (state.isLoggedIn) {
    btn.textContent = state.currentUser.name;
    btn.style.background = 'var(--clr-secondary-dark)';

    if (state.isAdmin) {
      btn.style.background = 'var(--clr-text)';
    }
  } else {
    btn.textContent = 'Zaloguj się';
    btn.style.background = '';
  }
}

function showUserMenu() {
  if (state.isAdmin) {
    toggleAdminPanel();
  } else {
    // Simple user menu via confirm dialog
    const action = confirm(`Zalogowano jako: ${state.currentUser.name}\n\nKliknij OK aby się wylogować.`);
    if (action) {
      logout();
    }
  }
}

function toggleAdminPanel() {
  const admin = document.getElementById('admin-panel');
  const main = document.getElementById('main-content');

  if (admin.classList.contains('active')) {
    admin.classList.remove('active');
    main.style.display = '';
    document.getElementById('footer').style.display = '';
  } else {
    admin.classList.add('active');
    main.style.display = 'none';
    document.getElementById('footer').style.display = 'none';
    window.scrollTo(0, 0);
  }
}

function logout() {
  state.isLoggedIn = false;
  state.isAdmin = false;
  state.currentUser = null;

  // Close admin panel if open
  const admin = document.getElementById('admin-panel');
  if (admin.classList.contains('active')) {
    admin.classList.remove('active');
    document.getElementById('main-content').style.display = '';
    document.getElementById('footer').style.display = '';
  }

  updateAuthUI();
  showToast('Wylogowano pomyślnie!', 'info');
}

// Admin close button
document.getElementById('btn-close-admin').addEventListener('click', toggleAdminPanel);

// ===== CART =====
function initCartSidebar() {
  const sidebar = document.getElementById('cart-sidebar');
  const overlay = document.getElementById('cart-overlay');
  const openBtn = document.getElementById('btn-cart');
  const closeBtn = document.getElementById('cart-close');

  openBtn.addEventListener('click', () => {
    sidebar.classList.add('open');
    overlay.classList.add('open');
  });

  closeBtn.addEventListener('click', closeCart);
  overlay.addEventListener('click', closeCart);

  // Discount apply
  document.getElementById('btn-apply-discount').addEventListener('click', applyDiscount);

  // Checkout
  document.getElementById('btn-checkout').addEventListener('click', () => {
    if (!state.isLoggedIn) {
      showToast('Zaloguj się, aby kontynuować zakupy!', 'error');
      closeCart();
      document.getElementById('auth-modal').classList.add('active');
      return;
    }
    simulateCheckout();
  });
}

function closeCart() {
  document.getElementById('cart-sidebar').classList.remove('open');
  document.getElementById('cart-overlay').classList.remove('open');
}

function addToCart(productId) {
  if (!state.isLoggedIn) {
    showToast('Zaloguj się, aby dodać do koszyka!', 'error');
    document.getElementById('auth-modal').classList.add('active');
    return;
  }

  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existingItem = state.cart.find(item => item.id === productId);
  if (existingItem) {
    existingItem.qty++;
  } else {
    state.cart.push({ ...product, qty: 1 });
  }

  updateCartUI();
  showToast(`Dodano "${product.name}" do koszyka! 🛒`, 'success');
}

function removeFromCart(productId) {
  state.cart = state.cart.filter(item => item.id !== productId);
  updateCartUI();
  showToast('Usunięto z koszyka', 'info');
}

function updateCartQty(productId, delta) {
  const item = state.cart.find(i => i.id === productId);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(productId);
    return;
  }

  updateCartUI();
}

function updateCartUI() {
  const count = state.cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById('cart-count').textContent = count;
  document.getElementById('cart-sidebar-count').textContent = count;

  const cartItemsEl = document.getElementById('cart-items');
  const emptyEl = document.getElementById('cart-empty');
  const footerEl = document.getElementById('cart-footer');

  if (state.cart.length === 0) {
    emptyEl.style.display = '';
    footerEl.style.display = 'none';
    // Remove rendered cart items
    cartItemsEl.querySelectorAll('.cart-item').forEach(el => el.remove());
    return;
  }

  emptyEl.style.display = 'none';
  footerEl.style.display = '';

  // Remove old items
  cartItemsEl.querySelectorAll('.cart-item').forEach(el => el.remove());

  state.cart.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div class="cart-item-img">
        <img src="${item.image}" alt="${item.name}">
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-details">${getCategoryLabel(item.category)}</div>
        <div class="cart-item-bottom">
          <div class="cart-qty">
            <button onclick="updateCartQty(${item.id}, -1)">−</button>
            <span>${item.qty}</span>
            <button onclick="updateCartQty(${item.id}, 1)">+</button>
          </div>
          <span class="cart-item-price">${(item.price * item.qty).toFixed(2).replace('.', ',')} zł</span>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart(${item.id})">Usuń</button>
      </div>
    `;
    cartItemsEl.appendChild(div);
  });

  // Update total
  let total = state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (state.discountApplied) {
    total = total * (1 - state.discountPercent / 100);
  }

  document.getElementById('cart-total-amount').textContent =
    total.toFixed(2).replace('.', ',') + ' zł';

  // Check if eligible for automatic discount
  const rawTotal = state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  if (rawTotal >= 200 && !state.discountApplied) {
    showToast('🎉 Przekroczyłeś 200 zł! Użyj kodu SZYDEŁKO10 na -10%', 'success');
  }
}

function applyDiscount() {
  const code = document.getElementById('discount-code-input').value.trim().toUpperCase();

  if (code === 'SZYDEŁKO10' || code === 'SZYDELKO10') {
    state.discountApplied = true;
    state.discountPercent = 10;
    showToast('Kod rabatowy aktywowany! -10% 🎉', 'success');
    updateCartUI();
  } else if (code === 'NEWSLETTER20') {
    state.discountApplied = true;
    state.discountPercent = 20;
    showToast('Kod rabatowy aktywowany! -20% 🎊', 'success');
    updateCartUI();
  } else {
    showToast('Nieprawidłowy kod rabatowy', 'error');
  }
}

function simulateCheckout() {
  const total = state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const finalTotal = state.discountApplied ? total * (1 - state.discountPercent / 100) : total;

  closeCart();

  showToast(`Zamówienie złożone! Kwota: ${finalTotal.toFixed(2).replace('.', ',')} zł 💳`, 'success');
  setTimeout(() => {
    showToast('E-mail z potwierdzeniem został wysłany 📧', 'info');
  }, 1500);
  setTimeout(() => {
    showToast('Możesz śledzić status w swoim koncie 📊', 'info');
  }, 3000);

  // Clear cart
  state.cart = [];
  state.discountApplied = false;
  state.discountPercent = 0;
  updateCartUI();
}

// ===== FAQ =====
function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isActive = item.classList.contains('active');

      // Close all
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));

      // Toggle current
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

// ===== FORMS =====
function initForms() {
  // Newsletter
  document.getElementById('newsletter-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('newsletter-email').value;
    showToast(`Zapisano ${email} do newslettera! 💌`, 'success');
    setTimeout(() => {
      showToast('Użyj kodu NEWSLETTER20 na -20% na pierwsze zakupy!', 'info');
    }, 1500);
    e.target.reset();
  });

  // Custom order
  document.getElementById('custom-order-form').addEventListener('submit', (e) => {
    e.preventDefault();

    if (!state.isLoggedIn) {
      showToast('Zaloguj się, aby złożyć zamówienie custom!', 'error');
      document.getElementById('auth-modal').classList.add('active');
      return;
    }

    showToast('Zamówienie custom zostało wysłane! ✨', 'success');
    setTimeout(() => {
      showToast('Skontaktujemy się z Tobą w ciągu 24h 📧', 'info');
    }, 1500);
    e.target.reset();
  });

  // Contact
  document.getElementById('contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    showToast('Wiadomość wysłana! Odpowiemy najszybciej jak to możliwe 📬', 'success');
    e.target.reset();
  });
}

// ===== TOAST NOTIFICATIONS =====
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️'
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
  scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    scrollObserver.observe(el);
  });
}

function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.bottom >= 0
  );
}

// ===== ADMIN FUNCTIONS =====
function updateOrderStatus(btn) {
  const td = btn.closest('td').previousElementSibling;
  const badge = td.querySelector('.status-badge');

  const statuses = [
    { cls: 'status-pending', text: 'Oczekuje' },
    { cls: 'status-production', text: 'W produkcji' },
    { cls: 'status-shipped', text: 'Wysłane' },
    { cls: 'status-cancelled', text: 'Anulowane' }
  ];

  const currentIndex = statuses.findIndex(s => badge.classList.contains(s.cls));
  const nextIndex = (currentIndex + 1) % statuses.length;
  const next = statuses[nextIndex];

  // Remove all status classes
  statuses.forEach(s => badge.classList.remove(s.cls));
  badge.classList.add(next.cls);
  badge.textContent = next.text;

  showToast(`Status zmieniony na: ${next.text}`, 'info');

  if (next.cls === 'status-shipped') {
    setTimeout(() => {
      showToast('📧 E-mail z numerem śledzenia wysłany do klienta', 'success');
    }, 800);
  }
}

// Make functions globally accessible
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQty = updateCartQty;
window.updateOrderStatus = updateOrderStatus;
