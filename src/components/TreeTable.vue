<template>
  <div class="tree-table">
    <AgGridVue
      class="tree-table__component"
      :columnDefs="columnDefs"
      :rowData="flatList"
      :treeData="true"
      :getDataPath="getDataPath"
      :autoGroupColumnDef="autoGroupColumnDef"
    ></AgGridVue>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { AgGridVue } from 'ag-grid-vue3';
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { TreeDataModule } from 'ag-grid-enterprise';
import { useTreeStore } from '@/stores/treeStore';

ModuleRegistry.registerModules([AllCommunityModule, TreeDataModule]);

const initialData = [
  { id: 1, parent: null, label: 'Айтем 1' },
  { id: '91064cee', parent: 1, label: 'Айтем 2' },
  { id: 3, parent: 1, label: 'Айтем 3' },
  { id: 4, parent: '91064cee', label: 'Айтем 4' },
  { id: 5, parent: '91064cee', label: 'Айтем 5' },
  { id: 6, parent: '91064cee', label: 'Айтем 6' },
  { id: 7, parent: 4, label: 'Айтем 7' },
  { id: 8, parent: 4, label: 'Айтем 8' }
];

const treeStore = useTreeStore();
treeStore.init(initialData);

const columnDefs = ref([
  { 
    headerName: '№ п/п',
    valueGetter: (params: any) => params.node.rowIndex + 1,
  },
  { field: 'label',  headerName: 'Наименовавние', flex: 1, },
]);

const autoGroupColumnDef = ref({
  headerName: 'Категория',
  cellRendererParams: {
    suppressCount: true,
  },
  valueGetter: (params: any) => {
    const children = treeStore.getChildren(params.data.id);
    return children.length > 0 ? 'Группа' : 'Элемент';
  },
  flex: 1,
});

// Плоский список для таблицы (все элементы)
const flatList = computed(() => treeStore.flatList);

// Настройка группировки (для вложенных строк)
const getDataPath = (data: any) => {
  // здесь нужно построить путь от корня до элемента на основе parent
  // проще всего — использовать вспомогательную функцию
  return getPathToRoot(data.id);
};

const getPathToRoot = (id: string | number): string[] => {
  const parents = treeStore.getAllParents(id);
  // parents возвращает [сам элемент, родитель, корень...]
  // Нам нужен путь вниз к корню: например, ['Группа 1', 'Подгруппа', 'Элемент']
  // Но AgGrid ожидает массив строк для вложенности.
  // Здесь можно сформировать массив из label родительских элементов (кроме самого элемента)
  const path = parents.slice(1).reverse().map(p => p.label);
  const current = treeStore.getItem(id);
  if (current) path.push(current.label);
  return path;
};
</script>

<style scoped>
.tree-table {
  width: 100%;
  height: 500px;
}

.tree-table__component {
  width: 100%;
  height: 100%;
}
</style>
