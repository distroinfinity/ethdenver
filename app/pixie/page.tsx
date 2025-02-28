"use client";

import { arbitrum } from "wagmi/chains";

import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";


import "@rainbow-me/rainbowkit/styles.css";

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import ChatContainer from "../ChatContainer";
import Sidebar from "@/components/ui/Sidebar1";
import Navbar from "@/components/ui/Navbar";

const config = getDefaultConfig({
    appName: "pixie",
    projectId: "019b3283f49f6d76d0080865a83d9f8b",
    chains: [arbitrum],
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
