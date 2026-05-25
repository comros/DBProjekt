# BDShop — Projekt zaliczeniowy
## E-commerce: Node.js + PostgreSQL + MongoDB

---

## WYMAGANIA (zainstaluj przed uruchomieniem)

- Node.js >= 18  →  https://nodejs.org
- PostgreSQL >= 14  →  https://www.postgresql.org/download/
- MongoDB Community >= 7  →  https://www.mongodb.com/try/download/community

---

## KROK 1 — Utwórz bazę PostgreSQL

Otwórz terminal i wpisz:

```
psql -U postgres
```

Następnie w konsoli psql:

```sql
CREATE DATABASE ecommerce_db;
\q
```

---

## KROK 2 — Upewnij się że MongoDB działa

MongoDB powinno działać jako serwis systemowy. Sprawdź:

Windows:
```
net start MongoDB
```

macOS/Linux:
```
sudo systemctl start mongod
```

lub po prostu:
```
mongod --version
```

---

## KROK 3 — Skonfiguruj plik .env

Otwórz plik `.env` i zmień:

```
DB_PASSWORD=twoje_haslo_tutaj   ← wpisz hasło do PostgreSQL
```

Reszta działa domyślnie (localhost, porty standardowe).

---

## KROK 4 — Zainstaluj zależności Node.js

W terminalu, w folderze projektu:

```
npm install
```

---

## KROK 5 — Uruchom seed (wypełni obie bazy danymi testowymi)

```
node seed.js
```

Zostaniesz poinformowany:
- ✅ Tabele PostgreSQL stworzone i wypełnione
- ✅ Produkty i recenzje dodane do MongoDB

Konta testowe:
- Admin:  admin@sklep.pl  / admin123
- Klient: jan@kowalski.pl / user123

> ⚠️  seed.js używa `force: true` — kasuje i tworzy tabele od nowa.
> Uruchamiaj tylko raz lub gdy chcesz zresetować bazę.

---

## KROK 6 — Uruchom serwer

Tryb deweloperski (auto-restart po zmianach):
```
npm run dev
```

Lub normalnie:
```
npm start
```

Otwórz przeglądarkę:
- Sklep:        http://localhost:3000
- Panel admina: http://localhost:3000/admin

---

## STRUKTURA PROJEKTU

```
ecommerce-projekt/
├── server.js               ← punkt wejścia
├── seed.js                 ← skrypt wypełniający bazy
├── .env                    ← konfiguracja (uzupełnij hasło!)
├── package.json
│
├── backend/
│   ├── config/
│   │   ├── postgres.js     ← połączenie Sequelize
│   │   └── mongodb.js      ← połączenie Mongoose
│   │
│   ├── models/
│   │   ├── pg/             ← modele PostgreSQL (Sequelize)
│   │   │   ├── User.js
│   │   │   ├── Address.js
│   │   │   ├── Category.js
│   │   │   ├── Order.js
│   │   │   ├── OrderItem.js
│   │   │   ├── Payment.js
│   │   │   └── index.js    ← relacje między tabelami
│   │   │
│   │   └── mongo/          ← modele MongoDB (Mongoose)
│   │       ├── Product.js
│   │       ├── Review.js
│   │       └── ActivityLog.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── shopController.js
│   │   ├── orderController.js
│   │   └── adminController.js
│   │
│   ├── middleware/
│   │   ├── auth.js         ← requireLogin, requireAdmin, loadUser
│   │   └── logger.js       ← zapis logów do MongoDB
│   │
│   └── routes/
│       ├── auth.js
│       ├── shop.js
│       ├── orders.js
│       └── admin.js
│
└── frontend/
    ├── views/              ← szablony EJS
    │   ├── partials/
    │   │   ├── header.ejs
    │   │   └── footer.ejs
    │   ├── auth/
    │   │   ├── login.ejs
    │   │   └── register.ejs
    │   ├── shop/
    │   │   ├── home.ejs
    │   │   ├── products.ejs
    │   │   ├── product.ejs
    │   │   ├── cart.ejs
    │   │   ├── checkout.ejs
    │   │   ├── orders.ejs
    │   │   └── order-detail.ejs
    │   ├── admin/
    │   │   ├── admin-nav.ejs
    │   │   ├── dashboard.ejs
    │   │   ├── products.ejs
    │   │   ├── product-form.ejs
    │   │   ├── orders.ejs
    │   │   ├── categories.ejs
    │   │   └── logs.ejs
    │   └── error.ejs
    │
    └── public/
        ├── css/style.css
        ├── js/main.js
        └── images/         ← tu trafiają zdjęcia produktów
```

---

## BAZY DANYCH — SCHEMAT

### PostgreSQL (6 tabel)
- users        — konta użytkowników i administratorów
- addresses    — adresy dostawy (FK → users)
- categories   — kategorie produktów z drzewem (self-FK)
- orders       — zamówienia (FK → users)
- order_items  — pozycje w zamówieniu (FK → orders)
- payments     — płatności za zamówienie (FK → orders)

### MongoDB (3 kolekcje)
- products     — produkty z elastycznymi atrybutami (np. RAM, kolor, rozmiar)
- reviews      — recenzje produktów z ocenami
- activity_logs — logi aktywności użytkowników

### Połączenie między bazami
- order_items.product_id przechowuje MongoDB ObjectId produktu
- reviews.user_id i activity_logs.user_id przechowują PostgreSQL user.id

---

## FUNKCJONALNOŚCI

### Panel klienta
- Rejestracja i logowanie (bcrypt + sesja)
- Przeglądanie produktów z filtrowaniem (kategoria, wyszukiwanie, sortowanie po cenie)
- Koszyk w sesji
- Składanie zamówień (transakcja PostgreSQL)
- Historia zamówień i ich szczegóły
- Dodawanie recenzji z oceną gwiazdkową

### Panel admina (/admin)
- Dashboard ze statystykami
- Dodawanie/edycja/ukrywanie produktów z dynamicznymi atrybutami
- Upload zdjęć
- Zarządzanie zamówieniami (zmiana statusu)
- Zarządzanie kategoriami
- Logi aktywności z MongoDB (ostatnie 100 zdarzeń)

---

## TYPOWE BŁĘDY

Problem: `password authentication failed for user "postgres"`
Rozwiązanie: Zmień DB_PASSWORD w pliku .env na swoje hasło PostgreSQL

Problem: `connect ECONNREFUSED 127.0.0.1:27017`
Rozwiązanie: Uruchom MongoDB — patrz Krok 2

Problem: `Cannot find module 'express'`
Rozwiązanie: Uruchom `npm install`

Problem: port 3000 zajęty
Rozwiązanie: Zmień PORT w .env na np. 3001
