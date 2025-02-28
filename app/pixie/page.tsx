'use client';

import { arbitrum } from 'wagmi/chains';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import ChatContainer from '../ChatContainer';
import Sidebar from '@/components/ui/Sidebar1';
import Navbar from '@/components/ui/Navbar';

// Define Flow testnet as a custom chain
const flowTestnet = {
    id: 545,
    name: 'Flow Testnet',
    nativeCurrency: {
        name: 'FLOW',
        symbol: 'FLOW',
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ['https://testnet.evm.nodes.onflow.org'],
        },
        public: {
            http: ['https://testnet.evm.nodes.onflow.org'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Flowscan',
            url: 'https://evm-testnet.flowscan.io',
        },
    },
    testnet: true,
};
const storyProtocolTestnet = {
    id: 1315,
    name: 'Story Aeneid Testnet',
    nativeCurrency: {
        name: 'IP',
        symbol: 'IP',
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ['https://aeneid.storyrpc.io'],
        },
        public: {
            http: ['https://aeneid.storyrpc.io'],
        },
    },
    blockExplorers: {
        default: {
            name: 'StoryProtocolExplorer',
            url: 'https://aeneid.storyscan.xyz',
        },
    },
    testnet: true,
};
const zircuitTestnet = {
    id: 48899,
    name: 'Zircuit Testnet',
    nativeCurrency: {
        name: 'ETH',
        symbol: 'ETH',
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ['https://zircuit1-testnet.p2pify.com'],
        },
        public: {
            http: ['https://zircuit1-testnet.p2pify.com'],
        },
    },
    blockExplorers: {
        default: {
            name: 'ZircuitScan',
            url: 'https://explorer.testnet.zircuit.com',
        },
    },
    testnet: true,
};

export const config = getDefaultConfig({
    appName: 'pixie',
    projectId: '019b3283f49f6d76d0080865a83d9f8b',
    chains: [flowTestnet, storyProtocolTestnet, zircuitTestnet],
});

const queryClient = new QueryClient();

export default function AIAgentGroupChat() {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider>
                    <div className="min-h-screen bg-gray-100 flex">
                        <div className="block sm:hidden md:hidden">
                            <Navbar />
                        </div>
                        <Sidebar />
                        <ChatContainer></ChatContainer>
                    </div>
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}
