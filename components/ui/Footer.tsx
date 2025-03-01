'use client'
import Link from 'next/link';
import React from 'react';
import { FaTelegram, FaGithub } from 'react-icons/fa';
import { FaSquareXTwitter } from 'react-icons/fa6';
import { motion } from 'framer-motion';

const iconContainerStyles =
    "flex items-center bg-[#e9eaec] p-2 rounded-lg shadow-md cursor-pointer";

const hoverEffect = {
    whileHover: { scale: 1.1 },
    transition: { duration: 0.3, ease: 'easeInOut' },
};

const Footer = () => {
    return (
        <footer className="w-full bg-[#e6e8ec] p-4 shadow-lg flex justify-center space-x-5">
            <Link href="https://github.com/distroinfinity/ethdenver">
                <motion.div {...hoverEffect} className={iconContainerStyles}>
                    <FaGithub className="text-xl text-black/70 mr-2" />
                    <span className="text-gray-900">GitHub</span>
                </motion.div>
            </Link>
            <Link href="https://twitter.com/your-profile">
                <motion.div {...hoverEffect} className={iconContainerStyles}>
                    <FaSquareXTwitter className="text-xl text-black/70 mr-2" />
                    <span className="text-gray-900">X</span>
                </motion.div>
            </Link>
            <Link href="https://t.me/your-channel">
                <motion.div {...hoverEffect} className={iconContainerStyles}>
                    <FaTelegram className="text-xl text-black/70 mr-2" />
                    <span className="text-gray-900">Telegram</span>
                </motion.div>
            </Link>
        </footer>
    );
};

export default Footer;
