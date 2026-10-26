export async function initializeDatabase(db) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_name TEXT NOT NULL,
      brand TEXT NOT NULL,
      category TEXT NOT NULL,
      cpu TEXT NOT NULL,
      ram INTEGER NOT NULL,
      storage INTEGER NOT NULL,
      price REAL NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      sold_quantity INTEGER NOT NULL DEFAULT 0,
      is_featured INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS products_name_idx
      ON products(product_name COLLATE NOCASE);
    CREATE INDEX IF NOT EXISTS products_category_idx ON products(category);
  `);

  const version = await db.getFirstAsync('PRAGMA user_version');
  if (version.user_version >= 1) {
    return;
  }

  const result = await db.getFirstAsync('SELECT COUNT(*) AS count FROM products');
  if (result.count === 0) {
    const examples = [
      ['MacBook Pro M3', 'Apple', 'Laptop', 'Apple M3', 16, 512, 1800, 10, 30, 1],
      ['Dell XPS 13', 'Dell', 'Laptop', 'Intel Core i7', 16, 512, 1500, 8, 20, 1],
      ['HP Pavilion', 'HP', 'Desktop', 'Intel Core i5', 8, 256, 800, 5, 15, 0],
      ['RTX 4060', 'Asus', 'Component', 'GeForce RTX 4060', 0, 0, 400, 3, 50, 1],
    ];

    for (const product of examples) {
      await db.runAsync(
        `INSERT INTO products
          (product_name, brand, category, cpu, ram, storage, price, stock, sold_quantity, is_featured)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ...product
      );
    }
  }

  await db.execAsync('PRAGMA user_version = 1');
}

export function getProducts(db) {
  return db.getAllAsync('SELECT * FROM products ORDER BY product_name COLLATE NOCASE');
}

export function getProductById(db, id) {
  return db.getFirstAsync('SELECT * FROM products WHERE id = ?', Number(id));
}

export async function getStatistics(db) {
  const totals = await db.getFirstAsync(`
    SELECT
      COUNT(*) AS total_products,
      COALESCE(SUM(price * sold_quantity), 0) AS revenue,
      COALESCE(SUM(sold_quantity), 0) AS total_sold,
      COALESCE(AVG(price), 0) AS average_price
    FROM products
  `);
  const categories = await db.getAllAsync(`
    SELECT category, COUNT(*) AS product_count,
      COALESCE(SUM(sold_quantity), 0) AS sold_quantity
    FROM products
    GROUP BY category
  `);
  const bestSeller = await db.getFirstAsync(`
    SELECT product_name, brand, sold_quantity
    FROM products
    ORDER BY sold_quantity DESC, product_name COLLATE NOCASE
    LIMIT 1
  `);
  const topBrand = await db.getFirstAsync(`
    SELECT brand, SUM(sold_quantity) AS sold_quantity
    FROM products
    GROUP BY brand
    ORDER BY sold_quantity DESC, brand COLLATE NOCASE
    LIMIT 1
  `);
  const lowStock = await db.getAllAsync(`
    SELECT id, product_name, brand, stock
    FROM products
    WHERE stock < 5
    ORDER BY stock ASC, product_name COLLATE NOCASE
  `);

  return { totals, categories, bestSeller, topBrand, lowStock };
}

export async function getFeaturedStatistics(db) {
  const totals = await db.getFirstAsync(`
    SELECT
      COUNT(*) AS total_featured,
      COALESCE(SUM(price * sold_quantity), 0) AS revenue,
      COALESCE(SUM(sold_quantity), 0) AS total_sold
    FROM products
    WHERE is_featured = 1
  `);
  const categories = await db.getAllAsync(`
    SELECT category, COUNT(*) AS product_count,
      COALESCE(SUM(sold_quantity), 0) AS sold_quantity
    FROM products
    WHERE is_featured = 1
    GROUP BY category
  `);

  return { totals, categories };
}
