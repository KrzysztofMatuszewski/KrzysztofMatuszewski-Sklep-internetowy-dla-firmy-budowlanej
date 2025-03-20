// static/js/main.js

document.addEventListener('DOMContentLoaded', function() {
    // Obsługa menu mobilnego
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('nav');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            nav.classList.toggle('active');
            mobileMenuBtn.querySelector('i').classList.toggle('fa-bars');
            mobileMenuBtn.querySelector('i').classList.toggle('fa-times');
        });
    }
    
    // Obsługa przycisku dodaj do koszyka
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            let quantity = 1;
            
            // Jeśli jest pole ilości, pobieramy wartość
            const quantityInput = document.getElementById('product-quantity');
            if (quantityInput) {
                quantity = parseInt(quantityInput.value);
            }
            
            // Symulacja dodania do koszyka
            console.log(`Dodano produkt ID: ${productId}, ilość: ${quantity} do koszyka`);
            
            // Zaktualizuj licznik koszyka
            const cartCount = document.querySelector('.cart-count');
            if (cartCount) {
                cartCount.textContent = parseInt(cartCount.textContent) + quantity;
            }
            
            // Pokaż komunikat
            showNotification('Produkt dodany do koszyka', 'success');
        });
    });
    
    // Obsługa przycisku dodaj do ulubionych
    const addToWishlistButtons = document.querySelectorAll('.add-to-wishlist');
    addToWishlistButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            
            // Symulacja dodania do ulubionych
            console.log(`Dodano produkt ID: ${productId} do ulubionych`);
            
            // Zmiana ikony serca
            const heartIcon = this.querySelector('i');
            heartIcon.classList.toggle('far');
            heartIcon.classList.toggle('fas');
            
            // Pokaż komunikat
            showNotification('Produkt dodany do ulubionych', 'success');
        });
    });
    
    // Obsługa zdjęć produktu (miniatury)
    const productThumbnails = document.querySelectorAll('.product-thumbnail');
    const mainProductImage = document.getElementById('main-product-image');
    
    if (productThumbnails.length > 0 && mainProductImage) {
        productThumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', function() {
                // Usuń klasę active ze wszystkich miniatur
                productThumbnails.forEach(item => item.classList.remove('active'));
                
                // Dodaj klasę active do klikniętej miniatury
                this.classList.add('active');
                
                // Zaktualizuj główne zdjęcie
                const imageUrl = this.getAttribute('data-image');
                mainProductImage.src = imageUrl;
            });
        });
    }
    
    // Obsługa przycisków ilości
    const decreaseBtn = document.querySelector('.quantity-btn.decrease');
    const increaseBtn = document.querySelector('.quantity-btn.increase');
    const quantityInput = document.getElementById('product-quantity');
    
    if (decreaseBtn && increaseBtn && quantityInput) {
        decreaseBtn.addEventListener('click', function() {
            let value = parseInt(quantityInput.value);
            if (value > 1) {
                quantityInput.value = value - 1;
            }
        });
        
        increaseBtn.addEventListener('click', function() {
            let value = parseInt(quantityInput.value);
            let max = parseInt(quantityInput.getAttribute('max'));
            if (value < max) {
                quantityInput.value = value + 1;
            } else {
                showNotification('Osiągnięto maksymalną dostępną ilość', 'warning');
            }
        });
    }
    
    // Obsługa zakładek na stronie produktu
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    if (tabButtons.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Usuń klasę active ze wszystkich przycisków
                tabButtons.forEach(btn => btn.classList.remove('active'));
                
                // Dodaj klasę active do klikniętego przycisku
                this.classList.add('active');
                
                // Pokaż odpowiednią zakładkę
                const tabId = this.getAttribute('data-tab');
                tabPanes.forEach(pane => {
                    pane.classList.remove('active');
                    if (pane.id === tabId) {
                        pane.classList.add('active');
                    }
                });
            });
        });
    }
    
    // Obsługa filtrów w kategorii
    const filterApplyBtn = document.querySelector('.filter-apply-btn');
    const filterClearBtn = document.querySelector('.filter-clear-btn');
    
    if (filterApplyBtn) {
        filterApplyBtn.addEventListener('click', function() {
            // Symulacja filtrowania
            showNotification('Filtry zostały zastosowane', 'success');
        });
    }
    
    if (filterClearBtn) {
        filterClearBtn.addEventListener('click', function() {
            // Wyczyść wszystkie checkboxy
            document.querySelectorAll('.sidebar-filter input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = false;
            });
            
            // Wyczyść pola ceny
            const priceMin = document.getElementById('price_min');
            const priceMax = document.getElementById('price_max');
            if (priceMin) priceMin.value = '';
            if (priceMax) priceMax.value = '';
            
            // Symulacja wyczyszczenia filtrów
            showNotification('Filtry zostały wyczyszczone', 'info');
        });
    }
    
    // Funkcja do wyświetlania powiadomień
    function showNotification(message, type = 'info') {
        // Sprawdź, czy kontener powiadomień istnieje, jeśli nie, utwórz go
        let notificationsContainer = document.getElementById('notifications-container');
        if (!notificationsContainer) {
            notificationsContainer = document.createElement('div');
            notificationsContainer.id = 'notifications-container';
            document.body.appendChild(notificationsContainer);
        }
        
        // Utwórz powiadomienie
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="notification-icon fas ${getIconForType(type)}"></i>
                <p>${message}</p>
            </div>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        // Dodaj powiadomienie do kontenera
        notificationsContainer.appendChild(notification);
        
        // Obsługa przycisku zamknięcia
        const closeButton = notification.querySelector('.notification-close');
        closeButton.addEventListener('click', function() {
            notification.classList.add('hiding');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
        
        // Automatyczne zamknięcie po 5 sekundach
        setTimeout(() => {
            notification.classList.add('hiding');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }
    
    // Funkcja pomocnicza do wybierania ikony na podstawie typu powiadomienia
    function getIconForType(type) {
        switch (type) {
            case 'success':
                return 'fa-check-circle';
            case 'warning':
                return 'fa-exclamation-triangle';
            case 'error':
                return 'fa-times-circle';
            case 'info':
            default:
                return 'fa-info-circle';
        }
    }
    
    // Obsługa formularza newslettera
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value;
            
            if (email) {
                // Symulacja zapisania do newslettera
                console.log(`Zapisano adres ${email} do newslettera`);
                showNotification('Dziękujemy za zapisanie się do newslettera!', 'success');
                emailInput.value = '';
            }
        });
    }
});