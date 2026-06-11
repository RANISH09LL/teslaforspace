import React, { useEffect, useState } from 'react';

export default function AgentActivityGraph({ decision }) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (!decision) {
      setActiveStep(0);
      return;
    }
    
    // Animate the flow of logic
    setActiveStep(1); // Physics Anomaly Detected
    const t1 = setTimeout(() => setActiveStep(2), 500); // Safety Agent Evaluation
    const t2 = setTimeout(() => setActiveStep(3), 1000); // Mission Agent Evaluation
    const t3 = setTimeout(() => setActiveStep(4), 1500); // Fleet Utility Engine Math
    const t4 = setTimeout(() => setActiveStep(5), 2500); // Commander Arbiter Decision
    
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [decision]);

  if (!decision) {
    return (
      <div className="border border-white/20 p-4 font-mono h-full flex flex-col justify-center items-center opacity-50">
        <div className="text-white/40 text-xs tracking-widest">[ MULTI-AGENT ORBITAL NETWORK STANDBY ]</div>
      </div>
    );
  }

  const nodes = [
    { id: 1, label: 'TELEMETRY INGEST', type: 'system', activeAt: 1 },
    { id: 2, label: 'SAFETY SUB-AGENT', type: 'agent', activeAt: 2 },
    { id: 3, label: 'MISSION SUB-AGENT', type: 'agent', activeAt: 3 },
    { id: 4, label: 'FLEET UTILITY ENGINE', type: 'math', activeAt: 4 },
    { id: 5, label: 'COMMANDER ARBITER', type: 'decider', activeAt: 5 }
  ];

  return (
    <div className="border border-white/20 p-4 font-mono h-full flex flex-col relative bg-black">
      <h2 className="text-xs tracking-[0.2em] text-white/60 mb-4 z-10 absolute top-4 left-4">
        MULTI-AGENT ACTIVITY GRAPH
      </h2>

      <div className="flex-1 flex items-center justify-center relative mt-6">
        {/* Draw connections */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
            {/* Telemetry -> Agents */}
            <path d="M 50,50 L 120,30" stroke={activeStep >= 2 ? '#ff0000' : '#ffffff20'} strokeWidth="2" fill="none" strokeDasharray={activeStep >= 2 ? "4 4" : "0"} className={activeStep >= 2 ? "animate-pulse" : ""} />
            <path d="M 50,50 L 120,70" stroke={activeStep >= 3 ? '#0088ff' : '#ffffff20'} strokeWidth="2" fill="none" strokeDasharray={activeStep >= 3 ? "4 4" : "0"} className={activeStep >= 3 ? "animate-pulse" : ""} />
            
            {/* Agents -> Utility Engine */}
            <path d="M 170,30 L 250,50" stroke={activeStep >= 4 ? '#00ffff' : '#ffffff20'} strokeWidth="2" fill="none" />
            <path d="M 170,70 L 250,50" stroke={activeStep >= 4 ? '#00ffff' : '#ffffff20'} strokeWidth="2" fill="none" />

            {/* Utility Engine -> Commander */}
            <path d="M 280,50 L 340,50" stroke={activeStep >= 5 ? '#00ff00' : '#ffffff20'} strokeWidth="3" fill="none" className={activeStep >= 5 ? "animate-pulse" : ""} />
        </svg>

        {/* Draw Nodes */}
        <div className="relative w-full h-full">
           <div className={`absolute left-[5%] top-[50%] -translate-y-1/2 p-2 border ${activeStep >= 1 ? 'border-white text-white' : 'border-white/20 text-white/40'} text-[9px] bg-black z-10 text-center w-24`}>
             TELEMETRY<br/>INGEST
           </div>
           
           <div className={`absolute left-[35%] top-[20%] p-2 border ${activeStep >= 2 ? 'border-red-500 text-red-500 bg-red-500/10' : 'border-white/20 text-white/40'} text-[9px] bg-black z-10 text-center w-28 transition-all duration-300`}>
             SAFETY AGENT
           </div>

           <div className={`absolute left-[35%] top-[80%] -translate-y-full p-2 border ${activeStep >= 3 ? 'border-blue-500 text-blue-500 bg-blue-500/10' : 'border-white/20 text-white/40'} text-[9px] bg-black z-10 text-center w-28 transition-all duration-300`}>
             MISSION AGENT
           </div>

           <div className={`absolute left-[65%] top-[50%] -translate-y-1/2 p-2 border ${activeStep >= 4 ? 'border-neon-blue text-neon-blue bg-neon-blue/10 shadow-[0_0_15px_rgba(0,255,255,0.5)]' : 'border-white/20 text-white/40'} text-[9px] font-bold bg-black z-10 text-center w-28 transition-all duration-300`}>
             FLEET UTILITY<br/>MATH ENGINE
           </div>

           <div className={`absolute left-[90%] top-[50%] -translate-y-1/2 p-2 border ${activeStep >= 5 ? 'border-green-400 text-green-400 bg-green-400/10 shadow-[0_0_20px_rgba(74,222,128,0.5)]' : 'border-white/20 text-white/40'} text-[10px] font-bold bg-black z-10 text-center w-24 transition-all duration-300`}>
             COMMANDER<br/>ARBITER
           </div>
        </div>
      </div>
    </div>
  );
}
