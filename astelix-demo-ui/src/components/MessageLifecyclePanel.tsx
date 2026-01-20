import React from "react";
import { MessageLifecycle } from "../types/demo";

interface Props {
  lifecycle: MessageLifecycle;
}

const MessageLifecyclePanel: React.FC<Props> = ({ lifecycle }) => {
  return (
    <div className="panel">
      <h3 className="panel-title">📨 Message Lifecycle</h3>

      <div className="panel-grid">
        <div>
          <span>ID</span>
          <code>{lifecycle.id}</code>
        </div>

        <div>
          <span>UTC Time</span>
          <code>{lifecycle.utcTime}</code>
        </div>

        <div>
          <span>Sender Local</span>
          <code>{lifecycle.senderLocal}</code>
        </div>

        <div>
          <span>Receiver Local</span>
          <code>{lifecycle.receiverLocal}</code>
        </div>

        <div>
          <span>Status</span>
          <strong>{lifecycle.status}</strong>
        </div>
      </div>
    </div>
  );
};

export default MessageLifecyclePanel;
