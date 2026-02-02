import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Play } from 'lucide-react';

export type ScenarioId =
  | 'dual-time'
  | 'behavior-reminder'
  | 'fintech-login'
  | 'active-hours';

interface Scenario {
  id: ScenarioId;
  label: string;
  description: string;
  emoji: string;
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'dual-time',
    label: 'Dual-Time Message',
    emoji: '🌍',
    description: 'Message with different sender and receiver timezones',
  },
  {
    id: 'behavior-reminder',
    label: 'Auto-Reminder Rule',
    emoji: '⚙️',
    description: 'Automated reminder when no reply received',
  },
  {
    id: 'fintech-login',
    label: 'Fintech Login Flow',
    emoji: '💳',
    description: 'Sequential actions on user authentication',
  },
  {
    id: 'active-hours',
    label: 'Active Hours Window',
    emoji: '🔒',
    description: 'Delayed delivery outside business hours',
  },
];

interface ScenarioSelectorProps {
  onScenarioSelect: (scenarioId: ScenarioId) => void;
  loading?: boolean;
  selectedScenario?: ScenarioId | null;
}

const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  onScenarioSelect,
  loading = false,
  selectedScenario = null,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () =>
      document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleScenarioClick = (scenarioId: ScenarioId) => {
    setIsOpen(false);
    onScenarioSelect(scenarioId);
  };

  const getSelectedScenarioLabel = () => {
    if (!selectedScenario) return 'Select Scenario';
    const scenario = SCENARIOS.find((s) => s.id === selectedScenario);
    return scenario
      ? `${scenario.emoji} ${scenario.label}`
      : 'Select Scenario';
  };

  return (
    <div className="scenario-selector" ref={dropdownRef}>
      <button
        className={`scenario-trigger-btn ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
      >
        <Play size={16} />
        <span>{loading ? 'Running...' : getSelectedScenarioLabel()}</span>
        <ChevronDown
          size={16}
          className={`chevron ${isOpen ? 'rotated' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="scenario-dropdown">
          <div className="scenario-dropdown-header">
            <h3>Select Demo Scenario</h3>
            <p>Choose a scenario to demonstrate Lixeta's capabilities</p>
          </div>

          <div className="scenario-list">
            {SCENARIOS.map((scenario) => (
              <button
                key={scenario.id}
                className={`scenario-item ${
                  selectedScenario === scenario.id ? 'active' : ''
                }`}
                onClick={() => handleScenarioClick(scenario.id)}
                disabled={loading}
              >
                <div className="scenario-item-icon">
                  {scenario.emoji}
                </div>
                <div className="scenario-item-content">
                  <div className="scenario-item-label">
                    {scenario.label}
                  </div>
                  <div className="scenario-item-description">
                    {scenario.description}
                  </div>
                </div>
                {selectedScenario === scenario.id && (
                  <div className="scenario-item-check">✓</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScenarioSelector;
