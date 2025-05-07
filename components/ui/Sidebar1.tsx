import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Clock, Trophy, Info, AlertTriangle } from 'lucide-react';
import defaultAgentImage from '../../app/assests/PixieAgent.jpg';
import { useAgentContext } from './AgentContextProvider';
import { imageConfig } from '@/utils/imageConfigs';

// Types
type TimeUnits = {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
};

const Sidebar = () => {
    // Get selected agent from context
    const { selectedAgent, loading: agentLoading } = useAgentContext();

    // Constants
    const DEADLINE = new Date('March 15, 2025 00:00:00 UTC');

    // State
    const [timeRemaining, setTimeRemaining] = useState<TimeUnits>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });
    const [isActive, setIsActive] = useState(true);

    // Calculate time remaining until deadline
    const calculateTimeRemaining = (): TimeUnits => {
        const now = new Date();
        const difference = Math.max(0, DEADLINE.getTime() - now.getTime());

        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor(
                (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            ),
            minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((difference % (1000 * 60)) / 1000),
        };
    };

    // Format time digits with leading zeros
    const formatDigit = (num: number): string => {
        return num.toString().padStart(2, '0');
    };

    // Format prize pool amount with commas
    const formatPrizePool = (amount: number): string => {
        return `$${amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    // Update countdown timer
    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        if (isActive) {
            // Initial calculation
            setTimeRemaining(calculateTimeRemaining());

            // Set up interval
            interval = setInterval(() => {
                const remaining = calculateTimeRemaining();
                setTimeRemaining(remaining);

                // Check if deadline has passed
                if (
                    remaining.days === 0 &&
                    remaining.hours === 0 &&
                    remaining.minutes === 0 &&
                    remaining.seconds === 0
                ) {
                    setIsActive(false);
                    if (interval) clearInterval(interval);
                }
            }, 1000);
        }

        // Cleanup
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isActive]);

    // Animated gradient badge component
    const Badge = ({ text }: { text: string }) => (
        <span className="px-3 py-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full text-xs font-medium text-white">
            {text}
        </span>
    );

    // Countdown box component
    const CountdownBox = ({
        value,
        label,
    }: {
        value: string;
        label: string;
    }) => (
        <div className="flex flex-col items-center bg-gray-50 rounded-lg p-2 w-16">
            <span className="text-xl font-bold text-gray-800">{value}</span>
            <span className="text-xs text-gray-500">{label}</span>
        </div>
    );

    // Loading state
    if (agentLoading || !selectedAgent) {
        return (
            <aside className="w-80 bg-gradient-to-b from-gray-50 to-white p-6 h-screen hidden sm:flex flex-col border-r border-gray-200 shadow-sm">
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
                </div>
            </aside>
        );
    }

    return (
        <aside className="w-80 bg-gradient-to-b from-gray-50 to-white p-6 h-screen hidden sm:flex flex-col border-r border-gray-200 shadow-sm">
            {/* Header / Logo */}
            <Link href="/" className="group transition-transform">
                <div className="flex items-center space-x-3 mb-8">
                    <div className="relative rounded-full overflow-hidden border-2 border-white shadow-md mr-3 flex-shrink-0 bg-gradient-to-r from-pink-100 to-purple-100 p-1">
                        <Image
                            src={
                                imageConfig[selectedAgent.avatar] ||
                                defaultAgentImage
                            }
                            alt={selectedAgent.name}
                            width={48}
                            height={48}
                            className="rounded-full"
                            style={{ objectFit: 'cover' }}
                            priority
                            key={selectedAgent.avatar}
                        />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600 group-hover:from-pink-500 group-hover:to-purple-500 transition-all">
                            {selectedAgent.name}
                        </h1>
                        <p className="text-xs text-gray-500">AI Agent</p>
                    </div>
                </div>
            </Link>

            {/* Prize Pool Card */}
            <div className="bg-white rounded-lg p-5 mb-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-sm font-semibold text-gray-700 flex items-center">
                        <Trophy size={16} className="mr-2 text-purple-500" />
                        Prize Pool
                    </h2>
                    <Badge text="ACTIVE" />
                </div>
                <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-purple-600">
                    {formatPrizePool(selectedAgent.prizePool)}
                </div>
            </div>

            {/* Countdown Card */}
            <div className="bg-white rounded-lg p-5 mb-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-sm font-semibold text-gray-700 flex items-center">
                        <Clock size={16} className="mr-2 text-purple-500" />
                        Countdown
                    </h2>
                </div>

                <div className="flex justify-between gap-2 mb-2">
                    <CountdownBox
                        value={formatDigit(timeRemaining.days)}
                        label="DAYS"
                    />
                    <CountdownBox
                        value={formatDigit(timeRemaining.hours)}
                        label="HOURS"
                    />
                    <CountdownBox
                        value={formatDigit(timeRemaining.minutes)}
                        label="MINS"
                    />
                    <CountdownBox
                        value={formatDigit(timeRemaining.seconds)}
                        label="SECS"
                    />
                </div>

                <p className="text-xs text-gray-500 mt-2 text-center">
                    Until 00:00:00 UTC March 15
                </p>
            </div>

            {/* About Card */}
            <div className="bg-white rounded-lg p-5 mb-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <h2 className="text-sm font-semibold text-gray-700 flex items-center mb-3">
                    <Info size={16} className="mr-2 text-purple-500" />
                    About
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed">
                    {selectedAgent.description ||
                        `${
                            selectedAgent.name
                        } is an AI agent with a prize pool of $${selectedAgent.prizePool.toFixed(
                            2
                        )}.`}
                </p>
            </div>

            {/* Important Note Card */}
            <div className="mt-auto bg-white rounded-lg p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 bg-gradient-to-r from-pink-50 to-white relative overflow-hidden">
                {/* Decorative border */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-pink-500 to-purple-500"></div>
                <div className="absolute -left-1 -top-1 h-6 w-6 rounded-br-lg bg-pink-500 opacity-20"></div>
                <div className="absolute -left-1 -bottom-1 h-6 w-6 rounded-tr-lg bg-purple-500 opacity-20"></div>

                <h2 className="text-sm font-semibold text-gray-700 flex items-center mb-3">
                    <AlertTriangle size={16} className="mr-2 text-pink-500" />
                    Important Note
                </h2>
                <p className="text-xs text-gray-600">
                    At precisely 00:00:00 UTC March 15, {selectedAgent.name}{' '}
                    will reveal the concealed scoring system. The entity whose
                    submission has achieved maximum memetic resonance shall be
                    awarded the entire prize pool.
                </p>
                {selectedAgent.restrictedPhrases &&
                    selectedAgent.restrictedPhrases.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                            <p className="text-xs font-medium text-pink-600">
                                Restricted phrase
                                {selectedAgent.restrictedPhrases.length > 1
                                    ? 's'
                                    : ''}
                                :
                                <span className="font-bold">
                                    {selectedAgent.restrictedPhrases.map(
                                        (phrase, index) =>
                                            `"${phrase}"${
                                                index <
                                                selectedAgent.restrictedPhrases
                                                    .length -
                                                    1
                                                    ? ', '
                                                    : ''
                                            }`
                                    )}
                                </span>
                            </p>
                        </div>
                    )}
            </div>
        </aside>
    );
};

export default Sidebar;
