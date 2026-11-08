import { useState } from 'react';
import {
  FaGraduationCap,
  FaUserTie,
  FaQuestionCircle,
  FaMagic,
  FaSpinner,
  FaCopy,
  FaCheck,
  FaLightbulb,
  FaExclamationTriangle,
} from 'react-icons/fa';
import { useCareerAI } from '../hooks/useCareerAI';
import AstraCard from '../components/ui/AstraCard';

const ROADMAP_PRESETS = [
  { label: 'MERN Stack (6m)', role: 'Full Stack MERN Developer', skillLevel: 'Beginner', timeline: '6' },
  { label: 'Frontend React (4m)', role: 'Frontend React & TypeScript Engineer', skillLevel: 'Intermediate', timeline: '4' },
  { label: 'Backend Node.js (6m)', role: 'Backend Node.js & Microservices Engineer', skillLevel: 'Intermediate', timeline: '6' },
];

const INTERVIEW_PRESETS = [
  { label: 'Backend Node (2 yrs)', role: 'Backend Node.js Developer', experience: '2', skills: 'Node.js, Express, MongoDB, JWT' },
  { label: 'Frontend React (1 yr)', role: 'Frontend React Developer', experience: '1', skills: 'React, TypeScript, Redux Toolkit, CSS' },
  { label: 'Full Stack Lead (4 yrs)', role: 'Senior Full Stack Engineer', experience: '4', skills: 'MERN Stack, System Design, Redis, Docker' },
];

const KNOWLEDGE_PRESETS = [
  'How to crack DSA interviews?',
  'How to become a MERN stack developer?',
  'What should a strong portfolio have?',
  'Tips for system design interviews?',
  'What is the maternity and remote work policy?',
];

const PLANNER_PRESETS = [
  'I want to become a Full Stack MERN Developer in 6 months.',
  'I want to transition into a Senior React & TypeScript Engineer within 1 year.',
  'Help me prepare for Backend Node.js and System Design interviews in 3 months.',
];

const CareerAI = () => {
  const [activeTab, setActiveTab] = useState<'roadmap' | 'interview' | 'knowledge' | 'planner'>('roadmap');
  const [copied, setCopied] = useState(false);

  const {
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
  } = useCareerAI();

  const handleTabSwitch = (tab: 'roadmap' | 'interview' | 'knowledge' | 'planner') => {
    setActiveTab(tab);
    setResult(null);
    setError(null);
    setCopied(false);
  };

  const handleCopyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(JSON.stringify(result.data, null, 2)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="astra-page fade-up">
      <div className="mb-4">
        <div className="astra-eyebrow">CAREER INTELLIGENCE SUITE</div>
        <h1 className="astra-page-title mb-1">Career AI Upgrade</h1>
        <p className="astra-page-subtitle mb-0">
          Accelerate your engineering growth with structured AI Roadmaps, Role-Based Interview Simulations, Grounded RAG Lookups, and Agentic Career Planning.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div
        className="astra-career-tabs mb-4"
        role="tablist"
        aria-label="Career AI Tools"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'roadmap'}
          className={`astra-career-tab-btn ${activeTab === 'roadmap' ? 'btn-emerald' : 'btn-dark-subtle'}`}
          onClick={() => handleTabSwitch('roadmap')}
        >
          <FaGraduationCap className="flex-shrink-0" /> <span>Roadmap Generator</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'interview'}
          className={`astra-career-tab-btn ${activeTab === 'interview' ? 'btn-emerald' : 'btn-dark-subtle'}`}
          onClick={() => handleTabSwitch('interview')}
        >
          <FaUserTie className="flex-shrink-0" /> <span>Interview Simulator</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'knowledge'}
          className={`astra-career-tab-btn ${activeTab === 'knowledge' ? 'btn-emerald' : 'btn-dark-subtle'}`}
          onClick={() => handleTabSwitch('knowledge')}
        >
          <FaQuestionCircle className="flex-shrink-0" /> <span>Knowledge Base (RAG)</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'planner'}
          className={`astra-career-tab-btn ${activeTab === 'planner' ? 'btn-emerald' : 'btn-dark-subtle'}`}
          onClick={() => handleTabSwitch('planner')}
        >
          <FaMagic className="flex-shrink-0" /> <span>Agentic Planner</span>
        </button>
      </div>

      {error && (
        <div className="astra-alert-error d-flex align-items-center justify-content-between mb-4" role="alert">
          <div className="d-flex align-items-center gap-2">
            <FaExclamationTriangle />
            <span>{error}</span>
          </div>
          <button
            type="button"
            className="astra-inline-action"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="row g-4">
        {/* Input Form Column */}
        <div className="col-lg-5">
          <AstraCard title="Configure Request">
            {activeTab === 'roadmap' && (
              <form onSubmit={handleGenerateRoadmap}>
                <div className="mb-3">
                  <div className="leave-subtext mb-2">Quick Presets:</div>
                  <div className="d-flex flex-wrap gap-1">
                    {ROADMAP_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        className="astra-preset-chip"
                        onClick={() =>
                          setRoadmapForm({
                            role: preset.role,
                            skillLevel: preset.skillLevel,
                            timeline: preset.timeline,
                          })
                        }
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="roadmap-role" className="astra-form-label">Target Role</label>
                  <input
                    id="roadmap-role"
                    type="text"
                    className="astra-form-input"
                    placeholder="e.g. Full Stack MERN Developer"
                    value={roadmapForm.role}
                    onChange={(e) => setRoadmapForm({ ...roadmapForm, role: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="roadmap-skill" className="astra-form-label">Current Skill Level</label>
                  <select
                    id="roadmap-skill"
                    className="astra-form-input"
                    value={roadmapForm.skillLevel}
                    onChange={(e) => setRoadmapForm({ ...roadmapForm, skillLevel: e.target.value })}
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label htmlFor="roadmap-timeline" className="astra-form-label">Timeline (Months)</label>
                  <input
                    id="roadmap-timeline"
                    type="number"
                    className="astra-form-input"
                    min="1"
                    max="24"
                    value={roadmapForm.timeline}
                    onChange={(e) => setRoadmapForm({ ...roadmapForm, timeline: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="astra-btn-primary" disabled={loading}>
                  {loading ? (
                    <>
                      <FaSpinner className="spin me-2" /> Generating Roadmap...
                    </>
                  ) : (
                    'Generate Career Roadmap'
                  )}
                </button>
              </form>
            )}

            {activeTab === 'interview' && (
              <form onSubmit={handleSimulateInterview}>
                <div className="mb-3">
                  <div className="leave-subtext mb-2">Quick Presets:</div>
                  <div className="d-flex flex-wrap gap-1">
                    {INTERVIEW_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        className="astra-preset-chip"
                        onClick={() =>
                          setInterviewForm({
                            role: preset.role,
                            experience: preset.experience,
                            skills: preset.skills,
                          })
                        }
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="interview-role" className="astra-form-label">Job Role</label>
                  <input
                    id="interview-role"
                    type="text"
                    className="astra-form-input"
                    placeholder="e.g. Backend Engineer"
                    value={interviewForm.role}
                    onChange={(e) => setInterviewForm({ ...interviewForm, role: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="interview-exp" className="astra-form-label">Years of Experience</label>
                  <input
                    id="interview-exp"
                    type="number"
                    className="astra-form-input"
                    min="0"
                    max="20"
                    value={interviewForm.experience}
                    onChange={(e) => setInterviewForm({ ...interviewForm, experience: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="interview-skills" className="astra-form-label">Key Skills</label>
                  <input
                    id="interview-skills"
                    type="text"
                    className="astra-form-input"
                    placeholder="e.g. Node.js, MongoDB, Docker"
                    value={interviewForm.skills}
                    onChange={(e) => setInterviewForm({ ...interviewForm, skills: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="astra-btn-primary" disabled={loading}>
                  {loading ? (
                    <>
                      <FaSpinner className="spin me-2" /> Preparing Questions...
                    </>
                  ) : (
                    'Generate Interview Questions'
                  )}
                </button>
              </form>
            )}

            {activeTab === 'knowledge' && (
              <form onSubmit={handleAskKnowledge}>
                <div className="mb-3">
                  <div className="leave-subtext mb-2">Verified Knowledge Topics:</div>
                  <div className="d-flex flex-wrap gap-1">
                    {KNOWLEDGE_PRESETS.map((q) => (
                      <button
                        key={q}
                        type="button"
                        className="astra-preset-chip"
                        onClick={() => setKnowledgeForm({ question: q })}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="knowledge-question" className="astra-form-label">Ask a Question (RAG)</label>
                  <input
                    id="knowledge-question"
                    type="text"
                    className="astra-form-input"
                    placeholder="e.g. How to crack DSA interviews?"
                    value={knowledgeForm.question}
                    onChange={(e) => setKnowledgeForm({ question: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="astra-btn-primary" disabled={loading}>
                  {loading ? (
                    <>
                      <FaSpinner className="spin me-2" /> Searching Knowledge Base...
                    </>
                  ) : (
                    'Ask Knowledge Base'
                  )}
                </button>
              </form>
            )}

            {activeTab === 'planner' && (
              <form onSubmit={handleAgenticPlanner}>
                <div className="mb-3">
                  <div className="leave-subtext mb-2">Sample Goals:</div>
                  <div className="d-flex flex-column gap-1">
                    {PLANNER_PRESETS.map((goal) => (
                      <button
                        key={goal}
                        type="button"
                        className="astra-preset-chip text-start"
                        onClick={() => setPlannerForm({ prompt: goal })}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="planner-goal" className="astra-form-label">What is your career goal?</label>
                  <textarea
                    id="planner-goal"
                    className="astra-form-input"
                    rows={4}
                    placeholder="e.g. I want to become a MERN Developer in 6 months."
                    value={plannerForm.prompt}
                    onChange={(e) => setPlannerForm({ prompt: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" className="astra-btn-primary" disabled={loading}>
                  {loading ? (
                    <>
                      <FaSpinner className="spin me-2" /> Building Execution Plan...
                    </>
                  ) : (
                    'Execute Agentic Plan'
                  )}
                </button>
              </form>
            )}
          </AstraCard>
        </div>

        {/* Results Column */}
        <div className="col-lg-7">
          <AstraCard
            title="AI Output & Recommendations"
            bodyClass="d-flex flex-column"
            headerAction={
              result ? (
                <button
                  type="button"
                  className="astra-inline-action d-inline-flex align-items-center gap-1"
                  onClick={handleCopyResult}
                >
                  {copied ? <FaCheck size={11} /> : <FaCopy size={11} />}
                  <span>{copied ? 'Copied JSON' : 'Copy JSON'}</span>
                </button>
              ) : undefined
            }
          >
            {!result && !loading && (
              <div className="astra-empty py-5 my-auto">
                <div className="mb-2" style={{ fontSize: '1.6rem', color: '#10b981' }}>
                  <FaLightbulb />
                </div>
                <div className="fw-semibold text-light mb-1">Ready to Generate</div>
                <div>Select a quick preset or fill in the form on the left to generate structured AI career guidance.</div>
              </div>
            )}

            {loading && (
              <div className="text-center py-5 my-auto">
                <FaSpinner className="spin fs-2 mb-3" style={{ color: '#10b981' }} />
                <div className="text-secondary small">Synthesizing structured recommendations...</div>
              </div>
            )}

            {result?.type === 'roadmap' && (
              <div className="fade-up">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4 pb-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <h5 className="mb-0" style={{ color: '#34d399', fontWeight: 700 }}>
                    {result.data.role}
                  </h5>
                  <span className="astra-header-pill">
                    {result.data.timeline} Months Curriculum
                  </span>
                </div>
                <div>
                  {result.data.roadmap?.map((r: any, idx: number) => (
                    <div
                      key={idx}
                      className="mb-3 p-3 rounded-3"
                      style={{ background: 'rgba(11, 15, 25, 0.65)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
                    >
                      <h6 style={{ color: '#fbbf24', fontWeight: 700, marginBottom: '0.5rem' }}>
                        {r.month} — {r.focus}
                      </h6>
                      <ul className="mb-0 text-secondary small ps-3">
                        {r.tasks?.map((t: string, i: number) => (
                          <li key={i} className="mb-1" style={{ color: '#cbd5e1' }}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result?.type === 'interview' && (
              <div className="fade-up">
                <div className="d-flex justify-content-between mb-4 pb-3 text-secondary small flex-wrap gap-2" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <span className="astra-header-pill"><strong>Role:</strong> {result.data.role}</span>
                  <span className="astra-header-pill"><strong>Difficulty:</strong> {result.data.difficulty}</span>
                  <span className="astra-header-pill"><strong>Time Limit:</strong> {result.data.timeLimit}</span>
                </div>
                <div>
                  {result.data.questions?.map((q: any, idx: number) => (
                    <div
                      key={idx}
                      className="mb-3 p-3 rounded-3"
                      style={{ background: 'rgba(11, 15, 25, 0.65)', border: '1px solid rgba(255, 255, 255, 0.08)' }}
                    >
                      <div className="fw-bold mb-2" style={{ color: '#f8fafc', fontSize: '0.92rem' }}>
                        Q{idx + 1}: {q.question}
                      </div>
                      <div className="small p-2 rounded-2" style={{ background: 'rgba(16, 185, 129, 0.08)', color: '#a7f3d0', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        💡 <strong>Interviewer Hint:</strong> {q.hint}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result?.type === 'knowledge' && (
              <div
                className="fade-up p-4 rounded-3"
                style={{ background: 'rgba(11, 15, 25, 0.7)', border: '1px solid rgba(16, 185, 129, 0.3)' }}
              >
                <h5 style={{ color: '#34d399', marginBottom: '0.85rem', fontWeight: 700 }}>
                  Grounded RAG Answer
                </h5>
                <p className="mb-0" style={{ color: '#f8fafc', fontSize: '0.95rem', lineHeight: 1.65 }}>
                  {result.data.answer}
                </p>
                {result.data.source ? (
                  <div className="small mt-3 pt-2" style={{ color: '#38bdf8', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    📖 <strong>Verified Source:</strong> {result.data.source}
                  </div>
                ) : (
                  <div className="small mt-3 pt-2" style={{ color: '#94a3b8', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    Tip: Try one of the verified knowledge topics on the left (e.g., DSA, System Design, MERN, Portfolio, or Leave Policy).
                  </div>
                )}
              </div>
            )}

            {result?.type === 'planner' && (
              <div className="fade-up">
                <h5 className="mb-4 pb-2" style={{ color: '#34d399', fontWeight: 700, borderBottom: '1px solid var(--border-subtle)' }}>
                  Goal: {result.data.goal}
                </h5>

                <div className="mb-3 p-3 rounded-3" style={{ background: 'rgba(11, 15, 25, 0.65)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <h6 style={{ color: '#fbbf24', fontWeight: 700 }}>1. Learning Plan</h6>
                  <ul className="small mb-0 ps-3" style={{ color: '#cbd5e1' }}>
                    {result.data.learningPlan?.map((l: string, i: number) => <li key={i} className="mb-1">{l}</li>)}
                  </ul>
                </div>

                <div className="mb-3 p-3 rounded-3" style={{ background: 'rgba(11, 15, 25, 0.65)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <h6 style={{ color: '#38bdf8', fontWeight: 700 }}>2. Recommended Projects</h6>
                  <ul className="small mb-0 ps-3" style={{ color: '#cbd5e1' }}>
                    {result.data.projects?.map((p: string, i: number) => <li key={i} className="mb-1">{p}</li>)}
                  </ul>
                </div>

                <div className="p-3 rounded-3" style={{ background: 'rgba(11, 15, 25, 0.65)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <h6 style={{ color: '#34d399', fontWeight: 700 }}>3. Interview Preparation</h6>
                  <ul className="small mb-0 ps-3" style={{ color: '#cbd5e1' }}>
                    {result.data.interviewPrep?.map((p: string, i: number) => <li key={i} className="mb-1">{p}</li>)}
                  </ul>
                </div>
              </div>
            )}
          </AstraCard>
        </div>
      </div>
    </div>
  );
};

export default CareerAI;
