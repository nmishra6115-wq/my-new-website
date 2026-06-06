import React, { useState, useEffect } from 'react';
import { jobOpenings } from './jobs';

export default function CinematicTerminal() {
  const [activeNode, setActiveNode] = useState('SYS_MAIN');
  const [terminalLog, setTerminalLog] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('All');

  // Dynamic status updates mimicking a live processing backend
  useEffect(() => {
    const protocols = [
      "Parsing SWIFT MT103 data packages...",
      "Syncing localized nodes in Bengaluru hub...",
      "Analyzing transit paths for layered evasions...",
      "Secure link active // Desk connection clear"
    ];
    
    let i = 0;
    const interval = setInterval(() => {
      if (i < protocols.length) {
        setTerminalLog(prev => [...prev, `[OK] ${protocols[i]}`]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 900);
    return () => clearInterval(interval);
  }, [activeNode]);

  // Helper function for 4-day age checking
  const isNewlyAdded = (dateString) => {
    if (!dateString) return false;
    const itemDate = new Date(dateString);
    const currentDate = new Date();
    const diffInDays = (currentDate.getTime() - itemDate.getTime()) / (1000 * 3600 * 24);
    return diffInDays >= 0 && diffInDays <= 4;
  };

  return (
    <div className="min-h-screen w-full bg-[#02050d] text-slate-300 font-mono p-4 md:p-8 relative overflow-hidden flex flex-col gap-6 selection:bg-amber-500 selection:text-black">
      
      {/* BACKGROUND GRAPH GRID MATRIX */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#38bdf8 1px, transparent 1px), linear-gradient(90deg, #38bdf8 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* TOP DECOUPLED MATRIX BAR */}
      <header className="w-full border border-slate-800 bg-[#040a17]/80 backdrop-blur-md p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 z-10 relative">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em] text-cyan-400 font-black">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            CORE_DECODE_PROTOCOL_ACTIVE
          </div>
          <h1 className="text-xl font-black tracking-tighter text-white uppercase">AML_DESK // PLATFORM LAYER</h1>
        </div>
        
        {/* Dynamic Location Strips */}
        <div className="flex flex-wrap gap-1 bg-black/40 p-1 border border-slate-800 rounded-xl w-full sm:w-auto">
          {['All', 'Bengaluru', 'Kolkata', 'Gurugram', 'Remote'].map((loc) => (
            <button
              key={loc}
              onClick={() => setSelectedLocation(loc)}
              className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all duration-300
                ${selectedLocation === loc ? 'bg-cyan-500 text-black font-black' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {loc}
            </button>
          ))}
        </div>
      </header>

      {/* VISCERAL DUAL COLUMN WORKSPACE */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 items-stretch">
        
        {/* LEFT PANEL: ARCHITECTURAL TIMELINE CONTROL PANEL */}
        <nav className="lg:col-span-4 bg-[#040a17]/40 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between gap-8 backdrop-blur-sm">
          <div className="space-y-3">
            <div className="text-[10px] text-slate-600 font-black tracking-widest uppercase mb-4">SYSTEM_NAV_NODES</div>
            {[
              { label: 'System Overview', id: 'SYS_MAIN', desc: 'Real-time telemetry analysis stream' },
              { label: 'Ecosystem Openings', id: 'JOB_STREAM', desc: 'Direct vector applications data arrays' }
            ].map((node) => {
              const isActive = activeNode === node.id;
              return (
                <button
                  key={node.id}
                  onClick={() => { setActiveNode(node.id); setTerminalLog([`[OK] Navigating target destination context: ${node.id}`]); }}
                  className={`w-full text-left p-4 rounded-xl border text-sm uppercase transition-all duration-300 relative group overflow-hidden
                    ${isActive 
                      ? 'bg-gradient-to-r from-cyan-500/10 to-slate-900/40 border-cyan-500 text-white shadow-lg' 
                      : 'bg-black/20 border-slate-900 text-slate-500 hover:border-slate-800 hover:text-slate-300'}`}
                >
                  {isActive && <div className="absolute top-0 left-0 h-full w-[3px] bg-cyan-500" />}
                  <div className="font-black text-xs group-hover:text-cyan-400 transition-colors">{node.label}</div>
                  <div className="text-[9px] font-medium text-slate-600 mt-1 lowercase font-mono tracking-normal">{node.desc}</div>
                </button>
              );
            })}
          </div>

          {/* TELEMETRY READOUT DISPLAY */}
          <div className="p-4 bg-black/60 rounded-xl border border-slate-900 font-mono text-[10px] space-y-1.5 min-h-[120px] max-h-[160px] overflow-y-auto custom-scrollbar">
            <div className="text-slate-600 border-b border-slate-900 pb-1 uppercase font-black tracking-widest text-[8px]">Live Feed Matrix Logs</div>
            {terminalLog.map((log, index) => (
              <div key={index} className="text-emerald-500/80 truncate font-mono tracking-tight animate-view-entry">
                {log}
              </div>
            ))}
          </div>
        </nav>

        {/* RIGHT PANEL: CORE DECOUPLED MATRIX CANVAS */}
        <main className="lg:col-span-8 bg-black/40 border border-slate-800 rounded-2xl p-6 flex flex-col min-h-[500px]">
          
          {/* VIEW NODE 1: STANDARD SYSTEM ENVIRONMENT OVERVIEW */}
          {activeNode === 'SYS_MAIN' && (
            <div className="flex-grow flex flex-col justify-between h-full space-y-8 animate-view-entry">
              <div className="space-y-4">
                <div className="text-[10px] text-slate-600 font-black tracking-widest uppercase">NODE_STATUS // MAIN_DASHBOARD</div>
                <h2 className="text-3xl font-black text-white tracking-tight leading-none uppercase">The Compliance Infrastructure Engine</h2>
                <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-xl">
                  Processing global security networks down to high-vibrancy operational components. Use the directional architectural vector controllers to navigate deeper records.
                </p>
              </div>
              
              {/* Tactical Status Readout Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-900">
                <div className="p-4 bg-[#040a17]/20 border border-slate-800 rounded-xl">
                  <div className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Ecosystem Openings</div>
                  <div className="text-xl font-black text-white mt-1 font-mono">{jobOpenings.length} Active</div>
                </div>
                <div className="p-4 bg-[#040a17]/20 border border-slate-800 rounded-xl">
                  <div className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Terminal Status</div>
                  <div className="text-xl font-black text-emerald-400 mt-1 font-mono tracking-tighter">ONLINE</div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW NODE 2: INTERACTIVE JOBS CONFIGURATIONS ARRAY */}
          {activeNode === 'JOB_STREAM' && (
            <div className="flex-grow flex flex-col space-y-6 h-full animate-view-entry">
              <div className="text-[10px] text-slate-600 font-black tracking-widest uppercase">STREAM_ARRAY // LIVE_NETWORK_NODES</div>
              
              <div className="flex-grow overflow-y-auto space-y-3 pr-1 max-h-[60vh] custom-scrollbar">
                {jobOpenings
                  .filter(job => selectedLocation === 'All' || job.location === selectedLocation)
                  .sort((a, b) => (isNewlyAdded(b.createdAt) ? 1 : 0) - (isNewlyAdded(a.createdAt) ? 1 : 0))
                  .map((job, idx) => {
                    const isNew = isNewlyAdded(job.createdAt);
                    return (
                      <div 
                        key={idx}
                        className={`p-5 rounded-xl transition-all duration-300 border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden group
                          ${isNew 
                            ? 'border-amber-500/40 bg-amber-500/[0.01] shadow-[0_0_20px_rgba(245,158,11,0.05)]' 
                            : 'border-slate-900 bg-black/20 hover:border-slate-800 hover:bg-slate-900/10'}`}
                      >
                        {/* Dynamic Neon Pointer Accent Line */}
                        <div className={`absolute top-0 left-0 h-full w-[2px] transition-colors duration-300
                          ${isNew ? 'bg-amber-500' : 'bg-transparent group-hover:bg-cyan-500/40'}`} />

                        <div className="space-y-1 relative z-10 pl-2">
                          <div className="flex items-center gap-3">
                            <span className="text-[9px] font-black tracking-widest text-cyan-400 uppercase">{job.company}</span>
                            {isNew && (
                              <span className="text-[8px] font-black bg-amber-500 text-black px-1.5 py-0.5 rounded tracking-widest animate-pulse">
                                NEWLY ADDED
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors duration-300">{job.role}</h3>
                          <p className="text-xs text-slate-500 uppercase tracking-tighter font-mono">{job.location} // Node_Active</p>
                        </div>

                        <a
                          href={job.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full sm:w-auto px-5 py-2.5 bg-slate-950 hover:bg-cyan-500 text-slate-400 hover:text-black font-black text-[11px] uppercase tracking-widest rounded-xl border border-slate-800 hover:border-cyan-400/30 transition-all duration-300 text-center relative z-10"
                        >
                          Launch Connection &rarr;
                        </a>
                      </div>
                    );
                  })}

                {jobOpenings.filter(job => selectedLocation === 'All' || job.location === selectedLocation).length === 0 && (
                  <div className="p-12 text-center border border-dashed border-slate-900 rounded-xl text-slate-600 text-xs italic font-mono">
                    No matching intelligence paths discovered under location context: {selectedLocation}.
                  </div>
                )}
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}