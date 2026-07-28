import React, { useMemo } from 'react';

export default function Dashboard({ stats, liveStats, onNavigate }) {
  const sessions = stats.sessions || [];
  
  // Memoize expensive calculations to avoid re-running on every liveStats update
  const { todayStr, todaySessions, todayKeysCount, maxSpeed, maxVolume, recentSessions } = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todaySessions = sessions.filter(s => new Date(s.start_time).toISOString().split('T')[0] === todayStr);
    const todayKeysCount = todaySessions.reduce((acc, s) => acc + s.keystroke_count, 0);
    const maxSpeed = sessions.reduce((max, s) => s.avg_wpm > max ? s.avg_wpm : max, 0);
    const maxVolume = Object.values(stats.streaks?.dailyKeys || {}).reduce((max, val) => val > max ? val : max, 0);
    const recentSessions = [...sessions].reverse().slice(0, 3);

    return { todayStr, todaySessions, todayKeysCount, maxSpeed, maxVolume, recentSessions };
  }, [sessions, stats.streaks?.dailyKeys]);

  // Format keys typed today (e.g., 42.8k)
  const formatKeysCount = (count) => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
  };

  // Daily goal calculation (10k keys)
  const dailyGoal = 10000;
  const goalProgress = Math.min(100, Math.round((todayKeysCount / dailyGoal) * 100));

  // Determine standard app icons
  const getAppIcon = (category) => {
    switch (category) {
      case 'Coding': return 'code';
      case 'Chatting': return 'forum';
      case 'Writing': return 'edit_note';
      case 'Browsing': return 'language';
      default: return 'widgets';
    }
  };

  // Get color theme classes based on category
  const getCategoryColor = (category) => {
    switch (category) {
      case 'Coding': return 'bg-primary/20 text-primary';
      case 'Chatting': return 'bg-[#5865F2]/20 text-[#5865F2]';
      case 'Writing': return 'bg-tertiary/20 text-tertiary';
      case 'Browsing': return 'bg-secondary/20 text-secondary';
      default: return 'bg-surface-variant text-outline';
    }
  };

  // Generate day items for streak consistency card (past 5 days)
  const dayItems = useMemo(() => {
    const last5Days = Array.from({ length: 5 }).map((_, idx) => {
      const d = new Date();
      d.setDate(d.getDate() - (4 - idx));
      return d;
    });
    const dailyKeys = stats.streaks?.dailyKeys || {};
    return last5Days.map(date => {
      const dateStr = date.toISOString().split('T')[0];
      const keyCount = dailyKeys[dateStr] || 0;
      const weekdayName = date.toLocaleDateString('en-US', { weekday: 'short' })[0];
      return {
        name: weekdayName,
        active: keyCount > 0,
        isToday: dateStr === todayStr
      };
    });
  }, [stats.streaks?.dailyKeys, todayStr]);

  // Calculate wave path for Today's Velocity
  const { wavePath, areaPath, controlPoints } = useMemo(() => {
    let wavePath = "";
    let areaPath = "";
    let controlPoints = [];
    
    if (todaySessions.length > 0) {
      const maxSessionWpm = Math.max(100, ...todaySessions.map(s => s.avg_wpm));
      const getY = (wpm) => {
        // scale 0 to maxSessionWpm -> 180 to 20
        return 180 - (wpm / maxSessionWpm) * 160;
      };

      const pointsData = todaySessions.map(s => s.avg_wpm);
      if (pointsData.length === 1) {
        pointsData.unshift(0);
      }

      const step = 1000 / (pointsData.length - 1);
      controlPoints = pointsData.map((wpm, idx) => ({
        x: idx * step,
        y: getY(wpm)
      }));

      wavePath = `M ${controlPoints[0].x} ${controlPoints[0].y}`;
      for (let i = 1; i < controlPoints.length; i++) {
        const prev = controlPoints[i - 1];
        const curr = controlPoints[i];
        const cpX1 = prev.x + step / 2;
        const cpY1 = prev.y;
        const cpX2 = curr.x - step / 2;
        const cpY2 = curr.y;
        wavePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
      }
      areaPath = `${wavePath} L 1000 200 L 0 200 Z`;
    }

    return { wavePath, areaPath, controlPoints };
  }, [todaySessions]);

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-surface-dim relative overflow-hidden">
      {/* Top Navbar Header */}
      <header className="flex justify-between items-center px-8 h-16 w-full border-b border-white/10 bg-surface/70 backdrop-blur-xl z-20">
        <div className="flex items-center gap-8">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-[18px]">search</span>
            <input
              type="text"
              readOnly
              className="bg-surface-variant/30 border-none rounded-full pl-10 pr-4 py-1.5 text-body-sm w-64 focus:ring-1 focus:ring-primary cursor-pointer"
              placeholder="Press Ctrl+K for commands..."
              onClick={() => {
                // If dashboard is clicked, open standard command menu mock if implemented
              }}
            />
          </div>
          <nav className="hidden md:flex gap-6">
            <button className="text-primary border-b-2 border-primary pb-1 font-body-lg text-body-sm font-semibold">Overview</button>
            <button onClick={() => onNavigate('analytics')} className="text-on-surface-variant hover:text-primary font-body-lg text-body-sm font-medium transition-colors">History</button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-surface-container-high rounded-full">
            <span className="material-symbols-outlined text-[14px] text-secondary">lock</span>
            <span className="text-label-xs text-on-surface-variant uppercase tracking-tighter">Local-only</span>
          </div>
        </div>
      </header>

      {/* Scrollable Main Content Canvas */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Live Speed */}
          <div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-colors"></div>
            <p className="text-label-xs text-outline-variant uppercase mb-2">Live Speed</p>
            <div className="flex items-baseline gap-2">
              <span className="font-display-metrics text-[48px] font-bold text-primary text-glow font-display">
                {liveStats.currentWpm || (sessions.length > 0 ? sessions[sessions.length - 1].avg_wpm : 0)}
              </span>
              <span className="text-body-lg text-outline">WPM</span>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <span className="material-symbols-outlined text-secondary text-[16px]">trending_up</span>
              <span className="text-label-xs text-secondary">
                {liveStats.category !== 'Other' ? `${liveStats.category} Mode Active` : 'Monitoring inputs...'}
              </span>
            </div>
          </div>

          {/* Accuracy */}
          <div className="glass-card p-6 rounded-2xl">
            <p className="text-label-xs text-outline-variant uppercase mb-2">Accuracy</p>
            <div className="flex items-baseline gap-2">
              <span className="font-display-metrics text-[48px] font-bold text-on-surface font-display">{liveStats.accuracy}</span>
              <span className="text-body-lg text-outline">%</span>
            </div>
            <div className="w-full bg-surface-variant h-1.5 rounded-full mt-4">
              <div className="bg-secondary h-full rounded-full transition-all duration-500" style={{ width: `${liveStats.accuracy}%` }}></div>
            </div>
          </div>

          {/* Active Session */}
          <div className="glass-card p-6 rounded-2xl">
            <p className="text-label-xs text-outline-variant uppercase mb-2">Active Session</p>
            <div className="flex items-baseline gap-2">
              <span className="font-display-metrics text-[48px] font-bold text-on-surface font-display">{liveStats.sessionTimeStr}</span>
              <span className="text-body-lg text-outline">MIN</span>
            </div>
            <p className="text-label-xs text-outline mt-2 italic font-medium">Focus mode active</p>
          </div>

          {/* Today's Keys */}
          <div className="glass-card p-6 rounded-2xl">
            <p className="text-label-xs text-outline-variant uppercase mb-2">Today's Keys</p>
            <div className="flex items-baseline gap-2">
              <span className="font-display-metrics text-[48px] font-bold text-on-surface font-display">{formatKeysCount(todayKeysCount)}</span>
            </div>
            <div className="flex items-center gap-1 mt-2">
              <span className="material-symbols-outlined text-tertiary text-[16px]">bolt</span>
              <span className="text-label-xs text-tertiary">Goal: {formatKeysCount(dailyGoal)} keys</span>
            </div>
          </div>
        </div>

        {/* Core Bento Grid Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Chart Section */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Today's Velocity SVG wave chart */}
            <div className="glass-card p-8 rounded-3xl min-h-[400px] flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="font-headline-md text-[20px] font-bold text-on-surface">Today's Velocity</h2>
                  <p className="text-body-sm text-on-surface-variant">Real-time typing speed variations over active bursts</p>
                </div>
                <div className="flex gap-2 bg-surface-container-low p-1 rounded-lg">
                  <span className="px-4 py-1 text-label-xs bg-surface-variant text-on-surface rounded-md font-semibold text-[11px]">Realtime</span>
                </div>
              </div>
              
              {/* Dynamic Sparkline Waveform */}
              <div className="flex-1 relative flex items-end gap-2 pb-6 px-2 min-h-[220px]">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
                  <div className="border-b border-white/5 w-full h-0"></div>
                  <div className="border-b border-white/5 w-full h-0"></div>
                  <div className="border-b border-white/5 w-full h-0"></div>
                  <div className="border-b border-white/5 w-full h-0"></div>
                  <div className="border-b border-white/10 w-full h-0"></div>
                </div>

                {todaySessions.length > 0 ? (
                  <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 200">
                    <defs>
                      <linearGradient id="chartGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#c2c1ff', stopOpacity: 0.2 }}></stop>
                        <stop offset="100%" style={{ stopColor: '#c2c1ff', stopOpacity: 0 }}></stop>
                      </linearGradient>
                    </defs>
                    
                    {areaPath && <path d={areaPath} fill="url(#chartGradient)"></path>}
                    {wavePath && <path d={wavePath} fill="none" stroke="#c2c1ff" strokeWidth="2.5"></path>}
                    
                    {controlPoints.map((pt, idx) => (
                      <circle 
                        key={idx} 
                        className={idx === controlPoints.length - 1 ? "animate-pulse" : ""} 
                        cx={pt.x} 
                        cy={pt.y} 
                        fill="#c2c1ff" 
                        r="4"
                      ></circle>
                    ))}
                  </svg>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10 pointer-events-none">
                    <span className="material-symbols-outlined text-outline/60 text-4xl mb-2">monitoring</span>
                    <p className="text-body-sm text-outline font-medium">No typing activity today.</p>
                    <p className="text-[12px] text-outline-variant mt-1">Start typing in any app to see velocity variations!</p>
                  </div>
                )}

                <div className="absolute bottom-0 w-full flex justify-between text-[10px] text-outline px-4">
                  <span>Start</span>
                  <span>Active Session Duration</span>
                  <span>End</span>
                </div>
              </div>
            </div>

            {/* Recent Sessions */}
            <div className="glass-card p-6 rounded-3xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline-md text-[20px] font-bold text-on-surface">Recent Sessions</h3>
                <button onClick={() => onNavigate('analytics')} className="text-primary text-label-xs uppercase tracking-widest font-bold text-[11px] hover:underline">View History</button>
              </div>
              <div className="space-y-4">
                {recentSessions.length > 0 ? (
                  recentSessions.map((session, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-surface-variant/20 rounded-2xl hover:bg-surface-variant/40 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getCategoryColor(session.app_category)}`}>
                          <span className="material-symbols-outlined">{getAppIcon(session.app_category)}</span>
                        </div>
                        <div>
                          <h4 className="font-body-lg font-bold text-on-surface text-sm">{session.app_name}</h4>
                          <p className="text-body-sm text-outline text-[12px] capitalize">{session.app_category} Mode</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-data-mono text-on-surface font-bold text-sm">{session.avg_wpm} WPM</p>
                        <p className="text-label-xs text-outline text-[10px]">{session.keystroke_count} keys</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center bg-surface-variant/15 rounded-2xl border border-dashed border-white/10">
                    <span className="material-symbols-outlined text-outline text-4xl mb-2">keyboard_hide</span>
                    <p className="text-body-sm text-outline font-medium">No sessions recorded yet.</p>
                    <p className="text-[12px] text-outline-variant mt-1">Start typing in any application to trigger auto-tracking!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar Stats Column */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Streak & Consistency */}
            <div className="glass-card p-6 rounded-3xl bg-gradient-to-br from-primary-container/10 to-transparent">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-label-xs text-primary uppercase tracking-widest font-bold mb-1 text-[11px]">Consistency</p>
                  <h3 className="font-headline-lg text-[24px] font-bold text-on-surface leading-none">{stats.streaks.currentStreak || 0} Day Streak</h3>
                </div>
                <div className="p-2 bg-primary/20 rounded-full">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                </div>
              </div>
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-body-sm text-on-surface-variant text-sm">Daily Goal Progress</span>
                  <span className="text-body-sm font-bold text-on-surface text-sm">{goalProgress}%</span>
                </div>
                <div className="w-full bg-surface-variant h-3 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full glow-indigo" style={{ width: `${goalProgress}%` }}></div>
                </div>
                <p className="text-label-xs text-outline mt-3 flex items-center gap-1 text-[10px]">
                  <span className="material-symbols-outlined text-[14px]">info</span>
                  {todayKeysCount >= dailyGoal ? 'Daily goal accomplished!' : `${formatKeysCount(Math.max(0, dailyGoal - todayKeysCount))} keys remaining today`}
                </p>
              </div>
              <div className="flex justify-between gap-2">
                {dayItems.map((day, idx) => (
                  <div key={idx} className="flex-1 p-3 bg-surface-container rounded-xl text-center">
                    <p className="text-label-xs text-outline uppercase mb-1.5 text-[10px]">{day.name}</p>
                    <div className={`w-2 h-2 rounded-full mx-auto ${
                      day.active 
                        ? (day.isToday ? 'bg-primary animate-pulse' : 'bg-secondary') 
                        : 'bg-outline opacity-40'
                    }`}></div>
                  </div>
                ))}
              </div>
            </div>

            {/* Personal Bests */}
            <div className="glass-card p-6 rounded-3xl">
              <h3 className="font-headline-md text-[20px] font-bold text-on-surface mb-6">Personal Bests</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-tertiary">trophy</span>
                  </div>
                  <div>
                    <p className="text-label-xs text-outline uppercase text-[10px]">Max Speed</p>
                    <p className="font-body-lg font-bold text-on-surface text-sm">{maxSpeed || 0} WPM <span className="text-outline font-normal text-[12px]">/ burst</span></p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-secondary">verified</span>
                  </div>
                  <div>
                    <p className="text-label-xs text-outline uppercase text-[10px]">Daily Volume</p>
                    <p className="font-body-lg font-bold text-on-surface text-sm">{formatKeysCount(maxVolume)} Keys</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Command Bar interaction hint */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[540px] max-w-[90vw] glass-card rounded-2xl shadow-2xl z-50 p-1 flex items-center gap-2 border-white/20">
        <div className="flex-1 flex items-center gap-3 px-4 py-3 cursor-pointer">
          <span className="material-symbols-outlined text-primary text-[20px]">bolt</span>
          <span className="text-on-surface-variant text-sm font-medium">Type Ctrl+K to search insights...</span>
        </div>
        <div className="flex gap-2 pr-4">
          <div className="flex items-center gap-1 bg-surface-container-high px-2 py-1 rounded-md border border-white/10">
            <span className="text-[10px] text-outline font-data-mono">Ctrl</span>
            <span className="text-[10px] text-outline font-data-mono">K</span>
          </div>
        </div>
      </div>
    </div>
  );
}
