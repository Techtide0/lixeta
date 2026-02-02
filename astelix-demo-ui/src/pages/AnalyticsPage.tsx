// pages/AnalyticsPage.tsx

import React, { useState, useEffect } from 'react';
import { TrendingUp, Mail, MessageSquare, Bell, DollarSign } from 'lucide-react';
import { LixetaAPI } from '../services/api';
import { AnalyticsData } from '../types/timeline';

const AnalyticsPage: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await LixetaAPI.fetchAnalytics(timeRange);
      setAnalyticsData(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setLoading(false);
    }
  };

  const getChannelColor = (channel: string): string => {
    const colors: Record<string, string> = {
      'Push': '#4F46E5',
      'Email': '#10B981',
      'SMS': '#F59E0B'
    };
    return colors[channel] || '#6B7280';
  };

  const getChannelColorLight = (channel: string): string => {
    const colors: Record<string, string> = {
      'Push': '#EEF2FF',
      'Email': '#D1FAE5',
      'SMS': '#FEF3C7'
    };
    return colors[channel] || '#F3F4F6';
  };

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="analytics-page">
        <div className="empty-state">
          <p>No analytics data available</p>
          <button onClick={fetchAnalytics} className="reload-btn">Reload</button>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div className="header-content">
          <h1>Messaging Analytics Dashboard</h1>
          <p className="subtitle">Unified Analytics Across Push, Email, and SMS</p>
        </div>
        
        <div className="time-range-selector">
          <button 
            className={timeRange === '7d' ? 'active' : ''}
            onClick={() => setTimeRange('7d')}
          >
            Last 7 Days
          </button>
          <button 
            className={timeRange === '30d' ? 'active' : ''}
            onClick={() => setTimeRange('30d')}
          >
            Last 30 Days
          </button>
          <button 
            className={timeRange === '90d' ? 'active' : ''}
            onClick={() => setTimeRange('90d')}
          >
            Last 90 Days
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">
            <Bell size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{analyticsData.summary.messagesSent.toLocaleString()}</div>
            <div className="stat-label">Messages Sent</div>
          </div>
        </div>

        <div className="stat-card success">
          <div className="stat-icon">
            <Mail size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{analyticsData.summary.delivered.toLocaleString()}</div>
            <div className="stat-label">Delivered ({analyticsData.summary.deliveryRate}%)</div>
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{analyticsData.summary.engaged.toLocaleString()}</div>
            <div className="stat-label">Engaged Events ({analyticsData.summary.engagementRate}%)</div>
          </div>
        </div>

        <div className="stat-card accent">
          <div className="stat-icon">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">${analyticsData.summary.costSavings.toLocaleString()}</div>
            <div className="stat-label">Cost Savings</div>
          </div>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-card channel-breakdown">
          <div className="card-header">
            <h2>Reach Breakdown</h2>
            <button className="export-btn">Export</button>
          </div>
          <div className="card-content">
            <div className="donut-chart">
              <svg viewBox="0 0 200 200" className="donut">
                <circle cx="100" cy="100" r="70" fill="none" stroke="#e5e7eb" strokeWidth="40" />
                {analyticsData.channelBreakdown.map((channel, index) => {
                  const offset = analyticsData.channelBreakdown
                    .slice(0, index)
                    .reduce((sum, ch) => sum + ch.percentage, 0);
                  const circumference = 2 * Math.PI * 70;
                  const strokeDasharray = `${(channel.percentage / 100) * circumference} ${circumference}`;
                  const strokeDashoffset = -((offset / 100) * circumference);
                  
                  return (
                    <circle
                      key={channel.channel}
                      cx="100"
                      cy="100"
                      r="70"
                      fill="none"
                      stroke={channel.color}
                      strokeWidth="40"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="donut-segment"
                    />
                  );
                })}
              </svg>
              <div className="donut-center">
                <div className="center-value">{analyticsData.summary.messagesSent.toLocaleString()}</div>
                <div className="center-label">Sent</div>
              </div>
            </div>
            
            <div className="channel-legend">
              {analyticsData.channelBreakdown.map((channel) => (
                <div key={channel.channel} className="legend-item">
                  <div className="legend-color" style={{ backgroundColor: channel.color }}></div>
                  <div className="legend-details">
                    <div className="legend-channel">{channel.channel}</div>
                    <div className="legend-stats">
                      <span className="legend-count">{channel.count.toLocaleString()}</span>
                      <span className="legend-percentage">{channel.percentage}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="analytics-card delivery-timing">
          <div className="card-header">
            <h2>Delivery Timing</h2>
          </div>
          <div className="card-content">
            <div className="timing-bars">
              <div className="timing-item">
                <div className="timing-label">
                  <span>Delayed</span>
                  <span className="timing-count">{analyticsData.deliveryStatus.delayed.toLocaleString()}</span>
                </div>
                <div className="timing-bar-container">
                  <div 
                    className="timing-bar delayed"
                    style={{ 
                      width: `${(analyticsData.deliveryStatus.delayed / (analyticsData.deliveryStatus.delayed + analyticsData.deliveryStatus.immediate)) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
              <div className="timing-item">
                <div className="timing-label">
                  <span>Immediate</span>
                  <span className="timing-count">{analyticsData.deliveryStatus.immediate.toLocaleString()}</span>
                </div>
                <div className="timing-bar-container">
                  <div 
                    className="timing-bar immediate"
                    style={{ 
                      width: `${(analyticsData.deliveryStatus.immediate / (analyticsData.deliveryStatus.delayed + analyticsData.deliveryStatus.immediate)) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="timing-insight">
              <div className="insight-icon">💡</div>
              <p>Smart delay prevented {analyticsData.deliveryStatus.delayed.toLocaleString()} messages during quiet hours, improving engagement rates by respecting user preferences.</p>
            </div>
          </div>
        </div>

        <div className="analytics-card top-rules">
          <div className="card-header">
            <h2>Top Rules Triggered</h2>
            <a href="#" className="view-all">View All</a>
          </div>
          <div className="card-content">
            <div className="rules-list">
              {analyticsData.topRules.map((rule, index) => (
                <div key={index} className="rule-item">
                  <div 
                    className="rule-indicator" 
                    style={{ backgroundColor: getChannelColor(rule.channel) }}
                  ></div>
                  <div className="rule-details">
                    <div className="rule-name">{rule.rule}</div>
                    <div className="rule-meta">
                      <span className="rule-time">{rule.time}</span>
                      <span className="rule-channel">{rule.channel}</span>
                    </div>
                  </div>
                  <div className="rule-count">{rule.triggered}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="analytics-card roi-overview">
          <div className="card-header">
            <h2>ROI Overview</h2>
          </div>
          <div className="card-content">
            <div className="roi-highlight">
              <div className="roi-icon">✓</div>
              <div className="roi-value">${analyticsData.summary.costSavings.toLocaleString()}</div>
              <div className="roi-label">Estimated Monthly Savings</div>
            </div>
            
            <div className="roi-breakdown">
              <div className="roi-item">
                <div className="roi-item-icon">
                  <Mail size={18} />
                </div>
                <div className="roi-item-details">
                  <div className="roi-item-label">Email Cost Saved</div>
                  <div className="roi-item-value">${analyticsData.costAnalysis.emailSaved.toLocaleString()}</div>
                </div>
              </div>
              <div className="roi-item">
                <div className="roi-item-icon">
                  <MessageSquare size={18} />
                </div>
                <div className="roi-item-details">
                  <div className="roi-item-label">SMS Cost Saved</div>
                  <div className="roi-item-value">${analyticsData.costAnalysis.smsSaved.toLocaleString()}</div>
                </div>
              </div>
            </div>
            
            <div className="roi-footer">
              <div className="roi-stat">
                <span>Cost Cut:</span>
                <span className="roi-stat-value">{analyticsData.costAnalysis.totalCostCut}%</span>
              </div>
              <div className="roi-badge">
                <span>✓</span>
                Value Justified
              </div>
            </div>
          </div>
        </div>

        <div className="analytics-card recent-activity">
          <div className="card-header">
            <h2>Recent Activity</h2>
          </div>
          <div className="card-content">
            <div className="activity-list">
              {analyticsData.recentActivity.map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-time">{activity.time}</div>
                  <div className="activity-details">
                    <div className="activity-event">{activity.event}</div>
                    <div className="activity-meta">
                      <span>{activity.user}</span>
                      <span 
                        className="activity-channel" 
                        style={{ 
                          backgroundColor: getChannelColorLight(activity.channel),
                          color: getChannelColor(activity.channel)
                        }}
                      >
                        {activity.channel}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
