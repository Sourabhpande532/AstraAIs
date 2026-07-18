import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import type { RootState } from '../store/store';
import { FaUserShield, FaBars } from 'react-icons/fa';
import { useState } from 'react';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth');
  };

  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

  return (
    <nav className="astra-navbar navbar navbar-expand-lg">
      <div className="container">
        <Link className="navbar-brand text-decoration-none" to="/">
          <span className="brand-text">ASTRA_HR</span>
        </Link>
        
        {user && (
          <button 
            className="navbar-toggler custom-toggler border-0" 
            type="button" 
            onClick={handleNavCollapse}
          >
            <FaBars className="text-light" />
          </button>
        )}

        <div className={`${isNavCollapsed ? 'collapse' : ''} navbar-collapse justify-content-end`} id="navbarNav">
          {user && (
            <div className="d-flex flex-column flex-lg-row align-items-lg-center gap-3 mt-3 mt-lg-0 pb-2 pb-lg-0">
              <Link 
                className="text-light text-decoration-none fw-bold nav-link-custom" 
                to="/dashboard"
                onClick={() => setIsNavCollapsed(true)}
              >
                Dashboard
              </Link>
              <Link 
                className="text-light text-decoration-none fw-bold nav-link-custom" 
                to="/career"
                onClick={() => setIsNavCollapsed(true)}
              >
                Career AI
              </Link>
              <span className="astra-welcome mb-2 mb-lg-0">Welcome, {user.name}</span>
              <button className="astra-logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
