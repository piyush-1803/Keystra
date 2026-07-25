import React, { useState, memo } from 'react';

// ⚡ Bolt Optimization: Memoize Heatmap component to prevent expensive grid generation from re-running when parent liveStats updates
const Heatmap = memo(function Heatmap({ stats }) {
  const [heatmapMode, setHeatmapMode] = useState('frequency'); // 'frequency' or 'latency'
  
  const keyMetrics = stats.keyMetrics || {};
  const digraphMetrics = stats.digraphMetrics || {};

  const sortedKeyList = Object.entries(keyMetrics)
    .map(([code, data]) => ({ name: data.key_name, presses: data.total_presses, code: parseInt(code) }))
    .sort((a, b) => b.presses - a.presses);

  const [selectedKey, setSelectedKey] = useState(() => {
    if (sortedKeyList.length > 0) {
      const topKey = sortedKeyList[0];
      const errors = digraphMetrics[`${topKey.code}:8`]?.transition_count || 0;
      const accuracy = topKey.presses > 0 ? Math.max(0, Math.min(100, Math.round(((topKey.presses - errors) / topKey.presses) * 100 * 10) / 10)) : 100;
      const avgLat = topKey.presses > 0 ? Math.round(keyMetrics[topKey.code].accumulated_latency_ms / topKey.presses) : 0;
      return {
        name: topKey.name,
        presses: topKey.presses,
        latency: avgLat,
        accuracy
      };
    }
    return { name: 'Space', presses: 0, latency: 0, accuracy: 100 };
  });

  const getCoachInsight = () => {
    if (sortedKeyList.length === 0) {
      return "Welcome to Keystra! Start typing in any of your daily apps (like VS Code, Slack, or Word) and I will analyze your typing dynamics to provide personalized ergonomics and latency coaching.";
    }
    
    const slowKeys = Object.entries(keyMetrics)
      .map(([code, data]) => {
        const avgLatency = data.total_presses > 0 ? Math.round(data.accumulated_latency_ms / data.total_presses) : 0;
        return { name: data.key_name, latency: avgLatency, presses: data.total_presses };
      })
      .filter(k => k.name !== 'Space' && k.name !== 'Backspace' && k.name !== 'Shift' && k.name !== 'Ctrl' && k.presses > 5)
      .sort((a, b) => b.latency - a.latency);
      
    if (slowKeys.length > 0) {
      const slowest = slowKeys[0];
      return `Your reach for the "${slowest.name}" key has an average latency of ${slowest.latency}ms. Consider practicing your finger positioning to optimize transition efficiency.`;
    }
    
    return "Great job! Your keyboard transitions are looking smooth and consistent. Keep typing to accumulate more detailed biomechanical insights.";
  };

  // 1. Virtual Keyboard layout mapping rows (QWERTY default)
  const rows = [
    [
      { name: '`', code: 192, width: 'w-10' },
      { name: '1', code: 49, width: 'w-10' },
      { name: '2', code: 50, width: 'w-10' },
      { name: '3', code: 51, width: 'w-10' },
      { name: '4', code: 52, width: 'w-10' },
      { name: '5', code: 53, width: 'w-10' },
      { name: '6', code: 54, width: 'w-10' },
      { name: '7', code: 55, width: 'w-10' },
      { name: '8', code: 56, width: 'w-10' },
      { name: '9', code: 57, width: 'w-10' },
      { name: '0', code: 48, width: 'w-10' },
      { name: '-', code: 189, width: 'w-10' },
      { name: '=', code: 187, width: 'w-10' },
      { name: 'Backspace', code: 8, width: 'w-20' }
    ],
    [
      { name: 'Tab', code: 9, width: 'w-14' },
      { name: 'Q', code: 81, width: 'w-10' },
      { name: 'W', code: 87, width: 'w-10' },
      { name: 'E', code: 69, width: 'w-10' },
      { name: 'R', code: 82, width: 'w-10' },
      { name: 'T', code: 84, width: 'w-10' },
      { name: 'Y', code: 89, width: 'w-10' },
      { name: 'U', code: 85, width: 'w-10' },
      { name: 'I', code: 73, width: 'w-10' },
      { name: 'O', code: 79, width: 'w-10' },
      { name: 'P', code: 80, width: 'w-10' },
      { name: '[', code: 219, width: 'w-10' },
      { name: ']', code: 221, width: 'w-10' },
      { name: '\\', code: 220, width: 'w-10' }
    ],
    [
      { name: 'Caps', code: 20, width: 'w-16' },
      { name: 'A', code: 65, width: 'w-10' },
      { name: 'S', code: 83, width: 'w-10' },
      { name: 'D', code: 68, width: 'w-10' },
      { name: 'F', code: 70, width: 'w-10' },
      { name: 'G', code: 71, width: 'w-10' },
      { name: 'H', code: 72, width: 'w-10' },
      { name: 'J', code: 74, width: 'w-10' },
      { name: 'K', code: 75, width: 'w-10' },
      { name: 'L', code: 76, width: 'w-10' },
      { name: ';', code: 186, width: 'w-10' },
      { name: "'", code: 222, width: 'w-10' },
      { name: 'Enter', code: 13, width: 'w-20' }
    ],
    [
      { name: 'Shift', code: 160, width: 'w-24' },
      { name: 'Z', code: 90, width: 'w-10' },
      { name: 'X', code: 88, width: 'w-10' },
      { name: 'C', code: 67, width: 'w-10' },
      { name: 'V', code: 86, width: 'w-10' },
      { name: 'B', code: 66, width: 'w-10' },
      { name: 'N', code: 78, width: 'w-10' },
      { name: 'M', code: 77, width: 'w-10' },
      { name: ',', code: 188, width: 'w-10' },
      { name: '.', code: 190, width: 'w-10' },
      { name: '/', code: 191, width: 'w-10' },
      { name: 'Shift', code: 161, width: 'w-24' }
    ],
    [
      { name: 'Ctrl', code: 162, width: 'w-12' },
      { name: 'Alt', code: 164, width: 'w-12' },
      { name: 'Cmd', code: 91, width: 'w-12' },
      { name: 'Space', code: 32, width: 'w-64' },
      { name: 'Cmd', code: 92, width: 'w-12' },
      { name: 'Alt', code: 165, width: 'w-12' },
      { name: 'Ctrl', code: 163, width: 'w-12' }
    ]
  ];

  // 2. Find maximum key frequency and maximum latency to compute scaling factors
  let maxCount = 1;
  let maxLatency = 1;
  Object.values(keyMetrics).forEach(m => {
    if (m.total_presses > maxCount) maxCount = m.total_presses;
    const avg = m.total_presses > 0 ? (m.accumulated_latency_ms / m.total_presses) : 0;
    if (avg > maxLatency) maxLatency = avg;
  });

  const getKeyHeatStyle = (code) => {
    const metric = keyMetrics[code];
    if (!metric || metric.total_presses === 0) {
      return 'bg-surface-variant/30 text-on-surface/40';
    }

    if (heatmapMode === 'frequency') {
      const ratio = metric.total_presses / maxCount;
      if (ratio > 0.8) return 'bg-primary text-on-primary font-bold shadow-[0_0_15px_rgba(194,193,255,0.4)]';
      if (ratio > 0.5) return 'bg-primary/70 text-on-surface font-bold';
      if (ratio > 0.25) return 'bg-primary/45 text-on-surface';
      if (ratio > 0.1) return 'bg-primary/30 text-on-surface';
      return 'bg-blue-500/20 text-on-surface/70';
    } else {
      // Latency scale: slower keys glow error-red
      const avgLat = metric.accumulated_latency_ms / metric.total_presses;
      const ratio = avgLat / maxLatency;
      if (ratio > 0.8) return 'bg-error text-on-error font-bold shadow-[0_0_15px_rgba(255,180,171,0.4)]';
      if (ratio > 0.5) return 'bg-error/70 text-on-surface font-bold';
      if (ratio > 0.3) return 'bg-tertiary/40 text-on-surface';
      return 'bg-secondary/20 text-on-surface/80';
    }
  };

  const handleKeyHover = (keyItem) => {
    const metric = keyMetrics[keyItem.code];
    if (metric) {
      const avgLat = metric.total_presses > 0 ? Math.round(metric.accumulated_latency_ms / metric.total_presses) : 0;
      const errors = digraphMetrics[`${keyItem.code}:8`]?.transition_count || 0;
      const accuracy = metric.total_presses > 0 ? Math.max(0, Math.min(100, Math.round(((metric.total_presses - errors) / metric.total_presses) * 100 * 10) / 10)) : 100;
      setSelectedKey({
        name: keyItem.name,
        presses: metric.total_presses,
        latency: avgLat,
        accuracy
      });
    } else {
      setSelectedKey({
        name: keyItem.name,
        presses: 0,
        latency: 0,
        accuracy: 100
      });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
      {/* Header section with Frequency/Latency controls */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="font-display-metrics text-[32px] md:text-[48px] font-bold tracking-tight mb-1">Keyboard Heatmap</h2>
          <p className="text-on-surface-variant font-body-sm">
            Visualizing physical load distribution and mechanical bottlenecks.
          </p>
        </div>
        <div className="flex bg-surface-container rounded-xl p-1 border border-white/5">
          <button
            onClick={() => setHeatmapMode('frequency')}
            className={`px-6 py-2 rounded-lg text-label-xs font-bold text-[11px] uppercase tracking-wider transition-all ${
              heatmapMode === 'frequency'
                ? 'bg-primary text-on-primary shadow-lg'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Frequency
          </button>
          <button
            onClick={() => setHeatmapMode('latency')}
            className={`px-6 py-2 rounded-lg text-label-xs font-bold text-[11px] uppercase tracking-wider transition-all ${
              heatmapMode === 'latency'
                ? 'bg-primary text-on-primary shadow-lg'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Latency
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Main Keyboard Grid */}
        <div className="col-span-12 lg:col-span-9 space-y-6">
          <div className="glass-card rounded-2xl p-8 flex flex-col items-center overflow-x-auto">
            {/* Heatmap Legend */}
            <div className="w-full flex justify-end gap-4 mb-8">
              <div className="flex items-center gap-2">
                <span className="text-label-xs text-on-surface-variant text-[11px]">Cold</span>
                <div className="flex h-2 w-32 rounded-full overflow-hidden bg-surface-variant">
                  <div className="h-full w-1/4 bg-blue-500/10"></div>
                  <div className="h-full w-1/4 bg-primary/30"></div>
                  <div className="h-full w-1/4 bg-primary/70"></div>
                  <div className="h-full w-1/4 bg-primary"></div>
                </div>
                <span className="text-label-xs text-primary text-[11px] font-bold">Hot</span>
              </div>
            </div>

            {/* Virtual Keyboard Rows */}
            <div className="space-y-2 select-none w-full max-w-[900px] font-data-mono">
              {rows.map((row, rowIdx) => (
                <div key={rowIdx} className="flex gap-1.5 justify-center">
                  {row.map((k, colIdx) => (
                    <div
                      key={colIdx}
                      onMouseEnter={() => handleKeyHover(k)}
                      className={`key-glow h-10 rounded-lg flex items-center justify-center text-xs border border-white/5 cursor-pointer transition-all ${k.width} ${getKeyHeatStyle(k.code)}`}
                    >
                      {k.name}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Finger Load Distribution grid cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Hand Load */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-headline-md text-sm font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">front_hand</span>
                Left Hand Load
              </h3>
              <div className="space-y-4">
                {[
                  { name: 'Pinky', width: 'w-[12%]', val: '12%' },
                  { name: 'Ring', width: 'w-[18%]', val: '18%' },
                  { name: 'Middle', width: 'w-[25%]', val: '25%' },
                  { name: 'Index', width: 'w-[35%]', val: '35%' },
                  { name: 'Thumb', width: 'w-[10%]', val: '10%' }
                ].map((f, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="font-body-sm text-on-surface-variant w-12">{f.name}</span>
                    <div className="flex-1 bg-surface-variant h-2 rounded-full overflow-hidden mx-4">
                      <div className={`bg-primary h-full ${f.width}`}></div>
                    </div>
                    <span className="font-data-mono text-primary font-bold">{f.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Hand Load */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="font-headline-md text-sm font-bold mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary" style={{ transform: 'scaleX(-1)' }}>front_hand</span>
                Right Hand Load
              </h3>
              <div className="space-y-4">
                {[
                  { name: 'Thumb', width: 'w-[52%]', val: '52%' },
                  { name: 'Index', width: 'w-[22%]', val: '22%' },
                  { name: 'Middle', width: 'w-[14%]', val: '14%' },
                  { name: 'Ring', width: 'w-[8%]', val: '8%' },
                  { name: 'Pinky', width: 'w-[4%]', val: '4%' }
                ].map((f, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <span className="font-body-sm text-on-surface-variant w-12">{f.name}</span>
                    <div className="flex-1 bg-surface-variant h-2 rounded-full overflow-hidden mx-4">
                      <div className={`bg-secondary h-full ${f.width}`}></div>
                    </div>
                    <span className="font-data-mono text-secondary font-bold">{f.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Focus Stats & AI Coach */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          {/* Key Detail card */}
          <div className="glass-card rounded-2xl p-6">
            <div className="flex justify-between items-start mb-6">
              <h3 className="font-headline-md text-sm font-bold text-on-surface">Key Focus</h3>
              <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center font-data-mono text-primary font-bold text-sm">
                {selectedKey.name}
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase mb-1 font-semibold tracking-wider">Average Latency</p>
                <div className="flex items-end gap-1">
                  <span className="font-display-metrics text-[32px] font-bold text-on-surface leading-none">{selectedKey.latency || '-'}</span>
                  <span className="text-[11px] text-on-surface-variant mb-1 font-semibold">ms</span>
                </div>
              </div>
              <div className="h-[1px] bg-white/5 w-full"></div>
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase mb-1 font-semibold tracking-wider">Mastery Accuracy</p>
                <div className="flex items-end gap-1">
                  <span className="font-display-metrics text-[32px] font-bold text-on-surface leading-none">{selectedKey.latency > 0 ? selectedKey.accuracy : '-'}</span>
                  <span className="text-[11px] text-on-surface-variant mb-1 font-semibold">%</span>
                </div>
              </div>
              <div className="h-[1px] bg-white/5 w-full"></div>
              <div>
                <p className="text-[10px] text-on-surface-variant uppercase mb-1 font-semibold tracking-wider">Total Strikes</p>
                <div className="flex items-end gap-1">
                  <span className="font-display-metrics text-[32px] font-bold text-on-surface leading-none">{selectedKey.presses || '0'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Coach Card */}
          <div className="relative overflow-hidden glass-card rounded-2xl p-6 border-primary/20">
            <div className="absolute top-0 right-0 p-3 opacity-20">
              <span className="material-symbols-outlined text-primary text-[36px]">auto_awesome</span>
            </div>
            <h3 className="font-headline-md text-sm font-bold text-on-surface mb-3">Coach Insights</h3>
            <p className="text-body-sm text-on-surface text-xs leading-relaxed">
              "{getCoachInsight()}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Heatmap;
