# app.py
from flask import Flask, render_template, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
from werkzeug.security import generate_password_hash, check_password_hash
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user




class Config:
    SQLALCHEMY_DATABASE_URI = 'mysql+mysqlconnector://root:rootroot@localhost/patobud'
    #'mysql+mysqlconnector://(nazwa_uzytkownika, najczesciej 'root'):(haslo do mysql)@localhost/patobud'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SECRET_KEY = 'your-secret-key-here'
# Inicjalizacja aplikacji
app = Flask(__name__)
# app.config['SECRET_KEY'] = 'twoj_tajny_klucz'
# app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///budowmax.db'
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config.from_object(Config)
# # Inicjalizacja bazy danych
db = SQLAlchemy(app)

# # Inicjalizacja logowania
# login_manager = LoginManager()
# login_manager.init_app(app)
# login_manager.login_view = 'login'

# W przyszłości tutaj będą modele danych
# class User, class Product, class Category, class Order, etc.

# Tymczasowe dane demonstracyjne
def get_demo_products():
    return [
        {
            'id': 1,
            'name': 'Wiertarka udarowa BOSCH GSB 18V-55',
            'price': 479,
            'old_price': 599,
            'discount': 20,
            'rating': 4.2,
            'reviews_count': 24,
            'image_url': '/static/img/products/placeholder.jpg',
            'is_bestseller': True,
            'is_new': False
        },
        {
            'id': 2,
            'name': 'Szlifierka kątowa MAKITA GA5030R',
            'price': 382,
            'old_price': 449,
            'discount': 15,
            'rating': 4.5,
            'reviews_count': 36,
            'image_url': '/static/img/products/placeholder.jpg',
            'is_bestseller': False,
            'is_new': True
        },
        {
            'id': 3,
            'name': 'Zestaw kluczy STANLEY 94-184-1',
            'price': 224,
            'old_price': 320,
            'discount': 30,
            'rating': 5.0,
            'reviews_count': 52,
            'image_url': '/static/img/products/placeholder.jpg',
            'is_bestseller': True,
            'is_new': False
        },
        {
            'id': 4,
            'name': 'Farba lateksowa DULUX 10L biała',
            'price': 189,
            'old_price': 210,
            'discount': 10,
            'rating': 4.0,
            'reviews_count': 18,
            'image_url': '/static/img/products/placeholder.jpg',
            'is_bestseller': False,
            'is_new': False
        }
    ]

def get_demo_categories():
    return [
        {
            'id': 1,
            'name': 'Narzędzia',
            'description': 'Profesjonalne narzędzia dla każdego',
            'image_url': '/static/img/categories/placeholder.jpg',
            'product_count': 230,
            'subcategories': [
                {
                    'id': 11,
                    'name': 'Elektronarzędzia',
                    'image_url': '/static/img/categories/placeholder.jpg',
                    'product_count': 120
                },
                {
                    'id': 12,
                    'name': 'Narzędzia ręczne',
                    'image_url': '/static/img/categories/placeholder.jpg',
                    'product_count': 85
                },
                {
                    'id': 13,
                    'name': 'Narzędzia pomiarowe',
                    'image_url': '/static/img/categories/placeholder.jpg',
                    'product_count': 25
                }
            ]
        },
        {
            'id': 2,
            'name': 'Materiały budowlane',
            'description': 'Wysokiej jakości materiały konstrukcyjne',
            'image_url': '/static/img/categories/placeholder.jpg',
            'product_count': 180,
            'subcategories': [
                {
                    'id': 21,
                    'name': 'Cement i zaprawy',
                    'image_url': '/static/img/categories/placeholder.jpg',
                    'product_count': 45
                },
                {
                    'id': 22,
                    'name': 'Cegły i bloczki',
                    'image_url': '/static/img/categories/placeholder.jpg',
                    'product_count': 35
                },
                {
                    'id': 23,
                    'name': 'Izolacje',
                    'image_url': '/static/img/categories/placeholder.jpg',
                    'product_count': 50
                },
                {
                    'id': 24,
                    'name': 'Sucha zabudowa',
                    'image_url': '/static/img/categories/placeholder.jpg',
                    'product_count': 50
                }
            ]
        },
        {
            'id': 3,
            'name': 'Wykończenie',
            'description': 'Wszystko do wykończenia wnętrz',
            'image_url': '/static/img/categories/placeholder.jpg',
            'product_count': 310,
            'subcategories': [
                {
                    'id': 31,
                    'name': 'Farby i lakiery',
                    'image_url': '/static/img/categories/placeholder.jpg',
                    'product_count': 120
                },
                {
                    'id': 32,
                    'name': 'Płytki i podłogi',
                    'image_url': '/static/img/categories/placeholder.jpg',
                    'product_count': 90
                },
                {
                    'id': 33,
                    'name': 'Tapety i dekoracje',
                    'image_url': '/static/img/categories/placeholder.jpg',
                    'product_count': 60
                },
                {
                    'id': 34,
                    'name': 'Armatura łazienkowa',
                    'image_url': '/static/img/categories/placeholder.jpg',
                    'product_count': 40
                }
            ]
        }
    ]

def get_demo_brands():
    return [
        {
            'id': 1,
            'name': 'BOSCH',
            'logo_url': '/static/img/brands/placeholder.jpg',
            'product_count': 124
        },
        {
            'id': 2,
            'name': 'MAKITA',
            'logo_url': '/static/img/brands/placeholder.jpg',
            'product_count': 98
        },
        {
            'id': 3,
            'name': 'DEWALT',
            'logo_url': '/static/img/brands/placeholder.jpg',
            'product_count': 85
        },
        {
            'id': 4,
            'name': 'STANLEY',
            'logo_url': '/static/img/brands/placeholder.jpg',
            'product_count': 76
        },
        {
            'id': 5,
            'name': 'DULUX',
            'logo_url': '/static/img/brands/placeholder.jpg',
            'product_count': 52
        },
        {
            'id': 6,
            'name': 'ATLAS',
            'logo_url': '/static/img/brands/placeholder.jpg',
            'product_count': 67
        }
    ]

def get_product_details(product_id):
    # Pobieranie szczegółów produktu dla danego ID
    # W przyszłości to będzie obsługiwane przez bazę danych
    products = get_demo_products()
    for product in products:
        if product['id'] == product_id:
            # Dodatkowe dane dla strony produktu
            product['short_description'] = 'Profesjonalna wiertarka udarowa do użytku domowego i profesjonalnego.'
            product['description'] = '<p>Wiertarka udarowa BOSCH GSB 18V-55 to narzędzie doskonałe dla majsterkowiczów i profesjonalistów. Oferuje wysoką wydajność pracy oraz komfort użytkowania dzięki ergonomicznej konstrukcji.</p><p>Urządzenie jest wyposażone w silnik bezszczotkowy, który zapewnia wydajniejszą pracę i dłuższą żywotność narzędzia. Akumulator 18V zapewnia długi czas pracy bez konieczności ciągłego ładowania.</p>'
            product['code'] = 'GSB1855-2'
            product['availability'] = 'in_stock'
            product['delivery_time'] = 1
            product['delivery_cost'] = 15
            product['stock'] = 24
            product['brand'] = {'id': 1, 'name': 'BOSCH'}
            product['category'] = {'id': 11, 'name': 'Elektronarzędzia'}
            product['images'] = [
                '/static/img/products/placeholder.jpg',
                '/static/img/products/placeholder.jpg',
                '/static/img/products/placeholder.jpg'
            ]
            product['specifications'] = [
                {
                    'name': 'Parametry techniczne',
                    'specs': [
                        {'name': 'Napięcie akumulatora', 'value': '18V'},
                        {'name': 'Maksymalny moment obrotowy', 'value': '55 Nm'},
                        {'name': 'Prędkość obrotowa', 'value': '0-500/0-1900 obr./min'}
                    ]
                },
                {
                    'name': 'Wyposażenie',
                    'specs': [
                        {'name': 'Akumulatory w komplecie', 'value': '2 szt.'},
                        {'name': 'Ładowarka', 'value': 'Tak'},
                        {'name': 'Walizka transportowa', 'value': 'Tak'}
                    ]
                }
            ]
            product['reviews'] = [
                {
                    'id': 1,
                    'author': 'Jan Kowalski',
                    'date': datetime(2024, 3, 15),
                    'rating': 5,
                    'title': 'Świetna wiertarka!',
                    'content': 'Używam już od miesiąca i jestem bardzo zadowolony. Wiertarka jest lekka, ma dużą moc i długi czas pracy na baterii.',
                    'pros': ['Lekka', 'Mocna', 'Długi czas pracy'],
                    'cons': ['Dość głośna'],
                    'helpful_yes': 12,
                    'helpful_no': 2
                },
                {
                    'id': 2,
                    'author': 'Anna Nowak',
                    'date': datetime(2024, 2, 28),
                    'rating': 4,
                    'title': 'Dobra, ale głośna',
                    'content': 'Wiertarka działa bardzo dobrze, tylko trochę za głośno. Poza tym jest wygodna i ma dobrą baterię.',
                    'pros': ['Wygodna', 'Dobra bateria'],
                    'cons': ['Głośna', 'Dość ciężka'],
                    'helpful_yes': 8,
                    'helpful_no': 1
                }
            ]
            product['rating_distribution'] = {
                5: 70,
                4: 20,
                3: 5,
                2: 3,
                1: 2
            }
            product['ratings_count'] = {
                5: 17,
                4: 5,
                3: 1,
                2: 1,
                1: 0
            }
            
            return product
    
    return None

def get_category_details(category_id):
    # Pobieranie szczegółów kategorii dla danego ID
    # W przyszłości to będzie obsługiwane przez bazę danych
    categories = get_demo_categories()
    for category in categories:
        if category['id'] == category_id:
            return category
        for subcategory in category['subcategories']:
            if subcategory['id'] == category_id:
                subcategory['description'] = f"Przeglądaj produkty z kategorii {subcategory['name']}"
                return subcategory
    
    return None

# Routy
@app.route('/')
def index():
    products = get_demo_products()
    categories = get_demo_categories()
    return render_template('index.html', products=products, categories=categories)

@app.route('/categories')
def categories():
    parent_categories = get_demo_categories()
    popular_brands = get_demo_brands()
    return render_template('categories.html', parent_categories=parent_categories, popular_brands=popular_brands)

@app.route('/category/<int:category_id>')
def category(category_id):
    category = get_category_details(category_id)
    if not category:
        # 404 obsługa
        return "Kategoria nie znaleziona", 404
    
    # Symulacja produktów w kategorii
    products = get_demo_products()
    
    # Symulacja marek (do filtrów)
    brands = get_demo_brands()
    
    # Symulacja paginacji
    class Pagination:
        def __init__(self):
            self.page = int(request.args.get('page', 1))
            self.per_page = 12
            self.total = 48
            self.pages = (self.total + self.per_page - 1) // self.per_page
            self.has_prev = self.page > 1
            self.has_next = self.page < self.pages
            self.prev_page = self.page - 1 if self.has_prev else None
            self.next_page = self.page + 1 if self.has_next else None
        
        def iter_pages(self):
            return [1, 2, 3, 4, None]  # Symulacja stron
    
    pagination = Pagination()
    
    return render_template('category.html', category=category, products=products, brands=brands, pagination=pagination)

@app.route('/product/<int:product_id>')
def product(product_id):
    product = get_product_details(product_id)
    if not product:
        # 404 obsługa
        return "Produkt nie znaleziony", 404
    
    # Symulacja powiązanych produktów
    related_products = get_demo_products()
    
    # Symulacja paginacji dla opinii
    class ReviewsPagination:
        def __init__(self):
            self.page = int(request.args.get('reviews_page', 1))
            self.per_page = 5
            self.total = len(product['reviews'])
            self.pages = (self.total + self.per_page - 1) // self.per_page
            self.has_prev = self.page > 1
            self.has_next = self.page < self.pages
            self.prev_page = self.page - 1 if self.has_prev else None
            self.next_page = self.page + 1 if self.has_next else None
        
        def iter_pages(self):
            return [1]  # Symulacja stron
    
    reviews_pagination = ReviewsPagination()
    
    return render_template('product.html', product=product, related_products=related_products, reviews_pagination=reviews_pagination)

@app.route('/brand/<int:brand_id>')
def brand(brand_id):
    brands = get_demo_brands()
    for brand in brands:
        if brand['id'] == brand_id:
            return "Strona marki " + brand['name'] + " (do zaimplementowania)"
    
    return "Marka nie znaleziona", 404

@app.errorhandler(404)
def page_not_found(e):
    return "Strona nie znaleziona (404) - do zaimplementowania", 404

# W przyszłości będzie więcej routów: logowanie, rejestracja, koszyk, zamówienia, itp.

if __name__ == '__main__':
    os.makedirs('static/img/products', exist_ok=True)
    os.makedirs('static/img/categories', exist_ok=True)
    os.makedirs('static/img/brands', exist_ok=True)
    
    # Uruchomienie aplikacji w trybie debug
    app.run(debug=True)