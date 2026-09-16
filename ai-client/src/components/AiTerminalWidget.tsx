import { useReducer, useState, useRef, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { FaTerminal, FaAngleRight } from 'react-icons/fa';
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
    case 'OPEN':             return { ...state, isOpen: true, isMinimized: false };
    case 'CLOSE':            return { ...state, isOpen: false, isMinimized: false, lines: [...INITIAL_LINES], isLoading: false };
    case 'TOGGLE_MINIMIZE':  return { ...state, isMinimized: !state.isMinimized };
    case 'ADD_LINE':         return { ...state, lines: [...state.lines, action.payload] };
    case 'SET_LOADING':      return { ...state, isLoading: action.payload };
    case 'CLEAR':            return { ...state, lines: [...INITIAL_LINES] };
    default:                 return state;
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

  const addLine = useCallback((type: MsgType, text?: string, data?: any) => {
    dispatch({ type: 'ADD_LINE', payload: { id: nextId(), type, text, data } });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const handleSend = async (msg?: string) => {
    const query = (msg || input).trim();
    if (!query || !user || state.isLoading) return;
    setInput('');
    await streamChat(query, user.token, addLine, setLoading);
  };

  const renderLine = (line: TerminalLine) => {
    switch (line.type) {
      case 'user':        return <div key={line.id} className="py-1" style={{ color: '#f8fafc', fontWeight: 600, fontSize: '0.83rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{line.text}</div>;
      case 'status':      return <StatusLine key={line.id} text={line.text!} type={line.data?.type || 'info'} />;
      case 'plan_header': return <PlanHeader key={line.id} data={line.data} />;
      case 'step_start':  return <StepStart key={line.id} data={line.data} />;
      case 'step_result': return <ResultBlock key={line.id} data={line.data} />;
      case 'final':       return <FinalMessage key={line.id} text={line.text!} source={line.data?.source} />;
      case 'error':       return <div key={line.id} className="py-1" style={{ color: '#f43f5e', fontSize: '0.78rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{line.text}</div>;
      default:            return null;
    }
  };

  if (!state.isOpen) {
    return (
      <button
        onClick={() => dispatch({ type: 'OPEN' })}
        className="btn shadow-lg d-flex align-items-center justify-content-center"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          width: 58, height: 58, borderRadius: '50%',
          background: '#0b0f19', border: '2px solid #10b981',
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)'
        }}
        aria-label="Open AI Terminal"
      >
        <FaTerminal size={22} style={{ color: '#10b981' }} />
        <span className="position-absolute top-0 end-0 translate-middle badge rounded-pill"
          style={{ background: '#10b981', color: '#0b0f19', fontSize: '0.62rem', fontWeight: 800, width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          AI
        </span>
      </button>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`shadow-lg rounded-3 overflow-hidden astra-terminal-container${state.isMinimized ? ' astra-terminal-minimized' : ''}`}
      style={{
        position: 'fixed', left: pos.x, top: pos.y, zIndex: 9999,
        width: 440, height: state.isMinimized ? 50 : 540,
        background: '#0b0f19', border: '1px solid rgba(255, 255, 255, 0.12)',
        fontFamily: "'JetBrains Mono', monospace",
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(16, 185, 129, 0.25)',
        transition: isDragging ? 'none' : 'height 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div 
        onMouseDown={onMouseDown}
        className="d-flex justify-content-between align-items-center px-3 py-2"
        style={{ background: '#111827', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', cursor: 'grab', userSelect: 'none' }}
      >
        <div className="d-flex align-items-center gap-2">
          <FaTerminal style={{ color: '#10b981' }} size={14} />
          <span style={{ color: '#f8fafc', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.5px' }}>ASTRA_HR_AGENT</span>
        </div>
        <div className="d-flex gap-2">
          <button onClick={() => dispatch({ type: 'TOGGLE_MINIMIZE' })} className="btn btn-sm p-0 d-flex align-items-center justify-content-center" style={{ width: 14, height: 14, borderRadius: '50%', background: '#f59e0b', border: 'none' }} title="Minimize" />
          <button onClick={() => { abortStream(); dispatch({ type: 'CLOSE' }); }} className="btn btn-sm p-0 d-flex align-items-center justify-content-center" style={{ width: 14, height: 14, borderRadius: '50%', background: '#f43f5e', border: 'none' }} title="Close" />
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
                <button key={i} onClick={() => handleSend(p)} disabled={state.isLoading}
                  className="btn btn-sm text-nowrap"
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)', color: '#94a3b8', border: '1px solid rgba(255, 255, 255, 0.08)',
                    fontSize: '0.7rem', borderRadius: 20, padding: '4px 12px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#34d399'; e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'; }}
                >
                  {p}
                </button>
              ))}
            </div>

            <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="d-flex p-2 gap-2 align-items-center">
              <FaAngleRight className="ms-1" style={{ color: '#10b981' }} />
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask Astra HR..."
                className="flex-grow-1"
                style={{
                  background: 'transparent', border: 'none', color: '#f8fafc',
                  fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit'
                }}
                disabled={state.isLoading}
              />
              <button 
                type="button" 
                onClick={() => dispatch({ type: 'CLEAR' })}
                className="btn btn-sm"
                style={{ color: '#64748b', fontSize: '0.7rem' }}
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
