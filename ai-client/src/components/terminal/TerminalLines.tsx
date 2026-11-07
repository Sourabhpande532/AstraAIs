import { FaSpinner, FaBook, FaCog, FaCheckCircle, FaExclamationCircle, FaRobot } from 'react-icons/fa';

export const StatusLine = ({ text, type }: { text: string; type: string }) => {
  const icon =
    type === 'thinking' ? <FaSpinner className="spin me-2 flex-shrink-0" style={{ color: '#38bdf8' }} /> :
      type === 'rag' ? <FaBook className="me-2 flex-shrink-0" style={{ color: '#fbbf24' }} /> :
        <FaCog className="me-2 flex-shrink-0" style={{ color: '#34d399' }} />;
  return (
    <div className="d-flex align-items-center py-1" style={{ color: '#cbd5e1', fontSize: '0.78rem' }}>
      {icon}<span>{text}</span>
    </div>
  );
};

export const PlanHeader = ({ data }: { data: any }) => (
  <div className="my-2 px-3 py-2 rounded-2" style={{ border: '1px solid rgba(56, 189, 248, 0.3)', background: 'rgba(15, 23, 42, 0.9)' }}>
    <div style={{ color: '#38bdf8', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.03em' }}>
      🗺 AGENTIC PLAN — {data.steps} step{data.steps > 1 ? 's' : ''}
    </div>
    {data.goal && (
      <div style={{ color: '#cbd5e1', fontSize: '0.72rem', marginTop: 2 }}>
        Goal: {data.goal}
      </div>
    )}
  </div>
);

export const StepStart = ({ data }: { data: any }) => (
  <div className="d-flex align-items-center py-1" style={{ color: '#fbbf24', fontSize: '0.76rem' }}>
    <FaSpinner className="spin me-2 flex-shrink-0" />
    <span>
      <strong>Step {data.step}:</strong> Calling{' '}
      <code style={{ color: '#6ee7b7', background: 'rgba(16, 185, 129, 0.12)', padding: '1px 6px', borderRadius: 4 }}>
        {data.function}
      </code>
      …
    </span>
  </div>
);

export const ResultBlock = ({ data }: { data: any }) => {
  const { function: fn, result, success } = data;
  const icon = success
    ? <FaCheckCircle style={{ color: '#34d399' }} className="me-2 flex-shrink-0" />
    : <FaExclamationCircle style={{ color: '#fb7185' }} className="me-2 flex-shrink-0" />;

  const renderContent = () => {
    if (!success) {
      return (
        <div style={{ color: '#fda4af', fontSize: '0.75rem', marginTop: 2 }}>
          ❌ {result?.message || result?.error}
        </div>
      );
    }
    if (fn === 'checkLeaveBalance' && result.balances) return (
      <div className="mt-1 ms-1" style={{ fontSize: '0.75rem' }}>
        <div style={{ color: '#fda4af' }}>🏖 Sick Leave: <strong>{result.balances.sick} / 10 days</strong></div>
        <div style={{ color: '#fde047' }}>☀️ Casual Leave: <strong>{result.balances.casual} / 12 days</strong></div>
        <div style={{ color: '#6ee7b7' }}>🌴 Earned Leave: <strong>{result.balances.earned} / 15 days</strong></div>
      </div>
    );
    if (fn === 'applyForLeave') return (
      <div className="mt-1 ms-1" style={{ fontSize: '0.75rem' }}>
        <div style={{ color: '#34d399' }}>✅ Applied <strong>{result.days} day(s)</strong> of <strong>{result.type}</strong> leave</div>
        <div style={{ color: '#cbd5e1' }}>Reason: {result.reason}</div>
        <div style={{ color: '#fbbf24' }}>Remaining {result.type} balance: <strong>{result.remainingBalance} days</strong></div>
      </div>
    );
    if (fn === 'scheduleMeeting') return (
      <div className="mt-1 ms-1" style={{ fontSize: '0.75rem' }}>
        <div style={{ color: '#34d399' }}>✅ Meeting Scheduled</div>
        <div style={{ color: '#38bdf8' }}>📅 <strong>{result.title}</strong></div>
        <div style={{ color: '#cbd5e1' }}>🕐 {result.date}</div>
      </div>
    );
    if (fn === 'generateInterviewQuestions' && result.questions) return (
      <div className="mt-1 ms-1" style={{ fontSize: '0.75rem' }}>
        <div style={{ color: '#38bdf8', fontWeight: 600 }}>🎯 Interview Questions for <strong>{result.role}</strong>:</div>
        {result.questions.map((q: string, i: number) => (
          <div key={i} style={{ color: '#e2e8f0', marginTop: 4 }}>
            <span style={{ color: '#34d399', fontWeight: 700 }}>Q{i + 1}.</span> {q}
          </div>
        ))}
      </div>
    );
    return (
      <div style={{ color: '#cbd5e1', fontSize: '0.73rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {JSON.stringify(result, null, 2)}
      </div>
    );
  };

  return (
    <div className="my-1 ps-2 py-1" style={{ borderLeft: `2px solid ${success ? '#10b981' : '#f43f5e'}` }}>
      <div className="d-flex align-items-center" style={{ fontSize: '0.76rem', color: success ? '#34d399' : '#fda4af' }}>
        {icon}Result from <code style={{ color: '#38bdf8', background: 'transparent', marginLeft: 4 }}>{fn}</code>
      </div>
      {renderContent()}
    </div>
  );
};

export const FinalMessage = ({ text, source }: { text: string; source?: string }) => (
  <div className="mt-2 p-2 rounded-2" style={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(16, 185, 129, 0.4)', fontSize: '0.79rem' }}>
    <div className="d-flex align-items-center" style={{ color: '#34d399', fontWeight: 700, marginBottom: 4 }}>
      <FaRobot className="me-2" />ASTRA HR
    </div>
    <div style={{ color: '#f8fafc', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.5 }}>{text}</div>
    {source && (
      <div
        className="mt-2 pt-1"
        style={{
          color: '#94a3b8',
          fontSize: '0.72rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          wordBreak: 'break-word'
        }}
      >
        📖 Source: <span style={{ color: '#38bdf8', fontWeight: 600 }}>{source}</span>
      </div>
    )}
  </div>
);
