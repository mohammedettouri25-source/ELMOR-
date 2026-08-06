<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useInventoryStore, PACKAGING_OPTIONS } from '../stores/inventory'
import { translations } from '../lib/translations'
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
  Minus,
  Globe
} from 'lucide-vue-next'

const store = useInventoryStore()

// Translations computed
const t = computed(() => translations[store.currentLang] || translations.ar)

// Page Navigation State: 'home' | 'catalog' | 'order' | 'reviews'
const storePage = ref('home')

const showCartDrawer = ref(false)
const showCheckoutModal = ref(false)

const selectedCategoryFilter = ref('all')
const catalogSearchQuery = ref('')

const product = computed(() => store.selectedLandingProduct)

const selectedVariantId = ref('')
const selectedPackagingId = ref('stdbox')
const orderQuantity = ref(1)

// Keep selectedVariantId in sync whenever product or landing product changes
watch(() => product.value?.id, () => {
  if (product.value?.variants?.length > 0) {
    selectedVariantId.value = product.value.variants[0].id
  }
}, { immediate: true })

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
  const packagings = store.packagings || []
  return packagings.find(p => p.id === selectedPackagingId.value) || packagings[0] || { extraPrice: 0, label: 'Sans Boîte' }
})

const finalUnitPrice = computed(() => {
  const basePrice = Number(product.value?.price || currentVariant.value?.price) || 0
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

const uniqueProducts = computed(() => {
  const map = new Map()
  const list = []
  for (const p of store.products || []) {
    if (p && p.id && !map.has(p.id)) {
      map.set(p.id, true)
      list.push(p)
    }
  }
  return list
})

// Similar products: same category, excluding current product
const similarProducts = computed(() => {
  if (!product.value) return []
  return uniqueProducts.value
    .filter(p => p.id !== product.value.id && p.category === product.value.category)
    .slice(0, 6)
    .concat(
      // If not enough in same category, fill with other products
      uniqueProducts.value
        .filter(p => p.id !== product.value.id && p.category !== product.value.category)
        .slice(0, Math.max(0, 6 - uniqueProducts.value.filter(p => p.id !== product.value.id && p.category === product.value.category).length))
    )
    .slice(0, 6)
})

const filteredCatalogProducts = computed(() => {
  let list = uniqueProducts.value
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

const reviewsList = computed(() => {
  const isAr = store.currentLang === 'ar'
  return [
    {
      id: 'rev-1',
      name: isAr ? 'سلمى البناني' : 'Salma Bennani',
      city: 'Casablanca / الدار البيضاء',
      initials: 'SB',
      rating: 5,
      date: isAr ? 'منذ يومين' : 'Il y a 2 jours',
      text: isAr
        ? 'تبارك الله السلسلة واعرة بزاف وصحيحة! ما كايتغيرش لونها كاع مع الماء والعطور. وصلتني للدار البيضاء فـ 24 ساعة وحليت الكولية عاينتها عاد خلصت.'
        : 'TBILAH le collier trèfle est magnifique! La finition est trop classe, ne change pas de couleur même sous la douche. Livré à Casa en 24h et j\'ai vérifié la commande avant de payer!'
    },
    {
      id: 'rev-2',
      name: isAr ? 'حمزة العمراني' : 'Hamza El Amrani',
      city: 'Rabat / الرباط',
      initials: 'HA',
      rating: 5,
      date: isAr ? 'منذ 4 أيام' : 'Il y a 4 jours',
      text: isAr
        ? 'خديت السلسلة الرجالية والساعة. الصراحة الستيل حر وممتاز وثقيلة فـ اليد. التعامل ديالهم فـ الواتساب راقي والتوصيل كان سريع للرباط.'
        : 'J\'ai acheté la gourmette homme et la montre chrono. Franchement la qualité 316L est top, lourde et très élégante. Service client au top sur WhatsApp.'
    },
    {
      id: 'rev-3',
      name: isAr ? 'خديجة زكي' : 'Khadija Zaki',
      city: 'Marrakech / مراكش',
      initials: 'KZ',
      rating: 5,
      date: isAr ? 'منذ أسبوع' : 'Il y a 1 semaine',
      text: isAr
        ? 'العلبة الفاخرة بالرباط جات روعة للإهداء! أختي حمقاتها الأساور. شكراً إلموري على التعامل الراقي والجودة العالية.'
        : 'Le coffret prestige cadeau avec ruban est trop beau pour offrir. Ma sœur a adoré son bracelet jonc! Merci ELMORÉ pour la pochette offerte.'
    },
    {
      id: 'rev-4',
      name: isAr ? 'أمين التازي' : 'Amine Tazi',
      city: 'Tanger / طنجة',
      initials: 'AT',
      rating: 5,
      date: isAr ? 'منذ أسبوع' : 'Il y a 1 semaine',
      text: isAr
        ? 'وصلتني الصباح فـ طنجة. القطعة بحال الصور تماماً والسلعة نقية. الليفرور كان خلوق وخلاني نفحص الطلبية عاد نتخلص.'
        : 'Reçu ce matin à Tanger. Produit conforme 100% aux photos. Livreur très sympa qui m\'a laissé vérifier le colis avant paiement.'
    },
    {
      id: 'rev-5',
      name: isAr ? 'مريم الودغيري' : 'Meriem Oudghiri',
      city: 'Fès / فاس',
      initials: 'MO',
      rating: 5,
      date: isAr ? 'منذ أسبوعين' : 'Il y a 2 semaines',
      text: isAr
        ? 'الساعة النسائية أنيقة بزاف وكتلمع! كنلبسها كل نهار وماتبدلاتش. كنوصي بها 100%.'
        : 'Montre nacre magnifique, très élégante et brillante! Je la porte tous les jours. Je recommande à 100%.'
    },
    {
      id: 'rev-6',
      name: isAr ? 'عثمان الرحموني' : 'Othmane Rahmouni',
      city: 'Agadir / أكادير',
      initials: 'OR',
      rating: 5,
      date: isAr ? 'منذ أسبوعين' : 'Il y a 2 semaines',
      text: isAr
        ? 'توصيل سريع لأكادير. السوار الأسود ممتاز وصحيح ومقاوم للماء.'
        : 'Livraison rapide à Agadir. La gourmette acier noir mat est super solide et résistante à l\'eau.'
    }
  ]
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
  if (!selectedVariantId.value && product.value?.variants?.length > 0) {
    selectedVariantId.value = product.value.variants[0].id
  }
  showCheckoutModal.value = true
}

function openProductCheckoutModal(p) {
  store.clearCart()
  store.selectedLandingProductId = p.id
  selectedVariantId.value = p.variants?.[0]?.id || ''
  orderQuantity.value = 1
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
  store.notify(store.currentLang === 'ar' ? 'تم نسخ الرابط !' : 'Lien unique copié !')
  setTimeout(() => { isCopied.value = false }, 2500)
}

function incrementQty() {
  const maxStock = currentVariant.value?.stock || 1
  if (orderQuantity.value < maxStock) {
    orderQuantity.value++
  } else {
    store.notify(store.currentLang === 'ar' ? 'وصلت للحد الأقصى للكمية المتوفرة' : 'Quantité maximale disponible atteinte')
  }
}

function decrementQty() {
  if (orderQuantity.value > 1) {
    orderQuantity.value--
  }
}

async function handleCheckoutSubmit() {
  if (!customerForm.value.name || !customerForm.value.phone) {
    return store.notify(store.currentLang === 'ar' ? 'يرجى إدخال الاسم ورقم الهاتف' : 'Veuillez saisir votre nom et numéro de téléphone')
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

const isScrolled = ref(false)

function handleScroll() {
  isScrolled.value = window.scrollY > 30
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

function getWhatsAppUrl(orderNumber) {
  const msg = encodeURIComponent(`Bonjour ELMORÉ, je viens de passer la commande N° ${orderNumber}. Merci de me confirmer la livraison !`)
  return `https://wa.me/212661889900?text=${msg}`
}
</script>

<template>
  <div v-if="product" class="ayla-container" :dir="store.currentLang === 'ar' ? 'rtl' : 'ltr'">
    <!-- Announcement Bar Sticky Top -->
    <div class="ayla-announcement-bar">
      {{ t.announcement }}
    </div>

    <!-- Luxury Header -->
    <header class="ayla-header" :class="{ 'scrolled-header': isScrolled || storePage !== 'home' }">
      <div class="ayla-logo" @click="storePage = 'home'">
        <img src="/logo.png" alt="ELMORÉ" />
        <span class="ayla-logo-text">ELMORÉ</span>
      </div>

      <nav class="ayla-nav-links">
        <span class="ayla-nav-link" :class="{ active: storePage === 'home' }" @click="storePage = 'home'">{{ t.navHome }}</span>
        <span class="ayla-nav-link" :class="{ active: storePage === 'catalog' }" @click="storePage = 'catalog'">{{ t.navCatalog }}</span>
        <span class="ayla-nav-link" :class="{ active: storePage === 'reviews' }" @click="storePage = 'reviews'">{{ t.navReviews }}</span>
      </nav>

      <div style="display: flex; align-items: center; gap: 10px;">
        <!-- LANGUAGE SWITCHER BUTTON -->
        <button
          class="ayla-btn-gold"
          style="padding: 6px 12px; font-size: 11px; display: flex; align-items: center; gap: 6px; font-weight: 800;"
          @click="store.setLanguage(store.currentLang === 'ar' ? 'fr' : 'ar')"
        >
          <Globe :size="14" />
          <span>{{ store.currentLang === 'ar' ? 'Français (FR)' : 'العربية (AR)' }}</span>
        </button>

        <!-- CART BUTTON WITH COUNTER BADGE -->
        <button class="ayla-btn-gold" style="padding: 6px 14px; font-size: 11px; display: flex; align-items: center; gap: 6px; position: relative;" @click="showCartDrawer = true">
          <ShoppingCart :size="15" />
          <span>{{ t.cart }}</span>
          <span v-if="store.cartTotalCount > 0" style="background: #ef4444; color: #ffffff; border-radius: 50%; width: 18px; height: 18px; display: grid; place-items: center; font-size: 10px; font-weight: 800;">
            {{ store.cartTotalCount }}
          </span>
        </button>

        <button class="ayla-btn-emerald" style="padding: 6px 12px; font-size: 11px;" @click="store.activeTab = 'dashboard'">
          <Settings :size="13" /> {{ t.admin }}
        </button>
      </div>
    </header>

    <!-- ====================================================================
         PAGE 1: ACCUEIL / FULL-WIDTH HERO OVERLAY SHOWCASE
         ==================================================================== -->
    <main v-if="storePage === 'home'">
      <!-- Full-Width Video Hero Section -->
      <section class="ayla-hero-fullwidth">
        <!-- Background Video -->
        <video autoplay loop muted playsinline class="hero-bg-video">
          <source src="/hero_video.mp4" type="video/mp4" />
        </video>

        <!-- Luxury Overlay Gradient -->
        <div class="hero-video-overlay"></div>

        <!-- Animated Hero Overlay Content -->
        <div class="ayla-hero-overlay-content hero-animate-in">
          <div class="ayla-badge-rating" style="background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); color: #ffffff; border: 1px solid rgba(255,255,255,0.3); display: inline-flex; align-items: center; gap: 8px; padding: 6px 16px; border-radius: 50px; margin-bottom: 20px;">
            <span style="color: #f59e0b; display: flex; gap: 2px;">
              <Star :size="14" fill="#f59e0b" /><Star :size="14" fill="#f59e0b" /><Star :size="14" fill="#f59e0b" /><Star :size="14" fill="#f59e0b" /><Star :size="14" fill="#f59e0b" />
            </span>
            <span>{{ t.ratingText }}</span>
          </div>

          <h1 class="ayla-hero-overlay-title">{{ t.heroTitle }}</h1>
          <p class="ayla-hero-overlay-subtitle" style="margin-bottom: 36px;">{{ t.heroSubtitle }}</p>

          <div style="display: flex; justify-content: center;">
            <button class="ayla-btn-emerald" style="background: #f59e0b; border-color: #f59e0b; color: #ffffff; font-size: 14px; padding: 18px 38px; box-shadow: 0 10px 25px rgba(245, 158, 11, 0.4);" @click="storePage = 'catalog'">
              {{ t.discoverCatalog }} <Grid :size="18" />
            </button>
          </div>
        </div>
      </section>

      <!-- Product Cards Grid Section under Hero -->
      <section class="ayla-hero" style="padding-top: 50px; padding-bottom: 20px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <span style="color: var(--ay-gold); font-size: 12px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase;">ELMORÉ LUXURY</span>
          <h2 style="font-family: 'Instrument Sans', sans-serif; font-size: 30px; font-weight: 700; color: var(--ay-emerald); text-transform: uppercase; margin-top: 4px;">
            {{ t.featuredTitle }}
          </h2>
          <p style="font-size: 14px; color: var(--ay-muted);">{{ t.featuredSubtitle }}</p>
        </div>

        <div class="ayla-catalog-grid">
          <div
            v-for="p in uniqueProducts"
            :key="p.id"
            class="ayla-product-catalog-card"
          >
            <div class="ayla-card-img-wrapper" @click="selectProductAndOrder(p)">
              <span class="ayla-card-badge">{{ t.bestSeller }}</span>
              <img :src="p.image || '/luxury_hero.png'" :alt="p.name" class="ayla-card-img" />
            </div>

            <div class="ayla-card-body">
              <div class="ayla-card-category">{{ p.brand || 'ELMORÉ' }} · {{ p.category }}</div>
              <h3 class="ayla-card-title" @click="selectProductAndOrder(p)">{{ p.name }}</h3>

              <div style="display: flex; align-items: center; gap: 4px; color: #f59e0b; font-size: 11px; margin-bottom: 8px;">
                <Star :size="13" fill="#f59e0b" /><Star :size="13" fill="#f59e0b" /><Star :size="13" fill="#f59e0b" /><Star :size="13" fill="#f59e0b" /><Star :size="13" fill="#f59e0b" />
                <span style="color: var(--ay-muted); margin-left: 4px; font-weight: 700;">{{ t.reviewsCount }}</span>
              </div>

              <div class="ayla-card-price-row">
                <span class="ayla-card-price">{{ p.price }} DH</span>
                <span class="ayla-card-old-price">{{ Math.round(p.price * 1.35) }} DH</span>
              </div>

              <div style="display: flex; gap: 8px; margin-top: 14px;">
                <button class="ayla-btn-gold" style="flex: 1; padding: 10px; font-size: 11px; justify-content: center;" @click="handleProductQuickAddToCart(p)">
                  <ShoppingCart :size="14" /> {{ t.quickAddToCart }}
                </button>
                <button class="ayla-btn-emerald" style="flex: 1.2; padding: 10px; font-size: 11px; justify-content: center;" @click="openProductCheckoutModal(p)">
                  {{ t.quickOrder }}
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
            <h4>{{ t.freeShippingTitle }}</h4>
            <p>{{ t.freeShippingDesc }}</p>
          </div>

          <div class="ayla-trust-card">
            <div class="ayla-trust-icon"><ShieldCheck :size="24" /></div>
            <h4>{{ t.qualityTitle }}</h4>
            <p>{{ t.qualityDesc }}</p>
          </div>

          <div class="ayla-trust-card">
            <div class="ayla-trust-icon"><Gift :size="24" /></div>
            <h4>{{ t.giftBoxTitle }}</h4>
            <p>{{ t.giftBoxDesc }}</p>
          </div>

          <div class="ayla-trust-card">
            <div class="ayla-trust-icon"><Award :size="24" /></div>
            <h4>{{ t.inspectTitle }}</h4>
            <p>{{ t.inspectDesc }}</p>
          </div>
        </div>
      </section>
    </main>

    <!-- ====================================================================
         PAGE 2: CATALOGUE DÉDIÉ
         ==================================================================== -->
    <main v-else-if="storePage === 'catalog'" class="ayla-hero">
      <div style="text-align: center; max-width: 800px; margin: 0 auto 36px auto;">
        <span style="color: var(--ay-gold); font-size: 12px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase;">ELMORÉ LUXURY</span>
        <h1 style="font-family: 'Instrument Sans', sans-serif; font-size: 36px; font-weight: 700; color: var(--ay-emerald); text-transform: uppercase; margin-top: 6px;">
          {{ t.catalogTitle }}
        </h1>
        <p style="font-size: 14px; color: var(--ay-muted);">{{ t.catalogSubtitle }}</p>
      </div>

      <!-- Filter Bar & Search -->
      <div style="background: #ffffff; border: 1px solid var(--ay-border); border-radius: 12px; padding: 16px 24px; margin-bottom: 32px; display: flex; justify-content: space-between; align-items: center; gap: 20px; flex-wrap: wrap;">
        <!-- Desktop Pill Buttons -->
        <div class="desktop-filter-buttons" style="display: flex; gap: 10px; flex-wrap: wrap;">
          <button
            style="padding: 8px 16px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s;"
            :style="selectedCategoryFilter === 'all' ? 'background: var(--ay-emerald); color: #ffffff; border: 1px solid var(--ay-emerald);' : 'background: #ffffff; color: var(--ay-dark); border: 1px solid var(--ay-border);'"
            @click="selectedCategoryFilter = 'all'"
          >
            {{ t.allCategories }} ({{ store.products.length }})
          </button>
          <button
            style="padding: 8px 16px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s;"
            :style="selectedCategoryFilter === 'Accessoires Femmes' ? 'background: var(--ay-emerald); color: #ffffff; border: 1px solid var(--ay-emerald);' : 'background: #ffffff; color: var(--ay-dark); border: 1px solid var(--ay-border);'"
            @click="selectedCategoryFilter = 'Accessoires Femmes'"
          >
            {{ t.catAccFemme }}
          </button>
          <button
            style="padding: 8px 16px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s;"
            :style="selectedCategoryFilter === 'Accessoires Hommes' ? 'background: var(--ay-emerald); color: #ffffff; border: 1px solid var(--ay-emerald);' : 'background: #ffffff; color: var(--ay-dark); border: 1px solid var(--ay-border);'"
            @click="selectedCategoryFilter = 'Accessoires Hommes'"
          >
            {{ t.catAccHomme }}
          </button>
          <button
            style="padding: 8px 16px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s;"
            :style="selectedCategoryFilter === 'Montres Femmes' ? 'background: var(--ay-emerald); color: #ffffff; border: 1px solid var(--ay-emerald);' : 'background: #ffffff; color: var(--ay-dark); border: 1px solid var(--ay-border);'"
            @click="selectedCategoryFilter = 'Montres Femmes'"
          >
            {{ t.catWatchFemme }}
          </button>
          <button
            style="padding: 8px 16px; border-radius: 6px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s;"
            :style="selectedCategoryFilter === 'Montres Hommes' ? 'background: var(--ay-emerald); color: #ffffff; border: 1px solid var(--ay-emerald);' : 'background: #ffffff; color: var(--ay-dark); border: 1px solid var(--ay-border);'"
            @click="selectedCategoryFilter = 'Montres Hommes'"
          >
            {{ t.catWatchHomme }}
          </button>
        </div>

        <!-- Mobile Filter Dropdown Selector -->
        <div class="mobile-filter-wrapper">
          <Filter :size="16" style="color: var(--ay-emerald);" />
          <select v-model="selectedCategoryFilter" class="mobile-filter-select">
            <option value="all">🔍 {{ t.allCategories }} ({{ store.products.length }})</option>
            <option value="Accessoires Femmes">🌸 {{ t.catAccFemme }}</option>
            <option value="Accessoires Hommes">🕶️ {{ t.catAccHomme }}</option>
            <option value="Montres Femmes">⌚ {{ t.catWatchFemme }}</option>
            <option value="Montres Hommes">⏱️ {{ t.catWatchHomme }}</option>
          </select>
        </div>

        <div style="position: relative; width: 260px;">
          <input v-model="catalogSearchQuery" :placeholder="t.searchPlaceholder" class="form-control" style="border: 1px solid var(--ay-border); padding: 8px 12px 8px 34px; border-radius: 6px; font-size: 12px;" />
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
            <span class="ayla-card-badge">{{ t.bestSeller }}</span>
            <img :src="p.image || '/luxury_hero.png'" :alt="p.name" class="ayla-card-img" />
          </div>

          <div class="ayla-card-body">
            <div class="ayla-card-category">{{ p.brand || 'ELMORÉ' }} · {{ p.category }}</div>
            <h3 class="ayla-card-title" @click="selectProductAndOrder(p)">{{ p.name }}</h3>

            <div style="display: flex; align-items: center; gap: 4px; color: #f59e0b; font-size: 11px; margin-bottom: 8px;">
              <Star :size="13" fill="#f59e0b" /><Star :size="13" fill="#f59e0b" /><Star :size="13" fill="#f59e0b" /><Star :size="13" fill="#f59e0b" /><Star :size="13" fill="#f59e0b" />
              <span style="color: var(--ay-muted); margin-left: 4px; font-weight: 700;">{{ t.reviewsCount }}</span>
            </div>

            <div class="ayla-card-price-row">
              <span class="ayla-card-price">{{ p.price }} DH</span>
              <span class="ayla-card-old-price">{{ Math.round(p.price * 1.35) }} DH</span>
            </div>

            <div style="display: flex; gap: 8px; margin-top: 14px;">
              <button class="ayla-btn-gold" style="flex: 1; padding: 10px; font-size: 11px; justify-content: center;" @click="handleProductQuickAddToCart(p)">
                <ShoppingCart :size="14" /> {{ t.quickAddToCart }}
              </button>
              <button class="ayla-btn-emerald" style="flex: 1.2; padding: 10px; font-size: 11px; justify-content: center;" @click="openProductCheckoutModal(p)">
                {{ t.quickOrder }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- ====================================================================
         PAGE 3: PAGE DE PERSONNALISATION DU PRODUIT (SINGLE PRODUCT VIEW - MINIMALIST WHITE)
         ==================================================================== -->
    <main v-else-if="storePage === 'order'" style="background: #ffffff; padding: 40px 0;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 50px; align-items: start; max-width: 1100px; margin: 0 auto;" class="single-product-grid">
        
        <!-- LEFT COLUMN: PHOTO GALLERY SHOWCASE & THUMBNAILS -->
        <div style="position: sticky; top: 100px;">
          <div style="background: #ffffff; border: none; border-radius: 16px; padding: 24px; text-align: center; display: flex; align-items: center; justify-content: center; width: 100%; min-height: 360px; overflow: hidden; position: relative;">
            <img
              :src="currentVariant?.image || product.image || '/luxury_hero.png'"
              :alt="product.name"
              style="max-height: 480px; width: 100%; height: auto; object-fit: contain !important; border-radius: 8px; transition: transform 0.3s ease; display: block; margin: 0 auto;"
            />
          </div>

          <div style="display: flex; gap: 12px; margin-top: 16px; overflow-x: auto; padding-bottom: 4px;">
            <div
              v-for="v in product.variants"
              :key="v.id"
              style="width: 64px; height: 64px; border-radius: 8px; border: none; padding: 4px; background: transparent; cursor: pointer; display: grid; place-items: center; transition: all 0.2s; flex-shrink: 0;"
              :style="selectedVariantId === v.id ? 'box-shadow: 0 0 0 2px var(--ay-emerald); opacity: 1;' : 'opacity: 0.6;'"
              @click="selectedVariantId = v.id"
            >
              <img :src="v.image || product.image || '/luxury_hero.png'" style="max-height: 100%; max-width: 100%; object-fit: contain; border: none;" />
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN: PRODUCT DETAILS & CONFIGURATOR (PURE WHITE MINIMALIST) -->
        <div style="background: #ffffff; padding: 10px 0;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <span style="font-size: 11px; font-weight: 800; color: var(--ay-gold); text-transform: uppercase; letter-spacing: 0.15em;">{{ product.brand }} · {{ product.category }}</span>
            <span style="color: #2e7d32; font-size: 11px; font-weight: 800; background: #f0fdf4; padding: 4px 10px; border-radius: 4px; border: 1px solid #bbf7d0;">En Stock ✓</span>
          </div>

          <h1 style="font-family: 'Instrument Sans', sans-serif; font-size: 32px; font-weight: 700; color: var(--ay-emerald); line-height: 1.2; margin-bottom: 12px;">
            {{ product.name }}
          </h1>

          <div style="display: flex; align-items: center; gap: 6px; color: #f59e0b; font-size: 13px; margin-bottom: 24px;">
            <Star :size="15" fill="#f59e0b" /><Star :size="15" fill="#f59e0b" /><Star :size="15" fill="#f59e0b" /><Star :size="15" fill="#f59e0b" /><Star :size="15" fill="#f59e0b" />
            <span style="color: var(--ay-muted); font-weight: 700;">{{ t.reviewsCount }}</span>
          </div>

          <!-- Clean Minimalist Price Display -->
          <div style="margin-bottom: 28px; padding-bottom: 20px; border-bottom: 1px solid var(--ay-border);">
            <div style="display: flex; align-items: baseline; gap: 14px;">
              <span style="font-size: 38px; font-weight: 900; color: var(--ay-emerald); font-family: 'Instrument Sans', sans-serif;">{{ finalUnitPrice }} DH</span>
              <span style="font-size: 18px; color: var(--ay-muted); text-decoration: line-through;">{{ Math.round((product.price || 97) * 1.35) }} DH</span>
              <span style="background: #2e7d32; color: #ffffff; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 4px; margin-left: auto;">-35% OFFRE</span>
            </div>
            
            <div style="font-size: 12px; color: var(--ay-muted); font-weight: 600; margin-top: 6px;">
              (Produit {{ product.price || currentVariant?.price }} DH + Coffret {{ selectedPackaging.extraPrice }} DH)
            </div>

            <div v-if="orderQuantity > 1" style="font-size: 15px; font-weight: 800; color: var(--ay-emerald); margin-top: 10px;">
              {{ store.currentLang === 'ar' ? `المجموع لـ (${orderQuantity} قطع) :` : `TOTAL COMMANDE (${orderQuantity} pièces) :` }} <span style="font-size: 22px; color: var(--ay-gold); font-weight: 900;">{{ totalPrice }} DH</span>
            </div>
          </div>

          <!-- Section 1: Choose Variant / Finish -->
          <div style="margin-bottom: 28px;">
            <label style="font-size: 12px; font-weight: 800; color: var(--ay-emerald); text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 12px;">
              {{ t.finishSelection }}
            </label>

            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <button
                v-for="v in product.variants"
                :key="v.id"
                style="padding: 10px 16px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px;"
                :style="selectedVariantId === v.id ? 'background: var(--ay-emerald); color: #ffffff; border: 1px solid var(--ay-emerald);' : 'background: #ffffff; color: var(--ay-dark); border: 1px solid var(--ay-border);'"
                @click="selectedVariantId = v.id"
              >
                <img :src="v.image || product.image || '/luxury_hero.png'" style="width: 24px; height: 24px; object-fit: contain; border-radius: 4px; background: #ffffff; padding: 2px;" />
                <span>{{ v.color }}</span>
              </button>
            </div>
          </div>

          <!-- Section 2: Choose Box / Packaging (WITH BOX OR WITHOUT BOX) -->
          <div style="margin-bottom: 28px;">
            <label style="font-size: 12px; font-weight: 800; color: var(--ay-emerald); text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 12px;">
              {{ t.boxSelection }}
            </label>

            <div style="display: flex; flex-direction: column; gap: 10px;">
              <div
                v-for="boxOption in (store.packagings || [])"
                :key="boxOption.id"
                style="padding: 14px 18px; border-radius: 10px; border: 1px solid var(--ay-border); background: #ffffff; cursor: pointer; transition: all 0.2s; display: flex; justify-content: space-between; align-items: center;"
                :style="selectedPackagingId === boxOption.id ? 'border-color: var(--ay-emerald); border-width: 2px; background: #f8fafc;' : ''"
                @click="selectedPackagingId = boxOption.id"
              >
                <div style="display: flex; align-items: center; gap: 14px;">
                  <img v-if="boxOption.image" :src="boxOption.image" :alt="boxOption.label" style="width: 56px; height: 56px; object-fit: contain; border-radius: 8px; border: 1px solid var(--ay-border); background: #ffffff; padding: 2px;" />
                  <span v-else style="font-size: 24px;">{{ boxOption.icon }}</span>
                  <div>
                    <b style="font-size: 13px; color: var(--ay-emerald); display: block;">{{ boxOption.label }}</b>
                    <small style="color: var(--ay-muted); font-size: 11px;">{{ boxOption.note }}</small>
                  </div>
                </div>

                <div style="font-size: 12px; font-weight: 800; padding: 6px 12px; border-radius: 6px;" :style="boxOption.extraPrice === 0 ? 'background: #f1f5f9; color: #475569;' : 'background: var(--ay-gold); color: #ffffff;'">
                  {{ boxOption.extraPrice === 0 ? 'Inclus (0 DH)' : `+${boxOption.extraPrice} DH` }}
                </div>
              </div>
            </div>
          </div>

          <!-- Section 3: Quantity Counter -->
          <div style="margin-bottom: 28px; display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--ay-border); padding-top: 20px;">
            <span style="font-size: 12px; font-weight: 800; color: var(--ay-emerald); text-transform: uppercase;">QUANTITÉ :</span>
            
            <div style="display: flex; align-items: center; gap: 12px;">
              <button style="width: 36px; height: 36px; font-weight: 800; font-size: 16px; background: #ffffff; border: 1px solid var(--ay-border); border-radius: 6px; cursor: pointer;" @click="decrementQty">-</button>
              <span style="font-size: 18px; font-weight: 800; min-width: 24px; text-align: center; color: var(--ay-emerald);">{{ orderQuantity }}</span>
              <button style="width: 36px; height: 36px; font-weight: 800; font-size: 16px; background: #ffffff; border: 1px solid var(--ay-border); border-radius: 6px; cursor: pointer;" @click="incrementQty">+</button>
            </div>
          </div>

          <!-- Action Buttons -->
          <div style="display: flex; gap: 12px; margin-top: 28px;">
            <button class="ayla-btn-gold" style="flex: 1; padding: 18px; font-size: 13px; justify-content: center;" @click="handleAddCurrentToCart">
              <ShoppingCart :size="16" /> {{ t.addToCartBtn }}
            </button>
            <button class="ayla-btn-emerald" style="flex: 1.4; padding: 18px; font-size: 13px; justify-content: center;" @click="openCheckoutModal()">
              {{ t.passOrderModalBtn }} ({{ totalPrice }} DH)
            </button>
          </div>
        </div>
      </div>

      <!-- ======================================================
           SECTION PRODUITS SIMILAIRES
           ====================================================== -->
      <div v-if="similarProducts.length > 0" style="max-width: 1100px; margin: 56px auto 0 auto; padding: 0 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
          <div>
            <span style="font-size: 11px; font-weight: 800; color: var(--ay-gold); text-transform: uppercase; letter-spacing: 0.15em; display: block; margin-bottom: 4px;">ELMORÉ · COLLECTION</span>
            <h2 style="font-family: 'Instrument Sans', sans-serif; font-size: 22px; font-weight: 700; color: var(--ay-emerald); text-transform: uppercase; margin: 0;">
              {{ store.currentLang === 'ar' ? 'منتجات مشابهة' : 'Vous aimerez aussi' }}
            </h2>
          </div>
          <button
            class="ayla-btn-gold"
            style="font-size: 11px; padding: 8px 16px;"
            @click="storePage = 'catalog'"
          >
            {{ store.currentLang === 'ar' ? 'رؤية الكل' : 'Voir tout' }} →
          </button>
        </div>

        <!-- Horizontal scroll cards -->
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px;" class="similar-products-grid">
          <div
            v-for="p in similarProducts"
            :key="p.id"
            style="background: #ffffff; border-radius: 14px; overflow: hidden; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.06);"
            @click="store.openLandingPage(p.id)"
            @mouseenter="$event.currentTarget.style.transform='translateY(-3px)'; $event.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.10)'"
            @mouseleave="$event.currentTarget.style.transform='none'; $event.currentTarget.style.boxShadow='0 2px 8px rgba(0,0,0,0.06)'"
          >
            <!-- Product image -->
            <div style="background: #f8fafc; padding: 16px; display: flex; align-items: center; justify-content: center; height: 160px;">
              <img
                :src="p.variants?.[0]?.image || p.image || '/luxury_hero.png'"
                :alt="p.name"
                style="max-height: 130px; max-width: 100%; object-fit: contain;"
              />
            </div>

            <!-- Product info -->
            <div style="padding: 12px 14px 14px;">
              <span style="font-size: 10px; font-weight: 700; color: var(--ay-gold); text-transform: uppercase; letter-spacing: 0.1em;">{{ p.category }}</span>
              <p style="font-size: 13px; font-weight: 700; color: var(--ay-dark); margin: 4px 0 6px; line-height: 1.3;">{{ p.name }}</p>
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <span style="font-size: 15px; font-weight: 800; color: var(--ay-emerald);">{{ p.price }} DH</span>
                <span style="font-size: 10px; background: #f0fdf4; color: #16a34a; font-weight: 700; padding: 3px 8px; border-radius: 4px;">En Stock</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- ====================================================================
         PAGE 4: AVIS CLIENTS DÉDIÉ
         ==================================================================== -->
    <main v-else-if="storePage === 'reviews'" class="ayla-hero">
      <div style="text-align: center; max-width: 800px; margin: 0 auto 36px auto;">
        <span style="color: var(--ay-gold); font-size: 12px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase;">ELMORÉ LUXURY MAROC</span>
        <h1 style="font-family: 'Instrument Sans', sans-serif; font-size: 32px; font-weight: 700; color: var(--ay-emerald); text-transform: uppercase; margin-top: 6px;">
          {{ t.navReviews }} (4.9 / 5.0 ⭐)
        </h1>
        <p style="font-size: 14px; color: var(--ay-muted); margin-top: 6px;">
          {{ store.currentLang === 'ar' ? 'أكثر من 1,420 تقييم موثق من زبنائنا الكرام في مختلف مدن المملكة المغربية 🇲🇦' : 'Plus de 1 420 avis vérifiés de nos clients partout au Maroc 🇲🇦' }}
        </p>
      </div>

      <div class="ayla-reviews-grid">
        <div v-for="rev in reviewsList" :key="rev.id" class="ayla-review-card" style="background: #ffffff; border: 1px solid var(--ay-border); border-radius: 14px; padding: 22px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          <div class="ayla-review-user" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div class="ayla-review-avatar" style="width: 44px; height: 44px; background: var(--ay-emerald); color: #ffffff; font-weight: 800; font-size: 14px; border-radius: 50%; display: grid; place-items: center;">
                {{ rev.initials }}
              </div>
              <div>
                <b style="font-size: 14px; display: block; color: var(--ay-emerald);">{{ rev.name }}</b>
                <span style="font-size: 11px; color: #2e7d32; font-weight: 700;">✓ {{ store.currentLang === 'ar' ? 'شراء موثق' : 'Achat Vérifié' }} · {{ rev.city }}</span>
              </div>
            </div>

            <span style="font-size: 11px; color: var(--ay-muted); font-weight: 600;">{{ rev.date }}</span>
          </div>

          <div style="color: #f59e0b; margin-bottom: 12px; display: flex; gap: 3px;">
            <Star v-for="s in rev.rating" :key="s" :size="15" fill="#f59e0b" />
          </div>

          <p style="font-size: 13px; color: var(--ay-dark); line-height: 1.6;">
            "{{ rev.text }}"
          </p>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="ayla-footer">
      <div class="ayla-footer-inner">
        <div>
          <h3 style="font-family: 'Instrument Sans', sans-serif; font-size: 22px; color: var(--ay-gold); letter-spacing: 0.15em; margin-bottom: 12px;">
            ELMORÉ LUXURY 🇲🇦
          </h3>
          <p>{{ t.heroSubtitle }}</p>
          <a :href="getWhatsAppUrl('SERVICE-CLIENT')" target="_blank" class="ayla-btn-gold" style="display: inline-flex; align-items: center; gap: 8px; margin-top: 16px; font-size: 11px; text-decoration: none;">
            <MessageSquare :size="16" /> {{ store.currentLang === 'ar' ? 'خدمة العملاء واتساب' : 'SERVICE CLIENT WHATSAPP' }}
          </a>
        </div>

        <div>
          <h4>{{ store.currentLang === 'ar' ? 'التنقل' : 'NAVIGATION' }}</h4>
          <p><span style="cursor: pointer;" @click="storePage = 'home'">{{ t.navHome }}</span></p>
          <p><span style="cursor: pointer;" @click="storePage = 'catalog'">{{ t.navCatalog }}</span></p>
          <p><span style="cursor: pointer;" @click="storePage = 'order'">{{ t.navOrder }}</span></p>
          <p><span style="cursor: pointer;" @click="storePage = 'reviews'">{{ t.navReviews }}</span></p>
        </div>

        <div>
          <h4>{{ store.currentLang === 'ar' ? 'التوصيل' : 'LIVRAISON' }}</h4>
          <p>{{ store.currentLang === 'ar' ? 'الدار البيضاء (24 ساعة)' : 'Casablanca (24h)' }}</p>
          <p>{{ store.currentLang === 'ar' ? 'الرباط سلا (24 ساعة)' : 'Rabat & Salé (24h)' }}</p>
          <p>{{ store.currentLang === 'ar' ? 'مراكش وطنجة (48 ساعة)' : 'Marrakech & Tanger (48h)' }}</p>
          <p>{{ store.currentLang === 'ar' ? 'جميع مدن المغرب' : 'Toutes Villes du Maroc' }}</p>
        </div>

        <div>
          <h4>{{ store.currentLang === 'ar' ? 'التواصل' : 'CONTACT' }}</h4>
          <p>📍 Casablanca, Maroc</p>
          <p>📞 WhatsApp: +212 661-889900</p>
          <p>✉️ contact@elmore.ma</p>
        </div>
      </div>

      <div style="border-top: 1px solid rgba(255,255,255,0.1); margin-top: 40px; padding-top: 20px; text-align: center; font-size: 12px; color: #9ca3af;">
        © {{ new Date().getFullYear() }} ELMORÉ LUXURY. {{ store.currentLang === 'ar' ? 'جميع الحقوق محفوظة.' : 'Tous droits réservés.' }}
      </div>
    </footer>

    <!-- MODAL 1: SHOPPING CART SLIDE-OVER DRAWER -->
    <div v-if="showCartDrawer" class="modal-overlay" @click.self="showCartDrawer = false">
      <div class="modal-card" style="max-width: 480px; width: 100%; border-radius: 16px; padding: 24px; max-height: 88vh; display: flex; flex-direction: column;">
        <div class="modal-header">
          <h3 style="display: flex; align-items: center; gap: 8px; color: var(--ay-emerald);">
            <ShoppingCart :size="20" /> {{ t.cartTitle }} ({{ store.cartTotalCount }})
          </h3>
          <button class="close-btn" @click="showCartDrawer = false"><X :size="18"/></button>
        </div>

        <div style="flex: 1; overflow-y: auto; margin-top: 14px; padding-right: 4px;">
          <div v-if="store.cart.length === 0" style="text-align: center; padding: 40px 10px; color: var(--ay-muted);">
            <ShoppingCart :size="48" style="opacity: 0.3; margin-bottom: 12px;" />
            <p style="font-size: 14px; font-weight: 700;">{{ t.cartEmpty }}</p>
            <button class="ayla-btn-emerald" style="margin-top: 14px; font-size: 12px;" @click="showCartDrawer = false; storePage = 'catalog';">
              {{ t.discoverCatalog }}
            </button>
          </div>

          <div v-else>
            <div
              v-for="item in store.cart"
              :key="item.id"
              style="display: flex; gap: 14px; align-items: center; border-bottom: 1px solid var(--ay-border); padding-bottom: 12px; margin-bottom: 12px;"
            >
              <div style="width: 56px; height: 56px; flex-shrink: 0; border-radius: 8px; overflow: hidden; background: transparent; display: flex; align-items: center; justify-content: center;">
                <img :src="item.image || '/luxury_hero.png'" style="width: 100%; height: 100%; object-fit: contain;" />
              </div>
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
            <span style="color: var(--ay-muted);">{{ t.shippingFree }}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 16px;">
            <b>{{ t.totalTtc }}</b>
            <b style="color: var(--ay-emerald); font-size: 20px;">{{ store.cartTotalPrice }} DH</b>
          </div>

          <button class="ayla-btn-emerald" style="width: 100%; justify-content: center; padding: 14px; font-size: 14px;" @click="openCheckoutModal">
            {{ t.passOrderBtn }} ({{ store.cartTotalPrice }} DH) <ArrowRight :size="16" />
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL 2: EXPRESS CHECKOUT POPUP MODAL -->
    <div v-if="showCheckoutModal" class="modal-overlay" @click.self="showCheckoutModal = false">
      <div class="modal-card" style="max-width: 600px; width: 100%; border-radius: 16px; padding: 28px; border: none;">
        <div class="modal-header" style="border-bottom: 1px solid var(--ay-border); padding-bottom: 12px; margin-bottom: 18px;">
          <h3 style="font-family: 'Instrument Sans', sans-serif; font-size: 20px; font-weight: 700; color: var(--ay-emerald); text-transform: uppercase;">
            {{ t.checkoutModalTitle }}
          </h3>
          <button class="close-btn" @click="showCheckoutModal = false"><X :size="18"/></button>
        </div>

        <!-- Order Items Summary -->
        <div style="background: #F8FAFC; border: 1px solid var(--ay-border); border-radius: 10px; padding: 14px; margin-bottom: 18px; max-height: 160px; overflow-y: auto;">
          <b style="font-size: 12px; color: var(--ay-gold); text-transform: uppercase; display: block; margin-bottom: 8px;">{{ t.orderSummary }}</b>
          
          <div v-if="store.cart.length > 0">
            <div v-for="item in store.cart" :key="item.id" style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px;">
              <span>{{ item.name }} ({{ item.variantName }}) x{{ item.quantity }}</span>
              <b>{{ item.price * item.quantity }} DH</b>
            </div>
          </div>
          <div v-else style="display: flex; justify-content: space-between; font-size: 12px;">
            <span>{{ product.name }} ({{ currentVariant?.color }}) x{{ orderQuantity }}</span>
            <b>{{ totalPrice }} DH</b>
          </div>

          <div style="border-top: 1px solid var(--ay-border); margin-top: 8px; padding-top: 8px; display: flex; justify-content: space-between; font-size: 14px;">
            <b>{{ t.totalToPay }}</b>
            <b style="color: var(--ay-emerald); font-size: 16px;">{{ checkoutTotalAmount }} DH</b>
          </div>
        </div>

        <!-- Delivery Form -->
        <form @submit.prevent="handleCheckoutSubmit">
          <div class="grid-2" style="margin-bottom: 12px;">
            <div class="form-group">
              <label style="font-size: 12px; font-weight: 700;">{{ t.fullNameLabel }}</label>
              <input v-model="customerForm.name" class="form-control" style="border: 1px solid var(--ay-border); padding: 10px; background: #ffffff;" required :placeholder="t.fullNamePlaceholder" />
            </div>
            <div class="form-group">
              <label style="font-size: 12px; font-weight: 700;">{{ t.phoneLabel }}</label>
              <input v-model="customerForm.phone" class="form-control" style="border: 1px solid var(--ay-border); padding: 10px; background: #ffffff;" required :placeholder="t.phonePlaceholder" />
            </div>
          </div>

          <div class="grid-2" style="margin-bottom: 12px;">
            <div class="form-group">
              <label style="font-size: 12px; font-weight: 700;">{{ t.cityLabel }}</label>
              <select v-model="customerForm.city" class="form-control" style="border: 1px solid var(--ay-border); padding: 10px; background: #ffffff;">
                <option value="Casablanca">Casablanca / الدار البيضاء</option>
                <option value="Rabat">Rabat / الرباط</option>
                <option value="Marrakech">Marrakech / مراكش</option>
                <option value="Tangier">Tanger / طنجة</option>
                <option value="Safi">Safi / آسفي</option>
                <option value="Agadir">Agadir / أكادير</option>
                <option value="Fès">Fès / فاس</option>
                <option value="Meknès">Meknès / مكناس</option>
                <option value="Oujda">Oujda / وجدة</option>
                <option value="Autre Ville">Autre Ville / مدينة أخرى</option>
              </select>
            </div>
            <div class="form-group">
              <label style="font-size: 12px; font-weight: 700;">{{ t.addressLabel }}</label>
              <input v-model="customerForm.address" class="form-control" style="border: 1px solid var(--ay-border); padding: 10px; background: #ffffff;" :placeholder="t.addressPlaceholder" />
            </div>
          </div>

          <button type="submit" class="ayla-btn-emerald" style="width: 100%; justify-content: center; padding: 16px; font-size: 14px; margin-top: 6px;" :disabled="isOrdering">
            {{ isOrdering ? '...' : `${t.confirmOrderBtn} (${checkoutTotalAmount} DH)` }}
          </button>
        </form>
      </div>
    </div>

    <!-- MODAL 3: ORDER CONFIRMATION MODAL -->
    <div v-if="showSuccessModal && lastOrder" class="modal-overlay" @click.self="showSuccessModal = false">
      <div class="modal-card" style="max-width: 540px; text-align: center; border-radius: 16px; padding: 36px; border: 2px solid var(--ay-emerald);">
        <div style="margin-bottom: 20px;">
          <div style="width: 64px; height: 64px; background: #e8f5e9; color: #2e7d32; border-radius: 50%; display: grid; place-items: center; margin: 0 auto 16px auto;">
            <CheckCircle2 :size="38" />
          </div>
          <h2 style="font-family: 'Instrument Sans', sans-serif; font-size: 24px; font-weight: 700; color: var(--ay-emerald); text-transform: uppercase;">
            {{ t.orderConfirmedTitle }}
          </h2>
          <p style="color: var(--ay-muted); font-size: 14px;">{{ t.orderRefText }}</p>
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
            <MessageSquare :size="18" /> {{ t.followWhatsapp }}
          </a>
          <button class="btn-secondary" style="border-radius: 4px; justify-content: center; padding: 12px;" @click="showSuccessModal = false">
            {{ t.closeBtn }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
