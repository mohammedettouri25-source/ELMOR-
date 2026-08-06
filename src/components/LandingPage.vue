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
  Settings
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
  const msg = encodeURIComponent(`Bonjour ELMORÉ, je viens de passer la commande N° ${orderNumber}. Merci de me confirmer l'expédition !`)
  return `https://wa.me/212661889900?text=${msg}`
}

function scrollToOrderForm() {
  const el = document.getElementById('checkout-section')
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <div v-if="product" class="apple-store-container">
    <!-- Apple Top Translucent Navigation Bar -->
    <header class="apple-nav">
      <div class="apple-nav-inner">
        <div class="apple-nav-logo" @click="store.activeTab = 'landing'">
          <img src="/logo.png" alt="ELMORÉ" />
          <span style="font-size: 15px; font-weight: 800; letter-spacing: -0.02em;">ELMORÉ</span>
        </div>

        <div class="apple-nav-links">
          <select v-model="store.selectedLandingProductId" style="border: none; background: transparent; font-size: 13px; font-weight: 600; color: #1d1d1f; cursor: pointer; outline: none;">
            <option v-for="p in store.products" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>

          <span class="apple-nav-link" @click="copyProductShareLink">
            {{ isCopied ? 'Lien copié ✓' : 'Partager' }}
          </span>

          <button class="btn-secondary" style="border-radius: 9999px; padding: 6px 14px; font-size: 11px; background: #09090b; color: #ffffff;" @click="store.activeTab = 'dashboard'">
            <Settings :size="13" /> 🛠️ Administration
          </button>
        </div>
      </div>
    </header>

    <!-- Apple-Style Hero Showcase -->
    <section class="apple-hero-section">
      <div style="text-align: center; max-width: 780px; margin: 0 auto 48px auto;">
        <div style="font-size: 13px; font-weight: 700; color: #86868b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;">
          Nouveau · Collection {{ product.brand || 'ELMORÉ Luxe' }}
        </div>
        <h1 class="apple-hero-title">{{ product.name }}</h1>
        <p class="apple-hero-subtitle">{{ product.description }}</p>

        <div style="display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 24px;">
          <span style="font-size: 32px; font-weight: 700; color: #1d1d1f;">{{ finalUnitPrice }} MAD</span>
          <span style="font-size: 20px; color: #86868b; text-decoration: line-through;">{{ Math.round(finalUnitPrice * 1.35) }} MAD</span>
          <span style="background: #e8f5e9; color: #2e7d32; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 9999px;">
            -35% Offre Spéciale
          </span>
        </div>

        <button class="apple-btn-primary" style="font-size: 16px; padding: 16px 36px;" @click="scrollToOrderForm">
          Commander Maintenant <ChevronRight :size="18" />
        </button>
      </div>

      <!-- Main Showcase Image -->
      <div style="position: relative; max-width: 860px; margin: 0 auto 60px auto; background: #ffffff; border-radius: 28px; padding: 40px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.06); border: 1px solid rgba(0,0,0,0.04); text-align: center;">
        <img :src="product.image || '/hero.png'" :alt="product.name" style="max-height: 420px; width: auto; object-fit: contain; border-radius: 16px;" />
      </div>

      <!-- Apple Bento Grid Features -->
      <div class="apple-bento-grid">
        <div class="apple-bento-card">
          <div class="apple-bento-icon"><Sparkles :size="22" /></div>
          <div>
            <h4>Mouvement Automatique</h4>
            <p>Mécanisme suisse haute précision squelette avec réserve de marche de 48h.</p>
          </div>
        </div>

        <div class="apple-bento-card">
          <div class="apple-bento-icon"><ShieldCheck :size="22" /></div>
          <div>
            <h4>Acier Inoxydable 316L</h4>
            <p>Boîtier chirurgical haute résistance aux rayures et à la corrosion.</p>
          </div>
        </div>

        <div class="apple-bento-card">
          <div class="apple-bento-icon"><Box :size="22" /></div>
          <div>
            <h4>Verre Saphir Inrayable</h4>
            <p>Cristal de saphir traité anti-reflets double face pour une clarté absolue.</p>
          </div>
        </div>

        <div class="apple-bento-card">
          <div class="apple-bento-icon"><Gift :size="22" /></div>
          <div>
            <h4>Écrin Luxe sur-mesure</h4>
            <p>Coffret rigide prestige ELMORÉ avec certificat d'authenticité inclus.</p>
          </div>
        </div>
      </div>

      <!-- Order Customizer & Form Card -->
      <div id="checkout-section" class="apple-card" style="max-width: 780px; margin: 40px auto 0 auto;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h2 style="font-size: 26px; font-weight: 700; color: #1d1d1f; margin-bottom: 6px;">Personnaliser & Commander</h2>
          <p style="font-size: 14px; color: #86868b;">Livraison gratuite partout au Maroc · Paiement à la réception</p>
        </div>

        <!-- 1. Select Variant -->
        <div style="margin-bottom: 28px;">
          <label style="font-size: 13px; font-weight: 700; color: #1d1d1f; display: block; margin-bottom: 10px;">
            1. Sélectionner la Finition / Variante :
          </label>

          <div class="apple-pill-selector">
            <button
              v-for="v in product.variants"
              :key="v.id"
              class="apple-pill"
              :class="{ active: selectedVariantId === v.id }"
              @click="selectedVariantId = v.id"
            >
              {{ v.color }} · {{ v.size }} ({{ v.material || 'Acier' }})
            </button>
          </div>
        </div>

        <!-- 2. Select Packaging -->
        <div style="margin-bottom: 28px;">
          <label style="font-size: 13px; font-weight: 700; color: #1d1d1f; display: block; margin-bottom: 10px;">
            2. Choisir l'Emballage & Boîte :
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
                {{ boxOption.extraPrice === 0 ? 'Inclus' : `+${boxOption.extraPrice} MAD` }}
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Quantity -->
        <div style="margin-bottom: 32px; background: #f5f5f7; padding: 16px 20px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span style="font-size: 14px; font-weight: 700; display: block;">Quantité :</span>
            <small style="color: #86868b; font-size: 12px;">Total commande: <strong style="color: #0071e3;">{{ totalPrice }} MAD</strong></small>
          </div>
          <div style="display: flex; align-items: center; gap: 14px;">
            <button class="apple-pill" style="padding: 6px 16px; font-weight: 800; font-size: 16px;" @click="decrementQty">-</button>
            <span style="font-size: 18px; font-weight: 800; min-width: 24px; text-align: center;">{{ orderQuantity }}</span>
            <button class="apple-pill" style="padding: 6px 16px; font-weight: 800; font-size: 16px;" @click="incrementQty">+</button>
          </div>
        </div>

        <!-- 4. Customer Information Form -->
        <form @submit.prevent="handleLandingCheckout">
          <div style="font-size: 13px; font-weight: 700; color: #1d1d1f; margin-bottom: 12px;">
            3. Informations de Livraison :
          </div>

          <div class="grid-2" style="margin-bottom: 14px;">
            <div class="form-group">
              <label>Nom & Prénom</label>
              <input v-model="customerForm.name" class="form-control" style="border-radius: 12px; padding: 12px;" required placeholder="Mohamed Alami" />
            </div>
            <div class="form-group">
              <label>Téléphone WhatsApp</label>
              <input v-model="customerForm.phone" class="form-control" style="border-radius: 12px; padding: 12px;" required placeholder="06 61 22 33 44" />
            </div>
          </div>

          <div class="grid-2" style="margin-bottom: 14px;">
            <div class="form-group">
              <label>Ville</label>
              <select v-model="customerForm.city" class="form-control" style="border-radius: 12px; padding: 12px;">
                <option value="Casablanca">Casablanca</option>
                <option value="Rabat">Rabat</option>
                <option value="Marrakech">Marrakech</option>
                <option value="Tangier">Tanger</option>
                <option value="Safi">Safi</option>
                <option value="Agadir">Agadir</option>
                <option value="Fès">Fès</option>
                <option value="Autre Ville">Autre Ville</option>
              </select>
            </div>
            <div class="form-group">
              <label>Adresse de Livraison</label>
              <input v-model="customerForm.address" class="form-control" style="border-radius: 12px; padding: 12px;" placeholder="Quartier, Rue, N° Appt" />
            </div>
          </div>

          <button type="submit" class="apple-btn-primary" style="width: 100%; justify-content: center; padding: 16px; font-size: 16px; font-weight: 700; margin-top: 10px;" :disabled="isOrdering">
            {{ isOrdering ? 'Confirmation...' : `Confirmer la Commande (${totalPrice} MAD)` }}
          </button>
        </form>

        <div style="display: flex; justify-content: space-around; margin-top: 24px; font-size: 12px; color: #86868b; text-align: center;">
          <span><Truck :size="15" style="color: #2e7d32; display: inline; vertical-align: middle;" /> Livraison Gratuite</span>
          <span><ShieldCheck :size="15" style="color: #0071e3; display: inline; vertical-align: middle;" /> Garantie 2 Ans</span>
          <span><Clock :size="15" style="color: #ed6c02; display: inline; vertical-align: middle;" /> Expédition 24h</span>
        </div>
      </div>
    </section>

    <!-- Apple-Style Order Success Modal -->
    <div v-if="showSuccessModal && lastOrder" class="modal-overlay" @click.self="showSuccessModal = false">
      <div class="modal-card" style="max-width: 520px; text-align: center; border-radius: 28px; padding: 36px;">
        <div style="margin-bottom: 20px;">
          <div style="width: 64px; height: 64px; background: #e8f5e9; color: #2e7d32; border-radius: 50%; display: grid; place-items: center; margin: 0 auto 16px auto;">
            <CheckCircle2 :size="38" />
          </div>
          <h2 style="font-size: 24px; font-weight: 700; color: #1d1d1f; margin-bottom: 6px;">Commande Confirmée !</h2>
          <p style="color: #86868b; font-size: 14px;">Votre commande est enregistrée sous le numéro :</p>
          <div style="display: inline-block; background: #1d1d1f; color: #ffffff; padding: 8px 20px; border-radius: 12px; font-size: 18px; font-weight: 800; margin-top: 10px;">
            {{ lastOrder.orderNumber }}
          </div>
        </div>

        <div style="background: #f5f5f7; border-radius: 16px; padding: 20px; text-align: left; margin-bottom: 24px; font-size: 13px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="color: #86868b;">Client :</span>
            <b>{{ lastOrder.customerName }} ({{ lastOrder.customerPhone }})</b>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="color: #86868b;">Ville :</span>
            <b>{{ lastOrder.customerCity }}</b>
          </div>
          <div v-for="item in lastOrder.items" :key="item.variantId" style="display: flex; justify-content: space-between; border-top: 1px solid #e5e5ea; padding-top: 10px; margin-top: 10px;">
            <div>
              <b>{{ item.name }}</b>
              <span style="display: block; color: #86868b; font-size: 11px;">{{ item.variantName }} ({{ item.packaging }}) x{{ item.quantity }}</span>
            </div>
            <b style="color: #2e7d32;">{{ item.subtotal }} MAD</b>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          <a :href="getWhatsAppUrl(lastOrder.orderNumber)" target="_blank" class="apple-btn-primary" style="background: #25D366; text-decoration: none; justify-content: center;">
            <MessageSquare :size="18" /> Suivre ma commande sur WhatsApp
          </a>
          <button class="btn-secondary" style="border-radius: 9999px; justify-content: center; padding: 12px;" @click="showSuccessModal = false">
            Fermer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
