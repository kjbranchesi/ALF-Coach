import { isIdeationUIComplete, isJourneyUIComplete, isDeliverablesUIComplete } from '../completeness';

describe('completeness helpers', () => {
  describe('isIdeationUIComplete', () => {
    test('requires all three fields', () => {
      expect(isIdeationUIComplete('', 'EQ', 'Ch')).toBe(false);
      expect(isIdeationUIComplete('BI', '', 'Ch')).toBe(false);
      expect(isIdeationUIComplete('BI', 'EQ', '')).toBe(false);
      expect(isIdeationUIComplete(' BI ', ' EQ ', ' Ch ')).toBe(true);
    });
  });

  describe('isJourneyUIComplete', () => {
    test('requires at least 3 phases with names', () => {
      expect(isJourneyUIComplete([])).toBe(false);
      expect(isJourneyUIComplete([{ name: 'A' }, { name: 'B' }] as any)).toBe(false);
      expect(isJourneyUIComplete([{ name: 'A' }, { name: 'B' }, { name: '' }] as any)).toBe(false);
      expect(isJourneyUIComplete([{ name: 'A' }, { name: 'B' }, { name: 'C' }] as any)).toBe(true);
    });
  });

  describe('isDeliverablesUIComplete', () => {
    test('requires 3 milestones, 1 artifact, 3 criteria', () => {
      expect(isDeliverablesUIComplete([], [], [])).toBe(false);
      expect(isDeliverablesUIComplete([{ name: 'M1' }], [{ name: 'A1' }], [{ text: 'C1' }])).toBe(false);
      expect(isDeliverablesUIComplete(
        [{ name: 'M1' }, { name: 'M2' }, { name: 'M3' }],
        [],
        [{ text: 'C1' }, { text: 'C2' }, { text: 'C3' }]
      )).toBe(false);
      expect(isDeliverablesUIComplete(
        [{ name: 'M1' }, { name: 'M2' }, { name: 'M3' }],
        [{ name: 'A1' }],
        [{ text: 'C1' }, { text: 'C2' }, { text: 'C3' }]
      )).toBe(true);
    });
  });
});

