import React from 'react';
import { FaRobot } from 'react-icons/fa';

const AiBanner: React.FC = () => {
  return (
    <div className="astra-ai-banner">
      <div className="astra-ai-banner-icon">
        <FaRobot style={{ color: '#63b3ed' }} />
      </div>
      <div>
        <div className="astra-ai-banner-title">AI HR Assistant is Active</div>
        <p className="astra-ai-banner-text">
          Use the terminal widget on the bottom right to schedule meetings, apply for leave, or ask about company policies.
        </p>
      </div>
      <div className="astra-ai-badge">ASTRA READY</div>
    </div>
  );
};

export default AiBanner;
