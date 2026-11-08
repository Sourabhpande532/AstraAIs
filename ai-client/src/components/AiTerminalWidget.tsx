import { useReducer, useState, useRef, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { FaTerminal, FaAngleRight, FaPaperPlane, FaMinus, FaExpandAlt, FaTimes } from 'react-icons/fa';
import type { TerminalState, Action, MsgType, TerminalLine } from './terminal/TerminalTypes';
import { StatusLine, PlanHeader, StepStart, ResultBlock, FinalMessage } from './terminal/TerminalLines';
import { useTerminalStream } from '../hooks/useTerminalStream';

let idCounter = 1;
const nextId = () => idCounter++;

const INITIAL_LINES: TerminalLine[] = [
  { id: nextId(), type: 'status', text: '🟢 Astra HR Terminal ready. Click a suggestion or type below.', data: { type: 'info' } }
];

function reducer(state: TerminalState, action: Action): TerminalState {
  switch (action.type) {
    case 'OPEN': return { ...state, isOpen: true, isMinimized: false };
    case 'CLOSE': return { ...state, isOpen: false, isMinimized: false, lines: [...INITIAL_LINES], isLoading: false };
    case 'TOGGLE_MINIMIZE': return { ...state, isMinimized: !state.isMinimized };
    case 'ADD_LINE': return { ...state, lines: [...state.lines, action.payload] };
    case 'SET_LOADING': return { ...state, isLoading: action.payload };
    case 'CLEAR': return { ...state, lines: [...INITIAL_LINES] };
    default: return state;
  }
}

const PROMPTS = [
  "Check my leave balance",
  "Apply for 1 day sick leave, I have a fever",
  "What is the maternity leave policy?",
  "Schedule a team sync for tomorrow at 3pm",
  "Generate interview questions for a React Developer",
  "Check sick leave, apply 1 day and schedule doctor appointment",
];

const AiTerminalWidget = () => {
  const [state, dispatch] = useReducer(reducer, {
    lines: [...INITIAL_LINES],
    isOpen: false,
    isMinimized: false,
    isLoading: false,
  });
  const [input, setInput] = useState('');

  // Drag state with safe viewport calculations
  const [pos, setPos] = useState(() => {
    if (typeof window === 'undefined') return { x: 20, y: 20 };
    const maxX = Math.max(0, window.innerWidth - 460);
    const maxY = Math.max(0, window.innerHeight - 560);
    return { x: Math.max(10, maxX), y: Math.max(10, maxY) };
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

  const [isDragging, setIsDragging] = useState(false);
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { user } = useSelector((s: RootState) => s.auth);
  const { streamChat, abortStream } = useTerminalStream();

  const addLine = useCallback((type: MsgType, text?: string, data?: any) => {
    dispatch({ type: 'ADD_LINE', payload: { id: nextId(), type, text, data } });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const handleSend = useCallback(async (msg?: string) => {
    const query = (msg ?? input).trim();
    if (!query || !user || state.isLoading) return;
    setInput('');
    await streamChat(query, user.token, addLine, setLoading);
  }, [input, user, state.isLoading, streamChat, addLine, setLoading]);

  // Listen for dashboard / navbar quick-launch events
  useEffect(() => {
    const handleCustomOpen = (evt: Event) => {
      const customEvt = evt as CustomEvent<{ prompt?: string; autoSend?: boolean }>;
      dispatch({ type: 'OPEN' });
      const promptText = customEvt.detail?.prompt;
      if (promptText) {
        if (customEvt.detail?.autoSend !== false && user && !state.isLoading) {
          streamChat(promptText, user.token, addLine, setLoading);
        } else {
          setInput(promptText);
        }
      }
    };
    window.addEventListener('astra:open-terminal', handleCustomOpen);
    return () => window.removeEventListener('astra:open-terminal', handleCustomOpen);
  }, [user, state.isLoading, streamChat, addLine, setLoading]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.lines]);

  // ── Drag handlers ──
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    dragging.current = true;
    setIsDragging(true);
    dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    e.preventDefault();
  }, [pos]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const nx = e.clientX - dragOffset.current.x;
      const ny = e.clientY - dragOffset.current.y;
      const maxX = Math.max(0, window.innerWidth - (containerRef.current?.offsetWidth || 440));
      const maxY = Math.max(0, window.innerHeight - (containerRef.current?.offsetHeight || 60));
      setPos({ x: Math.max(0, Math.min(nx, maxX)), y: Math.max(0, Math.min(ny, maxY)) });
    };
    const onMouseUp = () => { dragging.current = false; setIsDragging(false); };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const renderLine = (line: TerminalLine) => {
    switch (line.type) {
      case 'user': return <div key={line.id} className="py-1" style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.83rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{line.text}</div>;
      case 'status': return <StatusLine key={line.id} text={line.text!} type={line.data?.type || 'info'} />;
      case 'plan_header': return <PlanHeader key={line.id} data={line.data} />;
      case 'step_start': return <StepStart key={line.id} data={line.data} />;
      case 'step_result': return <ResultBlock key={line.id} data={line.data} />;
      case 'final': return <FinalMessage key={line.id} text={line.text!} source={line.data?.source} />;
      case 'error': return <div key={line.id} className="py-1" style={{ color: '#fb7185', fontSize: '0.78rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{line.text}</div>;
      default: return null;
    }
  };

  if (!state.isOpen) {
    return (
      <button
        onClick={() => dispatch({ type: 'OPEN' })}
        className="btn shadow-lg d-flex align-items-center justify-content-center astra-terminal-fab"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          width: 60, height: 60, borderRadius: '50%',
          background: '#0b0f19', border: '2px solid #10b981',
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)'
        }}
        aria-label="Open AI Terminal"
        title="Open Astra HR AI Terminal"
      >
        <FaTerminal size={22} style={{ color: '#10b981' }} />
        <span
          className="badge rounded-pill"
          style={{
            position: 'absolute',
            top: -4,
            right: -4,
            background: '#10b981',
            color: '#0b0f19',
            fontSize: '0.62rem',
            fontWeight: 800,
            width: 22,
            height: 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.4)'
          }}
        >
          AI
        </span>
      </button>
    );
  }

  return (
    <div
      ref={containerRef}
      role="dialog"
      aria-label="Astra HR AI Agent Terminal"
      className={`shadow-lg rounded-3 overflow-hidden astra-terminal-container${state.isMinimized ? ' astra-terminal-minimized' : ''}`}
      style={{
        position: 'fixed', left: pos.x, top: pos.y, zIndex: 9999,
        width: 440, height: state.isMinimized ? 52 : 540,
        background: '#0b0f19', border: '1px solid rgba(255, 255, 255, 0.14)',
        fontFamily: "'JetBrains Mono', monospace",
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 48px rgba(0,0,0,0.65), 0 0 0 1px rgba(16, 185, 129, 0.28)',
        transition: isDragging ? 'none' : 'height 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div
        onMouseDown={onMouseDown}
        className="d-flex justify-content-between align-items-center px-3 py-2"
        style={{ background: '#111827', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', cursor: 'grab', userSelect: 'none', minHeight: 50 }}
      >
        <div className="d-flex align-items-center gap-2">
          <FaTerminal style={{ color: '#10b981' }} size={14} />
          <span style={{ color: '#f8fafc', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.5px' }}>ASTRA_HR_AGENT</span>
          <span
            style={{
              fontSize: '0.65rem',
              padding: '2px 7px',
              borderRadius: 12,
              background: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              fontWeight: 600
            }}
          >
            {state.isLoading ? 'RUNNING' : 'ONLINE'}
          </span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            onClick={() => dispatch({ type: 'TOGGLE_MINIMIZE' })}
            className="btn btn-sm p-0 d-flex align-items-center justify-content-center"
            style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              background: 'rgba(245, 158, 11, 0.16)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: '#fbbf24'
            }}
            aria-label={state.isMinimized ? 'Expand terminal' : 'Minimize terminal'}
            title={state.isMinimized ? 'Expand' : 'Minimize'}
          >
            {state.isMinimized ? <FaExpandAlt size={10} /> : <FaMinus size={10} />}
          </button>
          <button
            type="button"
            onClick={() => { abortStream(); dispatch({ type: 'CLOSE' }); }}
            className="btn btn-sm p-0 d-flex align-items-center justify-content-center"
            style={{
              width: 26,
              height: 26,
              borderRadius: 6,
              background: 'rgba(244, 63, 94, 0.16)',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              color: '#fda4af'
            }}
            aria-label="Close terminal"
            title="Close"
          >
            <FaTimes size={11} />
          </button>
        </div>
      </div>

      {!state.isMinimized && (
        <>
          <div className="flex-grow-1 overflow-auto p-3 custom-scrollbar" style={{ background: '#0b0f19', overflowX: 'hidden' }}>
            {state.lines.map(renderLine)}
            <div ref={bottomRef} />
          </div>

          <div style={{ background: '#111827', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div className="d-flex flex-nowrap overflow-auto px-2 py-2 custom-scrollbar gap-2" style={{ WebkitOverflowScrolling: 'touch' }}>
              {PROMPTS.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSend(p)}
                  disabled={state.isLoading}
                  className="btn btn-sm text-nowrap"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: '#cbd5e1',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    fontSize: '0.7rem',
                    borderRadius: 20,
                    padding: '4px 12px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#34d399'; e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.45)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#cbd5e1'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; }}
                >
                  {p}
                </button>
              ))}
            </div>

            <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="d-flex p-2 gap-2 align-items-center">
              <FaAngleRight className="ms-1 flex-shrink-0" style={{ color: '#10b981' }} />
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask Astra HR (e.g. Check my leave balance)..."
                aria-label="Command input for Astra HR AI"
                className="flex-grow-1"
                style={{
                  background: 'transparent', border: 'none', color: '#f8fafc',
                  fontSize: '0.82rem', outline: 'none', fontFamily: 'inherit', minWidth: 0
                }}
                disabled={state.isLoading}
              />
              <button
                type="submit"
                disabled={state.isLoading || !input.trim()}
                className="btn btn-sm d-flex align-items-center justify-content-center"
                style={{
                  background: input.trim() && !state.isLoading ? '#10b981' : 'rgba(255, 255, 255, 0.06)',
                  color: input.trim() && !state.isLoading ? '#0b0f19' : '#64748b',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  borderRadius: 6,
                  padding: '4px 10px',
                  border: 'none'
                }}
                aria-label="Send command"
                title="Send command"
              >
                <FaPaperPlane size={11} className="me-1" />
                Send
              </button>
              <button
                type="button"
                onClick={() => dispatch({ type: 'CLEAR' })}
                className="btn btn-sm"
                style={{ color: '#94a3b8', fontSize: '0.7rem', padding: '4px 8px' }}
                title="Clear terminal output"
              >
                CLEAR
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default AiTerminalWidget;
