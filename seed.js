require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectMongo = require('./backend/config/mongodb');
const { sequelize, User, Category, Order, OrderItem, Payment } = require('./backend/models/pg/index');
const Product = require('./backend/models/mongo/Product');
const Review  = require('./backend/models/mongo/Review');

async function seed() {
  try {
    await connectMongo();
    await sequelize.authenticate();
    await sequelize.sync({ force: true }); // UWAGA: kasuje i tworzy tabele od nowa

    console.log('🌱 Seedowanie PostgreSQL...');

    // Użytkownicy
    const adminHash = await bcrypt.hash('admin123', 12);
    const userHash  = await bcrypt.hash('user123', 12);

    const admin = await User.create({ name: 'Administrator', email: 'admin@sklep.pl', password_hash: adminHash, role: 'admin' });
    const user1 = await User.create({ name: 'Jan Kowalski', email: 'jan@kowalski.pl', password_hash: userHash, role: 'customer' });
    const user2 = await User.create({ name: 'Anna Nowak', email: 'anna@nowak.pl', password_hash: userHash, role: 'customer' });

    // Kategorie
    const elektronika = await Category.create({ name: 'Elektronika', slug: 'elektronika' });
    const odziez      = await Category.create({ name: 'Odzież', slug: 'odziez' });
    const sport       = await Category.create({ name: 'Sport', slug: 'sport' });
    await Category.create({ name: 'Smartfony', slug: 'smartfony', parent_id: elektronika.id });
    await Category.create({ name: 'Laptopy', slug: 'laptopy', parent_id: elektronika.id });

    console.log('✅ PostgreSQL: użytkownicy i kategorie dodane');

    // Produkty do MongoDB
    console.log('🌱 Seedowanie MongoDB...');
    await Product.deleteMany({});
    await Review.deleteMany({});

    const products = await Product.insertMany([
      {
        name: 'Laptop ProBook X15',
        slug: 'laptop-probook-x15',
        description: 'Wydajny laptop do pracy i nauki z procesorem Intel Core i7.',
        price: 3499.99,
        stock: 15,
        category_id: elektronika.id,
        images: [],
        attributes: new Map([['Procesor','Intel i7'],['RAM','16GB'],['Dysk','512GB SSD'],['Ekran','15.6"']])
      },
      {
        name: 'Smartfon Galaxy Z20',
        slug: 'smartfon-galaxy-z20',
        description: 'Nowoczesny smartfon z aparatem 108 MP i ekranem AMOLED.',
        price: 2199.00,
        stock: 30,
        category_id: elektronika.id,
        images: [],
        attributes: new Map([['Aparat','108 MP'],['Bateria','5000 mAh'],['Ekran','6.7" AMOLED'],['5G','Tak']])
      },
      {
        name: 'Koszulka sportowa DryFit',
        slug: 'koszulka-sportowa-dryfit',
        description: 'Oddychająca koszulka z technologią odprowadzania wilgoci.',
        price: 89.99,
        stock: 100,
        category_id: odziez.id,
        images: [],
        attributes: new Map([['Materiał','Poliester 100%'],['Kolor','Czarny'],['Rozmiary','S, M, L, XL, XXL']])
      },
      {
        name: 'Buty do biegania AirRun 3',
        slug: 'buty-do-biegania-airrun-3',
        description: 'Lekkie buty biegowe z amortyzacją żelową i antypoślizgową podeszwą.',
        price: 349.00,
        stock: 45,
        category_id: sport.id,
        images: [],
        attributes: new Map([['Waga','280g'],['Podeszwa','Guma'],['Technologia','GelCushion']])
      },
      {
        name: 'Słuchawki BassMax Pro',
        slug: 'sluchawki-bassmax-pro',
        description: 'Bezprzewodowe słuchawki z redukcją szumów ANC i 30h baterii.',
        price: 599.00,
        stock: 20,
        category_id: elektronika.id,
        images: [],
        attributes: new Map([['Łączność','Bluetooth 5.3'],['Bateria','30h'],['ANC','Tak'],['Kolor','Biały']])
      },
      {
        name: 'Kurtka trekkingowa AlpineShell',
        slug: 'kurtka-trekkingowa-alpineshell',
        description: 'Wodoszczelna kurtka z membraną 20000mm słupa wody.',
        price: 499.00,
        stock: 25,
        category_id: sport.id,
        images: [],
        attributes: new Map([['Wodoszczelność','20000mm'],['Oddychalność','10000g/m²/24h'],['Rozmiary','S-XXXL']])
      },
      {
        name: 'Monitor UltraWide 34"',
        slug: 'monitor-ultrawide-34',
        description: 'Monitor zakrzywiony 21:9 z czasem reakcji 1ms i 144Hz.',
        price: 1899.00,
        stock: 8,
        category_id: elektronika.id,
        images: [],
        attributes: new Map([['Rozdzielczość','3440x1440'],['Odśw.','144Hz'],['Panel','IPS'],['Krzywizna','1800R']])
      },
      {
        name: 'Plecak trekkingowy 45L',
        slug: 'plecak-trekkingowy-45l',
        description: 'Ergonomiczny plecak górski z systemem wentylacji pleców.',
        price: 279.00,
        stock: 35,
        category_id: sport.id,
        images: [],
        attributes: new Map([['Pojemność','45L'],['Waga','1.4kg'],['Wodoodporność','Tak']])
      }
    ]);

    // Recenzje
    await Review.insertMany([
      { product_id: products[0]._id, user_id: user1.id, user_name: 'Jan Kowalski', rating: 5, body: 'Świetny laptop, szybki i cichy. Polecam!' },
      { product_id: products[0]._id, user_id: user2.id, user_name: 'Anna Nowak', rating: 4, body: 'Dobry sprzęt, bateria mogłaby dłużej wytrzymać.' },
      { product_id: products[1]._id, user_id: user1.id, user_name: 'Jan Kowalski', rating: 5, body: 'Aparat robi niesamowite zdjęcia!' },
      { product_id: products[4]._id, user_id: user2.id, user_name: 'Anna Nowak', rating: 5, body: 'Redukcja szumów działa rewelacyjnie.' },
    ]);

    // Przykładowe zamówienie
    const order = await Order.create({
      user_id: user1.id,
      status: 'delivered',
      total: 3788.98,
      shipping_address: 'ul. Kwiatowa 5, 00-001 Warszawa'
    });
    await OrderItem.bulkCreate([
      { order_id: order.id, product_id: String(products[0]._id), product_name: products[0].name, quantity: 1, unit_price: 3499.99 },
      { order_id: order.id, product_id: String(products[2]._id), product_name: products[2].name, quantity: 1, unit_price: 89.99 }
    ]);
    await Payment.create({
      order_id: order.id, method: 'card', amount: 3788.98,
      status: 'completed', paid_at: new Date()
    });

    console.log('\n✅ Seed zakończony pomyślnie!\n');
    console.log('👤 Konta testowe:');
    console.log('   Admin:   admin@sklep.pl  / admin123');
    console.log('   Klient:  jan@kowalski.pl / user123\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Błąd seedowania:', err);
    process.exit(1);
  }
}

seed();
