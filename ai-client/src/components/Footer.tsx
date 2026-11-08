import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store/store';
import { logout } from '../store/authSlice';
import {
  FaTerminal,
  FaGraduationCap,
  FaUserTie,
  FaQuestionCircle,
  FaMagic,
  FaArrowUp,
  FaBolt,
} from 'react-icons/fa';

const Footer = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenTerminal = (prompt?: string) => {
    if (!user) {
      navigate('/auth');
      scrollToTop();
      return;
    }
    window.dispatchEvent(
      new CustomEvent('astra:open-terminal', {
        detail: { prompt, autoSend: Boolean(prompt) },
      })
    );
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth');
    scrollToTop();
  };

  return (
    <footer className="astra-footer" aria-label="Site footer">
      <div className="container astra-footer-container">
        <div className="astra-footer-grid">
          {/* Column 1: Brand & System Status */}
          <div className="astra-footer-brand-col">
            <Link
              to="/"
              className="astra-footer-brand text-decoration-none"
              onClick={scrollToTop}
            >
              <div className="astra-brand-emblem" aria-hidden="true">A</div>
              <span>ASTRA HR</span>
            </Link>
            <p className="astra-footer-desc">
              Human-centered AI HR assistant, automated leave &amp; meeting management, grounded policy RAG, and career intelligence in one unified workspace.
            </p>
            <div className="astra-footer-status">
              <span className="astra-footer-status-dot" aria-hidden="true" />
              <span>SSE Agent &amp; RAG Systems Online</span>
            </div>
          </div>

          {/* Column 2: Workspace Navigation */}
          <div className="astra-footer-col">
            <h3 className="astra-footer-heading">Workspace</h3>
            <ul className="astra-footer-links">
              <li>
                <Link to="/" className="astra-footer-link" onClick={scrollToTop}>
                  Home Overview
                </Link>
              </li>
              <li>
                <Link
                  to={user ? '/dashboard' : '/auth'}
                  className="astra-footer-link"
                  onClick={scrollToTop}
                >
                  HR Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to={user ? '/career' : '/auth'}
                  className="astra-footer-link"
                  onClick={scrollToTop}
                >
                  Career AI Suite
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  className="astra-footer-link-btn"
                  onClick={() => handleOpenTerminal()}
                >
                  <FaTerminal size={11} className="me-1 text-emerald" />
                  Launch AI Terminal
                </button>
              </li>
              <li>
                {user ? (
                  <button
                    type="button"
                    className="astra-footer-link-btn text-danger-emphasis"
                    onClick={handleLogout}
                  >
                    Sign Out ({user.name.split(' ')[0]})
                  </button>
                ) : (
                  <Link to="/auth" className="astra-footer-link" onClick={scrollToTop}>
                    Sign In / Register
                  </Link>
                )}
              </li>
            </ul>
          </div>

          {/* Column 3: Career AI Tools */}
          <div className="astra-footer-col">
            <h3 className="astra-footer-heading">Career AI Tools</h3>
            <ul className="astra-footer-links">
              <li>
                <Link
                  to={user ? '/career?tab=roadmap' : '/auth'}
                  className="astra-footer-link"
                  onClick={scrollToTop}
                >
                  <FaGraduationCap size={12} className="me-1 text-emerald" />
                  Roadmap Generator
                </Link>
              </li>
              <li>
                <Link
                  to={user ? '/career?tab=interview' : '/auth'}
                  className="astra-footer-link"
                  onClick={scrollToTop}
                >
                  <FaUserTie size={12} className="me-1 text-emerald" />
                  Interview Simulator
                </Link>
              </li>
              <li>
                <Link
                  to={user ? '/career?tab=knowledge' : '/auth'}
                  className="astra-footer-link"
                  onClick={scrollToTop}
                >
                  <FaQuestionCircle size={12} className="me-1 text-emerald" />
                  Knowledge Base (RAG)
                </Link>
              </li>
              <li>
                <Link
                  to={user ? '/career?tab=planner' : '/auth'}
                  className="astra-footer-link"
                  onClick={scrollToTop}
                >
                  <FaMagic size={12} className="me-1 text-emerald" />
                  Agentic Planner
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Quick Agent Actions */}
          <div className="astra-footer-col">
            <h3 className="astra-footer-heading">Quick AI Actions</h3>
            <ul className="astra-footer-links">
              <li>
                <button
                  type="button"
                  className="astra-footer-link-btn"
                  onClick={() => handleOpenTerminal('Check my leave balance')}
                >
                  <FaBolt size={10} className="me-1 text-emerald" />
                  Check Leave Balance
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="astra-footer-link-btn"
                  onClick={() => handleOpenTerminal('Apply for 1 day sick leave, I have a fever')}
                >
                  <FaBolt size={10} className="me-1 text-emerald" />
                  Apply 1 Day Sick Leave
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="astra-footer-link-btn"
                  onClick={() => handleOpenTerminal('Schedule a team sync for tomorrow at 3pm')}
                >
                  <FaBolt size={10} className="me-1 text-emerald" />
                  Schedule Team Sync
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="astra-footer-link-btn"
                  onClick={() => handleOpenTerminal('What is the maternity leave policy?')}
                >
                  <FaBolt size={10} className="me-1 text-emerald" />
                  Maternity Leave Policy
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="astra-footer-bottom">
          <div className="astra-footer-copy">
            &copy; {new Date().getFullYear()} <strong>Astra HR</strong>. Powered by React, Node.js &amp; OpenAI.
          </div>
          <div className="astra-footer-bottom-links">
            <Link to="/" className="astra-footer-bottom-link" onClick={scrollToTop}>
              Home
            </Link>
            <Link
              to={user ? '/dashboard' : '/auth'}
              className="astra-footer-bottom-link"
              onClick={scrollToTop}
            >
              Dashboard
            </Link>
            <Link
              to={user ? '/career' : '/auth'}
              className="astra-footer-bottom-link"
              onClick={scrollToTop}
            >
              Career AI
            </Link>
            <button
              type="button"
              className="astra-footer-top-btn"
              onClick={scrollToTop}
              aria-label="Scroll back to top"
            >
              <span>Top</span>
              <FaArrowUp size={10} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
