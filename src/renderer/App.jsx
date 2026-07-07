import React, { useState, useEffect } from 'react';
import Onboarding from './Onboarding';
import Dashboard from './Dashboard';
import Analytics from './Analytics';
import Heatmap from './Heatmap';

export default function App() {
  const [isOnboarded, setIsOnboarded] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ sessions: [], keyMetrics: {}, digraphMetrics: {}, streaks: { currentStreak: 0, dailyKeys: {} } });
  const [liveStats, setLiveStats] = useState({ currentWpm: 0, accuracy: 100, sessionTimeStr: '00:00', activeApp: 'Idle', category: 'Other' });

  useEffect(() => {
    // 1. Check onboarding status
    if (window.keystraAPI) {
      window.keystraAPI.getOnboardingStatus().then((completed) => {
        setIsOnboarded(completed);
      }).catch(() => setIsOnboarded(true)); // Fallback to avoid block

      // 2. Fetch history
      fetchStats();

      // 3. Bind live metrics listener
      const unsubscribe = window.keystraAPI.onLiveMetrics((data) => {
        setLiveStats(data);
        // Refresh full history stats if a session has just closed
        if (data.currentWpm === 0 && data.sessionTimeStr === '00:00') {
          fetchStats();
        }
      });

      return () => unsubscribe();
    } else {
      // Mock data for browser testing
      setIsOnboarded(true);
    }
  }, []);

  const fetchStats = () => {
    if (window.keystraAPI) {
      window.keystraAPI.getStats().then((data) => {
        if (data) setStats(data);
      }).catch(err => console.error("Error reading stats:", err));
    }
  };

  const handleOnboardingComplete = () => {
    if (window.keystraAPI) {
      window.keystraAPI.setOnboardingComplete().then(() => {
        setIsOnboarded(true);
        fetchStats();
      }).catch((err) => {
        console.error("Failed to complete onboarding:", err);
        setIsOnboarded(true);
        fetchStats();
      });
    } else {
      setIsOnboarded(true);
    }
  };

  if (isOnboarded === null) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-surface text-on-surface">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-body-sm text-outline">Loading Keystra Engine...</p>
        </div>
      </div>
    );
  }

  if (!isOnboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="flex h-screen w-full bg-surface text-on-surface overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="h-full w-[240px] border-r border-white/10 bg-surface/70 backdrop-blur-xl flex flex-col py-6 flex-shrink-0 z-30 shadow-2xl">
        <div className="px-6 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary-container text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>keyboard</span>
            </div>
            <div>
              <h1 className="font-headline-lg text-[20px] font-bold text-on-surface leading-tight">Keystra</h1>
              <p className="text-[9px] uppercase tracking-widest text-outline">Local-only</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              activeTab === 'dashboard'
                ? 'text-primary font-bold border-l-2 border-primary bg-primary/10'
                : 'text-on-surface-variant font-medium hover:bg-surface-variant/30'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
            <span className="font-body-lg text-body-sm">Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              activeTab === 'analytics'
                ? 'text-primary font-bold border-l-2 border-primary bg-primary/10'
                : 'text-on-surface-variant font-medium hover:bg-surface-variant/30'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">analytics</span>
            <span className="font-body-lg text-body-sm">Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('heatmap')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              activeTab === 'heatmap'
                ? 'text-primary font-bold border-l-2 border-primary bg-primary/10'
                : 'text-on-surface-variant font-medium hover:bg-surface-variant/30'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">keyboard</span>
            <span className="font-body-lg text-body-sm">Heatmap</span>
          </button>
        </nav>

        <div className="px-4 mt-auto pt-6 border-t border-white/5 space-y-3">
          {/* Active app display */}
          <div className="p-3 bg-surface-container rounded-xl border border-white/5 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse flex-shrink-0"></div>
            <div className="min-w-0">
              <p className="text-[10px] text-outline uppercase tracking-wider leading-none">Active Target</p>
              <p className="text-body-sm font-bold text-on-surface truncate mt-1">{liveStats.activeApp || 'Idle'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-on-surface-variant hover:text-primary transition-colors cursor-pointer px-3 py-1">
            <span className="material-symbols-outlined text-[20px]">security</span>
            <span className="text-body-sm font-medium">Privacy Center</span>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 flex flex-col min-w-0 bg-surface-dim relative overflow-hidden">
        {/* Render pages depending on selection */}
        {activeTab === 'dashboard' && <Dashboard stats={stats} liveStats={liveStats} onNavigate={setActiveTab} />}
        {activeTab === 'analytics' && <Analytics stats={stats} />}
        {activeTab === 'heatmap' && <Heatmap stats={stats} />}
      </main>
    </div>
  );
}
