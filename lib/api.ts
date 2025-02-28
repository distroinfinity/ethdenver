import { Message } from 'ai'

// Define types for our API responses
type HistoricConversation = {
  messages: Message[]
}

type MessageCost = {
  cost: number
}

type SendMessageResponse = {
  success: boolean
  message: Message
}

export async function fetchHistoricConversation(): Promise<HistoricConversation> {
  try {
    const response = await fetch('https://pixieverse-2f9f04f21add.herokuapp.com/chat/messages');

    if (!response.ok) {
      throw new Error(`Failed to fetch conversation: ${response.statusText}`);
    }

    const data = await response.json();

    // Map the API response to the required format
    const messages = data.map((message: any) => ({
      id: message.id.toString(),
      role: message.isBot ? 'assistant' : 'user',
      content: message.content,
      name: message.user.username,
    }));

    return { messages };
  } catch (error) {
    console.error('Error fetching historic conversation:', error);
    throw error;
  }
}

export async function fetchMessageCost(): Promise<MessageCost> {
  try {
    const response = await fetch('https://pixieverse-2f9f04f21add.herokuapp.com/chat/cost');

    if (!response.ok) {
      throw new Error(`Failed to fetch message cost: ${response.statusText}`);
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

export async function sendMessage(message: string, userId: string): Promise<SendMessageResponse> {
  try {
    const response = await fetch('https://pixieverse-2f9f04f21add.herokuapp.com/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        username: 'Distro', // Static username, can be dynamic if needed
        message,
      }),
    });

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

export const fetchEthPrice = async (): Promise<number> => {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');

    if (!response.ok) {
      throw new Error('Failed to fetch ETH price');
    }

    const data = await response.json();
    const ethPrice = data.ethereum.usd;
    return ethPrice;
  } catch (error) {
    console.error('Error fetching ETH price:', error);
    throw new Error('Failed to fetch ETH price');
  }
};


