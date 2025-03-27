// static/js/payment.js
document.addEventListener('DOMContentLoaded', function() {
    // Formatowanie numeru karty - dodawanie spacji po każdych 4 cyfrach
    const cardNumberInput = document.getElementById('card_number');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            // Usuń wszystkie znaki niebędące cyframi
            let value = this.value.replace(/\D/g, '');
            
            // Dodaj spacje po każdych 4 cyfrach
            if (value.length > 0) {
                value = value.match(/.{1,4}/g).join(' ');
            }
            
            // Maksymalnie 19 znaków (16 cyfr + 3 spacje)
            if (value.length > 19) {
                value = value.substr(0, 19);
            }
            
            this.value = value;
        });
    }
    
    // Formatowanie daty ważności - dodawanie slash po 2 cyfrach
    const expiryDateInput = document.getElementById('expiry_date');
    if (expiryDateInput) {
        expiryDateInput.addEventListener('input', function(e) {
            // Usuń wszystkie znaki niebędące cyframi
            let value = this.value.replace(/\D/g, '');
            
            // Dodaj slash po pierwszych 2 cyfrach
            if (value.length > 2) {
                value = value.substr(0, 2) + '/' + value.substr(2);
            }
            
            // Maksymalnie 5 znaków (MM/YY)
            if (value.length > 5) {
                value = value.substr(0, 5);
            }
            
            this.value = value;
        });
    }
    
    // Formatowanie CVV - tylko cyfry, max 3 cyfry
    const cvvInput = document.getElementById('cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            // Usuń wszystkie znaki niebędące cyframi
            let value = this.value.replace(/\D/g, '');
            
            // Maksymalnie 3 cyfry
            if (value.length > 3) {
                value = value.substr(0, 3);
            }
            
            this.value = value;
        });
    }
    
    // Formatowanie numeru telefonu w checkout
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            // Usuń wszystkie znaki niebędące cyframi
            let value = this.value.replace(/\D/g, '');
            
            // Formatowanie 123-456-789
            if (value.length > 6) {
                value = value.substr(0, 3) + '-' + value.substr(3, 3) + '-' + value.substr(6);
            } else if (value.length > 3) {
                value = value.substr(0, 3) + '-' + value.substr(3);
            }
            
            // Maksymalnie 11 znaków (9 cyfr + 2 myślniki)
            if (value.length > 11) {
                value = value.substr(0, 11);
            }
            
            this.value = value;
        });
    }
    
    // Formatowanie kodu pocztowego w checkout
    const postalCodeInput = document.getElementById('postal_code');
    if (postalCodeInput) {
        postalCodeInput.addEventListener('input', function(e) {
            // Usuń wszystkie znaki niebędące cyframi
            let value = this.value.replace(/\D/g, '');
            
            // Dodaj myślnik po pierwszych 2 cyfrach
            if (value.length > 2) {
                value = value.substr(0, 2) + '-' + value.substr(2);
            }
            
            // Maksymalnie 6 znaków (XX-XXX)
            if (value.length > 6) {
                value = value.substr(0, 6);
            }
            
            this.value = value;
        });
    }
});