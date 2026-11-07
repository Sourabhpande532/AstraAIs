import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import {
  FaGraduationCap,
  FaUserTie,
  FaArrowRight,
  FaMagic,
  FaTerminal,
  FaUmbrellaBeach,
  FaCalendarCheck,
  FaBookOpen,
  FaCheckCircle,
} from 'react-icons/fa';
import './Landing.css';

const Landing = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="landing-container">
      {/* Ambient Background Accents */}
      <div className="landing-bg-shape shape-1" aria-hidden="true"></div>
      <div className="landing-bg-shape shape-2" aria-hidden="true"></div>
      <div className="landing-bg-shape shape-3" aria-hidden="true"></div>

      <div className="landing-hero">
        <div className="landing-badge">
          <span className="landing-badge-dot" aria-hidden="true"></span>
          <span>AGENTIC HR OPERATIONS & CAREER INTELLIGENCE</span>
        </div>

        <h1 className="landing-title">
          Meet Your <span className="landing-title-highlight">AI-Powered</span> HR &amp; Career Assistant
        </h1>

        <p className="landing-subtitle">
          Replace complex HR menus with natural language execution. Manage employee leave balances, book meetings via real-time Server-Sent Events, query company policies with grounded RAG, and accelerate career growth in one unified workspace.
        </p>

        <div className="landing-cta-group">
          {user ? (
            <>
              <Link to="/dashboard" className="btn-landing-primary">
                Go to Dashboard <FaArrowRight />
              </Link>
              <Link to="/career" className="btn-landing-secondary">
                Open Career AI Suite
              </Link>
            </>
          ) : (
            <>
              <Link to="/auth" className="btn-landing-primary">
                Get Started <FaArrowRight />
              </Link>
              <a href="#features" className="btn-landing-secondary">
                Explore Capabilities
              </a>
            </>
          )}
        </div>

        {/* Live Agentic Workflow Preview */}
        <div className="landing-preview-card">
          <div className="landing-preview-header">
            <div className="d-flex align-items-center gap-2">
              <span className="preview-dot dot-red"></span>
              <span className="preview-dot dot-amber"></span>
              <span className="preview-dot dot-green"></span>
              <span className="preview-header-title ms-2">ASTRA_HR_AGENT — Live SSE Execution Flow</span>
            </div>
            <span className="preview-status-pill">Tool Calling + RAG</span>
          </div>
          <div className="landing-preview-body">
            <div className="preview-line preview-user">
              &gt; &quot;Check my sick leave, apply for 1 day because I have a fever, and schedule a doctor sync tomorrow at 10 AM&quot;
            </div>
            <div className="preview-steps-grid">
              <div className="preview-step-box">
                <div className="preview-step-num">STEP 1 • READ TOOL</div>
                <div className="preview-step-fn">checkLeaveBalance()</div>
                <div className="preview-step-res">
                  <FaCheckCircle className="me-1" style={{ color: '#10b981' }} />
                  Sick: 10d | Casual: 12d | Earned: 15d
                </div>
              </div>
              <div className="preview-step-box">
                <div className="preview-step-num">STEP 2 • WRITE TOOL</div>
                <div className="preview-step-fn">applyForLeave(&#123; type: &quot;sick&quot;, days: 1 &#125;)</div>
                <div className="preview-step-res">
                  <FaCheckCircle className="me-1" style={{ color: '#10b981' }} />
                  Approved • Balance updated to 9 days
                </div>
              </div>
              <div className="preview-step-box">
                <div className="preview-step-num">STEP 3 • CALENDAR TOOL</div>
                <div className="preview-step-fn">scheduleMeeting(&#123; title: &quot;Doctor Sync&quot; &#125;)</div>
                <div className="preview-step-res">
                  <FaCheckCircle className="me-1" style={{ color: '#10b981' }} />
                  Synced to Redux &amp; Dashboard
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="features" className="landing-features">
        <div className="landing-feature-card">
          <div className="feature-icon-wrapper">
            <FaTerminal />
          </div>
          <h2 className="feature-title">Agentic AI HR Terminal</h2>
          <p className="feature-desc">
            A persistent, draggable terminal widget powered by Server-Sent Events (SSE) that decomposes multi-step natural language prompts into database tool calls.
          </p>
        </div>

        <div className="landing-feature-card">
          <div className="feature-icon-wrapper">
            <FaUmbrellaBeach />
          </div>
          <h2 className="feature-title">Automated Leave Management</h2>
          <p className="feature-desc">
            Track Sick, Casual, and Earned leave entitlements in real time. Validates available quota before approving requests and updates your dashboard instantaneously.
          </p>
        </div>

        <div className="landing-feature-card">
          <div className="feature-icon-wrapper">
            <FaCalendarCheck />
          </div>
          <h2 className="feature-title">Smart Meeting Scheduler</h2>
          <p className="feature-desc">
            Book 1:1 syncs, team standups, and appointments using plain English date expressions. Automatically syncs upcoming events with your operational calendar.
          </p>
        </div>

        <div className="landing-feature-card">
          <div className="feature-icon-wrapper">
            <FaBookOpen />
          </div>
          <h2 className="feature-title">HR Policy Knowledge Base (RAG)</h2>
          <p className="feature-desc">
            Ask questions about maternity leave, remote work rules, flexi-hours, or notice periods. Retrieval-Augmented Generation cites exact handbook sections without hallucination.
          </p>
        </div>

        <div className="landing-feature-card">
          <div className="feature-icon-wrapper">
            <FaGraduationCap />
          </div>
          <h2 className="feature-title">Roadmap Generation</h2>
          <p className="feature-desc">
            Generate structured, month-by-month learning curriculums tailored to your target engineering role, current skill level, and timeline.
          </p>
        </div>

        <div className="landing-feature-card">
          <div className="feature-icon-wrapper">
            <FaUserTie />
          </div>
          <h2 className="feature-title">Interview Simulator &amp; Planner</h2>
          <p className="feature-desc">
            Practice with role-specific technical questions, interviewer hints, and multi-track agentic career plans covering projects and DSA preparation.
          </p>
        </div>
      </div>

      {/* Bottom Callout */}
      <div className="landing-bottom-cta">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
          <div className="text-start">
            <h2 className="h5 fw-bold text-light mb-1">
              <FaMagic className="me-2" style={{ color: '#10b981' }} />
              Ready to experience agentic HR operations?
            </h2>
            <p className="text-secondary small mb-0">
              Jump straight in with one-click Guest Employee access—pre-loaded with 37 days of leave quota and full AI capabilities.
            </p>
          </div>
          <Link to={user ? '/dashboard' : '/auth'} className="btn-landing-primary flex-shrink-0">
            {user ? 'Open My Dashboard' : 'Launch Instant Demo'} <FaArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing;
