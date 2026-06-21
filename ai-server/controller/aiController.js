const OpenAI = require('openai');
const User = require('../models/User');
const LeaveRequest = require('../models/LeaveRequest');
const Meeting = require('../models/Meeting');

const apiKey = process.env.OPENAI_API_KEY || "dummy";
const baseURL = apiKey.startsWith("sk-or-") ? "https://openrouter.ai/api/v1" : "https://api.openai.com/v1";
const modelName = apiKey.startsWith("sk-or-") ? "openai/gpt-4o-mini" : "gpt-4o-mini";
const openai = new OpenAI({ apiKey, baseURL });

// RAG Knowledge Base (HR Policies)
const hrKnowledgeBase = [
  {
    policy: "Employees are entitled to 12 days of casual leave, 10 days of sick leave, and 15 days of earned leave per year.",
    source: "Astra HR Handbook, Section 4.1",
    tags: ["leave policy", "leave allowance", "how many leaves", "leave entitlement", "check leave", "leave balance", "how much leave"]
  },
  {
    policy: "Remote work is allowed up to 2 days a week with prior manager approval.",
    source: "Astra HR Handbook, Section 5.2",
    tags: ["remote work", "wfh", "work from home"]
  },
  {
    policy: "Maternity leave is granted for 26 weeks, and paternity leave for 2 weeks.",
    source: "Astra HR Handbook, Section 4.3",
    tags: ["maternity", "paternity", "parental leave", "maternity leave", "paternity leave"]
  },
  {
    policy: "All employees must complete 8 hours of work per day. Flexi-hours are available between 8 AM to 8 PM.",
    source: "Astra HR Handbook, Section 2.1",
    tags: ["work hours", "flexi", "timing", "office hours", "working hours"]
  }
];

const findPolicy = (query) => {
  const lowercaseQuery = query.toLowerCase();
  for (const item of hrKnowledgeBase) {
    for (const tag of item.tags) {
      if (lowercaseQuery.includes(tag.toLowerCase())) {
        return { answer: item.policy, source: item.source };
      }
    }
  }
  return { answer: null, source: "none" };
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
    const safeReason = reason && reason.trim() ? reason.trim() : 'Not specified';
    const user = await User.findById(userId);
    if (!user || user.leaveBalance[type] === undefined) return { status: "Failed", message: "Invalid leave type or user" };
    if (user.leaveBalance[type] < days) {
      return { status: "Failed", message: `Insufficient ${type} leave. Available: ${user.leaveBalance[type]} days, Requested: ${days} days.` };
    }
    user.leaveBalance[type] -= days;
    await user.save();
    const leave = await LeaveRequest.create({ user: userId, type, days, reason: safeReason });
    return { status: "Success", leaveId: leave._id, type, days, reason: safeReason, remainingBalance: user.leaveBalance[type] };
  },
  scheduleMeeting: async ({ userId, title, date }) => {
    const meetingDate = new Date(date);
    const meeting = await Meeting.create({ user: userId, title, date: meetingDate });
    return { status: "Success", meetingId: meeting._id, title, date: meetingDate.toLocaleString() };
  },
  generateInterviewQuestions: async ({ role }) => {
    try {
      const response = await openai.chat.completions.create({
        model: modelName,
        messages: [
          { role: "system", content: "You are an AI Interview Coach. Generate 5 realistic interview questions for the given role. Return ONLY a JSON array of strings: [\"q1\", \"q2\", ...]" },
          { role: "user", content: `Role: ${role}` }
        ]
      });
      const content = response.choices[0].message.content.replace(/```json/g, '').replace(/```/g, '').trim();
      return { questions: JSON.parse(content), role };
    } catch (e) {
      return { questions: ["Describe your experience with this role.", "What is your greatest strength?", "Describe a challenging project.", "Where do you see yourself in 5 years?", "Why do you want this job?"], role };
    }
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

    const response = await openai.chat.completions.create({
      model: modelName,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.2
    });

    let aiPlanStr = response.choices[0].message.content.replace(/```json/g, '').replace(/```/g, '').trim();
    let aiPlan;
    try {
      aiPlan = JSON.parse(aiPlanStr);
    } catch (e) {
      sendSSE(res, 'error', { text: '❌ Failed to parse AI plan. Raw: ' + aiPlanStr });
      res.end();
      return;
    }

    const planSteps = Array.isArray(aiPlan?.plan) ? aiPlan.plan : [];

    // 3. Stream each step
    sendSSE(res, 'plan', { steps: planSteps.length, goal: aiPlan.final_goal });

    let finalMessage = "I have successfully processed your request.";

    for (const step of planSteps) {
      if (step.function === 'reply') {
        finalMessage = step.arguments.message;
      } else if (tools[step.function]) {
        sendSSE(res, 'step_start', {
          step: step.step,
          function: step.function,
          notes: step.notes,
          text: `⚡ Step ${step.step}: Calling ${step.function}...`
        });

        step.arguments.userId = userId;
        const result = await tools[step.function](step.arguments);

        // Format result for display
        let displayResult = result;

        sendSSE(res, 'step_result', {
          step: step.step,
          function: step.function,
          result: displayResult,
          success: result.status !== 'Failed' && !result.error
        });

        if (result.status === "Failed" || result.error) {
          finalMessage = result.message || result.error;
          break;
        }

        // Build meaningful final message from results
        if (step.function === 'checkLeaveBalance') {
          finalMessage = `Leave Balance → ${result.summary}`;
        } else if (step.function === 'applyForLeave') {
          finalMessage = `✅ Applied ${result.days} day(s) of ${result.type} leave. Remaining: ${result.remainingBalance} days.`;
        } else if (step.function === 'scheduleMeeting') {
          finalMessage = `✅ Scheduled "${result.title}" on ${result.date}.`;
        } else if (step.function === 'generateInterviewQuestions') {
          finalMessage = result.questions.map((q, i) => `Q${i+1}: ${q}`).join('\n');
        }
      }
    }

    sendSSE(res, 'done', { reply: finalMessage, source: policyMatch.source !== "none" ? policyMatch.source : undefined });

  } catch (error) {
    sendSSE(res, 'error', { text: `❌ Error: ${error.message}` });
  } finally {
    res.end();
  }
};

module.exports = { streamAiChat };
