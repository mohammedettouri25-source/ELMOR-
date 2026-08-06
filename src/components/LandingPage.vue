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
  Heart
} from 'lucide-vue-next'

const store = useInventoryStore()

// Page Navigation State: 'home' | 'catalog' | 'order' | 'reviews'
const storePage = ref('home')

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

async function handleLandingCheckout() {
  if (!customerForm.value.name || !customerForm.value.phone) {
    return store.notify('Veuillez saisir votre nom et numéro de téléphone')
  }

  if ((currentVariant.value?.stock || 0) <= 0) {
    return store.notify('Désolé, cette variante est en rupture de stock')
  }

  isOrdering.value = true

  const item = {
    productId: product.value.id,
    variantId: currentVariant.value.id,
    price: finalUnitPrice.value,
    quantity: orderQuantity.value,
    packagingOption: selectedPackaging.value
  }

  const createdSale = await store.createSaleOrder({
    customerName: customerForm.value.name,
    customerPhone: customerForm.value.phone,
    customerCity: customerForm.value.city,
    customerAddress: customerForm.value.address,
    customerNotes: customerForm.value.notes,
    paymentMethod: 'Paiement à la Livraison (COD)',
    items: [item]
  })

  isOrdering.value = false
  if (createdSale) {
    lastOrder.value = createdSale
    showSuccessModal.value = true
  }

  customerForm.value = { name: '', phone: '', city: 'Casablanca', address: '', notes: '' }
  orderQuantity.value = 1
}

function getWhatsAppUrl(orderNumber) {
  const msg = encodeURIComponent(`Bonjour ELMORÉ, je viens de passer la commande N° ${orderNumber}. Merci de me confirmer la livraison !`)
  return `https://wa.me/212661889900?text=${msg}`
}
</script>

<template>
  <div v-if="product" class="ayla-container">
    <!-- Announcement Bar Sticky Top (Maison Ayla Style) -->
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
        <button class="ayla-btn-gold" style="padding: 8px 16px; font-size: 11px;" @click="copyProductShareLink">
          {{ isCopied ? 'Lien copié ✓' : 'Partager' }}
        </button>

        <button class="ayla-btn-emerald" style="padding: 8px 16px; font-size: 11px;" @click="store.activeTab = 'dashboard'">
          <Settings :size="13" /> 🛠️ Admin
        </button>
      </div>
    </header>

    <!-- ====================================================================
         PAGE 1: ACCUEIL / HOME HERO SHOWCASE
         ==================================================================== -->
    <main v-if="storePage === 'home'">
      <section class="ayla-hero">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center;">
          <!-- Left Content -->
          <div>
            <div class="ayla-badge-rating">
              <span style="color: #f59e0b; display: flex; gap: 2px;">
                <Star :size="14" fill="#f59e0b" /><Star :size="14" fill="#f59e0b" /><Star :size="14" fill="#f59e0b" /><Star :size="14" fill="#f59e0b" /><Star :size="14" fill="#f59e0b" />
              </span>
              <span>4.9/5 · Plus de 1 400 avis vérifiés au Maroc</span>
            </div>

            <h1 class="ayla-title">HORLOGERIE & ACCESSOIRES DE LUXE</h1>
            <p class="ayla-subtitle">
              Alliez l'élégance suprême à la précision mécanique. Conçus en acier inoxydable 316L chirurgical avec verre saphir inrayable.
            </p>

            <div style="display: flex; align-items: baseline; gap: 16px; margin-bottom: 28px;">
              <span style="font-size: 38px; font-weight: 800; color: var(--ay-emerald); font-family: 'Instrument Sans', sans-serif;">
                À partir de {{ product.price }} DH
              </span>
              <span style="font-size: 20px; color: var(--ay-muted); text-decoration: line-through;">
                {{ Math.round(product.price * 1.35) }} DH
              </span>
            </div>

            <div style="display: flex; gap: 16px; margin-bottom: 32px;">
              <button class="ayla-btn-emerald" style="font-size: 13px; padding: 18px 32px;" @click="storePage = 'catalog'">
                DÉCOUVRIR LE CATALOGUE <Grid :size="18" />
              </button>
              <button class="ayla-btn-gold" style="font-size: 13px; padding: 18px 32px;" @click="storePage = 'order'">
                COMMANDER CE PRODUIT <ArrowRight :size="18" />
              </button>
            </div>

            <div style="display: flex; gap: 24px; font-size: 12px; color: var(--ay-dark); font-weight: 700;">
              <span>✓ Acier Inoxydable 316L</span>
              <span>✓ Garantie 2 Ans</span>
              <span>✓ Satisfait ou Échangé</span>
            </div>
          </div>

          <!-- Right Studio Professional Generated Image -->
          <div style="text-align: center;">
            <div style="background: #ffffff; border: 1px solid var(--ay-border); border-radius: 24px; padding: 24px; box-shadow: 0 16px 40px rgba(7, 60, 58, 0.08); position: relative;">
              <span style="position: absolute; top: 20px; left: 20px; background: var(--ay-emerald); color: #ffffff; font-size: 10px; font-weight: 800; padding: 4px 12px; border-radius: 4px; letter-spacing: 0.1em;">
                ÉDITION PRO LUXE
              </span>
              <img src="/luxury_hero.png" alt="ELMORÉ Luxury Watch" style="width: 100%; height: 380px; object-fit: cover; border-radius: 16px;" />
            </div>
          </div>
        </div>

        <!-- Trust Badges Section -->
        <div class="ayla-trust-grid" style="margin-top: 60px;">
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
         PAGE 2: CATALOGUE DÉDIÉ (DEDICATED PRODUCTS PAGE)
         ==================================================================== -->
    <main v-else-if="storePage === 'catalog'" class="ayla-hero">
      <div style="text-align: center; max-width: 800px; margin: 0 auto 36px auto;">
        <span style="color: var(--ay-gold); font-size: 12px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase;">PARCOUREZ NOS COLLECTIONS</span>
        <h1 style="font-family: 'Instrument Sans', sans-serif; font-size: 36px; font-weight: 700; color: var(--ay-emerald); text-transform: uppercase; margin-top: 6px;">
          NOTRE CATALOGUE EXCLUSIF
        </h1>
        <p style="font-size: 14px; color: var(--ay-muted);">Sélectionnez un produit pour accéder directement à sa fiche de commande 1-clic</p>
      </div>

      <!-- Filter Bar & Search -->
      <div style="background: #ffffff; border: 1px solid var(--ay-border); border-radius: 12px; padding: 16px 24px; margin-bottom: 32px; display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap;">
        <!-- Category Filter Pills -->
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

        <!-- Search Input -->
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
          @click="selectProductAndOrder(p)"
        >
          <div class="ayla-card-img-wrapper">
            <span class="ayla-card-badge">Best-Seller</span>
            <img :src="p.image || '/luxury_hero.png'" :alt="p.name" class="ayla-card-img" />
          </div>

          <div class="ayla-card-body">
            <div class="ayla-card-category">{{ p.brand || 'ELMORÉ' }} · {{ p.category }}</div>
            <h3 class="ayla-card-title">{{ p.name }}</h3>

            <div style="display: flex; align-items: center; gap: 4px; color: #f59e0b; font-size: 11px; margin-bottom: 8px;">
              <Star :size="13" fill="#f59e0b" /><Star :size="13" fill="#f59e0b" /><Star :size="13" fill="#f59e0b" /><Star :size="13" fill="#f59e0b" /><Star :size="13" fill="#f59e0b" />
              <span style="color: var(--ay-muted); margin-left: 4px; font-weight: 700;">4.9 (140+ avis)</span>
            </div>

            <div class="ayla-card-price-row">
              <span class="ayla-card-price">{{ p.price }} DH</span>
              <span class="ayla-card-old-price">{{ Math.round(p.price * 1.35) }} DH</span>
            </div>

            <button class="ayla-btn-emerald" style="width: 100%; margin-top: 14px; padding: 12px; font-size: 11px;" @click.stop="selectProductAndOrder(p)">
              COMMANDER EN 1-CLIC <ArrowRight :size="14" />
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- ====================================================================
         PAGE 3: PAGE DE COMMANDE DÉDIÉE (ORDER CUSTOMIZER PAGE)
         ==================================================================== -->
    <main v-else-if="storePage === 'order'" class="ayla-hero">
      <div style="text-align: center; max-width: 800px; margin: 0 auto 32px auto;">
        <span style="color: var(--ay-gold); font-size: 12px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase;">COMMANDE EXPRESS (COD)</span>
        <h1 style="font-family: 'Instrument Sans', sans-serif; font-size: 32px; font-weight: 700; color: var(--ay-emerald); text-transform: uppercase; margin-top: 6px;">
          PERSONNALISER & COMMANDER
        </h1>
        <p style="font-size: 13px; color: var(--ay-muted);">Livraison gratuite partout au Maroc · Paiement à la réception</p>
      </div>

      <div class="ayla-product-card" style="max-width: 860px; margin: 0 auto;">
        <!-- Product Header Summary -->
        <div style="display: flex; gap: 24px; align-items: center; border-bottom: 1px solid var(--ay-border); padding-bottom: 24px; margin-bottom: 24px;">
          <img :src="product.image || '/luxury_hero.png'" style="width: 100px; height: 100px; object-fit: contain; background: #F8FAFC; border-radius: 12px; padding: 8px; border: 1px solid var(--ay-border);" />
          <div>
            <span style="font-size: 11px; font-weight: 700; color: var(--ay-gold); text-transform: uppercase;">{{ product.brand }} · {{ product.category }}</span>
            <h2 style="font-family: 'Instrument Sans', sans-serif; font-size: 22px; font-weight: 700; color: var(--ay-emerald); margin: 4px 0;">{{ product.name }}</h2>
            <div style="font-size: 22px; font-weight: 800; color: var(--ay-emerald);">{{ finalUnitPrice }} DH</div>
          </div>

          <button class="btn-secondary" style="margin-left: auto; font-size: 11px;" @click="storePage = 'catalog'">
            Changer de produit
          </button>
        </div>

        <!-- 1. Select Variant -->
        <div style="margin-bottom: 24px;">
          <label style="font-size: 13px; font-weight: 800; color: var(--ay-emerald); text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 10px;">
            1. CHOISIR LA FINITION DE VOTRE PIÈCE :
          </label>

          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <button
              v-for="v in product.variants"
              :key="v.id"
              style="padding: 12px 20px; border-radius: 6px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s;"
              :style="selectedVariantId === v.id ? 'background: var(--ay-emerald); color: #ffffff; border: 1px solid var(--ay-emerald);' : 'background: #ffffff; color: var(--ay-dark); border: 1px solid var(--ay-border);'"
              @click="selectedVariantId = v.id"
            >
              {{ v.color }} · {{ v.size }} ({{ v.material || 'Acier' }})
            </button>
          </div>
        </div>

        <!-- 2. Packaging Choice -->
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

        <!-- 3. Quantity -->
        <div style="margin-bottom: 28px; background: var(--ay-gold-light); border: 1px solid #f6dfc7; padding: 16px 20px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span style="font-size: 14px; font-weight: 800; color: var(--ay-emerald); text-transform: uppercase;">QUANTITÉ :</span>
            <small style="color: var(--ay-dark); font-size: 12px; display: block;">Total Net TTC : <strong style="color: var(--ay-emerald); font-size: 16px;">{{ totalPrice }} DH</strong></small>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <button style="padding: 6px 14px; font-weight: 800; font-size: 16px; background: #ffffff; border: 1px solid var(--ay-border); border-radius: 4px; cursor: pointer;" @click="decrementQty">-</button>
            <span style="font-size: 18px; font-weight: 800; min-width: 24px; text-align: center; color: var(--ay-emerald);">{{ orderQuantity }}</span>
            <button style="padding: 6px 14px; font-weight: 800; font-size: 16px; background: #ffffff; border: 1px solid var(--ay-border); border-radius: 4px; cursor: pointer;" @click="incrementQty">+</button>
          </div>
        </div>

        <!-- 4. Delivery Form -->
        <form @submit.prevent="handleLandingCheckout">
          <label style="font-size: 13px; font-weight: 800; color: var(--ay-emerald); text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 12px;">
            3. INFORMATIONS DE LIVRAISON (MAROC) :
          </label>

          <div class="grid-2" style="margin-bottom: 14px;">
            <div class="form-group">
              <label style="font-size: 12px; font-weight: 700;">Nom & Prénom *</label>
              <input v-model="customerForm.name" class="form-control" style="border: 1px solid var(--ay-border); padding: 12px; background: #ffffff;" required placeholder="Ex: Mohamed Alami" />
            </div>
            <div class="form-group">
              <label style="font-size: 12px; font-weight: 700;">Téléphone WhatsApp *</label>
              <input v-model="customerForm.phone" class="form-control" style="border: 1px solid var(--ay-border); padding: 12px; background: #ffffff;" required placeholder="Ex: 06 61 22 33 44" />
            </div>
          </div>

          <div class="grid-2" style="margin-bottom: 14px;">
            <div class="form-group">
              <label style="font-size: 12px; font-weight: 700;">Ville *</label>
              <select v-model="customerForm.city" class="form-control" style="border: 1px solid var(--ay-border); padding: 12px; background: #ffffff;">
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
              <label style="font-size: 12px; font-weight: 700;">Adresse Complète de Livraison</label>
              <input v-model="customerForm.address" class="form-control" style="border: 1px solid var(--ay-border); padding: 12px; background: #ffffff;" placeholder="Quartier, Rue, N° Appt" />
            </div>
          </div>

          <button type="submit" class="ayla-btn-emerald" style="width: 100%; justify-content: center; padding: 18px; font-size: 15px; margin-top: 10px;" :disabled="isOrdering">
            {{ isOrdering ? 'ENREGISTREMENT...' : `CONFIRMER MA COMMANDE (${totalPrice} DH)` }}
          </button>
        </form>
      </div>
    </main>

    <!-- ====================================================================
         PAGE 4: AVIS CLIENTS DÉDIÉ (REVIEWS & TRUST PAGE)
         ==================================================================== -->
    <main v-else-if="storePage === 'reviews'" class="ayla-hero">
      <div style="text-align: center; max-width: 800px; margin: 0 auto 36px auto;">
        <span style="color: var(--ay-gold); font-size: 12px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase;">AVIS DE NOS CLIENTS AU MAROC</span>
        <h1 style="font-family: 'Instrument Sans', sans-serif; font-size: 32px; font-weight: 700; color: var(--ay-emerald); text-transform: uppercase; margin-top: 6px;">
          TÉMOIGNAGES & SATISFACTION CLIENT
        </h1>
        <p style="font-size: 14px; color: var(--ay-muted);">Plus de 1 400 clients satisfaits à Casablanca, Rabat, Marrakech et partout au Maroc</p>
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
            "Service client très disponible sur WhatsApp. Le coffret de luxe en bois est splendide pour faire un cadeau. Très satisfaite de mon achat chez ELMORÉ."
          </p>
        </div>

        <div class="ayla-review-card">
          <div class="ayla-review-user">
            <div class="ayla-review-avatar">AT</div>
            <div>
              <b style="font-size: 14px; display: block; color: var(--ay-emerald);">Amine T.</b>
              <span style="font-size: 11px; color: #2e7d32; font-weight: 700;">✓ Achat Vérifié · Marrakech</span>
            </div>
          </div>
          <div style="color: #f59e0b; margin-bottom: 8px; display: flex; gap: 2px;">
            <Star :size="14" fill="#f59e0b" /><Star :size="14" fill="#f59e0b" /><Star :size="14" fill="#f59e0b" /><Star :size="14" fill="#f59e0b" /><Star :size="14" fill="#f59e0b" />
          </div>
          <p style="font-size: 13px; color: var(--ay-dark); line-height: 1.5;">
            "Rapport qualité prix imbattable au Maroc pour une montre en acier 316L avec verre saphir. J'ai inspecté la montre avant de payer le livreur. Parfait!"
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
          <p>
            Maison de luxe spécialisée dans l'horlogerie et les accessoires de haute finition au Maroc. 
            Alliez l'élégance et la qualité suisse sans compromis.
          </p>
          <a :href="getWhatsAppUrl('SERVICE-CLIENT')" target="_blank" class="ayla-btn-gold" style="display: inline-flex; align-items: center; gap: 8px; margin-top: 16px; font-size: 11px; text-decoration: none;">
            <MessageSquare :size="16" /> SERVICE CLIENT WHATSAPP
          </a>
        </div>

        <div>
          <h4>NAVIGATION</h4>
          <p><span style="cursor: pointer;" @click="storePage = 'home'">Accueil</span></p>
          <p><span style="cursor: pointer;" @click="storePage = 'catalog'">Catalogue</span></p>
          <p><span style="cursor: pointer;" @click="storePage = 'order'">Commander</span></p>
          <p><span style="cursor: pointer;" @click="storePage = 'reviews'">Avis Clients</span></p>
        </div>

        <div>
          <h4>LIVRAISON</h4>
          <p>Casablanca (24h)</p>
          <p>Rabat & Salé (24h)</p>
          <p>Marrakech & Tanger (48h)</p>
          <p>Toutes Villes du Maroc</p>
        </div>

        <div>
          <h4>CONTACT</h4>
          <p>📍 Casablanca, Maroc</p>
          <p>📞 WhatsApp: +212 661-889900</p>
          <p>✉️ contact@elmore.ma</p>
        </div>
      </div>

      <div style="border-top: 1px solid rgba(255,255,255,0.1); margin-top: 40px; padding-top: 20px; text-align: center; font-size: 12px; color: #9ca3af;">
        © {{ new Date().getFullYear() }} ELMORÉ LUXURY. Tous droits réservés. Inspiré de l'excellence marocaine.
      </div>
    </footer>

    <!-- Order Confirmation Modal -->
    <div v-if="showSuccessModal && lastOrder" class="modal-overlay" @click.self="showSuccessModal = false">
      <div class="modal-card" style="max-width: 540px; text-align: center; border-radius: 16px; padding: 36px; border: 2px solid var(--ay-emerald);">
        <div style="margin-bottom: 20px;">
          <div style="width: 64px; height: 64px; background: #e8f5e9; color: #2e7d32; border-radius: 50%; display: grid; place-items: center; margin: 0 auto 16px auto;">
            <CheckCircle2 :size="38" />
          </div>
          <h2 style="font-family: 'Instrument Sans', sans-serif; font-size: 24px; font-weight: 700; color: var(--ay-emerald); text-transform: uppercase;">
            COMMANDE CONFIRMÉE !
          </h2>
          <p style="color: var(--ay-muted); font-size: 14px;">Votre commande a été enregistrée avec succès sous la référence :</p>
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
            <span style="color: var(--ay-muted);">Ville de Livraison :</span>
            <b>{{ lastOrder.customerCity }}</b>
          </div>
          <div v-for="item in lastOrder.items" :key="item.variantId" style="display: flex; justify-content: space-between; border-top: 1px solid #ebd3ba; padding-top: 10px; margin-top: 10px;">
            <div>
              <b>{{ item.name }}</b>
              <span style="display: block; color: var(--ay-muted); font-size: 11px;">{{ item.variantName }} ({{ item.packaging }}) x{{ item.quantity }}</span>
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
