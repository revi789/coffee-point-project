/* js/payment.js — страница оплаты (демо).
   Корзина лежит на сервере. По кнопке "Подтвердить":
     1) POST /api/orders          — создаём заказ из корзины
     2) POST /api/orders/{id}/pay — "оплачиваем" (деньги не списываются) */

// ---------- Элементы страницы ----------
const form = document.querySelector('#payment-form');
const langButton = document.querySelector('#lang-button');
const orderItemsBox = document.querySelector('#order-items');
const itemCountEl = document.querySelector('#item-count');
const orderTotalEl = document.querySelector('#order-total');
const buttonTotalEl = document.querySelector('#button-total');
const payButton = document.querySelector('#pay-button');
const payButtonText = document.querySelector('#pay-button-text');
const payError = document.querySelector('#pay-error');
const successBox = document.querySelector('#success');
const cardInput = document.querySelector('#card');
const expiryInput = document.querySelector('#expiry');
const cvcInput = document.querySelector('#cvc');

let menuItems = [];
let cart = { items: [], count: 0, total: 0 };
let order = null;   // создаётся один раз; при повторной попытке оплаты используем его же

// ---------- Вспомогательные функции ----------
function formatPrice(number) {
  const locale = currentLang === 'ru' ? 'ru-RU' : 'en-US';
  return number.toLocaleString(locale) + ' ₽';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Склонение: 1 товар, 2 товара, 5 товаров
function itemsWord(n) {
  if (currentLang !== 'ru') return t(n === 1 ? 'pay.items.one' : 'pay.items.many');
  if (n % 10 === 1 && n % 100 !== 11) return t('pay.items.one');
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return t('pay.items.few');
  return t('pay.items.many');
}

// ---------- Показываем заказ ----------
function renderOrder() {
  itemCountEl.textContent = cart.count + ' ' + itemsWord(cart.count);
  orderTotalEl.textContent = formatPrice(cart.total);
  buttonTotalEl.textContent = formatPrice(cart.total);

  if (cart.items.length === 0) {
    orderItemsBox.innerHTML = `<p class="empty">${t('pay.empty')}</p>`;
    payButton.disabled = true;
    return;
  }

  let html = '';
  for (const line of cart.items) {
    const item = menuItems.find((m) => m.id === line.item_id);
    if (!item) continue;

    html += `
      <div class="order-item">
        <div>
          ${escapeHtml(pick(item.name))}
          <small>${line.qty} × ${formatPrice(line.price)}</small>
        </div>
        <strong>${formatPrice(line.sum)}</strong>
      </div>`;
  }
  orderItemsBox.innerHTML = html;
}

// ---------- Маски полей ----------
// Номер карты: только цифры, группы по 4
cardInput.addEventListener('input', () => {
  const digits = cardInput.value.replace(/\D/g, '').slice(0, 16);
  cardInput.value = digits.replace(/(.{4})/g, '$1 ').trim();
});

// Срок действия: 1230 -> 12/30
expiryInput.addEventListener('input', () => {
  const digits = expiryInput.value.replace(/\D/g, '').slice(0, 4);
  expiryInput.value = digits.length > 2 ? digits.slice(0, 2) + '/' + digits.slice(2) : digits;
});

// CVC: только 3 цифры
cvcInput.addEventListener('input', () => {
  cvcInput.value = cvcInput.value.replace(/\D/g, '').slice(0, 3);
});

// ---------- Язык ----------
langButton.addEventListener('click', () => {
  currentLang = currentLang === 'ru' ? 'en' : 'ru';
  translatePage();
  renderOrder();
  api.put('/session', { lang: currentLang }).catch(() => {});
});

// ---------- Отправка формы ----------
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  payError.hidden = true;

  if (cart.count === 0) return;
  if (!form.checkValidity()) {
    form.reportValidity();   // браузер подсветит неверное поле
    return;
  }

  payButton.disabled = true;
  payButtonText.textContent = t('pay.processing');

  try {
    // Шаг 1: создаём заказ (цену считает сервер)
    if (!order) {
      order = await api.post('/orders', {
        name: form.elements.name.value.trim(),
        email: form.elements.email.value.trim()
      });
    }

    // Шаг 2: оплачиваем
    await api.post('/orders/' + order.order_id + '/pay', {
      card: form.elements.card.value,
      expiry: form.elements.expiry.value,
      cvc: form.elements.cvc.value
    });

    document.querySelector('#order-number').textContent = order.order_id;
    form.hidden = true;
    successBox.hidden = false;
  } catch (error) {
    let text = t('pay.fail');
    if (error.status === 402) text = t('pay.declined');
    if (error.status === 422) text = t('pay.invalid');
    if (error.code === 'empty_cart') text = t('pay.empty');
    payError.textContent = text;
    payError.hidden = false;

    payButton.disabled = false;
    payButtonText.textContent = t('pay.submit');
  }
});

// ---------- Запуск ----------
async function init() {
  try {
    const session = await api.get('/session');
    currentLang = session.lang;

    const results = await Promise.all([api.get('/menu'), api.get('/cart')]);
    menuItems = results[0].items;
    cart = results[1];
  } catch (error) {
    // сервер недоступен — покажем пустую корзину
  }

  translatePage();
  renderOrder();
}

init();
