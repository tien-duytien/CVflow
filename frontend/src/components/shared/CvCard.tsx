import { ChevronRight } from 'lucide-react';
import { GlassCard } from '../GlassUI';

interface CvCardProps {
  fullName: string;
  title: string;
  location: string;
  skills: string[];
  avatarSeed: string;
  onViewProfile: () => void;
}

export const CvCard: React.FC<CvCardProps> = ({
  fullName,
  title,
  location,
  skills,
  avatarSeed,
  onViewProfile,
}) => {
  return (
    <GlassCard className="p-6 flex flex-col gap-6 group hover:translate-y-[-4px] transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 overflow-hidden">
          <img
            src={`https://picsum.photos/seed/${encodeURIComponent(avatarSeed)}/100/100`}
            alt="Avatar"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-[18px] font-semibold text-slate-900">{fullName}</span>
          <span className="text-[14px] font-normal text-slate-500">{title}</span>
        </div>
      </div>

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="text-[11px] px-3 py-1 rounded-md bg-slate-100 text-slate-600 uppercase tracking-wider font-bold"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pt-5 border-t border-slate-100">
        <span className="text-[14px] font-normal text-slate-500">{location}</span>
        <button
          onClick={onViewProfile}
          className="text-[#6366F1] text-[14px] font-semibold flex items-center gap-1 group-hover:gap-2 transition-all"
        >
          View Profile <ChevronRight size={16} />
        </button>
      </div>
    </GlassCard>
  );
};
