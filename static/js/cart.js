// Zaktualizowany plik cart.js dla współpracy z tabelami orders i orderItems

let activeNotificationsCount = 0;
const MAX_NOTIFICATIONS = 5;

document.addEventListener('DOMContentLoaded', function() {
    // Obsługa przycisków zmiany ilości w koszyku
    const decreaseButtons = document.querySelectorAll('.quantity-btn.decrease');
    const increaseButtons = document.querySelectorAll('.quantity-btn.increase');
    const quantityInputs = document.querySelectorAll('.product-quantity');
    const removeButtons = document.querySelectorAll('.remove-from-cart');
    
    // Funkcja do aktualizacji ilości produktu w koszyku
    function updateQuantity(productId, newQuantity) {
        fetch('/update_cart_quantity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({
                product_id: productId,
                quantity: newQuantity
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Aktualizacja pola ilości
                const quantityInput = document.querySelector(`.product-quantity[data-product-id="${productId}"]`);
                if (quantityInput) {
                    quantityInput.value = data.quantity;
                }
                
                // Aktualizacja ceny całkowitej
                const totalPriceElement = document.querySelector(`.cart-item[data-product-id="${productId}"] .total-price`);
                if (totalPriceElement) {
                    totalPriceElement.textContent = `${data.total_price.toFixed(2)} zł`;
                }
                
                // Aktualizacja ceny jednostkowej (jeśli ilość > 1)
                const unitPriceContainer = document.querySelector(`.cart-item[data-product-id="${productId}"] .unit-price`);
                if (data.quantity > 1) {
                    if (unitPriceContainer) {
                        unitPriceContainer.textContent = `(${data.unit_price.toFixed(2)} zł/szt.)`;
                    } else {
                        // Jeśli kontener nie istnieje, utwórz go
                        const totalCell = document.querySelector(`.cart-item[data-product-id="${productId}"] .cart-total`);
                        if (totalCell) {
                            const unitPriceDiv = document.createElement('div');
                            unitPriceDiv.className = 'unit-price';
                            unitPriceDiv.textContent = `(${data.unit_price.toFixed(2)} zł/szt.)`;
                            totalCell.appendChild(unitPriceDiv);
                        }
                    }
                } else if (unitPriceContainer) {
                    // Usuń cenę jednostkową, jeśli ilość = 1
                    unitPriceContainer.remove();
                }
                
                // Aktualizacja podsumowania koszyka
                updateCartSummary();
                
                // Aktualizacja licznika koszyka w nagłówku
                updateCartCounters(data.cart_count, data.total_items);
                
                // Pokaż komunikat o sukcesie
                showNotification(data.message, 'success');
            } else {
                // Pokaż komunikat o błędzie
                showNotification(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Błąd aktualizacji koszyka:', error);
            showNotification('Wystąpił błąd podczas aktualizacji koszyka', 'error');
        });
    }

    // Funkcja do aktualizacji liczników koszyka w nagłówku
    function updateCartCounters(count, totalItems) {
        // Aktualizuj licznik w koszyku w nagłówku
        const cartCountElements = document.querySelectorAll('.cart-count');
        cartCountElements.forEach(element => {
            element.textContent = count;
        });
    }
    
    // Obsługa przycisku zmniejszania ilości
    decreaseButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-product-id'));
            const quantityInput = document.querySelector(`.product-quantity[data-product-id="${productId}"]`);
            let currentQuantity = parseInt(quantityInput.value);
            
            if (currentQuantity > 1) {
                updateQuantity(productId, currentQuantity - 1);
            }
        });
    });
    
    // Obsługa przycisku zwiększania ilości
    increaseButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-product-id'));
            const quantityInput = document.querySelector(`.product-quantity[data-product-id="${productId}"]`);
            let currentQuantity = parseInt(quantityInput.value);
            let maxQuantity = parseInt(quantityInput.getAttribute('max'));
            
            if (currentQuantity < maxQuantity) {
                updateQuantity(productId, currentQuantity + 1);
            } else {
                showNotification('Nie ma więcej sztuk na stanie', 'warning');
            }
        });
    });
    
    // Obsługa ręcznej zmiany ilości
    quantityInputs.forEach(input => {
        input.addEventListener('change', function() {
            const productId = parseInt(this.getAttribute('data-product-id'));
            let newQuantity = parseInt(this.value);
            let maxQuantity = parseInt(this.getAttribute('max'));
            
            // Sprawdź poprawność wartości
            if (isNaN(newQuantity) || newQuantity < 1) {
                newQuantity = 1;
                this.value = 1;
                showNotification('Minimalna ilość produktu to 1', 'warning');
            } else if (newQuantity > maxQuantity) {
                newQuantity = maxQuantity;
                this.value = maxQuantity;
                showNotification(`Maksymalna dostępna ilość to ${maxQuantity}`, 'warning');
            }
            
            // Aktualizuj ilość w koszyku
            updateQuantity(productId, newQuantity);
        });
    });

    // Obsługa przycisków usuwania produktu z koszyka
    removeButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const productId = parseInt(this.getAttribute('data-product-id'));
            const form = this.closest('form');
            
            if (form) {
                e.preventDefault();
                
                fetch(form.action, {
                    method: 'POST',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Usuń wiersz tabeli z produktem
                        const productRow = document.querySelector(`.cart-item[data-product-id="${productId}"]`);
                        if (productRow) {
                            productRow.remove();
                        }
                        
                        // Aktualizacja licznika koszyka w nagłówku
                        updateCartCounters(data.cart_count, data.total_items);
                        
                        // Aktualizacja podsumowania koszyka
                        updateCartSummary();
                        
                        // Pokaż komunikat o sukcesie
                        showNotification(data.message, 'success');
                        
                        // Jeśli koszyk jest pusty, odśwież stronę
                        if (data.cart_count === 0) {
                            window.location.reload();
                        }
                    } else {
                        // Pokaż komunikat o błędzie
                        showNotification(data.message, 'error');
                    }
                })
                .catch(error => {
                    console.error('Błąd usuwania produktu z koszyka:', error);
                    showNotification('Wystąpił błąd podczas usuwania produktu z koszyka', 'error');
                });
            }
        });
    });
    
    // Funkcja do wyświetlania komunikatu o pustym koszyku
    function showEmptyCartMessage() {
        const cartContent = document.querySelector('.cart-content');
        if (cartContent) {
            cartContent.remove();
            
            const cartPage = document.querySelector('.cart-page .container');
            if (cartPage) {
                const emptyCartMessage = document.createElement('div');
                emptyCartMessage.className = 'cart-empty';
                emptyCartMessage.innerHTML = `
                    <div class="cart-empty-icon">
                        <i class="fas fa-shopping-cart"></i>
                    </div>
                    <h2>Twój koszyk jest pusty</h2>
                    <p>Dodaj produkty do koszyka, aby kontynuować zakupy</p>
                    <a href="/categories" class="btn btn-primary">Przeglądaj produkty</a>
                `;
                
                // Wstaw po nagłówku i komunikatach
                const flashMessages = document.querySelector('.flash-messages');
                if (flashMessages) {
                    flashMessages.after(emptyCartMessage);
                } else {
                    const heading = document.querySelector('.cart-page .container h1');
                    if (heading) {
                        heading.after(emptyCartMessage);
                    } else {
                        cartPage.appendChild(emptyCartMessage);
                    }
                }
            }
        }
    }
    
    // Funkcja do aktualizacji podsumowania koszyka
    function updateCartSummary() {
        // Sprawdź czy jakiekolwiek produkty są w koszyku
        const cartItems = document.querySelectorAll('.cart-item');
        if (cartItems.length === 0) {
            showEmptyCartMessage();
            return;
        }
        
        // Oblicz sumę zamówienia
        let cartTotal = 0;
        cartItems.forEach(item => {
            const totalPriceText = item.querySelector('.total-price').textContent;
            const totalPrice = parseFloat(totalPriceText.replace(' zł', ''));
            cartTotal += totalPrice;
        });
        
        // Aktualizuj wartość produktów
        const cartSubtotalElement = document.querySelector('.cart-subtotal');
        if (cartSubtotalElement) {
            cartSubtotalElement.textContent = `${cartTotal.toFixed(2)} zł`;
        }
        
        // Koszt dostawy
        const shippingCostElement = document.querySelector('.cart-shipping');
        let shippingCost = 0;
        if (shippingCostElement) {
            shippingCost = cartTotal < 200 && cartTotal > 0 ? 15 : 0;
            shippingCostElement.textContent = `${shippingCost.toFixed(2)} zł`;
        }
        
        // Suma całkowita
        const totalWithShippingElement = document.querySelector('.cart-total-price');
        if (totalWithShippingElement) {
            const totalWithShipping = cartTotal + shippingCost;
            totalWithShippingElement.textContent = `${totalWithShipping.toFixed(2)} zł`;
        }
    }
    
    // Funkcja do wyświetlania powiadomień
    function showNotification(message, type = 'info') {
        // Jeśli jest już maksymalna liczba powiadomień, usuń najstarsze
        if (activeNotificationsCount >= MAX_NOTIFICATIONS) {
            const notifications = document.querySelectorAll('#notifications-container .notification');
            if (notifications.length > 0) {
                notifications[0].remove();
                activeNotificationsCount--;
            }
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
        
        // Zwiększ licznik aktywnych powiadomień
        activeNotificationsCount++;
        
        // Dodaj powiadomienie do kontenera
        notificationsContainer.appendChild(notification);
        
        // Obsługa przycisku zamknięcia
        const closeButton = notification.querySelector('.notification-close');
        closeButton.addEventListener('click', function() {
            notification.classList.add('hiding');
            setTimeout(() => {
                notification.remove();
                activeNotificationsCount--;
            }, 300);
        });
        
        // Automatyczne zamknięcie po 5 sekundach
        setTimeout(() => {
            notification.classList.add('hiding');
            setTimeout(() => {
                notification.remove();
                activeNotificationsCount--;
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
});