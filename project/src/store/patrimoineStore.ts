import { create } from 'zustand';
import { TreeNode } from '../types/patrimoine';

interface PatrimoineState {
  selectedNode: TreeNode | null;
  activeView: 'arborescence' | 'equipements' | 'documents' | 'contrats' | 'dashboard' | 'reglementaire' | 'ppi' | 'finance' | 'interventions' | 'predictif' | 'approvisionnements' | 'edl';
  searchQuery: string;
  sidebarCollapsed: boolean;
  filters: {
    statut?: string;
    site?: string;
    categorie?: string;
  };
  setSelectedNode: (node: TreeNode | null) => void;
  setActiveView: (view: PatrimoineState['activeView']) => void;
  setSearchQuery: (q: string) => void;
  setSidebarCollapsed: (v: boolean) => void;
  setFilters: (filters: Partial<PatrimoineState['filters']>) => void;
  clearFilters: () => void;
}

export const usePatrimoineStore = create<PatrimoineState>((set) => ({
  selectedNode: null,
  activeView: 'dashboard',
  searchQuery: '',
  sidebarCollapsed: false,
  filters: {},
  setSelectedNode: (node) => set({ selectedNode: node }),
  setActiveView: (view) => set({ activeView: view }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
  setFilters: (filters) => set((s) => ({ filters: { ...s.filters, ...filters } })),
  clearFilters: () => set({ filters: {} }),
}));
