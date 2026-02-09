import React from 'react';

interface Props {
  why: string;
  processingDuration?: string;
}

export const WhyThisHappened: React.FC<Props> = ({ why, processingDuration }) => {
  return (
    <div className="why-happened">
      <div className="why-icon">💡</div>
      <div className="why-content">
        <h4>Why This Happened</h4>
        <p>{why}</p>
        {processingDuration && (
          <div className="processing-time">
            ⚡ Processed in {processingDuration}
          </div>
        )}
      </div>
    </div>
  );
};
