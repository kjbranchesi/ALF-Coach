// SuggestionSelector.ts
// Picks up to `max` suggestions with category diversity across
// 'core' | 'cross' | 'moonshot' | 'student-led'. Falls back gracefully.

export type RailCategory = 'core' | 'cross' | 'moonshot' | 'student-led' | string;

export interface SuggestionEntry {
  id?: string | number;
  text: string;
  category?: RailCategory;
}

export function selectDiverseSuggestionsBalanced(items: SuggestionEntry[], max: number = 3): SuggestionEntry[] {
  if (!Array.isArray(items) || items.length === 0) return [];

  const preferredOrder: RailCategory[] = ['core', 'cross', 'moonshot', 'student-led'];
  const byCategory = new Map<RailCategory, SuggestionEntry[]>();

  for (const s of items) {
    const cat: RailCategory = (s?.category as RailCategory) || 'core';
    const list = byCategory.get(cat) || [];
    list.push(s);
    byCategory.set(cat, list);
  }

  const picked: SuggestionEntry[] = [];

  // First pass: one per preferred category
  for (const cat of preferredOrder) {
    const list = byCategory.get(cat);
    if (list && list.length > 0) {
      picked.push(list.shift()!);
      if (picked.length >= max) return picked;
    }
  }

  // Second pass: fill remaining from any categories
  for (const arr of byCategory.values()) {
    while (arr.length && picked.length < max) {
      picked.push(arr.shift()!);
    }
    if (picked.length >= max) break;
  }

  return picked;
}

