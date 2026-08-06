/**
 * MySQL Database Connector & Persistence Handler for ELMORÉ
 * Supports local configuration with fallback to browser storage/API endpoints.
 */

export const mysqlConfig = {
  host: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MYSQL_HOST) || 'localhost',
  port: Number(typeof import.meta !== 'undefined' && import.meta.env?.VITE_MYSQL_PORT) || 3306,
  user: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MYSQL_USER) || 'root',
  password: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MYSQL_PASSWORD) || '',
  database: (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MYSQL_DATABASE) || 'elmore',
  connectionLimit: 10
}

/**
 * Format data object for MySQL INSERT / UPDATE statements
 */
export function formatSqlValue(val) {
  if (val === null || val === undefined) return 'NULL'
  if (typeof val === 'number' || typeof val === 'boolean') return val
  return `'${String(val).replace(/'/g, "''")}'`
}

/**
 * Generate MySQL Insert Statement for Products
 */
export function generateProductInsertSql(product) {
  const p = {
    id: product.id,
    name: product.name,
    sku: product.sku,
    barcode: product.barcode || '',
    category: product.category || 'Montres & Horlogerie',
    brand: product.brand || 'ELMORÉ',
    supplier_id: product.supplierId || null,
    image: product.image || '/hero.png',
    description: product.description || '',
    purchase_price: product.purchasePrice || 0,
    price: product.price || 0,
    min_stock: product.minStock || 5
  }

  return `INSERT INTO products (id, name, sku, barcode, category, brand, supplier_id, image, description, purchase_price, price, min_stock) 
VALUES (${formatSqlValue(p.id)}, ${formatSqlValue(p.name)}, ${formatSqlValue(p.sku)}, ${formatSqlValue(p.barcode)}, ${formatSqlValue(p.category)}, ${formatSqlValue(p.brand)}, ${formatSqlValue(p.supplier_id)}, ${formatSqlValue(p.image)}, ${formatSqlValue(p.description)}, ${p.purchase_price}, ${p.price}, ${p.min_stock})
ON DUPLICATE KEY UPDATE 
  name = VALUES(name),
  image = VALUES(image),
  description = VALUES(description),
  price = VALUES(price),
  purchase_price = VALUES(purchase_price);`
}

/**
 * Generate MySQL Insert Statement for Sales Orders
 */
export function generateSaleOrderInsertSql(sale) {
  return `INSERT INTO sales_orders (id, order_number, customer_name, customer_phone, customer_city, customer_address, customer_notes, payment_method, total_amount, status)
VALUES (${formatSqlValue(sale.id)}, ${formatSqlValue(sale.orderNumber)}, ${formatSqlValue(sale.customerName)}, ${formatSqlValue(sale.customerPhone)}, ${formatSqlValue(sale.customerCity)}, ${formatSqlValue(sale.customerAddress)}, ${formatSqlValue(sale.customerNotes)}, ${formatSqlValue(sale.paymentMethod)}, ${sale.totalAmount}, ${formatSqlValue(sale.status || 'En attente')});`
}
