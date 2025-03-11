'use client';

import { motion } from 'framer-motion';
import { BackgroundPaths } from './ui/background-paths';
import { Button } from './ui/button';

export default function Hero() {
  return (
    <section className="container pb-14 pt-30 h-full">
      <div 
        className="mx-auto max-w-[1300px] relative px-4 pt-12 lg:p-12 lg:py-0 overflow-hidden min-h-[560px] lg:min-h-[640px] flex flex-col rounded-[24px] md:rounded-[40px] shadow-[0px_1px_1px_0px_rgba(255,255,255,0.12)_inset,0px_1px_2px_0px_rgba(0,0,0,0.08),0px_0px_0px_1px_#000]"
        style={{
          background: 'linear-gradient(rgba(44, 49, 58, 0.15) 0%, rgba(0, 0, 0, 0.5) 100%), rgb(25, 27, 31)',
        }}
      >
        <BackgroundPaths title="Trade AI Agents" className="opacity-20" />
        
        <div className="main-hero-content relative z-10 flex-1 flex flex-col px-4 pb-40 pt-12 items-center justify-start gap-8">
          <h1 
            className="text-center font-semibold leading-tight text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl lg:mt-24 max-w-[15ch]"
            style={{
              background: 'linear-gradient(rgb(255, 255, 255) 50%, rgb(102, 102, 102) 100%) text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Trade AI Agents on AgentPerp
          </h1>
          
          <div className="flex flex-col items-center gap-6">
          <button className="inline-flex items-center justify-center whitespace-nowrap ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 gap-[6px] min-w-[190px] transition-all duration-350 ease-[cubic-bezier(0.34,1.56,0.64,1)] bg-[#6E54FF] text-white shadow-[0px_1px_0.5px_0px_rgba(255,255,255,0.33)_inset,0px_1px_2px_0px_rgba(26,19,161,0.50),0px_0px_0px_1px_#4F47EB] hover:bg-[#836EF9] hover:shadow-[0px_1px_1px_0px_rgba(255,255,255,0.12)_inset,0px_1px_2px_0px_rgba(26,19,161,0.50),0px_0px_0px_1px_#4F47EB] h-12 px-4 py-[6px] rounded-[100px] text-[18px] leading-[24px] font-[500]">
              Create Agent
            </button>
          </div>

          <motion.div 
            className="scroll-cta flex flex-col items-center justify-center gap-0 mt-auto"
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mouse w-4 h-4 text-white mb-1">
                <rect x="5" y="2" width="14" height="20" rx="7"></rect>
                <path d="M12 6v4"></path>
              </svg>
            </div>
            <p className="text-white text-xs uppercase font-semibold">Scroll</p>
          </motion.div>
        </div>

        <div 
          className="absolute left-1/2 -translate-x-1/2 -top-[480px] w-[960px] h-[960px] rounded-[960px] opacity-50"
          style={{
            background: 'radial-gradient(50% 50% at 50% 50%, rgba(88, 74, 168, 0.5) 0%, rgba(0, 0, 0, 0.38) 100%)',
            filter: 'blur(180px)',
          }}
        />
      </div>
    </section>
  );
};

