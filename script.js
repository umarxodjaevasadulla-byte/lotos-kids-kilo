// Глобальные переменные
let currentLang = 'ru';
let products = [];

// Переводы интерфейса
const translations = {
    ru: {
        title: 'Детская одежда',
        all: 'Все',
        suits: 'Костюмы',
        dresses: 'Платья',
        tshirts: 'Футболки',
        shorts: 'Шорты',
        jackets: 'Куртки',
        order: 'Заказать',
        price: 'сум',
        sizes: 'Размеры',
        empty: 'Товары не найдены'
    },
    uz: {
        title: 'Bolalar kiyimlari',
        all: 'Hammasi',
        suits: 'Kostyumlar',
        dresses: "Ko'ylaklar",
        tshirts: 'Futbolkalar',
        shorts: 'Shortiklar',
        jackets: 'Kurtkalar',
        order: 'Buyurtma',
        price: 'so'm',
        sizes: "O'lchamlar",
        empty: 'Tovarlar topilmadi'
    }
};

// Загрузка товаров
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupEventListeners();
    setupMobileMenu();
});

// Загрузка товаров из JSON
async function loadProducts() {
    try {
        const response = await fetch('products.json');
        products = await response.json();
        renderProducts('all');
    } catch (error) {
        console.error('Ошибка загрузки товаров:', error);
        document.getElementById('productsGrid').innerHTML = '<p>Ошибка загрузки товаров</p>';
    }
}

// Отображение товаров
function renderProducts(category) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';

    const filtered = category === 'all' 
        ? products 
        : products.filter(p => p.category === category);

    if (filtered.length === 0) {
        grid.innerHTML = `<p class="empty-message">${translations[currentLang].empty}</p>`;
        return;
    }

    filtered.forEach(product => {
        const card = createProductCard(product);
        grid.appendChild(card);
    });
}

// Создание карточки товара
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';

    const name = currentLang === 'ru' ? product.name_ru : product.name_uz;
    const description = currentLang === 'ru' ? product.description_ru : product.description_uz;
    const sizes = product.sizes.map(size => `<span class="size-tag">${size}</span>`).join('');

    card.innerHTML = `
        <img src="${product.image}" alt="${name}" class="product-image" onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
        <div class="product-info">
            <h3 class="product-name">${name}</h3>
            <div class="product-price">${product.price.toLocaleString()} ${translations[currentLang].price}</div>
            <p class="product-description">${description}</p>
            <div class="product-sizes">
                <small>${translations[currentLang].sizes}:</small><br>
                ${sizes}
            </div>
            <a href="https://t.me/your_bot_username?text=Заказ: ${encodeURIComponent(name)} - ${product.price} сум" 
               class="product-btn telegram-btn" target="_blank">
                📱 ${translations[currentLang].order}
            </a>
        </div>
    `;

    return card;
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Переключение языка
    document.getElementById('lang-ru').addEventListener('click', () => switchLanguage('ru'));
    document.getElementById('lang-uz').addEventListener('click', () => switchLanguage('uz'));

    // Фильтры категорий
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderProducts(this.dataset.category);
        });
    });
}

// Переключение языка
function switchLanguage(lang) {
    currentLang = lang;

    // Обновление кнопок
    document.getElementById('lang-ru').classList.toggle('active', lang === 'ru');
    document.getElementById('lang-uz').classList.toggle('active', lang === 'uz');

    // Обновление всех элементов с data-атрибутами
    document.querySelectorAll('[data-ru]').forEach(el => {
        el.textContent = el.getAttribute(`data-${lang}`);
    });

    // Обновление категорий
    document.querySelectorAll('.category-btn').forEach(btn => {
        const category = btn.dataset.category;
        if (translations[lang][category]) {
            btn.textContent = translations[lang][category];
        }
    });

    // Перерисовка товаров
    const activeCategory = document.querySelector('.category-btn.active').dataset.category;
    renderProducts(activeCategory);
}

// Мобильное меню
function setupMobileMenu() {
    const menuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    menuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
    });

    // Закрытие при клике на ссылку
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
        });
    });
}

// Плавная прокрутка
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
