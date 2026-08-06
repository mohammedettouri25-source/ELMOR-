-- ============================================================================
-- BASE DE DONNÉES MYSQL — ELMORÉ STOCK MANAGEMENT & STOREFRONT
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `elmore` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `elmore`;

-- 1. Table des Entrepôts / Magasins
CREATE TABLE IF NOT EXISTS `warehouses` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `code` VARCHAR(50) NOT NULL UNIQUE,
  `location` VARCHAR(255) DEFAULT NULL,
  `is_default` BOOLEAN DEFAULT FALSE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Table des Fournisseurs
CREATE TABLE IF NOT EXISTS `suppliers` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `company` VARCHAR(150) DEFAULT NULL,
  `phone` VARCHAR(50) DEFAULT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Table des Produits Principal
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `sku` VARCHAR(100) NOT NULL UNIQUE,
  `barcode` VARCHAR(100) DEFAULT NULL,
  `category` VARCHAR(100) DEFAULT 'Montres & Horlogerie',
  `brand` VARCHAR(100) DEFAULT 'ELMORÉ',
  `supplier_id` VARCHAR(50) DEFAULT NULL,
  `image` TEXT DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `purchase_price` DECIMAL(10,2) DEFAULT 0.00,
  `price` DECIMAL(10,2) DEFAULT 0.00,
  `average_cost` DECIMAL(10,2) DEFAULT 0.00,
  `min_stock` INT DEFAULT 5,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Table des Variantes Produits (Couleur, Taille, Matière, Stock)
CREATE TABLE IF NOT EXISTS `product_variants` (
  `id` VARCHAR(50) PRIMARY KEY,
  `product_id` VARCHAR(50) NOT NULL,
  `color` VARCHAR(50) DEFAULT NULL,
  `size` VARCHAR(50) DEFAULT NULL,
  `material` VARCHAR(100) DEFAULT 'Acier Inoxydable',
  `packaging` VARCHAR(50) DEFAULT 'stdbox',
  `sku` VARCHAR(100) NOT NULL UNIQUE,
  `barcode` VARCHAR(100) DEFAULT NULL,
  `stock` INT DEFAULT 0,
  `min_stock` INT DEFAULT 5,
  `purchase_price` DECIMAL(10,2) DEFAULT 0.00,
  `price` DECIMAL(10,2) DEFAULT 0.00,
  `average_cost` DECIMAL(10,2) DEFAULT 0.00,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Table des Commandes & Ventes
CREATE TABLE IF NOT EXISTS `sales_orders` (
  `id` VARCHAR(50) PRIMARY KEY,
  `order_number` VARCHAR(100) NOT NULL UNIQUE,
  `customer_name` VARCHAR(150) NOT NULL,
  `customer_phone` VARCHAR(50) DEFAULT NULL,
  `customer_city` VARCHAR(100) DEFAULT 'Casablanca',
  `customer_address` TEXT DEFAULT NULL,
  `customer_notes` TEXT DEFAULT NULL,
  `payment_method` VARCHAR(100) DEFAULT 'Paiement à la Livraison (COD)',
  `total_amount` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('En attente', 'Confirmée', 'Expédiée', 'Livrée', 'Annulée') DEFAULT 'En attente',
  `cancelled` BOOLEAN DEFAULT FALSE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Table des Articles de Commande (Order Items)
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` VARCHAR(50) NOT NULL,
  `product_id` VARCHAR(50) NOT NULL,
  `variant_id` VARCHAR(50) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `variant_name` VARCHAR(150) DEFAULT NULL,
  `packaging` VARCHAR(100) DEFAULT 'Sans Boîte',
  `quantity` INT NOT NULL DEFAULT 1,
  `price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `purchase_price` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `subtotal` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  FOREIGN KEY (`order_id`) REFERENCES `sales_orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Table Historique / Audit Trail des Mouvements de Stock
CREATE TABLE IF NOT EXISTS `stock_movements` (
  `id` VARCHAR(50) PRIMARY KEY,
  `product_id` VARCHAR(50) NOT NULL,
  `variant_id` VARCHAR(50) NOT NULL,
  `product_name` VARCHAR(255) NOT NULL,
  `variant_name` VARCHAR(150) DEFAULT NULL,
  `type` VARCHAR(50) NOT NULL,
  `quantity` INT NOT NULL,
  `prev_quantity` INT NOT NULL,
  `new_quantity` INT NOT NULL,
  `warehouse_id` VARCHAR(50) DEFAULT 'wh-main',
  `user_name` VARCHAR(100) DEFAULT 'Admin',
  `reason` TEXT DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- VUES MYSQL OPTIMISÉES POUR RAPPORTS & ANALYTICS
-- ============================================================================

CREATE OR REPLACE VIEW `v_product_stock_summary` AS
SELECT 
  p.id AS product_id,
  p.name AS product_name,
  p.sku AS product_sku,
  p.category,
  p.brand,
  p.price,
  COUNT(v.id) AS total_variants,
  COALESCE(SUM(v.stock), 0) AS total_stock,
  COALESCE(SUM(v.stock * p.purchase_price), 0) AS stock_value_mad
FROM `products` p
LEFT JOIN `product_variants` v ON p.id = v.product_id
GROUP BY p.id;

CREATE OR REPLACE VIEW `v_daily_sales_report` AS
SELECT 
  DATE(created_at) AS sale_date,
  COUNT(id) AS total_orders,
  SUM(total_amount) AS revenue_mad
FROM `sales_orders`
WHERE cancelled = FALSE
GROUP BY DATE(created_at);

-- ============================================================================
-- SEED DATA INITIAL
-- ============================================================================

INSERT INTO `warehouses` (`id`, `name`, `code`, `location`, `is_default`) VALUES
('wh-main', 'Entrepôt Principal (Casablanca)', 'WH-MAIN', 'Casablanca Anfa', 1),
('wh-safi', 'Magasin Safi Center', 'STORE-SAFI', 'Safi Ville', 0),
('wh-casa', 'Magasin Casablanca Maârif', 'STORE-CASA', 'Casablanca Maârif', 0)
ON DUPLICATE KEY UPDATE `name`=`name`;

INSERT INTO `suppliers` (`id`, `name`, `company`, `phone`, `email`) VALUES
('sup-1', 'Swiss Chrono Luxury', 'Swiss Timepieces SA', '+212 661-889900', 'contact@swisstime.ch'),
('sup-2', 'Maroc Apparel Factory', 'Textile Casa SARL', '+212 522-334455', 'sales@textilecasa.ma')
ON DUPLICATE KEY UPDATE `name`=`name`;

INSERT INTO `products` (`id`, `name`, `sku`, `barcode`, `category`, `brand`, `supplier_id`, `image`, `description`, `purchase_price`, `price`, `min_stock`) VALUES
('prd-watch-a', 'Montre ELMORÉ Chrono Automatic A', 'WTC-CHRONO-A', '38009911001', 'Montres & Horlogerie', 'ELMORÉ', 'sup-1', '/hero.png', 'Montre chronographe automatique de haute précision. Boîtier en acier inoxydable 316L, mouvement suisse squelette et verre saphir inrayable.', 1200.00, 2490.00, 10),
('prd-jacket-b', 'Veste Cuir Lambskin ELMORÉ Classic', 'JKT-LAMB-01', '38009922002', 'Vêtements Cuir', 'ELMORÉ Leather', 'sup-2', '/hero.png', 'Veste en cuir véritable d\'agneau sur-mesure avec doublure satinée et fermetures éclair YKK.', 650.00, 1490.00, 8)
ON DUPLICATE KEY UPDATE `name`=`name`;

INSERT INTO `product_variants` (`id`, `product_id`, `color`, `size`, `material`, `packaging`, `sku`, `barcode`, `stock`, `min_stock`, `purchase_price`, `price`) VALUES
('v-101', 'prd-watch-a', 'Gold', '40mm', 'Acier Doré 18K', 'stdbox', 'WTC-GOLD-40', '38009911001-G40', 12, 5, 1200.00, 2490.00),
('v-102', 'prd-watch-a', 'Gold', '42mm', 'Acier Doré 18K', 'luxe', 'WTC-GOLD-42', '38009911001-G42', 8, 5, 1200.00, 2490.00),
('v-103', 'prd-watch-a', 'Black', '40mm', 'Acier Noir Mat', 'nobox', 'WTC-BLK-40', '38009911001-B40', 20, 5, 1150.00, 2390.00),
('v-104', 'prd-watch-a', 'Silver', '42mm', 'Acier Argenté', 'stdbox', 'WTC-SLV-42', '38009911001-S42', 4, 6, 1100.00, 2290.00),
('v-201', 'prd-jacket-b', 'Noir', 'M', 'Cuir d\'agneau', 'nobox', 'JKT-BLK-M', '38009922002-BM', 15, 4, 650.00, 1490.00),
('v-202', 'prd-jacket-b', 'Noir', 'L', 'Cuir d\'agneau', 'stdbox', 'JKT-BLK-L', '38009922002-BL', 3, 5, 650.00, 1490.00)
ON DUPLICATE KEY UPDATE `sku`=`sku`;
