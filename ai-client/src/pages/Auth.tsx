import { useState, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';
import {
  FaUserShield,
  FaEye,
  FaEyeSlash,
  FaSpinner,
  FaBolt,
  FaExclamationCircle,
  FaCheckCircle,
} from 'react-icons/fa';

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
}

interface TouchedFields {
  name?: boolean;
  email?: boolean;
  password?: boolean;
}

const validateNameField = (value: string, isLoginMode: boolean): string => {
  if (isLoginMode) return '';
  const trimmed = value.trim();
  if (!trimmed) return 'Full name is required.';
  if (trimmed.length < 2) return 'Full name must be at least 2 characters.';
  if (trimmed.length > 60) return 'Full name cannot exceed 60 characters.';
  if (!/^[a-zA-Z][a-zA-Z\s.'-]*$/.test(trimmed)) {
    return 'Full name can only contain letters and spaces.';
  }
  return '';
};

const validateEmailField = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return 'Company email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(trimmed)) {
    return 'Please enter a valid email address (e.g. jane@company.com).';
  }
  return '';
};

const validatePasswordField = (value: string, isLoginMode: boolean): string => {
  if (!value) return 'Password is required.';
  if (isLoginMode) {
    if (value.length < 4) return 'Password must be at least 4 characters.';
    return '';
  }
  if (value.length < 6) return 'Password must be at least 6 characters long.';
  if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
    return 'Password must include at least one letter and one number.';
  }
  return '';
};

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const passwordStrength = useMemo(() => {
    if (isLogin || !password) return { score: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Za-z]/.test(password) && /[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password) || (/[a-z]/.test(password) && /[A-Z]/.test(password))) {
      score += 1;
    }
    const levels = [
      { label: 'Too short', color: '#f43f5e' },
      { label: 'Weak', color: '#f43f5e' },
      { label: 'Fair', color: '#f59e0b' },
      { label: 'Good', color: '#38bdf8' },
      { label: 'Strong', color: '#10b981' },
    ];
    return { score, ...levels[score] };
  }, [isLogin, password]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (error) setError('');
    if (touched.name) {
      setFieldErrors((prev) => ({ ...prev, name: validateNameField(val, isLogin) }));
    }
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (error) setError('');
    if (touched.email) {
      setFieldErrors((prev) => ({ ...prev, email: validateEmailField(val) }));
    }
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (error) setError('');
    if (touched.password) {
      setFieldErrors((prev) => ({ ...prev, password: validatePasswordField(val, isLogin) }));
    }
  };

  const handleBlur = (field: keyof TouchedFields) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === 'name') {
      setFieldErrors((prev) => ({ ...prev, name: validateNameField(name, isLogin) }));
    } else if (field === 'email') {
      setFieldErrors((prev) => ({ ...prev, email: validateEmailField(email) }));
    } else if (field === 'password') {
      setFieldErrors((prev) => ({ ...prev, password: validatePasswordField(password, isLogin) }));
    }
  };

  const validateAll = (): boolean => {
    const nameErr = validateNameField(name, isLogin);
    const emailErr = validateEmailField(email);
    const passwordErr = validatePasswordField(password, isLogin);

    setTouched({ name: true, email: true, password: true });
    setFieldErrors({
      name: nameErr || undefined,
      email: emailErr || undefined,
      password: passwordErr || undefined,
    });

    return !nameErr && !emailErr && !passwordErr;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isGuestLoading) return;
    setError('');

    if (!validateAll()) {
      return;
    }

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
      setError(
        err.response?.data?.message ||
          'Authentication failed. Please check your credentials and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestLogin = async () => {
    if (isSubmitting || isGuestLoading) return;
    setError('');
    setFieldErrors({});
    setTouched({});
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
    setFieldErrors({});
    setTouched({});
  };

  return (
    <div className="astra-auth-wrap fade-up">
      <div className="astra-auth-card">
        <div className="astra-auth-logo">
          <div className="astra-auth-logo-icon" aria-hidden="true">
            <FaUserShield />
          </div>
          <h1 className="astra-auth-title">
            {isLogin ? 'Welcome Back' : 'Create Employee Account'}
          </h1>
          <p className="astra-auth-subtitle">
            {isLogin
              ? 'Sign in to access your Astra HR dashboard and AI workspace'
              : 'Register a new employee profile with full leave quotas'}
          </p>
        </div>

        {error && (
          <div className="astra-alert-error d-flex align-items-center gap-2" role="alert">
            <FaExclamationCircle className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {!isLogin && (
            <div className="astra-form-group">
              <div className="d-flex justify-content-between align-items-center">
                <label htmlFor="auth-name" className="astra-form-label">
                  Full Name
                </label>
                {touched.name && !fieldErrors.name && name.trim() && (
                  <FaCheckCircle size={12} className="text-emerald mb-1" />
                )}
              </div>
              <input
                id="auth-name"
                type="text"
                className={`astra-form-input ${
                  touched.name && fieldErrors.name
                    ? 'astra-input-invalid'
                    : touched.name && name.trim()
                    ? 'astra-input-valid'
                    : ''
                }`}
                placeholder="e.g. Jane Doe"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                onBlur={() => handleBlur('name')}
                aria-invalid={Boolean(touched.name && fieldErrors.name)}
                aria-describedby={fieldErrors.name ? 'auth-name-error' : undefined}
                autoComplete="name"
              />
              {touched.name && fieldErrors.name && (
                <div id="auth-name-error" className="astra-field-error" role="alert">
                  <FaExclamationCircle size={11} className="flex-shrink-0" />
                  <span>{fieldErrors.name}</span>
                </div>
              )}
            </div>
          )}

          <div className="astra-form-group">
            <div className="d-flex justify-content-between align-items-center">
              <label htmlFor="auth-email" className="astra-form-label">
                Company Email
              </label>
              {touched.email && !fieldErrors.email && email.trim() && (
                <FaCheckCircle size={12} className="text-emerald mb-1" />
              )}
            </div>
            <input
              id="auth-email"
              type="email"
              className={`astra-form-input ${
                touched.email && fieldErrors.email
                  ? 'astra-input-invalid'
                  : touched.email && email.trim()
                  ? 'astra-input-valid'
                  : ''
              }`}
              placeholder="jane@company.com"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              onBlur={() => handleBlur('email')}
              aria-invalid={Boolean(touched.email && fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'auth-email-error' : undefined}
              autoComplete="email"
            />
            {touched.email && fieldErrors.email && (
              <div id="auth-email-error" className="astra-field-error" role="alert">
                <FaExclamationCircle size={11} className="flex-shrink-0" />
                <span>{fieldErrors.email}</span>
              </div>
            )}
          </div>

          <div className="astra-form-group mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <label htmlFor="auth-password" className="astra-form-label">
                Password
              </label>
              {touched.password && !fieldErrors.password && password && (
                <FaCheckCircle size={12} className="text-emerald mb-1" />
              )}
            </div>
            <div className="position-relative">
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                className={`astra-form-input pe-5 ${
                  touched.password && fieldErrors.password
                    ? 'astra-input-invalid'
                    : touched.password && password
                    ? 'astra-input-valid'
                    : ''
                }`}
                placeholder={isLogin ? '••••••••' : 'Min 6 chars (letters & numbers)'}
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                onBlur={() => handleBlur('password')}
                aria-invalid={Boolean(touched.password && fieldErrors.password)}
                aria-describedby={fieldErrors.password ? 'auth-password-error' : undefined}
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

            {touched.password && fieldErrors.password && (
              <div id="auth-password-error" className="astra-field-error" role="alert">
                <FaExclamationCircle size={11} className="flex-shrink-0" />
                <span>{fieldErrors.password}</span>
              </div>
            )}

            {!isLogin && password.length > 0 && (
              <div className="astra-password-strength mt-2">
                <div className="astra-strength-bars">
                  {[1, 2, 3, 4].map((bar) => (
                    <span
                      key={bar}
                      className="astra-strength-bar"
                      style={{
                        background:
                          passwordStrength.score >= bar
                            ? passwordStrength.color
                            : 'rgba(255, 255, 255, 0.1)',
                      }}
                    />
                  ))}
                </div>
                <div className="d-flex justify-content-between align-items-center mt-1">
                  <span className="astra-strength-hint">Use 6+ characters with letters &amp; numbers</span>
                  <span
                    className="astra-strength-label"
                    style={{ color: passwordStrength.color }}
                  >
                    {passwordStrength.label}
                  </span>
                </div>
              </div>
            )}
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
