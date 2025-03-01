'use client';
import Link from 'next/link';
import React from 'react';
import { FaTelegram, FaGithub } from 'react-icons/fa';
import { FaSquareXTwitter } from 'react-icons/fa6';
import { motion } from 'framer-motion';

const Footer = () => {
    return (
        <footer className="w-full bg-[#e6e8ec] p-6 shadow-lg flex flex-wrap justify-center gap-6">
            <Link
                href="https://github.com/distroinfinity/ethdenver"
                target="_blank"
                rel="noopener noreferrer"
            >
                <motion.div
                    className="flex items-center bg-[#e9eaec] p-3 rounded-lg shadow-md cursor-pointer relative overflow-hidden group"
                    whileHover={{
                        scale: 1.05,
                        boxShadow:
                            '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: 0 }}
                        transition={{ duration: 0.3 }}
                    />
                    <FaGithub className="text-xl text-gray-800 mr-2 relative z-10 group-hover:text-pink-700 transition-colors duration-300" />
                    <span className="text-gray-900 font-medium relative z-10 group-hover:text-pink-700 transition-colors duration-300">
                        GitHub
                    </span>
                </motion.div>
            </Link>

            <Link
                href="https://x.com/distroinfinity"
                target="_blank"
                rel="noopener noreferrer"
            >
                <motion.div
                    className="flex items-center bg-[#e9eaec] p-3 rounded-lg shadow-md cursor-pointer relative overflow-hidden group"
                    whileHover={{
                        scale: 1.05,
                        boxShadow:
                            '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: 0 }}
                        transition={{ duration: 0.3 }}
                    />
                    <FaSquareXTwitter className="text-xl text-gray-800 mr-2 relative z-10 group-hover:text-pink-700 transition-colors duration-300" />
                    <span className="text-gray-900 font-medium relative z-10 group-hover:text-pink-700 transition-colors duration-300">
                        X
                    </span>
                </motion.div>
            </Link>

            <Link
                href="https://t.me/distroinfinity"
                target="_blank"
                rel="noopener noreferrer"
            >
                <motion.div
                    className="flex items-center bg-[#e9eaec] p-3 rounded-lg shadow-md cursor-pointer relative overflow-hidden group"
                    whileHover={{
                        scale: 1.05,
                        boxShadow:
                            '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: 0 }}
                        transition={{ duration: 0.3 }}
                    />
                    <FaTelegram className="text-xl text-gray-800 mr-2 relative z-10 group-hover:text-pink-700 transition-colors duration-300" />
                    <span className="text-gray-900 font-medium relative z-10 group-hover:text-pink-700 transition-colors duration-300">
                        Telegram
                    </span>
                </motion.div>
            </Link>
        </footer>
    );
};

export default Footer;
