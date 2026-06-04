import { useReducer, useState, useRef, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';
import { fetchDashboardData } from '../store/dashboardSlice';
import { FaTerminal, FaAngleRight, FaSpinner, FaCheckCircle, FaExclamationCircle, FaBook, FaRobot, FaCog } from 'react-icons/fa';

// ─── Types ────────────────────────────────────────────────────────────────────
type MsgType = 'user' | 'status' | 'plan_header' | 'step_start' | 'step_result' | 'final' | 'error';

interface TerminalLine {
  id: number;
  type: MsgType;
  text?: string;
  data?: any;
}

interface TerminalState {
  lines: TerminalLine[];
  isOpen: boolean;
  isMinimized: boolean;
  isLoading: boolean;
}

type Action =
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'TOGGLE_MINIMIZE' }
  | { type: 'ADD_LINE'; payload: TerminalLine }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR' };

let idCounter = 1;
const nextId = () => idCounter++;

const INITIAL_LINES: TerminalLine[] = [
  { id: nextId(), type: 'status', text: '🟢 Astra HR Terminal ready. Click a suggestion or type below.', data: { type: 'info' } }
];

function reducer(state: TerminalState, action: Action): TerminalState {
  switch (action.type) {
    case 'OPEN':             return { ...state, isOpen: true, isMinimized: false };
    case 'CLOSE':            return { ...state, isOpen: false, isMinimized: false };
    case 'TOGGLE_MINIMIZE':  return { ...state, isMinimized: !state.isMinimized };
    case 'ADD_LINE':         return { ...state, lines: [...state.lines, action.payload] };
    case 'SET_LOADING':      return { ...state, isLoading: action.payload };
    case 'CLEAR':            return { ...state, lines: [...INITIAL_LINES] };
    default:                 return state;
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────
const StatusLine = ({ text, type }: { text: string; type: string }) => {
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

const PlanHeader = ({ data }: { data: any }) => (
  <div className="my-2 px-2 py-1 rounded" style={{ border: '1px solid #30363d', background: '#1a1a2e' }}>
    <div style={{ color: '#60a0ff', fontSize: '0.74rem', fontWeight: 700 }}>
      🗺 AGENTIC PLAN — {data.steps} step{data.steps > 1 ? 's' : ''}
    </div>
    {data.goal && <div style={{ color: '#666', fontSize: '0.7rem' }}>Goal: {data.goal}</div>}
  </div>
);

const StepStart = ({ data }: { data: any }) => (
  <div className="d-flex align-items-center py-1" style={{ color: '#ffcc44', fontSize: '0.76rem' }}>
    <FaSpinner className="spin me-2" />
    <span><strong>Step {data.step}:</strong> Calling <code style={{ color: '#f0a0ff', background: 'transparent' }}>{data.function}</code>…</span>
  </div>
);

const ResultBlock = ({ data }: { data: any }) => {
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
    return <div style={{ color: '#aaa', fontSize: '0.72rem' }}>{JSON.stringify(result, null, 2)}</div>;
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

const FinalMessage = ({ text, source }: { text: string; source?: string }) => (
  <div className="mt-2 p-2 rounded" style={{ background: '#0d1117', border: '1px solid #30ff80', fontSize: '0.78rem' }}>
    <div style={{ color: '#44ff88', fontWeight: 700, marginBottom: 4 }}>
      <FaRobot className="me-2" />ASTRA HR
    </div>
    <div style={{ color: '#e0e0e0', whiteSpace: 'pre-wrap' }}>{text}</div>
    {source && <div style={{ color: '#555', fontSize: '0.68rem', marginTop: 4 }}>📖 {source}</div>}
  </div>
);

const PROMPTS = [
  "Check my leave balance",
  "Apply for 1 day sick leave, I have a fever",
  "What is the maternity leave policy?",
  "Schedule a team sync for tomorrow at 3pm",
  "Generate interview questions for a React Developer",
  "Check sick leave, apply 1 day and schedule doctor appointment",
];

// ─── Main Widget ──────────────────────────────────────────────────────────────
const AiTerminalWidget = () => {
  const [state, dispatch] = useReducer(reducer, {
    lines: [...INITIAL_LINES],
    isOpen: false,
    isMinimized: false,
    isLoading: false,
  });
  const [input, setInput] = useState('');

  // Drag state
  const [pos, setPos] = useState({
    x: typeof window !== 'undefined' ? Math.max(20, window.innerWidth - 460) : 20,
    y: typeof window !== 'undefined' ? Math.max(20, window.innerHeight - 560) : 20
  });

  // Ensure it stays on screen when resizing
  useEffect(() => {
    const handleResize = () => {
      setPos(p => {
        const maxX = Math.max(0, window.innerWidth - 440);
        const maxY = Math.max(0, window.innerHeight - (state.isMinimized ? 60 : 540));
        return {
          x: Math.min(Math.max(0, p.x), maxX),
          y: Math.min(Math.max(0, p.y), maxY)
        };
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [state.isMinimized]);
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const { user } = useSelector((s: RootState) => s.auth);
  const reduxDispatch = useDispatch<AppDispatch>();
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.lines]);

  // ── Drag handlers ──
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    // Only drag from the header bar, not from buttons
    if ((e.target as HTMLElement).closest('button')) return;
    dragging.current = true;
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    e.preventDefault();
  }, [pos]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const nx = e.clientX - dragOffset.current.x;
      const ny = e.clientY - dragOffset.current.y;
      // Clamp to viewport
      const maxX = window.innerWidth - (containerRef.current?.offsetWidth || 440);
      const maxY = window.innerHeight - (containerRef.current?.offsetHeight || 60);
      setPos({ x: Math.max(0, Math.min(nx, maxX)), y: Math.max(0, Math.min(ny, maxY)) });
    };
    const onMouseUp = () => { dragging.current = false; };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const addLine = (type: MsgType, text?: string, data?: any) =>
    dispatch({ type: 'ADD_LINE', payload: { id: nextId(), type, text, data } });

  const handleSend = async (msg?: string) => {
    const query = (msg || input).trim();
    if (!query || !user || state.isLoading) return;
    setInput('');
    addLine('user', `> ${query}`);
    dispatch({ type: 'SET_LOADING', payload: true });

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const resp = await fetch('/api/ai/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify({ message: query }),
        signal: controller.signal,
      });

      if (!resp.ok || !resp.body) { addLine('error', `❌ Server error: ${resp.status}`); return; }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop() || '';

        for (const part of parts) {
          const rawLines = part.split('\n');
          let event = 'message', dataStr = '';
          for (const l of rawLines) {
            if (l.startsWith('event: ')) event = l.slice(7).trim();
            if (l.startsWith('data: ')) dataStr = l.slice(6).trim();
          }
          if (!dataStr) continue;
          let payload: any;
          try { payload = JSON.parse(dataStr); } catch { continue; }

          switch (event) {
            case 'status':      addLine('status', payload.text, { type: payload.type }); break;
            case 'plan':        addLine('plan_header', undefined, payload); break;
            case 'step_start':  addLine('step_start', payload.text, payload); break;
            case 'step_result':
              addLine('step_result', undefined, payload);
              if (payload.success) reduxDispatch(fetchDashboardData());
              break;
            case 'done':  addLine('final', payload.reply, { source: payload.source }); break;
            case 'error': addLine('error', payload.text); break;
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') addLine('error', `❌ Connection error: ${err.message}`);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const renderLine = (line: TerminalLine) => {
    switch (line.type) {
      case 'user':        return <div key={line.id} className="py-1" style={{ color: '#fff', fontWeight: 600, fontSize: '0.83rem' }}>{line.text}</div>;
      case 'status':      return <StatusLine key={line.id} text={line.text!} type={line.data?.type || 'info'} />;
      case 'plan_header': return <PlanHeader key={line.id} data={line.data} />;
      case 'step_start':  return <StepStart key={line.id} data={line.data} />;
      case 'step_result': return <ResultBlock key={line.id} data={line.data} />;
      case 'final':       return <FinalMessage key={line.id} text={line.text!} source={line.data?.source} />;
      case 'error':       return <div key={line.id} className="py-1" style={{ color: '#ff5555', fontSize: '0.78rem' }}>{line.text}</div>;
      default:            return null;
    }
  };

  // ── Floating button (closed state) ──
  if (!state.isOpen) {
    return (
      <button
        onClick={() => dispatch({ type: 'OPEN' })}
        className="btn shadow-lg d-flex align-items-center justify-content-center"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          width: 58, height: 58, borderRadius: '50%',
          background: '#161b22', border: '2px solid #44ff88',
        }}
      >
        <FaTerminal size={22} style={{ color: '#44ff88' }} />
        <span className="position-absolute top-0 end-0 translate-middle badge rounded-pill"
          style={{ background: '#44ff88', color: '#000', fontSize: '0.6rem', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          AI
        </span>
      </button>
    );
  }

  // ── Open terminal ──
  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        width: 440,
        zIndex: 9999,
        background: '#0d1117',
        border: '1px solid #30363d',
        borderRadius: 10,
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        // Smooth height transition for minimize
        height: state.isMinimized ? 38 : 520,
        transition: 'height 0.2s ease',
      }}
    >
      {/* ── Header (drag handle) ── */}
      <div
        onMouseDown={onMouseDown}
        style={{
          background: '#161b22',
          borderBottom: state.isMinimized ? 'none' : '1px solid #21262d',
          padding: '0 12px',
          height: 38,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'grab',
          flexShrink: 0,
          userSelect: 'none',
        }}
      >
        {/* Traffic lights */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Red = close */}
          <button onClick={() => dispatch({ type: 'CLOSE' })} title="Close"
            style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57', border: 'none', cursor: 'pointer', padding: 0 }} />
          {/* Yellow = minimize */}
          <button onClick={() => dispatch({ type: 'TOGGLE_MINIMIZE' })} title={state.isMinimized ? 'Restore' : 'Minimize'}
            style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e', border: 'none', cursor: 'pointer', padding: 0 }} />
          {/* Green = visual only */}
          <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840', display: 'inline-block' }} />

          <span style={{ marginLeft: 10, color: '#8b949e', fontFamily: 'monospace', fontSize: '0.76rem' }}>
            ASTRA_HR_TERMINAL
          </span>
          {state.isLoading && <FaSpinner className="spin ms-2" style={{ color: '#60a0ff', fontSize: '0.7rem' }} />}
        </div>

        <span style={{ color: '#444', fontSize: '0.65rem', fontFamily: 'monospace' }}>drag to move</span>
      </div>

      {/* ── Body (hidden when minimized) ── */}
      {!state.isMinimized && (
        <>
          {/* Suggestion chips */}
          <div style={{ padding: '6px 8px 4px', borderBottom: '1px solid #21262d', flexShrink: 0 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {PROMPTS.map((p) => (
                <button key={p} onClick={() => handleSend(p)} disabled={state.isLoading}
                  style={{
                    fontSize: '0.66rem', background: '#21262d', color: '#8b949e',
                    border: '1px solid #30363d', borderRadius: 20, padding: '2px 8px',
                    cursor: 'pointer', whiteSpace: 'nowrap',
                  }}>
                  {p}
                </button>
              ))}
              <button onClick={() => dispatch({ type: 'CLEAR' })}
                style={{
                  fontSize: '0.66rem', background: 'transparent', color: '#444',
                  border: '1px solid #21262d', borderRadius: 20, padding: '2px 8px', cursor: 'pointer', marginLeft: 'auto',
                }}>
                Clear
              </button>
            </div>
          </div>

          {/* Terminal output */}
          <div className="terminal-scroll" style={{ flexGrow: 1, overflowY: 'auto', padding: '8px 12px', fontFamily: 'Menlo, Monaco, monospace' }}>
            {state.lines.map(renderLine)}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div style={{ background: '#161b22', borderTop: '1px solid #21262d', padding: '6px 12px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FaAngleRight style={{ color: '#44ff88', marginRight: 8, flexShrink: 0 }} />
              <input
                type="text"
                style={{
                  flexGrow: 1, background: 'transparent', border: 'none', outline: 'none',
                  color: '#e0e0e0', fontFamily: 'Menlo, Monaco, monospace', fontSize: '0.83rem', caretColor: '#44ff88',
                }}
                placeholder="Type a command..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={state.isLoading}
                autoFocus
              />
              {state.isLoading && <FaSpinner className="spin ms-2 flex-shrink-0" style={{ color: '#60a0ff' }} />}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AiTerminalWidget;
