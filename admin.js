// Данные для входа
const ADMIN_USERNAME = 'Malika';
const ADMIN_PASSWORD = 'Malika91';

let products = [];
let editingId = null;

// Проверка авторизации при загрузке
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    setupEventListeners();
});

// Проверка авторизации
function checkAuth() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');

    if (isLoggedIn === 'true') {
        showAdminPanel();
        loadProducts();
    } else {
        showLoginForm();
    }
}

// Показать форму входа
function showLoginForm() {
    document.getElementById('loginSection').style.display = 'flex';
    document.getElementById('adminSection').style.display = 'none';
}

// Показать админ панель
function showAdminPanel() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('adminSection').style.display = 'block';
}

// Настройка обработчиков
function setupEventListeners() {
    // Форма входа
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            sessionStorage.setItem('adminLoggedIn', 'true');
            showAdminPanel();
            loadProducts();
        } else {
            document.getElementById('errorMsg').style.display = 'block';
        }
    });

    // Форма товара
    document.getElementById('productForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveProduct();
    });
}

// Выход
function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    showLoginForm();
}

// Загрузка товаров
async function loadProducts() {
    try {
        const response = await fetch('products.json');
        products = await response.json();
        renderAdminProducts();
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        alert('Ошибка загрузки товаров. Проверьте файл products.json');
    }
}

// Отображение товаров в админке
function renderAdminProducts() {
    const container = document.getElementById('adminProductsList');
    container.innerHTML = '';

    if (products.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">Нет товаров / Tovarlar yo'q</p>';
        return;
    }

    products.forEach(product => {
        const item = document.createElement('div');
        item.className = 'admin-product-card';
        item.innerHTML = `
            <img src="${product.image}" alt="${product.name_ru}" class="admin-product-img" onerror="this.src='https://via.placeholder.com/100?text=No+Image'">
            <div class="admin-product-info">
                <h3>${product.name_ru} / ${product.name_uz}</h3>
                <p>💰 ${product.price.toLocaleString()} сум | 📂 ${product.category} | 📏 ${product.sizes.join(', ')}</p>
                <p style="font-size: 0.8rem; color: ${product.inStock ? 'green' : 'red'};">
                    ${product.inStock ? '✅ В наличии' : '❌ Нет в наличии'}
                </p>
            </div>
            <div class="admin-actions">
                <button class="btn-edit" onclick="editProduct(${product.id})">✏️ Ред.</button>
                <button class="btn-delete" onclick="deleteProduct(${product.id})">🗑️ Уд.</button>
            </div>
        `;
        container.appendChild(item);
    });
}

// Сохранение товара
function saveProduct() {
    const productData = {
        id: editingId || Date.now(),
        name_ru: document.getElementById('nameRu').value,
        name_uz: document.getElementById('nameUz').value,
        price: parseInt(document.getElementById('price').value),
        category: document.getElementById('category').value,
        description_ru: document.getElementById('descRu').value,
        description_uz: document.getElementById('descUz').value,
        image: document.getElementById('imageUrl').value,
        sizes: document.getElementById('sizes').value.split(',').map(s => s.trim()),
        inStock: document.getElementById('inStock').checked
    };

    if (editingId) {
        // Редактирование
        const index = products.findIndex(p => p.id === editingId);
        if (index !== -1) {
            products[index] = productData;
        }
    } else {
        // Добавление
        products.push(productData);
    }

    // Сохранение в localStorage (временное решение для демо)
    localStorage.setItem('lotosProducts', JSON.stringify(products));

    // В реальном проекте здесь должен быть запрос к серверу
    // Но для GitHub Pages мы используем localStorage

    alert(editingId ? 'Товар обновлен! / Tovar yangilandi!' : 'Товар добавлен! / Tovar qo'shildi!');

    resetForm();
    renderAdminProducts();

    // Обновляем products.json для скачивания
    updateJsonFile();
}

// Редактирование товара
function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    editingId = id;

    document.getElementById('productId').value = id;
    document.getElementById('nameRu').value = product.name_ru;
    document.getElementById('nameUz').value = product.name_uz;
    document.getElementById('price').value = product.price;
    document.getElementById('category').value = product.category;
    document.getElementById('descRu').value = product.description_ru;
    document.getElementById('descUz').value = product.description_uz;
    document.getElementById('imageUrl').value = product.image;
    document.getElementById('sizes').value = product.sizes.join(', ');
    document.getElementById('inStock').checked = product.inStock;

    document.getElementById('formTitle').textContent = 'Редактировать / Tahrirlash';

    // Прокрутка к форме
    document.querySelector('.admin-form').scrollIntoView({ behavior: 'smooth' });
}

// Удаление товара
function deleteProduct(id) {
    if (!confirm('Удалить этот товар? / Bu tovarni o'chirish?')) return;

    products = products.filter(p => p.id !== id);
    localStorage.setItem('lotosProducts', JSON.stringify(products));

    renderAdminProducts();
    updateJsonFile();

    alert('Товар удален! / Tovar o'chirildi!');
}

// Сброс формы
function resetForm() {
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    editingId = null;
    document.getElementById('formTitle').textContent = 'Добавить товар / Tovar qo'shish';
    document.getElementById('inStock').checked = true;
}

// Обновление JSON файла для скачивания
function updateJsonFile() {
    const dataStr = JSON.stringify(products, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    // Создаем ссылку для скачивания
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'products.json';

    // Добавляем кнопку скачивания если её еще нет
    if (!document.getElementById('downloadBtn')) {
        const downloadBtn = document.createElement('button');
        downloadBtn.id = 'downloadBtn';
        downloadBtn.className = 'btn';
        downloadBtn.style.cssText = 'margin-top: 20px; width: 100%; background: #4ECDC4; color: white;';
        downloadBtn.innerHTML = '📥 Скачать products.json / products.json yuklash';
        downloadBtn.onclick = function() {
            link.click();
            alert('Скачайте этот файл и замените им старый products.json в репозитории!\n\nBu faylni yuklab oling va eski products.json faylni almashtiring!');
        };

        const adminProducts = document.querySelector('.admin-products');
        adminProducts.appendChild(downloadBtn);
    }
}

// Загрузка из localStorage при старте (если есть)
window.addEventListener('load', function() {
    const saved = localStorage.getItem('lotosProducts');
    if (saved) {
        const savedProducts = JSON.parse(saved);
        if (savedProducts.length > 0) {
            products = savedProducts;
            if (document.getElementById('adminProductsList')) {
                renderAdminProducts();
            }
        }
    }
});
