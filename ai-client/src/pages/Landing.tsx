import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import {FaGraduationCap, FaUserTie, FaQuestionCircle, FaArrowRight, FaMagic } from 'react-icons/fa';
import './Landing.css';

const Landing = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="landing-container">
      {/* Background Shapes for Animation */}
      <div className="landing-bg-shape shape-1"></div>
      <div className="landing-bg-shape shape-2"></div>
      <div className="landing-bg-shape shape-3"></div>

      <div className="landing-hero">
        <h1 className="landing-title">
          Meet Your <span className="landing-title-highlight">AI-Powered</span> HR Assistant
        </h1>
        <p className="landing-subtitle">
          Supercharge your career with Astra HR. From intelligent roadmap generation and AI interview simulations to agentic planning and an advanced knowledge base.
        </p>
        
        <div className="landing-cta-group">
          {user ? (
            <Link to="/dashboard" className="btn-landing-primary">
              Go to Dashboard <FaArrowRight />
            </Link>
          ) : (
            <Link to="/auth" className="btn-landing-primary">
              Get Started <FaArrowRight />
            </Link>
          )}
          <a href="#features" className="btn-landing-secondary">
            Explore Features
          </a>
        </div>
      </div>

      <div id="features" className="landing-features">
        <div className="landing-feature-card">
          <div className="feature-icon-wrapper">
            <FaGraduationCap />
          </div>
          <h3 className="feature-title">Roadmap Generation</h3>
          <p className="feature-desc">
            Instantly generate personalized learning and career roadmaps tailored to your target role, skill level, and timeline using AI.
          </p>
        </div>

        <div className="landing-feature-card">
          <div className="feature-icon-wrapper">
            <FaUserTie />
          </div>
          <h3 className="feature-title">Interview Simulator</h3>
          <p className="feature-desc">
            Practice for your next big role with dynamic AI-driven interview questions, complete with hints and tailored difficulty levels.
          </p>
        </div>

        <div className="landing-feature-card">
          <div className="feature-icon-wrapper">
            <FaMagic />
          </div>
          <h3 className="feature-title">Agentic Planner</h3>
          <p className="feature-desc">
            Just state your career goal. Our agentic planner breaks it down into learning plans, project recommendations, and interview prep.
          </p>
        </div>
        
        <div className="landing-feature-card">
          <div className="feature-icon-wrapper">
            <FaQuestionCircle />
          </div>
          <h3 className="feature-title">HR Knowledge Base</h3>
          <p className="feature-desc">
            Ask any HR or career-related question and get instant RAG-powered answers drawn from our extensive knowledge base.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
