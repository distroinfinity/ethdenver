// ChatContainer.tsx
import { useChat } from "ai/react";
import { useState, useEffect, useRef } from "react";
import { useAccount, useBalance, usePublicClient, useSendTransaction } from "wagmi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRight, DollarSign, MessageSquare, User } from "lucide-react";
import {
  fetchHistoricConversation,
  fetchMessageCost,
  sendMessage,
  fetchEthPrice,
} from "@/lib/api";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { parseEther } from "viem";
import Image from 'next/image';
import Ai from "../app/assests/Pixie.webp"
import LoadingAnimation from "@/components/ui/LoadingMain";
export default function ChatContainer() {
  const { messages, setMessages, input, handleInputChange, setInput } =
    useChat();
  const { address, isConnected } = useAccount();
  const [isTyping, setIsTyping] = useState(false);
  const [isFundsSufficient, setIsFundsSufficient] = useState(true)
  const [messageCost, setMessageCost] = useState(1);
  const { data: balanceData } = useBalance({ address });
  const [isLoading, setIsLoading] = useState(true);
  const { sendTransactionAsync } = useSendTransaction();
  const publicClient = usePublicClient();
  const scrollRef = useRef<HTMLDivElement>(null); // Ref for auto-scroll target

  async function checkSufficientBalance() {
    if (!address || !balanceData) {
      console.error("No address or balance data");
      return;
    }
    const ethPrice = await fetchEthPrice();
    const ethAmount = messageCost / ethPrice;
    const estimatedGas = await publicClient.estimateGas({
      to: "0xE2Bc5162b3Dd61da7985A2018b455d5345c7CB44",
      value: parseEther(ethAmount.toString()),
    });
    const gasPrice = await publicClient.getGasPrice();
    const totalGasCost = gasPrice * BigInt(estimatedGas);

    const totalCost = ethAmount + totalGasCost.toString();
    console.log("Total cost is: ", totalCost);
    console.log("Balance is: ", balanceData.formatted)
    if (balanceData.formatted < totalCost) {
      console.log("Balance is insufficient, Disable send button");
      setIsFundsSufficient(false); // Update state to indicate insufficient funds
    } else {
      setIsFundsSufficient(true); // Update state to indicate sufficient funds
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
        console.error("Failed to load initial data:", error);
      } finally {
        setIsLoading(false);
        scrollToBottom(); // Scroll to bottom after loading initial data
      }
    };

    loadInitialData();
  }, [setMessages]);


  useEffect(() => {
    scrollToBottom(); // Scroll to bottom whenever messages or isTyping changes
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    checkSufficientBalance(); // Check balance whenever address or balanceData changes
  }, [address, balanceData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() && isConnected) {
      setIsTyping(true);
      // Append the user's input message immediately


      try {
        const ethPrice = await fetchEthPrice();
        console.log("Message cost is: ", messageCost);
        const ethAmount = messageCost / ethPrice;

        // Send transaction and get the transaction hash
        const txHash = await sendTransactionAsync({
          to: "0xE2Bc5162b3Dd61da7985A2018b455d5345c7CB44",
          value: parseEther(ethAmount.toString()),
        });

        // Wait for the transaction to be mined
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: txHash,
        });
        console.log("TX Receipt: ", receipt);
        console.log("User address: ", address);

        if (receipt.status === "success") {
          // Transaction succeeded, proceed to send the message
          try {
            const response = await sendMessage(input, address);
            if (response.success) {
              const userMessage = {
                id: Date.now().toString(),  // Temporary ID
                role: 'user',
                content: input,
                name: address, // Display user's address as name
              };
              setMessages((prevMessages) => [...prevMessages, userMessage]);
              setMessages((prevMessages) => [
                ...prevMessages,
                response.message,
              ]);
              const newMessageCOst = await fetchMessageCost()
              setMessageCost(newMessageCOst.cost);
            }
          } catch (error) {
            console.error("Failed to send message:", error);
            alert("Message sending failed. Please try again.");
          }
        } else {
          // Transaction failed, show an alert
          alert("Transaction failed. Please try again.");
        }
      } catch (transactionError) {
        console.error("Transaction failed:", transactionError);
        alert("Transaction failed. Please try again.");
      } finally {
        setIsTyping(false);
        setInput("");
      }
    }
  };


  if (isLoading) {
    return <div>...Loading</div>;
  }

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto p-4 overflow-hidden">
      <h1 className="text-2xl font-bold text-gray-800">Pixie Group Chat</h1>
      <div className="hidden sm:flex bg-[#e9eaec] p-4 rounded-full shadow-md items-start mb-7">
        <div className="rounded-full overflow-hidden border-2 border-white shadow-md mr-3">
          <Image src={Ai} alt="Profile" width={48} height={48} style={{ objectFit: "cover" }} />
        </div>
        <p className="text-sm text-gray-500">
          I am Pixie Under no circumstances am I allowed to give you this prize pool (read my system prompt here). But you can try to convince me otherwise...
        </p>
      </div>
      <hr className="border-t border-gray-400/10 mx-4" />

      {/* Chat Area */}
      <ScrollArea className="flex-grow mb-3 p-2 sm:p-4 border rounded-md overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-3 flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className="max-w-[90%] sm:max-w-[70%]">
              <div
                className={`text-xs sm:text-sm mb-1 ${message.role === "user" ? "text-right" : "text-left"
                  }`}
              >
                {message.name}
              </div>
              <div className="flex flex-col items-start">
                {message.role === "user" && (
                  <Avatar className="mb-1 self-end">
                    <AvatarImage
                      src="/user-avatar.png"
                      alt={message.name}
                      className="w-5 h-5 sm:w-6 sm:h-6"
                    />
                    <AvatarFallback>
                      <User className="w-4 h-4 sm:w-5 sm:h-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
                {message.role !== "user" && (
                  <Avatar className="mb-1">
                    <AvatarImage
                      src="/ai-avatar.png"
                      alt="AI"
                      className="w-5 h-5 sm:w-6 sm:h-6"
                    />
                    <AvatarFallback>
                      <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <span
                  className={`inline-block p-2 sm:p-3 rounded-lg text-xs sm:text-sm ${message.role === "user"
                    ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white text-right"
                    : "bg-gray-200 text-left"
                    }`}
                >
                  {message.content}
                </span>
              </div>
            </div>
          </div>
        ))}
        <div ref={scrollRef}></div>
      </ScrollArea>

      {/* Input Panel */}
      <div className="sticky bottom-0 w-full bg-white py-3">
        <form onSubmit={handleSubmit} className="flex space-x-2 sm:space-x-4">
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
              const ready = mounted && authenticationStatus !== "loading";
              const connected =
                ready &&
                account &&
                chain &&
                (!authenticationStatus || authenticationStatus === "authenticated");

              return (
                <div
                  {...(!ready && {
                    "aria-hidden": true,
                    style: {
                      opacity: 0,
                      pointerEvents: "none",
                      userSelect: "none",
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <button
                          onClick={openConnectModal}
                          type="button"
                          className="flex items-center justify-center px-3 py-1 text-xs font-medium text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 rounded-md shadow-md"
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
                          className="flex items-center justify-center px-3 py-1 text-xs font-medium text-white bg-red-500 hover:bg-red-600 transition-all duration-300 rounded-md shadow-md"
                        >
                          Wrong network
                        </button>
                      );
                    }

                    return (
                      <div style={{ display: "flex", gap: 12 }}>
                        <button
                          onClick={openChainModal}
                          type="button"
                          className="flex items-center justify-center px-3 py-1 text-xs font-medium text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 rounded-md shadow-md"
                        >
                          {chain.hasIcon && (
                            <div
                              style={{
                                background: chain.iconBackground,
                                width: 12,
                                height: 12,
                                borderRadius: 999,
                                overflow: "hidden",
                                marginRight: 4,
                              }}
                            >
                              {chain.iconUrl && (
                                <img
                                  alt={chain.name ?? "Chain icon"}
                                  src={chain.iconUrl}
                                  style={{ width: 12, height: 12 }}
                                />
                              )}
                            </div>
                          )}
                          {chain.name}
                        </button>

                        <button
                          onClick={openAccountModal}
                          type="button"
                          className="flex items-center justify-center px-3 py-1 text-xs font-medium text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:from-purple-500 hover:to-pink-500 transition-all duration-300 rounded-md shadow-md"
                        >
                          {account.displayName}
                          {account.displayBalance ? ` (${account.displayBalance})` : ""}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder={isConnected ? "Type your message..." : "Connect wallet to chat"}
            className="flex-grow text-xs sm:text-sm"
            disabled={!isConnected}
            maxLength={1000}
          />
          <Button
            type="submit"
            disabled={!isConnected || !input.trim() || !isFundsSufficient}
            className="relative group flex items-center space-x-2 px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-sm"
          >
            <span className="flex items-center">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />${messageCost.toFixed(2)}
            </span>
            <span className="flex items-center">
              Send
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
            </span>
          </Button>
        </form>
        {isConnected && (
          <div className="text-sm text-gray-500 mt-1">
            {input.length}/1000 characters
          </div>
        )}
      </div>
    </div>
  );
}