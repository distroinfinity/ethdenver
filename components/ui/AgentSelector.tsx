// components/ui/AgentSelector.tsx
import React, { useState } from 'react';
import { Check, ChevronDown, Loader2 } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAgentContext } from './AgentContextProvider';

const AgentSelector: React.FC = () => {
  const { agents, selectedAgent, setSelectedAgent, loading, error } = useAgentContext();
  const [isOpen, setIsOpen] = useState(false);

  if (loading) {
    return (
      <Button 
        variant="outline" 
        className="flex justify-between items-center w-full bg-white border border-gray-200 hover:bg-gray-50 px-3 py-2 rounded-md"
        disabled
      >
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
          <span className="font-medium text-sm">Loading agents...</span>
        </div>
      </Button>
    );
  }

  if (error || !selectedAgent) {
    return (
      <Button 
        variant="outline" 
        className="flex justify-between items-center w-full bg-white border border-gray-200 px-3 py-2 rounded-md text-red-500"
        disabled
      >
        <span className="font-medium text-sm">Error loading agents</span>
      </Button>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="flex justify-between items-center w-full bg-white border border-gray-200 hover:bg-gray-50 px-3 py-2 rounded-md"
        >
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={selectedAgent.avatar} alt={selectedAgent.name} />
              <AvatarFallback className="bg-gradient-to-r from-pink-400 to-purple-500 text-white text-xs">
                {selectedAgent.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium text-sm">{selectedAgent.name}</span>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-72 p-2">
        <div className="text-xs font-medium text-gray-500 mb-2 px-2">
          Select an Agent
        </div>
        {agents.map((agent) => (
          <DropdownMenuItem
            key={agent.id}
            className="flex items-start gap-3 p-2 rounded-md cursor-pointer hover:bg-gray-50"
            onClick={() => {
              setSelectedAgent(agent);
              setIsOpen(false);
            }}
          >
            <Avatar className="h-8 w-8 mt-0.5">
              <AvatarImage src={agent.avatar} alt={agent.name} />
              <AvatarFallback className="bg-gradient-to-r from-pink-400 to-purple-500 text-white">
                {agent.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex justify-between">
                <div className="font-medium text-sm">{agent.name}</div>
                {/* <div className="text-xs text-gray-500 font-medium">
                  ${agent.messageCost.toFixed(2)}
                </div> */}
              </div>
            </div>
            {selectedAgent.id === agent.id && (
              <Check className="h-4 w-4 text-green-500 mt-1" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AgentSelector;