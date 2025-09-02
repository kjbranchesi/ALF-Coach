/**
 * ResearchBacking.tsx - Educational research foundation for ALF Coach
 * Displays peer-reviewed research supporting project-based learning methodology
 */

import React, { useState } from 'react';

interface ResearchSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: string;
  citations: string[];
  keyFindings: string[];
}

const BookOpenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
  </svg>
);

const BrainIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"></path>
    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"></path>
  </svg>
);

const ChartBarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="10"></line>
    <line x1="18" y1="20" x2="18" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="16"></line>
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const TargetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <circle cx="12" cy="12" r="6"></circle>
    <circle cx="12" cy="12" r="2"></circle>
  </svg>
);

const LightbulbIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18h6"></path>
    <path d="M10 22h4"></path>
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.05 1.5 3.5.76.76 1.23 1.52 1.41 2.5"></path>
    <line x1="12" y1="18" x2="12" y2="22"></line>
  </svg>
);

export const ResearchBacking: React.FC<{ variant?: 'full' | 'summary' }> = ({ variant = 'full' }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const researchSections: ResearchSection[] = [
    {
      id: 'future-ready',
      title: 'Preparing Students for an Evolving Future',
      icon: <TargetIcon />,
      content: `The World Economic Forum estimates that 65% of children entering primary school today will work in jobs that don't yet exist. This eye-opening statistic underscores the critical need for educational approaches that cultivate adaptability, creativity, and problem-solving skills. Project-Based Learning (PBL) has emerged as a vital strategy to meet this need, engaging students in real-world projects that develop both deep content understanding and essential 21st-century skills.`,
      citations: [
        'World Economic Forum. (2020). The Future of Jobs Report 2020.',
        'Partnership for 21st Century Learning. (2019). Framework for 21st Century Learning.'
      ],
      keyFindings: [
        '65% of today\'s students will work in jobs that don\'t exist yet',
        'PBL develops adaptability and problem-solving skills essential for future careers',
        'Real-world projects prepare students for workplace challenges'
      ]
    },
    {
      id: 'academic-outcomes',
      title: 'Proven Academic Achievement Gains',
      icon: <ChartBarIcon />,
      content: `A comprehensive 2023 meta-analysis of 66 studies found that students in PBL classrooms consistently outperformed those in traditional classrooms. Elementary students taught science via PBL scored 8 percentage points higher on standardized tests, with benefits seen across all socioeconomic groups. In Advanced Placement courses, PBL students outperformed traditional classes by 8-10 percentage points, debunking the myth that only certain students can succeed with PBL.`,
      citations: [
        'Chen, C. H., & Yang, Y. C. (2023). Revisiting the effects of project-based learning on students\' academic achievement: A meta-analysis. Educational Research Review, 38.',
        'Krajcik, J., et al. (2023). Project-based learning in elementary science. Journal of Research in Science Teaching.',
        'Parker, W. C., et al. (2021). Effects of PBL in high school Advanced Placement courses. American Educational Research Journal.'
      ],
      keyFindings: [
        '8-10 percentage point improvement in test scores',
        'Benefits across all socioeconomic and ability groups',
        'Improved retention and transfer of knowledge'
      ]
    },
    {
      id: 'engagement',
      title: 'Enhanced Student Engagement and Motivation',
      icon: <BrainIcon />,
      content: `Research shows PBL significantly increases student engagement and motivation, particularly in STEM fields. By connecting academic content to authentic, real-world problems, PBL gives learning greater purpose. A study of 2,371 third-graders found that students of all backgrounds showed improved science learning through PBL, with both struggling and advanced readers outperforming their counterparts in traditional classrooms.`,
      citations: [
        'Duke, N. K., et al. (2021). Project-based inquiry science. Elementary School Journal, 121(3).',
        'Condliffe, B., et al. (2017). Project-based learning: A literature review. MDRC.',
        'Thomas, J. W. (2000). A review of research on project-based learning. Autodesk Foundation.'
      ],
      keyFindings: [
        'Increased intrinsic motivation and engagement',
        'All students benefit - "all boats rise with the tide"',
        'Greater persistence through challenges'
      ]
    },
    {
      id: 'essential-skills',
      title: 'Development of Hard and Soft Skills',
      icon: <UsersIcon />,
      content: `PBL uniquely integrates both technical "hard" skills and crucial "soft" skills. Students develop technical competencies in their subject area while simultaneously building collaboration, communication, critical thinking, and creativity. Research in engineering education found that problem-driven projects improved teamwork, responsibility, and technical proficiency while increasing motivation for learning.`,
      citations: [
        'Vogler, J. S., et al. (2018). The hard work of soft skills: PBL and 21st century competencies. Journal of Educational Psychology.',
        'Pellegrino, J. W., & Hilton, M. L. (Eds.). (2012). Education for life and work. National Academies Press.',
        'Larmer, J., Mergendoller, J., & Boss, S. (2015). Setting the standard for project based learning. ASCD.'
      ],
      keyFindings: [
        'Simultaneous development of technical and interpersonal skills',
        'Improved collaboration and communication abilities',
        'Enhanced critical thinking and creativity'
      ]
    },
    {
      id: 'implementation',
      title: 'Gold Standard PBL Implementation',
      icon: <BookOpenIcon />,
      content: `The Buck Institute for Education (PBLWorks) has identified key elements of high-quality PBL: alignment with standards, compelling driving questions, collaborative classroom culture, structured timeline management, appropriate scaffolding, and continuous assessment. When teachers implement these best practices, PBL fulfills its promise of engaged learners and high-quality outcomes.`,
      citations: [
        'Larmer, J., & Mergendoller, J. R. (2019). Gold Standard PBL: Essential project design elements. PBLWorks.',
        'Boss, S., & Krauss, J. (2022). Reinventing project-based learning (3rd ed.). ISTE.',
        'Markham, T. (2011). Project based learning design and coaching guide. HeartIQ Press.'
      ],
      keyFindings: [
        'Clear framework for effective PBL implementation',
        'Importance of standards alignment and scaffolding',
        'Continuous formative and summative assessment'
      ]
    },
    {
      id: 'higher-ed',
      title: 'PBL in Higher Education and Career Preparation',
      icon: <LightbulbIcon />,
      content: `PBL is equally powerful in higher education, with research showing "very large effect sizes" for improving college students' academic achievement. A 2025 study of industry-partnered PBL found 25% increases in job-related competencies, 30% jump in engagement, and 35% increase in satisfaction. Universities like Worcester Polytechnic Institute have built entire curricula around PBL, producing graduates with both deep knowledge and practical skills employers value.`,
      citations: [
        'Guo, P., et al. (2025). Industry-university collaborative PBL framework. Journal of Engineering Education.',
        'Hmelo-Silver, C. E. (2004). Problem-based learning: What and how do students learn? Educational Psychology Review.',
        'Worcester Polytechnic Institute. (2023). The WPI Plan: Project-based education.'
      ],
      keyFindings: [
        '25% increase in job-related competencies',
        '30% increase in student engagement',
        'Better preparation for real-world work'
      ]
    }
  ];

  if (variant === 'summary') {
    return (
      <div className="glass-squircle card-pad-lg anim-ease border border-blue-200 dark:border-blue-800">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Built on Proven Research
        </h3>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          ALF Coach is grounded in decades of educational research showing that project-based learning 
          significantly improves student outcomes across all demographics.
        </p>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="glass-squircle card-pad anim-ease border border-gray-200 dark:border-gray-700">
            <ChartBarIcon />
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mt-2">8-10% Higher Achievement</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Students using PBL consistently outperform traditional classrooms
            </p>
          </div>
          <div className="glass-squircle card-pad anim-ease border border-gray-200 dark:border-gray-700">
            <UsersIcon />
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mt-2">21st Century Skills</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Develops critical thinking, collaboration, and creativity
            </p>
          </div>
          <div className="glass-squircle card-pad anim-ease border border-gray-200 dark:border-gray-700">
            <TargetIcon />
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mt-2">Future Ready</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Prepares students for jobs that don't exist yet
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          The Research Behind ALF Coach
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300">
          Decades of peer-reviewed research demonstrate the transformative power of project-based learning
        </p>
      </div>

      {researchSections.map((section) => (
        <div 
          key={section.id}
          className="glass-squircle card-pad-lg anim-ease border border-gray-200 dark:border-gray-700 shadow-soft overflow-hidden"
        >
          <button
            onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="text-blue-600 dark:text-blue-400">
                {section.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 text-left">
                {section.title}
              </h3>
            </div>
            <svg 
              className={`w-5 h-5 text-gray-500 transition-transform ${
                expandedSection === section.id ? 'rotate-180' : ''
              }`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expandedSection === section.id && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {section.content}
              </p>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Key Findings:
                </h4>
                <ul className="space-y-1">
                  {section.keyFindings.map((finding, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                      <span>{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Research Citations:
                </h4>
                <ul className="space-y-1">
                  {section.citations.map((citation, index) => (
                    <li key={index} className="text-xs text-gray-500 dark:text-gray-500 italic">
                      {citation}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      ))}

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h3 className="text-xl font-bold mb-2">
          Why This Matters for Your Classroom
        </h3>
        <p className="text-blue-100">
          ALF Coach leverages this research to guide you through creating project-based learning 
          experiences that are proven to improve student outcomes. Every feature is designed based 
          on best practices identified in educational research, ensuring your students get the 
          full benefits of authentic, engaging learning.
        </p>
      </div>
    </div>
  );
};
