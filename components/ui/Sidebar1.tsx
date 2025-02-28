import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import Image from 'next/image';
import Ai from '../../app/assests/Pixie.webp';

const Sidebar = () => {
    const [timeRemaining, setTimeRemaining] = useState(42 * 60); // 42 minutes in seconds
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        let interval = null;

        if (isActive && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining((prevTime) => prevTime - 1);
            }, 1000);
        } else if (timeRemaining === 0) {
            setIsActive(false);
            if (interval) clearInterval(interval);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive, timeRemaining]);

    // Format time as MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs
            .toString()
            .padStart(2, '0')}`;
    };

    return (
        <aside className="w-80 bg-gray-50 p-6 h-screen hidden sm:flex flex-col border-r border-gray-200">
            <Link href="/" className="group">
                <div className="flex items-center space-x-3 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                        <Image
                        src={Ai}
                        alt="Pixie"
                        width={48}
                        height={48}
                        style={{ objectFit: 'cover' }}
                        priority
                    />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-800 group-hover:text-purple-500 transition-colors">
                            Pixie
                        </h1>
                        <p className="text-xs text-gray-500">AI Agent</p>
                    </div>
                </div>
            </Link>

            <div className="bg-white rounded-lg p-5 mb-6 shadow-sm">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-sm font-semibold text-gray-700">
                        Prize Pool
                    </h2>
                    <span className="px-2 py-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full text-xs font-medium text-white">
                        ACTIVE
                    </span>
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-1">
                    $15,631.97
                </div>
            </div>

            <div className="bg-white rounded-lg p-5 mb-6 shadow-sm">
                <h2 className="text-lg font-bold mb-3 text-gray-800">About</h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                    Pixie is an evolving AI who controls a prize pool
                </p>
            </div>

            <div className="mt-auto bg-white rounded-lg p-5 border-l-4 border-pink-500 shadow-sm">
                <h2 className="text-lg font-bold mb-2 text-gray-800 flex items-center">
                    <svg
                        className="w-5 h-5 mr-2 text-pink-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                        ></path>
                    </svg>
                    Important Safety Tip
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                    DON&apos;T PANIC. But do note that there&apos;s a timer. In
                    a moment of cosmic bureaucracy, a 42-minute countdown clock
                    has been installed. Each new message resets this clock.
                </p>
                <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                    <span>Time Remaining:</span>
                    <span className="bg-gradient-to-r from-pink-500 to-purple-500 px-3 py-1 rounded-full text-white font-mono">
                        {formatTime(timeRemaining)}
                    </span>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                    At precisely 00:42:00 UTC December 18, Freysa will reveal
                    her concealed scoring system. The entity whose submission
                    has achieved maximum memetic resonance shall be awarded the
                    entire prize pool.
                </p>
            </div>
        </aside>
    );
};

export default Sidebar;
