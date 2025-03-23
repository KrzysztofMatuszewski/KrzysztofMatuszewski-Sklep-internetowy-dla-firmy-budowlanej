# app.py
from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import os
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from sqlalchemy import func

# Inicjalizacja aplikacji
app = Flask(__name__)
app.config['SECRET_KEY'] = 'twoj_tajny_klucz'
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:root@localhost/patobud'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Inicjalizacja bazy danych
db = SQLAlchemy(app)

# Inicjalizacja logowania
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

# Modele bazy danych
class Role(db.Model):
    __tablename__ = 'roles'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)
    name = db.Column(db.String(255), nullable=False)
    users = db.relationship('User', backref='role', lazy=True)

class User(db.Model, UserMixin):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)
    username = db.Column(db.String(255), nullable=False, unique=True)
    email = db.Column(db.String(255), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False)
    roleId = db.Column(db.Integer, db.ForeignKey('roles.id'), nullable=False)
    isverified = db.Column(db.Boolean, default=False)
    orders = db.relationship('Order', backref='user', lazy=True)
    reviews = db.relationship('Review', backref='user', lazy=True)

class Category(db.Model):
    __tablename__ = 'categories'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)
    name = db.Column(db.String(255), nullable=False)
    products = db.relationship('Product', backref='category', lazy=True)

class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    sellPrice = db.Column(db.Numeric(10, 2), nullable=False)
    buyPrice = db.Column(db.Numeric(10, 2), nullable=False)
    categoryId = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=True)
    stock = db.Column(db.Integer, nullable=False, default=0)
    orderItems = db.relationship('OrderItem', backref='product', lazy=True)
    reviews = db.relationship('Review', backref='product', lazy=True)
    images = db.relationship('ProductImage', backref='product', lazy=True)
    files = db.relationship('ProductFile', backref='product', lazy=True)

class Order(db.Model):
    __tablename__ = 'orders'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)
    userId = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    totalPrice = db.Column(db.Numeric(10, 2), nullable=False, default=0)
    status = db.Column(db.Enum('pending', 'completed', 'canceled', 'cart'), nullable=False)
    createdAt = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    items = db.relationship('OrderItem', backref='order', lazy=True)

class OrderItem(db.Model):
    __tablename__ = 'orderItems'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)
    orderId = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    productId = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    buyPrice = db.Column(db.Numeric(10, 2), nullable=False)
    sellPrice = db.Column(db.Numeric(10, 2), nullable=False)
    totalSellPrice = db.Column(db.Numeric(10, 2), nullable=False)
    totalBuyPrice = db.Column(db.Numeric(10, 2), nullable=False)

class Review(db.Model):
    __tablename__ = 'reviews'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)
    userId = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    productId = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)

class ProductImage(db.Model):
    __tablename__ = 'productImages'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)
    productId = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    imageData = db.Column(db.LargeBinary, nullable=False)

class ProductFile(db.Model):
    __tablename__ = 'productFiles'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)
    productId = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    fileData = db.Column(db.LargeBinary, nullable=False)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Funkcje pomocnicze do pobierania danych z bazy
def get_featured_products(limit=4):
    """Pobiera wyróżnione produkty (np. bestsellery lub nowości)"""
    products = Product.query.order_by(Product.id.desc()).limit(limit).all()
    
    result = []
    for product in products:
        # Oblicz średnią ocenę produktu
        avg_rating = db.session.query(func.avg(Review.rating)).filter(Review.productId == product.id).scalar() or 0
        reviews_count = Review.query.filter_by(productId=product.id).count()
        
        # Pobierz pierwsze zdjęcie produktu, jeśli istnieje
        image = ProductImage.query.filter_by(productId=product.id).first()
        image_url = '/static/img/products/placeholder.jpg'  # Domyślny obraz
        
        # Konstruowanie obiektu produktu
        product_dict = {
            'id': product.id,
            'name': product.name,
            'price': float(product.sellPrice),
            'old_price': float(product.sellPrice) * 1.2,  # Przykładowa "stara cena" 
            'discount': 20 if product.id % 2 == 0 else 15,  # Przykładowa zniżka
            'rating': round(float(avg_rating), 1),
            'reviews_count': reviews_count,
            'image_url': image_url,
            'is_bestseller': product.id % 3 == 0,  # Przykładowy znacznik bestsellera
            'is_new': product.id % 4 == 0  # Przykładowy znacznik nowości
        }
        
        result.append(product_dict)
        
    return result

def get_all_categories():
    """Pobiera wszystkie kategorie z podziałem na główne i podkategorie"""
    categories = Category.query.all()
    
    # W obecnej strukturze bazy danych nie ma bezpośredniego rozróżnienia na główne kategorie
    # i podkategorie, więc to jest uproszczona implementacja.
    # W przyszłości można rozszerzyć model Category o pole parent_id.
    
    result = []
    for category in categories:
        # Pobierz liczbę produktów w kategorii
        product_count = Product.query.filter_by(categoryId=category.id).count()
        
        category_dict = {
            'id': category.id,
            'name': category.name,
            'description': f"Przeglądaj produkty z kategorii {category.name}",
            'image_url': '/static/img/categories/placeholder.jpg',
            'product_count': product_count,
            'subcategories': []  # Tu można dodać podkategorie, gdy model zostanie rozszerzony
        }
        
        result.append(category_dict)
        
    return result

def get_product_details(product_id):
    """Pobiera szczegółowe informacje o produkcie"""
    product = Product.query.get(product_id)
    if not product:
        return None
        
    # Pobierz średnią ocenę produktu
    avg_rating = db.session.query(func.avg(Review.rating)).filter(Review.productId == product.id).scalar() or 0
    reviews_count = Review.query.filter_by(productId=product.id).count()
    
    # Pobierz zdjęcia produktu
    images = ProductImage.query.filter_by(productId=product.id).all()
    image_urls = ['/static/img/products/placeholder.jpg'] * 3  # Domyślne obrazy
    
    # Pobierz recenzje produktu
    reviews_query = Review.query.filter_by(productId=product.id)
    reviews = reviews_query.all()
    
    # Przygotuj dystrybucję ocen
    rating_counts = {
        5: Review.query.filter_by(productId=product.id, rating=5).count(),
        4: Review.query.filter_by(productId=product.id, rating=4).count(),
        3: Review.query.filter_by(productId=product.id, rating=3).count(),
        2: Review.query.filter_by(productId=product.id, rating=2).count(),
        1: Review.query.filter_by(productId=product.id, rating=1).count()
    }
    
    total_ratings = sum(rating_counts.values())
    rating_distribution = {
        5: (rating_counts[5] / total_ratings * 100) if total_ratings > 0 else 0,
        4: (rating_counts[4] / total_ratings * 100) if total_ratings > 0 else 0,
        3: (rating_counts[3] / total_ratings * 100) if total_ratings > 0 else 0,
        2: (rating_counts[2] / total_ratings * 100) if total_ratings > 0 else 0,
        1: (rating_counts[1] / total_ratings * 100) if total_ratings > 0 else 0
    }
    
    # Przygotuj recenzje w formie listy słowników
    reviews_list = []
    for review in reviews:
        user = User.query.get(review.userId)
        
        # Ponieważ nie mamy pełnych danych w bazie, tworzymy przykładowe
        review_dict = {
            'id': review.id,
            'author': user.username if user else 'Anonim',
            'date': datetime.now() - timedelta(days=review.id % 30),  # Przykładowa data
            'rating': review.rating,
            'title': f'Recenzja produktu {review.rating}/5',
            'content': f'To jest przykładowa treść recenzji dla produktu o ID {review.productId}. Ocena: {review.rating}/5.',
            'pros': ['Dobra jakość', 'Atrakcyjna cena'] if review.rating > 3 else ['Szybka dostawa'],
            'cons': ['Mógłby być tańszy'] if review.rating > 3 else ['Słaba jakość', 'Wysokie ceny'],
            'helpful_yes': review.id * 2 % 15,  # Przykładowa liczba pozytywnych ocen recenzji
            'helpful_no': review.id % 5  # Przykładowa liczba negatywnych ocen recenzji
        }
        
        reviews_list.append(review_dict)
    
    # Przygotowanie słownika z danymi produktu
    product_dict = {
        'id': product.id,
        'name': product.name,
        'price': float(product.sellPrice),
        'old_price': float(product.sellPrice) * 1.2,  # Przykładowa "stara cena"
        'discount': 20,  # Przykładowa zniżka
        'rating': round(float(avg_rating), 1),
        'reviews_count': reviews_count,
        'image_url': image_urls[0] if len(image_urls) > 0 else '/static/img/products/placeholder.jpg',
        'is_bestseller': product.id % 3 == 0,  # Przykładowy znacznik bestsellera
        'is_new': product.id % 4 == 0,  # Przykładowy znacznik nowości
        'short_description': product.description[:150] + '...',
        'description': product.description,
        'code': f'PROD-{product.id}',
        'availability': 'in_stock' if product.stock > 0 else 'out_of_stock',
        'delivery_time': 1 if product.stock > 10 else 3,
        'delivery_cost': 15 if float(product.sellPrice) < 200 else 0,
        'stock': product.stock,
        'category': {'id': product.categoryId, 'name': product.category.name if product.category else 'Bez kategorii'},
        'images': image_urls,
        'specifications': [
            {
                'name': 'Parametry techniczne',
                'specs': [
                    {'name': 'Kod produktu', 'value': f'PROD-{product.id}'},
                    {'name': 'Cena zakupu', 'value': f'{product.buyPrice} zł'},
                    {'name': 'Cena sprzedaży', 'value': f'{product.sellPrice} zł'}
                ]
            },
            {
                'name': 'Dostępność',
                'specs': [
                    {'name': 'Stan magazynowy', 'value': product.stock},
                    {'name': 'Kategoria', 'value': product.category.name if product.category else 'Bez kategorii'}
                ]
            }
        ],
        'reviews': reviews_list,
        'rating_distribution': rating_distribution,
        'ratings_count': rating_counts
    }
    
    return product_dict

def get_category_details(category_id):
    """Pobiera szczegółowe informacje o kategorii"""
    category = Category.query.get(category_id)
    if not category:
        return None
    
    # Pobierz liczbę produktów w kategorii
    product_count = Product.query.filter_by(categoryId=category.id).count()
    
    category_dict = {
        'id': category.id,
        'name': category.name,
        'description': f"Przeglądaj produkty z kategorii {category.name}",
        'image_url': '/static/img/categories/placeholder.jpg',
        'product_count': product_count,
        'subcategories': []  # Tu można dodać podkategorie, gdy model zostanie rozszerzony
    }
    
    return category_dict

def get_category_products(category_id, page=1, per_page=12):
    """Pobiera produkty z określonej kategorii z paginacją"""
    products_query = Product.query.filter_by(categoryId=category_id)
    
    # Pobierz pełną liczbę produktów w kategorii
    total = products_query.count()
    
    # Zastosuj paginację
    products_paginated = products_query.paginate(page=page, per_page=per_page, error_out=False)
    
    result = []
    for product in products_paginated.items:
        # Oblicz średnią ocenę produktu
        avg_rating = db.session.query(func.avg(Review.rating)).filter(Review.productId == product.id).scalar() or 0
        reviews_count = Review.query.filter_by(productId=product.id).count()
        
        # Pobierz pierwsze zdjęcie produktu, jeśli istnieje
        image = ProductImage.query.filter_by(productId=product.id).first()
        image_url = '/static/img/products/placeholder.jpg'  # Domyślny obraz
        
        # Konstruowanie obiektu produktu
        product_dict = {
            'id': product.id,
            'name': product.name,
            'price': float(product.sellPrice),
            'old_price': float(product.sellPrice) * 1.2,  # Przykładowa "stara cena" 
            'discount': 20 if product.id % 2 == 0 else 15,  # Przykładowa zniżka
            'rating': round(float(avg_rating), 1),
            'reviews_count': reviews_count,
            'image_url': image_url,
            'is_bestseller': product.id % 3 == 0,  # Przykładowy znacznik bestsellera
            'is_new': product.id % 4 == 0  # Przykładowy znacznik nowości
        }
        
        result.append(product_dict)
    
    return result, products_paginated

def get_related_products(product_id, limit=4):
    """Pobiera produkty powiązane z danym produktem (np. z tej samej kategorii)"""
    product = Product.query.get(product_id)
    if not product or not product.categoryId:
        return get_featured_products(limit)  # Jeśli brak produktu lub kategorii, zwróć popularne produkty
    
    # Pobierz produkty z tej samej kategorii, ale inne niż obecny produkt
    related = Product.query.filter(Product.categoryId == product.categoryId, 
                                  Product.id != product.id).limit(limit).all()
    
    # Jeśli znaleziono mniej niż limit produktów, uzupełnij innymi popularnymi produktami
    if len(related) < limit:
        additional = Product.query.filter(Product.id != product.id,
                                         Product.categoryId != product.categoryId)\
                                 .limit(limit - len(related)).all()
        related.extend(additional)
    
    result = []
    for product in related:
        # Oblicz średnią ocenę produktu
        avg_rating = db.session.query(func.avg(Review.rating)).filter(Review.productId == product.id).scalar() or 0
        reviews_count = Review.query.filter_by(productId=product.id).count()
        
        # Pobierz pierwsze zdjęcie produktu, jeśli istnieje
        image = ProductImage.query.filter_by(productId=product.id).first()
        image_url = '/static/img/products/placeholder.jpg'  # Domyślny obraz
        
        # Konstruowanie obiektu produktu
        product_dict = {
            'id': product.id,
            'name': product.name,
            'price': float(product.sellPrice),
            'old_price': float(product.sellPrice) * 1.2,  # Przykładowa "stara cena" 
            'discount': 20 if product.id % 2 == 0 else 15,  # Przykładowa zniżka
            'rating': round(float(avg_rating), 1),
            'reviews_count': reviews_count,
            'image_url': image_url,
            'is_bestseller': product.id % 3 == 0,  # Przykładowy znacznik bestsellera
            'is_new': product.id % 4 == 0  # Przykładowy znacznik nowości
        }
        
        result.append(product_dict)
        
    return result

# Funkcja pomocnicza do pobierania lub tworzenia koszyka dla zalogowanego użytkownika
def get_or_create_cart_for_user(user_id):
    # Sprawdź, czy użytkownik ma już koszyk (zamówienie o statusie 'cart')
    cart_order = Order.query.filter_by(userId=user_id, status='cart').first()
    
    # Jeśli nie ma koszyka, utwórz nowy
    if not cart_order:
        cart_order = Order(
            userId=user_id,
            totalPrice=0,
            status='cart',
            createdAt=datetime.utcnow()
        )
        db.session.add(cart_order)
        db.session.commit()
    
    return cart_order

# Funkcja pomocnicza do pobierania zawartości koszyka
def get_cart_items():
    try:
        # Jeśli użytkownik jest zalogowany, pobierz jego koszyk z bazy danych
        if current_user.is_authenticated:
            # Pobierz zamówienie o statusie 'cart'
            cart_order = Order.query.filter_by(userId=current_user.id, status='cart').first()
            
            if cart_order:
                # Pobierz elementy koszyka
                cart_items_db = OrderItem.query.filter_by(orderId=cart_order.id).all()
                cart_items = [{'product_id': item.productId, 'quantity': item.quantity} for item in cart_items_db]
            else:
                cart_items = []
                
            return cart_items
        # W przeciwnym wypadku używamy koszyka z sesji
        else:
            return session.get('cart', [])
    except Exception as e:
        print(f"Błąd podczas pobierania koszyka: {e}")
        # W przypadku błędu zwracamy pustą listę, aby uniknąć awarii całej aplikacji
        return []

# Funkcja do synchronizacji koszyka sesji z koszykiem użytkownika po zalogowaniu
def sync_cart_after_login(user_id):
    session_cart = session.get('cart', [])
    if not session_cart:
        return
    
    # Pobierz lub utwórz koszyk użytkownika
    cart_order = get_or_create_cart_for_user(user_id)
    
    # Pobierz istniejące elementy koszyka
    cart_items_db = OrderItem.query.filter_by(orderId=cart_order.id).all()
    
    # Aktualizuj lub dodaj nowe produkty z sesji do koszyka użytkownika
    for session_item in session_cart:
        product_id = session_item['product_id']
        quantity = session_item['quantity']
        
        # Sprawdź czy produkt już istnieje w koszyku użytkownika
        existing_item = next((item for item in cart_items_db if item.productId == product_id), None)
        
        if existing_item:
            # Aktualizuj ilość
            existing_item.quantity += quantity
            product = Product.query.get(product_id)
            if product and existing_item.quantity > product.stock:
                existing_item.quantity = product.stock
        else:
            # Dodaj nowy przedmiot do koszyka użytkownika
            product = Product.query.get(product_id)
            if product:
                new_cart_item = OrderItem(
                    orderId=cart_order.id,
                    productId=product_id,
                    quantity=quantity,
                    buyPrice=product.buyPrice,
                    sellPrice=product.sellPrice,
                    totalSellPrice=float(product.sellPrice) * quantity,
                    totalBuyPrice=float(product.buyPrice) * quantity
                )
                db.session.add(new_cart_item)
    
    # Zaktualizuj całkowitą cenę koszyka
    update_cart_total_price(cart_order.id)
    
    # Zapisz zmiany
    db.session.commit()
    
    # Wyczyść koszyk sesji
    session['cart'] = []
    session.modified = True

# Funkcja do obliczania całkowitej ceny koszyka
def update_cart_total_price(order_id):
    cart_items = OrderItem.query.filter_by(orderId=order_id).all()
    total_price = sum(float(item.totalSellPrice) for item in cart_items)
    
    cart_order = Order.query.get(order_id)
    if cart_order:
        cart_order.totalPrice = total_price
        db.session.commit()
    
    return total_price

# Routy
@app.route('/')
def index():
    products = get_featured_products()
    categories = get_all_categories()
    return render_template('index.html', products=products, categories=categories)

@app.route('/categories')
def categories():
    parent_categories = get_all_categories()
    return render_template('categories.html', parent_categories=parent_categories)

@app.route('/category/<int:category_id>')
def category(category_id):
    category = get_category_details(category_id)
    if not category:
        return "Kategoria nie znaleziona", 404
    
    # Pobierz stronę z parametrów URL
    page = request.args.get('page', 1, type=int)
    
    # Pobierz produkty z paginacją
    products, pagination = get_category_products(category_id, page)
    
    return render_template('category.html', category=category, products=products, pagination=pagination)

@app.route('/product/<int:product_id>')
def product(product_id):
    product = get_product_details(product_id)
    if not product:
        return "Produkt nie znaleziony", 404
    
    # Pobierz powiązane produkty
    related_products = get_related_products(product_id)
    
    # Pobierz stronę opinii z parametrów URL
    reviews_page = request.args.get('reviews_page', 1, type=int)
    per_page = 5
    
    # Przygotuj paginację dla opinii
    total_reviews = len(product['reviews'])
    reviews_start = (reviews_page - 1) * per_page
    reviews_end = reviews_start + per_page
    
    # Utwórz obiekt paginacji dla opinii
    class ReviewsPagination:
        def __init__(self, page, per_page, total):
            self.page = page
            self.per_page = per_page
            self.total = total
            self.pages = (total + per_page - 1) // per_page
            self.has_prev = page > 1
            self.has_next = page < self.pages
            self.prev_page = page - 1 if self.has_prev else None
            self.next_page = page + 1 if self.has_next else None
        
        def iter_pages(self):
            pages = []
            for i in range(1, self.pages + 1):
                if i <= 2 or i >= self.pages - 1 or abs(i - self.page) <= 1:
                    pages.append(i)
                elif i == 3 and self.page > 4:
                    pages.append(None)
                elif i == self.pages - 2 and self.page < self.pages - 3:
                    pages.append(None)
            return pages
    
    reviews_pagination = ReviewsPagination(reviews_page, per_page, total_reviews)
    
    # Dostosuj listę opinii do bieżącej strony
    product['reviews'] = product['reviews'][reviews_start:reviews_end]
    
    return render_template('product.html', product=product, related_products=related_products, reviews_pagination=reviews_pagination)

# Modyfikacja funkcji logowania, aby synchronizować koszyk
@app.route('/login', methods=['GET', 'POST'])
def login():
    # Zapisz adres URL, z którego przyszedł użytkownik (referrer)
    next_page = request.args.get('next') or request.referrer
    
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password, password):
            login_user(user)
            
            # Synchronizuj koszyk po zalogowaniu
            try:
                sync_cart_after_login(user.id)
            except Exception as e:
                print(f"Błąd synchronizacji koszyka: {e}")
            
            # Ustawienie komunikatu flash
            flash('Zalogowano pomyślnie')
            
            # Przekierowanie na stronę, z której przyszedł, lub na checkout jeśli przyszedł z koszyka
            if next_page and next_page != 'None' and '/login' not in next_page:
                if '/cart' in next_page:
                    return redirect(url_for('checkout'))
                return redirect(next_page)
                
            return redirect(url_for('index'))
        
        flash('Nieprawidłowa nazwa użytkownika lub hasło')
    
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        
        existing_user = User.query.filter((User.username == username) | (User.email == email)).first()
        if existing_user:
            flash('Użytkownik o takiej nazwie lub emailu już istnieje')
            return redirect(url_for('register'))
        
        hashed_password = generate_password_hash(password)
        new_user = User(username=username, email=email, password=hashed_password, roleId=2)  # 2 - rola zwykłego użytkownika
        
        db.session.add(new_user)
        db.session.commit()
        
        flash('Rejestracja udana. Możesz się teraz zalogować.')
        return redirect(url_for('login'))
    
    return render_template('register.html')

# Modyfikacja funkcji wylogowania, aby czyścić koszyk w sesji
@app.route('/logout')
@login_required
def logout():
    # Wyczyść koszyk w sesji
    session['cart'] = []
    session.modified = True
    
    logout_user()
    return redirect(url_for('index'))

@app.route('/cart')
def cart():
    cart_items = get_cart_items()
    cart_products = []
    
    # Jeśli koszyk nie jest pusty, pobierz dane produktów
    if cart_items:
        for item in cart_items:
            product_id = item['product_id']
            product = Product.query.get(product_id)
            if product:
                # Oblicz średnią ocenę produktu
                avg_rating = db.session.query(func.avg(Review.rating)).filter(Review.productId == product_id).scalar() or 0
                reviews_count = Review.query.filter_by(productId=product_id).count()
                
                # Oblicz cenę całkowitą
                total_price = float(product.sellPrice) * item['quantity']
                
                # Dodaj produkt do listy
                product_dict = {
                    'id': product.id,
                    'name': product.name,
                    'price': float(product.sellPrice),
                    'old_price': float(product.sellPrice) * 1.2 if product.id % 2 == 0 else None,
                    'discount': 20 if product.id % 2 == 0 else None,
                    'quantity': item['quantity'],
                    'total_price': total_price,
                    'stock': product.stock,
                    'image_url': '/static/img/products/placeholder.jpg',  # Domyślny obraz
                    'rating': round(float(avg_rating), 1),
                    'reviews_count': reviews_count,
                }
                
                cart_products.append(product_dict)
    # Oblicz sumę zamówienia
    cart_total = sum(item['total_price'] for item in cart_products) if cart_products else 0
    # Koszt dostawy
    shipping_cost = 15 if cart_total < 200 and cart_total > 0 else 0
    # Suma całkowita
    total_with_shipping = cart_total + shipping_cost
    
    return render_template('cart.html', 
                           cart_products=cart_products, 
                           cart_total=cart_total, 
                           shipping_cost=shipping_cost,
                           total_with_shipping=total_with_shipping)
    
@app.route('/process_checkout_login')
@login_required
def process_checkout_login():
    # Ta funkcja zostaje wywołana po zalogowaniu się przez użytkownika 
    # z linku "Zaloguj się, aby złożyć zamówienie"
    return redirect(url_for('checkout'))

@app.route('/add_to_cart/<int:product_id>', methods=['POST'])
def add_to_cart(product_id):
    try:
        product = Product.query.get(product_id)
        if not product:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return jsonify({'success': False, 'message': 'Produkt nie istnieje'})
            flash('Produkt nie istnieje')
            return redirect(url_for('index'))
        
        # Pobierz ilość z formularza lub ustaw domyślnie na 1
        quantity = request.form.get('quantity', 1, type=int)
        
        # Sprawdź czy ilość jest dostępna
        if quantity > product.stock:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return jsonify({'success': False, 'message': 'Nie ma wystarczającej ilości produktu na stanie'})
            flash('Nie ma wystarczającej ilości produktu na stanie')
            return redirect(url_for('product', product_id=product_id))
        
        # Wybierz odpowiedni koszyk w zależności od tego, czy użytkownik jest zalogowany
        if current_user.is_authenticated:
            # Koszyk zalogowanego użytkownika (zamówienie o statusie 'cart')
            cart_order = get_or_create_cart_for_user(current_user.id)
            
            # Sprawdź czy produkt już jest w koszyku
            cart_item = OrderItem.query.filter_by(orderId=cart_order.id, productId=product_id).first()
            
            if cart_item:
                # Produkt już jest w koszyku, zaktualizuj ilość
                new_quantity = cart_item.quantity + quantity
                if new_quantity > product.stock:
                    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                        return jsonify({'success': False, 'message': 'Nie ma wystarczającej ilości produktu na stanie'})
                    flash('Nie ma wystarczającej ilości produktu na stanie')
                    return redirect(url_for('product', product_id=product_id))
                
                cart_item.quantity = new_quantity
                cart_item.totalSellPrice = float(cart_item.sellPrice) * new_quantity
                cart_item.totalBuyPrice = float(cart_item.buyPrice) * new_quantity
            else:
                # Dodaj nowy przedmiot do koszyka
                cart_item = OrderItem(
                    orderId=cart_order.id,
                    productId=product_id,
                    quantity=quantity,
                    buyPrice=product.buyPrice,
                    sellPrice=product.sellPrice,
                    totalSellPrice=float(product.sellPrice) * quantity,
                    totalBuyPrice=float(product.buyPrice) * quantity
                )
                db.session.add(cart_item)
            
            # Zapisz zmiany w bazie danych
            db.session.commit()
            
            # Zaktualizuj całkowitą cenę koszyka
            update_cart_total_price(cart_order.id)
            
            # Pobierz aktualną liczbę produktów w koszyku
            cart_items = OrderItem.query.filter_by(orderId=cart_order.id).all()
            cart_count = len(cart_items)
            total_items = sum(item.quantity for item in cart_items)
        else:
            # Koszyk w sesji dla niezalogowanego użytkownika
            if 'cart' not in session:
                session['cart'] = []
            
            # Sprawdź czy produkt już jest w koszyku
            cart = session.get('cart', [])
            product_in_cart = False
            
            for item in cart:
                if item['product_id'] == product_id:
                    # Produkt już jest w koszyku, zaktualizuj ilość
                    new_quantity = item['quantity'] + quantity
                    if new_quantity > product.stock:
                        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                            return jsonify({'success': False, 'message': 'Nie ma wystarczającej ilości produktu na stanie'})
                        flash('Nie ma wystarczającej ilości produktu na stanie')
                        return redirect(url_for('product', product_id=product_id))
                    
                    item['quantity'] = new_quantity
                    product_in_cart = True
                    break
            
            # Jeśli produkt nie jest jeszcze w koszyku, dodaj go
            if not product_in_cart:
                cart.append({
                    'product_id': product_id,
                    'quantity': quantity
                })
            
            # Zaktualizuj koszyk w sesji
            session['cart'] = cart
            session.modified = True
            
            # Przygotuj liczniki dla odpowiedzi
            cart_count = len(cart)
            total_items = sum(item['quantity'] for item in cart)
        
        # Powiadomienie o sukcesie
        success_message = 'Produkt został dodany do koszyka'
        
        # Jeśli to żądanie AJAX, zwróć odpowiedź JSON
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({
                'success': True, 
                'message': success_message,
                'cart_count': cart_count,
                'total_items': total_items
            })
        
        # Dla zwykłych żądań ustaw flash i przekieruj
        flash(success_message)
        
        # Jeśli dodanie do koszyka z kategorii, przekieruj do koszyka
        referrer = request.referrer or ''
        if '/category/' in referrer:
            return redirect(url_for('cart'))
        
        # W przeciwnym razie przekieruj z powrotem na stronę, z której dodano produkt
        if referrer:
            return redirect(referrer)
        else:
            return redirect(url_for('cart'))
    
    except Exception as e:
        print(f"Błąd podczas dodawania do koszyka: {e}")
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'success': False, 'message': 'Wystąpił błąd podczas dodawania produktu do koszyka'})
        
        flash('Wystąpił błąd podczas dodawania produktu do koszyka')
        return redirect(url_for('cart'))
    
@app.route('/remove_from_cart/<int:product_id>', methods=['POST'])
def remove_from_cart(product_id):
    if current_user.is_authenticated:
        # Pobierz koszyk użytkownika
        cart_order = Order.query.filter_by(userId=current_user.id, status='cart').first()
        if cart_order:
            # Usuń produkt z koszyka
            OrderItem.query.filter_by(orderId=cart_order.id, productId=product_id).delete()
            db.session.commit()
            
            # Zaktualizuj całkowitą cenę koszyka
            update_cart_total_price(cart_order.id)
    else:
        # Usuń produkt z koszyka w sesji
        if 'cart' in session:
            cart = session['cart']
            session['cart'] = [item for item in cart if item['product_id'] != product_id]
            session.modified = True
    
    flash('Produkt został usunięty z koszyka')
    
    # Jeśli to żądanie AJAX, zwróć odpowiedź JSON
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        cart_items = get_cart_items()
        cart_count = len(cart_items)
        total_items = sum(item['quantity'] for item in cart_items)
        
        return jsonify({
            'success': True,
            'message': 'Produkt został usunięty z koszyka',
            'cart_count': cart_count,
            'total_items': total_items
        })
    
    return redirect(url_for('cart'))

@app.route('/update_cart_quantity', methods=['POST'])
def update_cart_quantity():
    data = request.get_json()
    product_id = data.get('product_id')
    quantity = data.get('quantity', 1)
    
    if not product_id:
        return jsonify({'success': False, 'message': 'Nie podano ID produktu'}), 400
    
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'success': False, 'message': 'Produkt nie istnieje'}), 404
    
    # Sprawdź czy ilość jest dostępna i poprawna
    if quantity <= 0:
        return jsonify({'success': False, 'message': 'Nieprawidłowa ilość'}), 400
    
    if quantity > product.stock:
        return jsonify({'success': False, 'message': 'Brak wystarczającej ilości produktu'}), 400
    
    if current_user.is_authenticated:
        # Pobierz koszyk użytkownika
        cart_order = Order.query.filter_by(userId=current_user.id, status='cart').first()
        if not cart_order:
            return jsonify({'success': False, 'message': 'Koszyk jest pusty'}), 404
        
        # Aktualizuj ilość w koszyku użytkownika
        cart_item = OrderItem.query.filter_by(orderId=cart_order.id, productId=product_id).first()
        if cart_item:
            cart_item.quantity = quantity
            cart_item.totalSellPrice = float(cart_item.sellPrice) * quantity
            cart_item.totalBuyPrice = float(cart_item.buyPrice) * quantity
            db.session.commit()
            
            # Zaktualizuj całkowitą cenę koszyka
            update_cart_total_price(cart_order.id)
        else:
            return jsonify({'success': False, 'message': 'Produkt nie jest w koszyku'}), 404
        
        # Pobierz aktualną liczbę produktów w koszyku
        cart_items = OrderItem.query.filter_by(orderId=cart_order.id).all()
        cart_count = len(cart_items)
        total_items = sum(item.quantity for item in cart_items)
    else:
        # Aktualizuj ilość w koszyku sesji
        if 'cart' in session:
            cart = session['cart']
            item_updated = False
            
            for item in cart:
                if item['product_id'] == product_id:
                    item['quantity'] = quantity
                    item_updated = True
                    break
            
            if not item_updated:
                return jsonify({'success': False, 'message': 'Produkt nie jest w koszyku'}), 404
            
            # Zaktualizuj koszyk w sesji
            session['cart'] = cart
            session.modified = True
            
            # Przygotuj liczniki dla odpowiedzi
            cart_count = len(cart)
            total_items = sum(item['quantity'] for item in cart)
        else:
            return jsonify({'success': False, 'message': 'Koszyk jest pusty'}), 404
    
    # Oblicz nową cenę całkowitą
    total_price = float(product.sellPrice) * quantity
    
    return jsonify({
        'success': True, 
        'message': 'Ilość została zaktualizowana',
        'quantity': quantity,
        'total_price': total_price,
        'unit_price': float(product.sellPrice),
        'cart_count': cart_count,
        'total_items': total_items
    })
    
@app.route('/get_cart_count')
def get_cart_count():
    cart_items = get_cart_items()
    total_items = sum(item['quantity'] for item in cart_items)
    unique_items = len(cart_items)
    return jsonify({'count': unique_items, 'total_items': total_items})

@app.route('/checkout', methods=['GET', 'POST'])
@login_required  # Wymagane logowanie do realizacji zamówienia
def checkout():
    if request.method == 'POST':
        # Pobierz koszyk użytkownika
        cart_order = Order.query.filter_by(userId=current_user.id, status='cart').first()
        if not cart_order or OrderItem.query.filter_by(orderId=cart_order.id).count() == 0:
            flash('Twój koszyk jest pusty')
            return redirect(url_for('cart'))
        
        # Zapisz dane adresowe z formularza
        # W rzeczywistej implementacji zapisalibyśmy dane dostawy do bazy danych
        # Tutaj, dla uproszczenia, tylko aktualizujemy status zamówienia
        
        # Pobierz dane formularza
        full_name = request.form.get('full_name')
        email = request.form.get('email')
        phone = request.form.get('phone')
        street = request.form.get('street')
        postal_code = request.form.get('postal_code')
        city = request.form.get('city')
        payment_method = request.form.get('payment_method')
        notes = request.form.get('notes')
        
        # Aktualizuj status zamówienia i datę
        cart_order.status = 'pending'
        cart_order.createdAt = datetime.utcnow()
        
        # Pobierz elementy zamówienia aby zaktualizować stan magazynowy
        order_items = OrderItem.query.filter_by(orderId=cart_order.id).all()
        for item in order_items:
            product = Product.query.get(item.productId)
            if product:
                # Zaktualizuj stan magazynowy
                product.stock -= item.quantity
        
        # Zapisz zmiany w bazie danych
        db.session.commit()
        
        # Komunikat o sukcesie
        flash('Twoje zamówienie zostało pomyślnie złożone')
        
        # Przekieruj na stronę potwierdzenia zamówienia
        return redirect(url_for('order_confirmation', order_id=cart_order.id))
    
    # Metoda GET - wyświetl stronę z formularzem realizacji zamówienia
    cart_order = Order.query.filter_by(userId=current_user.id, status='cart').first()
    if not cart_order or OrderItem.query.filter_by(orderId=cart_order.id).count() == 0:
        flash('Twój koszyk jest pusty')
        return redirect(url_for('cart'))
    
    # Pobierz elementy koszyka
    cart_items = OrderItem.query.filter_by(orderId=cart_order.id).all()
    
    cart_products = []
    for item in cart_items:
        product = Product.query.get(item.productId)
        if product:
            cart_products.append({
                'id': product.id,
                'name': product.name,
                'price': float(item.sellPrice),
                'old_price': float(item.sellPrice) * 1.2 if product.id % 2 == 0 else None,
                'discount': 20 if product.id % 2 == 0 else None,
                'quantity': item.quantity,
                'total_price': float(item.totalSellPrice),
                'stock': product.stock,
                'image_url': '/static/img/products/placeholder.jpg',
            })
    
    # Oblicz wartości
    cart_total = float(cart_order.totalPrice)
    shipping_cost = 15 if cart_total < 200 and cart_total > 0 else 0
    total_with_shipping = cart_total + shipping_cost
    
    return render_template('checkout.html', 
                          cart_products=cart_products, 
                          cart_total=cart_total, 
                          shipping_cost=shipping_cost,
                          total_with_shipping=total_with_shipping)

app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=30)

@app.before_request
def make_session_permanent():
    session.permanent = True

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

if __name__ == '__main__':
    os.makedirs('static/img/products', exist_ok=True)
    os.makedirs('static/img/categories', exist_ok=True)
    
    # Uruchomienie aplikacji w trybie debug
    app.run(debug=True)