import React, { useState, useEffect } from 'react';

export default function AICopilotTerminal({ decision }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!decision) return;
    
    setIsTyping(true);
    setDisplayedText('');
    
    const explanationText = [
      `[AI EXPLAINER REPORT]`,
      `Translating Fleet Utility Engine Matrix...`,
      ``,
      `${decision.commander}`
    ].join('\n');

    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayedText(explanationText.slice(0, i));
      i++;
      if (i > explanationText.length) {
        clearInterval(intervalId);
        setIsTyping(false);
      }
    }, 15);

    return () => clearInterval(intervalId);
  }, [decision]);

  if (!decision) {
    return (
      <div className="border border-white/20 p-4 font-mono h-full flex flex-col bg-black/50">
        <h2 className="text-xs tracking-[0.2em] text-white/60 mb-2 flex items-center justify-between">
          <span>ARBITER DECISION MATRIX</span>
          <span className="w-2 h-2 bg-neon-blue rounded-full animate-pulse"></span>
        </h2>
        <div className="flex-1 flex items-center justify-center text-white/20 text-[10px] tracking-widest">
          WAITING FOR UTILITY ENGINE OUTPUT...
        </div>
      </div>
    );
  }

  const { optionA, optionB, selectedOption } = decision.economics || {};

  return (
    <div className="border border-white/20 p-4 font-mono h-full flex flex-col bg-black/50 relative overflow-hidden">
      <h2 className="text-xs tracking-[0.2em] text-white/60 mb-2 flex justify-between relative z-10 items-center">
        <span>ARBITER DECISION MATRIX</span>
        {isTyping ? (
          <span className="text-neon-blue animate-pulse text-[10px]">COMPUTING...</span>
        ) : (
          <span className="text-green-400 font-bold bg-green-400/20 px-2 py-0.5 rounded text-[10px]">
            CONFIDENCE: {decision.confidence?.toFixed(1)}%
          </span>
        )}
      </h2>
      
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiMwMDAiLz48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxIiBmaWxsPSIjMGZmIiBmaWxsLW9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] opacity-30 z-0"></div>

      {/* Narrative Explanation */}
      <div className="overflow-y-auto text-[10px] text-white/80 leading-relaxed whitespace-pre-wrap relative z-10 font-bold mb-4 h-12">
        {displayedText}
        {isTyping && <span className="inline-block w-2 h-3 bg-white ml-1 animate-pulse"></span>}
      </div>

      {/* Netflix-style Decision Cards */}
      {!isTyping && optionA && optionB && (
        <div className="flex-1 grid grid-cols-2 gap-4 relative z-10">
           {/* Option A */}
           <div className={`border p-3 flex flex-col justify-between transition-colors ${selectedOption === 'A' ? 'border-neon-blue bg-neon-blue/10' : 'border-white/10 bg-black/40'}`}>
              <div>
                 <div className="text-[10px] tracking-widest text-white/40 mb-1">OPTION A</div>
                 <div className="text-xs font-bold text-white mb-2 leading-tight">{optionA.description}</div>
              </div>
              <div>
                 <div className="flex justify-between text-[9px] mb-1"><span>Utility Score</span><span className="text-neon-blue">{optionA.finalScore.toFixed(1)}</span></div>
                 <div className="w-full bg-white/10 h-1 mb-2"><div className="bg-neon-blue h-1" style={{width: `${Math.min(100, optionA.finalScore)}%`}}></div></div>
                 
                 {selectedOption === 'A' && <div className="text-[9px] text-black bg-neon-blue font-bold px-1 py-0.5 inline-block mt-1">SELECTED BY ARBITER</div>}
              </div>
           </div>

           {/* Option B */}
           <div className={`border p-3 flex flex-col justify-between transition-colors ${selectedOption === 'B' ? 'border-neon-blue bg-neon-blue/10' : 'border-white/10 bg-black/40'}`}>
              <div>
                 <div className="text-[10px] tracking-widest text-white/40 mb-1">OPTION B</div>
                 <div className="text-xs font-bold text-white mb-2 leading-tight">{optionB.description}</div>
              </div>
              <div>
                 <div className="flex justify-between text-[9px] mb-1"><span>Utility Score</span><span className="text-white/60">{optionB.finalScore.toFixed(1)}</span></div>
                 <div className="w-full bg-white/10 h-1 mb-2"><div className="bg-white/40 h-1" style={{width: `${Math.min(100, optionB.finalScore)}%`}}></div></div>
                 
                 {selectedOption === 'B' && <div className="text-[9px] text-black bg-neon-blue font-bold px-1 py-0.5 inline-block mt-1">SELECTED BY ARBITER</div>}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
