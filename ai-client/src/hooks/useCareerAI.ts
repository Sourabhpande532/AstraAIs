import { useState } from "react";
import api from "../lib/api";
import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

const buildClientRoadmapFallback = (role: string, skillLevel: string, timeline: string) => {
  const cleanRole = role.trim() || "Full Stack Developer";
  const cleanLevel = skillLevel.trim() || "Beginner";
  const totalMonths = Math.min(24, Math.max(1, parseInt(timeline, 10) || 6));

  const phases = [
    {
      focus: `Core Foundations & ${cleanRole} Tooling (${cleanLevel} Track)`,
      tasks: [
        `Master essential language fundamentals, type safety, and modern runtime patterns for ${cleanRole}.`,
        `Configure Git workflows, ESLint/TypeScript rules, and modular component or service architecture.`,
        `Build a foundational feature module with form validation and clean error states.`
      ]
    },
    {
      focus: `Data Modeling, REST APIs & Global State Synchronization`,
      tasks: [
        `Design normalized and document schemas with Mongoose validations and indexes.`,
        `Implement stateless JWT authentication, protected routes, and Redux Toolkit async thunks.`,
        `Test API contracts across edge cases including empty states and unauthorized requests.`
      ]
    },
    {
      focus: `AI Engineering, Real-Time Streaming & RAG Integration`,
      tasks: [
        `Integrate Server-Sent Events (SSE) for real-time AI progress streaming and buffer handling.`,
        `Build grounded Retrieval-Augmented Generation (RAG) lookups with source citations.`,
        `Implement structured JSON prompt engineering and deterministic tool-calling registries.`
      ]
    },
    {
      focus: `System Design, Performance Optimization & Production Readiness`,
      tasks: [
        `Audit bundle size, lazy-load routes, and eliminate unnecessary component re-renders.`,
        `Harden CORS policies, environment variable isolation, and service worker caching.`,
        `Complete an end-to-end production deployment and prepare a technical walkthrough.`
      ]
    }
  ];

  const roadmap = Array.from({ length: totalMonths }, (_, idx) => {
    const phase = phases[idx % phases.length];
    return {
      month: `Month ${idx + 1}`,
      focus: totalMonths <= 4 ? phase.focus : `${phase.focus} (Stage ${Math.floor(idx / phases.length) + 1})`,
      tasks: phase.tasks
    };
  });

  return {
    role: cleanRole,
    timeline: String(totalMonths),
    roadmap
  };
};

const buildClientInterviewFallback = (role: string, experience: string, skills: string) => {
  const cleanRole = role.trim() || "Software Engineer";
  const expYears = Math.max(0, parseInt(experience, 10) || 0);
  const skillList = skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const s1 = skillList[0] || cleanRole;
  const s2 = skillList[1] || "REST APIs";
  const s3 = skillList[2] || "Database Design";

  return {
    role: cleanRole,
    difficulty: expYears >= 4 ? "Hard" : expYears >= 2 ? "Medium" : "Easy-Medium",
    timeLimit: expYears >= 4 ? "45 mins" : "30 mins",
    questions: [
      {
        question: `How do you structure a production ${cleanRole} application using ${s1} to keep business logic decoupled from UI or routing layers?`,
        hint: `Highlight MVC or custom hook patterns, predictable state slices, and reusable modules.`
      },
      {
        question: `When integrating ${s1} with ${s2}, how do you handle authentication, token expiration, and request cancellation?`,
        hint: `Discuss JWT Bearer headers, auth middleware verification, AbortController, and graceful error states.`
      },
      {
        question: `Walk through how you identify and resolve performance bottlenecks involving ${s3} under growing user traffic.`,
        hint: `Cover query indexing, avoiding N+1 queries, payload trimming, and selective client-side memoization.`
      },
      {
        question: `How do you prevent hallucinations and security vulnerabilities when adding AI tool-calling to a ${cleanRole} workflow?`,
        hint: `Explain strict JSON schemas, server-side userId injection from verified JWTs, and database validation checks.`
      }
    ]
  };
};

const buildClientPlannerFallback = (prompt: string) => {
  const cleanGoal = prompt.trim() || "Become a job-ready Full Stack Engineer";
  return {
    goal: cleanGoal,
    learningPlan: [
      `Master core TypeScript, React, Node.js, and Express architecture tailored toward: "${cleanGoal}".`,
      `Build fluency in Redux Toolkit state management, async thunks, and real-time Server-Sent Events (SSE).`,
      `Practice structured prompt engineering, grounded RAG policy matching, and safe agentic tool execution.`,
      `Review system design fundamentals: caching, indexing, stateless JWT security, and responsive UI systems.`
    ],
    projects: [
      `Agentic HR & Operations Workspace with draggable SSE streaming terminal and live Redux dashboard sync.`,
      `Full-Stack Career Intelligence Suite featuring JSON roadmap generation, interview simulation, and RAG lookup.`,
      `Production-grade REST API service with MVC separation, role guards, and automated validation.`
    ],
    interviewPrep: [
      `Solve 100+ curated DSA problems across arrays, hash maps, trees, two-pointers, and dynamic programming.`,
      `Prepare a concise architectural narrative covering why SSE was chosen over WebSockets and RTK over Context.`,
      `Conduct timed mock technical and behavioral interviews focusing on real debugging and optimization stories.`
    ]
  };
};

export const useCareerAI = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const [roadmapForm, setRoadmapForm] = useState({
    role: "",
    skillLevel: "Beginner",
    timeline: "6",
  });
  const [interviewForm, setInterviewForm] = useState({
    role: "",
    experience: "0",
    skills: "",
  });
  const [knowledgeForm, setKnowledgeForm] = useState({ question: "" });
  const [plannerForm, setPlannerForm] = useState({ prompt: "" });

  const getHeaders = () => ({
    headers: { Authorization: `Bearer ${user?.token}` },
  });

  const handleGenerateRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roadmapForm.role.trim()) {
      setError("Please enter a target role to generate your roadmap.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.post(
        "/api/career/roadmap",
        roadmapForm,
        getHeaders(),
      );
      if (res.data && Array.isArray(res.data.roadmap)) {
        setResult({ type: "roadmap", data: res.data });
      } else {
        setResult({
          type: "roadmap",
          data: buildClientRoadmapFallback(roadmapForm.role, roadmapForm.skillLevel, roadmapForm.timeline),
        });
      }
    } catch {
      setResult({
        type: "roadmap",
        data: buildClientRoadmapFallback(roadmapForm.role, roadmapForm.skillLevel, roadmapForm.timeline),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!interviewForm.role.trim() || !interviewForm.skills.trim()) {
      setError("Please provide both a job role and key skills.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.post(
        "/api/career/interview",
        interviewForm,
        getHeaders(),
      );
      if (res.data && Array.isArray(res.data.questions)) {
        setResult({ type: "interview", data: res.data });
      } else {
        setResult({
          type: "interview",
          data: buildClientInterviewFallback(interviewForm.role, interviewForm.experience, interviewForm.skills),
        });
      }
    } catch {
      setResult({
        type: "interview",
        data: buildClientInterviewFallback(interviewForm.role, interviewForm.experience, interviewForm.skills),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAskKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!knowledgeForm.question.trim()) {
      setError("Please enter a question for the Knowledge Base.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.post(
        "/api/career/knowledge",
        knowledgeForm,
        getHeaders(),
      );
      setResult({ type: "knowledge", data: res.data });
    } catch (err: any) {
      setError(err.response?.data?.error || "Unable to reach the Knowledge Base right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAgenticPlanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plannerForm.prompt.trim()) {
      setError("Please describe your career goal to generate an execution plan.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.post(
        "/api/career/planner",
        plannerForm,
        getHeaders(),
      );
      if (res.data && (res.data.learningPlan || res.data.projects)) {
        setResult({ type: "planner", data: res.data });
      } else {
        setResult({
          type: "planner",
          data: buildClientPlannerFallback(plannerForm.prompt),
        });
      }
    } catch {
      setResult({
        type: "planner",
        data: buildClientPlannerFallback(plannerForm.prompt),
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    setError,
    result,
    setResult,
    roadmapForm,
    setRoadmapForm,
    interviewForm,
    setInterviewForm,
    knowledgeForm,
    setKnowledgeForm,
    plannerForm,
    setPlannerForm,
    handleGenerateRoadmap,
    handleSimulateInterview,
    handleAskKnowledge,
    handleAgenticPlanner,
  };
};
