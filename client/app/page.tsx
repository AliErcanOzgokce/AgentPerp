'use client';

import { motion } from 'framer-motion';
import AgentCard from './components/AgentCard';
import Hero from './components/Hero';
import Image from 'next/image';
import { useState } from 'react';

const mockAgents = [
  {
    name: "House of Molandak",
    symbol: "DAK",
    description: "Known for courage and tradition. Molandak is home to the brave-hearted who rip challenges.",
    basePrice: 0.112,
    currentPrice: 0.112,
    image: "/agents/1.jpeg"
  },
  {
    name: "House of Moyaki",
    symbol: "YAKI",
    description: "Moyaki swims for those who rise from humble beginnings with an unyielding drive to succeed.",
    basePrice: 0.000621,
    currentPrice: 0.000621,
    image: "/agents/2.jpeg"
  },
  {
    name: "House of Chog",
    symbol: "CHOG",
    description: "Chog is the house for the wise and industrious who value intellect, strategy, and tireless.",
    basePrice: 0.00709,
    currentPrice: 0.00709,
    image: "/agents/3.jpeg"
  }
];

const filterIcons = {
  'All Houses': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  'Highest Price': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 20V4M5 11L12 4L19 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  'Lowest Price': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4V20M5 13L12 20L19 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  'Recently Added': (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All Houses');

  const filters = ['All Houses', 'Highest Price', 'Lowest Price', 'Recently Added'];

  return (
    <main className="flex min-h-screen flex-col items-center">
      <Hero />
      
      <section className="w-full max-w-[1300px] px-4 py-24" id="agents">
        <div className="flex flex-col gap-12">
          <div className="section-header flex flex-col gap-8 items-center lg:items-start lg:flex-row lg:justify-between w-full mb-8">
            <div className="header-container flex flex-col gap-3 items-center lg:items-start">
              <h2 className="text-center lg:text-left text-white text-6xl lg:text-7xl font-medium max-w-[20ch]"
                style={{
                  background: 'linear-gradient(rgb(255, 255, 255) 50%, rgb(102, 102, 102) 100%) text',
                  WebkitTextFillColor: 'transparent'
                }}>
                Start Trading
              </h2>
              <p className="text-center lg:text-left text-[#666] text-lg max-w-[50ch] font-normal">
                Explore and trade unique autonomous trading agents.
              </p>
            </div>

            {/* Filter Menu */}
            <div className="relative self-center lg:self-center z-45">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 gap-[10px] min-w-[240px] transition-all duration-350 ease-[cubic-bezier(0.34,1.56,0.64,1)] bg-[hsla(220,10%,12%,1)] text-white shadow-[0px_1px_1px_0px_rgba(255,255,255,0.12)_inset,0px_1px_2px_0px_rgba(0,0,0,0.08),0px_0px_0px_1px_#000] hover:bg-[hsla(220,10%,18%,1)] h-14 px-6 py-2 rounded-[100px] text-[16px] leading-[24px] font-[500]"
              >
                <div className="flex items-center gap-3">
                  {filterIcons[selectedFilter]}
                  <span>{selectedFilter}</span>
                </div>
                <svg
                  className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  height="24"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>

              {isOpen && (
                <div className="absolute right-0 mt-2 w-[280px] rounded-2xl bg-[hsla(220,10%,12%,0.95)] border border-[#000] shadow-lg backdrop-blur-xl">
                  <div className="py-2">
                    {filters.map((filter) => (
                      <button
                        key={filter}
                        onClick={() => {
                          setSelectedFilter(filter);
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-6 py-4 text-[15px] text-white hover:bg-[hsla(220,10%,18%,1)] text-left transition-colors"
                      >
                        {filterIcons[filter]}
                        <span className="flex-1">{filter}</span>
                        {selectedFilter === filter && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {mockAgents.map((agent) => (
              <motion.div
                key={agent.symbol}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <AgentCard agent={agent} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
