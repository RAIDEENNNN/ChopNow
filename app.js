const STORE = {
  name: 'ChopNow Kitchen',
  whatsapp: '2348000000000',
  currency: 'GBP',
  deliveryAreas: [
    { name: 'Canterbury', fee: 2.95 },
    { name: 'Maidstone', fee: 3.95 },
    { name: 'Medway', fee: 3.50 },
    { name: 'Dartford', fee: 4.95 },
    { name: 'Pickup from kitchen', fee: 0 }
  ]
};

const MENU = [
  { id: 1, name: 'Jollof Supreme', category: 'Rice', price: 12.95, icon: '🍛', color: '#f5aa35', badge: 'MOST LOVED', detail: 'Complete meal', description: 'Smoky party jollof, grilled chicken, plantain and slaw.' },
  { id: 2, name: 'Native Rice Pot', category: 'Rice', price: 11.95, icon: '🥘', color: '#c9d68c', description: 'Palm-oil rice with smoked fish, pomo and scent leaf.' },
  { id: 3, name: 'Egusi & Pounded Yam', category: 'Swallow', price: 14.50, icon: '🍲', color: '#e3bd55', badge: 'CHEF’S PICK', detail: 'Proper comfort', description: 'Rich egusi soup, assorted meat and smooth pounded yam.' },
  { id: 4, name: 'Ofada Special', category: 'Rice', price: 13.50, icon: '🍚', color: '#90bc79', description: 'Local rice, ayamase sauce, egg, beef and plantain.' },
  { id: 5, name: 'Pepper Soup Bowl', category: 'Soups', price: 10.95, icon: '🥣', color: '#e89b78', description: 'Catfish pepper soup with yam and fragrant local spices.' },
  { id: 6, name: 'Grilled Chicken Box', category: 'Grills', price: 16.95, icon: '🍗', color: '#d78658', badge: 'BIG PORTION', detail: 'Feeds a hunger', description: 'Half chicken, spicy potatoes, slaw and house sauce.' },
  { id: 7, name: 'Plantain Party', category: 'Sides', price: 4.95, icon: '🍌', color: '#ffd46d', description: 'Golden fried plantain with our smoky pepper dip.' },
  { id: 8, name: 'Zobo Citrus', category: 'Drinks', price: 3.50, icon: '🥤', color: '#d48398', description: 'Fresh hibiscus, pineapple, ginger and orange.' },
  { id: 9, name: 'Small Chops Box', category: 'Sides', price: 8.95, icon: '🍤', color: '#efaa85', description: 'Puff puff, samosa, spring rolls and peppered chicken.' }
];

let cart = JSON.parse(localStorage.getItem('chopnow-cart') || '{}');
let activeCategory = 'All';
const $ = selector => document.querySelector(selector);
const money = value => new Intl.NumberFormat('en-GB', { style: 'currency', currency: STORE.currency }).format(value);

function renderCategories() {
  const categories = ['All', ...new Set(MENU.map(item => item.category))];
  $('#categories').innerHTML = categories.map(category => `<button class="category ${category === activeCategory ? 'active' : ''}" data-category="${category}">${category}</button>`).join('');
}

function renderMenu() {
  const query = $('#search').value.trim().toLowerCase();
  const meals = MENU.filter(item => (activeCategory === 'All' || item.category === activeCategory) && `${item.name} ${item.description}`.toLowerCase().includes(query));
  $('#menu-grid').innerHTML = meals.map(item => `<article class="meal-card">
    <div class="meal-art" style="background:${item.color}">${item.badge ? `<b>${item.badge}</b>` : ''}<span>${item.icon}</span></div>
    <div class="meal-info"><div class="meal-top"><div>${item.detail ? `<small>${item.detail}</small>` : ''}<h3>${item.name}</h3><p>${item.description}</p></div></div>
    <div class="price-row"><strong>${money(item.price)}</strong><button class="add-button" data-add="${item.id}" aria-label="Add ${item.name} to bag"><span>Add</span> +</button></div></div>
  </article>`).join('');
  $('#empty-state').hidden = meals.length > 0;
}

function saveCart() { localStorage.setItem('chopnow-cart', JSON.stringify(cart)); }
function cartLines() { return MENU.filter(item => cart[item.id]).map(item => ({ ...item, quantity: cart[item.id] })); }

function renderCart() {
  const lines = cartLines();
  const count = lines.reduce((sum, item) => sum + item.quantity, 0);
  $('#cart-count').textContent = count;
  const foodTotal = lines.reduce((sum, item) => sum + item.price * item.quantity, 0);
  $('#mobile-cart-total').textContent = money(foodTotal);
  $('#mobile-bag').classList.toggle('visible', count > 0);
  $('#cart-items').innerHTML = lines.map(item => `<div class="cart-item"><div class="cart-item-icon" style="background:${item.color}">${item.icon}</div><div><h4>${item.name}</h4><div class="quantity"><button data-change="${item.id}" data-delta="-1" aria-label="Remove one">−</button><span>${item.quantity}</span><button data-change="${item.id}" data-delta="1" aria-label="Add one">+</button></div></div><strong>${money(item.price * item.quantity)}</strong></div>`).join('');
  $('#cart-empty').hidden = lines.length > 0;
  $('#cart-summary').hidden = lines.length === 0;
  updateTotals();
}

function updateTotals() {
  const subtotal = cartLines().reduce((sum, item) => sum + item.price * item.quantity, 0);
  const fee = STORE.deliveryAreas[$('#delivery-area').selectedIndex]?.fee || 0;
  $('#subtotal').textContent = money(subtotal);
  $('#delivery-fee').textContent = fee ? money(fee) : 'Free';
  $('#total').textContent = money(subtotal + fee);
}

function openCart() { $('#cart').classList.add('open'); $('#cart').setAttribute('aria-hidden', 'false'); $('#overlay').hidden = false; document.body.style.overflow = 'hidden'; }
function closeCart() { $('#cart').classList.remove('open'); $('#cart').setAttribute('aria-hidden', 'true'); $('#overlay').hidden = true; document.body.style.overflow = ''; }
function notify() { $('#toast').classList.add('show'); clearTimeout(notify.timer); notify.timer = setTimeout(() => $('#toast').classList.remove('show'), 1800); }

function checkout() {
  const lines = cartLines();
  if (!lines.length) return;
  const area = STORE.deliveryAreas[$('#delivery-area').selectedIndex];
  const subtotal = lines.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const list = lines.map((item, index) => `${index + 1}. ${item.name} × ${item.quantity} — ${money(item.price * item.quantity)}`).join('\n');
  const message = `Hello ${STORE.name}! I’d like to place an order:\n\n${list}\n\nFood subtotal: ${money(subtotal)}\nDelivery: ${area.name} (${area.fee ? money(area.fee) : 'Free'})\nTotal: ${money(subtotal + area.fee)}\n\nMy name and address are:`;
  window.open(`https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(message)}`, '_blank', 'noopener');
}

$('#categories').addEventListener('click', event => { const button = event.target.closest('[data-category]'); if (!button) return; activeCategory = button.dataset.category; renderCategories(); renderMenu(); });
$('#menu-grid').addEventListener('click', event => { const button = event.target.closest('[data-add]'); if (!button) return; const id = button.dataset.add; cart[id] = (cart[id] || 0) + 1; saveCart(); renderCart(); notify(); });
$('#cart-items').addEventListener('click', event => { const button = event.target.closest('[data-change]'); if (!button) return; const id = button.dataset.change; cart[id] = (cart[id] || 0) + Number(button.dataset.delta); if (cart[id] <= 0) delete cart[id]; saveCart(); renderCart(); });
$('#search').addEventListener('input', renderMenu);
$('#cart-button').addEventListener('click', openCart);
$('#close-cart').addEventListener('click', closeCart);
$('#overlay').addEventListener('click', closeCart);
$('#delivery-area').addEventListener('change', updateTotals);
$('#checkout').addEventListener('click', checkout);
$('#mobile-bag').addEventListener('click', openCart);
document.querySelectorAll('[data-quick-add]').forEach(button => button.addEventListener('click', () => { const id = button.dataset.quickAdd; cart[id] = (cart[id] || 0) + 1; saveCart(); renderCart(); notify(); openCart(); }));
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeCart(); });

$('#delivery-area').innerHTML = STORE.deliveryAreas.map(area => `<option>${area.name} — ${area.fee ? money(area.fee) : 'Free'}</option>`).join('');
$('#year').textContent = new Date().getFullYear();
renderCategories(); renderMenu(); renderCart();
