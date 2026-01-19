import React, { useState } from "react";

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

interface EngineStep {
  step: number;
  title: string;
  description: string;
  triggerEventIndex: number;
  renderArtifact?: () => React.ReactElement;
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

// API Service (Mock for demo purposes)
async function runDemoScenario(scenario: ScenarioId) {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const mockData: Record<ScenarioId, any> = {
    "dual-time": {
      utcTime: new Date().toISOString(),
      sender: { timezone: "America/New_York", localTime: "2:30 PM EST" },
      receiver: { timezone: "Europe/London", localTime: "7:30 PM GMT" },
      status: "delivered",
    },
    "behavior-reminder": {
      triggeredAt: new Date().toISOString(),
      rule: "no_reply_10min",
      action: "send_reminder",
      status: "triggered",
    },
    "fintech-login": {
      actions: [
        { message: "Welcome popup displayed" },
        { message: "Guidance tour initiated" },
      ],
    },
    "active-hours": {
      sentAt: new Date().toISOString(),
      receiverTimezone: "America/Los_Angeles",
      deliveryWindow: "9 AM - 6 PM",
      status: "delayed",
      scheduledFor: "Tomorrow at 9:00 AM PST",
    },
  };

  const data = mockData[scenario];

  return {
    timeline: transformToTimeline(scenario, data),
    metadata: extractMetadata(scenario, data),
  };
}

function transformToTimeline(scenario: ScenarioId, data: any): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  switch (scenario) {
    case "dual-time":
      events.push(
        {
          relativeTime: "T+0s",
          message: `Sender (${data.sender.timezone}) initiated message`,
          type: "info" as const,
        },
        {
          relativeTime: "T+0s",
          message: `Resolved sender local time: ${data.sender.localTime}`,
          type: "info" as const,
        },
        {
          relativeTime: "T+0s",
          message: `Resolved receiver timezone: ${data.receiver.timezone}`,
          type: "rule" as const,
        },
        {
          relativeTime: "T+0s",
          message: `Receiver local time: ${data.receiver.localTime}`,
          type: "info" as const,
        },
        {
          relativeTime: "T+0s",
          message: `Message ${data.status}`,
          type: "action" as const,
        },
      );
      break;

    case "behavior-reminder":
      events.push(
        {
          relativeTime: "T+0s",
          message: "Message sent and delivered",
          type: "action" as const,
        },
        {
          relativeTime: "T+10m",
          message: "No reply detected",
          type: "warning" as const,
        },
        {
          relativeTime: "T+10m",
          message: `Rule triggered: ${data.rule}`,
          type: "rule" as const,
        },
        {
          relativeTime: "T+10m",
          message: `Action queued: ${data.action}`,
          type: "action" as const,
        },
        {
          relativeTime: "T+10m",
          message: `Action ${data.status}`,
          type: "action" as const,
        },
      );
      break;

    case "fintech-login":
      events.push(
        {
          relativeTime: "T+0s",
          message: "User login event detected",
          type: "info" as const,
        },
        {
          relativeTime: "T+0s",
          message: `Action 1: ${data.actions[0].message}`,
          type: "action" as const,
        },
        {
          relativeTime: "T+5s",
          message: `Action 2: ${data.actions[1].message}`,
          type: "action" as const,
        },
        {
          relativeTime: "T+5s",
          message: "All actions executed",
          type: "action" as const,
        },
      );
      break;

    case "active-hours":
      events.push(
        {
          relativeTime: "T+0s",
          message: `Message sent at ${data.sentAt}`,
          type: "info" as const,
        },
        {
          relativeTime: "T+0s",
          message: `Receiver timezone: ${data.receiverTimezone}`,
          type: "info" as const,
        },
        {
          relativeTime: "T+0s",
          message: `Active hours: ${data.deliveryWindow}`,
          type: "rule" as const,
        },
        {
          relativeTime: "T+0s",
          message: `Status: ${data.status}`,
          type: "warning" as const,
        },
        {
          relativeTime: "T+0s",
          message: `Scheduled for: ${data.scheduledFor}`,
          type: "action" as const,
        },
      );
      break;
  }

  return events;
}

function extractMetadata(scenario: ScenarioId, data: any): Metadata {
  switch (scenario) {
    case "dual-time":
      return {
        utcTime: data.utcTime,
        senderLocal: data.sender.localTime,
        receiverLocal: data.receiver.localTime,
        rule: "timezone_intelligence",
        action: "message_resolved",
        status: data.status,
      };

    case "behavior-reminder":
      return {
        utcTime: data.triggeredAt,
        senderLocal: "N/A",
        receiverLocal: "N/A",
        rule: data.rule,
        action: data.action,
        status: data.status,
      };

    case "fintech-login":
      return {
        utcTime: new Date().toISOString(),
        senderLocal: "N/A",
        receiverLocal: "N/A",
        rule: "login_event",
        action: `${data.actions.length} actions executed`,
        status: "executed",
      };

    case "active-hours":
      return {
        utcTime: data.sentAt,
        senderLocal: "N/A",
        receiverLocal: data.receiverTimezone,
        rule: "active_hours_check",
        action: "delivery_delayed",
        status: data.status,
      };

    default:
      return {
        utcTime: "",
        senderLocal: "",
        receiverLocal: "",
        rule: "",
        action: "",
        status: "",
      };
  }
}

function getEngineSteps(scenario: ScenarioId): EngineStep[] {
  switch (scenario) {
    case "dual-time":
      return [
        {
          step: 1,
          title: "Resolve Time Zones",
          description: "Sender and receiver time zones resolved",
          triggerEventIndex: 1,
          renderArtifact: () => (
            <div className="artifact-card">
              <div style={{ marginBottom: "8px", color: "#d1d5db" }}>
                <strong>Timezone Detection:</strong>
              </div>
              <div style={{ fontSize: "13px", color: "#9ca3af" }}>
                <div>Sender TZ: America/New_York</div>
                <div>Receiver TZ: Europe/London</div>
              </div>
            </div>
          ),
        },
        {
          step: 2,
          title: "Attach Dual-Time Metadata",
          description: "UTC + local times attached",
          triggerEventIndex: 3,
          renderArtifact: () => (
            <div className="artifact-card">
              <div style={{ marginBottom: "8px", color: "#d1d5db" }}>
                <strong>Time Metadata:</strong>
              </div>
              <div style={{ fontSize: "13px", fontFamily: "monospace", color: "#a3e635" }}>
                <div>UTC: 2026-01-19T20:15:30Z</div>
                <div>Sender: 3:15 PM EST</div>
                <div>Receiver: 8:15 PM GMT</div>
              </div>
            </div>
          ),
        },
        {
          step: 3,
          title: "Finalize Delivery",
          description: "Message delivered",
          triggerEventIndex: 4,
          renderArtifact: () => (
            <div className="artifact-message">
              <div style={{ marginBottom: "8px", fontWeight: "600", color: "#e5e7eb" }}>
                Message Artifact
              </div>
              <div style={{ padding: "12px", background: "rgba(0,0,0,0.2)", borderRadius: "4px", marginBottom: "8px", fontSize: "14px" }}>
                Please approve this transaction
              </div>
              <span className="delivered">✓ Delivered</span>
            </div>
          ),
        },
      ];

    case "behavior-reminder":
      return [
        {
          step: 1,
          title: "Monitor Message State",
          description: "Delivery and reply events observed",
          triggerEventIndex: 0,
          renderArtifact: () => (
            <div className="artifact-card">
              <div style={{ marginBottom: "8px", color: "#d1d5db" }}>
                <strong>Message Status:</strong>
              </div>
              <div style={{ fontSize: "13px", color: "#9ca3af" }}>
                <div>Status: <span style={{ color: "#4ade80" }}>Delivered</span></div>
                <div>Awaiting reply...</div>
              </div>
            </div>
          ),
        },
        {
          step: 2,
          title: "Evaluate Behavior Rule",
          description: "No reply within 10 minutes",
          triggerEventIndex: 1,
          renderArtifact: () => (
            <div className="artifact-card">
              <div style={{ marginBottom: "8px", color: "#d1d5db" }}>
                <strong>Rule Condition Met:</strong>
              </div>
              <div style={{ fontSize: "13px", color: "#fbbf24" }}>
                <div>Rule: no_reply_10min</div>
                <div>Trigger: Time window elapsed</div>
              </div>
            </div>
          ),
        },
        {
          step: 3,
          title: "Trigger Reminder Action",
          description: "Reminder queued and executed",
          triggerEventIndex: 2,
          renderArtifact: () => (
            <div className="artifact-reminder">
              <div style={{ marginBottom: "8px", fontWeight: "600", color: "#e5e7eb" }}>
                Reminder Notification
              </div>
              <div style={{ padding: "12px", background: "rgba(34,197,94,0.1)", borderRadius: "4px", borderLeft: "3px solid #4ade80" }}>
                <div style={{ fontSize: "14px", color: "#4ade80", marginBottom: "4px" }}>🔔 Reminder</div>
                <div style={{ fontSize: "13px", color: "#86efac" }}>You have an outstanding request waiting for your response</div>
              </div>
            </div>
          ),
        },
      ];

    case "fintech-login":
      return [
        {
          step: 1,
          title: "Login Event Received",
          description: "User login detected",
          triggerEventIndex: 0,
          renderArtifact: () => (
            <div className="artifact-card">
              <div style={{ marginBottom: "8px", color: "#d1d5db" }}>
                <strong>Authentication Event:</strong>
              </div>
              <div style={{ fontSize: "13px", color: "#9ca3af" }}>
                <div>User: john_doe@fintech.com</div>
                <div>Status: <span style={{ color: "#60a5fa" }}>Authenticated</span></div>
              </div>
            </div>
          ),
        },
        {
          step: 2,
          title: "Rule Matching & Actions Queued",
          description: "2 rules matched, 2 actions queued",
          triggerEventIndex: 1,
          renderArtifact: () => (
            <div className="artifact-card">
              <div style={{ marginBottom: "8px", color: "#d1d5db" }}>
                <strong>Matched Rules:</strong>
              </div>
              <div style={{ fontSize: "13px", color: "#9ca3af" }}>
                <div>✓ welcome_popup</div>
                <div>✓ guidance_tour</div>
              </div>
            </div>
          ),
        },
        {
          step: 3,
          title: "Sequential Actions Executed",
          description: "Popups triggered with delays",
          triggerEventIndex: 2,
          renderArtifact: () => (
            <div className="artifact-popup">
              <div style={{ marginBottom: "12px", fontWeight: "600", color: "#e5e7eb" }}>
                Popups Rendered
              </div>
              <div style={{ marginBottom: "12px", padding: "12px", background: "rgba(96,165,250,0.1)", borderRadius: "4px", borderLeft: "3px solid #60a5fa" }}>
                <div style={{ color: "#93c5fd", marginBottom: "4px" }}>Welcome back 👋</div>
                <div style={{ fontSize: "13px", color: "#bfdbfe" }}>Do you need help completing your transaction?</div>
              </div>
              <div style={{ padding: "12px", background: "rgba(34,197,94,0.1)", borderRadius: "4px", borderLeft: "3px solid #4ade80" }}>
                <div style={{ color: "#86efac", marginBottom: "4px" }}>Guided Tour 📍</div>
                <div style={{ fontSize: "13px", color: "#86efac" }}>Click through key features of your dashboard</div>
              </div>
            </div>
          ),
        },
      ];

    case "active-hours":
      return [
        {
          step: 1,
          title: "Check Active Hours Window",
          description: "Receiver timezone evaluated",
          triggerEventIndex: 1,
          renderArtifact: () => (
            <div className="artifact-card">
              <div style={{ marginBottom: "8px", color: "#d1d5db" }}>
                <strong>Active Hours Rule:</strong>
              </div>
              <div style={{ fontSize: "13px", color: "#9ca3af" }}>
                <div>Receiver: America/Los_Angeles</div>
                <div>Current Time: 2:15 AM PST</div>
                <div>Active Hours: 9 AM - 6 PM</div>
              </div>
            </div>
          ),
        },
        {
          step: 2,
          title: "Outside Delivery Window",
          description: "Message delivery delayed",
          triggerEventIndex: 2,
          renderArtifact: () => (
            <div className="artifact-delay">
              <div style={{ marginBottom: "8px", fontWeight: "600", color: "#e5e7eb" }}>
                Delivery Status
              </div>
              <div style={{ padding: "12px", background: "rgba(251,191,36,0.1)", borderRadius: "4px", borderLeft: "3px solid #fbbf24" }}>
                <div style={{ color: "#fcd34d", marginBottom: "4px", fontWeight: "500" }}>⏸️ Delayed</div>
                <div style={{ fontSize: "13px", color: "#fde68a" }}>Outside active hours - Message will be delivered during business hours</div>
              </div>
            </div>
          ),
        },
        {
          step: 3,
          title: "Schedule Safe Delivery",
          description: "Message queued for 9 AM",
          triggerEventIndex: 3,
          renderArtifact: () => (
            <div className="artifact-scheduled">
              <div style={{ marginBottom: "8px", fontWeight: "600", color: "#e5e7eb" }}>
                Scheduled Delivery
              </div>
              <div style={{ padding: "12px", background: "rgba(168,85,247,0.1)", borderRadius: "4px", borderLeft: "3px solid #c084fa" }}>
                <div style={{ color: "#d8b4fe", marginBottom: "4px", fontWeight: "500" }}>📅 Tomorrow at 9:00 AM PST</div>
                <div style={{ fontSize: "13px", color: "#e9d5ff" }}>User will receive notification during active hours</div>
              </div>
            </div>
          ),
        },
      ];

    default:
      return [];
  }
}

const App = () => {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioId | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [engineSteps, setEngineSteps] = useState<EngineStep[]>([]);
  const [currentEventIndex, setCurrentEventIndex] = useState(-1);

  const handleRunScenario = async (scenarioId: ScenarioId) => {
    setSelectedScenario(scenarioId);
    setLoading(true);
    setError(null);
    setEvents([]);
    setMetadata(null);
    setCurrentEventIndex(-1);
    setEngineSteps(getEngineSteps(scenarioId));

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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run demo");
      console.error("Demo error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "info":
        return <CheckCircleIcon />;
      case "action":
        return <ZapIcon />;
      case "rule":
        return <AlertCircleIcon />;
      case "warning":
        return <AlertTriangleIcon />;
      case "error":
        return <AlertCircleIcon />;
      default:
        return <ClockIcon />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "info":
        return "event-info";
      case "action":
        return "event-action";
      case "rule":
        return "event-rule";
      case "warning":
        return "event-warning";
      case "error":
        return "event-error";
      default:
        return "event-default";
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
      </header>

      <div
        className="main-container"
        style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 24px" }}
      >
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
            <div
              style={{
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

              <div className="timeline-container">
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
                ) : (
                  events.map((event, index) => (
                    <div
                      key={index}
                      className={`timeline-event ${getEventColor(event.type)}`}
                      style={{ animation: "slideIn 0.3s ease-out" }}
                    >
                      <div className="event-icon">
                        {getEventIcon(event.type)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "12px",
                              fontFamily: "monospace",
                              color: "#6b7280",
                            }}
                          >
                            [{event.relativeTime}]
                          </span>
                          <span style={{ fontSize: "14px", color: "#e5e7eb" }}>
                            {event.message}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {engineSteps.length > 0 && (
          <div className="engine-panel">
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
              Engine Execution Flow
            </h2>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {engineSteps.map((step) => {
                const isActive = currentEventIndex >= step.triggerEventIndex;

                return (
                  <div
                    key={step.step}
                    className={`engine-step ${isActive ? "active" : "inactive"}`}
                  >
                    <div className="engine-header">
                      <span className="engine-step-number">{step.step}</span>
                      <div>
                        <div className="engine-title">{step.title}</div>
                        <div className="engine-desc">{step.description}</div>
                      </div>
                    </div>

                    {isActive && step.renderArtifact && (
                      <div className="engine-artifact">
                        {step.renderArtifact()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
      </div>

      <style>{`
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
        
        .metadata-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        
        @media (max-width: 1024px) {
          .grid-layout {
            grid-template-columns: 1fr;
          }
          
          .sidebar {
            grid-column: span 1;
          }
          
          .content {
            grid-column: span 1;
          }
          
          .metadata-grid {
            grid-template-columns: 1fr;
          }
          
          .sidebar > div {
            position: static !important;
          }
        }
        
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

        .engine-panel {
          margin-top: 24px;
          background: rgba(17, 24, 39, 0.5);
          border: 1px solid #1f2937;
          border-radius: 8px;
          padding: 24px;
        }

        .engine-step {
          padding: 12px;
          border: 1px solid #1f2937;
          border-radius: 6px;
          margin-bottom: 12px;
          opacity: 0.4;
          transition: all 0.3s ease;
          background: rgba(31, 41, 55, 0.2);
        }

        .engine-step.active {
          opacity: 1;
          border-color: rgba(168, 85, 247, 0.5);
          background: rgba(31, 41, 55, 0.6);
        }

        .engine-header {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .engine-step-number {
          font-family: monospace;
          font-weight: 600;
          color: #c084fa;
          min-width: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .engine-title {
          font-size: 14px;
          font-weight: 500;
          color: #e5e7eb;
        }

        .engine-desc {
          font-size: 13px;
          color: #9ca3af;
          margin-top: 4px;
        }

        .engine-artifact {
          margin-top: 12px;
          padding: 12px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 6px;
          animation: slideIn 0.3s ease-out;
        }

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
      `}</style>
    </div>
  );
};

export default App;
