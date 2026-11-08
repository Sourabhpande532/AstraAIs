import React from 'react';
import { FaRobot, FaBolt } from 'react-icons/fa';

const QUICK_WORKFLOWS = [
  { label: 'Check Leave Balance', prompt: 'Check my leave balance' },
  { label: 'Apply 1 Day Sick Leave', prompt: 'Apply for 1 day sick leave, I have a fever' },
  { label: 'Schedule Team Sync', prompt: 'Schedule a team sync for tomorrow at 3pm' },
  { label: 'Maternity Leave Policy', prompt: 'What is the maternity leave policy?' },
  { label: 'Multi-Step HR Action', prompt: 'Check sick leave, apply 1 day and schedule doctor appointment' },
];

const AiBanner: React.FC = () => {
  const triggerWorkflow = (prompt?: string) => {
    window.dispatchEvent(
      new CustomEvent('astra:open-terminal', {
        detail: { prompt, autoSend: Boolean(prompt) },
      })
    );
  };

  return (
    <div className="astra-ai-banner">
      <div className="astra-ai-banner-top">
        <div className="astra-ai-banner-header-row">
          <div className="astra-ai-banner-icon" aria-hidden="true">
            <FaRobot />
          </div>
          <div className="astra-ai-banner-heading-group">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <div className="astra-ai-banner-title mb-0">AI HR Assistant &amp; Agentic Command Bar</div>
              <span className="astra-ai-badge">SSE STREAMING READY</span>
            </div>
            <p className="astra-ai-banner-text mt-1">
              Click any instant workflow below or open the terminal widget to execute database actions in real time.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="astra-banner-launch-btn flex-shrink-0"
          onClick={() => triggerWorkflow()}
        >
          <FaBolt size={12} />
          <span>Open AI Terminal</span>
        </button>
      </div>

      <div className="astra-workflow-strip mt-3 pt-3">
        <span className="astra-workflow-label">Instant Workflows:</span>
        <div className="astra-workflow-chips">
          {QUICK_WORKFLOWS.map((wf) => (
            <button
              key={wf.label}
              type="button"
              className="astra-workflow-chip"
              onClick={() => triggerWorkflow(wf.prompt)}
            >
              {wf.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(AiBanner);
