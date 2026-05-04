import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard, GlassButton, GlassInput } from '../../components/GlassUI';
import { apiRegister, apiRequestPasswordReset, apiResetPassword } from '../../api';

interface AuthViewProps {
  onLogin: (email: string, password: string) => void;
  isLoading: boolean;
}

function getPasswordStrength(pw: string): { width: string; label: string; color: string } {
  if (pw.length === 0) return { width: '0%', label: '', color: 'bg-slate-300' };
  if (pw.length < 4) return { width: '20%', label: 'Too Short', color: 'bg-red-500' };
  if (pw.length < 6) return { width: '40%', label: 'Weak', color: 'bg-orange-400' };
  const hasUpper = /[A-Z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);
  const score = [pw.length >= 8, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
  if (score <= 1) return { width: '50%', label: 'Fair', color: 'bg-yellow-400' };
  if (score === 2) return { width: '70%', label: 'Good', color: 'bg-lime-500' };
  return { width: '100%', label: 'Strong', color: 'bg-emerald-500' };
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin, isLoading }) => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot' | 'reset'>('signin');
  const [isCreating, setIsCreating] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'seeker' | 'employer'>('seeker');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState('');

  const handleCreateAccount = async () => {
    if (!email.trim() || !password.trim()) {
      alert('Email and password are required');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    try {
      setIsCreating(true);
      await apiRegister(email, password, role);
      alert('Account created. Please sign in.');
      setMode('signin');
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Failed to create account');
    } finally {
      setIsCreating(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      alert('Please enter your email address');
      return;
    }
    try {
      setIsSending(true);
      setMessage('');
      const res = await apiRequestPasswordReset(email);
      if (res.token) {
        setResetToken(res.token);
        setMessage('Reset token generated. Enter it below with your new password.');
        setMode('reset');
      } else {
        setMessage(res.message || 'Check your email for reset instructions.');
      }
    } catch (e: any) {
      alert(e.message || 'Failed to request reset');
    } finally {
      setIsSending(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetToken.trim() || !newPassword.trim()) {
      alert('Token and new password are required');
      return;
    }
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    try {
      setIsSending(true);
      await apiResetPassword(resetToken, newPassword);
      alert('Password reset successfully. Please sign in.');
      setMode('signin');
      setResetToken('');
      setNewPassword('');
      setMessage('');
    } catch (e: any) {
      alert(e.message || 'Failed to reset password');
    } finally {
      setIsSending(false);
    }
  };

  const strength = getPasswordStrength(mode === 'reset' ? newPassword : password);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-[#F8FAFC] relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/30 blur-[120px] rounded-full" />

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <GlassCard className="w-full max-w-[480px] mx-4 p-8 md:p-12 flex flex-col gap-8" elevation="high">
            {/* Sign In / Sign Up */}
            {(mode === 'signin' || mode === 'signup') && (
              <>
                <div className="flex flex-col gap-3">
                  <h1 className="text-[28px] md:text-[36px] font-[300] tracking-tight text-slate-900">
                    {mode === 'signin' ? 'Welcome back' : 'Create Account'}
                  </h1>
                  <p className="text-[14px] md:text-[16px] font-normal text-slate-500">
                    {mode === 'signin'
                      ? 'Enter your credentials to access CVFlow'
                      : 'Join CVFlow to start your journey'}
                  </p>
                </div>

                <div className="flex flex-col gap-6">
                  <GlassInput
                    label="Email Address"
                    placeholder="alex@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  {mode === 'signup' && (
                    <div className="flex flex-col gap-2">
                      <label className="text-[14px] text-slate-600 font-medium tracking-wide">Role</label>
                      <select
                        className="h-[48px] px-5 rounded-[10px] bg-white/10 border border-[#E2E8F0] focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none transition-all duration-200 text-[16px] font-normal"
                        value={role}
                        onChange={(e) => setRole(e.target.value as 'seeker' | 'employer')}
                      >
                        <option value="seeker">Job Seeker</option>
                        <option value="employer">Employer</option>
                      </select>
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    <GlassInput
                      label="Password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    {password.length > 0 && (
                      <>
                        <div className="h-[6px] w-full bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: strength.width }}
                            className={`h-full ${strength.color}`}
                          />
                        </div>
                        <span className={`text-[12px] font-semibold uppercase tracking-wider ${
                          strength.color.includes('emerald') ? 'text-emerald-600' :
                          strength.color.includes('lime') ? 'text-lime-600' :
                          strength.color.includes('yellow') ? 'text-yellow-600' :
                          strength.color.includes('orange') ? 'text-orange-600' : 'text-red-600'
                        }`}>{strength.label}</span>
                      </>
                    )}
                  </div>
                </div>

                <GlassButton
                  onClick={mode === 'signin' ? () => onLogin(email, password) : handleCreateAccount}
                  disabled={isLoading || isCreating}
                  className="w-full"
                >
                  {(isLoading || isCreating) ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    />
                  ) : (
                    mode === 'signin' ? 'Sign In' : 'Sign Up'
                  )}
                </GlassButton>

                {mode === 'signin' && (
                  <button
                    onClick={() => setMode('forgot')}
                    className="text-[13px] text-slate-400 hover:text-[#6366F1] transition-colors"
                  >
                    Forgot your password?
                  </button>
                )}

                <div className="flex items-center justify-center gap-2 text-[14px] font-normal text-slate-500">
                  <span>
                    {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}
                  </span>
                  <button
                    onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                    className="text-[#6366F1] font-semibold hover:underline"
                  >
                    {mode === 'signin' ? 'Create one' : 'Sign in'}
                  </button>
                </div>
              </>
            )}

            {/* Forgot Password */}
            {mode === 'forgot' && (
              <>
                <div className="flex flex-col gap-3">
                  <h1 className="text-[28px] md:text-[36px] font-[300] tracking-tight text-slate-900">
                    Forgot Password
                  </h1>
                  <p className="text-[14px] md:text-[16px] font-normal text-slate-500">
                    Enter your email to receive a password reset token.
                  </p>
                </div>

                <div className="flex flex-col gap-6">
                  <GlassInput
                    label="Email Address"
                    placeholder="alex@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {message && (
                  <p className="text-[13px] text-emerald-600 font-medium">{message}</p>
                )}

                <GlassButton
                  onClick={handleForgotPassword}
                  disabled={isSending}
                  className="w-full"
                >
                  {isSending ? 'Sending...' : 'Send Reset Token'}
                </GlassButton>

                <button
                  onClick={() => { setMode('signin'); setMessage(''); }}
                  className="text-[13px] text-[#6366F1] font-semibold hover:underline"
                >
                  Back to Sign In
                </button>
              </>
            )}

            {/* Reset Password */}
            {mode === 'reset' && (
              <>
                <div className="flex flex-col gap-3">
                  <h1 className="text-[28px] md:text-[36px] font-[300] tracking-tight text-slate-900">
                    Reset Password
                  </h1>
                  <p className="text-[14px] md:text-[16px] font-normal text-slate-500">
                    Enter the reset token and your new password.
                  </p>
                </div>

                <div className="flex flex-col gap-6">
                  <GlassInput
                    label="Reset Token"
                    placeholder="Paste your token here"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                  />
                  <div className="flex flex-col gap-3">
                    <GlassInput
                      label="New Password"
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    {newPassword.length > 0 && (
                      <>
                        <div className="h-[6px] w-full bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: strength.width }}
                            className={`h-full ${strength.color}`}
                          />
                        </div>
                        <span className={`text-[12px] font-semibold uppercase tracking-wider ${
                          strength.color.includes('emerald') ? 'text-emerald-600' :
                          strength.color.includes('lime') ? 'text-lime-600' :
                          strength.color.includes('yellow') ? 'text-yellow-600' :
                          strength.color.includes('orange') ? 'text-orange-600' : 'text-red-600'
                        }`}>{strength.label}</span>
                      </>
                    )}
                  </div>
                </div>

                {message && (
                  <p className="text-[13px] text-emerald-600 font-medium">{message}</p>
                )}

                <GlassButton
                  onClick={handleResetPassword}
                  disabled={isSending}
                  className="w-full"
                >
                  {isSending ? 'Resetting...' : 'Reset Password'}
                </GlassButton>

                <button
                  onClick={() => { setMode('signin'); setMessage(''); setResetToken(''); }}
                  className="text-[13px] text-[#6366F1] font-semibold hover:underline"
                >
                  Back to Sign In
                </button>
              </>
            )}
          </GlassCard>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
