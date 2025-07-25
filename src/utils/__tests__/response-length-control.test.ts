import { 
  countWords, 
  enforceResponseLength, 
  ResponseContext,
  formatConfirmationResponse 
} from '../response-length-control';

describe('Response Length Control', () => {
  describe('countWords', () => {
    it('counts words correctly', () => {
      expect(countWords('Hello world')).toBe(2);
      expect(countWords('  Multiple   spaces   between  ')).toBe(3);
      expect(countWords('')).toBe(0);
      expect(countWords('   ')).toBe(0);
    });
  });

  describe('enforceResponseLength', () => {
    it('leaves responses within limits unchanged', () => {
      const response = 'This is a perfectly sized confirmation message with exactly the right number of words to fit within our defined limits for this particular context.';
      const result = enforceResponseLength(response, ResponseContext.CONFIRMATION);
      expect(result.wasModified).toBe(false);
      expect(result.text).toBe(response);
    });

    it('truncates responses that are too long', () => {
      const longResponse = Array(100).fill('word').join(' ');
      const result = enforceResponseLength(longResponse, ResponseContext.CONFIRMATION);
      expect(result.wasModified).toBe(true);
      expect(result.wordCount).toBeLessThanOrEqual(50);
    });

    it('preserves punctuation when truncating at sentence boundaries', () => {
      const response = 'This is a question? This is an exclamation! This is a statement. This part will be truncated.';
      const result = enforceResponseLength(response, ResponseContext.CONFIRMATION);
      expect(result.text).toMatch(/[.!?]$/); // Should end with punctuation
      expect(result.text).toContain('?'); // Should preserve question mark
      expect(result.text).toContain('!'); // Should preserve exclamation
    });

    it('allows short responses with warning', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const shortResponse = 'Too short';
      const result = enforceResponseLength(shortResponse, ResponseContext.CONFIRMATION);
      
      expect(result.wasModified).toBe(false);
      expect(result.text).toBe(shortResponse);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Response shorter than expected')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('formatConfirmationResponse', () => {
    it('generates appropriate length confirmations', () => {
      const result = formatConfirmationResponse(
        'Environmental sustainability',
        'IDEATION_BIG_IDEA',
        { subject: 'Science', ageGroup: '6th grade' }
      );
      
      const wordCount = countWords(result);
      expect(wordCount).toBeGreaterThanOrEqual(40);
      expect(wordCount).toBeLessThanOrEqual(50);
      expect(result).toContain('Environmental sustainability');
    });

    it('uses stage-specific templates', () => {
      const bigIdeaResult = formatConfirmationResponse(
        'Test idea',
        'IDEATION_BIG_IDEA',
        {}
      );
      
      const eqResult = formatConfirmationResponse(
        'Test question?',
        'IDEATION_EQ',
        {}
      );
      
      expect(bigIdeaResult).toContain('concept');
      expect(eqResult).toContain('question');
    });
  });
});