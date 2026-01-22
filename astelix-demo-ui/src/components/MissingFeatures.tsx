/// <reference types="../vite-env.d.ts" />
import React, { useState } from 'react';
import { API_CONFIG } from '../config/apiConfig';

// 1️⃣ Enhanced Delay Status Banner Component
interface DelayStatusBannerProps {
  status: string;
  scheduledFor: string;
  reason?: string;
}

export const DelayStatusBanner = ({ status, scheduledFor, reason }: DelayStatusBannerProps) => {
  if (status !== 'delayed') return null;
  
  return (
    <div style={{
      padding: '16px 20px',
      background: 'linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(245,158,11,0.15) 100%)',
      border: '2px solid rgba(251,191,36,0.4)',
      borderRadius: '8px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      boxShadow: '0 4px 12px rgba(251,191,36,0.1)'
    }}>
      <div style={{
        fontSize: '28px',
        lineHeight: '1'
      }}>⏸️</div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '16px',
          fontWeight: '700',
          color: '#fbbf24',
          marginBottom: '4px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          DELAYED – Outside Active Hours
        </div>
        <div style={{
          fontSize: '14px',
          color: '#fde68a',
          marginBottom: '8px'
        }}>
          {reason || 'Message received outside business hours window'}
        </div>
        <div style={{
          fontSize: '13px',
          color: '#fed7aa',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>📅</span>
          <span><strong>Scheduled for:</strong> {scheduledFor}</span>
        </div>
      </div>
    </div>
  );
};

// 2️⃣ Enhanced Rule Explanation Panel - "Why This Fired"
interface RuleExplanationPanelProps {
  rule: string;
  condition: string;
  reasoning: string;
  impact?: string;
}

export const RuleExplanationPanel = ({ rule, condition, reasoning, impact }: RuleExplanationPanelProps) => {
  if (!rule) return null;

  return (
    <div style={{
      marginTop: '20px',
      background: 'rgba(168,85,247,0.1)',
      border: '2px solid rgba(168,85,247,0.3)',
      borderRadius: '8px',
      padding: '20px',
      boxShadow: '0 4px 12px rgba(168,85,247,0.1)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          background: 'rgba(168,85,247,0.2)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px'
        }}>⚙️</div>
        <div>
          <div style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#e9d5ff',
            marginBottom: '2px'
          }}>
            Why This Action Fired
          </div>
          <div style={{
            fontSize: '12px',
            color: '#d8b4fe',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Rule Engine Analysis
          </div>
        </div>
      </div>

      <div style={{
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '6px',
        padding: '16px',
        marginBottom: '12px'
      }}>
        <div style={{
          fontSize: '13px',
          color: '#c084fa',
          fontWeight: '600',
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Rule Triggered
        </div>
        <div style={{
          fontSize: '16px',
          color: '#e9d5ff',
          fontWeight: '500',
          fontFamily: 'monospace',
          background: 'rgba(168,85,247,0.1)',
          padding: '8px 12px',
          borderRadius: '4px',
          border: '1px solid rgba(168,85,247,0.2)'
        }}>
          {rule}
        </div>
      </div>

      <div style={{
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '6px',
        padding: '16px',
        marginBottom: '12px'
      }}>
        <div style={{
          fontSize: '13px',
          color: '#c084fa',
          fontWeight: '600',
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Condition Matched
        </div>
        <div style={{
          fontSize: '14px',
          color: '#d8b4fe',
          lineHeight: '1.6'
        }}>
          {condition}
        </div>
      </div>

      <div style={{
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '6px',
        padding: '16px',
        marginBottom: '12px'
      }}>
        <div style={{
          fontSize: '13px',
          color: '#c084fa',
          fontWeight: '600',
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Plain English Explanation
        </div>
        <div style={{
          fontSize: '14px',
          color: '#e9d5ff',
          lineHeight: '1.6'
        }}>
          {reasoning}
        </div>
      </div>

      {impact && (
        <div style={{
          background: 'rgba(34,197,94,0.1)',
          border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: '6px',
          padding: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '16px' }}>✓</span>
          <div style={{
            fontSize: '13px',
            color: '#86efac',
            fontWeight: '500'
          }}>
            <strong>Impact:</strong> {impact}
          </div>
        </div>
      )}
    </div>
  );
};

// 4️⃣ Channel Badge Component
interface ChannelBadgeProps {
  channel: string;
  simulated?: boolean;
}

export const ChannelBadgeComponent = ({ channel, simulated = true }: ChannelBadgeProps) => {
  const channelConfig: { [key: string]: { icon: string; color: string; bg: string } } = {
    SMS: { icon: '📱', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
    Email: { icon: '📧', color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
    Push: { icon: '🔔', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    Webhook: { icon: '🔗', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
    Slack: { icon: '💬', color: '#ec4899', bg: 'rgba(236,72,153,0.1)' }
  };

  const config = channelConfig[channel] || channelConfig['SMS'];

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 12px',
      background: config.bg,
      border: `1px solid ${config.color}40`,
      borderRadius: '6px',
      fontSize: '13px',
      fontWeight: '600'
    }}>
      <span>{config.icon}</span>
      <span style={{ color: config.color }}>{channel}</span>
      {simulated && (
        <span style={{
          fontSize: '10px',
          color: '#9ca3af',
          fontWeight: '500',
          marginLeft: '4px'
        }}>
          (Simulated)
        </span>
      )}
    </div>
  );
};

// 4️⃣ Channel Orchestration Panel
interface ChannelOrchestrationPanelProps {
  channels?: string[];
}

export const ChannelOrchestrationPanel = ({ channels = ['SMS', 'Email', 'Push'] }: ChannelOrchestrationPanelProps) => {
  return (
    <div style={{
      background: 'rgba(17,24,39,0.5)',
      border: '1px solid #1f2937',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px'
      }}>
        <div style={{
          fontSize: '24px'
        }}>🔄</div>
        <div>
          <div style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#e5e7eb',
            marginBottom: '2px'
          }}>
            Channel-Agnostic Orchestration
          </div>
          <div style={{
            fontSize: '12px',
            color: '#9ca3af'
          }}>
            Multi-channel delivery with unified rule engine
          </div>
        </div>
      </div>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '12px'
      }}>
        {channels.map(channel => (
          <ChannelBadgeComponent key={channel} channel={channel} simulated={true} />
        ))}
      </div>

      <div style={{
        background: 'rgba(59,130,246,0.05)',
        border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: '6px',
        padding: '12px',
        fontSize: '12px',
        color: '#93c5fd'
      }}>
        <strong>Demo Mode:</strong> All channels are simulated. In production, integrate with real SMS, Email, Push, and Webhook providers.
      </div>
    </div>
  );
};

// 7️⃣ API & Auth Visibility Panel
interface APIAuthPanelProps {
  expanded?: boolean;
  apiKey?: string;
  endpoint?: string;
  rateLimit?: { used: number; total: number };
  uptime?: number;
}

export const APIAuthPanel = ({
  expanded = true,
  apiKey = import.meta.env.VITE_REACT_APP_API_KEY || 'sk_live_demo_mode_test_key',
  endpoint = `${API_CONFIG.baseUrl}/api/demo`,
  rateLimit = { used: 4, total: 5000 },
  uptime = 99.98,
}: APIAuthPanelProps) => {
  const [showKey, setShowKey] = useState(false);

  // Mask the API key - show first 10 and last 4 chars, hide the rest
  const maskKey = (key: string) => {
    if (key.length <= 14) return '••••••••••••••••';
    return key.slice(0, 10) + '•'.repeat(key.length - 14) + key.slice(-4);
  };

  const maskedKey = maskKey(apiKey);
  const fullKey = apiKey;
  const isDemoMode = apiKey.includes('demo') || apiKey.includes('test');

  return (
    <div style={{
      background: 'rgba(17,24,39,0.5)',
      border: '1px solid #1f2937',
      borderRadius: '8px',
      padding: '20px',
      marginBottom: '20px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            fontSize: '24px'
          }}>🔑</div>
          <div>
            <div style={{
              fontSize: '16px',
              fontWeight: '700',
              color: '#e5e7eb',
              marginBottom: '2px'
            }}>
              API & Authentication
            </div>
            <div style={{
              fontSize: '12px',
              color: '#9ca3af'
            }}>
              Integration credentials and status
            </div>
          </div>
        </div>
        <div style={{
          padding: '4px 10px',
          background: 'rgba(34,197,94,0.1)',
          border: '1px solid rgba(34,197,94,0.3)',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: '600',
          color: '#4ade80',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <div style={{
            width: '6px',
            height: '6px',
            background: '#4ade80',
            borderRadius: '50%',
            animation: 'pulse 2s infinite'
          }}></div>
          AUTHENTICATED
        </div>
      </div>

      {expanded && (
        <>
          <div style={{
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '6px',
            padding: '16px',
            marginBottom: '12px'
          }}>
            <div style={{
              fontSize: '12px',
              color: '#9ca3af',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontWeight: '600'
            }}>
              API Key
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'monospace',
              fontSize: '13px',
              color: '#e5e7eb',
              background: 'rgba(0,0,0,0.3)',
              padding: '10px 12px',
              borderRadius: '4px',
              border: '1px solid #374151'
            }}>
              <span style={{ flex: 1 }}>
                {showKey ? fullKey : maskedKey}
              </span>
              <button
                onClick={() => setShowKey(!showKey)}
                style={{
                  background: 'rgba(107,114,128,0.2)',
                  border: '1px solid #4b5563',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  color: '#d1d5db',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                {showKey ? '👁️ Hide' : '👁️ Show'}
              </button>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <div style={{
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '6px',
              padding: '12px'
            }}>
              <div style={{
                fontSize: '11px',
                color: '#9ca3af',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: '600'
              }}>
                Rate Limit
              </div>
              <div style={{
                fontSize: '16px',
                color: '#60a5fa',
                fontWeight: '600'
              }}>
                {rateLimit.used.toLocaleString()} / {rateLimit.total.toLocaleString()}
              </div>
              <div style={{
                fontSize: '11px',
                color: '#6b7280',
                marginTop: '4px'
              }}>
                {isDemoMode ? 'Demo Mode' : 'Resets in 2h 34m'}
              </div>
            </div>

            <div style={{
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '6px',
              padding: '12px'
            }}>
              <div style={{
                fontSize: '11px',
                color: '#9ca3af',
                marginBottom: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: '600'
              }}>
                API Status
              </div>
              <div style={{
                fontSize: '16px',
                color: '#4ade80',
                fontWeight: '600'
              }}>
                Operational
              </div>
              <div style={{
                fontSize: '11px',
                color: '#6b7280',
                marginTop: '4px'
              }}>
                {uptime}% uptime
              </div>
            </div>
          </div>

          <div style={{
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '6px',
            padding: '12px'
          }}>
            <div style={{
              fontSize: '12px',
              color: '#9ca3af',
              marginBottom: '8px',
              fontWeight: '600'
            }}>
              Example Endpoint
            </div>
            <div style={{
              fontFamily: 'monospace',
              fontSize: '12px',
              color: '#86efac',
              background: 'rgba(0,0,0,0.4)',
              padding: '8px 10px',
              borderRadius: '4px',
              overflowX: 'auto',
              wordBreak: 'break-all'
            }}>
              POST {endpoint}/dual-time
            </div>
            {isDemoMode && (
              <div style={{
                fontSize: '11px',
                color: '#fbbf24',
                marginTop: '8px',
                fontStyle: 'italic'
              }}>
                💡 Using demo/test credentials
              </div>
            )}
          </div>

          <div style={{
            marginTop: '12px',
            padding: '12px',
            background: 'rgba(59,130,246,0.05)',
            border: '1px solid rgba(59,130,246,0.2)',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#93c5fd'
          }}>
            📖 <strong>Documentation:</strong>{' '}
            <a 
              href="/API_REFERENCE.md" 
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#60a5fa', textDecoration: 'underline', cursor: 'pointer' }}
            >
              View API Reference
            </a>
          </div>
        </>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

// 8️⃣ 15-Minute Demo Script Component
export const DemoScriptGuide = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const demoSteps = [
    {
      number: 1,
      title: 'The Problem',
      duration: '2 min',
      icon: '❗',
      color: '#f87171',
      content: [
        'Show cross-timezone confusion scenario',
        'Highlight: "Message sent 2 AM EST → User in PST gets woken up"',
        'Pain point: Manual scheduling is unreliable',
        'Without LIXETA: Developers hardcode time logic everywhere'
      ]
    },
    {
      number: 2,
      title: 'Sandbox Action',
      duration: '3 min',
      icon: '🎮',
      color: '#60a5fa',
      content: [
        'Trigger "Dual-Time Message" scenario',
        'Show login event in "Fintech Login" flow',
        'Demonstrate active hours window check',
        'Live timeline showing real-time rule evaluation'
      ]
    },
    {
      number: 3,
      title: 'Rule Firing',
      duration: '5 min',
      icon: '⚙️',
      color: '#c084fa',
      content: [
        'Explain "Why This Action Fired" panel',
        'Show condition matching logic',
        'Highlight rule engine execution steps',
        'Demonstrate channel-agnostic orchestration',
        'Display API integration panel'
      ]
    },
    {
      number: 4,
      title: 'The Result',
      duration: '5 min',
      icon: '✅',
      color: '#4ade80',
      content: [
        'Show delayed message with timeline',
        'Highlight scheduled delivery time',
        'Display metadata: UTC + local times',
        'Demonstrate execution complete status',
        'Q&A: Integration, pricing, next steps'
      ]
    }
  ];

  return (
    <div style={{
      background: 'rgba(17,24,39,0.5)',
      border: '1px solid #1f2937',
      borderRadius: '8px',
      padding: '24px'
    }}>
      <div style={{
        marginBottom: '24px'
      }}>
        <div style={{
          fontSize: '20px',
          fontWeight: '700',
          color: '#e5e7eb',
          marginBottom: '4px'
        }}>
          📋 15-Minute Demo Script
        </div>
        <div style={{
          fontSize: '14px',
          color: '#9ca3af'
        }}>
          Follow this flow for a smooth, compelling demonstration
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        overflowX: 'auto',
        paddingBottom: '8px'
      }}>
        {demoSteps.map((step, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentStep(idx)}
            style={{
              minWidth: '120px',
              padding: '12px',
              background: currentStep === idx ? 'rgba(168,85,247,0.2)' : 'rgba(31,41,55,0.5)',
              border: currentStep === idx ? '2px solid rgba(168,85,247,0.5)' : '1px solid #374151',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'left'
            }}
          >
            <div style={{
              fontSize: '24px',
              marginBottom: '8px'
            }}>
              {step.icon}
            </div>
            <div style={{
              fontSize: '13px',
              fontWeight: '600',
              color: currentStep === idx ? '#e9d5ff' : '#d1d5db',
              marginBottom: '4px'
            }}>
              Step {step.number}
            </div>
            <div style={{
              fontSize: '11px',
              color: '#9ca3af'
            }}>
              {step.duration}
            </div>
          </button>
        ))}
      </div>

      <div style={{
        background: 'rgba(0,0,0,0.3)',
        borderRadius: '8px',
        padding: '20px',
        borderLeft: `4px solid ${demoSteps[currentStep].color}`
      }}>
        <div style={{
          fontSize: '18px',
          fontWeight: '700',
          color: '#e5e7eb',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '32px' }}>{demoSteps[currentStep].icon}</span>
          <span>{demoSteps[currentStep].title}</span>
          <span style={{
            fontSize: '12px',
            color: '#9ca3af',
            fontWeight: '500',
            marginLeft: 'auto'
          }}>
            {demoSteps[currentStep].duration}
          </span>
        </div>

        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {demoSteps[currentStep].content.map((item, idx) => (
            <li
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                fontSize: '14px',
                color: '#d1d5db',
                padding: '10px',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '6px'
              }}
            >
              <span style={{
                fontSize: '16px',
                color: demoSteps[currentStep].color,
                fontWeight: '700',
                minWidth: '24px'
              }}>
                {idx + 1}.
              </span>
              <span style={{ flex: 1, paddingTop: '2px' }}>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div style={{
        marginTop: '20px',
        display: 'flex',
        gap: '12px',
        justifyContent: 'space-between'
      }}>
        <button
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          style={{
            padding: '10px 20px',
            background: currentStep === 0 ? 'rgba(55,65,81,0.3)' : 'rgba(107,114,128,0.2)',
            border: '1px solid #4b5563',
            borderRadius: '6px',
            color: currentStep === 0 ? '#6b7280' : '#d1d5db',
            fontSize: '14px',
            fontWeight: '600',
            cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
            opacity: currentStep === 0 ? 0.5 : 1
          }}
        >
          ← Previous
        </button>

        <button
          onClick={() => setCurrentStep(Math.min(demoSteps.length - 1, currentStep + 1))}
          disabled={currentStep === demoSteps.length - 1}
          style={{
            padding: '10px 20px',
            background: currentStep === demoSteps.length - 1 ? 'rgba(55,65,81,0.3)' : 'rgba(168,85,247,0.2)',
            border: currentStep === demoSteps.length - 1 ? '1px solid #4b5563' : '1px solid rgba(168,85,247,0.5)',
            borderRadius: '6px',
            color: currentStep === demoSteps.length - 1 ? '#6b7280' : '#e9d5ff',
            fontSize: '14px',
            fontWeight: '600',
            cursor: currentStep === demoSteps.length - 1 ? 'not-allowed' : 'pointer',
            opacity: currentStep === demoSteps.length - 1 ? 0.5 : 1
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
};
