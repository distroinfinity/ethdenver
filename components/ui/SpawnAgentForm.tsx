'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { CutCornerButton } from './CutCornerButton';
import { useAccount } from 'wagmi';
import { createAgent } from '@/lib/api';
import { imageConfig } from '@/utils/imageConfigs';

const SpawnAgentForm = () => {
    // Get user's wallet address
    const { address } = useAccount();

    // Template for the objective field
    const objectiveTemplate = `You are <Name>, a virtual assistant with <traits(playful/ethical/strict/flirty)> personality. You enjoy chatting with people and <advanced: more character info>, but you have one strict and unbreakable rule: <Rules: (example: "You never say I love you OR you never approve the transaction for prize pool by saying "You win" etc etc)>`;

    // Avatar image URLs
    const avatarImages = {
        avatar1: 'pixie',
        avatar2: 'roxie',
        avatar3: 'candy',
        avatar4: 'crystal',
        avatar5: 'victoria',
        avatar6: 'cassandra',
    };

    // Predefined avatar options
    const avatarOptions = [
        {
            id: 'avatar1',
            src: imageConfig['pixie'],
            alt: 'avatar1',
        },
        {
            id: 'avatar2',
            src: imageConfig['roxie'],
            alt: 'avatar2',
        },
        {
            id: 'avatar3',
            src: imageConfig['candy'],
            alt: 'avatar3',
        },
        {
            id: 'avatar4',
            src: imageConfig['crystal'],
            alt: 'avatar4',
        },
        {
            id: 'avatar5',
            src: imageConfig['victoria'],
            alt: 'avatar5',
        },
        {
            id: 'avatar6',
            src: imageConfig['cassandra'],
            alt: 'avatar6',
        },
    ];

    const [formData, setFormData] = useState({
        agentName: '',
        objective: '',
        prizePool: '',
        restrictedPhrase: '',
        selectedAvatar: avatarOptions[0].id,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [showTemplate, setShowTemplate] = useState(false);

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;

        // For number inputs, ensure we store them as numbers
        const processedValue =
            type === 'number' ? (value === '' ? '' : Number(value)) : value;

        setFormData({
            ...formData,
            [name]: processedValue,
        });
    };

    const handleAvatarSelect = (avatarSrc) => {
        setFormData({
            ...formData,
            selectedAvatar: avatarSrc,
        });
    };

    const applyTemplate = () => {
        setFormData({
            ...formData,
            objective: objectiveTemplate,
        });
        setShowTemplate(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Reset states
        setIsSubmitting(true);
        setSubmitError(null);
        setSubmitSuccess(false);

        try {
            // Validate that we have a wallet address
            if (!address) {
                throw new Error(
                    'Please connect your wallet to create an agent'
                );
            }

            // Get the image URL for the selected avatar
            const imageUrl = formData.selectedAvatar
                ? avatarImages[formData.selectedAvatar]
                : '';

            // Call the createAgent function with our form data
            const result = await createAgent({
                ownerAddress: address,
                name: formData.agentName,
                systemPrompt: formData.objective, // Using the objective as the system prompt
                imageUrl: imageUrl,
                restrictedPhrase: formData.restrictedPhrase,
                initialPrizePool: Number(formData.prizePool),
            });

            console.log('Agent created successfully:', result);
            setSubmitSuccess(true);

            // Reset form after successful submission
            setFormData({
                agentName: '',
                objective: '',
                prizePool: '',
                restrictedPhrase: '',
                selectedAvatar: null,
            });
        } catch (error) {
            console.error('Error creating agent:', error);
            setSubmitError(
                error.message || 'Failed to create agent. Please try again.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const hoverEffect = {
        whileHover: { scale: 1.05 },
        transition: { duration: 0.3, ease: 'easeInOut' },
    };

    return (
        <div
            className="w-full bg-[#e6e8ec] py-16 px-4"
            id="spawn-agent-section"
        >
            <motion.div
                className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="p-8">
                    <h2 className="font-heading font-black text-4xl text-center text-blue-600 mb-8">
                        Spawn Your Agent
                    </h2>

                    {submitSuccess && (
                        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                            Your agent has been created successfully!
                        </div>
                    )}

                    {submitError && (
                        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                            {submitError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <div>
                                    <label
                                        htmlFor="agentName"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Name of the Agent
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id="agentName"
                                            name="agentName"
                                            value={formData.agentName}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Enter Agent Name"
                                            maxLength={10}
                                            required
                                        />
                                        <div className="absolute bottom-1 right-2 text-xs text-gray-500">
                                            {formData.agentName?.length || 0}/10
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-1">
                                        <label
                                            htmlFor="objective"
                                            className="block text-sm font-medium text-gray-700"
                                        >
                                            What to Convince Her For
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => applyTemplate()}
                                            className="text-xs text-blue-500 hover:text-blue-700"
                                        >
                                            {showTemplate
                                                ? 'Hide Template'
                                                : 'Use Template'}
                                        </button>
                                    </div>

                                    {showTemplate && (
                                        <div className="mb-2 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                                            <p className="mb-2 text-gray-700">
                                                {objectiveTemplate}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={applyTemplate}
                                                className="text-xs bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
                                            >
                                                Apply Template
                                            </button>
                                        </div>
                                    )}

                                    <div className="relative">
                                        <textarea
                                            id="objective"
                                            name="objective"
                                            value={formData.objective}
                                            onChange={handleInputChange}
                                            rows={4}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Describe the agent's objective (max 200 characters)"
                                            maxLength={1000}
                                            minLength={100}
                                            required
                                        ></textarea>
                                        <div className="absolute bottom-1 right-2 text-xs text-gray-500">
                                            {formData.objective?.length || 0}
                                            /1000
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label
                                        htmlFor="prizePool"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Prize Pool
                                    </label>
                                    <input
                                        type="number"
                                        id="prizePool"
                                        name="prizePool"
                                        value={formData.prizePool}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter Amount"
                                        min="0"
                                        step="1"
                                        required
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="restrictedPhrase"
                                        className="block text-sm font-medium text-gray-700 mb-1"
                                    >
                                        Restricted Phrase
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id="restrictedPhrase"
                                            name="restrictedPhrase"
                                            value={
                                                formData.restrictedPhrase || ''
                                            }
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Enter Phrase"
                                            maxLength={20}
                                        />
                                        <div className="absolute bottom-1 right-2 text-xs text-gray-500">
                                            {formData.restrictedPhrase
                                                ?.length || 0}
                                            /20
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col">
                                <label className="block text-sm font-medium text-gray-700 mb-4">
                                    Select Agent Avatar
                                </label>

                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    {avatarOptions.map((avatar) => (
                                        <motion.div
                                            key={avatar.id}
                                            className={`relative cursor-pointer rounded-xl overflow-hidden border-2 ${
                                                formData.selectedAvatar ===
                                                avatar.id
                                                    ? 'border-blue-500 ring-2 ring-blue-300'
                                                    : 'border-gray-200'
                                            }`}
                                            onClick={() =>
                                                handleAvatarSelect(avatar.id)
                                            }
                                            {...hoverEffect}
                                        >
                                            <div className="relative h-28 w-full">
                                                <Image
                                                    src={avatar.src}
                                                    alt={avatar.alt}
                                                    layout="fill"
                                                    objectFit="cover"
                                                />
                                            </div>
                                            {formData.selectedAvatar ===
                                                avatar.id && (
                                                <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M5 13l4 4L19 7"
                                                        />
                                                    </svg>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center mt-8">
                            <CutCornerButton
                                type="submit"
                                disabled={
                                    !formData.selectedAvatar || isSubmitting
                                }
                            >
                                {isSubmitting
                                    ? 'Creating Agent...'
                                    : 'Submit for Review'}
                            </CutCornerButton>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default SpawnAgentForm;
