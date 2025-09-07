import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Star, Clock, Users, Target, BookOpen, 
  FileText, Award, Lightbulb, Map, CheckCircle, 
  Layers, Rocket, Eye, Download, Share2, Heart,
  ArrowRight, Sparkles, Grid3x3, Brain, Compass,
  GraduationCap, BarChart3, MessageSquare, Shield
} from 'lucide-react';
import { getAllSampleBlueprints } from '../utils/sampleBlueprints';
import { auth } from '../firebase/firebase';

// Navigation sidebar for long content
const NavigationSidebar = ({ sections, activeSection }: { sections: string[], activeSection: string }) => {
  return (
    <div className="hidden lg:block fixed left-8 top-1/2 -translate-y-1/2 z-20">
      <nav className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/50 p-4 shadow-xl">
        <ul className="space-y-2">
          {sections.map((section) => (
            <li key={section}>
              <a
                href={`#${section.toLowerCase().replace(/\s+/g, '-')}`}
                className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                  activeSection === section
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {section}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

// Section component with glass morphism
const Section = ({ id, title, icon: Icon, children, className = '' }: any) => {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`relative mb-12 ${className}`}
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-3xl blur-2xl"></div>
      <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/50 p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
            <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{title}</h2>
        </div>
        {children}
      </div>
    </motion.section>
  );
};

// Phase card component
const PhaseCard = ({ phase, index }: any) => {
  const phaseIcons = [Brain, Compass, Rocket, Star];
  const Icon = phaseIcons[index % phaseIcons.length];
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="relative group"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition duration-500"></div>
      <div className="relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition-all duration-300">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30">
            <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{phase.name}</h3>
              <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                {phase.duration}
              </span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mb-3">{phase.description}</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-slate-700 dark:text-slate-300">{phase.goal}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-slate-700 dark:text-slate-300">{phase.output}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Standards badge component
const StandardsBadge = ({ family, items }: any) => {
  const familyColors: any = {
    'NGSS': 'from-emerald-500 to-teal-500',
    'Common Core Math': 'from-blue-500 to-indigo-500',
    'Common Core ELA': 'from-purple-500 to-pink-500',
    'C3 Framework': 'from-amber-500 to-orange-500',
    'ISTE': 'from-cyan-500 to-blue-500',
    'CASEL': 'from-rose-500 to-pink-500'
  };
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-gradient-to-r ${familyColors[family] || 'from-slate-500 to-slate-600'} text-white text-sm font-medium mb-3`}>
        <Shield className="w-4 h-4" />
        {family}
      </div>
      <div className="space-y-2">
        {items.map((item: any, i: number) => (
          <div key={i} className="text-sm">
            <span className="font-medium text-slate-700 dark:text-slate-300">{item.code}:</span>
            <span className="text-slate-600 dark:text-slate-400 ml-2">{item.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function HeroProjectShowcase() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('Overview');
  
  // Get the sample data
  const uid = auth.currentUser?.isAnonymous ? 'anonymous' : (auth.currentUser?.uid || 'anonymous');
  const sample = getAllSampleBlueprints(uid).find((s) => s.id === id);
  
  // Sections for navigation
  const sections = [
    'Overview',
    'Big Idea',
    'Standards',
    'Journey',
    'Milestones',
    'Assessment',
    'Resources',
    'Impact'
  ];
  
  // Handle scroll to update active section
  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = sections.map(s => 
        document.getElementById(s.toLowerCase().replace(/\s+/g, '-'))
      );
      
      const scrollPosition = window.scrollY + 200;
      
      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const section = sectionElements[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  if (!sample) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-blue-900/10 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Sparkles className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">Project not found</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">The project you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/app/samples')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Gallery
          </button>
        </motion.div>
      </div>
    );
  }
  
  const { wizardData, ideation, journey, deliverables } = sample;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-blue-900/10">
      {/* Navigation Sidebar */}
      <NavigationSidebar sections={sections} activeSection={activeSection} />
      
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-purple-600/5 to-transparent h-96"></div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Navigation */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => navigate('/app/samples')}
              className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Gallery
            </button>
          </motion.div>
          
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-6">
              <Star className="w-4 h-4 fill-current" />
              Complete Hero Project
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4 leading-tight">
              {wizardData?.projectTopic}
            </h1>
            
            <div className="flex items-center justify-center gap-4 text-slate-600 dark:text-slate-400">
              <span className="inline-flex items-center gap-2">
                <Users className="w-4 h-4" />
                {wizardData?.gradeLevel === 'high' ? 'Grades 9-12' : wizardData?.gradeLevel}
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {wizardData?.duration === 'long' ? '8-12 weeks' : wizardData?.duration}
              </span>
              <span>•</span>
              <span>{wizardData?.subjects?.join(', ') || wizardData?.subject}</span>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Overview Section */}
        <Section id="overview" title="Project Overview" icon={Eye}>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Essential Question</h3>
                <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                  {ideation?.essentialQuestion}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Learning Goals</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {wizardData?.learningGoals}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Challenge</h3>
                <p className="text-slate-700 dark:text-slate-300">
                  {ideation?.challenge}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Materials Needed</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {wizardData?.materials}
                </p>
              </div>
            </div>
          </div>
        </Section>
        
        {/* Big Idea Section */}
        <Section id="big-idea" title="The Big Idea" icon={Lightbulb}>
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6">
            <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
              {ideation?.bigIdea}
            </p>
          </div>
          
          {ideation?.studentVoice && (
            <div className="mt-6 grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-slate-900 dark:text-white mb-3">Driving Questions</h3>
                <ul className="space-y-2">
                  {ideation.studentVoice.drivingQuestions?.map((q: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                      <span className="text-slate-600 dark:text-slate-400">{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-slate-900 dark:text-white mb-3">Student Choice Points</h3>
                <ul className="space-y-2">
                  {ideation.studentVoice.choicePoints?.map((c: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <Compass className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-1 flex-shrink-0" />
                      <span className="text-slate-600 dark:text-slate-400">{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </Section>
        
        {/* Standards Alignment Section */}
        {sample.id === 'hero-sustainability-campaign' && (
          <Section id="standards" title="Standards Alignment" icon={Shield}>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <StandardsBadge 
                family="NGSS"
                items={[
                  { code: 'HS-ESS3-4', description: 'Evaluate solutions to reduce human impact' },
                  { code: 'HS-ETS1-3', description: 'Evaluate solution priorities and trade-offs' }
                ]}
              />
              <StandardsBadge 
                family="Common Core Math"
                items={[
                  { code: 'HSS.IC.B.6', description: 'Evaluate reports based on data' },
                  { code: 'HSA.CED.A.3', description: 'Represent constraints and interpret solutions' }
                ]}
              />
              <StandardsBadge 
                family="Common Core ELA"
                items={[
                  { code: 'RST.9-10.7', description: 'Translate quantitative information' },
                  { code: 'W.9-10.1', description: 'Write arguments with valid reasoning' }
                ]}
              />
              <StandardsBadge 
                family="C3 Framework"
                items={[
                  { code: 'D2.Eco.1.9-12', description: 'Analyze economic decisions' },
                  { code: 'D4.7.9-12', description: 'Assess options for action' }
                ]}
              />
              <StandardsBadge 
                family="ISTE"
                items={[
                  { code: '1.5', description: 'Computational Thinker' },
                  { code: '1.6', description: 'Creative Communicator' }
                ]}
              />
              <StandardsBadge 
                family="CASEL"
                items={[
                  { code: 'SEL 4', description: 'Relationship Skills' },
                  { code: 'SEL 5', description: 'Responsible Decision-Making' }
                ]}
              />
            </div>
          </Section>
        )}
        
        {/* Learning Journey Section */}
        <Section id="journey" title="Learning Journey" icon={Map}>
          <div className="space-y-4">
            {journey?.phases?.map((phase: any, i: number) => (
              <PhaseCard key={phase.id} phase={phase} index={i} />
            ))}
          </div>
          
          {journey?.resources && journey.resources.length > 0 && (
            <div className="mt-8">
              <h3 className="font-medium text-slate-900 dark:text-white mb-4">Key Resources</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {journey.resources.map((resource: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                    <FileText className="w-4 h-4 text-slate-500" />
                    <div>
                      <div className="font-medium text-slate-700 dark:text-slate-300">{resource.name}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-500">{resource.type}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Section>
        
        {/* Milestones Section */}
        <Section id="milestones" title="Key Milestones" icon={CheckCircle}>
          <div className="grid md:grid-cols-2 gap-4">
            {deliverables?.milestones?.map((milestone: any, i: number) => (
              <motion.div
                key={milestone.id || i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700"
              >
                <div className="p-2 rounded-lg bg-white dark:bg-slate-600">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-900 dark:text-white">{milestone.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{milestone.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Section>
        
        {/* Assessment Section */}
        <Section id="assessment" title="Assessment Rubric" icon={Award}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Criterion</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Description</th>
                  <th className="text-center py-3 px-4 font-medium text-slate-900 dark:text-white">Weight</th>
                </tr>
              </thead>
              <tbody>
                {deliverables?.rubric?.criteria?.map((criterion: any, i: number) => (
                  <tr key={criterion.id || i} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                      {criterion.name}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {criterion.description}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-700 dark:text-slate-300">
                      20%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>
        
        {/* Resources Section */}
        {journey?.resources && journey.resources.length > 0 && (
          <Section id="resources" title="Resources & Materials" icon={Grid3x3}>
            <div className="grid md:grid-cols-3 gap-4">
              {journey.resources.map((resource: any, i: number) => (
                <div key={i} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-medium text-slate-900 dark:text-white">{resource.name}</h3>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{resource.type}</p>
                </div>
              ))}
            </div>
          </Section>
        )}
        
        {/* Authentic Impact Section */}
        <Section id="impact" title="Authentic Impact" icon={Rocket}>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
              <h3 className="font-medium text-slate-900 dark:text-white mb-2">Audience</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {deliverables?.impact?.audience || 'School Board, City Council, Community Members'}
              </p>
            </div>
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
              <Share2 className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
              <h3 className="font-medium text-slate-900 dark:text-white mb-2">Method</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {deliverables?.impact?.method || 'Policy presentations, media coverage, community forums'}
              </p>
            </div>
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20">
              <BarChart3 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
              <h3 className="font-medium text-slate-900 dark:text-white mb-2">Measures</h3>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {deliverables?.impact?.measures?.map((measure: string, i: number) => (
                  <div key={i}>{measure}</div>
                )) || (
                  <>
                    <div>Environmental impact reduction</div>
                    <div>Policy adoption rate</div>
                    <div>Community engagement</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </Section>
        
        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Ready to implement this project in your classroom?
          </p>
          <div className="flex items-center justify-center gap-4">
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl">
              <Download className="w-5 h-5" />
              Export Full Blueprint
            </button>
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-colors">
              <Heart className="w-5 h-5" />
              Save to Library
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}