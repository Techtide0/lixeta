import React from "react";
import { TimelineEvent } from "../types/demo";

interface Props {
  currentEvent?: TimelineEvent;
}

const ExplanationPanel: React.FC<Props> = ({ currentEvent }) => {
  if (!currentEvent) return null;

  return (
    <div className="panel explanation-panel">
      <h3 className="panel-title">🧠 What's Happening</h3>

      <p>
        {currentEvent.type === "rule" &&
          "A behavioral or time-based rule was evaluated and triggered."}

        {currentEvent.type === "action" &&
          "The system executed an automated action based on prior conditions."}

        {currentEvent.type === "info" &&
          "The system processed context and resolved time intelligence."}

        {currentEvent.type === "warning" &&
          "Delivery was adjusted due to compliance or timing constraints."}
      </p>
    </div>
  );
};

export default ExplanationPanel;
