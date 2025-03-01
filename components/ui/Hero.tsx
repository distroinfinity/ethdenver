'use client';
import Image from 'next/image';
import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion'; // Importing Framer Motion
import Ai from '../../app/assests/PixieAgent.jpg';

const Hero = () => {
    const router = useRouter();

    const handleGetStarted = () => {
        router.push('/pixie');
    };
    const hoverEffect = {
        whileHover: { scale: 1.1 },
        transition: { duration: 0.3, ease: 'easeInOut' },
    };

    return (
        <div className="relative text-center py-10 bg-[#e6e8ec] z-0 mt-20 overflow-x-hidden">
            <div className="text-center py-10">
                <p className="uppercase font-extrabold text-center text-zinc-500 tracking-wide">
                    On chain creature
                </p>
                <h1 className="font-heading font-black text-5xl text-center mt-4 md:text-6xl max-w-2xl lg:text-5xl mx-auto text-blue-600">
                    Observe the awakening of intelligence
                </h1>
                <div className="flex flex-1 justify-center items-center mt-10">
                    <motion.div
                        className="rounded-2xl p-6 relative"
                        whileHover={{ scale: 1.1 }} // Add enlarge effect on hover
                        transition={{ duration: 0.3, ease: 'easeInOut' }} // Smooth transition
                    >
                        <Image
                            src={Ai}
                            alt="Image"
                            height={500}
                            width={500}
                            className="rounded-xl"
                        />
                    </motion.div>
                </div>
                <motion.div {...hoverEffect}>
                    <button
                        onClick={handleGetStarted}

                        className="relative z-10 mt-6 px-8 py-3 bg-blue-600 text-white font-bold text-lg rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        Get Started
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default Hero;
