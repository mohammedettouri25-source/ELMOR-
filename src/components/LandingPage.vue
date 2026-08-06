<script setup>
import { ref, computed } from 'vue'
import { useInventoryStore, PACKAGING_OPTIONS } from '../stores/inventory'
import {
  ShoppingBag,
  ShieldCheck,
  Truck,
  Box,
  Gift,
  Award,
  Sparkles,
  Copy,
  Clock,
  CheckCircle2,
  X,
  MessageSquare,
  ChevronRight,
  Settings,
  Star,
  Check,
  Search,
  ArrowRight,
  Filter,
  Grid,
  Heart,
  ShoppingCart,
  Trash2,
  Plus,
  Minus
} from 'lucide-vue-next'

const store = useInventoryStore()

// Page Navigation State: 'home' | 'catalog' | 'order' | 'reviews'
const storePage = ref('home')

const showCartDrawer = ref(false)
const showCheckoutModal = ref(false)

const selectedCategoryFilter = ref('all')
const catalogSearchQuery = ref('')

const product = computed(() => store.selectedLandingProduct)

const selectedVariantId = ref(product.value?.variants?.[0]?.id || '')
const selectedPackagingId = ref('stdbox')
const orderQuantity = ref(1)

const customerForm = ref({
  name: '',
  phone: '',
  city: 'Casablanca',
  address: '',
  notes: ''
})

const isOrdering = ref(false)
const showSuccessModal = ref(false)
const lastOrder = ref(null)

const currentVariant = computed(() => {
  return product.value?.variants?.find(v => v.id === selectedVariantId.value) || product.value?.variants?.[0]
})

const selectedPackaging = computed(() => {
  return PACKAGING_OPTIONS.find(p => p.id === selectedPackagingId.value) || PACKAGING_OPTIONS[0]
})

const finalUnitPrice = computed(() => {
  const basePrice = Number(currentVariant.value?.price || product.value?.price) || 0
  const boxExtra = Number(selectedPackaging.value?.extraPrice) || 0
  return basePrice + boxExtra
})

const totalPrice = computed(() => {
  return finalUnitPrice.value * orderQuantity.value
})

const checkoutTotalAmount = computed(() => {
  if (store.cart.length > 0) {
    return store.cartTotalPrice
  }
  return totalPrice.value
})

const filteredCatalogProducts = computed(() => {
  let list = store.products || []
  if (selectedCategoryFilter.value !== 'all') {
    list = list.filter(p => p.category === selectedCategoryFilter.value)
  }
  const q = catalogSearchQuery.value.trim().toLowerCase()
  if (q) {
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.brand || '').toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    )
  }
  return list
})

const isCopied = ref(false)

function selectProductAndOrder(p) {
  store.selectedLandingProductId = p.id
  selectedVariantId.value = p.variants?.[0]?.id || ''
  storePage.value = 'order'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function openCheckoutModal() {
  showCartDrawer.value = false
  showCheckoutModal.value = true
}

function openProductCheckoutModal(p) {
  store.selectedLandingProductId = p.id
  selectedVariantId.value = p.variants?.[0]?.id || ''
  showCheckoutModal.value = true
}

function handleAddCurrentToCart() {
  store.addToCart({
    product: product.value,
    variant: currentVariant.value,
    packagingOption: selectedPackaging.value,
    quantity: orderQuantity.value
  })
  showCartDrawer.value = true
}

function handleProductQuickAddToCart(p) {
  store.addToCart({
    product: p,
    variant: p.variants?.[0],
    packagingOption: PACKAGING_OPTIONS[0],
    quantity: 1
  })
  showCartDrawer.value = true
}

function copyProductShareLink() {
  const url = `${window.location.origin}/?product=${product.value.id}`
  navigator.clipboard.writeText(url)
  isCopied.value = true
  store.notify('Lien unique copié !')
  setTimeout(() => { isCopied.value = false }, 2500)
}

function incrementQty() {
  const maxStock = currentVariant.value?.stock || 1
  if (orderQuantity.value < maxStock) {
    orderQuantity.value++
  } else {
    store.notify('Quantité maximale disponible atteinte')
  }
}

function decrementQty() {
  if (orderQuantity.value > 1) {
    orderQuantity.value--
  }
}

async function handleCheckoutSubmit() {
  if (!customerForm.value.name || !customerForm.value.phone) {
    return store.notify('Veuillez saisir votre nom et numéro de téléphone')
  }

  isOrdering.value = true

  let itemsToOrder = []

  if (store.cart.length > 0) {
    itemsToOrder = store.cart.map(i => ({
      productId: i.productId,
      variantId: i.variantId,
      price: i.price,
      purchasePrice: i.purchasePrice,
      quantity: i.quantity,
      packagingOption: i.packagingOption
    }))
  } else {
    itemsToOrder = [{
      productId: product.value.id,
      variantId: currentVariant.value.id,
      price: finalUnitPrice.value,
      purchasePrice: currentVariant.value.purchasePrice || product.value.purchasePrice,
      quantity: orderQuantity.value,
      packagingOption: selectedPackaging.value
    }]
  }

  const createdSale = await store.createSaleOrder({
    customerName: customerForm.value.name,
    customerPhone: customerForm.value.phone,
    customerCity: customerForm.value.city,
    customerAddress: customerForm.value.address,
    customerNotes: customerForm.value.notes,
    paymentMethod: 'Paiement à la Livraison (COD)',
    items: itemsToOrder
  })

  isOrdering.value = false
  if (createdSale) {
    lastOrder.value = createdSale
    showCheckoutModal.value = false
    showSuccessModal.value = true
    store.clearCart()
  }

  customerForm.value = { name: '', phone: '', city: 'Casablanca', address: '', notes: '' }
}

function getWhatsAppUrl(orderNumber) {
  const msg = encodeURIComponent(`Bonjour ELMORÉ, je viens de passer la commande N° ${orderNumber}. Merci de me confirmer la livraison !`)
  return `https://wa.me/212661889900?text=${msg}`
}
</script>

<template>
  <div v-if="product" class="ayla-container">
    <!-- Announcement Bar Sticky Top -->
    <div class="ayla-announcement-bar">
      ✨ <span>LIVRAISON GRATUITE PARTOUT AU MAROC 🇲🇦</span> · PAIEMENT À LA LIVRAISON (COD) · SATISFAIT OU ÉCHANGÉ ✨
    </div>

    <!-- Luxury Maison Ayla Header -->
    <header class="ayla-header">
      <div class="ayla-logo" @click="storePage = 'home'">
        <img src="/logo.png" alt="ELMORÉ" />
        <span class="ayla-logo-text">ELMORÉ</span>
      </div>

      <nav class="ayla-nav-links">
        <span class="ayla-nav-link" :class="{ active: storePage === 'home' }" @click="storePage = 'home'">ACCUEIL</span>
        <span class="ayla-nav-link" :class="{ active: storePage === 'catalog' }" @click="storePage = 'catalog'">CATALOGUE</span>
        <span class="ayla-nav-link" :class="{ active: storePage === 'order' }" @click="storePage = 'order'">COMMANDER</span>
        <span class="ayla-nav-link" :class="{ active: storePage === 'reviews' }" @click="storePage = 'reviews'">AVIS CLIENTS</span>
      </nav>

      <div style="display: flex; align-items: center; gap: 14px;">
        <!-- CART BUTTON WITH COUNTER BADGE -->
        <button class="ayla-btn-gold" style="padding: 8px 16px; font-size: 11px; display: flex; align-items: center; gap: 6px; position: relative;" @click="showCartDrawer = true">
          <ShoppingCart :size="15" />
          <span>Panier</span>
          <span v-if="store.cartTotalCount > 0" style="background: #ef4444; color: #ffffff; border-radius: 50%; width: 18px; height: 18px; display: grid; place-items: center; font-size: 10px; font-weight: 800;">
            {{ store.cartTotalCount }}
          </span>
        </button>

        <button class="ayla-btn-emerald" style="padding: 8px 16px; font-size: 11px;" @click="store.activeTab = 'dashboard'">
          <Settings :size="13" /> 🛠️ Admin
        </button>
      </div>
    </header>

    <!-- ====================================================================
         PAGE 1: ACCUEIL / FULL-WIDTH HERO OVERLAY SHOWCASE
         ==================================================================== -->
    <main v-if="storePage === 'home'">
      <!-- Full-Width Hero Section with Image Background & Text Overlay -->
      <section class="ayla-hero-fullwidth">
        <div class="ayla-hero-overlay-content">
          <div class="ayla-badge-rating" style="background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(10px); color: #ffffff; border: 1px solid rgba(255,255,255,0.2);">
            <span style="color: #f59e0b; display: flex; gap: 2px;">
              <Star :size="14" fill="#f59e0b" /><Star :size="14" fill="#f59e0b" /><Star :size="14" fill="#f59e0b" /><Star :size="14" fill="#f59e0b" /><Star :size="14" fill="#f59e0b" />
            </span>
            <span>4.9/5 · Plus de 1 400 avis vérifiés au Maroc</span>
          </div>

          <h1 class="ayla-hero-overlay-title">HORLOGERIE & ACCESSOIRES DE LUXE</h1>
          <p class="ayla-hero-overlay-subtitle">
            Alliez l'élégance suprême à la précision mécanique. Conçus en acier inoxydable 316L chirurgical avec verre saphir inrayable.
          </p>

          <div style="display: flex; align-items: baseline; justify-content: center; gap: 16px; margin-bottom: 32px;">
            <span style="font-size: 42px; font-weight: 900; color: var(--ay-gold); font-family: 'Instrument Sans', sans-serif;">
              À partir de {{ product.price }} DH
            </span>
            <span style="font-size: 22px; color: #cbd5e1; text-decoration: line-through;">
              {{ Math.round(product.price * 1.35) }} DH
            </span>
          </div>

          <div style="display: flex; gap: 16px; justify-content: center; flex-wrap: wrap;">
            <button class="ayla-btn-emerald" style="background: var(--ay-gold); border-color: var(--ay-gold); color: #ffffff; font-size: 14px; padding: 18px 36px;" @click="storePage = 'catalog'">
              DÉCOUVRIR LE CATALOGUE <Grid :size="18" />
            </button>
            <button class="ayla-btn-emerald" style="font-size: 14px; padding: 18px 36px;" @click="openCheckoutModal()">
              ⚡ COMMANDER EN POPUP <ArrowRight :size="18" />
            </button>
          </div>
        </div>
      </section>

      <!-- Product Cards Grid Section under Hero -->
      <section class="ayla-hero" style="padding-top: 50px; padding-bottom: 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <span style="color: var(--ay-gold); font-size: 12px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase;">NOTRE SELECTION EN VEDETTE</span>
          <h2 style="font-family: 'Instrument Sans', sans-serif; font-size: 30px; font-weight: 700; color: var(--ay-emerald); text-transform: uppercase; margin-top: 4px;">
            NOS CARTES PRODUITS EXCLUSIVES
          </h2>
          <p style="font-size: 14px; color: var(--ay-muted);">Ajoutez au panier ou commandez directement en 1-clic popup</p>
        </div>

        <div class="ayla-catalog-grid">
          <div
            v-for="p in store.products"
            :key="p.id"
            class="ayla-product-catalog-card"
          >
            <div class="ayla-card-img-wrapper" @click="selectProductAndOrder(p)">
              <span class="ayla-card-badge">Best-Seller</span>
              <img :src="p.image || '/luxury_hero.png'" :alt="p.name" class="ayla-card-img" />
            </div>

            <div class="ayla-card-body">
              <div class="ayla-card-category">{{ p.brand || 'ELMORÉ' }} · {{ p.category }}</div>
              <h3 class="ayla-card-title" @click="selectProductAndOrder(p)">{{ p.name }}</h3>

              <div style="display: flex; align-items: center; gap: 4px; color: #f59e0b; font-size: 11px; margin-bottom: 8px;">
                <Star :size="13" fill="#f59e0b" /><Star :size="13" fill="#f59e0b" /><Star :size="13" fill="#f59e0b" /><Star :size="13" fill="#f59e0b" /><Star :size="13" fill="#f59e0b" />
                <span style="color: var(--ay-muted); margin-left: 4px; font-weight: 700;">4.9 (140+ avis)</span>
              </div>

              <div class="ayla-card-price-row">
                <span class="ayla-card-price">{{ p.price }} DH</span>
                <span class="ayla-card-old-price">{{ Math.round(p.price * 1.35) }} DH</span>
              </div>

              <div style="display: flex; gap: 8px; margin-top: 14px;">
                <button class="ayla-btn-gold" style="flex: 1; padding: 10px; font-size: 11px; justify-content: center;" @click="handleProductQuickAddToCart(p)">
                  <ShoppingCart :size="14" /> Panier
                </button>
                <button class="ayla-btn-emerald" style="flex: 1.2; padding: 10px; font-size: 11px; justify-content: center;" @click="openProductCheckoutModal(p)">
                  ⚡ Commander
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Trust Badges Section -->
      <section class="ayla-hero" style="padding-top: 10px;">
        <div class="ayla-trust-grid">
          <div class="ayla-trust-card">
            <div class="ayla-trust-icon"><Truck :size="24" /></div>
            <h4>LIVRAISON GRATUITE</h4>
            <p>Expédition sous 24h à Casablanca, Rabat & partout au Maroc.</p>
          </div>

          <div class="ayla-trust-card">
            <div class="ayla-trust-icon"><ShieldCheck :size="24" /></div>
            <h4>QUALITÉ GARANTIE 2 ANS</h4>
            <p>Acier Inoxydable 316L inaltérable qui ne rouille jamais.</p>
          </div>

          <div class="ayla-trust-card">
            <div class="ayla-trust-icon"><Gift :size="24" /></div>
            <h4>ÉCRIN LUXE OFFERT</h4>
            <p>Chaque pièce est livrée dans son coffret prestige rigide.</p>
          </div>

          <div class="ayla-trust-card">
            <div class="ayla-trust-icon"><Award :size="24" /></div>
            <h4>INSPECTER AVANT DE PAYER</h4>
            <p>Vérifiez votre colis lors de la livraison en espèces.</p>
          </div>
        </div>
      </section>
    </main>

    <!-- ====================================================================
         PAGE 2: CATALOGUE DÉDIÉ
         ==================================================================== -->
    <main v-else-if="storePage === 'catalog'" class="ayla-hero">
      <div style="text-align: center; max-width: 800px; margin: 0 auto 36px auto;">
        <span style="color: var(--ay-gold); font-size: 12px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase;">PARCOUREZ NOS COLLECTIONS</span>
        <h1 style="font-family: 'Instrument Sans', sans-serif; font-size: 36px; font-weight: 700; color: var(--ay-emerald); text-transform: uppercase; margin-top: 6px;">
          NOTRE CATALOGUE EXCLUSIF
        </h1>
        <p style="font-size: 14px; color: var(--ay-muted);">Ajoutez des articles au panier ou passez commande en fenêtre modale express</p>
      </div>

      <!-- Filter Bar & Search -->
      <div style="background: #ffffff; border: 1px solid var(--ay-border); border-radius: 12px; padding: 16px 24px; margin-bottom: 32px; display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap;">
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <button
            style="padding: 8px 16px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s;"
            :style="selectedCategoryFilter === 'all' ? 'background: var(--ay-emerald); color: #ffffff; border: 1px solid var(--ay-emerald);' : 'background: #ffffff; color: var(--ay-dark); border: 1px solid var(--ay-border);'"
            @click="selectedCategoryFilter = 'all'"
          >
            Toutes les Catégories ({{ store.products.length }})
          </button>
          <button
            style="padding: 8px 16px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s;"
            :style="selectedCategoryFilter === 'Montres & Horlogerie' ? 'background: var(--ay-emerald); color: #ffffff; border: 1px solid var(--ay-emerald);' : 'background: #ffffff; color: var(--ay-dark); border: 1px solid var(--ay-border);'"
            @click="selectedCategoryFilter = 'Montres & Horlogerie'"
          >
            Montres & Horlogerie
          </button>
          <button
            style="padding: 8px 16px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s;"
            :style="selectedCategoryFilter === 'Vêtements Cuir' ? 'background: var(--ay-emerald); color: #ffffff; border: 1px solid var(--ay-emerald);' : 'background: #ffffff; color: var(--ay-dark); border: 1px solid var(--ay-border);'"
            @click="selectedCategoryFilter = 'Vêtements Cuir'"
          >
            Vêtements Cuir
          </button>
        </div>

        <div style="position: relative; width: 260px;">
          <input v-model="catalogSearchQuery" placeholder="Rechercher produit..." class="form-control" style="border: 1px solid var(--ay-border); padding: 8px 12px 8px 34px; border-radius: 6px; font-size: 12px;" />
          <Search :size="15" style="position: absolute; left: 10px; top: 10px; color: var(--ay-muted);" />
        </div>
      </div>

      <!-- Dedicated Product Cards Grid -->
      <div class="ayla-catalog-grid">
        <div
          v-for="p in filteredCatalogProducts"
          :key="p.id"
          class="ayla-product-catalog-card"
        >
          <div class="ayla-card-img-wrapper" @click="selectProductAndOrder(p)">
            <span class="ayla-card-badge">Best-Seller</span>
            <img :src="p.image || '/luxury_hero.png'" :alt="p.name" class="ayla-card-img" />
          </div>

          <div class="ayla-card-body">
            <div class="ayla-card-category">{{ p.brand || 'ELMORÉ' }} · {{ p.category }}</div>
            <h3 class="ayla-card-title" @click="selectProductAndOrder(p)">{{ p.name }}</h3>

            <div style="display: flex; align-items: center; gap: 4px; color: #f59e0b; font-size: 11px; margin-bottom: 8px;">
              <Star :size="13" fill="#f59e0b" /><Star :size="13" fill="#f59e0b" /><Star :size="13" fill="#f59e0b" /><Star :size="13" fill="#f59e0b" /><Star :size="13" fill="#f59e0b" />
              <span style="color: var(--ay-muted); margin-left: 4px; font-weight: 700;">4.9 (140+ avis)</span>
            </div>

            <div class="ayla-card-price-row">
              <span class="ayla-card-price">{{ p.price }} DH</span>
              <span class="ayla-card-old-price">{{ Math.round(p.price * 1.35) }} DH</span>
            </div>

            <div style="display: flex; gap: 8px; margin-top: 14px;">
              <button class="ayla-btn-gold" style="flex: 1; padding: 10px; font-size: 11px; justify-content: center;" @click="handleProductQuickAddToCart(p)">
                <ShoppingCart :size="14" /> Panier
              </button>
              <button class="ayla-btn-emerald" style="flex: 1.2; padding: 10px; font-size: 11px; justify-content: center;" @click="openProductCheckoutModal(p)">
                ⚡ Commander
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- ====================================================================
         PAGE 3: PAGE DE PERSONNALISATION DE COMMANDE
         ==================================================================== -->
    <main v-else-if="storePage === 'order'" class="ayla-hero">
      <div style="text-align: center; max-width: 800px; margin: 0 auto 32px auto;">
        <span style="color: var(--ay-gold); font-size: 12px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase;">PERSONNALISATION</span>
        <h1 style="font-family: 'Instrument Sans', sans-serif; font-size: 32px; font-weight: 700; color: var(--ay-emerald); text-transform: uppercase; margin-top: 6px;">
          CHOISIR FINITION & OPTIONAL EMBALLAGE
        </h1>
      </div>

      <div class="ayla-product-card" style="max-width: 860px; margin: 0 auto;">
        <div style="display: flex; gap: 24px; align-items: center; border-bottom: 1px solid var(--ay-border); padding-bottom: 24px; margin-bottom: 24px;">
          <img :src="currentVariant?.image || product.image || '/luxury_hero.png'" style="width: 110px; height: 110px; object-fit: contain; background: #F8FAFC; border-radius: 12px; padding: 8px; border: 2px solid var(--ay-emerald);" />
          <div>
            <span style="font-size: 11px; font-weight: 700; color: var(--ay-gold); text-transform: uppercase;">{{ product.brand }} · {{ product.category }}</span>
            <h2 style="font-family: 'Instrument Sans', sans-serif; font-size: 22px; font-weight: 700; color: var(--ay-emerald); margin: 4px 0;">{{ product.name }}</h2>
            <div style="font-size: 13px; font-weight: 700; color: var(--ay-muted); margin-bottom: 4px;">Finition sélectionnée : <span style="color: var(--ay-emerald);">{{ currentVariant?.color }} · {{ currentVariant?.size }}</span></div>
            <div style="font-size: 22px; font-weight: 800; color: var(--ay-emerald);">{{ finalUnitPrice }} DH</div>
          </div>

          <button class="btn-secondary" style="margin-left: auto; font-size: 11px;" @click="storePage = 'catalog'">
            Changer de produit
          </button>
        </div>

        <div style="margin-bottom: 24px;">
          <label style="font-size: 13px; font-weight: 800; color: var(--ay-emerald); text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 10px;">
            1. CHOISIR LA FINITION & COULEUR :
          </label>

          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            <button
              v-for="v in product.variants"
              :key="v.id"
              style="padding: 10px 16px; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 10px;"
              :style="selectedVariantId === v.id ? 'background: var(--ay-emerald); color: #ffffff; border: 1px solid var(--ay-emerald);' : 'background: #ffffff; color: var(--ay-dark); border: 1px solid var(--ay-border);'"
              @click="selectedVariantId = v.id"
            >
              <img :src="v.image || product.image || '/luxury_hero.png'" style="width: 28px; height: 28px; object-fit: contain; border-radius: 4px; background: #ffffff; padding: 2px;" />
              <span>{{ v.color }} · {{ v.size }}</span>
            </button>
          </div>
        </div>

        <div style="margin-bottom: 24px;">
          <label style="font-size: 13px; font-weight: 800; color: var(--ay-emerald); text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 10px;">
            2. CHOISIR LE COFFRET / EMBALLAGE :
          </label>

          <div class="packaging-selector">
            <div
              v-for="boxOption in PACKAGING_OPTIONS"
              :key="boxOption.id"
              class="packaging-card"
              :class="{ active: selectedPackagingId === boxOption.id }"
              @click="selectedPackagingId = boxOption.id"
            >
              <div>
                <div class="box-title">
                  <span>{{ boxOption.icon }}</span> {{ boxOption.label }}
                </div>
                <small style="color: var(--text-muted); font-size: 11px; display: block;">{{ boxOption.note }}</small>
              </div>
              <div class="box-price" style="margin-top: 8px;">
                {{ boxOption.extraPrice === 0 ? 'Inclus Gratuitement' : `+${boxOption.extraPrice} DH` }}
              </div>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 14px; margin-top: 20px;">
          <button class="ayla-btn-gold" style="flex: 1; padding: 18px; font-size: 14px; justify-content: center;" @click="handleAddCurrentToCart">
            <ShoppingCart :size="18" /> AJOUTER AU PANIER
          </button>
          <button class="ayla-btn-emerald" style="flex: 1.5; padding: 18px; font-size: 14px; justify-content: center;" @click="openCheckoutModal()">
            ⚡ PASSER LA COMMANDE MODALE ({{ totalPrice }} DH)
          </button>
        </div>
      </div>
    </main>

    <!-- ====================================================================
         PAGE 4: AVIS CLIENTS DÉDIÉ
         ==================================================================== -->
    <main v-else-if="storePage === 'reviews'" class="ayla-hero">
      <div style="text-align: center; max-width: 800px; margin: 0 auto 36px auto;">
        <span style="color: var(--ay-gold); font-size: 12px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase;">AVIS DE NOS CLIENTS AU MAROC</span>
        <h1 style="font-family: 'Instrument Sans', sans-serif; font-size: 32px; font-weight: 700; color: var(--ay-emerald); text-transform: uppercase; margin-top: 6px;">
          TÉMOIGNAGES & SATISFACTION CLIENT
        </h1>
      </div>

      <div class="ayla-reviews-grid">
        <div class="ayla-review-card">
          <div class="ayla-review-user">
            <div class="ayla-review-avatar">YB</div>
            <div>
              <b style="font-size: 14px; display: block; color: var(--ay-emerald);">Youssef B.</b>
              <span style="font-size: 11px; color: #2e7d32; font-weight: 700;">✓ Achat Vérifié · Casablanca</span>
            </div>
          </div>
          <div style="color: #f59e0b; margin-bottom: 8px; display: flex; gap: 2px;">
            <Star :size="14" fill="#f59e0b" /><Star :size="14" fill="#f59e0b" /><Star :size="14" fill="#f59e0b" /><Star :size="14" fill="#f59e0b" /><Star :size="14" fill="#f59e0b" />
          </div>
          <p style="font-size: 13px; color: var(--ay-dark); line-height: 1.5;">
            "Montre incroyable! Le mouvement automatique est d'une précision parfaite et la finition en acier est juste magnifique. Reçue à Casablanca en moins de 24h."
          </p>
        </div>

        <div class="ayla-review-card">
          <div class="ayla-review-user">
            <div class="ayla-review-avatar">FK</div>
            <div>
              <b style="font-size: 14px; display: block; color: var(--ay-emerald);">Fatima-Zohra K.</b>
              <span style="font-size: 11px; color: #2e7d32; font-weight: 700;">✓ Achat Vérifié · Rabat</span>
            </div>
          </div>
          <div style="color: #f59e0b; margin-bottom: 8px; display: flex; gap: 2px;">
            <Star :size="14" fill="#f59e0b" /><Star :size="14" fill="#f59e0b" /><Star :size="14" fill="#f59e0b" /><Star :size="14" fill="#f59e0b" /><Star :size="14" fill="#f59e0b" />
          </div>
          <p style="font-size: 13px; color: var(--ay-dark); line-height: 1.5;">
            "Service client très disponible sur WhatsApp. Le coffret de luxe en bois est splendide pour faire un cadeau."
          </p>
        </div>
      </div>
    </main>

    <!-- Maison Ayla Style Footer -->
    <footer class="ayla-footer">
      <div class="ayla-footer-inner">
        <div>
          <h3 style="font-family: 'Instrument Sans', sans-serif; font-size: 22px; color: var(--ay-gold); letter-spacing: 0.15em; margin-bottom: 12px;">
            ELMORÉ LUXURY
          </h3>
          <p>Maison de luxe spécialisée dans l'horlogerie et les accessoires de haute finition au Maroc.</p>
        </div>
        <div>
          <h4>NAVIGATION</h4>
          <p><span style="cursor: pointer;" @click="storePage = 'home'">Accueil</span></p>
          <p><span style="cursor: pointer;" @click="storePage = 'catalog'">Catalogue</span></p>
          <p><span style="cursor: pointer;" @click="storePage = 'order'">Commander</span></p>
        </div>
        <div>
          <h4>CONTACT</h4>
          <p>📍 Casablanca, Maroc</p>
          <p>📞 WhatsApp: +212 661-889900</p>
        </div>
      </div>
    </footer>

    <!-- ====================================================================
         MODAL 1: SHOPPING CART SLIDE-OVER DRAWER (MODAL PANIER)
         ==================================================================== -->
    <div v-if="showCartDrawer" class="modal-overlay" @click.self="showCartDrawer = false">
      <div class="modal-card" style="max-width: 480px; width: 100%; border-radius: 16px; padding: 24px; max-height: 88vh; display: flex; flex-direction: column;">
        <div class="modal-header">
          <h3 style="display: flex; align-items: center; gap: 8px; color: var(--ay-emerald);">
            <ShoppingCart :size="20" /> Votre Panier ({{ store.cartTotalCount }})
          </h3>
          <button class="close-btn" @click="showCartDrawer = false"><X :size="18"/></button>
        </div>

        <div style="flex: 1; overflow-y: auto; margin-top: 14px; padding-right: 4px;">
          <div v-if="store.cart.length === 0" style="text-align: center; padding: 40px 10px; color: var(--ay-muted);">
            <ShoppingCart :size="48" style="opacity: 0.3; margin-bottom: 12px;" />
            <p style="font-size: 14px; font-weight: 700;">Votre panier est actuellement vide.</p>
            <button class="ayla-btn-emerald" style="margin-top: 14px; font-size: 12px;" @click="showCartDrawer = false; storePage = 'catalog';">
              Découvrir nos produits
            </button>
          </div>

          <div v-else>
            <div
              v-for="item in store.cart"
              :key="item.id"
              style="display: flex; gap: 14px; align-items: center; border-bottom: 1px solid var(--ay-border); padding-bottom: 12px; margin-bottom: 12px;"
            >
              <img :src="item.image || '/luxury_hero.png'" style="width: 56px; height: 56px; object-fit: contain; background: #F8FAFC; border-radius: 8px; border: 1px solid var(--ay-border); padding: 4px;" />
              <div style="flex: 1;">
                <b style="font-size: 13px; color: var(--ay-emerald); display: block;">{{ item.name }}</b>
                <span style="font-size: 11px; color: var(--ay-muted); display: block;">{{ item.variantName }} · {{ item.packagingOption?.label }}</span>
                <b style="font-size: 13px; color: var(--ay-gold);">{{ item.price }} DH</b>
              </div>

              <div style="display: flex; align-items: center; gap: 6px; background: #f1f5f9; padding: 4px 8px; border-radius: 6px;">
                <button style="border: none; background: transparent; font-weight: 800; cursor: pointer;" @click="store.updateCartQuantity(item.id, -1)">-</button>
                <span style="font-size: 12px; font-weight: 800; width: 16px; text-align: center;">{{ item.quantity }}</span>
                <button style="border: none; background: transparent; font-weight: 800; cursor: pointer;" @click="store.updateCartQuantity(item.id, 1)">+</button>
              </div>

              <button style="border: none; background: transparent; color: #ef4444; cursor: pointer; padding: 4px;" @click="store.removeFromCart(item.id)">
                <Trash2 :size="16" />
              </button>
            </div>
          </div>
        </div>

        <div v-if="store.cart.length > 0" style="border-top: 1px solid var(--ay-border); padding-top: 16px; margin-top: 10px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px;">
            <span style="color: var(--ay-muted);">Livraison :</span>
            <b style="color: #2e7d32;">Gratuite partout au Maroc (0 DH)</b>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 16px;">
            <b>Total Général TTC :</b>
            <b style="color: var(--ay-emerald); font-size: 20px;">{{ store.cartTotalPrice }} DH</b>
          </div>

          <button class="ayla-btn-emerald" style="width: 100%; justify-content: center; padding: 14px; font-size: 14px;" @click="openCheckoutModal">
            PASSER LA COMMANDE ({{ store.cartTotalPrice }} DH) <ArrowRight :size="16" />
          </button>
        </div>
      </div>
    </div>

    <!-- ====================================================================
         MODAL 2: EXPRESS CHECKOUT POPUP MODAL (MODAL CHECKOUT)
         ==================================================================== -->
    <div v-if="showCheckoutModal" class="modal-overlay" @click.self="showCheckoutModal = false">
      <div class="modal-card" style="max-width: 600px; width: 100%; border-radius: 16px; padding: 28px; border: 2px solid var(--ay-emerald);">
        <div class="modal-header" style="border-bottom: 1px solid var(--ay-border); padding-bottom: 12px; margin-bottom: 18px;">
          <h3 style="font-family: 'Instrument Sans', sans-serif; font-size: 20px; font-weight: 700; color: var(--ay-emerald); text-transform: uppercase;">
            📦 COMMANDE EXPRESS (PAIEMENT À LA LIVRAISON)
          </h3>
          <button class="close-btn" @click="showCheckoutModal = false"><X :size="18"/></button>
        </div>

        <!-- Order Items Summary in Modal -->
        <div style="background: #F8FAFC; border: 1px solid var(--ay-border); border-radius: 10px; padding: 14px; margin-bottom: 18px; max-height: 160px; overflow-y: auto;">
          <b style="font-size: 12px; color: var(--ay-gold); text-transform: uppercase; display: block; margin-bottom: 8px;">RÉCAPITULATIF DE LA COMMANDE :</b>
          
          <div v-if="store.cart.length > 0">
            <div v-for="item in store.cart" :key="item.id" style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
              <span>{{ item.name }} ({{ item.variantName }}) x{{ item.quantity }}</span>
              <b>{{ item.price * item.quantity }} DH</b>
            </div>
          </div>
          <div v-else style="display: flex; justify-content: space-between; font-size: 12px;">
            <span>{{ product.name }} ({{ currentVariant?.color }} · {{ currentVariant?.size }}) x{{ orderQuantity }}</span>
            <b>{{ totalPrice }} DH</b>
          </div>

          <div style="border-top: 1px solid var(--ay-border); margin-top: 8px; padding-top: 8px; display: flex; justify-content: space-between; font-size: 14px;">
            <b>TOTAL A PAYER À LA LIVRAISON :</b>
            <b style="color: var(--ay-emerald); font-size: 16px;">{{ checkoutTotalAmount }} DH</b>
          </div>
        </div>

        <!-- Delivery Form inside Modal -->
        <form @submit.prevent="handleCheckoutSubmit">
          <div class="grid-2" style="margin-bottom: 12px;">
            <div class="form-group">
              <label style="font-size: 12px; font-weight: 700;">Nom & Prénom *</label>
              <input v-model="customerForm.name" class="form-control" style="border: 1px solid var(--ay-border); padding: 10px; background: #ffffff;" required placeholder="Ex: Mohamed Alami" />
            </div>
            <div class="form-group">
              <label style="font-size: 12px; font-weight: 700;">Téléphone WhatsApp *</label>
              <input v-model="customerForm.phone" class="form-control" style="border: 1px solid var(--ay-border); padding: 10px; background: #ffffff;" required placeholder="Ex: 06 61 22 33 44" />
            </div>
          </div>

          <div class="grid-2" style="margin-bottom: 12px;">
            <div class="form-group">
              <label style="font-size: 12px; font-weight: 700;">Ville *</label>
              <select v-model="customerForm.city" class="form-control" style="border: 1px solid var(--ay-border); padding: 10px; background: #ffffff;">
                <option value="Casablanca">Casablanca</option>
                <option value="Rabat">Rabat</option>
                <option value="Marrakech">Marrakech</option>
                <option value="Tangier">Tanger</option>
                <option value="Safi">Safi</option>
                <option value="Agadir">Agadir</option>
                <option value="Fès">Fès</option>
                <option value="Meknès">Meknès</option>
                <option value="Oujda">Oujda</option>
                <option value="Autre Ville">Autre Ville</option>
              </select>
            </div>
            <div class="form-group">
              <label style="font-size: 12px; font-weight: 700;">Adresse de Livraison</label>
              <input v-model="customerForm.address" class="form-control" style="border: 1px solid var(--ay-border); padding: 10px; background: #ffffff;" placeholder="Quartier, Rue, N° Appt" />
            </div>
          </div>

          <button type="submit" class="ayla-btn-emerald" style="width: 100%; justify-content: center; padding: 16px; font-size: 14px; margin-top: 6px;" :disabled="isOrdering">
            {{ isOrdering ? 'ENREGISTREMENT EN COURS...' : `CONFIRMER MA COMMANDE (${checkoutTotalAmount} DH)` }}
          </button>
        </form>
      </div>
    </div>

    <!-- ====================================================================
         MODAL 3: ORDER CONFIRMATION MODAL
         ==================================================================== -->
    <div v-if="showSuccessModal && lastOrder" class="modal-overlay" @click.self="showSuccessModal = false">
      <div class="modal-card" style="max-width: 540px; text-align: center; border-radius: 16px; padding: 36px; border: 2px solid var(--ay-emerald);">
        <div style="margin-bottom: 20px;">
          <div style="width: 64px; height: 64px; background: #e8f5e9; color: #2e7d32; border-radius: 50%; display: grid; place-items: center; margin: 0 auto 16px auto;">
            <CheckCircle2 :size="38" />
          </div>
          <h2 style="font-family: 'Instrument Sans', sans-serif; font-size: 24px; font-weight: 700; color: var(--ay-emerald); text-transform: uppercase;">
            COMMANDE CONFIRMÉE !
          </h2>
          <p style="color: var(--ay-muted); font-size: 14px;">Votre commande a été enregistrée sous la référence :</p>
          <div style="display: inline-block; background: var(--ay-emerald); color: var(--ay-gold); padding: 8px 20px; border-radius: 6px; font-size: 18px; font-weight: 800; margin-top: 10px; letter-spacing: 0.1em;">
            {{ lastOrder.orderNumber }}
          </div>
        </div>

        <div style="background: var(--ay-gold-light); border: 1px solid #f6dfc7; border-radius: 12px; padding: 20px; text-align: left; margin-bottom: 24px; font-size: 13px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="color: var(--ay-muted);">Client :</span>
            <b style="color: var(--ay-emerald);">{{ lastOrder.customerName }} ({{ lastOrder.customerPhone }})</b>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="color: var(--ay-muted);">Ville :</span>
            <b>{{ lastOrder.customerCity }}</b>
          </div>
          <div v-for="item in lastOrder.items" :key="item.variantId" style="display: flex; justify-content: space-between; border-top: 1px solid #ebd3ba; padding-top: 10px; margin-top: 10px;">
            <div>
              <b>{{ item.name }}</b>
              <span style="display: block; color: var(--ay-muted); font-size: 11px;">{{ item.variantName }} x{{ item.quantity }}</span>
            </div>
            <b style="color: var(--ay-emerald);">{{ item.subtotal }} DH</b>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          <a :href="getWhatsAppUrl(lastOrder.orderNumber)" target="_blank" class="ayla-btn-emerald" style="background: #25D366; border-color: #25D366; text-decoration: none; justify-content: center; font-size: 13px;">
            <MessageSquare :size="18" /> SUIVRE MA COMMANDE SUR WHATSAPP
          </a>
          <button class="btn-secondary" style="border-radius: 4px; justify-content: center; padding: 12px;" @click="showSuccessModal = false">
            FERMER
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
