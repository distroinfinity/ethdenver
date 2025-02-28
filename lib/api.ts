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

export async function fetchHistoricConversation(): Promise<HistoricConversation> {
    try {
        const response = await fetch(
            'https://pixieverse-2f9f04f21add.herokuapp.com/chat/messages'
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

export async function fetchMessageCost(): Promise<MessageCost> {
    try {
        const response = await fetch(
            'https://pixieverse-2f9f04f21add.herokuapp.com/chat/cost'
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

export async function sendMessage(
    message: string,
    userId: string
): Promise<SendMessageResponse> {
    try {
        const response = await fetch(
            'https://pixieverse-2f9f04f21add.herokuapp.com/chat',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    username: 'Distro', // Static username, can be dynamic if needed
                    message,
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

export const fetchTokenPrice = async (tokenSymbol: string): Promise<number> => {
    try {
        // Default to ethereum if no symbol provided
        const symbol = tokenSymbol?.toLowerCase() || 'ethereum';

        // Map of common symbols to their CoinGecko IDs
        const tokenIdMap: Record<string, string> = {
            ETH: 'ethereum',
            FLOW: 'flow',
            IP: 'story-2',
        };

        // Use the map if the symbol is in it, otherwise use the provided symbol
        const coinId = tokenIdMap[symbol] || symbol;

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
            console.warn(
                `Failed to fetch price for ${coinId}, falling back to ethereum`
            );

            if (coinId !== 'ethereum') {
                return fetchTokenPrice('ethereum');
            }

            throw new Error(
                `Failed to fetch price for ${coinId}: ${response.status} ${response.statusText}`
            );
        }

        const data = await response.json();

        // Check if the response contains the price data
        if (!data[coinId] || typeof data[coinId].usd !== 'number') {
            console.warn(
                `No price data found for ${coinId}, falling back to ethereum`
            );

            if (coinId !== 'ethereum') {
                return fetchTokenPrice('ethereum');
            }

            throw new Error(`No price data found for ${coinId}`);
        }

        // Return the price in USD
        return data[coinId].usd;
    } catch (error) {
        console.error('Error fetching token price:', error);

        // Instead of a hardcoded fallback, try one more direct request for ethereum
        try {
            const emergencyResponse = await fetch(
                'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd',
                { cache: 'no-store' }
            );

            if (emergencyResponse.ok) {
                const emergencyData = await emergencyResponse.json();
                if (emergencyData.ethereum?.usd) {
                    console.log('Using emergency ethereum price fallback');
                    return emergencyData.ethereum.usd;
                }
            }
        } catch (emergencyError) {
            console.error('Emergency price fetch also failed:', emergencyError);
        }

        // Last resort fallback
        return 2226.38; // Latest known ETH price as of the last update
    }
};
