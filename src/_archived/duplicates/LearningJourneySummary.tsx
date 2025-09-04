/**
 * Archived copy of LearningJourneySummary.tsx (unused variant)
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle, 
  Download, 
  Share2, 
  Calendar, 
  Users, 
  Target, 
  Lightbulb,
  ArrowRight,
  BookOpen,
  Clock,
  Wrench,
  Sparkles
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface LearningJourneySummaryProps {
  journeyData: {
    ideation: { bigIdea: string; essentialQuestion: string; challenge: string };
    journey: { progression: string; activities: string; resources: string };
    wizard: { subject: string; students: { gradeLevel: string; count: number }; timeframe: string };
  };
  onExport?: () => void;
  onShare?: () => void;
  onEditSection?: (section: string) => void;
}

export const LearningJourneySummary: React.FC<LearningJourneySummaryProps> = ({
  journeyData,
  onExport,
  onShare, 
  onEditSection
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'implementation' | 'materials'>('overview');
  const formatTimeEstimate = (p: string) => (p.toLowerCase().match(/(\d+)[-\s]*week/g)?.length ? `${p.toLowerCase().match(/(\d+)[-\s]*week/g)!.length} weeks` : 'Flexible timing');
  const parseProgression = (txt: string) => txt.split(/→|->|\d+[.:]|\n/).map(s => s.trim()).filter(Boolean);
  const parseActivities = (txt: string) => txt.split(/[,;]|\n/).map(s => s.trim()).filter(Boolean);
  const parseResources = (txt: string) => {
    const list = txt.split(/[,;]|\n/).map(s => s.trim()).filter(Boolean);
    return {
      materials: list.filter(r => /material|supplies|tool|equipment/i.test(r)),
      people: list.filter(r => /speaker|expert|volunteer|mentor|partner/i.test(r)),
      technology: list.filter(r => /software|app|platform|digital|online|computer/i.test(r)),
      other: list.filter(r => !/material|supplies|tool|equipment|speaker|expert|volunteer|mentor|partner|software|app|platform|digital|online|computer/i.test(r))
    };
  };

  const stages = parseProgression(journeyData.journey.progression);
  const activities = parseActivities(journeyData.journey.activities);
  const resources = parseResources(journeyData.journey.resources);

  return (
    <div className="learning-journey-summary max-w-5xl mx-auto p-6">
      <div className="text-center mb-8 glass-squircle card-pad-lg anim-ease border border-green-200 dark:border-green-700">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-12 h-12 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold">Your Learning Journey is Complete!</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          You’ve created a comprehensive, student-centered learning experience.
        </p>
      </div>
      {/* Content omitted for brevity in archive */}
      <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button onClick={onExport} variant="primary" className="flex items-center gap-2"><Download className="w-4 h-4" />Export</Button>
        <Button onClick={onShare} variant="secondary" className="flex items-center gap-2"><Share2 className="w-4 h-4" />Share</Button>
      </div>
    </div>
  );
};

export default LearningJourneySummary;
