import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User as UserIcon, Shield } from 'lucide-react';
import './Login.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'member'
  });
  const [error, setError] = useState('');
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.name, formData.email, formData.password, formData.role);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel animate-fade-in">
        <div className="auth-header">
          <div className="logo-glow-large"></div>
          <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p>{isLogin ? 'Enter your details to access your dashboard.' : 'Sign up to manage your team tasks.'}</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="input-group">
              <label>Full Name</label>
              <div className="input-wrapper">
                <UserIcon size={18} className="input-icon" />
                <input 
                  type="text" name="name" 
                  className="input-field with-icon" 
                  placeholder="John Doe"
                  value={formData.name} onChange={handleChange} required 
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" name="email" 
                className="input-field with-icon" 
                placeholder="john@example.com"
                value={formData.email} onChange={handleChange} required 
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" name="password" 
                className="input-field with-icon" 
                placeholder="••••••••"
                value={formData.password} onChange={handleChange} required minLength="8"
              />
            </div>
          </div>

          {!isLogin && (
            <div className="input-group">
              <label>Role</label>
              <div className="input-wrapper">
                <Shield size={18} className="input-icon" />
                <select 
                  name="role" 
                  className="input-field with-icon"
                  value={formData.role} onChange={handleChange}
                >
                  <option value="member">Team Member</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary auth-submit">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-toggle">
          <span>{isLogin ? "Don't have an account?" : "Already have an account?"}</span>
          <button className="toggle-btn" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
