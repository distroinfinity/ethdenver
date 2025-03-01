// components/AgentContextProvider.tsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { fetchAgents, transformApiAgent } from '@/lib/api';

// Define the Agent type based on the API response and our needs
export interface ApiAgent {
  id: string;
  name: string;
  systemPrompt: string;
  imageUrl: string | null;
  restrictedPhrases: string[];
  initialPrizePool: number;
  currentPrizePool: number;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
}

export interface Agent {
  id: string;
  name: string;
  avatar: string;
  description: string;
  specialization: string;
  messageCost: number;
  prizePool: number;
  restrictedPhrases: string[];
}

interface AgentContextType {
  agents: Agent[];
  selectedAgent: Agent | null;
  setSelectedAgent: (agent: Agent) => void;
  loading: boolean;
  error: string | null;
  refreshAgents: () => Promise<void>;
}

// Create context with default values
const AgentContext = createContext<AgentContextType>({
  agents: [],
  selectedAgent: null,
  setSelectedAgent: () => {},
  loading: true,
  error: null,
  refreshAgents: async () => {},
});

// Custom hook to use the agent context
export const useAgentContext = () => useContext(AgentContext);

// Default agent in case of error or loading
const defaultAgent: Agent = {
  id: 'default',
  name: 'Pixie',
  avatar: '/default-agent-avatar.jpg',
  description: 'AI agent with a prize pool',
  specialization: 'Creative challenges & prize distribution',
  messageCost: 1.00,
  prizePool: 15000,
  restrictedPhrases: ['I love you'],
};

export const AgentContextProvider: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAgents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const apiAgents = await fetchAgents();
      
      // Transform API agents to our Agent format
      const transformedAgents = apiAgents.map(transformApiAgent);
      
      setAgents(transformedAgents);
      
      // If we don't have a selected agent yet, select the first one
      if (!selectedAgent && transformedAgents.length > 0) {
        setSelectedAgent(transformedAgents[0]);
      }
    } catch (err) {
      console.error('Failed to load agents:', err);
      setError('Failed to load agents. Please try again later.');
      
      // If we have no agents, set a default one
      if (agents.length === 0) {
        setAgents([defaultAgent]);
        setSelectedAgent(defaultAgent);
      }
    } finally {
      setLoading(false);
    }
  };

  // Load agents on component mount
  useEffect(() => {
    loadAgents();
  }, []);

  return (
    <AgentContext.Provider
      value={{
        agents,
        selectedAgent,
        setSelectedAgent,
        loading,
        error,
        refreshAgents: loadAgents
      }}
    >
      {children}
    </AgentContext.Provider>
  );
};