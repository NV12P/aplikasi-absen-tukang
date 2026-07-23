import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

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
        navigate('/');
      } else {
        setErrorMsg(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMsg('Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Kiri — Branding */}
      <div className="login-branding">
        <h1>CV Fortuna Aeterna</h1>
        <p>Enterprise Construction Management</p>
      </div>

      {/* Kanan — Form */}
      <div className="login-form-wrapper">
        <div className="card login-card">
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>Login Admin</h2>
            <p style={{ color: 'var(--text-muted)' }}>Silakan masuk untuk mengelola proyek dan pekerja.</p>
          </div>

          {errorMsg && (
            <div style={{
              padding: '12px',
              backgroundColor: 'var(--danger-bg)',
              color: 'var(--danger)',
              borderRadius: '6px',
              marginBottom: '20px',
              fontSize: '13px',
              fontWeight: 500
            }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                Email
              </label>
              <div className="input-group">
                <Mail className="input-icon" size={18} />
                <input
                  type="email"
                  required
                  className="input-field"
                  placeholder="admin@absen.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                Password
              </label>
              <div className="input-group">
                <Lock className="input-icon" size={18} />
                <input
                  type="password"
                  required
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ padding: '14px', justifyContent: 'center', fontSize: '16px', marginTop: '8px' }}
            >
              {loading ? 'Memproses...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
