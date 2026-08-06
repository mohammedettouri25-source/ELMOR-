import { defineStore } from 'pinia'

function uuid() {
  return 'elmore-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36)
}

const defaultWarehouses = [
  { id: 'wh-main', name: 'Entrepôt Principal (Casablanca)', code: 'WH-MAIN', location: 'Casablanca Anfa', isDefault: true },
  { id: 'wh-safi', name: 'Magasin Safi Center', code: 'STORE-SAFI', location: 'Safi Ville', isDefault: false },
  { id: 'wh-casa', name: 'Magasin Casablanca Maârif', code: 'STORE-CASA', location: 'Casablanca Maârif', isDefault: false }
]

const defaultSuppliers = [
  { id: 'sup-1', name: 'Swiss Chrono Luxury', company: 'Swiss Timepieces SA', phone: '+212 661-889900', email: 'contact@swisstime.ch' },
  { id: 'sup-2', name: 'Maroc Apparel Factory', company: 'Textile Casa SARL', phone: '+212 522-334455', email: 'sales@textilecasa.ma' }
]

// Packaging Options & Pricing (Chaque boîte a son prix)
export const PACKAGING_OPTIONS = [
  { id: 'nobox', label: 'Sans Boîte (Sans Coffret)', extraPrice: 0, icon: '📦', note: 'Emballage standard sécurisé' },
  { id: 'stdbox', label: 'Avec Boîte Standard ELMORÉ', extraPrice: 150, icon: '🎁', note: 'Coffret rigide élégant ELMORÉ' },
  { id: 'luxe', label: 'Avec Coffret de Luxe en Bois', extraPrice: 350, icon: '👑', note: 'Coffret Prestige en bois finition piano avec certificat' }
]

const defaultProducts = [
  {
    id: 'prd-watch-a',
    name: 'Montre ELMORÉ Chrono Automatic A',
    sku: 'WTC-CHRONO-A',
    barcode: '38009911001',
    category: 'Montres & Horlogerie',
    brand: 'ELMORÉ',
    supplierId: 'sup-1',
    image: '/hero.png',
    description: 'Montre chronographe automatique de haute précision. Boîtier en acier inoxydable 316L, mouvement suisse squelette et verre saphir inrayable.',
    purchasePrice: 1200,
    price: 2490,
    averageCost: 1200,
    minStock: 10,
    variants: [
      { id: 'v-101', color: 'Gold', size: '40mm', material: 'Acier Doré 18K', packaging: 'stdbox', sku: 'WTC-GOLD-40', barcode: '38009911001-G40', stock: 12, min: 5, purchasePrice: 1200, price: 2490 },
      { id: 'v-102', color: 'Gold', size: '42mm', material: 'Acier Doré 18K', packaging: 'luxe', sku: 'WTC-GOLD-42', barcode: '38009911001-G42', stock: 8, min: 5, purchasePrice: 1200, price: 2490 },
      { id: 'v-103', color: 'Black', size: '40mm', material: 'Acier Noir Mat', packaging: 'nobox', sku: 'WTC-BLK-40', barcode: '38009911001-B40', stock: 20, min: 5, purchasePrice: 1150, price: 2390 },
      { id: 'v-104', color: 'Silver', size: '42mm', material: 'Acier Argenté', packaging: 'stdbox', sku: 'WTC-SLV-42', barcode: '38009911001-S42', stock: 4, min: 6, purchasePrice: 1100, price: 2290 }
    ]
  },
  {
    id: 'prd-jacket-b',
    name: 'Veste Cuir Lambskin ELMORÉ Classic',
    sku: 'JKT-LAMB-01',
    barcode: '38009922002',
    category: 'Vêtements Cuir',
    brand: 'ELMORÉ Leather',
    supplierId: 'sup-2',
    image: '/hero.png',
    description: 'Veste en cuir véritable d\'agneau sur-mesure avec doublure satinée et fermetures éclair YKK.',
    purchasePrice: 650,
    price: 1490,
    averageCost: 650,
    minStock: 8,
    variants: [
      { id: 'v-201', color: 'Noir', size: 'M', material: 'Cuir d\'agneau', packaging: 'nobox', sku: 'JKT-BLK-M', barcode: '38009922002-BM', stock: 15, min: 4, purchasePrice: 650, price: 1490 },
      { id: 'v-202', color: 'Noir', size: 'L', material: 'Cuir d\'agneau', packaging: 'stdbox', sku: 'JKT-BLK-L', barcode: '38009922002-BL', stock: 3, min: 5, purchasePrice: 650, price: 1490 },
      { id: 'v-203', color: 'Marron', size: 'XL', material: 'Cuir d\'agneau', packaging: 'nobox', sku: 'JKT-BRN-XL', barcode: '38009922002-BXL', stock: 10, min: 3, purchasePrice: 650, price: 1490 }
    ]
  }
]

const initialMovements = [
  { id: uuid(), productId: 'prd-watch-a', variantId: 'v-101', productName: 'Montre ELMORÉ Chrono Automatic A', variantName: 'Gold · 40mm', type: 'Initial Stock', quantity: 12, prevQuantity: 0, newQuantity: 12, warehouseId: 'wh-main', user: 'Admin', reason: 'Initialisation du Stock', createdAt: new Date().toISOString() },
  { id: uuid(), productId: 'prd-watch-a', variantId: 'v-102', productName: 'Montre ELMORÉ Chrono Automatic A', variantName: 'Gold · 42mm', type: 'Initial Stock', quantity: 8, prevQuantity: 0, newQuantity: 8, warehouseId: 'wh-main', user: 'Admin', reason: 'Initialisation du Stock', createdAt: new Date().toISOString() },
  { id: uuid(), productId: 'prd-watch-a', variantId: 'v-103', productName: 'Montre ELMORÉ Chrono Automatic A', variantName: 'Black · 40mm', type: 'Initial Stock', quantity: 20, prevQuantity: 0, newQuantity: 20, warehouseId: 'wh-main', user: 'Admin', reason: 'Initialisation du Stock', createdAt: new Date().toISOString() }
]

export const useInventoryStore = defineStore('inventory', {
  state: () => ({
    products: JSON.parse(localStorage.getItem('elmore_products')) || defaultProducts,
    warehouses: JSON.parse(localStorage.getItem('elmore_warehouses')) || defaultWarehouses,
    suppliers: JSON.parse(localStorage.getItem('elmore_suppliers')) || defaultSuppliers,
    movements: JSON.parse(localStorage.getItem('elmore_movements')) || initialMovements,
    purchases: JSON.parse(localStorage.getItem('elmore_purchases')) || [],
    sales: JSON.parse(localStorage.getItem('elmore_sales')) || [],
    inventorySessions: JSON.parse(localStorage.getItem('elmore_sessions')) || [],
    cart: [],
    currentLang: localStorage.getItem('elmore_lang') || 'ar',
    activeTab: 'dashboard',
    selectedLandingProductId: 'prd-watch-a',
    toast: null,
    searchQuery: ''
  }),

  getters: {
    selectedLandingProduct: s => s.products.find(p => p.id === s.selectedLandingProductId) || s.products[0],
    totalProductsCount: s => s.products.length,
    totalVariantsCount: s => s.products.reduce((sum, p) => sum + (p.variants || []).length, 0),
    inventoryValue: s => s.products.reduce((sum, p) => sum + (p.variants || []).reduce((vSum, v) => vSum + (Number(v.stock) || 0) * (Number(p.purchasePrice || v.purchasePrice) || 0), 0), 0),
    
    lowStockList: s => s.products.flatMap(p => (p.variants || []).filter(v => (v.stock || 0) <= (v.min || 5)).map(v => ({ ...v, productName: p.name, productId: p.id, purchasePrice: p.purchasePrice }))),
    outOfStockList: s => s.products.flatMap(p => (p.variants || []).filter(v => (v.stock || 0) <= 0).map(v => ({ ...v, productName: p.name, productId: p.id }))),
    
    totalSalesRevenue: s => (s.sales || []).filter(x => !x.cancelled).reduce((sum, s) => sum + Number(s.totalAmount || 0), 0),
    todaySalesRevenue: s => (s.sales || []).filter(x => !x.cancelled && new Date(x.createdAt).toDateString() === new Date().toDateString()).reduce((sum, s) => sum + Number(s.totalAmount || 0), 0),
    monthSalesRevenue: s => (s.sales || []).filter(x => !x.cancelled && new Date(x.createdAt).getMonth() === new Date().getMonth()).reduce((sum, s) => sum + Number(s.totalAmount || 0), 0),
    
    totalCOGS: s => (s.sales || []).filter(x => !x.cancelled).reduce((sum, sale) => sum + (sale.items || []).reduce((itemSum, item) => itemSum + (Number(item.purchasePrice || 0) * Number(item.quantity || 1)), 0), 0),
    grossProfit: s => s.totalSalesRevenue - s.totalCOGS,
    
    totalPurchasesAmount: s => (s.purchases || []).reduce((sum, p) => sum + Number(p.totalAmount || 0), 0),
    latestMovements: s => [...s.movements].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 15),

    cartTotalCount: s => s.cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0),
    cartTotalPrice: s => s.cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0)
  },

  actions: {
    notify(msg) {
      this.toast = msg
      setTimeout(() => { this.toast = null }, 3500)
    },

    saveToStorage() {
      localStorage.setItem('elmore_products', JSON.stringify(this.products))
      localStorage.setItem('elmore_warehouses', JSON.stringify(this.warehouses))
      localStorage.setItem('elmore_suppliers', JSON.stringify(this.suppliers))
      localStorage.setItem('elmore_movements', JSON.stringify(this.movements))
      localStorage.setItem('elmore_purchases', JSON.stringify(this.purchases))
      localStorage.setItem('elmore_sales', JSON.stringify(this.sales))
      localStorage.setItem('elmore_sessions', JSON.stringify(this.inventorySessions))
    },

    openLandingPage(productId) {
      if (productId) this.selectedLandingProductId = productId
      this.activeTab = 'landing'
    },

    // Record Stock Movement with full audit data
    async recordMovement({ productId, variantId, productName, variantName, type, quantity, prevQuantity, newQuantity, warehouseId, destWarehouseId, user = 'Admin', reason = '', notes = '' }) {
      const movement = {
        id: uuid(),
        productId,
        variantId,
        productName: productName || 'Produit',
        variantName: variantName || 'Standard',
        type,
        quantity: Number(quantity),
        prevQuantity: Number(prevQuantity),
        newQuantity: Number(newQuantity),
        warehouseId: warehouseId || 'wh-main',
        destWarehouseId: destWarehouseId || null,
        user,
        reason,
        notes,
        createdAt: new Date().toISOString()
      }
      this.movements.unshift(movement)
      this.saveToStorage()
      return movement
    },

    // Save/Update Product
    async saveProduct(productData) {
      const pIdx = this.products.findIndex(p => p.id === productData.id)
      const isNew = pIdx < 0

      const prod = {
        ...productData,
        id: productData.id || uuid(),
        sku: productData.sku || `ELM-${Math.floor(1000 + Math.random() * 9000)}`,
        barcode: productData.barcode || `3800${Math.floor(1000000 + Math.random() * 9000000)}`,
        purchasePrice: Number(productData.purchasePrice) || 0,
        price: Number(productData.price) || 0,
        variants: (productData.variants || []).map((v, idx) => ({
          ...v,
          id: v.id || uuid(),
          sku: v.sku || `${productData.sku || 'ELM'}-${v.color || 'VAR'}-${v.size || idx}`,
          barcode: v.barcode || `3800${Math.floor(1000000 + Math.random() * 9000000)}-${idx+1}`,
          stock: Number(v.stock) || 0,
          min: Number(v.min) || 5,
          material: v.material || 'Acier Stainless',
          packaging: v.packaging || 'stdbox',
          purchasePrice: Number(v.purchasePrice || productData.purchasePrice) || 0,
          price: Number(v.price || productData.price) || 0
        }))
      }

      if (isNew) {
        this.products.push(prod)
        for (const v of prod.variants) {
          if (v.stock > 0) {
            await this.recordMovement({
              productId: prod.id,
              variantId: v.id,
              productName: prod.name,
              variantName: `${v.color || ''} ${v.size || ''}`.trim(),
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

    // Transfer Stock
    async transferStock({ sourceWarehouseId, destWarehouseId, productId, variantId, quantity, reason, user = 'Admin' }) {
      const qty = Math.max(1, Number(quantity) || 1)
      const pIdx = this.products.findIndex(p => p.id === productId)
      if (pIdx < 0) return this.notify('Produit introuvable')

      const product = this.products[pIdx]
      const vIdx = (product.variants || []).findIndex(v => v.id === variantId)
      if (vIdx < 0) return this.notify('Variante introuvable')

      const variant = product.variants[vIdx]
      const currentStock = Number(variant.stock) || 0

      if (currentStock < qty) return this.notify('Stock insuffisant pour cette variante')

      const sourceWH = this.warehouses.find(w => w.id === sourceWarehouseId)
      const destWH = this.warehouses.find(w => w.id === destWarehouseId)

      await this.recordMovement({
        productId: product.id,
        variantId: variant.id,
        productName: product.name,
        variantName: `${variant.color || ''} ${variant.size || ''}`.trim(),
        type: 'Transfer',
        quantity: qty,
        prevQuantity: currentStock,
        newQuantity: currentStock,
        warehouseId: sourceWarehouseId,
        destWarehouseId: destWarehouseId,
        user,
        reason: reason || `Transfert de ${sourceWH?.name || 'Source'} à ${destWH?.name || 'Destination'}`,
        notes: `Transfert de ${qty} unité(s)`
      })

      this.notify(`Transfert de ${qty} unité(s) effectué entre entrepôts ✓`)
    },

    // Create Purchase Order
    async createPurchaseOrder({ supplierId, warehouseId, invoiceNumber, notes, items }) {
      if (!items || !items.length) return this.notify('Veuillez ajouter au moins un article d\'achat')
      
      const supplier = this.suppliers.find(s => s.id === supplierId)
      const invNum = invoiceNumber || `PUR-${Date.now().toString(36).toUpperCase()}`
      
      let totalAmount = 0
      const processedItems = []

      for (const item of items) {
        const pIdx = this.products.findIndex(p => p.id === item.productId)
        if (pIdx < 0) continue

        const product = this.products[pIdx]
        const vIdx = (product.variants || []).findIndex(v => v.id === item.variantId)
        if (vIdx < 0) continue

        const qty = Math.max(1, Number(item.quantity) || 1)
        const cost = Math.max(0, Number(item.purchasePrice) || 0)
        const subtotal = qty * cost
        totalAmount += subtotal

        const prevQty = Number(product.variants[vIdx].stock) || 0
        const newQty = prevQty + qty

        const oldCost = Number(product.variants[vIdx].averageCost || product.variants[vIdx].purchasePrice) || cost
        const newAvgCost = Number((((prevQty * oldCost) + (qty * cost)) / newQty).toFixed(2))

        product.variants[vIdx].stock = newQty
        product.variants[vIdx].averageCost = newAvgCost
        product.variants[vIdx].purchasePrice = cost

        await this.recordMovement({
          productId: product.id,
          variantId: product.variants[vIdx].id,
          productName: product.name,
          variantName: `${product.variants[vIdx].color || ''} ${product.variants[vIdx].size || ''}`.trim(),
          type: 'Purchase',
          quantity: qty,
          prevQuantity: prevQty,
          newQuantity: newQty,
          warehouseId: warehouseId || 'wh-main',
          user: 'Admin',
          reason: `Réception Bon d'Achat ${invNum}`,
          notes: `Fournisseur: ${supplier?.name || 'N/A'}`
        })

        processedItems.push({
          productId: product.id,
          variantId: product.variants[vIdx].id,
          name: product.name,
          variantName: `${product.variants[vIdx].color || ''} ${product.variants[vIdx].size || ''}`.trim(),
          quantity: qty,
          purchasePrice: cost,
          subtotal
        })
      }

      const purchaseRecord = {
        id: uuid(),
        invoiceNumber: invNum,
        supplierId: supplierId || null,
        supplierName: supplier?.name || 'Fournisseur Direct',
        warehouseId: warehouseId || 'wh-main',
        totalAmount,
        notes: notes || '',
        items: processedItems,
        createdAt: new Date().toISOString()
      }

      this.purchases.unshift(purchaseRecord)
      this.saveToStorage()
      this.notify(`Bon d'achat ${invNum} créé & stock mis à jour ✓`)
      return purchaseRecord
    },

    // Sales Order Checkout
    async createSaleOrder({ customerName, customerPhone, customerCity = 'Casablanca', customerAddress = '', customerNotes = '', paymentMethod = 'Espèces', items, warehouseId = 'wh-main' }) {
      if (!items || !items.length) return this.notify('Veuillez ajouter au moins un article au panier')

      let totalAmount = 0
      const saleItems = []

      for (const item of items) {
        const pIdx = this.products.findIndex(p => p.id === item.productId)
        if (pIdx < 0) continue

        const product = this.products[pIdx]
        const vIdx = (product.variants || []).findIndex(v => v.id === item.variantId)
        if (vIdx < 0) continue

        const qty = Number(item.quantity) || 1
        const unitPrice = Number(item.price) || 0
        const subtotal = qty * unitPrice
        totalAmount += subtotal

        const prevQty = Number(product.variants[vIdx].stock) || 0
        const newQty = Math.max(0, prevQty - qty)

        product.variants[vIdx].stock = newQty

        await this.recordMovement({
          productId: product.id,
          variantId: product.variants[vIdx].id,
          productName: product.name,
          variantName: `${product.variants[vIdx].color || ''} ${product.variants[vIdx].size || ''}`.trim(),
          type: 'Sale',
          quantity: -qty,
          prevQuantity: prevQty,
          newQuantity: newQty,
          warehouseId,
          user: 'POS/Client',
          reason: 'Vente Client Commandée',
          notes: `Client: ${customerName || 'Comptoir'} (${item.packagingOption?.label || item.packaging || 'Sans boîte'})`
        })

        saleItems.push({
          productId: product.id,
          variantId: product.variants[vIdx].id,
          name: product.name,
          variantName: `${product.variants[vIdx].color || ''} ${product.variants[vIdx].size || ''}`.trim(),
          packaging: item.packagingOption?.label || item.packaging || 'Sans Boîte',
          quantity: qty,
          price: unitPrice,
          purchasePrice: Number(product.variants[vIdx].purchasePrice || product.purchasePrice) || 0,
          subtotal
        })
      }

      const saleRecord = {
        id: uuid(),
        orderNumber: `ORD-${Date.now().toString(36).toUpperCase()}`,
        customerName: customerName || 'Vente Comptoir',
        customerPhone: customerPhone || '',
        customerCity: customerCity || 'Casablanca',
        customerAddress: customerAddress || '',
        customerNotes: customerNotes || '',
        paymentMethod,
        totalAmount,
        items: saleItems,
        status: 'En attente', // 'En attente' | 'Confirmée' | 'Expédiée' | 'Livrée' | 'Annulée'
        cancelled: false,
        createdAt: new Date().toISOString()
      }

      this.sales.unshift(saleRecord)
      this.saveToStorage()
      this.notify(`Commande ELMORÉ ${saleRecord.orderNumber} enregistrée avec succès ✓`)
      return saleRecord
    },

    // Update Order Status
    async updateOrderStatus(saleId, newStatus) {
      const sale = this.sales.find(s => s.id === saleId)
      if (!sale) return

      if (newStatus === 'Annulée') {
        await this.cancelSaleOrder(saleId)
        return
      }

      sale.status = newStatus
      sale.cancelled = false
      this.saveToStorage()
      this.notify(`Statut commande ${sale.orderNumber} mis à jour : "${newStatus}" ✓`)
    },

    // Cancel Sale Order
    async cancelSaleOrder(saleId) {
      const sale = this.sales.find(s => s.id === saleId)
      if (!sale || sale.cancelled) return

      for (const item of sale.items) {
        const pIdx = this.products.findIndex(p => p.id === item.productId)
        if (pIdx < 0) continue

        const product = this.products[pIdx]
        const vIdx = (product.variants || []).findIndex(v => v.id === item.variantId)
        if (vIdx < 0) continue

        const prevQty = Number(product.variants[vIdx].stock) || 0
        const newQty = prevQty + Number(item.quantity)

        product.variants[vIdx].stock = newQty

        await this.recordMovement({
          productId: product.id,
          variantId: product.variants[vIdx].id,
          productName: product.name,
          variantName: item.variantName,
          type: 'Return',
          quantity: item.quantity,
          prevQuantity: prevQty,
          newQuantity: newQty,
          user: 'Admin',
          reason: `Annulation Commande ${sale.orderNumber}`,
          notes: 'Réintégration du stock'
        })
      }

      sale.cancelled = true
      sale.status = 'Annulée'
      this.saveToStorage()
      this.notify(`Commande ${sale.orderNumber} annulée et stock restitué ✓`)
    },

    // Inventory Count Sessions
    async createInventorySession({ warehouseId, sessionName }) {
      const wh = this.warehouses.find(w => w.id === warehouseId) || this.warehouses[0]
      const session = {
        id: uuid(),
        warehouseId: wh.id,
        warehouseName: wh.name,
        sessionName: sessionName || `Inventaire ${new Date().toLocaleDateString('fr-MA')}`,
        status: 'in_progress',
        createdAt: new Date().toISOString()
      }
      this.inventorySessions.unshift(session)
      this.saveToStorage()
      return session
    },

    async completeInventorySession(sessionId, physicalCounts = [], user = 'Admin') {
      const sIdx = this.inventorySessions.findIndex(s => s.id === sessionId)
      if (sIdx < 0) return

      const session = this.inventorySessions[sIdx]
      let adjustmentsCount = 0

      for (const count of physicalCounts) {
        const pIdx = this.products.findIndex(p => p.id === count.productId)
        if (pIdx < 0) continue

        const product = this.products[pIdx]
        const vIdx = (product.variants || []).findIndex(v => v.id === count.variantId)
        if (vIdx < 0) continue

        const systemQty = Number(product.variants[vIdx].stock) || 0
        const physicalQty = Math.max(0, Number(count.physicalQuantity) || 0)
        const diff = physicalQty - systemQty

        if (diff !== 0) {
          adjustmentsCount++
          product.variants[vIdx].stock = physicalQty

          const movementType = count.reasonType || (diff > 0 ? 'Stock Correction' : 'Damaged Product')

          await this.recordMovement({
            productId: product.id,
            variantId: product.variants[vIdx].id,
            productName: product.name,
            variantName: count.variantName,
            type: movementType,
            quantity: diff,
            prevQuantity: systemQty,
            newQuantity: physicalQty,
            warehouseId: session.warehouseId,
            user,
            reason: `Inventaire: ${session.sessionName}`,
            notes: count.notes || `Écart d'inventaire (${diff > 0 ? '+' : ''}${diff})`
          })
        }
      }

      session.status = 'completed'
      session.completedAt = new Date().toISOString()
      session.adjustmentsCount = adjustmentsCount
      this.saveToStorage()
      this.notify(`Session d'inventaire clôturée avec ${adjustmentsCount} réajustement(s) ✓`)
    },

    // CSV & Excel Exporter
    exportData(type = 'stock', format = 'csv') {
      let rows = []
      let filename = `elmore_${type}_${new Date().toISOString().slice(0,10)}`

      if (type === 'stock') {
        rows.push(['ID Produit', 'Nom Produit', 'SKU Variante', 'Catégorie', 'Couleur', 'Taille', 'Matière', 'Emballage', 'Stock Actuel', 'Stock Min', 'Prix Achat', 'Prix Vente', 'Valeur Stock'])
        this.products.forEach(p => {
          (p.variants || []).forEach(v => {
            rows.push([
              p.id,
              `"${(p.name || '').replace(/"/g, '""')}"`,
              v.sku || p.sku,
              p.category || 'Général',
              v.color || '',
              v.size || '',
              v.material || 'Standard',
              v.packaging || 'stdbox',
              v.stock || 0,
              v.min || 0,
              p.purchasePrice || 0,
              p.price || 0,
              (v.stock * p.purchasePrice).toFixed(2)
            ])
          })
        })
      } else if (type === 'movements') {
        rows.push(['Date', 'Produit', 'Variante', 'Type Mouvement', 'Quantité', 'Ancien Stock', 'Nouveau Stock', 'Auteur', 'Motif'])
        this.movements.forEach(m => {
          rows.push([
            new Date(m.createdAt).toLocaleString('fr-MA'),
            `"${(m.productName || '').replace(/"/g, '""')}"`,
            `"${(m.variantName || '').replace(/"/g, '""')}"`,
            m.type,
            m.quantity,
            m.prevQuantity,
            m.newQuantity,
            m.user,
            `"${(m.reason || '').replace(/"/g, '""')}"`
          ])
        })
      }

      const csvContent = "\uFEFF" + rows.map(r => r.join(';')).join('\n')
      const blob = new Blob([csvContent], { type: format === 'excel' ? 'application/vnd.ms-excel;charset=utf-8' : 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `${filename}.${format === 'excel' ? 'xls' : 'csv'}`
      link.click()
      this.notify(`Fichier ${type} généré (${format.toUpperCase()}) ✓`)
    },

    addToCart({ product, variant, packagingOption, quantity = 1 }) {
      const p = product || this.selectedLandingProduct
      const v = variant || (p.variants || [])[0]
      const box = packagingOption || PACKAGING_OPTIONS[0]
      const unitPrice = (Number(v?.price || p?.price) || 0) + (Number(box?.extraPrice) || 0)

      const existingItem = this.cart.find(i => i.productId === p.id && i.variantId === v?.id && i.packagingOption?.id === box.id)
      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        this.cart.push({
          id: uuid(),
          productId: p.id,
          variantId: v?.id || p.id,
          name: p.name,
          variantName: v ? `${v.color || ''} ${v.size || ''}`.trim() : 'Standard',
          image: v?.image || p.image || '/hero.png',
          price: unitPrice,
          purchasePrice: Number(p.purchasePrice || v?.purchasePrice) || 0,
          packagingOption: box,
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
    }
  }
})
