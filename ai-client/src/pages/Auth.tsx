import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaUserShield } from 'react-icons/fa';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin ? { email, password } : { name, email, password };
      const res = await axios.post(endpoint, payload);
      dispatch(setCredentials(res.data));
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed');
    }
  };

  const handleGuestLogin = async () => {
    try {
      const res = await axios.post('/api/auth/guest');
      dispatch(setCredentials(res.data));
      navigate('/');
    } catch (err: any) {
      setError('Guest login failed');
    }
  };

  return (
    <div className="astra-auth-wrap fade-up">
      <div className="astra-auth-card">
        <div className="astra-auth-logo">
          <div className="astra-auth-logo-icon">
            <FaUserShield style={{ color: '#fff' }} />
          </div>
          <h2 className="astra-auth-title">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="astra-auth-subtitle">
            {isLogin ? 'Sign in to access your HR dashboard' : 'Register as a new employee'}
          </p>
        </div>

        {error && <div className="astra-alert-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="astra-form-group">
              <label className="astra-form-label">Full Name</label>
              <input type="text" className="astra-form-input" placeholder="e.g. Jane Doe" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          )}
          <div className="astra-form-group">
            <label className="astra-form-label">Company Email</label>
            <input type="email" className="astra-form-input" placeholder="jane@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="astra-form-group mb-4">
            <label className="astra-form-label">Password</label>
            <input type="password" className="astra-form-input" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          
          <button type="submit" className="astra-btn-primary">{isLogin ? 'Sign In' : 'Create Account'}</button>
        </form>
        
        <div className="astra-divider">OR</div>
        
        <button className="astra-btn-ghost" onClick={handleGuestLogin}>
          Continue as Guest
        </button>
        
        <div className="astra-auth-switch">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
