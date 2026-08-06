import { defineStore } from 'pinia'
import { db } from '../lib/db'

const uuid = () => 'id-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now().toString(36)

// Default Demo Data for Accessories (Plaqué Or 18K & Acier Inoxydable 316L < 200 DH)
const defaultWarehouses = [
  { id: 'wh-main', name: 'Entrepôt Principal (Casablanca)', code: 'WH-MAIN', location: 'Casablanca Anfa', isDefault: true },
  { id: 'wh-safi', name: 'Magasin Safi Center', code: 'STORE-SAFI', location: 'Safi Ville', isDefault: false },
  { id: 'wh-casa', name: 'Magasin Casablanca Maârif', code: 'STORE-CASA', location: 'Casablanca Maârif', isDefault: false }
]

const defaultSuppliers = [
  { id: 'sup-1', name: 'ELMORÉ Atelier Gold', company: 'Atelier Bijoux Casa SARL', phone: '+212 661-889900', email: 'atelier@elmore.ma' },
  { id: 'sup-2', name: 'Maroc Accessories Factory', company: 'Textile & Accessories SARL', phone: '+212 522-334455', email: 'sales@accessories.ma' }
]

// Packaging Options & Pricing (Chaque boîte a son prix adapté pour accessoires < 200 DH)
export const PACKAGING_OPTIONS = [
  { id: 'nobox', label: 'Sans Boîte (Pochette Velours Offerte)', extraPrice: 0, icon: '📦', note: 'Livré dans sa pochette en velours noire (0 DH)' },
  { id: 'stdbox', label: 'Avec Boîte Cadeau ELMORÉ', extraPrice: 25, icon: '🎁', note: 'Boîte cadeau élégante d\'origine ELMORÉ (+25 DH)' },
  { id: 'luxe', label: 'Avec Écrin Prestige Cadeau & Ruban', extraPrice: 45, icon: '👑', note: 'Écrin rigide cadeau avec ruban de soie (+45 DH)' }
]

const defaultProducts = [
  {
    id: 'prd-acc-femme-a',
    name: 'Collier Trèfle Élégance Acier Inoxydable',
    sku: 'NKL-TREFLE-316L',
    barcode: '38009911001',
    category: 'Accessoires Femmes',
    brand: 'ELMORÉ Jewelry',
    supplierId: 'sup-1',
    image: '/luxury_hero.png',
    description: 'Magnifique collier pendentif motif trèfle en acier inoxydable 316L. Résistant à l\'eau et au parfum.',
    purchasePrice: 35,
    price: 97,
    averageCost: 35,
    minStock: 10,
    variants: [
      { id: 'v-101', color: 'Doré', size: 'Standard', material: 'Acier Inoxydable 316L', packaging: 'nobox', sku: 'NKL-GOLD-ST', barcode: '38009911001-G', stock: 25, min: 5, purchasePrice: 35, price: 97 },
      { id: 'v-102', color: 'Argenté', size: 'Standard', material: 'Acier Inoxydable 316L', packaging: 'stdbox', sku: 'NKL-SLV-ST', barcode: '38009911001-S', stock: 18, min: 5, purchasePrice: 30, price: 89 }
    ]
  },
  {
    id: 'prd-acc-homme-b',
    name: 'Gourmette Homme Acier Inoxydable 316L',
    sku: 'BRC-HOMME-316L',
    barcode: '38009922002',
    category: 'Accessoires Hommes',
    brand: 'ELMORÉ Jewelry',
    supplierId: 'sup-1',
    image: '/hero.png',
    description: 'Gourmette masculine tressée en acier inoxydable 316L haute résistance. Ajustable.',
    purchasePrice: 45,
    price: 119,
    averageCost: 45,
    minStock: 8,
    variants: [
      { id: 'v-201', color: 'Argenté', size: 'Standard', material: 'Acier Inoxydable 316L', packaging: 'nobox', sku: 'BRC-SLV-ST', barcode: '38009922002-S', stock: 20, min: 4, purchasePrice: 45, price: 119 },
      { id: 'v-202', color: 'Noir Mat', size: 'Standard', material: 'Acier Noir 316L', packaging: 'stdbox', sku: 'BRC-BLK-ST', barcode: '38009922002-B', stock: 15, min: 4, purchasePrice: 45, price: 119 }
    ]
  },
  {
    id: 'prd-watch-femme-c',
    name: 'Montre ELMORÉ Élégance Femmes',
    sku: 'WTC-FEMME-01',
    barcode: '38009933003',
    category: 'Montres Femmes',
    brand: 'ELMORÉ Watches',
    supplierId: 'sup-1',
    image: '/luxury_hero.png',
    description: 'Montre féminine raffinée avec cadran nacre et bracelet en acier inoxydable 316L. Verre saphir.',
    purchasePrice: 65,
    price: 189,
    averageCost: 65,
    minStock: 10,
    variants: [
      { id: 'v-301', color: 'Doré', size: 'Standard', material: 'Acier Inoxydable 316L', packaging: 'stdbox', sku: 'WTC-FEM-GOLD', barcode: '38009933003-FG', stock: 18, min: 4, purchasePrice: 65, price: 189 },
      { id: 'v-302', color: 'Argenté', size: 'Standard', material: 'Acier Inoxydable 316L', packaging: 'nobox', sku: 'WTC-FEM-SLV', barcode: '38009933003-FS', stock: 12, min: 4, purchasePrice: 65, price: 189 }
    ]
  },
  {
    id: 'prd-watch-homme-d',
    name: 'Montre ELMORÉ Chrono Prestige Hommes',
    sku: 'WTC-HOMME-01',
    barcode: '38009944004',
    category: 'Montres Hommes',
    brand: 'ELMORÉ Watches',
    supplierId: 'sup-1',
    image: '/hero_fullwidth.png',
    description: 'Montre chronographe sportive masculine boîtier acier 316L et bracelet étanche. Résiste à l\'eau.',
    purchasePrice: 70,
    price: 199,
    averageCost: 70,
    minStock: 8,
    variants: [
      { id: 'v-401', color: 'Noir Mat', size: 'Standard', material: 'Acier Inoxydable 316L', packaging: 'luxe', sku: 'WTC-HOM-BLK', barcode: '38009944004-HB', stock: 15, min: 3, purchasePrice: 70, price: 199 },
      { id: 'v-402', color: 'Argenté', size: 'Standard', material: 'Acier Inoxydable 316L', packaging: 'stdbox', sku: 'WTC-HOM-SLV', barcode: '38009944004-HS', stock: 10, min: 3, purchasePrice: 70, price: 199 }
    ]
  }
]

const initialMovements = [
  { id: uuid(), productId: 'prd-acc-femme-a', variantId: 'v-101', productName: 'Collier Trèfle Élégance Acier Inoxydable', variantName: 'Doré · 45cm', type: 'Initial Stock', quantity: 25, prevQuantity: 0, newQuantity: 25, warehouseId: 'wh-main', user: 'Admin', reason: 'Initialisation du Stock', createdAt: new Date().toISOString() }
]

const getInitialProducts = () => {
  const saved = localStorage.getItem('elmore_products')
  if (!saved) return defaultProducts
  try {
    const parsed = JSON.parse(saved)
    const unique = []
    const map = new Map()
    for (const item of parsed) {
      if (item && item.id && !map.has(item.id)) {
        map.set(item.id, true)
        unique.push(item)
      }
    }
    return unique.length > 0 ? unique : defaultProducts
  } catch (e) {
    return defaultProducts
  }
}

export const useInventoryStore = defineStore('inventory', {
  state: () => ({
    products: getInitialProducts(),
    warehouses: JSON.parse(localStorage.getItem('elmore_warehouses')) || defaultWarehouses,
    suppliers: JSON.parse(localStorage.getItem('elmore_suppliers')) || defaultSuppliers,
    movements: JSON.parse(localStorage.getItem('elmore_movements')) || initialMovements,
    purchases: JSON.parse(localStorage.getItem('elmore_purchases')) || [],
    sales: JSON.parse(localStorage.getItem('elmore_sales')) || [],
    inventorySessions: JSON.parse(localStorage.getItem('elmore_sessions')) || [],
    cart: [],
    currentLang: localStorage.getItem('elmore_lang') || 'ar',
    activeTab: 'dashboard',
    selectedLandingProductId: 'prd-acc-femme-a',
    toast: null,
    searchQuery: ''
  }),

  getters: {
    selectedLandingProduct: s => s.products.find(p => p.id === s.selectedLandingProductId) || s.products[0],
    totalProductsCount: s => s.products.length,
    totalVariantsCount: s => s.products.reduce((sum, p) => sum + (p.variants || []).length, 0),
    inventoryValue: s => s.products.reduce((sum, p) => sum + (p.variants || []).reduce((vSum, v) => vSum + (Number(v.stock) || 0) * (Number(p.purchasePrice || v.purchasePrice) || 0), 0), 0),
    totalSalesRevenue: s => s.sales.reduce((sum, order) => sum + (order.cancelled ? 0 : Number(order.totalAmount) || 0), 0),
    totalProfit: s => s.sales.reduce((sum, order) => {
      if (order.cancelled) return sum
      const orderProfit = (order.items || []).reduce((iSum, item) => iSum + (item.subtotal - (item.purchasePrice * item.quantity)), 0)
      return sum + orderProfit
    }, 0),
    totalOrdersCount: s => s.sales.filter(s => !s.cancelled).length,
    cartTotalCount: s => s.cart.reduce((sum, i) => sum + i.quantity, 0),
    cartTotalPrice: s => s.cart.reduce((sum, i) => sum + (i.price * i.quantity), 0),

    todaySalesRevenue: s => {
      const todayStr = new Date().toISOString().slice(0, 10)
      return s.sales.reduce((sum, order) => {
        if (order.cancelled) return sum
        const orderDateStr = (order.createdAt || new Date().toISOString()).slice(0, 10)
        return orderDateStr === todayStr ? sum + (Number(order.totalAmount) || 0) : sum
      }, 0)
    },

    monthSalesRevenue: s => {
      const monthStr = new Date().toISOString().slice(0, 7)
      return s.sales.reduce((sum, order) => {
        if (order.cancelled) return sum
        const orderMonthStr = (order.createdAt || new Date().toISOString()).slice(0, 7)
        return orderMonthStr === monthStr ? sum + (Number(order.totalAmount) || 0) : sum
      }, 0)
    },

    lowStockList: s => {
      const list = []
      s.products.forEach(p => {
        (p.variants || []).forEach(v => {
          if (v.stock > 0 && v.stock <= (v.min || p.minStock || 5)) {
            list.push({
              productId: p.id,
              productName: p.name,
              variantId: v.id,
              variantName: v.color || 'Standard',
              sku: v.sku || p.sku,
              stock: v.stock,
              minStock: v.min || p.minStock || 5
            })
          }
        })
      })
      return list
    },

    outOfStockList: s => {
      const list = []
      s.products.forEach(p => {
        (p.variants || []).forEach(v => {
          if (v.stock <= 0) {
            list.push({
              productId: p.id,
              productName: p.name,
              variantId: v.id,
              variantName: v.color || 'Standard',
              sku: v.sku || p.sku,
              stock: 0,
              minStock: v.min || p.minStock || 5
            })
          }
        })
      })
      return list
    },

    lowStockVariants: s => {
      const list = []
      s.products.forEach(p => {
        (p.variants || []).forEach(v => {
          if (v.stock <= (v.min || p.minStock || 5)) {
            list.push({
              productId: p.id,
              productName: p.name,
              variantId: v.id,
              variantName: v.color || 'Standard',
              sku: v.sku || p.sku,
              stock: v.stock,
              minStock: v.min || p.minStock || 5
            })
          }
        })
      })
      return list
    },

    latestMovements: s => (s.movements || []).slice(0, 10)
  },

  actions: {
    notify(message, type = 'success') {
      this.toast = { message, type }
      setTimeout(() => { this.toast = null }, 3500)
    },

    saveToStorage() {
      localStorage.setItem('elmore_products', JSON.stringify(this.products))
      localStorage.setItem('elmore_warehouses', JSON.stringify(this.warehouses))
      localStorage.setItem('elmore_suppliers', JSON.stringify(this.suppliers))
      localStorage.setItem('elmore_movements', JSON.stringify(this.movements))
      localStorage.setItem('elmore_sales', JSON.stringify(this.sales))
      localStorage.setItem('elmore_purchases', JSON.stringify(this.purchases))
    },

    async recordMovement(movement) {
      const rec = {
        id: uuid(),
        createdAt: new Date().toISOString(),
        warehouseId: 'wh-main',
        user: 'Admin',
        ...movement
      }
      this.movements.unshift(rec)

      try {
        await db.query(
          `INSERT INTO stock_movements (id, product_id, variant_id, product_name, variant_name, type, quantity, prev_quantity, new_quantity, warehouse_id, user_name, reason, notes)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            rec.id,
            rec.productId,
            rec.variantId,
            rec.productName,
            rec.variantName || '',
            rec.type,
            rec.quantity,
            rec.prevQuantity,
            rec.newQuantity,
            rec.warehouseId,
            rec.user || 'Admin',
            rec.reason || '',
            rec.notes || ''
          ]
        )
      } catch (err) {
        console.warn('MySQL Offline mode - saved to local state only:', err.message)
      }

      this.saveToStorage()
      return rec
    },

    async saveProduct(productData) {
      const pIdx = this.products.findIndex(p => p.id === productData.id)
      const isNew = pIdx < 0

      const prod = {
        id: productData.id || `prd-${Date.now().toString(36)}`,
        name: productData.name,
        sku: productData.sku || `SKU-${Date.now().toString(36).toUpperCase()}`,
        barcode: productData.barcode || '',
        category: productData.category || 'Colliers & Pendentifs',
        brand: productData.brand || 'ELMORÉ Jewelry',
        supplierId: productData.supplierId || null,
        image: productData.image || '/hero.png',
        description: productData.description || '',
        purchasePrice: Number(productData.purchasePrice) || 0,
        price: Number(productData.price) || 0,
        averageCost: Number(productData.purchasePrice) || 0,
        minStock: Number(productData.minStock) || 5,
        variants: (productData.variants || []).map((v, idx) => ({
          id: v.id || `v-${Date.now().toString(36)}-${idx}`,
          color: v.color || 'Standard',
          size: v.size || 'Standard',
          material: v.material || 'Plaqué Or 18K',
          packaging: v.packaging || 'nobox',
          image: v.image || productData.image || '/hero.png',
          sku: v.sku || `${productData.sku || 'SKU'}-${v.color || idx}`,
          barcode: v.barcode || '',
          stock: Number(v.stock) || 0,
          min: Number(v.min) || 5,
          purchasePrice: Number(productData.purchasePrice) || 0,
          price: Number(productData.price) || 0
        }))
      }

      if (isNew) {
        this.products.unshift(prod)
        for (const v of prod.variants) {
          if (v.stock > 0) {
            await this.recordMovement({
              productId: prod.id,
              variantId: v.id,
              productName: prod.name,
              variantName: v.color || 'Standard',
              type: 'Initial Stock',
              quantity: v.stock,
              prevQuantity: 0,
              newQuantity: v.stock,
              reason: 'Création du produit'
            })
          }
        }
        this.notify(`Produit "${prod.name}" créé avec succès ✓`)
      } else {
        this.products.splice(pIdx, 1, prod)
        this.notify(`Produit "${prod.name}" mis à jour ✓`)
      }
      this.saveToStorage()
    },

    async deleteProduct(productId) {
      this.products = this.products.filter(p => p.id !== productId)
      this.saveToStorage()
      this.notify('Produit supprimé')
    },

    addToCart({ product, variant, packagingOption, quantity = 1 }) {
      const cartItemId = `${product.id}_${variant?.id || 'def'}_${packagingOption?.id || 'def'}`
      const existing = this.cart.find(i => i.id === cartItemId)
      const unitPrice = Number(product?.price || variant?.price) + Number(packagingOption?.extraPrice || 0)

      if (existing) {
        existing.quantity += quantity
      } else {
        this.cart.push({
          id: cartItemId,
          productId: product.id,
          variantId: variant?.id || 'def',
          name: product.name,
          variantName: variant?.color || 'Standard',
          image: variant?.image || product.image,
          price: unitPrice,
          purchasePrice: Number(product.purchasePrice || variant?.purchasePrice) || 0,
          packagingOption,
          quantity
        })
      }
      this.notify('Produit ajouté au panier 🛒')
    },

    removeFromCart(cartItemId) {
      this.cart = this.cart.filter(i => i.id !== cartItemId)
      this.notify('Article retiré du panier')
    },

    updateCartQuantity(cartItemId, delta) {
      const item = this.cart.find(i => i.id === cartItemId)
      if (!item) return
      item.quantity += delta
      if (item.quantity <= 0) {
        this.removeFromCart(cartItemId)
      }
    },

    clearCart() {
      this.cart = []
    },

    setLanguage(lang) {
      this.currentLang = lang
      localStorage.setItem('elmore_lang', lang)
    },

    async createSaleOrder({ customerName, customerPhone, customerCity, customerAddress, customerNotes, paymentMethod, items }) {
      const orderNumber = `ELM-${Math.floor(100000 + Math.random() * 900000)}`
      let totalAmount = 0
      const processedItems = []

      for (const item of items) {
        const pIdx = this.products.findIndex(p => p.id === item.productId)
        if (pIdx < 0) continue

        const product = this.products[pIdx]
        const vIdx = (product.variants || []).findIndex(v => v.id === item.variantId)
        if (vIdx >= 0) {
          const prevQty = Number(product.variants[vIdx].stock) || 0
          const newQty = Math.max(0, prevQty - item.quantity)
          product.variants[vIdx].stock = newQty

          await this.recordMovement({
            productId: product.id,
            variantId: product.variants[vIdx].id,
            productName: product.name,
            variantName: product.variants[vIdx].color || 'Standard',
            type: 'Sale',
            quantity: -item.quantity,
            prevQuantity: prevQty,
            newQuantity: newQty,
            user: 'Customer (Storefront)',
            reason: `Vente Commande Client ${orderNumber}`
          })
        }

        const itemSubtotal = item.price * item.quantity
        totalAmount += itemSubtotal

        processedItems.push({
          productId: product.id,
          variantId: item.variantId,
          name: product.name,
          variantName: product.variants?.[vIdx]?.color || 'Standard',
          packaging: item.packagingOption?.label || 'Sans Boîte',
          quantity: item.quantity,
          price: item.price,
          purchasePrice: item.purchasePrice,
          subtotal: itemSubtotal
        })
      }

      const saleRecord = {
        id: uuid(),
        orderNumber,
        customerName,
        customerPhone,
        customerCity: customerCity || 'Casablanca',
        customerAddress: customerAddress || '',
        customerNotes: customerNotes || '',
        paymentMethod: paymentMethod || 'Paiement à la Livraison (COD)',
        totalAmount,
        status: 'En attente',
        cancelled: false,
        items: processedItems,
        createdAt: new Date().toISOString()
      }

      this.sales.unshift(saleRecord)
      this.saveToStorage()
      this.notify(`Commande ELMORÉ ${saleRecord.orderNumber} enregistrée avec succès ✓`)
      return saleRecord
    }
  }
})
