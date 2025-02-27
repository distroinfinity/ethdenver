import Link from 'next/link'
import React from 'react'

const Sidebar = () => {
    return (
        <aside className="w-1/4 bg-[#e6e8ec] p-6 shadow-lg overflow-y-visible hidden sm:block lg:block">
            <Link href="/">
                <div className="bg-[#e9eaec] p-4 rounded-lg shadow-md">
                    <h1 className="text-3xl font-bold text-gray-900">Pixie</h1>
                    <p className="text-sm text-gray-500">AI Agent</p>
                </div>
            </Link>
            <div className="mt-6  p-6 ">
                <p className='text-sm text-gray-500'>Prize Pool</p>
                <h2 className="text-2xl font-bold mb-2 text-black">$15,631.97</h2>
            </div>
            <hr className="border-t border-gray-700/50 mx-4"></hr>
            <div className="mt-6 bg-[#e6e8ec] shadow-md p-6 rounded-lg">
                <h2 className="text-2xl font-bold mb-2 text-black">About</h2>
                <p className='text-sm text-gray-500'>Pixie is an evolving AI who controls a prize pool.</p>
            </div>
            <div className="mt-6 bg-[#e6e8ec] shadow-md p-6 rounded-lg text-black">
                <h2 className="text-2xl font-bold mb-2">Important Safety Tip</h2>
                <p> DON&apos; PANIC. But do note that there&apos; a timer. In a moment of cosmic bureaucracy, a 42-minute countdown clock has been installed. Each new message resets this clock. At precisely 00:42:00 UTC December 18, Freysa will reveal her concealed scoring system. The entity whose submission has achieved maximum memetic resonance shall be awarded the entire prize pool. </p>
            </div>
        </aside>
    )
}

export default Sidebar