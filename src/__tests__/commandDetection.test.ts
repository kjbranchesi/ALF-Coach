/**
 * Tests for command detection functionality
 */

import { detectCommand, looksLikeData } from '../core/utils/commandDetection';

describe('Command Detection', () => {
  describe('detectCommand', () => {
    it('should detect exact command matches', () => {
      expect(detectCommand('help').isCommand).toBe(true);
      expect(detectCommand('help').command).toBe('help');
      
      expect(detectCommand('ideas').isCommand).toBe(true);
      expect(detectCommand('ideas').command).toBe('ideas');
      
      expect(detectCommand('what if').isCommand).toBe(true);
      expect(detectCommand('what if').command).toBe('whatif');
    });
    
    it('should detect command variations', () => {
      expect(detectCommand('help me').isCommand).toBe(true);
      expect(detectCommand('help me').command).toBe('help');
      
      expect(detectCommand('give me ideas').isCommand).toBe(true);
      expect(detectCommand('give me ideas').command).toBe('ideas');
      
      expect(detectCommand('continue').isCommand).toBe(true);
      expect(detectCommand('next').isCommand).toBe(true);
      expect(detectCommand('next').command).toBe('continue');
    });
    
    it('should handle case insensitivity', () => {
      expect(detectCommand('HELP').isCommand).toBe(true);
      expect(detectCommand('Help').isCommand).toBe(true);
      expect(detectCommand('HeLp').isCommand).toBe(true);
    });
    
    it('should detect typos', () => {
      expect(detectCommand('hlep').isCommand).toBe(true);
      expect(detectCommand('hlep').command).toBe('help');
      
      expect(detectCommand('ideaz').isCommand).toBe(true);
      expect(detectCommand('ideaz').command).toBe('ideas');
    });
    
    it('should not detect commands in longer text', () => {
      const longText = 'We need help from the community to build a solar panel system';
      expect(detectCommand(longText).isCommand).toBe(false);
      
      const projectDescription = 'Students will explore ideas about renewable energy';
      expect(detectCommand(projectDescription).isCommand).toBe(false);
    });
    
    it('should handle real-world examples', () => {
      // Real audience descriptions should NOT be commands
      expect(detectCommand('Parents and school board').isCommand).toBe(false);
      expect(detectCommand('Local environmental groups').isCommand).toBe(false);
      expect(detectCommand('Community members').isCommand).toBe(false);
      
      // But typing just "help" should be a command
      expect(detectCommand('help').isCommand).toBe(true);
      expect(detectCommand('?').isCommand).toBe(true);
    });
  });
  
  describe('looksLikeData', () => {
    it('should identify data patterns', () => {
      expect(looksLikeData('This is a long description of our project goals')).toBe(true);
      expect(looksLikeData('Grade 7-8 students')).toBe(false);
      expect(looksLikeData('John Smith and Jane Doe')).toBe(true);
      expect(looksLikeData('contact@school.edu')).toBe(true);
      expect(looksLikeData('https://example.com')).toBe(true);
    });
    
    it('should handle edge cases', () => {
      expect(looksLikeData('')).toBe(false);
      expect(looksLikeData('a')).toBe(false);
      expect(looksLikeData('help')).toBe(false);
    });
  });
});