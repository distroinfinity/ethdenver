'use client';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Ai from '../../app/assests/PixieAgent.jpg';

const Hero = () => {
    const router = useRouter();
    const [isLoaded, setIsLoaded] = useState(true); // Start as true to show content immediately

    const handleGetStarted = () => {
        router.push('/pixie');
    };

    const handleSpawnAgent = () => {
        // Navigate to the spawn agent section by ID
        const spawnAgentSection = document.getElementById(
            'spawn-agent-section'
        );
        if (spawnAgentSection) {
            spawnAgentSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            // Fallback if section doesn't exist yet
            window.scrollTo({
                top: document.documentElement.scrollHeight,
                behavior: 'smooth',
            });
        }
    };

    // Text animation variants - much faster timing
    const container = {
        hidden: { opacity: 0 },
        visible: (i = 1) => ({
            opacity: 1,
            transition: {
                staggerChildren: 0.01, // Even faster stagger
                delayChildren: i * 0.05, // Minimal delay
            },
        }),
    };

    const child = {
        hidden: {
            y: 10, // Reduced distance
            opacity: 0,
            filter: 'blur(5px)', // Less blur
        },
        visible: {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            transition: {
                type: 'spring',
                damping: 12,
                stiffness: 400, // Higher stiffness
                duration: 0.1, // Shorter duration
            },
        },
    };

    const titleWords = 'Observe the awakening of intelligence'.split(' ');
    const subtitleWords = 'On chain creature'.split(' ');

    return (
        <div className="relative flex flex-col justify-center items-center min-h-screen bg-gradient-to-b from-[#e6e8ec] to-white z-0">
            <div className="max-w-6xl mx-auto px-4 text-center py-8">
                {/* Mobile-friendly subtitle placement */}
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="visible" // Always animate immediately
                    className="mb-4 order-first md:order-first mt-10 md:mt-0"
                >
                    {subtitleWords.map((word, index) => (
                        <motion.span
                            key={`subtitle-${index}`}
                            variants={child}
                            className="uppercase font-bold text-zinc-500 tracking-wide text-sm inline-block mx-1"
                        >
                            {word}
                        </motion.span>
                    ))}
                </motion.div>

                <motion.h1
                    className="font-heading font-black text-4xl md:text-5xl lg:text-6xl mx-auto max-w-3xl text-blue-600 mb-4 md:mb-0"
                    variants={container}
                    initial="hidden"
                    animate="visible" // Always animate immediately
                    custom={0.2} // Much faster timing
                >
                    {titleWords.map((word, index) => (
                        <motion.span
                            key={`title-${index}`}
                            variants={child}
                            className="inline-block mx-1"
                        >
                            {word}
                        </motion.span>
                    ))}
                </motion.h1>

                <motion.div
                    className="mt-8"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                        delay: 0.2, // Minimal delay
                        duration: 0.2, // Much faster
                        type: 'spring',
                        stiffness: 300,
                    }}
                >
                    <motion.div
                        className="mx-auto max-w-md relative overflow-hidden rounded-xl"
                        whileHover={{
                            scale: 1.03,
                            boxShadow:
                                '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        }}
                        transition={{ duration: 0.2 }}
                    >
                        <Image
                            src={Ai}
                            alt="AI Pixie Agent"
                            height={500}
                            width={500}
                            className="rounded-xl shadow-md"
                            priority
                        />
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.3 }}
                        />
                    </motion.div>
                </motion.div>

                <motion.div
                    className="mt-8 flex flex-col sm:flex-row justify-center gap-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                >
                    <motion.button
                        onClick={handleGetStarted}
                        className="relative px-8 py-3 bg-purple-600 text-white font-bold text-lg rounded-lg shadow-sm overflow-hidden group"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{
                            delay: 0.5,
                            type: 'spring',
                            stiffness: 300,
                        }}
                    >
                        <span className="relative z-10">Get Started</span>
                        <motion.div
                            className="absolute inset-0 bg-blue-500"
                            initial={{ x: '-100%' }}
                            whileHover={{ x: 0 }}
                            transition={{ duration: 0.2 }}
                        />
                    </motion.button>

                    <motion.button
                        onClick={handleSpawnAgent}
                        className="relative px-8 py-3 bg-blue-600 text-white font-bold text-lg rounded-lg shadow-sm overflow-hidden group"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{
                            delay: 0.5,
                            type: 'spring',
                            stiffness: 300,
                        }}
                    >
                        <span className="relative z-10">Spawn Agent</span>
                        <motion.div
                            className="absolute inset-0 bg-purple-500"
                            initial={{ x: '-100%' }}
                            whileHover={{ x: 0 }}
                            transition={{ duration: 0.2 }}
                        />
                    </motion.button>
                </motion.div>
            </div>
        </div>
    );
};

export default Hero;