<script setup>
import { useInventoryStore } from '../stores/inventory'
import { Search, Globe, ExternalLink, ShoppingCart } from 'lucide-vue-next'

const store = useInventoryStore()
</script>

<template>
  <header class="top-header">
    <div class="header-title">
      <h1>
        <span v-if="store.activeTab === 'dashboard'">Vue d'ensemble</span>
        <span v-else-if="store.activeTab === 'products'">Produits & Variantes</span>
        <span v-else-if="store.activeTab === 'movements'">Mouvements de Stock</span>
        <span v-else-if="store.activeTab === 'warehouses'">Entrepôts & Transferts</span>
        <span v-else-if="store.activeTab === 'purchases'">Achats Fournisseurs</span>
        <span v-else-if="store.activeTab === 'sessions'">Inventaire (Comptage)</span>
        <span v-else-if="store.activeTab === 'pos'">Point de Vente (POS)</span>
        <span v-else-if="store.activeTab === 'sales'">Commandes & Ventes</span>
        <span v-else-if="store.activeTab === 'reports'">Rapports & Analytics</span>
        <span v-else-if="store.activeTab === 'packagings'">Boîtes & Coffrets</span>
      </h1>
      <p class="header-subtitle">ELMORÉ v2.5 · {{ new Date().toLocaleDateString('fr-MA', { day: 'numeric', month: 'short', year: 'numeric' }) }}</p>
    </div>

    <div class="header-actions">
      <div class="search-bar">
        <Search :size="16" style="color: var(--text-muted); flex-shrink: 0;" />
        <input v-model="store.searchQuery" placeholder="Rechercher..." />
      </div>

      <button class="btn-secondary header-btn-store" style="border-color: #0071e3; color: #0071e3; font-weight: 700;" @click="store.activeTab = 'landing'">
        <Globe :size="16" /> <span class="btn-label">Boutique</span> <ExternalLink :size="13" />
      </button>

      <button class="btn-primary" @click="store.activeTab = 'pos'">
        <ShoppingCart :size="16" /> <span class="btn-label">POS</span>
      </button>
    </div>
  </header>
</template>
