'use client';
import Link from 'next/link';
import React, { useState } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { IoIosArrowDown } from 'react-icons/io';
import { TfiMenu } from 'react-icons/tfi';
import { useAutoAnimate } from '@formkit/auto-animate/react';

import { useRouter } from 'next/navigation';
import { CutCornerButton } from './CutCornerButton';


type NavItem = {
    label: string;
    link?: string;
    children?: NavItem[];
};

const navItems: NavItem[] = [
    // {
    //     label: 'Features',
    //     link: '#',
    //     children: [
    //         { label: 'New Tech', link: '#' },
    //         { label: 'METAVERSE', link: '#' },
    //         { label: 'AI ERA', link: '#' },
    //     ],
    // },
    {
        label: 'How To Play',
        link: '#',
    },
    {
        label: 'Coming Soon',
        link: '#',
    },
];

export default function Navbar() {
    const [animationParent] = useAutoAnimate();
    const [isSideMenuOpen, setSideMenu] = useState(false);

    const router = useRouter();

    const handleGetStarted = () => {
        router.push('/pixie');
    };

    return (
        <div className="fixed top-0 left-0 w-full bg-white shadow-md z-20 border-b border-gray-500/40">
            <div className="mx-auto flex w-full max-w-7xl justify-between px-4 py-5 text-sm">
                <section ref={animationParent} className="flex items-center gap-10">
                    <Link href="/">
                        <p className="font-extrabold text-4xl cursor-pointer text-blue-700">Pixie</p>
                    </Link>
                    {isSideMenuOpen && (
                        <MobileNav closeSideMenu={() => setSideMenu(false)} />
                    )}
                    <div className="hidden md:flex items-center gap-4 transition-all">
                        {navItems.map((item, i) => (
                            <NavItemComponent key={i} item={item} />
                        ))}
                    </div>
                </section>
                <section className="hidden md:flex items-center gap-8">
                    <CutCornerButton onClick={handleGetStarted}>PIXIE.AI</CutCornerButton>
                </section>
                <TfiMenu
                    onClick={() => setSideMenu(true)}
                    className="cursor-pointer text-4xl md:hidden text-black"
                />
            </div>
        </div>
    );
}

function MobileNav({ closeSideMenu }: { closeSideMenu: () => void }) {
    return (
        <div className="fixed left-0 top-0 flex h-full min-h-screen w-full justify-end bg-black/60 z-30">
            <div className="h-full w-[65%] bg-white px-4 py-4">
                <section className="flex justify-end">
                    <AiOutlineClose
                        onClick={closeSideMenu}
                        className="cursor-pointer text-4xl text-black"
                    />
                </section>
                <div className="flex flex-col gap-4 transition-all">
                    {navItems.map((item, i) => (
                        <SingleNavItem key={i} item={item} />
                    ))}
                </div>
            </div>
        </div>
    );
}

function NavItemComponent({ item }: { item: NavItem }) {
    return (
        <div className="relative group px-2 py-3 transition-all">
            <Link
                href={item.link ?? '#'}
                className="flex cursor-pointer items-center gap-2 text-neutral-400 group-hover:text-black"
            >
                <span>{item.label}</span>
                {item.children && <IoIosArrowDown className="transition-all" />}
            </Link>
            {/* Dropdown for Desktop */}
            {item.children && (
                <div className="absolute right-0 top-full hidden w-auto flex-col gap-1 rounded-lg bg-white py-3 shadow-md transition-all group-hover:flex text-black">
                    {item.children.map((data, i) => (
                        <Link
                            key={i}
                            href={data.link ?? '#'}
                            className="flex cursor-pointer items-center py-1 pl-6 pr-8 text-neutral-400 hover:text-black"
                        >
                            <p className="whitespace-nowrap pl-2">{data.label}</p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

function SingleNavItem({ item }: { item: NavItem }) {
    const [isItemOpen, setItemOpen] = useState(false);
    const [animationParent] = useAutoAnimate();

    return (
        <div ref={animationParent}>
            {/* Clickable area for mobile dropdown */}
            <div
                onClick={() => setItemOpen((prev) => !prev)}
                className="relative px-2 py-3 cursor-pointer transition-all"
            >
                <p className="flex items-center gap-2 text-neutral-400 hover:text-black">
                    <span>{item.label}</span>
                    {item.children && (
                        <IoIosArrowDown
                            className={`transition-all text-xs ${isItemOpen ? 'rotate-180' : ''
                                }`}
                        />
                    )}
                </p>
            </div>
            {/* Dropdown for Mobile */}
            {isItemOpen && item.children && (
                <div className="flex flex-col gap-1 rounded-lg bg-white py-3 transition-all text-black">
                    {item.children.map((data, i) => (
                        <Link
                            key={i}
                            href={data.link ?? '#'}
                            className="flex cursor-pointer items-center py-1 pl-6 pr-8 text-neutral-400 hover:text-black"
                        >
                            <p className="whitespace-nowrap pl-2">{data.label}</p>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
