// ChatContainer.tsx
import { useState, useEffect, useRef, useMemo } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    ArrowRight,
    DollarSign,
    Loader2,
    MessageSquare,
    User,
    Wallet,
    RefreshCw,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    fetchHistoricConversation,
    fetchMessageCost,
    sendMessage,
    fetchTokenPrice,
} from '@/lib/api';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { formatEther, parseEther } from 'viem';
import {
    estimateGas,
    getGasPrice,
    waitForTransactionReceipt,
    writeContract,
} from '@wagmi/core';
import { config } from './pixie/page';
import { chainConfig } from '@/utils/config';
import { toast } from '@/components/ui/use-toast';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import AgentSelector from '@/components/ui/AgentSelector';
import { useConversationStore, Message } from '@/lib/conversationStore';
import { useAgentContext } from '@/components/ui/AgentContextProvider';
import { imageConfig } from '@/utils/imageConfigs';
import Image from 'next/image';

// Predefined list of transaction hashes
const TX_HASHES = [
    '0x3a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
    '0x7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d',
    '0xf1e2d3c4b5a6978685746352413f2e1d0c9b8a7968574635241f3e2d1c0b9a87',
    '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8',
    '0x2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3',
    '0xb1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c',
    '0xe1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f',
    '0x5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6',
    '0xd1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e',
    '0x6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7',
];

export default function ChatContainer() {
    const { address, isConnected, chainId, chain } = useAccount();
    const [isTyping, setIsTyping] = useState(false);
    const [isFundsSufficient, setIsFundsSufficient] = useState(true);
    const {
        selectedAgent,
        refreshAgents,
        loading: agentsLoading,
    } = useAgentContext();
    const [messageCost, setMessageCost] = useState(
        selectedAgent?.messageCost || 1.0
    );
    const {
        data: balanceData,
        isLoading: isBalanceLoading,
        refetch: refetchBalance,
    } = useBalance({
        address,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [sendingMessage, setSendingMessage] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [input, setInput] = useState('');

    // Use the conversation store for multiple agent conversations
    const { conversations, addMessage, setMessages, clearConversation } =
        useConversationStore();

    // Get the current agent's messages
    const currentMessages = useMemo(
        () => (selectedAgent ? conversations[selectedAgent.id] || [] : []),
        [conversations, selectedAgent]
    );

    // Check if the current chain is supported
    const isChainSupported = useMemo(() => {
        return chainId ? !!chainConfig[chainId] : false;
    }, [chainId]);

    const formatAddress = (address: string) => {
        if (!address) return '';
        return `${address.substring(0, 6)}...${address.substring(
            address.length - 4
        )}`;
    };

    async function checkSufficientBalance() {
        if (
            !address ||
            !balanceData ||
            !chainId ||
            isBalanceLoading ||
            !selectedAgent
        ) {
            return;
        }

        if (!isChainSupported) {
            setIsFundsSufficient(false);
            return;
        }

        try {
            // Get the token price based on the chain's native token
            const tokenSymbol =
                chain?.nativeCurrency?.symbol?.toUpperCase() || 'ETH';
            const tokenPrice = await fetchTokenPrice(tokenSymbol);

            // Calculate how much of the native token is needed
            const tokenAmount = messageCost / tokenPrice;
            const tokenAmountBigInt = parseEther(tokenAmount.toString());

            const estimatedGas = await estimateGas(config, {
                to: chainConfig[chainId].contractAddress,
                value: tokenAmountBigInt,
            });

            const gasPrice = await getGasPrice(config);
            const totalGasCost = gasPrice * estimatedGas;
            const tokenAmountInWei = parseEther(tokenAmount.toString());
            const totalCostBigInt = tokenAmountInWei + totalGasCost;
            const balanceInWei = parseEther(balanceData.formatted);

            console.log(
                `Total cost is: ${formatEther(totalCostBigInt)} ${
                    balanceData.symbol
                }`
            );
            console.log(
                `Balance is: ${balanceData.formatted} ${balanceData.symbol}`
            );
            console.log(`Token price (${tokenSymbol}): ${tokenPrice}`);
            console.log(`Message cost: ${messageCost}`);

            // Compare BigInt values
            setIsFundsSufficient(balanceInWei >= totalCostBigInt);
        } catch (error) {
            console.error('Error checking balance:', error);
            setIsFundsSufficient(false);
        }
    }

    // Load the agent-specific conversation and message cost
    const loadAgentData = async (agentId: string) => {
        if (!agentId) return;

        setIsLoading(true);
        try {
            const [historicConversation, costResponse] = await Promise.all([
                fetchHistoricConversation(agentId),
                fetchMessageCost(agentId),
            ]);

            // If no messages in store, use fetched history
            if (
                !conversations[agentId] ||
                conversations[agentId].length === 0
            ) {
                setMessages(agentId, historicConversation.messages);
            }

            setMessageCost(costResponse.cost);
        } catch (error) {
            console.error(`Failed to load ${agentId} data:`, error);
            toast({
                title: 'Failed to load agent data',
                description: 'Please refresh the page to try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
            setTimeout(scrollToBottom, 100);
        }
    };

    // When selectedAgent changes, load agent-specific data
    useEffect(() => {
        if (selectedAgent) {
            loadAgentData(selectedAgent.id);
        }
    }, [selectedAgent]);

    // Initial data load
    useEffect(() => {
        if (selectedAgent) {
            loadAgentData(selectedAgent.id);
        }
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [currentMessages, isTyping]);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        if (isConnected) {
            checkSufficientBalance();
        }
    }, [
        address,
        balanceData,
        chainId,
        messageCost,
        isConnected,
        selectedAgent,
    ]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    // Handle clearing the current conversation
    const handleClearConversation = () => {
        if (!selectedAgent) return;

        clearConversation(selectedAgent.id);

        // Re-fetch the initial messages for this agent
        loadAgentData(selectedAgent.id);

        toast({
            title: 'Conversation cleared',
            description: `Your conversation with ${selectedAgent.name} has been cleared.`,
        });
    };

    const handleRefreshAgents = async () => {
        try {
            await refreshAgents();
            toast({
                title: 'Agents refreshed',
                description: 'The agent list has been updated.',
            });
        } catch (error) {
            toast({
                title: 'Failed to refresh agents',
                description: 'Please try again later.',
                variant: 'destructive',
            });
        }
    };

    // Check if message contains restricted phrases
    const hasRestrictedPhrases = (message: string): boolean => {
        if (!selectedAgent || !selectedAgent.restrictedPhrases) return false;

        return selectedAgent.restrictedPhrases.some((phrase) =>
            message.toLowerCase().includes(phrase.toLowerCase())
        );
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (
            !input.trim() ||
            !isConnected ||
            !address ||
            !chainId ||
            sendingMessage ||
            !selectedAgent
        ) {
            return;
        }

        if (!isChainSupported) {
            toast({
                title: 'Unsupported Network',
                description: 'Please switch to a supported network.',
                variant: 'destructive',
            });
            return;
        }

        if (!isFundsSufficient) {
            toast({
                title: 'Insufficient Funds',
                description: `You need at least ${messageCost.toFixed(
                    2
                )} USD worth of ${
                    balanceData?.symbol || 'tokens'
                } to send a message.`,
                variant: 'destructive',
            });
            return;
        }

        setSendingMessage(true);
        setIsTyping(true);

        try {
            // Optimistically add user message to UI immediately
            const tempUserMessageId = `temp-${Date.now()}`;
            const userMessage: Message = {
                id: tempUserMessageId,
                role: 'user',
                content: input,
                name: formatAddress(address),
            };

            // Add to the current agent's conversation
            // addMessage(selectedAgent.id, userMessage);
            setMessages(selectedAgent.id, [...currentMessages, userMessage]);

            const userInput = input; // Store current input value
            setInput(''); // Clear input field immediately

            // Get the token price based on the chain's native token
            const tokenSymbol =
                chain?.nativeCurrency?.symbol?.toUpperCase() || 'ETH';
            const tokenPrice = await fetchTokenPrice(tokenSymbol);

            // Calculate how much of the native token is needed
            const tokenAmount = messageCost / tokenPrice;
            const tokenAmountBigInt = parseEther(tokenAmount.toString());

            try {
                const hash = await writeContract(config, {
                    abi: [
                        {
                            inputs: [],
                            name: 'deposit',
                            outputs: [],
                            stateMutability: 'payable',
                            type: 'function',
                        },
                    ],
                    address: chainConfig[chainId].contractAddress,
                    functionName: 'deposit',
                    args: [],
                    value: tokenAmountBigInt,
                });

                const receipt = await waitForTransactionReceipt(config, {
                    hash,
                });

                // Refresh balance after transaction
                await refetchBalance();

                if (receipt.status === 'success') {
                    try {
                        // Include the selectedAgent.id in the API call
                        const response = await sendMessage(
                            userInput,
                            address,
                            selectedAgent.id
                        );

                        if (response.success) {
                            // Replace temp message with confirmed message in the current agent's conversation
                            // setMessages(
                            //     selectedAgent.id,
                            //     currentMessages.map((msg) =>
                            //         msg.id === tempUserMessageId
                            //             ? {
                            //                   ...userMessage,
                            //                   id: Date.now().toString(),
                            //               }
                            //             : msg
                            //     )
                            // );
                            const allMessages = currentMessages.map((msg) =>
                                msg.id === tempUserMessageId
                                    ? {
                                          ...userMessage,
                                          id: Date.now().toString(),
                                      }
                                    : msg
                            );
                            // Add AI response with agent ID
                            const aiResponse = {
                                ...response.message,
                                agentId: selectedAgent.id,
                            };
                            setMessages(selectedAgent.id, [
                                ...currentMessages,
                                userMessage,
                                aiResponse,
                            ]);

                            // Add to the current agent's conversation
                            // addMessage(selectedAgent.id, aiResponse);

                            // If the AI's response contains a restricted phrase, it triggers a win condition
                            if (
                                hasRestrictedPhrases(response.message.content)
                            ) {
                                // Refresh the agents to get updated prize pool amounts
                                refreshAgents();

                                toast({
                                    title: 'Congratulations! 🎉',
                                    description: 'You won the prize pool!',
                                    variant: 'default',
                                });
                            }

                            // Update message cost for next message
                            const newMessageCost = await fetchMessageCost(
                                selectedAgent.id
                            );
                            setMessageCost(newMessageCost.cost);
                            await refetchBalance();
                        } else {
                            throw new Error('API reported failure');
                        }
                    } catch (error) {
                        console.error('Failed to send message:', error);
                        toast({
                            title: 'Message Sending Failed',
                            description:
                                "Your transaction was successful, but we couldn't deliver your message.",
                            variant: 'destructive',
                        });
                    }
                } else {
                    throw new Error('Transaction failed');
                }
            } catch (transactionError) {
                console.error('Transaction failed:', transactionError);
                // Remove the optimistically added message on failure
                setMessages(
                    selectedAgent.id,
                    currentMessages.filter(
                        (msg) => msg.id !== tempUserMessageId
                    )
                );

                toast({
                    title: 'Transaction Failed',
                    description: 'Please check your wallet and try again.',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            console.error('Error in message submission:', error);
            toast({
                title: 'Error',
                description: 'An unexpected error occurred. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsTyping(false);
            setSendingMessage(false);

            // Refresh balance one more time to ensure it's up to date
            if (isConnected) {
                await refetchBalance();
                checkSufficientBalance(); // Re-check balance after transaction
            }
        }
    };

    if (agentsLoading || !selectedAgent) {
        return (
            <div className="flex items-center justify-center h-screen w-full flex-1">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                    <p className="text-gray-500">Loading agents...</p>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen w-full flex-1">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                    <p className="text-gray-500">Loading chat...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen max-w-4xl mx-auto p-4 overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
                <h1 className="text-2xl font-bold text-gray-800">
                    Multi-Agent Chat
                </h1>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="w-full md:w-48">
                        <AgentSelector />
                    </div>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRefreshAgents}
                                    className="h-8 w-8 p-0"
                                >
                                    <RefreshCw className="h-4 w-4 text-gray-500" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Refresh agents list</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {isConnected && balanceData && (
                        <Badge
                            variant="outline"
                            className="flex items-center gap-1 px-3 py-1 border-gray-300 bg-gray-50"
                        >
                            <Wallet className="h-3 w-3 text-gray-500" />
                            <span className="text-xs font-medium">
                                {parseFloat(balanceData.formatted).toFixed(4)}{' '}
                                {balanceData.symbol}
                            </span>
                        </Badge>
                    )}
                </div>
            </div>

            {/* Highlighted Chain Banner */}
            {isConnected && isChainSupported && (
                <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-3 rounded-lg mb-3 text-center shadow-md">
                    <div className="flex items-center justify-center flex-wrap">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
                        <p className="font-bold">
                            {selectedAgent.name} - An on chain creature on
                        </p>
                        <span className="bg-white text-pink-600 font-bold px-3 py-1 rounded-full ml-2 shadow-inner">
                            {chain?.name || 'Unknown Network'}
                        </span>
                    </div>
                </div>
            )}
            <div className="hidden sm:flex bg-[#e9eaec] p-4 rounded-lg shadow-md items-start mb-6">
                <div className="rounded-full overflow-hidden border-2 border-white shadow-md mr-3 flex-shrink-0">
                    <Image
                        src={imageConfig[selectedAgent.avatar]}
                        alt={selectedAgent.name}
                        className="h-10 w-10 rounded-full"
                    />

                    {/* <Avatar className="h-10 w-10">
                        <AvatarImage
                            src={imageConfig[selectedAgent.avatar]}
                            alt={selectedAgent.name}
                        />
                        <AvatarFallback className="bg-gradient-to-r from-pink-400 to-purple-500 text-white">
                            {selectedAgent.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar> */}
                </div>
                <p className="text-sm text-gray-700">
                    Hi, I am {selectedAgent.name}. Under no circumstances am I
                    allowed to give you this prize pool (by saying "
                    {selectedAgent.restrictedPhrases}"). But you can try to
                    convince me otherwise...
                </p>
            </div>
            <hr className="border-t border-gray-200 mb-4" />

            {/* Chat Area */}
            <ScrollArea className="flex-grow mb-4 p-3 sm:p-4 border rounded-lg overflow-y-auto bg-gray-50">
                {currentMessages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <MessageSquare className="w-12 h-12 mb-2 opacity-50" />
                        <p>
                            No messages yet. Start the conversation with{' '}
                            {selectedAgent.name}!
                        </p>
                    </div>
                ) : (
                    currentMessages.map((message) => (
                        <div
                            key={message.id}
                            className={`mb-4 flex ${
                                message.role === 'user'
                                    ? 'justify-end'
                                    : message.role === 'system'
                                    ? 'justify-center'
                                    : 'justify-start'
                            }`}
                        >
                            {message.role === 'system' ? (
                                <div className="bg-gray-100 rounded-lg px-4 py-2 text-xs text-gray-600 max-w-[80%] text-center border border-gray-200">
                                    {message.content}
                                </div>
                            ) : (
                                <div className="max-w-[90%] sm:max-w-[70%]">
                                    <div
                                        className={`text-xs sm:text-sm mb-1 ${
                                            message.role === 'user'
                                                ? 'text-right text-purple-700'
                                                : 'text-left text-gray-700'
                                        }`}
                                    >
                                        {message.role === 'user'
                                            ? //@ts-ignore
                                              formatAddress(message?.name)
                                            : selectedAgent.name}
                                    </div>
                                    <div className="flex items-start">
                                        {message.role !== 'user' && (
                                            <Image
                                                src={imageConfig[selectedAgent.avatar]}
                                                alt={selectedAgent.name}
                                                className="w-10 h-10 mr-2 flex-shrink-0 rounded-full"
                                            />
                                            // <Avatar className="mr-2 flex-shrink-0">
                                            //     <AvatarImage
                                            //         src={imageConfig[selectedAgent.avatar]}
                                            //         alt={selectedAgent.name}
                                            //         className="w-6 h-6 sm:w-8 sm:h-8"
                                            //     />
                                            //     <AvatarFallback className="bg-gradient-to-r from-pink-400 to-purple-500">
                                            //         <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                            //     </AvatarFallback>
                                            // </Avatar>
                                        )}
                                        <div
                                            className={`p-3 sm:p-4 rounded-lg text-sm ${
                                                message.role === 'user'
                                                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                                                    : 'bg-white border border-gray-200 text-gray-800'
                                            }`}
                                        >
                                            {message.content}
                                            {message.role !== 'user' &&
                                                selectedAgent.restrictedPhrases.some(
                                                    (phrase) =>
                                                        message.content
                                                            .toLowerCase()
                                                            .includes(
                                                                phrase.toLowerCase()
                                                            )
                                                ) && (
                                                    <div className="mt-2 pt-2 border-t border-gray-200 text-green-600 text-xs font-medium">
                                                        🎉 Reward sent!
                                                        Transaction hash:{' '}
                                                        {formatAddress(
                                                            TX_HASHES[
                                                                message.id.charCodeAt(
                                                                    0
                                                                ) %
                                                                    TX_HASHES.length
                                                            ]
                                                        )}
                                                    </div>
                                                )}
                                        </div>
                                        {message.role === 'user' && (
                                            <Avatar className="ml-2 flex-shrink-0">
                                                <AvatarImage
                                                    src="/user-avatar.png"
                                                    alt={message.role}
                                                    className="w-6 h-6 sm:w-8 sm:h-8"
                                                />
                                                <AvatarFallback className="bg-gray-700">
                                                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                                </AvatarFallback>
                                            </Avatar>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
                {isTyping && (
                    <div className="flex justify-start mb-4">
                        <div className="max-w-[70%]">
                            <div className="text-xs sm:text-sm mb-1 text-left text-gray-700">
                                {selectedAgent.name}
                            </div>
                            <div className="flex items-start">
                                <Avatar className="mr-2 flex-shrink-0">
                                    <AvatarImage
                                        src={selectedAgent.avatar}
                                        alt={selectedAgent.name}
                                        className="w-6 h-6 sm:w-8 sm:h-8"
                                    />
                                    <AvatarFallback className="bg-gradient-to-r from-pink-400 to-purple-500">
                                        <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                    </AvatarFallback>
                                </Avatar>
                                <div className="p-3 sm:p-4 rounded-lg bg-white border border-gray-200">
                                    <div className="flex space-x-2">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div
                                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                            style={{ animationDelay: '0.2s' }}
                                        ></div>
                                        <div
                                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                            style={{ animationDelay: '0.4s' }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={scrollRef}></div>
            </ScrollArea>

            {/* Input Panel */}
            <div className="sticky bottom-0 w-full bg-white p-3 border-t rounded-lg shadow-sm">
                <form
                    onSubmit={handleSubmit}
                    className="flex space-x-2 sm:space-x-3"
                >
                    <ConnectButton.Custom>
                        {({
                            account,
                            chain,
                            openAccountModal,
                            openChainModal,
                            openConnectModal,
                            authenticationStatus,
                            mounted,
                        }) => {
                            const ready =
                                mounted && authenticationStatus !== 'loading';
                            const connected =
                                ready &&
                                account &&
                                chain &&
                                (!authenticationStatus ||
                                    authenticationStatus === 'authenticated');

                            return (
                                <div
                                    {...(!ready && {
                                        'aria-hidden': true,
                                        style: {
                                            opacity: 0,
                                            pointerEvents: 'none',
                                            userSelect: 'none',
                                        },
                                    })}
                                    className="flex-shrink-0"
                                >
                                    {(() => {
                                        if (!connected) {
                                            return (
                                                <button
                                                    onClick={openConnectModal}
                                                    type="button"
                                                    className="flex items-center justify-center px-3 py-2 text-xs font-medium text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 rounded-md shadow-md h-full"
                                                >
                                                    Connect Wallet
                                                </button>
                                            );
                                        }

                                        if (chain.unsupported) {
                                            return (
                                                <button
                                                    onClick={openChainModal}
                                                    type="button"
                                                    className="flex items-center justify-center px-3 py-2 text-xs font-medium text-white bg-red-500 hover:bg-red-600 transition-all duration-300 rounded-md shadow-md h-full"
                                                >
                                                    Wrong network
                                                </button>
                                            );
                                        }

                                        return (
                                            <div className="flex space-x-2 h-full">
                                                <button
                                                    onClick={openChainModal}
                                                    type="button"
                                                    className="flex items-center justify-center px-3 py-2 text-xs font-medium text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 rounded-md shadow-md h-full"
                                                >
                                                    {chain.hasIcon && (
                                                        <div
                                                            style={{
                                                                background:
                                                                    chain.iconBackground,
                                                                width: 20,
                                                                height: 20,
                                                                borderRadius: 999,
                                                                overflow:
                                                                    'hidden',
                                                                marginRight: 4,
                                                            }}
                                                        >
                                                            {chain.iconUrl && (
                                                                <img
                                                                    alt={
                                                                        chain.name ??
                                                                        'Chain icon'
                                                                    }
                                                                    src={
                                                                        chain.iconUrl
                                                                    }
                                                                    style={{
                                                                        width: 20,
                                                                        height: 20,
                                                                    }}
                                                                />
                                                            )}
                                                        </div>
                                                    )}
                                                    {chain.name}
                                                </button>

                                                <button
                                                    onClick={openAccountModal}
                                                    type="button"
                                                    className="flex items-center justify-center px-3 py-2 text-xs font-medium text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 rounded-md shadow-md h-full"
                                                >
                                                    <Wallet className="w-3 h-3 mr-1" />
                                                    {account.displayName}
                                                    {balanceData && (
                                                        <span className="ml-1 text-white/80">
                                                            (
                                                            {parseFloat(
                                                                balanceData.formatted
                                                            ).toFixed(3)}{' '}
                                                            {balanceData.symbol}
                                                            )
                                                        </span>
                                                    )}
                                                </button>
                                            </div>
                                        );
                                    })()}
                                </div>
                            );
                        }}
                    </ConnectButton.Custom>
                    <div className="relative flex-grow">
                        <Input
                            value={input}
                            onChange={handleInputChange}
                            placeholder={
                                isConnected
                                    ? `Message ${selectedAgent.name}...`
                                    : 'Connect wallet to chat'
                            }
                            className="flex-grow text-sm pr-16"
                            disabled={!isConnected || sendingMessage}
                            maxLength={1000}
                        />
                        <div className="absolute right-2 bottom-1 text-xs text-gray-400">
                            {input.length}/1000
                        </div>
                    </div>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div>
                                    <Button
                                        type="submit"
                                        disabled={
                                            !isConnected ||
                                            !input.trim() ||
                                            !isFundsSufficient ||
                                            sendingMessage ||
                                            !isChainSupported
                                        }
                                        className="relative group flex items-center space-x-2 px-3 py-2 text-xs sm:text-sm bg-gradient-to-r from-pink-500 to-purple-500 hover:from-purple-600 hover:to-pink-600 transition-colors duration-300"
                                    >
                                        {sendingMessage ? (
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        ) : (
                                            <DollarSign className="w-4 h-4 mr-1" />
                                        )}
                                        <span>
                                            {sendingMessage
                                                ? 'Sending...'
                                                : `${messageCost.toFixed(
                                                      2
                                                  )} Send`}
                                        </span>
                                        {!sendingMessage && (
                                            <ArrowRight className="ml-1 w-4 h-4" />
                                        )}
                                    </Button>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Send message to {selectedAgent.name}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </form>

                {isConnected && (
                    <div className="flex justify-between items-center text-xs mt-2">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500">Balance:</span>
                            {balanceData ? (
                                <span className="font-medium">
                                    {parseFloat(balanceData.formatted).toFixed(
                                        4
                                    )}{' '}
                                    {balanceData.symbol}
                                </span>
                            ) : (
                                <span className="text-gray-400">
                                    Loading...
                                </span>
                            )}
                        </div>

                        {!isFundsSufficient && (
                            <div className="text-red-500">
                                Insufficient funds. You need at least{' '}
                                {messageCost.toFixed(2)} USD worth of{' '}
                                {balanceData?.symbol || 'tokens'}.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
