const API_URL = 'https://dummyjson.com/products';

// DOM Elements
const productList = document.getElementById('product-list');
const cartCount = document.getElementById('cart-count');
const categorySelect = document.getElementById('category-select');
const cartItems = document.getElementById('cart-items');
const totalPriceElem = document.getElementById('total-price');
const itemCountSelect = document.getElementById('item-count');
const searchBar = document.getElementById('search-bar');
const errorMessage = document.getElementById('error-message');
const paginationContainer = document.getElementById('pagination-container');

// State
let products = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let categories = new Set();
let itemsPerPage = 5;
let currentPage = 1;
let searchQuery = '';

// Fetch Products from API
async function fetchProducts() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    products = data.products;
    categories = new Set(products.map(product => product.category));
    renderCategories();
    renderProducts();
    errorMessage.style.display = 'none'; // Hide error if successful
  } catch (error) {
    console.error("Error fetching products:", error);
    errorMessage.textContent = `Error: Failed to load products. ${error.message}`;
    errorMessage.style.display = 'block';
  }
}

// Render Categories
function renderCategories() {
  categorySelect.innerHTML = '<option value="all">All</option>';
  categories.forEach(category => {
    categorySelect.innerHTML += `<option value="${category}">${category}</option>`;
  });
}

// Render Products with Pagination
function renderProducts() {
  productList.innerHTML = '';
  const selectedCategory = categorySelect.value;
  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(product => product.category === selectedCategory);

  // Apply search filter
  const searchedProducts = searchQuery
    ? filteredProducts.filter(product => product.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : filteredProducts;

  const totalProducts = searchedProducts.length;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const visibleProducts = searchedProducts.slice(startIndex, endIndex);

  // Display Products
  if (visibleProducts.length === 0) {
    productList.innerHTML = '<p>No products found.</p>';
  } else {
    visibleProducts.forEach(product => {
      const productElement = document.createElement('div');
      productElement.classList.add('product');
      productElement.innerHTML = `
        <img src="${product.thumbnail}" alt="${product.title}" class="product-image"/>
        <h3>${product.title}</h3>
        <p>$${product.price}</p>
        <button onclick="addToCart(${product.id})">Add to Cart</button>
      `;
      productList.appendChild(productElement);
    });
  }

  renderPagination(totalPages);
}

// Render Pagination Controls
function renderPagination(totalPages) {
  paginationContainer.innerHTML = ''; // Clear existing pagination
  if (totalPages <= 1) return; // No need for pagination if only one page

  // Previous Button
  const prevButton = document.createElement('button');
  prevButton.textContent = 'Previous';
  prevButton.disabled = currentPage === 1;
  prevButton.onclick = () => {
    currentPage--;
    renderProducts();
  };
  paginationContainer.appendChild(prevButton);

  // Page Numbers
  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement('button');
    pageButton.textContent = i;

    // Add 'active' class to the current page
    if (i === currentPage) {
      pageButton.classList.add('active');
    }

    pageButton.onclick = () => {
      currentPage = i;
      renderProducts();
    };
    paginationContainer.appendChild(pageButton);
  }

  // Next Button
  const nextButton = document.createElement('button');
  nextButton.textContent = 'Next';
  nextButton.disabled = currentPage === totalPages;
  nextButton.onclick = () => {
    currentPage++;
    renderProducts();
  };
  paginationContainer.appendChild(nextButton);
}

// Add Product to Cart
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

// Update Cart
function updateCart() {
  cartItems.innerHTML = '';
  let totalPrice = 0;

  cart.forEach(item => {
    totalPrice += item.price * item.quantity;
    cartItems.innerHTML += `
      <li>
        <span>${item.title} - $${item.price} x ${item.quantity}</span>
        <div class="cart-item-controls">
          <button onclick="changeQuantity(${item.id}, 'decrease')">-</button>
          <button onclick="changeQuantity(${item.id}, 'increase')">+</button>
          <button onclick="removeFromCart(${item.id})">Remove</button>
        </div>
      </li>
    `;
  });

  totalPriceElem.textContent = `Total: $${totalPrice.toFixed(2)}`;
  cartCount.textContent = `Cart: ${cart.length} items`;
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Remove Product from Cart
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  updateCart();
}

// Change Quantity in Cart
function changeQuantity(productId, action) {
  const cartItem = cart.find(item => item.id === productId);
  if (action === 'increase') {
    cartItem.quantity++;
  } else if (action === 'decrease' && cartItem.quantity > 1) {
    cartItem.quantity--;
  }
  updateCart();
}

// Event Listeners
categorySelect.addEventListener('change', () => {
  currentPage = 1; // Reset to the first page when the category changes
  renderProducts();
});
itemCountSelect.addEventListener('change', (e) => {
  itemsPerPage = parseInt(e.target.value, 10);
  currentPage = 1; // Reset to the first page when items per page changes
  renderProducts();
});
searchBar.addEventListener('input', (e) => {
  searchQuery = e.target.value;
  currentPage = 1; // Reset to the first page when searching
  renderProducts();
});

// Initialize
fetchProducts();
updateCart();
