import { useState } from 'react';
import { FaGraduationCap, FaUserTie, FaQuestionCircle, FaMagic, FaSpinner } from 'react-icons/fa';
import { useCareerAI } from '../hooks/useCareerAI';
import AstraCard from '../components/ui/AstraCard';

const CareerAI = () => {
  const [activeTab, setActiveTab] = useState('roadmap');
  
  const {
    loading, result, setResult,
    roadmapForm, setRoadmapForm,
    interviewForm, setInterviewForm,
    knowledgeForm, setKnowledgeForm,
    plannerForm, setPlannerForm,
    handleGenerateRoadmap, handleSimulateInterview,
    handleAskKnowledge, handleAgenticPlanner,
  } = useCareerAI();

  return (
    <div className="astra-page fade-up">
      <h1 className="astra-page-title">Career AI Upgrade</h1>
      <p className="astra-page-subtitle">Level up your career with AI Prompt Engineering, RAG, and Agentic Tool Calling.</p>

      {/* Tabs */}
      <div className="d-flex gap-2 mb-4 overflow-auto pb-2 custom-scrollbar" style={{ WebkitOverflowScrolling: 'touch' }}>
        <button 
          className={`btn btn-sm px-3 py-2 fw-semibold rounded-pill ${activeTab === 'roadmap' ? 'btn-emerald' : 'btn-dark-subtle'}`}
          onClick={() => { setActiveTab('roadmap'); setResult(null); }}
        >
          <FaGraduationCap className="me-2" /> Roadmap Gen
        </button>
        <button 
          className={`btn btn-sm px-3 py-2 fw-semibold rounded-pill ${activeTab === 'interview' ? 'btn-emerald' : 'btn-dark-subtle'}`}
          onClick={() => { setActiveTab('interview'); setResult(null); }}
        >
          <FaUserTie className="me-2" /> Interview Sim
        </button>
        <button 
          className={`btn btn-sm px-3 py-2 fw-semibold rounded-pill ${activeTab === 'knowledge' ? 'btn-emerald' : 'btn-dark-subtle'}`}
          onClick={() => { setActiveTab('knowledge'); setResult(null); }}
        >
          <FaQuestionCircle className="me-2" /> Knowledge Base
        </button>
        <button 
          className={`btn btn-sm px-3 py-2 fw-semibold rounded-pill ${activeTab === 'planner' ? 'btn-emerald' : 'btn-dark-subtle'}`}
          onClick={() => { setActiveTab('planner'); setResult(null); }}
        >
          <FaMagic className="me-2" /> Agentic Planner
        </button>
      </div>

      <div className="row g-4">
        {/* Input Form Column */}
        <div className="col-lg-5">
          <AstraCard title="Configure Request">
            {activeTab === 'roadmap' && (
              <form onSubmit={handleGenerateRoadmap}>
                <div className="mb-3">
                  <label className="astra-form-label">Target Role</label>
                  <input type="text" className="astra-form-input" placeholder="e.g. Full Stack MERN Developer" 
                    value={roadmapForm.role} onChange={e => setRoadmapForm({...roadmapForm, role: e.target.value})} required />
                </div>
                <div className="mb-3">
                  <label className="astra-form-label">Current Skill Level</label>
                  <select className="astra-form-input" value={roadmapForm.skillLevel} onChange={e => setRoadmapForm({...roadmapForm, skillLevel: e.target.value})}>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="astra-form-label">Timeline (Months)</label>
                  <input type="number" className="astra-form-input" min="1" max="24"
                    value={roadmapForm.timeline} onChange={e => setRoadmapForm({...roadmapForm, timeline: e.target.value})} required />
                </div>
                <button type="submit" className="astra-btn-primary" disabled={loading}>
                  {loading ? <FaSpinner className="spin me-2" /> : 'Generate JSON Roadmap'}
                </button>
              </form>
            )}

            {activeTab === 'interview' && (
              <form onSubmit={handleSimulateInterview}>
                <div className="mb-3">
                  <label className="astra-form-label">Job Role</label>
                  <input type="text" className="astra-form-input" placeholder="e.g. Backend Engineer" 
                    value={interviewForm.role} onChange={e => setInterviewForm({...interviewForm, role: e.target.value})} required />
                </div>
                <div className="mb-3">
                  <label className="astra-form-label">Years of Experience</label>
                  <input type="number" className="astra-form-input" min="0" max="20"
                    value={interviewForm.experience} onChange={e => setInterviewForm({...interviewForm, experience: e.target.value})} required />
                </div>
                <div className="mb-4">
                  <label className="astra-form-label">Key Skills</label>
                  <input type="text" className="astra-form-input" placeholder="e.g. Node.js, MongoDB, Docker"
                    value={interviewForm.skills} onChange={e => setInterviewForm({...interviewForm, skills: e.target.value})} required />
                </div>
                <button type="submit" className="astra-btn-primary" disabled={loading}>
                  {loading ? <FaSpinner className="spin me-2" /> : 'Generate Structured JSON'}
                </button>
              </form>
            )}

            {activeTab === 'knowledge' && (
              <form onSubmit={handleAskKnowledge}>
                <div className="mb-4">
                  <label className="astra-form-label">Ask a Question (RAG)</label>
                  <input type="text" className="astra-form-input" placeholder="e.g. How to crack DSA interviews?" 
                    value={knowledgeForm.question} onChange={e => setKnowledgeForm({...knowledgeForm, question: e.target.value})} required />
                </div>
                <button type="submit" className="astra-btn-primary" disabled={loading}>
                  {loading ? <FaSpinner className="spin me-2" /> : 'Ask Knowledge Base'}
                </button>
              </form>
            )}

            {activeTab === 'planner' && (
              <form onSubmit={handleAgenticPlanner}>
                <div className="mb-4">
                  <label className="astra-form-label">What is your career goal?</label>
                  <textarea className="astra-form-input" rows={4} placeholder="e.g. I want to become a MERN Developer in 6 months." 
                    value={plannerForm.prompt} onChange={e => setPlannerForm({...plannerForm, prompt: e.target.value})} required />
                </div>
                <button type="submit" className="astra-btn-primary" disabled={loading}>
                  {loading ? <FaSpinner className="spin me-2" /> : 'Execute Agentic Plan'}
                </button>
              </form>
            )}
          </AstraCard>
        </div>

        {/* Results Column */}
        <div className="col-lg-7">
          <AstraCard title="Output" bodyClass="d-flex flex-column">
            {!result && !loading && <div className="text-muted text-center py-5">Submit the form to generate AI recommendations here.</div>}
            {loading && <div className="text-center py-5"><FaSpinner className="spin fs-2" style={{ color: '#10b981' }} /></div>}
            
            {result?.type === 'roadmap' && (
              <div className="fade-up">
                <h5 className="mb-4" style={{ color: '#34d399' }}>{result.data.role} ({result.data.timeline} months)</h5>
                <div>
                  {result.data.roadmap?.map((r: any, idx: number) => (
                    <div key={idx} className="mb-3 p-3 rounded-3" style={{ background: 'rgba(11, 15, 25, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <h6 style={{ color: '#f59e0b', fontWeight: 700 }}>{r.month} - {r.focus}</h6>
                      <ul className="mb-0 text-secondary small ps-3">
                        {r.tasks?.map((t: string, i: number) => <li key={i}>{t}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result?.type === 'interview' && (
              <div className="fade-up">
                <div className="d-flex justify-content-between mb-3 text-secondary small flex-wrap gap-2">
                  <span><strong>Role:</strong> {result.data.role}</span>
                  <span><strong>Difficulty:</strong> {result.data.difficulty}</span>
                  <span><strong>Time Limit:</strong> {result.data.timeLimit}</span>
                </div>
                <div>
                  {result.data.questions?.map((q: any, idx: number) => (
                    <div key={idx} className="mb-3 p-3 rounded-3" style={{ background: 'rgba(11, 15, 25, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div className="fw-bold mb-2" style={{ color: '#f8fafc' }}>Q{idx + 1}: {q.question}</div>
                      <div className="text-muted small">💡 Hint: {q.hint}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result?.type === 'knowledge' && (
              <div className="fade-up p-4 rounded-3" style={{ background: 'rgba(11, 15, 25, 0.6)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                <h5 style={{ color: '#34d399', marginBottom: '1rem' }}>RAG Answer:</h5>
                <p className="text-primary mb-0">{result.data.answer}</p>
                {result.data.source && (
                  <div className="text-muted small mt-3">Source: {result.data.source}</div>
                )}
              </div>
            )}

            {result?.type === 'planner' && (
              <div className="fade-up">
                <h5 className="mb-4" style={{ color: '#34d399' }}>Goal: {result.data.goal}</h5>
                
                <div className="mb-3 p-3 rounded-3" style={{ background: 'rgba(11, 15, 25, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <h6 style={{ color: '#f59e0b', fontWeight: 700 }}>Learning Plan</h6>
                  <ul className="text-secondary small mb-0 ps-3">
                    {result.data.learningPlan?.map((l: string, i: number) => <li key={i}>{l}</li>)}
                  </ul>
                </div>

                <div className="mb-3 p-3 rounded-3" style={{ background: 'rgba(11, 15, 25, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <h6 style={{ color: '#06b6d4', fontWeight: 700 }}>Recommended Projects</h6>
                  <ul className="text-secondary small mb-0 ps-3">
                    {result.data.projects?.map((p: string, i: number) => <li key={i}>{p}</li>)}
                  </ul>
                </div>

                <div className="p-3 rounded-3" style={{ background: 'rgba(11, 15, 25, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <h6 style={{ color: '#34d399', fontWeight: 700 }}>Interview Prep</h6>
                  <ul className="text-secondary small mb-0 ps-3">
                    {result.data.interviewPrep?.map((p: string, i: number) => <li key={i}>{p}</li>)}
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
