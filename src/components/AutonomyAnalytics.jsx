import React from 'react';

export default function AutonomyAnalytics() {
  return (
    <div className="w-full h-[800px] bg-black/80 flex flex-col items-center justify-center font-mono p-8 relative">
      
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiMwMDAiLz48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjMGZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz48L3N2Zz4=')] opacity-20 pointer-events-none"></div>

      <div className="text-center mb-16 relative z-10">
        <h1 className="text-5xl font-bold tracking-[0.2em] text-white mb-4">AUTONOMY <span className="text-green-400">ANALYTICS</span></h1>
        <p className="text-white/40 tracking-widest max-w-2xl mx-auto leading-relaxed">
          CONSTELLATION-SCALE INTELLIGENCE LAYER VALIDATED.<br/>
          OPERATIONAL METRICS FOR THE LAST 72 HOURS.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-8 w-full max-w-5xl relative z-10">
        
        {/* Metric 1 */}
        <div className="border border-white/20 p-8 flex flex-col justify-center items-center text-center bg-black/60 shadow-[0_0_30px_rgba(0,255,255,0.05)]">
          <div className="text-7xl font-bold text-white mb-2">0</div>
          <div className="text-xs text-white/40 tracking-widest mb-1">HUMAN DECISIONS REQUIRED</div>
          <div className="text-[10px] text-green-400">100% OPERATOR ABSTRACTION</div>
        </div>

        {/* Metric 2 */}
        <div className="border border-neon-blue/30 p-8 flex flex-col justify-center items-center text-center bg-black/60 shadow-[0_0_30px_rgba(0,255,255,0.1)]">
          <div className="text-7xl font-bold text-neon-blue mb-2">124</div>
          <div className="text-xs text-white/40 tracking-widest mb-1">AUTONOMOUS THREATS RESOLVED</div>
          <div className="text-[10px] text-neon-blue">+42% COMPARED TO HUMAN BASELINE</div>
        </div>

        {/* Metric 3 */}
        <div className="border border-green-400/30 p-8 flex flex-col justify-center items-center text-center bg-black/60 shadow-[0_0_30px_rgba(74,222,128,0.1)]">
          <div className="text-7xl font-bold text-green-400 mb-2">$8.4M</div>
          <div className="text-xs text-white/40 tracking-widest mb-1">SLA PENALTIES AVOIDED</div>
          <div className="text-[10px] text-green-400">VIA CROSS-NODE HANDOFFS</div>
        </div>

      </div>

      <div className="mt-16 text-center relative z-10 border-t border-white/10 pt-8 w-full max-w-5xl">
        <div className="flex justify-between items-center text-white/60 text-sm tracking-widest">
           <div><span className="text-white/30 mr-2">FUEL SAVED:</span> 18.4%</div>
           <div><span className="text-white/30 mr-2">MISSION SUCCESS:</span> +11.2%</div>
           <div><span className="text-white/30 mr-2">ORBITAL UPTIME:</span> 99.999%</div>
        </div>
      </div>
    </div>
  );
}
