import React, { useState } from 'react';

export default function Onboarding({ onComplete }) {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [accessibilitiesGranted, setAccessibilitiesGranted] = useState(false);
  const [inputGranted, setInputGranted] = useState(false);

  // Generate random letters for the background visual keycaps
  const keycaps = Array.from({ length: 36 }, (_, i) => String.fromCharCode(65 + (i % 26)));

  const handleInitialize = () => {
    setLoading(true);
    // Simulate setup and verification sequence
    setTimeout(() => {
      setLoading(false);
      setCompleted(true);
      setTimeout(() => {
        onComplete();
      }, 1500);
    }, 2000);
  };

  return (
    <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-container-padding bg-surface overflow-hidden w-full">
      {/* Background Layer: Abstract Keycaps visual texture */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-5">
        <div className="keycap-grid absolute inset-0 grid grid-cols-6 md:grid-cols-12 grid-rows-6 gap-8 p-12">
          {keycaps.map((char, index) => (
            <div
              key={index}
              style={{
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${6 + Math.random() * 4}s`
              }}
              className="w-16 h-16 border border-white/20 rounded-xl flex items-center justify-center font-data-mono text-white/40 animate-float"
            >
              {char}
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background"></div>
      </div>

      {/* Success Toast */}
      <div
        className={`fixed top-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 bg-surface-bright/90 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl z-[100] transition-all duration-500 ${
          completed ? 'translate-y-0 opacity-100' : 'translate-y-[-100px] opacity-0'
        }`}
      >
        <span className="material-symbols-outlined text-secondary">check_circle</span>
        <span className="font-body-sm font-medium">Permissions Verified. Welcome to Keystra.</span>
      </div>

      {/* Onboarding Header */}
      <div className="mb-10 text-center max-w-2xl relative z-10">
        <div className="flex items-center justify-center gap-2 mb-3">
          <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
          <span className="font-headline-lg text-[24px] font-bold tracking-tight">Keystra</span>
        </div>
        <h1 className="font-display-metrics text-[36px] md:text-[48px] font-bold leading-none mb-3">
          Keystra stays on <br/><span className="text-primary">your machine.</span>
        </h1>
        <p className="text-on-surface-variant font-body-lg max-w-lg mx-auto">
          No cloud syncing. No keylogging of sensitive content. Your typing intelligence is computed locally and stays under your control.
        </p>
      </div>

      {/* Bento Permissions Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full relative z-10 mb-10">
        {/* Local Storage Card */}
        <div className="glass-panel p-6 rounded-xl flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">database</span>
            </div>
            <h3 className="font-headline-md text-[20px] font-bold">Local-only Storage</h3>
          </div>
          <p className="text-on-surface-variant text-body-sm leading-relaxed">
            All telemetry and keystroke patterns are encrypted and stored in an on-device database. We never see what you type.
          </p>
          <div className="mt-auto flex flex-wrap gap-2 pt-4">
            <span className="px-2 py-1 bg-secondary/10 text-secondary text-[11px] font-bold rounded-full flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">verified_user</span>
              Local Database
            </span>
            <span className="px-2 py-1 bg-surface-variant text-on-surface-variant text-[11px] font-bold rounded-full">
              Zero Cloud Outbound
            </span>
          </div>
        </div>

        {/* Permission Request: Input Monitoring */}
        <div className="glass-panel p-6 rounded-xl flex flex-col gap-3 border-l-4 border-l-primary">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface-variant flex items-center justify-center text-on-surface">
                <span className="material-symbols-outlined">keyboard</span>
              </div>
              <h3 className="font-headline-md text-[20px] font-bold">Input Monitoring</h3>
            </div>
            <div className="relative group">
              <span className="material-symbols-outlined text-outline cursor-help text-[20px]">info</span>
              <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-surface-container-highest rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-outline-variant z-50">
                <p className="text-[11px] font-medium text-on-surface">Why? This is used to calculate WPM, burst speed, and key frequency. We specifically ignore password fields and sensitive inputs.</p>
              </div>
            </div>
          </div>
          <p className="text-on-surface-variant text-body-sm leading-relaxed">
            Enables the capture of keystroke timestamps to measure typing speed, accuracy, and physical finger travel distance.
          </p>
          <button
            onClick={() => setInputGranted(true)}
            className={`mt-4 w-full py-2 text-body-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 ${
              inputGranted 
                ? 'bg-secondary/20 text-secondary border border-secondary/30' 
                : 'bg-surface-variant hover:bg-surface-container-high text-on-surface'
            }`}
          >
            {inputGranted ? 'Access Granted' : 'Grant Access'}
            {!inputGranted && <span className="material-symbols-outlined text-[18px]">open_in_new</span>}
          </button>
        </div>
      </div>

      {/* Initializer Action Footer */}
      <div className="flex flex-col items-center gap-3 relative z-10">
        <button
          disabled={loading || completed}
          onClick={handleInitialize}
          className={`px-12 py-4 font-headline-md text-[18px] font-bold rounded-xl active:scale-95 transition-all flex items-center gap-3 shadow-lg ${
            completed
              ? 'bg-secondary text-on-secondary'
              : 'bg-primary text-on-primary hover:shadow-[0_0_30px_rgba(194,193,255,0.4)]'
          }`}
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined animate-spin">refresh</span>
              Initializing...
            </>
          ) : completed ? (
            <>
              <span className="material-symbols-outlined">done</span>
              Initialized
            </>
          ) : (
            <>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
              Securely Initialize
            </>
          )}
        </button>
        <p className="text-[11px] font-bold text-outline flex items-center gap-2 uppercase tracking-widest mt-2">
          <span className="material-symbols-outlined text-[14px]">lock</span>
          Ready for local deployment
        </p>
      </div>
    </main>
  );
}
