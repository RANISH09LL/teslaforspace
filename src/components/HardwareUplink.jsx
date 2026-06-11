import React from 'react';

export default function HardwareUplink({ decision }) {
  const payload = decision?.hex_payload || '0x00 0x00 IDLE';
  
  return (
    <div className="border border-white/20 p-6 flex flex-col font-mono w-full h-full bg-black">
      <h2 className="text-sm tracking-[0.2em] text-white/60 mb-4 flex justify-between">
        <span>HARDWARE UPLINK</span>
        <span className="text-white/30 text-[10px]">ESP32 SERIAL</span>
      </h2>
      
      <div className="flex-1 flex flex-col justify-center items-center text-center">
        <div className="text-xs text-white/40 mb-2">RAW PAYLOAD OUT</div>
        <div className="text-xl text-neon-blue tracking-widest bg-neon-blue/10 px-4 py-2 border border-neon-blue/30 rounded font-bold w-full">
          {payload}
        </div>
      </div>
    </div>
  );
}
