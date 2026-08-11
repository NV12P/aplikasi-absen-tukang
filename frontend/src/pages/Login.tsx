import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, Building2, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useNotification();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        login(data.data.token, data.data.user);
        toast.success(`Selamat datang kembali, ${data.data.user.name || 'Admin'}!`);
        navigate('/');
      } else {
        const msg = data.message || 'Login gagal. Periksa email dan password.';
        setErrorMsg(msg);
        toast.error(msg);
      }
    } catch (error) {
      console.error('Login error:', error);
      const msg = 'Gagal terhubung ke server';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Visual Header / Branding Area */}
      <div className="login-branding">
        <div className="login-branding-pattern" />
        <div className="login-branding-content">
          <div className="login-logo-badge">
            <Building2 size={32} />
          </div>
          <h1>CV Fortuna Aeterna</h1>
          <p className="login-subtitle">Enterprise Construction Management</p>

          <div className="login-branding-badges">
            <span className="badge-item">
              <ShieldCheck size={15} /> Presensi GPS Proyek
            </span>
            <span className="badge-item">
              <Building2 size={15} /> Kelola Pekerja & Tukang
            </span>
          </div>
        </div>
      </div>

      {/* Form Area */}
      <div className="login-form-wrapper">
        <div className="card login-card">
          <div className="login-card-header">
            <div className="mobile-brand-header">
              <div className="mobile-brand-logo">
                <Building2 size={24} />
              </div>
              <div className="mobile-brand-title">
                <h2>CV Fortuna Aeterna</h2>
                <p>Enterprise Construction Management</p>
              </div>
            </div>

            <div className="login-welcome-text">
              <h2>Login Portal Admin</h2>
              <p>Masuk untuk mengelola presensi tukang dan proyek aktif.</p>
            </div>
          </div>

          {errorMsg && (
            <div className="login-error-banner" role="alert">
              <span className="error-dot" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="login-email">Email Administrator</label>
              <div className="input-group">
                <Mail className="input-icon" size={18} />
                <input
                  id="login-email"
                  type="email"
                  required
                  autoComplete="email"
                  className="input-field"
                  placeholder="admin@absen.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="label-with-action">
                <label htmlFor="login-password">Password</label>
              </div>
              <div className="input-group password-group">
                <Lock className="input-icon" size={18} />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-options">
              <label className="remember-checkbox">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="checkmark" />
                <span className="remember-text">Ingat saya di perangkat ini</span>
              </label>
            </div>

            <button
              type="submit"
              className="btn-primary login-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="spinner-icon" size={18} />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span>Login Sistem</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            <div className="login-footer-hint">
              <span>Pertanyaan atau bantuan akses?</span>
              <a href="mailto:support@fortuna.co.id" className="support-link">Hubungi IT Support</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;

