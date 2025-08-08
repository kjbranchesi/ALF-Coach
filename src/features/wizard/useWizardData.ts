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

  const canProceed = useCallback((stepId: string) => {
    switch (stepId) {
      case 'vision':
        return data.vision && data.vision.length >= 20;
      case 'subjectScope':
        return data.subject && data.subject.length >= 2 && data.duration;
      case 'students':
        return data.gradeLevel && data.gradeLevel.length >= 2;
      case 'review':
        // For review step, check all required fields
        return (
          data.vision && data.vision.length >= 20 &&
          data.subject && data.subject.length >= 2 &&
          data.duration &&
          data.gradeLevel && data.gradeLevel.length >= 2
        );
      default:
        return true;
    }
  }, [data]);

  const getProgress = useCallback(() => {
    const requiredFields: (keyof WizardData)[] = ['vision', 'subject', 'duration', 'gradeLevel'];
    const completedFields = requiredFields.filter(field => {
      const value = data[field];
      if (field === 'vision') {return value && value.length >= 20;}
      if (field === 'subject') {return value && value.length >= 2;}
      if (field === 'duration') {return value !== '';}
      if (field === 'gradeLevel') {return value && value.length >= 2;}
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