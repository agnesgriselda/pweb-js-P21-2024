// script.js

const API_URL = 'https://dummyjson.com/products';

// DOM elements
const productList = document.getElementById('product-list');
const cartCount = document.getElementById('cart-count');
const categorySelect = document.getElementById('category-select');
const cartItems = document.getElementById('cart-items');
const totalPriceElem = document.getElementById('total-price');
const itemCountSelect = document.getElementById('item-count');

// State
let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let categories = new Set();
let itemsPerPage = 5;

// Fetch products from API
async function fetchProducts() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    products = data.products;
    categories = new Set(products.map(product => product.category));
    renderCategories();
    renderProducts();
  } catch (error) {
    console.error("Failed to fetch products:", error);
  }
}

// Render categories
function renderCategories() {
  categorySelect.innerHTML = '<option value="all">All</option>';
  categories.forEach(category => {
    categorySelect.innerHTML += `<option value="${category}">${category}</option>`;
  });
}

// Render products
function renderProducts() {
  productList.innerHTML = '';
  const selectedCategory = categorySelect.value;
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  const startIndex = 0;
  const endIndex = itemsPerPage;
  const visibleProducts = filteredProducts.slice(startIndex, endIndex);

  visibleProducts.forEach(product => {
    const productElement = document.createElement('div');
    productElement.classList.add('product');
    productElement.innerHTML = `
      <h3>${product.title}</h3>
      <p>$${product.price}</p>
      <button onclick="addToCart(${product.id})">Add to Cart</button>
    `;
    productList.appendChild(productElement);
  });
}

// Add product to cart
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  const cartItem = cart.find(item => item.id === productId);
  if (cartItem) {
    cartItem.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  updateCart();
}

// Update cart
function updateCart() {
  cartItems.innerHTML = '';
  let totalPrice = 0;

  cart.forEach(item => {
    totalPrice += item.price * item.quantity;
    cartItems.innerHTML += `
      <li>
        ${item.title} - $${item.price} x ${item.quantity}
        <button onclick="removeFromCart(${item.id})">Remove</button>
        <button onclick="changeQuantity(${item.id}, 'increase')">+</button>
        <button onclick="changeQuantity(${item.id}, 'decrease')">-</button>
      </li>
    `;
  });

  totalPriceElem.textContent = `Total: $${totalPrice.toFixed(2)}`;
  cartCount.textContent = `Cart: ${cart.length} items`;
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Remove product from cart
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  updateCart();
}

// Change quantity in cart
function changeQuantity(productId, action) {
  const cartItem = cart.find(item => item.id === productId);
  if (action === 'increase') {
    cartItem.quantity++;
  } else if (action === 'decrease' && cartItem.quantity > 1) {
    cartItem.quantity--;
  }
  updateCart();
}

// Event listeners
categorySelect.addEventListener('change', renderProducts);
itemCountSelect.addEventListener('change', (e) => {
  itemsPerPage = parseInt(e.target.value, 10);
  renderProducts();
});

// Initialize
fetchProducts();
updateCart();
