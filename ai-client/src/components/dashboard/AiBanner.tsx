import React from 'react';
import { FaRobot } from 'react-icons/fa';

const AiBanner: React.FC = () => {
  return (
    <div className="astra-ai-banner">
      <div className="astra-ai-banner-icon">
        <FaRobot />
      </div>
      <div>
        <div className="astra-ai-banner-title">AI HR Assistant Ready</div>
        <p className="astra-ai-banner-text">
          Use the terminal widget in the bottom-right to check balances, apply for leave, schedule meetings, or query HR policies.
        </p>
      </div>
      <div className="astra-ai-badge">ASTRA READY</div>
    </div>
  );
};

export default React.memo(AiBanner);
