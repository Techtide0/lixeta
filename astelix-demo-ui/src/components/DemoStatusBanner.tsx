import React from "react";

interface Props {
  status: string;
}

const DemoStatusBanner: React.FC<Props> = ({ status }) => {
  return (
    <div className="demo-status-banner">
      <span>Demo Status:</span>
      <strong>{status}</strong>
      <small>• Demo mode • No real messages sent</small>
    </div>
  );
};

export default DemoStatusBanner;
