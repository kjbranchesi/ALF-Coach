import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WizardData } from '../wizardSchema';
import { PackageIcon, PlusIcon, X } from '../../../components/icons/ButtonIcons';

interface StepProps {
  data: WizardData;
  updateField: <K extends keyof WizardData>(field: K, value: WizardData[K]) => void;
  error?: string;
}

const commonMaterials = [
  { category: 'Technology', items: ['Computers/Tablets', '3D Printer', 'Robotics Kit', 'Cameras'] },
  { category: 'Art Supplies', items: ['Paper & Canvas', 'Paint & Brushes', 'Clay', 'Digital Design Software'] },
  { category: 'Science', items: ['Lab Equipment', 'Microscopes', 'Chemistry Set', 'Nature Materials'] },
  { category: 'General', items: ['Books/Library', 'Internet Access', 'Basic Supplies', 'Outdoor Space'] }
];

export function MaterialsStep({ data, updateField, error }: StepProps) {
  const [customMaterial, setCustomMaterial] = useState('');
  const materials = data.materials ? data.materials.split(', ').filter(m => m) : [];

  const addMaterial = (material: string) => {
    if (!materials.includes(material)) {
      const newMaterials = [...materials, material].join(', ');
      updateField('materials', newMaterials);
    }
  };

  const removeMaterial = (material: string) => {
    const newMaterials = materials.filter(m => m !== material).join(', ');
    updateField('materials', newMaterials);
  };

  const handleCustomAdd = () => {
    if (customMaterial.trim()) {
      addMaterial(customMaterial.trim());
      setCustomMaterial('');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">What materials do you have?</h2>
        <p className="text-slate-600">
          Select available resources or add your own. This helps us suggest appropriate activities.
        </p>
        <p className="text-sm text-gray-500 mt-1">(Optional - you can skip this step)</p>
      </div>

      <div className="space-y-4">
        {/* Selected materials */}
        {materials.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-green-50 rounded-lg"
          >
            <p className="text-sm font-medium text-green-800 mb-2">Selected materials:</p>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {materials.map((material) => (
                  <motion.div
                    key={material}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="
                      inline-flex items-center gap-1 px-3 py-1.5
                      bg-white text-green-700 rounded-full
                      border border-green-300 text-sm
                    "
                  >
                    {material}
                    <button
                      onClick={() => removeMaterial(material)}
                      className="ml-1 hover:text-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* Material categories */}
        <div className="space-y-3">
          {commonMaterials.map((category, categoryIndex) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: categoryIndex * 0.1 }}
              className="border border-gray-200 rounded-lg p-4"
            >
              <h3 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                <PackageIcon className="w-4 h-4 text-gray-500" />
                {category.category}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {category.items.map((item) => (
                  <button
                    key={item}
                    onClick={() => addMaterial(item)}
                    disabled={materials.includes(item)}
                    className={`
                      text-left px-3 py-2 rounded-md text-sm transition-all duration-200
                      ${materials.includes(item)
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 hover:border-blue-200'
                      }
                      border border-gray-200
                    `}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Custom material input */}
        <div className="border-t pt-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700 mb-2 block">
              Add custom materials
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={customMaterial}
                onChange={(e) => setCustomMaterial(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCustomAdd()}
                placeholder="e.g., VR headsets, Garden space"
                className="
                  flex-1 px-4 py-2 rounded-lg border-2
                  border-gray-200 focus:border-blue-500
                  focus:outline-none focus:ring-2 focus:ring-blue-500/20
                  transition-all duration-200
                "
              />
              <button
                onClick={handleCustomAdd}
                disabled={!customMaterial.trim()}
                className="
                  px-4 py-2 rounded-lg bg-blue-600 text-white
                  hover:bg-blue-700 disabled:bg-gray-300
                  disabled:cursor-not-allowed transition-all duration-200
                  flex items-center gap-2
                "
              >
                <PlusIcon className="w-4 h-4" />
                Add
              </button>
            </div>
          </label>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => updateField('materials', '')}
          className="
            w-full py-3 rounded-lg border-2 border-dashed
            border-gray-300 text-gray-600 hover:border-gray-400
            hover:text-gray-700 transition-all duration-200
          "
        >
          Skip this step
        </motion.button>
      </div>
    </div>
  );
}