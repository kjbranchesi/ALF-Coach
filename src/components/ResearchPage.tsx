/**
 * ResearchPage.tsx - Dedicated page showcasing the educational research behind ALF Coach
 */

import React from 'react';
import { ResearchBacking } from './ResearchBacking';
import { ArrowLeft, Download, ExternalLink } from 'lucide-react';

interface ResearchPageProps {
  onBack?: () => void;
}

export const ResearchPage: React.FC<ResearchPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </button>
            )}
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Research Foundation
            </h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            The Science of Active Learning
          </h2>
          <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
            ALF Coach is built on a foundation of peer-reviewed educational research demonstrating 
            the effectiveness of project-based learning across all student demographics.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="#download-whitepaper"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Download Research Summary
            </a>
            <a
              href="#citations"
              className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              View All Citations
            </a>
          </div>
        </div>
      </section>

      {/* Main Research Content */}
      <section className="py-12 px-6">
        <ResearchBacking variant="full" />
      </section>

      {/* Additional Resources */}
      <section className="py-12 px-6 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Additional Resources
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                PBLWorks Gold Standard
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Learn about the essential elements of high-quality project-based learning from the Buck Institute.
              </p>
              <a
                href="https://www.pblworks.org/what-is-pbl"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                Visit PBLWorks
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Future of Jobs Report
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Explore the World Economic Forum's research on future workforce skills and education needs.
              </p>
              <a
                href="https://www.weforum.org/reports/the-future-of-jobs-report-2023"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                Read the Report
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Implementation Guide */}
      <section className="py-12 px-6 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            From Research to Practice
          </h3>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              ALF Coach translates research findings into practical tools that help you implement 
              evidence-based project-based learning in your classroom:
            </p>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Standards Alignment</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Every project is aligned with curriculum standards while maintaining authentic learning experiences.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Scaffolding & Support</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Built-in differentiation and UDL principles ensure all students can access and succeed in projects.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Assessment Design</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Authentic assessments measure both content knowledge and 21st-century skills development.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">4</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">Community Connections</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Real-world partnerships provide authentic audiences and contexts for student work.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-12 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">
            Ready to Transform Your Teaching?
          </h3>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of educators using research-based project design to improve student outcomes.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Get Started with ALF Coach
          </button>
        </div>
      </section>
    </div>
  );
};