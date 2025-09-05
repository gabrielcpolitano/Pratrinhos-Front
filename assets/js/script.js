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
 * Price formatting function
 */
function formatPrice(price) {
  const priceNum = parseFloat(price);
  const reais = Math.floor(priceNum);
  const centavos = Math.round((priceNum - reais) * 100);
  
  // Format thousands with dots
  const formattedReais = reais.toLocaleString('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).replace(/,/g, '.');
  
  // Only show cents if they're not zero
  if (centavos === 0) {
    return `R$ ${formattedReais}`;
  } else {
    return `R$ ${formattedReais}<sup class="text-xs">${centavos.toString().padStart(2, '0')}</sup>`;
  }
}

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

// Variáveis temporárias para armazenar dados do novo item
let pendingCartItem = null;
let isItemFromFavorites = false;

function addToCart(name, price, image, checkoutLink = null, fromFavorites = false) {
  // Verifica se já existe um item no carrinho
  if (cart.length > 0) {
    // Armazena os dados do novo item temporariamente
    pendingCartItem = {
      name: name,
      price: parseFloat(price),
      image: image,
      checkoutLink: checkoutLink,
      quantity: 1
    };
    
    // Marca se o item veio dos favoritos
    isItemFromFavorites = fromFavorites;
    
    // Mostra o modal de confirmação
    showSingleItemModal(cart[0].name, name);
  } else {
    // Adiciona o primeiro item normalmente
    cart = [{
      name: name,
      price: parseFloat(price),
      image: image,
      checkoutLink: checkoutLink,
      quantity: 1
    }];

    localStorage.setItem('shoppingCart', JSON.stringify(cart));
    updateCartCount();

    // Show success feedback
    showAddToCartFeedback(name);
    
    // Se veio dos favoritos, remove da lista de favoritos
    if (fromFavorites) {
      const itemIndex = favorites.findIndex(item => item.name === name);
      if (itemIndex !== -1) {
        favorites.splice(itemIndex, 1);
        localStorage.setItem('favoritesList', JSON.stringify(favorites));
        updateFavoritesCount();
        renderFavoritesItems();
        renderProducts(); // Update heart icons on main page
      }
    }
  }
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
    cartTotal.innerHTML = formatPrice(0);
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
          <p class="font-semibold text-gray-900 mt-1">${formatPrice(item.price)}</p>
          <p class="text-xs text-gray-500 mt-1">Em até 12x sem juros no Crédito / Cartão de Débito / Pix</p>
        </div>
        <div class="flex-shrink-0">
          <button class="text-blue-500 hover:text-blue-700 text-sm font-medium transition-colors" onclick="removeFromCart(${index})">Excluir</button>
        </div>
      </div>
    `;
  }).join('');

  cartTotal.innerHTML = formatPrice(totalPrice);
  }
}

function continueShopping() {
  if (cart.length > 0 && cart[0].checkoutLink) {
    // Redireciona para o link de checkout do produto
    window.open(cart[0].checkoutLink, '_blank');
  } else {
    alert('Link de checkout não disponível.');
  }
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
  feedback.textContent = `Adicionado ao Carrinho!`;

  document.body.appendChild(feedback);

  setTimeout(() => {
    document.body.removeChild(feedback);
  }, 500);
}

/**
 * Single Item Modal functionality
 */

function showSingleItemModal(currentItemName, newItemName) {
  const modalOverlay = document.getElementById('single-item-modal-overlay');
  const modal = document.getElementById('single-item-modal');
  const currentItemElement = document.getElementById('current-item-name');
  const newItemElement = document.getElementById('new-item-name');
  
  if (modalOverlay && modal && currentItemElement && newItemElement) {
    // Preenche os nomes dos itens
    currentItemElement.textContent = currentItemName;
    newItemElement.textContent = newItemName;
    
    // Mostra o modal
    modalOverlay.classList.remove('opacity-0', 'pointer-events-none');
    modalOverlay.classList.add('opacity-100');
    modal.classList.remove('scale-95');
    modal.classList.add('scale-100');
  }
}

function closeSingleItemModal() {
  const modalOverlay = document.getElementById('single-item-modal-overlay');
  const modal = document.getElementById('single-item-modal');
  
  if (modalOverlay && modal) {
    modalOverlay.classList.add('opacity-0', 'pointer-events-none');
    modalOverlay.classList.remove('opacity-100');
    modal.classList.add('scale-95');
    modal.classList.remove('scale-100');
  }
  
  // Limpa os dados temporários
  pendingCartItem = null;
  isItemFromFavorites = false;
}

function confirmReplaceItem() {
  if (pendingCartItem) {
    // Substitui o item no carrinho
    cart = [pendingCartItem];
    
    localStorage.setItem('shoppingCart', JSON.stringify(cart));
    updateCartCount();
    
    // Se o item veio dos favoritos, remove da lista de favoritos
    if (isItemFromFavorites) {
      const itemIndex = favorites.findIndex(item => item.name === pendingCartItem.name);
      if (itemIndex !== -1) {
        favorites.splice(itemIndex, 1);
        localStorage.setItem('favoritesList', JSON.stringify(favorites));
        updateFavoritesCount();
        renderFavoritesItems();
        renderProducts(); // Update heart icons on main page
      }
    }
    
    // Mostra feedback de sucesso
    showAddToCartFeedback(pendingCartItem.name);
    
    // Fecha o modal
    closeSingleItemModal();
  }
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
    favoritesOverlay.classList.remove('opacity-0', 'pointer-events-none');
    favoritesOverlay.classList.add('opacity-100');
    favoritesSidebar.classList.remove('translate-x-full');
    favoritesSidebar.classList.add('translate-x-0');
    renderFavoritesItems();
  }
}

function closeFavorites() {
  const favoritesOverlay = document.getElementById('favorites-overlay');
  const favoritesSidebar = document.getElementById('favorites-sidebar');

  if (favoritesOverlay && favoritesSidebar) {
    favoritesOverlay.classList.add('opacity-0', 'pointer-events-none');
    favoritesOverlay.classList.remove('opacity-100');
    favoritesSidebar.classList.add('translate-x-full');
    favoritesSidebar.classList.remove('translate-x-0');
  }
}

function isProductInFavorites(productName) {
  return favorites.some(item => item.name === productName);
}

function toggleFavorite(name, price, image, checkoutLink = null) {
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
      image: image,
      checkoutLink: checkoutLink
    });
    showAddToFavoritesFeedback(name);
  }

  localStorage.setItem('favoritesList', JSON.stringify(favorites));
  updateFavoritesCount();
  renderProducts(); // Re-render to update heart icons
}

function addToFavorites(name, price, image, checkoutLink = null) {
  toggleFavorite(name, price, image, checkoutLink);
}

function removeFromFavorites(index) {
  favorites.splice(index, 1);
  localStorage.setItem('favoritesList', JSON.stringify(favorites));
  updateFavoritesCount();
  renderFavoritesItems();
  renderProducts(); // Update heart icons on main page
}

function renderFavoritesItems() {
  const favoritesItems = document.getElementById('favorites-items');

  if (!favoritesItems) return;

  if (favorites.length === 0) {
    favoritesItems.innerHTML = '<div class="text-center py-8 text-gray-500">Sua lista de favoritos está vazia</div>';
  } else {
    favoritesItems.innerHTML = favorites.map((item, index) => {
      return `
        <div class="bg-white border border-gray-200 rounded-lg p-4 flex gap-4 shadow-sm">
          <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded-lg flex-shrink-0">
          <div class="flex-1 min-w-0">
            <h4 class="font-semibold text-gray-800 text-sm leading-tight mb-2">${item.name}</h4>
            <p class="text-lg font-bold text-gray-900 mb-1">${formatPrice(item.price)}</p>
            <p class="text-xs text-green-600 mb-3">em 12x sem juros</p>
            <button class="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors w-full mb-2" onclick="addToCartFromFavorites('${item.name}', '${item.price}', '${item.image}', '${item.checkoutLink || ""}')">
              Adicionar ao Carrinho
            </button>
          </div>
          <button class="text-red-500 hover:text-red-700 text-sm font-medium h-fit" onclick="removeFromFavorites(${index})">Excluir</button>
        </div>
      `;
    }).join('');
  }
}

function addToCartFromFavorites(name, price, image, checkoutLink = null) {
  // Add to cart with fromFavorites flag
  addToCart(name, price, image, checkoutLink, true);
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
  feedback.textContent = `Adicionado aos Favoritos!`;

  document.body.appendChild(feedback);

  setTimeout(() => {
    document.body.removeChild(feedback);
  }, 500);
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
          <img src="${product.image}" alt="${product.name}" loading="lazy" width="800" height="1034" class="w-100">

          <div class="card-actions">
            <button class="card-action-btn cart-btn" onclick="addToCart('${product.name}', '${product.price}', '${product.image}', '${product.checkoutLink}')">
              <ion-icon name="bag-handle-outline" aria-hidden="true"></ion-icon>
              <p>Adicionar ao Carrinho</p>
            </button>

            <button class="card-action-btn favorite-btn" onclick="addToFavorites('${product.name}', '${product.price}', '${product.image}', '${product.checkoutLink}')">
              <ion-icon name="${heartIcon}" aria-hidden="true"></ion-icon>
            </button>
          </div>
        </figure>

        <div class="card-content">
          <h3 class="h4 card-title">
            ${product.name}
          </h3>

          <div class="card-price">
            <data value="${product.price}">${formatPrice(product.price)}</data>
            <data style="color:green">em até 12x sem juros</data>
          </div>
        </div>
      </div>
    </li>
  `;
  }).join('');
}

/**
 * Smooth scrolling and navbar navigation
 */

// Add smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', function() {
  // Enable smooth scrolling for all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      
      // Only handle internal anchor links, not javascript:void(0)
      if (href !== '#' && href.startsWith('#')) {
        e.preventDefault();
        
        const target = document.querySelector(href);
        if (target) {
          // Close navbar if it's open (for mobile)
          if (navbar.classList.contains('active')) {
            navbar.classList.remove('active');
            overlay.classList.remove('active');
          }
          
          // Smooth scroll to target
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  // Initialize cart count, favorites count and load products
  updateCartCount();
  updateFavoritesCount();
  loadProducts();
});