/* js/script.js — логика главной страницы "Кофе Point"
   Данные (меню, корзина, язык, форма) приходят с бэкенда через api.js.
   Содержание:
    1. Элементы и состояние
    2. Язык
    3. Анимация появления при скролле
    4. Карточки, вкладки и поиск
    5. Слайдер
    6. Корзина и toast
    7. Модальное окно товара
    8. Форма обратной связи
    9. Мобильное меню, шапка, кнопка "Наверх"
   10. Запуск
   (Плавный скролл по якорям — в CSS: scroll-behavior: smooth) */

// ---------- 1. Элементы и состояние ----------
const header = document.querySelector('#header');
const nav = document.querySelector('#nav');
const burger = document.querySelector('#burger');
const langButton = document.querySelector('#lang-button');
const tabsBox = document.querySelector('#tabs');
const tabs = document.querySelectorAll('.tab');
const menuGrid = document.querySelector('#menu-grid');
const searchInput = document.querySelector('#search-input');
const searchClear = document.querySelector('#search-clear');

const sliderTrack = document.querySelector('#slider-track');
const sliderDots = document.querySelector('#slider-dots');
const sliderViewport = document.querySelector('#slider-viewport');

const cartButton = document.querySelector('#cart-button');
const cartCountEl = document.querySelector('#cart-count');
const cartPanel = document.querySelector('#cart');
const cartItemsBox = document.querySelector('#cart-items');
const cartTotalEl = document.querySelector('#cart-total');
const overlay = document.querySelector('#overlay');

const modal = document.querySelector('#product-modal');
const modalBody = document.querySelector('#modal-body');
const toastBox = document.querySelector('#toast-box');
const toTopButton = document.querySelector('#to-top');

let menuItems = [];                              // приходит с сервера: GET /api/menu
let cart = { items: [], count: 0, total: 0 };    // приходит с сервера: GET /api/cart
let category = 'coffee';                         // выбранная вкладка
let searchText = '';                             // строка поиска
let modalItem = null;                            // товар в модальном окне
let modalQty = 1;

// ---------- Вспомогательные функции ----------
function formatPrice(number) {
  const locale = currentLang === 'ru' ? 'ru-RU' : 'en-US';
  return number.toLocaleString(locale) + ' ₽';
}

function findItem(id) {
  return menuItems.find((item) => item.id === id);
}

function imageUrl(item, width) {
  return item.image + '?auto=format&fit=crop&w=' + width + '&q=80';
}

// Защита от HTML-инъекций при вставке текста через innerHTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ---------- 2. Язык ----------
function setLanguage(lang, saveOnServer) {
  currentLang = lang;
  translatePage();
  syncBurgerLabel();
  renderAll(false);

  // Запоминаем язык на сервере (в сессии), чтобы он сохранялся между визитами
  if (saveOnServer) {
    api.put('/session', { lang: lang }).catch(() => {});
  }
}

langButton.addEventListener('click', () => {
  setLanguage(currentLang === 'ru' ? 'en' : 'ru', true);
});

// Перерисовываем всё, что строится из JS
function renderAll(animate) {
  renderMenu(animate);
  renderSlider();
  updateCart();
  if (modal.open) renderModal();
}

// ---------- 3. Анимация появления при скролле ----------
const revealObserver = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target); // анимируем один раз
        }
      });
    }, { threshold: 0.1 })
  : null;

function observeReveals(root) {
  root.querySelectorAll('.reveal:not(.visible)').forEach((el) => {
    if (revealObserver) {
      revealObserver.observe(el);
    } else {
      el.classList.add('visible'); // старые браузеры: просто показываем
    }
  });
}

// ---------- 4. Карточки, вкладки и поиск ----------
// delay — задержка анимации, чтобы карточки появлялись по очереди
function cardHTML(item, animate, delay) {
  const name = escapeHtml(pick(item.name));
  const revealClass = animate ? ' reveal' : '';
  const style = animate ? ` style="transition-delay: ${delay}ms"` : '';

  return `
    <article class="card${revealClass}"${style}>
      <button class="card__image-button" type="button" data-details="${item.id}">
        <img class="card__image" src="${imageUrl(item, 600)}" alt="${name}" loading="lazy">
      </button>
      <div class="card__body">
        <h3 class="card__title">${name}</h3>
        <p class="card__desc">${escapeHtml(pick(item.description))}</p>
        <button class="card__more" type="button" data-details="${item.id}">${t('card.details')}</button>
        <div class="card__footer">
          <span class="card__price">${formatPrice(item.price)}</span>
          <button class="card__button" type="button" data-add="${item.id}">${t('card.add')}</button>
        </div>
      </div>
    </article>`;
}

// ё и е считаем одной буквой, регистр не важен
function normalize(text) {
  return text.toLowerCase().replaceAll('ё', 'е');
}

// Подходит ли товар под поисковый запрос (ищем по названию, описанию, составу, категории)
function matchesSearch(item) {
  const text = normalize([
    item.name.ru, item.name.en,
    pick(item.description), pick(item.ingredients),
    t('cat.' + item.category)
  ].join(' '));

  // Каждое слово запроса должно встретиться в тексте
  return normalize(searchText.trim()).split(/\s+/).every((word) => text.includes(word));
}

function getVisibleItems() {
  if (searchText.trim() !== '') {
    return menuItems.filter(matchesSearch);              // поиск — по всем категориям
  }
  return menuItems.filter((item) => item.category === category);
}

function renderMenu(animate) {
  const searching = searchText.trim() !== '';

  tabs.forEach((tab) => {
    tab.classList.toggle('active', !searching && tab.dataset.category === category);
  });
  tabsBox.classList.toggle('muted', searching);
  searchClear.hidden = searchText === '';

  const items = getVisibleItems();
  if (items.length === 0) {
    menuGrid.innerHTML = `<p class="menu-grid__message">${t('menu.empty')}</p>`;
    return;
  }

  let html = '';
  items.forEach((item, index) => {
    html += cardHTML(item, animate, (index % 4) * 80);
  });
  menuGrid.innerHTML = html;

  if (animate) observeReveals(menuGrid);
}

// Клик по вкладке
tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    category = tab.dataset.category;
    searchText = '';
    searchInput.value = '';
    renderMenu(true);
  });
});

// Поиск: ждём 150 мс после последней буквы, чтобы не перерисовывать на каждый символ
let searchTimer = null;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    searchText = searchInput.value;
    renderMenu(true);
  }, 150);
});

function clearSearch() {
  clearTimeout(searchTimer);
  searchText = '';
  searchInput.value = '';
  renderMenu(true);
}
searchClear.addEventListener('click', () => {
  clearSearch();
  searchInput.focus();
});
searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && searchInput.value !== '') clearSearch();
});

// Если картинка не загрузилась — скрываем её (останется цветной фон)
document.addEventListener('error', (event) => {
  if (event.target.tagName === 'IMG' && event.target.closest('.card, .modal')) {
    event.target.style.visibility = 'hidden';
  }
}, true);

// Кнопки "В корзину" и "Подробнее" — один обработчик на весь документ
document.addEventListener('click', (event) => {
  const addButton = event.target.closest('[data-add]');
  if (addButton) {
    addToCart(addButton.dataset.add, 1);
    return;
  }

  const detailsButton = event.target.closest('[data-details]');
  if (detailsButton) {
    openModal(detailsButton.dataset.details);
  }
});

// ---------- 5. Слайдер (без библиотек) ----------
let sliderIndex = 0;     // номер первой видимой карточки
let sliderPerView = 3;   // сколько карточек помещается на экране
let sliderMax = 0;       // максимальный номер
let sliderTimer = null;

function renderSlider() {
  const featured = menuItems.filter((item) => item.featured);

  let html = '';
  featured.forEach((item) => {
    html += `<div class="slider__slide">${cardHTML(item, false, 0)}</div>`;
  });
  sliderTrack.innerHTML = html;

  layoutSlider();
}

// Считаем, сколько карточек влезает (как в CSS-адаптиве), и перерисовываем точки
function layoutSlider() {
  const count = sliderTrack.children.length;
  const width = window.innerWidth;
  sliderPerView = width > 820 ? 3 : width > 560 ? 2 : 1;
  sliderMax = Math.max(0, count - sliderPerView);
  if (sliderIndex > sliderMax) sliderIndex = sliderMax;

  let dots = '';
  for (let i = 0; i <= sliderMax; i++) {
    dots += `<button class="slider__dot" type="button" data-slide="${i}" aria-label="${t('slider.dot', { n: i + 1 })}"></button>`;
  }
  sliderDots.innerHTML = dots;

  updateSlider();
}

function updateSlider() {
  sliderTrack.style.transform = `translateX(-${(sliderIndex * 100) / sliderPerView}%)`;
  sliderDots.querySelectorAll('.slider__dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === sliderIndex);
  });
}

// На краях слайдер зацикливается
function goToSlide(index) {
  if (index > sliderMax) index = 0;
  if (index < 0) index = sliderMax;
  sliderIndex = index;
  updateSlider();
}

// Автопрокрутка: пауза при наведении и при отключённых анимациях
function startAutoplay() {
  stopAutoplay();
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  sliderTimer = setInterval(() => goToSlide(sliderIndex + 1), 5000);
}
function stopAutoplay() {
  clearInterval(sliderTimer);
}

document.querySelector('#slider-prev').addEventListener('click', () => { goToSlide(sliderIndex - 1); startAutoplay(); });
document.querySelector('#slider-next').addEventListener('click', () => { goToSlide(sliderIndex + 1); startAutoplay(); });

sliderDots.addEventListener('click', (event) => {
  const dot = event.target.closest('[data-slide]');
  if (dot) {
    goToSlide(Number(dot.dataset.slide));
    startAutoplay();
  }
});

sliderViewport.addEventListener('mouseenter', stopAutoplay);
sliderViewport.addEventListener('mouseleave', startAutoplay);

// Свайп пальцем
let touchStartX = 0;
sliderViewport.addEventListener('touchstart', (event) => {
  touchStartX = event.touches[0].clientX;
  stopAutoplay();
}, { passive: true });

sliderViewport.addEventListener('touchend', (event) => {
  const diff = event.changedTouches[0].clientX - touchStartX;
  if (diff < -50) goToSlide(sliderIndex + 1);   // свайп влево — дальше
  if (diff > 50) goToSlide(sliderIndex - 1);    // свайп вправо — назад
  startAutoplay();
}, { passive: true });

// При изменении размера окна пересчитываем слайдер
let resizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(layoutSlider, 150);
});

// ---------- 6. Корзина и toast ----------
// Корзина хранится на сервере (в сессии). Каждая функция отправляет запрос
// и получает обновлённую корзину в ответе.
async function addToCart(id, qty) {
  try {
    cart = await api.post('/cart/items', { item_id: id, qty: qty });
    updateCart(true);
    showToast(t('toast.added', { name: pick(findItem(id).name) }));
  } catch (error) {
    showToast(t('toast.error'));
  }
}

async function setCartQty(id, qty) {
  try {
    cart = await api.patch('/cart/items/' + id, { qty: qty });
    updateCart(false);
  } catch (error) {
    showToast(t('toast.error'));
  }
}

async function clearCart() {
  try {
    cart = await api.delete('/cart');
    updateCart(false);
    showToast(t('toast.cleared'));
  } catch (error) {
    showToast(t('toast.error'));
  }
}

// Обновляет счётчик в шапке и список в панели корзины
function updateCart() {
  cartCountEl.textContent = cart.count;
  cartTotalEl.textContent = formatPrice(cart.total);

  let html = '';
  for (const line of cart.items) {
    const item = findItem(line.item_id);
    if (!item) continue;

    html += `
      <div class="cart-item">
        <span class="cart-item__name">${escapeHtml(pick(item.name))}</span>
        <span class="cart-item__sum">${formatPrice(line.sum)}</span>
        <div class="qty">
          <button type="button" data-id="${line.item_id}" data-qty="${line.qty - 1}" aria-label="${t('cart.less')}">−</button>
          <span>${line.qty}</span>
          <button type="button" data-id="${line.item_id}" data-qty="${line.qty + 1}" aria-label="${t('cart.more')}">+</button>
        </div>
      </div>`;
  }
  cartItemsBox.innerHTML = html || `<p class="cart__empty">${t('cart.empty')}</p>`;
}

function openCart() {
  cartPanel.classList.add('open');
  overlay.classList.add('show');
  document.body.classList.add('no-scroll');
}

function closeCart() {
  cartPanel.classList.remove('open');
  overlay.classList.remove('show');
  if (!nav.classList.contains('open') && !modal.open) {
    document.body.classList.remove('no-scroll');
  }
}

cartButton.addEventListener('click', openCart);
document.querySelector('#cart-close').addEventListener('click', closeCart);
overlay.addEventListener('click', closeCart);
document.querySelector('#clear-button').addEventListener('click', clearCart);

cartItemsBox.addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (button) setCartQty(button.dataset.id, Number(button.dataset.qty));
});

document.querySelector('#checkout-button').addEventListener('click', () => {
  if (cart.count === 0) {
    showToast(t('toast.needItems'));
    return;
  }
  window.location.href = '/pages/payment.html';
});

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = '✓ ' + message;
  toastBox.appendChild(toast);

  // Через 2.5 секунды плавно скрываем, ещё через 0.3 — удаляем
  setTimeout(() => toast.classList.add('hide'), 2500);
  setTimeout(() => toast.remove(), 2800);
}

// ---------- 7. Модальное окно с деталями товара ----------
function openModal(id) {
  modalItem = findItem(id);
  if (!modalItem) return;

  modalQty = 1;
  renderModal();
  modal.showModal();                       // встроенный <dialog>: затемнение, фокус, Esc
  document.body.classList.add('no-scroll');
}

function renderModal() {
  const item = modalItem;
  const name = escapeHtml(pick(item.name));

  modalBody.innerHTML = `
    <div class="modal__inner">
      <img class="modal__image" src="${imageUrl(item, 800)}" alt="${name}">
      <div class="modal__content">
        <p class="modal__category">${t('cat.' + item.category)}</p>
        <h2 class="modal__title">${name}</h2>
        <p class="modal__desc">${escapeHtml(pick(item.description))}</p>
        <dl class="modal__facts">
          <div><dt>${t('modal.ingredients')}</dt><dd>${escapeHtml(pick(item.ingredients))}</dd></div>
          <div><dt>${t('modal.size')}</dt><dd>${item.size.value} ${t('unit.' + item.size.unit)}</dd></div>
          <div><dt>${t('modal.kcal')}</dt><dd>${t('modal.kcalValue', { n: item.kcal })}</dd></div>
        </dl>
        <div class="modal__buy">
          <span class="modal__price" id="modal-price">${formatPrice(item.price * modalQty)}</span>
          <div class="qty">
            <button type="button" data-modal-change="-1" aria-label="${t('cart.less')}">−</button>
            <span id="modal-qty">${modalQty}</span>
            <button type="button" data-modal-change="1" aria-label="${t('cart.more')}">+</button>
          </div>
          <button class="btn" type="button" id="modal-add">${t('modal.add')}</button>
        </div>
      </div>
    </div>`;
}

modalBody.addEventListener('click', async (event) => {
  const changeButton = event.target.closest('[data-modal-change]');
  if (changeButton) {
    modalQty = Math.max(1, Math.min(99, modalQty + Number(changeButton.dataset.modalChange)));
    document.querySelector('#modal-qty').textContent = modalQty;
    document.querySelector('#modal-price').textContent = formatPrice(modalItem.price * modalQty);
    return;
  }

  if (event.target.closest('#modal-add')) {
    modal.close();
    await addToCart(modalItem.id, modalQty);
  }
});

document.querySelector('#modal-close').addEventListener('click', () => modal.close());

// Клик по тёмному фону (вне окна) закрывает окно
modal.addEventListener('click', (event) => {
  if (event.target === modal) modal.close();
});

// Закрылось (крестиком, фоном или Esc) — возвращаем прокрутку страницы
modal.addEventListener('close', () => {
  if (!nav.classList.contains('open') && !cartPanel.classList.contains('open')) {
    document.body.classList.remove('no-scroll');
  }
});

// ---------- 8. Форма обратной связи (POST /api/feedback) ----------
const feedbackForm = document.querySelector('#feedback-form');
const feedbackError = document.querySelector('#feedback-error');
const feedbackSubmit = document.querySelector('#feedback-submit');

feedbackForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  feedbackError.hidden = true;

  if (!feedbackForm.checkValidity()) {
    feedbackForm.reportValidity();   // браузер подсветит неверное поле
    return;
  }

  feedbackSubmit.disabled = true;
  feedbackSubmit.textContent = t('feedback.sending');

  try {
    // поля формы: name, email, message и скрытое website (ловушка для ботов)
    const data = Object.fromEntries(new FormData(feedbackForm));
    await api.post('/feedback', data);
    feedbackForm.reset();
    showToast(t('feedback.ok'));
  } catch (error) {
    let text = t('feedback.fail');
    if (error.status === 422) text = t('feedback.fill');
    if (error.status === 429) text = t('feedback.many');
    feedbackError.textContent = text;
    feedbackError.hidden = false;
  } finally {
    feedbackSubmit.disabled = false;
    feedbackSubmit.textContent = t('feedback.send');
  }
});

// ---------- 9. Мобильное меню, шапка, "Наверх" ----------
function syncBurgerLabel() {
  burger.setAttribute('aria-label', t(nav.classList.contains('open') ? 'burger.close' : 'burger.open'));
}

function setMobileMenu(isOpen) {
  nav.classList.toggle('open', isOpen);
  burger.classList.toggle('open', isOpen);
  document.body.classList.toggle('no-scroll', isOpen);
  syncBurgerLabel();
}

burger.addEventListener('click', () => setMobileMenu(!nav.classList.contains('open')));

// После клика по пункту меню — закрываем его
nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setMobileMenu(false));
});

// Esc закрывает мобильное меню и корзину (модальное окно закрывается само)
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (nav.classList.contains('open')) setMobileMenu(false);
  if (cartPanel.classList.contains('open')) closeCart();
});

function onScroll() {
  header.classList.toggle('scrolled', window.scrollY > 40);          // фон шапки
  toTopButton.classList.toggle('visible', window.scrollY > 600);     // кнопка "Наверх"
}
window.addEventListener('scroll', onScroll);

toTopButton.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ---------- 10. Запуск ----------
async function init() {
  document.querySelector('#year').textContent = new Date().getFullYear();

  let loaded = true;
  try {
    // Сначала сессия (создаёт cookie), потом остальное параллельно
    const session = await api.get('/session');
    currentLang = session.lang;

    const results = await Promise.all([api.get('/menu'), api.get('/cart')]);
    menuItems = results[0].items;
    cart = results[1];
  } catch (error) {
    loaded = false;
  }

  translatePage();
  syncBurgerLabel();

  if (loaded) {
    renderAll(true);   // true — карточки меню появляются с анимацией
    startAutoplay();
  } else {
    menuGrid.innerHTML = `<p class="menu-grid__message">${t('menu.error')}</p>`;
  }

  observeReveals(document);
  onScroll();
}

init();
