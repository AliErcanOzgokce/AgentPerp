import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "InfinityX - AI Agent Trading Protocol",
  description: "Trade with AI Agents on Monad Network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0D0E12] min-h-screen flex flex-col`}>
        <Providers>
          <div className="min-h-screen bg-[#0D0E12] relative overflow-hidden">
            {/* Main gradient layer */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-[#6E54FF]/10 via-transparent to-transparent" />
            
            {/* Scattered glow effects */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#6E54FF]/25 rounded-full blur-[100px] animate-pulse" 
              style={{ animationDuration: '8s' }} />
            <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-[#836EF9]/20 rounded-full blur-[120px] animate-pulse" 
              style={{ animationDuration: '12s' }} />
            <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-[#6E54FF]/25 rounded-full blur-[80px] animate-pulse" 
              style={{ animationDuration: '10s' }} />
            
            {/* Floating sparkles */}
            <div className="absolute top-1/4 right-1/3 w-4 h-4 bg-[#836EF9]/50 rounded-full blur-sm animate-ping" 
              style={{ animationDuration: '3s' }} />
            <div className="absolute bottom-1/3 left-1/4 w-3 h-3 bg-[#6E54FF]/50 rounded-full blur-sm animate-ping" 
              style={{ animationDuration: '4s' }} />
            <div className="absolute top-2/3 right-1/4 w-2 h-2 bg-[#836EF9]/50 rounded-full blur-sm animate-ping" 
              style={{ animationDuration: '5s' }} />

            {/* Dynamic gradient mesh */}
            <div className="absolute inset-0 opacity-40"
              style={{
                backgroundImage: `radial-gradient(circle at 50% 50%, rgba(110, 84, 255, 0.2) 0%, transparent 50%),
                                 radial-gradient(circle at 80% 20%, rgba(131, 110, 249, 0.15) 0%, transparent 40%),
                                 radial-gradient(circle at 20% 80%, rgba(110, 84, 255, 0.18) 0%, transparent 35%)`
              }}
            />

            {/* Additional ambient glow */}
            <div className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(circle at 20% 20%, rgba(110, 84, 255, 0.15) 0%, transparent 30%),
                  radial-gradient(circle at 80% 80%, rgba(131, 110, 249, 0.15) 0%, transparent 30%)
                `
              }}
            />

            {/* Content wrapper */}
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
