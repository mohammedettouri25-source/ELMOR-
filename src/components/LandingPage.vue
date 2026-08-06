<script setup>
import { ref, computed } from 'vue'
import { useInventoryStore, PACKAGING_OPTIONS } from '../stores/inventory'
import {
  ShoppingBag,
  Share2,
  Check,
  ShieldCheck,
  Truck,
  Box,
  Gift,
  Award,
  Sparkles,
  ChevronRight,
  Copy,
  Clock,
  CheckCircle2,
  X,
  MessageSquare
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
  store.notify('Lien unique du produit copié !')
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
</script>

<template>
  <div v-if="product" class="landing-container">
    <!-- Top Product Bar & Switcher -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; background: #ffffff; padding: 12px 20px; border-radius: 14px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);">
      <div style="display: flex; align-items: center; gap: 12px;">
        <span class="badge badge-dark">Storefront Luxe</span>
        <select v-model="store.selectedLandingProductId" class="form-control" style="width: auto; font-weight: 700;">
          <option v-for="p in store.products" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>
      </div>

      <button class="btn-secondary" style="font-size: 12px;" @click="copyProductShareLink">
        <Copy :size="14" /> {{ isCopied ? 'Lien copié ✓' : 'Copier le lien du produit' }}
      </button>
    </div>

    <!-- Main Hero Landing Showcase -->
    <div class="landing-hero">
      <!-- Gallery Column -->
      <div class="landing-gallery">
        <img :src="product.image || '/hero.png'" :alt="product.name" class="main-hero-img" />
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;">
          <img src="/hero.png" style="width: 100%; height: 90px; object-fit: cover; border-radius: 10px; border: 2px solid #09090b; cursor: pointer;" />
          <img src="/logo.png" style="width: 100%; height: 90px; object-fit: contain; background: #000; border-radius: 10px; padding: 10px; cursor: pointer;" />
          <div style="background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0; display: grid; place-items: center; font-size: 11px; font-weight: 700; color: var(--text-muted);">
            Écrin Luxe
          </div>
        </div>
      </div>

      <!-- Info & Customizer Column -->
      <div class="landing-info">
        <div class="brand-subtitle">{{ product.brand || 'ELMORÉ LUXURY' }} · {{ product.category }}</div>
        <h1>{{ product.name }}</h1>
        <p class="description">{{ product.description }}</p>

        <!-- Dynamic Price Calculator Box -->
        <div class="price-box">
          <span class="main-price">{{ finalUnitPrice }} MAD</span>
          <span class="original-price">{{ Math.round(finalUnitPrice * 1.35) }} MAD</span>
          <span class="badge badge-emerald" style="margin-left: auto; font-size: 12px;">-35% Offre Spéciale</span>
        </div>

        <!-- Variant Selector (Color & Size) -->
        <div style="margin-bottom: 20px;">
          <div class="option-title">
            <span>Choisir la Variante</span>
            <span style="color: var(--icon-indigo);">Stock disponible : {{ currentVariant?.stock || 0 }}</span>
          </div>

          <div class="option-chips">
            <div
              v-for="v in product.variants"
              :key="v.id"
              class="chip"
              :class="{ active: selectedVariantId === v.id }"
              @click="selectedVariantId = v.id"
            >
              <b>{{ v.color }}</b> · {{ v.size }} ({{ v.material || 'Acier' }})
            </div>
          </div>
        </div>

        <!-- Packaging Options Selector (Avec Boîte vs Sans Boîte) -->
        <div style="margin-bottom: 24px;">
          <div class="option-title">
            <span>Options d'Emballage & Boîte</span>
            <span style="color: var(--icon-emerald); font-size: 11px;">Chaque boîte a son prix</span>
          </div>

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
              <div class="box-price" style="margin-top: 10px;">
                {{ boxOption.extraPrice === 0 ? 'Inclus Gratuitement' : `+${boxOption.extraPrice} MAD` }}
              </div>
            </div>
          </div>
        </div>

        <!-- Quantity Selector -->
        <div style="margin-bottom: 24px; background: #ffffff; padding: 14px 18px; border-radius: 12px; border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
          <div>
            <b style="font-size: 14px; display: block;">Quantité désirée</b>
            <small style="color: var(--text-muted); font-size: 12px;">Total: <strong style="color: var(--primary-color);">{{ totalPrice }} MAD</strong></small>
          </div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <button class="btn-secondary" style="padding: 6px 14px; font-weight: 800; font-size: 16px;" @click="decrementQty">-</button>
            <span style="font-size: 16px; font-weight: 800; min-width: 24px; text-align: center;">{{ orderQuantity }}</span>
            <button class="btn-secondary" style="padding: 6px 14px; font-weight: 800; font-size: 16px;" @click="incrementQty">+</button>
          </div>
        </div>

        <!-- Express Direct Order Form -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 24px; border-radius: 16px;">
          <h3 style="font-size: 16px; font-weight: 800; margin-bottom: 14px; display: flex; align-items: center; gap: 8px;">
            <ShoppingBag :size="18" style="color: var(--icon-indigo);" />
            Commander en 1-Clic (Paiement à la Livraison)
          </h3>

          <form @submit.prevent="handleLandingCheckout">
            <div class="grid-2">
              <div class="form-group">
                <label>Nom & Prénom</label>
                <input v-model="customerForm.name" class="form-control" required placeholder="Ex: Mohamed Alami" />
              </div>
              <div class="form-group">
                <label>Téléphone WhatsApp</label>
                <input v-model="customerForm.phone" class="form-control" required placeholder="Ex: 06 61 22 33 44" />
              </div>
            </div>

            <div class="grid-2">
              <div class="form-group">
                <label>Ville de Livraison</label>
                <select v-model="customerForm.city" class="form-control">
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
                <label>Adresse Complète</label>
                <input v-model="customerForm.address" class="form-control" placeholder="Quartier, Rue, N° Appt" />
              </div>
            </div>

            <div class="form-group">
              <label>Remarques Spéciales (Optionnel)</label>
              <input v-model="customerForm.notes" class="form-control" placeholder="Ex: Horaires de livraison préférés..." />
            </div>

            <button type="submit" class="btn-primary" style="width: 100%; justify-content: center; padding: 14px; font-size: 15px; font-weight: 800; margin-top: 10px;" :disabled="isOrdering">
              {{ isOrdering ? 'Confirmation en cours...' : `Confirmer la Commande (${totalPrice} MAD)` }}
            </button>
          </form>

          <div style="display: flex; justify-content: space-around; margin-top: 16px; font-size: 11px; color: var(--text-muted); text-align: center;">
            <span><Truck :size="14" style="color: var(--icon-emerald);" /> Livraison Gratuite au Maroc</span>
            <span><ShieldCheck :size="14" style="color: var(--icon-indigo);" /> Garantie 2 Ans ELMORÉ</span>
            <span><Clock :size="14" style="color: var(--icon-amber);" /> Expédition sous 24h</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ORDER SUCCESS CONFIRMATION MODAL -->
    <div v-if="showSuccessModal && lastOrder" class="modal-overlay" @click.self="showSuccessModal = false">
      <div class="modal-card" style="max-width: 520px; text-align: center;">
        <div style="margin-bottom: 16px;">
          <div style="width: 60px; height: 60px; background: #d1fae5; color: #059669; border-radius: 50%; display: grid; place-items: center; margin: 0 auto 12px auto;">
            <CheckCircle2 :size="36" />
          </div>
          <h2 style="font-size: 22px; font-weight: 800; color: #09090b; margin-bottom: 4px;">Merci pour votre commande !</h2>
          <p style="color: var(--text-muted); font-size: 13px;">Votre commande a été enregistrée avec succès sous la référence :</p>
          <div style="display: inline-block; background: #09090b; color: #ffffff; padding: 6px 16px; border-radius: 8px; font-size: 18px; font-weight: 800; margin-top: 8px;">
            {{ lastOrder.orderNumber }}
          </div>
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; text-align: left; margin-bottom: 20px; font-size: 13px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 8px;">
            <span style="color: var(--text-muted);">Client :</span>
            <b>{{ lastOrder.customerName }} ({{ lastOrder.customerPhone }})</b>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 8px;">
            <span style="color: var(--text-muted);">Livraison :</span>
            <b>{{ lastOrder.customerCity }} {{ lastOrder.customerAddress ? `- ${lastOrder.customerAddress}` : '' }}</b>
          </div>
          <div v-for="item in lastOrder.items" :key="item.variantId" style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <div>
              <b>{{ item.name }}</b>
              <span style="display: block; color: var(--text-muted); font-size: 11px;">{{ item.variantName }} ({{ item.packaging }}) x{{ item.quantity }}</span>
            </div>
            <b style="color: #047857;">{{ item.subtotal }} MAD</b>
          </div>
          <div style="display: flex; justify-content: space-between; border-top: 2px solid #09090b; padding-top: 8px; margin-top: 8px; font-size: 15px; font-weight: 800;">
            <span>Total (Paiement à la Livraison) :</span>
            <span style="color: #047857;">{{ lastOrder.totalAmount }} MAD</span>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          <a :href="getWhatsAppUrl(lastOrder.orderNumber)" target="_blank" class="btn-primary" style="background: #25D366; border-color: #25D366; justify-content: center; padding: 12px; font-weight: 800; font-size: 14px; text-decoration: none;">
            <MessageSquare :size="18" /> Suivre ma Commande via WhatsApp
          </a>
          <button class="btn-secondary" style="justify-content: center; padding: 10px;" @click="showSuccessModal = false">
            Fermer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
