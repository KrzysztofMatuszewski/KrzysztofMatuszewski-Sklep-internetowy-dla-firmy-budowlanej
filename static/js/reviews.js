// static/js/reviews.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('Skrypt reviews.js załadowany');

    initReviewButtons();
    
    // Obsługa przycisku "Napisz opinię"
    const writeReviewBtn = document.getElementById('write-review-btn');
    if (writeReviewBtn) {
        writeReviewBtn.addEventListener('click', function() {
            console.log('Kliknięto przycisk "Napisz opinię"');
            openReviewModal();
        });
    }
    
    // Obsługa przycisków "Zmień opinię"
    const editReviewBtns = document.querySelectorAll('.edit-review-btn');
    editReviewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const reviewId = this.getAttribute('data-review-id');
            const currentRating = parseInt(this.getAttribute('data-review-rating'));
            const title = this.getAttribute('data-review-title') || '';
            const content = this.getAttribute('data-review-content') || '';
            
            console.log('Edycja opinii:', reviewId, currentRating);
            openReviewModal(reviewId, currentRating, title, content);
        });
    });
    
    // Obsługa przycisków "Usuń opinię"
    const deleteReviewBtns = document.querySelectorAll('.delete-review-btn');
    deleteReviewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const reviewId = this.getAttribute('data-review-id');
            const productId = this.getAttribute('data-product-id');
            
            if (confirm('Czy na pewno chcesz usunąć swoją opinię?')) {
                deleteReview(reviewId, productId);
            }
        });
    });
    
    // Kompletna funkcja openReviewModal z obsługą błędów
    function openReviewModal(reviewId = null, currentRating = 3, title = '', content = '') {
        console.log('Wywołano funkcję openReviewModal z parametrami:', { reviewId, currentRating, title });
        
        try {
            // Pobierz informacje o produkcie
            const productPage = document.querySelector('.product-page');
            if (!productPage) {
                console.error('Nie znaleziono elementu .product-page');
                return;
            }
            
            const productId = productPage.getAttribute('data-product-id');
            if (!productId) {
                console.error('Nie znaleziono atrybutu data-product-id');
                return;
            }
            
            const productNameElement = document.querySelector('.product-title');
            if (!productNameElement) {
                console.error('Nie znaleziono elementu .product-title');
                return;
            }
            
            const productName = productNameElement.textContent;
            console.log('Pobrano dane produktu:', { productId, productName });
            
            // Utwórz modal
            const modal = document.createElement('div');
            modal.className = 'review-modal';
            modal.innerHTML = `
                <div class="review-modal-content">
                    <span class="close-modal">&times;</span>
                    <h2>${reviewId ? 'Zmień swoją opinię' : 'Dodaj opinię'}</h2>
                    <p class="product-name">${productName}</p>
                    
                    <div class="rating-select">
                        <div class="stars">
                            <span class="star" data-rating="1"><i class="far fa-star"></i></span>
                            <span class="star" data-rating="2"><i class="far fa-star"></i></span>
                            <span class="star" data-rating="3"><i class="far fa-star"></i></span>
                            <span class="star" data-rating="4"><i class="far fa-star"></i></span>
                            <span class="star" data-rating="5"><i class="far fa-star"></i></span>
                        </div>
                        <div class="rating-slider-container">
                            <input type="range" min="1" max="5" value="${currentRating}" class="rating-slider" id="rating-slider">
                        </div>
                        <div class="rating-text">Wybierz ocenę</div>
                    </div>
                    
                    <div class="review-form">
                        <div class="form-group">
                            <label for="review-title">Tytuł recenzji</label>
                            <input type="text" id="review-title" value="${title}" placeholder="Np. Recenzja produktu 5/5">
                        </div>
                        
                        <div class="form-group">
                            <label for="review-content">Treść recenzji</label>
                            <textarea id="review-content" rows="4" placeholder="Opisz swoje wrażenia z produktu">${content}</textarea>
                        </div>
                    </div>
                    
                    <div class="review-buttons">
                        <button class="btn btn-secondary cancel-review">Anuluj</button>
                        <button type="button" class="btn btn-primary submit-review">
                            ${reviewId ? 'Modyfikuj' : 'Wystaw'}
                        </button>
                    </div>
                </div>
            `;
            
            // Dodaj modal do strony
            document.body.appendChild(modal);
            
            // Pokaż modal
            setTimeout(() => {
                modal.style.opacity = '1';
            }, 10);
            
            // Obsługa zamykania modalu
            const closeModal = () => {
                console.log('Zamykanie modalu');
                modal.style.opacity = '0';
                setTimeout(() => {
                    modal.remove();
                }, 300);
            };
            
            // Obsługa kliknięcia na przycisk zamknięcia
            const closeBtn = modal.querySelector('.close-modal');
            closeBtn.addEventListener('click', closeModal);
            
            // Obsługa kliknięcia na przycisk anuluj
            const cancelBtn = modal.querySelector('.cancel-review');
            cancelBtn.addEventListener('click', closeModal);
            
            // Aktualizacja wyglądu gwiazdek i tekstu oceny
            function updateStars(rating) {
                const ratingTexts = [
                    'Wybierz ocenę',
                    'Bardzo zły',
                    'Zły',
                    'Przeciętny',
                    'Dobry',
                    'Bardzo dobry'
                ];
                
                // Zaktualizuj tekst oceny
                modal.querySelector('.rating-text').textContent = ratingTexts[rating];
                
                // Zaktualizuj gwiazdki
                const stars = modal.querySelectorAll('.star');
                stars.forEach(star => {
                    const starRating = parseInt(star.getAttribute('data-rating'));
                    if (starRating <= rating) {
                        star.innerHTML = '<i class="fas fa-star"></i>';
                    } else {
                        star.innerHTML = '<i class="far fa-star"></i>';
                    }
                });
            }
            
            // Aktualizuj gwiazdki przy pierwszym otwarciu modalu
            updateStars(currentRating);
            
            // Obsługa slidera ocen
            const ratingSlider = modal.querySelector('.rating-slider');
            if (ratingSlider) {
                ratingSlider.addEventListener('input', function() {
                    const rating = parseInt(this.value);
                    updateStars(rating);
                });
            }
            
            // Obsługa przycisku "Wystaw" / "Modyfikuj"
            const submitBtn = modal.querySelector('.submit-review');
            if (submitBtn) {
                submitBtn.addEventListener('click', function(e) {
                    console.log('Kliknięto przycisk submit');
                    e.preventDefault(); // Zapobiegaj domyślnej akcji przycisku
                    
                    // Pobierz wybraną ocenę z slidera
                    const selectedRating = parseInt(modal.querySelector('.rating-slider').value);
                    
                    // Sprawdź czy wybrano ocenę
                    if (!selectedRating || selectedRating < 1 || selectedRating > 5) {
                        showNotification('Proszę wybrać ocenę od 1 do 5', 'warning');
                        return;
                    }
                    
                    // Zbierz dane z formularza
                    const title = document.getElementById('review-title').value.trim();
                    const content = document.getElementById('review-content').value.trim();
                    
                    // Dane opinii
                    const reviewData = {
                        rating: selectedRating,
                        title: title || `Recenzja produktu ${selectedRating}/5`,
                        content: content || ''
                    };
                    
                    console.log('Przygotowane dane recenzji:', reviewData);
                    
                    // Wyłącz przycisk na czas przetwarzania
                    submitBtn.disabled = true;
                    submitBtn.textContent = reviewId ? 'Aktualizowanie...' : 'Zapisywanie...';
                    
                    if (reviewId) {
                        // Aktualizacja istniejącej opinii
                        updateReview(reviewId, reviewData)
                            .then(data => {
                                if (data.success) {
                                    // Wyświetl komunikat o sukcesie
                                    showNotification(data.message, 'success');
                                    
                                    // Odśwież sekcję recenzji bez przeładowania całej strony
                                    refreshReviews(productId);
                                    
                                    // Zamknij modal
                                    closeModal();
                                }
                            })
                            .finally(() => {
                                submitBtn.disabled = false;
                                submitBtn.textContent = 'Modyfikuj';
                            });
                    } else {
                        // Dodanie nowej opinii
                        addReview(productId, reviewData)
                            .then(data => {
                                if (data.success) {
                                    // Wyświetl komunikat o sukcesie
                                    showNotification(data.message, 'success');
                                    
                                    // Odśwież sekcję recenzji bez przeładowania całej strony
                                    refreshReviews(productId);
                                    
                                    // Zamknij modal
                                    closeModal();
                                }
                            })
                            .finally(() => {
                                submitBtn.disabled = false;
                                submitBtn.textContent = 'Wystaw';
                            });
                    }
                });
            }
        } catch (error) {
            console.error('Błąd podczas otwierania modalu opinii:', error);
            showNotification('Wystąpił błąd podczas otwierania formularza opinii', 'error');
        }
    }
    
    // Funkcja do odświeżania sekcji recenzji
    function refreshReviews(productId) {
        console.log('Odświeżanie recenzji dla produktu:', productId);
        
        // Pobierz zawartość karty recenzji
        fetch(`/get_product_reviews/${productId}`, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log('Otrzymano dane recenzji:', data);
            
            // Aktualizuj zawartość karty recenzji nową zawartością
            const reviewsTab = document.querySelector('#reviews');
            if (reviewsTab) {
                reviewsTab.innerHTML = data.reviewsHtml;
                console.log('Zaktualizowano zawartość karty recenzji');
                
                // Aktualizuj statystyki recenzji na karcie produktu
                updateProductRatingDisplay(data.avgRating, data.reviewsCount);
                
                // Ponownie zainicjuj obsługę przycisków w odświeżonej sekcji
                initReviewButtons();
                console.log('Zainicjowano przyciski recenzji po odświeżeniu');
            }
        })
        .catch(error => {
            console.error('Błąd odświeżania recenzji:', error);
            showNotification('Wystąpił błąd podczas odświeżania recenzji', 'error');
        });
    }
    
    // Funkcja inicjalizująca obsługę przycisków w sekcji recenzji
    function initReviewButtons() {
        console.log('Inicjalizacja przycisków recenzji');
        
        // Ponownie inicjalizuj przycisk "Napisz opinię"
        const writeReviewBtn = document.getElementById('write-review-btn');
        if (writeReviewBtn) {
            console.log('Inicjalizacja przycisku "Napisz opinię"');
            writeReviewBtn.addEventListener('click', function() {
                console.log('Kliknięto przycisk "Napisz opinię"');
                openReviewModal();
            });
        }
        
        // Ponownie zainicjuj przyciski edycji recenzji
        const editReviewBtns = document.querySelectorAll('.edit-review-btn');
        editReviewBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const reviewId = this.getAttribute('data-review-id');
                const currentRating = parseInt(this.getAttribute('data-review-rating'));
                const title = this.getAttribute('data-review-title') || '';
                const content = this.getAttribute('data-review-content') || '';
                
                console.log('Edycja opinii:', reviewId, currentRating);
                openReviewModal(reviewId, currentRating, title, content);
            });
        });
        
        // Ponownie zainicjuj przyciski usuwania recenzji
        const deleteReviewBtns = document.querySelectorAll('.delete-review-btn');
        deleteReviewBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const reviewId = this.getAttribute('data-review-id');
                const productId = this.getAttribute('data-product-id');
                
                if (confirm('Czy na pewno chcesz usunąć swoją opinię?')) {
                    deleteReview(reviewId, productId);
                }
            });
        });
    }
    
    // Funkcja dodająca nową opinię
function addReview(productId, reviewData) {
    console.log('Dodawanie nowej recenzji:', { productId, reviewData });
    
    return fetch(`/add_review/${productId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(reviewData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Wyświetl komunikat o sukcesie
            showNotification(data.message, 'success');
            
            // Odśwież sekcję recenzji bez przeładowania całej strony
            refreshReviews(productId);
            
            // Zaktualizuj statystyki recenzji na karcie produktu bez odświeżania
            updateProductRatingDisplay(data.avgRating, data.reviewsCount);
        } else {
            showNotification(data.message, 'error');
        }
        return data;
    })
    .catch(error => {
        console.error('Błąd dodawania opinii:', error);
        showNotification('Wystąpił błąd podczas dodawania opinii', 'error');
        throw error;
    });
}

    // Funkcja aktualizująca istniejącą opinię
    function updateReview(reviewId, reviewData) {
        console.log('Aktualizacja recenzji:', { reviewId, reviewData });
        
        return fetch(`/update_review/${reviewId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(reviewData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Wyświetl komunikat o sukcesie
                showNotification(data.message, 'success');
                
                // Pobierz ID produktu z adresu URL
                const productId = document.querySelector('.product-page').getAttribute('data-product-id');
                
                // Odśwież sekcję recenzji bez przeładowania całej strony
                refreshReviews(productId);
                
                // Zaktualizuj statystyki recenzji na karcie produktu bez odświeżania
                updateProductRatingDisplay(data.avgRating, data.reviewsCount);
            } else {
                showNotification(data.message, 'error');
            }
            return data;
        })
        .catch(error => {
            console.error('Błąd aktualizacji opinii:', error);
            showNotification('Wystąpił błąd podczas aktualizacji opinii', 'error');
            throw error;
        });
    }

    // Funkcja usuwająca opinię
    function deleteReview(reviewId, productId) {
        console.log('Usuwanie recenzji:', { reviewId, productId });
        
        fetch(`/delete_review/${reviewId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({ product_id: productId })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Wyświetl komunikat o sukcesie
                showNotification(data.message, 'success');
                
                // Odśwież sekcję recenzji bez przeładowania całej strony
                refreshReviews(productId);
                
                // Zaktualizuj statystyki recenzji na karcie produktu bez odświeżania
                updateProductRatingDisplay(data.avgRating, data.reviewsCount);
            } else {
                showNotification(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Błąd usuwania opinii:', error);
            showNotification('Wystąpił błąd podczas usuwania opinii', 'error');
        });
    }

    // Funkcja aktualizująca wyświetlanie oceny produktu na karcie produktu
    function updateProductRatingDisplay(avgRating, reviewsCount) {
        // Aktualizuj sekcję oceny w metadanych produktu
        const productRating = document.querySelector('.product-meta .product-rating');
        if (productRating) {
            // Aktualizuj gwiazdki
            const stars = productRating.querySelectorAll('i');
            stars.forEach((star, index) => {
                // Usuń wszystkie klasy gwiazdek
                star.className = '';
                
                // Dodaj odpowiednią klasę w zależności od oceny
                if (index < Math.floor(avgRating)) {
                    star.className = 'fas fa-star'; // Pełna gwiazdka
                } else if (index < avgRating && index === Math.floor(avgRating)) {
                    star.className = 'fas fa-star-half-alt'; // Pół gwiazdki
                } else {
                    star.className = 'far fa-star'; // Pusta gwiazdka
                }
            });
            
            // Aktualizuj tekst z oceną
            const ratingText = productRating.querySelector('span');
            if (ratingText) {
                ratingText.textContent = `${avgRating}/5 (${reviewsCount} ocen)`;
            }
        }
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
});