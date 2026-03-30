import { defineStore } from 'pinia';
import { TreeStore, type Item } from '@/lib/TreeStore';

export const useTreeStore = defineStore('tree', {
  state: () => ({
    treeStore: null as TreeStore | null,
    initialItems: [] as Item[],
  }),

  actions: {
    init(items: Item[]) {
      this.initialItems = items;
      this.treeStore = new TreeStore(items);
    },

    getAll() {
      return this.treeStore?.getAll() ?? [];
    },

    getItem(id: string | number) {
      return this.treeStore?.getItem(id);
    },

    getChildren(id: string | number) {
      return this.treeStore?.getChildren(id) ?? [];
    },

    getAllChildren(id: string | number) {
      return this.treeStore?.getAllChildren(id) ?? [];
    },

    getAllParents(id: string | number) {
      return this.treeStore?.getAllParents(id) ?? [];
    },

    addItem(item: Item) {
      this.treeStore?.addItem(item);
    },

    removeItem(id: string | number) {
      this.treeStore?.removeItem(id);
    },

    updateItem(item: Item) {
      this.treeStore?.updateItem(item);
    },
  },

  getters: {
    flatList: (state) => {
      return state.treeStore?.getAll() ?? [];
    },
  },
});
