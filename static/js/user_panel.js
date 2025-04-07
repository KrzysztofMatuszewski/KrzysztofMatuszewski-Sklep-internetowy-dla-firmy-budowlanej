// static/js/user_panel.js

document.addEventListener('DOMContentLoaded', function() {
    // Obsługa mobilnego menu w panelu użytkownika
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            const nav = document.querySelector('header nav');
            nav.classList.toggle('show');
        });
    }
    
    // Obsługa licznika produktów w koszyku
    function updateCartCount() {
        fetch('/get_cart_count')
            .then(response => response.json())
            .then(data => {
                const cartCountElements = document.querySelectorAll('.cart-count');
                cartCountElements.forEach(element => {
                    element.textContent = data.total_items || 0;
                    
                    // Ukryj licznik jeśli koszyk jest pusty
                    if (data.total_items > 0) {
                        element.style.display = 'flex';
                    } else {
                        element.style.display = 'none';
                    }
                });
            })
            .catch(error => console.error('Błąd pobierania licznika koszyka:', error));
    }
    
    // Aktualizuj licznik przy ładowaniu strony
    updateCartCount();
    
    // Obsługa formularzy dodawania do koszyka
    const addToCartForms = document.querySelectorAll('form[action*="add_to_cart"]');
    
    addToCartForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const url = this.getAttribute('action');
            
            fetch(url, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Aktualizuj licznik koszyka
                    updateCartCount();
                    
                    // Pokaż powiadomienie o sukcesie
                    showNotification(data.message, 'success');
                } else {
                    // Pokaż powiadomienie o błędzie
                    showNotification(data.message, 'error');
                }
            })
            .catch(error => {
                console.error('Błąd podczas dodawania do koszyka:', error);
                showNotification('Wystąpił błąd podczas dodawania produktu do koszyka', 'error');
            });
        });
    });
    
    // Funkcja do wyświetlania powiadomień
    function showNotification(message, type = 'success') {
        // Sprawdź czy kontener powiadomień istnieje, jeśli nie - utwórz go
        let notificationContainer = document.querySelector('.notification-container');
        
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.className = 'notification-container';
            document.body.appendChild(notificationContainer);
        }
        
        // Utwórz nowe powiadomienie
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        // Dodaj ikonę w zależności od typu
        let icon = '';
        if (type === 'success') {
            icon = '<i class="fas fa-check-circle"></i>';
        } else if (type === 'error') {
            icon = '<i class="fas fa-exclamation-circle"></i>';
        }
        
        // Dodaj treść powiadomienia
        notification.innerHTML = `
            ${icon}
            <span>${message}</span>
            <button class="close-notification"><i class="fas fa-times"></i></button>
        `;
        
        // Dodaj powiadomienie do kontenera
        notificationContainer.appendChild(notification);
        
        // Obsługa przycisku zamknięcia
        const closeButton = notification.querySelector('.close-notification');
        closeButton.addEventListener('click', function() {
            notification.classList.add('hide');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
        
        // Automatycznie ukryj powiadomienie po 5 sekundach
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 5000);
    }
    
    // Walidacja formularza profilu
    const profileForm = document.querySelector('.profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            const currentPassword = document.getElementById('current_password');
            const newPassword = document.getElementById('new_password');
            const confirmPassword = document.getElementById('confirm_password');
            
            // Sprawdź czy hasła się zgadzają
            if (newPassword.value && newPassword.value !== confirmPassword.value) {
                e.preventDefault();
                showNotification('Nowe hasło i potwierdzenie nie są zgodne', 'error');
                return false;
            }
            
            // Sprawdź czy podano aktualne hasło przy zmianie hasła
            if ((newPassword.value || confirmPassword.value) && !currentPassword.value) {
                e.preventDefault();
                showNotification('Musisz podać aktualne hasło, aby zmienić hasło', 'error');
                return false;
            }
        });
    }
    
    // Dodaj style CSS dla powiadomień
    const style = document.createElement('style');
    style.textContent = `
        .notification-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        
        .notification {
            background-color: #fff;
            border-radius: 6px;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
            padding: 15px;
            display: flex;
            align-items: center;
            min-width: 300px;
            max-width: 400px;
            transition: opacity 0.3s ease, transform 0.3s ease;
            animation: slideIn 0.3s ease;
        }
        
        .notification.success {
            border-left: 4px solid #2ecc71;
        }
        
        .notification.error {
            border-left: 4px solid #e74c3c;
        }
        
        .notification i:first-child {
            margin-right: 10px;
            font-size: 20px;
        }
        
        .notification.success i:first-child {
            color: #2ecc71;
        }
        
        .notification.error i:first-child {
            color: #e74c3c;
        }
        
        .notification span {
            flex-grow: 1;
        }
        
        .notification .close-notification {
            background: none;
            border: none;
            cursor: pointer;
            color: #777;
            padding: 5px;
        }
        
        .notification.hide {
            opacity: 0;
            transform: translateX(100%);
        }
        
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
    `;
    
    document.head.appendChild(style);
});