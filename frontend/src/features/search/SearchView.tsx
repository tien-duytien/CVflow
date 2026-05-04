import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { GlassCard, GlassButton } from '../../components/GlassUI';

export const SearchView: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl mx-auto flex flex-col gap-12"
    >
      <div className="flex flex-col gap-10 items-center text-center">
        <h2 className="text-[56px] font-[300] tracking-tight text-slate-900">Find your next talent.</h2>
        <div className="w-full max-w-3xl relative">
          <input
            type="text"
            placeholder="Search by name, skills, or location..."
            className="w-full h-[72px] px-10 rounded-full glass border-[#E2E8F0] focus:border-[#6366F1] focus:ring-4 focus:ring-[#6366F1]/10 outline-none transition-all duration-300 text-[20px] font-normal shadow-xl"
          />
          <div className="absolute right-5 top-3.5">
            <GlassButton className="h-[44px] rounded-full px-10">Search</GlassButton>
          </div>
        </div>

        <div className="flex gap-4 flex-wrap justify-center">
          {['Remote', 'Full-time', 'Senior', 'React', 'Design'].map((tag) => (
            <div
              key={tag}
              className="px-6 py-2 rounded-full bg-white border border-slate-200 text-[14px] font-medium text-slate-600 hover:border-[#6366F1] hover:text-[#6366F1] cursor-pointer transition-all shadow-sm"
            >
              {tag}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <GlassCard key={i} className="p-6 flex flex-col gap-6 group hover:translate-y-[-4px] transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden">
                <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" referrerPolicy="no-referrer" />
              </div>
              <div className="flex flex-col">
                <span className="text-[18px] font-semibold text-slate-900">Jordan Smith</span>
                <span className="text-[14px] font-normal text-slate-500">Senior Product Designer</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {['Figma', 'React', 'UI/UX'].map((skill) => (
                <span key={skill} className="text-[11px] px-3 py-1 rounded-md bg-slate-100 text-slate-600 uppercase tracking-wider font-bold">
                  {skill}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-5 border-t border-slate-100">
              <span className="text-[14px] font-normal text-slate-500">San Francisco, CA</span>
              <button className="text-[#6366F1] text-[14px] font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                View Profile <ChevronRight size={16} />
              </button>
            </div>
          </GlassCard>
        ))}
      </div>
    </motion.div>
  );
};
