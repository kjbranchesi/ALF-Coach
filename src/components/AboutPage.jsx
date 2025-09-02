// src/components/AboutPage.jsx

import React from 'react';
import { ArrowLeft, Sparkles, Users, Globe, Star, Target, FlaskConical, GraduationCap } from 'lucide-react';
import { Button } from '../design-system/components/Button';
import { Icon } from '../design-system/components/Icon';
import { Card, CardContent } from './ui/Card';
import AlfLogo from './ui/AlfLogo';
import '../styles/alf-design-system.css';

export default function AboutPage({ onBack }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm shadow-sm z-50">
        <div className="alf-container flex justify-between items-center py-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <AlfLogo size="lg" />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6">
        <div className="alf-container max-w-4xl">
          <div className="text-center mb-12 alf-animate-fade-in">
            <h1 className="alf-display mb-6">About the Active Learning Framework</h1>
            <p className="alf-body-large text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              The Active Learning Framework (ALF) represents two decades of research in cognitive science, 
              pedagogy, and real-world classroom application. It's more than a methodology—it's a 
              transformation in how we think about education.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 px-6 bg-white dark:bg-gray-900">
        <div className="alf-container max-w-4xl">
          <Card className="mb-8 shadow-lg">
            <CardContent className="p-8">
              <h2 className="alf-heading-2 mb-6">Our Story</h2>
              <p className="alf-body mb-4">
                ALF began in 2003 when a group of educators noticed a troubling pattern: students who could 
                memorize facts for tests couldn't apply that knowledge in real situations. Traditional teaching 
                methods were creating a gap between knowing and doing.
              </p>
              <p className="alf-body mb-4">
                Through years of classroom research, iteration, and collaboration with cognitive scientists, 
                the Active Learning Framework emerged. It's built on a simple but powerful premise: students 
                learn best when they're actively constructing knowledge, not passively receiving it.
              </p>
              <p className="alf-body">
                Today, Alf brings this framework to educators everywhere, making it easy to create 
                transformative learning experiences that prepare students for a complex, interconnected world.
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h3 className="alf-heading-3 mb-4">The Research Foundation</h3>
                <p className="alf-body mb-3">
                  ALF is grounded in extensive research including:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Icon name="success" size="sm" className="text-green-500 mt-0.5" />
                    <span className="alf-body">Constructivist learning theory (Piaget, Vygotsky)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="success" size="sm" className="text-green-500 mt-0.5" />
                    <span className="alf-body">Problem-based learning effectiveness studies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="success" size="sm" className="text-green-500 mt-0.5" />
                    <span className="alf-body">21st-century skills development research</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="success" size="sm" className="text-green-500 mt-0.5" />
                    <span className="alf-body">Cognitive load theory applications</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardContent className="p-6">
                <h3 className="alf-heading-3 mb-4">Proven Outcomes</h3>
                <p className="alf-body mb-3">
                  Schools using ALF report:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <Icon name="success" size="sm" className="text-green-500 mt-0.5" />
                    <span className="alf-body">40% higher knowledge retention rates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="success" size="sm" className="text-green-500 mt-0.5" />
                    <span className="alf-body">65% improvement in critical thinking assessments</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="success" size="sm" className="text-green-500 mt-0.5" />
                    <span className="alf-body">80% of students report increased engagement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Icon name="success" size="sm" className="text-green-500 mt-0.5" />
                    <span className="alf-body">Significant gains in collaboration skills</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700">
        <div className="alf-container max-w-4xl">
          <h2 className="alf-heading-2 text-center mb-12">The ALF Philosophy</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-700 rounded-xl flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-300" />
              </div>
              <h3 className="font-semibold text-lg mb-3">Learning is Natural</h3>
              <p className="alf-body">
                Humans are born curious. ALF channels this natural drive to explore, question, and discover 
                into structured learning experiences.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-700 rounded-xl flex items-center justify-center">
                <Users className="w-8 h-8 text-blue-600 dark:text-blue-300" />
              </div>
              <h3 className="font-semibold text-lg mb-3">Knowledge is Constructed</h3>
              <p className="alf-body">
                Students don't receive knowledge—they build it through experience, reflection, and 
                collaboration with peers and mentors.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-800 dark:to-blue-700 rounded-xl flex items-center justify-center">
                <Globe className="w-8 h-8 text-blue-600 dark:text-blue-300" />
              </div>
              <h3 className="font-semibold text-lg mb-3">Context Matters</h3>
              <p className="alf-body">
                Real learning happens when students see how knowledge connects to their lives, communities, 
                and the wider world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-6 bg-white dark:bg-gray-900">
        <div className="alf-container max-w-4xl">
          <h2 className="alf-heading-2 text-center mb-12">The People Behind ALF</h2>
          <Card className="shadow-lg">
            <CardContent className="p-8">
              <p className="alf-body-large text-center mb-8">
                Alf is developed by a passionate team of educators, learning scientists, and technologists 
                united by a single mission: to make transformative teaching accessible to every educator.
              </p>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="alf-heading-3 mb-4">Advisory Board</h3>
                  <p className="alf-body">
                    Our advisory board includes award-winning teachers, curriculum designers, cognitive scientists, 
                    and education policy experts from leading institutions worldwide.
                  </p>
                </div>
                <div>
                  <h3 className="alf-heading-3 mb-4">Community Contributors</h3>
                  <p className="alf-body">
                    Over 500 educators have contributed insights, tested frameworks, and shared success stories 
                    that continuously improve the ALF experience.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-800 dark:to-gray-700">
        <div className="alf-container max-w-4xl">
          <h2 className="alf-heading-2 text-center mb-12">Our Core Values</h2>
          <div className="space-y-6">
            <Card className="flex items-start gap-4 shadow-lg">
              <CardContent className="p-6 flex items-start gap-4">
                <Star className="w-8 h-8 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Empowerment Over Replacement</h3>
                  <p className="alf-body">
                    Technology should amplify teacher expertise, not replace it. Alf enhances your 
                    pedagogical skills while saving time on planning.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="flex items-start gap-4 shadow-lg">
              <CardContent className="p-6 flex items-start gap-4">
                <Target className="w-8 h-8 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Equity in Education</h3>
                  <p className="alf-body">
                    Every student deserves engaging, meaningful learning experiences. ALF helps create 
                    inclusive projects that honor diverse perspectives and learning styles.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="flex items-start gap-4 shadow-lg">
              <CardContent className="p-6 flex items-start gap-4">
                <FlaskConical className="w-8 h-8 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Evidence-Based Practice</h3>
                  <p className="alf-body">
                    All recommendations are grounded in peer-reviewed research and validated through 
                    real classroom implementation.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="flex items-start gap-4 shadow-lg">
              <CardContent className="p-6 flex items-start gap-4">
                <GraduationCap className="w-8 h-8 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Continuous Improvement</h3>
                  <p className="alf-body">
                    Education evolves, and so do we. Alf regularly updates based on educator 
                    feedback and emerging research.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900 text-white">
        <div className="alf-container text-center">
          <h2 className="text-3xl font-bold mb-4">Join the Active Learning Movement</h2>
          <p className="text-xl mb-8 opacity-90">
            Transform your classroom. Empower your students. Change the future.
          </p>
          <Button
            onClick={onBack}
            className="bg-white dark:bg-gray-200 text-blue-600 dark:text-blue-700 hover:bg-gray-100 dark:hover:bg-gray-300 px-8 py-4 text-lg font-semibold"
            size="lg"
          >
            Get Started with Alf
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-900 dark:bg-gray-950 text-gray-400 dark:text-gray-500">
        <div className="alf-container text-center">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Alf. Empowering educators worldwide.
          </p>
        </div>
      </footer>
    </div>
  );
}