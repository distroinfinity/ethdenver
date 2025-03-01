'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { CutCornerButton } from './CutCornerButton';

const SpawnAgentForm = () => {
    const [formData, setFormData] = useState({
        agentName: '',
        objective: '',
        prizePool: '',
        imageFile: null,
        imagePreview: null
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({
                ...formData,
                imageFile: file,
                imagePreview: URL.createObjectURL(file)
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle form submission logic here
        console.log('Form submitted:', formData);
        // Reset form after submission
        setFormData({
            agentName: '',
            objective: '',
            prizePool: '',
            imageFile: null,
            imagePreview: null
        });
    };

    const hoverEffect = {
        whileHover: { scale: 1.05 },
        transition: { duration: 0.3, ease: 'easeInOut' },
    };

    return (
        <div className="w-full bg-[#e6e8ec] py-16 px-4">
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
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="agentName" className="block text-sm font-medium text-gray-700 mb-1">
                                        Name of the Agent
                                    </label>
                                    <input
                                        type="text"
                                        id="agentName"
                                        name="agentName"
                                        value={formData.agentName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter agent name"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="objective" className="block text-sm font-medium text-gray-700 mb-1">
                                        What to Convince Her For
                                    </label>
                                    <textarea
                                        id="objective"
                                        name="objective"
                                        value={formData.objective}
                                        onChange={handleInputChange}
                                        rows="4"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Describe the agent's objective"
                                        required
                                    ></textarea>
                                </div>
                                
                                <div>
                                    <label htmlFor="prizePool" className="block text-sm font-medium text-gray-700 mb-1">
                                        Prize Pool
                                    </label>
                                    <input
                                        type="text"
                                        id="prizePool"
                                        name="prizePool"
                                        value={formData.prizePool}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter prize pool amount"
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-center justify-center">
                                <label className="block text-sm font-medium text-gray-700 mb-4 w-full text-center">
                                    Agent Image
                                </label>
                                <div className="w-full flex flex-col items-center">
                                    {formData.imagePreview ? (
                                        <div className="relative h-60 w-60 mb-4">
                                            <Image
                                                src={formData.imagePreview}
                                                alt="Agent preview"
                                                layout="fill"
                                                objectFit="cover"
                                                className="rounded-xl"
                                            />
                                        </div>
                                    ) : (
                                        <div className="h-60 w-60 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center mb-4 bg-gray-50">
                                            <span className="text-gray-400 text-center px-4">
                                                Image preview will appear here
                                            </span>
                                        </div>
                                    )}
                                    
                                    <motion.label
                                        {...hoverEffect}
                                        htmlFor="imageUpload" 
                                        className="cursor-pointer px-4 py-2 bg-gray-200 rounded-lg text-gray-700 hover:bg-gray-300"
                                    >
                                        Upload Image
                                    </motion.label>
                                    <input
                                        type="file"
                                        id="imageUpload"
                                        name="imageUpload"
                                        onChange={handleImageChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex justify-center mt-8">
                            <CutCornerButton type="submit">
                                SPAWN AGENT
                            </CutCornerButton>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default SpawnAgentForm;