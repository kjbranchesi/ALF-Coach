import { useState, useCallback } from 'react';
import { type WizardData, defaultWizardData } from './wizardSchema';

export function useWizardData(initialData?: Partial<WizardData>) {
  const [data, setData] = useState<WizardData>({
    ...defaultWizardData,
    ...initialData
  });

  const updateField = useCallback(<K extends keyof WizardData>(
    field: K,
    value: WizardData[K]
  ) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const resetData = useCallback(() => {
    setData(defaultWizardData);
  }, []);

  const canProceed = useCallback((field: keyof WizardData) => {
    const value = data[field];
    
    switch (field) {
      case 'motivation':
        return typeof value === 'string' && value.length >= 10;
      case 'subject':
        return typeof value === 'string' && value.length >= 2;
      case 'ageGroup':
        return typeof value === 'string' && value.length >= 3;
      case 'scope':
        return value === 'lesson' || value === 'unit' || value === 'course';
      case 'location':
      case 'materials':
      case 'teacherResources':
        // Optional fields
        return true;
      case 'review':
        // For review step, check all required fields
        return (
          data.motivation.length >= 10 &&
          data.subject.length >= 2 &&
          data.ageGroup.length >= 3 &&
          (data.scope === 'lesson' || data.scope === 'unit' || data.scope === 'course')
        );
      default:
        return true;
    }
  }, [data]);

  const getProgress = useCallback(() => {
    const requiredFields: (keyof WizardData)[] = ['motivation', 'subject', 'ageGroup', 'scope'];
    const completedFields = requiredFields.filter(field => {
      const value = data[field];
      if (field === 'motivation') {return value.length >= 10;}
      if (field === 'subject') {return value.length >= 2;}
      if (field === 'ageGroup') {return value.length >= 3;}
      if (field === 'scope') {return value !== '';}
      return false;
    });
    
    return {
      completed: completedFields.length,
      total: requiredFields.length,
      percentage: Math.round((completedFields.length / requiredFields.length) * 100)
    };
  }, [data]);

  return {
    data,
    updateField,
    resetData,
    canProceed,
    getProgress
  };
}