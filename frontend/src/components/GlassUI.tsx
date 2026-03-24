import React from 'react';
import { motion } from 'motion/react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  elevation?: 'low' | 'high';
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', elevation = 'low' }) => {
  const blur = elevation === 'high' ? 'backdrop-blur-[32px]' : 'backdrop-blur-[24px]';
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`bg-white/10 border-2 border-[#CBD5E1] rounded-[16px] ${blur} ${className}`}
    >
      {children}
    </motion.div>
  );
};

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  children: React.ReactNode;
}

export const GlassButton: React.FC<GlassButtonProps> = ({ variant = 'primary', children, className = '', ...props }) => {
  const variants = {
    primary: 'bg-[#6366F1]/90 text-white border-transparent',
    outline: 'bg-transparent border-[#6366F1] text-[#6366F1]',
    ghost: 'bg-transparent border-transparent text-slate-700 hover:bg-slate-100/50',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, translateY: -1 }}
      whileTap={{ scale: 0.97 }}
      className={`h-[44px] px-8 rounded-[10px] text-[15px] font-[500] transition-all duration-200 border flex items-center justify-center gap-2 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const GlassInput: React.FC<GlassInputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <label className="text-[14px] text-slate-600 font-medium tracking-wide">{label}</label>}
      <input
        className={`h-[48px] px-5 rounded-[10px] bg-white/10 border border-[#E2E8F0] focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none transition-all duration-200 text-[16px] font-normal placeholder:text-slate-400 ${className}`}
        {...props}
      />
    </div>
  );
};

export const GlassChip: React.FC<{ label: string; onRemove?: () => void }> = ({ label, onRemove }) => {
  return (
    <div className="h-[36px] px-4 rounded-full bg-[#6366F1]/15 border border-[#6366F1]/30 text-[#6366F1] text-[13px] font-medium flex items-center gap-2">
      {label}
      {onRemove && (
        <button onClick={onRemove} className="hover:text-indigo-800 transition-colors text-[16px]">
          ×
        </button>
      )}
    </div>
  );
};
