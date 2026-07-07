import React, { useState, useEffect } from 'react';

export default function OverlayApp() {
  const [metrics, setMetrics] = useState({
    currentWpm: 0,
    accuracy: 100,
    sessionTimeStr: '00:00',
    activeApp: 'Idle',
    category: 'Other'
  });
  const [wpmHistory, setWpmHistory] = useState([]);

  useEffect(() => {
    if (window.keystraAPI) {
      // Listen to real-time events from C# hook processed in main
      const unsubscribe = window.keystraAPI.onLiveMetrics((data) => {
        setMetrics(data);
        if (data.currentWpm > 0) {
          setWpmHistory(prev => {
            const next = [...prev, data.currentWpm];
            if (next.length > 15) next.shift();
            return next;
          });
        } else {
          setWpmHistory([]);
        }
      });
      return () => unsubscribe();
    }
  }, []);

  const handleMouseEnter = () => {
    // Disable click-through so user can interact with drag handles / close buttons
    if (window.keystraAPI) {
      window.keystraAPI.setOverlayIgnoreMouse(false);
    }
  };

  const handleMouseLeave = () => {
    // Re-enable click-through transparency for normal screen clicks
    if (window.keystraAPI) {
      window.keystraAPI.setOverlayIgnoreMouse(true);
    }
  };

  const handleClose = () => {
    if (window.keystraAPI) {
      window.keystraAPI.closeOverlay();
    }
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="fixed bottom-4 right-4 group select-none"
    >
      <div className="overlay-drag glass-panel rounded-full h-14 pl-6 pr-4 flex items-center gap-6 shadow-2xl transition-all duration-300 hover:pr-2 select-none">
        
        {/* Speed / WPM */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-label-xs text-on-surface-variant uppercase tracking-wider text-[9px] font-semibold">Speed</span>
            <div className="flex items-baseline gap-1">
              <span className="font-display-metrics text-[24px] font-bold text-primary-container leading-none font-display">
                {metrics.currentWpm}
              </span>
              <span className="font-data-mono text-on-surface-variant/70 text-[10px] font-semibold">WPM</span>
            </div>
          </div>

          {/* Micro Sparkline SVG */}
          <div className="sparkline-container w-16 h-8 flex items-center">
            {wpmHistory.length >= 2 ? (
              <svg className="w-full h-full" viewBox="0 0 100 40">
                <path
                  className="animate-pulse-subtle"
                  d={(() => {
                    const maxW = 100;
                    const maxH = 40;
                    const maxVal = Math.max(100, ...wpmHistory);
                    const step = maxW / (wpmHistory.length - 1);
                    return wpmHistory.map((val, idx) => {
                      const x = idx * step;
                      const y = maxH - 5 - (val / maxVal) * (maxH - 10);
                      return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ');
                  })()}
                  fill="none"
                  stroke="#5856d6"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                />
                <circle 
                  cx="100" 
                  cy={(() => {
                    const maxH = 40;
                    const maxVal = Math.max(100, ...wpmHistory);
                    const lastVal = wpmHistory[wpmHistory.length - 1];
                    return maxH - 5 - (lastVal / maxVal) * (maxH - 10);
                  })()} 
                  fill="#5856d6" 
                  r="3" 
                />
              </svg>
            ) : (
              <svg className="w-full h-full" viewBox="0 0 100 40">
                <line x1="0" y1="30" x2="100" y2="30" stroke="#5856d6" strokeOpacity="0.3" strokeWidth="2" strokeDasharray="3 3" />
              </svg>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-white/10"></div>

        {/* Accuracy */}
        <div className="flex flex-col">
          <span className="text-label-xs text-on-surface-variant uppercase tracking-wider text-[9px] font-semibold">Accuracy</span>
          <div className="flex items-baseline gap-1">
            <span className="font-headline-md text-secondary font-bold leading-none font-display">
              {metrics.accuracy}
            </span>
            <span className="font-data-mono text-on-surface-variant/70 text-[10px] font-semibold">%</span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-white/10"></div>

        {/* Session Time & Lock Icon */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col min-w-[50px]">
            <span className="text-label-xs text-on-surface-variant uppercase tracking-wider text-[9px] font-semibold">Session</span>
            <span className="font-data-mono text-on-surface leading-none text-xs font-semibold">{metrics.sessionTimeStr}</span>
          </div>
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-surface-variant/30 border border-white/5" title="Local-only Data">
            <span className="material-symbols-outlined text-[14px] text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 1" }}>encrypted</span>
          </div>
        </div>

        {/* Hover Controls (Close / Drag Handles) */}
        <div className="flex items-center gap-1 border-l border-white/10 pl-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div 
            style={{ WebkitAppRegion: 'drag' }}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors cursor-grab active:cursor-grabbing"
            title="Drag to position"
          >
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">drag_indicator</span>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-error-container/20 hover:text-error transition-colors"
            title="Close overlay"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

      </div>

      {/* Floating Status Context indicator */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 glass-panel rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap text-[11px] font-semibold text-on-surface">
        Live Target: {metrics.activeApp} ({metrics.category})
      </div>
    </div>
  );
}
