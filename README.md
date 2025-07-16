# Sklep-internetowy-dla-firmy-budowlanej

Imitacja sklepu internetowego dla firmy budowlanej. Projekt webowy napisany w Pythonie z wykorzystaniem MySQL jako lokalnej bazy danych oraz standardowych technologii frontendowych (HTML, CSS, JavaScript).

---

## ✅ Wymagania

Aby uruchomić projekt lokalnie, upewnij się, że masz zainstalowane następujące komponenty:

* Python (>= 3.8)
* MySQL (z uruchomionym serwerem lokalnym)
* Pip (menedżer pakietów Pythona)

---

## 📦 Instalacja zależności

1. Sklonuj repozytorium:

   ```bash
   git clone <adres_repozytorium>
   cd Sklep-internetowy-dla-firmy-budowlanej
   ```

2. Zainstaluj wymagane pakiety:

   ```bash
   pip install -r requirements.txt
   ```

---

## 🛢️ Konfiguracja bazy danych

Projekt wykorzystuje **lokalną bazę MySQL** o nazwie `patobud`. Połączenie skonfigurowane jest w pliku `settings.json`. Poniżej szczegóły:

```
Host:      localhost  
Port:      3306  
Użytkownik: root  
Hasło:     root  
Baza danych: patobud
```

Fragment z pliku `settings.json`:

```json
{
    "server": "localhost",
    "port": 3306,
    "driver": "MySQL",
    "name": "patobud",
    "database": "patobud",
    "username": "root",
    "password": "root"
}
```

Upewnij się, że baza danych `patobud` została utworzona na Twoim lokalnym serwerze MySQL. Możesz to zrobić np. za pomocą narzędzia `MySQL Workbench` lub komendą SQL:

```sql
CREATE DATABASE patobud;
```

---

## 🚀 Uruchamianie projektu

Po zainstalowaniu zależności i upewnieniu się, że baza danych działa:

1. Upewnij się, że serwer MySQL jest uruchomiony.
2. Uruchom plik główny projektu w Pythonie, np.:

   ```bash
   python main.py
   ```
3. Otwórz plik HTML (np. `index.html`) w przeglądarce, jeśli interfejs uruchamiany jest lokalnie bez serwera HTTP.

---

## 📁 Użyte technologie

* Python
* MySQL
* HTML / CSS / JavaScript

---
