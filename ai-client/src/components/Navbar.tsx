import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import type { RootState } from '../store/store';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useState } from 'react';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);

  const handleLogout = () => {
    setIsNavCollapsed(true);
    dispatch(logout());
    navigate('/auth');
  };

  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

  return (
    <nav className="astra-navbar navbar navbar-expand-lg" aria-label="Main navigation">
      <div className="container astra-nav-container">
        <Link
          className="navbar-brand text-decoration-none"
          to="/"
          onClick={() => setIsNavCollapsed(true)}
        >
          <div className="astra-brand-emblem" aria-hidden="true">A</div>
          <span>ASTRA HR</span>
        </Link>

        <button
          className="navbar-toggler custom-toggler border-0"
          type="button"
          onClick={handleNavCollapse}
          aria-controls="navbarNav"
          aria-expanded={!isNavCollapsed}
          aria-label="Toggle navigation"
        >
          {isNavCollapsed ? <FaBars className="text-light" /> : <FaTimes className="text-light" />}
        </button>

        <div className={`${isNavCollapsed ? 'collapse' : ''} navbar-collapse justify-content-end`} id="navbarNav">
          {user ? (
            <div className="astra-nav-menu">
              <Link
                className={`text-decoration-none nav-link-custom ${location.pathname === '/dashboard' ? 'active' : ''}`}
                to="/dashboard"
                onClick={() => setIsNavCollapsed(true)}
              >
                Dashboard
              </Link>
              <Link
                className={`text-decoration-none nav-link-custom ${location.pathname === '/career' ? 'active' : ''}`}
                to="/career"
                onClick={() => setIsNavCollapsed(true)}
              >
                Career AI
              </Link>
              <span className="astra-nav-divider d-none d-lg-inline-block" aria-hidden="true" />
              <span className="astra-welcome">Welcome, {user.name}</span>
              <button type="button" className="astra-logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="astra-nav-menu">
              <Link
                className={`text-decoration-none nav-link-custom ${location.pathname === '/' ? 'active' : ''}`}
                to="/"
                onClick={() => setIsNavCollapsed(true)}
              >
                Home
              </Link>
              {location.pathname !== '/auth' && (
                <Link
                  className="astra-nav-cta text-decoration-none"
                  to="/auth"
                  onClick={() => setIsNavCollapsed(true)}
                >
                  Sign In
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
