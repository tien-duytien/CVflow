import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard, GlassButton, GlassInput } from '../../components/GlassUI';
import { apiRegister } from '../../api';

interface AuthViewProps {
  onLogin: (email: string, password: string) => void;
  isLoading: boolean;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLogin, isLoading }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [isCreating, setIsCreating] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'seeker' | 'employer'>('seeker');

  const handleCreateAccount = async () => {
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
          <GlassCard className="w-[480px] p-12 flex flex-col gap-8" elevation="high">
            <div className="flex flex-col gap-3">
              <h1 className="text-[36px] font-[300] tracking-tight text-slate-900">
                {mode === 'signin' ? 'Welcome back' : 'Create Account'}
              </h1>
              <p className="text-[16px] font-normal text-slate-500">
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
                <div className="h-[6px] w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '70%' }}
                    className="h-full bg-emerald-500"
                  />
                </div>
                <span className="text-[12px] text-emerald-600 font-semibold uppercase tracking-wider">Strong Password</span>
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
          </GlassCard>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
