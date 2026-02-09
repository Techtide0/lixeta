import React from 'react';

interface Props {
  instruction: {
    action: string;
    urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    reason: string;
    recommendedTime: string;
  };
}

export const WebhookInstruction: React.FC<Props> = ({ instruction }) => {
  return (
    <div className="webhook-instruction">
      <div className="webhook-header">
        <span className="webhook-label">Outbound Webhook Instruction</span>
        <span className={`urgency-badge ${instruction.urgency.toLowerCase()}`}>
          {instruction.urgency}
        </span>
      </div>
      <pre className="webhook-payload">
{`{
  "action": "${instruction.action}",
  "urgency": "${instruction.urgency}",
  "reason": "${instruction.reason}",
  "recommended_time": "${instruction.recommendedTime}"
}`}
      </pre>
    </div>
  );
};
