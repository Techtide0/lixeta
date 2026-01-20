import React from "react";

interface Props {
  onRunAll: () => void;
}

const PresenterControls: React.FC<Props> = ({ onRunAll }) => {
  return (
    <div className="presenter-controls">
      <button onClick={onRunAll}>
        ▶ Run 10-Minute Demo
      </button>
    </div>
  );
};

export default PresenterControls;
