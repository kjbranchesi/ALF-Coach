import React, { useState } from 'react';
import { Button } from '../ui/Button';

interface WelcomeModalProps {
  onComplete: (data: {
    subject: string;
    ageGroup: string;
    idea: string;
    materials: string;
  }) => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    subject: '',
    ageGroup: '',
    idea: '',
    materials: ''
  });

  const [errors, setErrors] = useState({
    subject: '',
    ageGroup: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const newErrors = {
      subject: formData.subject.trim() ? '' : 'Subject is required',
      ageGroup: formData.ageGroup.trim() ? '' : 'Age group is required'
    };

    setErrors(newErrors);

    // If no errors, submit
    if (!newErrors.subject && !newErrors.ageGroup) {
      onComplete({
        subject: formData.subject.trim(),
        ageGroup: formData.ageGroup.trim(),
        idea: formData.idea.trim(),
        materials: formData.materials.trim()
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (field === 'subject' || field === 'ageGroup') {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome to ProjectCraft!
          </h2>
          <p className="text-gray-600">
            Let's get started by learning a bit about your project vision.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Subject/Theme */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject / Theme *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              placeholder="e.g. Modern History, Marine Biology, Urban Planning"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.subject ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.subject && (
              <p className="text-red-500 text-xs mt-1">{errors.subject}</p>
            )}
          </div>

          {/* Age Group */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Age Group *
            </label>
            <input
              type="text"
              value={formData.ageGroup}
              onChange={(e) => handleInputChange('ageGroup', e.target.value)}
              placeholder="e.g. seventh grade, ages 14-16, high school seniors"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.ageGroup ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.ageGroup && (
              <p className="text-red-500 text-xs mt-1">{errors.ageGroup}</p>
            )}
          </div>

          {/* Rough Idea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rough Idea (optional)
            </label>
            <textarea
              value={formData.idea}
              onChange={(e) => handleInputChange('idea', e.target.value)}
              placeholder="Any initial thoughts, themes, or directions you're considering..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          {/* Initial Materials */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Initial Materials / Resources (optional)
            </label>
            <textarea
              value={formData.materials}
              onChange={(e) => handleInputChange('materials', e.target.value)}
              placeholder="Book titles, URLs, videos, articles, or other resources you want to incorporate..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>

          <div className="pt-4">
            <Button
              type="submit"
              className="w-full bg-primary text-surface hover:bg-primary/90"
            >
              Start Designing
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};