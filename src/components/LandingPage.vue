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
  RefreshCw,
  PhoneCall
} from 'lucide-vue-next'

const store = useInventoryStore()

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

const isCopied = ref(false)

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

function scrollToOrderForm() {
  const el = document.getElementById('checkout-section')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
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
      <div class="ayla-logo" @click="store.activeTab = 'landing'">
        <img src="/logo.png" alt="ELMORÉ" />
        <span class="ayla-logo-text">ELMORÉ</span>
      </div>

      <nav class="ayla-nav-links">
        <a class="ayla-nav-link" href="#hero-section">ACCUEIL</a>
        <a class="ayla-nav-link" href="#checkout-section">COLLECTIONS</a>
        <a class="ayla-nav-link" href="#trust-section">GARANTIES</a>
        <a class="ayla-nav-link" href="#reviews-section">AVIS CLIENTS</a>
      </nav>

      <div style="display: flex; align-items: center; gap: 14px;">
        <select v-model="store.selectedLandingProductId" style="border: 1px solid var(--ay-border); background: #ffffff; padding: 6px 12px; border-radius: 4px; font-size: 11px; font-weight: 700; color: var(--ay-emerald); cursor: pointer;">
          <option v-for="p in store.products" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>

        <button class="ayla-btn-gold" style="padding: 8px 16px; font-size: 11px;" @click="copyProductShareLink">
          {{ isCopied ? 'Lien copié ✓' : 'Partager' }}
        </button>

        <button class="ayla-btn-emerald" style="padding: 8px 16px; font-size: 11px;" @click="store.activeTab = 'dashboard'">
          <Settings :size="13" /> 🛠️ Admin
        </button>
      </div>
    </header>

    <!-- Maison Ayla Style Hero Section -->
    <section id="hero-section" class="ayla-hero">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center;">
        <!-- Left Text & Pricing -->
        <div>
          <div class="ayla-badge-rating">
            <span style="color: #f59e0b; display: flex; gap: 2px;">
              <Star :size="14" fill="#f59e0b" /><Star :size="14" fill="#f59e0b" /><Star :size="14" fill="#f59e0b" /><Star :size="14" fill="#f59e0b" /><Star :size="14" fill="#f59e0b" />
            </span>
            <span>4.9/5 · Plus de 1 400 avis au Maroc</span>
          </div>

          <h1 class="ayla-title">{{ product.name }}</h1>
          <p class="ayla-subtitle">{{ product.description }}</p>

          <div style="display: flex; align-items: baseline; gap: 16px; margin-bottom: 24px;">
            <span style="font-size: 36px; font-weight: 800; color: var(--ay-emerald); font-family: 'Instrument Sans', sans-serif;">
              {{ finalUnitPrice }} DH
            </span>
            <span style="font-size: 20px; color: var(--ay-muted); text-decoration: line-through;">
              {{ Math.round(finalUnitPrice * 1.35) }} DH
            </span>
            <span style="background: #e8f5e9; color: #2e7d32; font-size: 12px; font-weight: 800; padding: 4px 10px; border-radius: 4px;">
              -35% OFFRE SPÉCIALE
            </span>
          </div>

          <div style="display: flex; gap: 16px; margin-bottom: 32px;">
            <button class="ayla-btn-emerald" style="font-size: 14px; padding: 18px 36px;" @click="scrollToOrderForm">
              COMMANDER MAINTENANT <ChevronRight :size="18" />
            </button>
          </div>

          <div style="display: flex; gap: 20px; font-size: 12px; color: var(--ay-dark); font-weight: 700;">
            <span>✓ Acier Inoxydable 316L</span>
            <span>✓ Garantie 2 Ans</span>
            <span>✓ Satisfait ou Échangé</span>
          </div>
        </div>

        <!-- Right Photo Gallery Showcase -->
        <div style="text-align: center;">
          <div style="background: #ffffff; border: 1px solid var(--ay-border); border-radius: 20px; padding: 32px; box-shadow: 0 12px 36px rgba(7, 60, 58, 0.06);">
            <img :src="product.image || '/hero.png'" :alt="product.name" style="max-height: 380px; width: auto; object-fit: contain; border-radius: 12px;" />
          </div>

          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 14px;">
            <img src="/hero.png" style="width: 100%; height: 80px; object-fit: cover; border-radius: 10px; border: 2px solid var(--ay-emerald); cursor: pointer;" />
            <img src="/logo.png" style="width: 100%; height: 80px; object-fit: contain; background: var(--ay-emerald); border-radius: 10px; padding: 8px; cursor: pointer;" />
            <div style="background: #ffffff; border-radius: 10px; border: 1px solid var(--ay-border); display: grid; place-items: center; font-size: 11px; font-weight: 700; color: var(--ay-emerald); text-transform: uppercase;">
              Écrin Prestige
            </div>
          </div>
        </div>
      </div>

      <!-- Trust Badges Section (Maison Ayla Style) -->
      <div id="trust-section" class="ayla-trust-grid">
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

      <!-- Main Express Checkout Form Card (Maison Ayla Style) -->
      <div id="checkout-section" class="ayla-product-card" style="max-width: 820px; margin: 40px auto;">
        <div style="text-align: center; margin-bottom: 32px; border-bottom: 1px solid var(--ay-border); padding-bottom: 20px;">
          <h2 style="font-family: 'Instrument Sans', sans-serif; font-size: 26px; font-weight: 700; color: var(--ay-emerald); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px;">
            PASSER VOTRE COMMANDE (PAIEMENT À LA LIVRAISON)
          </h2>
          <p style="font-size: 13px; color: var(--ay-muted);">Remplissez le formulaire ci-dessous pour recevoir votre colis chez vous</p>
        </div>

        <!-- 1. Variant Picker -->
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

      <!-- Customer Reviews Section (Maison Ayla Style) -->
      <div id="reviews-section" style="margin-top: 60px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <span style="color: var(--ay-gold); font-size: 12px; font-weight: 800; letter-spacing: 0.18em; text-transform: uppercase;">AVIS DE NOS CLIENTS AU MAROC</span>
          <h2 style="font-family: 'Instrument Sans', sans-serif; font-size: 28px; font-weight: 700; color: var(--ay-emerald); text-transform: uppercase; margin-top: 4px;">
            CE QUE DISENT NOS CLIENTS SATISFAITS
          </h2>
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
      </div>
    </section>

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
          <p><a href="#hero-section">Accueil</a></p>
          <p><a href="#checkout-section">Commander</a></p>
          <p><a href="#trust-section">Garanties</a></p>
          <p><a href="#reviews-section">Avis Clients</a></p>
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

    <!-- Order Confirmation Modal (Maison Ayla Style) -->
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
