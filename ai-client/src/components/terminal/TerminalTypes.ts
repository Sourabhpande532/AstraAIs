export type MsgType = 'user' | 'status' | 'plan_header' | 'step_start' | 'step_result' | 'final' | 'error';

export interface TerminalLine {
  id: number;
  type: MsgType;
  text?: string;
  data?: any;
}

export interface TerminalState {
  lines: TerminalLine[];
  isOpen: boolean;
  isMinimized: boolean;
  isLoading: boolean;
}

export type Action =
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'TOGGLE_MINIMIZE' }
  | { type: 'ADD_LINE'; payload: TerminalLine }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR' };
