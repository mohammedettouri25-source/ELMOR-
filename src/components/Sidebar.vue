<script setup>
import { useInventoryStore } from '../stores/inventory'
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
  Globe,
  ExternalLink
} from 'lucide-vue-next'

const store = useInventoryStore()

const navItems = [
  { id: 'dashboard', label: 'Vue d\'ensemble', icon: LayoutDashboard, color: '#6366f1' },
  { id: 'products', label: 'Produits & Variantes', icon: Package, color: '#3b82f6' },
  { id: 'movements', label: 'Mouvements Stock', icon: ArrowUpRight, color: '#10b981' },
  { id: 'warehouses', label: 'Entrepôts & Transferts', icon: Warehouse, color: '#06b6d4' },
  { id: 'purchases', label: 'Achats Fournisseurs', icon: ShoppingBag, color: '#f59e0b' },
  { id: 'sessions', label: 'Inventaire (Comptage)', icon: CheckCircle2, color: '#ec4899' },
  { id: 'pos', label: 'Point de Vente (POS)', icon: ShoppingCart, color: '#10b981' },
  { id: 'sales', label: 'Commandes & Ventes', icon: Receipt, color: '#6366f1' },
  { id: 'reports', label: 'Rapports & Exports', icon: BarChart3, color: '#a855f7' }
]
</script>

<template>
  <aside class="sidebar">
    <div class="brand-logo" @click="store.activeTab = 'dashboard'">
      <img src="/logo.png" alt="ELMORÉ" />
    </div>

    <!-- Standalone Storefront Shortcut Button -->
    <div style="margin-bottom: 20px; padding: 0 4px;">
      <button class="btn-primary" style="width: 100%; justify-content: space-between; padding: 10px 14px; font-size: 12px; background: #0071e3; border-color: #0071e3; border-radius: 12px;" @click="store.activeTab = 'landing'">
        <span style="display: flex; align-items: center; gap: 8px;">
          <Globe :size="16" /> Boutique Client (Apple)
        </span>
        <ExternalLink :size="14" />
      </button>
    </div>

    <nav class="nav-menu">
      <div
        v-for="item in navItems"
        :key="item.id"
        class="nav-item"
        :class="{ active: store.activeTab === item.id }"
        @click="store.activeTab = item.id"
      >
        <component :is="item.icon" :size="18" :style="{ color: store.activeTab === item.id ? '#ffffff' : item.color }" />
        <span>{{ item.label }}</span>
      </div>
    </nav>

    <div style="margin-top: auto; padding-top: 16px; border-top: 1px solid var(--border-color);">
      <div style="display: flex; align-items: center; gap: 10px; padding: 8px;">
        <div style="width: 36px; height: 36px; border-radius: 50%; background: #09090b; color: #fff; font-weight: 800; display: grid; place-items: center; font-size: 12px;">
          AD
        </div>
        <div>
          <b style="font-size: 13px; display: block; line-height: 1.2;">Admin ELMORÉ</b>
          <small style="color: var(--text-muted); font-size: 11px;">Responsable Stock</small>
        </div>
      </div>
    </div>
  </aside>
</template>
