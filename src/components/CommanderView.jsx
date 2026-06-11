import React, { useEffect, useState } from 'react';

function SparklineChart({ value }) {
  const [history, setHistory] = useState(Array(30).fill(100));
  
  useEffect(() => {
    setHistory(prev => [...prev.slice(1), value]);
  }, [value]);

  const min = Math.min(...history) - 5;
  const max = Math.max(...history) + 5;
  const range = max - min || 1;

  return (
    <div className="h-12 w-full flex items-end gap-[2px] opacity-50 mt-2">
      {history.map((val, i) => {
        const heightPct = Math.max(10, ((val - min) / range) * 100);
        return (
          <div key={i} className="w-1 bg-neon-blue transition-all duration-100" style={{ height: `${heightPct}%` }} />
        );
      })}
    </div>
  );
}

function CrisisTimeline({ hasFailure }) {
  const [sequence, setSequence] = useState(-1);

  useEffect(() => {
    if (hasFailure) {
      setSequence(0);
      const t1 = setTimeout(() => setSequence(1), 1500);
      const t2 = setTimeout(() => setSequence(2), 3500);
      const t3 = setTimeout(() => setSequence(3), 5500);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    } else {
      setSequence(-1);
    }
  }, [hasFailure]);

  if (sequence === -1) {
    return (
      <div className="border border-white/20 p-6 bg-black flex flex-col font-mono text-center justify-center items-center h-[200px]">
        <span className="text-white/20 tracking-widest text-xs">NO ACTIVE CRISIS EVENTS</span>
      </div>
    );
  }

  const steps = [
    { label: "THREAT DETECTED", time: "T+00:00.0", color: "text-red-500" },
    { label: "RISK EVALUATED", time: "T+00:01.5", color: "text-orange-400" },
    { label: "TASK REASSIGNED", time: "T+00:03.5", color: "text-neon-blue" },
    { label: "COVERAGE RESTORED", time: "T+00:05.5", color: "text-green-400" }
  ];

  return (
    <div className="border border-red-500/50 p-6 bg-red-900/10 flex flex-col font-mono h-[200px] overflow-hidden relative">
      <div className="absolute inset-0 bg-red-500/5 animate-pulse"></div>
      <h2 className="text-sm tracking-[0.2em] text-red-500 mb-4 flex items-center justify-between relative z-10">
        <span>CRISIS REPLAY TIMELINE</span>
        <span className="bg-red-500 text-black px-2 py-0.5 text-[10px] font-bold animate-pulse">LIVE</span>
      </h2>
      <div className="flex flex-col gap-2 relative z-10">
        {steps.map((s, i) => (
           <div key={i} className={`flex justify-between items-center ${sequence >= i ? s.color : 'text-white/10'}`}>
             <div className="flex items-center gap-4">
                <span className={`w-2 h-2 rounded-full ${sequence >= i ? 'bg-current' : 'bg-white/10'}`}></span>
                <span className={`text-xs ${sequence === i ? 'animate-pulse font-bold' : ''}`}>{s.label}</span>
             </div>
             <span className="text-[10px]">{sequence >= i ? s.time : '--:--.-'}</span>
           </div>
        ))}
      </div>
    </div>
  );
}

function StrategicForecast({ forecasts = [], horizon }) {
  if (forecasts.length === 0) return <div className="text-white/20 text-xs">NO FORECASTS GENERATED</div>;

  return (
    <div className="border border-white/20 p-6 bg-black flex flex-col flex-1 font-mono">
      <h2 className="text-sm tracking-[0.2em] text-white/60 mb-6 flex items-center justify-between">
        <span>STRATEGIC HORIZON</span>
        <span className="w-2 h-2 rounded-full bg-neon-blue animate-pulse"></span>
      </h2>
      {horizon && (
        <div className="mb-6 border-b border-white/10 pb-4 flex justify-between">
           <div>
             <div className="text-[9px] text-white/40 mb-1">T+12H FLEET HEALTH</div>
             <div className="text-sm">
               <span className="text-red-400 line-through mr-2">{horizon.tPlus12?.baseline?.toFixed(1)}%</span>
               <span className="text-neon-blue font-bold">{horizon.tPlus12?.optimized?.toFixed(1)}%</span>
             </div>
           </div>
           <div className="text-right">
             <div className="text-[9px] text-white/40 mb-1">T+24H FLEET HEALTH</div>
             <div className="text-sm">
               <span className="text-red-400 line-through mr-2">{horizon.tPlus24?.baseline?.toFixed(1)}%</span>
               <span className="text-neon-blue font-bold">{horizon.tPlus24?.optimized?.toFixed(1)}%</span>
             </div>
           </div>
        </div>
      )}
      <div className="flex flex-col gap-4">
        {forecasts.map((ev, i) => (
          <div key={i} className="flex flex-col border-l-2 border-white/10 pl-4 py-1">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-white/40">{ev.time}</span>
              <span className={ev.risk === 'CRITICAL' ? 'text-neon-red' : 'text-neon-blue'}>[{ev.risk}]</span>
            </div>
            <div className="text-sm text-white mb-1">{ev.type}</div>
            <div className="text-xs text-neon-blue tracking-wider">&gt; {ev.maneuver}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CommanderView({ telemetry }) {
  const kpis = telemetry?.globalKpis || { fleetSurvivalProbability: 100, missionSuccessRate: 100, overallFuelEfficiency: 100, strategicHorizon: null, activeAnomalies: [] };
  const hasFailure = kpis.activeAnomalies.some(a => a.threat === 'SYSTEM_FAILURE');

  const [operatorDep, setOperatorDep] = useState(100);
  const [autoDecisions, setAutoDecisions] = useState(113);
  const [hoursSaved, setHoursSaved] = useState(4192);

  useEffect(() => {
    const interval = setInterval(() => {
      setOperatorDep(prev => prev > 12.4 ? prev - (prev * 0.1) : 12.4 + (Math.random() * 0.2 - 0.1));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (hasFailure) {
      const t1 = setTimeout(() => setAutoDecisions(p => p+1), 2000);
      const t2 = setTimeout(() => setHoursSaved(p => p+14), 2000);
      return () => { clearTimeout(t1); clearTimeout(t2); }
    }
  }, [hasFailure]);

  return (
    <div className="w-full h-full flex gap-8 p-8 max-w-7xl mx-auto">
      
      {/* Left Column: Executive Metrics */}
      <div className="flex flex-col flex-2 w-2/3 gap-8">
        <div className={`border p-8 bg-black/50 backdrop-blur-md relative overflow-hidden group transition-colors duration-500 ${hasFailure ? 'border-red-500/50' : 'border-white/20'}`}>
           <div className={`absolute inset-0 ${hasFailure ? 'bg-red-500/5' : 'bg-neon-blue/5'} opacity-0 group-hover:opacity-100 transition-opacity duration-1000`}></div>
           <h2 className="text-sm tracking-[0.2em] text-white/60 mb-8 relative z-10 flex justify-between">
             <span>FLEET INTELLIGENCE INDEX</span>
             <span className="text-green-400 font-bold bg-green-400/10 px-2 py-1 rounded">SCALING UNLOCKED</span>
           </h2>
           <div className="grid grid-cols-2 gap-12 relative z-10">
             <div>
               <div className="text-white/40 text-xs tracking-widest mb-2">SURVIVAL PROBABILITY</div>
               <div className="text-7xl font-bold text-neon-blue">{kpis.fleetSurvivalProbability.toFixed(1)}<span className="text-2xl">%</span></div>
               <SparklineChart value={kpis.fleetSurvivalProbability} />
             </div>
             
             <div>
               <div className="text-white/40 text-xs tracking-widest mb-2">MISSION SUCCESS RATE</div>
               <div className="text-7xl font-bold text-white">{kpis.missionSuccessRate.toFixed(1)}<span className="text-2xl">%</span></div>
               <SparklineChart value={kpis.missionSuccessRate} />
             </div>

             <div>
               <div className="text-white/40 text-xs tracking-widest mb-2">AUTONOMOUS DECISIONS</div>
               <div className="text-5xl font-bold text-neon-blue">{autoDecisions}</div>
               <div className="text-[10px] text-green-400/50 mt-1 uppercase">OPERATOR DEPENDENCY: {operatorDep.toFixed(1)}%</div>
             </div>

             <div>
               <div className="text-white/40 text-xs tracking-widest mb-2">HUMAN LATENCY AVOIDED</div>
               <div className="text-5xl font-bold text-green-400">{hoursSaved}<span className="text-xl"> HRS</span></div>
               <div className="text-[10px] text-white/40 mt-1 uppercase">RESOURCE EFFICIENCY: {kpis.overallFuelEfficiency.toFixed(1)}%</div>
             </div>
           </div>
        </div>

        <div className="border border-white/20 p-8 bg-black/50 backdrop-blur-md flex-1">
           <h2 className="text-sm tracking-[0.2em] text-white/60 mb-4">ACTIVE ANOMALIES</h2>
           <table className="w-full text-left font-mono text-sm">
             <thead>
               <tr className="text-white/30 border-b border-white/10">
                 <th className="pb-2 font-normal">NODE</th>
                 <th className="pb-2 font-normal">THREAT</th>
                 <th className="pb-2 font-normal">AI ORCHESTRATION STATUS</th>
               </tr>
             </thead>
             <tbody>
               {kpis.activeAnomalies.length > 0 ? kpis.activeAnomalies.map((anom, i) => {
                   let displayStatus = anom.status;
                   let isHandoff = false;
                   if (anom.threat === 'SYSTEM_FAILURE' || anom.status.includes('HANDOFF')) {
                     displayStatus = '[ SLA PRESERVATION INITIATED ]';
                     isHandoff = true;
                   }
                   return (
                     <tr key={i} className="border-b border-white/5">
                       <td className="py-4 text-white">{anom.node}</td>
                       <td className={`py-4 ${anom.threat === 'SYSTEM_FAILURE' ? 'text-neon-red font-bold animate-pulse' : 'text-neon-red'}`}>{anom.threat}</td>
                       <td className={`py-4 ${isHandoff ? 'text-green-400 font-bold tracking-widest' : 'text-neon-blue'}`}>{displayStatus}</td>
                     </tr>
                   );
                 }) : (
                 <tr><td colSpan="3" className="py-4 text-white/20 text-center">NO ACTIVE ANOMALIES</td></tr>
               )}
             </tbody>
           </table>
        </div>
      </div>

      {/* Right Column: Strategic Forecast & Replay */}
      <div className="flex-1 w-1/3 flex flex-col gap-8">
         <StrategicForecast forecasts={kpis.strategicForecasts} horizon={kpis.strategicHorizon} />
         <CrisisTimeline hasFailure={hasFailure} />
      </div>

    </div>
  );
}
