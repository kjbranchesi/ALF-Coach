// src/components/BlueprintBuilder.jsx

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppContext } from '../context/AppContext';
import { Button } from './ui/Button';
import { Input, Textarea } from './ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, CircleUserRound, BookText, Telescope, Scale } from 'lucide-react';
import clsx from 'clsx';

// Zod schema for multi-step form validation
const blueprintSchema = z.object({
  educatorPerspective: z.string().min(20, { message: "Please share a bit more about your perspective (at least 20 characters)." }),
  subject: z.string().min(3, { message: "Subject must be at least 3 characters." }),
  initialMaterials: z.string().optional(),
  ageGroup: z.string(),
  projectScope: z.string(),
});

// --- Step Indicator Component ---
const StepIndicator = ({ currentStep, steps }) => (
    <nav aria-label="Progress">
        <ol role="list" className="flex items-center">
            {steps.map((step, stepIdx) => (
                <li key={step.name} className={clsx('relative', { 'pr-8 sm:pr-20': stepIdx !== steps.length - 1 })}>
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className={clsx('h-0.5 w-full', currentStep > stepIdx + 1 ? 'bg-primary-600' : 'bg-neutral-200')} />
                    </div>
                    <div className="relative flex h-9 w-9 items-center justify-center rounded-full">
                        {currentStep > stepIdx + 1 ? (
                            <div className="h-9 w-9 rounded-full bg-primary-600 flex items-center justify-center">
                                <Check className="h-5 w-5 text-white" aria-hidden="true" />
                            </div>
                        ) : currentStep === stepIdx + 1 ? (
                            <div className="h-9 w-9 rounded-full border-2 border-primary-600 bg-white flex items-center justify-center" aria-current="step">
                                <span className="text-primary-600">{`0${stepIdx + 1}`}</span>
                            </div>
                        ) : (
                            <div className="h-9 w-9 rounded-full border-2 border-neutral-300 bg-white flex items-center justify-center">
                               <span className="text-neutral-400">{`0${stepIdx + 1}`}</span>
                            </div>
                        )}
                    </div>
                    <p className="absolute -bottom-6 w-max -left-1/2 transform translate-x-1/2 text-xs font-medium text-neutral-600">{step.name}</p>
                </li>
            ))}
        </ol>
    </nav>
);

// --- Main BlueprintBuilder Component ---
export default function BlueprintBuilder({ onCancel }) {
    const { createNewBlueprint } = useAppContext();
    const [step, setStep] = useState(1);

    const { register, handleSubmit, trigger, formState: { errors } } = useForm({
        resolver: zodResolver(blueprintSchema),
        defaultValues: {
            educatorPerspective: '',
            subject: '',
            initialMaterials: '',
            ageGroup: 'Ages 11-14',
            projectScope: 'A Full Course/Studio',
        },
    });

    const steps = [
        { name: 'Perspective', fields: ['educatorPerspective'], icon: <CircleUserRound className="h-8 w-8 text-primary-600" /> },
        { name: 'Topic', fields: ['subject'], icon: <BookText className="h-8 w-8 text-primary-600" /> },
        { name: 'Audience', fields: ['ageGroup'], icon: <Telescope className="h-8 w-8 text-primary-600" /> },
        { name: 'Scope', fields: ['projectScope'], icon: <Scale className="h-8 w-8 text-primary-600" /> },
    ];

    const handleNextStep = async () => {
        console.log('handleNextStep called');
        const fields = steps[step - 1].fields;
        const isValid = await trigger(fields);
        if (isValid && step < steps.length) {
            setStep(s => s + 1);
        }
    };
    
    const handlePrevStep = () => {
        console.log('handlePrevStep called');
        if (step > 1) setStep(s => s - 1);
    }

    const onSubmit = (data) => {
        console.log('onSubmit called with data:', data);
        createNewBlueprint(data)};

    const motionVariants = {
        initial: { opacity: 0, x: 50 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -50 },
    };

    return (
        <div className="fixed inset-0 z-40 bg-neutral-100/70 backdrop-blur-sm overflow-y-auto p-4 flex items-center justify-center">
            <Card as="form" onSubmit={handleSubmit(onSubmit)} className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Create a New Blueprint</CardTitle>
                    <CardDescription>Let's start by capturing your vision. This is the foundation of our collaboration.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div className="flex justify-center py-6">
                        <StepIndicator currentStep={step} steps={steps} />
                    </div>
                    
                    <div className="overflow-hidden relative h-64">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                variants={motionVariants}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                                className="absolute w-full"
                            >
                                {step === 1 && (
                                    <div>
                                        <label htmlFor="educatorPerspective" className="font-semibold text-neutral-800">What's your motivation or initial thought?</label>
                                        <p className="text-sm text-neutral-500 mb-2">This helps us understand your vision. Think of it as a journal entry.</p>
                                        <Textarea {...register('educatorPerspective')} id="educatorPerspective" placeholder="e.g., 'I've always been fascinated by how cities evolve...' or 'My students are struggling to see the relevance of history...'" autoFocus />
                                        {errors.educatorPerspective && <p className="text-sm text-red-600 mt-1">{errors.educatorPerspective.message}</p>}
                                    </div>
                                )}
                                {step === 2 && (
                                     <div className="space-y-4">
                                        <div>
                                            <label htmlFor="subject" className="font-semibold text-neutral-800">What is the core subject or topic?</label>
                                            <p className="text-sm text-neutral-500 mb-2">This will be the title of our blueprint.</p>
                                            <Input {...register('subject')} id="subject" placeholder="e.g., Urban Planning, The Cold War, Marine Biology" autoFocus />
                                            {errors.subject && <p className="text-sm text-red-600 mt-1">{errors.subject.message}</p>}
                                        </div>
                                        <div>
                                            <label htmlFor="initialMaterials" className="font-semibold text-neutral-800">Any initial ideas on materials or resources? (Optional)</label>
                                             <Textarea {...register('initialMaterials')} id="initialMaterials" placeholder="e.g., 'The first chapter of 'The Death and Life of Great American Cities' by Jane Jacobs...'" />
                                        </div>
                                    </div>
                                )}
                                {step === 3 && (
                                    <div>
                                        <label htmlFor="ageGroup" className="font-semibold text-neutral-800">Who is this project for?</label>
                                        <p className="text-sm text-neutral-500 mb-2">Select the target age group for your learners.</p>
                                        <select {...register('ageGroup')} id="ageGroup" className={clsx(Input.className, 'h-10')}>
                                            <option>Ages 5-7</option>
                                            <option>Ages 8-10</option>
                                            <option>Ages 11-14</option>
                                            <option>Ages 15-18</option>
                                            <option>Ages 18+</option>
                                        </select>
                                    </div>
                                )}
                                {step === 4 && (
                                    <div>
                                        <label htmlFor="projectScope" className="font-semibold text-neutral-800">What is the scope of this project?</label>
                                        <p className="text-sm text-neutral-500 mb-2">Select the scale of your project.</p>
                                        <select {...register('projectScope')} id="projectScope" className={clsx(Input.className, 'h-10')}>
                                            <option>A Full Course/Studio</option>
                                            <option>A Single Project/Assignment</option>
                                        </select>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </CardContent>
                <CardContent className="border-t pt-6 flex justify-between">
                    <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                    <div className="flex gap-2">
                        {step > 1 && <Button type="button" variant="ghost" onClick={handlePrevStep}>Back</Button>}
                        {step < steps.length && <Button type="button" onClick={handleNextStep}>Next</Button>}
                        {step === steps.length && <Button type="submit" variant="secondary">Create Blueprint</Button>}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
