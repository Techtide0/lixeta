// pages/TimelinePage.tsx

import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Info } from 'lucide-react';
import { LixetaAPI } from '../services/api';
import { TimelineData } from '../types/timeline';
import { ScenarioId } from '../components/ScenarioSelector.tsx';
import { WhyThisHappened } from '../components/WhyThisHappened';
import { WebhookInstruction } from '../components/WebhookInstruction';

interface TimelinePageProps {
  selectedScenario?: ScenarioId | null;
}

const TimelinePage: React.FC<TimelinePageProps> = ({ selectedScenario = null }) => {
  const [timelineData, setTimelineData] = useState<TimelineData | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimeline();
  }, [selectedScenario]);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      let data: TimelineData | null = null;
      
      if (selectedScenario) {
        data = await LixetaAPI.fetchTimelineForScenario(selectedScenario);
      } else {
        data = await LixetaAPI.fetchLatestTimeline();
      }
      
      if (data && data.steps && data.trigger) {
        setTimelineData(data);
        setCurrentStep(0);
        setSelectedEvent(null);
      } else {
        console.error('Invalid timeline data received:', data);
        setTimelineData(null);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch timeline:', error);
      setTimelineData(null);
      setLoading(false);
    }
  };

  const handleStepForward = () => {
    if (timelineData && currentStep < timelineData.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleStepBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepIcon = (icon: string): string => {
    const iconMap: Record<string, string> = {
      'check': '✓',
      'alert': '⚡',
      'arrow-up': '↗',
      'minus': '−',
      'check-circle': '✓',
      'clock': '○'
    };
    return iconMap[icon] || '•';
  };

  const getTooltipText = (type: string): string => {
    const tooltips: Record<string, string> = {
      'event_received': 'The triggering event that started this decision flow',
      'rule_evaluated': 'Rules checked to determine the appropriate response',
      'decision_taken': 'The action Lixeta decided to take based on context',
      'channel_attempted': 'Communication channel that was considered',
      'channel_sent': 'Successful delivery through this channel',
      'state_updated': 'Current status of the event workflow'
    };
    return tooltips[type] || 'Event information';
  };

  if (loading) {
    return (
      <div className="timeline-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading decision timeline...</p>
        </div>
      </div>
    );
  }

  if (!timelineData) {
    return (
      <div className="timeline-page">
        <div className="empty-state">
          <p>No timeline data available</p>
          <button onClick={fetchTimeline} className="reload-btn">Reload</button>
        </div>
      </div>
    );
  }

  // Safety check - ensure trigger and steps exist
  if (!timelineData.trigger || !timelineData.steps) {
    return (
      <div className="timeline-page">
        <div className="empty-state">
          <p>Invalid timeline data structure</p>
          <button onClick={fetchTimeline} className="reload-btn">Reload</button>
        </div>
      </div>
    );
  }

  return (
    <div className="timeline-page">
      <div className="timeline-header">
        <div className="header-content">
          <h1>Decision Timeline Replay</h1>
          <p className="subtitle">Why a Message Was Sent (or Delayed)</p>
          <p className="description">A single source of truth for timing, channel, and urgency decisions</p>
        </div>
        
        <div className="event-context">
          <div className="context-item">
            <span className="context-label">Event Type</span>
            <span className="context-value">{timelineData.trigger.type.replace(/_/g, ' ')}</span>
          </div>
          <div className="context-item">
            <span className="context-label">User</span>
            <span className="context-value">{timelineData.trigger.user}</span>
          </div>
          <div className="context-item">
            <span className="context-label">Local Time</span>
            <span className="context-value timezone-badge">
              {timelineData.trigger.localTime} ({timelineData.trigger.userTimezone})
            </span>
          </div>
        </div>
      </div>

      <div className="timeline-content">
        <div className="timeline-rail">
          {timelineData.steps.map((step, index) => (
            <div 
              key={index}
              className={`timeline-step ${step.critical ? 'critical' : ''} ${index <= currentStep ? 'visible' : 'future'} ${selectedEvent === index ? 'selected' : ''}`}
              onClick={() => setSelectedEvent(index)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="step-time">
                <div className="utc-time">
                  {new Date(step.timestamp).toLocaleTimeString('en-US', { 
                    timeZone: 'UTC', 
                    hour12: false 
                  })} UTC
                </div>
                <div className="local-time">{step.localTime}</div>
              </div>
              
              <div className="step-connector">
                <div className={`step-icon color-${step.color}`}>
                  {getStepIcon(step.icon)}
                </div>
                {index < timelineData.steps.length - 1 && <div className="connector-line"></div>}
              </div>
              
              <div className="step-content">
                <div className="step-header">
                  <h3 className="step-title">{step.title}</h3>
                  {step.critical && <span className="critical-badge">CRITICAL</span>}
                </div>
                <p className="step-description">{step.description}</p>
                
                <div className="step-tooltip">
                  <Info size={14} />
                  <span className="tooltip-text">{getTooltipText(step.type)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedEvent !== null && (
          <div className="why-panel">
            <div className="why-panel-header">
              <h2>Why This Happened</h2>
              <button onClick={() => setSelectedEvent(null)} className="close-panel">×</button>
            </div>
            <div className="why-panel-content">
              <div className="panel-section">
                <h3>{timelineData.steps[selectedEvent].title}</h3>
                <p className="panel-timestamp">
                  {new Date(timelineData.steps[selectedEvent].timestamp).toLocaleString()} ({timelineData.trigger.userTimezone})
                </p>
              </div>
              
              <div className="panel-section">
                <h4>Explanation</h4>
                <p>{timelineData.steps[selectedEvent].details}</p>
              </div>

              {timelineData.steps[selectedEvent].whyHappened && (
                <div className="panel-section">
                  <WhyThisHappened
                    why={timelineData.steps[selectedEvent].whyHappened || ''}
                    processingDuration={timelineData.steps[selectedEvent].processingDuration}
                  />
                </div>
              )}

              {timelineData.steps[selectedEvent].channelContext && (
                <div className="panel-section">
                  <h4>Channel Context</h4>
                  <div className="channel-context-display">
                    <div className="context-badge">
                      <span className="badge-label">Channel:</span>
                      <span className="badge-value">{timelineData.steps[selectedEvent].channelContext?.channel}</span>
                    </div>
                    <div className="context-badge">
                      <span className="badge-label">Status:</span>
                      <span className="badge-value">{timelineData.steps[selectedEvent].channelContext?.status}</span>
                    </div>
                  </div>
                </div>
              )}

              {timelineData.steps[selectedEvent].webhookInstruction && (
                <div className="panel-section">
                  <WebhookInstruction
                    instruction={{
                      action: timelineData.steps[selectedEvent].webhookInstruction?.action || 'N/A',
                      urgency: (timelineData.steps[selectedEvent].webhookInstruction?.urgency || 'LOW') as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
                      reason: timelineData.steps[selectedEvent].webhookInstruction?.reason || 'N/A',
                      recommendedTime: timelineData.steps[selectedEvent].webhookInstruction?.recommendedTime || '',
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="timeline-controls">
        <div className="metrics-strip">
          <div className="metric">
            <span className="metric-label">Duration</span>
            <span className="metric-value">{timelineData.metrics.totalDuration}</span>
          </div>
          <div className="metric">
            <span className="metric-label">Channels</span>
            <span className="metric-value">
              {timelineData.metrics.channelsSent}/{timelineData.metrics.channelsAttempted}
            </span>
          </div>
          <div className="metric">
            <span className="metric-label">Cost Saved</span>
            <span className="metric-value success">{timelineData.metrics.costSaved}</span>
          </div>
          <div className="metric">
            <span className="metric-label">SLA Timer</span>
            <span className="metric-value warning">{timelineData.metrics.slaTimer}</span>
          </div>
        </div>
        
        <div className="playback-controls">
          <button 
            onClick={handleStepBack} 
            disabled={currentStep === 0}
            className="control-btn"
          >
            <ChevronLeft size={20} />
            Step Back
          </button>
          <div className="step-indicator">
            Step {currentStep + 1} of {timelineData.steps.length}
          </div>
          <button 
            onClick={handleStepForward}
            disabled={currentStep === timelineData.steps.length - 1}
            className="control-btn"
          >
            Step Forward
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="safe-zone-banner">
        <div className="banner-icon">🧪</div>
        <div className="banner-text">
          <strong>Safe Testing Zone:</strong> No real users are affected by these test events.
        </div>
      </div>
    </div>
  );
};

export default TimelinePage;
