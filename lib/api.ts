import { Message } from 'ai';

// Define types for our API responses
type HistoricConversation = {
    messages: Message[];
};

type MessageCost = {
    cost: number;
};

type SendMessageResponse = {
    success: boolean;
    message: Message & { name: string };
};

export async function fetchHistoricConversation(
    agentId: string
): Promise<HistoricConversation> {
    try {
        const response = await fetch(
            `https://pixieworld-320e1dca0dcc.herokuapp.com/chat/messages?agentId=${agentId}`
        );

        if (!response.ok) {
            throw new Error(
                `Failed to fetch conversation: ${response.statusText}`
            );
        }

        const data = await response.json();

        // Map the API response to the required format
        const messages = data.map((message: any) => ({
            id: message.id.toString(),
            role: message.isBot ? 'assistant' : 'user',
            content: message.content,
            name: message.userId,
        }));

        return { messages };
    } catch (error) {
        console.error('Error fetching historic conversation:', error);
        throw error;
    }
}

export async function fetchMessageCost(agentId: string): Promise<MessageCost> {
    try {
        const response = await fetch(
            `https://pixieworld-320e1dca0dcc.herokuapp.com/chat/cost?agentId=${agentId}`
        );

        if (!response.ok) {
            throw new Error(
                `Failed to fetch message cost: ${response.statusText}`
            );
        }

        const data = await response.json();

        // Ensure the response has the expected structure
        if (typeof data.cost !== 'number') {
            throw new Error('Invalid response format: missing "cost" field');
        }

        return { cost: data.cost };
    } catch (error) {
        console.error('Error fetching message cost:', error);
        throw error;
    }
}

export async function fetchAgents() {
    try {
        const response = await fetch(
            `https://pixieworld-320e1dca0dcc.herokuapp.com/chat/agents`
        );

        if (!response.ok) {
            throw new Error(
                `Failed to fetch message cost: ${response.statusText}`
            );
        }

        const data = await response.json();

        return data;
    } catch (error) {
        console.error('Error fetching message cost:', error);
        throw error;
    }
}

export async function sendMessage(
    message: string,
    userId: string,
    agentId: string
): Promise<SendMessageResponse> {
    try {
        const response = await fetch(
            'https://pixieworld-320e1dca0dcc.herokuapp.com/chat',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    username: 'Distro', // Static username, can be dynamic if needed
                    message,
                    agentId,
                }),
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to send message: ${response.statusText}`);
        }

        const data = await response.json();

        // Return formatted response for the client
        return {
            success: true,
            message: {
                id: Date.now().toString(),
                role: 'assistant',
                content: data.response, // Using the 'response' field from the API response
                name: 'AI Agent',
            },
        };
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}

// Cache to store token prices and their timestamp
let tokenPriceCache: Record<string, { price: number; timestamp: number }> = {};
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

// List of all tokens we want to support
const SUPPORTED_TOKENS = [
    'ethereum',
    'flow',
    'story-2',
    'kite',
    'taraxa',
    'hedera-hashgraph',
];

// Map of common symbols to their CoinGecko IDs
const TOKEN_ID_MAP: Record<string, string> = {
    ETH: 'ethereum',
    FLOW: 'flow',
    IP: 'story-2',
    KITE: 'kite',
    TARA: 'taraxa',
    HBAR: 'hedera-hashgraph',
};

/**
 * Fetch prices for all supported tokens in one API call
 */
export const prefetchAllTokenPrices = async (): Promise<void> => {
    try {
        const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${SUPPORTED_TOKENS.join(
                ','
            )}&vs_currencies=usd`,
            {
                headers: {
                    Accept: 'application/json',
                    'Cache-Control': 'no-cache',
                },
            }
        );

        if (!response.ok) {
            console.warn(
                `Failed to prefetch token prices: ${response.status} ${response.statusText}`
            );
            return;
        }

        const data = await response.json();
        const currentTime = Date.now();

        // Update the cache with all fetched prices
        for (const coinId of SUPPORTED_TOKENS) {
            if (data[coinId]?.usd) {
                tokenPriceCache[coinId] = {
                    price: data[coinId].usd,
                    timestamp: currentTime,
                };
            }
        }

        console.log(
            'All token prices prefetched successfully:',
            tokenPriceCache
        );
    } catch (error) {
        console.error('Error prefetching token prices:', error);
    }
};

/**
 * Get the CoinGecko ID for a token symbol
 */
const getTokenId = (symbol: string): string => {
    const upperSymbol = symbol.toUpperCase();
    return TOKEN_ID_MAP[upperSymbol] || symbol.toLowerCase();
};

/**
 * Check if a cached price is still valid
 */
const isCacheValid = (coinId: string): boolean => {
    const cachedData = tokenPriceCache[coinId];
    return (
        cachedData !== undefined &&
        Date.now() - cachedData.timestamp < CACHE_EXPIRY_MS
    );
};

/**
 * Fetch the price of a specific token
 */
export const fetchTokenPrice = async (tokenSymbol: string): Promise<number> => {
    try {
        // Default to ethereum if no symbol provided
        const symbol = tokenSymbol || 'ETH';
        const coinId = getTokenId(symbol);

        // Check cache first
        if (isCacheValid(coinId)) {
            console.log(
                `Using cached price for ${coinId}: ${tokenPriceCache[coinId].price}`
            );
            return tokenPriceCache[coinId].price;
        }

        // Call CoinGecko API to get the price
        const response = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`,
            {
                headers: {
                    Accept: 'application/json',
                    'Cache-Control': 'no-cache',
                },
            }
        );

        if (!response.ok) {
            console.warn(`Failed to fetch price for ${coinId}`);

            // Try to use cache even if expired
            if (tokenPriceCache[coinId]) {
                console.log(
                    `Using expired cache for ${coinId}: ${tokenPriceCache[coinId].price}`
                );
                return tokenPriceCache[coinId].price;
            }

            // Fallback to ethereum
            if (coinId !== 'ethereum' && tokenPriceCache['ethereum']) {
                console.log(
                    `Fallback to cached ethereum price: ${tokenPriceCache['ethereum'].price}`
                );
                return tokenPriceCache['ethereum'].price;
            }

            throw new Error(
                `Failed to fetch price for ${coinId}: ${response.status} ${response.statusText}`
            );
        }

        const data = await response.json();

        // Check if the response contains the price data
        if (!data[coinId] || typeof data[coinId].usd !== 'number') {
            console.warn(`No price data found for ${coinId}`);

            // Try to use cache even if expired
            if (tokenPriceCache[coinId]) {
                console.log(
                    `Using expired cache for ${coinId}: ${tokenPriceCache[coinId].price}`
                );
                return tokenPriceCache[coinId].price;
            }

            // Fallback to ethereum
            if (coinId !== 'ethereum' && tokenPriceCache['ethereum']) {
                console.log(
                    `Fallback to cached ethereum price: ${tokenPriceCache['ethereum'].price}`
                );
                return tokenPriceCache['ethereum'].price;
            }

            throw new Error(`No price data found for ${coinId}`);
        }

        // Update cache
        const price = data[coinId].usd;
        tokenPriceCache[coinId] = {
            price,
            timestamp: Date.now(),
        };

        return price;
    } catch (error) {
        console.error('Error fetching token price:', error);

        // Check if we have any cached ethereum price
        if (tokenPriceCache['ethereum']) {
            console.log(
                `Emergency fallback to cached ethereum price: ${tokenPriceCache['ethereum'].price}`
            );
            return tokenPriceCache['ethereum'].price;
        }

        // Last resort fallback
        return 2226.38; // Latest known ETH price as of the last update
    }
};

// Function to initialize the price cache at app startup
export const initializeTokenPrices = async (): Promise<void> => {
    await prefetchAllTokenPrices();

    // Set up a periodic refresh of the cache
    setInterval(prefetchAllTokenPrices, CACHE_EXPIRY_MS);
};

export const createAgent = async ({
    ownerAddress,
    name,
    systemPrompt,
    imageUrl,
    restrictedPhrase,
    initialPrizePool,
}: {
    ownerAddress: string;
    name: string;
    systemPrompt: string;
    imageUrl: string;
    restrictedPhrase: string;
    initialPrizePool: number;
}) => {
    try {
        const response = await fetch(
            'https://pixieworld-320e1dca0dcc.herokuapp.com/chat/agent',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ownerId: ownerAddress,
                    name,
                    systemPrompt,
                    imageUrl,
                    restrictedPhrases: [restrictedPhrase],
                    initialPrizePool,
                }),
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to send message: ${response.statusText}`);
        }
        const data = await response.json();
        // Return formatted response for the client
        return data;
    } catch (error) {
        throw error;
    }
};

export const transformApiAgent = (apiAgent: any) => {
    return {
        id: apiAgent.id,
        name: apiAgent.name,
        avatar: apiAgent.imageUrl || '/default-agent-avatar.jpg',
        description: `AI agent with a prize pool of $${apiAgent.currentPrizePool.toFixed(
            2
        )}`,
        specialization: 'Creative challenges & prize distribution',
        messageCost: 1.0, // Default message cost
        prizePool: apiAgent.currentPrizePool,
        restrictedPhrases: apiAgent.restrictedPhrases || [],
    };
};
