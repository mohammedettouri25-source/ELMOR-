<script setup>
import { ref, computed, onMounted } from 'vue'
import { useInventoryStore, PACKAGING_OPTIONS } from './stores/inventory'
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'
import LandingPage from './components/LandingPage.vue'
import BarcodeModal from './components/BarcodeModal.vue'
import {
  LayoutDashboard,
  Package,
  ArrowUpRight,
  Warehouse,
  ShoppingBag,
  CheckCircle2,
  ShoppingCart,
  Receipt,
  BarChart3,
  Plus,
  Search,
  Filter,
  Download,
  AlertTriangle,
  TrendingUp,
  Boxes,
  Printer,
  Trash2,
  X,
  Minus,
  QrCode,
  Globe,
  ExternalLink
} from 'lucide-vue-next'

const store = useInventoryStore()

// Read query params for direct shareable link (e.g. ?product=prd-watch-a)
onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  const productId = params.get('product')
  if (productId) {
    store.openLandingPage(productId)
  }
})

// Modals State
const showProductModal = ref(false)
const showTransferModal = ref(false)
const showPurchaseModal = ref(false)
const showSessionModal = ref(false)
const showBarcodeModal = ref(false)
const showInvoiceModal = ref(false)

const selectedInvoiceOrder = ref(null)
const orderStatusFilter = ref('all')
const orderSearchQuery = ref('')

function openInvoice(order) {
  selectedInvoiceOrder.value = order
  showInvoiceModal.value = true
}

function printInvoice() {
  window.print()
}

const filteredSales = computed(() => {
  let list = store.sales || []
  if (orderStatusFilter.value !== 'all') {
    list = list.filter(s => (s.status || (s.cancelled ? 'Annulée' : 'Confirmée')) === orderStatusFilter.value)
  }
  const q = orderSearchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter(s =>
      (s.orderNumber || '').toLowerCase().includes(q) ||
      (s.customerName || '').toLowerCase().includes(q) ||
      (s.customerPhone || '').toLowerCase().includes(q) ||
      (s.customerCity || '').toLowerCase().includes(q) ||
      (s.customerAddress || '').toLowerCase().includes(q)
    )
  }
  return list
})

const activeBarcodeVariant = ref(null)
const activeBarcodeProductName = ref('')

const activeCountingSession = ref(null)
const physicalCounts = ref([])

// Forms State
const productForm = ref({
  id: null,
  name: '',
  sku: '',
  category: 'Montres & Horlogerie',
  brand: 'ELMORÉ',
  supplierId: '',
  description: '',
  purchasePrice: 1000,
  price: 2490,
  variants: [
    { id: null, color: 'Gold', size: '40mm', material: 'Acier Doré 18K', packaging: 'stdbox', stock: 10, min: 5, purchasePrice: 1000, price: 2490 }
  ]
})

const transferForm = ref({
  sourceWarehouseId: 'wh-main',
  destWarehouseId: 'wh-safi',
  productId: '',
  variantId: '',
  quantity: 1,
  reason: ''
})

const purchaseForm = ref({
  supplierId: '',
  warehouseId: 'wh-main',
  invoiceNumber: '',
  notes: '',
  items: []
})

const sessionForm = ref({
  warehouseId: 'wh-main',
  sessionName: ''
})

const posCustomer = ref({ name: '', phone: '' })
const posPayment = ref('Espèces')
const posDiscount = ref(0)

const movementFilter = ref('all')

function money(amount) {
  const n = Number(amount) || 0
  return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 }).format(n)
}

function openCreateProduct() {
  productForm.value = {
    id: null,
    name: '',
    sku: `ELM-${Math.floor(1000 + Math.random() * 9000)}`,
    category: 'Montres & Horlogerie',
    brand: 'ELMORÉ',
    supplierId: store.suppliers[0]?.id || '',
    image: '/hero.png',
    description: '',
    purchasePrice: 1200,
    price: 2490,
    variants: [
      { id: null, color: 'Gold', size: '40mm', material: 'Acier Doré 18K', packaging: 'stdbox', stock: 10, min: 5, purchasePrice: 1200, price: 2490 },
      { id: null, color: 'Black', size: '42mm', material: 'Acier Noir Mat', packaging: 'nobox', stock: 8, min: 5, purchasePrice: 1200, price: 2490 }
    ]
  }
  showProductModal.value = true
}

function openEditProduct(p) {
  productForm.value = JSON.parse(JSON.stringify(p))
  showProductModal.value = true
}

function addVariantLine() {
  productForm.value.variants.push({
    id: null,
    color: 'Silver',
    size: 'Standard',
    material: 'Acier',
    packaging: 'stdbox',
    stock: 5,
    min: 3,
    purchasePrice: productForm.value.purchasePrice,
    price: productForm.value.price
  })
}

function removeVariantLine(idx) {
  productForm.value.variants.splice(idx, 1)
}

function handleMainImageUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    productForm.value.image = e.target.result
  }
  reader.readAsDataURL(file)
}

function handleVariantImageUpload(event, variant) {
  const file = event.target.files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (e) => {
    variant.image = e.target.result
  }
  reader.readAsDataURL(file)
}

async function submitProductForm() {
  if (!productForm.value.name) return store.notify('Veuillez saisir le nom du produit')
  await store.saveProduct(productForm.value)
  showProductModal.value = false
}

// Transfer Handler
function openTransfer() {
  const p0 = store.products[0]
  transferForm.value = {
    sourceWarehouseId: store.warehouses[0]?.id || 'wh-main',
    destWarehouseId: store.warehouses[1]?.id || 'wh-safi',
    productId: p0?.id || '',
    variantId: p0?.variants?.[0]?.id || '',
    quantity: 1,
    reason: ''
  }
  showTransferModal.value = true
}

function onTransferProductChange() {
  const p = store.products.find(x => x.id === transferForm.value.productId)
  if (p && p.variants?.length) transferForm.value.variantId = p.variants[0].id
}

async function submitTransfer() {
  if (transferForm.value.sourceWarehouseId === transferForm.value.destWarehouseId) {
    return store.notify('L\'entrepôt source et destination doivent être différents')
  }
  await store.transferStock(transferForm.value)
  showTransferModal.value = false
}

// Purchase Handler
function openPurchase() {
  const p0 = store.products[0]
  purchaseForm.value = {
    supplierId: store.suppliers[0]?.id || '',
    warehouseId: store.warehouses[0]?.id || '',
    invoiceNumber: `PUR-${Date.now().toString(36).toUpperCase()}`,
    notes: '',
    items: p0 ? [{ productId: p0.id, variantId: p0.variants?.[0]?.id || '', quantity: 10, purchasePrice: p0.purchasePrice || 1000 }] : []
  }
  showPurchaseModal.value = true
}

function addPurchaseLine() {
  const p0 = store.products[0]
  if (!p0) return
  purchaseForm.value.items.push({
    productId: p0.id,
    variantId: p0.variants?.[0]?.id || '',
    quantity: 5,
    purchasePrice: p0.purchasePrice || 1000
  })
}

function removePurchaseLine(idx) {
  purchaseForm.value.items.splice(idx, 1)
}

function onPurchaseProductChange(idx) {
  const line = purchaseForm.value.items[idx]
  const p = store.products.find(x => x.id === line.productId)
  if (p) {
    line.variantId = p.variants?.[0]?.id || ''
    line.purchasePrice = p.purchasePrice || 1000
  }
}

async function submitPurchase() {
  await store.createPurchaseOrder(purchaseForm.value)
  showPurchaseModal.value = false
}

// Inventory Session Handler
function openSession() {
  sessionForm.value = {
    warehouseId: store.warehouses[0]?.id || 'wh-main',
    sessionName: `Inventaire ${new Date().toLocaleDateString('fr-MA')}`
  }
  showSessionModal.value = true
}

async function submitStartSession() {
  const session = await store.createInventorySession(sessionForm.value)
  showSessionModal.value = false
  if (session) {
    activeCountingSession.value = session
    const list = []
    store.products.forEach(p => {
      (p.variants || []).forEach(v => {
        list.push({
          productId: p.id,
          variantId: v.id,
          productName: p.name,
          variantName: `${v.color || ''} ${v.size || ''}`.trim(),
          systemQuantity: v.stock || 0,
          physicalQuantity: v.stock || 0,
          notes: ''
        })
      })
    })
    physicalCounts.value = list
  }
}

async function submitCompleteSession() {
  if (!activeCountingSession.value) return
  await store.completeInventorySession(activeCountingSession.value.id, physicalCounts.value)
  activeCountingSession.value = null
  physicalCounts.value = []
}

// Barcode Trigger
function openBarcode(p, v) {
  activeBarcodeProductName.value = p.name
  activeBarcodeVariant.value = v
  showBarcodeModal.value = true
}

// POS Cart Handler
function addToCart(p, v) {
  if (v.stock <= 0) return store.notify('Cette variante est en rupture de stock')
  const found = store.cart.find(x => x.variantId === v.id)
  if (found) {
    if (found.quantity < v.stock) found.quantity++
    else store.notify('Quantité maximale en stock atteinte')
  } else {
    store.cart.push({
      productId: p.id,
      variantId: v.id,
      productName: p.name,
      variantName: `${v.color || ''} ${v.size || ''}`.trim(),
      price: v.price || p.price,
      quantity: 1,
      availableStock: v.stock
    })
  }
}

const cartTotal = computed(() => {
  const subtotal = store.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  return Math.max(0, subtotal - (Number(posDiscount.value) || 0))
})

async function submitPosCheckout() {
  if (!store.cart.length) return store.notify('Votre panier est vide')
  await store.createSaleOrder({
    customerName: posCustomer.value.name,
    customerPhone: posCustomer.value.phone,
    paymentMethod: posPayment.value,
    items: store.cart
  })
  store.cart = []
  posCustomer.value = { name: '', phone: '' }
  posDiscount.value = 0
}

const filteredProducts = computed(() => {
  const q = store.searchQuery.trim().toLowerCase()
  if (!q) return store.products
  return store.products.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.sku.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    (p.variants || []).some(v => (v.color || '').toLowerCase().includes(q) || (v.size || '').toLowerCase().includes(q) || (v.sku || '').toLowerCase().includes(q))
  )
})

const filteredMovements = computed(() => {
  let list = store.movements
  if (movementFilter.value !== 'all') {
    list = list.filter(m => m.type.toLowerCase() === movementFilter.value.toLowerCase())
  }
  const q = store.searchQuery.trim().toLowerCase()
  if (q) {
    list = list.filter(m =>
      m.productName.toLowerCase().includes(q) ||
      m.variantName.toLowerCase().includes(q) ||
      m.reason.toLowerCase().includes(q) ||
      m.user.toLowerCase().includes(q)
    )
  }
  return list
})
</script>

<template>
  <!-- STANDALONE APPLE STOREFRONT (NO ADMIN SIDEBAR/HEADER) -->
  <div v-if="store.activeTab === 'landing'">
    <LandingPage />
  </div>

  <!-- ADMIN DASHBOARD LAYOUT -->
  <div v-else class="app-container">
    <Sidebar />

    <main class="main-content">
      <Header />

      <!-- Toast Notification -->
      <div v-if="store.toast" style="position: fixed; bottom: 24px; right: 24px; background: #09090b; color: #fff; padding: 12px 20px; border-radius: 10px; font-weight: 700; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25); z-index: 200; display: flex; align-items: center; gap: 8px;">
        <CheckCircle2 :size="18" style="color: #10b981;" /> {{ store.toast }}
      </div>

      <!-- DASHBOARD VIEW -->
      <section v-if="store.activeTab === 'dashboard'">
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="icon-wrapper" style="background: #e0e7ff; color: #4338ca;">
              <Package :size="20" />
            </div>
            <span class="label">Total Produits</span>
            <div class="value">{{ store.totalProductsCount }}</div>
            <span class="subtext">{{ store.totalVariantsCount }} variantes au total</span>
          </div>

          <div class="metric-card">
            <div class="icon-wrapper" style="background: #d1fae5; color: #047857;">
              <Boxes :size="20" />
            </div>
            <span class="label">Valeur du Stock (MAD)</span>
            <div class="value">{{ money(store.inventoryValue) }}</div>
            <span class="subtext">Valorisation d'inventaire</span>
          </div>

          <div class="metric-card">
            <div class="icon-wrapper" style="background: #cff4fc; color: #055160;">
              <TrendingUp :size="20" />
            </div>
            <span class="label">Ventes du Jour</span>
            <div class="value">{{ money(store.todaySalesRevenue) }}</div>
            <span class="subtext">Mois-ci : {{ money(store.monthSalesRevenue) }}</span>
          </div>

          <div class="metric-card">
            <div class="icon-wrapper" style="background: #fef3c7; color: #b45309;">
              <AlertTriangle :size="20" />
            </div>
            <span class="label">Alerte Stock Faible</span>
            <div class="value" style="color: #b45309;">{{ (store.lowStockList || []).length }}</div>
            <span class="subtext">{{ (store.outOfStockList || []).length }} en rupture complète</span>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
          <!-- Recent Movements Ledger Panel -->
          <div class="panel">
            <div class="panel-header">
              <div>
                <h2>Derniers Mouvements de Stock</h2>
                <p>Audit trail en temps réel</p>
              </div>
              <button class="btn-secondary" @click="store.activeTab = 'movements'">Voir tout →</button>
            </div>

            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Produit & Variante</th>
                    <th>Type</th>
                    <th>Variation</th>
                    <th>Nouveau Stock</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="m in store.latestMovements.slice(0, 6)" :key="m.id">
                    <td>{{ new Date(m.createdAt).toLocaleDateString('fr-MA', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) }}</td>
                    <td>
                      <b>{{ m.productName }}</b>
                      <span style="display: block; color: var(--text-muted); font-size: 11px;">{{ m.variantName }}</span>
                    </td>
                    <td>
                      <span class="badge" :class="m.quantity >= 0 ? 'badge-emerald' : 'badge-rose'">
                        {{ m.type }}
                      </span>
                    </td>
                    <td><strong :style="{ color: m.quantity >= 0 ? '#047857' : '#be123c' }">{{ m.quantity >= 0 ? '+' : '' }}{{ m.quantity }}</strong></td>
                    <td><b>{{ m.newQuantity }}</b></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Stock Alerts Sidebar Widget -->
          <div class="panel">
            <div class="panel-header">
              <div>
                <h2>Articles en Alerte</h2>
                <p>Stock ≤ Seuil Minimum</p>
              </div>
            </div>

            <div v-if="store.lowStockList.length" style="display: flex; flex-direction: column; gap: 12px;">
              <div v-for="item in store.lowStockList.slice(0, 5)" :key="item.id" style="background: #fffbebf5; padding: 12px; border-radius: 10px; border: 1px solid #fde68a; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <b style="font-size: 13px; display: block;">{{ item.productName }}</b>
                  <span style="font-size: 11px; color: var(--text-muted);">{{ item.color }} · {{ item.size }}</span>
                </div>
                <div style="text-align: right;">
                  <strong style="color: #b45309; font-size: 15px;">{{ item.stock }} un.</strong>
                  <span style="display: block; font-size: 10px; color: var(--text-subtle);">Min: {{ item.min }}</span>
                </div>
              </div>
            </div>
            <div v-else style="color: var(--text-muted); text-align: center; padding: 20px;">
              ✅ Tous les stocks sont à niveau.
            </div>
          </div>
        </div>
      </section>

      <!-- PRODUCTS VIEW -->
      <section v-else-if="store.activeTab === 'products'">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div>
            <h2>Catalogue Produits & Variantes</h2>
            <p style="color: var(--text-muted); font-size: 13px;">Gestion du stock décliné par couleur, taille, matière et نوع الـ Packaging</p>
          </div>
          <button class="btn-primary" @click="openCreateProduct">
            <Plus :size="16" /> Nouveau Produit
          </button>
        </div>

        <div class="panel">
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Produit & Catégorie</th>
                  <th>Variantes & Stock</th>
                  <th>Prix d'Achat</th>
                  <th>Prix de Vente</th>
                  <th>Lien Produit</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in filteredProducts" :key="p.id">
                  <td>
                    <b style="font-size: 14px;">{{ p.name }}</b>
                    <span style="display: block; color: var(--text-muted); font-size: 11px;">SKU: {{ p.sku }} · {{ p.category }}</span>
                  </td>
                  <td>
                    <div style="display: flex; flex-direction: column; gap: 6px;">
                      <div v-for="v in p.variants" :key="v.id" style="display: flex; align-items: center; gap: 8px; font-size: 12px; background: #f8fafc; padding: 6px 10px; border-radius: 6px; border: 1px solid #e2e8f0;">
                        <span style="font-weight: 700;">{{ v.color }} - {{ v.size }}</span>
                        <span style="color: var(--text-subtle);">({{ v.material || 'Acier' }})</span>
                        <span class="badge" :class="v.stock <= 0 ? 'badge-rose' : v.stock <= v.min ? 'badge-amber' : 'badge-emerald'" style="margin-left: auto;">
                          Stock: {{ v.stock }}
                        </span>
                        <button style="background: transparent; border: none; color: var(--icon-indigo); cursor: pointer;" title="Générer Code-Barres" @click="openBarcode(p, v)">
                          <QrCode :size="14" />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td>{{ money(p.purchasePrice) }}</td>
                  <td><b style="color: #047857;">{{ money(p.price) }}</b></td>
                  <td>
                    <button class="btn-secondary" style="padding: 4px 8px; font-size: 11px;" @click="store.openLandingPage(p.id)">
                      <ExternalLink :size="13" /> Lien Page Produit
                    </button>
                  </td>
                  <td>
                    <button class="btn-secondary" style="padding: 6px 12px; font-size: 12px;" @click="openEditProduct(p)">Modifier</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- MOVEMENTS VIEW -->
      <section v-else-if="store.activeTab === 'movements'">
        <div class="panel">
          <div class="panel-header">
            <div>
              <h2>Audit Trail — Historique des Mouvements de Stock</h2>
              <p>Chaque changement de stock est enregistré avec motif et auteur</p>
            </div>
            <div style="display: flex; gap: 10px;">
              <select v-model="movementFilter" class="form-control" style="width: auto;">
                <option value="all">Tous les Mouvements</option>
                <option value="Purchase">Achats (Purchase)</option>
                <option value="Sale">Ventes (Sale)</option>
                <option value="Return">Retours (Return)</option>
                <option value="Transfer">Transferts Inter-Entrepôts</option>
                <option value="Stock Correction">Corrections d'Inventaire</option>
                <option value="Damaged Product">Produits Endommagés</option>
              </select>
              <button class="btn-secondary" @click="store.exportData('movements', 'csv')"><Download :size="16"/> CSV</button>
              <button class="btn-secondary" @click="store.exportData('movements', 'excel')"><Download :size="16"/> Excel</button>
            </div>
          </div>

          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Date & Heure</th>
                  <th>Produit</th>
                  <th>Variante</th>
                  <th>Type Mouvement</th>
                  <th>Quantité</th>
                  <th>Stock (Av ➔ Ap)</th>
                  <th>Auteur & Motif</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="m in filteredMovements" :key="m.id">
                  <td>{{ new Date(m.createdAt).toLocaleString('fr-MA') }}</td>
                  <td><b>{{ m.productName }}</b></td>
                  <td>{{ m.variantName }}</td>
                  <td>
                    <span class="badge" :class="m.type === 'Purchase' || m.type === 'Return' || m.type === 'Initial Stock' ? 'badge-emerald' : m.type === 'Sale' ? 'badge-blue' : m.type === 'Transfer' ? 'badge-purple' : 'badge-rose'">
                      {{ m.type }}
                    </span>
                  </td>
                  <td><strong :style="{ color: m.quantity >= 0 ? '#047857' : '#be123c' }">{{ m.quantity >= 0 ? '+' : '' }}{{ m.quantity }}</strong></td>
                  <td>{{ m.prevQuantity }} ➔ <b>{{ m.newQuantity }}</b></td>
                  <td>
                    <b>{{ m.user }}</b>
                    <span style="display: block; color: var(--text-muted); font-size: 11px;">{{ m.reason }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- WAREHOUSES VIEW -->
      <section v-else-if="store.activeTab === 'warehouses'">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div>
            <h2>Multi-Entrepôts & Logistique Inter-Dépôts</h2>
            <p style="color: var(--text-muted); font-size: 13px;">Gestion des dépôts et transfert de stock entre magasins</p>
          </div>
          <button class="btn-primary" @click="openTransfer">
            <ArrowUpRight :size="16" /> Nouveau Transfert Inter-Dépôt
          </button>
        </div>

        <div class="metrics-grid">
          <div v-for="wh in store.warehouses" :key="wh.id" class="metric-card">
            <div class="icon-wrapper" style="background: #f3e8ff; color: #6b21a8;">
              <Warehouse :size="20" />
            </div>
            <span class="label">Entrepôt</span>
            <div class="value" style="font-size: 18px;">{{ wh.name }}</div>
            <span class="subtext">Code: <b>{{ wh.code }}</b> · {{ wh.location }}</span>
          </div>
        </div>
      </section>

      <!-- PURCHASES VIEW -->
      <section v-else-if="store.activeTab === 'purchases'">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div>
            <h2>Bons d'Achat & Réception Fournisseurs</h2>
            <p style="color: var(--text-muted); font-size: 13px;">Réception de marchandise et calcul automatique du coût moyen pondéré (Average Cost)</p>
          </div>
          <button class="btn-primary" @click="openPurchase">
            <Plus :size="16" /> Nouveau Bon d'Achat
          </button>
        </div>

        <div class="panel">
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>N° Facture</th>
                  <th>Fournisseur</th>
                  <th>Nombre d'Articles</th>
                  <th>Montant Total</th>
                  <th>Date Réception</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in store.purchases" :key="p.id">
                  <td><b>{{ p.invoiceNumber }}</b></td>
                  <td>{{ p.supplierName }}</td>
                  <td>{{ p.items.length }} article(s)</td>
                  <td><b style="color: #047857;">{{ money(p.totalAmount) }}</b></td>
                  <td>{{ new Date(p.createdAt).toLocaleDateString('fr-MA') }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- POS VIEW -->
      <section v-else-if="store.activeTab === 'pos'">
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
          <!-- POS Products Grid -->
          <div class="panel">
            <div class="panel-header">
              <h2>Point de Vente (POS) — Catalogue</h2>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px;">
              <div v-for="p in filteredProducts" :key="p.id" style="background: #ffffff; border: 1px solid var(--border-color); border-radius: 12px; padding: 14px; display: flex; flex-direction: column; box-shadow: var(--shadow-sm);">
                <b style="font-size: 14px; margin-bottom: 6px;">{{ p.name }}</b>
                <span style="font-size: 13px; color: #047857; font-weight: 800; margin-bottom: 10px;">{{ money(p.price) }}</span>

                <div style="display: flex; flex-direction: column; gap: 6px; margin-top: auto;">
                  <button v-for="v in p.variants" :key="v.id" class="btn-secondary" style="font-size: 11px; padding: 6px 8px; justify-content: space-between;" :disabled="v.stock <= 0" @click="addToCart(p, v)">
                    <span>{{ v.color }} · {{ v.size }}</span>
                    <b>{{ v.stock }} un.</b>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- POS Cart Panel -->
          <div class="panel">
            <div class="panel-header">
              <h2>Panier Client</h2>
              <span class="badge badge-dark">{{ store.cart.length }} article(s)</span>
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px; min-height: 200px;">
              <div v-for="item in store.cart" :key="item.variantId" style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <b style="font-size: 12px; display: block;">{{ item.productName }}</b>
                  <span style="font-size: 11px; color: var(--text-muted);">{{ item.variantName }} · {{ money(item.price) }}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <button class="btn-secondary" style="padding: 2px 6px;" @click="item.quantity > 1 ? item.quantity-- : null">-</button>
                  <b>{{ item.quantity }}</b>
                  <button class="btn-secondary" style="padding: 2px 6px;" @click="item.quantity < item.availableStock ? item.quantity++ : null">+</button>
                </div>
              </div>
            </div>

            <div style="border-top: 1px solid var(--border-color); margin-top: 16px; padding-top: 16px;">
              <div class="form-group">
                <label>Nom Client (Optionnel)</label>
                <input v-model="posCustomer.name" class="form-control" placeholder="Client Comptoir" />
              </div>
              <div class="form-group">
                <label>Remise (MAD)</label>
                <input v-model.number="posDiscount" type="number" min="0" class="form-control" placeholder="0" />
              </div>

              <div style="display: flex; justify-content: space-between; margin: 16px 0; font-size: 18px; font-weight: 800;">
                <span>Total Net</span>
                <span style="color: #047857;">{{ money(cartTotal) }}</span>
              </div>

              <button class="btn-primary" style="width: 100%; justify-content: center; padding: 12px;" @click="submitPosCheckout">
                Finaliser la Vente ✓
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- SALES ORDERS VIEW -->
      <section v-else-if="store.activeTab === 'sales'">
        <div class="panel">
          <div class="panel-header">
            <div>
              <h2>Historique des Commandes & Ventes</h2>
              <p>Suivi des ventes POS et commandes du Storefront avec changement de statut</p>
            </div>
            <div style="display: flex; gap: 10px; align-items: center;">
              <input v-model="orderSearchQuery" placeholder="Rechercher N° commande, client, tel..." class="form-control" style="width: 240px;" />

              <select v-model="orderStatusFilter" class="form-control" style="width: auto;">
                <option value="all">Tous les Statuts</option>
                <option value="En attente">⏳ En attente</option>
                <option value="Confirmée">✅ Confirmée</option>
                <option value="Expédiée">🚚 Expédiée</option>
                <option value="Livrée">🎉 Livrée</option>
                <option value="Annulée">❌ Annulée</option>
              </select>
            </div>
          </div>

          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>N° Commande</th>
                  <th>Client & Adresse</th>
                  <th>Paiement</th>
                  <th>Articles & Emballage</th>
                  <th>Montant Total</th>
                  <th>Statut Commande</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in filteredSales" :key="s.id">
                  <td>
                    <b>{{ s.orderNumber }}</b>
                    <span style="display: block; color: var(--text-muted); font-size: 11px;">
                      {{ new Date(s.createdAt).toLocaleDateString('fr-MA', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) }}
                    </span>
                  </td>
                  <td>
                    <b>{{ s.customerName }}</b>
                    <span style="display: block; color: var(--text-muted); font-size: 11px;">📞 {{ s.customerPhone || 'N/A' }}</span>
                    <span v-if="s.customerCity || s.customerAddress" style="display: block; color: var(--text-subtle); font-size: 10px;">
                      📍 {{ s.customerCity || 'Casablanca' }} {{ s.customerAddress ? `- ${s.customerAddress}` : '' }}
                    </span>
                  </td>
                  <td><span class="badge badge-blue">{{ s.paymentMethod }}</span></td>
                  <td>
                    <div v-for="i in s.items" :key="i.variantId" style="font-size: 11px;">
                      • {{ i.name }} ({{ i.variantName }}) - <b>{{ i.packaging }}</b> x{{ i.quantity }}
                    </div>
                  </td>
                  <td><b style="color: #047857;">{{ money(s.totalAmount) }}</b></td>
                  <td>
                    <select
                      :value="s.status || (s.cancelled ? 'Annulée' : 'Confirmée')"
                      class="form-control"
                      style="width: auto; font-size: 11px; padding: 4px 8px; font-weight: 700;"
                      @change="store.updateOrderStatus(s.id, $event.target.value)"
                    >
                      <option value="En attente">⏳ En attente</option>
                      <option value="Confirmée">✅ Confirmée</option>
                      <option value="Expédiée">🚚 Expédiée</option>
                      <option value="Livrée">🎉 Livrée</option>
                      <option value="Annulée">❌ Annulée</option>
                    </select>
                  </td>
                  <td>
                    <div style="display: flex; gap: 6px;">
                      <button class="btn-secondary" style="padding: 4px 8px; font-size: 11px;" title="Facture & Reçu" @click="openInvoice(s)">
                        <Printer :size="13" /> Facture
                      </button>
                      <button v-if="!s.cancelled" class="btn-secondary" style="padding: 4px 8px; font-size: 11px; color: #be123c;" @click="store.cancelSaleOrder(s.id)">
                        Annuler
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- SESSIONS VIEW -->
      <section v-else-if="store.activeTab === 'sessions'">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <div>
            <h2>Audit d'Inventaire & Comptage Physique</h2>
            <p style="color: var(--text-muted); font-size: 13px;">Rapprochement entre stock système et comptage réel sur étagère</p>
          </div>
          <button v-if="!activeCountingSession" class="btn-primary" @click="openSession">
            <Plus :size="16" /> Démarrer un Inventaire
          </button>
          <button v-else class="btn-primary" style="background: #047857;" @click="submitCompleteSession">
            <CheckCircle2 :size="16" /> Valider & Ajuster le Stock
          </button>
        </div>

        <div v-if="activeCountingSession" class="panel" style="border: 2px solid #09090b;">
          <div class="panel-header">
            <h3>Session en Cours: {{ activeCountingSession.sessionName }}</h3>
          </div>

          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Produit & Variante</th>
                  <th>Stock Système</th>
                  <th>Stock Compté (Physique)</th>
                  <th>Écart (Différence)</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in physicalCounts" :key="item.variantId">
                  <td><b>{{ item.productName }}</b> ({{ item.variantName }})</td>
                  <td><b>{{ item.systemQuantity }}</b></td>
                  <td>
                    <input v-model.number="item.physicalQuantity" type="number" min="0" class="form-control" style="width: 90px; font-weight: 800;" />
                  </td>
                  <td>
                    <strong :style="{ color: (item.physicalQuantity - item.systemQuantity) === 0 ? '#047857' : '#be123c' }">
                      {{ (item.physicalQuantity - item.systemQuantity) > 0 ? '+' : '' }}{{ item.physicalQuantity - item.systemQuantity }}
                    </strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- REPORTS VIEW -->
      <section v-else-if="store.activeTab === 'reports'">
        <div class="panel">
          <div class="panel-header">
            <div>
              <h2>Rapports & Exporter l'Activité</h2>
              <p>Téléchargement des rapports sous format CSV ou Excel (.xls)</p>
            </div>
          </div>
          <div style="display: flex; gap: 16px;">
            <button class="btn-secondary" @click="store.exportData('stock', 'excel')">📊 Exporter Stock Global (Excel)</button>
            <button class="btn-secondary" @click="store.exportData('movements', 'excel')">📑 Exporter Historique Mouvements (Excel)</button>
          </div>
        </div>
      </section>
    </main>

    <!-- MODAL PRODUCT CREATE/EDIT -->
    <div v-if="showProductModal" class="modal-overlay" @click.self="showProductModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>{{ productForm.id ? 'Modifier le Produit' : 'Créer un Nouveau Produit' }}</h3>
          <button class="close-btn" @click="showProductModal = false"><X :size="18"/></button>
        </div>

        <form @submit.prevent="submitProductForm">
          <div class="form-group">
            <label>Nom du Produit</label>
            <input v-model="productForm.name" class="form-control" required placeholder="Ex: Montre ELMORÉ Automatic" />
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label>SKU Produit</label>
              <input v-model="productForm.sku" class="form-control" required />
            </div>
            <div class="form-group">
              <label>Catégorie</label>
              <select v-model="productForm.category" class="form-control">
                <option value="Montres & Horlogerie">Montres & Horlogerie</option>
                <option value="Vêtements Cuir">Vêtements Cuir</option>
                <option value="Accessoires">Accessoires</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Image Principale du Produit (URL ou Téléversement Local)</label>
            <div style="display: flex; gap: 10px; align-items: center;">
              <input v-model="productForm.image" class="form-control" placeholder="Ex: /hero.png ou lien web..." />
              <label class="btn-secondary" style="padding: 8px 12px; font-size: 11px; cursor: pointer; white-space: nowrap;">
                📁 Choisir Image Locale
                <input type="file" accept="image/*" style="display: none;" @change="handleMainImageUpload" />
              </label>
              <img :src="productForm.image || '/hero.png'" style="width: 42px; height: 42px; object-fit: contain; border-radius: 6px; border: 1px solid var(--border-color); background: #f8fafc;" />
            </div>
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label>Prix d'Achat (MAD)</label>
              <input v-model.number="productForm.purchasePrice" type="number" min="0" class="form-control" />
            </div>
            <div class="form-group">
              <label>Prix de Vente (MAD)</label>
              <input v-model.number="productForm.price" type="number" min="0" class="form-control" />
            </div>
          </div>

          <div style="border-top: 1px solid var(--border-color); margin-top: 16px; padding-top: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <b style="font-size: 14px;">Variantes (Couleur, Taille, Image Spécifique)</b>
              <button type="button" class="btn-secondary" style="padding: 4px 10px; font-size: 12px;" @click="addVariantLine">+ Ligne Variante</button>
            </div>

            <div v-for="(v, idx) in productForm.variants" :key="idx" style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; margin-bottom: 10px;">
              <div class="grid-3" style="margin-bottom: 8px;">
                <input v-model="v.color" class="form-control" placeholder="Couleur (Gold, Black...)" />
                <input v-model="v.size" class="form-control" placeholder="Taille (40mm, M...)" />
                <input v-model.number="v.stock" type="number" min="0" class="form-control" placeholder="Stock" />
              </div>

              <div style="display: flex; gap: 10px; align-items: center;">
                <input v-model="v.image" class="form-control" placeholder="Image de la variante (URL ou local)..." style="font-size: 12px;" />
                <label class="btn-secondary" style="padding: 6px 10px; font-size: 11px; cursor: pointer; white-space: nowrap;">
                  📷 Image Variante Locale
                  <input type="file" accept="image/*" style="display: none;" @change="e => handleVariantImageUpload(e, v)" />
                </label>
                <img :src="v.image || productForm.image || '/hero.png'" style="width: 36px; height: 36px; object-fit: contain; border-radius: 4px; border: 1px solid var(--border-color); background: #ffffff;" />
                <button type="button" class="close-btn" style="color: #ef4444;" @click="removeVariantLine(idx)">✕</button>
              </div>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
            <button type="button" class="btn-secondary" @click="showProductModal = false">Annuler</button>
            <button type="submit" class="btn-primary">Enregistrer le Produit ✓</button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL INTER-WAREHOUSE TRANSFER -->
    <div v-if="showTransferModal" class="modal-overlay" @click.self="showTransferModal = false">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Transfert Inter-Dépôts</h3>
          <button class="close-btn" @click="showTransferModal = false"><X :size="18"/></button>
        </div>

        <form @submit.prevent="submitTransfer">
          <div class="grid-2">
            <div class="form-group">
              <label>Entrepôt Source (Départ)</label>
              <select v-model="transferForm.sourceWarehouseId" class="form-control">
                <option v-for="w in store.warehouses" :key="w.id" :value="w.id">{{ w.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Entrepôt Destination (Arrivée)</label>
              <select v-model="transferForm.destWarehouseId" class="form-control">
                <option v-for="w in store.warehouses" :key="w.id" :value="w.id">{{ w.name }}</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Produit à Transférer</label>
            <select v-model="transferForm.productId" class="form-control" @change="onTransferProductChange">
              <option v-for="p in store.products" :key="p.id" :value="p.id">{{ p.name }}</option>
            </select>
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label>Variante</label>
              <select v-model="transferForm.variantId" class="form-control">
                <option v-for="v in (store.products.find(x => x.id === transferForm.productId)?.variants || [])" :key="v.id" :value="v.id">
                  {{ v.color }} - {{ v.size }} (Stock: {{ v.stock }})
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Quantité</label>
              <input v-model.number="transferForm.quantity" type="number" min="1" class="form-control" />
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
            <button type="button" class="btn-secondary" @click="showTransferModal = false">Annuler</button>
            <button type="submit" class="btn-primary">Valider le Transfert 🔄</button>
          </div>
        </form>
      </div>
    </div>

    <!-- BARCODE PRINT MODAL -->
    <BarcodeModal
      :show="showBarcodeModal"
      :variant="activeBarcodeVariant"
      :product-name="activeBarcodeProductName"
      @close="showBarcodeModal = false"
    />

    <!-- INVOICE / ORDER DETAILS PRINT MODAL -->
    <div v-if="showInvoiceModal && selectedInvoiceOrder" class="modal-overlay" @click.self="showInvoiceModal = false">
      <div class="modal-card" style="max-width: 680px; background: #ffffff; padding: 32px; border-radius: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #09090b; padding-bottom: 16px; margin-bottom: 20px;">
          <div>
            <img src="/logo.png" alt="ELMORÉ" style="height: 38px; margin-bottom: 6px;" />
            <div style="font-size: 11px; color: var(--text-muted); font-weight: 600;">ELMORÉ LUXURY STOCK & STOREFRONT</div>
            <div style="font-size: 11px; color: var(--text-subtle);">Casablanca, Maroc · contact@elmore.ma</div>
          </div>
          <div style="text-align: right;">
            <h2 style="font-size: 18px; font-weight: 900; margin: 0; color: #09090b;">BON DE COMMANDE / FACTURE</h2>
            <div style="font-size: 15px; font-weight: 800; color: var(--primary-color); margin-top: 4px;">{{ selectedInvoiceOrder.orderNumber }}</div>
            <div style="font-size: 11px; color: var(--text-muted);">Date: {{ new Date(selectedInvoiceOrder.createdAt).toLocaleString('fr-MA') }}</div>
          </div>
        </div>

        <!-- Customer & Order Metadata -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #f8fafc; padding: 16px; border-radius: 12px; margin-bottom: 20px; border: 1px solid #e2e8f0; font-size: 12px;">
          <div>
            <div style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 800; margin-bottom: 6px;">Informations Client</div>
            <div><b>Nom :</b> {{ selectedInvoiceOrder.customerName }}</div>
            <div><b>Téléphone :</b> {{ selectedInvoiceOrder.customerPhone || 'N/A' }}</div>
            <div><b>Ville :</b> {{ selectedInvoiceOrder.customerCity || 'Casablanca' }}</div>
            <div v-if="selectedInvoiceOrder.customerAddress"><b>Adresse :</b> {{ selectedInvoiceOrder.customerAddress }}</div>
          </div>

          <div>
            <div style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 800; margin-bottom: 6px;">Détails Règlement</div>
            <div><b>Mode de Paiement :</b> {{ selectedInvoiceOrder.paymentMethod }}</div>
            <div><b>Statut :</b> <span class="badge badge-dark">{{ selectedInvoiceOrder.status || 'Confirmée' }}</span></div>
            <div v-if="selectedInvoiceOrder.customerNotes"><b>Note Client :</b> {{ selectedInvoiceOrder.customerNotes }}</div>
          </div>
        </div>

        <!-- Table of Ordered Items -->
        <table class="data-table" style="margin-bottom: 20px;">
          <thead>
            <tr>
              <th>Désignation Article</th>
              <th>Variante & Emballage</th>
              <th>P.U (MAD)</th>
              <th>Qté</th>
              <th>Total (MAD)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in selectedInvoiceOrder.items" :key="item.variantId">
              <td><b>{{ item.name }}</b></td>
              <td>{{ item.variantName }} <small style="color: var(--text-muted);">({{ item.packaging }})</small></td>
              <td>{{ money(item.price) }}</td>
              <td><b>{{ item.quantity }}</b></td>
              <td><b>{{ money(item.subtotal) }}</b></td>
            </tr>
          </tbody>
        </table>

        <!-- Total Calculation -->
        <div style="display: flex; justify-content: flex-end; border-top: 1px solid var(--border-color); padding-top: 14px; margin-bottom: 20px;">
          <div style="width: 250px; font-size: 13px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span>Frais de Livraison :</span>
              <b style="color: #047857;">Offerts (Gratuit)</b>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 900; border-top: 2px solid #09090b; padding-top: 8px;">
              <span>Total Net TTC :</span>
              <span style="color: #047857;">{{ money(selectedInvoiceOrder.totalAmount) }}</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <button class="btn-secondary" @click="showInvoiceModal = false">Fermer</button>
          <button class="btn-primary" @click="printInvoice">
            <Printer :size="16" /> Imprimer Bon / Facture 🖨️
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
