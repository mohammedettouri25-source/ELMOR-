<script setup>
import { useInventoryStore } from '../stores/inventory'
import { Search, Plus, ArrowUpRight, Bell, QrCode, ShoppingCart, Globe, ExternalLink } from 'lucide-vue-next'

const store = useInventoryStore()
</script>

<template>
  <header class="top-header">
    <div class="header-title">
      <h1>
        <span v-if="store.activeTab === 'dashboard'">Vue d'ensemble Système</span>
        <span v-else-if="store.activeTab === 'products'">Gestion des Produits & Variantes</span>
        <span v-else-if="store.activeTab === 'movements'">Audit Trail & Mouvements</span>
        <span v-else-if="store.activeTab === 'warehouses'">Entrepôts & Transferts Inter-Dépôts</span>
        <span v-else-if="store.activeTab === 'purchases'">Bons d'Achat & Réception Fournisseurs</span>
        <span v-else-if="store.activeTab === 'sessions'">Sessions d'Inventaire Physique</span>
        <span v-else-if="store.activeTab === 'pos'">Point de Vente Caissier (POS)</span>
        <span v-else-if="store.activeTab === 'sales'">Historique des Commandes & Ventes</span>
        <span v-else-if="store.activeTab === 'reports'">Rapports Financiers & Analytics</span>
      </h1>
      <p>ELMORÉ Enterprise Inventory System v2.5 · {{ new Date().toLocaleDateString('fr-MA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) }}</p>
    </div>

    <div class="header-actions">
      <div class="search-bar">
        <Search :size="16" style="color: var(--text-muted);" />
        <input v-model="store.searchQuery" placeholder="Rechercher produit, SKU, barcode..." />
      </div>

      <button class="btn-secondary" style="border-color: #0071e3; color: #0071e3; font-weight: 700;" @click="store.activeTab = 'landing'">
        <Globe :size="16" /> Boutique Client (Apple Store) <ExternalLink :size="13" />
      </button>

      <button class="btn-primary" @click="store.activeTab = 'pos'">
        <ShoppingCart :size="16" /> Vente POS
      </button>
    </div>
  </header>
</template>
