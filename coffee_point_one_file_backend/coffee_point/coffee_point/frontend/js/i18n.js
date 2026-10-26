/* js/i18n.js — тексты интерфейса на русском и английском.
   В HTML: data-i18n="ключ" — заменяет текст,
           data-i18n-attr="атрибут:ключ;атрибут:ключ" — заменяет атрибуты (alt, placeholder, aria-label).
   В строках можно использовать подстановки {name}, {n}. */

const translations = {
  ru: {
    'meta.title': 'Кофе Point — кофейня с характером',
    'brand.name': 'Кофе',
    'brand.full': 'Кофе Point',
    'nav.home': 'Главная',
    'nav.menu': 'Меню',
    'nav.about': 'О нас',
    'nav.contacts': 'Контакты',
    'cta.order': 'Заказать онлайн',
    'lang.aria': 'Сменить язык',
    'close': 'Закрыть',
    'toTop': 'Наверх',
    'burger.open': 'Открыть меню',
    'burger.close': 'Закрыть меню',

    'hero.label': 'Свежая обжарка каждую неделю',
    'hero.title': 'Идеальное утро начинается с правильного кофе',
    'hero.text': 'Мы сами выбираем зерно, обжариваем небольшими партиями и готовим каждую чашку с вниманием к деталям. Заходите на эспрессо по пути или оставайтесь на весь день.',
    'hero.menu': 'Смотреть меню',
    'hero.story': 'Наша история',
    'hero.alt': 'Чашка капучино на деревянном столе',

    'popular.title': 'Хиты недели',
    'popular.subtitle': 'Любимые позиции наших гостей',
    'slider.prev': 'Назад',
    'slider.next': 'Вперёд',
    'slider.dot': 'Слайд {n}',

    'menu.title': 'Наше меню',
    'menu.subtitle': 'Всё готовим в день заказа — из хороших ингредиентов.',
    'cat.coffee': 'Кофе',
    'cat.tea': 'Чай',
    'cat.bakery': 'Выпечка',
    'cat.dessert': 'Десерты',
    'search.placeholder': 'Найти кофе, десерт, круассан…',
    'search.label': 'Поиск по меню',
    'search.clear': 'Очистить поиск',
    'menu.empty': 'Ничего не нашлось. Попробуйте другой запрос.',
    'menu.error': 'Не удалось загрузить меню. Проверьте, что сервер запущен.',
    'card.add': 'В корзину',
    'card.details': 'Подробнее',

    'about.title': 'Место, где время идёт медленнее',
    'about.p1': '«Кофе Point» начался с маленькой кофемашины и большой любви к хорошему вкусу. Мы работаем напрямую с фермами Эфиопии, Колумбии и Бразилии.',
    'about.p2': 'Зерно обжариваем небольшими партиями — поэтому в чашке всегда яркий аромат и чистый вкус. А ещё у нас мягкий свет, тёплое дерево и музыка, под которую хочется остаться подольше.',
    'about.f1': '🌱 Прямые закупки у фермеров',
    'about.f2': '🔥 Своя обжарка',
    'about.f3': '🥐 Свежая выпечка каждое утро',
    'about.alt': 'Уютный интерьер кофейни',

    'feedback.title': 'Напишите нам',
    'feedback.subtitle': 'Забронировать столик, задать вопрос или оставить отзыв — мы ответим на почту.',
    'feedback.name': 'Ваше имя',
    'feedback.email': 'Электронная почта',
    'feedback.message': 'Сообщение',
    'feedback.send': 'Отправить',
    'feedback.sending': 'Отправляем…',
    'feedback.ok': 'Спасибо! Сообщение отправлено.',
    'feedback.fill': 'Проверьте поля: имя, email и сообщение (от 5 символов).',
    'feedback.many': 'Слишком много сообщений. Попробуйте через час.',
    'feedback.fail': 'Не удалось отправить. Попробуйте позже.',

    'footer.contacts': 'Контакты',
    'footer.address': 'ул. Чкалова, 12',
    'footer.hours': 'Часы работы',
    'footer.weekdays': 'Пн – Пт',
    'footer.weekend': 'Сб – Вс',
    'footer.map': 'Как нас найти',
    'footer.mapLink': 'Открыть на карте →',
    'footer.rights': 'Все права защищены.',

    'cart.open': 'Открыть корзину',
    'cart.title': 'Корзина',
    'cart.empty': 'В корзине пока пусто ☕',
    'cart.total': 'Итого',
    'cart.checkout': 'Оформить заказ',
    'cart.clear': 'Очистить корзину',
    'cart.less': 'Меньше',
    'cart.more': 'Больше',
    'toast.added': 'Добавлено в корзину: {name}',
    'toast.cleared': 'Корзина очищена',
    'toast.needItems': 'Сначала добавьте что-нибудь в корзину',
    'toast.error': 'Что-то пошло не так. Попробуйте ещё раз.',

    'modal.ingredients': 'Состав',
    'modal.size': 'Порция',
    'modal.kcal': 'Калорийность',
    'modal.kcalValue': '{n} ккал',
    'modal.add': 'Добавить в корзину',
    'unit.ml': 'мл',
    'unit.g': 'г',
    'unit.pcs': 'шт.',

    /* страница оплаты */
    'pay.title': 'Оплата заказа',
    'pay.badge': '🔒 Демо-оплата',
    'pay.back': '← Вернуться в кофейню',
    'pay.note': 'Учебный режим. Деньги не списываются. Не вводите реальные данные банковской карты.',
    'pay.order': 'Ваш заказ',
    'pay.toPay': 'К оплате',
    'pay.empty': 'Корзина пуста. Вернитесь в меню и добавьте товары.',
    'pay.items.one': 'товар',
    'pay.items.few': 'товара',
    'pay.items.many': 'товаров',
    'pay.formTitle': 'Данные для оплаты',
    'pay.name': 'Имя',
    'pay.namePlaceholder': 'Например, Алексей',
    'pay.email': 'Электронная почта',
    'pay.card': 'Номер карты',
    'pay.expiry': 'Срок действия',
    'pay.hint': 'Для демо подойдут вымышленные данные: 4242 4242 4242 4242, 12/30, 123.',
    'pay.submit': 'Подтвердить демо-заказ',
    'pay.processing': 'Обработка…',
    'pay.done': 'Демо-заказ оформлен!',
    'pay.doneText': 'Это учебная симуляция: оплата не производилась.',
    'pay.orderNumber': 'Номер заказа',
    'pay.home': 'Вернуться на главную',
    'pay.declined': 'Карта отклонена. Попробуйте другую.',
    'pay.invalid': 'Проверьте введённые данные.',
    'pay.fail': 'Ошибка оплаты. Попробуйте позже.'
  },

  en: {
    'meta.title': 'Coffee Point — a café with character',
    'brand.name': 'Coffee',
    'brand.full': 'Coffee Point',
    'nav.home': 'Home',
    'nav.menu': 'Menu',
    'nav.about': 'About us',
    'nav.contacts': 'Contacts',
    'cta.order': 'Order online',
    'lang.aria': 'Switch language',
    'close': 'Close',
    'toTop': 'Back to top',
    'burger.open': 'Open menu',
    'burger.close': 'Close menu',

    'hero.label': 'Freshly roasted every week',
    'hero.title': 'The perfect morning starts with the right coffee',
    'hero.text': 'We pick the beans ourselves, roast them in small batches and prepare every cup with care. Drop in for an espresso on your way, or stay all day.',
    'hero.menu': 'View the menu',
    'hero.story': 'Our story',
    'hero.alt': 'A cup of cappuccino on a wooden table',

    'popular.title': 'Weekly favourites',
    'popular.subtitle': 'What our guests love most',
    'slider.prev': 'Previous',
    'slider.next': 'Next',
    'slider.dot': 'Slide {n}',

    'menu.title': 'Our menu',
    'menu.subtitle': 'Everything is made fresh on the day — from good ingredients.',
    'cat.coffee': 'Coffee',
    'cat.tea': 'Tea',
    'cat.bakery': 'Bakery',
    'cat.dessert': 'Desserts',
    'search.placeholder': 'Search coffee, dessert, croissant…',
    'search.label': 'Search the menu',
    'search.clear': 'Clear search',
    'menu.empty': 'Nothing found. Try a different search.',
    'menu.error': 'Could not load the menu. Make sure the server is running.',
    'card.add': 'Add to cart',
    'card.details': 'Details',

    'about.title': 'A place where time slows down',
    'about.p1': 'Coffee Point began with one small espresso machine and a big love for good taste. We work directly with farms in Ethiopia, Colombia and Brazil.',
    'about.p2': 'We roast in small batches, so the cup always has a bright aroma and a clean flavour. Add soft light, warm wood and music you’ll want to linger over.',
    'about.f1': '🌱 Bought directly from farmers',
    'about.f2': '🔥 In-house roasting',
    'about.f3': '🥐 Fresh pastries every morning',
    'about.alt': 'Cosy café interior',

    'feedback.title': 'Write to us',
    'feedback.subtitle': 'Book a table, ask a question or leave a review — we will reply by email.',
    'feedback.name': 'Your name',
    'feedback.email': 'Email',
    'feedback.message': 'Message',
    'feedback.send': 'Send',
    'feedback.sending': 'Sending…',
    'feedback.ok': 'Thank you! Your message has been sent.',
    'feedback.fill': 'Please check the fields: name, email and a message (5+ characters).',
    'feedback.many': 'Too many messages. Please try again in an hour.',
    'feedback.fail': 'Could not send. Please try again later.',

    'footer.contacts': 'Contacts',
    'footer.address': '12 Coffee Street (sample address)',
    'footer.hours': 'Opening hours',
    'footer.weekdays': 'Mon – Fri',
    'footer.weekend': 'Sat – Sun',
    'footer.map': 'How to find us',
    'footer.mapLink': 'Open on the map →',
    'footer.rights': 'All rights reserved.',

    'cart.open': 'Open cart',
    'cart.title': 'Your cart',
    'cart.empty': 'Your cart is empty ☕',
    'cart.total': 'Total',
    'cart.checkout': 'Place order',
    'cart.clear': 'Clear cart',
    'cart.less': 'Less',
    'cart.more': 'More',
    'toast.added': 'Added to cart: {name}',
    'toast.cleared': 'Cart cleared',
    'toast.needItems': 'Add something to your cart first',
    'toast.error': 'Something went wrong. Please try again.',

    'modal.ingredients': 'Ingredients',
    'modal.size': 'Serving',
    'modal.kcal': 'Calories',
    'modal.kcalValue': '{n} kcal',
    'modal.add': 'Add to cart',
    'unit.ml': 'ml',
    'unit.g': 'g',
    'unit.pcs': 'pcs',

    'pay.title': 'Checkout',
    'pay.badge': '🔒 Demo payment',
    'pay.back': '← Back to the café',
    'pay.note': 'Demo mode. No money is charged. Do not enter real card details.',
    'pay.order': 'Your order',
    'pay.toPay': 'To pay',
    'pay.empty': 'Your cart is empty. Go back to the menu and add something.',
    'pay.items.one': 'item',
    'pay.items.few': 'items',
    'pay.items.many': 'items',
    'pay.formTitle': 'Payment details',
    'pay.name': 'Name',
    'pay.namePlaceholder': 'For example, Alex',
    'pay.email': 'Email',
    'pay.card': 'Card number',
    'pay.expiry': 'Expiry date',
    'pay.hint': 'Use fake data for the demo: 4242 4242 4242 4242, 12/30, 123.',
    'pay.submit': 'Confirm demo order',
    'pay.processing': 'Processing…',
    'pay.done': 'Demo order placed!',
    'pay.doneText': 'This is a simulation: no payment was made.',
    'pay.orderNumber': 'Order number',
    'pay.home': 'Back to the home page',
    'pay.declined': 'Card declined. Please try another one.',
    'pay.invalid': 'Please check the entered data.',
    'pay.fail': 'Payment error. Please try again later.'
  }
};

let currentLang = 'ru';

// Перевод по ключу: t('toast.added', { name: 'Латте' })
function t(key, vars) {
  let text = (translations[currentLang] && translations[currentLang][key]) || translations.ru[key] || key;
  if (vars) {
    for (const name in vars) {
      text = text.replace('{' + name + '}', vars[name]);
    }
  }
  return text;
}

// Значение вида { ru: '...', en: '...' } на текущем языке
function pick(obj) {
  return obj[currentLang] || obj.ru;
}

// Переводит всё, что помечено data-i18n и data-i18n-attr
function translatePage() {
  document.documentElement.lang = currentLang;
  document.title = t(document.body.dataset.titleKey || 'meta.title');

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });

  document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
    el.dataset.i18nAttr.split(';').forEach((pair) => {
      const [attr, key] = pair.split(':');
      el.setAttribute(attr.trim(), t(key.trim()));
    });
  });

  // Подсвечиваем активный язык в переключателе
  document.querySelectorAll('.lang [data-lang]').forEach((el) => {
    el.classList.toggle('active', el.dataset.lang === currentLang);
  });
}
