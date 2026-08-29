import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-12 mb-6 container mx-auto px-4">
      <div className="bg-slate-900 border border-slate-800 text-slate-300 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row justify-between items-center px-6">
        <div className="flex items-center space-x-3">
          <img
            src={`${process.env.PUBLIC_URL}/CineSpot.png`}
            alt="CineSpot Logo"
            className="h-8 w-auto rounded-md object-contain"
          />
          <div className="flex flex-col text-left leading-none">
            <span className="font-black text-white text-xl tracking-tight">Cine<span className="text-red-500">Spot</span></span>
            <span className="text-[10px] text-red-400 font-semibold uppercase tracking-widest mt-0.5">Your Next Show Awaits</span>
          </div>
        </div>
        <div className="text-xs text-slate-400 mt-3 md:mt-0 font-medium tracking-wide">
          &copy; {currentYear} <span className="text-slate-200 font-semibold">Anil Upputuri</span>. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
