import { useRef } from 'react';
import { useDispatch as useReduxDispatch } from 'react-redux';
import { fetchDashboardData } from '../store/dashboardSlice';
import type { AppDispatch } from '../store/store';
import type { MsgType } from '../components/terminal/TerminalTypes';

export const useTerminalStream = () => {
  const reduxDispatch = useReduxDispatch<AppDispatch>();
  const abortRef = useRef<AbortController | null>(null);

  const streamChat = async (
    query: string,
    userToken: string,
    addLine: (type: MsgType, text?: string, data?: any) => void,
    setLoading: (loading: boolean) => void
  ) => {
    if (!query || !userToken) return;

    addLine('user', `> ${query}`);
    setLoading(true);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const baseURL = import.meta.env.VITE_API_URL || '';
      const resp = await fetch(`${baseURL}/api/ai/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
        body: JSON.stringify({ message: query }),
        signal: controller.signal,
      });

      if (!resp.ok || !resp.body) {
        addLine('error', `❌ Server error: ${resp.status}`);
        return;
      }

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
      setLoading(false);
    }
  };

  return { streamChat };
};
