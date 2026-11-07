const OpenAI = require('openai');
const User = require('../models/User');
const LeaveRequest = require('../models/LeaveRequest');
const Meeting = require('../models/Meeting');

const apiKey = process.env.OPENAI_API_KEY || "dummy";
const isOpenRouter = apiKey.startsWith("sk-or-");
const baseURL = isOpenRouter ? "https://openrouter.ai/api/v1" : "https://api.openai.com/v1";
const modelName = isOpenRouter ? "openai/gpt-4o-mini" : "gpt-4o-mini";
const fallbackModels = isOpenRouter
  ? [modelName, "nvidia/nemotron-3-nano-30b-a3b:free", "openrouter/free"]
  : [modelName];

const openai = new OpenAI({ apiKey, baseURL });

// Helper to parse JSON safely even if wrapped in markdown fences or extra prose
const tryParseModelJSON = (content) => {
  if (!content || typeof content !== 'string') return { ok: false };
  const raw = content.trim();

  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch {}

  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced && fenced[1]) {
    try {
      return { ok: true, value: JSON.parse(fenced[1].trim()) };
    } catch {}
  }

  const firstBrace = raw.indexOf('{');
  const lastBrace = raw.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return { ok: true, value: JSON.parse(raw.slice(firstBrace, lastBrace + 1)) };
    } catch {}
  }

  const firstBracket = raw.indexOf('[');
  const lastBracket = raw.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    try {
      return { ok: true, value: JSON.parse(raw.slice(firstBracket, lastBracket + 1)) };
    } catch {}
  }

  return { ok: false };
};

// Call LLM across configured models before falling back
const callChatCompletion = async (messages, temperature = 0.2) => {
  let lastError;
  for (const model of fallbackModels) {
    try {
      const response = await openai.chat.completions.create({
        model,
        messages,
        temperature,
      });
      const content = response?.choices?.[0]?.message?.content;
      if (content) return content;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error('AI completion unavailable');
};

// RAG Knowledge Base (HR Policies - ordered from specific to general so specific policies match first)
const hrKnowledgeBase = [
  {
    policy: "Maternity leave is granted for 26 weeks, and paternity leave for 2 weeks.",
    source: "Astra HR Handbook, Section 4.3",
    tags: ["maternity", "paternity", "parental leave", "maternity leave", "paternity leave"]
  },
  {
    policy: "Remote work is allowed up to 2 days a week with prior manager approval.",
    source: "Astra HR Handbook, Section 5.2",
    tags: ["remote work", "wfh", "work from home", "hybrid policy", "remote policy"]
  },
  {
    policy: "All employees must complete 8 hours of work per day. Flexi-hours are available between 8 AM to 8 PM.",
    source: "Astra HR Handbook, Section 2.1",
    tags: ["work hours", "flexi", "timing", "office hours", "working hours", "attendance policy"]
  },
  {
    policy: "Standard notice period is 30 days for probationary employees and 60 days for confirmed full-time employees.",
    source: "Astra HR Handbook, Section 7.1",
    tags: ["notice period", "resignation", "exit policy", "probation"]
  },
  {
    policy: "Employees are entitled to 12 days of casual leave, 10 days of sick leave, and 15 days of earned leave per year.",
    source: "Astra HR Handbook, Section 4.1",
    tags: ["leave policy", "leave allowance", "how many leaves", "leave entitlement", "how much leave", "annual leave", "casual leave policy", "sick leave policy", "earned leave policy"]
  }
];

const findPolicy = (query) => {
  const lowercaseQuery = String(query || '').toLowerCase();
  for (const item of hrKnowledgeBase) {
    for (const tag of item.tags) {
      if (lowercaseQuery.includes(tag.toLowerCase())) {
        return { answer: item.policy, source: item.source };
      }
    }
  }
  return { answer: null, source: "none" };
};

// Parse natural language date/time into a valid ISO string for fallback scheduling
const resolveMeetingDate = (message) => {
  const lower = message.toLowerCase();
  const target = new Date();

  if (lower.includes('next week')) {
    target.setDate(target.getDate() + 7);
  } else if (lower.includes('day after tomorrow')) {
    target.setDate(target.getDate() + 2);
  } else if (lower.includes('tomorrow') || !lower.includes('today')) {
    target.setDate(target.getDate() + 1);
  }

  const timeMatch = message.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const meridiem = timeMatch[3].toLowerCase();
    if (meridiem === 'pm' && hours < 12) hours += 12;
    if (meridiem === 'am' && hours === 12) hours = 0;
    target.setHours(hours, minutes, 0, 0);
  } else {
    target.setHours(10, 0, 0, 0);
  }

  return target.toISOString();
};

// Deterministic fallback planner so agentic workflows always succeed even if LLM quota is exhausted
const buildFallbackPlan = (message, policyMatch) => {
  const text = String(message || '').trim();
  const lower = text.toLowerCase();
  const plan = [];
  let stepCount = 1;

  const wantsBalanceCheck =
    /\b(check|show|view|what is|what's|get)\b[\s\S]*?\b(leave|balance|sick|casual|earned)\b/i.test(text) &&
    !lower.includes('policy');

  const wantsApplyLeave =
    /\b(apply|take|request|book|need)\b[\s\S]*?\b(sick|casual|earned|leave|day|days)\b/i.test(text);

  const wantsScheduleMeeting =
    /\b(schedule|book|set up|arrange|create)\b[\s\S]*?\b(meeting|sync|appointment|call|standup|discussion|interview)\b/i.test(text);

  const wantsInterviewQuestions =
    /\b(interview question|interview questions|generate questions|questions for)\b/i.test(text);

  if (wantsBalanceCheck) {
    plan.push({
      step: stepCount++,
      function: 'checkLeaveBalance',
      arguments: {},
      notes: 'Checking current employee leave balances'
    });
  }

  if (wantsApplyLeave) {
    let leaveType = 'sick';
    if (lower.includes('casual')) leaveType = 'casual';
    else if (lower.includes('earned')) leaveType = 'earned';

    const daysMatch = text.match(/\b(\d+)\s*day/i);
    const days = daysMatch ? Math.max(1, parseInt(daysMatch[1], 10)) : 1;

    let reason = 'Not specified';
    const becauseMatch = text.match(/\b(?:because|as|since)\s+([^,.]+?)(?:\s+and\s+schedule|\s*$)/i);
    const commaReasonMatch = text.match(/,\s*(i\s+have\s+[^,.]+|feeling\s+[^,.]+|personal\s+[^,.]+|family\s+[^,.]+|medical\s+[^,.]+)/i);
    if (becauseMatch && becauseMatch[1]) {
      reason = becauseMatch[1].trim();
    } else if (commaReasonMatch && commaReasonMatch[1]) {
      reason = commaReasonMatch[1].trim();
    } else if (lower.includes('fever')) {
      reason = 'I have a fever';
    }

    plan.push({
      step: stepCount++,
      function: 'applyForLeave',
      arguments: { type: leaveType, days, reason },
      notes: `Applying for ${days} day(s) of ${leaveType} leave`
    });
  }

  if (wantsScheduleMeeting) {
    let title = 'Team Sync';
    if (lower.includes('doctor')) {
      title = "Doctor's Appointment";
    } else if (lower.includes('team sync')) {
      title = 'Team Sync';
    } else if (lower.includes('1:1') || lower.includes('one on one')) {
      title = '1:1 Manager Sync';
    } else if (lower.includes('standup')) {
      title = 'Daily Standup';
    } else {
      const titleMatch = text.match(/\b(?:schedule|book|arrange)\s+(?:a|an)?\s*([a-z0-9\s'-]{3,35}?)(?:\s+for|\s+on|\s+at|\s+tomorrow|\s+today|$)/i);
      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1]
          .trim()
          .replace(/\b\w/g, (c) => c.toUpperCase());
      }
    }

    plan.push({
      step: stepCount++,
      function: 'scheduleMeeting',
      arguments: {
        title,
        date: resolveMeetingDate(text)
      },
      notes: `Scheduling "${title}"`
    });
  }

  if (wantsInterviewQuestions) {
    const roleMatch = text.match(/(?:for|as)\s+(?:a|an)?\s*([a-z0-9\s.+/#-]{2,40})$/i);
    const role = roleMatch && roleMatch[1] ? roleMatch[1].trim() : 'Software Developer';
    plan.push({
      step: stepCount++,
      function: 'generateInterviewQuestions',
      arguments: { role },
      notes: `Generating tailored interview questions for ${role}`
    });
  }

  if (plan.length > 0) {
    return {
      plan,
      final_goal: `Execute ${plan.length} HR workflow step${plan.length > 1 ? 's' : ''} for your request`
    };
  }

  if (policyMatch && policyMatch.source !== 'none') {
    return {
      plan: [
        {
          step: 1,
          function: 'reply',
          arguments: {
            message: `${policyMatch.answer} (Source: ${policyMatch.source})`
          }
        }
      ],
      final_goal: 'Provide grounded HR policy answer'
    };
  }

  return {
    plan: [
      {
        step: 1,
        function: 'reply',
        arguments: {
          message:
            'I can help you check your leave balances, apply for sick/casual/earned leave, schedule meetings, generate role-specific interview questions, or answer Astra HR policy questions (maternity/paternity, remote work, working hours, notice period).'
        }
      }
    ],
    final_goal: 'Respond to employee inquiry'
  };
};

// Tool Registry for Agentic Execution
const tools = {
  checkLeaveBalance: async ({ userId }) => {
    const user = await User.findById(userId);
    if (!user) return { error: "User not found" };
    return {
      balances: user.leaveBalance,
      summary: `Sick: ${user.leaveBalance.sick} days | Casual: ${user.leaveBalance.casual} days | Earned: ${user.leaveBalance.earned} days`
    };
  },
  applyForLeave: async ({ userId, type, days, reason }) => {
    const normalizedType = String(type || 'sick').toLowerCase().trim();
    const numericDays = Math.max(1, Number(days) || 1);
    const safeReason = reason && String(reason).trim() ? String(reason).trim() : 'Not specified';
    const user = await User.findById(userId);
    if (!user || user.leaveBalance[normalizedType] === undefined) {
      return { status: "Failed", message: "Invalid leave type or user" };
    }
    if (user.leaveBalance[normalizedType] < numericDays) {
      return {
        status: "Failed",
        message: `Insufficient ${normalizedType} leave. Available: ${user.leaveBalance[normalizedType]} days, Requested: ${numericDays} days.`
      };
    }
    user.leaveBalance[normalizedType] -= numericDays;
    await user.save();
    const leave = await LeaveRequest.create({
      user: userId,
      type: normalizedType,
      days: numericDays,
      reason: safeReason
    });
    return {
      status: "Success",
      leaveId: leave._id,
      type: normalizedType,
      days: numericDays,
      reason: safeReason,
      remainingBalance: user.leaveBalance[normalizedType]
    };
  },
  scheduleMeeting: async ({ userId, title, date }) => {
    let meetingDate = new Date(date);
    if (isNaN(meetingDate.getTime())) {
      meetingDate = new Date(resolveMeetingDate(String(date || 'tomorrow at 10am')));
    }
    const safeTitle = title && String(title).trim() ? String(title).trim() : 'Team Sync';
    const meeting = await Meeting.create({ user: userId, title: safeTitle, date: meetingDate });
    return {
      status: "Success",
      meetingId: meeting._id,
      title: safeTitle,
      date: meetingDate.toLocaleString()
    };
  },
  generateInterviewQuestions: async ({ role }) => {
    const cleanRole = role && String(role).trim() ? String(role).trim() : 'Software Engineer';
    try {
      const content = await callChatCompletion([
        {
          role: "system",
          content: "You are an AI Interview Coach. Generate 5 realistic interview questions for the given role. Return ONLY a JSON array of strings: [\"q1\", \"q2\", ...]"
        },
        { role: "user", content: `Role: ${cleanRole}` }
      ], 0.4);
      const parsed = tryParseModelJSON(content);
      if (parsed.ok && Array.isArray(parsed.value) && parsed.value.length > 0) {
        return { questions: parsed.value, role: cleanRole };
      }
    } catch {}

    return {
      questions: [
        `How do you architect scalable modules and manage state in a production ${cleanRole} application?`,
        `Walk me through a performance bottleneck you diagnosed and resolved as a ${cleanRole}.`,
        `How do you handle authentication, authorization, and input validation in your ${cleanRole} workflow?`,
        `What testing and debugging strategies do you rely on before shipping ${cleanRole} features to production?`,
        `Describe a complex technical trade-off you made recently and how it impacted maintainability.`
      ],
      role: cleanRole
    };
  }
};

// SSE helper
const sendSSE = (res, event, data) => {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
};

// SSE Streaming endpoint
const streamAiChat = async (req, res) => {
  // Setup SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.flushHeaders();

  try {
    const { message } = req.body;
    const userId = req.user._id;

    if (!message || !String(message).trim()) {
      sendSSE(res, 'error', { text: 'Please enter a valid message or command.' });
      res.end();
      return;
    }

    sendSSE(res, 'status', { text: '🔍 Analyzing your request...', type: 'thinking' });

    // 1. RAG Check
    const policyMatch = findPolicy(message);
    let ragContext = "";
    if (policyMatch.source !== "none") {
      sendSSE(res, 'status', { text: `📚 Found relevant policy in HR Handbook`, type: 'rag' });
      ragContext = `\n\nRelevant Company Policy Context:\n${policyMatch.answer} (Source: ${policyMatch.source})`;
    }

    // 2. Build System Prompt
    const systemPrompt = `You are the Astra HR Agentic Planner. Transform natural language into a JSON execution plan.

Available Tools:
- checkLeaveBalance() -> returns current leave balances
- applyForLeave({ type: "sick"|"casual"|"earned", days: number, reason: string }) -> applies for leave
- scheduleMeeting({ title: string, date: string (ISO format) }) -> schedules a meeting
- generateInterviewQuestions({ role: string }) -> returns interview questions

Rules:
1. Return ONLY strictly valid JSON. No extra text.
2. For conversation/policy questions, use: {"plan": [{"step": 1, "function": "reply", "arguments": {"message": "your answer"}}]}
3. For tool actions: {"plan": [{"step": 1, "function": "toolName", "arguments": {...}, "notes": "why"}], "final_goal": "goal"}
4. Do NOT include userId in arguments - it is injected automatically.
5. Current date: ${new Date().toISOString()}.${ragContext}`;

    sendSSE(res, 'status', { text: '🧠 AI is generating execution plan...', type: 'thinking' });

    let aiPlan = null;
    try {
      const rawContent = await callChatCompletion([
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ], 0.2);
      const parsed = tryParseModelJSON(rawContent);
      if (parsed.ok && parsed.value && Array.isArray(parsed.value.plan)) {
        aiPlan = parsed.value;
      }
    } catch {
      // Fallback to deterministic planner below so user flow never breaks
    }

    if (!aiPlan || !Array.isArray(aiPlan.plan) || aiPlan.plan.length === 0) {
      aiPlan = buildFallbackPlan(message, policyMatch);
    }

    const planSteps = Array.isArray(aiPlan?.plan) ? aiPlan.plan : [];

    // 3. Stream each step
    sendSSE(res, 'plan', { steps: planSteps.length, goal: aiPlan.final_goal });

    let finalMessage = "I have successfully processed your request.";
    const stepSummaries = [];

    for (const step of planSteps) {
      if (step.function === 'reply') {
        finalMessage = step.arguments?.message || finalMessage;
        stepSummaries.push(finalMessage);
      } else if (tools[step.function]) {
        sendSSE(res, 'step_start', {
          step: step.step,
          function: step.function,
          notes: step.notes,
          text: `⚡ Step ${step.step}: Calling ${step.function}...`
        });

        const stepArgs = { ...(step.arguments || {}), userId };
        const result = await tools[step.function](stepArgs);

        sendSSE(res, 'step_result', {
          step: step.step,
          function: step.function,
          result,
          success: result.status !== 'Failed' && !result.error
        });

        if (result.status === "Failed" || result.error) {
          finalMessage = result.message || result.error;
          stepSummaries.length = 0;
          stepSummaries.push(finalMessage);
          break;
        }

        // Build meaningful final message from results
        if (step.function === 'checkLeaveBalance') {
          stepSummaries.push(`Leave Balance → ${result.summary}`);
        } else if (step.function === 'applyForLeave') {
          stepSummaries.push(`✅ Applied ${result.days} day(s) of ${result.type} leave. Remaining: ${result.remainingBalance} days.`);
        } else if (step.function === 'scheduleMeeting') {
          stepSummaries.push(`✅ Scheduled "${result.title}" on ${result.date}.`);
        } else if (step.function === 'generateInterviewQuestions') {
          stepSummaries.push(result.questions.map((q, i) => `Q${i + 1}: ${q}`).join('\n'));
        }
      }
    }

    if (stepSummaries.length > 0) {
      finalMessage = stepSummaries.join('\n');
    }

    sendSSE(res, 'done', {
      reply: finalMessage,
      source: policyMatch.source !== "none" ? policyMatch.source : undefined
    });

  } catch (error) {
    sendSSE(res, 'error', { text: `❌ Error: ${error.message}` });
  } finally {
    res.end();
  }
};

module.exports = { streamAiChat };
