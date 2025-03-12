"use client"
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAccount, useBalance, useContractWrite, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import TypeWriter from '../components/TypeWriter';
import { parseUnits } from 'ethers';
import { BaseError } from 'ethers';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  isTyping?: boolean;
  isLoading?: boolean;
}

interface LoadingModalProps {
  isOpen: boolean;
  message: string;
}

const LoadingModal = ({ isOpen, message }: LoadingModalProps) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="w-[500px] rounded-[32px] bg-gradient-to-b from-[rgba(44,49,58,0.15)] to-[rgba(0,0,0,0.5)] p-6 shadow-[0px_1px_1px_0px_hsla(0,0%,100%,0.12)_inset,0px_1px_2px_0px_hsla(0,0%,0%,0.08),0px_0px_0px_1px_hsla(0,0%,0%,1)]">
        <div className="bg-[hsla(160,6%,7%,1)] rounded-[24px] p-6 shadow-[0px_4px_4px_0px_hsla(0,0%,0%,0.50)_inset] relative overflow-hidden">
          {/* Background Pattern */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: "url(/images/DotPattern.svg)",
              backgroundSize: "32px 32px",
              backgroundRepeat: "repeat",
            }}
          />
          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#6E54FF]/20 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#6E54FF]/20 border-t-[#6E54FF]"></div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Processing</h3>
                <p className="text-gray-400 text-sm">{message}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const usdcAbi = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  }
] as const;

export default function CreatePage() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your AI assistant. I can help you create a trading agent. Just describe the type of agent you want, and I'll generate a name, bio, and lore for them.",
      isTyping: true
    }
  ]);
  const [isTyping, setIsTyping] = useState(true);
  const [agentData, setAgentData] = useState({
    name: '',
    bio: [] as string[],
    lore: [] as string[],
    image: null
  });
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [initialBuyAmount, setInitialBuyAmount] = useState('');
  const router = useRouter();
  const { address } = useAccount();
  const { data: usdcBalance } = useBalance({
    address,
    token: '0x267c72e9637AB47FB36ba50248e216311AAb5175'
  });
  const [isCreating, setIsCreating] = useState(false);
  const [creationStep, setCreationStep] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoadingModalOpen, setIsLoadingModalOpen] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  const { write: transferUsdc, data: transferData } = useContractWrite({
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as `0x${string}`,
    abi: usdcAbi,
    functionName: 'transfer'
  });

  const { isLoading: isTransferPending } = useWaitForTransactionReceipt({
    hash: transferData?.hash,
    onSuccess() {
      setIsLoadingModalOpen(false);
      setLoadingMessage('');
      // After successful transfer, proceed with agent creation
      handleCreateAgent();
    },
    onError() {
      setIsLoadingModalOpen(false);
      setLoadingMessage('');
      // Handle error - show error message etc.
    }
  });

  const { data: hash, isPending, error, writeContract } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isTyping) return;

    // Add user message
    const userMessage = { role: 'user' as const, content: prompt };
    setMessages(prev => [...prev, userMessage]);

    // Add loading message with new component
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: '',
      isLoading: true
    }]);

    setPrompt('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/generate-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      // Ensure data has the required properties
      if (!data.name || !Array.isArray(data.bio) || !Array.isArray(data.lore)) {
        throw new Error('Invalid response format from server');
      }
      
      // Remove loading message and add response
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isLoading);
        return [...filtered, {
          role: 'assistant',
          content: `I've created a trading agent based on your description! Here's what I came up with:

Name: ${data.name}

Bio:
${data.bio.map((item: string) => `• ${item}`).join('\n')}

Lore:
${data.lore.map((item: string) => `• ${item}`).join('\n')}

I've generated an AI portrait for your agent and updated all the details in the form. Feel free to modify them or ask me to generate another version!`,
          isTyping: true
        }];
      });

      setAgentData(prev => ({
        ...prev,
        name: data.name || '',
        bio: Array.isArray(data.bio) ? data.bio : [],
        lore: Array.isArray(data.lore) ? data.lore : [],
        image: data.image || null
      }));
    } catch (error) {
      console.error('Error generating agent:', error);
      setMessages(prev => {
        const filtered = prev.filter(msg => !msg.isLoading);
        return [...filtered, {
          role: 'assistant',
          content: "I apologize, but I encountered an error while generating the agent. Please try again.",
          isTyping: true
        }];
      });
      
      // Reset agent data on error
      setAgentData({
        name: '',
        bio: [],
        lore: [],
        image: null
      });
    }
  };

  const handleCreateAgent = async () => {
    if (!initialBuyAmount || !address) return;

    setIsCreating(true);
    try {
      // Step 1: Transfer USDC
      setCreationStep('Initiating USDC transfer...');
      const amount = parseUnits(initialBuyAmount.toString(), 6); // USDC has 6 decimals
      await transferUsdc?.({
        args: [address, amount]
      });

      // Step 2: Create Agent
      setCreationStep('Creating your trading agent...');
      const response = await fetch('/api/create-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...agentData,
          initialBuy: initialBuyAmount
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create agent');
      }

      // Step 3: Save Image
      setCreationStep('Saving agent portrait...');
      if (agentData.image) {
        const imageResponse = await fetch('/api/save-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUrl: agentData.image,
            name: agentData.name
          })
        });

        if (!imageResponse.ok) {
          throw new Error('Failed to save image');
        }
      }

      // Step 4: Update Descriptions
      setCreationStep('Finalizing agent details...');
      const updateDescResponse = await fetch('/api/update-descriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: agentData.name,
          description: agentData.bio[0] || 'Advanced trading agent with unique market strategies.'
        })
      });

      if (!updateDescResponse.ok) {
        throw new Error('Failed to update descriptions');
      }

      // Success
      setShowBuyModal(false);
      setShowSuccessModal(true);
      
      setTimeout(() => {
        setShowSuccessModal(false);
        router.push('/');
      }, 3000);

    } catch (error) {
      console.error('Error creating agent:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "❌ There was an error creating your agent. Please try again.",
        isTyping: true
      }]);
    } finally {
      setIsCreating(false);
      setCreationStep('');
      setShowBuyModal(false);
    }
  };

  // Handle typing completion for the last message
  const handleTypingComplete = () => {
    setIsTyping(false);
    setMessages(prev => prev.map((msg, idx) => 
      idx === prev.length - 1 ? { ...msg, isTyping: false } : msg
    ));
  };

  const handleInvestmentConfirm = async () => {
    if (!initialBuyAmount || !address) return;
    
    setShowBuyModal(false);
    setIsLoadingModalOpen(true);
    setLoadingMessage('Processing USDC transfer...');

    try {
      const amount = parseUnits(initialBuyAmount.toString(), 6);
      writeContract({
        address: '0x267c72e9637AB47FB36ba50248e216311AAb5175',
        abi: usdcAbi,
        functionName: 'transfer',
        args: ['0x0eA5493903cBce2aEBdd1B13fA4cDA697dd4fC14', amount],
      })
    } catch (error) {
      console.error('Transfer error:', error);
      setIsLoadingModalOpen(false);
      setLoadingMessage('');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "❌ There was an error processing your transfer. Please try again.",
        isTyping: true
      }]);
    }
  };

  useEffect(() => {
    if (isConfirmed) {
      // Don't close loading modal yet, continue with other steps
      setLoadingMessage('Creating your trading agent...');
      
      const createAgent = async () => {
        try {
          // Step 2: Create Agent
          const response = await fetch('/api/create-agent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...agentData,
              initialBuy: initialBuyAmount
            })
          });

          if (!response.ok) {
            throw new Error('Failed to create agent');
          }

          // Step 3: Save Image
          setLoadingMessage('Saving agent portrait...');
          if (agentData.image) {
            const imageResponse = await fetch('/api/save-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                imageUrl: agentData.image,
                name: agentData.name
              })
            });

            if (!imageResponse.ok) {
              throw new Error('Failed to save image');
            }
          }

          // Step 4: Update Descriptions
          setLoadingMessage('Finalizing agent details...');
          const updateDescResponse = await fetch('/api/update-descriptions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: agentData.name,
              description: agentData.bio[0] || 'Advanced trading agent with unique market strategies.'
            })
          });

          if (!updateDescResponse.ok) {
            throw new Error('Failed to update descriptions');
          }

          // All steps completed successfully
          setIsLoadingModalOpen(false);
          setShowSuccessModal(true);
          
          setTimeout(() => {
            setShowSuccessModal(false);
            router.push('/');
          }, 3000);

        } catch (error) {
          console.error('Error in agent creation process:', error);
          setIsLoadingModalOpen(false);
          setLoadingMessage('');
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: `❌ Error: ${error instanceof Error ? error.message : 'Failed to complete agent creation'}`,
            isTyping: true
          }]);
        }
      };

      createAgent();
    }
  }, [isConfirmed]);

  useEffect(() => {
    if (error) {
      setIsLoadingModalOpen(false);
      setLoadingMessage('');
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ Transaction failed: ${(error as BaseError).shortMessage || error.message}`,
        isTyping: true
      }]);
    }
  }, [error]);

  return (
    <div className="flex min-h-screen gap-6 p-6 pt-24">
      {/* Left Side - Chat Area */}
      <div className="flex-1 relative rounded-[32px] bg-gradient-to-b from-[rgba(44,49,58,0.15)] to-[rgba(0,0,0,0.5)] p-6 shadow-[0px_1px_1px_0px_hsla(0,0%,100%,0.12)_inset,0px_1px_2px_0px_hsla(0,0%,0%,0.08),0px_0px_0px_1px_hsla(0,0%,0%,1)]">
        <div className="h-full bg-[hsla(160,6%,7%,1)] rounded-[24px] p-6 shadow-[0px_4px_4px_0px_hsla(0,0%,0%,0.50)_inset] relative overflow-hidden">
          {/* Background Pattern */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: "url(/images/DotPattern.svg)",
              backgroundSize: "32px 32px",
              backgroundRepeat: "repeat",
            }}
          />
          
          {/* Chat Content */}
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-[#6E54FF] text-white'
                        : 'bg-white/5 text-white/90'
                    }`}
                  >
                    {message.isLoading ? (
                      <div className="flex items-center gap-3">
                        <div className="relative w-6 h-6">
                          <div className="absolute inset-0 border-2 border-white/20 border-t-white/80 rounded-full animate-spin"></div>
                        </div>
                        <span className="text-white/80">Generating your agent...</span>
                      </div>
                    ) : message.role === 'user' || !message.isTyping ? (
                      <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>
                    ) : (
                      <TypeWriter 
                        content={message.content} 
                        onComplete={handleTypingComplete}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Input Area */}
            <form onSubmit={handlePromptSubmit} className="relative">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-black/20 rounded-full py-3 pl-4 pr-[120px] text-white placeholder-gray-500 border border-white/10 focus:border-[#6E54FF] focus:ring-1 focus:ring-[#6E54FF] transition-all outline-none"
                placeholder="Create me an agent about..."
              />
              <button
                type="submit"
                disabled={!prompt.trim() || isTyping}
                className={`absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  !prompt.trim() || isTyping
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-[#6E54FF] text-white hover:bg-[#5B44FF] shadow-[0px_1px_0.5px_0px_rgba(255,255,255,0.33)_inset,0px_1px_2px_0px_rgba(110,84,255,0.50),0px_0px_0px_1px_#5B44FF]'
                }`}
              >
                {isTyping ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 relative">
                      <div className="absolute inset-0 border-2 border-white/20 border-r-white/80 rounded-full animate-spin"></div>
                    </div>
                    <span>Generating...</span>
                  </div>
                ) : (
                  'Generate'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Right Side - Agent Details */}
      <div className="w-[400px] rounded-[32px] bg-gradient-to-b from-[rgba(44,49,58,0.15)] to-[rgba(0,0,0,0.5)] p-6 shadow-[0px_1px_1px_0px_hsla(0,0%,100%,0.12)_inset,0px_1px_2px_0px_hsla(0,0%,0%,0.08),0px_0px_0px_1px_hsla(0,0%,0%,1)]">
        <div className="h-full bg-[hsla(160,6%,7%,1)] rounded-[24px] p-6 shadow-[0px_4px_4px_0px_hsla(0,0%,0%,0.50)_inset] relative overflow-hidden">
          {/* Background Pattern */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: "url(/images/DotPattern.svg)",
              backgroundSize: "32px 32px",
              backgroundRepeat: "repeat",
            }}
          />

          {/* Agent Details Form */}
          <div className="relative z-10 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Agent Portrait
              </label>
              <div className="relative h-[200px] rounded-lg overflow-hidden bg-black/20">
                {agentData.image ? (
                  <Image
                    src={agentData.image}
                    alt="Agent Portrait"
                    fill
                    className="object-cover rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="mt-2 text-sm text-gray-400">Portrait will be generated</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Name
              </label>
              <input
                type="text"
                value={agentData.name}
                onChange={(e) => setAgentData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-black/20 rounded-lg py-2 px-3 text-white placeholder-gray-500 border border-white/10 focus:border-[#6E54FF] focus:ring-1 focus:ring-[#6E54FF] transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Bio
              </label>
              <textarea
                value={agentData.bio.join('\n')}
                onChange={(e) => setAgentData(prev => ({ ...prev, bio: e.target.value.split('\n') }))}
                rows={3}
                className="w-full bg-black/20 rounded-lg py-2 px-3 text-white placeholder-gray-500 border border-white/10 focus:border-[#6E54FF] focus:ring-1 focus:ring-[#6E54FF] transition-all outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Lore
              </label>
              <textarea
                value={agentData.lore.join('\n')}
                onChange={(e) => setAgentData(prev => ({ ...prev, lore: e.target.value.split('\n') }))}
                rows={3}
                className="w-full bg-black/20 rounded-lg py-2 px-3 text-white placeholder-gray-500 border border-white/10 focus:border-[#6E54FF] focus:ring-1 focus:ring-[#6E54FF] transition-all outline-none"
              />
            </div>

            <button
              onClick={() => setShowBuyModal(true)}
              className="w-full bg-[#6E54FF] text-white rounded-full py-3 px-4 font-medium hover:bg-[#5B44FF] transition-colors shadow-[0px_1px_0.5px_0px_rgba(255,255,255,0.33)_inset,0px_1px_2px_0px_rgba(110,84,255,0.50),0px_0px_0px_1px_#5B44FF] hover:shadow-[0px_1px_1px_0px_rgba(255,255,255,0.12)_inset,0px_1px_2px_0px_rgba(110,84,255,0.50),0px_0px_0px_1px_#5B44FF]"
            >
              Create Agent
            </button>
          </div>
        </div>
      </div>

      {/* Initial Buy Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-[500px] rounded-[32px] bg-gradient-to-b from-[rgba(44,49,58,0.15)] to-[rgba(0,0,0,0.5)] p-6 shadow-[0px_1px_1px_0px_hsla(0,0%,100%,0.12)_inset,0px_1px_2px_0px_hsla(0,0%,0%,0.08),0px_0px_0px_1px_hsla(0,0%,0%,1)]">
            <div className="bg-[hsla(160,6%,7%,1)] rounded-[24px] p-6 shadow-[0px_4px_4px_0px_hsla(0,0%,0%,0.50)_inset] relative overflow-hidden">
              {/* Background Pattern */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: "url(/images/DotPattern.svg)",
                  backgroundSize: "32px 32px",
                  backgroundRepeat: "repeat",
                }}
              />

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#6E54FF]/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#6E54FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Initial Investment</h3>
                    <p className="text-gray-400 text-sm">Set the starting amount for your trading agent</p>
                  </div>
                </div>
                
                <div className="space-y-6 mb-8">
                  <div className="bg-black/20 rounded-2xl p-4 border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">Your USDC Balance</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-white font-medium">
                          ${Number(usdcBalance?.formatted || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <input
                        type="number"
                        value={initialBuyAmount}
                        onChange={(e) => setInitialBuyAmount(e.target.value)}
                        placeholder="Enter amount in USDC"
                        className="w-full bg-black/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder-gray-500 border border-white/10 focus:border-[#6E54FF] focus:ring-1 focus:ring-[#6E54FF] transition-all outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</div>
                    </div>
                  </div>

                  <div className="bg-black/20 rounded-2xl p-4 border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">Tokens You'll Receive</span>
                      <span className="text-sm text-gray-400">(1 Token = $0.02 USDC)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#6E54FF]/20 flex items-center justify-center">
                        <svg className="w-4 h-4 text-[#6E54FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <span className="text-xl font-bold text-white">
                        {initialBuyAmount ? Math.floor(Number(initialBuyAmount) / 0.02).toLocaleString() : '0'} Tokens
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowBuyModal(false)}
                    disabled={isCreating}
                    className="flex-1 bg-[#6E54FF] text-white rounded-full py-3 px-4 font-medium hover:bg-[#5B44FF] transition-colors shadow-[0px_1px_0.5px_0px_rgba(255,255,255,0.33)_inset,0px_1px_2px_0px_rgba(110,84,255,0.50),0px_0px_0px_1px_#5B44FF] hover:shadow-[0px_1px_1px_0px_rgba(255,255,255,0.12)_inset,0px_1px_2px_0px_rgba(110,84,255,0.50),0px_0px_0px_1px_#5B44FF] opacity-50 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInvestmentConfirm}
                    disabled={!initialBuyAmount || Number(initialBuyAmount) <= 0 || isCreating}
                    className={`flex-1 rounded-full py-3 px-4 font-medium transition-all relative overflow-hidden ${
                      !initialBuyAmount || Number(initialBuyAmount) <= 0 || isCreating
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-[#6E54FF] text-white hover:bg-[#5B44FF] shadow-[0px_1px_0.5px_0px_rgba(255,255,255,0.33)_inset,0px_1px_2px_0px_rgba(110,84,255,0.50),0px_0px_0px_1px_#5B44FF] hover:shadow-[0px_1px_1px_0px_rgba(255,255,255,0.12)_inset,0px_1px_2px_0px_rgba(110,84,255,0.50),0px_0px_0px_1px_#5B44FF]'
                    }`}
                  >
                    {isCreating ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 relative">
                          <div className="absolute inset-0 border-2 border-white/20 border-t-white/80 rounded-full animate-spin"></div>
                        </div>
                        <span>{creationStep}</span>
                      </div>
                    ) : (
                      <span className="relative z-10">Confirm Investment</span>
                    )}
                    {!isCreating && initialBuyAmount && Number(initialBuyAmount) > 0 && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer bg-[length:200%_100%]" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-[500px] rounded-[32px] bg-gradient-to-b from-[rgba(44,49,58,0.15)] to-[rgba(0,0,0,0.5)] p-6 shadow-[0px_1px_1px_0px_hsla(0,0%,100%,0.12)_inset,0px_1px_2px_0px_hsla(0,0%,0%,0.08),0px_0px_0px_1px_hsla(0,0%,0%,1)]">
            <div className="bg-[hsla(160,6%,7%,1)] rounded-[24px] p-6 shadow-[0px_4px_4px_0px_hsla(0,0%,0%,0.50)_inset] relative overflow-hidden">
              {/* Background Pattern */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: "url(/images/DotPattern.svg)",
                  backgroundSize: "32px 32px",
                  backgroundRepeat: "repeat",
                }}
              />
              <div className="relative z-10 flex flex-col items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Success!</h3>
                    <p className="text-gray-400 text-sm">Your trading agent has been created and is ready to start.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <LoadingModal 
        isOpen={isLoadingModalOpen} 
        message={loadingMessage} 
      />
    </div>
  );
} 