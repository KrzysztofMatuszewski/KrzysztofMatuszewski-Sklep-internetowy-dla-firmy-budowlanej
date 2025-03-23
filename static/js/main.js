document.addEventListener('DOMContentLoaded', function() {
    // Obsługa menu mobilnego
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('nav');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            nav.classList.toggle('active');
        });
    }
    
    // Inicjalizacja licznika koszyka
    function updateCartCount() {
        const cartCountElements = document.querySelectorAll('.cart-count');
        if (cartCountElements.length === 0) return;
        
        // Pobierz aktualną zawartość koszyka
        fetch('/get_cart_count', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => {
            // Aktualizuj licznik w koszyku
            cartCountElements.forEach(element => {
                element.textContent = data.count;
            });
        })
        .catch(error => {
            console.error('Błąd pobierania liczby produktów w koszyku:', error);
        });
    }
    
    // Wywołaj aktualizację licznika przy ładowaniu strony
    updateCartCount();
    
    // Obsługa formularzy dodawania do koszyka używając AJAX
    const addToCartForms = document.querySelectorAll('form[action^="/add_to_cart/"]');
    
    addToCartForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Pobierz dane formularza
            const formData = new FormData(this);
            const actionUrl = this.getAttribute('action');
            
            // Wykonaj żądanie AJAX
            fetch(actionUrl, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Aktualizuj licznik koszyka w nagłówku
                    updateCartCounters(data.cart_count, data.total_items);
                    
                    // Sprawdź, czy dodanie do koszyka było z kategorii (przekieruj do koszyka)
                    if (window.location.pathname.includes('/category/')) {
                        window.location.href = '/cart';
                        return;
                    }
                    
                    // Pokaż powiadomienie o sukcesie
                    showNotification(data.message, 'success');
                } else {
                    // Pokaż powiadomienie o błędzie
                    showNotification(data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Błąd dodawania do koszyka:', error);
                showNotification('Wystąpił błąd podczas dodawania produktu do koszyka', 'error');
            });
        });
    });
    
    // Funkcja do aktualizacji liczników koszyka w nagłówku
    function updateCartCounters(count, totalItems) {
        // Aktualizuj licznik w koszyku w nagłówku
        const cartCountElements = document.querySelectorAll('.cart-count');
        cartCountElements.forEach(element => {
            element.textContent = count;
        });
    }
    
    // Globalny licznik aktywnych powiadomień
    let activeNotificationsCount = 0;
    const MAX_NOTIFICATIONS = 5;
    
    // Funkcja do wyświetlania powiadomień
    function showNotification(message, type = 'info') {
        // Jeśli jest już maksymalna liczba powiadomień, usuń najstarsze
        const notifications = document.querySelectorAll('#notifications-container .notification');
        if (notifications.length >= MAX_NOTIFICATIONS) {
            notifications[0].remove();
        }
        
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
    
    // Obsługa miniatur produktu
    const productThumbnails = document.querySelectorAll('.product-thumbnail');
    const mainProductImage = document.getElementById('main-product-image');
    
    if (productThumbnails.length > 0 && mainProductImage) {
        productThumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', function() {
                // Pobierz URL obrazu
                const imageUrl = this.getAttribute('data-image');
                
                // Zaktualizuj główny obraz
                mainProductImage.src = imageUrl;
                
                // Zaktualizuj aktywną miniaturę
                productThumbnails.forEach(thumb => {
                    thumb.classList.remove('active');
                });
                this.classList.add('active');
            });
        });
    }
    
    // Obsługa zakładek na stronie produktu
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    if (tabButtons.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Pobierz ID zakładki do pokazania
                const tabId = this.getAttribute('data-tab');
                
                // Zaktualizuj aktywny przycisk
                tabButtons.forEach(btn => {
                    btn.classList.remove('active');
                });
                this.classList.add('active');
                
                // Zaktualizuj aktywną zakładkę
                tabPanes.forEach(pane => {
                    pane.classList.remove('active');
                });
                document.getElementById(tabId).classList.add('active');
            });
        });
    }
    
    // NOWE: Obsługa przycisków zmiany ilości na stronie produktu
    const productQuantityInput = document.getElementById('product-quantity');
    const decreaseBtn = document.querySelector('.product-actions .quantity-btn.decrease');
    const increaseBtn = document.querySelector('.product-actions .quantity-btn.increase');
    
    if (productQuantityInput && decreaseBtn && increaseBtn) {
        decreaseBtn.addEventListener('click', function() {
            let currentVal = parseInt(productQuantityInput.value);
            if (!isNaN(currentVal) && currentVal > 1) {
                productQuantityInput.value = currentVal - 1;
            }
        });
        
        increaseBtn.addEventListener('click', function() {
            let currentVal = parseInt(productQuantityInput.value);
            let maxVal = parseInt(productQuantityInput.getAttribute('max') || 99);
            if (!isNaN(currentVal) && currentVal < maxVal) {
                productQuantityInput.value = currentVal + 1;
            }
        });
    }
});