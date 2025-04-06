// static/js/reviews.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('Skrypt reviews.js załadowany');
    
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
            const pros = this.getAttribute('data-review-pros') || '[]';
            const cons = this.getAttribute('data-review-cons') || '[]';
            
            console.log('Edycja opinii:', reviewId, currentRating);
            openReviewModal(reviewId, currentRating, title, content, pros, cons);
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
    
    // Obsługa przycisków "Czy ta opinia była pomocna?"
    const helpfulBtns = document.querySelectorAll('.helpful-btn');
    helpfulBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Pobierz dane przycisku
            const reviewId = this.getAttribute('data-review-id');
            const helpful = this.getAttribute('data-helpful');
            
            // Zakładamy, że wszystkie recenzje są prawidłowe (usuwamy warunek data-from-db)
            console.log('Oznaczenie opinii jako pomocna/niepomocna:', reviewId, helpful);
            markReviewHelpful(reviewId, helpful);
        });
    });
    
    function openReviewModal(reviewId = null, currentRating = 3, title = '', content = '', pros = '[]', cons = '[]') {
        console.log('Otwieranie modalu opinii:', { reviewId, currentRating, title, pros, cons });
        
        // Pobierz informacje o produkcie
        const productId = document.querySelector('.product-page').getAttribute('data-product-id');
        const productName = document.querySelector('.product-title').textContent;
        
        // Parsuj zalety i wady z JSON
        let prosArray = [];
        let consArray = [];
        
        try {
            // Sprawdź, czy przekazano JSON jako string, czy jako obiekt
            if (typeof pros === 'string') {
                prosArray = JSON.parse(pros);
            } else if (Array.isArray(pros)) {
                prosArray = pros;
            }
            
            if (typeof cons === 'string') {
                consArray = JSON.parse(cons);
            } else if (Array.isArray(cons)) {
                consArray = cons;
            }
            
            console.log('Zalety:', prosArray);
            console.log('Wady:', consArray);
        } catch (e) {
            console.error('Błąd parsowania JSON:', e, pros, cons);
        }
        
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
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="pros-input">Zalety</label>
                            <div class="tags-input" id="pros-container">
                                <input type="text" id="pros-input" placeholder="Wpisz zaletę i naciśnij Enter">
                                <div class="tags" id="pros-tags">
                                    ${prosArray.map(pro => `
                                        <div class="tag">
                                            ${pro}
                                            <span class="tag-close">&times;</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="cons-input">Wady</label>
                            <div class="tags-input" id="cons-container">
                                <input type="text" id="cons-input" placeholder="Wpisz wadę i naciśnij Enter">
                                <div class="tags" id="cons-tags">
                                    ${consArray.map(con => `
                                        <div class="tag">
                                            ${con}
                                            <span class="tag-close">&times;</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
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
        
        // Obsługa tagów (zalety i wady)
        const setupTagsInput = (inputId, tagsContainerId) => {
            const input = document.getElementById(inputId);
            const tagsContainer = document.getElementById(tagsContainerId);
            
            if (!input || !tagsContainer) {
                console.error('Nie znaleziono elementów dla tagów', inputId, tagsContainerId);
                return;
            }
            
            // Obsługa dodawania tagów po naciśnięciu Enter
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    
                    const text = this.value.trim();
                    if (text) {
                        // Utwórz nowy tag
                        const tag = document.createElement('div');
                        tag.className = 'tag';
                        tag.innerHTML = `
                            ${text}
                            <span class="tag-close">&times;</span>
                        `;
                        
                        // Dodaj obsługę usuwania tagu
                        const closeBtn = tag.querySelector('.tag-close');
                        closeBtn.addEventListener('click', function() {
                            tag.remove();
                        });
                        
                        // Dodaj tag do kontenera
                        tagsContainer.appendChild(tag);
                        
                        // Wyczyść pole wprowadzania
                        this.value = '';
                    }
                }
            });
            
            // Obsługa usuwania istniejących tagów
            const closeBtns = tagsContainer.querySelectorAll('.tag-close');
            closeBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    this.parentElement.remove();
                });
            });
        };
        
        // Inicjalizacja pól tagów
        setupTagsInput('pros-input', 'pros-tags');
        setupTagsInput('cons-input', 'cons-tags');
        
        // Obsługa wybierania oceny
        const stars = modal.querySelectorAll('.star');
        
        // Jeśli edytujemy opinię, użyj przekazanej wartości, w przeciwnym razie ustaw 3 jako domyślną ocenę
        let selectedRating = currentRating || 3;
        
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
        updateStars(selectedRating);
        
        // Obsługa najechania i kliknięcia na gwiazdki
        stars.forEach(star => {
            // Najechanie myszą - tylko podgląd
            star.addEventListener('mouseover', function() {
                const rating = parseInt(this.getAttribute('data-rating'));
                updateStars(rating);
            });
            
            // Opuszczenie obszaru gwiazdek - przywrócenie wybranej oceny
            star.addEventListener('mouseout', function() {
                updateStars(selectedRating);
            });
            
            // Kliknięcie na gwiazdkę - ustawienie oceny
            star.addEventListener('click', function() {
                selectedRating = parseInt(this.getAttribute('data-rating'));
                console.log('Ustawiono ocenę:', selectedRating);
                updateStars(selectedRating);
            });
        });
        
        // Obsługa przycisku "Wystaw" / "Modyfikuj"
        const submitBtn = modal.querySelector('.submit-review');
        if (submitBtn) {
            submitBtn.addEventListener('click', function(e) {
                console.log('Kliknięto przycisk submit');
                e.preventDefault(); // Zapobiegaj domyślnej akcji przycisku
                
                // Sprawdź czy wybrano ocenę
                if (!selectedRating || selectedRating < 1 || selectedRating > 5) {
                    showNotification('Proszę wybrać ocenę od 1 do 5', 'warning');
                    return;
                }
                
                // Zbierz dane z formularza
                const title = document.getElementById('review-title').value.trim();
                const content = document.getElementById('review-content').value.trim();
                
                // Zbierz tagi (zalety i wady)
                const prosTags = Array.from(document.getElementById('pros-tags').querySelectorAll('.tag'))
                    .map(tag => tag.textContent.trim().replace('×', '').trim());
                
                const consTags = Array.from(document.getElementById('cons-tags').querySelectorAll('.tag'))
                    .map(tag => tag.textContent.trim().replace('×', '').trim());
                
                // Dane opinii
                const reviewData = {
                    rating: selectedRating,
                    title: title || `Recenzja produktu ${selectedRating}/5`,
                    content: content || '',
                    pros: JSON.stringify(prosTags),
                    cons: JSON.stringify(consTags)
                };
                
                console.log('Przygotowane dane recenzji:', reviewData);
                
                // Wyłącz przycisk na czas przetwarzania
                submitBtn.disabled = true;
                submitBtn.textContent = reviewId ? 'Aktualizowanie...' : 'Zapisywanie...';
                
                if (reviewId) {
                    // Aktualizacja istniejącej opinii
                    updateReview(reviewId, reviewData)
                        .finally(() => {
                            submitBtn.disabled = false;
                            submitBtn.textContent = 'Modyfikuj';
                            closeModal();
                        });
                } else {
                    // Dodanie nowej opinii
                    addReview(productId, reviewData)
                        .finally(() => {
                            submitBtn.disabled = false;
                            submitBtn.textContent = 'Wystaw';
                            closeModal();
                        });
                }
            });
        }
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
                showNotification(data.message, 'success');
                // Odśwież stronę, aby zobaczyć nową opinię
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
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
                showNotification(data.message, 'success');
                // Odśwież stronę, aby zobaczyć zaktualizowaną opinię
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
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
                showNotification(data.message, 'success');
                // Odśwież stronę, aby zobaczyć usunięcie opinii
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                showNotification(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Błąd usuwania opinii:', error);
            showNotification('Wystąpił błąd podczas usuwania opinii', 'error');
        });
    }
    
    // Funkcja oceniająca pomocność recenzji
    function markReviewHelpful(reviewId, helpful) {
        console.log('Ocena pomocności recenzji:', { reviewId, helpful });
        
        // Aktualizuj wizualnie przyciski (dodaj klasę 'active')
        const helpfulYesBtn = document.querySelector(`.helpful-btn[data-review-id="${reviewId}"][data-helpful="yes"]`);
        const helpfulNoBtn = document.querySelector(`.helpful-btn[data-review-id="${reviewId}"][data-helpful="no"]`);
        
        if (helpful === 'yes' && helpfulYesBtn) {
            helpfulYesBtn.classList.add('active');
            if (helpfulNoBtn) helpfulNoBtn.classList.remove('active');
        } else if (helpful === 'no' && helpfulNoBtn) {
            helpfulNoBtn.classList.add('active');
            if (helpfulYesBtn) helpfulYesBtn.classList.remove('active');
        }
        
        fetch(`/review_helpful/${reviewId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({ helpful: helpful })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showNotification(data.message, 'success');
                
                // Aktualizuj liczniki pomocności na stronie
                const helpfulYesSpan = helpfulYesBtn?.querySelector('span');
                const helpfulNoSpan = helpfulNoBtn?.querySelector('span');
                
                if (helpfulYesSpan) {
                    helpfulYesSpan.textContent = `(${data.helpful_yes})`;
                }
                
                if (helpfulNoSpan) {
                    helpfulNoSpan.textContent = `(${data.helpful_no})`;
                }
            } else {
                // Cofnij wizualne zmiany w przypadku błędu
                if (helpful === 'yes' && helpfulYesBtn) {
                    helpfulYesBtn.classList.remove('active');
                } else if (helpful === 'no' && helpfulNoBtn) {
                    helpfulNoBtn.classList.remove('active');
                }
                
                showNotification(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Błąd oceny przydatności recenzji:', error);
            showNotification('Wystąpił błąd podczas oceny przydatności recenzji', 'error');
            
            // Cofnij wizualne zmiany w przypadku błędu
            if (helpful === 'yes' && helpfulYesBtn) {
                helpfulYesBtn.classList.remove('active');
            } else if (helpful === 'no' && helpfulNoBtn) {
                helpfulNoBtn.classList.remove('active');
            }
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
});