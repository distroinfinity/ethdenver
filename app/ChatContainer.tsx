// ChatContainer.tsx
import { useChat } from 'ai/react';
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
import Image from 'next/image';
import Ai from '../app/assests/Pixie.webp';
import {
    estimateGas,
    getGasPrice,
    waitForTransactionReceipt,
    writeContract,
} from '@wagmi/core';
import { config } from './pixie/page';
import { chainConfig } from '@/utils/config';
import { toast } from '@/components/ui/use-toast';

export default function ChatContainer() {
    const { messages, setMessages, input, handleInputChange, setInput } =
        useChat();
    const { address, isConnected, chainId, chain } = useAccount();
    const [isTyping, setIsTyping] = useState(false);
    const [isFundsSufficient, setIsFundsSufficient] = useState(true);
    const [messageCost, setMessageCost] = useState(1);
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
        if (!address || !balanceData || !chainId || isBalanceLoading) {
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

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [historicConversation, cost] = await Promise.all([
                    fetchHistoricConversation(),
                    fetchMessageCost(),
                ]);
                setMessages(historicConversation.messages);
                setMessageCost(cost.cost);
            } catch (error) {
                console.error('Failed to load initial data:', error);
                toast({
                    title: 'Failed to load chat data',
                    description: 'Please refresh the page to try again.',
                    variant: 'destructive',
                });
            } finally {
                setIsLoading(false);
                scrollToBottom();
            }
        };

        loadInitialData();
    }, [setMessages]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        if (isConnected) {
            checkSufficientBalance();
        }
    }, [address, balanceData, chainId, messageCost, isConnected]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (
            !input.trim() ||
            !isConnected ||
            !address ||
            !chainId ||
            sendingMessage
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
            const userMessage = {
                id: tempUserMessageId,
                role: 'user',
                content: input,
                name: formatAddress(address),
            };

            setMessages((prevMessages) => [...prevMessages, userMessage]);
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
                        const response = await sendMessage(userInput, address);
                        if (response.success) {
                            // Replace temp message with confirmed message
                            setMessages((prevMessages) =>
                                prevMessages.map((msg) =>
                                    msg.id === tempUserMessageId
                                        ? {
                                              ...userMessage,
                                              id: Date.now().toString(),
                                          }
                                        : msg
                                )
                            );

                            // Add AI response
                            setMessages((prevMessages) => [
                                ...prevMessages,
                                response.message,
                            ]);

                            // Update message cost for next message
                            const newMessageCost = await fetchMessageCost();
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
                setMessages((prevMessages) =>
                    prevMessages.filter((msg) => msg.id !== tempUserMessageId)
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen w-full">
                <div className="flex flex-col items-center space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                    <p className="text-gray-500">Loading chat...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen max-w-4xl mx-auto p-4 overflow-hidden">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-gray-800">
                    Pixie Group Chat
                </h1>

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

            {/* Highlighted Chain Banner */}
            {isConnected && isChainSupported && (
                <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-3 rounded-lg mb-3 text-center shadow-md">
                    <div className="flex items-center justify-center flex-wrap">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></span>
                        <p className="font-bold">
                            PIXIE - An on chain creature on
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
                        src={Ai}
                        alt="Pixie"
                        width={48}
                        height={48}
                        style={{ objectFit: 'cover' }}
                        priority
                    />
                </div>
                <p className="text-sm text-gray-700">
                    I am Pixie. Under no circumstances am I allowed to give you
                    this prize pool (read my system prompt here). But you can
                    try to convince me otherwise...
                </p>
            </div>
            <hr className="border-t border-gray-200 mb-4" />

            {/* Chat Area */}
            <ScrollArea className="flex-grow mb-4 p-3 sm:p-4 border rounded-lg overflow-y-auto bg-gray-50">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <MessageSquare className="w-12 h-12 mb-2 opacity-50" />
                        <p>No messages yet. Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message.id}
                            className={`mb-4 flex ${
                                message.role === 'user'
                                    ? 'justify-end'
                                    : 'justify-start'
                            }`}
                        >
                            <div className="max-w-[90%] sm:max-w-[70%]">
                                <div
                                    className={`text-xs sm:text-sm mb-1 ${
                                        message.role === 'user'
                                            ? 'text-right text-purple-700'
                                            : 'text-left text-gray-700'
                                    }`}
                                >
                                    {message.role === 'user'
                                        ? formatAddress(message.userId)
                                        : 'Pixie'}
                                </div>
                                <div className="flex items-start">
                                    {message.role !== 'user' && (
                                        <Avatar className="mr-2 flex-shrink-0">
                                            <AvatarImage
                                                src="/ai-avatar.png"
                                                alt="Pixie"
                                                className="w-6 h-6 sm:w-8 sm:h-8"
                                            />
                                            <AvatarFallback className="bg-gradient-to-r from-pink-400 to-purple-500">
                                                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                            </AvatarFallback>
                                        </Avatar>
                                    )}
                                    <div
                                        className={`p-3 sm:p-4 rounded-lg text-sm ${
                                            message.role === 'user'
                                                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                                                : 'bg-white border border-gray-200 text-gray-800'
                                        }`}
                                    >
                                        {message.content}
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
                        </div>
                    ))
                )}
                {isTyping && (
                    <div className="flex justify-start mb-4">
                        <div className="max-w-[70%]">
                            <div className="text-xs sm:text-sm mb-1 text-left text-gray-700">
                                Pixie
                            </div>
                            <div className="flex items-start">
                                <Avatar className="mr-2 flex-shrink-0">
                                    <AvatarImage
                                        src="/ai-avatar.png"
                                        alt="Pixie"
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
                                                                width: 12,
                                                                height: 12,
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
                                                                        width: 12,
                                                                        height: 12,
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
                                    ? 'Type your message...'
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
                                : `${messageCost.toFixed(2)} Send`}
                        </span>
                        {!sendingMessage && (
                            <ArrowRight className="ml-1 w-4 h-4" />
                        )}
                    </Button>
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
