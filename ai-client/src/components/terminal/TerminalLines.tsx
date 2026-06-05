import { FaSpinner, FaBook, FaCog, FaCheckCircle, FaExclamationCircle, FaRobot } from 'react-icons/fa';

export const StatusLine = ({ text, type }: { text: string; type: string }) => {
  const icon =
    type === 'thinking' ? <FaSpinner className="spin me-2" style={{ color: '#a0a0ff' }} /> :
    type === 'rag'      ? <FaBook className="me-2" style={{ color: '#f0c040' }} /> :
                          <FaCog className="me-2" style={{ color: '#80ffb0' }} />;
  return (
    <div className="d-flex align-items-center py-1" style={{ color: '#c0c0e0', fontSize: '0.78rem' }}>
      {icon}<span>{text}</span>
    </div>
  );
};

export const PlanHeader = ({ data }: { data: any }) => (
  <div className="my-2 px-2 py-1 rounded" style={{ border: '1px solid #30363d', background: '#1a1a2e' }}>
    <div style={{ color: '#60a0ff', fontSize: '0.74rem', fontWeight: 700 }}>
      🗺 AGENTIC PLAN — {data.steps} step{data.steps > 1 ? 's' : ''}
    </div>
    {data.goal && <div style={{ color: '#666', fontSize: '0.7rem' }}>Goal: {data.goal}</div>}
  </div>
);

export const StepStart = ({ data }: { data: any }) => (
  <div className="d-flex align-items-center py-1" style={{ color: '#ffcc44', fontSize: '0.76rem' }}>
    <FaSpinner className="spin me-2" />
    <span><strong>Step {data.step}:</strong> Calling <code style={{ color: '#f0a0ff', background: 'transparent' }}>{data.function}</code>…</span>
  </div>
);

export const ResultBlock = ({ data }: { data: any }) => {
  const { function: fn, result, success } = data;
  const icon = success
    ? <FaCheckCircle style={{ color: '#44ff88' }} className="me-2 flex-shrink-0" />
    : <FaExclamationCircle style={{ color: '#ff4444' }} className="me-2 flex-shrink-0" />;

  const renderContent = () => {
    if (!success) return <div style={{ color: '#ff6666', fontSize: '0.74rem' }}>❌ {result?.message || result?.error}</div>;
    if (fn === 'checkLeaveBalance' && result.balances) return (
      <div className="mt-1 ms-1" style={{ fontSize: '0.74rem' }}>
        <div style={{ color: '#44ff88' }}>🏖 Sick: <strong>{result.balances.sick} days</strong></div>
        <div style={{ color: '#ffd700' }}>☀️ Casual: <strong>{result.balances.casual} days</strong></div>
        <div style={{ color: '#87ceeb' }}>🌴 Earned: <strong>{result.balances.earned} days</strong></div>
      </div>
    );
    if (fn === 'applyForLeave') return (
      <div className="mt-1 ms-1" style={{ fontSize: '0.74rem' }}>
        <div style={{ color: '#44ff88' }}>✅ Applied <strong>{result.days} day(s)</strong> of <strong>{result.type}</strong> leave</div>
        <div style={{ color: '#aaa' }}>Reason: {result.reason}</div>
        <div style={{ color: '#ffcc44' }}>Remaining {result.type} leave: <strong>{result.remainingBalance} days</strong></div>
      </div>
    );
    if (fn === 'scheduleMeeting') return (
      <div className="mt-1 ms-1" style={{ fontSize: '0.74rem' }}>
        <div style={{ color: '#44ff88' }}>✅ Meeting Scheduled!</div>
        <div style={{ color: '#60cfff' }}>📅 <strong>{result.title}</strong></div>
        <div style={{ color: '#aaa' }}>🕐 {result.date}</div>
      </div>
    );
    if (fn === 'generateInterviewQuestions' && result.questions) return (
      <div className="mt-1 ms-1" style={{ fontSize: '0.74rem' }}>
        <div style={{ color: '#f0a0ff' }}>🎯 Interview Qs for <strong>{result.role}</strong>:</div>
        {result.questions.map((q: string, i: number) => (
          <div key={i} style={{ color: '#ddd', marginTop: 3 }}>
            <span style={{ color: '#60a0ff' }}>Q{i + 1}.</span> {q}
          </div>
        ))}
      </div>
    );
    return <div style={{ color: '#aaa', fontSize: '0.72rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{JSON.stringify(result, null, 2)}</div>;
  };

  return (
    <div className="my-1 ps-2" style={{ borderLeft: `2px solid ${success ? '#44ff88' : '#ff4444'}` }}>
      <div className="d-flex align-items-center" style={{ fontSize: '0.76rem', color: success ? '#44ff88' : '#ff6666' }}>
        {icon}Result from <code style={{ color: '#f0a0ff', background: 'transparent', marginLeft: 4 }}>{fn}</code>
      </div>
      {renderContent()}
    </div>
  );
};

export const FinalMessage = ({ text, source }: { text: string; source?: string }) => (
  <div className="mt-2 p-2 rounded" style={{ background: '#0d1117', border: '1px solid #30ff80', fontSize: '0.78rem' }}>
    <div style={{ color: '#44ff88', fontWeight: 700, marginBottom: 4 }}>
      <FaRobot className="me-2" />ASTRA HR
    </div>
    <div style={{ color: '#e0e0e0', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{text}</div>
    {source && <div style={{ color: '#555', fontSize: '0.68rem', marginTop: 4, wordBreak: 'break-all' }}>📖 {source}</div>}
  </div>
);
