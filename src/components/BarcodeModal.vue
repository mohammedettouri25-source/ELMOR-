<script setup>
import { ref, watch, onMounted } from 'vue'
import QRCode from 'qrcode'
import { Printer, X } from 'lucide-vue-next'

const props = defineProps({
  show: Boolean,
  variant: Object,
  productName: String
})

const emit = defineEmits(['close'])
const qrCanvas = ref(null)

watch(() => props.variant, async (newVal) => {
  if (newVal && newVal.barcode) {
    setTimeout(generateQrCode, 50)
  }
}, { immediate: true })

async function generateQrCode() {
  if (!qrCanvas.value || !props.variant) return
  try {
    const text = `ELMORE:${props.variant.sku || props.variant.barcode}`
    await QRCode.toCanvas(qrCanvas.value, text, {
      width: 160,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' }
    })
  } catch (err) {
    console.error('QR code generation error:', err)
  }
}

function printLabel() {
  const win = window.open('', '_blank')
  if (!win) return alert('Veuillez autoriser les fenêtres surgissantes pour l\'impression')

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Étiquette Barcode ${props.variant?.sku}</title>
        <style>
          body { font-family: sans-serif; text-align: center; padding: 20px; }
          .label-card { border: 2px solid #000; padding: 15px; width: 260px; margin: 0 auto; border-radius: 8px; }
          .brand { font-size: 16px; font-weight: 900; letter-spacing: 1px; margin-bottom: 4px; }
          .title { font-size: 12px; font-weight: bold; margin-bottom: 8px; }
          .barcode-text { font-family: monospace; font-size: 14px; letter-spacing: 2px; font-weight: bold; margin-top: 8px; }
          .price { font-size: 18px; font-weight: 800; margin-top: 6px; }
        </style>
      </head>
      <body>
        <div class="label-card">
          <div class="brand">ELMORÉ</div>
          <div class="title">${props.productName || ''}</div>
          <div>${props.variant?.color || ''} · ${props.variant?.size || ''}</div>
          <img src="${qrCanvas.value ? qrCanvas.value.toDataURL() : ''}" width="140"/>
          <div class="barcode-text">${props.variant?.barcode || props.variant?.sku}</div>
          <div class="price">${props.variant?.price || 0} MAD</div>
        </div>
        <script>setTimeout(() => window.print(), 300);<\/script>
      </body>
    </html>
  `
  win.document.write(html)
  win.document.close()
}
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-card" style="max-width: 420px; text-align: center;">
      <div class="modal-header">
        <h3>Étiquette Code-Barres & QR</h3>
        <button class="close-btn" @click="emit('close')"><X :size="18"/></button>
      </div>

      <div style="background: #ffffff; color: #000000; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
        <h4 style="font-size: 18px; font-weight: 900; font-family: 'Outfit', sans-serif;">ELMORÉ</h4>
        <p style="font-size: 13px; font-weight: 700; margin: 4px 0;">{{ productName }}</p>
        <p style="font-size: 12px; color: #4b5563;">{{ variant?.color }} · {{ variant?.size }} · {{ variant?.material || 'Standard' }}</p>

        <div style="display: flex; justify-content: center; margin: 16px 0;">
          <canvas ref="qrCanvas"></canvas>
        </div>

        <div style="font-family: monospace; font-size: 15px; font-weight: 800; letter-spacing: 2px;">
          {{ variant?.barcode || variant?.sku }}
        </div>
        <div style="font-size: 20px; font-weight: 900; color: #111827; margin-top: 6px;">
          {{ variant?.price || 0 }} MAD
        </div>
      </div>

      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        <button class="btn-secondary" @click="emit('close')">Fermer</button>
        <button class="btn-primary" @click="printLabel">
          <Printer :size="16" /> Imprimer l'Étiquette
        </button>
      </div>
    </div>
  </div>
</template>
