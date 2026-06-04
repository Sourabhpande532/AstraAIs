import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store/store';
import { logout } from '../store/authSlice';
import { FaUserShield } from 'react-icons/fa';

const Navbar = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth');
  };

  return (
    <nav className="astra-navbar">
      <div className="container d-flex justify-content-between align-items-center">
        <Link className="navbar-brand text-decoration-none" to="/">
          <FaUserShield className="brand-icon" /> Astra HR
        </Link>
        {user && (
          <div className="d-flex align-items-center gap-3">
            <span className="astra-welcome">Welcome, {user.name}</span>
            <button className="astra-logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
