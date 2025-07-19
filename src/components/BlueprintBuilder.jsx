// src/components/BlueprintBuilder.jsx - Enhanced with Project Blueprint Summary

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppContext } from '../context/AppContext';
import { Button } from './ui/Button';
import { Input, Textarea } from './ui/Input';
import { Card, CardContent } from './ui/Card';
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';

// --- Zod Schema for Validation ---
const blueprintSchema = z.object({
    educatorPerspective: z.string().min(1, { message: "Your perspective is required." }),
    subject: z.string().min(1, { message: "The subject is required." }),
    initialMaterials: z.string().optional(),
    ageGroup: z.string().min(1, { message: "Please describe your learners." }),
    location: z.string().optional(),
    projectScope: z.string(),
    // Add ideation fields with default empty strings for backward compatibility
    ideation: z.object({
        bigIdea: z.string().default(""),
        essentialQuestion: z.string().default(""),
        challenge: z.string().default("")
    }).default({
        bigIdea: "",
        essentialQuestion: "",
        challenge: ""
    })
});

// --- Icon Components ---
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-purple-700"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>;
const LightbulbIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-purple-700"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-purple-700"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const AlertCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;

// --- Reusable StepInfoCard ---
const StepInfoCard = ({ icon, title, subtitle, children }) => (
    <div className="bg-slate-50 border-l-4 border-purple-500 p-6 rounded-lg shadow-sm">
        <div className="flex items-start gap-4">
            <div className="flex-shrink-0 bg-purple-100 p-3 rounded-full">{icon}</div>
            <div className="w-full">
                <h3 className="text-lg font-bold text-slate-800">{title}</h3>
                <p className="text-sm text-slate-600 mb-4">{subtitle}</p>
                {children}
            </div>
        </div>
    </div>
);

// --- Step Indicator Component ---
const StepIndicator = ({ currentStep }) => {
    const steps = ["Perspective", "Topic", "Audience", "Scope"];
    return (
        <div className="flex items-center justify-center mb-12">
            {steps.map((step, index) => (
                <React.Fragment key={index}>
                    <div className="flex flex-col items-center text-center">
                        <div className={clsx(`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all duration-300`, {
                            'bg-green-500 border-green-500 text-white': currentStep > index + 1,
                            'bg-white border-purple-600 text-purple-600 ring-4 ring-purple-100': currentStep === index + 1,
                            'bg-slate-100 border-slate-300 text-slate-400': currentStep < index + 1
                        })}>
                            {currentStep > index + 1 ? <CheckCircleIcon /> : index + 1}
                        </div>
                        <p className={clsx(`mt-2 text-sm font-semibold w-24 transition-all duration-300`, {
                            'text-slate-700': currentStep >= index + 1,
                            'text-slate-500': currentStep < index + 1,
                            'text-purple-700': currentStep === index + 1
                        })}>{step}</p>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={clsx(`flex-auto h-1 mx-4 transition-all duration-500`, {
                            'bg-green-500': currentStep > index + 1,
                            'bg-slate-300': currentStep <= index + 1
                        })}></div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

// --- Main Component ---
export default function BlueprintBuilder({ onCancel }) {
    const { createNewBlueprint } = useAppContext();
    const [step, setStep] = useState(1);

    const {
        register,
        handleSubmit,
        trigger,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(blueprintSchema),
        defaultValues: {
            educatorPerspective: '',
            subject: '',
            initialMaterials: '',
            ageGroup: 'Ages 11-14',
            projectScope: 'A Full Course/Studio',
        },
    });

    const handleNextStep = async () => {
        const fieldsToValidate = step === 1 ? ['educatorPerspective'] : step === 2 ? ['subject'] : step === 3 ? ['ageGroup'] : [];
        const isValid = await trigger(fieldsToValidate);
        if (isValid && step < 4) setStep(s => s + 1);
    };

    const onSubmit = (data) => createNewBlueprint(data);

    useEffect(() => {
        const handleEsc = (event) => {
            if (event.keyCode === 27) onCancel();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onCancel]);

    const FormError = ({ message }) => message ? (
        <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
            <AlertCircleIcon />
            <span>{message}</span>
        </div>
    ) : null;
    
    const motionVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-100 overflow-y-auto">
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <Card as="form" onSubmit={handleSubmit(onSubmit)} className="w-full max-w-2xl overflow-hidden">
                    <CardContent className="p-8 md:p-12">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-slate-800 mb-2">The Educator's Notebook</h2>
                            <p className="text-slate-600 max-w-lg mx-auto">Let's start by capturing your vision. This is the foundation of our collaboration.</p>
                        </div>
                        <StepIndicator currentStep={step} />

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                variants={motionVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                            >
                                {step === 1 && (
                                    <StepInfoCard icon={<EditIcon />} title="What's your motivation or initial thought?" subtitle="This helps us understand your vision. Think of it as a journal entry.">
                                        <Textarea
                                            {...register('educatorPerspective')}
                                            id="educator-perspective"
                                            variant={errors.educatorPerspective ? 'error' : 'default'}
                                            className="h-36"
                                            placeholder="e.g., 'I've always been fascinated by how cities evolve...' or 'My students are struggling to see the relevance of history...'"
                                            autoFocus
                                            dir="ltr"
                                        />
                                        <FormError message={errors.educatorPerspective?.message} />
                                    </StepInfoCard>
                                )}

                                {step === 2 && (
                                     <div className="space-y-6">
                                        <StepInfoCard icon={<LightbulbIcon />} title="What is the core subject or topic?" subtitle="This will be the title of our blueprint.">
                                            <Input
                                                {...register('subject')}
                                                type="text"
                                                id="subject-area"
                                                variant={errors.subject ? 'error' : 'default'}
                                                placeholder="e.g., Urban Planning, The Cold War, Marine Biology"
                                                autoFocus
                                            />
                                            <FormError message={errors.subject?.message} />
                                        </StepInfoCard>
                                        <StepInfoCard icon={<LightbulbIcon />} title="Any initial ideas on materials or resources?" subtitle="Optional: list any articles, books, or videos you're already thinking of.">
                                            <Textarea
                                                {...register('initialMaterials')}
                                                id="initial-materials"
                                                className="h-24"
                                                placeholder="e.g., 'The first chapter of 'The Death and Life of Great American Cities' by Jane Jacobs...'"
                                                dir="ltr"
                                            />
                                        </StepInfoCard>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="space-y-6">
                                        <StepInfoCard icon={<UsersIcon />} title="Who is this project for?" subtitle="Describe your learners in your own words.">
                                            <Input
                                                {...register('ageGroup')}
                                                type="text"
                                                id="age-group"
                                                variant={errors.ageGroup ? 'error' : 'default'}
                                                placeholder="e.g., second grade, 17 year olds, high school seniors, mixed ages 14-16"
                                                autoFocus
                                            />
                                            <div className="mt-2 text-xs text-slate-500">
                                                Use whatever phrasing feels natural to you - grade levels, ages, or descriptive terms
                                            </div>
                                            <FormError message={errors.ageGroup?.message} />
                                        </StepInfoCard>
                                        <StepInfoCard icon={<UsersIcon />} title="Where are you teaching? (optional)" subtitle="This helps us suggest local connections and examples.">
                                            <Input
                                                {...register('location')}
                                                type="text"
                                                id="location"
                                                placeholder="e.g., Chicago, rural Vermont, international school in Bangkok"
                                            />
                                            <div className="mt-2 text-xs text-slate-500">
                                                City, region, or just a general description
                                            </div>
                                        </StepInfoCard>
                                    </div>
                                )}
                                
                                {step === 4 && (
                                    <StepInfoCard icon={<UsersIcon />} title="Define The Scope" subtitle="Select the scale of your project.">
                                        <select {...register('projectScope')} id="project-scope" className="w-full px-3 py-3 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white">
                                            <option>A Full Course/Studio</option>
                                            <option>A Single Project/Assignment</option>
                                        </select>
                                    </StepInfoCard>
                                )}
                            </motion.div>
                        </AnimatePresence>
                        
                        <div className="mt-10 pt-6 border-t flex justify-between items-center">
                            <div>
                                <Button type="button" variant="ghost" size="sm" className={step === 1 ? 'invisible' : ''} onClick={() => setStep(s => s - 1)}>
                                    &larr; Back
                                </Button>
                            </div>
                            <div className="flex gap-3">
                                <Button type="button" variant="cancel" size="sm" onClick={onCancel}>
                                    Cancel
                                </Button>
                                {step < 4 && (
                                    <Button type="button" variant="primary" size="sm" onClick={handleNextStep}>
                                        Next &rarr;
                                    </Button>
                                )}
                                {step === 4 && (
                                    <Button type="submit" variant="secondary" size="sm">
                                        <CheckCircleIcon />
                                        <span className="ml-2">Create Blueprint</span>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
