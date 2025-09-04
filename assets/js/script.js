'use strict';

/**
 * navbar toggle
 */

const overlay = document.querySelector("[data-overlay]");
const navOpenBtn = document.querySelector("[data-nav-open-btn]");
const navbar = document.querySelector("[data-navbar]");
const navCloseBtn = document.querySelector("[data-nav-close-btn]");

const navElemArr = [overlay, navOpenBtn, navCloseBtn];

for (let i = 0; i < navElemArr.length; i++) {
  navElemArr[i].addEventListener("click", function () {
    navbar.classList.toggle("active");
    overlay.classList.toggle("active");
  });
}



/**
 * add active class on header when scrolled 200px from top
 */

const header = document.querySelector("[data-header]");

window.addEventListener("scroll", function () {
  window.scrollY >= 200 ? header.classList.add("active")
    : header.classList.remove("active");
})

/**
 * Shopping Cart functionality
 */

let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

function updateCartCount() {
  const cartCount = document.getElementById('cart-count');
  if (cartCount) {
    cartCount.textContent = cart.length;
  }
}

function openCart() {
  const cartOverlay = document.getElementById('cart-overlay');
  const shoppingCart = document.getElementById('shopping-cart');
  
  if (cartOverlay && shoppingCart) {
    cartOverlay.classList.remove('opacity-0', 'pointer-events-none');
    cartOverlay.classList.add('opacity-100');
    shoppingCart.classList.remove('translate-x-full');
    shoppingCart.classList.add('translate-x-0');
    renderCartItems();
  }
}

function closeCart() {
  const cartOverlay = document.getElementById('cart-overlay');
  const shoppingCart = document.getElementById('shopping-cart');
  
  if (cartOverlay && shoppingCart) {
    cartOverlay.classList.add('opacity-0', 'pointer-events-none');
    cartOverlay.classList.remove('opacity-100');
    shoppingCart.classList.add('translate-x-full');
    shoppingCart.classList.remove('translate-x-0');
  }
}

function addToCart(name, price, image) {
  const existingItem = cart.find(item => item.name === name);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      name: name,
      price: parseFloat(price),
      image: image,
      quantity: 1
    });
  }
  
  localStorage.setItem('shoppingCart', JSON.stringify(cart));
  updateCartCount();
  
  // Show success feedback
  showAddToCartFeedback(name);
}

function removeFromCart(index) {
  cart.splice(index, 1);
  localStorage.setItem('shoppingCart', JSON.stringify(cart));
  updateCartCount();
  renderCartItems();
}

function renderCartItems() {
  const cartItems = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  
  if (!cartItems || !cartTotal) return;
  
  if (cart.length === 0) {
    cartItems.innerHTML = '<div class="text-center py-8 text-gray-500">Seu carrinho está vazio</div>';
    cartTotal.textContent = 'R$ 0,00';
    // Don't return - let the footer still render
  } else {
  
  let totalPrice = 0;
  
  cartItems.innerHTML = cart.map((item, index) => {
    totalPrice += item.price * item.quantity;
    return `
      <div class="bg-gray-50 rounded-lg p-4 flex gap-4 items-center">
        <img src="${item.image}" alt="${item.name}" class="w-16 h-16 object-cover rounded-lg flex-shrink-0">
        <div class="flex-1 min-w-0">
          <h4 class="font-medium text-gray-800 text-sm leading-tight">${item.name}</h4>
          <p class="font-semibold text-gray-900 mt-1">R$ ${item.price.toFixed(2).replace('.', ',')}</p>
          <p class="text-xs text-gray-500 mt-1">Em até 12x sem juros no Crédito ou Cartão de Débito ou Pix</p>
        </div>
        <div class="flex-shrink-0">
          <button class="text-blue-500 hover:text-blue-700 text-sm font-medium transition-colors" onclick="removeFromCart(${index})">Excluir</button>
        </div>
      </div>
    `;
  }).join('');
  
  cartTotal.textContent = `R$ ${totalPrice.toFixed(2).replace('.', ',')}`;
  }
}

function continueShopping() {
  alert('Redirecionando para o checkout...');
  closeCart();
}

function showAddToCartFeedback(productName) {
  // Simple feedback - you could make this more sophisticated
  const feedback = document.createElement('div');
  feedback.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #27AE60;
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    z-index: 10000;
    font-family: var(--ff-jost);
  `;
  feedback.textContent = `${productName} adicionado ao carrinho!`;
  
  document.body.appendChild(feedback);
  
  setTimeout(() => {
    document.body.removeChild(feedback);
  }, 2000);
}

/**
 * Favorites functionality
 */

let favorites = JSON.parse(localStorage.getItem('favoritesList')) || [];

function updateFavoritesCount() {
  const favoritesCount = document.getElementById('favorites-count');
  if (favoritesCount) {
    favoritesCount.textContent = favorites.length;
  }
}

function openFavorites() {
  const favoritesOverlay = document.getElementById('favorites-overlay');
  const favoritesSidebar = document.getElementById('favorites-sidebar');
  
  if (favoritesOverlay && favoritesSidebar) {
    favoritesOverlay.classList.add('active');
    favoritesSidebar.classList.add('active');
    renderFavoritesItems();
  }
}

function closeFavorites() {
  const favoritesOverlay = document.getElementById('favorites-overlay');
  const favoritesSidebar = document.getElementById('favorites-sidebar');
  
  if (favoritesOverlay && favoritesSidebar) {
    favoritesOverlay.classList.remove('active');
    favoritesSidebar.classList.remove('active');
  }
}

function isProductInFavorites(productName) {
  return favorites.some(item => item.name === productName);
}

function toggleFavorite(name, price, image) {
  const existingItem = favorites.find(item => item.name === name);
  
  if (existingItem) {
    // Remove from favorites
    const itemIndex = favorites.findIndex(item => item.name === name);
    favorites.splice(itemIndex, 1);
  } else {
    // Add to favorites
    favorites.push({
      name: name,
      price: parseFloat(price),
      image: image
    });
    showAddToFavoritesFeedback(name);
  }
  
  localStorage.setItem('favoritesList', JSON.stringify(favorites));
  updateFavoritesCount();
  renderProducts(); // Re-render to update heart icons
}

function addToFavorites(name, price, image) {
  toggleFavorite(name, price, image);
}

function removeFromFavorites(index) {
  favorites.splice(index, 1);
  localStorage.setItem('favoritesList', JSON.stringify(favorites));
  updateFavoritesCount();
  renderFavoritesItems();
}

function renderFavoritesItems() {
  const favoritesItems = document.getElementById('favorites-items');
  
  if (!favoritesItems) return;
  
  if (favorites.length === 0) {
    favoritesItems.innerHTML = '<div class="empty-favorites">Sua lista de favoritos está vazia</div>';
  } else {
    favoritesItems.innerHTML = favorites.map((item, index) => {
      return `
        <div class="favorites-item">
          <img src="${item.image}" alt="${item.name}" class="favorites-item-image">
          <div class="favorites-item-details">
            <h4 class="favorites-item-name">${item.name}</h4>
            <p class="favorites-item-price">R$ ${item.price.toFixed(2).replace('.', ',')}<sup>99</sup></p>
            <p class="favorites-item-installment">em 12x sem juros</p>
            <button class="add-to-cart-from-favorites" onclick="addToCartFromFavorites('${item.name}', '${item.price}', '${item.image}')">
              Adicionar ao Carrinho
            </button>
          </div>
          <button class="remove-favorite-btn" onclick="removeFromFavorites(${index})">Excluir</button>
        </div>
      `;
    }).join('');
  }
}

function addToCartFromFavorites(name, price, image) {
  // Add to cart first
  addToCart(name, price, image);
  
  // Find and remove from favorites
  const itemIndex = favorites.findIndex(item => item.name === name);
  if (itemIndex !== -1) {
    favorites.splice(itemIndex, 1);
    localStorage.setItem('favoritesList', JSON.stringify(favorites));
    updateFavoritesCount();
    renderFavoritesItems();
    renderProducts(); // Update heart icons on main page
  }
}

function showAddToFavoritesFeedback(productName) {
  const feedback = document.createElement('div');
  feedback.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #FFD700;
    color: #333;
    padding: 10px 20px;
    border-radius: 5px;
    z-index: 10000;
    font-family: var(--ff-jost);
  `;
  feedback.textContent = `${productName} adicionado aos favoritos!`;
  
  document.body.appendChild(feedback);
  
  setTimeout(() => {
    document.body.removeChild(feedback);
  }, 2000);
}

/**
 * Dynamic Products Loading
 */

let productsData = [];

async function loadProducts() {
  try {
    const response = await fetch('./assets/products.json');
    const data = await response.json();
    productsData = data.products;
    renderProducts();
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
    // Fallback - show error message
    const container = document.getElementById('products-container');
    if (container) {
      container.innerHTML = '<li class="error-message">Erro ao carregar produtos. Tente novamente.</li>';
    }
  }
}

function renderProducts() {
  const container = document.getElementById('products-container');
  if (!container || productsData.length === 0) return;

  container.innerHTML = productsData.map(product => {
    const isFavorited = isProductInFavorites(product.name);
    const heartIcon = isFavorited ? 'heart' : 'heart-outline';
    
    return `
    <li>
      <div class="product-card">
        <figure class="card-banner">
          <a href="#">
            <img src="${product.image}" alt="${product.name}" loading="lazy" width="800" height="1034" class="w-100">
          </a>

          <div class="card-actions">
            <button class="card-action-btn cart-btn" onclick="addToCart('${product.name}', '${product.price}', '${product.image}')">
              <ion-icon name="bag-handle-outline" aria-hidden="true"></ion-icon>
              <p>Adicionar ao Carrinho</p>
            </button>

            <button class="card-action-btn favorite-btn" onclick="addToFavorites('${product.name}', '${product.price}', '${product.image}')">
              <ion-icon name="${heartIcon}" aria-hidden="true"></ion-icon>
            </button>
          </div>
        </figure>

        <div class="card-content">
          <h3 class="h4 card-title">
            <a href="#">${product.name}</a>
          </h3>

          <div class="card-price">
            <data value="${product.price}">R$ ${product.price.toFixed(2).replace('.', ',')}</data>
            <data>Em até 12x sem juros</data>
          </div>
        </div>
      </div>
    </li>
  `;
  }).join('');
}

// Initialize cart count, favorites count and load products when page loads
document.addEventListener('DOMContentLoaded', function() {
  updateCartCount();
  updateFavoritesCount();
  loadProducts();
});