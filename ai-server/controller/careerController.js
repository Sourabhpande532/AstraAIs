const OpenAI = require('openai');

const apiKey = process.env.OPENAI_API_KEY || "dummy";
const baseURL = apiKey.startsWith("sk-or-") ? "https://openrouter.ai/api/v1" : "https://api.openai.com/v1";
const modelName = apiKey.startsWith("sk-or-") ? "openai/gpt-4o-mini" : "gpt-4o-mini";
const openai = new OpenAI({ apiKey, baseURL });

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

    const response = await openai.chat.completions.create({
      model: modelName,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3
    });

    const content = response.choices[0].message.content.replace(/```json/g, '').replace(/```/g, '').trim();
    res.json(JSON.parse(content));
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

    const response = await openai.chat.completions.create({
      model: modelName,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.5
    });

    const content = response.choices[0].message.content.replace(/```json/g, '').replace(/```/g, '').trim();
    res.json(JSON.parse(content));
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
    tags: ["mern", "full stack", "mongodb", "react", "node", "express", "full-stack"]
  },
  { 
    answer: "For system design interviews, understand distributed systems, CAP theorem, load balancers, caching (Redis), databases (SQL vs NoSQL), and practice designing Twitter, Uber, or YouTube from scratch.", 
    source: "AstraAI Interview Guide - System Design",
    tags: ["system design", "architecture", "scale", "scalable", "distributed", "redis", "cache"]
  },
  { 
    answer: "A strong portfolio should have 2-3 substantial projects solving real problems — include a REST API project, a full-stack app, and ideally one project with AI/ML integration.", 
    source: "AstraAI Resume Tips",
    tags: ["project", "resume", "portfolio", "projects", "github"]
  },
  {
    answer: "To crack DSA interviews, consistently solve LeetCode problems. Focus on Arrays, Strings, Trees, Graphs, and Dynamic Programming. Aim for 150+ problems before interviews at top companies.",
    source: "AstraAI Interview Guide - DSA",
    tags: ["dsa", "leetcode", "data structures", "algorithms", "coding", "interview prep", "problem solving"]
  },
  {
    answer: "Frontend developers should master HTML, CSS, JavaScript, React, state management (Redux/Zustand), REST/GraphQL APIs, and performance optimization techniques.",
    source: "AstraAI Career Guide - Frontend",
    tags: ["frontend", "react", "javascript", "html", "css", "ui", "web development"]
  },
  {
    answer: "Backend developers should know Node.js or Python/Java, RESTful API design, databases (SQL + NoSQL), authentication (JWT/OAuth), Docker, and cloud basics (AWS/GCP).",
    source: "AstraAI Career Guide - Backend",
    tags: ["backend", "server", "api", "node.js", "python", "java", "docker", "aws", "cloud"]
  },
  {
    answer: "Soft skills matter as much as technical skills. Practice communication, explain your thought process out loud during interviews, and always clarify requirements before coding.",
    source: "AstraAI Interview Guide - Soft Skills",
    tags: ["soft skills", "communication", "interview tips", "behavioral", "tips"]
  }
];

const findCareerPolicy = (query) => {
  const lowercaseQuery = query.toLowerCase();
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

    const response = await openai.chat.completions.create({
      model: modelName,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.3
    });

    const content = response.choices[0].message.content.replace(/```json/g, '').replace(/```/g, '').trim();
    const aiPlan = JSON.parse(content);
    
    // Parse the execution plan to structure a final response for the user
    const finalPlan = {
      learningPlan: [],
      projects: [],
      interviewPrep: []
    };

    if (aiPlan.plan) {
      for (const step of aiPlan.plan) {
        if (step.function === 'createLearningPlan' && step.arguments.topics) {
          finalPlan.learningPlan.push(...step.arguments.topics);
        } else if (step.function === 'recommendProjects' && step.arguments.projects) {
          finalPlan.projects.push(...step.arguments.projects);
        } else if (step.function === 'interviewPrep' && step.arguments.topics) {
          finalPlan.interviewPrep.push(...step.arguments.topics);
        }
      }
    }

    res.json({ goal: aiPlan.final_goal, ...finalPlan });
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
