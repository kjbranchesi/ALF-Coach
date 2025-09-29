import { selectDiverseSuggestionsBalanced } from '../services/SuggestionSelector';

describe('SuggestionSelector', () => {
  it('picks up to 3 with category diversity', () => {
    const items = [
      { id: '1', text: 'A', category: 'core' },
      { id: '2', text: 'B', category: 'cross' },
      { id: '3', text: 'C', category: 'moonshot' },
      { id: '4', text: 'D', category: 'student-led' },
      { id: '5', text: 'E', category: 'core' },
    ];
    const picked = selectDiverseSuggestionsBalanced(items, 3);
    expect(picked).toHaveLength(3);
    const cats = new Set(picked.map(p => p.category));
    // Should include 3 distinct categories when available
    expect(cats.size).toBe(3);
  });

  it('falls back when categories are missing', () => {
    const items = [
      { id: '1', text: 'A' },
      { id: '2', text: 'B' },
      { id: '3', text: 'C' },
    ];
    const picked = selectDiverseSuggestionsBalanced(items, 3);
    expect(picked).toHaveLength(3);
  });

  it('returns empty when no items', () => {
    expect(selectDiverseSuggestionsBalanced([], 3)).toEqual([]);
  });
});

