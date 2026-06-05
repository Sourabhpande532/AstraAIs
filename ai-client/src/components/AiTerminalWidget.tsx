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
    case 'CLOSE':            return { ...state, isOpen: false, isMinimized: false };
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

  const [isDragging, setIsDragging] = useState(false);
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { user } = useSelector((s: RootState) => s.auth);
  const { streamChat } = useTerminalStream();

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
      const maxX = window.innerWidth - (containerRef.current?.offsetWidth || 440);
      const maxY = window.innerHeight - (containerRef.current?.offsetHeight || 60);
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
      case 'user':        return <div key={line.id} className="py-1" style={{ color: '#fff', fontWeight: 600, fontSize: '0.83rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{line.text}</div>;
      case 'status':      return <StatusLine key={line.id} text={line.text!} type={line.data?.type || 'info'} />;
      case 'plan_header': return <PlanHeader key={line.id} data={line.data} />;
      case 'step_start':  return <StepStart key={line.id} data={line.data} />;
      case 'step_result': return <ResultBlock key={line.id} data={line.data} />;
      case 'final':       return <FinalMessage key={line.id} text={line.text!} source={line.data?.source} />;
      case 'error':       return <div key={line.id} className="py-1" style={{ color: '#ff5555', fontSize: '0.78rem', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{line.text}</div>;
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

  return (
    <div
      ref={containerRef}
      className="shadow-lg rounded overflow-hidden"
      style={{
        position: 'fixed', left: pos.x, top: pos.y, zIndex: 9999,
        width: 440, height: state.isMinimized ? 50 : 540,
        background: '#0d1117', border: '1px solid #30363d',
        fontFamily: "'Fira Code', 'Consolas', monospace",
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(68, 255, 136, 0.2)',
        transition: isDragging ? 'none' : 'height 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <div 
        onMouseDown={onMouseDown}
        className="d-flex justify-content-between align-items-center px-3 py-2"
        style={{ background: '#161b22', borderBottom: '1px solid #30363d', cursor: 'grab', userSelect: 'none' }}
      >
        <div className="d-flex align-items-center gap-2">
          <FaTerminal style={{ color: '#44ff88' }} size={14} />
          <span style={{ color: '#c9d1d9', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.5px' }}>ASTRA_HR_AGENT</span>
        </div>
        <div className="d-flex gap-2">
          <button onClick={() => dispatch({ type: 'TOGGLE_MINIMIZE' })} className="btn btn-sm p-0 d-flex align-items-center justify-content-center" style={{ width: 16, height: 16, borderRadius: '50%', background: '#f0c040', border: 'none' }} title="Minimize" />
          <button onClick={() => dispatch({ type: 'CLOSE' })} className="btn btn-sm p-0 d-flex align-items-center justify-content-center" style={{ width: 16, height: 16, borderRadius: '50%', background: '#ff4444', border: 'none' }} title="Close" />
        </div>
      </div>

      {!state.isMinimized && (
        <>
          <div className="flex-grow-1 overflow-auto p-3 custom-scrollbar" style={{ background: '#0d1117', overflowX: 'hidden' }}>
            {state.lines.map(renderLine)}
            <div ref={bottomRef} />
          </div>

          <div style={{ background: '#161b22', borderTop: '1px solid #30363d' }}>
            <div className="d-flex flex-nowrap overflow-auto px-2 py-2 custom-scrollbar gap-2" style={{ WebkitOverflowScrolling: 'touch' }}>
              {PROMPTS.map((p, i) => (
                <button key={i} onClick={() => handleSend(p)} disabled={state.isLoading}
                  className="btn btn-sm text-nowrap"
                  style={{
                    background: '#1c2128', color: '#8b949e', border: '1px solid #30363d',
                    fontSize: '0.7rem', borderRadius: 20, padding: '4px 12px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#c9d1d9'; e.currentTarget.style.borderColor = '#8b949e'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#8b949e'; e.currentTarget.style.borderColor = '#30363d'; }}
                >
                  {p}
                </button>
              ))}
            </div>

            <form onSubmit={e => { e.preventDefault(); handleSend(); }} className="d-flex p-2 gap-2">
              <FaAngleRight className="mt-2 ms-1" style={{ color: '#44ff88' }} />
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask Astra HR..."
                className="flex-grow-1"
                style={{
                  background: 'transparent', border: 'none', color: '#c9d1d9',
                  fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit'
                }}
                disabled={state.isLoading}
              />
              <button 
                type="button" 
                onClick={() => dispatch({ type: 'CLEAR' })}
                className="btn btn-sm"
                style={{ color: '#8b949e', fontSize: '0.7rem' }}
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
