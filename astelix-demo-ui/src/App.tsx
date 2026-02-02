// App.tsx

import React, { useState } from 'react';
import TimelinePage from './pages/TimelinePage.tsx';
import AnalyticsPage from './pages/AnalyticsPage.tsx';
import ScenarioSelector, { ScenarioId } from './components/ScenarioSelector.tsx';
import './App.css';
import './components/ScenarioSelector.css';

type Page = 'timeline' | 'analytics';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('timeline');
  const [selectedScenario, setSelectedScenario] = useState<ScenarioId | null>(null);
  const [scenarioLoading, setScenarioLoading] = useState(false);
  const handleScenarioSelect = (scenarioId: ScenarioId) => {
    setScenarioLoading(true);
    setSelectedScenario(scenarioId);
    // Switch to timeline page to show the scenario
    setCurrentPage('timeline');
    // Simulate loading time, or let TimelinePage handle the actual data fetch
    setTimeout(() => setScenarioLoading(false), 500);
  };

  return (
    <div className="app-container">
      <nav className="main-nav">
        <div className="nav-brand">
          <div className="lixeta-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2"/>
              <path d="M12 16L15 19L20 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="logo-text">Lixeta</span>
          </div>
          <span className="sandbox-badge">SANDBOX</span>
        </div>
        
        <div className="nav-links">
          <button 
            className={`nav-link ${currentPage === 'timeline' ? 'active' : ''}`}
            onClick={() => setCurrentPage('timeline')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            Decision Timeline
          </button>
          <button 
            className={`nav-link ${currentPage === 'analytics' ? 'active' : ''}`}
            onClick={() => setCurrentPage('analytics')}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            Analytics
          </button>
        </div>

        <div className="nav-actions">
          <ScenarioSelector
            onScenarioSelect={handleScenarioSelect}
            loading={scenarioLoading}
            selectedScenario={selectedScenario}
          />
        </div>
      </nav>

      <main className="main-content">
        {currentPage === 'timeline' ? (
          <TimelinePage selectedScenario={selectedScenario} />
        ) : (
          <AnalyticsPage />
        )}
      </main>
    </div>
  );
};

export default App;
