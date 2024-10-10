const checkoutCartItems = document.getElementById('checkout-cart-items');
const checkoutTotalPrice = document.getElementById('checkout-total-price');

// Fetch cart from localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Render cart items on the checkout page
function renderCheckoutCart() {
  checkoutCartItems.innerHTML = '';
  let totalPrice = 0;

  cart.forEach(item => {
    totalPrice += item.price * item.quantity;
    checkoutCartItems.innerHTML += `
      <li>
        ${item.title} - $${item.price} x ${item.quantity}
      </li>
    `;
  });

  checkoutTotalPrice.textContent = `Total: $${totalPrice.toFixed(2)}`;
}

// Handle form submission
document.getElementById('checkout-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const address = document.getElementById('address').value;

  alert(`Order Confirmed! \nName: ${name}\nEmail: ${email}\nAddress: ${address}`);

  // Clear cart and redirect
  localStorage.removeItem('cart');
  window.location.href = 'index.html';
});

// Initialize
renderCheckoutCart();
