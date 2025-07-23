import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IdeaCard } from './IdeaCard';

interface Idea {
  id: string;
  title: string;
  description: string;
  icon?: 'sparkles' | 'lightbulb' | 'beaker';
}

interface IdeaCardsDisplayProps {
  ideas: Idea[];
  onSelectIdea: (idea: Idea) => void;
  title?: string;
}

export const IdeaCardsDisplay: React.FC<IdeaCardsDisplayProps> = ({ 
  ideas, 
  onSelectIdea,
  title = "Here are some ideas to explore:"
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      )}
      <div className="grid gap-3">
        <AnimatePresence>
          {ideas.map((idea, index) => (
            <motion.div
              key={idea.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <IdeaCard
                title={idea.title}
                description={idea.description}
                icon={idea.icon}
                variant={index % 2 === 0 ? 'primary' : 'secondary'}
                onSelect={() => onSelectIdea(idea)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};