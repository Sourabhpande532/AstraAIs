const OpenAI = require('openai');

const apiKey = process.env.OPENAI_API_KEY || "dummy";
const isOpenRouter = apiKey.startsWith("sk-or-");
const baseURL = isOpenRouter ? "https://openrouter.ai/api/v1" : "https://api.openai.com/v1";
const modelName = isOpenRouter ? "openai/gpt-4o-mini" : "gpt-4o-mini";
const fallbackModels = isOpenRouter
  ? [modelName, "nvidia/nemotron-3-nano-30b-a3b:free", "openrouter/free"]
  : [modelName];

const openai = new OpenAI({ apiKey, baseURL });

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

  return { ok: false };
};

const callChatCompletion = async (messages, temperature = 0.3) => {
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

// Structured fallback builders so career tools never fail if external AI quota is reached
const buildFallbackRoadmap = (role, skillLevel, timeline) => {
  const cleanRole = String(role || 'Full Stack Developer').trim();
  const cleanLevel = String(skillLevel || 'Beginner').trim();
  const totalMonths = Math.min(24, Math.max(1, parseInt(timeline, 10) || 6));

  const phaseTemplates = [
    {
      focus: `Core Foundations & ${cleanRole} Tooling (${cleanLevel} Track)`,
      tasks: [
        `Master essential language fundamentals, type safety, and modern runtime patterns for ${cleanRole}.`,
        `Set up professional Git workflows, linting, debugging tools, and modular project architecture.`,
        `Build and deploy a foundational milestone module with clean error handling and validation.`
      ]
    },
    {
      focus: `Data Modeling, APIs & State Architecture`,
      tasks: [
        `Design normalized and document schemas, indexing strategies, and CRUD data pipelines.`,
        `Implement secure RESTful endpoints, JWT authentication, and predictable client state synchronization.`,
        `Write integration tests covering edge cases, empty states, and malformed payload handling.`
      ]
    },
    {
      focus: `Advanced Systems, AI Integration & Real-Time Workflows`,
      tasks: [
        `Integrate streaming responses (SSE), structured JSON prompt engineering, and grounded RAG lookups.`,
        `Optimize rendering performance, query execution times, and bundle size across devices.`,
        `Implement role-based access control, rate limiting, and defensive input sanitization.`
      ]
    },
    {
      focus: `System Design, Scalability & Production Deployment`,
      tasks: [
        `Architect caching layers, horizontal scaling strategies, and resilient error recovery flows.`,
        `Configure CI/CD pipelines, environment security, and production monitoring.`,
        `Complete an end-to-end capstone project with technical documentation and interview walkthrough prep.`
      ]
    }
  ];

  const roadmap = Array.from({ length: totalMonths }, (_, index) => {
    const phase = phaseTemplates[index % phaseTemplates.length];
    return {
      month: `Month ${index + 1}`,
      focus: totalMonths <= 4 ? phase.focus : `${phase.focus} — Stage ${Math.floor(index / phaseTemplates.length) + 1}`,
      tasks: phase.tasks
    };
  });

  return {
    role: cleanRole,
    timeline: String(totalMonths),
    roadmap
  };
};

const buildFallbackInterview = (role, experience, skills) => {
  const cleanRole = String(role || 'Software Engineer').trim();
  const expYears = Math.max(0, parseInt(experience, 10) || 0);
  const skillList = String(skills || 'JavaScript, TypeScript, System Design')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const primarySkill = skillList[0] || cleanRole;
  const secondarySkill = skillList[1] || 'API Design';
  const tertiarySkill = skillList[2] || 'Database Optimization';

  const difficulty = expYears >= 4 ? 'Hard' : expYears >= 2 ? 'Medium' : 'Easy-Medium';
  const timeLimit = expYears >= 4 ? '45 mins' : '30 mins';

  return {
    role: cleanRole,
    difficulty,
    timeLimit,
    questions: [
      {
        question: `In a production ${cleanRole} codebase using ${primarySkill}, how do you structure modules and state to prevent regressions as features scale?`,
        hint: `Discuss separation of concerns, predictable data flow, custom hooks or service layers, and strict contract boundaries.`
      },
      {
        question: `How would you design and secure an API workflow combining ${primarySkill} and ${secondarySkill} under high concurrency?`,
        hint: `Cover stateless JWT authentication, input validation, idempotency, and graceful error handling.`
      },
      {
        question: `Walk through how you diagnose and fix latency or performance bottlenecks involving ${tertiarySkill}.`,
        hint: `Mention profiling first, indexing queries, avoiding N+1 lookups, and minimizing redundant network payloads.`
      },
      {
        question: `Describe a real-world edge case (such as network drops, partial streams, or expired tokens) and how you handle it cleanly for the end user.`,
        hint: `Explain abort controllers, stream buffering, retry mechanisms, and human-friendly UI error feedback.`
      }
    ]
  };
};

const buildFallbackAgenticPlan = (prompt) => {
  const cleanPrompt = String(prompt || 'Advance into a Senior Full Stack Engineer role').trim();
  return {
    goal: cleanPrompt,
    learningPlan: [
      `Master core architecture, type-safe patterns, and clean code principles aligned with: "${cleanPrompt}".`,
      `Deepen expertise in REST APIs, Server-Sent Events (SSE), authentication security, and database indexing.`,
      `Practice prompt engineering, structured JSON validation, RAG retrieval, and agentic tool orchestration.`,
      `Study distributed system design, caching strategies, and frontend rendering optimization.`
    ],
    projects: [
      `AI-Powered Operations Portal with real-time SSE streaming and MongoDB tool execution.`,
      `End-to-End Role-Based SaaS Dashboard with Redux Toolkit state synchronization and offline-ready PWA support.`,
      `Grounded RAG Knowledge Assistant with source citations, tag matching, and defensive schema validation.`
    ],
    interviewPrep: [
      `Practice 100+ curated Data Structures & Algorithms problems focusing on arrays, hashes, trees, and graphs.`,
      `Prepare a 15-minute architectural walkthrough explaining MVC separation, JWT security, and state flow.`,
      `Run timed mock technical interviews covering system trade-offs, debugging scenarios, and behavioral leadership.`
    ]
  };
};

// -------------------------------------------------------------
// Feature 1: AI Career Roadmap Generator
// -------------------------------------------------------------
const generateRoadmap = async (req, res) => {
  try {
    const { role, skillLevel, timeline } = req.body;

    // Concept Used: Prompt Engineering & JSON Output
    const systemPrompt = `You are an AI Career Coach. Generate a step-by-step learning roadmap. 
Respond with ONLY valid JSON and no markdown formatting or prose.
Format:
{
  "role": "string",
  "timeline": "string",
  "roadmap": [
    { "month": "string", "focus": "string", "tasks": ["string", "string"] }
  ]
}`;
    const userPrompt = `Role: ${role}\nCurrent Skill Level: ${skillLevel}\nTimeline: ${timeline} months`;

    try {
      const content = await callChatCompletion([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ], 0.3);
      const parsed = tryParseModelJSON(content);
      if (parsed.ok && parsed.value && Array.isArray(parsed.value.roadmap)) {
        return res.json(parsed.value);
      }
    } catch {
      // Fallback below
    }

    return res.json(buildFallbackRoadmap(role, skillLevel, timeline));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// -------------------------------------------------------------
// Feature 2: AI Interview Simulator
// -------------------------------------------------------------
const simulateInterview = async (req, res) => {
  try {
    const { role, experience, skills } = req.body;

    // Concept Used: Prompt Engineering & Structured JSON
    const systemPrompt = `You are an expert AI Interviewer. Generate interview questions based on the user's profile.
Respond with ONLY valid JSON and no markdown formatting or prose.
Format:
{
  "role": "string",
  "difficulty": "string",
  "timeLimit": "string",
  "questions": [
    { "question": "string", "hint": "string" }
  ]
}`;
    const userPrompt = `Job Role: ${role}\nExperience: ${experience} years\nSkills: ${skills}`;

    try {
      const content = await callChatCompletion([
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ], 0.5);
      const parsed = tryParseModelJSON(content);
      if (parsed.ok && parsed.value && Array.isArray(parsed.value.questions)) {
        return res.json(parsed.value);
      }
    } catch {
      // Fallback below
    }

    return res.json(buildFallbackInterview(role, experience, skills));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// -------------------------------------------------------------
// Feature 3: AI Knowledge Assistant (RAG)
// -------------------------------------------------------------
const careerKnowledgeBase = [
  { 
    answer: "To become a MERN stack developer, learn MongoDB, Express.js, React, and Node.js in that order. Build at least 2-3 full-stack projects and contribute to open source.", 
    source: "AstraAI Career Guide - Full Stack",
    tags: ["mern", "full stack", "mongodb", "react", "node", "express", "full-stack", "typescript"]
  },
  { 
    answer: "For system design interviews, understand distributed systems, CAP theorem, load balancers, caching (Redis), databases (SQL vs NoSQL), and practice designing Twitter, Uber, or YouTube from scratch.", 
    source: "AstraAI Interview Guide - System Design",
    tags: ["system design", "architecture", "scale", "scalable", "distributed", "redis", "cache", "microservices"]
  },
  { 
    answer: "A strong portfolio should have 2-3 substantial projects solving real problems — include a REST API project, a full-stack app, and ideally one project with AI/ML integration.", 
    source: "AstraAI Resume Tips",
    tags: ["project", "resume", "portfolio", "projects", "github", "cv", "hire", "recruiter"]
  },
  {
    answer: "To crack DSA interviews, consistently solve LeetCode problems. Focus on Arrays, Strings, Trees, Graphs, and Dynamic Programming. Aim for 150+ problems before interviews at top companies.",
    source: "AstraAI Interview Guide - DSA",
    tags: ["dsa", "leetcode", "data structures", "algorithms", "coding", "interview prep", "problem solving", "crack"]
  },
  {
    answer: "Frontend developers should master HTML, CSS, JavaScript, React, state management (Redux/Zustand), REST/GraphQL APIs, and performance optimization techniques.",
    source: "AstraAI Career Guide - Frontend",
    tags: ["frontend", "front-end", "javascript", "html", "css", "ui", "web development", "redux", "tailwind"]
  },
  {
    answer: "Backend developers should know Node.js or Python/Java, RESTful API design, databases (SQL + NoSQL), authentication (JWT/OAuth), Docker, and cloud basics (AWS/GCP).",
    source: "AstraAI Career Guide - Backend",
    tags: ["backend", "back-end", "server", "api", "node.js", "python", "java", "docker", "aws", "cloud", "jwt", "sql"]
  },
  {
    answer: "Soft skills matter as much as technical skills. Practice communication, explain your thought process out loud during interviews, and always clarify requirements before coding.",
    source: "AstraAI Interview Guide - Soft Skills",
    tags: ["soft skills", "communication", "interview tips", "behavioral", "tips", "hr round", "salary", "negotiation"]
  },
  {
    answer: "Employees at Astra HR are entitled to 12 days of casual leave, 10 days of sick leave, and 15 days of earned leave annually, plus 26 weeks maternity and 2 weeks paternity leave, and up to 2 days/week remote work.",
    source: "Astra HR Handbook, Sections 4.1 - 5.2",
    tags: ["leave", "maternity", "paternity", "remote", "wfh", "policy", "vacation", "sick"]
  }
];

const findCareerPolicy = (query) => {
  const lowercaseQuery = String(query || '').toLowerCase();
  for (const item of careerKnowledgeBase) {
    for (const tag of item.tags) {
      if (lowercaseQuery.includes(tag)) {
        return { answer: item.answer, source: item.source };
      }
    }
  }
  return { answer: "I don't know.", source: null };
};

const knowledgeAssistant = async (req, res) => {
  try {
    const { question } = req.body;
    // Concept Used: RAG & Matching
    const result = findCareerPolicy(question);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// -------------------------------------------------------------
// Feature 4: Agentic Career Planner
// -------------------------------------------------------------
const agenticPlanner = async (req, res) => {
  try {
    const { prompt } = req.body;

    // Concept Used: Agentic Planning & Tool Calling
    const systemPrompt = `You are an Agentic Career Planner. Create a comprehensive plan for the user.
Available Tools:
- createLearningPlan({ topics: string[] })
- recommendProjects({ projects: string[] })
- interviewPrep({ topics: string[] })

Respond with ONLY valid JSON representing the execution plan.
Format:
{
  "plan": [
    { "step": 1, "function": "toolName", "arguments": { ... } }
  ],
  "final_goal": "string"
}`;

    try {
      const content = await callChatCompletion([
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ], 0.3);
      const parsed = tryParseModelJSON(content);
      if (parsed.ok && parsed.value && Array.isArray(parsed.value.plan)) {
        const aiPlan = parsed.value;
        const finalPlan = {
          learningPlan: [],
          projects: [],
          interviewPrep: []
        };

        for (const step of aiPlan.plan) {
          if (step.function === 'createLearningPlan' && Array.isArray(step.arguments?.topics)) {
            finalPlan.learningPlan.push(...step.arguments.topics);
          } else if (step.function === 'recommendProjects' && Array.isArray(step.arguments?.projects)) {
            finalPlan.projects.push(...step.arguments.projects);
          } else if (step.function === 'interviewPrep' && Array.isArray(step.arguments?.topics)) {
            finalPlan.interviewPrep.push(...step.arguments.topics);
          }
        }

        if (
          finalPlan.learningPlan.length > 0 ||
          finalPlan.projects.length > 0 ||
          finalPlan.interviewPrep.length > 0
        ) {
          return res.json({ goal: aiPlan.final_goal || prompt, ...finalPlan });
        }
      }
    } catch {
      // Fallback below
    }

    return res.json(buildFallbackAgenticPlan(prompt));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  generateRoadmap,
  simulateInterview,
  knowledgeAssistant,
  agenticPlanner
};
