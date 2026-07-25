import React, { useState, memo } from 'react';

// ⚡ Bolt Optimization: Memoize Analytics component to prevent expensive internal array mapping from re-running when parent liveStats updates
const Analytics = memo(function Analytics({ stats }) {
  const [timeframe, setTimeframe] = useState('weekly');
  const sessions = stats.sessions || [];
  const keyMetrics = stats.keyMetrics || {};
  const digraphMetrics = stats.digraphMetrics || {};

  const now = new Date();
  let dailyData = [];
  let labels = [];

  if (timeframe === 'daily') {
    // 6 blocks of 4 hours
    labels = Array.from({ length: 6 }).map((_, i) => {
      const h = new Date(now.getTime() - (5 - i) * 4 * 60 * 60 * 1000);
      return h.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
    });
    
    dailyData = Array.from({ length: 6 }).map((_, i) => {
      const startHour = now.getTime() - (6 - i) * 4 * 60 * 60 * 1000;
      const endHour = now.getTime() - (5 - i) * 4 * 60 * 60 * 1000;
      
      const periodSessions = sessions.filter(s => {
        const t = new Date(s.start_time).getTime();
        return t >= startHour && t < endHour;
      });
      
      const count = periodSessions.length;
      const avgWpm = count > 0 ? Math.round(periodSessions.reduce((acc, s) => acc + s.avg_wpm, 0) / count) : 0;
      
      const avgAcc = count > 0 ? Math.round(periodSessions.reduce((acc, s) => {
        const keys = s.keystroke_count;
        const errors = s.backspace_count;
        const accuracy = keys > 0 ? ((keys - (errors * 2)) / keys) * 100 : 100;
        return acc + Math.max(0, Math.min(100, accuracy));
      }, 0) / count) : 100;
      
      return { avgWpm, avgAcc, hasData: count > 0 };
    });
  } else if (timeframe === 'weekly') {
    // Last 7 days
    labels = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
    });
    
    dailyData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      
      const daySessions = sessions.filter(s => new Date(s.start_time).toISOString().split('T')[0] === dateStr);
      const count = daySessions.length;
      const avgWpm = count > 0 ? Math.round(daySessions.reduce((acc, s) => acc + s.avg_wpm, 0) / count) : 0;
      
      const avgAcc = count > 0 ? Math.round(daySessions.reduce((acc, s) => {
        const keys = s.keystroke_count;
        const errors = s.backspace_count;
        const accuracy = keys > 0 ? ((keys - (errors * 2)) / keys) * 100 : 100;
        return acc + Math.max(0, Math.min(100, accuracy));
      }, 0) / count) : 100;
      
      return { avgWpm, avgAcc, hasData: count > 0 };
    });
  } else {
    // monthly: 5 intervals of 6 days
    labels = Array.from({ length: 5 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (4 - i) * 6);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
    });
    
    dailyData = Array.from({ length: 5 }).map((_, i) => {
      const startDay = now.getTime() - (5 - i) * 6 * 24 * 60 * 60 * 1000;
      const endDay = now.getTime() - (4 - i) * 6 * 24 * 60 * 60 * 1000;
      
      const periodSessions = sessions.filter(s => {
        const t = new Date(s.start_time).getTime();
        return t >= startDay && t < endDay;
      });
      
      const count = periodSessions.length;
      const avgWpm = count > 0 ? Math.round(periodSessions.reduce((acc, s) => acc + s.avg_wpm, 0) / count) : 0;
      
      const avgAcc = count > 0 ? Math.round(periodSessions.reduce((acc, s) => {
        const keys = s.keystroke_count;
        const errors = s.backspace_count;
        const accuracy = keys > 0 ? ((keys - (errors * 2)) / keys) * 100 : 100;
        return acc + Math.max(0, Math.min(100, accuracy));
      }, 0) / count) : 100;
      
      return { avgWpm, avgAcc, hasData: count > 0 };
    });
  }

  // Calculate coordinates for SVG
  const maxWpm = Math.max(100, ...dailyData.map(d => d.avgWpm));
  const getYSpeed = (wpm) => 220 - (wpm / maxWpm) * 200;
  const getYAccuracy = (acc) => 220 - (acc / 100) * 200;
  
  const step = 800 / (dailyData.length - 1);
  const speedPts = dailyData.map((d, idx) => ({ x: idx * step, y: getYSpeed(d.avgWpm) }));
  const accPts = dailyData.map((d, idx) => ({ x: idx * step, y: getYAccuracy(d.avgAcc) }));

  const getBezierPath = (pts) => {
    if (pts.length === 0) return '';
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cpX1 = prev.x + (curr.x - prev.x) / 2;
      const cpY1 = prev.y;
      const cpX2 = curr.x - (curr.x - prev.x) / 2;
      const cpY2 = curr.y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
    }
    return d;
  };

  const speedPath = getBezierPath(speedPts);
  const accPath = getBezierPath(accPts);
  const hasAnyData = dailyData.some(d => d.hasData);

  // Keyboard Hotspots mapping
  const getPreviewKeyCode = (idx) => {
    if (idx >= 0 && idx < 15) {
      const row0Codes = [192, 49, 50, 51, 52, 53, 54, 55, 56, 57, 48, 189, 187, 8, 8];
      return row0Codes[idx];
    }
    if (idx >= 15 && idx < 30) {
      const row1Codes = [9, 81, 87, 69, 82, 84, 89, 85, 73, 79, 80, 219, 221, 220, 220];
      return row1Codes[idx - 15];
    }
    if (idx === 30) return 32; // Spacebar
    if (idx >= 36 && idx < 45) {
      const row2Codes = [90, 88, 67, 86, 66, 78, 77, 188, 190];
      return row2Codes[idx - 36];
    }
    return null;
  };

  let maxPresses = 1;
  Object.values(keyMetrics).forEach(m => {
    if (m.total_presses > maxPresses) maxPresses = m.total_presses;
  });

  const getPreviewHeatClass = (idx) => {
    const keyCode = getPreviewKeyCode(idx);
    if (!keyCode) return 'hidden';
    
    const presses = keyMetrics[keyCode]?.total_presses || 0;
    if (presses === 0) return 'bg-primary/5';
    
    const ratio = presses / maxPresses;
    let base = 'transition-all duration-300 ';
    if (idx === 30) {
      base += 'col-span-6 ';
    }
    
    if (ratio > 0.8) return base + 'bg-primary/100 scale-110 shadow-[0_0_12px_rgba(194,193,255,0.5)]' + (idx === 30 ? ' animate-pulse' : '');
    if (ratio > 0.5) return base + 'bg-primary/80 scale-105 shadow-md';
    if (ratio > 0.25) return base + 'bg-primary/50';
    if (ratio > 0.1) return base + 'bg-primary/20';
    return base + 'bg-primary/10';
  };

  // 1. Calculate WPM by Application Category
  const categoryWPMs = {};
  const categoryCounts = {};
  sessions.forEach(s => {
    if (!categoryWPMs[s.app_category]) {
      categoryWPMs[s.app_category] = 0;
      categoryCounts[s.app_category] = 0;
    }
    categoryWPMs[s.app_category] += s.avg_wpm;
    categoryCounts[s.app_category] += 1;
  });

  const appCategories = ['Coding', 'Chatting', 'Writing', 'Browsing'].map(cat => {
    const avg = categoryCounts[cat] ? Math.round(categoryWPMs[cat] / categoryCounts[cat]) : 0;
    return { name: cat, avgWpm: avg };
  });

  // 2. Find Top 5 Most Used Keys
  const sortedKeys = Object.entries(keyMetrics)
    .map(([code, data]) => ({ code, name: data.key_name, presses: data.total_presses }))
    .sort((a, b) => b.presses - a.presses)
    .slice(0, 5);

  // 3. Find top 3 Problem Keys (using backspace ratio or digraph errors)
  // Let's find keys that have high latency or are frequently corrected
  const sortedProblemKeys = Object.entries(keyMetrics)
    .map(([code, data]) => {
      const avgLatency = data.total_presses > 0 ? Math.round(data.accumulated_latency_ms / data.total_presses) : 0;
      return { code, name: data.key_name, latency: avgLatency, presses: data.total_presses };
    })
    .filter(k => k.name !== 'Space' && k.name !== 'Backspace' && k.presses > 10)
    .sort((a, b) => b.latency - a.latency)
    .slice(0, 3);

  // Helper to format key counts
  const formatPresses = (count) => {
    if (count >= 1000) return (count / 1000).toFixed(1) + 'k';
    return count.toString();
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
      {/* Header and timeframe tabs */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <h2 className="font-display-metrics text-[32px] md:text-[48px] font-bold text-on-surface leading-none">Performance Analytics</h2>
          <p className="text-on-surface-variant mt-2 max-w-lg">In-depth breakdown of your typing efficiency across all local applications.</p>
        </div>
        <div className="flex bg-surface-container-low p-1 rounded-xl border border-white/5">
          {['daily', 'weekly', 'monthly'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-6 py-2 rounded-lg text-body-sm font-semibold capitalize transition-all ${
                timeframe === t
                  ? 'bg-surface-variant text-primary shadow-lg'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Speed vs Accuracy Chart */}
        <div className="col-span-12 lg:col-span-8 glass-panel rounded-xl p-8 h-[420px] flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-headline-md text-[20px] font-bold text-on-surface">Speed vs. Accuracy</h3>
              <p className="text-body-sm text-on-surface-variant capitalize">{timeframe} performance trends</p>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary"></span>
                <span className="text-label-xs text-on-surface-variant font-bold uppercase text-[10px]">WPM Speed</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-secondary"></span>
                <span className="text-label-xs text-on-surface-variant font-bold uppercase text-[10px]">Accuracy %</span>
              </div>
            </div>
          </div>

          <div className="flex-grow relative mt-4 h-[240px] flex flex-col justify-end">
            {hasAnyData ? (
              <div className="flex-grow relative h-[200px]">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 800 240" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line stroke="white" strokeOpacity="0.05" x1="0" x2="800" y1="0" y2="0"></line>
                  <line stroke="white" strokeOpacity="0.05" x1="0" x2="800" y1="60" y2="60"></line>
                  <line stroke="white" strokeOpacity="0.05" x1="0" x2="800" y1="120" y2="120"></line>
                  <line stroke="white" strokeOpacity="0.05" x1="0" x2="800" y1="180" y2="180"></line>
                  
                  {/* Speed Trend line */}
                  {speedPath && (
                    <path
                      className="text-primary chart-glow"
                      d={speedPath}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                    ></path>
                  )}
                  
                  {/* Accuracy line */}
                  {accPath && (
                    <path
                      className="text-secondary opacity-70"
                      d={accPath}
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray="4"
                      strokeWidth="2"
                    ></path>
                  )}
                  
                  {/* Highlight Nodes */}
                  {dailyData.map((d, idx) => d.hasData && (
                    <g key={idx}>
                      <circle className="fill-primary" cx={idx * step} cy={getYSpeed(d.avgWpm)} r="4.5"></circle>
                      <circle className="fill-secondary" cx={idx * step} cy={getYAccuracy(d.avgAcc)} r="3"></circle>
                    </g>
                  ))}
                </svg>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10 pointer-events-none">
                <span className="material-symbols-outlined text-outline/60 text-4xl mb-2">trending_up</span>
                <p className="text-body-sm text-outline font-medium">No analytics data available yet.</p>
                <p className="text-[12px] text-outline-variant mt-1">Start typing to build up your speed and accuracy trends!</p>
              </div>
            )}
            <div className="flex justify-between mt-4 text-[10px] text-outline-variant font-data-mono">
              {labels.map((l, i) => (
                <span key={i}>{l}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Key Mastery Section */}
        <div className="col-span-12 lg:col-span-4 glass-panel rounded-xl p-8 flex flex-col justify-between">
          <div>
            <h3 className="font-headline-md text-[20px] font-bold text-on-surface mb-6">Key Mastery</h3>
            <div className="space-y-6">
              {/* Top 5 keys */}
              <div>
                <p className="text-label-xs font-bold text-on-surface-variant uppercase tracking-widest mb-3 text-[10px]">Top 5 Most Used</p>
                <div className="flex flex-wrap gap-2">
                  {sortedKeys.length > 0 ? (
                    sortedKeys.map((k, idx) => (
                      <div key={idx} className="px-3 py-2 bg-surface-container rounded border border-white/5 flex flex-col items-center min-w-[55px]">
                        <span className="font-data-mono text-primary font-bold text-xs truncate max-w-[50px]">{k.name}</span>
                        <span className="text-[10px] text-outline-variant mt-1 font-semibold">{formatPresses(k.presses)}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-body-sm text-outline">Type to log key usage...</span>
                  )}
                </div>
              </div>

              {/* Problem Keys (Latency Peaks) */}
              <div>
                <p className="text-label-xs font-bold text-error uppercase tracking-widest mb-3 text-[10px]">Problem Keys (Slowest)</p>
                <div className="space-y-2">
                  {sortedProblemKeys.length > 0 ? (
                    sortedProblemKeys.map((k, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-error/5 border border-error/15 p-2 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded bg-surface-variant flex items-center justify-center font-data-mono text-xs font-bold text-on-surface">{k.name}</span>
                          <span className="text-body-sm text-on-surface-variant font-medium text-xs">Latency: {k.latency}ms</span>
                        </div>
                        <span className="material-symbols-outlined text-error text-[18px]">trending_up</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-between bg-surface-container p-2 rounded">
                      <span className="text-body-sm text-outline">No problem keys logged yet.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* App Speed Breakdown */}
        <div className="col-span-12 lg:col-span-6 glass-panel rounded-xl p-8">
          <h3 className="font-headline-md text-[20px] font-bold text-on-surface mb-8">WPM by Application</h3>
          <div className="space-y-6">
            {appCategories.map((cat, idx) => {
              // Set custom bar colors matching reference spec
              let barColor = 'bg-primary';
              if (cat.name === 'Chatting') barColor = 'bg-on-surface/40';
              if (cat.name === 'Writing') barColor = 'bg-tertiary/60';
              if (cat.name === 'Browsing') barColor = 'bg-secondary/40';

              return (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-body-lg font-bold text-sm text-on-surface">{cat.name}</span>
                    <span className="font-data-mono text-primary font-bold text-sm">{cat.avgWpm || 0} WPM</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                    <div className={`h-full ${barColor} rounded-full transition-all duration-1000`} style={{ width: `${Math.min(100, (cat.avgWpm / 120) * 100)}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Heatmap Preview Widget */}
        <div className="col-span-12 lg:col-span-6 glass-panel rounded-xl p-8 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <h3 className="font-headline-md text-[20px] font-bold text-on-surface">Keyboard Hotspots</h3>
              <p className="text-body-sm text-on-surface-variant">Real-time heat distribution map preview</p>
            </div>
          </div>
          
          {/* Heat Grid representing keys */}
          <div className="grid grid-cols-15 gap-1.5 px-2 py-4 relative z-10">
            {Array.from({ length: 45 }).map((_, idx) => {
              if (idx > 30 && idx < 36) return null; // Adjust for col-span spacebar row
              return (
                <div key={idx} className={`h-8 rounded-[3px] border border-white/5 ${getPreviewHeatClass(idx)}`}></div>
              );
            })}
          </div>
          
          <div className="absolute bottom-4 left-8 right-8 flex justify-between text-label-xs text-outline-variant font-data-mono text-[9px] uppercase tracking-wider">
            <span>LOW FREQUENCY</span>
            <span>HIGH FREQUENCY</span>
          </div>
        </div>
      </div>

      {/* Fixed Privacy Footer */}
      <footer className="fixed bottom-4 right-10 z-50">
        <div className="flex items-center gap-3 bg-surface-container-high/80 backdrop-blur px-4 py-2 rounded-full border border-white/10 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
          <span className="text-[10px] text-on-surface-variant font-bold tracking-wider uppercase font-display">SECURE LOCAL ENCRYPTED SESSION</span>
        </div>
      </footer>
    </div>
  );
});

export default Analytics;
