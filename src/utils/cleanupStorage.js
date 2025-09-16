// src/utils/cleanupStorage.js

/**
 * Clean up orphaned or invalid blueprint entries from localStorage
 */
export function cleanupLocalStorageBlueprints() {
  let cleaned = 0;
  const keysToRemove = [];

  try {
    // Iterate through all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (key && key.startsWith('blueprint_')) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const blueprint = JSON.parse(stored);

            // Remove if blueprint is invalid or blank
            const isBlank = !blueprint.title &&
                           !blueprint.subject &&
                           !blueprint.gradeLevel &&
                           !blueprint.projectName;

            // Remove if older than 30 days and blank
            const isOld = blueprint.createdAt &&
                         (Date.now() - new Date(blueprint.createdAt).getTime()) > 30 * 24 * 60 * 60 * 1000;

            if (isBlank || (isOld && isBlank)) {
              keysToRemove.push(key);
            }
          }
        } catch (parseError) {
          // If we can't parse it, it's invalid - mark for removal
          keysToRemove.push(key);
        }
      }
    }

    // Remove all marked keys
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      cleaned++;
    });

    if (cleaned > 0) {
      console.log(`Cleaned up ${cleaned} invalid/orphaned blueprint entries from localStorage`);
    }
  } catch (error) {
    console.warn('Error cleaning up localStorage:', error);
  }

  return cleaned;
}

/**
 * Remove duplicate blueprints from localStorage that exist in Firebase
 */
export function removeDuplicateLocalBlueprints(firebaseBlueprints) {
  let removed = 0;

  try {
    // Create a Set of Firebase blueprint IDs for quick lookup
    const firebaseIds = new Set(firebaseBlueprints.map(bp => bp.id));

    // Check localStorage for duplicates
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      if (key && key.startsWith('blueprint_')) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const blueprint = JSON.parse(stored);

            // If this blueprint exists in Firebase, remove from localStorage
            if (firebaseIds.has(blueprint.id)) {
              localStorage.removeItem(key);
              removed++;
            }
          }
        } catch (parseError) {
          console.warn(`Error parsing localStorage blueprint ${key}:`, parseError);
        }
      }
    }

    if (removed > 0) {
      console.log(`Removed ${removed} duplicate blueprints from localStorage`);
    }
  } catch (error) {
    console.warn('Error removing duplicate blueprints:', error);
  }

  return removed;
}