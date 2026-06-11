import React, { useState, useEffect } from 'react';
import AutopilotHUD from './components/AutopilotHUD';
import SpaceGlobe from './components/SpaceGlobe';
import HardwareUplink from './components/HardwareUplink';
import CommanderView from './components/CommanderView';
import AICopilotTerminal from './components/AICopilotTerminal';
import AgentActivityGraph from './components/AgentActivityGraph';

import AutonomyAnalytics from './components/AutonomyAnalytics';

const WS_URL = 'ws://localhost:8080';

function ChaosPanel({ ws }) {
  const injectDebris = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'INJECT_CHAOS', payload: 'DEBRIS_STORM' }));
    }
  };

  const injectFlare = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'INJECT_CHAOS', payload: 'SOLAR_FLARE' }));
    }
  };

  const injectFailure = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'INJECT_CHAOS', payload: 'SYSTEM_FAILURE' }));
    }
  };

  return (
    <div className="border border-white/20 p-6 flex flex-col gap-4 font-mono w-full bg-black/60 backdrop-blur-md">
      <h2 className="text-sm tracking-[0.2em] text-white/60 mb-2">CHAOS INJECTION</h2>
      <button onClick={injectDebris} className="bg-transparent border border-neon-red text-neon-red py-1 px-4 hover:bg-neon-red hover:text-space-black transition-colors duration-300">
        DEBRIS STORM
      </button>
      <button onClick={injectFlare} className="bg-transparent border border-white/50 text-white/80 py-1 px-4 hover:bg-white hover:text-space-black transition-colors duration-300">
        SOLAR FLARE
      </button>
      <button onClick={injectFailure} className="bg-red-500/20 border border-red-500 text-red-500 py-1 px-4 hover:bg-red-500 hover:text-white transition-colors duration-300 font-bold">
        SYSTEM FAILURE
      </button>
    </div>
  );
}

function App() {
  const [telemetry, setTelemetry] = useState(null);
  const [decision, setDecision] = useState(null);
  const [ws, setWs] = useState(null);
  const [viewMode, setViewMode] = useState('COMMANDER'); // 'COMMANDER' | 'FLEET' | 'EGO' | 'ANALYTICS'
  const [activeNodeId, setActiveNodeId] = useState(null);

  useEffect(() => {
    const socket = new WebSocket(WS_URL);
    setWs(socket);

    socket.onopen = () => console.log('Connected to ASTRAPILOT X Telemetry');
    
    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'TELEMETRY_STREAM') {
          setTelemetry(msg.data);
        } else if (msg.type === 'AGENT_DECISION') {
          setDecision(msg.data);
        }
      } catch (err) {
        console.error(err);
      }
    };

    return () => socket.close();
  }, []);

  const activeNode = activeNodeId 
      ? telemetry?.constellation?.find(n => n.id === activeNodeId) 
      : telemetry?.constellation?.[0];

  const sat = activeNode || { id: 'WAITING...', status: '...', task: '...', altitude: 0, velocity: 0, fuel: 0, battery: 0, a:0, e:0, i:0, raan:0, arg_p:0 };
  const constellationCount = telemetry?.constellation?.length || 0;

  return (
    <>
      {/* Background layer for EGO view (Full Screen Hero Canvas) */}
      {viewMode === 'EGO' && (
        <div className="fixed inset-0 z-0 pointer-events-auto">
          <AutopilotHUD telemetry={telemetry} />
        </div>
      )}

      {/* Main UI Overlay Grid */}
      <div className={`poster-grid relative z-10 overflow-hidden ${viewMode === 'EGO' ? 'pointer-events-none' : ''}`}>
        
        {/* Top Header & Metadata */}
        <div className="col-start-1 col-end-4 row-start-1 flex justify-between items-start mb-8 pointer-events-auto">
          <div>
            <h1 className="text-6xl font-bold tracking-tighter leading-none mb-4">ASTRAPILOT X</h1>
            <div className="text-sm font-mono text-white/50 tracking-widest flex items-center gap-4">
              <button 
                onClick={() => setViewMode('COMMANDER')}
                className={`hover:text-white transition-colors pb-1 border-b-2 ${viewMode === 'COMMANDER' ? 'text-white border-white' : 'border-transparent'}`}
              >
                COMMANDER OS
              </button>
              <span className="text-white/20">/</span>
              <button 
                onClick={() => setViewMode('FLEET')}
                className={`hover:text-white transition-colors pb-1 border-b-2 ${viewMode === 'FLEET' ? 'text-white border-white' : 'border-transparent'}`}
              >
                FLEET 3D MAP ({constellationCount})
              </button>
              <span className="text-white/20">/</span>
              <button 
                onClick={() => setViewMode('EGO')}
                className={`hover:text-white transition-colors pb-1 border-b-2 ${viewMode === 'EGO' ? 'text-white border-white' : 'border-transparent'}`}
              >
                NODE {sat.id}
              </button>
              <span className="text-white/20">/</span>
              <button 
                onClick={() => setViewMode('ANALYTICS')}
                className={`hover:text-white transition-colors pb-1 border-b-2 ${viewMode === 'ANALYTICS' ? 'text-green-400 border-green-400 text-green-400' : 'border-transparent'}`}
              >
                BUSINESS IMPACT
              </button>
            </div>
          </div>

          {/* Global Simulation Time Control */}
          <div className="flex flex-col justify-end text-right font-mono text-xs mt-2 mr-4">
            <span className="block text-white/30 tracking-widest mb-2">SIMULATION TIME</span>
            <div className="flex gap-2 text-white/50">
              {[0, 1, 10, 100].map(mult => (
                <button 
                  key={mult}
                  onClick={() => {
                    if(ws?.readyState === 1) {
                      ws.send(JSON.stringify({ type: 'SET_TIME_MULTIPLIER', payload: mult }));
                    }
                  }}
                  className={`px-3 py-1 border border-white/20 hover:border-white hover:text-white transition-colors ${telemetry?.timeMultiplier === mult ? 'bg-white text-black border-white' : 'bg-black/50 backdrop-blur-sm'}`}
                >
                  {mult === 0 ? 'PAUSE' : `${mult}X`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        {viewMode === 'COMMANDER' ? (
          <div className="col-start-1 col-end-4 row-start-2 h-[800px] pointer-events-auto">
             <CommanderView telemetry={telemetry} />
          </div>
        ) : viewMode === 'ANALYTICS' ? (
          <div className="col-start-1 col-end-4 row-start-2 h-[800px] pointer-events-auto">
             <AutonomyAnalytics />
          </div>
        ) : viewMode === 'FLEET' ? (
          <>
            {/* Center: 3D Globe */}
            <div className="col-start-1 col-end-4 row-start-2 flex items-center justify-center p-8 h-[600px] pointer-events-auto">
               <SpaceGlobe 
                 telemetry={telemetry} 
                 onSelectNode={(id) => {
                   setActiveNodeId(id);
                   setViewMode('EGO');
                 }} 
               />
            </div>
            
            <div className="col-start-1 col-end-4 row-start-3 text-center text-xs font-mono text-white/30 mt-4 pointer-events-auto">
              SELECT A SATELLITE NODE FROM THE CONSTELLATION TO DIVE INTO EGO-CENTRIC ORCHESTRATION.
            </div>
          </>
        ) : (
          <>
            {/* EGO View Right Panel Metadata */}
            <div className="col-start-3 col-end-4 row-start-2 flex flex-col justify-start pointer-events-none">
              <div className="bg-black/60 border border-white/20 p-6 flex flex-col justify-between backdrop-blur-md pointer-events-auto w-full">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h1 className="text-3xl font-bold tracking-[0.3em] text-white">ASTRA<span className="text-neon-blue">PILOT</span> X</h1>
                    <div className="text-neon-blue text-xs tracking-[0.4em] mt-1">EGO VIEW : {activeNodeId || 'FLEET OVERVIEW'}</div>
                  </div>
                </div>

                {/* Data Readouts */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-xs font-mono text-white/60 text-right">
                  <div><span className="block text-white/30">NODE ID</span><span className="text-neon-blue">{sat.id}</span></div>
                  <div><span className="block text-white/30">STATUS</span><span className={sat.status === 'NOMINAL' ? 'text-neon-blue' : 'text-neon-red font-bold animate-pulse'}>{sat.status}</span></div>
                  <div><span className="block text-white/30">TASK</span><span>{sat.task}</span></div>
                  <div><span className="block text-white/30">ALTITUDE</span><span>{sat.altitude.toFixed(1)} KM</span></div>
                  <div><span className="block text-white/30">VELOCITY</span><span>{sat.velocity.toFixed(2)} KM/S</span></div>
                  <div><span className="block text-white/30">FUEL</span><span>{sat.fuel.toFixed(1)} %</span></div>
                  <div><span className="block text-white/30">POWER</span><span>{sat.battery.toFixed(1)} %</span></div>
                  <div><span className="block text-white/30">INCLINATION</span><span>{(sat.i * (180/Math.PI)).toFixed(2)}°</span></div>
                  <div><span className="block text-white/30">ECCENTRICITY</span><span>{sat.e.toFixed(4)}</span></div>
                  <div><span className="block text-white/30">TRUE ANOMALY</span><span>{(sat.trueAnomaly * (180/Math.PI)).toFixed(2)}°</span></div>
                </div>

                {/* Future Physics Roadmap Panel */}
                <div className="mt-8 pt-4 border-t border-white/20 font-mono text-[10px]">
                   <div className="text-white/40 tracking-widest mb-2">[ PHYSICS MODULES ]</div>
                   <div className="flex justify-between text-neon-blue"><span>KEPLERIAN 2-BODY</span><span>[ ACTIVE ]</span></div>
                   <div className="flex justify-between text-white/30 mt-1"><span>J2 PERTURBATION</span><span>[ V2.0 SCHEDULED ]</span></div>
                   <div className="flex justify-between text-white/30 mt-1"><span>ATMOSPHERIC DRAG</span><span>[ V2.0 SCHEDULED ]</span></div>
                   <div className="flex justify-between text-white/30 mt-1"><span>SOLAR RAD PRESSURE</span><span>[ V2.0 SCHEDULED ]</span></div>
                </div>
              </div>
            </div>

            {/* Bottom Grid for Ego View */}
            <div className="col-start-1 col-end-4 row-start-3 grid grid-cols-3 gap-6 h-[250px] mt-4 pointer-events-auto">
              <ChaosPanel ws={ws} />
              <AgentActivityGraph decision={decision} />
              <AICopilotTerminal decision={decision} />
            </div>
          </>
        )}

      </div>
    </>
  );
}

export default App;
