import Image from "next/image";
import Link from "next/link";
import { Orbitron } from "next/font/google";

const orbitron = Orbitron({ subsets: ["latin"] });
const Footer = () => {
  return (
    <footer className="w-full mt-auto border-t border-white/5 bg-black/20 backdrop-blur-xl">
      <div className="max-w-[1300px] mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 items-start">
          {/* Left Content */}
          <div className="space-y-4">
            <span
              className={`text-white font-semibold text-xl tracking-wider bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent ${orbitron.className}`}
            >
              InfinityX
            </span>
            <p className="pt-4 text-gray-400 text-sm max-w-[480px]">
              Trade AI agents with up to 10x leverage. Experience the future of
              algorithmic trading with our cutting-edge platform designed for
              the next generation of traders.
            </p>
          </div>

          {/* Right Content - EVMACC Logo */}
          <div className="flex flex-col items-end">
            <div className="flex flex-col items-end gap-3">
              <span className="text-gray-400 text-xl font-medium">
                Built for
              </span>
              <Image
                src="/images/evmacc.svg"
                alt="EVMACC"
                width={320}
                height={80}
                className="brightness-200"
              />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">
            © 2025 InfinityX. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
