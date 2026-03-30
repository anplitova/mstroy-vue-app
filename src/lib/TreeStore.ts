export interface Item {
  id: string | number;
  parent: string | number | null;
  [key: string]: any;
}

export class TreeStore {
  private items: Item[];
  private itemMap: Map<string | number, Item>;
  private childrenMap: Map<string | number, (string | number)[]>;

  constructor(items: Item[]) {
    this.items = [...items];
    this.itemMap = new Map();
    this.childrenMap = new Map();

    for (const item of this.items) {
      this.itemMap.set(item.id, item);
      const parent = item.parent;
      if (parent !== null && parent !== undefined) {
        if (!this.childrenMap.has(parent)) {
          this.childrenMap.set(parent, []);
        }
        this.childrenMap.get(parent)!.push(item.id);
      }
    }
  }

  // возвращает копию исходного массива элементов
  getAll(): Item[] {
    return [...this.items];
  }

  // возвращает элемент по id
  getItem(id: string | number): Item | undefined {
    return this.itemMap.get(id);
  }

  // возвращает массив прямых дочерних элементов
  getChildren(id: string | number): Item[] {
    const childIds = this.childrenMap.get(id) || [];
    return childIds.map(childId => this.itemMap.get(childId)).filter(Boolean) as Item[];
  }

  // возвращает всех потомков (рекурсивно)
  getAllChildren(id: string | number): Item[] {
    const result: Item[] = [];
    const queue: (string | number)[] = [...(this.childrenMap.get(id) || [])];

    while (queue.length) {
      const currentId = queue.shift()!;
      const currentItem = this.itemMap.get(currentId);
      if (currentItem) {
        result.push(currentItem);
        const children = this.childrenMap.get(currentId) || [];
        queue.push(...children);
      }
    }
    return result;
  }

  // возвращает цепочку родителей от переданного элемента до корня
  getAllParents(id: string | number): Item[] {
    const result: Item[] = [];
    let currentId: string | number | null = id;
    while (currentId !== null) {
      const item = this.itemMap.get(currentId);
      if (!item) break;
      result.push(item);
      currentId = item.parent;
    }
    return result;
  }

  // добавляет новый элемент
  addItem(item: Item): void {
    // проверка на дубликат id
    if (this.itemMap.has(item.id)) {
      throw new Error(`Item with id ${item.id} already exists`);
    }
    this.items.push(item);
    this.itemMap.set(item.id, item);
    const parent = item.parent;
    if (parent !== null && parent !== undefined) {
      if (!this.childrenMap.has(parent)) {
        this.childrenMap.set(parent, []);
      }
      this.childrenMap.get(parent)!.push(item.id);
    }
  }

  // удаляет элемент и всех его потомков
  removeItem(id: string | number): void {
    if (!this.itemMap.get(id)) {
      throw new Error(`Item with id ${id} not found`);
    }

    // собираем все id, которые нужно удалить (сам элемент и все потомки)
    const toRemove = new Set<string | number>([id]);
    const queue = [...(this.childrenMap.get(id) || [])];
    while (queue.length) {
      const currentId = queue.shift()!;
      toRemove.add(currentId);
      const children = this.childrenMap.get(currentId) || [];
      queue.push(...children);
    }

    // удаляем из items (фильтруем)
    this.items = this.items.filter(item => !toRemove.has(item.id));

    // удаляем из itemMap
    for (const removeId of toRemove) {
      this.itemMap.delete(removeId);
    }

    // удаляем из childrenMap все записи, связанные с удалёнными элементами
    for (const removeId of toRemove) {
      this.childrenMap.delete(removeId);
    }

    // удаляем ссылки на удалённые элементы из родительских списков
    for (const [parentId, childrenIds] of this.childrenMap.entries()) {
      const filtered = childrenIds.filter(childId => !toRemove.has(childId));
      if (filtered.length === 0) {
        this.childrenMap.delete(parentId);
      } else {
        this.childrenMap.set(parentId, filtered);
      }
    }
  }

  // обновляет существующий элемент
  updateItem(updatedItem: Item): void {
    const existing = this.itemMap.get(updatedItem.id);
    if (!existing) {
      throw new Error(`Item with id ${updatedItem.id} not found`);
    }

    const oldParent = existing.parent;
    const newParent = updatedItem.parent;

    // обновляем данные в существующем объекте
    Object.assign(existing, updatedItem);

    // если изменился parent, обновляем childrenMap
    if (oldParent !== newParent) {
      // удаляем из старого родителя
      if (oldParent !== null && oldParent !== undefined) {
        const oldChildren = this.childrenMap.get(oldParent);
        if (oldChildren) {
          const filtered = oldChildren.filter(childId => childId !== existing.id);
          if (filtered.length === 0) {
            this.childrenMap.delete(oldParent);
          } else {
            this.childrenMap.set(oldParent, filtered);
          }
        }
      }
      // добавляем к новому родителю
      if (newParent !== null && newParent !== undefined) {
        if (!this.childrenMap.has(newParent)) {
          this.childrenMap.set(newParent, []);
        }
        this.childrenMap.get(newParent)!.push(existing.id);
      }
    }
  }
}