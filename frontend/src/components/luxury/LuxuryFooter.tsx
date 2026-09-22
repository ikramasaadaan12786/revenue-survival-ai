'use client';

import React from 'react';
import { Globe2 } from 'lucide-react';

export const LuxuryFooter: React.FC = () => {
  return (
    <footer className="w-full mt-10 py-5 px-8 border-t border-[#D4AF37]/15 bg-gradient-to-t from-[#04060A] to-transparent flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
      <p className="font-serif italic text-xs text-[#8C9BAE] tracking-wide">
        &ldquo;An Autonomous AI Company Built for a Bigger Future.&rdquo;
      </p>

      <div className="flex items-center gap-2 text-[10px] tracking-widest text-[#C5A059] uppercase font-semibold">
        <Globe2 className="w-3.5 h-3.5 text-[#D4AF37]" />
        <span>DUBAI</span>
        <span className="text-[#8C9BAE]">•</span>
        <span>LONDON</span>
        <span className="text-[#8C9BAE]">•</span>
        <span>NEW YORK</span>
        <span className="text-[#8C9BAE]">•</span>
        <span>SINGAPORE</span>
      </div>
    </footer>
  );
};
