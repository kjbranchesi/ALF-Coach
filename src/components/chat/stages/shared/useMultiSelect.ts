/**
 * Shared multi-select logic for ALF Coach components
 * Reduces code duplication and ensures consistent behavior
 */

import { useState } from 'react';
import { generateSecureId } from '../../../../core/utils/idGeneration';

export interface MultiSelectItem {
  id: string;
  [key: string]: any;
}

export interface UseMultiSelectOptions<T extends MultiSelectItem> {
  minItems?: number;
  maxItems?: number;
  initialItems: T[];
}

export function useMultiSelect<T extends MultiSelectItem>({
  minItems = 1,
  maxItems = 10,
  initialItems
}: UseMultiSelectOptions<T>) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [localItems, setLocalItems] = useState<T[]>(initialItems);

  const toggleItem = (item: T) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(item.id)) {
      newSelected.delete(item.id);
    } else if (newSelected.size < maxItems) {
      newSelected.add(item.id);
    }
    setSelectedItems(newSelected);
  };

  const addCustomItem = (item: Omit<T, 'id'>) => {
    const newItem = {
      ...item,
      id: generateSecureId()
    } as T;
    
    setLocalItems(prev => [...prev, newItem]);
    setSelectedItems(prev => new Set([...prev, newItem.id]));
    return newItem;
  };

  const getSelectedItems = () => {
    return localItems.filter(item => selectedItems.has(item.id));
  };

  const canContinue = selectedItems.size >= minItems;
  const isMaxReached = selectedItems.size >= maxItems;

  return {
    selectedItems,
    localItems,
    toggleItem,
    addCustomItem,
    getSelectedItems,
    canContinue,
    isMaxReached,
    selectedCount: selectedItems.size
  };
}