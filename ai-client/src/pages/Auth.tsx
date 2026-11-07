import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { FaUserShield, FaEye, FaEyeSlash, FaSpinner, FaBolt } from 'react-icons/fa';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isGuestLoading) return;
    setError('');
    setIsSubmitting(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin
        ? { email: email.trim(), password }
        : { name: name.trim(), email: email.trim(), password };
      const res = await api.post(endpoint, payload);
      dispatch(setCredentials(res.data));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestLogin = async () => {
    if (isSubmitting || isGuestLoading) return;
    setError('');
    setIsGuestLoading(true);
    try {
      const res = await api.post('/api/auth/guest');
      dispatch(setCredentials(res.data));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Guest login failed. Please try again.');
    } finally {
      setIsGuestLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
  };

  return (
    <div className="astra-auth-wrap fade-up">
      <div className="astra-auth-card">
        <div className="astra-auth-logo">
          <div className="astra-auth-logo-icon" aria-hidden="true">
            <FaUserShield />
          </div>
          <h1 className="astra-auth-title">{isLogin ? 'Welcome Back' : 'Create Employee Account'}</h1>
          <p className="astra-auth-subtitle">
            {isLogin
              ? 'Sign in to access your Astra HR dashboard and AI workspace'
              : 'Register a new employee profile with full leave quotas'}
          </p>
        </div>

        {error && (
          <div className="astra-alert-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="astra-form-group">
              <label htmlFor="auth-name" className="astra-form-label">Full Name</label>
              <input
                id="auth-name"
                type="text"
                className="astra-form-input"
                placeholder="e.g. Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
          )}
          <div className="astra-form-group">
            <label htmlFor="auth-email" className="astra-form-label">Company Email</label>
            <input
              id="auth-email"
              type="email"
              className="astra-form-input"
              placeholder="jane@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="astra-form-group mb-4">
            <label htmlFor="auth-password" className="astra-form-label">Password</label>
            <div className="position-relative">
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                className="astra-form-input pe-5"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={4}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="astra-password-toggle"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="astra-btn-primary"
            disabled={isSubmitting || isGuestLoading}
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="spin me-2" />
                {isLogin ? 'Signing In...' : 'Creating Account...'}
              </>
            ) : isLogin ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="astra-divider">OR INSTANT DEMO</div>

        <button
          type="button"
          className="astra-btn-ghost d-flex align-items-center justify-content-center gap-2"
          onClick={handleGuestLogin}
          disabled={isSubmitting || isGuestLoading}
        >
          {isGuestLoading ? (
            <>
              <FaSpinner className="spin" /> Provisioning Guest Workspace...
            </>
          ) : (
            <>
              <FaBolt style={{ color: '#10b981' }} /> Continue as Guest Employee
            </>
          )}
        </button>

        <div className="astra-auth-switch">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button type="button" onClick={toggleMode}>
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
