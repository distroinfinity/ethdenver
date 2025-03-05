'use client';

import {
    arbitrum,
    baseSepolia,
    hederaTestnet,
    zksyncSepoliaTestnet,
} from 'wagmi/chains';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import ChatContainer from '../ChatContainer';
import Sidebar from '@/components/ui/Sidebar1';
import Navbar from '@/components/ui/Navbar';

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
    iconUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4558.png',
    iconBackground: '#00EF8B',
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
    iconUrl:
        'https://images.ctfassets.net/5ei3wx54t1dp/17bF4Vx3c0dPRFN6ydvd4d/45fdbb4a174d3a7527c0ec55f91aee7d/S.svg',
    iconBackground: '#FFFFFF',
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
    iconUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/29711.png',
    iconBackground: '#ffffff',
};

const kiteTestnet = {
    id: 2368,
    name: 'KiteAI Testnet',
    nativeCurrency: {
        name: 'KITE',
        symbol: 'KITE',
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ['https://rpc-testnet.gokite.ai'],
        },
        public: {
            http: ['https://rpc-testnet.gokite.ai'],
        },
    },
    blockExplorers: {
        default: {
            name: 'KiteAI explorer',
            url: 'https://testnet.kitescan.ai',
        },
    },
    testnet: true,
    iconUrl:
        'https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=2,anim=false,background=white,quality=75,width=112,height=112/avatars/mk/bdb90a94-6a13-4517-a391-e94731ea3c80.jpg',
    iconBackground: '#000',
};

const taraxaTestnet = {
    id: 842,
    name: 'Taraxa Testnet',
    nativeCurrency: {
        name: 'TARA',
        symbol: 'TARA',
        decimals: 18,
    },
    rpcUrls: {
        default: {
            http: ['https://rpc.testnet.taraxa.io/'],
        },
        public: {
            http: ['https://rpc.testnet.taraxa.io/'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Taraxa explorer',
            url: 'https://explorer.testnet.taraxa.io/',
        },
    },
    testnet: true,
    iconUrl:
        'https://assets.coingecko.com/coins/images/4372/standard/just_logo_dark_background.png',
    iconBackground: '#000',
};

const zkSyncSepolia = {
    ...zksyncSepoliaTestnet,
    iconUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/24091.png',
    iconBackground: '#fff',
};

const hedera = {
    ...hederaTestnet,
    iconUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4642.png',
    iconBackground: '#000',
};

export const config = getDefaultConfig({
    appName: 'pixie',
    projectId: '019b3283f49f6d76d0080865a83d9f8b',
    chains: [
        // flowTestnet,
        // storyProtocolTestnet,
        // zircuitTestnet,
        // baseSepolia,
        // hedera,
        // kiteTestnet,
        taraxaTestnet,
        // zkSyncSepolia,
    ],
});


export default function AIAgentGroupChat() {
    return (
        <div className="min-h-screen bg-gray-100 flex">
            <div className="block sm:hidden md:hidden">
                <Navbar />
            </div>
            <Sidebar />
            <ChatContainer />
        </div>
    );
}
