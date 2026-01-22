/// <reference types="./vite-env.d.ts" />
import React, { useState } from "react";
import MessageLifecyclePanel from "./components/MessageLifecyclePanel";
import TimelineWithDelay from "./components/TimelineWithDelay";
import ExplanationPanel from "./components/ExplanationPanel";
import DemoStatusBanner from "./components/DemoStatusBanner";
import PresenterControls from "./components/PresenterControls";
import { runDemoScenario } from "./services/demoApi";
import {
  DelayStatusBanner,
  RuleExplanationPanel,
  ChannelOrchestrationPanel,
  APIAuthPanel,
  DemoScriptGuide,
} from "./components/MissingFeatures";

type ScenarioId =
  | "dual-time"
  | "behavior-reminder"
  | "fintech-login"
  | "active-hours";

interface TimelineEvent {
  relativeTime: string;
  message: string;
  type: "info" | "action" | "rule" | "warning" | "error";
}

interface Metadata {
  utcTime: string;
  senderLocal: string;
  receiverLocal: string;
  rule: string;
  action: string;
  status: string;
}

const SCENARIOS = [
  { id: "dual-time", label: "🌍 Dual-Time Message" },
  { id: "behavior-reminder", label: "⚙️ Auto-Reminder Rule" },
  { id: "fintech-login", label: "💳 Fintech Login Flow" },
  { id: "active-hours", label: "🔒 Active Hours Window" },
];

// Icon Components
const ClockIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ZapIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const AlertCircleIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const AlertTriangleIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

// Helper to parse relative time delays
function parseDelay(relativeTime: string): number {
  if (relativeTime.includes("0s")) return 0;
  if (relativeTime.includes("5s")) return 5000;
  if (relativeTime.includes("10m")) return 2000;
  return 0;
}

function getRuleCondition(scenario: ScenarioId, metadata: Metadata): string {
  switch (scenario) {
    case "dual-time":
      return `Message received with different sender (${metadata.senderLocal}) and receiver (${metadata.receiverLocal}) timezones detected`;
    case "behavior-reminder":
      return "Message delivered but no reply received within 10 minutes";
    case "fintech-login":
      return "User authentication event detected on fintech platform";
    case "active-hours":
      return `Current time falls outside active hours window (9 AM - 6 PM ${metadata.receiverLocal})`;
    default:
      return "Condition not available";
  }
}

function getRuleReasoning(scenario: ScenarioId, metadata: Metadata): string {
  switch (scenario) {
    case "dual-time":
      return `The system automatically detects the sender's timezone (${metadata.senderLocal}) and receiver's timezone (${metadata.receiverLocal}), then resolves local times for both parties. This ensures the message is contextualized with time information relevant to each user's location.`;
    case "behavior-reminder":
      return "After a message is successfully delivered, the system monitors for a reply. If no response is received within the configured 10-minute window, the behavior rule automatically triggers a reminder action to prompt the user.";
    case "fintech-login":
      return "When a user logs in, the system matches against configured rules. Multiple rules fire triggering sequential actions to create a smooth user experience without overwhelming the interface.";
    case "active-hours":
      return `The user is located in the ${metadata.receiverLocal} timezone. To respect their schedule and avoid disrupting their rest, the system automatically delays delivery until the next business day during active hours.`;
    default:
      return "Reasoning not available";
  }
}

function getRuleImpact(scenario: ScenarioId, metadata: Metadata): string {
  switch (scenario) {
    case "dual-time":
      return "Message metadata enriched with UTC and local times for both sender and receiver, improving message context and engagement";
    case "behavior-reminder":
      return "Automated reminder sent, increasing engagement and reducing missed requests";
    case "fintech-login":
      return "Sequential actions displayed, improving onboarding and feature discovery";
    case "active-hours":
      return "Message delayed to ensure delivery during active hours, improving user experience and engagement rates";
    default:
      return "Impact not available";
  }
}

// API Service (handled by demoApi.js)
// All demo scenarios are managed by the backend service

function getEngineSteps() {
  // Engine execution flow now managed by backend - no hardcoded steps
  return [];
}

// Rule explanations now dynamically generated from backend metadata

const App = () => {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioId | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [currentEventIndex, setCurrentEventIndex] = useState(-1);
  const [demoComplete, setDemoComplete] = useState(false);

  const handleRunScenario = async (scenarioId: ScenarioId) => {
    setSelectedScenario(scenarioId);
    setLoading(true);
    setError(null);
    setEvents([]);
    setMetadata(null);
    setCurrentEventIndex(-1);
    setDemoComplete(false);

    try {
      const result = await runDemoScenario(scenarioId);
      setMetadata(result.metadata);

      let stagedEvents: TimelineEvent[] = [];
      for (let i = 0; i < result.timeline.length; i++) {
        const event = result.timeline[i];

        await new Promise((resolve) =>
          setTimeout(resolve, parseDelay(event.relativeTime)),
        );
        stagedEvents = [...stagedEvents, event];
        setEvents(stagedEvents);
        setCurrentEventIndex(i);
      }
      setDemoComplete(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run demo");
      console.error("Demo error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("success") || s.includes("delivered"))
      return "status-success";
    if (s.includes("delayed") || s.includes("pending")) return "status-delayed";
    if (
      s.includes("triggered") ||
      s.includes("active") ||
      s.includes("executed")
    )
      return "status-triggered";
    if (s.includes("error") || s.includes("failed")) return "status-error";
    return "status-default";
  };

  return (
    <div
      style={{ minHeight: "100vh", background: "#030712", color: "#f3f4f6" }}
    >
      <header
        style={{
          borderBottom: "1px solid #1f2937",
          background: "rgba(17, 24, 39, 0.5)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "24px",
                fontWeight: "700",
                margin: 0,
                letterSpacing: "-0.025em",
              }}
            >
              LIXETA
            </h1>
            <p style={{ fontSize: "14px", color: "#9ca3af", marginTop: "2px" }}>
              Time-Aware Messaging & Action Intelligence
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <PresenterControls onRunAll={() => handleRunScenario("dual-time")} />
            <div
              style={{
                padding: "6px 12px",
                background: "rgba(168, 85, 247, 0.1)",
                border: "1px solid rgba(168, 85, 247, 0.2)",
                borderRadius: "6px",
              }}
            >
              <span
                style={{ fontSize: "12px", fontWeight: "500", color: "#c084fa" }}
              >
                Demo Mode • Read-only
              </span>
            </div>
          </div>
        </div>
      </header>

      <div
        className="main-container"
        style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 24px" }}
      >
        {/* 📋 Demo Script Guide */}
        <DemoScriptGuide />

        <div className="grid-layout">
          <div className="sidebar">
            <div
              style={{
                background: "rgba(17, 24, 39, 0.5)",
                border: "1px solid #1f2937",
                borderRadius: "8px",
                padding: "20px",
                position: "sticky",
                top: "32px",
              }}
            >
              <h2
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#d1d5db",
                  marginBottom: "16px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Scenarios
              </h2>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                {SCENARIOS.map((scenario) => (
                  <button
                    key={scenario.id}
                    onClick={() => handleRunScenario(scenario.id as ScenarioId)}
                    disabled={loading}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 16px",
                      borderRadius: "6px",
                      fontSize: "14px",
                      border:
                        selectedScenario === scenario.id && !loading
                          ? "1px solid rgba(168, 85, 247, 0.5)"
                          : "1px solid rgba(55, 65, 81, 0.5)",
                      background:
                        selectedScenario === scenario.id && !loading
                          ? "rgba(168, 85, 247, 0.2)"
                          : "rgba(31, 41, 55, 0.5)",
                      color:
                        selectedScenario === scenario.id && !loading
                          ? "#e9d5ff"
                          : "#d1d5db",
                      cursor: loading ? "not-allowed" : "pointer",
                      opacity: loading ? 0.5 : 1,
                      transition: "all 0.2s",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background:
                          selectedScenario === scenario.id
                            ? "#c084fa"
                            : "#6b7280",
                        marginRight: "8px",
                      }}
                    ></span>
                    {scenario.label}
                  </button>
                ))}
              </div>

              {loading && (
                <div
                  style={{
                    marginTop: "16px",
                    paddingTop: "16px",
                    borderTop: "1px solid #1f2937",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "14px",
                      color: "#9ca3af",
                    }}
                  >
                    <div className="spinner"></div>
                    <span>Running demo...</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="content">
            {/* 🔄 Channel Orchestration Panel */}
            {selectedScenario && !loading && (
              <ChannelOrchestrationPanel channels={["SMS", "Email", "Push", "Webhook"]} />
            )}

            {/* ⏸️ Delay Status Banner for active-hours scenario */}
            {selectedScenario === "active-hours" && metadata && metadata.status === "delayed" && (
              <DelayStatusBanner
                status="delayed"
                scheduledFor={metadata.receiverLocal || "Tomorrow at 9:00 AM PST"}
                reason="Receiver is in PST timezone, currently outside 9 AM - 6 PM window"
              />
            )}

            {metadata && (
              <MessageLifecyclePanel
                lifecycle={{
                  id: `msg-${Date.now()}`,
                  utcTime: metadata.utcTime,
                  senderLocal: metadata.senderLocal,
                  receiverLocal: metadata.receiverLocal,
                  status: metadata.status,
                }}
              />
            )}

            <div
              style={{
                marginTop: metadata ? "16px" : 0,
                background: "rgba(17, 24, 39, 0.5)",
                border: "1px solid #1f2937",
                borderRadius: "8px",
                padding: "24px",
              }}
            >
              <h2
                style={{
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#d1d5db",
                  marginBottom: "16px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Event Timeline
              </h2>

              <TimelineWithDelay events={events.map(e => ({
                relativeTime: e.relativeTime,
                message: e.message,
                type: e.type,
              }))} />

              {error ? (
                <div style={{ textAlign: "center", padding: "64px 0" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      margin: "0 auto 12px",
                      color: "#f87171",
                      opacity: 0.5,
                    }}
                  >
                    <AlertCircleIcon />
                  </div>
                  <p style={{ fontSize: "14px", color: "#f87171" }}>
                    {error}
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      marginTop: "8px",
                    }}
                  >
                    Try selecting a different scenario
                  </p>
                </div>
              ) : events.length === 0 && !loading ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "64px 0",
                    color: "#6b7280",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      margin: "0 auto 12px",
                      opacity: 0.3,
                    }}
                  >
                    <ClockIcon />
                  </div>
                  <p style={{ fontSize: "14px" }}>
                    Select a scenario to begin
                  </p>
                </div>
              ) : null}
            </div>

            {currentEventIndex >= 0 && (
              <ExplanationPanel currentEvent={events[currentEventIndex]} />
            )}

            {/* ⚙️ Rule Explanation Panel with backend data */}
            {currentEventIndex >= 0 && selectedScenario && metadata && (
              <RuleExplanationPanel
                rule={metadata.rule}
                condition={getRuleCondition(selectedScenario, metadata)}
                reasoning={getRuleReasoning(selectedScenario, metadata)}
                impact={getRuleImpact(selectedScenario, metadata)}
              />
            )}
          </div>
        </div>

        {/* Engine Execution Flow is managed by the backend - no hardcoded steps */}

        {metadata && (
          <div
            style={{
              marginTop: "24px",
              background: "rgba(17, 24, 39, 0.5)",
              border: "1px solid #1f2937",
              borderRadius: "8px",
              padding: "24px",
            }}
          >
            <h2
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#d1d5db",
                marginBottom: "16px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Metadata & Rule Inspector
            </h2>
            <div className="metadata-grid">
              <div>
                <h3
                  style={{
                    fontSize: "11px",
                    fontWeight: "600",
                    color: "#9ca3af",
                    marginBottom: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  ⏱ Time Intelligence
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    fontSize: "14px",
                  }}
                >
                  <div
                    style={{
                      paddingTop: "6px",
                      paddingBottom: "6px",
                      borderBottom: "1px solid #1f2937",
                    }}
                  >
                    <div style={{ color: "#9ca3af", marginBottom: "4px" }}>
                      UTC Time
                    </div>
                    <div
                      style={{
                        fontFamily: "monospace",
                        color: "#e5e7eb",
                        fontSize: "12px",
                      }}
                    >
                      {metadata.utcTime}
                    </div>
                  </div>
                  <div
                    style={{
                      paddingTop: "6px",
                      paddingBottom: "6px",
                      borderBottom: "1px solid #1f2937",
                    }}
                  >
                    <div style={{ color: "#9ca3af", marginBottom: "4px" }}>
                      Sender Local
                    </div>
                    <div style={{ fontFamily: "monospace", color: "#e5e7eb" }}>
                      {metadata.senderLocal}
                    </div>
                  </div>
                  <div style={{ paddingTop: "6px", paddingBottom: "6px" }}>
                    <div style={{ color: "#9ca3af", marginBottom: "4px" }}>
                      Receiver Local
                    </div>
                    <div style={{ fontFamily: "monospace", color: "#e5e7eb" }}>
                      {metadata.receiverLocal}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3
                  style={{
                    fontSize: "11px",
                    fontWeight: "600",
                    color: "#9ca3af",
                    marginBottom: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  ⚙️ Rule Execution
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    fontSize: "14px",
                  }}
                >
                  <div
                    style={{
                      paddingTop: "6px",
                      paddingBottom: "6px",
                      borderBottom: "1px solid #1f2937",
                    }}
                  >
                    <div style={{ color: "#9ca3af", marginBottom: "4px" }}>
                      Rule Fired
                    </div>
                    <div
                      style={{
                        color: "#d8b4fe",
                        fontWeight: "500",
                        textTransform: "capitalize",
                      }}
                    >
                      {metadata.rule.replace(/_/g, " ")}
                    </div>
                  </div>
                  <div style={{ paddingTop: "6px", paddingBottom: "6px" }}>
                    <div style={{ color: "#9ca3af", marginBottom: "4px" }}>
                      Action Executed
                    </div>
                    <div
                      style={{ color: "#86efac", textTransform: "capitalize" }}
                    >
                      {metadata.action.replace(/_/g, " ")}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3
                  style={{
                    fontSize: "11px",
                    fontWeight: "600",
                    color: "#9ca3af",
                    marginBottom: "12px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  📌 Status
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    fontSize: "14px",
                  }}
                >
                  <div style={{ paddingTop: "6px", paddingBottom: "6px" }}>
                    <div style={{ color: "#9ca3af", marginBottom: "4px" }}>
                      Current Status
                    </div>
                    <div
                      className={getStatusColor(metadata.status)}
                      style={{ fontWeight: "500", textTransform: "capitalize" }}
                    >
                      {metadata.status}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {demoComplete && (
          <DemoStatusBanner status="Execution Complete ✓" />
        )}

        {/* 🔑 API & Authentication Panel */}
        {selectedScenario && !loading && (
          <APIAuthPanel
            expanded={true}
            apiKey={import.meta.env.VITE_REACT_APP_API_KEY || 'sk_live_test_demo_mode'}
            endpoint={`http://localhost:3000/api/demo/${selectedScenario}`}
            rateLimit={{ used: 127, total: 5000 }}
            uptime={99.97}
          />
        )}
      </div>

      <style>{`
        /* App Header */
        .app-header {
          border-bottom: 1px solid #1f2937;
          background: rgba(17, 24, 39, 0.5);
          backdrop-filter: blur(8px);
        }

        .header-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }
        
        .header-title {
          font-size: 24px;
          font-weight: 700;
          margin: 0;
          letter-spacing: -0.025em;
        }
        
        .header-subtitle {
          font-size: 14px;
          color: #9ca3af;
          margin-top: 2px;
          margin-bottom: 0;
        }
        
        .header-controls {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }
        
        .demo-badge {
          padding: 6px 12px;
          background: rgba(168, 85, 247, 0.1);
          border: 1px solid rgba(168, 85, 247, 0.2);
          border-radius: 6px;
        }
        
        .demo-badge-text {
          font-size: 12px;
          font-weight: 500;
          color: #c084fa;
          white-space: nowrap;
        }
        
        /* Main Container */
        .main-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 32px 24px;
        }
        
        /* Section Titles */
        .section-title {
          font-size: 12px;
          font-weight: 600;
          color: #d1d5db;
          margin-bottom: 16px;
          margin-top: 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        /* Grid Layout */
        .grid-layout {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 24px;
        }
        
        .sidebar {
          grid-column: span 3;
        }
        
        .content {
          grid-column: span 9;
        }
        
        /* Sidebar */
        .sidebar-content {
          background: rgba(17, 24, 39, 0.5);
          border: 1px solid #1f2937;
          border-radius: 8px;
          padding: 20px;
          position: sticky;
          top: 32px;
        }
        
        .scenario-buttons {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .scenario-button {
          width: 100%;
          text-align: left;
          padding: 10px 16px;
          border-radius: 6px;
          font-size: 14px;
          border: 1px solid rgba(55, 65, 81, 0.5);
          background: rgba(31, 41, 55, 0.5);
          color: #d1d5db;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .scenario-button.active {
          border: 1px solid rgba(168, 85, 247, 0.5);
          background: rgba(168, 85, 247, 0.2);
          color: #e9d5ff;
        }
        
        .scenario-button.disabled {
          cursor: not-allowed;
          opacity: 0.5;
        }
        
        .scenario-button:hover:not(.disabled) {
          background: rgba(31, 41, 55, 0.8);
        }
        
        .scenario-button.active:hover:not(.disabled) {
          background: rgba(168, 85, 247, 0.3);
        }
        
        .scenario-indicator {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #6b7280;
          margin-right: 8px;
          vertical-align: middle;
        }
        
        .scenario-indicator.active {
          background: #c084fa;
        }
        
        .loading-indicator {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid #1f2937;
        }
        
        .loading-content {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #9ca3af;
        }
        
        /* Timeline Card */
        .timeline-card {
          background: rgba(17, 24, 39, 0.5);
          border: 1px solid #1f2937;
          border-radius: 8px;
          padding: 24px;
        }
        
        /* Empty States */
        .empty-state {
          text-align: center;
          padding: 64px 16px;
        }
        
        .empty-state-icon {
          display: flex;
          justify-content: center;
          margin: 0 auto 12px;
          opacity: 0.3;
          color: #6b7280;
        }
        
        .empty-state-icon.error {
          color: #f87171;
          opacity: 0.5;
        }
        
        .empty-state-text {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }
        
        .empty-state-text.error {
          color: #f87171;
        }
        
        .empty-state-hint {
          font-size: 12px;
          color: #6b7280;
          margin-top: 8px;
          margin-bottom: 0;
        }
        
        /* Metadata Panel */
        .metadata-panel {
          margin-top: 24px;
          background: rgba(17, 24, 39, 0.5);
          border: 1px solid #1f2937;
          border-radius: 8px;
          padding: 24px;
        }
        
        .metadata-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        
        .metadata-section-title {
          font-size: 11px;
          font-weight: 600;
          color: #9ca3af;
          margin-bottom: 12px;
          margin-top: 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .metadata-items {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 14px;
        }
        
        .metadata-item {
          padding-top: 6px;
          padding-bottom: 6px;
          border-bottom: 1px solid #1f2937;
        }
        
        .metadata-item.last {
          border-bottom: none;
        }
        
        .metadata-label {
          color: #9ca3af;
          margin-bottom: 4px;
          font-size: 13px;
        }
        
        .metadata-value {
          color: #e5e7eb;
        }
        
        .metadata-value.mono {
          font-family: monospace;
          font-size: 12px;
        }
        
        .metadata-value.rule {
          color: #d8b4fe;
          font-weight: 500;
          text-transform: capitalize;
        }
        
        .metadata-value.action {
          color: #86efac;
          text-transform: capitalize;
        }
        
        .metadata-value.status {
          font-weight: 500;
          text-transform: capitalize;
        }

        /* Artifact Styles */
        .artifact-card {
          padding: 12px;
          background: rgba(31, 41, 55, 0.4);
          border-radius: 4px;
          border-left: 3px solid #a78bfa;
        }

        .artifact-message {
          border-left: 3px solid #4ade80;
          padding-left: 12px;
        }

        .artifact-reminder {
          border-left: 3px solid #4ade80;
        }

        .artifact-popup {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .artifact-delay {
          border-left: 3px solid #fbbf24;
        }

        .artifact-scheduled {
          border-left: 3px solid #c084fa;
        }

        .delivered {
          color: #4ade80;
          font-size: 12px;
          font-weight: 500;
        }

        /* Timeline Styles */
        .timeline-container {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 384px;
          overflow-y: auto;
          padding-right: 8px;
        }
        
        .timeline-container::-webkit-scrollbar {
          width: 6px;
        }
        
        .timeline-container::-webkit-scrollbar-track {
          background: rgb(17 24 39);
          border-radius: 3px;
        }
        
        .timeline-container::-webkit-scrollbar-thumb {
          background: rgb(55 65 81);
          border-radius: 3px;
        }
        
        .timeline-container::-webkit-scrollbar-thumb:hover {
          background: rgb(75 85 99);
        }

        .timeline-event {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px;
          background: rgba(31, 41, 55, 0.3);
          border: 1px solid;
          border-radius: 6px;
          transition: all 0.2s;
          font-size: 14px;
        }

        .event-info {
          border-color: rgba(59, 130, 246, 0.3);
        }
        
        .event-info .event-icon {
          color: #60a5fa;
        }

        .event-action {
          border-color: rgba(34, 197, 94, 0.3);
        }
        
        .event-action .event-icon {
          color: #4ade80;
        }

        .event-rule {
          border-color: rgba(168, 85, 247, 0.3);
        }
        
        .event-rule .event-icon {
          color: #c084fa;
        }

        .event-warning {
          border-color: rgba(234, 179, 8, 0.3);
        }
        
        .event-warning .event-icon {
          color: #facc15;
        }

        .event-error {
          border-color: rgba(239, 68, 68, 0.3);
        }
        
        .event-error .event-icon {
          color: #f87171;
        }

        .event-default {
          border-color: rgba(107, 114, 128, 0.3);
        }
        
        .event-default .event-icon {
          color: #9ca3af;
        }

        /* Status Colors */
        .status-success {
          color: #4ade80;
        }

        .status-delayed {
          color: #facc15;
        }

        .status-triggered {
          color: #c084fa;
        }

        .status-error {
          color: #f87171;
        }

        .status-default {
          color: #9ca3af;
        }

        /* Spinner */
        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #a855f7;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Tablet Responsive (1024px and below) */
        @media (max-width: 1024px) {
          .header-container {
            padding: 14px 20px;
          }
          
          .header-title {
            font-size: 22px;
          }
          
          .header-subtitle {
            font-size: 13px;
          }
          
          .main-container {
            padding: 24px 20px;
          }
          
          .grid-layout {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          
          .sidebar {
            grid-column: span 1;
          }
          
          .content {
            grid-column: span 1;
          }
          
          .sidebar-content {
            position: static !important;
            top: auto;
          }
          
          .metadata-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
          }
          
          .timeline-card,
          .metadata-panel,
          .engine-panel {
            padding: 20px;
          }
        }
        
        /* Mobile Responsive (768px and below) */
        @media (max-width: 768px) {
          .header-container {
            padding: 12px 16px;
            gap: 10px;
          }
          
          .header-title {
            font-size: 20px;
          }
          
          .header-subtitle {
            font-size: 12px;
            margin-top: 4px;
          }
          
          .header-controls {
            width: 100%;
            justify-content: space-between;
          }
          
          .demo-badge {
            padding: 4px 10px;
          }
          
          .demo-badge-text {
            font-size: 11px;
          }
          
          .main-container {
            padding: 20px 16px;
          }
          
          .grid-layout {
            gap: 16px;
          }
          
          .sidebar-content {
            padding: 16px;
          }
          
          .section-title {
            font-size: 11px;
            margin-bottom: 14px;
          }
          
          .scenario-button {
            padding: 9px 14px;
            font-size: 13px;
          }
          
          .timeline-card,
          .metadata-panel,
          .engine-panel {
            padding: 16px;
          }
          
          .metadata-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          
          .metadata-section-title {
            font-size: 10px;
            margin-bottom: 10px;
          }
          
          .metadata-label {
            font-size: 12px;
          }
          
          .metadata-value {
            font-size: 13px;
          }
          
          .metadata-value.mono {
            font-size: 11px;
          }
          
          .timeline-container {
            max-height: 320px;
            gap: 10px;
          }
          
          .timeline-event {
            padding: 10px;
            gap: 10px;
            font-size: 13px;
          }
          
          .engine-title {
            font-size: 13px;
          }
          
          .engine-desc {
            font-size: 12px;
          }
          
          .empty-state {
            padding: 48px 16px;
          }
          
          .empty-state-text {
            font-size: 13px;
          }
        }
        
        /* Small Mobile (480px and below) */
        @media (max-width: 480px) {
          .header-container {
            padding: 10px 12px;
          }
          
          .header-title {
            font-size: 18px;
          }
          
          .header-subtitle {
            font-size: 11px;
          }
          
          .demo-badge-text {
            font-size: 10px;
          }
          
          .main-container {
            padding: 16px 12px;
          }
          
          .grid-layout {
            gap: 12px;
          }
          
          .sidebar-content {
            padding: 14px;
          }
          
          .scenario-button {
            padding: 8px 12px;
            font-size: 12px;
          }
          
          .scenario-indicator {
            width: 6px;
            height: 6px;
            margin-right: 6px;
          }
          
          .timeline-card,
          .metadata-panel,
          .engine-panel {
            padding: 14px;
          }
          
          .section-title {
            font-size: 10px;
            margin-bottom: 12px;
          }
          
          .metadata-section-title {
            font-size: 9px;
          }
          
          .metadata-label {
            font-size: 11px;
          }
          
          .metadata-value {
            font-size: 12px;
          }
          
          .metadata-value.mono {
            font-size: 10px;
            word-break: break-all;
          }
          
          .timeline-container {
            max-height: 280px;
            gap: 8px;
          }
          
          .timeline-event {
            padding: 8px;
            gap: 8px;
            font-size: 12px;
          }
          
          .engine-step {
            padding: 10px;
          }
          
          .engine-title {
            font-size: 12px;
          }
          
          .engine-desc {
            font-size: 11px;
          }
          
          .engine-artifact {
            padding: 10px;
            margin-top: 10px;
          }
          
          .empty-state {
            padding: 32px 12px;
          }
          
          .empty-state-text {
            font-size: 12px;
          }
          
          .empty-state-hint {
            font-size: 11px;
          }
          
          .loading-content {
            font-size: 13px;
          }
        }
        
        /* Extra Small Mobile (360px and below) */
        @media (max-width: 360px) {
          .header-title {
            font-size: 16px;
          }
          
          .header-subtitle {
            font-size: 10px;
          }
          
          .header-controls {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
          
          .main-container {
            padding: 12px 8px;
          }
          
          .scenario-button {
            font-size: 11px;
            padding: 7px 10px;
          }
          
          .timeline-card,
          .metadata-panel,
          .engine-panel {
            padding: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default App;
