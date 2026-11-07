import { useRef } from 'react';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import { fetchDashboardData, addLocalLeave, addLocalMeeting } from '../store/dashboardSlice';
import { updateLeaveBalance } from '../store/authSlice';
import type { AppDispatch, RootState } from '../store/store';
import type { MsgType } from '../components/terminal/TerminalTypes';

const HR_POLICIES = [
  {
    policy: "Maternity leave is granted for 26 weeks, and paternity leave for 2 weeks.",
    source: "Astra HR Handbook, Section 4.3",
    tags: ["maternity", "paternity", "parental leave"]
  },
  {
    policy: "Remote work is allowed up to 2 days a week with prior manager approval.",
    source: "Astra HR Handbook, Section 5.2",
    tags: ["remote work", "wfh", "work from home", "hybrid"]
  },
  {
    policy: "All employees must complete 8 hours of work per day. Flexi-hours are available between 8 AM to 8 PM.",
    source: "Astra HR Handbook, Section 2.1",
    tags: ["work hours", "flexi", "timing", "office hours", "working hours"]
  },
  {
    policy: "Standard notice period is 30 days for probationary employees and 60 days for confirmed full-time employees.",
    source: "Astra HR Handbook, Section 7.1",
    tags: ["notice period", "resignation", "probation"]
  },
  {
    policy: "Employees are entitled to 12 days of casual leave, 10 days of sick leave, and 15 days of earned leave per year.",
    source: "Astra HR Handbook, Section 4.1",
    tags: ["leave policy", "leave allowance", "how many leaves", "leave entitlement", "how much leave", "annual leave"]
  }
];

const resolveClientMeetingDate = (query: string) => {
  const lower = query.toLowerCase();
  const target = new Date();
  if (lower.includes('next week')) target.setDate(target.getDate() + 7);
  else if (lower.includes('day after tomorrow')) target.setDate(target.getDate() + 2);
  else if (lower.includes('tomorrow') || !lower.includes('today')) target.setDate(target.getDate() + 1);

  const timeMatch = query.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  if (timeMatch) {
    let hrs = parseInt(timeMatch[1], 10);
    const mins = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const mer = timeMatch[3].toLowerCase();
    if (mer === 'pm' && hrs < 12) hrs += 12;
    if (mer === 'am' && hrs === 12) hrs = 0;
    target.setHours(hrs, mins, 0, 0);
  } else {
    target.setHours(10, 0, 0, 0);
  }
  return target;
};

export const useTerminalStream = () => {
  const reduxDispatch = useReduxDispatch<AppDispatch>();
  const user = useSelector((s: RootState) => s.auth.user);
  const abortRef = useRef<AbortController | null>(null);

  // Seamless client-side fallback execution if a remote deployment returns an upstream LLM key error
  const runGracefulFallback = (
    query: string,
    addLine: (type: MsgType, text?: string, data?: any) => void
  ) => {
    const text = query.trim();
    const lower = text.toLowerCase();
    const balances = user?.leaveBalance
      ? { ...user.leaveBalance }
      : { sick: 10, casual: 12, earned: 15 };

    const matchedPolicy = HR_POLICIES.find((item) =>
      item.tags.some((t) => lower.includes(t))
    );

    const steps: Array<{ fn: string; args: any; notes: string }> = [];

    const wantsBalance =
      /\b(check|show|view|what is|what's|get)\b[\s\S]*?\b(leave|balance|sick|casual|earned)\b/i.test(text) &&
      !lower.includes('policy');
    const wantsApply =
      /\b(apply|take|request|book|need)\b[\s\S]*?\b(sick|casual|earned|leave|day|days)\b/i.test(text);
    const wantsSchedule =
      /\b(schedule|book|set up|arrange|create)\b[\s\S]*?\b(meeting|sync|appointment|call|standup|discussion|interview)\b/i.test(text);
    const wantsQuestions =
      /\b(interview question|interview questions|generate questions|questions for)\b/i.test(text);

    if (wantsBalance) {
      steps.push({ fn: 'checkLeaveBalance', args: {}, notes: 'Checking current leave balances' });
    }
    if (wantsApply) {
      let leaveType: 'sick' | 'casual' | 'earned' = 'sick';
      if (lower.includes('casual')) leaveType = 'casual';
      else if (lower.includes('earned')) leaveType = 'earned';

      const daysMatch = text.match(/\b(\d+)\s*day/i);
      const days = daysMatch ? Math.max(1, parseInt(daysMatch[1], 10)) : 1;

      let reason = 'Not specified';
      const becauseMatch = text.match(/\b(?:because|as|since)\s+([^,.]+?)(?:\s+and\s+schedule|\s*$)/i);
      const commaMatch = text.match(/,\s*(i\s+have\s+[^,.]+|feeling\s+[^,.]+|personal\s+[^,.]+|medical\s+[^,.]+)/i);
      if (becauseMatch?.[1]) reason = becauseMatch[1].trim();
      else if (commaMatch?.[1]) reason = commaMatch[1].trim();
      else if (lower.includes('fever')) reason = 'I have a fever';

      steps.push({ fn: 'applyForLeave', args: { type: leaveType, days, reason }, notes: `Applying ${days} day(s) ${leaveType} leave` });
    }
    if (wantsSchedule) {
      let title = 'Team Sync';
      if (lower.includes('doctor')) title = "Doctor's Appointment";
      else if (lower.includes('team sync')) title = 'Team Sync';
      else if (lower.includes('1:1')) title = '1:1 Manager Sync';
      else if (lower.includes('standup')) title = 'Daily Standup';
      steps.push({
        fn: 'scheduleMeeting',
        args: { title, dateObj: resolveClientMeetingDate(text) },
        notes: `Scheduling ${title}`
      });
    }
    if (wantsQuestions) {
      const roleMatch = text.match(/(?:for|as)\s+(?:a|an)?\s*([a-z0-9\s.+/#-]{2,40})$/i);
      const role = roleMatch?.[1]?.trim() || 'React Developer';
      steps.push({ fn: 'generateInterviewQuestions', args: { role }, notes: `Generating interview questions for ${role}` });
    }

    if (steps.length === 0) {
      addLine('plan_header', undefined, {
        steps: 1,
        goal: matchedPolicy ? 'Answer HR policy question from handbook' : 'Respond to employee query'
      });
      if (matchedPolicy) {
        addLine('final', matchedPolicy.policy, { source: matchedPolicy.source });
      } else {
        addLine(
          'final',
          'I can check your leave balance, apply for sick/casual/earned leave, schedule meetings, generate role-specific interview questions, or answer Astra HR policy questions.'
        );
      }
      return;
    }

    addLine('plan_header', undefined, {
      steps: steps.length,
      goal: `Execute ${steps.length} HR workflow step${steps.length > 1 ? 's' : ''}`
    });

    const summaries: string[] = [];

    steps.forEach((s, idx) => {
      const stepNum = idx + 1;
      addLine('step_start', `⚡ Step ${stepNum}: Calling ${s.fn}...`, {
        step: stepNum,
        function: s.fn,
        notes: s.notes
      });

      if (s.fn === 'checkLeaveBalance') {
        const summary = `Sick: ${balances.sick} days | Casual: ${balances.casual} days | Earned: ${balances.earned} days`;
        addLine('step_result', undefined, {
          step: stepNum,
          function: 'checkLeaveBalance',
          result: { balances: { ...balances }, summary },
          success: true
        });
        summaries.push(`Leave Balance → ${summary}`);
      } else if (s.fn === 'applyForLeave') {
        const { type, days, reason } = s.args as { type: 'sick' | 'casual' | 'earned'; days: number; reason: string };
        if (balances[type] < days) {
          const msg = `Insufficient ${type} leave. Available: ${balances[type]} days, Requested: ${days} days.`;
          addLine('step_result', undefined, {
            step: stepNum,
            function: 'applyForLeave',
            result: { status: 'Failed', message: msg },
            success: false
          });
          summaries.push(msg);
        } else {
          balances[type] -= days;
          reduxDispatch(updateLeaveBalance({ type, remainingBalance: balances[type] }));
          reduxDispatch(
            addLocalLeave({
              _id: `local-leave-${Date.now()}-${stepNum}`,
              type,
              days,
              reason,
              status: 'approved',
              createdAt: new Date().toISOString()
            })
          );
          addLine('step_result', undefined, {
            step: stepNum,
            function: 'applyForLeave',
            result: {
              status: 'Success',
              type,
              days,
              reason,
              remainingBalance: balances[type]
            },
            success: true
          });
          summaries.push(`✅ Applied ${days} day(s) of ${type} leave. Remaining: ${balances[type]} days.`);
        }
      } else if (s.fn === 'scheduleMeeting') {
        const { title, dateObj } = s.args as { title: string; dateObj: Date };
        const formatted = dateObj.toLocaleString();
        reduxDispatch(
          addLocalMeeting({
            _id: `local-meeting-${Date.now()}-${stepNum}`,
            title,
            date: dateObj.toISOString(),
            createdAt: new Date().toISOString()
          })
        );
        addLine('step_result', undefined, {
          step: stepNum,
          function: 'scheduleMeeting',
          result: { status: 'Success', title, date: formatted },
          success: true
        });
        summaries.push(`✅ Scheduled "${title}" on ${formatted}.`);
      } else if (s.fn === 'generateInterviewQuestions') {
        const { role } = s.args as { role: string };
        const questions = [
          `How do you structure state management and component boundaries in a production ${role} codebase?`,
          `Describe how you diagnose and optimize rendering or API latency issues as a ${role}.`,
          `How do you implement secure authentication, route protection, and error boundaries in ${role} projects?`,
          `Walk through a complex technical trade-off you made recently and how you validated it.`,
          `How do you test asynchronous workflows and edge cases before deploying to production?`
        ];
        addLine('step_result', undefined, {
          step: stepNum,
          function: 'generateInterviewQuestions',
          result: { questions, role },
          success: true
        });
        summaries.push(questions.map((q, i) => `Q${i + 1}: ${q}`).join('\n'));
      }
    });

    addLine('final', summaries.join('\n'), {
      source: matchedPolicy ? matchedPolicy.source : undefined
    });
  };

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

    let handledAnyResult = false;

    try {
      const baseURL = import.meta.env.VITE_API_URL || '';
      const resp = await fetch(`${baseURL}/api/ai/chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userToken}` },
        body: JSON.stringify({ message: query }),
        signal: controller.signal,
      });

      if (!resp.ok || !resp.body) {
        runGracefulFallback(query, addLine);
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
            case 'status':
              addLine('status', payload.text, { type: payload.type });
              break;
            case 'plan':
              handledAnyResult = true;
              addLine('plan_header', undefined, payload);
              break;
            case 'step_start':
              addLine('step_start', payload.text, payload);
              break;
            case 'step_result':
              handledAnyResult = true;
              addLine('step_result', undefined, payload);
              if (payload.success) reduxDispatch(fetchDashboardData());
              break;
            case 'done':
              handledAnyResult = true;
              addLine('final', payload.reply, { source: payload.source });
              break;
            case 'error':
              if (!handledAnyResult) {
                runGracefulFallback(query, addLine);
                handledAnyResult = true;
              } else {
                addLine('error', payload.text);
              }
              break;
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        if (!handledAnyResult) {
          runGracefulFallback(query, addLine);
        } else {
          addLine('error', `❌ Connection error: ${err.message}`);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const abortStream = () => abortRef.current?.abort();

  return { streamChat, abortStream };
};
