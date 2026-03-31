import { AnimatePresence, motion } from 'motion/react';
import { GlassCard } from '../GlassUI';
import { DashboardView } from '../../features/dashboard/DashboardView';
import { CVData } from '../../types';

interface CvProfileModalProps {
  cv: CVData | null;
  onClose: () => void;
  cardClassName?: string;
}

export const CvProfileModal: React.FC<CvProfileModalProps> = ({
  cv,
  onClose,
  cardClassName = 'bg-slate-50',
}) => {
  return (
    <AnimatePresence>
      {cv && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-slate-900/10 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -10 }}
            className="relative max-w-5xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
          >
            <GlassCard className={`p-6 ${cardClassName} shadow-2xl`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-[18px] font-semibold text-slate-900">
                  Candidate profile
                </h3>
                <button
                  onClick={onClose}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="border-t border-slate-200 pt-6">
                <DashboardView role="seeker" data={cv} />
              </div>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
